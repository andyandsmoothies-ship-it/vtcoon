import fs from 'node:fs';
import path from 'node:path';

/**
 * scripts/plan_audit/rules_architecture.mjs
 * Architecture hygiene, snippet validation, shallow module detection, and physical visual mandates.
 */

export function auditPlanSnippetHygiene(relPath, targetChunk, replacementChunk, allFileSnippets = []) {
  let errors = 0;
  const cleanTarget = targetChunk.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, '');
  const cleanReplacement = replacementChunk.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, '');
  if (cleanTarget.length > 0 && cleanTarget === cleanReplacement) {
    console.error(`  ❌ NO-OP SNIPPET in ${relPath}: Replacement chunk contains zero functional changes compared to target chunk!`);
    errors++;
  }

  if (/\.(tsx|jsx|vue|svelte|html)$/.test(relPath)) {
    if (/<\/?(?:div|button|span|p|section|header|footer|template|view|text|h[1-6]|input|form)\b/i.test(replacementChunk)) {
      console.error(`  ❌ [BANNED_UI_DOM_CODE_DUMP_IN_PLAN] in ${relPath}:`);
      console.error(`     Replacement snippet contains raw markup/JSX tags!`);
      console.error(`     Plan Hygiene mandates: UI/View plans must specify Props, Affordance triggers, and Layout rules, NOT raw template diffs.`);
      errors++;
    }
  }

  const refUsageRegex = /\b([a-zA-Z0-9_$]+Ref)\.current\b/g;
  let refMatch;
  const absPath = path.resolve(process.cwd(), relPath);
  const diskContent = fs.existsSync(absPath) ? fs.readFileSync(absPath, 'utf8') : '';
  while ((refMatch = refUsageRegex.exec(replacementChunk)) !== null) {
    const refName = refMatch[1];
    const declaredOnDisk = new RegExp(`\\b(?:const|let|var)\\s+${refName}\\b`).test(diskContent);
    const declaredInSnippets = allFileSnippets.some((snip) =>
      new RegExp(`\\b(?:const|let|var)\\s+${refName}\\b`).test(snip)
    );
    if (!declaredOnDisk && !declaredInSnippets) {
      console.error(`  ❌ [UNDECLARED_REF_IDENTIFIER_IN_PLAN] in ${relPath}: Reference '${refName}.current' is used in snippet but '${refName}' is not declared in disk file or any plan replacement snippet!`);
      errors++;
    }
  }

  const camFnRegex = /export\s+function\s+(calculate[A-Za-z0-9_]*Cam[A-Za-z0-9_]*)\s*\(([^)]*)\)/g;
  let camFnMatch;
  while ((camFnMatch = camFnRegex.exec(replacementChunk)) !== null) {
    const fnName = camFnMatch[1];
    const fnArgs = camFnMatch[2];
    if (!/\baspect\b/i.test(fnArgs)) {
      console.error(`  ❌ [MISSING_RESPONSIVE_ASPECT_RATIO] in ${relPath}: Camera state calculation function '${fnName}' does not accept 'aspect' parameter! Dual-Viewport Parity requires camera functions to accept 'aspect' for Mobile Portrait FOV compensation.`);
      errors++;
    }
  }

  return errors;
}

export function auditPhysicalVisualMandate(targetFiles, planContent) {
  let errors = 0;
  const isVisualSubsystem = Array.from(targetFiles.keys()).some((f) =>
    /^(?:src\/client\/3d|src\/client\/ui|src\\client\\3d|src\\client\\ui)/i.test(f)
  );
  if (isVisualSubsystem) {
    const hasVisualVerification = /capture:visual|check_evidence/i.test(planContent);
    if (!hasVisualVerification) {
      console.error(`  ❌ [MISSING_PHYSICAL_VISUAL_VERIFICATION] Plan targets 3D/UI subsystems but Station 3 lacks 'capture:visual' or 'check_evidence' verification!`);
      console.error(`     Gotcha #13 / UI Governance mandates physical action evidence before sign-off.`);
      errors++;
    } else {
      console.log(`  ✔️ Physical visual verification registered in plan for 3D/UI scope.`);
    }

    const isCameraOrMotion = Array.from(targetFiles.keys()).some((f) =>
      /camera|chase|kinematics|trajectory|hop/i.test(f)
    ) || /camera|chase|kinematics/i.test(planContent);
    if (isCameraOrMotion) {
      const scenarioMatch = planContent.match(/--scenario\s+([a-zA-Z0-9_]+)/);
      if (!scenarioMatch) {
        console.error(`  ❌ [MISSING_ACTION_SCENARIO_IN_PLAN] Camera/motion plan must specify an in-action scenario via '--scenario <name>' in Station 3!`);
        console.error(`     Gotcha #13 mandates in-action capture (elevation <= 20.0m) to prevent idle overview trap.`);
        errors++;
      } else {
        const scenarioName = scenarioMatch[1];
        const scenarioPath = path.resolve(process.cwd(), 'scripts/visual_scenarios', `${scenarioName}.js`);
        const captureScriptPath = path.resolve(process.cwd(), 'scripts/capture_visual_evidence.mjs');
        if (fs.existsSync(scenarioPath)) {
          console.log(`  ✔️ Verified in-action capture scenario '${scenarioName}' exists in 'scripts/visual_scenarios/'.`);
        } else if (fs.existsSync(captureScriptPath)) {
          const captureContent = fs.readFileSync(captureScriptPath, 'utf8');
          if (!captureContent.includes(`'${scenarioName}'`)) {
            console.error(`  ❌ [UNKNOWN_CAPTURE_SCENARIO] Scenario '${scenarioName}' specified in plan does not exist in 'scripts/visual_scenarios/' or 'scripts/capture_visual_evidence.mjs'!`);
            errors++;
          } else {
            console.log(`  ✔️ Verified in-action capture scenario '${scenarioName}' exists in capture runner.`);
          }
        }
      }
    }
  }
  return errors;
}

export function auditStateDependencyScope(targetFiles, planContent) {
  let errors = 0;
  const stateFlagMatches = planContent.match(/\b(hasUserCustomCamera)\b/g);
  if (stateFlagMatches) {
    const hasBranchingSnippet = /(!hasUserCustomCamera|hasUserCustomCamera\s*&&|hasUserCustomCamera\s*\?)/.test(planContent);
    const touchesStore = Array.from(targetFiles.keys()).some((f) => f.includes('src/client/store/'));
    if (hasBranchingSnippet && !touchesStore) {
      console.warn(`  ⚠️  [STATE_MUTATION_BOUNDARY_WARNING] Plan branches on 'hasUserCustomCamera' in presentation code without modifying 'src/client/store/'.`);
      console.warn(`     WARNING: Upstream flows (e.g. triggerDiceRoll in game_store.ts) may unconditionally reset this flag to false.`);
      console.warn(`     Verify that your feature does not become a dead path during dice roll or pawn animation.`);
    }
  }
  return errors;
}

/**
 * Detects shallow React components with wide interfaces (>= 4 props) that lack stateful lifecycle.
 * Enforces GEMINI.md Iron Law: Anti-Shallow UI Refactoring & Props Explosion.
 */
export function auditShallowModulePropsExplosion(planContent) {
  let errors = 0;
  const interfaceRegex = /interface\s+([A-Za-z0-9_]+Props)\s*\{([\s\S]*?)\}/g;
  let match;

  while ((match = interfaceRegex.exec(planContent)) !== null) {
    const interfaceName = match[1];
    const interfaceBody = match[2];

    const propLines = interfaceBody
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('//') && !l.startsWith('/*') && !l.startsWith('*') && l.includes(':'));

    const propCount = propLines.length;
    if (propCount >= 4) {
      const baseComponentName = interfaceName.replace(/Props$/, '');
      const compRegex = new RegExp(
        `(?:export\\s+)?function\\s+${baseComponentName}\\s*\\([\\s\\S]*?\\)(?:\\s*:\\s*[^{\\n]+)?\\s*\\{([\\s\\S]*?)\\n\\}`,
        'i'
      );
      const compMatch = planContent.match(compRegex);
      if (compMatch) {
        const compBody = compMatch[1];
        const hasHooks = /\b(useState|useEffect|useReducer|useRef|useMemo|useCallback|useContext|useTransition)\b/.test(compBody);
        if (!hasHooks) {
          console.error(`  ❌ [SHALLOW_MODULE_PROPS_EXPLOSION] Sub-component '${baseComponentName}' declares ${propCount} props in '${interfaceName}' but contains no stateful lifecycle hooks (useState/useEffect)!`);
          console.error(`     GEMINI.md Iron Law forbids shallow React decomposition with wide interfaces (>= 4 props).`);
          console.error(`     Remedy: Group fragmented props into a single domain data object (e.g. data: <Type>) or extract pure derivation logic into domain helpers/visuals.`);
          errors++;
        }
      }
    }
  }

  if (errors === 0 && /interface\s+[A-Za-z0-9_]+Props/i.test(planContent)) {
    console.log(`  ✔️ Anti-Shallow UI & Props Explosion verified: No stateless components with >= 4 props.`);
  }

  return errors;
}
