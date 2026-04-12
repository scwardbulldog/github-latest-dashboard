import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve } from 'path';
import { existsSync, createReadStream } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

// Custom plugin to serve /img from project root in dev
function serveImgPlugin() {
  return {
    name: 'serve-img',
    configureServer(server) {
      server.middlewares.use('/img', (req, res, next) => {
        const filePath = join(__dirname, 'public', 'img', req.url);
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

/**
 * Vite plugin to inject git commit hash and build date into HTML
 * Creates a subtle version watermark below the clock element
 * 
 * @returns {import('vite').Plugin}
 */
function gitHashPlugin() {
  return {
    name: 'git-hash-inject',
    transformIndexHtml(html) {
      let hash = 'dev-build';
      let buildDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      try {
        // Get short commit hash (first 7 characters)
        hash = execSync('git rev-parse --short HEAD').toString().trim();
      } catch {
        // Fallback if git command fails (e.g., no git CLI, not a git repo)
        console.warn('[git-hash-inject] Could not retrieve git commit hash, using fallback');
      }

      // Inject the commit ticker element before closing </body>
      const tickerHtml = `<div class="commit-hash-ticker" data-commit="${hash}" data-date="${buildDate}">${hash} • ${buildDate}</div>`;
      
      return html.replace('</body>', `${tickerHtml}</body>`);
    }
  };
}

export default defineConfig({
  root: 'src',  // Set src as the root directory for dev server
  publicDir: resolve(__dirname, 'public'),  // Copy public/ folder contents to dist/
  plugins: [gitHashPlugin(), viteSingleFile(), serveImgPlugin()],
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
