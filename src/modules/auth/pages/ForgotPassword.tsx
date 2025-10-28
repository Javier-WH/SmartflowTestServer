/* eslint-disable react-hooks/exhaustive-deps */
import { type FormEvent, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardBody } from '@heroui/react';
import { Button, Input } from '@/components/ui';
import AlertMessage from '../components/ErrorMessage';
import useAuth from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const { user, forgotPassword } = useAuth();

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setError('');
        setSuccessMessage('');

        const email = e.currentTarget.email.value;

        if (!email) {
            setError(t('enter_email_message'));
            return;
        }

        try {
            setLoading(true);
            const response = await forgotPassword({ email });

            if (response.error) {
                setError(response.error.message);
                return;
            }

            setSuccessMessage(t("email_sent_message"));
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
        if (user) navigate('/');
    }, [user]);

    return (
        <form
            onSubmit={handleSubmit}
            className="flex justify-center items-center h-screen p-4 bg-[linear-gradient(68.66deg,#e8e2ff_1.3%,#f7f5ff_50%)]"
        >
            <Card className="w-full max-w-md border-none" radius="sm">
                <CardBody className="flex flex-col gap-5 p-8">
                    <h1 className="font-bold text-2xl">{t("reset_password_title")}</h1>
                    <span className="mt-4">
                       {t("reset_password_description")}
                    </span>
                    <div>
                        <label htmlFor="email">{t("email_label")}</label>
                        <Input id="email" name="email" autoFocus />
                    </div>

                    {successMessage && <AlertMessage text={successMessage} type="success" />}
                    {error && <AlertMessage text={error} />}

                    <Button type="submit" isLoading={loading}>
                        {t("send_button")}
                    </Button>

                    <Link to="/auth/signin" className="text-center text-primary underline">
                        {t("back_to_signin_button")}
                    </Link>
                </CardBody>
            </Card>
        </form>
    );
};

export default ForgotPassword;
