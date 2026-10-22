// [IMP-454] Thematic Transport Vehicle Presentation Component
import React, { useRef } from 'react';
import type { Group, PointLight } from 'three';
import { useFrame } from '@react-three/fiber';
import { SafeGLTFModel } from './asset_loader/safe_gltf_model.js';
import {
  calculateTransportVehicleTransform,
  type TransportCalcParams,
} from './thematic_transport_calc.js';

SafeGLTFModel.preload('/models/vehicles/vehicle_police.glb');
SafeGLTFModel.preload('/models/vehicles/vehicle_plane.glb');

export interface ThematicTransportVehicleProps extends Omit<TransportCalcParams, 'progress'> {
  readonly progressRef?: React.MutableRefObject<number>;
  readonly visible?: boolean;
}

export function ThematicTransportVehicle({
  flightType,
  fromCell,
  toCell,
  progressRef,
  visible = true,
}: ThematicTransportVehicleProps): React.ReactElement | null {
  const groupRef = useRef<Group>(null);
  const lightRef = useRef<PointLight>(null);

  useFrame(() => {
    const progress = progressRef ? progressRef.current : 0;
    const transform = calculateTransportVehicleTransform({
      progress,
      fromCell,
      toCell,
      flightType,
      timestampMs: Date.now(),
    });

    if (groupRef.current) {
      groupRef.current.position.set(...transform.position);
      groupRef.current.rotation.set(...transform.rotation);
      groupRef.current.scale.set(...transform.scale);
    }

    if (lightRef.current && transform.sirenActive) {
      lightRef.current.color.set(transform.sirenActive === 'red' ? '#EF4444' : '#3B82F6');
    }
  });

  if (!visible) return null;

  const isPolice = flightType === 'audit';
  const modelUrl = isPolice
    ? '/models/vehicles/vehicle_police.glb'
    : '/models/vehicles/vehicle_plane.glb';

  return (
    <group ref={groupRef} name="ThematicTransportVehicle" data-testid="thematic-transport-vehicle">
      <SafeGLTFModel url={modelUrl} />
      {isPolice && (
        <pointLight
          ref={lightRef}
          intensity={2.0}
          distance={1.8}
          position={[0, 0.25, 0]}
        />
      )}
    </group>
  );
}
