// Express entry point for Hostinger deployment.
// Serves the Vite production build in dist/ with SPA fallback, so every
// client-side route (tools, blog, guides) loads index.html.
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const app = express();

// Correct MIME for WebAssembly assets (ort/ffmpeg workers in dist/assets)
express.static.mime.define({ 'application/wasm': ['wasm'] });

// Long cache for hashed build assets; never cache index.html
app.use(
  '/assets',
  express.static(path.join(distDir, 'assets'), {
    maxAge: '1y',
    immutable: true,
  }),
);
app.use(express.static(distDir, { maxAge: '1d' }));

// SPA fallback: any non-file route serves index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`CROWN-TOOLS serving ${distDir} on port ${port}`);
});
