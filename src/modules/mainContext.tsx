import { createContext, type ReactNode, useState } from "react"
import type { Folder, FolderResquest } from "./folderNavigator/types/folder";

export interface MainContextValues  {
  inPage: boolean,
  setInPage: React.Dispatch<React.SetStateAction<boolean>>,
  newFolderRequest: Folder | null,
  setNewFolderRequest: React.Dispatch<React.SetStateAction<Folder | null>>,
  updateFolderRequestFromMain: FolderResquest | null,
  setUpdateFolderRequestFromMain: React.Dispatch<React.SetStateAction<FolderResquest | null>>
}

export const MainContext = createContext<MainContextValues | null>(null);

export const MainContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [inPage, setInPage] = useState(false);
  const [newFolderRequest, setNewFolderRequest] = useState<Folder | null>(null);
  const [updateFolderRequestFromMain, setUpdateFolderRequestFromMain] = useState<FolderResquest | null>(null);

  const values: MainContextValues = {
    inPage, 
    setInPage,
    newFolderRequest, 
    setNewFolderRequest,
    updateFolderRequestFromMain, 
    setUpdateFolderRequestFromMain
  }

  return (
      <MainContext.Provider value={values}>
        {children}
      </MainContext.Provider>
  )

}
