# Báo Cáo Cải Tiến IMP-192C: Đòn Bẩy Trái Phiếu Doanh Nghiệp & Sàn Đấu Giá Phát Mãi Có Hàng Đợi (Corporate Bond & Queued Fire Sale)

## 1. Tổng Quan & Mục Tiêu Kỹ Thuật
- **Mã Ticket**: `IMP-192C` (Lát cắt 3/3 hoàn tất bộ cải tiến gameplay kinh tế đời thực IMP-192).
- **Mục tiêu**:
  - **Đòn bẩy Trái Phiếu Doanh Nghiệp (Corporate Bond)**: Cho phép người chơi đủ điều kiện huy động vốn khẩn cấp bằng 80% Net Worth (kỳ hạn 3 vòng, nợ hoàn trả gốc + 20% lãi nộp Kho Bạc) có thế chấp bằng toàn bộ danh mục BĐS chưa thế chấp hiện có.
  - **Chống Trục Lợi Bằng Trái Phiếu Rỗng (Naked Bond Exploit Defense)**: Yêu cầu tối thiểu Net Worth $\ge 3.000$ Tr., sở hữu $\ge 2$ BĐS chưa thế chấp và tổng giá trị BĐS đảm bảo phải đạt ít nhất 50% khoản vay (`BOND_MIN_COLLATERAL_RATIO = 0.50`).
  - **Khóa Toàn Diện Tài Sản Đảm Bảo (Comprehensive Collateral Lock)**: Chặn đứng mọi hành vi tẩu tán tài sản đảm bảo: cấm thế chấp vay thêm (`ActionRejectReason.BOND_COLLATERAL_LOCKED`), cấm chuyển nhượng thỏa thuận P2P (cả bên bán lẫn bên đổi tài sản `offeredCellIndex`), cấm bị cưỡng chế mua lại (Compulsory Buyout).
  - **Khấu Trừ Cưỡng Chế Tiền Mặt & Thu Hồi Đất (Anti-Strategic Default)**: Khi con nợ vỡ nợ (đáo hạn không đủ tiền hoàn trả), máy chủ tự động tịch thu toàn bộ tiền mặt khả dụng hiện có nộp Kho Bạc trước, sau đó thu hồi 100% BĐS đảm bảo nạp vào hàng đợi phát mãi `fireSaleQueue`.
  - **Sàn Đấu Giá Phát Mãi 0 Đồng & Chuỗi Tuần Tự (Chained Fire Sale Arena)**: Hỗ trợ mức khởi điểm 0 Tr. (`Bắt Đáy 0 Tr.`), cấm con nợ tham gia đấu giá tài sản của chính mình (`DECLINED_PLAYER_CANNOT_BID`), thu hồi đất về Kho Bạc khi tất cả người chơi bỏ cuộc (`All Passed`), tự động chuyển tiếp các tài sản tiếp theo trong hàng đợi và chuyển lượt (`advanceTurnToNextPlayer`) mượt mà khi hàng đợi cạn.
  - **Thực Thi Quyền Ưu Tiên Tối Cao (Senior Lien Priority) Trong Phá Sản Chéo**: Khi con nợ bị đối thủ làm phá sản, Kho Bạc thu hồi toàn bộ BĐS đảm bảo trái phiếu trước để đưa vào đấu giá phát mãi; chỉ những BĐS dôi dư không bị khóa bond mới được chuyển sang cho chủ nợ người chơi.
  - **Bảo Vệ Trần Cứng Dòng Mã (LOC Tiers)**: Tách riêng `portfolio_tab_header.tsx` (35 LOC) và `bond_issuance_tab.tsx` (74 LOC), giữ `property_portfolio_modal.tsx` ở mức **494 LOC** (ngưỡng cứng $\le 500$ LOC); `room_manager.ts` ở mức **526 LOC** (ngưỡng cứng $\le 550$ LOC).

---

## 2. Chi Tiết Thực Thi & Tệp Sửa Đổi
1. **[`src/domain/bond_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/bond_types.ts)** (Mới, 15 LOC, Tier 1 $\le 400$ LOC):
   - Định nghĩa interface `BondContract` và các hằng số: `BOND_MIN_NET_WORTH = 3000`, `BOND_MIN_PROPERTIES = 2`, `BOND_LOAN_RATIO = 0.80`, `BOND_INTEREST_RATE = 0.20`, `BOND_DURATION_ROUNDS = 3`, `BOND_MIN_COLLATERAL_RATIO = 0.50`.
2. **[`src/domain/room.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts)** (251 LOC, Tier 1 $\le 400$ LOC):
   - Mở rộng `Player`: `bondContract?: BondContract | null;`.
   - Mở rộng `Room`: `fireSaleQueue?: number[];`.
3. **[`src/domain/action_reasons.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/action_reasons.ts)** & **[`src/server/network/network_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/network_types.ts)**:
   - Thêm `BOND_COLLATERAL_LOCKED`, `BOND_NOT_ELIGIBLE`, `BOND_ALREADY_ACTIVE`.
   - Mở rộng `AuctionPayload`: thêm `readonly isFireSale?: boolean;`.
4. **[`src/domain/i18n/vi.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/i18n/vi.ts)**:
   - Dịch thuật tiếng Việt cho các lý do từ chối liên quan đến trái phiếu và tài sản thế chấp.
5. **[`src/server/bond_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/bond_manager.ts)** (Mới, 171 LOC, Tier 1 $\le 400$ LOC):
   - `validateIssueBond`: Thẩm định điều kiện phát hành (Net Worth, số BĐS, tỷ lệ tài sản đảm bảo).
   - `handleIssueBond`: Cấp vốn, ghi nhận nợ gốc + lãi, khóa tài sản đảm bảo.
   - `handleRepayBond`: Tất toán chủ động, nộp lãi Kho Bạc, giải phóng tài sản đảm bảo.
   - `processBondTurnTransition`: Đếm lùi `roundsLeft`, tất toán tự động khi đáo hạn hoặc xử lý vỡ nợ (khấu trừ tiền mặt, nạp BĐS vào `fireSaleQueue` và mở đấu giá phát mãi).
   - `handleStartFireSaleAuction`: Khởi tạo phiên đấu giá phát mãi với cờ `isFireSale: true`, khởi điểm 0 Tr.
6. **[`src/server/turn_loop.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/turn_loop.ts)** (271 LOC, Tier 1 $\le 400$ LOC):
   - Xuất hàm helper `advanceTurnToNextPlayer(room, rng)` dùng chung.
   - Tích hợp `processBondTurnTransition` vào `executeTurnEnd`, chặn chuyển lượt khi bước vào `AuctionPhase` và reset `rolledThisTurnMap`.
7. **[`src/server/auction_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/auction_manager.ts)** (239 LOC, Tier 1 $\le 400$ LOC):
   - `handleAuctionBid`: Cho phép mức trả giá 0 Tr. khi `isFireSale` và chưa ai đặt giá.
   - `handleAuctionClose`: Xử lý nộp tiền vào Kho Bạc, dọn dẹp BĐS về Kho Bạc khi All Passed, điều phối tuần tự `fireSaleQueue` và gọi `advanceTurnToNextPlayer` khi hàng đợi cạn.
8. **[`src/server/mortgage_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/mortgage_manager.ts)** (265 LOC, Tier 1 $\le 400$ LOC):
   - `validateMortgage`: Chặn thế chấp BĐS đang là tài sản đảm bảo trái phiếu.
9. **[`src/server/room_property_coordinator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_property_coordinator.ts)** (360 LOC, Tier 1 $\le 400$ LOC) & **[`src/server/property_actions.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/property_actions.ts)** (359 LOC, Tier 1 $\le 400$ LOC):
   - Chặn giao dịch P2P đối với BĐS đang khóa bond ở cả bên bán lẫn bên đổi tài sản (`offeredCellIndex`).
   - Chặn cưỡng chế thu mua Compulsory Buyout trên ô đất khóa bond.
10. **[`src/server/insolvency_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/insolvency_manager.ts)** (285 LOC, Tier 1 $\le 400$ LOC):
    - Thực thi Senior Lien trong `declareBankruptcy`: thu hồi BĐS đảm bảo vào `fireSaleQueue` trước khi chuyển tài sản dôi dư cho chủ nợ dân sự; kích hoạt đấu giá phát mãi ngay lập tức.
11. **[`src/server/intent_dispatcher.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/intent_dispatcher.ts)** (108 LOC, Tier 1 $\le 400$ LOC):
    - Đăng ký `INTENT_ISSUE_BOND` và `INTENT_REPAY_BOND`.
12. **[`src/server/session_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts)** & **[`src/server/network/delta_broadcaster.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/delta_broadcaster.ts)**:
    - Serialize `bondContract` (hỗ trợ tombstone `null`) và `isFireSale` qua delta broadcaster.
13. **[`src/client/network/apply_delta_players.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta_players.ts)** & **[`src/client/store/game_store_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store_types.ts)**:
    - Thêm `'bondContract'` vào `OPTIONAL_PLAYER_KEYS` và `PlayerHudInfo`.
14. **[`src/server/room_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts)** (526 LOC, Tier 1 $\le 550$ LOC):
    - Thêm phương thức `syncAuction(roomCode)` đồng bộ state đấu giá phòng; điều phối intent trái phiếu sang `bond_manager.ts`.
15. **Client UI & Modal Components**:
    - [`src/client/ui/modals/portfolio_tab_header.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/portfolio_tab_header.tsx) (Mới, 35 LOC, $\le 400$ LOC): Header chuyển tab linh hoạt kèm huy hiệu cảnh báo trái phiếu đang hoạt động.
    - [`src/client/ui/modals/bond_issuance_tab.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/bond_issuance_tab.tsx) (Mới, 74 LOC, $\le 400$ LOC): Giao diện quản lý trái phiếu, hiển thị các chỉ số cốt lõi và nút bấm hành động.
    - [`src/client/ui/modals/property_portfolio_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/property_portfolio_modal.tsx) (494 LOC, $\le 500$ LOC): Tích hợp phân tab danh mục BĐS / Trái phiếu, bảo vệ thành công ngân sách dòng mã.
    - [`src/client/ui/modals/modal_helpers.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/modal_helpers.ts) & [`src/client/ui/modals/auction_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/auction_modal.tsx): Nút `Bắt Đáy (0 Tr.)` hiển thị xúc giác khi sàn phát mãi chưa có người đặt giá.
16. **[`tests/contracts/imp192c_corporate_bond_fire_sale.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp192c_corporate_bond_fire_sale.test.ts)** (509 LOC, $\le 600$ LOC Living Test):
    - 22 atomic tests độc lập bao phủ 7 Facets kỹ thuật và Invariant Defense.

---

## 3. Kết Quả Kiểm Thử Vật Lý & Linter
- **Contract Tests**:
  - `tests/contracts/imp192c_corporate_bond_fire_sale.test.ts`: **22/22 PASS** (100%).
- **Full Test Suite Regression Check**:
  - `npm test`: **321/321 test files PASS**, **6.451/6.451 tests PASS** (0 regressions).
- **TypeScript Compiler Check**:
  - 100% 24 tệp liên quan đến IMP-192C không có lỗi biên dịch kiểu (0 errors).
- **UI Linter Check**:
  - `npm run lint:ui`: **0 vi phạm** trên 181 tệp client (Sạch hoàn toàn 4 anti-patterns).
- **LOC Budget Verification**:
  - `room_manager.ts`: **526 LOC** ($\le 550$ LOC).
  - `property_portfolio_modal.tsx`: **494 LOC** ($\le 500$ LOC).
  - Tất cả các tệp Tier 1: $\le 400$ LOC.

---

## 4. Đánh Giá Trạm 3 (Station 3 Reviewers Sign-Off)
- **`spec-reviewer`**: **APPROVED** (100% đối soát tam giác giữa Plan, Code trên đĩa vật lý và Test Hợp đồng).
- **`code-reviewer`**: **APPROVED** (Kiểm tra chất lượng mã nguồn, anti-slop, zero dirty casts, telemetry và an toàn kiểu dữ liệu).
- **`ui-craft-reviewer`**: **APPROVED (`ship`)** (Kiểm tra tiêu chuẩn 2D Impeccable Craft, responsive 360px, nút Bắt Đáy 0 Tr. và phân tab danh mục).

---

## 5. Kết Luận & Đóng Gói IMP-192
Ticket `IMP-192C` chính thức hoàn tất, khép lại trọn vẹn toàn bộ Sử thi Cải Tiến Kinh Tế Đời Thực (**IMP-192: Real-World Economic Engine** gồm 3 lát cắt IMP-192A, IMP-192B, IMP-192C). Đã ghi nhận Gotcha #265 vào Sổ cái Bất biến (`docs/domain/gotchas.md`) và cập nhật Lộ trình Tổng thể (`docs/master_roadmap.md`).
