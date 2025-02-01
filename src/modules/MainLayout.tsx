import { Outlet } from 'react-router-dom';
import { Input } from 'antd';
import useAuth from '@/modules/auth/hooks/useAuth';


export default function MainLayout() {
    const { signOut } = useAuth();
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
                        <li onClick={signOut} style={{ cursor: 'pointer' }}><a>Logout</a></li>
                    </ul>
                </nav>
            </header>

            <div className="flex flex-grow bg-gray-250">
                {/* Main Content */}
                <main className="flex-grow mt-8 ">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
