import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogService } from '../../../core/services/log.service';

@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-logs.component.html',
  styleUrls: ['./admin-logs.component.css']
})
export class AdminLogsComponent implements OnInit {
  logs: any[] = [];
  filteredLogs: any[] = [];

  // Bộ lọc
  selectedDate: string = '';
  selectedRole: string = 'Tất cả';
  selectedAction: string = 'Tất cả';

  // Modal chi tiết
  isDetailModalOpen = false;
  selectedLog: any = null;

  // 🔹 Phân trang
  currentPage: number = 1;
  pageSize: number = 10;
  paginatedLogs: any[] = [];
  totalPages: number = 1;

  constructor(private logService: LogService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  // ✅ Lấy toàn bộ nhật ký
  loadLogs() {
    this.logService.getAllLogs().subscribe({
      next: (res) => {
        if (res.success) {
          this.logs = res.data || [];
          this.filteredLogs = this.logs;
          this.updatePagination();
        }
      },
      error: (err) => console.error('Lỗi khi tải nhật ký:', err)
    });
  }

  // ✅ Lọc dữ liệu
  applyFilter() {
    this.filteredLogs = this.logs.filter((log) => {
      const matchDate =
        !this.selectedDate || (log.thoi_gian && log.thoi_gian.startsWith(this.selectedDate));

      const role = this.getRoleFromUser(log.nguoi);
      const matchRole = this.selectedRole === 'Tất cả' || role === this.selectedRole;

      const matchAction =
        this.selectedAction === 'Tất cả' ||
        (log.hanh_dong && log.hanh_dong.toLowerCase().includes(this.selectedAction.toLowerCase()));

      return matchDate && matchRole && matchAction;
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  // ✅ Xác định vai trò
  getRoleFromUser(userId: string): string {
    if (!userId) return 'Không rõ';
    if (/^\d{10}$/.test(userId)) return 'Sinh viên';
    if (userId.startsWith('GV')) return 'Giảng viên';
    if (userId.startsWith('ADMIN')) return 'Quản trị viên';
    if (userId.toLowerCase() === 'Hệ thống') return 'Khác';
    return 'Khác';
  }

  // 🔹 Cập nhật phân trang
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredLogs.length / this.pageSize) || 1;
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedLogs = this.filteredLogs.slice(start, end);
  }

  // 🔹 Chuyển trang
  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  // ✅ Làm mới
  refresh() {
    this.selectedDate = '';
    this.selectedRole = 'Tất cả';
    this.selectedAction = 'Tất cả';
    this.filteredLogs = this.logs;
    this.currentPage = 1;
    this.updatePagination();
  }

  // ✅ Xóa toàn bộ nhật ký
  clearAllLogs() {
    if (confirm('Bạn có chắc muốn xóa toàn bộ nhật ký?')) {
      this.logService.deleteAllLogs().subscribe({
        next: () => this.loadLogs(),
        error: (err) => console.error('Lỗi khi xóa nhật ký:', err)
      });
    }
  }

  // ✅ Xóa 1 log
  deleteLog(id: string) {
    if (confirm(`Bạn có chắc muốn xóa log "${id}" không?`)) {
      this.logService.deleteLogById(id).subscribe({
        next: () => {
          this.logs = this.logs.filter((log) => log._id !== id);
          this.applyFilter();
        },
        error: (err) => console.error('Lỗi khi xóa log:', err)
      });
    }
  }

  // ✅ Modal chi tiết
  openDetailModal(log: any) {
    this.selectedLog = log;
    this.isDetailModalOpen = true;
  }

  closeDetailModal() {
    this.isDetailModalOpen = false;
    this.selectedLog = null;
  }

  formatTime(dateStr: string): string {
    return dateStr ? dateStr.replace('T', ' ').slice(0, 19) : '';
  }
}
