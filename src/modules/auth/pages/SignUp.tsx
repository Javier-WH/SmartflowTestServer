import { type FormEvent, useState, useEffect } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import AlertMessage from '../components/ErrorMessage';

import { Button, Input } from '@nextui-org/react';
import { IconEyeOff, IconEye } from '@tabler/icons-react';

import useAuth from '../hooks/useAuth';

const SignUp = () => {
    const navigate = useNavigate();

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { token, signUp } = useAuth();

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setError('');

        const name = e.currentTarget['user-name'].value;
        const lastname = e.currentTarget.lastname.value;
        const email = e.currentTarget.email.value;
        const password = e.currentTarget.password.value;
        const confirmPassword = e.currentTarget['confirm-password'].value;

        if (!name || !email || !password || !confirmPassword || !lastname) {
            setError('Por favor, rellene todos los campos');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        try {
            setLoading(true);
            const { error } = await signUp({ name, lastname, email, password });

            if (error) setError(error.message);
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
            navigate('/');
        }
    }, [token]);

    return (
        <form onSubmit={handleSubmit} className="flex justify-center items-center h-screen p-4">
            <div className="flex flex-col gap-5 border-1 border-gray-200 rounded-lg p-5 w-full max-w-md">
                <h1 className="text-center text-xl">Regístrate</h1>

                <Input name="user-name" label="Nombre" variant="underlined" autoFocus />
                <Input name="lastname" label="Apellido" variant="underlined" />
                <Input name="email" label="Email" variant="underlined" />
                <Input
                    name="password"
                    label="Contraseña"
                    variant="underlined"
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
                <Input
                    name="confirm-password"
                    label="Confirmar contraseña"
                    variant="underlined"
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

                {error && <AlertMessage text={error} />}

                <Button type="submit" variant="ghost" isLoading={loading}>
                    Registrarse
                </Button>

                <div className="text-center">
                    <span>
                        ¿Ya tienes una cuenta?{' '}
                        <Link to="/auth/signin" className="text-center underline">
                            Inicia sesión
                        </Link>
                    </span>
                </div>
            </div>
        </form>
    );
};

export default SignUp;
