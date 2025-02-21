import { MainContext, MainContextValues } from "../mainContext"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import type { Dispatch, SetStateAction } from "react";
import homeIcon from "../../assets/svg/homeIcon.svg"
import { useNavigate, useParams } from "react-router-dom";
import type { PageItem } from "./types/pageTypes.d.ts"
import { PageType } from "./types/pageEnums.ts"
import PageMenu from "./menu/pageMenu.tsx";
import styles from "./page.module.css"
import TextComponent from "./components/text/textComponent.tsx";
import ImageComponent from "./components/image/imageComponent.tsx";
import VideoComponent from "./components/video/videoComponent.tsx";
import ListComponent from "./components/list/listComponent.tsx";
import CheckboxComponent from "./components/checkBox/checkboxComponent.tsx";
import HelpBlockComponent from "./components/helpBlock/helpBlockComponent.tsx";
import MultipleChoisesComponent from "./components/multipleChoises/multipleChoisesComponent.tsx";
import TextInputComponent from "./components/textInput/textInputComponent.tsx";
import GuidedCheckList from "./components/guidedCheckList/guidedCheckList.tsx";
import { getRawTextComponent } from "./components/rawComponents/getRawComponents.ts";
import useFilesManager from "../folderNavigator/hooks/useFileManager.ts";
import { Spin } from "antd";



export interface PageContextValues {
  pageContent: PageItem[];
  setPageContent: Dispatch<SetStateAction<PageItem[]>>;
  setPageContentPromise: (newItems: PageItem[]) => Promise<void>;
}

export const PageContext = createContext<PageContextValues | null>(null);

export default function Page() {
  const { setInPage } = useContext(MainContext) as MainContextValues
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [pageContent, setPageContent] = useState<PageItem[]>([]);
  const pendingResolvers = useRef<(() => void)[]>([]);
  const { getFileContent, updateFileContent } = useFilesManager();
  const [ableToSave, setAbleToSave] = useState(false);


  // update page content
  useEffect(() => {
    if (id) {
      setAbleToSave(false)
      getFileContent(id)
        .then((response) => {
          if (response.error) return
          const { content, name } = response.data;
          setTitle(name === 'untitled' ? '' : name);
          const  parcedContent: PageItem[] = content ? JSON.parse(content) : [];
          setPageContent(parcedContent);
        })
        .catch((error) => console.error(error))
        .finally(() => setAbleToSave(true))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /// this is magic, dont touch it
  // this is used to manage asynconous page contente updates
  function setPageContentPromise(newItems: PageItem[]): Promise<void> {
    return new Promise<void>((resolve) => {
      pendingResolvers.current.push(resolve);
      setPageContent(newItems);
    });
  }

  useEffect(() => {
    const resolvers = pendingResolvers.current;
    pendingResolvers.current = [];
    resolvers.forEach((resolve: () => void) => resolve());
    // update database
    if (id && ableToSave) {
        const content = JSON.stringify(pageContent)
        updateFileContent(id, content, title)
        .then((response) => {
            if (response.error){
              console.error(response)
              return
            }
        })
        .catch((error) => console.error(error));
    
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageContent]);
  /////

  // handle nav bar style
  useEffect(() => {
    setInPage(true)
    return () => {
      setInPage(false)
    }
  }, [setInPage])

  // add a span text to the page que clicked on it
  const handleClickOnPage = () => {
    const lastIdex = pageContent.length - 1
    if (pageContent.length === 0 || pageContent[lastIdex].type !== PageType.Text) {
      const newTextContent = getRawTextComponent();
      setPageContentPromise([...pageContent, newTextContent])
        .then(() => {
          document.getElementById(newTextContent.id)?.focus();
        })
    }
  }

  // this hadle when enter is pressed on the title input
  const handleKeyDownOnTitle = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (pageContent.length === 0) {
        handleClickOnPage();
        return
      }
      const firstContentID = pageContent[0].id;

      if (pageContent[0].type === PageType.Text) {
        document.getElementById(firstContentID)?.focus();
        return
      }

      const newContent = [...pageContent];
      const newTextContent: PageItem = getRawTextComponent();
      newContent.unshift(newTextContent);
      setPageContentPromise(newContent)
        .then(() => {
          document.getElementById(newTextContent.id)?.focus();
        })
    }

  }

  if (!ableToSave) {
    return <div style={{ width: "100vw", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: "10px" }} >
      <Spin size="large" />
      <span style={{ color: "gray" }}>Loading...</span>
    </div>
  }
  return <PageContext.Provider value={{ pageContent, setPageContent, setPageContentPromise }} >
    <div className={styles.pageMainContainer}>
      <div className={styles.pageMainButonsContainer} style={{ float: "right" }}>
        <button onClick={() => navigate(-1)}> <img src={homeIcon} /> {">"}</button>
      </div>
      <input
        placeholder="Give your page a title"
        className={styles.title} type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDownOnTitle}
      />
      <div onClick={handleClickOnPage} className={styles.pageContentContainer} id="pageContentContainer">
        {
          pageContent.map((item) => {
            if (item.type === PageType.Text) {
              return <TextComponent item={item} key={item.id} />
            } else if (item.type === PageType.Image) {
              return <ImageComponent item={item} key={item.id} />
            } else if (item.type === PageType.Video) {
              return <VideoComponent item={item} key={item.id} />
            } else if (item.type === PageType.List) {
              return <ListComponent item={item} key={item.id} />
            } else if (item.type === PageType.CheckBox) {
              return <CheckboxComponent item={item} key={item.id} />
            } else if (item.type === PageType.HelpBlock) {
              return <HelpBlockComponent item={item} key={item.id} />
            } else if (item.type === PageType.MultipleChoises) {
              return <MultipleChoisesComponent item={item} key={item.id} />
            } else if (item.type === PageType.TextInput) {
              return <TextInputComponent item={item} key={item.id} />
            } else if (item.type === PageType.GuidedCheckList) {
              return <GuidedCheckList item={item} key={item.id} />
            }
          })
        }
      </div>
      <div style={{ height: "50px" }}></div>
      <PageMenu />
    </div>
  </PageContext.Provider>


}