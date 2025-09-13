import { Outlet } from 'react-router-dom';
// import Chat from './chat/chat';
import { MainContextProvider } from './mainContext';
import { Spinner } from '@heroui/react';
import useOrganizations from './organizations/hook/useOrganizations';
import useAuth from './auth/hooks/useAuth';
import UserMenu from '@/components/ui/UserMenu';
import { useContext } from 'react';
import { MainContextValues, MainContext } from './mainContext';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/svg/Logo_Smartflo.svg"
import SearchInput from './search/searchInput';


function Header() {
    const {setParentFolders} = useContext(MainContext) as MainContextValues;
    const navigate = useNavigate();
    //throw new Error('Function not implemented.');
    return (
        <header className="flex justify-end md:justify-between items-center px-8 w-full h-[50px] top-0  shadow-md">
            <h1 className="max-md:hidden md:block font-[300] text-[40px] tracking-[0.3rem] cursor-pointer" onClick={() => {setParentFolders(''); navigate('/organizations')}}>
               { /*<span className="text-primary">S</span>MAR<span className="text-primary">T</span>FLO*/}
               <img src={logo} alt="logo" style={{width: "200px", height: "35px"}}/>
            </h1>
            <div className="search-continer ml-auto w-[300px] mr-[60px] ">
                <SearchInput />
            </div>
            {/*<span className="text-primary text-[18px] text-left min-w-[200px] overflow-x-auto whitespace-nowrap scrollbar-thumb-primary scrollbar-track-transparent scrollbar-thin">
                <span className="font-bold text-[20px]">
                    {`${localStorage.getItem("OrgName") || ""}`}
                </span>
                {`${parentFolders}`}
            </span>*/}
            <div>

            </div>
            <UserMenu />
        </header>
    );
}

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
              <Header />
                <main className="h-[calc(100%-70px)]">
                    <Outlet />
                </main>
                {/* <Chat /> */}
            </div>
        </MainContextProvider>
    );
}
