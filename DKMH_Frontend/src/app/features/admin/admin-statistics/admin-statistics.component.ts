import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatisticsService } from '../../../core/services/statistics.service';
import * as XLSX from 'xlsx'; // Import thư viện Excel

@Component({
  selector: 'app-admin-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-statistics.component.html',
  styleUrls: ['./admin-statistics.component.css']
})
export class AdminStatisticsComponent implements OnInit {
  selectedHocKy = 1;
  
  // Dữ liệu Dashboard
  stats: any = {
    tong_so_lop: 0,
    lop_duoc_mo: 0,
    lop_se_huy: 0,
    tong_luot_dang_ky: 0,
    chi_tiet: []
  };

  // Dữ liệu Top môn học
  topSubjects: any[] = [];
  
  isLoading = false;

  constructor(private statsService: StatisticsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadData();
  }

  onHocKyChange() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    
    // Load Dashboard
    this.statsService.getDashboardStats(this.selectedHocKy).subscribe(res => {
      this.stats = res.data;
      this.isLoading = false;
      this.cdr.detectChanges();
    });

    // Load Top Subjects
    this.statsService.getTopSubjects(this.selectedHocKy).subscribe(res => {
      this.topSubjects = res.data;
      this.cdr.detectChanges();
    });
  }

  // Xuất báo cáo Excel
  exportExcel() {
    if (!this.stats.chi_tiet || this.stats.chi_tiet.length === 0) {
      alert('Không có dữ liệu để xuất.');
      return;
    }

    // Chuẩn bị dữ liệu cho Excel
    const dataToExport = this.stats.chi_tiet.map((item: any, index: number) => ({
      'STT': index + 1,
      'Mã Lớp HP': item.ma_lop_hp,
      'Tên Học Phần': item.ten_hoc_phan,
      'Sĩ Số Hiện Tại': item.si_so,
      'Sĩ Số Tối Thiểu': item.toi_thieu,
      'Sĩ Số Tối Đa': item.toi_da,
      'Trạng Thái': item.trang_thai
    }));

    // Tạo WorkSheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    
    // Tạo WorkBook
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `BaoCao_HK${this.selectedHocKy}`);

    // Xuất file
    const fileName = `BaoCao_ThongKe_HK${this.selectedHocKy}_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }
}