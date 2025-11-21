// src/app/core/services/auth.service.ts (PHIÊN BẢN MỚI: CHỈ XỬ LÝ API VÀ LƯU TRỮ)

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router'; // Giữ lại Router cho hàm logout()

// Định nghĩa interface cho dữ liệu đăng nhập
export interface LoginCredentials {
  id: string;      
  password: string; 
}

// Định nghĩa interface cho dữ liệu người dùng được trả về từ Backend (UserService)
export interface UserData {
    _id: string;
    ho_ten: string;
    loai: string;
    email: string;
    ma_sv: string;
    ma_gv: string; // Thêm trường MaGV
}

// Định nghĩa interface cho response trả về từ API /user/login
export interface LoginResponse {
    success: boolean;
    data?: UserData; // Có data nếu success=true
    message?: string; // Có message nếu success=false
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // 💡 CẬP NHẬT URL API: Trỏ đến endpoint /api/user/login (đã thêm GlobalPrefix 'api' ở main.ts)
  private apiUrl = 'http://localhost:3000/api/users'; 
  
  private ROLE_KEY = 'user_role';
  private NAME_KEY = 'user_name';
  private ID_KEY = 'user_id';
  private MA_SV_KEY = 'user_ma_sv';
  private MA_GV_KEY = 'user_ma_gv'; // Thêm key cho Mã Giảng viên

  constructor(
    private http: HttpClient, 
    private router: Router
  ) { }

  /**
   * Gửi yêu cầu đăng nhập và trả về Observable để LoginComponent xử lý kết quả.
   * KHÔNG CÒN TỰ ĐIỀU HƯỚNG BÊN TRONG HÀM NÀY.
   */
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    // Gọi API: POST http://localhost:3000/api/user/login
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
  }

  /**
   * Lưu trữ thông tin người dùng vào Local Storage
   */
  saveUserData(data: UserData): void {
      localStorage.setItem(this.ROLE_KEY, data.loai); 
      localStorage.setItem(this.NAME_KEY, data.ho_ten); 
      localStorage.setItem(this.ID_KEY, data._id);
      localStorage.setItem(this.MA_SV_KEY, data.ma_sv);
      // Lưu trữ MaGV, sử dụng chuỗi rỗng nếu không có (để tránh lỗi undefined)
      localStorage.setItem(this.MA_GV_KEY, data.ma_gv || '');
  }


  // ===========================================
  // === HÀM TIỆN ÍCH CÒN LẠI ===
  // ===========================================
  getUserId(): string | null {
    return localStorage.getItem(this.ID_KEY);
  }

  getUserRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }
  
  getUserName(): string | null {
    return localStorage.getItem(this.NAME_KEY);
  }

  getUserMaSV(): string | null {
    return localStorage.getItem(this.MA_SV_KEY);
  }

  /**
   * Lấy Mã Giảng viên (MaGV) từ Local Storage.
   */
  getUserMaGV(): string | null {
    return localStorage.getItem(this.MA_GV_KEY);
  }


  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.ROLE_KEY); 
  }

  logout(): void {
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem(this.NAME_KEY);
    localStorage.removeItem(this.ID_KEY);
    localStorage.removeItem(this.MA_SV_KEY);
    localStorage.removeItem(this.MA_GV_KEY); // Xóa MaGV khi đăng xuất
    this.router.navigate(['/login']);
  }
}