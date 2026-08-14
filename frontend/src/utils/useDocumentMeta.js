import { useEffect } from 'react';

export default function useDocumentMeta(title, description) {
    useEffect(() => {
        if (title) document.title = title;

        if (description) {
            const tag = document.querySelector('meta[name="description"]');
            if (tag) tag.setAttribute('content', description);
        }
    }, [title, description]);
}
