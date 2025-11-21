import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThoiKhoaBieuService {
  private apiUrl = 'http://localhost:3000/api/thoi-khoa-bieu';

  constructor(private http: HttpClient) {}

  generate(hocKy: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate`, { hocKy });
  }

  getAll(hocKy: number): Observable<any> {
    const params = new HttpParams().set('hocKy', String(hocKy));
    return this.http.get(`${this.apiUrl}/admin`, { params });
  }

  updateStatus(ma_lop_hp: string, ngay_hoc: string, trang_thai: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-status`, {
      ma_lop_hp,
      ngay_hoc,
      trang_thai
    });
  }

  getForStudent(ma_sv: string, hocKy: number): Observable<any> {
    const params = new HttpParams()
      .set('ma_sv', ma_sv)
      .set('hocKy', String(hocKy));
    return this.http.get(`${this.apiUrl}/student`, { params });
  }

  getForLecturer(ma_gv: string, hocKy: number): Observable<any> {
    const params = new HttpParams()
      .set('ma_gv', ma_gv)
      .set('hocKy', String(hocKy));
    return this.http.get(`${this.apiUrl}/lecturer`, { params });
  }
}