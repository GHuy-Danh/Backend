// src/app/features/student/student.routes.ts
import { Routes } from '@angular/router';

// Lưu ý: Import các component từ thư mục features/student của bạn
export const STUDENT_ROUTES: Routes = [
  // URL: /student/dashboard
  { path: 'dashboard', loadComponent: () => import('./student-dashboard/student-dashboard.component').then(c => c.StudentDashboardComponent) },
  // URL: /student/register
  { path: 'register', loadComponent: () => import('./student-register/student-register.component').then(c => c.StudentRegisterComponent) },
  { path: 'timetable', loadComponent: () => import('./student-timetable/student-timetable.component').then(c => c.StudentTimetableComponent) },
  { path: 'notifications', loadComponent: () => import('./student-notifications/student-notifications.component').then(c => c.StudentNotificationsComponent) },
  { path: 'profile', loadComponent: () => import('./student-profile/student-profile.component').then(c => c.StudentProfileComponent) },
  { path: 'support', loadComponent: () => import('./student-support/student-support.component').then(c => c.StudentSupportComponent) },
  // Route mặc định khi truy cập /student
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, 
];