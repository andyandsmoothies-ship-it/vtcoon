// [UI-S02/MSS][IMP-377] Instanced Cell Borders & Price Pill Trays Component
import React, { useRef, useLayoutEffect, useEffect } from 'react';
import * as THREE from 'three';
import {
  PURCHASABLE_CELL_INDICES,
  TOTAL_PURCHASABLE_CELLS,
  getPurchasableCellSlot,
  OWNER_BASE_TRIM_BORDER_GEOM,
  OWNER_BASE_TRIM_GEOM,
  PLAZA_TRIM_BORDER_GEOM,
  PRICE_PILL_OUTER_FRAME_GEOM,
  PRICE_PILL_BASE_GEOM,
  computeCellMarkerMatrices,
} from './instanced_cell_markers_helpers';
import { isCellInMonopolyGroup, type MonopolyGroupInfo } from './monopoly_plaza_math';

export interface InstancedCellBordersAndTraysProps {
  readonly ownerInfoMap: Record<number, { tokenColor: string }>;
  readonly monopolyGroups: Record<string, MonopolyGroupInfo> | null | undefined;
  readonly isHeatmapActive?: boolean;
}

export function InstancedCellBordersAndTrays({
  ownerInfoMap,
  monopolyGroups,
  isHeatmapActive = false,
}: InstancedCellBordersAndTraysProps): React.ReactElement {
  const baseTrimBorderRef = useRef<THREE.InstancedMesh>(null);
  const baseTrimRef = useRef<THREE.InstancedMesh>(null);
  const plazaTrimBorderRef = useRef<THREE.InstancedMesh>(null);
  const pricePillOuterFrameRef = useRef<THREE.InstancedMesh>(null);
  const pricePillBaseRef = useRef<THREE.InstancedMesh>(null);
  const prevFingerprintRef = useRef<string>('');

  // 1. Khởi tạo sẵn instanceColor buffer trên mount trong useLayoutEffect để Three.js inject #define USE_INSTANCING_COLOR ngay từ frame 0
  useLayoutEffect(() => {
    const initBuffer = (ref: React.RefObject<THREE.InstancedMesh | null>, hex: string) => {
      const mesh = ref.current;
      if (!mesh) return;
      if (!mesh.instanceColor) {
        mesh.instanceColor = new THREE.InstancedBufferAttribute(
          new Float32Array(TOTAL_PURCHASABLE_CELLS * 3),
          3
        );
      }
      const c = new THREE.Color(hex);
      for (let i = 0; i < TOTAL_PURCHASABLE_CELLS; i++) {
        mesh.setColorAt(i, c);
      }
      mesh.instanceColor.needsUpdate = true;
      if (mesh.material) {
        (mesh.material as THREE.Material).needsUpdate = true;
      }
    };

    initBuffer(baseTrimRef, '#DC2626');
    initBuffer(pricePillOuterFrameRef, '#1E293B');
    initBuffer(pricePillBaseRef, '#090D1A');
  }, []);

  // 2. Cập nhật ma trận và bảng màu động khi có thay đổi quyền sở hữu hoặc độc quyền
  useEffect(() => {
    const fingerprint = PURCHASABLE_CELL_INDICES.map(
      (idx) => `${idx}:${ownerInfoMap[idx]?.tokenColor ?? ''}:${isCellInMonopolyGroup(idx, monopolyGroups)}`
    ).join('|');

    if (fingerprint === prevFingerprintRef.current) {
      return; // Skip GPU buffer re-upload if ownership and monopoly state have not changed
    }
    prevFingerprintRef.current = fingerprint;

    const tempMatrices = {
      ownerBaseTrimBorder: new THREE.Matrix4(),
      ownerBaseTrim: new THREE.Matrix4(),
      plazaTrimBorder: new THREE.Matrix4(),
      pricePillOuterFrame: new THREE.Matrix4(),
      pricePillBase: new THREE.Matrix4(),
    };
    const tempColor = new THREE.Color();

    PURCHASABLE_CELL_INDICES.forEach((cellIndex) => {
      const slot = getPurchasableCellSlot(cellIndex);
      if (slot === undefined) return;

      const owner = ownerInfoMap[cellIndex];
      const isOwned = Boolean(owner?.tokenColor);
      const isMonopoly = isOwned ? isCellInMonopolyGroup(cellIndex, monopolyGroups) : false;

      computeCellMarkerMatrices(cellIndex, isOwned, isMonopoly, tempMatrices);

      baseTrimBorderRef.current?.setMatrixAt(slot, tempMatrices.ownerBaseTrimBorder);
      baseTrimRef.current?.setMatrixAt(slot, tempMatrices.ownerBaseTrim);
      plazaTrimBorderRef.current?.setMatrixAt(slot, tempMatrices.plazaTrimBorder);
      pricePillOuterFrameRef.current?.setMatrixAt(slot, tempMatrices.pricePillOuterFrame);
      pricePillBaseRef.current?.setMatrixAt(slot, tempMatrices.pricePillBase);

      if (owner?.tokenColor) {
        tempColor.set(owner.tokenColor);
        baseTrimRef.current?.setColorAt(slot, tempColor);
        pricePillBaseRef.current?.setColorAt(slot, tempColor);
        tempColor.set('#F59E0B');
        pricePillOuterFrameRef.current?.setColorAt(slot, tempColor);
      } else {
        tempColor.set('#090D1A');
        pricePillBaseRef.current?.setColorAt(slot, tempColor);
        tempColor.set('#1E293B');
        pricePillOuterFrameRef.current?.setColorAt(slot, tempColor);
      }
    });

    if (baseTrimBorderRef.current) baseTrimBorderRef.current.instanceMatrix.needsUpdate = true;
    if (baseTrimRef.current) {
      baseTrimRef.current.instanceMatrix.needsUpdate = true;
      if (baseTrimRef.current.instanceColor) baseTrimRef.current.instanceColor.needsUpdate = true;
    }
    if (plazaTrimBorderRef.current) plazaTrimBorderRef.current.instanceMatrix.needsUpdate = true;
    if (pricePillOuterFrameRef.current) {
      pricePillOuterFrameRef.current.instanceMatrix.needsUpdate = true;
      if (pricePillOuterFrameRef.current.instanceColor) pricePillOuterFrameRef.current.instanceColor.needsUpdate = true;
    }
    if (pricePillBaseRef.current) {
      pricePillBaseRef.current.instanceMatrix.needsUpdate = true;
      if (pricePillBaseRef.current.instanceColor) pricePillBaseRef.current.instanceColor.needsUpdate = true;
    }
  }, [ownerInfoMap, monopolyGroups]);

  return (
    <group data-testid="instanced-cell-borders-and-trays">
      {/* 1. Viền ngoài chân đế (Dark Slate #0F172A) */}
      <instancedMesh
        ref={baseTrimBorderRef}
        args={[OWNER_BASE_TRIM_BORDER_GEOM, undefined, TOTAL_PURCHASABLE_CELLS]}
        receiveShadow
        receiveshadow="true"
        frustumCulled={false}
        frustumculled="false"
      >
        <meshStandardMaterial color="#0F172A" roughness={0.7} metalness={0.2} />
      </instancedMesh>

      {/* 2. Viền màu chân đế mang màu người chơi & phát quang nhiệt khi bật heatmap */}
      <instancedMesh
        ref={baseTrimRef}
        args={[OWNER_BASE_TRIM_GEOM, undefined, TOTAL_PURCHASABLE_CELLS]}
        receiveShadow
        receiveshadow="true"
        frustumCulled={false}
        frustumculled="false"
      >
        <meshStandardMaterial
          roughness={0.3}
          metalness={0.4}
          emissive="#F59E0B"
          emissiveIntensity={isHeatmapActive ? 1.4 : 0.0}
        />
      </instancedMesh>

      {/* 3. Viền đai ánh kim vàng khi đạt độc quyền (#F59E0B) */}
      <instancedMesh
        ref={plazaTrimBorderRef}
        args={[PLAZA_TRIM_BORDER_GEOM, undefined, TOTAL_PURCHASABLE_CELLS]}
        receiveShadow
        receiveshadow="true"
        frustumCulled={false}
        frustumculled="false"
      >
        <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.9} />
      </instancedMesh>

      {/* 4. Viền ngoài khay giá tiền mạ vàng hoàng gia (#F59E0B) */}
      <instancedMesh
        ref={pricePillOuterFrameRef}
        args={[PRICE_PILL_OUTER_FRAME_GEOM, undefined, TOTAL_PURCHASABLE_CELLS]}
        receiveShadow
        receiveshadow="true"
        frustumCulled={false}
        frustumculled="false"
      >
        <meshStandardMaterial roughness={0.3} metalness={0.85} />
      </instancedMesh>

      {/* 5. Nền chính khay giá tiền mang màu người chơi */}
      <instancedMesh
        ref={pricePillBaseRef}
        args={[PRICE_PILL_BASE_GEOM, undefined, TOTAL_PURCHASABLE_CELLS]}
        receiveShadow
        receiveshadow="true"
        frustumCulled={false}
        frustumculled="false"
      >
        <meshStandardMaterial roughness={0.35} metalness={0.25} />
      </instancedMesh>
    </group>
  );
}
