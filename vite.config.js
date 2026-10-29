import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const projectRoot = fileURLToPath(new URL('.',
    import.meta.url));

function findHtmlEntries(directory) {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        if (entry.isDirectory()) {
            if (['.git', 'dist', 'node_modules'].includes(entry.name)) return [];
            return findHtmlEntries(resolve(directory, entry.name));
        }
        return entry.name.endsWith('.html') ? [resolve(directory, entry.name)] : [];
    });
}

export default defineConfig({
    build: {
        rollupOptions: {
            input: findHtmlEntries(projectRoot)
        }
    }
});