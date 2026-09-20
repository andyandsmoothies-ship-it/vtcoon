# [IMP-135] Kế Hoạch Minh Bạch Hóa Sự Kiện Thị Trường & Gia Hạn Thời Lượng Pop-up

> **Mã Cải Tiến**: `IMP-135`  
> **Mức Độ**: 🟡 Client UI & Timing Polish (0 Schema, 0 FSM, 0 Network Protocol)  
> **Traceability**: `[UC-IMP135]`, `[TC-IMP135.01..TC-IMP135.20]`, Gotcha #177  

---

## 1. Mục Tiêu & Bối Cảnh
1. **Minh bạch hóa Sự Kiện Thị Trường (`MarketEventTicker`)**:
   - Thẻ sự kiện thị trường hiển thị bên dưới TopBar hiện chỉ có `{icon}`, `{title}` và badge `Còn X vòng`.
   - Người chơi không biết thẻ này gây ra tác động gì cho bàn cờ (ví dụ: "Mùa Cao Điểm Du Lịch Quốc Tế" tác động ra sao).
   - *Giải pháp*: Bổ sung dòng giải thích hiệu lực súc tích (Effect Summary Subtitle) trích xuất từ `MARKET_CARD_DETAILS`, thiết kế responsive 2 tầng trên cả Mobile và Desktop.
2. **Kéo dài thời lượng Pop-up giữa màn hình (`FloatingNumbers` & `ServerToast`)**:
   - Thời gian hiển thị hiện tại quá ngắn (`FLOATING_TEXT_DURATION_MS = 2200ms`, `ServerToast = 4000ms`), người chơi đọc không kịp các biến động tài chính phức tạp và thẻ bài sự kiện.
   - *Giải pháp*:
     - Sự kiện quan trọng (`MilestoneBanner` cho `chance`, `market`, `monopoly`, `debt_relief`): Nâng lên **4.500ms** (`EVENT_BANNER_DURATION_MS = 4500`).
     - Giao dịch thông thường (`FloatingBadge` cho `buy`, `rent`, `upgrade`, `tax`, `auction_win`...): Nâng lên **3.600ms** (`TRANSACTION_POPUP_DURATION_MS = 3600`).
     - Thông báo lỗi/hướng dẫn máy chủ (`ServerToast`): Nâng lên **6.000ms** (`SERVER_ERROR_TOAST_TIMEOUT_MS = 6000`), bảo toàn nút đóng nhanh ✖ chuẩn WCAG 44px.
     - Bảo toàn hằng số `FLOATING_TEXT_DURATION_MS = 2200` để 100% tương thích hợp đồng kiểm thử `[TC-117.01]`.

---

## 2. Thiết Kế Kỹ Thuật

### A. Tóm tắt hiệu lực thị trường (`src/client/ui/market_event_ticker.tsx`)
- Xuất khẩu hàm `resolveMarketEffectSummary(type: string): string`:
  - Tra cứu `MARKET_CARD_DETAILS[type as MarketCardId]`.
  - Trích xuất câu mô tả hành động từ `description` (hoặc `effectDetail`): lấy phần sau dấu hai chấm `: ` nếu có để thông điệp trực diện, súc tích (ví dụ: `"Nhân đôi phí thuê tại tất cả các điểm nghỉ dưỡng ven biển."`).
  - Fallback an toàn nếu thẻ không xác định.
- Cập nhật JSX:
  - Cấu trúc 2 tầng (Dòng 1: Icon + Tên + Badge vòng còn lại; Dòng 2: Subtitle tóm tắt hiệu lực).
  - Áp dụng class: `text-[11px] sm:text-xs text-slate-600 font-semibold leading-tight line-clamp-2 mt-0.5`.

### B. Gia hạn thời lượng hiển thị (`src/client/store/game_store.ts` & `src/client/store/game_store_types.ts`)
- Mở rộng `FloatingTextItem`:
  ```ts
  export interface FloatingTextItem {
    readonly id: string;
    readonly text: string;
    readonly type: FloatingTextType;
    readonly playerId: string;
    readonly timestamp: number;
    readonly durationMs?: number;
    readonly actionType?: FloatingActionType;
    readonly title?: string;
    readonly cellIndex?: number;
    readonly targetPlayerName?: string;
  }
  ```
- Thêm hằng số:
  ```ts
  export const FLOATING_TEXT_DURATION_MS = 2200; // Bảo tồn contract [TC-117.01]
  export const EVENT_BANNER_DURATION_MS = 4500;
  export const TRANSACTION_POPUP_DURATION_MS = 3600;
  ```
- Trong `addFloatingText(item)`:
  - Tự động gán thời lượng hiển thị:
    `const isMilestone = item.actionType === 'chance' || item.actionType === 'market' || item.actionType === 'monopoly' || item.actionType === 'debt_relief';`
    `const duration = item.durationMs ?? (isMilestone ? EVENT_BANNER_DURATION_MS : TRANSACTION_POPUP_DURATION_MS);`
  - Thiết lập `setTimeout` tự hủy theo `duration`.
- Trong `clearExpiredFloatingTexts(now)`:
  - Dùng `t.durationMs ?? TRANSACTION_POPUP_DURATION_MS`.

### C. Nâng cấp hiển thị nội dung thẻ sự kiện (`src/client/ui/floating_numbers.tsx`)
- Trong `MilestoneBanner`:
  - Thay đổi class mô tả từ `truncate` cứng thành `line-clamp-2` để người chơi đọc trọn vẹn mô tả của thẻ Cơ Hội & Thị Trường.

### D. Kéo dài thời gian Toast máy chủ (`src/client/network/use_app_session.ts`)
- Xuất khẩu hằng số `SERVER_ERROR_TOAST_TIMEOUT_MS = 6000`.
- Thiết lập `setTimeout(..., SERVER_ERROR_TOAST_TIMEOUT_MS)`.

---

## 3. Kế Hoạch Kiểm Thử (3 Trạm)
- **Trạm 1 (RED Contract Test)**:
  - `tests/client/imp135_market_ticker_clarity_and_popup_duration.test.ts` (>= 15 atomic tests).
  - Facet 1: Market Effect Summary Resolution & Coverage.
  - Facet 2: Market Event Ticker 2-Tier Responsive Layout.
  - Facet 3: Pop-up & Banner Extended Duration Invariants.
  - Facet 4: Server Error Toast Extended Timeout & Manual Dismissal.
- **Trạm 2 (GREEN Implementation)**:
  - Triển khai code tối thiểu trong `src/client/**`.
- **Trạm 3 (Independent Verification & Evidence)**:
  - Kiểm tra `npm run lint:ui`.
  - Chạy toàn bộ test suites liên quan (`imp117`, `imp122`, `imp123`, `imp128`, `imp135`).
  - Ghi nhận Gotcha #177 vào `docs/domain/gotchas.md`.
