import { createContext, ReactNode, useState } from "react"
import { FolderNavigatorContextValues } from "../types/folder";
import CreateOrUpdateFolderModal from "../modal/createOrUpdateFolderModal";
import { Folder } from "../types/folder";
import { Spin } from "antd";



export const FolderNavigatorContext = createContext<FolderNavigatorContextValues | null>(null);


export const FolderNavigatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [Loading, setLoading] = useState(false);
  const [modalFolder, setModalFolder] = useState<Folder | null>(null);
  const [updateOnCreate, setUpdateOnCreate] = useState<string | null>( null);
  


  const values: FolderNavigatorContextValues = {
    Loading, 
    setLoading,
    modalFolder, 
    setModalFolder,
    updateOnCreate, 
    setUpdateOnCreate

  }

  return (
    <FolderNavigatorContext.Provider value={values}>
      <CreateOrUpdateFolderModal folder={modalFolder} setFolder={setModalFolder} setUpdateOnCreate ={setUpdateOnCreate}/>
      <div style={{height: "20px", marginBottom: "10px"}}>
        {
          Loading && <div><Spin /><span>{" Loading..."}</span> </div>
        }
      </div>
      {children}
    </FolderNavigatorContext.Provider>
  )
}