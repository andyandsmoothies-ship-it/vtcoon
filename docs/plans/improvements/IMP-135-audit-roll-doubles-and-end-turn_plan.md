# [IMP-135] Kế Hoạch Cho Phép Gieo Đôi Thoát Án Kiểm Toán & Triệt Tiêu Lỗi INVALID_PHASE Khi Hết Lượt (Audit In-Jail Roll Doubles & Zero-InvalidPhase EndTurn)

> **Mã Cải Tiến**: `IMP-135`  
> **Mức Độ**: 🔴 FSM State Machine / Server Turn Loop & Client UI Hardening (Tier 2 - Full Rigor)  
> **Traceability**: `[UC-IMP135]`, `tests/client/imp135_audit_roll_doubles_and_end_turn.test.ts`, Gotcha #180

---

## 1. Bối Cảnh & Vấn Đề Nghiệp Vụ
- **Bối cảnh**: Tại Trạm Kiểm Toán Ô 10, thông điệp hướng dẫn trên thanh ActionDock hiển thị: `⚖️ Đang thụ án kiểm toán (còn X lượt): Gieo đôi để tự do, nộp bảo lãnh hoặc chấp hành án.` Tuy nhiên, người chơi phản ánh nút "Đổ Xúc Xắc" bị vô hiệu hóa hoàn toàn ngay từ đầu lượt, và khi bấm nút "Hết Lượt" thì bị máy chủ ném lỗi `INVALID_PHASE`.
- **Nguyên nhân gốc**:
  1. *Client UI Locking*: Hàm `isRollActionDisabled` trong `src/client/ui/ui_helpers.ts:111` bị gài cứng `Boolean(params.inAudit)`, khóa nút "Đổ Xúc Xắc" vô điều kiện ngay cả khi `hasRolledThisTurn: false`.
  2. *Contract Assertion Legacy*: Test hợp đồng cũ `tests/contracts/imp79_experience_consistency.test.ts:240` (TC-79.3.1) ép kiểm tra `isRollActionDisabled` trả về `true` khi `inAudit = true` ngay cả khi chưa đổ xúc xắc.
  3. *Chốt chặn Server FSM*: Server FSM tại `src/server/turn_loop.ts:174` đã có miễn trừ `(current.auditTurnsLeft ?? 0) <= 0`, nhưng Client bị khóa nút đổ nên dồn người chơi vào tình huống chỉ có thể bấm "Hết Lượt".

---

## 2. Thiết Kế Kỹ Thuật

### 2.1. Cập nhật Hàm Điều Khiển Nút Bấm Client (`src/client/ui/ui_helpers.ts`)
- **Trong `isRollActionDisabled`**:
  - Chuyển `Boolean(params.inAudit)` thành `Boolean(params.inAudit && params.hasRolledThisTurn && !params.canRollAgain)`.
  - Kết quả: Khi `inAudit: true` và `hasRolledThisTurn: false`, người chơi được kích hoạt nút "Đổ Xúc Xắc" để thử vận may ra đôi thoát án. Nếu gieo 1 lần không ra đôi (`hasRolledThisTurn: true`), nút gieo lập tức bị vô hiệu hóa để ngăn chặn double-roll exploit.
- **Trong `isEndTurnDisabled`**:
  - Bổ sung điều kiện chốt chặn: `!params.canRollAgain && (params.inAudit || ...)`.
  - Kết quả: Khi đang thụ án mà chưa đổ, người chơi có thể bấm "Hết Lượt" để chấp hành án trừ 1 vòng. Khi gieo xúc xắc ra đôi và được quyền gieo tiếp (`canRollAgain: true`), nút "Hết Lượt" bị khóa theo luật buộc người chơi phải gieo tiếp.

### 2.2. Hiệu Chỉnh Contract Test Cũ (`tests/contracts/imp79_experience_consistency.test.ts`)
- Đảo ngược assertion của `TC-79.3.1`:
  - `hasRolledThisTurn: false` $\to$ `isRollActionDisabled` phải trả về `false`.
  - `hasRolledThisTurn: true` $\to$ `isRollActionDisabled` phải trả về `true`.

---

## 3. Kế Hoạch Xác Minh 3 Trạm
- **Trạm 1 (RED Contract Tests)**: `qa-tester` tạo 28 atomic tests kiểm chứng 4 Facets trong `tests/client/imp135_audit_roll_doubles_and_end_turn.test.ts`.
- **Trạm 2 (GREEN Implementation)**: `implementer` chỉnh sửa mã nguồn tối thiểu vượt qua 28/28 tests.
- **Trạm 3 (Independent Review)**: `spec-reviewer` đối soát đĩa thực tế và duyệt `APPROVED`.
