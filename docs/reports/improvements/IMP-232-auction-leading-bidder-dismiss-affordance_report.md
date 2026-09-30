# BÁO CÁO NGHIỆM THU TÍNH NĂNG IMP-232
**Tên tính năng**: Chuyển Đổi Affordance Đóng Modal Cho Người Dẫn Đầu Đấu Giá & Việt Hóa Thông Báo Lỗi  
**Mã phiếu (Issue Ticket)**: IMP-232  
**Ngày hoàn thành**: 2026-09-30  
**Quy trình thực thi**: Quy Trình 4 Trạm Khép Kín (4-Station Closed-Loop Pipeline Tier 2 Full Rigor)  
**Trạng thái nghiệm thu**: ✅ HOÀN THÀNH TOÀN DIỆN (100% PASSED)

---

## 1. TỔNG QUAN VẤN ĐỀ & GIẢI PHÁP TRIỆT ĐỂ

### 1.1 Vấn Đề Gốc
Trong các phiên đấu giá quyền mua bất động sản (`AuctionModal`):
1. **Xung đột Affordance Chân Trang**: Khi người chơi đang dẫn đầu mức giá cao nhất (`highestBidderId === myId`), chân trang modal vẫn hiển thị nút màu đỏ `[✕ Rút Lui]` (`onPass()`). Người chơi muốn đóng modal tạm thời để xem sa bàn bàn cờ trong lúc đợi đối thủ ra giá, nhưng khi click vào nút này lại kích hoạt lệnh rút lui.
2. **Server Authoritative Rejection & Lỗi Tiếng Anh Thô**: Phía máy chủ (`RoomManager.handleAuctionPass`) có quy tắc bất biến cấm người đang dẫn đầu rút lui khỏi phiên đấu giá và trả về mã lỗi `HIGHEST_BIDDER_CANNOT_PASS`. Do client thiếu mục ánh xạ lỗi thân thiện và chưa hỗ trợ các alias, người chơi nhận được thông báo chung chung khó hiểu `'highest_bidder cannot pass'`, gây ức chế tâm lý và hiểu lầm là game bị lỗi.

### 1.2 Giải Pháp Triệt Để (IMP-232)
1. **Phân Định Nút Bấm Chân Trang Khi Đang Dẫn Đầu (Leading Bidder Affordance)**:
   - Khi `isLeading = true` (`highestBidderId === myId`), nút chân trang của `AuctionModal` chuyển đổi hoàn toàn:
     * Dữ liệu kiểm thử: `data-testid="auction-leading-close-btn"`
     * Nhãn nút: `"✕ Đóng / Xem Bàn Cờ"`
     * Hành vi: Gọi `onClick={onClose}` (kích hoạt `dismissAuction(cellIndex)`, đóng modal chính và mở `MiniAuctionStrip`), tuyệt đối **KHÔNG** gọi `onPass`.
     * Diện mạo công thái học: Màu vàng hổ phách danh giá (`bg-amber-400 text-amber-950 border-amber-600 shadow-[0_3px_0_0_#b45309]`).
2. **Chuyển Đổi Trạng Thái Động Khi Bị Vượt Giá (Dynamic Outbid Transition)**:
   - Biến `isLeading` được tính toán dẫn xuất thuần túy trực tiếp từ props (`isLeading = Boolean(myId && highestBidderId === myId)`).
   - Ngay khi đối thủ đặt giá cao hơn, giao diện lập tức phản ứng tự động chuyển đổi nút về `[✕ Rút Lui]` (`auction-pass-btn`, màu hồng nhẹ nhàng `bg-rose-50 border-rose-300 text-rose-700`), đồng thời mở lại cụm phím nâng giá nhanh (+100, +200, +500).
3. **Bảo Toàn Thứ Tự Ưu Tiên Nghiệp Vụ (Precedence Chain)**:
   - Chuỗi rẽ nhánh chân trang tuân thủ thứ tự ưu tiên 5 cấp:
     `isConcluded` $\rightarrow$ `hasPassed` $\rightarrow$ `isDeclinedPlayer` $\rightarrow$ `isLeading` $\rightarrow$ Non-leading `auction-pass-btn`.
   - Khi phiên đã kết thúc hoặc người chơi đã rút lui, trạng thái đó có quyền ưu tiên tuyệt đối trước `isLeading`.
4. **Việt Hóa Thông Báo Lỗi Máy Chủ (Actionable Notification Dictionary)**:
   - Bổ sung định nghĩa `HIGHEST_BIDDER_CANNOT_PASS` trong `ACTIONABLE_NOTIFICATIONS_MAP` (`src/client/ui/actionable_notification.ts`):
     * Icon: 👑
     * Title: `'Đang Dẫn Đầu Đấu Giá'`
     * Description: `'Bạn đang là người trả giá cao nhất nên không thể rút lui khỏi phiên đấu giá.'`
     * Tone: `'info'`
     * Action Hint: `'Bạn có thể nhấn "✕ Đóng / Xem Bàn Cờ" để tạm ẩn và theo dõi trận đấu.'`
   - Ánh xạ 3 alias không phân biệt hoa thường (`highest_bidder cannot pass`, `highest_bidder_cannot_pass`, `HighestBidderCannotPass`) cùng trỏ vào 1 tham chiếu đối tượng (zero heap duplicate).

---

## 2. HẠ TẦNG MÃ NGUỒN VẬT LÝ ĐÃ TRIỂN KHAI

| Tệp Mã Nguồn | Tầng Kiến Trúc | LOC Thực Tế | Ngân Sách Quy Định | Thay Đổi Chính |
| :--- | :--- | :---: | :---: | :--- |
| [`src/client/ui/modals/auction_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/auction_modal.tsx) | Client 2D Modal UI | 451 | $\le 500$ LOC | Bổ sung nhánh `isLeading` render `auction-leading-close-btn` gọi `onClose`, bảo toàn thứ tự ưu tiên 5 cấp. |
| [`src/client/ui/actionable_notification.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/actionable_notification.ts) | Client Notification Dictionary | 353 | $\le 500$ LOC | Thêm entry `HIGHEST_BIDDER_CANNOT_PASS` và 3 aliases tra cứu thân thiện. |
| [`docs/domain/gotchas.md#L199-L204`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md#L199-L204) | Domain Invariant Ledger | 222 | - | Ghi nhận [Bất biến số 27](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md#L199-L204) (Pillar V: Auction Leading Bidder Dismiss Affordance) và [Pillar VI Điều 6](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md#L213-L216) (Targeted Mutation Sensitivity & Anti-Tautology Invariant). |

---

## 3. KẾT QUẢ KIỂM TOÁN QUY TRÌNH 4 TRẠM KHÉP KÍN

```
[Kế Hoạch SSOT v2] 
        ↓
[Plan Griller (P1-P5)] → HARDENED_APPROVED (Khắc phục 4 điểm mù C1-C4)
        ↓
[Trạm 1: QA Tester]   → 16 Tests Contract viết trước (Chứng minh 9 RED Business)
        ↓
[Trạm 2: Implementer] → Mã nguồn hoàn tất, 44/44 Tests GREEN (kèm regressions)
        ↓
[Trạm 2.5: Scout]     → PASS (Khắc phục typecast test, 0 compiler errors, LOC safe)
        ↓
[Trạm 3: Review Funnel]
  ├─ Phase 3.1: Spec Reviewer  → APPROVED (100% Plan Fidelity, 0 Scope Drift)
  ├─ Phase 3.2: Code Reviewer  → APPROVED (Deep Architecture, Clean SRP, Zero Leaks)
  └─ Phase 3.2: UI Craft       → APPROVED (Điểm 10/10 tuyệt đối, Touch Target 44px)
        ↓
[Trạm 4: Chaos Sentinel]
  ├─ Probe 1: Wire-to-Core Parity    → PASSED (6/6 tests, 0 Gaps, 0 Mock Divergence)
  ├─ Probe 2: Ephemeral Boundary     → PASSED (7/7 tests, Falsy values, Precedence, Clock Skew safe)
  └─ Probe 3: Mutation Sensitivity   → PASSED:
        • Automated Sandbox Runner: 2/2 physical mutants injected & killed (khớp evidence JSON)
        • Dedicated Adversarial Suite: 7/7 mutation sensitivity tests killed (PROBE-3.1..3.7)
```

---

## 4. CHI TIẾT BỘ TEST HỢP ĐỒNG & PROBES

### 4.1 Bộ Test Hợp Đồng Trạm 1 (`tests/client/imp232_auction_leading_bidder_dismiss_affordance.test.ts`)
16/16 atomic contract tests đạt chuẩn Universal 5-Facet Behavioral Matrix & Detroit Style Classical ATDD:
- **Facet 1: Phân Định Nút Bấm Chân Trang Theo Trạng Thái Dẫn Đầu (4 tests)**:
  * `[TC-232.01/MSS]`: Khi `highestBidderId === myId`, render `auction-leading-close-btn` nhãn `'✕ Đóng / Xem Bàn Cờ'`, không render `auction-pass-btn`.
  * `[TC-232.02/MSS]`: Khi `highestBidderId !== myId`, render `auction-pass-btn` nhãn `'✕ Rút Lui'`.
  * `[TC-232.03/MSS]`: Click `auction-leading-close-btn` gọi `onClose` đúng 1 lần, `onPass` không được gọi.
  * `[TC-232.04/MSS]`: Click `auction-pass-btn` gọi `onPass` đúng 1 lần.
- **Facet 2: Chuyển Đổi Trạng Thái Động Khi Bị Vượt Giá (3 tests)**:
  * `[TC-232.05/MSS]`: Đổi `highestBidderId` sang đối thủ, nút Footer tự chuyển từ close sang pass.
  * `[TC-232.06/MSS]`: Đặt giá cao hơn tiếp, nút Footer phục hồi lại thành close.
  * `[TC-232.07/MSS]`: Khi `hasPassed = true`, luôn hiển thị `auction-passed-close-btn` kể cả khi `highestBidderId === myId`.
- **Facet 3: Khép Kín Với ModalHost & MiniAuctionStrip (3 tests)**:
  * `[TC-232.08/MSS]`: Click `auction-leading-close-btn` kích hoạt `dismissAuction(cellIndex)`, đóng modal (`activeModal: null`).
  * `[TC-232.09/MSS]`: Khi modal bị dismiss, `MiniAuctionStrip` hiển thị `👑 ${playerName}` và giá thầu hiện tại.
  * `[TC-232.10/MSS]`: Click `[👁️ Mở Lại]` trên `MiniAuctionStrip` phục hồi `AuctionModal` với `isLeading = true`.
- **Facet 4: Việt Hóa Thông Báo Lỗi Server (3 tests)**:
  * `[TC-232.11/MSS]`: `resolveActionableNotification('HIGHEST_BIDDER_CANNOT_PASS')` trả về icon 👑, tiêu đề "Đang Dẫn Đầu Đấu Giá" và hướng dẫn hành động.
  * `[TC-232.12/MSS]`: `formatServerErrorMessage('HIGHEST_BIDDER_CANNOT_PASS')` định dạng tiếng Việt thân thiện, không có mã lỗi thô.
  * `[TC-232.13/MSS]`: Ánh xạ alias `'highest_bidder cannot pass'`, `'highest_bidder_cannot_pass'`, `'HighestBidderCannotPass'`.
- **Facet 5: Độ Bền Vững & Hồi Quy (3 tests)**:
  * `[TC-232.14/MSS]`: Máy chủ `handleAuctionPass` duy trì kiểm tra `session.highestBidder === playerId` từ chối an toàn.
  * `[TC-232.15/MSS]`: Kết xuất SSR headless của `AuctionModal` khi `isLeading = true` chạy trơn tru 100%.
  * `[TC-232.16/MSS]`: Khi phiên kết thúc (`isConcluded = true`), luôn hiển thị `auction-concluded-close-btn`.

### 4.2 Bộ Kiểm Thử Trạm 4 (`tests/probes/imp232_chaos_sentinel_probes.test.ts`)
20/20 physical probe tests bao phủ sâu các kịch bản đối kháng theo phân rã thực tế (6 + 7 + 7 = 20 tests):
- **Probe 1: Wire-to-Core Closed-Loop Parity (6 tests - PROBE-1.1 đến PROBE-1.6)**: Đối soát khép kín 5 trạm không sai lệch từ Server `handleAuctionPass` $\rightarrow$ WebSocket Delta `buildDeltaFromRoom` $\rightarrow$ Client `gameStore` $\rightarrow$ UI `AuctionModal` $\rightarrow$ `actionable_notification.ts`.
- **Probe 2: Ephemeral Dynamic Boundary (7 tests - PROBE-2.1 đến PROBE-2.7)**: Khảo sát các giá trị biên cực đoan cho `highestBidderId`/`myId`, thứ bậc ưu tiên (`hasPassed`, `isConcluded`, `isDeclinedPlayer`), lệch giờ `timeRemaining = -3600s`, và an toàn callback `undefined`.
- **Probe 3: Targeted Mutation Sensitivity (7 tests - PROBE-3.1 đến PROBE-3.7)**: Kiểm thử độ nhạy tiêu diệt 7 biến thể đột biến (Mutant A - G) trên các export sản xuất thật, zero surviving mutants. Đồng thời, runner tự động `station4_sentinel.ts` xác nhận 2/2 physical mutants trong sandbox bị tiêu diệt hoàn toàn.

---

## 5. TỔNG HỢP KIỂM THỬ HỆ THỐNG
- **Tổng số tests nghiệm thu liên quan**: **64 / 64 tests PASSED (100%)**
  * `tests/client/imp232_auction_leading_bidder_dismiss_affordance.test.ts`: 16/16 tests PASS
  * `tests/probes/imp232_chaos_sentinel_probes.test.ts`: 20/20 tests PASS
  * `tests/contracts/imp200_auction_dismiss_and_mini_widget.test.ts`: 20/20 tests PASS
  * `tests/client/auction_modal.test.ts`: 8/8 tests PASS
- **Typecheck**: `npx tsc --noEmit` $\rightarrow$ 0 errors (Exit code 0).
- **UI Linter**: `npm run lint:ui` $\rightarrow$ 0 violations / 206 files.
- **Evidence Verification**: `node scripts/check_evidence.mjs` $\rightarrow$ Validated & Approved.

---

## 6. KẾT LUẬN & BẢN GIAO SẢN PHẨM
Tính năng **IMP-232** đã được hoàn thiện 100% theo các chuẩn mực nghiêm ngặt nhất của Hiến pháp Agent (GEMINI.md) và Antigravity 2.0. Toàn bộ trải nghiệm người chơi trong sàn đấu giá bất động sản đã đạt độ mượt mà, trực quan, công thái học xúc giác cao và phòng vệ vững chắc trước mọi lỗi thao tác vô ý.
