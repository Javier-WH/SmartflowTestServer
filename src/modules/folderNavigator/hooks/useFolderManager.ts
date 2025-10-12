import supabase from '../../../lib/supabase';
import type { FolderResponse, SortableContent } from '../types/folder';
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

/**
 * Retrieves the content of a folder by its id or root if null.
 * @param folderId The id of the folder to retrieve its content. If null, retrieves the root content.
 * @param slug The slug of the organization.
 * @returns A FolderResponse object with the content of the folder.
 */
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
const getFilesCount = async (folderId: string): Promise<FolderResponse> => {

    const { data, error } = await supabase.rpc('getfilescount', {
        p_folder_id: folderId
    });

    if (error) {
        console.log(error);
        return errorManager(error);
    }

    return { error: false, message: 'Files count in folder retrieved successfully', data };
};

const sortFolderContent = async (
    sorteableContent: SortableContent[]
): Promise<boolean> => {
    const filesItem = [];
    const foldersItem = [];

    for (const item of sorteableContent) {
        const newItem = {
            id: item.id,
            order: item.order,
        };
        if (item.type === 1) {
            foldersItem.push(newItem);
        } else {
            filesItem.push(newItem);
        }
    }

    // Actualizar orden de archivos
    const fileUpdates = filesItem.map(item =>
        supabase
            .from('filesquill')
            .update({ order: item.order })
            .eq('id', item.id)
    );

    // Actualizar orden de carpetas
    const folderUpdates = foldersItem.map(item =>
        supabase
            .from('folders')
            .update({ order: item.order })
            .eq('id', item.id)
    );

    // Ejecutar ambas actualizaciones en paralelo
    const [fileResults, folderResults] = await Promise.all([
        Promise.all(fileUpdates),
        Promise.all(folderUpdates),
    ]);

    // Verificar errores en archivos
    const fileHasError = fileResults.some(({ error }) => error);
    if (fileHasError) {
        fileResults.forEach(({ error }, i) => {
            if (error) {
                console.error(`Error al actualizar archivo ${filesItem[i].id}:`, error.message);
            }
        });
    }

    // Verificar errores en carpetas
    const folderHasError = folderResults.some(({ error }) => error);
    if (folderHasError) {
        folderResults.forEach(({ error }, i) => {
            if (error) {
                console.error(`Error al actualizar carpeta ${foldersItem[i].id}:`, error.message);
            }
        });
    }

    if (fileHasError || folderHasError) {
        return false;
    }

    console.log('Órdenes de archivos y carpetas actualizadas correctamente');
    return true;
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
        getAllRootContent,
        getFilesCount,
        sortFolderContent
    };
}
