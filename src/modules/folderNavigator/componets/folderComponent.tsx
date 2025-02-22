import { Dropdown, message } from 'antd';
import type { MenuProps } from 'antd';
import { ContainerElement } from "../types/componets";
import FolderContainer from "./folderContainer";
import { useState, useContext } from "react";
import openedFolder from '../assets/svg/opened_folder.svg'
import closedFolder from '../assets/svg/closed_folder.svg'
import useFolderManager from '../hooks/useFolderManager';
import useFilesManager from '../hooks/useFileManager';
import { Folder, FolderNavigatorContextValues, FolderData} from '../types/folder';
import { FolderNavigatorContext } from '../context/folderNavigatorContext';
import "./folderContainer.css"



export function FolderComponent({ folder, containerid }: { folder: ContainerElement, containerid: string | null }) {

  const { setModalFolder, setModalDeleteFolder, setUpdateFolderRequest, groupDataByContainer } = useContext(FolderNavigatorContext) as FolderNavigatorContextValues

  const { moveFolder, moveFolderToRoot } = useFolderManager()
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

  const handleMoveToRoot = async () => {
    const request = await moveFolderToRoot(folder.id)
    const gruppedByContainer = groupDataByContainer(request as { data: FolderData[] });
    setUpdateFolderRequest(gruppedByContainer);
  }

  const menu: MenuProps['items'] = [
    {
      key: '1',
      label: <div style={{ textAlign: 'left' }}>Move to root</div>,
      onClick: () => handleMoveToRoot(),
    },
    {
      key: '2',
      label: <div style={{ textAlign: 'left' }}>Create a new folder</div>,
      onClick: () => handleCreateOrUpdateFolder(),
    },
    {
      key: '3',
      label: <div style={{ textAlign: 'left' }}> Rename this folder</div>,
      onClick: () => handleCreateOrUpdateFolder(true),
    },
    {
      key: '4',
      label: <div style={{ textAlign: 'left' }}>Delete this folder</div>,
      onClick: () => handleDeleteFolder(),
    },
    {
      type: 'divider',
    },
    {
      key: '5',
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


      if (request.data) {
        const gruppedByContainer = groupDataByContainer(request as { data: FolderData[] });
        setUpdateFolderRequest(gruppedByContainer);
      }
  
  };

 /*
  interface FolderData {
    container_id: string;
    itemid: string;
    name: string;
    old_container_empty: boolean;
    old_container_id: string;
    published: boolean;
    type: number;
  }

 
  const groupDataByContainer = (request: { data: FolderData[] }): FolderResquest => {
  
    const gruppedByContainer = request?.data?.reduce((acumulador: FolderResquest, _folder: FolderData) => {
      const { container_id, itemid, name, old_container_empty, old_container_id, published, type } = _folder;
      if (!acumulador[container_id]) {
        acumulador[container_id] = [];
      }
      //console.log({old_container_id, old_container_empty})
      if (old_container_empty === true && old_container_id !== null) {
        acumulador[old_container_id] = []
      }

      acumulador[container_id].push({
        id: itemid,
        type,
        name,
        published,
      });
      return acumulador;
    }, {});
    
    return gruppedByContainer;
  }
*/

  return <div>
    <Dropdown menu={{ items: menu }} trigger={['contextMenu']} placement="bottomLeft">
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