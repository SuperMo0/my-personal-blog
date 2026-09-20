import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import RequireAuth from './auth/RequireAuth';
import RequireGuest from './auth/RequireGuest';
import About from './components/pages/about/About';
import Article from './components/pages/article/Article';
import CV from './components/pages/cv/CV';
import DashBoard from './components/pages/dashboard/DashBoard';
import EditorPage from './components/pages/editor-page/EditorPage';
import Home from './components/pages/home/Home';
import Login from './components/pages/login/Login';
import Guest from './layouts/Guest';

function App() {
    const [dark, setDark] = useState(() => {
        const stored = localStorage.getItem('theme');
        if (stored) return stored === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        if (dark) {
            document.documentElement.setAttribute('data-dark', 'true');
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-dark', 'false');
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [dark]);

    function handleThemeChange() {
        setDark(!dark);
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
