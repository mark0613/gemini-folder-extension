import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import manifest from './src/manifest.json';

// https://vitejs.dev/config/
export default defineConfig(() => ({
    base: '',
    plugins: [
        react(),
        crx({ manifest }),
    ],
    server: {
        host: '127.0.0.1',
        port: 5173,
        cors: true,
    },
}));
