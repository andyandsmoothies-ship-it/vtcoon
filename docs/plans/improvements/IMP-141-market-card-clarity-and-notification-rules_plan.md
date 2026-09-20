# Kế Hoạch Cải Tiến Kỹ Thuật: IMP-141
## Chuẩn Hóa Toàn Diện Nội Dung & Quy Tắc Luật Chơi Các Thông Báo Sự Kiện Thị Trường (Actionable Market Card Clarity)

> **Mã Cải Tiến**: `IMP-141`  
> **Phân Vùng**: Domain Event Card Metadata & Client Market Event Ticker UI (Tier 2 - Full Rigor)  
> **Traceability**: `[UC-GAME-038..041]`, `tests/client/imp141_market_card_clarity_and_notification_rules.test.ts`, Gotcha #188  
> **Căn Cứ SSOT**: [`docs/domain/event_card_metadata.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/event_card_metadata.ts), [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md)

---

## 1. BỐI CẢNH & PHÂN TÍCH HIỆN TRẠNG (FORENSIC AUDIT)

Từ ảnh chụp màn hình thực tế của người chơi (`media_1789908255645.png`), thanh sự kiện `MarketEventTicker` dưới TopBar hiển thị các thông báo quá mơ hồ, đậm chất văn học/khẩu hiệu và thiếu hoàn toàn các quy tắc luật chơi:
1. **`MC_PUBLIC_INVEST` (Đẩy Mạnh Vốn Đầu Tư Công)**:
   - Hiển thị: *"Đẩy mạnh giải ngân các gói vốn đầu tư công phát triển hạ tầng giao thông trọng điểm."*
   - Khuyết điểm: Người chơi không thể biết hiệu lực thực tế là **nhân đôi tiền cước vận tải tại 4 Ga Tàu (Ô 5, 15, 25, 35)** và giải ngân gói vốn hỗ trợ.
2. **`MC_COASTAL_STORM` (Thời Tiết Cực Đoan Duyên Hải)**:
   - Hiển thị: *"Bão lũ đổ bộ diện rộng dải duyên hải gây ngập lụt và cô lập giao thông ven biển."*
   - Khuyết điểm: Người chơi không thể biết hiệu lực thực tế là **miễn 100% tiền thuê ô ven biển (Ô 11, 14, 16, 18, 19)** và người dừng chân **bị mất lượt kế tiếp**.

---

## 2. QUY CHUẨN KIẾN TRÚC & GIẢI PHÁP KỸ THUẬT

### 2.1. Bảng Ánh Xạ Trực Tiếp SSOT (`ACTIVE_MARKET_EFFECT_SUMMARIES`)
Trong `src/client/ui/market_event_ticker.tsx`:
- Thiết lập bảng ánh xạ `ACTIVE_MARKET_EFFECT_SUMMARIES` bao phủ toàn bộ 16 thẻ `MarketCardId` và các modifier kéo dài từ thẻ Cơ hội (`CC_PORT_EXCLUSIVE`).
- Mọi chuỗi tóm tắt được viết cô đọng, đanh thép, đạt độ dài 53–76 ký tự ($\le 80$ ký tự), nêu bật các con số tài chính cụ thể, tỷ lệ %, tên ô cờ và chế tài phạt/mất lượt đạt chuẩn *"1-second comprehension"*.
- Cập nhật `resolveMarketEffectSummary` ưu tiên tra cứu từ `ACTIVE_MARKET_EFFECT_SUMMARIES` trước khi fallback.

### 2.2. Nâng Cấp Layout & Chống Cắt Chữ Trên Mobile
- Nâng cấp thẻ `<p>` mô tả hiệu lực trong `MarketEventTicker` từ `line-clamp-2` lên **`line-clamp-3`**.
- Đảm bảo ngay cả trên màn hình di động nhỏ (< 360px), toàn bộ câu chữ và chế tài luật chơi không bao giờ bị cắt cụt.

### 2.3. Đồng Bộ Hóa Dữ Liệu Miền (`event_card_metadata.ts`)
- Chuẩn hóa trường `description` của toàn bộ các thẻ Market và Chance theo cấu trúc chuẩn:
  `[Tiêu đề / Bối cảnh]: [Quy tắc luật chơi con số rõ ràng]`.
- Bảo toàn 100% các trường `effectDetail`, `targetScope`, `duration`, `destination` để không làm đứt gãy hợp đồng hồi quy của `imp57`, `imp132`, `imp135`, `imp140`.

---

## 3. MA TRẬN KIỂM THỬ HỢP ĐỒNG ĐỐI KHÁNG (UNIVERSAL 4-FACET MATRIX)

Tệp kiểm thử: `tests/client/imp141_market_card_clarity_and_notification_rules.test.ts` (21 atomic tests):
- **Facet 1 (16 Market Cards Clarity Coverage)**:
  * TC-141.01: `MC_PUBLIC_INVEST` chứa rõ "Nhân đôi cước" và 4 Ga Tàu (Ô 5, 15, 25, 35).
  * TC-141.02: `MC_COASTAL_STORM` chứa rõ "Miễn 100% tiền thuê" và "mất lượt".
  * TC-141.03: `MC_NIGHT_ECONOMY` chứa "Nhân đôi" và ô Dịch Vụ C1+ (Ô 6, 8, 26, 27).
  * TC-141.04: `MC_ALCOHOL_CHECK` chứa "Giảm 50%", "phạt 800 Tr." và "mất lượt".
  * TC-141.05: `MC_LAND_FEVER` chứa "50%" và các tỉnh thành Bình Dương, Đồng Nai, Hưng Yên.
  * TC-141.06: `MC_RATE_HIKE` chứa "10%" và "Khởi Hành (GO)".
  * TC-141.07: `MC_CREDIT_STIMULUS` chứa "Giảm 20%" và "C1-C3".
  * TC-141.08: `MC_PEAK_TOURISM` chứa "Nhân đôi" và "BĐS Nghỉ Dưỡng".
  * TC-141.09: `MC_FREEZE_TRADE` chứa "Tạm ngưng mua" và "cấm chuyển nhượng P2P".
  * TC-141.10: `MC_FUEL_SURGE` chứa "500 Tr." và 4 Ga Tàu.
  * TC-141.11: `MC_URBAN_PLANNING` chứa "20%" và "Hà Nội & TP.HCM".
  * TC-141.12: `MC_UTILITY_DOUBLE` chứa "Nhân đôi" và "EVN / Viettel".
  * TC-141.13: `MC_ANTI_SPECULATE` chứa "20%" và "Kho Bạc".
  * TC-141.14: `MC_FIRE_INSPECTION` chứa rõ "200 Tr.", "400 Tr.", "800 Tr." và "C0".
  * TC-141.15: `MC_CASINO_PILOT` chứa "1.500 Tr.", "3.000 Tr." hoặc "1.000 Tr.".
  * TC-141.16: `MC_MEGA_CONCERT` chứa "di chuyển" và "Dịch Vụ".
- **Facet 2 (Active Chance Modifiers Coverage)**:
  * TC-141.17: `CC_PORT_EXCLUSIVE` chứa "50%" và "Cảng biển".
- **Facet 3 (Layout & Rendering Safeguard)**:
  * TC-141.18: Render với class `line-clamp-3`.
  * TC-141.19: Render đồng thời 2 thẻ `MC_PUBLIC_INVEST` và `MC_COASTAL_STORM` an toàn.
- **Facet 4 (Fallback & Boundary Safeguard)**:
  * TC-141.20: Fallback an toàn cho thẻ không xác định hoặc rỗng.
  * TC-141.21: 100% các chuỗi trong `ACTIVE_MARKET_EFFECT_SUMMARIES` có độ dài $\le 85$ ký tự.
