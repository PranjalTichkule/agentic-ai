import { Component, OnInit, inject, signal } from '@angular/core';
import { Document, DocumentStatus } from '../../core/models/document.model';
import { DocumentService } from '../../core/services/document.service';

@Component({
  selector: 'app-documents',
  standalone: true,
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.css'
})
export class DocumentsComponent implements OnInit {
  private readonly documentService = inject(DocumentService);

  protected readonly documents = signal<Document[]>([]);
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isUploading = signal(false);
  protected readonly activeUploadFilename = signal<string | null>(null);
  protected readonly deletingDocumentIds = signal<ReadonlySet<string>>(new Set());
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadDocuments();
  }

  protected onFileSelected(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    const file = input.files?.[0];
    input.value = '';

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      this.selectedFile.set(null);
      this.errorMessage.set(null);
      this.errorMessage.set('Select a PDF file to upload.');
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.selectedFile.set(file);
  }

  protected uploadSelectedFile(): void {
    const file = this.selectedFile();
    if (!file || this.isUploading()) {
      return;
    }

    this.isUploading.set(true);
    this.activeUploadFilename.set(file.name);
    this.documentService.uploadDocument(file).subscribe({
      next: (document) => {
        this.isUploading.set(false);
        this.activeUploadFilename.set(null);
        this.selectedFile.set(null);
        this.successMessage.set(`${document.filename} uploaded successfully.`);
        this.loadDocuments();
      },
      error: () => {
        this.isUploading.set(false);
        this.activeUploadFilename.set(null);
        this.errorMessage.set('Unable to upload this PDF. Please try again.');
      }
    });
  }

  private loadDocuments(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.documentService.getDocuments().subscribe({
      next: (documents) => {
        this.documents.set(documents);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load documents. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  protected deleteDocument(document: Document): void {
    const confirmed = window.confirm(
      `Delete "${document.filename}"? Its PDF, metadata, and indexed chunks will be removed.`
    );

    if (!confirmed) {
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.deletingDocumentIds.update((ids) => new Set(ids).add(document.document_id));

    this.documentService.deleteDocument(document.document_id).subscribe({
      next: () => {
        this.documents.update((documents) =>
          documents.filter((item) => item.document_id !== document.document_id)
        );
        this.deletingDocumentIds.update((ids) => {
          const updatedIds = new Set(ids);
          updatedIds.delete(document.document_id);
          return updatedIds;
        });
        this.successMessage.set(`${document.filename} deleted.`);
      },
      error: () => {
        this.deletingDocumentIds.update((ids) => {
          const updatedIds = new Set(ids);
          updatedIds.delete(document.document_id);
          return updatedIds;
        });
        this.errorMessage.set(`Unable to delete ${document.filename}. Please try again.`);
      }
    });
  }

  protected isDeleting(documentId: string): boolean {
    return this.deletingDocumentIds().has(documentId);
  }

  protected statusClass(status: DocumentStatus): string {
    switch (status) {
      case 'READY':
        return 'text-bg-success';
      case 'PROCESSING':
        return 'text-bg-primary';
      case 'FAILED':
        return 'text-bg-danger';
      case 'UPLOADING':
        return 'text-bg-secondary';
    }
  }

  protected formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  }
}