import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ArticleCard, { type Article } from './ArticleCard';

vi.mock('../../utils/Api', () => ({
    default: vi.fn().mockResolvedValue([{}, true]),
}));

const article: Article = {
    id: 1,
    title: 'How Three-Field Indexing Works',
    created_at: '2026-04-11T00:00:00Z',
    likes: 2,
};

afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.clearAllMocks();
});

function renderCard(a: Article = article) {
    return render(
        <MemoryRouter>
            <ArticleCard article={a} />
        </MemoryRouter>,
    );
}

describe('ArticleCard', () => {
    it('renders the title and the starting like count', () => {
        renderCard();

        expect(screen.getByText('How Three-Field Indexing Works')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('increments the like count on click and remembers it in localStorage', async () => {
        renderCard();

        fireEvent.click(screen.getByRole('button'));

        expect(screen.getByText('3')).toBeInTheDocument();
        await waitFor(() => expect(localStorage.getItem('like-1')).toBe('true'));
    });

    it('toggles back off when clicked a second time', async () => {
        renderCard();

        const likeButton = screen.getByRole('button');
        fireEvent.click(likeButton);
        await waitFor(() => expect(localStorage.getItem('like-1')).toBe('true'));

        fireEvent.click(likeButton);
        expect(screen.getByText('2')).toBeInTheDocument();
        await waitFor(() => expect(localStorage.getItem('like-1')).toBeNull());
    });

    it('starts already liked when localStorage already has this article', () => {
        localStorage.setItem('like-1', 'true');

        renderCard();

        fireEvent.click(screen.getByRole('button'));

        expect(screen.getByText('1')).toBeInTheDocument();
    });
});
