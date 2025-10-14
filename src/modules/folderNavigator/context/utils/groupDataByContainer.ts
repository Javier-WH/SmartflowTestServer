import { FolderData, FolderResquest } from "../../types/folder";

const groupDataByContainer = (request: { data: FolderData[] }): FolderResquest => {

  const containersToClear: Set<string> = new Set();

  
  request?.data?.forEach(f => {
    if (f.old_container_empty === true && f.old_container_id) {
      containersToClear.add(f.old_container_id);
    }
  });

  
  const gruppedByContainer = request?.data?.reduce((acumulador: FolderResquest, _folder: FolderData) => {

    const { container_id, itemid, name, published, type, filesnumber, order } = _folder;
    const currentContainerId = container_id || 'null_root';

    if (!acumulador[currentContainerId]) {
      acumulador[currentContainerId] = [];
    }



    acumulador[currentContainerId].push({
      id: itemid,
      type,
      name,
      published,
      filesnumber,
      order: order || 0
    });

    return acumulador;
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