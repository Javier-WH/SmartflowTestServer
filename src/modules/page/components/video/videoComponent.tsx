import { PageItem } from "../../types/pageTypes";
import { Button, Popover } from "antd"
import { CiTrash } from "react-icons/ci";
import { PageContext, PageContextValues } from "../../page";
import { useContext } from "react";
import styles from "../../page.module.css"


export default function VideoComponent({ item }: { item: PageItem }) {

  const { pageContent, setPageContent } = useContext(PageContext) as PageContextValues


  function extractVideoId(url: string): string | null {
    const regex = /[?&]v=([^&]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }
  const videoID = item.src ? extractVideoId(item.src) : null;
  const embedUrl = `https://www.youtube.com/embed/${videoID}`;

  const onDelete = async() => {
    const pageContentCopy = await JSON.parse(JSON.stringify(pageContent));
    const index = pageContentCopy.findIndex((pageItem: PageItem) => pageItem.id === item.id);
    pageContentCopy.splice(index, 1);
    setPageContent(pageContentCopy);
  }


  const popContent = () => {
    return <div className={styles.intemPopover}>
      <Popover content={<span style={{ color: "white" }}>Delete this video</span>} color="var(--folderTextColor)">
        <Button icon={<CiTrash />} onClick={onDelete} />
      </Popover>
    </div>

  }



  return <>
    <Popover content={popContent()} color="var(--pageBarColor)">
      <iframe 
        width="100%"
        height="400px"
        src={embedUrl} 
        title="YouTube video player" 
        style={{ objectFit: 'contain', margin: '0 auto' }}
        allowFullScreen
        >
        </iframe>
    </Popover>
  </>
}