# KẾ HOẠCH KỸ THUẬT IMP-196 (ĐÃ TIẾP THU TOÀN DIỆN PHẢN BIỆN): MINH BẠCH HIỆU LỰC PHIẾU MIỄN TRỪ NGOẠI GIAO & TRIỆT TIÊU ĐỘ LỆCH THỊ GIÁC XÚC XẮC 3D

> **Ticket**: IMP-196  
> **Tên Cải Tiến**: Diplomatic Immunity Event Pipeline, Hand Synchronization & 3D Dice Isometric Readability Alignment  
> **Phiên Bản**: V2.0 — Đã tiếp thu 100% 5 điểm kiểm toán đĩa cứng từ Người dùng và Plan-Griller  

---

## 1. NGUYÊN NHÂN GỐC RỄ & CÁC ĐIỂM MÙ KIẾN TRÚC ĐÃ KHẮC PHỤC

1. **Khắc phục Zombie Hand Bug & Thiếu Mapper (P1 - Điểm 1)**:
   - Thêm `hand?: readonly ChanceCardId[]` vào `PlayerDelta` interface tại `session_manager.ts#L31-44`.
   - Bổ sung `hand: p.hand ?? []` trong player mapping của `buildDeltaFromRoom` tại `session_manager.ts#L180-193`.
   - `isPlayerEqual` (`delta_broadcaster.ts`) so sánh mảng `hand` theo từng phần tử.
   - Client `OPTIONAL_PLAYER_KEYS` (`apply_delta_players.ts`) và `PlayerHudInfo` (`game_store_types.ts`) cập nhật mảng `hand: p.hand ?? []` ngay khi thẻ bị tiêu thụ để gỡ bỏ icon `🤝` tức thì.
2. **Khắc phục 4 Vị Trí Đồng Thời Của `lastDiplomaticEvent` (P1 - Điểm 2)**:
   - `session_manager.ts`:
     1. Khai báo interface `DiplomaticEventDelta` và thêm `lastDiplomaticEvent?: DiplomaticEventDelta | null` vào `DeltaPayload` (L75).
     2. Thêm `lastDiplomaticEvent?: DiplomaticEventDelta | null` vào `DeltaPayloadOptions` (L246).
     3. Trong `buildDeltaFromRoom`, truyền `lastDiplomaticEvent: room.lastDiplomaticEvent ?? null` vào lời gọi `buildDeltaPayload` (L222).
   - `delta_broadcaster.ts`:
     4. Thêm `...(next.lastDiplomaticEvent !== undefined ? { lastDiplomaticEvent: next.lastDiplomaticEvent } : {})` vào whitelist của `buildSparseDelta` (L86-106).
3. **Chuẩn Hóa Đúng Nơi Định Nghĩa Type `'diplomatic'` (P2 - Điểm 3)**:
   - `FloatingActionType` thuộc `src/client/store/game_store_types.ts#L66-86`. Thêm `'diplomatic'` vào type này tại `game_store_types.ts` trước, sau đó `activity_badge_dispatcher.ts` và `transaction_narrative.ts` mới consume an toàn.
4. **Thứ Tự Tính Toán Tiền Thuê Khả Thi Trong `property_manager.ts` (P2 - Điểm 4)**:
   - `hasZeroRent(...)` giữ nguyên đầu tiên để bảo vệ Gotcha #260 (Bão biển ưu tiên trước, bảo toàn thẻ trên tay).
   - Tiếp theo, tính `baseRent = resolveRent(cell, cellIndex, ownerId, registry, stateMap, diceTotal, undefined, roundCount)`.
   - Áp dụng các modifier (C2 surcharge, permanentRentBonus).
   - Tính toán `const potentialRent = calculateRent(baseRent, cellIndex, modifiers, stateMap);`.
   - Kế tiếp, mới gọi `tryUseDiplomaticCard(player, cellIndex, stateMap, chanceDiscard)`.
   - Nếu `true`: trả về `{ result: LandingResult.RentPaid, rentAmount: 0, landlordId: ownerId, diplomaticCardUsed: true, savedRentAmount: potentialRent }`.
   - Nếu `false`: tiếp tục luồng trừ tiền và cộng cho chủ đất bình thường.
5. **Cập Nhật Baseline LOC Thực Tế (Minor - Điểm 5)**:
   - `player_card.tsx` hiện tại 222 LOC trên đĩa (trần 250 LOC). Dự kiến delta +10 $\rightarrow$ 232 LOC (An toàn).

---

## 2. KIẾN TRÚC DÒNG CHẢY DỮ LIỆU (DATA FLOW DIAGRAM)

```
[Server: executeTurnRoll / handleLanding]
         │
         ├── 1. Gieo xúc xắc: dice = [d1, d2]
         ├── 2. Tính baseRent = resolveRent(...)
         ├── 3. Tính potentialRent = calculateRent(baseRent, ...)
         ├── 4. Kiểm tra CC_DIPLOMATIC:
         │        ├── Dẫm BĐS đối thủ ➔ tryUseDiplomaticCard()
         │        │     ├── player.hand tiêu thụ thẻ ➔ chanceDiscard
         │        │     ├── rentAmount = 0
         │        │     └── Trả về { diplomaticCardUsed: true, savedRentAmount: potentialRent }
         │        └── Gán room.lastDiplomaticEvent = { playerId, landlordId, cellIndex, savedRent }
         │
         └── 5. Broadcast DeltaPayload (Full 4 điểm đồng bộ):
               ├── players: [{ ..., hand: ['CC_DIPLOMATIC'] hoặc [] }]
               ├── lastDiplomaticEvent: { playerId, landlordId, cellIndex, savedRent }
               └── dice: [d1, d2], diceSeq
                     │
                     ▼
[Client: applyDelta / WebSocket]
         │
         ├── [PlayerCard]: Cập nhật hand ➔ Micro-chip [🤝] (16x16px) đè góc avatar
         │
         ├── [ActivityDispatcher & Narrative]:
         │        ├── Người thuê: "Bạn kích hoạt Thẻ Ngoại Giao ➔ Miễn 100% tiền thuê [Ô] (Tiết kiệm [X Tr.])"
         │        ├── Chủ đất: "[Khách] dùng Thẻ Ngoại Giao ➔ Miễn thu tiền thuê [Ô] (Hụt thu [X Tr.])"
         │        └── Dẫm Ga tàu/Tiện ích: "(Thẻ Ngoại Giao được bảo lưu - Không áp dụng cho Hạ tầng/Tiện ích)"
         │
         └── [Dice Visual & HUD]:
                  ├── DiceTray 3D: Group nghiêng 28° về phía camera ➔ Mặt kết quả hướng trực diện mắt
                  └── 2D Dice Score Pill: "🎲 1 + 5 = 6" nổi trên sàn diễn, tự dọn dẹp khi đổi lượt
```

---

## 3. KẾ HOẠCH THI CÔNG CHI TIẾT (TASK BREAKDOWN)

### Giai Đoạn 1: Đồng Bộ Hand & Sự Kiện Miễn Trừ Ngoại Giao (Server & Domain)
- **Nhiệm vụ 1.1**: `src/server/session_manager.ts` & `src/server/network/delta_broadcaster.ts`
  - Thêm `hand?: readonly ChanceCardId[]` vào `PlayerDelta` interface (L31-44).
  - Map `hand: p.hand ?? []` trong `buildDeltaFromRoom` (L180-193).
  - Khai báo `interface DiplomaticEventDelta { readonly playerId: string; readonly landlordId: string; readonly cellIndex: number; readonly savedRent: number; }`.
  - Thêm `lastDiplomaticEvent?: DiplomaticEventDelta | null` vào `DeltaPayload` (L75) và `DeltaPayloadOptions` (L246).
  - Truyền `lastDiplomaticEvent: room.lastDiplomaticEvent ?? null` vào `buildDeltaPayload` trong `buildDeltaFromRoom` (L222).
  - Trong `delta_broadcaster.ts`:
    - `isPlayerEqual`: so sánh mảng `hand` theo từng phần tử.
    - `buildSparseDelta`: thêm `...(next.lastDiplomaticEvent !== undefined ? { lastDiplomaticEvent: next.lastDiplomaticEvent } : {})` (L86-106).
- **Nhiệm vụ 1.2**: `src/domain/property_manager.ts` & `src/server/turn_loop.ts`
  - Trong `property_manager.ts`:
    - Giữ `hasZeroRent` ở đầu.
    - Tính `baseRent = resolveRent(...)` $\rightarrow$ modifier $\rightarrow$ `potentialRent = calculateRent(baseRent, ...)`.
    - Gọi `tryUseDiplomaticCard`: nếu `true` trả về `{ result: LandingResult.RentPaid, rentAmount: 0, landlordId: ownerId, diplomaticCardUsed: true, savedRentAmount: potentialRent }`.
  - Trong `turn_loop.ts`:
    - Nếu `landing.diplomaticCardUsed`: gán `room.lastDiplomaticEvent = { playerId: current.id, landlordId: landing.landlordId!, cellIndex: newPos, savedRent: landing.savedRentAmount! }`.
    - Dọn dẹp `room.lastDiplomaticEvent = null` ở đầu `executeTurnRoll` và trong `executeTurnEnd`.
    - Đảm bảo `turn_loop.ts` <= 290 LOC (hiện 270 LOC).

### Giai Đoạn 2: Xử Lý Phía Client & Giao Diện Huy Hiệu (Store, Dispatcher, HUD)
- **Nhiệm vụ 2.1**: `src/client/store/game_store_types.ts` & `src/client/network/apply_delta_players.ts`
  - Thêm `'diplomatic'` vào `FloatingActionType` tại `game_store_types.ts#L66-86`.
  - Thêm `hand?: readonly ChanceCardId[]` vào `PlayerHudInfo`.
  - Thêm `lastDiplomaticEvent?: DiplomaticEventDelta | null` vào `GameState`.
  - Trong `apply_delta_players.ts`: thêm `'hand'` vào `OPTIONAL_PLAYER_KEYS`, cập nhật `hand: p.hand ?? []`.
- **Nhiệm vụ 2.2**: `src/client/network/activity_badge_dispatcher.ts` & `src/client/ui/transaction_narrative.ts`
  - Trong `transaction_narrative.ts`:
    - Nhánh `case 'diplomatic'`:
      - Category: `'ĐẶC QUYỀN NGOẠI GIAO'`, Icon: `'🤝'`.
      - Subject: `isMe ? 'Bạn' : formatShortPlayerName(player.name)`.
      - Verb: `'kích hoạt'`, Target: `'Thẻ Ngoại Giao'`.
      - Detail: `'(Miễn 100% tiền thuê ' + cellName + ' - Tiết kiệm ' + amountText + ')'`.
    - Nhánh `rent_pay` cho Ga tàu / Tiện ích: nếu người trả tiền đang giữ `CC_DIPLOMATIC`, bổ sung detail: `'(Thẻ Ngoại Giao được bảo lưu - Không áp dụng cho Hạ tầng/Tiện ích)'`.
    - Phía Chủ đất khi bị miễn tiền: dispatch badge `"${tenantName} dùng Thẻ Ngoại Giao ➔ Miễn thu tiền thuê ${cellName} (Hụt thu ${amountText})"`.
    - Đảm bảo `transaction_narrative.ts` <= 290 LOC (hiện 267 LOC).
  - Trong `activity_badge_dispatcher.ts`:
    - Bắt `delta.lastDiplomaticEvent` và dispatch badge tương ứng.
- **Nhiệm vụ 2.3**: `src/client/ui/player_card.tsx`
  - Thêm micro-chip `🤝` (16x16px) đè góc dưới bên phải avatar tròn với tooltip `title="Giữ Thẻ Miễn Trừ Ngoại Giao"` khi `player.hand?.includes(ChanceCardId.CC_DIPLOMATIC)`.
  - Giữ vững bố cục 160px (`w-40`), không làm co hẹp tên người chơi. Đảm bảo `player_card.tsx` <= 240 LOC (hiện 222 LOC).

### Giai Đoạn 3: Triệt Tiêu Độ Lệch Thị Giác Xúc Xắc 3D & Badge Điểm 2D
- **Nhiệm vụ 3.1**: `src/client/3d/dice_tray.tsx`
  - Giữ nguyên `getDiceFaceRotation` trong `dice_math.ts` không đổi để bảo vệ hợp đồng kiểm thử.
  - Áp dụng góc nghiêng camera bias tilt `rotation={[-0.35, 0.35, 0]}` lên `<group>` cha chứa 2 viên xúc xắc khi dừng tĩnh. Mặt trên (+Y) ngửa tự nhiên thẳng vào mắt người chơi.
- **Nhiệm vụ 3.2**: `src/client/ui/dice_score_badge.tsx` (Tầng HUD 2D)
  - Trích xuất component HUD 2D gọn nhẹ:
    - Khi `!isRolling && isVisible && dice[0] > 0`: hiển thị `🎲 ${dice[0]} + ${dice[1]} = ${dice[0] + dice[1]}${isDoubles ? ' (Đôi! 🎉)' : ''}`.
    - Tự động ẩn khi `turnPhase === 'WaitingRoll'` hoặc đổi lượt người chơi.

---

## 4. DỰ TOÁN NGÂN SÁCH LOC (PRE-CODING LOC BUDGETS ĐÃ ĐỐI CHIẾU ĐĨA CỨNG)

| Tệp Mục Tiêu | Đo Thực Tế Đĩa Cứng | Delta Dự Kiến | Kỳ Vọng Sau Cùng | Trần Quy Định | Trạng Thái |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/domain/property_rent.ts` | 155 | +5 | 160 | 300 | 🟢 An Toàn |
| `src/domain/property_manager.ts` | 139 | +12 | 151 | 300 | 🟢 An Toàn |
| `src/server/turn_loop.ts` | 270 | +14 | 284 | 300 | 🟡 Sát Trần (<= 290) |
| `src/server/session_manager.ts` | 396 | +12 | 408 | 450 | 🟢 An Toàn |
| `src/server/network/delta_broadcaster.ts` | 216 | +12 | 228 | 300 | 🟢 An Toàn |
| `src/client/store/game_store_types.ts` | 362 | +10 | 372 | 450 | 🟢 An Toàn |
| `src/client/network/activity_badge_dispatcher.ts` | 230 | +18 | 248 | 300 | 🟢 An Toàn |
| `src/client/ui/transaction_narrative.ts` | 267 | +18 | 285 | 300 | 🟡 Sát Trần (<= 290) |
| `src/client/3d/dice_tray.tsx` | 245 | +15 | 260 | 350 | 🟢 An Toàn |
| `src/client/ui/player_card.tsx` | 222 | +10 | 232 | 250 | 🟢 An Toàn |

