import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AlertMessage from '../components/ErrorMessage';

import { Card, CardBody } from '@heroui/react';
import { Button, Input } from '@/components/ui';
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
            <Card className="w-full max-w-md border-none" radius="sm">
                <CardBody className="flex flex-col gap-5 p-8">
                    <h1 className="font-bold text-2xl">Ingresa tu nueva contraseña</h1>

                    <div>
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
                            autoFocus
                        />
                    </div>
                    <div>
                        <label htmlFor="confirm-password">Confirmar contraseña</label>
                        <Input
                            id="confirm-password"
                            name="confirm-password"
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

                    {/* <input type="hidden" name="token" value={token} /> */}

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
export default ResetPassword;
