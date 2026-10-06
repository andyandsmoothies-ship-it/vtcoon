# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE (LEAN PLAN SPECIFICATION) — REVISION 3
# TICKET: IMP-275 — Cải Tiến Thẻ Thị Trường MC_RATE_HIKE (Tăng 20% Chi Phí Xây Nhà & Lãi Vay 10% Trong 2 Vòng)

> **Mã Nhiệm Vụ:** IMP-275 (Micro-Slice thuộc Lộ trình Tái cân bằng Thẻ Thị Trường)  
> **Phân hệ mục tiêu:** `domain-core`  
> **Phân loại rủi ro:** Tier 2 Micro-Slice (Lean Plan Specification, Targeted <= 220 lines, Delta <= 50 LOC, Max 2-3 files in `src/**`)  
> **Chỉ tiêu kiểm thử:** Scaled Floor >= 11 atomic tests, >= 8 mutants killed, Pure Logic Waiver = `true` (Không thay đổi layout DOM)

---

### BẢNG ĐÁP ỨNG CHỈ THỊ THẨM ĐỊNH (REVISION DIRECTIVE COVERAGE — REVISION 3)

| Directive Code | Nguồn Chỉ Thị | Mô Tả Yêu Cầu / Rủi Ro | Vị Trí Xử Lý Trong Plan Revision 3 |
| :--- | :--- | :--- | :--- |
| **P1** | Adversarial Review (Ghost Affordance) | `title_deed_affordance.ts#L163` tính giá từ `deed.upgradeCosts` tĩnh, làm nút nâng cấp sáng ảo và mời gọi bấm dù Server sẽ reject `INSUFFICIENT_FUNDS`. | Section 0.3 mục 6: Bổ sung `title_deed_affordance.ts` vào danh sách hoãn của `[DEFERRED TO TICKET-IMP-276: Đồng Bộ Affordance Nút Nâng Cấp, Ticker & Visuals Cho MC_RATE_HIKE]`. |
| **P2** | Adversarial Review (Semantic Contradiction) | Sửa kỳ vọng test living thành '2 vòng chơi' mâu thuẫn với tiêu đề test "thẻ mặc định 1 vòng chơi". | Task 4 & Task 5: Đổi fixture `cardId` sang `'MC_DEFAULT_MARKET'`, bảo toàn 100% mục tiêu test thẻ mặc định 1 vòng mà không bóp méo assertion. |
| **P3** | Adversarial Review (Dead Metadata Trap) | `event_card_modal.tsx#L114` hardcode `isDefaultMacroMarket` ép targetScope thành 'Toàn bộ thị trường', biến sửa đổi metadata thành code chết. | Section 2 (Task 3): Giữ nguyên `targetScope: 'Toàn bộ thị trường'`, hoãn việc gỡ bỏ hardcode `isDefaultMacroMarket` sang `[DEFERRED TO TICKET-IMP-276: Gỡ bỏ hardcode isDefaultMacroMarket trong event_card_modal.tsx]`. |
| **P4** | Adversarial Review (Policy Paradox Resolution) | Nghịch lý giữa Stimulus (ưu tiên lãi suất 0%) và Rate Hike (nhân dồn giá xây 0.96x). | Section 1.2 (Bất biến 3 & 4) và Section 3 (TC-275.10 & TC-275.11): Khóa bất biến 2 tầng và test đối kháng chính sách minh bạch. |
| **P5** | `plan-griller` (Deed Cell Index Fidelity) | `calculateUpgradeCost` tra cứu `PROPERTY_DEEDS.get(cellIndex)`. Test spec cần dùng ô đất vật lý thực tế. | Section 3 (TC-275.02..06, 08a, 10): Chuẩn hóa ô 19 C0 (1.000 -> 1.200), ô 39 C1 (3.000 -> 3.600), ô 39 C2 (4.000 -> 4.800). |

---

## 0. KHẢO SÁT BỀ MẶT MÃ NGUỒN & ĐIỂM BẮT ĐẦU (SURFACE INVENTORY & LOC BASELINE)

### 0.1 Danh Sách Tệp Mục Tiêu & Dòng Mã Thực Tế Trên Đĩa
* **Target physical file**: `src/domain/market_card_handlers.ts` (276 lines, Tier 1 limit: 400 lines) — **Safe**.
* **Target physical file**: `src/domain/property_upgrade.ts` (208 lines, Tier 1 limit: 400 lines) — **Safe**.
* **Target physical file**: `src/domain/event_card_metadata.ts` (322 lines, Tier 1 limit: 400 lines, warning > 300) — **⚠️ Warning (322 > 300)**.
* **Target physical file**: `tests/contracts/imp275_rate_hike_upgrade_cost.test.ts` (New file to be created in Station 1/2) — **Safe**.
* **Target physical file**: `tests/client/imp134_event_card_hero_stat_visual_overhaul.test.ts` (396 lines, Living test limit: 600 lines) — **Safe**.
* **Target physical file**: `tests/client/mobile_compact_hud_and_modals.test.ts` (477 lines, Living test limit: 600 lines) — **Safe**.

### 0.2 Bảng Thống Kê Delta LOC Dự Kiến
| File | Current LOC | Expected LOC | Delta LOC | Status |
| :--- | :---: | :---: | :---: | :---: |
| `src/domain/market_card_handlers.ts` | 276 | 276 | 0 (Modify 1 line) | Safe |
| `src/domain/property_upgrade.ts` | 208 | 211 | +3 lines | Safe |
| `src/domain/event_card_metadata.ts` | 322 | 322 | 0 (Modify 2 lines) | ⚠️ Warning (Tech Debt Registered) |
| `tests/contracts/imp275_rate_hike_upgrade_cost.test.ts` | 0 | ~220 | +220 | Safe |
| `tests/client/imp134_event_card_hero_stat_visual_overhaul.test.ts` | 396 | 396 | 0 (Modify 1 line) | Safe |
| `tests/client/mobile_compact_hud_and_modals.test.ts` | 477 | 477 | 0 (Modify 1 line) | Safe |
| **Tổng Delta Production (`src/**`)** | — | — | **+3 net LOC** (<= 50 LOC) | **Pass Micro-Slice** |

### 0.3 Kiểm Kê Toàn Bộ Bề Mặt Điểm Gọi & Phân Định Phạm Vi (Scope Conservation Mandate)
1. [`src/domain/market_card_handlers.ts#L235`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/market_card_handlers.ts#L235) — **MODIFY (Target 1)**: Tăng `remainingRounds: 2`, dọn dẹp `multiplier: 0.8` rác.
2. [`src/domain/property_upgrade.ts#L88-L95`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_upgrade.ts#L88-L95) — **MODIFY (Target 2)**: Bổ sung nhân 1.2x chi phí xây dựng khi có `MC_RATE_HIKE`.
3. [`src/domain/event_card_metadata.ts#L204-L210`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/event_card_metadata.ts#L204-L210) — **MODIFY (Target 3)**: Cập nhật metadata `description`, `effectDetail` và thời lượng `duration: '2 vòng chơi'`. Giữ nguyên `targetScope: 'Toàn bộ thị trường'`.
4. [`src/server/mortgage_manager.ts#L30-L34`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/mortgage_manager.ts#L30-L34) — **KEEP**: Logic thu lãi 10% khi vượt GO tự động kéo dài theo `remainingRounds > 0`.
5. [`tests/client/imp134_event_card_hero_stat_visual_overhaul.test.ts#L304`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp134_event_card_hero_stat_visual_overhaul.test.ts#L304) & [`tests/client/mobile_compact_hud_and_modals.test.ts#L453`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/mobile_compact_hud_and_modals.test.ts#L453) — **MODIFY (Target 5 & 6)**: Tách fixture kiểm thử thẻ thời lượng mặc định 1 vòng sang `'MC_DEFAULT_MARKET'`, bảo tồn 100% ngữ nghĩa của bộ test.
6. **Các tệp UI bị ảnh hưởng (Phân hệ `client-ui`)**:
   - `src/client/ui/modals/title_deed_affordance.ts#L163` (Tích hợp `calculateUpgradeCost` vào `effectiveUpgradeCost`)
   - `src/client/ui/modals/event_card_modal.tsx#L114` (Gỡ bỏ hardcode `isDefaultMacroMarket`)
   - `src/client/ui/market_event_ticker.tsx#L75,L127` (Ticker text)
   - `src/client/ui/event_card_punchy_summaries.ts#L14` (Punchy summary)
   - `src/client/ui/modals/event_card_visuals.ts#L26` (Hero stat)
   - *Quy chuẩn phân lập*: Toàn bộ 5 tệp UI trên được **hoãn tường minh sang ticket kế tiếp**:  
     👉 **`[DEFERRED TO TICKET-IMP-276: Đồng Bộ Affordance Nút Nâng Cấp, Ticker & Visuals Cho MC_RATE_HIKE]`**.

### 0.4 Đăng Ký Nợ Kỹ Thuật (Tech Debt Registration)
* **Tech Debt Item `DEBT-METADATA-LOC-322`**: Tệp `src/domain/event_card_metadata.ts` hiện có 322 physical LOC (> 300 LOC Warning threshold của Tier 1). Delta của IMP-275 là 0 LOC (chỉ thay thế text). Kế hoạch tương lai sẽ trích xuất metadata thành các file con nếu tệp vượt 360 LOC.

---

## 1. BẢN THIẾT KẾ KIẾN TRÚC & BẤT BIẾN NGHIỆP VỤ (ARCHITECTURAL INVARIANTS)

### 1.1 Mục Tiêu & Cơ Chế Nghiệp Vụ
* **Hiện trạng**: Thẻ `MC_RATE_HIKE` chỉ thu lãi thế chấp 10% khi vượt GO trong 1 vòng duy nhất (`remainingRounds: 1`). Không có người thế chấp hoặc không ai vượt GO $\rightarrow$ Thẻ bị tê liệt 95% thời gian.
* **Cải tiến**:
  1. Kéo dài thời gian hiệu lực từ 1 vòng lên **2 vòng chơi** (`remainingRounds: 2`).
  2. Bổ sung cơ chế **Tăng 20% chi phí xây dựng công trình C1, C2, C3** (`cost = Math.floor(cost * 1.2)`) trong suốt 2 vòng tại `src/domain/property_upgrade.ts`.
  3. Duy trì trọn vẹn đặc quyền thu lãi thế chấp 10% khi người chơi vượt ô Khởi Hành (GO) trong suốt 2 vòng tại `src/server/mortgage_manager.ts`.

### 1.2 Bất Biến Miền (Domain Invariants)
* **Bất biến 1 (Building Cost Scaling)**: Mọi thao tác nâng cấp công trình (C0 lên C1, C1 lên C2, C2 lên C3) qua `calculateUpgradeCost` đều nhân chính xác `1.2x` chi phí niêm yết làm tròn `Math.floor`. Ô đất chưa mua hoặc đã đạt Cấp 3 tối đa trả về 0.
* **Bất biến 2 (Balance Deduction Parity)**: Hàm `upgradeProperty` tự động kiểm tra số dư và trừ chính xác số tiền sau khi đã nhân 1.2x. Nếu người chơi đủ tiền cho giá gốc nhưng thiếu tiền cho giá 1.2x $\rightarrow$ Từ chối với lý do `INSUFFICIENT_FUNDS`.
* **Bất biến 3 (Opposing Policy Resolution — Mortgage Layer)**: Khi `MC_CREDIT_STIMULUS` và `MC_RATE_HIKE` cùng kích hoạt, chính sách Kích Cầu chiếm ưu tiên tuyệt đối tại tầng lãi suất thế chấp (`getMortgageInterestRate` trả về 0%).
* **Bất biến 4 (Opposing Policy Resolution — Building Cost Layer)**: Tại tầng chi phí xây dựng, hai chính sách nhân dồn tuần tự: `Math.floor(Math.floor(cost * 0.8) * 1.2)` (xấp xỉ 0.96x chi phí gốc).

---

## 2. NHIỆM VỤ THỰC THI CHI TIẾT (EXACT IMPLEMENTATION TASKS)

### Task 1: Cập Nhật Modifier Payload Trong `market_card_handlers.ts`
* **Target physical file**: `src/domain/market_card_handlers.ts`
* **Mô tả**: Tăng `remainingRounds: 2` và loại bỏ `multiplier: 0.8` thừa cho `MC_RATE_HIKE`.

```typescript
<<<<
  [MarketCardId.MC_RATE_HIKE]:       (mods) => mods.push({ type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 1, multiplier: 0.8 }),
====
  [MarketCardId.MC_RATE_HIKE]:       (mods) => mods.push({ type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 2 }),
>>>>
```

### Task 2: Bổ Sung Tăng 20% Chi Phí Xây Dựng Trong `property_upgrade.ts`
* **Target physical file**: `src/domain/property_upgrade.ts`
* **Mô tả**: Thêm kiểm tra `MC_RATE_HIKE` trong `calculateUpgradeCost`.

```typescript
<<<<
  if (modifiers?.some((m) => m.type === MarketCardId.MC_CREDIT_STIMULUS && m.remainingRounds > 0)) {
    cost = Math.floor(cost * 0.8);
  }
====
  if (modifiers?.some((m) => m.type === MarketCardId.MC_CREDIT_STIMULUS && m.remainingRounds > 0)) {
    cost = Math.floor(cost * 0.8);
  }
  if (modifiers?.some((m) => m.type === MarketCardId.MC_RATE_HIKE && m.remainingRounds > 0)) {
    cost = Math.floor(cost * 1.2);
  }
>>>>
```

### Task 3: Cập Nhật Metadata & Mô Tả Trong `event_card_metadata.ts`
* **Target physical file**: `src/domain/event_card_metadata.ts`
* **Mô tả**: Cập nhật `description`, `effectDetail`, và `duration: '2 vòng chơi'`. Giữ nguyên `targetScope: 'Toàn bộ thị trường'`.

```typescript
<<<<
  [MarketCardId.MC_RATE_HIKE]: {
    description: 'Ngân hàng thắt chặt tiền tệ kiềm chế lạm phát, tăng lãi suất thế chấp khi qua ô Khởi Hành.',
    targetScope: 'Tất cả người chơi đang có khoản vay thế chấp',
    effectDetail: 'Tăng lãi suất vay thế chấp từ 5% lên 10% giá trị vay khi di chuyển qua ô Khởi Hành (GO)',
    duration: '1 vòng chơi',
    destination: 'Nộp vào Kho Bạc Nhà Nước',
  },
====
  [MarketCardId.MC_RATE_HIKE]: {
    description: 'Ngân hàng thắt chặt tiền tệ kiềm chế lạm phát, tăng 20% chi phí xây nhà và tăng lãi suất thế chấp khi qua ô Khởi Hành.',
    targetScope: 'Tất cả người chơi đang có khoản vay thế chấp',
    effectDetail: 'Tăng 20% chi phí xây dựng công trình C1-C3 và tăng lãi suất vay thế chấp lên 10% khi vượt GO trong 2 vòng',
    duration: '2 vòng chơi',
    destination: 'Nộp vào Kho Bạc Nhà Nước',
  },
>>>>
```

### Task 4 (Test Fixture Decoupling): Phân Lập Fixture Thẻ Mặc Định Trong `imp134_event_card_hero_stat_visual_overhaul.test.ts`
* **Target physical file**: `tests/client/imp134_event_card_hero_stat_visual_overhaul.test.ts`
* **Mô tả**: Đổi fixture `cardId: MarketCardId.MC_RATE_HIKE` thành `'MC_DEFAULT_MARKET'` để bài test kiểm tra fallback 1 vòng chơi cho thẻ mặc định bảo toàn tính trung thực ngữ nghĩa.

```typescript
<<<<
    it('[TC-IMP134.22/MSS][UC-IMP134][Facet-1/Boundary] event-impact-summary bảo tồn nguyên vẹn chuỗi Toàn bộ thị trường và 1 vòng chơi cho thẻ thị trường mặc định', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_RATE_HIKE,
          description: 'Ngân Hàng Nhà Nước tăng lãi suất.',
        })
      );
====
    it('[TC-IMP134.22/MSS][UC-IMP134][Facet-1/Boundary] event-impact-summary bảo tồn nguyên vẹn chuỗi Toàn bộ thị trường và 1 vòng chơi cho thẻ thị trường mặc định', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: 'MC_DEFAULT_MARKET',
          description: 'Thị trường biến động điều chỉnh.',
        })
      );
>>>>
```

### Task 5 (Test Fixture Decoupling): Phân Lập Fixture Thẻ Mặc Định Trong `mobile_compact_hud_and_modals.test.ts`
* **Target physical file**: `tests/client/mobile_compact_hud_and_modals.test.ts`
* **Mô tả**: Đổi fixture `cardId: 'MC_RATE_HIKE'` thành `'MC_DEFAULT_MARKET'` để bài test kiểm tra fallback 1 vòng chơi cho thẻ mặc định bảo toàn tính trung thực ngữ nghĩa.

```typescript
<<<<
    it('[TC-MCH01.23/MSS][UC-MCH-03] EventCardModal 1-second quick impact summary displays concise scope and duration badges (Chốt 3.2)', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: 'MC_RATE_HIKE',
          description: 'Ngân hàng Trung Ương tăng lãi suất điều hành thêm 5%.',
        })
      );
====
    it('[TC-MCH01.23/MSS][UC-MCH-03] EventCardModal 1-second quick impact summary displays concise scope and duration badges (Chốt 3.2)', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: 'MC_DEFAULT_MARKET',
          description: 'Thị trường biến động điều chỉnh.',
        })
      );
>>>>
```

---

## 3. ĐẶC TẢ HỢP ĐỒNG KIỂM THỬ TRẠM 1 (STATION 1 CONTRACT TEST SPECIFICATIONS)

* **Target physical file**: `tests/contracts/imp275_rate_hike_upgrade_cost.test.ts` (New file)

- TC-275.01 [UC-IMP275/MSS]: Given mảng mods rỗng, When gọi executeMarketCard(MC_RATE_HIKE, mods), Then mods chứa 1 phần tử với remainingRounds bằng 2 và affectedCells là mảng rỗng.
- TC-275.02 [UC-IMP275/MSS]: Given ô 19 cấp 0 có base cost 1000 và có modifier MC_RATE_HIKE, When gọi calculateUpgradeCost(19, 0, mods), Then chi phí xây dựng trả về 1200 (floor của 1000 nhân 1.2).
- TC-275.03 [UC-IMP275/MSS]: Given ô 39 cấp 1 có base cost 3000 và có modifier MC_RATE_HIKE, When gọi calculateUpgradeCost(39, 1, mods), Then chi phí xây dựng trả về 3600 (floor của 3000 nhân 1.2).
- TC-275.04 [UC-IMP275/MSS]: Given ô 39 cấp 2 có base cost 4000 và có modifier MC_RATE_HIKE, When gọi calculateUpgradeCost(39, 2, mods), Then chi phí xây dựng trả về 4800 (floor của 4000 nhân 1.2).
- TC-275.05 [UC-IMP275/MSS]: Given người chơi có balance 1100 (đủ cho base cost 1000 tại ô 19 nhưng thiếu 1200 khi có MC_RATE_HIKE), When gọi upgradeProperty nâng cấp ô 19, Then kết quả trả về thất bại với reason INSUFFICIENT_FUNDS.
- TC-275.06 [UC-IMP275/MSS]: Given người chơi có balance 2000 và có modifier MC_RATE_HIKE, When gọi upgradeProperty nâng cấp thành công ô 19 cấp 0, Then balance của người chơi bị trừ đúng 1200 còn lại 800.
- TC-275.07 [UC-IMP275/MSS]: Given Room có activeModifier MC_RATE_HIKE với remainingRounds 2, When gọi getMortgageInterestRate(room), Then tỷ lệ lãi vay thế chấp trả về 0.10 (10%).
- TC-275.08a [UC-IMP275/A1]: Given modifier MC_RATE_HIKE đã hết hạn remainingRounds bằng 0, When gọi calculateUpgradeCost(19, 0, mods), Then chi phí xây dựng hoàn nguyên về 1000 (1.0x).
- TC-275.08b [UC-IMP275/A1]: Given modifier MC_RATE_HIKE đã hết hạn remainingRounds bằng 0, When gọi getMortgageInterestRate(room), Then tỷ lệ lãi vay hoàn nguyên về mặc định 0.05 (5%).
- TC-275.09 [UC-IMP275/MSS]: Given thẻ MC_RATE_HIKE, When gọi getMarketCardInfo(MarketCardId.MC_RATE_HIKE), Then duration trả về '2 vòng chơi', effectDetail chứa '20% chi phí xây dựng' và '10% khi vượt GO'.
- TC-275.10 [UC-IMP275/MSS]: Given ô 19 cấp 0 có base cost 1000 chịu đồng thời MC_RATE_HIKE và MC_CREDIT_STIMULUS, When gọi calculateUpgradeCost(19, 0, mods) tính toán chi phí xếp chồng, Then chi phí trả về chính xác 960 (floor của 1000 * 0.8 = 800, nhân tiếp 1.2 = 960).
- TC-275.11 [UC-IMP275/MSS]: Given Room có đồng thời activeModifier MC_CREDIT_STIMULUS và MC_RATE_HIKE, When gọi getMortgageInterestRate(room), Then tỷ lệ lãi vay thế chấp trả về 0% do gói Kích Cầu chiếm ưu tiên tuyệt đối.

---

## 4. BẬT ĐÈN XANH VẬN HÀNH & ĐỘ NHẠY ĐỘT BIẾN (CHAOS SENTINEL GATE)

* **Phạm vi Mutation Sensitivity**: Tối thiểu 8 mutants trong `property_upgrade.ts`, `market_card_handlers.ts` và `event_card_metadata.ts`.
* **Pure Logic Waiver**: `true` (Không thay đổi visual DOM trong ticket này, toàn bộ việc đồng bộ nhãn UI Ticker, Visuals và Affordance Nút Nâng Cấp được hoãn sang TICKET-IMP-276).
* **Rollback Plan**: Revert thay đổi trong `market_card_handlers.ts`, `property_upgrade.ts` và `event_card_metadata.ts`.
