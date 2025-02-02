import { createContext, ReactNode, useState } from "react"
import { FolderNavigatorContextValues } from "../types/folder";
import CreateOrUpdateFolderModal from "../modal/createOrUpdateFolderModal";
import DeleteFolderModal from "../modal/deleteFolderModal";
import { Folder, FolderResquest } from "../types/folder";
import { Spin } from "antd";



export const FolderNavigatorContext = createContext<FolderNavigatorContextValues | null>(null);


export const FolderNavigatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [Loading, setLoading] = useState<string | null>(null);
  const [modalFolder, setModalFolder] = useState<Folder | null>(null);
  const [modalDeleteFolder, setModalDeleteFolder] = useState<Folder | null>(null);
  const [updateOnCreate, setUpdateOnCreate] = useState<string | null>(null);
  const [updateFolderRequest, setUpdateFolderRequest] = useState<FolderResquest | null>(null);



  const values: FolderNavigatorContextValues = {
    Loading,
    setLoading,
    modalFolder,
    setModalFolder,
    modalDeleteFolder,
    setModalDeleteFolder,
    updateOnCreate,
    setUpdateOnCreate,
    updateFolderRequest, 
    setUpdateFolderRequest
  }

  return <div style={{ display: "flex", flexDirection: "column" }}>
    <FolderNavigatorContext.Provider value={values}>
      <CreateOrUpdateFolderModal folder={modalFolder} setFolder={setModalFolder} setUpdateOnCreate={setUpdateOnCreate} />
      <DeleteFolderModal folder={modalDeleteFolder} setFolder={setModalDeleteFolder} setUpdateOnCreate={setUpdateOnCreate} />
      <div style={{ height: "20px", marginBottom: "10px" }}>
        {
          Loading && <div><Spin /><span>{" Loading..."}</span> </div>
        }
      </div>
      {children}
    </FolderNavigatorContext.Provider>
  </div>

}