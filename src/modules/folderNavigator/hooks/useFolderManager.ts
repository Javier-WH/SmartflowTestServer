import supabase from '../../../lib/supabase';
import { Folder, FolderResponse } from "../types/folder"
import errorManager from '../errorManager/folderErrorManager';

const createFolder = async (folder: Folder): Promise<FolderResponse> => {
  // if folder has no container check if it already exists in root
  if (!folder.container) {
    const response = await supabase.from('folders')
      .select('*')
      .eq('name', folder.name)
      .is('container', null);

    if (response.error) return errorManager(response.error)

    if (response.data.length > 0) {
      return { error: true, message: 'A folder with this name already exists in the root folder' };
    }
  }

  const requestData = {
    name: folder.name,
    ...(folder.container ? { container: folder.container } : {})
  }

  const response = await supabase.from('folders').insert(requestData);

  if (response.error) return errorManager(response.error)

  return { error: false, message: 'Folder created successfully' };
}


const getFolders = async (container: string | null): Promise<FolderResponse> => {
  const response = await supabase
    .from('folders')
    .select('*')[container === null || container === undefined ? 'is' : 'eq']('container', container);

  if (response.error) return errorManager(response.error)

  return { error: false, message: 'Folders retrieved successfully', data: response.data };
}


const moveFolder = async (folderId: string, containerId?: string): Promise<FolderResponse> => {
  
  const response = await supabase
    .from('folders')
    .update({ container: containerId ?? null })
    .eq('id', folderId);

  if (response.error) return errorManager(response.error)

  return { error: false, message: 'Folder moved successfully' };

}

export default function useFolderManager() {
  return {
    createFolder,
    getFolders,
    moveFolder
  }
}