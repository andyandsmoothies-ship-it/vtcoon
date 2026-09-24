# Kế Hoạch Kỹ Thuật IMP-191: Minh Bạch Dòng Tiền & Chuẩn Hóa Thông Báo Giao Dịch Đa Đối Tượng

> **Ticket ID**: `IMP-191`  
> **Trọng tâm**: Chuẩn Hóa Thông Báo Giao Dịch Đa Đối Tượng (`FloatingBadge`), Minh Bạch Dòng Tiền P2P & Dòng Tiền Kho Bạc Nhà Nước (`Treasury`), Ưu Tiên Người Chơi Cục Bộ Trên Mobile.  
> **Kiểm toán kiến trúc**: Tiếp thu toàn diện 4 phản biện sắc bén từ người dùng (Vertical Slice DTO, Pure Matching SRP, Loại bỏ Tech Debt extractReceiverId, Chuẩn hóa luồng Bảo lãnh theo Approach A).  
> **Quy trình áp dụng**: 3 Trạm Tự Hành Độc Lập (Station 1 RED ➔ Station 2 GREEN ➔ Station 2.5 Scout ➔ Station 3 Review).

---

## 1. Bối Cảnh & Vấn Đề (Problem Statement)

Trong quá trình chơi game, người chơi quan sát thấy popup giao dịch tiền thuê hiện lên chữ `"Thu thuê BĐS..."` nhưng hoàn toàn không rõ:
1. **Ai thu tiền của ai? Ai phải trả cho ai?**
2. **Thu tại ô đất nào?**
3. **Các khoản tiền nộp cho Nhà Nước (Thuế, Lệ phí, Bảo lãnh, Giải chấp, Đấu giá) tiền đi về đâu?**

### Phân Tích 4 Điểm Mù Kiến Trúc Đã Được Thẩm Định Lại:

1. **Khép Kín DTO Vertical Slice (Điểm Mù 1)**:
   - `FloatingActionType` (`game_store_types.ts`) cần bổ sung `'mortgage' | 'unmortgage'`.
   - `ActivityLogType` (`activity_store.ts`) cần bổ sung `'unmortgage'` và `'bail'` (đã có `'mortgage'`).
   - `ActivityLogEntry` bổ sung `readonly targetPlayerId?: string;` và `readonly targetPlayerName?: string;`.
   - Hàm `addActivityLog` trong `activity_store.ts` phải sao chép đầy đủ 2 trường này, chống silent drop.

2. **Giữ Thuần Túy matchRentTransactions & Bảo Toàn SRP (Điểm Mù 2)**:
   - Không truyền `DeltaPayload` hay `GameState` vào `matchRentTransactions`.
   - Thêm `readonly cellIndex?: number;` vào interface `BalanceDelta`.
   - Caller `detectFinancialAndStatusActivities` giải quyết `cellIndex` từ `p.position ?? nextState.playersInfo[p.id]?.position ?? prevState.playersInfo[p.id]?.position` khi khởi tạo `payers` / `receivers`.
   - `matchRentTransactions` giữ nguyên signature thuần túy, đọc `payer.cellIndex` để gán vào `rentLogs`.

3. **Xóa Bỏ Tech Debt extractReceiverId — Xử Lý Tận Gốc Dữ Liệu (Điểm Mù 3)**:
   - Khi `ActivityLogEntry` mang sẵn `targetPlayerId` và `targetPlayerName`, `handleRentBadge` trong `activity_badge_dispatcher.ts` đọc trực tiếp từ thuộc tính này.
   - Không dùng `act.id.split('_')` hay regex fallback để cào tên đối thủ từ chuỗi ID bot `bot_X`.
   - Nếu thiếu `targetPlayerId` và `targetPlayerName` do lỗi upstream: ghi `console.warn` và bail sớm, không bao giờ render badge què quặt.

4. **Chuẩn Hóa Luồng Bảo Lãnh Theo Approach A & Subtractive Refactoring Atomic (Điểm Mù 4)**:
   - Tại `activity_financial_tracker.ts` (`processPayerFee`): Khi nộp 500 Tr. rời Trạm Kiểm Toán (Ô 10), phát log với `type: 'bail'` (thay vì mượn tạm `type: 'tax'`), gán `cellIndex: 10`.
   - Tại `activity_badge_dispatcher.ts`: Đăng ký `bail: handleBailBadge` trực tiếp trong `BADGE_HANDLERS`. Xóa bỏ cành kiểm tra đắp vá `if (act.id.startsWith('bail_')) return;` trong `handleTaxBadge`.
   - Tại `apply_delta_players.ts`: Gỡ bỏ cờ `isBail` khỏi điều kiện lọc ở L224 (`if (!isDebtRelief && !isSalary) return;`) và dọn sạch nhánh `isBail` trong `notifyBalanceChange`. `activity_badge_dispatcher` trở thành đầu mối duy nhất (Single Source of Truth).

---

## 2. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

1. **Hợp Đồng Kiểm Thử Đối Kháng**:
   - `tests/contracts/imp191_financial_flow_transparency_and_badge_clarity.test.ts` gồm 16 atomic tests theo 5-Facet Universal Matrix, 100% PASS.
2. **Minh Bạch Chủ Thể & Tên Ô Giao Dịch P2P**:
   - Người trả tiền: `Trả tiền thuê ${cellName} cho ${formatShortPlayerName(receiverName)}`
   - Người nhận tiền: `Thu tiền thuê ${cellName} từ ${formatShortPlayerName(payerName)}`
   - Tuyệt đối không fallback thành chữ `"BĐS"` khi người chơi đứng trên ô đất có tên xác định.
3. **Minh Bạch Dòng Tiền Nhà Nước & Ngân Hàng**:
   - Thuế/Lệ phí Ô 04: `🏛️ Nộp Lệ Phí Đất Đai (Ô 04) ➔ Vào Kho Bạc`
   - Bảo lãnh Ô 10: `🚨 Nộp 500 Tr. bảo lãnh (Ô 10) ➔ Vào Kho Bạc` (type: `'bail'`)
   - Vay thế chấp: `🏦 Vay thế chấp ${cellName} từ Ngân Hàng` (actionType: `'mortgage'`)
   - Giải chấp: `🔓 Giải chấp ${cellName} (Phí 10% ➔ Vào Kho Bạc)` (actionType: `'unmortgage'`)
   - Đấu giá phát mãi: `🔨 Thắng đấu giá ${cellName} ➔ Vào Kho Bạc`
4. **Công Thái Học Di Động (< md / 360px)**:
   - Trên màn hình nhỏ (`< md`), nếu có giao dịch P2P giữa người chơi địa phương (`myPlayerId`) và đối thủ, badge của người chơi địa phương luôn được ưu tiên hiển thị ở vị trí không bị ẩn (`hidden md:flex`).
   - Thẻ hiển thị lý do có `formatShortPlayerName` và `line-clamp-2 break-words` chống tràn viền.
5. **Ngân Sách LOC Tuân Thủ Tuyệt Đối**:
   - `activity_financial_tracker.ts` <= 330 LOC (trần 400 LOC Tier 1).
   - `activity_badge_dispatcher.ts` <= 250 LOC (trần 400 LOC Tier 1).
   - `floating_numbers.tsx` <= 390 LOC (trần 500 LOC Tier 2).
   - `apply_delta_players.ts` <= 270 LOC (trần 400 LOC Tier 1).
   - `activity_store.ts` <= 145 LOC.

---

## 3. Kiến Trúc Luồng Dữ Liệu (Origin-to-Sink Flow)

```
[WebSocket DeltaPayload: players, cells]
         │
         ▼
[apply_delta.ts ➔ apply_delta_players.ts]
         │ (Subtractive: Chỉ giữ salary & debt_relief; KHÔNG phát generic isBail)
         ▼
[activity_financial_tracker.ts: detectFinancialAndStatusActivities]
  ├── Tạo BalanceDelta: id, diff, pInfo, cellIndex: playerPos  <-- [PURE SRP RESOLUTION]
  ├── matchRentTransactions(payers, receivers)
  │     └──> ActivityLogEntry: { type: 'rent', playerId, playerName, targetPlayerId, targetPlayerName, cellIndex, amount }
  └── processPayerFee / processReceiverReward
        ├── Ô 04: { type: 'tax', cellIndex: 4, message: '...Lệ Phí Đất Đai...' }
        └── Ô 10: { type: 'bail', cellIndex: 10, message: '...Bảo Lãnh Kiểm Toán...' }  <-- [APPROACH A]
         │
         ▼
[activity_store.ts: addActivityLog]
  └── Sao chép đầy đủ: targetPlayerId, targetPlayerName, cellIndex, amount  <-- [NO SILENT DROP]
         │
         ▼
[activity_badge_dispatcher.ts: dispatchActivityFloatingBadges]
  ├── BADGE_HANDLERS.rent ➔ Đọc trực tiếp act.targetPlayerId / act.targetPlayerName (KHÔNG parse act.id)
  ├── BADGE_HANDLERS.bail ➔ actionType: 'bail', title: 'Nộp Bảo Lãnh (Ô 10) ➔ Vào Kho Bạc'
  ├── BADGE_HANDLERS.mortgage ➔ actionType: 'mortgage', title: 'Vay thế chấp ${cellName} từ Ngân Hàng'
  ├── BADGE_HANDLERS.unmortgage ➔ actionType: 'unmortgage', title: 'Giải chấp ${cellName} (Phí 10% ➔ Vào Kho Bạc)'
  └── BADGE_HANDLERS.tax ➔ actionType: 'tax', title: 'Nộp Lệ Phí Đất Đai (Ô 04) ➔ Vào Kho Bạc'
         │
         ▼
[game_store.ts: addFloatingText]
         │
         ▼
[floating_numbers.tsx: FloatingNumbersOverlay]
  ├── formatRentPay / formatRentReceive với formatShortPlayerName
  ├── formatTax, formatBail, formatMortgage, formatUnmortgage, formatAuction
  └── Mobile Sort: Ưu tiên badge mang myPlayerId lên vị trí hiển thị trên mobile
```

---

## 4. Kế Hoạch Thi Công Từng Trạm

### Trạm 1: Station 1 — RED (Adversarial Contract Tests)
- Tệp: `tests/contracts/imp191_financial_flow_transparency_and_badge_clarity.test.ts`
- Phụ trách: `qa-tester` (Model: inherit).
- 16 atomic tests có tags `[TC-191.01..16/MSS]` và `[UC-IMP191]`:
  - `[TC-191.01]` `BalanceDelta` chấp nhận thuộc tính `cellIndex?: number`.
  - `[TC-191.02]` `ActivityLogEntry` chấp nhận `targetPlayerId?: string` và `targetPlayerName?: string`.
  - `[TC-191.03]` `ActivityLogType` hỗ trợ `'unmortgage'` và `'bail'` bên cạnh `'mortgage'`.
  - `[TC-191.04]` `FloatingActionType` hỗ trợ `'mortgage'` và `'unmortgage'`.
  - `[TC-191.05]` `matchRentTransactions` tạo `ActivityLogEntry` mang đúng `targetPlayerId`, `targetPlayerName`, và `cellIndex`.
  - `[TC-191.06]` `processPayerFee` sinh log có `type: 'tax'`, `cellIndex: 4` khi người chơi dừng ở Ô 04.
  - `[TC-191.07]` `processPayerFee` sinh log có `type: 'bail'`, `cellIndex: 10` khi người chơi nộp 500 Tr. rời Trạm Kiểm Toán.
  - `[TC-191.08]` `handleRentBadge` đọc trực tiếp `targetPlayerId` / `targetPlayerName`, KHÔNG bị vỡ với ID dạng `bot_1` hay `bot_2`.
  - `[TC-191.09]` `handleRentBadge` ghi log warning và bail sớm nếu thiếu `targetPlayerId` / `targetPlayerName`.
  - `[TC-191.10]` `handleTaxBadge` gán tiêu đề có hậu tố `➔ Vào Kho Bạc`.
  - `[TC-191.11]` `handleBailBadge` được gọi từ `BADGE_HANDLERS.bail`, gán actionType `'bail'`, icon `🚨`, hậu tố `➔ Vào Kho Bạc`.
  - `[TC-191.12]` `BADGE_HANDLERS` xử lý `'mortgage'` (icon `🏦`, `"Vay thế chấp..."`) và `'unmortgage'` (icon `🔓`, `"Giải chấp..."`).
  - `[TC-191.13]` `apply_delta_players.ts` KHÔNG sinh badge generic khi `isBail === true` (đảm bảo không phát đúp badge).
  - `[TC-191.14]` `floating_numbers.tsx` format đúng chuỗi văn bản cho `rent_pay`, `rent_receive`, `tax`, `bail`, `mortgage`, `unmortgage`, `auction_win`.
  - `[TC-191.15]` `FloatingNumbersOverlay` đảo thứ tự ưu tiên badge của `myPlayerId` trên màn hình nhỏ.
  - `[TC-191.16]` Ngân sách LOC: Tất cả các file tuân thủ trần LOC của dự án.
- Xác nhận Inversion Gate: Chạy test thất bại (RED) vì logic mới chưa được áp dụng.

### Trạm 2: Station 2 — GREEN (Implementation)
- Phụ trách: `implementer` (Model: inherit).
- **Task 2.1**: Cập nhật DTO tại `src/client/store/game_store_types.ts` và `src/client/store/activity_store.ts`:
  - Thêm `'mortgage' | 'unmortgage'` vào `FloatingActionType`.
  - Thêm `'unmortgage' | 'bail'` vào `ActivityLogType`.
  - Thêm `targetPlayerId?: string;` và `targetPlayerName?: string;` vào `ActivityLogEntry`.
  - Cập nhật `addActivityLog` trong `activity_store.ts` sao chép 2 thuộc tính trên.
- **Task 2.2**: Cập nhật `src/client/network/activity_financial_tracker.ts`:
  - Bổ sung `readonly cellIndex?: number;` vào `BalanceDelta`.
  - Trong `detectFinancialAndStatusActivities`: truyền `cellIndex: playerPos` vào `payers` và `receivers`.
  - Trong `matchRentTransactions`: giữ nguyên signature, gán `targetPlayerId: receiver.id`, `targetPlayerName: receiverName`, `cellIndex: payer.cellIndex` vào log.
  - Trong `processPayerFee`: gán `cellIndex: 4` cho Ô 04 (`type: 'tax'`), và gán `cellIndex: 10`, `type: 'bail'` cho Ô 10.
- **Task 2.3**: Cập nhật `src/client/network/activity_property_tracker.ts`:
  - Khi `cell.isMortgaged === false`: gán `type: 'unmortgage'` cho entry giải chấp.
- **Task 2.4**: Subtractive Refactoring tại `src/client/network/apply_delta_players.ts`:
  - Gỡ bỏ `!isBail` khỏi dòng 224: `if (!isDebtRelief && !isSalary) return;`.
  - Gỡ bỏ xử lý `isBail` trong `notifyBalanceChange`.
- **Task 2.5**: Tái cấu trúc `src/client/network/activity_badge_dispatcher.ts`:
  - `handleRentBadge`: Đọc trực tiếp `act.targetPlayerId` và `act.targetPlayerName`. Nếu không có, log warning và early return.
  - Bổ sung `handleMortgageBadge`, `handleUnmortgageBadge`, `handleBailBadge`.
  - Đăng ký vào `BADGE_HANDLERS`: `mortgage: handleMortgageBadge`, `unmortgage: handleUnmortgageBadge`, `bail: handleBailBadge`.
  - Xóa bỏ cành `if (act.id.startsWith('bail_')) return;` trong `handleTaxBadge`.
- **Task 2.6**: Cập nhật UI tại `src/client/ui/floating_numbers.tsx`:
  - Bổ sung helper `formatShortPlayerName(name?: string, maxLength = 10): string`.
  - Cập nhật `resolveActionIcon` cho `'mortgage'` (`🏦`), `'unmortgage'` (`🔓`), `'bail'` (`🚨`).
  - Cập nhật formatters: `formatRentPay`, `formatRentReceive`, `formatTax`, `formatBail`, `formatMortgage`, `formatUnmortgage`, `formatAuction`.
  - Trong `FloatingNumbersOverlay`: Lấy `myPlayerId = useLobbyStore.getState().myPlayerId`, nếu có badge liên quan đến `myPlayerId`, ưu tiên đưa lên vị trí hiển thị trên mobile.
  - Thêm `line-clamp-2 break-words` vào container hiển thị reason.

### Trạm 2.5: Station 2.5 — Sweeping Scout Audit
- Phụ trách: `scout` (Model: inherit).
- Quét toàn bộ các tệp vật lý vừa chỉnh sửa để rà soát 5 Universal Defect Archetypes.
- Xác nhận không có closure stale, không có rò rỉ socket/listener, không có silent drop dữ liệu.

### Trạm 3: Station 3 — Review & Snapshot
- Phụ trách: `spec-reviewer` và `ui-craft-reviewer` (READ-ONLY).
- Kiểm tra tính truy vết 100% yêu cầu, chạy `npm run lint:ui` đạt 0 violations, `npm test` đạt 100% PASS.
- Ghi nhận Gotcha #260 vào `docs/domain/gotchas.md`.
