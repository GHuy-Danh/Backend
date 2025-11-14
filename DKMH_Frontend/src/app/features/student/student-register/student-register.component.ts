import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { SubjectService } from '../../../core/services/subject.service';
import { DangKyService } from '../../../core/services/dang-ky.service';
import { HocKyService } from '../../../core/services/hoc-ky.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-student-register',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './student-register.component.html',
  styleUrls: ['./student-register.component.css'],
})
export class StudentRegisterComponent implements OnInit {
  
  ma_sv = '';   // Lấy từ AuthService

  hocKyList: any[] = [];
  selectedHocKy: any = null;

  electives: any[] = [];       // Môn load từ mon_hoc
  pendingCourses: any[] = [];  // Đang chờ xác nhận
  completedCourses: any[] = []; // Hoàn tất đăng ký (sau phân lớp)

  registrationCountMap: Record<string, number> = {};

  message = '';
  loading = true;
  creditLimit = 24;

  constructor(
    private subjectService: SubjectService,
    private dangKyService: DangKyService,
    private hocKyService: HocKyService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.ma_sv = this.authService.getUserMaSV() ?? '';
    this.loadHocKy();
  }

  loadHocKy() {
    this.hocKyService.getAll().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res.data) ? res.data : res;
        this.hocKyList = data.sort((a: any, b: any) => b.ma_hoc_ky - a.ma_hoc_ky);

        if (this.hocKyList.length > 0) {
          this.selectedHocKy = this.hocKyList[0];
          this.loadAllForHocKy();
        }

        this.cdr.detectChanges();
      },
      error: () => {
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

    const maHocKy = Number(this.selectedHocKy.ma_hoc_ky);

    // Bước 1: Load MÔN HỌC theo học kỳ
    this.subjectService.getAllSubjects().subscribe({
      next: (res: any) => {
        const subjects = Array.isArray(res.data) ? res.data : res;

        this.electives = subjects
          .filter((s: any) => Number(s.hoc_ky) === maHocKy)
          .map((s: any) => ({
            ma_hoc_phan: s.ma_hoc_phan,
            ten_hoc_phan: s.ten_hoc_phan,
            tin_chi: s.so_tin_chi,
            hoc_ky: s.hoc_ky,
            dieu_kien: [...(s.hoc_truoc || []), ...(s.tien_quyet || [])],
            si_so_toi_da: 30,
            si_so_toi_thieu: 10,
            si_so_hien_tai: 0,
            raw: s,
          }));

        // Bước 2: Đếm sĩ số từ collection dang_ky
        this.dangKyService.getByHocKy(maHocKy).subscribe({
          next: (resDK: any) => {
            const regs = Array.isArray(resDK.data) ? resDK.data : resDK;

            this.registrationCountMap = {};
            for (let dk of regs) {
              if (dk.ma_hoc_phan) {
                this.registrationCountMap[dk.ma_hoc_phan] =
                  (this.registrationCountMap[dk.ma_hoc_phan] || 0) + 1;
              }
            }

            this.electives.forEach(m => {
              m.si_so_hien_tai = this.registrationCountMap[m.ma_hoc_phan] || 0;
            });

            this.loadStudentRegistrations(maHocKy);
          }
        });
      }
    });
  }

  loadStudentRegistrations(maHocKy: number) {
    this.dangKyService.getBySinhVien(this.ma_sv).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res.data) ? res.data : res;

        this.pendingCourses = data.filter(
          (d: any) =>
            d.hoc_ky === maHocKy && d.trang_thai?.tinh_trang === 'Đang chờ xử lý'
        );

        this.completedCourses = data.filter(
          (d: any) =>
            d.hoc_ky === maHocKy && d.trang_thai?.tinh_trang === 'Hoàn tất đăng ký'
        );

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.pendingCourses = [];
        this.completedCourses = [];
        this.loading = false;
      },
    });
  }

  canRegister(mon: any): { ok: boolean; reason?: string } {
    if (this.pendingCourses.some(x => x.ma_hoc_phan === mon.ma_hoc_phan))
      return { ok: false, reason: 'Đang chờ xác nhận' };

    if (this.completedCourses.some(x => x.ma_hoc_phan === mon.ma_hoc_phan))
      return { ok: false, reason: 'Đã hoàn tất' };

    return { ok: true };
  }

  register(mon: any) {
    if (!confirm(`Xác nhận đăng ký môn ${mon.ten_hoc_phan}?`)) return;

    const ma_lop_hp = `LHP_${mon.ma_hoc_phan}`;
    const id = `${this.ma_sv}_${ma_lop_hp}`;

    const payload = {
      _id: id,
      ma_sv: this.ma_sv,
      ma_lop_hp,
      hoc_ky: Number(this.selectedHocKy.ma_hoc_ky),
      trang_thai: {
        tinh_trang: 'Đang chờ xử lý',
        chi_tiet: 'Lớp học phần sẽ được xem xét sau khi kết thúc đăng ký',
      },
      thoi_gian_dang_ky: new Date(),
      dang_ky_tu_do: true,
      ma_hoc_phan: mon.ma_hoc_phan,
      ten_hoc_phan: mon.ten_hoc_phan,
      si_so_hien_tai: mon.si_so_hien_tai + 1
    };

    this.dangKyService.createRegistration(payload).subscribe({
      next: () => {
        this.message = 'Đăng ký thành công.';
        this.loadAllForHocKy();
      },
      error: (err) => {
        this.message = err.error?.message || 'Lỗi đăng ký.';
      }
    });
  }

  cancel(dk: any) {
    if (!confirm('Bạn có chắc muốn hủy?')) return;

    this.dangKyService.deleteRegistration(dk._id).subscribe({
      next: () => {
        this.message = 'Đã hủy đăng ký.';
        this.loadAllForHocKy();
      },
      error: () => {
        this.message = 'Không thể hủy.';
      }
    });
  }

  getCurrentCredits(): number {
    return this.completedCourses.reduce((t, c) => t + (c.tin_chi || 0), 0);
  }
}
