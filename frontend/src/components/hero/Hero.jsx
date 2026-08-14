import React from 'react';

export default function Hero() {
    return (
        <section className="wrapper py-24 md:py-32 flex flex-col items-center text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                <span className="bg-clip-text text-transparent bg-linear-to-r from-(--text-primary) to-(--text-secondary)">
                    Young Developer
                </span>
                <br />
                <span className="text-(--accent)">Thoughts</span>
            </h1>
            <p className="text-xl md:text-2xl text-(--text-secondary) font-light max-w-2xl mx-auto leading-relaxed">
                Exploring code, algorithms, and the stories behind building modern software.
            </p>
        </section>
    );
}