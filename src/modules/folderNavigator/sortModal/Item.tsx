
import React from 'react';
import { FolderRequestItem } from '../types/folder';
import { useSortable} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {  Flex, theme } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { CiFileOn } from "react-icons/ci"; 
import { PiFolderLight} from "react-icons/pi";

interface DraggableItemProps {
  item: FolderRequestItem;
}
const DraggableItem: React.FC<DraggableItemProps> = (props) => {

  const { item } = props;
  const { token } = theme.useToken();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: token.paddingSM,
    marginBottom: token.marginXS,
    backgroundColor: isDragging ? token.colorPrimaryBg : token.colorBgContainer,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadius,
    opacity: isDragging ? 0.8 : 1,
    cursor: 'default',
    zIndex: isDragging ? 1000 : 'auto',
   
  };

  return (
    <div style={style} ref={setNodeRef}>
      <Flex justify="start" gap="20px" align="center" style={{ direction: "ltr"}} >
        <span
          style={{ cursor: 'grab', padding: '0 8px' }}
          {...attributes}
          {...listeners}
        >
          <MenuOutlined />
        </span>
        <div style={{ display: 'flex', alignItems: 'left', fontSize: '16px', gap: '10px' }}> {item.type === 1 ? <PiFolderLight size={25} /> : <CiFileOn size={25} />} {item.name}</div>

     
      </Flex>
    </div>
  );
};

export default DraggableItem;