import { Modal, Input, message } from "antd";
import { useEffect, useState } from "react";
import { Folder, FolderResquest } from "../types/folder";
import useFolderManager from "../hooks/useFolderManager";
import "./createOrUpdateFolderModal.css"


export default function CreateOrUpdateFolderModal({ folder, setFolder, setUpdateFolderRequest }: { folder: Folder | null, setFolder: (folder: Folder | null) => void, setUpdateFolderRequest: (folder: FolderResquest | null) => void }) {

  const { createFolder, updateFolderName } = useFolderManager()
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [name, setName] = useState('');


  useEffect(() => {
    if (folder) {
      setIsModalOpen(true);
      if (folder.name) setName(folder.name);
    } else {
      setIsModalOpen(false);
      setName('');
    }

  }, [folder]);


  const handleCancel = () => {
    setFolder(null);
  }

  const handleOk = async () => {
    message.info('Click on ok');

  }

  return <Modal
    title={folder?.name ? 'Rename Folder' : 'Create Folder'}
    open={isModalOpen}
    onOk={handleOk}
    onCancel={handleCancel}
    okText={folder?.name ? 'Rename' : 'Create'}
    className="createOrUpdateFolderModal"
    okButtonProps={{ disabled: name.length === 0 }}
  >
    <div>
      <div>
        <label htmlFor="">Folder Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
    </div>
  </Modal>
}