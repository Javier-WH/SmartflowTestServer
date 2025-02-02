import supabase from '../../../lib/supabase';
import { File, FileResponse } from "../types/file"
import errorManager from '../errorManager/fileErrorManager';

/*const createFile = async (file: File): Promise<FileResponse> => {

  // if folder has no container check if it already exists in root
  if (!file.container) {
    const response = await supabase.from('files')
      .select('*')
      .eq('name', file.name)
      .is('container', null);

    if (response.error) return errorManager(response.error)

    if (response.data.length > 0) {
      return { error: true, message: 'A file with this name already exists in the root folder' };
    }
  }

  const requestData = {
    name: file.name,
    ...(file.container ? { container: file.container } : {})
  }

  const response = await supabase.from('files').insert(requestData);

  if (response.error) return errorManager(response.error)

  return { error: false, message: 'File created successfully' };
}*/


const getFiles = async (container: string | null): Promise<FileResponse> => {
  const response = await supabase
    .from('files')
    .select('*')[container === null || container === undefined ? 'is' : 'eq']('container', container);

  if (response.error) return errorManager(response.error)

  return { error: false, message: 'Files retrieved successfully', data: response.data };
}

const moveFile = async (fileId: string, newContainerId: string): Promise<FileResponse> => {
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


export default function useFilesManager() {
  return {
    //createFile,
    getFiles,
    moveFile
  }
}