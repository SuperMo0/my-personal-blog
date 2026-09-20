import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from './AuthContext';

export default function RequireGuest({ children }: { children: ReactNode }) {
    const { session } = useAuth();
    if (session) {
        return <Navigate to="/admin/dashboard" state="adawdaw" />;
    }
    return children;
}
