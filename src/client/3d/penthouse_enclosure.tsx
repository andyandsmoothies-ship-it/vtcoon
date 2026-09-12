// [TC-P3.10/MSS] penthouse_enclosure.tsx — Kiến tạo Không gian Nội thất Penthouse Thực thụ (Architectural Enclosure)
import React, { useMemo, useEffect } from 'react';
import { DoubleSide } from 'three';
import { RoundedBox, MeshReflectorMaterial, Text } from '@react-three/drei';
import { PENTHOUSE_COLORS, PENTHOUSE_DIMENSIONS } from './penthouse_lobby_scene';
import { generateSunsetBackdropTexture } from './penthouse_texture_generator';

export const PANORAMA_WINDOW_CONFIG = {
  radius: 20,
  height: 14,
  radialSegments: 32,
  thetaStart: 0,
  thetaLength: Math.PI,
  rotationY: 2.51, // Quay 144 độ để bao trọn góc nhìn camera ra vịnh biển hoàng hôn
  mullionCount: 9,
} as const;

export function PenthouseEnclosure(): React.ReactElement {
  const sunsetTexture = useMemo(() => generateSunsetBackdropTexture(), []);

  useEffect(() => {
    return () => {
      if (typeof sunsetTexture?.dispose === 'function') {
        sunsetTexture.dispose();
      }
    };
  }, [sunsetTexture]);

  // Góc chia 9 nan nẹp khung nhôm chia 8 ô cửa sổ kịch trần
  const mullionAngles = useMemo(() => {
    return Array.from({ length: PANORAMA_WINDOW_CONFIG.mullionCount }, (_, i) => {
      return (i * Math.PI) / (PANORAMA_WINDOW_CONFIG.mullionCount - 1);
    });
  }, []);

  return (
    <group>
      {/* 1. Sàn đá cẩm thạch trắng Carrara phản chiếu chân thực với MeshReflectorMaterial */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[36, 36]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={512}
          mirror={0.45}
          mixBlur={0.8}
          mixStrength={1.4}
          roughness={0.12}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color={PENTHOUSE_COLORS.marbleFloor}
          metalness={0.08}
        />
      </mesh>

      {/* Thảm nhung dệt tròn đặt dưới bàn tròn & vành kim loại vàng Champagne */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]} receiveShadow>
        <circleGeometry args={[PENTHOUSE_DIMENSIONS.carpetRadius, 48]} />
        <meshStandardMaterial color={PENTHOUSE_COLORS.carpet} roughness={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[PENTHOUSE_DIMENSIONS.carpetRadius - 0.06, PENTHOUSE_DIMENSIONS.carpetRadius, 48]} />
        <meshStandardMaterial color={PENTHOUSE_COLORS.goldBezel} metalness={0.9} roughness={0.2} />
      </mesh>

      {/* 2. Vách kính cong Panorama bán nguyệt 180 độ kịch trần nhìn ra vịnh biển hoàng hôn */}
      <group position={[0, 5.0, 0]} rotation={[0, PANORAMA_WINDOW_CONFIG.rotationY, 0]}>
        {/* Vách kính cong 180 độ PBR cao cấp */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry
            args={[
              PANORAMA_WINDOW_CONFIG.radius,
              PANORAMA_WINDOW_CONFIG.radius,
              PANORAMA_WINDOW_CONFIG.height,
              PANORAMA_WINDOW_CONFIG.radialSegments,
              1,
              true,
              PANORAMA_WINDOW_CONFIG.thetaStart,
              PANORAMA_WINDOW_CONFIG.thetaLength,
            ]}
          />
          <meshPhysicalMaterial
            transparent
            opacity={0.22}
            roughness={0.05}
            metalness={0.1}
            color="#E0F2FE"
            ior={1.52}
            side={DoubleSide}
          />
        </mesh>

        {/* Nẹp khung nhôm xước mờ màu đen than chì (#1E293B, roughness: 0.3) chia vách kính thành các ô kịch trần */}
        {mullionAngles.map((angle, idx) => {
          const x = (PANORAMA_WINDOW_CONFIG.radius - 0.04) * Math.sin(angle);
          const z = (PANORAMA_WINDOW_CONFIG.radius - 0.04) * Math.cos(angle);
          return (
            <mesh key={`mullion-${idx}`} position={[x, 0, z]}>
              <cylinderGeometry args={[0.06, 0.06, PANORAMA_WINDOW_CONFIG.height, 16]} />
              <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.85} />
            </mesh>
          );
        })}

        {/* Nẹp đai cong trên đỉnh và chân vách kính */}
        <mesh
          position={[0, PANORAMA_WINDOW_CONFIG.height / 2 - 0.08, 0]}
          rotation={[Math.PI / 2, 0, -Math.PI / 2]}
          scale={[-1, 1, 1]}
        >
          <torusGeometry args={[PANORAMA_WINDOW_CONFIG.radius - 0.04, 0.06, 8, 32, Math.PI]} />
          <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.85} />
        </mesh>
        <mesh
          position={[0, -PANORAMA_WINDOW_CONFIG.height / 2 + 0.08, 0]}
          rotation={[Math.PI / 2, 0, -Math.PI / 2]}
          scale={[-1, 1, 1]}
        >
          <torusGeometry args={[PANORAMA_WINDOW_CONFIG.radius - 0.04, 0.06, 8, 32, Math.PI]} />
          <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.85} />
        </mesh>

        {/* Hậu cảnh hoàng hôn bán đảo vịnh biển uốn cong tự nhiên phía sau vách kính */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry
            args={[
              PANORAMA_WINDOW_CONFIG.radius + 0.8,
              PANORAMA_WINDOW_CONFIG.radius + 0.8,
              PANORAMA_WINDOW_CONFIG.height + 0.8,
              PANORAMA_WINDOW_CONFIG.radialSegments,
              1,
              true,
              PANORAMA_WINDOW_CONFIG.thetaStart,
              PANORAMA_WINDOW_CONFIG.thetaLength,
            ]}
          />
          <meshBasicMaterial map={sunsetTexture} side={DoubleSide} />
        </mesh>
      </group>

      {/* 3. Trần thạch cao giật cấp với vòm trần chứa dải đèn hắt Cove Light vàng ấm #FEF3C7 rọi xuống sàn */}
      <group position={[0, 0, 0]}>
        {/* Tấm trần chính kịch trần */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, PENTHOUSE_DIMENSIONS.ceilingHeight + 0.5, 0]}>
          <planeGeometry args={[36, 36]} />
          <meshStandardMaterial color="#0A0F1D" roughness={0.7} />
        </mesh>

        {/* Khối trần giật cấp tầng 1 */}
        <mesh position={[0, PENTHOUSE_DIMENSIONS.ceilingHeight + 0.25, 0]}>
          <cylinderGeometry args={[9.2, 9.2, 0.2, 48]} />
          <meshStandardMaterial color="#0F172A" roughness={0.6} />
        </mesh>

        {/* Khối trần giật cấp tầng 2 */}
        <mesh position={[0, PENTHOUSE_DIMENSIONS.ceilingHeight + 0.05, 0]}>
          <cylinderGeometry args={[8.2, 8.2, 0.15, 48]} />
          <meshStandardMaterial color="#1E293B" roughness={0.5} />
        </mesh>

        {/* Dải đèn hắt Cove Light vàng ấm #FEF3C7 rọi xuống sàn đá cẩm thạch Carrara */}
        <mesh position={[0, PENTHOUSE_DIMENSIONS.ceilingHeight - 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[8.15, 8.65, 48]} />
          <meshStandardMaterial
            color="#FEF3C7"
            emissive="#FEF3C7"
            emissiveIntensity={2.5}
            side={DoubleSide}
          />
        </mesh>

        {/* Nguồn sáng Cove Light rọi trực tiếp từ vòm trần */}
        <pointLight
          position={[0, PENTHOUSE_DIMENSIONS.ceilingHeight - 0.2, 0]}
          color="#FEF3C7"
          intensity={2.6}
          distance={10}
        />
      </group>

      {/* 4. Vách tường đá ốp cẩm thạch cánh phải & Biển hiệu logo VTCOON dập nổi */}
      <group position={[7.8, 2.5, -0.5]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.35, 5.0, 16]} />
          <meshStandardMaterial color={PENTHOUSE_COLORS.wallMarble} roughness={0.25} />
        </mesh>
        {[-5, -3, -1, 1, 3, 5].map((z) => (
          <mesh key={`gold-strip-${z}`} position={[-0.19, 0, z]}>
            <boxGeometry args={[0.04, 5.0, 0.08]} />
            <meshStandardMaterial color={PENTHOUSE_COLORS.goldBezel} metalness={0.95} roughness={0.15} />
          </mesh>
        ))}

        {/* Biển hiệu VTCOON dập nổi mạ vàng */}
        <group position={[-0.22, 0.9, -1.2]} rotation={[0, -Math.PI / 2, 0]}>
          <RoundedBox args={[3.4, 1.2, 0.08]} radius={0.04} smoothness={4}>
            <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.7} />
          </RoundedBox>
          <RoundedBox args={[3.5, 1.3, 0.04]} radius={0.04} smoothness={4} position={[0, 0, -0.02]}>
            <meshStandardMaterial color={PENTHOUSE_COLORS.goldBezel} metalness={0.9} roughness={0.1} />
          </RoundedBox>
          <Text position={[0, 0, 0.06]} fontSize={0.46} color="#FBBF24" anchorX="center" anchorY="middle">
            VTCOON
          </Text>
        </group>

        {/* Ghế sofa bọc da cao cấp góc phòng */}
        <group position={[-1.6, -1.65, -3.2]}>
          <RoundedBox args={[1.8, 0.8, 3.8]} radius={0.12} smoothness={4}>
            <meshStandardMaterial color="#334155" roughness={0.75} />
          </RoundedBox>
        </group>
      </group>
    </group>
  );
}
