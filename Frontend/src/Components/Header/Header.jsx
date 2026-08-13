import React from 'react';
import { NavLink } from 'react-router';
import { BsSunFill } from 'react-icons/bs';
import { MdNightlight } from 'react-icons/md';

export default function Header({ handleThemeChange }) {
    const navLinkClass = ({ isActive }) => (
        `font-interface text-sm font-semibold text-(--text-primary) underline-offset-4 ${
            isActive ? 'underline decoration-2 decoration-(--accent)' : 'hover:underline hover:decoration-(--accent)'
        }`
    );

    return (
        <header className="sticky top-0 z-40 w-full border-b border-(--border-color) bg-(--bg-primary)/90 backdrop-blur-md transition-colors duration-300">
            <div className="wrapper flex h-14 items-center justify-between gap-2 px-3 sm:h-16 sm:px-6 lg:px-8">
                <NavLink to="/" className="shrink-0 text-xl font-bold tracking-tighter" aria-label="Mowafak Almahaini, home">
                    <span className="text-(--accent)">Mowafak</span>
                    <span className="hidden sm:inline"> Almahaini</span>
                </NavLink>

                <nav aria-label="Primary navigation" className="flex items-center gap-2 min-[380px]:gap-3 sm:gap-6">
                    <NavLink className={navLinkClass} to="/">Home</NavLink>
                    <NavLink className={navLinkClass} to="/about">About</NavLink>
                    <NavLink className={navLinkClass} to="/cv">CV</NavLink>
                    <button
                        type="button"
                        onClick={handleThemeChange}
                        className="flex h-8 w-8 shrink-0 items-center justify-center text-lg transition-transform hover:scale-110"
                        aria-label="Toggle theme"
                    >
                        <BsSunFill className="hidden text-yellow-400 dark:block" aria-hidden="true" />
                        <MdNightlight className="block text-slate-700 dark:hidden" aria-hidden="true" />
                    </button>
                </nav>
            </div>
        </header>
    );
}
