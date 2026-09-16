# IMP-76 — Round Counter Network Synchronization, Treasury Conservation & Market Infrastructure Clarity

**Mục tiêu**:
1. Khắc phục dứt điểm lỗi bộ đếm vòng chơi hiển thị cố định `VÒNG 1/30` trên TopBar: Đồng bộ `roundNumber` từ FSM Server qua `DeltaPayload` vào Client Zustand Store.
2. Khắc phục lỗi vi phạm bảo toàn tiền tệ Kho Bạc (`TREASURY_INVARIANT_VIOLATED`): Khấu trừ đúng quỹ Kho Bạc `room.treasury` khi giải ngân thẻ Thị Trường `MC_PUBLIC_INVEST` (Đầu Tư Công) và đồng bộ `treasury` qua `DeltaPayload`.
3. Tăng cường tính minh bạch của Thẻ Thị Trường: Đồng bộ `activeModifiers` qua `DeltaPayload` và hiển thị huy hiệu phụ thu/chiết khấu trực tiếp trên Sổ Đỏ (Title Deed) khi có thẻ như `MC_FUEL_SURGE` (+500 Tr. cước vận tải) hoặc `MC_PEAK_TOURISM` (x2 tiền thuê).

---

## 1. PRE-FLIGHT BLAST RADIUS AUDIT

| Tiêu chí | Đánh giá |
|---|---|
| **Mức độ rủi ro (Risk Level)** | **Slice-Bound** — Chỉ tác động luồng dữ liệu delta mạng (`DeltaPayload`), hàm tính toán rút thẻ thị trường `handlePublicInvest` và hiển thị UI TopBar/Title Deed. |
| **Tập tin chạm trực tiếp (Direct Touch)** | `src/server/session_manager.ts`, `src/domain/market_card_handlers.ts`, `src/domain/event_card_engine.ts`, `src/client/network/apply_delta.ts`, `src/client/store/game_store.ts`, `src/client/store/game_store_types.ts`, `src/client/ui/modals/title_deed_modal.tsx`, `src/client/telemetry/telemetry_delta_hook.ts`. |
| **Thành phần tiêu thụ hạ tầng (Downstream Consumers)** | `TopBar.tsx`, `TitleDeedModal.tsx`, `ActivityTracker`, `TelemetryDeltaHook`, `WssServer`. |
| **Phòng vệ trường hợp xấu nhất (Worst-Case Defense)** | Trường mới trên `DeltaPayload` (`roundNumber?: number`, `treasury?: number`, `activeModifiers?: readonly MarketModifier[]`) là optional — 100% tương thích ngược với toàn bộ các bộ test hiện hành mà không gây phá vỡ type hay payload contracts. |

---

## 2. KIẾN TRÚC THỰC THI & SƠ ĐỒ DÒNG DỮ LIỆU

```
[Server FSM (turn_loop.ts)]
     │ (next === 0: room.roundCount++, decayModifiers)
     ▼
[session_manager.ts (buildDeltaFromRoom)]
     │ (Gói roundNumber, treasury, activeModifiers vào DeltaPayload)
     ▼ [WebSocket Broadcast]
[apply_delta.ts (applyPhaseAndTimerDeltas)]
     │
     ├──► game_store.setRoundNumber(delta.roundNumber)  ──► [TopBar: VÒNG N/30]
     ├──► game_store.setTreasuryPool(delta.treasury)    ──► [TopBar: Kho Bạc X Tr.]
     └──► game_store.setActiveModifiers(delta.activeModifiers)
               │
               ▼
     [TitleDeedModal.tsx]
     (Hiển thị Badge: "⚡ Phụ thu Xăng Dầu +500 Tr." hoặc "🌊 Mùa Du Lịch x2")
```

---

## 3. KẾ HOẠCH CHI TIẾT 3 TRẠM (MANDATORY 3-STATION PIPELINE)

### Trạm 1: RED Contract Test (`qa-tester`)
- **Tập tin test mới**: `tests/contracts/imp76_round_counter_and_treasury_conservation.test.ts`
- **Mật độ kiểm thử**: >= 15 atomic tests tuân thủ Ma trận 4 diện mạo hành vi (Universal 4-Facet Behavioral Matrix):
  1. *Boundary Facet*: Kiểm tra `roundNumber` từ vòng 1 đến vòng 30 và kích hoạt GameOver khi vượt quá vòng 30.
  2. *State Reactivity Facet*: Kiểm tra `applyDeltaToStore` khi nhận `delta.roundNumber` và `delta.treasury` cập nhật tương ứng vào Zustand `useGameStore`.
  3. *Resource & Treasury Conservation Facet*: Kiểm tra khi rút thẻ `MC_PUBLIC_INVEST`, tổng tài sản của người chơi sở hữu hạ tầng tăng đúng bằng số tiền trừ từ `room.treasury`.
  4. *Error Defense & Modifier Facet*: Kiểm tra các thẻ thị trường hết hạn đúng sau 1 vòng (`decayModifiers`) và Title Deed phản ánh chính xác phụ thu của `MC_FUEL_SURGE`.

### Trạm 2: GREEN Implementation (`implementer`)
1. **Server Core (`src/server/session_manager.ts`)**:
   - Mở rộng `DeltaPayload`:
     ```typescript
     readonly roundNumber?: number;
     readonly treasury?: number;
     readonly activeModifiers?: ReadonlyArray<MarketModifier>;
     ```
   - Trong `buildDeltaFromRoom()`: truyền `roundNumber: Math.max(room.roundCount ?? 1, room.round ?? 1)`, `treasury: room.treasury ?? 0`, `activeModifiers: room.activeModifiers`.
2. **Domain Market Card Engine (`src/domain/market_card_handlers.ts` & `src/domain/event_card_engine.ts`)**:
   - Cập nhật `handlePublicInvest` nhận `room?: Room`: Khấu trừ `room.treasury = Math.max(0, (room.treasury ?? 0) - totalDisbursed)`.
   - Chuyển tiếp `room` vào `applyMarketCard` trong `drawMarketCard`.
3. **Client Network & Store (`src/client/store/game_store.ts`, `src/client/network/apply_delta.ts`)**:
   - Thêm `activeModifiers: readonly MarketModifier[]` và `setActiveModifiers` vào `game_store.ts`.
   - Trong `applyPhaseAndTimerDeltas`:
     - Nếu `delta.roundNumber !== undefined`, gọi `state.setRoundNumber(delta.roundNumber)`.
     - Nếu `delta.treasury !== undefined`, gọi `state.setTreasuryPool(delta.treasury)`.
     - Nếu `delta.activeModifiers !== undefined`, gọi `state.setActiveModifiers(delta.activeModifiers)`.
4. **Client Telemetry Hook (`src/client/telemetry/telemetry_delta_hook.ts`)**:
   - Cập nhật `computeExpectedDelta` khi có `MC_PUBLIC_INVEST` để khớp số tiền giải ngân từ Kho Bạc mà không báo lỗi giả.
5. **Client UI (`src/client/ui/modals/title_deed_modal.tsx`)**:
   - Đọc `activeModifiers` từ `useGameStore` hoặc props: hiển thị huy hiệu thông báo phụ thu/chiết khấu nếu ô đất đang chịu tác động của `MC_FUEL_SURGE` (+500 Tr.), `MC_PEAK_TOURISM` (x2), hoặc `MC_UTILITY_DOUBLE` (x2).

### Trạm 3: Independent Review & Physical Disk Verification
- Độc lập kiểm định mã nguồn:
  - `spec-reviewer`: Đối soát 100% khớp đặc tả SSOT (ADR-0001, entity_model.md).
  - `code-reviewer`: Kiểm tra 6 Slop Red Flags, độ phức tạp <= 5, LOC <= trần quy định.
  - `ui-craft-reviewer`: Thẩm định UI badge trên TitleDeedModal, không vi phạm 4 anti-patterns.
- Chạy toàn bộ bộ test: `npm test` và `npm run gate:quick`.
- Tái tạo Docker container với mã nguồn mới.

---

## 4. BỘ LỆNH KIỂM CHỨNG (VERIFICATION SUITE)

```bash
# 1. Chạy test Trạm 1 (chứng minh RED)
npx vitest run tests/contracts/imp76_round_counter_and_treasury_conservation.test.ts

# 2. Chạy test sau khi hoàn tất Trạm 2 (chứng minh GREEN)
npx vitest run tests/contracts/imp76_round_counter_and_treasury_conservation.test.ts

# 3. Chạy toàn bộ hệ thống test suite
npm test

# 4. Kiểm tra UI lint
npm run lint:ui

# 5. Build kiểm tra kiểu TypeScript
npm run build
```
