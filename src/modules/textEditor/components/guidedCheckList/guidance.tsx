/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import ResizeModule from '@botom/quill-resize-module';
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
  const resizing = useRef(false);

  const toolbarId = `toolbar-guided-checklist-${id}-${crypto.randomUUID().toString()}`;

  useEffect(() => {
    Quill.register('modules/resize', ResizeModule);
  }, []);

  const handlePaste = (e: ClipboardEvent) => {
    e.stopPropagation();
  };



  useEffect(() => {

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


      // load initial images data
      editorRef.current.clipboard.addMatcher('IMG', (node: Node) => {
        if (node.nodeType === 1) { // only html elements
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

      // load quill initial data
      if (value) {
        editorRef.current.clipboard.dangerouslyPasteHTML(value);
      }

      if (value) {
        const delta = editorRef.current.clipboard.convert({ html: value });
        editorRef.current.setContents(delta);
        editorRef.current.root.innerHTML = value; // force visual update
      }


      editorRef.current.on('text-change', () => {
        if (resizing.current) return;
        const content = editorRef.current?.root.innerHTML || '';
        saveData(id, content);
      });
    }

    // this prevent a bug when image resize
    // we have to preven save while resizing, otherwise the resize will crap on the guidance
    window.addEventListener('mousedown', handleResizeStart);
    const onResizeEnd = () => {
      const content = editorRef.current?.root.innerHTML || '';
      saveData(id, content);
      handleResizeEnd();
    }
    window.addEventListener('mouseup', onResizeEnd);

    return () => {
      //remove all the listeners to avoid memory leaks
      const editorRoot = editorRef.current?.root;
      if (editorRoot) {
        editorRoot.removeEventListener('paste', handlePaste);
      }
      if (editorRef.current) {
        editorRef.current = null;
      }
      window.removeEventListener('mousedown', handleResizeStart);
      window.removeEventListener('mouseup', onResizeEnd);
    };
  }, []);

  // external changes sync
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.root.innerHTML) {
      editorRef.current.clipboard.dangerouslyPasteHTML(value);
    }
  }, [value]);

  const handleResizeStart = () => {
    resizing.current = true;
  };

  const handleResizeEnd = () => {
    resizing.current = false;
  };

  return <>
    {
      !readonly &&
      <div className="flex justify-center w-full grow relative">
        <CustomToolbar name={toolbarId} clean={true} />
      </div>
    }
    <div className="quill-editor-container" ref={containerRef} onPaste={(e) => e.stopPropagation()} >
      <div className="collapse-editor" ref={quillRef} style={{ height: "200px" }} />
    </div>

  </>

}

