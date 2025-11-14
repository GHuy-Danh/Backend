// src/app/features/auth/login/login.component.ts (DỰA TRÊN MẪU IONIC)

import { Component } from '@angular/core';
import { AuthService, UserData, LoginResponse } from '../../../core/services/auth.service'; // Import các interface
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router'; // 💡 Dùng Router của Angular thay cho NavController

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // 💡 Đảm bảo tên biến khớp với HTML
  loginData = {
    id: '',
    password: ''
  };
  loginError: string | null = null; 

  constructor(
    private authService: AuthService,
    private router: Router // 💡 Inject Router để điều hướng
  ) {}

  onLogin() {
    this.loginError = null; // Reset lỗi

    if (!this.loginData.id || !this.loginData.password) {
      this.loginError = 'Vui lòng nhập đầy đủ thông tin!';
      return;
    }

    this.authService
      .login({ id: this.loginData.id, password: this.loginData.password })
      .subscribe({
        next: (res: LoginResponse) => {
          if (res.success && res.data) {
            const user: UserData = res.data;
            
            // 1. Lưu thông tin người dùng vào localStorage
            this.authService.saveUserData(user); 

            // 2. Điều hướng dựa theo loại người dùng
            switch (user.loai) {
              case 'Quản trị viên':
              case 'Admin': // Thêm case 'Admin' nếu cần
                this.router.navigate(['/admin/dashboard']);
                break;
              case 'Giảng viên':
              case 'Advisor': // Thêm case 'Advisor' nếu cần
                this.router.navigate(['/advisor/dashboard']);
                break;
              case 'Sinh viên':
              case 'Student': // Thêm case 'Student' nếu cần
                this.router.navigate(['/student/dashboard']);
                break;
              default:
                this.authService.logout();
                this.loginError = 'Tài khoản không có quyền truy cập!';
            }
          } else {
            // Trường hợp backend trả về success: false
            this.loginError = res.message || 'Đăng nhập thất bại!';
          }
        },
        error: (err) => {
          console.error('❌ Lỗi đăng nhập:', err);
          // Xử lý lỗi HTTP (ví dụ: 401 Unauthorized, 500 Server Error)
          this.loginError = 'Không thể kết nối đến máy chủ hoặc sai thông tin!';
        },
      });
  }
}