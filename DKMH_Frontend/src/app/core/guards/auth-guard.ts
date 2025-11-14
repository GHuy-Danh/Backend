// src/app/core/guards/auth.guard.ts

import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service'; // Đường dẫn đến AuthService của bạn

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Giả định AuthService có hàm isLoggedIn() để kiểm tra token
  if (authService.isLoggedIn()) {
    return true; // Cho phép truy cập
  } else {
    // Nếu chưa đăng nhập, chuyển hướng về trang login
    router.navigate(['/login']);
    return false;
  }
};
