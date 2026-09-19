import React from 'react';
import type { MonopolyGroupInfo } from './monopoly_plaza_math';

export interface MonopolyPlazaFusionProps {
  readonly monopolyGroups?: Record<string, MonopolyGroupInfo> | null;
  readonly isHeatmapActive?: boolean;
}

export function MonopolyPlazaFusion({ monopolyGroups }: MonopolyPlazaFusionProps): React.ReactElement | null {
  if (!monopolyGroups || Object.keys(monopolyGroups).length === 0) return null;
  const groups = Object.values(monopolyGroups);
  if (groups.length === 0) return null;

  return (
    <group name="MonopolyPlazaFusionGroup">
      {groups.map((g) => (
        <group key={g.colorGroup} name="InnerPlazaGarland" data-testid="inner-plaza-garland">
          {/* Dải cờ hoa vỉa hè mép trong sa bàn diorama */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.2, 0.05, 0.2]} />
            <meshStandardMaterial color={g.ownerColor} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
