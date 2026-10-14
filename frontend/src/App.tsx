import { lazy, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import RequireAuth from './auth/RequireAuth';
import RequireGuest from './auth/RequireGuest';
import About from './components/pages/about/About';
import Home from './components/pages/home/Home';
import Guest from './layouts/Guest';

// Split out the pages that pull in heavy dependencies (Prism, DOMPurify, the TinyMCE editor)
// so the landing pages don't download and parse them.
const Article = lazy(() => import('./components/pages/article/Article'));
const CV = lazy(() => import('./components/pages/cv/CV'));
const DashBoard = lazy(() => import('./components/pages/dashboard/DashBoard'));
const EditorPage = lazy(() => import('./components/pages/editor-page/EditorPage'));
const Login = lazy(() => import('./components/pages/login/Login'));

function getStoredTheme(): 'dark' | 'light' | null {
    const stored = localStorage.getItem('theme');
    return stored === 'dark' || stored === 'light' ? stored : null;
}

function App() {
    const [dark, setDark] = useState(() => {
        const stored = getStoredTheme();
        if (stored) return stored === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-dark', dark ? 'true' : 'false');
        document.documentElement.classList.toggle('dark', dark);
    }, [dark]);

    // Follow the OS theme live, but only while the visitor hasn't picked one themselves.
    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        function handleSystemChange(event: MediaQueryListEvent) {
            if (!getStoredTheme()) setDark(event.matches);
        }
        media.addEventListener('change', handleSystemChange);
        return () => media.removeEventListener('change', handleSystemChange);
    }, []);

    function handleThemeChange() {
        setDark((prev) => {
            const next = !prev;
            localStorage.setItem('theme', next ? 'dark' : 'light');
            return next;
        });
    }

    return (
        <div className="flex min-h-screen flex-col bg-(--canvas) text-(--text-primary) transition-colors duration-300">
            <Routes>
                <Route path="/" element={<Guest handleThemeChange={handleThemeChange} />}>
                    <Route index element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/cv" element={<CV />} />
                    <Route path="/contact" element={<Navigate to="/about#social" replace />} />
                    <Route path="/blogs/:id" element={<Article />} />
                </Route>

                <Route path="/admin" element={<Guest handleThemeChange={handleThemeChange} />}>
                    <Route
                        path="login"
                        element={
                            <RequireGuest>
                                <Login />
                            </RequireGuest>
                        }
                    />
                    <Route
                        path="dashboard"
                        element={
                            <RequireAuth>
                                <DashBoard />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="editor/:id?"
                        element={
                            <RequireAuth>
                                <EditorPage dark={dark} />
                            </RequireAuth>
                        }
                    />
                </Route>
            </Routes>
        </div>
    );
}

export default App;
