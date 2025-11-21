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
  filteredUsers: any[] = [];
  paginatedUsers: any[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  // modal state
  isAddModalOpen = false;
  isEditModalOpen = false;
  isResetPwModalOpen = false;

  // search + filter
  searchKey = '';
  filterLoai = 'Tất cả';

  // forms
  addFormModel = { _id: '', ho_ten: '', email: '', loai: '', mat_khau: '' };
  editFormModel = { _id: '', ho_ten: '', email: '', loai: '' };

  // LƯU USER CŨ
  editOldUser: any = null;

  // reset password
  resetTargetId = '';
  resetTargetUser: any = null;

  // pagination
  currentPage = 1;
  pageSize = 15;
  totalPages = 1;

  constructor(private userService: UserService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // =======================================
  // LOAD USERS
  // =======================================
  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        const data = Array.isArray(res.data) ? res.data : res;
        this.users = data;
        this.applyFilter();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Lỗi tải danh sách người dùng.';
        this.isLoading = false;
      }
    });
  }

  // =======================================
  // FILTER + SEARCH
  // =======================================
  applyFilter() {
    const key = this.searchKey.trim().toLowerCase();

    this.filteredUsers = this.users.filter(u => {
      const matchSearch =
        u._id.toLowerCase().includes(key) ||
        u.ho_ten.toLowerCase().includes(key) ||
        u.email.toLowerCase().includes(key);

      const matchLoai =
        this.filterLoai === 'Tất cả' ? true : u.loai === this.filterLoai;

      return matchSearch && matchLoai;
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  // =======================================
  // PAGINATION
  // =======================================
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize) || 1;
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedUsers = this.filteredUsers.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  // =======================================
  // ADD USER
  // =======================================
  openAddModal() {
    this.addFormModel = { _id: '', ho_ten: '', email: '', loai: '', mat_khau: '' };
    this.isAddModalOpen = true;
  }
  closeAddModal() { this.isAddModalOpen = false; }

  submitAddForm() {
    const d = this.addFormModel;
    if (!d._id || !d.ho_ten || !d.email || !d.loai || !d.mat_khau) {
      alert('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    this.userService.createUser(d).subscribe({
      next: (res) => {
        alert(res.message || 'Thêm người dùng thành công!');
        this.closeAddModal();
        this.loadUsers();
      },
      error: (err) => alert(`Thêm thất bại: ${err.error?.message}`)
    });
  }

  // =======================================
  // EDIT USER
  // =======================================
  openEditModal(user: any) {
    this.editFormModel = {
      _id: user._id,
      ho_ten: '',
      email: '',
      loai: ''
    };

    // Lưu user cũ
    this.editOldUser = { ...user };

    this.isEditModalOpen = true;
  }

  closeEditModal() { this.isEditModalOpen = false; }

  submitEditForm() {
    const { _id, ho_ten, email, loai } = this.editFormModel;
    const updated: any = {};

    if (ho_ten.trim()) updated.ho_ten = ho_ten.trim();
    if (email.trim()) updated.email = email.trim();
    if (loai.trim()) updated.loai = loai.trim();

    if (Object.keys(updated).length === 0) {
      alert('Bạn chưa nhập thông tin mới nào.');
      return;
    }

    this.userService.updateUser(_id, updated).subscribe({
      next: (res) => {
        alert(res.message || 'Cập nhật thành công!');
        this.closeEditModal();
        this.loadUsers();
      },
      error: (err) => alert(`Cập nhật thất bại: ${err.error?.message}`)
    });
  }

  // =======================================
  // DELETE USER
  // =======================================
  deleteUser(id: string) {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;

    this.userService.deleteUser(id).subscribe({
      next: () => this.loadUsers(),
      error: (err) => alert(`Lỗi xóa: ${err.error?.message}`)
    });
  }

  // =======================================
  // RESET PASSWORD (123)
  // =======================================
  openResetPasswordModal() {
    this.resetTargetId = '';
    this.resetTargetUser = null;
    this.isResetPwModalOpen = true;
  }

  closeResetPwModal() {
    this.isResetPwModalOpen = false;
  }

  findUserForReset() {
    const u = this.users.find(x => x._id === this.resetTargetId.trim());
    if (!u) {
      alert('Không tìm thấy người dùng!');
      this.resetTargetUser = null;
      return;
    }
    this.resetTargetUser = u;
  }

  resetPasswordNow() {
    if (!this.resetTargetUser) return;

    this.userService.resetPassword(this.resetTargetUser._id).subscribe({
      next: () => {
        alert('Đặt lại mật khẩu thành công!\nMật khẩu mới: 123');
        this.closeResetPwModal();
      },
      error: (err) => alert(`Lỗi reset: ${err.error?.message}`)
    });

  }
}
