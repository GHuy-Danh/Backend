import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { ThoiKhoaBieuService } from '../../../core/services/thoi-khoa-bieu.service';
import { forkJoin, map, of, catchError } from 'rxjs';

// Định nghĩa interface hiển thị
export interface StudentDisplayData {
  _id: string;
  ma_sv: string;
  ho_ten: string;
  email: string;
  ngay_sinh: any;
  lop: string; // Lớp hành chính
  nganh: string;
  trang_thai_hoc_tap: string;
  // Danh sách các lớp HP mà SV này học với GV (để lọc)
  associated_ma_lop_hp: string[];
}

@Component({
  selector: 'app-advisor-students',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './advisor-students.component.html',
  styleUrls: ['./advisor-students.component.css']
})
export class AdvisorStudentsComponent implements OnInit {
  maGiangVien: string | null = null;
  tenGiangVien: string = 'Giảng viên';

  // Dữ liệu
  classOptions: string[] = []; 
  allStudents: StudentDisplayData[] = []; 
  filteredStudents: StudentDisplayData[] = [];

  // Biến trạng thái
  isLoading: boolean = true;
  errorMessage: string | null = null;

  // Biến lọc
  selectedClass: string = 'Tất cả lớp';
  searchQuery: string = '';
  
  // Modal
  showStudentModal: boolean = false;
  selectedStudent: StudentDisplayData | null = null;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private tkbService: ThoiKhoaBieuService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.maGiangVien = this.authService.getUserMaGV();
    this.tenGiangVien = this.authService.getUserName() || 'Giảng viên';
    
    if (this.maGiangVien) {
      this.loadData(this.maGiangVien);
    } else {
      this.errorMessage = 'Không tìm thấy thông tin Giảng Viên. Vui lòng đăng nhập lại.';
      this.isLoading = false;
    }
  }

  loadData(maGV: string): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Sử dụng forkJoin để chạy song song:
    // 1. Lấy TKB giảng viên (để biết dạy lớp nào, sv nào)
    // 2. Lấy Toàn bộ User (để map thông tin chi tiết theo MSSV)
    forkJoin({
      tkbData: this.tkbService.getForLecturer(maGV, 1).pipe( // HK1 mặc định
        catchError(err => {
          console.error('Lỗi lấy TKB:', err);
          return of({ data: [] });
        })
      ),
      allUsers: this.userService.getAllUsers().pipe(
        catchError(err => {
          console.error('Lỗi lấy danh sách User:', err);
          return of({ data: [] });
        })
      )
    }).subscribe({
      next: (res: any) => {
        const tkbList = res.tkbData?.data || [];
        const usersList = res.allUsers?.data || [];

        if (tkbList.length === 0) {
          this.isLoading = false;
          this.errorMessage = 'Chưa có lịch dạy nào được phân công.';
          return;
        }

        // B1: Xử lý TKB để lấy danh sách lớp HP và Map quan hệ MSSV -> Lớp HP
        const uniqueClassesSet = new Set<string>();
        const studentLhpMap = new Map<string, string[]>(); // Key: MSSV, Value: [Mã LHP]

        tkbList.forEach((lop: any) => {
          const maLopHP = lop.ma_lop_hp;
          if (maLopHP) uniqueClassesSet.add(maLopHP);

          if (lop.danh_sach_sv && Array.isArray(lop.danh_sach_sv)) {
            lop.danh_sach_sv.forEach((mssv: string) => {
              if (!mssv) return;
              
              const currentClasses = studentLhpMap.get(mssv) || [];
              if (!currentClasses.includes(maLopHP)) {
                currentClasses.push(maLopHP);
              }
              studentLhpMap.set(mssv, currentClasses);
            });
          }
        });

        this.classOptions = ['Tất cả lớp', ...Array.from(uniqueClassesSet)];

        // B2: Lọc danh sách User để chỉ lấy những SV có trong studentLhpMap
        const validStudents: StudentDisplayData[] = [];

        usersList.forEach((u: any) => {
          // Kiểm tra xem user này có phải là SV trong danh sách của GV không (dựa vào MSSV)
          // Cần đảm bảo u.ma_sv tồn tại và có trong Map
          if (u.ma_sv && studentLhpMap.has(u.ma_sv)) {
            validStudents.push({
              _id: u._id,
              ma_sv: u.ma_sv,
              ho_ten: u.ho_ten || 'Chưa cập nhật tên',
              email: u.email || '-',
              ngay_sinh: u.ngay_sinh,
              lop: u.lop || 'Chưa cập nhật', // Lớp hành chính
              nganh: u.nganh || u.nganh_hoc || 'Chưa cập nhật',
              trang_thai_hoc_tap: u.trang_thai || 'Đang học',
              // Gắn danh sách LHP vào SV để lọc
              associated_ma_lop_hp: studentLhpMap.get(u.ma_sv) || [] 
            });
          }
        });

        this.allStudents = validStudents;
        this.filteredStudents = validStudents;
        this.isLoading = false;
        this.cdr.detectChanges();
        // Gọi filter lần đầu
        this.applyFilters();
      },
      error: (err) => {
        console.error('Lỗi tải dữ liệu Advisor Students:', err);
        this.errorMessage = 'Có lỗi xảy ra khi tải dữ liệu.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ===== LOGIC LỌC DỮ LIỆU =====

  applyFilters(): void {
    let temp = [...this.allStudents];

    // 1. Lọc theo Lớp Học Phần (từ dropdown)
    if (this.selectedClass !== 'Tất cả lớp') {
      temp = temp.filter(s => s.associated_ma_lop_hp.includes(this.selectedClass));
    }

    // 2. Lọc theo từ khóa tìm kiếm (Tên hoặc MSSV)
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      temp = temp.filter(s => 
        (s.ho_ten && s.ho_ten.toLowerCase().includes(query)) || 
        (s.ma_sv && s.ma_sv.toLowerCase().includes(query))
      );
    }

    this.filteredStudents = temp;
    this.cdr.detectChanges();
  }

  onClassChange(newVal: string): void {
    this.selectedClass = newVal;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }
  
  onSearchClick(): void {
    this.applyFilters();
  }

  // ===== MODAL =====

  viewStudentDetail(student: StudentDisplayData): void {
    this.selectedStudent = student;
    this.showStudentModal = true;
  }

  closeModal(): void {
    this.showStudentModal = false;
    this.selectedStudent = null;
  }
}