import { Dropdown, message } from 'antd';
import type { MenuProps } from 'antd';
import { ContainerElement } from "../types/componets";
import FolderContainer from "./folderContainer";
import { useState, useContext, useEffect} from "react";
import openedFolder from '../assets/svg/opened_folder.svg'
import closedFolder from '../assets/svg/closed_folder.svg'
import useFolderManager from '../hooks/useFolderManager';
import useFilesManager from '../hooks/useFileManager';
import { Folder, FolderNavigatorContextValues } from '../types/folder';
import { FolderNavigatorContext } from '../context/folderNavigatorContext';
import "./folderContainer.css"



export function FolderComponent({ folder, onFolderMove }: { folder: ContainerElement, onFolderMove: () => void }) {

  const { setModalFolder, updateOnCreate,  setUpdateOnCreate } = useContext(FolderNavigatorContext) as FolderNavigatorContextValues

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

  useEffect(() => {
    if (updateOnCreate !== folder.id)  return
      setContentId(null)
      setTimeout(() => {
        setContentId(folder.id)
        setUpdateOnCreate(null)
      }, 150);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateOnCreate])


  const handleCreateOrUpdateFolder = (update = false) => {
    const containerId = folder.id
    const newFolder: Folder = { 
      name: update ? folder.name : '', 
      container: containerId,
    }
    setModalFolder(newFolder)
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
      onClick: () => message.info('Click on Rename this folder'),
    },
    {
      key: '3',
      label: <div style={{ textAlign: 'left' }}>Delete this folder</div>,
      onClick: () => message.info('Click on Delete this folder'),
    },
    {
      key: '4',
      label: <div style={{ textAlign: 'left' }}>Move this folder to root</div>,
      onClick: () => message.info('Click on Move this folder to root'),
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
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>, targetItemId: string, targetType: number) => {
    event.preventDefault();
    const draggedItemId = event.dataTransfer.getData("id");
    const draggedItemType = Number(event.dataTransfer.getData("type"));
    if (draggedItemId === targetItemId) return
    if (targetType === 0) return
    setContentId(null)
    const fetchData = draggedItemType === 1 ? moveFolder : moveFile

    fetchData(draggedItemId, targetItemId)
      .then((response) => {
        if (response.error) {
          if (response.message === "uroboros") return
          message.error(response.message)
          return
        }
      })
      .catch((error) => {
        message.error(error)
      })
      .finally(async() => {
        setContentId(folder.id)
      })
  };

  const onDragEnd = () => {
    onFolderMove()
  }




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
        onDragEnd={onDragEnd}
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