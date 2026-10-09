// @vitest-environment happy-dom
// [IMP-312] Living Contract Tests: Auction Bid Controls Component
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, vi } from 'vitest';
import {
  AuctionBidControls,
  type AuctionBidControlsProps,
} from '../../src/client/ui/modals/auction_bid_controls.js';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function createDefaultProps(overrides?: Partial<AuctionBidControlsProps>): AuctionBidControlsProps {
  return {
    currentBid: 1000,
    increments: [1100, 1200, 1500],
    myBalance: 2000,
    isConcluded: false,
    isLeading: false,
    hasPassed: false,
    isDeclinedPlayer: false,
    isMyPlayerBankrupt: false,
    isForeclosure: false,
    autoBid: false,
    setAutoBid: vi.fn(),
    onBid: vi.fn(),
    onPass: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
}

describe('Station 1 Contract Tests: Auction Bid Controls', () => {
  it('TC-ABC-INC.01 [UC-ABC/MSS] Given increments [1100, 1200, 1500], When rendered, Then 3 increment buttons are displayed and enabled', () => {
    const props = createDefaultProps();
    const html = renderToStaticMarkup(React.createElement(AuctionBidControls, props));

    expect(html.includes('+100')).toBe(true);
    expect(html.includes('(1.100)')).toBe(true);
    expect(html.includes('disabled=""')).toBe(false);
  });

  it('TC-ABC-INC.02 [UC-ABC/MSS] Given balance lower than increment, When rendered, Then unaffordable button is disabled', () => {
    const props = createDefaultProps({ myBalance: 1150 });
    const html = renderToStaticMarkup(React.createElement(AuctionBidControls, props));

    expect(html.includes('disabled=""')).toBe(true);
  });

  it('TC-ABC-INC.03 [UC-ABC/MSS] Given targetBid 0 in fire sale, When rendered, Then displays "Bắt Đáy (0)"', () => {
    const props = createDefaultProps({ increments: [0, 500, 1000] });
    const html = renderToStaticMarkup(React.createElement(AuctionBidControls, props));

    expect(html.includes('Bắt Đáy (0)')).toBe(true);
  });

  it('TC-ABC-STT.01 [UC-ABC/MSS] Given isMyPlayerBankrupt true, When rendered, Then bankruptcy status notice is displayed', () => {
    const props = createDefaultProps({ isMyPlayerBankrupt: true });
    const html = renderToStaticMarkup(React.createElement(AuctionBidControls, props));

    expect(html.includes('Bạn đã phá sản và đang theo dõi phiên đấu giá tài sản phát mãi.')).toBe(true);
  });

  it('TC-ABC-STT.02 [UC-ABC/MSS] Given isDeclinedPlayer true, When rendered, Then declined notice is displayed', () => {
    const props = createDefaultProps({ isDeclinedPlayer: true });
    const html = renderToStaticMarkup(React.createElement(AuctionBidControls, props));

    expect(html.includes('Bạn đã từ chối mua ô đất này (Luật game cấm tham gia đấu giá).')).toBe(true);
  });

  it('TC-ABC-STT.03 [UC-ABC/MSS] Given hasPassed true, When rendered, Then withdrawal notice is displayed', () => {
    const props = createDefaultProps({ hasPassed: true });
    const html = renderToStaticMarkup(React.createElement(AuctionBidControls, props));

    expect(html.includes('Bạn đã rút lui khỏi phiên đấu giá này.')).toBe(true);
  });

  it('TC-ABC-STT.04 [UC-ABC/MSS] Given isLeading true, When rendered, Then leading bidder success banner is displayed', () => {
    const props = createDefaultProps({ isLeading: true });
    const html = renderToStaticMarkup(React.createElement(AuctionBidControls, props));

    expect(html.includes('Bạn đang dẫn đầu mức giá cao nhất!')).toBe(true);
  });

  it('TC-ABC-ACT.01 [UC-ABC/MSS] Given autoBid false, When rendered, Then displays "TỰ ĐỘNG ĐẶT GIÁ: TẮT"', () => {
    const props = createDefaultProps({ autoBid: false });
    const html = renderToStaticMarkup(React.createElement(AuctionBidControls, props));

    expect(html.includes('TỰ ĐỘNG ĐẶT GIÁ: TẮT')).toBe(true);
  });

  it('TC-ABC-ACT.02 [UC-ABC/MSS] Given autoBid true, When rendered, Then displays "TỰ ĐỘNG ĐẶT GIÁ: BẬT"', () => {
    const props = createDefaultProps({ autoBid: true });
    const html = renderToStaticMarkup(React.createElement(AuctionBidControls, props));

    expect(html.includes('TỰ ĐỘNG ĐẶT GIÁ: BẬT')).toBe(true);
  });

  it('TC-ABC-ACT.03 [UC-ABC/MSS] Given isConcluded true, When rendered, Then displays concluded close button', () => {
    const props = createDefaultProps({ isConcluded: true });
    const html = renderToStaticMarkup(React.createElement(AuctionBidControls, props));

    expect(html.includes('data-testid="auction-concluded-close-btn"')).toBe(true);
  });

  it('TC-ABC-ACT.04 [UC-ABC/MSS] Given normal active state, When rendered, Then displays pass button', () => {
    const props = createDefaultProps();
    const html = renderToStaticMarkup(React.createElement(AuctionBidControls, props));

    expect(html.includes('data-testid="auction-pass-btn"')).toBe(true);
  });

  it('TC-ABC-INT.01 [UC-ABC/MSS] Clicking increment button invokes onBid callback with target bid', () => {
    const onBid = vi.fn();
    const props = createDefaultProps({ onBid });
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(React.createElement(AuctionBidControls, props));
    });

    const button = div.querySelector('button');
    if (button instanceof HTMLButtonElement) {
      act(() => {
        button.click();
      });
    }

    expect(onBid).toHaveBeenCalledWith(1100);
    expect(onBid).toHaveBeenCalledTimes(1);
  });

  it('TC-ABC-INT.02 [UC-ABC/MSS] Clicking pass button invokes onPass callback', () => {
    const onPass = vi.fn();
    const props = createDefaultProps({ onPass });
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(React.createElement(AuctionBidControls, props));
    });

    const passBtn = div.querySelector('[data-testid="auction-pass-btn"]');
    if (passBtn instanceof HTMLButtonElement) {
      act(() => {
        passBtn.click();
      });
    }

    expect(onPass).toHaveBeenCalledTimes(1);
  });

  it('TC-ABC-INT.03 [UC-ABC/MSS] Clicking concluded close button invokes onClose callback', () => {
    const onClose = vi.fn();
    const props = createDefaultProps({ isConcluded: true, onClose });
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(React.createElement(AuctionBidControls, props));
    });

    const closeBtn = div.querySelector('[data-testid="auction-concluded-close-btn"]');
    if (closeBtn instanceof HTMLButtonElement) {
      act(() => {
        closeBtn.click();
      });
    }

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('TC-ABC-INT.04 [UC-ABC/MSS] Clicking auto-bid button invokes setAutoBid callback', () => {
    const setAutoBid = vi.fn();
    const props = createDefaultProps({ setAutoBid });
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(React.createElement(AuctionBidControls, props));
    });

    const autoBidBtn = div.querySelector('[data-testid="auction-autobid-btn"]');
    if (autoBidBtn instanceof HTMLButtonElement) {
      act(() => {
        autoBidBtn.click();
      });
    }

    expect(setAutoBid).toHaveBeenCalledTimes(1);
  });
});
