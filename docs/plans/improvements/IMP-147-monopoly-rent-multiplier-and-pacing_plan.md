# Kế Hoạch Triển Khai IMP-147: Cân Bằng Hệ Số Cước Độc Quyền (Monopoly Rent Multiplier) & Tính Quyết Đoán Của Trận Đấu

Nâng cấp kinh tế và nhịp độ trận đấu VTCoOn: Áp dụng hệ số cước độc quyền **x1.5 cho công trình cấp 3 (C3)** khi người chơi sở hữu trọn bộ màu và không có ô nào trong nhóm bị thế chấp (`hasMonopoly`), đồng bộ UI bảng cước thẻ Sổ Đỏ, và kế thừa tự nhiên vào hệ thống dự báo rủi ro của Bot AI (`ThreatForecaster`).

## User Review Required

> [!IMPORTANT]
> **Tác động kinh tế của hệ số x1.5 trên C3 khi có Độc Quyền:**
> - C3 Nâu: 1.320 Tr. -> **1.980 Tr.** (~ 1 lần lương GO - triệt tiêu lợi nhuận đi vòng).
> - C3 Tím: 8.800 Tr. -> **13.200 Tr.** (~ 6.6 lần lương GO - cú sốc tài chính mang tính quyết định).
> - Khi bước vào vòng >= 20 và >= 30, cước C3 độc quyền tiếp tục nhân dồn với Late-game Rent Surge (vòng 20: 1.8x cước gốc; vòng 30: 2.25x cước gốc).
> - Dự kiến tăng tỷ lệ kết thúc do phá sản tự nhiên từ 7.6% lên 35% - 50%, rút ngắn thời lượng ván đấu từ 40 vòng xuống 25 - 30 vòng (khoảng 15-20 phút chơi).

> [!NOTE]
> **Kết Quả Kiểm Toán Độc Lập (Plan Grilling) & Phản Biện:**
> 1. Đã chỉ định tạo tệp hợp đồng mới [`tests/domain/imp147_monopoly_rent_multiplier.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/domain/imp147_monopoly_rent_multiplier.test.ts).
> 2. Bổ sung đồng bộ UI hiển thị cước và huy hiệu `x1.5 ĐỘC QUYỀN` tại [`title_deed_rent_table.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/title_deed_rent_table.tsx).
> 3. Giữ nguyên cước gốc trên Sàn Đấu Giá ([`auction_district_card.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/auction_district_card.tsx)) để phản ánh đúng thông số cơ bản của từng ô đất lẻ.
> 4. Loại bỏ sửa đổi thừa trên `threat_forecaster.ts` (Bot AI tự động thừa hưởng cước mới qua `resolveRent`).
> 5. Cập nhật ca test duy nhất bị ảnh hưởng trong [`threat_forecaster.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/domain/threat_forecaster.test.ts#L195-L215).

## Proposed Changes

```text
[resolveRent: property_rent.ts]
      │
      ├─ lvl === 0: hasMonopoly ? base0 * 2 : base0 (Hiện tại)
      ├─ lvl === 1, 2: deed.rent1, deed.rent2 (Giữ nguyên)
      └─ lvl === 3: hasMonopoly ? Math.floor(deed.rent3 * 1.5) : deed.rent3 (MỚI)
            │
            └─ Vòng >= 20: * 1.2 | Vòng >= 30: * 1.5 (Late-game Surge tiếp tục nhân dồn)
```

---

### Domain Finance & Logic

#### [MODIFY] [property_rent.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_rent.ts)
- Tại hàm `resolveRent`:
  - Kiểm tra `hasMonopoly(ownerId, cellIndex, registry, stateMap)` khi `lvl === 3`.
  - Nếu có độc quyền unmortgaged: tính `rent = Math.floor(deed.rent3 * 1.5)`.
  - Nếu không có độc quyền (hoặc có ô cùng nhóm bị thế chấp): giữ nguyên `rent = deed.rent3`.
  - Giữ nguyên cơ chế nhân dồn sau đó đối với `roundCount >= 20` (1.2x) và `roundCount >= 30` (1.5x) cho `CellType.Property`.

---

### Client UI / Sổ Đỏ Modal

#### [MODIFY] [title_deed_rent_table.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/title_deed_rent_table.tsx)
- Cập nhật hiển thị cước tại dòng C3 (`idx === 3`):
  - Khi `idx === 3 && hasMonopoly && !isRailroad && !isUtility`:
    - Tính cước hiển thị: `formatCurrency(Math.floor(rent * 1.5))`.
    - Hiển thị badge xúc giác: `<span className="text-[9px] font-extrabold text-amber-700">x1.5 ĐỘC QUYỀN</span>`.

---

### Contract & Regression Tests

#### [NEW] [imp147_monopoly_rent_multiplier.test.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/domain/imp147_monopoly_rent_multiplier.test.ts)
- Bộ test Trạm 1 với >= 15 atomic tests bao phủ Ma trận 4 diện (Boundary, Reactivity, Disposal, Error Defense):
  1. *Boundary*: Kiểm thử cước C3 x1.5 cho đủ 8 nhóm màu (Nâu, Da Trời, Hồng, Cam, Đỏ, Vàng, Xanh Lá, Tím).
  2. *Reactivity*: Ô C3 khi mất độc quyền (đối thủ sở hữu 1 ô cùng màu) -> cước lập tức trở về 1.0x `deed.rent3`.
  3. *Mortgage Defense*: Nhóm màu có 1 ô bị thế chấp (`isMortgaged: true`) -> C3 mất hệ số x1.5, trở về 1.0x `deed.rent3` (tương tự như C0 mất x2).
  4. *Non-interference*: C0, C1, C2 không bị ảnh hưởng sai lệch.
  5. *Surge Compounding*: C3 độc quyền ở vòng 20 đạt 1.5 * 1.2 = 1.8x; ở vòng 30 đạt 1.5 * 1.5 = 2.25x.
  6. *Infrastructure Immunity*: Ga tàu và Tiện ích hoàn toàn không nhận hệ số x1.5 này.
  7. *Bot Threat Integration*: `calculateThreatHorizon` tự động tính đúng `maxSingleDanger` và `safetyBuffer` cao hơn khi đối thủ sở hữu C3 độc quyền.

#### [MODIFY] [threat_forecaster.test.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/domain/threat_forecaster.test.ts)
- Đối soát ca kiểm thử `nhieu o nguy hiem trong tam quet 2d6` (L195-L215):
  - Do ca test này gán toàn bộ 3 ô nhóm Xanh Da Trời (ô 6, 8, 9) cho cùng 1 đối thủ, ô 9 cấp 3 nay có độc quyền nên cước SSOT mới là 3.000 * 1.5 = 4.500 Tr.
  - Cập nhật giá trị kỳ vọng phù hợp với SSOT mới: `expectedCalc = (4 / 36) * 400 + (6 / 36) * 1000 + (5 / 36) * 4500` và `maxSingleDanger = 4500`.

---

## Verification Plan

### Automated Tests
```bash
# 1. Chạy suite kiểm thử hợp đồng mới IMP-147 (Trạm 1)
npx vitest run tests/domain/imp147_monopoly_rent_multiplier.test.ts

# 2. Chạy toàn bộ các test suite liên quan đến tiền thuê và Bot Threat
npx vitest run tests/domain/threat_forecaster.test.ts tests/domain/micro_rules_monopoly_mortgage.test.ts tests/domain/monopoly_even_building.test.ts tests/domain/imp115_dynamic_pacing_and_bot_polish.test.ts

# 3. Chạy kiểm tra tĩnh và chất lượng UI
npm run lint:ui
npm run lint:slop
npx tsc --noEmit
```
