import { createContext, useContext } from 'react';

export interface Session {
    role: 'admin' | 'viewer' | string;
    [key: string]: unknown;
}

export interface AuthContextValue {
    login: (token: string) => void;
    logout: () => void;
    session: Session | null;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
