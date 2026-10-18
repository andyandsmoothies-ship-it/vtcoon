// [UI-S02/MSS] LivingTabletopDiorama.tsx — Animated GLTF Tabletop Diorama Coordinator & Water Shimmer Controller
import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { useAnimations, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import {
  SafeGLTFModel,
  SafeModelErrorBoundary,
  isHeadlessOrTestEnv,
} from './asset_loader/safe_gltf_model';
import { useSafeFrame } from './safe_frame';
import {
  ACTION_CRUISERS_BOBBING,
  ACTION_METRO_LOOP,
  TABLETOP_DIORAMA_GLB_URL,
  configureTabletopSceneAndCollectWater,
  createWaterRippleNormalTexture,
  stepWaterShimmerMaterials,
} from './living_tabletop_diorama_visuals';

export interface LivingTabletopDioramaProps {
  readonly isMobile?: boolean;
}

function InnerLivingTabletopDiorama({ isMobile = false }: LivingTabletopDioramaProps): React.ReactElement {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(TABLETOP_DIORAMA_GLB_URL);
  const { actions, mixer } = useAnimations(animations, groupRef);
  const waterMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const rippleTexture = useMemo(() => createWaterRippleNormalTexture(), []);

  useEffect(() => {
    waterMaterialsRef.current = configureTabletopSceneAndCollectWater(scene, isMobile, rippleTexture);
  }, [scene, isMobile, rippleTexture]);

  useEffect(() => {
    const metroAction = actions[ACTION_METRO_LOOP];
    if (metroAction) {
      metroAction.reset().setLoop(THREE.LoopRepeat, Infinity).play();
      metroAction.timeScale = 1.0;
    }

    const cruisersAction = actions[ACTION_CRUISERS_BOBBING];
    if (cruisersAction) {
      cruisersAction.reset().setLoop(THREE.LoopRepeat, Infinity).play();
      cruisersAction.timeScale = 1.0;
    }

    return () => {
      metroAction?.stop();
      cruisersAction?.stop();
      mixer.stopAllAction();
    };
  }, [actions, mixer]);

  useEffect(() => {
    return () => {
      rippleTexture.dispose();
    };
  }, [rippleTexture]);

  useSafeFrame((state, delta) => {
    stepWaterShimmerMaterials(waterMaterialsRef.current, state.clock.elapsedTime, delta);
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} data-testid="living-tabletop-diorama">
      <primitive object={scene} />
    </group>
  );
}

export function LivingTabletopDiorama({ isMobile = false }: LivingTabletopDioramaProps = {}): React.ReactElement {
  const startTimeRef = useRef(performance.now());
  const headlessFallback = (
    <group position={[0, 0, 0]} data-testid="living-tabletop-diorama">
      <SafeGLTFModel
        url={TABLETOP_DIORAMA_GLB_URL}
        position={[0, 0, 0]}
        receiveShadow
        castShadow={!isMobile}
        fallback={null}
      />
    </group>
  );

  if (isHeadlessOrTestEnv()) {
    return headlessFallback;
  }

  return (
    <SafeModelErrorBoundary
      fallback={headlessFallback}
      startTime={startTimeRef.current}
      url={TABLETOP_DIORAMA_GLB_URL}
    >
      <Suspense fallback={headlessFallback}>
        <InnerLivingTabletopDiorama isMobile={isMobile} />
      </Suspense>
    </SafeModelErrorBoundary>
  );
}
