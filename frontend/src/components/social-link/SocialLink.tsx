import type { ReactNode } from 'react';

export default function SocialLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="surface-panel group flex items-center gap-4 p-5 transition-colors hover:border-(--accent)"
        >
            <div className="text-2xl text-(--text-secondary) transition-colors group-hover:text-(--accent)">{icon}</div>
            <span className="font-mono-ui text-base font-semibold text-(--text-primary)">{label}</span>
        </a>
    );
}
