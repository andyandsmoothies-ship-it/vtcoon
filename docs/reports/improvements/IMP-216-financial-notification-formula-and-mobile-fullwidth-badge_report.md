# [REPORT] IMP-216: Financial Notification Formula Transparency & Mobile Full-Width Badge

## 1. THÔNG TIN TỔNG QUAN
- **Mã Ticket**: IMP-216
- **Tiêu Đề**: Financial Notification Formula Transparency & Mobile Full-Width Badge (Minh Bạch Hóa Công Thức Biến Động Tài Chính & Mở Rộng Thẻ Mobile Full-Width).
- **Phân Hạng**: **Tier 2 (Full Rigor)** — Data Model, Domain SSOT Constants, Network Activity Tracking, Client Narrative Engine & Impeccable Mobile UI.
- **Trạng Thái**: ✅ **COMPLETE** (HOÀN TẤT TRỌN VẸN QUY TRÌNH 3 TRẠM).
- **Căn Cứ Pháp Lý & Kế Hoạch**:
  - Kế hoạch phê duyệt: [`docs/plans/improvements/IMP-216-financial-notification-formula-and-mobile-fullwidth-badge_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-216-financial-notification-formula-and-mobile-fullwidth-badge_plan.md) (Revision 2).
  - Báo cáo thẩm định phản biện: [`.agents/audit/PLAN_AUDIT_IMP216.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP216.md) (**HARDENED_APPROVED**).
  - Bằng chứng kiểm thử tự động: [`.agents/evidence/imp216_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp216_snapshot.json) (`executed: true`, 16 tests passed, 0 typecheck errors).
- **Hội Đồng Trạm 3 Độc Lập**:
  - `spec-reviewer`: **APPROVED** (100% đối soát tam giác 3 chiều, zero scope drift, 16/16 tests truy xuất nguồn gốc chuẩn SSOT Gotchas Pillar V.9).
  - `code-reviewer`: **APPROVED** (0 Slop Red Flags, 0 dirty casts, 100% Runtime Wire Gate, 11/11 file đạt ngân sách LOC).
  - `ui-craft-reviewer`: **APPROVED** (Mobile full-width `w-[calc(100vw-1.5rem)]` căn giữa, 0 anti-patterns Impeccable, touch target >= 44px, phân cấp 3 tầng rõ rệt).

---

## 2. NGUYÊN NHÂN CỐT LÕI & GIẢI PHÁP KIẾN TRÚC

### 2.1. Phân Tích Hiện Trạng & Yêu Cầu Người Dùng
Người dùng phản ánh trên mobile khi người chơi hoặc bot bị trừ/cộng tiền theo các công thức nhất định (ví dụ ra tù qua các giai đoạn, tiền điện EVN, cước Viettel, thuế đất đai...):
1. **Bị bóp nghẹt ở 1/2 màn hình mobile**:
   - Trước đây trong `src/client/ui/floating_numbers.tsx:261`, container dùng `max-w-[calc(100vw-11.5rem)]` ở góc trái để né `PlayerHudList`.
   - Trên điện thoại $360\text{px} - 390\text{px}$, bề ngang chỉ còn khoảng **~180px–200px** (đúng 1/2 màn hình). Chữ bị dồn nén, rớt dòng vụn vặt và phải dùng `line-clamp-2`.
2. **Nội dung chưa rõ lý do và công thức tính**:
   - Thẻ `FloatingBadge` gộp chung toàn bộ chủ ngữ, hành động, số tiền, đối tượng và chi tiết vào duy nhất 1 dòng văn dồn cục.
   - Các trường hợp kiểm toán (tự nguyện bảo lãnh 10% vs hết 3 lượt phạt bắt buộc vs đổ đôi thoát miễn phí), tiền điện EVN khi qua GO, cước data Viettel, lệ phí đất đai ô 4, thuế tài sản qua GO không thể hiện được công thức hoặc lý do rõ ràng.
3. **Rủi ro lệch pha khi sửa logic sau này (SSOT Desync)**:
   - Nếu hardcode chuỗi text ở UI, khi sau này sửa công thức trong game engine, UI sẽ hiển thị sai lệch với thực tế.

---

### 2.2. Giải Pháp Kiến Trúc Toàn Diện (Zero-Hardcode & Mobile Full-Width)

```
[Domain SSOT Constants] ───────────┬───> [Server Engine]: Tính toán & trừ tiền thực tế
(TELECOM_DATA_FEE = 150)           │
(ELECTRIC_RATE_C1 = 100)           └───> [Client Transaction Formula Submodule]:
(MIN_BAIL_AMOUNT = 500)                  Tự động sinh chuỗi Dòng 1 rõ nghĩa, súc tích (< 50 ký tự)
                                                   │
                                                   ▼
[Network Activity Financial Tracker] ───> Gắn cờ & bóc tách bảo lãnh, điện EVN, cước Viettel
                                                   │
                                                   ▼
[Client Game Store: floatingTexts] ─────> Bảo toàn trường `formula` trong newItem
                                                   │
                                                   ▼
[Client UI: FloatingBadge] ──────────────> Cấu trúc 3 tầng: Header + Dòng 1 + Dòng 2
[Client UI: FloatingNumbersOverlay] ────> Mobile Full-Width: w-[calc(100vw-1.5rem)] căn giữa
```

1. **Khôi Phục SSOT Tập Trung Tại Domain (`src/domain/property_rent.ts`)**:
   - Xuất khẩu các hằng số: `TELECOM_DATA_FEE = 150`, `MIN_BAIL_AMOUNT = 500`, `BAIL_NET_WORTH_RATIO = 0.10`, `GO_PROPERTY_TAX_CAP = 1_000`.
   - Server (`special_cell_handler.ts`, `audit_manager.ts`) và Client UI đều nhập từ SSOT này, triệt tiêu 100% ranh giới import chéo Client ➔ Server.
2. **Tách Submodule Phân Giải Công Thức Độc Lập (`src/client/ui/transaction_formula.ts`)**:
   - Phân giải chuyên biệt từng nghiệp vụ:
     - *Bảo lãnh tự nguyện*: `Bảo lãnh sớm: 10% tài sản ròng (Sàn 500 Tr.)` (hoặc theo `MIN_BAIL_AMOUNT`).
     - *Cưỡng chế 3 lượt*: `Hết 3 lượt không ra đôi: Phạt bảo lãnh bắt buộc`.
     - *Đổ đôi*: `Gieo xúc xắc đôi: Thoát kiểm toán miễn phí` (số tiền 0 Tr.).
     - *Điện EVN qua GO*: `Hóa đơn tiền điện EVN khi qua ô Khởi Hành`.
     - *Cước Viettel*: `Cước data viễn thông Viettel (150 Tr.)` (tự động theo `TELECOM_DATA_FEE`).
     - *Lệ phí đất đai (ô 04)*: `Lệ phí trước bạ: 10% tiền mặt (Tối đa 2.000 Tr.)`.
     - *Thuế vượt GO*: `Thuế tài sản qua GO (Tối đa 1.000 Tr.)` (tự động theo `GO_PROPERTY_TAX_CAP`).
     - *Thuê x2 độc quyền*: `Độc quyền nhóm màu (x2 tiền thuê): [Tên ô]`.
     - *Thẻ Ngoại Giao đối xứng 2 chiều*: Khách được miễn 100% vs Chủ đất hụt thu tiền thuê.
     - *Thế chấp & Giải chấp*: Vay 50% giá trị đất vs Chuộc lại đất (Gốc + 10% phí Kho Bạc).
   - Giúp `transaction_narrative.ts` giữ vững 260 LOC (dưới trần 280 LOC của hợp đồng sống `TC-194.18`).
3. **Vá Lỗ Hổng Data Lifecycle Trong Store (`src/client/store/game_store.ts`)**:
   - `addFloatingText` sao chép `formula` vào `newItem`, bảo đảm dữ liệu từ origin truyền thẳng tới UI mà không bị rơi rụng.
4. **Tái Cấu Trúc Giao Diện Thẻ & Mobile Full-Width (`src/client/ui/floating_numbers.tsx`)**:
   - Container mobile: `left-1/2 -translate-x-1/2 w-[calc(100vw-1.5rem)] max-w-sm sm:max-w-md` căn giữa đối xứng, rộng 336px trên màn 360px.
   - Thẻ `FloatingBadge`:
     - **Tầng 1 (Header)**: Icon nghiệp vụ + Tên danh mục viết hoa + Nút đóng `✕` (`aria-label="Đóng thông báo"`).
     - **Tầng 2 (Dòng 1)**: `data-testid="transaction-formula-line"`, icon 📐 + công thức/lý do súc tích dưới 50 ký tự, có `truncate` và `title`.
     - **Tầng 3 (Dòng 2)**: `data-testid="transaction-flow-line"`, câu văn tự nhiên (`Subject` + `Verb` + `Pill Số Tiền` + `Target`), loại bỏ hoàn toàn mũi tên tĩnh `➔` gây hiểu nhầm khi người chơi thu tiền.

---

## 3. FILE MUTATION & LOC COMPLIANCE (ĐĨA VẬT LÝ)

Tất cả 11 tệp vật lý đều tuân thủ nghiêm ngặt ngân sách dòng lệnh (Tier 1 <= 400 LOC, Tier 2 <= 500 LOC):

| File | Phân Loại Tier | LOC Trước | LOC Sau | Non-Empty SLOC | Trần Ngân Sách | Đánh Giá & Tuân Thủ |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| `src/domain/property_rent.ts` | Tier 1 (Domain SSOT) | 183 | **186** | 172 | <= 400 | ✔️ **ĐẠT CHUẨN** (Xuất khẩu SSOT constants) |
| `src/server/special_cell_handler.ts` | Tier 1 (Server Logic) | 72 | **72** | 68 | <= 400 | ✔️ **ĐẠT CHUẨN** (Nhập SSOT từ domain) |
| `src/server/audit_manager.ts` | Tier 1 (Server Logic) | 150 | **150** | 133 | <= 400 | ✔️ **ĐẠT CHUẨN** (Dùng MIN_BAIL_AMOUNT SSOT) |
| `src/client/store/game_store_types.ts` | Tier 1 (Domain State) | 379 | **380** | 353 | <= 400 | ✔️ **ĐẠT CHUẨN** (Bổ sung `formula?: string`) |
| `src/client/store/game_store.ts` | Tier 1 (Client Store) | 385 | **387** | 355 | <= 400 | ✔️ **ĐẠT CHUẨN** (Bảo toàn `formula` trong `addFloatingText`) |
| `src/client/ui/transaction_formula.ts` | Tier 2 (UI Submodule) | MỚI | **76** | 74 | <= 500 | ✔️ **ĐẠT CHUẨN** (Bóc tách seam công thức chuyên biệt) |
| `src/client/ui/transaction_narrative.ts` | Tier 2 (UI Narrative) | 255 | **260** | 238 | <= 280 | ✔️ **ĐẠT CHUẨN** (Bảo toàn test TC-194.18 <= 280 LOC) |
| `src/client/ui/floating_numbers.tsx` | Tier 2 (UI Component) | 282 | **290** | 264 | <= 500 | ✔️ **ĐẠT CHUẨN** (Cấu trúc 3 tầng & Mobile full-width) |
| `src/client/network/activity_financial_tracker.ts` | Tier 1 (Network Tracker) | 310 | **314** | 286 | <= 400 | ✔️ **ĐẠT CHUẨN** (Bảo lãnh >= 500 & timeout tagging) |
| `src/client/network/activity_badge_dispatcher.ts` | Tier 1 (Dispatcher) | 232 | **243** | 225 | <= 400 | ✔️ **ĐẠT CHUẨN** (Truyền formula & sửa modular step) |
| `tests/contracts/imp216_financial_notification_formula_and_badge.test.ts` | Living Suite | MỚI | **375** | 338 | <= 600 | ✔️ **ĐẠT CHUẨN** (16 atomic tests thuần túy runtime) |

---

## 4. MA TRẬN KIỂM THỬ HỢP ĐỒNG (16 ATOMIC TESTS - 5 FACETS)

Tệp hợp đồng: [`tests/contracts/imp216_financial_notification_formula_and_badge.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp216_financial_notification_formula_and_badge.test.ts)

| STT | Mã Test Case & Traceability | Facet Kiểm Thử | Trạng Thái |
| :---: | :--- | :--- | :---: |
| 1 | `[TC-216.01/MSS][UC-IMP216]` | Facet 1: Tự nguyện nộp bảo lãnh sớm (`actionType: 'bail'`): Dòng 1 sinh `Bảo lãnh sớm: 10% tài sản ròng (Sàn 500 Tr.)` | ✅ PASS |
| 2 | `[TC-216.02/MSS][UC-IMP216]` | Facet 1: Hết 3 lượt cưỡng chế phạt: Dòng 1 sinh `Hết 3 lượt không ra đôi: Phạt bảo lãnh bắt buộc` | ✅ PASS |
| 3 | `[TC-216.03/MSS][UC-IMP216]` | Facet 1: Gieo xúc xắc đôi thoát kiểm toán (`actionType: 'audit_jail'`, text '0 Tr.'): Dòng 1 sinh `Gieo xúc xắc đôi: Thoát kiểm toán miễn phí`, số tiền 0 Tr. | ✅ PASS |
| 4 | `[TC-216.04/MSS][UC-IMP216]` | Facet 1: Tự động cập nhật theo hằng số SSOT: Chuỗi công thức nhập trực tiếp `MIN_BAIL_AMOUNT` từ `src/domain/property_rent.ts` | ✅ PASS |
| 5 | `[TC-216.05/MSS][UC-IMP216]` | Facet 2: Tiền điện EVN khi đối thủ qua GO (`actionType: 'rent_pay'`, cell 12): Dòng 1 sinh `Hóa đơn tiền điện EVN khi qua ô Khởi Hành` | ✅ PASS |
| 6 | `[TC-216.06/MSS][UC-IMP216]` | Facet 2: Cước data Viettel khi vào ô Thị Trường/Cơ Hội (cell 28): Dòng 1 sinh `Cước data viễn thông Viettel (150 Tr.)`, khớp `TELECOM_DATA_FEE` | ✅ PASS |
| 7 | `[TC-216.07/MSS][UC-IMP216]` | Facet 2: Phân biệt tiền thuê BĐS thường vs Cước tiện ích hạ tầng: cellIndex khác không bị nhận nhầm thành cước Viettel | ✅ PASS |
| 8 | `[TC-216.08/MSS][UC-IMP216]` | Facet 3: Lệ phí Đất đai (Ô 04): Dòng 1 sinh `Lệ phí trước bạ: 10% tiền mặt (Tối đa 2.000 Tr.)` | ✅ PASS |
| 9 | `[TC-216.09/MSS][UC-IMP216]` | Facet 3: Thuế tài sản vượt GO: Dòng 1 sinh `Thuế tài sản qua GO (Tối đa 1.000 Tr.)`, đối chiếu với `GO_PROPERTY_TAX_CAP` | ✅ PASS |
| 10 | `[TC-216.10/MSS][UC-IMP216]` | Facet 3: Lương qua ô Khởi Hành (`actionType: 'salary'`): Dòng 1 sinh `Hoàn thành 1 vòng: Thưởng lương qua ô Khởi Hành` | ✅ PASS |
| 11 | `[TC-216.11/MSS][UC-IMP216]` | Facet 4: Tiền thuê BĐS có Độc Quyền (Monopoly x2): Dòng 1 sinh `Độc quyền nhóm màu (x2 tiền thuê): [Tên ô]` | ✅ PASS |
| 12 | `[TC-216.12/MSS][UC-IMP216]` | Facet 4: Thẻ Ngoại Giao đối xứng 2 chiều: Khách thuê miễn 100% tiền thuê BĐS vs Chủ nhà hụt thu tiền thuê | ✅ PASS |
| 13 | `[TC-216.13/MSS][UC-IMP216]` | Facet 4: Thế chấp & Giải chấp ngân hàng: Vay 50% giá trị đất vs Chuộc lại đất thế chấp (Gốc + 10% phí Kho Bạc) | ✅ PASS |
| 14 | `[TC-216.14/MSS][UC-IMP216]` | Facet 5: `FloatingNumbersOverlay` trên mobile render `w-[calc(100vw-1.5rem)]` và `left-1/2 -translate-x-1/2`, không còn `max-w-[calc(100vw-11.5rem)]` | ✅ PASS |
| 15 | `[TC-216.15/MSS][UC-IMP216]` | Facet 5: `FloatingBadge` render đúng cấu trúc 3 tầng: Header (category, icon, nút đóng), Dòng 1 (`transaction-formula-line`), Dòng 2 (`transaction-flow-line`) | ✅ PASS |
| 16 | `[TC-216.16/MSS][UC-IMP216]` | Facet 5: Data Lifecycle Invariant: Gọi `state.addFloatingText({ formula })` thì formula được lưu trữ toàn vẹn trong Zustand game_store | ✅ PASS |

### Kết Quả Kiểm Thử Toàn Diện & Chống Hồi Quy
- **16/16 tests PASS** trong suite `imp216_financial_notification_formula_and_badge.test.ts`.
- **189/189 tests PASS (100%)** trên toàn bộ 9 suites kiểm thử pop-up liên quan (`imp194`, `imp193`, `imp191`, `imp117`, `imp122`, `imp123`, `imp128`, `imp143`, `imp201`).
- **`npx tsc --noEmit`**: **0 lỗi** typecheck.
- **`npm run lint:ui`**: **0 vi phạm** anti-pattern trên 197 tệp.

---

## 5. BẰNG CHỨNG NGHIỆM THU ĐÃ LƯU TRỮ VẬT LÝ

- **Evidence Snapshot**: [`.agents/evidence/imp216_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp216_snapshot.json).
- **Audit Report Plan Griller**: [`.agents/audit/PLAN_AUDIT_IMP216.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP216.md).
- **Active Epic Ledger**: [`docs/epics/client_ui/_epic_ledger.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/epics/client_ui/_epic_ledger.md#L655).
- **Domain Memory SSOT Invariant**: [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) (Pillar V.9: Giao Diện Biến Động Tài Chính 3 Tầng & Mobile Full-Width).

---

## 6. HƯỚNG DẪN BẢO TRÌ & MỞ RỘNG TRONG TƯƠNG LAI

Khi bạn bổ sung một cơ chế tính tiền mới trong tương lai:
1. **Định nghĩa hằng số tại Domain SSOT** (`src/domain/property_rent.ts`).
2. **Khai báo case trong submodule** [`src/client/ui/transaction_formula.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/transaction_formula.ts):
   ```typescript
   case 'your_new_action':
     return `Tên nghiệp vụ: Công thức tính toán (${YOUR_CONSTANT} Tr.)`;
   ```
3. Hệ thống sẽ tự động hiển thị trên Dòng 1 của thẻ thông báo, tự co giãn đẹp mắt trên mobile và được bảo vệ bởi bộ hợp đồng kiểm thử tự động, tuyệt đối không bị sót hay vỡ layout.
