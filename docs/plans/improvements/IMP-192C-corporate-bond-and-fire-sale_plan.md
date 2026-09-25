# Kế Hoạch Kỹ Thuật (REV 3 - ĐÃ ĐỒNG THUẬN TOÀN DIỆN VỚI PLAN GRILLER): IMP-192C - Đòn Bẩy Trái Phiếu Doanh Nghiệp & Sàn Đấu Giá Phát Mãi Có Hàng Đợi (Corporate Bond & Queued Fire Sale)

> **Mã Ticket**: `IMP-192C` (Slice 3/3 - Real-World Economic Engine)  
> **Phân Hạng Quản Trị**: Tier 2 (Full Rigor - FSM/Finance, Network Types & Domain State Machine)  
> **Tài Liệu Kiểm Toán**: [`.agents/audit/PLAN_AUDIT_IMP192C.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP192C.md)  
> **Evidence Snapshot**: `.agents/evidence/imp192c_snapshot.json`  

---

## I. KIẾN TRÚC TỔNG QUAN & DÒNG CHẢY DỮ LIỆU (VISUAL ARCHITECTURE)

```
[Người Chơi Gửi Intent: INTENT_ISSUE_BOND qua intent_dispatcher.ts]
       │
       ├─► [validateIssueBond(room, playerId, registry, stateMap)]
       │         │
       │         ├─► Điều kiện: netWorth >= 3.000 Tr., sở hữu >= 2 BĐS chưa thế chấp, chưa có bond active.
       │         ├─► Đảm bảo: Tổng giá trị gốc BĐS đảm bảo >= 50% khoản vay (Chống Naked Bond).
       │         └─► Khoản vay (principal): 80% Net Worth (Cấp hạn mức tín dụng Ngân Hàng).
       │
       ├─► [handleIssueBond]:
       │         ├─► player.balance += principal
       │         ├─► player.bondContract = { principal, repayAmount: floor(principal * 1.20), roundsLeft: 3, collateralCells, isActive: true }
       │         └─► KHÓA TÀI SẢN ĐẢM BẢO CHẶT CHẼ:
       │               • Cấm thế chấp (mortgage_manager.ts: BOND_COLLATERAL_LOCKED)
       │               • Cấm giao dịch P2P (room_property_coordinator.ts & property_actions.ts: BOND_COLLATERAL_LOCKED)
       │               • Cấm cưỡng chế thu mua (coordExecuteCompulsoryBuyout: BOND_COLLATERAL_LOCKED)
       │
[executeTurnEnd (Hết Lượt Của Bondholder)]
       │
       ├─► [processBondTurnTransition(room, current, registry, stateMap, auctions, roomCode, rng)] (Tại L225, TRƯỚC KHI advance player index)
       │         │
       │         ├─► roundsLeft > 1: current.bondContract.roundsLeft -= 1
       │         │
       │         ├─► roundsLeft === 1 (Đáo Hạn Vòng 3):
       │         │     ├─► Kịch bản 1: ĐỦ TIỀN TẤT TOÁN (balance >= repayAmount)
       │         │     │     • current.balance -= repayAmount
       │         │     │     • room.treasury += floor(principal * 0.20)  (Lãi suất 20% nộp Kho Bạc)
       │         │     │     • current.bondContract = null  (Tombstone tường minh phát tán client)
       │         │     │     • Giải phóng toàn bộ collateralCells
       │         │     │
       │         │     └─► Kịch bản 2: VỠ NỢ TRÁI PHIẾU (balance < repayAmount)
       │         │           • [ANTI-EXPLOIT CASH RECOVERY]: Khấu trừ toàn bộ tiền mặt khả dụng của con nợ:
       │         │               const cash = Math.min(Math.max(0, current.balance), repayAmount);
       │         │               current.balance -= cash; room.treasury += cash;
       │         │           • Kho Bạc tịch thu toàn bộ collateralCells (registry.delete, stateMap.delete)
       │         │           • current.bondContract = null
       │         │           • Nạp danh sách ô đất vào hàng đợi: room.fireSaleQueue = [...collateralCells]
       │         │           • Kích hoạt phiên đấu giá 0 đồng ô đầu tiên: handleStartFireSaleAuction(room, cellIndex)
       │         │           • room.phase = TurnPhase.AuctionPhase (GIỮ NGUYÊN pha Đấu Giá, CHƯA chuyển lượt!)
       │
[Sàn Đấu Giá Phát Mãi Tuần Tự (Chained Fire Sale Auction)]
       │
       ├─► Phiên Đấu Giá Phát Mãi (isFireSale = true, thời gian 10s):
       │     • Wire Protocol DTO: AuctionPayload có isFireSale: true
       │     • Client UI (modal_helpers.ts): calculateAuctionIncrements trả về [0, 50, 100] khi chưa có bidder
       │     • Người chơi có nút [Bắt Đáy (0 Tr.)] hợp lệ
       │     • Người vỡ nợ bị cấm tham gia (declinedPlayerId = bankruptPlayerId).
       │
       └─► [handleAuctionClose]:
             ├─► Có người thắng: Người thắng trả tiền -> Tiền nộp room.treasury -> Sang tên người thắng.
             ├─► All Passed (Không ai mua): Ô đất thu hồi về Kho Bạc (registry.delete, stateMap.delete).
             │
             └─► Hàng Đợi (room.fireSaleQueue):
                   ├─► Còn ô (queue.length > 0): Dequeue ô tiếp theo -> Mở tiếp phiên phát mãi 0 đồng kế tiếp.
                   └─► Hết ô (queue.length === 0):
                         Gọi helper chuẩn advanceTurnToNextPlayer(room, rng) trong turn_loop.ts:
                         • Tăng currentPlayerIndex hợp lệ
                         • Tăng roundCount & kích hoạt chu kỳ vĩ mô nếu next === 0
                         • Reset rolledThisTurnMap.set(roomCode, false)
                         • Kiểm tra nợ âm của người tiếp theo -> Chuyển lượt an toàn không bao giờ kẹt pha!
```

---

## II. ĐỒNG THUẬN 100% CÁC ĐIỂM PHẢN BIỆN CỦA USER & PLAN GRILLER

### 1. 🔴 [P1 - Strategic Default Exploit]: Khấu Trừ Cưỡng Chế Tiền Mặt Khi Vỡ Nợ
- **Nguyên nhân**: Con nợ vay 2.400 Tr., thế chấp BĐS 1.200 Tr., giữ lại 1.500 Tr. tiền mặt rồi cố tình để vỡ nợ để đút túi tiền mặt.
- **Giải pháp xử lý**:
  Khi vỡ nợ (`balance < repayAmount`):
  1. Khấu trừ toàn bộ số dư tiền mặt hiện có của con nợ (tối đa bằng `repayAmount`):
     ```ts
     const cashRecovered = Math.min(Math.max(0, current.balance), current.bondContract.repayAmount);
     current.balance -= cashRecovered;
     room.treasury = (room.treasury ?? 0) + cashRecovered;
     ```
  2. Tịch thu toàn bộ `collateralCells` đưa vào `room.fireSaleQueue`.
  3. Tiền bán đấu giá phát mãi nộp thẳng vào `room.treasury`.
  4. Nếu sau khi trừ tiền mặt mà người chơi có nợ âm phát sinh khác, người chơi sẽ rơi vào `InsolvencyPhase`.

### 2. 🔴 [P1 - Dual-Boundary Drift]: Trích Xuất `advanceTurnToNextPlayer` Thống Nhất
- **Nguyên nhân**: Khi `fireSaleQueue` cạn, `handleAuctionClose` gán nhầm sang `PropertyManagement`, kẹt lượt của con nợ, mất nhịp tăng vòng GO và vỡ chu kỳ vĩ mô.
- **Giải pháp xử lý**:
  - Trích xuất hàm public trong `src/server/turn_loop.ts`:
    ```ts
    export function advanceTurnToNextPlayer(room: Room, rng: () => number = Math.random): void
    ```
    Bao gồm toàn bộ logic: duyệt qua người chơi phá sản, gọi `advanceRoundBoundary(room, rng)` khi `next === 0`, reset cờ xúc xắc `rolledThisTurnMap`, kiểm tra `skipNextTurn` và chuyển pha sang `WaitingRoll` hoặc `InsolvencyPhase`.
  - Trong `auction_manager.ts#handleAuctionClose`: Khi `room.fireSaleQueue.length === 0`, gọi trực tiếp `advanceTurnToNextPlayer(room, rng)` thay vì gán thủ công `PropertyManagement`.

### 3. 🔴 [P1 - Transient Leak Hazard]: Kích Hoạt Đấu Giá Ngay Khi Phá Sản Chéo
- **Nguyên nhân**: Trong `insolvency_manager.ts#declareBankruptcy`, khi nợ người chơi khác, BĐS đảm bảo bị đưa vào `fireSaleQueue` nhưng không mở phiên đấu giá, dẫn đến ô đất bị treo vĩnh viễn trong RAM.
- **Giải pháp xử lý**:
  Trong `declareBankruptcy`:
  ```ts
  if (room.fireSaleQueue && room.fireSaleQueue.length > 0 && auctions && roomCode) {
    const firstCell = room.fireSaleQueue.shift()!;
    handleStartFireSaleAuction(room, firstCell, auctions, roomCode);
    room.phase = TurnPhase.AuctionPhase;
    // CHẶN advanceTurnAfterBankruptcy vì đang có phiên đấu giá phát mãi!
    return;
  }
  ```

### 4. 🔴 [P1 - Specification Mirage]: Wire Protocol `isFireSale` & Nút [Bắt Đáy 0 Tr.]
- **Nguyên nhân**: Client UI chỉ hiển thị các nút tăng giá tối thiểu +100 Tr., người chơi không có nút để đặt giá 0 đồng.
- **Giải pháp xử lý**:
  - `AuctionPayload` ([`network_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/network_types.ts)) thêm `isFireSale?: boolean`.
  - `buildAuctionDelta` ([`session_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts)) serialize `isFireSale: session.isFireSale ?? false`.
  - `modal_helpers.ts#calculateAuctionIncrements`:
    ```ts
    export function calculateAuctionIncrements(
      currentBid: number,
      isFireSale?: boolean,
      hasBidder?: boolean,
    ): readonly number[] {
      if (isFireSale && !hasBidder) {
        return [0, 50, 100];
      }
      const safeBid = Math.max(0, currentBid);
      return [safeBid + 100, safeBid + 200, safeBid + 500];
    }
    ```
  - `auction_modal.tsx`: Nút hiển thị nhãn `Bắt Đáy (0 Tr.)` khi giá trị tăng thêm là 0.

### 5. 🔴 [P1 - Call-Site Blindspot]: Đăng Ký Intent Dispatcher & Chặn Thu Mua Cưỡng Chế
- **Nguyên nhân**: Bỏ sót `intent_dispatcher.ts`; `coordExecuteCompulsoryBuyout` và `executeP2PTrade` không chặn ô đất đang thế chấp trái phiếu.
- **Giải pháp xử lý**:
  - `src/server/intent_dispatcher.ts`: Đăng ký `INTENT_ISSUE_BOND` và `INTENT_REPAY_BOND`.
  - `src/server/room_property_coordinator.ts#coordExecuteCompulsoryBuyout`:
    ```ts
    const targetPlayer = room.players.find(p => p.id === targetOwnerId);
    if (targetPlayer?.bondContract?.isActive && targetPlayer.bondContract.collateralCells.includes(cellIndex)) {
      return { success: false, reason: ActionRejectReason.BOND_COLLATERAL_LOCKED };
    }
    ```
  - `src/server/property_actions.ts#executeP2PTrade`: Kiểm tra tương tự trước khi chuyển quyền sở hữu BĐS.

### 6. 🟡 [P2 - LOC Discipline]: Pre-Extract Tab Header Cho `property_portfolio_modal.tsx`
- **Nguyên nhân**: File đang có 462 LOC, nếu thêm tab state và nút bấm có thể tiệm cận 498 LOC.
- **Giải pháp xử lý**:
  - Trích xuất component navigation riêng: `src/client/ui/modals/portfolio_tab_header.tsx` (~30 LOC).
  - Tách nội dung tab trái phiếu sang `src/client/ui/modals/bond_issuance_tab.tsx` (~70 LOC).
  - Giữ mức tăng LOC của `property_portfolio_modal.tsx` $\le 10$ LOC, tổng LOC đạt $\le 472$ LOC (cách xa trần cứng 500 LOC).

---

## III. MA TRẬN DÒNG MÃ VẬT LÝ & NGÂN SÁCH LOC (PRE-CODING DELTA MATRIX)

| Tệp Vật Lý | Vai Trò Kiến Trúc | Tier | LOC Hiện Tại | Delta Dự Kiến | LOC Sau Chỉnh Sửa | Đánh Giá Ngân Sách |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/domain/bond_types.ts` (MỚI) | Contract Interface `BondContract` & Hằng Số | Tier 1 | 0 | +25 | **25** | Rất an toàn (< 400 LOC) |
| `src/domain/room.ts` | State Model: `Player.bondContract`, `Room.fireSaleQueue` | Tier 1 | 237 | +5 | **242** | An toàn (< 400 LOC) |
| `src/domain/action_reasons.ts` | `BOND_COLLATERAL_LOCKED`, `BOND_NOT_ELIGIBLE` | Tier 1 | 62 | +4 | **66** | Rất an toàn (< 400 LOC) |
| `src/server/network/network_types.ts` | Wire Protocol Type Contract (`isFireSale`, WsErrorMessage) | Tier 1 | 102 | +4 | **106** | Rất an toàn (< 400 LOC) |
| `src/domain/i18n/vi.ts` | Bản Dịch Tiếng Việt Trái Phiếu & Phát Mãi 0đ | Tier 1 | 125 | +6 | **131** | Rất an toàn (< 400 LOC) |
| `src/server/bond_manager.ts` (MỚI) | Domain Service Vòng Đời Trái Phiếu & Khấu Trừ Cưỡng Chế | Tier 1 | 0 | +130 | **130** | Rất an toàn (< 400 LOC) |
| `src/server/auction_manager.ts` | Sàn Phát Mãi 0đ & Điều Phối Hàng Đợi Tuần Tự | Tier 1 | 200 | +40 | **240** | Dưới ngưỡng cảnh báo (< 300 LOC) |
| `src/server/mortgage_manager.ts` | Chặn Vay Thế Chấp BĐS Đang Là Tài Sản Đảm Bảo | Tier 1 | 261 | +6 | **267** | An toàn (< 400 LOC) |
| `src/server/room_property_coordinator.ts` | Chặn P2P & Cưỡng Chế Thu Mua BĐS Đang Đảm Bảo | Tier 1 | 350 | +10 | **360** | An toàn (< 400 LOC) |
| `src/server/property_actions.ts` | Chặn Chuyển Nhượng Đất Đảm Bảo Trong P2P Execute | Tier 1 | 352 | +6 | **358** | An toàn (< 400 LOC) |
| `src/server/insolvency_manager.ts` | Senior Lien Thu Hồi Kho Bạc & Mở Ngay Đấu Giá Chéo | Tier 1 | 264 | +18 | **282** | Dưới ngưỡng cảnh báo (< 300 LOC) |
| `src/server/turn_loop.ts` | Hook Đếm Ngược L225 & Xuất `advanceTurnToNextPlayer` | Tier 1 | 259 | +20 | **279** | Dưới ngưỡng cảnh báo (< 300 LOC) |
| `src/server/intent_dispatcher.ts` | Đăng Ký `INTENT_ISSUE_BOND` & `INTENT_REPAY_BOND` | Tier 1 | 86 | +6 | **92** | Rất an toàn (< 400 LOC) |
| `src/server/session_manager.ts` | Serialize `bondContract` & `isFireSale` Trong Delta | Tier 1 | 393 | +6 | **399** | **TUÂN THỦ (< 400 LOC)** |
| `src/server/network/delta_broadcaster.ts` | Bổ Sung `bondContract` Vào `isPlayerEqual` | Tier 1 | 211 | +8 | **219** | An toàn (< 400 LOC) |
| `src/client/network/apply_delta_players.ts` | Thêm `'bondContract'` Vào `OPTIONAL_PLAYER_KEYS` | Tier 1 | 140 | +2 | **142** | An toàn (< 400 LOC) |
| `src/client/store/game_store_types.ts` | Bổ Sung `bondContract` Vào `PlayerHudInfo` | Tier 1 | 350 | +2 | **352** | An toàn (< 400 LOC) |
| `src/server/room_manager.ts` | Giao Tiếp Intent Sang `bond_manager.ts` | Tier 1 | 522 | +4 | **526** | **TUÂN THỦ (< 550 LOC)** |
| `src/client/ui/modals/modal_helpers.ts` | `calculateAuctionIncrements` Hỗ Trợ Nút 0đ | Tier 1 | 185 | +8 | **193** | An toàn (< 400 LOC) |
| `src/client/ui/modals/auction_modal.tsx` | Hiển Thị Nhãn [Bắt Đáy (0 Tr.)] | Tier 2 | 372 | +6 | **378** | An toàn (< 500 LOC) |
| `src/client/ui/modals/portfolio_tab_header.tsx` (MỚI) | Cụm Tab Navigation BĐS / Trái Phiếu | Tier 2 | 0 | +30 | **30** | Rất an toàn (< 500 LOC) |
| `src/client/ui/modals/bond_issuance_tab.tsx` (MỚI) | Giao Diện Tab Phát Hành & Quản Lý Trái Phiếu | Tier 2 | 0 | +70 | **70** | Rất an toàn (< 500 LOC) |
| `src/client/ui/modals/property_portfolio_modal.tsx` | Nhúng Cụm Header & Tab Trái Phiếu | Tier 2 | 462 | +10 | **472** | **TUÂN THỦ (< 500 LOC)** |

---

## IV. KẾ HOẠCH TEST HỢP ĐỒNG ĐỐI KHÁNG (STATION 1 QA RED)

Tệp test: `tests/contracts/imp192c_corporate_bond_fire_sale.test.ts` (Tối thiểu 20 atomic tests):
1. **[TC-192C.01-04] Điều Kiện Phát Hành Trái Phiếu**:
   - Từ chối khi NW < 3.000 Tr.
   - Từ chối khi < 2 BĐS chưa thế chấp.
   - Từ chối khi tổng giá trị gốc BĐS đảm bảo < 50% khoản vay.
   - Chấp thuận phát hành và giải ngân 80% NW khi đủ điều kiện.
2. **[TC-192C.05-08] Khóa Toàn Diện Tài Sản Đảm Bảo**:
   - `mortgageProperty` từ chối ô đất đảm bảo (`BOND_COLLATERAL_LOCKED`).
   - `coordTrade` từ chối giao dịch P2P ô đất đảm bảo.
   - `executeP2PTrade` từ chối chuyển nhượng trễ nếu ô đất bị khóa bond.
   - `coordExecuteCompulsoryBuyout` từ chối cưỡng chế thu mua ô đất đảm bảo.
3. **[TC-192C.09-11] Đếm Ngược Đơn Điểm & Tất Toán Thành Công**:
   - Đếm lùi `roundsLeft` 3 -> 2 -> 1 tại `executeTurnEnd`.
   - Tất toán thành công: trừ `repayAmount`, nộp 20% lãi Kho Bạc, gỡ cờ đảm bảo.
   - Tombstone `bondContract: null` được serialize phát tán cho client.
4. **[TC-192C.12-14] Vỡ Nợ Trái Phiếu & Khấu Trừ Cưỡng Chế Tiền Mặt**:
   - Cưỡng chế khấu trừ toàn bộ tiền mặt con nợ nộp Kho Bạc trước.
   - Tịch thu toàn bộ `collateralCells` nạp vào `room.fireSaleQueue`.
   - Giữ nguyên `AuctionPhase`, không chuyển lượt người chơi.
5. **[TC-192C.15-18] Sàn Phát Mãi 0 Đồng & Chuỗi Hàng Đợi Tuần Tự**:
   - `calculateAuctionIncrements` và `handleAuctionBid` cho phép bid 0đ khi mở phiên.
   - Cấm con nợ tham gia đấu giá (`DECLINED_PLAYER_CANNOT_BID`).
   - Sang tên người thắng, nộp tiền Kho Bạc; nếu All Passed thu hồi về Kho Bạc (`registry.delete`).
   - Hàng đợi tự động mở phiên tiếp theo; khi hết hàng đợi gọi `advanceTurnToNextPlayer` chuyển lượt an toàn, không kẹt pha.
6. **[TC-192C.19-20] Thực Thi Senior Lien Trong Phá Sản Chéo**:
   - Khi phá sản do nợ người chơi khác, BĐS đảm bảo được Kho Bạc thu hồi trước và kích hoạt ngay phiên phát mãi.
   - Chỉ BĐS dôi dư mới được chuyển sang cho chủ nợ.

---

## V. TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE)
1. 20/20 atomic tests PASS (Adversarial Detroit TDD).
2. Toàn bộ 319 test suites repo PASS 100% (0 regressions).
3. `room_manager.ts` duy trì $\le 526$ LOC (ngưỡng cứng 550 LOC).
4. `property_portfolio_modal.tsx` duy trì $\le 472$ LOC (ngưỡng cứng 500 LOC).
5. Scout Station 2.5 quét sạch 5 nhóm lỗi vật lý.
6. Station 3 độc lập (`code-reviewer`, `spec-reviewer`) phê duyệt APPROVED.
