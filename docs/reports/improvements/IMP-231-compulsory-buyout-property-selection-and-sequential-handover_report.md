# BÁO CÁO NGHIỆM THU TÍNH NĂNG IMP-231
**Tên tính năng**: Mua Lại Dự Án Tiềm Năng (Chọn Ô Đất Mục Tiêu, Xếp Hàng Tuần Tự & Server-Authoritative Clock)  
**Mã phiếu (Issue Ticket)**: IMP-231 (Kế thừa và mở rộng IMP-229)  
**Ngày hoàn thành**: 2026-09-30  
**Quy trình thực thi**: Quy Trình 4 Trạm Khép Kín (4-Station Closed-Loop Pipeline Tier 2 Full Rigor)  
**Trạng thái nghiệm thu**: ✅ HOÀN THÀNH TOÀN DIỆN (100% PASSED)

---

## 1. TỔNG QUAN VẤN ĐỀ & GIẢI PHÁP TRIỆT ĐỂ

### 1.1 Vấn Đề Gốc
Trước đây, khi người chơi rút trúng Thẻ cơ hội "Mua Lại Dự Án Tiềm Năng" (`CC_SWAP_PROJECT`):
1. **Gán cứng ô mục tiêu**: Server tự động chọn ngay ô đất C0 đầu tiên của đối thủ (`oppC0Cells[0]`). Nếu ô này quá đắt, người chơi bị tước đoạt quyền mua dù đối thủ có thể sở hữu các ô đất C0 khác vừa túi tiền.
2. **Xung đột 2 Modal**: Bảng 1 (Phiếu Cơ Hội) vừa hiện lên đã bị Bảng 2 (Mua Lại) đè lên hoặc tự động kết thúc khi hết giờ mà người chơi chưa kịp đọc và tương tác.
3. **Lệch xung nhịp & Client Auto-Decline**: Client tự động đếm ngược theo đồng hồ riêng và tự ý kích hoạt `onDecline()` khi hết giờ, gây ra tình trạng race hazard với Server Watchdog.
4. **Không lọc đất thế chấp trái phiếu**: Các ô đất đang bị khóa làm tài sản bảo đảm cho trái phiếu doanh nghiệp của đối thủ vẫn có thể bị mua đứt trái quy định.

### 1.2 Giải Pháp Triệt Để (IMP-231)
1. **Lựa Chọn Đa Mục Tiêu (Target Selection Affordance)**: Thu thập toàn bộ các ô đất C0 hợp lệ của đối thủ vào mảng `eligibleTargets: readonly BuyoutTargetOption[]`. Trên giao diện, nếu có $\ge 2$ ô, hiển thị bộ chọn `buyout-cell-selector` dạng lưới cho phép người chơi click chọn ô đất mong muốn; cập nhật tức thì giá đền bù 130%, chủ cũ và nút Mua thích ứng theo số dư ví tiền.
2. **Ưu Tiên Ô Vừa Túi Tiền (Affordable Default Target)**: Mặc định chọn ô đất mà người chơi có đủ tiền mua (`player.balance >= t.cost`) thay vì chọn mù quáng ô đầu tiên.
3. **Phân Định 2 Cấp Độ Trợ Cấp Kho Bạc Cân Xứng Cả Human Lẫn Bot (Treasury Conservation)**:
   - **Cấp 1 — Đền bù mất cơ hội thị trường (1.000 Tr. VNĐ)**: Khi đối thủ không sở hữu bất kỳ ô C0 nào hợp lệ hoặc toàn bộ đất đã bị nâng cấp/monopolized (`oppC0Cells.length === 0`), người chơi bị mất cơ hội rút thẻ do hoàn cảnh thị trường -> Nhận trợ cấp bồi thường **1.000 Tr. VNĐ** từ Kho Bạc (`treasury -= 1000, balance += 1000`).
   - **Cấp 2 — Hỗ trợ thanh khoản khó khăn (800 Tr. VNĐ)**: Khi thị trường có ô C0 hợp lệ nhưng người chơi (hoặc Bot) không đủ tiền mua ô rẻ nhất (`balance < minCost` hoặc bot không đảm bảo dự phòng an toàn $\ge 1.000$ Tr.) -> Nhận trợ cấp an ủi hỗ trợ vốn **800 Tr. VNĐ** từ Kho Bạc (`treasury -= 800, balance += 800`).
   - **Bảo toàn giao dịch mua đứt 130%**: Khi giao dịch mua đứt thành công, tiền chuyển trực tiếp P2P từ Người mua sang Người bán (`buyer -= cost, seller += cost`), Kho Bạc không can thiệp ($\Delta \text{Treasury} = 0$), bảo toàn tuyệt đối đẳng thức kinh tế $\Delta \text{Hệ Thống} = \Delta \text{Người Chơi} + \Delta \text{Kho Bạc} = 0$.
4. **Loại Trừ BĐS Thế Chấp Trái Phiếu**: `isEligibleForCompulsoryBuyout` kiểm tra `owner.bondContract?.isActive && owner.bondContract.collateralCells?.includes(cellIndex)` để loại trừ 100% đất bảo đảm trái phiếu.
5. **Xếp Hàng Tuần Tự & Nhãn CTA Rõ Ràng**: Bảng 1 (Phiếu Cơ Hội) mang nhãn CTA `'Tiến Hành Mua Lại 🤝'`. Người chơi đọc thoải mái và chỉ chuyển tiếp sang Bảng 2 khi chủ động bấm CTA hoặc click backdrop.
6. **Đồng Hồ Máy Chủ 30s & Thanh Tiến Trình Động**: Server cấp hạn ngạch 30 giây (`expiresAt = Date.now() + 30_000`). Phía client tính toán tiến trình co giãn động theo `totalMs = safeInitialMs` lúc mount. Khi hết giờ, nút Mua bị khóa thành 'Hết Thời Gian Mua', client không gọi `onDecline()`, nhường quyền timeout cho Server Watchdog.

---

## 2. HẠ TẦNG MÃ NGUỒN VẬT LÝ ĐÃ TRIỂN KHAI

| Tệp Mã Nguồn | Tầng Kiến Trúc | LOC Thực Tế | Ngân Sách Quy Định | Thay Đổi Chính |
| :--- | :--- | :---: | :---: | :--- |
| [`src/domain/compulsory_buyout.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/compulsory_buyout.ts) | Domain Pure Function | 40 | $\le 400$ LOC | Bổ sung kiểm tra loại trừ đất thế chấp trái phiếu doanh nghiệp. |
| [`src/domain/room.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts) | Domain Aggregate Model | 274 | $\le 400$ LOC | Khai báo `BuyoutTargetOption` và `eligibleTargets` trong `PendingBuyoutSession`. |
| [`src/domain/chance_card_handlers.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/chance_card_handlers.ts) | Domain FSM Handlers | 374 | $\le 400$ LOC | Thu thập `eligibleTargets`, tính `minCost`, `defaultTarget` vừa túi tiền, đồng bộ Bot path và trợ cấp Kho Bạc. |
| [`src/server/room_property_coordinator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_property_coordinator.ts) | Server Coordinator | 356 | $\le 400$ LOC | Xác thực `cellIndex` hợp lệ trong `session.eligibleTargets`, chuyển nhượng quyền sở hữu an toàn. |
| [`src/client/ui/modals/compulsory_buyout_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/compulsory_buyout_modal.tsx) | Client 2D Modal UI | 258 | $\le 500$ LOC | Bộ chọn `buyout-cell-selector`, reactive hook `playersInfo` (kèm SSR hydration guard cho test harness), dynamic progress bar, khóa kép nút Mua. |
| [`src/client/ui/modals/event_card_visuals.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/event_card_visuals.ts) | Client Visual Format | 342 | $\le 500$ LOC | Chuẩn hóa nhãn CTA `'Tiến Hành Mua Lại 🤝'` cho `CC_SWAP_PROJECT`. |
| [`src/client/ui/modals/modal_host.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/modal_host.tsx) | Client Modal Host | 494 | $\le 500$ LOC | Ghép inline prop `eligibleTargets={p.eligibleTargets}` bảo toàn ngân sách 494/500 LOC. |
| [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) | Domain Invariant Ledger | 207 | - | Ghi nhận Bất biến số 26 (Pillar V). |

---

## 3. KẾT QUẢ KIỂM TOÁN QUY TRÌNH 4 TRẠM KHÉP KÍN

```
[Kế Hoạch SSOT v3] 
        ↓
[Plan Griller (P1-P5)] → APPROVED (Khắc phục 5 điểm mù C1-C5)
        ↓
[Trạm 1: QA Tester]   → 16 Tests Contract viết trước (Chứng minh 10 RED)
        ↓
[Trạm 2: Implementer] → Mã nguồn hoàn tất, 78/78 Tests GREEN
        ↓
[Trạm 2.5: Scout]     → PASS (0 type errors, 0 dirty casts, 0 leaks, LOC safe)
        ↓
[Trạm 3: Review Funnel]
  ├── Phase 3.1 (Spec Reviewer): APPROVED (100% Spec Fidelity, 0 Scope Drift)
  ├── Phase 3.2 (Code Reviewer): APPROVED (Deep Architecture, Anti-Slop, Clean SRP)
  └── Phase 3.2 (UI Craft Reviewer): APPROVED (9.9/10, Retropoly Tactile Standard)
        ↓
[Trạm 4: Chaos Sentinel] → APPROVED (3 Physical Probes, 5/5 Mutants Killed, 90/90 Tests Pass)
```

### 3.1 Chi Tiết Phê Duyệt Của Các Trạm
- **Trạm 1 (QA Tester)**: Đã thiết kế bộ kiểm thử hợp đồng `tests/client/imp231_compulsory_buyout_property_selection.test.ts` gồm 16 atomic tests theo Universal 5-Facet Matrix. Đã chứng minh 10 ca kiểm thử thất bại (RED) vì đúng lý do thiếu hụt nghiệp vụ trước khi triển khai.
- **Trạm 2 (Implementer)**: Đã thực thi mã nguồn tinh gọn trên 7 tệp mục tiêu, xóa sạch 10 điểm RED, đưa toàn bộ suite lên 16/16 tests PASS và 62/62 tests hồi quy PASS.
- **Trạm 2.5 (Fast Pre-Filter Scout)**: Quét 5 nhóm lỗi phổ biến, `tsc --noEmit` đạt 0 lỗi, toàn bộ tệp tuân thủ nghiêm ngặt ngân sách LOC và không chứa dirty cast `as any`.
- **Trạm 3 - Pha 3.1 (Spec Reviewer)**: Đối soát 11 tiêu chí nghiệp vụ và 8 nhiệm vụ cụ thể, xác nhận 100% khớp với kế hoạch v3, không có hiện tượng trôi dạt phạm vi (Zero Scope Drift).
- **Trạm 3 - Pha 3.2 (Code Reviewer)**: Đánh giá cao tính đóng gói sâu (Deep Module), tuân thủ CQS, bảo toàn đẳng thức Kho Bạc, loại bỏ triệt để rò rỉ timer và race hazard.
- **Trạm 3 - Pha 3.2 (UI Craft Reviewer)**: Chấm điểm **9.9 / 10** cho công thái học 2D, trải nghiệm chạm 44-48px trên mobile 360px, bóng đổ khối xúc giác Retropoly `shadow-[0_4px_0_0_#...]` và chuyển tiếp tuần tự êm ái.
- **Trạm 4 (Chaos Sentinel)**: Đã thực hiện 3 physical probes tại `tests/probes/imp231_chaos_sentinel_probes.test.ts`. Tiêu diệt 100% (5/5) mutants nhân tạo, ký duyệt snapshot evidence tại `.agents/evidence/chaos_sentinel_imp231.json`.

---

## 4. MA TRẬN 16 CA KIỂM THỬ HỢP ĐỒNG (TEST TRACEABILITY MATRIX)

| Mã Ca Kiểm Thử | Khía Cạnh Hành Vi (Facet) | Nội Dung Kiểm Thử Nghiệp Vụ | Trạng Thái |
| :--- | :--- | :--- | :---: |
| `[TC-231.01/MSS]` | Facet 1: Server Gathering | `handleSwapProject` thu thập toàn bộ các ô C0 hợp lệ của đối thủ vào `eligibleTargets`. | ✔️ PASS |
| `[TC-231.02/MSS]` | Facet 1: Default Target | `defaultTarget` ưu tiên chọn ô đất vừa túi tiền người chơi (`balance >= cost`). | ✔️ PASS |
| `[TC-231.03/MSS]` | Facet 1: Coordinator Target | `coordExecuteCompulsoryBuyout` chuyển nhượng thành công ô được chọn trong `eligibleTargets` và bảo toàn Kho Bạc (`expect(room.treasury).toBe(initialTreasury)`). | ✔️ PASS |
| `[TC-231.04/MSS]` | Facet 1: Rejection Guard | `coordExecuteCompulsoryBuyout` từ chối ô đất không nằm trong danh mục với `INVALID_BUYOUT_SESSION`. | ✔️ PASS |
| `[TC-231.05/MSS]` | Facet 2: CTA Label | Nhãn CTA thẻ `CC_SWAP_PROJECT` trả về chính xác `'Tiến Hành Mua Lại 🤝'`. | ✔️ PASS |
| `[TC-231.06/MSS]` | Facet 2: Reading Hold | Bảng 1 `EventCardModal` giữ nguyên cho đọc và chỉ mở Bảng 2 khi người chơi bấm CTA. | ✔️ PASS |
| `[TC-231.07/MSS]` | Facet 2: Backdrop Transition | Click backdrop trên `EventCardModal` chuyển tiếp an toàn sang Bảng 2, chống deadlock kẹt lượt. | ✔️ PASS |
| `[TC-231.08/MSS]` | Facet 3: Selector Auto-Hide | Khối `buyout-cell-selector` tự động ẩn khi `eligibleTargets` có $\le 1$ ô đất. | ✔️ PASS |
| `[TC-231.09/MSS]` | Facet 3: Selector Grid | Khối `buyout-cell-selector` hiển thị dạng lưới responsive khi `eligibleTargets` có $\ge 2$ ô đất. | ✔️ PASS |
| `[TC-231.10/MSS]` | Facet 3: Dynamic Feedback | Click chọn ô khác lập tức cập nhật giá đền bù 130%, tên ô và tên chủ sở hữu cũ. | ✔️ PASS |
| `[TC-231.11/MSS]` | Facet 4: Solvency Affordance | Nút Mua tự động chuyển giữa enabled/disabled khi click chọn qua lại giữa ô rẻ và ô đắt. | ✔️ PASS |
| `[TC-231.12/MSS]` | Facet 4: Shortfall Notice | Cảnh báo thiếu tiền tự động cập nhật số tiền thiếu theo ô đất đang được lựa chọn. | ✔️ PASS |
| `[TC-231.13/MSS]` | Facet 4: Intent Emission | Bấm Mua Lại kích hoạt `onBuyout` mang chính xác `cellIndex` của ô đang được chọn. | ✔️ PASS |
| `[TC-231.14/MSS]` | Facet 5: Zero Auto-Decline | Khi timer đếm về 0s, `onDecline` không bị gọi, nút Mua bị khóa thành 'Hết Thời Gian Mua'. | ✔️ PASS |
| `[TC-231.15/MSS]` | Facet 5: SSR Headless Safety | Kết xuất SSR headless với `eligibleTargets` đa dạng chạy trơn tru không ném lỗi. | ✔️ PASS |
| `[TC-231.16/MSS]` | Facet 5: Bond Filter Guard | Các ô đất thế chấp trái phiếu bị `isEligibleForCompulsoryBuyout` loại bỏ 100%. | ✔️ PASS |

---

## 5. BẤT BIẾN MIỀN ĐÃ GHI NHẬN (SSOT GOTCHAS)
Đã cập nhật Bất Biến Miền số 26 vào [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md#L190-L195):
> **Compulsory Buyout Target Selection & Dual-Symmetric Subsidy [IMP-231]**:
> - **Lọc phong tỏa trái phiếu & Bộ chọn C0**: Loại trừ 100% ô đất thế chấp trái phiếu khỏi danh sách mua lại; thu thập `eligibleTargets` và ưu tiên gán mặc định ô vừa túi tiền; gia hạn phiên 30s.
> - **Phân định 2 mức trợ cấp Kho Bạc**:
>   * Mức 1.000 Tr.: Đền bù mất cơ hội thị trường khi không có ô C0 hợp lệ nào (`oppC0Cells.length === 0`).
>   * Mức 800 Tr.: Trợ cấp hỗ trợ thanh khoản khi người chơi/bot không đủ tiền mua ô rẻ nhất (`balance < minCost`).
> - **Bảo toàn Kho Bạc trong chuyển nhượng P2P 130%**: Người mua trả 130% và Người bán nhận 130%, Kho Bạc không thu phí hay can thiệp ($\Delta \text{Treasury} = 0$), bảo toàn tổng tài sản kinh tế hệ thống.
> - **Server Coordinator xác thực chặt chẽ**: Kiểm tra `cellIndex` nằm trong `session.eligibleTargets`, ngăn chặn gian lận gửi `cellIndex` tùy ý.
> - **SSR Hydration Guard cho Test Harness**: Trong browser component reactive 100% qua Zustand hook selector; trong môi trường SSR test headless fallback đọc snapshot `getState().playersInfo` để vượt qua cơ chế `getServerSnapshot` rỗng của React `useSyncExternalStore`.

---

## 6. KẾT LUẬN & ĐỀ XUẤT TIẾP THEO
Tính năng **IMP-231** đã giải quyết triệt để vấn đề người dùng phản ánh:
- Không còn hiện tượng 2 bảng thông báo đè lên nhau gây giật cục.
- Người chơi có toàn quyền đọc thẻ cơ hội thong thả và chủ động lựa chọn ô đất muốn mua lại với giá 130%.
- Toàn bộ 90/90 bài kiểm thử (contract + probes + regression) đều vượt qua xuất sắc.

Sẵn sàng chuyển sang giải quyết **Vấn đề số 2** (Đang đấu giá cao nhất thoát ra bị báo lỗi `highest_bidder cannot pass`).
