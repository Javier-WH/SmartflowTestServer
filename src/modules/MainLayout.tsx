import { Outlet } from 'react-router-dom';
import NavBar from './navBar/navBar';
import Chat from './chat/chat';
import { MainContextProvider } from './mainContext';



export default function MainLayout() {

    return (
        <MainContextProvider>
            <div className="flex flex-col h-screen w-screen mx-auto">
                <NavBar />
                <div className="flex flex-grow bg-gray-250">
                    <main className=" ">
                        <Outlet />
                    </main>
                </div>
                <Chat />
            </div>
        </MainContextProvider>
    );
}
