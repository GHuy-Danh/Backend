import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <--- BẮT BUỘC ĐỂ DÙNG NGMODEL
import { AuthService } from '../../../core/services/auth.service';
import { ThoiKhoaBieuService } from '../../../core/services/thoi-khoa-bieu.service';
import { catchError, map, of } from 'rxjs';

interface ClassSummary {
  ma_lop_hp: string;
  ten_hp: string;
  so_sv: number;
  phong: string;
  trang_thai: 'Ổn định' | 'Cần chú ý' | 'Lớp đông';
}

@Component({
  selector: 'app-advisor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule], // <--- THÊM FORMSMODULE VÀO ĐÂY
  templateUrl: './advisor-dashboard.component.html',
  styleUrls: ['./advisor-dashboard.component.css']
})
export class AdvisorDashboardComponent implements OnInit {
  
  // Thông tin giảng viên
  tenGiangVien: string = 'Giảng viên';
  maGiangVien: string | null = null;
  
  // Chọn học kỳ
  hocKyOptions: number[] = [1, 2, 3, 4, 5, 6, 7, 8]; // Danh sách học kỳ có thể chọn
  selectedHocKy: number = 1; // Mặc định HK 1

  // Thống kê
  stats = {
    totalStudents: 0,
    totalSubjects: 0,
    totalClasses: 0,
    problemClasses: 0
  };

  // Danh sách lớp hiển thị
  classesList: ClassSummary[] = [];
  isLoading = true;

  constructor(
    private authService: AuthService,
    private tkbService: ThoiKhoaBieuService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.maGiangVien = this.authService.getUserMaGV();
    this.tenGiangVien = this.authService.getUserName() || 'Quý Thầy/Cô';

    if (this.maGiangVien) {
      this.loadDashboardData(this.maGiangVien, this.selectedHocKy);
    } else {
      this.isLoading = false;
    }
  }

  // Hàm xử lý khi đổi học kỳ
  onHocKyChange() {
    if (this.maGiangVien) {
      this.loadDashboardData(this.maGiangVien, this.selectedHocKy);
    }
  }

  loadDashboardData(maGV: string, hocKy: number) {
    this.isLoading = true;
    
    // Reset lại dữ liệu cũ để tạo hiệu ứng loading rõ ràng
    this.stats = { totalStudents: 0, totalSubjects: 0, totalClasses: 0, problemClasses: 0 };
    this.classesList = [];

    // Gọi API với tham số học kỳ
    this.tkbService.getForLecturer(maGV, hocKy).pipe(
      catchError(err => {
        console.error('Lỗi tải dashboard:', err);
        this.cdr.detectChanges();
        return of({ data: [] });
      }),
      map((res: any) => {
        const rawData = res.data || [];
        
        // 1. Gom nhóm các lớp học phần (lọc trùng ma_lop_hp)
        const uniqueClassesMap = new Map<string, any>();

        rawData.forEach((item: any) => {
          if (item.ma_lop_hp && !uniqueClassesMap.has(item.ma_lop_hp)) {
            uniqueClassesMap.set(item.ma_lop_hp, item);
          }
        });

        const uniqueClasses = Array.from(uniqueClassesMap.values());

        // 2. Tính toán thống kê
        let studentCount = 0;
        const uniqueSubjects = new Set<string>();
        let problemCount = 0;

        const processedList: ClassSummary[] = uniqueClasses.map((lop: any) => {
          const soLuongSV = Array.isArray(lop.danh_sach_sv) ? lop.danh_sach_sv.length : 0;
          const tenHP = lop.ten_hoc_phan || lop.ten_hp || 'Không tên';
          
          // Cộng dồn thống kê
          studentCount += soLuongSV;
          if (lop.ma_hoc_phan) uniqueSubjects.add(lop.ma_hoc_phan);

          // Xác định trạng thái
          let status: 'Ổn định' | 'Cần chú ý' | 'Lớp đông' = 'Ổn định';
          if (soLuongSV < 7) {
            status = 'Cần chú ý'; // Ít sinh viên quá
            problemCount++;
          } else if (soLuongSV > 40) {
            status = 'Lớp đông';
          }

          return {
            ma_lop_hp: lop.ma_lop_hp,
            ten_hp: tenHP,
            so_sv: soLuongSV,
            phong: lop.phong || 'Chưa xếp',
            trang_thai: status
          };
        });

        return {
          stats: {
            totalStudents: studentCount,
            totalSubjects: uniqueSubjects.size,
            totalClasses: uniqueClasses.length,
            problemClasses: problemCount
          },
          list: processedList
        };
      })
    ).subscribe(result => {
      this.stats = result.stats;
      this.classesList = result.list;
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }
}