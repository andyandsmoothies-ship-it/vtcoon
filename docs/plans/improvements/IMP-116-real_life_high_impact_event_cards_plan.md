# KẾ HOẠCH CẢI TIẾN: IMP-116 - THỰC TẾ HÓA & TĂNG CƯỜNG TÁC ĐỘNG THỰC CHIẾN 7 THẺ SỰ KIỆN

> **Mã cải tiến:** IMP-116  
> **Hạng mục:** Gameplay Balance, Economy & Event FSM (Hạng mục 1)  
> **Mức độ rủi ro:** Slice-Bound (Can thiệp logic 7 thẻ sự kiện, bảo toàn Quỹ Kho Bạc, bổ sung cơ chế dừng chân tại ô sự kiện)  
> **Quy trình thực thi:** Bắt buộc tuân thủ Quy trình 3 Trạm độc lập (RED Test ➔ GREEN Code ➔ Independent Review).

---

## 1. MỤC TIÊU VÀ BỐI CẢNH

Sau khi người dùng phát hiện thẻ `MC_ALCOHOL_CHECK` (giảm 50% tiền thuê ô dịch vụ) không có ý nghĩa trong thực tế khi đất chưa có nhà (chỉ giảm vài chục triệu, đất chưa có chủ thì giảm 0 đồng), hai bên đã rà soát và xác định 7 thẻ sự kiện thiếu tác động thực tế hoặc xa rời đời sống kinh tế - xã hội Việt Nam:
1. `MC_ALCOHOL_CHECK` (Chiến Dịch Kiểm Tra Nồng Độ Cồn)
2. `MC_NIGHT_ECONOMY` (Kinh Tế Ban Đêm)
3. `CC_LAND_CHANGE` (Chuyển Mục Đích Sử Dụng Đất / Lên Thổ Cư)
4. `CC_SLOW_BUILD` (Xử Lý Dự Án Chậm Tiến Độ / Thu Hồi Đất Treo)
5. `MC_COASTAL_STORM` (Bão Lũ Duyên Hải / Thiên Tai)
6. `MC_PUBLIC_INVEST` (Đại Dự Án Hạ Tầng / Vốn Đầu Tư Công)
7. `MC_FREEZE_TRADE` (Thị Trường Đóng Băng / Siết Tín Dụng BĐS)

Đồng thời, người dùng chỉ rõ yêu cầu kiểm soát **Blast Radius toàn diện**, đặc biệt là mục **Hướng dẫn game trong Sảnh chờ (`GameRulesModal` / `PreMatchDeck`)** và giao diện tra cứu thẻ sổ đỏ (`TitleDeedModal`).

---

## 2. PRE-FLIGHT BLAST RADIUS AUDIT (ĐÁNH GIÁ TÁC ĐỘNG TOÀN DIỆN)

```
[IMP-116 7 Thẻ Sự Kiện]
       │
       ├── Domain Handlers: market_card_handlers.ts, chance_card_handlers.ts
       ├── Engine & Landing: property_manager.ts (handleLanding), turn_loop.ts
       ├── Metadata & i18n: event_card_metadata.ts, vi.ts
       ├── Sảnh Chờ & Hướng Dẫn: game_rules_modal.tsx (Tab cards & mechanics)
       ├── Giao Diện Bàn Cờ: title_deed_modal.tsx (Badges hiển thị tác động)
       └── Test Suites: imp116 contract tests, card_handlers_full, advanced_chance_cards
```

- **Mức độ rủi ro:** Slice-Bound.
- **Direct Touch:**
  - `src/domain/event_card_metadata.ts`
  - `src/domain/market_card_handlers.ts`
  - `src/domain/chance_card_handlers.ts`
  - `src/domain/property_manager.ts`
  - `src/server/turn_loop.ts`
  - `src/domain/i18n/vi.ts`
  - `src/client/ui/modals/game_rules_modal.tsx`
  - `src/client/ui/modals/title_deed_modal.tsx`
- **Downstream Consumers:**
  - `handleLanding` và `turn_loop`: Xử lý phạt 800 Tr. nộp Kho Bạc & tạm giữ xe (`skipNextTurn = true`) khi dẫm ô Dịch vụ thời Nghị Định 100; xử lý mất lượt khi dẫm ô Duyên hải trong bão.
  - Sảnh chờ `PreMatchDeck`: Nút mở `GameRulesModal` hiển thị đúng thể lệ và cơ chế mới cho người chơi trước khi bắt đầu trận.
  - `TitleDeedModal`: Hiển thị huy hiệu cảnh báo trên ô Dịch vụ, Hạ tầng và Ven biển.
- **Worst-Case Defense:**
  - `handleLanding` và các card handlers luôn kiểm tra null-safe với `room` (`if (room) room.treasury = ...`), không gây crash khi chạy trong các unit test cô lập không có `room`.
  - Bảo toàn tuyệt đối Quỹ Kho Bạc (`treasury`): Mọi khoản phạt nộp vào Kho Bạc, mọi khoản giải ngân/trợ cấp trích từ Kho Bạc (giới hạn sàn 0 VNĐ).

---

## 3. THIẾT KẾ CHI TIẾT 7 THẺ SỰ KIỆN MỚI

### 1. `MC_ALCOHOL_CHECK` (Chiến Dịch Kiểm Tra Nồng Độ Cồn - Nghị Định 100)
- **Cũ:** Giảm 50% tiền thuê ô Dịch vụ trong 2 vòng.
- **Mới:**
  - Kéo dài 2 vòng tại `SERVICE_CELLS: [6, 8, 26, 27]`.
  - Tiền thuê tại các ô này vẫn giảm 50% (khách được giảm chi phí ăn chơi).
  - **Tác động thực tế:** Bất kỳ ai dừng chân tại ô Dịch vụ trong đợt cao điểm đều đi qua chốt kiểm tra nồng độ cồn:
    - Bị phạt **800 Tr. VNĐ nộp Kho Bạc Nhà Nước**.
    - Bị tạm giữ phương tiện: Gán `skipNextTurn = true` (mất lượt di chuyển ở vòng tiếp theo).
  - Tác động 100% dù ô đất đã có chủ, chưa có chủ hay là đất của chính mình!

### 2. `MC_NIGHT_ECONOMY` (Kinh Tế Ban Đêm / Phố Đi Bộ 24/7)
- **Cũ:** x2 tiền thuê ô Dịch vụ >= C1 trong đúng 1 vòng (95% trôi qua No-Op).
- **Mới:**
  - Kéo dài **2 vòng** (`remainingRounds: 2`).
  - **Kích cầu tức thì:** Tất cả người chơi chi tiêu **400 Tr. VNĐ** vào quỹ kinh tế đêm. Số tiền này chia đều cho chủ sở hữu các ô Dịch vụ (mỗi ô nhận 100 Tr. * số người chơi). Nếu ô chưa có chủ, tiền nộp vào Kho Bạc Nhà Nước.
  - Trong 2 vòng: Tiền thuê tại ô Dịch vụ >= C1 được nhân đôi (x2).

### 3. `CC_LAND_CHANGE` (Chuyển Mục Đích Sử Dụng Đất / Lên Thổ Cư)
- **Cũ:** Nộp 800 Tr., chỉ được +50% tiền thuê đất trống C0 (+30 Tr./lượt -> bẫy lỗ vốn).
- **Mới:**
  - Người chơi nộp lệ phí chuyển đổi thổ cư **500 Tr. VNĐ vào Kho Bạc**.
  - **Đặc quyền:** Được cấp phép **nâng cấp thẳng 1 ô đất C0 lên Cấp 1 (C1) ngay lập tức mà KHÔNG CẦN gom đủ trọn bộ nhóm màu**!
  - **Fallback:** Nếu người chơi không sở hữu ô C0 nào, nhận gói tài trợ quy hoạch **600 Tr. VNĐ** từ Kho Bạc.

### 4. `CC_SLOW_BUILD` (Xử Lý Dự Án Chậm Tiến Độ / Thu Hồi Dự Án Treo)
- **Cũ:** Gán ngầm `unbuiltRounds: 1`, sau 3 vòng mới tính, không có tác động tức thì.
- **Mới:**
  - Tối hậu thư xử lý dự án treo: Nếu có ô đất C0, người chơi phải **nộp phạt chậm tiến độ 600 Tr. VNĐ vào Kho Bạc**, đồng thời bắt đầu đếm hạn thu hồi (`unbuiltRounds = 1`).
  - Nếu sau khi nộp phạt số dư bị âm (mất khả năng thanh toán): Ô đất bị **thu hồi tức thì** đưa về trạng thái vô chủ.
  - **Fallback:** Nếu không có ô C0 nào, nộp phí hành chính quản lý quy hoạch **300 Tr. VNĐ** vào Kho Bạc.

### 5. `MC_COASTAL_STORM` (Bão Lũ Duyên Hải / Thiên Tai)
- **Cũ:** Miễn 100% tiền thuê ô ven biển trong 1 vòng (người vào bão lại được lợi).
- **Mới:**
  - Bão đổ bộ **2 vòng** vào `COASTAL_CELLS: [11, 14, 16, 18, 19]`.
  - Khi rút thẻ: Công trình C1-C3 ven biển bị hư hại; **chủ sở hữu phải nộp 400 Tr. VNĐ / mỗi cấp nhà để khắc phục thiên tai vào Kho Bạc**.
  - Trong 2 vòng: Tiền thuê ô ven biển = 0 (`multiplier: 0`). Người dừng chân tại dải duyên hải bị bão cô lập, sạt lở giao thông: **gán `skipNextTurn = true` (mất lượt tiếp theo)**.

### 6. `MC_PUBLIC_INVEST` (Đại Dự Án Hạ Tầng / Vốn Đầu Tư Công)
- **Cũ:** Thưởng 1.000 Tr./ô Cảng - Sân bay (đầu trận No-Op nếu chưa ai mua).
- **Mới:**
  - Bơm thanh khoản toàn diện: **Tất cả người chơi nhận ngay 400 Tr. VNĐ từ Kho Bạc**.
  - Chủ sở hữu ô Hạ tầng (5, 15, 25, 35) nhận thêm **1.000 Tr. VNĐ cổ tức logistics / trạm**, và tiền thuê các trạm hạ tầng được **nhân đôi (x2) trong 2 vòng**.

### 7. `MC_FREEZE_TRADE` (Thị Trường Đóng Băng / Siết Chặt Tín Dụng BĐS)
- **Cũ:** Cấm P2P trade trong 1 vòng.
- **Mới:**
  - Thời hạn kéo dài **2 vòng** (`remainingRounds: 2`).
  - Siết toàn bộ thanh khoản: Cấm mua đất mới (`BuyResult.TradeFrozen`), cấm chuyển nhượng P2P và **cấm hoàn toàn hành động Thế Chấp đất mới (`ActionRejectReason.FREEZE_ACTIVE`)**.

---

## 4. BẢNG ĐỐI SOÁT BLAST RADIUS VÀ CÁC ĐIỂM CẦN CẬP NHẬT

| Thành Phần | Tệp Tin | Thay Đổi Cụ Thể |
| :--- | :--- | :--- |
| **Domain Handlers** | `src/domain/market_card_handlers.ts` | Cập nhật 5 thẻ: `MC_ALCOHOL_CHECK`, `MC_NIGHT_ECONOMY`, `MC_COASTAL_STORM`, `MC_PUBLIC_INVEST`, `MC_FREEZE_TRADE` |
| **Domain Handlers** | `src/domain/chance_card_handlers.ts` | Cập nhật 2 thẻ: `CC_LAND_CHANGE`, `CC_SLOW_BUILD` |
| **Landing & FSM** | `src/domain/property_manager.ts` | Bổ sung kiểm tra dừng chân cho `MC_ALCOHOL_CHECK` (phạt 800 Tr. + `skipNextTurn`) và `MC_COASTAL_STORM` (`skipNextTurn`) |
| **Server Turn Loop** | `src/server/turn_loop.ts` | Chuyển tiếp `room` vào `handleLanding` |
| **Metadata SSOT** | `src/domain/event_card_metadata.ts` | Cập nhật `description`, `targetScope`, `effectDetail`, `duration`, `destination`, `effectDelta` cho 7 thẻ |
| **Từ Điển I18n** | `src/domain/i18n/vi.ts` | Chuẩn hóa tiêu đề và văn bản tiếng Việt cho 7 thẻ |
| **Sảnh Chờ Hướng Dẫn** | `src/client/ui/modals/game_rules_modal.tsx` | Cập nhật Tab `cards` (Thẻ Sự Kiện) và Tab `mechanics` (Nghị Định 100, Siết tín dụng BĐS, Bão duyên hải, Lên thổ cư) |
| **Chi Tiết BĐS** | `src/client/ui/modals/title_deed_modal.tsx` | Bổ sung huy hiệu cho `MC_ALCOHOL_CHECK`, `MC_PUBLIC_INVEST`, cập nhật `MC_COASTAL_STORM` |
| **Contract Tests** | `tests/contracts/imp116_real_life_high_impact_event_cards.test.ts` | Tạo mới >= 20 atomic tests cho 7 thẻ theo ma trận 4 mặt hành vi |
| **Reconciliation Tests** | `tests/domain/advanced_chance_cards.test.ts`, `tests/domain/card_handlers_full.test.ts`, `tests/domain/event_card_engine.test.ts` | Đồng bộ hóa các assertion cũ sang SSOT mới |

---

## 5. KẾ HOẠCH THỰC THI 3 TRẠM

1. **Trạm 1 (RED Contract Test):** Viết bộ kiểm thử `tests/contracts/imp116_real_life_high_impact_event_cards.test.ts` với các ca kiểm thử boundary, treasury conservation, state reactivity và chứng minh test RED trên mã nguồn hiện tại.
2. **Trạm 2 (GREEN Implementation):** Triển khai code tối thiểu trong `src/**` đáp ứng toàn bộ test, đảm bảo `npx tsc --noEmit` 0 lỗi, `npm run lint:ui` 0 lỗi, toàn bộ test suite PASS 100%.
3. **Trạm 3 (Independent Review & Disk Verification):** Kiểm tra đối soát vật lý trên đĩa, xác nhận 0 vi phạm NFR, cập nhật `docs/master_roadmap.md` và `docs/domain/gotchas.md` (Gotcha #148).
