// src/app/features/admin/admin.routes.ts
import { Routes } from '@angular/router';

// Export hằng số Routes với tên ADMIN_ROUTES
export const ADMIN_ROUTES: Routes = [
  // URL: /admin/dashboard
  { path: 'dashboard', loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(c => c.AdminDashboardComponent) },
  
  // URL: /admin/subjects
  { path: 'subjects', loadComponent: () => import('./admin-subjects/admin-subjects.component').then(c => c.AdminSubjectsComponent) },
  
  // URL: /admin/timetable
  { path: 'timetable', loadComponent: () => import('./admin-timetable/admin-timetable.component').then(c => c.AdminTimetableComponent) },
  
  // URL: /admin/classes
  { path: 'classes', loadComponent: () => import('./admin-classes/admin-classes.component').then(c => c.AdminClassesComponent) },
  
  // URL: /admin/teachers
  { path: 'teachers', loadComponent: () => import('./admin-teachers/admin-teachers.component').then(c => c.AdminTeachersComponent) },
  
  // URL: /admin/statistics
  { path: 'statistics', loadComponent: () => import('./admin-statistics/admin-statistics.component').then(c => c.AdminStatisticsComponent) },
  
  // URL: /admin/logs (Quản lý nhật ký hoạt động)
  { path: 'logs', loadComponent: () => import('./admin-logs/admin-logs.component').then(c => c.AdminLogsComponent) },
  { path: 'users', loadComponent: () => import('./admin-users/admin-users.component').then(c=>c.AdminUsersComponent)},
  // Đường dẫn mặc định khi truy cập /admin
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];