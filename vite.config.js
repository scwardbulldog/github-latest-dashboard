import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve } from 'path';
import { existsSync, createReadStream } from 'fs';
import { join } from 'path';

// Custom plugin to serve /img from project root in dev
function serveImgPlugin() {
  return {
    name: 'serve-img',
    configureServer(server) {
      server.middlewares.use('/img', (req, res, next) => {
        const filePath = join(__dirname, 'img', req.url);
        if (existsSync(filePath)) {
          res.setHeader('Content-Type', 'image/png');
          createReadStream(filePath).pipe(res);
        } else {
          next();
        }
      });
    }
  };
}

export default defineConfig({
  root: 'src',  // Set src as the root directory for dev server
  publicDir: false,  // Don't copy public dir (images handled by post-build)
  plugins: [viteSingleFile(), serveImgPlugin()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    // Build to dist/ folder (Vite best practice)
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
  }
});
