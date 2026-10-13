# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-390
## Plan IMP-390: Kinematic Pacing Restoration & Gentle Turn Rhythm Tuning (Ticket IMP-390)

> **Mã Ticket:** `IMP-390`  
> **Phân hệ thực tế:** `server-network`  
> **Ngày hoàn thành:** 2026-10-13  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

### 1.1. Bối cảnh nghiệp vụ & Điểm mù nhịp độ (Kinematic Desync)
Trong quá trình trải nghiệm người dùng, người chơi phản ánh hiện tượng dồn dập, thiếu cảm giác thư thái khi chơi với Bot: sau khi xúc xắc dừng thì cờ lập tức chạy, khi cờ vừa tới ô đất thì Bot đã quyết định mua/thuê ngay tức thì, và khi hết lượt thì Bot tiếp theo lại tung xúc xắc quá nhanh.

Qua rà soát lịch sử mã nguồn thực tế trên đĩa vật lý:
1. **Lệch pha thời gian giữa Client và Server (Timing Desync)**:
   - Trong IMP-55 và IMP-301, Server tính toán độ trễ bước đi của Bot theo công thức:
     $$\text{delay} = 1100\text{ms (lăn xúc xắc)} + \text{steps} \times 200\text{ms (bước nhảy)} + 800\text{ms (quan sát ô đất)} = 1900\text{ms} + \text{steps} \times 200\text{ms}$$
   - Trong IMP-326, Client được bổ sung 600ms `DICE_SETTLE_DWELL_MS` (để xúc xắc ổn định mặt số) và 600ms `PAWN_LANDING_SETTLE_MS` (để quân cờ tiếp đất êm ái, nhún lò xo). Tổng thời gian diễn họa thực tế trên Client tăng lên:
     $$\text{Client Time} = 1100\text{ms} + 600\text{ms} + \text{steps} \times 200\text{ms} + 600\text{ms} = 2300\text{ms} + \text{steps} \times 200\text{ms}$$
   - Tuy nhiên, Server **chưa từng bù trừ 1200ms này**. Hệ quả là Server đếm ngược nhanh hơn Client 400ms: Bot tại Server đã ra quyết định mua đất khi quân cờ trên màn hình 3D Client vẫn đang lơ lửng trên không trung, triệt tiêu hoàn toàn 800ms quan sát của người chơi!
2. **Thiếu khoảng thở đầu lượt (Turn Transition Breathing Room)**:
   - Khi chuyển sang lượt của Bot (`TurnPhase.WaitingRoll`), Server chỉ chờ 1500ms `baseDelayMs` trước khi tự động tung xúc xắc. Trong khi đó, camera cần 1200ms để thực hiện Soft Return về vị trí quan sát tổng quan ([`camera_soft_return.ts#L26`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/camera_soft_return.ts#L26)). Người chơi chưa kịp nhìn rõ ai đang bắt đầu lượt thì xúc xắc đã quay dồn dập.

### 1.2. Giải pháp kỹ thuật cốt lõi
1. **Bù trừ chính xác 1200ms Dwell Compensation (`BOT_KINEMATIC_DWELL_COMPENSATION_MS`)**:
   Hàm thuần túy `resolveBotStepDelay` tại [`turn_bot_timer_scheduler.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/turn_bot_timer_scheduler.ts) cộng thêm 1200ms vào bước đi có tung xúc xắc, đảm bảo Client diễn họa trọn vẹn tiếp đất và người chơi có đủ 800ms quan sát trước khi Bot hành động.
2. **Khoảng thở đầu lượt 2200ms (`BOT_START_TURN_BREATHING_ROOM_MS`)**:
   Dựa trên căn cứ vật lý: 1200ms Camera Soft Return + 1000ms quan sát sa bàn tĩnh = 2200ms khi bắt đầu pha `WaitingRoll`.
3. **Phòng vệ vòng xoay vận tải & Đóng băng kép (Transit & Multi-Phase Guards)**:
   - Miễn trừ cộng dồn cho vòng xoay vận tải (`!room.lastTransitResult`) để tránh đơ thêm 1.2s.
   - Thêm cơ chế theo dõi `botKinematicsServedSeq` trong `TurnBotTimerScheduler`: Bước đầu tiên sau khi tung xúc xắc (`ActionPhase`) nhận trọn vẹn độ trễ động học; bước tiếp theo trong cùng lượt (`PropertyManagement`) chỉ nhận độ trễ quan sát thông thường (`baseDelayMs = 1500ms`), triệt tiêu hiện tượng đóng băng kéo dài 11.2s.
4. **Miễn trừ kiểm thử nhanh (Fast Test Immunity)**:
   Chế độ kiểm thử nhanh (`baseDelayMs <= 500`) được giữ nguyên lập tức không bị chèn độ trễ, bảo vệ tuyệt đối tốc độ chạy của hệ thống CI.

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-390.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-390.md) | Thẩm định kế hoạch đạt 0 defects, 13 test specs sạch, giải tỏa 5 chỉ thị đối kháng. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/client/imp390_kinematic_pacing_restoration.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp390_kinematic_pacing_restoration.test.ts) | 16 atomic tests, 19 asserts, 0 loops. Adversarial Inversion: Đã chứng minh 4 tests thất bại chuẩn xác do vi phạm assertion. | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/chaos_sentinel_IMP-390.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-390.json) | 2 production files modified (`turn_bot_timer_scheduler.ts`, `turn_orchestrator.ts`), 100% 85/85 tests chuyển sang GREEN (69 living tests kế thừa + 16 contract tests mới). | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn Tier 1. | **100% PASS** 🚀 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-390.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-390.md) | 100% Plan fidelity, zero scope creep, kiểm soát trọn vẹn phân hệ `server-network`. | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-390.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-390.md) | 0 Slop flags, Zero TIDD, an toàn timer/memory cleanup, assertion density đạt 1.18. | **APPROVED** 🛡️ |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///c:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 16/16 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Thẩm định kế hoạch đạt 0 defects, 13 contract test specs chuẩn mực.
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa**:
  - **[ADV-01] Living Contract Regression & Test Scope Omission Across 6 Living Suites**
    - **Scenario**: Khi tăng độ trễ Bot để bù trừ 1200ms dwell và 2200ms breathing room, các hợp đồng kiểm thử tích hợp sử dụng fake timer cố định (1500ms, 2000ms, 3400ms) sẽ lập tức thất bại do timer chưa kích hoạt.
    - **Hardening Directive**: Bổ sung phân mục Living Contract Migration vào kế hoạch; di chuyển đồng bộ các mốc timer advance cho 6 test cases (`TC-IMP55.21..23`, `TC-IMP51.17, 20`, `TC-TB-SCHED.14`).
  - **[ADV-02] Transit Wheel Unchecked Fallthrough Arithmetic & Over-Compensation**
    - **Scenario**: Khi Bot quay vòng xoay vận tải, cả `room.lastTransitResult` và `room.lastDice` đều tồn tại trên phòng. Nếu không kiểm tra loại trừ, độ trễ sẽ bị cộng thêm 1200ms ngoài độ trễ của vòng xoay.
    - **Hardening Directive**: Bổ sung điều kiện chặn `!room.lastTransitResult` trước khi cộng dwell compensation.
  - **[ADV-03] Multi-Phase Double-Dwell Accumulation in ActionPhase -> PropertyManagement**
    - **Scenario**: Khi Bot mua đất ở `ActionPhase` (đã chờ 4.5s), chuyển sang `PropertyManagement` vì `room.lastDice` vẫn còn nên nếu không theo dõi sẽ bị chờ tiếp 4.5s nữa (tổng 11.2s/lượt gây đơ game).
    - **Hardening Directive**: Thêm `botKinematicsServedSeq` để ghi nhận cờ di chuyển đã phục vụ xong; bước sau trong cùng lượt quay về `baseDelayMs` (1500ms).
  - **[ADV-04] Severed Facade Re-Export in `src/server/network/turn_orchestrator.ts`**
    - **Scenario**: Trạm điều phối `turn_orchestrator.ts` là facade công khai re-export các helper định thời của Bot. Bỏ sót file này sẽ làm đứt gãy boundary public API.
    - **Hardening Directive**: Đưa `turn_orchestrator.ts` vào phạm vi vật lý và re-export đầy đủ các hằng số và hàm giải quyết độ trễ mới.
  - **[ADV-05] Ungrounded Kinematic Threshold: `BOT_START_TURN_BREATHING_ROOM_MS` (2200ms)**
    - **Scenario**: Hằng số 2200ms cần có căn cứ vật lý thực tế trên đĩa thay vì là một con số ma thuật cảm tính.
    - **Hardening Directive**: Ghi chú rõ nguồn gốc: 1200ms Camera Soft Return (`camera_soft_return.ts#L26`) + 1000ms quan sát bao quát sa bàn tĩnh = 2200ms.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/client/imp390_kinematic_pacing_restoration.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp390_kinematic_pacing_restoration.test.ts)
- **Chỉ số kiểm thử**: **16 atomic tests**, **19 asserts** (mật độ trung bình: 1.18 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified** (4 tests thất bại chuẩn xác do assertion lệch giá trị thời gian, 0 lỗi cú pháp hoặc nạp module).

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi**:
  - [`src/server/network/turn_bot_timer_scheduler.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/turn_bot_timer_scheduler.ts)
  - [`src/server/network/turn_orchestrator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/turn_orchestrator.ts)
- **Chuyển trạng thái**: Toàn bộ **16/16 contract tests chuyển sang GREEN** (thời gian chạy: 8ms).
- **Living Test Suites**: Toàn bộ 69/69 living contract tests kế thừa (`bot_pacing_and_camera_lock_contract`: 31, `bot_pacing_and_dice_runway_contract`: 22, `turn_bot_timer_scheduler`: 16) cùng 16 contract tests mới đạt 100% GREEN (tổng 85 tests).

### Trạm 2.5: Fast Pre-Filter Mechanical Sweep (`scout` / `fast_prefilter.mjs`)
- **TypeScript**: `tsc --noEmit` vượt qua với 0 lỗi (Exit Code 0).
- **Dirty Casts**: Khử sạch 3 dirty casts kế thừa (`as unknown as`, `as any`), đạt chuẩn tuyệt đối 0 dirty casts.
- **LOC Ceilings**: Tất cả các tệp đều nằm an toàn trong hạn mức trần Tier 1 (<= 400 LOC) và Living Tests (<= 600 LOC).

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
1. **Spec & Scope Gatekeeper (`spec-reviewer`)**:
   - **Phán quyết**: **APPROVED** 📋
   - **Xác nhận phạm vi**: 100% các thay đổi nằm trong phân hệ mục tiêu (`server-network`), zero scope creep.
2. **Deep Architecture & Anti-Slop Auditor (`code-reviewer`)**:
   - **Phán quyết**: **APPROVED** 🛡️
   - **Chỉ số Anti-Slop**: 0 violations trên 6 cờ cảnh báo (Deep modules, Zero pass-through wrappers, Zero TIDD).
   - **Bộ nhớ & Timer**: Dọn dẹp sạch sẽ `botKinematicsServedSeq` qua `clearRoomState`, không rò rỉ timer.

### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: 16/16 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs IMP-390` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-390 (Direct Scope)

| Tệp Mã Nguồn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái |
| :--- | :---: | :---: | :---: | :---: | :--- |
| [`src/server/network/turn_bot_timer_scheduler.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/turn_bot_timer_scheduler.ts) | Tier 1 (Domain/Server/Logic) | **169 SLOC** | 190 Lines | <= 400 LOC | ✔️ Safe |
| [`src/server/network/turn_orchestrator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/turn_orchestrator.ts) | Tier 1 (Domain/Server/Logic) | **286 SLOC** | 333 Lines | <= 400 LOC | ⚠️ Warning (>= 300 LOC, Tech Debt logged) |
| [`tests/client/imp390_kinematic_pacing_restoration.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp390_kinematic_pacing_restoration.test.ts) | Living Test | **251 SLOC** | 287 Lines | <= 600 LOC | ✔️ Safe |
| [`tests/contracts/bot_pacing_and_camera_lock_contract.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/bot_pacing_and_camera_lock_contract.test.ts) | Living Test | **373 SLOC** | 435 Lines | <= 600 LOC | ✔️ Safe |
| [`tests/contracts/bot_pacing_and_dice_runway_contract.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/bot_pacing_and_dice_runway_contract.test.ts) | Living Test | **298 SLOC** | 367 Lines | <= 600 LOC | ✔️ Safe |
| [`tests/server/turn_bot_timer_scheduler.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/server/turn_bot_timer_scheduler.test.ts) | Living Test | **292 SLOC** | 328 Lines | <= 600 LOC | ✔️ Safe |

---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

- **Tính toàn vẹn hệ thống**: Gói cải tiến hoàn thành theo đúng nguyên tắc Zero-Blindness, cung cấp đầy đủ bằng chứng vật lý từ mã nguồn, kiểm thử, logic bù trừ nhịp độ và biên bản kiểm toán độc lập.
- **Sẵn sàng triển khai**: Mã nguồn đã sẵn sàng đóng gói và triển khai lên môi trường sản phẩm.

### Sổ Theo Dõi Nợ Kỹ Thuật (Tech Debt Watch)
- ⚠️ **Cảnh báo trần LOC Tier 1 (Domain/Server/Logic)**: Tệp [`src/server/network/turn_orchestrator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/turn_orchestrator.ts) hiện đạt **333/400 LOC** (khoảng cách an toàn còn 67 dòng trước trần tử thần). Các ticket kế tiếp nếu mở rộng chức năng bắt buộc phải thực hiện refactor trích xuất helper/domain validator độc lập trước khi thêm logic mới.
- 💡 **Quy ước Hợp đồng Mock Phòng Chơi (`room.diceSeq`)**: Trong luồng sản xuất thực tế, `executeTurnRoll` luôn tự động tăng `room.diceSeq` trên mỗi lần gieo xúc xắc. Trong các bài kiểm thử mock thủ công nếu khởi tạo đối tượng `Room` mà bỏ quên `diceSeq`, cơ chế `botKinematicsServedSeq` sẽ không kích hoạt tracking bước đôi. Mọi bộ kiểm thử tích hợp mới về Bot Pacing phải luôn khai báo thuộc tính `diceSeq`.
