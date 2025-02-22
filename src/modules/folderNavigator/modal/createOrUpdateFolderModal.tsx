import { Modal, Input, message } from "antd";
import { useEffect, useState } from "react";
import { Folder, FolderResquest, FolderData } from "../types/folder";
import useFolderManager from "../hooks/useFolderManager";
import "./createOrUpdateFolderModal.css"


export default function CreateOrUpdateFolderModal({ 
  folder, 
  setFolder, 
  setUpdateFolderRequest,
  groupDataByContainer
}: { 
  folder: Folder | null, 
  setFolder: (folder: Folder | null) => void, 
  setUpdateFolderRequest: (folder: FolderResquest | null) => void,
  groupDataByContainer: (request: { data: FolderData[] }) => FolderResquest
}) {

  const {createFolder, updateFolder, updateRootFolder} = useFolderManager()
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [containerName, setcontainerName] = useState('');
  const [containerID, setcontainerID] = useState<string | null>(null);
  const [update, setUpdate] = useState(false);


  useEffect(() => {
    if (folder) {
      setIsModalOpen(true);
      
      if (folder.container) setcontainerID(folder.id || null);
      if (folder.name) {
        setcontainerName(folder.name);
        setUpdate(true);
      }else{
        setcontainerName('');
        setUpdate(false);
      }
    } else {
      setIsModalOpen(false);
      setUpdate(false);
      setcontainerName('');
      setcontainerID('');
    }
  }, [folder]);


  const handleCancel = () => {
    setFolder(null);
  }

  const handleOk = async () => {
    if (update) {
      if(containerID?.length === 0) {
        const folderId = folder?.id ?? '';
        const request = await updateRootFolder(containerName, folderId);
        if (request.error) return message.error(request.message)
        const gruppedByContainer = groupDataByContainer(request as { data: FolderData[] });
        setUpdateFolderRequest(gruppedByContainer);
        setFolder(null);
        return
      }
      const request = await updateFolder(containerName, containerID);
      if (request.error) return message.error(request.message)
      const gruppedByContainer = groupDataByContainer(request as { data: FolderData[] });
      setUpdateFolderRequest(gruppedByContainer);
      setFolder(null);
      return;
    }
    const request = await createFolder(containerName, containerID);
    if (request.error) return message.error(request.message)
    const gruppedByContainer = groupDataByContainer(request as { data: FolderData[] });
    setUpdateFolderRequest(gruppedByContainer);
    setFolder(null);

  }

  return <Modal
    title={folder?.name ? 'Rename Folder' : 'Create Folder'}
    open={isModalOpen}
    onOk={handleOk}
    onCancel={handleCancel}
    okText={folder?.name ? 'Rename' : 'Create'}
    className="createOrUpdateFolderModal"
    okButtonProps={{ disabled: containerName.length === 0 }}
  >
    <div>
      <div>
        <label htmlFor="">Folder Name</label>
        <Input value={containerName} onChange={(e) => setcontainerName(e.target.value)} />
      </div>
    </div>
  </Modal>
}