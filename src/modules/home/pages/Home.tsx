import { Outlet } from 'react-router-dom';

import FolderNavigator from '@/modules/folderNavigator/folderNavigator';

import '../css/home.css';

export default function Home() {
    return (
        <div className="flex flex-col md:flex-row h-full p-4 gap-2">
            <nav className="w-full md:w-1/4 bg-gray-100 min-w-[350px] rounded-md">
                <FolderNavigator />
            </nav>

            <section className="w-full md:w-3/4 overflow-hidden">
                <Outlet />
            </section>
        </div>
    );
}
