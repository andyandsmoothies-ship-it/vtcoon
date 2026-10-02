# PLAN IMP-246: Tall Chess GLTF Asset Pipeline Modernization (Revision 5)

## 1. Tóm tắt Mục tiêu (Executive Summary)
Giải quyết dứt điểm vấn đề Asset Pipeline (Pillar 3) bằng cách:
1. **Dọn dẹp Dead Code**: Xóa bỏ `SafeGLTFModel` và cơ chế `forceFallback={true}` đang bị lạm dụng trong `luxury_pawn_models.tsx`. 
2. **Kích hoạt GLTF Pipeline an toàn**: Load GLTF bằng `useGLTF`, sử dụng component `<Clone>` của `@react-three/drei`. Sử dụng `instanceof Mesh` để phân loại node, mutate màu qua `color.set()` kết hợp `needsUpdate = true` để đảm bảo R3F luôn render đúng.
3. **Bảo toàn Call-Site**: Giữ nguyên `LuxuryPawnModel` làm router và các thẻ `<group>` bọc ngoài (`PawnAuraPedestal`, `EnamelRing`).
4. **Cập nhật Hợp đồng Test**: Viết lại `tall_chess_pawns_full_color.test.ts` theo chuẩn Detroit.

---

## 2. Bảng Phục hồi Chỉ thị Griller (Anti-Sycophancy Closure Table)
| Griller Directive | Address Location | Status |
| :--- | :--- | :--- |
| **Vấn đề 1**: Vi phạm Zero Dirty Cast `(node as any).isMesh` | Snippet 2.2 | Đã sửa thành `if (!(node instanceof Mesh)) return null;` (Type-safe). |
| **Vấn đề 2**: `useGLTF.preload` sai vị trí | Snippet 2.2 | Đã chuyển `useGLTF.preload` xuống cuối file để không gây fetch trước khi mount Canvas. |
| **Vấn đề 3**: Mutate material cần `needsUpdate` | Snippet 2.2 | Thêm `bodyMaterial.color.set(playerColor); bodyMaterial.needsUpdate = true;`. Giữ nguyên SRP cleanup. |
| **Vấn đề 4**: Không xử lý Mesh Naming Convention | Bước 1 & Snippet 2.2 | Thêm Bước 1a định nghĩa Contract cho 3D Artist. Đổi logic tìm Trim bằng metadata `node.userData.isTrim` hoặc fallback name. |
| **Vấn đề 5**: LOC Delta sai toán học | Mục 3 | Tính toán lại Delta: 178 + 34 = 212 LOC. |
| **Vấn đề 6**: `PlayerColorMap` không tồn tại | Snippet 2.1 | Bỏ import ảo tưởng. Prop `playerColor` vốn đã là Hex string. |
| **Vấn đề 7**: Test Spec Change Detector | Bước 3 | Cập nhật Test Assert vào Behavior (Mesh nhận đúng Material Group). |

---

## 3. LOC Baseline & Target
| File | Pre-LOC | Delta | Post-LOC | Action |
| :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/luxury_pawn_models.tsx` | 178 | +34 | 212 | Thay thế SafeGLTFModel bằng DynamicGLTFPawn. Khắc phục rò rỉ VRAM. |
| `tests/client/tall_chess_pawns_full_color.test.ts` | (Linh động) | (Linh động) | (Linh động) | Xóa test `forceFallback`, thêm test GLTF behavior. |

---

## 4. Các bước Triển khai chi tiết (Drop-in Snippets)

### Bước 1: Chuẩn hóa Asset GLTF (Nhiệm vụ cho 3D Artist / Exporter)
Các file `pawn_rook.glb`, `pawn_cannon.glb`, `pawn_horse.glb`, `pawn_queen.glb` phải tuân thủ nghiêm ngặt **Asset Naming/Metadata Contract**:
- Mesh Thân cờ (nhận playerColor): Đặt tên chứa từ `Body`.
- Mesh Vành/Trang trí (màu vàng kim cố định): Đặt tên chứa từ `Trim` HOẶC có Custom Property `userData.isTrim = true`.

### Bước 2: Tái cấu trúc `src/client/3d/luxury_pawn_models.tsx`

**Snippet 2.1: Cập nhật Import (L1-L7)**
==== BEFORE ====
```tsx
// [TC-P3.9/MSS][IMP-29.2][IMP-105] luxury_pawn_models.tsx — 4 Quân Cờ Thượng Lưu nạp qua SafeGLTFModel
import React from 'react';
import './r3f_fiber_shield';
import { SafeGLTFModel } from './asset_loader/safe_gltf_model';
import {
  LuxuryPawnProceduralFallback,
  RookPawnFallback,
```
==== AFTER ====
```tsx
// [TC-P3.9/MSS][IMP-29.2][IMP-105] luxury_pawn_models.tsx — 4 Quân Cờ Thượng Lưu nạp qua SafeGLTFModel
import React, { useMemo, useEffect } from 'react';
import './r3f_fiber_shield';
import { useGLTF, Clone } from '@react-three/drei';
import { Mesh, MeshStandardMaterial } from 'three';
import {
  LuxuryPawnProceduralFallback,
  RookPawnFallback,
```

**Snippet 2.2: Chèn Component DynamicGLTFPawn (L113-L115)**
==== BEFORE ====
```tsx
}

export interface LuxuryPawnModelProps {
```
==== AFTER ====
```tsx
}

interface DynamicGLTFPawnProps {
  modelUrl: string;
  playerColor: string;
}

function DynamicGLTFPawn({ modelUrl, playerColor }: DynamicGLTFPawnProps) {
  const { scene } = useGLTF(modelUrl);
  
  const bodyMaterial = useMemo(() => new MeshStandardMaterial({
    roughness: 0.15, metalness: 0.2
  }), []);
  
  const trimMaterial = useMemo(() => new MeshStandardMaterial({
    color: '#F59E0B', roughness: 0.1, metalness: 0.9
  }), []);

  useEffect(() => {
    bodyMaterial.color.set(playerColor);
    bodyMaterial.needsUpdate = true;
  }, [playerColor, bodyMaterial]);

  useEffect(() => {
    return () => {
      bodyMaterial.dispose();
      trimMaterial.dispose();
    };
  }, [bodyMaterial, trimMaterial]);

  return (
    <Clone 
      object={scene} 
      castShadow 
      receiveShadow 
      inject={(node) => {
        if (!(node instanceof Mesh)) return null;
        if (node.name.includes('Trim') || node.userData.isTrim) {
          return <primitive object={trimMaterial} attach="material" />;
        }
        return <primitive object={bodyMaterial} attach="material" />;
      }}
    />
  );
}

export interface LuxuryPawnModelProps {
```

**Snippet 2.3: Xóa SafeGLTFModel (L161-L172)**
==== BEFORE ====
```tsx

      {/* 2. Mô hình 3D nạp qua SafeGLTFModel, tự động chuyển về Fallback khi lỗi/SSR */}
      <SafeGLTFModel
        url={config.modelUrl}
        fallback={<LuxuryPawnProceduralFallback slotIndex={config.slot} config={config} playerColor={activeColor} />}
        position={[0, config.yOffset ?? 0.03, 0]}
        scale={[...config.scale]}
        castShadow
        receiveShadow
        forceFallback={true}
      />

      {/* Contract retention: IMP-29.2 and IMP-82 backward compatibility */}
```
==== AFTER ====
```tsx

      {/* 2. Mô hình 3D nạp qua GLTF Pipeline chuẩn, inject vật liệu động */}
      <group position={[0, config.yOffset ?? 0.03, 0]} scale={[...config.scale]}>
        <DynamicGLTFPawn modelUrl={config.modelUrl} playerColor={activeColor} />
      </group>

      {/* Contract retention: IMP-29.2 and IMP-82 backward compatibility */}
```

**Snippet 2.4: Đẩy Preload xuống cuối file (L176-178)**
==== BEFORE ====
```tsx
  );
}

```
==== AFTER ====
```tsx
  );
}

useGLTF.preload('/models/pawns/pawn_rook.glb');
useGLTF.preload('/models/pawns/pawn_cannon.glb');
useGLTF.preload('/models/pawns/pawn_horse.glb');
useGLTF.preload('/models/pawns/pawn_queen.glb');
```

### Bước 3: Trạm 1 (Station 1 RED Contract)
Cập nhật `tests/client/tall_chess_pawns_full_color.test.ts`:
- **Xóa**: Các test assert nội bộ rỗng (change detectors) và check `forceFallback={true}`.
- **Thêm**:
  - `[TC-AP01/MSS]` Hợp đồng Hiển thị: Render `LuxuryPawnModel`, kiểm tra `scene` không crash và Mesh có tên chứa "Body" (hoặc child của Clone) đang nhận `material.color` phản ánh đúng prop `playerColor`.
  - `[TC-AP02/MSS]` Phân tách Vật liệu: Đảm bảo Mesh chứa "Trim" nhận mã màu `#F59E0B`.

---

## 5. Cam kết Kiến trúc (Architecture Commitments)
- P1 Guard được thay bằng `instanceof Mesh` tuyệt đối type-safe.
- Logic SRP và `needsUpdate` chuẩn WebGL.
- Test Spec đảm bảo kiểm tra hành vi (Behavior) không phải cấu trúc (Implementation).
