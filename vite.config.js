import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',  // Set src as the root directory for dev server
  plugins: [viteSingleFile()],
  build: {
    // Build to dist/ folder (Vite best practice)
    // Post-build script copies index.html to root for Pi deployment
    outDir: resolve(__dirname, 'dist'),  // Absolute path to dist/
    emptyOutDir: true,          // Clean dist/ on each build
    rollupOptions: {
      // Use index.html as the Vite entry point (since root is src/)
      input: resolve(__dirname, 'src/index.html'),
      output: {
        inlineDynamicImports: true,  // Single bundle
      }
    },
    minify: 'terser',         // Minify for smaller output
    target: 'es2020',         // Chromium 84 compatibility
  },
  server: {
    port: 5173,               // Standard Vite dev port
    open: true                // Auto-open browser
  }
});
