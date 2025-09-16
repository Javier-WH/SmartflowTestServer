/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import './components/guidedCheckList/react_guidedCheckList.tsx';
import { useEffect, useState, useRef, useCallback, ForwardedRef, forwardRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import ResizeModule from '@botom/quill-resize-module';
import options from './components/utils/options.ts';
import CustomImage from './components/utils/CustonImage.ts';
import CustomVideo from './components/utils/CustonVideo.ts';
import GuidedCheckListBlot from './components/blots/guidedCheckListBlot.ts';
import insertGuidedCheckList from './components/guidedCheckList/guidedCheckList.ts';
import CustomOrderedList from './components/blots/customOrderedList.ts';
import { findImageIndexBySrc } from '../textEditor/utils/findDeltaIndex';
import 'react-quill/dist/quill.snow.css';
import './textEditor.css';

let quillConfigured = false;


const configureQuill = () => {
  if (quillConfigured) return;
  Quill.register(CustomOrderedList, true);
  Quill.register('formats/guided-checklist', GuidedCheckListBlot);
  Quill.register(CustomImage, true);
  Quill.register(CustomVideo, true);
  Quill.register('modules/resize', ResizeModule);
  const Size = Quill.import('attributors/style/size');
  Size.whitelist = options.fontSizeList;
  Quill.register(Size, true);
  const Font = Quill.import('formats/font');
  Font.whitelist = options.fontList;
  Quill.register(Font, true);
  quillConfigured = true;
};

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  toolbarId: string;
  debouncedUpdate: (data: any) => void
}


const Editor = forwardRef(({
  value,
  onChange,
  readOnly = false,
  placeholder = '',
  toolbarId
// eslint-disable-next-line @typescript-eslint/no-unused-vars
}: QuillEditorProps, ref: ForwardedRef<ReactQuill>) =>{

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showToolbar, setShowToolbar] = useState(true);
  const quillRef = useRef<ReactQuill>(null);
  const quillContainerRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<HTMLElement | null>(null);
  //const [readOnly, setReadOnly] = useState(true);

  useEffect(() => {
    configureQuill();
  }, []);

  const modules = {
    toolbar: {
      container: toolbarId,
      handlers: {
        'guided-checklist': insertGuidedCheckList,
      },
    },
    resize: {
      toolbar: {},
      locale: {
        floatLeft: 'Left',
        floatRight: 'Right',
        center: 'Center',
        restore: 'Restore',
      },
    },
    keyboard: {
      bindings: {
        "list autofill": {
          shortKey: true
        }
      }
    },
  };




  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  const handleChangeSelection = () => {
    if (readOnly) return;
    const activeElement = document.activeElement;
    const editorRoot = quillRef.current?.getEditor().root;
    const toolbarContainer = document.getElementById('toolbar-guided-checklist');

    const isToolbarElement = toolbarContainer?.contains(activeElement);

    if (editorRoot && activeElement && !isToolbarElement) {
      const isCollapseEditorFocused =
        editorRoot.contains(activeElement) &&
        (activeElement.classList.contains('collapse-editor') || activeElement.closest('.collapse-editor'));

      if (isCollapseEditorFocused) {
        setShowToolbar(false);
      } else {
        setShowToolbar(true);
      }
    }
  };

  //paste image handler
  const handlePaste = (e: ClipboardEvent) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    const items = e.clipboardData?.items;
    if (!items) return;

    // search for image in clipboard
    for (const item of items) {
      if (item.type.startsWith('image')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) return;

        const reader = new FileReader();
        reader.onload = loadEvent => {
          const imageUrl = loadEvent.target?.result;
          if (typeof imageUrl === 'string') {
            const range = editor.getSelection(true);
            editor.insertEmbed(range?.index || 0, 'image', imageUrl);
          }
        };
        reader.readAsDataURL(file);
        return;
      }
    }
  };

  const configureQuillMatchers = () => {
    const editor = quillRef.current.getEditor();
    // add a matcher for images
    editor.clipboard.addMatcher('IMG', (node, delta) => {
      // get the width, height and style attributes
      const widthAttr = node.getAttribute('width');
      const heightAttr = node.getAttribute('height');
      const styleAttr = node.getAttribute('style');
      //  update the delta
      delta.ops = delta.ops?.map(op => {
        if (op.insert?.image && typeof op.insert.image === 'string') {
          return {
            insert: {
              image: {
                src: op.insert.image,
                width: widthAttr,
                height: heightAttr,
                style: styleAttr,
              },
            },
          };
        }
        return op;
      });
      return delta;
    });

    // add a matcher for videos
    // this do the same as the image matcher but for videos (iframes)
    editor.clipboard.addMatcher('IFRAME', (node, delta) => {
      const styleAttr = node.getAttribute('style');
      const widthAttr = node.getAttribute('width');
      const heightAttr = node.getAttribute('height');
      delta.ops = delta.ops?.map(op => {
        if (op.insert?.video && typeof op.insert.video === 'string') {
          return {
            insert: {
              video: {
                src: op.insert.video,
                width: widthAttr,
                height: heightAttr,
                style: styleAttr,
              },
            },
          };
        }
        return op;
      });
      return delta;
    });
  };


  useEffect(() => {
    if (quillRef.current) quillRef.current.focus();
  }, [quillRef.current]);



  // adjust resizer to prevent edition while readonly
  useEffect(() => {
    const imageToolbar = document.getElementsByClassName('toolbar')[0];
    const imagehandler = document.getElementsByClassName('handler')[0];
    // if readOnly cant change image size, so we have to hide the toolbar
    if (readOnly) {
      if (imageToolbar) {
        imageToolbar.classList.add('hidden');
      }
      if (imagehandler) {
        imagehandler.classList.add('hidden');
      }
    }
  }, [selectedImage]);

  // add paste event listener
  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const container = editor.root;
      container.addEventListener('paste', handlePaste);
      return () => {
        container.removeEventListener('paste', handlePaste);
      };
    }
  }, []);

  // add drag image logic
  const handleDrop = useCallback((event) => {
    event.preventDefault();

    const items = event.dataTransfer.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file' && items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          console.log('Imagen arrastrada:', file);
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageUrl = e.target.result;
            insertImageIntoQuill(imageUrl);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }, []);

  // Función para manejar el 'dragover'
  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  // Función para insertar la imagen en Quill
  const insertImageIntoQuill = useCallback((imageUrl) => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection(true);
      editor.insertEmbed(range.index, 'image', imageUrl, 'user');
      editor.setSelection(range.index + 1, 0);
    }
  }, []);

  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const container = editor.root;

      // Evento de pegado
      container.addEventListener('paste', handlePaste);

      // Eventos de arrastre
      window.addEventListener('dragover', handleDragOver);
      window.addEventListener('drop', handleDrop);

      return () => {
        container.removeEventListener('paste', handlePaste);
        window.removeEventListener('dragover', handleDragOver);
        window.removeEventListener('drop', handleDrop);
      };
    }
  }, [handlePaste, handleDragOver, handleDrop]);



  // Función para insertar la lista personalizada con un índice específico
  const insertCustomNumberedList = (startIndex: number) => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const range = quill.getSelection(true);
    if (!range) return;

    // Preparar nueva línea si es necesario
    const [line, offset] = quill.getLine(range.index);
    if (offset > 0 && line.length() > 1) {
      quill.insertText(range.index, '\n', "user");
      range.index++;
    }

    // Aplicar formato de lista con el startIndex
    quill.formatLine(range.index, 1, 'list', startIndex, 'user');

    // Mover cursor dentro del nuevo elemento de lista
    quill.setSelection(range.index + 1, 0);
  };


  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // este evento borra la imagen seleccionada
    if (selectedImage !== null && (e.key === 'Delete' || e.key === 'Backspace')) {
      e.preventDefault();
      const imageElement = selectedImage as HTMLImageElement;
      const imageIndex = findImageIndexBySrc({ srcToFind: imageElement.src, editor: quillRef.current?.getEditor() });

      if (imageIndex !== -1) {
        const editor = quillRef.current?.getEditor();
        if (editor) {
          editor.deleteText(imageIndex, 1, 'user');
        }
      }
      setSelectedImage(null);
    } else {
      setSelectedImage(null);
    }

    if (e.key === ' ') {
      const editor = quillRef.current?.getEditor();

      if (editor) {
        const selection = editor.getSelection(); // Obtener la selección actual
        if (selection) {
          const cursorIndex = selection.index; // Posición del cursor

          // Obtener el texto hasta la posición del cursor
          const textBeforeCursor = editor.getText(0, cursorIndex);

          // Expresión regular para encontrar un número seguido de un punto al final del texto
          // Esto buscará patrones como "1." o "123."
          const regex = /(\d+)\.$/;
          const match = textBeforeCursor.match(regex);

          if (match) {
            e.preventDefault();
            const numeroEncontrado = match[1]; // El grupo de captura (el número)
            const fullMatch = match[0]; // Esto incluye el número y el punto (ej: "1.")

            // Calcular la posición de inicio del texto a borrar
            const startDeleteIndex = cursorIndex - fullMatch.length;

            // Borrar el número y el punto
            editor.deleteText(startDeleteIndex, fullMatch.length);

            insertCustomNumberedList(Number(numeroEncontrado));
          }
        }
      }
    }
  };

  return (
    <div className="relative flex flex-col h-full overflow-hidden px-[1px]">
      <div
        ref={quillContainerRef}
        className="flex justify-center h-full overflow-y-auto mt-4 scrollbar-thumb-rounded-full scrollbar-thumb-[var(--strokeColor:)] scrollbar-track-transparent scrollbar-thin"
      >
        <div className="h-full w-full max-w-[70%]">
          <ReactQuill
            readOnly={readOnly}
            ref={ref => {
              if (ref) {
                quillRef.current = ref;
                configureQuillMatchers();
              }
            }}
            theme="snow"
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            modules={modules}
            formats={options.formats}
            onChangeSelection={handleChangeSelection}
            className="w-full h-full pr-12 lg:pr-0"
            placeholder={placeholder}
          />
        </div>
      </div>
    </div>
  );



})


export default Editor;