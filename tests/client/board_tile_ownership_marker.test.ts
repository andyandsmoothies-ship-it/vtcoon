import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  SafeBillboard,
  OwnershipMarkerInstances,
  type OwnershipMarkerInstancesProps,
} from '../../src/client/3d/board_tile_ownership_marker';

interface ComponentPropsWithCastShadow {
  readonly castShadow?: boolean;
}

interface TreeWithChildrenProps {
  readonly children?: React.ReactNode;
}

function getCapturedMarkerTree(props: OwnershipMarkerInstancesProps): React.ReactElement<TreeWithChildrenProps> {
  let captured: React.ReactElement<TreeWithChildrenProps> | null = null;
  function CaptureHost(): React.ReactElement {
    const el = OwnershipMarkerInstances(props);
    if (React.isValidElement<TreeWithChildrenProps>(el)) {
      captured = el;
    }
    return el;
  }
  renderToStaticMarkup(React.createElement(CaptureHost));
  return captured!;
}

describe('BoardTileOwnershipMarker Module (IMP-317 Contract)', () => {
  describe('SafeBillboard Subsystem', () => {
    it('[TC-317.01] renders billboard element with follow="true" in SSR environment', () => {
      const markup = renderToStaticMarkup(
        React.createElement(SafeBillboard, { follow: true }, React.createElement('span', null, 'content'))
      );
      expect(markup).toContain('<billboard');
      expect(markup).toContain('follow="true"');
      expect(markup).toContain('content</span>');
    });

    it('[TC-317.02] preserves custom props and name on billboard element', () => {
      const markup = renderToStaticMarkup(
        React.createElement(SafeBillboard, { follow: false, name: 'CustomBillboard' })
      );
      expect(markup).toContain('name="CustomBillboard"');
      expect(markup).toContain('follow="false"');
    });
  });

  describe('OwnershipMarkerInstances Structure & Defaults', () => {
    it('[TC-317.03] renders group with name="OwnershipMarkerInstances"', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, {})
      );
      expect(markup).toContain('name="OwnershipMarkerInstances"');
      expect(markup.includes('name="OwnershipMarkerInstances"')).toBe(true);
    });

    it('[TC-317.04] renders FlagPole totem pillar with cylinderGeometry', () => {
      const tree = getCapturedMarkerTree({});
      const children = React.Children.toArray(tree.props.children);
      const flagPoleNode = React.isValidElement<ComponentPropsWithCastShadow>(children[0]) ? children[0] : null;
      expect(flagPoleNode?.props?.castShadow).toBe(true);
      const markup = renderToStaticMarkup(React.createElement(OwnershipMarkerInstances, {}));
      expect(markup).toContain('name="FlagPole"');
      expect(markup).toContain('args="0.016,0.022,0.45,12"');
    });

    it('[TC-317.05] renders MascotCrestShield with data-testid="mascot-crest-shield"', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, {})
      );
      expect(markup).toContain('name="MascotCrestShield"');
      expect(markup).toContain('data-testid="mascot-crest-shield"');
      expect(markup).toContain('color="#F59E0B"');
      expect(markup).not.toContain('color="#000000"');
    });

    it('[TC-317.06] renders FlagCloth instancedMesh carrying owner color', () => {
      const tree = getCapturedMarkerTree({ ownerColor: '#10B981' });
      const children = React.Children.toArray(tree.props.children);
      const clothNode = React.isValidElement<ComponentPropsWithCastShadow>(children[2]) ? children[2] : null;
      expect(clothNode?.props?.castShadow).toBe(true);
      const markup = renderToStaticMarkup(React.createElement(OwnershipMarkerInstances, { ownerColor: '#10B981' }));
      expect(markup).toContain('name="FlagCloth"');
      expect(markup).toContain('color="#10B981"');
      expect(markup).toContain('args="0.18,0.1,0.01"');
    });

    it('[TC-317.07] renders OwnershipBillboardPin with data-testid', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, {})
      );
      expect(markup).toContain('data-testid="ownership-billboard-pin"');
      expect(markup).toContain('name="OwnershipBillboardPin"');
    });

    it('[TC-317.08] defaults ownerColor to #DC2626 when omitted', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, {})
      );
      expect(markup).toContain('color="#DC2626"');
    });
  });

  describe('Mascot Icon Resolution', () => {
    it('[TC-317.09] resolves explicit mascotIcon prop when passed', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, { mascotIcon: '🐎' })
      );
      expect(markup).toContain('data-mascot-icon="🐎"');
      expect(markup).toContain('name="MascotIcon_🐎"');
      expect(markup).toContain('args="0.08,0.08"');
    });

    it('[TC-317.10] resolves ownerSlot 0 to luxury pawn icon', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, { ownerSlot: 0 })
      );
      expect(markup).toContain('data-mascot-icon="🏰"');
    });

    it('[TC-317.11] resolves ownerSlot 1 to luxury pawn icon', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, { ownerSlot: 1 })
      );
      expect(markup).toContain('data-mascot-icon="💣"');
    });

    it('[TC-317.12] resolves ownerSlot 2 to luxury pawn icon', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, { ownerSlot: 2 })
      );
      expect(markup).toContain('data-mascot-icon="🐎"');
    });

    it('[TC-317.13] resolves ownerSlot 3 to luxury pawn icon', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, { ownerSlot: 3 })
      );
      expect(markup).toContain('data-mascot-icon="👑"');
    });

    it('[TC-317.14] falls back to default icon when ownerSlot is out of range', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, { ownerSlot: 99 })
      );
      expect(markup).toContain('data-mascot-icon="🏰"');
    });
  });

  describe('Tier Level Indicator Rings Clamping', () => {
    it('[TC-317.15] level 0 renders zero tier indicator rings', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, { level: 0 })
      );
      expect(markup).not.toContain('name="TierIndicatorRings"');
      expect(markup.includes('name="TierIndicatorRings"')).toBe(false);
      expect(markup).not.toContain('name="TierRing_1"');
    });

    it('[TC-317.16] negative level clamps to zero tier rings', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, { level: -2 })
      );
      expect(markup).not.toContain('name="TierIndicatorRings"');
    });

    it('[TC-317.17] level 1 renders 1 tier ring with correct base position', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, { level: 1 })
      );
      expect(markup).toContain('name="TierRing_1"');
      expect(markup).toContain('position="0,0.08,0"');
      expect(markup).toContain('args="0.022,0.022,0.014,12"');
      expect(markup).not.toContain('name="TierRing_2"');
    });

    it('[TC-317.18] level 2 renders 2 tier rings', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, { level: 2 })
      );
      expect(markup).toContain('name="TierRing_1"');
      expect(markup).toContain('name="TierRing_2"');
      expect(markup).not.toContain('name="TierRing_3"');
    });

    it('[TC-317.19] level 3 renders 3 tier rings', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, { level: 3 })
      );
      expect(markup).toContain('name="TierRing_1"');
      expect(markup).toContain('name="TierRing_2"');
      expect(markup).toContain('name="TierRing_3"');
    });

    it('[TC-317.20] excessive level clamps to maximum 3 tier rings', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, { level: 8 })
      );
      expect(markup).toContain('name="TierRing_3"');
      expect(markup).not.toContain('name="TierRing_4"');
    });

    it('[TC-317.21] float level floors to integer ring count', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, { level: 2.8 })
      );
      expect(markup).toContain('name="TierRing_2"');
      expect(markup).not.toContain('name="TierRing_3"');
    });
  });
});
