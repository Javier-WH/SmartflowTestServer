import { type FormEvent, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AlertMessage from '../components/ErrorMessage';
import { Input } from '@/components/ui';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import useAuth from '../hooks/useAuth';
import { Card, CardBody } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';
import logo from "../../../assets/svg/Logo_Smartflo.svg"

const SignIn = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
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
            setError(t('fill_all_fields_message'));
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
                setError(t('unexpected_error_message'));
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
        <form
            onSubmit={handleSubmit}
            className=" relative flex flex-col justify-center items-center h-screen p-4 bg-[linear-gradient(180deg,#e8e2ff_1.3%,var(--mainColorLight))]"
            style={{ backgroundColor: 'var(--mainColorLight)'}}
        >
            <img src={logo} alt="logo" style={{ marginBottom: "60px", width: "225px", height: "auto", filter: "hue-rotate(296deg)"}} />
            <Card style={{marginBottom: '60px'}} className="w-full max-w-md border-none" radius="sm">
                <CardBody className="flex flex-col gap-5 p-8">
                    <h1 style={{marginBottom: '10px'}} className="text-2xl font-bold">{t('login_title')}</h1>
                 
                    <div className="space-y-1">
                        <label htmlFor="email">{t('email_label')}</label>
                        <Input id="email" name="email" autoFocus />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="password">{t('password_label')}</label>
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
                   
                    <div style={{display: 'flex', width:'100%', justifyContent: "center", marginTop: "20px", marginBottom: "10px"}}>
                    <Button type='submit' text={t('login_button')} loading={loading}/>

                    </div>
               
                    <Link to="/forgot-password" className="text-center underline" style={{ color: 'var(--mainColor)', marginBottom: '10px' }}>
                        {t('forgot_password_message')}
                    </Link>
     

                    {/*<div className="text-center">
                        <span>
                            {t('dont_have_account_message')}{' '}
                            <Link
                                to={`/auth/signup?${redirect ? `redirect=${redirect}` : ''}`}
                                className="text-center underline"
                                style={{ color: 'var(--mainColor)' }}
                            >
                                {t('sign_up_button')}
                            </Link>
                        </span>
                    </div>*/}
                </CardBody>
            </Card>

            <div className="text-center" style={{ marginTop: '20px' }}>
                <span style={{ display: 'flex', flexDirection: 'column' }}>
                    {t('contact_singup_message')}{' '}
                    <Link
                        to={`/auth/signup?${redirect ? `redirect=${redirect}` : ''}`}
                        className="text-center underline"
                        style={{ color: 'var(--mainColor)' }}
                    >
                        info@smartflo.pro
                    </Link>
                </span>
            </div>
        </form>
    );
};

export default SignIn;
//info@smartflo.pro