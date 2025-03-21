/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import Quill from "quill";

import "quill/dist/quill.snow.css";

export default function Guidance({ saveData, value, id }: {
  saveData: (id: string, data: string) => void;
  value: string;
  id: string
}) {
  const editorRef = useRef<Quill | null>(null);
  const quillRef = useRef<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (quillRef.current && !editorRef.current) {

      const options = {
        theme: 'snow',
        modules: {
          toolbar: {
            container: '#toolbar-guided-checklist',
            handlers: {
              // Handlers personalizados (opcional)
            }
          },
          imageResize: {} 
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
          'style'
        ]
      };


      // 4. Inicializar Quill
      editorRef.current = new Quill(quillRef.current, options, );

      // 5. Configurar contenido inicial
      if (value) {
        editorRef.current.clipboard.dangerouslyPasteHTML(value);
      }

      // 6. Configurar evento de cambios
      editorRef.current.on('text-change', () => {
        const content = editorRef.current?.root.innerHTML || '';
        saveData(id, content);
      });

    
    }

    // Cleanup
    return () => {
      if (editorRef.current) {
        editorRef.current = null;
      }
      if (toolbarRef.current) {
        toolbarRef.current.remove();
      }
    };
  }, []);

  // Sincronización con cambios externos
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.root.innerHTML) {
      editorRef.current.clipboard.dangerouslyPasteHTML(value);
    }
  }, [value]);

  return (
    <div className="quill-editor-container">
      <div ref={quillRef} style={{ height: "200px" }} />
    </div>
  );
}