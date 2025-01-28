import type { ForgotPasswordParams, ResetPasswordParams, SignInParams, SignUpParams } from '../types/auth';

import supabase from '../../../lib/supabase';

class AuthService {
    async signIn({ email, password }: SignInParams) {
        const response = await supabase.auth.signInWithPassword({ email, password });

        // const response = await Fetcher('/auth/login', {
        //     method: 'POST',
        //     body: JSON.stringify({ email, password }),
        // });

        return response;
    }
    async signUp({ name, lastname, email, password }: SignUpParams) {
        const response = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    lastname,
                },
            },
        });
        // const response = await Fetcher('/users/register', {
        //     method: 'POST',
        //     body: JSON.stringify({ name, lastname, email, password }),
        // });

        return response;
    }
    async forgotPassword({ email }: ForgotPasswordParams) {
        const response = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        // const response = await Fetcher('/users/forgot_password', {
        //     method: 'POST',
        //     body: JSON.stringify({ email }),
        // });

        return response;
    }
    async resetPassword({ password }: ResetPasswordParams) {
        const response = await supabase.auth.updateUser({ password });
        // const response = await Fetcher('/users/reset_password', {
        //     method: 'POST',
        //     body: JSON.stringify({ password }),
        // });

        return response;
    }

    async signOut() {
        const response = await supabase.auth.signOut();

        return response;
    }
}

export default new AuthService();
