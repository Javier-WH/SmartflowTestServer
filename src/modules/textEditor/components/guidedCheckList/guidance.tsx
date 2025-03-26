/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import CustomToolbar from "../toolbar/CustonToolbar";

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
          'bullet',
          'color',
          'background',
          'link',
          'image',
          'video',
          'style',
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