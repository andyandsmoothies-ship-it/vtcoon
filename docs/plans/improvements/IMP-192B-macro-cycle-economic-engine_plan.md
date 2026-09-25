# Kế Hoạch Triển Khai Kỹ Thuật (REV 3 - ĐÃ ĐỒNG THUẬN PHẢN BIỆN): IMP-192B - Chu Kỳ Vĩ Mô: Sốt Đất & Đóng Băng Thanh Khoản (Macro Economic Engine)

> **Mã Ticket**: `IMP-192B` (Slice 2/3 - Real-World Economic Engine)  
> **Phân Hạng Quản Trị**: Tier 2 (Full Rigor - FSM/Finance, Network Types & Domain State Machine)  
> **Tài Liệu Kiểm Toán**: [`.agents/audit/PLAN_AUDIT_IMP192B.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP192B.md)  
> **Evidence Snapshot**: `.agents/evidence/imp192b_snapshot.json`  

---

## I. KIẾN TRÚC TỔNG QUAN & DÒNG CHẢY DỮ LIỆU (VISUAL ARCHITECTURE)

```
[Biên Vòng Đấu Mới (next === 0)] 
       │
       ├─► [advanceRoundBoundary(room, rng)] ◄─── Gọi nhất quán từ cả turn_loop & insolvency_manager!
       │         │
       │         ├─► room.roundCount = (room.roundCount ?? 1) + 1
       │         ├─► room.activeModifiers = decayModifiers(room.activeModifiers)
       │         ├─► processTreasuryStimulus(room)
       │         └─► evaluateMacroCycle(room, rng)  [IDEMPOTENT & PURE]
       │                   │
       │                   ├─► Vòng 1-3 (cycleStep 1-3): MACRO_LAND_FEVER
       │                   │   • Chọn 1 ColorGroup ngẫu nhiên (hoặc seeded PRNG)
       │                   │   • room.activeMacroGroup = selectedGroup (Server Internal State)
       │                   │   • remainingRounds = 3, multiplier = 2.5 (x2.5 rent)
       │                   │   • calculateUpgradeCost: Áp dụng MACRO_FEVER_UPGRADE_COST_MULT = 0.75 (-25% giá xây)
       │                   │   • Synergistic Stacking: Kết hợp MC_CREDIT_STIMULUS (tối đa -40%), chặn sàn cost >= 50%
       │                   │   • Dùng chung cho cả Người & Bot!
       │                   │
       │                   ├─► Vòng 4-5 (cycleStep 4-5): MACRO_LIQUIDITY_FREEZE
       │                   │   • Khóa đúng room.activeMacroGroup vừa sốt đất (No-op an toàn nếu undefined, không tùy tiện phạt nhóm Nâu)
       │                   │   • remainingRounds = 2, multiplier = 0.5 (-50% rent)
       │                   │   • Cấm vay thế chấp: validateMortgage trả về LIQUIDITY_FROZEN
       │                   │   • Bot Solver & Posture: Loại bỏ ô đất bị đóng băng khỏi danh sách ứng viên thế chấp
       │                   │   • Khép kín đường ống: network_types, vi.ts, notification, title_deed_modal disable nút
       │                   │
       │                   └─► Vòng 6 (cycleStep 6): EQUILIBRIUM / COOLDOWN
       │                       • Modifiers phân rã về 0
       │                       • room.activeMacroGroup = undefined
       │                       • Sẵn sàng chu kỳ mới tại Vòng 7
```

---

## II. ĐỒNG THUẬN CÁC ĐIỂM PHẢN BIỆN (RECONCILED FEEDBACK)

### 1. 🔴 Blind Spot 1 — Quy Chuẩn Serialization `activeMacroGroup` (Áp Dụng Cách A)
- **Quyết định**: Áp dụng **Cách A** (Clean Seam, Zero Payload Bloat).
- `activeMacroGroup` chỉ tồn tại trên `Room` ở server-side như một state nội bộ để `evaluateMacroCycle` ghi nhớ nhóm màu nào vừa sốt đất ở Vòng 3 để kích hoạt đóng băng ở Vòng 4.
- **Client KHÔNG cần nhận riêng `activeMacroGroup` qua Delta**:
  - `activeModifiers` đã được serialize 100% qua `DeltaPayload` trong `session_manager.ts`.
  - Client UI (`title_deed_modal.tsx`, `title_deed_action_footer.tsx`) kiểm tra trực tiếp theo `cellIndex`:
    `effectiveModifiers.some(m => m.type === MacroCycleType.MACRO_LIQUIDITY_FREEZE && m.remainingRounds > 0 && (m.affectedCells ?? []).includes(cellIndex))`
  - `market_event_ticker.tsx` đọc `colorGroup` trực tiếp từ `activeModifiers[].colorGroup` (hoặc suy từ `affectedCells`).
  - Không gây phình to `DeltaPayload`, không cần sửa `session_manager.ts` hay `apply_delta.ts`.

### 2. 🔴 Blind Spot 2 — Cascade `rng` Cho `insolvency_manager.ts#advanceTurnAfterBankruptcy`
- Bổ sung tham số tùy chọn `rng: () => number = Math.random` vào:
  - `declareBankruptcy(room, playerId, registry, stateMap, creditorId, auctions, roomCode, rng = Math.random)`
  - `advanceTurnAfterBankruptcy(room: Room, rng: () => number = Math.random)`
- Tại `next === 0`, gọi `advanceRoundBoundary(room, rng)`.
- Điều chỉnh Delta LOC của `insolvency_manager.ts` từ +3 thành **+7 LOC** (tổng ~268 LOC, an toàn tuyệt đối dưới trần 400 LOC).

### 3. 🟡 Vấn đề nhỏ 1 — Đổi Tên Hằng Số Tránh Hiểu Nhầm
- Đổi tên:
  `MACRO_FEVER_UPGRADE_DISCOUNT = 0.75` ➔ **`MACRO_FEVER_UPGRADE_COST_MULT = 0.75`**
- Thể hiện rõ ràng đây là hệ số nhân chi phí (`cost = Math.floor(cost * MACRO_FEVER_UPGRADE_COST_MULT)`), loại trừ 100% rủi ro trừ 2 lần.

### 4. 🟡 Vấn đề nhỏ 2 — Quy Tắc Stacking Chiết Khấu & Chặn Sàn (Anti-Exploit Floor)
- Khi `MC_CREDIT_STIMULUS` (giảm 20%) và `MACRO_LAND_FEVER` (giảm 25%) cùng hiệu lực:
  `cost = Math.floor(cost * 0.8 * 0.75) = Math.floor(cost * 0.6)` (giảm tổng 40%).
- Đây là **combo cộng hưởng có chủ đích (Intentional Synergy)** khi người chơi bốc được thẻ kích cầu trúng thời điểm sốt đất.
- **Biện pháp phòng vệ chống lạm phát xây dựng (Floor Guard)**:
  Đặt sàn chi phí tối thiểu không thấp hơn 50% giá gốc:
  `cost = Math.max(Math.floor(baseUpgradeCost * 0.5), cost);`
  Bảo đảm cân bằng tài chính trò chơi ngay cả khi có nhiều hiệu ứng giảm giá đồng thời.

---

## III. MA TRẬN TÁC ĐỘNG 3 CHIỀU (3-WAY BLAST RADIUS MATRIX)

| Chiều Đánh Giá | Đối Tượng / Kịch Bản | Rủi Ro Tiềm Ẩn | Biện Pháp Phòng Vệ & Assert |
| :--- | :--- | :--- | :--- |
| **1. Downstream Consumers** | • `calculateRent`<br>• `upgradeProperty`<br>• `getUpgradeCost` (Bot)<br>• `mortgageProperty`<br>• Bot Solvency Solver<br>• Title Deed Modal / Action Footer | • Bot định giá sai chi phí nâng cấp<br>• Bot bị kẹt khi chọn ô đóng băng để thế chấp<br>• Nút Thế Chấp trên UI sáng mời gọi nhưng bấm bị lỗi | • Dùng chung `calculateUpgradeCost`<br>• Lọc bỏ ô đóng băng trong bot solvers<br>• Khép kín `LIQUIDITY_FROZEN` trên 5 tầng mạng và UI; disable nút trực tiếp |
| **2. Upstream Environmental Modifiers** | • `MC_LAND_FEVER` (Thẻ thị trường [6, 8, 31])<br>• `MC_CREDIT_STIMULUS`<br>• `MC_FREEZE_TRADE` | • Chồng chéo thẻ bài thị trường và chu kỳ vĩ mô | • Tách riêng enum `MacroCycleType`, không làm loãng bộ bài 16 lá; hệ số nhân xếp tầng hợp lệ (`mult * mult`), chặn sàn chi phí 50% |
| **3. Exceptional Lifecycle Modes** | • Phá sản giữa lượt tại biên vòng<br>• Mất kết nối & Đồng bộ lại (Reconnect)<br>• Phá sản giải thể trong pha đóng băng | • Lệch nhịp `roundCount`, mất chu kỳ vĩ mô<br>• Rớt mất state vĩ mô khi reconnect | • `advanceRoundBoundary` thống nhất xử lý biên vòng kèm `rng`<br>• `activeModifiers` lưu trực tiếp trên `Room`, serialize đầy đủ qua delta |

---

## IV. BẢN ĐỒ MÃ NGUỒN VẬT LÝ & TÍNH TOÁN DELTA LOC (PRE-CODING DELTA LOC)

Theo quy định `GEMINI.md`:
- **TIER 1 (Domain Logic / FSM / Server)**: Tối đa 400 LOC (cảnh báo 300 LOC, lỗi cứng 550 LOC).
- **TIER 2 (UI Components / Modals)**: Tối đa 500 LOC (cảnh báo 400 LOC).
- **TIER 3 (Static Data / Enums / Types)**: Tối đa 800 LOC.
- **Unit / Contract Tests**: Tối đa 300 LOC (ngưỡng dung sai <= 650 LOC cho suite >= 16 atomic tests).

| Tệp Vật Lý | Tier | LOC Hiện Tại | Delta Dự Kiến | LOC Sau Chỉnh Sửa | Đánh Giá Ngân Sách |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/domain/macro_cycle_types.ts` (Mới) | Tier 1 | 0 | +22 | **22** | An toàn (< 400 LOC) |
| `src/domain/macro_cycle_engine.ts` (Mới) | Tier 1 | 0 | +90 | **90** | An toàn (< 400 LOC) |
| `src/domain/room.ts` | Tier 1 | 243 | +5 | **248** | An toàn (< 400 LOC) |
| `src/domain/property_upgrade.ts` | Tier 1 | 165 | +18 | **183** | An toàn (< 400 LOC) |
| `src/domain/bot/bot_engine.ts` | Tier 1 | 394 | -6 | **388** | Giảm slop, an toàn (< 400 LOC) |
| `src/domain/bot/solvency_solver.ts` | Tier 1 | 226 | +8 | **234** | An toàn (< 400 LOC) |
| `src/domain/bot/bot_posture.ts` | Tier 1 | 208 | +5 | **213** | An toàn (< 400 LOC) |
| `src/server/turn_loop.ts` | Tier 1 | 252 | +15 | **267** | An toàn (< 400 LOC) |
| `src/server/insolvency_manager.ts` | Tier 1 | 261 | +7 | **268** | An toàn (< 400 LOC) |
| `src/server/mortgage_manager.ts` | Tier 1 | 253 | +8 | **261** | An toàn (< 400 LOC) |
| `src/server/room_manager_lifecycle.ts` | Tier 1 | 267 | +5 | **272** | An toàn (< 400 LOC) |
| `src/server/room_manager.ts` | Tier 1 | 522 | **+0** | **522** | **Bảo lưu tuyệt đối (Tránh lỗi 550 LOC)** |
| `src/domain/action_reasons.ts` | Tier 3 | 38 | +1 | **39** | An toàn (< 800 LOC) |
| `src/server/network/network_types.ts` | Tier 3 | 199 | +1 | **200** | An toàn (< 800 LOC) |
| `src/domain/i18n/vi.ts` | Tier 3 | 145 | +3 | **148** | An toàn (< 800 LOC) |
| `src/client/ui/actionable_notification.ts` | Tier 2 | 198 | +8 | **206** | An toàn (< 500 LOC) |
| `src/client/network/ws_message_handler.ts` | Tier 1 | 159 | +8 | **167** | An toàn (< 400 LOC) |
| `src/client/ui/modals/title_deed_modal.tsx` | Tier 2 | 291 | +8 | **299** | An toàn (< 500 LOC) |
| `src/client/ui/modals/title_deed_action_footer.tsx` | Tier 2 | 152 | +6 | **158** | An toàn (< 500 LOC) |
| `src/client/ui/market_event_ticker.tsx` | Tier 2 | 196 | +12 | **208** | An toàn (< 500 LOC) |

---

## V. ĐẶC TẢ CHI TIẾT CÁC MÔ-ĐUN MÃ NGUỒN

### 1. `src/domain/macro_cycle_types.ts` (Tệp mới)
- Định nghĩa enum `MacroCycleType`:
  ```ts
  export enum MacroCycleType {
    MACRO_LAND_FEVER = 'MACRO_LAND_FEVER',
    MACRO_LIQUIDITY_FREEZE = 'MACRO_LIQUIDITY_FREEZE',
  }
  ```
- Export các hằng số chu kỳ:
  ```ts
  export const MACRO_CYCLE_LENGTH = 6;
  export const MACRO_FEVER_ROUNDS = 3;
  export const MACRO_FREEZE_ROUNDS = 2;
  export const MACRO_FEVER_RENT_MULT = 2.5;
  export const MACRO_FREEZE_RENT_MULT = 0.5;
  export const MACRO_FEVER_UPGRADE_COST_MULT = 0.75;
  export const MACRO_UPGRADE_COST_FLOOR = 0.50;
  ```

### 2. `src/domain/room.ts`
- Bổ sung `readonly colorGroup?: ColorGroup;` vào `MarketModifier`.
- Bổ sung `activeMacroGroup?: ColorGroup;` vào `Room` (Server Internal).
- Mở rộng union: `type: MarketCardId | ChanceCardId | MacroCycleType`.

### 3. `src/domain/macro_cycle_engine.ts` (Tệp mới)
- Hàm thuần túy kiểm tra và điều phối chu kỳ:
  ```ts
  export function evaluateMacroCycle(
    room: Room,
    rng: () => number = Math.random,
  ): void {
    const round = room.roundCount ?? 1;
    const cycleStep = ((round - 1) % MACRO_CYCLE_LENGTH) + 1;

    // Idempotency check: Không thêm nếu modifier chu kỳ tương ứng đã tồn tại
    if (cycleStep <= MACRO_FEVER_ROUNDS) {
      if (room.activeModifiers.some((m) => m.type === MacroCycleType.MACRO_LAND_FEVER)) return;
      const groups = Object.values(ColorGroup);
      const selectedGroup = groups[Math.floor(rng() * groups.length)] ?? ColorGroup.Nau;
      room.activeMacroGroup = selectedGroup;
      const affectedCells = BOARD_CONFIG.filter((c) => c.colorGroup === selectedGroup).map((c) => c.index);
      room.activeModifiers.push({
        type: MacroCycleType.MACRO_LAND_FEVER,
        affectedCells,
        remainingRounds: MACRO_FEVER_ROUNDS - (cycleStep - 1),
        multiplier: MACRO_FEVER_RENT_MULT,
        colorGroup: selectedGroup,
      });
    } else if (cycleStep <= MACRO_FEVER_ROUNDS + MACRO_FREEZE_ROUNDS) {
      if (room.activeModifiers.some((m) => m.type === MacroCycleType.MACRO_LIQUIDITY_FREEZE)) return;
      // No-op an toàn nếu không có activeMacroGroup (không tùy tiện phạt nhóm Nâu)
      if (!room.activeMacroGroup) return;
      const group = room.activeMacroGroup;
      const affectedCells = BOARD_CONFIG.filter((c) => c.colorGroup === group).map((c) => c.index);
      room.activeModifiers.push({
        type: MacroCycleType.MACRO_LIQUIDITY_FREEZE,
        affectedCells,
        remainingRounds: (MACRO_FEVER_ROUNDS + MACRO_FREEZE_ROUNDS + 1) - cycleStep,
        multiplier: MACRO_FREEZE_RENT_MULT,
        colorGroup: group,
      });
    } else {
      // Cooldown phase: Reset macro state
      room.activeMacroGroup = undefined;
    }
  }
  ```

### 4. `src/domain/property_upgrade.ts` & `src/domain/bot/bot_engine.ts`
- Xuất hàm helper dùng chung từ `property_upgrade.ts`:
  ```ts
  export function calculateUpgradeCost(
    cellIndex: number,
    currentLevel: number,
    modifiers?: readonly MarketModifier[],
  ): number {
    const deed = PROPERTY_DEEDS.get(cellIndex);
    if (!deed?.upgradeCosts || currentLevel >= 3) return 0;
    const baseCost = deed.upgradeCosts[currentLevel] ?? 0;
    let cost = baseCost;
    if (modifiers?.some((m) => m.type === MarketCardId.MC_CREDIT_STIMULUS && m.remainingRounds > 0)) {
      cost = Math.floor(cost * 0.8);
    }
    if (modifiers?.some((m) => m.type === MacroCycleType.MACRO_LAND_FEVER && m.remainingRounds > 0 && (m.affectedCells as readonly number[]).includes(cellIndex))) {
      cost = Math.floor(cost * MACRO_FEVER_UPGRADE_COST_MULT);
    }
    // Floor guard: Không giảm sâu quá 50% chi phí gốc
    return Math.max(Math.floor(baseCost * MACRO_UPGRADE_COST_FLOOR), cost);
  }
  ```
- Trong `upgradeProperty`: Sử dụng `calculateUpgradeCost`.
- Trong `bot_engine.ts#getUpgradeCost`: Thay bằng `return calculateUpgradeCost(cellIndex, stateMap.get(cellIndex)?.level ?? 0, modifiers);`.

### 5. `src/server/turn_loop.ts` & `src/server/insolvency_manager.ts`
- Xuất hàm chuyển biên vòng dùng chung:
  ```ts
  export function advanceRoundBoundary(room: Room, rng: () => number = Math.random): void {
    room.roundCount = (room.roundCount ?? 1) + 1;
    room.activeModifiers = decayModifiers(room.activeModifiers ?? []);
    evaluateMacroCycle(room, rng);
    processTreasuryStimulus(room);
  }
  ```
- Gọi hàm này trong `executeTurnEnd` (`turn_loop.ts`) và `advanceTurnAfterBankruptcy(room, rng)` (`insolvency_manager.ts`).

### 6. `src/server/mortgage_manager.ts`
- Tại `validateMortgage`:
  ```ts
  const isLiquidityFrozen = (room.activeModifiers ?? []).some(
    (m) => m.type === MacroCycleType.MACRO_LIQUIDITY_FREEZE &&
           m.remainingRounds > 0 &&
           (m.affectedCells as readonly number[]).includes(cellIndex),
  );
  if (isLiquidityFrozen) return { valid: false, reason: ActionRejectReason.LIQUIDITY_FROZEN };
  ```

### 7. Khép Kín Chuỗi Type & UI Cho `LIQUIDITY_FROZEN`
- `src/domain/action_reasons.ts`: Thêm `LIQUIDITY_FROZEN: 'LIQUIDITY_FROZEN'`.
- `src/server/network/network_types.ts`: Thêm `'LIQUIDITY_FROZEN'` vào `WsErrorMessageReason`.
- `src/domain/i18n/vi.ts`: Thêm bản dịch tiếng Việt cho `LIQUIDITY_FROZEN` và 2 sự kiện vĩ mô.
- `src/client/ui/actionable_notification.ts`: Thêm icon `'🧊'`, tiêu đề và gợi ý hành động.
- `src/client/network/ws_message_handler.ts`: Bắt mã để bắn Floating Text.
- `src/client/ui/modals/title_deed_modal.tsx` & `title_deed_action_footer.tsx`: Disable nút [Thế Chấp] khi `isLiquidityFrozen`.
- `src/client/ui/market_event_ticker.tsx`: Thêm mapping icon, tiêu đề và tóm tắt hiệu ứng cho 2 sự kiện vĩ mô.

### 8. Phòng Vệ Bot Solvency
- Trong `src/domain/bot/solvency_solver.ts` (`findSingleMortgageCell`, `findRemainingMortgageCell`) và `src/domain/bot/bot_posture.ts` (`findEligibleProactiveMortgage`): Loại trừ các ô đất đang bị `MACRO_LIQUIDITY_FREEZE`.

---

## VI. TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE)

1. **Station 1 (QA RED)**:
   - Tệp test hợp đồng: `tests/contracts/imp192b_macro_cycle_engine.test.ts`.
   - Tối thiểu 16 atomic tests có tag `[TC-192B.xx/MSS][UC-IMP192B]`.
   - Bao phủ: Kích hoạt mốc vòng 6, tính x2.5 rent khi sốt đất, chiết khấu nâng cấp (cả người & bot) chặn sàn 50%, giảm -50% rent khi đóng băng, từ chối thế chấp khi đóng băng, bot solvency không chọn ô đóng băng, chuyển biên vòng khi phá sản kèm `rng`, bộ bài 16 lá thị trường không bị nhiễm enum mới.
   - Chứng minh Inversion Gate (RED) trên mã nguồn vật lý trước khi implement.
2. **Station 2 (GREEN)**:
   - Viết mã nguồn tối thiểu trong `src/**` để 100% test mới PASS và toàn bộ suite `npm test` PASS (318/318 test files).
3. **Station 2.5 (Scout Sweeping Audit)**:
   - Quét 100% file vật lý modified tìm 5 nhóm lỗi ngầm và xác nhận ngân sách dòng mã.
4. **Station 3 (Independent Review)**:
   - `spec-reviewer` và `code-reviewer` kiểm tra đĩa vật lý và ký duyệt `APPROVED`.
