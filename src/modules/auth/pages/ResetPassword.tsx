import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AlertMessage from '../components/ErrorMessage';
import { Card, CardBody } from '@heroui/react';
import { Button, Input } from '@/components/ui';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import useAuth from '../hooks/useAuth';
import { t } from 'i18next';

const ResetPassword = () => {
    const navigate = useNavigate();

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { resetPassword, signOut } = useAuth();


    // esto se asegura de eliminar la session temporal si el usuario cierra la pestaña o intenta aprovechar la session temporal para navegar por la app
    useEffect(() => {
        const handleBeforeUnload = () => {
            signOut();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        const password = e.currentTarget.password.value;
        const confirmPassword = e.currentTarget['confirm-password'].value;

        if (!password || !confirmPassword) {
            setError(t('please_fill_all_fields_message'));
            return;
        }

        if (password !== confirmPassword) {
            setError(t('passwrods_do_not_match_message'));
            return;
        }

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
                setError(t('unexpected_error_message'));
            }
        } finally {
            setLoading(false);
        }
    }


    return (
        <form
            onSubmit={handleSubmit}
            className="flex justify-center items-center h-screen p-4 bg-[linear-gradient(68.66deg,#e8e2ff_1.3%,#f7f5ff_50%)]"
        >
            <Card className="w-full max-w-md border-none" radius="sm">
                <CardBody className="flex flex-col gap-5 p-8">
                    <h1 className="font-bold text-2xl">{t("password_change_title")}</h1>

                    <div>
                        <label htmlFor="password">{t("password_label")}</label>
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
                        <label htmlFor="confirm-password">{t("confirm_password_label")}</label>
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

                    {error && <AlertMessage text={error} />}

                    <Button type="submit" isLoading={loading}>
                        {t("send_button")}
                    </Button>

                    <Link to="/auth/signin" className="text-center text-primary underline">
                        {t("go_back_button")}
                    </Link>
                </CardBody>
            </Card>
        </form>
    );
};
export default ResetPassword;
