import { Outlet } from 'react-router-dom';
import NavBar from './navBar/navBar';
import Chat from './chat/chat';
import { MainContextProvider } from './mainContext';



export default function MainLayout() {

    return (
        <MainContextProvider>
            <div className="flex flex-col h-screen" style={{ overflowX: "hidden" }}>
                <div style={{ position: "sticky", top: 0, zIndex: 999 }}>
                    <NavBar />
                </div>
                <div className="flex flex-grow bg-gray-250">
                    <main style={{ position: "relative" }}>
                        <Outlet />
                    </main>
                </div>
                <Chat />
            </div>
        </MainContextProvider>
    );
}
