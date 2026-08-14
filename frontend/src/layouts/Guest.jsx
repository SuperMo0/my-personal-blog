import React from 'react';
import Header from '../components/header/Header';
import { Outlet } from 'react-router';
import Footer from '../components/footer/Footer';

export default function Guest({ handleThemeChange }) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header handleThemeChange={handleThemeChange} />
            <main className="grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}