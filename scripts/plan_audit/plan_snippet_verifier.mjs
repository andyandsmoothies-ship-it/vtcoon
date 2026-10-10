import fs from 'node:fs';
import path from 'node:path';

/**
 * Verifies code specifications and Anti-TIDD consumer invariants for newly declared production files.
 */
export function auditNewFileDeclarations(targetFiles, planContent, fileTargetRegex, snippetRegex, findSourceFiles) {
  let errors = 0;
  console.log(`\n📄 Checking code specifications for newly declared files:`);

  for (const [relPath, isNew] of targetFiles.entries()) {
    const isProd = /^(?:src|lib|app)[\\/]/.test(relPath);
    if (isNew && isProd) {
      const escapedRel = relPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const escapedName = path.basename(relPath).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const newFileCodeRegex = new RegExp(
        `(?:${escapedRel}|${escapedName})[\\s\\S]{0,500}?\`\`\`(?:typescript|tsx|javascript|json|html|css)?\\s*\\n([\\s\\S]+?)\\n\`\`\``,
        'i'
      );
      const codeMatch = planContent.match(newFileCodeRegex);
      if (!codeMatch || codeMatch[1].trim().split('\n').length < 3) {
        console.error(`  ❌ MISSING CODE SPEC: New production file '${relPath}' has no code snippet or interface specification in plan!`);
        errors++;
      } else {
        console.log(`  ✔️ Verified code specification for new file: ${relPath}`);
        const newCode = codeMatch[1];
        if (/\breadystate\s*[!=]==?\s*[0-3]\b/i.test(newCode)) {
          console.error(`  ❌ MAGIC NUMBER READYSTATE in new file ${relPath}: Direct comparison to raw number (0/1/2/3). Use WebSocket.OPEN / CONNECTING / CLOSING / CLOSED.`);
          errors++;
        }
        const newShallowWrapperRegex = /(?:async\s+)?(?:public\s+|private\s+|protected\s+)?(?:static\s+)?\w+\s*\([^)]*\)\s*(?::\s*[^{\n]+)?\s*\{\s*(?:return\s+)?this\.[a-zA-Z0-9_$]+\.[a-zA-Z0-9_$]+\([^)]*\);\s*\}/g;
        let sMatch;
        while ((sMatch = newShallowWrapperRegex.exec(newCode)) !== null) {
          console.error(`  ❌ SHALLOW PASS-THROUGH WRAPPER in new file ${relPath}:`);
          console.error(`     ${sMatch[0].replace(/\s+/g, ' ')}`);
          console.error(`     1-line delegation violates deep module principles. Keep logic in parent or let callers consume module directly.`);
          errors++;
        }
        if (/\b(?:from\s+['"]node:|(?:import|require)\s*\(\s*['"]node:)/.test(newCode)) {
          const baseName = path.basename(relPath).replace(/\.[^.]+$/, '');
          const clientFiles = fs.existsSync('src/client') ? findSourceFiles('src/client') : [];
          for (const cPath of clientFiles) {
            const cContent = fs.readFileSync(cPath, 'utf8');
            if (new RegExp(`from\\s+['"][^'"]*\\b${baseName}(?:\\.js)?['"]`).test(cContent)) {
              console.error(`  ❌ CLIENT BUNDLE POISONING: New file '${relPath}' imports Node built-in, but is imported by client file '${path.relative(process.cwd(), cPath)}'!`);
              errors++;
              break;
            }
          }
        }

        // Anti-TIDD Consumer Check for public methods, exported functions & components in new files
        const declaredEntities = new Set();
        const ignoredNames = new Set(['constructor', 'init', 'destroy', 'dispose', 'cleanup', 'render', 'toString', 'valueOf', 'default']);

        // Class methods
        const classBlockRegex = /class\s+[A-Za-z0-9_$]+[^{]*\{([\s\S]*?)\n\s*\}/g;
        let clMatch;
        while ((clMatch = classBlockRegex.exec(newCode)) !== null) {
          const classBody = clMatch[1];
          const methodRegex = /(?:public\s+)?([a-zA-Z0-9_$]+)\s*\([^)]*\)\s*(?::\s*[^{\n]+)?\s*\{/g;
          let mMatch;
          while ((mMatch = methodRegex.exec(classBody)) !== null) {
            declaredEntities.add({ name: mMatch[1], kind: 'Class Method' });
          }
        }

        // Standalone exported functions
        const exportFuncRegex = /export\s+(?:async\s+)?function\s+([a-zA-Z0-9_$]+)\s*[\(<]/g;
        let fMatch;
        while ((fMatch = exportFuncRegex.exec(newCode)) !== null) {
          declaredEntities.add({ name: fMatch[1], kind: 'Exported Function' });
        }

        // Exported components / arrow functions
        const exportConstRegex = /export\s+const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:React\.memo\()?(?:React\.forwardRef\()?(?:async\s+)?(?:\([^)]*\)|[a-zA-Z0-9_$]+)\s*=>/g;
        let cMatch;
        while ((cMatch = exportConstRegex.exec(newCode)) !== null) {
          declaredEntities.add({ name: cMatch[1], kind: 'Exported Component/Function' });
        }

        // Collect all production code in plan
        const otherProductionCodeChunks = [];
        const tempSections = planContent.split(/(?=#{2,4}\s+Task|\*\*Target physical file\*\*|\*\*Target File\*\*)/i);
        for (const tSec of tempSections) {
          const tfMatch = fileTargetRegex.exec(tSec);
          fileTargetRegex.lastIndex = 0;
          if (!tfMatch) continue;
          const targetRel = tfMatch[1].trim().replace(/^[`'\s]+|[`'\s]+$/g, '');
          if (targetRel !== relPath && /^(?:src|lib|app)[\\/]/.test(targetRel)) {
            let snMatch;
            while ((snMatch = snippetRegex.exec(tSec)) !== null) {
              otherProductionCodeChunks.push(snMatch[2]);
            }
            snippetRegex.lastIndex = 0;
            const otherCodeBlockRegex = /```(?:typescript|tsx|javascript|json|html|css)?\s*\n([\s\S]+?)\n```/g;
            let ocMatch;
            while ((ocMatch = otherCodeBlockRegex.exec(tSec)) !== null) {
              otherProductionCodeChunks.push(ocMatch[1]);
            }
            otherProductionCodeChunks.push(tSec);
          }
        }

        const srcFiles = fs.existsSync('src') ? findSourceFiles('src') : [];

        for (const { name: entityName, kind } of declaredEntities) {
          if (ignoredNames.has(entityName) || entityName.startsWith('_')) continue;
          const entityBoundaryRegex = new RegExp(`\\b${entityName}\\b`);

          let calledInOtherPlanFiles = false;
          for (const chunk of otherProductionCodeChunks) {
            if (entityBoundaryRegex.test(chunk)) {
              calledInOtherPlanFiles = true;
              break;
            }
          }

          let foundInExistingSrc = false;
          if (!calledInOtherPlanFiles) {
            for (const sPath of srcFiles) {
              if (sPath.endsWith(path.basename(relPath))) continue;
              if (entityBoundaryRegex.test(fs.readFileSync(sPath, 'utf8'))) {
                foundInExistingSrc = true;
                break;
              }
            }
          }

          const internalOccurrences = (newCode.match(new RegExp(`\\b${entityName}\\b`, 'g')) || []).length;
          const calledInternally = internalOccurrences > 1;

          if (!calledInOtherPlanFiles && !foundInExistingSrc && !calledInternally) {
            console.error(`  ❌ DEAD CODE / ZERO PRODUCTION CONSUMER: ${kind} '${entityName}' in '${relPath}' has no callers in any other production file, plan replacement snippets, or within the module! (Anti-TIDD Rule 8)`);
            errors++;
          }
        }
      }
    }
  }

  return errors;
}

/**
 * Scans drop-in snippets for verbatim match, dirty casts, and SRP violations.
 */
export function auditDropInSnippets(planContent, fileTargetRegex, snippetRegex, fileSnippetsMap, findSourceFiles, auditPlanSnippetHygiene) {
  let errors = 0;
  let checkedSnippets = 0;

  console.log(`\n🧩 Checking drop-in snippets and replacement integrity:`);
  const sections = planContent.split(/(?=#{2,4}\s+Task|\*\*Target physical file\*\*|\*\*Target File\*\*)/i);

  for (const sec of sections) {
    const fMatch = fileTargetRegex.exec(sec);
    fileTargetRegex.lastIndex = 0;
    if (!fMatch) continue;
    const relPath = fMatch[1].trim().replace(/^[`'\s]+|[`'\s]+$/g, '');
    const absPath = path.resolve(process.cwd(), relPath);
    if (!fs.existsSync(absPath)) continue;

    const fileContent = fs.readFileSync(absPath, 'utf8');
    let snipMatch;
    while ((snipMatch = snippetRegex.exec(sec)) !== null) {
      checkedSnippets++;
      const targetChunk = snipMatch[1];
      const replacementChunk = snipMatch[2];
      const normalizedTarget = targetChunk.replace(/\r\n/g, '\n').trim();
      const normalizedFile = fileContent.replace(/\r\n/g, '\n');

      // 2.1 Verbatim match
      if (!normalizedFile.includes(normalizedTarget)) {
        console.error(`  ❌ SNIPPET MISMATCH in ${relPath}:`);
        console.error(`     TargetContent not found verbatim in disk file!`);
        errors++;
      } else {
        const matchCount = normalizedFile.split(normalizedTarget).length - 1;
        if (matchCount > 1) {
          console.warn(`  ⚠️ AMBIGUOUS MATCH in ${relPath}: TargetContent matches ${matchCount} times!`);
        } else {
          console.log(`  ✔️ Verified drop-in snippet for: ${relPath} (Unique match)`);
        }
      }

      // 2.2 Dirty cast check
      if (/\bas\s+any\b|\bas\s+unknown\s+as\b/.test(replacementChunk)) {
        console.error(`  ❌ DIRTY CAST VIOLATION in ${relPath}: Proposed snippet contains forbidden 'as any' or 'as unknown as'!`);
        errors++;
      }

      // 2.3 Magic Number readyState check
      if (/\breadystate\s*[!=]==?\s*[0-3]\b/i.test(replacementChunk)) {
        console.error(`  ❌ MAGIC NUMBER READYSTATE in ${relPath}: Direct comparison to raw number (0/1/2/3). Use WebSocket.OPEN / CONNECTING / CLOSING / CLOSED.`);
        errors++;
      }

      // 2.4 Shallow 1-line pass-through wrapper check
      const shallowWrapperRegex = /(?:async\s+)?(?:public\s+|private\s+|protected\s+)?(?:static\s+)?\w+\s*\([^)]*\)\s*(?::\s*[^{\n]+)?\s*\{\s*(?:return\s+)?this\.[a-zA-Z0-9_$]+\.[a-zA-Z0-9_$]+\([^)]*\);\s*\}/g;
      let shallowMatch;
      while ((shallowMatch = shallowWrapperRegex.exec(replacementChunk)) !== null) {
        console.error(`  ❌ SHALLOW PASS-THROUGH WRAPPER in ${relPath}:`);
        console.error(`     ${shallowMatch[0].replace(/\s+/g, ' ')}`);
        console.error(`     1-line delegation violates deep module principles. Keep logic in parent or let callers consume module directly.`);
        errors++;
      }

      // 2.5 Store State vs Action SRP Separation Guard
      if (/store.*types?\.ts|state.*types?\.ts/i.test(relPath)) {
        if (/INITIAL_GAME_STATE[\s\S]*?(?:set|toggle|dispatch)[A-Z]\w*\s*:/i.test(replacementChunk)) {
          console.error(`  ❌ STATE/ACTION SRP VIOLATION in ${relPath}: Action creator found in INITIAL_GAME_STATE! Plain state data objects must not store actions.`);
          errors++;
        }
        if (/InitialGameState\s*=\s*Pick<[\s\S]*?['"](?:set|toggle|dispatch)[A-Z]\w*['"]/i.test(replacementChunk)) {
          console.error(`  ❌ STATE/ACTION SRP VIOLATION in ${relPath}: Action creator picked in InitialGameState! InitialGameState must only pick serializable data.`);
          errors++;
        }
        if (/(?:activeModifiers|isHeatmapActive|turnTimeRemaining|roundNumber)[\s\S]*?(?:readonly\s+)?(?:set|toggle|dispatch)[A-Z]\w*\s*:\s*\([^)]*\)\s*=>/i.test(replacementChunk)) {
          console.error(`  ❌ STATE/ACTION SRP VIOLATION in ${relPath}: Action creator signature added directly into data properties section of GameState interface! Action creators belong in store actions.`);
          errors++;
        }
      }

      // 2.6 Project-specific spatial baseline guard
      if (/floating_numbers\.tsx/i.test(relPath)) {
        if (/(?:60\.\.275|y\s*=\s*60)/i.test(sec)) {
          console.error(`  ❌ INVALID_HUD_SPATIAL_BASELINE in ${relPath}: Mobile PlayerHudList height is y = 73..461px (4 cards ~376px + TopBar ~66px). Mental math (60..275px) banned.`);
          errors++;
        }
      }

      // 2.7 Anti-Code-Golf & Line Squishing Guard
      if (/(?:get|set)\s+\w+\s*\([^)]*\)\s*\{\s*return\s+[^;]+;\s*\}\s*(?:get|set)\s+\w+/.test(replacementChunk)) {
        console.error(`  ❌ CODE-GOLF VIOLATION in ${relPath}: Multiple getter/setter methods squished onto single line to game LOC budget!`);
        errors++;
      }

      // 2.8 Client Bundle Poisoning Guard
      if (/\b(?:from\s+['"]node:|(?:import|require)\s*\(\s*['"]node:)/.test(replacementChunk)) {
        const baseName = path.basename(relPath).replace(/\.[^.]+$/, '');
        const clientFiles = fs.existsSync('src/client') ? findSourceFiles('src/client') : [];
        for (const cPath of clientFiles) {
          const cContent = fs.readFileSync(cPath, 'utf8');
          if (new RegExp(`from\\s+['"][^'"]*\\b${baseName}(?:\\.js)?['"]`).test(cContent)) {
            console.error(`  ❌ CLIENT BUNDLE POISONING: '${relPath}' imports Node built-in, but is imported by client file '${path.relative(process.cwd(), cPath)}'!`);
            errors++;
            break;
          }
        }
      }

      // 2.9 Snippet Hygiene
      errors += auditPlanSnippetHygiene(relPath, targetChunk, replacementChunk, fileSnippetsMap.get(relPath) || []);
    }
  }

  return { errors, checkedSnippets };
}
