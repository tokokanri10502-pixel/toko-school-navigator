import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycby4YW8gFyamjXJL4bOHzonUJh_Bo2Nj9WZR0HgdH6-SbHq-tPYqNAHPpzwN_qMVvsJv/exec';

function gasProxy(): Plugin {
  return {
    name: 'gas-proxy',
    configureServer(server) {
      server.middlewares.use('/gas-api', (req, res) => {
        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk; });
        req.on('end', async () => {
          try {
            const options: RequestInit = {
              method: req.method ?? 'GET',
              headers: { 'Content-Type': 'text/plain' },
              redirect: 'follow',
            };
            if (body) options.body = body;
            // クエリ文字列を保持して転送（例: ?resource=activities）
            const reqUrl = req.url ?? '';
            const queryIdx = reqUrl.indexOf('?');
            const query = queryIdx >= 0 ? reqUrl.slice(queryIdx) : '';
            const response = await fetch(GAS_ENDPOINT + query, options);
            const text = await response.text();
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.statusCode = response.ok ? 200 : response.status;
            res.end(text);
          } catch (e) {
            console.error('GAS proxy error:', e);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(e) }));
          }
        });
      });
    }
  };
}

export default defineConfig({
  base: '/toko-school-navigator/',
  plugins: [react(), gasProxy()],
  server: {
    port: 5174,
    strictPort: false,
    open: false,
  },
})
