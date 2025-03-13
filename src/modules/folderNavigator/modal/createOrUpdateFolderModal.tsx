import { Modal, Input, message, Select } from 'antd';
import { useEffect, useState } from 'react';
import { Folder, FolderResquest, FolderData } from '../types/folder';
import useFolderManager from '../hooks/useFolderManager';
import useOrganizations from '@/modules/organizations/hook/useOrganizations';
import './createOrUpdateFolderModal.css';
import useAuth from '@/modules/auth/hooks/useAuth';

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
    const [selectedOrganization, setSelectedOrganization] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');

    const { user } = useAuth();

    const { data: organizations } = useOrganizations(user?.id, searchTerm);

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
    }, [folder]);

    const handleCancel = () => {
        setFolder(null);
    };

    const handleOk = async () => {
        if (update) {
            if (containerID?.length === 0) {
                const folderId = folder?.id ?? '';
                const request = await updateRootFolder(containerName, folderId);
                if (request.error) {
                    if (request.message === 'uroboros') {
                        message.error('Already exists a folder with this name');
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
                    message.error('Already exists a folder with this name');
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
        const request = await createFolder(containerName, containerID, selectedOrganization);
        if (request.error) {
            if (request.message === 'uroboros') {
                message.error('Already exists a folder with this name');
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
            title={folder?.name ? 'Rename Folder' : 'Create Folder'}
            open={folder != null}
            onOk={handleOk}
            onCancel={handleCancel}
            okText={folder?.name ? 'Rename' : 'Create'}
            className="createOrUpdateFolderModal"
            okButtonProps={{ disabled: containerName.length === 0 }}
        >
            <div>
                <div>
                    <label htmlFor="">Folder Name</label>
                    <Input value={containerName} onChange={e => setcontainerName(e.target.value)} />
                    <label htmlFor="">Organization</label>
                    <Select
                        showSearch
                        onChange={setSelectedOrganization}
                        onSearch={setSearchTerm}
                        style={{ width: '100%' }}
                        placeholder="Search to Select"
                        optionFilterProp="label"
                        filterOption={false}
                        options={organizations}
                    />
                </div>
            </div>
        </Modal>
    );
}
