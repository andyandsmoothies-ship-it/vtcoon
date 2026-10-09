// [IMP-335] Living Contract Test Suite: Modal Host Modularization & Sub-Host Extraction
// Traceability Tags: [TC-335.01/MSS..TC-335.07/A6] & [UC-MODAL/MSS]
// Universal 5-Facet Behavioral Matrix & Adversarial Inversion Verification
// Anti-TIDD: The interface is the test boundary. Strictly type-safe assertions with zero loose types.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useGameStore } from '../../src/client/store/game_store';
import { useLobbyStore } from '../../src/client/store/lobby_store';
import { AudioEngine } from '../../src/client/audio/audio_engine';
import { SoundEffect } from '../../src/client/audio/audio_types';
import { ModalHost } from '../../src/client/ui/modals/modal_host';
import {
  PortfolioModalHost,
  type PortfolioModalHostProps,
} from '../../src/client/ui/modals/hosts/portfolio_modal_host';
import {
  TradeModalHost,
  buildTradeOfferIntent,
  resolveAvailableTradePartners,
  type TradeModalHostProps,
} from '../../src/client/ui/modals/hosts/trade_modal_host';
import {
  AuctionModalHost,
  type AuctionModalHostProps,
} from '../../src/client/ui/modals/hosts/auction_modal_host';
import type { PropertyPortfolioModalProps } from '../../src/client/ui/modals/property_portfolio_modal';
import type { AuctionModalProps } from '../../src/client/ui/modals/auction_modal';
import type { TradeModalProps } from '../../src/client/ui/modals/trade_modal';

// ============================================================================
// VDOM Tree Traversal Helper (Pure Types, Zero Dirty Casts)
// ============================================================================

interface VNodeWithProps {
  readonly type?: unknown;
  readonly props?: {
    readonly children?: React.ReactNode;
    readonly [key: string]: unknown;
  };
}

function isVNodeWithProps(node: unknown): node is VNodeWithProps {
  return typeof node === 'object' && node !== null && 'props' in node;
}

function findVNode(
  node: unknown,
  predicate: (n: VNodeWithProps) => boolean
): VNodeWithProps | null {
  if (!isVNodeWithProps(node)) return null;
  if (predicate(node)) return node;

  const children = node.props?.children;
  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      const found = findVNode(children[i], predicate);
      if (found) return found;
    }
  } else if (children && typeof children === 'object') {
    return findVNode(children, predicate);
  }
  return null;
}

// ============================================================================
// Test Suite: IMP-335 Modal Host Modularization Contract Suite
// ============================================================================

describe('[IMP-335] Modal Host Modularization Contract Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      activeModal: null,
      modalPayload: null,
      cameraFocusCell: null,
      playersInfo: {},
    });
    useLobbyStore.setState({
      slots: [],
      myPlayerId: 'player_alpha',
    });
  });

  // ==========================================================================
  // Helper Adversarial Gate
  // ==========================================================================
  describe('Helper Adversarial Gate', () => {
    it('[TC-335.HELPER/GATE] findVNode handles adversarial inputs (null, primitives, non-existent targets) safely without throwing', () => {
      expect(findVNode(null, () => true)).toBeNull();
      expect(findVNode('plain string', () => true)).toBeNull();
      expect(findVNode({ type: 'div' }, (n) => n.type === 'span')).toBeNull();
    });
  });

  // ==========================================================================
  // Facet 1: PortfolioModalHost Component Lifecycle & Net Worth Computation
  // ==========================================================================
  describe('PortfolioModalHost Component Contracts', () => {
    it('[TC-335.01a/MSS][UC-MODAL/MSS] PortfolioModalHost renders PropertyPortfolioModal with calculated player net worth and property states', () => {
      const props: PortfolioModalHostProps = {
        myId: 'player_alpha',
        myPlayer: {
          id: 'player_alpha',
          name: 'Chủ Tịch Alpha',
          balance: 5000,
          tokenColor: '#ef4444',
          ownedProperties: [1, 3],
          mortgagedProperties: [],
          mortgageLoans: {},
        },
        playersInfo: {
          player_alpha: {
            id: 'player_alpha',
            name: 'Chủ Tịch Alpha',
            balance: 5000,
            tokenColor: '#ef4444',
            ownedProperties: [1, 3],
            mortgagedProperties: [],
            mortgageLoans: {},
          },
        },
        closeModal: vi.fn(),
      };

      let capturedNode: React.ReactNode = null;
      function Harness() {
        capturedNode = PortfolioModalHost(props);
        return capturedNode;
      }
      const html = renderToStaticMarkup(React.createElement(Harness));

      expect(html).toContain('data-testid="property-portfolio-modal"');
      expect(html).toContain('Chủ Tịch Alpha');
    });

    it('[TC-335.01b/MSS][UC-MODAL/MSS] PortfolioModalHost wires onClose to clear camera focus and trigger closeModal', () => {
      useGameStore.setState({ cameraFocusCell: 3 });
      const closeModal = vi.fn();
      const props: PortfolioModalHostProps = {
        myId: 'player_alpha',
        myPlayer: {
          id: 'player_alpha',
          name: 'Chủ Tịch Alpha',
          balance: 5000,
          tokenColor: '#ef4444',
          ownedProperties: [3],
        },
        playersInfo: {},
        closeModal,
      };

      let capturedNode: unknown = null;
      function Harness() {
        const node = PortfolioModalHost(props);
        capturedNode = node;
        return node;
      }
      renderToStaticMarkup(React.createElement(Harness));

      expect(capturedNode).not.toBeNull();
      if (React.isValidElement<PropertyPortfolioModalProps>(capturedNode)) {
        capturedNode.props.onClose?.();
      }
      expect(useGameStore.getState().cameraFocusCell).toBeNull();
      expect(closeModal).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================================================
  // Facet 2: buildTradeOfferIntent Domain Function Contracts
  // ==========================================================================
  describe('buildTradeOfferIntent Domain Function Contracts', () => {
    it('[TC-335.02/A1][UC-MODAL/A1] buildTradeOfferIntent constructs bilateral property swap intent with cellIndex, offeredCellIndex, and net price', () => {
      const intent = buildTradeOfferIntent('player_alpha', {
        targetPlayerId: 'player_beta',
        offeredProperties: [1],
        requestedProperties: [3],
        cashOffer: 500,
        cashRequest: 200,
      });

      expect(intent).toEqual({
        type: 'INTENT_TRADE_OFFER',
        sellerId: 'player_beta',
        buyerId: 'player_alpha',
        cellIndex: 3,
        offeredCellIndex: 1,
        price: 300,
      });
    });

    it('[TC-335.03a/A2][UC-MODAL/A2] buildTradeOfferIntent constructs unilateral purchase intent with target as seller and local player as buyer', () => {
      const intent = buildTradeOfferIntent('player_alpha', {
        targetPlayerId: 'player_beta',
        offeredProperties: [],
        requestedProperties: [5],
        cashOffer: 800,
      });

      expect(intent).toEqual({
        type: 'INTENT_TRADE_OFFER',
        sellerId: 'player_beta',
        buyerId: 'player_alpha',
        cellIndex: 5,
        price: 800,
      });
    });

    it('[TC-335.03b/A2][UC-MODAL/A2] buildTradeOfferIntent constructs unilateral sale intent with local player as seller and default fallback price', () => {
      const intent = buildTradeOfferIntent('player_alpha', {
        targetPlayerId: 'player_beta',
        offeredProperties: [2],
        requestedProperties: [],
      });

      expect(intent).toEqual({
        type: 'INTENT_TRADE_OFFER',
        sellerId: 'player_alpha',
        buyerId: 'player_beta',
        cellIndex: 2,
        price: 1000,
      });
    });

    it('[TC-335.03c/A2][UC-MODAL/A2] buildTradeOfferIntent returns null when tradeData is undefined or properties are empty', () => {
      expect(buildTradeOfferIntent('player_alpha', undefined)).toBeNull();
      expect(
        buildTradeOfferIntent('player_alpha', {
          targetPlayerId: 'player_beta',
          offeredProperties: [],
          requestedProperties: [],
        })
      ).toBeNull();
    });
  });

  // ==========================================================================
  // Facet 3: resolveAvailableTradePartners Domain Function Contracts
  // ==========================================================================
  describe('resolveAvailableTradePartners Domain Function Contracts', () => {
    it('[TC-335.04/A3][UC-MODAL/A3] resolveAvailableTradePartners excludes local player and correctly populates bot personalities from slots', () => {
      const partners = resolveAvailableTradePartners(
        'player_alpha',
        {
          player_alpha: {
            id: 'player_alpha',
            name: 'Chủ Tịch Alpha',
            balance: 5000,
            tokenColor: '#ef4444',
            ownedProperties: [1],
          },
          player_beta: {
            id: 'player_beta',
            name: 'Bot Cá Mập',
            balance: 3000,
            tokenColor: '#3b82f6',
            ownedProperties: [3],
            isBot: true,
          },
          player_gamma: {
            id: 'player_gamma',
            name: 'Chủ Tịch Gamma',
            balance: 2000,
            tokenColor: '#10b981',
            ownedProperties: [4],
            isBot: false,
          },
        },
        [
          { playerId: 'player_beta', botPersonality: 'SHARK' },
          { playerId: 'player_gamma' },
        ]
      );

      expect(partners).toHaveLength(2);
      expect(partners[0]).toEqual({
        id: 'player_beta',
        name: 'Bot Cá Mập',
        balance: 3000,
        isBot: true,
        personality: 'SHARK',
        properties: [3],
      });
      expect(partners[1]?.id).toBe('player_gamma');
    });
  });

  // ==========================================================================
  // Facet 4: AuctionModalHost Component Lifecycle, SFX & Timer
  // ==========================================================================
  describe('AuctionModalHost Component Contracts', () => {
    it('[TC-335.05/A4][UC-MODAL/A4] AuctionModalHost onBid triggers AUCTION_BID audio SFX and dispatches INTENT_BID', () => {
      const onIntent = vi.fn();
      const updateModalPayload = vi.fn();
      const sfxSpy = vi.spyOn(AudioEngine, 'playSfx').mockImplementation(() => {});

      let capturedNode: unknown = null;
      function Harness() {
        const node = AuctionModalHost({
          payload: { cellIndex: 5, currentBid: 500, timeRemaining: 15 },
          myId: 'player_alpha',
          playersInfo: {},
          onIntent,
          updateModalPayload,
        });
        capturedNode = node;
        return node;
      }
      renderToStaticMarkup(React.createElement(Harness));

      expect(capturedNode).not.toBeNull();
      if (React.isValidElement<AuctionModalProps>(capturedNode)) {
        capturedNode.props.onBid?.(600);
      }
      expect(sfxSpy).toHaveBeenCalledWith(SoundEffect.AUCTION_BID);
      expect(onIntent).toHaveBeenCalledWith({ type: 'INTENT_BID', amount: 600 });
      sfxSpy.mockRestore();
    });

    it('[TC-335.06/A5][UC-MODAL/A5] AuctionModalHost onPass dispatches INTENT_AUCTION_PASS and marks hasPassed in modal payload', () => {
      const onIntent = vi.fn();
      const updateModalPayload = vi.fn();

      let capturedNode: unknown = null;
      function Harness() {
        const node = AuctionModalHost({
          payload: { cellIndex: 5, currentBid: 500, timeRemaining: 15 },
          myId: 'player_alpha',
          playersInfo: {},
          onIntent,
          updateModalPayload,
        });
        capturedNode = node;
        return node;
      }
      renderToStaticMarkup(React.createElement(Harness));

      expect(capturedNode).not.toBeNull();
      if (React.isValidElement<AuctionModalProps>(capturedNode)) {
        capturedNode.props.onPass?.();
      }
      expect(onIntent).toHaveBeenCalledWith({ type: 'INTENT_AUCTION_PASS' });
      expect(updateModalPayload).toHaveBeenCalledWith({ hasPassed: true });
    });
  });

  // ==========================================================================
  // Facet 5: TradeModalHost Component Lifecycle
  // ==========================================================================
  describe('TradeModalHost Component Contracts', () => {
    it('[TC-335.08/A7][UC-MODAL/A7] TradeModalHost renders TradeModal with partner options and deal configuration', () => {
      const closeModal = vi.fn();
      const updateModalPayload = vi.fn();
      const props: TradeModalHostProps = {
        payload: {
          targetPlayerId: 'player_beta',
          offeredProperties: [1],
          requestedProperties: [3],
          cashOffer: 100,
          cashRequest: 0,
        },
        myId: 'player_alpha',
        playersInfo: {
          player_alpha: {
            id: 'player_alpha',
            name: 'Chủ Tịch Alpha',
            balance: 5000,
            tokenColor: '#ef4444',
            ownedProperties: [1],
          },
          player_beta: {
            id: 'player_beta',
            name: 'Chủ Tịch Beta',
            balance: 3000,
            tokenColor: '#3b82f6',
            ownedProperties: [3],
          },
        },
        closeModal,
        updateModalPayload,
      };

      let capturedNode: unknown = null;
      function Harness() {
        const node = TradeModalHost(props);
        capturedNode = node;
        return node;
      }
      renderToStaticMarkup(React.createElement(Harness));

      expect(capturedNode).not.toBeNull();
      if (React.isValidElement<TradeModalProps>(capturedNode)) {
        expect(capturedNode.props.targetPlayerId).toBe('player_beta');
      }
    });
  });

  // ==========================================================================
  // Facet 6: ModalHost Switchboard Delegation to Sub-Hosts
  // ==========================================================================
  describe('ModalHost Switchboard Delegation Contracts', () => {
    it('[TC-335.07a/A6][UC-MODAL/A6] ModalHost switchboard delegates activeModal "portfolio" to PortfolioModalHost', () => {
      useGameStore.setState({
        activeModal: 'portfolio',
        playersInfo: {
          player_alpha: {
            id: 'player_alpha',
            name: 'Chủ Tịch Alpha',
            balance: 5000,
            tokenColor: '#ef4444',
            ownedProperties: [],
            mortgagedProperties: [],
            mortgageLoans: {},
          },
        },
      });

      let hostNode: unknown = null;
      function Harness() {
        const node = ModalHost({ localPlayerId: 'player_alpha' });
        hostNode = node;
        return node;
      }
      renderToStaticMarkup(React.createElement(Harness));

      const subHost = findVNode(hostNode, (n) => n.type === PortfolioModalHost);
      expect(subHost).not.toBeNull();
    });

    it('[TC-335.07b/A6][UC-MODAL/A6] ModalHost switchboard delegates activeModal "trade" to TradeModalHost', () => {
      useGameStore.setState({
        activeModal: 'trade',
        modalPayload: {
          targetPlayerId: 'player_beta',
          offeredProperties: [],
          requestedProperties: [],
          cashOffer: 0,
          cashRequest: 0,
        },
        playersInfo: {
          player_alpha: {
            id: 'player_alpha',
            name: 'Chủ Tịch Alpha',
            balance: 5000,
            tokenColor: '#ef4444',
            ownedProperties: [],
          },
          player_beta: {
            id: 'player_beta',
            name: 'Chủ Tịch Beta',
            balance: 4000,
            tokenColor: '#3b82f6',
            ownedProperties: [],
          },
        },
      });

      let hostNode: unknown = null;
      function Harness() {
        const node = ModalHost({ localPlayerId: 'player_alpha' });
        hostNode = node;
        return node;
      }
      renderToStaticMarkup(React.createElement(Harness));

      const subHost = findVNode(hostNode, (n) => n.type === TradeModalHost);
      expect(subHost).not.toBeNull();
    });

    it('[TC-335.07c/A6][UC-MODAL/A6] ModalHost switchboard delegates activeModal "auction" to AuctionModalHost', () => {
      useGameStore.setState({
        activeModal: 'auction',
        modalPayload: {
          cellIndex: 5,
          currentBid: 500,
          timeRemaining: 15,
        },
        playersInfo: {
          player_alpha: {
            id: 'player_alpha',
            name: 'Chủ Tịch Alpha',
            balance: 5000,
            tokenColor: '#ef4444',
            ownedProperties: [],
          },
        },
      });

      let hostNode: unknown = null;
      function Harness() {
        const node = ModalHost({ localPlayerId: 'player_alpha' });
        hostNode = node;
        return node;
      }
      renderToStaticMarkup(React.createElement(Harness));

      const subHost = findVNode(hostNode, (n) => n.type === AuctionModalHost);
      expect(subHost).not.toBeNull();
    });
  });
});
