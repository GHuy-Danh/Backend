// src/app/features/advisor/advisor.routes.ts
import { Routes } from '@angular/router';

// Export hằng số Routes với tên ADVISOR_ROUTES
export const ADVISOR_ROUTES: Routes = [
  // URL: /advisor/dashboard
  { path: 'dashboard', loadComponent: () => import('./advisor-dashboard/advisor-dashboard.component').then(c => c.AdvisorDashboardComponent) },
  
  // URL: /advisor/students (Quản lý Sinh viên thuộc khoa/lớp cố vấn)
  { path: 'students', loadComponent: () => import('./advisor-students/advisor-students.component').then(c => c.AdvisorStudentsComponent) },
  
  // URL: /advisor/schedule (Thời khóa biểu của Cố vấn)
  { path: 'schedule', loadComponent: () => import('./advisor-schedule/advisor-schedule.component').then(c => c.AdvisorScheduleComponent) },
  
  // Đường dẫn mặc định khi truy cập /advisor
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, 
];