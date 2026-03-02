import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [viteSingleFile()],
  build: {
    // Output build artifact to project root to satisfy Pi deployment expectations
    // Note: Vite warns about using the project root as outDir; we intentionally
    // accept this due to the Raspberry Pi kiosk constraint that index.html
    // must live at the repository root.
    outDir: '.',
    emptyOutDir: false,       // DON'T delete other files (docs/, deploy/, _bmad/, etc.)
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
