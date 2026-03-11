import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecordService, RecordItem } from '../../services/record.service';

@Component({
  selector: 'app-history-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history-view.component.html',
  styleUrls: ['./history-view.component.css']
})
export class HistoryViewComponent implements OnChanges {
  @Input() recordId: string | null = null;
  @Output() rollbackComplete = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  history: RecordItem[] = [];
  isLoading = false;

  constructor(private recordService: RecordService) {}

  ngOnChanges() {
    if (this.recordId) {
      this.loadHistory();
    }
  }

  loadHistory() {
    if (!this.recordId) return;
    this.isLoading = true;
    this.recordService.getHistory(this.recordId).subscribe({
      next: (data) => {
        this.history = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  rollback(version: number) {
    if (!this.recordId) return;
    if (confirm(`Are you sure you want to duplicate version ${version} as the newest state?`)) {
      this.recordService.rollback(this.recordId, version).subscribe({
        next: () => {
          this.rollbackComplete.emit();
        },
        error: (err) => console.error(err)
      });
    }
  }
}
