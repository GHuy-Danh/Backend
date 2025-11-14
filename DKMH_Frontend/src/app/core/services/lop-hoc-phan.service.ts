import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LopHocPhanService {
  private apiUrl = 'http://localhost:3000/api/lophocphan';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getById(ma_lop_hp: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${encodeURIComponent(ma_lop_hp)}`);
  }

  create(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  update(ma_lop_hp: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${encodeURIComponent(ma_lop_hp)}`, data);
  }

  delete(ma_lop_hp: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${encodeURIComponent(ma_lop_hp)}`);
  }

  /** 🔹 Lấy danh sách lớp mở trong học kỳ */
  getByHocKy(hocKy: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?hoc_ky=${hocKy}`);
  }
}
