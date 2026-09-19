// [UI-S01/MSS][UI-S04/MSS][IMP-13][IMP-30] CoastalIslandEnvironment — Vietnamese Coastal Island Metropolis
// Endless Living Ocean, 15-degree Sloped Sand Shoreline, Tropical Palms & Horizon Mountain Range
import React, { useRef } from 'react';
import type { Mesh, PlaneGeometry, WebGLProgramParametersWithUniforms } from 'three';
import { CoastalPatrolBoat } from './coastal_patrol_boat';
import { CoastalSeagulls } from './coastal_seagulls';
import { LayeredTropicalFoliage } from './layered_tropical_foliage';
import { HorizonMountainRange } from './horizon_mountain_range';
import { TropicalPalmsCluster } from './tropical_palms_cluster';
import { AirportLandmark, TrainStationLandmark } from './coastal_island_landmarks';
import { useSafeFrame } from './safe_frame';
import { SafeGLTFModel } from './asset_loader/safe_gltf_model';
import { VEHICLE_MODEL_URLS } from './diorama/diorama_traffic';
import { SoundEngine } from '../audio/sound_engine';

export function ContainerShipProceduralFallback(): React.ReactElement {
  return (
    <group>
      <mesh castShadow position={[0, 0.5, 0]}><boxGeometry args={[11.0, 0.9, 2.6]} /><meshStandardMaterial color="#DC2626" roughness={0.6} metalness={0.2} /></mesh>
      <mesh castShadow position={[0, 0.96, 0]}><boxGeometry args={[10.6, 0.15, 2.4]} /><meshStandardMaterial color="#F8FAFC" roughness={0.4} /></mesh>
      <mesh castShadow position={[4.0, 1.5, 0]}><boxGeometry args={[1.8, 1.1, 2.0]} /><meshStandardMaterial color="#F1F5F9" roughness={0.3} /></mesh>
      <mesh position={[4.3, 2.2, 0]}><cylinderGeometry args={[0.2, 0.25, 0.6, 8]} /><meshStandardMaterial color="#EF4444" roughness={0.5} /></mesh>
      {[-3.6, -1.8, 0.0, 1.8].map((cx, i) => (
        <group key={`container-stack-${i}`} position={[cx, 1.3, 0]}>
          <mesh castShadow position={[0, 0, -0.5]}><boxGeometry args={[1.5, 0.6, 0.9]} /><meshStandardMaterial color={i % 2 === 0 ? '#10B981' : '#3B82F6'} roughness={0.5} /></mesh>
          <mesh castShadow position={[0, 0, 0.5]}><boxGeometry args={[1.5, 0.6, 0.9]} /><meshStandardMaterial color={i % 3 === 0 ? '#F59E0B' : '#0284C7'} roughness={0.5} /></mesh>
          <mesh castShadow position={[0, 0, 0.6]}><boxGeometry args={[1.4, 0.55, 1.6]} /><meshStandardMaterial color={i % 2 === 0 ? '#22C55E' : '#E11D48'} roughness={0.5} /></mesh>
        </group>
      ))}
    </group>
  );
}

export interface CoastalIslandEnvironmentProps {
  streamlined?: boolean;
}

export const CoastalIslandEnvironment: React.FC<CoastalIslandEnvironmentProps> = function CoastalIslandEnvironment(
  props: CoastalIslandEnvironmentProps = {}
): React.ReactElement {
  const { streamlined = true } = props;
  const waveRef = useRef<Mesh>(null);
  const shallowRef = useRef<Mesh>(null);
  const oceanGeomRef = useRef<PlaneGeometry>(null);
  const waveShaderRef = useRef<WebGLProgramParametersWithUniforms | null>(null);

  useSafeFrame((state) => {
    const t = state.clock.getElapsedTime();
    // 1. GPU Gerstner waveShader uniform update (computeVertexNormals & Float32Array removed)
    if (waveShaderRef.current?.uniforms.uTime) {
      waveShaderRef.current.uniforms.uTime.value = t;
    }
    // 2. Dải bọt sóng ven bờ co giãn chu kỳ thủy triều 3.5s
    if (waveRef.current) {
      const s = 1 + Math.sin(t * (Math.PI * 2 / 3.5)) * 0.042;
      waveRef.current.scale.set(s, s, 1);
    }
    // 3. Tầng nước nông ngọc bích nhấp nhô
    if (shallowRef.current) {
      shallowRef.current.position.y = -0.298 + Math.sin(t * (Math.PI * 2 / 3.5)) * 0.012;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Đại dương nhiệt đới vô cực (Endless Living Ocean): #06B6D4 -> #0369A1 / #0284C7 -> #0C4A6E */}
      <mesh receiveShadow position={[0, -0.42, 0]}>
        <boxGeometry args={[260, 0.16, 260]} />
        <meshStandardMaterial color="#0C4A6E" roughness={0.15} metalness={0.4} />
      </mesh>

      {/* Lưới sóng Gerstner GPU Shader vô cực PlaneGeometry args={[240, 240, 96, 96]} */}
      <mesh
        receiveShadow
        position={[0, -0.30, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        data-testid="living-ocean-water"
        onPointerDown={() => SoundEngine.playWaterRipple()}
      >
        <planeGeometry ref={oceanGeomRef} args={[240, 240, 24, 24]} />
        <meshStandardMaterial
          color="#0284C7"
          roughness={0.75}
          metalness={0.02}
          transparent
          opacity={0.92}
          onBeforeCompile={(shader) => {
            shader.uniforms.uTime = { value: 0 };
            shader.vertexShader = `uniform float uTime;\n${shader.vertexShader}`.replace(
              '#include <begin_vertex>',
              `#include <begin_vertex>\n// Gerstner waveShader GPU calculation\nfloat w1 = sin(transformed.x * 0.055 + uTime * 1.4) * 0.034;\nfloat w2 = cos(transformed.y * 0.065 + uTime * 1.1) * 0.026;\nfloat w3 = sin((transformed.x + transformed.y) * 0.038 + uTime * 1.8) * 0.015;\ntransformed.z += w1 + w2 + w3;`
            );
            waveShaderRef.current = shader;
          }}
        />
      </mesh>

      <mesh receiveShadow position={[0, -0.31, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[180, 180, 32, 32]} />
        <meshStandardMaterial color="#0369A1" roughness={0.75} metalness={0.02} transparent opacity={0.88} />
      </mesh>

      {/* Tầng nước nông ngọc bích ôm sát chân bàn cờ, triệt tiêu 100% đĩa tròn ngoại vi thừa */}
      <mesh ref={shallowRef} receiveShadow position={[0, -0.298, 0]}>
        {streamlined ? (
          <boxGeometry args={[18.4, 0.04, 18.4]} />
        ) : (
          <cylinderGeometry args={[16.3, 19.5, 0.08, 48]} />
        )}
        <meshStandardMaterial color="#06B6D4" roughness={0.70} metalness={0.02} transparent opacity={0.70} />
      </mesh>

      {/* Dải bọt sóng trắng ven bờ (Dynamic Shoreline Foam) */}
      {streamlined ? (
        <mesh ref={waveRef} position={[0, -0.292, 0]}>
          <boxGeometry args={[18.45, 0.02, 18.45]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.40} />
        </mesh>
      ) : (
        <mesh ref={waveRef} position={[0, -0.292, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[16.0, 17.2, 64]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.40} />
        </mesh>
      )}

      {/* 2. Các khối ngoại vi hòn đảo (Được ẩn ở chế độ streamlined để giải phóng tối đa tầm nhìn bàn cờ) */}
      {!streamlined && (
        <>
          {/* Cao nguyên cỏ xanh nhiệt đới viền quanh bàn cờ (Lush Tropical Lawn Plateau, #22C55E) */}
          <mesh receiveShadow position={[0, -0.34, 0]}>
            <cylinderGeometry args={[15.6, 17.6, 0.26, 64]} />
            <meshStandardMaterial color="#22C55E" roughness={0.78} metalness={0.02} />
          </mesh>

          {/* Bờ biển cát vát nghiêng ngà mịn tự nhiên (Sloped Fine Ivory Shoreline, #EFE5D8, roughness: 0.85) */}
          <mesh receiveShadow position={[0, -0.36, 0]}>
            <cylinderGeometry args={[17.4, 21.0, 0.24, 64]} />
            <meshStandardMaterial color="#EFE5D8" roughness={0.85} metalness={0.02} />
          </mesh>

          {/* Gờ vát nghiêng bờ cát chuẩn 15 độ tiếp giáp nước biển */}
          <mesh receiveShadow position={[0, -0.75, 0]}>
            <cylinderGeometry args={[27.8, 28.85, 0.28, 64]} />
            <meshStandardMaterial color="#EFE5D8" roughness={0.85} metalness={0.02} />
          </mesh>

          <mesh receiveShadow position={[0, -0.38, 0]}>
            <cylinderGeometry args={[16.2, 17.5, 0.14, 48]} />
            <meshStandardMaterial color="#F3EBE1" roughness={0.85} metalness={0.02} />
          </mesh>

          {/* Mũi bãi tắm cong Tây Nam & Đông Nam */}
          <mesh receiveShadow position={[-11.5, -0.35, 8.5]}>
            <cylinderGeometry args={[2.5, 3.5, 0.18, 32]} />
            <meshStandardMaterial color="#EFE5D8" roughness={0.85} metalness={0.02} />
          </mesh>
          <mesh receiveShadow position={[15.0, -0.55, 15.0]}>
            <cylinderGeometry args={[4.0, 5.8, 0.20, 32]} />
            <meshStandardMaterial color="#EFE5D8" roughness={0.85} metalness={0.02} />
          </mesh>
          <mesh receiveShadow position={[-18, -0.40, -14]}>
            <cylinderGeometry args={[8.0, 10.5, 0.22, 32]} />
            <meshStandardMaterial color="#EFE5D8" roughness={0.85} metalness={0.02} />
          </mesh>

          {/* Dù che nắng bãi biển đa sắc */}
          {([
            [-12.2, 8.2, '#EF4444'],
            [-13.2, 9.5, '#F59E0B'],
            [-11.8, 10.5, '#3B82F6'],
            [-10.8, 9.0, '#10B981'],
          ] as const).map(([bx, bz, color], uIdx) => (
            <group key={`umbrella-${uIdx}`} position={[bx, -0.25, bz]}>
              <mesh position={[0, 0.4, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.8, 6]} />
                <meshStandardMaterial color="#F8FAFC" metalness={0.7} />
              </mesh>
              <mesh position={[0, 0.78, 0]} rotation={[0.1, 0, 0.1]}>
                <coneGeometry args={[0.55, 0.25, 8]} />
                <meshStandardMaterial color={color} roughness={0.3} />
              </mesh>
              <mesh position={[0.2, 0.04, 0]} rotation={[0, 0.3, -0.1]}>
                <boxGeometry args={[0.42, 0.05, 0.22]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
              </mesh>
            </group>
          ))}

          {/* 3. Thảm thực vật nhiệt đới đa tầng & rừng dừa 60 cây (IMP-30) */}
          <LayeredTropicalFoliage />
          <TropicalPalmsCluster />

          {/* 6. Hạ tầng kết nối: Cầu cạn, Ga xe lửa Đông Nam & Sân bay Tây Bắc */}
          <group position={[-18, -0.26, 18]} rotation={[0, 0.78, 0]}>
            <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
              <boxGeometry args={[12, 0.18, 1.4]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.5} />
            </mesh>
            {[-4, 0, 4].map((px) => (
              <mesh key={`pier-${px}`} position={[px, -0.2, 0]}>
                <cylinderGeometry args={[0.25, 0.3, 0.6, 8]} />
                <meshStandardMaterial color="#64748B" roughness={0.7} />
              </mesh>
            ))}
          </group>
          <TrainStationLandmark />
          <AirportLandmark />

          {/* Tàu Container Tây Nam & Du thuyền ven bãi tắm (Ngoại vi bãi cát Tây - chỉ hiện khi streamlined=false) */}
          <group position={[-15.0, -0.30, 9.5]} rotation={[0, -0.85, 0]} scale={[0.75, 0.75, 0.75]}>
            <SafeGLTFModel url={VEHICLE_MODEL_URLS.container} fallback={<ContainerShipProceduralFallback />} castShadow receiveShadow />
            <mesh position={[6.2, 0.05, 0]}>
              <planeGeometry args={[4.2, 1.8]} />
              <meshBasicMaterial color="#FFFFFF" transparent opacity={0.4} />
            </mesh>
          </group>

          <group position={[-11.5, -0.30, 12.0]} rotation={[0, 0.6, 0]}>
            <mesh castShadow position={[0, 0.25, 0]}>
              <boxGeometry args={[3.2, 0.4, 1.0]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.1} />
            </mesh>
            <mesh castShadow position={[0.2, 0.55, 0]}>
              <boxGeometry args={[1.6, 0.35, 0.7]} />
              <meshStandardMaterial color="#0284C7" roughness={0.2} />
            </mesh>
          </group>
        </>
      )}

      {/* 4. Rặng núi chân trời phía Bắc với tháp radar vi mô (#166534, #15803D, #22C55E) */}
      <HorizonMountainRange />

      {/* 5. Tàu Container Nam ngoài khơi xa (Deep Ocean, Z = 36) */}
      <group position={[8, -0.35, 36]} rotation={[0, -0.2, 0]}>
        <SafeGLTFModel url={VEHICLE_MODEL_URLS.container} fallback={<ContainerShipProceduralFallback />} castShadow receiveShadow />
        <mesh position={[-5.2, 0.05, 0]}>
          <planeGeometry args={[3.8, 1.6]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.38} />
        </mesh>
      </group>

      {/* 7. Mây trắng xốp bồng bềnh chân trời & Máy bay dân dụng */}
      {([
        [-34, 22, -38, 1.4],
        [16, 24, -45, 1.6],
        [38, 21, -24, 1.3],
        [-42, 19, 18, 1.5],
        [34, 19, 32, 1.2],
        [-14, 23, 42, 1.4],
      ] as const).map(([cx, cy, cz, scale], cIdx) => (
        <group key={`cloud-${cIdx}`} position={[cx, cy, cz]} scale={scale}>
          <mesh>
            <sphereGeometry args={[2.2, 14, 14]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.95} transparent opacity={0.82} />
          </mesh>
          <mesh position={[1.5, -0.2, 0.4]}><sphereGeometry args={[1.7, 14, 14]} /><meshStandardMaterial color="#FFFFFF" roughness={0.95} transparent opacity={0.82} /></mesh>
          <mesh position={[-1.4, -0.2, -0.4]}><sphereGeometry args={[1.8, 14, 14]} /><meshStandardMaterial color="#FFFFFF" roughness={0.95} transparent opacity={0.82} /></mesh>
        </group>
      ))}

      {/* Máy bay dân dụng tí hon bay trên vịnh biển */}
      <group position={[-14, 14, 8]} rotation={[0, -0.8, 0]}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.22, 0.22, 2.6, 8]} /><meshStandardMaterial color="#F8FAFC" roughness={0.3} /></mesh>
        <mesh position={[0, 0, 0]}><boxGeometry args={[3.2, 0.05, 0.6]} /><meshStandardMaterial color="#38BDF8" roughness={0.4} /></mesh>
        <mesh position={[0, 0.4, 1.1]}><boxGeometry args={[0.06, 0.6, 0.4]} /><meshStandardMaterial color="#0284C7" /></mesh>
      </group>

      {/* 8. Hoạt cảnh hàng hải */}
      <CoastalPatrolBoat />
      <CoastalSeagulls />
    </group>
  );
}
