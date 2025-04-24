import useAuth from '@/modules/auth/hooks/useAuth';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, User } from '@heroui/react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function UserMenu() {
    const location = useLocation();
    const navigate = useNavigate();

    const { user, signOut } = useAuth();

    const isHomePage = location.pathname === '/home';
    const isOrganizationsPage = location.pathname.startsWith('/organizations');

    const renderMenu = () => {
        if (isHomePage || isOrganizationsPage) {
            return (
                <DropdownMenu aria-label="User Actions" variant="flat">
                    <DropdownItem key="logout" color="danger" onPress={signOut}>
                        Log Out
                    </DropdownItem>
                </DropdownMenu>
            );
        }

        return (
            <DropdownMenu aria-label="User Actions" variant="flat">
                <DropdownItem key="organizations" onPress={() => navigate('/organizations')}>
                    Organizations
                </DropdownItem>

                <DropdownItem key="members" onPress={() => navigate('members')}>
                    Members
                </DropdownItem>

                <DropdownItem key="logout" color="danger" onPress={signOut}>
                    Log Out
                </DropdownItem>
            </DropdownMenu>
        );
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
