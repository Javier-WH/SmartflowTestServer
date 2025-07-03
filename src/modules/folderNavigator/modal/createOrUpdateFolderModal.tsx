/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal, Input, message } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Folder, FolderResquest, FolderData } from '../types/folder';
import useFolderManager from '../hooks/useFolderManager';
import { useTranslation } from 'react-i18next';
import './createOrUpdateFolderModal.css';

export default function CreateOrUpdateFolderModal({
    folder,
    setFolder,
    setUpdateFolderRequest,
    groupDataByContainer,
}: {
    folder: Folder | null;
    setFolder: (folder: Folder | null) => void;
    setUpdateFolderRequest: (folder: FolderResquest | null) => void;
    groupDataByContainer: (request: { data: FolderData[] }) => FolderResquest;
}) {
    const { createFolder, updateFolder, updateRootFolder } = useFolderManager();
    const [containerName, setcontainerName] = useState('');
    const [containerID, setcontainerID] = useState<string | null>(null);
    const [update, setUpdate] = useState(false);
    const inputRef = useRef<any | null>(null);
    const { organization_id: slug} = useParams();
    const { t } = useTranslation();

    useEffect(() => {
        if (folder) {
            if (folder.container) setcontainerID(folder.id || null);
            if (folder.name) {
                setcontainerName(folder.name);
                setUpdate(true);
            } else {
                setcontainerName('');
                setUpdate(false);
            }
        } else {
            setUpdate(false);
            setcontainerName('');
            setcontainerID('');
        }

        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    }, [folder]);

    const handleCancel = () => {
        setFolder(null);
    };

    const handleOk = async () => {
        if (!slug){
            message.error(t('no_organizations_found_message'));
            return
        }

        if (update) {
            if (containerID?.length === 0) {
                const folderId = folder?.id ?? '';
                const request = await updateRootFolder(containerName, folderId);
                if (request.error) {
                    if (request.message === 'uroboros') {
                        message.error(t('already_exists_folder_message'));
                        return;
                    }
                    message.error(request.message);
                    return;
                }
                const gruppedByContainer = groupDataByContainer(request as { data: FolderData[] });
                setUpdateFolderRequest(gruppedByContainer);
                setFolder(null);
                return;
            }
            const request = await updateFolder(containerName, containerID);
            if (request.error) {
                if (request.message === 'uroboros') {
                    message.error(t('already_exists_folder_message'));
                    return;
                }
                message.error(request.message);
                return;
            }
            const gruppedByContainer = groupDataByContainer(request as { data: FolderData[] });
            setUpdateFolderRequest(gruppedByContainer);
            setFolder(null);
            return;
        }

        const request = await createFolder(containerName, containerID, slug ?? '');
        if (request.error) {
            if (request.message === 'uroboros') {
                message.error(t('already_exists_folder_message'));
                return;
            }
            message.error(request.message);
            return;
        }
        const gruppedByContainer = groupDataByContainer(request as { data: FolderData[] });
        setUpdateFolderRequest(gruppedByContainer);
        setFolder(null);
    };

    return (
        <Modal
            title={folder?.name ? t('rename_folder_label') : t('create_folder_label')}
            open={folder != null}
            onOk={handleOk}
            onCancel={handleCancel}
            okText={folder?.name ? t('rename_label') : t('create_label')}
            className="createOrUpdateFolderModal"
            okButtonProps={{ disabled: containerName.length === 0 }}
        >
            <div>
                <div>
                    <label htmlFor="">{t('name_label')}</label>
                    <Input ref={inputRef} value={containerName} onChange={e => setcontainerName(e.target.value)} />
                </div>
            </div>
        </Modal>
    );
}
