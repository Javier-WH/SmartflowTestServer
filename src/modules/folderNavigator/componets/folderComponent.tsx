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

import './folderContainer.css';

export function FolderComponent({ folder, containerid, depth }: { folder: ContainerElement; containerid: string | null, depth: number }) {
    const {
        setModalFolder,
        setModalDeleteFolder,
        setUpdateFolderRequest,
        groupDataByContainer,
        fileCountUpdateRequest,
        setFileCountUpdateRequest,
        memberRoll,
    } = useContext(FolderNavigatorContext) as FolderNavigatorContextValues;

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
        console.log(memberRoll);
        if (!memberRoll.write) {
            message.error('You do not have permission to create or update a folder');
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
            message.error('You do not have permission to delete a folder');
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
            message.error('You do not have permission to create a page');
            return;
        }
        if (!slug) {
            message.error('Cant find organization');
            return;
        }
        createFile('untitled', folder.id, slug).then(res => {
            if (res.error) {
                message.error('Error creating page');
                return;
            }
            const id = res.data;
            const pageType = import.meta.env.VITE_PAGE_TYPE;
            if (pageType === 'quill') {
                navigate(`/${slug}/edit/${id}`);
            } else {
                navigate(`/page/${id}`);
            }
        });
    };

    //d43ab1e4-3d79-4ab4-ac90-a8f04d0cee6f

    const handleMoveToRoot = async () => {
        if (!memberRoll.write) {
            message.error('You do not have permission to move a folder');
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
            message.error(`You do not have permission to move a ${draggedItemType === 0 ? 'file' : 'folder'}`);
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
                >
                    <img
                        style={{ pointerEvents: 'none' }}
                        src={contentId ? openedFolder : closedFolder}
                        alt=""
                        width={30}
                    />
                    <span className="folder-name">{folder.name}</span>
                    <div className="folder-count-container">
                        <span className="folder-count">{`${filesCount} ${filesCount === '1' ? 'page' : 'pages'} `}</span>
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
