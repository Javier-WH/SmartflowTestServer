import type {
    ForgotPasswordParams,
    ResetPasswordParams,
    SignInParams,
    SignUpParams,
    SignUpResponse,
} from '../types/auth';

import AuthService from '../services/auth';

import { useNavigate } from 'react-router-dom';

const useAuth = () => {
    const navigate = useNavigate();

    async function signIn({ email, password }: SignInParams) {
        const response = await AuthService.signIn({ email, password });

        return response;
    }

    async function signUp({ name, lastname, email, password }: SignUpParams): Promise<SignUpResponse> {
        const response = await AuthService.signUp({ name, lastname, email, password });

        return response;
    }

    async function forgotPassword({ email }: ForgotPasswordParams) {
        const response = await AuthService.forgotPassword({ email });

        return response;
    }

    async function resetPassword({ password }: ResetPasswordParams) {
        const response = await AuthService.resetPassword({ password });

        return response;
    }

    async function signOut() {
        const response = await AuthService.signOut();

        if (!response.error) {
            navigate('/auth/signin');
        }

        return response;
    }

    return { signIn, signUp, forgotPassword, resetPassword, signOut };
};

export default useAuth;
