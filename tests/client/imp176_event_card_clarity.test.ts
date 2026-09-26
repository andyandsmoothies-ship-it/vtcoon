// [UI-S04/MSS][IMP-176] Event Card Clarity & Explicit Subject Separation Test Suite
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MarketCardId } from '../../src/domain/event_card_types.js';
import { MARKET_CARD_DETAILS, getMarketCardInfo } from '../../src/domain/event_card_metadata.js';
import { getCardHeroStat } from '../../src/client/ui/modals/event_card_visuals.js';
import { EventCardModal } from '../../src/client/ui/modals/event_card_modal.js';

describe('[IMP-176] Event Card Texture & Modal Clarity Verification', () => {
  // =========================================================================
  // FACET 1: DOMAIN METADATA & PROPERTY NAMES CLARITY
  // =========================================================================
  describe('Facet 1: Domain Metadata & Property Names Clarity', () => {
    it('[TC-176.01/MSS] MC_ALCOHOL_CHECK targetScope liệt kê đích danh 4 địa danh dịch vụ', () => {
      const meta = MARKET_CARD_DETAILS[MarketCardId.MC_ALCOHOL_CHECK];
      expect(meta.targetScope).toContain('Bình Dương');
      expect(meta.targetScope).toContain('Đồng Nai');
      expect(meta.targetScope).toContain('Hải Phòng');
      expect(meta.targetScope).toContain('Phú Quốc');
    });

    it('[TC-176.02/MSS] MC_ALCOHOL_CHECK effectDetail phân định rạch ròi 2 chủ thể: Chủ ô đất & Người dừng chân', () => {
      const meta = MARKET_CARD_DETAILS[MarketCardId.MC_ALCOHOL_CHECK];
      expect(meta.effectDetail).toContain('chủ ô đất');
      expect(meta.effectDetail).toContain('50%');
      expect(meta.effectDetail).toContain('Người dừng chân');
      expect(meta.effectDetail).toContain('800');
      expect(meta.effectDetail).toContain('mất lượt');
    });

    it('[TC-176.03/MSS] getMarketCardInfo bảo toàn đầy đủ các trường chi tiết cho MC_ALCOHOL_CHECK', () => {
      const info = getMarketCardInfo(MarketCardId.MC_ALCOHOL_CHECK);
      expect(info.targetScope).toContain('Phú Quốc');
      expect(info.effectDetail).toContain('chủ ô đất');
      expect(info.duration).toContain('2 vòng');
    });
  });

  // =========================================================================
  // FACET 2: HERO STAT & MODAL VISUAL CLARITY
  // =========================================================================
  describe('Facet 2: Hero Stat & Modal Visual Clarity', () => {
    it('[TC-176.04/MSS] Hero Stat của MC_ALCOHOL_CHECK nêu bật cả Giảm 50% Thuê và Phạt Nồng Độ Cồn', () => {
      const hero = getCardHeroStat(MarketCardId.MC_ALCOHOL_CHECK);
      expect(hero.label).toBe('GIẢM 50% THUÊ • PHẠT NỒNG ĐỘ CỒN');
      expect(hero.value).toBe('-800');
      expect(hero.variant).toBe('negative');
    });

    it('[TC-176.05/MSS] EventCardModal render đầy đủ 4 địa danh trên thanh thông số', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_ALCOHOL_CHECK,
        })
      );
      expect(html).toContain('GIẢM 50% THUÊ • PHẠT NỒNG ĐỘ CỒN');
      expect(html).toContain('-800');
      expect(html).toContain('Bình Dương');
      expect(html).toContain('Phú Quốc');
      expect(html).toContain('chủ ô đất');
      expect(html).toContain('Người dừng chân');
    });

    it('[TC-176.06/MSS] EventCardModal không chứa các ký hiệu mã ô thô kệch', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_ALCOHOL_CHECK,
        })
      );
      expect(html).not.toContain('(Ô 6, 8, 26, 27)');
    });
  });
});
