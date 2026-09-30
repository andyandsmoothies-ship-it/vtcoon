// [UI-S02/MSS][IMP-228] DioramaElevatedStations — HCMC Metro Line 1 Elevated Stations
// Two-tier viaduct stations with symmetric staircases, glass escalators, PSD & tensile canopies
import React from 'react';

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

export function DioramaWaterfrontStation(): React.ReactElement {
  return (
    <group position={[0, 0, 0]} data-testid="diorama-waterfront-station">
      {/* 1. Thềm sảnh trệt đón khách ven sông Nam (Y ~ 0.025m) */}
      <mesh receiveShadow position={[-1.6, 0.025, 6.55]}>
        <SafeBoxGeometry args={[2.0, 0.03, 0.36]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* 2. Khung vòm thép uốn cong màu than sẫm */}
      <mesh position={[-1.6, 0.165, 6.55]}>
        <SafeBoxGeometry args={[1.9, 0.015, 0.40]} />
        <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* 3. Cột thép chịu lực đỡ kết cấu vòm */}
      <mesh position={[-2.3, 0.09, 6.55]}>
        <SafeCylinderGeometry args={[0.015, 0.015, 0.12, 8]} />
        <meshStandardMaterial color="#64748B" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-0.9, 0.09, 6.55]}>
        <SafeCylinderGeometry args={[0.015, 0.015, 0.12, 8]} />
        <meshStandardMaterial color="#64748B" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* 4. Ghế dài sảnh chờ */}
      <mesh receiveShadow position={[-1.6, 0.05, 6.55]}>
        <SafeBoxGeometry args={[0.45, 0.02, 0.12]} />
        <meshStandardMaterial color="#78350F" roughness={0.5} />
      </mesh>
      {/* 5. Mái vòm bạt căng hình cánh buồm trên ke ga trên cao (Y >= 0.50m) */}
      <mesh position={[-1.6, 0.58, 6.55]}>
        <SafeBoxGeometry args={[2.2, 0.015, 0.46]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.2} metalness={0.05} />
      </mesh>
      {/* 6. Cửa chắn ke ga tự động (PSD) kính biếc trên ke ga trên cao (Y >= 0.40m) */}
      <mesh position={[-1.6, 0.48, 6.72]}>
        <SafeBoxGeometry args={[2.0, 0.08, 0.02]} />
        <meshStandardMaterial color="#38BDF8" transparent opacity={0.65} roughness={0.1} />
      </mesh>
      {/* 7. Đèn tín hiệu nhà ga hoàng kim */}
      <mesh position={[-0.65, 0.52, 6.55]}>
        <SafeSphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#FDE047" emissive="#FDE047" emissiveIntensity={0.8} />
      </mesh>

      {/* 8. Sàn ke ga trên cao (Y = 0.45m) */}
      <mesh receiveShadow position={[-1.6, 0.44, 6.55]}>
        <SafeBoxGeometry args={[2.2, 0.03, 0.40]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* 9. Hệ thống cầu thang bộ đối xứng 2 bên vươn từ mặt đất Y=0.02 lên ke ga Y=0.45 */}
      {/* Bậc thang Tây (X = -2.7) - Không castShadow */}
      <mesh receiveShadow position={[-2.7, 0.23, 6.55]} rotation={[0, 0, Math.PI / 6]}>
        <SafeBoxGeometry args={[0.46, 0.02, 0.18]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Tay vịn kim loại bậc thang Tây (#CBD5E1) */}
      <mesh position={[-2.7, 0.31, 6.64]} rotation={[0, 0, Math.PI / 6]}>
        <SafeCylinderGeometry args={[0.008, 0.008, 0.50, 6]} />
        <meshStandardMaterial color="#CBD5E1" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Bậc thang Đông (X = -0.5) - Không castShadow */}
      <mesh receiveShadow position={[-0.5, 0.23, 6.55]} rotation={[0, 0, -Math.PI / 6]}>
        <SafeBoxGeometry args={[0.46, 0.02, 0.18]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Tay vịn kim loại bậc thang Đông (#CBD5E1) */}
      <mesh position={[-0.5, 0.31, 6.64]} rotation={[0, 0, -Math.PI / 6]}>
        <SafeCylinderGeometry args={[0.008, 0.008, 0.50, 6]} />
        <meshStandardMaterial color="#CBD5E1" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 10. Thang cuốn nghiêng / hành lang kính biếc kết nối mặt đất lên ke ga */}
      <mesh position={[-1.6, 0.23, 6.38]}>
        <SafeBoxGeometry args={[0.35, 0.42, 0.14]} />
        <meshStandardMaterial color="#38BDF8" transparent opacity={0.6} roughness={0.1} />
      </mesh>
    </group>
  );
}

export function DioramaLandmarkNorthStation(): React.ReactElement {
  return (
    <group position={[1.6, 0.025, -6.55]} data-testid="diorama-landmark-north-station">
      {/* 1. Sảnh trệt ga bờ Bắc */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <SafeBoxGeometry args={[2.2, 0.03, 0.38]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* 2. Mái vòm ke ga hiện đại viền xanh cyan thương hiệu Metro Số 1 (Y >= 0.50m) */}
      <mesh position={[0, 0.55, 0]}>
        <SafeBoxGeometry args={[2.2, 0.015, 0.44]} />
        <meshStandardMaterial color="#0284C7" metalness={0.4} roughness={0.2} transparent opacity={0.85} />
      </mesh>
      {/* 3. Cột thép chịu lực đỡ ke ga và mái trên cao */}
      <mesh position={[-0.8, 0.26, 0]}>
        <SafeCylinderGeometry args={[0.02, 0.02, 0.48, 8]} />
        <meshStandardMaterial color="#64748B" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.8, 0.26, 0]}>
        <SafeCylinderGeometry args={[0.02, 0.02, 0.48, 8]} />
        <meshStandardMaterial color="#64748B" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* 4. Biển hiệu LED vàng hoàng kim Landmark Metro */}
      <mesh position={[0, 0.58, 0]}>
        <SafeBoxGeometry args={[0.6, 0.03, 0.04]} />
        <meshStandardMaterial color="#FEF08A" emissive="#FEF08A" emissiveIntensity={0.8} />
      </mesh>
      {/* 5. Vách kính an toàn ke ga mờ (Platform Screen Doors - PSD) (Y >= 0.40m) */}
      <mesh position={[0, 0.45, 0.18]}>
        <SafeBoxGeometry args={[2.0, 0.08, 0.02]} />
        <meshStandardMaterial color="#38BDF8" transparent opacity={0.65} roughness={0.1} />
      </mesh>
      {/* 6. Ghế chờ hành khách */}
      <mesh receiveShadow position={[0, 0.43, 0]}>
        <SafeBoxGeometry args={[0.5, 0.02, 0.12]} />
        <meshStandardMaterial color="#78350F" roughness={0.5} />
      </mesh>
      {/* 7. Đèn tín hiệu phía Bắc */}
      <mesh position={[0.95, 0.50, 0]}>
        <SafeSphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#FEF08A" emissive="#FEF08A" emissiveIntensity={0.8} />
      </mesh>

      {/* 8. Sàn ke ga trên cao */}
      <mesh receiveShadow position={[0, 0.42, 0]}>
        <SafeBoxGeometry args={[2.2, 0.03, 0.40]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* 9. Cầu thang bộ zíc-zắc hai bên */}
      <mesh receiveShadow position={[-1.1, 0.21, 0]} rotation={[0, 0, Math.PI / 6]}>
        <SafeBoxGeometry args={[0.46, 0.02, 0.18]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[-1.1, 0.29, 0.09]} rotation={[0, 0, Math.PI / 6]}>
        <SafeCylinderGeometry args={[0.008, 0.008, 0.50, 6]} />
        <meshStandardMaterial color="#CBD5E1" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh receiveShadow position={[1.1, 0.21, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <SafeBoxGeometry args={[0.46, 0.02, 0.18]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[1.1, 0.29, 0.09]} rotation={[0, 0, -Math.PI / 6]}>
        <SafeCylinderGeometry args={[0.008, 0.008, 0.50, 6]} />
        <meshStandardMaterial color="#CBD5E1" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 10. Thang cuốn kính biếc trung tâm */}
      <mesh position={[0, 0.21, -0.18]}>
        <SafeBoxGeometry args={[0.35, 0.42, 0.14]} />
        <meshStandardMaterial color="#38BDF8" transparent opacity={0.6} roughness={0.1} />
      </mesh>
    </group>
  );
}
