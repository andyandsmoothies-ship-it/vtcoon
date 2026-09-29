# BÁO CÁO HOÀN THÀNH — IMP-228: ZERO-DELTA SUPPRESSION & AUDIT TELEPORTATION IMMUNITY

> **Mã Ticket**: `IMP-228` | **Loại Thay Đổi**: Tier 1 (Targeted Architectural Fix — Financial Matcher / Telemetry / Invariants)  
> **Trạng Thái**: ✅ **HOÀN THÀNH — PRODUCTION READY**  
> **Thực Hiện Theo**: Quy Trình TDD Đỏ-Xanh Khép Kín Hiến Pháp Antigravity (`GEMINI.md`)  
> **Suite Hợp Đồng**: [`tests/contracts/imp228_zero_delta_and_audit_teleportation.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp228_zero_delta_and_audit_teleportation.test.ts)

---

## 1. TỔNG QUAN VẤN ĐỀ VÀ NGUYÊN NHÂN GỐC

Từ snapshot ván đấu thực tế mã phòng `VTS37F` tại Tick #316:
- **Hiện tượng**: Bot 4 bị bắt vào tù (Trạm Kiểm Toán Ô 10) từ Ô 28 sau khi đổ xúc xắc 3 lần đôi liên tiếp. Mặc dù số dư tài khoản không đổi (3.598 Tr. -> 3.598 Tr., biến động ròng `diff = 0`), thanh thông báo Activity Log vẫn in dòng:
  > *"Bot 4 đã nộp phí / nộp thuế 0"*
  và bắn ra hiệu ứng Floating Badge hiển thị `-0 Tr.`.

- **Nguồn gốc lịch sử (Root Cause Chain)**:
  1. Lỗi bắt nguồn trực tiếp từ **IMP-225** (tại commit/file `src/client/network/activity_financial_tracker.ts#L78-L80`). Nhằm giải quyết ca người chơi vừa qua GO vừa dẫm BĐS dẫn đến bù trừ `diff = 0` (TC-225.03), IMP-225 đã thêm nhánh:
     ```typescript
     else if (hasPassedGo) {
       payers.push({ id: p.id, diff: 0, pInfo: prevP, cellIndex: playerPos });
     }
     ```
  2. Tuy nhiên, hàm kiểm tra vị trí `checkPassedGo(prevPos, newPos)` hoạt động theo công thức vòng tròn modulo: `newPos <= prevPos`. Khi Bot 4 bị dịch chuyển cưỡng chế từ Ô 28 về Ô 10, biểu thức `10 <= 28` trả về `true`!
  3. `collectPayersAndReceivers` trong `activity_financial_tracker.ts` không kiểm tra trạng thái bị vào tù (`inAudit`), dẫn đến đẩy một khoản nợ ma `{ diff: 0 }` vào mảng `payers`.
  4. Sang `extractPassedGoActivities` (`activity_rent_matcher.ts#L55-L56`), bot bị vào tù bị `isSentToAudit` chặn lại (không được phát lương), nhưng khoản nợ ma `{ diff: 0 }` trong `payers` không bị loại bỏ.
  5. Khoản nợ ma trôi xuống `processPayerFee` (`activity_rent_matcher.ts#L220`). Hàm này thiếu guard `absDiff <= 0`, dẫn đến in log thuế mặc định `0đ`.

---

## 2. NỘI DUNG VÀ KIẾN TRÚC TRIỂN KHAI

### 2.1 Cập Nhật Bất Biến Kiến Trúc Hệ Thống (Invariant Hardening)
- **Domain Gotchas (`docs/domain/gotchas.md`)**: Ghi nhận **Invariant #13: Zero-Delta Event Suppression & Audit Teleportation Immunity [IMP-228]** (SSOT duy nhất cho Domain Invariants theo kiến trúc phân tầng, giữ `GEMINI.md` tinh gọn tránh phình to quy tắc).
- **Agent Subagents**: Cập nhật tiêu chí kiểm thử cho `qa-tester.md` (Facet 4 & Facet 5) và chốt chặn phản biện `plan-griller.md` (Pillar 1 & Pillar 5).
- **SDLC Master Guide (`ai_native_sdlc_master_guide.md`)**: Ghi nhận thành Nguyên tắc 14, 15, 16 trong 16 Nguyên Tắc Kiểm Thử Đỉnh Cao.

### 2.2 Sửa Chữa Mã Nguồn Sản Xuất (Defense-in-Depth)
1. **`src/client/network/activity_financial_tracker.ts` (Dòng 67-73)**:
   Loại trừ triệt để người chơi bị tống giam vào Trạm Kiểm Toán khỏi cờ `hasPassedGo`:
   ```typescript
   const isSentToAudit = Boolean(
     p.inAudit === true ||
     (p.auditTurnsLeft && p.auditTurnsLeft > 0) ||
     nextState.playersInfo[p.id]?.inAudit === true,
   );
   const hasPassedGo = !isSentToAudit && prevPos !== undefined && newPos !== undefined && prevPos !== newPos && checkPassedGo(prevPos, newPos);
   ```
2. **`src/client/network/activity_rent_matcher.ts` (Dòng 55-60)**:
   Đồng bộ điều kiện kiểm tra `isSentToAudit` đa tầng phòng thủ.
3. **`src/client/network/activity_rent_matcher.ts` (Dòng 224 & Dòng 270)**:
   Thêm chốt chặn cửa ngõ tuyệt đối:
   - Trong `processPayerFee`: `if (absDiff <= 0) return null;`
   - Trong `processReceiverReward`: `if (receiver.diff <= 0) return null;`

---

## 3. KẾT QUẢ KIỂM THỬ VÀ BẢO BẢO CHẤT LƯỢNG

### 3.1 Quy Trình TDD Đỏ-Xanh (Adversarial Inversion)
- **Station 1 (RED)**: Bộ test `tests/contracts/imp228_zero_delta_and_audit_teleportation.test.ts` gồm 5 test cases (`TC-228.01` đến `TC-228.05`) chạy trên code cũ đã FAIL 4/5 ca chính xác với lỗi phát sinh log thuế 0đ.
- **Station 2 (GREEN)**: Sau khi vá các guard, toàn bộ 5 test cases đạt `PASS 5/5` (5ms).

### 3.2 Kiểm Tra Hồi Quy (Regression Gate)
- `tests/contracts/imp225_financial_activity_log_collision.test.ts`: **16/16 tests PASS** (bảo toàn 100% ca đi bộ qua GO bù trừ tiền thuê).

### 3.3 Kiểm Soát Ngân Sách LOC & Linting
- `check:loc`:
  - `src/client/network/activity_financial_tracker.ts`: 231 LOC (Trần: 400 LOC) — ✔️ An toàn.
  - `src/client/network/activity_rent_matcher.ts`: 303 LOC (Trần: 400 LOC) — ✔️ An toàn.
  - `tests/contracts/imp228_zero_delta_and_audit_teleportation.test.ts`: 157 LOC (Trần: 600 LOC) — ✔️ An toàn.
- `tsc --noEmit`: **Code 0** (0 lỗi định kiểu).
- `lint:ui`: **0 violations**.
