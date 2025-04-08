import { Outlet } from 'react-router-dom';
// import Chat from './chat/chat';
import { MainContextProvider } from './mainContext';
import { Spinner } from '@nextui-org/react';
import useOrganizations from './organizations/hook/useOrganizations';
import useAuth from './auth/hooks/useAuth';

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
                <main className="grow">
                    <Outlet />
                </main>
                {/* <Chat /> */}
            </div>
        </MainContextProvider>
    );
}
