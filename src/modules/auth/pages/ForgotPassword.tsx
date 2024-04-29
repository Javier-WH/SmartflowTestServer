import { type FormEvent, useState } from 'react';

import { Link } from 'react-router-dom';

import { Button, Input } from '@nextui-org/react';

import { IconChevronLeft } from '@tabler/icons-react';

import AlertMessage from '../components/ErrorMessage';
import useAuth from '../hooks/useAuth';

const ForgotPassword = () => {
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const { forgotPassword } = useAuth();

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setError('');
        setSuccessMessage('');

        const email = e.currentTarget.email.value;

        if (!email) {
            setError('Por favor, ingrese su correo electrónico');
            return;
        }

        try {
            setLoading(true);
            const response = await forgotPassword({ email });

            if (response) {
                setSuccessMessage('Se ha enviado un correo electrónico con instrucciones para resetear tu contraseña');
            }
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
        <form onSubmit={handleSubmit} className="flex justify-center items-center h-screen p-4">
            <div className="flex flex-col gap-5 border-1 border-gray-200 rounded-lg p-5 w-full max-w-md">
                <Link to="/auth/signin" className="text-center max-w-max p-2">
                    <IconChevronLeft />
                </Link>
                <h1 className="text-center text-xl">Restablece tu contraseña</h1>
                <span className="mt-4 text-center">
                    Enviaremos un correo electrónico con un enlace para restablecer tu contraseña
                </span>
                <Input name="email" label="Email" variant="underlined" autoFocus />

                {successMessage && <AlertMessage text={successMessage} type="success" />}
                {error && <AlertMessage text={error} />}

                <Button type="submit" variant="ghost" isLoading={loading}>
                    Enviar
                </Button>
            </div>
        </form>
    );
};

export default ForgotPassword;
