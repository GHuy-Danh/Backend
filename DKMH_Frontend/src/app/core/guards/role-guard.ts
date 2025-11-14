// src/app/core/guards/role.guard.ts

import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Lấy vai trò yêu cầu từ route (ví dụ: 'Admin')
  const expectedRole = route.data['expectedRole'];

  // 2. Lấy vai trò hiện tại của người dùng (Giả định AuthService có hàm này)
  const currentUserRole = authService.getUserRole(); 

  // 3. So sánh
  if (currentUserRole && currentUserRole === expectedRole) {
    return true; // Đúng vai trò, cho phép truy cập
  } else {
    // Nếu sai vai trò, chuyển hướng đến trang không có quyền (hoặc dashboard)
    // Hoặc sử dụng alert để thông báo
    alert('Bạn không có quyền truy cập vào trang này!');
    router.navigate(['/dashboard']); // Chuyển về dashboard của vai trò đó
    return false;
  }
};