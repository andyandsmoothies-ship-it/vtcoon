// [UC-OPS-001/MSS][UC-OPS-002/MSS] OPS-04 Deployment, Container & Health Check Tests
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { createHealthServer } from '../../src/server/health_check.js';
import { startServer, validateEnv } from '../../src/server/index.js';

describe('[TC-OPS04.1/MSS] Health Check & Static Assets Endpoint', () => {
  it('tra ve 200 OK voi /health schema va phuc vu static asset SPA tren cong 3000', async () => {
    let activeRooms = 3;
    const distDir = path.resolve(process.cwd(), 'dist');
    const server = createHealthServer(() => activeRooms, Date.now(), distDir);
    await new Promise<void>((resolve) => server.listen(3199, () => resolve()));
    try {
      const resHealth = await fetch('http://127.0.0.1:3199/health');
      expect(resHealth.status).toBe(200);
      const data = (await resHealth.json()) as { status: string; activeRooms: number; uptime: number };
      expect(data.status).toBe('ok');
      expect(data.activeRooms).toBe(3);
      expect(data.uptime).toBeGreaterThanOrEqual(0);

      activeRooms = 5;
      const resHealth2 = await fetch('http://127.0.0.1:3199/health');
      expect(((await resHealth2.json()) as { activeRooms: number }).activeRooms).toBe(5);

      const resRoot = await fetch('http://127.0.0.1:3199/');
      expect(resRoot.status).toBe(200);
      expect(resRoot.headers.get('content-type')).toContain('text/html');

      const res404 = await fetch('http://127.0.0.1:3199/unknown.js');
      expect(res404.status).toBe(404);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});

describe('[TC-OPS04.2/MSS] Server Tu Choi Khoi Dong Neu Thieu Bien Moi Truong', () => {
  it('tu choi khoi dong khi thieu hoac sai dinh dang NODE_ENV, WSS_PORT, GRACE_PERIOD_MS', async () => {
    const original = { ...process.env };
    try {
      delete process.env.NODE_ENV;
      expect(() => validateEnv()).toThrow('NODE_ENV is required');
      await expect(startServer()).rejects.toThrow('NODE_ENV is required');

      process.env.NODE_ENV = 'production';
      delete process.env.WSS_PORT;
      expect(() => validateEnv()).toThrow('WSS_PORT is required');
      await expect(startServer()).rejects.toThrow('WSS_PORT is required');

      process.env.GRACE_PERIOD_MS = '60000';
      process.env.WSS_PORT = 'invalid';
      expect(() => validateEnv()).toThrow('WSS_PORT must be a valid number');

      process.env.WSS_PORT = '3001';
      delete process.env.GRACE_PERIOD_MS;
      expect(() => validateEnv()).toThrow('GRACE_PERIOD_MS is required');

      process.env.GRACE_PERIOD_MS = '60000';
      const valid = validateEnv();
      expect(valid.wssPort).toBe(3001);
      expect(valid.gracePeriodMs).toBe(60000);
    } finally {
      process.env = original;
    }
  });
});

describe('[TC-OPS04.3/MSS] Kiem Chuan Cau Truc Tep Docker & Nginx', () => {
  it('Dockerfile, docker-compose.yml va nginx.conf co day du cau truc bat buoc', () => {
    const root = process.cwd();
    const dockerfile = fs.readFileSync(path.join(root, 'Dockerfile'), 'utf-8');
    const compose = fs.readFileSync(path.join(root, 'docker-compose.yml'), 'utf-8');
    const nginx = fs.readFileSync(path.join(root, 'nginx', 'nginx.conf'), 'utf-8');

    expect(dockerfile).toContain('AS builder');
    expect(dockerfile).toContain('AS runner');
    expect(dockerfile).toContain('dist/server/index.js');
    expect(dockerfile).toContain('EXPOSE 3000 3001');

    expect(compose).toContain('services:');
    expect(compose).toContain('vtcoon:');
    expect(compose).toContain('nginx:');
    expect(compose).toContain('unless-stopped');
    expect(compose).toContain('/health');
    expect(compose).toContain('127.0.0.1:3000:3000');

    expect(nginx).toContain('upstream app_http');
    expect(nginx).toContain('upstream app_wss');
    expect(nginx).toContain('proxy_pass http://app_http');
    expect(nginx).toContain('proxy_pass http://app_wss');
    expect(nginx).toContain('Upgrade $http_upgrade');
    expect(nginx).toContain('Strict-Transport-Security');
  });
});
