import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, User } from '@heroui/react';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useAuth from '@/modules/auth/hooks/useAuth';
import { MainContext, type MainContextValues } from '@/modules/mainContext';

export default function UserMenu() {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { organization_id } = useParams();
    const { setParentFolders } = useContext(MainContext) as MainContextValues;
    const isMembersPage = location.pathname.endsWith('/members');
    const { user, signOut } = useAuth();

    const isHomePage = location.pathname === '/home';
    const isOrganizationsPage = location.pathname.startsWith('/organizations');
    const isTaskManagerPage = location.pathname.startsWith('/task_manager');

    const renderMenu = () => {
        if (isHomePage || isOrganizationsPage || isTaskManagerPage) {
            return (
                <DropdownMenu aria-label="User Actions" variant="flat">
                    <DropdownItem key="logout" color="danger" onPress={signOut}>
                        {t('logout_button')}
                    </DropdownItem>
                </DropdownMenu>
            );
        }

        if (organization_id) {
            return (
                <DropdownMenu aria-label="User Actions" variant="flat">
                    <DropdownItem
                        key="organizations"
                        onPress={() => {
                            navigate('/organizations');
                            setParentFolders('');
                        }}
                    >
                        {t('organizations_label')}
                    </DropdownItem>
                    {!isMembersPage ? (
                        <DropdownItem
                            key="members"
                            onPress={() => {
                                navigate(`/${organization_id}/members`);
                                setParentFolders('');
                            }}
                        >
                            {t('Members_label')}
                        </DropdownItem>
                    ) : (
                        <DropdownItem
                            key="members"
                            onPress={() => {
                                navigate(`/${organization_id}/home`);
                                setParentFolders('');
                            }}
                        >
                            {t('Editor_label')}
                        </DropdownItem>
                    )}

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
                </DropdownMenu>
            );
        }

        return null;
    };

    return (
        <div className="flex items-center gap-4">
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
