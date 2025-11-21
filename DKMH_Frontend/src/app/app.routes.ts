// DKMH_Frontend/src/app/app.routes.ts

import { Routes } from '@angular/router';

// --- 1. Import Layout Components ---
// 💡 AuthLayoutComponent đã được LOẠI BỎ
import { StudentLayoutComponent } from './layouts/student-layout/student-layout.component';
import { AdvisorLayoutComponent } from './layouts/advisor-layout/advisor-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

// --- 2. Import Guards (Bảo vệ Route) ---
// Giả định bạn đã tạo các functional guards trong thư mục 'core/guards'
//import { authGuard } from './core/guards/auth-guard'; 
//import { roleGuard } from './core/guards/role-guard'; 

export const routes: Routes = [
  
  // --- LUỒNG 1A: TRANG ĐĂNG NHẬP (Sử dụng loadComponent trực tiếp) ---
  // Trang này không cần layout bao bọc
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(c => c.LoginComponent)
  },
  
  // --- LUỒNG 1B: ĐƯỜNG DẪN GỐC ---
  // Đường dẫn mặc định ('') sẽ trỏ về trang đăng nhập
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  
  // -------------------------------------------------------------
  // --- CÁC LUỒNG ĐÃ BẢO MẬT (Dùng Layout và Guard) ---
  // -------------------------------------------------------------

  // --- LUỒNG 2: SINH VIÊN (/student) ---
  {
    path: 'student',
    component: StudentLayoutComponent, 
    //canActivate: [authGuard, roleGuard], 
    // 💡 Sửa tên vai trò theo MongoDB (hoặc chính xác theo payload JWT)
    data: { expectedRole: 'Sinh viên' }, 
    loadChildren: () => import('./features/student/student.routes').then(r => r.STUDENT_ROUTES) 
  },

  // --- LUỒNG 3: CỐ VẤN HỌC TẬP (/advisor) ---
  {
    path: 'advisor',
    component: AdvisorLayoutComponent, 
    //canActivate: [authGuard, roleGuard],
    // 💡 Sửa tên vai trò
    data: { expectedRole: 'Giảng viên' },
    loadChildren: () => import('./features/advisor/advisor.routes').then(r => r.ADVISOR_ROUTES) 
  },

  // --- LUỒNG 4: QUẢN TRỊ VIÊN (/admin) ---
  {
    path: 'admin',
    component: AdminLayoutComponent, 
    //canActivate: [authGuard, roleGuard],
    // 💡 Sửa tên vai trò
    data: { expectedRole: 'Quản trị viên' },
    loadChildren: () => import('./features/admin/admin.routes').then(r => r.ADMIN_ROUTES) 
  },

  // --- LUỒNG 5: XỬ LÝ LỖI (404) ---
  { path: '**', redirectTo: 'login' } 
];