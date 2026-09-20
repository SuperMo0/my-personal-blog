import { BsSunFill } from 'react-icons/bs';
import { MdNightlight } from 'react-icons/md';
import { NavLink } from 'react-router';

const ROUTES: { to: string; label: string }[] = [
    { to: '/', label: '/blogs' },
    { to: '/about', label: '/about' },
    { to: '/cv', label: '/cv' },
];

export default function Header({ handleThemeChange }: { handleThemeChange: () => void }) {
    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `font-mono-ui group flex items-center gap-1.5 text-[13px] sm:text-sm transition-colors ${
            isActive ? 'text-(--accent)' : 'text-(--text-secondary) hover:text-(--text-primary)'
        }`;

    return (
        <header className="sticky top-0 z-40 w-full border-b border-(--border-subtle) bg-(--canvas)/85 backdrop-blur-md transition-colors duration-300">
            <div className="wrapper flex h-14 items-center justify-between gap-2 px-3 sm:h-16 sm:px-6 lg:px-8">
                <NavLink to="/" className="flex shrink-0 items-center gap-2.5" aria-label="Mwafak Almahaini, home" end>
                    <span className="font-display text-lg font-bold tracking-tight sm:text-xl">
                        <span className="text-(--accent)">Mwafak</span>
                        <span className="hidden text-(--text-primary) sm:inline"> Almahaini</span>
                    </span>
                </NavLink>

                <nav aria-label="Primary navigation" className="flex items-center gap-4 min-[380px]:gap-5 sm:gap-8">
                    {ROUTES.map((route) => (
                        <NavLink key={route.to} className={navLinkClass} to={route.to} end={route.to === '/'}>
                            {({ isActive }) => (
                                <>
                                    <span
                                        className={`h-1 w-1 rounded-full transition-colors ${isActive ? 'bg-(--accent)' : 'bg-transparent'}`}
                                        aria-hidden="true"
                                    />
                                    {route.label}
                                </>
                            )}
                        </NavLink>
                    ))}
                    <button
                        type="button"
                        onClick={handleThemeChange}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-lg text-(--text-secondary) transition-colors hover:text-(--accent)"
                        aria-label="Toggle theme"
                    >
                        <BsSunFill className="hidden dark:block" aria-hidden="true" />
                        <MdNightlight className="block dark:hidden" aria-hidden="true" />
                    </button>
                </nav>
            </div>
        </header>
    );
}
