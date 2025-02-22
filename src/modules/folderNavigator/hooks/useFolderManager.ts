import supabase from '../../../lib/supabase';
import {  FolderResponse } from "../types/folder"
import errorManager from '../errorManager/folderErrorManager';

const createFolder = async (folderName: string, containerId: string | null): Promise<FolderResponse> => {
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

const updateFolder = async (folderName: string, folderId: string | null) => {
  const { data, error } = await supabase
    .rpc('actualizar_carpeta', {
      p_foldername: folderName,
      p_id: folderId
    })
    .select('*');

  if (error) {
    console.log(error);
    return errorManager(error)
  } else {
    return { error: false, message: 'Folder updated successfully', data };
  }
};

const updateRootFolder = async (folderName: string, folderId: string | null) => {
  const { data, error } = await supabase
    .rpc('actualizar_carpeta_root', {
      p_foldername: folderName,
      p_id: folderId
    })
    .select('*');

  if (error) {
    console.log(error);
    return errorManager(error)
  } else {
    return { error: false, message: 'Folder updated successfully', data };
  }
};



const getFolders = async (container: string | null): Promise<FolderResponse> => {
  const response = await supabase
    .from('folders')
    .select('*')[container === null || container === undefined ? 'is' : 'eq']('container', container);

  if (response.error) return errorManager(response.error)

  return { error: false, message: 'Folders retrieved successfully', data: response.data };
}




const deleteFolder = async (folderId: string): Promise<FolderResponse> => {
  const { data, error } = await supabase
    .rpc('borrar_carpeta', {
      p_id: folderId
    })
    .select('*');

  if (error) {
    console.log(error);
    return errorManager(error)
  } else {
    return { error: false, message: 'Folder deleted successfully', data };
  }
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
    updateFolder,
    updateRootFolder,
    deleteFolder,
    getFolderContent,
    getRootContent,
    moveFolderToRoot
  }
}