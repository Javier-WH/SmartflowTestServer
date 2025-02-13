import { PageItem } from "../../types/pageTypes";
import { Mode } from "../../types/pageEnums";
import { PageType } from "../../types/pageEnums";
import { useEffect, useRef, useContext, useState } from "react";
import styles from "../../page.module.css";
import { PageContext, PageContextValues } from "../../page";
import { v4 as uuidv4 } from 'uuid';

export default function TextComponent({ item }: { item: PageItem }) {
  const id = item.id;
  const { pageContent, setPageContent } = useContext(PageContext) as PageContextValues;
  const spanRef = useRef<HTMLSpanElement>(null);
  const [localText, setLocalText] = useState("");


  useEffect(() => {
    setLocalText(item.text ?? "");
  }, [item.text]);



  // Update the localText when localText changes
  useEffect(() => {
    if (spanRef.current) {
      spanRef.current.textContent = localText ?? "";
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

            // delete the previous element if it is not text
          if(pageContentCopy[itemIndex-1]?.type !== PageType.Text) {
            pageContentCopy.splice((itemIndex-1), 1);
            setPageContent(pageContentCopy);
            return
          }

            // text behavior rules
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
    } else if (e.key === "ArrowUp") {
      const itemIndex = pageContent.findIndex((pageItem) => pageItem.id === id);
      const previousTextItemIndex = getPreviusTextItemIndex(itemIndex);
      const previusElement = document.getElementById(pageContent[previousTextItemIndex]?.id);
      const element = document.getElementById(id);

      if (element && previusElement) {

        if (element?.textContent?.trim() === "") {
          previusElement.focus();
          setTimeout(() => {
            const range = document.createRange();
            range.selectNodeContents(previusElement);
            range.collapse(false);
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
          }, 1);
          return;
        }

        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const cursorRect = range.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();

          const tolerance = 5;
          if (Math.abs(cursorRect.top - elementRect.top) <= tolerance) {
            console.log("El cursor está en la primera línea");
            previusElement.focus();
            setTimeout(() => {
              const range = document.createRange();
              range.selectNodeContents(previusElement);
              range.collapse(false);
              const selection = window.getSelection();
              selection?.removeAllRanges();
              selection?.addRange(range);
            }, 1);

          }
        }
      }
    } else if (e.key === "ArrowDown") {
      const itemIndex = pageContent.findIndex((pageItem) => pageItem.id === id);
      const nextTextItemIndex = getNextTextItemIndex(itemIndex);
      const nextElement = document.getElementById(pageContent[nextTextItemIndex]?.id);
      const element = document.getElementById(id);

      if (element && nextElement) {

        if (element?.textContent?.trim() === "") {
          nextElement.focus();
          setTimeout(() => {
            const range = document.createRange();
            range.selectNodeContents(nextElement);
            range.collapse(true);
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
          }, 1)
          return;
        }

        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const cursorRect = range.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();

          const tolerance = 4;
          if (Math.abs(cursorRect.bottom - elementRect.bottom) <= tolerance) {

            nextElement.focus();
            setTimeout(() => {
              const range = document.createRange();
              range.selectNodeContents(nextElement);
              range.collapse(true);
              const selection = window.getSelection();
              selection?.removeAllRanges();
              selection?.addRange(range);
            }, 1)

          }
        }
      }
    }
  };

  const getPreviusTextItemIndex = (itemIndex: number): number => {
    let previousTextItemIndex = -1;
    for (let i = itemIndex - 1; i >= 0; i--) {
      if (pageContent[i].type === PageType.Text) {
        previousTextItemIndex = i;
        break;
      }
    }
    return previousTextItemIndex;
  }

  const getNextTextItemIndex = (itemIndex: number): number => {
    let nextTextItemIndex = -1;
    for (let i = itemIndex + 1; i < pageContent.length; i++) {
      if (pageContent[i].type === PageType.Text) {
        nextTextItemIndex = i;
        break;
      }
    }
    return nextTextItemIndex;
  };


  return (
    <span onClick={onClick}>
      <span
        ref={spanRef}
        id={id}
        className={styles.textItem}
        contentEditable={item.mode === "edit"}
        style={item.styles}
        onInput={handleOnInput}
        onBlur={handleOnBlur}
        onKeyDown={handleKeyDown}
      >
      </span>
    </span>
  );
}