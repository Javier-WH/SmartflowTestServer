import { Dropdown, message } from 'antd';
import type { MenuProps } from 'antd';

import { ContainerElement } from "../types/componets";
import FolderContainer from "./folderContainer";
import { useState } from "react";
import openedFolder from '../assets/svg/opened_folder.svg'
import closedFolder from '../assets/svg/closed_folder.svg'
import "./folderContainer.css"


export function FolderComponent({ folder }: { folder: ContainerElement }) {

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

  return <div>
    <Dropdown menu={{ items: menu }} trigger={['contextMenu']} placement="bottomLeft" arrow>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 10 }}
        onClick={() => toggleFolder(folder.id ?? null)}
        className="folder"
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