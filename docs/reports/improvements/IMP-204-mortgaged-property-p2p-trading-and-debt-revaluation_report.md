# [REPORT] IMP-204: Giao Dịch P2P Bất Động Sản Đang Cầm Cố & Định Giá Lại Nghĩa Vụ Nợ (Mortgaged Property P2P Trading & Debt Re-Valuation)

## 1. THÔNG TIN TỔNG QUAN
- **Mã Ticket**: IMP-204
- **Tiêu Đề**: Mortgaged Property P2P Trading & Debt Re-Valuation (Cho phép chuyển nhượng BĐS đang thế chấp kèm nghĩa vụ nợ, định giá lại giá sàn 35%, Bot AI chiết khấu nợ và giao diện Net Equity)
- **Phân Hạng**: Tier 2 (Full Rigor) — Đã hoàn thành 3 Trạm (Station 1 RED $\rightarrow$ Station 2 GREEN $\rightarrow$ Station 2.5 Scout $\rightarrow$ Station 3 Independent Review).
- **Trạng Thái**: COMPLETE (HOÀN TẤT 100%)

---

## 2. NGUYÊN NHÂN CỐT LÕI & GIẢI PHÁP
- **Yêu cầu nghiệp vụ**:
  Trong đời thực và các bộ luật thương mại, bất động sản đang thế chấp vay ngân hàng vẫn được phép chuyển nhượng, người mua sẽ tiếp nhận nghĩa vụ nợ (Loan Assumption) và giá trị giao dịch được định giá lại theo vốn chủ sở hữu ròng (Net Equity = Giá trị tài sản - Khoản nợ thế chấp). Trước đây VTCoOn chặn hoàn toàn mọi giao dịch P2P đối với BĐS thế chấp (`PROPERTY_MORTGAGED`).
- **Giải pháp toàn diện**:
  1. **Tầng Server & Di dời nợ nguyên tử**:
     - Thêm helper `transferMortgageDebt` di dời khoản vay (`mortgageLoans`) và danh mục thế chấp (`mortgagedProperties`) từ Seller sang Buyer trong `executeP2PTrade` (áp dụng cho cả 1-way trade và Swap 2 chiều).
     - Hạ giá sàn P2P cho BĐS thế chấp từ 70% xuống **35% giá niêm yết** (`price * 0.35`).
     - Bỏ rào chặn `PROPERTY_MORTGAGED` trong `checkTradeParties`, bảo toàn 100% rào chắn trái phiếu (`BOND_COLLATERAL_LOCKED`).
  2. **Tầng Điều Phối & Subtractive Refactoring**:
     - Hợp nhất nhánh 1-way trade trong `room_property_coordinator.ts` ủy quyền 100% cho `executeP2PTrade`, loại bỏ 36 dòng code trùng lặp tính thuế và balance, giảm kích thước file xuống 345 LOC (an toàn dưới trần 400 LOC).
  3. **Tầng Trí Tuệ Nhân Tạo Bot**:
     - Mở rộng `MonopolyGap` mang theo `isMortgaged` và `mortgageLoan`.
     - Bot AI nhận diện ô thế chấp để hoàn tất độc quyền, tự động khấu trừ chi phí chuộc đất (`loan * 1.10`) khỏi giá đề xuất mua và cộng thêm đệm thanh khoản vào `safetyBuffer`.
     - Khi Bot bán ô thế chấp, ngưỡng chấp nhận giá tự động giảm tương ứng với khoản vay đã giải ngân.
  4. **Tầng Giao Diện 2D & Công Thái Học 360px**:
     - Mở khóa thẻ BĐS thế chấp trong `TradeColumn` (bỏ `disabled`).
     - Hiển thị badge nợ sắc nét `⚠️ Nợ -{formatCurrency(loan)} (Thế chấp)` với `flex-wrap: wrap` chống tràn trên di động 360px.
     - `TradeModal` tính toán **Net Equity** để Deal Balance HUD và các nút phím tắt giá phản ánh chính xác cán cân thương vụ.

---

## 3. FILE MUTATION & LOC COMPLIANCE (ĐĨA VẬT LÝ)

| File | Hành Động | LOC Thực Tế | Ngân Sách Trần | Kết Quả |
| :--- | :---: | :---: | :---: | :---: |
| `src/server/property_actions.ts` | SỬA ĐỔI | 385 | <= 400 | ĐẠT (Tier 1) |
| `src/server/room_property_coordinator.ts` | SỬA ĐỔI | 345 | <= 400 | ĐẠT (Tier 1 Subtractive) |
| `src/domain/bot/bot_trade.ts` | SỬA ĐỔI | 252 | <= 400 | ĐẠT (Tier 1) |
| `src/domain/bot/bot_monopoly_utils.ts` | SỬA ĐỔI | 73 | <= 400 | ĐẠT (Tier 1) |
| `src/domain/bot/bot_hybrid_trade.ts` | KHÔNG ĐỔI | 291 | <= 400 | ĐẠT (Tier 1) |
| `src/client/ui/modals/trade_modal.tsx` | SỬA ĐỔI | 288 | <= 500 | ĐẠT (Tier 2 UI) |
| `src/client/ui/modals/trade/trade_column.tsx` | SỬA ĐỔI | 236 | <= 500 | ĐẠT (Tier 2 UI) |
| `tests/contracts/imp204_mortgaged_property_p2p_trading.test.ts` | TẠO MỚI | 410 | <= 600 | ĐẠT |
| `tests/contracts/imp146_p2p_property_swap_and_negotiation_parity.test.ts` | CẬP NHẬT | 419 | <= 600 | ĐẠT (Spec Evolution) |
| `tests/server/p2p_trade.test.ts` | CẬP NHẬT | 326 | <= 600 | ĐẠT (Spec Evolution) |

---

## 4. KẾT QUẢ KIỂM THỬ & CHỨNG NHẬN TRẠM (STATION AUDIT)
- **Station 1 (RED Contract Test)**: `qa-tester` tạo 22 atomic tests (Universal 5-Facet Matrix) và cập nhật 3 tests cũ (Specification Evolution), chứng minh thất bại (22 failed | 45 passed, Business RED for the right reasons).
- **Station 2 (GREEN Implementation)**: `implementer` viết mã nguồn tối thiểu, lật thành công 22/22 tests PASS (100% GREEN).
- **Station 2.5 (Sweeping Scout Audit)**: `scout` quét sạch 5 archetypes khuyết tật trên 6 file vật lý $\rightarrow$ Phán quyết: PASS.
- **Station 3 (Independent Review)**:
  * `spec-reviewer`: **SPEC_PASS** (100% đối chiếu đặc tả không trôi dạt).
  * `ui-craft-reviewer`: **SHIP** (0 lỗi vật lý, layout 360px vững chắc, 0 vi phạm linter).
- **Toàn bộ hệ thống**:
  * Vitest Suite: **67/67 tests PASS** trong các file kiểm thử liên quan (`imp204`, `imp146`, `p2p_trade`).
  * UI Linter (`npm run lint:ui`): **0 anti-patterns across 195 files**.
  * TypeScript compiler (`tsc --noEmit`): **0 errors, 0 warnings**.
  * Automated Evidence Snapshot: `.agents/evidence/imp-204_snapshot.json` (executed: true, passedCount: 22).
  * Domain Invariant: Đã lưu **Gotcha #5 tại Pillar II** vào [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md): *"Mortgaged Property P2P Debt Migration SSOT"*.
