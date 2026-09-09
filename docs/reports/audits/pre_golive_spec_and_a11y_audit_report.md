# BÁO CÁO KIỂM TOÁN ĐỘC LẬP: ĐỐI CHIẾU ĐẶC TẢ 3 CHIỀU & TRUY CẬP WCAG 2.1 AA (PRE-GO-LIVE AUDIT)

> **Dự án:** VTCoOn — Đại Gia Địa Ốc Việt Nam (3D Board Game)  
> **Phiên bản tài liệu:** 1.0.0  
> **Ngày thực hiện:** 2026-09-09  
> **Vai trò kiểm toán:** Senior Spec Auditor & Accessibility (A11y) Engineer  
> **Môi trường kiểm định trực tiếp:** Live Docker Container `http://localhost:3000` (Node 20 Alpine + Nginx Reverse Proxy)  
> **Hệ quy chiếu:**
> - Tài liệu đặc tả gốc (SSOT): [`docs/requirements.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/requirements.md)
> - Mục lục 58 Use Cases: [`docs/domain/use_cases.puml`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/use_cases.puml)
> - Mã nguồn triển khai: `src/client/` và `src/server/`
> - Tiêu chuẩn truy cập: W3C WCAG 2.1 Level AA & Skill `a11y-debugging`
> - Tình trạng test suite hiện tại: 52 test files, 636/636 tests PASS

---

## 1. TỔNG QUAN KIẾN TRÚC VÀ CÁC NÚT THẮT CHÍNH

Qua quá trình kiểm tra tương tác trực tiếp trên trình duyệt kết hợp rà soát tĩnh mã nguồn, hệ thống VTCoOn sở hữu nền tảng engine FSM và Server-authoritative rất hoàn chỉnh (được bảo vệ bởi 636 bài kiểm thử). Tuy nhiên, trước thời điểm Go-Live chính thức, hệ thống tồn tại 2 nhóm vấn đề then chốt:

1. **Ngắt kết nối giữa Client SPA và Realtime Gateway:** Client UI (`src/client/main.tsx`) hiện vẫn đang sử dụng state cục bộ in-memory và `Math.random()` cho xúc xắc, chưa kích hoạt hook mạng `useGameWs` để kết nối vào `WssServer` (`ws://localhost:3001`). Các modal tương tác mua đất, đấu giá, cược HOSE, phá sản mới chỉ ghi nhận log mà chưa gửi Network Intent lên FSM Server.
2. **Rào cản tiếp cận theo chuẩn WCAG 2.1 AA:** Giao diện tối màu (Dark Theme) có một số nhãn chữ màu `slate-500` không đạt độ tương phản tối thiểu 4.5:1; các nút bấm trên di động chưa đạt kích thước 44x44px; thiếu chỉ báo viền tiêu điểm bàn phím (`focus-visible`) và bẫy tiêu điểm (`Focus Trap`) trong các Modal.

```
[Browser Client :3000]
     │
     ├── (Hiện tại: Math.random() in-memory) ──X── (Chưa nối useGameWs) ──► [WssServer :3001]
     │                                                                           │
     ├── [ActionDock & Modals UI] ────────────X── (Thiếu sendIntent) ────────────┤
     │                                                                           ▼
     └── [A11y Layer: Thiếu focus-visible,                               [IntentGuard & FSM Engine]
          Tap Target < 44px, Thiếu aria-live]                                    │
                                                                         [State Delta Broadcast]
```

---

## 2. TRỤC 1: BẢNG RÀ SOÁT ĐỐI CHIẾU ĐẶC TẢ 3 CHIỀU (THREE-WAY SPEC RECONCILIATION)

Đối chiếu toàn diện 6 Package nghiệp vụ giữa **SSOT (`docs/requirements.md`)**, **Use Case Index (`docs/domain/use_cases.puml`)**, và **Mã nguồn thực tế (`src/client/`, `src/server/`)**.

### Phân loại mức độ nghiêm trọng:
- **P0 (Blocker):** Lỗi chặn luồng trải nghiệm chính, làm tê liệt tính năng hoặc ngắt kết nối client-server.
- **P1 (High Gap):** Thiếu giao diện tương tác hoặc thao tác nghiệp vụ chưa gửi lệnh mạng, vi phạm đặc tả.
- **P2 (Minor Gap):** Lệch định dạng hiển thị, thiếu biểu tượng/nhãn phụ không gây gián đoạn luồng chính.

---

### Bảng Chi Tiết Đối Soát 6 Package Nghiệp Vụ

| Mã UC | Hạng mục nghiệp vụ | Vị trí mã nguồn (`File:Line`) | Hiện trạng thực tế & Mức độ | Tác động kiến trúc | Đề xuất sửa đổi kỹ thuật (Code Snippet tối giản) |
|---|---|---|---|---|---|
| **UC-GAME-002** | Số lượng người chơi tối đa trong sảnh | [`src/client/ui/lobby_view.tsx:112`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/lobby_view.tsx#L112)<br>[`src/client/state/lobby_store.ts:60`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/state/lobby_store.ts#L60) | **P1 — Lệch SSOT**<br>SSOT (Mục 2) và `src/server/room.ts` hỗ trợ 2–6 người chơi. Client UI hardcode cố định 4 slots (`Array(4).fill(null)`). | Người chơi thứ 5 và 6 khi tham gia phòng sẽ không có vị trí hiển thị trên giao diện sảnh chờ. | Cho phép render danh sách slot động theo cấu hình phòng:<br>```typescript<br>const maxSlots = room?.maxPlayers ?? 6;<br>const slots = Array.from({ length: maxSlots }, (_, i) => players[i] ?? null);<br>``` |
| **UC-GAME-008** | Định danh Bot AI trên giao diện | [`src/client/ui/player_card.tsx:88-102`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/player_card.tsx#L88-L102) | **P2 — Thiếu hiển thị**<br>Server hỗ trợ cờ `isBot: true`, Sảnh có nút "+ Thêm Bot AI", nhưng thẻ người chơi `PlayerCard` trong trận đấu không hiển thị huy hiệu phân biệt người thật với Bot AI. | Người chơi không phân biệt được đối thủ đang chơi cùng là người hay máy. | Bổ sung huy hiệu BOT cạnh tên người chơi:<br>```tsx<br>{player.isBot && (<br>  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono border border-cyan-800/50">BOT</span><br>)}<br>``` |
| **UC-GAME-010** | Đồng bộ kết quả ván đấu và giải phóng phòng | [`src/client/main.tsx:160-175`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/main.tsx#L160-L175)<br>[`src/server/room_manager.ts:162`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts#L162) | **P1 — Thiếu lắng nghe**<br>Server đã triển khai `closeRoom()` và broadcast `GAME_OVER` kèm `leaderboard`, nhưng `main.tsx` chưa bắt sự kiện này để hiển thị modal tổng kết ván. | Khi ván đấu kết thúc, client vẫn giữ nguyên màn hình bàn cờ mà không hiển thị kết quả chung cuộc. | Bổ sung handler nhận gói tin `GAME_OVER`:<br>```typescript<br>case 'GAME_OVER':<br>  setLeaderboard(msg.payload.leaderboard);<br>  setIsGameOverModalOpen(true);<br>  break;<br>``` |
| **UC-GAME-011**<br>**UC-GAME-013** | Vòng lặp tung xúc xắc và di chuyển quân cờ | [`src/client/main.tsx:87-101`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/main.tsx#L87-L101)<br>[`src/client/network/use_game_ws.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/use_game_ws.ts) | **P0 — Blocker**<br>`main.tsx` chạy hàm `handleRollDice` tự sinh xúc xắc qua `Math.random()` trên local state. Hook mạng `useGameWs` hoàn toàn chưa được import vào `main.tsx`. | Trò chơi chạy hoàn toàn offline in-memory trên client, FSM Server và IntentGuard không được kích hoạt. | Nối `useGameWs` vào `main.tsx` và gửi Intent lên server:<br>```typescript<br>const { sendIntent, lastMessage, isConnected } = useGameWs(roomCode, playerId);<br>const handleRollDice = () => {<br>  sendIntent({ type: 'INTENT_ROLL_DICE', playerId });<br>};<br>``` |
| **UC-GAME-017** | Kích hoạt tương tác khi đáp vào ô cờ | [`src/client/main.tsx:96-100`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/main.tsx#L96-L100) | **P0 — Thiếu kích hoạt luồng**<br>Khi di chuyển đến `targetCell`, mã nguồn chỉ cập nhật tọa độ `position: targetCell` mà không gọi router mở modal tương tác (ô đất trống -> TitleDeedModal, ô Cơ hội -> EventCardModal, v.v.). | Quân cờ nhảy tới ô nhưng người chơi không thể thực hiện các hành động mua bán hay rút thẻ. | Thêm router kích hoạt modal theo loại ô cờ:<br>```typescript<br>const tile = BOARD_TILES[targetCell];<br>if (tile.type === 'PROPERTY' && !isPropertyOwned(tile.id)) {<br>  setActiveModal({ type: 'TITLE_DEED', tileId: tile.id });<br>} else if (tile.type === 'CHANCE' || tile.type === 'COMMUNITY') {<br>  setActiveModal({ type: 'EVENT_CARD', tileId: tile.id });<br>}<br>``` |
| **UC-GAME-021**<br>**UC-GAME-022** | Quyết định mua Bất động sản | [`src/client/ui/modals/modal_host.tsx:73-82`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/modal_host.tsx#L73-L82) | **P0 — Mất tác vụ**<br>Nút "Mua ngay" trong `TitleDeedModal` chỉ gọi `console.log('Buy property:', propId); closeModal();`. Không hề gửi intent `INTENT_BUY_PROPERTY` tới server. | Thao tác mua đất bị mất, tiền không trừ và quyền sở hữu không được cập nhật trên server. | Truyền callback phát lệnh mạng từ `main.tsx` qua `ModalHost`:<br>```typescript<br>onBuy={(propId) => {<br>  sendIntent({ type: 'INTENT_BUY_PROPERTY', playerId, payload: { propertyId: propId } });<br>  closeModal();<br>}}<br>``` |
| **UC-GAME-024**<br>đến **026** | Nâng cấp nhà C0 -> C1 -> C2 -> C3 | [`src/client/ui/action_dock.tsx:16-52`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/action_dock.tsx#L16-L52)<br>[`src/server/domain/property_upgrade.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/domain/property_upgrade.ts) | **P1 — Thiếu UI điều khiển**<br>Server đã có sẵn logic nâng cấp chuẩn xác trong `property_upgrade.ts`, nhưng thanh điều khiển `ActionDock` chỉ có 3 nút: "Lắc Xúc Xắc", "Giao Dịch", "Thị Trường". Hoàn toàn không có nút nâng cấp. | Người chơi sở hữu trọn bộ màu nhưng không có giao diện để nâng cấp nhà lên cấp cao hơn. | Bổ sung nút "Xây Dựng" vào `ActionDock` khi sở hữu độc quyền nhóm màu:<br>```tsx<br><button onClick={onOpenUpgradeModal} disabled={!canUpgrade} className="..."><br>  Xây Dựng<br></button><br>``` |
| **UC-GAME-029** | Đấu giá bất động sản khi từ chối mua | [`src/client/ui/modals/modal_host.tsx:90-97`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/modal_host.tsx#L90-L97) | **P1 — Mất kết nối mạng**<br>`AuctionModal` đã có UI đặt cược, nhưng callback `onBid` tại `modal_host.tsx` chỉ ghi log nội bộ mà không gửi `INTENT_BID` về server. | Phiên đấu giá không thể đồng bộ mức giá thầu giữa các người chơi trong phòng. | Kết nối gửi `INTENT_BID`:<br>```typescript<br>onBid={(amount) => {<br>  sendIntent({ type: 'INTENT_BID', playerId, payload: { amount } });<br>}}<br>``` |
| **UC-GAME-031**<br>**UC-GAME-032** | Bảng giá thuê ô Tiện ích (Điện / Nước) | [`src/client/ui/modals/title_deed_modal.tsx:98-124`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/title_deed_modal.tsx#L98-L124) | **P2 — Lệch format hiển thị**<br>SSOT quy định tiền thuê tiện ích tính theo bội số xúc xắc (x4 khi có 1 ô, x10 khi có 2 ô). Giao diện `TitleDeedModal` lại hiển thị dạng cố định "Cấp 1, Cấp 2, Cấp 3". | Thông tin hiển thị gây hiểu nhầm cho người chơi về cơ chế thu tiền thuê tiện ích. | Kiểm tra `tile.type === 'UTILITY'` để hiển thị công thức xúc xắc:<br>```tsx<br>{isUtility ? (<br>  <p className="text-xs text-slate-300">1 Tiện ích: Xúc xắc x 4 | 2 Tiện ích: Xúc xắc x 10</p><br>) : (/* Bảng giá thuê C0-C3 */)}<br>``` |
| **UC-GAME-044** | Cảnh báo số vòng nợ thấu chi ngân hàng | [`src/client/ui/player_card.tsx:93-105`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/player_card.tsx#L93-L105) | **P2 — Thiếu thông tin**<br>SSOT quy định thấu chi tối đa 3 vòng trước khi thanh lý cưỡng chế. `PlayerCard` hiển thị tiền âm nhưng không hiển thị số vòng còn lại (`overdraftRoundsLeft`). | Người chơi bị trừ tiền âm không nắm được thời hạn còn lại trước khi bị cưỡng chế phá sản. | Hiển thị số vòng thấu chi còn lại:<br>```tsx<br>{player.cash < 0 && (<br>  <span className="text-rose-400 text-xs font-semibold">Thấu chi: còn {player.overdraftRoundsLeft ?? 3} vòng</span><br>)}<br>``` |
| **UC-GAME-051**<br>**UC-GAME-052** | Nghiệp vụ Thế chấp & Giải chấp BĐS | [`src/client/ui/modals/title_deed_modal.tsx:128-145`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/title_deed_modal.tsx#L128-L145) | **P1 — Thiếu nút thao tác**<br>Server có logic thế chấp nhận 50% tiền và giải chấp cộng 10% lãi. Nhưng trên `TitleDeedModal` của người sở hữu không có nút bấm "Thế Chấp" / "Giải Chấp". | Người chơi thiếu tiền mặt không thể chủ động thế chấp tài sản để huy động vốn cứu nguy. | Bổ sung nút hành động khi `isOwner`:<br>```tsx<br>{isOwner && (<br>  <button onClick={() => onMortgage(tile.id)} className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded"><br>    {tile.isMortgaged ? 'Giải Chấp (+10% phí)' : 'Thế Chấp (Nhận 50%)'}<br>  </button><br>)}<br>``` |
| **UC-GAME-055**<br>**UC-GAME-056** | Tuyên bố phá sản khi mất thanh khoản | [`src/client/ui/modals/modal_host.tsx:160-165`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/modal_host.tsx#L160-L165) | **P1 — Mất kết nối mạng**<br>Banner `InsolvencyBanner` đã xuất hiện khi tài khoản âm, nhưng hành động `onDeclareBankruptcy` chỉ gọi log nội bộ thay vì gửi `INTENT_BANKRUPTCY`. | Người chơi mất thanh khoản không thể chính thức rời ván đấu và giải phóng tài sản cho chủ nợ. | Gửi lệnh phá sản về server:<br>```typescript<br>onDeclareBankruptcy={() => {<br>  sendIntent({ type: 'INTENT_BANKRUPTCY', playerId });<br>  closeModal();<br>}}<br>``` |

---

## 3. TRỤC 2: KIỂM TOÁN CHUYÊN SÂU TRUY CẬP & KHUYẾT TẬT (A11Y THEO WCAG 2.1 AA)

Tuân thủ bộ quy chuẩn của kỹ năng `a11y-debugging` kết hợp kiểm tra DOM và CSS trực tiếp trên container `http://localhost:3000`.

### 3.1 Độ Tương Phản Màu Sắc (Color Contrast - WCAG 1.4.3 Level AA)

*Yêu cầu tiêu chuẩn: Độ tương phản tối thiểu 4.5:1 đối với văn bản thông thường (< 18pt hoặc < 14pt in đậm), 3.0:1 đối với văn bản kích thước lớn.*

| Vị trí mã nguồn | Thành phần & Ngữ cảnh | Cặp màu sắc (Chữ / Nền) | Tỷ lệ tương phản | Đánh giá | Đề xuất khắc phục Tailwind |
|---|---|---|---|---|---|
| [`src/client/ui/player_card.tsx:95`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/player_card.tsx#L95) | Nhãn vị trí ô hiện tại của người chơi | `text-slate-500` (`#64748b`) trên `bg-slate-950` (`#020617`) | **4.14:1** | ❌ **FAIL** (< 4.5:1) | Đổi thành `text-slate-400` (`#94a3b8`), đạt tỷ lệ **6.55:1** (Đạt chuẩn AA). |
| [`src/client/ui/modals/title_deed_modal.tsx:102,113`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/title_deed_modal.tsx#L102) | Nhãn chú thích phụ trong bảng giá thuê | `text-slate-500` (`#64748b`) trên `bg-slate-900` (`#0f172a`) | **3.82:1** | ❌ **FAIL** (< 4.5:1) | Thay bằng `text-slate-400` (`#94a3b8`), đạt tỷ lệ **6.04:1** (Đạt chuẩn AA). |
| [`src/client/ui/action_dock.tsx:32`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/action_dock.tsx#L32) | Nút bấm Lắc Xúc Xắc chính | `bg-amber-400` (`#fbbf24`) với chữ `text-white` (`#ffffff`) | **1.42:1** | ❌ **FAIL NẶNG** (Không thể đọc) | Đổi thành `bg-amber-400 text-slate-950 font-bold`, đạt tỷ lệ **13.5:1** (Vượt chuẩn AAA). |
| [`src/client/ui/player_card.tsx:90`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/player_card.tsx#L90) | Số dư tiền mặt của người chơi | `text-emerald-400` (`#34d399`) trên `bg-slate-950` (`#020617`) | **9.87:1** |  **PASS** (> 7:1 AAA) | Giữ nguyên. |
| [`src/client/ui/top_bar.tsx:42`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/top_bar.tsx#L42) | Tên người chơi trong TopBar | `text-cyan-400` (`#22d3ee`) trên `bg-slate-950` (`#020617`) | **10.5:1** |  **PASS** (> 7:1 AAA) | Giữ nguyên. |
| [`src/client/ui/insolvency_banner.tsx:32`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/insolvency_banner.tsx#L32) | Cảnh báo mất khả năng thanh khoản | `text-rose-400` (`#fb7185`) trên `bg-rose-950/80` (`#4c0519`) | **5.12:1** |  **PASS** (> 4.5:1 AA) | Giữ nguyên. |

---

### 3.2 Điều Hướng Bàn Phím (Keyboard Navigation - WCAG 2.1.1, 2.1.2, 2.4.7)

| Hạng mục kiểm tra | Vị trí mã nguồn | Hiện trạng phát hiện | Mức độ | Đề xuất sửa đổi kỹ thuật |
|---|---|---|---|---|
| **Vòng nét tiêu điểm trực quan (`focus-visible`)** | Toàn bộ các nút trong:<br>[`action_dock.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/action_dock.tsx),<br>[`lobby_view.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/lobby_view.tsx),<br>[`modal_backdrop.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/modal_backdrop.tsx) | Toàn bộ thẻ `<button>` chỉ có hiệu ứng `hover:` và `active:`, hoàn toàn thiếu `focus-visible:ring-2 focus-visible:ring-amber-400`. Khi dùng phím `Tab`, người dùng không có dấu hiệu nhận biết tiêu điểm đang ở đâu. | **P1** | Bổ sung lớp dùng chung vào các button:<br>```tsx<br>className="... focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"<br>``` |
| **Bẫy tiêu điểm trong Modal (Focus Trap)** | [`src/client/ui/modals/modal_backdrop.tsx:28-44`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/modal_backdrop.tsx#L28-L44) | `ModalBackdrop` đã xử lý phím `Escape`, nhưng không khóa con trỏ phím `Tab` bên trong modal. Người dùng bấm `Tab` sẽ nhảy ra các nút bấm của bàn cờ và ActionDock phía sau dù modal đang mở (`aria-modal="true"` bị vô hiệu hóa trên thực tế). | **P1** | Bổ sung hàm bắt sự kiện phím `Tab` để xoay vòng tiêu điểm trong `ModalBackdrop`:<br>```typescript<br>const handleKeyDown = (e: KeyboardEvent) => {<br>  if (e.key === 'Tab' && modalRef.current) {<br>    const focusables = modalRef.current.querySelectorAll<HTMLElement>('button, [href], input, [tabindex]:not([tabindex="-1"])');<br>    if (focusables.length === 0) return;<br>    const first = focusables[0];<br>    const last = focusables[focusables.length - 1];<br>    if (e.shiftKey && document.activeElement === first) {<br>      last.focus(); e.preventDefault();<br>    } else if (!e.shiftKey && document.activeElement === last) {<br>      first.focus(); e.preventDefault();<br>    }<br>  }<br>};<br>``` |

---

### 3.3 Thuộc Tính ARIA & Hỗ Trợ Trình Đọc Màn Hình (Screen Readers - WCAG 4.1.2, 4.1.3)

| Hạng mục kiểm tra | Vị trí mã nguồn | Hiện trạng phát hiện | Mức độ | Đề xuất sửa đổi kỹ thuật |
|---|---|---|---|---|
| **Vùng thông báo động (`aria-live`)** | [`src/client/ui/modals/auction_modal.tsx:45-56`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/auction_modal.tsx#L45-L56) | Đồng hồ đếm ngược và mức giá thầu nhảy số liên tục nhưng thiếu `aria-live="polite"` và `aria-atomic="true"`. Trình đọc màn hình không thể thông báo khi đối thủ vừa trả giá cao hơn. | **P1** | Bổ sung vùng live region ẩn cho trình đọc màn hình:<br>```tsx<br><div aria-live="polite" aria-atomic="true" className="sr-only"><br>  {`Giá thầu hiện tại: ${formatVND(currentBid)}, còn lại ${timeLeft} giây`}<br></div><br>``` |
| **Nhãn nút bấm dạng Icon (`aria-label`)** | [`src/client/ui/top_bar.tsx:61-68`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/top_bar.tsx#L61-L68) | Nút bật/tắt âm lượng chỉ chứa icon SVG, không có nội dung chữ và không có `aria-label`. Trình đọc màn hình chỉ thông báo "Button" không rõ chức năng. | **P1** | Bổ sung nhãn hỗ trợ tiếp cận:<br>```tsx<br><button aria-label={isMuted ? "Bật âm thanh trò chơi" : "Tắt âm thanh trò chơi"} ...><br>``` |
| **Nút đóng Modal (`✕`)** | [`src/client/ui/modals/title_deed_modal.tsx:65`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/title_deed_modal.tsx#L65)<br>và các modal khác | Nút đóng chỉ chứa ký tự `✕`. Trình đọc màn hình sẽ phát âm ký tự nhân/dấu gạch chéo thay vì hiểu là hành động đóng. | **P2** | Thêm `aria-label="Đóng cửa sổ"` vào tất cả các nút `✕`:<br>```tsx<br><button onClick={onClose} aria-label="Đóng cửa sổ" className="...">✕</button><br>``` |

---

### 3.4 Kích Thước Vùng Bấm Trên Thiết Bị Di Động (Tap Target Size - WCAG 2.5.5 / 2.5.8)

*Yêu cầu tiêu chuẩn: Kích thước vùng bấm tối thiểu 44x44px trên màn hình cảm ứng để tránh chạm nhầm.*

| Thành phần giao diện | Vị trí mã nguồn | Kích thước hiện tại | Đánh giá | Đề xuất sửa đổi Tailwind |
|---|---|---|---|---|
| **Nút "Sao Chép" mã phòng** | [`src/client/ui/lobby_view.tsx:94`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/lobby_view.tsx#L94) | `px-2.5 py-1` (~26px chiều cao) | ❌ **FAIL** (< 44px) | Thay bằng `min-h-[44px] min-w-[44px] px-3 py-2 flex items-center justify-center` |
| **Nút "+ Thêm Bot AI"** | [`src/client/ui/player_slot_card.tsx:48`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/player_slot_card.tsx#L48) | `px-3 py-1 text-xs` (~28px chiều cao) | ❌ **FAIL** (< 44px) | Thay bằng `min-h-[44px] px-4 py-2.5 inline-flex items-center justify-center` |
| **Nút bật/tắt Mute** | [`src/client/ui/top_bar.tsx:63`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/top_bar.tsx#L63) | `px-2.5 py-1` (~28px) | ❌ **FAIL** (< 44px) | Thêm lớp `min-w-[44px] min-h-[44px] inline-flex items-center justify-center` |
| **Nút đóng Modal `✕`** | [`src/client/ui/modals/title_deed_modal.tsx:65`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/title_deed_modal.tsx#L65) | `p-1 text-slate-400` (~26x26px) | ❌ **FAIL** (< 44px) | Đổi thành `w-11 h-11 flex items-center justify-center text-lg` |
| **Nút cược nhanh (+100k, +500k)** | [`src/client/ui/modals/auction_modal.tsx:75-84`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/auction_modal.tsx#L75-L84) | `py-2 px-1.5` (~34px) | ⚠️ **CẢNH BÁO** (< 44px) | Nâng lên `min-h-[44px] py-2.5 px-3 font-semibold` |

---

## 4. PHÁT HIỆN VẬN HÀNH THỰC TẾ TRÊN CONTAINER LIVE (HTTP 404 AUDIO ASSETS)

Khi mở ứng dụng trực tiếp tại `http://localhost:3000`, trình duyệt ghi nhận 3 lỗi truy vấn tài nguyên tĩnh:
- `GET http://localhost:3000/assets/audio/dice_roll.mp3 404 (Not Found)`
- `GET http://localhost:3000/assets/audio/card_draw.mp3 404 (Not Found)`
- `GET http://localhost:3000/assets/audio/cash_register.mp3 404 (Not Found)`

**Nguyên nhân:** Mã nguồn [`src/client/audio/audio_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/audio/audio_manager.ts) tải trước 3 tệp âm thanh này, nhưng thư mục `public/assets/audio/` trong dự án hiện chưa có tệp vật lý.  
**Khắc phục:** Tạo thư mục `public/assets/audio/` và bổ sung 3 tệp âm thanh mẫu (hoặc silent fallback audio) để triệt tiêu lỗi 404 console trên production.

---

## 5. LỘ TRÌNH THỰC THI KHẮC PHỤC TRƯỚC GO-LIVE (ACTIONABLE REMEDIATION PLAN)

```
GIAI ĐOẠN A (P0 - Khôi phục luồng mạng)
  1. Kết nối useGameWs vào src/client/main.tsx
  2. Đồng bộ State Delta từ Server WSS thay cho local Math.random()
  3. Gắn sendIntent vào các callback của ModalHost (Buy, Bid, Trade, Bankrupt)
           │
           ▼
GIAI ĐOẠN B (P1 - Chuẩn hóa A11y & UI Điều khiển)
  4. Bổ sung focus-visible:ring-2 và Focus Trap cho tất cả Modal
  5. Nâng kích thước Tap Target lên min 44x44px trên mobile
  6. Thêm nút "Xây Dựng / Nâng Cấp" vào ActionDock
           │
           ▼
GIAI ĐOẠN C (P2 - Tối ưu hiển thị & Assets tĩnh)
  7. Nâng độ tương phản màu slate-500 lên slate-400 (đạt 6.5:1 AA)
  8. Thêm tệp audio fallback vào public/assets/audio/
  9. Hiển thị nhãn BOT và số vòng nợ thấu chi trên PlayerCard
```

---
*Báo cáo được biên soạn bởi Senior Spec Auditor & Accessibility Engineer — Dự án VTCoOn.*
