import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Thêm interface cho dữ liệu sinh viên cần hiển thị
export interface StudentData {
    ma_sv: string;
    ho_ten: string;
    email: string;
    ngay_sinh: Date; // Giả định có
    lop: string; // Tên lớp (vd: CNTT2025A)
    nganh: string; // Tên ngành
    trang_thai_hoc_tap: string; // (Đang học, Bảo lưu, Cảnh cáo,...)
    // Thêm các trường cần thiết khác cho chi tiết
}
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  login(id: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { id, password });
  }

// ✅ GET ALL (Trả về Observable<any> để xử lý response.data)
  getAllUsers(): Observable<any> { 
    return this.http.get<any>(this.apiUrl);
  }

  // ✅ CREATE (Dùng 'any' cho dữ liệu)
  createUser(userData: any): Observable<any> { 
    return this.http.post<any>(this.apiUrl, userData);
  }

  // ✅ UPDATE
  updateUser(id: string, userData: any): Observable<any> { 
    return this.http.put<any>(`${this.apiUrl}/${id}`, userData);
  }

  // ✅ DELETE
  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getStudentsByMaLop(maLop: string): Observable<StudentData[]> {
        const params = new HttpParams().set('ma_lop', maLop);
        // Đây là API giả định, bạn có thể cần điều chỉnh endpoint thực tế của backend
        return this.http.get<StudentData[]>(`${this.apiUrl}/students/by-lop`, { params });
    }

  // Lấy thông tin cá nhân (Nếu cần)
  getProfile(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile/${id}`);
  }

  /** 🔹 Cập nhật thông tin cá nhân (Student, Teacher, Admin) */
  updateProfile(id: string, updatedData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, updatedData);
  }

  /** 🔹 Đổi mật khẩu */
  changePassword(userId: string, data: { currentPassword: string; newPassword: string }) {
  return this.http.put<any>(`${this.apiUrl}/${userId}/change-password`, data);
}

  resetPassword(id: string): Observable<any> {
  return this.http.put(`${this.apiUrl}/${id}/reset-password`, {});
}

  // GET /users/:id/credits/registered
  getRegisteredCredits(id: string) {
    return this.http.get<any>(`${this.apiUrl}/${encodeURIComponent(id)}/credits/registered`);
  }

  // GET /users/credits/all
  getAllCredits() {
    return this.http.get<any>(`${this.apiUrl}/credits/all`);
  }
}
