# Kế Hoạch Thi Công (Task DAG): Slice UI-04 — Modals Tương Tác Nghiệp Vụ

> **Ticket:** `issues/UI-S04-business-modals.md`  
> **Căn cứ:** `ADR-0002` (§2 DOM UI Overlay) · `docs/domain/design.md` · `docs/domain/property_data.ts`  
> **Ràng buộc:** Ngân sách mỗi tệp ≤ 150–180 LOC, Zero Regression (giữ vững 497 tests), TypeScript Strict Mode.

---

## 1. Sơ Đồ Kiến Trúc Luồng & Phụ Thuộc (DAG 1 Chiều)

```
                       ┌────────────────────────────────────────┐
                       │ T1: Pure Helpers (Toán & Logic Nghiệp Vụ)│
                       │ src/client/ui/modals/modal_helpers.ts   │
                       │ (Deed Info, Bước Giá, Thuế 5% P2P)     │
                       └───────────────────┬────────────────────┘
                                           │
         ┌─────────────────────────────────┴─────────────────────────────────┐
         ▼                                                                   ▼
┌────────────────────────────────────────┐                 ┌────────────────────────────────────────┐
│ T2: Mở Rộng Zustand Store              │                 │ T3: Khung Nền Mờ Tái Sử Dụng           │
│ src/client/store/game_store.ts         │                 │ src/client/ui/modals/modal_backdrop.tsx│
│ (activeModal, modalPayload, actions)   │                 │ (Z-20 Overlay, pointer-events-auto)    │
└───────────────────┬────────────────────┘                 └───────────────────┬────────────────────┘
                    │                                                          │
                    ├──────────────────────┬───────────────────────────────────┤
                    ▼                      ▼                                   ▼
        ┌──────────────────────┐┌──────────────────────┐┌──────────────────────┐┌──────────────────────┐
        │ T4: TitleDeedModal   ││ T5: AuctionModal     ││ T6: TradeModal       ││ T7: EventCardModal   │
        │ Thẻ Sổ Đỏ 4 Cấp C0-C3││ Sàn Đấu Giá 15s      ││ Đàm Phán Song Phương ││ Lật Thẻ Sự Kiện      │
        └──────────┬───────────┘└──────────┬───────────┘└──────────┬───────────┘└──────────┬───────────┘
                   │                       │                       │                       │
                   └───────────────────────┴───────────┬───────────────────┴───────────────────────┘
                                                       ▼
                                         ┌───────────────────────────┐
                                         │ T8: Modal Host Switchboard│
                                         │ modal_host.tsx & HUD tree │
                                         └─────────────┬─────────────┘
                                                       ▼
                                         ┌───────────────────────────┐
                                         │ T9: Bộ Kiểm Thử Logic     │
                                         │ ui04_business_modals.test │
                                         └─────────────┬─────────────┘
                                                       ▼
                                         ┌───────────────────────────┐
                                         │ T10: Verification Gate    │
                                         │ tsc + 497+ Tests + Ledger │
                                         └───────────────────────────┘
```

---

## 2. Chi Tiết Từng Micro-Task Trong DAG

### Task T1: Pure Helpers & Logic Nghiệp Vụ (`modal_helpers.ts`) [NEW, ~80 LOC]
- **Mục tiêu:** Hàm toán học và nghiệp vụ thuần túy không chứa React component:
  ```typescript
  export interface DeedDisplayInfo {
    readonly cellIndex: number;
    readonly name: string;
    readonly colorGroup?: ColorGroup;
    readonly price: number;
    readonly mortgageValue: number;
    readonly rents: [number, number, number, number]; // C0, C1, C2, C3
    readonly upgradeCosts: [number, number, number];
  }
  export function getDeedDisplayInfo(cellIndex: number): DeedDisplayInfo | null;
  export function calculateAuctionIncrements(currentBid: number): [number, number, number];
  export function calculateTradeTax(cashDifference: number): number;
  export function validateTradeOffer(params: TradeValidationParams): boolean;
  ```
- **Ngân sách:** ≤ 90 LOC. Kiểm thử 100% bằng Vitest Node.js thuần.

### Task T2: Mở Rộng Zustand Store (`game_store.ts`) [MODIFY, ~190 LOC]
- **Mục tiêu:** Quản lý trạng thái đóng/mở và payload của 4 loại modals:
  ```typescript
  export type ActiveModalType = 'deed' | 'auction' | 'trade' | 'event' | null;
  export interface ModalPayloadMap {
    deed: { cellIndex: number; canBuy?: boolean };
    auction: { cellIndex: number; currentBid: number; highestBidderId: string | null; timeRemaining: number; hasPassed?: boolean };
    trade: { targetPlayerId: string; offeredProperties: number[]; requestedProperties: number[]; cashOffer: number; cashRequest: number };
    event: { cardType: 'chance' | 'market'; cardId: string; title: string; description: string; effectDelta?: number };
  }
  ```
- **Actions:**
  - `openModal<T extends keyof ModalPayloadMap>(type: T, payload: ModalPayloadMap[T]): void`
  - `closeModal(): void`
  - `updateModalPayload<T extends keyof ModalPayloadMap>(patch: Partial<ModalPayloadMap[T]>): void`
- **Ngân sách:** ≤ 200 LOC.

### Task T3: Reusable Modal Backdrop (`modal_backdrop.tsx`) [NEW, ~45 LOC]
- **Mục tiêu:** Lớp nền phủ mờ Z-20 che phủ sa bàn khi modal mở, xử lý click nền hoặc phím Escape để đóng modal.
- **Phong cách:** `fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex items-center justify-center p-4 pointer-events-auto`.
- **Ngân sách:** ≤ 50 LOC.

### Task T4: Component Thẻ Sổ Đỏ (`title_deed_modal.tsx`) [NEW, ~140 LOC]
- **Mục tiêu:** Thẻ Sổ Đỏ mang phong cách Chứng nhận quyền sử dụng đất Việt Nam.
- **Hiển thị:**
  - Băng ruy-băng màu nhóm đất (`COLOR_GROUP_HEX[group]`), tên địa phương in hoa đậm.
  - Giá mua đất nền & Giá trị thế chấp (50% giá mua).
  - Bảng phí dừng chân 4 cấp: Đất nền (C0), Nhà phố (C1), Khách sạn (C2), TTTM (C3).
  - Chi phí xây dựng / nâng cấp từng cấp.
  - Hai nút hành động: [Mua Bất Động Sản] (Gradient Emerald) và [Bỏ Qua / Đấu Giá] (Slate/Amber).
- **Ngân sách:** ≤ 150 LOC.

### Task T5: Component Sàn Đấu Giá 15s (`auction_modal.tsx`) [NEW, ~135 LOC]
- **Mục tiêu:** Sàn đấu giá trực tuyến thời gian thực 15 giây.
- **Hiển thị:**
  - Tên BĐS đang đấu giá, thumbnail nhóm màu, giá khởi điểm.
  - Đồng hồ đếm ngược 15s với thanh tiến trình trực quan.
  - "Giá cao nhất hiện tại: {formatCurrency(bid)} — {bidderName}".
  - Các nút tăng giá nhanh: `+50 Tr.`, `+100 Tr.`, `+200 Tr.`.
  - Nút [Rút Lui / Bỏ Cuộc] đánh dấu người chơi ngừng tham gia vòng này.
- **Ngân sách:** ≤ 140 LOC.

### Task T6: Component Đàm Phán Song Phương P2P (`trade_modal.tsx`) [NEW, ~150 LOC]
- **Mục tiêu:** Bảng thương lượng trao đổi tài sản song phương giữa 2 người chơi.
- **Bố cục 2 cột:**
  - Cột 1 (Tài sản của bạn): Danh sách BĐS sở hữu có checkbox, ô nhập tiền mặt bù thêm.
  - Cột 2 (Tài sản đối phương): Danh sách BĐS của đối phương có checkbox, ô yêu cầu bù tiền.
  - Hộp thông báo thuế: "Khấu trừ 5% thuế chuyển nhượng nộp Kho Bạc ({formatCurrency(taxAmount)})".
  - Nút [Gửi Đề Xuất Đàm Phán] / [Hủy].
- **Ngân sách:** ≤ 160 LOC.

### Task T7: Component Lật Thẻ Sự Kiện (`event_card_modal.tsx`) [NEW, ~120 LOC]
- **Mục tiêu:** Hoạt ảnh hiển thị thẻ bài sự kiện (Phiếu Cơ Hội / Phiếu Thị Trường).
- **Hiển thị:**
  - Viền Neon Vàng Ánh Kim (Thị Trường) hoặc Xanh Ngọc Cyan (Cơ Hội).
  - Tiêu đề thẻ chuẩn hóa từ `vi.ts`.
  - Icon minh họa và mô tả chi tiết tác động.
  - Huy hiệu biến động tiền tệ (Xanh nếu cộng tiền, Đỏ nếu phạt tiền/nộp thuế).
  - Nút [Đã Hiểu / Tiếp Tục].
- **Ngân sách:** ≤ 130 LOC.

### Task T8: Modal Host Switchboard & HUD Integration [NEW & MODIFY]
- `src/client/ui/modals/modal_host.tsx` (≤ 70 LOC): Đọc `activeModal` từ store và render modal tương ứng bọc trong `ModalBackdrop`.
- `src/client/ui/hud_container.tsx`: Mount `<ModalHost />` bên trong container gốc.
- `src/client/ui/action_dock.tsx`: Nối sự kiện click nút "Tài Sản" và "Đàm Phán" để mở modal xem thử.

### Task T9: Bộ Kiểm Thử Logic Thuần (`tests/client/ui04_business_modals.test.ts`) [NEW, ~180 LOC]
- **Mục tiêu:** 18–22 tests kiểm thử toàn bộ logic và hợp đồng nghiệp vụ:
  - `TC-UI04.1`: `getDeedDisplayInfo` tra cứu chính xác bảng giá 4 cấp cho các ô tài sản trong `PROPERTY_DEEDS`.
  - `TC-UI04.2`: `calculateAuctionIncrements` sinh đúng 3 bước giá tăng dần `+50, +100, +200`.
  - `TC-UI04.3`: `calculateTradeTax` tính đúng 5% thuế chuyển nhượng Kho Bạc từ tiền chênh lệch.
  - `TC-UI04.4`: `validateTradeOffer` chặn đề xuất rỗng, vượt quá số dư tiền mặt hoặc tài sản không thuộc sở hữu.
  - `TC-UI04.5`: Quản lý vòng đời `openModal`, `updateModalPayload`, `closeModal` trong `useGameStore`.
  - **Adversarial Inversions:** Ô đặc biệt (GO, Thuế) không thể sinh Sổ Đỏ; tiền chênh lệch âm ném lỗi hoặc trả về 0; đấu giá âm bị chặn.

### Task T10: Đóng Gói, Verification Gate & Cập Nhật Sổ Cái
- Chạy `npx tsc --noEmit` kiểm tra kiểu dữ liệu (0 errors).
- Chạy `npm test` chứng minh toàn bộ 497 tests cũ + tests mới UI-04 đều PASS (Dự kiến: ≥ 518 tests).
- Chạy `npm run build` xác nhận Vite đóng gói thành công.
- Cập nhật `docs/epics/client_ui/_epic_ledger.md` cho Slice UI-04.

---

## 3. Kế Hoạch Kiểm Chứng Visual Smoke Gate

1. Khởi động dev server: `cmd /c "npm run dev"`.
2. Mở trình duyệt tại `http://localhost:5173`.
3. Kiểm tra trực quan:
   - Bấm nút **"Tài Sản"** trên Action Dock: Modal Thẻ Sổ Đỏ hiện lên ở trung tâm với nền mờ. Quan sát bảng giá 4 cấp C0-C3 và nút Mua/Bỏ qua.
   - Bấm nút **"Đàm Phán"** trên Action Dock: Modal Đàm Phán P2P hiện lên chia 2 cột đối ứng rõ ràng cùng hộp thông báo thuế 5%.
   - Mở Console (F12) và kích hoạt thử nghiệm Modal Đấu Giá & Thẻ Sự Kiện:
     ```javascript
     const store = (await import('/src/client/store/game_store.ts')).useGameStore;
     // Mở Sàn Đấu Giá
     store.getState().openModal('auction', { cellIndex: 1, currentBid: 600, highestBidderId: 'p2', timeRemaining: 15 });
     // Mở Thẻ Sự Kiện
     store.getState().openModal('event', { cardType: 'market', cardId: 'MC_NIGHT_ECONOMY', title: 'Chính Sách Phát Triển Kinh Tế Đêm', description: 'Doanh thu nhóm dịch vụ tăng gấp đôi.', effectDelta: 500 });
     ```
   - Xác nhận: Cả 4 modal đều có thể mở mượt mà, bấm nền hoặc nút đóng sẽ đóng modal an toàn.
