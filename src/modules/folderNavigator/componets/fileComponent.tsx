import { Dropdown, message } from 'antd';
import type { MenuProps } from 'antd';
import type { ContainerElement } from '../types/componets';
import publishedIcon from '../assets/svg/publishedFile.svg';
import unPublishedIcon from '../assets/svg/unPublishedFile.svg';
import { useNavigate, useParams } from 'react-router-dom';
import { FolderNavigatorContext } from '../context/folderNavigatorContext';
import { useContext, useEffect, useState } from 'react';
import type { File } from '../types/file';
import './folderContainer.css';
import type { FolderData, FolderNavigatorContextValues } from '../types/folder';
import useFilesManager from '../hooks/useFileManager';
const pageType = import.meta.env.VITE_PAGE_TYPE;
import { useTranslation } from 'react-i18next';
import { CiFileOn } from "react-icons/ci";

export function FileComponent({ file }: { file: ContainerElement }) {
    const {
        setModalDeleteFile,
        groupDataByContainer,
        setUpdateFolderRequest,
        setFileCountUpdateRequest,
        memberRoll,
        selectedFileId,
        changleFileNameRequest,
    } = useContext(FolderNavigatorContext) as FolderNavigatorContextValues;
    const { moveFileToRoot } = useFilesManager();
    const navigate = useNavigate();
    const { organization_id } = useParams();
    const [fileName, setFileName] = useState<string>(file.name);
    const { t } = useTranslation();

    useEffect(() => {
        if (changleFileNameRequest?.fileId !== file.id) return;
        setFileName(changleFileNameRequest.fileName);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [changleFileNameRequest]);

    useEffect(() => {
        if (!file) return;
        setFileName(file.name);
    }, [file]);

    const handleClick = (id: string) => {
        if (pageType === 'quill') {
            navigate(`/${organization_id}/edit/${id}`, { state: { readOnly: !memberRoll.write } });
            return;
        }
        navigate(`/page/${id}`);
    };

    const handleDragStart = (event: React.DragEvent<HTMLDivElement>, itemId: string, itemType: number) => {
        event.dataTransfer.setData('id', itemId);
        event.dataTransfer.setData('type', itemType.toString());
    };

    const handleDelete = async () => {
        if (!memberRoll.delete) {
            message.error(t('can_not_delete_file_message'));
            return;
        }
        const newFile: File = {
            id: file.id,
            name: file.name,
            published: false,
        };
        setModalDeleteFile(newFile);
    };

    const handleMoveToRoot = async () => {
        if (!memberRoll.write) {
            message.error(t('can_not_move_file_message'));
            return;
        }
        if (!file.id) return;
        const request = await moveFileToRoot(file.id);
        if (request.error) {
            message.error(request.message);
            return;
        }
        const gruppedByContainer = groupDataByContainer(request as { data: FolderData[] });
        setUpdateFolderRequest(gruppedByContainer);
        setFileCountUpdateRequest(true);
    };

    const menu: MenuProps['items'] = [
        {
            key: '1',
            label: <div style={{ textAlign: 'left' }}>{t('delete_file_label')}</div>,
            onClick: () => handleDelete(),
        },
        {
            key: '2',
            label: <div style={{ textAlign: 'left' }}>{t('move_to_root_label')}</div>,
            onClick: () => handleMoveToRoot(),
        },
    ];

    return (
        <div>
            <Dropdown menu={{ items: menu }} trigger={['contextMenu']} placement="bottomLeft">
                <div
                    key={file.id}
                    id={file.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 10,  }}
                    onClick={() => handleClick(file.id)}
                    className={`file hover:bg-primary hover:text-white p-2 rounded-lg ${selectedFileId === file.id ? 'bg-primary text-white' : ''}`}
                    draggable
                    onDragStart={event => handleDragStart(event, file.id, file.type)}
                >
                    <img src={file.published ? publishedIcon : unPublishedIcon} alt="" width={30} />
                    <span className="truncate max-h-[50px] w-full" title={fileName}>
                        {fileName === 'untitled' ? t('untitled_file') : fileName}
                    </span>
                  
                </div>
            </Dropdown>
        </div>
    );
}
