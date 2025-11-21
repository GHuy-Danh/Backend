import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { LopHocPhanService } from '../../../core/services/lop-hoc-phan.service';
import { DangKyService } from '../../../core/services/dang-ky.service';

@Component({
  selector: 'app-admin-classes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-classes.component.html',
  styleUrls: ['./admin-classes.component.css']
})
export class AdminClassesComponent implements OnInit {

  // Học kỳ có sẵn (bạn có thể load động nếu cần)
  danhSachHocKy: number[] = [1,2,3,4,5,6,7,8];
  selectedHocKy: number | '' = '';

  // trạng thái load
  loading = false; // load lớp
  loadingRegistrations = false; // load danh sách đăng ký tổng hợp
  loadingStudents = false; // load danh sách sinh viên trong 1 lớp
  errorMessage: string | null = null;

  // tìm kiếm + filter LHP
  searchKey = '';
  filterTrangThai = 'Tất cả';

  // danh sách LHP
  listLHP: any[] = [];
  filteredList: any[] = [];
  paginatedList: any[] = [];
  currentPage = 1;
  pageSize = 12;
  totalPages = 1;

  // ===== Modal: detail LHP
  isDetailModalOpen = false;
  detailLHP: any = null;

  // ===== Modal: danh sách sinh viên trong 1 LHP
  isStudentModalOpen = false;
  detailLHPForStudents: any = null;
  danhSachSV: any[] = [];
  studentModalPage = 1;
  studentModalPageSize = 8;
  studentModalTotalPages = 1;

  // ===== Danh sách đăng ký theo học kỳ (bảng trên)
  dangKyTheoHK: any[] = [];
  loadingDangKyTheoHK = false;

  // ===== Modal: danh sách đăng ký theo môn (khi click "Xem danh sách SV")
  isDangKyModalOpen = false;
  dangKyMonSelected: any = null;
  dsDangKyMon: any[] = []; // full data for modal
  dsDangKyModalPage = 1;
  dsDangKyModalPageSize = 8;
  dsDangKyModalTotalPages = 1;
  dsDangKyModalSlice: any[] = []; // data for current page
  // flags
  previewLoading = false;
  applyingAssign = false;

  isSiSoModalOpen = false;
  selectedMonForSiSo: any = null;
  siSoForm = { si_so_toi_da: 10, si_so_toi_thieu: 7 };
  siSoSaving = false;

  constructor(
    private lhpService: LopHocPhanService,
    private dangKyService: DangKyService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // không tự load LHP khi chưa chọn học kỳ
  }

  // Khi chọn học kỳ hoặc chuyển đổi -> load lại cả 2 bảng
  onHocKyChange() {
    this.loadAllData();
  }

  // =========================
  // Load both: tổng hợp đăng ký (trên) -> rồi load LHP (dưới)
  // đảm bảo thứ tự hiển thị đúng và ngăn lỗi "đang tải mãi"
  // =========================
  loadAllData() {
    if (!this.selectedHocKy && this.selectedHocKy !== 0) {
      // reset
      this.listLHP = [];
      this.dangKyTheoHK = [];
      this.filteredList = [];
      this.paginatedList = [];
      this.cdr.detectChanges();
      return;
    }

    // load đăng ký tổng hợp trước (để bảng trên hiện ngay)
    this.loadDangKyTheoHK(() => {
      // after done, load classes
      this.loadLHP();
    });
  }

  // =========================
  // Load tổng hợp đăng ký theo hoc ky
  // =========================
  loadDangKyTheoHK(cb?: () => void) {
    this.loadingDangKyTheoHK = true;
    this.dangKyTheoHK = [];
    this.lhpService.getRegistrationSummary(Number(this.selectedHocKy)).subscribe({
      next: (res: any) => {
        // backend có thể trả { success, data } hoặc trực tiếp mảng
        const arr = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : (res || []).data || res);
        // normalise fields: many backend trả { ma_hoc_phan, ten_hoc_phan, count }
        this.dangKyTheoHK = (arr || []).map((r: any) => ({
          ma_hoc_phan: r.ma_hoc_phan || r._id,
          ten_hoc_phan: r.ten_hoc_phan || r.ten || '-',
          so_luong: (r.count ?? r.so_luong ?? r.counts ?? 0),
          si_so_toi_da: r.si_so_toi_da, 
          si_so_toi_thieu: r.si_so_toi_thieu
        }));
        this.loadingDangKyTheoHK = false;
        this.cdr.detectChanges();
        if (cb) cb();
      },
      error: (err) => {
        console.error('Lỗi loadDangKyTheoHK', err);
        this.dangKyTheoHK = [];
        this.loadingDangKyTheoHK = false;
        this.cdr.detectChanges();
        if (cb) cb();
      }
    });
  }

  // =========================
  // Load LHP (lấy tất cả rồi lọc theo học kỳ client-side)
  // =========================
  loadLHP() {
    this.loading = true;
    this.errorMessage = null;
    this.listLHP = [];
    this.filteredList = [];
    this.paginatedList = [];

    this.lhpService.getAll().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : (res.data || res));
        // normalize: ensure fields used in template exist
        const hk = Number(this.selectedHocKy);
        this.listLHP = (data || []).filter((x: any) => Number(x.hoc_ky) === hk)
          .map((x: any) => ({
            ...x,
            giang_vien: x.ma_gv || x.giang_vien || x.ma_giang_vien || '-',
            trang_thai: x.trang_thai || (x.si_so_hien_tai ? 'Đã phân' : 'Chưa phân'),
            ca: x.ca_dau ? `${x.ca_dau} - ${x.ca_cuoi}` : (x.ca || '-')
          }));

        // apply search/filter + pagination
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi loadLHP', err);
        this.errorMessage = 'Lỗi tải LHP: ' + (err.error?.message || err.message || '');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // =========================
  // Filter + pagination for LHP list
  // =========================
  applyFilter() {
    const key = (this.searchKey || '').trim().toLowerCase();
    this.filteredList = this.listLHP.filter(row => {
      const matchSearch =
        (String(row.ma_lop_hp || '')).toLowerCase().includes(key) ||
        (String(row.ten_hoc_phan || '')).toLowerCase().includes(key) ||
        (String(row.giang_vien || '')).toLowerCase().includes(key) ||
        (String(row.phong || '')).toLowerCase().includes(key);
      const matchStatus = (this.filterTrangThai === 'Tất cả') ? true : (row.trang_thai === this.filterTrangThai);
      return matchSearch && matchStatus;
    });
    this.currentPage = 1;
    this.updatePagination();
    this.cdr.detectChanges();
  }

  updatePagination() {
    this.totalPages = Math.max(1, Math.ceil(this.filteredList.length / this.pageSize));
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedList = this.filteredList.slice(start, end);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  // =========================
  // Preview phân lớp (gọi preview endpoint)
  // - dùng direct HTTP fallback nếu service không tương thích param
  // =========================
  previewAssign() {
    if (!this.selectedHocKy && this.selectedHocKy !== 0) return alert('Vui lòng chọn học kỳ!');
    this.previewLoading = true;

    // try service method first (may call ?persist=false)
    this.lhpService.autoAssignPreview().subscribe({
      next: (res: any) => {
        const arr = Array.isArray(res.data) ? res.data : (res && res.data) ? res.data : (Array.isArray(res) ? res : res);
        // show preview: we'll simply open a modal showing arr
        // reuse detail modal: but simply alert for now then reload LHP preview -> but better is to show result inside page
        // For simplicity we reload LHP (the backend preview might not persist, but preview probably returned data)
        if (arr && arr.length) {
          // show quick preview modal using browser alert + also refresh list (non-persist)
          alert('Xem trước phân lớp trả về ' + arr.length + ' lớp. (Xem bảng Kết quả sẽ hiện sau khi phân lớp thực sự được lưu)');
        } else {
          // fallback to direct http call to ensure preview param name 'preview'
          this.http.post('/api/lop-hoc-phan/auto-assign?preview=1', {}).subscribe({
            next: (_r:any) => {
              alert('Xem trước phân lớp (fallback) đã thực hiện. Kiểm tra Console/Database để xem kết quả preview.');
            },
            error: (e) => {
              console.error('preview fallback error', e);
              alert('Không thể lấy preview phân lớp. Xem console.');
            }
          });
        }
        this.previewLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        // fallback: call endpoint with ?preview=1 directly
        console.warn('Preview via service failed, trying direct endpoint...', err);
        this.http.post('/api/lop-hoc-phan/auto-assign?preview=1', {}).subscribe({
          next: (_r: any) => {
            alert('Xem trước phân lớp (fallback) đã thực hiện. Kiểm tra bảng kết quả.');
          },
          error: (e) => {
            console.error('Preview fallback failed', e);
            alert('Lỗi khi lấy preview phân lớp. Xem console.');
          },
          complete: () => {
            this.previewLoading = false;
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  // =========================
  // Áp dụng phân lớp (persist)
  // =========================
  applyAssign() {
    if (!this.selectedHocKy && this.selectedHocKy !== 0) return alert('Vui lòng chọn học kỳ!');
    if (!confirm('Bạn có chắc muốn chạy phân lớp và lưu vào hệ thống?')) return;
    this.applyingAssign = true;
    // use service apply method (which calls ?persist=true or similar)
    this.lhpService.autoAssignApply().subscribe({
      next: (res:any) => {
        alert(res?.message || 'Phân lớp thành công. Làm mới danh sách.');
        this.loadAllData();
        this.applyingAssign = false;
      },
      error: (err) => {
        console.error('applyAssign error', err);
        alert('Lỗi khi áp dụng phân lớp. Xem console.');
        this.applyingAssign = false;
      }
    });
  }

  // =========================
  // Modal chi tiết lớp
  // =========================
  openDetailModal(row: any) {
    this.detailLHP = row;
    this.isDetailModalOpen = true;
    this.cdr.detectChanges();
  }
  closeDetailModal() {
    this.isDetailModalOpen = false;
    this.detailLHP = null;
  }

  // =========================
  // Modal danh sách SV của 1 LHP
  // =========================
  openStudentModal(row: any) {
    this.isStudentModalOpen = true;
    this.detailLHPForStudents = row;
    this.danhSachSV = [];
    this.studentModalPage = 1;
    this.studentModalTotalPages = 1;
    this.loadingStudents = true;
    this.cdr.detectChanges();

    // try endpoint: /api/dang-ky?ma_lop_hp=...
    const q = encodeURIComponent(row.ma_lop_hp);
    this.http.get<any>(`/api/dang-ky?ma_lop_hp=${q}`).subscribe({
      next: (res:any) => {
        const arr = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : (res.data || res));
        const mapped = (arr || []).map((r:any, i:number) => ({
          stt: i+1,
          ma_sv: r.ma_sv,
          ho_ten: r.ho_ten || r.ten_sv || '-',
          thoi_gian_dang_ky: r.thoi_gian_dang_ky ? new Date(r.thoi_gian_dang_ky).toLocaleString() : '-',
          raw: r
        }));
        this.danhSachSV = mapped;
        // pagination for students in modal
        this.studentModalTotalPages = Math.max(1, Math.ceil(this.danhSachSV.length / this.studentModalPageSize));
        this.updateStudentModalSlice();
        this.loadingStudents = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('openStudentModal error', err);
        this.danhSachSV = [];
        this.loadingStudents = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateStudentModalSlice() {
    const start = (this.studentModalPage - 1) * this.studentModalPageSize;
    const end = start + this.studentModalPageSize;
    // do not mutate original array
    // for display we will use slice in template via danhSachSVSlice()
    this.cdr.detectChanges();
  }

  studentChangePage(p: number) {
    if (p < 1 || p > this.studentModalTotalPages) return;
    this.studentModalPage = p;
    this.updateStudentModalSlice();
  }

  closeStudentModal() {
    this.isStudentModalOpen = false;
    this.detailLHPForStudents = null;
    this.danhSachSV = [];
  }

  // =========================
  // Modal: xem DS đăng ký theo môn (với phân trang)
  // =========================
  openDangKyModal(mon: any) {
    this.isDangKyModalOpen = true;
    this.dangKyMonSelected = mon;
    this.dsDangKyMon = [];
    this.dsDangKyModalPage = 1;
    this.dsDangKyModalSlice = [];
    this.dsDangKyModalTotalPages = 1;

    // call service
    this.lhpService.getRegistrationsBySubject(mon.ma_hoc_phan, Number(this.selectedHocKy) || undefined).subscribe({
      next: (res:any) => {
        const arr = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : (res.data || res));
        const mapped = (arr || []).map((r:any, i:number) => ({
          stt: i+1,
          ma_sv: r.ma_sv,
          ho_ten: r.ho_ten || '-',
          thoi_gian_dang_ky: r.thoi_gian_dang_ky ? new Date(r.thoi_gian_dang_ky).toLocaleString() : '-',
          raw: r
        }));
        this.dsDangKyMon = mapped;
        this.dsDangKyModalTotalPages = Math.max(1, Math.ceil(this.dsDangKyMon.length / this.dsDangKyModalPageSize));
        this.updateDsDangKyModalSlice();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('openDangKyModal error', err);
        this.dsDangKyMon = [];
        this.dsDangKyModalSlice = [];
        this.dsDangKyModalTotalPages = 1;
        this.cdr.detectChanges();
      }
    });
  }

  updateDsDangKyModalSlice() {
    const start = (this.dsDangKyModalPage - 1) * this.dsDangKyModalPageSize;
    this.dsDangKyModalSlice = this.dsDangKyMon.slice(start, start + this.dsDangKyModalPageSize);
    this.cdr.detectChanges();
  }

  dsDangKyModalChangePage(p: number) {
    if (p < 1 || p > this.dsDangKyModalTotalPages) return;
    this.dsDangKyModalPage = p;
    this.updateDsDangKyModalSlice();
  }

  closeDangKyModal() {
    this.isDangKyModalOpen = false;
    this.dangKyMonSelected = null;
    this.dsDangKyMon = [];
    this.dsDangKyModalSlice = [];
  }

  // helper to get students slice for student modal (for template)
  get danhSachSVSlice() {
    const start = (this.studentModalPage - 1) * this.studentModalPageSize;
    return this.danhSachSV.slice(start, start + this.studentModalPageSize);
  }

  openSiSoModal(mon: any) {
    this.selectedMonForSiSo = mon;
    // Dùng giá trị 'mon' có (nếu đã lưu) hoặc dùng default 10/7
    this.siSoForm = {
      si_so_toi_da: mon.si_so_toi_da || 10, // Default 10 như bạn yêu cầu
      si_so_toi_thieu: mon.si_so_toi_thieu || 7  // Default 7 như bạn yêu cầu
    };
    this.isSiSoModalOpen = true;
    this.cdr.detectChanges();
  }

  closeSiSoModal() {
    this.isSiSoModalOpen = false;
    this.selectedMonForSiSo = null;
    this.siSoSaving = false;
  }

  saveSiSo() {
    if (!this.selectedMonForSiSo || !this.selectedHocKy) return;
    this.siSoSaving = true;

    const { ma_hoc_phan } = this.selectedMonForSiSo;
    const hocKy = Number(this.selectedHocKy);
    const config = this.siSoForm;

    // Gọi service đã thêm ở bước 1
    this.lhpService.updateSubjectConfig(ma_hoc_phan, hocKy, config).subscribe({
      next: (res) => {
        alert('Cập nhật sĩ số thành công!');
        this.siSoSaving = false;
        this.closeSiSoModal();
        // Cập nhật lại giá trị trong danh sách để UI đồng bộ
        const index = this.dangKyTheoHK.findIndex(m => m.ma_hoc_phan === ma_hoc_phan);
        if (index > -1) {
          this.dangKyTheoHK[index].si_so_toi_da = config.si_so_toi_da;
          this.dangKyTheoHK[index].si_so_toi_thieu = config.si_so_toi_thieu;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi lưu sĩ số', err);
        alert('Lỗi khi lưu sĩ số. (Có thể do API backend chưa được tạo). ' + (err.error?.message || err.message));
        this.siSoSaving = false;
      }
    });
  }

}
