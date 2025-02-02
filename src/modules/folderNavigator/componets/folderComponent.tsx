import { Dropdown, message } from 'antd';
import type { MenuProps } from 'antd';
import { ContainerElement } from "../types/componets";
import FolderContainer from "./folderContainer";
import { useState, useContext } from "react";
import openedFolder from '../assets/svg/opened_folder.svg'
import closedFolder from '../assets/svg/closed_folder.svg'
import useFolderManager from '../hooks/useFolderManager';
import useFilesManager from '../hooks/useFileManager';
import { Folder, FolderNavigatorContextValues, FolderResquest } from '../types/folder';
import { FolderNavigatorContext } from '../context/folderNavigatorContext';
import "./folderContainer.css"



export function FolderComponent({ folder, containerid }: { folder: ContainerElement, containerid: string | null }) {

  const { setModalFolder, setModalDeleteFolder, setUpdateFolderRequest } = useContext(FolderNavigatorContext) as FolderNavigatorContextValues

  const { moveFolder } = useFolderManager()
  const { moveFile } = useFilesManager()
  const [contentId, setContentId] = useState<string | null>(null)

  const toggleFolder = (id: string | null) => {
 
    if (!id) return
    if (!contentId) {
      setContentId(id)
    } else {
      setContentId(null)
    }
  }

 

  const handleCreateOrUpdateFolder = (update = false) => {
    const container = update ? containerid ?? undefined : folder.id
    const newFolder: Folder = {
      id: folder.id,
      name: update ? folder.name : '',
      container: container ?? undefined
    }
    setModalFolder(newFolder)
  }

  const handleDeleteFolder = () => {
    const container = containerid ?? undefined
    const newFolder: Folder = {
      id: folder.id,
      name: folder.name,
      container
    }
    setModalDeleteFolder(newFolder)

  }

  const menu: MenuProps['items'] = [
    {
      key: '1',
      label: <div style={{ textAlign: 'left' }}>Create a new folder</div>,
      onClick: () => handleCreateOrUpdateFolder(),
    },
    {
      key: '2',
      label: <div style={{ textAlign: 'left' }}> Rename this folder</div>,
      onClick: () => handleCreateOrUpdateFolder(true),
    },
    {
      key: '3',
      label: <div style={{ textAlign: 'left' }}>Delete this folder</div>,
      onClick: () => handleDeleteFolder(),
    },
    {
      type: 'divider',
    },
    {
      key: '4',
      label: <div style={{ textAlign: 'left' }}>Create a new file</div>,
      onClick: () => message.info('Click on Create a new file'),
    },
  ];


  /// drag and drop logic
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, itemId: string, itemType: number) => {
    event.dataTransfer.setData("id", itemId);
    event.dataTransfer.setData("type", itemType.toString());
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const target = event.target as HTMLDivElement;
    if (target.classList.contains('folder')) {
      target.classList.add('drag-over');
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    if (target.classList.contains('folder')) {
      target.classList.remove('drag-over');
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>, targetItemId: string, targetType: number) => {
    event.preventDefault();
    const target = event.target as HTMLDivElement;

    // styles for drag and drop
    if (target.classList.contains('folder')) {
      target.classList.remove('drag-over');
    }
    const draggedItemId = event.dataTransfer.getData("id");
    const draggedItemType = Number(event.dataTransfer.getData("type"));

  
    if (draggedItemId === targetItemId) return
    if (targetType === 0) return

    setUpdateFolderRequest(null)

    const requestFunction = draggedItemType === 0 ? moveFile : moveFolder

      const request = await requestFunction(draggedItemId, targetItemId)
      if (request.error) {
        if (request.message === "uroboros") return
        message.error(request.message)
        return
      }

      const gruppedByContainer = request?.data?.reduce((acumulador, _folder) => {
        const { container_id, itemid, name, old_container_empty, old_container_id, published, type } = _folder;
        if (!acumulador[container_id]) {
          acumulador[container_id] = [];
        }

        if(old_container_empty){
          acumulador[old_container_id] = []
        }

        acumulador[container_id].push({ 
          id: itemid,
          type,
          name, 
          container: null,
          published, 
        });
        return acumulador;
      }, {});
   
      setUpdateFolderRequest(gruppedByContainer)
    
  };



  return <div>
    <Dropdown menu={{ items: menu }} trigger={['contextMenu']} placement="bottomLeft" arrow>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 10 }}
        onClick={() => toggleFolder(folder.id ?? null)}
        className="folder"
        draggable
        onDragStart={(event) => handleDragStart(event, folder.id, folder.type)}
        onDragOver={handleDragOver}
        onDrop={(event) => handleDrop(event, folder.id, folder.type)}
        onDragLeave={handleDragLeave}
      >
        <img style={{ pointerEvents: 'none' }} src={contentId ? openedFolder : closedFolder} alt="" width={30} />
        <span className='folder-name'>{folder.name}</span>
      </div>
    </Dropdown>
    <div style={{ marginLeft: 20 }}>
      {
        contentId &&
        <div className="folder-container">
          <FolderContainer folderId={contentId} />
        </div>
      }
    </div>
  </div>

}