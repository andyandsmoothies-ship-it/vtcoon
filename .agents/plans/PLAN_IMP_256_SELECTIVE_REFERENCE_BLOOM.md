# [PLAN] IMP-256: Hiệu Ứng Phát Sáng Chọn Lọc 3D Bằng Lớp Selective Bloom & Phân Tách Ánh Hào Quang (3D Selective Reference Bloom Pass & Emissive Glow Isolation) - Revision 1.1

> **Ticket ID**: IMP-256  
> **Type**: Improvement / 3D Post-Processing & Lighting Visual Polish  
> **SSOT Reference**: `docs/domain/design.md`, `docs/domain/gotchas.md` (Pillar 2: 2D UI & 3D Spatial Systems, Gotcha #12, #29)  
> **Status**: REVISION 1.1 (Hardened: 100% Plan Griller Directives Reconciled)

---

## 0. BẢNG ĐỐI ỨNG 1:1 KHẮC PHỤC TOÀN BỘ CHỈ THỊ CỦA PLAN GRILLER (STAGE A RECONCILIATION TABLE)

| Mã Chỉ Thị | Hạng Mục & Vị Trí Vật Lý | Nội Dung Khiếm Khuyết Từ Plan Griller | Giải Pháp Khắc Phục Cơ Học Triệt Để Trong Rev 1.1 | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- |
| **DIR-G1** | **[P0 - DEAD PATH TARGET]** `src/client/game_canvas.tsx#L458-467` | `enableSelectiveBloom` mặc định là `false` và không được truyền tại `game_canvas.tsx`, khiến Selective Bloom không bao giờ chạy trên production. | **Bổ sung Task 4 nối thông prop vào `game_canvas.tsx`**: Truyền `enableSelectiveBloom={!isMobileDevice}` tại `src/client/game_canvas.tsx#L466`, đưa `game_canvas.tsx` vào bảng LOC (475 $\to$ 476 LOC $\le 500$, `⚠️ Warning`) và ghi nhận nợ kỹ thuật `DEBT-GAME-CANVAS-PARTITION`. | **CLOSED** |
| **DIR-G2** | **[P5 - MISSING VISUAL GATE]** Section 7 (DoD Matrix) | Thiếu quy chuẩn bằng chứng thị giác Phase 3.0 cho thay đổi 3D theo Gotcha #29. | **Bổ sung yêu cầu Phase 3.0 Dual-Viewport**: Bắt buộc chạy `npm run capture:visual -- --ticket IMP-256` thu thập bằng chứng kép (Desktop 1280x800 & Mobile 360x740) vào `.agents/tmp/` để thẩm định thị giác trước Trạm 3. | **CLOSED** |
| **DIR-G3** | **[P1 - HOOK SPYING PARITY]** `src/client/3d/tile_event_aura.tsx#L377-417` | Named imports `useRef, useEffect` phá vỡ `vi.spyOn(React, ...)` trong test VDOM theo Gotcha #12. | **Chuẩn hóa sang `React.useRef` và `React.useEffect`**: Giữ nguyên `import React from 'react';` và gọi trực tiếp `React.useRef<Mesh>(null)` cùng `React.useEffect(...)` để tương thích 100% với `vi.spyOn(React, ...)` trong test VDOM. | **CLOSED** |
| **DIR-G4** | **[P1 - DEFENSIVE FLOAT & NULL GUARD]** `selective_bloom_registry.ts#L203-235` | `calculateSelectiveBloomIntensity` thiếu guard `Number.isFinite`; `isSelectiveBloomTagged` thiếu optional chaining khi nhận mock object. | **Thêm chốt chặn an toàn số học & Mock Defense**: Thêm `if (!Number.isFinite(baseIntensity)) return SELECTIVE_BLOOM_DEFAULTS.intensity;` và dùng `object.layers?.isEnabled?.(SELECTIVE_BLOOM_LAYER) || Boolean(object.userData?.selectiveBloom)`. | **CLOSED** |

---

## 1. MỤC TIÊU & PHẠM VI (PILLAR 0)

### 1.1. Hiện Trạng & Vấn Đề Kỹ Thuật
Trong hệ thống hậu kỳ 3D hiện tại của VTCoOn ([`src/client/3d/post_processing_pipeline.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/post_processing_pipeline.tsx)):
1. Pipeline sử dụng pass `Bloom` toàn cục (`@react-three/postprocessing`) với ngưỡng sáng rất cao: `bloomThreshold: 2.5`.
2. Lý do phải đặt ngưỡng 2.5: Nếu hạ ngưỡng xuống mức thông thường (0.6 - 1.0), toàn bộ các bề mặt sáng màu trên sa bàn (màu kem ngà của 40 ô đất `#EDE5D8`, chữ nhãn trắng, các đốm phản chiếu specular trên mặt nước) sẽ bị bùng sáng (blown-out bloom), biến bàn cờ thành một lớp sương mờ chói lóa và làm mất độ sắc nét của chữ số tài chính.
3. Hậu quả ngược lại: Các chi tiết thực sự cần phát sáng dịu mắt (như viền hào quang sự kiện thị trường `TileEventAuraRim`, vương miện độc quyền `MonopolyCrownCrest`, ngọc hải đăng và đèn sân vận động `CinematicLightingAccents`, đốm xúc xắc) có độ phát xạ vừa phải (`emissiveIntensity: 0.65 - 1.6`) hoàn toàn **không thể phát sáng** vì không vượt qua nổi ngưỡng 2.5. Nếu ép tăng `emissiveIntensity > 2.5`, màu sắc PBR của vật liệu sẽ bị cháy trắng bệch.

### 1.2. Giải Pháp Kỹ Thuật Chuẩn Mực (Selective Reference Bloom Architecture)
Kế thừa tinh hoa từ Heapscape (`reference-bloom.js`):
1. **Lớp Chiếu Sáng Riêng Biệt (`SELECTIVE_BLOOM_LAYER = 11`)**:
   - Chỉ định riêng Layer 11 trong Three.js (0..31) cho các đối tượng mỹ thuật được phép phát sáng.
   - Các bề mặt nền bàn cờ, chữ viết và sa bàn thuộc Layer 0 mặc định, hoàn toàn bị cô lập khỏi pass phát sáng (0% nguy cơ chói lóa).
2. **Module Quản Lý Đăng Ký Đối Tượng Thuần Túy (`selective_bloom_registry.ts`)**:
   - `tagSelectiveBloom(object: Object3D, enabled = true)`: Gán đệ quy Layer 11 và đánh dấu `userData.selectiveBloom = true`.
   - `untagSelectiveBloom(object: Object3D)`: Gỡ bỏ Layer 11 sạch sẽ, bảo vệ an toàn rò rỉ tài nguyên.
   - `isSelectiveBloomTagged(object: Object3D): boolean`: Kiểm tra trạng thái kích hoạt với optional chaining an toàn trước mock object.
   - `calculateSelectiveBloomThreshold(isAuctionActive, base, auction)`: Tính toán ngưỡng phát sáng tối ưu (0.45 ở lượt thường, 0.25 khi đấu giá), cho phép ánh sáng vàng hoàng kim phát ra ấm áp và điện ảnh.
   - `calculateSelectiveBloomIntensity(isMobile, isAuctionActive, base)`: Điều tiết cường độ phát sáng tối ưu hóa băng thông GPU (0.20 trên mobile, 0.45 trên desktop) với chốt chặn an toàn `Number.isFinite`.
3. **Tích Hợp Vào `PostProcessingPipeline` & Bảo Toàn Tương Thích Ngược 100%**:
   - Bổ sung prop tùy chọn `enableSelectiveBloom?: boolean` (mặc định `false` trong các bài test cũ để bảo vệ tuyệt đối 19/19 tests của IMP-241).
   - Khi `enableSelectiveBloom = true`, pipeline kích hoạt `<SelectiveBloom selectionLayer={11} ... />`.
   - Khi `enableSelectiveBloom = false`, pipeline duy trì `<Bloom ... />` toàn cục của IMP-241.
4. **Nối Thông Chuỗi Dữ Liệu Production Vào `game_canvas.tsx`**:
   - `game_canvas.tsx` truyền `enableSelectiveBloom={!isMobileDevice}` vào `PostProcessingPipeline`, kích hoạt tính năng phát quang chọn lọc trên desktop game thật và tắt trên mobile để bảo vệ GPU.
5. **Gắn Thẻ Phù Hiệu Sự Kiện Thực Tế (`TileEventAuraRim`)**:
   - `TileEventAuraRim` trong [`src/client/3d/tile_event_aura.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/tile_event_aura.tsx) tự động đăng ký Layer 11 khi mount bằng `React.useEffect`, tạo nên vòng hào quang vàng óng rực rỡ quanh các ô đất đang có sự kiện thị trường.

---

## 2. KIẾN TRÚC HỆ THỐNG & DÒNG DỮ LIỆU (VISUAL ARCHITECTURE)

```
[3D Scene Objects]
   ├── Normal Meshes (Tiles #EDE5D8, Text, Water) ──► Layer 0 (No Bloom Bleed)
   └── Emissive Accents (TileEventAuraRim, Crown)  ──► Layer 11 (tagSelectiveBloom)
                                                            │
                                                            ▼
                                               [PostProcessingPipeline]
                                                            │
                                           ┌────────────────┴────────────────┐
                                           │ enableSelectiveBloom = true     │ enableSelectiveBloom = false
                                           ▼                                 ▼
                                [<SelectiveBloom layer={11}>]        [<Bloom global>]
                                  Threshold: 0.45 (Warm Halo)          Threshold: 2.5 (Legacy)
                                           │                                 │
                                           └────────────────┬────────────────┘
                                                            ▼
                                              [ToneMapping Mode: AGX]
                                                            │
                                                            ▼
                                         [Cinematic Output: 0% Board Blowout]
```

### Cây Logic Triển Khai (Pre-Coding Logic Tree)
```
src/client/3d/selective_bloom_registry.ts (Tier 1 Pure Module)
├── Constants
│   ├── SELECTIVE_BLOOM_LAYER = 11
│   └── SELECTIVE_BLOOM_DEFAULTS (intensity: 0.45, threshold: 0.45, radius: 0.55, mobileIntensity: 0.20)
├── Pure Helpers & Tagging
│   ├── tagSelectiveBloom(object, enabled) [Recursive Three.js Layer Assignment]
│   ├── untagSelectiveBloom(object)
│   ├── isSelectiveBloomTagged(object) [Safe optional chaining]
│   ├── calculateSelectiveBloomThreshold(isAuctionActive, base, auction)
│   └── calculateSelectiveBloomIntensity(isMobile, isAuctionActive, base) [Finite guard]
│
├── Consumer 1: src/client/3d/post_processing_pipeline.tsx
│   ├── imports SelectiveBloom from @react-three/postprocessing
│   ├── imports SELECTIVE_BLOOM_LAYER and helpers from selective_bloom_registry
│   └── renders <SelectiveBloom> when enableSelectiveBloom = true
│
├── Consumer 2: src/client/3d/tile_event_aura.tsx
│   ├── imports tagSelectiveBloom, untagSelectiveBloom from selective_bloom_registry
│   └── TileEventAuraRim tags mesh with Layer 11 via React.useEffect for radiant highlight
│
└── Caller Root: src/client/game_canvas.tsx
    └── passes enableSelectiveBloom={!isMobileDevice} to PostProcessingPipeline
```

---

## 3. DANH MỤC THẤT BẠI TIỀM ẨN & CHIẾN LƯỢC PHÒNG VỆ (FAILURE MODES ENUMERATION)

| Mã | Nguy Cơ Thất Bại (Failure Mode) | Hậu Quả Tiềm Ẩn | Chiến Lược Phòng Vệ Kiến Trúc |
| :--- | :--- | :--- | :--- |
| **FM-1** | **Xung đột Layer Three.js (Layer Collision)**: Layer 11 vô tình trùng với Camera layer, Raycasting layer hoặc UI layer. | Đối tượng bị ẩn khỏi camera hoặc click raycast không trúng. | Camera chính luôn lắng nghe Layer 0 (mặc định) và Layer 11; `tagSelectiveBloom` dùng `object.layers.enable(11)` chứ không ghi đè `mask`, bảo toàn nguyên vẹn Layer 0 cho raycasting và render thông thường. |
| **FM-2** | **Rách vỡ tương thích ngược với IMP-241**: Đổi component `Bloom` sang `SelectiveBloom` làm trượt các bài test hiện có đang assert `c.type === Bloom`. | Gây hồi quy hàng loạt trên test suite `threejs_pipeline_hardening.test.ts`. | Sử dụng prop điều hướng `enableSelectiveBloom?: boolean`. Khi `false` (mặc định), giữ nguyên 100% component `<Bloom>` cũ. Chỉ kích hoạt `<SelectiveBloom>` khi prop được bật. |
| **FM-3** | **Quá tải băng thông GPU trên thiết bị di động (Mobile GPU Fillrate Saturation)**: Selective Bloom tính toán thêm FBO pass gây sụt giảm khung hình dưới 30 FPS. | Trải nghiệm giật lag trên điện thoại cấu hình yếu. | Áp dụng cơ chế thích ứng: trên mobile, `mipmapBlur = false`, cường độ hạ xuống `0.20` và tắt pass trên mobile thông qua `enableSelectiveBloom={!isMobileDevice}` tại `game_canvas.tsx`. |
| **FM-4** | **Rò rỉ bộ nhớ khi unmount đối tượng phát sáng (Resource Leak)**: Mesh được tag nhưng khi unmount không được dọn dẹp layer. | Rò rỉ tham chiếu Three.js trong scene graph. | `TileEventAuraRim` sử dụng `React.useEffect` với cleanup function gọi `untagSelectiveBloom(mesh)` khi unmount, bảo đảm 100% giải phóng tài nguyên. |
| **FM-5** | **Crash môi trường Headless SSR / Vitest Node**: `SelectiveBloom` hoặc `postprocessing` effect nạp WebGL context ảo trong Node. | Test suite kiểm thử headless bị crash môi trường. | Các hàm toán học và hàm gắn layer trong `selective_bloom_registry.ts` hoàn toàn tương thích với đối tượng giả lập Three.js (`Object3D`), không yêu cầu WebGL canvas context khi test unit. |

---

## 4. BẢNG ĐO LƯỜNG NGÂN SÁCH LOC (PILLAR 1 & PILLAR 2)

Đo lường cơ học vật lý hiện tại bằng `scripts/check_loc.mjs`:

| Tệp vật lý | Phân loại Tier | LOC Hiện Tại | Dự Kiến Thêm | Dự Kiến Bớt | LOC Sau Thay Đổi | Ngưỡng Tối Đa | Trạng Thái & Khóa An Toàn |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/selective_bloom_registry.ts` | Tier 1 (Pure Module) | **0** (Mới) | +145 | -0 | **~145** | <= 400 | ✔️ Safe (Mới) |
| `src/client/3d/post_processing_pipeline.tsx` | Tier 2 (3D Views) | **326** | +32 | -2 | **356** | <= 500 | ✔️ Safe |
| `src/client/3d/tile_event_aura.tsx` | Tier 2 (3D Views) | **192** | +15 | -2 | **205** | <= 500 | ✔️ Safe |
| `src/client/game_canvas.tsx` | Tier 2 (3D Views) | **475** | +1 | -0 | **476** | <= 500 | ⚠️ Warning (< 480 không bắt buộc bóc tách trước) |
| `tests/contracts/imp256_selective_bloom_pipeline.test.ts` | Test Suite (Mới) | **0** | +240 | -0 | **~240** | <= 600 | ✔️ Safe (Mới) |

*Ghi nhận Sổ Nợ Kỹ Thuật (Tech Debt Ledger Item theo GEMINI.md)*:
- **`DEBT-GAME-CANVAS-PARTITION`**: `src/client/game_canvas.tsx` đang ở mức 476 LOC (thuộc vùng cảnh báo 400..500 LOC). Khi tệp vượt quá 480 LOC, nhiệm vụ kỹ thuật tiếp theo bắt buộc bóc tách phần camera và overlay thành các sub-components độc lập.

---

## 5. STATION 1: BỘ KIỂM THỬ HỢP ĐỒNG (QA TEST SPECIFICATIONS)

> **Target physical file**: `tests/contracts/imp256_selective_bloom_pipeline.test.ts` (new file to be created in Station 1)  
> Yêu cầu: 16 atomic tests trải dài qua 5 Facets, 100% tuân thủ Adversarial Inversion (RED trên mã nguồn hiện tại).

### Facet 1: Selective Bloom Registry & Object Tagging (TC-IMP256.01..04)
- [UC-IMP256/MSS] TC-IMP256.01: tagSelectiveBloom kích hoạt SELECTIVE_BLOOM_LAYER (layer 11) trên mesh mục tiêu và đánh dấu userData.selectiveBloom = true. (RED: selective_bloom_registry.ts chưa tồn tại).
- [UC-IMP256/MSS] TC-IMP256.02: tagSelectiveBloom duyệt đệ quy cây con của Group hoặc Object3D phức hợp để kích hoạt layer 11 cho toàn bộ mesh con. (RED: selective_bloom_registry.ts chưa tồn tại).
- [UC-IMP256/MSS] TC-IMP256.03: untagSelectiveBloom vô hiệu hóa layer 11 và xóa cờ userData.selectiveBloom mà không ảnh hưởng tới layer 0 mặc định của đối tượng. (RED: selective_bloom_registry.ts chưa tồn tại).
- [UC-IMP256/A1] TC-IMP256.04: isSelectiveBloomTagged trả về true khi đối tượng đang bật layer 11 và false khi đối tượng ở layer mặc định hoặc object không có layer. (RED: selective_bloom_registry.ts chưa tồn tại).

### Facet 2: Dynamic Selective Bloom Math & Thresholds (TC-IMP256.05..07)
- [UC-IMP256/MSS] TC-IMP256.05: calculateSelectiveBloomThreshold trả về ngưỡng thấp dịu mắt (0.45 ở lượt thường, 0.25 khi đấu giá) cho phép màu vàng PBR phát sáng mà không cần tăng phát xạ cực đoan. (RED: selective_bloom_registry.ts chưa tồn tại).
- [UC-IMP256/MSS] TC-IMP256.06: calculateSelectiveBloomIntensity điều tiết cường độ tối ưu (0.20 trên mobile so với 0.45 trên desktop) để tiết kiệm băng thông GPU. (RED: selective_bloom_registry.ts chưa tồn tại).
- [UC-IMP256/A2] TC-IMP256.07: calculateSelectiveBloomThreshold và calculateSelectiveBloomIntensity tự động hồi quy an toàn về giá trị mặc định chuẩn khi nhận tham số không hợp lệ (NaN, Infinity). (RED: selective_bloom_registry.ts chưa tồn tại).

### Facet 3: Pipeline Pass Integration & Selective Switching (TC-IMP256.08..11)
- [UC-IMP256/MSS] TC-IMP256.08: Khi enableSelectiveBloom = true, PostProcessingPipeline kết xuất component SelectiveBloom hướng tới selectionLayer = 11. (RED: PostProcessingPipeline chưa hỗ trợ enableSelectiveBloom).
- [UC-IMP256/MSS] TC-IMP256.09: Khi enableSelectiveBloom = false hoặc undefined, PostProcessingPipeline tiếp tục kết xuất component Bloom toàn cục chuẩn, bảo toàn 100% hợp đồng IMP-241. (RED: PostProcessingPipeline chưa hỗ trợ prop enableSelectiveBloom).
- [UC-IMP256/MSS] TC-IMP256.10: SelectiveBloom đứng ở vị trí HDR bloom chuẩn xác trước ToneMapping và sau DepthOfField trong EffectComposer. (RED: SelectiveBloom chưa được tích hợp).
- [UC-IMP256/A3] TC-IMP256.11: Khi enabled = false hoặc enableBloom = false, SelectiveBloom bị loại bỏ hoàn toàn khỏi render tree. (RED: Tính năng chưa được tích hợp).

### Facet 4: Depth Occlusion & Anti-Blowout Isolation (TC-IMP256.12..14)
- [UC-IMP256/MSS] TC-IMP256.12: SELECTIVE_BLOOM_LAYER được định nghĩa cố định ở giá trị 11, không xung đột với layer 0 mặc định của bề mặt bàn cờ. (RED: selective_bloom_registry.ts chưa tồn tại).
- [UC-IMP256/MSS] TC-IMP256.13: SelectiveBloom áp dụng mipmapBlur = true trên desktop và mipmapBlur = false trên mobile. (RED: SelectiveBloom chưa được cấu hình).
- [UC-IMP256/A4] TC-IMP256.14: SelectiveBloom tiếp nhận tham số intensity thích ứng chính xác theo môi trường thiết bị và trạng thái đấu giá. (RED: SelectiveBloom chưa được tích hợp).

### Facet 5: Component Tagging & Teardown Lifecycle (TC-IMP256.15..16)
- [UC-IMP256/MSS] TC-IMP256.15: TileEventAuraRim gắn ref và gọi tagSelectiveBloom qua React.useEffect để đưa vòng hào quang sự kiện vào Layer 11 phát sáng. (RED: TileEventAuraRim chưa tích hợp tagSelectiveBloom).
- [UC-IMP256/A5] TC-IMP256.16: TileEventAuraRim dọn dẹp sạch sẽ layer 11 thông qua cleanup function khi unmount, ngăn ngừa rò rỉ bộ nhớ. (RED: TileEventAuraRim chưa tích hợp cơ chế dọn dẹp layer).

---

## 6. CHI TIẾT CÁC ĐOẠN MÃ THAY THẾ (CONCRETE DROP-IN SNIPPETS)

### Task 1: Tạo mới module `src/client/3d/selective_bloom_registry.ts`
**Target physical file**: `src/client/3d/selective_bloom_registry.ts` (new file to be created in Station 1/2)

```typescript
// [IMP-256] Selective Bloom Registry & Object Tagging Engine
// Manages Three.js layers and selective post-processing isolation for emissive visual accents.

import type { Object3D } from 'three';

/**
 * Three.js Layer 11 dành riêng cho các thành phần phát sáng có chọn lọc (Selective Bloom).
 * Cách ly hoàn toàn khỏi Layer 0 mặc định của mặt bàn cờ và văn bản, triệt tiêu 100% hiện tượng chói lóa.
 */
export const SELECTIVE_BLOOM_LAYER = 11 as const;

export const SELECTIVE_BLOOM_DEFAULTS = {
  layer: SELECTIVE_BLOOM_LAYER,
  intensity: 0.45,
  mobileIntensity: 0.20,
  auctionIntensity: 0.65,
  luminanceThreshold: 0.45,
  auctionThreshold: 0.25,
  luminanceSmoothing: 0.30,
  radius: 0.55,
} as const;

/**
 * Gắn cờ và kích hoạt Layer 11 cho đối tượng 3D (duyệt đệ quy toàn bộ cây con).
 */
export function tagSelectiveBloom(object: Object3D | null | undefined, enabled = true): void {
  if (!object) return;
  object.traverse((child) => {
    if (enabled) {
      child.layers?.enable?.(SELECTIVE_BLOOM_LAYER);
      child.userData.selectiveBloom = true;
    } else {
      child.layers?.disable?.(SELECTIVE_BLOOM_LAYER);
      delete child.userData.selectiveBloom;
    }
  });
}

/**
 * Hủy kích hoạt Layer 11 cho đối tượng 3D.
 */
export function untagSelectiveBloom(object: Object3D | null | undefined): void {
  tagSelectiveBloom(object, false);
}

/**
 * Kiểm tra xem đối tượng có đang được gán Layer 11 phát sáng chọn lọc hay không.
 * Phòng vệ an toàn với optional chaining trước các đối tượng mock test thiếu thuộc tính layers.
 */
export function isSelectiveBloomTagged(object: Object3D | null | undefined): boolean {
  if (!object) return false;
  return Boolean(object.layers?.isEnabled?.(SELECTIVE_BLOOM_LAYER) || object.userData?.selectiveBloom);
}

/**
 * Tính toán ngưỡng sáng động cho Selective Bloom (pure function).
 * Cho phép màu vàng hoàng kim và hào quang sự kiện phát sáng ở mức phơi sáng tự nhiên mà không cần tăng emissive cực đoan.
 */
export function calculateSelectiveBloomThreshold(
  isAuctionActive: boolean,
  baseThreshold: number = SELECTIVE_BLOOM_DEFAULTS.luminanceThreshold,
  auctionThreshold: number = SELECTIVE_BLOOM_DEFAULTS.auctionThreshold
): number {
  if (!Number.isFinite(baseThreshold) || !Number.isFinite(auctionThreshold)) {
    return SELECTIVE_BLOOM_DEFAULTS.luminanceThreshold;
  }
  return isAuctionActive ? auctionThreshold : baseThreshold;
}

/**
 * Tính toán cường độ phát quang chọn lọc thích ứng theo nền tảng và trạng thái game.
 * Chốt chặn nghiêm ngặt Number.isFinite chống lọt NaN vào Three.js shader uniform.
 */
export function calculateSelectiveBloomIntensity(
  isMobile: boolean,
  isAuctionActive: boolean,
  baseIntensity: number = SELECTIVE_BLOOM_DEFAULTS.intensity
): number {
  if (!Number.isFinite(baseIntensity)) {
    return SELECTIVE_BLOOM_DEFAULTS.intensity;
  }
  if (isMobile) {
    return SELECTIVE_BLOOM_DEFAULTS.mobileIntensity;
  }
  return isAuctionActive ? SELECTIVE_BLOOM_DEFAULTS.auctionIntensity : baseIntensity;
}
```

---

### Task 2: Tích hợp `SelectiveBloom` vào `src/client/3d/post_processing_pipeline.tsx`
**Target physical file**: `src/client/3d/post_processing_pipeline.tsx`

```typescript
<<<<
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  N8AO,
  Vignette,
  ToneMapping,
  SMAA,
} from '@react-three/postprocessing';
====
import {
  EffectComposer,
  Bloom,
  SelectiveBloom,
  DepthOfField,
  N8AO,
  Vignette,
  ToneMapping,
  SMAA,
} from '@react-three/postprocessing';
import {
  SELECTIVE_BLOOM_LAYER,
  SELECTIVE_BLOOM_DEFAULTS,
  calculateSelectiveBloomThreshold,
  calculateSelectiveBloomIntensity,
} from './selective_bloom_registry';
>>>>
```

```typescript
<<<<
  bloomIntensity?: number;
  bloomThreshold?: number;
  vignetteDarkness?: number;
====
  bloomIntensity?: number;
  bloomThreshold?: number;
  enableSelectiveBloom?: boolean;
  selectiveBloomIntensity?: number;
  selectiveBloomThreshold?: number;
  vignetteDarkness?: number;
>>>>
```

```typescript
<<<<
  bloomSmoothing: 0.25,
  bloomRadius: 0.65,
  aoIntensity: 0.38,
====
  bloomSmoothing: 0.25,
  bloomRadius: 0.65,
  enableSelectiveBloom: false,
  selectiveBloomIntensity: SELECTIVE_BLOOM_DEFAULTS.intensity,
  selectiveBloomThreshold: SELECTIVE_BLOOM_DEFAULTS.luminanceThreshold,
  aoIntensity: 0.38,
>>>>
```

```typescript
<<<<
  bloomIntensity = DEFAULT_PIPELINE_CONFIG.bloomIntensity,
  bloomThreshold: propBloomThreshold,
  vignetteDarkness: propVignetteDarkness,
====
  bloomIntensity = DEFAULT_PIPELINE_CONFIG.bloomIntensity,
  bloomThreshold: propBloomThreshold,
  enableSelectiveBloom = DEFAULT_PIPELINE_CONFIG.enableSelectiveBloom,
  selectiveBloomIntensity: propSelectiveBloomIntensity,
  selectiveBloomThreshold: propSelectiveBloomThreshold,
  vignetteDarkness: propVignetteDarkness,
>>>>
```

```typescript
<<<<
      {/* 3. Bloom (HDR): Ánh kim vàng champagne trên dải HDR trước khi nén tone mapping */}
      {resolvedEnableBloom && (
        <Bloom
          luminanceThreshold={resolvedBloomThreshold}
          luminanceSmoothing={DEFAULT_PIPELINE_CONFIG.bloomSmoothing}
          intensity={isMobile ? 0.12 : (isAuctionActive ? 0.30 : bloomIntensity)}
          mipmapBlur={!isMobile}
          radius={DEFAULT_PIPELINE_CONFIG.bloomRadius}
        />
      )}
====
      {/* 3. Bloom (HDR) / Selective Reference Bloom:
          Khi enableSelectiveBloom = true: chỉ phát ánh hào quang cho các mesh được gán lớp selectiveBloomLayer (IMP-256).
          Khi enableSelectiveBloom = false: duy trì Bloom toàn cục tương thích ngược 100% với IMP-241. */}
      {resolvedEnableBloom && (
        enableSelectiveBloom ? (
          <SelectiveBloom
            selectionLayer={SELECTIVE_BLOOM_LAYER}
            luminanceThreshold={
              propSelectiveBloomThreshold !== undefined
                ? propSelectiveBloomThreshold
                : calculateSelectiveBloomThreshold(Boolean(isAuctionActive))
            }
            luminanceSmoothing={DEFAULT_PIPELINE_CONFIG.bloomSmoothing}
            intensity={
              propSelectiveBloomIntensity !== undefined
                ? propSelectiveBloomIntensity
                : calculateSelectiveBloomIntensity(Boolean(isMobile), Boolean(isAuctionActive))
            }
            mipmapBlur={!isMobile}
            radius={DEFAULT_PIPELINE_CONFIG.bloomRadius}
          />
        ) : (
          <Bloom
            luminanceThreshold={resolvedBloomThreshold}
            luminanceSmoothing={DEFAULT_PIPELINE_CONFIG.bloomSmoothing}
            intensity={isMobile ? 0.12 : (isAuctionActive ? 0.30 : bloomIntensity)}
            mipmapBlur={!isMobile}
            radius={DEFAULT_PIPELINE_CONFIG.bloomRadius}
          />
        )
      )}
>>>>
```

---

### Task 3: Gắn thẻ phát quang Layer 11 cho `TileEventAuraRim`
**Target physical file**: `src/client/3d/tile_event_aura.tsx`

```typescript
<<<<
import React from 'react';
import { Billboard, Html } from '@react-three/drei';
import { deriveModifierVisual } from '../domain_visual_bridge.js';
====
import React from 'react';
import { Billboard, Html } from '@react-three/drei';
import type { Mesh } from 'three';
import { deriveModifierVisual } from '../domain_visual_bridge.js';
import { tagSelectiveBloom, untagSelectiveBloom } from './selective_bloom_registry.js';
>>>>
```

```typescript
<<<<
export function TileEventAuraRim({
  color = '#F59E0B',
  isSpotlighted = false,
}: TileEventAuraRimProps): React.ReactElement {
  return (
    <mesh
      name="TileEventAuraRim"
      data-testid="tile-event-aura-rim"
      position={[0, 0.042, 0]}
      castShadow={false}
      receiveShadow={true}
    >
====
export function TileEventAuraRim({
  color = '#F59E0B',
  isSpotlighted = false,
}: TileEventAuraRimProps): React.ReactElement {
  const meshRef = React.useRef<Mesh>(null);

  React.useEffect(() => {
    const mesh = meshRef.current;
    if (mesh) {
      tagSelectiveBloom(mesh, true);
    }
    return () => {
      if (mesh) {
        untagSelectiveBloom(mesh);
      }
    };
  }, []);

  return (
    <mesh
      ref={meshRef}
      name="TileEventAuraRim"
      data-testid="tile-event-aura-rim"
      position={[0, 0.042, 0]}
      castShadow={false}
      receiveShadow={true}
    >
>>>>
```

---

### Task 4: Nối thông `enableSelectiveBloom` tại `src/client/game_canvas.tsx`
**Target physical file**: `src/client/game_canvas.tsx`

```typescript
<<<<
                {/* <PostProcessingPipeline /> */}
                <PostProcessingPipeline
                  isMobile={isMobileDevice}
                  enabled={!isMobileDevice}
                  isAuctionActive={isAuctionActive}
                  enableDof={dofConfig.enableDof}
                  dofBokehScale={dofConfig.bokehScale}
                  dofFocusRange={dofConfig.focusRange}
                  dofTarget={dofTarget}
                />
====
                {/* <PostProcessingPipeline /> */}
                <PostProcessingPipeline
                  isMobile={isMobileDevice}
                  enabled={!isMobileDevice}
                  enableSelectiveBloom={!isMobileDevice}
                  isAuctionActive={isAuctionActive}
                  enableDof={dofConfig.enableDof}
                  dofBokehScale={dofConfig.bokehScale}
                  dofFocusRange={dofConfig.focusRange}
                  dofTarget={dofTarget}
                />
>>>>
```

---

## 7. QUY TRÌNH KIỂM CHỨNG & BẰNG CHỨNG (VERIFICATION & DOD MATRIX)

### 7.1. Tiêu Chuẩn Hoàn Thành (Definition of Done)
1. **Adversarial Inversion**: Toàn bộ 16 tests tại `tests/contracts/imp256_selective_bloom_pipeline.test.ts` ban đầu RED và chuyển sang 100% GREEN sau khi cài đặt Task 1-4.
2. **Không Hồi Quy (Zero Regression)**: Toàn bộ 19/19 tests trong `tests/contracts/threejs_pipeline_hardening.test.ts` cùng các test suite `imp105`, `imp77`, `imp80`, `audit_network_webgl_resilience` giữ vững 100% GREEN.
3. **Bằng Chứng Thị Giác Phase 3.0 (Gotcha #29)**: Chạy `npm run capture:visual -- --ticket IMP-256` thu thập bằng chứng kép (Dual-Viewport Parity: Desktop 1280x800 & Mobile 360x740) vào `.agents/tmp/`. Xác minh trực quan qua `view_file` vòng hào quang `TileEventAuraRim` màu vàng hoàng kim sáng rõ mà không làm chói lóa bề mặt gạch `#EDE5D8`.
4. **Ngân Sách LOC & Anti-Slop**:
   - `src/client/3d/selective_bloom_registry.ts`: ~145 LOC <= 400 LOC (Tier 1 Safe).
   - `src/client/3d/post_processing_pipeline.tsx`: ~356 LOC <= 500 LOC (Tier 2 Safe).
   - `src/client/3d/tile_event_aura.tsx`: ~205 LOC <= 500 LOC (Tier 2 Safe).
   - `src/client/game_canvas.tsx`: 476 LOC <= 500 LOC (Tier 2 Warning, Delta = +1).
   - `npm run lint:slop` vượt qua với 0 vi phạm.
5. **Không Dirty Casts**: 0 trường hợp `as any` hoặc `as unknown as`.
