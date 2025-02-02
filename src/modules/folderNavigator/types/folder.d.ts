export interface Folder{
  id?: string;
  name: string;
  container?: string | null;
  created_at?: string;
}

export interface FolderResponse {
  error: boolean;
  message: string;
  data?: Array[];
}

export interface FolderRequestItem {
  id: string;
  name: string;
  container?: string;
  published?: boolean
  type: number
}

type FolderResquest = {
  [contenedor_id: string]: FolderRequestItem[];
};


export interface FolderNavigatorContextValues{
  Loading: string | null;
  setLoading: React.Dispatch<React.SetStateAction<string | null>>;
  modalFolder: Folder | null;
  setModalFolder: React.Dispatch<React.SetStateAction<Folder | null>>;
  modalDeleteFolder: Folder | null;
  setModalDeleteFolder: React.Dispatch<React.SetStateAction<Folder | null>>
  updateFolderRequest: FolderResquest | null;
  setUpdateFolderRequest: React.Dispatch<React.SetStateAction<FolderResquest | null>>
}

export type getFolderResponse = (folderId: string | null) => Promise<FolderResponse>