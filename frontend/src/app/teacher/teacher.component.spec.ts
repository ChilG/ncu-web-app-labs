import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeacherComponent } from './teacher.component';
import { TeacherService } from './teacher.service';
import { UploadService } from '../services/upload/upload.service';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';

describe('TeacherComponent', () => {
  let component: TeacherComponent;
  let fixture: ComponentFixture<TeacherComponent>;
  let mockTeacherService: jasmine.SpyObj<TeacherService>;
  let mockUploadService: jasmine.SpyObj<UploadService>;

  beforeEach(async () => {
    mockTeacherService = jasmine.createSpyObj('TeacherService', ['getTeachers', 'addTeacher', 'updateTeacher', 'deleteTeacher']);
    mockTeacherService.getTeachers.and.returnValue(of([{ id: '1', name: 'Test', department: 'CS', picture: '', username: 'testuser' }]));

    mockUploadService = jasmine.createSpyObj('UploadService', ['uploadFile']);

    await TestBed.configureTestingModule({
      imports: [TeacherComponent, ReactiveFormsModule],
      providers: [
        { provide: TeacherService, useValue: mockTeacherService },
        { provide: UploadService, useValue: mockUploadService }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load teachers on init', () => {
    expect(mockTeacherService.getTeachers).toHaveBeenCalled();
    expect(component.teachers.length).toBe(1);
    expect(component.teachers[0].name).toBe('Test');
  });

  it('should open dialog for adding a new teacher', () => {
    component.openDialog();
    expect(component.isEditMode).toBeFalse();
    expect(component.showAddModal).toBeTrue();
    expect(component.teacherForm.get('id')?.enabled).toBeTrue();
  });

  it('should open dialog for editing an existing teacher', () => {
    const teacher = { id: '2', name: 'Mock', department: 'Math', picture: '', username: 'mocku' };
    component.openDialog(teacher);
    expect(component.isEditMode).toBeTrue();
    expect(component.showAddModal).toBeTrue();
    expect(component.teacherForm.get('name')?.value).toBe('Mock');
  });

  it('should call uploadFile when submitting with a selected file', () => {
    component.isEditMode = false;
    component.selectedFile = new File([''], 'test.png', { type: 'image/png' });
    
    component.teacherForm.patchValue({
      id: '123', name: 'File Test', department: 'Arts', picture: 'pending', username: 'ftest', password: 'password123'
    });

    mockUploadService.uploadFile.and.returnValue(of({ message: 'Success', host: '', path: '', fullPath: 'http://link.to/image.png', originalName: '' }));
    mockTeacherService.addTeacher.and.returnValue(of({ id: '123', name: 'File Test', department: 'Arts', picture: 'http://link.to/image.png', username: 'ftest' }));

    component.onSubmit();

    expect(mockUploadService.uploadFile).toHaveBeenCalled();
    expect(mockTeacherService.addTeacher).toHaveBeenCalled();
  });

  it('should save directly when submitting without a selected file', () => {
    component.isEditMode = false;
    component.selectedFile = null;
    
    component.teacherForm.patchValue({
      id: '124', name: 'No File Test', department: 'Arts', picture: 'http://existing.link', username: 'nofiletest', password: 'password123'
    });

    mockTeacherService.addTeacher.and.returnValue(of({ id: '124', name: 'No File Test', department: 'Arts', picture: 'http://existing.link', username: 'nofiletest' }));

    component.onSubmit();

    expect(mockUploadService.uploadFile).not.toHaveBeenCalled();
    expect(mockTeacherService.addTeacher).toHaveBeenCalled();
  });

  it('should update teacher', () => {
    component.isEditMode = true;
    component.selectedFile = null;
    
    component.teacherForm.patchValue({
      id: '125', name: 'Update Test', department: 'Arts', picture: 'http://existing.link', username: 'uptest'
    });

    mockTeacherService.updateTeacher.and.returnValue(of({ id: '125', name: 'Update Test', department: 'Arts', picture: 'http://existing.link', username: 'uptest' }));

    component.onSubmit();

    expect(mockTeacherService.updateTeacher).toHaveBeenCalled();
  });

  it('should call deleteTeacher', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.currentTeacherId = '1';
    mockTeacherService.deleteTeacher.and.returnValue(of(undefined));

    component.deleteTeacher();

    expect(mockTeacherService.deleteTeacher).toHaveBeenCalledWith('1');
    expect(mockTeacherService.getTeachers).toHaveBeenCalledTimes(2);
  });
});
