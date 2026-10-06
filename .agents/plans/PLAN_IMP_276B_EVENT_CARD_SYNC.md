# LEAN PLAN SPECIFICATION: IMP-276B
## ĐỒNG BỘ HIỂN THỊ EVENT CARD MODAL, TICKER & VISUAL BADGES CHO THẺ MC_RATE_HIKE

> **Ticket ID:** IMP-276B (Micro-Slice 2 / Lát cắt cuối cùng của Epic Tái cân bằng MC_RATE_HIKE)  
> **Subsystem:** `client-ui`  
> **Target Production Files:**  
> 1. `src/client/ui/modals/event_card_modal.tsx` (Baseline: 407 LOC - ⚠️ Warning - Tech Debt `DEBT-EVENT-CARD-MODAL-407`)  
> 2. `src/client/ui/market_event_ticker.tsx` (Baseline: 274 LOC - Tier 2 Safe <= 500)  
> 3. `src/client/ui/event_card_punchy_summaries.ts` (Baseline: 103 LOC - Tier 2 Safe <= 500)  
> 4. `src/client/ui/modals/event_card_visuals.ts` (Baseline: 304 LOC - Tier 2 Safe <= 500)  
> **Target Test File:** `tests/contracts/imp276b_event_card_sync.test.ts` (Target: ~220 LOC <= 600)  
> **Delta LOC:** ~-2 LOC Net (Subtractive Refactoring, tối đa <= 50 LOC)  
> **Pure Logic Waiver:** `false` (Có thay đổi hiển thị UI Modal, Ticker, Badges $\rightarrow$ Bắt buộc chụp ảnh Dual-Viewport Phase 3.0 & ui-craft-reviewer)  

---

### SECTION 0: CALL-SITE / HOOK / PATTERN INVENTORY

Khảo sát toàn bộ bề mặt tiêu thụ `MC_RATE_HIKE` trong phân hệ UI (`src/client/`):
1. `src/client/ui/modals/event_card_modal.tsx#L114`: Tồn tại cờ hardcode `isDefaultMacroMarket` ghi đè `targetScope` thành `'Toàn bộ thị trường'` một cách cục bộ, tạo ra nợ kỹ thuật Dead Metadata Override.
2. `src/client/ui/market_event_ticker.tsx#L75,L127`: `ACTIVE_MARKET_EFFECT_SUMMARIES` và `ACTIVE_MARKET_COMPACT_FORMULAS` chỉ nêu mỗi lãi vay thế chấp 10%, thiếu hoàn toàn thông tin tăng 20% chi phí xây nhà C1-C3.
3. `src/client/ui/event_card_punchy_summaries.ts#L14`: `PUNCHY_EVENT_SUMMARIES` chỉ nêu `'Thu lãi vay thế chấp 10% tại GO'`, thiếu tác động xây nhà.
4. `src/client/ui/modals/event_card_visuals.ts#L26`: `KNOWN_HERO_STATS` chỉ ghi nhãn `'LÃI SUẤT VAY MỚI'` và giá trị `'10% QUA GO'`, chưa đồng bộ chính sách vĩ mô kép.

---

### SECTION 1: ARCHITECTURAL BLUEPRINT & INVARIANT GUARD

#### 1. Universal 4-Dimensional Stress-Test
1. **State & Lifecycle Invariants**: Metadata từ `event_card_metadata.ts` là Single Source of Truth (SSOT). Việc gỡ bỏ cờ hardcode `isDefaultMacroMarket` trong `event_card_modal.tsx` giúp UI đọc trực tiếp `detail?.targetScope` và `detail?.effectDetail`, loại trừ rủi ro Dead Metadata Override.
2. **Seam Discipline & Anti-TIDD**: Không tạo bất kỳ prop test-only hay backdoor nào trên production code. Mọi kiểm thử render đều thông qua public API của các component và helper.
3. **Physical & Execution Boundaries**:
   - `KNOWN_HERO_STATS`: Giá trị `+20% XÂY • 10% QUA GO` dài 21 ký tự (tương đương `x1.5 THUÊ • VAY 60%` của `MC_URBAN_PLANNING`), bảo đảm không tràn viền trên mobile 360px.
   - `ACTIVE_MARKET_COMPACT_FORMULAS`: Chuỗi `'Xây nhà +20%, Lãi vay 10%'` (24 ký tự) nằm gọn trong chip ticker.
4. **Symmetric Verification**: 4/4 file production sửa đổi đều có hợp đồng kiểm thử tương ứng trong `tests/contracts/imp276b_event_card_sync.test.ts`.

#### 2. Tech Debt Registration
- `DEBT-EVENT-CARD-MODAL-407`: Tệp `src/client/ui/modals/event_card_modal.tsx` hiện có 407 LOC (cảnh báo Tier 2 > 400 LOC). Việc cắt bỏ `isDefaultMacroMarket` là bước dọn dẹp trừu tượng rác (subtractive refactoring) giảm 2 dòng mã. Sẽ tách nhỏ subcomponent trong đợt tái cấu trúc giao diện tương lai.

---

### SECTION 2: IMPLEMENTATION TASKS

#### Task 1: Gỡ bỏ hardcode `isDefaultMacroMarket` trong `event_card_modal.tsx`
* **Target physical file**: `src/client/ui/modals/event_card_modal.tsx`
* **Mô tả**: Gỡ bỏ cờ `isDefaultMacroMarket`, đọc trực tiếp `detail?.targetScope` nhất quán với `rawDenseScope`.

```typescript
<<<<
  const isDefaultMacroMarket = isMarket && (cardId === MarketCardId.MC_RATE_HIKE || cardId === 'MC_RATE_HIKE');
  const rawTargetScope = isMultiEvent
    ? (currentDetail?.targetScope ?? 'Toàn bộ thị trường')
    : (targetScope || (isDefaultMacroMarket ? 'Toàn bộ thị trường' : detail?.targetScope) || (isMarket ? 'Toàn bộ thị trường' : 'Người chơi rút thẻ'));
====
  const rawTargetScope = isMultiEvent
    ? (currentDetail?.targetScope ?? 'Toàn bộ thị trường')
    : (targetScope || detail?.targetScope || (isMarket ? 'Toàn bộ thị trường' : 'Người chơi rút thẻ'));
>>>>
```

#### Task 2: Cập nhật văn bản mô tả và công thức tóm tắt trong `market_event_ticker.tsx`
* **Target physical file**: `src/client/ui/market_event_ticker.tsx`
* **Mô tả**: Bổ sung tăng 20% chi phí xây nhà vào câu tóm tắt và công thức compact ticker.

```typescript
<<<<
  [MarketCardId.MC_RATE_HIKE]:
    'Thu lãi vay thế chấp 10% khi người chơi đi qua ô Khởi Hành (GO).',
====
  [MarketCardId.MC_RATE_HIKE]:
    'Tăng 20% chi phí xây nhà C1-C3 và thu lãi vay thế chấp 10% khi qua GO.',
>>>>
```

```typescript
<<<<
  [MarketCardId.MC_RATE_HIKE]: 'Lãi thế chấp 10% qua GO',
====
  [MarketCardId.MC_RATE_HIKE]: 'Xây nhà +20%, Lãi vay 10%',
>>>>
```

#### Task 3: Cập nhật tóm tắt punchy summary trong `event_card_punchy_summaries.ts`
* **Target physical file**: `src/client/ui/event_card_punchy_summaries.ts`
* **Mô tả**: Cập nhật câu tóm tắt punchy bao gồm cả tăng giá xây nhà và thu lãi vay.

```typescript
<<<<
  [MarketCardId.MC_RATE_HIKE]: 'Thu lãi vay thế chấp 10% tại GO',
====
  [MarketCardId.MC_RATE_HIKE]: 'Tăng 20% xây nhà & thu lãi vay 10% tại GO',
>>>>
```

#### Task 4: Cập nhật Hero Stat Badge trong `event_card_visuals.ts`
* **Target physical file**: `src/client/ui/modals/event_card_visuals.ts`
* **Mô tả**: Cập nhật nhãn và giá trị Hero Stat hiển thị chính sách kép vĩ mô.

```typescript
<<<<
  [MarketCardId.MC_RATE_HIKE]: { label: 'LÃI SUẤT VAY MỚI', value: '10% QUA GO', variant: 'warning' },
====
  [MarketCardId.MC_RATE_HIKE]: { label: 'THẮT CHẶT TIỀN TỆ', value: '+20% XÂY • 10% QUA GO', variant: 'warning' },
>>>>
```

---

### SECTION 3: TEST SPECIFICATIONS

* **Target physical file**: `tests/contracts/imp276b_event_card_sync.test.ts` (New file)

- TC-276B.01 [UC-IMP276B/MSS]: Given cardId là MarketCardId.MC_RATE_HIKE, When render EventCardModal không truyền props targetScope, Then giao diện hiển thị phạm vi 'Toàn bộ thị trường' lấy trực tiếp từ metadata.
- TC-276B.02 [UC-IMP276B/MSS]: Given cardId là MarketCardId.MC_RATE_HIKE, When render EventCardModal, Then Single-Truth description chứa thông tin tăng 20% chi phí xây dựng C1-C3 và tăng lãi suất thế chấp 10%.
- TC-276B.03 [UC-IMP276B/MSS]: Given cardId là MarketCardId.MC_RATE_HIKE, When render EventCardModal, Then badge thời hạn hiển thị '2 vòng chơi'.
- TC-276B.04 [UC-IMP276B/MSS]: Given MarketCardId.MC_RATE_HIKE, When gọi getCardHeroStat, Then trả về nhãn 'THẮT CHẶT TIỀN TỆ' và giá trị '+20% XÂY • 10% QUA GO' với variant 'warning'.
- TC-276B.05 [UC-IMP276B/MSS]: Given MarketCardId.MC_RATE_HIKE, When gọi resolveMarketEffectSummary, Then trả về chuỗi 'Tăng 20% chi phí xây nhà C1-C3 và thu lãi vay thế chấp 10% khi qua GO.'.
- TC-276B.06 [UC-IMP276B/MSS]: Given MarketCardId.MC_RATE_HIKE, When gọi resolveMarketCompactFormula, Then trả về chuỗi 'Xây nhà +20%, Lãi vay 10%'.
- TC-276B.07 [UC-IMP276B/MSS]: Given MarketCardId.MC_RATE_HIKE, When gọi resolvePunchyEventSummary, Then trả về chuỗi 'Tăng 20% xây nhà & thu lãi vay 10% tại GO'.
- TC-276B.08 [UC-IMP276B/MSS]: Given cardId là MarketCardId.MC_RATE_HIKE nhưng có props targetScope = 'Tùy chỉnh', When render EventCardModal, Then ưu tiên hiển thị props targetScope tùy chỉnh.
- TC-276B.09 [UC-IMP276B/A1]: Given multi-event mode với activeModifiers chứa MC_RATE_HIKE, When render EventCardModal ở chế độ multi-event, Then hiển thị đúng targetScope và description của từng sự kiện con.
- TC-276B.10 [UC-IMP276B/MSS]: Given activeModifiers chứa MC_RATE_HIKE, When render MarketEventTicker, Then thanh ticker hiển thị item chứa công thức 'Xây nhà +20%, Lãi vay 10%'.

---

### SECTION 4: PHYSICAL EVIDENCE & ACCEPTANCE CRITERIA

1. **Station 1**: 10 atomic tests, Adversarial Inversion chứng minh RED hành vi. Xuất `.agents/evidence/station1_IMP-276B.json`.
2. **Station 2**: Thực thi 4 task, toàn bộ test GREEN. Xuất `.agents/evidence/IMP-276B_snapshot.json`.
3. **Station 2.5**: `npm run prefilter` sạch 7 chốt chặn.
4. **Station 3**:
   - Phase 3.0: Chụp ảnh Dual-Viewport Desktop (1280x800) & Mobile (360x740) vào `.agents/tmp/`.
   - Phase 3.1: `spec-reviewer` phê duyệt `APPROVED`.
   - Phase 3.2: Concurrent dispatch `code-reviewer` + `ui-craft-reviewer` phê duyệt `APPROVED` & `SHIP`.
5. **Station 4**: `chaos-sentinel` tiêu diệt 100% mutants mục tiêu (floor >= 8 mutants). Xuất `.agents/evidence/chaos_sentinel_IMP-276B.json`.
6. **Sau Station 4**: Soạn thảo Báo cáo Nghiệm thu `IMP-276B` và Báo cáo Tổng kết Hợp nhất Epic (`docs/reports/improvements/IMP-275_276_rate_hike_epic_consolidation_report.md`).
