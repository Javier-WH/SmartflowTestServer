import { t } from 'i18next';
import styles from './toolbar.module.css'

export function FontSelector({ applyFormat }) {

  return (
    <div className={styles.selectWrapper}>
    <select
      onChange={(e) => applyFormat('font', e.target.value)}
      defaultValue="arial"
      className={`${styles.toolbarSelect} ${styles.fontSelector}`}
    >

      <option value="arial" style={{ fontFamily: 'Arial, sans-serif' }}>Arial</option>
      <option value="times-new-roman" style={{ fontFamily: 'Times New Roman, serif' }}>Times New Roman</option>
      <option value="courier-new" style={{ fontFamily: 'Courier New, monospace' }}>Courier New</option>
      <option value="comic-sans-ms" style={{ fontFamily: 'Comic Sans MS, cursive' }}>Comic Sans MS</option>
      <option value="roboto" style={{ fontFamily: 'Roboto, sans-serif' }}>Roboto</option>
      <option value="georgia" style={{ fontFamily: 'Georgia, serif' }}>Georgia</option>
      <option value="verdana" style={{ fontFamily: 'Verdana, sans-serif' }}>Verdana</option>
      <option value="open-sans" style={{ fontFamily: 'Open Sans, sans-serif' }}>Open Sans</option>
      <option value="lato" style={{ fontFamily: 'Lato, sans-serif' }}>Lato</option>
      <option value="montserrat" style={{ fontFamily: 'Montserrat, sans-serif' }}>Montserrat</option>
      <option value="impact" style={{ fontFamily: 'Impact, sans-serif' }}>Impact</option>
      <option value="fantasy" style={{ fontFamily: 'fantasy' }}>Fantasy</option>
      <option value="cursive" style={{ fontFamily: 'cursive' }}>Cursive</option>
      <option value="monospace" style={{ fontFamily: 'monospace' }}>Monospace</option>
      <option value="serif" style={{ fontFamily: 'serif' }}>Serif</option>
    </select>
     </div>
  );
}


export function SizeSelector({ applyFormat }) {

  return (
    <select className={`${styles.toolbarSelect} ${styles.sizeSelector}`} onChange={(e) => applyFormat('size', e.target.value)} defaultValue="16px">
      {Array.from({ length: 20 }, (_, i) => 10 + i * 2).map((size) => (
        <option key={size} value={`${size}px`}>{size}</option>
      ))}
    </select>
  )
}



export function HeaderSelector({ applyFormat }) {


  const headerStyles = {
  
    1: { fontSize: '2em', fontWeight: 'bold' },    
    2: { fontSize: '1.5em', fontWeight: 'bold' },  
    3: { fontSize: '1.17em', fontWeight: 'bold' }, 
    4: { fontSize: '1em', fontWeight: 'bold' },   
    5: { fontSize: '0.83em', fontWeight: 'bold' },
    6: { fontSize: '0.67em', fontWeight: 'bold' }, 
    normal: { fontSize: '1em', fontWeight: 'normal' } 
  };

  return (
    <select
      className={`${styles.toolbarSelect} ${styles.headerSelector}`}
      onChange={(e) => applyFormat('header', e.target.value === 'normal' ? false : parseInt(e.target.value))}
      defaultValue="normal"
    >
      {[1, 2, 3, 4, 5, 6].map((h) => (
        <option
          key={h}
          value={h}
     
          style={headerStyles[h]}
        >
          {`${t('quill_header')} ${h}`}
        </option>
      ))}
      <option
        value="normal"
  
        style={headerStyles.normal}
      >
        {t('quill_paragraph')}
      </option>
    </select>
  )
}