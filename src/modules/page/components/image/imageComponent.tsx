import { PageItem } from "../../types/pageTypes";
import { Button, Popover } from "antd"
import { CiAlignLeft, CiAlignRight, CiAlignCenterH, CiTrash } from "react-icons/ci";
import { PageContext, PageContextValues } from "../../page";
import { useContext } from "react";
import styles from "../../page.module.css"


//import styles from "../../page.module.css"

export default function ImageComponent({ item }: { item: PageItem }) {

  const {pageContent, setPageContent} = useContext(PageContext) as PageContextValues
  const onClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
  }

  const onTextAlign = (aling: 'left' | 'right' | 'none') => {
    const pageContentCopy = JSON.parse(JSON.stringify(pageContent));
    const index = pageContentCopy.findIndex((pageItem: PageItem) => pageItem.id === item.id);
    const styles = pageContentCopy[index].styles
    styles.float = aling;
    styles.width = aling === 'none' ? "90%" : "40%";
    pageContentCopy[index].styles = styles;
    setPageContent(pageContentCopy);
  }

  const onDelete = () => {
    const pageContentCopy = JSON.parse(JSON.stringify(pageContent));
    const index = pageContentCopy.findIndex((pageItem: PageItem) => pageItem.id === item.id);
    pageContentCopy.splice(index, 1);
    setPageContent(pageContentCopy);
  }


  const popContent = () => {
    return <div className={styles.intemPopover}>
      <Button icon={<CiAlignLeft />} onClick={() => onTextAlign('left')} />
      <Button icon={<CiAlignCenterH />} onClick={() => onTextAlign('none')} />
      <Button icon={<CiAlignRight />} onClick={() => onTextAlign('right')}/> 
      <div className={styles.divider}>|</div>
      <Button icon={<CiTrash />} onClick={onDelete}/>
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