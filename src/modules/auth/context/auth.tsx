import { createContext, useState, useLayoutEffect } from 'react';
import isAuthenticated from '../utils/isAuthenticated';
import type { User } from '../types/auth';

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
    const [token, setTokenState] = useState<string | null>(null);
    //TODO: Type the user

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
    // TODO: Type the user
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

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useLayoutEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token != null && user != null) {
            try {
                setToken(token);
                setUser(JSON.parse(user));
            } catch (error) {
                console.error('Error parsing user', error);
            }
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, setUser, setToken, isAuthenticated, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
