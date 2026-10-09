export type DocumentStatus = 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';

export interface Document {
  document_id: string;
  filename: string;
  file_path?: string;
  page_count: number;
  chunk_count: number;
  status: DocumentStatus;
  created_at: string;
  updated_at: string;
}

export interface DocumentListResponse {
  documents: Document[];
}

export interface DeleteDocumentResponse {
  message: string;
  document_id: string;
}