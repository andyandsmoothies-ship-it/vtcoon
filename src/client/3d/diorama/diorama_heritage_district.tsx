// [UI-S02/MSS][IMP-29.5] DioramaHeritageDistrict — Vietnamese Heritage & Landmarks 3D Overhaul
// Features Ben Thanh Market & Old Cathedral with SafeGLTFModel, Encaustic Tile Plaza, and Zero-Crash Fallbacks
import React, { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useEnvironmentStore } from '../../store/environment_store';
import { SafeGLTFModel } from '../asset_loader/safe_gltf_model';
import { getHeritageEncausticTileTexture } from '../heritage_tile_texture';
import { getBatchedMobileHeritageGeometries } from './diorama_static_blender_batches';

export const LANDMARK_MODEL_URLS = {
  benThanh: '/models/landmarks/landmark_ben_thanh.glb',
  cathedral: '/models/landmarks/landmark_cathedral.glb',
} as const;

interface LandmarkFallbackProps {
  readonly isNight: boolean;
  readonly isSunset: boolean;
  readonly isMobile?: boolean;
}

/**
 * Component dự phòng thủ tục cho Chợ Bến Thành (Ben Thanh Procedural Fallback)
 * Bảo toàn 100% các mã màu đặc trưng: Vàng kem (#FDE047), Ngói đỏ (#DC2626), Mái lồng (#B91C1C)
 */
export function BenThanhProceduralFallback({
  isNight,
  isSunset,
}: LandmarkFallbackProps): React.ReactElement {
  return (
    <group>
      <mesh position={[0, 0.002, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.28, 1.08]} />
        <meshBasicMaterial color="#0F172A" transparent opacity={0.36} />
      </mesh>
      <RoundedBox args={[1.2, 0.04, 1.0]} radius={0.015} smoothness={2} receiveShadow position={[0, 0.02, 0]}>
        <meshStandardMaterial color="#E2E8F0" roughness={0.6} />
      </RoundedBox>
      <RoundedBox args={[1.0, 0.18, 0.55]} radius={0.012} smoothness={2} castShadow receiveShadow position={[0, 0.12, 0.2]}>
        <meshStandardMaterial color="#FEF3C7" roughness={0.5} />
      </RoundedBox>
      <mesh castShadow position={[0, 0.25, 0.2]}>
        <coneGeometry args={[0.7, 0.14, 4]} />
        <meshStandardMaterial color="#B91C1C" roughness={0.4} />
      </mesh>
      <group position={[0, 0, -0.2]}>
        <RoundedBox args={[0.42, 0.4, 0.42]} radius={0.015} smoothness={2} castShadow receiveShadow position={[0, 0.22, 0]}>
          <meshStandardMaterial
            color="#FDE047"
            roughness={0.45}
            emissive="#FDE047"
            emissiveIntensity={isNight ? 0.6 : isSunset ? 0.25 : 0.0}
          />
        </RoundedBox>
        <RoundedBox args={[0.2, 0.18, 0.02]} radius={0.008} smoothness={2} position={[0, 0.1, -0.215]}>
          <meshStandardMaterial color="#1E293B" roughness={0.8} />
        </RoundedBox>
        <mesh position={[0, 0.32, -0.215]}>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color={isNight ? '#FEF08A' : '#FFFFFF'} />
        </mesh>
        <mesh position={[0, 0.32, -0.218]}>
          <ringGeometry args={[0.075, 0.085, 16]} />
          <meshBasicMaterial color="#78350F" />
        </mesh>
        <mesh position={[0, 0.32, -0.22]}>
          <boxGeometry args={[0.008, 0.06, 0.002]} />
          <meshBasicMaterial color="#0F172A" />
        </mesh>
        <mesh castShadow position={[0, 0.48, 0]}>
          <coneGeometry args={[0.34, 0.18, 4]} />
          <meshStandardMaterial color="#DC2626" roughness={0.35} />
        </mesh>
        <mesh castShadow position={[0, 0.58, 0]}>
          <coneGeometry args={[0.22, 0.12, 4]} />
          <meshStandardMaterial color="#B91C1C" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.68, 0]}>
          <cylinderGeometry args={[0.006, 0.008, 0.12, 4]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Component dự phòng thủ tục cho Nhà Thờ Cổ (Cathedral Procedural Fallback)
 * Bảo toàn 100% các mã màu đặc trưng: Gạch đỏ trần (#B45309), Mái ngói (#78350F), Hoa hồng (#0284C7)
 */
export function CathedralProceduralFallback({
  isNight,
  isSunset,
  isMobile = false,
}: LandmarkFallbackProps): React.ReactElement {
  if (isMobile) {
    const { cathedralBodyVertexAoGeom, cathedralAccentsGeom } = getBatchedMobileHeritageGeometries();
    return (
      <group>
        <mesh geometry={cathedralBodyVertexAoGeom} receiveShadow>
          <meshStandardMaterial color="#FFFFFF" vertexColors={true} roughness={0.62} />
        </mesh>
        <mesh geometry={cathedralAccentsGeom}>
          <meshStandardMaterial
            color="#FFFFFF"
            vertexColors={true}
            roughness={0.18}
            metalness={0.75}
            emissive="#38BDF8"
            emissiveIntensity={isNight ? 0.55 : isSunset ? 0.22 : 0.0}
          />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh position={[0, 0.002, 0.1]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.72, 0.8]} />
        <meshBasicMaterial color="#0F172A" transparent opacity={0.38} />
      </mesh>
      <RoundedBox args={[0.62, 0.4, 0.7]} radius={0.015} smoothness={2} castShadow receiveShadow position={[0, 0.22, 0.1]}>
        <meshStandardMaterial color="#B45309" roughness={0.65} />
      </RoundedBox>
      <mesh castShadow position={[0, 0.48, 0.1]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.48, 0.2, 4]} />
        <meshStandardMaterial color="#78350F" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.3, -0.26]}>
        <circleGeometry args={[0.09, 16]} />
        <meshStandardMaterial
          color="#0284C7"
          roughness={0.1}
          metalness={0.8}
          emissive="#38BDF8"
          emissiveIntensity={isNight ? 1.1 : isSunset ? 0.45 : 0.0}
        />
      </mesh>
      <mesh position={[0, 0.3, -0.262]}>
        <ringGeometry args={[0.085, 0.095, 16]} />
        <meshBasicMaterial color="#F59E0B" />
      </mesh>
      {[-0.24, 0.24].map((tx) => (
        <group key={`cathedral-spire-${tx}`} position={[tx, 0, -0.2]}>
          <RoundedBox args={[0.2, 0.68, 0.2]} radius={0.01} smoothness={2} castShadow receiveShadow position={[0, 0.35, 0]}>
            <meshStandardMaterial color="#B45309" roughness={0.65} />
          </RoundedBox>
          <mesh castShadow position={[0, 0.82, 0]}>
            <coneGeometry args={[0.16, 0.32, 4]} />
            <meshStandardMaterial color="#451A03" roughness={0.4} />
          </mesh>
          <mesh position={[0, 1.02, 0]}>
            <boxGeometry args={[0.012, 0.08, 0.012]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.9} emissive="#F59E0B" emissiveIntensity={isNight ? 0.95 : 0.0} />
          </mesh>
          <mesh position={[0, 1.04, 0]}>
            <boxGeometry args={[0.05, 0.012, 0.012]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.9} emissive="#F59E0B" emissiveIntensity={isNight ? 0.95 : 0.0} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export interface DioramaHeritageDistrictProps {
  readonly isMobile?: boolean;
}

/**
 * Phân Khu Di Sản Bến Thành & Nhà Thờ Cổ (Diorama Heritage District)
 * Tích hợp SafeGLTFModel nạp mô hình .glb chuẩn PBR và thềm gạch bông Đông Dương
 */
export function DioramaHeritageDistrict({ isMobile = false }: DioramaHeritageDistrictProps = {}): React.ReactElement {
  const phase = useEnvironmentStore((s) => s.phase);
  const isNight = phase === 'night';
  const isSunset = phase === 'sunset';

  const encausticTexture = useMemo(() => getHeritageEncausticTileTexture(), []);
  const mobileHeritageGeoms = isMobile ? getBatchedMobileHeritageGeometries() : null;

  return (
    <group position={[-4.5, 0.16, 2.9]} data-testid="diorama-heritage-district">
      {isMobile ? (
        <mesh position={[0.35, -0.009, 0.02]} receiveShadow>
          <boxGeometry args={[1.7, 0.024, 2.6]} />
          <meshStandardMaterial color="#FAF5EE" roughness={0.6} map={encausticTexture ?? undefined} />
        </mesh>
      ) : (
        <mesh position={[0.35, 0.003, 0.02]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.7, 2.6]} />
          <meshStandardMaterial color="#FAF5EE" roughness={0.6} map={encausticTexture ?? undefined} />
        </mesh>
      )}
      <group position={[0.2, 0, 0.88]} name="HeritageCathedralGroup" data-model-url={LANDMARK_MODEL_URLS.cathedral}>
        <SafeGLTFModel
          url={LANDMARK_MODEL_URLS.cathedral}
          fallback={<CathedralProceduralFallback isNight={isNight} isSunset={isSunset} isMobile={isMobile} />}
          castShadow={!isMobile}
          receiveShadow
          forceFallback={isMobile ? true : undefined}
        />
      </group>
      <group position={[0.2, 0, -0.22]} data-testid="cong-xa-paris-plaza">
        {!isMobile ? (
          <>
            <mesh position={[0, 0.004, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.55, 32]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.005, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.26, 0.52, 32]} />
              <meshStandardMaterial color="#166534" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.20, 0.25, 24]} />
              <meshStandardMaterial color="#DC2626" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.007, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.15, 0.19, 24]} />
              <meshStandardMaterial color="#FDE047" roughness={0.45} />
            </mesh>
            <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.10, 0.14, 24]} />
              <meshStandardMaterial color="#15803D" roughness={0.65} />
            </mesh>
            {([[-0.32, -0.32], [0.32, -0.32], [-0.32, 0.32], [0.32, 0.32]] as const).map(([lx, lz], li) => (
              <group key={`heritage-lamp-${li}`} position={[lx, 0, lz]}>
                <mesh position={[0, 0.08, 0]} castShadow>
                  <cylinderGeometry args={[0.006, 0.01, 0.16, 6]} />
                  <meshStandardMaterial color="#334155" roughness={0.4} />
                </mesh>
                <mesh position={[0, 0.17, 0]}>
                  <sphereGeometry args={[0.016, 8, 8]} />
                  <meshStandardMaterial color="#FDE047" emissive="#FDE047" emissiveIntensity={isNight ? 1.5 : isSunset ? 0.6 : 0.0} />
                </mesh>
              </group>
            ))}
            <RoundedBox args={[0.10, 0.09, 0.10]} radius={0.01} smoothness={2} castShadow receiveShadow position={[0, 0.045, 0]}>
              <meshStandardMaterial color="#CBD5E1" roughness={0.35} />
            </RoundedBox>
            <mesh castShadow position={[0, 0.14, 0]}>
              <cylinderGeometry args={[0.022, 0.038, 0.11, 8]} />
              <meshStandardMaterial color="#F8FAFC" roughness={0.25} />
            </mesh>
            <mesh position={[0, 0.20, 0]}>
              <sphereGeometry args={[0.024, 10, 10]} />
              <meshStandardMaterial color="#F8FAFC" roughness={0.2} />
            </mesh>
          </>
        ) : (
          <>
            <mesh position={[0, 0.012, 0]} receiveShadow>
              <cylinderGeometry args={[0.55, 0.55, 0.024, 24]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.032, 0]} receiveShadow>
              <cylinderGeometry args={[0.48, 0.48, 0.020, 24]} />
              <meshStandardMaterial color="#166534" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.050, 0]}>
              <cylinderGeometry args={[0.20, 0.20, 0.020, 16]} />
              <meshStandardMaterial color="#DC2626" roughness={0.5} />
            </mesh>
            {mobileHeritageGeoms && (
              <>
                <mesh geometry={mobileHeritageGeoms.parisStatueAndPedestalGeom} receiveShadow>
                  <meshStandardMaterial color="#FFFFFF" vertexColors={true} roughness={0.3} />
                </mesh>
                <mesh geometry={mobileHeritageGeoms.parisStreetlampsGeom}>
                  <meshStandardMaterial
                    color="#FFFFFF"
                    vertexColors={true}
                    roughness={0.35}
                    emissive="#FDE047"
                    emissiveIntensity={isNight ? 0.65 : isSunset ? 0.25 : 0.0}
                  />
                </mesh>
              </>
            )}
          </>
        )}
      </group>
    </group>
  );
}
