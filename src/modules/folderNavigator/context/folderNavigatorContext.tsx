import { createContext, ReactNode, useState } from "react"
import { FolderNavigatorContextValues } from "../types/folder";
import CreateOrUpdateFolderModal from "../modal/createOrUpdateFolderModal";
import DeleteFolderModal from "../modal/deleteFolderModal";
import { Folder, FolderResquest, FolderData } from "../types/folder";



export const FolderNavigatorContext = createContext<FolderNavigatorContextValues | null>(null);



export const FolderNavigatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [Loading, setLoading] = useState<string | null>(null);
  const [modalFolder, setModalFolder] = useState<Folder | null>(null);
  const [modalDeleteFolder, setModalDeleteFolder] = useState<Folder | null>(null);
  const [updateFolderRequest, setUpdateFolderRequest] = useState<FolderResquest | null>(null);



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

  const values: FolderNavigatorContextValues = {
    Loading,
    setLoading,
    modalFolder,
    setModalFolder,
    modalDeleteFolder,
    setModalDeleteFolder,
    updateFolderRequest, 
    setUpdateFolderRequest,
    groupDataByContainer
  }

  return <div style={{ display: "flex", flexDirection: "column" }}>
    <FolderNavigatorContext.Provider value={values}>
      <CreateOrUpdateFolderModal folder={modalFolder} setFolder={setModalFolder} setUpdateFolderRequest={setUpdateFolderRequest} groupDataByContainer={groupDataByContainer} />
      <DeleteFolderModal folder={modalDeleteFolder} setFolder={setModalDeleteFolder} setUpdateFolderRequest={setUpdateFolderRequest} />
      {children}
    </FolderNavigatorContext.Provider>
  </div>

}