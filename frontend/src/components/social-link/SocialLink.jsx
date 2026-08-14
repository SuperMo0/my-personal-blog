import React from 'react';

export default function SocialLink({ href, icon, label, color }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex flex-col items-center gap-4 rounded-xl p-6 transition-all duration-300 ${color}`}
        >
            <div className="text-6xl transform transition-transform duration-300 group-hover:scale-110">
                {icon}
            </div>
            <span className="text-xl font-medium text-(--text-primary) transition-colors group-hover:text-(--accent)">
                {label}
            </span>
        </a>
    );
}
