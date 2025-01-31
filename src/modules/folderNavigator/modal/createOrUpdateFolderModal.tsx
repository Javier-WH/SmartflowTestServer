import { Modal, Input, message } from "antd";
import { useEffect, useState } from "react";
import { Folder } from "../types/folder";
import useFolderManager from "../hooks/useFolderManager";
import "./createOrUpdateFolderModal.css"


export default function CreateOrUpdateFolderModal({folder, setFolder, setUpdateOnCreate}: {folder: Folder | null, setFolder: (folder: Folder| null) => void, setUpdateOnCreate: (update: string | null) => void}) {

  const { createFolder } = useFolderManager()
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [name, setName] = useState('');


  useEffect(() => {
    if (folder) {
      setIsModalOpen(true);
      if(folder.name) setName(folder.name);
    }else {
      setIsModalOpen(false);
      setName('');
    }

  }, [folder]);


  const handleCancel = () => {
    setFolder(null);
  }

  const handleOk = async () => {

    if (name.length === 0) return

    const newFolder: Folder = {
      ... folder,
      name
    }

    const response = await createFolder(newFolder)
    if (response.error) {
      message.error(response.message)
      return
    }

 

    setUpdateOnCreate(folder?.container ?? '')
    message.success(response.message)
    setFolder(null)
    
  }

  return <Modal
    title="Crear nueva carpeta"
    open={isModalOpen}
    onOk={handleOk}
    onCancel={handleCancel}
    okText="Create"
    className="createOrUpdateFolderModal"
    okButtonProps={{ disabled: name.length === 0 }}
  >
    <div>
      <div >
        <label htmlFor="">Nombre de la carpeta</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

    </div>
  </Modal>
}