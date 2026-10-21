// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(process.cwd(), 'css/herald.css'), 'utf8');

/** The body (from its first brace) of the first `@supports <condition>` block, braces balanced. */
const supportsBlock = (condition) => {
    const start = css.indexOf(`@supports ${condition}`);
    if (start === -1) return null;

    let depth = 0;
    for (let i = css.indexOf('{', start); i < css.length; i += 1) {
        if (css[i] === '{') depth += 1;
        if (css[i] === '}') depth -= 1;
        if (depth === 0) return css.slice(css.indexOf('{', start), i + 1);
    }

    return null;
};

describe('polished theme colour fallbacks', () => {
    it('gives every oklch() token a hex fallback for browsers without oklch()', () => {
        const block = supportsBlock('not (color: oklch(0 0 0))');
        const tokens = [...new Set([...css.matchAll(/(--hd-[a-z-]+):\s*oklch\(/g)].map((match) => match[1]))];

        expect(block).not.toBeNull();
        expect(tokens.length).toBeGreaterThan(0);
        for (const token of tokens) {
            expect(block, token).toMatch(new RegExp(`${token}:\\s*#[0-9a-f]{6};`));
        }
        expect(block).not.toContain('oklch(');
    });

    it('covers both the light and the dark scheme in that fallback', () => {
        const block = supportsBlock('not (color: oklch(0 0 0))');

        expect(block).toContain('[data-herald-scheme="dark"]');
        expect(block).toContain('prefers-color-scheme: dark');
    });

    it('replaces every color-mix() use for browsers without color-mix()', () => {
        const block = supportsBlock('not (background: color-mix(in oklab, red, red))');

        expect(block).not.toBeNull();
        expect(block).toContain('--hd-ink: var(--hd-accent)');
        expect(block).not.toContain('color-mix(');
        for (const selector of ['.hd-toast__icon', '.hd-panel__icon', '.hd-panel__number', '.hd-alert__icon', '.hd-alert__field:focus-visible']) {
            expect(block, selector).toContain(selector);
        }
    });
});
