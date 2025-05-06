import { Outlet } from 'react-router-dom';
// import Chat from './chat/chat';
import { MainContextProvider } from './mainContext';
import { Spinner } from '@heroui/react';
import useOrganizations from './organizations/hook/useOrganizations';
import useAuth from './auth/hooks/useAuth';
import UserMenu from '@/components/ui/UserMenu';

export default function MainLayout() {
    const { user } = useAuth();

    const { isLoading } = useOrganizations(user?.id);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner />
            </div>
        );
    }

    return (
        <MainContextProvider>
            <div className="flex flex-col h-full w-full">
                <header className="flex justify-end md:justify-between items-center px-8 w-full h-[70px] top-0 bg-gray-100 shadow-md">
                    <h1 className="max-md:hidden md:block font-[300] text-[40px] tracking-[0.3rem]">
                        <span className="text-primary">S</span>MAR<span className="text-primary">T</span>FLO
                    </h1>
                    <UserMenu />
                </header>

                <main className="h-[calc(100%-70px)]">
                    <Outlet />
                </main>
                {/* <Chat /> */}
            </div>
        </MainContextProvider>
    );
}
