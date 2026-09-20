// [UI-S02/MSS][IMP-92][IMP-134] Diorama Railroad Infrastructure, Stations & Model Train
import React, { useRef, useMemo } from 'react';
import { Vector3, type Group } from 'three';
import { useSafeFrame } from '../safe_frame';
import {
  computeTrainKinematics,
  computeCarriageProgress,
  computeTrainYaw,
  getRailroadTrackCurve,
  getRailroadTrackPerimeter,
  TRAIN_CARRIAGE_OFFSETS,
} from './diorama_train_kinematics';

export * from './diorama_train_kinematics';

function SafeBoxGeometry({ args }: { readonly args: readonly number[] }): React.ReactElement {
  if (typeof window === 'undefined') {
    return React.createElement('boxgeometry', { args });
  }
  return <boxGeometry args={args as [number, number, number]} />;
}

function SafeCylinderGeometry({ args }: { readonly args: readonly number[] }): React.ReactElement {
  if (typeof window === 'undefined') {
    return React.createElement('cylindergeometry', { args });
  }
  return <cylinderGeometry args={args as [number, number, number, number]} />;
}

function SafeSphereGeometry({ args }: { readonly args: readonly number[] }): React.ReactElement {
  if (typeof window === 'undefined') {
    return React.createElement('spheregeometry', { args });
  }
  return <sphereGeometry args={args as [number, number, number]} />;
}

export function DioramaBallastBed(): React.ReactElement {
  return (
    <group position={[0, 0, 0]} data-testid="diorama-railroad-ballast">
      {/* 1. Bệ đá ba-lát cạnh Bắc (North Ballast Track) */}
      <mesh receiveShadow position={[0, 0.018, -6.9]}>
        <SafeBoxGeometry args={[14.2, 0.016, 0.36]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      {/* 2. Bệ đá ba-lát cạnh Nam (South Ballast Track) */}
      <mesh receiveShadow position={[0, 0.018, 6.9]}>
        <SafeBoxGeometry args={[14.2, 0.016, 0.36]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      {/* 3. Bệ đá ba-lát cạnh Tây (West Ballast Track) */}
      <mesh receiveShadow position={[-6.9, 0.018, 0]}>
        <SafeBoxGeometry args={[0.36, 0.016, 14.2]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      {/* 4. Bệ đá ba-lát cạnh Đông (East Ballast Track) */}
      <mesh receiveShadow position={[6.9, 0.018, 0]}>
        <SafeBoxGeometry args={[0.36, 0.016, 14.2]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
    </group>
  );
}

export function DioramaWaterfrontStation(): React.ReactElement {
  return (
    <group position={[0, 0, 0]} data-testid="diorama-waterfront-station">
      {/* 1. Thềm ke ga lát đá cẩm thạch sáng màu dọc tuyến đường sắt ven sông Nam */}
      <mesh receiveShadow position={[-1.6, 0.025, 6.55]}>
        <SafeBoxGeometry args={[2.0, 0.03, 0.36]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* 2. Mái che ke ga kiểu lam vòm màu hổ phách sang trọng */}
      <mesh position={[-1.6, 0.16, 6.55]}>
        <SafeBoxGeometry args={[1.9, 0.015, 0.40]} />
        <meshStandardMaterial color="#D97706" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* 3. Cột thép chịu lực đỡ mái che */}
      <mesh position={[-2.3, 0.09, 6.55]}>
        <SafeCylinderGeometry args={[0.015, 0.015, 0.12, 8]} />
        <meshStandardMaterial color="#64748B" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-0.9, 0.09, 6.55]}>
        <SafeCylinderGeometry args={[0.015, 0.015, 0.12, 8]} />
        <meshStandardMaterial color="#64748B" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 4. Ghế dài nghỉ chân cho hành khách chờ tàu */}
      <mesh receiveShadow position={[-1.6, 0.05, 6.55]}>
        <SafeBoxGeometry args={[0.45, 0.02, 0.12]} />
        <meshStandardMaterial color="#78350F" roughness={0.5} />
      </mesh>

      {/* 5. Cột đèn tín hiệu nhà ga với chao đèn hoàng kim */}
      <mesh position={[-0.65, 0.13, 6.55]}>
        <SafeSphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#FDE047" emissive="#FDE047" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

export function DioramaLandmarkNorthStation(): React.ReactElement {
  return (
    <group position={[1.6, 0.025, -6.55]} data-testid="diorama-landmark-north-station">
      {/* 1. Thềm ga granite sáng màu dọc bờ Bắc */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <SafeBoxGeometry args={[2.2, 0.03, 0.38]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* 2. Mái vòm kính xanh lơ che phủ ke ga */}
      <mesh position={[0, 0.16, 0]}>
        <SafeBoxGeometry args={[2.1, 0.015, 0.42]} />
        <meshStandardMaterial color="#0284C7" metalness={0.4} roughness={0.2} transparent opacity={0.85} />
      </mesh>

      {/* 3. Cột thép chịu lực đỡ kết cấu mái */}
      <mesh position={[-0.8, 0.08, 0]}>
        <SafeCylinderGeometry args={[0.015, 0.015, 0.13, 8]} />
        <meshStandardMaterial color="#64748B" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.8, 0.08, 0]}>
        <SafeCylinderGeometry args={[0.015, 0.015, 0.13, 8]} />
        <meshStandardMaterial color="#64748B" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 4. Biển hiệu LED vàng hoàng kim Landmark Metro */}
      <mesh position={[0, 0.19, 0]}>
        <SafeBoxGeometry args={[0.6, 0.03, 0.04]} />
        <meshStandardMaterial color="#FEF08A" emissive="#FEF08A" emissiveIntensity={0.8} />
      </mesh>

      {/* 5. Ghế chờ hành khách */}
      <mesh receiveShadow position={[0, 0.03, 0]}>
        <SafeBoxGeometry args={[0.5, 0.02, 0.12]} />
        <meshStandardMaterial color="#78350F" roughness={0.5} />
      </mesh>

      {/* 6. Chao đèn tín hiệu phía Bắc */}
      <mesh position={[0.95, 0.12, 0]}>
        <SafeSphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#FEF08A" emissive="#FEF08A" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

interface FloraBedConfig {
  readonly x: number;
  readonly z: number;
  readonly flowerColor: string;
  readonly bushColor: string;
}

const TROPICAL_FLORA_BEDS: readonly FloraBedConfig[] = [
  // Bờ Tây kênh sông Sài Gòn (đảm bảo đầy đủ 5 gam màu ngay 4 điểm đầu)
  { x: -1.25, z: -3.2, flowerColor: '#F43F5E', bushColor: '#22C55E' },
  { x: -1.25, z: -1.6, flowerColor: '#F59E0B', bushColor: '#10B981' },
  { x: -1.25, z: 0.2, flowerColor: '#A855F7', bushColor: '#22C55E' },
  { x: -1.25, z: 1.8, flowerColor: '#E11D48', bushColor: '#10B981' },
  { x: -1.25, z: 3.4, flowerColor: '#F59E0B', bushColor: '#22C55E' },

  // Bờ Đông kênh sông Sài Gòn
  { x: 1.25, z: -3.2, flowerColor: '#A855F7', bushColor: '#10B981' },
  { x: 1.25, z: -1.6, flowerColor: '#F43F5E', bushColor: '#22C55E' },
  { x: 1.25, z: 0.2, flowerColor: '#F59E0B', bushColor: '#10B981' },
  { x: 1.25, z: 1.8, flowerColor: '#A855F7', bushColor: '#22C55E' },
  { x: 1.25, z: 3.4, flowerColor: '#E11D48', bushColor: '#10B981' },
];

export function DioramaTropicalFlora(): React.ReactElement {
  return (
    <group position={[0, 0.02, 0]} data-testid="diorama-tropical-flora">
      {TROPICAL_FLORA_BEDS.map((bed, index) => (
        <group key={`flora-bed-${index}`} position={[bed.x, 0, bed.z]}>
          {/* Bụi cây cảnh nhiệt đới xanh cốm hoặc ngọc lục bảo */}
          <mesh castShadow position={[0, 0.035, 0]}>
            <SafeSphereGeometry args={[0.075, 8, 8]} />
            <meshStandardMaterial color={bed.bushColor} roughness={0.7} />
          </mesh>
          {/* Cụm hoa nhiệt đới đa sắc rực rỡ */}
          <mesh position={[0.03, 0.055, 0.02]}>
            <SafeSphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color={bed.flowerColor} roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const tempVec = new Vector3();
const tempTangent = new Vector3();

export function DioramaModelRailroad(): React.ReactElement {
  const leadRef = useRef<Group>(null);
  const coach1Ref = useRef<Group>(null);
  const coach2Ref = useRef<Group>(null);

  const trackCurve = useMemo(() => getRailroadTrackCurve(), []);
  const trackLength = useMemo(() => getRailroadTrackPerimeter(), []);

  useSafeFrame((state) => {
    const t = state.clock.elapsedTime;
    const kinematics = computeTrainKinematics(t);
    const leadProgress = kinematics.progress;

    const carItems = [
      { ref: leadRef, offset: TRAIN_CARRIAGE_OFFSETS[0] },
      { ref: coach1Ref, offset: TRAIN_CARRIAGE_OFFSETS[1] },
      { ref: coach2Ref, offset: TRAIN_CARRIAGE_OFFSETS[2] },
    ] as const;

    for (const item of carItems) {
      const grp = item.ref.current;
      if (!grp) continue;
      const p = computeCarriageProgress(leadProgress, item.offset, trackLength);
      trackCurve.getPointAt(p, tempVec);
      trackCurve.getTangentAt(p, tempTangent);
      const yaw = computeTrainYaw(tempTangent);
      const pitch = kinematics.speed > 0.01 ? Math.sin(t * 12) * 0.005 : 0;

      grp.position.set(tempVec.x, 0.062, tempVec.z);
      grp.rotation.set(pitch, yaw, 0);
    }
  });

  return (
    <group position={[0, 0, 0]} data-testid="diorama-model-railroad">
      {/* 0. Lớp nền đá ba-lát ôm trọn 4 cạnh */}
      <DioramaBallastBed />

      {/* 1. Móng tà vẹt gỗ sẫm màu ôm trọn 4 cạnh phía trong 40 ô cờ (X, Z ~ ±6.9m) */}
      <mesh receiveShadow position={[0, 0.022, -6.9]}>
        <SafeBoxGeometry args={[13.8, 0.012, 0.22]} />
        <meshStandardMaterial color="#451A03" roughness={0.85} />
      </mesh>
      <mesh receiveShadow position={[0, 0.022, 6.9]}>
        <SafeBoxGeometry args={[13.8, 0.012, 0.22]} />
        <meshStandardMaterial color="#451A03" roughness={0.85} />
      </mesh>
      <mesh receiveShadow position={[-6.9, 0.022, 0]}>
        <SafeBoxGeometry args={[0.22, 0.012, 13.8]} />
        <meshStandardMaterial color="#451A03" roughness={0.85} />
      </mesh>
      <mesh receiveShadow position={[6.9, 0.022, 0]}>
        <SafeBoxGeometry args={[0.22, 0.012, 13.8]} />
        <meshStandardMaterial color="#451A03" roughness={0.85} />
      </mesh>

      {/* 1.1 Cung ray cua góc (Corner Rails) tại 4 góc nối liền mạch khép kín */}
      <mesh receiveShadow position={[-6.85, 0.022, 6.85]} rotation={[0, Math.PI / 4, 0]}>
        <SafeBoxGeometry args={[0.32, 0.012, 0.22]} />
        <meshStandardMaterial color="#451A03" roughness={0.85} />
      </mesh>
      <mesh receiveShadow position={[6.85, 0.022, 6.85]} rotation={[0, -Math.PI / 4, 0]}>
        <SafeBoxGeometry args={[0.32, 0.012, 0.22]} />
        <meshStandardMaterial color="#451A03" roughness={0.85} />
      </mesh>
      <mesh receiveShadow position={[6.85, 0.022, -6.85]} rotation={[0, Math.PI / 4, 0]}>
        <SafeBoxGeometry args={[0.32, 0.012, 0.22]} />
        <meshStandardMaterial color="#451A03" roughness={0.85} />
      </mesh>
      <mesh receiveShadow position={[-6.85, 0.022, -6.85]} rotation={[0, -Math.PI / 4, 0]}>
        <SafeBoxGeometry args={[0.32, 0.012, 0.22]} />
        <meshStandardMaterial color="#451A03" roughness={0.85} />
      </mesh>

      {/* 2. Ray kim loại đôi sáng bóng mạ thép (#E2E8F0, metalness 0.85, roughness 0.2) */}
      {/* Cạnh Bắc */}
      <mesh receiveShadow position={[0, 0.032, -6.95]}>
        <SafeBoxGeometry args={[13.8, 0.01, 0.02]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh receiveShadow position={[0, 0.032, -6.85]}>
        <SafeBoxGeometry args={[13.8, 0.01, 0.02]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.85} roughness={0.2} />
      </mesh>
      {/* Cạnh Nam */}
      <mesh receiveShadow position={[0, 0.032, 6.85]}>
        <SafeBoxGeometry args={[13.8, 0.01, 0.02]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh receiveShadow position={[0, 0.032, 6.95]}>
        <SafeBoxGeometry args={[13.8, 0.01, 0.02]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.85} roughness={0.2} />
      </mesh>
      {/* Cạnh Tây */}
      <mesh receiveShadow position={[-6.95, 0.032, 0]}>
        <SafeBoxGeometry args={[0.02, 0.01, 13.8]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh receiveShadow position={[-6.85, 0.032, 0]}>
        <SafeBoxGeometry args={[0.02, 0.01, 13.8]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.85} roughness={0.2} />
      </mesh>
      {/* Cạnh Đông */}
      <mesh receiveShadow position={[6.85, 0.032, 0]}>
        <SafeBoxGeometry args={[0.02, 0.01, 13.8]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh receiveShadow position={[6.95, 0.032, 0]}>
        <SafeBoxGeometry args={[0.02, 0.01, 13.8]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* 3. Đoàn tàu mini đỗ trên ray tại ga Metro Trung Tâm (Nam bàn cờ) */}
      {/* Đầu tàu đỏ Ruby #DC2626 */}
      <group ref={leadRef} position={[-2.2, 0.062, 6.9]}>
        <mesh castShadow position={[0, 0, 0]}>
          <SafeBoxGeometry args={[0.65, 0.07, 0.14]} />
          <meshStandardMaterial color="#DC2626" roughness={0.3} metalness={0.4} />
        </mesh>
        <mesh castShadow position={[-0.15, 0.055, 0]}>
          <SafeBoxGeometry args={[0.26, 0.05, 0.12]} />
          <meshStandardMaterial color="#DC2626" roughness={0.3} metalness={0.4} />
        </mesh>
        {/* Đèn pha đầu tàu */}
        <mesh position={[0.33, 0.01, 0]}>
          <SafeBoxGeometry args={[0.02, 0.025, 0.06]} />
          <meshStandardMaterial color="#FDE047" emissive="#FDE047" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* Toa khách 1: Xanh dương #0284C7 */}
      <group ref={coach1Ref} position={[-1.4, 0.062, 6.9]}>
        <mesh castShadow position={[0, 0, 0]}>
          <SafeBoxGeometry args={[0.75, 0.07, 0.14]} />
          <meshStandardMaterial color="#0284C7" roughness={0.3} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.015, 0]}>
          <SafeBoxGeometry args={[0.68, 0.025, 0.145]} />
          <meshStandardMaterial color="#0F172A" roughness={0.2} />
        </mesh>
      </group>

      {/* Toa khách 2: Xanh dương #0284C7 */}
      <group ref={coach2Ref} position={[-0.55, 0.062, 6.9]}>
        <mesh castShadow position={[0, 0, 0]}>
          <SafeBoxGeometry args={[0.75, 0.07, 0.14]} />
          <meshStandardMaterial color="#0284C7" roughness={0.3} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.015, 0]}>
          <SafeBoxGeometry args={[0.68, 0.025, 0.145]} />
          <meshStandardMaterial color="#0F172A" roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}
