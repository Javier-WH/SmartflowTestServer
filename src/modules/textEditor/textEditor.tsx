import { MainContext, MainContextValues } from "../mainContext";
import homeIcon from "../../assets/svg/homeIcon.svg";
import { Input } from 'antd';
import { useContext, useEffect, useState, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import styles from './textEditorStyles.tsx';
import 'react-quill/dist/quill.snow.css';
import ResizeModule from "@botom/quill-resize-module";
import { useNavigate } from "react-router-dom";
import CustomToolbar from "./components/toolbar/CustonToolbar.tsx";
import options from "./components/utils/options.ts";
import insertHelpBlock from "./components/helpBlock/insertHelpBlock.ts";
import './textEditor.css';


// Registro del módulo de resize
Quill.register("modules/resize", ResizeModule);

// Registrar los tamaños personalizados
const Size = Quill.import('attributors/style/size');
Size.whitelist = options.fontSizeList;
Quill.register(Size, true);

// Registro de fuentes personalizadas
const Font = Quill.import('formats/font');
Font.whitelist = options.fontList;
Quill.register(Font, true);


export default function TextEditor() {
  const { setInPage } = useContext(MainContext) as MainContextValues;
  const quillRef = useRef<ReactQuill>(null);
  const [contenido, setContenido] = useState('');
  const [title, setTitle] = useState('');
  const navigate = useNavigate();

  // handle nav bar style
  useEffect(() => {
    setInPage(true);
    return () => {
      setInPage(false);
    };
  }, [setInPage]);

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Focuses on the Quill editor
      quillRef.current?.getEditor().root.focus();
    }
  };

  const modulos = {
    toolbar: {
      container: "#toolbar",
      handlers: {
        helpBlock: insertHelpBlock,
      },
    },
    resize: {
      toolbar: {},
      locale: {
        floatLeft: "Left",
        floatRight: "Right",
        center: "Center",
        restore: "Restore",
      },
    },
  };


  return (
    <div style={styles.textContainerStyles}>
      <div style={styles.container}>
        <button style={styles.homeButton} onClick={() => navigate(-1)}>
          <img src={homeIcon} alt="Home Icon" /> {'>'}
        </button>
        <Input
          style={styles.titleStyles}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your page a title"
          onKeyDown={handleTitleKeyDown}
        />
     
        <CustomToolbar />
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={contenido}
          onChange={setContenido}
          modules={modulos}
          formats={options.formats}
          placeholder=""
          style={styles.editorStyles}
        />
      </div>
    </div>
  );
}
