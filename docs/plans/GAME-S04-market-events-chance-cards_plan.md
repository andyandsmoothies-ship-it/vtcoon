# GAME-S04: Kế Hoạch Thi Công Slice 04 — Biến Cố Thị Trường Vĩ Mô & Thẻ Cơ Hội Cá Nhân

> **For agentic workers:** REQUIRED SUB-SKILL: Đọc và thực thi theo `subagent-driven-development`. Mỗi Task là một đơn vị nguyên tử — viết test trước, xanh lại toàn bộ 81 tests, rồi mới chuyển Task tiếp theo.

**Mục tiêu:** Kích hoạt 4 hệ thống nghiệp vụ mới: Event Card Engine (16 Market + 20 Chance Cards), Market Modifier System (RESORT/COASTAL priority rules), Sàn HOSE (ô 38, đặt cược 500–3.000), và Trạm Kiểm Toán (ô 10, phong tỏa 3 lượt / bảo lãnh 500 Tr). Xử lý 3 nợ kỹ thuật defer từ Slice 03 (C2 phụ phí, C3 skipNextTurn, ×2 Nghỉ dưỡng). Bảo toàn tuyệt đối 81 tests hiện tại.

**Kiến trúc tổng quan:**

```
[CellType: Market/Chance/Hose/TaxOrder/Audit]
        |
        +-- Market (o 02/17/33) --> drawMarketCard() --> applyMarketCard()
        |                                             --> activeModifiers[]
        +-- Chance (o 07/22/36) --> drawChanceCard() --> applyChanceCard()
        |                                             --> sendToAudit() [neu can]
        +-- Hose   (o 38)       --> HosePhase: INTENT_INVEST / INTENT_SKIP
        |                                      --> resolveHoseInvestment()
        +-- TaxOrder (o 30)     --> sendToAudit() ngay lap tuc
        +-- Audit  (o 10)       --> auditTurnsLeft check; INTENT_BAIL_OUT / do doi

[handleLanding()] --> doc activeModifiers[] --> dieu chinh rent
        +-- Buoc 1: zero-rent (COASTAL_STORM) thang --> rent = 0, thoat som
        +-- Buoc 2: multiplier (PEAK_TOURISM) ap khi khong zero-rent
        +-- Buoc 3: default rentAtLevel

[TURN_END] --> decayModifiers() giam remainingRounds --> xoa modifier = 0
```

**Tech Stack:** TypeScript strict (`noUncheckedIndexedAccess: true`), Vitest.

**Spec:** [issues/GAME-S04-market-events-chance-cards.md](file:///c:/Users/HP/Documents/GitHub/vtcoon/issues/GAME-S04-market-events-chance-cards.md)

---

## Phan Tich Tac Dong Lan Toa (Scout Report)

### Toa do can thiep hien tai (File:Dong)

| File | Dong can thiep | Noi dung hien tai | Thay doi can thiet |
|------|----------------|-------------------|--------------------|
| `src/domain/room.ts` | L8–L15 (enum TurnPhase) | 6 phase hien co | Them `HosePhase` |
| `src/domain/room.ts` | L17–L21 (interface Player) | `id, position, balance` | Them `skipNextTurn`, `auditTurnsLeft`, `hand` |
| `src/domain/room.ts` | L23–L30 (interface Room) | `roomCode, hostId, players...` | Them `activeModifiers`, deck fields |
| `src/domain/room.ts` | L42–L44 (createPlayer) | `{ id, position, balance }` | Them init fields moi |
| `src/domain/board_config.ts` | L3–L14 (enum CellType) | 10 types hien co | Them `Market`, `Hose`, `TaxOrder`, `Audit` |
| `src/domain/board_config.ts` | L31 (o 02), L46 (o 17), L62 (o 33) | `CommunityChest` | Doi sang `Market` |
| `src/domain/board_config.ts` | L39 (o 10) | `Jail` | Doi sang `Audit` |
| `src/domain/board_config.ts` | L59 (o 30) | `GoToJail` | Doi sang `TaxOrder` |
| `src/domain/board_config.ts` | L67 (o 38) | `Tax` | Doi sang `Hose` |
| `src/domain/property_manager.ts` | L109–L133 (`handleLanding`) | tru rent truc tiep | Them modifier lookup truoc khi tru |
| `src/domain/property_manager.ts` | L130–L131 (tru/cong rent) | `player.balance -= rentAmount` | Them C2 phu phi 1D6 chan +200, C3 skipNextTurn |
| `src/server/room_manager.ts` | L79–L101 (`handleRollDice`) | phan nhanh ActionPhase/PropMgmt | Them phan nhanh Market/Chance/Hose/TaxOrder/Audit |
| `src/server/room_manager.ts` | L24–L30 (`PlayerIntent` union) | 7 intent hien co | Them `INTENT_INVEST`, `INTENT_SKIP`, `INTENT_BAIL_OUT`, `INTENT_USE_DIPLOMATIC` |
| `src/server/room_manager.ts` | L208–L216 (`handleEndTurn`) | xoay luot don gian | Goi `decayModifiers()` truoc khi xoay |

### Rui ro tac dong lan toa

| Rui ro | Muc do | Bien phap |
|--------|--------|-----------|
| Doi `CommunityChest` -> `Market` lam gay test board_config.test.ts | CAO | Giu `CommunityChest` trong enum; chi cap nhat board data |
| Doi `GoToJail` -> `TaxOrder` anh huong test room_manager kiem tra o 30 | TRUNG | Grep "GoToJail" trong test files truoc khi doi |
| Mo rong `Player` interface lam gay `createPlayer` va tests so sanh object literal | TRUNG | Dung default values (0, [], false) cho truong moi |
| `handleLanding` nhan them `activeModifiers` param | THAP | Them param tuy chon `modifiers?: MarketModifier[]` — callers cu khong truyen = [] |

---

## Rang Buoc Toan Cuc

- TypeScript `strict: true`, `noUncheckedIndexedAccess: true`.
- Tong delta production toan Slice <= 244 LOC (moi task <= 80 LOC).
- 81 tests hien tai PASS tuyet doi sau moi Task — khong mot test nao duoc sua de pass.
- File `event_card_engine.ts` (moi) <= 130 dong tong cong.
- Khong sua tep ngoai pham vi: `dice.ts`, `theme.ts`, `session_manager.ts`, `game_canvas.tsx`.
- Khong dung placeholder (`TODO`, `TBD`).
- Moi the Card phai dung enum constant — khong dung magic string.
- `pendingDebts` tu CC_OVERDRAFT/CC_FREE_CREDIT chi ghi nhan, KHONG enforce (defer Slice 05).

---

## Quyet Dinh Thiet Ke Chu Chot

| # | Quyet dinh | Ly do |
|---|-----------|-------|
| D1 | `event_card_engine.ts` la module thuan (pure functions + constants), khong class | De test deterministic; khong phu thuoc RoomManager state |
| D2 | `handleLanding()` nhan them param tuy chon `modifiers?: MarketModifier[]` | Tuong thich nguoc 100%; 81 tests cu truyen undefined = [] |
| D3 | `activeModifiers[]` luu trong `Room` (khong trong Map rieng) | Modifier la trang thai van dau, thuoc ve Room — nhat quan voi `players[]` |
| D4 | Zero-rent thang khi conflict (COASTAL_STORM > PEAK_TOURISM) | Quyet dinh da chot boi User — bat loi cho chu dat duoc uu tien |
| D5 | `sendToAudit()` la private method cua RoomManager | Goi tu nhieu entry-point (landing, TaxOrder, chanceCard) — tap trung tai 1 noi |
| D6 | `decayModifiers()` goi tai `handleEndTurn()` sau khi xoay luot | Spec L166: "Ket thuc moi luot choi" = moi nguoi choi 1 luot; TC-04.2a xac nhan 1 INTENT_END_TURN giam remainingRounds 1 don vi |
| D7 | Neu `room_manager.ts` vuot 400 dong sau Task 5, tach `audit_manager.ts` | Tuan thu gioi han 400 LOC/file cua GEMINI.md |
| D8 | PRNG inject qua constructor seed cho `resolveHoseInvestment()` | Test deterministic voi `RoomManager(seed)` — khong can mock |

---

## DAG Micro-Tasks (Thu Tu Thuc Thi)

```
Task 1 --> Task 2 --> Task 3 --> Task 4 --> Task 5 --> Task 6 --> Task 7
  |           |           |           |           |           |           |
Domain    CellType    Domain      Modifier    Handler     Test        Adversarial
Enums &   & Board    State       System &    Server      Suite       Inversion
Decks     Config     (room.ts)   Rent Adj.   Intents     TC-04.x     x4
(NEW)     (MODIFY)   (MODIFY)    (MODIFY)    (MODIFY)    (NEW)       (VERIFY)
```

**Khong co Task nao song song.** Moi Task phu thuoc hoan toan vao output cua Task truoc.

---

## Task 1: Domain Enums, Hang So & Deck Functions (<= 75 LOC production)

**Muc tieu:** Tao file `event_card_engine.ts` — toan bo enums, hang so cell groups, ham tao deck shuffle, ham HOSE resolver.

**Files:**
- Tao moi: [`src/domain/event_card_engine.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/event_card_engine.ts)

**Toa do can thiep:** File moi — khong co dong cu nao bi thay the.

**Noi dung phai bao gom:**

```typescript
// [UC-GAME-038..041/MSS] Event Card Engine — Enums, Constants & Deck
export enum MarketCardId {
  MC_NIGHT_ECONOMY = 'MC_NIGHT_ECONOMY',
  MC_MEGA_CONCERT  = 'MC_MEGA_CONCERT',
  MC_ALCOHOL_CHECK = 'MC_ALCOHOL_CHECK',
  MC_CASINO_PILOT  = 'MC_CASINO_PILOT',
  MC_RATE_HIKE     = 'MC_RATE_HIKE',
  MC_CREDIT_STIMULUS = 'MC_CREDIT_STIMULUS',
  MC_LAND_FEVER    = 'MC_LAND_FEVER',
  MC_FIRE_INSPECTION = 'MC_FIRE_INSPECTION',
  MC_PUBLIC_INVEST = 'MC_PUBLIC_INVEST',
  MC_ANTI_SPECULATE = 'MC_ANTI_SPECULATE',
  MC_PEAK_TOURISM  = 'MC_PEAK_TOURISM',
  MC_FREEZE_TRADE  = 'MC_FREEZE_TRADE',
  MC_FUEL_SURGE    = 'MC_FUEL_SURGE',
  MC_URBAN_PLANNING = 'MC_URBAN_PLANNING',
  MC_UTILITY_DOUBLE = 'MC_UTILITY_DOUBLE',
  MC_COASTAL_STORM  = 'MC_COASTAL_STORM',
}

export enum ChanceCardId {
  CC_PLATE_AUCTION = 'CC_PLATE_AUCTION',
  CC_TAX_AUDIT = 'CC_TAX_AUDIT',
  CC_STOCK_PROFIT = 'CC_STOCK_PROFIT',
  CC_DIPLOMATIC = 'CC_DIPLOMATIC',
  CC_CONTRACT_PENALTY = 'CC_CONTRACT_PENALTY',
  CC_LAND_CHANGE = 'CC_LAND_CHANGE',
  CC_BUILD_HALT = 'CC_BUILD_HALT',
  CC_MA_FORCE = 'CC_MA_FORCE',
  CC_COPYRIGHT = 'CC_COPYRIGHT',
  CC_OVERDRAFT = 'CC_OVERDRAFT',
  CC_JUNK_STOCK = 'CC_JUNK_STOCK',
  CC_FRANCHISE = 'CC_FRANCHISE',
  CC_LAND_RECLAIM = 'CC_LAND_RECLAIM',
  CC_VENUE_INCIDENT = 'CC_VENUE_INCIDENT',
  CC_CONCERT_SPONSOR = 'CC_CONCERT_SPONSOR',
  CC_FREE_CREDIT = 'CC_FREE_CREDIT',
  CC_PORT_EXCLUSIVE = 'CC_PORT_EXCLUSIVE',
  CC_SLOW_BUILD = 'CC_SLOW_BUILD',
  CC_MEDIA_CRISIS = 'CC_MEDIA_CRISIS',
  CC_SWAP_PROJECT = 'CC_SWAP_PROJECT',
}

// Cell group constants (khong magic number)
export const RESORT_CELLS   = [11, 13, 14, 21, 24, 29] as const;
export const COASTAL_CELLS  = [11, 14, 16, 18, 19]     as const;
export const SERVICE_CELLS  = [6, 8, 26, 27]            as const;
export const INFRA_CELLS    = [5, 15, 25, 35]           as const;
export const UTILITY_CELLS_ECE = [12, 28]               as const;
export const HANOI_HCMC_CELLS = [31, 32, 34, 37, 39]   as const;
export const LAND_FEVER_CELLS = [6, 8, 31]              as const;

export const HOSE_OUTCOMES: Readonly<Record<number, number>> = {
  1: 0.50, 2: 0.75, 3: 1.00, 4: 1.20, 5: 1.50, 6: 2.00,
};

// Fisher-Yates shuffle dung PRNG truyen vao
export function createMarketDeck(rng: () => number): MarketCardId[]
export function createChanceDeck(rng: () => number): ChanceCardId[]

// Tinh payout HOSE: tra ve payout = stake * HOSE_OUTCOMES[face]
export function resolveHoseInvestment(stake: number, face: number): number
```

**Hop dong kiem thu (Task 1 Test — TDD RED truoc):**

Tao moi: [`tests/domain/event_card_engine.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/domain/event_card_engine.test.ts)

```typescript
// [TC-04.T1/MSS]
test('createMarketDeck tra ve 16 the, tat ca unique')
test('createChanceDeck tra ve 20 the, tat ca unique')
test('RESORT_CELLS co dung 6 phan tu: [11,13,14,21,24,29]')
test('COASTAL_CELLS co dung 5 phan tu: [11,14,16,18,19]')
test('resolveHoseInvestment(2000, 1) === 1000')   // x0.50
test('resolveHoseInvestment(2000, 6) === 4000')   // x2.00
test('resolveHoseInvestment(1000, 3) === 1000')   // x1.00 hoa von
test('resolveHoseInvestment(1000, 4) === 1200')   // x1.20 loi 20%
```

**DoD Task 1:**
- [ ] File `event_card_engine.ts` tao xong, <= 75 LOC.
- [ ] `npx vitest run tests/domain/event_card_engine.test.ts` — tat ca test PASS.
- [ ] `npx vitest run` — 81 + N tests PASS (N = so test Task 1 moi).

---

## Task 2: Mo Rong CellType & Board Config (<= 14 LOC production)

**Muc tieu:** Them 4 CellType moi vao enum; cap nhat 6 o board config sang dung type.

> **Luu y so dem:** Chi 6 o trong board_config.ts can thay doi (02, 10, 17, 30, 33, 38). O 07/22/36 da la CellType.Chance tu truoc — khong can sua data, nhung nen them test de verify.

**Files:**
- Sua: [`src/domain/board_config.ts#L3-L14`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/board_config.ts#L3-L14) — enum CellType
- Sua: [`src/domain/board_config.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/board_config.ts) — 6 o data

**Toa do chinh xac can thay doi:**

| Dong | Hien tai | Thay thanh |
|------|----------|------------|
| L3–L14 | enum CellType (10 values) | Them `Market`, `Hose`, `TaxOrder`, `Audit` |
| L31 (o 02) | `type: CellType.CommunityChest` | `type: CellType.Market` |
| L39 (o 10) | `type: CellType.Jail` | `type: CellType.Audit` |
| L46 (o 17) | `type: CellType.CommunityChest` | `type: CellType.Market` |
| L59 (o 30) | `type: CellType.GoToJail` | `type: CellType.TaxOrder` |
| L62 (o 33) | `type: CellType.CommunityChest` | `type: CellType.Market` |
| L67 (o 38) | `type: CellType.Tax` | `type: CellType.Hose` |

> **Luu y:** Giu `CommunityChest`, `Jail`, `GoToJail`, `Tax` trong enum — xoa gay loi TypeScript neu tests hay code khac con tham chieu. Chi cap nhat du lieu board.

**Hop dong kiem thu (Task 2 Test):**

Bo sung vao [`tests/domain/board_config.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/domain/board_config.test.ts):

```typescript
// [TC-04.T2/MSS]
test('o 02/17/33 co type Market')
test('o 07/22/36 co type Chance')
test('o 10 co type Audit')
test('o 30 co type TaxOrder')
test('o 38 co type Hose')
```

**DoD Task 2:**
- [x] `src/domain/board_config.ts` sua xong, +14 LOC (enum mo rong + 6 dong data).
- [x] Khong co loi TypeScript khi compile.
- [x] `npx vitest run tests/domain/board_config.test.ts` — tat ca test PASS (ke ca tests cu).
- [x] `npx vitest run` — toan bo PASS.

---

## Task 3: Mo Rong Domain State (room.ts) — PlayerState & GameState (<= 25 LOC production)

**Muc tieu:** Them cac truong moi vao `Player`, `Room` interface; them `HosePhase`; them `MarketModifier` interface; cap nhat `createPlayer`.

**Files:**
- Sua: [`src/domain/room.ts#L8-L55`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts)

**Toa do chinh xac can thay doi:**

| Dong | Noi dung can them |
|------|-------------------|
| L8–L15 (TurnPhase enum) | Them `HosePhase = 'HosePhase'` |
| Truoc L17 (truoc Player) | Them `export interface MarketModifier { type, affectedCells, remainingRounds, multiplier? }` |
| L17–L21 (Player) | Them `skipNextTurn: boolean`, `auditTurnsLeft: number`, `hand: ChanceCardId[]`, `pendingDebts: string[]` |
| L23–L30 (Room) | Them `activeModifiers: MarketModifier[]`, `marketDeck: MarketCardId[]`, `marketDiscard: MarketCardId[]`, `chanceDeck: ChanceCardId[]`, `chanceDiscard: ChanceCardId[]` |
| L42–L44 (createPlayer) | Init: `skipNextTurn: false`, `auditTurnsLeft: 0`, `hand: []`, `pendingDebts: []` |

> **Ly do `pendingDebts: string[]`:** Rang buoc toan cuc (L76) yeu cau CC_OVERDRAFT / CC_FREE_CREDIT ghi nhan vao `player.pendingDebts[]`. Neu khong dinh nghia truong nay o day, `applyChanceCard` (Task 4) se gay loi TypeScript compiler.

**Interface moi can dinh nghia (truoc Player):**

```typescript
import type { MarketCardId, ChanceCardId } from './event_card_engine';

export interface MarketModifier {
  readonly type: MarketCardId;
  readonly affectedCells: readonly number[];
  remainingRounds: number;
  readonly multiplier?: number;
}
```

**Hop dong kiem thu (Task 3 Test):**

Bo sung vao [`tests/domain/room.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/domain/room.test.ts):

```typescript
// [TC-04.T3/MSS]
test('createPlayer khoi tao skipNextTurn=false, auditTurnsLeft=0, hand=[], pendingDebts=[]')
test('TurnPhase bao gom HosePhase')
test('createRoom khoi tao activeModifiers=[], marketDeck/chanceDeck co the duoc nap')
```

**DoD Task 3:**
- [x] `src/domain/room.ts` sua xong, +25 LOC.
- [x] Khong co loi TypeScript khi compile.
- [x] `npx vitest run tests/domain/room.test.ts` — PASS.
- [x] `npx vitest run` — toan bo PASS.

---

## Task 4: Market Modifier System & apply/decay Functions (<= 55 LOC production)

**Muc tieu:** Bo sung 3 ham apply/decay vao `event_card_engine.ts`. Sua `handleLanding()` de doc modifiers va dieu chinh rent. Them logic C2 phu phi va C3 skipNextTurn.

**Files:**
- Sua: [`src/domain/event_card_engine.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/event_card_engine.ts) — them 3 ham (phan 2)
- Sua: [`src/domain/property_manager.ts#L109-L133`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_manager.ts#L109-L133) — `handleLanding()` signature + body

**Signature moi cua `handleLanding`:**

```typescript
export function handleLanding(
  player: Player,
  cellIndex: number,
  registry: PropertyRegistry,
  players: Player[],
  stateMap?: PropertyStateMap,
  diceTotal?: number,
  modifiers?: readonly MarketModifier[],  // them param tuy chon
  rng?: () => number,                     // cho C2 1D6 phu phi
): { result: LandingResult; rentAmount: number; landlordId: string | undefined }
```

**Logic modifier trong handleLanding (sau khi xac dinh owner, truoc khi tru tien):**

```
1. Kiem tra zero-rent: modifiers co MC_COASTAL_STORM VA COASTAL_CELLS.includes(cellIndex)
   --> rentAmount = 0, thoat som (khong tru tien, khong cong chu nha)
2. Kiem tra multiplier: modifiers co MC_PEAK_TOURISM VA RESORT_CELLS.includes(cellIndex)
   --> baseRent = resolveRent(...); rentAmount = baseRent * 2
3. Else: rentAmount = resolveRent(...) binh thuong
4. Sau tru rent chinh: neu cell la Service C2 (SERVICE_CELLS + stateMap.level===2) va rng co
   --> roll = floor(rng()*6)+1; neu chan --> player.balance -= 200; owner.balance += 200
5. Neu cell la Service C3 (SERVICE_CELLS + stateMap.level===3)
   --> player.skipNextTurn = true
```

**Ham can them vao event_card_engine.ts:**

```typescript
// Ap hieu ung vi mo vao gameState.activeModifiers[]
export function applyMarketCard(
  card: MarketCardId,
  activeModifiers: MarketModifier[],
  players: Player[],
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): void

// Ap hieu ung ca nhan; tra { sendToAudit?: playerId }
export function applyChanceCard(
  card: ChanceCardId,
  playerId: string,
  players: Player[],
  activeModifiers: MarketModifier[],
): { sendToAudit?: string }

// Giam remainingRounds; tra mang moi da loc bo modifier = 0
export function decayModifiers(modifiers: MarketModifier[]): MarketModifier[]
```

**Hop dong kiem thu (Task 4 Test):**

Bo sung vao [`tests/domain/event_card_engine.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/domain/event_card_engine.test.ts):

```typescript
// [TC-04.T4/MSS]
test('applyMarketCard(MC_PEAK_TOURISM) them modifier voi affectedCells=RESORT_CELLS, remainingRounds=1')
test('applyMarketCard(MC_COASTAL_STORM) them modifier voi affectedCells=COASTAL_CELLS, remainingRounds=1')
test('decayModifiers giam remainingRounds=1 --> 0 --> loai khoi mang')
test('decayModifiers giu modifier chua het han (remainingRounds=2 --> 1)')
test('handleLanding: MC_COASTAL_STORM active + o 14 --> rent=0')
test('handleLanding: MC_PEAK_TOURISM active + o 11, rent1=420 --> 840')
test('handleLanding: ca hai active + o 11 --> rent=0 (zero-rent thang)')
test('handleLanding: C2 service + 1D6 chan --> tru them 200')
test('handleLanding: C2 service + 1D6 le --> khong tru them')
test('handleLanding: C3 service --> player.skipNextTurn = true')

// [TC-04.T4-UC050/MSS]
test('applyChanceCard(CC_OVERDRAFT, playerId, ...) → player.pendingDebts chứa entry ghi nhận khoản nợ')
test('applyChanceCard(CC_FREE_CREDIT, playerId, ...) → player.pendingDebts chứa entry lãi suất')
// Lưu ý: Chỉ ghi nhận (assert pendingDebts.length > 0), KHÔNG enforce thu hồi (defer Slice 05)
```

**DoD Task 4:**
- [ ] Modifier priority dung: zero-rent > multiplier.
- [ ] `handleLanding` backward-compatible: goi khong co `modifiers` --> hoat dong nhu cu.
- [ ] `npx vitest run` — toan bo PASS.

---

## Task 5: Server Handlers — HOSE, Tram Kiem Toan & Tile Landing (<= 75 LOC production)

**Muc tieu:** Mo rong `room_manager.ts` voi: (1) phan nhanh tile landing theo CellType moi, (2) intent handlers INTENT_INVEST/SKIP/BAIL_OUT, (3) `sendToAudit()`, (4) `handleTurnStart()` kiem tra audit/skip, (5) goi `decayModifiers()` tai `handleEndTurn()`, (6) khoi tao deck trong `createRoom()`.

**Files:**
- Sua: [`src/server/room_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts)

> **CANH BAO:** Kiem tra tong dong sau khi sua. Neu > 400 dong, tach `sendToAudit`, `handleTurnStart`, `handleHoseIntent`, `handleBailOut` sang file `src/server/audit_manager.ts` (<= 80 LOC).

**Toa do can thiep chinh:**

| Dong | Thay doi |
|------|----------|
| L24–L30 (PlayerIntent) | Them `INTENT_INVEST { stake: number }`, `INTENT_SKIP`, `INTENT_BAIL_OUT`, `INTENT_USE_DIPLOMATIC` |
| L49–L55 (createRoom) | Goi `createMarketDeck(rng)`, `createChanceDeck(rng)`; gan vao `room.marketDeck/chanceDeck`; init `activeModifiers=[]` |
| L79–L101 (handleRollDice) | Sau khi tinh `newPos`, phan nhanh: Market -> drawMarket+apply; Chance -> drawChance+apply; Hose -> HosePhase; TaxOrder -> sendToAudit; Audit -> kiem tra visiting; Property -> handleLanding voi modifiers |
| L145–L160 (handlePlayerIntent) | Bo sung cases INVEST, SKIP, BAIL_OUT, USE_DIPLOMATIC |
| L208–L216 (handleEndTurn) | Goi `room.activeModifiers = decayModifiers(room.activeModifiers)` |

**Private methods moi can them:**

```typescript
private sendToAudit(room: Room, playerId: string): void
// player.position = 10; player.auditTurnsLeft = 3; log { event: 'SENT_TO_AUDIT', correlationId, playerId, timestamp }

private handleHoseInvest(room: Room, playerId: string, stake: number): { success: boolean; reason?: string }
// validate: 500 <= stake <= 3000 --> INVALID_STAKE
// validate: player.balance >= stake --> INSUFFICIENT_FUNDS
// roll 1D6 voi this.rng; resolveHoseInvestment(stake, face)
// player.balance = player.balance - stake + payout; phase = PropertyManagement

private handleBailOut(room: Room, playerId: string): { success: boolean; reason?: string }
// validate: player.auditTurnsLeft > 0
// validate: player.balance >= 500 --> INSUFFICIENT_FUNDS
// player.balance -= 500; player.auditTurnsLeft = 0

handleTurnStart(roomCode: string, playerId: string): { canRoll: boolean; reason?: string }
// kiem tra skipNextTurn --> reset false, canRoll=false luat nay (bo luot)
// kiem tra auditTurnsLeft > 0 --> offer BAIL_OUT/do doi; giam auditTurnsLeft neu khong hanh dong
```

**Hop dong kiem thu (Task 5 Test):**

Bo sung vao [`tests/server/room_manager.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/server/room_manager.test.ts):

```typescript
// [TC-04.T5/MSS]
test('handleRollDice dung tai o 38 --> phase = HosePhase')
test('INTENT_INVEST stake=2000, face=6 (seed co dinh) --> balance = 7000')
test('INTENT_INVEST stake=400 --> tu choi INVALID_STAKE')
test('INTENT_INVEST stake=3500 --> tu choi INVALID_STAKE (vuot 3000)')
test('INTENT_INVEST balance=1500, stake=2000 --> tu choi INSUFFICIENT_FUNDS')
test('INTENT_SKIP tai HosePhase --> phase = PropertyManagement')
test('handleRollDice dung o 30 --> sendToAudit --> auditTurnsLeft=3, position=10')
test('INTENT_BAIL_OUT balance=600 --> deduct 500, auditTurnsLeft=0')
test('INTENT_BAIL_OUT balance=400 --> tu choi INSUFFICIENT_FUNDS')
test('handleTurnStart skipNextTurn=true --> reset false, canRoll=false')
test('handleEndTurn goi decayModifiers --> modifier het han bi xoa')

// [TC-04.T5-UC047/MSS]
test('handleRollDice dừng tại ô 10 khi auditTurnsLeft=0 → visiting only, canRoll=true, không bị phong tỏa')
test('handleTurnStart khi auditTurnsLeft=0 → canRoll=true (không phong tỏa)')
```

**DoD Task 5:**
- [ ] FSM phases: WaitingRoll --> [landing] --> HosePhase / ActionPhase / PropertyManagement / Audit.
- [ ] `room_manager.ts` tong dong <= 400. Neu > 400, tach `audit_manager.ts`.
- [ ] `npx vitest run` — toan bo PASS.

---

## Task 6: Acceptance Tests TC-04.1 / TC-04.2 / TC-04.3 (<= 80 LOC test)

**Muc tieu:** Viet 3 Hop Dong Kiem Thu chinh thuc tu spec. Day la tests chung minh Slice 04 DONE.

**Files:**
- Tao moi: [`tests/server/room_manager_s04.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/server/room_manager_s04.test.ts)

**TC-04.1/MSS — MC_FIRE_INSPECTION (Thanh Tra PCCC):**

```
[Setup] marketDeck[0] = MC_FIRE_INSPECTION (seed co dinh)
        B so huu 2 cong trinh C1 + 1 cong trinh C2
        C khong co tai san nao
        A dung tai o 02 (Market)
[Ky vong]
  --> deck.length: 16 --> 15
  --> B.balance -= (2x200 + 1x400) = 800
  --> C.balance khong doi
  --> the trong marketDiscard
  --> FSM: PropertyManagement
```

**TC-04.2/MSS — Modifier Priority (Mua Du Lich + Bao Duyen Hai):**

```
[Kich ban A — Mua Cao Diem Du Lich]
  gameState.activeModifiers = [{ type: MC_PEAK_TOURISM, remainingRounds: 1, affectedCells: RESORT_CELLS }]
  B (balance=10000) dung tai o 11 (Binh Thuan). Chu so huu nang Cap 1. rent1=420.
  --> Phi thu = 420 x 2 = 840
  --> B.balance === 9160
  --> Sau INTENT_END_TURN: modifier.remainingRounds giam ve 0 --> bi xoa khoi activeModifiers[]

[Kich ban B — Thoi Tiet Cuc Doan Duyen Hai]
  gameState.activeModifiers = [{ type: MC_COASTAL_STORM, remainingRounds: 1, affectedCells: COASTAL_CELLS }]
  C (balance=8000) dung tai o 14 (Khanh Hoa). Chu so huu nang Cap 2. rent2=1280.
  --> Phi thu = 0 (o 14 thuoc COASTAL_CELLS)
  --> C.balance === 8000 (khong doi)
  --> Chu o 14 khong nhan tien

[Kich ban C — Xung dot dong thoi ca hai modifier + o 11]
  activeModifiers co ca MC_PEAK_TOURISM va MC_COASTAL_STORM
  --> rent = 0 (zero-rent thang)
```

**TC-04.3/MSS — HOSE Boundary:**

```
[Kich ban A] stake=2000, face=1 (PRNG inject) --> balance = 5000-2000+1000 = 4000
[Kich ban B] stake=2000, face=6 (PRNG inject) --> balance = 5000-2000+4000 = 7000
[Kich ban C] stake=400                        --> INVALID_STAKE; FSM van HosePhase
[Kich ban D] stake=3500                       --> INVALID_STAKE (vuot 3000)
[Kich ban E] stake=2000, balance=1500         --> INSUFFICIENT_FUNDS
```

**TC-04.4/MSS — Rút Phiếu Cơ Hội & Áp Hiệu Ứng Cá Nhân:**

```
[Setup] chanceDeck[0] = CC_STOCK_PROFIT (seed cố định)
        A dừng tại ô 07 (Chance). A.balance = 5000.
[Kỳ vọng]
  → deck.length: 20 → 19
  → A.balance === 7500 (nhận 2500 từ Kho bạc)
  → thẻ trong chanceDiscard[]
  → FSM: PropertyManagement

[Kịch bản B — CC_DIPLOMATIC giữ thẻ]
  chanceDeck[0] = CC_DIPLOMATIC
  → A.hand chứa CC_DIPLOMATIC
  → A.balance không đổi
  → deck.length: 20 → 19
```

**DoD Task 6:**
- [ ] `npx vitest run tests/server/room_manager_s04.test.ts` — PASS.
- [ ] `npx vitest run` — toan bo PASS.
- [ ] Moi test co tag traceability `[TC-04.X/MSS]`.

---

## Task 7: Adversarial Inversion x4 & Danh Dau Verified (<= 20 LOC test)

**Muc tieu:** Chay 4 lan dao nghich de chung minh tests phat hien regression — day la verification, khong phai viet code production.

**Quy trinh (thuc hien tung buoc, khoi phuc sau moi lan):**

1. **Xoa xu ly MC_FIRE_INSPECTION trong `applyMarketCard()`**
   - Chay: `npx vitest run`
   - Ky vong: TC-04.1 FAIL
   - Khoi phuc code

2. **Xoa `RESORT_CELLS.includes(cellIndex)` trong `handleLanding()`**
   - Chay: `npx vitest run`
   - Ky vong: TC-04.2a FAIL (Mua Du Lich khong ap x2)
   - Khoi phuc code

3. **Xoa `COASTAL_CELLS.includes(cellIndex)` trong `handleLanding()`**
   - Chay: `npx vitest run`
   - Ky vong: TC-04.2b FAIL (Bao Duyen Hai khong ap zero-rent)
   - Khoi phuc code

4. **Xoa `HOSE_OUTCOMES[face]` lookup trong `resolveHoseInvestment()`**
   - Chay: `npx vitest run`
   - Ky vong: TC-04.3a va TC-04.3b FAIL
   - Khoi phuc code

**DoD Task 7 (va DoD toan Slice 04):**
- [ ] 4/4 inversions confirmed FAIL (ghi log ket qua tung inversion).
- [ ] Sau khoi phuc: `npx vitest run` --> **toan bo tests PASS**.
- [ ] Tong delta production <= 244 LOC.
- [ ] Khong co loi TypeScript: `npx tsc --noEmit`.
- [ ] Khong co the `TODO` hay magic string trong code production.
- [ ] Cap nhat `docs/epics/[epic]/_epic_ledger.md` — Slice 04 status --> APPROVED.

---

## Ngan Sach LOC Tong Ket

| Task | File | Delta LOC (production) |
|------|------|----------------------|
| Task 1 | `event_card_engine.ts` (MOI — enums/constants/deck/HOSE) | <= 75 |
| Task 2 | `board_config.ts` (enum +4 values, board data 6 o) | <= 14 |
| Task 3 | `room.ts` (TurnPhase +1, interface MarketModifier, Player +3, Room +5, createPlayer) | <= 25 |
| Task 4 | `event_card_engine.ts` (phan 2: apply/decay +3 ham) + `property_manager.ts` (modifier logic +20 dong) | <= 55 |
| Task 5 | `room_manager.ts` (landing branches, intents, sendToAudit, turnStart, decayCall) | <= 75 |
| **Tong** | | **<= 244 LOC** |

> Neu `room_manager.ts` vuot 400 dong: tach `audit_manager.ts` (<= 80 LOC). Tong delta van trong gioi han.

---

## Lenh Kiem Thu Tham Chieu

```bash
# Chay tests Slice 04 moi
cmd /c "cd /d c:\Users\HP\Documents\GitHub\vtcoon && npx vitest run --reporter=verbose tests/domain/event_card_engine.test.ts tests/server/room_manager_s04.test.ts"

# Kiem tra hoi quy day du (bat buoc sau moi Task)
cmd /c "cd /d c:\Users\HP\Documents\GitHub\vtcoon && npx vitest run --reporter=verbose"

# Kiem tra TypeScript
cmd /c "cd /d c:\Users\HP\Documents\GitHub\vtcoon && npx tsc --noEmit"
```

---

## Ngoai Pham Vi (Tuyet Doi Khong Thi Cong Trong Slice 04)

| Hang muc | Defer den |
|----------|-----------|
| CC_OVERDRAFT enforce thu hoi sau 3 vong | Slice 05 (Credit Ledger) |
| CC_FREE_CREDIT enforce lai 400/vong/GO | Slice 05 (Credit Ledger) |
| He thong the chap BDS | Slice 05 |
| Pha san / Insolvency Engine | Slice 05 |
| P2P Trading UI thuong luong | Slice 05+ |
| Giao dien 3D hien thi the bai (R3F) | Tuong lai |

> **Luu y trien khai CC_OVERDRAFT / CC_FREE_CREDIT trong Slice 04:** Chi ghi nhan vao `player.pendingDebts[]` (mang tam thoi). Slice 05 tich hop vao Credit Ledger chinh thuc va enforce tu dong.
