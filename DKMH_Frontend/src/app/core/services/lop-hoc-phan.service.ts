import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LopHocPhanService {
  private apiUrl = 'http://localhost:3000/api/lop-hoc-phan';

  constructor(private http: HttpClient) {}

  /** 🔥 Gọi API phân lớp tự động */
  autoAssign(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auto-assign`, {});
  }

  /** Lấy danh sách lớp học phần */
  getAll(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

    // preview (no persist)
  autoAssignPreview(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auto-assign?persist=false`, {});
  }

  // apply (persist=true)
  autoAssignApply(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auto-assign?persist=true`, {});
  }

  // get registration summary by hoc ky
  getRegistrationSummary(hocKy?: number): Observable<any> {
    const url = `${this.apiUrl}/registrations/summary${hocKy ? '?hocKy=' + hocKy : ''}`;
    return this.http.get<any>(url);
  }

  // get registrations for a subject
  getRegistrationsBySubject(maHocPhan: string, hocKy?: number): Observable<any> {
    const url = `${this.apiUrl}/registrations/${encodeURIComponent(maHocPhan)}${hocKy ? '?hocKy=' + hocKy : ''}`;
    return this.http.get<any>(url);
  }

  // get class by id
  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  updateSubjectConfig(maHocPhan: string, hocKy: number, config: { si_so_toi_da: number, si_so_toi_thieu: number }): Observable<any> {
    // Endpoint này là giả định, chúng ta sẽ làm ở backend sau
    const url = `${this.apiUrl}/config/${encodeURIComponent(maHocPhan)}?hocKy=${hocKy}`;
    return this.http.put(url, config);
  }

  
}
