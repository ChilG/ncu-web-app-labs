import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecordService, RecordItem } from '../../services/record.service';

@Component({
  selector: 'app-record-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './record-list.component.html',
  styleUrls: ['./record-list.component.css']
})
export class RecordListComponent implements OnInit {
  @Output() editRecord = new EventEmitter<RecordItem>();
  @Output() viewHistory = new EventEmitter<string>();

  records: RecordItem[] = [];

  constructor(private recordService: RecordService) {}

  ngOnInit() {
    this.loadRecords();
  }

  loadRecords() {
    this.recordService.getRecords().subscribe({
      next: (data) => this.records = data,
      error: (err) => console.error(err)
    });
  }

  deleteRecord(id: string) {
    if (confirm('Are you sure you want to delete this record? it will remain in history.')) {
      this.recordService.deleteRecord(id).subscribe({
        next: () => this.loadRecords(),
        error: (err) => console.error(err)
      });
    }
  }
}
