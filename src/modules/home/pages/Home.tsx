import { Outlet } from 'react-router-dom';

import FolderNavigator from '@/modules/folderNavigator/folderNavigator';

import '../css/home.css';
import SearchInput from '@/modules/search/searchInput';
import { Button } from '@/components/ui';
import { IconFilePlus, IconFolderPlus } from '@tabler/icons-react';
import { useDisclosure } from '@heroui/react';
import CreateOrUpdateFolderModal from '@/modules/folderNavigator/modal/createOrUpdateFolderModal';

export default function Home() {
    const {
        isOpen: isCreateFolderModalOpen,
        onOpen: openCreateFolderModal,
        onClose: closeCreateFolderModal,
    } = useDisclosure();

    return (
        <div className="flex flex-col md:flex-row h-full p-4 gap-2">
            <nav className="flex flex-col gap-2 w-full md:w-1/4 min-w-[350px] h-full">
                <SearchInput />

                <div className="bg-gray-100 shadow-gray-100 ring-gray-200 ring-1 shadow-md h-full py-1 rounded-md">
                    <div className="flex justify-end gap-1 px-1">
                        <Button variant="light" isIconOnly>
                            <IconFilePlus />
                        </Button>

                        <Button variant="light" isIconOnly>
                            <IconFolderPlus />
                        </Button>
                    </div>

                    <FolderNavigator />
                </div>
            </nav>

            <section className="w-full md:w-3/4 overflow-hidden">
                <Outlet />
            </section>

            <CreateOrUpdateFolderModal />
        </div>
    );
}
