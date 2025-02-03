import { Outlet } from 'react-router-dom';
import NavBar from './navBar/navBar';
import Chat from './chat/chat';



export default function MainLayout() {

    return (
        <div className="flex flex-col h-screen w-screen mx-auto">
            {/* Navbar */}
            <NavBar />
            <div className="flex flex-grow bg-gray-250">
                {/* Main Content */}
                <main className="flex-grow mt-8 ">
                    <Outlet />
                </main>
            </div>

            <Chat />

        </div>
    );
}
