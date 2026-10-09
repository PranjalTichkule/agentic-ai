import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { MemoryService } from './memory.service';

describe('MemoryService', () => {
  let service: MemoryService;
  let httpTestingController: HttpTestingController;
  const memoriesUrl = `${environment.apiBaseUrl}/api/memories`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(MemoryService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('gets a user memory list', () => {
    service.getMemories('user-123').subscribe();

    const request = httpTestingController.expectOne(`${memoriesUrl}/user-123`);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('gets a memory by user and key with encoded path parameters', () => {
    service.getMemory('user 123', 'preferred currency').subscribe();

    const request = httpTestingController.expectOne(
      `${memoriesUrl}/user%20123/preferred%20currency`
    );
    expect(request.request.method).toBe('GET');
    request.flush({
      _id: 'memory-1',
      userId: 'user 123',
      key: 'preferred currency',
      value: 'INR',
      createdAt: '2026-10-02T00:00:00.000Z',
      updatedAt: '2026-10-02T00:00:00.000Z'
    });
  });

  it('creates or updates a memory with the expected payload', () => {
    service.createMemory('user-123', 'preferred_currency', 'INR').subscribe();

    const request = httpTestingController.expectOne(memoriesUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      userId: 'user-123',
      key: 'preferred_currency',
      value: 'INR'
    });
    request.flush({
      _id: 'memory-1',
      userId: 'user-123',
      key: 'preferred_currency',
      value: 'INR',
      createdAt: '2026-10-02T00:00:00.000Z',
      updatedAt: '2026-10-02T00:00:00.000Z'
    });
  });

  it('deletes a memory by user and key', () => {
    service.deleteMemory('user-123', 'preferred_currency').subscribe();

    const request = httpTestingController.expectOne(
      `${memoriesUrl}/user-123/preferred_currency`
    );
    expect(request.request.method).toBe('DELETE');
    request.flush({ message: 'Memory deleted' });
  });
});