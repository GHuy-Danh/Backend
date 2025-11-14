// D:\Tai lieu hoc\DoAnTotNghiep\DKMH_Frontend\src\app\features\admin\admin-users\admin-users.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  isAddModalOpen = false;
  isEditModalOpen = false;

  addFormModel: any = { _id: '', ho_ten: '', email: '', loai: '', mat_khau: '' };
  editFormModel: any = { _id: '', ho_ten: '', email: '', loai: '', mat_khau: '' };

  filteredUsers: any[] = [];
  paginatedUsers: any[] = [];
  currentPage: number = 1;
  pageSize: number = 15;
  totalPages: number = 1;

  constructor(private userService: UserService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // ===============================================
  // === LOAD DANH SÁCH NGƯỜI DÙNG ===
  // ===============================================
  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.userService.getAllUsers().subscribe({
      next: (res) => {
        // Xử lý dữ liệu phản hồi chuẩn hóa từ backend
        const data = Array.isArray(res.data) ? res.data : res;
        this.users = data;
        this.filteredUsers = this.users;
        this.updatePagination();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Lỗi tải danh sách người dùng.';
        this.isLoading = false;
      },
    });
  }

  /** 🔹 Cập nhật phân trang */
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize) || 1;
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedUsers = this.filteredUsers.slice(start, end);
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
    this.loadUsers();
    this.currentPage = 1;
    this.updatePagination();
  }

  // ===============================================
  // === CRUD LOGIC ===
  // ===============================================
  openAddModal(): void {
    this.resetAddForm();
    this.isAddModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
  }

  openEditModal(user: any): void {
    this.editFormModel = { ...user, mat_khau: '' };
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
  }

  resetAddForm(): void {
    this.addFormModel = { _id: '', ho_ten: '', email: '', loai: '', mat_khau: '' };
  }

  // === CREATE ===
  submitAddForm(): void {
    const data = { ...this.addFormModel };
    if (!data._id || !data.ho_ten || !data.email || !data.mat_khau || !data.loai) {
      alert('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    this.userService.createUser(data).subscribe({
      next: (res) => {
        alert(res.message || 'Thêm người dùng thành công!');
        this.loadUsers();
        this.closeAddModal();
      },
      error: (err) => alert(`Thêm thất bại: ${err.error?.message || 'Lỗi server.'}`),
    });
  }

  // === UPDATE ===
  submitEditForm(): void {
    const id = this.editFormModel._id;
    if (!id) return;

    const updated = { ...this.editFormModel };
    if (!updated.ho_ten || !updated.email || !updated.loai) {
      alert('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    this.userService.updateUser(id, updated).subscribe({
      next: (res) => {
        alert(res.message || 'Cập nhật thành công!');
        this.loadUsers();
        this.closeEditModal();
      },
      error: (err) => alert(`Cập nhật thất bại: ${err.error?.message || 'Lỗi server.'}`),
    });
  }

  // === DELETE ===
  deleteUser(id: string): void {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;

    this.userService.deleteUser(id).subscribe({
      next: (res) => {
        alert(res.message || 'Xóa thành công!');
        this.loadUsers();
      },
      error: (err) => alert(`Xóa thất bại: ${err.error?.message || 'Lỗi server.'}`),
    });
  }
}
