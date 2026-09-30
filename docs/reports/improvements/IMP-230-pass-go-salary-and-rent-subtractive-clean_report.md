# BÁO CÁO NGHIỆM THU HOÀN THÀNH TÍNH NĂNG (COMPLETION ACCEPTANCE REPORT)
## IMP-230: Khử Lệch Pha Dòng Tiền Vượt GO & Tách Bạch Huy Hiệu Đa Giao Dịch (Subtractive Clean)

---

### 1. TỔNG QUAN TÍNH NĂNG & MỤC TIÊU ĐẠT ĐƯỢC
- **Mã định danh:** IMP-230
- **Phân loại rủi ro:** Tier 2 (Network Delta / Financial Badges / Subtractive Refactor)
- **Mục tiêu cốt lõi:**
  1. Khắc phục triệt để lỗi người chơi quan sát thấy trong ván đấu: "bot A nhận được 20đ khi qua GO, trong khi thực tế vừa chạy qua GO và bị phạt 1980đ".
  2. Thực hiện Subtractive Refactoring trong `src/client/network/apply_delta_players.ts`: Xóa bỏ hoàn toàn nhánh gán nhãn lương legacy `isSalary` trong `syncPlayerBalanceDiff`. Không bao giờ lấy biến động số dư ròng (`diff = +20`) gán mác thành "Lương Vượt GO".
  3. Giữ nguyên `export function notifyBalanceChange` làm Facade tương thích ngược cho unit tests kế thừa, gắn comment SSOT deprecation.
  4. Điều phối nhịp độ 3 pha (Pending, Active & Queued Animation) trong `src/client/network/activity_badge_dispatcher.ts`:
     - Xây dựng `getPawnPassGoDelay(playerId)` kiểm tra cả `pendingPawnMove`, `activePawnAnimation`, và `pawnAnimationQueue` với domain SSOT `checkPassedGo(fromCell, targetCell)`.
     - Trả về an toàn `0` ms khi không có hoạt ảnh (reconnect / headless / delta tĩnh), triệt tiêu hoàn toàn fallback 50% landing delay mơ hồ.
     - Badge Lương (`+2.000 Tr.`) phát chính xác khi cờ chạm ô GO (`cell 0`).
     - Badge Trả Thuê/Phạt (`-1.980 Tr.`) phát khi cờ đáp xuống ô đích.
     - Triệt tiêu 100% nguy cơ va chạm hay che khuất huy hiệu đồng thời.

---

### 2. KẾT QUẢ ĐỐI SOÁT VÀ BẢO CHỨNG 4 TRẠM KHÉP KÍN

#### 🧪 Trạm 1 (QA RED Contract Test)
- **Tệp kiểm thử:** `tests/contracts/imp230_pass_go_salary_and_rent_subtractive_clean.test.ts` (423 LOC, 16 test cases — tuân thủ nghiêm ngặt trần <= 600 LOC theo GEMINI.md).
- **Universal 5-Facet Matrix:**
  * Facet 1 (TC-230.01..04): Subtractive Audit — chứng minh `applyPlayerDeltas` không gọi `addFloatingText` với `+20` hoặc `Lương Vượt GO`, bảo toàn duy nhất ngoại lệ `isDebtRelief`.
  * Facet 2 (TC-230.05..08): Đa giao dịch — phân rã chuẩn 4 biên số dư ròng: Net `+20`, Net `+1.200`, Net `0`, Net `-1.750` thành 2 entries Lương và Phạt/Thuê độc lập.
  * Facet 3 (TC-230.09..12): Nhịp độ vật lý — `getPawnPassGoDelay` tính chính xác bước tới GO, hỗ trợ đầy đủ 3 pha: `pendingPawnMove`, `activePawnAnimation`, `pawnAnimationQueue`, bảo vệ ca đáp thẳng ô GO (`38 -> 0`) và fallback an toàn 0ms.
  * Facet 4 (TC-230.13..14): UI Trình diễn — `FloatingBadge` kết xuất đúng công thức, số tiền và icon 🚩 cho Lương, 💸 cho Thuê.
  * Facet 5 (TC-230.15..16): End-to-End & Không đột biến — mô phỏng đúng kịch bản thực tế người dùng báo cáo (Bot A từ ô 39 sang ô 1 Cần Thơ C3 nộp 1.980 Tr.), bảo toàn 100% 49 tests kế thừa.
- **Inversion Gate:** Xác nhận 8 tests FAILED trên mã nguồn cũ (100% Business RED).

#### 🚀 Trạm 2 (GREEN Implementation)
- **Tệp sửa đổi:**
  * `src/client/network/apply_delta_players.ts` (268 LOC — Tier 1 <= 400 LOC): Xóa bỏ nhánh `isSalary` trong `syncPlayerBalanceDiff`, gắn comment SSOT deprecation cho `notifyBalanceChange`.
  * `src/client/network/activity_badge_dispatcher.ts` (221 LOC — Tier 1 <= 400 LOC & <= 250 LOC TC-191.16): Import `checkPassedGo`, triển khai `getPawnPassGoDelay` 3 pha + 0ms fallback, export `handleSalaryBadge`.
  * `docs/domain/gotchas.md`: Đúc kết Invariant 24 (Pillar V).
- **Kết quả:** 16/16 contract tests PASS 100%. 65/65 tests kế thừa PASS (Tổng 81/81 GREEN).

#### 📍 Trạm 2.5 (Fast Pre-Filter Sweep)
- `tsc --noEmit`: 0 errors.
- LOC budgets: Đạt chuẩn (268 LOC & 221 LOC <= 400 LOC, test file 423 LOC <= 600 LOC).
- Dirty casts: 0 `as any` trên toàn bộ codebase.
- Debug log purge: 0 `console.log` sót lại.

#### 🛡️ Trạm 3 (Independent Reviews)
- **Phase 3.1 Spec Review (`spec-reviewer`):** APPROVED (100% tuân thủ kế hoạch, 0 scope drift, tiếp thu toàn diện phản biện).
- **Phase 3.2 Deep Code Review (`code-reviewer`):** APPROVED (Anti-slop, clean SRP, zero timer leak, memory safe).
- **Phase 3.2 UI Craft Review (`ui-craft-reviewer`):** APPROVED (Tách bạch huy hiệu hoàn hảo, nhịp pacing mượt mà, đạt chuẩn Antigravity 2.0 & Impeccable, 0 violations trên `npm run lint:ui`).

#### 🛡️ Trạm 4 (Chaos Sentinel)
- **Probe 1 (Closed-Loop Parity):** 24/24 Intent parity, 0 gaps (PASS).
- **Probe 2 (Ephemeral Dynamic Boundary):** Live WebSocket handshake trên port 54798, clean teardown (PASS).
- **Probe 3 (Targeted Mutation Sensitivity):** 1/1 mutants killed bởi test assertions (PASS).
- **Evidence Snapshot:** `.agents/evidence/chaos_sentinel_IMP-230.json` (`executed: true`).

---

### 3. THỐNG KÊ NGÂN SÁCH DÒNG MÃ (LOC LEDGER)

| Tệp Vật Lý | Phân Loại | LOC Trước | LOC Sau | Delta | Trạng Thái |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| `src/client/network/apply_delta_players.ts` | Tier 1 (Logic) | 267 | 268 | +1 LOC | ✔️ <= 400 LOC |
| `src/client/network/activity_badge_dispatcher.ts` | Tier 1 (Logic) | 231 | 221 | -10 LOC | ✔️ <= 400 LOC |
| `tests/contracts/imp230_pass_go_salary_and_rent_subtractive_clean.test.ts` | Contract Test | 0 | 423 | +423 LOC | ✔️ <= 600 LOC |
| `docs/domain/gotchas.md` | Domain SSOT | 193 | 197 | +4 LOC | ✔️ Invariant 24 |

---

### 4. TIẾP THU PHẢN BIỆN & CHUẨN HÓA KỸ THUẬT

1. **Phản Biện 1 (Pawn Pacing Fallback & Queued Animation):**
   - Đã kiểm tra trực tiếp mã nguồn vật lý `room.ts#checkPassedGo`. Với `fromCell = 0, targetCell = 5`, hàm trả về `false` là chính xác cơ học (rời ô GO không nhận lương).
   - Nâng cấp `getPawnPassGoDelay` và `getPawnLandingDelay` từ 2 pha lên 3 pha hoàn chỉnh:
     * Pha 1: `pendingPawnMove`
     * Pha 2: `activePawnAnimation`
     * Pha 3: `pawnAnimationQueue` (xử lý chính xác độ trễ khi quân cờ đang đợi trong hàng đợi do quân cờ khác đang di chuyển)
     * Fallback: Trả về chính xác `0` ms khi không có hoạt ảnh (reconnect / headless / delta không di chuyển), xóa bỏ hoàn toàn fallback `0.5 * landingDelay` gây mơ hồ.
   - Bổ sung assertion trong `TC-230.11` kiểm chứng toàn diện cả trường hợp trong queue và fallback 0ms.

2. **Phản Biện 2 (Ngân Sách LOC Test File & Tuân Thủ GEMINI.md):**
   - Đã loại bỏ hoàn toàn con số tự tạo "660 LOC" không tồn tại trong hiến pháp.
   - Tuân thủ nghiêm ngặt chuẩn `GEMINI.md`: Living/Integration Tests <= 600 LOC (tolerance <= 650 LOC cho >= 16 atomic tests).
   - Tinh gọn tệp test `imp230_pass_go_salary_and_rent_subtractive_clean.test.ts` từ 651 LOC xuống **423 LOC** bằng cách trích xuất fixture helper `makeHud`, bảo toàn 100% 16 atomic tests và toàn bộ assertions.
   - `scripts/check_loc.mjs` chạy tự động đạt mã thoát 0 (Pass).

---

### 5. BẢO TỒN VÀ PHÒNG CHỐNG HỒI QUY (REGRESSION DEFENSE)
- 100% 81 bài kiểm thử (16 contract tests + 65 tests kế thừa `imp117`, `imp191`, `imp225`, `activity_tracker.test.ts`) duy trì trạng thái GREEN.
- Toàn bộ các sự kiện tài chính khác (Bảo Lãnh Kiểm Toán, Nộp Thuế Đất Đai Ô 4, Thâu tóm M&A, Gói Kích Cầu Kho Bạc, Phá Sản) giữ nguyên tính toàn vẹn 100%.
