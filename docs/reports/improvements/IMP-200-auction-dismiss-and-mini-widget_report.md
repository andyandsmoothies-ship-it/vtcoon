# BÁO CÁO NGHIỆM THU CẢI TIẾN KỸ THUẬT: IMP-200
**Mã số Ticket**: IMP-200  
**Tiêu đề**: Cho Phép Thu Nhỏ / Tạm Đóng Trang Đấu Giá Cho Người Chơi Không Liên Quan & Widget Đấu Giá Mini (Non-Involved Player Auction Modal Dismissal & Mini Auction Floating Widget)  
**Thời gian hoàn thành**: 2026-09-26  
**Trạng thái**: **HOÀN THÀNH — PRODUCTION READY**  
**Evidence Snapshot**: `.agents/evidence/imp200_snapshot.json`  

---

## 1. TỔNG QUAN TICKET & MỤC TIÊU ĐẠT ĐƯỢC

Ticket IMP-200 giải quyết triệt để vấn đề người chơi bị kẹt trong modal đấu giá khi không có nhu cầu hoặc không liên quan:
1. **Quyền đóng / thu nhỏ modal đấu giá cho người chơi không liên quan**:
   - Người chơi đã rút lui (`hasPassed = true`), người từ chối mua đất dẫn tới phát mãi (`declinedPlayerId === myId`), con nợ bị phát mãi tài sản (`insolvencyPlayerId === myId`), người chơi phá sản, hoặc phiên đã gõ búa kết thúc (`isConcluded`) đều có quyền đóng modal qua nút '✕' trên header, nút 'Đã Rút Lui • Đóng', 'Đóng / Xem Bàn Cờ', hoặc click backdrop ngoài modal (`isAuctionDismissible = true`).
   - Active bidder (đang trực tiếp tranh thầu) được bảo vệ chống bấm nhầm backdrop (`dismissible = false`), nhưng vẫn có thể chủ động bấm nút '✕' trên header để thu nhỏ xem bàn cờ.
2. **Widget Đấu Giá Mini (`MiniAuctionStrip`) nổi trên HUD**:
   - Khi sàn đấu giá bị thu nhỏ, dải trạng thái mini xuất hiện thanh lịch ngay phía trên `ActionDock`.
   - Hiển thị đầy đủ 5 thông tin cốt lõi: Biểu tượng 🏛️, Tên BĐS (với `truncate min-w-0`), Giá thầu hiện tại (`formatCurrency`), Người dẫn đầu (`👑 formatShortPlayerName`), và Huy hiệu đếm ngược (`timeRemaining`s font mono).
   - Nút bấm `[👁️ Mở Lại]` (`restoreAuction()`) giúp người chơi mở lại sàn đấu giá tức thì bất kỳ lúc nào với 1 cú click.
3. **Subtractive Refactoring & Triệt Tiêu Dual SSOT Mechanism**:
   - Xóa bỏ 100% biến module closure `let lastDismissedAuctionKey` cũ trong `src/client/network/apply_delta.ts`.
   - Quy tụ toàn bộ quyền quyết định dismiss về Zustand store (`state.dismissedAuctionCellIndex`).
   - Xóa bỏ định nghĩa partial inline cũ của `auction?` trong `game_store_types.ts`, thay thế bằng SSOT duy nhất `ModalPayloadMap['auction']`.
4. **Authoritative Resync & Chống Lệch Giờ Client (Drift Immunity)**:
   - `MiniAuctionStrip` có `useEffect` đồng bộ `displaySeconds` từ `auction.timeRemaining` mỗi khi server delta cập nhật, loại bỏ hoàn toàn hiện tượng client drift sau reconnect hoặc network jitter.
   - Khi reconnect full-sync (`isFullSync`), `apply_delta.ts` tự động reset `dismissedAuctionCellIndex = null` để người chơi thấy lại sàn đấu giá.
5. **Turn N+1 & Fire Sale Teardown Guard**:
   - Khi `delta.auction === null` hoặc `turnPhase !== TurnPhase.AuctionPhase`, tự động dọn sạch `auction: null` và `dismissedAuctionCellIndex: null`.
   - Trong hàng đợi phát mãi liên hoàn (Fire Sale), khi chuyển sang ô đất mới (`delta.auction.cellIndex !== state.dismissedAuctionCellIndex`), cờ dismiss cũ tự động reset để ô đất mới mở bình thường.

---

## 2. BẢNG ĐỐI SOÁT NGÂN SÁCH DÒNG MÃ (LOC TIERS)

| Tệp Mã Nguồn / Test | Phân Tầng LOC | Ngân Sách | Thực Tế (Raw) | Delta LOC | Tình Trạng |
| :--- | :--- | :--- | :--- | :---: | :--- |
| `src/client/ui/action_dock.tsx` | Tier 1 (Core Action) | $\le 400$ | **396** | **-1** | **ĐẠT (Dưới trần 400 LOC)** |
| `src/client/ui/modals/modal_host.tsx` | Tier 2 (Host Router) | $\le 500$ | **475** | **0** | **ĐẠT (Dưới trần 500 LOC)** |
| `src/client/store/game_store.ts` | Tier 1 (Domain Store) | $\le 400$ | **394** | **+23** | **ĐẠT** |
| `src/client/network/apply_delta.ts` | Tier 1 (Network Sync) | $\le 400$ | **287** | **+15** | **ĐẠT (Subtractive Clean)** |
| `src/client/ui/modals/mini_auction_strip.tsx` | Tier 2 (Floating Widget) | $\le 500$ | **87** | **+87** | **ĐẠT (Module Mới)** |
| `src/client/ui/hud_container.tsx` | Tier 2 (Layout Host) | $\le 500$ | **129** | **+2** | **ĐẠT** |
| `src/client/ui/modals/modal_helpers.ts` | Tier 2 (Pure Helpers) | $\le 500$ | **357** | **+18** | **ĐẠT** |
| `src/client/store/game_store_types.ts` | Types / Config | $\le 800$ | **372** | **+3** | **ĐẠT (SSOT Uniform)** |
| `tests/contracts/imp200_auction_dismiss_and_mini_widget.test.ts` | Contract Test Suite | $\le 600$ | **415** | **+415** | **ĐẠT (17 Atomic Tests)** |

---

## 3. KẾT QUẢ KIỂM THỬ & XÁC THỰC KỸ THUẬT

1. **Hợp đồng kiểm thử mới (Contract Tests)**:
   - `tests/contracts/imp200_auction_dismiss_and_mini_widget.test.ts`: **17/17 atomic tests PASS (100%)** bao phủ 5 Facets:
     * Facet 1 (Store Lifecycle & User Dismiss State): TC-200.01 - TC-200.04 (4/4 PASS).
     * Facet 2 (apply_delta Idempotence & Anti-Popup Invariant): TC-200.05 - TC-200.08 (4/4 PASS).
     * Facet 3 (Transient Teardown & Fire Sale Safety): TC-200.09 - TC-200.11 (3/3 PASS).
     * Facet 4 (ModalHost Backdrop & Non-Involved Dismissibility): TC-200.12 - TC-200.14 (3/3 PASS).
     * Facet 5 (MiniAuctionStrip Visual Projection & Authoritative Resync): TC-200.15 - TC-200.17 (3/3 PASS).
2. **Kiểm thử hồi quy bảo toàn (Living Suites & Regressions)**:
   - `tests/server/imp160_ghost_auction_modal_and_lifecycle_hardening.test.ts`: **16/16 tests PASS (100%)**.
   - `tests/contracts/constitution_governance.test.ts`: **13/13 tests PASS (100%)**.
3. **Toàn bộ Suite Codebase**:
   - `npm test`: **336 test files passed, 6.723 tests passed, 0 failures (100% GREEN)**.
4. **Kiểm tra Linters & Compiler**:
   - `npm run lint:ui`: **0 Anti-patterns vi phạm trên 191 files UI**.
   - `npx tsc --noEmit`: **0 type errors**.

---

## 4. BẰNG CHỨNG THỊ GIÁC (VISUAL AUDIT EVIDENCE)

| Tệp Ảnh Bằng Chứng | Viewport | Nội Dung Kiểm Tra | Kết Quả Visual Spot-Inspection |
| :--- | :--- | :--- | :---: |
| `imp200_01_desktop_1920_auction_modal.jpg` | Desktop 1920x1080 | Full Auction Modal có nút ✕ thu nhỏ | ✔️ Nút ✕ tròn amber nổi bật góc trên phải |
| `imp200_02_desktop_1920_mini_auction_strip.jpg` | Desktop 1920x1080 | `MiniAuctionStrip` trên HUD ActionDock | ✔️ Bàn cờ 3D thông thoáng, strip căn phải hoàn hảo |
| `imp200_03_desktop_1920_portfolio_while_auction.jpg` | Desktop 1920x1080 | Mở Portfolio khi đấu giá thu nhỏ | ✔️ Đa nhiệm mượt mà, modal không bị cướp focus |
| `imp200_04_mobile_390_mini_auction_strip.jpg` | Mobile 390x844 | `MiniAuctionStrip` trên Mobile iPhone | ✔️ Căn giữa cân đối, breathing room chuẩn mực |
| `imp200_05_mobile_360_mini_auction_strip.jpg` | Mobile 360x780 | `MiniAuctionStrip` trên Mobile Android hẹp | ✔️ `truncate min-w-0` hoàn hảo, 0 tràn ngang |

---

## 5. PHÁN QUYẾT TRẠM 3 (STATION 3 VERDICTS)

- **Specification Reviewer (`spec-reviewer`)**: **APPROVED** (100% khớp đặc tả kỹ thuật, thỏa mãn [F1, F5, F3, F4]).
- **Code Quality Reviewer (`code-reviewer`)**: **APPROVED** (0 dirty casts, 0 closure leaks, tuân thủ nghiêm ngặt LOC Tiers).
- **2D UI Craft Reviewer (`ui-craft-reviewer`)**: **APPROVED (disposition: ship)** (0 vi phạm anti-patterns, chất lượng thương mại).
- **Domain Memory**: Đã ghi nhận Gotcha #281 vào `docs/domain/gotchas.md`.
