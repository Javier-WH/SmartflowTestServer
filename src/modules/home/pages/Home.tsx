import { Outlet, useNavigate, useParams } from 'react-router-dom';
import FolderNavigator from '@/modules/folderNavigator/folderNavigator';
import '../css/home.css';
//import SearchInput from '@/modules/search/searchInput';
import { Button } from '@/components/ui';
import Boton from '@/components/ui/Boton';
import {
    IconChevronDown,
    IconChevronLeft,
    IconChevronRight,
    IconChevronUp,
    IconFile,
    IconFilePlus,
    IconFolderPlus,
    //IconFolderCode,
    //IconSortAscendingLetters,
    //IconSortDescendingLetters,
} from '@tabler/icons-react';
import { FaSort } from "react-icons/fa";
import { cn } from '@heroui/react';
import { ReactNode, useContext, useState } from 'react';
import { MainContext, type MainContextValues } from '@/modules/mainContext';
import type { Folder } from '@/modules/folderNavigator/types/folder';
import { message } from 'antd';
import useFilesManager from '@/modules/folderNavigator/hooks/useFileManager';
import useFolderManager from '@/modules/folderNavigator/hooks/useFolderManager';
import { useTranslation } from 'react-i18next';
import SortModal from '@/modules/folderNavigator/sortModal/sortModal';


export default function Home() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [containerId, setContainerId] = useState<"root" | null>(null);
    const { setNewFolderRequest, memberRoll, setUpdateFolderRequestFromMain, selectedFolderId } = useContext(
        MainContext,
    ) as MainContextValues;
    const { createFile } = useFilesManager();
    const { getRootContent } = useFolderManager();
    const { organization_id: slug } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();





    const getLevelTitle = (level: string): ReactNode => {

        if (level.toLocaleLowerCase() === "creator") {
            return <span className="text-xsh-[25px] bg-primary/20 text-primary px-2 py-1 rounded-full tracking-tight">
                {t('creator_label')}
            </span>

        }
        else if (level.toLocaleLowerCase() === "admin") {
            return <span className="text-xs h-[25px] bg-green-500/20 text-green-500 px-2 py-1 rounded-full tracking-tight">
                {t('admin_label')}
            </span>
        }


        else if (level.toLocaleLowerCase() === "editor") {
            return <span className="text-xs h-[25px] bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full tracking-tight">
                {t('editor_label')}
            </span>
        }

        else if (level.toLocaleLowerCase() === "lector") {
            return <span className="text-xs h-[25px] bg-gray-500/20 text-gray-500 px-2 py-1 rounded-full tracking-tight">
                {t('lector_label')}
            </span>
        }
        else {
            return <div></div>
        }
    }




    const handleCreateFolder = () => {
        if (!memberRoll?.write) {
            message.error(t('can_not_create_folder_message'));
            return;
        }

        const newFolder: Folder = {
            id: selectedFolderId ?? null,
            name: '',
            container: '7a89a4e6-b484-4a5b-bf94-5277cb45ae9x',
        };
        setNewFolderRequest(newFolder);
    };

    const handleCreatePage = () => {
        if (!memberRoll?.write) {
            message.error(t('can_not_create_file_message'));
            return;
        }
        if (!slug) {
            message.error(t('can_not_find_organization_message'));
            return;
        }
        createFile('untitled', selectedFolderId ?? null, slug).then(res => {
            if (res.error) {
                message.error(t('error_creating_file_message'));
                return;
            }

            const currentFolder = document.getElementById(selectedFolderId);
            if (currentFolder) {
                if (currentFolder.classList.contains('opened')) {
                    currentFolder.click();
                    setTimeout(() => {
                        currentFolder.click();
                    }, 10);
                } else {
                    currentFolder.click();
                }
            } else {
                getRootContent(slug).then(res => {
                    if (res.error) {
                        message.error(t('error_creating_file_message'));
                        return;
                    }

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setUpdateFolderRequestFromMain(res.data as any);
                });
            }

            const id = res.data;
            if (id) {
                navigate(`/${slug}/edit/${id}`);
            }
        });
    };

    const handleToggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    /*const colapseAllFolders = () => {
        const openedRootFolder = document.querySelectorAll('.folder[data-depth="0"].opened');
        openedRootFolder.forEach(folder => (folder as HTMLElement).click());
    }*/

    return (
        <>
            <SortModal containerid={containerId} setContainerid={setContainerId} slug={slug} folderName={`${localStorage.getItem("OrgName") || "Root"}`} />
            <div className="flex flex-col md:flex-row h-full p-4 gap-2 relative overflow-auto lg:overflow-hidden">
                {/* Mobile Header Container */}
                <Button
                    isIconOnly
                    className="md:hidden flex items-center justify-between py-6 px-4 bg-gray-100 rounded-lg w-full shadow-md cursor-pointer"
                    onPress={handleToggleSidebar}
                >
                    <span className="flex gap-2 items-center font-medium text-black">
                        <IconFile className="text-primary" />
                        {t('document_explorer_title')}
                    </span>

                    {isSidebarCollapsed ? (
                        <IconChevronDown className="text-primary" />
                    ) : (
                        <IconChevronUp className="text-primary" />
                    )}
                </Button>

                <div
                    className={cn('flex flex-col gap-2 h-full relative', {
                        'max-h-0 md:max-h-none md:w-16 md:bg-gray-100 md:rounded-xl': isSidebarCollapsed,
                        'max-h-[calc(100%-180px)] md:max-h-none w-full md:w-1/4 min-w-[350px]': !isSidebarCollapsed,
                    })}
                >
                    <nav className="w-full h-full overflow-hidden">
                        {/* Content visible when sidebar is expanded */}
                        <div
                            className={`flex flex-col p-[1px] w-full h-full transition-opacity duration-200 ease-in-out ${isSidebarCollapsed ? 'hidden absolute md:opacity-100 md:visible md:relative' : 'relative'}`}
                        >
                            {/* <SearchInput /> */}
                            <div className="border-2 h-full py-1 rounded-lg flex flex-col mt-[0px] relative pt-6 custom-shadow">

                                <div className="rounded-tl-lg rounded-tr-lg text-center leading-[40px] absolute top-0 left-0 w-full h-[40px] pl-10 pr-10 truncate overflow-hidden whitespace-nowrap text-gray-500 bg-default-50 border-b-1 ">
                                    {`${localStorage.getItem("OrgName") || ""}`}
                                </div>


                                <div className="flex justify-between gap-1 px-1 mt-5 ml-2">
                                    <div className='flex gap-1'>
                                        {
                                            memberRoll?.write &&
                                            <Boton width='w-10' icon={<FaSort />} borderless title={t('sort_root_label')} onClick={() => setContainerId("root")} />
                                        }
                                    </div>

                                    {
                                        getLevelTitle(memberRoll?.level || "")
                                    }

                                    <div className='flex gap-1'>
                                        <Boton width='w-10' icon={<IconFilePlus />} borderless title={t('create_page_label')} onClick={handleCreatePage} />
                                        <Boton width='w-10' icon={<IconFolderPlus />} borderless title={t('create_folder_label')} onClick={handleCreateFolder} />
                                    </div>
                                </div>

                                <div className=" grow overflow-y-auto overflow-x-auto scrollbar-thumb-rounded-full scrollbar scrollbar-thumb-[var(--strokeColor:)] scrollbar-track-transparent scrollbar-thin">
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

                        {/* Desktop Toggle Button */}
                        <Button
                            onPress={handleToggleSidebar}
                            isIconOnly
                            color="primary"
                            className={cn(
                                'max-sm:hidden md:flex absolute -translate-y-1/2 p-1 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-all duration-200 ease-in-out text-primary',
                                {
                                    'left-1/2 -translate-x-1/2 bottom-4': isSidebarCollapsed,
                                    'left-[95%] top-1/2': !isSidebarCollapsed,
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
                </div>

                <section
                    className={`grow transition-all duration-200 ease-in-out ${isSidebarCollapsed ? 'w-full md:w-[calc(100%-4rem-0.5rem)]' : 'w-full md:w-[calc(75%-0.5rem)]'
                        } ${isSidebarCollapsed ? 'mt-0' : 'mt-2 md:mt-0'}`}
                >
                    <Outlet />
                </section>
            </div>
        </>
    );
}
