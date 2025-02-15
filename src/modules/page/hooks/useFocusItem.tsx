import { useState, useEffect, useContext, useRef } from "react";
import { PageContext, PageContextValues } from "../page";

const moveCursorToEnd = (element: HTMLElement) => {
  if (element) {
    const range = document.createRange();
    const selection = window.getSelection();
    range.setStart(element, element.childNodes.length);
    range.collapse(true);
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
};

export default function useFocusItem(currentItemId: string) {
  const { pageContent } = useContext(PageContext) as PageContextValues;
  const [shouldFocusNext, setShouldFocusNext] = useState(false);
  const [shouldFocusPrev, setShouldFocusPrev] = useState(false);

  // Refs para almacenar los resolutores de las promesas
  const resolveNextFocusPromiseRef = useRef<((value: boolean) => void) | null>(null);
  const resolvePrevFocusPromiseRef = useRef<((value: boolean) => void) | null>(null);

  useEffect(() => {
    if (!shouldFocusNext) return;

    const currentIndex = pageContent.findIndex(pageItem => pageItem.id === currentItemId);
    const nextItem = pageContent[currentIndex + 1];

    if (nextItem) {
      const nextElement = document.getElementById(nextItem.id) as HTMLElement;
      if (nextElement) {
        nextElement.focus();
        setTimeout(() => {
          if (resolveNextFocusPromiseRef.current) {
            resolveNextFocusPromiseRef.current(true);
            resolveNextFocusPromiseRef.current = null;
            
          }
        }, 1);
      } else {
        // Elemento no encontrado en el DOM
        if (resolveNextFocusPromiseRef.current) {
          resolveNextFocusPromiseRef.current(false);
          resolveNextFocusPromiseRef.current = null;
        }
      }
    } else {
      // No hay siguiente elemento
      if (resolveNextFocusPromiseRef.current) {
        resolveNextFocusPromiseRef.current(false);
        resolveNextFocusPromiseRef.current = null;
      }
    }

    setShouldFocusNext(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFocusNext]);

  useEffect(() => {
    if (!shouldFocusPrev) return;

    const currentIndex = pageContent.findIndex(pageItem => pageItem.id === currentItemId);
    const prevItem = pageContent[currentIndex - 1];

    if (prevItem) {
      const prevElement = document.getElementById(prevItem.id) as HTMLElement;
      if (prevElement) {
        prevElement.focus();
        moveCursorToEnd(prevElement);
        setTimeout(() => {
          if (resolvePrevFocusPromiseRef.current) {
            resolvePrevFocusPromiseRef.current(true);
            resolvePrevFocusPromiseRef.current = null;
          }
        }, 1);
      } else {
        // Elemento no encontrado en el DOM
        if (resolvePrevFocusPromiseRef.current) {
          resolvePrevFocusPromiseRef.current(false);
          resolvePrevFocusPromiseRef.current = null;
        }
      }
    } else {
      // No hay elemento anterior
      if (resolvePrevFocusPromiseRef.current) {
        resolvePrevFocusPromiseRef.current(false);
        resolvePrevFocusPromiseRef.current = null;
      }
    }

    setShouldFocusPrev(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFocusPrev]);

  const focusNextItem = () => {
    return new Promise<boolean>((resolve) => {
      resolveNextFocusPromiseRef.current = resolve;
      setShouldFocusNext(true);
    });
  };

  const focusPrevItem = () => {
    return new Promise<boolean>((resolve) => {
      setShouldFocusPrev(true);
      resolvePrevFocusPromiseRef.current = resolve;
    });
  };

  return { focusNextItem, focusPrevItem };
}
