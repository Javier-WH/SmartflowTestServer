import { Outlet } from 'react-router-dom';

export default function MainLayout() {
    return (
        <div className="flex flex-col w-full h-full px-12 pb-8 pt-4 max-w-[1800px] mx-auto">
            <main className="flex-grow mt-8 h-full">
                <Outlet />
            </main>
        </div>
    );
}
