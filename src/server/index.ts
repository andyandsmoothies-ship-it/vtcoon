// [UC-OPS-001/MSS][UC-OPS-002/MSS] Server Entry Point & Production Bootstrap
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WssServer } from './network/wss_server.js';
import { createHealthServer } from './health_check.js';

export interface ServerConfig {
  readonly nodeEnv?: string;
  readonly port?: number;
  readonly wssPort?: number;
  readonly gracePeriodMs?: number;
  readonly staticDir?: string;
}

export interface RunningServer {
  readonly httpServer: http.Server;
  readonly wssServer: WssServer;
  readonly close: () => Promise<void>;
}

export function validateEnv(): {
  nodeEnv: string;
  port: number;
  wssPort: number;
  gracePeriodMs: number;
} {
  if (!process.env.NODE_ENV) throw new Error('NODE_ENV is required');
  if (!process.env.WSS_PORT) throw new Error('WSS_PORT is required');
  if (!process.env.GRACE_PERIOD_MS) throw new Error('GRACE_PERIOD_MS is required');

  const nodeEnv = process.env.NODE_ENV;
  const wssPort = parseInt(process.env.WSS_PORT, 10);
  const gracePeriodMs = parseInt(process.env.GRACE_PERIOD_MS, 10);
  const port = parseInt(process.env.PORT || '3000', 10);

  if (Number.isNaN(wssPort)) throw new Error('WSS_PORT must be a valid number');
  if (Number.isNaN(gracePeriodMs)) throw new Error('GRACE_PERIOD_MS must be a valid number');
  if (Number.isNaN(port)) throw new Error('PORT must be a valid number');

  return { nodeEnv, port, wssPort, gracePeriodMs };
}

export async function startServer(config?: ServerConfig): Promise<RunningServer> {
  const env = validateEnv();
  const port = config?.port ?? env.port;
  const wssPort = config?.wssPort ?? env.wssPort;
  const gracePeriodMs = config?.gracePeriodMs ?? env.gracePeriodMs;

  const wssServer = new WssServer({
    port: wssPort,
    gracePeriodMs,
  });

  const distDir = path.resolve(process.cwd(), 'dist');
  const staticDir = config?.staticDir ?? (fs.existsSync(distDir) ? distDir : undefined);
  const httpServer = createHealthServer(
    () => wssServer.getRoomManager().roomMap.size,
    Date.now(),
    staticDir,
  );

  await new Promise<void>((resolve, reject) => {
    httpServer.listen(port, () => resolve());
    httpServer.once('error', reject);
  });

  const runningServer: RunningServer = {
    httpServer,
    wssServer,
    close: async () => {
      await new Promise<void>((resolve) => httpServer.close(() => resolve()));
      await wssServer.close();
    },
  };

  return runningServer;
}

const isDirectExecution =
  process.argv[1] &&
  (fileURLToPath(import.meta.url) === process.argv[1] ||
    process.argv[1].endsWith('dist/server/index.js') ||
    process.argv[1].endsWith('dist\\server\\index.js'));

if (isDirectExecution) {
  startServer()
    .then((server) => {
      console.log('[Server] VTCoOn Production Server running successfully.');
      const shutdown = async () => {
        await server.close();
        process.exit(0);
      };
      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
    })
    .catch((err) => {
      console.error('[Server] Fatal bootstrap error:', err);
      process.exit(1);
    });
}
