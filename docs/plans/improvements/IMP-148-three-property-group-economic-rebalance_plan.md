# Kế Hoạch IMP-148 (Đã Kiểm Toán Grilling): Tinh Chỉnh Cân Bằng Kinh Tế Nhóm 3 Lô Đất Xanh Lá & Vàng (Three-Property Color Group Economic Rebalance)

> **Mục tiêu:** Khôi phục vị thế kinh tế và sức hút chiến lược của nhóm màu 3 lô đất (đặc biệt là Xanh Lá) theo đúng chuẩn mực kinh tế Monopoly quốc tế, biến nhóm 3 ô thành mục tiêu cạnh tranh và thương lượng hấp dẫn nhất bàn cờ.  
> **Giải quyết vấn đề cốt lõi:** Nhóm Xanh Lá trước đây có chi phí xây dựng đắt nhất bàn cờ (20.700 Tr. cho 3 ô) khiến người chơi và Bot không thể kham nổi vốn, trong khi cước đơn lẻ thấp hơn Tím. Cần hạ chi phí xây dựng về mức khả thi và nâng cước C3 tiệm cận Tím.  
> **Căn cứ:** Dữ liệu thực nghiệm 13.000 ván, Luật chuẩn Hasbro Monopoly, ADR-0001, Báo cáo Plan Grilling ngày 21/09/2026.

---

## 1. Bản Chất Cân Bằng Kinh Tế (Economic Reality & Balance)

Trong Monopoly chuẩn quốc tế (Hasbro):
- Nhóm Green (3 ô) và Dark Blue (2 ô) có cùng chi phí xây dựng ($200/nhà).
- Green đòi hỏi tổng vốn lớn hơn vì có 3 ô ($3,000 vs $2,000 tiền xây).
- Đổi lại, **Tổng cước cả bộ Green khi có khách sạn ($4,050) cao hơn hẳn Dark Blue ($3,500)**, và bẫy giẫm phải rộng gấp rưỡi (3 ô bẫy liên tiếp).

Tại VTCoOn hiện tại:
- Chi phí xây dựng Xanh Lá trước đây: `[1500, 2250, 3000]` Tr./ô cho ô 31, 32 và `[1600, 2400, 3200]` Tr. cho ô 34 ➔ Tổng tiền xây 3 ô lên tới **20.700 Tr.** (vượt xa ngân sách tiền mặt thực tế).
- Trong khi đó, cước C3 gốc của Xanh Lá chỉ đạt **6.600 - 7.040 Tr.**
- Kết hợp với hệ số x1.5 của IMP-147, chúng ta cần cân chỉnh để:
  * Chi phí xây cả bộ Xanh Lá giảm về mức hợp lý (**16.650 Tr.** tương đương chi phí xây 2 ô Tím 16.875 Tr.).
  * Cước đơn lẻ C3 của Xanh Lá (10.800 - 11.700 Tr. khi có độc quyền) tiệm cận nhưng không vượt qua ô đắt nhất bàn cờ là Lê Lợi (13.200 Tr.), bảo đảm đường cong sát thương hài hòa.

---

## 2. Thiết Kế Tinh Chỉnh Tham Số (Parameter Calibration)

Tuân thủ nghiêm ngặt nguyên tắc **không thay đổi layout bàn cờ, không tạo cơ chế lai tạp**, chỉ tinh chỉnh chuẩn xác các chỉ số trong [`src/domain/property_data.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_data.ts):

### 2.1. Nhóm Xanh Lá (Hưng Yên - Ô 31, Hà Nội Cầu Giấy - Ô 32, Hà Nội Hoàn Kiếm - Ô 34)
- **Chi phí xây nhà (Upgrade Costs):**
  - Ô 31, 32: Điều chỉnh từ `[1500, 2250, 3000]` Tr. ➔ `[1200, 1800, 2400]` Tr. (Tổng xây: 5.400 Tr./ô).
  - Ô 34: Điều chỉnh từ `[1600, 2400, 3200]` Tr. ➔ `[1300, 1950, 2600]` Tr. (Tổng xây: 5.850 Tr./ô).
  - *Tổng tiền xây cả bộ 3 ô giảm từ 20.700 Tr. xuống 16.650 Tr.* (Tương đương chi phí xây 2 ô Tím 16.875 Tr., nằm hoàn toàn trong ngân sách khả thi của Bot và người chơi).
- **Cước thuê C3 (Rent C3):**
  - Ô 31, 32: Tinh chỉnh từ `6.600 Tr.` ➔ `7.200 Tr.` (Khi có độc quyền x1.5: **10.800 Tr.**)
  - Ô 34: Tinh chỉnh từ `7.040 Tr.` ➔ `7.800 Tr.` (Khi có độc quyền x1.5: **11.700 Tr.**)
  - *Tổng cước cả bộ 3 ô khi hoàn thiện độc quyền đạt 33.300 Tr.* (Vượt trội về tổng doanh thu so với bộ Tím 24.750 Tr., nhưng từng ô không vượt qua đỉnh Lê Lợi 13.200 Tr.).

### 2.2. Nhóm Vàng (Hải Phòng - Ô 26, Kiên Giang Phú Quốc - Ô 27, Quảng Ninh Hạ Long - Ô 29)
- Giữ nguyên chi phí xây dựng.
- Tinh chỉnh cước C3 của ô 29 (Quảng Ninh) từ `7.000 Tr.` ➔ `7.200 Tr.` (Khi có độc quyền x1.5: **10.800 Tr.**) để tạo bước đệm doanh thu liền mạch giữa Nhóm Vàng và Nhóm Xanh Lá.

### 2.3. Tự Động Kế Thừa Trí Tuệ Nhân Tạo Bot AI
- Bot AI hiện đã có sẵn hàm `findAllMonopolyGaps` nhận diện chính xác thế nắm 2/3 ô (`botOwned === totalCount - 1`) và `valuation_engine.ts` đã nhân hệ số `TWO_OF_THREE: 1.6`.
- Kết hợp với **IMP-146 (Đổi Đất 2 Chiều)** và chi phí xây nhà giảm 20%, Bot AI sẽ tự động ưu tiên gom ô thứ 3 và đủ khả năng tài chính để nâng cấp C1-C3 mà không cần viết thêm code bot thừa.

---

## 3. Danh Sách Tệp Triển Khai (Proposed Changes)

#### [MODIFY] [property_data.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_data.ts)
- Cập nhật thông số `upgradeCosts` và `rent3` của ô 29, 31, 32, 34 trong bảng hằng số `PROPERTY_DEEDS`:
  ```typescript
  // Ô 29 (Quảng Ninh - Vàng)
  [29, { price: 2800, rent0: 280, rent1:  840, rent2: 2240, rent3: 7200, upgradeCosts: [1260, 1960, 3360] }],
  // Ô 31, 32 (Hưng Yên, Cầu Giấy - Xanh Lá)
  [31, { price: 3000, rent0: 300, rent1: 1050, rent2: 2700, rent3: 7200, upgradeCosts: [1200, 1800, 2400] }],
  [32, { price: 3000, rent0: 300, rent1: 1050, rent2: 2700, rent3: 7200, upgradeCosts: [1200, 1800, 2400] }],
  // Ô 34 (Hoàn Kiếm - Xanh Lá)
  [34, { price: 3200, rent0: 320, rent1: 1120, rent2: 2880, rent3: 7800, upgradeCosts: [1300, 1950, 2600] }],
  ```

#### [NEW] [imp148_three_property_economic_rebalance.test.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/domain/imp148_three_property_economic_rebalance.test.ts)
- Bộ test hợp đồng độc lập Trạm 1 (>= 15 atomic tests) kiểm chứng:
  * Chi phí nâng cấp mới của ô 31, 32, 34.
  * Cước C3 cơ bản và cước độc quyền x1.5 mới của ô 29, 31, 32, 34.
  * Tính đơn điệu tăng dần của các cấp cước: `rent0 < rent1 < rent2 < rent3`.
  * Khả năng chi trả và tiến trình nâng cấp của Bot trên nhóm Xanh Lá.

#### [MODIFY] [imp147_monopoly_rent_multiplier.test.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/domain/imp147_monopoly_rent_multiplier.test.ts)
- Cập nhật test case `[TC-147.08/MSS]` tại L135-L149:
  - Cước ô 31 C3 độc quyền mới là `7.200 * 1.5 = 10.800 Tr.` (thay cho giá trị cũ 9.900 Tr.).

---

## 4. Kế Hoạch Nghiệm Thu (Verification Plan)

### Kiểm thử tự động (Automated Tests)
```bash
# 1. Chạy suite kiểm thử hợp đồng mới IMP-148 (Trạm 1)
npx vitest run tests/domain/imp148_three_property_economic_rebalance.test.ts

# 2. Chạy hồi quy các test suite liên quan đến tiền thuê và dữ liệu BĐS
npx vitest run tests/domain/imp147_monopoly_rent_multiplier.test.ts tests/domain/property_manager_data.test.ts tests/domain/monopoly_even_building.test.ts

# 3. Kiểm tra chất lượng code và tĩnh học
npm run lint:ui
npm run lint:slop
npx tsc --noEmit
```
