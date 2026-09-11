// [UC-OPS-001/MSS] Health Check Server Endpoint & Static Asset Serving
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

export interface HealthStatus {
  readonly status: 'ok';
  readonly activeRooms: number;
  readonly uptime: number;
}

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.mp3': 'audio/mpeg',
  '.webp': 'image/webp',
};

export function createHealthServer(
  getActiveRooms: () => number,
  startTime = Date.now(),
  staticDir?: string,
): http.Server {
  return http.createServer((req, res) => {
    if ((req.method === 'GET' || req.method === 'HEAD') && req.url === '/health') {
      const payload: HealthStatus = {
        status: 'ok',
        activeRooms: getActiveRooms(),
        uptime: Math.floor((Date.now() - startTime) / 1000),
      };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      if (req.method === 'HEAD') {
        res.end();
      } else {
        res.end(JSON.stringify(payload));
      }
      return;
    }

    if ((req.method === 'GET' || req.method === 'HEAD') && staticDir && fs.existsSync(staticDir)) {
      const rawUrl = req.url ? req.url.split('?')[0] : '/';
      const cleanPath = path.normalize(rawUrl ?? '/').replace(/^(\.\.[/\\])+/, '');
      let filePath = path.join(staticDir, cleanPath === '/' ? 'index.html' : cleanPath);

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        if (!path.extname(cleanPath)) {
          filePath = path.join(staticDir, 'index.html');
        }
      }

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        if (req.method === 'HEAD') {
          res.end();
        } else {
          fs.createReadStream(filePath).pipe(res);
        }
        return;
      }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });
}

