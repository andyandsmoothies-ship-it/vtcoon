# IMP-75 — Đại Tu Trải Nghiệm Quản Lý Bất Động Sản, Cứu Nợ Khẩn Cấp & Đàm Phán Thương Lượng P2P

**Mã cải tiến**: IMP-75  
**Ngày lập kế hoạch**: 2026-09-15  
**Trạng thái**: 🟡 PENDING APPROVAL (Chờ phê duyệt)  
**Mục tiêu**: Xóa bỏ điểm nghẽn UX khiến người chơi bị kẹt không thể quản lý các BĐS khác khi bị âm tiền; đại tu toàn diện giao diện Đàm phán P2P minh bạch và khắc phục bẫy cảnh báo sai của Telemetry.

---

## 1. BỐI CẢNH & NGUYÊN NHÂN GỐC RỄ

### 1.1. Sự cố Quản Lý BĐS khi Âm Tiền (Insolvency)
- **Hiện trạng**: Khi người chơi bị phạt âm tiền (`InsolvencyPhase`), nhấn nút "Quản Lý BĐS" (Action Dock) hoặc "Quản Lý BĐS / Thế Chấp" (Insolvency Banner), hệ thống gọi:
  ```typescript
  // src/client/ui/ui_helpers.ts
  const targetCell = ownedProperties?.[0] ?? currentPosition;
  openModal('deed', { cellIndex: targetCell, canBuy: false });
  ```
- **Hậu quả**:
  1. Hệ thống chỉ mở Sổ Đỏ (`TitleDeedModal`) của đúng mảnh đất đầu tiên trong mảng sở hữu (`ownedProperties[0]`).
  2. Người chơi thế chấp mảnh đất đó xong (+500 Tr., nhưng vẫn âm tiền), Sổ Đỏ chuyển sang trạng thái "Đã thế chấp" với 2 nút duy nhất: `[Giải Chấp]` và `[Đóng]`.
  3. `TitleDeedModal` **hoàn toàn không có nút lật trang (`◀` / `▶`)** để xem các BĐS khác.
  4. Đóng modal và bấm lại nút "Quản Lý BĐS", hàm lại tiếp tục mở lại mảnh đất đầu tiên! Người chơi bị kẹt cứng trong vòng lặp vô tận, tưởng rằng mình không thể làm gì được nữa.

### 1.2. Sự cố Giao Diện Đàm Phán (P2P Trade)
- **Hiện trạng**:
  1. **Khóa cứng 1 đối tác**: Giao diện tự động chọn người chơi khác đầu tiên (`bot_3`), không cho phép chọn chuyển sang đối tác khác (ví dụ `bot_4` trong ván 3-4 người).
  2. **Không hiển thị tiền mặt đối tác**: Cột đối tác chỉ có ô nhập số "Yêu cầu đối tác bù tiền", người chơi không biết đối tác có bao nhiêu tiền mặt để đề xuất giá.
  3. **Màu sắc phản trực giác**: 2 cột màu xanh đen (`bg-slate-900`) và đỏ bầm (`bg-red-900`) nằm trên nền giấy kem vintage, gây cảm giác cảnh báo lỗi hơn là giao thương.
  4. **Lỗi nghiêm trọng trong `modal_host.tsx`**: `onSubmitTrade` không nhận tham số từ `TradeModal` mà đọc từ `modalPayload` rỗng ban đầu, khiến lệnh `INTENT_TRADE_OFFER` **bị nuốt âm thầm, không bao giờ được gửi lên server**, dù âm thanh thành công vẫn phát ra! Người chơi tưởng đã bán đất nhưng thực chất là server đếm ngược hết giờ và tự động cưỡng chế thế chấp toàn bộ tài sản.

### 1.3. Cảnh Báo Sai của Telemetry Invariant
- `handleDeltaTelemetry` kiểm tra: `isInInsolvency: postState.activeModal === 'insolvency'`. Khi người chơi đóng banner để mở Sổ Đỏ (`activeModal = 'deed'`), Telemetry nhận định sai là người chơi bị âm tiền ngoài trạng thái phá sản (`NEGATIVE_BALANCE_OUTSIDE_INSOLVENCY`).
- Telemetry báo lỗi `INVALID_POSITION_STEP` khi người chơi bị dịch chuyển do thẻ Khí Vận hoặc dẫm ô 30 bị đưa vào Trạm Kiểm Toán (ô 10).

---

## 2. KIẾN TRÚC GIẢI PHÁP ĐỀ XUẤT

```
[Người Chơi Nhấn 'Quản Lý BĐS' / 'Cứu Nợ']
              │
              ▼
  ┌─────────────────────────────────────────────────────────────┐
  │  PropertyPortfolioModal (MỚI)                               │
  │  - Thanh Cứu Nợ Khẩn Cấp: Hiển thị Thâm hụt & Tiến trình bù │
  │  - Lưới toàn bộ BĐS sở hữu (Tên, Nhóm màu, Cấp C0-C3)       │
  │  - Nút nhanh trên từng thẻ: [Thế Chấp +X] [Hạ Cấp +Y]       │
  │  - Nút [Xem Sổ Đỏ Chi Tiết ↗]                                │
  └───────────────┬─────────────────────────────────────────────┘
                  │ (Hoặc bấm trực tiếp vào ô cờ 3D)
                  ▼
  ┌─────────────────────────────────────────────────────────────┐
  │  TitleDeedModal (CẢI TIẾN)                                  │
  │  - Bổ sung Carousel: [◀ Ô trước] (Sổ đỏ 2/6) [Ô sau ▶]      │
  │  - Cho phép duyệt tuần tự qua tất cả BĐS sở hữu              │
  └─────────────────────────────────────────────────────────────┘

[Người Chơi Nhấn 'Đàm Phán P2P']
              │
              ▼
  ┌─────────────────────────────────────────────────────────────┐
  │  TradeModal (ĐẠI TU)                                        │
  │  - Selector đối tác: [Bot AI 3 - 4.246 Tr.] [Bot AI 4 - ...] │
  │  - Giao diện kem diorama cao cấp, rõ ràng                   │
  │  - Gợi ý giá niêm yết: [70% Sàn] [100% Gốc] [120% Thị Trường]│
  │  - Kiểm tra đối tác đủ tiền mặt trước khi gửi               │
  │  - Sửa bug `modal_host.tsx`: Gửi chuẩn xác Intent lên server│
  └─────────────────────────────────────────────────────────────┘
```

---

## 3. CHI TIẾT CÁC THAY ĐỔI

### 3.1. Thành Phần Mới: `src/client/ui/modals/property_portfolio_modal.tsx`
- **Mục tiêu**: Cung cấp cái nhìn toàn cảnh về toàn bộ danh mục tài sản của người chơi.
- **Tính năng**:
  - Khi đang ở `InsolvencyPhase`: Banner nổi bật ở đầu trang: *"Cảnh báo thâm hụt nợ: -3.022 Tr. | Chọn BĐS để thế chấp hoặc hạ cấp giải tỏa nợ"*.
  - Lưới hiển thị từng BĐS:
    - Ruy-băng màu sắc theo tỉnh thành chuẩn theme.
    - Huy hiệu Cấp nhà (Đất nền, Nhà Phố C1, Khách Sạn C2, Resort C3).
    - Huy hiệu trạng thái: `Đang thế chấp` (đỏ/cam) hoặc `Hoạt động` (xanh).
    - Giá trị thế chấp thu về (`+500 Tr.`), Tiền thuê thu được.
    - Thao tác nhanh 1 chạm: `[Thế Chấp]` (nếu chưa thế chấp) hoặc `[Hạ Cấp]` (nếu có nhà C1-C3).
    - Bấm vào thẻ để mở chi tiết `TitleDeedModal`.
  - Giới hạn kích thước: <= 250 LOC (tuân thủ giới hạn UI component <= 500 LOC).

### 3.2. Cải Tiến: `src/client/ui/modals/title_deed_modal.tsx`
- Bổ sung prop `ownedProperties?: readonly number[]`.
- Nếu người chơi là chủ sở hữu và sở hữu > 1 BĐS:
  - Hiển thị thanh điều hướng Carousel ở đỉnh modal:
    `[◀ Trước]` `(3 / 6) BÌNH DƯƠNG` `[Sau ▶]`
  - Giúp người chơi lướt qua lại giữa các sổ đỏ mà không phải đóng modal.

### 3.3. Đại Tu: `src/client/ui/modals/trade_modal.tsx` & Sửa Bug `modal_host.tsx`
- **Thanh chọn Đối tác**: Hiển thị danh sách các đối thủ khả dụng trong phòng (Bot 3, Bot 4...) kèm Avatar, Tên, Tính cách và **Số Dư Tiền Mặt Thực Tế**.
- **Định dạng Diorama Paper Craft**: Bỏ nền xanh đen/đỏ bầm, thay bằng giao diện sáng sủa, thanh thoát.
- **Gợi ý giá nhanh**: Thêm các nút chọn giá `70% Sàn`, `100% Gốc`, `120% Thị trường` dựa trên giá niêm yết của ô đất đem bán.
- **Khóa an toàn**: Nếu giá yêu cầu > số dư đối tác, hiển thị cảnh báo đỏ và khóa nút gửi.
- **Sửa Bug Nghiêm Trọng trong `modal_host.tsx`**:
  ```typescript
  // TRƯỚC (BUG):
  onSubmitTrade={() => {
    const tradePayload = modalPayload as ModalPayloadMap['trade']; // tradePayload.offeredProperties luôn rỗng []!
    if (tradePayload.offeredProperties[0] !== undefined) { ... }
  }}

  // SAU (FIX):
  onSubmitTrade={(tradeData) => {
    if (tradeData && tradeData.offeredProperties[0] !== undefined) {
      onIntent?.({
        type: 'INTENT_TRADE_OFFER',
        sellerId: myId,
        buyerId: tradeData.targetPlayerId,
        cellIndex: tradeData.offeredProperties[0],
        price: tradeData.cashRequest || 1000,
      });
    }
  }}
  ```

### 3.4. Sửa Telemetry Invariant: `src/client/telemetry/telemetry_delta_hook.ts`
- Sửa `isInInsolvency`:
  ```typescript
  isInInsolvency: postState.turnPhase === TurnPhase.InsolvencyPhase || postState.activeModal === 'insolvency'
  ```
- Sửa `checkIsTeleport`: Miễn trừ dịch chuyển khi `toPos === 10` (vào Trạm Kiểm Toán) hoặc ô xuất phát là ô Cơ Hội / Khí Vận.

---

## 4. MA TRẬN PHÂN TÍCH RỦI RÔ & BLAST RADIUS

| Cấp độ | Vùng ảnh hưởng | Biện pháp bảo vệ (Defense) |
|---|---|---|
| **Rủi ro Thấp** | `title_deed_modal.tsx` (Thêm carousel) | Nếu không có `ownedProperties`, modal hoạt động y như cũ 100%. |
| **Rủi ro Trung Bình** | `property_portfolio_modal.tsx` (Component mới) | Component độc lập hoàn toàn, mở qua `openModal('portfolio')`. |
| **Rủi ro Trung Bình** | `trade_modal.tsx` & `modal_host.tsx` | Khắc phục triệt để lỗi nuốt intent; bảo toàn 100% schema `INTENT_TRADE_OFFER`. |
| **Rủi ro Thấp** | `telemetry_delta_hook.ts` | Loại bỏ 100% false-positive cảnh báo vỡ nợ ngoài luồng. |

---

## 5. KẾ HOẠCH KIỂM THỬ (VERIFICATION PLAN)

1. **Unit & Contract Tests**:
   - Viết test suite mới: `tests/client/imp75_property_portfolio_and_trade_ux.test.ts`:
     - Test `PropertyPortfolioModal`: Hiển thị đúng danh sách BĐS, cờ thế chấp, tính toán thâm hụt nợ.
     - Test `TitleDeedModal`: Carousel lật trang qua lại giữa các BĐS sở hữu.
     - Test `TradeModal`: Chọn đối tác, hiển thị số dư đối tác, submit `tradeData` chuẩn xác tới `onIntent`.
     - Test `telemetry_delta_hook`: Không phát sinh `NEGATIVE_BALANCE_OUTSIDE_INSOLVENCY` khi `turnPhase === 'InsolvencyPhase'` bất kể `activeModal`.
2. **Quality Gates**:
   - `npm run gate:quick`: 0 lỗi TypeScript, 0 lỗi UI linter, 0 vi phạm LOC budget.
   - `npm test`: 178+1 test suites PASS 100%.
   - Chạy build sạch: `npm run build`.

---

## 6. QUY TRÌNH THỰC THI (3-STATION PIPELINE)

- **Trạm 1 (RED)**: Viết test contract `tests/client/imp75_property_portfolio_and_trade_ux.test.ts` khẳng định các hành vi mới và chứng minh test FAIL khi chưa có code.
- **Trạm 2 (GREEN)**: Tạo `property_portfolio_modal.tsx`, nâng cấp `title_deed_modal.tsx`, `trade_modal.tsx`, sửa `modal_host.tsx` và `telemetry_delta_hook.ts`.
- **Trạm 3 (REVIEW)**: Chạy full test suite, kiểm tra linter và đĩa vật lý trước khi bàn giao.
