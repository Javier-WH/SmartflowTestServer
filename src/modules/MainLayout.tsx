import Logo from '@/assets/LogoWund.png';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { useLocation } from 'react-router-dom';

export default function MainLayout() {
    const location = useLocation();

    return (
        <div className="flex flex-col w-full h-full p-12">
            <header className="flex justify-center items-center gap-12 mb-10">
                <div className="flex justify-center flex-grow">
                    <img src={Logo} alt="Logo" className="w-32 h-32" />
                </div>

                <nav className="flex flex-grow-[2] max-w-[1200px] bg-white rounded-lg px-4 justify-around mt-10 shadow-sm">
                    <Link
                        to="/home"
                        className="py-2 flex-grow text-center font-thin"
                        style={{
                            ...(location.pathname === '/home' ? { color: '#6A6A6A', fontWeight: 500 } : {}),
                        }}
                    >
                        HOME
                    </Link>
                    <Link
                        to="/ordenes"
                        className="py-2 flex-grow text-center font-thin"
                        style={{
                            ...(location.pathname === '/ordenes' ? { color: '#6A6A6A', fontWeight: 500 } : {}),
                        }}
                    >
                        ORDENES
                    </Link>
                    <Link
                        to="/inventario"
                        className="py-2 flex-grow text-center font-thin"
                        style={{
                            ...(location.pathname === '/inventario' ? { color: '#6A6A6A', fontWeight: 500 } : {}),
                        }}
                    >
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
