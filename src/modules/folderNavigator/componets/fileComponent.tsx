import { Dropdown, message } from 'antd';
import type { MenuProps } from 'antd';
import { ContainerElement } from "../types/componets";
import publishedIcon from '../assets/svg/publishedFile.svg'
import unPublishedIcon from '../assets/svg/unPublishedFile.svg'
import { FolderNavigatorContext } from "../context/folderNavigatorContext";
import { FolderNavigatorContextValues } from "../types/folder";
import "./folderContainer.css"
import { useContext } from 'react';


export function FileComponent({ file, containerid }: { file: ContainerElement, containerid: string | null }) {

    const {setUpdateOnCreate} = useContext(FolderNavigatorContext) as FolderNavigatorContextValues
  const handleClick = (id: string) => {
    console.log(id)
  }

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, itemId: string, itemType: number) => {
    event.dataTransfer.setData("id", itemId);
    event.dataTransfer.setData("type", itemType.toString());
  };
  const onDragEnd = () => {
    setUpdateOnCreate(containerid)
  }


  const menu: MenuProps['items'] = [
    {
      key: '1',
      label: <div style={{ textAlign: 'left' }}> Open this file</div>,
      onClick: () => message.info('Click on Open this file'),
    },
    {
      key: '2',
      label: <div style={{ textAlign: 'left' }}> Rename this file</div>,
      onClick: () => message.info('Click on Rename this file'),
    },
    {
      key: '3',
      label: <div style={{ textAlign: 'left' }}>Delete this file</div>,
      onClick: () => message.info('Click on Delete this file'),
    },
    {
      key: '4',
      label: <div style={{ textAlign: 'left' }}>Move this file to root</div>,
      onClick: () => message.info('Click to move this file to root'),
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

  return <div>
    <Dropdown menu={{ items: menu }} trigger={['contextMenu']} placement="bottomLeft" arrow>
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 10 }}
      onClick={() => handleClick(file.id)}
      className="folder"
      draggable
      onDragStart={(event) => handleDragStart(event, file.id, file.type)}
      onDragEnd={onDragEnd}
    >
      <img src={file.published ? publishedIcon : unPublishedIcon} alt="" width={30} />
      <span>{file.name}</span>
    </div>
    </Dropdown>
  </div>
}