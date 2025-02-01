import { Modal, Input, message } from "antd";
import { useEffect, useState } from "react";
import { Folder } from "../types/folder";
import useFolderManager from "../hooks/useFolderManager";
import "./createOrUpdateFolderModal.css"


export default function DeleteFolderModal({ folder, setFolder, setUpdateOnCreate }: { folder: Folder | null, setFolder: (folder: Folder | null) => void, setUpdateOnCreate: (update: string | null) => void }) {

  const { deleteFolder } = useFolderManager()
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [deleteText, setDeleteText] = useState('');


  useEffect(() => {
    if (folder) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
    setDeleteText('')

  }, [folder]);


  const handleCancel = () => {
    setFolder(null);
  }

  const handleOk = async () => {
    if (deleteText !== "delete") return
    setUpdateOnCreate("x")
   
    const response = await deleteFolder(folder?.id ?? '')
    if (response.error) {
      message.error(response.message)
      return
    }

    setUpdateOnCreate(folder?.container ?? null)
    message.success(response.message)
    setFolder(null)

  }

  return <Modal
    title={`Delete Folder ${folder?.name}`}
    open={isModalOpen}
    onOk={handleOk}
    onCancel={handleCancel}
    okText={"Delete"}
    className="createOrUpdateFolderModal"
    okButtonProps={{ disabled: deleteText.toLocaleLowerCase() !== "delete", danger: true }}
  >
    <div>
      <div>
        <label htmlFor="">Type "delete" to confirm</label>
        <Input value={deleteText} onChange={(e) => setDeleteText(e.target.value)} />
      </div>
    </div>
  </Modal>
}