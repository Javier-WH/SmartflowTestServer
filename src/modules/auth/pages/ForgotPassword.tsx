import { type FormEvent, useState, useEffect } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { Card, CardBody } from '@heroui/react';
import { Button, Input } from '@/components/ui';

import { IconChevronLeft } from '@tabler/icons-react';

import AlertMessage from '../components/ErrorMessage';
import useAuth from '../hooks/useAuth';

const ForgotPassword = () => {
    const navigate = useNavigate();

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const { token, forgotPassword } = useAuth();

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

            if (response.error) {
                setError(response.error.message);
                return;
            }

            setSuccessMessage('Se ha enviado un correo electrónico con instrucciones para resetear tu contraseña');
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

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (token) navigate('/');
    }, [token]);

    return (
        <form
            onSubmit={handleSubmit}
            className="flex justify-center items-center h-screen p-4 bg-[linear-gradient(68.66deg,#e8e2ff_1.3%,#f7f5ff_50%)]"
        >
            <Card className="w-full max-w-md border-none" radius="sm">
                <CardBody className="flex flex-col gap-5 p-8">
                    <h1 className="font-bold text-2xl">Restablece tu contraseña</h1>
                    <span className="mt-4">
                        Enviaremos un correo electrónico con un enlace para restablecer tu contraseña
                    </span>
                    <div>
                        <label htmlFor="email">Correo electrónico</label>
                        <Input id="email" name="email" autoFocus />
                    </div>

                    {successMessage && <AlertMessage text={successMessage} type="success" />}
                    {error && <AlertMessage text={error} />}

                    <Button type="submit" isLoading={loading}>
                        Enviar
                    </Button>

                    <Link to="/auth/signin" className="text-center text-primary underline">
                        Volver al inicio de sesión
                    </Link>
                </CardBody>
            </Card>
        </form>
    );
};

export default ForgotPassword;
