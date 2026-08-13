import { useState, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import Home from './Components/pages/Home/Home';
import Article from './Components/pages/Article/Article';
import About from './Components/pages/About/About';
import CV from './Components/pages/CV/CV';
import Login from './Components/pages/Login/Login';
import DashBoard from './Components/pages/DashBoard/DashBoard';
import EditorPage from './Components/pages/EditorPage/EditorPage';
import Guest from './layouts/Guest';
import RequireGuest from './Auth/RequireGuest';
import RequireAuth from './Auth/RequireAuth';
import './App.css'

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
    <div className="app min-h-screen bg-(--bg-primary) text-(--text-primary) transition-colors duration-300">
      <Routes>

        <Route path='/' element={<Guest handleThemeChange={handleThemeChange} />}>
          <Route index element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/cv' element={<CV />} />
          <Route path='/contact' element={<Navigate to='/about#social' replace />} />
          <Route path='/blogs/:id' element={<Article />} />
        </Route>

        <Route path='/admin' element={<Guest handleThemeChange={handleThemeChange} />}>
          <Route path='login' element={<RequireGuest><Login /></RequireGuest>} />
          <Route path='dashboard' element={<RequireAuth><DashBoard /></RequireAuth>} />
          <Route path='editor/:id?' element={<RequireAuth><EditorPage dark={dark} /></RequireAuth>} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
