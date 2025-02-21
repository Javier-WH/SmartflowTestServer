import supabase from '../../../lib/supabase';
import { FileResponse } from "../types/file"
import errorManager from '../errorManager/fileErrorManager';
import { PageItem } from '@/modules/page/types/pageTypes';


const getFiles = async (container: string | null): Promise<FileResponse> => {
  const response = await supabase
    .from('files')
    .select('*')[container === null || container === undefined ? 'is' : 'eq']('container', container);

  if (response.error) return errorManager(response.error)

  return { error: false, message: 'Files retrieved successfully', data: response.data };
}

const moveFile = async (fileId: string, newContainerId: string | null): Promise<FileResponse> => {
  const { data, error } = await supabase
    .rpc('move_file', {
      p_file_id: fileId,
      p_new_container_id: newContainerId,
    });

  if (error) {
    console.log(error);
    return errorManager(error)
  } else {
    return { error: false, message: 'File moved successfully', data };
  }
}

const createFile = async (fileName: string, containerId: string | null = null): Promise<FileResponse> => {
  const { data, error } = await supabase
    .rpc('create_file', {
      p_name: fileName,
      p_container: containerId,
    });
  if (error) {
    console.log(error);
    return errorManager(error)
  } else {
    return { error: false, message: 'File created successfully', data };
  }
}

const getFileContent = async (fileId: string): Promise<FileResponse> => {
  const response = await supabase
    .from('files')
    .select('content, name')
    .eq('id', fileId)
    .single();

  if (response.error) return errorManager(response.error)
  return { error: false, message: 'content retrieved successfully', data: response.data };
}

const updateFileContent = async (fileId: string, content:PageItem[] , name: string): Promise<FileResponse> => {
  const response = await supabase
    .from('files')
    .update({ 
      name,
      content 
    })
    .eq('id', fileId);
  if (response.error) return errorManager(response.error)
  return { error: false, message: 'content updated successfully', data: response.data };

}

export default function useFilesManager() {
  return {
    getFiles,
    moveFile,
    createFile,
    getFileContent,
    updateFileContent
  }
}