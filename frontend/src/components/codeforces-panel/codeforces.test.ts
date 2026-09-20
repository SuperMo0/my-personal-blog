import { describe, expect, it } from 'vitest';
import { colorForRank } from './codeforces';

describe('colorForRank', () => {
    it('maps a known rank to its Codeforces color, case-insensitively', () => {
        expect(colorForRank('specialist')).toBe('#2dd4bf');
        expect(colorForRank('Specialist')).toBe('#2dd4bf');
        expect(colorForRank('GRANDMASTER')).toBe('#f85149');
    });

    it('falls back to the secondary text color for an unknown or missing rank', () => {
        expect(colorForRank('made-up-rank')).toBe('var(--text-secondary)');
        expect(colorForRank(undefined)).toBe('var(--text-secondary)');
    });
});
