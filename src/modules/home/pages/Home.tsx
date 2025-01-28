import useAuth from '@/modules/auth/hooks/useAuth';
import { Button } from '@nextui-org/react';

export default function Home() {
    const { signOut } = useAuth();

    return (
        <div className="flex justify-center items-center gap-4 h-full">
            <span>Home</span>
            <Button onClick={signOut}>Logout</Button>
        </div>
    );
}
