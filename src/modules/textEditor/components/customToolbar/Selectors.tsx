import { t } from 'i18next';
import { useState, useRef, useEffect } from 'react';
import styles from './toolbar.module.css';

interface FontSelectorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  applyFormat: (format: string, value: any) => void;
  currentFont?: string;
}

interface SizeSelectorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  applyFormat: (format: string, value: any) => void;
  currentSize?: string;
}

interface HeaderSelectorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  applyFormat: (format: string, value: any) => void;
}

export function FontSelector({ applyFormat, currentFont }: FontSelectorProps) {
  const [showFontMenu, setShowFontMenu] = useState(false);
  const fontDropdownRef = useRef<HTMLDivElement>(null);

  const fonts = [
    { value: 'arial', label: 'Arial', style: { fontFamily: 'Arial, sans-serif' } },
    { value: 'times-new-roman', label: 'Times New Roman', style: { fontFamily: 'Times New Roman, serif' } },
    { value: 'courier-new', label: 'Courier New', style: { fontFamily: 'Courier New, monospace' } },
    { value: 'comic-sans-ms', label: 'Comic Sans MS', style: { fontFamily: 'Comic Sans MS, cursive' } },
    { value: 'roboto', label: 'Roboto', style: { fontFamily: 'Roboto, sans-serif' } },
    { value: 'georgia', label: 'Georgia', style: { fontFamily: 'Georgia, serif' } },
    { value: 'verdana', label: 'Verdana', style: { fontFamily: 'Verdana, sans-serif' } },
    { value: 'open-sans', label: 'Open Sans', style: { fontFamily: 'Open Sans, sans-serif' } },
    { value: 'lato', label: 'Lato', style: { fontFamily: 'Lato, sans-serif' } },
    { value: 'montserrat', label: 'Montserrat', style: { fontFamily: 'Montserrat, sans-serif' } },
    { value: 'impact', label: 'Impact', style: { fontFamily: 'Impact, sans-serif' } },
    { value: 'fantasy', label: 'Fantasy', style: { fontFamily: 'fantasy' } },
    { value: 'cursive', label: 'Cursive', style: { fontFamily: 'cursive' } },
    { value: 'monospace', label: 'Monospace', style: { fontFamily: 'monospace' } },
    { value: 'serif', label: 'Serif', style: { fontFamily: 'serif' } },
  ];

  const currentFontLabel = fonts.find(font => font.value === currentFont)?.label || 'Arial';

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target as Node)) {
        setShowFontMenu(false);
      }
    };

    if (showFontMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFontMenu]);

  const handleFontSelect = (fontValue: string) => {
    applyFormat('font', fontValue);
    setShowFontMenu(false);
  };

  return (
    <div ref={fontDropdownRef} className={styles.dropdownContainer}>
      <button
        className={styles.dropdownToggle}
        onClick={() => setShowFontMenu(!showFontMenu)}
        title={t("font_family")}
        style={{ minWidth: '100px', fontFamily: fonts.find(font => font.value === currentFont)?.style.fontFamily }}
      >
        {currentFontLabel}
      </button>

      {showFontMenu && (
        <div className={`${styles.dropdownMenu} ${styles.fontDropdownMenu}`}>
          {fonts.map((font) => (
            <button
              key={font.value}
              onClick={() => handleFontSelect(font.value)}
              className={styles.dropdownButtonItem}
              style={font.style}
              type="button"
            >
              {font.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function SizeSelector({ applyFormat, currentSize }: SizeSelectorProps) {
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const sizeDropdownRef = useRef<HTMLDivElement>(null);

  const sizes = Array.from({ length: 20 }, (_, i) => 10 + i * 2);
  const currentSizeValue = currentSize || '16px';

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(event.target as Node)) {
        setShowSizeMenu(false);
      }
    };

    if (showSizeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSizeMenu]);

  const handleSizeSelect = (size: string) => {
    applyFormat('size', size);
    setShowSizeMenu(false);
  };

  return (
    <div ref={sizeDropdownRef} className={styles.dropdownContainer}>
      <button
        className={styles.dropdownToggle}
        onClick={() => setShowSizeMenu(!showSizeMenu)}
        title={t("font_size")}
        style={{ minWidth: '70px' }}
      >
        {currentSizeValue.replace('px', '')}
      </button>

      {showSizeMenu && (
        <div className={`${styles.dropdownMenu} ${styles.sizeDropdownMenu}`}>
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => handleSizeSelect(`${size}px`)}
              className={styles.dropdownButtonItem}
              style={{ fontSize: `${size}px` }}
              type="button"
            >
              {size}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function HeaderSelector({ applyFormat }: HeaderSelectorProps) {
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const headerDropdownRef = useRef<HTMLDivElement>(null);

  const headerStyles = {
    1: { fontSize: '2em', fontWeight: 'bold' },
    2: { fontSize: '1.5em', fontWeight: 'bold' },
    3: { fontSize: '1.17em', fontWeight: 'bold' },
    4: { fontSize: '1em', fontWeight: 'bold' },
    5: { fontSize: '0.83em', fontWeight: 'bold' },
    6: { fontSize: '0.67em', fontWeight: 'bold' },
    normal: { fontSize: '1em', fontWeight: 'normal' }
  };

  const headers = [
    { value: 1, label: `${t('quill_header')} 1`, style: headerStyles[1] },
    { value: 2, label: `${t('quill_header')} 2`, style: headerStyles[2] },
    { value: 3, label: `${t('quill_header')} 3`, style: headerStyles[3] },
    { value: 4, label: `${t('quill_header')} 4`, style: headerStyles[4] },
    { value: 5, label: `${t('quill_header')} 5`, style: headerStyles[5] },
    { value: 6, label: `${t('quill_header')} 6`, style: headerStyles[6] },
    { value: 'normal', label: t('quill_paragraph'), style: headerStyles.normal },
  ];

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerDropdownRef.current && !headerDropdownRef.current.contains(event.target as Node)) {
        setShowHeaderMenu(false);
      }
    };

    if (showHeaderMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHeaderMenu]);

  const handleHeaderSelect = (headerValue: string | number) => {
    applyFormat('header', headerValue === 'normal' ? false : headerValue);
    setShowHeaderMenu(false);
  };

  return (
    <div ref={headerDropdownRef} className={styles.dropdownContainer}>
      <button
        className={styles.dropdownToggle}
        onClick={() => setShowHeaderMenu(!showHeaderMenu)}
        title={t("headers")}
        style={{ minWidth: '90px' }}
      >
        {t('quill_paragraph')}
      </button>

      {showHeaderMenu && (
        <div className={`${styles.dropdownMenu} ${styles.headerDropdownMenu}`}>
          {headers.map((header) => (
            <button
              key={header.value}
              onClick={() => handleHeaderSelect(header.value)}
              className={styles.dropdownButtonItem}
              style={header.style}
              type="button"
            >
              {header.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}