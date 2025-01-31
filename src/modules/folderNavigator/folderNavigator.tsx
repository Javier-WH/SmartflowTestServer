import FolderContainer from "./componets/folderContainer";
import { FolderNavigatorProvider } from "./context/folderNavigatorContext";
import rootIcon from "./assets/svg/rootIcon.svg";
import { message, Dropdown } from "antd";
import type { MenuProps } from 'antd';
import useFolderManager from "./hooks/useFolderManager";
import useFilesManager from "./hooks/useFileManager";
import { useState } from "react";


export default function FolderNavigator() {
  const { moveFolder} = useFolderManager();
  const { moveFile } = useFilesManager();
  const [contentId, setContentId] = useState<string | null>(null);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Permite que el elemento se suelte aquí
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    // Obtener los datos del elemento arrastrado
    const draggedItemId = event.dataTransfer.getData("id");
    const draggedItemType = Number(event.dataTransfer.getData("type"));

    // Mover el elemento a la raíz (container = null)
    const fetchData = draggedItemType === 1 ? moveFolder : moveFile;
    setContentId("needed to refresh")
    fetchData(draggedItemId)
      .then((response) => {
        if (response.error) {
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

  const menu: MenuProps['items'] = [
    {
      key: '1',
      label: <div style={{ textAlign: 'left' }}>Create a new folder</div>,
      onClick: () => message.info('Click on Create a new folder'),
    },
    {
      key: '2',
      label: <div style={{ textAlign: 'left' }}>Create a new file</div>,
      onClick: () => message.info('Click on Create a new file'),
    },
    {
      key: '3',
      label: <div style={{ textAlign: 'left' }}>Reload</div>,
      onClick: () => message.info('Click on Reload'),
    },
  ];


  return (
    <FolderNavigatorProvider>
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
    </FolderNavigatorProvider>
  );
}