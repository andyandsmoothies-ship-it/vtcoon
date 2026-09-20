# [IMP-135] Báo Cáo Hoàn Tất: Minh Bạch Hóa Sự Kiện Thị Trường & Gia Hạn Thời Lượng Pop-up

> **Mã Cải Tiến**: `IMP-135`  
> **Trạng Thái**: ✅ SHIP READY / 100% HOÀN THÀNH  
> **Kế Hoạch Đối Chiếu**: `docs/plans/improvements/IMP-135-market-ticker-clarity-and-popup-duration_plan.md`  
> **Traceability**: `[UC-IMP135]`, `[TC-IMP135.01..TC-IMP135.21]`, Gotcha #178  

---

## 1. Tóm Tắt Kết Quả Triển Khai
1. **Minh bạch hóa Sự Kiện Thị Trường (`MarketEventTicker`)**:
   - Thêm hàm `resolveMarketEffectSummary` trích xuất trực tiếp mô tả hành động từ `MARKET_CARD_DETAILS` trong `src/domain/event_card_metadata.ts`.
   - Nâng cấp cấu trúc `MarketEventTicker` thành 2 tầng:
     - **Tầng 1**: `{icon}` **{title}** và badge `Còn X vòng`.
     - **Tầng 2**: Dòng giải thích hiệu lực súc tích (`text-[11px] sm:text-xs text-slate-600 font-semibold line-clamp-2 pl-6 sm:pl-7`), người chơi nhìn vào hiểu ngay bàn cờ và ví tiền đang bị tác động như thế nào.
2. **Kéo dài thời lượng hiển thị Pop-up & Toast (`FloatingNumbers` & `use_app_session`)**:
   - Thẻ sự kiện & Cột mốc (`chance`, `market`, `monopoly`, `debt_relief`): Nâng từ 2.2s lên **4.5s** (`EVENT_BANNER_DURATION_MS = 4500`).
   - Giao dịch tiền tệ thông thường (`buy`, `rent_pay`, `upgrade`, `tax`...): Nâng từ 2.2s lên **3.6s** (`TRANSACTION_POPUP_DURATION_MS = 3600`).
   - Toast thông báo & lỗi máy chủ (`ServerToast`): Nâng từ 4.0s lên **6.0s** (`SERVER_ERROR_TOAST_TIMEOUT_MS = 6000`), có nút ✖ chuẩn WCAG 44px để đóng nhanh.
   - Thẻ sự kiện trong `MilestoneBanner`: Chuyển từ `truncate` đơn dòng sang `line-clamp-2 break-words` giúp đọc trọn vẹn thông điệp.
   - Bảo toàn 100% hằng số `FLOATING_TEXT_DURATION_MS = 2200` theo hợp đồng `[TC-117.01]`.

---

## 2. Bảng Đối Chiếu Hợp Đồng Kiểm Thử & Metric
| Tệp Kiểm Thử | Số Lượng Test | Kết Quả | Ghi Chú |
| :--- | :---: | :---: | :--- |
| `tests/client/imp135_market_ticker_clarity_and_popup_duration.test.ts` | 21 | ✅ 21/21 PASS | Toàn bộ 4 Facets hợp đồng mới |
| `tests/client/imp128_desktop_ui_ticker_and_toast_sync.test.ts` | 28 | ✅ 28/28 PASS | Đồng bộ Ticker và Toast |
| `tests/contracts/imp123_friendly_popups.test.ts` | 21 | ✅ 21/21 PASS | Giao diện thân thiện Pop-up |
| `tests/contracts/imp122_comprehensive_popups.test.ts` | 25 | ✅ 25/25 PASS | Phủ sóng toàn bộ pop-up |
| `tests/contracts/imp117_contextual_transaction_toast.test.ts` | 17 | ✅ 17/17 PASS | Bảo tồn hằng số 2200ms |
| **Tổng Cộng Hợp Đồng Liên Quan** | **112** | **✅ 112/112 PASS** | **0 Hỏng Hóc Hợp Đồng** |

- **UI Linter (`npm run lint:ui`)**: ✅ 0 vi phạm (0 Anti-patterns trên 156 tệp).
- **TypeScript Compiler (`tsc --noEmit`)**: ✅ Exit Code 0 (0 Type Errors).
- **Docker Container (`vtcoon-vtcoon-1`)**: ✅ Rebuilt & `Up (healthy)`.

---

## 3. Danh Sách Tệp Can Thiệp
- `src/client/ui/market_event_ticker.tsx`: Thêm hàm `resolveMarketEffectSummary` và tái cấu trúc thẻ 2 tầng.
- `src/client/ui/floating_numbers.tsx`: Đổi `truncate` thành `line-clamp-2 break-words` cho `MilestoneBanner`.
- `src/client/store/game_store.ts`: Thêm hằng số `EVENT_BANNER_DURATION_MS`, `TRANSACTION_POPUP_DURATION_MS`, tự động tính duration theo actionType.
- `src/client/store/game_store_types.ts`: Bổ sung `durationMs?: number` vào `FloatingTextItem`.
- `src/client/network/use_app_session.ts`: Thêm `SERVER_ERROR_TOAST_TIMEOUT_MS = 6000` và cập nhật timer.
- `docs/domain/gotchas.md`: Ghi nhận Gotcha #178.
