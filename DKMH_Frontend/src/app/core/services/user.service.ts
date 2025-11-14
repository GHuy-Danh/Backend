import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


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
}
