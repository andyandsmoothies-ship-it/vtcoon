import net from 'node:net';

/**
 * Probes whether a specific TCP port is currently free or occupied.
 *
 * @param {number} port
 * @param {string} [host='127.0.0.1']
 * @returns {Promise<{ port: number, available: boolean, error?: string }>}
 */
export function probePort(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();

    server.once('error', (err) => {
      resolve({ port, available: false, error: err.code || err.message });
    });

    server.listen({ port, host }, () => {
      server.close(() => {
        resolve({ port, available: true });
      });
    });
  });
}

/**
 * Verifies that dynamic port allocation (port: 0) succeeds on the host.
 * Mandatory per AGENTS CONSTITUTION Client/Server Boundary.
 *
 * @returns {Promise<{ success: boolean, allocatedPort?: number, error?: string }>}
 */
export function verifyDynamicPort0() {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();

    server.once('error', (err) => {
      resolve({ success: false, error: err.code || err.message });
    });

    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const allocatedPort = typeof address === 'object' && address !== null ? address.port : undefined;
      server.close(() => {
        resolve({ success: true, allocatedPort });
      });
    });
  });
}

/**
 * Checks network readiness for VTCOON (Dev port 5173, dynamic socket port 0).
 *
 * @returns {Promise<Array<{ category: string, name: string, status: 'PASS' | 'WARN' | 'FAIL', message: string, details?: string }>>}
 */
export async function checkNetworkPorts() {
  const results = [];

  // 1. Port 5173 (Vite default dev server)
  const devPortProbe = await probePort(5173);
  if (devPortProbe.available) {
    results.push({
      category: 'Network Ports',
      name: 'Vite Dev Server (Port 5173)',
      status: 'PASS',
      message: 'Port 5173 is available for `npm run dev`'
    });
  } else {
    results.push({
      category: 'Network Ports',
      name: 'Vite Dev Server (Port 5173)',
      status: 'WARN',
      message: `Port 5173 is occupied (${devPortProbe.error}). Vite may increment to 5174.`,
      details: 'Check if an existing dev server or orphaned node process is running.'
    });
  }

  // 2. Dynamic Port 0 allocation check
  const dynProbe = await verifyDynamicPort0();
  if (dynProbe.success) {
    results.push({
      category: 'Network Ports',
      name: 'Dynamic Socket Port 0',
      status: 'PASS',
      message: `Dynamic ephemeral binding operational (probed port: ${dynProbe.allocatedPort})`
    });
  } else {
    results.push({
      category: 'Network Ports',
      name: 'Dynamic Socket Port 0',
      status: 'FAIL',
      message: 'Failed to bind ephemeral socket port 0!',
      details: `Socket creation failed with error: ${dynProbe.error}. Check firewall or loopback permissions.`
    });
  }

  return results;
}
