import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StatisticsService {
  private apiUrl = 'http://localhost:3000/api/statistics';

  constructor(private http: HttpClient) {}

  getDashboardStats(hocKy: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard?hocKy=${hocKy}`);
  }

  getTopSubjects(hocKy: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/top-subjects?hocKy=${hocKy}`);
  }
}