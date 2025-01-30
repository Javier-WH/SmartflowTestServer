import { useEffect, createContext, useState } from 'react';
import isAuthenticated from '../utils/isAuthenticated';
import type { User } from '../types/auth';
import supabase from '@/lib/supabase';

export interface AuthContextType {
    user: User | null | undefined;
    token: string | null | undefined;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    isAuthenticated: () => Promise<boolean>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    setUser: () => {},
    token: null,
    setToken: () => {},
    isAuthenticated: () => Promise.resolve(false),
    logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }): React.ReactElement => {
    const [token, setTokenState] = useState<string | null>();

    const [user, setUserState] = useState<User | null>(null);

    const setToken = (token: string | null | undefined): void => {
        if (token !== undefined) {
            if (token === null) {
                localStorage.removeItem('token');
            } else {
                localStorage.setItem('token', token);
            }
            setTokenState(token ?? null);
        }
    };

    const setUser = (user: User | null | undefined): void => {
        if (user !== undefined) {
            if (user === null) {
                localStorage.removeItem('user');
            } else {
                localStorage.setItem('user', JSON.stringify(user));
            }
            setUserState(user ?? null);
        }
    };

    const logout = (): void => {
        setToken(null);
        setUser(null);
    };

    // useLayoutEffect(() => {
    //     const token = localStorage.getItem('token');
    //     const user = localStorage.getItem('user');
    //
    //     if (token != null && user != null) {
    //         try {
    //             setToken(token);
    //             setUser(JSON.parse(user));
    //         } catch (error) {
    //             console.error('Error parsing user', error);
    //         }
    //     }
    // }, []);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
                setUser(data.session.user);
                setToken(data.session.access_token);
            } else {
                setUser(null);
                setToken(null);
            }
        });

        supabase.auth.onAuthStateChange((event, session) => {
            //console.log('[LS] -> src/modules/auth/context/auth.tsx:83 -> event: ', event);
            switch (event) {
                case 'INITIAL_SESSION':
                case 'SIGNED_OUT':
                case 'SIGNED_IN':
                case 'USER_UPDATED':
                case 'TOKEN_REFRESHED':
                    if (session) {
                        setUser(session.user);
                        setToken(session.access_token);
                    } else {
                        setUser(null);
                        setToken(null);
                    }
                    break;
            }
        });
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, setUser, setToken, isAuthenticated, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
