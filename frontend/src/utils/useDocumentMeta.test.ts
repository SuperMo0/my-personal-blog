import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import useDocumentMeta from './useDocumentMeta';

function setMetaDescription(content: string) {
    const tag = document.createElement('meta');
    tag.setAttribute('name', 'description');
    tag.setAttribute('content', content);
    document.head.appendChild(tag);
    return tag;
}

afterEach(() => {
    document.head.innerHTML = '';
    document.title = '';
});

describe('useDocumentMeta', () => {
    it('sets the document title and meta description', () => {
        setMetaDescription('placeholder');

        renderHook(() => useDocumentMeta('Article — Mwafak Almahaini', 'A real description.'));

        expect(document.title).toBe('Article — Mwafak Almahaini');
        expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('A real description.');
    });

    it('leaves the title and description untouched when not given values', () => {
        document.title = 'Untouched title';
        const meta = setMetaDescription('Untouched description');

        renderHook(() => useDocumentMeta());

        expect(document.title).toBe('Untouched title');
        expect(meta.getAttribute('content')).toBe('Untouched description');
    });
});
