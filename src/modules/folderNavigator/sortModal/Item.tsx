import React from 'react';
import { FolderRequestItem } from '../types/folder';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Flex } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { CiFileOn } from "react-icons/ci";
import { PiFolderLight } from "react-icons/pi";
// --- Importar estilos ---
import styles from './DraggableItem.module.css';

interface DraggableItemProps {
  item: FolderRequestItem;
}
const DraggableItem: React.FC<DraggableItemProps> = (props) => {

  const { item } = props;


  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    // 💡 Transformaciones y transiciones deben seguir en línea para que DND-Kit funcione
    transform: CSS.Transform.toString(transform),
    transition,
    // La opacidad también es importante para el feedback visual
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  // 💡 Aplicamos clases condicionales
  const itemClasses = `${styles.item} ${isDragging ? styles['item-dragging'] : ''}`;

  return (
    <div className={itemClasses} style={style} ref={setNodeRef}>
      <Flex justify="start" gap="20px" align="center" style={{ direction: "ltr" }} >
        <span
          className={styles['drag-handle']} // Clase para el manejador de arrastre
          {...attributes}
          {...listeners}
        >
          <MenuOutlined className={styles['drag-icon']} />
        </span>
        <div className={styles['item-content']}>
          {item.type === 1 ? <PiFolderLight size={20} className={styles['folder-icon']} /> : <CiFileOn size={20} className={styles['file-icon']} />}
          <span className={styles['item-name']}>{item.name}</span>
        </div>
      </Flex>
    </div>
  );
};

export default DraggableItem;