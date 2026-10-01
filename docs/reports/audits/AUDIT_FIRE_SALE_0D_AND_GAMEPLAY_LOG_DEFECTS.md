# BÁO CÁO PHÁP Y DỮ LIỆU & KIỂM TOÁN LỖI GAME (FORENSIC AUDIT REPORT)
## Sự Cố Đấu Giá 0đ, Lỗi Điều Phối Trạng Thái Phá Sản & Nghẽn Hiệu Năng Phòng `VTM7IV`

> **Mã kiểm toán**: `AUDIT-2026-FIRE-SALE-LOG-02`  
> **Phiên bản & Phòng đấu**: VTCOON Production / Room Code `VTM7IV` (Seed: `2064233200`)  
> **Thời điểm xảy ra**: Tick 445 – Tick 519 (Vòng 24 – 25)  
> **Mức độ rủi ro hệ thống**: **CRITICAL (P1)** — Lỗi logic đấu giá phát mãi, rớt prop giao diện, cắt cụt người chơi trên mobile và tụt FPS nghiêm trọng (14.4 FPS)  

---

### 1. TỔNG QUAN PHÁP Y DỮ LIỆU (FORENSIC OVERVIEW)

Dựa trên hình ảnh chụp màn hình điện thoại di động và dữ liệu hộp đen (JSON Snapshots, Telemetry Metrics, Audit Logs) do người chơi cung cấp, hệ thống đã tái dựng lại toàn bộ dòng sự kiện:

```
[Vòng 24 - Tick 445] p1 phát hành Trái Phiếu Doanh Nghiệp (Thế chấp ô 24 Ninh Bình)
       │
       ▼
[Vòng 25 - Tick 518] p1 giẫm vào ô 34 của Bot 2 -> Dính tiền thuê 14.040đ (Số dư: -11.829đ)
       │
       ▼
[Vòng 25 - Tick 519] p1 bấm Tự động trả nợ (INTENT_AUTO_SOLVENCY) -> Không đủ bù nợ -> PHÁ SẢN
       │
       ▼
[Vòng 25 - Kích hoạt] Tịch thu tài sản đảm bảo (Ô 24 Ninh Bình) -> Kích hoạt Đấu Giá Phát Mãi 0đ
       │
       ├─► BUG 1: Rớt prop isFireSale -> Giao diện không có nút đặt 0đ, hiện 3 nút 100/200/500 bị khóa
       ├─► BUG 2: Người phá sản vẫn bị hiển thị trong danh sách thi đấu giá ví 0đ
       ├─► BUG 3: Container max-h-16 cắt cụt Bot AI 4 khỏi danh sách trên mobile
       └─► BUG 4: Hiệu năng rớt thảm họa: 14.4 FPS, 3.273 Draw Calls
```

---

### 2. GIẢI TRÌNH CƠ CHẾ: TẠI SAO CÓ ĐẤU GIÁ 0Đ?

1. **Khái niệm**: Đây là cơ chế **"Đấu Giá Phát Mãi Cưỡng Chế (Fire Sale Auction)"** theo chuẩn nghiệp vụ của Trái Phiếu Doanh Nghiệp (Slice IMP-192C / ADR).
2. **Quy trình kích hoạt**:
   - Ở vòng 24, người chơi `p1` (Mighty Gecko) phát hành gói trái phiếu lưu động (`INTENT_ISSUE_BOND` lúc `1790848288501`). Ô đất **Ninh Bình (Tràng An - Ô #24)** thuộc quyền sở hữu của `p1` được khóa vào danh mục tài sản đảm bảo (`collateralCells`).
   - Ở vòng 25, `p1` bị phá sản khi dính khoản tiền thuê 14.040đ tại ô 34 của `Bot AI 2`.
   - Khi chủ sở hữu vỡ nợ / phá sản, quy định tại `src/server/bond_manager.ts` (dòng 160-187) và `src/server/insolvency_manager.ts` (dòng 132-140) buộc thu hồi toàn bộ tài sản đảm bảo trái phiếu đưa vào hàng đợi `fireSaleQueue` để đấu giá thanh lý khẩn cấp.
   - Hàm `handleStartFireSaleAuction` khởi tạo phiên đấu giá:
     ```ts
     const session: AuctionSession = {
       cellIndex: 24,
       declinedPlayerId: bankruptPlayerId ?? '',
       highestBid: 0,
       startingBid: 0,
       currentBid: 0,
       passedPlayers: new Set<string>(),
       endTime: Date.now() + 10_000,
       isFireSale: true,
     };
     ```
   - **Mục tiêu thiết kế**: Xả hàng thanh lý nhanh để thu hồi tiền mặt cho Kho Bạc, cho phép người chơi khác có cơ hội mua lại với bất kỳ giá nào từ **0 đồng trở lên** (`startingBid: 0`).

---

### 3. CHI TIẾT 6 LỖI GAME & ĐIỂM BẤT HỢP LÝ PHÁT HIỆN

| STT | Phân Loại | Vị Trí Mã Nguồn | Hiện Tượng Thực Tế | Logic Chuẩn (SSOT) | Mức Độ |
| :---: | :--- | :--- | :--- | :--- | :---: |
| 1 | **Lỗi rớt Prop UI** (Silent Prop Drop) | `src/client/ui/modals/modal_host.tsx:264-282`<br>`src/client/store/game_store_types.ts:124-137` | Bỏ quên không truyền `isFireSale` vào `<AuctionModal />`. Modal nhận `undefined` nên render nút `+100, +200, +500` thay vì `[0, 50, 100]`. Người chơi không có nút bấm 0đ! | Khi `isFireSale && !hasBidder`, 3 nút cược phải là `[0, 50, 100]` (`modal_helpers.ts:76-78`) | **P1** |
| 2 | **Lỗi trạng thái con nợ** (Debtor State Leak) | `src/server/auction_manager.ts:240`<br>`src/client/ui/modals/auction_modal.tsx:347` | Khi xử lý `fireSaleQueue`, `bankruptPlayerId` bị bỏ trống, khiến `isDeclinedPlayer` bị `false`. Người phá sản ví 0đ vẫn thấy cụm nút cược bị khóa và nút "Rút Lui". | Người phá sản / bị phát mãi bị cấm tham gia đặt giá (`auction_manager.ts:71`). Modal phải đóng hoặc chuyển sang chế độ Spectator. | **P1** |
| 3 | **Tràn layout Mobile** (Ghost Bot 4) | `src/client/ui/modals/auction_modal.tsx:296` | Tiêu đề ghi `ĐẠI GIA THAM GIA (4/4)`, nhưng danh sách chỉ thấy 3 người. Bot AI 4 bị cắt mất do container bị kẹp cứng `max-h-16` (64px) và ẩn thanh cuộn. | Danh sách 4 người chơi phải hiển thị đầy đủ hoặc có thanh cuộn chỉ báo rõ ràng trên viewport di động. | **P2** |
| 4 | **Sụt giảm hiệu năng** (Performance Spike) | `Telemetry Metrics` từ Log:<br>`fps: 14.4`, `drawCalls: 3273` | Tốc độ khung hình sụt xuống 14.4 FPS; số lượng lượt vẽ 3D lên tới 3.273 lượt/khung hình; thời gian render khung hình lên tới 74.3ms. | Chuẩn NFR dự án yêu cầu 60 FPS, draw calls trên mobile < 200 lượt/frame. | **P1** |
| 5 | **Lạm phát tiền thuê** (Rent Spike Shock) | Snapshot Tick 518:<br>`balance: 2211 -> -11829` | Người chơi đang có 2.211đ ở vòng 25, chỉ sau 1 bước chân giẫm vào ô 34 bị trừ cú sốc 14.040đ (gấp 7 lần lương GO) và chết ngay lập tức. | Thiếu cơ chế đệm tài chính (financial buffer) hoặc giới hạn trần tiền thuê theo vòng chơi sớm/giữa. | **P1** |
| 6 | **Lệch pha chuyển nhượng** (Asset Wipe Desync) | Snapshot Tick 519:<br>`cells: [5, 11, 14, 26]` | Con nợ `p1` phá sản vì nợ tiền `Bot AI 2`. Nhưng toàn bộ BĐS còn lại (ô 5, 11, 14, 26) bị reset về `ownerId: null` thay vì sang tên cho `Bot AI 2`. | Khi phá sản do nợ người chơi, tài sản còn lại phải sang tên cho chủ nợ (`insolvency_manager.ts:147-167`). | **P2** |

---

### 4. PHÂN TÍCH SÂU CÁC LỖI NGUY HIỂM NHẤT

#### 4.1. Lỗi Rớt Prop `isFireSale` — Tại sao thấy đấu giá 0đ nhưng không đặt được 0đ?
Hệ thống đã viết sẵn logic phục vụ đấu giá 0đ tại `src/client/ui/modals/modal_helpers.ts`:
```ts
export function calculateAuctionIncrements(
  currentBid: number,
  isFireSale?: boolean,
  hasBidder?: boolean,
): [number, number, number] {
  if (isFireSale && !hasBidder) {
    return [0, 50, 100]; // Nút đầu tiên là 0đ!
  }
  const safeBid = Number.isFinite(currentBid) && currentBid >= 0 ? Math.floor(currentBid) : 0;
  return [safeBid + 100, safeBid + 200, safeBid + 500];
}
```
Nhưng tại `src/client/ui/modals/modal_host.tsx` (dòng 264-282):
```tsx
<AuctionModal
  cellIndex={payload.cellIndex}
  currentBid={payload.currentBid ?? 0}
  startingBid={payload.startingBid}
  // THIẾU HOÀN TOÀN DÒNG: isFireSale={payload.isFireSale}
  highestBidderId={payload.highestBidderId ?? null}
  ...
/>
```
Hậu quả: Biến `isFireSale` bên trong `AuctionModal` luôn luôn bằng `undefined`. Giao diện tính toán bước nhảy rơi vào nhánh mặc định: `[0 + 100, 0 + 200, 0 + 500]`. Người chơi nhìn thấy "Giá khởi điểm: 0", nhưng trước mắt chỉ có 3 nút: **`+100`, `+200`, `+500`**. Vì ví người chơi bằng 0đ, cả 3 nút này bị xám xịt (`disabled`), tạo cảm giác bị kẹt hoàn toàn.

#### 4.2. Lỗi Tràn Giao Diện Cắt Cụt Bot AI 4 (Ghost Bot 4)
Tại `src/client/ui/modals/auction_modal.tsx` (dòng 296):
```tsx
<div className="space-y-0.5 sm:space-y-1 max-h-16 sm:max-h-20 overflow-y-auto pr-1 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
```
- `max-h-16` tương đương đúng **64px**.
- Mỗi hàng đại gia hiển thị (bao gồm avatar, tên, badge, tiền ví) có chiều cao khoảng 22px - 24px kèm khoảng cách `gap`.
- Ba người chơi (`Mighty Gecko`, `Bot AI 2`, `Bot AI 3`) chiếm `3 * 22px = 66px`, lấp kín hoàn toàn vùng hiển thị.
- Bot AI 4 (`bot_4`, ví 1.658đ) bị đẩy tụt xuống dưới. Kết hợp với class ẩn thanh cuộn `[&::-webkit-scrollbar]:hidden`, người dùng trên di động không thể thấy Bot 4 và cũng không biết là danh sách có thể cuộn.

#### 4.3. Nghẽn Hiệu Năng 3.273 Draw Calls & 14.4 FPS
Dữ liệu viễn thám `metrics` trong log:
- `fps: 14.4` (Dưới ngưỡng chấp nhận được của game WebGL).
- `drawCalls: 3273` (Cực kỳ nguy hiểm).
- `triangles: 278296`.
- **Nguyên nhân**: Bàn cờ 3D, các mô hình công trình (nhà C1, C2, C3), hào quang hiệu ứng aura, và các billboard text của 40 ô đất đang được render riêng lẻ từng mesh thay vì sử dụng **InstancedMesh** hoặc **Batching**. Khi camera Three.js bao quát toàn cảnh bàn cờ trên thiết bị di động, GPU bị quá tải do phải xử lý hàng nghìn lệnh vẽ riêng biệt mỗi frame.

---

### 5. KẾ HOẠCH VÁ LỖI TRIỆT ĐỂ (ACTIONABLE REMEDIATION PLAN)

#### 5.1. Vá Prop `isFireSale` trong Type & ModalHost (Khắc phục nút 0đ)
1. Thêm `isFireSale?: boolean` vào interface `ModalPayloadMap['auction']` tại `src/client/store/game_store_types.ts`.
2. Truyền `isFireSale={payload.isFireSale}` tại `src/client/ui/modals/modal_host.tsx`.

#### 5.2. Chuyển Modal sang Chế Độ Khán Giả cho Người Phá Sản
Tại `src/client/ui/modals/auction_modal.tsx`, khi phát hiện `myPlayer?.bankrupt === true`:
- Ẩn hoàn toàn cụm nút đặt giá và nút rút lui.
- Hiển thị banner thông báo: *"Bạn đã phá sản. Tài sản thế chấp của bạn đang được phát mãi cho các đối thủ còn lại."*
- Giúp người chơi theo dõi trận đấu mà không bị cảm giác kẹt nút.

#### 5.3. Mở rộng Chiều Cao Danh Sách Đại Gia Trên Mobile
Tại `src/client/ui/modals/auction_modal.tsx`:
- Nâng chiều cao container từ `max-h-16` lên `max-h-28 sm:max-h-36`.
- Bật thanh cuộn mờ (subtle custom scrollbar) thay vì giấu tiệt `[&::-webkit-scrollbar]:hidden`, giúp nhận diện ngay cả khi danh sách có 4 - 6 người chơi.

#### 5.4. Tối Ưu Hóa Draw Calls 3D (Kéo FPS từ 14 lên 60)
1. Chuyển đổi các khối nhà C1-C3 và đế ô đất sang `THREE.InstancedMesh`.
2. Giới hạn hiển thị phù hiệu 3D: Chỉ render hào quang aura cho các ô đất thực sự đang có sự kiện (tối đa 4 - 6 ô), giảm số lượng draw calls từ 3.200 xuống dưới 150.
