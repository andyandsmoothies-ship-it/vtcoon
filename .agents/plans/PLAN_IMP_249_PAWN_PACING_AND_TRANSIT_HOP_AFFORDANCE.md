# KẾ HOẠCH TRIỂN KHAI: IMP-249 (Revision 3)

> **Mã Ticket:** `IMP-249` (Tier 2 Full Rigor)  
> **Tiêu đề:** Đồng Bộ Nhịp Độ Quân Cờ 3D, Chống Đúp Modal Và Chuẩn Hóa FSM Bước Nhảy Thứ Hai (Pawn Pacing Synchronization and Transit Second-Hop Affordance)  
> **Trạng thái:** `REVISION 3 (Hardened after Stage A & Stage B Grilling)`  
> **Tài liệu SSOT:** [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md), [`GEMINI.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/GEMINI.md), [`docs/master_roadmap.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/master_roadmap.md)  
> **Biên bản kiểm toán Stage A:** [`.agents/audit/PLAN_AUDIT_IMP_249.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP_249.md)  
> **Biên bản kiểm toán Stage B:** [`.agents/audit/PLAN_CHALLENGE_IMP_249.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_CHALLENGE_IMP_249.md)  

---

## 0. BẢNG ĐỐI CHIẾU TIẾP THU TOÀN DIỆN CHỈ THỊ KIỂM TOÁN (STAGE A & STAGE B CLOSURE TABLES)

### 0.1. Tiếp thu chỉ thị Stage A (Plan Griller Directives)
| Griller Directive (Revision 1) | Vị trí tiếp thu & khắc phục (Revision 2 & 3) | Trạng thái |
| :--- | :--- | :--- |
| `[P1 - Incomplete Pipeline]` `apply_delta.ts` cưỡng chế đóng modal Vòng Xoay Hành Trình tại 0ms khi server phát `ActionPhase`. Bổ sung snippet cho `apply_delta.ts` cho phép giữ modal `transit_wheel` khi `delta.turnPhase === TurnPhase.ActionPhase`. Thêm file vào Bảng LOC (Baseline 344). | Section 1 (Bảng LOC), Section 4 Task 7 (Snippet 4.7), Section 3 TC-IMP249.18 | ✅ ADDRESSED |
| `[P1 - LOC Arithmetic]` Sai lệch số học giữa khai báo và snippet thực tế trên toàn bộ file. Hiệu chỉnh bảng LOC theo đúng diff số học thực tế. | Section 1 (Hiệu chỉnh toàn diện số liệu đo lường vật lý và số dòng delta) | ✅ ADDRESSED |
| `[P2 - State Mutex]` `useState` bất đồng bộ có thể để lọt click đúp trong cùng animation frame. Bổ sung `React.useRef(false)` khóa đồng bộ 0ms ngay trong handler `onBuy`. | Section 4 Task 3 (Snippet 4.3 bổ sung `submittingRef = React.useRef(false)`) | ✅ ADDRESSED |
| `[P2 - Modal Collision]` Chặn mở modal `deed` vô điều kiện khiến người chơi đang xem ô khác bị mất modal mua đất của ô đích. Tinh chỉnh điều kiện chỉ chặn khi `activeModal === 'deed'` và `cellIndex === targetCell`. | Section 4 Task 2 (Snippet 4.2 `isViewingCurrentDeed = state.activeModal === 'deed' && (state.modalPayload as { cellIndex?: number } \| null)?.cellIndex === targetCell`) | ✅ ADDRESSED |
| `[P2 - Notification Alias]` Thiếu alias chữ thường / camelCase cho `INTENT_REJECTED`. Bổ sung alias mapping `intent_rejected` và `IntentRejected` vào bảng alias. | Section 4 Task 6 (Snippet 4.6 đăng ký alias cho cả 2 dạng) | ✅ ADDRESSED |

### 0.2. Tiếp thu chỉ thị Stage B (Adversarial Challenger Directives)
| Challenger Directive (Stage B) | Vị trí tiếp thu & khắc phục (Revision 3) | Trạng thái |
| :--- | :--- | :--- |
| **DIR-ADV-01**: Nút "Kết Thúc Lượt" trên ActionDock nhấp nháy đèn xanh trong giai đoạn Đấu Giá (`AuctionPhase`) và Nhảy Vòi Nước (`HosePhase`) do `isDoneRollingAndNoBuy` thiếu loại trừ pha. | Section 4 Task 1 (Snippet 4.1: bổ sung `turnPhase !== TurnPhase.AuctionPhase && turnPhase !== TurnPhase.HosePhase`), Section 3 TC-IMP249.19 | ✅ ADDRESSED |
| **DIR-ADV-02**: Mất khóa ngăn click đúp khi unmount `DeedModalHost` nếu gói tin mua cũ đang bay trên mạng. | Section 4 Task 3 (Snippet 4.3: duy trì `submittingRef.current = true` + kết hợp khóa nguyên tử server-authoritative FSM) | ✅ ADDRESSED |
| **DIR-ADV-03**: Nhãn nút bấm tại `TransitWheelModal` ghi cứng "Đi Đến Ô Mới" ngay cả khi kết quả là Hoãn Chuyến (`FLIGHT_DELAY`) hoặc Hoàn Tiền (`CASH_BACK`). | Section 4 Task 5 (Snippet 4.5: bổ sung `isStationaryOutcome` phân nhánh nút bấm thành `"Xác Nhận & Ở Lại Trạm"`), Section 3 TC-IMP249.20 | ✅ ADDRESSED |
| **DIR-ADV-04**: `resolveSecondHopLanding` bỏ quên gán `room.lastDiplomaticEvent` khi người chơi kích hoạt thẻ Ngoại Giao miễn tiền thuê tại bước nhảy thứ hai. | Section 4 Task 4 (Snippet 4.4: bổ sung khối gán `room.lastDiplomaticEvent` chuẩn hóa 100% với `turn_loop.ts`), Section 3 TC-IMP249.21 | ✅ ADDRESSED |
| **DIR-ADV-05**: Quân cờ chờ di chuyển (`pendingPawnMove`) bị mồ côi trong store nếu người chơi AFK hết giờ lúc đang mở Vòng Xoay. | Section 4 Task 7 (Snippet 4.7: gọi `state.setPendingPawnMove?.(null)` khi cưỡng chế đóng modal `transit_wheel`), Section 3 TC-IMP249.22 | ✅ ADDRESSED |

---

## 1. BẢNG ĐỐI SOÁT NGÂN SÁCH DÒNG MÃ (LOC BUDGET RECONCILIATION TABLE)

*Đo lường cơ học trước khi triển khai bằng công cụ chính thức của dự án: `node scripts/check_loc.mjs`*

| Physical File | Phân loại Tier | Baseline LOC | Non-Empty SLOC | Est. Delta | Post LOC | Budget Ceiling | Trạng thái |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `src/client/ui/action_dock.tsx` | Tier 2 (UI/3D/Views) | **367** | 353 | +4 | 371 | <= 500 | ✔️ Safe |
| `src/client/offline_landing.ts` | Tier 1 (Domain/Server/Logic) | **211** | 197 | +1 | 212 | <= 400 | ✔️ Safe |
| `src/client/ui/modals/hosts/deed_modal_host.tsx` | Tier 2 (UI/3D/Views) | **91** | 88 | +3 | 94 | <= 500 | ✔️ Safe |
| `src/server/transit_wheel_handler.ts` | Tier 1 (Domain/Server/Logic) | **178** | 166 | +16 | 194 | <= 400 | ✔️ Safe |
| `src/client/ui/modals/transit_wheel_modal.tsx` | Tier 2 (UI/3D/Views) | **153** | 138 | +3 | 156 | <= 500 | ✔️ Safe |
| `src/client/ui/actionable_notification.ts` | Tier 3 (Static Data/Config) | **360** | 338 | +11 | 371 | <= 800 | ✔️ Safe |
| `src/client/network/apply_delta.ts` | Tier 1 (Domain/Server/Logic) | **344** | 310 | +1 | 345 | <= 400 | ⚠️ Warning (344 > 300) |
| `tests/contracts/imp249_pawn_pacing_and_transit_hop_affordance.test.ts` | Test Suite (Living) | **0** | 0 | +300 | 300 | <= 600 | ✔️ Safe (Mới) |

*Ghi chú:*
1. File `src/server/property_actions.ts` (390 LOC) đang ở ngưỡng cảnh báo đỏ của Tier 1 (390/400). Ticket này **hoàn toàn KHÔNG sửa đổi** `property_actions.ts` để bảo toàn nghiêm ngặt ngân sách LOC.
2. File `src/client/network/apply_delta.ts` (344 LOC) nằm trong vùng cảnh báo (> 300 LOC Tier 1). Thay đổi trong ticket này có Delta = +1 dòng, Post LOC là 345 LOC (dưới trần tử thần 400). Đã đăng ký mục Tech Debt trong Section 6 để bóc tách submodule trong tương lai.

---

## 2. PHÂN TÍCH NGUYÊN NHÂN CƠ HỌC & KIẾN TRÚC GIẢI PHÁP

### 2.1. Hiện trạng & Lỗ hổng kỹ thuật (Blackbox Telemetry Evidence)
1. **Race Condition giữa Hoạt ảnh Quân cờ 3D và Action Dock:**
   - Khi đổ xúc xắc, Server phát `STATE_DELTA` ngay lập tức với `player.position = targetCell` và `turnPhase = ActionPhase`.
   - `action_dock.tsx` tính `isStandingOnBuyable` mà không kiểm tra `!isPawnMoving && !isRolling && !activePawnAnimation`. Nút "Mua Đất" nhấp nháy ngay lập tức khi quân cờ 3D mới bắt đầu nhảy (mất 3–5s).
   - Người chơi bấm mua ở Dock -> mở `TitleDeedModal` -> bấm "Mua BĐS" -> modal đóng.
   - Khi quân cờ 3D nhảy xong và chạm đất ô đích, `completePawnMove` phát `lastLandedPawn` -> `use_app_session.ts` gọi `executeCellLanding` trong `offline_landing.ts`. Do store chưa hoàn tất cập nhật `ownedProperties`, hàm này tự động mở lại modal `TitleDeedModal` **lần thứ 2**, khiến người chơi phải bấm mua thêm lần nữa.
2. **Thiếu Khóa Trạng Thái Đang Gửi (isSubmitting Lock) trên nút Mua BĐS:**
   - Trong `deed_modal_host.tsx`, `onBuy` kích hoạt `onIntent({ type: 'INTENT_BUY_PROPERTY' })` mà không có cờ `isSubmitting` / debounce đồng bộ, cho phép gửi liên tiếp nhiều intent khi người chơi click đúp.
3. **Lỗ hổng FSM Phase ở Bước nhảy thứ hai (Second-Hop FSM Desync):**
   - Trong `src/server/transit_wheel_handler.ts`, khi quay trúng `NEXT_PORT` hoặc `SPEED_BOOST`, quân cờ bay sang trạm hạ tầng kế tiếp (ví dụ: ô 25 Cao Tốc Bắc - Nam).
   - Hàm `resolveSecondHopLanding` chỉ gọi `handleLanding` để tính thuế/thuê nhưng **thiếu hoàn toàn bước chuyển pha FSM**: `room.phase` vẫn giữ nguyên ở `TurnPhase.PropertyManagement`.
   - Khi quân cờ đáp xuống ô 25, Client mở modal mua đất vì ô 25 chưa có chủ. Người chơi bấm "Mua BĐS" -> Server từ chối vì `room.phase !== TurnPhase.ActionPhase`, trả về lỗi `{ type: 'ERROR', reasonCode: 'INTENT_REJECTED' }`.
4. **Nguy cơ Đóng Sớm Modal Vòng Xoay tại `apply_delta.ts` (Stage A Griller Finding):**
   - Khi server chuyển sang `ActionPhase`, nếu `apply_delta.ts` không miễn trừ `transit_wheel` trong `ActionPhase`, modal sẽ bị đóng tức thì tại 0ms, làm đứt gãy trải nghiệm quay đĩa 3.5s.
5. **Rò rỉ Quân cờ mồ côi `pendingPawnMove` khi AFK Timeout (Stage B Challenger Finding):**
   - Nếu người chơi hết giờ lượt chơi khi đang mở đĩa xoay, `apply_delta.ts` đóng modal nhưng quên dọn `pendingPawnMove`, gây hiệu ứng bóng ma quân cờ bay lạc vào lượt của người chơi sau.
6. **Mất Sự Kiện Ngoại Giao Tại Bước Nhảy Thứ Hai (Stage B Challenger Finding):**
   - Khi kích hoạt thẻ Ngoại Giao tại bước nhảy thứ 2, server không phát `room.lastDiplomaticEvent`, làm câm lặng hiệu ứng cờ hòa bình.
7. **Báo Lỗi Giả Khi Quay Trúng Hoãn Chuyến / Hoàn Tiền (Stage B Challenger Finding):**
   - Nút hành động ghi cứng "Tiếp Tục Di Chuyển Đến Ô Mới" khiến người chơi tưởng con cờ bị đơ khi kết quả là giữ nguyên vị trí.

### 2.2. Sơ đồ Kiến trúc Đã Sửa Chữa (Corrected State Architecture)

```
[Đổ Xúc Xắc] ──► [Server Delta: targetCell, ActionPhase]
                        │
                        ▼
          [3D Pawn nhảy từng ô (3-5s)]
          • isPawnBusyMoving = true
          • isStandingOnBuyable = FALSE (Khóa chặt dock)
                        │
                        ▼
          [Quân cờ chạm đất ô đích: completePawnMove()]
          • isPawnBusyMoving = false
          • executeCellLanding() kiểm tra modal:
            - Nếu không phải ô đang xem: Mở modal Mua Đất (1 lần duy nhất)
                        │
                        ▼
          [Người chơi bấm Mua BĐS (ô 15)]
          • submittingRef.current = true (chống click đúp 0ms)
          • Server: Mua thành công ──► Mở Vòng Xoay Hành Trình
                        │
                        ▼
          [Quay Vòng Xoay ──► Kết quả: NEXT_PORT (ô 25)]
          • Server: resolveSecondHopLanding()
            - landing.result === Unowned ──► room.phase = TurnPhase.ActionPhase!
            - landing.diplomaticCardUsed ──► room.lastDiplomaticEvent sync!
          • Client apply_delta: Giữ modal transit_wheel trong ActionPhase
          • Nút bấm UI: Phân nhánh động ("Ở Lại Trạm" vs "Đi Đến Ô Mới")
                        │
                        ▼
          [Quân cờ bay sang ô 25]
          • Mở Modal Mua Đất ô 25
          • Người chơi bấm Mua BĐS ô 25 ──► HỢP LỆ & THÀNH CÔNG 100%!
```

---

## 3. STATION 1: BỘ KIỂM THỬ HỢP ĐỒNG (QA MANDATE & 5-FACET MATRIX)

**Tệp kiểm thử hợp đồng:** `tests/contracts/imp249_pawn_pacing_and_transit_hop_affordance.test.ts` (Tạo mới, sàn >= 22 atomic tests).

- **Facet 1: Khóa Nhịp Độ Quân Cờ 3D & Action Dock (Pawn Pacing Lock)**
  - `[UC-IMP249/A1] [TC-IMP249.01]`: `isStandingOnBuyable` trả về `false` khi `isPawnMoving === true` ngay cả khi `turnPhase === ActionPhase` và ô đất chưa có chủ.
  - `[UC-IMP249/A2] [TC-IMP249.02]`: `isStandingOnBuyable` trả về `false` khi `isRolling === true`.
  - `[UC-IMP249/A3] [TC-IMP249.03]`: `isStandingOnBuyable` trả về `false` khi `activePawnAnimation !== null`.
  - `[UC-IMP249/MSS] [TC-IMP249.04]`: `isStandingOnBuyable` chuyển thành `true` ngay khi `isPawnMoving === false` và quân cờ đã chạm đất ô đất trống trong `ActionPhase`.
- **Facet 2: Chống Mở Đúp Modal Hạ Cánh (Duplicate Modal Suppression)**
  - `[UC-IMP249/A4] [TC-IMP249.05]`: `executeCellLanding` không mở lại modal `deed` nếu đang mở modal `deed` của chính ô đó (`cellIndex === targetCell`).
  - `[UC-IMP249/A5] [TC-IMP249.06]`: `executeCellLanding` không mở đè modal `deed` nếu `activeModal === 'transit_wheel'`.
  - `[UC-IMP249/MSS] [TC-IMP249.07]`: `executeCellLanding` mở modal `deed` của ô đích nếu người chơi đang mở xem một ô đất khác (`cellIndex !== targetCell`).
- **Facet 3: Khóa Nguyên Tử Đang Gửi (Buy Button Submitting Mutex)**
  - `[UC-IMP249/MSS] [TC-IMP249.08]`: Trong `DeedModalHost`, bấm `onBuy` lần đầu kích hoạt `onIntent`, các lần click liên tiếp ngay sau đó bị chặn khi `submittingRef.current === true`.
  - `[UC-IMP249/A6] [TC-IMP249.09]`: `canBuy` truyền xuống `TitleDeedModal` bị vô hiệu hóa khi `isSubmitting === true`.
- **Facet 4: Chuẩn Hóa FSM Bước Nhảy Thứ Hai & Sự Kiện Ngoại Giao (Second-Hop FSM & Diplomatic Event)**
  - `[UC-IMP249/MSS] [TC-IMP249.10]`: Khi quay trúng `NEXT_PORT` nhảy sang ô 25 chưa có chủ, `resolveSecondHopLanding` chuyển `room.phase = TurnPhase.ActionPhase`.
  - `[UC-IMP249/MSS] [TC-IMP249.11]`: Khi quay trúng `SPEED_BOOST` nhảy sang ô đất trống chưa có chủ, `resolveSecondHopLanding` chuyển `room.phase = TurnPhase.ActionPhase`.
  - `[UC-IMP249/MSS] [TC-IMP249.12]`: Sau khi bước nhảy thứ hai chuyển sang `ActionPhase`, người chơi gọi `handleBuyProperty` tại ô mới thành công mua đất (`BuyResult.Success`).
  - `[UC-IMP249/A7] [TC-IMP249.13]`: Tại bước nhảy thứ hai, nếu ô đất đã có chủ, người chơi nộp tiền thuê và `room.phase` giữ nguyên ở `TurnPhase.PropertyManagement`.
  - `[UC-IMP249/A8] [TC-IMP249.14]`: Nếu thị trường đang đóng băng giao dịch (`MC_FREEZE_TRADE`), bước nhảy thứ hai không chuyển sang `ActionPhase`.
  - `[UC-IMP249/A9] [TC-IMP249.15]`: Mua đất thành công tại bước nhảy thứ hai không kích hoạt đệ quy vòng xoay lần 2 vì `hasSpunTransitThisTurn === true`.
  - `[UC-IMP249/A10] [TC-IMP249.21]`: Tại bước nhảy thứ hai, nếu kích hoạt thẻ Ngoại Giao miễn tiền thuê, `resolveSecondHopLanding` gán chuẩn xác `room.lastDiplomaticEvent`.
  - `[UC-IMP249/A14] [TC-IMP249.23]`: Tại bước nhảy thứ hai rơi vào ô Cơ Hội, `resolveSecondHopLanding` tiêu thụ luồng `deckRng` độc lập không làm ô nhiễm `rng`.
- **Facet 5: Chỉ Dẫn UX, Bản Đồ Lỗi & Dọn Dẹp Trạng Thái (UX Guidance, Error Mapping & Teardown)**
  - `[UC-IMP249/MSS] [TC-IMP249.16]`: Action dock kích hoạt `shouldPulseEndTurn === true` khi đã đổ xúc xắc, không thể mua đất và quân cờ đã dừng lại.
  - `[UC-IMP249/MSS] [TC-IMP249.17]`: `formatServerErrorMessage('INTENT_REJECTED')` trả về thông báo tiếng Việt có nghĩa và hành động chỉ dẫn rõ ràng.
  - `[UC-IMP249/A11] [TC-IMP249.18]`: `apply_delta` không đóng modal `transit_wheel` khi `delta.turnPhase === TurnPhase.ActionPhase`.
  - `[UC-IMP249/A12] [TC-IMP249.19]`: Action dock không nhấp nháy đèn xanh `shouldPulseEndTurn` trong `AuctionPhase` hoặc `HosePhase`.
  - `[UC-IMP249/MSS] [TC-IMP249.20]`: Nút bấm tại `TransitWheelModal` hiển thị `"Xác Nhận & Ở Lại Trạm"` khi quay trúng `CASH_BACK` hoặc `FLIGHT_DELAY`.
  - `[UC-IMP249/A13] [TC-IMP249.22]`: Khi cưỡng chế đóng modal `transit_wheel` do đổi pha/hết giờ, `apply_delta` giải phóng hoàn toàn `pendingPawnMove = null`.

---

## 4. CHI TIẾT CÁC ĐOẠN MÃ THAY THẾ (CONCRETE DROP-IN SNIPPETS)

### Task 1: Khóa Tương Tác Action Dock Khi Quân Cờ 3D Đang Di Chuyển & Kích Hoạt Đèn Báo Kết Thúc Lượt Hợp Lệ
**Target physical file**: `src/client/ui/action_dock.tsx`  
*Inside component `ActionDock`*:

```typescript
<<<<
  const isStandingOnBuyable = Boolean(
    isMyTurn &&
    (turnPhase === TurnPhase.ActionPhase || (hasRolledThisTurn && turnPhase !== TurnPhase.PropertyManagement && turnPhase !== TurnPhase.AuctionPhase && turnPhase !== TurnPhase.InsolvencyPhase)) &&
    isPropertyCell &&
    !isOwnedByAnyone &&
    !isTradeFrozen
  );
  const handleOpenManageProperty = () => {
    if (onOpenManageProperty) onOpenManageProperty();
    else if (onOpenProperties) onOpenProperties();
    else openModal('portfolio', { playerId: actingPlayerId ?? undefined });
  };

  const handleOpenTrade = () => {
    if (onOpenTrade) onOpenTrade();
    else {
      const otherId = Object.keys(playersInfo).find((id) => id !== actingPlayerId) ?? 'p2';
      openModal('trade', { targetPlayerId: otherId, offeredProperties: [], requestedProperties: [], cashOffer: 0, cashRequest: 0 });
    }
  };
  const isSkippedTurn = Boolean(isMyTurn && turnPhase === 'PropertyManagement' && !hasRolledThisTurn && !inAudit);
  const isAuditEndTurnActive = Boolean(isMyTurn && inAudit && hasRolledThisTurn && !canRollAgain);
  const shouldPulseEndTurn = isSkippedTurn || isAuditEndTurnActive;
====
  const isPawnBusyMoving = Boolean(isPawnMoving || isRolling || activePawnAnimation);
  const isStandingOnBuyable = Boolean(
    isMyTurn &&
    !isPawnBusyMoving &&
    (turnPhase === TurnPhase.ActionPhase || (hasRolledThisTurn && turnPhase !== TurnPhase.PropertyManagement && turnPhase !== TurnPhase.AuctionPhase && turnPhase !== TurnPhase.InsolvencyPhase)) &&
    isPropertyCell &&
    !isOwnedByAnyone &&
    !isTradeFrozen
  );
  const handleOpenManageProperty = () => {
    if (onOpenManageProperty) onOpenManageProperty();
    else if (onOpenProperties) onOpenProperties();
    else openModal('portfolio', { playerId: actingPlayerId ?? undefined });
  };

  const handleOpenTrade = () => {
    if (onOpenTrade) onOpenTrade();
    else {
      const otherId = Object.keys(playersInfo).find((id) => id !== actingPlayerId) ?? 'p2';
      openModal('trade', { targetPlayerId: otherId, offeredProperties: [], requestedProperties: [], cashOffer: 0, cashRequest: 0 });
    }
  };
  const isSkippedTurn = Boolean(isMyTurn && turnPhase === 'PropertyManagement' && !hasRolledThisTurn && !inAudit);
  const isAuditEndTurnActive = Boolean(isMyTurn && inAudit && hasRolledThisTurn && !canRollAgain);
  const isDoneRollingAndNoBuy = Boolean(
    isMyTurn &&
    hasRolledThisTurn &&
    !canRollAgain &&
    !isStandingOnBuyable &&
    !isPawnBusyMoving &&
    !isInsolvent &&
    !isBankrupt &&
    turnPhase !== TurnPhase.AuctionPhase &&
    turnPhase !== TurnPhase.HosePhase
  );
  const shouldPulseEndTurn = isSkippedTurn || isAuditEndTurnActive || isDoneRollingAndNoBuy;
>>>>
```

---

### Task 2: Chống Mở Đúp Modal Tại Điểm Hạ Cánh Quân Cờ
**Target physical file**: `src/client/offline_landing.ts`  
*Inside function `executeCellLanding`*:

```typescript
<<<<
  if (tile.type === CellType.Property || tile.type === CellType.Railroad || tile.type === CellType.Utility) {
    const ownerEntry = Object.entries(state.playersInfo).find(([_, p]) =>
      p.ownedProperties?.includes(targetCell)
    );
    if (!ownerEntry) {
      if (isLocal) {
        state.openModal('deed', { cellIndex: targetCell, isBuyOpportunity: true });
      }
    } else if (ownerEntry[0] !== activeId) {
====
  if (tile.type === CellType.Property || tile.type === CellType.Railroad || tile.type === CellType.Utility) {
    const ownerEntry = Object.entries(state.playersInfo).find(([_, p]) =>
      p.ownedProperties?.includes(targetCell)
    );
    if (!ownerEntry) {
      const currentPayload = state.modalPayload as { cellIndex?: number } | null;
      const isViewingCurrentDeed = state.activeModal === 'deed' && currentPayload?.cellIndex === targetCell;
      if (isLocal && !isViewingCurrentDeed && state.activeModal !== 'transit_wheel') {
        state.openModal('deed', { cellIndex: targetCell, isBuyOpportunity: true });
      }
    } else if (ownerEntry[0] !== activeId) {
>>>>
```

---

### Task 3: Bổ Sung Cờ isSubmitting & submittingRef Khóa Click Đúp Nút Mua BĐS
**Target physical file**: `src/client/ui/modals/hosts/deed_modal_host.tsx`  
*Inside component `DeedModalHost`*:

```typescript
<<<<
export function DeedModalHost({
====
export function DeedModalHost({
  payload,
>>>>
```

```typescript
<<<<
  const deedState = resolveTitleDeedModalState({
====
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const submittingRef = React.useRef(false);
  const deedState = resolveTitleDeedModalState({
>>>>
```

```typescript
<<<<
  return (
    <TitleDeedModal
      cellIndex={payload.cellIndex}
      canBuy={deedState.canBuy}
====
  return (
    <TitleDeedModal
      cellIndex={payload.cellIndex}
      canBuy={deedState.canBuy && !isSubmitting}
>>>>
```

```typescript
<<<<
      buyerBalance={myPlayer?.balance ?? 0}
      buyerId={myId}
      allPlayers={playersInfo}
      onBuy={() => {
        AudioEngine.playSfx(SoundEffect.BUY_PROPERTY);
        onIntent?.({ type: 'INTENT_BUY_PROPERTY' });
        closeModal();
      }}
      onUpgrade={() => {
====
      buyerBalance={myPlayer?.balance ?? 0}
      buyerId={myId}
      allPlayers={playersInfo}
      onBuy={() => {
        if (submittingRef.current || isSubmitting) return;
        submittingRef.current = true;
        setIsSubmitting(true);
        AudioEngine.playSfx(SoundEffect.BUY_PROPERTY);
        onIntent?.({ type: 'INTENT_BUY_PROPERTY' });
        closeModal();
      }}
      onUpgrade={() => {
>>>>
```

---

### Task 4: Chuẩn Hóa FSM Cho Phép Mua BĐS & Đồng Bộ Sự Kiện Ngoại Giao Tại Bước Nhảy Thứ Hai
**Target physical file**: `src/server/transit_wheel_handler.ts`  
*Inside imports*:

```typescript
<<<<
import { handleSpecialCell } from './special_cell_handler.js';
import { handleLanding, type PropertyRegistry, type PropertyStateMap } from '../domain/property_manager.js';
import { checkInsolvency } from './insolvency_manager.js';
====
import { handleSpecialCell } from './special_cell_handler.js';
import { handleLanding, LandingResult, type PropertyRegistry, type PropertyStateMap } from '../domain/property_manager.js';
import { checkInsolvency } from './insolvency_manager.js';
import { MarketCardId } from '../domain/event_card_types.js';
>>>>
```

*Inside function `resolveSecondHopLanding`*:

```typescript
<<<<
  handleLanding(
    current,
    targetCell,
    reg,
    room.players,
    sm,
    0, // Second hop không tính xúc xắc cho tiện ích
    room.activeModifiers,
    rng,
    room.chanceDiscard,
    room.permanentRentBonus,
    room.roundCount,
    room,
  );

  if (current.balance < 0) {
    const landlordId = reg.get(targetCell);
    checkInsolvency(room, landlordId);
  }
====
  const landing = handleLanding(
    current,
    targetCell,
    reg,
    room.players,
    sm,
    0, // Second hop không tính xúc xắc cho tiện ích
    room.activeModifiers,
    rng,
    room.chanceDiscard,
    room.permanentRentBonus,
    room.roundCount,
    room,
  );

  if (landing.diplomaticCardUsed) {
    room.lastDiplomaticEvent = {
      playerId: current.id,
      landlordId: landing.landlordId ?? '',
      cellIndex: targetCell,
      savedRent: landing.savedRentAmount ?? 0,
    };
  }

  const tradeFrozen = (room.activeModifiers ?? []).some(
    (m) => m.type === MarketCardId.MC_FREEZE_TRADE && m.remainingRounds > 0,
  );
  if (landing.result === LandingResult.Unowned && !tradeFrozen) {
    room.phase = TurnPhase.ActionPhase;
  }

  if (current.balance < 0) {
    const landlordId = reg.get(targetCell);
    checkInsolvency(room, landlordId);
  }
>>>>
```

---

### Task 5: Cải Thiện Chỉ Dẫn Kết Quả Vòng Xoay Hành Trình Phân Nhánh Động
**Target physical file**: `src/client/ui/modals/transit_wheel_modal.tsx`  
*Inside component `TransitWheelModal` (khai báo biến)*:

```typescript
<<<<
  const activeConfig = TRANSIT_WHEEL_CONFIGS.find((c) => c.outcome === outcome);
====
  const activeConfig = TRANSIT_WHEEL_CONFIGS.find((c) => c.outcome === outcome);
  const isStationaryOutcome = outcome === TransitWheelOutcome.CASH_BACK || outcome === TransitWheelOutcome.FLIGHT_DELAY;
  const dismissButtonText = isStationaryOutcome ? 'Xác Nhận & Ở Lại Trạm' : 'Tiếp Tục Di Chuyển Đến Ô Mới';
>>>>
```

*Inside component `TransitWheelModal` (khối nút bấm)*:

```typescript
<<<<
        ) : hasFinished ? (
          <button
            onClick={handleDismiss}
            className="w-full min-h-[44px] py-3 bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold rounded-xl border border-amber-500/40 active:scale-95 transition-all text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Tiếp Tục Di Chuyển
          </button>
        ) : (
====
        ) : hasFinished ? (
          <button
            onClick={handleDismiss}
            className="w-full min-h-[44px] py-3 bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold rounded-xl border border-amber-500/40 active:scale-95 transition-all text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            {dismissButtonText}
          </button>
        ) : (
>>>>
```

---

### Task 6: Định Nghĩa Thông Báo Lỗi Trực Quan & Alias Cho INTENT_REJECTED
**Target physical file**: `src/client/ui/actionable_notification.ts`  
*Inside `ACTIONABLE_NOTIFICATIONS_MAP`*:

```typescript
<<<<
  HIGHEST_BIDDER_CANNOT_PASS: {
    icon: '👑',
    title: 'Đang Dẫn Đầu Đấu Giá',
    description: 'Bạn đang là người trả giá cao nhất nên không thể rút lui khỏi phiên đấu giá.',
    tone: 'info',
    actionHint: 'Bạn có thể nhấn "✕ Đóng / Xem Bàn Cờ" để tạm ẩn và theo dõi trận đấu.',
  },
};
====
  HIGHEST_BIDDER_CANNOT_PASS: {
    icon: '👑',
    title: 'Đang Dẫn Đầu Đấu Giá',
    description: 'Bạn đang là người trả giá cao nhất nên không thể rút lui khỏi phiên đấu giá.',
    tone: 'info',
    actionHint: 'Bạn có thể nhấn "✕ Đóng / Xem Bàn Cờ" để tạm ẩn và theo dõi trận đấu.',
  },
  INTENT_REJECTED: {
    icon: '⚠️',
    title: 'Hành Động Chưa Thể Thực Hiện',
    description: 'Thao tác không phù hợp với giai đoạn lượt chơi hiện tại hoặc tài sản không khả dụng.',
    tone: 'warning',
    actionHint: 'Vui lòng kiểm tra trạng thái lượt chơi hoặc bấm Kết Thúc Lượt.',
  },
};
>>>>
```

*Inside alias registry*:

```typescript
<<<<
ACTIONABLE_NOTIFICATIONS_MAP['highest_bidder_cannot_pass'] = ACTIONABLE_NOTIFICATIONS_MAP['HIGHEST_BIDDER_CANNOT_PASS']!;
ACTIONABLE_NOTIFICATIONS_MAP['HighestBidderCannotPass'] = ACTIONABLE_NOTIFICATIONS_MAP['HIGHEST_BIDDER_CANNOT_PASS']!;
====
ACTIONABLE_NOTIFICATIONS_MAP['highest_bidder_cannot_pass'] = ACTIONABLE_NOTIFICATIONS_MAP['HIGHEST_BIDDER_CANNOT_PASS']!;
ACTIONABLE_NOTIFICATIONS_MAP['HighestBidderCannotPass'] = ACTIONABLE_NOTIFICATIONS_MAP['HIGHEST_BIDDER_CANNOT_PASS']!;
ACTIONABLE_NOTIFICATIONS_MAP['intent_rejected'] = ACTIONABLE_NOTIFICATIONS_MAP['INTENT_REJECTED']!;
ACTIONABLE_NOTIFICATIONS_MAP['IntentRejected'] = ACTIONABLE_NOTIFICATIONS_MAP['INTENT_REJECTED']!;
>>>>
```

---

### Task 7: Bảo Vệ Vòng Đời Modal Vòng Xoay Trong ActionPhase & Dọn Dẹp Quân Cờ Chờ Khi AFK Timeout
**Target physical file**: `src/client/network/apply_delta.ts`  
*Inside function `syncOtherModals`*:

```typescript
<<<<
    } else if (state.activeModal === 'transit_wheel' && delta.turnPhase !== TurnPhase.PropertyManagement) {
      state.closeModal();
    }
====
    } else if (state.activeModal === 'transit_wheel' && delta.turnPhase !== TurnPhase.PropertyManagement && delta.turnPhase !== TurnPhase.ActionPhase) {
      state.setPendingPawnMove?.(null);
      state.closeModal();
    }
>>>>
```

---

## 5. TIÊU CHUẨN HOÀN THÀNH (DEFINITION OF DONE)

1. **Bộ kiểm thử Station 1**: File `tests/contracts/imp249_pawn_pacing_and_transit_hop_affordance.test.ts` đạt tối thiểu 22 atomic tests, bao phủ 100% 5 Facet, 100% PASS.
2. **Ngân sách mã nguồn**: Tất cả các file sửa đổi tuân thủ nghiêm ngặt trần dòng mã (Tier 1 <= 400 LOC, Tier 2 <= 500 LOC). `property_actions.ts` giữ nguyên 390 LOC không bị xâm phạm.
3. **Phê duyệt độc lập Trạm 3**:
   - Phase 3.0: Physical Visual Evidence Gate chụp ảnh giao diện xác nhận hiệu ứng nhấp nháy "Kết Thúc Lượt" và modal affordance.
   - Phase 3.1 `spec-reviewer`: Đạt 100% khớp đặc tả kế hoạch.
   - Phase 3.2 `code-reviewer`: Đạt tiêu chuẩn cấu trúc sâu, không memory leak.
4. **Trạm 4 (`chaos-sentinel`)**: Ký chứng nhận `.agents/evidence/chaos_sentinel_IMP-249.json` với 3 probe vật lý và tối thiểu 14 targeted mutants killed.
5. **Báo cáo hoàn thành**: Tạo file `docs/reports/improvements/IMP-249-pawn-pacing-and-transit-hop-affordance_report.md` đầy đủ 5 mục theo Hiến chương GEMINI.md.

---

## 6. SỔ CÁI NỢ KỸ THUẬT (TECH DEBT LEDGER)

- **TD-IMP249-01**: `src/client/network/apply_delta.ts` (344 LOC > 300 LOC Tier 1). Delta trong ticket này bằng +1 dòng (Post 345 LOC). Cần lên kế hoạch trích xuất các hàm `syncTurnAndTimer`, `syncOtherModals` sang module riêng trong đợt refactoring tiếp theo khi chạm vào file này.
- **TD-IMP249-02**: `src/server/property_actions.ts` (390 LOC). Đang ở mức báo động đỏ (cách trần 400 LOC đúng 10 dòng). Ticket này bảo toàn 100% không chạm vào file này. Bất kỳ ticket tương lai nào cần mở rộng property actions bắt buộc phải thực hiện Task 1 trích xuất submodule trước khi viết thêm code.
