import React from 'react'
import { useAuth } from './AuthContext.js';
import { Navigate } from 'react-router';

export default function RequireGuest({ children }) {
    const { session } = useAuth();
    if (session) {
        return <Navigate to={'/admin/dashboard'} state={'adawdaw'}></Navigate>
    }
    else {
        return children;
    }
}
