# [IMP-57] Kế Hoạch Tái Cân Bằng Dòng Tiền Bàn Cờ, Khơi Thông Quỹ Kho Bạc Ô 20 & Chuẩn Hóa 36 Thẻ Bài

- **Mã Ticket**: `IMP-57`
- **Mức Độ Ưu Tiên**: P1 - High (Core Gameplay & Economy Balance)
- **Khu Vực Tác Động**: `src/server/special_cell_handler.ts`, `src/domain/bot/`, `src/domain/event_card_types.ts`, `src/domain/event_card_metadata.ts`, `src/client/ui/modals/event_card_modal.tsx`
- **Yêu Cầu Ràng Buộc**: Bảo toàn 100% các bài test đang chạy (Zero Regression Guarantee), sát thực tế đời sống kinh doanh Việt Nam.

---

## 1. Bối Cảnh & Vấn Đề

1. **Khủng hoảng thanh khoản sớm (Early-game Liquidity Drought)**:
   - Người chơi và Bot thường xuyên cháy túi sau 3-5 vòng, trước khi kịp đầu tư xây dựng các chuỗi BĐS lớn.
   - Nguyên nhân: Tiền thuế, phạt, lãi thế chấp và đấu giá liên tục chảy vào Quỹ Kho Bạc (`room.treasury`), nhưng Ô 20 (Nghỉ Dưỡng Miễn Phí) không có cơ chế phát thưởng. Quỹ Kho Bạc trở thành hố đen tiền tệ giam giữ hàng nghìn tỷ đồng.
2. **Bot AI thiếu đệm an toàn sống còn**:
   - Bot có xu hướng mua mọi ô đất nếu đủ tiền (ngay cả khi chỉ còn lại 1 Tr. VNĐ). Khi dẫm phải ô thuế hoặc phí thuê nhỏ ở lượt sau, Bot lập tức rơi vào vỡ nợ (Insolvency).
3. **Sàn HOSE bị lệch SSOT**:
   - Tỷ lệ hoàn vốn trong mã nguồn khiến tỷ lệ thua lỗ lên tới 70%, trong khi SSOT tại `docs/requirements.md` quy định tỷ lệ sinh lời kỳ vọng dương (+15.83%).
4. **Mô tả 36 thẻ bài mờ mịt (IMP-56)**:
   - Thẻ bài chỉ có mô tả chung chung, người chơi không nắm được ai chịu ảnh hưởng, số tiền cụ thể, thời hạn và dòng tiền.
   - Một số thẻ có sai sót địa danh hoặc quy tắc (ô 6 Bình Dương, ô 8 Đồng Nai, ô 31 Hưng Yên; ô 27 Kiên Giang Cấp 3; quy tắc trả lãi 400 Tr./vòng GO của `CC_FREE_CREDIT`).

---

## 2. Giải Pháp Triển Khai

### 2.1. Bảo toàn Ô 20 Nghỉ Dưỡng Miễn Phí (SSOT §II Safe Zone)
- Trả Ô 20 về đúng đặc tả gốc `docs/requirements.md §II`: Khu vực an toàn, dừng chân tự do, không phát sinh dòng tiền.
- Chuyển tiếp ngay lập tức sang `TurnPhase.PropertyManagement`, bảo toàn `room.treasury` và số dư người chơi (0 Tr. phát sinh), ngăn chặn tuyệt đối lỗi desync `DeltaPayload` và false-alarm từ `audit_telemetry.ts`.

### 2.2. Bảo tồn Mô hình Rủi ro 2D6 & Tính cách Bot AI (minBuffer 300 Tr.)
- Giữ vững `DEFAULT_MIN_SAFETY_BUFFER = 300;` và `weights.minBuffer = 300;`.
- Đệm an toàn tài chính của Bot vận hành động theo mô hình xác suất xúc xắc 2D6 (`threat.safetyBuffer = Math.max(minBuffer, Math.round(expectedLoss * riskMultiplier))`).
- Bot bảo toàn trọn vẹn bản sắc 3 phong cách (Aggressive, Balanced, Passive), chỉ từ chối mua hoặc nâng cấp khi thực tế phía trước có nguy cơ dẫm ô đối thủ.

### 2.3. Khôi phục tỷ lệ Sàn HOSE theo SSOT
- `HOSE_OUTCOMES`: `{ 1: 0.50, 2: 0.75, 3: 1.00, 4: 1.20, 5: 1.50, 6: 2.00 }` (kỳ vọng toán học dương E = +15.83%).

### 2.4. Bổ sung bảng thông số 4 chiều & Chuẩn hóa 100% Siêu dữ liệu 36 thẻ bài
- Cập nhật metadata `event_card_metadata.ts` với đầy đủ: `targetScope`, `effectDetail`, `duration`, `destination`.
- Chuẩn hóa chính xác số liệu metadata khớp 100% với handler mã nguồn (`MC_FIRE_INSPECTION`, `MC_PUBLIC_INVEST`, `MC_CASINO_PILOT`, `MC_ALCOHOL_CHECK`, `CC_CONTRACT_PENALTY`, `CC_TAX_AUDIT`).
- Render bảng Impact Specs Matrix trên `EventCardModal` với 0 vi phạm UI anti-pattern.

---

## 3. Quy Trình Kiểm Thử 3 Trạm

1. **Trạm 1 (RED Test)**: Viết `tests/contracts/imp57_economy_and_card_clarity.test.ts` kiểm chứng độc lập các ca kiểm thử hành vi.
2. **Trạm 2 (GREEN Code)**: Triển khai code trong `src/`, chạy `npm test` chứng minh không gãy các test cũ.
3. **Trạm 3 (Thẩm Định Độc Lập)**: `spec-reviewer` và `code-reviewer` kiểm tra đĩa vật lý và ký duyệt.
