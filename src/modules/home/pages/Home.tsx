import { Outlet } from 'react-router-dom';

import FolderNavigator from '@/modules/folderNavigator/folderNavigator';

import '../css/home.css';

export default function Home() {
    return (
        <div className="flex flex-col md:flex-row h-full p-4 gap-2">
            <nav className="basis-0 grow bg-gray-100">
                <FolderNavigator />
            </nav>

            <section className="basis-0 grow md:grow-[4] overflow-hidden">
                <Outlet />
            </section>
        </div>
    );
}
