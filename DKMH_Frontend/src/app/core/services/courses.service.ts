// src/app/core/services/courses.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ElectiveCourse } from '../models/registration.model';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CoursesService {
  private apiUrl = 'http://localhost:3000/courses'; // giả sử backend có /courses/electives

  constructor(private http: HttpClient) {}

  /** Lấy danh sách môn tự chọn phù hợp với chương trình học (có thể nhận query params) */
  getElectivesForProgram(ma_nganh?: string, khoa?: string, hoc_ky?: string | number): Observable<ElectiveCourse[]> {
    const qs = [];
    if (ma_nganh) qs.push(`ma_nganh=${encodeURIComponent(ma_nganh)}`);
    if (khoa) qs.push(`khoa=${encodeURIComponent(khoa)}`);
    if (hoc_ky) qs.push(`hoc_ky=${encodeURIComponent(hoc_ky)}`);
    const url = `${this.apiUrl}/electives${qs.length ? '?' + qs.join('&') : ''}`;
    return this.http.get<ElectiveCourse[]>(url).pipe(catchError(this.handleError));
  }

  /** Nếu backend có endpoint trả về prerequisites cho 1 môn (tùy chọn) */
  getPrerequisites(ma_mon: string) {
    return this.http.get<{ prerequisites: string[] }>(`${this.apiUrl}/${encodeURIComponent(ma_mon)}/prerequisites`)
      .pipe(catchError(this.handleError));
  }

  private handleError(err: any) {
    console.error('CoursesService error:', err);
    return throwError(() => err);
  }
}
