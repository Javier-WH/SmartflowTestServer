/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal, message } from 'antd';
import { useContext, useEffect, useRef } from 'react';
import { FolderData, FolderResquest } from '../types/folder';
import { File } from '../types/file';
import useFilesManager from '../hooks/useFileManager';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { MainContext, MainContextValues } from '@/modules/mainContext';
import './createOrUpdateFolderModal.css';
export default function DeleteFolderModal({
    file,
    setFile,
    setUpdateFolderRequest,
    groupDataByContainer,
    setFileCountUpdateRequest
}: {
    file: File | null;
    setFile: (file: File | null) => void;
    setUpdateFolderRequest: (folder: FolderResquest | null) => void;
    groupDataByContainer: (request: { data: FolderData[] }) => FolderResquest;
    setFileCountUpdateRequest: (opt: boolean) => void;
}) {
    const { setParentFolders} = useContext(MainContext) as MainContextValues;
    const { deleteFile } = useFilesManager();
    const inputRef = useRef<any | null>(null);
    const { organization_id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        setTimeout(() => {
            inputRef.current?.focus();   
        }, 100);
    }, [file]);

    const handleCancel = () => {
        setFile(null);
        inputRef.current?.focus();
    };

    const handleOk = async () => {
        if (!file?.id) return;
        const request = await deleteFile(file.id);
        if (request.error) {
            message.error(request.message);
            return;
        }
        const gruppedByContainer = groupDataByContainer(request as { data: FolderData[] });
        setUpdateFolderRequest(gruppedByContainer);
        setFileCountUpdateRequest(true);
        setFile(null);
        // Redirect to home page after deletion
        setParentFolders('');
        navigate(`/${organization_id}/home`);
    };

    return (
        <Modal
            title={`${t('delete_file_title')} ${file?.name}`}
            open={file != null}
            onOk={handleOk}
            onCancel={handleCancel}
            okText={'Delete'}
            cancelText={t('cancel_label')}
            className="createOrUpdateFolderModal"
            okButtonProps={{danger: true }}
        >
            <div>
                <div>
                    <label htmlFor="">{t('are_you_sure_you_want_to_delete_message')}</label>
                </div>
            </div>
        </Modal>
    );
}

