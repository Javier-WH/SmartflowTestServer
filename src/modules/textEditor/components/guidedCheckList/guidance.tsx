/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import CustomToolbar from "../toolbar/CustonToolbar";
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


const Size = Quill.import('attributors/style/size');
Size.whitelist = fontSizeList;
Quill.register(Size, true);

// Register custom fonts
const Font = Quill.import('formats/font');
Font.whitelist = fontList;
Quill.register(Font, true);

export default function Guidance({ saveData, value, id }: {
  saveData: (id: string, data: string) => void;
  value: string;
  id: string
}) {
  const editorRef = useRef<Quill | null>(null);
  const quillRef = useRef<HTMLDivElement | null>(null);

  const toolbarId = `toolbar-guided-checklist-${id}`;

  useEffect(() => {
    if (quillRef.current && !editorRef.current) {
      const options = {
        theme: 'snow',
        modules: {
          toolbar: {
            container: `#${toolbarId}`,
            handlers: {
              
            }
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

      const toolbarContainer = document.getElementById("toolbar-guided-checklist");
      if(toolbarContainer){
        toolbarContainer.innerHTML = "<CustomToolbar name={toolbarId} clean={true} />";
      }

      // Inicializar Quill
      editorRef.current = new Quill(quillRef.current, options);

      // Configurar contenido inicial
      if (value) {
        editorRef.current.clipboard.dangerouslyPasteHTML(value);
      }

      // Configurar evento de cambios
      editorRef.current.on('text-change', () => {
        const content = editorRef.current?.root.innerHTML || '';
        saveData(id, content);
      });
    }

        
    return () => {
      if (editorRef.current) {
        editorRef.current = null;
      }
    };
  }, []);

  // Sincronización con cambios externos
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.root.innerHTML) {
      editorRef.current.clipboard.dangerouslyPasteHTML(value);
    }
  }, [value]);

  return <>
    <div className="flex justify-center w-full grow relative">
      <CustomToolbar name={toolbarId} clean={true} />
    </div>
    <div className="quill-editor-container">
      <div className="collapse-editor" ref={quillRef} style={{ height: "200px" }} />
    </div>
 
  </>
  
}