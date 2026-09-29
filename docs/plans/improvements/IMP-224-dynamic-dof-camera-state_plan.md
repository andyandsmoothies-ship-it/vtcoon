# KẾ HOẠCH TRIỂN KHAI [HARDENED v3]: DYNAMIC DEPTH OF FIELD — Tilt-Shift Macro Điện Ảnh Theo Camera State (IMP-224)

> **Phiên bản**: v3 (Final Hardened Plan)  
> **Mục tiêu**: Kích hoạt Depth of Field (DoF) có điều kiện theo trạng thái camera — overview nét căng 100% (bảo toàn Gotcha #54), tile_focus hậu cảnh mờ nhẹ sa bàn Townscaper với focal target bám đúng ô cờ mục tiêu, auction_focus điện ảnh bục đấu giá Sotheby's.  
> **Tiêu chuẩn**: GEMINI.md Harness, TDD Detroit Style, Universal 5-Facet Matrix (16 atomic tests), Zero `as any` trong production logic, Deep Modules.  

---

## BIÊN BẢN XỬ LÝ TOÀN BỘ CÁC ĐIỂM PHẢN BIỆN TỪ AUDIT

| ID | Điểm phản biện | Phán quyết | Xử lý trong Revision v3 |
|:---|:---|:---:|:---|
| **P1-1** | `GameCanvasInGame` không tồn tại; selectors nằm trong `AdaptiveCinematicCamera`, không thể truyền ra `GameCanvas` | ✅ Đã xử lý | Dời selectors và tính toán DoF lên `GameCanvas` (L344 block) — nơi `<PostProcessingPipeline />` được render |
| **P1-2** | Snippet 2 v1 xóa `isAuctionActive={isAuctionActive}` — phá hủy hiệu ứng ánh sáng đấu giá IMP-223 | ✅ Đã xử lý | Bảo toàn 100% prop `isAuctionActive={isAuctionActive}` trên `<PostProcessingPipeline />` |
| **P1-3** | `dofTarget=[0,0,0]` cố định gây lệch mặt phẳng nét 7.63m — ô đất bị mờ trước khoảng đất trống | ✅ Đã xử lý | Tính `dofTarget` động qua hàm `resolveDofTarget`: bám theo `cellPosition(targetCell)` khi focus ô cờ hoặc `[0, 3.0, 0]` khi đấu giá |
| **P1-4** | `focusRange=55m` rộng gấp đôi bàn cờ 18m làm toàn bộ cảnh nét, DoF bị vô hiệu | ✅ Đã xử lý | Chuẩn hóa dải nét: `tile_focus: 9.0m` (bokehScale: 0.28), `auction_focus: 6.0m` (bokehScale: 0.45) — hậu cảnh thực sự mờ |
| **P1-5** | `resolveDofTarget` bị bỏ quên export trong Snippet 1, biến thành inline IIFE trong `game_canvas.tsx` làm gãy test Station 1 | ✅ Đã xử lý | Khai báo và export `resolveDofTarget` tập trung trong `post_processing_pipeline.tsx` |
| **P1-6** | `activeModal !== null` đánh giá `true` khi `activeModal` là `undefined` làm fail test `[TC-224.12]` | ✅ Đã xử lý | Áp dụng guard an toàn: `Boolean(params.activeModal) && params.activeModal !== 'game_over'` |
| **P1-7** | Sửa dòng import L19 của `game_canvas.tsx` làm gãy test tĩnh hiện hữu `post_processing_pipeline.test.ts#L84` | ✅ Đã xử lý | Giữ nguyên dòng 19, thêm dòng import thứ hai cho `calculateDofConfig, resolveDofTarget` |
| **P1-8** | Ép kiểu `as { cellIndex?: number }` vi phạm Zero Dirty Cast | ✅ Đã xử lý | `resolveDofTarget` nhận `modalPayload?: unknown` và type guard an toàn qua `typeof payloadCell === 'number'` |

---

## 1. SƠ ĐỒ KIẾN TRÚC & DÒNG CHẢY DỮ LIỆU

```
[GameStore]
  activeModal (L359 — đã có)
  isRolling (subscribe mới tại GameCanvas L360)
  activePawnAnimation?.isAnimating (subscribe mới L361)
  cameraFocusCell (subscribe mới L362)
  modalPayload (subscribe mới L363 — kiểu unknown an toàn)
         │
[GameCanvas — component cấp cao render Canvas, L344]
         │
  calculateDofConfig({ activeModal, cameraFocusCell, isRolling, isPawnAnimating })
         │
  resolveDofTarget({ activeModal, cameraFocusCell, modalPayload })
         │
  { enableDof, bokehScale, focusRange, dofTarget }
         │
[PostProcessingPipeline — L439 inGame branch]
  enableDof={dofConfig.enableDof}
  dofBokehScale={dofConfig.bokehScale}
  dofFocusRange={dofConfig.focusRange}
  dofTarget={dofTarget}
  isAuctionActive={isAuctionActive}   ← BẢO TOÀN TỪ IMP-223
         │
[DepthOfField @react-three/postprocessing]
  target={targetVector}  ← [tx, 0, tz] bám theo ô cờ hoặc [0, 3, 0] bục đấu giá
  focusRange=9m / 6m     ← Dải nét chuẩn sa bàn — hậu cảnh mờ thực sự
  bokehScale=0.28 / 0.45
```

---

## 2. LOGIC ĐIỀU PHỐI DoF (DYNAMIC DoF MATRIX)

| Profile | Điều kiện ưu tiên | `enableDof` | `bokehScale` | `focusRange` | `dofTarget` | Trải nghiệm thị giác |
|:---|:---|:---:|:---:|:---:|:---|:---|
| **`off`** | `isPawnAnimating === true` | `false` | 0.00 | 320.0m | `[0, 0, 0]` | Giữ nét chuyển động quân cờ |
| **`off`** | `isRolling === true` | `false` | 0.00 | 320.0m | `[0, 0, 0]` | Giữ nét sàn diễn xúc xắc |
| **`auction`** | `activeModal === 'auction'` | `true` | **0.45** | **6.0m** | `[0, 3.0, 0]` | **Chuẩn Sotheby's**: Thẻ bài nét rực rỡ, bàn cờ xa mờ điện ảnh |
| **`tile`** | `activeModal` khác null & không phải `game_over` | `true` | **0.28** | **9.0m** | `cellPosition(modalPayload.cellIndex)` | **Chuẩn Townscaper**: Ô đất và nhà C1-C3 nét, hậu cảnh mờ nhẹ |
| **`tile`** | `cameraFocusCell !== null` | `true` | **0.28** | **9.0m** | `cellPosition(cameraFocusCell)` | **Chuẩn Townscaper**: Tiêu cự bám đúng ô đất đang khảo sát |
| **`off`** | Mọi trường hợp còn lại (overview/pre-match) | `false` | 0.00 | 320.0m | `[0, 0, 0]` | **Bảo toàn Gotcha #54**: 40 ô cờ nét căng 100% |

---

## 3. ĐO LƯỜNG NGÂN SÁCH LOC (CHÍNH XÁC 100% ĐĨA CỨNG)

| Tệp Vật Lý | Tier Phân Loại | LOC Hiện Tại | Delta Thực Tế | LOC Dự Kiến Sau Cùng | Đánh Giá |
|:---|:---:|:---:|:---:|:---:|:---|
| `src/client/3d/post_processing_pipeline.tsx` | Tier 2 (UI/3D/Views) | **201** | +45 | **246** | ✔️ An toàn (Trần $\le 500$ LOC) |
| `src/client/game_canvas.tsx` | Tier 2 (UI/3D/Views) | **453** | +11 | **464** | ✔️ An toàn (Trần $\le 500$ LOC) |
| `tests/client/dynamic_dof.test.ts` | Test Suite | 0 | +195 | **195** | ✔️ An toàn (Trần $\le 600$ LOC) |

---

## 4. MA TRẬN KIỂM THỬ HỢP ĐỒNG 5 MẶT (16 ATOMIC TESTS — STATION 1)

**Tệp kiểm thử**: [`tests/client/dynamic_dof.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/dynamic_dof.test.ts)

### Facet 1: Overview & Motion — DoF Bắt Buộc Tắt ([TC-224.01] - [TC-224.04])
- `[TC-224.01/MSS][UC-IMP224]` Tất cả params null/false → `{ enableDof: false, bokehScale: 0.0 }`.
- `[TC-224.02/MSS][UC-IMP224]` `isRolling = true` (bất kể modal hay cell) → `enableDof: false`.
- `[TC-224.03/MSS][UC-IMP224]` `isPawnAnimating = true` → `enableDof: false`.
- `[TC-224.04/MSS][UC-IMP224]` `activeModal = null` + `cameraFocusCell = null` → `enableDof: false` (bảo toàn Gotcha #54 Overview Legibility).

### Facet 2: Tile Focus — DoF Nhẹ & Tiêu Cự Bám Ô Cờ ([TC-224.05] - [TC-224.08])
- `[TC-224.05/MSS][UC-IMP224]` `cameraFocusCell = 15` → `{ enableDof: true, bokehScale: 0.28, focusRange: 9.0 }`.
- `[TC-224.06/MSS][UC-IMP224]` `activeModal = 'deed'` → `enableDof: true, bokehScale: 0.28`.
- `[TC-224.07/MSS][UC-IMP224]` `resolveDofTarget({ cameraFocusCell: 10 })` trả về tọa độ `cellPosition(10)`, không phải `[0, 0, 0]`.
- `[TC-224.08/MSS][UC-IMP224]` `activeModal = 'portfolio'` → `{ enableDof: true, bokehScale: 0.28, focusRange: 9.0 }`.

### Facet 3: Auction Focus — DoF Vừa & Bục Đấu Giá Trung Tâm ([TC-224.09] - [TC-224.11])
- `[TC-224.09/MSS][UC-IMP224]` `activeModal = 'auction'` → `{ enableDof: true, bokehScale: 0.45, focusRange: 6.0 }`.
- `[TC-224.10/MSS][UC-IMP224]` `resolveDofTarget({ activeModal: 'auction' })` trả về `[0, 3.0, 0]` (`CAMERA_CONFIG.auction_focus.target`).
- `[TC-224.11/MSS][UC-IMP224]` So sánh tương đối: `DOF_PROFILES.auction.bokehScale (0.45) > DOF_PROFILES.tile.bokehScale (0.28)` và `DOF_PROFILES.auction.focusRange (6.0) < DOF_PROFILES.tile.focusRange (9.0)`.

### Facet 4: Defensive Guards & Pure Function Contracts ([TC-224.12] - [TC-224.14])
- `[TC-224.12/MSS][UC-IMP224]` Gọi `calculateDofConfig` và `resolveDofTarget` với params undefined/empty → trả về `DOF_PROFILES.off` và `[0, 0, 0]` an toàn, không ném ngoại lệ.
- `[TC-224.13/MSS][UC-IMP224]` Tính thuần túy (Pure Function): Cùng tham số đầu vào luôn sinh cùng kết quả đầu ra (Referential Transparency).
- `[TC-224.14/MSS][UC-IMP224]` Giá trị `bokehScale` đầu ra luôn nằm trong khoảng hợp lệ `[0.0, 1.0]` với mọi kiểu modal.

### Facet 5: Backward Compatibility & Regression Immunity ([TC-224.15] - [TC-224.16])
- `[TC-224.15/MSS][UC-IMP224]` Không truyền `enableDof` → mặc định `false` (bảo toàn IMP-38.1).
- `[TC-224.16/MSS][UC-IMP224]` `PostProcessingPipeline({ enabled: false })` trả về `null` (bảo toàn hành vi tắt pipeline trên mobile).

---

## 5. ĐOẠN MÃ THAY THẾ CHÍNH XÁC (EXACT DROP-IN SNIPPETS — v3)

### Snippet 1: `src/client/3d/post_processing_pipeline.tsx`

1. Thêm import vào đầu tệp (sau L15):
```tsx
import { CAMERA_CONFIG } from './camera_state_machine';
import { cellPosition } from './board_coords';
```

2. Thêm types và 2 pure functions sau `DEFAULT_PIPELINE_CONFIG` (sau L66):
```tsx
export interface DofConfigParams {
  readonly activeModal?: string | null;
  readonly cameraFocusCell?: number | null;
  readonly isRolling?: boolean;
  readonly isPawnAnimating?: boolean;
}

export interface DofConfig {
  readonly enableDof: boolean;
  readonly bokehScale: number;
  readonly focusRange: number;
}

export interface DofTargetParams {
  readonly activeModal?: string | null;
  readonly cameraFocusCell?: number | null;
  readonly modalPayload?: unknown;
}

export const DOF_PROFILES = {
  off:     { enableDof: false, bokehScale: 0.00, focusRange: 320.0 },
  tile:    { enableDof: true,  bokehScale: 0.28, focusRange: 9.0   },
  auction: { enableDof: true,  bokehScale: 0.45, focusRange: 6.0   },
} as const satisfies Record<string, DofConfig>;

/**
 * Tính cấu hình DoF theo trạng thái game (pure function).
 * Thứ tự ưu tiên: motion/rolling (OFF) > auction > tile > overview (OFF).
 */
export function calculateDofConfig(params?: DofConfigParams): DofConfig {
  if (!params || params.isPawnAnimating || params.isRolling) return DOF_PROFILES.off;
  if (params.activeModal === 'auction') return DOF_PROFILES.auction;
  if (Boolean(params.activeModal) && params.activeModal !== 'game_over') return DOF_PROFILES.tile;
  if (params.cameraFocusCell !== null && params.cameraFocusCell !== undefined && Number.isFinite(params.cameraFocusCell)) {
    return DOF_PROFILES.tile;
  }
  return DOF_PROFILES.off;
}

/**
 * Tính tọa độ focal target quang học chuẩn xác (pure function).
 * Ưu tiên: auction target [0, 3, 0] > modalPayload.cellIndex > cameraFocusCell > [0, 0, 0].
 */
export function resolveDofTarget(params?: DofTargetParams): [number, number, number] {
  if (!params) return [0, 0, 0];
  if (params.activeModal === 'auction') {
    const t = CAMERA_CONFIG.auction_focus.target;
    return [t[0], t[1], t[2]];
  }

  const payloadCell =
    params.modalPayload && typeof params.modalPayload === 'object' && 'cellIndex' in params.modalPayload
      ? (params.modalPayload as { cellIndex?: unknown }).cellIndex
      : undefined;

  const targetCell =
    typeof payloadCell === 'number' && Number.isFinite(payloadCell)
      ? payloadCell
      : params.cameraFocusCell;

  if (targetCell !== null && targetCell !== undefined && Number.isFinite(targetCell)) {
    return cellPosition(targetCell);
  }
  return [0, 0, 0];
}
```

3. Cập nhật destructuring `PostProcessingPipeline` để nhận `dofBokehScale`:
```tsx
export function PostProcessingPipeline({
  enabled = DEFAULT_PIPELINE_CONFIG.enabled,
  isAuctionActive = false,
  enableDof = DEFAULT_PIPELINE_CONFIG.enableDof,
  enableBloom = DEFAULT_PIPELINE_CONFIG.enableBloom,
  enableAo = DEFAULT_PIPELINE_CONFIG.enableAo,
  isMobile = false,
  disableAoOnMobile = false,
  enableVignette = DEFAULT_PIPELINE_CONFIG.enableVignette,
  enableToneMapping = DEFAULT_PIPELINE_CONFIG.enableToneMapping,
  enableSmaa = DEFAULT_PIPELINE_CONFIG.enableSmaa,
  multisampling = DEFAULT_PIPELINE_CONFIG.multisampling,
  dofTarget = DEFAULT_PIPELINE_CONFIG.dofTarget,
  dofFocusRange = DEFAULT_PIPELINE_CONFIG.dofFocusRange,
  dofBokehScale: propDofBokehScale,
  bloomIntensity = DEFAULT_PIPELINE_CONFIG.bloomIntensity,
  bloomThreshold: propBloomThreshold,
  vignetteDarkness: propVignetteDarkness,
  aoIntensity = DEFAULT_PIPELINE_CONFIG.aoIntensity,
  aoRadius = DEFAULT_PIPELINE_CONFIG.aoRadius,
  aoHalfRes = DEFAULT_PIPELINE_CONFIG.aoHalfRes,
  fps,
}: PostProcessingPipelineProps): React.ReactElement<{ children?: any }> | null {
  if (!enabled) {
    return null;
  }

  const resolvedBokehScale = propDofBokehScale !== undefined
    ? propDofBokehScale
    : DEFAULT_PIPELINE_CONFIG.dofBokehScale;
```
Và truyền `bokehScale={resolvedBokehScale}` vào `<DepthOfField />` ở L176.

---

### Snippet 2: `src/client/game_canvas.tsx`

1. **Bảo tồn L19 và thêm dòng import mới (L20)**:
```tsx
import { PostProcessingPipeline } from './3d/post_processing_pipeline';
import { calculateDofConfig, resolveDofTarget } from './3d/post_processing_pipeline';
```

2. **Thêm selectors và tính toán DoF trong `GameCanvas` (sau L360)**:
```tsx
  const playersInfo = useGameStore((s) => s.playersInfo);
  const playerPositions = useGameStore((s) => s.playerPositions);
  const activeModal = useGameStore((s) => s.activeModal);
  const isAuctionActive = activeModal === 'auction';
  const isRolling = useGameStore((s) => s.isRolling);
  const isPawnAnimating = useGameStore((s) => s.activePawnAnimation?.isAnimating ?? false);
  const cameraFocusCell = useGameStore((s) => s.cameraFocusCell);
  const modalPayload = useGameStore((s) => s.modalPayload);

  const dofConfig = calculateDofConfig({
    activeModal,
    cameraFocusCell,
    isRolling,
    isPawnAnimating,
  });
  const dofTarget = resolveDofTarget({
    activeModal,
    cameraFocusCell,
    modalPayload,
  });
```

3. **Cập nhật nhánh inGame tại L439 (BẢO TOÀN `isAuctionActive`)**:
```tsx
                <PostProcessingPipeline
                  isMobile={isMobileDevice}
                  enabled={!isMobileDevice}
                  isAuctionActive={isAuctionActive}
                  enableDof={dofConfig.enableDof}
                  dofBokehScale={dofConfig.bokehScale}
                  dofFocusRange={dofConfig.focusRange}
                  dofTarget={dofTarget}
                />
```

---

## 6. QUY TRÌNH 3 TRẠM TỰ HÀNH

1. **Station 1 (RED Contract Test)**: `qa-tester` tạo `tests/client/dynamic_dof.test.ts` gồm 16 atomic tests theo đúng 5 Facets. Cấm sửa `src/**`. Xác nhận Adversarial Inversion (RED vì các hàm DoF mới chưa được triển khai trong `src/**`).
2. **Station 2 (GREEN Implementation)**: `implementer` áp dụng Snippet 1 vào `post_processing_pipeline.tsx` và Snippet 2 vào `game_canvas.tsx`. Đưa toàn bộ 16 tests về GREEN 100%. Bảo toàn 100% các suite kiểm thử kế thừa.
3. **Station 2.5 (Sweeping Scout Audit)**: `scout` rà quét 5 nguyên mẫu lỗi, đối chiếu số liệu đĩa thực tế từ `npm run check:loc`.
4. **Station 3 (Independent Reviews)**: Thẩm định độc lập song song bởi `spec-reviewer`, `code-reviewer` và `game-3d-visual-critic` trước khi bàn giao.
