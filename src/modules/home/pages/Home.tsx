import useAuth from '../../auth/hooks/useAuth';
import { Button } from '@nextui-org/react';

export default function Home() {
    const { signOut } = useAuth();
    return (
        <div className="flex gap-4">
            <span>Home</span>

            <Button type="button" variant="ghost" onClick={signOut} fullWidth={false}>
                Logout
            </Button>
        </div>
    );
}
