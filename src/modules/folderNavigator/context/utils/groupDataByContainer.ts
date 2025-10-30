import { FolderData, FolderResquest } from "../../types/folder";

const groupDataByContainer = (request: { data: FolderData[] }): FolderResquest => {



  
  const gruppedByContainer = request?.data?.reduce((folderList: FolderResquest, _folder: FolderData) => {

    const { container_id, itemid, name, published, type, filesnumber, order, old_container_empty, old_container_id } = _folder;
    const currentContainerId = container_id || 'null_root';

    if (!folderList[currentContainerId]) {
      folderList[currentContainerId] = [];
    }

    if (old_container_empty === true && old_container_id) {
      folderList[old_container_id] = []
    }



    folderList[currentContainerId].push({
      id: itemid,
      type,
      name,
      published,
      filesnumber,
      order: order || 0
    });

    return folderList;
  }, {});



  // Obtenemos un array de todos los container_id (claves del objeto)
  const sortedResult: FolderResquest = {};

  for (const containerId in gruppedByContainer) {
    if (Object.prototype.hasOwnProperty.call(gruppedByContainer, containerId)) {

      // Ordenamos el array de carpetas dentro de este grupo específico
      const sortedFolders = gruppedByContainer[containerId].sort((a, b) => {
        // Orden ascendente: a.order - b.order
        return a.order - b.order;
      });

      sortedResult[containerId] = sortedFolders;
    }
  }

  return sortedResult;
}

export default groupDataByContainer;