export interface Folder{
  id?: string;
  name: string;
  container?: string;
  created_at?: string;
}

export interface FolderResponse {
  error: boolean;
  message: string;
  data?: Folder[];
}



export interface FolderNavigatorContextValues{
  Loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>

}

export type getFolderResponse = (folderId: string | null) => Promise<FolderResponse>