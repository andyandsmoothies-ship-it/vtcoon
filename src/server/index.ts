// [UC-OPS-001/MSS][UC-OPS-002/MSS] Server Entry Point & Production Bootstrap
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WssServer } from './network/wss_server.js';
import { createHealthServer } from './health_check.js';

export const DEFAULT_BOT_TURN_DELAY_MS = 1500;

export interface ServerConfig {
  readonly nodeEnv?: string;
  readonly port?: number;
  readonly wssPort?: number;
  readonly gracePeriodMs?: number;
  readonly staticDir?: string;
  readonly botTurnDelayMs?: number;
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

function closeHttp(server: http.Server): Promise<void> {
  return new Promise<void>((resolve) => {
    server.close(() => resolve());
    server.closeAllConnections?.();
  });
}

export async function startServer(config?: ServerConfig): Promise<RunningServer> {
  const env = validateEnv();
  const port = config?.port ?? env.port;
  const wssPort = config?.wssPort ?? env.wssPort;
  const gracePeriodMs = config?.gracePeriodMs ?? env.gracePeriodMs;
  const botTurnDelayMs = config?.botTurnDelayMs ?? DEFAULT_BOT_TURN_DELAY_MS;
  const isSinglePort = (config?.port ?? env.port) === (config?.wssPort ?? env.wssPort);

  const distDir = path.resolve(process.cwd(), 'dist');
  const staticDir = config?.staticDir ?? (fs.existsSync(distDir) ? distDir : undefined);
  let wssServer: WssServer;
  const httpServer = createHealthServer(
    () => wssServer?.getRoomManager().roomMap.size ?? 0,
    Date.now(),
    staticDir,
  );

  wssServer = new WssServer(
    isSinglePort
      ? { server: httpServer, gracePeriodMs, botTurnDelayMs }
      : { port: wssPort, gracePeriodMs, botTurnDelayMs },
  );

  await new Promise<void>((resolve, reject) => {
    httpServer.listen(port, () => resolve());
    httpServer.once('error', reject);
  });

  return {
    httpServer,
    wssServer,
    close: async () => {
      if (isSinglePort) {
        await wssServer.close();
        await closeHttp(httpServer);
      } else {
        await closeHttp(httpServer);
        await wssServer.close();
      }
    },
  };
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
