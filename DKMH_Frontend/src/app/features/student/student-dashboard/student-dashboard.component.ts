import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ChartModule } from 'primeng/chart';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { DangKyService } from '../../../core/services/dang-ky.service';
import { ThoiKhoaBieuService } from '../../../core/services/thoi-khoa-bieu.service';
import { LopHocPhanService } from '../../../core/services/lop-hoc-phan.service';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, ChartModule],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit {
  student: any = null;
  loadingProfile = true;

  // quick actions
  actions = [
    { title: 'Đăng ký học phần', icon: '📝', route: '/student/register', color: '#4caf50' },
    { title: 'Lịch theo tuần', icon: '📅', route: '/student/timetable', color: '#2196f3' }
  ];

  // credits
  totalCreditsAll = null as number | null;
  registeredCredits = null as number | null;
  creditsLoading = true;

  // registered classes
  registeredClasses: any[] = [];
  regLoading = true;

  // progress donut
  donutData: any;
  donutOptions: any;

  // small stats
  stats = {
    so_lop_dang_ky: 0
  };

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private dangKyService: DangKyService,
    private tkbService: ThoiKhoaBieuService,
    private lhpService: LopHocPhanService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll() {
    const id = this.authService.getUserId();
    
    if (!id) return;

    this.loadingProfile = true;
    this.creditsLoading = true;
    this.regLoading = true;

    const profile$ = this.userService.getProfile(id).pipe(catchError(err => {
      console.error('Lỗi load profile', err);
      return of(null);
    }));

    // APIs for credits
    const regCredits$ = this.userService.getRegisteredCredits
      ? this.userService.getRegisteredCredits(id).pipe(catchError(() => of({ success: false })))
      : of({ success: false });

    const allCredits$ = this.userService.getAllCredits
      ? this.userService.getAllCredits().pipe(catchError(() => of({ success: false })))
      : of({ success: false });

    // registered classes list
    const regs$ = this.dangKyService.getBySinhVien(id).pipe(catchError(() => of([])));

    forkJoin({
      profile: profile$,
      regCredits: regCredits$,
      allCredits: allCredits$,
      regs: regs$
    }).subscribe((res: any) => {
      // profile
      this.student = res.profile?.data || res.profile || null;
      const realId = this.student?.ma_sv;
      if (!realId) return;

      this.userService.getRegisteredCredits(realId).subscribe(r => {
        this.registeredCredits = r?.data ?? null;
        this.updateDonut();
        this.cdr.detectChanges();
      });
      this.loadingProfile = false;

      // --- FIX: unwrap các lớp data ---
      const rawReg = res.regCredits;

      // TH1: Trả về { success: true, data: 13 }
      if (rawReg?.success && typeof rawReg.data === 'number') {
        this.registeredCredits = rawReg.data;
      }
      // TH2: Trả về { data: { success: true, data: 13 } }
      else if (rawReg?.data?.success && typeof rawReg.data.data === 'number') {
        this.registeredCredits = rawReg.data.data;
      }
      // fallback
      else {
        this.registeredCredits = null;
      }


      const rawTotal = res.allCredits;

      if (rawTotal?.success && typeof rawTotal.data === 'number') {
        this.totalCreditsAll = rawTotal.data;
      }
      else if (rawTotal?.data?.success && typeof rawTotal.data.data === 'number') {
        this.totalCreditsAll = rawTotal.data.data;
      }
      else {
        this.totalCreditsAll = null;
      }

      this.creditsLoading = false;

      // registered classes
      this.registeredClasses = Array.isArray(res.regs?.data) ? res.regs.data : (Array.isArray(res.regs) ? res.regs : []);
      this.stats.so_lop_dang_ky = this.registeredClasses.length;
      this.regLoading = false;

      this.updateDonut();
      this.cdr.detectChanges();
    }, err => {
      console.error('Lỗi load dashboard:', err);
      this.loadingProfile = this.creditsLoading = this.regLoading = false;
    });
  }

  updateDonut() {
    const have = this.registeredCredits ?? 0;
    const total = this.totalCreditsAll ?? 100; // fallback
    const remaining = Math.max(total - have, 0);

    if (this.registeredCredits === null || this.totalCreditsAll === null) {
      // show placeholder
      this.donutData = {
        labels: ['Đã đạt', 'Còn lại'],
        datasets: [{ data: [0, 1], backgroundColor: ['#4caf50', '#f0f0f0'] }]
      };
    } else {
      this.donutData = {
        labels: ['Đã đạt', 'Còn lại'],
        datasets: [{ data: [have, remaining], backgroundColor: ['#4caf50', '#e0e0e0'] }]
      };
    }

    this.donutOptions = {
    cutout: '72%',
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: { display: false }
    }
  };

  }

  goTo(route: string) {
    this.router.navigateByUrl(route);
  }

  // small helper to format date/time
  formatDate(input: any) {
    if (!input) return '-';
    const d = new Date(input);
    return d.toLocaleDateString();
  }
}
