import React, { useEffect, useState } from 'react';
import {  Modal } from 'antd';
import useFolderManager from '../hooks/useFolderManager';
import { FolderRequestItem } from '../types/folder';

export interface SortModalProps {
  containerid: string | null,
  setContainerid: React.Dispatch<React.SetStateAction<string | null>>
  slug: string
}

export default function SortModal({ containerid, setContainerid, slug }: SortModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [folderData, setFolderData] = useState<FolderRequestItem[]>([]);
  const { getFolderContent } = useFolderManager();



  useEffect(() => {
    if (!containerid || !slug) {
      setIsModalOpen(false);
      return
    }
    getFolderContent(containerid, slug)
    .then(res => setFolderData(res.data))
    .catch(err => console.log(err));
   
    setIsModalOpen(true);
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerid, slug]);


  const handleOk = () => {
    setContainerid(null);
  };

  const handleCancel = () => {
    setContainerid(null);
  };

  return (
    <>

      <Modal
        title="Basic Modal"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
    </>
  );
}

