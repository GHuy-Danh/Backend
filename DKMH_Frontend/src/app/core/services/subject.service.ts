import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private apiUrl = 'http://localhost:3000/api/subjects';

  /** 🟢 Cache toàn bộ danh sách môn học */
  public cachedSubjects: any[] | null = null;

  constructor(private http: HttpClient) {}

  /** 🔹 Lấy danh sách tất cả Môn học (có cache) */
  getAllSubjects(): Observable<any[]> {
    if (this.cachedSubjects) {
      return new Observable(observer => {
        observer.next(this.cachedSubjects!);
        observer.complete();
      });
    }

    return this.http.get<any>(this.apiUrl).pipe(
      map(res => res.data ?? res),
      tap((subjects: any[]) => this.cachedSubjects = subjects)
    );
  }

  /** 🔹 Lọc các môn tự chọn */
  getElectives(): Observable<any[]> {
    return this.getAllSubjects().pipe(
      map((subjects: any[]) =>
        subjects.filter((s: any) => s.loai?.toLowerCase().includes('tự chọn'))
      )
    );
  }

  /** 🔹 Thêm môn học */
  createSubject(data: any, maNganh: string, maChuyenNganh: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}?maNganh=${maNganh}&maChuyenNganh=${maChuyenNganh}`, data).pipe(
      tap(() => this.cachedSubjects = null)
    );
  }

  /** 🔹 Cập nhật môn học */
  updateSubject(maHocPhan: string, subjectData: any) {
    return this.http.put(`${this.apiUrl}/by-code/${maHocPhan}`, subjectData).pipe(
      tap(() => this.cachedSubjects = null)
    );
  }


  /** 🔹 Xóa môn học */
  deleteSubject(maHocPhan: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${maHocPhan}`).pipe(
      tap(() => this.cachedSubjects = null)
    );
  }

  /** 🔹 Môn tự chọn theo học kỳ */
  getElectivesBySemester(hocKy: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/electives/${hocKy}`);
  }
}
