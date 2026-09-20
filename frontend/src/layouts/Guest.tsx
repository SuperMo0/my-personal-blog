import { Outlet, useLocation } from 'react-router';
import Footer from '../components/footer/Footer';
import Header from '../components/header/Header';
import SmoothScroll from '../components/smooth-scroll/SmoothScroll';

export default function Guest({ handleThemeChange }: { handleThemeChange: () => void }) {
    const { pathname } = useLocation();
    const isAdmin = pathname.startsWith('/admin');

    return (
        <div className="flex flex-col min-h-screen">
            {!isAdmin && <SmoothScroll />}
            <Header handleThemeChange={handleThemeChange} />
            <main className="grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
