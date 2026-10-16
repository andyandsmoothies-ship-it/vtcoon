#!/usr/bin/env node

/**
 * scripts/resolve_blender.mjs
 * Facade entrypoint for Cross-Platform Blender CLI Path Resolver
 */

import {
  resolveBlenderExecutable,
  formatBlenderDiagnosticInstructions,
  runBlenderPythonScript,
} from './blender/resolve_blender.mjs';

export {
  resolveBlenderExecutable,
  formatBlenderDiagnosticInstructions,
  runBlenderPythonScript,
};

if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('scripts/resolve_blender.mjs')) {
  const res = resolveBlenderExecutable();
  console.log(JSON.stringify(res, null, 2));
}

