import { createContext, ReactNode, useState } from "react"




export interface MainContextValues  {
  inPage: boolean,
  setInPage: React.Dispatch<React.SetStateAction<boolean>>
}

export const MainContext = createContext<MainContextValues | null>(null);

export const MainContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [inPage, setInPage] = useState(false);

  const values: MainContextValues = {
    inPage, 
    setInPage
  }

  return <div style={{ display: "flex", flexDirection: "column" }}>
    <MainContext.Provider value={values}>
      {children}
    </MainContext.Provider>
  </div>

}