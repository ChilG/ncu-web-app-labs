import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RecordItem {
  id: number;
  record_id: string;
  title: string;
  content: string;
  version: number;
  created_at: string;
  valid_to: string | null;
  is_deleted: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecordService {
  private apiUrl = 'http://localhost:3000/api/records'; // Using Docker mapped port or express default

  constructor(private http: HttpClient) { }

  getRecords(): Observable<RecordItem[]> {
    return this.http.get<RecordItem[]>(this.apiUrl);
  }

  getHistory(recordId: string): Observable<RecordItem[]> {
    return this.http.get<RecordItem[]>(`${this.apiUrl}/${recordId}/history`);
  }

  getRecordAtTime(recordId: string, timestamp: string): Observable<RecordItem> {
    return this.http.get<RecordItem>(`${this.apiUrl}/${recordId}/at-time?timestamp=${timestamp}`);
  }

  createRecord(record: { title: string, content: string }): Observable<RecordItem> {
    return this.http.post<RecordItem>(this.apiUrl, record);
  }

  updateRecord(recordId: string, record: { title: string, content: string }): Observable<RecordItem> {
    return this.http.put<RecordItem>(`${this.apiUrl}/${recordId}`, record);
  }

  rollback(recordId: string, version: number): Observable<{message: string, new_version: number, record: RecordItem}> {
    return this.http.post<{message: string, new_version: number, record: RecordItem}>(`${this.apiUrl}/${recordId}/rollback/${version}`, {});
  }

  deleteRecord(recordId: string): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.apiUrl}/${recordId}`);
  }
}
