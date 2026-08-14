import React from 'react'
import { useAuth } from './AuthContext.js'
import { Navigate } from 'react-router';

export default function RequireAuth({ children }) {
    const { session } = useAuth();
    if (!session) {
        return <Navigate to={'/admin/login'}></Navigate>
    }
    else {
        return children;
    }
}
