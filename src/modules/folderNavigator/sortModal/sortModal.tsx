import React, { useEffect, useState, useMemo, useContext } from 'react';
import { Modal, Typography } from 'antd';
import { PiFolderOpenLight } from "react-icons/pi";
import useFolderManager from '../hooks/useFolderManager';
import { FolderData, FolderRequestItem, SortableContent } from '../types/folder';
import { MainContext } from '@/modules/mainContext';
import { MainContextValues } from '@/modules/mainContext';
import DraggableItem from './Item';

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
  verticalListSortingStrategy,
  SortableContext
} from '@dnd-kit/sortable';
import groupDataByContainer from '../context/utils/groupDataByContainer';

// ---------------------------------

export interface SortModalProps {
  containerid: string | null,
  setContainerid: React.Dispatch<React.SetStateAction<string | null>>
  slug: string
  folderName: string
}


export default function SortModal({ containerid, setContainerid, slug, folderName }: SortModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [folderData, setFolderData] = useState<FolderRequestItem[]>([]);
  const { getFolderContent, sortFolderContent, getRootContent } = useFolderManager();
  const [loading, setLoading] = useState(false);
  const { setUpdateFolderRequestFromMain } = useContext(MainContext) as MainContextValues;

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

    const container = containerid === "root" ? null : containerid;

    setLoading(true);
    getFolderContent(container, slug)
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

  const handleOk = async () => {
    const data: SortableContent[] = folderData.map(item => ({
      id: item.id,
      type: item.type,
      order: item.order
    }))


    await sortFolderContent(data)

    

    if(containerid === "root") {
      const rootContent = await getRootContent(slug);
      const gruppedByContainer = groupDataByContainer(rootContent as { data: FolderData[] });
      setUpdateFolderRequestFromMain(gruppedByContainer);
      setContainerid(null);

    }else{

      const container = document.getElementById(containerid);
      if (!container) return;
      if (container.classList.contains('opened')) {
        container.click();
      }
      setTimeout(() => {
        container.click();
        setContainerid(null);
      }, 5);
    }
  };

  const handleCancel = () => {
    setContainerid(null);
  };

  return (
    <Modal
      title={
        <span style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <PiFolderOpenLight size={40} />
          {folderName}
        </span>
      }
      closable={true}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Guardar Orden"
      cancelText="Cancelar"
      width={800}


    >
      <Typography.Paragraph style={{ direction: 'ltr' }}>
        Arrastra y suelta los archivos y carpetas para cambiar su orden.
      </Typography.Paragraph>

      <div style={{ maxHeight: 600, overflowY: 'auto', overflowX: 'hidden', padding: '1px' }}>
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
              <Typography.Text disabled>La carpeta esta vacia</Typography.Text>
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