import FolderContainer from "../componets/folderContainer";
import rootIcon from "../assets/svg/rootIcon.svg";
import { message, Dropdown } from "antd";
import type { MenuProps } from 'antd';
import useFolderManager from "../hooks/useFolderManager";
import useFilesManager from "../hooks/useFileManager";
import { useState, useContext, useEffect } from "react";
import {  FolderNavigatorContextValues } from '../types/folder';
import { FolderNavigatorContext } from '../context/folderNavigatorContext';
import { Folder } from "../types/folder";

export default function Browser() {
  const { updateOnCreate, setModalFolder, setUpdateOnCreate } = useContext(FolderNavigatorContext) as FolderNavigatorContextValues
  const { moveFolder } = useFolderManager();
  const { moveFile } = useFilesManager();
  const [contentId, setContentId] = useState<string | null>(null);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Allows the element to be dropped here
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    // Get the dragged item's data
    const draggedItemId = event.dataTransfer.getData("id");
    const draggedItemType = Number(event.dataTransfer.getData("type"));

    // Move the item to the root (container = null)
    const fetchData = draggedItemType === 1 ? moveFolder : moveFile;
    setContentId("x")
    fetchData(draggedItemId)
      .then((response) => {
        if (response.error) {
          if (response.message === "uroboros") return
          message.error(response.message);
          return;
        }
      })
      .catch((error) => {
        message.error(error.message);
      }).finally(() => {
        setContentId(null)
      })
  };

  const handleCreateFolder = () => {
      const container = null
      const newFolder: Folder = { 
        name: "", 
        container: container 
      }
      setModalFolder(newFolder)
    }

  const handleReload = () => {
    setContentId("x")
    setTimeout(() => {
      setContentId(null)
    }, 200);
  }

  const menu: MenuProps['items'] = [
    {
      key: '1',
      label: <div style={{ textAlign: 'left' }}>Create a new folder</div>,
      onClick: () => handleCreateFolder(),
    },
    {
      key: '2',
      label: <div style={{ textAlign: 'left' }}>Create a new file</div>,
      onClick: () => message.info('Click on Create a new file'),
    },
    {
      key: '3',
      label: <div style={{ textAlign: 'left' }}>Reload</div>,
      onClick: () => handleReload(),
    },
  ];
  
    useEffect(() => {
      if (updateOnCreate !== contentId)  return
          setContentId("x")
          setTimeout(() => {
            setContentId(contentId)
            setUpdateOnCreate("x")
          }, 200);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [updateOnCreate])



  return (
    <>
      <Dropdown menu={{ items: menu }} trigger={['contextMenu']} placement="bottomLeft" arrow>
        <div
          style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <img src={rootIcon} alt="" width={25} />
          <span>Root</span>
        </div>
      </Dropdown>
      <div className="folder-container" style={{ marginLeft: "20px" }}>
        <FolderContainer folderId={contentId} />
      </div>
    </>

  );
}