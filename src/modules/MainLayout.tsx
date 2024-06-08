import Logo from '@/assets/LogoWund.png';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function MainLayout() {
    return (
        <div className="flex flex-col w-full h-full p-12 bg-gray-200">
            <header className="flex justify-between items-center gap-12">
                <img src={Logo} alt="Logo" className="w-32 h-32" />

                <nav className="flex flex-grow bg-gray-300 rounded-full px-4 justify-around mt-10 shadow-lg">
                    <Link to="/home" className="py-2 flex-grow text-center">
                        HOME
                    </Link>
                    <Link to="/ordenes" className="py-2 flex-grow text-center">
                        ORDENES
                    </Link>
                    <Link to="/inventario" className="py-2 flex-grow text-center">
                        INVENTARIO
                    </Link>
                </nav>
            </header>
            <main className="flex-grow mt-8 h-full">
                <Outlet />
            </main>
        </div>
    );
}
