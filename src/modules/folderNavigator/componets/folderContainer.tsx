import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { Spinner } from '@heroui/react';
import { Button } from '@/components/ui';
import { IconFilePlus } from '@tabler/icons-react';
import useFilesManager from '@/modules/folderNavigator/hooks/useFileManager';
import type { FolderRequestItem } from '../types/folder';
import type { ContainerElement } from '../types/componets';
import useFolderManager from '../hooks/useFolderManager';
import { FolderComponent } from './folderComponent';
import { FileComponent } from './fileComponent';
import { FolderNavigatorContext } from '../context/folderNavigatorContext';
import type { FolderNavigatorContextValues } from '../types/folder';
import { useTranslation } from 'react-i18next';
import { MainContext, type MainContextValues } from '@/modules/mainContext';

export default function FolderContainer({ folderId, depth = 0 }: { folderId: string | null, depth?: number }) {
    const { organization_id: slug } = useParams();
    const { createFile } = useFilesManager();
    const { Loading, setLoading, updateFolderRequest, memberRoll, setUpdateFolderRequest  } = useContext(
        FolderNavigatorContext,
    ) as FolderNavigatorContextValues;
    const {sortOrder} = useContext(MainContext) as MainContextValues;
    const navigate = useNavigate();
    const { getFolderContent, getRootContent } = useFolderManager();
    const [content, setContent] = useState<ContainerElement[] | null>([]);
    const { t } = useTranslation();
    
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        async function getContent() {
            if (!slug) return;

            const response = await getFolderContent(folderId, slug);
            if (response.error) {
                message.error(response.message);
                return;
            }

            const newData = response.data ?? [];
            const newContent = newData.map((item: ContainerElement) => {
                return {
                    id: item.id ?? '',
                    type: item.type,
                    name: item.name,
                    container: null,
                    published: item.published,
                    filesnumber: item.filesnumber,
                };
            });
            const sortedItemes = sortContainerElements(newContent ?? [], sortOrder, 'type1First');
            setContent(sortedItemes);
           //setContent(newContent);
            setLoading('x');
        }
        getContent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [folderId, sortOrder]);




    async function getRoot() {
        if (!slug) return;
        const response = await getRootContent(slug);

        if (response.error) {
            message.error(response.message);
            return;
        }
        const newItems = response.data?.map((item: ContainerElement) => {
            return {
                id: item.id ?? '',
                type: item.type as 0 | 1,
                name: item.name,
                container: null,
                published: item.published,
                filesnumber: item.filesnumber,
            };
        });

        //const sortedItemes = sortContainerElements(newItems ?? [], 'asc');
        //setContent(sortedItemes ?? []);
    
        //console.log(newItems)
        setContent(newItems ?? []);
    }



    // on move folder
    useEffect(() => {
        if (!slug) return;

        //console.log({ slug, folderId, updateFolderRequest })
        if (!folderId) {
            getRoot();
            return;
        }
        if (!updateFolderRequest) return;

        const keys = Object.keys(updateFolderRequest);
        if (!keys.includes(folderId ?? '')) {
            return;
        }

        const newData = updateFolderRequest[folderId ?? ''];

        const newFolders = newData.map((item: FolderRequestItem) => {
            return {
                id: item.id ?? '',
                type: item.type as 0 | 1,
                name: item.name,
                container: null,
                published: item.published,
                filesnumber: item.filesnumber,
            };
        });

        setContent(newFolders);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateFolderRequest, slug]);

    if (Loading === folderId) {
        return (
            <div className="w-full h-full flex justify-center items-center">
                <Spinner />
            </div>
        );
    }
    
    const handleCreatePage = () => {
        if (!memberRoll?.write) {
            message.error(t('can_not_create_file_message'));
            return;
        }
        if (!slug) {
            message.error(t('can_not_find_organization_message'));
            return;
        }
        createFile('untitled', null, slug).then(res => {
            if (res.error) {
                message.error(t('error_creating_file_message'));
                return;
            }

            getRootContent(slug).then(res => {
                if (res.error) {
                    message.error(t('error_creating_file_message'));
                    return;
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setUpdateFolderRequest(res.data as any);
            });
            const id = res.data;
            if (id) {
                navigate(`/${slug}/edit/${id}`);
            }
        });
    };

    if (content?.length === 0 && folderId === null) {
        return (
            <div className="flex flex-col gap-2 justify-center items-center w-full h-full max-w-[580px] cursor-pointer" onClick={handleCreatePage}>
                <IconFilePlus className='folder-nav-icon' />
                <Button
                    variant="light"
                    className=" max-w-[580px] w-full h-auto whitespace-normal break-words"
                >
                    {t('create_your_first_document_message')}
                </Button>
            </div>
        );
    }

    return (
        <div>
            {content?.map(item => {
                return (
                    <div key={item.id} className="folder-container w-full mb-1 cursor-pointer">
                        {item.type === 1 ? (
                            <FolderComponent folder={item} containerid={folderId} depth={depth} />
                        ) : (
                            <FileComponent file={item} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}


function sortContainerElements(
    array: ContainerElement[],
    order: 'asc' | 'desc',
    typePriority?: 'type1First' | 'type0First'
): ContainerElement[] {
    // Creamos una copia del array para no modificar el original (inmutabilidad)
    const sortedArray = [...array];

    sortedArray.sort((a, b) => {
        // 1. Ordenación por 'type' (si se especifica)
        if (typePriority) {
            const typeA = a.type;
            const typeB = b.type;

            if (typePriority === 'type1First') {
                // Queremos type: 1 primero. Si A es 1 y B es 0, A va antes (-1).
                if (typeA === 1 && typeB === 0) return -1;
                // Si B es 1 y A es 0, B va antes (1).
                if (typeA === 0 && typeB === 1) return 1;
            } else if (typePriority === 'type0First') {
                // Queremos type: 0 primero. Si A es 0 y B es 1, A va antes (-1).
                if (typeA === 0 && typeB === 1) return -1;
                // Si B es 0 y A es 1, B va antes (1).
                if (typeA === 1 && typeB === 0) return 1;
            }
        }

        // 2. Ordenación alfabética por 'name' (desempate o principal si no hay typePriority)
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();

        let comparison = 0;
        if (nameA > nameB) {
            comparison = 1;
        } else if (nameA < nameB) {
            comparison = -1;
        }

        // Aplicar el orden 'asc' o 'desc' al resultado de la comparación de nombres
        return order === 'desc' ? comparison * -1 : comparison;
    });

    return sortedArray;
  }