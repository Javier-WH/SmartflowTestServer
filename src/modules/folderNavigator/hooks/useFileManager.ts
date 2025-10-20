import type { PageItem } from '@/modules/page/types/pageTypes';
import supabase from '../../../lib/supabase';
import errorManager from '../errorManager/fileErrorManager';
import type { FileResponse } from '../types/file';

const getFiles = async (container: string | null): Promise<FileResponse> => {
    const response = await supabase
        .from('files')
        .select('*')
        [container === null || container === undefined ? 'is' : 'eq']('container', container);

    if (response.error) return errorManager(response.error);

    return { error: false, message: 'Files retrieved successfully', data: response.data };
};

const moveFile = async (fileId: string, newContainerId: string | null): Promise<FileResponse> => {
    const { data, error } = await supabase.rpc('move_file_quill', {
        p_file_id: fileId,
        p_new_container_id: newContainerId,
    });

    if (error) {
        console.log(error);
        return errorManager(error);
    } else {
        return { error: false, message: 'File moved successfully', data };
    }
};

const createFile = async (fileName: string, containerId: string | null = null, slug: string): Promise<FileResponse> => {
    const { data, error } = await supabase.rpc('create_file_quill', {
        p_name: fileName,
        p_container: containerId,
        p_slug: slug,
    });
    if (error) {
        console.log(error);
        return errorManager(error);
    } else {
        return { error: false, message: 'File created successfully', data };
    }
};

const getFileContent = async (fileId: string): Promise<FileResponse> => {
    const response = await supabase.from('filesquill').select('content, name, updated_at').eq('id', fileId).single();

    if (response.error) return errorManager(response.error);
    return { error: false, message: 'content retrieved successfully', data: response.data };
};

const updateFileContent = async (fileId: string, content: PageItem[] | string, name: string): Promise<FileResponse> => {
    if (name === '') name = 'untitled';
    const response = await supabase
        .from('filesquill')
        .update({
            name,
            content,
        })
        .eq('id', fileId)
        .select('content, name, updated_at')
        .single();
    if (response.error) return errorManager(response.error);
    return { error: false, message: 'content updated successfully', data: response.data };
};

const deleteFile = async (folderId: string): Promise<FileResponse> => {
    const { data, error } = await supabase
        .rpc('borrar_archivo_quill', {
            p_file_id: folderId,
        })
        .select('*');

    if (error) {
        console.log(error);
        return errorManager(error);
    } else {
        return { error: false, message: 'File deleted successfully', data };
    }
};

const moveFileToRoot = async (fileId: string | null): Promise<FileResponse> => {
    const { data, error } = await supabase.rpc('move_file_to_root_quill', {
        p_file_id: fileId,
    });

    if (error) {
        console.log(error);
        return errorManager(error);
    } else {
        return { error: false, message: 'File moved to root successfully', data };
    }
};

const searchFiles = async (text: string, slug: string): Promise<FileResponse> => {
    const { data, error } = await supabase.rpc('partial_search_filesquill', {
        search_term: text,
        p_slug: slug,
    });

    if (error) {
        console.log(error);
        return errorManager(error);
    } else {
        return { error: false, message: 'Files found successfully', data };
    }
};

const duplicateFile = async (p_id: string): Promise<FileResponse> => {
    const functionName = 'duplicate_filesquill_record';
    const { data, error } = await supabase.rpc(functionName, {
        p_id,
    });

    if (error) {
        console.log(error);
        return errorManager(error);
    } else {
        return { error: false, message: 'Files duplicated successfully', data };
    }
};

//qq

export default function useFilesManager() {
    return {
        getFiles,
        moveFile,
        createFile,
        getFileContent,
        updateFileContent,
        deleteFile,
        moveFileToRoot,
        searchFiles,
        duplicateFile,
    };
}
