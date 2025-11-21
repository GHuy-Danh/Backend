import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThoiKhoaBieuService } from '../../../core/services/thoi-khoa-bieu.service';

// Định nghĩa interface cho Modal
interface UpdateFormModel {
  ma_lop_hp: string;
  ngay_hoc: string; // ISO date string
  trang_thai: string;
  ghi_chu?: string;
}
@Component({
  selector: 'app-admin-timetable',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './admin-timetable.component.html',
  styleUrls: ['./admin-timetable.component.css']
})
export class AdminTimetableComponent implements OnInit {
  
  // Danh sách học kỳ để chọn
  danhSachHocKy = [1, 2, 3];
  selectedHocKy = 1; // Mặc định học kỳ 1

  // Danh sách lịch học lấy từ API
  schedules: any[] = [];
  
  isLoading = false;
  message = '';

   // Logic Modal Cập nhật Trạng thái
  isUpdateStatusModalOpen = false;
  updateFormModel: UpdateFormModel = { 
    ma_lop_hp: '', 
    ngay_hoc: '', 
    trang_thai: '' 
  };

  // 1. Inject ChangeDetectorRef
  constructor(
    private tkbService: ThoiKhoaBieuService,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Load dữ liệu lần đầu
    this.loadSchedules();
  }

  // Khi thay đổi dropdown học kỳ
  onHocKyChange() {
    this.loadSchedules();
    this.cdr.detectChanges(); 
  }

  /**
   * Tải danh sách lịch học từ Server
   */
  loadSchedules() {
    this.isLoading = true;
    this.schedules = [];
    
    this.tkbService.getAll(this.selectedHocKy).subscribe({
      next: (res: any) => {
        // API trả về { success: true, data: [...] }
        const data = res.data || [];
        
        // Map thêm thuộc tính 'expanded' để dùng cho việc đóng/mở chi tiết trong HTML
        this.schedules = data.map((item: any) => ({
          ...item,
          expanded: item.expanded || false
        }));
        
        this.isLoading = false;
        // 2. Gọi detectChanges() sau khi cập nhật dữ liệu và tắt loading
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Lỗi tải lịch:', err);
        this.isLoading = false;
        alert('Lỗi: Không thể tải danh sách lịch học. Vui lòng kiểm tra API Backend.');
        // Đảm bảo cập nhật giao diện cả khi có lỗi
        this.cdr.detectChanges(); 
      }
    });
  }

  /**
   * Sinh lịch học tự động từ dữ liệu Lớp học phần
   */
  generate() {
    if (!confirm(`CẢNH BÁO: Hành động này sẽ XÓA toàn bộ lịch cũ của Học kỳ ${this.selectedHocKy} và tạo lại mới dựa trên các Lớp học phần hiện có. Bạn có chắc chắn không?`)) {
      return;
    }

    this.isLoading = true;
    this.tkbService.generate(this.selectedHocKy).subscribe({
      next: (res: any) => {
        alert(res.message || 'Tạo lịch thành công!');
        this.loadSchedules(); // Tải lại danh sách sau khi tạo xong
      },
      error: (err) => {
        console.error('Lỗi sinh lịch:', err);
        alert('Có lỗi xảy ra khi sinh lịch. Vui lòng kiểm tra console.');
        this.isLoading = false;
      }
    });
  }

    // ======================================
  // LOGIC MODAL CẬP NHẬT TRẠNG THÁI
  // ======================================
  
  openUpdateStatusModal(maLop: string, date: string, status: string) {
    this.updateFormModel = {
      ma_lop_hp: maLop,
      ngay_hoc: date,
      trang_thai: status,
      ghi_chu: '' // Reset ghi chú mỗi lần mở
    };
    this.isUpdateStatusModalOpen = true;
  }

  closeUpdateStatusModal() {
    this.isUpdateStatusModalOpen = false;
  }

  confirmUpdateStatus() {
    const { ma_lop_hp, ngay_hoc, trang_thai } = this.updateFormModel;

    // Gọi hàm updateStatus API
    this.tkbService.updateStatus(ma_lop_hp, ngay_hoc, trang_thai).subscribe({
      next: (res) => {
        alert('Cập nhật trạng thái thành công!');
        this.closeUpdateStatusModal();
        
        // Cập nhật lại giao diện (Client-side update)
        const lop = this.schedules.find(s => s.ma_lop_hp === ma_lop_hp);
        if (lop && lop.chi_tiet_buoi_hoc) {
           const buoi = lop.chi_tiet_buoi_hoc.find((b: any) => b.ngay_hoc === ngay_hoc);
           if (buoi) {
             buoi.trang_thai = trang_thai;
           }
        }
      },
      error: (err) => {
        console.error('Lỗi cập nhật:', err);
        alert('Không thể cập nhật trạng thái.');
        this.closeUpdateStatusModal();
      }
    });
  }

  /**
   * Cập nhật trạng thái buổi học (VD: Cho nghỉ, Học bù...)
   * @param maLop Mã lớp học phần
   * @param date Ngày học (string ISO format)
   * @param status Trạng thái mới ('Nghỉ', 'Bình thường', v.v.)
   */
  updateStatus(maLop: string, date: string, status: string) {
    if (!confirm(`Bạn muốn đổi trạng thái buổi học ngày ${new Date(date).toLocaleDateString()} thành "${status}"?`)) {
      return;
    }

    this.tkbService.updateStatus(maLop, date, status).subscribe({
      next: (res) => {
        alert('Cập nhật trạng thái thành công!');
        // Cập nhật lại giao diện ngay lập tức mà không cần reload lại API toàn bộ (Tối ưu UX)
        const lop = this.schedules.find(s => s.ma_lop_hp === maLop);
        if (lop && lop.chi_tiet_buoi_hoc) {
           // Tìm buổi học trong mảng chi tiết client để update
           // Lưu ý: so sánh ngày cần cẩn thận, ở đây so sánh chuỗi ISO là an toàn nhất
           const buoi = lop.chi_tiet_buoi_hoc.find((b: any) => b.ngay_hoc === date);
           if (buoi) {
             buoi.trang_thai = status;
           }
        }
      },
      error: (err) => {
        console.error('Lỗi cập nhật:', err);
        alert('Không thể cập nhật trạng thái.');
      }
    });
  }

  /**
   * Helper toggle expand/collapse
   */
  toggleExpand(item: any) {
    item.expanded = !item.expanded;
  }
}