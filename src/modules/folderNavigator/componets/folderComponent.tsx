import { Dropdown, message } from 'antd';
import type { MenuProps } from 'antd';
import type { ContainerElement } from '../types/componets';
import FolderContainer from './folderContainer';
import { useState, useContext, useEffect } from 'react';
import openedFolder from '../assets/svg/opened_folder.svg';
import closedFolder from '../assets/svg/closed_folder.svg';
import useFolderManager from '../hooks/useFolderManager';
import useFilesManager from '../hooks/useFileManager';
import type { Folder, FolderNavigatorContextValues, FolderData } from '../types/folder';
import { FolderNavigatorContext } from '../context/folderNavigatorContext';
import { useNavigate, useParams } from 'react-router-dom';
import { MdFolder } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import './folderContainer.css';

export function FolderComponent({
    folder,
    containerid,
    depth,
}: { folder: ContainerElement; containerid: string | null; depth: number }) {
    const {
        setModalFolder,
        setModalDeleteFolder,
        setUpdateFolderRequest,
        groupDataByContainer,
        fileCountUpdateRequest,
        setFileCountUpdateRequest,
        memberRoll,
    } = useContext(FolderNavigatorContext) as FolderNavigatorContextValues;

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { moveFolder, moveFolderToRoot, getFilesCount } = useFolderManager();
    const { moveFile, createFile } = useFilesManager();
    const [contentId, setContentId] = useState<string | null>(null);
    const { organization_id: slug } = useParams();
    const [filesCount, setFilesCount] = useState<string | number>('0');

    // updates the number of files when a file is moved
    useEffect(() => {
        if (!fileCountUpdateRequest) return;
        getFilesCount(folder.id)
            .then(res => setFilesCount(res.data?.[0]?.filesnumber))
            .catch(err => console.log(err))
            .finally(() => setFileCountUpdateRequest(false));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fileCountUpdateRequest]);

    useEffect(() => {
        setFilesCount(folder?.filesnumber ?? '0');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleFolder = (id: string | null) => {
        if (!id) return;
        if (!contentId) {
            setContentId(id);
        } else {
            setContentId(null);
        }
    };

    const handleCreateOrUpdateFolder = (update = false) => {
        if (!memberRoll.write) {
            message.error(t('can_not_create_folder_message'));
            return;
        }
        const container = update ? (containerid ?? undefined) : folder.id;
        const newFolder: Folder = {
            id: folder.id,
            name: update ? folder.name : '',
            container: container ?? undefined,
        };
        setModalFolder(newFolder);
    };

    const handleDeleteFolder = () => {
        if (!memberRoll.delete) {
            message.error(t('can_not_delete_folder_message'));
            return;
        }
        const container = containerid ?? undefined;
        const newFolder: Folder = {
            id: folder.id,
            name: folder.name,
            container,
        };
        setModalDeleteFolder(newFolder);
    };

    const handleCreateFile = () => {
        if (!memberRoll.write) {
            message.error(t('can_not_create_file_message'));
            return;
        }
        if (!slug) {
            message.error(t('can_not_find_organization_message'));
            return;
        }
        createFile('untitled', folder.id, slug).then(res => {
            if (res.error) {
                message.error(t('error_creating_file_message'));
                return;
            }
            const id = res.data;
            const pageType = import.meta.env.VITE_PAGE_TYPE;

            const currentFolder = document.getElementById(folder.id);
            if (currentFolder) {
                if (currentFolder.classList.contains('opened')) {
                    currentFolder.click();
                    setTimeout(() => {
                        currentFolder.click();
                    }, 10);
                } else {
                    currentFolder.click();
                }
            }

            if (pageType === 'quill') {
                navigate(`/${slug}/edit/${id}`);
            } else {
                navigate(`/page/${id}`);
            }
        });
    };

    const handleMoveToRoot = async () => {
        if (!memberRoll.write) {
            message.error(t('can_not_move_folder_message'));
            return;
        }
        const request = await moveFolderToRoot(folder.id);
        const gruppedByContainer = groupDataByContainer(request as { data: FolderData[] });
        setUpdateFolderRequest(gruppedByContainer);
        setFileCountUpdateRequest(true);
    };

    const menu: MenuProps['items'] = [
        {
            key: '1',
            label: <div style={{ textAlign: 'left' }}>{t('move_to_root_label')}</div>,
            onClick: () => handleMoveToRoot(),
        },
        {
            key: '2',
            label: <div style={{ textAlign: 'left' }}>{t('create_new_folder_label')} </div>,
            onClick: () => handleCreateOrUpdateFolder(),
        },
        {
            key: '3',
            label: <div style={{ textAlign: 'left' }}>{t('create_new_folder_label')}</div>,
            onClick: () => handleCreateOrUpdateFolder(true),
        },
        {
            key: '4',
            label: <div style={{ textAlign: 'left' }}>{t('delete_folder_label')}</div>,
            onClick: () => handleDeleteFolder(),
        },
        {
            type: 'divider',
        },
        {
            key: '5',
            label: <div style={{ textAlign: 'left' }}>{t('create_new_file_label')}</div>,
            onClick: () => handleCreateFile(),
        },
    ];

    /// drag and drop logic
    const handleDragStart = (event: React.DragEvent<HTMLDivElement>, itemId: string, itemType: number) => {
        event.dataTransfer.setData('id', itemId);
        event.dataTransfer.setData('type', itemType.toString());
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
        const draggedItemId = event.dataTransfer.getData('id');
        const draggedItemType = Number(event.dataTransfer.getData('type'));

        if (draggedItemId === targetItemId) return;
        if (targetType === 0) return;

        setUpdateFolderRequest(null);

        const requestFunction = draggedItemType === 0 ? moveFile : moveFolder;

        if (!memberRoll.write) {
            message.error(`${t('can_not_move_folder_or_file_message')} ${draggedItemType === 0 ? 'file' : 'folder'}`);
            return;
        }

        const request = await requestFunction(draggedItemId, targetItemId);
        if (request.error) {
            if (request.message === 'uroboros') return;
            message.error(request.message);
            return;
        }

        if (request.data) {
            const gruppedByContainer = groupDataByContainer(request as { data: FolderData[] });
            setUpdateFolderRequest(gruppedByContainer);
            if (!contentId) {
                toggleFolder(folder.id ?? null);
            }
            setFileCountUpdateRequest(true);
        }
    };

    return (
        <div>
            <Dropdown menu={{ items: menu }} trigger={['contextMenu']} placement="bottomLeft">
                {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
                <div
                    id={folder.id}
                    data-depth={depth}
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                    onClick={() => toggleFolder(folder.id ?? null)}
                    className={`hover:bg-primary-50 folder ${contentId === null ? '' : 'opened'}`}
                    draggable
                    onDragStart={event => handleDragStart(event, folder.id, folder.type)}
                    onDragOver={handleDragOver}
                    onDrop={event => handleDrop(event, folder.id, folder.type)}
                    onDragLeave={handleDragLeave}
                    title={folder.name}
                >
                    <img
                        style={{ pointerEvents: 'none' }}
                        src={contentId ? openedFolder : closedFolder}
                        alt=""
                        width={30}
                    />
                    <span className="folder-name">{folder.name}</span>
                    <div className="folder-count-container">
                        <span className="folder-count">{`${filesCount} ${filesCount === '1' ? t('page_label') : t('pages_label') } `}</span>
                        <MdFolder />
                    </div>
                </div>
            </Dropdown>
            <div className="ml-5">
                {contentId && (
                    <div>
                        <FolderContainer folderId={contentId} depth={depth + 1} />
                    </div>
                )}
            </div>
        </div>
    );
}
