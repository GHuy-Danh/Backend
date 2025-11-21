import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DangKyService {
  private apiUrl = 'http://localhost:3000/api/dang-ky';

  constructor(private http: HttpClient) {}

  // Lấy tất cả đăng ký (dùng khi cần)
  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Lấy theo id (_id string)
  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${encodeURIComponent(id)}`);
  }

  // Lấy theo sinh viên (query ?ma_sv=...)
  getBySinhVien(ma_sv: string): Observable<any> {
    const params = new HttpParams().set('ma_sv', ma_sv);
    return this.http.get<any>(this.apiUrl, { params });
  }

  // Lấy theo học kỳ (query ?hoc_ky=6)
  getByHocKy(hocKy: number): Observable<any> {
    const params = new HttpParams().set('hoc_ky', String(hocKy));
    return this.http.get<any>(this.apiUrl, { params });
  }

  // Lấy đăng ký theo trạng thái (ma_sv optional)
  // ví dụ: getRegistrationsByStatus('2001', 'Chờ xác nhận')
  getRegistrationsByStatus(ma_sv?: string, trang_thai?: string): Observable<any> {
    let params = new HttpParams();
    if (ma_sv) params = params.set('ma_sv', ma_sv);
    if (trang_thai) params = params.set('trang_thai', trang_thai);
    return this.http.get<any>(this.apiUrl, { params });
  }

  // Tạo đăng ký: payload theo spec (người dùng chịu trách nhiệm truyền đúng field)
  createRegistration(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  // Cập nhật (nếu cần)
  update(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${encodeURIComponent(id)}`, data);
  }

  // Xóa đăng ký
  deleteRegistration(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${encodeURIComponent(id)}`);
  }

  // Lấy các registration đang chờ (admin) — endpoint /pending nếu backend có
  getPendingRegistrations(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pending`);
  }

}
