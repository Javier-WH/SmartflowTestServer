/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useRef, useState } from "react";
import DraggableList from "react-draggable-list";
import { GoGrabber } from "react-icons/go";
import { Input, Collapse, Button } from "antd";
import { RightOutlined } from "@ant-design/icons";
import reactToWebComponent from "react-to-webcomponent";
import "antd/dist/reset.css";
import "./styles.css"; 
import ReactDOM from "react-dom/client";

// Definir tipos
interface ListItem {
  id: string;
  index: number;
  text: string;
  guidande: string;
}

interface ItemProps {
  item: ListItem;
  dragHandleProps: any;
  commonProps: {
    onTextChange: (id: string, text: string) => void;
    onGuidandeChange: (id: string, guidande: string) => void;
    onDeleteItem: (id: string) => void;
    onAddItem: (id: string) => void;
    onCollapseChange: (id: string) => void;
    onNextItem: (id: string) => void;
    activeItemId: string | null;
  };
}


class Item extends React.Component<ItemProps> {
  render() {
    const { item, dragHandleProps, commonProps } = this.props;
  
    return (
      <div className="disable-select" style={{ display: "flex", position: "relative" }} contentEditable={false}>
        <Collapse
          ghost
          expandIconPosition="end"
          expandIcon={({ isActive }) => (
            <RightOutlined style={{
              paddingTop: '50%',
              transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }} />
          )}
          activeKey={commonProps.activeItemId === item.id ? [item.id] : []}
          onChange={() => commonProps.onCollapseChange(item.id)}
        >
          <Collapse.Panel
            key={item.id}
            header={
              <div style={{ display: "flex", alignItems: "center" }}>
                <span className="item-index">{item.index + 1}</span>
                <Input
                  placeholder="What's the first step?"
                  value={item.text}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => commonProps.onTextChange(item.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commonProps.onAddItem(item.id);
                    }
                    if (e.key === "Backspace" && item.text === "") {
                      commonProps.onDeleteItem(item.id);
                    }
                  }}
                />
              </div>
            }
          >
            <Input.TextArea
              placeholder="Add a guidande (if is needed!)"
              style={{ resize: "none" }}
              value={item.guidande}
              onChange={(e) => commonProps.onGuidandeChange(item.id, e.target.value)}
            />
            <Button className="collapse-next-button" onClick={() => commonProps.onNextItem(item.id)}>Next</Button>
          </Collapse.Panel>
        </Collapse>

        <div className="drag-handle" {...dragHandleProps}>
          <GoGrabber />
        </div>
      </div>
    );
  }
}


// eslint-disable-next-line react-refresh/only-export-components
const GuidedCheckListWC = ({ title, items }: { title?: string; items?: string }) => {
  const [internalTitle, setInternalTitle] = useState(title || '');
  const [list, setList] = useState<ListItem[]>([]);
  const componentRef = useRef<HTMLElement>();
  const initialized = useRef(false);


  useEffect(() => {
    if (!initialized.current) {
      try {
        //load initial values
        const initialTitle = title || '';
        const initialItems = items ? JSON.parse(items) : [createNewItem()];

        setInternalTitle(initialTitle);

        const stabilizedItems = initialItems.map((item: ListItem, index: number) => ({
          ...item,
          id: item.id || crypto.randomUUID(),
          index
        }));

        setList(stabilizedItems);
      } catch (e) {
        setList([createNewItem()]);
      }
      initialized.current = true;
    }
  }, []);

  // update component attributes
  useEffect(() => {
    if (componentRef.current) {
      componentRef.current.setAttribute('title', internalTitle);
      componentRef.current.setAttribute('items', JSON.stringify(list));
    }
  }, [internalTitle, list]);

  const createNewItem = () => ({
    id: crypto.randomUUID(),
    index: list.length,
    text: "",
    guidande: ""
  });


  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleListChange = useCallback((
    newList: readonly unknown[],
    _movedItem: unknown,
    _oldIndex: number,
    _newIndex: number
  ) => {
    setList(prev => {
      const updatedList = newList.map((item, index) => ({
        ...(item as ListItem),
        index
      }));
      
      return JSON.stringify(prev) === JSON.stringify(updatedList) 
        ? prev 
        : updatedList;
    });
  }, []);

  const commonProps = {
    onTextChange: (id: string, text: string) => {
      setList(list.map(item => item.id === id ? { ...item, text } : item));
    },
    onGuidandeChange: (id: string, guidande: string) => {
      setList(list.map(item => item.id === id ? { ...item, guidande } : item));
    },
    onDeleteItem: (id: string) => {
      setList(list.filter(item => item.id !== id));
    },
    onAddItem: (id: string) => {
      const index = list.findIndex(item => item.id === id);
      const newItem = { id: crypto.randomUUID(), index: list.length, text: "", guidande: "" };
      setList([...list.slice(0, index + 1), newItem, ...list.slice(index + 1)]);
    },
    onCollapseChange: (id: string) => {
      setActiveItemId(activeItemId === id ? null : id);
    },
    onNextItem: (currentId: string) => {
      const currentIndex = list.findIndex(item => item.id === currentId);
      if (currentIndex < list.length - 1) {
        const nextItemId = list[currentIndex + 1].id;
        setActiveItemId(nextItemId);
      } 
    },
    activeItemId,
  };

  return (
    <div contentEditable={false} className="guided-checklist" ref={(el) => {
      if (el) componentRef.current = el.closest('guided-checklist') as HTMLElement | undefined;
    }}>
      <Input
        className="title-input"
        value={internalTitle}
        onChange={(e) => setInternalTitle(e.target.value)}
        placeholder="Optional title"
      />

      <div contentEditable={false} ref={containerRef}>
        <DraggableList
          itemKey="id"
          template={Item}
          list={list}
          onMoveEnd={(newList, movedItem, oldIndex, newIndex) => handleListChange(newList, movedItem, oldIndex, newIndex)}
          container={() => containerRef.current!}
          commonProps={commonProps}
        />
      </div>

      <Button className="add-item-button" contentEditable={false} onClick={() => commonProps.onAddItem(list[list.length - 1]?.id)}>
        +
      </Button>
    </div>
  );
};


customElements.define('guided-checklist', reactToWebComponent(GuidedCheckListWC, React, ReactDOM, {
  props: { 
    title: 'string',
    items: 'string'
  }
}));