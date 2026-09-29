# BÁO CÁO HOÀN THÀNH — IMP-228: SUBTLE PROPERTY TRADING INDICATORS ON PLAYER CARDS

> **Mã Ticket**: `IMP-228` | **Loại Thay Đổi**: Tier 2 (Full Rigor — Client UI Polish & State Sync)  
> **Trạng Thái**: ✅ **HOÀN THÀNH — PRODUCTION READY**  
> **Thực Hiện Theo**: Quy Trình 4 Trạm Khép Kín Hiến Pháp Antigravity (`GEMINI.md`)  
> **Evidence Snapshot**: [`.agents/evidence/imp228_execution.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp228_execution.json)

---

## 1. TỔNG QUAN YÊU CẦU & BỐI CẢNH KỸ THUẬT

- **Yêu cầu người dùng**: Khi diễn ra giao dịch mua bán / đổi đất giữa các người chơi (P2P Trade hoặc Bot Trade Offer), các chấm tròn đại diện cho các ô đất liên quan trên 4 ô player section (Player Cards trong Player HUD) sẽ hiển thị một chỉ báo tinh tế, vừa đủ, giúp người chơi nhận biết tài sản nào đang được đưa lên bàn đàm phán mà **tuyệt đối không làm quá nổi bật** (không làm chói mắt, không viền neon quá dày, không scale giật cục gây vỡ layout 11 chấm/dòng trên mobile 360px).
- **Tiếp thu 4 phản biện kỹ thuật (Reviewer Inoculation Ledger)**:
  1. **P1 (CRITICAL - Chống Tailwind Purge)**: Loại bỏ triệt để arbitrary class `ring-offset-[#FFFDF8]` trong template string động. Sử dụng class tĩnh `ring-offset-1` phối hợp inline CSS custom property `style={{ '--tw-ring-offset-color': '#FFFDF8' }}`. Đã kiểm chứng qua production build `npm run build` thành công 100%.
  2. **P2 (HIGH - React Pure Updater)**: Tách biệt việc cập nhật state nội bộ và việc gọi `updateModalPayload` ra ngoài callback updater của `setOffered`/`setRequested`, loại trừ 100% side-effect kép trong React Concurrent Mode và chống stale closure.
  3. **P3 (MEDIUM - Khử Magic String 'p1')**: Trong `resolvePlayerTradingCells`, khi `localPlayerId` là `undefined` (chưa join phòng hoặc SSR headless), nhánh local offer trả về Set rỗng thay vì fallback về `'p1'`.
  4. **P4 (MEDIUM - Vượt Sàn >= 15 Atomic Tests)**: Thiết kế và triển khai đủ 16 atomic tests phủ trọn vẹn 5 khía cạnh hành vi (Universal 5-Facet Behavioral Matrix).

---

## 2. NỘI DUNG VÀ KIẾN TRÚC TRIỂN KHAI

### 2.1 Hàm Thuần Túy Phân Giải BĐS Giao Dịch (`src/client/ui/player_card.tsx`)
- Triển khai pure function `resolvePlayerTradingCells(tradeState, playerId, localPlayerId)`:
  - Bóc tách tài sản từ 3 nguồn: `pendingTradeOffer`, `bot_trade_offer`, và `trade`.
  - Phân tách rạch ròi ô bán (`cellIndex`/`offeredProperties`) và ô mua/đổi (`offeredCellIndex`/`requestedProperties`).
  - Độc lập 100% khỏi React DOM, bảo vệ an toàn cho SSR headless và UUID.

### 2.2 Hiển Thị Tinh Tế Trên Thẻ Người Chơi (`PlayerCard`)
- Mở rộng `PlayerCardProps`: Thêm prop `readonly tradingCells?: ReadonlySet<number>`.
- Hook kết nối store: Sử dụng fine-grained selectors từ `useGameStore` (`activeModal`, `modalPayload`, `pendingTradeOffer`) và `useLobbyStore` (`myPlayerId`).
- `useMemo` tính toán `tradingCellSet` với đầy đủ 6 dependencies, zero timer/memory leak.
- Cập nhật cả 2 cụm: 22 ô BĐS màu và 6 ô Hạ tầng/Tiện ích:
  - `data-trading={isTrading ? 'true' : 'false'}`
  - `className`: Thêm `relative z-10 scale-110 ring-1.5 ring-amber-400/90 ring-offset-1 shadow-xs animate-pulse` khi `isTrading === true`.
  - `style`: Inline `--tw-ring-offset-color: #FFFDF8` (khớp màu nền thẻ, chống purge).
  - `title`: Bổ sung hậu tố trợ năng `(Đang trong giao dịch 🤝)`.

### 2.3 Đồng Bộ Thời Gian Thực An Toàn (`src/client/ui/modals/trade_modal.tsx`)
- Cấu trúc lại hàm `toggleProperty`:
  - Tính toán `nextOffered` / `nextRequested` trước.
  - Gọi `setOffered` / `setRequested`.
  - Gọi `useGameStore.getState().updateModalPayload<'trade'>({...})` ở outer scope (ngoài callback updater).

### 2.4 Ghi Nhận Bất Biến Kiến Trúc (`docs/domain/gotchas.md`)
- Bổ sung Invariant Pillar V.20:
  * Tránh Tailwind arbitrary class trong chuỗi template động.
  * Tách biệt side-effect khỏi React `setState` updater callback.
  * Khử magic string `'p1'`, bảo vệ an toàn SSR và đa người chơi UUID.

---

## 3. KẾT QUẢ QUY TRÌNH 4 TRẠM (4-STATION PIPELINE)

| Trạm | Phụ Trách | Trạng Thái | Chi Tiết |
| :--- | :--- | :---: | :--- |
| **Trạm 1: RED Contract Test** | `qa-tester` | ✅ PASS | Soạn thảo 16 atomic tests trong `tests/client/imp228_subtle_property_trading_indicators.test.ts`. Chứng minh Business RED với 15 tests FAIL đúng lý do kỹ thuật trên mã nguồn gốc. |
| **Trạm 2: GREEN Implementation** | `implementer` | ✅ PASS | Triển khai mã nguồn tối thiểu trên `player_card.tsx` (398 LOC) và `trade_modal.tsx` (305 LOC). Toàn bộ 16/16 atomic tests GREEN; 16/16 tests hồi quy `imp173` PASS. |
| **Trạm 2.5: Fast Pre-Filter Sweep** | `scout` | ✅ PASS | `npx tsc --noEmit` 0 lỗi; `node scripts/lint_ui.mjs` 0 anti-patterns; 0 `as any`; 0 `console.log`; ngân sách LOC an toàn. |
| **Trạm 3, Pha 3.1: Spec & Scope Gate** | `spec-reviewer` & `re-reviewer` | ✅ PASS | Đối soát 100% Plan v2; phát hiện và hoàn tất tinh chỉnh 2 điểm cổng test (rút gọn TC-228.09 $\le 4$ asserts và dọn dẹp dirty casts `as unknown as`). Re-reviewer phê duyệt **APPROVED**. |
| **Trạm 3, Pha 3.2: Deep Architecture** | `code-reviewer` | ✅ PASS | Đạt chuẩn 7/7 tiêu chí ma trận định lượng; Single Responsibility Principle (SRP) hoàn hảo; không rò rỉ bộ nhớ/timer; đồng bộ trạng thái an toàn trong React Concurrent Mode. |
| **Trạm 3, Pha 3.2: 2D UI Craft & Ergonomics** | `ui-craft-reviewer` | ✅ PASS | Đạt điểm tuyệt đối **10/10**. Thẩm định chi tiết: Chống tràn ngang trên màn hình 360px (chỉ chiếm 116px/300px khả dụng); `scale-110` là GPU Transform không làm vỡ lưới; rãnh đệm 1px ngăn lem màu viền hổ phách với màu đất; hoạt ảnh `animate-pulse` đập êm 2s dịu mắt. |

---

## 4. BẢNG NGÂN SÁCH DÒNG MÃ (LOC BUDGETS)

| Tệp Vật Lý | Phân Loại | SLOC Hiện Tại | Trần Ngân Sách | Đánh Giá |
| :--- | :---: | :---: | :---: | :---: |
| `src/client/ui/player_card.tsx` | Tier 2 (UI Component) | 398 | <= 500 | ✔️ An Toàn |
| `src/client/ui/modals/trade_modal.tsx` | Tier 2 (UI Modal) | 305 | <= 500 | ✔️ An Toàn |
| `tests/client/imp228_subtle_property_trading_indicators.test.ts` | Living Contract Test | 374 | <= 600 | ✔️ An Toàn |
| `src/client/ui/modals/modal_host.tsx` | Tier 2 (Host) | 474 | <= 500 | ✔️ Bảo Toàn 100% (Không can thiệp) |

---

## 5. KẾT LUẬN & NGHIỆM THU

Tính năng **IMP-228** đã hoàn thành trọn vẹn, vượt qua tất cả các cổng kiểm định độc lập khắt khe nhất, bảo đảm 100% tiêu chuẩn thẩm mỹ tinh tế của người dùng, sẵn sàng phục vụ trải nghiệm người chơi trong các phiên giao dịch thương thảo BĐS đỉnh cao của VTCOON!
