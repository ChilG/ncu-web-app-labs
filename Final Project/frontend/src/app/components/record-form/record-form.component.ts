import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RecordService, RecordItem } from '../../services/record.service';

@Component({
  selector: 'app-record-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './record-form.component.html',
  styleUrls: ['./record-form.component.css']
})
export class RecordFormComponent implements OnChanges {
  @Input() editRecord: RecordItem | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();

  recordForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private recordService: RecordService) {
    this.recordForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', Validators.required]
    });
  }

  ngOnChanges() {
    if (this.editRecord) {
      this.recordForm.patchValue({
        title: this.editRecord.title,
        content: this.editRecord.content
      });
    } else {
      this.recordForm.reset();
    }
  }

  onSubmit() {
    if (this.recordForm.invalid) return;

    this.isSubmitting = true;
    const formValue = this.recordForm.value;

    if (this.editRecord) {
      this.recordService.updateRecord(this.editRecord.record_id, formValue).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.saved.emit();
          this.recordForm.reset();
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
        }
      });
    } else {
      this.recordService.createRecord(formValue).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.saved.emit();
          this.recordForm.reset();
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel() {
    this.recordForm.reset();
    this.canceled.emit();
  }
}
