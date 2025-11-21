import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private apiUrl = 'http://localhost:3000/api/teachers';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getByNganh(nganh: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?nganh=${encodeURIComponent(nganh)}`);
  }

  create(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  update(ma_gv: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${encodeURIComponent(ma_gv)}`, data);
  }

  delete(ma_gv: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${encodeURIComponent(ma_gv)}`);
  }
}
