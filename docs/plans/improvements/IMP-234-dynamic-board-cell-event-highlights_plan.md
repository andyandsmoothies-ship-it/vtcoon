# KẾ HOẠCH TRIỂN KHAI: IMP-234 (REVISION 3)
# KHỬ ĐIỂM MÙ TÁC ĐỘNG THẺ SỰ KIỆN: VIỀN HÀO QUANG 3D, HUY HIỆU ĐẾM LÙI SỐ VÒNG & ĐỒNG BỘ ĐA THIẾT BỊ MOBILE/DESKTOP

> **Mã định danh:** IMP-234  
> **Phân loại rủi ro:** Tier 2 (Full Rigor — 3D Visual Shader/Geometry, Mobile Touch/Density & Store Coordination)  
> **Mục tiêu:** Cung cấp phản hồi thị giác tức thì và liên tục trên sa bàn 3D khi các phiếu sự kiện (Cơ hội / Thị trường / Vĩ mô) có tác động tới các ô đất cụ thể; hiển thị viền hào quang phát quang (Aura Rim), huy hiệu 3D nổi (Floating Event Crest) kèm bộ đếm lùi số vòng (`⏳ 2V`), hỗ trợ tương tác 1-Tap Ticker Spotlight trên Mobile và Tooltip/Danh sách chi tiết trên Desktop.  
> **Tiêu chuẩn chất lượng:** Anti-Slop Module Sâu (`tile_event_aura.tsx`), Zero GC churn trong frame loop, ngân sách đổ bóng GPU `castShadow={false}` (IMP-142), 16 atomic contract tests (TC-234.01..TC-234.16).

---

## BẢNG TIẾP THU CHỈ THỊ PHẢN BIỆN (REVISION 3 DIRECTIVE COVERAGE)

| Chỉ thị phản biện | Phân loại | Tệp vật lý & Tọa độ | Giải pháp kỹ thuật cơ học |
| :--- | :--- | :--- | :--- |
| **P1: Spotlight Timer Memory & State Leak** | Critical | `src/client/ui/market_event_ticker.tsx#L177-185`, `L209-224` | Khai báo `spotlightTimerRef = useRef(...)`, dọn dẹp trong `useEffect` unmount cleanup. Huỷ timer cũ nếu người chơi click liên tục. Dùng `useGameStore.getState().setSpotlightedCells(null)` trực tiếp trong callback tránh stale closure. |
| **P2: Zustand State vs Action SRP Separation** | Medium | `src/client/store/game_store_types.ts#L236-238`, `L291-294`, `L331-334`, `L367-370` & `src/client/store/game_store.ts#L268-270` | Tách bạch dữ liệu và hành vi: `GameState` interface chỉ chứa trường dữ liệu `readonly spotlightedCellIndices?: readonly number[] | null;` (đưa vào `InitialGameState` Pick list, khởi tạo `null` trong `INITIAL_GAME_STATE`). Action `setSpotlightedCells` được đưa vào phần Actions riêng của `GameState` và triển khai trong `game_store.ts`. |
| **P3: Unimplementable GC Churn Test in Node Headless** | Medium | `tests/contracts/imp234_dynamic_board_cell_event_highlights.test.ts` (Mục 5, Facet 5, TC-234.16) | Thay thế bằng kiểm thử đẳng cấu hành vi (behavioral idempotency): gọi 2 lần với cùng inputs trả về cùng primitive values; và modifier có `remainingRounds === 0` trả về `isActive: false` ngay cả khi `affectedCells` chứa `cellIndex`. Triệt tiêu hoàn toàn static checklist test bị cấm. |
| **P4: Vague Task 5 Snippet & Missing Consumer JSX** | Medium | `src/client/ui/modals/event_card_modal.tsx#L1-16`, `L76-85`, `L214-220` | Cung cấp 100% drop-in snippet đầy đủ: import `BOARD_CONFIG` và `useGameStore`, hook lấy `activeModifier`, và khối JSX `data-testid="event-affected-cells-list"` duyệt qua `activeModifier.affectedCells` hiển thị tên ô tra cứu từ `BOARD_CONFIG[idx]?.name` kèm null guard an toàn trước nút CTA. |

---

## 1. PHÂN TÍCH HIỆN TRẠNG & ĐIỂM MÙ THỊ GIÁC

1. **Điểm Mù Thị Giác Trên Sa Bàn 3D (3D Board Blindspot):**
   - Khi rút các thẻ sự kiện có hiệu lực kéo dài $N$ vòng (ví dụ: `MC_NIGHT_ECONOMY` nhân đôi tiền thuê ô Dịch vụ trong 2 vòng; `MC_LAND_FEVER` tăng 50% giá đất và thuê trong 1 vòng; `MC_ALCOHOL_CHECK` giảm 50% tiền thuê; `CC_BUILD_HALT` đình chỉ khai thác...), dữ liệu `activeModifiers` đã được đồng bộ về client store (`useGameStore.getState().activeModifiers`).
   - Tuy nhiên, trên sa bàn 3D, các ô đất này **hoàn toàn không có bất kỳ dấu hiệu thị giác nào** (`board_tile.tsx` chỉ vẽ `OwnerBaseTrim` và `PlazaTrimBorder` cho quyền sở hữu/độc quyền). Người chơi buộc phải nhớ thủ công hoặc mở từng ô lên xem Sổ Đỏ.
2. **Khoảng Cách Trải Nghiệm Giữa Mobile và Desktop:**
   - Trên màn hình nhỏ di động (360px - 414px), người chơi nhìn từ góc camera xa; chữ nhỏ trên ô cờ 3D không thể đọc được. Cần một huy hiệu biểu tượng (Icon) lớn, màu sắc phát quang tương phản cao (WCAG AAA) và tính năng liên kết: bấm vào banner ticker đỉnh màn hình sẽ kích hoạt chớp sáng (Spotlight Flash) các ô đất trên bàn cờ.
   - Trên Desktop (>= 1024px), cần nhãn thông số rõ ràng, tooltip mượt mà khi rê chuột.
3. **Nguy Cơ Quá Tải Ngân Sách Dòng Mã (`board_tile.tsx` 439 LOC):**
   - `board_tile.tsx` hiện có 439 LOC (đã ở mức Warning > 400 LOC, trần tối đa Tier 2 là 500 LOC).
   - Nếu viết trực tiếp logic viền sáng và billboard vào `board_tile.tsx`, file sẽ vượt trần 500 LOC.
   - **Giải pháp Deep Module**: Trích xuất toàn bộ logic và geometry vào module chuyên biệt `src/client/3d/tile_event_aura.tsx` (~220 LOC), `board_tile.tsx` chỉ tích hợp 1 dòng gọi component.

---

## 2. KIẾN TRÚC GIẢI PHÁP KỸ THUẬT (VISUAL ARCHITECTURE)

```
[Server: Room.activeModifiers]
           │
           ▼ (WebSocket Delta Sync)
[Client Store: useGameStore.activeModifiers & spotlightedCellIndices]
           │
           ├────────────────────────┬────────────────────────┐
           ▼                        ▼                        ▼
[3D: LayeredDioramaTile]  [UI: MarketEventTicker]   [Modal: EventCardModal]
  │                        (Click ticker ➔           (Hiển thị rõ tên ô:
  ▼                         setSpotlightedCells)       Ô 6, 8, 26, 27)
[TileEventAura]
  ├─ resolveTileEventStatus (Pure Mapping: Icon, Color, Multiplier, Rounds)
  ├─ TileEventAuraRim (BoxGeometry at Y=0.042m, args=[1.82, 0.08, 2.34], Emissive Pulse)
  └─ TileEventFloatingBadge (SafeBillboard at Y=0.52m, Responsive Mobile/Desktop Scale)
```

### Màu Sắc Chuẩn Xác Theo Ngữ Nghĩa (Semantic Color Palette):
- **Buff (Tăng giá / x2 Tiền thuê / Sốt đất / Lễ hội)**: Màu hổ phách ánh kim `#F59E0B` hoặc cam rực `#EA580C`, phát quang `emissiveIntensity` tuần hoàn $0.4 \leftrightarrow 0.9$.
- **Nerf (Giảm 50% tiền thuê / Đình chỉ xây dựng / Kiểm tra cồn)**: Màu đỏ cảnh báo `#EF4444`.
- **Đóng băng (Freeze thanh khoản / Cấm thế chấp / Bão biển)**: Màu xanh băng tuyết `#06B6D4`.

---

## 3. NGÂN SÁCH DÒNG MÃ THỰC TẾ (LOC BUDGETS)

| Tệp vật lý | Phân loại Tier | LOC hiện tại | Dự kiến thêm/bớt | LOC sau nâng cấp | Trần quy định | Trạng thái |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `src/client/3d/tile_event_aura.tsx` | Tier 2 | 0 (New) | +220 | ~220 | <= 500 LOC | ✔️ Safe |
| `src/client/3d/board_tile.tsx` | Tier 2 | 439 | +12 / -0 | 451 | <= 500 LOC | ✔️ Safe (< 500) |
| `src/client/store/game_store_types.ts` | Tier 1 | 384 | +3 / -0 | 387 | <= 400 LOC | ✔️ Safe (< 400) |
| `src/client/store/game_store.ts` | Tier 1 | 388 | +1 / -0 | 389 | <= 400 LOC | ✔️ Safe (< 400) |
| `src/client/ui/market_event_ticker.tsx` | Tier 2 | 263 | +24 / -2 | 285 | <= 500 LOC | ✔️ Safe (< 500) |
| `src/client/ui/modals/event_card_modal.tsx` | Tier 2 | 225 | +32 / -0 | 257 | <= 500 LOC | ✔️ Safe (< 500) |
| `tests/contracts/imp234_dynamic_board_cell_event_highlights.test.ts` | Living Test | 0 (New) | +380 | ~380 | <= 650 LOC | ✔️ Safe |

---

## 4. CHI TIẾT CÁC NHIỆM VỤ THỰC THI (TASKS)

### Task 1: Xây Dựng Module Sâu Trực Quan 3D `tile_event_aura.tsx`
**Target physical file**: `src/client/3d/tile_event_aura.tsx` (New file / Tạo mới)  
**Trách nhiệm**:
1. Hàm thuần túy `resolveTileEventStatus(cellIndex, activeModifiers, spotlightedCells)`:
   - Quét mảng `activeModifiers`, lọc các modifier có `remainingRounds > 0` và `affectedCells.includes(cellIndex)`.
   - Trả về đối tượng trạng thái đầy đủ:
     * `isActive: boolean`
     * `type: string`
     * `icon: string` (🔥, 🌙, 🏖️, 🚨, ❄️, ⚡, 🏗️, 🚧...)
     * `label: string` (ví dụ: `x2 Thuê`, `+50%`, `-50%`, `Khóa`)
     * `color: string` (`#F59E0B`, `#EF4444`, `#06B6D4`)
     * `remainingRounds: number`
     * `isExpiringSoon: boolean` (`remainingRounds === 1`)
     * `isSpotlighted: boolean`
2. Component `TileEventAuraRim`:
   - Mesh khung viền `boxGeometry args={[1.82, 0.08, 2.34]}` đặt tại cao độ đệm $Y = 0.042\text{m}$. Kích thước 1.82x2.34 mở rộng ngoài footprint `OwnerBaseTrimBorder` (1.78x2.30), triệt tiêu 100% che khuất viền trên ô đã có chủ.
   - Vật liệu PBR `meshStandardMaterial`: `roughness: 0.2`, `metalness: 0.8`, `emissive: color`.
   - Nhịp thở phát quang `emissiveIntensity` dựa trên thời gian thực hoặc static boost khi `isSpotlighted`.
   - Tắt `castShadow={false}`, `receiveShadow={true}` để bảo toàn ngân sách GPU.
3. Component `TileEventFloatingBadge`:
   - Dùng `SafeBillboard` hovering tại cao độ an toàn $Y = 0.52\text{m}$ (không va chạm `OwnerPricePill` hay mô hình nhà, an toàn trong môi trường SSR/Node test).
   - Tự động scale: Mobile `scale={[1.18, 1.18, 1.18]}` với stroke đậm tương phản cao; Desktop `scale={[1.0, 1.0, 1.0]}`.
   - Hiển thị Icon + Nhãn chỉ số + Bộ đếm số vòng `⏳ 2V` (chuyển sang nhấp nháy khi còn 1V).

---

### Task 2: Tích Hợp Module Vào Ô Cờ Sa Bàn `board_tile.tsx`
**Target physical file**: `src/client/3d/board_tile.tsx`  
**Enclosing Scope 2.1:** Thêm import `TileEventAura` (dòng 15–18)  
```tsx
<<<<
import { PROPERTY_DEEDS } from '../../domain/property_data';

export { ToyPropertyBuildings, OwnerPricePill, TactileDeedWaxSeal };
====
import { PROPERTY_DEEDS } from '../../domain/property_data';
import { TileEventAura } from './tile_event_aura.js';

export { ToyPropertyBuildings, OwnerPricePill, TactileDeedWaxSeal, TileEventAura };
>>>>
```

**Enclosing Scope 2.2:** `LayeredDioramaTile` (dòng 228–230) mount `TileEventAura` vào ô cờ không phải góc:  
```tsx
<<<<
      {/* Viền chân đế màu sở hữu (OwnerBaseTrim) khi đã có chủ */}
====
      {/* 1.0. Viền hào quang & Huy hiệu sự kiện thị trường (IMP-234 Event Card Aura) */}
      {!isCornerTile && (
        <TileEventAura
          cellIndex={cell.index}
          isMobile={isMobile}
        />
      )}

      {/* Viền chân đế màu sở hữu (OwnerBaseTrim) khi đã có chủ */}
>>>>
```

---

### Task 3: Bổ Sung Trạng Thái Tiêu Điểm Spotlight Vào Store Tuân Thủ SRP
**Target physical file**: `src/client/store/game_store_types.ts`  
**Enclosing Scope 3.1:** Khai báo trường dữ liệu trong `GameState` (dòng 236–238)  
```typescript
<<<<
  readonly activeModifiers: ReadonlyArray<ClientMarketModifier>;
  readonly isHeatmapActive: boolean;
====
  readonly activeModifiers: ReadonlyArray<ClientMarketModifier>;
  readonly isHeatmapActive: boolean;
  readonly spotlightedCellIndices?: readonly number[] | null;
>>>>
```

**Enclosing Scope 3.2:** Khai báo action creator trong phần Actions của `GameState` (dòng 291–294)  
```typescript
<<<<
  toggleHeatmap: () => void;
  setHeatmapActive: (active: boolean) => void;
  readonly isPlayerHudVisible: boolean;
====
  toggleHeatmap: () => void;
  setHeatmapActive: (active: boolean) => void;
  setSpotlightedCells: (cells: readonly number[] | null) => void;
  readonly isPlayerHudVisible: boolean;
>>>>
```

**Enclosing Scope 3.3:** Khai báo trong `InitialGameState` Pick list (dòng 331–334)  
```typescript
<<<<
  | 'activeModifiers'
  | 'isHeatmapActive'
  | 'activeModal'
====
  | 'activeModifiers'
  | 'isHeatmapActive'
  | 'spotlightedCellIndices'
  | 'activeModal'
>>>>
```

**Enclosing Scope 3.4:** Khởi tạo dữ liệu trong `INITIAL_GAME_STATE` (dòng 367–370)  
```typescript
<<<<
  activeModifiers: [],
  isHeatmapActive: false,
  isPlayerHudVisible: true,
====
  activeModifiers: [],
  isHeatmapActive: false,
  spotlightedCellIndices: null,
  isPlayerHudVisible: true,
>>>>
```

**Target physical file**: `src/client/store/game_store.ts`  
**Enclosing Scope 3.5:** Triển khai action trong store (dòng 268–270)  
```typescript
<<<<
  setHeatmapActive: (active) => set({ isHeatmapActive: active }),
  togglePlayerHudVisibility: () => set((state) => ({ isPlayerHudVisible: !state.isPlayerHudVisible })),
====
  setHeatmapActive: (active) => set({ isHeatmapActive: active }),
  setSpotlightedCells: (cells) => set({ spotlightedCellIndices: cells }),
  togglePlayerHudVisibility: () => set((state) => ({ isPlayerHudVisible: !state.isPlayerHudVisible })),
>>>>
```

---

### Task 4: Tương Tác 1-Tap Ticker Spotlight Trong `market_event_ticker.tsx`
**Target physical file**: `src/client/ui/market_event_ticker.tsx`  
**Enclosing Scope 4.1:** Import `useRef` và `useEffect` (dòng 1–5)  
```typescript
<<<<
import React from 'react';
import { useGameStore } from '../store/game_store.js';
====
import React, { useRef, useEffect } from 'react';
import { useGameStore } from '../store/game_store.js';
>>>>
```

**Enclosing Scope 4.2:** Khai báo timer ref và unmount teardown trong `MarketEventTicker` (dòng 177–185)  
```typescript
<<<<
export const MarketEventTicker: React.FC<MarketEventTickerProps> = ({
  activeModifiers: propsModifiers,
}) => {
  const isSSR = typeof window === 'undefined';
====
export const MarketEventTicker: React.FC<MarketEventTickerProps> = ({
  activeModifiers: propsModifiers,
}) => {
  const spotlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (spotlightTimerRef.current) {
        clearTimeout(spotlightTimerRef.current);
        spotlightTimerRef.current = null;
        useGameStore.getState().setSpotlightedCells(null);
      }
    };
  }, []);

  const isSSR = typeof window === 'undefined';
>>>>
```

**Enclosing Scope 4.3:** Cập nhật `handleCardClick` hỗ trợ cancel timer cũ, kích hoạt spotlight mới và gọi dynamic store state (dòng 209–224)  
```typescript
<<<<
        const handleCardClick = () => {
          const detail =
            MARKET_CARD_DETAILS[cardType as MarketCardId] ??
            CHANCE_CARD_DETAILS[cardType as ChanceCardId];
          useGameStore.getState().openModal('event', {
====
        const handleCardClick = () => {
          if (spotlightTimerRef.current) {
            clearTimeout(spotlightTimerRef.current);
            spotlightTimerRef.current = null;
          }

          if (modifier.affectedCells && modifier.affectedCells.length > 0) {
            useGameStore.getState().setSpotlightedCells(modifier.affectedCells);
            spotlightTimerRef.current = setTimeout(() => {
              useGameStore.getState().setSpotlightedCells(null);
              spotlightTimerRef.current = null;
            }, 3000);
          }

          const detail =
            MARKET_CARD_DETAILS[cardType as MarketCardId] ??
            CHANCE_CARD_DETAILS[cardType as ChanceCardId];
          useGameStore.getState().openModal('event', {
>>>>
```

**Enclosing Scope 4.4:** Bảo đảm `min-h-[44px]` và padding ngón tay chạm cho mobile (dòng 231–233)  
```tsx
<<<<
            className="w-full pointer-events-auto flex items-center justify-between gap-1.5 px-2 py-0.5 sm:py-1 bg-[#FFFDF8]/95 hover:bg-amber-50/95 backdrop-blur-xs border-2 border-slate-900 rounded-lg sm:rounded-xl shadow-[0_2px_0_0_#0f172a] text-xs font-bold transition-colors cursor-pointer select-none text-slate-900 leading-none"
====
            className="w-full pointer-events-auto min-h-[44px] flex items-center justify-between gap-1.5 px-2.5 py-1.5 sm:py-1 bg-[#FFFDF8]/95 hover:bg-amber-50/95 backdrop-blur-xs border-2 border-slate-900 rounded-lg sm:rounded-xl shadow-[0_2px_0_0_#0f172a] text-xs font-bold transition-colors cursor-pointer select-none text-slate-900 leading-none"
>>>>
```

---

### Task 5: Hiển Thị Rõ Danh Sách Ô Đất Bị Ảnh Hưởng Trong `event_card_modal.tsx`
**Target physical file**: `src/client/ui/modals/event_card_modal.tsx`  
**Enclosing Scope 5.1:** Thêm import `BOARD_CONFIG` và `useGameStore` (dòng 6–16)  
```typescript
<<<<
import {
  getCardThemedEmoji,
  getCardHeroStat,
  getHeroStatStyles,
  sanitizeTargetScope,
  sanitizeDestination,
  cleanEventDescription,
  isFinancialDestination,
  getCardCtaButtonText,
} from './event_card_visuals.js';
====
import { useGameStore } from '../../store/game_store.js';
import { BOARD_CONFIG } from '../../../domain/board_config.js';
import {
  getCardThemedEmoji,
  getCardHeroStat,
  getHeroStatStyles,
  sanitizeTargetScope,
  sanitizeDestination,
  cleanEventDescription,
  isFinancialDestination,
  getCardCtaButtonText,
} from './event_card_visuals.js';
>>>>
```

**Enclosing Scope 5.2:** Lấy `activeModifier` từ store (dòng 76–80)  
```tsx
<<<<
  const shouldShowDestination = Boolean(
    isFinancialDestination(rawDestination, effectDelta) &&
    resolvedDestination !== 'Toàn thị trường'
  );
====
  const shouldShowDestination = Boolean(
    isFinancialDestination(rawDestination, effectDelta) &&
    resolvedDestination !== 'Toàn thị trường'
  );

  const activeModifier = useGameStore((s) =>
    s.activeModifiers.find((m) => String(m.type) === cardId && m.remainingRounds > 0)
  );
>>>>
```

**Enclosing Scope 5.3:** Khối JSX hiển thị danh sách ô đất chịu tác động trực tiếp (dòng 214–220)  
```tsx
<<<<
      </div>

      {/* CTA Button */}
      <button
====
      </div>

      {/* Khối Hiển Thị Ô Đất Bị Ảnh Hưởng (IMP-234) */}
      {activeModifier?.affectedCells && activeModifier.affectedCells.length > 0 && (
        <div
          data-testid="event-affected-cells-list"
          className="relative z-10 w-full bg-amber-50/80 border border-amber-300 rounded-xl p-2.5 mb-3 flex flex-col items-center gap-1.5 shadow-xs"
        >
          <span className="text-[10px] sm:text-[11px] font-black uppercase text-amber-900 tracking-wider">
            📍 Ô đất chịu tác động trực tiếp:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {activeModifier.affectedCells.map((idx) => {
              const cellName = BOARD_CONFIG[idx]?.name ?? `Ô ${idx}`;
              return (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold bg-white text-slate-800 border border-slate-300 shadow-xs"
                >
                  {cellName}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA Button */}
      <button
>>>>
```

---

## 5. STATION 1: BỘ KIỂM THỬ HỢP ĐỒNG (QA MANDATE)

Tệp kiểm thử: `tests/contracts/imp234_dynamic_board_cell_event_highlights.test.ts` (16 atomic tests)

- **Facet 1: Event Status Resolution & Multiplier Mapping (TC-234.01..TC-234.04)**
  * `TC-234.01`: `resolveTileEventStatus` khi có modifier `MC_NIGHT_ECONOMY` (affectedCells: [6, 8, 26, 27], rounds: 2) -> trả về `isActive: true`, icon `🌙`, label `x2 Thuê`, color `#F59E0B`.
  * `TC-234.02`: `resolveTileEventStatus` khi có modifier `MC_LAND_FEVER` (affectedCells: [6, 8, 31], rounds: 1) -> trả về `isActive: true`, icon `🔥`, label `+50%`, `isExpiringSoon: true`.
  * `TC-234.03`: `resolveTileEventStatus` khi có modifier `MC_ALCOHOL_CHECK` -> trả về `isBuff: false`, color `#EF4444`, label `-50%`.
  * `TC-234.04`: `resolveTileEventStatus` khi ô không nằm trong `affectedCells` -> trả về `isActive: false`.

- **Facet 2: Responsive Mobile & Desktop Layout Adaptation (TC-234.05..TC-234.08)**
  * `TC-234.05`: `TileEventFloatingBadge` khi `isMobile === true` kết xuất với scale tăng cường `1.18` và format rút gọn (`🔥 +50% • 2V`).
  * `TC-234.06`: `TileEventFloatingBadge` khi `isMobile === false` kết xuất với scale chuẩn `1.0`.
  * `TC-234.07`: Nhãn đếm vòng khi `remainingRounds === 1` mang cờ `isExpiringSoon = true` để kích hoạt nhấp nháy cảnh báo.
  * `TC-234.08`: Kích thước cảm ứng của banner sự kiện trên mobile duy trì touch target chiều cao $\ge 44\text{px}$.

- **Facet 3: Aura Rim Geometry & Depth Layer Stack Compliance (TC-234.09..TC-234.11)**
  * `TC-234.09`: `TileEventAuraRim` kết xuất tại cao độ $Y = 0.042\text{m}$, kích thước `[1.82, 0.08, 2.34]` bao ngoài `OwnerBaseTrimBorder` (1.78x2.30), triệt tiêu Z-fighting.
  * `TC-234.10`: Toàn bộ mesh viền hào quang và huy hiệu 3D đều mang thuộc tính `castShadow={false}`.
  * `TC-234.11`: Ô góc sa bàn (`isCornerTile === true`) tuyệt đối không render `TileEventAura`.

- **Facet 4: Ticker Spotlight Linking & State Lifecycles (TC-234.12..TC-234.14)**
  * `TC-234.12`: Gọi `setSpotlightedCells([6, 8])` cập nhật đúng `spotlightedCellIndices` trong Zustand store.
  * `TC-234.13`: `resolveTileEventStatus` đánh dấu `isSpotlighted = true` khi cellIndex nằm trong `spotlightedCellIndices`.
  * `TC-234.14`: Click vào ticker item kích hoạt `setSpotlightedCells` với mảng `affectedCells` tương ứng và thiết lập timer teardown tự động sau 3000ms.

- **Facet 5: Turn N+1 Expiry Teardown & Behavioral Idempotency (TC-234.15..TC-234.16)**
  * `TC-234.15`: Khi `remainingRounds === 0` hoặc modifier bị gỡ khỏi store, `resolveTileEventStatus` lập tức trả về `isActive: false`, không để lại ghost visual.
  * `TC-234.16`: Gọi `resolveTileEventStatus` 2 lần liên tiếp với cùng inputs trả về kết quả đẳng cấu (idempotent - cùng các giá trị primitive `isActive`, `type`, `icon`, `label`, `color`); và khi `remainingRounds === 0`, hàm trả về `isActive: false` ngay cả khi `cellIndex` vẫn nằm trong `affectedCells`. (Triệt tiêu hoàn toàn static checklist test bị cấm).

---

## 6. PHẦN CỨNG & QUY TRÌNH NGHIỆM THU

- **Phase 3.0 Physical Visual Capture**:
  Chạy lệnh chụp ảnh in-game tự động:
  ```bash
  npm run capture:visual -- --ticket IMP-234 --name event_aura_board
  ```
  Kiểm tra trực tiếp tệp ảnh `.agents/tmp/imp234_event_aura_board.png` bằng `view_file` trước khi gọi Trạm 3.2.
- **Trạm 4 (Chaos Sentinel)**:
  Thực thi bộ 3 đầu dò đối kháng:
  ```bash
  npx tsx scripts/station4_sentinel.ts --ticket IMP-234 --test tests/contracts/imp234_dynamic_board_cell_event_highlights.test.ts
  node scripts/check_evidence.mjs IMP-234
  ```
