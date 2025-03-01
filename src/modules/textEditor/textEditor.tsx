import { MainContext, MainContextValues } from "../mainContext";
import homeIcon from "../../assets/svg/homeIcon.svg";
import { Input } from 'antd';
import { useContext, useEffect, useState, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import styles from './textEditorStyles.tsx';
import 'react-quill/dist/quill.snow.css';
import ResizeModule from "@botom/quill-resize-module";
import { useNavigate } from "react-router-dom";
import HelpBlockComponent from "./assets/svg/addHelpBlockIcon.svg";
import './textEditor.css';


// Registro del módulo de resize
Quill.register("modules/resize", ResizeModule);

// Registrar los tamaños personalizados
const Size = Quill.import('attributors/style/size');
Size.whitelist = ['10px', '12px', '14px', '16px', '18px', '20px', '22px', '24px', '26px', '28px', '30px', '32px', '34px', '36px', '38px', '40px', '42px', '44px', '46px', '48px'];
Quill.register(Size, true);

// Registro de fuentes personalizadas
const Font = Quill.import('formats/font');
Font.whitelist = [
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
];
Quill.register(Font, true);


// Definimos el botón personalizado
const HelpBlockButton = () => <img src={HelpBlockComponent} alt="" />;

// Función para insertar el HTML
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function insertHelpBlock(this: { quill:any }) {
  const quill = this.quill;
  const cursorPosition = quill.getSelection().index;
  const customHTML = '<div>Aqui va el help block</div>'; // Reemplaza con el HTML que deseas insertar
  quill.clipboard.dangerouslyPasteHTML(cursorPosition, customHTML);
  quill.setSelection(cursorPosition + 1);
}

// Componente de la barra de herramientas personalizada
const CustomToolbar = () => (
  <div id="toolbar">
    <select className="ql-font" style={{ width: "180px" }}>
      <option value="arial" selected>Arial</option>
      <option value="times-new-roman">Times New Roman</option>
      <option value="courier-new">Courier New</option>
      <option value="comic-sans-ms">Comic Sans MS</option>
      <option value="roboto">Roboto</option>
      <option value="georgia">Georgia</option>
      <option value="verdana">Verdana</option>
      <option value="open-sans">Open Sans</option>
      <option value="lato">Lato</option>
      <option value="montserrat">Montserrat</option>
      <option value="impact">Impact</option>
      <option value="fantasy">Fantasy</option>
      <option value="cursive">Cursive</option>
      <option value="monospace">Monospace</option>
      <option value="serif">Serif</option>
    </select>
    <select className="ql-size" style={{ width: "50px" }}>
      <option value="10px">10</option>
      <option value="12px">12</option>
      <option value="14px" selected>14</option>
      <option value="16px">16</option>
      <option value="18px">18</option>
      <option value="20px">20</option>
      <option value="22px">22</option>
      <option value="24px">24</option>
      <option value="26px">26</option>
      <option value="28px">28</option>
      <option value="30px">30</option>
      <option value="32px">32</option>
      <option value="34px">34</option>
      <option value="36px">36</option>
      <option value="38px">38</option>
      <option value="40px">40</option>
      <option value="42px">42</option>
      <option value="44px">44</option>
      <option value="46px">46</option>
      <option value="48px">48</option>
    </select>
    <button className="ql-bold"></button>
    <button className="ql-italic"></button>
    <button className="ql-underline"></button>
    <button className="ql-strike"></button>
    <button className="ql-list" value="ordered"></button>
    <button className="ql-list" value="bullet"></button>
    <select className="ql-align"></select>
    <select className="ql-color"></select>
    <select className="ql-background"></select>
    <button className="ql-link"></button>
    <button className="ql-image"></button>
    <button className="ql-video"></button>
    {/* Botón personalizado */}
    <button className="ql-helpBlock">
      <HelpBlockButton />
    </button>
  </div>
);

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
      // Hace foco en el editor Quill
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

  const formatos = [
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
  ];

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
        {/* Barra de herramientas personalizada */}
        <CustomToolbar />
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
  );
}
