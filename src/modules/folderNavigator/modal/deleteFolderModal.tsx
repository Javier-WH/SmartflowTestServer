/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal, Input, message } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { Folder, FolderData, FolderResquest } from '../types/folder';
import useFolderManager from '../hooks/useFolderManager';
import './createOrUpdateFolderModal.css';
import { t } from 'i18next';

export default function DeleteFolderModal({
    folder,
    setFolder,
    setUpdateFolderRequest,
    groupDataByContainer,
    setFileCountUpdateRequest
}: {
    folder: Folder | null;
    setFolder: (folder: Folder | null) => void;
    setUpdateFolderRequest: (folder: FolderResquest | null) => void;
    groupDataByContainer: (request: { data: FolderData[] }) => FolderResquest;
    setFileCountUpdateRequest: (opt: boolean) => void;
}) {
    const { deleteFolder } = useFolderManager();
    const [deleteText, setDeleteText] = useState('');
    const inputRef = useRef<any | null>(null);

    useEffect(() => {
        setDeleteText('');
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    }, [folder]);

    const handleCancel = () => {
        setFolder(null);
    };

    const handleOk = async () => {
        if (!folder?.id) return;
        const request = await deleteFolder(folder.id);
        if (request.error) {
            message.error(request.message);
            return;
        }
        const gruppedByContainer = groupDataByContainer(request as { data: FolderData[] });
        setUpdateFolderRequest(gruppedByContainer);
        setFileCountUpdateRequest(true);
        setFolder(null);
    };

    return (
        <Modal
            title={`${t('delete_folder_title')} ${folder?.name}`}
            open={folder != null}
            onOk={handleOk}
            onCancel={handleCancel}
            okText={t('delete_label')}
            cancelText={t('cancel_label')}
            className="createOrUpdateFolderModal"
            okButtonProps={{ disabled: deleteText.toLocaleLowerCase() !== 'delete', danger: true }}
        >
            <div>
                <div>
                    <label htmlFor="">{t('type_delete_to_confirm_message')}</label>
                    <Input ref={inputRef} value={deleteText} onChange={e => setDeleteText(e.target.value)} />
                </div>
            </div>
        </Modal>
    );
}

