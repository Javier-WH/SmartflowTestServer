import { Spinner } from '@heroui/react';
import { useContext } from 'react';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import UserMenu from '@/components/ui/UserMenu';
import logo from '../assets/svg/Logo_Smartflo.svg';
import useAuth from './auth/hooks/useAuth';
import { MainContext, MainContextProvider, type MainContextValues } from './mainContext';
import SearchInput from './search/searchInput';
import useWorkingGroup from './working_group/hook/useWorkingGroup';

function Header() {
    const { setParentFolders } = useContext(MainContext) as MainContextValues;
    const parms = useParams();
    const location = useLocation();
    const isMembersPage = location.pathname.endsWith('/members');

    return (
        <header className="flex justify-end md:justify-between items-center px-8 w-full h-[50px] top-0  shadow-md">
            <Link to="/working_group" onClick={() => setParentFolders('')}>
                <h1 className="max-md:hidden md:block font-[300] text-[40px] tracking-[0.3rem] cursor-pointer">
                    {/*<span className="text-primary">S</span>MAR<span className="text-primary">T</span>FLO*/}
                    <img src={logo} alt="logo" style={{ width: '200px', height: '35px' }} />
                </h1>
            </Link>

            <div className="flex items-center justify-self-end gap-4 grow">
                <nav className="[&_a]:text-blue-600 [&_a]:hover:underline">
                    <li className="list-none inline-block mx-4">
                        <Link to="task_manager">Task Manager</Link>
                    </li>
                </nav>

                {parms?.working_group_id && !isMembersPage && (
                    <div className="search-continer ml-auto w-[300px]">
                        <SearchInput />
                        <nav></nav>
                    </div>
                )}
            </div>

            <div className="flex-shrink-0">
                <UserMenu />
            </div>
        </header>
    );
}

export default function MainLayout() {
    const { user } = useAuth();

    const { isLoading } = useWorkingGroup(user?.id);

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
                <Header />
                <main className="h-[calc(100%-70px)]">
                    <Outlet />
                </main>
                {/* <Chat /> */}
            </div>
        </MainContextProvider>
    );
}
