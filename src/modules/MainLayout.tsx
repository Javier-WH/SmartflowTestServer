import Logo from '@/assets/LogoWund.png';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { useLocation } from 'react-router-dom';

export default function MainLayout() {
    const location = useLocation();

    return (
        <div className="flex flex-col w-full h-full px-12 pb-8 pt-4 max-w-[1800px] mx-auto">
            <header className="flex justify-center items-center gap-12">
                <div className="flex justify-center flex-grow">
                    <img src={Logo} alt="Logo" className="w-16 h-16" />
                </div>

                <nav
                    id="main-menu-nav"
                    className="flex flex-grow-[3] max-w-[1200px] bg-white rounded-lg px-4 justify-around shadow-sm text-xs"
                >
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
