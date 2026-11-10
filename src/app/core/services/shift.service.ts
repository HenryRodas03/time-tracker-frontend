import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, ShiftStatusData, Worker, WorkShift } from '../models/shift.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ShiftService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getStatus(code: string): Observable<ApiResponse<ShiftStatusData>> {
    return this.http.get<ApiResponse<ShiftStatusData>>(`${this.apiUrl}/shifts/status/${encodeURIComponent(code)}`);
  }

  getWorkers(): Observable<ApiResponse<Worker[]>> {
    return this.http.get<ApiResponse<Worker[]>>(`${this.apiUrl}/workers`);
  }

  startShift(code: string): Observable<ApiResponse<WorkShift>> {
    return this.http.post<ApiResponse<WorkShift>>(`${this.apiUrl}/shifts/start`, { code });
  }

  endShift(code: string): Observable<ApiResponse<WorkShift>> {
    return this.http.post<ApiResponse<WorkShift>>(`${this.apiUrl}/shifts/end`, { code });
  }

  getHistory(code: string): Observable<ApiResponse<WorkShift[]>> {
    return this.http.get<ApiResponse<WorkShift[]>>(`${this.apiUrl}/shifts/history/${encodeURIComponent(code)}`);
  }
}

