import { Dropdown, message } from 'antd';
import type { MenuProps } from 'antd';
import { ContainerElement } from "../types/componets";
import FolderContainer from "./folderContainer";
import { useState } from "react";
import openedFolder from '../assets/svg/opened_folder.svg'
import closedFolder from '../assets/svg/closed_folder.svg'
import "./folderContainer.css"
import useFolderManager from '../hooks/useFolderManager';


export function FolderComponent({ folder, onFolderMove }: { folder: ContainerElement, onFolderMove: () => void }) {

  const { moveFolder } = useFolderManager()
  const [contentId, setContentId] = useState<string | null>(null)


  const toggleFolder = (id: string | null) => {
    if (!id) return
    if (!contentId) {
      setContentId(id)
    } else {
      setContentId(null)
    }
  }

  const menu: MenuProps['items'] = [
    {
      key: '1',
      label: <div style={{ textAlign: 'left' }}>Create a new folder</div>,
      onClick: () => message.info('Click on Create a new folder'), 
    },
    {
      key: '2',
      label: <div style={{ textAlign: 'left' }}> Rename this folder</div>,
      onClick: () => message.info('Click on Rename this folder'),
    },
    {
      key: '3',
      label: <div style={{ textAlign: 'left' }}>Delete this folder</div>,
      onClick: () => message.info('Click on Delete this folder'),
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


  ///

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, itemId: string, itemType: number) => {
    event.dataTransfer.setData("id", itemId);
    event.dataTransfer.setData("type", itemType.toString());
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    onFolderMove();
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>, targetItemId: string, targetType: number) => {
    event.preventDefault();
    //event.stopPropagation();
    const draggedItemId = event.dataTransfer.getData("id");    
    if (draggedItemId === targetItemId) return

    // move folder in data base
    if (targetType === 1) {
      const response = await moveFolder(draggedItemId, targetItemId)
      if (response.error) {
        message.error(response.error)
        return
      }
    }

    
//////// update target container in 10ms
    setContentId(null)
    setTimeout(() => {
      setContentId(folder.id)
    }, 10);
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
      >
        <img src={contentId ? openedFolder : closedFolder} alt="" width={30} />
        <span>{folder.name}</span>
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