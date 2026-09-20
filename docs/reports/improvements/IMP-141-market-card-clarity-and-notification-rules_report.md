# Báo Cáo Nghiệm Thu Cải Tiến Kỹ Thuật: IMP-141
## Chuẩn Hóa Toàn Diện Nội Dung & Quy Tắc Luật Chơi Các Thông Báo Sự Kiện Thị Trường (Actionable Market Card Clarity)

> **Mã Cải Tiến**: `IMP-141`  
> **Trạng Thái**: 🟢 **Hoàn Tất Nghiệm Thu (Trạm 3 Verified & Signed Off)**  
> **Traceability**: `[UC-GAME-038..041]`, `tests/client/imp141_market_card_clarity_and_notification_rules.test.ts`, Gotcha #188  
> **Căn Cứ SSOT**: [`docs/domain/event_card_metadata.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/event_card_metadata.ts), [`docs/master_roadmap.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/master_roadmap.md)

---

## 1. TỔNG QUAN KẾT QUẢ TRIỂN KHAI

Ticket `IMP-141` đã giải quyết triệt để tình trạng các thông báo sự kiện thị trường bị mơ hồ, thiếu luật chơi theo phản ánh thực tế từ người dùng (`media_1789908255645.png`):
1. **Khắc phục 100% sự mơ hồ của các thẻ bài thị trường**:
   - `MC_PUBLIC_INVEST` (Đẩy Mạnh Vốn Đầu Tư Công): Từ câu khẩu hiệu chung chung chuyển thành tóm tắt chuẩn xác: **"Nhân đôi cước vận tải tại 4 Ga Tàu (Ô 5, 15, 25, 35)."**
   - `MC_COASTAL_STORM` (Thời Tiết Cực Đoan Duyên Hải): Từ câu tả cảnh bão lũ chuyển thành tóm tắt luật chơi rõ ràng: **"Miễn 100% tiền thuê ô ven biển (Ô 11, 14, 16, 18, 19); dừng chân mất lượt."**
   - Chuẩn hóa toàn bộ 14 thẻ thị trường còn lại và thẻ cơ hội kéo dài (`CC_PORT_EXCLUSIVE`) với đầy đủ con số tiền thưởng/phạt, tỷ lệ % và ô cờ chịu tác động.
2. **Nâng cấp độ giãn dòng và chống cụt chữ trên Mobile**:
   - Nâng cấp `MarketEventTicker` từ `line-clamp-2` lên **`line-clamp-3`**, kết hợp giới hạn độ dài chuỗi tối ưu (53–76 ký tự), đảm bảo hiển thị trọn vẹn 100% trên các màn hình di động nhỏ (< 360px).
3. **Bảo toàn tính toàn vẹn của hệ thống**:
   - 151/151 tests liên quan (`imp141`, `imp135`, `imp132`, `imp57`, `imp140`) PASS 100%.

---

## 2. BẢNG ĐỐI SOÁT MÃ NGUỒN VẬT LÝ

| Tệp Mã Nguồn | Thay Đổi Thực Tế | Chỉ Số LOC & Độ Phức Tạp | Trạng Thái Linter / Test |
| :--- | :--- | :---: | :---: |
| [`src/client/ui/market_event_ticker.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/market_event_ticker.tsx) | Thêm `ACTIVE_MARKET_EFFECT_SUMMARIES`, cập nhật `resolveMarketEffectSummary`, nâng lên `line-clamp-3` | +45 LOC / CC = 4 | Clean |
| [`src/domain/event_card_metadata.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/event_card_metadata.ts) | Chuẩn hóa cấu trúc trường `description` cho 10 thẻ Market/Chance | +10 LOC / CC = 1 | Clean |
| [`tests/client/imp135_market_ticker_clarity_and_popup_duration.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp135_market_ticker_clarity_and_popup_duration.test.ts) | Đồng bộ matcher `MC_COASTAL_STORM` khớp với chuỗi mới | +1 LOC / CC = 1 | 23/23 PASS |
| [`tests/client/imp141_market_card_clarity_and_notification_rules.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp141_market_card_clarity_and_notification_rules.test.ts) | Bộ test hợp đồng đối kháng 4-Facet mới | 21 atomic tests | 21/21 PASS |
| [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) | Ghi nhận bất biến Gotcha #188 `[UI/MARKET-TICKER]` | 25 lines | SSOT Synced |

---

## 3. BẰNG CHỨNG KIỂM MINH QUY TRÌNH 3 TRẠM

### 3.1. Trạm 1 (RED Contract Tests)
- `qa-tester` tạo 21 atomic contract tests tại `tests/client/imp141_market_card_clarity_and_notification_rules.test.ts`.
- Xác nhận **Business RED chuẩn 13/21 tests thất bại** (do thiếu ánh xạ rõ ràng và vẫn dùng `line-clamp-2`).

### 3.2. Trạm 2 (GREEN Implementation)
- `implementer` cập nhật mã nguồn tối thiểu theo đúng kế hoạch.
- Toàn bộ 151/151 tests liên quan PASS 100%:
  * `imp141_market_card_clarity_and_notification_rules.test.ts`: **21/21 PASS**
  * `imp135_market_ticker_clarity_and_popup_duration.test.ts`: **23/23 PASS**
  * `imp132_declutter_ticker_and_friendly_event_modal.test.ts`: **23/23 PASS**
  * `imp57_economy_and_card_clarity.test.ts`: **63/63 PASS**
  * `imp140_fuel_surge_and_auction_polish.test.ts`: **21/21 PASS**
- Chạy `npm run lint:ui`: **0 vi phạm** trên toàn bộ 163 tệp client UI.

### 3.3. Trạm 3 (Independent Review Sign-Off)
- **Spec Reviewer (`spec-reviewer`)**: **APPROVED** (100% Spec Reconciliation, bảo toàn toàn bộ hợp đồng SSOT).
- **UI Craft Reviewer (`ui-craft-reviewer`)**: **DISPOSITION SHIP** (0 vi phạm Impeccable, câu chữ đanh thép 53–76 ký tự đạt chuẩn 1-second comprehension, `line-clamp-3` chống cắt chữ hoàn hảo).
