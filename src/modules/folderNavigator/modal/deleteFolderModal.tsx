/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal, message } from 'antd';
import { useEffect, useRef, useContext } from 'react';
import { Folder, FolderData, FolderResquest } from '../types/folder';
import useFolderManager from '../hooks/useFolderManager';
import { useNavigate, useParams } from 'react-router-dom';
import { MainContext, MainContextValues } from '@/modules/mainContext';
import './createOrUpdateFolderModal.css';
import { t } from 'i18next';
import Boton from '@/components/ui/Boton';

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
    const { setParentFolders } = useContext(MainContext) as MainContextValues;
    const { deleteFolder } = useFolderManager();
    const { organization_id } = useParams();
    const navigate = useNavigate();

    const inputRef = useRef<any | null>(null);

    useEffect(() => {
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
        console.log(gruppedByContainer);
        setUpdateFolderRequest(gruppedByContainer);
        setFileCountUpdateRequest(true);
        setFolder(null);
        // Redirect to home page after deletion
        setParentFolders('');
        navigate(`/${organization_id}/home`);
    };

    return (
        <Modal
            title={`${t('delete_folder_title')} ${folder?.name}`}
            open={folder != null}
            onOk={handleOk}
            onCancel={handleCancel}
            className="createOrUpdateFolderModal"
            footer={[<div key="buttons" className="flex justify-end gap-2">
                <Boton neutral text={t('cancel_label')} onClick={handleCancel} />
                <Boton danger text={t('delete_label')} onClick={handleOk} />
            </div>
            ]}
        >
            <div>
                <div>
                    <label htmlFor="">{t('are_you_sure_you_want_to_delete_message')}</label>
                </div>
            </div>
        </Modal >
    );
}

