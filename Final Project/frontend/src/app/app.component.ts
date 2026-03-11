import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecordListComponent } from './components/record-list/record-list.component';
import { RecordFormComponent } from './components/record-form/record-form.component';
import { HistoryViewComponent } from './components/history-view/history-view.component';
import { RecordItem } from './services/record.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RecordListComponent, RecordFormComponent, HistoryViewComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Time-Travel CRUD System';
  
  @ViewChild(RecordListComponent) recordList!: RecordListComponent;

  activeView: 'form' | 'history' = 'form';
  editingRecord: RecordItem | null = null;
  historyRecordId: string | null = null;

  onEdit(record: RecordItem) {
    this.editingRecord = record;
    this.activeView = 'form';
  }

  onViewHistory(recordId: string) {
    this.historyRecordId = recordId;
    this.activeView = 'history';
  }

  onSavedData() {
    this.editingRecord = null;
    this.recordList.loadRecords();
  }

  onCancelForm() {
    this.editingRecord = null;
  }

  onHistoryRollback() {
    this.recordList.loadRecords();
    this.historyRecordId = null;
    this.activeView = 'form';
  }

  closeHistory() {
    this.historyRecordId = null;
    this.activeView = 'form';
  }
}
