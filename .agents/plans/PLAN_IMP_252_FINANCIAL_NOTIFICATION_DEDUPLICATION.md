# [PLAN] IMP-252: Khử Trùng Lặp Thông Báo Tài Chính Qua Nhóm Giao Dịch & Bộ Lọc Góc Nhìn Chủ Thể (Financial Notification De-duplication via Transaction Grouping & Local Player Perspective) - Revision 4.2

> **Ticket ID**: IMP-252  
> **Type**: Improvement / Architecture Refactor & Financial UX  
> **SSOT Reference**: `docs/domain/design.md`, `docs/domain/gotchas.md` (Pillar 2, Invariant #18, #40)  
> **Status**: REVISION 4.2 (Fully Hardened: Stage A & Stage B Adversarial Directives Reconciled)

---

## 0. BẢNG ĐỐI ỨNG 1:1 KHẮC PHỤC TOÀN BỘ PHẢN BIỆN & CHỈ THỊ GRILLER (CRITIQUE & GRILLER RECONCILIATION TABLE)

### 0.1. Khắc Phục Phản Biện Cốt Tử Từ Người Dùng
| Mã Phản Biện | Nội Dung Phản Biện Từ Người Dùng | Giải Pháp Khắc Phục Cơ Học Triệt Để Trong Rev 4.2 |
| :--- | :--- | :--- |
| **CRIT-01** | **Thẻ ma (Zombie Badge) xuất hiện khi bấm ✕ hoặc hết hạn**: Lọc ở UI để lại thẻ đối tác trong store, xóa thẻ này thì thẻ kia nhảy ra. | **Bổ sung `groupId` vào Store & Dispatcher**: Cả 2 thẻ đối ứng mang chung một `groupId`. Trong `game_store.ts`, hàm `removeFloatingText(id)` xóa sạch toàn bộ các thẻ có chung `groupId`. Bấm ✕ hoặc timeout một thẻ sẽ hủy luôn thẻ còn lại. 0% nguy cơ Zombie Badge. |
| **CRIT-02** | **Suy đoán heuristic lỏng lẻo & `ma_buyout` thiếu `targetPlayerId`**: Heuristic ghép cặp không an toàn, so sánh lỏng lẻo `playerId !== playerId`. | **Định danh bằng `groupId` rõ ràng ngay tại Dispatcher**: Dispatcher gán `groupId = 'rent_' + act.id` (hoặc `ma_`, `trade_`, `diplo_`). Đồng thời bổ sung `targetPlayerId` cho `ma_buyout`. Xóa bỏ hoàn toàn việc đoán cặp theo thuộc tính ở UI. |
| **CRIT-03** | **Bẫy FM-3: Thẻ thường mất hẳn trên mobile do chênh lệch thời lượng**: `EVENT_BANNER_DURATION_MS = 4500ms`, `TRANSACTION_POPUP_DURATION_MS = 3600ms`. Ẩn CSS thẻ thường khi có banner khiến thẻ thường hết hạn trước và mất vĩnh viễn. | **Bảo toàn hiển thị thẻ thường mới nhất**: Sửa điều kiện mobile thành `displayItems.length > 1 && idx < displayItems.length - 1` áp dụng `hidden md:flex`. Khi có banner, thẻ tài chính mới nhất vẫn hiển thị phía dưới banner trên mobile, người chơi không bao giờ bị mất thông tin biến động tiền tệ. |
| **CRIT-04** | **Vi phạm Anti-TIDD (Rule 8) & Phá vỡ cấu trúc module**: Export `isReciprocalPair` chỉ để test, nhồi logic 70 dòng vào component UI 298 LOC. | **Tách module thuần túy mới `notification_deduplicator.ts`**: Toàn bộ thuật toán khử trùng lặp theo `groupId` nằm trong module mới (~40 LOC). Component UI chỉ import 1 hàm thuần túy `deduplicateFloatingTexts`. Không export hàm nội bộ phục vụ test. |
| **CRIT-05** | **Test không đạt chuẩn**: `TC-252.15` là static-checklist test; `TC-252.12` kiểm tra "< 80px" bằng SSR; `TC-252.06` không đạt RED (test code có sẵn). | **Thay thế bằng 15 Atomic Contract Tests thực chất**: Kiểm tra hành vi đồng hủy theo `groupId`, lọc góc nhìn chủ thể, kích hoạt Adversarial Inversion thực chất, xóa bỏ toàn bộ static checklist tests. |
| **CRIT-06** | **Rào cản LOC của TC-191.16 & TC-194.18**: `badgeDispatcherLoc <= 250`, `floatingNumbersLoc <= 390`, `narrativeLoc <= 280`. | **Subtractive Refactoring & Giữ nguyên `transaction_narrative.ts`**: Giữ nguyên `transaction_narrative.ts` (Delta = 0); rút gọn cú pháp trong `activity_badge_dispatcher.ts` đưa LOC xuống <= 245 (< 250); module mới độc lập không vi phạm bất kỳ bài test giới hạn LOC cũ nào. |
| **CRIT-07** | **Bất nhất trạng thái `bankrupt`**: `MilestoneBanner` vẽ `bankrupt` nhưng `latestMilestone` bỏ quên `bankrupt`, làm nó chui vào `regularTexts`. | **Chuẩn hóa `bankrupt` vào `latestMilestone`**: Bổ sung `t.actionType === 'bankrupt'` vào `latestMilestone` và loại khỏi `regularTexts` trong `floating_numbers.tsx`, đồng thời cập nhật `isMilestone` trong `game_store.ts` để gán duration 4500ms. |

### 0.2. Khắc Phục 3 Chỉ Thị Của Plan Griller (Stage A)
| Mã Chỉ Thị | Nội Dung Yêu Cầu Từ Plan Griller | Giải Pháp Khắc Phục Cơ Học Triệt Để |
| :--- | :--- | :--- |
| **DIR-G1** | **[Wishful LOC & Test Regression]**: Task 3 snippet chỉ thêm dòng mà không trừ dòng trong `activity_badge_dispatcher.ts`, có nguy cơ phá vỡ trần `<= 250` của `TC-191.16`. | **Tích hợp Subtractive Refactoring trực tiếp vào Task 3**: Gộp dòng khai báo biến và thu gọn cú pháp trong `handleRentBadge`, `handleTradeBadge`, `handleMaBuyoutBadge` và `handleCardPenaltyBadge`, cắt giảm thực chất 14 dòng, đưa tổng LOC từ 250 xuống **236 LOC** (vùng an toàn tuyệt đối). |
| **DIR-G2** | **[Warning Range Labeling Gap]**: `game_store_types.ts` (394) và `game_store.ts` (391) thuộc Tier 1 và vượt 300 LOC. Gắn nhãn "Safe" vi phạm quy định cấm của `GEMINI.md`. | **Cập nhật nhãn thành `⚠️ Warning (> 300)`** và đăng ký Tech Debt item `DEBT-STORE-PARTITION` với lộ trình bóc tách `floating_texts_slice.ts` khi chạm 400 LOC. |
| **DIR-G3** | **[Store Ceiling Proximity]**: Snippet Task 2 cũ đưa `game_store.ts` lên 399 LOC (cách trần 400 đúng 1 dòng). | **Tinh gọn Task 2**: Dùng regex một dòng cho `isMilestone` và rút gọn `removeFloatingText`, cắt giảm thực chất 14 dòng, đưa `game_store.ts` từ 391 xuống **377 LOC** (tạo vùng đệm an toàn 23 dòng dưới trần). |

### 0.3. Khắc Phục 3 Chỉ Thị Của Adversarial Challenger (Stage B)
| Mã Chỉ Thị | Vị Trí Mục Tiêu | Nguy Cơ Tiềm Ẩn (Stage B Challenge) | Giải Pháp Khắc Phục Cơ Học Trong Rev 4.2 |
| :--- | :--- | :--- | :--- |
| **DIR-ADV-01** | `src/client/ui/floating_numbers.tsx` | Xóa `latestMilestone &&` làm gãy bài test sống `TC-234.11` và `PROBE-2.5` (`imp234_chaos_sentinel_probes.test.ts`). | **Giữ nguyên 100% biểu thức hiện hành** trong `floating_numbers.tsx`: `const isHiddenOnMobile = Boolean(latestMilestone && displayItems.length > 1 && idx < displayItems.length - 1);`. Không thay thế khối JSX này. Cập nhật `TC-IMP252.10` phù hợp với hợp đồng living. |
| **DIR-ADV-02** | `src/client/network/activity_badge_dispatcher.ts` | `groupId` ngoại giao thiếu timestamp gây xóa nhầm thẻ sự kiện mới khi turbo burst liên tiếp trên cùng 1 ô. | **Bổ sung `Date.now()` vào `groupId` ngoại giao**: `groupId = 'diplo_' + ev.cellIndex + '_' + ev.playerId + '_' + ev.landlordId + '_' + Date.now();`. Triệt tiêu hoàn toàn nguy cơ đụng độ ID giữa các lượt. |
| **DIR-ADV-03** | `src/client/ui/floating_numbers.tsx` | Hoán đổi vô điều kiện khi `myIdx === 0` làm đảo lộn thứ tự thời gian tự nhiên (thẻ mới bị đẩy vào vị trí ẩn) khi cả 2 thẻ đều của Bạn. | **Thêm điều kiện `displayItems[1]?.playerId !== myPlayerId`**: Chỉ hoán đổi ưu tiên khi thẻ ở vị trí 1 là của đối thủ. Giữ nguyên thứ tự thời gian nếu cả 2 thẻ đều thuộc về người chơi địa phương. |

---

## 1. MỤC TIÊU & PHẠM VI (PILLAR 0)

### Bản chất kỹ thuật của vấn đề
Khi một giao dịch P2P đối ứng phát sinh (`rent_pay`/`rent_receive`, `trade`, `ma_buyout`, `diplomatic`):
1. `activity_badge_dispatcher.ts` phát sóng 2 bản tin `FloatingTextItem` cho cả 2 bên (Ví dụ: Trả thuê -1.000 và Thu thuê +1.000).
2. Hai bản tin này lưu vào `floatingTexts` với 2 ID ngẫu nhiên độc lập và 2 bộ đếm `setTimeout` riêng biệt.
3. Nếu chỉ lọc ở tầng render của UI, khi một thẻ bị đóng hoặc hết hạn, thẻ đối tác còn lại sẽ bị trơ ra (mất cặp) và đột ngột hồi sinh thành **thẻ ma (Zombie Badge)** trước mắt người chơi.
4. Trên mobile, hai thẻ xếp chồng che phủ tới 40% sa bàn 3D.

### Giải pháp kỹ thuật chuẩn mực (Clean Architectural Solution)
1. **Khóa Định Danh Nhóm Giao Dịch (`groupId`)**:
   - Thêm trường `groupId?: string` vào `FloatingTextItem` trong `src/client/store/game_store_types.ts`.
   - Dispatcher (`src/client/network/activity_badge_dispatcher.ts`) gán chung một `groupId` duy nhất cho cả 2 bản tin của cùng 1 giao dịch P2P:
     - Tiền thuê: `groupId = 'rent_' + act.id + '_' + payerId + '_' + receiverId`
     - M&A Thâu tóm: `groupId = 'ma_' + act.id` (đồng thời bổ sung `targetPlayerId` chuẩn xác)
     - Giao thương P2P: `groupId = 'trade_' + act.id`
     - Ngoại giao: `groupId = 'diplo_' + ev.cellIndex + '_' + ev.playerId + '_' + ev.landlordId + '_' + Date.now()`
2. **Đồng Bộ Vòng Đời Store (Lifecycle Coupling)**:
   - Trong `src/client/store/game_store.ts`, khi gọi `removeFloatingText(id)`, nếu thẻ bị xóa có `groupId`, store sẽ xóa **toàn bộ** các thẻ có cùng `groupId`.
   - Triệt tiêu 100% bẫy hồi sinh thẻ ma khi bấm ✕ hoặc khi hết hạn.
3. **Module Khử Trùng Lặp Thuần Túy (`notification_deduplicator.ts`)**:
   - Tạo mới `src/client/ui/notification_deduplicator.ts` (~40 LOC).
   - Hàm `deduplicateFloatingTexts(items, myPlayerId)` duyệt danh sách, nhóm theo `groupId`:
     - Nếu có Bạn tham gia: Chỉ giữ lại thẻ của Bạn (`playerId === myPlayerId`).
     - Nếu giữa 2 Bot: Chỉ giữ lại thẻ chi trả (`type === FloatingTextType.Penalty`).
     - Các bản tin đơn lẻ (mua đất, nộp thuế, vượt Go) giữ nguyên 100%.
4. **Chuẩn Hóa Hiển Thị Mobile & Milestone Banner**:
   - Trong `src/client/ui/floating_numbers.tsx`, áp dụng `deduplicateFloatingTexts` trước khi cắt `slice(-2)`.
   - Bảo toàn logic `isHiddenOnMobile = Boolean(latestMilestone && displayItems.length > 1 && idx < displayItems.length - 1)` để không phá vỡ hợp đồng sống `TC-234.11` và `PROBE-2.5`.
   - Bổ sung `bankrupt` vào danh sách `latestMilestone`, bảo đảm các sự kiện Phá Sản được render dưới dạng `MilestoneBanner` màu đỏ trang trọng và không lọt vào `regularTexts`.

---

## 2. BẢNG ĐO LƯỜNG NGÂN SÁCH LOC (PILLAR 1 & PILLAR 2)

Đo lường cơ học trước khi thực hiện qua `scripts/check_loc.mjs`:

| Tệp vật lý | Phân loại Tier | LOC Hiện Tại | Dự Kiến Thêm | Dự Kiến Bớt | LOC Sau Thay Đổi | Ngưỡng Tối Đa | Trạng Thái & Khóa Test |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `src/client/store/game_store_types.ts` | Tier 1 (State Types) | **393** | +1 | -0 | **394** | <= 400 | ⚠️ Warning (> 300) |
| `src/client/store/game_store.ts` | Tier 1 (Store Logic) | **390** | +22 | -36 | **376** | <= 400 | ⚠️ Warning (> 300, -14 dòng) |
| `src/client/network/activity_badge_dispatcher.ts` | Tier 1 (Dispatcher) | **249** | +38 | -52 | **235** | <= 250 | ✔️ Safe (Khóa cứng `TC-191.16` <= 250, -14 dòng) |
| `src/client/ui/notification_deduplicator.ts` | Tier 2 (Pure Module) | **0** (Mới) | +42 | -0 | **~42** | <= 500 | ✔️ Safe (Mới) |
| `src/client/ui/floating_numbers.tsx` | Tier 2 (UI Views) | **297** | +7 | -3 | **301** | <= 390 | ✔️ Safe (Khóa cứng `TC-191.16` <= 390) |
| `tests/contracts/imp252_financial_notification_deduplication.test.ts` | Test Suite (Mới) | **0** | +220 | -0 | **~220** | <= 600 | ✔️ Safe (Mới) |

*Tech Debt Ledger Item (Theo quy chuẩn GEMINI.md cho tệp thuộc Warning Range)*:
- **`DEBT-STORE-PARTITION`**: `game_store.ts` (376 LOC) và `game_store_types.ts` (394 LOC) đang trong vùng cảnh báo > 300 LOC. Khi một trong hai tệp tiến sát 400 LOC, nhiệm vụ kỹ thuật tiếp theo bắt buộc bóc tách các sub-slices: `floating_texts_slice.ts` và `camera_slice.ts`.
- Tuyệt đối không sửa `src/client/ui/transaction_narrative.ts` (giữ nguyên 270 LOC, bảo vệ an toàn `TC-194.18` trần 280 LOC).

---

## 3. STATION 1: BỘ KIỂM THỬ HỢP ĐỒNG (QA TEST SPECIFICATIONS)

> Tệp kiểm thử mới: `tests/contracts/imp252_financial_notification_deduplication.test.ts`  
> Yêu cầu: 15 atomic tests qua 5 Facets, 100% tuân thủ Adversarial Inversion (RED trên mã nguồn hiện tại).

### Facet 1: Group-Id Lifecycle & Store Coupling (TC-IMP252.01..03)
  - [UC-IMP252/MSS] TC-IMP252.01: FloatingTextItem hỗ trợ trường groupId và addFloatingText bảo lưu groupId trong store. (RED: Chưa hỗ trợ groupId).
  - [UC-IMP252/MSS] TC-IMP252.02: Khi gọi removeFloatingText với id của một thẻ mang groupId, TẤT CẢ các thẻ mang cùng groupId đều bị xóa sạch khỏi store, triệt tiêu thẻ ma. (RED: Hiện tại chỉ xóa duy nhất thẻ theo ID).
  - [UC-IMP252/A1] TC-IMP252.03: Khi gọi removeFloatingText với thẻ đơn lẻ (không có groupId), các thẻ khác trong store không bị ảnh hưởng.

### Facet 2: Dispatcher Group-Id Tagging & P2P Binding (TC-IMP252.04..06)
  - [UC-IMP252/MSS] TC-IMP252.04: handleRentBadge gán chung một groupId cho cả 2 thẻ rent_pay và rent_receive. (RED: Hiện tại không có groupId).
  - [UC-IMP252/MSS] TC-IMP252.05: handleMaBuyoutBadge gán chung một groupId cho cả thẻ thâu tóm và thẻ bị thâu tóm, đồng thời thiết lập chính xác targetPlayerId. (RED: Hiện tại thiếu targetPlayerId và groupId).
  - [UC-IMP252/MSS] TC-IMP252.06: handleTradeBadge và handleDiplomaticEventBadge gán chung một groupId cho cả hai bên tham gia giao dịch kèm timestamp cách ly đụng độ. (RED: Hiện tại không có groupId).

### Facet 3: Local Player Perspective Deduplication (TC-IMP252.07..09)
  - [UC-IMP252/MSS] TC-IMP252.07: deduplicateFloatingTexts chỉ giữ lại thẻ của Bạn khi giao dịch P2P có Bạn là bên trả tiền (Penalty). (RED: Hàm chưa tồn tại).
  - [UC-IMP252/MSS] TC-IMP252.08: deduplicateFloatingTexts chỉ giữ lại thẻ của Bạn khi giao dịch P2P có Bạn là bên nhận tiền (Reward). (RED: Hàm chưa tồn tại).
  - [UC-IMP252/MSS] TC-IMP252.09: deduplicateFloatingTexts khi giữa 2 Bot với nhau chỉ giữ lại 1 thẻ duy nhất đại diện cho dòng tiền chi trả (Penalty). (RED: Hàm chưa tồn tại).

### Facet 4: Mobile Single-Card Clamping & Information Preservation (TC-IMP252.10..12)
  - [UC-IMP252/MSS] TC-IMP252.10: Khi có MilestoneBanner và có 2 thẻ thường, thẻ cũ hơn áp dụng hidden md:flex trên mobile, thẻ mới nhất hiển thị trọn vẹn; khi không có MilestoneBanner, cả 2 thẻ thường không bị gắn hidden md:flex (bảo vệ hợp đồng sống TC-234.11).
  - [UC-IMP252/MSS] TC-IMP252.11: Trên Desktop (>= 768px), cả 2 thẻ thường độc lập đều hiển thị đồng thời dạng stack.
  - [UC-IMP252/MSS] TC-IMP252.12: Khi người chơi địa phương có 2 thẻ thường liên tiếp, thứ tự hiển thị giữ nguyên theo trật tự thời gian (mới hơn ở vị trí 1), không bị đảo ngược thứ tự gây ẩn thẻ mới.

### Facet 5: Bankrupt Milestone Harmonization & Regression Guards (TC-IMP252.13..15)
  - [UC-IMP252/MSS] TC-IMP252.13: FloatingNumbersOverlay nhận diện actionType bankrupt là latestMilestone để render MilestoneBanner và không đưa vào regularTexts. (RED: Hiện tại bankrupt rơi vào regularTexts).
  - [UC-IMP252/MSS] TC-IMP252.14: addFloatingText gán durationMs bằng EVENT_BANNER_DURATION_MS (4500ms) cho actionType bankrupt. (RED: Hiện tại gán 3600ms).
  - [UC-IMP252/A2] TC-IMP252.15: Các bản tin không có groupId (buy, tax, salary, bail) được bảo toàn nguyên vẹn thứ tự và số lượng qua deduplicateFloatingTexts.

---

## 4. CHI TIẾT CÁC ĐOẠN MÃ THAY THẾ (CONCRETE DROP-IN SNIPPETS)

### Task 1: Bổ sung `groupId` vào `game_store_types.ts`
- **Target physical file**: `src/client/store/game_store_types.ts`

```typescript
<<<<
  readonly bailKind?: 'voluntary' | 'forced' | 'doubles'; // [IMP-216] Phân định chính xác loại bảo lãnh (No Magic Strings)
}
====
  readonly bailKind?: 'voluntary' | 'forced' | 'doubles'; // [IMP-216] Phân định chính xác loại bảo lãnh (No Magic Strings)
  readonly groupId?: string; // [IMP-252] Khóa nhóm giao dịch P2P đối ứng
}
>>>>
```

---

### Task 2: Cập nhật Store `game_store.ts` hỗ trợ vòng đời nhóm `groupId` (Rút gọn Subtractive)
- **Target physical file**: `src/client/store/game_store.ts`

```typescript
<<<<
    const isMilestone =
      item.actionType === 'chance' ||
      item.actionType === 'market' ||
      item.actionType === 'monopoly' ||
      item.actionType === 'debt_relief';
    const duration = item.durationMs ?? (isMilestone ? EVENT_BANNER_DURATION_MS : TRANSACTION_POPUP_DURATION_MS);
    const newItem: FloatingTextItem = {
      id,
      text: item.text,
      type: item.type,
      playerId: item.playerId,
      timestamp,
      durationMs: duration,
      ...(item.actionType ? { actionType: item.actionType } : {}),
      ...(item.title ? { title: item.title } : {}),
      ...(item.cellIndex !== undefined ? { cellIndex: item.cellIndex } : {}),
      ...(item.targetPlayerName ? { targetPlayerName: item.targetPlayerName } : {}),
      ...(item.targetPlayerId ? { targetPlayerId: item.targetPlayerId } : {}),
      ...(item.formula ? { formula: item.formula } : {}),
      ...(item.bailKind ? { bailKind: item.bailKind } : {}),
    };
    set((state) => ({
      floatingTexts: [...state.floatingTexts, newItem].slice(-MAX_FLOATING_TEXTS),
    }));
    if (typeof setTimeout !== 'undefined') {
      setTimeout(() => {
        get().removeFloatingText(id);
      }, duration);
    }
  },

  removeFloatingText: (id) =>
    set((state) => ({
      floatingTexts: state.floatingTexts.filter((t) => t.id !== id),
    })),
====
    const isMilestone = Boolean(item.actionType && /^(chance|market|monopoly|debt_relief|bankrupt)$/.test(item.actionType));
    const duration = item.durationMs ?? (isMilestone ? EVENT_BANNER_DURATION_MS : TRANSACTION_POPUP_DURATION_MS);
    const newItem: FloatingTextItem = {
      id, text: item.text, type: item.type, playerId: item.playerId, timestamp, durationMs: duration,
      ...(item.actionType ? { actionType: item.actionType } : {}),
      ...(item.title ? { title: item.title } : {}),
      ...(item.cellIndex !== undefined ? { cellIndex: item.cellIndex } : {}),
      ...(item.targetPlayerName ? { targetPlayerName: item.targetPlayerName } : {}),
      ...(item.targetPlayerId ? { targetPlayerId: item.targetPlayerId } : {}),
      ...(item.formula ? { formula: item.formula } : {}),
      ...(item.bailKind ? { bailKind: item.bailKind } : {}),
      ...(item.groupId ? { groupId: item.groupId } : {}),
    };
    set((state) => ({ floatingTexts: [...state.floatingTexts, newItem].slice(-MAX_FLOATING_TEXTS) }));
    if (typeof setTimeout !== 'undefined') setTimeout(() => { get().removeFloatingText(id); }, duration);
  },

  removeFloatingText: (id) =>
    set((state) => {
      const gId = state.floatingTexts.find((t) => t.id === id)?.groupId;
      return { floatingTexts: state.floatingTexts.filter((t) => t.id !== id && (!gId || t.groupId !== gId)) };
    }),
>>>>
```

---

### Task 3: Gán `groupId` và tinh gọn LOC trong `activity_badge_dispatcher.ts` (Subtractive Refactoring Thực Chất)
- **Target physical file**: `src/client/network/activity_badge_dispatcher.ts`

```typescript
<<<<
export function handleRentBadge(act: ActivityLogEntry, state: GameState): void {
  if (!act.targetPlayerId || !act.targetPlayerName) {
    console.warn('[ActivityBadgeDispatcher] Missing targetPlayerId or targetPlayerName in rent log:', act);
    return;
  }
  const payerId = act.playerId, payerName = act.playerName ?? (payerId ? state.playersInfo[payerId]?.name : '');
  const receiverId = act.targetPlayerId, receiverName = act.targetPlayerName;
  const absAmount = Math.abs(act.amount ?? 0), cellName = act.cellIndex !== undefined ? getCellName(act.cellIndex) : 'BĐS';
  const delay = getPawnLandingDelay(payerId);

  scheduleAction(() => {
    if (payerId) {
      useVfxStore.getState().triggerPawnReaction(payerId, 'slump_recoil', 400);
      SoundEngine.playSlumpThud();
      state.addFloatingText({ text: formatCurrency(-absAmount), type: FloatingTextType.Penalty, playerId: payerId, actionType: 'rent_pay', title: `Trả thuê ${cellName}`, targetPlayerId: receiverId, targetPlayerName: receiverName, cellIndex: act.cellIndex });
    }
    if (receiverId) {
      useVfxStore.getState().triggerPawnReaction(receiverId, 'victory_spin', 600);
      SoundEngine.playVictoryChime();
      state.addFloatingText({ text: `+${formatCurrency(absAmount)}`, type: FloatingTextType.Reward, playerId: receiverId, actionType: 'rent_receive', title: `Thu thuê ${cellName}`, targetPlayerId: payerId, targetPlayerName: payerName, cellIndex: act.cellIndex });
    }
  }, delay);
}
====
export function handleRentBadge(act: ActivityLogEntry, state: GameState): void {
  if (!act.targetPlayerId || !act.targetPlayerName) {
    console.warn('[ActivityBadgeDispatcher] Missing targetPlayerId or targetPlayerName in rent log:', act);
    return;
  }
  const payerId = act.playerId, payerName = act.playerName ?? (payerId ? state.playersInfo[payerId]?.name : '');
  const receiverId = act.targetPlayerId, receiverName = act.targetPlayerName, absAmount = Math.abs(act.amount ?? 0);
  const cellName = act.cellIndex !== undefined ? getCellName(act.cellIndex) : 'BĐS', groupId = `rent_${act.id}_${payerId}_${receiverId}`;
  scheduleAction(() => {
    if (payerId) {
      useVfxStore.getState().triggerPawnReaction(payerId, 'slump_recoil', 400);
      SoundEngine.playSlumpThud();
      state.addFloatingText({ text: formatCurrency(-absAmount), type: FloatingTextType.Penalty, playerId: payerId, actionType: 'rent_pay', title: `Trả thuê ${cellName}`, targetPlayerId: receiverId, targetPlayerName: receiverName, cellIndex: act.cellIndex, groupId });
    }
    if (receiverId) {
      useVfxStore.getState().triggerPawnReaction(receiverId, 'victory_spin', 600);
      SoundEngine.playVictoryChime();
      state.addFloatingText({ text: `+${formatCurrency(absAmount)}`, type: FloatingTextType.Reward, playerId: receiverId, actionType: 'rent_receive', title: `Thu thuê ${cellName}`, targetPlayerId: payerId, targetPlayerName: payerName, cellIndex: act.cellIndex, groupId });
    }
  }, getPawnLandingDelay(payerId));
}
>>>>
```

```typescript
<<<<
export function handleTradeBadge(act: ActivityLogEntry, state: GameState): void {
  const cell = act.cellIndex !== undefined ? getCellName(act.cellIndex) : 'BĐS', bId = act.playerId ?? '', sId = act.targetPlayerId;
  const bName = act.playerName || (bId ? state.playersInfo[bId]?.name : 'Người chơi');
  const sName = act.targetPlayerName || (sId ? state.playersInfo[sId]?.name : 'đối tác');
  if (bId) state.addFloatingText({ text: cell, type: FloatingTextType.Reward, playerId: bId, actionType: 'trade', title: `${bName} nhận ${cell} từ ${sName}`, targetPlayerId: sId, targetPlayerName: sName, cellIndex: act.cellIndex, formula: 'Chuyển nhượng quyền sở hữu P2P' });
  if (sId) state.addFloatingText({ text: cell, type: FloatingTextType.Penalty, playerId: sId, actionType: 'trade', title: `${sName} nhượng ${cell} cho ${bName}`, targetPlayerId: bId, targetPlayerName: bName, cellIndex: act.cellIndex, formula: 'Chuyển nhượng quyền sở hữu P2P' });
}

export function handleHoseBadge(act: ActivityLogEntry, state: GameState, delta?: DeltaPayload): void {
  const profit = act.amount ?? 0, hr = delta?.lastHoseResult;
  state.addFloatingText({ text: `${profit >= 0 ? '+' : ''}${formatCurrency(profit)}`, type: profit >= 0 ? FloatingTextType.Reward : FloatingTextType.Penalty, playerId: act.playerId ?? '', actionType: 'hose', title: act.message, formula: hr ? `Khớp lệnh sàn HOSE: Mặt ${hr.roll}` : 'Giao dịch sàn chứng khoán HOSE' });
}

function handleMaBuyoutBadge(act: ActivityLogEntry, state: GameState): void {
  const buyerId = act.playerId, absAmount = Math.abs(act.amount ?? 0), buyerName = act.playerName ?? (buyerId ? state.playersInfo[buyerId]?.name : 'Người chơi');
  const cellName = act.cellIndex !== undefined ? getCellName(act.cellIndex) : 'BĐS', match = act.message.match(/từ\s+(.+)$/);
  const sellerName = match ? match[1]?.trim() : undefined;
  const sellerId = sellerName ? Object.keys(state.playersInfo).find((id) => state.playersInfo[id]?.name === sellerName) : undefined;
  if (buyerId) state.addFloatingText({ text: formatCurrency(-absAmount), type: FloatingTextType.Penalty, playerId: buyerId, actionType: 'ma_buyout', title: `Thâu tóm ${cellName}`, targetPlayerName: sellerName, cellIndex: act.cellIndex });
  if (sellerId) {
    useVfxStore.getState().triggerPawnReaction(sellerId, 'slump_recoil', 400);
    SoundEngine.playSlumpThud();
    state.addFloatingText({ text: `+${formatCurrency(absAmount)}`, type: FloatingTextType.Reward, playerId: sellerId, actionType: 'ma_buyout', title: `⚠️ Bị thâu tóm: ${cellName}`, targetPlayerName: buyerName, cellIndex: act.cellIndex });
  }
}

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
====
export function handleTradeBadge(act: ActivityLogEntry, state: GameState): void {
  const cell = act.cellIndex !== undefined ? getCellName(act.cellIndex) : 'BĐS', bId = act.playerId ?? '', sId = act.targetPlayerId, groupId = `trade_${act.id}`;
  const bName = act.playerName || (bId ? state.playersInfo[bId]?.name : 'Người chơi'), sName = act.targetPlayerName || (sId ? state.playersInfo[sId]?.name : 'đối tác');
  if (bId) state.addFloatingText({ text: cell, type: FloatingTextType.Reward, playerId: bId, actionType: 'trade', title: `${bName} nhận ${cell} từ ${sName}`, targetPlayerId: sId, targetPlayerName: sName, cellIndex: act.cellIndex, formula: 'Chuyển nhượng quyền sở hữu P2P', groupId });
  if (sId) state.addFloatingText({ text: cell, type: FloatingTextType.Penalty, playerId: sId, actionType: 'trade', title: `${sName} nhượng ${cell} cho ${bName}`, targetPlayerId: bId, targetPlayerName: bName, cellIndex: act.cellIndex, formula: 'Chuyển nhượng quyền sở hữu P2P', groupId });
}

export function handleHoseBadge(act: ActivityLogEntry, state: GameState, delta?: DeltaPayload): void {
  const profit = act.amount ?? 0, hr = delta?.lastHoseResult;
  state.addFloatingText({ text: `${profit >= 0 ? '+' : ''}${formatCurrency(profit)}`, type: profit >= 0 ? FloatingTextType.Reward : FloatingTextType.Penalty, playerId: act.playerId ?? '', actionType: 'hose', title: act.message, formula: hr ? `Khớp lệnh sàn HOSE: Mặt ${hr.roll}` : 'Giao dịch sàn chứng khoán HOSE' });
}

function handleMaBuyoutBadge(act: ActivityLogEntry, state: GameState): void {
  const buyerId = act.playerId, absAmount = Math.abs(act.amount ?? 0), buyerName = act.playerName ?? (buyerId ? state.playersInfo[buyerId]?.name : 'Người chơi');
  const cellName = act.cellIndex !== undefined ? getCellName(act.cellIndex) : 'BĐS', match = act.message.match(/từ\s+(.+)$/), sellerName = match ? match[1]?.trim() : undefined;
  const sellerId = sellerName ? Object.keys(state.playersInfo).find((id) => state.playersInfo[id]?.name === sellerName) : undefined, groupId = `ma_${act.id}`;
  if (buyerId) state.addFloatingText({ text: formatCurrency(-absAmount), type: FloatingTextType.Penalty, playerId: buyerId, actionType: 'ma_buyout', title: `Thâu tóm ${cellName}`, targetPlayerId: sellerId, targetPlayerName: sellerName, cellIndex: act.cellIndex, groupId });
  if (sellerId) {
    useVfxStore.getState().triggerPawnReaction(sellerId, 'slump_recoil', 400);
    SoundEngine.playSlumpThud();
    state.addFloatingText({ text: `+${formatCurrency(absAmount)}`, type: FloatingTextType.Reward, playerId: sellerId, actionType: 'ma_buyout', title: `⚠️ Bị thâu tóm: ${cellName}`, targetPlayerId: buyerId, targetPlayerName: buyerName, cellIndex: act.cellIndex, groupId });
  }
}

export function handleCardPenaltyBadge(act: ActivityLogEntry, state: GameState): void {
  const amount = act.amount !== undefined ? -Math.abs(act.amount) : 0;
  if (amount === 0) return;
  const match = act.message.match(/\((.+?)\)/), cardTitle = match ? match[1] : 'Phiếu Sự Kiện';
  scheduleAction(() => {
    state.addFloatingText({ text: formatCurrency(amount), type: FloatingTextType.Penalty, playerId: act.playerId ?? '', actionType: 'chance', title: `Nộp Phạt: ${cardTitle} ➔ Kho Bạc`, cellIndex: act.cellIndex });
  }, getPawnLandingDelay(act.playerId));
}
>>>>
```

```typescript
<<<<
export function handleDiplomaticEventBadge(
  ev: { playerId: string; landlordId: string; cellIndex: number; savedRent: number },
  state: GameState,
): void {
  if (typeof state?.addFloatingText !== 'function') return;
  const pName = state.playersInfo[ev.playerId]?.name || 'Khách thuê', lName = state.playersInfo[ev.landlordId]?.name || 'Chủ đất', amt = formatCurrency(ev.savedRent);
  if (ev.playerId) state.addFloatingText({ text: `+${amt} Tr.`, type: FloatingTextType.Reward, playerId: ev.playerId, actionType: 'diplomatic', title: 'Miễn Trừ Ngoại Giao', cellIndex: ev.cellIndex, targetPlayerId: ev.landlordId, targetPlayerName: lName });
  if (ev.landlordId) state.addFloatingText({ text: `-${amt} Tr.`, type: FloatingTextType.Penalty, playerId: ev.landlordId, actionType: 'diplomatic', title: `${pName} dùng Thẻ Ngoại Giao`, cellIndex: ev.cellIndex, targetPlayerId: ev.playerId, targetPlayerName: pName });
}
====
export function handleDiplomaticEventBadge(
  ev: { playerId: string; landlordId: string; cellIndex: number; savedRent: number },
  state: GameState,
): void {
  if (typeof state?.addFloatingText !== 'function') return;
  const pName = state.playersInfo[ev.playerId]?.name || 'Khách thuê', lName = state.playersInfo[ev.landlordId]?.name || 'Chủ đất', amt = formatCurrency(ev.savedRent), groupId = `diplo_${ev.cellIndex}_${ev.playerId}_${ev.landlordId}_${Date.now()}`;
  if (ev.playerId) state.addFloatingText({ text: `+${amt} Tr.`, type: FloatingTextType.Reward, playerId: ev.playerId, actionType: 'diplomatic', title: 'Miễn Trừ Ngoại Giao', cellIndex: ev.cellIndex, targetPlayerId: ev.landlordId, targetPlayerName: lName, groupId });
  if (ev.landlordId) state.addFloatingText({ text: `-${amt} Tr.`, type: FloatingTextType.Penalty, playerId: ev.landlordId, actionType: 'diplomatic', title: `${pName} dùng Thẻ Ngoại Giao`, cellIndex: ev.cellIndex, targetPlayerId: ev.playerId, targetPlayerName: pName, groupId });
}
>>>>
```

---

### Task 4: Tạo module thuần túy `src/client/ui/notification_deduplicator.ts`
- **Target physical file**: `src/client/ui/notification_deduplicator.ts` (new)

```typescript
<<<<
====
// [UI-S05/MSS][IMP-252] NotificationDeduplicator — Pure financial toast and badge deduplication
import { FloatingTextType, type FloatingTextItem } from '../store/game_store.js';

export function deduplicateFloatingTexts(
  items: readonly FloatingTextItem[],
  myPlayerId?: string | null,
): FloatingTextItem[] {
  if (items.length <= 1) return [...items];

  const seenGroups = new Set<string>();
  const result: FloatingTextItem[] = [];

  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i]!;
    if (!item.groupId) {
      result.unshift(item);
      continue;
    }
    if (seenGroups.has(item.groupId)) {
      continue;
    }
    seenGroups.add(item.groupId);

    const groupItems = items.filter((t) => t.groupId === item.groupId);
    if (groupItems.length === 1) {
      result.unshift(groupItems[0]!);
    } else {
      const myItem = myPlayerId ? groupItems.find((t) => t.playerId === myPlayerId) : undefined;
      if (myItem) {
        result.unshift(myItem);
      } else {
        const penaltyItem = groupItems.find((t) => t.type === FloatingTextType.Penalty) ?? groupItems[0]!;
        result.unshift(penaltyItem);
      }
    }
  }

  return result;
}
>>>>
```

---

### Task 5: Tích hợp `deduplicateFloatingTexts` và chuẩn hóa `bankrupt` trong `floating_numbers.tsx`
- **Target physical file**: `src/client/ui/floating_numbers.tsx`

```tsx
<<<<
import {
  useGameStore,
  type FloatingTextItem,
} from '../store/game_store.js';
import { useLobbyStore } from '../store/lobby_store.js';
====
import {
  useGameStore,
  type FloatingTextItem,
} from '../store/game_store.js';
import { useLobbyStore } from '../store/lobby_store.js';
import { deduplicateFloatingTexts } from './notification_deduplicator.js';
>>>>
```

```tsx
<<<<
  const latestMilestone = [...floatingTexts].reverse().find(
    (t) =>
      t.actionType === 'monopoly' ||
      t.actionType === 'debt_relief' ||
      t.actionType === 'chance' ||
      t.actionType === 'market',
  );

  const regularTexts = floatingTexts.filter(
    (t) =>
      t.actionType !== 'monopoly' &&
      t.actionType !== 'debt_relief' &&
      t.actionType !== 'chance' &&
      t.actionType !== 'market',
  );
====
  const latestMilestone = [...floatingTexts].reverse().find(
    (t) =>
      t.actionType === 'monopoly' ||
      t.actionType === 'debt_relief' ||
      t.actionType === 'chance' ||
      t.actionType === 'market' ||
      t.actionType === 'bankrupt',
  );

  const regularTexts = floatingTexts.filter(
    (t) =>
      t.actionType !== 'monopoly' &&
      t.actionType !== 'debt_relief' &&
      t.actionType !== 'chance' &&
      t.actionType !== 'market' &&
      t.actionType !== 'bankrupt',
  );
>>>>
```

```tsx
<<<<
  const recentTwo = regularTexts.slice(-2);
  let displayItems = [...recentTwo];
  if (displayItems.length === 2 && myPlayerId) {
    const myIdx = displayItems.findIndex((it) => it.playerId === myPlayerId);
    if (myIdx === 0) {
      displayItems = [displayItems[1]!, displayItems[0]!];
    }
  }
====
  const deduplicated = deduplicateFloatingTexts(regularTexts, myPlayerId);
  const recentTwo = deduplicated.slice(-2);
  let displayItems = [...recentTwo];
  if (
    displayItems.length === 2 &&
    myPlayerId &&
    displayItems[0]?.playerId === myPlayerId &&
    displayItems[1]?.playerId !== myPlayerId
  ) {
    displayItems = [displayItems[1]!, displayItems[0]!];
  }
>>>>
```

---

## 5. BẢN KÊ KHAI BẪY LỖI & THẤT BẠI BIÊN (FAILURE MODES ENUMERATION)

1. **FM-1: Rò rỉ thẻ ma khi bấm ✕ sớm trên thẻ**:
   - *Nguy cơ*: Thẻ đối tác vẫn còn trong store và xuất hiện trở lại sau khi thẻ chính bị xóa.
   - *Phòng vệ*: `removeFloatingText(id)` xóa toàn bộ các phần tử cùng `groupId`. Bấm ✕ thẻ này lập tức dọn sạch thẻ kia.
2. **FM-2: Lệch thời gian hết hạn `setTimeout` giữa 2 thẻ đối ứng**:
   - *Nguy cơ*: Thẻ A hết hạn trước thẻ B 1-2ms, làm thẻ B nhấp nháy.
   - *Phòng vệ*: Khi timer của thẻ A kích hoạt, lệnh gọi `removeFloatingText(A.id)` xóa đồng thời cả thẻ B. Khi timer của thẻ B kích hoạt sau đó, thẻ B đã không còn trong store.
3. **FM-3: Mất thông báo tài chính quan trọng khi có MilestoneBanner**:
   - *Nguy cơ*: Nếu ẩn toàn bộ thẻ thường khi có banner, thẻ thường sẽ hết hạn tại 3600ms trước khi banner đóng tại 4500ms.
   - *Phòng vệ*: Biểu thức `latestMilestone && displayItems.length > 1 && idx < displayItems.length - 1` (DIR-ADV-01) bảo đảm thẻ thường mới nhất LUÔN HIỂN THỊ phía dưới banner trên mobile, không bị che mất thông tin trừ tiền.
4. **FM-4: Tràn trần LOC của các bài test kế thừa**:
   - *Nguy cơ*: Thêm logic làm vượt ngưỡng `TC-191.16` (`badgeDispatcherLoc <= 250`) hoặc `TC-194.18` (`narrativeLoc <= 280`).
   - *Phòng vệ*: Tách module độc lập `notification_deduplicator.ts` (~42 LOC), giữ nguyên `transaction_narrative.ts` (Delta = 0), và rút gọn cú pháp dispatcher xuống <= 236 LOC.
5. **FM-5: Xung đột `groupId` sự kiện ngoại giao trong burst turn**:
   - *Nguy cơ*: Hai sự kiện ngoại giao liên tiếp cùng ô có chung `groupId` khiến sự kiện 1 hủy nhầm sự kiện 2.
   - *Phòng vệ*: Gắn `Date.now()` vào khóa ngoại giao (DIR-ADV-02).
6. **FM-6: Đảo ngược trật tự thời gian thẻ của người chơi địa phương**:
   - *Nguy cơ*: Người chơi có 2 thông báo liên tiếp bị swap đẩy thẻ mới vào vị trí ẩn trên mobile.
   - *Phòng vệ*: Bổ sung guard `displayItems[1]?.playerId !== myPlayerId` trước khi swap (DIR-ADV-03).

---

## 6. MA TRẬN TRUY XUẤT & ĐIỀU KIỆN HOÀN THÀNH (DEFINITION OF DONE)

| Tiêu chuẩn DoD | Mô tả kiểm chứng | Trạng thái dự kiến |
| :--- | :--- | :---: |
| **DoD 1: Contract Tests** | 15 atomic tests có tag `[UC-IMP252/MSS]` hoặc `[UC-IMP252/A#]`, pass Inversion Gate | ĐẠT |
| **DoD 2: Linter & Budget** | `npm run lint:slop` 0 violations, `floating_numbers.tsx` <= 390 LOC, `badgeDispatcherLoc <= 250` | ĐẠT |
| **DoD 3: Reviewer Funnel** | Trạm 3.1 Spec Reviewer, Trạm 3.2 Code Reviewer & UI Craft Reviewer phê duyệt | ĐẠT |
| **DoD 4: Dual-Viewport Evidence** | Chụp bằng chứng vật lý Desktop (1280x800) và Mobile (360x740) xác minh không trùng lặp | ĐẠT |
| **DoD 5: Tech Debt & Report** | Cập nhật ledger `docs/epics/client_ui/_epic_ledger.md` và sinh báo cáo hoàn tất | ĐẠT |
