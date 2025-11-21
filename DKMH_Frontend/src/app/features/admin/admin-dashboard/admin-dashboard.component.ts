import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChartModule } from 'primeng/chart';
import { UserService } from '../../../core/services/user.service';
import { SubjectService } from '../../../core/services/subject.service';
import { LopHocPhanService } from '../../../core/services/lop-hoc-phan.service';
import { LogService } from '../../../core/services/log.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ChartModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  adminName = 'Quản trị viên';
  stats = {
    sinhVien: 0,
    giangVien: 0,
    quanTri: 0,
    monHoc: 0,
    lopHocPhan: 0
  };
  chartData: any;
  chartOptions: any;
  recentLogs: any[] = [];

  constructor(
    private userService: UserService,
    private subjectService: SubjectService,
    private lopHocPhanService: LopHocPhanService,
    private logService: LogService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentLogs();
  }

  /** ✅ Lấy dữ liệu thống kê tổng quan */
  loadStats(): void {
    // 1️⃣ Lấy danh sách người dùng
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        if (users && Array.isArray(users.data)) {
          const list = users.data;
          this.stats.sinhVien = list.filter((u: any) => u.loai === 'Sinh viên').length;
          this.stats.giangVien = list.filter((u: any) => u.loai === 'Giảng viên').length;
          this.stats.quanTri = list.filter((u: any) => u.loai === 'Quản trị viên').length;

        }
        this.cdr.detectChanges();
        this.updateChart();
      },
      error: (err) => console.error('Lỗi khi tải người dùng:', err)
    });

    // 2️⃣ Lấy danh sách môn học
    this.subjectService.getAllSubjects().subscribe({
      next: (data) => {
        if (data && Array.isArray(data)) {
          this.stats.monHoc = data.length;
        }
        this.cdr.detectChanges();
        this.updateChart();
      },
      error: (err) => console.error('Lỗi khi tải môn học:', err)
    });

    this.lopHocPhanService.getAll().subscribe({
  next: (data) => {
    console.log('LHP trả về:', data);

    if (Array.isArray(data)) {
      this.stats.lopHocPhan = data.length;
    }
    else if (data && Array.isArray(data.data)) {
      this.stats.lopHocPhan = data.data.length;
    }
    else {
      console.warn('⚠️ Dữ liệu LHP không phải dạng mảng:', data);
    }
    this.cdr.detectChanges();
    this.updateChart();
  },
  error: (err) => console.error('Lỗi khi tải lớp học phần:', err)
});
  }

  /** ✅ Cập nhật biểu đồ */
  updateChart(): void {
    this.chartData = {
      labels: ['Sinh viên', 'Giảng viên', 'Quản trị viên', 'Môn học', 'Lớp học phần'],
      datasets: [
        {
          label: 'Số lượng',
          backgroundColor: ['#64b5f6', '#81c784', '#e41b1bff', '#ffb74d', '#ba68c8'],
          data: [
            this.stats.sinhVien,
            this.stats.giangVien,
            this.stats.quanTri,
            this.stats.monHoc,
            this.stats.lopHocPhan
          ]
        }
      ]
    };
    this.cdr.detectChanges();

    this.chartOptions = {
      plugins: {
        legend: { labels: { color: '#0d47a1' } }
      },
      scales: {
        x: { ticks: { color: '#0d47a1' }, grid: { color: '#e3f2fd' } },
        y: { ticks: { color: '#0d47a1' }, grid: { color: '#e3f2fd' } }
      }
    };
  }

  /** ✅ Lấy hoạt động gần đây */
  loadRecentLogs(): void {
    this.logService.getAllLogs().subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data)) {
          this.recentLogs = res.data.slice(0, 6);
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Lỗi khi tải hoạt động gần đây:', err)
    });
    this.cdr.detectChanges();
  }
}
