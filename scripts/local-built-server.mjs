import { build, createServer } from 'vite';
import serveStatic from 'serve-static';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const server = await createServer({
  root,
  configLoader: 'native',
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { host: 'localhost', port: 4173, strictPort: true },
  plugins: [{
    name: 'local-built-client',
    async configureServer(server) {
      // Rebuild on launch and after Provider Settings restarts the server so
      // client-side map credentials stay aligned with the local environment.
      await build({ root, configLoader: 'native' });
      const assets = serveStatic(path.join(root, 'dist'), { index: 'index.html' });
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/api/')) return next();
        assets(req, res, next);
      });
    },
  }],
});
await server.listen();
server.printUrls();
