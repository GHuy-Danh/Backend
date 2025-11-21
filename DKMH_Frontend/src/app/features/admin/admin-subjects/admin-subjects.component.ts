import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubjectService } from '../../../core/services/subject.service';

@Component({
  selector: 'app-admin-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-subjects.component.html',
  styleUrls: ['./admin-subjects.component.css'], // fix: styleUrl → styleUrls
})
export class AdminSubjectsComponent implements OnInit {
  subjects: any[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  filteredSubjects: any[] = [];
  paginatedSubjects: any[] = [];
  currentPage: number = 1;
  pageSize: number = 20;
  totalPages: number = 1;

  isAddModalOpen = false;
  isEditModalOpen = false;

  searchKey = '';
  filterKhoi = '';
  filterLoai = '';

  /** 🔹 Filter theo tìm kiếm + khối + loại */
  applyFilter() {
    const key = this.searchKey.trim().toLowerCase();

    this.filteredSubjects = this.subjects.filter(s => {
      const matchSearch =
        s.ma_hoc_phan.toLowerCase().includes(key) ||
        s.ten_hoc_phan.toLowerCase().includes(key);

      const matchKhoi = this.filterKhoi ? s.khoi === this.filterKhoi : true;
      const matchLoai = this.filterLoai ? s.loai === this.filterLoai : true;

      return matchSearch && matchKhoi && matchLoai;
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  /** 🔹 Form Thêm / Sửa */
  addFormModel: any = {
    ma_hoc_phan: '',
    ten_hoc_phan: '',
    khoi: '',
    loai: '',
    hoc_ky: null,
    so_tin_chi: null,
    pham_vi: '',
    ma_chuyen_nganh: '',
    dieu_kien_hoc_truoc: [],
    dieu_kien_tien_quyet: [],
  };

  editFormModel: any = { ...this.addFormModel };
  editOldSubject: any = null;

  constructor(private subjectService: SubjectService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadSubjects();
  }

  /** 🔹 Load toàn bộ môn học */
  loadSubjects(): void {
    this.isLoading = true;
    this.subjectService.getAllSubjects().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res.data) ? res.data : res;
        // 🔹 Sắp xếp tăng dần theo mã học phần
        this.subjects = data.sort((a: { ma_hoc_phan: string; }, b: { ma_hoc_phan: any; }) => a.ma_hoc_phan.localeCompare(b.ma_hoc_phan));
        this.filteredSubjects = this.subjects;
        this.updatePagination();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Lỗi tải danh sách môn học.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  /** 🔹 Cập nhật phân trang */
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredSubjects.length / this.pageSize) || 1;
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedSubjects = this.filteredSubjects.slice(start, end);
  }

  /** 🔹 Chuyển trang */
  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  /** 🔹 Sau khi thêm / sửa / xóa xong thì reload */
  refreshAfterChange() {
    this.loadSubjects();
    this.currentPage = 1;
    this.updatePagination();
  }

  /** 🔹 Thêm môn học */
  openAddModal(): void {
    this.resetAddForm();
    this.isAddModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
  }

  submitAddForm(): void {
    const data = { ...this.addFormModel };
    // Gộp 2 trường dieu_kien thành object
    data.dieu_kien = {
      hoc_truoc: data.dieu_kien_hoc_truoc || [],
      tien_quyet: data.dieu_kien_tien_quyet || [],
    };

    if (!data.ma_hoc_phan || !data.ten_hoc_phan) {
      alert('Vui lòng nhập đầy đủ thông tin bắt buộc.');
      return;
    }

    this.subjectService.createSubject(data, '7480201', data.ma_chuyen_nganh || 'ALL').subscribe({
      next: (res: any) => {
        if (!res.success) {
          alert(res.message);
          return;
        }
        alert(res.message || 'Thêm môn học thành công!');
        this.loadSubjects();
        this.closeAddModal();
      },
      error: (err) => alert(`Thêm thất bại: ${err.error?.message || 'Lỗi server.'}`),
    });
  }

  resetAddForm(): void {
    this.addFormModel = {
      ma_hoc_phan: '',
      ten_hoc_phan: '',
      khoi: '',
      loai: '',
      hoc_ky: null,
      so_tin_chi: null,
      pham_vi: '',
      ma_chuyen_nganh: '',
      dieu_kien_hoc_truoc: [],
      dieu_kien_tien_quyet: [],
    };
  }

  /** 🔹 Cập nhật môn học */
  openEditModal(sub: any): void {
    this.editOldSubject = sub; // lưu dữ liệu cũ để hiển thị
    this.editFormModel = {
      ...sub,
      dieu_kien_hoc_truoc: sub.dieu_kien?.hoc_truoc || [],
      dieu_kien_tien_quyet: sub.dieu_kien?.tien_quyet || [],
    };
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
  }

  submitEditForm(): void {
    const updated = { ...this.editFormModel };
    updated.dieu_kien = {
      hoc_truoc: updated.dieu_kien_hoc_truoc || [],
      tien_quyet: updated.dieu_kien_tien_quyet || [],
    };

    this.subjectService.updateSubject(updated.ma_hoc_phan, updated).subscribe({
      next: (res: any) => {
        alert(res?.message ?? 'Cập nhật môn học thành công!');
        this.refreshAfterChange();
        this.closeEditModal();
      },
      error: (err) => alert(`Cập nhật thất bại: ${err.error?.message || 'Lỗi server.'}`),
    });
  }

  /** 🔹 Xóa môn học */
  deleteSubject(maHocPhan: string): void {
    if (!confirm(`Bạn có chắc chắn muốn xóa môn học ${maHocPhan}?`)) return;

    this.subjectService.deleteSubject(maHocPhan).subscribe({
      next: (res: any) => {
        alert(res?.message ?? 'Xóa môn học thành công!');
        this.loadSubjects();
      },
      error: (err) => alert(`Xóa thất bại: ${err.error?.message || 'Lỗi server.'}`),
    });
  }

  /** 🔹 Format dieu_kien thành chuỗi gọn cho bảng */
  formatDieuKien(dk: any): string {
    if (!dk) return '';
    if (typeof dk === 'string') return dk;

    const hocTruoc = Array.isArray(dk.hoc_truoc) ? dk.hoc_truoc.join(', ') : '';
    const tienQuyet = Array.isArray(dk.tien_quyet) ? dk.tien_quyet.join(', ') : '';
    return [hocTruoc, tienQuyet].filter(Boolean).join(' + ');
  }
}
