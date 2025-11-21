import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThoiKhoaBieuService } from '../../../core/services/thoi-khoa-bieu.service';
import { AuthService } from '../../../core/services/auth.service';

// Khai báo cấu trúc dữ liệu cho một buổi học (dạng phẳng cho bảng chi tiết)
interface ScheduleItem {
  ten_hp: string;
  ma_lop_hp: string;
  tiet_bat_dau: number;
  tiet_ket_thuc: number;
  phong: string;
  ten_gv: string;
  trang_thai: string; 
  loai_phong: 'theory' | 'lab' | 'online' | 'exam' | 'off'; 
  ngay_hoc: string; // Định dạng YYYY-MM-DD
  thu_hoc: string; // T2, T3, ...
}

@Component({
  selector: 'app-advisor-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe], 
  templateUrl: './advisor-schedule.component.html',
  styleUrls: ['./advisor-schedule.component.css']
})
export class AdvisorScheduleComponent implements OnInit {
  
  maGiangVien: string | null = null; 
  tenGiangVien: string | null = null; // Tên GV hiện tại (tạm thời)
  hocKyHienTai = 1; // Giả định học kỳ 1

  isLoading = true;
  errorMessage = '';

  currentDate: Date = new Date(); 
  weekDays: Date[] = [];
  
  // Dữ liệu lịch học đã lọc và sắp xếp cho bảng chi tiết
  filteredSchedule: ScheduleItem[] = [];

  // Danh sách tên các ngày trong tuần (CN là 0, T2 là 1, ..., T7 là 6)
  dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  // Danh sách các ngày trong tuần (Thứ 2 đến Chủ nhật, dùng để sắp xếp)
  dayOrder: { [key: string]: number } = {
    'T2': 1, 'T3': 2, 'T4': 3, 'T5': 4, 'T6': 5, 'T7': 6, 'CN': 7
  };
  
  constructor(
    private tkbService: ThoiKhoaBieuService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    // Giả định lấy mã GV từ AuthService
    this.maGiangVien = this.authService.getUserMaGV(); 
    this.tenGiangVien = this.authService.getUserName();
    
    if (!this.maGiangVien) {
        this.errorMessage = 'Không tìm thấy Mã Giảng viên. Vui lòng đăng nhập lại.';
        this.isLoading = false;
        return;
    }
    
    // Khởi tạo tuần hiện tại là đầu tuần chứa ngày hôm nay
    this.currentDate = this.getStartOfWeek(new Date()); 
    this.calculateWeekDays();
    this.loadLecturerSchedule();
  }
  
  // ======================================
  // LOGIC XỬ LÝ NGÀY/TUẦN (Lấy từ student-timetable)
  // ======================================
  
  getStartOfWeek(date: Date): Date {
    const day = date.getDay(); 
    // day === 0 (CN) -> diff = date.getDate() - 6. day > 0 (T2->T7) -> diff = date.getDate() - (day - 1)
    const diff = date.getDate() - (day === 0 ? 6 : day - 1); 
    
    const startOfWeek = new Date(date); 
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0); 
    return startOfWeek;
  }
  
  calculateWeekDays() {
    this.weekDays = [];
    let currentDay = new Date(this.currentDate);
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentDay);
      this.weekDays.push(day);
      currentDay.setDate(currentDay.getDate() + 1);
    }
  }

  changeWeek(offset: number) {
    const newDate = new Date(this.currentDate);
    newDate.setDate(newDate.getDate() + offset);
    
    this.currentDate = this.getStartOfWeek(newDate); 
    this.calculateWeekDays();
    this.loadLecturerSchedule();
  }
  
  onDateChange(dateString: string) {
    if (!dateString) return;
    
    const selectedDate = new Date(dateString);
    
    if (!isNaN(selectedDate.getTime())) {
        this.currentDate = this.getStartOfWeek(selectedDate);
        this.calculateWeekDays();
        this.loadLecturerSchedule();
    }
  }
  
  // Helper: Chuyển ngày Date sang định dạng dd/MM - dd/MM
  getWeekRange(): string {
    if (this.weekDays.length === 0) return '';
    const start = this.weekDays[0];
    const end = this.weekDays[6];
    
    const format = (date: Date) => {
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${d}/${m}`;
    };
    
    return `${format(start)} - ${format(end)}`;
  }

  // Helper: Lấy số tiết bắt đầu từ chuỗi tiết (vd: 'Tiết 1')
  extractTietNumber(tietStr: string): number {
    if (!tietStr) return 0;
    const match = tietStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  // ======================================
  // LOGIC XỬ LÝ API VÀ DATA
  // ======================================

  loadLecturerSchedule() {
    if (!this.maGiangVien) {
        this.errorMessage = 'Không tìm thấy Mã Giảng viên.';
        this.isLoading = false;
        this.cdr.detectChanges();
        return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    this.filteredSchedule = [];
    
    // Sử dụng API lấy lịch cho Giảng viên
    this.tkbService.getForLecturer(this.maGiangVien, this.hocKyHienTai).subscribe({
      next: (res: any) => {
        const scheduleData = res.data || [];
        this.processScheduleData(scheduleData);
        this.isLoading = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Lỗi tải lịch giảng viên:', err);
        this.errorMessage = 'Không thể tải lịch dạy. Vui lòng kiểm tra kết nối API.';
        this.isLoading = false;
        this.cdr.detectChanges(); 
      }
    });
  }

  /**
   * Xác định loại học (Theory/Lab/Online)
   */
  determineClassType(lopHp: any): 'theory' | 'lab' | 'online' {
    const tietBatDau = this.extractTietNumber(lopHp.ca_dau);
    const tietKetThuc = this.extractTietNumber(lopHp.ca_cuoi);
    const totalTiets = tietKetThuc - tietBatDau + 1;

    // Ưu tiên kiểm tra Online
    const phongHoc = lopHp.phong || '';
    const lowerRoom = phongHoc.toLowerCase();
    if (lowerRoom.includes('zoom') || lowerRoom.includes('online') || lowerRoom.includes('trực tuyến')) {
        return 'online';
    }

    // Xác định theo số tiết (giả định: 3 tiết là LT, 5 tiết là TH)
    if (totalTiets >= 5) {
        return 'lab';
    }
    
    // Mặc định là Lý thuyết (hoặc 3 tiết)
    return 'theory';
  }

  /**
   * Xử lý dữ liệu API thô, lọc theo tuần và sắp xếp vào mảng phẳng ScheduleItem
   */
  processScheduleData(rawData: any[]) {
    const scheduleItems: ScheduleItem[] = [];
    
    // Chuẩn hóa giới hạn tuần
    const weekStart = this.weekDays[0].getTime();
    const weekEnd = new Date(this.weekDays[6]);
    weekEnd.setHours(23, 59, 59, 999); 
    const weekEndTime = weekEnd.getTime(); 

    // Lặp qua dữ liệu lớp học phần
    rawData.forEach(lopHp => {
      if (!lopHp.chi_tiet_buoi_hoc) return; 
      
      const tietBatDau = this.extractTietNumber(lopHp.ca_dau);
      const tietKetThuc = this.extractTietNumber(lopHp.ca_cuoi);
      const loaiPhong = this.determineClassType(lopHp);

      // Lấy Tên Giảng Viên (chắc chắn phải có trong dữ liệu này)
      let tenGV = lopHp.ten_giang_vien || (lopHp.giang_vien && lopHp.giang_vien.ho_ten) || lopHp.ma_gv || 'N/A';

      lopHp.chi_tiet_buoi_hoc
      .forEach((buoi: any) => {
          if (!buoi.ngay_hoc) return;
          
          const ngayHocStr = buoi.ngay_hoc.substring(0, 10); 
          const ngayHoc = new Date(ngayHocStr); 
          ngayHoc.setHours(0, 0, 0, 0); 
          const ngayHocTime = ngayHoc.getTime();

          // Lọc theo tuần hiện tại
          if (ngayHocTime >= weekStart && ngayHocTime <= weekEndTime) {
              
              const dayIndex = ngayHoc.getDay(); 
              const dayName = this.dayNames[dayIndex];
              
              const trangThai = buoi.trang_thai || 'Bình thường';
              
              let finalLoaiPhong: 'theory' | 'lab' | 'online' | 'exam' | 'off' = loaiPhong;

              if (trangThai === 'Lịch thi') {
                finalLoaiPhong = 'exam';
              } else if (trangThai === 'Nghỉ') {
                finalLoaiPhong = 'off';
              } 
              // Ghi chú
              let ghiChu = finalLoaiPhong === 'theory' ? 'Lý thuyết' : 
                           finalLoaiPhong === 'lab' ? 'Thực hành' :
                           finalLoaiPhong === 'online' ? 'Trực tuyến' :
                           trangThai; // Sử dụng trạng thái nếu là Nghỉ/Thi

              const scheduleItem: ScheduleItem = {
                  ten_hp: lopHp.ten_hoc_phan,
                  ma_lop_hp: lopHp.ma_lop_hp,
                  tiet_bat_dau: tietBatDau,
                  tiet_ket_thuc: tietKetThuc, 
                  phong: lopHp.phong || 'N/A',
                  ten_gv: tenGV, 
                  trang_thai: ghiChu,
                  loai_phong: finalLoaiPhong,
                  ngay_hoc: ngayHocStr,
                  thu_hoc: dayName
              };
              
              scheduleItems.push(scheduleItem);
          }
      });
    });
    
    // Sắp xếp: Ưu tiên theo Thứ (T2->CN), sau đó theo tiết bắt đầu
    this.filteredSchedule = scheduleItems.sort((a, b) => {
        const dayA = this.dayOrder[a.thu_hoc];
        const dayB = this.dayOrder[b.thu_hoc];
        
        if (dayA !== dayB) {
            return dayA - dayB;
        }
        return a.tiet_bat_dau - b.tiet_bat_dau;
    });

    if (this.filteredSchedule.length === 0) {
        this.errorMessage = 'Không có lịch dạy nào trong tuần này.';
    }
  }
}