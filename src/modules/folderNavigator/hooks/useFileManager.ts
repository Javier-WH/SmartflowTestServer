import supabase from '../../../lib/supabase';
import { FileResponse } from "../types/file"
import errorManager from '../errorManager/fileErrorManager';


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


export default function useFilesManager() {
  return {
    getFiles,
    moveFile
  }
}