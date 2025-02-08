import { MainContext, MainContextValues } from "../mainContext"
import React, { useContext, useEffect, useState } from "react"
import homeIcon from "../../assets/svg/homeIcon.svg"
import { useNavigate } from "react-router-dom"
import styles from "./page.module.css"


enum PageType {
  Text = "text",
  Image = "image"
}
interface PageItem {
  type: PageType;
  text: string;
  src?: string;
  styles: React.CSSProperties
}

export default function Page() {
  const { setInPage } = useContext(MainContext) as MainContextValues
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [pageContent, setPageContent] = useState<PageItem[]>([
    {
      type: PageType.Image,
      text: "",
      src: "https://images.pexels.com/photos/20787/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      styles: {
        width: "100px",
        height: "100px",
        float: "right"
      }
    },
    {
      type: PageType.Text,
      text: "Hello absworld Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello worldHello world Hello world Hello world Hello world Hello world Hello world Hello world",
      styles: {
        width: "100%",
        height: "100%",
        float: "none"
      }
    },
  ]);




  useEffect(() => {
    setInPage(true)
    return () => {
      setInPage(false)
    }
  }, [setInPage])

  const handleClickOnPage = (e: React.MouseEvent) => {
    setPageContent([...pageContent, {
      type: PageType.Text,
      text: "Hello absworld Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello worldHello world Hello world Hello world Hello world Hello world Hello world Hello world",
      styles: {
        width: "100%",
        height: "100%",
        float: "none"
      }
    },])
  }

  
  
  return <>
    <div className={styles.pageMainContainer }>
      <div className={styles.pageMainButonsContainer} style={{float: "right"}}>
        <button onClick={() => navigate(-1) }> <img src={homeIcon}/> {">"}</button>
      </div>
        <input placeholder="Give your page a title" className={styles.title} type="text" value={title} onChange={(e) => setTitle(e.target.value)}/>
        <div onClick={handleClickOnPage}  className={styles.pageContentContainer}>

          {
            pageContent.map((item) => {
              if (item.type === PageType.Text) {
                return <span 
                        onClick={(e) => e.stopPropagation()}
                        style={item.styles}
                        className={styles.textItem} 
                        contentEditable>{item.text}
                      </span>
              }else if (item.type === PageType.Image) {
                return <img 
                        style={item.styles}
                        className={styles.imageItem} 
                        src={item.src || ""} 
                      />
              }
            })
          }

        </div>
    </div>
  </>

}