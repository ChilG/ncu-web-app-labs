import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentComponent } from './student.component';
import { StudentService } from './student.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('StudentComponent', () => {
  let component: StudentComponent;
  let fixture: ComponentFixture<StudentComponent>;
  let mockStudentService: jasmine.SpyObj<StudentService>;

  beforeEach(async () => {
    mockStudentService = jasmine.createSpyObj('StudentService', ['getStudents', 'addStudent', 'updateStudent', 'deleteStudent']);
    mockStudentService.getStudents.and.returnValue(of([{ id: '1', name: 'Test', age: 20, email: 'test@test.com', major: 'CS' }]));

    await TestBed.configureTestingModule({
      imports: [StudentComponent, FormsModule],
      providers: [
        { provide: StudentService, useValue: mockStudentService }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load students on init', () => {
    expect(mockStudentService.getStudents).toHaveBeenCalled();
    expect(component.students.length).toBe(1);
    expect(component.students[0].name).toBe('Test');
  });

  it('should open dialog for adding a new student', () => {
    component.openDialog();
    expect(component.isEditMode).toBeFalse();
    expect(component.showAddModal).toBeTrue();
    expect(component.currentStudent.id).toBe('');
  });

  it('should open dialog for editing an existing student', () => {
    const student = { id: '2', name: 'Mock', age: 21, email: 'mock@test.com', major: 'Math' };
    component.openDialog(student);
    expect(component.isEditMode).toBeTrue();
    expect(component.showAddModal).toBeTrue();
    expect(component.currentStudent.name).toBe('Mock');
  });

  it('should close dialog', () => {
    component.showAddModal = true;
    component.closeDialog();
    expect(component.showAddModal).toBeFalse();
  });

  it('should call addStudent on submit when not in edit mode', () => {
    component.isEditMode = false;
    component.currentStudent = { id: '', name: 'New', age: 25, email: 'new@test.com', major: 'Physics' };
    mockStudentService.addStudent.and.returnValue(of(component.currentStudent));

    component.onSubmit();

    expect(mockStudentService.addStudent).toHaveBeenCalled();
    expect(mockStudentService.getStudents).toHaveBeenCalledTimes(2); // once on init, once after add
  });

  it('should call updateStudent on submit when in edit mode', () => {
    component.isEditMode = true;
    component.currentStudent = { id: '1', name: 'Updated', age: 25, email: 'upd@test.com', major: 'Physics' };
    mockStudentService.updateStudent.and.returnValue(of(component.currentStudent));

    component.onSubmit();

    expect(mockStudentService.updateStudent).toHaveBeenCalled();
    expect(mockStudentService.getStudents).toHaveBeenCalledTimes(2); // once on init, once after update
  });

  it('should call deleteStudent', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.currentStudent.id = '1';
    mockStudentService.deleteStudent.and.returnValue(of(undefined));

    component.deleteStudent();

    expect(mockStudentService.deleteStudent).toHaveBeenCalledWith('1');
    expect(mockStudentService.getStudents).toHaveBeenCalledTimes(2);
  });
});
