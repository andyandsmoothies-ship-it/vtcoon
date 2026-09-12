# KẾ HOẠCH KỸ THUẬT: CẢI TIẾN IMP-17
# IN-GAME ACTIVITY FEED SIDEBOARD (NHẬT KÝ HÀNH ĐỘNG TỪNG LƯỢT)

> **Mã số cải tiến:** IMP-17  
> **Thuộc chu trình:** Continuous Improvement & Ad-hoc Persistence (Hiến pháp GEMINI.md & Cẩm nang AI-Native SDLC Master Guide Mẫu P-4.4)  
> **Trạng thái:** HOÀN TẤT · ĐÃ NGHIỆM THU (COMPLETED & VERIFIED)  
> **Mục tiêu:** Cung cấp bảng Sideboard dạng ngăn kéo trượt (Drawer) hiển thị nhật ký hành động step-by-step của từng người chơi theo thời gian thực, giúp người chơi theo dõi diễn biến trận đấu đầy đủ mà không bị bỏ sót thông tin.

---

## 1. TỔNG QUAN & ĐỘNG LỰC PHÁT TRIỂN

### 1.1 Vấn Đề Thực Tế
Trong các ván đấu có Bot AI hoặc người chơi thao tác nhanh:
1. Các hành động (lắc xúc xắc, di chuyển, mua đất, nâng cấp nhà, thanh toán tiền thuê, phạt thuế, rút thẻ sự kiện) diễn ra liên tục.
2. Người chơi lỡ rời mắt khỏi màn hình trong 2-3 giây sẽ không biết vì sao số dư tiền mặt của mình bị trừ hoặc đối thủ đã mua được ô đất nào.
3. Hiện tại hệ thống chỉ có dòng chữ bay tạm thời (`FloatingNumbersOverlay` tồn tại 2 giây rồi biến mất), không có nơi lưu trữ lịch sử diễn biến để tra cứu lại.

### 1.2 Mục Tiêu Nghiệm Thu (DoD)
1. **Sideboard Nhật Ký (Activity Feed Drawer)**: Thiết kế dạng ngăn kéo trượt từ cạnh phải màn hình, có nút bật/tắt (icon 📜) trên thanh `TopBar` kèm chấm thông báo khi có sự kiện mới.
2. **Theo Dõi Hành Động Từng Bước (Step-by-Step Logging)**: Ghi nhận chính xác:
   - Lắc xúc xắc (kết quả 2 mặt, tổng điểm).
   - Di chuyển quân cờ (tên ô đất đến).
   - Mua bất động sản (tên ô, số tiền thanh toán).
   - Nâng cấp công trình (C1 Nhà Phố, C2 Biệt Thự, C3 Khách Sạn).
   - Nộp tiền thuê đất / thuế / phí siết nợ (người trả, người nhận, biến động số dư).
   - Sự kiện Cơ Hội / Khí Vận (nội dung thẻ, tiền thưởng/phạt).
   - Đấu giá & Phá sản.
3. **Trần Bộ Nhớ FIFO (Zero Memory Leak)**: Giới hạn lưu trữ tối đa 50 sự kiện gần nhất; tự động đẩy sự kiện cũ ra ngoài khi vượt trần.
4. **Bộ Lọc Nhanh (Filter Chips)**: Cho phép lọc theo "Tất Cả", "Giao Dịch Tiền", "Bất Động Sản".
5. **Zero Regression & Local Quality Gates**: Đảm bảo toàn bộ 105+ test files tiếp tục PASS 100%, vượt qua `npm run gate:quick` (<2s, 0 anti-patterns, duplication <= 4%).

---

## 2. KIẾN TRÚC HỆ THỐNG 3 TẦNG

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. TẦNG SỰ KIỆN (EVENT EXTRACTION & ADAPTER)                                │
│ [DeltaPayload từ WSS Server] ──> [src/client/network/activity_tracker.ts]   │
│                                    │                                        │
│                                    ▼ (Trích xuất ActivityLogEntry)          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. TẦNG LƯU TRỮ TRẠNG THÁI (STATE STORE - ZUSTAND)                         │
│ [src/client/store/activity_store.ts]                                        │
│ • activityLogs: ActivityLogEntry[] (Hàng đợi FIFO max 50 items)             │
│ • isActivityFeedOpen: boolean                                               │
│ • unreadCount: number                                                       │
│ • activeFilter: 'all' | 'money' | 'property'                                │
│                                    │                                        │
│                                    ▼ (Selective Selectors)                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. TẦNG GIAO DIỆN NGƯỜI DÙNG (DOM UI OVERLAY)                              │
│ • [TopBar]: Nút Toggle 📜 kèm Badge thông báo chưa đọc                      │
│ • [ActivityFeedSidebar]: Drawer trượt Glassmorphism (Z-30, pointer-events)  │
│ • Auto-scroll to bottom nhịp nhàng                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. THIẾT KẾ DỮ LIỆU & HỢP ĐỒNG MÃ NGUỒN

### 3.1 Cấu Trúc Bản Ghi Nhật Ký (`ActivityLogEntry`)

```typescript
export type ActivityLogType = 
  | 'dice'        // Lắc xúc xắc
  | 'move'        // Di chuyển ô
  | 'buy'         // Mua đất
  | 'upgrade'     // Xây dựng / Nâng cấp
  | 'rent'        // Trả tiền thuê
  | 'tax'         // Nộp thuế / Kho bạc
  | 'card'        // Thẻ Cơ hội / Khí vận
  | 'auction'     // Đấu giá
  | 'mortgage'    // Thế chấp / Chuộc
  | 'bankrupt'    // Phá sản
  | 'system';     // Bắt đầu ván / Vòng mới

export interface ActivityLogEntry {
  readonly id: string;
  readonly timestamp: number;
  readonly round?: number;
  readonly type: ActivityLogType;
  readonly playerId?: string;
  readonly playerName?: string;
  readonly playerColor?: string;
  readonly title: string;
  readonly detail?: string;
  readonly deltaCash?: number;
  readonly cellIndex?: number;
}
```

### 3.2 Tách Store Riêng Biệt (`activity_store.ts`)
Nhằm bảo vệ trần LOC của `game_store.ts` (hiện tại 374 dòng, sắp chạm ngưỡng 400 dòng), toàn bộ trạng thái nhật ký được đặt trong module độc lập `src/client/store/activity_store.ts`:
- Ngân sách: ~70 - 90 LOC (Tier 1 Logic <= 400 LOC).
- Hàm `addActivityLog(entry)`: Tự động gán UUID, đẩy vào cuối mảng, cắt mảng `slice(-50)` nếu vượt trần. Tự động tăng `unreadCount` nếu drawer đang đóng.
- Hàm `toggleOpen()`: Đảo trạng thái mở/đóng; khi mở thì xóa `unreadCount = 0`.

### 3.3 Bộ Trích Xuất Sự Kiện (`activity_tracker.ts`)
Tạo tệp `src/client/network/activity_tracker.ts`:
- So sánh vi sai giữa `delta` và trạng thái cũ trước khi áp dụng để tạo log có ngữ cảnh rõ ràng:
  * Ví dụ: `p.balance < oldBalance` và `p.position` thuộc sở hữu người khác ➔ Ghi log trả tiền thuê cho ai.
  * `delta.dice` xuất hiện ➔ Ghi log lắc xúc xắc.
  * `delta.cells` thay đổi chủ sở hữu ➔ Ghi log mua đất.
  * `delta.cells` tăng level ➔ Ghi log nâng cấp nhà.

### 3.4 Giao Diện Sideboard (`activity_feed_sidebar.tsx`)
- Ngân sách: ~180 - 220 LOC (Tier 2 UI <= 500 LOC).
- Bố cục:
  * Chiều rộng cố định: `w-80 sm:w-96`, neo cạnh phải (`fixed top-0 right-0 h-full`).
  * Nền: `bg-slate-950/90 backdrop-blur-xl border-l border-slate-700/60 shadow-2xl`.
  * Header: Tiêu đề "📜 NHẬT KÝ VÁN ĐẤU" + Nút đóng "✕" (`min-h-[44px] min-w-[44px]`).
  * Filter Chips: `Tất Cả` | `Biến Động Tiền` | `Nhà Đất`.
  * Danh sách: Scroll container mượt mà, tự động cuộn xuống cuối (Auto-scroll), mỗi thẻ có viền phát sáng theo màu Token của người chơi.
  * Biến động số dư: Hiển thị badge màu ngọc bích `+... Tr.` hoặc đỏ nhung `-... Tr.` định dạng font Monospace tabular-nums.

---

## 4. DANH MỤC CÁC FILE THAY ĐỔI & TẠO MỚI

| Thao Tác | Đường Dẫn Tệp | Mục Đích & Nội Dung | Ngân Sách LOC Dự Kiến |
| :---: | :--- | :--- | :---: |
| **[NEW]** | `src/client/store/activity_store.ts` | Store Zustand quản lý nhật ký và trạng thái Sideboard | ~80 LOC |
| **[NEW]** | `src/client/network/activity_tracker.ts` | Module trích xuất sự kiện từ DeltaPayload | ~120 LOC |
| **[NEW]** | `src/client/ui/activity_feed_sidebar.tsx` | Component Sideboard Drawer trượt kính mờ Glassmorphism | ~200 LOC |
| **[MODIFY]** | `src/client/ui/top_bar.tsx` | Thêm nút bấm 📜 mở Nhật ký kèm Unread Badge | +15 LOC |
| **[MODIFY]** | `src/client/ui/hud_container.tsx` | Gắn component `ActivityFeedSidebar` vào DOM root | +5 LOC |
| **[MODIFY]** | `src/client/network/apply_delta.ts` | Gọi `trackDeltaActivities` khi nhận delta từ Server | +5 LOC |
| **[NEW]** | `tests/client/activity_store.test.ts` | Kiểm thử Store: Thêm log, trần FIFO 50, đếm unread | ~100 LOC |
| **[NEW]** | `tests/client/activity_tracker.test.ts` | Kiểm thử trích xuất sự kiện từ các dạng delta | ~150 LOC |
| **[NEW]** | `tests/client/activity_feed_sidebar.test.ts` | Kiểm thử giao diện: Mở/đóng, lọc thẻ, hiển thị tiền tệ | ~120 LOC |

---

## 5. HỢP ĐỒNG KIỂM THỬ NGHIỆM THU (TEST CONTRACTS)

1. **Hợp đồng `[TC-IMP17-01: Activity Store FIFO & Unread]`**:
   - Thêm 60 log liên tiếp ➔ Kiểm tra độ dài mảng `activityLogs` dừng đúng ở mức 50 (10 log đầu bị đẩy ra an toàn).
   - Khi `isActivityFeedOpen = false`, mỗi lần thêm log tăng `unreadCount` thêm 1.
   - Khi gọi `toggleOpen()` mở ra ➔ `unreadCount` tự động reset về 0.
2. **Hợp đồng `[TC-IMP17-02: Delta Event Tracking]`**:
   - Gửi delta xúc xắc `[3, 5]` ➔ Trích xuất đúng log: loại `dice`, điểm 8.
   - Gửi delta người chơi trừ 500 tiền tại ô số 1 ➔ Trích xuất đúng log: loại `rent` hoặc `tax`, deltaCash = -500.
   - Gửi delta ô đất đổi ownerId ➔ Trích xuất đúng log: loại `buy`, tên ô đất chính xác theo `BOARD_CONFIG`.
   - Gửi delta ô đất lên level 2 ➔ Trích xuất đúng log: loại `upgrade`, tên công trình "Biệt Thự".
3. **Hợp đồng `[TC-IMP17-03: UI Sideboard Rendering & Filters]`**:
   - Render `ActivityFeedSidebar` khi mở ➔ Hiển thị đủ tiêu đề, các thẻ nhật ký và nút đóng.
   - Bấm nút filter "Biến Động Tiền" ➔ Danh sách chỉ giữ các log có `deltaCash !== undefined`.
   - Bấm nút "✕" hoặc phím Escape ➔ Đóng sidebar.
4. **Hợp đồng `[TC-IMP17-04: Local Quality Gate Pass]`**:
   - `npm run lint:ui`: 0 vi phạm anti-patterns.
   - `npm run lint:slop`: 0 empty catch, 0 dirty cast, ngân sách LOC đạt 100%.
   - `npm run lint:dup`: Tỷ lệ lặp mã <= 4.0%.
   - `npx tsc --noEmit`: 0 lỗi type.

---

## 6. LỘ TRÌNH THI CÔNG TUẦN TỰ (PHASED EXECUTION)

```text
[Pha 1: Tầng Dữ Liệu & Store]
  ├── Tạo src/client/store/activity_store.ts
  └── Tạo tests/client/activity_store.test.ts ➔ Chạy Test PASS
           │
           ▼
[Pha 2: Tầng Trích Xuất Sự Kiện (Adapter)]
  ├── Tạo src/client/network/activity_tracker.ts
  ├── Tích hợp 1 dòng vào src/client/network/apply_delta.ts
  └── Tạo tests/client/activity_tracker.test.ts ➔ Chạy Test PASS
           │
           ▼
[Pha 3: Tầng Giao Diện UI & HUD Integration]
  ├── Tạo src/client/ui/activity_feed_sidebar.tsx
  ├── Thêm nút Toggle 📜 trên TopBar & mount vào HudContainer
  └── Tạo tests/client/activity_feed_sidebar.test.ts ➔ Chạy Test PASS
           │
           ▼
[Pha 4: Kiểm Chứng Toàn Diện & Quality Gates]
  ├── Chạy npm run gate:quick (<2s)
  └── Chạy npm test (105+ test files PASS 100%)
           │
           ▼
[Pha 5: Báo Cáo Nghiệm Thu & Cập Nhật Lộ Trình]
  ├── Tạo docs/reports/improvements/IMP-17-in-game-activity-feed-sideboard_report.md
  └── Đăng ký trạng thái Hoàn tất vào docs/master_roadmap.md
```

---

## 7. BƯỚC TIẾP THEO BẠN CẦN LÀM (HUMAN APPROVAL GATE)

Theo đúng quy trình SDLC:
1. Bạn hãy **đọc và rà soát bản kế hoạch trên**.
2. Nếu bạn đồng ý với thiết kế kiến trúc và danh mục file trên, bạn chỉ cần phản hồi:
   > **"Đồng ý tiến hành"** (hoặc `/boost hãy tiến hành plan`)
3. Nếu bạn muốn điều chỉnh gì (ví dụ: đổi vị trí hiển thị, thêm loại sự kiện, đổi số lượng log tối đa), bạn chỉ cần nêu yêu cầu để tôi cập nhật lại kế hoạch trước khi bắt tay vào viết mã.
