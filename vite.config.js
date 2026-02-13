import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'assets',
        emptyOutDir: false, // Don't delete existing assets
        lib: {
            entry: path.resolve(__dirname, 'src/main.jsx'),
            name: 'ZeroGravityCloset',
            fileName: (format) => `zero-gravity-closet.bundle.js`,
            formats: ['umd']
        },
        rollupOptions: {
            output: {
                // Ensure React is bundled if not provided globally, 
                // or exclude if you plan to provide it via CDN (recommended to bundle for simplicity in themes)
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM'
                }
            }
        },
        // Minify for production
        minify: 'esbuild'
    },
    define: {
        'process.env.NODE_ENV': '"production"'
    }
});
