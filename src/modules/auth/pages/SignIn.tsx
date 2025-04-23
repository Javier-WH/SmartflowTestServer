import { type FormEvent, useState, useEffect } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import AlertMessage from '../components/ErrorMessage';

import { Button, Input } from '@/components/ui';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import useAuth from '../hooks/useAuth';
import { Card, CardBody } from '@heroui/react';

const SignIn = () => {
    const navigate = useNavigate();

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [redirect, setRedirect] = useState<string | null>(null);

    const { token, signIn } = useAuth();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const redirectParam = searchParams.get('redirect');

        // if redirect param is valid redirect to it
        if (redirectParam && isValidJoinPath(redirectParam)) {
            setRedirect(redirectParam);
            return;
        }
    }, []);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setError('');

        const email = e.currentTarget.email.value;
        const password = e.currentTarget.password.value;

        if (!email || !password) {
            setError('Por favor, rellene todos los campos');
            return;
        }

        try {
            setLoading(true);
            const response = await signIn({ email, password });

            if (response.error) {
                setError(response.error.message);
                return;
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

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (token) {
            // get url params
            const searchParams = new URLSearchParams(location.search);
            const redirectParam = searchParams.get('redirect');

            // if redirect param is valid redirect to it
            if (redirectParam && isValidJoinPath(redirectParam)) {
                navigate(redirectParam);
                return;
            }
            navigate('/');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const isValidJoinPath = (path: string) => {
        const uuidv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const segments = path.split('/');

        // Check basic structure: "/join/uuid"
        if (segments.length !== 3 || segments[1] !== 'join') return false;

        //Check if it's a valid UUID
        const uuid = segments[2];
        return uuidv4Regex.test(uuid);
    };

    return (
        <form onSubmit={handleSubmit} className="flex justify-center items-center h-screen p-4">
            <Card className="w-full max-w-md border-none" radius="sm">
                <CardBody className="flex flex-col gap-5 p-8">
                    <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
                    <p className="text-zinc-500">Ingrese los datos de su cuenta de Smartflo</p>
                    <div className="space-y-1">
                        <label htmlFor="email">Email</label>
                        <Input id="email" name="email" autoFocus />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="password">Contraseña</label>
                        <Input
                            id="password"
                            name="password"
                            endContent={
                                <button
                                    className="focus:outline-none"
                                    type="button"
                                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                >
                                    {isPasswordVisible ? (
                                        <IconEye className="text-2xl text-default-400 pointer-events-none" />
                                    ) : (
                                        <IconEyeOff className="text-2xl text-default-400 pointer-events-none" />
                                    )}
                                </button>
                            }
                            type={isPasswordVisible ? 'text' : 'password'}
                        />
                    </div>

                    {error && <AlertMessage text={error} />}

                    <Button type="submit" isLoading={loading}>
                        Iniciar Sesion
                    </Button>

                    <Link to="/forgot-password" className="text-center text-primary underline">
                        ¿Olvidaste tu contraseña?
                    </Link>

                    <div className="text-center">
                        <span>
                            ¿No tienes una cuenta?{' '}
                            <Link
                                to={`/auth/signup?${redirect ? `redirect=${redirect}` : ''}`}
                                className="text-center text-primary underline"
                            >
                                Regístrate
                            </Link>
                        </span>
                    </div>
                </CardBody>
            </Card>
        </form>
    );
};

export default SignIn;
