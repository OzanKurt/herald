import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Herald from '../src/index.js';
import { alertBox, reset } from './helpers.js';

describe('configure', () => {
    beforeEach(reset);
    afterEach(() => vi.useRealTimers());

    const roots = () => [...document.querySelectorAll('.hd-root')];

    it('uses the default theme and automatic colour scheme', () => {
        Herald.toast({ title: 'A' });
        Herald.panel({ title: 'B' });
        Herald.alert({ title: 'C' });

        expect(roots()).toHaveLength(3);
        roots().forEach((root) => {
            expect(root.dataset.heraldTheme).toBe('default');
            expect(root.dataset.heraldScheme).toBe('auto');
        });
    });

    it('switches theme and scheme on existing and new roots', () => {
        Herald.toast({ title: 'A' });
        Herald.configure({ theme: 'polished', scheme: 'dark' });
        Herald.alert({ title: 'B' });

        roots().forEach((root) => {
            expect(root.dataset.heraldTheme).toBe('polished');
            expect(root.dataset.heraldScheme).toBe('dark');
        });
        expect(alertBox().closest('.hd-root').dataset.heraldTheme).toBe('polished');
    });

    it('rejects unknown themes and schemes', () => {
        expect(() => Herald.configure({ theme: 'neon' })).toThrow(/theme/);
        expect(() => Herald.configure({ scheme: 'sepia' })).toThrow(/scheme/);
    });

    it('reports the current settings', () => {
        Herald.configure({ theme: 'polished' });

        expect(Herald.settings()).toEqual({ theme: 'polished', scheme: 'auto' });
    });
});
