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

const moveFile = async (fileId: string, containerId: string): Promise<FileResponse> => {
  const response = await supabase
    .from('files')
    .update({ container: containerId })
    .eq('id', fileId);

  if (response.error) return errorManager(response.error)

  return { error: false, message: 'File moved successfully' };

}


export default function useFilesManager() {
  return {
    //createFile,
    getFiles,
    moveFile
  }
}