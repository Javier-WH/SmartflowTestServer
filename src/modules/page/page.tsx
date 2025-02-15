import { MainContext, MainContextValues } from "../mainContext"
import { createContext, useContext, useEffect, useState } from "react"
import type { Dispatch, SetStateAction } from "react";
import homeIcon from "../../assets/svg/homeIcon.svg"
import { useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from 'uuid';
import type { PageItem } from "./types/pageTypes.d.ts"
import { PageType, Mode } from "./types/pageEnums.ts"
import PageMenu from "./menu/pageMenu.tsx";
import styles from "./page.module.css"
import TextComponent from "./components/text/textComponent.tsx";
import ImageComponent from "./components/image/imageComponent.tsx";
import VideoComponent from "./components/video/videoComponent.tsx";
import ListComponent from "./components/list/listComponent.tsx";



export interface PageContextValues {
  pageContent: PageItem[];
  setPageContent: Dispatch<SetStateAction<PageItem[]>>;
  setPageContentPromise: (newItems: PageItem[]) => Promise<void>;
}

export const PageContext = createContext<PageContextValues | null>(null);

export default function Page() {
  const { setInPage } = useContext(MainContext) as MainContextValues
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [pageContent, setPageContent] = useState<PageItem[]>([]);

  
  function setPageContentPromise(newItems: PageItem[]): Promise<void> {
    return new Promise<void>((resolve) => {
      setPageContent(() => {
        resolve();
        return newItems;
      });
    });
  }

  useEffect(() => {
    setInPage(true)
    return () => {
      setInPage(false)
    }
  }, [setInPage])

  const handleClickOnPage = () => {
    const lastIdex = pageContent.length - 1
    if (pageContent.length === 0 || pageContent[lastIdex].type !== PageType.Text) {
      setPageContent([...pageContent, {
        id: uuidv4(),
        type: PageType.Text,
        text: "",
        styles: {
          width: "100%",
          float: "none",
          display: "block",
        },
        mode: Mode.Edit
      },])
      return
    }
    document.getElementById(pageContent[lastIdex].id)?.focus();
  }



  return <PageContext.Provider value={{ pageContent, setPageContent, setPageContentPromise }} >
    <div className={styles.pageMainContainer}>
      <div className={styles.pageMainButonsContainer} style={{ float: "right" }}>
        <button onClick={() => navigate(-1)}> <img src={homeIcon} /> {">"}</button>
      </div>
      <input placeholder="Give your page a title" className={styles.title} type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      <div onClick={handleClickOnPage} className={styles.pageContentContainer} id="pageContentContainer">
        {
          pageContent.map((item) => {
            if (item.type === PageType.Text) {
              return <TextComponent item={item} key={item.id} />
            } else if (item.type === PageType.Image) {
              return <ImageComponent item={item} key={item.id} />
            }else if (item.type === PageType.Video) {
              return <VideoComponent item={item} key={item.id} />
            }else if (item.type === PageType.List) {
              return <ListComponent item={item} key={item.id} />
            }
          })
        }
      </div>
      <div style={{ height: "50px" }}></div>
      <PageMenu />
    </div>
  </PageContext.Provider>


}