# BÁO CÁO NGHIỆM THU KỸ THUẬT IMP-115: THANG TĂNG GIÁ THUÊ 2 NẤC, NÂNG TRẦN 40 VÒNG, ĐẨY SỚM P2P 4P & NÂNG CẤP BOT THẬN TRỌNG

> **Mã cải tiến**: IMP-115 (Dynamic Pacing, Two-Stage Late-Game Rent Surge, Hard Cap 40 Rounds, Early 4P P2P Trading & Prudent Bot Polish)  
> **Căn cứ kế hoạch**: `docs/plans/improvements/IMP-115-dynamic-pacing-late-game-inflation-and-bot-polish_plan.md`  
> **Trạng thái**: 🟢 **HOÀN THÀNH TOÀN DIỆN (SHIP-READY)**  
> **Ngày nghiệm thu**: 2026-09-17  
> **Quy trình thực thi**: Quy trình 3 Trạm độc lập (🚦 Pre-Flight Banner ➔ Trạm 1 RED ➔ Trạm 2 GREEN ➔ Trạm 3 SPEC APPROVED)  

---

## 1. TỔNG QUAN KẾT QUẢ TRIỂN KHAI

Gói cải tiến IMP-115 được kích hoạt nhằm giải quyết triệt để vấn đề 99.7% ván đấu chạm trần thời gian mà không có người chơi bị loại tự nhiên, đồng thời khắc phục điểm yếu chí mạng khiến Bot Thận Trọng (Passive Bot) bị tụt hậu thanh khoản và thua 100% ở bàn 2 người.

### 4 Mũi Nhọn Kỹ Thuật Đã Triển Khai:
1. **Thang Tăng Giá Thuê 2 Nấc (Late-Game Rent Surge)**:
   - **Vòng 1 đến 19**: Giữ nguyên 100% giá thuê theo quy định Sổ Đỏ.
   - **Vòng 20 đến 29**: Nhân hệ số **1.20** (+20%) cho duy nhất các ô bất động sản (`CellType.Property`), làm tròn nguyên qua `Math.floor(rent * 1.2)`.
   - **Vòng 30 trở đi**: Nhân hệ số **1.50** (+50%) cho các ô bất động sản (`Math.floor(rent * 1.5)`).
   - **Miễn trừ hạ tầng**: Ô Đường Sắt (`Railroad`) và Tiện Ích (`Utility`) hoàn toàn miễn trừ thang tăng giá, bảo toàn công thức ETC và biến thiên xúc xắc 2D6.
   - **Đồng bộ Domain & Server**: Tích hợp đồng bộ trong `resolveRent` (`property_rent.ts`), `handleLanding` (`property_manager.ts`) và `executeTurnRoll` (`turn_loop.ts`).
2. **Nâng Trần Ván Đấu Lên 40 Vòng (Hard Cap 40 Rounds)**:
   - Cập nhật `export const MAX_ROUNDS = 40;` trong `src/domain/room.ts`.
   - `isRoomGameOver(room)`: Giữ trạng thái thi đấu ở vòng 40 (`false`) và chỉ kích hoạt kết thúc do chạm trần khi `roundCount > 40` (vòng 41).
3. **Mở Khóa Đàm Phán Bot P2P Bàn 4 Người Từ Vòng 4**:
   - Trong `calculateTradeOfferPrice` (`bot_trade.ts`): Bàn chơi có từ 4 người chơi (`playerCount >= 4`) kích hoạt mức giá chào mua Monopoly Gap mạnh mẽ ngay từ Vòng 4 (thay vì phải đợi đến Vòng 6).
   - Bảo tồn giao dịch tiền mặt đơn giản, không làm phát sinh hoán đổi đất 2 chiều phức tạp.
4. **Nâng Cấp Năng Lực Cạnh Tranh Cho Bot Thận Trọng (Prudent Bot Rework)**:
   - Nâng `DEFAULT_PERSONALITY_WEIGHTS[BotPersonality.Passive].minBuffer` lên **600 Tr. VNĐ** (trong `bot_types.ts`).
   - Trong `isPassiveAuctionAllowed` (`bot_auction.ts`): Nâng trần tham gia và nâng giá đấu giá lên **1.15x** giá niêm yết (thay vì bị khóa cứng ở 0.70x), ngăn chặn đối thủ thâu tóm tài sản giá rẻ.

---

## 2. BẰNG CHỨNG THỰC NGHIỆM SIMULATION BENCHMARK (TRƯỚC VS SAU)

Thử nghiệm Headless Simulation Benchmark trên **1.300 ván đấu** (13 kịch bản x 100 ván, 0ms delay, PRNG Mulberry32) hoàn tất trong **3.58 giây**:

### So Sánh 1: Tỷ Lệ Thắng Của Bot Thận Trọng (Passive Bot)
| Kịch Bản | Trước Cải Tiến (IMP-114) | Sau Cải Tiến (IMP-115) | Tăng Trưởng |
| :--- | :---: | :---: | :---: |
| 2P (Human + Passive) | **0%** | **23%** | **Nhảy vọt +23% (khắc phục điểm liệt)** |
| 3P (Human + 2 Passive) | 0% | **35%** | **Nhảy vọt +35%** |
| 3P (Human + Passive + Balanced) | 4% | **11%** | **Tăng gần gấp 3 lần** |
| 3P (Human + Passive + Aggressive) | 3% | **13%** | **Tăng hơn 4 lần** |
| 4P (Human + Pass + Bal + Aggr) | 2% | **6%** | **Tăng gấp 3 lần** |
| 4P (Human + 3 Passive) | 0% | **27%** | **Nhảy vọt +27%** |

### So Sánh 2: Nhịp Độ Trận Đấu & Tỷ Lệ Đào Thải Tự Nhiên
| Chỉ Số Đo Lường | Trước Cải Tiến (Trần 30 vòng) | Sau Cải Tiến (Trần 40 vòng + Surge) | Nhận Định |
| :--- | :---: | :---: | :--- |
| **Phá sản tự nhiên (Knockout %)** | 0% (ở 12/13 kịch bản) | **2% - 5%** ở hầu hết các kịch bản | Áp lực tiền thuê 1.5x đã tạo ra các đợt hạ gục tự nhiên |
| **Số vụ nợ nần (Insolvencies/Ván)** | 0.8 - 1.9 vụ/ván | **2.4 - 5.0 vụ/ván** | Tăng độ căng thẳng tài chính về cuối ván |
| **Tỷ lệ tự cứu nợ thành công** | 94% - 100% | **49% - 75%** | Không còn tiền mặt dư thừa giải cứu dễ dãi |
| **Tỷ lệ hình thành độc quyền bàn 2P** | 79% - 86% | **87% - 96%** | Độc quyền hình thành chắc chắn |
| **Số công trình C1..C3 hoàn thiện bàn 2P** | 6.0 - 8.5 công trình | **9.0 - 12.1 công trình/ván** | Tăng +40% quy mô đô thị |
| **Tỷ lệ thầu thắng đấu giá của Bot** | 0% (Passive) | **76% - 99.9%** | Sàn đấu giá kịch tính, đất không bị bỏ hoang |
| **Rò rỉ Kho Bạc & Deadlock** | 0 / 0 | **0 / 0** | Bảo toàn tuyệt đối định luật bảo toàn tài chính |

---

## 3. BẰNG CHỨNG KIỂM THỬ VẬT LÝ & QUALITY GATES

### Trạm 1 (RED Contract Test):
- Tệp test hợp đồng: [`tests/domain/imp115_dynamic_pacing_and_bot_polish.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/domain/imp115_dynamic_pacing_and_bot_polish.test.ts).
- Tệp test điều hòa: [`tests/server/round_cap_game_over.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/server/round_cap_game_over.test.ts).
- Kết quả Trạm 1: Xác nhận 29 failed | 23 passed (Business RED trên 4 chốt kỹ thuật) trước khi viết mã nguồn `src/**`.

### Trạm 2 (GREEN Implementation):
- Kết quả Trạm 2: 100% tests chuyển xanh (42/42 tests trong suite IMP-115 PASS).
- Toàn bộ repo: **222/222 test suites PASS, 4.426/4.426 tests PASS (100%)**.
- TypeScript Check: `npx tsc --noEmit` ➔ **0 lỗi**.
- UI Linter: `npm run lint:ui` ➔ **0 violations across 146 files**.
- Slop Linter: `npm run lint:slop` ➔ **0 hard violations across 215 files**.
- Docker Sync: `npm run build` hoàn tất, đồng bộ container `vtcoon-vtcoon-1`, `curl -I http://127.0.0.1:3000/` trả về **HTTP/1.1 200 OK**.

### Trạm 3 (Independent Spec Reviewer):
- Phán quyết: **APPROVED (CHẤP THUẬN TOÀN DIỆN)** từ `spec-reviewer`.
- Xác nhận Zero Scope Drift: Vốn 25.000 Tr. VNĐ bàn 2P được giữ nguyên 100%; không làm phát sinh cơ chế đổi đất 2 chiều; các ô hạ tầng miễn trừ tăng giá hoàn toàn; toàn bộ module Domain tuân thủ LOC <= 400.

---

## 4. BẤT BIẾN TRI THỨC BỔ SUNG VÀO GOTCHAS.MD

Nội dung **Gotcha #147** đã được cập nhật vào [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md#L2127-L2152):
- **Two-Tier Late-Game Rent Surge Invariant**: Vòng 20..29 nhân 1.2x, Vòng 30+ nhân 1.5x chỉ cho `CellType.Property`. Miễn trừ tuyệt đối cho Railroad và Utility.
- **Max Rounds Hard Cap 40 Invariant**: `MAX_ROUNDS = 40`. Ván đấu chỉ kết thúc khi `roundCount > 40` (vòng 41) hoặc còn <= 1 người chơi sống sót.
- **Early 4P P2P Monopoly Negotiation Invariant**: Bàn chơi có >= 4 người hạ ngưỡng kích hoạt mức giá chào mua cao xuống Vòng 4 thay vì Vòng 6.
- **Prudent Passive Bot Hardening Invariant**: Nâng `minBuffer` lên 600 Tr. VNĐ và trần đấu giá lên 1.15x giá gốc.
