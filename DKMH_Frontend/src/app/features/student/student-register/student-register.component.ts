import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { SubjectService } from '../../../core/services/subject.service';
import { DangKyService } from '../../../core/services/dang-ky.service';
import { HocKyService } from '../../../core/services/hoc-ky.service';
import { AuthService } from '../../../core/services/auth.service';
import { LopHocPhanService } from '../../../core/services/lop-hoc-phan.service';
@Component({
  selector: 'app-student-register',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, DatePipe],
  templateUrl: './student-register.component.html',
  styleUrls: ['./student-register.component.css'],
})
export class StudentRegisterComponent implements OnInit {
  ma_sv = ''; // lấy từ AuthService

  hocKyList: any[] = [];
  selectedHocKy: any = null;

  electives: any[] = []; // môn load từ mon_hoc cho bảng 1
  pendingCourses: any[] = []; // dang_ky đang chờ xác nhận (bảng 2)
  completedCourses: any[] = []; // đã hoàn tất (bảng 3)
  allCompletedCodes: string[] = [];
  registrationCountMap: Record<string, number> = {};

  message = '';
  loading = true;
  creditLimit = 12;

  isDetailModalOpen = false;
  selectedClassDetails: any = null;

  constructor(
    private subjectService: SubjectService,
    private dangKyService: DangKyService,
    private hocKyService: HocKyService,
    private authService: AuthService,
    private lhpService: LopHocPhanService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.ma_sv = this.authService.getUserMaSV() ?? '';
    this.loadHocKy();
  }

  private parseArrayFromRes(res: any): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.data)) return res.data.data;
    // fallback: if res is object with data as object map, try values
    if (res.data && typeof res.data === 'object') return Object.values(res.data);
    return [];
  }

  loadHocKy() {
    this.hocKyService.getAll().subscribe({
      next: (res: any) => {
        const data = this.parseArrayFromRes(res);
        // sort giảm dần ma_hoc_ky nếu numeric
        this.hocKyList = data.sort((a: any, b: any) => {
          const A = Number(a.ma_hoc_ky ?? a._id ?? a);
          const B = Number(b.ma_hoc_ky ?? b._id ?? b);
          return B - A;
        });
        if (this.hocKyList.length > 0) {
          this.selectedHocKy = this.hocKyList[0];
          this.loadAllForHocKy();
        } else {
          this.loading = false;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi tải danh sách học kỳ', err);
        this.message = 'Không tải được danh sách học kỳ.';
        this.loading = false;
      },
    });
  }

  onHocKyChange() {
    this.loadAllForHocKy();
  }

  loadAllForHocKy() {
    if (!this.selectedHocKy) return;
    this.loading = true;
    const maHocKy = Number(this.selectedHocKy.ma_hoc_ky ?? this.selectedHocKy._id ?? this.selectedHocKy);

    // 1) Lấy tất cả môn -> lọc theo hoc_ky
    this.subjectService.getAllSubjects().subscribe({
      next: (resSub: any) => {
        const subjects = this.parseArrayFromRes(resSub);

        // Build electives with robust extraction of hoc_truoc/tien_quyet
        this.electives = subjects
          .filter((s: any) => Number(s.hoc_ky) === maHocKy)
          .map((s: any) => {

          const cleanArray = (val: any): string[] => {
            if (!val) return [];
            // Nếu là array
            if (Array.isArray(val)) {
              const arr = val.filter(
                (x: any): x is string => typeof x === "string" && x.trim() !== ""
              );
              return arr.map(x => x.trim());
            }
            // Nếu là object { 0: "ABC", 1: "XYZ" }
            if (typeof val === "object") {
              const arr = Object.values(val).filter(
                (x: any): x is string => typeof x === "string" && x.trim() !== ""
              );
              return arr.map(x => x.trim());
            }
            return [];
          };

          // ép lấy đúng dữ liệu
          const hoc_truoc = cleanArray(s.hoc_truoc ?? s?.dieu_kien?.hoc_truoc);
          const tien_quyet = cleanArray(s.tien_quyet ?? s?.dieu_kien?.tien_quyet);

          const dieu_kien = [...hoc_truoc, ...tien_quyet];

          return {
            ma_hoc_phan: s.ma_hoc_phan,
            ten_hoc_phan: s.ten_hoc_phan,
            tin_chi: s.so_tin_chi ?? s.tin_chi ?? 0,
            hoc_ky: s.hoc_ky,
            hoc_truoc,
            tien_quyet,
            dieu_kien,
            si_so_toi_da: s.si_so_toi_da ?? 10,
            si_so_toi_thieu: s.si_so_toi_thieu ?? 7,
            si_so_hien_tai: 0,
            raw: s,
          };
        });

        // 2) Lấy tất cả dang_ky của học kỳ để đếm sĩ số hiện tại
        this.dangKyService.getByHocKy(maHocKy).subscribe({
          next: (resDK: any) => {
            const regs = this.parseArrayFromRes(resDK);
            this.registrationCountMap = {};
            for (const dk of regs) {
              if (!dk.ma_hoc_phan) continue;
              this.registrationCountMap[dk.ma_hoc_phan] = (this.registrationCountMap[dk.ma_hoc_phan] || 0) + 1;
            }
            // apply counts
            this.electives.forEach(m => {
              m.si_so_hien_tai = this.registrationCountMap[m.ma_hoc_phan] || 0;
            });

            // 3) load pending/completed của sinh viên
            this.loadStudentRegistrations(maHocKy);
          },
          error: (err) => {
            console.error('Lỗi tải đăng ký theo học kỳ', err);
            // apply zeros and still load student registrations
            this.electives.forEach(m => (m.si_so_hien_tai = m.si_so_hien_tai || 0));
            this.loadStudentRegistrations(maHocKy);
          }
        });
      },
      error: (err) => {
        console.error('Lỗi tải môn học', err);
        this.message = 'Không tải được danh sách môn học.';
        this.loading = false;
      }
    });
  }

  private loadStudentRegistrations(maHocKy: number) {
    // lấy tất cả đăng ký của sinh viên
    this.dangKyService.getBySinhVien(this.ma_sv).subscribe({
      next: (res: any) => {
        const all = this.parseArrayFromRes(res);
        // filter theo học kỳ
        const arr = all.filter((d: any) => Number(d.hoc_ky) === Number(maHocKy));

        this.pendingCourses = arr.filter(d => d.trang_thai?.tinh_trang === 'Đang chờ xử lý' || d.trang_thai?.tinh_trang === 'Chờ xác nhận');
        this.completedCourses = arr.filter(d => d.trang_thai?.tinh_trang === 'Đăng ký thành công');
        
        this.allCompletedCodes = all
            .filter(d => d.trang_thai?.tinh_trang === 'Đăng ký thành công' || d.trang_thai?.tinh_trang === 'Hoàn thành')
            .map(d => d.ma_hoc_phan);

        this.pendingCourses = this.pendingCourses.map(dk => {
          const mon = this.electives.find(m => m.ma_hoc_phan === dk.ma_hoc_phan);
          return {
            ...dk,
            tin_chi: dk.tin_chi || dk.so_tin_chi || mon?.tin_chi || 0
          };
        });

        this.completedCourses = this.completedCourses.map(dk => {
          const mon = this.electives.find(m => m.ma_hoc_phan === dk.ma_hoc_phan);
          return {
            ...dk,
            tin_chi: dk.tin_chi || mon?.tin_chi || 0
          };
        });

        // ensure si_so_hien_tai sync
        for (const m of this.electives) {
          m.si_so_hien_tai = this.registrationCountMap[m.ma_hoc_phan] || 0;
        }

        // Ẩn khỏi bảng 1 những môn đã pending hoặc completed
        const registeredCodes = [
            ...this.pendingCourses.map(x => x.ma_hoc_phan),
            ...this.completedCourses.map(x => x.ma_hoc_phan)
        ];
        this.electives = this.electives.filter(
            m => !registeredCodes.includes(m.ma_hoc_phan)
        );

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi tải đăng ký của sv', err);
        this.pendingCourses = [];
        this.completedCourses = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Hàm kiểm tra giới hạn tín chỉ
  checkCreditLimit(newCredits: number): boolean {
    const currentCredits = this.getCurrentCredits();
    if (currentCredits + newCredits > this.creditLimit) {
        return false;
    }
    return true;
  }

  canRegister(mon: any): { ok: boolean; reason?: string } {
    if (!mon) return { ok: false, reason: 'Dữ liệu môn không hợp lệ' };

    if (this.pendingCourses.some(x => x.ma_hoc_phan === mon.ma_hoc_phan)) {
      return { ok: false, reason: 'Đang chờ xác nhận' };
    }

    if (this.completedCourses.some(x => x.ma_hoc_phan === mon.ma_hoc_phan)) {
      return { ok: false, reason: 'Đã hoàn tất' };
    }

    // ⚠️ Kiểm tra tín chỉ
    if (!this.checkCreditLimit(mon.tin_chi)) {
        return { ok: false, reason: `Vượt quá giới hạn ${this.creditLimit} tín chỉ.` };
    }

    // ⚠️ SỬA VẤN ĐỀ 1: RÀNG BUỘC MÔN GIÁO DỤC THỂ CHẤT (GDTC)
    if (mon.ten_hoc_phan && mon.ten_hoc_phan.toLowerCase().includes('giáo dục thể chất')) {
        // Kiểm tra trong danh sách đã đăng ký (pending + completed) của HỌC KỲ NÀY
        const hasGDTC = [...this.pendingCourses, ...this.completedCourses].some(dk => 
            dk.ten_hoc_phan && dk.ten_hoc_phan.toLowerCase().includes('giáo dục thể chất')
        );
        
        if (hasGDTC) {
            return { ok: false, reason: 'Chỉ được đăng ký 1 môn Giáo dục thể chất trong học kỳ.' };
        }
    }

    // ⚠️ SỬA VẤN ĐỀ 2: KIỂM TRA ĐIỀU KIỆN TIÊN QUYẾT (MỞ RỘNG)
    const required = Array.isArray(mon.dieu_kien) ? mon.dieu_kien : [];
    if (required.length > 0) {
      // Kiểm tra trong danh sách toàn khóa (allCompletedCodes) thay vì chỉ completedCourses của học kỳ này
      const missing = required.filter((code: string) => !this.allCompletedCodes.includes(code));
      if (missing.length > 0) {
        return { ok: false, reason: `Thiếu điều kiện: ${missing.join(', ')}` };
      }
    }
    return { ok: true };
  }


  register(mon: any) {
    // kiểm tra lại client-side
    const check = this.canRegister(mon);
    if (!check.ok) {
      this.message = check.reason || 'Không thể đăng ký';
      alert(this.message);
      return;
    }

    if (!confirm(`Xác nhận đăng ký môn "${mon.ten_hoc_phan}" (${mon.ma_hoc_phan})?`)) return;

    const ma_lop_hp = `LHP_${mon.ma_hoc_phan}`;
    const id = `${this.ma_sv}_${ma_lop_hp}`;
    const hocKyVal = Number(this.selectedHocKy.ma_hoc_ky ?? this.selectedHocKy._id ?? this.selectedHocKy);

    const payload: any = {
      _id: id,
      ma_sv: this.ma_sv,
      ma_lop_hp,
      hoc_ky: hocKyVal,
      trang_thai: {
        tinh_trang: 'Đang chờ xử lý',
        chi_tiet: 'Lớp học phần sẽ được xem xét sau khi kết thúc đăng ký'
      },
      thoi_gian_dang_ky: new Date().toISOString(),
      dang_ky_tu_do: true,
      ma_hoc_phan: mon.ma_hoc_phan,
      ten_hoc_phan: mon.ten_hoc_phan,
      // si_so_hien_tai backend sẽ tính lại nhưng ta cập nhật sơ bộ ở client
      si_so_hien_tai: (mon.si_so_hien_tai || 0) + 1
    };

    this.dangKyService.createRegistration(payload).subscribe({
      next: (res: any) => {
        this.message = res?.message || 'Đăng ký thành công, chờ phân lớp.';
        // cập nhật client: remove môn khỏi electives (bảng 1)
        this.electives = this.electives.filter((m: any) => m.ma_hoc_phan !== mon.ma_hoc_phan);
        // thêm vào pendingCourses (hiển thị ngay)
        const pendingItem = {
          ...payload,
          tin_chi: mon.tin_chi, 
          trang_thai: payload.trang_thai
        };
        this.pendingCourses = [pendingItem, ...this.pendingCourses];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi đăng ký', err);
        this.message = err.error?.message || 'Lỗi khi gửi đăng ký.';
        alert(this.message);
      }
    });
  }

  cancel(dk: any) {
    if (!dk || !dk._id) {
      this.message = 'Đăng ký không hợp lệ.';
      return;
    }

    if (!confirm('Bạn có chắc muốn hủy đăng ký này?')) return;

    this.dangKyService.deleteRegistration(dk._id).subscribe({
      next: () => {
        this.message = 'Đã hủy đăng ký.';

        // 1) XÓA KHỎI BẢNG 2 (pending)
        this.pendingCourses = this.pendingCourses.filter((p: any) => p._id !== dk._id);

        // 2) TÌM MÔN TƯƠNG ỨNG TRONG electives HOẶC subjects
        const monRaw = this.electives.find(m => m.ma_hoc_phan === dk.ma_hoc_phan)
            ?? this.subjectService.cachedSubjects?.find((s: any) => s.ma_hoc_phan === dk.ma_hoc_phan);

        // Trường hợp chưa có cache thì tìm trong raw của bảng 2
        const tin_chi = dk.tin_chi || 0;

        const restoredMon = monRaw
          ? {
              ...monRaw,
              tin_chi,
              si_so_hien_tai: (monRaw.si_so_hien_tai || 1) - 1
            }
          : {
              ma_hoc_phan: dk.ma_hoc_phan,
              ten_hoc_phan: dk.ten_hoc_phan,
              tin_chi,
              hoc_ky: dk.hoc_ky,
              dieu_kien: dk.dieu_kien || [],
              si_so_hien_tai: (this.registrationCountMap[dk.ma_hoc_phan] || 1) - 1,
              si_so_toi_da: 10,
              si_so_toi_thieu: 7
            };

        // 3) THÊM LẠI MÔN VÀO ELECTIVES (BẢNG 1)
        // nhưng tránh trùng
        if (!this.electives.some(m => m.ma_hoc_phan === dk.ma_hoc_phan)) {
          this.electives = [...this.electives, restoredMon];
        }

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Lỗi hủy', err);
        this.message = err.error?.message || 'Không thể hủy đăng ký.';
      }
    });
  }

  // // ==========================================
  // // LOGIC MODAL XEM CHI TIẾT LỚP HỌC
  // // ==========================================
  // openClassDetailModal(dk: any) {
  //   this.selectedClassDetails = {
  //       stt: 1,
  //       ma_lop_hp: dk.ma_lop_hp,
  //       ten_hoc_phan: dk.ten_hoc_phan,
  //       giang_vien: dk.ho_ten || dk.ma_gv || 'Đang cập nhật',
  //       phong: dk.phong || 'Đang cập nhật',
  //       thoi_gian: `${dk.thu || '?'} (Tiết ${dk.ca || '?'})`, // Cần logic format đẹp hơn nếu có ca_dau/ca_cuoi
  //       ngay_bat_dau: dk.ngay_bat_dau, // Cần backend trả về
  //       ngay_ket_thuc: dk.ngay_ket_thuc // Cần backend trả về
  //   };

  //   // Nếu backend chưa trả về ngày bắt đầu/kết thúc trong DangKy, 
  //   // bạn có thể gọi thêm API getLopHocPhanById ở đây để lấy chi tiết.
    
  //   this.isDetailModalOpen = true;
  // }

  // closeDetailModal() {
  //   this.isDetailModalOpen = false;
  //   this.selectedClassDetails = null;
  // }

  getCurrentCredits(): number {
    const pending = this.pendingCourses.reduce((t, c) => t + (c.so_tin_chi || c.tin_chi || 0), 0);
    const completed = this.completedCourses.reduce((t, c) => t + (c.so_tin_chi || c.tin_chi || 0), 0);
    return pending + completed;
  }
}
