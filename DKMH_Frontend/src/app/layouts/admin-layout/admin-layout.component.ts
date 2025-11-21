import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule], // Cần imports cho router-outlet và routerLink
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  adminName: string = 'Đang tải...'; 

  // Inject AuthService
  constructor(private authService: AuthService) {} 

  ngOnInit(): void {
    // Lấy tên người dùng sau khi component được khởi tạo
    // (Bạn sẽ cần thêm hàm getUserName() vào AuthService)
    this.adminName = this.authService.getUserName() || 'Nguyễn Văn B'; 
  }

  // KHAI BÁO HÀM logout() (Khắc phục lỗi TS2339 cho 'logout')
  logout(): void {
    this.authService.logout();
  }

}
