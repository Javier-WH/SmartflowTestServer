import { PageItem } from "../../types/pageTypes";
import { Button, Popover } from "antd"
import { CiTrash } from "react-icons/ci";
import bulletIcon from "../../menu/assets/svg/addBulletListIcon.svg"
import numberIcon from "../../menu/assets/svg/addNumberedListIcon.svg"
import { PageContext, PageContextValues } from "../../page";
import { useContext, useEffect, useState } from "react";
import styles from "../../page.module.css"
import { Mode } from "../../types/pageEnums";

export default function ListComponent({ item }: { item: PageItem }) {
  const { pageContent, setPageContent } = useContext(PageContext) as PageContextValues;
  const [listContent, setListContent] = useState<string[]>([]);


  // Sincronizar con los items del contexto
  useEffect(() => {
    setListContent(item.listItems ?? []);
  }, [item.listItems]);

  useEffect(() => {
    const index = listContent.length - 1;
    const id = `${item.id}-${index}`;
    const element = document.getElementById(id);
    if (element) {
      element.focus();
      moveCursorToEnd(element);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listContent]);

  // Actualizar contexto cuando se pierde el foco
  const updateContext = () => {
    const updatedContent = pageContent.map(pageItem =>
      pageItem.id === item.id ? { ...pageItem, listItems: listContent } : pageItem
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

      if (listContent[listContent.length - 1] === ""){
        const listContentCopy = [...listContent];
        listContentCopy.pop();
        setListContent(listContentCopy);
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
      deleteItem(index);
      setTimeout(() => {
        const nextElementId = `${item.id}-${index - 1}`;
        const nextElement = document.getElementById(nextElementId) as HTMLElement;
        if (nextElement) {
          nextElement.focus();
          moveCursorToEnd(nextElement); // Mover el cursor al final del elemento
        }
      }, 1);
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
      <Popover content={<span style={{ color: "white" }}>Delete this list</span>} color="var(--folderTextColor)">
        <Button icon={<img src={bulletIcon} />} onClick={() => item.listType = "unordered"} />
        <Button icon={<img src={numberIcon} />} onClick={() => item.listType = "ordered"} />
        <Button icon={<CiTrash />} onClick={onDelete} />
      </Popover>
    </div>

  }

  return (
    <Popover  placement="topLeft" content={popContent()} color="var(--pageBarColor)" >
      <ul id={item.id} style={{ listStyleType: item.listType === "ordered" ? "decimal" : "disc" }}>
        {listContent.map((content, index) => (
          <li
            key={`${item.id}-${index}`}
            id={`${item.id}-${index}`}
            contentEditable={item.mode === Mode.Edit}
            onClick={e =>  e.stopPropagation()}
            onBlur={updateContext}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onInput={(e) => handleItemChange(index, e.currentTarget.textContent || "")}
            suppressContentEditableWarning
            className={styles.listItem}
          >
            {content}
          </li>
        ))}
      </ul>
    </Popover>
  );
}