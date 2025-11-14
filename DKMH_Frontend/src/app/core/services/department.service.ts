// src/core/services/department.service.ts (KHÔNG DÙNG INTERFACE)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// 💡 LOẠI BỎ CÁC INTERFACE ProgramSummary và ProgramResponse

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = 'http://localhost:3000/api/departments'; 

  constructor(private http: HttpClient) {}

  /**
   * Lấy danh sách các Chương trình Đào tạo (Không dùng Interface cho kiểu trả về)
   */
  getAllPrograms(): Observable<any> { // 💡 Trả về Observable<any>
    return this.http.get<any>(this.apiUrl);
  }
  
  // ✅ CREATE
  createProgram(programData: any): Observable<any> { // 💡 body và response đều là any
    return this.http.post<any>(this.apiUrl, programData);
  }

  // ✅ READ (Chi tiết)
  getProgramDetail(id: number): Observable<any> { // 💡 response là any
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // ✅ UPDATE
  updateProgram(id: number, programData: any): Observable<any> { // 💡 body và response đều là any
    return this.http.put<any>(`${this.apiUrl}/${id}`, programData);
  }

  // ✅ DELETE
  deleteProgram(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
  // ✅ CREATE Chuyên ngành (Push vào mảng)
createMajor(id: number, majorData: any): Observable<any> {   
    return this.http.post<any>(`${this.apiUrl}/${id}/majors`, majorData);
}

// ✅ UPDATE Chuyên ngành (Dùng ID Document và Mã chuyên ngành cũ)
updateMajor(id: number, oldMaChuyenNganh: string, majorData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/majors/${oldMaChuyenNganh}`, majorData);
}

// ✅ DELETE Chuyên ngành
deleteMajor(id: number, maChuyenNganh: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}/majors/${maChuyenNganh}`);
}
}