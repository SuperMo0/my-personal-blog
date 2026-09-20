import { BsGithub } from 'react-icons/bs';
import { NavLink } from 'react-router';

export default function Footer() {
    return (
        <footer className="border-t border-(--border-subtle) py-10">
            <div className="wrapper flex flex-col items-center gap-3 text-center font-mono-ui text-xs text-(--text-tertiary) sm:flex-row sm:justify-between sm:text-left">
                <span>© {new Date().getFullYear()} Mwafak Almahaini — built in the open</span>
                <div className="flex items-center gap-5">
                    <a
                        href="https://github.com/SuperMo0/my-personal-blog"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Source on GitHub"
                        className="flex items-center gap-1.5 transition-colors hover:text-(--accent)"
                    >
                        <BsGithub size={14} aria-hidden="true" /> source
                    </a>
                    <NavLink to="/admin/login" className="transition-colors hover:text-(--accent)">
                        admin
                    </NavLink>
                </div>
            </div>
        </footer>
    );
}
