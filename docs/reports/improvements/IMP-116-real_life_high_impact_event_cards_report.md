# BÁO CÁO NGHIỆM THU KỸ THUẬT IMP-116: TÁI THIẾT KẾ 7 THẺ SỰ KIỆN THỰC TẾ CAO, CHỐT KIỂM TRA Ô HẠ CÁNH & ĐỒNG BỘ HÓA LUẬT SẢNH CHỜ

> **Mã cải tiến**: IMP-116 (Real-Life High-Impact Event Cards, Landing Checkpoint Penalties & Full Lobby Guide SSOT Synchronization)  
> **Căn cứ kế hoạch**: `docs/plans/improvements/IMP-116-real_life_high_impact_event_cards_plan.md`  
> **Trạng thái**: 🟢 **HOÀN THÀNH TOÀN DIỆN (SHIP-READY)**  
> **Ngày nghiệm thu**: 2026-09-17  
> **Quy trình thực thi**: Quy trình 3 Trạm độc lập (🚦 Pre-Flight Banner ➔ Trạm 1 RED ➔ Trạm 2 GREEN ➔ Trạm 3 PHYSICAL DISK VERIFICATION)  

---

## 1. TỔNG QUAN KẾT QUẢ TRIỂN KHAI

Gói cải tiến IMP-116 được thực hiện nhằm giải quyết dứt điểm phản ánh của người dùng về tính thực tế và mức độ tác động của các thẻ sự kiện trong game (nhiều thẻ trước đây mờ nhạt, phi thực tế hoặc gây bẫy thua lỗ như `MC_ALCOHOL_CHECK`, `CC_LAND_CHANGE`, `CC_SLOW_BUILD`...). Đồng thời, gói này thực hiện rà soát và đồng bộ hóa toàn diện bộ hướng dẫn luật chơi tại sảnh chờ (`GameRulesModal.tsx`) và giao diện sổ đỏ (`TitleDeedModal.tsx`) khớp 100% với các nâng cấp quy tắc ván đấu gần đây (trần 40 vòng, lạm phát về đích 1.2x và 1.5x, xả quỹ Kho Bạc 20%, bước giá đấu giá).

### 3 Trụ Cột Kỹ Thuật Đã Triển Khai:

1. **Tái Thiết Kế 7 Thẻ Sự Kiện Sát Thực Tế & Tác Động Kinh Tế Mạnh Mẽ (Anti-NoOp)**:
   - **`MC_ALCOHOL_CHECK` (Chốt Kiểm Tra Nồng Độ Cồn)**:
     - Kéo dài **1 vòng**.
     - Trong thời gian hiệu lực, bất kỳ đối thủ nào dừng chân tại ô Giải trí hoặc Dịch vụ của người chơi khác lập tức bị lập biên bản: **phạt 800 Tr. nộp Kho Bạc** và **tạm giữ phương tiện (mất lượt tiếp theo `skipNextTurn = true`)**.
   - **`MC_NIGHT_ECONOMY` (Kích Cầu Kinh Tế Đêm)**:
     - Kéo dài **2 vòng**, nhân đôi giá thuê (x2) tại các ô Dịch vụ (ô 6 Bình Dương, ô 8 Bắc Ninh).
     - Phát động quỹ kích cầu đêm: **Mỗi người chơi trên bàn cờ đóng góp 400 Tr.** vào quỹ đêm để chia đều cho các chủ sở hữu ô Dịch vụ (nếu chưa ai sở hữu ô Dịch vụ thì nộp toàn bộ vào Kho Bạc).
   - **`CC_LAND_CHANGE` (Quy Hoạch Lại Đất Đai)**:
     - Triệt tiêu bẫy lỗ 800 Tr. cũ.
     - Cho phép **nộp 500 Tr. lệ phí quy hoạch vào Kho Bạc để nâng cấp thẳng 1 ô C0 lên C1 (Nhà Cấp 1) ngay lập tức mà không cần sở hữu trọn bộ màu**.
     - Nếu người rút không sở hữu ô C0 nào: **nhận 600 Tr. hỗ trợ quy hoạch từ Kho Bạc**.
   - **`CC_SLOW_BUILD` (Chế Tài Đất Chậm Tiến Độ)**:
     - Chế tài xử lý đất dự án treo: Phạt **600 Tr. nộp Kho Bạc** và đánh dấu `unbuiltRounds = 1`.
     - **Thu hồi đất ngay lập tức** (`registry.delete(cell)`) nếu người chơi bị âm tiền sau khi phạt nộp Kho Bạc. Nếu không có ô C0, nộp phí hành chính **300 Tr.**.
   - **`MC_COASTAL_STORM` (Bão Biển Đổ Bộ)**:
     - Kéo dài **2 vòng** trên các ô ven biển (Hạ Long, Nha Trang, Vũng Tàu, Phú Quốc). Phí thuê đất trở về 0 (đóng băng).
     - Phạt khắc phục thiên tai: nộp **400 Tr./cấp nhà** vào Kho Bạc để tu sửa.
     - Người chơi dừng chân tại ô ven biển trong bão phải tạm dừng tránh bão (**mất lượt tiếp theo `skipNextTurn = true`**).
   - **`MC_PUBLIC_INVEST` (Kích Cầu Đầu Tư Công)**:
     - Kho Bạc giải ngân gói kích cầu: **Bơm 400 Tr. cho mỗi người chơi** trên bàn cờ.
     - Trợ cấp thêm **1.000 Tr./ô** cho chủ sở hữu các ô hạ tầng giao thông (Cảng, Sân Bay, Bến Xe).
     - Tăng gấp đôi (x2) cước vận tải trong **2 vòng**.
   - **`MC_FREEZE_TRADE` (Thanh Tra Bất Động Sản)**:
     - Đóng băng toàn bộ hoạt động mua bán, chuyển nhượng P2P trong **2 vòng** (thay vì 1 vòng).

2. **Chốt Kiểm Tra Ô Hạ Cánh (Landing Checkpoint Penalties Hook)**:
   - Nâng cấp `handleLanding` trong `src/domain/property_manager.ts` nhận thêm tham số ngữ cảnh `room?: Room`.
   - Kết nối với `executeTurnRoll` trong `src/server/turn_loop.ts` để truyền `room`.
   - Khi người chơi dừng chân ở ô tài sản: tự động kiểm tra `room.activeModifiers`, kích hoạt chế tài tức thì (`skipNextTurn = true`, phạt nồng độ cồn 800 Tr., phạt bão biển).

3. **Đồng Bộ Hóa Toàn Diện Bộ Hướng Dẫn Sảnh Chờ (`GameRulesModal.tsx`) & Sổ Đỏ (`TitleDeedModal.tsx`) Khớp SSOT**:
   - **Tab Core (Quy Tắc Cốt Lõi)**:
     - Cập nhật thời lượng ván đấu chuẩn: **40 vòng** quanh bàn cờ (thay vì 30 vòng cũ).
     - Bổ sung quy tắc lạm phát về đích: Vòng 20–29 tăng **20%** tiền thuê BĐS; Vòng 30 trở đi tăng **50%** tiền thuê BĐS.
     - Cập nhật điều kiện thắng điểm tài sản sau khi hoàn tất 40 vòng.
   - **Tab Cards (Danh Mục Thẻ & Ô Cờ)**:
     - Cập nhật đầy đủ 20 thẻ Cơ Hội và 16 thẻ Thị Trường với đúng mô tả, số tiền và cơ chế thực tế mới.
     - Làm rõ chi tiết về quy hoạch đất đai (nâng C1 không cần bộ màu), chốt nồng độ cồn, kích cầu kinh tế đêm.
   - **Tab Mechanics (Cơ Chế Đặc Biệt)**:
     - Cập nhật bước giá đấu giá: các mức nâng giá **+100, +200, +500 Tr.** VNĐ.
     - Cập nhật cơ chế bình ổn Kho Bạc: khi quỹ vượt **10.000 Tr.**, tự động xả **20%** chia đều cho toàn bộ người chơi.
     - Bổ sung cơ chế đóng băng giao dịch thị trường (`MC_FREEZE_TRADE`).
   - **TitleDeedModal**:
     - Thêm huy hiệu cảnh báo chốt nồng độ cồn (`🚨 Chốt nồng độ cồn: Phạt 800 Tr. & mất lượt`), kích cầu đầu tư công (`🏗️ Đầu tư công: Phí dịch vụ x2`), cập nhật bão biển 2 vòng.

---

## 2. BẰNG CHỨNG KIỂM THỬ VẬT LÝ & QUALITY GATES

### Trạm 1: RED Contract Tests
- **Tệp kiểm thử hợp đồng**: [`tests/contracts/imp116_real_life_high_impact_event_cards.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp116_real_life_high_impact_event_cards.test.ts).
- **Mật độ kiểm thử**: 25 atomic tests bao phủ 4 mặt của ma trận hành vi (Boundary, State Reactivity, Resource Disposal, Error Defense).
- **Chứng minh RED**: Xác nhận 22/25 tests thất bại trước khi viết mã nguồn `src/**`.

### Trạm 2: GREEN Implementation
- Toàn bộ 25/25 tests của `imp116_real_life_high_impact_event_cards.test.ts` đã chuyển xanh (PASS 100%).
- Reconcile toàn bộ các test suites liên quan trong kho mã (`card_handlers_full.test.ts`, `imp72_lobby_redesign.test.ts`, `imp76_round_counter.test.ts`, `advanced_chance_cards.test.ts`, `event_card_engine.test.ts`, `phase4_fsm_auction_upgrades.test.ts`, `ui06_lobby_screen.test.ts`).

### Trạm 3: Physical Disk Verification & Quality Gates
1. **Kiểm thử tự động toàn diện (`npm test`)**:
   - **225/225 test files PASS (100%)**.
   - **4.517/4.517 tests PASS (100%)**.
   - Thời gian thực thi in-memory: 31.23 giây.
2. **Kiểm tra kiểu dữ liệu TypeScript (`npx tsc --noEmit`)**:
   - **0 errors**. Tuân thủ tuyệt đối TypeScript Strict Mode (`noUncheckedIndexedAccess: true`).
3. **Kiểm tra tiêu chuẩn UI Craft (`npm run lint:ui`)**:
   - **0 anti-patterns** qua 146 tệp client (`border-accent-on-rounded`, `bounce-easing`, `gray-on-color`, `gradient-text`).
4. **Học tập miền & Bất biến hệ thống**:
   - Ghi nhận Gotcha #150 vào [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md).

---

## 3. BẢNG TỔNG HỢP CÁC TỆP ĐÃ CHỈNH SỬA

| STT | Đường Dẫn Tệp | Mục Đích Thay Đổi |
| :---: | :--- | :--- |
| 1 | `src/domain/market_card_handlers.ts` | Triển khai logic thực tế cho `MC_ALCOHOL_CHECK`, `MC_NIGHT_ECONOMY`, `MC_COASTAL_STORM`, `MC_PUBLIC_INVEST`, `MC_FREEZE_TRADE`. |
| 2 | `src/domain/chance_card_handlers.ts` | Triển khai logic thực tế cho `CC_LAND_CHANGE` (nâng C1 không cần bộ) và `CC_SLOW_BUILD` (phạt thu hồi đất). |
| 3 | `src/domain/property_manager.ts` | Bổ sung `room?: Room` vào `handleLanding`, bắt sự kiện dừng chân tại ô có chốt cồn hoặc tâm bão. |
| 4 | `src/server/turn_loop.ts` | Truyền tham số `room` vào `handleLanding` trong lượt tung xúc xắc. |
| 5 | `src/domain/event_card_metadata.ts` | Cập nhật metadata chi tiết, mô tả thực tế, thời hạn và số tiền của cả 7 thẻ. |
| 6 | `src/client/ui/modals/title_deed_modal.tsx` | Cập nhật huy hiệu và văn bản cảnh báo cho các thẻ mới trên sổ đỏ. |
| 7 | `src/client/ui/modals/game_rules_modal.tsx` | Đồng bộ 100% 3 Tab (Core 40 vòng + lạm phát, Cards 36 thẻ thực tế, Mechanics quỹ kho bạc + bước giá). |
| 8 | `tests/contracts/imp116_real_life_high_impact_event_cards.test.ts` | 25 bài kiểm thử hợp đồng chuẩn Trạm 1. |
| 9 | `docs/domain/gotchas.md` | Ghi nhận Gotcha #150 về bất biến thẻ sự kiện và đồng bộ hướng dẫn sảnh chờ. |
| 10 | `docs/plans/improvements/IMP-116-real_life_high_impact_event_cards_plan.md` | Kế hoạch cải tiến chi tiết. |
