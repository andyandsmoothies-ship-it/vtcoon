# KẾ HOẠCH TRIỂN KHAI (IMPLEMENTATION PLAN)
## IMP-230: Khử Lệch Pha Dòng Tiền Vượt GO & Tách Bạch Huy Hiệu Đa Giao Dịch (Subtractive Clean)

> **Mã định danh:** IMP-230  
> **Phân loại rủi ro:** Tier 2 (Network Delta / Financial Badges / Subtractive Refactor)  
> **Trạng thái Thẩm định:** HARDENED_APPROVED (Đã tiếp thu 100% phản biện C1–C3)  
> **Quy trình:** 4 Trạm Khép Kín (Station 1 RED ➔ Station 2 GREEN ➔ Station 2.5 Scout ➔ Station 3 Reviews ➔ Station 4 Chaos Sentinel)  
> **Mục tiêu:** Giải quyết triệt để sự cố người chơi/bot qua GO bị phạt tiền nhưng UI hiển thị "+20đ khi qua GO". Tách bạch 100% hai giao dịch: Lương Vượt GO (`+2.000 Tr.`) và Phạt/Tiền thuê (`-1.980 Tr.`).

---

### 1. BỐI CẢNH VẬT LÝ & ĐỐI SOÁT NGUYÊN NHÂN CỐT LÕI

#### 1.1. Hiện tượng thực tế người dùng báo cáo
Người dùng quan sát thấy trong ván đấu: **"bot A nhận được 20đ khi qua GO, trong khi thực tế vừa chạy qua GO và bị phạt 1980đ"**.

#### 1.2. Chuỗi sự kiện cơ học gây lỗi (Root Cause Trace)
1. **Server (`src/server/turn_loop.ts#L174-210`):**
   - Bot A vượt qua GO: được cộng lương `+2.000 Tr.`
   - Bot A dừng chân tại ô BĐS đối thủ (ví dụ: Cell 1 Cần Thơ C3 độc quyền hoặc Cell 23 cấp 2) với tiền thuê `1.980 Tr.`: bị trừ `-1.980 Tr.`
   - Biến động số dư ròng của Bot A: `+2.000 - 1.980 = +20 Tr.`
   - Delta mạng gửi về client: `p.balance = oldBalance + 20` (Net diff = `+20 Tr.`).
2. **Bộ phát Legacy trong Client (`src/client/network/apply_delta_players.ts#L189-210`):**
   - Hàm `syncPlayerBalanceDiff` phát hiện `isPassingGo === true` hoặc `diff === 2000`.
   - Vì Bot A vừa vượt GO, `isSalary` đánh giá thành `true`.
   - Hàm lấy trực tiếp biến động số dư ròng `diff = +20` và truyền vào `notifyBalanceChange`.
   - Tại `apply_delta_players.ts#L81-87`, vì `isSalary = true`, hệ thống gán mác:
     `title: 'Lương Vượt GO'` và `text: '+20'`.
   - Thông báo này xuất hiện ngay tức thì ($t = 0$), khiến người chơi nhìn thấy dòng chữ sai lệch bản chất: **"Lương Vượt GO: +20"**.
3. **Vi phạm Subtractive Refactoring Invariant (§3 Hiến pháp & Trụ cột 5):**
   - Trong IMP-225, `activity_rent_matcher.ts` đã có hàm `extractPassedGoActivities` để phân rã `+20` thành Lương `+2.000` và Phạt `-1.980`, và `activity_badge_dispatcher.ts` đã có `handleSalaryBadge`.
   - Nhưng nhánh `isSalary` trong `apply_delta_players.ts` **chưa bị xóa bỏ**, chạy song song và phát đè huy hiệu giả `+20` ngay trước khi hệ thống huy hiệu mới kịp hiển thị.

---

### 2. SƠ ĐỒ KIẾN TRÚC MỤC TIÊU (TARGET ARCHITECTURE)

```
[Server: turn_loop.ts]
  └── Gói tin Delta: p.balance = oldBalance + 20, p.position = cell mới
             │
             ▼
[Client: apply_delta_players.ts (Subtractive Refactor)]
  ├── XÓA BỎ HOÀN TOÀN isSalary khỏi syncPlayerBalanceDiff
  ├── GIỮ NGUYÊN export notifyBalanceChange làm Facade tương thích ngược (kèm Deprecation comment)
  └── syncPlayerBalanceDiff CHỈ kích hoạt khi isDebtRelief (thoát vỡ nợ)
             │
             ▼
[Client: activity_tracker.ts / activity_rent_matcher.ts]
  ├── extractPassedGoActivities: Tách Lương chuẩn ➔ +2.000 Tr.
  └── matchRentTransactions / processPayerFee: Tách Phạt/Thuê ➔ -1.980 Tr.
             │
             ▼
[Client: activity_badge_dispatcher.ts (Nhịp thời gian 2 pha: pending & active)]
  ├── Tại t = getPawnPassGoDelay: 🚩 Badge Lương Vượt Ô Bắt Đầu (+2.000 Tr.) khi cờ chạm ô 0
  └── Tại t = getPawnLandingDelay: 💸 Badge Trả Thuê BĐS (-1.980 Tr.) khi cờ đáp xuống ô đất
```

---

### 3. BẢNG NGÂN SÁCH DÒNG MÃ (LOC BUDGETS)

| Tệp Vật Lý | Phân Loại Tier | LOC Hiện Tại | LOC Dự Kiến Sau Đổi | Trần Quy Định | Đánh Giá |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/network/apply_delta_players.ts` | Tier 1 (Logic) | 267 | ~256 (-11 LOC) | <= 400 | ✔️ Thuần giảm (Subtractive) |
| `src/client/network/activity_badge_dispatcher.ts` | Tier 1 (Logic) | 231 | ~255 (+24 LOC) | <= 400 | ✔️ An toàn |
| `src/client/network/activity_rent_matcher.ts` | Tier 1 (Logic) | 303 | 303 (0 LOC) | <= 400 | ✔️ Bảo toàn |
| `src/client/ui/floating_numbers.tsx` | Tier 2 (UI) | 292 | 292 (0 LOC) | <= 500 | ✔️ Bảo toàn |
| `tests/contracts/imp230_pass_go_salary_and_rent_subtractive_clean.test.ts` | Test Contract | 0 (Tạo mới) | ~450 LOC | <= 600 | ✔️ Đạt chuẩn |

---

### 4. NHIỆM VỤ TRIỂN KHAI VẬT LÝ (DETAILED DROP-IN TASKS)

#### Task 1: Subtractive Refactoring & Deprecation Guard trong `src/client/network/apply_delta_players.ts`
- **Toạ độ bao đóng:** `syncPlayerBalanceDiff` (dòng 189–210) và `notifyBalanceChange` (dòng 80–87)
- **Hành động:** 
  1. Loại bỏ hoàn toàn các biến `prevPos`, `isPassingGo`, `isSalary` khỏi `syncPlayerBalanceDiff`.
  2. Chỉ gọi `notifyBalanceChange` khi `isDebtRelief === true`.
  3. **[P1/P3 Inoculation]** Giữ nguyên hàm `export function notifyBalanceChange` tại dòng 70–98 để đảm bảo tương thích ngược 100% cho test suite kế thừa `imp117`, đồng thời gắn comment SSOT đánh dấu nhánh `isSalary` nội bộ là deprecated, ngăn không cho bất kỳ caller nào tái kích hoạt.
- **Drop-in Snippets:**
```typescript
// Tại dòng 80-82:
    // [IMP-230] DEPRECATED BRANCH: Nhánh isSalary nội bộ này chỉ giữ lại cho backward compatibility
    // của unit tests kế thừa (TC-117.09). Toàn bộ luồng runtime chính tuyệt đối không được gọi vào đây.
    const isSalary = context?.isPassingGo || context?.actionType === 'salary' || diff === 2000;
```

```typescript
// Tại dòng 189-210:
function syncPlayerBalanceDiff(
  state: GameState,
  p: DeltaPlayer,
  existing: PlayerHudInfo | undefined,
  isFullSync: boolean,
): void {
  if (isFullSync || !existing || existing.balance === p.balance) return;
  const diff = p.balance - existing.balance;
  const isBankrupt = Boolean(p.bankrupt || existing.bankrupt);
  const isDebtRelief = !isBankrupt && existing.balance < 0 && p.balance >= 0;

  // [IMP-122][IMP-191][IMP-230] Subtractive Refactoring: Mọi biến động tài chính
  // (Lương qua GO, tiền thuê, nộp thuế, bảo lãnh, mua đất) do ActivityBadgeDispatcher
  // và ActivityRentMatcher đảm nhiệm theo đúng nhịp di chuyển quân cờ và tách bạch từng dòng tiền.
  // apply_delta_players CHỈ xử lý duy nhất sự kiện phục hồi thanh khoản (debt relief).
  if (!isDebtRelief) {
    return;
  }

  notifyBalanceChange(state, p.id, diff, existing.balance, p.balance, { cellIndex: p.position, isBankrupt });
}
```

#### Task 2: Điều phối nhịp thời gian vật lý 2 pha (Pending & Active) trong `src/client/network/activity_badge_dispatcher.ts`
- **Toạ độ bao đóng:** Import `checkPassedGo`, thêm export `getPawnPassGoDelay`, và cập nhật `handleSalaryBadge` (dòng 95–101)
- **Hành động:** 
  1. Import domain SSOT `checkPassedGo` từ `../../domain/room.js`.
  2. **[P1b Inoculation]** Xây dựng `getPawnPassGoDelay(playerId)` kiểm tra cả 2 trạng thái hoạt ảnh:
     - Pha 1: `state.pendingPawnMove` (khi lệnh di chuyển vừa vào hàng đợi).
     - Pha 2: `state.activePawnAnimation` (khi cờ đã bắt đầu chuyển động trên Canvas 3D). Đọc `anim.fromCell`, `anim.targetCell`, và vị trí `anim.currentIndex` để tính đúng số bước còn lại tới ô GO (`cell 0`), không bao giờ bị rơi sớm vào fallback `* 0.5`.
  3. **[P1a Inoculation]** Export `handleSalaryBadge` cho unit test độc lập, đồng thời duy trì liên kết trong `BADGE_HANDLERS['salary']`.
- **Drop-in Snippet:**
```typescript
import { checkPassedGo } from '../../domain/room.js';

export function getPawnPassGoDelay(playerId?: string): number {
  if (!playerId) return 0;
  const state = useGameStore.getState();
  const rollLead = state.isRolling ? 1200 : 0;

  // Pha 1: Kiểm tra pendingPawnMove trước khi hoạt ảnh bắt đầu chạy
  if (state.pendingPawnMove && state.pendingPawnMove.playerId === playerId) {
    const fromCell = state.pendingPawnMove.fromCell ?? 0;
    const targetCell = state.pendingPawnMove.targetCell;
    const stepMs = (state.pendingPawnMove.isBot ? BOT_STEP_DURATION : (HOP_DURATION + LANDING_DURATION)) * 1000;
    if (checkPassedGo(fromCell, targetCell)) {
      const stepsToGo = (40 - fromCell) % 40;
      return Math.round(rollLead + stepsToGo * stepMs);
    }
  }

  // Pha 2: Kiểm tra activePawnAnimation khi cờ đang trên đường chạy
  const anim = state.activePawnAnimation;
  if (anim && anim.playerId === playerId && anim.waypoints?.length) {
    const fromCell = anim.fromCell;
    const targetCell = anim.targetCell ?? anim.waypoints[anim.waypoints.length - 1] ?? 0;
    if (checkPassedGo(fromCell, targetCell)) {
      const stepMs = (anim.isBot ? BOT_STEP_DURATION : (HOP_DURATION + LANDING_DURATION)) * 1000;
      const currentIdx = anim.currentIndex ?? 0;
      const stepsToGo = (40 - fromCell) % 40;
      const remainingStepsToGo = Math.max(0, stepsToGo - currentIdx);
      return Math.round(remainingStepsToGo * stepMs);
    }
  }

  // Fallback an toàn: 50% landing delay nếu không lấy được tọa độ chi tiết
  const landingDelay = getPawnLandingDelay(playerId);
  return Math.max(0, Math.round(landingDelay * 0.5));
}

export function handleSalaryBadge(act: ActivityLogEntry, state: GameState): void {
  const amount = act.amount ?? 2000;
  scheduleAction(() => {
    SoundEngine.playVictoryChime();
    state.addFloatingText({
      text: `+${formatCurrency(amount)}`,
      type: FloatingTextType.Reward,
      playerId: act.playerId ?? '',
      actionType: 'salary',
      title: 'Lương Vượt Ô Bắt Đầu',
      formula: 'Hoàn thành 1 vòng sa bàn (+2.000 Tr.)',
    });
  }, getPawnPassGoDelay(act.playerId));
}
```

---

### 5. STATION 1 QA MANDATE: UNIVERSAL 5-FACET MATRIX (16 TEST CASES)

Tệp kiểm thử hợp đồng mới: `tests/contracts/imp230_pass_go_salary_and_rent_subtractive_clean.test.ts`

- **Facet 1: Subtractive Audit & Zero-Generic-Salary Badge in `apply_delta_players.ts` (TC-230.01 .. TC-230.04)**
  * **TC-230.01:** `applyPlayerDeltas` khi người chơi qua GO nhận +2.000 Tr. và chịu phí -1.980 Tr. (Net diff = +20 Tr.) ➔ `applyPlayerDeltas` TUYỆT ĐỐI KHÔNG gọi `addFloatingText` với nội dung `+20` hoặc `Lương Vượt GO`.
  * **TC-230.02:** `applyPlayerDeltas` khi người chơi qua GO đơn thuần (+2.000 Tr.) ➔ `applyPlayerDeltas` TUYỆT ĐỐI KHÔNG sinh badge generic, chuyển giao 100% cho `activity_badge_dispatcher`.
  * **TC-230.03:** `applyPlayerDeltas` khi người chơi qua GO và chịu phí lớn hơn lương (Lương +2.000 Tr., Thuê -3.750 Tr. ➔ Net diff = -1.750 Tr.) ➔ `applyPlayerDeltas` TUYỆT ĐỐI KHÔNG sinh badge generic `-1.750 Tr.`.
  * **TC-230.04:** `applyPlayerDeltas` bảo toàn duy nhất ngoại lệ `isDebtRelief` (khi người chơi âm vốn `balance < 0` bán tài sản để `balance >= 0` ➔ sinh đúng badge `Thoát vỡ nợ thành công`).

- **Facet 2: Dual Badge Generation & Multi-Transaction Segregation (TC-230.05 .. TC-230.08)**
  * **TC-230.05:** Net diff +20 Tr. (Lương +2.000 Tr., Phạt -1.980 Tr.) ➔ `detectFinancialAndStatusActivities` tạo đúng 2 entries: 1 `salary` (+2.000) và 1 `rent`/`tax` (-1.980).
  * **TC-230.06:** Net diff +1.200 Tr. (Lương +2.000 Tr., Thuê -800 Tr.) ➔ `detectFinancialAndStatusActivities` tạo đúng 2 entries: 1 `salary` (+2.000) và 1 `rent` (-800).
  * **TC-230.07:** Net diff 0 Tr. (Lương +2.000 Tr., Thuê đúng -2.000 Tr.) ➔ `detectFinancialAndStatusActivities` tạo đúng 2 entries: 1 `salary` (+2.000) và 1 `rent` (-2.000).
  * **TC-230.08:** Net diff -1.750 Tr. (Lương +2.000 Tr., Thuê -3.750 Tr.) ➔ `detectFinancialAndStatusActivities` tạo đúng 2 entries: 1 `salary` (+2.000) và 1 `rent` (-3.750).

- **Facet 3: Chronological Pawn Pacing & Staggered Delay Dispatch (TC-230.09 .. TC-230.12)**
  * **TC-230.09:** `getPawnPassGoDelay` với `pendingPawnMove` từ ô 38 đến ô 6 (2 bước tới GO trên tổng số 8 bước) ➔ `passGoDelay < landingDelay`.
  * **TC-230.10:** **[P1b/P2 Inoculation]** `getPawnPassGoDelay` với `activePawnAnimation` (khi `pendingPawnMove = null`, cờ từ ô 38 đến ô 6 đang ở bước 0) ➔ tính đúng thời gian còn lại tới ô GO mà không bị rơi vào fallback `0.5 * landingDelay`.
  * **TC-230.11:** **[P2 Inoculation]** `getPawnPassGoDelay` khi cờ di chuyển từ ô 38 đáp thẳng ô 0 (`fromCell = 38, targetCell = 0`) ➔ `passGoDelay === landingDelay`.
  * **TC-230.12:** `handleSalaryBadge` đăng ký lịch phát tại `getPawnPassGoDelay`, đảm bảo phát âm thanh `playVictoryChime` và hiển thị badge Lương tại đúng thời điểm vượt GO.

- **Facet 4: FloatingNumbersOverlay & Visual Presentation (TC-230.13 .. TC-230.14)**
  * **TC-230.13:** Khi nhận cả 2 badge (Lương `+2.000 Tr.` và Trả thuê `-1.980 Tr.`), `FloatingBadge` kết xuất đúng công thức và dòng tiền của từng badge (không bị gộp nhầm thành `+20`).
  * **TC-230.14:** `FloatingBadge` cho `salary` hiển thị icon 🚩 theo chuẩn `transaction_narrative.ts`, tiêu đề 'Lương Vượt Ô Bắt Đầu', và công thức 'Hoàn thành 1 vòng sa bàn (+2.000 Tr.)'.

- **Facet 5: End-to-End Pipeline & Zero Mutant Integrity (TC-230.15 .. TC-230.16)**
  * **TC-230.15:** Kịch bản thực tế người dùng báo cáo (Bot A từ ô 39 sang ô 1 Cần Thơ C3 độc quyền cước 1.980 Tr.): Toàn bộ chu trình `applyDeltaToStore` ➔ Activity Feed và floating texts hiển thị đủ cả 2 giao dịch độc lập, tuyệt đối không có dòng chữ nào "Lương Vượt GO: +20".
  * **TC-230.16:** Bảo toàn bảo lãnh kiểm toán, thuế đất, và mua bán BĐS không bị ảnh hưởng bởi việc dọn dẹp `syncPlayerBalanceDiff` (100% 49 tests kế thừa imp117, imp191, imp225 pass).

---

### 6. QUY TRÌNH THỰC THI 4 TRẠM KHÉP KÍN

1. **Trạm 1 (QA RED):** `qa-tester` tạo `tests/contracts/imp230_pass_go_salary_and_rent_subtractive_clean.test.ts` (16 test cases). Chứng minh Inversion Gate RED (`TC-230.01` fail vì code cũ vẫn phát `+20`).
2. **Trạm 2 (GREEN):** `implementer` áp dụng Task 1 và Task 2 vào `src/client/network/apply_delta_players.ts` và `src/client/network/activity_badge_dispatcher.ts`. Đưa toàn bộ 16 tests về GREEN.
3. **Trạm 2.5 (Fast Pre-Filter Sweep):** `scout` kiểm tra `tsc --noEmit`, kiểm tra LOC budget, zero dirty casts (`as any`), và dọn sạch debug logs.
4. **Trạm 3 (Independent Reviews):**
   - **Phase 3.1:** `spec-reviewer` đối chiếu 100% plan fidelity và zero scope drift.
   - **Phase 3.2:** `code-reviewer` kiểm tra anti-slop, timer leak, memory leak. `ui-craft-reviewer` kiểm tra tính rõ ràng của 2 badge trên mobile và desktop.
5. **Trạm 4 (Chaos Sentinel):** `chaos-sentinel` chạy 3 physical probes đối kháng, kiểm tra Wire-to-Core parity và mutation sensitivity.
