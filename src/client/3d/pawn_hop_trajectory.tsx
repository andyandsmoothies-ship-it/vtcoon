import React, { useMemo, useEffect } from 'react';
import { MeshStandardMaterial, TubeGeometry } from 'three';
import { cellPosition } from './board_coords';
import { BASE_PAWN_Y, DEFAULT_JUMP_ARC } from './pawn_path';
import {
  createHopTrajectoryCurve,
  addTubeCenters,
  applyTubeWidth,
  buildCurveLineGeometry,
} from './curve_line_buffer';

export interface PawnHopTrajectoryProps {
  readonly fromCell: number;
  readonly toCell: number;
  readonly offset?: readonly [number, number, number];
  readonly color?: string;
  readonly arcHeight?: number;
  readonly visible?: boolean;
  readonly width?: number;
  readonly showGuideLine?: boolean;
}

export function PawnHopTrajectory({
  fromCell,
  toCell,
  offset,
  color = '#F59E0B',
  arcHeight = DEFAULT_JUMP_ARC,
  visible = true,
  width = 1.0,
  showGuideLine = false,
}: PawnHopTrajectoryProps): React.ReactElement | null {
  // [DIR-CHALLENGE-02] Bù trừ offset quân cờ khi chung ô tránh lệch cung nhảy ~15cm
  const fromPos = useMemo(() => {
    const p = cellPosition(fromCell);
    const ox = offset ? offset[0] : 0;
    const oy = offset ? offset[1] : 0;
    const oz = offset ? offset[2] : 0;
    return [p[0] + ox, BASE_PAWN_Y + oy, p[2] + oz] as const;
  }, [fromCell, offset]);

  const toPos = useMemo(() => {
    const p = cellPosition(toCell);
    const ox = offset ? offset[0] : 0;
    const oy = offset ? offset[1] : 0;
    const oz = offset ? offset[2] : 0;
    return [p[0] + ox, BASE_PAWN_Y + oy, p[2] + oz] as const;
  }, [toCell, offset]);

  const trajectoryGeometry = useMemo(() => {
    if (!visible || fromCell === toCell) return null;
    const curve = createHopTrajectoryCurve(fromPos, toPos, arcHeight);
    if (showGuideLine) {
      return buildCurveLineGeometry(curve, 20);
    }
    const geom = new TubeGeometry(curve, 20, 0.015, 4, false);
    return addTubeCenters(geom, curve, 20);
  }, [fromPos, toPos, arcHeight, visible, fromCell, toCell, showGuideLine]);

  const trajectoryMaterial = useMemo(() => {
    const mat = new MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85,
    });
    return applyTubeWidth(mat, width);
  }, [color, width]);

  useEffect(() => {
    return () => {
      trajectoryGeometry?.dispose();
      trajectoryMaterial.dispose();
    };
  }, [trajectoryGeometry, trajectoryMaterial]);

  if (!visible || !trajectoryGeometry || fromCell === toCell) {
    return null;
  }

  return (
    <mesh
      name="PawnHopTrajectory"
      data-testid="pawn-hop-trajectory"
      geometry={trajectoryGeometry}
      material={trajectoryMaterial}
    />
  );
}
