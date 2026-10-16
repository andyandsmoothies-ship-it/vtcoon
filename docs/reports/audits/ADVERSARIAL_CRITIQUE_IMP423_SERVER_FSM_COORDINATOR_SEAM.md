# ⚔️ BÁO CÁO PHẢN BIỆN ĐỐI KHÁNG & GIÁM ĐỊNH PHÁP Y KẾ HOẠCH
## IMPLEMENTATION PLAN: IMP-423 SERVER FSM COORDINATOR SEAM & FINAL CODEBASE ZERO-CYCLE

> **Mã hồ sơ:** `ADVERSARIAL-CRITIQUE-IMP-423-PLAN`  
> **Đối tượng thẩm định:** Kế hoạch triển khai [`c:\Users\HP\Documents\GitHub\vtcoon\.agents\plans\PLAN_IMP_423_SERVER_FSM_COORDINATOR_SEAM.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/plans/PLAN_IMP_423_SERVER_FSM_COORDINATOR_SEAM.md)  
> **Mã Ticket:** `IMP-423`  
> **Phân hệ thực tế:** `server-fsm` (Server State Machine & Transition Coordination)  
> **Ngày lập hồ sơ:** 2026-10-16  
> **Căn cứ quy chuẩn & hiến pháp:** Hiến pháp [`GEMINI.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/GEMINI.md), Gotcha 1 ([FSM & Game Lifecycle](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/fsm_lifecycle.md)), Gotcha VIII ([Deep Module Design](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/deep_modules.md)), Iron Laws (Wiring Parity, Two-Stage Decoupling, Pure-Move Quarantine, Scope Confinement, Buffer Zone 350 LOC, Zero Circular Dependency).  
> **Phán quyết tổng thể:** 🟡 **CONDITIONAL_APPROVAL_WITH_DIRECTIVES (CHẤP THUẬN CÓ ĐIỀU KIỆN GỌT GIŨA)** — Giải pháp kỹ thuật trích xuất `fsm_transition_coordinator.ts` và 5 leaf type seams là cực kỳ chuẩn xác và giải quyết dứt điểm các chu trình máy chủ (`[SCC-2]`, `[SCC-3]`). Tuy nhiên, bản kế hoạch tồn tại **4 lỗ hổng nghiêm trọng về mặt quy trình và kiểm soát bề mặt đĩa vật lý**: (1) Format bảng làm vô hiệu hóa công cụ kiểm tra tự động `audit_plan.mjs`, (2) Bỏ sót 7 tệp consumer thực tế trong bảng hạch toán dòng mã, (3) Nhầm lẫn mang hợp đồng client của ticket IMP-422 vào ticket server, và (4) Bỏ quên rủi ro từ 4 bộ test cấy ghép `declare module`.

---

## 0. BẢNG MA TRẬN ĐÁNH GIÁ LỖ HỔNG & TỬ HUYỆT (DEFECT & VULNERABILITY MATRIX)

| STT | Khía Cạnh Kiểm Toán | Tử Huyệt / Lỗ Hổng Kỹ Thuật Phát Hiện | Mức Độ | Hệ Quả Thực Tế Trên Môi Trường CI & Kiến Trúc |
|:---:|:---|:---|:---:|:---|
| **1** | **Bẫy Kiểm Toán Cơ Học** | Cú pháp Bảng Markdown thuần túy không chứa tiền tố `Target physical file:` khiến `audit_plan.mjs` báo cáo: `Checking 0 target files`. | 🔴 **HIGH RISK** | Kế hoạch vượt qua Trạm 0 với "Thẻ Xanh Ảo" (False Green Pass), vô hiệu hóa toàn bộ cơ chế quét tệp ma và đối chiếu SLOC tự động. |
| **2** | **Thiếu Sót Bề Mặt (Wiring Parity)** | Bỏ sót **7 tệp consumer sản xuất** trong Bảng Hạch toán LOC (Mục 2), dù các tệp này bắt buộc phải sửa import để bẻ gãy chu trình. | 🔴 **HIGH RISK** | Vi phạm nguyên tắc *Honest LOC Accounting* và *Wiring Parity Invariant*. Phạm vi tiếp xúc thực tế của ticket bị che giấu một nửa. |
| **3** | **Xâm Lấn Ranh Giới (Scope Conflation)** | Khai báo phân hệ bao gồm cả `src/client/**` và đưa nguyên vẹn Ràng buộc `INV-FSM-06` (các seam của IMP-422) vào kế hoạch IMP-423. | 🟠 **WARNING** | Gây nhiễu loạn ranh giới ticket (Artifact Bleed). Vi phạm nguyên tắc Cohesive Batching khi lẫn lộn giữa ticket Client State và Server FSM. |
| **4** | **Living Test Traps** | Bỏ quên 4 khai báo cấy ghép module (`declare module`) trong living test suites (`imp285`, `imp145`, `imp155`, `imp160`). | 🟠 **WARNING** | Nguy cơ gãy biên dịch TypeScript hàng loạt nếu quá trình tách seam làm thay đổi type export mà không có stub bảo vệ tương thích. |
| **5** | **Vùng Đệm Tử Thần (LOC Buffer)** | `src/server/room_manager.ts` (332 LOC) và `src/server/auction_manager.ts` (331 LOC) đang tiến sát ngưỡng phong tỏa $\ge 350$ LOC. | 🟡 **MEDIUM** | Nếu không chặn việc bổ sung logic mới vào 2 file này, các ticket kế tiếp sẽ vi phạm *LOC Buffer Zone Guard* của Hiến pháp. |

---

## 1. GIÁM ĐỊNH PHÁP Y CHI TIẾT CÁC LỖ HỔNG & TỬ HUYỆT

### 1.1. Lỗ hổng 1: Bẫy Kiểm Toán Cơ Học Gây "Thẻ Xanh Ảo" (Audit Parser Bypass)
* **Hiện trạng kiểm tra thực tế**:
  Khi chạy lệnh tiền kiểm toán kế hoạch theo quy định của Hiến pháp:
  ```powershell
  node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_423_SERVER_FSM_COORDINATOR_SEAM.md
  ```
  Kết quả trả về trên màn hình console:
  ```text
  🔍 [AUDIT-PLAN] Pre-flight mechanical audit for: PLAN_IMP_423_SERVER_FSM_COORDINATOR_SEAM.md
  📁 Checking 0 target files for existence and line count:
  📐 Checking Auto-Slicing Protocol & Scope Confinement:
    ✔️ Scope confinement: 0 production file(s) across 0 cohesive unit(s) (<= 3 units max).
  ✅ AUDIT PASSED: 0 files verified, 0 snippets match physical disk, 8 test specs clean.
  ```
* **Phân tích cơ chế pháp y**:
  Trong mã nguồn [`scripts/plan_audit/plan_markdown_parser.mjs`](file:///c:/Users/HP/Documents/GitHub/vtcoon/scripts/plan_audit/plan_markdown_parser.mjs#L49-L59), bộ trích xuất tệp mục tiêu sử dụng biểu thức chính quy:
  ```javascript
  const fileTargetRegex = /(?:\*\*Target physical file\*\*|\*\*Target File\*\*|Target physical file|Target file):\s*[`']?([^\n`']+\.[a-zA-Z0-9]+)[`']?([^\n]*)/gi;
  ```
  Bản kế hoạch `PLAN_IMP_423` chỉ kẻ bảng Markdown `| File Path | Tier | Current LOC | ... |` trong Mục 2 mà không hề có bất kỳ dòng khai báo nào theo định dạng `Target physical file: ...`.
* **Hệ quả pháp lý**:
  Bản kế hoạch đã vượt qua kiểm toán tự động của Trạm 0 mà không có **bất kỳ tệp mã nguồn nào được xác minh đĩa vật lý**. Các quy tắc kiểm tra tệp ma (Ghost files), kiểm tra hạn mức dòng mã honest accounting, và kiểm tra ranh giới phân hệ đều bị vô hiệu hóa hoàn toàn.

---

### 1.2. Lỗ hổng 2: Omission of 7 Target Consumer Files (Bỏ sót 7 tệp tiêu thụ thực tế)
* **Hiện trạng kiểm toán**:
  Bảng 2 của kế hoạch chỉ liệt kê 7 tệp seam mới và 6 tệp máy chủ cốt lõi. Tuy nhiên, để thực sự phá vỡ các chu trình `[SCC-2]`, `[SCC-3]`, `[SCC-5]`, việc trích xuất seam đòi hỏi phải sửa đổi dòng `import` tại **7 tệp consumer khác** trong mã nguồn sản xuất:

| Tệp Consumer Bị Bỏ Sót | Dòng Mã Thay Đổi Thực Tế | Seam Mới Tiêu Thụ | Mục Đích Kiến Trúc Bắt Buộc |
| :--- | :--- | :--- | :--- |
| [`src/server/room_trade_coordinator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_trade_coordinator.ts) | Import line | `src/server/room_context_types.ts` | Bẻ chu trình Trade <-> Property Coordinator |
| [`src/server/network/turn_orchestrator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/turn_orchestrator.ts) | Lines 9–18 | `src/server/network/turn_timer_constants.ts` | Bẻ chu trình `[SCC-3]` giữa Orchestrator & Bot Timer |
| [`src/server/network/turn_bot_timer_scheduler.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/turn_bot_timer_scheduler.ts) | Line 6 | `src/server/network/turn_timer_constants.ts` | Bẻ chu trình `[SCC-3]` giữa Orchestrator & Bot Timer |
| [`src/server/network/admin_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_manager.ts) | Import line | `src/server/network/admin_manager_types.ts` | Bẻ chu trình `[SCC-5]` giữa Admin Manager & Handler |
| [`src/server/network/admin_message_handler.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_message_handler.ts) | Import line | `src/server/network/admin_manager_types.ts` | Bẻ chu trình `[SCC-5]` giữa Admin Manager & Handler |
| [`src/server/logging/persistent_room_logger.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/logging/persistent_room_logger.ts) | Import line | `src/server/logging/room_logger_types.ts` | Khử chu trình import kiểu dữ liệu Logger |
| [`src/server/logging/room_logger_cloud_sync.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/logging/room_logger_cloud_sync.ts) | Import line | `src/server/logging/room_logger_types.ts` | Khử chu trình import kiểu dữ liệu Logger |

* **Phản biện pháp y**:
  Đặc biệt nghiêm trọng, tệp `room_trade_coordinator.ts` thậm chí còn được chính tác giả nêu tên trong phần thuyết minh kiến trúc tại Mục 3 dòng 51:
  > *"room_property_coordinator.ts and room_trade_coordinator.ts consume room_context_types.js, breaking the trade-property coordinator circular import loop."*
  Thế nhưng tệp này lại hoàn toàn biến mất khỏi Bảng 2. Việc che giấu 7 tệp bị chỉnh sửa trực tiếp vi phạm nghiêm trọng nguyên tắc **Wiring Parity Invariant** và **Honest LOC Accounting** của Hiến pháp [`GEMINI.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/GEMINI.md).

---

### 1.3. Lỗ hổng 3: Xâm Lấn Ranh Giới Phân Hệ & Sao Chép Nhầm Lẫn (Artifact Bleed)
* **Hiện trạng kiểm toán**:
  - Tại Mục 1 dòng 6: Bản kế hoạch ghi nhận `Subsystem Boundary: src/server/**, src/client/**`.
  - Tại Mục 3 Ràng buộc số 6 (Dòng 62–64), kế hoạch tuyên bố:
    > *"6. [INV-FSM-06: Client Network & Subscribers Seams]: room_config_helpers.ts, game_event_bus_types.ts, trade_offer_tracker.ts isolate store initialization, bus subscriber interfaces, and trade offer state tracking, dissolving [SCC-1]."*
* **Phân tích đối kháng**:
  - Toàn bộ các tệp seam client (`room_config_helpers.ts`, `game_event_bus_types.ts`, `trade_offer_tracker.ts`) và chu trình `[SCC-1]` hoàn toàn là phạm vi và thành quả của **Ticket IMP-422** (đã hoàn thành độc lập trước đó).
  - Ticket IMP-423 có nhiệm vụ giải quyết FSM Coordinator và chu trình trên server (`[SCC-2]`, `[SCC-3]`). Việc đưa nguyên vẹn nội dung của IMP-422 vào danh sách Invariant của IMP-423 là hành vi sao chép không qua chọn lọc (Copy-paste Artifact Bleed), làm sai lệch phạm vi trách nhiệm (Scope Drift) và vi phạm nguyên lý Cohesive Batching.

---

### 1.4. Lỗ hổng 4: Điểm Mù 4 Khai Báo Cấy Ghép Module (`declare module`)
* **Dữ liệu đĩa vật lý trích xuất từ `probe:surface`**:
  - `tests/contracts/imp285_sequential_turn_closure_guard.test.ts` chứa: `declare module '../../src/server/insolvency_manager.js'`
  - `tests/contracts/imp145_compulsory_buyout.test.ts` chứa: `declare module '../../src/server/room_manager.js'`
  - `tests/server/imp155_bot_action_pacing_and_auction_transparency.test.ts` chứa: `declare module '../../src/server/room_manager.js'`
  - `tests/server/imp160_ghost_auction_modal_and_lifecycle_hardening.test.ts` chứa: `declare module '../../src/server/room_manager.js'`
* **Rủi ro kỹ thuật**:
  Bản kế hoạch không hề đề cập đến sự tồn tại của 4 khối cấy ghép module này. Trong TypeScript, khi một tệp test dùng `declare module '...'` để augment interface nội bộ, nếu tệp mục tiêu bị di chuyển interface hoặc thay đổi type export mà không để lại stub re-export chính xác, trình biên dịch TypeScript sẽ báo lỗi type mismatch rất khó truy vết. Kế hoạch bắt buộc phải đưa 4 tệp test này vào danh sách thẩm định hồi quy.

---

## 2. PHÂN TÍCH CÁC ĐIỂM SÁNG KIẾN TRÚC & ĐÓNG GÓP KỸ THUẬT

Bên cạnh các sai lệch về mặt hạch toán bề mặt, giải pháp kỹ thuật cốt lõi của bản kế hoạch đạt chất lượng rất cao:

### 2.1. Tập Trung Hóa Toàn Diện FSM Coordinator Seam
Kế hoạch đã giải quyết triệt để vấn đề "phân mảnh quyền lực FSM" trên server bằng cách gom toàn bộ các hàm chuyển pha nhạy cảm về [`src/server/fsm_transition_coordinator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/fsm_transition_coordinator.ts):
- `advanceRoundBoundary`: Tăng số vòng, xử lý khấu hao thẻ sự kiện thị trường.
- `advanceTurnToNextPlayer`: Bỏ qua người chơi đã phá sản, tự động chuyển người có số dư âm vào `InsolvencyPhase`.
- `advanceTurnAfterBankruptcy`: Dọn dẹp hàng đợi và bàn giao lượt cho người kế tiếp.
- `restorePostInsolvencyPhase`: Phục hồi đối xứng trạng thái trước khi vỡ nợ cho người chơi lấy lại số dư dương.
- `checkInsolvency`: Kiểm tra và kích hoạt pha vỡ nợ ngay khi phát hiện số dư âm.
- `drainPendingInsolvencyQueue`: Rút cạn hàng đợi con nợ chờ xử lý.

### 2.2. Chiến Lược Two-Stage Decoupling Bảo Toàn Living Tests
Bằng cách giữ lại stub re-export 1 dòng tại các điểm vào lịch sử:
- `src/server/turn_loop.ts`: `export { advanceRoundBoundary, advanceTurnToNextPlayer } from './fsm_transition_coordinator.js'`
- `src/server/insolvency_manager.ts`: `export { advanceTurnAfterBankruptcy, restorePostInsolvencyPhase, checkInsolvency } from './fsm_transition_coordinator.js'`
Kế hoạch bảo đảm hơn 112 bộ living test suite (như `imp192b`, `imp192c`, `imp325`, `imp327`, `imp339`) tiếp tục chạy xanh tuyệt đối mà không cần sửa đổi hàng trăm dòng test import.

### 2.3. Kiểm Thử Tổ Hợp Biên Khó Đạt Chuẩn Cao
Mục 4 của kế hoạch bao gồm 2 ca kiểm thử tổ hợp đa con nợ xuất sắc:
- **TC-423.04 [B, S]**: Khử bẫy Deadlock kẹt lượt khi người chơi giữ lượt phá sản nhưng chủ nợ còn sống.
- **TC-423.05 [B, B]**: Xử lý an toàn phá sản dây chuyền liên tiếp nhiều người chơi, kết thúc ván chơi sạch sẽ khi chỉ còn 1 người sống sót duy nhất.

---

## 3. BẢNG ĐỐI CHIẾU SỐ LIỆU ĐĨA VẬT LÝ (PHYSICAL PROBE BASELINE TABLE)

```
=========================================================================================================
PHYSICAL DISK BASELINE AUDIT: PLAN_IMP_423 VS REAL DISK PROBES
=========================================================================================================
File Path                                  Plan Declared   Disk Lines   Disk SLOC   Callers (src / test)
---------------------------------------------------------------------------------------------------------
src/server/turn_loop.ts                    269 LOC         269 Lines    236 SLOC    2 / 18
src/server/insolvency_manager.ts           249 LOC         249 Lines    217 SLOC    2 / 19  (1 declare module)
src/server/auction_manager.ts              331 LOC         331 Lines    294 SLOC    1 / 18
src/server/room_manager.ts                 332 LOC         332 Lines    291 SLOC    20 / 112 (3 declare module)
src/server/room_property_coordinator.ts    173 LOC         173 Lines    157 SLOC    2 / 19
src/server/network/admin_types.ts          3 LOC           3 Lines      2 SLOC      0 / 9
---------------------------------------------------------------------------------------------------------
CÁC TỆP TIÊU THỤ BỊ BỎ QUÊN TRONG BẢNG 2 (PROVED VIA AST ANALYSIS):
src/server/room_trade_coordinator.ts       (Bỏ quên)      162 Lines    148 SLOC    2 / 12
src/server/network/turn_orchestrator.ts    (Bỏ quên)      327 Lines    282 SLOC    4 / 14
src/server/network/turn_bot_timer_sch.ts   (Bỏ quên)      190 Lines    165 SLOC    2 / 4
src/server/network/admin_manager.ts        (Bỏ quên)      288 Lines    251 SLOC    3 / 8
src/server/network/admin_message_hand.ts   (Bỏ quên)      212 Lines    189 SLOC    1 / 6
src/server/logging/persistent_room_log.ts  (Bỏ quên)      194 Lines    171 SLOC    1 / 5
src/server/logging/room_logger_cloud_sync  (Bỏ quên)      121 Lines    104 SLOC    1 / 4
=========================================================================================================
```

---

## 4. CHỈ THỊ GỌT GIŨA BẮT BUỘC (MANDATORY HARDENING DIRECTIVES)

Để kế hoạch đạt chuẩn phê duyệt cấp cao và lưu trữ chính thức:

1. **Chuẩn hóa cú pháp khai báo tệp mục tiêu**:  
   Bổ sung cú pháp `**Target physical file**: <đường_dẫn>` cho từng tệp trong danh sách để `audit_plan.mjs` có thể quét và xác thực cơ học 100% tệp trên đĩa vật lý, chấm dứt hiện tượng báo cáo `Checking 0 target files`.
2. **Bổ sung 7 tệp consumer vào Bảng Hạch toán LOC**:  
   Cập nhật Bảng 2 đưa đầy đủ 7 tệp (`room_trade_coordinator.ts`, `turn_orchestrator.ts`, `turn_bot_timer_scheduler.ts`, `admin_manager.ts`, `admin_message_handler.ts`, `persistent_room_logger.ts`, `room_logger_cloud_sync.ts`) với ghi chú `Net Delta: ~0 (Rewire Imports to Seams)`.
3. **Cắt bỏ hoàn toàn INV-FSM-06 và thu gọn phân hệ**:  
   Xóa bỏ hoàn toàn ràng buộc số 6 về client seams (thuộc di sản của IMP-422) và điều chỉnh ranh giới phân hệ tại Mục 1 về thuần túy `src/server/**`.
4. **Bổ sung danh sách 4 bài test cấy ghép `declare module`**:  
   Đưa 4 file test (`imp285`, `imp145`, `imp155`, `imp160`) vào danh sách bắt buộc phải vượt qua ở Trạm 4 regression verification.

---

## 5. PHÁN QUYẾT KẾT LUẬN

Bản kế hoạch [`PLAN_IMP_423_SERVER_FSM_COORDINATOR_SEAM.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/plans/PLAN_IMP_423_SERVER_FSM_COORDINATOR_SEAM.md) được đánh giá:  
**CHẤP THUẬN CÓ ĐIỀU KIỆN (CONDITIONAL_APPROVAL)**.  
Giải pháp kỹ thuật sẵn sàng triển khai, yêu cầu cập nhật lại văn bản kế hoạch theo đúng 4 chỉ thị gọt giũa trên để bảo đảm tính liêm chính kiến trúc và dữ liệu đĩa vật lý của dự án VTCOON.
