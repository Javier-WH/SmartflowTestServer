import { Modal, Input, message } from 'antd';
import { useEffect, useState } from 'react';
import { FolderData, FolderResquest } from '../types/folder';
import { File } from '../types/file';
import useFilesManager from '../hooks/useFileManager';
import './createOrUpdateFolderModal.css';

export default function DeleteFolderModal({
    file,
    setFile,
    setUpdateFolderRequest,
    groupDataByContainer,
}: {
    file: File | null;
    setFile: (file: File | null) => void;
    setUpdateFolderRequest: (folder: FolderResquest | null) => void;
    groupDataByContainer: (request: { data: FolderData[] }) => FolderResquest;
}) {
    const { deleteFile } = useFilesManager();
    const [deleteText, setDeleteText] = useState('');

    useEffect(() => {
        setDeleteText('');
    }, [file]);

    const handleCancel = () => {
        setFile(null);
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
        setFile(null);
    };

    return (
        <Modal
            title={`Delete File ${file?.name}`}
            open={file != null}
            onOk={handleOk}
            onCancel={handleCancel}
            okText={'Delete'}
            className="createOrUpdateFolderModal"
            okButtonProps={{ disabled: deleteText.toLocaleLowerCase() !== 'delete', danger: true }}
        >
            <div>
                <div>
                    <label htmlFor="">Type "delete" to confirm</label>
                    <Input value={deleteText} onChange={e => setDeleteText(e.target.value)} autoFocus />
                </div>
            </div>
        </Modal>
    );
}

