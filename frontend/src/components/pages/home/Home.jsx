import React from 'react';
import Hero from '../../hero/Hero';
import HomeArticles from '../../home-articles-grid/HomeArticles';
import useDocumentMeta from '../../../utils/useDocumentMeta';

export default function Home() {
    useDocumentMeta(
        'Mwafak Almahaini — Software Engineer',
        'Mwafak Almahaini is a full-stack software engineer in Cairo. Articles on code, algorithms, and the practice of building software.',
    );

    return (
        <>
            <Hero />
            <HomeArticles />
        </>
    );
}