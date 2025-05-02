import { Outlet, useNavigate, useParams } from 'react-router-dom';
import FolderNavigator from '@/modules/folderNavigator/folderNavigator';
import '../css/home.css';
import SearchInput from '@/modules/search/searchInput';
import { Button } from '@/components/ui';
import { IconChevronLeft, IconChevronRight, IconFilePlus, IconFolderPlus } from '@tabler/icons-react';
import { cn } from '@heroui/react';
import { useContext, useState } from 'react';
import { MainContext, type MainContextValues } from '@/modules/mainContext';
import type { Folder } from '@/modules/folderNavigator/types/folder';
import { message } from 'antd';
import useFilesManager from '@/modules/folderNavigator/hooks/useFileManager';
import useFolderManager from '@/modules/folderNavigator/hooks/useFolderManager';

export default function Home() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const { setNewFolderRequest, memberRoll, setUpdateFolderRequestFromMain } = useContext(
        MainContext,
    ) as MainContextValues;
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

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setUpdateFolderRequestFromMain(res.data as any);
            });
            const id = res.data;
            if (id) {
                navigate(`/${slug}/edit/${id}`);
            }
        });
    };

    const handleToggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className="flex flex-col md:flex-row h-full p-4 gap-2 relative overflow-auto">
            <nav
                className={`flex flex-col gap-2 h-full transition-all duration-200 ease-in-out relative ${
                    isSidebarCollapsed
                        ? 'w-0 md:w-16 opacity-0 md:opacity-100 overflow-hidden bg-gray-100 rounded-xl'
                        : 'w-full md:w-1/4 min-w-[350px] opacity-100'
                }`}
            >
                <div
                    className={`flex flex-col h-full ${isSidebarCollapsed ? 'opacity-0 invisible absolute' : 'opacity-100 visible relative'}`}
                >
                    <SearchInput />

                    <div className="bg-gray-100 shadow-gray-100 ring-gray-200 ring-1 shadow-md h-full py-1 rounded-md flex flex-col mt-2">
                        <div className="flex justify-end gap-1 px-1">
                            <Button variant="light" isIconOnly onPress={handleCreatePage}>
                                <IconFilePlus />
                            </Button>
                            <Button variant="light" isIconOnly onPress={handleCreateFolder}>
                                <IconFolderPlus />
                            </Button>
                        </div>
                        <div className="flex-grow overflow-auto">
                            <FolderNavigator />
                        </div>
                    </div>
                </div>

                <div
                    className={`flex flex-col items-center gap-2 pt-4 mt-6 ${isSidebarCollapsed ? 'opacity-100 visible' : 'opacity-0 invisible absolute'}`}
                >
                    <Button variant="light" isIconOnly onPress={handleCreatePage}>
                        <IconFilePlus />
                    </Button>
                    <Button variant="light" isIconOnly onPress={handleCreateFolder}>
                        <IconFolderPlus />
                    </Button>
                </div>

                <Button
                    onPress={handleToggleSidebar}
                    isIconOnly
                    color="primary"
                    className={cn(
                        'absolute -translate-y-1/2 z-20 p-1 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-all duration-200 ease-in-out left-2 text-primary',
                        {
                            'md:left-1/2 md:-translate-x-1/2 md:bottom-4': isSidebarCollapsed,
                            'md:left-[95%] top-1/2': !isSidebarCollapsed,
                        },
                    )}
                >
                    {isSidebarCollapsed ? (
                        <IconChevronRight key="sidebar-collapsed" size={16} />
                    ) : (
                        <IconChevronLeft key="sidebar-expanded" size={16} />
                    )}
                </Button>
            </nav>

            <section
                className={`flex-grow overflow-hidden transition-all duration-200 ease-in-out ${
                    isSidebarCollapsed ? 'w-full md:w-[calc(100%-4rem-0.5rem)]' : 'w-full md:w-[calc(75%-0.5rem)]' // Adjust width based on sidebar state and gap
                }`}
            >
                <Outlet />
            </section>
        </div>
    );
}
