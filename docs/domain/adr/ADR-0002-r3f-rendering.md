Kiến trúc kỹ thuật cho trò chơi cờ tỷ phú sử dụng giải pháp **2.5D Billboard (Cardboard Standee)** kết hợp giữa **React Three Fiber (R3F)** và **HTML5 UI Overlay** nhằm đảm bảo hiệu năng tải trang nhẹ, thẩm mỹ đồng nhất và hiển thị chuẩn xác bản sắc văn hóa từng địa phương mà không phụ thuộc vào việc dựng mô hình 3D thủ công.

### **1. TỔNG QUAN STACK CÔNG NGHỆ**

| Tầng kiến trúc | Công nghệ sử dụng | Chức năng chi tiết |
| :---- | :---- | :---- |
| **Framework nền** | Next.js hoặc Vite + React (TypeScript) | Quản lý vòng đời ứng dụng, state management và routing. |
| **3D Rendering Engine** | React Three Fiber (@react-three/fiber) | Cầu nối Declarative giữa React và WebGL/Three.js. |
| **3D Helpers** | @react-three/drei, @react-spring/three | Cung cấp component `<Billboard>`, `<OrthographicCamera>`, `<Image>`. Điều khiển chuyển động lò xo nảy đàn hồi (Spring Animation) khi sa bàn trồi lên từ mặt đế, loại bỏ việc phải tự viết keyframe thủ công. |
| **Physics Xúc xắc** | @react-three/rapier hoặc dice-box | Tính toán va chạm vật lý xúc xắc độc lập, trả về kết quả số chấm. |
| **UI & Layout Overlay** | Tailwind CSS + Framer Motion | Hiển thị HUD, Thẻ bài Title Deed, bảng điều khiển, hoạt ảnh lật thẻ. |
| **State Management** | Zustand | Đồng bộ trạng thái bàn cờ, số dư tài khoản, vị trí người chơi theo thời gian thực. |
| **Realtime Networking**  | `socket.io-client` / WebSockets  | Kết nối truyền tin hai chiều độ trễ thấp, quản lý phiên đấu giá và đồng bộ phòng chơi.  |
| **Audio Engine**  | `howler.js` (Web Audio API)  | Quản lý phát âm thanh không gian (Spatial Audio), nhạc nền thích ứng theo vùng miền và tối ưu hóa bộ nhớ audio buffer.  |

### **2. PHÂN TẦNG GIAO DIỆN HYBRID (CANVAS VS. DOM OVERLAY)**

Hệ thống được chia thành 2 lớp độc lập xếp chồng theo trục Z-index:

┌──────────────────────────────────────────────────────────┐    
│ LỚP 2: DOM/HTML UI OVERLAY (Z-Index: 10, Tailwind CSS)   │    
│ - Bảng thông tin tài chính người chơi (HUD)              │    
│ - Modal xem Thẻ Chủ Quyền (Title Deed) chi tiết          │    
│ - Bảng kê khai thuế ô GO & Khớp lệnh sàn HOSE            │    
│ - [MỚI] Sàn Đấu giá Trực tuyến (Live Auction Modal)       │  
│ - [MỚI] Khung Đàm phán Giao dịch Song phương (P2P Trade) │  
│ - Nút thao tác: "Đổ xúc xắc", "Nâng cấp", "Thế chấp"     │    
└────────────────────────────┬─────────────────────────────┘  
                             │ (Giao tiếp qua Zustand State)  
┌────────────────────────────▼─────────────────────────────┐  
│ LỚP 1: WEBGL CANVAS (Z-Index: 0, React Three Fiber)       │  
│ - Bàn cờ 40 ô (Khối đế Procedural Mesh)                  │  
│ - Standee 2.5D xoay theo camera (<Billboard>)            │  
│ - Quân cờ di chuyển (Pawn Animation)                     │  
│ - Mô phỏng xúc xắc 3D rơi vật lý                         │  
└──────────────────────────────────────────────────────────┘

### **3. CẤU TRÚC DỮ LIỆU BÀN CỜ (SCHEMA CONFIGURATION)**

Toàn bộ thông số 40 ô được quản lý tập trung trong file cấu hình tĩnh boardConfig.ts, cho phép mở rộng và điều chỉnh tham số tài chính mà không can thiệp vào logic render:

```typescript
export interface PropertyLevelConfig {
  name: string;             // Tên công trình (VD: "Đồi Săn Mây", "Homestay")
  cost: number;             // Chi phí xây dựng (Tr. VNĐ)
  rentFee: number;          // Tiền thuê khi dừng chân (Tr. VNĐ)
  assets: {
    main: string;
    overlay: string;
    audioId: string;
  };
}

export interface BoardTileConfig {
  id: number;               // 0 -> 39
  name: string;             // "Cần Thơ", "Lâm Đồng", "EVN"
  type: 'PROPERTY' | 'SERVICE' | 'INFRASTRUCTURE' | 'UTILITY' | 'ACTION';
  groupColor?: string;      // Mã HEX màu nhóm đất
  basePrice: number;        // Giá niêm yết ban đầu
  mortgageValue: number;    // Giá trị thế chấp
  levels: PropertyLevelConfig[]; // Cấp 0 -> Cấp 3
  specialRules?: string;    // "TRAPPED_TURN", "DICE_BONUS"
}
```

### **4. NGUYÊN LÝ KỸ THUẬT 2.5D BILLBOARD TRÊN MỖI Ô**

Mỗi ô bàn cờ là một Group 3D gồm 3 phần tử: **Khối đế 3D cơ sở**, **Standee 2.5D động** và **Chỉ báo cấp độ (Tier Marker)**.

```tsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Image } from '@react-three/drei';
import { animated, useSpring } from '@react-spring/three';
import * as THREE from 'three';
import { BoardTileConfig } from './boardConfig';

interface LayeredDioramaTileProps {
  config: BoardTileConfig;
  position: [number, number, number];
  currentLevel: number;
  isElevated?: boolean;
  onClick: () => void;
}

export const LayeredDioramaTile: React.FC<LayeredDioramaTileProps> = ({
  config,
  position,
  currentLevel,
  isElevated = false,
  onClick,
}) => {
  const currentAssets = config.levels[currentLevel]?.assets;
  const mainEntityRef = useRef<THREE.Group>(null);

  // Spring animation cho độ cao trục Y
  const { yPosition } = useSpring({
    yPosition: isElevated ? position[1] + 0.5 : position[1],
    config: { tension: 170, friction: 12 },
  });

  // Dao động điều hòa cho lớp entity chính: Y(t) = sin(omega * t)
  useFrame((state) => {
    if (mainEntityRef.current) {
      const omega = 2;
      const t = state.clock.getElapsedTime();
      mainEntityRef.current.position.y = Math.sin(omega * t) * 0.05;
    }
  });

  return (
    <animated.group position-x={position[0]} position-y={yPosition} position-z={position[2]} onClick={onClick}>
      {/* Khối đế CƠ SỞ */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[1.8, 0.2, 2.2]} />
        <meshStandardMaterial color="#F4F5F7" />
      </mesh>

      {/* Vạch màu nhận diện nhóm đất */}
      {config.groupColor && (
        <mesh position={[0, 0.21, -0.95]}>
          <planeGeometry args={[1.8, 0.3]} />
          <meshBasicMaterial color={config.groupColor} />
        </mesh>
      )}

      {/* Lớp Entity chính có hiệu ứng dao động điều hòa */}
      {currentAssets?.main && (
        <group ref={mainEntityRef}>
          <Billboard position={[0, 0.8, 0]} follow lockX={false} lockY={false} lockZ={false}>
            <Image url={currentAssets.main} transparent scale={[1.2, 1.2]} />
          </Billboard>
        </group>
      )}

      {/* Lớp Overlay bổ trợ */}
      {currentAssets?.overlay && (
        <Billboard position={[0, 1.1, 0.1]} follow lockX={false} lockY={false} lockZ={false}>
          <Image url={currentAssets.overlay} transparent scale={[0.8, 0.8]} />
        </Billboard>
      )}

      {/* Token chỉ báo nâng cấp */}
      {currentLevel > 0 && (
        <group position={[0.6, 0.2, 0.8]}>
          {Array.from({ length: currentLevel }).map((_, index) => (
            <mesh key={index} position={[0, index * 0.15, 0]} castShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.12, 16]} />
              <meshStandardMaterial color={currentLevel === 3 ? "#D4AF37" : "#008080"} />
            </mesh>
          ))}
        </group>
      )}
    </animated.group>
  );
};
```

### **5. THIẾT LẬP CAMERA GÓC NHÌN ISOMETRIC (ORTHOGRAPHIC VIEWPORT)**

Để tạo giao diện 2.5D chuẩn xác (các đường song song không bị hút về điểm tụ, chữ và tỷ lệ ô không bị méo khi nhìn từ xa), sử dụng **Orthographic Camera** góc nghiêng 45°:

```tsx
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, OrbitControls } from '@react-three/drei';

export const GameScene = () => {
  return (
    <Canvas shadows className="w-full h-screen bg-slate-900">
      {/* Thiết lập Camera Isometric chuẩn tỷ lệ */}
      <OrthographicCamera
        makeDefault
        position={[25, 25, 25]} // Tọa độ chéo đều 3 trục
        zoom={35}                // Tỷ lệ hiển thị sa bàn
        near={-50}
        far={200}
      />
        
      {/* Khóa góc xoay để người dùng chỉ zoom/pan nhẹ mà không làm đảo lộn góc 2.5D */}
      <OrbitControls
        enableRotate={false}
        enablePan={true}
        enableZoom={true}
        minZoom={25}
        maxZoom={50}
      />

      {/* Hệ thống ánh sáng mềm tạo bóng đổ sa bàn */}
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[15, 30, 15]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Bàn cờ và logic trò chơi */}
      <GameBoard />
    </Canvas>
  );
};
```

### **6. QUY TRÌNH XỬ LÝ TÀI NGUYÊN HÌNH ẢNH (ASSET PIPELINE)**

Để đảm bảo hiệu năng tải trang mượt mà trên môi trường Web:

> 1. **Chuẩn hóa định dạng:** Toàn bộ ảnh minh họa biểu tượng của từng ô được lưu ở định dạng **WebP** có kênh Alpha trong suốt (Transparent background), độ phân giải chuẩn **512x512px**.  
> 2. **Quy tắc đặt tên Asset:** Đồng bộ cấu trúc thư mục theo mã định danh của ô và cấp độ:  
   * /public/assets/tiles/tile_01_lvl0.webp (Cần Thơ - Đất trống)  
   * /public/assets/tiles/tile_01_lvl1.webp (Cần Thơ - Shophouse)  
   * /public/assets/tiles/tile_01_lvl2.webp (Cần Thơ - Tòa nhà VP)  
   * /public/assets/tiles/tile_01_lvl3.webp (Cần Thơ - TTTM Bến Ninh Kiều)  
> 3. **Cơ chế nạp trước (Preloading):** Sử dụng useImage.preload() của Drei để tải ngầm toàn bộ 28 bộ ảnh khi người chơi đang ở màn hình chờ (Lobby), loại bỏ độ trễ khi chuyển cấp độ trên bàn cờ.