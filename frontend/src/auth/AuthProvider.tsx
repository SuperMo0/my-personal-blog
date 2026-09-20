import { type ReactNode, useState } from 'react';
import { AuthContext, type Session } from './AuthContext';

function parseSessionToken(token: string | null): Session | null {
    if (!token) return null;

    try {
        const encodedPayload = token.split('.')[1];
        if (!encodedPayload) return null;

        const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
        const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
        const bytes = Uint8Array.from(atob(paddedBase64), (character) => character.charCodeAt(0));
        return JSON.parse(new TextDecoder().decode(bytes));
    } catch {
        return null;
    }
}

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const session = parseSessionToken(token);

    function login(nextToken: string) {
        localStorage.setItem('token', nextToken);
        setToken(nextToken);
    }

    function logout() {
        localStorage.removeItem('token');
        setToken(null);
    }

    return <AuthContext value={{ login, logout, session }}>{children}</AuthContext>;
}
