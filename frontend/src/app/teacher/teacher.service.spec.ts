import { TestBed } from '@angular/core/testing';
import { TeacherService } from './teacher.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Teacher } from '../model/teacher.model';

describe('TeacherService', () => {
  let service: TeacherService;
  let httpTestingController: HttpTestingController;

  const mockTeachers: Teacher[] = [
    { id: '1', name: 'John Doe', department: 'Math', picture: '', username: 'jdoe' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TeacherService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(TeacherService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve all teachers', () => {
    service.getTeachers().subscribe(teachers => {
      expect(teachers.length).toBe(1);
      expect(teachers).toEqual(mockTeachers);
    });

    const req = httpTestingController.expectOne('http://localhost:3000/teacher');
    expect(req.request.method).toEqual('GET');
    req.flush({ data: mockTeachers });
  });

  it('should retrieve a teacher by id', () => {
    service.getTeacherById('1').subscribe(teacher => {
      expect(teacher).toEqual(mockTeachers[0]);
    });

    const req = httpTestingController.expectOne('http://localhost:3000/teacher/1');
    expect(req.request.method).toEqual('GET');
    req.flush(mockTeachers[0]);
  });

  it('should add a new teacher', () => {
    const newTeacher: Teacher = { id: '2', name: 'Jane Doe', department: 'Science', picture: '', username: 'janed' };
    
    service.addTeacher(newTeacher).subscribe(teacher => {
      expect(teacher).toEqual(newTeacher);
    });

    const req = httpTestingController.expectOne('http://localhost:3000/teacher');
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(newTeacher);
    req.flush(newTeacher);
  });

  it('should update a teacher', () => {
    const updateTeacher: Teacher = { id: '1', name: 'John Updated', department: 'Math', picture: '', username: 'jdoe' };
    
    service.updateTeacher(updateTeacher).subscribe(teacher => {
      expect(teacher).toEqual(updateTeacher);
    });

    const req = httpTestingController.expectOne('http://localhost:3000/teacher/1');
    expect(req.request.method).toEqual('PUT');
    req.flush(updateTeacher);
  });

  it('should delete a teacher', () => {
    service.deleteTeacher('1').subscribe(res => {
      expect(res).toBeNull();
    });

    const req = httpTestingController.expectOne('http://localhost:3000/teacher/1');
    expect(req.request.method).toEqual('DELETE');
    req.flush(null);
  });

  it('should request to change a password', () => {
    service.changePassword('1', 'oldPass', 'newPass').subscribe(res => {
      expect(res.message).toBe('Password updated successfully');
    });

    const req = httpTestingController.expectOne('http://localhost:3000/teacher/1/password');
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({ oldPassword: 'oldPass', newPassword: 'newPass' });
    req.flush({ message: 'Password updated successfully' });
  });
});
