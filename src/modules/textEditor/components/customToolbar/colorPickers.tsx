import { useState, useRef, useEffect } from 'react';
import styles from './ColorPickers.module.css';
import toolStyles from './toolbar.module.css';
import { MdFormatColorText, MdFontDownload } from "react-icons/md";
import { t } from 'i18next';

interface TextColorPickerProps {
  applyFormat: (format: string, value: string) => void;
  currentColor: string;
  buttonRef?: (element: HTMLButtonElement | null) => void;
}

interface BackgroundColorPickerProps {
  applyFormat: (format: string, value: string) => void;
  currentBackground: string;
  buttonRef?: (element: HTMLButtonElement | null) => void;
}

const colors = [
  '#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#EFEFEF', '#F3F3F3', '#FFFFFF',
  '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#9900FF', '#FF00FF',
  '#E6B8AF', '#F4CCCC', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#D0E0E3', '#C9DAF8', '#E1D5E7', '#EA9999',
  '#F9CB9C', '#FFE599', '#B6D7A8', '#A2C4C9', '#A4C2F4', '#B4A7D6', '#D5A6BD', '#CC4125', '#E06666',
  '#F6B26B', '#FFD966', '#93C47D', '#76A5AF', '#6D9EEB', '#8E7CC3', '#C27BA0', '#A61C00', '#CC0000',
  '#E69138', '#F1C232', '#6AA84F', '#45818E', '#3C78D8', '#674EA7', '#A64D79', '#85200C', '#990000'
];



export function TextColorPicker({ applyFormat, currentColor, buttonRef }: TextColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonElementRef = useRef<HTMLButtonElement>(null);

  // Pasar la referencia del botón al componente padre
  useEffect(() => {
    if (buttonRef && buttonElementRef.current) {
      buttonRef(buttonElementRef.current);
    }
  }, [buttonRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleColorSelect = (color: string) => {
    applyFormat('color', color);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={styles.dropdownContainer}>
      <button
        ref={buttonElementRef}
        className={toolStyles.toolbarButton}
        onClick={() => setIsOpen(!isOpen)}
        title={t("text_color")}
      >
       <MdFormatColorText  />
      </button>

      {isOpen && (
        <div className={styles.colorDropdownMenu}>
          <div className={styles.colorGrid}>
            {colors.map((color, index) => (
              <button
                key={index}
                className={styles.colorOption}
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
                title={color}
              />
            ))}
          </div>
          {/*<div className={styles.colorInputContainer}>
            <input
              type="color"
              value={currentColor || '#000000'}
              onChange={(e) => handleColorSelect(e.target.value)}
              className={styles.colorInput}
            />
            <span className={styles.colorInputLabel}>Personalizado</span>
          </div>*/}
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function BackgroundColorPicker({ applyFormat, currentBackground, buttonRef }: BackgroundColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonElementRef = useRef<HTMLButtonElement>(null);

  // Pasar la referencia del botón al componente padre
  useEffect(() => {
    if (buttonRef && buttonElementRef.current) {
      buttonRef(buttonElementRef.current);
    }
  }, [buttonRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleColorSelect = (color: string) => {
    applyFormat('background', color);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={styles.dropdownContainer}>
      <button
        ref={buttonElementRef}
        className={toolStyles.toolbarButton}
        onClick={() => setIsOpen(!isOpen)}
        title={t("background_color")}
   
      >
        <MdFontDownload  />
      </button>

      {isOpen && (
        <div className={styles.colorDropdownMenu}>
          <div className={styles.colorGrid}>
            {colors.map((color, index) => (
              <button
                key={index}
                className={styles.colorOption}
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
                title={color}
              />
            ))}
          </div>
          {/*

            <div className={styles.colorInputContainer}>
            <input
              type="color"
              value={currentBackground || '#FFFFFF'}
              onChange={(e) => handleColorSelect(e.target.value)}
              className={styles.colorInput}
              />
            <span className={styles.colorInputLabel}>Personalizado</span>
          </div>
            */}
        </div>
      )}
    </div>
  );
}