import type { ForgotPasswordParams, ResetPasswordParams, SignInParams, SignUpParams } from '../types/auth';

import AuthService from '../services/auth';

import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/auth';

const useAuth = () => {
    const { user, token, logout, setUser, setToken } = useContext(AuthContext);

    const navigate = useNavigate();

    async function signIn({ email, password }: SignInParams) {
        const response = await AuthService.signIn({ email, password });

        if (!response.error) {
            setUser(response.data.user);
            setToken(response.data.session.access_token);
        }

        return response;
    }

    async function signUp({ name, lastname, email, password }: SignUpParams) {
        const response = await AuthService.signUp({ name, lastname, email, password });

        if (!response.error && response.data.user && response.data.session) {
            setUser(response.data.user);
            setToken(response.data.session.access_token);
        }

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
        logout();
        const response = await AuthService.signOut();

        if (!response.error) {
            navigate('/auth/signin');
        }

        return response;
    }

    return { user, token, signIn, signUp, forgotPassword, resetPassword, signOut };
};

export default useAuth;
