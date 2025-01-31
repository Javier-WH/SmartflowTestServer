import { createContext, ReactNode, useState } from "react"
import { FolderNavigatorContextValues } from "../types/folder";
import { Spin } from "antd";



export const FolderNavigatorContext = createContext<FolderNavigatorContextValues | null>(null);


export const FolderNavigatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [Loading, setLoading] = useState(false);


  const values: FolderNavigatorContextValues = {
    Loading, setLoading
  }

  return (
    <FolderNavigatorContext.Provider value={values}>
      <div style={{height: "20px", marginBottom: "10px"}}>
        {
          Loading && <Spin />
        }
      </div>
      {children}
    </FolderNavigatorContext.Provider>
  )
}