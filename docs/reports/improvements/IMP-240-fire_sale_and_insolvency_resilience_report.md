# BÁO CÁO NGHIỆM THU HOÀN TẤT CẢI TIẾN: IMP-240
**Khắc Phục Đấu Giá Phát Mãi 0đ, Bảo Toàn Tài Sản Chủ Nợ & Đồng Bộ Giao Diện Phá Sản (Fire Sale & Insolvency Resilience)**

> **Mã Ticket**: `IMP-240` (Tier 2 Full Rigor)  
> **Thời điểm nghiệm thu**: 2026-10-01  
> **Nguồn gốc Audit**: [`AUDIT_FIRE_SALE_0D_AND_GAMEPLAY_LOG_DEFECTS.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/audits/AUDIT_FIRE_SALE_0D_AND_GAMEPLAY_LOG_DEFECTS.md)  
> **Kế hoạch triển khai**: [`.agents/plans/PLAN_IMP_240_FIRE_SALE_AND_INSOLVENCY.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/plans/PLAN_IMP_240_FIRE_SALE_AND_INSOLVENCY.md) (Revision 3 — `HARDENED_APPROVED`)  
> **Biên bản thẩm định kế hoạch**: [`.agents/audit/PLAN_AUDIT_IMP_240_FIRE_SALE_AND_INSOLVENCY.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP_240_FIRE_SALE_AND_INSOLVENCY.md)  
> **Bằng chứng kiểm toán Station 4**: [`.agents/evidence/chaos_sentinel_IMP-240.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-240.json) (`verdict: APPROVED`)  

---

## 1. TỔNG QUAN & BỐI CẢNH TRIỂN KHAI

Từ kết quả phân tích pháp y các ván đấu thực tế tại báo cáo kiểm toán `AUDIT_FIRE_SALE_0D_AND_GAMEPLAY_LOG_DEFECTS.md`, hệ thống phát sinh chuỗi lỗi nghiêm trọng liên quan đến cơ chế vỡ nợ, phát mãi tài sản trái phiếu và trải nghiệm sàn đấu giá:

1. **Rơi Rụng Thuộc Tính `isFireSale` Trên Wire DTO & Modal Host**:
   - `ModalPayloadMap['auction']` tại `game_store_types.ts` thiếu trường `isFireSale?: boolean`.
   - `modal_host.tsx` không forward cờ `isFireSale` xuống `AuctionModal`.
   - Hệ quả: Khi phiên đấu giá phát mãi trái phiếu khởi tạo với `startingBid: 0`, hàm `calculateAuctionIncrements` không nhận diện được cờ `isFireSale`, dẫn tới tính sai bước giá hoặc hiển thị nút bấm thiếu chính xác.

2. **Chế Độ Khán Giả Khi Người Chơi Phá Sản (`AuctionModal` Spectator Mode)**:
   - Trước khi sửa: Khi người chơi bị phá sản (`isBankrupt = true`), giao diện `AuctionModal` vẫn hiển thị cụm nút đặt giá (`+100`, `+200`, `+500`) và vòng lặp `autoBid` vẫn âm thầm tự động cược theo timer, gây xung đột Intent bị Server từ chối liên tục.
   - Sau khi sửa: Chuyển đổi trạng thái sang chế độ Khán giả (Spectator Mode). Ẩn toàn bộ cụm nút cược, hiển thị Banner thông báo màu slate trang nhã: `👁️ Bạn đã phá sản — Đang theo dõi phiên đấu giá với tư cách khán giả`, khóa cứng tính năng Auto-Bid, và đổi nút Footer thành `✕ Đóng / Xem Bàn Cờ` (gọi `onClose`, không gọi `onPass`).

3. **Công Thái Học & Chống Cắt Cụt Danh Sách Người Chơi Trên Mobile / Desktop**:
   - Khung danh sách người chơi tham gia đấu giá được nâng từ `max-h-16 sm:max-h-20` lên `max-h-28 sm:max-h-32 md:max-h-36`.
   - Đảm bảo hiển thị trọn vẹn cả 4 người chơi trên mọi độ phân giải (từ màn hình di động 360px đến Desktop 1920x1080) mà không bị viền dưới cắt ngang thân chữ.
   - Tích hợp thanh cuộn tinh tế Tailwind v4 và viền nét `focus-visible:ring-2 focus-visible:ring-amber-400` chuẩn công thái học.

4. **Bảo Toàn Quyền Lợi Chủ Nợ & Senior Lien Trái Phiếu**:
   - Trước khi sửa: Khi con nợ bị phá sản vì nợ tiền thuê người chơi khác, toàn bộ BĐS bị xóa trắng chủ sở hữu (`null`) và thanh lý sai lệch.
   - Sau khi sửa:
     * Chuyển nhượng trực tiếp toàn bộ BĐS không thế chấp của con nợ sang tên cho chủ nợ hợp pháp (`creditor.id`) nếu chủ nợ còn sống (`!creditor.bankrupt`).
     * **Bảo toàn Senior Lien**: Các BĐS đang thế chấp đảm bảo nghĩa vụ Trái Phiếu (`collateralCells`) TUYỆT ĐỐI KHÔNG sang tên cho chủ nợ mà được đưa vào `fireSaleQueue` để đấu giá phát mãi, bảo vệ quyền lợi thanh toán nợ gốc trái chủ.
     * Khi chủ nợ là Ngân Hàng (`effectiveCreditorId === 'BANK'`) hoặc chủ nợ đã phá sản: Tài sản được đưa vào đấu giá thanh lý an toàn.

5. **Dọn Dẹp Biến Quá Độ (Turn N+1 & Solvency Recovery Teardown)**:
   - Các trường tạm thời `pendingInsolvencyCreditorId`, `pendingInsolvencyDebtorId`, và `fireSaleDebtorId` được bảo đảm tính nguyên tử:
     * Khi người chơi tự cứu nguy thành công qua việc thế chấp hoặc hạ cấp nhà (`balance >= 0`), các cờ nợ này lập tức được xóa bỏ sạch sẽ.
     * Khi hàng đợi phát mãi `fireSaleQueue` xử lý hết, `fireSaleDebtorId` tự động reset về `undefined`.
     * Khi chuyển lượt chơi kế tiếp qua `advanceTurnToNextPlayer`, các cờ nợ của lượt cũ bị dọn dẹp triệt để, ngăn ngừa ô nhiễm trạng thái chéo lượt.

---

## 2. BẢNG ĐỐI CHIẾU HẠ TẦNG VÀ NGÂN SÁCH DÒNG LỆNH (LOC AUDIT)

Tất cả 11 tệp vật lý đều được kiểm tra cơ học qua `node scripts/check_loc.mjs`, 100% tuân thủ trần quy định:

| Tệp Vật Lý | Phân Loại Tier | Tổng Dòng (LOC) | Dòng Lệnh (SLOC) | Trần Quy Định | Trạng Thái Ngân Sách |
|:---|:---:|:---:|:---:|:---:|:---|
| `src/domain/room.ts` | Tier 1 (Domain/Server/Logic) | **278** | 254 | <= 400 | ✔️ An toàn |
| `src/server/insolvency_manager.ts` | Tier 1 (Domain/Server/Logic) | **295** | 263 | <= 400 | ✔️ An toàn |
| `src/server/turn_loop.ts` | Tier 1 (Domain/Server/Logic) | **340** | 309 | <= 400 | ✔️ An toàn (Cảnh báo ngưỡng 300) |
| `src/server/bond_manager.ts` | Tier 1 (Domain/Server/Logic) | **243** | 215 | <= 400 | ✔️ An toàn |
| `src/server/auction_manager.ts` | Tier 1 (Domain/Server/Logic) | **287** | 265 | <= 400 | ✔️ An toàn (Đã trích xuất helper) |
| `src/server/network/afk_recovery.ts` | Tier 1 (Domain/Server/Logic) | **224** | 210 | <= 400 | ✔️ An toàn |
| `src/server/room_property_coordinator.ts` | Tier 1 (Domain/Server/Logic) | **361** | 326 | <= 400 | ✔️ An toàn (Cảnh báo ngưỡng 300) |
| `src/client/store/game_store_types.ts` | Tier 1 (Domain/Server/Logic) | **387** | 362 | <= 400 | ✔️ An toàn (Cảnh báo ngưỡng 300) |
| `src/client/ui/modals/modal_host.tsx` | Tier 2 (UI/3D/Views) | **473** | 456 | <= 500 | ✔️ An toàn (Cảnh báo ngưỡng 400) |
| `src/client/ui/modals/auction_modal.tsx` | Tier 2 (UI/3D/Views) | **467** | 447 | <= 500 | ✔️ An toàn (Cảnh báo ngưỡng 400) |
| `tests/contracts/fire_sale_and_insolvency_lifecycle.test.ts` | Test Suite | **395** | 332 | <= 600 | ✔️ An toàn |

---

## 3. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG & BẢO ĐẢM BẤT BIẾN

### A. Bộ Kiểm Thử Hợp Đồng (Contract Tests)
- **Suite**: `tests/contracts/fire_sale_and_insolvency_lifecycle.test.ts` (Universal 5-Facet Matrix: `TC-FS.01` đến `TC-FS.17`).
- **Kết quả thực tế**: **17/17 atomic tests PASS 100%** (Thời gian chạy: 35ms).
- **Adversarial Inversion Gate (Station 1 RED)**:
  - Kiểm chứng 14 ca Business RED thất bại trước khi implement trên mã nguồn cũ:
    * `TC-FS.01`: Thiếu trường `isFireSale` / `insolvencyPlayerId` trong session auction.
    * `TC-FS.04`: Người phá sản chưa bị cấm đặt giá (`isDeclinedPlayer`).
    * `TC-FS.05`: Chưa có Spectator mode, nút cược vẫn render khi phá sản.
    * `TC-FS.06` & `TC-FS.07`: Chưa có cơ chế lan truyền và dọn dẹp `fireSaleDebtorId`.
    * `TC-FS.08` & `TC-FS.09`: Chưa có logic sang tên chủ nợ và bảo vệ tài sản đảm bảo trái phiếu.
    * `TC-FS.10`: Chưa truyền `creditorId` khi xử lý AFK vỡ nợ.
    * `TC-FS.12`: `modal_host.tsx` chưa forward `isFireSale` và `isBankrupt`.
    * `TC-FS.13` & `TC-FS.14`: Chưa dọn dẹp cờ nợ khi tự cứu nguy bằng thế chấp/hạ cấp.
    * `TC-FS.16`: Chưa kiểm tra điều kiện chủ nợ đã phá sản.
    * `TC-FS.17`: Chưa dọn dẹp cờ nợ ở `advanceTurnToNextPlayer`.
  - 3 ca Baseline Regression GREEN được thiết kế kiểm chứng cơ chế toán học `calculateAuctionIncrements` không bị hồi quy.

### B. Kiểm Tra Biên Dịch & Linter
- **TypeScript**: `npx tsc --noEmit` $\rightarrow$ **0 lỗi biên dịch**, hoàn toàn tương thích strict mode.
- **UI Linter**: `npm run lint:ui` $\rightarrow$ **0 Anti-patterns** trên toàn bộ 209 tệp UI.
- **Anti-Slop Audit**: Hàm `handleAuctionClose` trong `src/server/auction_manager.ts` được tối ưu tái cấu trúc (trích xuất `processNextFireSaleQueueItem`), đưa SLOC từ 121 xuống 110 dòng (< 120 dòng quy định), sạch 100% hard violations.

---

## 4. BẰNG CHỨNG HÌNH ẢNH VẬT LÝ (PHYSICAL VISUAL EVIDENCE GATE)

Đã chụp và thẩm định ảnh chụp màn hình in-game thực tế của `AuctionModal` tại `.agents/tmp/imp-240_auction_spectator.jpg`:

1. **`imp-240_auction_spectator.jpg`**:
   - Hiển thị trọn vẹn modal đấu giá phát mãi với huy hiệu `[PHÁT MÃI TRÁI PHIẾU]`.
   - Danh sách 4 người chơi hiển thị đầy đủ, không bị cắt xén thân chữ trên container `max-h-28 sm:max-h-32 md:max-h-36`.
   - Thẻ thông báo Spectator hiển thị rõ nét: `👁️ Bạn đã phá sản — Đang theo dõi phiên đấu giá với tư cách khán giả`.
   - Cụm nút đặt giá biến mất hoàn toàn, tính năng Auto-Bid bị khóa cứng.
   - Nút chân trang Footer hiển thị nhãn chuẩn: `✕ Đóng / Xem Bàn Cờ`.

---

## 5. PHÊ CHUẨN CÁC TRẠM KIỂM SOÁT ĐỘC LẬP (4-STATION CLOSED-LOOP PIPELINE)

| Trạm Kiểm Soát | Vai Trò Subagent | Phán Quyết | Nội Dung Đánh Giá |
|:---|:---|:---:|:---|
| **Gate 0: Plan Grilling** | `plan-griller` | 🛡️ **`HARDENED_APPROVED`** | Bản kế hoạch Revision 3 đóng trọn vẹn 100% các chỉ thị đối kháng (độ phụ thuộc useEffect, Senior Lien, Turn N+1 cleanup). |
| **Station 1: QA RED** | `qa-tester` | 🔴 **`RED_VERIFIED`** | Suite 17 tests atomic, 14 Business RED chứng minh tính đúng đắn TDD, 0 syntax error. |
| **Station 2: Implementer** | `implementer` | 🟢 **`GREEN_VERIFIED`** | Hiện thực 10 tệp nguồn, 17/17 tests chuyển GREEN, zero bug-codification. |
| **Station 2.5: Scout** | `scout` | ⚡ **`PREFILTER_PASSED`** | 0 lỗi tsc, 100% tệp dưới trần LOC, 0 dirty casts, 0 console.log rác. |
| **Station 3.1: Spec Gate** | `spec-reviewer` | 📋 **`SPEC_APPROVED`** | 100% plan fidelity, 0 scope drift, 17/17 contract tests truy vết chuẩn xác. |
| **Station 3.2: Code Review** | `code-reviewer` | 🔍 **`CODE_APPROVED`** | Bảo toàn Treasury, Senior Lien an toàn, FSM cleanup triệt để, không rò rỉ timer/closure. |
| **Station 3.2: 2D UI Craft** | `ui-craft-reviewer` | 🎨 **`UI_APPROVED`** | Trải nghiệm khán giả hoàn hảo, layout không tràn trên 360px-1080p, WCAG 2.1 AA đạt chuẩn. |
| **Station 4: Chaos Sentinel** | `chaos-sentinel` | 🛡️ **`APPROVED`** | 3/3 physical probes PASS: Parity 24/24, Ephemeral Wire port 65488, Mutation 8/8 mutants killed. |

---

## 6. KẾT LUẬN & ĐÓNG TICKET

Ticket **IMP-240** đã hoàn tất 100% các tiêu chí của Definition of Done (Constitution GEMINI.md). Cơ chế đấu giá phát mãi tài sản, bảo vệ quyền lợi chủ nợ và trải nghiệm khán giả khi vỡ nợ đã được củng cố vững chắc, loại bỏ hoàn toàn các lỗi pháp y đã phát hiện trong `AUDIT_FIRE_SALE_0D_AND_GAMEPLAY_LOG_DEFECTS.md`.
