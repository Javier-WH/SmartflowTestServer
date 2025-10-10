// este es el toolbar con los modales
import { Modal, Input, message } from 'antd';
import { useEffect, useState, useRef, useCallback } from 'react';
import GuidedCheckListIcon from '../../assets/svg/addGuidedCheckList';
import { getActiveEditor } from './editorStore';
import { FaBold, FaItalic, FaUnderline, FaStrikethrough, FaListOl, FaListUl, FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify, FaLink, FaImage, FaVideo, FaRemoveFormat, FaEllipsisH } from "react-icons/fa";
import { FaListCheck } from "react-icons/fa6";
import { TbListLetters } from "react-icons/tb";
import { MdFormatColorText, MdFontDownload } from "react-icons/md";
import { FontSelector, SizeSelector, HeaderSelector } from './Selectors';
import styles from './toolbar.module.css';
import { t } from 'i18next';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Toolbar({ darkMode = false }: { darkMode?: boolean }) {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [savedEditor, setSavedEditor] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [showAlignDropdown, setShowAlignDropdown] = useState(false);
  const [hiddenButtons, setHiddenButtons] = useState<string[]>([]);
  const [currentFont, setCurrentFont] = useState<string>(''); // Estado para la fuente actual
  const [currentFontSize, setCurrentFontSize] = useState<string>('');// Estado para el tamaño de fuente actual
  const toolbarRef = useRef<HTMLDivElement>(null);
  const toolbarButtonsRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<{ [key: string]: HTMLButtonElement }>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listDropdownRef = useRef<HTMLDivElement>(null);
  const alignDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isImageModalOpen) {
      setImageUrl('');
      setLocalFile(null);
    }
  }, [isImageModalOpen]);

  // Efecto para escuchar cambios en la selección y actualizar la fuente actual
  useEffect(() => {
    let lastFont = '';
    let lastFontSize = '';
    let intervalId = null;

    const checkFontAndSize = () => {
      const editor = getActiveEditor();

      if (editor) {
        const range = editor.getSelection();
        if (range) {
          const formats = editor.getFormat(range);
          const currentFont = formats.font || '';
          const currentFontSize = formats.size || '';

          // Actualizar fuente si cambió
          if (currentFont !== lastFont) {
            lastFont = currentFont;
            setCurrentFont(currentFont);
          }

          // Actualizar tamaño de fuente si cambió
          if (currentFontSize !== lastFontSize) {
            lastFontSize = currentFontSize;
            setCurrentFontSize(currentFontSize);
          }
        } else {
          // No hay selección - resetear ambos valores
          if (lastFont !== '') {
            lastFont = '';
            setCurrentFont('');
          }
          if (lastFontSize !== '') {
            lastFontSize = '';
            setCurrentFontSize('');
          }
        }
      } else {
        // No hay editor activo - resetear ambos valores
        if (lastFont !== '') {
          lastFont = '';
          setCurrentFont('');
        }
        if (lastFontSize !== '') {
          lastFontSize = '';
          setCurrentFontSize('');
        }
      }
    };

    // Verificar cada 100ms
    intervalId = setInterval(checkFontAndSize, 100);

    // Eventos para respuesta inmediata
    const quickCheck = () => {
      requestAnimationFrame(checkFontAndSize);
    };

    document.addEventListener('click', quickCheck);
    document.addEventListener('keyup', quickCheck);
    document.addEventListener('mouseup', quickCheck);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('click', quickCheck);
      document.removeEventListener('keyup', quickCheck);
      document.removeEventListener('mouseup', quickCheck);
    };
  }, []);

  // Función para calcular botones visibles 
  const calculateVisibleButtons = useCallback(() => {
    if (!toolbarButtonsRef.current) return;

    const toolbarButtons = toolbarButtonsRef.current;
    const availableWidth = toolbarButtons.offsetWidth;

    const buttonOrder = [
      'font-selector', 'size-selector', 'header-selector',
      'bold', 'italic', 'underline', 'strike',
      'list-dropdown', 'align-dropdown', // Separados en dos menús diferentes
      'color-text', 'color-background', 'link', 'image', 'video',
      'remove-format', 'guided-checklist'
    ];

    // Mostrar todos los botones primero
    buttonOrder.forEach(key => {
      const button = buttonsRef.current[key];
      if (button) {
        button.style.display = 'flex';
      }
    });

    // Forzar reflow
    toolbarButtons.getBoundingClientRect();

    // Verificar si todos caben
    const containerWidth = toolbarButtons.scrollWidth;
    if (containerWidth <= availableWidth) {
      setHiddenButtons([]);
      return;
    }

    // Si no caben, empezar a ocultar desde el final
    const hidden = [];
    for (let i = buttonOrder.length - 1; i >= 0; i--) {
      const key = buttonOrder[i];
      const button = buttonsRef.current[key];

      if (button) {
        button.style.display = 'none';
        hidden.push(key);

        // Forzar reflow después de ocultar
        toolbarButtons.getBoundingClientRect();

        // Verificar si ahora caben
        if (toolbarButtons.scrollWidth <= availableWidth) {
          break;
        }
      }
    }

    setHiddenButtons(hidden);
  }, []);

  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        calculateVisibleButtons();
      }, 150);
    };

    // Múltiples recálculos para asegurar que todo esté renderizado
    const timeouts = [
      setTimeout(calculateVisibleButtons, 100),
      setTimeout(calculateVisibleButtons, 300),
      setTimeout(calculateVisibleButtons, 500)
    ];

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [calculateVisibleButtons]);

  // Efecto para observar cambios en el contenedor de botones
  useEffect(() => {
    if (!toolbarButtonsRef.current) return;

    const observer = new ResizeObserver(() => {
      calculateVisibleButtons();
    });

    observer.observe(toolbarButtonsRef.current);

    return () => {
      observer.disconnect();
    };
  }, [calculateVisibleButtons]);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (listDropdownRef.current && !listDropdownRef.current.contains(event.target as Node)) {
        setShowListDropdown(false);
      }
      if (alignDropdownRef.current && !alignDropdownRef.current.contains(event.target as Node)) {
        setShowAlignDropdown(false);
      }
    };

    if (showDropdown || showListDropdown || showAlignDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown, showListDropdown, showAlignDropdown]);

  // Recalcular cuando cambia el modo oscuro - MEJORADO
  useEffect(() => {
    const timeoutId = setTimeout(calculateVisibleButtons, 200);
    return () => clearTimeout(timeoutId);
  }, [darkMode, calculateVisibleButtons]);

  // Recalcular cuando se monta el componente
  useEffect(() => {
    const timeoutId = setTimeout(calculateVisibleButtons, 1000);
    return () => clearTimeout(timeoutId);
  }, [calculateVisibleButtons]);

  // Función para guardar el estado actual del editor
  const saveEditorState = () => {
    const editor = getActiveEditor();
    if (!editor) return null;

    const range = editor.getSelection();
    setSavedRange(range);
    setSavedEditor(editor);
    return { editor, range };
  };

  // Función para restaurar el estado del editor y enfocarlo
  const restoreAndFocusEditor = () => {
    if (savedEditor && savedRange) {
      savedEditor.focus();
      savedEditor.setSelection(savedRange);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const applyFormat = (format: string, value?: any) => {
    const editor = getActiveEditor();
    if (!editor) return;
    const range = editor.getSelection();
    if (range) {
      editor.format(format, value ?? true);

      // Actualizar la fuente actual si se cambió la fuente
      if (format === 'font') {
        setCurrentFont(value || '');
      }
    }
    setShowDropdown(false);
    setShowListDropdown(false);
    setShowAlignDropdown(false);
  };

  const handleQuillToolbarAction = (actionValue: string, key: string) => {
    const editor = getActiveEditor();
    if (!editor) return;
    const toolbarHandlers = editor?.options?.modules?.toolbar?.handlers;
    const handler = toolbarHandlers?.[key];
    if (typeof handler === 'function') {
      handler.call({ quill: editor }, actionValue);
    } else {
      editor.format(key, actionValue);
    }
    setShowDropdown(false);
    setShowListDropdown(false);
    setShowAlignDropdown(false);
  }

  const toggleFormat = (format: string) => {
    const editor = getActiveEditor();
    if (!editor) return;
    const range = editor.getSelection();
    if (range) {
      const current = editor.getFormat(range)[format];
      editor.format(format, !current);
    }
    setShowDropdown(false);
    setShowListDropdown(false);
    setShowAlignDropdown(false);
  };

  const handleInsertLink = () => {
    if (!savedEditor || !linkUrl.trim() || !savedRange) return;

    restoreAndFocusEditor();
    savedEditor.formatText(savedRange.index, savedRange.length, 'link', linkUrl.trim());
    setLinkUrl('');
    setSavedRange(null);
    setSavedEditor(null);
    setLinkModalOpen(false);
  };

  const insertImage = (src: string) => {
    if (!savedEditor) return;

    restoreAndFocusEditor();
    const index = savedRange?.index ?? savedEditor.getSelection()?.index ?? 0;
    savedEditor.insertEmbed(index, 'image', src);
    savedEditor.setSelection(index + 1, 0);
  };

  const handleInsertImage = () => {
    if (!savedEditor) {
      message.error(t("no_active_editor"));
      return;
    }

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

    message.warning(t("please_select_an_image"));
  };

  const normalizeVideoUrl = (url: string): string => {
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return url;
  };

  const handleInsertVideo = () => {
    if (!savedEditor || !videoUrl.trim()) {
      message.warning(t("invalid_image_url"));
      return;
    }

    restoreAndFocusEditor();
    const embedUrl = normalizeVideoUrl(videoUrl.trim());
    const index = savedRange?.index ?? savedEditor.getSelection()?.index ?? 0;
    savedEditor.insertEmbed(index, 'video', embedUrl);
    savedEditor.setSelection(index + 1, 0);
    setVideoUrl('');
    setSavedRange(null);
    setSavedEditor(null);
    setVideoModalOpen(false);
  };

  const resetImageModal = () => {
    setImageModalOpen(false);
    setImageUrl('');
    setLocalFile(null);
  };

  const openImageModal = () => {
    saveEditorState();
    setModalKey(prev => prev + 1);
    setImageModalOpen(true);
    setShowDropdown(false);
    setShowListDropdown(false);
    setShowAlignDropdown(false);
  };

  const openVideoModal = () => {
    saveEditorState();
    setVideoModalOpen(true);
    setShowDropdown(false);
    setShowListDropdown(false);
    setShowAlignDropdown(false);
  };

  const openLinkModal = () => {
    const editor = getActiveEditor();
    if (!editor) {
      message.warning(t("no_active_editor"));
      return;
    }

    const range = editor.getSelection();
    if (range && range.length > 0) {
      saveEditorState();
      setLinkModalOpen(true);
      setShowDropdown(false);
      setShowListDropdown(false);
      setShowAlignDropdown(false);
    } else {
      message.warning('Selecciona el texto que deseas enlazar.');
    }
  };

  const handleModalCancel = () => {
    setSavedRange(null);
    setSavedEditor(null);
  };

  // Handler para acciones del toolbar con manejo de estado
  const handleToolbarAction = (action: () => void) => {
    const editor = getActiveEditor();
    if (editor) {
      const range = editor.getSelection();
      setSavedRange(range);
      setSavedEditor(editor);
    }
    action();
  };

  // Función para registrar referencia de botón
  const registerButtonRef = (key: string, element: HTMLButtonElement | null) => {
    if (element) {
      buttonsRef.current[key] = element;
    }
  };

  // Renderizar botón del dropdown
  const renderDropdownButton = (key: string, icon: React.ReactNode, onClick: () => void, label: string) => (
    <button
      key={key}
      onClick={() => handleToolbarAction(onClick)}
      className={darkMode ? styles.darkDropdownButtonItem : styles.dropdownButtonItem}
      title={label}
      type="button"
    >
      <span className={styles.dropdownIcon}>{icon}</span>
      <span className={styles.dropdownLabel}>{label}</span>
    </button>
  );

  const buttonClass = styles.toolbarButton;

  return (
    <>
      <div ref={toolbarRef} className={styles.toolbarContainer}>

        <div ref={toolbarButtonsRef} className={styles.toolbarButtons}>
          {/* Font - Pasamos la fuente actual como prop */}
          <div ref={(el) => el && registerButtonRef('font-selector', el?.querySelector('button') || null)}>
            <FontSelector applyFormat={applyFormat} currentFont={currentFont} />
          </div>

          {/* Size */}
          <div ref={(el) => el && registerButtonRef('size-selector', el?.querySelector('button') || null)}>
            <SizeSelector applyFormat={applyFormat} currentSize={currentFontSize} />
          </div>

          {/* Header */}
          <div ref={(el) => el && registerButtonRef('header-selector', el?.querySelector('button') || null)}>
            <HeaderSelector applyFormat={applyFormat} />
          </div>

          {/* Text styles */}
          <button
            ref={(el) => registerButtonRef('bold', el)}
            onClick={() => handleToolbarAction(() => toggleFormat('bold'))}
            className={buttonClass}
            title={t("bold")}
            style={{ marginLeft: '15px' }}
          >
            <FaBold />
          </button>

          <button
            ref={(el) => registerButtonRef('italic', el)}
            onClick={() => handleToolbarAction(() => toggleFormat('italic'))}
            className={buttonClass}
            title={t("italic")}
          >
            <FaItalic />
          </button>

          <button
            ref={(el) => registerButtonRef('underline', el)}
            onClick={() => handleToolbarAction(() => toggleFormat('underline'))}
            className={buttonClass}
            title={t("underline")}
          >
            <FaUnderline />
          </button>

          <button
            ref={(el) => registerButtonRef('strike', el)}
            onClick={() => handleToolbarAction(() => toggleFormat('strike'))}
            className={buttonClass}
            title={t("strikethrough")}
          >
            <FaStrikethrough />
          </button>

          {/* Dropdown para Listas */}
          <div ref={listDropdownRef} className={styles.dropdownContainer}>
            <button
              ref={(el) => registerButtonRef('list-dropdown', el)}
              className={styles.dropdownToggle}
              onClick={() => setShowListDropdown(!showListDropdown)}
              title={t("lists")}
              style={{ marginLeft: '15px' }}
            >
              <FaListUl />
            </button>

            {showListDropdown && (
              <div className={`${styles.dropdownMenu} ${styles.listDropdownMenu}`}>
                {renderDropdownButton('list-ordered-dropdown', <FaListOl />, () => applyFormat('list', 'ordered'), t("ordered_list"))}
                {renderDropdownButton('list-bullet-dropdown', <FaListUl />, () => applyFormat('list', 'bullet'), t("bullet_list"))}
                {renderDropdownButton('list-alpha-dropdown', <TbListLetters />, () => applyFormat('list', 'alpha'), t("alpha_list"))}
                {renderDropdownButton('list-check-dropdown', <FaListCheck />, () => handleQuillToolbarAction('check', 'list'), t("check_list"))}
              </div>
            )}
          </div>

          {/* Dropdown para Alineación */}
          <div ref={alignDropdownRef} className={styles.dropdownContainer}>
            <button
              ref={(el) => registerButtonRef('align-dropdown', el)}
              className={styles.dropdownToggle}
              onClick={() => setShowAlignDropdown(!showAlignDropdown)}
              title={t("alignment")}
            >
              <FaAlignLeft />
            </button>

            {showAlignDropdown && (
              <div className={`${styles.dropdownMenu} ${styles.alignDropdownMenu}`}>
                {renderDropdownButton('align-left-dropdown', <FaAlignLeft />, () => applyFormat('align', ''), t("align_left"))}
                {renderDropdownButton('align-center-dropdown', <FaAlignCenter />, () => applyFormat('align', 'center'), t("align_center"))}
                {renderDropdownButton('align-right-dropdown', <FaAlignRight />, () => applyFormat('align', 'right'), t("align_right"))}
                {renderDropdownButton('align-justify-dropdown', <FaAlignJustify />, () => applyFormat('align', 'justify'), t("align_justify"))}
              </div>
            )}
          </div>

          {/* Colors */}
          <button
            ref={(el) => registerButtonRef('color-text', el)}
            className={`${buttonClass} ${styles.colorButton}`}
            title={t("text_color")}
            style={{ marginLeft: '15px' }}
          >
            <MdFormatColorText />
            <input
              type="color"
              onChange={(e) => {
                handleToolbarAction(() => applyFormat('color', e.target.value));
              }}
            />
          </button>

          <button
            ref={(el) => registerButtonRef('color-background', el)}
            className={`${buttonClass} ${styles.colorButton}`}
            title={t("background_color")}
          >
            <MdFontDownload />
            <input
              type="color"
              onChange={(e) => {
                handleToolbarAction(() => applyFormat('background', e.target.value));
              }}
            />
          </button>

          {/* Link */}
          <button
            ref={(el) => registerButtonRef('link', el)}
            onClick={() => handleToolbarAction(openLinkModal)}
            className={buttonClass}
            title={t("insert_link")}
            style={{ marginLeft: '15px' }}
          >
            <FaLink />
          </button>

          {/* Image */}
          <button
            ref={(el) => registerButtonRef('image', el)}
            onClick={() => handleToolbarAction(openImageModal)}
            className={buttonClass}
            title={t("insert_image")}
          >
            <FaImage />
          </button>

          {/* Video */}
          <button
            ref={(el) => registerButtonRef('video', el)}
            onClick={() => handleToolbarAction(openVideoModal)}
            className={buttonClass}
            title={t("insert_video")}
          >
            <FaVideo />
          </button>

          {/* Clean */}
          <button
            ref={(el) => registerButtonRef('remove-format', el)}
            onClick={() => handleToolbarAction(() => {
              const editor = getActiveEditor();
              if (editor) {
                const range = editor.getSelection();
                editor.removeFormat(range?.index ?? 0, range?.length ?? 0);
                // También resetear la fuente actual
                setCurrentFont('');
              }
            })}
            className={buttonClass}
            title={t("clean_format")}
          >
            <FaRemoveFormat />
          </button>

          {/* Guided checklist */}
          <button
            ref={(el) => registerButtonRef('guided-checklist', el)}
            onClick={() => handleToolbarAction(() => {
              const editor = getActiveEditor();
              if (!editor) return;
              const toolbarHandlers = editor?.options?.modules?.toolbar?.handlers;
              const handler = toolbarHandlers?.['guided-checklist'];
              if (typeof handler === 'function') {
                handler.call({ quill: editor });
              }
            })}
            className={buttonClass}
            title={t("guided_check_list")}
          >
            <GuidedCheckListIcon />
          </button>
        </div>

        {/* Dropdown para botones que no caben */}
        {
          hiddenButtons.length > 0 && (
            <div ref={dropdownRef} className={styles.dropdownContainer}>
              <button
                className={styles.dropdownToggle}
                onClick={() => setShowDropdown(!showDropdown)}
                title={t("more")}
              >
                <FaEllipsisH />
              </button>

              {showDropdown && (
                <div className={styles.dropdownMenu}>
                  {hiddenButtons.includes('bold') && renderDropdownButton('bold-dropdown', <FaBold />, () => toggleFormat('bold'), t("bold"))}
                  {hiddenButtons.includes('italic') && renderDropdownButton('italic-dropdown', <FaItalic />, () => toggleFormat('italic'), t("italic"))}
                  {hiddenButtons.includes('underline') && renderDropdownButton('underline-dropdown', <FaUnderline />, () => toggleFormat('underline'), t("underline"))}
                  {hiddenButtons.includes('strike') && renderDropdownButton('strike-dropdown', <FaStrikethrough />, () => toggleFormat('strike'), t("strikethrough"))}

                  {/* Listas en dropdown secundario */}
                  {hiddenButtons.includes('list-dropdown') && (
                    <>
                      {renderDropdownButton('list-ordered-dropdown', <FaListOl />, () => applyFormat('list', 'ordered'), t("ordered_list"))}
                      {renderDropdownButton('list-bullet-dropdown', <FaListUl />, () => applyFormat('list', 'bullet'), t("bullet_list"))}
                      {renderDropdownButton('list-alpha-dropdown', <TbListLetters />, () => applyFormat('list', 'alpha'), t("alpha_list"))}
                      {renderDropdownButton('list-check-dropdown', <FaListCheck />, () => handleQuillToolbarAction('check', 'list'), t("check_list"))}
                    </>
                  )}

                  {/* Alineación en dropdown secundario */}
                  {hiddenButtons.includes('align-dropdown') && (
                    <>
                      {renderDropdownButton('align-left-dropdown', <FaAlignLeft />, () => applyFormat('align', ''), t("align_left"))}
                      {renderDropdownButton('align-center-dropdown', <FaAlignCenter />, () => applyFormat('align', 'center'), t("align_center"))}
                      {renderDropdownButton('align-right-dropdown', <FaAlignRight />, () => applyFormat('align', 'right'), t("align_right"))}
                      {renderDropdownButton('align-justify-dropdown', <FaAlignJustify />, () => applyFormat('align', 'justify'), t("align_justify"))}
                    </>
                  )}

                  {/* Botones de color en dropdown secundario */}
                  {hiddenButtons.includes('color-text') && (
                    <button
                      className={darkMode ? styles.darkDropdownButtonItem : styles.dropdownButtonItem}
                      title={t("text_color")}
                      type="button"
                      onClick={() => {
                        // Crear un input de color programáticamente
                        const colorInput = document.createElement('input');
                        colorInput.type = 'color';
                        colorInput.addEventListener('change', (e) => {
                          handleToolbarAction(() => applyFormat('color', (e.target as HTMLInputElement).value));
                        });
                        colorInput.click();
                      }}
                    >
                      <span className={styles.dropdownIcon}><MdFormatColorText /></span>
                      <span className={styles.dropdownLabel}>{t("text_color")}</span>
                    </button>
                  )}

                  {hiddenButtons.includes('color-background') && (
                    <button
                      className={darkMode ? styles.darkDropdownButtonItem : styles.dropdownButtonItem}
                      title={t("background_color")}
                      type="button"
                      onClick={() => {
                        // Crear un input de color programáticamente
                        const colorInput = document.createElement('input');
                        colorInput.type = 'color';
                        colorInput.addEventListener('change', (e) => {
                          handleToolbarAction(() => applyFormat('background', (e.target as HTMLInputElement).value));
                        });
                        colorInput.click();
                      }}
                    >
                      <span className={styles.dropdownIcon}><MdFontDownload /></span>
                      <span className={styles.dropdownLabel}>{t("background_color")}</span>
                    </button>
                  )}

                  {hiddenButtons.includes('link') && renderDropdownButton('link-dropdown', <FaLink />, openLinkModal, t("insert_link"))}
                  {hiddenButtons.includes('image') && renderDropdownButton('image-dropdown', <FaImage />, openImageModal, t("insert_image"))}
                  {hiddenButtons.includes('video') && renderDropdownButton('video-dropdown', <FaVideo />, openVideoModal, t("insert_video"))}
                  {hiddenButtons.includes('remove-format') && renderDropdownButton('remove-format-dropdown', <FaRemoveFormat />, () => {
                    const editor = getActiveEditor();
                    if (editor) {
                      const range = editor.getSelection();
                      editor.removeFormat(range?.index ?? 0, range?.length ?? 0);
                      setCurrentFont('');
                    }
                  }, t("clean_format"))}
                  {hiddenButtons.includes('guided-checklist') && renderDropdownButton('guided-checklist-dropdown', <GuidedCheckListIcon />, () => {
                    const editor = getActiveEditor();
                    if (!editor) return;
                    const toolbarHandlers = editor?.options?.modules?.toolbar?.handlers;
                    const handler = toolbarHandlers?.['guided-checklist'];
                    if (typeof handler === 'function') {
                      handler.call({ quill: editor });
                    }
                  }, t("guided_check_list"))}
                </div>
              )}
            </div>
          )
        }

      </div>

      {/* Modal de Insertar Imagen */}
      <Modal
        key={modalKey}
        title={t("insert_image")}
        open={isImageModalOpen}
        onCancel={() => {
          resetImageModal();
          handleModalCancel();
        }}
        onOk={handleInsertImage}
        okText={t("insert_label")}
        cancelText={t("cancel_label")}
        wrapClassName={styles.minimalistModalWrap}
        centered
      >
        <div className="flex flex-col gap-4">
          {!localFile && <Input
            style={{ direction: 'ltr' }}
            placeholder={t("image_placeholder")}
            value={imageUrl}
            disabled={!!localFile}
            onChange={(e) => {
              setImageUrl(e.target.value);
            }}
          />}

          <div className={styles.customFileInput}>
            {/* Texto que se muestra como un botón */}
            {localFile
              ? localFile.name
              : t("select_file_label")
            }

            <input
              type="file"
              accept="image/*"
              className={styles.fileInputButton}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setLocalFile(file);
                  setImageUrl('');
                }
              }}
            />
          </div>
        </div>
      </Modal>

      {/* Modal de Insertar Video */}
      <Modal
        title={t("insert_video")}
        open={isVideoModalOpen}
        onCancel={() => {
          setVideoModalOpen(false);
          setVideoUrl('');
          handleModalCancel();
        }}
        onOk={handleInsertVideo}
        okText={t("insert_label")}
        cancelText={t("cancel_label")}
        wrapClassName={styles.minimalistModalWrap}
        centered
      >
        <Input
          style={{ direction: 'ltr' }}
          placeholder={t("video_placeholder")}
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
      </Modal>

      {/* Modal de Insertar Enlace */}
      <Modal
        title={t("insert_link")}
        open={isLinkModalOpen}
        onCancel={() => {
          setLinkModalOpen(false);
          setLinkUrl('');
          handleModalCancel();
        }}
        onOk={handleInsertLink}
        okText={t("insert_label")}
        cancelText={t("cancel_label")}
        wrapClassName={styles.minimalistModalWrap}
        centered
      >
        <Input
          style={{ direction: 'ltr' }}
          placeholder={t("link_placeholder")}
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
        />
      </Modal>
    </>
  );
}