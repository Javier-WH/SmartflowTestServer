import { Outlet } from 'react-router-dom';
import { Input } from 'antd';
import FolderNavigator from './folderNavigator/folderNavigator';

export default function MainLayout() {
    return (
        <div className="flex flex-col h-screen w-screen mx-auto">
            {/* Navbar */}
            <header className=" bg-gray-900 text-white w-full p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Input placeholder="Buscar" />
                    <div className="text-xl font-bold">Kepen</div>
                </div>
                <nav>
                    <ul className="flex space-x-4">
                        <li><a href="#">Inicio</a></li>
                        <li><a href="#">Acerca de</a></li>
                        <li><a href="#">Contacto</a></li>
                    </ul>
                </nav>
            </header>

            <div className="flex flex-grow">
                {/* Sidebar */}
                <aside className="w-64 bg-gray-800 text-white p-6">
                    <FolderNavigator />
                </aside>

                {/* Main Content */}
                <main className="flex-grow mt-8 ">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
