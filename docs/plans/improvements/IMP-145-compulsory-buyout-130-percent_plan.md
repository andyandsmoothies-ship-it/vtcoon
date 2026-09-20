# Kế Hoạch Triển Khai: [IMP-145] Quyền Ưu Tiên Mua Lại Dự Án C0 (Compulsory Buyout Đền Bù 130% & Quyền Tự Quyết)

> **Mã Ticket**: [IMP-145]  
> **Phân tầng rủi ro**: Tier 2 (Full Rigor) — Đụng chạm FSM Sự Kiện Thẻ Bài, Tài Chính Đền Bù, Quyền Sở Hữu & Giao Diện 2D  
> **Lựa chọn từ Người Dùng**: **Phương án 2** — Mua lại cưỡng chế có đền bù tiền mặt 130% (chuẩn Monopoly Deal).  
> **Mục tiêu**: Xóa bỏ hoàn toàn cơ chế tráo đổi đất ngang phi lý. Thay thế bằng cơ chế **Mua Lại Dự Án C0 Có Đền Bù Tiền Mặt Thỏa Đáng**:
> 1. Người rút thẻ được quyền mua lại 1 ô đất C0 của đối thủ với **giá đền bù 130% giá gốc** (tiền mặt chuyển thẳng vào ví đối thủ, đối thủ lãi +30%).
> 2. Người chơi thật khi rút thẻ được tự do lựa chọn: **[💰 MUA LẠI]** (trả 130% tiền) hoặc **[✕ BỎ QUA]** (không muốn chi tiền).
> 3. Tuyệt đối **không được mua ô đất nằm trong bộ màu mà đối thủ đã độc quyền** (bảo vệ monopoly).
> 4. Nếu người rút không đủ tiền mặt >= 130% giá đất: Tự động chuyển thành nhận trợ cấp +800 Tr. từ Kho Bạc (không bị âm tiền).
> 5. Nếu đối thủ không có ô C0 hợp lệ: Nhận gói hỗ trợ quy hoạch +1.000 Tr. từ Kho Bạc.

---

## 1. DÒNG DỮ LIỆU & KIẾN TRÚC FSM (FLOWCHART)

```
                     [RÚT THẺ CƠ HỘI: QUYỀN ƯU TIÊN MUA LẠI DỰ ÁN]
                                           │
                     ┌─────────────────────┴─────────────────────┐
                     ▼                                           ▼
       [BẠN (NGƯỜI CHƠI) RÚT THẺ]                         [BOT AI RÚT THẺ]
                     │                                           │
          (Đối thủ có ô C0 chưa độc quyền?)           (Đối thủ có ô C0 chưa độc quyền?)
           ├─► Không ──► Nhận trợ cấp +1.000 Tr.       ├─► Không ──► Nhận trợ cấp +1.000 Tr.
           └─► CÓ                                      └─► CÓ
                │                                           │
                ▼                                           ▼
     [Hệ thống chọn ô C0 mục tiêu]               [Bot chọn ô C0 tối ưu chiến thuật]
     [Kiểm tra số dư >= 130% giá gốc?]           [Kiểm tra số dư >= 130% + safetyBuffer]
     ├─► Không đủ tiền ──► Nhận trợ cấp +800 Tr. ├─► Không đủ tiền ──► Nhận trợ cấp +800 Tr.
     └─► ĐỦ TIỀN                                 └─► ĐỦ TIỀN
          │                                           │
          ▼                                           ▼
  [Server: pendingBuyout (15s)]                  [Thực thi mua đền bù 130% tức thì]
  (Đóng băng Bot & Turn Loop)                    - Trừ 130% tiền ví Bot
  (Mở modal: CompulsoryBuyoutModal)              - Chuyển 130% tiền cho Chủ cũ (+30% lãi)
  "Mua lại ô X của Đối Thủ với giá 130%?"        - Sang tên ô đất trong registry
  ┌───────────────┴───────────────┐              - Đẩy Toast thông báo minh bạch cho Bạn
  ▼                               ▼
[💰 MUA LẠI (130%)]           [✕ BỎ QUA]
- Trừ 130% tiền của Bạn       - Giữ nguyên tiền
- Chủ cũ nhận 130% tiền       - Giữ nguyên đất
- Sang tên ô đất              (FSM duy trì PropertyManagement, tiếp tục lượt đi mượt mà)
```

---

## 2. NỘI DUNG THAY ĐỔI CHI TIẾT THEO TỆP

### 2.1. Domain Rules & Monopoly Immunity Guard
- **`src/domain/event_card_metadata.ts`**:
  - `title`: 'Quyền Ưu Tiên Mua Lại Dự Án' (thay thế hoàn toàn 'Hoán Đổi')
  - `description`: 'Quyền ưu tiên mua lại dự án: Mua lại 1 ô đất Cấp 0 của đối thủ với giá đền bù 130% giá gốc (trừ ô đã độc quyền).'
  - `effectDetail`: 'Chi trả 130% giá gốc đền bù cho chủ cũ để thâu tóm 1 ô đất Cấp 0. Nếu không đủ tiền mặt hoặc không có ô hợp lệ, nhận trợ cấp từ Kho Bạc.'

- **`src/domain/chance_card_handlers.ts`**:
  - Tái cấu trúc `handleSwapProject`: Lọc ô C0 hợp lệ, tạo `pendingBuyout` cho người thật, mua đền bù 130% cho Bot, trợ cấp Kho Bạc.

- **`src/domain/compulsory_buyout.ts`**:
  - `calculateCompulsoryBuyoutCost(basePrice)` = `Math.floor(basePrice * 1.3)`.
  - `isEligibleForCompulsoryBuyout`: Miễn trừ độc quyền tuyệt đối, không truyền `stateMap` vào `hasMonopoly`.

### 2.2. Turn Loop & Server State Pipeline
- **`src/domain/room.ts`**:
  - `PendingBuyoutSession` và trường `pendingBuyout?: PendingBuyoutSession | null` trên `Room`.
- **`src/server/session_manager.ts`** & **`src/server/network/delta_broadcaster.ts`**:
  - Đồng bộ `pendingBuyout` vào `DeltaPayload`.
- **`src/server/room_property_coordinator.ts`**:
  - `coordExecuteCompulsoryBuyout`, `coordDeclineCompulsoryBuyout`.
- **`src/server/room_manager.ts`**:
  - `hasPendingBuyout`, `checkPendingBuyoutTimeout` (15s).
- **`src/server/room_bot_coordinator.ts`** & **`src/server/turn_loop.ts`**:
  - Đóng băng Bot khi có `pendingBuyout`.

### 2.3. Client UI & Modal Host Integration
- **`src/client/network/apply_delta.ts`** & **`src/client/store/game_store_types.ts`**:
  - Nhận và lưu `pendingBuyout` trong client state.
- **`src/client/ui/modals/compulsory_buyout_modal.tsx`**:
  - Hộp thoại Retropoly đếm ngược 15s với 2 nút [💰 MUA LẠI (TRẢ 130%)] và [✕ BỎ QUA].
- **`src/client/ui/modals/modal_host.tsx`**:
  - Tự động mount khi có `pendingBuyout` hợp lệ.
- **`src/client/ui/modals/event_card_visuals.ts`**:
  - Cập nhật nhãn và giá trị: `label: 'MUA LẠI DỰ ÁN', value: 'ĐỀN BÙ 130%'`.

---

## 3. BẢO TOÀN BẤT BIẾN & DEFENSE INVARIANTS

1. **Bất biến Đền Bù Thỏa Đáng (`130% Compulsory Compensation`)**:
   - Chủ đất cũ luôn nhận đủ 130% giá niêm yết bằng tiền mặt (lãi +30% so với giá gốc), không bao giờ bị cướp đất trắng tay.
2. **Bất biến Bảo Vệ Độc Quyền Tuyệt Đối (`Strict Monopoly Immunity`)**:
   - Dùng `hasMonopoly(owner, cellIndex, registry)` không truyền `stateMap`, bảo vệ tuyệt đối toàn bộ các ô trong bộ màu đã độc quyền của đối thủ (kể cả khi có ô đang thế chấp).
3. **Bất biến Không Bao Giờ Âm Tiền / Ép Nợ (`Solvency Defense`)**:
   - Người mua chỉ được kích hoạt quyền mua khi số dư >= 130% giá đất. Nếu không đủ tiền, tự động nhận gói trợ cấp +800 Tr. từ Kho Bạc mà không bị phạt hay ép nợ.
4. **Bất biến Quyền Tự Quyết Của Người Chơi (`Player Agency`)**:
   - Khi Người chơi rút thẻ, người chơi hoàn toàn có quyền bấm Bỏ Qua nếu không muốn tiêu tiền mua ô đất đó.
5. **Bất biến Thông Suốt Lượt Đi (`Turn Loop Continuity`)**:
   - Sau khi giải quyết xong phiên mua lại, FSM duy trì pha `TurnPhase.PropertyManagement` để người chơi hoàn tất lượt mà không bị kẹt nút.
