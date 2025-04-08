import FolderNavigator from '@/modules/folderNavigator/folderNavigator';
import NavBar from '@/modules/navBar/navBar';

import '../css/home.css';

export default function Home() {
    return (
        <div className="flex flex-col h-full w-full">
            <header>
                <NavBar />
            </header>
            <div className="grow p-6">
                <FolderNavigator />
            </div>
        </div>
    );
}
