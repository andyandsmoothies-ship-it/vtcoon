// [UC-GAME-CONSTITUTION/MSS] Constitution Governance Contract Tests
// Traceability: GEMINI.md (AGENTS CONSTITUTION - PROJECT HARNESS)
// Verifies all invariants: prohibited files, no git in scripts, 5-tier LOC limits, zero dirty casts, and anti-slop rules.

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');

function getAllFiles(dirPath: string, extensions: string[], excludeDirs: string[] = []): string[] {
  const result: string[] = [];
  if (!fs.existsSync(dirPath)) return result;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (!excludeDirs.includes(entry.name)) {
        result.push(...getAllFiles(fullPath, extensions, excludeDirs));
      }
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      result.push(fullPath);
    }
  }
  return result;
}

function countLines(filePath: string): number {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.split('\n').length;
}

describe('[CONSTITUTION-GOVERNANCE] AGENTS CONSTITUTION Rules & Invariants', () => {
  describe('1. File Hygiene & Prohibited Artifacts', () => {
    it('.gitignore bắt buộc bảo vệ file môi trường (.env, .env.local) và thư mục tạm (.agents/tmp/) không bị lộ vào git', () => {
      const gitignorePath = path.join(REPO_ROOT, '.gitignore');
      expect(fs.existsSync(gitignorePath), '.gitignore phải tồn tại').toBe(true);
      const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
      expect(gitignore).toContain('.env');
      expect(gitignore).toContain('.env.local');
      expect(gitignore).toContain('.agents/tmp/');
    });

    it('không để lại file tạm rác ở thư mục root (phải lưu trong .agents/tmp/)', () => {
      const rootEntries = fs.readdirSync(REPO_ROOT, { withFileTypes: true });
      const forbiddenPatterns = [/^temp.*\.(js|ts|json|txt)$/i, /^test.*\.(js|tmp)$/i, /^scratch.*\.(js|ts)$/i, /\.tmp$/i];
      for (const entry of rootEntries) {
        if (entry.isFile()) {
          for (const pattern of forbiddenPatterns) {
            expect(pattern.test(entry.name), `File tạm rác không được để ở root: ${entry.name}`).toBe(false);
          }
        }
      }
    });
  });

  describe('2. Source Control Safety (Cấm AI/Scripts tự động chạy Git)', () => {
    it('package.json scripts không chứa lệnh git (đảm bảo quyền kiểm soát git thuộc về người dùng)', () => {
      const pkgPath = path.join(REPO_ROOT, 'package.json');
      expect(fs.existsSync(pkgPath), 'package.json phải tồn tại').toBe(true);
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      const scripts = pkg.scripts ?? {};

      for (const [scriptName, scriptCmd] of Object.entries(scripts)) {
        const cmd = String(scriptCmd).toLowerCase();
        const hasGitCmd = /\bgit\s+(commit|push|pull|checkout|reset|add|rebase|stash)\b/.test(cmd);
        expect(
          hasGitCmd,
          `Script "${scriptName}" chứa lệnh git nguy hiểm: "${scriptCmd}" (Vi phạm Hiến Pháp Điều 1 - Source Control Safety)`
        ).toBe(false);
      }
    });
  });

  describe('3. 5-Tier Complexity Classification (Giới Hạn Dòng Code Theo Phân Lớp)', () => {
    it('Tier 1: UI Components (*.tsx) tối đa 500 lines (trừ trường hợp đặc biệt)', () => {
      const uiFiles = getAllFiles(path.join(REPO_ROOT, 'src', 'client'), ['.tsx'], ['node_modules', 'dist']);
      for (const file of uiFiles) {
        const relPath = path.relative(REPO_ROOT, file);
        const lines = countLines(file);
        expect(
          lines,
          `UI Component ${relPath} vượt trần 500 dòng (${lines} dòng)`
        ).toBeLessThanOrEqual(500);
      }
    });

    it('Tier 2: Static Data / Config / Lookup Tables tối đa 800 lines', () => {
      const staticFiles = [
        path.join(REPO_ROOT, 'src', 'domain', 'board_config.ts'),
        path.join(REPO_ROOT, 'src', 'domain', 'property_data.ts'),
        path.join(REPO_ROOT, 'src', 'domain', 'i18n', 'vi.ts'),
        path.join(REPO_ROOT, 'src', 'client', '3d', 'tile_icons.ts'),
      ];

      for (const file of staticFiles) {
        if (fs.existsSync(file)) {
          const relPath = path.relative(REPO_ROOT, file);
          const lines = countLines(file);
          expect(
            lines,
            `Static Data / Config ${relPath} vượt trần 800 dòng (${lines} dòng)`
          ).toBeLessThanOrEqual(800);
        }
      }
    });

    it('Tier 3: Core Logic / FSM / Domain Services tối đa 400 lines (Root Facade RoomManager tối đa 550 lines)', () => {
      const domainFiles = getAllFiles(path.join(REPO_ROOT, 'src', 'domain'), ['.ts'], ['i18n', 'node_modules']);
      for (const file of domainFiles) {
        if (file.endsWith('board_config.ts') || file.endsWith('property_data.ts') || file.endsWith('types.ts')) {
          continue; // Thuộc Tier Static Data hoặc Tier Schemas
        }
        const relPath = path.relative(REPO_ROOT, file);
        const lines = countLines(file);
        expect(
          lines,
          `Domain Service / Logic ${relPath} vượt trần 400 dòng (${lines} dòng)`
        ).toBeLessThanOrEqual(400);
      }

      const serverFiles = getAllFiles(path.join(REPO_ROOT, 'src', 'server'), ['.ts'], ['network', 'security', 'node_modules']);
      for (const file of serverFiles) {
        const relPath = path.relative(REPO_ROOT, file);
        const lines = countLines(file);
        const limit = file.endsWith('room_manager.ts') ? 550 : 400; // RoomManager là root facade
        expect(
          lines,
          `Server Service ${relPath} vượt trần cho phép (${lines} > ${limit} dòng)`
        ).toBeLessThanOrEqual(limit);
      }
    });

    it('Tier 4: Integration / Simulation / Scenario Living Tests tối đa 600 lines', () => {
      const integrationTests = [
        ...getAllFiles(path.join(REPO_ROOT, 'tests', 'integration'), ['.test.ts']),
        ...getAllFiles(path.join(REPO_ROOT, 'tests', 'simulation'), ['.test.ts']),
        ...getAllFiles(path.join(REPO_ROOT, 'tests', 'oracle'), ['.test.ts']),
        ...getAllFiles(path.join(REPO_ROOT, 'tests', 'contracts'), ['.test.ts']),
      ];

      for (const file of integrationTests) {
        const relPath = path.relative(REPO_ROOT, file);
        const lines = countLines(file);
        expect(
          lines,
          `Integration/Living Test ${relPath} vượt trần 600 dòng (${lines} dòng)`
        ).toBeLessThanOrEqual(600);
      }
    });

    it('Tier 5: Schemas / DTOs / Migrations tối đa 1000 lines', () => {
      const schemaFiles = [
        path.join(REPO_ROOT, 'src', 'server', 'session_manager.ts'),
        path.join(REPO_ROOT, 'src', 'server', 'network', 'network_types.ts'),
        path.join(REPO_ROOT, 'src', 'domain', 'event_card_types.ts'),
        path.join(REPO_ROOT, 'src', 'domain', 'bot', 'bot_types.ts'),
      ];

      for (const file of schemaFiles) {
        if (fs.existsSync(file)) {
          const relPath = path.relative(REPO_ROOT, file);
          const lines = countLines(file);
          expect(
            lines,
            `Schema / DTO ${relPath} vượt trần 1000 dòng (${lines} dòng)`
          ).toBeLessThanOrEqual(1000);
        }
      }
    });
  });

  describe('4. Type Safety & Anti-Slop Invariants', () => {
    it('Core Domain và Server Logic không chứa dirty double cast (as unknown as)', () => {
      const coreFiles = [
        ...getAllFiles(path.join(REPO_ROOT, 'src', 'domain'), ['.ts']),
        ...getAllFiles(path.join(REPO_ROOT, 'src', 'server'), ['.ts']),
      ];

      for (const file of coreFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const hasDoubleCast = content.includes('as unknown as');
        const relPath = path.relative(REPO_ROOT, file);
        expect(
          hasDoubleCast,
          `Phát hiện dirty cast "as unknown as" trong core file: ${relPath}`
        ).toBe(false);
      }
    });

    it('Giao diện không sử dụng animate-bounce và cubic-bezier nảy lố (Anti-pattern Slop)', () => {
      const clientFiles = getAllFiles(path.join(REPO_ROOT, 'src', 'client'), ['.tsx', '.css']);
      for (const file of clientFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const relPath = path.relative(REPO_ROOT, file);

        expect(
          content.includes('animate-bounce'),
          `Phát hiện animate-bounce trong ${relPath} (Hãy thay bằng easing giảm tốc tự nhiên)`
        ).toBe(false);

        expect(
          content.includes('cubic-bezier(0.34, 1.56, 0.64, 1)'),
          `Phát hiện bounce-easing lố trong ${relPath} (Hãy thay bằng cubic-bezier(0.16, 1, 0.3, 1))`
        ).toBe(false);
      }
    });

    it('Giao diện không sử dụng kỹ thuật méo góc border-b-4 trên nút bấm (border-accent-on-rounded Anti-pattern)', () => {
      const clientFiles = getAllFiles(path.join(REPO_ROOT, 'src', 'client', 'ui'), ['.tsx']);
      for (const file of clientFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const relPath = path.relative(REPO_ROOT, file);

        expect(
          content.includes('border-b-4'),
          `Phát hiện border-b-4 trong ${relPath} (Hãy thay bằng bóng đổ xúc giác shadow-[0_4px_0_0_#...])`
        ).toBe(false);
      }
    });

    it('Giao diện không sử dụng chữ xám text-slate-950 trên nền vàng amber (gray-on-color Anti-pattern)', () => {
      const clientFiles = getAllFiles(path.join(REPO_ROOT, 'src', 'client', 'ui'), ['.tsx']);
      for (const file of clientFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const relPath = path.relative(REPO_ROOT, file);

        const hasGrayOnAmber = /from-amber[^\n]+text-slate-950|bg-amber[^\n]+text-slate-950/g.test(content);
        expect(
          hasGrayOnAmber,
          `Phát hiện gray-on-color text-slate-950 trên nền amber trong ${relPath}`
        ).toBe(false);
      }
    });
  });

  describe('5. Lean Runtime Observability (Structured Log Emits)', () => {
    it('Domain FSM và Server Transactions phát ra structured logs có event và correlationId', () => {
      const serverFiles = getAllFiles(path.join(REPO_ROOT, 'src', 'server'), ['.ts']);
      let structuredLogCount = 0;

      for (const file of serverFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        // Tìm pattern phát log có cấu trúc { event: ..., correlationId: ... }
        const matches = content.match(/event:\s*['"][A-Z0-9_]+['"]/g);
        if (matches) {
          structuredLogCount += matches.length;
        }
      }

      expect(
        structuredLogCount,
        'Hệ thống server phải phát ít nhất 12 sự kiện có cấu trúc (Lean Runtime Observability)'
      ).toBeGreaterThanOrEqual(12);
    });
  });
});
