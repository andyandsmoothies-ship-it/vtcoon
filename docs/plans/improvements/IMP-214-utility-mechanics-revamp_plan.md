# [PLAN] IMP-214: Cải Tiến Toàn Diện Cơ Chế Tiện Ích EVN & Viettel (Utility Mechanics Revamp - Revision 3)

> **Mã Ticket**: IMP-214  
> **Phân loại**: Tier 2 (Full Rigor - Domain Rent, Server Turn Loop, Special Cells, UI View Consumers & Treasury Balance)  
> **Trạng thái**: COMPLETED_APPROVED (Đã nghiệm thu hoàn tất Quy trình 3 Trạm: Contract Tests 18/18 PASS, Code PASS, UI Craft APPROVED)  
> **Mục tiêu**: 
> 1. Xóa bỏ cơ chế nhân xúc xắc 2D6 cổ điển của Monopoly 1935 tại 2 ô Tiện ích (Ô 12 EVN & Ô 28 Viettel). Chuyển sang phí dừng chân phẳng có tính răn đe: 1 ô = 1.000 Tr. VNĐ, 2 ô = 2.500 Tr. VNĐ, nâng cấp Smart Grid/5G = 3.500 Tr. VNĐ. Cập nhật dữ liệu gốc `PROPERTY_DEEDS` (`rent0: 1000`).
> 2. Subtractive Refactoring `MC_UTILITY_DOUBLE`: Xóa bỏ code ghi đè cũ tại `property_manager.ts:98-100`, để `calculateRent` tự động nhân đôi phí dừng chân phẳng (`baseRent * 2`) thành 2.000 / 5.000 / 7.000 Tr. VNĐ.
> 3. Kích hoạt cơ chế Hóa đơn Tiền điện Toàn mạng cho EVN (Ô 12): Mỗi khi đối thủ vượt qua ô GO nhận lương, chủ EVN thu tiền điện theo từng ô đất đối thủ sở hữu: Cấp 1 = 100 Tr., Cấp 2 = 200 Tr., Cấp 3 = 300 Tr. VNĐ/ô. Đất Cấp 0 (đất trống) có tiền điện = 0 Tr. VNĐ (Level-0 Unbuilt Exemption).
> 4. Kích hoạt cơ chế Cước Viễn thông & Dữ liệu Toàn mạng cho Viettel (Ô 28): Mỗi khi đối thủ dừng chân tại ô Cơ Hội hoặc Thị Trường để rút thẻ, chủ Viettel thu 150 Tr. VNĐ cước data di động.
> 5. Rào chắn bất biến toàn diện:
>    - Mortgage Check tuân thủ SSOT: Dùng `owner.mortgagedProperties?.includes(cellIndex)`.
>    - Anti-Camping Audit Check (`IMP-192A`): Chủ sở hữu đang ở Trạm Kiểm Toán (`inAudit || auditTurnsLeft > 0`) bị vô hiệu hóa thu tiền điện và cước viễn thông.
>    - Bảo toàn dòng tiền: Zero-sum khi đủ tiền, Non-inflationary sink khi mất thanh khoản.
>    - Đồng bộ giao diện UI: Cập nhật Sổ Đỏ (`title_deed_rent_table.tsx`) và Đấu Giá (`auction_district_card.tsx`) hiển thị biểu phí mới.
>    - Reconcile toàn bộ 7 test suite hồi quy trên đĩa.

---

### I. CÁC TỆP MỤC TIÊU & NGÂN SÁCH LOC (Physical File Baseline)

| Tệp Vật Lý | Phân Loại Tier | LOC Hiện Tại | Dự Kiến Delta | Dự Kiến Sau Sửa | Ngưỡng Cho Phép |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/domain/property_rent.ts` | Tier 1 (Domain Logic - Pure) | **156** | +18 | **174** | <= 400 (Ceiling: 550) |
| `src/domain/property_data.ts` | Tier 3 (Static Config) | **93** | 0 | **93** | <= 800 |
| `src/domain/property_manager.ts` | Tier 1 (Domain Logic) | **153** | -3 (Subtractive) | **150** | <= 400 (Ceiling: 550) |
| `src/server/turn_loop.ts` | Tier 1 (Server Turn Loop) | **302** | +26 | **328** | <= 400 (Ceiling: 550) |
| `src/server/special_cell_handler.ts` | Tier 1 (Server Special Cells) | **47** | +23 | **70** | <= 400 (Ceiling: 550) |
| `src/client/ui/modals/title_deed_rent_table.tsx` | Tier 2 (UI Modal) | **147** | 0 | **147** | <= 500 |
| `src/client/ui/modals/auction_district_card.tsx` | Tier 2 (UI Modal) | **226** | 0 | **226** | <= 500 |
| `tests/contracts/imp214_utility_mechanics_revamp.test.ts` | Test Suite Mới | 0 | +380 | **380** | <= 600 |

#### Danh Mục 7 Test Suite Hồi Quy Cần Reconcile Assert:
1. `tests/domain/property_manager_upgrades.test.ts` (assert `calcUtilityFee`: 1.000 / 2.500 / 3.500 Tr.)
2. `tests/domain/threat_forecaster_edge.test.ts` (assert bot danger: 1.000 Tr. & 3.500 Tr.)
3. `tests/domain/event_card_rebalance_high_impact.test.ts` (assert `MC_UTILITY_DOUBLE` = 2.000 Tr.)
4. `tests/domain/event_card_engine.test.ts` (assert phí ô 12 = 1.000 Tr.)
5. `tests/domain/imp147_monopoly_rent_multiplier.test.ts` (assert ô 12 = 2.500 Tr.)
6. `tests/domain/imp115_dynamic_pacing_and_bot_polish.test.ts` (assert ô 12 = 1.000 Tr.)
7. `tests/client/ui04_business_modals.test.ts` (assert `rents[0] = 1000`)

---

### II. ĐẶC TẢ BẤT BIẾN TOÀN DIỆN (Domain & System Invariants)

1. **Quy tắc Miễn trừ Đất trống Cấp 0 (Level-0 Unbuilt Exemption)**:
   - Đất Cấp 0 là đất trống, chưa xây dựng -> Tiền điện = 0 Tr. VNĐ. Chỉ tính tiền điện cho công trình C1 (100 Tr.), C2 (200 Tr.), C3 (300 Tr./ô).
2. **Quy tắc Kiểm tra Thế chấp Chuẩn SSOT (Mortgage Check SSOT)**:
   - Điều kiện ô BĐS bị thế chấp: `Boolean(owner.mortgagedProperties?.includes(cellIndex) || stateMap?.get(cellIndex)?.isMortgaged)`. Khi thế chấp, ô tiện ích bị khóa 100% mọi khoản thu.
3. **Quy tắc Chống Cắm Trại Kiểm Toán (Anti-Camping Audit Immunity - IMP-192A)**:
   - Nếu chủ sở hữu EVN/Viettel đang ở Trạm Kiểm Toán (`owner.inAudit || (owner.auditTurnsLeft ?? 0) > 0`), họ bị cấm thu tiền điện qua GO và cước data rút thẻ sự kiện.
4. **Quy tắc Tự Cung Tự Cấp (Self-Billing Exemption)**:
   - Chủ sở hữu EVN qua GO không phải trả tiền điện cho chính mình.
   - Chủ sở hữu Viettel rút thẻ sự kiện không phải trả cước data cho chính mình.
5. **Quy tắc Bảo toàn Dòng tiền & Chống Tiền Ma (Financial Conservation Invariant)**:
   - Khi `player.balance >= fee`: $\Delta_{\text{system}} = 0$ (Zero-sum delta).
   - Khi `player.balance < fee`: Con nợ bị trừ đủ tiền (`balance -= fee`), chủ sở hữu chỉ nhận số tiền mặt thực tế tối đa con nợ có thể trả (`Math.min(fee, Math.max(0, debtor.balance))`). $\Delta_{\text{system}} \le 0$ (Non-inflationary sink, không sinh tiền ma).

---

### III. SƠ ĐỒ DÒNG DỮ LIỆU & PHÂN TẦNG KIẾN TRÚC

```
[DOMAIN LAYER: src/domain/property_rent.ts] (Pure Calculations Only)
      ├── calcUtilityFee(ownerId, diceTotal, registry, stateMap, cellIndex): number
      │     └── 1 ô: 1.000 Tr. | 2 ô: 2.500 Tr. | isUpgradedUtility: 3.500 Tr.
      └── calculateElectricBill(playerId, registry, stateMap): number
            └── C1: 100 Tr/ô | C2: 200 Tr/ô | C3: 300 Tr/ô | C0: 0 Tr.

[SERVER LAYER: src/server/turn_loop.ts] (Turn Loop & GO Salary Pipeline)
      └── checkPassedGo() 
            ├── calculateGoSalary() & calculateGoPropertyTax()
            ├── collectMortgageInterest(room, current.id)
            └── processGoElectricBilling(room, current, reg, sm)
                  ├── Guard: evnOwner !== current && !evnOwner.mortgagedProperties?.includes(12)
                  ├── Guard: !evnOwner.inAudit && (evnOwner.auditTurnsLeft ?? 0) <= 0
                  └── Transfer: trừ current.balance, cộng evnOwner.balance

[SERVER LAYER: src/server/special_cell_handler.ts] (Event Cells Pipeline)
      └── handleSpecialCell() -> CellType.Market | CellType.Chance
            ├── processViettelTelecomFee(room, cur, reg, sm)
            │     ├── Guard: viettelOwner !== cur && !viettelOwner.mortgagedProperties?.includes(28)
            │     ├── Guard: !viettelOwner.inAudit && (viettelOwner.auditTurnsLeft ?? 0) <= 0
            │     └── Transfer: trừ cur.balance, cộng viettelOwner.balance
            └── drawMarketCard() / drawChanceCard()

[UI VIEW CONSUMERS]
      ├── src/domain/property_data.ts: PROPERTY_DEEDS (rent0: 1000)
      ├── src/client/ui/modals/title_deed_rent_table.tsx: Render phí phẳng 1.000 / 2.500 / 3.500 Tr.
      └── src/client/ui/modals/auction_district_card.tsx: Render phí phẳng 1.000 / 2.500 Tr.
```

---

### IV. CHI TIẾT TRIỂN KHAI VẬT LÝ

#### 1. `src/domain/property_data.ts` (L36-L37)
```ts
  // Utility — phí phẳng cố định (IMP-214)
  [12, { price: 1500, rent0: 1000 }],
  [28, { price: 1500, rent0: 1000 }],
```

#### 2. `src/domain/property_rent.ts`
```ts
export const UTILITY_FEE_SINGLE = 1_000;
export const UTILITY_FEE_DOUBLE = 2_500;
export const UTILITY_FEE_UPGRADED = 3_500;

export function calcUtilityFee(
  ownerId: string, _diceTotal: number, registry: PropertyRegistry,
  stateMap?: PropertyStateMap, cellIndex?: number,
): number {
  if (cellIndex !== undefined && stateMap?.get(cellIndex)?.isUpgradedUtility) {
    return UTILITY_FEE_UPGRADED;
  }
  const count = UTILITY_CELLS.filter((c) => registry.get(c) === ownerId).length;
  return count >= 2 ? UTILITY_FEE_DOUBLE : UTILITY_FEE_SINGLE;
}

export const ELECTRIC_RATE_C1 = 100;
export const ELECTRIC_RATE_C2 = 200;
export const ELECTRIC_RATE_C3 = 300;

export function calculateElectricBill(
  playerId: string,
  registry: PropertyRegistry,
  stateMap?: PropertyStateMap,
): number {
  let totalBill = 0;
  for (const [cellIndex, owner] of registry) {
    if (owner === playerId) {
      const lvl = stateMap?.get(cellIndex)?.level ?? 0;
      if (lvl === 1) totalBill += ELECTRIC_RATE_C1;
      else if (lvl === 2) totalBill += ELECTRIC_RATE_C2;
      else if (lvl === 3) totalBill += ELECTRIC_RATE_C3;
    }
  }
  return totalBill;
}
```

#### 3. `src/domain/property_manager.ts` (Subtractive L98-L100)
Xóa bỏ:
```diff
-  if (cell?.type === CellType.Utility && modifiers?.some((m) => m.type === MarketCardId.MC_UTILITY_DOUBLE && m.remainingRounds > 0)) {
-    baseRent = (diceTotal ?? 7) * 100;
-  }
```

#### 4. `src/server/turn_loop.ts`
Import tại L8:
```ts
import { handleLanding, LandingResult, calculateGoPropertyTax, PROPERTY_DEEDS, GO_PROPERTY_TAX_CAP } from '../domain/property_manager';
import { calculateElectricBill } from '../domain/property_rent';
```
Helper:
```ts
function processGoElectricBilling(
  room: Room,
  player: Player,
  registry: PropertyRegistry,
  stateMap?: PropertyStateMap,
): void {
  const evnOwnerId = registry.get(12);
  if (!evnOwnerId || evnOwnerId === player.id) return;
  const evnOwner = room.players.find((p) => p.id === evnOwnerId);
  if (!evnOwner || evnOwner.bankrupt) return;
  if (evnOwner.inAudit || (evnOwner.auditTurnsLeft ?? 0) > 0) return;
  const isMortgaged = Boolean(
    evnOwner.mortgagedProperties?.includes(12) || stateMap?.get(12)?.isMortgaged,
  );
  if (isMortgaged) return;

  const electricBill = calculateElectricBill(player.id, registry, stateMap);
  if (electricBill <= 0) return;

  const actualPaid = Math.max(0, player.balance);
  player.balance -= electricBill;
  evnOwner.balance += Math.min(electricBill, actualPaid);
}
```
Tại L158-L161:
```ts
    // UC-052: Thu lãi thế chấp khi vượt GO
    collectMortgageInterest(room, current.id);
    // IMP-214: Thu hóa đơn tiền điện EVN
    processGoElectricBilling(room, current, reg, sm);
```

#### 5. `src/server/special_cell_handler.ts`
```ts
export const TELECOM_DATA_FEE = 150;

function processViettelTelecomFee(
  room: Room,
  cur: Player,
  reg: PropertyRegistry,
  sm: PropertyStateMap,
): void {
  const viettelOwnerId = reg.get(28);
  if (!viettelOwnerId || viettelOwnerId === cur.id) return;
  const viettelOwner = room.players.find((p) => p.id === viettelOwnerId);
  if (!viettelOwner || viettelOwner.bankrupt) return;
  if (viettelOwner.inAudit || (viettelOwner.auditTurnsLeft ?? 0) > 0) return;
  const isMortgaged = Boolean(
    viettelOwner.mortgagedProperties?.includes(28) || sm.get(28)?.isMortgaged,
  );
  if (isMortgaged) return;

  const actualPaid = Math.max(0, cur.balance);
  cur.balance -= TELECOM_DATA_FEE;
  viettelOwner.balance += Math.min(TELECOM_DATA_FEE, actualPaid);
}
```
Và gọi trong `handleSpecialCell`:
```ts
    case CellType.Market:
      processViettelTelecomFee(room, cur, reg, sm);
      drawMarketCard(room, reg, sm, deckRng);
      return true;
    case CellType.Chance:
      processViettelTelecomFee(room, cur, reg, sm);
      drawChanceCard(room, cur, deckRng, reg, sm, room.permanentRentBonus);
      return true;
```

#### 6. `src/client/ui/modals/title_deed_rent_table.tsx` & `auction_district_card.tsx`
Cập nhật hiển thị phí tiện ích thành:
`1 ô: 1.000 Tr. | 2 ô: 2.500 Tr. | 5G/Smart Grid: 3.500 Tr.` thay vì công thức nhân xúc xắc Monopoly 1935 cũ.

---

### V. MA TRẬN TEST HỢP ĐỒNG 5 DIỆN (Contract Test Suite: 18 Atomic Tests)

Tệp: `tests/contracts/imp214_utility_mechanics_revamp.test.ts`
- **Facet 1: Phí dừng chân phẳng bỏ xúc xắc 2D6**
  - `[TC-IMP214.01/MSS]` 1 tiện ích: phí phẳng 1.000 Tr. bất kể xúc xắc là 2 hay 12.
  - `[TC-IMP214.02/MSS]` 2 tiện ích (EVN + Viettel): phí phẳng 2.500 Tr.
  - `[TC-IMP214.03/MSS]` Tiện ích đã nâng cấp (`isUpgradedUtility: true`): phí phẳng 3.500 Tr.
  - `[TC-IMP214.04/MSS]` Thẻ `MC_UTILITY_DOUBLE` đang hiệu lực: nhân đôi phí phẳng thành 2.000, 5.000, 7.000 Tr.
- **Facet 2: Hóa đơn tiền điện EVN khi qua GO**
  - `[TC-IMP214.05/MSS]` Đối thủ sở hữu 1 nhà C1: qua GO nộp 100 Tr. cho chủ EVN.
  - `[TC-IMP214.06/MSS]` Đối thủ sở hữu 2 nhà C2 và 1 nhà C3: qua GO nộp 700 Tr. cho chủ EVN.
  - `[TC-IMP214.07/MSS]` Đối thủ chỉ sở hữu ô C0 đất trống: tiền điện = 0 Tr. (Level-0 Unbuilt Exemption).
  - `[TC-IMP214.08/MSS]` Tiền điện EVN trừ cùng lúc với lương GO và thuế tài sản mà không gây race condition.
- **Facet 3: Cước viễn thông Viettel khi rút thẻ sự kiện**
  - `[TC-IMP214.09/MSS]` Dừng chân tại ô Thị Trường (Market): trừ 150 Tr. cước data chuyển cho chủ Viettel.
  - `[TC-IMP214.10/MSS]` Dừng chân tại ô Cơ Hội (Chance): trừ 150 Tr. cước data chuyển cho chủ Viettel.
  - `[TC-IMP214.11/MSS]` Dừng chân tại các ô đặc biệt khác (GO, Thuế, Nghỉ dưỡng, Tù): không trừ cước Viettel.
  - `[TC-IMP214.12/MSS]` Cước Viettel kích hoạt trước khi bốc bài sự kiện.
- **Facet 4: Biên thế chấp, Kiểm toán & Tự cung tự cấp**
  - `[TC-IMP214.13/MSS]` Chính chủ EVN qua GO có nhiều nhà C3: tiền điện = 0 (tự cung tự cấp).
  - `[TC-IMP214.14/MSS]` Chính chủ Viettel rút thẻ sự kiện: cước viễn thông = 0.
  - `[TC-IMP214.15/MSS]` EVN hoặc Viettel bị thế chấp theo `owner.mortgagedProperties`: đối thủ được miễn 100% tiền điện / cước viễn thông.
  - `[TC-IMP214.16/MSS]` Chủ sở hữu đang ở Trạm Kiểm Toán (`inAudit` hoặc `auditTurnsLeft > 0`): bị khóa thu tiền điện và cước viễn thông (Anti-Camping Guard).
- **Facet 5: Bảo toàn dòng tiền & Xử lý mất thanh khoản**
  - `[TC-IMP214.17/MSS]` Người chơi có tiền mặt ít hơn tiền điện: người nợ bị âm tiền, chủ EVN chỉ nhận số tiền mặt thực tế tối đa của con nợ; hệ thống đóng vai trò Non-inflationary Sink ($\Delta_{\text{system}} \le 0$).
  - `[TC-IMP214.18/MSS]` Người chơi đủ tiền thanh toán: Tổng tiền hệ thống được bảo toàn nguyên vẹn ($\Delta_{\text{system}} = 0$).
