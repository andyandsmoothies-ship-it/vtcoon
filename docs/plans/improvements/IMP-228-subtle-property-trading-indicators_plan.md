# Kế Hoạch Triển Khai v2: IMP-228 — Chỉ Báo BĐS Đang Giao Dịch Tinh Tế Trên Thẻ Người Chơi (Subtle Property Trading Indicators on Player Cards)

> **Mã số**: `IMP-228`  
> **Phiên bản**: `v2` (Đã tiếp thu và khắc phục triệt để 100% 4 phản biện kỹ thuật P1–P4)  
> **Phân loại**: Tier 2 Full Rigor (Client UI Polish, Multi-Component Sync, Sàn >= 15 Atomic Tests)  
> **Mục tiêu**: Khi diễn ra giao dịch mua bán / đổi đất giữa các người chơi (P2P Trade hoặc Bot Trade Offer), các chấm tròn đại diện cho các ô đất liên quan trên 4 thẻ người chơi (PlayerCards trong Player HUD) sẽ hiển thị một chỉ báo tinh tế, êm dịu (`ring-1.5 ring-amber-400/90 animate-pulse`), giúp người chơi nhận biết ngay tài sản nào đang được đưa lên bàn đàm phán mà không gây chói mắt hay phân tâm.

---

## 1. Bản Ghi Khắc Phục 4 Điểm Phản Biện (Reviewer Inoculation Ledger)

| Mã Phản Biện | Mức Độ | Vấn Đề Nhận Diện | Giải Pháp Khắc Phục Chuẩn Mực Trong v2 |
| :---: | :---: | :--- | :--- |
| **P1** | **CRITICAL** | `ring-offset-[#FFFDF8]` là arbitrary value trong template string động, nguy cơ bị Tailwind purge ở production build. | **Loại bỏ hoàn toàn arbitrary class**. Dùng class Tailwind tĩnh `ring-offset-1` kết hợp biến CSS inline: `style={{ '--tw-ring-offset-color': '#FFFDF8' }}`. Đảm bảo 100% không bị purge. Thêm kiểm chứng qua `npm run build`. |
| **P2** | **HIGH** | `updateModalPayload` gọi bên trong setState callback updater của `setOffered`/`setRequested` vi phạm React Pure Updater, gây side-effect kép trong Strict Mode và bắt dính stale closure. | **Đưa side-effect ra ngoài setState**: Tính toán `nextOffered`/`nextRequested` trước, gọi `setOffered`/`setRequested`, sau đó gọi `updateModalPayload` đồng bộ ở phạm vi hàm xử lý sự kiện. |
| **P3** | **MEDIUM** | Fallback `localPlayerId \|\| 'p1'` là magic string hardcode, match nhầm nếu production dùng UUID hoặc khi `localPlayerId` chưa khởi tạo. | **Triệt tiêu magic string `'p1'`**: Nếu `localPlayerId` là `undefined` (chưa join phòng hoặc SSR), nhánh kiểm tra local player trả về Set rỗng thay vì fallback về `'p1'`. |
| **P4** | **MEDIUM** | Số lượng test trong plan v1 (12 tests) vi phạm sàn `Floor: >= 15 atomic tests / slice` của `GEMINI.md`. | **Nâng quy mô lên đúng 16 atomic tests** (vượt sàn 15), bổ sung 4 ca kiểm thử kiểm chứng: SSR undefined guard, Purge CSS guard, Stale closure sync guard, và Production build. |

---

## 2. Kiến Trúc Luồng Dữ Liệu (Data Flow Diagram)

```text
[SỰ KIỆN GIAO DỊCH]
   │
   ├── (1) P2P TradeModal mở (activeModal === 'trade')
   │       • offeredProperties: Đất người chơi đang đề xuất bán/đổi
   │       • requestedProperties: Đất người chơi đang đề xuất mua/đổi
   │       • Real-time: Khi toggle checkbox, tính toán nextState -> setState() -> updateModalPayload()
   │
   ├── (2) Bot Trade Offer Modal mở (activeModal === 'bot_trade_offer')
   │       • cellIndex (đất bán) & offeredCellIndex (đất đổi chéo)
   │
   └── (3) Đề xuất chờ duyệt ngầm (pendingTradeOffer != null)
           • cellIndex (đất bán) & offeredCellIndex (đất đổi chéo)
                   │
                   ▼
   [Hàm Thuần Túy: resolvePlayerTradingCells(state, playerId, localPlayerId)]
   * Bảo vệ: Nếu localPlayerId là undefined -> không fallback 'p1', trả về Set rỗng cho local
                   │
                   ▼ Trả về Set<number> các cellIndex đang giao dịch của riêng playerId đó
   [PlayerCard (player.id)]
                   │
                   ▼
   {cells.map(cell => {
       const isTrading = tradingCellSet.has(cell.index);
       return (
           <span
               data-testid={`dot-cell-${cell.index}`}
               data-trading={isTrading ? 'true' : 'false'}
               style={{
                   ...(isOwned ? { backgroundColor: COLOR_GROUP_HEX[group] } : {}),
                   ...(isTrading ? ({ '--tw-ring-offset-color': '#FFFDF8' } as React.CSSProperties) : {}),
               }}
               className={`w-2 h-2 sm:w-[9px] sm:h-[9px] md:w-2.5 md:h-2.5 rounded-full transition-all shrink-0 ${
                   isTrading
                       ? 'relative z-10 scale-110 ring-1.5 ring-amber-400/90 ring-offset-1 shadow-xs animate-pulse'
                       : ''
               } ${
                   isOwned
                       ? 'border border-slate-900/50 shadow-2xs'
                       : 'border border-slate-300 bg-slate-100/70'
               }`}
               title={`${cell.name}: ${isOwned ? 'Đã sở hữu' : 'Chưa sở hữu'}${isTrading ? ' (Đang trong giao dịch 🤝)' : ''}`}
           />
       )
   })}
```

---

## 3. Danh Sách Tệp Tác Động & Ngân Sách Dòng Mã (LOC Budgets)

| Tệp Mục Tiêu | Hiện Tại | Dự Kiến Sau Sửa | Thay Đổi Dự Kiến | Đánh Giá Ngân Sách |
| :--- | :---: | :---: | :---: | :---: |
| `src/client/ui/player_card.tsx` | 285 LOC | ~320 LOC | +35 LOC | Tier 2 (Trần 500 LOC) — An Toàn |
| `src/client/ui/modals/trade_modal.tsx` | 288 LOC | ~305 LOC | +17 LOC | Tier 2 (Trần 500 LOC) — An Toàn |
| `tests/client/imp228_subtle_property_trading_indicators.test.ts` | 0 LOC | ~220 LOC | +220 LOC | Test Suite (Trần 300 LOC) — Chuẩn |

*Bảo toàn ngưỡng: Tuyệt đối không can thiệp vào `modal_host.tsx` (474 LOC).*

---

## 4. Kế Hoạch Thi Công Chi Tiết (Implementation Tasks)

### Task 1: Xây Dựng Hàm Phân Giải Thuần Túy `resolvePlayerTradingCells` (Zero Magic String)
- **Vị trí**: Export từ `src/client/ui/player_card.tsx`.
- **Đặc tả logic**:
  ```ts
  export function resolvePlayerTradingCells(
    tradeState: {
      activeModal: ActiveModalType;
      modalPayload: unknown;
      pendingTradeOffer: PendingTradeOfferDelta | null;
    } | null | undefined,
    playerId: string,
    localPlayerId?: string
  ): Set<number> {
    const result = new Set<number>();
    if (!tradeState || !playerId) return result;

    // 1. Pending trade offer (P2P hoặc Bot trade qua websocket)
    const pending = tradeState.pendingTradeOffer;
    if (pending) {
      if (pending.sellerId === playerId && typeof pending.cellIndex === 'number') {
        result.add(pending.cellIndex);
      }
      if (pending.buyerId === playerId && typeof pending.offeredCellIndex === 'number') {
        result.add(pending.offeredCellIndex);
      }
    }

    // 2. Active modal: Bot Trade Offer Modal
    if (tradeState.activeModal === 'bot_trade_offer' && tradeState.modalPayload) {
      const payload = tradeState.modalPayload as ModalPayloadMap['bot_trade_offer'];
      if (payload.sellerId === playerId && typeof payload.cellIndex === 'number') {
        result.add(payload.cellIndex);
      }
      if (payload.buyerId === playerId && typeof payload.offeredCellIndex === 'number') {
        result.add(payload.offeredCellIndex);
      }
    }

    // 3. Active modal: P2P Trade Modal (Khử magic string 'p1')
    if (tradeState.activeModal === 'trade' && tradeState.modalPayload) {
      const payload = tradeState.modalPayload as ModalPayloadMap['trade'];
      // CHỈ xử lý nếu localPlayerId hợp lệ, không fallback 'p1'
      if (typeof localPlayerId === 'string' && localPlayerId.length > 0 && playerId === localPlayerId) {
        if (Array.isArray(payload.offeredProperties)) {
          payload.offeredProperties.forEach((id) => result.add(id));
        }
      }
      if (payload.targetPlayerId && playerId === payload.targetPlayerId) {
        if (Array.isArray(payload.requestedProperties)) {
          payload.requestedProperties.forEach((id) => result.add(id));
        }
      }
    }

    return result;
  }
  ```

### Task 2: Cập Nhật Hiển Thị Chấm Tròn Trên `PlayerCard` (Purge-Resistant CSS)
- **Vị trí**: `src/client/ui/player_card.tsx`.
- **Hành động**:
  1. Mở rộng `PlayerCardProps`: Thêm `readonly tradingCells?: ReadonlySet<number>;` để phục vụ Unit Test cô lập.
  2. Tích hợp `useMemo` kết nối Store:
     ```tsx
     const storeActiveModal = useGameStore((s) => s.activeModal);
     const storeModalPayload = useGameStore((s) => s.modalPayload);
     const storePendingTradeOffer = useGameStore((s) => s.pendingTradeOffer);
     const localPlayerId = useLobbyStore((s) => s.myPlayerId);

     const tradingCellSet = useMemo(() => {
       if (propTradingCells) return propTradingCells;
       return resolvePlayerTradingCells(
         { activeModal: storeActiveModal, modalPayload: storeModalPayload, pendingTradeOffer: storePendingTradeOffer },
         player.id,
         localPlayerId
       );
     }, [propTradingCells, storeActiveModal, storeModalPayload, storePendingTradeOffer, player.id, localPlayerId]);
     ```
  3. Cập nhật rendering cho cả cụm 22 BĐS màu và cụm 6 Hạ tầng/Tiện ích:
     - `isTrading = tradingCellSet.has(cell.index)`.
     - `data-trading={isTrading ? 'true' : 'false'}`.
     - `style`:
       ```tsx
       style={{
         ...(isOwned ? { backgroundColor: COLOR_GROUP_HEX[group] } : {}),
         ...(isTrading ? ({ '--tw-ring-offset-color': '#FFFDF8' } as React.CSSProperties) : {}),
       }}
       ```
     - `className`:
       ```tsx
       `w-2 h-2 sm:w-[9px] sm:h-[9px] md:w-2.5 md:h-2.5 rounded-full transition-all shrink-0 ${
         isTrading
           ? 'relative z-10 scale-110 ring-1.5 ring-amber-400/90 ring-offset-1 shadow-xs animate-pulse'
           : ''
       } ${
         isOwned
           ? 'border border-slate-900/50 shadow-2xs'
           : 'border border-slate-300 bg-slate-100/70'
       }`
       ```
     - `title`:
       ```tsx
       title={`${cell.name}: ${isOwned ? 'Đã sở hữu' : 'Chưa sở hữu'}${isTrading ? ' (Đang trong giao dịch 🤝)' : ''}`}
       ```

### Task 3: Đồng Bộ Thời Gian Thực An Toàn Trong `TradeModal` (Tránh Side-Effect Trong Updater)
- **Vị trí**: `src/client/ui/modals/trade_modal.tsx`.
- **Hành động**: Tách biệt rõ ràng việc cập nhật state React nội bộ và việc phát tín hiệu cập nhật Store ngoài updater callback:
  ```tsx
  const toggleProperty = (cellId: number, isMine: boolean) => {
    if (isMine) {
      const nextOffered = offered.includes(cellId)
        ? offered.filter((id) => id !== cellId)
        : [...offered, cellId];
      setOffered(nextOffered);
      useGameStore.getState().updateModalPayload<'trade'>({
        offeredProperties: nextOffered,
        requestedProperties: requested,
      });
    } else {
      const nextRequested = requested.includes(cellId)
        ? requested.filter((id) => id !== cellId)
        : [...requested, cellId];
      setRequested(nextRequested);
      useGameStore.getState().updateModalPayload<'trade'>({
        offeredProperties: offered,
        requestedProperties: nextRequested,
      });
    }
  };
  ```

### Task 4: Bộ Kiểm Thử Hợp Đồng Đầy Đủ 16 Atomic Tests (Vượt Sàn >= 15)
- **Vị trí**: `tests/client/imp228_subtle_property_trading_indicators.test.ts`.
- **Quy chuẩn Detroit Style & Universal 5-Facet Behavioral Matrix**:
  - **Facet 1: Phân Giải Thuần Túy & Độc Lập Trạng Thái (4 tests)**
    * `[TC-228.01/MSS]`: `resolvePlayerTradingCells` trả về Set rỗng khi không có modal hoặc offer nào.
    * `[TC-228.02/MSS]`: `resolvePlayerTradingCells` nhận diện chính xác `pendingTradeOffer.cellIndex` cho seller và `offeredCellIndex` cho buyer.
    * `[TC-228.03/MSS]`: `resolvePlayerTradingCells` nhận diện chính xác các ô trong `bot_trade_offer`.
    * `[TC-228.04/MSS]`: `resolvePlayerTradingCells` nhận diện `offeredProperties` cho local player và `requestedProperties` cho target player trong `trade`.
  - **Facet 2: Cách Ly Chủ Quyền & Phòng Vệ Magic String (3 tests)**
    * `[TC-228.05/MSS]`: Người chơi thứ 3 không liên quan trong phòng luôn nhận Set rỗng (Attribution Isolation).
    * `[TC-228.06/MSS]`: Khi `localPlayerId` là `undefined` (chưa join phòng), nhánh local offer trả về Set rỗng, TUYỆT ĐỐI không fallback `'p1'`.
    * `[TC-228.07/MSS]`: Target player vẫn nhận diện đúng `requestedProperties` ngay cả khi `localPlayerId` của đối tác là bất kỳ chuỗi UUID nào.
  - **Facet 3: Đánh Dấu DOM & CSS Chống Purge (3 tests)**
    * `[TC-228.08/MSS]`: Chấm bình thường (`isTrading = false`) có `data-trading="false"` và không chứa class `ring-1.5`.
    * `[TC-228.09/MSS]`: Chấm đang giao dịch (`isTrading = true`) có `data-trading="true"`, chứa class `ring-1.5 ring-amber-400/90 animate-pulse scale-110`, và có inline style `--tw-ring-offset-color: #FFFDF8`.
    * `[TC-228.10/MSS]`: Tooltip `title` tự động bổ sung hậu tố `(Đang trong giao dịch 🤝)` khi `isTrading = true`.
  - **Facet 4: Cụm Hạ Tầng & Dọn Dẹp Trạng Thái (3 tests)**
    * `[TC-228.11/MSS]`: 4 ô Ga tàu và 2 ô Tiện ích hiển thị chính xác `data-trading="true"` khi nằm trong danh sách trao đổi.
    * `[TC-228.12/MSS]`: Khi modal giao dịch đóng (`activeModal = null`), toàn bộ 28 chấm tròn lập tức hoàn trả về `data-trading="false"`.
    * `[TC-228.13/MSS]`: Toàn bộ 28 chấm tròn duy trì 100% `data-testid="dot-cell-X"` và `data-owned` (Zero Regression).
  - **Facet 5: Kiểm Thử Tương Tác Đồng Bộ & Môi Trường Xuất Xưởng (3 tests)**
    * `[TC-228.14/MSS]`: `toggleProperty` gọi xong cập nhật ngay `useGameStore.modalPayload` mà không gây ra side-effect trong React updater callback hay dính stale closure.
    * `[TC-228.15/MSS]`: Kết xuất SSR headless qua `renderToStaticMarkup` với `localPlayerId = undefined` chạy trơn tru 100% không văng lỗi.
    * `[TC-228.16/MSS]`: Kiểm tra tính toàn vẹn biên dịch (Production Build Safety) qua `npm run build`.

---

## 5. Tiêu Chuẩn Hoàn Thành (Definition of Done)
1. 100% 16/16 atomic tests trong `tests/client/imp228_subtle_property_trading_indicators.test.ts` PASS.
2. `tests/client/imp173_player_card_property_clusters.test.ts` tiếp tục PASS 100%.
3. `node scripts/lint_ui.mjs` đạt 0 anti-patterns.
4. `npx tsc --noEmit` đạt 0 lỗi biên dịch.
5. `npm run build` xuất gói thành công (chứng minh CSS không bị purge).
6. File `player_card.tsx` giữ dưới 340 dòng (trần 500 LOC).
