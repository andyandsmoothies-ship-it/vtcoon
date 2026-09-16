// [TC-IMP103/MSS][UI-S01/MSS][UI-S02/MSS][NET-S01/MSS][PERF-S01/MSS]
// Universal Contract Test Suite: Mobile Cam, Lobby 1-Row Ergonomics, Telemetry Hardening & Mobile Post-Processing
// Traceability: docs/master_roadmap.md § IMP-103
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { N8AO } from '@react-three/postprocessing';
import {
  resolveCameraMode,
  type CameraResolveParams,
} from '../../src/client/3d/camera_state_machine';
import { PreMatchDeck } from '../../src/client/ui/lobby/pre_match_deck';
import { PlayerSlotCard } from '../../src/client/ui/lobby/player_slot_card';
import {
  createEmptySlot,
  BotPersonality,
  type LobbySlot,
} from '../../src/client/store/lobby_types';
import { useLobbyStore } from '../../src/client/store/lobby_store';
import {
  checkIsTeleport,
} from '../../src/client/telemetry/telemetry_delta_hook';
import { verifyMovementStep } from '../../src/client/telemetry/invariant_checker';
import { useTelemetryStore } from '../../src/client/telemetry/telemetry_store';
import { TurnPhase } from '../../src/domain/room';
import {
  PostProcessingPipeline,
  type PostProcessingPipelineProps,
} from '../../src/client/3d/post_processing_pipeline';

type ExtendedPipelineProps = PostProcessingPipelineProps & {
  readonly isMobile?: boolean;
  readonly disableAoOnMobile?: boolean;
};

type TeleportCheckerFn = (
  fromPos: number,
  toPos: number,
  isTurnPlayer: boolean,
  phase?: TurnPhase,
  hasEventCard?: boolean
) => boolean;

const hostSlot: LobbySlot = {
  ...createEmptySlot(0),
  playerId: 'p1',
  playerName: 'Chủ Phòng VIP',
  isHost: true,
  isOccupied: true,
  isReady: true,
  tokenColor: '#ef4444',
};

const botSlot: LobbySlot = {
  ...createEmptySlot(1),
  playerId: 'bot_2',
  playerName: 'Bot Shark AI',
  isHost: false,
  isOccupied: true,
  isBot: true,
  isReady: true,
  botPersonality: BotPersonality.Aggressive,
  tokenColor: '#3b82f6',
};

const sampleSlots: readonly LobbySlot[] = [
  hostSlot,
  botSlot,
  { ...createEmptySlot(2), isOccupied: false },
  { ...createEmptySlot(3), isOccupied: false },
];

describe('[TC-IMP103/MSS] Mobile Cam, Lobby 1-Row Ergonomics, Telemetry Hardening & Mobile Post-Processing', () => {
  beforeEach(() => {
    useTelemetryStore.getState().reset();
    useLobbyStore.getState().resetLobby();
  });

  // =========================================================================
  // FACET 1: BOUNDARY & RANGE (RANGE BOUNDS, DEFAULT OVERVIEWS, STATIC REMOVAL)
  // =========================================================================
  describe('Facet 1: Boundary & Range', () => {
    it('[TC-IMP103.01/MSS][UI-S01/MSS][UC-001] resolveCameraMode: Giu nguyen overview khi bot chua gieo xuc xac', () => {
      const mode = resolveCameraMode({
        isRolling: false,
        isPawnAnimating: false,
        activeModal: null,
        isBotTurn: true,
        hasTargetTile: false,
        hasRolledThisTurn: false,
      });
      expect(mode).toBe('overview');
    });

    it('[TC-IMP103.02/MSS][UI-S01/MSS][UC-001] resolveCameraMode: Giu nguyen overview khi bot dang tung xuc xac tranh rung lac', () => {
      const mode = resolveCameraMode({
        isRolling: true,
        isPawnAnimating: false,
        activeModal: null,
        isBotTurn: true,
      });
      expect(mode).toBe('overview');
    });

    it('[TC-IMP103.03/MSS][UI-S02/MSS][UC-002] PreMatchDeck: Loai bo dong text header trung lap 🏝️ Sanh Cho trong aside deck', () => {
      useLobbyStore.setState({
        roomCode: 'VT8888',
        isHost: true,
        slots: [...sampleSlots],
      });
      const html = renderToStaticMarkup(
        React.createElement(PreMatchDeck, {
          isHost: true,
          roomCode: 'VT8888',
          slots: sampleSlots,
        })
      );
      // Nhan dien the aside pre-match-deck khong con dong span tieu de trung lap
      expect(html).not.toMatch(/<span>🏝️<\/span>\s*Sảnh Chờ/);
    });

    it('[TC-IMP103.04/MSS][UI-S02/MSS][UC-002] PreMatchDeck: Nut sao chep ma phong mang dai mau vang hoang gia from-amber-400', () => {
      const html = renderToStaticMarkup(
        React.createElement(PreMatchDeck, {
          isHost: true,
          roomCode: 'VT8888',
          slots: sampleSlots,
        })
      );
      const copyBtn = html.match(/<button[^>]*data-testid="copy-room-code-btn"[^>]*>/);
      expect(copyBtn).not.toBeNull();
      expect(copyBtn?.[0]).toContain('from-amber-400');
    });

    it('[TC-IMP103.05/MSS][UI-S02/MSS][UC-002] PreMatchDeck: Cap nut Huong Dan va Ma QR bo tri luoi 50/50 qua grid grid-cols-2', () => {
      const html = renderToStaticMarkup(
        React.createElement(PreMatchDeck, {
          isHost: true,
          roomCode: 'VT8888',
          slots: sampleSlots,
        })
      );
      const actionRow = html.match(/<div[^>]*>[\s\S]*?data-testid="open-game-rules-btn"[\s\S]*?<\/div>/);
      expect(actionRow).not.toBeNull();
      expect(actionRow?.[0]).toContain('grid grid-cols-2');
    });

    it('[TC-IMP103.06/MSS][UI-S02/MSS][UC-002] PlayerSlotCard: The slot nguoi choi co bo cuc 1 hang ngang tinh gon min-h-[50px]', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerSlotCard, {
          slot: botSlot,
          isHostViewer: true,
          onToggleBot: () => {},
          onCycleBotPersonality: () => {},
        })
      );
      const slotCard = html.match(/<div[^>]*data-testid="lobby-slot-1-occupied"[^>]*>/);
      expect(slotCard).not.toBeNull();
      expect(slotCard?.[0]).toContain('min-h-[50px]');
      expect(slotCard?.[0]).not.toContain('min-h-[92px]');
    });

    it('[TC-IMP103.07/MSS][NET-S01/MSS][UC-003] checkIsTeleport: Dich chuyen thong qua o 38 den o 0 (GO) trong PropertyManagement tra ve true', () => {
      const fn = checkIsTeleport as TeleportCheckerFn;
      const isTeleport = fn(38, 0, true, TurnPhase.PropertyManagement, true);
      expect(isTeleport).toBe(true);
    });

    it('[TC-IMP103.08/MSS][PERF-S01/MSS][UC-004] PostProcessingPipeline: Mac dinh tren desktop (isMobile = false), enableAo van duy tri bat', () => {
      const props: ExtendedPipelineProps = { isMobile: false, enableAo: true };
      const element = PostProcessingPipeline(props as PostProcessingPipelineProps);
      expect(element).not.toBeNull();
      const children = Array.isArray(element?.props?.children)
        ? element?.props?.children
        : [element?.props?.children];
      const hasN8AO = children.some((c: any) => c && (c.type === N8AO || c.type?.name === 'N8AO'));
      expect(hasN8AO).toBe(true);
    });
  });

  // =========================================================================
  // FACET 2: STATE REACTIVITY (DYNAMIC CAMERA MODES, BADGES & TELEMETRY)
  // =========================================================================
  describe('Facet 2: State Reactivity', () => {
    it('[TC-IMP103.09/MSS][UI-S01/MSS][UC-001] resolveCameraMode: Khi isBotTurn = true va isPawnAnimating = true, tra ve pawn_chase', () => {
      const mode = resolveCameraMode({
        isRolling: false,
        isPawnAnimating: true,
        activeModal: null,
        isBotTurn: true,
      });
      expect(mode).toBe('pawn_chase');
    });

    it('[TC-IMP103.10/MSS][UI-S01/MSS][UC-001] resolveCameraMode: Khi isAnimatingPawnBot = true va isPawnAnimating = true, tra ve pawn_chase', () => {
      const mode = resolveCameraMode({
        isRolling: false,
        isPawnAnimating: true,
        activeModal: null,
        isAnimatingPawnBot: true,
      });
      expect(mode).toBe('pawn_chase');
    });

    it('[TC-IMP103.11/MSS][UI-S01/MSS][UC-001] resolveCameraMode: Khi isBotTurn = true va hasTargetTile = true, tra ve tile_focus', () => {
      const mode = resolveCameraMode({
        isRolling: false,
        isPawnAnimating: false,
        activeModal: null,
        isBotTurn: true,
        hasTargetTile: true,
      });
      expect(mode).toBe('tile_focus');
    });

    it('[TC-IMP103.12/MSS][UI-S01/MSS][UC-001] resolveCameraMode: Khi isBotTurn = true va hasRolledThisTurn = true, tra ve tile_focus', () => {
      const mode = resolveCameraMode({
        isRolling: false,
        isPawnAnimating: false,
        activeModal: null,
        isBotTurn: true,
        hasRolledThisTurn: true,
      });
      expect(mode).toBe('tile_focus');
    });

    it('[TC-IMP103.13/MSS][UI-S01/MSS][UC-001] resolveCameraMode: Khi isAnimatingPawnBot = true va hasTargetTile = true, tra ve tile_focus', () => {
      const mode = resolveCameraMode({
        isRolling: false,
        isPawnAnimating: false,
        activeModal: null,
        isAnimatingPawnBot: true,
        hasTargetTile: true,
      });
      expect(mode).toBe('tile_focus');
    });

    it('[TC-IMP103.14/MSS][UI-S02/MSS][UC-002] PreMatchDeck: Hop ma phong hien thi lobby-room-code va badge san sang cung hang', () => {
      useLobbyStore.setState({
        roomCode: 'VT8888',
        isHost: true,
        slots: [...sampleSlots],
      });
      const html = renderToStaticMarkup(
        React.createElement(PreMatchDeck, {
          isHost: true,
          roomCode: 'VT8888',
          slots: sampleSlots,
        })
      );
      // Container chua data-testid="lobby-room-code" dong thoi phai chua badge san sang
      const roomCodeContainer = html.match(/<div[^>]*>[\s\S]*?data-testid="lobby-room-code"[\s\S]*?<\/div>/);
      expect(roomCodeContainer).not.toBeNull();
      expect(roomCodeContainer?.[0]).toMatch(/(SẴN SÀNG|ĐANG CHỜ)/);
    });

    it('[TC-IMP103.15/MSS][UI-S02/MSS][UC-002] PreMatchDeck: Nut BAT DAU TRAN DAU khi ready mang dai mau Ngoc Luc Bao from-emerald-400 va shadow-[0_5px_0_0_#064e3b]', () => {
      useLobbyStore.setState({
        roomCode: 'VT8888',
        isHost: true,
        gameStarted: false,
        slots: [...sampleSlots],
      });
      const html = renderToStaticMarkup(
        React.createElement(PreMatchDeck, {
          isHost: true,
          roomCode: 'VT8888',
          slots: sampleSlots,
        })
      );
      const startBtn = html.match(/<button[^>]*data-testid="start-game-btn"[^>]*>/);
      expect(startBtn).not.toBeNull();
      expect(startBtn?.[0]).toContain('from-emerald-400');
      expect(startBtn?.[0]).toContain('to-emerald-600');
      expect(startBtn?.[0]).toContain('shadow-[0_5px_0_0_#064e3b]');
    });

    it('[TC-IMP103.16/MSS][UI-S02/MSS][UC-002] PlayerSlotCard: The slot hien thi avatar tron mang mau tokenColor, ten va vi tri', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerSlotCard, {
          slot: botSlot,
          isHostViewer: true,
          onToggleBot: () => {},
          onCycleBotPersonality: () => {},
        })
      );
      expect(html).toContain('Vị Trí 2');
      expect(html).toContain('Bot Shark AI');
      expect(html).toContain('background-color:#3b82f6');
    });

    it('[TC-IMP103.17/MSS][NET-S01/MSS][UC-003] checkIsTeleport: Tra ve true khi xuat phat tu o Co hoi 36 den 38 co hasEventCard = true', () => {
      const fn = checkIsTeleport as TeleportCheckerFn;
      const isTeleport = fn(36, 38, true, TurnPhase.PropertyManagement, true);
      expect(isTeleport).toBe(true);
    });

    it('[TC-IMP103.18/MSS][NET-S01/MSS][UC-003] checkIsTeleport: Tra ve true cho cac cap toa do the su kien 15->22 va 27->38', () => {
      const fn = checkIsTeleport as TeleportCheckerFn;
      const teleport1 = fn(15, 22, true, TurnPhase.PropertyManagement, true);
      const teleport2 = fn(27, 38, true, TurnPhase.PropertyManagement, true);
      expect(teleport1).toBe(true);
      expect(teleport2).toBe(true);
    });

    it('[TC-IMP103.19/MSS][PERF-S01/MSS][UC-004] PostProcessingPipeline: Khi isMobile = true, enableAo tu dong chuyen thanh false', () => {
      const props: ExtendedPipelineProps = { isMobile: true, enableAo: true };
      const element = PostProcessingPipeline(props as PostProcessingPipelineProps);
      expect(element).not.toBeNull();
      const children = Array.isArray(element?.props?.children)
        ? element?.props?.children
        : [element?.props?.children];
      const hasN8AO = children.some((c: any) => c && (c.type === N8AO || c.type?.name === 'N8AO'));
      expect(hasN8AO).toBe(false);
    });
  });

  // =========================================================================
  // FACET 3: RESOURCE DISPOSAL & CLEANUP (GPU FILLRATE, ZERO LEAKS, FLUSH)
  // =========================================================================
  describe('Facet 3: Resource Disposal', () => {
    it('[TC-IMP103.20/MSS][PERF-S01/MSS][UC-004] PostProcessingPipeline: Huy hoan toan shader passes cua N8AO khi bat isMobile', () => {
      const mobileProps: ExtendedPipelineProps = { isMobile: true };
      const mobileElement = PostProcessingPipeline(mobileProps as PostProcessingPipelineProps);
      const mobileChildren = Array.isArray(mobileElement?.props?.children)
        ? mobileElement?.props?.children
        : [mobileElement?.props?.children];
      const n8aoChild = mobileChildren.find((c: any) => c && (c.type === N8AO || c.type?.name === 'N8AO'));
      expect(n8aoChild).toBeUndefined();
    });

    it('[TC-IMP103.21/MSS][PERF-S01/MSS][UC-004] PostProcessingPipeline: Tra ve null khi enabled = false ngay ca khi isMobile = true', () => {
      const props: ExtendedPipelineProps = { enabled: false, isMobile: true };
      const element = PostProcessingPipeline(props as PostProcessingPipelineProps);
      expect(element).toBeNull();
    });

    it('[TC-IMP103.22/MSS][NET-S01/MSS][UC-003] Telemetry: Sau khi xu ly buoc the bai dich chuyen, he thong khong de lai vi pham ton dong', () => {
      const fn = checkIsTeleport as TeleportCheckerFn;
      const isTeleport = fn(36, 38, true, TurnPhase.PropertyManagement, true);
      const violation = verifyMovementStep({
        fromPosition: 36,
        toPosition: 38,
        tick: 20,
        isTeleport,
      });
      expect(violation).toBeNull();
      const violations = useTelemetryStore.getState().violations;
      expect(violations).toHaveLength(0);
    });
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE (ERGONOMICS, OVERRIDES, INVALID STEPS)
  // =========================================================================
  describe('Facet 4: Error Defense', () => {
    it('[TC-IMP103.23/MSS][UI-S01/MSS][UC-001] resolveCameraMode: manualMode ghi de toan bo che do tu dong cua bot', () => {
      const mode = resolveCameraMode({
        isRolling: false,
        isPawnAnimating: true,
        activeModal: null,
        isBotTurn: true,
        manualMode: 'auction_focus',
      });
      expect(mode).toBe('auction_focus');
    });

    it('[TC-IMP103.24/MSS][UI-S01/MSS][UC-001] resolveCameraMode: activeModal game_over ghi de luot bot de bao quat ket thuc tran', () => {
      const mode = resolveCameraMode({
        isRolling: false,
        isPawnAnimating: true,
        activeModal: 'game_over',
        isBotTurn: true,
      });
      expect(mode).toBe('overview');
    });

    it('[TC-IMP103.25/MSS][UI-S01/MSS][UC-001] resolveCameraMode: isPreMatch = true luon giu camera pre_match ke ca khi set cờ bot', () => {
      const mode = resolveCameraMode({
        isRolling: false,
        isPawnAnimating: false,
        activeModal: null,
        isBotTurn: true,
        isPreMatch: true,
      });
      expect(mode).toBe('pre_match');
    });

    it('[TC-IMP103.26/MSS][UI-S02/MSS][UC-002] PlayerSlotCard: Nut xoa bot co data-testid remove-bot-slot-*-btn, icon ✕ va kich thuoc w-7 h-7', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerSlotCard, {
          slot: botSlot,
          isHostViewer: true,
          onToggleBot: () => {},
          onCycleBotPersonality: () => {},
        })
      );
      const removeBtn = html.match(/<button[^>]*data-testid="remove-bot-slot-1-btn"[^>]*>([\s\S]*?)<\/button>/);
      expect(removeBtn).not.toBeNull();
      expect(removeBtn?.[0]).toContain('w-7');
      expect(removeBtn?.[0]).toContain('h-7');
      expect(removeBtn?.[1]).toContain('✕');
    });

    it('[TC-IMP103.27/MSS][NET-S01/MSS][UC-003] checkIsTeleport: Di chuyen thong thuong o 10 den 14 khong xuc xac trong PropertyManagement tra ve false', () => {
      const fn = checkIsTeleport as TeleportCheckerFn;
      const isTeleport = fn(10, 14, true, TurnPhase.PropertyManagement, false);
      expect(isTeleport).toBe(false);
    });

    it('[TC-IMP103.28/MSS][NET-S01/MSS][UC-003] verifyMovementStep: Di chuyen bat hop le khong the bai (isTeleport = false) phat sinh INVALID_POSITION_STEP', () => {
      const violation = verifyMovementStep({
        fromPosition: 10,
        toPosition: 14,
        tick: 25,
        isTeleport: false,
      });
      expect(violation).not.toBeNull();
      expect(violation?.type).toBe('INVALID_POSITION_STEP');
    });

    it('[TC-IMP103.29/MSS][PERF-S01/MSS][UC-004] PostProcessingPipeline: Ho tro ca prop disableAoOnMobile hoac isMobile de bao ve GPU', () => {
      const props: ExtendedPipelineProps = { disableAoOnMobile: true, enableAo: true };
      const element = PostProcessingPipeline(props as PostProcessingPipelineProps);
      expect(element).not.toBeNull();
      const children = Array.isArray(element?.props?.children)
        ? element?.props?.children
        : [element?.props?.children];
      const hasN8AO = children.some((c: any) => c && (c.type === N8AO || c.type?.name === 'N8AO'));
      expect(hasN8AO).toBe(false);
    });
  });
});
