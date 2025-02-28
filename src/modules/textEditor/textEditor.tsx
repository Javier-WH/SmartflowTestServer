import { MainContext, MainContextValues } from "../mainContext"
import { Input } from 'antd';
import { useContext, useEffect, useState } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import styles from './textEditorStyles.tsx'
import 'react-quill/dist/quill.snow.css';
//import ImageResize from 'quill-image-resize-module-react';
import ResizeModule from "@botom/quill-resize-module";
import './textEditor.css'


//Quill.register('modules/imageResize', ImageResize);
Quill.register("modules/resize", ResizeModule);

export default function TextEditor() {
  const { setInPage } = useContext(MainContext) as MainContextValues
  const [contenido, setContenido] = useState('');
  const [title, setTitle] = useState('');

  // handle nav bar style
  useEffect(() => {
    setInPage(true)
    return () => {
      setInPage(false)
    }
  }, [setInPage])

  const modulos = {
    toolbar: [
      //[{ header: [1, 2, 3, false] }],
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
        // change them depending on your language
        altTip: "Hold down the alt key to zoom",
        floatLeft: "Left",
        floatRight: "Right",
        center: "Center",
        restore: "Restore",
      },
    }
  };

  const formatos = [
    //'header',
    "font",
    'size',
    'align',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'link', 'image', 'video',
  ];

  return <div style={styles.textContainerStyles} >
    <Input
      style={styles.titleStyles}
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder="Give your page a title"
    />
    <ReactQuill
      theme="snow"
      value={contenido}
      onChange={setContenido}
      modules={modulos}
      formats={formatos}
      placeholder="Escribe algo..."
      style={styles.editorStyles}
    />
  </div>

}

