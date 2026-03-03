import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [viteSingleFile()],
  build: {
    // Build to dist/ folder (Vite best practice)
    // Post-build script copies index.html to root for Pi deployment
    outDir: 'dist',
    emptyOutDir: true,          // Clean dist/ on each build
    rollupOptions: {
      // Use src/index.html as the Vite entry point (migrated in Story 1.2)
      input: 'src/index.html',
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
