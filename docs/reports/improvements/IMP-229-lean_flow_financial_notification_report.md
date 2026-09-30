# BÁO CÁO NGHIỆM THU — CẢI TIẾN IMP-229
# LEAN FLOW FINANCIAL NOTIFICATIONS & CONDITIONAL FORMULA RENDERING

> **Mã Ticket**: `IMP-229`  
> **Phân loại**: Tier 2 (Full Rigor — UI Craft / Financial Narrative / Contract Tests)  
> **Trạng thái**: ✅ **HOÀN THÀNH — ĐÃ ĐƯỢC PHÊ DUYỆT BỞI 4 TRẠM KHÉP KÍN**  
> **Ngày hoàn thành**: 2026-09-30  

---

## 1. TỔNG QUAN VẤN ĐỀ & MỤC TIÊU CẢI TIẾN

### 1.1. Hiện Trạng Trước Cải Tiến
Từ ảnh chụp màn hình ván đấu thực tế (`media_1790695561600.png`):
- Khi người chơi thực hiện thao tác **Mua Đất** hoặc **Nâng Cấp**, thẻ thông báo tài chính (`FloatingBadge`) bị nhồi nhét tới 3 tầng:
  1. Header: `🏷️ MUA ĐẤT ĐẦU TƯ`
  2. Dòng công thức (`📐`): `"Đầu tư mua quyền sử dụng đất: TP.HCM (Quận 1 - Nguyễn Huệ)"`
  3. Dòng tiền: `"Bạn thanh toán [-4.000] mua TP.HCM (Quận 1 - Nguyễn Huệ) từ Ngân Hàng"`
- **Hệ quả thị giác & công thái học**:
  - Tên ô đất xuất hiện lặp lại 2 lần liên tiếp.
  - Từ ngữ hành chính lặp lại 3 lần ("MUA / ĐẦU TƯ / mua").
  - Đuôi chữ `"từ Ngân Hàng"` thừa thãi làm bẻ dòng trên màn hình mobile 360px, khiến chiều cao badge phình to lên tới ~96px gây che khuất sa bàn 3D.

### 1.2. Giải Pháp Triển Khai (Lean Flow & Conditional Formula)
1. **Cơ chế Hiển thị Có Điều Kiện (`Boolean(narrative.formula?.trim())`)**:
   - Dòng thước kẻ `📐` (`transaction-formula-line`) chỉ hiển thị khi có công thức tính toán thực tế.
   - Với giao dịch niêm yết cố định (`buy`, `upgrade`), trả về chuỗi rỗng `''`. Thẻ tự động co lại thành 2 tầng thanh thoát (Header + Dòng Tiền), tiết kiệm ~32% chiều cao màn hình.
2. **Bảo tồn 100% các công thức phức tạp**:
   - Các hành động Thuế 10% tối đa 2.000 Tr., Độc quyền x2 tiền thuê, Cước Viettel 150 Tr., Thế chấp 50%, Bảo lãnh kiểm toán... tiếp tục hiển thị đầy đủ dòng `📐` minh bạch.
3. **Câu văn tự nhiên & Không lặp từ ngữ**:
   - Mua đất: `"Bạn thanh toán [-4.000] mua sở hữu TP.HCM (Quận 1 - Nguyễn Huệ)"`.
   - Nâng cấp: `"Bạn thanh toán [-600] nâng cấp nhà Bến Bạch Đằng"`.
   - Bổ sung regex phòng vệ tránh lỗi vấp từ `"sở hữu sở hữu"` hay `"mua sở hữu Mua"`.

---

## 2. HỒ SƠ THAY ĐỔI MÃ NGUỒN VẬT LÝ & NGÂN SÁCH LOC

Đo lường tự động bởi `node scripts/check_loc.mjs`:

| Tệp Vật Lý | Phân Loại Tier | Total Lines | Non-Empty SLOC | Trần Ngân Sách | Đánh Giá |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/ui/floating_numbers.tsx` | Tier 2 (UI Views) | **292** | 266 | <= 500 | ✔️ An toàn |
| `src/client/ui/transaction_formula.ts` | Tier 2 (UI Views) | **77** | 75 | <= 500 | ✔️ An toàn |
| `src/client/ui/transaction_narrative.ts` | Tier 2 (UI Views) | **270** | 248 | <= 500 | ✔️ An toàn |
| `tests/contracts/imp229_lean_flow_financial_notification.test.ts` | Contract Tests | **437** | 399 | <= 600 | ✔️ An toàn |
| `docs/domain/gotchas.md` | Domain Invariants | — | — | — | Gotcha #21 added |

---

## 3. BẰNG CHỨNG KIỂM THỬ & QUY TRÌNH 4 TRẠM

### 3.1. Station 1 — RED Contract Test (`qa-tester`)
- Tạo 18 atomic tests trong `tests/contracts/imp229_lean_flow_financial_notification.test.ts`.
- Chứng minh Inversion Gate ĐỎ hợp lệ: 9 Business RED / 9 Invariant GREEN (không có Infrastructure RED).

### 3.2. Station 2 — GREEN Implementation (`implementer`)
- Áp dụng các thay đổi tối thiểu vào 3 file UI.
- Chuyển toàn bộ 18/18 tests sang GREEN.
- Bảo toàn 100% tests di sản: `imp216` (16/16 tests), `imp194` (20/20 tests).

### 3.3. Station 2.5 — Fast Pre-Filter Sweep (`scout`)
- `tsc --noEmit`: Exit code 0, 0 lỗi kiểu.
- `lint:slop`: Complexity <= 5, 0 errors, 0 warnings.
- `lint:ui`: 0 anti-patterns qua 205 files.
- LOC Budget: Tất cả các file nằm trong trần ngân sách.
- 0 dirty casts (`as any`), 0 console.log thừa.

### 3.4. Station 3 — Independent Review Funnel
- **Phase 3.1 (`spec-reviewer`)**: APPROVED — 100% khớp plan, 0 scope drift, truy vết đầy đủ từ `TC-229.01` đến `TC-229.18`.
- **Phase 3.2 (`code-reviewer`)**: APPROVED — Kiến trúc sạch, Deep Modules, 0 timer/memory leak, an toàn trước chuỗi khoảng trắng.
- **Phase 3.2 (`ui-craft-reviewer`)**: APPROVED — 2-tier mode tiết kiệm 32% chiều cao, chuẩn công thái học mobile 360px, triệt tiêu văn bản hành chính rườm rà.

### 3.5. Station 4 — Adversarial Boundary & Mutation Sentinel (`chaos-sentinel`)
- **Probe 1 (Closed-Loop Parity)**: 24/24 Intent parity, buy/upgrade dispatch toàn vẹn dữ liệu.
- **Probe 2 (Ephemeral Boundary)**: 0 crash trên 10 trường hợp biên (chuỗi khoảng trắng, title undefined, thiếu cellName).
- **Probe 3 (Mutation Sensitivity)**: Tiêm 3 mutant vào `transaction_formula.ts`, `floating_numbers.tsx`, `transaction_narrative.ts` ➔ **Diệt 3/3 mutants (100% kill rate)**.
- Evidence snapshot: `.agents/evidence/chaos_sentinel_IMP229.json` (`executed: true`).

---

## 4. GIẢI TRÌNH & TIẾP THU CÁC ĐIỂM PHẢN BIỆN PHÒNG VỆ (DEFENSIVE AUDIT RETROSPECTIVE)

### 4.1. Phân Loại Tier Ngân Sách `transaction_narrative.ts`
- **Ghi nhận**: Báo cáo draft trước đó ghi trần `<= 300` (nhầm sang ngân sách Tier 1 Domain Logic).
- **Hiệu chỉnh**: Đã chuẩn hóa về đúng **Tier 2 (UI Views) với trần ngân sách <= 500 LOC**. Tệp hiện tại là 270 dòng vật lý (248 SLOC thực tế), tuyệt đối an toàn.

### 4.2. Về Thông Tin Cấp Độ Nâng Cấp `(C1, C2, C3)` và Tính Kế Thừa Gốc
- **Làm rõ bản chất**:
  - Trong `IMP-194`, trường `detail?: string` lưu cấp độ `(C1)`. Tuy nhiên, ngay từ `IMP-194`, `FloatingBadge` (`floating_numbers.tsx#L186-206`) được thiết kế có chủ ý là **không render `detail`** trên dòng tiền tự nhiên nhằm khống chế thẻ trong 1-2 dòng ngắn gọn trên màn hình mobile 360px.
  - IMP-229 **hoàn toàn không sửa đổi nhánh case 'upgrade'** của `transaction_narrative.ts`. Việc hiển thị `"Bạn thanh toán [-600] nâng cấp nhà Bến Bạch Đằng"` (không kèm C1) là kế thừa nguyên vẹn từ thiết kế gốc của IMP-194, hoàn toàn không phải lỗi drop ngoài ý muốn của IMP-229.
  - *Định hướng*: Nếu muốn bổ sung cấp độ trực tiếp vào dòng tiền (ví dụ `"nâng cấp nhà Bến Bạch Đằng lên C1"`), đây là một tính năng nâng cấp UX mới và sẽ được đưa vào backlog một ticket riêng có đo đạc độ dài ký tự trên mobile 360px.

### 4.3. Phòng Vệ Tuyệt Đối Cho Delta Tombstone `item.formula === null`
- **Phát hiện**: Trong TypeScript interface, `formula?: string` định nghĩa kiểu là `string | undefined`. Tuy nhiên, khi nhận dữ liệu từ network delta tombstone của WebSocket, `item.formula` có thể mang giá trị `null`. Lệnh `if (item.formula !== undefined) return item.formula.trim();` khi gặp `null` sẽ kích hoạt `null.trim()` gây ra `TypeError` crash runtime.
- **Active Remediation Đã Áp Dụng**:
  ```typescript
  if (typeof item.formula === 'string') return item.formula.trim();
  if (item.formula === null) return '';
  ```
  Đồng thời đã bổ sung assertion kiểm thử phòng vệ trực tiếp trong `[TC-229.03/MSS]`, đảm bảo truyền `null` vẫn trả về `''` an toàn 100% không crash.

### 4.4. Đo Lường LOC Thống Nhất Bằng Công Cụ Chuẩn
- Toàn bộ số đo LOC trong báo cáo hiện được chốt theo công cụ chuẩn của repository: `node scripts/check_loc.mjs`.

---

## 5. KẾT LUẬN & BÀN GIAO
- Cải tiến **IMP-229** đã giải quyết dứt điểm visual slop trên các thông báo tài chính mà không gây hồi quy bất kỳ logic tính toán thuế/phí/tiền thuê nào.
- Trải nghiệm thị giác trên mobile 360px thoáng đãng, sắc sảo và thanh lịch hơn rõ rệt.
