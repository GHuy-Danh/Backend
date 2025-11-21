import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeacherService } from '../../../core/services/teacher.service';

@Component({
  selector: 'app-admin-teachers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-teachers.component.html',
  styleUrls: ['./admin-teachers.component.css'],
})
export class AdminTeachersComponent implements OnInit {
  teachers: any[] = [];
  filteredTeachers: any[] = [];
  paginatedTeachers: any[] = [];

  selectedNganh = 'Tất cả';
  searchText = '';

  currentPage = 1;
  pageSize = 15;
  totalPages = 1;

  isDetailModalOpen = false;
  selectedGV: any = null;

  constructor(private teacherService: TeacherService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadTeachers();
  }

  loadTeachers(): void {
    this.teacherService.getAll().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res.data) ? res.data : res;
        this.teachers = data.sort((a: { ma_gv: any; }, b: { ma_gv: any; }) => (a.ma_gv || '').localeCompare(b.ma_gv || ''));
        this.applyFilter();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Lỗi tải giảng viên:', err),
    });
  }

  applyFilter(): void {
    const search = this.searchText.trim().toLowerCase();
    this.filteredTeachers = this.teachers.filter((gv) => {
      const matchNganh = this.selectedNganh === 'Tất cả' || gv.nganh_day === this.selectedNganh;
      const matchSearch =
        !search ||
        (gv.ten_giang_vien || '').toLowerCase().includes(search) ||
        (gv.ma_gv || '').toLowerCase().includes(search);
      return matchNganh && matchSearch;
    });
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredTeachers.length / this.pageSize) || 1;
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedTeachers = this.filteredTeachers.slice(start, start + this.pageSize);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  refresh(): void {
    this.searchText = '';
    this.selectedNganh = 'Tất cả';
    this.applyFilter();
  }

  getStatusClass(status: string): string {
    if (status === 'Đang dạy') return 'success';
    if (status === 'Tạm nghỉ') return 'warning';
    if (status === 'Đã nghỉ việc') return 'fail';
    return '';
  }

  openDetailModal(gv: any): void {
    this.selectedGV = gv;
    this.isDetailModalOpen = true;
  }

  closeDetailModal(): void {
    this.isDetailModalOpen = false;
    this.selectedGV = null;
  }
}
