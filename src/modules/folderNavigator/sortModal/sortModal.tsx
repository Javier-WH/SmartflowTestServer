import React, { useEffect, useState, useMemo } from 'react';
import { Modal, Flex, Typography, theme } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import useFolderManager from '../hooks/useFolderManager';
import { FolderRequestItem } from '../types/folder';

// --- Importaciones de DND-Kit ---
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  verticalListSortingStrategy, // Estrategia para listas verticales
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// ---------------------------------

export interface SortModalProps {
  containerid: string | null,
  setContainerid: React.Dispatch<React.SetStateAction<string | null>>
  slug: string
}

// ----------------------------------------------------
// 1. Componente de Elemento Arrastrable (DraggableItem)
// ----------------------------------------------------

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
      <Flex justify="space-between" align="center">
        <Typography.Text>{item.name} ({item.type === 1 ? 'Carpeta' : 'Archivo'})</Typography.Text>

        {/* Ícono de arrastre: se adjuntan los listeners y attributes aquí */}
        <span
          style={{ cursor: 'grab', padding: '0 8px' }}
          {...attributes}
          {...listeners}
        >
          <MenuOutlined />
        </span>
      </Flex>
    </div>
  );
};

// ----------------------------------------------------
// 2. Componente Principal del Modal
// ----------------------------------------------------

export default function SortModal({ containerid, setContainerid, slug }: SortModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [folderData, setFolderData] = useState<FolderRequestItem[]>([]);
  const { getFolderContent } = useFolderManager();
  const [loading, setLoading] = useState(false);

  // Los IDs de los elementos son necesarios para SortableContext
  const itemsIds = useMemo(() => folderData.map(item => item.id), [folderData]);

  // Configuración de Sensores (para detectar el arrastre)
  const sensors = useSensors(useSensor(PointerSensor));

  // Ordena los datos por el campo 'order' al cargar el modal
  useEffect(() => {
    if (!containerid || !slug) {
      setIsModalOpen(false);
      return;
    }

    setLoading(true);
    getFolderContent(containerid, slug)
      .then(res => {
        // Ordenar la data inicial por el campo 'order'
        const sortedData = res.data.sort((a: FolderRequestItem, b: FolderRequestItem) => (a.order || 0) - (b.order || 0));
        setFolderData(sortedData);
      })
      .catch(err => console.error('Error fetching folder content:', err))
      .finally(() => setLoading(false));

    setIsModalOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerid, slug]);


  // Función principal para manejar el final del arrastre
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // 1. Reordenar el array en el estado
    setFolderData((prevItems) => {
      const oldIndex = prevItems.findIndex((item) => item.id === active.id);
      const newIndex = prevItems.findIndex((item) => item.id === over.id);

      const newOrderedItems = arrayMove(prevItems, oldIndex, newIndex);

      // 2. Actualizar el campo 'order' de cada objeto en el array reordenado
      const itemsWithNewOrder = newOrderedItems.map((item, index) => ({
        ...item,
        order: index + 1 // Asignar la nueva posición como el valor de 'order'
      }));

      return itemsWithNewOrder;
    });
  };

  const handleOk = () => {
    // Aquí debes implementar la lógica para:
    // 1. Enviar 'folderData' (que ya tiene los campos 'order' actualizados) a tu API.
    // 2. Por ejemplo: updateFolderOrder(folderData);
    console.log('Datos a guardar con nuevo orden:', folderData);

    // Simulación de cierre
    setContainerid(null);
  };

  const handleCancel = () => {
    setContainerid(null);
  };

  return (
    <Modal
      title="Ordenar Contenido de la Carpeta"
      closable={true}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading} // Usamos loading para deshabilitar el botón de OK si está cargando
      okText="Guardar Orden"
      cancelText="Cancelar"
      width={600}
    >
      <Typography.Paragraph>
        Arrastra y suelta los elementos para cambiar su orden.
      </Typography.Paragraph>

      <div style={{ maxHeight: 400, overflowY: 'auto', padding: '1px' }}>
        <DndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCenter}
        >
          <SortableContext
            items={itemsIds}
            strategy={verticalListSortingStrategy} // Vertical
          >
            {folderData.length === 0 && !loading ? (
              <Typography.Text disabled>No hay elementos para ordenar.</Typography.Text>
            ) : (
              folderData.map((item) => (
                <DraggableItem item={item} key={item.id} />
              ))
            )}
          </SortableContext>
        </DndContext>
      </div>

    </Modal>
  );
}