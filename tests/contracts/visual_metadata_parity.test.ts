// [TC-PARITY.01/MSS..TC-PARITY.17/Fallback][UC-IMP-VISUAL-DESYNC] Universal 5-Facet Contract Suite:
// IMP-VISUAL-METADATA-DESYNC: Chuẩn Hóa Kiến Trúc Trực Quan & Khắc Phục Lệch Pha Dữ Liệu Hiển Thị UI/3D vs Domain SSOT
// Reference: .agents/plans/PLAN_IMP_VISUAL_METADATA_DESYNC.md
// Domain Invariants: docs/domain/gotchas.md (Pillars I-VI, Single Source of Truth for Visual Metadata)

import { describe, it, expect } from 'vitest';
import { MarketCardId, ChanceCardId } from '../../src/domain/event_card_types.js';
import { MacroCycleType } from '../../src/domain/macro_cycle_types.js';
import type { ClientMarketModifier } from '../../src/client/store/game_store_types.js';
import {
  resolveMarketEffectSummary,
  resolveMarketCompactFormula,
} from '../../src/client/ui/market_event_ticker.js';
import { getCardHeroStat } from '../../src/client/ui/modals/event_card_visuals.js';

// ============================================================================
// DYNAMIC IMPORT HARNESS (Station 1 RED Contract Gate)
// Dynamically resolves Station 2 domain_visual_bridge module to assert clean Business RED
// ============================================================================
export type EventIdentifiable = MarketCardId | MacroCycleType | ChanceCardId | 'BUILD_HALT';

export interface EventVisualMeta {
  readonly icon: string;
  readonly label: string;
  readonly color: string;
  readonly isBuff: boolean;
}

interface DomainVisualBridgeExports {
  readonly deriveModifierVisual: (modifier: Partial<ClientMarketModifier> & { readonly type?: string }) => EventVisualMeta;
  readonly resolveEventIcon: (id: string) => string;
  readonly isEventIdentifiable: (id: string) => id is EventIdentifiable;
  readonly EVENT_ICON_REGISTRY: Readonly<Record<EventIdentifiable, string>>;
  readonly CANONICAL_MULTIPLIERS: Partial<Readonly<Record<EventIdentifiable, number>>>;
}

const DOMAIN_VISUAL_BRIDGE_PATH = '../../src/client/domain_visual_bridge';

let bridgeMod: Partial<DomainVisualBridgeExports> | null = null;
try {
  bridgeMod = await import(/* @vite-ignore */ DOMAIN_VISUAL_BRIDGE_PATH);
} catch {
  try {
    bridgeMod = await import(/* @vite-ignore */ `${DOMAIN_VISUAL_BRIDGE_PATH}.js`);
  } catch {
    bridgeMod = null;
  }
}

export const deriveModifierVisual: (modifier: Partial<ClientMarketModifier> & { readonly type?: string }) => EventVisualMeta =
  bridgeMod?.deriveModifierVisual ??
  (() => {
    throw new Error(
      'deriveModifierVisual is not implemented (Station 1 RED: src/client/domain_visual_bridge.ts pending)'
    );
  });

export const resolveEventIcon: (id: string) => string =
  bridgeMod?.resolveEventIcon ??
  (() => {
    throw new Error(
      'resolveEventIcon is not implemented (Station 1 RED: src/client/domain_visual_bridge.ts pending)'
    );
  });

export const isEventIdentifiable: (id: string) => id is EventIdentifiable =
  bridgeMod?.isEventIdentifiable ??
  ((_id: string): _id is EventIdentifiable => {
    throw new Error(
      'isEventIdentifiable is not implemented (Station 1 RED: src/client/domain_visual_bridge.ts pending)'
    );
  });

describe('[TC-PARITY.01..17][UC-IMP-VISUAL-DESYNC] Visual Metadata Parity Contract Suite', () => {
  // ==========================================================================
  // FACET 1: MAIN STREAM / MACRO & ACTIVE RENT BUFFS & DEBUFFS (Tests 1-6)
  // ==========================================================================
  it('[TC-PARITY.01/MSS][UC-IMP-VISUAL-DESYNC][Facet-1] MACRO_LAND_FEVER suy diễn đúng icon 🌋, nhãn x2.5 Thuê, màu #F59E0B và cờ isBuff = true', () => {
    const visual = deriveModifierVisual({
      type: MacroCycleType.MACRO_LAND_FEVER,
    });
    expect(visual.icon).toBe('🌋');
    expect(visual.label).toBe('x2.5 Thuê');
    expect(visual.color).toBe('#F59E0B');
    expect(visual.isBuff).toBe(true);
  });

  it('[TC-PARITY.02/MSS][UC-IMP-VISUAL-DESYNC][Facet-1] MC_PEAK_TOURISM suy diễn đúng icon 🏖️, nhãn x2 Thuê, màu #F59E0B và cờ isBuff = true', () => {
    const visual = deriveModifierVisual({
      type: MarketCardId.MC_PEAK_TOURISM,
    });
    expect(visual.icon).toBe('🏖️');
    expect(visual.label).toBe('x2 Thuê');
    expect(visual.color).toBe('#F59E0B');
    expect(visual.isBuff).toBe(true);
  });

  it('[TC-PARITY.03/MSS][UC-IMP-VISUAL-DESYNC][Facet-1] MC_PUBLIC_INVEST suy diễn đúng icon 🏗️, nhãn x2 Thuê, màu #F59E0B và cờ isBuff = true', () => {
    const visual = deriveModifierVisual({
      type: MarketCardId.MC_PUBLIC_INVEST,
    });
    expect(visual.icon).toBe('🏗️');
    expect(visual.label).toBe('x2 Thuê');
    expect(visual.color).toBe('#F59E0B');
    expect(visual.isBuff).toBe(true);
  });

  it('[TC-PARITY.04/MSS][UC-IMP-VISUAL-DESYNC][Facet-1] MC_LAND_FEVER suy diễn đúng icon 🔥, nhãn x2 Thuê, màu #F59E0B và cờ isBuff = true', () => {
    const visual = deriveModifierVisual({
      type: MarketCardId.MC_LAND_FEVER,
    });
    expect(visual.icon).toBe('🔥');
    expect(visual.label).toBe('x2 Thuê');
    expect(visual.color).toBe('#F59E0B');
    expect(visual.isBuff).toBe(true);
  });

  it('[TC-PARITY.05/MSS][UC-IMP-VISUAL-DESYNC][Facet-1] MC_ALCOHOL_CHECK suy diễn đúng icon 🚨, nhãn -50%, màu #EF4444 và cờ isBuff = false', () => {
    const visual = deriveModifierVisual({
      type: MarketCardId.MC_ALCOHOL_CHECK,
    });
    expect(visual.icon).toBe('🚨');
    expect(visual.label).toBe('-50%');
    expect(visual.color).toBe('#EF4444');
    expect(visual.isBuff).toBe(false);
  });

  it('[TC-PARITY.06/MSS][UC-IMP-VISUAL-DESYNC][Facet-1] MC_COASTAL_STORM suy diễn đúng icon 🌀, nhãn Miễn thuê, màu #EF4444 và cờ isBuff = false', () => {
    const visual = deriveModifierVisual({
      type: MarketCardId.MC_COASTAL_STORM,
    });
    expect(visual.icon).toBe('🌀');
    expect(visual.label).toBe('Miễn thuê');
    expect(visual.color).toBe('#EF4444');
    expect(visual.isBuff).toBe(false);
  });

  // ==========================================================================
  // FACET 2: BOUNDARY & EDGE RULES / SUBSIDIES & SPECIALIZED MODIFIERS (Tests 7-11)
  // ==========================================================================
  it('[TC-PARITY.07/Boundary][UC-IMP-VISUAL-DESYNC][Facet-2] CC_PORT_EXCLUSIVE có beneficiaryId suy diễn đúng icon 🚢, nhãn Hưởng 50%, màu #F59E0B và cờ isBuff = true', () => {
    const visual = deriveModifierVisual({
      type: ChanceCardId.CC_PORT_EXCLUSIVE,
      beneficiaryId: 'p1',
    });
    expect(visual.icon).toBe('🚢');
    expect(visual.label).toBe('Hưởng 50%');
    expect(visual.color).toBe('#F59E0B');
    expect(visual.isBuff).toBe(true);
  });

  it('[TC-PARITY.08/Boundary][UC-IMP-VISUAL-DESYNC][Facet-2] MACRO_LIQUIDITY_FREEZE suy diễn đúng icon 🧊, nhãn Thuê -50%, màu #06B6D4 và cờ isBuff = false', () => {
    const visual = deriveModifierVisual({
      type: MacroCycleType.MACRO_LIQUIDITY_FREEZE,
    });
    expect(visual.icon).toBe('🧊');
    expect(visual.label).toBe('Thuê -50%');
    expect(visual.color).toBe('#06B6D4');
    expect(visual.isBuff).toBe(false);
  });

  it('[TC-PARITY.09/Boundary][UC-IMP-VISUAL-DESYNC][Facet-2] MC_FUEL_SURGE suy diễn đúng icon ⛽, nhãn +500 Phí, màu #EF4444 và cờ isBuff = false', () => {
    const visual = deriveModifierVisual({
      type: MarketCardId.MC_FUEL_SURGE,
    });
    expect(visual.icon).toBe('⛽');
    expect(visual.label).toBe('+500 Phí');
    expect(visual.color).toBe('#EF4444');
    expect(visual.isBuff).toBe(false);
  });

  it('[TC-PARITY.10/Boundary][UC-IMP-VISUAL-DESYNC][Facet-2] MC_URBAN_PLANNING suy diễn đúng icon 📐, nhãn Thế chấp 60%, màu #F59E0B và cờ isBuff = true', () => {
    const visual = deriveModifierVisual({
      type: MarketCardId.MC_URBAN_PLANNING,
    });
    expect(visual.icon).toBe('📐');
    expect(visual.label).toBe('Thế chấp 60%');
    expect(visual.color).toBe('#F59E0B');
    expect(visual.isBuff).toBe(true);
  });

  it('[TC-PARITY.11/Boundary][UC-IMP-VISUAL-DESYNC][Facet-2] CC_BUILD_HALT và alias BUILD_HALT suy diễn đúng icon 🚧, nhãn Đình chỉ, màu #EF4444 và cờ isBuff = false', () => {
    const visualEnum = deriveModifierVisual({
      type: ChanceCardId.CC_BUILD_HALT,
    });
    const visualAlias = deriveModifierVisual({
      type: 'BUILD_HALT',
    });
    expect(visualEnum.label).toBe('Đình chỉ');
    expect(visualEnum.isBuff).toBe(false);
    expect(visualAlias.icon).toBe('🚧');
    expect(visualAlias.color).toBe('#EF4444');
  });

  // ==========================================================================
  // FACET 3: ICON REGISTRY & RESOLVER PARITY (Tests 12-14)
  // ==========================================================================
  it('[TC-PARITY.12/MSS][UC-IMP-VISUAL-DESYNC][Facet-3] resolveEventIcon trả về đúng emoji 🌋 cho MacroCycleType.MACRO_LAND_FEVER', () => {
    const icon = resolveEventIcon(MacroCycleType.MACRO_LAND_FEVER);
    expect(icon).toBe('🌋');
  });

  it('[TC-PARITY.13/MSS][UC-IMP-VISUAL-DESYNC][Facet-3] resolveEventIcon trả về đúng emoji 🔥 cho MarketCardId.MC_LAND_FEVER', () => {
    const icon = resolveEventIcon(MarketCardId.MC_LAND_FEVER);
    expect(icon).toBe('🔥');
  });

  it('[TC-PARITY.14/MSS][UC-IMP-VISUAL-DESYNC][Facet-3] resolveEventIcon trả về đúng emoji 🚢 cho ChanceCardId.CC_PORT_EXCLUSIVE', () => {
    const icon = resolveEventIcon(ChanceCardId.CC_PORT_EXCLUSIVE);
    expect(icon).toBe('🚢');
  });

  // ==========================================================================
  // FACET 4: CROSS-SURFACE TEXT & SUMMARY CONSISTENCY (Tests 15-16)
  // ==========================================================================
  it('[TC-PARITY.15/MSS][UC-IMP-VISUAL-DESYNC][Facet-4] Khớp văn bản mô tả giữa resolveMarketEffectSummary và getCardHeroStat cho MC_LAND_FEVER', () => {
    const summary = resolveMarketEffectSummary(MarketCardId.MC_LAND_FEVER);
    const heroStat = getCardHeroStat(MarketCardId.MC_LAND_FEVER);
    expect(summary).toMatch(/(nhân đôi|x2)/i);
    expect(heroStat.value).toMatch(/(nhân đôi|x2)/i);
  });

  it('[TC-PARITY.16/MSS][UC-IMP-VISUAL-DESYNC][Facet-4] Khớp văn bản công thức giữa resolveMarketCompactFormula và deriveModifierVisual cho MC_LAND_FEVER', () => {
    const formula = resolveMarketCompactFormula(MarketCardId.MC_LAND_FEVER);
    const visual = deriveModifierVisual({
      type: MarketCardId.MC_LAND_FEVER,
    });
    expect(formula).toMatch(/x2/i);
    expect(visual.label).toMatch(/x2/i);
  });

  // ==========================================================================
  // FACET 5: FALLBACK & UNKNOWN MODIFIER SAFETY (Test 17)
  // ==========================================================================
  it('[TC-PARITY.17/Fallback][UC-IMP-VISUAL-DESYNC][Facet-5] Modifier không xác định và không có multiplier trả về an toàn trung tính', () => {
    const visual = deriveModifierVisual({
      type: 'UNKNOWN_CUSTOM_EVENT',
    });
    expect(visual.icon).toBe('🎴');
    expect(visual.label).toBe('Hiệu lực');
    expect(visual.color).toBe('#94A3B8');
    expect(visual.isBuff).toBe(false);
  });
});
