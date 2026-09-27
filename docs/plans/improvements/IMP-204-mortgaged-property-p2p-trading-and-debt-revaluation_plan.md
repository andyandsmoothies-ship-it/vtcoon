# [PLAN] IMP-204: Giao Dịch P2P Bất Động Sản Đang Cầm Cố & Định Giá Lại Nghĩa Vụ Nợ (Mortgaged Property P2P Trading & Debt Re-Valuation)

> **Mã Ticket**: IMP-204  
> **Phân loại**: Tier 2 (Full Rigor - Network Protocol, Server Coordinator, Bot AI Strategy & Client UI)  
> **Mục tiêu**: Cho phép giao dịch BĐS đang thế chấp qua đàm phán P2P (thường & hoán đổi swap) theo cơ chế chuyển giao kèm nghĩa vụ nợ (Loan Assumption); định giá lại giá sàn P2P (Floor Price = 35% thay vì 70%); Bot AI tự động bù trừ chi phí giải chấp Kho Bạc khi mua/bán; Client UI hiển thị minh bạch nhãn nợ và phản ánh đúng Net Equity; bảo toàn 100% các bất biến tài chính và cấm xây nhà độc quyền khi có ô đang thế chấp.

---

### I. CÁC TỆP MỤC TIÊU & NGÂN SÁCH LOC (Physical File Baseline)

| Tệp Vật Lý | Phân Loại Tier | LOC Hiện Tại | Dự Kiến Delta | Dự Kiến Sau Sửa | Ngưỡng Cho Phép |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/server/property_actions.ts` | Tier 1 (Logic) | 376 | +9 | **385** | <= 400 (Hard limit: 550) |
| `src/server/room_property_coordinator.ts` | Tier 1 (Logic) | 381 | -36 | **345** | <= 400 (Subtractive Refactor) |
| `src/domain/bot/bot_trade.ts` | Tier 1 (Logic) | 227 | +25 | **252** | <= 400 |
| `src/domain/bot/bot_monopoly_utils.ts` | Tier 1 (Logic) | 61 | +12 | **73** | <= 400 |
| `src/domain/bot/bot_hybrid_trade.ts` | Tier 1 (Logic) | 291 | 0 | **291** | <= 400 |
| `src/client/ui/modals/trade_modal.tsx` | Tier 2 (UI) | 275 | +13 | **288** | <= 500 |
| `src/client/ui/modals/trade/trade_column.tsx` | Tier 2 (UI) | 232 | +4 | **236** | <= 500 |
| `src/client/ui/modals/trade/trade_deal_hud.tsx` | Tier 2 (UI) | 96 | 0 | **96** | <= 500 (Pure Presenter) |
| `tests/contracts/imp204_mortgaged_property_p2p_trading.test.ts` | Test Suite | 0 (Mới) | +410 | **410** | <= 600 |
| `tests/contracts/imp146_p2p_property_swap_and_negotiation_parity.test.ts` | Test Cũ | 419 | 0 | 419 | Specification Evolution |
| `tests/server/p2p_trade.test.ts` | Test Cũ | 326 | 0 | 326 | Specification Evolution |

---

### II. KIẾN TRÚC DỮ LIỆU & BẢO TOÀN NGHĨA VỤ NỢ (Data Architecture)

```
[Seller (Người Bán)]                           [Buyer (Người Mua)]
  - mortgagedProperties: [18, ...]               - mortgagedProperties: []
  - mortgageLoans: { 18: 900 }                   - mortgageLoans: {}
            │                                              │
            │ P2P Trade (Giá thỏa thuận = 650)             │
            ▼                                              ▼
[Server: executeP2PTrade]
  1. Thanh toán tiền mặt:
     - Buyer trả 650; Thuế 5% = 33 nộp Kho Bạc; Seller nhận 617.
  2. registry.set(18, buyer.id)
  3. Di dời nghĩa vụ nợ nguyên tử (transferMortgageDebt):
     - loan = seller.mortgageLoans?.[18] ?? Math.floor(deed.price * 0.5)
     - seller.mortgagedProperties lọc bỏ cell 18
     - delete seller.mortgageLoans[18]
     - buyer.mortgagedProperties thêm cell 18
     - buyer.mortgageLoans[18] = loan
  4. stateMap.get(18).isMortgaged GIỮ NGUYÊN true.
            │
            ▼
[Bảo Toàn Bất Biến (Invariants)]
  - Kho Bạc: Lãi định kỳ khi qua GO chuyển từ Seller sang Buyer.
  - Xây nhà: Cấm xây trên cả nhóm màu khi ô 18 chưa được Buyer chuộc (ActionRejectReason.GROUP_MORTGAGED).
  - Chuộc đất: Buyer có quyền giải chấp với giá loan x 1.10 = 990 nộp Kho Bạc.
```

---

### III. CHI TIẾT TRIỂN KHAI THEO TỪNG TẦNG (Concrete Implementation)

#### 1. Tầng Server: `src/server/property_actions.ts`
- **Helper di dời nợ nguyên tử (Atomic Debt Migration Helper)**:
  ```ts
  function transferMortgageDebt(from: Player, to: Player, cell: number, state?: PropertyState): void {
    if (!state?.isMortgaged && !from.mortgagedProperties?.includes(cell)) return;
    const loan = from.mortgageLoans?.[cell] ?? Math.floor((PROPERTY_DEEDS.get(cell)?.price ?? 0) * 0.5);
    from.mortgagedProperties = (from.mortgagedProperties ?? []).filter((c) => c !== cell);
    if (from.mortgageLoans) delete from.mortgageLoans[cell];
    (to.mortgagedProperties ??= []).push(cell);
    (to.mortgageLoans ??= {})[cell] = loan;
  }
  ```
- **Hạ giá sàn cho BĐS thế chấp** trong `checkTradeProperty`:
  ```ts
  if (!isSwap) {
    const isMort = Boolean(stateMap?.get(cellIndex)?.isMortgaged);
    const floorRate = isMort ? 0.35 : 0.70;
    const floorPrice = Math.max(100, Math.floor(deed.price * floorRate));
    if (price < floorPrice) {
      return ActionRejectReason.PRICE_BELOW_FLOOR;
    }
  }
  ```
- **Bỏ chặn `PROPERTY_MORTGAGED`** trong `checkTradeParties`:
  Xóa bỏ dòng 277-279 (`if (seller!.mortgagedProperties?.includes(cellIndex)) return ...;`) và dòng 296-298 (`if (buyer!.mortgagedProperties?.includes(offeredCellIndex)) return ...;`).
- **Thực hiện chuyển giao nghĩa vụ nợ trong `executeP2PTrade`**:
  ```ts
  transferMortgageDebt(v.seller, v.buyer, cellIndex, stateMap.get(cellIndex));
  if (offeredCellIndex !== undefined) {
    transferMortgageDebt(v.buyer, v.seller, offeredCellIndex, stateMap.get(offeredCellIndex));
  }
  ```

#### 2. Tầng Điều Phối: `src/server/room_property_coordinator.ts`
- **Subtractive Refactoring (Cắt giảm 36 dòng trùng lặp)**:
  - Xóa dòng 137-138 (`if (propState?.isMortgaged || seller.mortgagedProperties?.includes(cellIndex)) return ...;`).
  - Xóa dòng 149-150 (`if (offState?.isMortgaged || buyer.mortgagedProperties?.includes(offeredCellIndex)) return ...;`).
  - Trong `coordRespondTradeOffer`:
    Hợp nhất toàn bộ việc thực thi 1-way trade và Swap bằng cách ủy quyền 100% cho `executeP2PTrade`:
    ```ts
    const tradeResult = executeP2PTrade({
      seller,
      buyer,
      cellIndex: session.cellIndex,
      price: session.price,
      offeredCellIndex: session.offeredCellIndex,
      registry: ctx.reg,
      stateMap: ctx.sm,
      treasury: ctx.room.treasury,
    });
    ```
    Loại bỏ toàn bộ 33 dòng tính thuế thủ công, chuyển tiền riêng lẻ ở L280-306.

#### 3. Tầng Bot AI: `src/domain/bot/`
- **`src/domain/bot/bot_monopoly_utils.ts`**:
  Mở rộng `MonopolyGap`:
  ```ts
  export interface MonopolyGap {
    readonly cellIndex: number;
    readonly targetOwnerId: string;
    readonly isMortgaged?: boolean;
    readonly mortgageLoan?: number;
  }
  ```
  Trong `findAllMonopolyGaps`, xóa `if (isMortgaged) continue;` và truyền trạng thái thế chấp.
- **`src/domain/bot/bot_trade.ts`**:
  - `calculateTradeOfferPrice`:
    Nhận diện nếu mục tiêu đang thế chấp:
    ```ts
    if (isMortgaged) {
      const loan = mortgageLoan ?? Math.floor(basePrice * 0.5);
      const redeemCost = Math.floor(loan * 1.10);
      const floorPrice = Math.max(100, Math.floor(basePrice * 0.35));
      offerPrice = Math.max(floorPrice, offerPrice - redeemCost);
      safetyBuffer += Math.floor(loan * 0.10);
    }
    ```
  - `evaluateBotTradeAcceptance`:
    Nếu Bot là người bán ô đất đang thế chấp:
    ```ts
    const isMort = sellerBot.mortgagedProperties?.includes(cellIndex);
    if (isMort) {
      const loan = sellerBot.mortgageLoans?.[cellIndex] ?? Math.floor(basePrice * 0.5);
      const floorPrice = Math.max(100, Math.floor(basePrice * 0.35));
      minAcceptablePrice = Math.max(floorPrice, minAcceptablePrice - loan);
    }
    ```

#### 4. Tầng Client UI: `src/client/ui/modals/`
- **`src/client/ui/modals/trade_modal.tsx`**:
  - Tại đoạn tính toán `offeredBaseCost` & `requestedBaseCost` (L109-L117):
    Khấu trừ khoản nợ thế chấp để tính giá trị ròng (Net Equity):
    ```ts
    const getNetPropertyValue = (cellId: number, player: Player): number => {
      const deed = PROPERTY_DEEDS.get(cellId);
      if (!deed) return 0;
      const isMort = player.mortgagedProperties?.includes(cellId);
      if (!isMort) return deed.price;
      const loan = player.mortgageLoans?.[cellId] ?? Math.floor(deed.price * 0.5);
      return Math.max(0, deed.price - loan);
    };
    ```
- **`src/client/ui/modals/trade/trade_column.tsx`**:
  - Bỏ `disabled={isMort}` trên nút chọn thẻ BĐS.
  - Cho phép người chơi click chọn ô đất thế chấp bình thường.
  - Thêm badge nợ tinh gọn (Single Compact Badge) chống tràn layout 360px:
    ```tsx
    {isMort && (
      <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] whitespace-nowrap">
        ⚠️ Nợ -{formatCurrency(loan)} (Thế chấp)
      </span>
    )}
    ```

---

### IV. MA TRẬN KIỂM THỬ HỢP ĐỒNG (RED Contract Tests - Universal 5-Facet Matrix)
File: `tests/contracts/imp204_mortgaged_property_p2p_trading.test.ts` (22 atomic tests)

- **Facet 1: P2P Trade Server Validation & Floor Price**
  - [TC-204.01/MSS] Cho phép tạo đề xuất P2P mua BĐS đang thế chấp (`isMortgaged: true`).
  - [TC-204.02/MSS] BĐS đang thế chấp chấp nhận giá sàn `floorPrice = Math.floor(deed.price * 0.35)`.
  - [TC-204.03/MSS] BĐS đang thế chấp từ chối giá dưới 35% (`PRICE_BELOW_FLOOR`).
  - [TC-204.04/MSS] BĐS thế chấp có công trình (nếu có lỗi dữ liệu `level > 0`) vẫn bị từ chối `PROPERTY_HAS_BUILDING`.
  - [TC-204.05/MSS] BĐS đang nằm trong hợp đồng Trái phiếu (`bondContract.collateralCells`) vẫn bị cấm `BOND_COLLATERAL_LOCKED`.

- **Facet 2: Atomic Debt Migration & Invariants**
  - [TC-204.06/MSS] `executeP2PTrade` xóa cellIndex khỏi `seller.mortgagedProperties` và `seller.mortgageLoans`.
  - [TC-204.07/MSS] `executeP2PTrade` thêm cellIndex vào `buyer.mortgagedProperties` và gán đúng số nợ vào `buyer.mortgageLoans`.
  - [TC-204.08/MSS] Cờ `stateMap.get(cellIndex).isMortgaged` được bảo toàn `true` sau giao dịch.
  - [TC-204.09/MSS] Quỹ Kho Bạc nhận đúng 5% thuế P2P trên giá chuyển nhượng thực tế.
  - [TC-204.10/MSS] Đổi 2 BĐS cùng đang thế chấp (Swap): Di dời nợ 2 chiều đối xứng không mất mát.

- **Facet 3: Post-Trade Economy & Monopoly Rules**
  - [TC-204.11/MSS] Buyer đi qua ô GO sau khi mua đất thế chấp bị trừ lãi thế chấp định kỳ nộp Kho Bạc.
  - [TC-204.12/MSS] Seller không còn bị trừ lãi cho ô đất thế chấp đã bán khi đi qua ô GO.
  - [TC-204.13/MSS] Buyer sở hữu đủ bộ màu nhưng có 1 ô thế chấp: Bị cấm xây nhà trên toàn bộ nhóm màu (`ActionRejectReason.GROUP_MORTGAGED`).
  - [TC-204.14/MSS] (Sequential Integration Test): Chạy `executeP2PTrade` chuyển ô đất thế chấp sang Buyer -> Sau đó Buyer giải chấp ô đất thành công với `redeemProperty` với giá `loan * 1.10` nộp Kho Bạc.
  - [TC-204.15/MSS] Sau khi Buyer giải chấp thành công, nhóm màu mở khóa cho phép nâng cấp bình thường.

- **Facet 4: Insolvency Restructuring & Bot AI Strategy**
  - [TC-204.16/MSS] Người chơi cá nhân có số dư âm (`seller.balance < 0`) được phép bán BĐS thế chấp với giá > 0 qua `executeP2PTrade` để thoát phá sản.
  - [TC-204.17/MSS] Bot nhận diện Monopoly Gap là ô đất thế chấp và đề xuất mua với giá đã khấu trừ `RedeemCost = loan * 1.10`.
  - [TC-204.18/MSS] Bot kiểm tra `safetyBuffer` có cộng thêm đệm lãi nợ trước khi gửi đề xuất mua ô thế chấp.
  - [TC-204.19/MSS] Bot khi bán ô thế chấp hạ thấp ngưỡng chấp nhận giá tương ứng với khoản vay đã bỏ túi.

- **Facet 5: Client UI & TradeModal Ergonomics**
  - [TC-204.20/MSS] Thẻ BĐS thế chấp trong `TradeColumn` không còn mang thuộc tính `disabled`.
  - [TC-204.21/MSS] Thẻ BĐS thế chấp hiển thị huy hiệu nợ `⚠️ Nợ -Xđ` và cho phép chọn bình thường.
  - [TC-204.22/MSS] `TradeModal` tính toán `offeredBaseCost` & `requestedBaseCost` dựa trên Net Equity đã khấu trừ nợ.
