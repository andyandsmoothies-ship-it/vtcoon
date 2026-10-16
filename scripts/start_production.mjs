#!/usr/bin/env node
// [OPS] Production Server Bootstrap with Cloud PaaS Auto-Configuration (Render, Railway, Fly.io)

const port = process.env.PORT || '3000';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = port;
// Cloud PaaS like Render route all incoming traffic through a single public PORT.
// Auto-sync WSS_PORT to PORT to ensure Single-Port mode unless explicitly set.
process.env.WSS_PORT = process.env.WSS_PORT || port;
process.env.GRACE_PERIOD_MS = process.env.GRACE_PERIOD_MS || '15000';
process.env.VTCOON_ADMIN_SECRET = process.env.VTCOON_ADMIN_SECRET || process.env.ADMIN_SECRET || 'vtcoon_admin_secret_2026';

console.info(`[Bootstrap] Starting VTCOON in Single-Port Production Mode (PORT=${process.env.PORT}, WSS_PORT=${process.env.WSS_PORT}, GRACE_PERIOD_MS=${process.env.GRACE_PERIOD_MS})...`);

const { startServer } = await import('../dist/server/index.js');
const server = await startServer();
console.info('[Server] VTCoOn Production Server running successfully.');

const shutdown = async () => {
  console.info('[Server] Gracefully shutting down...');
  await server.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
