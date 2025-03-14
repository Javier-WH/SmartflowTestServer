import supabase from '../../../lib/supabase';
import type { FolderResponse } from '../types/folder';
import errorManager from '../errorManager/folderErrorManager';

const pageType = import.meta.env.VITE_PAGE_TYPE;

const createFolder = async (
    folderName: string,
    containerId: string | null,
    slug: string,
): Promise<FolderResponse> => {
    const { data, error } = await supabase
        .rpc('crear_carpeta', {
            p_container_id: containerId,
            p_foldername: folderName,
            p_slug: slug,
        })
        .select('*');

    if (error) {
        console.log(error);
        return errorManager(error);
    }

    return { error: false, message: 'Folder created successfully', data };
};

const updateFolder = async (folderName: string, folderId: string | null) => {
    const { data, error } = await supabase
        .rpc('actualizar_carpeta', {
            p_foldername: folderName,
            p_id: folderId,
        })
        .select('*');

    if (error) {
        console.log(error);
        return errorManager(error);
    }

    return { error: false, message: 'Folder updated successfully', data };
};

const updateRootFolder = async (folderName: string, folderId: string | null) => {
    const { data, error } = await supabase
        .rpc('actualizar_carpeta_root', {
            p_foldername: folderName,
            p_id: folderId,
        })
        .select('*');

    if (error) {
        console.log(error);
        return errorManager(error);
    }

    return { error: false, message: 'Folder updated successfully', data };
};

const getFolders = async (container: string | null): Promise<FolderResponse> => {
    const response = await supabase
        .from('folders')
        .select('*')[container === null || container === undefined ? 'is' : 'eq']('container', container);

    if (response.error) return errorManager(response.error);

    return { error: false, message: 'Folders retrieved successfully', data: response.data };
};

const deleteFolder = async (folderId: string): Promise<FolderResponse> => {
    const { data, error } = await supabase
        .rpc('borrar_carpeta', {
            p_folder_id: folderId,
        })
        .select('*');

    if (error) {
        console.log(error);
        return errorManager(error);
    }

    return { error: false, message: 'Folder deleted successfully', data };
};

const moveFolder = async (folderId: string, newContainerId: string | null): Promise<FolderResponse> => {
    const { data, error } = await supabase.rpc('mover_carpeta', {
        p_folder_id: folderId,
        p_new_container_id: newContainerId,
    });

    if (error) {
        console.log(error);
        return errorManager(error);
    }

    return { error: false, message: 'Folder moved successfully', data };
};

const moveFolderToRoot = async (folderId: string | null): Promise<FolderResponse> => {
    const { data, error } = await supabase.rpc('move_folder_to_root', {
        p_folder_id: folderId,
    });

    if (error) {
        console.log(error);
        return errorManager(error);
    }

    return { error: false, message: 'Folder moved to root successfully', data };
};

const getFolderContent = async (folderId: string | null, slug: string): Promise<FolderResponse> => {
    const functionName = pageType === 'quill' ? 'getfoldercontentquill' : 'getfoldercontent';

    const { data, error } = await supabase.rpc(functionName, {
        p_folder_id: folderId,
        p_slug: slug,
    });

    if (error) {
        console.log(error);
        return errorManager(error);
    }

    return { error: false, message: 'Folder content retrieved successfully', data };
};

const getRootContent = async (slug: string): Promise<FolderResponse> => {

    const { data, error } = await supabase.rpc('getrootcontentquillfiltered', {
        p_slug: slug,
    });

    if (error) {
        console.log(error);
        return errorManager(error);
    }

    return { error: false, message: 'Folder content retrieved successfully', data };
};

const getAllRootContent = async (): Promise<FolderResponse> => {
    const functionName = pageType === 'quill' ? 'getrootcontentquill' : 'getrootcontent';
    const { data, error } = await supabase.rpc(functionName);
    if (error) {
        console.log(error);
        return errorManager(error);
    }
    return { error: false, message: 'Folder content retrieved successfully', data };
};

const getHierarchyFolderContent = async (folderId: string | null, p_slug: string): Promise<FolderResponse> => {
    const functionName = pageType === 'quill' ? 'gethierarchyfoldercontent' : 'gethierarchyfoldercontent';
    const { data, error } = await supabase.rpc(functionName, {
        p_folder_id: folderId,
        p_slug
    });

    if (error) {
        console.log(error);
        return errorManager(error);
    }

    return { error: false, message: 'Folder content retrieved successfully', data };
};

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
        moveFolderToRoot,
        getHierarchyFolderContent,
        getAllRootContent
    };
}
