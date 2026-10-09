import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { DocumentsComponent } from './documents.component';

const existingDocument = {
  document_id: 'document-1',
  filename: 'housing_finance.pdf',
  page_count: 20,
  chunk_count: 12,
  status: 'READY' as const,
  created_at: '2026-10-06T12:00:00.000Z',
  updated_at: '2026-10-06T12:30:00.000Z'
};

describe('DocumentsComponent', () => {
  let fixture: ComponentFixture<DocumentsComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('shows loading state and renders loaded document metadata', () => {
    fixture = TestBed.createComponent(DocumentsComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading documents...');

    const request = httpTestingController.expectOne(
      `${environment.ragApiBaseUrl}/documents`
    );
    expect(request.request.method).toBe('GET');
    request.flush({
      documents: [
        {
          document_id: 'document-1',
          filename: 'housing_finance.pdf',
          page_count: 20,
          chunk_count: 12,
          status: 'READY',
          created_at: '2026-10-06T12:00:00.000Z',
          updated_at: '2026-10-06T12:30:00.000Z'
        }
      ]
    });
    fixture.detectChanges();

    const content = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(content).toContain('housing_finance.pdf');
    expect(content).toContain('20');
    expect(content).toContain('12');
    expect(content).toContain('READY');
    expect(content).not.toContain('Loading documents...');
  });

  it('uploads a selected PDF and refreshes the document list', () => {
    fixture = TestBed.createComponent(DocumentsComponent);
    fixture.detectChanges();
    httpTestingController.expectOne(`${environment.ragApiBaseUrl}/documents`).flush({
      documents: []
    });
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const fileInput = element.querySelector('input[type="file"]') as HTMLInputElement;
    const chooseFileButton = element.querySelector('.choose-file-button') as HTMLButtonElement;
    const uploadButton = element.querySelector('.upload-button') as HTMLButtonElement;
    const file = new File(['test pdf'], 'new-document.pdf', { type: 'application/pdf' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fileInput.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(element.textContent).toContain('new-document.pdf');
    expect(uploadButton.disabled).toBeFalse();
    expect(chooseFileButton.disabled).toBeFalse();
    uploadButton.click();
    fixture.detectChanges();

    expect(uploadButton.disabled).toBeTrue();
    expect(element.textContent).toContain('Uploading...');

    const uploadRequest = httpTestingController.expectOne(
      `${environment.ragApiBaseUrl}/documents`
    );
    expect(uploadRequest.request.method).toBe('POST');
    expect(uploadRequest.request.body instanceof FormData).toBeTrue();
    expect((uploadRequest.request.body as FormData).get('file')).toBe(file);

    const uploadedDocument = {
      document_id: 'document-2',
      filename: 'new-document.pdf',
      page_count: 2,
      chunk_count: 3,
      status: 'READY' as const,
      created_at: '2026-10-06T12:00:00.000Z',
      updated_at: '2026-10-06T12:30:00.000Z'
    };
    uploadRequest.flush(uploadedDocument);
    fixture.detectChanges();

    const refreshRequest = httpTestingController.expectOne(
      `${environment.ragApiBaseUrl}/documents`
    );
    expect(refreshRequest.request.method).toBe('GET');
    refreshRequest.flush({ documents: [uploadedDocument] });
    fixture.detectChanges();

    expect(uploadButton.disabled).toBeTrue();
    expect(element.textContent).toContain('new-document.pdf uploaded successfully.');
    expect(element.textContent).toContain('new-document.pdf');
  });

  it('does not delete a document when confirmation is cancelled', () => {
    fixture = TestBed.createComponent(DocumentsComponent);
    fixture.detectChanges();
    httpTestingController.expectOne(`${environment.ragApiBaseUrl}/documents`).flush({
      documents: [existingDocument]
    });
    fixture.detectChanges();

    spyOn(window, 'confirm').and.returnValue(false);
    const element = fixture.nativeElement as HTMLElement;
    (element.querySelector('.btn-outline-danger') as HTMLButtonElement).click();

    expect(window.confirm).toHaveBeenCalled();
    expect(element.textContent).toContain(existingDocument.filename);
    httpTestingController.expectNone(`${environment.ragApiBaseUrl}/documents/document-1`);
  });

  it('deletes the document after confirmation and removes its row', () => {
    fixture = TestBed.createComponent(DocumentsComponent);
    fixture.detectChanges();
    httpTestingController.expectOne(`${environment.ragApiBaseUrl}/documents`).flush({
      documents: [existingDocument]
    });
    fixture.detectChanges();

    spyOn(window, 'confirm').and.returnValue(true);
    const element = fixture.nativeElement as HTMLElement;
    const deleteButton = element.querySelector('.btn-outline-danger') as HTMLButtonElement;
    deleteButton.click();
    fixture.detectChanges();

    expect(deleteButton.disabled).toBeTrue();
    expect(deleteButton.textContent).toContain('Deleting...');

    const deleteRequest = httpTestingController.expectOne(
      `${environment.ragApiBaseUrl}/documents/document-1`
    );
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush({ message: 'Document deleted', document_id: 'document-1' });
    fixture.detectChanges();

    expect(element.querySelectorAll('.table tbody tr').length).toBe(0);
    expect(element.textContent).toContain(`${existingDocument.filename} deleted.`);
    expect(element.textContent).toContain('No documents yet');
  });

  it('keeps the document and shows an error when deletion fails', () => {
    fixture = TestBed.createComponent(DocumentsComponent);
    fixture.detectChanges();
    httpTestingController.expectOne(`${environment.ragApiBaseUrl}/documents`).flush({
      documents: [existingDocument]
    });
    fixture.detectChanges();

    spyOn(window, 'confirm').and.returnValue(true);
    const element = fixture.nativeElement as HTMLElement;
    const deleteButton = element.querySelector('.btn-outline-danger') as HTMLButtonElement;
    deleteButton.click();

    httpTestingController.expectOne(
      `${environment.ragApiBaseUrl}/documents/document-1`
    ).flush({ detail: 'internal error' }, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(element.textContent).toContain(existingDocument.filename);
    expect(element.textContent).toContain(
      `Unable to delete ${existingDocument.filename}. Please try again.`
    );
    expect(deleteButton.disabled).toBeFalse();
  });
});