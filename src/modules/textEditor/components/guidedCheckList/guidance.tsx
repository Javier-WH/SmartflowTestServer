/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
//import ResizeModule from '@botom/quill-resize-module';
import CustomToolbar from "../toolbar/CustonToolbar";
import Delta from 'quill-delta';

const fontSizeList = ['10px', '12px', '14px', '16px', '18px', '20px', '22px', '24px', '26px', '28px', '30px', '32px', '34px', '36px', '38px', '40px', '42px', '44px', '46px', '48px']
const fontList = [
  'arial',
  'times-new-roman',
  'courier-new',
  'comic-sans-ms',
  'roboto',
  'georgia',
  'verdana',
  'open-sans',
  'lato',
  'montserrat',
  'impact',
  'fantasy',
  'cursive',
  'monospace',
  'serif',
]


const Size = Quill.import('attributors/style/size') as any;
Size.whitelist = fontSizeList;
Quill.register(Size, true);

// Register custom fonts
const Font = Quill.import('formats/font') as any;
Font.whitelist = fontList;
Quill.register(Font, true);

export default function Guidance({ saveData, value, id, readonly }: {
  saveData: (id: string, data: string) => void;
  value: string;
  id: string;
  readonly: boolean
}) {
  const editorRef = useRef<Quill | null>(null);
  const quillRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toolbarId = `toolbar-guided-checklist-${id}-${crypto.randomUUID().toString()}`;

  /*useEffect(() => {
    Quill.register('modules/resize', ResizeModule);
  }, []);*/

  const handlePaste = (e: ClipboardEvent) => {
    e.stopPropagation();
  };



  useEffect(() => {
    let resizeModule: any = null;
    if (quillRef.current && !editorRef.current) {
      const options = {
        theme: 'snow',
        readOnly: readonly,
        placeholder: 'Add a guidance (if needed!)',
        modules: {
          toolbar: {
            container: `#${toolbarId}`,
            handlers: {

            }
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

        },
        formats: [
          'header',
          'font',
          'size',
          'align',
          'bold',
          'italic',
          'underline',
          'strike',
          'blockquote',
          'list',
          'color',
          'background',
          'link',
          'image',
          'video',
        ]
      };



      // create the editor
      editorRef.current = new Quill(quillRef.current, options);
      resizeModule = editorRef.current.getModule('resize');



      // Matcher modificado para imágenes
      editorRef.current.clipboard.addMatcher('IMG', (node: Node) => {
        if (node.nodeType === 1) { // Solo elementos HTML
          const element = node as HTMLElement;
          return new Delta().insert({
            image: {
              src: element.getAttribute('src') || '',
              width: element.getAttribute('width'),
              height: element.getAttribute('height'),
              style: element.getAttribute('style')
            }
          });
        }
        return new Delta();
      });



      const editorRoot = editorRef.current.root;

      editorRoot.addEventListener('paste', handlePaste);

      // load initial data
      if (value) {
        editorRef.current.clipboard.dangerouslyPasteHTML(value);
        //const delta = editorRef.current.clipboard.convert({ html: value });
        //editorRef.current.setContents(delta);
      }

      if (value) {
        const delta = editorRef.current.clipboard.convert({ html: value });
        editorRef.current.setContents(delta);
        editorRef.current.root.innerHTML = value; // Forzar actualización visual
      }


      editorRef.current.on('text-change', () => {
        const content = editorRef.current?.root.innerHTML || '';
        saveData(id, content);
      });
    }

    // this prevent a bug when image resize
    const forceSaveOnImageResize = (e: MouseEvent) => {
      if (!e.target) return;
      if (e.target instanceof HTMLElement) {
        if (e.target.classList.contains('btn')) {
          const content = editorRef.current?.root.innerHTML || '';
          saveData(id, content);
        }
      }
    };
    window.addEventListener('click', forceSaveOnImageResize);


    /*return () => {
      const editorRoot = editorRef.current?.root;
      if (editorRoot) {
        editorRoot.removeEventListener('paste', handlePaste);
      }
      window.removeEventListener('click', forceSaveOnImageResize);
      if (editorRef.current) {
        editorRef.current = null;
      }
    };*/

    return () => {
      // Destruir en orden inverso
      if (editorRef.current) {
        // 1. Destruir módulo de resize primero
        if (resizeModule) {
          try {
            resizeModule.destroy();
          } catch (e) {
            console.log('Resize module already destroyed');
          }
        }

        // 2. Remover todos los listeners
        editorRef.current.off('text-change');
        const editorRoot = editorRef.current.root;
        editorRoot.removeEventListener('paste', handlePaste);

        // 3. Eliminar el editor del DOM
        if (quillRef.current) {
          quillRef.current.innerHTML = '';
        }

        // 4. Eliminar instancia de Quill
        editorRef.current = null;
      }
    };
  }, []);

  // external changes sync
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.root.innerHTML) {
      editorRef.current.clipboard.dangerouslyPasteHTML(value);
    }
  }, [value]);

  return <>
    {
      !readonly &&
      <div className="flex justify-center w-full grow relative">
        <CustomToolbar name={toolbarId} clean={true} />
      </div>
    }
    <div className="quill-editor-container" ref={containerRef} onPaste={(e) => e.stopPropagation()} >
      <div className="collapse-editor" ref={quillRef} style={{ height: "1000px" }} />
    </div>

  </>

}