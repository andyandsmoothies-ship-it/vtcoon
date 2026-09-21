# Kế Hoạch IMP-147: Cân Bằng Hệ Số Cước Độc Quyền (Monopoly Rent Multiplier) & Tính Quyết Đoán Của Trận Đấu

> **Mục tiêu:** Tăng cường sức nặng kinh tế của công trình C3 và cơ chế độc quyền, giúp ván đấu có tính dứt điểm tự nhiên (phá sản), rút ngắn thời lượng từ 40 vòng xuống 25 - 30 vòng chuẩn thực tế.  
> **Giải quyết vấn đề cốt lõi:** Hiện tại hơn 90% số ván 4 người đều có nhà C3 nhưng 92% số ván vẫn kéo dài tới vòng 40 vì cước thuê C3 quá nhẹ so với dòng tiền dồi dào trên bàn cờ.  
> **Căn cứ:** Dữ liệu thực nghiệm 13.000 ván [`comprehensive_13000_games_gameplay_insights_report.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/simulations/comprehensive_13000_games_gameplay_insights_report.md), Luật chuẩn quốc tế Hasbro Monopoly, ADR-0001.

---

## 1. Bản Chất Toán Học & Kinh Tế Cần Giải Quyết

Trong luật cờ tỷ phú chuẩn quốc tế (Hasbro):
- Lương qua GO: $200.
- Khách sạn Boardwalk (Đắt nhất): $2,000 ➔ **Gấp 10 lần lương GO** (1 lần giẫm = phá sản ngay).
- Khách sạn Baltic (Rẻ nhất): $450 ➔ **Gấp 2.25 lần lương GO** (giẫm bẫy là thâm hụt tiền lương).

Trong VTCOON hiện tại:
- Lương qua GO: 2.000 Tr.
- C3 Nâu (Thủ Đức / Cần Giờ): 660 Tr. - 1.320 Tr. ➔ **Nhỏ hơn cả lương GO** (Người chơi giẫm trúng C3 Cần Giờ vẫn dư 680 Tr. bỏ túi từ tiền qua GO!).
- C3 Tím (Nguyễn Huệ / Lê Lợi): 7.700 Tr. - 8.800 Tr. ➔ **Chỉ gấp 3.8 - 4.4 lần lương GO**, trong khi người chơi sở hữu 15.000 - 20.000 Tr. tiền mặt, giẫm trúng 1 lần không đủ gây âm tiền.

---

## 2. Thiết Kế Cơ Chế Hệ Số Cước Độc Quyền (Monopoly Synergy Multiplier)

Thay vì can thiệp cơ học vào luật chơi hay đổi layout bàn cờ, giải pháp chuẩn mực nhất là **Áp dụng Hệ Số Cước Độc Quyền (Monopoly Multiplier)** đúng theo bản chất kinh tế chuỗi giá trị:

```
[HỆ SỐ CƯỚC ĐỘC QUYỀN - MONOPOLY SYNERGY MULTIPLIER]
  │
  ├─ 1. C0 (Đất trống có Độc Quyền):
  │    └─ Hệ số: x2 cước cơ bản (Hiện tại code đã có: base0 * 2).
  │
  ├─ 2. C1 & C2 (Nhà phố 1-2 tầng trên nhóm màu Độc Quyền):
  │    └─ Giữ nguyên cước chuẩn theo deed để không bóp nghẹt người chơi ở đầu ván.
  │
  └─ 3. C3 (Khách Sạn / Tòa Nhà 3 Tầng trên nhóm màu Độc Quyền):
       ├─ Khi kích hoạt độc quyền trọn bộ và xây lên C3: 
       │  Hệ số Độc Quyền Hoàn Thiện (Full Monopoly Synergy) = x1.5 trên cước rent3 gốc.
       │
       └─ Bảng cước thực tế sau khi áp dụng hệ số x1.5:
            • C3 Nâu:    1.320 Tr. x 1.5 =  1.980 Tr. (~ 1 lần lương GO - triệt tiêu lợi nhuận đi vòng).
            • C3 Da Trời: 2.500 Tr. x 1.5 =  3.750 Tr. (gần 2 lần lương GO).
            • C3 Hồng:   3.500 Tr. x 1.5 =  5.250 Tr. (2.6 lần lương GO).
            • C3 Cam:    4.500 Tr. x 1.5 =  6.750 Tr. (3.4 lần lương GO).
            • C3 Đỏ:     5.500 Tr. x 1.5 =  8.250 Tr. (4.1 lần lương GO).
            • C3 Vàng:   6.500 Tr. x 1.5 =  9.750 Tr. (4.9 lần lương GO).
            • C3 Xanh Lá: 7.040 Tr. x 1.5 = 10.560 Tr. (5.3 lần lương GO).
            • C3 Tím:    8.800 Tr. x 1.5 = 13.200 Tr. (6.6 lần lương GO - 1 phát gục ngã tài chính!).
```

---

## 3. Tác Động Dự Kiến Đến Nhịp Độ & Trải Nghiệm Gameplay (Pacing Forecast)

1. **Tính Quyết Đoán & Hồi Hộp:**
   - Khi một người chơi hoặc Bot gom đủ bộ và xây lên C3, khu vực đó lập tức trở thành "vùng phong tỏa tử thần".
   - Mỗi lần gieo xúc xắc đi qua khu vực đó sẽ mang lại cảm giác nghẹt thở thực sự như chơi cờ tỷ phú ngoài đời.
2. **Rút Ngắn Thời Lượng Tự Nhiên:**
   - Tỷ lệ ván đấu kết thúc do phá sản dự kiến tăng từ **7.6% lên 35% - 50%**.
   - Số vòng trung bình giảm từ **37.8 vòng xuống khoảng 24 - 30 vòng** (tương đương 15-20 phút chơi, rất lý tưởng cho game mobile).
   - Người chơi có động lực lớn hơn nhiều để thương lượng đổi đất (IMP-146) nhằm chặn đối thủ hoàn thành bộ C3 hoặc tự mình xây C3 để kết liễu trận đấu.

---

## 4. Danh Sách Tệp Triển Khai Kỹ Thuật (Proposed Changes)

#### [MODIFY] [property_rent.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_rent.ts)
- Trong hàm `resolveRent`:
  - Khi `lvl === 3`: Kiểm tra `hasMonopoly(ownerId, cellIndex, registry, stateMap)`.
  - Nếu có độc quyền: Áp dụng hệ số `rent = Math.floor(deed.rent3 * 1.5)`.
  - Cước này sau đó tiếp tục nhân dồn với hệ số tăng tốc cuối ván (Late-game Rent Surge) ở vòng $\ge 20$ (x1.2 ➔ tương đương 1.8x cước gốc) và vòng $\ge 30$ (x1.5 ➔ tương đương 2.25x cước gốc).

#### [MODIFY] [title_deed_rent_table.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/title_deed_rent_table.tsx)
- Đồng bộ UI bảng giá thuê trong modal Sổ Đỏ:
  - Khi `idx === 3 && hasMonopoly && !isRailroad && !isUtility`:
    - Hiển thị cước tính toán `Math.floor(rent * 1.5)`.
    - Bổ sung huy hiệu: `<span className="text-[9px] font-extrabold text-amber-700">x1.5 ĐỘC QUYỀN</span>`.

#### [NEW] [imp147_monopoly_rent_multiplier.test.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/domain/imp147_monopoly_rent_multiplier.test.ts)
- Bộ kiểm thử hợp đồng Trạm 1 (>= 15 tests) bao phủ Ma trận 4 diện (Boundary, Reactivity, Disposal, Error Defense):
  - C3 có độc quyền: nhận đúng x1.5 trên tất cả các nhóm màu (Nâu, Xanh, Hồng, Cam, Đỏ, Vàng, Xanh Lá, Tím).
  - C3 không có độc quyền hoặc có ô cùng màu bị thế chấp (`isMortgaged: true`): giữ nguyên cước gốc `deed.rent3`.
  - C0, C1, C2 không bị ảnh hưởng sai lệch (C0 x2 khi độc quyền, C1 & C2 cước gốc).
  - Tích hợp nhân dồn chính xác với Rent Surge ở vòng $\ge 20$ (1.8x) và $\ge 30$ (2.25x).
  - Ga tàu và Tiện ích hoàn toàn miễn nhiễm với hệ số x1.5 độc quyền của BĐS.

---

## 5. Kế Hoạch Nghiệm Thu (Verification Plan)
1. **Kiểm thử Trạm 1**: Chạy bộ kiểm thử mới `tests/domain/imp147_monopoly_rent_multiplier.test.ts` đạt 100% PASS.
2. **Kiểm thử hồi quy**: Chạy các test suite liên quan (`threat_forecaster.test.ts`, `micro_rules_monopoly_mortgage.test.ts`, `monopoly_even_building.test.ts`, `imp115_dynamic_pacing_and_bot_polish.test.ts`).
3. **Kiểm tra tiêu chuẩn**: `npm run lint:ui` (0 vi phạm), `npm run lint:slop` (0 lỗi), `npx tsc --noEmit` (0 lỗi).
4. **Mô phỏng nhịp độ (Pacing Simulation)**: Chạy kịch bản mô phỏng 1.000 ván `scripts/comprehensive_gameplay_simulation_1000.ts` để đo lường độ giảm số vòng trung bình và tăng tỷ lệ phá sản.

