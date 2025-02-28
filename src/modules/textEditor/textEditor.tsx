import { MainContext, MainContextValues } from "../mainContext"
import homeIcon from "../../assets/svg/homeIcon.svg"
import { Input } from 'antd';
import { useContext, useEffect, useState, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import styles from './textEditorStyles.tsx'
import 'react-quill/dist/quill.snow.css';
import ResizeModule from "@botom/quill-resize-module";
import { useNavigate } from "react-router-dom";
import './textEditor.css'



Quill.register("modules/resize", ResizeModule);

export default function TextEditor() {
  const { setInPage } = useContext(MainContext) as MainContextValues
  const quillRef = useRef<ReactQuill>(null);
  const [contenido, setContenido] = useState('');
  const [title, setTitle] = useState('');
  const navigate = useNavigate();

  // handle nav bar style
  useEffect(() => {
    setInPage(true)
    return () => {
      setInPage(false)
    }
  }, [setInPage])

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Hace foco en el editor Quill
      quillRef.current?.getEditor().root.focus();
    }
  };

  const modulos = {
    toolbar: [
      [{ font: [] }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ align: [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      ['link', 'image', 'video'],
      ['clean'],
    ],
    resize: {
      toolbar: {

      },
      locale: {
        floatLeft: "Left",
        floatRight: "Right",
        center: "Center",
        restore: "Restore",
      },
    }
  };

  const formatos = [
    "font",
    'size',
    'align',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'link', 'image', 'video',
  ];

  return <div style={styles.textContainerStyles} >
    <div style={styles.container}>

      <button style={styles.homeButton} onClick={() => navigate(-1)}> <img src={homeIcon} /> {">"}</button>
      <Input
        style={styles.titleStyles}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Give your page a title"
        onKeyDown={handleTitleKeyDown}
      />
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={contenido}
        onChange={setContenido}
        modules={modulos}
        formats={formatos}
        placeholder=""
        style={styles.editorStyles}
      />
    </div>
  </div>

}

