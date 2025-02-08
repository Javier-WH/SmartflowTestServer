import { MainContext, MainContextValues } from "../mainContext"
import { createContext, useContext, useEffect, useState } from "react"
import type { Dispatch, SetStateAction } from "react";
import homeIcon from "../../assets/svg/homeIcon.svg"
import { useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from 'uuid';
import type {  PageItem } from "./types/pageTypes.d.ts"
import { PageType, Mode } from "./types/pageEnums.ts"
import styles from "./page.module.css"
import TextComponent from "./components/text/textComponent.tsx";
import ImageComponent from "./components/image/imageComponent.tsx";



export interface PageContextValues {
  pageContent: PageItem[];
  setPageContent: Dispatch<SetStateAction<PageItem[]>>;
}

export const PageContext = createContext<PageContextValues | null>(null);

export default function Page() {
  const { setInPage } = useContext(MainContext) as MainContextValues
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [pageContent, setPageContent] = useState<PageItem[]>([
    {
      id: uuidv4(),
      type: PageType.Image,
      src: "https://images.pexels.com/photos/20787/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      styles: {
        width: "100px",
        height: "100px",
        float: "left",
        display: "block",
        margin: "0 auto",
      },
      mode: Mode.Edit
    },
    {
      id: uuidv4(),
      type: PageType.Text,
      text: "Hello absworld Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello worldHello world Hello world Hello world Hello world Hello world Hello world Hello world",
      styles: {
        width: "100%",
        display: "block"
      },
      mode: Mode.Edit
    },
    {
      id: uuidv4(),
      type: PageType.Image,
      src: "https://images.pexels.com/photos/20787/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      styles: {
        width: "100px",
        height: "100px",
        float: "right",
        display: "block",
        margin: "0 auto",
        
      },
      mode: Mode.Edit
    },
    
  ]);


  useEffect(() => {
    setInPage(true)
    return () => {
      setInPage(false)
    }
  }, [setInPage])

  const handleClickOnPage = () => {

    const lastIdex = pageContent.length - 1
    if(pageContent.length === 0 || pageContent[lastIdex].type !== PageType.Text) {
      setPageContent([...pageContent, {
        id: uuidv4(),
        type: PageType.Text,
        text: "",
        styles: {
          width: "100%",
          float: "none",
          display: "block"
        },
        mode: Mode.Edit
      },])
      return
    }
    document.getElementById(pageContent[lastIdex].id)?.focus();
    

  }

  return <>
    <div className={styles.pageMainContainer }>
      <div className={styles.pageMainButonsContainer} style={{float: "right"}}>
        <button onClick={() => navigate(-1) }> <img src={homeIcon}/> {">"}</button>
      </div>
        <input placeholder="Give your page a title" className={styles.title} type="text" value={title} onChange={(e) => setTitle(e.target.value)}/>
        <div onClick={handleClickOnPage}  className={styles.pageContentContainer}>
        <PageContext.Provider value={{ pageContent, setPageContent }} > 
          {
            pageContent.map((item) => {
              if (item.type === PageType.Text) {
                return <TextComponent item={item} key={item.id}/>
              }else if (item.type === PageType.Image) {
                return <ImageComponent item={item} key={item.id}/>
              }
            })
          }
          </PageContext.Provider>
        </div>
    </div>
  </>

}