import { Fetcher } from '../../../lib/fetcher';

import type {
    ForgotPasswordParams,
    ForgotPasswordResponse,
    ResetPasswordParams,
    ResetPasswordResponse,
    SignInParams,
    SignInResponse,
    SignUpParams,
    SignUpResponse,
} from '../types/auth';

const useAuth = () => {
    async function signIn({ email, password }: SignInParams): Promise<SignInResponse> {
        const response = await Fetcher('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        return response;
    }

    async function signUp({ name, lastname, email, password }: SignUpParams): Promise<SignUpResponse> {
        const response = await Fetcher('/users/register', {
            method: 'POST',
            body: JSON.stringify({ name, lastname, email, password }),
        });

        return response;
    }

    async function forgotPassword({ email }: ForgotPasswordParams): Promise<ForgotPasswordResponse> {
        const response = await Fetcher('/users/forgot_password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });

        return response;
    }

    async function resetPassword({ password, token }: ResetPasswordParams): Promise<ResetPasswordResponse> {
        const response = await Fetcher('/users/reset_password', {
            method: 'POST',
            body: JSON.stringify({ password, token }),
        });

        return response;
    }

    return { signIn, signUp, forgotPassword, resetPassword };
};

export default useAuth;
