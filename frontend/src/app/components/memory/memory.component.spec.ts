import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { MemoryComponent } from './memory.component';

describe('MemoryComponent', () => {
  let fixture: ComponentFixture<MemoryComponent>;
  let httpTestingController: HttpTestingController;
  const memoriesUrl = `${environment.apiBaseUrl}/api/memories`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemoryComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  function createComponentWithMemories(): void {
    fixture = TestBed.createComponent(MemoryComponent);
    fixture.detectChanges();
    httpTestingController.expectOne(`${memoriesUrl}/user-123`).flush([
      {
        _id: 'memory-1',
        userId: 'user-123',
        key: 'preferred_currency',
        value: 'INR',
        createdAt: '2026-10-02T00:00:00.000Z',
        updatedAt: '2026-10-02T00:00:00.000Z'
      }
    ]);
    fixture.detectChanges();
  }

  it("creates the component and loads the user's memories", () => {
    fixture = TestBed.createComponent(MemoryComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading memories...');

    httpTestingController.expectOne(`${memoriesUrl}/user-123`).flush([]);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('No memories saved yet.');
  });

  it('upserts a key in the displayed list and deletes the memory', () => {
    createComponentWithMemories();
    const element = fixture.nativeElement as HTMLElement;
    const keyInput = element.querySelector('input') as HTMLInputElement;
    const valueInput = element.querySelector('textarea') as HTMLTextAreaElement;
    const form = element.querySelector('form') as HTMLFormElement;

    keyInput.value = ' preferred_currency ';
    keyInput.dispatchEvent(new Event('input'));
    valueInput.value = ' USD ';
    valueInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    const updateRequest = httpTestingController.expectOne(memoriesUrl);
    expect(updateRequest.request.body).toEqual({
      userId: 'user-123',
      key: 'preferred_currency',
      value: 'USD'
    });
    updateRequest.flush({
      _id: 'memory-1',
      userId: 'user-123',
      key: 'preferred_currency',
      value: 'USD',
      createdAt: '2026-10-02T00:00:00.000Z',
      updatedAt: '2026-10-02T01:00:00.000Z'
    });
    fixture.detectChanges();

    expect(element.querySelectorAll('.memory-item').length).toBe(1);
    expect(element.querySelector('.memory-detail p')?.textContent).toContain('USD');
    expect(keyInput.value).toBe('');
    expect(valueInput.value).toBe('');

    const deleteButton = element.querySelector('.delete-button') as HTMLButtonElement;
    deleteButton.click();
    const deleteRequest = httpTestingController.expectOne(
      `${memoriesUrl}/user-123/preferred_currency`
    );
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush({ message: 'Memory deleted' });
    fixture.detectChanges();

    expect(element.querySelectorAll('.memory-item').length).toBe(0);
    expect(element.textContent).toContain('No memories saved yet.');
  });
});