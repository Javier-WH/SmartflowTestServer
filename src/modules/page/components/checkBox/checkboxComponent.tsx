import { PageItem } from "../../types/pageTypes";
import { Button, Popover, Checkbox } from "antd"
import type { CheckboxChangeEvent } from 'antd';
import { CiTrash } from "react-icons/ci";
import { PageContext, PageContextValues } from "../../page";
import { useContext, useEffect, useState } from "react";
import { flushSync } from 'react-dom';
import styles from "../../page.module.css"
import { Mode } from "../../types/pageEnums";
import { PageType } from "../../types/pageEnums";
import { v4 as uuidv4 } from 'uuid';
import useFocusItem from "../../hooks/useFocusItem";

export default function ListComponent({ item }: { item: PageItem }) {
  const { pageContent, setPageContent, setPageContentPromise } = useContext(PageContext) as PageContextValues;
  const [listContent, setListContent] = useState<string[]>([]);
  const [checkedList, setCheckedList] = useState<boolean[]>([]);
  const { focusPrevItem, focusNextItem } = useFocusItem(item.id);

  function setListContentPromise(newItems: string[]): Promise<void> {
    return new Promise<void>((resolve) => {
      flushSync(() => {
        setListContent(newItems);
      });
      resolve();
    });
  }

  

  // Sincronizar con los items del contexto
  useEffect(() => {
    setListContent(item.listItems ?? []);
    setCheckedList(item.checkedItems ?? []);
  }, [item.listItems, item.checkedItems]);

  useEffect(() => {
    const index = listContent.length - 1;
    const id = `${item.id}-${index}`;
    const element = document.getElementById(id);
    const lastPageItemId = pageContent[pageContent.length - 1]?.id;
    if (element && lastPageItemId === item.id) {
      element.focus();
      moveCursorToEnd(element);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listContent]);

  // Actualizar contexto cuando se pierde el foco
  const updateContext = () => {
     const updatedContent = pageContent.map(pageItem =>
      pageItem.id === item.id ? { ...pageItem, listItems: listContent, checkedItems: checkedList } : pageItem
    );

    setPageContent(updatedContent);
  };

  // Manejar cambios en el contenido de los items
  const handleItemChange = (index: number, newText: string) => {
    listContent[index] = newText
  };

  // Agregar nuevo elemento al presionar Enter
  const addNewItem = (index: number) => {
    const newContent = [...listContent];
    newContent.splice(index + 1, 0, "");
    setListContent(newContent);

    const newChecked = [...checkedList];
    newChecked.splice(index + 1, 0, false);
    setCheckedList(newChecked);

    updateContext();

  };

  // Eliminar elemento al presionar Backspace
  const deleteItem = (index: number) => {
    if (listContent.length === 0) return;
    listContent.splice(index, 1);
    updateContext();

  };

  const isCursorAtStart = (element: HTMLElement): boolean => {
    if (!element) return false;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    const range = selection.getRangeAt(0);
    if (element.contains(range.startContainer)) {
      return selection.anchorOffset === 0;
    }
    return false;
  };


  // Manejar eventos de teclado
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (listContent[listContent.length - 1] === "") {
        const listContentCopy = [...listContent];
        listContentCopy.pop();
        setListContentPromise(listContentCopy).then(() => {
          const pageContentCopy = [...pageContent];
          if (pageContentCopy[pageContentCopy.length - 1].type !== PageType.Text) {
            const newTextItem: PageItem = {
              id: uuidv4(),
              type: PageType.Text,
              text: "",
              styles: {
                width: "100%",
                float: "none",
                display: "block"
              },
              mode: Mode.Edit
            };
            pageContentCopy.push(newTextItem);
          }
          setPageContentPromise(pageContentCopy).then(() => {
            focusNextItem()
          })
        })
        return
      }

      addNewItem(index);
      setTimeout(() => {
        const nextElementid = `${item.id}-${++index}`
        const nextElement = document.getElementById(nextElementid);
        nextElement?.focus();
      }, 1);

    } else if (e.key === "Backspace" && isCursorAtStart(e.currentTarget as HTMLElement)) {
      e.preventDefault();
      if (listContent.length === 1 && listContent[0] === "") {
        const pageContentCopy = [...pageContent];
        const intemIndex = pageContentCopy.findIndex((pageItem: PageItem) => pageItem.id === item.id);
        focusPrevItem().then(() => {
          pageContentCopy.splice(intemIndex, 1);
          setPageContent(pageContentCopy);
        })
        return
      }
      deleteItem(index);

      const nextElementId = `${item.id}-${index - 1}`;
      const nextElement = document.getElementById(nextElementId) as HTMLElement;
      if (nextElement) {
        nextElement.focus();
        moveCursorToEnd(nextElement);
      }

    }
  };



  const moveCursorToEnd = (element: HTMLElement) => {
    if (element) {
      const range = document.createRange();
      const selection = window.getSelection();

      // Crear un rango que apunte al final del contenido del elemento
      range.setStart(element, element.childNodes.length);
      range.collapse(true);

      // Establecer la selección al final del contenido del elemento
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  const onDelete = async () => {
    const pageContentCopy = await JSON.parse(JSON.stringify(pageContent));
    const index = pageContentCopy.findIndex((pageItem: PageItem) => pageItem.id === item.id);
    pageContentCopy.splice(index, 1);
    setPageContent(pageContentCopy);
  }



  const popContent = () => {
    return <div className={styles.intemPopover}>
      <Popover content={<span style={{ color: "white" }}>Delete this checkbox</span>} color="var(--folderTextColor)">
        <Button icon={<CiTrash />} onClick={onDelete} />
      </Popover>
    </div>

  }

  const onChange = (e: CheckboxChangeEvent, index: number) => {
    const checked = e.target.checked;
    const updatedCheckedList = [...checkedList];
    updatedCheckedList[index] = checked;
    setCheckedList(updatedCheckedList);
    updateContext();
  };

  useEffect(() => {
    const index = listContent.length - 1;
    const id = `${item.id}-${index}`;
    const element = document.getElementById(id);
    const lastPageItemId = pageContent[pageContent.length - 1]?.id;
    if (element && lastPageItemId === item.id) {
      element.focus();
      moveCursorToEnd(element);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listContent]);




  return (
    <Popover placement="topLeft" content={popContent()} color="var(--pageBarColor)"  >
      <div id={item.id} style={{ display: "flex", flexDirection: "column", marginLeft: "20px" }}>
        {listContent.map((content, index) => (
          <div style={{display: "flex", alignItems: "center", columnGap: "5px"}}>
            <Checkbox onBlur={updateContext} checked={checkedList[index]} onChange={e=> onChange(e, index)}></Checkbox>
            <span
              key={`${item.id}-${index}`}
              id={`${item.id}-${index}`}
              contentEditable={item.mode === Mode.Edit}
              onClick={e => e.stopPropagation()}
              onBlur={updateContext}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onInput={(e) => handleItemChange(index, e.currentTarget.textContent || "")}
              suppressContentEditableWarning
              className={styles.listItem}
            >
              {content}
            </span>
          </div>
        ))}
      </div>
    </Popover>
  );
}