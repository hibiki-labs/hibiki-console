export type DocumentStatus = 'uploaded' | 'queued' | 'processing' | 'indexed' | 'failed' | 'deleted';

export interface SourceDocument {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string; // ISO date string
  uploadedBy: string;
  status: DocumentStatus;
}
