# ADR-0004: BẢO TOÀN QUỸ KHO BẠC & CHU KỲ 11 VI TRẠNG THÁI FSM (TREASURY CONSERVATION & FSM MICRO-STATES)

- **Trạng Thái**: Chấp Nhận (Accepted / Implemented)
- **Ngày Quyết Định**: 2026-09-11
- **Phạm Vi**: `src/server/`, `src/domain/room.ts`, `src/domain/property_manager.ts`, `tests/contracts/`
- **Kế Hoạch & Báo Cáo Liên Quan**: `docs/plans/improvements/IMP-01-systemic-stabilization-and-fsm_plan.md`, `docs/reports/improvements/IMP-01-systemic-stabilization_report.md`

---

## 1. BỐI CẢNH (CONTEXT)

Trong quá trình kiểm toán sâu hệ thống (`deep_systemic_logic_audit_report.md` và `deep_edge_cases_and_micro_states_audit_report.md`), hệ thống xuất hiện các lỗ hổng nghiêm trọng về bảo toàn kinh tế và điều phối trạng thái:
1. **Rò rỉ dòng tiền Kho Bạc (Treasury Leakage)**: Các khoản thuế ô Tax, thuế vượt ô GO, lãi vay thế chấp 5% và phí bảo lãnh 500 Tr. tại Ô 10 chỉ bị trừ khỏi số dư người chơi nhưng biến mất vào hư không mà không nạp vào `room.treasury`.
2. **Phá sản không nhất quán (Inconsistent Bankruptcy)**: Thiếu sự phân biệt giữa nợ người chơi và nợ ngân hàng. Đất bị tịch thu bị xóa sổ khỏi bàn cờ thay vì đưa vào phát mãi công khai.
3. **Lỗ hổng vòng lặp lượt (Turn Loop Flaws)**: Người chơi có thể gieo xúc xắc nhiều lần trong 1 lượt; người từ chối mua đất vẫn có thể tham gia đấu giá chính ô đất đó; đấu giá ở giây cuối cùng bị cướp thầu (sniping) mà không có thời gian phản ứng.

---

## 2. QUYẾT ĐỊNH KIẾN TRÚC (DECISION)

Chúng tôi quyết định thiết lập các nguyên tắc kiến trúc mang tính bất biến sau:

### 2.1. Bất Biến Bảo Toàn Dòng Tiền Quỹ Kho Bạc (Cash Conservation Invariant)
Mọi luồng tiền rời khỏi tài khoản người chơi mà không chuyển cho người chơi khác **bắt buộc phải được nạp vào quỹ `room.treasury`**:
- Thuế thu nhập ô Tax: `min(2.000 Tr., floor(balance * 0.1))` ➔ `room.treasury`.
- Thuế đất vượt ô GO: Tính theo bảng lũy tiến tài sản ➔ `room.treasury`.
- Lãi vay thế chấp: 5% tổng dư nợ mỗi vòng ➔ `room.treasury`.
- Phí bảo lãnh ra tù Ô 10: 500 Tr. ➔ `room.treasury`.
- Thuế giao dịch P2P: 5% giá trị giao dịch ➔ `room.treasury`.
- Rò rỉ Kho Bạc phải luôn bằng 0 Tr. VNĐ (`Δ = 0`).

### 2.2. Cơ Chế Phá Sản Phân Nhánh (Two-Branch Bankruptcy)
Khi người chơi rơi vào tình trạng âm tiền (`InsolvencyPhase`) và không thể giải cứu bằng hạ cấp hoặc thế chấp:
- **Nhánh 1: Phá sản do nợ Người chơi khác**:
  * Toàn bộ tiền mặt còn lại chuyển cho chủ nợ.
  * Toàn bộ bất động sản (kể cả đất đang thế chấp) sang tên cho chủ nợ.
  * Chủ nợ có quyền nộp 10% tiền lãi để duy trì thế chấp hoặc nộp 110% để giải chấp ngay lập tức.
- **Nhánh 2: Phá sản do nợ Ngân Hàng / Kho Bạc**:
  * Toàn bộ công trình nhà C1-C3 bị san phẳng về đất trống C0.
  * Toàn bộ ô đất bị tịch thu được chuyển vào danh sách Đấu Giá Phát Mãi (Foreclosure Auction) với giá khởi điểm bằng 70% giá niêm yết nhằm bảo toàn tổng lượng BĐS trên bàn cờ.

### 2.3. Khép Kín 11 Vi Trạng Thái FSM & Luật Đấu Giá Anti-Sniping
Vòng đời mỗi lượt chơi trải qua chu trình 11 vi trạng thái nghiêm ngặt:
```text
[TURN_INIT] ──► [WAITING_ROLL] ──► [ROLLING_DICE] ──► [MOVING_PAWN]
                                                             │
                                                             ▼
                                                      [TILE_RESOLVE]
                                                             │
                                     ┌───────────────────────┴───────────────────────┐
                                     ▼                                               ▼
                              [ACTION_PHASE]                                  [AUCTION_PHASE]
                        (Mua / Thuế / Thẻ / HOSE)                        (Anti-Sniping +3 giây)
                                     │                                               │
                                     └───────────────────────┬───────────────────────┘
                                                             ▼
                                                  [PROPERTY_MANAGEMENT]
                                              (Nâng cấp, Hạ cấp, Thế chấp)
                                                             │
                                                             ▼
                                                     [SOLVENCY_CHECK]
                                                             │
                                             ┌───────────────┴───────────────┐
                                             ▼                               ▼
                                    (Số dư >= 0)                       (Số dư < 0)
                                             │                               │
                                             ▼                               ▼
                                     [TURN_TRANSITION]              [INSOLVENCY_PHASE]
                                             │                               │
                                             ▼                               ▼
                                    [Chuyển Lượt Kế]                [BANKRUPTCY_DECLARED]
```

- **Luật Anti-Sniping (EC-13)**: Khi có lệnh đặt giá hợp lệ ở thời điểm còn lại <= 3 giây, thời gian phiên đấu giá tự động gia hạn thêm +3 giây.
- **Khóa lượt thao tác**: Client sử dụng cờ `hasRolledThisTurn` khóa nút Đổ xúc xắc ngay khi phát intent; nút Hết lượt chỉ mở khi đã đổ xúc xắc và giải quyết xong nghĩa vụ tài chính.

---

## 3. HỆ QUẢ (CONSEQUENCES)

### Tích cực:
- Nền kinh tế trong game đạt trạng thái cân bằng tuyệt đối: Không in tiền ảo, không nuốt tiền âm thầm.
- Triệt tiêu hoàn toàn các tranh chấp kẹt phiên đấu giá và rớt mạng giữa chừng nhờ cơ chế tự động hoá Server-authoritative.
- Trải nghiệm thi đấu công bằng, chuyên nghiệp và tiệm cận tiêu chuẩn eSports bàn cờ.

### Đánh đổi:
- Đòi hỏi sự kiểm soát đồng bộ cao giữa Server và Client Store thông qua `STATE_DELTA` (mọi trường trạng thái mới như `inAudit`, `skipNextTurn` đều phải nằm trong `PlayerDelta`).
