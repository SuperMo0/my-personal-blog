import React from 'react';
import useDocumentMeta from '../../../utils/useDocumentMeta';

export default function CV() {
    useDocumentMeta(
        'CV — Mwafak Almahaini',
        'CV of Mwafak Almahaini, full-stack software engineer in Cairo, Egypt.',
    );

    return (
        <div className="wrapper max-w-5xl py-16 sm:py-20">
            <header className="mx-auto max-w-3xl text-center">
                <h1 className="text-4xl font-bold sm:text-5xl">Mwafak Almahaini</h1>
                <address className="font-interface mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm not-italic text-(--text-secondary) sm:text-base">
                    <span>Cairo, Egypt · Open to relocate</span>
                    <a className="transition-colors hover:text-(--accent)" href="tel:+201006864406">+20 100 686 4406</a>
                    <a className="transition-colors hover:text-(--accent)" href="mailto:moofk2002@gmail.com">moofk2002@gmail.com</a>
                    <a
                        className="transition-colors hover:text-(--accent)"
                        href="https://www.linkedin.com/in/mowafk-mha/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        LinkedIn
                    </a>
                    <a
                        className="transition-colors hover:text-(--accent)"
                        href="https://github.com/SuperMo0"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        GitHub
                    </a>
                    <a
                        className="transition-colors hover:text-(--accent)"
                        href="https://codeforces.com/profile/SuperMo"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Codeforces
                    </a>
                </address>
                <a
                    href="/Mwafak-Almahaini-CV.pdf"
                    download="Mwafak-Almahaini-CV.pdf"
                    className="font-interface mt-8 inline-block font-semibold text-(--accent) transition-colors hover:text-(--accent-hover)"
                >
                    Download CV as PDF
                </a>
            </header>

            <div className="mt-12 bg-(--text-secondary)/10 p-2 sm:p-5">
                <img
                    src="/images/mwafak-almahaini-cv.webp"
                    alt="One-page CV for Mwafak Almahaini"
                    width="1400"
                    height="1979"
                    className="mx-auto h-auto w-full max-w-4xl"
                />
            </div>
        </div>
    );
}
