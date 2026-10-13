import os from 'node:os';
import { execSync } from 'node:child_process';

/**
 * Checks system environment: Node.js runtime, npm version, OS, and Git readiness.
 *
 * @returns {Array<{ category: string, name: string, status: 'PASS' | 'WARN' | 'FAIL', message: string, details?: string }>}
 */
export function checkSystemEnvironment() {
  const results = [];

  // 1. Node.js version check
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.replace(/^v/, '').split('.')[0], 10);
  if (isNaN(majorVersion) || majorVersion < 18) {
    results.push({
      category: 'Environment',
      name: 'Node.js Runtime',
      status: 'FAIL',
      message: `Node.js ${nodeVersion} is below required minimum (>= 18.0.0).`,
      details: 'Upgrade Node.js to version 20.x or 22.x LTS.'
    });
  } else if (majorVersion < 20) {
    results.push({
      category: 'Environment',
      name: 'Node.js Runtime',
      status: 'WARN',
      message: `Node.js ${nodeVersion} detected. Node >= 20 LTS recommended.`,
      details: 'Consider upgrading to Node.js 20 or 22 LTS for optimal Vitest performance.'
    });
  } else {
    results.push({
      category: 'Environment',
      name: 'Node.js Runtime',
      status: 'PASS',
      message: `${nodeVersion} (>= 18.0.0 satisfied)`
    });
  }

  // 2. NPM version check
  try {
    const npmVersion = execSync('npm --version', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 5000
    }).trim();
    results.push({
      category: 'Environment',
      name: 'Package Manager',
      status: 'PASS',
      message: `npm v${npmVersion}`
    });
  } catch (err) {
    results.push({
      category: 'Environment',
      name: 'Package Manager',
      status: 'WARN',
      message: 'Unable to query npm version',
      details: err instanceof Error ? err.message : String(err)
    });
  }

  // 3. Platform & Resources
  const totalMemGb = (os.totalmem() / (1024 ** 3)).toFixed(1);
  const freeMemGb = (os.freemem() / (1024 ** 3)).toFixed(1);
  const cpus = os.cpus().length;
  results.push({
    category: 'Environment',
    name: 'Hardware & OS',
    status: 'PASS',
    message: `${process.platform} (${process.arch}) - ${cpus} CPUs, ${freeMemGb}GB / ${totalMemGb}GB RAM free`
  });

  // 4. Git status & branch
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 5000
    }).trim();
    const gitDiff = execSync('git status --porcelain', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 5000
    }).trim();
    const uncommittedCount = gitDiff ? gitDiff.split('\n').filter(Boolean).length : 0;
    results.push({
      category: 'Environment',
      name: 'Git Repository',
      status: 'PASS',
      message: `Branch: ${branch} (${uncommittedCount} uncommitted file${uncommittedCount === 1 ? '' : 's'})`
    });
  } catch (err) {
    results.push({
      category: 'Environment',
      name: 'Git Repository',
      status: 'WARN',
      message: 'Failed to inspect git repository status',
      details: err instanceof Error ? err.message : String(err)
    });
  }

  return results;
}
