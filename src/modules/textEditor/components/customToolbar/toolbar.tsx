import { Modal, Input, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { t } from 'i18next';
import GuidedCheckListIcon from '../../assets/svg/addGuidedCheckList';
import AlphaListIcon from '../../assets/svg/alpha.svg';
import { getActiveEditor } from './editorStore';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Toolbar() {
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [modalKey, setModalKey] = useState(0);
  const [isVideoModalOpen, setVideoModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isLinkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [savedRange, setSavedRange] = useState<any>(null);


  useEffect(() => {
    if (isImageModalOpen) {
      setImageUrl('');
      setLocalFile(null);
    }
  }, [isImageModalOpen]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const applyFormat = (format: string, value?: any) => {
    const editor = getActiveEditor();
    if (!editor) return;
    const range = editor.getSelection();
    if (range) {
      editor.format(format, value ?? true);
    }
  };

  const handleQuillToolbarAction = (actionValue: string, key: string) => {
    const editor = getActiveEditor();
    if (!editor) return;

    // Ejecuta el handler de la barra de herramientas de Quill
    // Esto es lo que hacía tu botón original <button class="ql-list" value="check">
    const toolbarHandlers = editor?.options?.modules?.toolbar?.handlers;
    const handler = toolbarHandlers?.[key];

    // Si hay un handler definido para 'list' o la acción específica
    if (typeof handler === 'function') {
      // En Quill, el handler de 'list' espera el valor ('ordered', 'bullet', 'check')
      handler.call({ quill: editor }, actionValue);
    } else {
      // Si no hay handler, volvemos al formato directo (funciona para ordered/bullet)
      editor.format(key, actionValue);
    }
  }

  const toggleFormat = (format: string) => {
    const editor = getActiveEditor();
    if (!editor) return;
    const range = editor.getSelection();
    if (range) {
      const current = editor.getFormat(range)[format];
      editor.format(format, !current);
    }
  };

  const handleInsertLink = () => {
    const editor = getActiveEditor();
    if (!editor || !linkUrl.trim() || !savedRange) return;

    editor.setSelection(savedRange); // restaurar selección
    editor.formatText(savedRange.index, savedRange.length, 'link', linkUrl.trim());
    setLinkUrl('');
    setSavedRange(null);
    setLinkModalOpen(false);
  };

  const insertImage = (src: string) => {
    const editor = getActiveEditor();
    const index = editor.getSelection()?.index ?? 0;
    editor.insertEmbed(index, 'image', src);
    editor.setSelection(index + 1);
  };

  const handleInsertImage = () => {
    const editor = getActiveEditor();
    if (!editor) return;

    if (localFile) {
      const reader = new FileReader();
      reader.onload = () => {
        insertImage(reader.result as string);
        resetImageModal();
      };
      reader.readAsDataURL(localFile);
      return;
    }

    if (imageUrl.trim()) {
      insertImage(imageUrl.trim());
      resetImageModal();
      return;
    }

    message.warning('Por favor ingresa una URL o selecciona una imagen local.');
  };

  const normalizeVideoUrl = (url: string): string => {
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

    // Default: return as-is
    return url;
  };

  const handleInsertVideo = () => {
    const editor = getActiveEditor();
    if (!editor || !videoUrl.trim()) {
      message.warning('Por favor ingresa una URL válida.');
      return;
    }

    const embedUrl = normalizeVideoUrl(videoUrl.trim());
    const index = editor.getSelection()?.index ?? 0;
    editor.insertEmbed(index, 'video', embedUrl);
    editor.setSelection(index + 1);
    setVideoUrl('');
    setVideoModalOpen(false);
  };


  const resetImageModal = () => {
    setImageModalOpen(false);
    setImageUrl('');
    setLocalFile(null);
  };

  const openImageModal = () => {
    resetImageModal(); // limpia antes de abrir
    setModalKey(prev => prev + 1);
    setImageModalOpen(true);
  };

  return (
    <>
      <div className="flex gap-2 p-2 bg-white dark:bg-[#1E1E2F] rounded flex-wrap">
        {/* Font */}
        <select onChange={(e) => applyFormat('font', e.target.value)} defaultValue="arial">
          <option value="arial">Arial</option>
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

        {/* Size */}
        <select onChange={(e) => applyFormat('size', e.target.value)} defaultValue="16px">
          {Array.from({ length: 20 }, (_, i) => 10 + i * 2).map((size) => (
            <option key={size} value={`${size}px`}>{size}</option>
          ))}
        </select>

        {/* Header */}
        <select onChange={(e) => applyFormat('header', e.target.value === 'normal' ? false : parseInt(e.target.value))} defaultValue="normal">
          {[1, 2, 3, 4, 5, 6].map((h) => (
            <option key={h} value={h}>{`${t('quill_header')} ${h}`}</option>
          ))}
          <option value="normal">{t('quill_paragraph')}</option>
        </select>

        {/* Text styles */}
        <button onClick={() => toggleFormat('bold')}>B</button>
        <button onClick={() => toggleFormat('italic')}>I</button>
        <button onClick={() => toggleFormat('underline')}>U</button>
        <button onClick={() => toggleFormat('strike')}>S</button>

        {/* Lists */}
        <button onClick={() => applyFormat('list', 'ordered')}>1.</button>
        <button onClick={() => applyFormat('list', 'bullet')}>•</button>
        <button onClick={() => applyFormat('list', 'alpha')}>
          <img src={AlphaListIcon} width={20} alt="Alpha" />
        </button>
        
        <button onClick={() => handleQuillToolbarAction('check', 'list')}>☑</button>

        {/* Alignment */}
        <select onChange={(e) => applyFormat('align', e.target.value)}>
          <option value="">Izquierda</option>
          <option value="center">Centro</option>
          <option value="right">Derecha</option>
          <option value="justify">Justificado</option>
        </select>

        {/* Colors */}
        <input type="color" onChange={(e) => applyFormat('color', e.target.value)} />
        <input type="color" onChange={(e) => applyFormat('background', e.target.value)} />

        {/* Link */}
        <Button
          onClick={() => {
            const editor = getActiveEditor();
            const range = editor?.getSelection();
            if (range && range.length > 0) {
              setSavedRange(range);
              setLinkModalOpen(true);
            } else {
              message.warning('Selecciona el texto que deseas enlazar.');
            }
          }}
        >
          🔗 Insertar enlace
        </Button>

        {/* Imagen (modal dual) */}
        <Button icon={<UploadOutlined />} onClick={openImageModal}>
          Insertar imagen
        </Button>

        {/* Video */}
        <Button onClick={() => setVideoModalOpen(true)}>🎥 Insertar video</Button>

        {/* Clean */}
        <button onClick={() => {
          const editor = getActiveEditor();
          editor.removeFormat(editor.getSelection()?.index ?? 0, editor.getSelection()?.length ?? 0)
        }}>🧹</button>

        {/* Guided checklist */}
        <button
          onClick={() => {
            const editor = getActiveEditor();
            if (!editor) return;
            const toolbarHandlers = editor?.options?.modules?.toolbar?.handlers;
            const handler = toolbarHandlers?.['guided-checklist'];
            if (typeof handler === 'function') {
              handler.call({ quill: editor });
            }
          }}
        >
          <GuidedCheckListIcon />
        </button>
      </div>

      {/* Modal para insertar imagen */}
      <Modal
        key={modalKey}
        title="Insertar imagen"
        open={isImageModalOpen}
        onCancel={resetImageModal}
        onOk={handleInsertImage}
        okText="Insertar"
        cancelText="Cancelar"
      >
        <div className="flex flex-col gap-4">
          <Input
            placeholder="URL de la imagen"
            value={imageUrl}
            disabled={!!localFile}
            onChange={(e) => {
              setImageUrl(e.target.value);
            }}
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setLocalFile(file);
                setImageUrl('');
              }
            }}
          />
        </div>
      </Modal>

      {/* Modal para insertar video */}
      <Modal
        title="Insertar video"
        open={isVideoModalOpen}
        onCancel={() => {
          setVideoModalOpen(false);
          setVideoUrl('');
        }}
        onOk={handleInsertVideo}
        okText="Insertar"
        cancelText="Cancelar"
      >
        <Input
          placeholder="URL del video (YouTube, Vimeo...)"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
      </Modal>

      {/* Modal para insertar enlace */}
      <Modal
        title="Insertar enlace"
        open={isLinkModalOpen}
        onCancel={() => {
          setLinkModalOpen(false);
          setLinkUrl('');
        }}
        onOk={handleInsertLink}
        okText="Insertar"
        cancelText="Cancelar"
      >
        <Input
          placeholder="https://ejemplo.com"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
        />
      </Modal>
    </>
  );
}
