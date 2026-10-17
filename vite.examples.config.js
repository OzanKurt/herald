import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Serves examples/ with the package aliased at its sources, so changes show on reload.
export default defineConfig({
    root: resolve(import.meta.dirname, 'examples'),
    resolve: {
        alias: {
            '@ozankurt/herald/style.css': resolve(import.meta.dirname, 'css/herald.css'),
            '@ozankurt/herald': resolve(import.meta.dirname, 'src/index.js'),
        },
    },
    server: { port: 5181, strictPort: true },
});
