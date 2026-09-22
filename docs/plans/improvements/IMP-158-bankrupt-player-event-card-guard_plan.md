# [PLAN] IMP-158: Bankrupt Player Event Card Isolation & Treasury Integrity Guards

> **Ticket**: IMP-158  
> **Type**: Bugfix / Domain Logic / Economy & Treasury Hardening  
> **Status**: Ready for Approval (Plan-Grilled: All 6 P1/P2 findings integrated)  
> **Traceability**: `docs/requirements.md §V (DANH MỤC CHI TIẾT CÁC THẺ SỰ KIỆN)`, ADR-0001  
> **Risk Tier**: Tier 2 (Finance/Domain Logic — 3-Station Pipeline: RED -> GREEN -> Station 3 Audit)

---

## 1. BỐI CẢNH & PHÂN TÍCH VẤN ĐỀ

Trong các ván cờ nhiều người chơi (3-4 người), khi có người chơi phá sản (`player.bankrupt === true`), hệ thống sự kiện rút thẻ Cơ Hội (`chance_card_handlers.ts`), Thị Trường (`market_card_handlers.ts`) và Mua lại cưỡng chế (`compulsory_buyout.ts`) hiện đang tương tác với người đã phá sản.

Báo cáo Plan Grilling (`.agents/audit/PLAN_AUDIT_IMP158.md`) đã xác định **7 bề mặt tấn công / lỗ hổng logic** nghiêm trọng:

| STT | Hàm / Thẻ | File & Vị trí | Lỗ hổng & Hậu quả |
|---|---|---|---|
| **1** | `handleContractPenalty`<br>(`CC_CONTRACT_PENALTY`) | `chance_card_handlers.ts:40-49, 213` | `CHANCE_HANDLERS` nuốt mất `room` (dòng 213); `opponents` không lọc `!p.bankrupt`. Tiền bồi thường 1.000 Tr. chuyển cho người chết. Khi tất cả đối thủ chết, tiền biến mất thay vì nộp Kho Bạc do thiếu context `room`. |
| **2** | `handleFranchise`<br>(`CC_FRANCHISE`) | `chance_card_handlers.ts:51-58` | Duyệt mọi `p of players` không kiểm tra `!p.bankrupt`. Trừ tiền người chết và cộng cho người rút thẻ ➔ Tự sinh "tiền ma" (in lậu tiền từ hư không). |
| **3** | `handleMegaConcert`<br>(`MC_MEGA_CONCERT`) | `market_card_handlers.ts:21-49` | (a) Chọn ô của người chết làm venue tổ chức nhạc hội, tước doanh thu của người sống. (b) Kéo toạ độ người chết về venue (`player.position = targetCell`). (c) Trừ tiền thuê của người chết. |
| **4** | `handleCasinoPilot` & `awardServiceBonus`<br>(`MC_CASINO_PILOT`) | `market_card_handlers.ts:97-145` | (a) `awardServiceBonus` chuyển 1.500–3.000 Tr. cho chủ đất đã phá sản và rút ruột Kho Bạc. (b) Fallback `poorest` chuyển 1.000 Tr. cho người chết. |
| **5** | `handlePublicInvest`<br>(`MC_PUBLIC_INVEST`) | `market_card_handlers.ts:59-75` | Phát 400 Tr. kích cầu + 1.000 Tr./ô hạ tầng cho mọi người trong `players` ➔ Kho Bạc bị rút ruột (`totalDisbursed`) trả cho người chết. |
| **6** | `distributeCellPool`<br>(`MC_NIGHT_ECONOMY`, `MC_FUEL_SURGE`, `MC_UTILITY_DOUBLE`) | `market_card_handlers.ts:147-167` | (a) Trừ `perPlayerFee` của cả người chết. (b) `players.length` tính cả người chết ➔ Pool phình to ảo ➔ Kho Bạc / chủ đất nhận tiền chênh lệch ma. (c) Phải giữ guard `if (!players \|\| players.length === 0) return;` trước khi lọc để tránh crash test client không truyền players. |
| **7** | `handleFireInspection`<br>(`MC_FIRE_INSPECTION`) | `market_card_handlers.ts:183-199` | Phạt PCCC các công trình của người đã phá sản và nộp tiền phạt ma vào Kho Bạc. |
| **8** | `isEligibleForCompulsoryBuyout` & `handleMaForce`<br>(`CC_SWAP_PROJECT`, `CC_MA_FORCE`) | `compulsory_buyout.ts:31`, `chance_card_handlers.ts:99` | `CC_SWAP_PROJECT` tạo `pendingBuyout` với người chết làm treo FSM 15s. `handleMaForce` mua đất và chuyển tiền cho seller đã phá sản. |

---

## 2. GIẢI PHÁP KỸ THUẬT (SSOT & INVARIANTS)

1. **Nguyên tắc cô lập người chơi phá sản (Bankrupt Isolation Invariant)**:
   - Người chơi đã phá sản (`p.bankrupt === true`) hoàn toàn bất động và cách ly tài chính.
   - Không nhận tiền, không trả tiền, không đổi vị trí bàn cờ, không tham gia tính pool hay venue.

2. **Quy chuẩn mã nguồn cụ thể**:
   - **`chance_card_handlers.ts`**:
     ```ts
     function handleContractPenalty(player: Player, players: Player[], room?: Room): void {
       player.balance -= 1000;
       const opponents = players.filter((p) => p.id !== player.id && !p.bankrupt);
       if (opponents.length === 0) {
         if (room) room.treasury = (room.treasury ?? 0) + 1000;
         return;
       }
       let poorest = opponents[0]!;
       for (let i = 1; i < opponents.length; i++) {
         if (opponents[i]!.balance < poorest.balance) poorest = opponents[i]!;
       }
       poorest.balance += 1000;
     }
     ```
     Cập nhật lambda đăng ký handler:
     ```ts
     [ChanceCardId.CC_CONTRACT_PENALTY]: (player, players, _id, _mods, _reg, _sm, _bonus, room) =>
       handleContractPenalty(player, players, room),
     ```
     Trong `handleFranchise`:
     ```ts
     function handleFranchise(player: Player, players: Player[]): void {
       for (const p of players) {
         if (p.id !== player.id && !p.bankrupt) {
           p.balance -= 800;
           player.balance += 800;
         }
       }
     }
     ```
     Trong `handleMaForce`: Bỏ qua seller nếu seller đã phá sản (`seller.bankrupt === true`).

   - **`market_card_handlers.ts`**:
     - `handleMegaConcert`:
       - Chọn venue: Chỉ xét các ô mà chủ sở hữu còn sống (`const owner = players.find(p => p.id === ownerId && !p.bankrupt)`).
       - Di chuyển & thu tiền thuê: Chỉ áp dụng cho `alivePlayers = players.filter(p => !p.bankrupt)`.
     - `awardServiceBonus`:
       - Thêm guard `const owner = players.find((p) => p.id === ownerId && !p.bankrupt); if (!owner) return 0;`.
     - `handleCasinoPilot`:
       - Duyệt `awardServiceBonus` trên `alivePlayers`.
       - Fallback `poorest`: tìm trên `alivePlayers`. Nếu `alivePlayers.length === 0`, return sớm.
     - `handlePublicInvest`:
       - Lọc `const alivePlayers = players.filter((p) => !p.bankrupt);`. Chỉ giải ngân cho `alivePlayers`.
     - `distributeCellPool`:
       - Giữ nguyên guard an toàn: `if (!players || players.length === 0) return;`.
       - Lọc `const alivePlayers = players.filter((p) => !p.bankrupt); if (alivePlayers.length === 0) return;`.
       - `poolPerCell = cellDividend * alivePlayers.length;`.
       - Chỉ người sống bị trừ `perPlayerFee`, chủ đất nhận thưởng phải là người sống (`alivePlayers.find(p => p.id === ownerId)`).
     - `handleFireInspection`:
       - Lọc `const alivePlayers = players.filter((p) => !p.bankrupt);`. Chỉ tính phạt và trừ tiền của `alivePlayers`.
     - `handleCoastalStormDamage` & `handleAntiSpeculate`:
       - Lọc `const alivePlayers = players.filter((p) => !p.bankrupt);`.

   - **`compulsory_buyout.ts`**:
     ```ts
     const owner = room?.players.find((p) => p.id === ownerId) ?? players?.find((p) => p.id === ownerId);
     if (owner?.bankrupt) return false;
     ```

---

## 3. PRE-FLIGHT BLAST RADIUS AUDIT

- **Risk Level**: Slice-Bound (Ảnh hưởng đến kết quả tính toán số dư người chơi, Kho Bạc và trạng thái FSM khi có người phá sản).
- **Direct Touch**:
  - `src/domain/chance_card_handlers.ts`
  - `src/domain/market_card_handlers.ts`
  - `src/domain/compulsory_buyout.ts`
- **Downstream Consumers**:
  - `turn_loop.ts`, `special_cell_handler.ts`, `card_handlers_full.test.ts`.
- **Worst-Case Defense**:
  - Khi không có người chơi nào phá sản (`bankrupt: false`), logic hoạt động 100% đồng nhất với hiện tại.
  - Khi `players` là `undefined` (gọi từ client mod ticker/visual), guard `if (!players || players.length === 0) return;` bảo vệ tuyệt đối không gây runtime crash.

---

## 4. KẾ HOẠCH KIỂM THỬ (TEST MATRIX - STATION 1)

File test mới: `tests/domain/imp158_bankrupt_player_event_card_guards.test.ts`
Số lượng test tối thiểu: >= 18 atomic tests theo 4-Facet Matrix:

1. **Boundary (Biên)**:
   - `TC-IMP158.01`: `CC_CONTRACT_PENALTY` khi tất cả đối thủ đều phá sản ➔ 1.000 Tr. nộp vào Kho Bạc qua `room.treasury`.
   - `TC-IMP158.02`: `CC_FRANCHISE` khi tất cả đối thủ đều phá sản ➔ người rút thẻ nhận 0 Tr., không ai bị trừ tiền.
   - `TC-IMP158.03`: `distributeCellPool` khi `players` là `undefined` hoặc `[]` ➔ thoát an toàn, không crash.
   - `TC-IMP158.04`: `handleCasinoPilot` khi tất cả người chơi đều phá sản ➔ không giải ngân kích cầu, không rút Kho Bạc.
   - `TC-IMP158.05`: `isEligibleForCompulsoryBuyout` trả về `false` nếu chủ đất `owner.bankrupt === true`.

2. **Reactivity (Phản ứng dòng tiền & vị trí)**:
   - `TC-IMP158.06`: `CC_CONTRACT_PENALTY` bàn 3 người (1 người sống 5.000 Tr., 1 người chết 0 Tr.) ➔ người sống nhận 1.000 Tr., người chết không nhận.
   - `TC-IMP158.07`: `CC_FRANCHISE` bàn 4 người (1 người rút, 1 người sống, 2 người chết) ➔ người rút chỉ thu được 800 Tr. từ người sống.
   - `TC-IMP158.08`: `MC_MEGA_CONCERT` người chết không bị đổi toạ độ `position`.
   - `TC-IMP158.09`: `MC_MEGA_CONCERT` người chết không bị trừ tiền thuê trả cho chủ đất.
   - `TC-IMP158.10`: `MC_MEGA_CONCERT` không chọn ô C3 của người chết làm venue nếu có ô C1 của người sống.
   - `TC-IMP158.11`: `MC_PUBLIC_INVEST` chỉ phát 400 Tr. cho người sống, Kho Bạc chỉ trừ đúng số tiền phát cho người sống.
   - `TC-IMP158.12`: `MC_PUBLIC_INVEST` người chết có ô hạ tầng không được nhận 1.000 Tr./ô, Kho Bạc không bị drain.
   - `TC-IMP158.13`: `distributeCellPool` pool tính theo `alivePlayers.length`, người chết không bị trừ `perPlayerFee`.
   - `TC-IMP158.14`: `distributeCellPool` chủ đất chết không nhận tiền pool ➔ tiền pool nộp vào Kho Bạc.
   - `TC-IMP158.15`: `handleCasinoPilot` tìm `poorest` trong số người sống, người chết không nhận 1.000 Tr. kích cầu.
   - `TC-IMP158.16`: `handleFireInspection` không phạt người chơi đã phá sản và không nộp tiền phạt ma vào Kho Bạc.

3. **Disposal / Cleanup**:
   - `TC-IMP158.17`: `handleCoastalStormDamage` không trừ tiền của người đã phá sản.
   - `TC-IMP158.18`: `handleAntiSpeculate` không phạt người đã phá sản.
   - `TC-IMP158.19`: `handleMaForce` bỏ qua đất thuộc về seller đã phá sản.

4. **Error Defense**:
   - `TC-IMP158.20`: Gọi `executeChanceCard` và `executeMarketCard` với cấu hình hỗn hợp người sống/chết bảo toàn định luật bảo toàn dòng tiền (Zero Treasury Leaks).
