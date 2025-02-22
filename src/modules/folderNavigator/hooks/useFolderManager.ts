import supabase from '../../../lib/supabase';
import { Folder, FolderResponse } from "../types/folder"
import errorManager from '../errorManager/folderErrorManager';

const createFolder = async (folderName: string, containerId: string): Promise<FolderResponse> => {
  const { data, error } = await supabase
    .rpc('crear_carpeta', {
      p_container_id: containerId,
      p_foldername: folderName
    })
    .select('*');

  if (error) {
    console.log(error);
    return errorManager(error)
  } else {
    return { error: false, message: 'Folder created successfully', data };
  }
}

const updateFolderName = async (folder: Folder): Promise<FolderResponse> => {

  const response = await supabase.from('folders')
  .update({ name: folder.name })
  .eq('id', folder.id);

  if (response.error) return errorManager(response.error)

  return { error: false, message: 'Folder name updated successfully' };
}


const getFolders = async (container: string | null): Promise<FolderResponse> => {
  const response = await supabase
    .from('folders')
    .select('*')[container === null || container === undefined ? 'is' : 'eq']('container', container);

  if (response.error) return errorManager(response.error)

  return { error: false, message: 'Folders retrieved successfully', data: response.data };
}




const deleteFolder = async (folderId: string): Promise<FolderResponse> => {
  if (folderId == null) return { error: true, message: 'Folder not found' }
  
  const response = await supabase
    .from('folders')
    .delete()
    .eq('id', folderId);

  if (response.error) return errorManager(response.error)

  return { error: false, message: 'Folder deleted successfully' };
}

const moveFolder = async (folderId: string, newContainerId: string | null): Promise<FolderResponse> => {
  const { data, error } = await supabase
    .rpc('mover_carpeta', {
      p_folder_id: folderId,   
      p_new_container_id: newContainerId, 
    });

  if (error) {
    console.log(error);
    return errorManager(error)
  } else {
    return { error: false, message: 'Folder moved successfully', data };
  }
}

const getFolderContent = async (folderId: string | null): Promise<FolderResponse> => {
  const { data, error } = await supabase
    .rpc('getfoldercontent', {
      p_folder_id: folderId
    });

  if (error) {
    console.log(error);
    return errorManager(error)
  } else {
    return { error: false, message: 'Folder content retrieved successfully', data };
  }
}

const getRootContent = async (): Promise<FolderResponse> => {
  const { data, error } = await supabase
    .rpc('getrootcontent');

  if (error) {
    console.log(error);
    return errorManager(error)
  } else {
    return { error: false, message: 'Folder content retrieved successfully', data };
  }
}

const moveFolderToRoot = async (folderId: string | null): Promise<FolderResponse> => {
  const { data, error } = await supabase
    .rpc('move_folder_to_root', {
      p_folder_id: folderId
    });

  if (error) {
    console.log(error);
    return errorManager(error)
  } else {
    return { error: false, message: 'Folder moved to root successfully', data };
  }
}

export default function useFolderManager() {
  return {
    createFolder,
    getFolders,
    moveFolder,
    updateFolderName,
    deleteFolder,
    getFolderContent,
    getRootContent,
    moveFolderToRoot
  }
}