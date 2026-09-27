# [REPORT] IMP-205: Làm Sạch Thế Chấp Khi Đấu Giá & Bảo Toàn Kho Bạc Bất Biến (Auction Mortgage Sanitization & Treasury Conservation)

## 1. THÔNG TIN TỔNG QUAN
- **Mã Ticket**: IMP-205
- **Tiêu Đề**: Auction Mortgage Sanitization & Treasury Conservation (Giải trừ thế chấp sạch nợ khi đấu giá, bảo toàn quỹ Kho Bạc khi đấu giá đất công/thu hồi, khử vòng lặp đếm chậm tiến độ vô tận và triệt tiêu log chuộc đất ma trên Client).
- **Phân Hạng**: Tier 2 (Full Rigor) — Đã hoàn thành quy trình 3 Trạm (Station 1 RED $\rightarrow$ Station 2 GREEN $\rightarrow$ Station 2.5 Scout $\rightarrow$ Station 3 Independent Review).
- **Trạng Thái**: COMPLETE (HOÀN TẤT 100%)

---

## 2. NGUYÊN NHÂN CỐT LÕI & GIẢI PHÁP

### 2.1. Hiện tượng thực tế (Match VTD8J8)
Người chơi trả giá 1.700 Tr để trúng đấu giá ô đất Bà Rịa - Vũng Tàu (sau khi bị thu hồi vì dính thẻ phạt `CC_SLOW_BUILD`), nhưng:
1. Vừa thắng đấu giá xong lập tức xuất hiện dòng log: *"Crazy Flamingo đã thế chấp Bà Rịa - Vũng Tàu vào ngân hàng (+600)"*, đất bị rơi vào trạng thái thế chấp (không thu được tiền thuê) và muốn mở phải nộp 600 Tr tiền chuộc.
2. Quá trình này lặp lại liên tục 3 lần trong trận đấu (Tick 237, 274, 303).
3. Hộp đen telemetry ghi nhận vi phạm nghiêm trọng: Thất thoát quỹ Kho Bạc sai lệch -1.700 Tr (kỳ vọng: -1.100 Tr).

### 2.2. Cơ chế lỗi & Giải pháp toàn diện
1. **Khử Vòng Lặp Thu Hồi Dự Án Treo Vô Tận (`turn_loop.ts`)**:
   - *Lỗi*: Khi `nextRounds > 2`, mã cũ đặt `stateMap.set(cellIndex, { ...state, unbuiltRounds: 0 })`. Vì `0 !== undefined`, vòng lặp đếm vòng tiếp tục chạy `0 -> 1 -> 2 -> 3` khiến ô đất bị thu hồi và đem đấu giá lại sau mỗi 2 lượt.
   - *Khắc phục*: Xóa bỏ hoàn toàn thuộc tính (`delete nextState.unbuiltRounds` $\rightarrow$ `undefined`). Bổ sung giải chấp ô đất bị thu hồi (`isMortgaged: false`), dọn nợ cựu chủ, bổ sung `endTime` (+20s), `currentBid`, và lệnh `break;` bảo vệ session đơn lẻ.
2. **Bàn Giao Bất Động Sản Sạch Thế Chấp - Clean Title (`auction_manager.ts`)**:
   - *Lỗi*: `handleAuctionClose` không cập nhật `stateMap` và không xóa nợ thế chấp cũ, khiến người trúng đấu giá nhận lại cờ `isMortgaged: true` tàn dư.
   - *Khắc phục*: Gán `st.isMortgaged = false` và `delete st.unbuiltRounds` trong `stateMap` của phòng; lọc sạch ô đất khỏi `mortgagedProperties` của tất cả người chơi trong phòng.
3. **Bảo Toàn Quỹ Kho Bạc & Ưu Tiên Nợ Gốc (`auction_manager.ts`)**:
   - *Lỗi*: Đấu giá đất từ chối mua và đất thu hồi không cộng tiền vào `room.treasury`. Người mua bị trừ tiền nhưng Kho Bạc không nhận tiền ($\Delta = -1.700$ Tr).
   - *Khắc phục*: 
     - Đấu giá đất công/thu hồi/từ chối mua: nộp 100% `winningBid` vào `room.treasury`.
     - Đấu giá phát mãi con nợ (`insolvencyPlayerId`): Kho Bạc là chủ nợ ưu tiên cao nhất, thu hồi nợ gốc trước (`loanPayoff = Math.min(winningBid, loan)`), phần thặng dư mới hoàn trả cho con nợ.
4. **Cô Lập Trạng Thái Đa Phòng & Triệt Tiêu Memory Leak (`auction_manager.ts`, `room_manager.ts`)**:
   - Loại bỏ hoàn toàn monkey-patch toàn cục `Map.prototype.set` và Set `knownStateMaps` cấp module, ngăn ngừa rò rỉ bộ nhớ vĩnh viễn và triệt tiêu nguy cơ xóa nhầm trạng thái của các phòng chơi khác.
   - `RoomManager` truyền trực tiếp `this.propertyStates.get(roomCode)` vào `handleAuctionBid`, `handleAuctionPass` và `handleAuctionClose`; đồng bộ `this.syncAuction(roomCode)` vào cuối `handleEndTurn`.
5. **Khử Log Giả Lập Chuộc Đất Ma Trên Client (`activity_property_tracker.ts`)**:
   - `detectCellMortgage` tiếp nhận cờ `isOwnerChanged`, giải quyết thứ tự biến tránh `ReferenceError`, và bỏ qua việc sinh log chuộc lại đất khi ô đất vô chủ hoặc được bàn giao sạch nợ cho chủ mới từ sàn đấu giá.

---

## 3. FILE MUTATION & LOC COMPLIANCE (ĐĨA VẬT LÝ)

| File | Phân Loại Tier | LOC Thực Tế | Non-Empty SLOC | Ngân Sách Trần | Đánh Giá & Tuân Thủ |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/server/turn_loop.ts` | Tier 1 (Domain/Server/Logic) | **299** | 271 | <= 400 | ✔️ ĐẠT (Tier 1 Logic) |
| `src/server/auction_manager.ts` | Tier 1 (Domain/Server/Logic) | **257** | 238 | <= 400 | ✔️ ĐẠT (Tier 1 Subtractive) |
| `src/server/room_manager.ts` | Tier 1 (Domain/Server/Logic) | **533** | 453 | <= 400 | ❌ VƯỢT TRẦN (533 > 400) — Nợ Kỹ Thuật `DEBT-ROOM-MGR-01` |
| `src/client/network/activity_property_tracker.ts` | Tier 1 (Domain/Server/Logic) | **243** | 224 | <= 400 | ✔️ ĐẠT (Tier 1 Tracker) |
| `tests/contracts/imp205_auction_mortgage_sanitization_and_treasury_conservation.test.ts` | Contract / Unit Tests | **556** | 478 | <= 600 | ✔️ ĐẠT (19 Atomic Tests <= 600 LOC) |

> [!WARNING]
> **Xác Nhận Nợ Kỹ Thuật (Defect Rectification)**:
> `src/server/room_manager.ts` là tệp Tier 1 (Domain/Server Logic), trần ngân sách quy định nghiêm ngặt bởi `GEMINI.md` là `<= 400 LOC` (550 LOC là ngưỡng lỗi biên dịch cứng). Việc phân loại trước đây gán trần 550 là sai quy chuẩn.
> Hiện tại file có 533 LOC (SLOC 453), vượt trần 133 LOC. Đây là khoản nợ kỹ thuật kế thừa do dồn nén các coordinator/lifecycle handlers.
> Khoản nợ đã được ghi nhận chính thức vào Sổ Nợ Kỹ Thuật ([`docs/epics/client_ui/_epic_ledger.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/epics/client_ui/_epic_ledger.md)) với mã **`DEBT-ROOM-MGR-01`** (Lộ trình 2 bước: Bước 1 Fast-Track khử ping-pong wrappers giữa `intent_dispatcher` và `room_manager`; Bước 2 Full Rigor One-Way Door chuyển đổi sang `GameRoomSession` Aggregate Root để đưa file về < 180 LOC).

---

## 4. KẾT QUẢ KIỂM THỬ & CHỨNG NHẬN TRẠM (STATION AUDIT)

- **Station 1 (RED Contract Test)**: `qa-tester` thiết lập 19 atomic tests (Universal 5-Facet Matrix), chứng minh Adversarial Inversion thành công (15 tests FAIL Business RED vì đúng lý do nghiệp vụ).
- **Station 2 (GREEN Implementation)**: `implementer` triển khai mã nguồn tối thiểu, đưa toàn bộ 19/19 tests sang trạng thái PASS (100% GREEN).
- **Station 2.5 (Sweeping Scout Audit)**: `scout` rà quét 5 archetypes khuyết tật trên 5 file vật lý, phát hiện và hỗ trợ loại bỏ hoàn toàn monkey-patch toàn cục `knownStateMaps`.
- **Station 3 (Independent Dual Review)**:
  * `spec-reviewer`: **APPROVED** (100% đối chiếu đặc tả không trôi dạt, không Scope Drift, bảo vệ SSOT).
  * `code-reviewer`: **APPROVED** (Rà soát 6 Slop Red Flags = 0 vi phạm; Runtime Wire Gate 100% kết nối; Zero Dirty Casts: đã loại bỏ triệt để 14 biểu thức `(mgr as any)` trong test suite chuyển sang API công khai `mgr.getRegistry()`, `mgr.getPropertyStates()`, `mgr.auctionsMap`; xác nhận và ghi nhận nợ kỹ thuật `DEBT-ROOM-MGR-01`).
  * Evidence Snapshot: [`.agents/evidence/imp205_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp205_snapshot.json) (executed: true, 19 contract tests passed, 5 files verified, 1888 total LOC).
- **Toàn bộ hệ thống**:
  * Vitest Server Suite: **52/52 test files (676 tests) PASS 100%**.
  * TypeScript compiler (`tsc --noEmit`): **0 errors, 0 warnings**.
  * Bất biến SSOT đã ghi nhận:
    - Invariant 4 tại Pillar I ([`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md)): *"Unbuilt Countdown Teardown SSOT"*.
    - Invariant 6 tại Pillar II ([`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md)): *"Auction Clean Title & Senior Treasury Payoff SSOT"*.
  * Sổ cái tiến độ đã cập nhật: [`docs/epics/client_ui/_epic_ledger.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/epics/client_ui/_epic_ledger.md).

