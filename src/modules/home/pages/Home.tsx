import { Outlet, useNavigate, useParams } from 'react-router-dom';
import FolderNavigator from '@/modules/folderNavigator/folderNavigator';
import '../css/home.css';
import SearchInput from '@/modules/search/searchInput';
import { Button } from '@/components/ui';
import { IconFilePlus, IconFolderPlus } from '@tabler/icons-react';
import { useDisclosure } from '@heroui/react';
import { useContext } from 'react';
import { MainContext, MainContextValues } from '@/modules/mainContext';
import { Folder } from '@/modules/folderNavigator/types/folder';
import { message } from 'antd';
import useFilesManager from '@/modules/folderNavigator/hooks/useFileManager';
import useFolderManager from '@/modules/folderNavigator/hooks/useFolderManager';

export default function Home() {
    const {
        isOpen: isCreateFolderModalOpen,
        onOpen: openCreateFolderModal,
        onClose: closeCreateFolderModal,
    } = useDisclosure();

    const { setNewFolderRequest, memberRoll } = useContext(MainContext) as MainContextValues;
    const { createFile } = useFilesManager();
    const { getRootContent } = useFolderManager();
    const { organization_id: slug } = useParams();
    const navigate = useNavigate();

    const handleCreateFolder = () => {
        if (!memberRoll?.write) {
            message.error('You do not have permission to create a folder');
            return;
        }
        const newFolder: Folder = {
            name: '',
            container: '7a89a4e6-b484-4a5b-bf94-5277cb45ae9x',
        };
        setNewFolderRequest(newFolder);
    };


    const handleCreatePage = () => {
        if (!memberRoll?.write) {
            message.error('You do not have permission to create a page');
            return;
        }
        if (!slug) {
            message.error('Cant find organization');
            return;
        }
        createFile('untitled', null, slug).then(res => {
            if (res.error) {
                message.error('Error creating page');
                return;
            }

            getRootContent(slug).then(res => {
              
                if (res.error) {
                    message.error('Error creating page');
                    return;
                }
                console.log(res.data);
            });
            const id = res.data;
            if (id){
                navigate(`/${slug}/edit/${id}`);
            }

        });
    };

    return (
        <div className="flex flex-col md:flex-row h-full p-4 gap-2">
            <nav className="flex flex-col gap-2 w-full md:w-1/4 min-w-[350px] h-full">
                <SearchInput />

                <div className="bg-gray-100 shadow-gray-100 ring-gray-200 ring-1 shadow-md h-full py-1 rounded-md">
                    <div className="flex justify-end gap-1 px-1">
                        <Button variant="light" isIconOnly onPress={handleCreatePage}>
                            <IconFilePlus />
                        </Button>

                        <Button variant="light" isIconOnly onPress={handleCreateFolder}>
                            <IconFolderPlus />
                        </Button>
                    </div>

                    <FolderNavigator />
                </div>
            </nav>

            <section className="w-full md:w-3/4 overflow-hidden">
                <Outlet />
            </section>
        </div>
    );
}
