import { PageItem } from "../../types/pageTypes";
import { Button, Popover, Checkbox } from "antd"
import type { CheckboxChangeEvent } from 'antd';
import { CiTrash } from "react-icons/ci";
import { RiCloseLargeLine } from "react-icons/ri";
import { PageContext, PageContextValues } from "../../page";
import { useContext, useEffect, useState } from "react";
import { flushSync } from 'react-dom';
import styles from "../../page.module.css"
import { Mode } from "../../types/pageEnums";
import { PageType } from "../../types/pageEnums";
import { v4 as uuidv4 } from 'uuid';
import useFocusItem from "../../hooks/useFocusItem";
import addCheckboxIcon from "../../menu/assets/svg/addCheckBoxIcon.svg"
import addMultipleChoiceIcon from "../../menu/assets/svg/addMultipleChoisesIcon.svg"
import { LuRows4, LuColumns4 } from "react-icons/lu";
import { getRawTextComponent } from "../rawComponents/getRawComponents";

export default function MultipleChoisesComponent({ item }: { item: PageItem }) {
  const { pageContent, setPageContent, setPageContentPromise } = useContext(PageContext) as PageContextValues;
  const [listContent, setListContent] = useState<string[]>([]);
  const [checkedList, setCheckedList] = useState<boolean[]>([]);
  const { focusPrevItem, focusNextItem } = useFocusItem(item.id);
  const [itemKeys, setItemKeys] = useState<string[]>([]);
  const [flexDirection, setFlexDirection] = useState<"column" | "row">("column");
  const [questions, setQuestions] = useState<string>("");

  useEffect(() => {
    if (item.listItems && itemKeys.length === 0) {
      setItemKeys(item.listItems.map(() => uuidv4()));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.listItems]);



  // Sincronizar con los items del contexto
  useEffect(() => {
    setListContent(item.listItems ?? []);
    setCheckedList(item.checkedItems ?? []);
    setQuestions(item.text ?? "");
    setFlexDirection(item.direction ?? "row");
  }, [item.listItems, item.checkedItems, item.text, item.direction]);

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

  function setListContentPromise(newItems: string[]): Promise<void> {
    return new Promise<void>((resolve) => {
      flushSync(() => {
        setListContent(newItems);
      });
      resolve();
    });
  }

  // Actualizar contexto cuando se pierde el foco
  const updateContext = () => {
    const updatedContent = pageContent.map(pageItem =>
      pageItem.id === item.id ? { ...pageItem, listItems: listContent, checkedItems: checkedList, text: questions } : pageItem
    );

    setPageContent(updatedContent);
  };

  // Manejar cambios en el contenido de los items
  const handleItemChange = (index: number, newText: string) => {
    const newListContent = [...listContent]; // Crear copia del array
    newListContent[index] = newText;
    setListContent(newListContent); // Actualizar estado
  };

  // Agregar nuevo elemento al presionar Enter
  const addNewItem = (index: number) => {
    const newContent = [...listContent];
    newContent.splice(index + 1, 0, "");
    setListContent(newContent);

    const newChecked = [...checkedList];
    newChecked.splice(index + 1, 0, false);
    setCheckedList(newChecked);

    const newKeys = [...itemKeys];
    newKeys.splice(index + 1, 0, uuidv4()); // Agregar nueva key
    setItemKeys(newKeys);

    updateContext();
  };

  // Eliminar elemento al presionar Backspace
  const deleteItem = (index: number) => {
    if (listContent.length === 0) return;
    listContent.splice(index, 1);
    updateContext();

    if (listContent.length === 0 || (listContent.length === 1 && listContent[0] === "")) {
      const pageContentCopy = [...pageContent];
      const intemIndex = pageContentCopy.findIndex((pageItem: PageItem) => pageItem.id === item.id);
      focusPrevItem().then(() => {
        pageContentCopy.splice(intemIndex, 1);
        setPageContent(pageContentCopy);
      })
      return
    }
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
            const newTextItem: PageItem = getRawTextComponent();
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

  const onChangeCheckType = (checkType: "checkbox" | "radio") => {
    const pageContentCopy = [...pageContent];
    const index = pageContentCopy.findIndex((pageItem: PageItem) => pageItem.id === item.id);
    pageContentCopy[index].checkType = checkType;
    setPageContent(pageContentCopy);
  }

  const onChangeDirection = (direction: "column" | "row") => {
    const pageContentCopy = [...pageContent];
    const index = pageContentCopy.findIndex((pageItem: PageItem) => pageItem.id === item.id);
    pageContentCopy[index].direction = direction;
    setPageContent(pageContentCopy);
  }


  const popContent = () => {
    return <div className={styles.intemPopover}>
      <Popover content={<span style={{ color: "white" }}>Display as vertical list</span>} color="var(--folderTextColor)">
        <Button type="primary" icon={<LuRows4 />} onClick={() => onChangeDirection("column")}/>
      </Popover>
      <Popover content={<span style={{ color: "white" }}>Display as horizontal list</span>} color="var(--folderTextColor)">
        <Button type="primary" icon={<LuColumns4 />} onClick={() => onChangeDirection("row")} />
      </Popover>
      <Popover content={<span style={{ color: "white" }}>Support one choice</span>} color="var(--folderTextColor)">
        <Button type="primary" icon={<img src={addMultipleChoiceIcon} />} onClick={() => onChangeCheckType("radio")} />
      </Popover>
      <Popover content={<span style={{ color: "white" }}>Support multiple choices</span>} color="var(--folderTextColor)">
        <Button type="primary" icon={<img src={addCheckboxIcon} />} onClick={() => onChangeCheckType("checkbox")} />
      </Popover>
      <Popover content={<span style={{ color: "white" }}>Delete multiple choice element</span>} color="var(--folderTextColor)">
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

  const onChangeRadio = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const checked = e.target.checked;
    const updatedCheckedList = checkedList.map(() => false);
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

  const handleClickAddButton = () => {
    addNewItem(listContent.length - 1)
    setTimeout(() => {
      const nextElementid = `${item.id}-${listContent.length}`
      const nextElement = document.getElementById(nextElementid);
      nextElement?.focus();
    }, 1)
  }

  return (
    <Popover content={popContent()} color="var(--pageBarColor)"  >
      <div id={item.id} className={styles.mcContainer} style={{ position: "relative" }}>
        <input
          placeholder="Ask a question"
          style={{ width: "100%", outline: "none", border: "none", backgroundColor: "transparent"}}
          type="text"
          readOnly={item.mode !== Mode.Edit}
          onClick={e => e.stopPropagation()}
          onBlur={updateContext}
          value={questions}
          onChange={(e) => setQuestions(e.target.value)}
          />
        <div style={{ display: "flex", flexDirection: flexDirection, rowGap: "1px", columnGap: "10px" }}>
          {listContent.map((content, index) => (
            <div
              key={itemKeys[index]} 
              style={{ display: "flex", alignItems: "center", justifyContent: "center", columnGap: "5px", position: "relative", width: "100%" }}
              className={styles.mcItem}
            >
              {
                item.checkType === "checkbox"
                  ? <Checkbox
                    style={{ pointerEvents: "none" }}
                    onBlur={updateContext}
                    checked={checkedList[index]}
                    onChange={e => onChange(e, index)}>
                  </Checkbox>
                  : <input
                    style={{ pointerEvents: "none" }}
                    name={item.id}
                    type="radio"
                    onBlur={updateContext}
                    checked={checkedList[index]}
                    onClick={e => e.stopPropagation()}
                    onChange={e => onChangeRadio(e, index)}>
                  </input>
              }
              <input
                type="text"
                key={`${item.id}-${index}`}
                id={`${item.id}-${index}`}
                readOnly={item.mode !== Mode.Edit}
                onClick={e => e.stopPropagation()}
                onBlur={updateContext}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onChange={(e) => handleItemChange(index, e.target.value)}
                className={styles.mcListItem}
                value={content}
                placeholder={`Option ${index + 1}`}
                style={{ backgroundColor: "transparent" }}
                autoFocus={index === listContent.length - 1}
              />
              <Button
                shape="circle"
                size="small"
                icon={<RiCloseLargeLine />}

                onClick={(e) => {
                  e.stopPropagation();
                  deleteItem(index);
                }}
                style={{ background: "hsla(209,23%,60%,70%)", color: "white", position: "absolute", right: "-11px", top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
          ))}
        </div>
        <div className={styles.mcItemPlusButton}
          onClick={() => {
            addNewItem(listContent.length - 1)
            setTimeout(handleClickAddButton);
          }}>+</div>
      </div>
    </Popover>
  );
}