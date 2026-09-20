# [IMP-135] Báo Cáo Hoàn Tất Cho Phép Gieo Đôi Thoát Án Kiểm Toán & Triệt Tiêu Lỗi INVALID_PHASE Khi Hết Lượt (Audit In-Jail Roll Doubles & Zero-InvalidPhase EndTurn)

> **Mã Cải Tiến**: `IMP-135`  
> **Trạng Thái**: 🟢 HOÀN TẤT (100% Green / Spec Reviewer Approved / Zero-Warning Gate Passed)  
> **Traceability**: `[UC-IMP135]`, `tests/client/imp135_audit_roll_doubles_and_end_turn.test.ts`, Gotcha #180

---

## 1. Kết Quả Triển Khai Thực Tế

| Tệp Thay Đổi | Thay Đổi Thực Tế | Tác Dụng Kỹ Thuật |
| :--- | :--- | :--- |
| `src/client/ui/ui_helpers.ts` | +4 / -2 LOC | Mở nút Đổ Xúc Xắc khi `inAudit` và `!hasRolledThisTurn`; khóa an toàn khi đã đổ; khóa Hết Lượt khi `canRollAgain: true`. |
| `tests/contracts/imp79_experience_consistency.test.ts` | +12 / -8 LOC | Cập nhật TC-79.3.1 theo SSOT mới: cho phép gieo đầu turn khi thụ án và khóa sau khi đã gieo. |
| `tests/client/imp135_audit_roll_doubles_and_end_turn.test.ts` | 28 atomic tests (MỚI) | Bộ test hợp đồng độc lập 4-Facet kiểm thử toàn diện trạng thái nút bấm, gieo đôi, chấp hành án và component markup. |
| `docs/domain/gotchas.md` | +23 LOC | Ghi nhận Gotcha #180 `[FSM/AUDIT]` và chuẩn hóa chỉ mục FSM. |

---

## 2. Các Bất Biến Kỹ Thuật Then Chốt (Architectural Invariants)

1. **In-Jail Roll Doubles Rights Invariant (Gotcha #180)**:
   - Người chơi bị tạm giam tại Ô 10 (Trạm Kiểm Toán) có quyền hiến định được gieo xúc xắc đầu turn (`hasRolledThisTurn: false`) để tìm cơ hội gieo xúc xắc đôi tự do.
   - Nếu gieo ra đôi: Server FSM xóa án kiểm toán lập tức (`current.auditTurnsLeft = 0; current.consecutiveDoubles = 0; return { stopped: false };`), quân cờ tiến bước theo tổng điểm xúc xắc.
   - Nếu không ra đôi: Server chuyển pha sang `PropertyManagement`, `hasRolledThisTurn = true`. Nút gieo lập tức bị khóa qua điều kiện `Boolean(params.inAudit && params.hasRolledThisTurn && !params.canRollAgain)`.

2. **Mandatory Roll Continuation Invariant**:
   - Khi người chơi được quyền gieo tiếp (`canRollAgain: true`), nút "Hết Lượt" BẮT BUỘC phải vô hiệu hóa (`isEndTurnDisabled === true`), kể cả trong ngữ cảnh đang thụ án kiểm toán.

3. **Zero-InvalidPhase Serving Sentence Invariant**:
   - Người chơi có quyền không gieo xúc xắc mà bấm thẳng "Hết Lượt" ngay đầu turn để chấp hành án trừ 1 lượt. Server tại `src/server/turn_loop.ts:174` miễn trừ kiểm tra `!rolledThisTurn` cho người có `auditTurnsLeft > 0`, triệt tiêu 100% lỗi `INVALID_PHASE`.

---

## 3. Bằng Chứng Nghiệm Thu 3 Trạm

- **Trạm 1 (RED Contract Tests)**: `qa-tester` tạo 28 atomic tests trong `tests/client/imp135_audit_roll_doubles_and_end_turn.test.ts`, chứng minh thất bại ban đầu (7 FAILED, 21 PASSED).
- **Trạm 2 (GREEN Implementation)**: `implementer` chỉnh sửa `src/client/ui/ui_helpers.ts` và `tests/contracts/imp79_experience_consistency.test.ts`, đưa toàn bộ 28/28 tests mới và 18/18 tests cũ về trạng thái **100% PASS**.
- **Trạm 3 (Independent Review)**: `spec-reviewer` đối soát đĩa thực tế và ban hành **VERDICT: APPROVED** (100% Spec reconciliation, zero scope creep).
- **Cổng Kiểm Soát Chất Lượng Nhanh (`npm run gate:quick`)**: Exit Code 0 (0 TS errors, 1.69% jscpd duplication, 33/33 mô hình 3D đạt 1.38 MB / 2.5 MB, snapshot evidence hoàn tất).
- **Kiểm Tra Giao Diện (`npm run lint:ui`)**: 0 vi phạm trên toàn bộ 157 tệp UI.
