import { File } from "./file";
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
  published?: boolean;
  type: number;
  filesnumber?: string
}

type FolderResquest = {
  [contenedor_id: string]: FolderRequestItem[];
};

export interface FolderData {
  container_id: string;
  itemid: string;
  name: string;
  old_container_empty: boolean;
  old_container_id: string;
  published: boolean;
  type: number;
  filesnumber?: string
}


export interface FolderNavigatorContextValues{
  Loading: string | null;
  setLoading: React.Dispatch<React.SetStateAction<string | null>>;
  modalFolder: Folder | null;
  setModalFolder: React.Dispatch<React.SetStateAction<Folder | null>>;
  modalDeleteFolder: Folder | null;
  setModalDeleteFolder: React.Dispatch<React.SetStateAction<Folder | null>>
  updateFolderRequest: FolderResquest | null;
  setUpdateFolderRequest: React.Dispatch<React.SetStateAction<FolderResquest | null>>;
  groupDataByContainer: (request: { data: FolderData[] }) => FolderResquest;
  modalDeleteFile: File | null;
  setModalDeleteFile: React.Dispatch<React.SetStateAction<File | null>>;
  fileCountUpdateRequest: boolean,
  setFileCountUpdateRequest: React.Dispatch<React.SetStateAction<boolean>>,
  memberRoll: MemberRolltype | null,
  selectedFileId: string | null, 
  setSelectedFileId: React.Dispatch<React.SetStateAction<string | null>>,
  changleFileNameRequest: {fileId: string, fileName: string} | null,
  setChangleFileNameRequest: React.Dispatch<React.SetStateAction<{fileId: string, fileName: string} | null>>
}

export type getFolderResponse = (folderId: string | null) => Promise<FolderResponse>