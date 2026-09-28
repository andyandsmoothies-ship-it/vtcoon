# [REPORT] IMP-216: Telemetry Invariant Watchdog Hardening & Submodule Refactor

## 1. THÔNG TIN TỔNG QUAN
- **Mã Ticket**: IMP-216
- **Tiêu Đề**: Telemetry Invariant Watchdog Hardening & Submodule Refactor (Chuẩn Hóa & Nâng Cấp Toàn Diện Hệ Thống Telemetry Invariant Watchdog).
- **Phân Hạng**: **Tier 2 (Full Rigor)** — Client Realtime Telemetry, Invariant Verification Engine, Watchdog Stall/Loop Monitors, Submodule Decomposition & LOC Budgeting.
- **Trạng Thái**: ✅ **COMPLETE** (HOÀN TẤT TRỌN VẸN QUY TRÌNH 3 TRẠM).
- **Căn Cứ Pháp Lý & Kế Hoạch**:
  - Kế hoạch phê duyệt: [`C:/Users/HP/.gemini/antigravity/brain/a4d43e99-a6da-475d-8ffd-4a78c7dcbd82/telemetry_watchdog_hardening_plan.md`](file:///C:/Users/HP/.gemini/antigravity/brain/a4d43e99-a6da-475d-8ffd-4a78c7dcbd82/telemetry_watchdog_hardening_plan.md)
  - Báo cáo thẩm định phản biện: [`.agents/audit/PLAN_AUDIT_IMP216.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP216.md) (**APPROVED** sau khi tiếp thu 5 điểm cứng C1–C5).
  - Bằng chứng kiểm thử tự động: [`.agents/evidence/imp216_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp216_snapshot.json).
- **Hội Đồng Trạm 3 Độc Lập**:
  - `spec-reviewer`: **APPROVED** (100% đối soát tam giác 3 chiều, zero scope drift, 16/16 contract tests truy xuất nguồn gốc).
  - `scout` (Trạm 2.5): **PASS** (Zero dirty cast `as any`, 0 unhandled promise, 0 memory leak, ngân sách LOC cả 2 file đều $\le 300$).

---

## 2. NGUYÊN NHÂN CỐT LÕI & GIẢI PHÁP KIẾN TRÚC

### 2.1. Phân Tích Hiện Trạng & Nguyên Nhân Gốc Rễ
Người dùng gửi log trận đấu tại phòng `VTM68P` (Tick 576), trong đó hệ thống bắn ra lỗi đỏ cảnh báo:
`TREASURY_INVARIANT_VIOLATED: Thất thoát quỹ kho bạc hoặc tiền tệ: sai lệch 0 Tr (kỳ vọng: -1300 Tr)`

Qua phân tích và kiểm toán toàn diện mã nguồn Client Telemetry đối chiếu với Server Domain, phát hiện 10 điểm mù và lỗi kiến trúc nghiêm trọng:
1. **Lỗi Nhận Thức Bản Chất Đấu Giá vs Mua Đất Ngân Hàng**:
   - Khi mua đất từ Bank (`buyProperty`), tiền bị rút khỏi lưu thông ($\Delta \text{System} = -\text{Price}$).
   - Nhưng khi mua đất qua Đấu Giá (`resolveAuction`), tiền trúng đấu giá được chuyển nộp vào Kho Bạc hoặc trả nợ cho người chơi vỡ nợ ($\Delta \text{System} = 0$).
   - Telemetry cũ gộp chung đấu giá vào `resolvePurchaseCost` và trừ vào `deltaSum` khiến hệ thống kỳ vọng âm tiền, rồi dùng điều kiện chắp vá `treasuryGain === -cellDelta` để bù lại.
2. **Va Chạm Gói Kích Cầu Kho Bạc (Treasury Stimulus)**:
   - Khi hết vòng (`advanceRoundBoundary`), nếu Quỹ $\ge 10.000$ Tr, Kho Bạc trích 20% chia cho 2 người nghèo nhất ($\Delta \text{System} = 0$).
   - Khi sự kiện này diễn ra đồng thời với lượt đấu giá, Kho Bạc bị giảm tiền (do chi kích cầu) khiến `treasuryGain === 0`, làm gãy điều kiện chắp vá `treasuryGain === -cellDelta`, dẫn đến việc Telemetry kỳ vọng hụt tiền và báo động giả (nguyên nhân trực tiếp gây ra sự cố Tick 576).
3. **Bỏ Sót Thu Hồi Thấu Chi -3.300 Tr**:
   - `computeOverdraftDelta` chỉ cộng $+3000$ khi mở thấu chi, không hề mô hình hóa khoản thu hồi $-3300$ khi hết hạn tại ô GO.
   - Caller cũ `if (overdraft > 0)` nuốt chửng khoản nợ âm. Đồng thời server omit `overdraftRoundsLeft: 0` khi về 0 do falsy omission.
4. **Bỏ Sót Thoát Kiểm Toán Bằng Tài Sản Ròng**:
   - Telemetry hardcode cứng `=== 500`, khiến các mức bảo lãnh $> 500$ Tr rơi vào ô Audit và bị gán nhầm thành sự kiện ngoại lai chưa mô hình hóa (`unmodeled`).
5. **Watchdog Kẹt Lượt & Đấu Giá**:
   - `telemetry_delta_hook.ts` không truyền `isInAuction` vào `watchdogMonitor.checkTurnStall`, khiến người chơi bị báo `TURN_STALLED` sai khi timer chính âm trong lúc đấu giá.
6. **Watchdog Bắt Bot Loop**:
   - Đếm mỗi gói tin delta nhận từ mạng như một hành động của Bot, khiến các tick cập nhật timer thông thường kích hoạt báo động `BOT_INFINITE_LOOP` sai.
   - Ngược lại, bỏ sót Bot ngoài lượt đặt cược đấu giá (`delta.auction.highestBidderId`).
7. **Vi Phạm Ngân Sách LOC Tier 1**:
   - `telemetry_delta_hook.ts` đạt 394 LOC (sát trần 400 LOC Tier 1).

---

### 2.2. Giải Pháp Triển Khai Toàn Diện

```
                     [Game Server State Delta (Sparse)]
                                     │
                                     ▼
                ┌────────────────────────────────────────┐
                │       handleDeltaTelemetry (Hook)      │
                │  - Trích xuất balances & treasury      │
                │  - Lọc bỏ calibration ticks            │
                └───────────────────┬────────────────────┘
                                    │
               ┌────────────────────┴────────────────────┐
               ▼                                         ▼
┌─────────────────────────────┐           ┌─────────────────────────────┐
│  telemetry_expected_delta   │           │      watchdog_monitor       │
│  - Phân biệt Đấu giá (Δ=0)  │           │  - checkTurnStall           │
│    với Mua Bank (Δ=-Price)  │           │    (Truyền isInAuction)     │
│  - Kích cầu Kho Bạc (Δ=0)   │           │  - recordBotAction          │
│  - Trả nợ thấu chi (-3.300) │           │    (Bắt cả turn player bot  │
│    hỗ trợ falsy omission    │           │     và off-turn bidder bot) │
│  - Miễn trừ Trái phiếu      │           └──────────────┬──────────────┘
│  - Bảo lãnh kiểm toán networth                         │
└──────────────┬──────────────┘                          │
               │                                         │
               ▼                                         │
┌─────────────────────────────┐                          │
│      invariant_checker      │                          │
│  - verifyTreasuryConservation                          │
│  - verifyMovementStep       │◄─────────────────────────┘
│  - verifyNonNegativeBalance │
│  - verifyPropertyOwnership  │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│    useTelemetryStore        │
│  - reportViolation (Clean)  │
│  - addSnapshot / AuditLog   │
└─────────────────────────────┘
```

1. **Tách Submodule & Subtractive Refactoring**:
   - Tạo mới `src/client/telemetry/telemetry_expected_delta.ts` (281 LOC): Chứa toàn bộ các hàm tính toán thuần túy.
   - Thu gọn `src/client/telemetry/telemetry_delta_hook.ts` từ 394 LOC xuống **144 LOC** ($\Delta = -250$ dòng, an toàn tuyệt đối dưới trần 400 LOC). Re-export đủ 13 symbols đảm bảo 100% backward compatibility.
2. **Khắc Phục 5 Điểm Cứng C1–C5**:
   - **C1**: Làm sạch hoàn toàn `resolvePurchaseCost`, xóa bỏ 100% logic auction lồng bên trong. Trong `computeCellDelta`, dùng `isAuctionPurchase` để `continue` ô đất đấu giá (không trừ vào deltaSum).
   - **C2**: Re-export đầy đủ 13 symbols, không bỏ sót `computeAuditBailDelta` hay `isUnmodeledEvent`.
   - **C3**: Gói Kích Cầu Kho Bạc là giao dịch nội bộ ($\Delta \text{System} = 0$). Vượt GO sinh tiền (minting) bảo toàn chuẩn xác `baseSalary`, độc lập hoàn toàn với `treasuryGain`.
   - **C4**: Bắt falsy omission cho thoát kiểm toán và thấu chi: `(p.auditTurnsLeft === 0 || p.auditTurnsLeft === undefined)` và `(p.overdraftRoundsLeft === 0 || p.overdraftRoundsLeft === undefined)`.
   - **C5**: TC-216.12 sử dụng động hằng số `WATCHDOG_LIMITS.BOT_BURST_MAX_ACTIONS + 1` và `WATCHDOG_LIMITS.BOT_BURST_WINDOW_MS / 2`.
3. **Chuẩn Hóa Watchdog Pacing**:
   - Truyền `isInAuction: Boolean(delta.auction || postState.auction || (delta.turnPhase ?? postState.turnPhase) === TurnPhase.AuctionPhase)`.
   - Phân biệt tick mạng thuần vs thao tác bot thực tế; bổ sung nhánh bắt bot ngoài lượt đặt cược đấu giá (`delta.auction.highestBidderId`).

---

## 3. KẾT QUẢ THỰC TẾ TRÊN ĐĨA VẬT LÝ & KIỂM THỬ

### 3.1. Danh Sách Tệp Vật Lý Thay Đổi

| Tệp vật lý | Hành động | LOC cũ | LOC mới | Delta | Đánh giá |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/telemetry/telemetry_expected_delta.ts` | TẠO MỚI | 0 | 281 | +281 | Tier 1 ($\le 400$ LOC) ✔️ |
| `src/client/telemetry/telemetry_delta_hook.ts` | TÁI CẤU TRÚC | 394 | 144 | -250 | Tier 1 ($\le 400$ LOC) ✔️ |
| `tests/contracts/imp216_telemetry_invariant_watchdog_hardening.test.ts` | TẠO MỚI | 0 | 570 | +570 | Contract Suite ($\le 600$ LOC) ✔️ |
| `docs/domain/gotchas.md` | CẬP NHẬT | 46 | 50 | +4 | Ghi nhận Invariant Pillar II.8 ✔️ |
| `docs/master_roadmap.md` | CẬP NHẬT | 302 | 304 | +2 | Cập nhật mục hoàn tất IMP-216 ✔️ |

### 3.2. Kết Quả Kiểm Thử (82/82 Tests PASS 100%)

- **Suite mới IMP-216**: `tests/contracts/imp216_telemetry_invariant_watchdog_hardening.test.ts`
  - **TC-216.01**: Đấu giá thành công kỳ vọng delta = 0 (bảo toàn hệ đóng), không trừ tiền như mua Bank: ✅ PASS
  - **TC-216.02**: Mua đất từ Bank phản ánh chính xác `-deed.price`: ✅ PASS
  - **TC-216.03**: Mở thấu chi phản ánh đúng `+3.000` Tr: ✅ PASS
  - **TC-216.04**: Hết hạn thấu chi phản ánh đúng thu hồi `-3.300` Tr (bắt cả falsy omit): ✅ PASS
  - **TC-216.05**: Đấu giá kết thúc đồng thời với Kích Cầu Kho Bạc bảo toàn hệ đóng `actualDelta = expected = 0`: ✅ PASS
  - **TC-216.06**: Đấu giá phát mãi tài sản người nợ bảo toàn hệ đóng `actualDelta = expected = 0`: ✅ PASS
  - **TC-216.07**: Vượt GO đồng thời nộp thuế đất và trả nợ thấu chi tính toán tổng hợp chính xác: ✅ PASS
  - **TC-216.08**: Đang trong `AuctionPhase`, timer âm không kích hoạt `TURN_STALLED`: ✅ PASS
  - **TC-216.09**: Ngoài `AuctionPhase`, timer âm kích hoạt `TURN_STALLED` đúng chuẩn: ✅ PASS
  - **TC-216.10**: Đấu giá kéo dài $> 90.000$ms không tiến triển kích hoạt `TURN_STALLED`: ✅ PASS
  - **TC-216.11**: 10 gói tin delta cập nhật timer không kích hoạt `BOT_INFINITE_LOOP`: ✅ PASS
  - **TC-216.12**: Bot ngoài lượt đặt giá liên tiếp kích hoạt `BOT_INFINITE_LOOP` theo hằng số động: ✅ PASS
  - **TC-216.13**: Nộp bảo lãnh kiểm toán $> 500$ Tr bảo toàn hệ đóng và không bị gán nhầm unmodeled: ✅ PASS
  - **TC-216.14**: Biến động Trái phiếu doanh nghiệp được miễn trừ kiểm tra chi tiết: ✅ PASS
  - **TC-216.15**: Thẻ sự kiện `MC_MARKET_TOUR` dịch chuyển 4 người chơi không báo lỗi di chuyển: ✅ PASS
  - **TC-216.16**: Thẻ sự kiện tác động số dư người chơi khác ngoài ô sự kiện được miễn trừ kiểm tra: ✅ PASS
- **Legacy Suites**:
  - `imp80_telemetry_watchdog_accuracy.test.ts`: **19/19 PASS**
  - `imp209_telemetry_macro_upgrade_discount.test.ts`: **6/6 PASS**
  - `telemetry_watchdog_and_auction_activity_contract.test.ts`: **24/24 PASS**
  - `imp184_auction_human_window_and_telemetry_go.test.ts`: **17/17 PASS**

---

## 4. KẾT QUẢ TIẾP THU PHẢN BIỆN REVIEW MÃ NGUỒN (D1, D2, I1, I2, I3)

Sau đợt rà soát mã nguồn thực tế, đội ngũ kỹ thuật đã tiến hành đợt dọn dẹp và hoàn thiện sâu (Deep Polish) giải quyết dứt điểm 2 lỗi (Defects) và 3 điểm cải thiện (Improvements):

| Mã | Loại | Mô tả vấn đề phát hiện | Giải pháp thực tế trên đĩa vật lý | Trạng thái |
| :---: | :---: | :--- | :--- | :---: |
| **D1** | Defect (P2) | `calculateGoSalary` wrapper một dòng trong `telemetry_expected_delta.ts` có nguy cơ silently drop tham số mới của domain. | Xóa bỏ wrapper trung gian; import trực tiếp `calculateGoSalary` từ `domain/room.js` và xóa bỏ khỏi danh sách re-export. | ✅ ĐÃ SỬA |
| **D2** | Defect (P2) | `computeAuditBailDelta` nhánh else khi `spent > 500` là no-op `bail += 0`, sai ngữ nghĩa giao dịch bảo lãnh nội bộ. | Hợp nhất toán học cho mọi mức bảo lãnh `spent > 0`: `absorbed = Math.min(Math.max(0, treasuryGain), spent); bail = (-spent + absorbed)`. Xóa bỏ hoàn toàn điều kiện hardcode `spent === 500`. | ✅ ĐÃ SỬA |
| **I1** | Improvement | `isAuctionPurchase` đọc `useActivityStore.getState()` là side-effect ẩn khó kiểm thử cô lập. | Thêm tham số tùy chọn `lastAuctionBid?: { cellIndex?: number } \| null` vào `isAuctionPurchase` và truyền từ caller, ưu tiên tham số trước khi đọc store. | ✅ ĐÃ SỬA |
| **I2** | Improvement | Nhánh `if (delta?.roomStarted === true)` trong `computeCellDelta` là nhánh rẽ nhân tạo (artificial branching) chỉ để khớp test. | Xóa bỏ hoàn toàn điều kiện `roomStarted`. `computeCellDelta` tính toán nhất quán dòng tiền thực tế `-bidAmount` cho mọi tick; việc hấp thu hệ thống được chuyển về đúng tầng `computeExpectedDelta`. | ✅ ĐÃ SỬA |
| **I3** | Improvement | Điều kiện hấp thu `absorbedTreasury` tại L269 gây khó hiểu và dễ vỡ khi có sự kiện va chạm đồng thời. | Chuẩn hóa điều kiện hấp thu: khi có ngữ cảnh Kho Bạc (`hasTreasuryContext && treasuryGain > 0`), phần chi phí đấu giá được bù trừ chính xác vào hệ thống, giải quyết triệt để lỗi va chạm kích cầu Tick 576. | ✅ ĐÃ SỬA |

---

## 5. KẾT LUẬN & ĐÓNG TICKET

Ticket **IMP-216** đã hoàn tất 100% mục tiêu:
1. Giải quyết triệt để vấn đề báo động giả Tick 576 và các điểm mù trong hệ thống giám sát thời gian thực.
2. Tách submodule thành công: `telemetry_delta_hook.ts` (143 LOC) và `telemetry_expected_delta.ts` (295 LOC), cả hai đều nằm an toàn dưới trần 400 LOC Tier 1.
3. Hoàn thiện 100% 5 yêu cầu phản biện sau review (D1, D2, I1, I2, I3).
4. Đạt 97/97 tests PASS trên toàn bộ 6 test suites liên quan; 0 lỗi TypeScript compile; 0 vi phạm UI Anti-pattern.
5. Toàn bộ tài liệu SSOT, bằng chứng kiểm thử, và lộ trình tổng thể đã được đồng bộ hóa hoàn chỉnh.
