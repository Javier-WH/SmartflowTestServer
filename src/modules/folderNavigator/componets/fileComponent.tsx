import { Dropdown, message, Modal, Spin, Button } from 'antd';
import type { MenuProps } from 'antd';
import type { ContainerElement } from '../types/componets';
//import publishedIcon from '../assets/svg/publishedFile.svg';
//import unPublishedIcon from '../assets/svg/unPublishedFile.svg';
import { useNavigate, useParams } from 'react-router-dom';
import { FolderNavigatorContext } from '../context/folderNavigatorContext';
import { useContext, useEffect, useState } from 'react';
import type { File } from '../types/file';
import './folderContainer.css';
import type { FolderData, FolderNavigatorContextValues } from '../types/folder';
import useFilesManager from '../hooks/useFileManager';
import useFolderManager from '../hooks/useFolderManager';
const pageType = import.meta.env.VITE_PAGE_TYPE;
import { useTranslation } from 'react-i18next';
import { CiFileOn } from "react-icons/ci";
import { MainContext, type MainContextValues } from '@/modules/mainContext';


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
    const { isSaving, setIsSaving } = useContext(MainContext) as MainContextValues;
    const { moveFileToRoot, duplicateFile } = useFilesManager();
    const { getFolderContent } = useFolderManager();
    const navigate = useNavigate();
    const { organization_id } = useParams();
    const [fileName, setFileName] = useState<string>(file.name);
    const { t } = useTranslation();
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [pendingNavigationId, setPendingNavigationId] = useState<string | null>(null);
    const [forceNavigation, setForceNavigation] = useState(false);
    

    useEffect(() => {
        if (changleFileNameRequest?.fileId !== file.id) return;
        setFileName(changleFileNameRequest.fileName);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [changleFileNameRequest]);

    useEffect(() => {
        if (!file) return;
        setFileName(file.name);
    }, [file]);


    useEffect(() => {
        if (pendingNavigationId && !isSaving) {
            // El guardado terminó, realizar la navegación
            performNavigation(pendingNavigationId);
            setIsSaveModalOpen(false);
            setPendingNavigationId(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSaving, pendingNavigationId]);

    const handleClick = (id: string) => {
        if (isSaving && !forceNavigation) {
            setPendingNavigationId(id);
            setIsSaveModalOpen(true);
            return;
        }
        performNavigation(id);
    };

    const performNavigation = (id: string) => {
        setTimeout(() => {
            if (pageType === 'quill') {
                navigate(`/${organization_id}/edit/${id}`, { state: { readOnly: !memberRoll.write } });
                return;
            }
        }, 200);
        //navigate(`/page/${id}`);
    };
    const handleForceNavigation = () => {
        if (pendingNavigationId) {
            setForceNavigation(true);
            performNavigation(pendingNavigationId);
            setIsSaveModalOpen(false);
            setPendingNavigationId(null);
            setIsSaving(false);
            // Resetear el flag después de un tiempo
            setTimeout(() => setForceNavigation(false), 1000);
        }
    };

    const handleCancelNavigation = () => {
        setIsSaveModalOpen(false);
        setPendingNavigationId(null);
        setForceNavigation(false);
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

    const handleDuplicate = async () => {
        if (!memberRoll.write) {
            message.error(t('can_not_duplicate_file_message'));
            return;
        }
        if (!file.id) return;
        const request = await duplicateFile(file.id);
        if (request.error) {
            message.error(request.message);
            return;
        }

        const currentFolder = document.getElementById(request?.data);
        if (currentFolder) {
            if (currentFolder.classList.contains('opened')) {
                currentFolder.click();
                setTimeout(() => {
                    currentFolder.click();
                }, 10);
            } else {
                currentFolder.click();
            }
            return;
        }

        const folder = await getFolderContent(request?.data ?? null, organization_id);
        if (folder.error) {
            message.error(folder.message);
            return;
        }

        const gruppedByContainer = groupDataByContainer(folder as { data: FolderData[] });
        setUpdateFolderRequest(gruppedByContainer);

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
        {
            key: '3',
            label: <div style={{ textAlign: 'left' }}>{t('duplicate_file_label')}</div>,
            onClick: () => handleDuplicate(),
        },
    ];




    return (
        <div>
            <Dropdown menu={{ items: menu }} trigger={['contextMenu']} placement="bottomLeft">
         
                    <div
                        key={file.id}
                        id={file.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, }}
                        onClick={() => handleClick(file.id)}
                        className={`file p-2 rounded-lg ${selectedFileId === file.id ? 'selected-file' : ''}`}
                        draggable
                        onDragStart={event => handleDragStart(event, file.id, file.type)}
                    >
                        {/*<img src={file.published ? publishedIcon : unPublishedIcon} alt="" width={30} />*/}
                        <CiFileOn size={25} />
                        <span className="truncate max-h-[50px] w-full file-name" title={fileName}>
                            {fileName === 'untitled' ? t('untitled_file') : fileName}
                        </span>

                    </div>
                
            </Dropdown>
            {/* Modal de guardado */}
            <Modal
                title={t('saving_changes_title')}
                open={isSaveModalOpen}
                onCancel={handleCancelNavigation}
                // Aplica estilo al contenedor del Modal para minimalismo y grises
                style={{
                    backgroundColor: '#f9f9f9', // Fondo muy claro
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    padding: '0', // Ajuste para el contenido
                }}
                // Estilo para el pie de página (footer)
                footer={[
                    <Button
                        key="force"
                        // Cambiado de "primary" a "default" para un look más minimalista (outline)
                        type="default"
                        danger // Mantiene el color de advertencia, pero más sutil en el botón default
                        onClick={handleForceNavigation}
                        // disabled={isSaving}
                        style={{
                            borderRadius: '4px',
                            // Color de fondo al hacer hover/activo podría ser un gris oscuro si se desea
                        }}
                    >
                        {t('navigate_without_saving')}
                    </Button>,
                    <Button
                        key="cancel"
                        type="default" // Botón de cancelación simple
                        onClick={handleCancelNavigation}
                        style={{
                            borderRadius: '4px',
                            // Texto de color gris más oscuro para el contraste
                            color: '#333',
                        }}
                    >
                        {t('cancel_label')}
                    </Button>
                ]}
                closable={false}
                maskClosable={false}
            >
                {/* Contenido del Modal */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 0', width: '100%' }}>
                    <Spin
                        size="large"
                    />
                    <div>
                        <p style={{ margin: 0, fontWeight: '600', color: '#333' }}>
                            {t('saving_in_progress')}
                        </p>
                        <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
                            {isSaving
                                ? (t('please_wait_saving'))
                                : (t('saving_completed'))
                            }
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
