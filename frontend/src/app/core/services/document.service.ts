import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
	DeleteDocumentResponse,
	Document,
	DocumentListResponse
} from '../models/document.model';

@Injectable({ providedIn: 'root' })
export class DocumentService {
	private readonly documentsUrl = `${environment.ragApiBaseUrl}/documents`;

	constructor(private readonly http: HttpClient) {}

	getDocuments(): Observable<Document[]> {
		return this.http.get<DocumentListResponse>(this.documentsUrl).pipe(
			map((response) => response.documents)
		);
	}

	getDocument(documentId: string): Observable<Document> {
		return this.http.get<Document>(this.documentUrl(documentId));
	}

	uploadDocument(file: File): Observable<Document> {
		const formData = new FormData();
		formData.append('file', file);

		return this.http.post<Document>(this.documentsUrl, formData);
	}

	deleteDocument(documentId: string): Observable<DeleteDocumentResponse> {
		return this.http.delete<DeleteDocumentResponse>(this.documentUrl(documentId));
	}

	private documentUrl(documentId: string): string {
		return `${this.documentsUrl}/${encodeURIComponent(documentId)}`;
	}
}