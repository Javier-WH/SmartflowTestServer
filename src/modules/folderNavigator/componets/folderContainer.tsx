import Spinner from '@/components/ui/Spinner';
import { IconFilePlus } from '@tabler/icons-react';
import { message } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui';
import useFilesManager from '@/modules/folderNavigator/hooks/useFileManager';
import { FolderNavigatorContext } from '../context/folderNavigatorContext';
import useFolderManager from '../hooks/useFolderManager';
import { sortByOrder } from '../sortModal/fucntions';
import type { ContainerElement } from '../types/componets';
import type { FolderNavigatorContextValues, FolderRequestItem } from '../types/folder';
import { FileComponent } from './fileComponent';
import { FolderComponent } from './folderComponent';

export default function FolderContainer({ folderId, depth = 0 }: { folderId: string | null; depth?: number }) {
    const { working_group_id: slug } = useParams();
    const { createFile } = useFilesManager();
    const { Loading, setLoading, updateFolderRequest, memberRoll, setUpdateFolderRequest } = useContext(
        FolderNavigatorContext,
    ) as FolderNavigatorContextValues;

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
                    order: item?.order ?? 0,
                };
            });

            setContent(newContent.sort(sortByOrder));

            setLoading('x');
        }
        getContent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [folderId]);

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
                order: item?.order ?? 0,
            };
        });

        setContent(newItems.sort(sortByOrder) ?? []);
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
        setContent(newFolders.sort(sortByOrder) ?? []);
        //setContent(newFolders);
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
            message.error(t('can_not_find_working_group_message'));
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
                <Button text={t('create_your_first_document_message')}/>
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
