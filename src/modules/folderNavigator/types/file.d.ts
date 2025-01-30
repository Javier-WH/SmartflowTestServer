export interface File {
  id?: string;
  name: string;
  container?: string;
  content?: string;
  created_at?: string;
  published: boolean
}

export interface FileResponse {
  error: boolean;
  message: string;
  data?: File[]
}

export type getFilesResponse = (folderId: string | null) => Promise<FileResponse>