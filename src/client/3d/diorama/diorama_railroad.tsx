// [UI-S02/MSS][IMP-92][IMP-134][IMP-227] Diorama Railroad Infrastructure, HCMC Metro Line 1 & Rolling Stock
import React, { useRef, useMemo } from 'react';
import { Vector3, type Group } from 'three';
import { useSafeFrame } from '../safe_frame';
import {
  computeTrainKinematics,
  computeCarriageProgress,
  computeTrainYaw,
  computeTrainPitch,
  getRailroadTrackCurve,
  getRailroadTrackPerimeter,
  TRAIN_CARRIAGE_OFFSETS,
} from './diorama_train_kinematics';

export * from './diorama_train_kinematics';

function SafeBoxGeometry({ args }: { readonly args: readonly number[] }): React.ReactElement {
  if (typeof window === 'undefined') return React.createElement('boxgeometry', { args });
  return <boxGeometry args={args as [number, number, number]} />;
}

function SafeCylinderGeometry({ args }: { readonly args: readonly number[] }): React.ReactElement {
  if (typeof window === 'undefined') return React.createElement('cylindergeometry', { args });
  return <cylinderGeometry args={args as [number, number, number, number]} />;
}

function SafeSphereGeometry({ args }: { readonly args: readonly number[] }): React.ReactElement {
  if (typeof window === 'undefined') return React.createElement('spheregeometry', { args });
  return <sphereGeometry args={args as [number, number, number]} />;
}

// Trụ đỡ cầu cạn bê tông cốt thép hình trụ tròn (#CBD5E1)
const VIADUCT_PIER_POSITIONS: readonly [number, number, number][] = [
  [-3.5, 0.01, -6.9], [0, 0.01, -6.9], [3.5, 0.01, -6.9],
  [-3.5, 0.01, 6.9], [0, 0.01, 6.9], [3.5, 0.01, 6.9],
  [-6.9, 0.01, -3.5], [-6.9, 0.01, 0], [-6.9, 0.01, 3.5],
  [6.9, 0.01, -3.5], [6.9, 0.01, 0], [6.9, 0.01, 3.5],
];

// Lan can U-Girder bê tông bảo vệ hai bên mép cầu cạn (#94A3B8)
const U_GIRDER_PARAPETS = [
  { pos: [0, 0.03, -7.07], args: [14.2, 0.024, 0.03] }, { pos: [0, 0.03, -6.73], args: [14.2, 0.024, 0.03] },
  { pos: [0, 0.03, 7.07], args: [14.2, 0.024, 0.03] }, { pos: [0, 0.03, 6.73], args: [14.2, 0.024, 0.03] },
  { pos: [-7.07, 0.03, 0], args: [0.03, 0.024, 14.2] }, { pos: [-6.73, 0.03, 0], args: [0.03, 0.024, 14.2] },
  { pos: [7.07, 0.03, 0], args: [0.03, 0.024, 14.2] }, { pos: [6.73, 0.03, 0], args: [0.03, 0.024, 14.2] },
] as const;

// Cột cần tiếp điện trên cao (Catenary Masts: cột đứng Y=0.085m cao 0.17m; thanh vươn Y=0.155m)
const CATENARY_MAST_POSITIONS: readonly [number, number, number, number][] = [
  [-4.8, 0, -7.1, 0], [4.8, 0, -7.1, 0], [-4.8, 0, 7.1, Math.PI], [4.8, 0, 7.1, Math.PI],
  [-7.1, 0, -4.8, -Math.PI / 2], [-7.1, 0, 4.8, -Math.PI / 2], [7.1, 0, -4.8, Math.PI / 2], [7.1, 0, 4.8, Math.PI / 2],
];

export function DioramaBallastBed(): React.ReactElement {
  return (
    <group position={[0, 0, 0]} data-testid="diorama-railroad-ballast">
      {/* QUAN TRỌNG: 4 dải đá ba-lát cầu cạn (#475569) PHẢI NẰM ĐẦU TIÊN để bảo vệ cửa sổ cắt chuỗi 800 ký tự */}
      <mesh receiveShadow position={[0, 0.018, -6.9]}>
        <SafeBoxGeometry args={[14.2, 0.016, 0.36]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[0, 0.018, 6.9]}>
        <SafeBoxGeometry args={[14.2, 0.016, 0.36]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[-6.9, 0.018, 0]}>
        <SafeBoxGeometry args={[0.36, 0.016, 14.2]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[6.9, 0.018, 0]}>
        <SafeBoxGeometry args={[0.36, 0.016, 14.2]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>

      {/* Lan can U-Girder bê tông đúc sẵn hai bên mép cầu cạn */}
      {U_GIRDER_PARAPETS.map((p, idx) => (
        <mesh key={`parapet-${idx}`} receiveShadow position={p.pos}>
          <SafeBoxGeometry args={p.args} />
          <meshStandardMaterial color="#94A3B8" roughness={0.7} />
        </mesh>
      ))}

      {/* Hệ thống trụ cầu bê tông cốt thép hình trụ tròn */}
      {VIADUCT_PIER_POSITIONS.map((pos, idx) => (
        <mesh key={`pier-${idx}`} receiveShadow position={pos}>
          <SafeCylinderGeometry args={[0.07, 0.08, 0.02, 12]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.7} />
        </mesh>
      ))}

      {/* Cột cần tiếp điện trên cao (Catenary Masts) với thanh vươn đón pantograph */}
      {CATENARY_MAST_POSITIONS.map((mast, idx) => (
        <group key={`cat-${idx}`} position={[mast[0], mast[1], mast[2]]} rotation={[0, mast[3], 0]}>
          <mesh position={[0, 0.085, 0]}>
            <SafeCylinderGeometry args={[0.01, 0.012, 0.17, 8]} />
            <meshStandardMaterial color="#64748B" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.155, 0.1]}>
            <SafeBoxGeometry args={[0.01, 0.01, 0.22]} />
            <meshStandardMaterial color="#64748B" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function DioramaWaterfrontStation(): React.ReactElement {
  return (
    <group position={[0, 0, 0]} data-testid="diorama-waterfront-station">
      {/* 1. Thềm ke ga granite sáng màu dọc tuyến Metro ven sông Nam */}
      <mesh receiveShadow position={[-1.6, 0.025, 6.55]}>
        <SafeBoxGeometry args={[2.0, 0.03, 0.36]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* 2. Khung vòm thép uốn cong màu than sẫm */}
      <mesh position={[-1.6, 0.165, 6.55]}>
        <SafeBoxGeometry args={[1.9, 0.015, 0.40]} />
        <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* 3. Cột thép chịu lực đỡ kết cấu mái vòm */}
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
      {/* 5. Mái vòm bạt căng hình cánh buồm trắng sứ đặc trưng Metro Tuyến 1 */}
      <mesh position={[-1.6, 0.175, 6.55]}>
        <SafeBoxGeometry args={[1.95, 0.01, 0.44]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.2} metalness={0.05} />
      </mesh>
      {/* 6. Vách kính an toàn ke ga mờ (Platform Screen Doors - PSD) */}
      <mesh position={[-1.6, 0.075, 6.72]}>
        <SafeBoxGeometry args={[1.9, 0.07, 0.02]} />
        <meshStandardMaterial color="#38BDF8" transparent opacity={0.65} roughness={0.1} />
      </mesh>
      {/* 7. Đèn tín hiệu nhà ga hoàng kim */}
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
      {/* 2. Mái vòm hiện đại viền xanh cyan thương hiệu Metro Số 1 */}
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
      {/* 5. Vách kính an toàn ke ga mờ (Platform Screen Doors - PSD) */}
      <mesh position={[0, 0.075, 0.18]}>
        <SafeBoxGeometry args={[2.0, 0.07, 0.02]} />
        <meshStandardMaterial color="#38BDF8" transparent opacity={0.65} roughness={0.1} />
      </mesh>
      {/* 6. Ghế chờ hành khách */}
      <mesh receiveShadow position={[0, 0.03, 0]}>
        <SafeBoxGeometry args={[0.5, 0.02, 0.12]} />
        <meshStandardMaterial color="#78350F" roughness={0.5} />
      </mesh>
      {/* 7. Chao đèn tín hiệu phía Bắc */}
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
  { x: -1.25, z: -3.2, flowerColor: '#F43F5E', bushColor: '#22C55E' }, { x: -1.25, z: -1.6, flowerColor: '#F59E0B', bushColor: '#10B981' },
  { x: -1.25, z: 0.2, flowerColor: '#A855F7', bushColor: '#22C55E' }, { x: -1.25, z: 1.8, flowerColor: '#E11D48', bushColor: '#10B981' },
  { x: -1.25, z: 3.4, flowerColor: '#F59E0B', bushColor: '#22C55E' }, { x: 1.25, z: -3.2, flowerColor: '#A855F7', bushColor: '#10B981' },
  { x: 1.25, z: -1.6, flowerColor: '#F43F5E', bushColor: '#22C55E' }, { x: 1.25, z: 0.2, flowerColor: '#F59E0B', bushColor: '#10B981' },
  { x: 1.25, z: 1.8, flowerColor: '#A855F7', bushColor: '#22C55E' }, { x: 1.25, z: 3.4, flowerColor: '#E11D48', bushColor: '#10B981' },
];

export function DioramaTropicalFlora(): React.ReactElement {
  return (
    <group position={[0, 0.02, 0]} data-testid="diorama-tropical-flora">
      {TROPICAL_FLORA_BEDS.map((bed, index) => (
        <group key={`flora-bed-${index}`} position={[bed.x, 0, bed.z]}>
          <mesh position={[0, 0.035, 0]}>
            <SafeSphereGeometry args={[0.075, 8, 8]} />
            <meshStandardMaterial color={bed.bushColor} roughness={0.7} />
          </mesh>
          <mesh position={[0.03, 0.055, 0.02]}>
            <SafeSphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color={bed.flowerColor} roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const METALLIC_RAIL_SPECS = [
  { pos: [0, 0.032, -6.95], args: [13.8, 0.01, 0.02] }, { pos: [0, 0.032, -6.85], args: [13.8, 0.01, 0.02] },
  { pos: [0, 0.032, 6.85], args: [13.8, 0.01, 0.02] }, { pos: [0, 0.032, 6.95], args: [13.8, 0.01, 0.02] },
  { pos: [-6.95, 0.032, 0], args: [0.02, 0.01, 13.8] }, { pos: [-6.85, 0.032, 0], args: [0.02, 0.01, 13.8] },
  { pos: [6.85, 0.032, 0], args: [0.02, 0.01, 13.8] }, { pos: [6.95, 0.032, 0], args: [0.02, 0.01, 13.8] },
] as const;

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
      const pitch = computeTrainPitch(kinematics.speed, t);

      grp.position.set(tempVec.x, 0.062, tempVec.z);
      grp.rotation.set(pitch, yaw, 0);
    }
  });

  return (
    <group position={[0, 0, 0]} data-testid="diorama-model-railroad">
      {/* 0. Lớp nền đá ba-lát và kết cấu cầu cạn U-Girder ôm trọn 4 cạnh */}
      <DioramaBallastBed />

      {/* 1. Móng tà vẹt gỗ sẫm màu ôm trọn 4 cạnh phía trong 40 ô cờ (X, Z ~ ±6.9m) */}
      {/* BẮT BUỘC LÀ DIRECT CHILDREN CỦA GROUP GỐC, KHÔNG CAST SHADOW ĐỂ BẢO VỆ TC-IMP142.09 */}
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
      {METALLIC_RAIL_SPECS.map((r, idx) => (
        <mesh key={`rail-${idx}`} receiveShadow position={r.pos}>
          <SafeBoxGeometry args={r.args} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.85} roughness={0.2} />
        </mesh>
      ))}

      {/* 3. Đoàn tàu Metro Tuyến 1 (Bến Thành - Suối Tiên): Xanh Cyan, Thân Bạc, Mũi Vát Khí Động Học */}
      {/* Đầu tàu (Lead Cab): Mũi vát #0EA5E9, dải cyan #0284C7, thân bạc #E2E8F0, đèn LED #FEF08A, đèn an toàn #DC2626 */}
      <group ref={leadRef} position={[-2.2, 0.062, 6.9]}>
        <mesh castShadow position={[0, 0, 0]}>
          <SafeBoxGeometry args={[0.65, 0.07, 0.14]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh castShadow position={[0.26, -0.005, 0]}>
          <SafeBoxGeometry args={[0.16, 0.06, 0.135]} />
          <meshStandardMaterial color="#0EA5E9" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.018, 0]}>
          <SafeBoxGeometry args={[0.64, 0.018, 0.142]} />
          <meshStandardMaterial color="#0284C7" metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh position={[0.18, 0.02, 0]}>
          <SafeBoxGeometry args={[0.14, 0.025, 0.142]} />
          <meshStandardMaterial color="#0F172A" roughness={0.2} />
        </mesh>
        <mesh position={[0.34, 0.005, 0]}>
          <SafeBoxGeometry args={[0.02, 0.02, 0.06]} />
          <meshStandardMaterial color="#FEF08A" emissive="#FEF08A" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[-0.32, 0.015, 0]}>
          <SafeBoxGeometry args={[0.02, 0.02, 0.05]} />
          <meshStandardMaterial color="#DC2626" emissive="#DC2626" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* Toa khách 1 (Passenger Coach 1): Thân bạc #E2E8F0, sọc cyan #0284C7, pantograph / điều hòa #64748B */}
      <group ref={coach1Ref} position={[-1.4, 0.062, 6.9]}>
        <mesh castShadow position={[0, 0, 0]}>
          <SafeBoxGeometry args={[0.75, 0.07, 0.14]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.018, 0]}>
          <SafeBoxGeometry args={[0.74, 0.018, 0.142]} />
          <meshStandardMaterial color="#0284C7" metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.015, 0]}>
          <SafeBoxGeometry args={[0.68, 0.025, 0.144]} />
          <meshStandardMaterial color="#0F172A" roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.045, 0]}>
          <SafeBoxGeometry args={[0.22, 0.02, 0.08]} />
          <meshStandardMaterial color="#64748B" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      {/* Toa khách 2 (Passenger Coach 2): Thân bạc #E2E8F0, sọc cyan #0284C7, pantograph / điều hòa #64748B */}
      <group ref={coach2Ref} position={[-0.55, 0.062, 6.9]}>
        <mesh castShadow position={[0, 0, 0]}>
          <SafeBoxGeometry args={[0.75, 0.07, 0.14]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.018, 0]}>
          <SafeBoxGeometry args={[0.74, 0.018, 0.142]} />
          <meshStandardMaterial color="#0284C7" metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.015, 0]}>
          <SafeBoxGeometry args={[0.68, 0.025, 0.144]} />
          <meshStandardMaterial color="#0F172A" roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.045, 0]}>
          <SafeBoxGeometry args={[0.22, 0.02, 0.08]} />
          <meshStandardMaterial color="#64748B" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
