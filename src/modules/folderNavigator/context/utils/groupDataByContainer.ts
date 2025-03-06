 import { FolderData, FolderResquest } from "../../types/folder";
 
 const groupDataByContainer = (request: { data: FolderData[] }): FolderResquest => {

  const gruppedByContainer = request?.data?.reduce((acumulador: FolderResquest, _folder: FolderData) => {
    const { container_id, itemid, name, old_container_empty, old_container_id, published, type } = _folder;
    if (!acumulador[container_id]) {
      acumulador[container_id] = [];
    }
    //console.log({old_container_id, old_container_empty})
    if (old_container_empty === true && old_container_id !== null) {
      acumulador[old_container_id] = []
    }

    acumulador[container_id].push({
      id: itemid,
      type,
      name,
      published,
    });
    return acumulador;
  }, {});

  return gruppedByContainer;
}

export default groupDataByContainer