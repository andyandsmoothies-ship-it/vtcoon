# KẾ HOẠCH CẢI TIẾN IMP-14: NÂNG CẤP CHUYÊN SÂU SÀN ĐẤU GIÁ KỊCH TÍNH - DARK SPOTLIGHT ARENA BOOST (BƯỚC 1 NÂNG CAO)

## 1. BỐI CẢNH & MỤC TIÊU CỐT LÕI
- **Tham chiếu kế hoạch:** `c:\Users\HP\.gemini\antigravity\brain\72ac024d-b1c0-488c-a838-d31e5025c00d\implementation_plan.md` (Bước 1: Sàn Đấu Giá Kịch Tính).
- **Hiện trạng sau IMP-11:**
  1. Đã hoàn thành bộ khung nền tảng: hạ tối 85% môi trường bàn cờ, đèn spotlight vàng ấm rọi bục, thẻ Sổ Đỏ 3D tỷ lệ vàng và mô hình tháp Landmark trung tâm.
  2. Tuy nhiên, tính kịch tính xúc giác (tactile drama) vẫn còn thiếu một số thành tố mấu chốt:
     - Chưa có biểu trưng xúc giác đặc trưng nhất của sàn đấu giá: Chiếc Búa Gõ Đấu Giá Hoàng Gia 3D (Ceremonial Golden Gavel) với hoạt ảnh gõ búa đanh thép và vòng sóng chấn động (shockwave ring) lan tỏa trên bục nâng khi người chơi trả giá.
     - Đồng hồ đếm ngược 15s mới chỉ hiển thị trên DOM 2D; không gian 3D chưa có phản hồi thị giác khẩn cấp (Urgency Feedback) khi thời gian rơi vào 5 giây cuối.
     - Tháp kính Landmark ở trung tâm thẻ bài hiện chỉ có 1 hình dáng duy nhất, chưa phản ánh bản sắc đặc thù theo từng phân khu quy hoạch (Bến cảng hàng hải, Khu tài chính kim cương, Khu thương mại ngọc lục bảo, Di sản văn hóa cổ kính).
     - Props `timeRemaining` và `highestBidderId` trên `Auction3DStage` chưa được khai thác triệt để.

- **Mục tiêu Nâng Cao Bước 1 (IMP-14 Boost):**
  1. **Búa Vàng Đấu Giá 3D & Vòng Chấn Động Bục Nâng (`AuctionGavel3D`):** Bổ sung mô hình Búa Vàng Đấu Giá PBR đặt trên đế gõ bằng đá cẩm thạch đen; tự động thực hiện hoạt ảnh gõ búa dứt khoát 400ms và kích hoạt vòng sáng chấn động tỏa rộng trên mặt bục khi có bước giá mới.
  2. **Hào Quang Đếm Ngược Khẩn Cấp 3D (3D Urgent Countdown Halo & Pulse):** Khi `timeRemaining <= 5`, vòng phát quang chân bục chuyển từ sắc xanh Cyan sang sắc đỏ thẫm/hổ phách rực lửa (`#F43F5E`) với tần số nhịp đập 8Hz, kết hợp nhịp thở vi mô của đèn Spotlight.
  3. **Độ Nảy Đàn Hồi Thẻ Bài (Card Elastic Recoil):** Khi có bước giá mới, thẻ bài Sổ Đỏ nhận xung lực đàn hồi vi mô (Spring Recoil) đồng bộ với tiếng búa gõ và chùm pháo hoa bụi vàng.
  4. **Kiến Trúc Tháp Sapphire Đa Dạng Theo Phân Khu (District-Aware Architecture):** `SapphireLandmarkModel` tùy biến hoa văn đỉnh tháp và màu sắc thủy tinh PBR tương ứng theo nhóm màu BĐS (`colorGroup`).

---

## 2. THIẾT KẾ KIẾN TRÚC & PHÂN RÃ MÔ ĐUN

```text
[Auction State: isAuctionOpen]
           │
           ├─► [Theatrical Lighting: Ambient dim 85% + Spotlight [0, 10, 5]]
           │         └─► [Urgency Check: timeRemaining <= 5]
           │                   └─► Crimson/Amber Heartbeat Pulse (8Hz)
           │
           ├─► [Pedestal Base]
           │         ├─► [Rotating Dark Slate Platform + Gold Bezel]
           │         ├─► [Aura Ring: Calm Cyan (normal) / Urgent Crimson (time <= 5)]
           │         ├─► [Ceremonial 3D Golden Gavel & Acoustic Block]
           │         │         └─► [Bid Increase: Strike Animation + Recoil]
           │         └─► [Shockwave Expansion Ring: Scale 0.5 ➔ 2.6, Alpha 1 ➔ 0]
           │
           └─► [3D Collector Deed Card]
                     ├─► [Parallax Tilt + Spring Recoil on Bid]
                     ├─► [District-Aware Sapphire Landmark Model]
                     │         ├─► Royal Gold (Yellow/Navy)
                     │         ├─► Emerald Skyline (Green)
                     │         ├─► Marina Beacon (Blue/Cyan)
                     │         └─► Heritage Pavilion (Orange/Red)
                     ├─► [Gold Confetti Explosive Blast]
                     └─► [Obsidian HiDPI Texture]
```

### Danh sách tệp can thiệp:
1. `src/client/3d/auction_gavel_3d.tsx` (NEW, <= 250 LOC): Mô hình Búa Vàng Đấu Giá 3D, đệm gõ âm học, logic xoay gõ búa (Strike Recoil) và Vòng sóng chấn động (Expanding Shockwave Ring).
2. `src/client/3d/sapphire_landmark_model.tsx` (MODIFY, <= 220 LOC): Nâng cấp đa dạng hóa phong cách kiến trúc và bảng màu PBR theo `colorGroup`.
3. `src/client/3d/auction_3d_stage.tsx` (MODIFY, <= 450 LOC): Tích hợp Búa Vàng 3D, kích hoạt hiệu ứng đàn hồi thẻ bài (Spring Recoil), vòng hào quang khẩn cấp đổi màu đỏ nhấp nháy khi `timeRemaining <= 5`.
4. `tests/client/auction_3d_stage.test.ts` (MODIFY): Bổ sung test suites kiểm chứng Búa Vàng 3D, Shockwave Ring, Urgent Halo và District-Aware architecture.

---

## 3. TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE)
1. TypeScript strict mode biên dịch 0 lỗi (`cmd /c npx tsc --noEmit`).
2. Toàn bộ 105 test suites hiện có và các bài test mới PASS 100% (Zero Regression).
3. Tuân thủ Categorized File Limits (UI Components <= 500 LOC, Sub-components <= 300 LOC).
4. Zero Dirty Casts (`strict: true`, không `as any`).
5. Lập báo cáo nghiệm thu thực nghiệm `docs/reports/improvements/IMP-14-theatrical-auction-boost-tactile-gavel-and-urgency-aura_report.md` và cập nhật `docs/master_roadmap.md`.
6. Chụp ảnh kiểm chứng thực tế lưu tại `docs/reports/improvements/screenshots/step1_boost_dark_spotlight_arena.jpg`.
