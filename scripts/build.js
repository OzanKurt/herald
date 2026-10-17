import { build } from 'esbuild';
import { copyFileSync, mkdirSync, statSync } from 'node:fs';

mkdirSync('dist/esm', { recursive: true });

const script = { format: 'iife', platform: 'browser', sourcemap: 'linked' };

const outputs = [
    // Script tag builds: window.Herald, and the jQuery drop-in that also adds $.smallBox & co.
    { ...script, entryPoints: ['src/browser.js'], outfile: 'dist/herald.js' },
    { ...script, entryPoints: ['src/browser.js'], outfile: 'dist/herald.min.js', minify: true },
    { ...script, entryPoints: ['src/jquery.js'], outfile: 'dist/herald.jquery.js' },
    { ...script, entryPoints: ['src/jquery.js'], outfile: 'dist/herald.jquery.min.js', minify: true },
    // Module builds
    { entryPoints: ['src/index.js'], outfile: 'dist/esm/herald.mjs', format: 'esm', platform: 'neutral', sourcemap: 'linked' },
    { entryPoints: ['src/index.js'], outfile: 'dist/herald.cjs', format: 'cjs', platform: 'node', footer: { js: 'module.exports = module.exports.default;' } },
    // Stylesheet
    { entryPoints: ['css/herald.css'], outfile: 'dist/herald.min.css', minify: true },
];

await Promise.all(outputs.map((options) => build({ bundle: true, ...options })));
copyFileSync('css/herald.css', 'dist/herald.css');

for (const file of [...outputs.map((o) => o.outfile), 'dist/herald.css']) {
    console.log(`${file.padEnd(28)} ${(statSync(file).size / 1024).toFixed(1)} KB`);
}
