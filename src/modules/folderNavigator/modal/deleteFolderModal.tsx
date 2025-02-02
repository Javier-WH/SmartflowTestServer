import { Modal, Input, message } from "antd";
import { useEffect, useState } from "react";
import { Folder } from "../types/folder";
import useFolderManager from "../hooks/useFolderManager";
import "./createOrUpdateFolderModal.css"


export default function DeleteFolderModal({ folder, setFolder, setUpdateFolderRequest }: { folder: Folder | null, setFolder: (folder: Folder | null) => void, setUpdateFolderRequest: (folder: FolderResquest | null) => void }) {

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
    message.info('Click on ok');

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