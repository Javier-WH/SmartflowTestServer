import { Outlet } from 'react-router-dom';

import FolderNavigator from '@/modules/folderNavigator/folderNavigator';

import '../css/home.css';

export default function Home() {
    return (
        <div className="flex flex-col md:flex-row h-full p-4 gap-2">
            <nav className="w-full md:w-1/3 bg-gray-100 min-w-[350px]">
                <FolderNavigator />
            </nav>

            <section className="w-full md:w-2/3 overflow-hidden">
                <Outlet />
            </section>
        </div>
    );
}
