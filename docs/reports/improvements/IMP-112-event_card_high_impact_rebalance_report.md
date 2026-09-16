# BÁO CÁO CẢI TIẾN: IMP-112 - TÁI CÂN BẰNG TOÀN DIỆN HỆ THỐNG THẺ SỰ KIỆN VTCOON (HIGH-IMPACT EVENT CARD REBALANCING)

> **Mã cải tiến:** IMP-112  
> **Hạng mục:** Gameplay Balance, Economy & Event FSM (Hạng mục 1)  
> **Trạng thái:** HOÀN THÀNH XUẤT XƯỞNG (3-Station Verified & Shipped)  
> **Quy trình:** Đã qua 3 Trạm (RED Contract Test ➔ GREEN Implementation ➔ Station 3 Independent Review).

---

## 1. TỔNG QUAN KẾT QUẢ TRIỂN KHAI

Triển khai thành công 100% yêu cầu tái cân bằng cho 11 thẻ sự kiện chiến lược thuộc 3 nhóm, xóa bỏ dứt điểm tình trạng thẻ "hiệu ứng nhẹ nhàng, hầu như không ảnh hưởng gì":

| Thẻ Sự Kiện | Phân Loại | Cơ Chế Cũ | Cơ Chế Mới (IMP-112) | Tác Động Thực Chiến |
| :--- | :--- | :--- | :--- | :--- |
| `CC_COPYRIGHT` | Cơ Hội (Nhóm A) | Phạt -400 Tr. | **Phạt -1.200 Tr. VNĐ** nộp Kho Bạc | Gây sức ép thanh khoản thực tế, buộc cân nhắc bán/thế chấp |
| `CC_FRANCHISE` | Cơ Hội (Nhóm A) | Thu 300 Tr./đối thủ | **Thu 800 Tr. VNĐ/đối thủ** (bàn 4 người thu 2.400 Tr.) | Cú hích tài chính lớn cho người rút, phân hóa thứ hạng |
| `CC_TAX_AUDIT` | Cơ Hội (Nhóm A) | Phạt 200 Tr./ô C0 | **Phạt 500 Tr. VNĐ/ô C0** nộp Kho Bạc | Trừng phạt mạnh hành vi găm giữ đất trống không phát triển |
| `MC_CASINO_PILOT` | Thị Trường (Nhóm B) | Chỉ ô 27 C3 nhận 2.000 Tr. (98% No-op) | **Mọi ô Dịch Vụ C2+ nhận 1.500 Tr., ô 27 C3 nhận 3.000 Tr. Fallback: 1.000 Tr. cho người nghèo nhất** | Khử 100% No-op; kích thích xây dựng nhóm Dịch Vụ; cứu trợ người nghèo |
| `CC_VENUE_INCIDENT` | Cơ Hội (Nhóm B) | Phạt 800 Tr. nếu có ô DV (không có thì No-op) | **Phạt 1.200 Tr. nếu có ô DV; nếu không có vẫn phạt 600 Tr. phí bảo an** | Khử 100% No-op; người rút luôn chịu tác động tài chính |
| `MC_ANTI_SPECULATE` | Thị Trường (Nhóm B) | Thuế P2P 20% (thường No-op nếu không giao dịch) | **Thuế P2P 20% + Phạt ngay 1.000 Tr. thuế tài sản cho ai có >= 4 ô đất** | Tác động trực diện ngay lập tức lên các đại gia gom đất |
| `CC_SWAP_PROJECT` | Cơ Hội (Nhóm B) | Đổi ô C0 cùng màu (thường No-op) | **Đổi 1 ô C0 bất kỳ của đối thủ không giới hạn nhóm màu** | Khử 100% No-op; trở thành vũ khí chiến thuật phá chuỗi độc quyền |
| `MC_UTILITY_DOUBLE` | Thị Trường (Nhóm C) | x2 phí tiện ích 1 vòng (chờ dẫm) | **x2 phí tiện ích 2 vòng + Mọi người nộp ngay 400 Tr. (chia ô 12/28 hoặc Kho Bạc)** | Dòng tiền tức thì; EVN & Viettel trở thành cỗ máy in tiền ngắn hạn |
| `MC_FUEL_SURGE` | Thị Trường (Nhóm C) | +500 Tr. cước 1 vòng (chờ dẫm) | **+500 Tr. cước 2 vòng + Mọi người nộp ngay 500 Tr. (chia 4 ô hạ tầng hoặc Kho Bạc)** | Dòng tiền tức thì; nâng vị thế của 4 ô hạ tầng giao thông |
| `CC_PORT_EXCLUSIVE` | Cơ Hội (Nhóm C) | Trích 50% phí cảng 2 vòng (chờ dẫm) | **Nhận ngay 1.000 Tr. cổ tức logistics từ Kho Bạc + trích 50% phí cảng 2 vòng** | Lợi ích tức thì chắc chắn 1.000 Tr., kết hợp thu nhập thụ động |
| `CC_BUILD_HALT` | Cơ Hội (Nhóm C) | Phong tỏa ô đất 2 vòng | **Phạt ngay 800 Tr. chi phí thanh tra nộp Kho Bạc + phong tỏa 2 vòng** | Vừa thiệt hại tức thì vừa mất nguồn thu tương lai |
| `CC_MEDIA_CRISIS` | Cơ Hội (Nhóm C) | Phong tỏa ô dịch vụ 1 vòng | **Phạt ngay 800 Tr. chi phí xử lý khủng hoảng nộp Kho Bạc + phong tỏa 2 vòng** | Vừa thiệt hại tức thì vừa phong tỏa thời hạn kép |

---

## 2. BẢNG TỔNG HỢP KIỂM CHỨNG & THI CÔNG

| Thành Phần | Tệp Tin Mã Nguồn | Thay Đổi Chính | Trạng Thái |
| :--- | :--- | :--- | :--- |
| Metadata & I18n | `src/domain/event_card_metadata.ts` | Cập nhật 11 thẻ: `effectDelta`, `effectDetail`, `duration`, `destination` | Clean (LOC: 341) |
| Chance Handlers | `src/domain/chance_card_handlers.ts` | Cập nhật `handleTaxAudit`, `handleFranchise`, `handleSwapProject`, bổ sung tham số `room?: Room` | Clean (LOC: 231) |
| Market Handlers | `src/domain/market_card_handlers.ts` | Cập nhật `handleCasinoPilot`, `MC_ANTI_SPECULATE`, `MC_UTILITY_DOUBLE`, `MC_FUEL_SURGE`, bổ sung `room?: Room` | Clean (LOC: 185) |
| Card Engine | `src/domain/event_card_engine.ts` | Chuyển tiếp `room` vào `applyChanceCard` và `drawChanceCard` | Clean (LOC: 108) |
| Property Manager | `src/domain/property_manager.ts` | Hỗ trợ tính toán tiện ích và hạ tầng linh hoạt | Clean (LOC: 295) |
| Delta Broadcaster | `src/server/network/delta_broadcaster.ts` | Bảo vệ null-safe cho `room.treasury` | Clean (LOC: 85) |
| Test Hợp Đồng | `tests/domain/event_card_rebalance_high_impact.test.ts` | 40 atomic tests, Universal 4-Facet Matrix | **40/40 PASS 100%** |
| Toàn Bộ Hệ Thống | Toàn bộ 219 test suites | 4,336 unit/contract/integration/stress tests | **219/219 PASS 100%** |

---

## 3. REFLEXION VÀ BÀI HỌC VẬN HÀNH (GOTCHA #144)

- **Treasury Conservation Invariant**: Mọi khoản phạt hoặc lệ phí từ thẻ sự kiện (kể cả thẻ Cơ Hội hay Thị Trường) BẮT BUỘC phải quy về `room.treasury` để bảo toàn tổng lượng tiền tệ của nền kinh tế bàn cờ. Mọi khoản giải ngân kích cầu/cổ tức BẮT BUỘC trích từ `room.treasury` (giới hạn sàn 0 VNĐ, không sinh tiền ảo).
- **Graceful Null-Safe Room Invariant**: Handler của thẻ sự kiện có thể được gọi từ môi trường unit test không khởi tạo đầy đủ `Room`. Do đó mọi truy cập `room.treasury` hoặc `room.players` BẮT BUỘC kiểm tra điều kiện an toàn `if (room) { ... }`.
