import useDocumentMeta from '../../../utils/useDocumentMeta';
import HomeArticles from '../../home-articles-grid/HomeArticles';

export default function Home() {
    useDocumentMeta(
        'Mwafak Almahaini — Software Engineer',
        'Articles on code, algorithms, and the practice of building software, from Mwafak Almahaini.',
    );

    return (
        <div className="wrapper max-w-5xl pb-24 pt-16 sm:pt-20">
            <header className="max-w-2xl">
                <h1 className="font-display text-4xl font-bold sm:text-5xl">Writing</h1>
                <p className="mt-4 text-lg leading-relaxed text-(--text-secondary)">
                    Notes on code, algorithms, and the practice of building software.
                </p>
            </header>

            <div className="mt-14">
                <HomeArticles />
            </div>
        </div>
    );
}
