/* eslint-disable react-hooks/exhaustive-deps */
import { type FormEvent, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AlertMessage from '../components/ErrorMessage';
import { Card, CardBody } from '@heroui/react';
import { Input } from '@/components/ui';
import { IconEyeOff, IconEye } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import Button from '@/components/ui/Button';

const SignUp = () => {
    const navigate = useNavigate();

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [redirect, setRedirect] = useState<string | null>(null);
    const { user, signUp } = useAuth();
    const { t } = useTranslation();
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const redirectParam = searchParams.get('redirect');

        if (redirectParam) {
            setRedirect(redirectParam);
            return;
        }
        setRedirect(null);
    }, []);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setError('');

        const name = e.currentTarget['user-name'].value;
        const lastname = e.currentTarget.lastname.value;
        const email = e.currentTarget.email.value;
        const password = e.currentTarget.password.value;
        const confirmPassword = e.currentTarget['confirm-password'].value;

        if (!name || !email || !password || !confirmPassword || !lastname) {
            setError(t('fill_all_fields_message'));
            return;
        }

        if (password !== confirmPassword) {
            setError(t('passwrods_do_not_match_message'));
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
                setError(t('unexpected_error_message'));
            }
        } finally {
            setLoading(false);
        }
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (user) {
            if (redirect) {
                navigate(redirect);
                return;
            }
            navigate('/');
        }
    }, [user]);

    return (
        <form
            onSubmit={handleSubmit}
            className="flex justify-center items-center h-screen p-4 bg-[linear-gradient(68.66deg,#e8e2ff_1.3%,#f7f5ff_50%)]"
        >
            <Card className="w-full max-w-md border-none" radius="sm">
                <CardBody className="flex flex-col gap-5 p-8">
                    <h1 className="font-bold text-2xl">{t('create_account_title')}</h1>

                    <div>
                        <label htmlFor="user-name">{t('name_label')}</label>
                        <Input id="user-name" name="user-name" autoFocus />
                    </div>
                    <div>
                        <label htmlFor="lastname">{t('lastname_label')}</label>
                        <Input id="lastname" name="lastname" />
                    </div>
                    <div>
                        <label htmlFor="email">{t('email_label')}</label>
                        <Input id="email" name="email" />
                    </div>
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

                    <Button
                        type="submit"
                        text={t('sign_up_button_label')}
                        loading={loading}
                        disabled={loading}
                    />

             

                    <div className="text-center">
                        <span>
                            {t('already_have_account_message')}{' '}
                            <Link to="/auth/signin" className="text-center underline" style={{ color: 'var(--mainColor)' }}>
                                {t("login_button")}
                            </Link>
                            
                        </span>
                    </div>
                </CardBody>
            </Card>
        </form>
    );
};

export default SignUp;
