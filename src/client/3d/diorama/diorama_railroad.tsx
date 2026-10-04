// [UI-S02/MSS][IMP-92][IMP-134][IMP-227] Diorama Railroad Infrastructure, HCMC Metro Line 1 & Rolling Stock
import React, { useRef, useMemo } from 'react';
import { Vector3, MeshStandardMaterial, type Group } from 'three';
import { useSafeFrame } from '../safe_frame';
import { createCurvedRailGeometry, applyTubeWidth } from '../curve_line_buffer';
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

interface ViaductSegmentData {
  readonly pos: readonly [number, number, number];
  readonly yaw: number;
  readonly segLength: number;
  readonly leftParapetPos: readonly [number, number, number];
  readonly rightParapetPos: readonly [number, number, number];
  readonly leftRailPos: readonly [number, number, number];
  readonly rightRailPos: readonly [number, number, number];
}

interface ViaductPierData {
  readonly pos: readonly [number, number, number];
  readonly height: number;
}

export const VIADUCT_NUM_SEGMENTS = 96;

function buildViaductGeometry(): {
  readonly segments: readonly ViaductSegmentData[];
  readonly piers: readonly ViaductPierData[];
} {
  const curve = getRailroadTrackCurve();
  const L = getRailroadTrackPerimeter();
  const segs: ViaductSegmentData[] = [];
  const pierList: ViaductPierData[] = [];

  for (let i = 0; i < VIADUCT_NUM_SEGMENTS; i++) {
    const u = (i + 0.5) / VIADUCT_NUM_SEGMENTS;
    const p = curve.getPointAt(u);
    const tan = curve.getTangentAt(u);
    const yaw = Math.atan2(-tan.z, tan.x);
    const segLength = (L / VIADUCT_NUM_SEGMENTS) * 1.05;

    const nx = -tan.z;
    const nz = tan.x;
    const nLen = Math.sqrt(nx * nx + nz * nz) || 1;
    const normX = nx / nLen;
    const normZ = nz / nLen;

    segs.push({
      pos: [p.x, 0.44, p.z],
      yaw,
      segLength,
      leftParapetPos: [p.x + normX * 0.17, 0.45, p.z + normZ * 0.17],
      rightParapetPos: [p.x - normX * 0.17, 0.45, p.z - normZ * 0.17],
      leftRailPos: [p.x + normX * 0.05, 0.45, p.z + normZ * 0.05],
      rightRailPos: [p.x - normX * 0.05, 0.45, p.z - normZ * 0.05],
    });

    if (i % 6 === 0) {
      const isOverRiver = Math.abs(p.x) < 0.8;
      const baseElevation = isOverRiver ? -0.035 : 0.02;
      const pierHeight = 0.44 - baseElevation;
      const centerElevation = baseElevation + pierHeight / 2;
      pierList.push({
        pos: [p.x, centerElevation, p.z],
        height: pierHeight,
      });
    }
  }

  return { segments: segs, piers: pierList };
}

// Tính toán 1 lần duy nhất ở module-level để loại bỏ GC churn và tối ưu FPS [P1.4]
export const { segments: VIADUCT_CURVED_SEGMENTS, piers: VIADUCT_PIERS } = buildViaductGeometry();

// Cột cần tiếp điện trên cao (Catenary Masts: cột đứng Y=0.085m cao 0.17m; thanh vươn Y=0.155m)
const CATENARY_MAST_POSITIONS: readonly [number, number, number, number][] = [
  [-4.8, 0, -7.1, 0], [4.8, 0, -7.1, 0], [-4.8, 0, 7.1, Math.PI], [4.8, 0, 7.1, Math.PI],
  [-7.1, 0, -4.8, -Math.PI / 2], [-7.1, 0, 4.8, -Math.PI / 2], [7.1, 0, -4.8, Math.PI / 2], [7.1, 0, 4.8, Math.PI / 2],
];

export function DioramaBallastBed(): React.ReactElement {
  return (
    <group position={[0, 0, 0]} data-testid="diorama-railroad-ballast">
      {/* QUAN TRỌNG: 4 dải đá ba-lát tĩnh (#475569) PHẢI NẰM ĐẦU TIÊN để bảo vệ cửa sổ cắt chuỗi 800 ký tự [P2.1] */}
      <mesh receiveShadow position={[0, 0.018, -6.9]}>
        <SafeBoxGeometry args={[10.6, 0.016, 0.36]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[0, 0.018, 6.9]}>
        <SafeBoxGeometry args={[10.6, 0.016, 0.36]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[-6.9, 0.018, 0]}>
        <SafeBoxGeometry args={[0.36, 0.016, 10.6]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[6.9, 0.018, 0]}>
        <SafeBoxGeometry args={[0.36, 0.016, 10.6]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>

      {/* Lan can dầm U-Girder đúc sẵn (#94A3B8) uốn cong dọc 96 phân đoạn cầu cạn */}
      {VIADUCT_CURVED_SEGMENTS.map((seg, idx) => (
        <React.Fragment key={`girder-seg-${idx}`}>
          <mesh receiveShadow position={seg.leftParapetPos} rotation={[0, seg.yaw, 0]}>
            <SafeBoxGeometry args={[seg.segLength, 0.024, 0.03]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.7} />
          </mesh>
          <mesh receiveShadow position={seg.rightParapetPos} rotation={[0, seg.yaw, 0]}>
            <SafeBoxGeometry args={[seg.segLength, 0.024, 0.03]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.7} />
          </mesh>
        </React.Fragment>
      ))}

      {/* Hệ thống 16 trụ cầu bê tông cốt thép hình trụ tròn vươn lên đỡ dầm tại Y >= 0.40 [P2.2] */}
      {VIADUCT_PIERS.map((pier, idx) => (
        <mesh key={`pier-${idx}`} receiveShadow position={pier.pos}>
          <SafeCylinderGeometry args={[0.07, 0.08, pier.height, 12]} />
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

// Re-export 2 ga trên cao từ diorama_elevated_stations bảo toàn 100% call-sites và backward compatibility [P4]
export {
  DioramaWaterfrontStation,
  DioramaLandmarkNorthStation,
} from './diorama_elevated_stations';

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


export function DioramaCurvedRails(): React.ReactElement {
  const curve = useMemo(() => getRailroadTrackCurve(), []);
  const railGeometry = useMemo(() => {
    return createCurvedRailGeometry(curve, {
      segments: 96,
      radialSegments: 4,
      railRadius: 0.008,
      gaugeOffset: 0.05,
      railElevation: 0.45,
    });
  }, [curve]);

  const railMaterial = useMemo(() => {
    const mat = new MeshStandardMaterial({
      color: '#E2E8F0',
      metalness: 0.85,
      roughness: 0.2,
    });
    return applyTubeWidth(mat, 1.0);
  }, []);

  React.useEffect(() => {
    return () => {
      railGeometry.dispose();
      railMaterial.dispose();
    };
  }, [railGeometry, railMaterial]);

  return (
    <mesh
      name="DioramaCurvedRails"
      data-testid="diorama-curved-rails"
      receiveShadow
      geometry={railGeometry}
      material={railMaterial}
    />
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
      const pitch = computeTrainPitch(kinematics.speed, t);

      grp.position.set(tempVec.x, tempVec.y + 0.038, tempVec.z);
      grp.rotation.set(pitch, yaw, 0);
    }
  });

  return (
    <group position={[0, 0, 0]} data-testid="diorama-model-railroad">
      {/* 0. Lớp nền đá ba-lát và kết cấu cầu cạn cong U-Girder ôm trọn spline */}
      <DioramaBallastBed />

      {/* 1. Móng tà vẹt gỗ sẫm màu (#451A03) bám dọc 32 phân đoạn đường cong */}
      {/* BẮT BUỘC LÀ DIRECT CHILDREN CỦA GROUP GỐC, KHÔNG CAST SHADOW ĐỂ BẢO VỆ TC-IMP142.09 [P1.3] */}
      {VIADUCT_CURVED_SEGMENTS.map((seg, idx) => (
        <mesh
          key={`tie-${idx}`}
          receiveShadow
          position={seg.pos}
          rotation={[0, seg.yaw, 0]}
        >
          <SafeBoxGeometry args={[seg.segLength * 0.9, 0.012, 0.22]} />
          <meshStandardMaterial color="#451A03" roughness={0.85} />
        </mesh>
      ))}

      {/* 2. Ray kim loại đôi sáng bóng mạ thép (#E2E8F0, metalness 0.85, roughness 0.2) uốn lượn song song tối ưu qua GPU Tube Buffer */}
      <DioramaCurvedRails />

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
