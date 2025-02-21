import { PageItem } from "../../types/pageTypes";
import { Button, Popover } from "antd"
import { CiAlignLeft, CiAlignRight, CiAlignCenterH, CiTrash } from "react-icons/ci";
import { PageContext, PageContextValues } from "../../page";
import { useContext } from "react";
import styles from "../../page.module.css"

export default function ImageComponent({ item }: { item: PageItem }) {

  const {pageContent, setPageContent} = useContext(PageContext) as PageContextValues
  const onClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
  }

  const onTextAlign = async (aling: 'left' | 'right' | 'none') => {
    const pageContentCopy = await JSON.parse(JSON.stringify(pageContent));
    const index = pageContentCopy.findIndex((pageItem: PageItem) => pageItem.id === item.id);
    const styles = pageContentCopy[index].styles
    styles.float = aling;
    styles.width = aling === 'none' ? "90%" : "40%";
    pageContentCopy[index].styles = styles;
    setPageContent(pageContentCopy);
  }

  const onDelete = async () => {
    const pageContentCopy = await JSON.parse(JSON.stringify(pageContent));
    const index = pageContentCopy.findIndex((pageItem: PageItem) => pageItem.id === item.id);
    pageContentCopy.splice(index, 1);
    setPageContent(pageContentCopy);
  }


  const popContent = () => {
    return <div className={styles.intemPopover}>
      <Popover content={<span style={{ color: "white" }}>Aling left and wrap text</span>} color="var(--folderTextColor)">
        <Button icon={<CiAlignLeft />} onClick={() => onTextAlign('left')} />
      </Popover>
      <Popover content={<span style={{ color: "white" }}>Do not wrap text</span>} color="var(--folderTextColor)">
        <Button icon={<CiAlignCenterH />} onClick={() => onTextAlign('none')} />
      </Popover>
      <Popover content={<span style={{ color: "white" }}>Aling right and wrap text</span>} color="var(--folderTextColor)">
        <Button icon={<CiAlignRight />} onClick={() => onTextAlign('right')}/> 
      </Popover>
      <div className={styles.divider}>|</div>
      <Popover content={<span style={{ color: "white" }}>Delete this image</span>} color="var(--folderTextColor)">
        <Button icon={<CiTrash />} onClick={onDelete}/>
      </Popover>
    </div>

  }

  return <>
    <Popover content={popContent()} color="var(--pageBarColor)">
    <img 
      id={item.id}
      src={item.src} alt="" 
      onClick={onClick}
      style={item.styles}
    />
    </Popover>
  </>

}