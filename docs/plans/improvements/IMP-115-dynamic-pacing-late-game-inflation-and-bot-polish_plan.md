# KẾ HOẠCH CẢI TIẾN IMP-115: THANG TĂNG GIÁ THUÊ 2 NẤC, NÂNG TRẦN 40 VÒNG, ĐẨY SỚM P2P 4P & NÂNG CẤP BOT THẬN TRỌNG

> **Mã cải tiến**: IMP-115 (Dynamic Pacing, Two-Stage Late-Game Rent Inflation, 40-Round Cap, Early 4P P2P & Prudent Bot Rework)  
> **Căn cứ quyết định**: Người dùng phê duyệt triển khai gói cải tiến tổng thể sau phân tích 3.900 ván đấu benchmark  
> **Mục tiêu**: Giải quyết triệt để vấn đề 99% ván đấu chạm trần, tạo nhịp độ knock-out tự nhiên ở cuối trận, tăng tính cạnh tranh cho Bot Thận Trọng và thúc đẩy hình thành độc quyền bàn 4 người.

---

## 1. PHÂN TÍCH BLAST RADIUS & NGUY CƠ TÁC ĐỘNG (PRE-FLIGHT BLAST RADIUS AUDIT)

- **Mức độ rủi ro**: Slice-Bound (Ảnh hưởng đến logic tính tiền thuê `property_rent.ts`, trần vòng đấu `room.ts`, điều kiện đàm phán Bot `bot_trade.ts` và tham số đấu giá Bot `bot_auction.ts`, `bot_types.ts`).
- **Tác động trực tiếp**:
  1. `src/domain/room.ts`: `MAX_ROUNDS` nâng từ 30 lên 40.
  2. `src/domain/property_rent.ts`: Bổ sung tham số `roundCount?: number` vào `resolveRent`. Nếu `roundCount >= 20`, tiền thuê tăng 20% (`floor(rent * 1.2)`). Nếu `roundCount >= 30`, tiền thuê tăng 50% (`floor(rent * 1.5)`).
  3. `src/domain/property_manager.ts`: Truyền `roundCount` vào `resolveRent`.
  4. `src/server/turn_loop.ts`: Truyền `room.roundCount` vào `handleLanding`.
  5. `src/domain/bot/bot_trade.ts`: Khi bàn chơi có từ 4 người (`playerCount >= 4`), mở khóa hệ số giá Monopoly Gap từ Vòng 4 (thay vì Vòng 6).
  6. `src/domain/bot/bot_types.ts`: Giảm `minBuffer` của Bot Passive từ 1.000 Tr. xuống 600 Tr. VNĐ.
  7. `src/domain/bot/bot_auction.ts`: Nâng trần tham gia đấu giá của Bot Passive trong `isPassiveAuctionAllowed` lên 1.15x giá niêm yết (thay vì chỉ 0.70x).
- **Đối tượng tiêu thụ hạ tầng**:
  - `turn_loop.ts`, `bot_engine.ts`, `threat_forecaster.ts`, `round_cap_game_over.test.ts`.
- **Phương án phòng thủ xấu nhất**:
  - Bảo toàn 100% các bài test cũ về `isRoomGameOver` bằng cách điều hòa contract test sang ngưỡng `MAX_ROUNDS = 40`.
  - Tiền thuê tăng theo hệ số làm tròn nguyên (`Math.floor`) tránh số thập phân / rò rỉ tiền tệ.

---

## 2. MA TRẬN YÊU CẦU KỸ THUẬT CHI TIẾT (TECHNICAL SPECIFICATION)

### Chốt 1: Thang Tăng Giá Thuê 2 Nấc (Late-Game Inflation)
- **Vòng 1 đến 19**: Giữ 100% giá thuê gốc theo quy định Sổ Đỏ.
- **Vòng 20 đến 29**: Nhân hệ số **1.20** cho mọi ô tài sản (`CellType.Property`): `Math.floor(baseRent * 1.2)`.
- **Vòng 30 trở đi**: Nhân hệ số **1.50** cho mọi ô tài sản: `Math.floor(baseRent * 1.5)`.
- Áp dụng đồng bộ cho cả FSM trừ tiền thật (`handleLanding`) và dự báo rủi ro của Bot (`resolveRent`).

### Chốt 2: Nâng Trần Ván Đấu Lên 40 Vòng
- Trong `src/domain/room.ts`: `export const MAX_ROUNDS = 40`.
- `isRoomGameOver`: Trả về `false` khi `roundCount = 40`; trả về `true` khi `roundCount > 40` (vòng 41).

### Chốt 3: Mở Khóa Đàm Phán Bot P2P Bàn 4 Người Từ Vòng 4
- Trong `src/domain/bot/bot_trade.ts`:
  * Xác định `roundThreshold = (room.players.length >= 4) ? 4 : 6`.
  * Nếu `currentRound >= roundThreshold`, áp dụng các hệ số chào mua Monopoly Gap mạnh mẽ (1.75x Aggressive, 1.55x Balanced, 1.35x Passive).
  * Giữ nguyên cơ chế P2P mua bán bằng tiền mặt, không bổ sung hoán đổi đất 2 chiều.

### Chốt 4: Nâng Cấp Năng Lực Bot Thận Trọng (Passive / Prudent Bot)
- Giảm `DEFAULT_PERSONALITY_WEIGHTS[BotPersonality.Passive].minBuffer` từ 1.000 Tr. xuống 600 Tr. VNĐ.
- Trong `isPassiveAuctionAllowed`:
  * Cho phép tham gia đấu giá khi `nextBid <= basePrice * 1.15` (thay vì bị khóa cứng ở 0.70x).
  * Cho phép tiếp tục nâng giá nếu giá thầu chưa vượt quá 1.15x giá gốc.

---

## 3. LỘ TRÌNH THỰC THI 3 TRẠM (3-STATION PIPELINE)

1. **Trạm 1 (RED Contract Test - `qa-tester`)**:
   - Viết tệp test mới `tests/domain/imp115_dynamic_pacing_and_bot_polish.test.ts` (>= 25 atomic tests).
   - Kiểm tra 4 Chốt kỹ thuật, chứng minh Business RED.
   - Điều hòa các test cũ bị ảnh hưởng bởi `MAX_ROUNDS = 40` (ví dụ `round_cap_game_over.test.ts`).
2. **Trạm 2 (GREEN Implementation - `implementer`)**:
   - Cập nhật mã nguồn tối thiểu trong `src/domain/` và `src/server/` để pass 100% tests.
   - Kiểm tra toàn bộ 221+ test suites của dự án, `tsc --noEmit`, `lint:ui`, `lint:slop`.
   - Build và đồng bộ Docker container.
3. **Trạm 3 (Thẩm Định Độc Lập - `spec-reviewer`)**:
   - Kiểm tra đĩa vật lý, xác nhận Zero Scope Drift, kiểm tra giới hạn LOC <= 400.
   - Chạy lại benchmark để đối chiếu cải thiện thực tế.
