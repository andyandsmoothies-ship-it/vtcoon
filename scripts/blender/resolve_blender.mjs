import fs from 'node:fs';
import path from 'node:path';
import child_process from 'node:child_process';

/** scripts/blender/resolve_blender.mjs - Cross-Platform Blender CLI Resolver & Runner (IMP-408) */

const STANDARD_CANDIDATES = {
  win32: [
    'C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe',
    'C:\\Program Files\\Blender Foundation\\Blender 5.1\\blender.exe',
    'C:\\Program Files\\Blender Foundation\\Blender 5.0\\blender.exe',
    'C:\\Program Files\\Blender Foundation\\Blender 4.3\\blender.exe',
    'C:\\Program Files\\Blender Foundation\\Blender 4.2\\blender.exe',
  ],
  darwin: [
    '/Applications/Blender.app/Contents/MacOS/Blender',
    '/Applications/Blender 5.2.app/Contents/MacOS/Blender',
  ],
  linux: ['/usr/bin/blender', '/usr/local/bin/blender', '/snap/bin/blender'],
};

export function resolveBlenderExecutable(options = {}) {
  const env = options.env || process.env;
  const platform = options.platform || process.platform;
  const existsFn = options.existsSyncFn || fs.existsSync;
  const execFn = options.execFileSyncFn || child_process.execFileSync;

  let resolvedPath = null;
  let source = 'none';

  // 1. BLENDER_PATH or BLENDER_EXE override
  const envOverride = env.BLENDER_PATH || env.BLENDER_EXE;
  if (envOverride && typeof envOverride === 'string' && existsFn(envOverride)) {
    resolvedPath = envOverride;
    source = 'env';
  }

  // 2. Platform standard candidates
  if (!resolvedPath) {
    for (const cand of STANDARD_CANDIDATES[platform] || []) {
      if (existsFn(cand)) {
        resolvedPath = cand;
        source = 'candidate';
        break;
      }
    }
  }

  // 3. whichFn or PATH system probe
  if (!resolvedPath) {
    if (typeof options.whichFn === 'function') {
      const whichPath = options.whichFn('blender');
      if (whichPath) {
        resolvedPath = whichPath;
        source = 'path';
      }
    } else if (env.PATH) {
      const binName = platform === 'win32' ? 'blender.exe' : 'blender';
      for (const d of env.PATH.split(path.delimiter)) {
        const full = path.join(d, binName);
        if (existsFn(full)) {
          resolvedPath = full;
          source = 'path';
          break;
        }
      }
    }
  }

  if (!resolvedPath) {
    return { exists: false, path: null, version: null, source: 'none' };
  }

  let version = null;
  try {
    const stdout = execFn(resolvedPath, ['--version'], { encoding: 'utf8', timeout: 5000 });
    const match = String(stdout).match(/Blender\s+(\d+\.\d+(?:\.\d+)?)/i);
    if (match) version = match[1];
  } catch {
    // Non-fatal probe failure
  }

  return { exists: true, path: resolvedPath, version, source };
}

export function formatBlenderDiagnosticInstructions(platform = process.platform) {
  if (platform === 'win32') {
    return 'Blender CLI not detected. Install via winget ("winget install BlenderFoundation.Blender"), verify standard path in "C:\\Program Files\\Blender Foundation", or set BLENDER_PATH environment variable.';
  }
  if (platform === 'darwin') {
    return 'Blender CLI not detected. Install via brew ("brew install --cask blender"), verify "/Applications/Blender.app", or set BLENDER_PATH environment variable.';
  }
  return 'Blender CLI not detected. Install via snap ("sudo snap install blender --classic") or apt ("sudo apt install blender"), or set BLENDER_PATH environment variable.';
}

export function runBlenderPythonScript(scriptPath, scriptArgs = [], options = {}) {
  const resolveFn = options.resolveFn || resolveBlenderExecutable;
  const resolved = resolveFn(options);
  if (!resolved || !resolved.exists || !resolved.path) {
    throw new Error('Blender executable not found. Please install Blender or configure BLENDER_PATH.');
  }

  const args = ['--background', '--python', scriptPath, ...(scriptArgs.length ? ['--', ...scriptArgs] : [])];
  if (options.dryRun) return { executed: true, binary: resolved.path, args };

  const execFn = options.execFileSyncFn || child_process.execFileSync;
  try {
    return execFn(resolved.path, args, {
      stdio: options.stdio || 'inherit',
      cwd: options.cwd,
      timeout: options.timeoutMs,
      env: options.env,
    });
  } catch (err) {
    throw new Error(`Blender execution failed: ${err.message || String(err)}`);
  }
}
