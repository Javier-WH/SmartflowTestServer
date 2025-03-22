/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css"; // Asegúrate de importar el CSS del tema snow

export default function Guidance({ saveData, value, id }: {
  saveData: (id: string, data: string) => void;
  value: string;
  id: string
}) {
  const editorRef = useRef<Quill | null>(null);
  const quillRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (quillRef.current && !editorRef.current) {
      const options = {
  theme: 'snow',
  modules: {
    toolbar: {
      container: [
        [{ 'size': [] }],  
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'align': [] }],
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        // Handlers personalizados si es necesario
      }
    },
    imageResize: {}
  },
  formats: [
    'bold',
    'italic',
    'underline',
    'strike',
    'size',  
    'align',
    'color',
    'background',
    'link',
    'image',
    'video',
    'list',
    'bullet',
    'check'
  ]
};



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

  return (
    <div className="quill-editor-container">
      <div className="collapse-editor" ref={quillRef} style={{ height: "200px" }} />
    </div>
  );
}