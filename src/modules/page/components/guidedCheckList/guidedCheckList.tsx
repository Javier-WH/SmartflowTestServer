import DraggableList from "react-draggable-list";
import React, { useEffect, useRef, useState } from "react";
import { PageItem } from "../../types/pageTypes";
import { GoGrabber } from "react-icons/go";
import { Input, Collapse, Button } from "antd";
import styles from "../../page.module.css"
import { v4 as uuidv4 } from 'uuid';
import { RightOutlined } from "@ant-design/icons";

// Definir tipo para los elementos de la lista
interface ListItem {
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
    const { onTextChange, onGuidandeChange, activeItemId, onCollapseChange, onDeleteItem, onAddItem } = commonProps

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && item.text === "") {
        e.preventDefault();
        onDeleteItem(item.id);
      }else if (e.key === "Enter") {
        e.preventDefault();
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
                width: "20px",
                height: "20px",
                textAlign: "center",
              }}>
                {item.index + 1}
              </span>
              <Input
                style={{
                  border: "none",
                  background: "transparent"
                }}
                placeholder= {item.index === 0 ? "What's the first step" : "What's the next step"}
                value={item.text}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => onTextChange(item.id, e.target.value)}
                onKeyDown={onKeyDown}
              />
            </div>,
            children: <div className={styles.textItemContainer} style={{ marginLeft: "20px", display: "flex", flexDirection: "column", alignItems: "start", gap: "10px" }}>
              <Input
                style={{ border: "none", background: "transparent" }}
                placeholder="Add a Guidande (if is needed)"
                value={item.guidande}
                onChange={(e) => onGuidandeChange(item.id, e.target.value)}
              />
              <Button 
                className={styles.nextButton} 
                style={{
                  background: "hsla(205,76%,39%,100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "3px",
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
            console.log("touchStart");
            const target = e.target as HTMLElement;
            target.style.backgroundColor = "blue";
            document.body.style.overflow = "hidden";
            onTouchStart(e);
          }}
          onMouseDown={(e: React.MouseEvent) => {
            console.log("mouseDown");
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

  const [list, setList] = useState<ListItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null); // Estado para el Collapse activo

  useEffect(() => {
    const initialList: ListItem[] = [
      {
        id: uuidv4(),
        index: 0,
        text: "",
        guidande: ""
      },
      {
        id: uuidv4(),
        index: 1,
        text: "",
        guidande: ""
      }
    ];
    setList(initialList)
    setActiveItemId(initialList[0].id); // Expande el primer item inicialmente
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
    setList(updatedIndexs(newList));

  };



  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _onListChange = (newList: ListItem[]) => {
    setList(updatedIndexs(newList));
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

  const handleDeleteItem = (itemId: string) => {
    const updatedList = list.filter(item => item.id !== itemId);
    setList(updatedIndexs(updatedList));
  }

  return (
    <div className={styles.textInputContainer}
      id={item.id}
      onClick={(e) => e.stopPropagation()}
      style={{ background: "hsla(209, 34%, 30%, 7%" }}
    >
      <Input
        placeholder="Optional title"
        className={styles.inputGuidedCheckList}
        style={{
          border: "none",
          background: "transparent"
        }}
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
            onAddItem: addNewItem
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