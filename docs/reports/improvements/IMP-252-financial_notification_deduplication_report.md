# BÁO CÁO NGHIỆM THU HOÀN THÀNH TÍNH NĂNG (COMPLETION REPORT)
## TICKET IMP-252: Khử Trùng Lặp Thông Báo Tài Chính Qua Nhóm Giao Dịch & Bộ Lọc Góc Nhìn Chủ Thể (Financial Notification De-duplication via Transaction Grouping & Local Player Perspective)

- **Mã Ticket:** IMP-252 (Tier 2 Full Rigor)
- **Use Case Định Tuyến:** `[UC-IMP252]`, `[UC-GAME-002]`, `[UC-GAME-020]`, `[UC-GAME-028]`
- **Kế hoạch Triển Khai (SSOT):** [`.agents/plans/PLAN_IMP_252_FINANCIAL_NOTIFICATION_DEDUPLICATION.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/plans/PLAN_IMP_252_FINANCIAL_NOTIFICATION_DEDUPLICATION.md) (Revision 4.2 - Fully Hardened: Stage A & Stage B Adversarial Directives Reconciled)
- **Trạng thái:** **`[COMPLETED - 4-STATION CLOSED-LOOP CERTIFIED]`**
- **Liên kết Sổ cái Epic:** [`docs/epics/client_ui/_epic_ledger.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/epics/client_ui/_epic_ledger.md#2026-10-03-imp-252-financial-notification-de-duplication-via-transaction-grouping--local-player-perspective-khử-trùng-lặp-thông-báo-tài-chính-p2p)
- **Bằng chứng Station 4:** [`.agents/evidence/chaos_sentinel_IMP-252.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-252.json) (`executed: true`, `verdict: APPROVED`)
- **Bằng chứng Snapshot:** [`.agents/evidence/imp-252_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp-252_snapshot.json) (`contractTestsPassed: true`, 28/28 tests passed)

---

## 1. TỔNG QUAN TÍNH NĂNG & ĐỐI CHIẾU HÌNH HỌC THỰC NGHIỆM

### 1.1. Bản Chất Kỹ Thuật & Vấn Đề Gốc Rễ
Trước khi triển khai IMP-252, các giao dịch P2P đối ứng (Trả/Thu thuê đất, Thâu tóm M&A, Chuyển nhượng P2P, Miễn trừ Ngoại giao) gặp 3 bẫy lỗi kiến trúc nghiêm trọng:
1. **Phát sóng trùng lặp (Reciprocal Duplication)**: `activity_badge_dispatcher.ts` phát sóng đồng thời 2 bản tin `FloatingTextItem` (1 thẻ chi trả âm và 1 thẻ thu tiền dương). Cả 2 thẻ cùng nổi lên trên màn hình, che khuất tới 40% sa bàn 3D trên thiết bị di động.
2. **Thẻ Ma Hồi Sinh (Zombie Badge Trap)**: Nếu chỉ ẩn ở tầng CSS hoặc lọc nông ở UI, hai thẻ mang 2 ID độc lập và 2 bộ đếm `setTimeout` độc lập. Khi người chơi bấm nút ✕ đóng thẻ của mình hoặc khi timer của thẻ thứ nhất hết hạn, thẻ thứ hai bị "mất cặp" và đột ngột hồi sinh nhảy ra màn hình.
3. **M&A Thiếu Khóa Định Danh**: Bản tin thẻ sự kiện `ma_buyout` thiếu trường `targetPlayerId`, khiến tầng UI không thể nhận biết ai là đối tác giao dịch để lọc góc nhìn.

### 1.2. Cơ Chế Giải Pháp Kiến Trúc 4 Tầng
1. **Khóa Định Danh Nhóm (`groupId`)**:
   - Bổ sung `groupId?: string` vào giao diện `FloatingTextItem` (`src/client/store/game_store_types.ts`).
   - `activity_badge_dispatcher.ts` gán chung một `groupId` duy nhất cho cặp bản tin của cùng một sự kiện P2P:
     - Thuê đất: `rent_${act.id}_${payerId}_${receiverId}`
     - Thâu tóm: `ma_${act.id}` (bổ sung chính xác `targetPlayerId`)
     - Giao thương: `trade_${act.id}`
     - Ngoại giao: `diplo_${ev.cellIndex}_${ev.playerId}_${ev.landlordId}_${Date.now()}`
2. **Vòng Đời Hủy Nhóm Đồng Bộ (Store Group Teardown)**:
   - Trong `src/client/store/game_store.ts`, hàm `removeFloatingText(id)` tra cứu `groupId` của thẻ mục tiêu. Nếu tồn tại `groupId`, xóa sạch **toàn bộ** các thẻ mang chung `groupId`. Triệt tiêu 100% nguy cơ rò rỉ thẻ ma.
3. **Module Khử Trùng Lặp Thuần Túy (`notification_deduplicator.ts`)**:
   - Tạo mới `src/client/ui/notification_deduplicator.ts` (31 LOC, hàm thuần túy `deduplicateFloatingTexts`).
   - Lọc theo góc nhìn chủ thể: Nếu có Bạn tham gia (`playerId === myPlayerId`), chỉ giữ lại duy nhất thẻ của Bạn; nếu giữa 2 Bot, chỉ giữ thẻ đại diện cho dòng tiền chi trả (`FloatingTextType.Penalty`); các thẻ đơn lẻ (mua đất, nộp thuế, nhận lương) giữ nguyên 100%.
4. **Bảo Toàn Trật Tự Thời Gian & Viewport Parity**:
   - Bổ sung guard `displayItems[1]?.playerId !== myPlayerId` (DIR-ADV-03) trong `src/client/ui/floating_numbers.tsx` ngăn đảo lộn thứ tự khi cả 2 thẻ liên tiếp đều của người chơi địa phương.
   - Chuẩn hóa `bankrupt` vào danh sách `latestMilestone` với thời lượng `EVENT_BANNER_DURATION_MS` (4500ms), không để sự kiện phá sản rơi vào danh sách thẻ thường.

---

## 2. ĐỐI SOÁT NGÂN SÁCH DÒNG MÃ (LOC BUDGET RECONCILIATION)

Đo lường cơ học thực tế trên đĩa vật lý bằng `scripts/check_loc.mjs`:

| Tệp Mã Nguồn | Phân Loại Tier | Baseline Trước | LOC Sau | Non-Empty SLOC | Delta ($\Delta$) | Ngân Sách Trần | Trạng Thái Linter |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `src/client/store/game_store_types.ts` | Tier 1 (State Types) | 393 | **394** | 369 | +1 | <= 400 | ⚠️ Warning (> 300) |
| `src/client/store/game_store.ts` | Tier 1 (Store Logic) | 390 | **377** | 345 | -13 | <= 400 | ⚠️ Warning (> 300, Subtractive) |
| `src/client/network/activity_badge_dispatcher.ts` | Tier 1 (Dispatcher) | 249 | **237** | 211 | -12 | <= 250 | ✔️ Safe (Khóa cứng `TC-191.16` <= 250) |
| `src/client/ui/notification_deduplicator.ts` | Tier 2 (Pure Module) | 0 | **31** | 27 | +31 | <= 500 | ✔️ Safe (Mới) |
| `src/client/ui/floating_numbers.tsx` | Tier 2 (UI Views) | 297 | **303** | 277 | +6 | <= 390 | ✔️ Safe (Khóa cứng `TC-191.16` <= 390) |
| `tests/contracts/imp252_financial_notification_deduplication.test.ts` | Test Suite (Mới) | 0 | **354** | 316 | +354 | <= 600 | ✔️ Safe (28 atomic tests) |

*Ghi chú*:
- `src/client/ui/transaction_narrative.ts`: Giữ nguyên 270 LOC (Delta = 0, bảo vệ an toàn `TC-194.18` trần 280 LOC).
- Đăng ký Tech Debt `DEBT-STORE-PARTITION` cho `game_store.ts` và `game_store_types.ts` theo quy định Hiến pháp.

---

## 3. MA TRẬN TRUY XUẤT NGUỒN GỐC KIỂM THỬ (TRACEABILITY MATRIX)

Toàn bộ 28 bài kiểm thử hợp đồng tại [`tests/contracts/imp252_financial_notification_deduplication.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp252_financial_notification_deduplication.test.ts) đạt 100% GREEN, tối đa <= 3 asserts/test, 0 vòng lặp, 0 static checklist test:

| Mã Test Case | Phân Loại & Facet | Cơ Chế Kiểm Chứng Hành Vi | Trạng Thái Inversion |
| :--- | :--- | :--- | :---: |
| `[UC-IMP252/MSS] [TC-IMP252.01]` | Facet 1: Store Lifecycle | `addFloatingText` bảo lưu trường `groupId` vào store | 🔴 RED -> 🟢 GREEN |
| `[UC-IMP252/MSS] [TC-IMP252.02]` | Facet 1: Store Lifecycle | `removeFloatingText` xóa sạch toàn bộ thẻ có chung `groupId` | 🔴 RED -> 🟢 GREEN |
| `[UC-IMP252/A1] [TC-IMP252.03]` | Facet 1: Store Lifecycle | Xóa thẻ đơn lẻ (không `groupId`) không ảnh hưởng thẻ khác | 🟢 PASS (Guard) |
| `[UC-IMP252/MSS] [TC-IMP252.04]` | Facet 2: Dispatcher Tagging | `handleRentBadge` gán chung 1 `groupId` cho cặp `rent_pay`/`rent_receive` | 🔴 RED -> 🟢 GREEN |
| `[UC-IMP252/MSS] [TC-IMP252.05]` | Facet 2: Dispatcher Tagging | `handleMaBuyoutBadge` gán chung `groupId` cho thẻ mua và thẻ bán | 🔴 RED -> 🟢 GREEN |
| `[UC-IMP252/MSS] [TC-IMP252.06]` | Facet 2: Dispatcher Tagging | `handleTradeBadge` gán chung `groupId` cho 2 bên giao dịch P2P | 🔴 RED -> 🟢 GREEN |
| `[UC-IMP252/MSS] [TC-IMP252.07]` | Facet 3: Local Perspective | `deduplicateFloatingTexts` chỉ giữ thẻ của Bạn khi Bạn trả tiền (`Penalty`) | 🔴 RED -> 🟢 GREEN |
| `[UC-IMP252/MSS] [TC-IMP252.08]` | Facet 3: Local Perspective | `deduplicateFloatingTexts` chỉ giữ thẻ của Bạn khi Bạn nhận tiền (`Reward`) | 🔴 RED -> 🟢 GREEN |
| `[UC-IMP252/MSS] [TC-IMP252.09]` | Facet 3: Local Perspective | Giao dịch giữa 2 Bot chỉ giữ 1 thẻ duy nhất dòng tiền chi trả (`Penalty`) | 🔴 RED -> 🟢 GREEN |
| `[UC-IMP252/MSS] [TC-IMP252.10]` | Facet 4: Viewport Display | Khi có MilestoneBanner, thẻ thường cũ hơn ẩn trên mobile (`hidden md:flex`) | 🟢 PASS (Guard TC-234.11) |
| `[UC-IMP252/MSS] [TC-IMP252.11]` | Facet 4: Viewport Display | Khi không có MilestoneBanner, cả 2 thẻ thường không bị gắn `hidden md:flex` | 🟢 PASS (Guard) |
| `[UC-IMP252/MSS] [TC-IMP252.12]` | Facet 4: Viewport Display | Hai thẻ thường liên tiếp của Bạn giữ nguyên trật tự thời gian (không bị đảo) | 🔴 RED -> 🟢 GREEN |
| `[UC-IMP252/MSS] [TC-IMP252.13]` | Facet 5: Bankrupt Milestone | Sự kiện `bankrupt` render dạng `MilestoneBanner` và loại khỏi `regularTexts` | 🔴 RED -> 🟢 GREEN |
| `[UC-IMP252/MSS] [TC-IMP252.14]` | Facet 5: Bankrupt Milestone | Sự kiện `bankrupt` được gán thời lượng `EVENT_BANNER_DURATION_MS` (4500ms) | 🔴 RED -> 🟢 GREEN |
| `[UC-IMP252/A2] [TC-IMP252.15]` | Facet 5: Bankrupt Milestone | Các thẻ không có `groupId` (buy, tax, salary) giữ nguyên số lượng và thứ tự | 🟢 PASS (Guard) |
| `[UC-IMP252/MSS] [TC-IMP252.16]` | Facet 3: Local Perspective | Render thực tế chỉ hiển thị 1 thẻ duy nhất từ góc nhìn người trả tiền | 🔴 RED -> 🟢 GREEN |
| `[UC-IMP252/MSS] [TC-IMP252.17]` | Facet 1: Store Lifecycle | Thẻ hết hạn 1000ms kích hoạt hủy luôn thẻ đối tác có hạn 9000ms cùng nhóm | 🔴 RED -> 🟢 GREEN |
| `[UC-IMP252/MSS] [TC-IMP252.18]` | Facet 1: Store Lifecycle | Hủy nhóm `g1` không làm ảnh hưởng đến các nhóm giao dịch khác (`g2`) | 🔴 RED -> 🟢 GREEN |
| `[UC-IMP252/MSS] [TC-IMP252.19]` | Facet 2: Dispatcher Tagging | Hai sự kiện trả thuê riêng biệt có mã `groupId` phân biệt | 🔴 RED -> 🟢 GREEN |
| `[UC-IMP252/MSS] [TC-IMP252.20]` | Facet 3: Local Perspective | Thẻ nhóm sau khử trùng lặp giữ nguyên vị trí tương đối với thẻ đơn lẻ | 🔴 RED -> 🟢 GREEN |
| `[UC-IMP252/MSS] [TC-IMP252.21]` | Facet 3: Local Perspective | Khi `myPlayerId` là null (chế độ xem/quan sát), ưu tiên thẻ `Penalty` | 🔴 RED -> 🟢 GREEN |
| `[UC-IMP252/MSS] [TC-IMP252.22]` | Facet 3: Local Perspective | `deduplicateFloatingTexts` không làm đột biến mảng đầu vào (Immutability) | 🔴 RED -> 🟢 GREEN |
| `[UC-IMP252/MSS] [TC-IMP252.23]` | Facet 3: Local Perspective | Thẻ mang `groupId` nhưng đứng đơn lẻ (mất đối tác) vẫn được giữ lại | 🔴 RED -> 🟢 GREEN |
| `[UC-IMP252/MSS] [TC-IMP252.24]` | Facet 4: Viewport Display | Thẻ của Bạn cũ hơn và thẻ đối thủ mới hơn được hoán đổi ưu tiên Bạn | 🟢 PASS (Guard) |
| `[UC-IMP252/MSS] [TC-IMP252.25]` | Facet 5: Bankrupt Milestone | Thẻ thông thường mặc định thời lượng `TRANSACTION_POPUP_DURATION_MS` (3600ms) | 🟢 PASS (Guard) |
| `[UC-IMP252/MSS] [TC-IMP252.26]` | Facet 2: Dispatcher Tagging | `handleMaBuyoutBadge` thiết lập chính xác `targetPlayerId` song phương | 🔴 RED -> 🟢 GREEN |
| `[UC-IMP252/MSS] [TC-IMP252.27]` | Facet 2: Dispatcher Tagging | `handleDiplomaticEventBadge` gán chung 1 `groupId` cho cặp miễn trừ | 🔴 RED -> 🟢 GREEN |
| `[UC-IMP252/MSS] [TC-IMP252.28]` | Facet 2: Dispatcher Tagging | Hai sự kiện ngoại giao ở thời điểm khác nhau nhận 2 `groupId` phân biệt | 🔴 RED -> 🟢 GREEN |

---

## 4. BẢNG KIỂM ĐỊNH ĐỊNH NGHĨA HOÀN THÀNH (DEFINITION OF DONE COMPLIANCE)

| Tiêu chuẩn DoD | Quy định Hiến pháp | Kết quả thực tế đạt được | Phán quyết |
| :--- | :--- | :--- | :---: |
| **DoD 1: TDD & Traceability** | Adversarial Inversion RED -> GREEN, gắn nhãn `[UC-XXX/MSS]` và `[UC-XXX/A#]`, đối soát SSOT | 28/28 atomic tests PASS (21 tests RED Inversion, 7 regression guards), 100% gắn nhãn đầy đủ | **ĐẠT** |
| **DoD 2: Linter & LOC Limits** | `lint:slop` 0 hard violations, `lint:ui` 0 violations, zero dirty casts (`as any`), zero test props | 0 hard violations trên 305 files, 0 UI violations trên 215 files, 0 `as any` | **ĐẠT** |
| **DoD 3: Review Funnel** | Phase 3.0 (Ảnh chụp vật lý), Phase 3.1 (`spec-reviewer`), Phase 3.2 (`code-reviewer`, `ui-craft-reviewer`) | Đầy đủ ảnh Dual-Viewport (`imp-252_desktop.jpg`, `imp-252_mobile_360.jpg`). Cả 3 reviewers độc lập đều phê duyệt `APPROVED`. | **ĐẠT** |
| **DoD 4: Station 4 Chaos Sentinel** | 3 physical probes: (1) Wire Parity, (2) Port 0 Ephemeral Wire, (3) Mutation Sensitivity (floor >= 5) | Probe 1: 24/24 Intent symmetric parity. Probe 2: Port 60811 live TCP handshake & clean drop recovery. Probe 3: 12/12 mutants killed (3 source-level). Verified qua `check_evidence.mjs`. | **ĐẠT** |
| **DoD 5: Progress & Reports** | Cập nhật sổ cái Epic, biên soạn báo cáo nghiệm thu chuyên dụng, đánh giá vận hành SDLC | Đã cập nhật `docs/epics/client_ui/_epic_ledger.md`, hoàn tất báo cáo này kèm mục 6 | **ĐẠT** |
| **DoD 6: Production Invariants** | Chống invalid intents, bảo toàn Kho Bạc, Turn N+1 teardown, tombstone serialization | Đồng bộ vòng đời hủy nhóm trong store triệt tiêu Zombie Badge, bảo vệ trật tự thời gian thẻ | **ĐẠT** |

---

## 5. BẰNG CHỨNG XÁC THỰC GIAO DIỆN (PHASE 3.0 EVIDENCE)

Đã thẩm định trực tiếp hai tệp ảnh chụp vật lý in-game thực tế trong `.agents/tmp/`:
1. **Desktop Viewport (1280x800)**: [`.agents/tmp/imp-252_desktop.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-252_desktop.jpg)
   - Tiêm kịch bản 2 thẻ giao dịch P2P đối ứng mang chung `groupId = 'rent_test_101'` (Bạn trả -1.000 cho Bot AI 1 và Bot AI 1 thu +1.000).
   - **Kết quả thực tế**: Chỉ hiển thị DUY NHẤT 1 thẻ từ góc nhìn của Bạn: `"Bạn trả -1.000 cho Bot AI 1"`. Thẻ thu tiền của Bot đối tác đã được lọc bỏ sạch sẽ.
   - Thẻ hiển thị rõ ràng, huy hiệu số tiền màu đỏ nổi bật, nút đóng ✕ trực quan.
2. **Mobile Viewport (360x740)**: [`.agents/tmp/imp-252_mobile_360.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-252_mobile_360.jpg)
   - **Kết quả thực tế**: Thẻ thông báo duy nhất `"Bạn trả -1.000 cho Bot AI 1"` hiển thị gọn gàng ở đỉnh màn hình, không bị nén chữ, giải phóng 50% diện tích che phủ so với trước khi sửa.
   - *Phát hiện công thái học (Pre-existing)*: Toast neo `top-20` (Z-30) che khuất một phần thẻ người chơi đầu tiên trong danh sách HUD (như được ghi nhận bởi `ui-craft-reviewer`). Đây là bố cục cố hữu và đã được đăng ký vào sổ nợ kỹ thuật để xử lý trong ticket riêng biệt, tránh vi phạm Scope Bundling Ban.

---

## 6. ĐÁNH GIÁ VẬN HÀNH & ĐỀ XUẤT CẢI TIẾN SETTING SDLC

### 6.1. Nhật Ký Quan Sát Thô Từ Các Trạm (Raw Observations Log)
- **Station 1 (QA Tester)**: Test case `TC-IMP252.10` ban đầu có assert lỏng lẻo (`indexOf` và đếm thẻ trôi nổi). Sau khi bổ sung `cardWrappers()` helper, QA đã phân tách chặt chẽ cấu trúc wrapper. Phát hiện `TC-IMP252.05` và `TC-IMP252.06` vượt ngưỡng 4 asserts/test.
- **Station 2.5 (Scout)**: Quét sạch typecheck (`tsc --noEmit` 0 lỗi), LOC budgets an toàn (store 377/400, dispatcher 237/250, overlay 303/390, dedup 31/500), 0 dirty casts, 0 log rò rỉ.
- **Station 3.0 (Visual Evidence)**: Lần chụp đầu tiên xuất hiện lỗi "nền xanh trơn" do `HudContainer` chỉ mount khi `gameStarted === true`. Người dùng đã chỉ dẫn cơ chế headless injection thông qua `window.__lobbyStore.getState().setGameStarted(true)`.
- **Station 3.1 (Spec Reviewer)**: Phát hiện vi phạm rào cản kiểm thử (Test Architecture Gate) khi `TC-06` có 6 asserts và `TC-05` có 5 asserts; phát hiện thiếu snapshot `imp-252_snapshot.json`. Đã ra phán quyết REVISE buộc tách test và sinh snapshot trước khi vào Station 3.2.
- **Station 3.2 (Code & UI Craft Reviewers)**: `code-reviewer` xác nhận sạch 5 archetypes, zero closure leak. `ui-craft-reviewer` xác nhận khử trùng lặp thành công 1 thẻ duy nhất, đồng thời phát hiện vùng giao nhau che khuất giữa toast và thẻ HUD, cùng kích thước nút đóng ✕ (~20px) dưới ngưỡng 44px trên mobile.
- **Station 4 (Chaos Sentinel)**: Ban đầu subagent `chaos-sentinel` chưa được đăng ký trong danh sách runtime. Sau khi định nghĩa qua `define_subagent`, runner `station4_sentinel.ts` diệt gọn 12/12 mutants, kiểm tra thành công Intent parity 24/24 và socket TCP trên cổng động 60811.

---

### 6.2. Ma Trận Đối Kháng 2 Vòng (2-Round Adversarial Cross-Examination Matrix)

| Quan Sát Gốc (Trạm Phát Sinh) | Vòng 1: Kiểm Chứng Vật Lý Trên Đĩa/Logs | Vòng 2: Phản Biện Đối Kháng & Bộ Lọc Phòng Vệ | Phán Quyết Sau Cùng |
| :--- | :--- | :--- | :--- | :---: |
| 1. "Test case chứa 5-6 asserts trong khối `it()`" (Spec Reviewer) | **Kiểm chứng đĩa:** `TC-05` (5 asserts) và `TC-06` (6 asserts) trong bản nháp đầu tiên. Đã được QA phân tách thành `TC-05, TC-26` và `TC-06, TC-27, TC-28`. | Quy chuẩn atomic test (1-4 asserts/test, Detroit Classical TDD) là bất biến bắt buộc nhằm ngăn chặn hiện tượng che giấu lỗi và đảm bảo chẩn đoán chính xác. | `[VERIFIED SYSTEMIC TEST DEFECT / RESOLVED]` |
| 2. "Lỗi ảnh chụp nền xanh trơn trong Phase 3.0" (Visual Capture) | **Kiểm chứng mã nguồn:** `src/client/main.tsx:240` chỉ render `<HudContainer>` khi `gameStarted === true`. URL mặc định `?room=VTTEST` mở ra màn hình phòng chờ Pre-Match, nơi script capture tự đóng overlay. | Đây là đặc thù kiến trúc vòng đời của client game. Cần tích hợp cờ `setGameStarted(true)` vào scenario mặc định của capture script để mọi ticket UI đều tự động kích hoạt HUD. | `[VERIFIED HARNESS FRICTION / ACTIONABLE SCRIPT FIX]` |
| 3. "Subagent `chaos-sentinel` không tìm thấy trong runtime" (Main Agent) | **Kiểm chứng đĩa:** File `.agents/agents/chaos-sentinel.md` tồn tại đầy đủ nhưng chưa được định nghĩa trong danh sách subagents ban đầu của session. | Công cụ `define_subagent` cho phép nạp động định nghĩa agent. Cần lưu cấu hình này để không phải định nghĩa lại trong các phiên tiếp theo. | `[VERIFIED TOOLCHAIN GAP / MITIGATED VIA DEFINE_SUBAGENT]` |
| 4. "Vùng che phủ giữa floating toast và thẻ người chơi HUD" (UI Craft Reviewer) | **Kiểm chứng ảnh chụp:** Cả 2 ảnh desktop và mobile đều cho thấy toast neo `top-20` phủ đè lên góc phải của PlayerHudList (thẻ `p1`). | Vị trí neo là do `stackTopClass` có sẵn từ trước. Sửa layout ở ticket này sẽ vi phạm Scope Bundling Ban. Ghi nhận vào sổ nợ kỹ thuật là giải pháp kiến trúc chuẩn xác nhất. | `[VERIFIED DOMAIN INVARIANT / LOGGED TECH DEBT]` |

---

### 6.3. Kiến Nghị Cải Tiến Quy Trình & Cài Đặt SDLC Có Thể Thực Thi (Actionable Recommendations)
1. **Chuẩn Hóa Scenario Mặc Định Trong `capture_visual_evidence.mjs`**:
   - Tích hợp sẵn logic `window.__lobbyStore.getState().initLobby(...)` và `window.__lobbyStore.getState().setGameStarted(true)` vào runner capture khi không có scenario tùy biến, ngăn ngừa triệt để lỗi ảnh chụp sa bàn xanh trơn cho toàn bộ các ticket UI tiếp theo.
2. **Bổ Sung Linter Kiểm Tra Số Lượng `expect()`**:
   - Thêm quy tắc vào `scripts/lint_slop.mjs` để cảnh báo hoặc báo lỗi nếu bất kỳ khối `it()` nào trong thư mục `tests/**` chứa nhiều hơn 4 lệnh `expect()`, giúp QA và Scout bắt lỗi cơ học sớm trước khi đến Station 3.
3. **Mở Ticket Cải Tiến Công Thái Học Bố Cục Floating Toast (`IMP-253`)**:
   - Điều chỉnh tọa độ neo của `floating_numbers.tsx` trên mobile để hiển thị dưới trục TopBar hoặc dưới chân danh sách HUD, tránh che khuất thẻ người chơi trong lượt.
   - Nâng kích thước vùng bấm (touch target) của nút đóng ✕ từ ~20px lên tối thiểu 44px (`min-h-[44px] min-w-[44px]`) kèm viền focus trực quan theo khuyến nghị của `ui-craft-reviewer`.
