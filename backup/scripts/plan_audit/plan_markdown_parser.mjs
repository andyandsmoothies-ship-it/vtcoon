import fs from 'node:fs';
import path from 'node:path';

/**
 * Recursively locates all TypeScript/JavaScript source files in a directory.
 */
export function findSourceFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findSourceFiles(full));
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Checks for ticket ID collisions in .agents/plans/.
 */
export function checkTicketCollision(planBasename, plansDir) {
  const currentTicketMatch = planBasename.match(/PLAN_([A-Z0-9]+(?:[-_][A-Z0-9]+)?)/i);
  if (currentTicketMatch && fs.existsSync(plansDir)) {
    const currentTicketId = currentTicketMatch[1].replace(/_/g, '-').toUpperCase();
    const collidingPlans = fs.readdirSync(plansDir).filter((f) => {
      if (f === planBasename || !f.startsWith('PLAN_') || !f.endsWith('.md')) return false;
      const match = f.match(/PLAN_([A-Z0-9]+(?:[-_][A-Z0-9]+)?)/i);
      if (!match) return false;
      const otherTicketId = match[1].replace(/_/g, '-').toUpperCase();
      return otherTicketId === currentTicketId;
    });

    if (collidingPlans.length > 0) {
      console.warn(`⚠️  [TICKET COLLISION WARNING] Ticket ID '${currentTicketId}' is already used by another plan in .agents/plans/:`);
      for (const cp of collidingPlans) {
        console.warn(`   - ${cp}`);
      }
      console.warn(`   Ensure this is intentional, or suffix the new ticket (e.g. ${currentTicketId}B) to avoid ambiguity.\n`);
    }
  }
}

/**
 * Parses target files declared in the plan markdown.
 */
export function parseTargetFiles(planContent, fileTargetRegex) {
  const targetFiles = new Map();
  let fileMatch;
  while ((fileMatch = fileTargetRegex.exec(planContent)) !== null) {
    const filePath = fileMatch[1].trim().replace(/^[`'\s]+|[`'\s]+$/g, '');
    const trailingText = (fileMatch[2] || '').toLowerCase();
    const isNew = trailingText.includes('new') || trailingText.includes('create') || trailingText.includes('mới');
    targetFiles.set(filePath, isNew);
  }
  return targetFiles;
}

/**
 * Pre-scans all replacement snippets per file to compute physical LOC deltas.
 */
export function parseFileSnippets(planContent, fileTargetRegex, snippetRegex) {
  const fileSnippetsMap = new Map();
  const snippetDeltaByFile = new Map();
  const preSections = planContent.split(/(?=#{2,4}\s+Task|\*\*Target physical file\*\*|\*\*Target File\*\*)/i);

  for (const sec of preSections) {
    const fMatch = fileTargetRegex.exec(sec);
    fileTargetRegex.lastIndex = 0;
    if (!fMatch) continue;
    const relPath = fMatch[1].trim().replace(/^[`'\s]+|[`'\s]+$/g, '');
    if (!fileSnippetsMap.has(relPath)) fileSnippetsMap.set(relPath, []);
    let snipMatch;
    while ((snipMatch = snippetRegex.exec(sec)) !== null) {
      const targetChunk = snipMatch[1];
      const replacementChunk = snipMatch[2];
      fileSnippetsMap.get(relPath).push(replacementChunk);
      const targetLines = targetChunk.replace(/\r\n/g, '\n').split('\n').length;
      const repLines = replacementChunk.replace(/\r\n/g, '\n').split('\n').length;
      const delta = repLines - targetLines;
      snippetDeltaByFile.set(relPath, (snippetDeltaByFile.get(relPath) || 0) + delta);
    }
    snippetRegex.lastIndex = 0;
  }

  return { fileSnippetsMap, snippetDeltaByFile };
}

/**
 * Extracts test specification lines from the plan markdown.
 */
export function extractTestLines(planContent) {
  const testSectionHeaderRegex = /(?:^|\n)#{1,4}\s+[^\n]*?(?:Station 1|QA|KIỂM THỬ|CONTRACT TEST|TEST SPEC)[^\n]*\n([\s\S]*?)(?=\n#{1,2}\s+[^\n]+|\n===\s+|$)/gi;
  let testLines = [];
  let tMatch;
  while ((tMatch = testSectionHeaderRegex.exec(planContent)) !== null) {
    const secLines = tMatch[1].split('\n').filter((l) => /^\s*(?:[-*]|\d+\.)\s*.*?\bTC-[0-9A-Z_.]+/i.test(l));
    testLines.push(...secLines);
  }

  // Fallback: search entire plan for list items with TC-
  if (testLines.length === 0) {
    testLines = planContent.split('\n').filter((l) => /^\s*(?:[-*]|\d+\.)\s*.*?\bTC-[0-9A-Z_.]+/i.test(l));
  }

  return testLines;
}
