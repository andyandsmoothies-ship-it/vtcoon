# BÁO CÁO NGHIỆM THU VÉ IMP-187: MINH BẠCH GIAO DỊCH M&A, CẢNH BÁO NẠN NHÂN VÀ HIỆU CHUẨN TELEMETRY GIẢI CHẤP

> **Vé Kỹ Thuật:** IMP-187  
> **Trạng Thái:** 🟢 **HOÀN THÀNH 100% (STATION 3 APPROVED)**  
> **Quy Trình Áp Dụng:** Kích Hoạt Quy Trình 3 Trạm (3-Station Pipeline: RED -> GREEN -> REVIEW)  
> **Ngày Hoàn Tất:** 2026-09-24  

---

## 1. TỔNG QUAN VẤN ĐỀ VÀ MỤC TIÊU XỬ LÝ

Trận đấu ghi nhận từ hộp đen telemetry trực tiếp (`VTBX1T`) đã bộc lộ 2 sự cố logic nghiêm trọng:
1. **Báo Động Đỏ Giả Telemetry (`TREASURY_INVARIANT_VIOLATED`)**:
   - Tại Tick 307: Bot AI 2 giải chấp Viettel Telecom (Cell 28, nợ gốc 750 Tr., phí 10% = 75 Tr.). Telemetry trừ cả gốc và phí `deltaSum -= (loan + fee)`, gây lệch -750 Tr.
   - Tại Tick 312: Bot AI 3 giải chấp Kiên Giang (Cell 27, nợ gốc 1.300 Tr., phí 10% = 130 Tr.). Telemetry trừ cả gốc và phí, gây lệch -1.300 Tr.
   - *Bản chất kế toán*: Phí giải chấp 10% nộp vào Kho Bạc là chuyển nhượng nội bộ giữa người chơi và Kho Bạc (cả hai đều thuộc tổng tài sản hệ thống). Biến động lưu thông ròng của toàn hệ thống chỉ là `-loan` (hoàn trả tín dụng cho ngân hàng).
2. **Hiểu Lầm Giao Dịch M&A Là Tiền Thuê & Bật Hoạt Ảnh Ăn Mừng Oan Ứng Cho Nạn Nhân**:
   - Tại Tick 309: Bot AI 3 dùng thẻ Cơ Hội `CC_MA_FORCE` ép mua khu đất Đà Nẵng của Người chơi 1 với giá 2.400 Tr.
   - `activity_financial_tracker.ts` quét thấy P1 nhận 2.400 Tr. và Bot 3 mất 2.400 Tr., lập tức gộp nhầm thành "P1 thu tiền thuê 2.400 Tr. từ Bot 3" và kích hoạt hoạt ảnh ăn mừng (`victory_spin` + chuông reo vàng son) cho nạn nhân vừa bị cướp đất.
3. **4 Điểm Mù Kiến Trúc Bổ Sung [RB-6] - [RB-9]**:
   - [RB-6]: `isMobile` không được truyền từ `GameBoard` -> `board_layout.tsx` -> `LayeredDioramaTile`, buộc 40 ô phải gọi `isMobileHardware()` lặp lại.
   - [RB-7]: `subscribeTextureRevision` có chữ ký `(listener: (revision: number) => void)` không khớp chuẩn `() => void` của `useSyncExternalStore`.
   - [RB-8]: Cảnh báo ngân sách LOC cho `activity_tracker.ts` (477 LOC) và `telemetry_delta_hook.ts` (401 LOC).
   - [RB-9]: Thiếu popup cảnh báo rõ ràng cho nạn nhân bị thâu tóm đất.

---

## 2. KẾT QUẢ TRIỂN KHAI THEO 3 TRẠM

### Trạm 1: RED Contract Tests
- Đã tạo `tests/contracts/imp187_ma_visibility_and_unmortgage_telemetry.test.ts` (573 LOC) với 16 atomic test cases đạt chuẩn Adversarial Inversion:
  - `[TC-187.01/MSS]` - `[TC-187.03/MSS]`: Tái hiện Tick 307 & 312, xác nhận `expectedDelta = -750` và `-1300`.
  - `[TC-187.04/MSS]` - `[TC-187.06/MSS]`: Xác thực `verifyTreasuryConservation` trả về `null`, bảo lưu logic hấp thụ phát mãi (L284).
  - `[TC-187.07/MSS]` - `[TC-187.09/MSS]`: Tách biệt giao dịch M&A khỏi danh sách khớp tiền thuê.
  - `[TC-187.10/MSS]`: Khẳng định trục thời gian nhân quả: Thẻ sự kiện ➔ Chuyển giao BĐS ➔ Dòng tiền.
  - `[TC-187.11/MSS]` - `[TC-187.14/MSS]`: Cảnh báo 2 dòng cho nạn nhân, triệt tiêu `victory_spin`, popup cho người mua.
  - `[TC-187.15/MSS]` - `[TC-187.16/MSS]`: Fallback an toàn khi thiếu thông tin owner và hỗ trợ thẻ `CC_SWAP_PROJECT`.

### Trạm 2: GREEN Production Implementation
1. **Hiệu Chuẩn Telemetry Lưu Thông (`telemetry_delta_hook.ts`)**:
   - Sửa dòng L187 từ `deltaSum -= (loan + fee)` thành `deltaSum -= loan`.
   - Giữ nguyên L280-L284 cho đấu giá phát mãi nộp thẳng vào Kho Bạc.
   - Tối ưu hóa LOC xuống **397 LOC** (tuân thủ trần Tier 1 < 400 LOC).
2. **Tách Giao Dịch M&A (`activity_property_tracker.ts`, `activity_financial_tracker.ts`)**:
   - Thu thập `buyoutCellIndices` khi có thẻ M&A / Hoán đổi dự án.
   - Thêm `handledPayerIds` và `handledReceiverIds` để ngăn hàm `matchRentTransactions` ghép đôi nhầm.
   - Thêm hành động `ma_buyout` vào `FloatingActionType` và biểu tượng 🤝.
3. **Module Hóa Dispatcher (`activity_badge_dispatcher.ts` - NEW, 209 LOC)**:
   - Trích xuất toàn bộ logic dispatch floating badges ra khỏi `activity_tracker.ts`.
   - Giảm dung lượng `activity_tracker.ts` từ 477 LOC xuống **326 LOC** (tuân thủ trần Tier 1 < 400 LOC).
   - Triệt tiêu `victory_spin` cho nạn nhân bị thâu tóm, thay bằng thông báo 2 dòng rõ ràng: "⚡ Bị thâu tóm: [Tên ô đất] / Đối thủ đã mua đứt ô đất của bạn (+X Tr.)".
4. **Chuẩn Hóa Điểm Mù [RB-6] & [RB-7]**:
   - [RB-6]: `board_layout.tsx` memoize `isMobileHardware()` một lần tại `GameBoard` và truyền rõ ràng `isMobile={isMobile}` xuống `LayeredDioramaTile`.
   - [RB-7]: `texture_revision.ts` chuẩn hóa chữ ký `(listener: (revision?: number) => void) => () => void` khớp 100% với React `useSyncExternalStore`.
5. **Cập Nhật Thư Viện Luật & Bất Biến**:
   - Ghi nhận Bất biến **#255** vào `docs/domain/gotchas.md` và bảng Domain Index (`[FSM/RULE]`, `[NET/SYNC]`, `[UI/CRAFT]`, `[TELEMETRY]`).
   - Cập nhật 4 tầng rule/skill chống điểm mù theo thỏa thuận với User.

### Trạm 3: Independent Reviews (Audited on Physical Disk)
- **`spec-reviewer`**: **APPROVED (100% ĐẠT)** — Toàn bộ diff được kiểm tra vật lý, 16 atomic tests phủ trọn vẹn yêu cầu, 0 scope drift.
- **`ui-craft-reviewer`**: **SHIP (PASS)** — 0 lỗi P1-P8, 0 anti-pattern, bảo toàn tactile shadows và bố cục 360px mobile.

---

## 3. KẾT QUẢ KIỂM THỬ TỔNG HỢP

| Hạng Mục Kiểm Thử | Lệnh Thực Hiện | Kết Quả |
| :--- | :--- | :---: |
| **Living Contract Test IMP-187** | `npx vitest run tests/contracts/imp187_ma_visibility_and_unmortgage_telemetry.test.ts` | **16/16 PASS** |
| **Comprehensive Popups Contract** | `npx vitest run tests/contracts/imp122_comprehensive_popups.test.ts` | **25/25 PASS** |
| **Mobile Compact HUD Contract** | `npx vitest run tests/client/imp187_player_card_compact_hud.test.ts` | **5/5 PASS** |
| **Mobile Modals Contract** | `npx vitest run tests/client/mobile_compact_hud_and_modals.test.ts` | **27/27 PASS** |
| **Constitution & LOC Governance** | `npx vitest run tests/contracts/constitution_governance.test.ts` | **13/13 PASS** |
| **Impeccable 2D UI Craft Linter** | `npm run lint:ui` | **0 Vi Phạm (175 files)** |
| **Anti-Slop Linter (LOC Budgets)** | `npm run lint:slop` | **0 Lỗi trên các file chạm** |
| **Toàn Bộ Test Suite Dự Án** | `npm test` | **312/312 Suites · 6.305/6.305 Tests PASS (100%)** |

---

## 4. BẢNG MA TRẬN DUNG LƯỢNG MÃ NGUỒN (LOC CEILINGS)

| File Mã Nguồn | Phân Loại | Trần LOC Cho Phép | Dòng Thực Tế | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: |
| `src/client/telemetry/telemetry_delta_hook.ts` | TIER 1 (Logic) | 400 | **397** | 🟢 Đạt chuẩn |
| `src/client/network/activity_tracker.ts` | TIER 1 (Logic) | 400 | **326** | 🟢 Đạt chuẩn |
| `src/client/network/activity_badge_dispatcher.ts` | TIER 1 (Logic) | 400 | **209** | 🟢 Đạt chuẩn |
| `src/client/network/activity_financial_tracker.ts` | TIER 1 (Logic) | 400 | **303** | 🟢 Đạt chuẩn |
| `src/client/network/activity_property_tracker.ts` | TIER 1 (Logic) | 400 | **237** | 🟢 Đạt chuẩn |
| `src/client/ui/floating_numbers.tsx` | TIER 2 (UI) | 500 | **347** | 🟢 Đạt chuẩn |
| `tests/contracts/imp187_ma_visibility_and_unmortgage_telemetry.test.ts` | TIER 4 (Living Test) | 600 | **573** | 🟢 Đạt chuẩn |
