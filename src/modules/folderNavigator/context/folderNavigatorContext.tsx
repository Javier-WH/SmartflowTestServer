import { createContext, type ReactNode, useState, useContext, useEffect } from 'react';
import type { FolderNavigatorContextValues } from '../types/folder';
import CreateOrUpdateFolderModal from '../modal/createOrUpdateFolderModal';
import DeleteFolderModal from '../modal/deleteFolderModal';
import DeleteFileModal from '../modal/deleteFileModal';
import type { Folder, FolderResquest } from '../types/folder';
import type { File } from '../types/file';
import { MainContext, type MainContextValues } from '@/modules/mainContext';
import groupDataByContainer from './utils/groupDataByContainer';

export const FolderNavigatorContext = createContext<FolderNavigatorContextValues | null>(null);

export const FolderNavigatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { newFolderRequest, setNewFolderRequest, updateFolderRequestFromMain, memberRoll, selectedFileId, setSelectedFileId, changleFileNameRequest, setChangleFileNameRequest } = useContext(MainContext) as MainContextValues;
    const [Loading, setLoading] = useState<string | null>(null);
    const [modalFolder, setModalFolder] = useState<Folder | null>(null);
    const [modalDeleteFolder, setModalDeleteFolder] = useState<Folder | null>(null);
    const [updateFolderRequest, setUpdateFolderRequest] = useState<FolderResquest | null>(null);
    const [modalDeleteFile, setModalDeleteFile] = useState<File | null>(null);
    const [fileCountUpdateRequest, setFileCountUpdateRequest] = useState<boolean>(false);

    useEffect(() => {
        setUpdateFolderRequest(updateFolderRequestFromMain);
    }, [updateFolderRequestFromMain]);

    useEffect(() => {
        setModalFolder(newFolderRequest);
    }, [newFolderRequest]);

    useEffect(() => {
        if (modalFolder === null) {
            setNewFolderRequest(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalFolder]);

    const values: FolderNavigatorContextValues = {
        Loading,
        setLoading,
        modalFolder,
        setModalFolder,
        modalDeleteFolder,
        setModalDeleteFolder,
        updateFolderRequest,
        setUpdateFolderRequest,
        groupDataByContainer,
        modalDeleteFile,
        setModalDeleteFile,
        fileCountUpdateRequest,
        setFileCountUpdateRequest,
        memberRoll,
        selectedFileId, 
        setSelectedFileId,
        changleFileNameRequest, 
        setChangleFileNameRequest
    };

    return (
        <div className="h-full">
            <FolderNavigatorContext.Provider value={values}>
                <CreateOrUpdateFolderModal
                    folder={modalFolder}
                    setFolder={setModalFolder}
                    setUpdateFolderRequest={setUpdateFolderRequest}
                    groupDataByContainer={groupDataByContainer}
                />
                <DeleteFolderModal
                    folder={modalDeleteFolder}
                    setFolder={setModalDeleteFolder}
                    setUpdateFolderRequest={setUpdateFolderRequest}
                    groupDataByContainer={groupDataByContainer}
                    setFileCountUpdateRequest={setFileCountUpdateRequest}
                />
                <DeleteFileModal
                    file={modalDeleteFile}
                    setFile={setModalDeleteFile}
                    setUpdateFolderRequest={setUpdateFolderRequest}
                    groupDataByContainer={groupDataByContainer}
                    setFileCountUpdateRequest={setFileCountUpdateRequest}
                />
                {children}
            </FolderNavigatorContext.Provider>
        </div>
    );
};
