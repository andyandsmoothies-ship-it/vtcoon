# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE (LEAN PLAN SPECIFICATION)
# TICKET: IMP-277B — Đồng Bộ Nhãn Giá 2.000 Trên Mặt Sa Bàn 3D Cho Ô 12 (EVN) & Ô 28 (Viettel)

> **Mã Nhiệm Vụ:** IMP-277B (Micro-Slice Đồng Bộ 3D Texture Metadata Tiện Ích)  
> **Phân hệ mục tiêu:** `client-3d`  
> **Phân loại rủi ro:** Tier 2 Micro-Slice (Lean Plan Specification, <= 180 lines, Delta <= 5 LOC, 1 file in `src/**`)  
> **Chỉ tiêu kiểm thử:** Scaled Floor >= 6 atomic tests, Pure Logic Waiver = `false`

---

## 0. KHẢO SÁT BỀ MẶT MÃ NGUỒN & ĐIỂM BẮT ĐẦU (SURFACE INVENTORY & LOC BASELINE)

### 0.1 Danh Sách Tệp Mục Tiêu & Dòng Mã Thực Tế Trên Đĩa
* **Target physical file**: `src/client/3d/tile_texture_data.ts` (80 lines, Tier 2 limit: 500 lines) — **Safe**.
* **Target physical file**: `tests/contracts/imp277b_3d_tile_texture_parity.test.ts` (New file to be created in Station 1/2) — **Safe**.

### 0.2 Bảng Thống Kê Delta LOC Dự Kiến
| File | Current LOC | Expected LOC | Delta LOC | Status |
| :--- | :---: | :---: | :---: | :---: |
| `src/client/3d/tile_texture_data.ts` | 80 | 80 | 0 (Modify 2 lines) | Safe |
| `tests/contracts/imp277b_3d_tile_texture_parity.test.ts` | 0 | ~90 | +90 lines | Safe |
| **Tổng Delta Production (`src/**`)** | — | — | **0 net LOC** (<= 50 LOC) | **Pass Micro-Slice** |

### 0.3 Phân Định Phạm Vi & Ranh Giới Phân Hệ (Scope Conservation Mandate)
1. [`src/client/3d/tile_texture_data.ts#L42,L60`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/tile_texture_data.ts#L42-L60) — **MODIFY (Target 1)**: Nâng `price: 1500` lên `price: 2000` cho ô 12 (EVN) và ô 28 (Viettel). Đồng bộ 100% với SSOT domain `property_data.ts` đã hoàn thành tại IMP-277A.
2. **Bảo toàn môi trường làm việc**:
   - `src/domain/property_data.ts`
   - `tests/contracts/imp277a_utility_price_2000.test.ts`
   - `tests/domain/valuation_engine.test.ts`
   - `tests/contracts/imp227_auction_solo_deadlock_and_label_semantics.test.ts`
   - `tests/client/imp202_trade_modal_ergonomics_overhaul.test.ts`
   - `src/client/ui/market_event_ticker.tsx`
   - `src/client/ui/top_bar.tsx`
   - `tests/contracts/imp237_mobile_viewport_harmonics.test.ts`
   - `tests/contracts/imp267_active_market_event_carousel.test.ts`
   - `tests/client/pure_ivory_price_text_and_zero_black_pill.test.ts`
   - `tests/client/zero_2d_price_decal_on_purchasable_tiles.test.ts`

---

## 1. BẢN THIẾT KẾ KIẾN TRÚC & BẤT BIẾN NGHIỆP VỤ (ARCHITECTURAL INVARIANTS)

### 1.1 Cơ Chế Nghiệp Vụ Đồng Bộ Nhãn Sa Bàn 3D
* **Mục tiêu**: Triệt tiêu hoàn toàn sự lệch pha (desync) giữa số tiền hiển thị trên mặt sa bàn 3D và số tiền thực tế trong luật chơi (`PROPERTY_DEEDS`), bảo vệ nguyên tắc Poka-Yoke UI Affordance và Gotchas Pillar II #10.
* **Quy chuẩn**: Hàm `formatPriceLabel(TILE_METADATA_MAP[12].price)` và `formatPriceLabel(TILE_METADATA_MAP[28].price)` trả về chuỗi `"2.000"`.

### 1.2 Bất Biến Miền (Domain Invariants)
* **Bất biến 1 (3D Tile Metadata Parity)**: `TILE_METADATA_MAP[12].price === 2000` và `TILE_METADATA_MAP[28].price === 2000`.
* **Bất biến 2 (Single-Truth Price Label)**: `formatPriceLabel` cho ô 12 và ô 28 định dạng đúng `"2.000"` (phân cách hàng nghìn tiếng Việt).
* **Bất biến 3 (Category & Banner Color Invariance)**: Nhãn thể loại `category: 'TIỆN ÍCH'` và màu banner `#2563EB` giữ nguyên 100%.

---

## 2. NHIỆM VỤ THỰC THI CHI TIẾT (EXACT IMPLEMENTATION TASKS)

### Task 1: Cập Nhật Metadata Giá Ô 12 và Ô 28 Trong `tile_texture_data.ts`
* **Target physical file**: `src/client/3d/tile_texture_data.ts`
* **Mô tả**: Nâng giá ô 12 (EVN) và ô 28 (Viettel) từ 1500 lên 2000.

```typescript
<<<<
  12: { title: 'ĐIỆN LỰC', subtitle: 'Tập Đoàn EVN', price: 1500, bannerColor: '#2563EB', category: 'TIỆN ÍCH', icon: 'bolt' },
====
  12: { title: 'ĐIỆN LỰC', subtitle: 'Tập Đoàn EVN', price: 2000, bannerColor: '#2563EB', category: 'TIỆN ÍCH', icon: 'bolt' },
>>>>
```

```typescript
<<<<
  28: { title: 'VIỄN THÔNG', subtitle: 'Viettel 5G', price: 1500, bannerColor: '#2563EB', category: 'TIỆN ÍCH', icon: 'signal' },
====
  28: { title: 'VIỄN THÔNG', subtitle: 'Viettel 5G', price: 2000, bannerColor: '#2563EB', category: 'TIỆN ÍCH', icon: 'signal' },
>>>>
```

---

## 3. THIẾT KẾ KIỂM THỬ HỢP ĐỒNG (STATION 1 CONTRACT TEST SPECIFICATIONS)
* **Target physical file**: `tests/contracts/imp277b_3d_tile_texture_parity.test.ts` (New file to be created in Station 1/2)

* TC-277B.01 [UC-IMP277B/MSS]: Given TILE_METADATA_MAP của ô 12 EVN, When tra cứu price, Then giá trả về chính xác bằng 2000.
* TC-277B.02 [UC-IMP277B/MSS]: Given TILE_METADATA_MAP của ô 28 Viettel, When tra cứu price, Then giá trả về chính xác bằng 2000.
* TC-277B.03 [UC-IMP277B/MSS]: Given giá ô 12 từ TILE_METADATA_MAP, When gọi formatPriceLabel, Then chuỗi định dạng trả về chính xác là "2.000".
* TC-277B.04 [UC-IMP277B/MSS]: Given giá ô 28 từ TILE_METADATA_MAP, When gọi formatPriceLabel, Then chuỗi định dạng trả về chính xác là "2.000".
* TC-277B.05 [UC-IMP277B/MSS]: Given ô 12 và ô 28 trong TILE_METADATA_MAP, When tra cứu category và bannerColor, Then cả hai ô bảo toàn category là "TIỆN ÍCH" và bannerColor là "#2563EB".
* TC-277B.06 [UC-IMP277B/MSS]: Given ô 12 và ô 28, When so sánh giá giữa TILE_METADATA_MAP và PROPERTY_DEEDS, Then giá trên sa bàn 3D khớp 100% với giá trong luật kinh tế (2000 === 2000).

---

## 4. QUY TRÌNH CHỐT CHẶN CƠ HỌC & NGHIỆM THU
1. **Kiểm tra Plan tự động**: `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_277B_3D_TILE_TEXTURE_PARITY.md --auto-sign`
2. **Trạm 1 (RED)**: Tạo `tests/contracts/imp277b_3d_tile_texture_parity.test.ts` chứng minh fail vì runtime assertions (giá hiện tại trong `tile_texture_data.ts` là 1500).
3. **Trạm 2 (GREEN)**: Thực hiện Task 1 làm xanh 100% tests.
4. **Chốt chặn Fast Pre-Filter & Scope**:
   - `npm run prefilter -- src/client/3d/tile_texture_data.ts tests/contracts/imp277b_3d_tile_texture_parity.test.ts`
   - `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_277B_3D_TILE_TEXTURE_PARITY.md`
5. **Kiểm toán bằng chứng & Bàn giao**.
