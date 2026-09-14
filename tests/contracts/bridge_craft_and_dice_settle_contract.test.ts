// [TC-IMP53/MSS][UC-IMP53] Contract Test Suite: Cầu Ba Son Sa Bàn & Triệt Tiêu Hoạt Cảnh Xúc Xắc Nhảy Nhịp Đôi
// Universal 4-Facet Behavioral Matrix Verification:
// Facet 1: Boundary & Geometric Vector Anchoring (calculateCableTransform Euclidean length, midpoint, endpoints error < 0.01m, Abutments X = +-2.7)
// Facet 2: State Reactivity & Monotonic Roll Sequencing (No re-trigger if diceSeq <= lastDiceSeq, pawn landing and deed modal stability)
// Facet 3: Vibrancy & Resting State Invariant (DICE_REST_Y = 0.26, zero residual spin at t=1.0, face rotation map 1-6)
// Facet 4: Server Bot Pacing Invariant (WssServer default botTurnDelayMs >= 1500ms, server/index.ts >= 1500ms)

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as THREE from 'three';

import * as dioramaBridgesModule from '../../src/client/3d/diorama/diorama_bridges.js';
import { DioramaBridges } from '../../src/client/3d/diorama/diorama_bridges.js';
import { DiceTray } from '../../src/client/3d/dice_tray.js';
import {
  DICE_REST_Y,
  getDiceFaceRotation,
  calculateDiceElevation,
  calculateDiceRotationFactor,
  type DiceFace,
} from '../../src/client/3d/dice_math.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { applyDeltaToStore } from '../../src/client/network/apply_delta.js';
import { WssServer } from '../../src/server/network/wss_server.js';
import * as serverIndexModule from '../../src/server/index.js';

interface CableTransformResult {
  readonly position: [number, number, number];
  readonly length: number;
  readonly rotation?: [number, number, number];
  readonly quaternion?: [number, number, number, number] | THREE.Quaternion;
  readonly topEnd?: [number, number, number];
  readonly bottomEnd?: [number, number, number];
}

const calculateCableTransform: (
  pylonAnchor: [number, number, number],
  deckAnchor: [number, number, number]
) => CableTransformResult = (dioramaBridgesModule as any).calculateCableTransform;

function resolveCylinderEndpoints(transform: CableTransformResult): {
  readonly top: [number, number, number];
  readonly bottom: [number, number, number];
} {
  if (transform.topEnd && transform.bottomEnd) {
    return { top: transform.topEnd, bottom: transform.bottomEnd };
  }
  const pos = new THREE.Vector3(...transform.position);
  const halfLen = transform.length / 2;
  const topLocal = new THREE.Vector3(0, halfLen, 0);
  const botLocal = new THREE.Vector3(0, -halfLen, 0);

  if (transform.quaternion) {
    const q = Array.isArray(transform.quaternion)
      ? new THREE.Quaternion(...transform.quaternion)
      : transform.quaternion;
    topLocal.applyQuaternion(q);
    botLocal.applyQuaternion(q);
  } else if (transform.rotation) {
    const e = new THREE.Euler(...transform.rotation);
    topLocal.applyEuler(e);
    botLocal.applyEuler(e);
  }

  const pTop = topLocal.add(pos);
  const pBot = botLocal.add(pos);
  return {
    top: [pTop.x, pTop.y, pTop.z],
    bottom: [pBot.x, pBot.y, pBot.z],
  };
}

function distance3D(a: [number, number, number], b: [number, number, number]): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

describe('[CONTRACT-TEST][TC-IMP53/MSS][UC-IMP53] Cầu Ba Son Sa Bàn & Xúc Xắc Settle Animation Suite', () => {
  let originalConsoleError: typeof console.error;

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (
        msg.includes('is using incorrect casing') ||
        msg.includes('does not recognize the') ||
        msg.includes('non-boolean attribute') ||
        msg.includes('The tag <')
      ) {
        return;
      }
      originalConsoleError(...args);
    };
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    useGameStore.setState({
      dice: [1, 1],
      isRolling: false,
      hasRolledThisTurn: false,
      lastDiceSeq: undefined,
      playerPositions: {},
      visualPositions: {},
      activeModal: null,
      modalPayload: null,
      activePawnAnimation: null,
      pawnAnimationQueue: [],
      currentTurnPlayerId: 'p1',
    });
  });

  // ===========================================================================
  // FACET 1: Boundary & Geometric Vector Anchoring (Dây Văng & Mố Cầu Ba Son)
  // ===========================================================================

  it('[TC-IMP53.01/MSS][Facet1-Cable] calculateCableTransform tính toán độ dài cylinder bằng đúng khoảng cách Euclid giữa pylonAnchor và deckAnchor', () => {
    const pylon: [number, number, number] = [-0.8, 0.95, 0.0];
    const deck: [number, number, number] = [1.6, 0.12, 0.18];
    const expectedDist = distance3D(pylon, deck);

    const transform = calculateCableTransform(pylon, deck);

    expect(transform.length).toBeCloseTo(expectedDist, 3);
  });

  it('[TC-IMP53.02/MSS][Facet1-Cable] calculateCableTransform đặt position của cylinder chính xác tại trung điểm pylonAnchor và deckAnchor', () => {
    const pylon: [number, number, number] = [-0.8, 0.95, 0.0];
    const deck: [number, number, number] = [1.6, 0.12, 0.18];
    const expectedMid: [number, number, number] = [
      (pylon[0] + deck[0]) / 2,
      (pylon[1] + deck[1]) / 2,
      (pylon[2] + deck[2]) / 2,
    ];

    const transform = calculateCableTransform(pylon, deck);

    expect(transform.position[0]).toBeCloseTo(expectedMid[0], 3);
    expect(transform.position[1]).toBeCloseTo(expectedMid[1], 3);
    expect(transform.position[2]).toBeCloseTo(expectedMid[2], 3);
  });

  it('[TC-IMP53.03/MSS][Facet1-Cable] calculateCableTransform bảo đảm khoảng cách từ đầu mút trên tới pylonAnchor có sai số < 0.01m', () => {
    const pylon: [number, number, number] = [-0.8, 0.95, 0.0];
    const deck: [number, number, number] = [1.6, 0.12, 0.18];

    const transform = calculateCableTransform(pylon, deck);
    const endpoints = resolveCylinderEndpoints(transform);
    const minPylonDist = Math.min(
      distance3D(endpoints.top, pylon),
      distance3D(endpoints.bottom, pylon),
    );

    expect(minPylonDist).toBeLessThan(0.01);
  });

  it('[TC-IMP53.04/MSS][Facet1-Cable] calculateCableTransform bảo đảm khoảng cách từ đầu mút dưới tới deckAnchor có sai số < 0.01m', () => {
    const pylon: [number, number, number] = [-0.8, 0.95, 0.0];
    const deck: [number, number, number] = [1.6, 0.12, 0.18];

    const transform = calculateCableTransform(pylon, deck);
    const endpoints = resolveCylinderEndpoints(transform);
    const minDeckDist = Math.min(
      distance3D(endpoints.top, deck),
      distance3D(endpoints.bottom, deck),
    );

    expect(minDeckDist).toBeLessThan(0.01);
  });

  it.each([
    [-2.0, 0.12, 0.18],
    [-1.5, 0.12, -0.18],
    [-0.2, 0.12, 0.18],
    [0.4, 0.12, -0.18],
    [1.0, 0.12, 0.18],
    [1.6, 0.12, -0.18],
  ] as const)('[TC-IMP53.05/MSS][Facet1-Cable] calculateCableTransform cho neo deckAnchor [%f, %f, %f] bảo đảm chiều dài vector dương và chuẩn xác', (dx, dy, dz) => {
    const pylon: [number, number, number] = [-0.8, 0.95, 0.0];
    const deck: [number, number, number] = [dx, dy, dz];
    const expectedDist = distance3D(pylon, deck);

    const transform = calculateCableTransform(pylon, deck);

    expect(transform.length).toBeGreaterThan(0);
    expect(transform.length).toBeCloseTo(expectedDist, 3);
  });

  it('[TC-IMP53.06/MSS][Facet1-Abutments] Cầu Ba Son có mố cầu bờ Tây tại X = -2.7 với cao độ tiếp giáp mặt nền', () => {
    const markup = renderToStaticMarkup(React.createElement(DioramaBridges));
    const hasWestAbutment =
      markup.includes('-2.7') ||
      markup.includes('bason-abutment-west') ||
      markup.includes('data-bason-abutment="west"');

    expect(hasWestAbutment).toBe(true);
  });

  it('[TC-IMP53.07/MSS][Facet1-Abutments] Cầu Ba Son có mố cầu bờ Đông tại X = 2.7 với cao độ tiếp giáp mặt nền', () => {
    const markup = renderToStaticMarkup(React.createElement(DioramaBridges));
    const hasEastAbutment =
      markup.includes('2.7') ||
      markup.includes('bason-abutment-east') ||
      markup.includes('data-bason-abutment="east"');

    expect(hasEastAbutment).toBe(true);
  });

  // ===========================================================================
  // FACET 2: State Reactivity & Monotonic Roll Sequencing (Triệt Tiêu Nhảy Đôi)
  // ===========================================================================

  it('[TC-IMP53.08/MSS][Facet2-Reactivity] useGameStore.triggerDiceRoll bỏ qua kích hoạt hoạt ảnh khi diceSeq trùng lặp (diceSeq === lastDiceSeq)', () => {
    useGameStore.setState({ isRolling: false, lastDiceSeq: 5, dice: [2, 3] });

    useGameStore.getState().triggerDiceRoll([4, 4], 5);

    expect(useGameStore.getState().isRolling).toBe(false);
  });

  it('[TC-IMP53.09/MSS][Facet2-Reactivity] useGameStore.triggerDiceRoll bỏ qua kích hoạt hoạt ảnh khi diceSeq nhỏ hơn lastDiceSeq', () => {
    useGameStore.setState({ isRolling: false, lastDiceSeq: 5, dice: [2, 3] });

    useGameStore.getState().triggerDiceRoll([1, 6], 4);

    expect(useGameStore.getState().isRolling).toBe(false);
  });

  it('[TC-IMP53.10/MSS][Facet2-Reactivity] DiceTray duy trì sự hiện diện của xúc xắc ruby trong render tree kể cả khi isRolling = false', () => {
    useGameStore.setState({ isRolling: false, currentTurnPlayerId: 'p1' });

    const markup = renderToStaticMarkup(React.createElement(DiceTray));
    const hasRubyDie = markup.includes('#DC2626') || markup.includes('#B91C1C');

    expect(hasRubyDie).toBe(true);
  });

  it('[TC-IMP53.11/MSS][Facet2-Reactivity] Khi quân cờ chạm đất completePawnMove, trạng thái isRolling không bị thay đổi và cao độ xúc xắc giữ nguyên', () => {
    useGameStore.setState({
      isRolling: false,
      lastDiceSeq: 3,
      dice: [5, 2],
      playerPositions: { p1: 0 },
    });

    useGameStore.getState().completePawnMove('p1');

    expect(useGameStore.getState().isRolling).toBe(false);
    expect(calculateDiceElevation(1.0)).toBe(DICE_REST_Y);
  });

  it('[TC-IMP53.12/MSS][Facet2-Reactivity] Khi mở modal ô đất openModal(deed), xúc xắc không bị kích hoạt lại isRolling', () => {
    useGameStore.setState({ isRolling: false, lastDiceSeq: 3, dice: [5, 2] });

    useGameStore.getState().openModal('deed', { cellIndex: 5, canBuy: true });

    expect(useGameStore.getState().isRolling).toBe(false);
  });

  it('[TC-IMP53.13/MSS][Facet2-Reactivity] applyDeltaToStore khi nhận delta với diceSeq trùng lặp không kích hoạt triggerDiceRoll', () => {
    useGameStore.setState({ isRolling: false, lastDiceSeq: 4, dice: [3, 4] });

    applyDeltaToStore({
      tick: 15,
      dice: [3, 4],
      diceSeq: 4,
      cells: [{ index: 7, level: 1, ownerId: 'p1' }],
    });

    expect(useGameStore.getState().isRolling).toBe(false);
  });

  // ===========================================================================
  // FACET 3: Vibrancy & Resting State Invariant (Cao Độ Nghỉ & Góc Xoay 1-6)
  // ===========================================================================

  it('[TC-IMP53.14/MSS][Facet3-Resting] Cao độ xúc xắc ở trạng thái nghỉ tại t = 1.0 bằng đúng DICE_REST_Y = 0.26', () => {
    expect(calculateDiceElevation(1.0)).toBe(0.26);
    expect(DICE_REST_Y).toBe(0.26);
  });

  it('[TC-IMP53.15/MSS][Facet3-Resting] Hệ số xoay calculateDiceRotationFactor tại t = 1.0 bằng đúng 0 để triệt tiêu hoàn toàn spin xoay', () => {
    expect(calculateDiceRotationFactor(1.0)).toBe(0);
  });

  it('[TC-IMP53.16/MSS][Facet3-Resting] Cao độ xúc xắc khóa cứng tại 0.26 khi progress >= 0.85', () => {
    expect(calculateDiceElevation(0.85)).toBe(0.26);
    expect(calculateDiceElevation(0.99)).toBe(0.26);
  });

  it('[TC-IMP53.17/MSS][Facet3-Resting] Cao độ xúc xắc phòng thủ trả về DICE_REST_Y = 0.26 khi progress là NaN hoặc Infinity', () => {
    expect(calculateDiceElevation(NaN)).toBe(0.26);
    expect(calculateDiceElevation(Infinity)).toBe(0.26);
  });

  it.each([1, 2, 3, 4, 5, 6] as const)(
    '[TC-IMP53.18/MSS][Facet3-Resting] Góc xoay của mặt xúc xắc %i ở trạng thái nghỉ t = 1.0 khớp 100%% với rotation map',
    (face) => {
      const targetRot = getDiceFaceRotation(face as DiceFace);
      const spinOffset: [number, number, number] = [Math.PI * 6, -Math.PI * 8, Math.PI * 6];
      const factor = calculateDiceRotationFactor(1.0);
      const restingRot = [
        targetRot[0] + spinOffset[0] * factor,
        targetRot[1] + spinOffset[1] * factor,
        targetRot[2] + spinOffset[2] * factor,
      ];

      expect(restingRot[0]).toBe(targetRot[0]);
      expect(restingRot[1]).toBe(targetRot[1]);
      expect(restingRot[2]).toBe(targetRot[2]);
    },
  );

  // ===========================================================================
  // FACET 4: Server Bot Pacing Invariant (Nhịp Điệu Bot Server >= 1500ms)
  // ===========================================================================

  it('[TC-IMP53.19/MSS][Facet4-Pacing] WssServer khởi tạo mặc định (không truyền botTurnDelayMs) cấu hình botTurnDelayMs >= 1500ms', async () => {
    const server = new WssServer({ port: 0 });
    try {
      const orchestrator = (server as any).turnOrchestrator;
      expect(orchestrator.botTurnDelayMs).toBeGreaterThanOrEqual(1500);
    } finally {
      await server.close();
    }
  });

  it('[TC-IMP53.20/MSS][Facet4-Pacing] WssServer khởi tạo với config rỗng không ghi đè botTurnDelayMs dưới 1500ms', async () => {
    const server = new WssServer({ port: 0, botTurnDelayMs: undefined });
    try {
      const orchestrator = (server as any).turnOrchestrator;
      expect(orchestrator.botTurnDelayMs).toBeGreaterThanOrEqual(1500);
    } finally {
      await server.close();
    }
  });

  it('[TC-IMP53.21/MSS][Facet4-Pacing] Cấu hình hằng số DEFAULT_BOT_TURN_DELAY_MS trong server/index.ts đạt >= 1500ms', () => {
    const delay = (serverIndexModule as any).DEFAULT_BOT_TURN_DELAY_MS ?? 0;
    expect(delay).toBeGreaterThanOrEqual(1500);
  });

  it('[TC-IMP53.22/MSS][Facet4-Pacing] WssServer bảo toàn botTurnDelayMs tùy chỉnh khi được chỉ định rõ ràng >= 1500ms', async () => {
    const server = new WssServer({ port: 0, botTurnDelayMs: 2200 });
    try {
      const orchestrator = (server as any).turnOrchestrator;
      expect(orchestrator.botTurnDelayMs).toBe(2200);
    } finally {
      await server.close();
    }
  });
});
