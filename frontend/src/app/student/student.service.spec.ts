import { TestBed } from '@angular/core/testing';
import { StudentService } from './student.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Student } from '../model/student.model';

describe('StudentService', () => {
  let service: StudentService;
  let httpTestingController: HttpTestingController;

  const mockStudents: Student[] = [
    { id: '1', name: 'Alice Smith', age: 20, email: 'alice@example.com', major: 'CS' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StudentService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(StudentService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve all students', () => {
    service.getStudents().subscribe(students => {
      expect(students.length).toBe(1);
      expect(students).toEqual(mockStudents);
    });

    const req = httpTestingController.expectOne('http://localhost:3000/student');
    expect(req.request.method).toEqual('GET');
    req.flush({ data: mockStudents });
  });

  it('should retrieve a student by id', () => {
    service.getStudentById('1').subscribe(student => {
      expect(student).toEqual(mockStudents[0]);
    });

    const req = httpTestingController.expectOne('http://localhost:3000/student/1');
    expect(req.request.method).toEqual('GET');
    req.flush(mockStudents[0]);
  });

  it('should add a new student', () => {
    const newStudent: Student = { id: '2', name: 'Bob Jones', age: 22, email: 'bob@example.com', major: 'Math' };
    
    service.addStudent(newStudent).subscribe(student => {
      expect(student).toEqual(newStudent);
    });

    const req = httpTestingController.expectOne('http://localhost:3000/student');
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(newStudent);
    req.flush(newStudent);
  });

  it('should update a student', () => {
    const updateStudent: Student = { id: '1', name: 'Alice Updated', age: 21, email: 'alice@example.com', major: 'CS' };
    
    service.updateStudent(updateStudent).subscribe(student => {
      expect(student).toEqual(updateStudent);
    });

    const req = httpTestingController.expectOne('http://localhost:3000/student/1');
    expect(req.request.method).toEqual('PUT');
    req.flush(updateStudent);
  });

  it('should delete a student', () => {
    service.deleteStudent('1').subscribe(res => {
      expect(res).toBeNull();
    });

    const req = httpTestingController.expectOne('http://localhost:3000/student/1');
    expect(req.request.method).toEqual('DELETE');
    req.flush(null);
  });
});
