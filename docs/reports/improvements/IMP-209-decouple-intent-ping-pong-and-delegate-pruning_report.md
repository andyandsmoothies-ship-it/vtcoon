# [REPORT] IMP-209: Decouple Intent Ping-Pong & Safe Delegate Pruning in RoomManager

## 1. THÔNG TIN TỔNG QUAN
- **Mã Ticket**: IMP-209
- **Tiêu Đề**: Decouple Intent Ping-Pong & Safe Delegate Pruning in RoomManager (Bước 1 của Chiến lược 2 Bước Tái Cấu Trúc `RoomManager`).
- **Phân Hạng**: Two-Way Door / Architectural Decoupling (Bước đệm an toàn chuẩn bị cho Bước 2 `GameRoomSession` Aggregate Root).
- **Trạng Thái**: COMPLETE (HOÀN TẤT BƯỚC 1).

---

## 2. NGUYÊN NHÂN CỐT LÕI & GIẢI PHÁP KỸ THUẬT

### 2.1. Hiện trạng chuỗi dội ngược (Ping-Pong Antipattern)
Trước khi tối ưu, khi người chơi gửi Intent từ Client qua WebSocket:
```
[Client / WSS]
       │
       ▼ (1)
[room_manager.handlePlayerIntent(roomCode, playerId, intent)]
       │
       ▼ (2)
[intent_dispatcher.ts: INTENT_MORTGAGE]
       │
       ▼ (3) DỘI NGƯỢC LẠI ROOM_MANAGER!
[room_manager.handleMortgage(roomCode, playerId, cellIndex)]
       │
       ▼ (4)
[room_property_coordinator.coordMortgage(ctx, playerId, cellIndex)]
       │
       ▼ (5)
[mortgage_manager.handleMortgage(...)]
```
Chuỗi gọi này tạo ra quan hệ phụ thuộc vòng (circular dependency bề mặt), khiến `RoomManager` phải duy trì hàng chục delegate wrapper sáo rỗng chỉ để chuyển tiếp tham số, làm phình to file và che giấu luồng điều phối nghiệp vụ thực sự.

### 2.2. Giải pháp kỹ thuật Bước 1 (Direct Domain Dispatch)
1. **Bẻ gãy chuỗi dội ngược trong `intent_dispatcher.ts`**:
   - `intent_dispatcher` lấy `const ctx = m.getContext(rc)` và gọi trực tiếp vào các Domain Coordinators & Handlers:
     - `coordMortgage`, `coordRedeem`, `coordDowngrade`, `coordTrade`, `coordRespondTradeOffer`, `coordBankruptcy`, `coordExecuteCompulsoryBuyout`, `coordDeclineCompulsoryBuyout` (từ `room_property_coordinator.js`).
     - `handleUpgrade`, `handleUpgradeETC`, `handleUpgradeUtility`, `handleBuyProperty` (từ `property_actions.js`).
     - `handleHoseInvest`, `handleHoseSkip` (từ `hose_actions.js`).
     - `handleIssueBond`, `handleRepayBond` (từ `bond_manager.js`).
2. **Chốt chặn Context Null Guard an toàn tuyệt đối**:
   - Mọi handler trong `intent_dispatcher` đều guard an toàn: `if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };` trước khi ủy quyền sang Domain Coordinator.
3. **Bảo toàn 100% `afk_recovery.ts` (Triệt tiêu rủi ro vòng lặp AFK)**:
   - Không chuyển các lệnh trong `afk_recovery.ts` sang `handlePlayerIntent`. Vòng lặp `while (player.balance < 0 && attempts < 50)` tiếp tục gọi trực tiếp các method cứu nguy mà không bị kích hoạt 50 lần `touchActivity` trong 1 tick.
4. **Bảo toàn 100% thân hàm Auction & Watchdog Timeouts**:
   - `handleAuctionBid`, `handleAuctionPass`, `handleAuctionClose` và `handleHoseSkip` trên `RoomManager` được giữ nguyên vẹn 100% logic đồng bộ `syncAuction(roomCode)` và lưu trữ `lastAuctionResults.set(...)`, bảo vệ Bot AI (`room_bot_coordinator.ts`) và Watchdog (`turn_watchdog.ts`).
5. **Giữ nguyên chữ ký hàm công khai (Zero Breakage cho Test Suites)**:
   - Giữ nguyên 100% public method signatures trên `RoomManager` để 54 call sites trong 18 test suite cũ không bị lỗi biên dịch.
   - Thêm getter công khai `rolledThisTurnMap` trên `RoomManager` để `intent_dispatcher` truy cập an toàn khi phá sản mà không cần ép kiểu bẩn `(m as any)`.
   - Tinh giản cú pháp `handleTradeOffer` bằng ternary logic gọn gàng, giảm 16 dòng cồng kềnh.

---

## 3. FILE MUTATION & LOC COMPLIANCE (ĐĨA VẬT LÝ)

| File | Phân Loại Tier | LOC Trước | LOC Sau | Non-Empty SLOC | Trần Ngân Sách | Đánh Giá & Tuân Thủ |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| `src/server/intent_dispatcher.ts` | Tier 1 (Domain/Server/Logic) | 108 | **162** | 158 | <= 400 | ✔️ An toàn (Gọi trực tiếp Coordinators) |
| `src/server/room_manager.ts` | Tier 1 (Domain/Server/Logic) | 533 | **518** | 440 | <= 400 | ❌ VƯỢT TRẦN (518 > 400) — Nợ Kỹ Thuật `DEBT-ROOM-MGR-01` |
| `src/server/network/afk_recovery.ts` | Tier 1 (Network/Logic) | 162 | **162** | 134 | <= 400 | ✔️ Giữ nguyên 100% (Tránh AFK loop side-effects) |

> [!NOTE]
> `room_manager.ts` đã giảm từ 533 xuống 518 dòng (-15 LOC). Khoản nợ vượt trần Tier 1 tiếp tục được quản lý dưới mã **`DEBT-ROOM-MGR-01`**. Bước 1 đã hoàn thành vai trò "dọn sạch bề mặt dội ngược", tạo tiền đề an toàn 100% cho **Bước 2** (`GameRoomSession` Aggregate Root) gom 10 Map phân tán và đưa `room_manager.ts` về vĩnh viễn `< 180 LOC`.

---

## 4. KẾT QUẢ KIỂM CHỨNG & BẰNG CHỨNG THỰC TẾ

1. **Biên dịch TypeScript (`npx tsc --noEmit`)**:
   - Thoát mã 0, **0 lỗi, 0 cảnh báo**.
2. **Kiểm thử hồi quy toàn bộ Server (`npx vitest run tests/server/`)**:
   - **52/52 test files (676 tests) PASS 100%** (thời gian chạy: 11.38s).
3. **Kiểm thử hợp đồng IMP-205 (`tests/contracts/imp205_...test.ts`)**:
   - **19/19 tests PASS 100%**.
4. **Bằng chứng kỹ thuật**:
   - Evidence Snapshot: [`.agents/evidence/imp209_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp209_snapshot.json).
5. **Kế hoạch đã ban hành**:
   - [`docs/plans/improvements/IMP-209-decouple-intent-ping-pong-and-delegate-pruning_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-209-decouple-intent-ping-pong-and-delegate-pruning_plan.md).
