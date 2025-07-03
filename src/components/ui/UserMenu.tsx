import useAuth from '@/modules/auth/hooks/useAuth';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, User } from '@heroui/react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function UserMenu() {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { organization_id } = useParams();
    console.log('[LS] -> src/components/ui/UserMenu.tsx:8 -> organization_id: ', organization_id);

    const { user, signOut } = useAuth();

    const isHomePage = location.pathname === '/home';
    const isOrganizationsPage = location.pathname.startsWith('/organizations');

    const renderMenu = () => {
        if (isHomePage || isOrganizationsPage) {
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
                    <DropdownItem key="organizations" onPress={() => navigate('/organizations')}>
                        {t('organizations_label')}
                    </DropdownItem>

                    <DropdownItem key="members" onPress={() => navigate(`/${organization_id}/members`)}>
                        {t('Members_label')}
                    </DropdownItem>

                    <DropdownItem key="logout" color="danger" onPress={signOut}>
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
                        avatarProps={{ color: 'primary' }}
                        className="transition-transform hover:bg-primary/10 py-1 px-2"
                        description={user?.email}
                        name={`${user?.user_metadata?.name} ${user?.user_metadata?.lastname}`}
                        classNames={{ name: 'capitalize' }}
                    />
                </DropdownTrigger>
                {renderMenu()}
            </Dropdown>
        </div>
    );
}
