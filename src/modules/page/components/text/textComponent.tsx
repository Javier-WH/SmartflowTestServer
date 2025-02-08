import { PageItem } from "../../types/pageTypes";
import { Mode } from "../../types/pageEnums";
import { PageType } from "../../types/pageEnums";
import { useEffect, useRef, useContext, useState } from "react";
import styles from "../../page.module.css";
import { PageContext, PageContextValues } from "../../page";
import { v4 as uuidv4 } from 'uuid';

export default function TextComponent({ item }: { item: PageItem }) {
  const id = item.id;
  const { pageContent, setPageContent} = useContext(PageContext) as PageContextValues;
  const spanRef = useRef<HTMLSpanElement>(null);
  const [localText, setLocalText] = useState("");


  useEffect(() => {
    setLocalText(item.text ?? "");
  }, [item.text]);



  // Update the localText when localText changes
  useEffect(() => {
    if (spanRef.current) {
      spanRef.current.textContent = localText ?? "";
      if (item.mode === "edit") {
        //spanRef.current.focus();
        // Set cursor to the end of the text
        /*const range = document.createRange();
        range.selectNodeContents(spanRef.current);
        range.collapse(false); 
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }*/
      }
    }
  }, [localText, item.mode]);

  // Prevent event propagation
  const onClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
  };

  // change localText on input
  const handleOnInput = () => {
    if (spanRef.current) {
      setLocalText(spanRef.current.textContent ?? "");
    }
  };

  // update pageContent on blur
  const handleOnBlur = () => {
    const pageContentCopy = [...pageContent];
    const updatedPageContent = pageContentCopy.map((pageItem) => {
      if (pageItem.id === id) {
        pageItem.text = localText;
      }
      return pageItem;
    });

    setPageContent(updatedPageContent);
  };

  const isCursorAtStart = (): boolean => {
    if (!spanRef.current) return false;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    const range = selection.getRangeAt(0);
    if (spanRef.current.contains(range.startContainer)) {
      return selection.anchorOffset === 0;
    }
    return false;
  };



  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (spanRef.current) {
        const text = spanRef.current.textContent || "";
        const selection = window.getSelection();

        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const startIndex = range.startOffset;
          const textBeforeCursor = text.substring(0, startIndex).trim();
          const textAfterCursor = text.substring(startIndex).trim();
          const itemIndex = pageContent.findIndex((pageItem) => pageItem.id === id);

          const pageContentCopy = JSON.parse(JSON.stringify(pageContent));
          setLocalText(textBeforeCursor);
          const newTextItem = {
            id: uuidv4(),
            type: PageType.Text,
            text: textAfterCursor,
            styles: item.styles,
            mode: Mode.Edit
          }
          pageContentCopy.splice(itemIndex + 1, 0, newTextItem);
          setPageContent(pageContentCopy);

          // fix cursor position after entering
          setTimeout(() => {
            const nextSpam = document.getElementById(newTextItem.id);
            if (nextSpam) {
              nextSpam.focus();
              const range = document.createRange();
              range.setStart(nextSpam.firstChild || nextSpam, 0);
              range.collapse(true);
              const selection = window.getSelection();
              if (selection) {
                selection.removeAllRanges();
                selection.addRange(range);
              }
            }
          }, 1);


        }
      }

    } else if (e.key === "Backspace") {
      if (spanRef.current) {
        if (isCursorAtStart()) {
          const pageContentCopy = JSON.parse(JSON.stringify(pageContent));
          const itemIndex = pageContent.findIndex((pageItem) => pageItem.id === id);

          let previousTextItemIndex = -1;
          for (let i = itemIndex - 1; i >= 0; i--) {
            if (pageContent[i].type === PageType.Text) {
              previousTextItemIndex = i;
              break;
            }
          }
          if (previousTextItemIndex !== -1) {
            const newText = (pageContentCopy[previousTextItemIndex].text ?? "") + localText;
            pageContentCopy[previousTextItemIndex].text = newText;
            pageContentCopy.splice(itemIndex, 1);
          }
          else if (localText === "") {
            pageContentCopy.splice(itemIndex, 1);
          }
          setPageContent(pageContentCopy);

          // fix cursor position after deleting
          setTimeout(() => {
            const previousSpan = document.getElementById(pageContentCopy[previousTextItemIndex]?.id);
            if (previousSpan) {
              previousSpan.focus();
              const range = document.createRange();
              range.setStart(previousSpan.firstChild || previousSpan, pageContentCopy[previousTextItemIndex].text.length - localText.length); 
              range.collapse(true); 
              const selection = window.getSelection();
              if (selection) {
                selection.removeAllRanges();
                selection.addRange(range);
              }
            }
          }, 1);
          
        }
      }
    }
  };

  return (
    <span onClick={onClick}>
      <span
        ref={spanRef}
        id={id}
        className={styles.textItem}
        contentEditable={item.mode === "edit"}
        style={{ ...item.styles, /*border: "1px solid black" */}}
        onInput={handleOnInput}
        onBlur={handleOnBlur}
        onKeyDown={handleKeyDown}
      >
      </span>
    </span>
  );
}