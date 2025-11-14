import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { UserService } from '../../../core/services/user.service';
import { DepartmentService } from '../../../core/services/department.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './student-profile.component.html',
  styleUrls: ['./student-profile.component.css'],
})
export class StudentProfileComponent implements OnInit {
  student: any = {};
  editedStudent: any = {};
  departments: any[] = [];

  isModalOpen = false;
  isPasswordModalOpen = false;

  // password
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  showCurrent = false;
  showNew = false;
  showConfirm = false;

  // validation messages
  phoneError = '';
  emailError = '';
  passwordError = '';
  confirmError = '';

  constructor(
    private userService: UserService,
    private departmentService: DepartmentService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfileAndDepartments();
  }

  /** 🔹 Load profile + ngành học */
  loadProfileAndDepartments(): void {
    const id = this.authService.getUserId();
    if (!id) return;

    this.userService.getProfile(id).subscribe({
      next: (res) => {
        this.student = res.data || res;
        this.editedStudent = { ...this.student };

        this.departmentService.getAllPrograms().subscribe({
          next: (res2) => {
            const programs = res2.data || res2;
            if (Array.isArray(programs)) {
              this.departments = programs.map((p: any) => ({
                ten_nganh: p.nganh?.ten_nganh || p.ten_nganh || 'Chưa xác định',
              }));
              const department = programs[0];
              this.student.nganh_hoc =
                department.nganh?.ten_nganh || department.ten_nganh || 'Chưa xác định';
              this.editedStudent.nganh_hoc = this.student.nganh_hoc;
            }
          },
        });

        const cache = localStorage.getItem(`student_extra_${id}`);
        if (cache) {
          const parsed = JSON.parse(cache);
          this.student = { ...this.student, ...parsed };
          this.editedStudent = { ...this.student };
        }

        this.cdr.detectChanges();
      },
    });
  }

  /** 🔹 Modal chỉnh sửa */
  openEditModal(): void {
    this.isModalOpen = true;
    this.phoneError = '';
    this.emailError = '';
    this.editedStudent = { ...this.student };
  }

  closeEditModal(): void {
    this.isModalOpen = false;
  }

  /** 🔹 Validate profile */
  validateProfile(): boolean {
    const phoneRegex = /^0\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.phoneError = '';
    this.emailError = '';

    if (!phoneRegex.test(this.editedStudent.so_dien_thoai)) {
      this.phoneError = 'Số điện thoại phải gồm 10 số và bắt đầu bằng 0!';
    }
    if (!emailRegex.test(this.editedStudent.email)) {
      this.emailError = 'Email không hợp lệ. Vui lòng nhập đúng định dạng!';
    }

    return !this.phoneError && !this.emailError;
  }

  saveProfile(): void {
    if (!this.validateProfile()) return;

    const id = this.authService.getUserId();
    if (!id) return;

    const updateData = {
      gioi_tinh: this.editedStudent.gioi_tinh,
      ngay_sinh: this.editedStudent.ngay_sinh,
      so_dien_thoai: this.editedStudent.so_dien_thoai,
      email: this.editedStudent.email,
    };

    localStorage.setItem(
      `student_extra_${id}`,
      JSON.stringify({
        gioi_tinh: updateData.gioi_tinh,
        ngay_sinh: updateData.ngay_sinh,
        so_dien_thoai: updateData.so_dien_thoai,
      })
    );

    this.userService.updateProfile(this.student._id, updateData).subscribe({
      next: (res) => {
        alert(res.message || 'Cập nhật thông tin thành công!');
        this.student = { ...this.student, ...updateData };
        this.isModalOpen = false;
      },
      error: (err) => {
      alert(err.error?.message || 'Cập nhật thất bại!');
      },
    });
  }

  /** 🔹 Modal đổi mật khẩu */
  openPasswordModal(): void {
    this.isPasswordModalOpen = true;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError = '';
    this.confirmError = '';
  }

  closePasswordModal(): void {
    this.isPasswordModalOpen = false;
  }

  validatePassword(): boolean {
    this.passwordError = '';
    this.confirmError = '';

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError = 'Vui lòng nhập đầy đủ thông tin!';
      return false;
    }

    if (this.currentPassword === this.newPassword) {
      this.passwordError = 'Mật khẩu mới trùng với mật khẩu hiện tại!';
      return false;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~])[A-Za-z\d!@#$%^&*()_\-+=<>?{}[\]~]{5,}$/;

    if (!passwordRegex.test(this.newPassword)) {
      this.passwordError =
        'Mật khẩu mới phải có ít nhất 5 ký tự, gồm chữ in hoa, số và ký tự đặc biệt!';
      return false;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.confirmError = 'Mật khẩu xác nhận không khớp!';
      return false;
    }

    return true;
  }

  changePassword(): void {
    if (!this.validatePassword()) return;

    this.userService
      .changePassword(this.student._id, {
        currentPassword: this.currentPassword,
        newPassword: this.newPassword,
      })
      .subscribe({
        next: (res) => {
          if (res.success === false && res.message === 'WRONG_PASSWORD') {
            this.passwordError = 'Mật khẩu không chính xác!';
            return;
          }
          this.isPasswordModalOpen = false;
        },
        error: (err) => {
          this.passwordError =
            err.error?.message === 'WRONG_PASSWORD'
              ? 'Mật khẩu không chính xác!'
              : 'Đổi mật khẩu thất bại!';
        },
      });
  }
}
