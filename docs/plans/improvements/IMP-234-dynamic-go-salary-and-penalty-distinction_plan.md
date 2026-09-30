# KẾ HOẠCH TRIỂN KHAI (IMPLEMENTATION PLAN) - SSOT v3
## IMP-234: Đồng Bộ Lương Vượt GO Động, Tách Bạch Phiếu Phạt Cơ Hội & Hiển Thị Đa Huy Hiệu Trên Mobile

> **Mã định danh:** IMP-234  
> **Phân loại rủi ro:** Tier 2 (Network Delta / Financial Badges / Responsive Mobile Layout / Server Turn Loop)  
> **Quy trình:** 4 Trạm Khép Kín (Station 1 RED ➔ Station 2 GREEN ➔ Station 2.5 Scout ➔ Station 3 Reviews ➔ Station 4 Chaos Sentinel)  
> **Kiểm toán đối kháng:** Đã thẩm định P1–P5 bởi `plan-griller` tại [`.agents/audit/PLAN_AUDIT_IMP234.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP234.md) và tiếp thu 100% 5 phản biện chuyên sâu từ người dùng.  

---

### BẢNG 1:1 TIẾP THU PHẢN BIỆN CHUYÊN SÂU (REVISION DIRECTIVE COVERAGE)

| STT | Phản Biện / Yêu Cầu | Mức Độ | Tệp & Toạ Độ Giải Quyết | Giải Pháp Kỹ Thuật Chi Tiết (Remediation) |
| :---: | :--- | :---: | :--- | :--- |
| **PB-1** | `passedGoSalary` không được truyền qua Delta tới Client; luồng dữ liệu 5 trạm bị đứt đoạn. | **CRITICAL** | [`src/server/session_manager.ts#L71-L93`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts#L71-L93)<br>[`src/client/network/activity_rent_matcher.ts#L62-L65`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_rent_matcher.ts#L62-L65) | Bổ sung `readonly passedGoSalary?: number;` vào interface `DeltaPayload`. Truyền giá trị từ `rollResult.passedGoSalary` qua Delta; Client ưu tiên nhận `delta.passedGoSalary ?? calculateGoSalary(round)`. Khép kín toàn vẹn 5 trạm. |
| **PB-2** | `isDrawnByPayer` có `currentTurnPlayerId === payer.id` quá rộng, gây false-positive gán nhầm tiền thuê/thuế thành thẻ phạt. | **CRITICAL** | [`src/client/network/activity_rent_matcher.ts#L250-L265`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_rent_matcher.ts#L250-L265) | Xoá bỏ hoàn toàn điều kiện `currentTurnPlayerId`. Chỉ cho phép `card.drawnBy === payer.id \|\| card.playerId === payer.id`. Bổ sung điều kiện bất biến: `Math.abs(card.effectDelta ?? 0) === absDiff` (mệnh giá thẻ phải khớp chính xác số tiền bị trừ). |
| **PB-3** | Sửa `latestMilestone && idx === 0` không khống chế được khi có 3+ badges, gây tràn màn hình 360px. | **MEDIUM** | [`src/client/ui/floating_numbers.tsx#L280-L285`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/floating_numbers.tsx#L280-L285) | Đổi điều kiện thành: `Boolean(latestMilestone && displayItems.length > 1 && idx < displayItems.length - 1)`. Khi có milestone, ẩn toàn bộ badge cũ hơn, chỉ giữ lại Banner + 1 Huy hiệu mới nhất trên Mobile (đảm bảo cứng: tổng <= 2 mục, <= 120px). Khi không có milestone, hiển thị đủ cả 2 huy hiệu. |
| **PB-4** | Task 4 xoá trắng `addFloatingText` trong `activity_tracker.ts` làm mất badge thẻ Đầu Tư / Thị Trường (reward cards). | **MEDIUM** | [`src/client/network/activity_tracker.ts#L334-L344`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_tracker.ts#L334-L344) | Phân định ranh giới: `syncEventCard` (`apply_delta.ts`) chịu trách nhiệm phát toast cho Bot (`turnPlayerId !== myPid`). Trong `activity_tracker.ts`, chỉ chặn phát đúp khi đã là Bot card, giữ nguyên việc hiển thị `punchySummary` và reward badges cho Human / Market cards. |
| **PB-5** | `TC-234.04` assert chuỗi cứng `+1.500` từ `toLocaleString('vi-VN')` gây lỗi flaky trên môi trường CI Linux/Node headless. | **MEDIUM** | [`src/server/network/wss_intent_handler.ts#L90-L95`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_intent_handler.ts#L90-L95)<br>[`tests/contracts/imp234...test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp234_dynamic_go_salary_and_penalty_distinction.test.ts) | Thay `toLocaleString('vi-VN')` bằng regex định dạng số phân tách dấu chấm độc lập locale: `sal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')`. Test assert chuỗi chuẩn xác và kiểm tra độc lập substring `+1` và `500`. |

---

### 1. BỐI CẢNH VẬT LÝ & ĐỐI SOÁT NGUYÊN NHÂN CỐT LÕI

#### 1.1. Hiện tượng người dùng báo cáo
1. *"Đi qua GO đang không cố định 2000 nữa mà thông báo hiện đang fix bằng text là 2000 có đúng không?"*
2. *"Gần đây tôi có implement để fix lỗi khi bot đi qua GO đồng thời bước vào một ô nào đó bị trừ tiền, có thể do bốc trúng phiếu phạt hay gì đó, thì hiện lên thông báo số tiền, mà số tiền này là kết quả cuối cùng chứ không tách bạch rõ số tiền đi qua GO và số tiền bị phạt. Tôi kiểm tra thấy vẫn bị, hãy xem lại."*

#### 1.2. Chuỗi sự kiện cơ học gây lỗi (Root Cause Trace)
1. **Lương GO động bị che khuất bởi Text tĩnh:**
   - Server ([`src/domain/room.ts#L16-L20`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts#L16-L20)): `calculateGoSalary(roundCount)` trả về `2.000` (vòng 1–20), `1.500` (vòng 21–30), `1.000` (vòng 31+).
   - Tuy nhiên, [`src/client/network/activity_badge_dispatcher.ts#L133`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_badge_dispatcher.ts#L133) hardcode: `formula: 'Hoàn thành 1 vòng sa bàn (+2.000 Tr.)'`.
   - [`src/server/network/wss_intent_handler.ts#L92`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_intent_handler.ts#L92) hardcode: `(Qua ô Bắt Đầu +2.000)`.
   - [`src/client/offline_landing.ts#L191`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/offline_landing.ts#L191) hardcode: `text: '+2.000'`.
2. **CSS Responsive trên Mobile nuốt mất Huy hiệu Lương:**
   - Tại [`src/client/ui/floating_numbers.tsx#L280-L285`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/floating_numbers.tsx#L280-L285):
     `className={(latestMilestone || (idx === 0 && displayItems.length > 1)) ? "hidden md:flex" : ...}`
   - Khi bot dẫm vào ô Cơ hội có phạt: `latestMilestone` tồn tại ➔ **Toàn bộ huy hiệu tài chính** (`displayItems`) bị gán class `hidden md:flex`, trên Mobile chỉ hiện duy nhất Banner sự kiện, giấu sạch huy hiệu lương!
   - Khi bot dẫm ô Thuế hoặc ô Đất đối thủ: `idx === 0` (Huy hiệu Lương) bị gán class `hidden md:flex`. Trên Mobile chỉ hiện huy hiệu thứ 2 (Huy hiệu Trừ tiền), khiến người chơi ngỡ rằng lương không được cộng hoặc hệ thống chỉ hiển thị số trừ ròng!
3. **Phiếu phạt Cơ hội bị dán nhãn sai thành "Thuế Đất Đai":**
   - Khi bot bốc thẻ phạt Cơ hội (tiền phạt nộp về Kho Bạc), `activity_rent_matcher.ts#matchRentTransactions` bỏ qua vì không có `receiver`.
   - Giao dịch rơi vào `processPayerFee#L261`, bị gán mặc định `type: 'tax'`, khiến `handleTaxBadge` hiển thị: `Nộp Thuế Đất Đai ➔ Kho Bạc` với số tiền phạt, gây sai lệch ngữ cảnh.
4. **Phát đúp thông báo thẻ sự kiện cho bot:**
   - `apply_delta.ts#L299` (`syncEventCard`) phát 1 thẻ nổi 2.5s khi `turnPlayerId !== myPid` (hợp đồng IMP-205).
   - `activity_tracker.ts#L335` (`trackDeltaActivities`) phát tiếp 1 thẻ nổi 4.8s cho mọi loại thẻ. Cả hai cùng tranh chấp hiển thị.

---

### 2. SƠ ĐỒ KIẾN TRÚC MỤC TIÊU (TARGET ARCHITECTURE)

```
[Server: turn_loop.ts / room_manager.ts]
   ├── calculateGoSalary(room.roundCount): 2.000 | 1.500 | 1.000 Tr.
   └── executeTurnRoll trả về RollResult { passedGo: true, passedGoSalary: salary }
              │
              ▼
[Server: session_manager.ts]
   ├── DeltaPayload: thêm readonly passedGoSalary?: number;
   └── Broadcaster gửi passedGoSalary qua WebSocket delta
              │
              ▼
[Client: activity_rent_matcher.ts]
   ├── extractPassedGoActivities: nhận delta.passedGoSalary ?? calculateGoSalary(round)
   └── processPayerFee: kiểm tra card.drawnBy === payer.id && absDiff === Math.abs(card.effectDelta)
       └── sinh ActivityLogEntry type: 'card' mang tiêu đề thẻ bài thực tế
              │
              ▼
[Client: activity_badge_dispatcher.ts]
   ├── handleSalaryBadge: formula động `Hoàn thành 1 vòng sa bàn (+${formatCurrency(salaryAmt)} Tr.)`
   └── handleCardPenaltyBadge: hiển thị `Nộp Phạt: [Tên Thẻ Bài] ➔ Kho Bạc`
              │
              ▼
[Client: floating_numbers.tsx (Mobile Responsive Ergonomics)]
   ├── Cải tiến điều kiện: `(latestMilestone && displayItems.length > 1 && idx < displayItems.length - 1)`
   ├── Không có Milestone: Hiển thị cả 2 huy hiệu Lương + Phạt/Thuê trên Mobile
   └── Có Milestone: Hiển thị MilestoneBanner + 1 huy hiệu mới nhất trên Mobile (tổng <= 2 mục, <= 120px)
```

---

### 3. BẢNG NGÂN SÁCH DÒNG MÃ (LOC BUDGETS)

| Tệp Vật Lý | Phân Loại Tier | LOC Hiện Tại | LOC Sau Thay Đổi | Trần Quy Định | Đánh Giá |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/server/room_manager.ts` | Tier 1 (Server) | 380 | ~381 (+1 LOC) | <= 400 | ✔️ An toàn (< 400) |
| `src/server/session_manager.ts` | Tier 1 (Server) | 398 | ~400 (+2 LOC) | <= 400 | ✔️ An toàn (sát trần 400, drop-in gọn 2 dòng) |
| `src/server/turn_loop.ts` | Tier 1 (Server) | 330 | ~333 (+3 LOC) | <= 400 | ✔️ An toàn |
| `src/server/network/wss_intent_handler.ts` | Tier 1 (Server) | 141 | ~143 (+2 LOC) | <= 400 | ✔️ An toàn |
| `src/client/network/activity_badge_dispatcher.ts` | Tier 1 (Logic) | 222 | ~238 (+16 LOC) | <= 400 | ✔️ An toàn |
| `src/client/network/activity_rent_matcher.ts` | Tier 1 (Logic) | 304 | ~316 (+12 LOC) | <= 400 | ✔️ An toàn |
| `src/client/network/activity_tracker.ts` | Tier 1 (Logic) | 355 | ~357 (+2 LOC) | <= 400 | ✔️ An toàn |
| `src/client/ui/floating_numbers.tsx` | Tier 2 (UI) | 293 | ~294 (+1 LOC) | <= 500 | ✔️ An toàn |
| `src/client/offline_landing.ts` | Tier 1 (Logic) | 208 | ~210 (+2 LOC) | <= 400 | ✔️ An toàn |
| `src/client/ui/modals/game_rules_modal.tsx` | Tier 2 (UI) | 336 | ~341 (+5 LOC) | <= 500 | ✔️ An toàn |
| `tests/contracts/imp234_dynamic_go_salary_and_penalty_distinction.test.ts` | Test Suite | 0 (Mới) | ~450 LOC | <= 600 | ✔️ Chuẩn |

---

### 4. NHIỆM VỤ TRIỂN KHAI VẬT LÝ (DETAILED DROP-IN TASKS)

#### Task 1: Server Authoritative Dynamic Salary & Delta Pipeline in `room_manager.ts`, `session_manager.ts`, `turn_loop.ts` & `wss_intent_handler.ts`
- **Tệp:** [`src/server/room_manager.ts#L51-L56`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts#L51-L56)
- **Mục tiêu:** Thêm `readonly passedGoSalary?: number;` vào interface `RollResult`.
- **Drop-in Snippet:**
  ```typescript
  export interface RollResult {
    readonly dice: DiceResult;
    readonly player: Readonly<{ id: string; position: number; balance: number }>;
    readonly passedGo: boolean;
    readonly passedGoSalary?: number;
    readonly rentCharged: number;
  }
  ```
- **Tệp:** [`src/server/session_manager.ts#L71-L93`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts#L71-L93)
- **Mục tiêu:** Thêm `readonly passedGoSalary?: number;` vào interface `DeltaPayload`.
- **Drop-in Snippet:**
  ```typescript
  export interface DeltaPayload {
    // ...
    readonly lastDiplomaticEvent?:  DiplomaticEventDelta | null;
    readonly passedGoSalary?:       number;
  }
  ```
- **Tệp:** [`src/server/turn_loop.ts#L132-L221`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/turn_loop.ts#L132-L221)
- **Hàm:** `executeTurnRoll`
- **Drop-in Snippet:**
  ```typescript
  // Trong executeTurnRoll (turn_loop.ts):
  const passed = checkPassedGo(oldPos, newPos);
  let passedGoSalary = 0;
  if (passed) {
    processPendingDebts(room, current);
    const rawGoTax = calculateGoPropertyTax(current.id, reg, sm);
    const goTax = Math.min(rawGoTax, GO_PROPERTY_TAX_CAP);
    const salary = calculateGoSalary(room.roundCount ?? 1);
    passedGoSalary = salary;
    current.balance += salary - goTax;
    // ...
  }
  return {
    dice,
    player: { id: current.id, position: current.position, balance: current.balance },
    passedGo: passed,
    passedGoSalary,
    rentCharged,
  };
  ```
- **Tệp:** [`src/server/network/wss_intent_handler.ts#L90-L95`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_intent_handler.ts#L90-L95)
- **Hàm:** `handleRollDiceMsg`
- **Drop-in Snippet (Locale-Independent):**
  ```typescript
  if (roll.passedGo) {
    const sal = roll.passedGoSalary ?? 2000;
    const formattedSalary = sal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    payloadSummary += ` (Qua ô Bắt Đầu +${formattedSalary})`;
  }
  ```

#### Task 2: Client Dynamic Salary & Formula Formatting in `activity_badge_dispatcher.ts`
- **Tệp:** [`src/client/network/activity_badge_dispatcher.ts#L130-L135`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_badge_dispatcher.ts#L130-L135)
- **Hàm:** `handleSalaryBadge`
- **Mục tiêu:** Dùng `act.amount` thực tế để định dạng cả `text` và `formula`, giữ nguyên hậu tố ` Tr.` để tương thích 100% với `TC-230.12`.
- **Drop-in Snippet:**
  ```typescript
  export function handleSalaryBadge(act: ActivityLogEntry, state: GameState): void {
    scheduleAction(() => {
      SoundEngine.playVictoryChime();
      const salaryAmt = act.amount ?? 2000;
      state.addFloatingText({
        text: `+${formatCurrency(salaryAmt)}`,
        type: FloatingTextType.Reward,
        playerId: act.playerId ?? '',
        actionType: 'salary',
        title: 'Lương Vượt Ô Bắt Đầu',
        formula: `Hoàn thành 1 vòng sa bàn (+${formatCurrency(salaryAmt)} Tr.)`,
      });
    }, getPawnPassGoDelay(act.playerId));
  }
  ```

#### Task 3: Structured Event Penalty in `activity_rent_matcher.ts` & `activity_badge_dispatcher.ts`
- **Tệp:** [`src/client/network/activity_rent_matcher.ts#L240-L267`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_rent_matcher.ts#L240-L267)
- **Hàm:** `processPayerFee`
- **Mục tiêu:** Nhận diện chặt chẽ: `(card.drawnBy === payer.id || card.playerId === payer.id)` và `Math.abs(card.effectDelta ?? 0) === absDiff` (triệt tiêu 100% false-positive nhầm lẫn tiền thuê/thuế).
- **Drop-in Snippet:**
  ```typescript
  // Trong processPayerFee:
  const card = delta?.lastEventCard;
  const isDrawnByPayer = Boolean(
    card && (card.drawnBy === payer.id || card.playerId === payer.id)
  );
  const isCardPenalty = isDrawnByPayer && typeof card?.effectDelta === 'number' && card.effectDelta < 0 && Math.abs(card.effectDelta) === absDiff;
  if (isCardPenalty && card) {
    const cardTitle = card.title || 'Phiếu Sự Kiện';
    return {
      id: `card_penalty_${Date.now()}_${payer.id}`,
      timestamp: Date.now(),
      type: 'card',
      message: `🎟️ ${pName} đã nộp phạt ${formatCurrency(absDiff)} (${cardTitle})`,
      playerId: payer.id,
      playerName: pName,
      amount: payer.diff,
      ...(payer.cellIndex !== undefined ? { cellIndex: payer.cellIndex } : {}),
      ...(payer.pInfo?.tokenColor ? { playerTokenColor: payer.pInfo.tokenColor } : {}),
    };
  }
  ```
- **Tệp:** [`src/client/network/activity_badge_dispatcher.ts#L180-L205`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_badge_dispatcher.ts#L180-L205)
- **Hàm:** Khai báo `handleCardPenaltyBadge` và đăng ký vào `BADGE_HANDLERS['card']`.
- **Drop-in Snippet:**
  ```typescript
  export function handleCardPenaltyBadge(act: ActivityLogEntry, state: GameState): void {
    const amount = act.amount !== undefined ? -Math.abs(act.amount) : 0;
    if (amount === 0) return;
    const match = act.message.match(/\((.+?)\)/);
    const cardTitle = match ? match[1] : 'Phiếu Sự Kiện';
    scheduleAction(() => {
      state.addFloatingText({
        text: formatCurrency(amount),
        type: FloatingTextType.Penalty,
        playerId: act.playerId ?? '',
        actionType: 'chance',
        title: `Nộp Phạt: ${cardTitle} ➔ Kho Bạc`,
        cellIndex: act.cellIndex,
      });
    }, getPawnLandingDelay(act.playerId));
  }

  // Trong BADGE_HANDLERS:
  card: (act, state) => {
    if (act.id.startsWith('ma_buyout')) handleMaBuyoutBadge(act, state);
    else if (act.amount && act.amount < 0) handleCardPenaltyBadge(act, state);
  },
  ```

#### Task 4: Deduplicate Bot Card Floating Text in `activity_tracker.ts` (Bảo Toàn Thẻ Thưởng & IMP-205)
- **Tệp:** [`src/client/network/activity_tracker.ts#L330-L345`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_tracker.ts#L330-L345)
- **Mục tiêu:** Không xoá trắng `addFloatingText`! Chỉ chặn phát đúp khi đó là Bot card (vì `syncEventCard` trong `apply_delta.ts` đã phát theo IMP-205). Thẻ Thưởng (Reward cards), Thẻ Thị Trường (Market cards) và thẻ của Người chơi vẫn hiển thị đầy đủ `punchySummary`.
- **Drop-in Snippet:**
  ```typescript
  // Trong trackDeltaActivities (activity_tracker.ts#L330-L345):
  const myPid = useLobbyStore.getState().myPlayerId || 'p1';
  const isBotCard = Boolean(playerId && playerId !== myPid);

  // Chỉ phát toast tại tracker nếu không phải là bot card đã được syncEventCard phụ trách
  if (!isBotCard && typeof nextState?.addFloatingText === 'function') {
    nextState.addFloatingText({
      text: punchySummary,
      type: isReward ? FloatingTextType.Reward : FloatingTextType.Penalty,
      playerId,
      actionType: isMarket ? 'market' : 'chance',
      title: card.title,
      durationMs: 4800,
    });
  }

  try {
    AudioEngine.playSfx(SoundEffect.CARD_DRAW);
  } catch {
    // safe fallback
  }
  ```

#### Task 5: Mobile Responsive Reform in `src/client/ui/floating_numbers.tsx`
- **Toạ độ:** `FloatingNumbersOverlay` ([`src/client/ui/floating_numbers.tsx#L277-L288`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/floating_numbers.tsx#L277-L288))
- **Mục tiêu:** Cải tiến điều kiện ẩn: `Boolean(latestMilestone && displayItems.length > 1 && idx < displayItems.length - 1)`.
  * Khi không có Milestone: Cả 2 huy hiệu Lương và Phạt/Thuê đều hiển thị đầy đủ trên Mobile.
  * Khi có Milestone: Hiển thị Banner Milestone và DUY NHẤT 1 huy hiệu mới nhất trên Mobile (`idx === displayItems.length - 1`), ẩn toàn bộ badge cũ hơn (khống chế cứng: tổng <= 2 mục, chiều cao <= 120px, không che sa bàn 3D).
- **Drop-in Snippet:**
  ```tsx
  {displayItems.map((item, idx) => {
    const isHiddenOnMobile = Boolean(
      latestMilestone && displayItems.length > 1 && idx < displayItems.length - 1
    );
    return (
      <div
        key={item.id}
        className={
          isHiddenOnMobile
            ? "w-full justify-start sm:justify-center hidden md:flex"
            : "w-full flex justify-start sm:justify-center"
        }
      >
        <FloatingBadge item={item} />
      </div>
    );
  })}
  ```

#### Task 6: Offline Landing Dynamic Salary & Game Rules Modal Update
- **Hàm:** `executeCellLanding` ([`src/client/offline_landing.ts#L187-L202`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/offline_landing.ts#L187-L202))
- **Mục tiêu:** Lấy `salary = calculateGoSalary(state.roundNumber ?? 1)` thay vì gán cứng 2000.
- **Tệp:** [`src/client/ui/modals/game_rules_modal.tsx#L116`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/game_rules_modal.tsx#L116)
- **Mục tiêu:** Cập nhật nội dung mô tả cơ chế lương giảm dần theo chu kỳ: Vòng 1–20 nhận 2.000; Vòng 21–30 nhận 1.500; Vòng 31+ nhận 1.000 Tr.

---

### 5. MA TRẬN KIỂM THỬ HỢP ĐỒNG 5 MẶT (UNIVERSAL 5-FACET CONTRACT MATRIX)
**Tệp kiểm thử:** `tests/contracts/imp234_dynamic_go_salary_and_penalty_distinction.test.ts` (16 atomic tests)

- **Facet 1: Tính Toán & Đồng Bộ Lương GO Động Theo Vòng (Server & Client Sync) (4 tests):**
  * `[TC-234.01/MSS][UC-GAME-020][Facet-1/Round1To20SalaryIs2000]`: Vòng 15, `turn_loop.executeTurnRoll` khi qua GO trả về `passedGoSalary === 2000`.
  * `[TC-234.02/MSS][UC-GAME-020][Facet-1/Round21To30SalaryIs1500]`: Vòng 25, `turn_loop.executeTurnRoll` khi qua GO trả về `passedGoSalary === 1500`.
  * `[TC-234.03/MSS][UC-GAME-020][Facet-1/Round31PlusSalaryIs1000]`: Vòng 35, `turn_loop.executeTurnRoll` khi qua GO trả về `passedGoSalary === 1000`.
  * `[TC-234.04/MSS][UC-GAME-020][Facet-1/WssIntentSummaryDynamicText]`: `wss_intent_handler` ghi log payloadSummary mang chuỗi `(Qua ô Bắt Đầu +1.500)` ở vòng 25 (assert chứa cả `+1.500`, độc lập locale).

- **Facet 2: Định Dạng Huy Hiệu Lương Phía Client (Dynamic Formula & Text) (3 tests):**
  * `[TC-234.05/MSS][UC-GAME-020][Facet-2/SalaryBadgeFormatsDynamicFormula]`: Khi `act.amount === 1500`, `handleSalaryBadge` sinh badge có `text: '+1.500'` và `formula: 'Hoàn thành 1 vòng sa bàn (+1.500 Tr.)'`.
  * `[TC-234.06/MSS][UC-GAME-020][Facet-2/SalaryBadgeFormats1000Formula]`: Khi `act.amount === 1000`, `handleSalaryBadge` sinh badge có `text: '+1.000'` và `formula: 'Hoàn thành 1 vòng sa bàn (+1.000 Tr.)'`.
  * `[TC-234.07/MSS][UC-GAME-020][Facet-2/OfflineLandingDynamicSalary]`: Chế độ offline tính đúng lương theo `state.roundNumber` (vòng 25 cộng đúng 1.500).

- **Facet 3: Tách Bạch & Định Danh Phiếu Phạt Sự Kiện (Card Penalty Distinction) (3 tests):**
  * `[TC-234.08/MSS][UC-GAME-020][Facet-3/ChancePenaltyTitledAccurately]`: Bot qua GO nhận 2.000, đồng thời bốc thẻ phạt chạy quá tốc độ 500 (`delta.lastEventCard` có `drawnBy` trùng bot và `effectDelta === -500`), `processPayerFee` trả về ActivityLogEntry có `type === 'card'` và `amount === -500`, không gán nhãn thành tax.
  * `[TC-234.09/MSS][UC-GAME-020][Facet-3/CardPenaltyBadgeDisplaysTitle]`: `handleCardPenaltyBadge` hiển thị title `Nộp Phạt: Chạy quá tốc độ ➔ Kho Bạc` khi thông điệp là nộp phạt thẻ bài.
  * `[TC-234.10/MSS][UC-GAME-020][Facet-3/ZeroDuplicateCardFloatingText]`: `syncEventCard` phát toast cho Bot, `trackDeltaActivities` không phát thêm floating text trùng lặp thứ 2 (bảo toàn thẻ thưởng cho human).

- **Facet 4: Công Thái Học & Hiển Thị Đa Huy Hiệu Trên Mobile (Mobile Responsive Visibility) (3 tests):**
  * `[TC-234.11/MSS][UC-GAME-020][Facet-4/MobileRendersBothSalaryAndPenaltyBadges]`: Render `FloatingNumbersOverlay` khi không có milestone và có 2 badges (Lương + Phạt) ➔ Cả 2 item đều hiển thị trên Mobile (không chứa `hidden md:flex`).
  * `[TC-234.12/MSS][UC-GAME-020][Facet-4/MobileRendersMilestoneAndLatestBadge]`: Khi có `latestMilestone` đồng thời có 2 `displayItems` ➔ Huy hiệu thứ hai (mới nhất) vẫn hiển thị trên Mobile cùng Banner, chỉ ẩn huy hiệu cũ hơn (tổng số mục trên mobile luôn <= 2).
  * `[TC-234.13/MSS][UC-GAME-020][Facet-4/SSRHeadlessRenderSafety]`: Kết xuất SSR `FloatingNumbersOverlay` với đa dạng badge chạy an toàn 100%.

- **Facet 5: Độ Bền Vững & Bảo Toàn Luật Chơi (Robustness & Regression Guard) (3 tests):**
  * `[TC-234.14/MSS][UC-GAME-020][Facet-5/Imp205BotToastsPreserved]`: Toàn bộ hành vi phát toast bot trong `syncEventCard` vẫn giữ nguyên durationMs: 2500 và type theo effectDelta.
  * `[TC-234.15/MSS][UC-GAME-020][Facet-5/RentPayersSeparationRemainsIntact]`: Giao dịch trả tiền thuê cho đối thủ trong `matchRentTransactions` tiếp tục hoạt động an toàn và không bị phân loại nhầm sang card penalty (bảo toàn invariant `absDiff === Math.abs(card.effectDelta)`).
  * `[TC-234.16/MSS][UC-GAME-020][Facet-5/GameRulesModalExplainsDynamicSalary]`: Modal quy tắc luật chơi giải thích đầy đủ các mốc lương 2.000 / 1.500 / 1.000 Tr.

---

### 6. QUY TRÌNH THỰC THI 4 TRẠM KHÉP KÍN (4-STATION PIPELINE)
1. **Station 1 (RED Contract Test):** `qa-tester` tạo `tests/contracts/imp234_dynamic_go_salary_and_penalty_distinction.test.ts` (16 atomic tests) và chứng minh Business RED.
2. **Station 2 (GREEN Implementation):** `implementer` chỉnh sửa mã nguồn tại `src/**` để vượt qua 100% 16 tests và bảo toàn suite kiểm thử cũ (`imp205`, `imp230`).
3. **Station 2.5 (Fast Pre-Filter Sweep):** `scout` (flash) kiểm tra `tsc --noEmit`, LOC budget, zero dirty casts (`as any`), console.log purge.
4. **Station 3 (Independent Review Funnel):**
   - Phase 3.1: `spec-reviewer` đối soát 100% khớp kế hoạch SSOT v3.
   - Phase 3.2: `code-reviewer` audit kiến trúc, chống leak timer, zero race condition; `ui-craft-reviewer` audit hiển thị responsive trên mobile 360px.
5. **Station 4 (Adversarial Boundary & Mutation Sentinel):** `chaos-sentinel` thực thi 3 physical probes, chứng minh zero surviving mutants và ký duyệt `.agents/evidence/chaos_sentinel_imp234.json`.
