import { Dropdown, message } from 'antd';
import type { MenuProps } from 'antd';
import { ContainerElement } from "../types/componets";
import publishedIcon from '../assets/svg/publishedFile.svg'
import unPublishedIcon from '../assets/svg/unPublishedFile.svg'
import { useNavigate } from 'react-router-dom';
import { FolderNavigatorContext } from '../context/folderNavigatorContext';
import { useContext } from 'react';
import { File } from '../types/file';
import "./folderContainer.css"
import { FolderData, FolderNavigatorContextValues } from '../types/folder';
import useFilesManager from '../hooks/useFileManager';
const pageType = import.meta.env.VITE_PAGE_TYPE;


export function FileComponent({ file }: { file: ContainerElement }) {

  const { setModalDeleteFile, groupDataByContainer, setUpdateFolderRequest } = useContext(FolderNavigatorContext) as FolderNavigatorContextValues;
  const { moveFileToRoot } = useFilesManager();
  const navigate = useNavigate();
  const handleClick = (id: string) => {
    if (pageType === 'quill'){
      navigate(`/textEditor/${id}`);
      return
    }
    navigate(`/page/${id}`);
  }

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, itemId: string, itemType: number) => {
    event.dataTransfer.setData("id", itemId);
    event.dataTransfer.setData("type", itemType.toString());
  };
  const onDragEnd = () => {

  }

  const handleDelete = async () => {
    const newFile: File = {
      id: file.id,
      name: file.name,
      published: false
    }
    setModalDeleteFile(newFile);
  }

  const handleMoveToRoot = async () => {
    if (!file.id) return
    const request = await moveFileToRoot(file.id);
    if (request.error) {
      message.error(request.message)
      return
    }
    const gruppedByContainer = groupDataByContainer(request as { data: FolderData[] });
    setUpdateFolderRequest(gruppedByContainer);
  }


  const menu: MenuProps['items'] = [
    {
      key: '1',
      label: <div style={{ textAlign: 'left' }}>Delete this file</div>,
      onClick: () => handleDelete(),
    },
    {
      key: '2',
      label: <div style={{ textAlign: 'left' }}>Move this file to root</div>,
      onClick: () => handleMoveToRoot(),
    }
  ];

  return <div>
    <Dropdown menu={{ items: menu }} trigger={['contextMenu']} placement="bottomLeft">
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