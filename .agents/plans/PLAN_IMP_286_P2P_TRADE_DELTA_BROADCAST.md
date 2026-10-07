# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE (LEAN PLAN SPECIFICATION)
# TICKET: IMP-286 — Phát Sóng Dữ Liệu Giao Dịch P2P & Hoán Đổi BĐS (Server SSOT Trade Result Broadcast)

> **Mã Nhiệm Vụ:** IMP-286 (Server SSOT Trade Result Broadcast)  
> **Phân hệ mục tiêu:** `domain-core` & `server-network`  
> **Phân loại rủi ro:** Tier 1 Micro-Slice (Lean Plan Specification, <= 180 lines, Delta <= 35 LOC, 4 files in `src/`)  
> **Chỉ tiêu kiểm thử:** Scaled Floor >= 8 atomic tests, Pure Logic Waiver = `true` (Non-visual backend server FSM & delta protocol)

---

## 0. KHẢO SÁT BỀ MẶT MÃ NGUỒN & ĐIỂM BẮT ĐẦU (SURFACE INVENTORY & LOC BASELINE)

### 0.1 Danh Sách Tệp Mục Tiêu & Dòng Mã Thực Tế Trên Đĩa
* **Target physical file**: `src/domain/room.ts` (285 lines, Tier 1 limit: 400 lines) — **Safe**.
* **Target physical file**: `src/server/delta_types.ts` (131 lines, Tier 1 limit: 400 lines) — **Safe**.
* **Target physical file**: `src/server/delta_mapper.ts` (266 lines, Tier 1 limit: 400 lines) — **Safe**.
* **Target physical file**: `src/server/p2p_trade_actions.ts` (227 lines, Tier 1 limit: 400 lines) — **Safe**.
* **Target physical file**: `tests/contracts/imp286_p2p_trade_delta_broadcast.test.ts` (New file in Station 1/2, Living Test limit: 600 lines) — **Safe**.

### 0.2 Bảng Thống Kê Delta LOC Dự Kiến
| File | Tier | Current LOC | Expected LOC | Delta LOC | Risk / Status | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `src/domain/room.ts` | Tier 1 (Domain Model) | 285 | 295 | +10 lines | Zero Cast Invariant | Safe (<= 400) |
| `src/server/delta_types.ts` | Tier 1 (Network Protocol) | 131 | 136 | +5 lines | Protocol Typing | Safe (<= 400) |
| `src/server/delta_mapper.ts` | Tier 1 (State Mapper) | 266 | 272 | +6 lines | Pure Projection | Safe (<= 400) |
| `src/server/p2p_trade_actions.ts` | Tier 1 (Server Action) | 227 | 237 | +10 lines | SSOT Recording | Safe (<= 400) |
| `tests/contracts/imp286_p2p_trade_delta_broadcast.test.ts` | Living Test | 0 | ~210 | +210 lines | Atomic Contracts | Safe (<= 600) |
| **Tổng Delta Production (`src/**`)** | — | — | — | **+31 net LOC** (<= 50 LOC) | — | **Pass Micro-Slice** |

### 0.3 Phân Định Phạm Vi & Ranh Giới Phân Hệ (Scope Conservation Mandate)
1. [`src/domain/room.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts) — **MODIFY (Target 1)**: Định nghĩa interface `TradeResultInfo` chứa thông tin chuẩn hóa `{ sellerId, buyerId, cellIndex, price, offeredCellIndex, taxAmount, timestamp }` và bổ sung trường `lastTradeResult?: TradeResultInfo | null;` vào interface `Room`.
2. [`src/server/delta_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/delta_types.ts) — **MODIFY (Target 2)**: Re-export `TradeResultInfo` và bổ sung trường `readonly lastTradeResult?: TradeResultInfo | null;` vào `DeltaPayload` và `DeltaPayloadOptions`.
3. [`src/server/delta_mapper.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/delta_mapper.ts) — **MODIFY (Target 3)**: Bổ sung mapping trường `lastTradeResult: room.lastTradeResult ?? null` trong `buildDeltaFromRoom` và ánh xạ tùy chọn trong `buildDeltaPayload(tickOrOptions)`.
4. [`src/server/p2p_trade_actions.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/p2p_trade_actions.ts) — **MODIFY (Target 4)**: Khi `executeP2PTrade` thực thi thành công, ghi nhận dữ liệu vào `room.lastTradeResult = { sellerId, buyerId, cellIndex, price, taxAmount: v.taxAmount, timestamp: Date.now(), ...(offeredCellIndex !== undefined ? { offeredCellIndex } : {}) }`.
5. [`tests/contracts/imp286_p2p_trade_delta_broadcast.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp286_p2p_trade_delta_broadcast.test.ts) — **NEW (Target 5)**: Viết 8 atomic contract tests kiểm toán luồng ghi nhận và phát sóng delta của giao dịch P2P.
6. **Bảo toàn môi trường làm việc & baseline trước đó**:
   - `src/server/turn_loop.ts`
   - `src/server/insolvency_manager.ts`
   - `src/server/network/turn_orchestrator.ts`
   - `src/server/intent_dispatcher.ts`
   - `src/client/network/activity_tracker.ts`
   - `src/client/network/activity_property_tracker.ts`
   - `src/client/network/activity_financial_tracker.ts`
   - `src/client/ui/floating_numbers.tsx`
   - `tests/contracts/imp278_compact_floating_notifications.test.ts`
   - `tests/contracts/imp284_activity_feed_causal_ordering.test.ts`
   - `tests/contracts/imp285_sequential_turn_closure_guard.test.ts`
   - Giao diện Client Activity Feed & Visual HUD hiển thị log tiền sẽ được xử lý riêng tại ticket [DEFERRED TO TICKET-IMP287: Client Activity Feed & Causal Financial Projection].

---

## 1. BẢN THIẾT KẾ KIẾN TRÚC & BẤT BIẾN NGHIỆP VỤ (ARCHITECTURAL INVARIANTS)

### 1.1 Tính Toàn Vẹn Của Bản Tin Giao Dịch (SSOT Trade Result Broadcast Invariant)
* **Bối cảnh**: Hiện tại khi P2P trade hoàn tất, máy chủ chỉ cập nhật số dư người chơi và chủ đất, không phát sóng dữ liệu nghiệp vụ về giá mua, đất hoán đổi và thuế nộp Kho Bạc, khiến Client không thể tái hiện thông tin tài chính của giao dịch.
* **Bất biến**:
  $$\forall \text{TradeSuccess}, \quad \text{room.lastTradeResult} = \langle \text{sellerId}, \text{buyerId}, \text{cellIndex}, \text{price}, \text{offeredCellIndex}, \text{taxAmount}, \text{timestamp} \rangle$$
  Trường `lastTradeResult` BẮT BUỘC được đưa vào `DeltaPayload` mỗi khi có giao dịch thành công.

### 1.2 Miễn Trừ Giao Diện Thuần Logic (Pure Logic Waiver Mandate)
* Ticket IMP-286 là phân hệ Backend Server Protocol thuần túy, không có bất kỳ sửa đổi nào trong DOM/2D Canvas/3D WebGL:
  `pureLogicWaiver: true` (Áp dụng theo hiến pháp dự án cho Server/Domain DTO slices).

---

## 2. THIẾT KẾ KIỂM THỬ HỢP ĐỒNG (STATION 1 CONTRACT TEST SPECIFICATIONS)
* **Target physical file**: `tests/contracts/imp286_p2p_trade_delta_broadcast.test.ts` (New file in Station 1/2)

* TC-286.01 [UC-IMP286/MSS]: Given một phiên P2P trade hợp lệ giữa seller và buyer, When gọi executeP2PTrade với giá tiền dương, Then room.lastTradeResult được gán với đầy đủ sellerId buyerId cellIndex price taxAmount và timestamp.
* TC-286.02 [UC-IMP286/MSS]: Given một phiên P2P trade hoán đổi BĐS kèm tiền bù, When gọi executeP2PTrade có offeredCellIndex, Then room.lastTradeResult ghi nhận chính xác offeredCellIndex.
* TC-286.03 [UC-IMP286/MSS]: Given một phiên P2P trade có thuế chuyển nhượng 5 phần trăm, When gọi executeP2PTrade thành công, Then room.lastTradeResult.taxAmount bằng 5 phần trăm của price.
* TC-286.04 [UC-IMP286/MSS]: Given phòng chơi có room.lastTradeResult vừa được ghi nhận, When gọi buildDeltaFromRoom trên room, Then delta trả về chứa trường lastTradeResult khớp 100 phần trăm dữ liệu phòng.
* TC-286.05 [UC-IMP286/MSS]: Given đối tượng DeltaPayloadOptions có trường lastTradeResult, When gọi buildDeltaPayload trực tiếp với options, Then DeltaPayload trả về bảo toàn trường lastTradeResult.
* TC-286.06 [UC-IMP286/A1]: Given giao dịch P2P thất bại do người mua không đủ tiền, When gọi executeP2PTrade với số dư không hợp lệ, Then hàm trả về false và room.lastTradeResult không bị cập nhật dữ liệu sai lệch.
* TC-286.07 [UC-IMP286/A2]: Given giao dịch P2P thất bại do người bán không phải chủ sở hữu, When gọi executeP2PTrade với ô đất không thuộc người bán, Then hàm trả về false và room.lastTradeResult không bị gán.
* TC-286.08 [UC-IMP286/A3]: Given phòng chơi chưa diễn ra giao dịch nào, When gọi buildDeltaFromRoom trên room mặc định, Then delta.lastTradeResult mang giá trị null hoặc undefined.

---

## 3. QUY TRÌNH CHỐT CHẶN CƠ HỌC & NGHIỆM THU
1. **Kiểm tra Plan tự động**: `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_286_P2P_TRADE_DELTA_BROADCAST.md --auto-sign`
2. **Trạm 1 (RED)**: Tạo contract test `tests/contracts/imp286_p2p_trade_delta_broadcast.test.ts` chứng minh fail vì runtime assertions (`room.lastTradeResult` hiện chưa tồn tại).
3. **Trạm 2 (GREEN)**: Cập nhật `room.ts`, `delta_types.ts`, `delta_mapper.ts`, `p2p_trade_actions.ts` làm xanh 100% tests.
4. **Chốt chặn Fast Pre-Filter & Scope**:
   - `npm run prefilter -- src/domain/room.ts src/server/delta_types.ts src/server/delta_mapper.ts src/server/p2p_trade_actions.ts tests/contracts/imp286_p2p_trade_delta_broadcast.test.ts`
   - `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_286_P2P_TRADE_DELTA_BROADCAST.md`
5. **Kiểm toán Bằng chứng vật lý**:
   - `npm run report -- IMP-286`
   - `node scripts/check_evidence.mjs IMP-286`
