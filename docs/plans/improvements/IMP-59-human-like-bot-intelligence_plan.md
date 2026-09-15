# [IMP-59] Nâng Cấp Hệ Thống Bot AI Như Người Chơi Thực Tế (Bản Sắc Bất Đối Xứng, Khó Đoán & Cơ Hội Vô Địch Cân Bằng)

## 1. Bối Cảnh & Mục Tiêu

### Vấn Đề Cốt Lõi
1. **Bot `Passive` cầm chắc 0% cơ hội thắng**: Mã nguồn trước đây ép cứng `Passive` luôn từ chối mua đất (`INTENT_DECLINE`) trong pha `ActionPhase` và không bao giờ nâng cấp nhà (`INTENT_END_TURN`). Một người chơi phòng thủ thực tế là **Nhà Đầu Tư Giá Trị (Value Investor)** chỉ giải ngân khi có biên độ an toàn cao.
2. **Hành vi dễ bị bắt bài (Rule-Based Hardcode)**: Các ngưỡng quyết định mang tính nhị phân tuyệt đối. Thiếu yếu tố ngẫu nhiên tâm lý (Psychological Noise/Jitter) và tính toán tiện ích mềm (Softmax Utility).
3. **Các nghiệp vụ quan trọng còn khuyết**:
   - Bot không bao giờ chuộc lại tài sản đã thế chấp (`INTENT_REDEEM`) khi dư dả tiền mặt, khiến tài sản bị vô hiệu hóa thu tiền thuê suốt phần còn lại của trận đấu.
   - Bot không có chiến thuật Trạm Kiểm Toán (`INTENT_BAIL_OUT`): Đầu trận cần ra sớm để gom đất thì lại nằm chờ trong tù; cuối trận bản đồ đầy nhà cao tầng nguy hiểm thì lại không biết tận dụng tù làm nơi trú ẩn an toàn.

```
[KIẾN TRÚC MỤC TIÊU: BỘ NÃO BOT AI 4 TẦNG NHƯ NGƯỜI THẬT]

[Trạng Thái Bàn Cờ & Môi Trường Vĩ Mô]
                 │
                 ▼
[TẦNG 1: ĐỊNH GIÁ TIỆN ÍCH ĐA CHIỀU (Utility Scoring Engine)]
• Lợi nhuận dự kiến / Chi phí đầu tư
• Tiềm năng tạo độc quyền (Monopoly Multiplier)
• Khả năng chặn đối thủ hoàn tất bộ màu (Denial Multiplier)
• Giai đoạn ván cờ (Early 1-8 / Mid 9-20 / Late 21+)
                 │
                 ▼
[TẦNG 2: MÔ HÌNH NHIỄU TÂM LÝ & NGHI BINH (Jitter & Tactical Bluffing)]
• Nhiễu ngẫu nhiên Seeded Jitter (±10% - ±15%)
• Chiến thuật nghi binh đấu giá (Baiting / Trap Bids)
                 │
                 ▼
[TẦNG 3: HÀM PHÂN PHỐI XÁC SUẤT MỀM (Softmax Decision Function)]
• Thay thế if-else nhị phân bằng phân phối xác suất P(Action)
• Khó đoán hành vi, phản ánh trực giác và tính cách tự nhiên
                 │
                 ▼
[TẦNG 4: THỰC THI TOÀN DIỆN MỌI NGHIỆP VỤ (Full Game Action Suite)]
• Mua đất thông minh | Đấu giá đa tầng | Nâng cấp nhà đều
• Tự động chuộc đất thế chấp (INTENT_REDEEM)
• Chiến thuật ra tù theo thời cuộc (INTENT_BAIL_OUT)
• Cứu sinh vỡ nợ 5 bước tối ưu
```

---

## 2. Thiết Kế 3 Bản Sắc Bất Đối Xứng (Asymmetric Win Conditions)

| Tiêu Chí | `BotPersonality.Aggressive` (Cá Mập Thâu Tóm) | `BotPersonality.Balanced` (Đầu Tư Danh Mục) | `BotPersonality.Passive` (Nhà Đầu Tư Giá Trị / Phản Công) |
| :--- | :--- | :--- | :--- |
| **Con Đường Vô Địch** | **Tốc chiến tốc thắng**: Gom đất tốc độ, chốt độc quyền sớm, dồn lực nâng C2-C3 để hạ knock-out đối thủ trước vòng 15. | **Tăng trưởng thực dụng**: Cân bằng dòng tiền, đầu tư danh mục bền vững, tích sản đều đặn và thắng ở trung cuộc (vòng 12-25). | **Phòng ngự phản công**: Pháo đài tiền mặt, săn tài sản giá rẻ/thanh lý, chớp thời cơ đối thủ vỡ nợ, thắng ở tàn cuộc (vòng 25+). |
| **Hành Vi Mua Đất (`ActionPhase`)** | Mua 90-95% ô dẫm phải. Sẵn sàng vét túi nếu là ô tranh chấp hoặc ô độc quyền. | Mua 70-80% ô đất có tỷ suất sinh lời tốt, duy trì đệm an toàn 2D6 chuẩn mực. | **Mua đất chọn lọc**: Mua ô giá rẻ (Hạ tầng, Tiện ích, Nhóm Nâu/Xanh da trời) hoặc ô tạo độc quyền. Không mua đu đỉnh nhóm đắt đỏ nếu chưa có pháo đài tiền mặt. |
| **Hành Vi Nâng Cấp (`PropertyManagement`)** | Nâng cấp dồn dập ngay khi có độc quyền, chấp nhận cạn kiệt thanh khoản để tạo bẫy tiền thuê khủng. | Nâng đều C1-C2, chỉ nâng khi số dư sau nâng cấp vượt đệm an toàn 2D6. | Chỉ nâng cấp khi tiền mặt dồi dào gấp 3 lần chi phí xây dựng. Không nâng nhà nếu có nguy cơ dẫm ô đối thủ phía trước. |
| **Hành Vi Sàn Đấu Giá (`AuctionPhase`)** | Nâng giá quyết liệt (+100 Tr.), sẵn sàng đẩy giá cao để triệt hạ đối thủ hoặc tranh chấp bộ màu. | Trả giá sát giá trị thực (+50 Tr.), dừng lại khi giá vượt 120% định giá. | **Săn sale & Nghi binh**: Chỉ bid khi giá dưới 75% giá gốc. Thỉnh thoảng tham gia vài lượt đầu để kích giá đối thủ rồi bất ngờ bấm Pass. |
| **Đầu Tư Sàn HOSE** | Vung tiền tối đa 3.000 Tr. tìm kiếm tỷ suất sinh lời x2. | Đầu tư vừa phải 1.000 - 2.000 Tr. theo tiền nhàn rỗi. | Thận trọng: Chỉ đầu tư 500 - 1.000 Tr. khi tiền mặt dư dả lớn. |

---

## 3. Lộ Trình Triển Khai 2 Giai Đoạn (Two-Phase Implementation)

### Phase 1: [LÕI NGHIỆP VỤ & NĂNG LỰC THẮNG]
- **Tái cấu trúc Bot Passive thành Nhà đầu tư giá trị**: Thoát khỏi bẫy 0% thắng.
- **Tự động Chuộc đất thế chấp** (`src/domain/bot/bot_redeem.ts`): Thu hồi quyền thu tiền thuê theo 3 tầng ưu tiên.
- **Chiến thuật Ra tù thông minh theo thời kỳ** (`src/domain/bot/bot_audit.ts`): Ra sớm đầu trận (đất trống >= 8), trú ẩn cuối trận (đất trống < 8).
- **100% Tất Định (Deterministic)**: Kiểm thử xanh tuyệt đối, cover hết các case.

### Phase 2: [TÍNH KHÓ ĐOÁN & TÂM LÝ CON NGƯỜI]
- Phủ lớp Phân phối xác suất Softmax & Seeded Jitter lên trên nền Phase 1.
- Nghi binh đấu giá (Baiting / Trap Bids).
- Hoàn thiện độ khó đoán mà không làm gãy logic nền tảng.
