# BÁO CÁO NGHIỆM THU HOÀN TẤT CẢI TIẾN IMP-113 & IMP-114

> **Mã cải tiến**: IMP-113 (Swap Card Fallback & Proactive P2P Bot Trading) & IMP-114 (Treasury Public Stimulus & Macro Fiscal Policy)  
> **Trạng thái**: Hoàn Tất 100% (3 Trạm Pipeline Đã Phê Duyệt)  
> **Căn cứ**: Kế hoạch kỹ thuật [`IMP-113-114-swap-p2p-and-treasury-stimulus_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-113-114-swap-p2p-and-treasury-stimulus_plan.md)  
> **Kết quả thực nghiệm**: 3.000 ván headless (1.000 ván x 3 kịch bản bàn 2, 3, 4 người chơi).

---

## 1. TỔNG QUAN KẾT QUẢ TRIỂN KHAI

Hệ thống đã triển khai thành công 2 gói nâng cấp gameplay chiến lược:
- **IMP-113**: Tối ưu thẻ Khí Vận `CC_SWAP_PROJECT` với 3 tầng Fallback và tinh chỉnh thuật toán đàm phán P2P của Bot AI.
- **IMP-114**: Cơ chế Xả Quỹ Kho Bạc & Kích Cầu Kinh Tế Vĩ Mô (`processTreasuryStimulus`) tự động giải ngân 20% quỹ Kho Bạc cho 1-2 người chơi có tiền mặt thấp nhất khi số dư Kho Bạc đạt từ 10.000 Tr. VNĐ trở lên tại thời điểm bắt đầu vòng mới.

---

## 2. ĐỐI CHIẾU SỐ LIỆU THỰC NGHIỆM 3.000 VÁN (BEFORE VS AFTER)

| Thước đo / Chỉ số | Trước Tối Ưu (Gốc) | Sau Tối Ưu (IMP-113 & IMP-114) | Mức Độ Cải Thiện |
| :--- | :---: | :---: | :--- |
| **Tỷ lệ No-Op thẻ `CC_SWAP_PROJECT` (Bàn 2p)** | 69.1% (172 lần) | **0.4% (1 lần)** | Giảm 99.4% vô hiệu |
| **Tỷ lệ No-Op thẻ `CC_SWAP_PROJECT` (Bàn 3p)** | 72.8% (262 lần) | **0.0% (0 lần)** | **Triệt tiêu 100% No-Op** |
| **Tỷ lệ No-Op thẻ `CC_SWAP_PROJECT` (Bàn 4p)** | 73.1% (342 lần) | **0.0% (0 lần)** | **Triệt tiêu 100% No-Op** |
| **Dòng tiền thẻ `CC_SWAP_PROJECT` (Bàn 4p)** | 246.314 Tr. VNĐ | **917.028 Tr. VNĐ** | Tăng **+272%** hiệu lực kinh tế |
| **Kho Bạc tích tụ cuối trận (Bàn 2p)** | 12.372 Tr. VNĐ | **8.741 Tr. VNĐ** | Giảm 29.3% (xả quỹ điều tiết) |
| **Kho Bạc tích tụ cuối trận (Bàn 3p)** | 16.189 Tr. VNĐ | **8.753 Tr. VNĐ** | Giảm 45.9% (xả quỹ điều tiết) |
| **Kho Bạc tích tụ cuối trận (Bàn 4p)** | 18.915 Tr. VNĐ | **8.822 Tr. VNĐ** | Giảm 53.4% (xả quỹ điều tiết) |
| **Sự cố thâm hụt tài chính (Insolvency 4p)** | 2.305 sự cố | **1.362 sự cố** | Giảm **40.9%** rủi ro vỡ nợ |
| **Tỷ lệ giải cứu thoát hiểm thành công (Bàn 4p)** | 93.02% | **97.80%** | Thanh khoản giải cứu dồi dào hơn |
| **Tổng số nâng cấp C1-C3 (Bàn 3p)** | 4.419 công trình | **5.072 công trình** | Tăng **+14.8%** xây dựng |
| **Tổng số nâng cấp C1-C3 (Bàn 4p)** | 3.988 công trình | **4.407 công trình** | Tăng **+10.5%** xây dựng |
| **Công trình C3 hoàn thiện (Bàn 4p)** | 872 công trình | **1.063 công trình** | Tăng **+21.9%** công trình C3 |
| **Bảo toàn Kho Bạc & Bất biến hệ thống** | 0 VNĐ rò rỉ, 0% deadlock | **0 VNĐ rò rỉ, 0% deadlock** | Bất biến duy trì tuyệt đối |

---

## 3. CÁC THAY ĐỔI MÃ NGUỒN CỤ THỂ

1. **[`src/domain/treasury_stimulus.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/treasury_stimulus.ts)**:
   - Module độc lập 40 LOC (< 400 LOC limit).
   - Hàm `processTreasuryStimulus(room: Room)` thực hiện trích 20% khi `room.treasury >= 10.000 Tr. VNĐ`.
   - Phân bổ đều cho tối đa 2 người chơi có số dư tiền mặt thấp nhất và chưa phá sản.
2. **[`src/domain/chance_card_handlers.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/chance_card_handlers.ts)**:
   - Tái cấu trúc hàm `handleSwapProject`:
     * Luồng chính: Hoán đổi 2 ô C0 khi cả hai bên đều sở hữu C0.
     * Fallback A: Tự động nâng cấp miễn phí lên C1 khi người rút có C0 còn đối thủ không có C0.
     * Fallback B: Cưỡng chế mua lại ô C0 với giá 130% thị trường khi đối thủ có C0 và người rút đủ tiền; nếu thiếu tiền, người rút nhận 800 Tr. VNĐ trợ cấp từ Kho Bạc.
     * Fallback C: Nhận 1.000 Tr. VNĐ trợ cấp từ Kho Bạc khi cả hai bên đều không có ô C0.
3. **[`src/domain/bot/bot_trade.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_trade.ts)**:
   - Nâng hệ số giá mua Monopoly Gap từ vòng 6 trở đi: Aggressive 1.75x, Balanced 1.55x, Passive 1.35x.
   - Nới lỏng điều kiện chấp thuận bán đất đơn lẻ cho Bot Balanced khi nhận giá >= 1.5x hoặc khi tiền mặt < 2.000 Tr. VNĐ.
   - Giảm cooldown đàm phán tạo độc quyền từ 2 vòng xuống 1 vòng từ vòng 10 trở đi.
4. **[`src/server/turn_loop.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/turn_loop.ts)**:
   - Kích hoạt `processTreasuryStimulus(room)` tại điểm bắt đầu vòng đấu mới (`next === 0`).
5. **[`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md)**:
   - Ghi nhận Gotcha #146 về bảo toàn dòng tiền kích cầu vĩ mô và 3 tầng fallback thẻ hoán đổi.

---

## 4. XÁC NHẬN KIỂM THỬ VẬT LÝ & KIẾN TRÚC

- **Trạm 1 (RED)**: 47 atomic tests tại 2 suites mới đã chứng minh Business RED trước khi lập trình.
- **Trạm 2 (GREEN)**: 100% tests PASS (47/47 target tests, 4.384/4.384 toàn dự án).
- **Trạm 3 (Spec Review)**: `spec-reviewer` phê duyệt APPROVED 100%, xác nhận không có Scope Drift, không có vi phạm Atomic Test Mandate, các file logic đều <= 400 LOC.
- **Build & Docker**: Biên dịch SSR và client bundle thành công, đồng bộ Docker container `vtcoon-vtcoon-1`, HTTP 200 OK.
