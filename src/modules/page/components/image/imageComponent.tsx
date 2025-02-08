import { PageItem } from "../../types/pageTypes";
//import styles from "../../page.module.css"

export default function ImageComponent({ item }: { item: PageItem }) {
  const onClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
  }

  return <>
    <img 
      id={item.id}
      src={item.src} alt="" 
      onClick={onClick}
      style={item.styles}
    />
  </>

}