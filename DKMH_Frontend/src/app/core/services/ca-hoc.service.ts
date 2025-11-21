import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CaHocService {
  private apiUrl = 'http://localhost:3000/api/ca-hoc';

  constructor(private http: HttpClient) {}

  getAll() { return this.http.get<any>(this.apiUrl); }
  getById(id: string) { return this.http.get<any>(`${this.apiUrl}/${id}`); }
}
