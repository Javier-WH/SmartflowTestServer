import { Input } from 'antd';
import { useState } from 'react';
import ReactQuill, { Quill } from 'react-quill'; // Import Quill here
import styles from './textEditorStyles.tsx'
import 'react-quill/dist/quill.snow.css';
import './textEditor.css'
import { ImageResize } from 'quill-image-resize-module';
import 'quill-image-resize-module-react/dist/quill-image-resize-module.snow.css'; // Import styles for image resize

export default function TextEditor() {
  Quill.register('modules/imageResize', ImageResize);
  const [contenido, setContenido] = useState('');
  const [title, setTitle] = useState('');

  const modulos = {
    toolbar: [
      //[{ header: [1, 2, 3, false] }],
      [{ font: [] }], 
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ align: [] }],
      ['bold', 'italic', 'underline', 'strike' ],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
    imageResize: { // Add imageResize module configuration
      parchment: Quill.import('parchment'),
      modules: ['Resize', 'DisplaySize'] // You can configure sub-modules here if needed
    },
  };

  const formatos = [
    //'header',
    "font",
    'size',
    'align',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'link', 'image'
  ];

  return <div style={styles.textContainerStyles} >
    <Input 
      style={styles.titleStyles}
      value={title} 
      onChange={(e) => setTitle(e.target.value)} 
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

