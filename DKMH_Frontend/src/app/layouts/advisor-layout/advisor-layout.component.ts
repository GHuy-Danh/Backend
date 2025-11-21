import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
@Component({
  selector: 'app-advisor-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule], // Cần imports cho router-outlet và routerLink
  templateUrl: './advisor-layout.component.html',
  styleUrl: './advisor-layout.component.css'
})
export class AdvisorLayoutComponent {
  constructor(private authService: AuthService) {} 
  logout(): void {
      this.authService.logout();
    }
}
