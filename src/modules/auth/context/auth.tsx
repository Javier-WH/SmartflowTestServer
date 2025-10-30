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

    const [user, setUserState] = useState<User | null>();

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
        const getSession = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUser(user ?? null);

            supabase.auth.startAutoRefresh();
        };

        getSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (event !== "INITIAL_SESSION") {
                setUser(session?.user ?? null);
            }
        });

        return () => subscription?.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, setUser, setToken, isAuthenticated, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
