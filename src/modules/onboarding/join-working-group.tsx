import { Button, Input } from '@heroui/react';
import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../auth/hooks/useAuth';
import useWorkingGroup from '../working_group/hook/useWorkingGroup';

export default function JoinWorkingGroup() {
    const navigate = useNavigate();
    const { createWorkingGroup } = useWorkingGroup();
    const { signOut, user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setError('');

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const name = data.name as string;

        if (!name || !user) {
            setError('Please fill in all required fields.');
            return;
        }

        try {
            setLoading(true);
            const response = await createWorkingGroup(name, '', '', user.id);

            if (response.error) {
                setError(response.message);
                return;
            }

            navigate('/home');
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error?.message);
            } else {
                setError('Ocurrió un error inesperado');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full h-full flex justify-center items-center">
            <header className="flex justify-end px-8 bg-white w-full py-4 fixed top-0">
                <Button color="primary" onClick={signOut}>
                    Cerrar sesión
                </Button>
            </header>
            <div className="flex flex-col w-full max-w-md border-2 p-5 rounded-lg">
                <h1 className="text-xl text-center">Crea tu grupo de trabajo</h1>
                <form className="flex flex-col items-center gap-4 mt-4" onSubmit={handleSubmit}>
                    <Input name="name" label="Nombre del grupo de trabajo" fullWidth autoFocus />
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    <Button type="submit" color="primary" isLoading={loading}>
                        Crear grupo de trabajo
                    </Button>
                </form>
            </div>
        </div>
    );
}
