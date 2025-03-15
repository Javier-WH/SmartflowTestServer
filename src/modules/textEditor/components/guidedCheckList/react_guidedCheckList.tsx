/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {useRef, useState } from "react";
import DraggableList from "react-draggable-list";
import { GoGrabber } from "react-icons/go";
import { Input, Collapse, Button } from "antd";
import { RightOutlined } from "@ant-design/icons";
import reactToWebComponent from "react-to-webcomponent";
import "antd/dist/reset.css";
import "./styles.css"; 
import ReactDOM from "react-dom";

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
    activeItemId: string | null;
  };
}

// Componente Item ajustado
class Item extends React.Component<ItemProps> {
  render() {
    const { item, dragHandleProps, commonProps } = this.props;

    return (
      <div className="disable-select" style={{ display: "flex", position: "relative" }}>
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
                  value={item.text}
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
              value={item.guidande}
              onChange={(e) => commonProps.onGuidandeChange(item.id, e.target.value)}
            />
            <Button onClick={() => commonProps.onAddItem(item.id)}>Next</Button>
          </Collapse.Panel>
        </Collapse>

        <div className="drag-handle" {...dragHandleProps}>
          <GoGrabber />
        </div>
      </div>
    );
  }
}

// Componente principal convertido
const GuidedCheckListWC = ({ title, items }: { title?: string; items?: string }) => {
  const [list, setList] = useState<ListItem[]>(JSON.parse(items || "[]"));
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleListChange = (newList: readonly unknown[], _movedItem: unknown, _oldIndex: number, _newIndex: number) => {
    setList(newList.map((item, index) => ({ ...(item as ListItem), index })));
  };

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
    activeItemId,
  };

  return (
    <div className="guided-checklist">
      <Input
        className="title-input"
        value={title}
        onChange={(e) => {/* Implementar si es necesario */ }}
      />

      <div ref={containerRef}>
        <DraggableList
          itemKey="id"
          template={Item}
          list={list}
          onMoveEnd={(newList, movedItem, oldIndex, newIndex) => handleListChange(newList, movedItem, oldIndex, newIndex)}
          container={() => containerRef.current!}
          commonProps={commonProps}
        />
      </div>

      <Button onClick={() => commonProps.onAddItem(list[list.length - 1]?.id)}>
        +
      </Button>
    </div>
  );
};

// Convertir a Web Component
customElements.define('guided-checklist', reactToWebComponent(GuidedCheckListWC, React, ReactDOM));