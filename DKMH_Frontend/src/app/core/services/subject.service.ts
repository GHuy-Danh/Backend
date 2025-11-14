// src/core/services/subject.service.ts (KHÔNG DÙNG INTERFACE)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

// 💡 LOẠI BỎ CÁC INTERFACE Subject và SubjectResponse

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private apiUrl = 'http://localhost:3000/api/subjects'; 

  constructor(private http: HttpClient) {}

  /**
   * Lấy danh sách tất cả các Môn học (Không dùng Interface cho kiểu trả về)
   */
  getAllSubjects(): Observable<any> { 
    return this.http.get<any>(this.apiUrl);
  }

  /** 🟢 Lọc các môn tự chọn (loai == 'Tự chọn') */
  getElectives(): Observable<any[]> {
    return this.getAllSubjects().pipe(
      map((subjects) => subjects.filter((s: { loai: string; }) => s.loai?.toLowerCase().includes('tự chọn')))
    );
  }
  /** 🟢 Thêm / cập nhật / xóa nếu cần (dành cho admin) */
// src/app/core/services/subject.service.ts
  createSubject(data: any, maNganh: string, maChuyenNganh: string): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}?maNganh=${maNganh}&maChuyenNganh=${maChuyenNganh}`, data);
}


  updateSubject(maHocPhan: string, subjectData: any) {
    return this.http.put(`${this.apiUrl}/${maHocPhan}`, subjectData);
  }

  deleteSubject(maHocPhan: string) {
    return this.http.delete(`${this.apiUrl}/${maHocPhan}`);
  }

    /** 🔹 Lấy danh sách môn học tự chọn theo học kỳ */
  getElectivesBySemester(hocKy: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/electives/${hocKy}`);
  }
}