// [TC-OPS02/MSS] Test Suite Slice OPS-02: Bundle Optimization & Performance Verification
import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execSync } from 'node:child_process';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { calculateStandeeElevation } from '../../src/client/3d/board_tile';
import { HOSE_OUTCOMES } from '../../src/domain/event_card_types';
import { useGameStore } from '../../src/client/store/game_store';
import { GameCanvas } from '../../src/client/main';
import { HoseModal } from '../../src/client/ui/modals/hose_modal';
import { InsolvencyBanner } from '../../src/client/ui/modals/insolvency_banner';
import { ModalHost } from '../../src/client/ui/modals/modal_host';

describe('[TC-OPS02.1/MSS] Kiem Tra Kich Thuoc Bundle & Manual Chunks (< 500KB Gzip)', () => {
  const distAssetsDir = path.resolve(process.cwd(), 'dist', 'assets');

  beforeAll(() => {
    if (!fs.existsSync(distAssetsDir) || fs.readdirSync(distAssetsDir).length === 0) {
      execSync('npm run build', { stdio: 'pipe' });
    }
  });

  it('Thu muc dist/assets ton tai sau khi build', () => {
    expect(fs.existsSync(distAssetsDir)).toBe(true);
  });

  it('Tat ca cac file chunk JS trong dist/assets/ deu co dung luong < 500KB (gzip)', () => {
    const files = fs.readdirSync(distAssetsDir);
    const jsFiles = files.filter((f) => f.endsWith('.js'));
    expect(jsFiles.length).toBeGreaterThan(0);

    for (const file of jsFiles) {
      const filePath = path.join(distAssetsDir, file);
      const content = fs.readFileSync(filePath);
      const gzipped = zlib.gzipSync(content);
      const gzipSizeKB = gzipped.length / 1024;

      // Moi chunk phai < 500KB gzip (NFR-PERF-002)
      expect(gzipSizeKB).toBeLessThan(500);
    }
  });

  it('Phan tach day du 4 vendor chunks lon: react, three, r3f, audio', () => {
    const files = fs.readdirSync(distAssetsDir);
    const jsFiles = files.filter((f) => f.endsWith('.js'));

    const hasVendorReact = jsFiles.some((f) => f.startsWith('vendor-react-'));
    const hasVendorThree = jsFiles.some((f) => f.startsWith('vendor-three-'));
    const hasVendorR3f = jsFiles.some((f) => f.startsWith('vendor-r3f-'));
    const hasVendorAudio = jsFiles.some((f) => f.startsWith('vendor-audio-'));

    expect(hasVendorReact).toBe(true);
    expect(hasVendorThree).toBe(true);
    expect(hasVendorR3f).toBe(true);
    expect(hasVendorAudio).toBe(true);
  });

  it('GameCanvas duoc tach thanh chunk rieng biet (code-splitting)', () => {
    const files = fs.readdirSync(distAssetsDir);
    const hasGameCanvasChunk = files.some((f) => f.startsWith('game_canvas-') && f.endsWith('.js'));
    expect(hasGameCanvasChunk).toBe(true);
  });

  it('[Adversarial] Khong co bat ky chunk nao vuot nguong 500KB gzip', () => {
    const files = fs.readdirSync(distAssetsDir);
    const jsFiles = files.filter((f) => f.endsWith('.js'));
    const oversized = jsFiles.filter((f) => {
      const content = fs.readFileSync(path.join(distAssetsDir, f));
      return zlib.gzipSync(content).length >= 500 * 1024;
    });
    expect(oversized).toHaveLength(0);
  });
});

describe('[TC-OPS02.2/MSS] Lazy-load GameCanvas & Suspense Integration', () => {
  it('GameCanvas duoc boc qua React.lazy (Lazy Component)', () => {
    expect(GameCanvas).toBeDefined();
    const lazySymbol = Symbol.for('react.lazy');
    const isLazy =
      typeof GameCanvas === 'object' &&
      GameCanvas !== null &&
      '$$typeof' in GameCanvas &&
      (GameCanvas as { $$typeof: unknown }).$$typeof === lazySymbol;
    expect(isLazy).toBe(true);
  });

  it('main.tsx su dung Suspense, dynamic import va role="status" fallback', () => {
    const mainPath = path.resolve(process.cwd(), 'src', 'client', 'main.tsx');
    const content = fs.readFileSync(mainPath, 'utf-8');

    expect(content).not.toMatch(/import\s+\{\s*GameCanvas\s*\}\s+from\s+['"]\.\/game_canvas['"]/);
    expect(content).toMatch(/lazy\s*\(\s*\(\)\s*=>\s*import\s*\(\s*['"]\.\/game_canvas['"]\s*\)/);
    expect(content).toContain('<Suspense');
    expect(content).toContain('<GameCanvas />');
    expect(content).toContain('role="status"');
    expect(content).toContain('aria-live="polite"');
  });
});

describe('[TC-OPS02.3/MSS] Logic Toan Hoc Hoat Anh sin(wt) & Business Modals', () => {
  beforeEach(() => {
    useGameStore.getState().closeModal();
  });

  describe('Hoat anh dieu hoa sin(wt) Standee (DEBT-UI01-02)', () => {
    it('Gia tri tai t=0 voi phase=0 bang baseHeight', () => {
      const y = calculateStandeeElevation(0, { omega: 2, amplitude: 0.04, baseHeight: 0.72, phase: 0 });
      expect(y).toBeCloseTo(0.72, 5);
    });

    it('Diem cuc dai tai t = pi / (2 * omega) dat baseHeight + amplitude', () => {
      const omega = 2;
      const tPeak = Math.PI / (2 * omega);
      const yPeak = calculateStandeeElevation(tPeak, { omega, amplitude: 0.04, baseHeight: 0.72, phase: 0 });
      expect(yPeak).toBeCloseTo(0.76, 5);
    });

    it('Diem cuc tieu tai t = 3 * pi / (2 * omega) dat baseHeight - amplitude', () => {
      const omega = 2;
      const tTrough = (3 * Math.PI) / (2 * omega);
      const yTrough = calculateStandeeElevation(tTrough, { omega, amplitude: 0.04, baseHeight: 0.72, phase: 0 });
      expect(yTrough).toBeCloseTo(0.68, 5);
    });

    it('Chu ky tuan hoan T = 2 * pi / omega', () => {
      const omega = 2.5;
      const period = (2 * Math.PI) / omega;
      const y0 = calculateStandeeElevation(1.23, { omega, amplitude: 0.05, baseHeight: 0.70 });
      const yNext = calculateStandeeElevation(1.23 + period, { omega, amplitude: 0.05, baseHeight: 0.70 });
      expect(y0).toBeCloseTo(yNext, 5);
    });

    it('Do lech pha (phase) dich chuyen do thi chuan xac', () => {
      const yWithPhase = calculateStandeeElevation(0, { omega: 2, amplitude: 0.04, baseHeight: 0.72, phase: Math.PI / 2 });
      expect(yWithPhase).toBeCloseTo(0.76, 5);
    });

    it('Van toc bien doi em diu tai 60 FPS (delta y <= omega * A * delta t)', () => {
      const omega = 2.0;
      const amp = 0.04;
      const dt = 1 / 60;
      for (let i = 0; i < 60; i++) {
        const t1 = i * dt;
        const t2 = (i + 1) * dt;
        const y1 = calculateStandeeElevation(t1, { omega, amplitude: amp, baseHeight: 0.72 });
        const y2 = calculateStandeeElevation(t2, { omega, amplitude: amp, baseHeight: 0.72 });
        const dy = Math.abs(y2 - y1);
        expect(dy).toBeLessThanOrEqual(omega * amp * dt + 1e-6);
      }
    });

    it('[Adversarial] 1000 mau thoi gian ngau nhien luon nam trong khoang [0.68, 0.76]', () => {
      for (let i = 0; i < 1000; i++) {
        const randomTime = Math.random() * 1000;
        const y = calculateStandeeElevation(randomTime, { omega: 2, amplitude: 0.04, baseHeight: 0.72, phase: i * 0.1 });
        expect(y).toBeGreaterThanOrEqual(0.68 - 1e-6);
        expect(y).toBeLessThanOrEqual(0.76 + 1e-6);
      }
    });

    it('[Adversarial] Thoi gian phi so (NaN, Infinity) tu dong fallback ve baseHeight an toan', () => {
      expect(calculateStandeeElevation(Number.NaN, { baseHeight: 0.72 })).toBe(0.72);
      expect(calculateStandeeElevation(Number.POSITIVE_INFINITY, { baseHeight: 0.72 })).toBe(0.72);
    });
  });

  describe('Modal San Chung Khoan HOSE (UC-GAME-045)', () => {
    it('Render DOM markup: day du dialog, ty le 1D6 SSOT va 4 han muc cuoc', () => {
      const html = renderToStaticMarkup(
        React.createElement(HoseModal, { myBalance: 15000, onInvest: () => {}, onSkip: () => {}, onClose: () => {} })
      );
      expect(html).toContain('role="dialog"');
      expect(html).toContain('SÀN CHỨNG KHOÁN HOSE');
      expect(html).toContain('500 Tr.');
      expect(html).toContain('1.000 Tr.');
      expect(html).toContain('2.000 Tr.');
      expect(html).toContain('3.000 Tr.');
      expect(html).toContain('15.000 Tr.');
      for (const [face, mult] of Object.entries(HOSE_OUTCOMES)) {
        expect(html).toContain(`Mặt ${face}`);
        expect(html).toContain(`${mult.toFixed(2)}x`);
      }
    });

    it('Hien thi ket qua van truoc voi tien thu ve duoc format chuan', () => {
      const html = renderToStaticMarkup(
        React.createElement(HoseModal, { myBalance: 15000, lastDiceRoll: 5, lastPayout: 1500, onInvest: () => {}, onSkip: () => {}, onClose: () => {} })
      );
      expect(html).toContain('Điểm xúc xắc 1D6: <strong class="text-amber-400">5</strong>');
      expect(html).toContain('Tiền thu về: 1.500 Tr.');
    });

    it('[Adversarial] So du khong du (balance < stake): nut cuoc va nut preset bi disabled', () => {
      const html = renderToStaticMarkup(
        React.createElement(HoseModal, { myBalance: 400, onInvest: () => {}, onSkip: () => {}, onClose: () => {} })
      );
      expect(html).toContain('disabled=""');
      expect(html).toContain('400 Tr.');
    });

    it('Dong mo Modal HOSE qua GameStore', () => {
      const store = useGameStore.getState();
      expect(store.activeModal).toBeNull();
      store.openModal('hose', { currentStake: 2000, lastDiceRoll: 5, lastPayout: 3000 });
      expect(useGameStore.getState().activeModal).toBe('hose');
      store.closeModal();
      expect(useGameStore.getState().activeModal).toBeNull();
    });
  });

  describe('Banner Canh Bao Thanh Ly Cuong Che (UC-GAME-055)', () => {
    it('Render DOM markup: role alert, thong tin no tham hut va huong dan', () => {
      const html = renderToStaticMarkup(
        React.createElement(InsolvencyBanner, {
          playerId: 'p2',
          playerName: 'Nguyễn Văn A',
          deficit: 1200,
          onManageProperties: () => {},
          onDeclareBankruptcy: () => {},
        })
      );
      expect(html).toContain('role="alert"');
      expect(html).toContain('Thanh Lý Cưỡng Chế');
      expect(html).toContain('Nguyễn Văn A');
      expect(html).toContain('-1.200 Tr.');
      expect(html).toContain('Quản Lý BĐS / Thế Chấp');
      expect(html).toContain('Tuyên Bố Phá Sản (Rời Bàn)');
    });

    it('[Adversarial] Tham hut 0 hoac NaN khong hien thi -0 Tr.', () => {
      const htmlZero = renderToStaticMarkup(
        React.createElement(InsolvencyBanner, { playerId: 'p1', deficit: 0 })
      );
      expect(htmlZero).toContain('0 Tr.');
      expect(htmlZero).not.toContain('-0 Tr.');

      const htmlNaN = renderToStaticMarkup(
        React.createElement(InsolvencyBanner, { playerId: 'p1', deficit: Number.NaN })
      );
      expect(htmlNaN).toContain('0 Tr.');
      expect(htmlNaN).not.toContain('NaN');
    });

    it('Dong mo Banner Insolvency qua GameStore', () => {
      const store = useGameStore.getState();
      store.openModal('insolvency', { playerId: 'p2', deficit: 1200 });
      expect(useGameStore.getState().activeModal).toBe('insolvency');
      store.closeModal();
      expect(useGameStore.getState().activeModal).toBeNull();
    });
  });

  describe('ModalHost Switchboard Router', () => {
    it('Render null khi khong co modal nao duoc mo', () => {
      const html = renderToStaticMarkup(React.createElement(ModalHost, { activeModal: null, modalPayload: null }));
      expect(html).toBe('');
    });

    it('Dinh tuyen render dung HoseModal khi activeModal la hose', () => {
      const html = renderToStaticMarkup(
        React.createElement(ModalHost, {
          activeModal: 'hose',
          modalPayload: { currentStake: 1000 },
        })
      );
      expect(html).toContain('role="dialog"');
      expect(html).toContain('SÀN CHỨNG KHOÁN HOSE');
    });

    it('Dinh tuyen render dung InsolvencyBanner khi activeModal la insolvency', () => {
      const html = renderToStaticMarkup(
        React.createElement(ModalHost, {
          activeModal: 'insolvency',
          modalPayload: { playerId: 'p1', deficit: 800 },
        })
      );
      expect(html).toContain('role="alert"');
      expect(html).toContain('Thanh Lý Cưỡng Chế');
    });
  });
});
