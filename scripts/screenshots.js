/**
 * The README's images, captured from examples/showcase.html.
 *
 * Run with `npm run screenshots`. Starts the examples server through Vite's
 * Node API, opens each scene with Playwright and writes PNGs into docs/images/.
 * One fixed viewport, deviceScaleFactor 2, reduced motion and animations
 * disabled, and every wait is a condition, so re-runs give the same pixels.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import { createServer } from 'vite';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'docs/images');
const VIEWPORT = { width: 1280, height: 800 };

// Notifications live in the right-hand side of the screen; alerts use all of it.
const RIGHT = { x: 600, y: 0, width: 680, height: 800 };

const SHOTS = [
    ...['default', 'polished'].flatMap((theme) => {
        const schemes = theme === 'default' ? ['light'] : ['light', 'dark'];

        return schemes.flatMap((scheme) => {
            const name = theme === 'default' ? 'default' : `polished-${scheme}`;

            return [
                { file: `${name}-notifications.png`, query: `theme=${theme}&scheme=${scheme}&scene=notifications`, clip: RIGHT, scheme },
                { file: `${name}-alert.png`, query: `theme=${theme}&scheme=${scheme}&scene=alert`, scheme },
            ];
        });
    }),
    { file: 'polished-light-prompt.png', query: 'theme=polished&scheme=light&scene=prompt', scheme: 'light' },
];

const server = await createServer({ configFile: resolve(root, 'vite.examples.config.js'), logLevel: 'warn' });
await server.listen();
const base = server.resolvedUrls.local[0].replace(/\/$/, '');

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2, reducedMotion: 'reduce' });
const page = await context.newPage();

mkdirSync(outDir, { recursive: true });

try {
    for (const shot of SHOTS) {
        await page.emulateMedia({ colorScheme: shot.scheme, reducedMotion: 'reduce' });
        await page.goto(`${base}/showcase.html?${shot.query}`, { waitUntil: 'load' });
        await page.locator('body[data-ready="true"]').waitFor();

        const png = await page.screenshot({ clip: shot.clip, animations: 'disabled', caret: 'hide' });
        writeFileSync(resolve(outDir, shot.file), png);
        console.log(`${shot.file.padEnd(36)} ${(png.length / 1024).toFixed(1)} KB`);
    }
} finally {
    await browser.close();
    await server.close();
}
