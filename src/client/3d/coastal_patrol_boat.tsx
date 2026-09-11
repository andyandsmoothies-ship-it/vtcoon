// [UI-S01/MSS] CoastalPatrolBoat — Coast Guard patrol boat cruising coastal bay with wave wakes
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh } from 'three';

function useSafeFrame(callback: (state: Parameters<Parameters<typeof useFrame>[0]>[0]) => void): void {
  try {
    useFrame(callback);
  } catch {
    // Safe outside Canvas in test environment
  }
}

export function CoastalPatrolBoat(): React.ReactElement {
  const boatRef = useRef<Group>(null);
  const wakeLeftRef = useRef<Mesh>(null);
  const wakeRightRef = useRef<Mesh>(null);

  useSafeFrame((state) => {
    const t = state.clock.elapsedTime;
    if (boatRef.current) {
      // Tuần tra vịnh biển phía Nam (khu vực hải cảng & tàu container ngoài khơi)
      const speed = 0.22;
      const angle = t * speed;
      const x = Math.sin(angle) * 28;
      const z = 35 + Math.cos(angle) * 6;
      const y = -0.52 + Math.sin(t * 3.5) * 0.025; // Nhấp nhô cưỡi sóng

      // Hướng di chuyển (tangent)
      const dx = Math.cos(angle) * 28 * speed;
      const dz = -Math.sin(angle) * 6 * speed;
      const yaw = Math.atan2(dx, dz);

      boatRef.current.position.set(x, y, z);
      boatRef.current.rotation.y = yaw;
      // Lắc lư nghiêng mạn theo nhịp sóng rẽ nước
      boatRef.current.rotation.z = Math.sin(t * 3.2) * 0.05;
      boatRef.current.rotation.x = -0.04 + Math.sin(t * 3.8) * 0.04;
    }

    // Bọt nước rẽ sóng co giãn theo tốc độ lướt
    const wakeScale = 1.0 + Math.sin(t * 6.0) * 0.15;
    if (wakeLeftRef.current) {
      wakeLeftRef.current.scale.set(wakeScale, 1, wakeScale);
    }
    if (wakeRightRef.current) {
      wakeRightRef.current.scale.set(wakeScale, 1, wakeScale);
    }
  });

  return (
    <group ref={boatRef} position={[0, -0.52, 41]} data-testid="coastal-patrol-boat">
      {/* 1. Thân ca-nô tuần duyên (Coast Guard Deep-V Hull) */}
      <mesh castShadow position={[0, 0.08, 0]}>
        <boxGeometry args={[0.55, 0.2, 1.4]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Mũi thuyền nhọn vát lướt sóng */}
      <mesh castShadow position={[0, 0.08, 0.85]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.4, 0.2, 0.4]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
      </mesh>

      {/* Dải vạch màu cam Cảnh sát Biển chạy dọc mạn thuyền */}
      <mesh position={[0, 0.12, 0.05]}>
        <boxGeometry args={[0.57, 0.06, 1.2]} />
        <meshStandardMaterial color="#EA580C" roughness={0.4} />
      </mesh>
      {/* Vạch phụ xanh dương biển sâu */}
      <mesh position={[0, 0.07, 0.05]}>
        <boxGeometry args={[0.57, 0.04, 1.2]} />
        <meshStandardMaterial color="#0284C7" roughness={0.4} />
      </mesh>

      {/* 2. Cabin chỉ huy kính tối màu */}
      <mesh position={[0, 0.24, -0.05]} castShadow>
        <boxGeometry args={[0.42, 0.16, 0.55]} />
        <meshStandardMaterial color="#F1F5F9" roughness={0.25} />
      </mesh>
      {/* Kính chắn gió buồng lái vát nghiêng */}
      <mesh position={[0, 0.24, 0.22]} rotation={[-0.25, 0, 0]}>
        <boxGeometry args={[0.4, 0.13, 0.06]} />
        <meshStandardMaterial color="#0F172A" roughness={0.15} />
      </mesh>

      {/* 3. Khung vòm radar & đèn tín hiệu tuần tra (Radar Arch & Beacon) */}
      <mesh position={[0, 0.38, -0.22]}>
        <boxGeometry args={[0.4, 0.12, 0.06]} />
        <meshStandardMaterial color="#CBD5E1" metalness={0.7} />
      </mesh>
      {/* Cột ăng-ten vòm radar tròn */}
      <mesh position={[0, 0.47, -0.22]}>
        <cylinderGeometry args={[0.07, 0.07, 0.06, 8]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
      </mesh>
      {/* Đèn chớp cảnh báo xanh/đỏ */}
      <mesh position={[-0.14, 0.44, -0.22]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#3B82F6" />
      </mesh>
      <mesh position={[0.14, 0.44, -0.22]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#EF4444" />
      </mesh>

      {/* 4. Động cơ kép gắn ngoài đuôi (Twin Outboard Motors) */}
      <mesh position={[-0.16, 0.06, -0.76]} castShadow>
        <boxGeometry args={[0.1, 0.18, 0.14]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.16, 0.06, -0.76]} castShadow>
        <boxGeometry args={[0.1, 0.18, 0.14]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* 5. VỆT BỌT NƯỚC RẼ SÓNG ĐUÔI TÀU (Dynamic Foam Wake V-Trails) */}
      <group position={[0, -0.01, -0.8]}>
        {/* Vệt bọt mạn trái */}
        <mesh
          ref={wakeLeftRef}
          position={[-0.35, 0, -0.6]}
          rotation={[-Math.PI / 2, 0, 0.35]}
        >
          <planeGeometry args={[0.3, 1.4]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.48} />
        </mesh>
        {/* Vệt bọt mạn phải */}
        <mesh
          ref={wakeRightRef}
          position={[0.35, 0, -0.6]}
          rotation={[-Math.PI / 2, 0, -0.35]}
        >
          <planeGeometry args={[0.3, 1.4]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.48} />
        </mesh>
      </group>
    </group>
  );
}
