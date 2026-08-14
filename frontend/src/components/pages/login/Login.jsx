import React, { useState } from 'react';
import { useAuth } from '../../../auth/AuthContext.js';
import api from './../../../utils/Api.js';
import { useNavigate } from 'react-router';

export default function Login() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(null);
    const [loadingAction, setLoadingAction] = useState(null);
    const navigate = useNavigate();

    async function signIn(path, body, action) {
        setLoadingAction(action);
        setMessage(null);

        try {
            const [response, ok] = await api(path, {
                method: 'post',
                body: body ? JSON.stringify(body) : undefined,
            });

            if (!ok) {
                setMessage(response.message || 'Login failed');
                return;
            }

            login(response.token);
            navigate('/admin/dashboard');
        } catch {
            setMessage('Network error occurred');
        } finally {
            setLoadingAction(null);
        }
    }

    function handleOwnerLogin(event) {
        event.preventDefault();
        signIn('/admin/login', { email, password }, 'owner');
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-(--bg-card) p-10 rounded-2xl shadow-xl border border-(--border-color)">
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-extrabold tracking-tight">Welcome</h2>
                    <p className="mt-2 text-sm text-(--text-secondary)">
                        Explore the dashboard safely, or sign in as the owner.
                    </p>
                </div>

                {message && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center border border-red-200">
                        {message}
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => signIn('/admin/demo-login', null, 'demo')}
                    disabled={loadingAction !== null}
                    className="w-full btn-primary flex justify-center items-center gap-2 disabled:opacity-60"
                >
                    {loadingAction === 'demo' ? 'Entering demo…' : 'Enter the demo'}
                </button>

                <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-(--text-secondary)">
                    <span className="h-px grow bg-(--border-color)" />
                    Owner sign-in
                    <span className="h-px grow bg-(--border-color)" />
                </div>

                <form onSubmit={handleOwnerLogin} className="space-y-4">
                    <label className="block">
                        <span className="text-sm font-medium">Email</span>
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            autoComplete="username"
                            required
                            className="mt-1 w-full rounded-lg border border-(--border-color) bg-(--bg-primary) px-3 py-2"
                        />
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium">Password</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete="current-password"
                            required
                            className="mt-1 w-full rounded-lg border border-(--border-color) bg-(--bg-primary) px-3 py-2"
                        />
                    </label>
                    <button
                        type="submit"
                        disabled={loadingAction !== null}
                        className="w-full rounded-lg border border-(--border-color) px-4 py-2.5 font-semibold hover:border-(--accent) disabled:opacity-60"
                    >
                        {loadingAction === 'owner' ? 'Signing in…' : 'Sign in as owner'}
                    </button>
                </form>
            </div>
        </div>
    );
}
