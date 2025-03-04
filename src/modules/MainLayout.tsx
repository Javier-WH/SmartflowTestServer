import { Outlet } from 'react-router-dom';
import NavBar from './navBar/navBar';
import Chat from './chat/chat';
import { MainContextProvider } from './mainContext';

export default function MainLayout() {
    return (
        <MainContextProvider>
            <div className="flex flex-col h-full w-full">
                <NavBar />
                <main className="grow">
                    <Outlet />
                </main>
                <Chat />
            </div>
        </MainContextProvider>
    );
}
