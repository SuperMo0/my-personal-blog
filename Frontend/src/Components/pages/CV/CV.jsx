import React from 'react';

export default function CV() {
    return (
        <div className="wrapper max-w-5xl py-16 sm:py-20">
            <header className="mx-auto max-w-3xl text-center">
                <p className="font-interface mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-(--accent)">
                    Curriculum vitae
                </p>
                <h1 className="text-4xl font-bold sm:text-5xl">Mowafak Almahaini</h1>
                <address className="font-interface mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm not-italic text-(--text-secondary) sm:text-base">
                    <span>Cairo, Egypt · Open to relocate</span>
                    <a className="hover:text-(--accent)" href="tel:+201006864406">+20 100 686 4406</a>
                    <a className="hover:text-(--accent)" href="mailto:moofk2002@gmail.com">moofk2002@gmail.com</a>
                    <a
                        className="hover:text-(--accent)"
                        href="https://www.linkedin.com/in/mowafk-mha/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        LinkedIn
                    </a>
                    <a
                        className="hover:text-(--accent)"
                        href="https://github.com/SuperMo0"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        GitHub
                    </a>
                    <a
                        className="hover:text-(--accent)"
                        href="https://codeforces.com/profile/SuperMo"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Codeforces
                    </a>
                </address>
                <a
                    href="/Mowafak-Almahaini-CV.pdf"
                    download="Mowafak-Almahaini-CV.pdf"
                    className="font-interface mt-8 inline-block font-semibold text-(--accent) underline decoration-2 underline-offset-4 hover:text-(--accent-hover)"
                >
                    Download CV as PDF
                </a>
            </header>

            <div className="mt-12 bg-(--text-secondary)/10 p-2 sm:p-5">
                <img
                    src="/images/mowafak-almahaini-cv.webp"
                    alt="One-page CV for Mowafak Almahaini"
                    width="1400"
                    height="1979"
                    className="mx-auto h-auto w-full max-w-4xl"
                />
            </div>
        </div>
    );
}
