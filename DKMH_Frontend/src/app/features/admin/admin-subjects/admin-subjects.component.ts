// D:\Tai lieu hoc\DoAnTotNghiep\DKMH_Frontend\src\app\features\admin\admin-subjects\admin-subjects.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubjectService } from '../../../core/services/subject.service';

@Component({
  selector: 'app-admin-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-subjects.component.html',
  styleUrl: './admin-subjects.component.css',
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

  addFormModel: any = {
    ma_hoc_phan: '',
    ten_hoc_phan: '',
    khoi: '',
    loai: '',
    hoc_ky: null,
    so_tin_chi: null,
    pham_vi: '',
    ma_chuyen_nganh: '',
  };

  editFormModel: any = { ...this.addFormModel };

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
    };
  }

  /** 🔹 Cập nhật môn học */
  openEditModal(sub: any): void {
    this.editFormModel = { ...sub };
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
  }

  submitEditForm(): void {
    const updated = { ...this.editFormModel };
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
        this.loadSubjects()
      },
      error: (err) => alert(`Xóa thất bại: ${err.error?.message || 'Lỗi server.'}`),
    });
  }
}
