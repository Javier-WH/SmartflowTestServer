import useAuth from '@/modules/auth/hooks/useAuth';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, User } from '@heroui/react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { MainContext, type MainContextValues } from '@/modules/mainContext';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
//import MultipleInviteUserModal from '../MultipleInviteUserModal';

export default function UserMenu() {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { organization_id } = useParams();
    const { setParentFolders } = useContext(MainContext) as MainContextValues;
    const isMembersPage = location.pathname.endsWith('/members');
    const { user, signOut } = useAuth();
    //const [openInviteModal, setOpenInviteModal] =  useState(false);

    //const isHomePage = location.pathname === '/home';
    //const isOrganizationsPage = location.pathname.startsWith('/organizations');

    const renderMenu = () => {
        const menuItems = [];

        /*if (isHomePage || isOrganizationsPage) {
          
        }*/

        if (organization_id) {
            menuItems.push(
                <DropdownItem key="organizations" onPress={() => { navigate('/organizations'); setParentFolders(''); }}>
                    {t('organizations_label')}
                </DropdownItem>,
                <DropdownItem
                    key="members"
                    onPress={() => {
                        const target = isMembersPage ? `/${organization_id}/home` : `/${organization_id}/members`;
                        navigate(target);
                        setParentFolders('');
                    }}
                >
                    {isMembersPage ? t('Editor_label') : t('Members_label')}
                </DropdownItem>
            );
        }

        // Logout is always shown if user is authenticated
        if (user) {
            menuItems.push(

                <DropdownItem key="custom-divider" className="pointer-events-none p-0">
                    <div className="h-px bg-default-200 my-2 w-full" />
                </DropdownItem>,

                <DropdownItem
                    key="logout"
                    color="danger"
                    onPress={() => {
                        setParentFolders('');
                        signOut();
                    }}
                >
                    {t('logout_button')}
                </DropdownItem>
            );
        }

        return (
            <DropdownMenu aria-label="User Actions" variant="flat">
                {menuItems}
            </DropdownMenu>
        );
    };


    return (
        <div className="flex items-center gap-4">
            {/*<MultipleInviteUserModal isOpen={openInviteModal} onClose={() => setOpenInviteModal(false)} userId={user?.id || ''} />*/}
            <Dropdown placement="bottom-start">
                <DropdownTrigger>
                    <User
                        as="button"
                        className="users__avatar flex items-center transition-transform hover:bg-primary/10 py-1 px-2 mr-"
                        name={`${user?.user_metadata?.name} ${user?.user_metadata?.lastname}`}
                        avatarProps={{
                            size: 'sm',
                        }}
                        classNames={{
                            name: 'capitalize text-md ml-[10px]',
                        }}
                    />
                </DropdownTrigger>
                {renderMenu()}
            </Dropdown>
        </div>
    );
}