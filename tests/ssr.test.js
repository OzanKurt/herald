// @vitest-environment node
import { describe, expect, it } from 'vitest';

describe('import without DOM', () => {
    it('does not throw', async () => {
        const module = await import('../src/index.js');

        expect(Object.keys(module.default)).toEqual(['toast', 'panel', 'alert', 'configure', 'settings', 'reset']);
    });
});
