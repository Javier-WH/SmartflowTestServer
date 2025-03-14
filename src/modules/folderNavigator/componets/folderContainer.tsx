import { useEffect, useState, useContext } from 'react';
import { message, Spin } from 'antd';
import { FolderRequestItem } from '../types/folder';
import { ContainerElement } from '../types/componets';
import useFolderManager from '../hooks/useFolderManager';
import { FolderComponent } from './folderComponent';
import { FileComponent } from './fileComponent';
import { FolderNavigatorContext } from '../context/folderNavigatorContext';
import { FolderNavigatorContextValues } from '../types/folder';
import { useParams } from 'react-router-dom';

export default function FolderContainer({ folderId, setFilesCount }: { folderId: string | null, setFilesCount: (number: number) => void}) {

    const { organization_id:slug } = useParams();
    const { Loading, setLoading, updateFolderRequest } = useContext(
        FolderNavigatorContext,
    ) as FolderNavigatorContextValues;

    const { getFolderContent, getRootContent } = useFolderManager();
    const [content, setContent] = useState<ContainerElement[] | null>([]);

    // eslint-disable-next-line react-hooks/exhaustive-deps

    useEffect(() => {
        async function getContent() {
            if (!slug) return
            setLoading(folderId);
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
                    filesnumber: item.filesnumber
                };
            });
            setContent(newContent);
            setLoading('x');
        }
        getContent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [folderId]);

    async function getRoot() {
        if(!slug) return
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
                filesnumber: item.filesnumber
            };
        });
        //console.log(newItems)
        setContent(newItems ?? []);
    }

    // on move folder
    useEffect(() => {
        if(!slug) return

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
                filesnumber: item.filesnumber
            };
        });
        const totalFiles = newFolders.reduce((acumulador: number, item) => {
            if (item.type === 0) {
                return acumulador + 1;
            }
            return acumulador;
        }, 0)
        setFilesCount(totalFiles)
        setContent(newFolders);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateFolderRequest, slug]);



    if (content?.length === 0) {
        if (Loading === folderId) return <Spin />;
        return null;
    }

    return (
        <div>
            {content?.map(item => {
                return (
                    <div key={item.id} className="w-full mb-1 cursor-pointer">
                        {item.type === 1 ? (
                            <FolderComponent folder={item} containerid={folderId} />
                        ) : (
                            <FileComponent file={item} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
