import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AlertMessage from '../components/ErrorMessage';

import { Button, Input } from '@nextui-org/react';
import { IconEye, IconEyeOff } from '@tabler/icons-react';

import useAuth from '../hooks/useAuth';

const ResetPassword = () => {
    const navigate = useNavigate();

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { resetPassword } = useAuth();

    // const token = new URLSearchParams(location.search).get('token');

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setError('');

        const password = e.currentTarget.password.value;
        const confirmPassword = e.currentTarget['confirm-password'].value;

        if (!password || !confirmPassword) {
            setError('Por favor, rellene todos los campos');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        // if (!token) {
        //     setError('Token inválido o expirado');
        //     return;
        // }

        try {
            setLoading(true);
            const response = await resetPassword({ password });

            if (response.error) {
                setError(response.error.message);
                return;
            }

            navigate('/');
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

    // if (!token) {
    //     return (
    //         <div className="flex justify-center items-center h-screen p-4">
    //             <div className="flex flex-col gap-5 border-1 border-gray-200 rounded-lg p-5 w-full max-w-md">
    //                 <h1 className="text-center text-xl">
    //                     Este enlace de restablecimiento de contraseña expiró o no es válido
    //                 </h1>
    //
    //                 <Link to="/forgot-password" className="text-center underline">
    //                     Solicitar un nuevo enlace
    //                 </Link>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <form onSubmit={handleSubmit} className="flex justify-center items-center h-screen p-4">
            <div className="flex flex-col gap-5 border-1 border-gray-200 rounded-lg p-5 w-full max-w-md">
                <h1 className="text-center text-xl">Ingresa tu nueva contraseña</h1>

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

                {/* <input type="hidden" name="token" value={token} /> */}

                {error && <AlertMessage text={error} />}

                <Button type="submit" variant="ghost" isLoading={loading}>
                    Enviar
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
export default ResetPassword;
