import React from 'react';

export default function Notification({ message }) {
    return (
        <div className="fixed bottom-8 right-4 md:right-8 z-50 animate-bounce-in">
            <div className="bg-[var(--accent)] text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p className="font-medium">{message}</p>
            </div>
        </div>
    );
}