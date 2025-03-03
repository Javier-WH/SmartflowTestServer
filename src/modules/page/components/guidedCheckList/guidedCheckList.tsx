import DraggableList from "react-draggable-list";
import React, { useEffect, useRef, useState, useContext } from "react";
import { PageItem } from "../../types/pageTypes";
import { GoGrabber } from "react-icons/go";
import { Input, Collapse, Button } from "antd";
import styles from "../../page.module.css"
import { v4 as uuidv4 } from 'uuid';
import { RightOutlined } from "@ant-design/icons";
import { PageContext, PageContextValues } from "../../page";

// Definir tipo para los elementos de la lista
export interface ListItem {
  id: string;
  index: number;
  text: string;
  guidande: string;
}

// Definir props para el componente Item
interface ItemProps {
  item: ListItem;
  itemSelected: number;
  dragHandleProps: {
    onMouseDown: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
  };
  commonProps: {
    onTextChange: (id: string, newText: string) => void;
    onGuidandeChange: (id: string, newGuidande: string) => void;
    onNextItem: (item: ListItem) => void;
    activeItemId: string | null;
    onCollapseChange: (itemId: string) => void;
    onDeleteItem: (itemId: string) => void;
    onAddItem: (itemId: string) => void;
    onSave: () => void;
  }
}

class Item extends React.Component<ItemProps> {

  handleNextClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    this.props.commonProps.onNextItem(this.props.item);
  };

  render() {
    const { item, dragHandleProps, commonProps } = this.props;
    const { onMouseDown, onTouchStart } = dragHandleProps;
    const { onTextChange, onGuidandeChange, activeItemId, onCollapseChange, onDeleteItem, onAddItem, onSave } = commonProps

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && item.text === "") {
        e.preventDefault();
        onDeleteItem(item.id);
      }else if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        onAddItem(item.id);
     
      }
    };

    return (
      <div className={styles.disableSelect}
        style={{
          display: "flex",
          position: "relative",
        }}>

        <Collapse
          className={styles.collapseWhite}
          style={{
            width: "100%",
            margin: "0px 5px",
            borderRadius: "0px",
            marginBottom: "-6px",
          }}
          expandIconPosition="end"
          expandIcon={({ isActive }) => (
            <RightOutlined
              style={{
                paddingTop: '50%',
                transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
          )}
          ghost
          activeKey={activeItemId === item.id ? [item.id] : []}
          onChange={() => onCollapseChange(item.id)} 
          items={[{
            key: item.id,
            label: <div className={styles.textItemContainer} style={{ display: "flex", alignItems: "center" }}>
              <span style={{
                marginRight: "8px",
                borderRadius: "50%",
                background: "hsla(209, 23%, 60%, 70%)",
                color: "white",
                width: "30px",
                height: "30px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "15px",
                fontWeight: "bold"
              }}>
                {item.index + 1}
              </span>
              <Input
                id={item.id}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "1.3rem",
                }}
                placeholder= {item.index === 0 ? "What's the first step" : "What's the next step"}
                value={item.text}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => onTextChange(item.id, e.target.value)}
                onKeyDown={onKeyDown}
                onBlur={onSave}
              />
            </div>,
            children: <div className={styles.textItemContainer} style={{ marginLeft: "20px", display: "flex", flexDirection: "column", alignItems: "start", gap: "10px" }}>
              <Input.TextArea
                style={{ border: "none", background: "transparent", height: "100px", resize: "none" }}
                placeholder="Add a Guidande (if is needed)"
                value={item.guidande}
                onChange={(e) => onGuidandeChange(item.id, e.target.value)}
                onBlur={onSave}
              />
              <Button 
                className={styles.nextButton} 
                style={{
                  background: "hsla(205,76%,39%,100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "3px",
                  padding: "20px 15px",
                }}
                variant="solid" 
                onClick={this.handleNextClick}>
                Next
              </Button>
            </div>
          }]}
        />

        <div
          className="disable-select dragHandle"
          style={{
            fontWeight: "600",
            cursor: "grab",
            width: "20px",
            height: "20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            scale: "1.5",
            position: "absolute",
            left: "-25px",
            top: "35%",

          }}
          onTouchStart={(e: React.TouchEvent) => {
            e.preventDefault();
            const target = e.target as HTMLElement;
            target.style.backgroundColor = "blue";
            document.body.style.overflow = "hidden";
            onTouchStart(e);
          }}
          onMouseDown={(e: React.MouseEvent) => {
            document.body.style.overflow = "hidden";
            onMouseDown(e);
          }}
          onTouchEnd={(e: React.TouchEvent) => {
            const target = e.target as HTMLElement;
            target.style.backgroundColor = "black";
            document.body.style.overflow = "visible";
          }}
          onMouseUp={() => {
            document.body.style.overflow = "visible";
          }}
        >
          <GoGrabber />
        </div>

      </div>
    );
  }
}
export default function GuidedCheckList({ item }: { item: PageItem }) {
  const {pageContent, setPageContentPromise} = useContext(PageContext) as PageContextValues
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null); 
  const [title, setTitle] = useState<string>("");
  const [list, setList] = useState<ListItem[]>([{
    id: uuidv4(),
    index: 0,
    text: "",
    guidande: ""
  }]);

  const saveState = () => {
    const pageContentCopy = [...pageContent];
    const index = pageContentCopy.findIndex((pageItem: PageItem) => pageItem.id === item.id);
    pageContentCopy[index].guidedCheckListItems = list;
    pageContentCopy[index].text = title;
    setPageContentPromise(pageContentCopy);
  }
  
  const setListPromise = (newList: ListItem[]) => {
    return new Promise<void>((resolve) => {
      setList(newList);
      setTimeout(() => {
        resolve();
      }, 1);
    })
  }


  useEffect(() => {
    if(list.length === 0){
      const pageContentCopy = [...pageContent]
      const index = pageContentCopy.findIndex((pageItem: PageItem) => pageItem.id === item.id);
      pageContentCopy.splice(index, 1);
      setPageContentPromise(pageContentCopy);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[list.length])

  useEffect(() => {
    const textTitle = item.text
    if(textTitle) setTitle(textTitle)
    const initialList = item.guidedCheckListItems
    if(!initialList) return
    setList(initialList)
    setActiveItemId(initialList[0].id); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updatedIndexs = (newList: ListItem[]) => {
    const updatedList = newList.map((item, index) => ({
      ...item,
      index: index,
    }));
    return updatedList

  }

  const addNewItem = (id: string | null) => {
    let index = -1;
    if(id === null){
      index = list.length
    }else{
      index = list.findIndex(item => item.id === id) + 1;
    }
 
    const newListItem: ListItem = {
      id: uuidv4(),
      index: list.length,
      text: "",
      guidande: ""
    }
    const newList = [...list]
    newList.splice(index, 0, newListItem)
    setListPromise(updatedIndexs(newList)).then(() => {
      const nextItemId = newList[index]?.id || null;
      if (nextItemId) {
        document.getElementById(nextItemId)?.focus();
      }
    })
  };
  const handleDeleteItem = (itemId: string) => {
    const updatedList = list.filter(item => item.id !== itemId);
    const index = list.findIndex(item => item.id === itemId) -1;
    setListPromise(updatedIndexs(updatedList)).then(() => {  
      const previusItem = updatedList[index]?.id || null;
      if (previusItem) {
        document.getElementById(previusItem)?.focus();
      }
    })
    //setList(updatedIndexs(updatedList));

  }


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _onListChange = (newList: readonly unknown[], _movedItem: unknown, _oldIndex: number, _newIndex: number) => {
    // Cast newList to ListItem[] to work with it correctly
    const typedNewList = newList as ListItem[];
    setListPromise(updatedIndexs(typedNewList)).then(() => {
      const pageContentCopy = [...pageContent];
      const index = pageContentCopy.findIndex((pageItem: PageItem) => pageItem.id === item.id);
      pageContentCopy[index].guidedCheckListItems = typedNewList;
      pageContentCopy[index].text = title;
      setPageContentPromise(pageContentCopy);
    })

  };

  const handleTextChange = (id: string, newText: string) => {
    setList(prevList => prevList.map(item =>
      item.id === id ? { ...item, text: newText } : item
    ));
  };

  const handleGuidandeChange = (id: string, newGuidande: string) => {
    setList(prevList => prevList.map(item =>
      item.id === id ? { ...item, guidande: newGuidande } : item
    ));
  };

  const handleNextItem = (currentItem: ListItem) => {
    const currentIndex = list.findIndex(item => item.id === currentItem.id);
    if (currentIndex < list.length - 1) {
      const nextItem = list[currentIndex + 1];
      setActiveItemId(nextItem.id);
    } else {
      setActiveItemId(null); 
    }
  };

  const handleCollapseChange = (itemId: string) => { 
    if (activeItemId === itemId) {
      setActiveItemId(null); // Cierra si ya está abierto
    } else {
      setActiveItemId(itemId); // Abre si está cerrado
    }
  };



  return (
    <div className={styles.textInputContainer}
      id={item.id}
      onClick={(e) => e.stopPropagation()}
      style={{ background: "hsla(209,34%,30%,5%)", width: "100%" }}
    >
      <Input
        placeholder="Optional title"
        className={styles.inputGuidedCheckList}
        style={{
          border: "none",
          background: "transparent",
          fontSize: "1.2rem",
        }}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={saveState}
      />
      <div
        ref={containerRef}

      >
        <DraggableList
          itemKey="id"
          template={Item}
          list={list}
          onMoveEnd={_onListChange}
          container={() => containerRef.current as HTMLElement}
          commonProps={{
            onTextChange: handleTextChange,
            onGuidandeChange: handleGuidandeChange,
            onNextItem: handleNextItem,
            activeItemId: activeItemId,
            onCollapseChange: handleCollapseChange,
            onDeleteItem: handleDeleteItem,
            onAddItem: addNewItem,
            onSave: saveState
          }}
        />
      </div>
      <div
        style={{
          height: "30px",
          color: "gray",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={()=>addNewItem(null)}
      >
        +
      </div>
    </div>
  );
}