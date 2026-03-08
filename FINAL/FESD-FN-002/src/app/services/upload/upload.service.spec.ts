import { TestBed } from '@angular/core/testing';
import { UploadService } from './upload.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('UploadService', () => {
  let service: UploadService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UploadService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(UploadService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should post file to upload API', () => {
    const mockFile = new File([''], 'test.png', { type: 'image/png' });
    const mockResponse = { message: 'Upload successful', fullPath: 'http://localhost:3000/public/ul/test.png' };

    service.uploadFile(mockFile).subscribe((res: any) => {
      expect(res.fullPath).toBe('http://localhost:3000/public/ul/test.png');
    });

    const req = httpTestingController.expectOne('http://localhost:3000/upload');
    expect(req.request.method).toEqual('POST');
    req.flush(mockResponse);
  });
});
