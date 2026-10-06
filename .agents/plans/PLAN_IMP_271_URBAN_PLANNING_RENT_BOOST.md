# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE (LEAN PLAN SPECIFICATION) — REVISION 3
# TICKET: IMP-271 — Cải Tiến Thẻ Thị Trường MC_URBAN_PLANNING (Nhân 1.5x Tiền Thuê Hà Nội & TP.HCM)

> **Mã Nhiệm Vụ:** IMP-271 (Micro-Slice thuộc Lộ trình Tái cân bằng Thẻ Thị trường)  
> **Phiên bản:** Revision 3 (Khắc phục triệt để 4 lỗ hổng cơ học & phản biện đối kháng)  
> **Phân hệ mục tiêu:** `domain-core`  
> **Phân loại rủi ro:** Tier 2 Micro-Slice (Lean Plan Specification, Targeted <= 200 lines, Delta <= 50 LOC, Max 2-3 files in `src/**`)  
> **Chỉ tiêu kiểm thử:** Scaled Floor >= 11 atomic tests, >= 8 mutants killed, Pure Logic Waiver = `true` (Không thay đổi layout DOM)

---

## 📋 BẢNG ĐỐI CHIẾU KHẮC PHỤC LỖ HỔNG (REVISION 3 DEFECT CLOSURE TABLE)

| STT | Lỗ Hổng Phản Biện Đối Kháng | Phân Loại & Mức Độ | Vị Trí Khắc Phục | Giải Pháp Kỹ Thuật Đã Tích Hợp |
| :---: | :--- | :---: | :--- | :--- |
| **1** | Ảo tưởng hàm vật lý `handlePropertyLanding` (TS2305 Test Blocker) | **P0 (Blocker)** | Section 1.2 & Section 3 (TC-271.07) | Sửa thành hàm chuẩn vật lý `handleLanding` trong `src/domain/property_manager.ts#L61`. |
| **2** | Nguy cơ lệch pha trực quan 3D Aura & Lạm dụng Pure Logic Waiver | **P1 (Visual Desync)** | Section 0.3 | Áp dụng Scope Conservation Mandate: Gắn nhãn hoãn tường minh `[DEFERRED TO TICKET-IMP-273: Đồng Bộ Nhãn 3D Aura & UI Cho MC_URBAN_PLANNING]`. |
| **3** | Thiếu kiểm thử xếp chồng đòn bẩy (Compound Multiplier Hazards) | **P1 (Math Safety)** | Section 3 (TC-271.11) | Thêm TC-271.11 kiểm chứng xếp chồng giữa `hasMonopoly` (x1.5 C3) và `MC_URBAN_PLANNING` (x1.5) qua `resolveRent` (8.800M -> 13.200M -> 19.800M). |
| **4** | Vi phạm tính nguyên tử tại TC-271.09 (Atomic Test Mandate) | **P2 (Test Density)** | Section 3 (TC-271.09a, 09b) | Tách thành 2 ca riêng biệt: TC-271.09a (tiền thuê domain-core) và TC-271.09b (tỷ lệ thế chấp server). |

---

## 0. KHẢO SÁT BỀ MẶT MÃ NGUỒN & ĐIỂM BẮT ĐẦU (SURFACE INVENTORY & LOC BASELINE)

### 0.1 Danh Sách Tệp Mục Tiêu & Dòng Mã Thực Tế Trên Đĩa
* **Target File 1:** [`src/domain/market_card_handlers.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/market_card_handlers.ts) (276 lines, Tier 1 limit: 400 lines) — **Safe**.
* **Target File 2:** [`src/domain/event_card_metadata.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/event_card_metadata.ts) (322 lines, Tier 1 limit: 400 lines, warning > 300) — **⚠️ Warning (322 > 300)**.
* **Target File 3:** [`tests/contracts/imp271_urban_planning_rent_boost.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp271_urban_planning_rent_boost.test.ts) (New test file, target <= 250 lines) — **Safe**.

### 0.2 Bảng Thống Kê Delta LOC Dự Kiến
| File | Current LOC | Expected LOC | Delta LOC | Status |
| :--- | :---: | :---: | :---: | :---: |
| `src/domain/market_card_handlers.ts` | 276 | 276 | 0 (Modify 1 line) | Safe |
| `src/domain/event_card_metadata.ts` | 322 | 322 | 0 (Modify 2 lines) | ⚠️ Warning (Tech Debt Registered) |
| `tests/contracts/imp271_urban_planning_rent_boost.test.ts` | 0 | ~200 | +200 | Safe |
| **Tổng Delta Production (`src/**`)** | — | — | **~0 net LOC** (<= 50 LOC) | **Pass Micro-Slice** |

### 0.3 Kiểm Kê Toàn Bộ Bề Mặt Điểm Gọi & Phân Định Phạm Vi (Scope Conservation Mandate)
1. [`src/domain/market_card_handlers.ts#L246`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/market_card_handlers.ts#L246) — **MODIFY (Target 1)**: Bổ sung `multiplier: 1.5` và `remainingRounds: 2`.
2. [`src/domain/event_card_metadata.ts#L267-L273`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/event_card_metadata.ts#L267-L273) — **MODIFY (Target 2)**: Cập nhật metadata, mô tả và thời lượng 2 vòng.
3. [`src/domain/property_rent.ts#L48-L66`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_rent.ts#L48-L66) — **KEEP**: Generic multiplier đã tự động xử lý `m.multiplier === 1.5`.
4. [`src/server/mortgage_manager.ts#L86-L92`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/mortgage_manager.ts#L86-L92) — **KEEP**: Logic thế chấp 60% tự động kéo dài theo `m.remainingRounds > 0`.
5. [`src/domain/event_card_types.ts#L16`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/event_card_types.ts#L16) & [`src/domain/i18n/vi.ts#L25`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/i18n/vi.ts#L25) — **KEEP**: Enum và i18n title giữ nguyên.
6. **Các tệp UI bị ảnh hưởng (Phát hiện từ phản biện đối kháng)**:
   - `src/client/domain_visual_bridge.ts#L113-L115` (Nhãn 3D Aura đang gắn cứng 'Thế chấp 60%')
   - `src/client/ui/market_event_ticker.tsx#L135` & `L91` (Ticker text)
   - `src/client/ui/modals/event_card_visuals.ts#L27` & `title_deed_modal.tsx#L62`
   - *Quy chuẩn phân lập*: Để tuân thủ Hard Constraint cấm Cross-Subsystem Contamination (không trộn `client-ui` vào `domain-core`), toàn bộ 4 tệp UI trên được **hoãn tường minh sang ticket kế tiếp**:  
     👉 **`[DEFERRED TO TICKET-IMP-273: Cập Nhật Nhãn 3D Aura & Ticker Cho MC_URBAN_PLANNING]`**.

### 0.4 Đăng Ký Nợ Kỹ Thuật (Tech Debt Registration)
* **Tech Debt Item `DEBT-METADATA-LOC-322`**: Tệp `src/domain/event_card_metadata.ts` hiện có 322 physical LOC (> 300 LOC Warning threshold của Tier 1). Delta của IMP-271 là 0 LOC (chỉ thay thế text). Kế hoạch tương lai sẽ trích xuất metadata thành các file con (`chance_card_metadata.ts` & `market_card_metadata.ts`) nếu tệp vượt 360 LOC.

---

## 1. BẢN THIẾT KẾ KIẾN TRÚC & BẤT BIẾN NGHIỆP VỤ (ARCHITECTURAL INVARIANTS)

### 1.1 Mục Tiêu & Cơ Chế Nghiệp Vụ
* **Hiện trạng**: Thẻ `MC_URBAN_PLANNING` chỉ tăng tỷ lệ thế chấp từ 50% lên 60% cho nhóm HN & TP.HCM trong 1 vòng (`remainingRounds: 1`). Không phát sinh dòng tiền, không ai đem thế chấp đất vàng $\rightarrow$ Thẻ bị tê liệt 99% thời gian.
* **Cải tiến**:
  1. Thêm `multiplier: 1.5` vào payload modifier khi rút thẻ `MC_URBAN_PLANNING`.
  2. Kéo dài thời gian hiệu lực từ 1 vòng lên **2 vòng chơi** (`remainingRounds: 2`).
  3. Khi người chơi dừng chân tại các ô thuộc `HANOI_HCMC_CELLS` (`[31, 32, 34, 37, 39]`), hàm `calculateRent` trong [`src/domain/property_rent.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_rent.ts) tự động nhân `1.5x` tiền thuê cơ sở và tiền thuê công trình.
  4. Duy trì trọn vẹn đặc quyền thế chấp 60% giá niêm yết trong suốt 2 vòng tại [`src/server/mortgage_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/mortgage_manager.ts).

### 1.2 Bất Biến Miền (Domain Invariants)
* **Bất biến 1 (Cell Boundary)**: Chỉ 5 ô thuộc `HANOI_HCMC_CELLS` (`[31, 32, 34, 37, 39]`) mới được áp dụng nhân tiền thuê 1.5x. Các ô khác trên bàn cờ giữ nguyên tiền thuê 1.0x.
* **Bất biến 2 (Mortgage Rent Exclusion)**: Nếu ô đất thuộc nhóm HN/HCM đang bị thế chấp (`isMortgaged: true`), tiền thuê bằng 0 qua hàm chuẩn vật lý `handleLanding` trong [`src/domain/property_manager.ts#L61,L90-L92`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_manager.ts#L61), không được nhân multiplier.
* **Bất biến 3 (Compound Multiplier Math Safety)**: Khi xếp chồng với độc quyền nhóm màu (`hasMonopoly`) và thang tiến vòng đấu, thứ tự làm tròn `Math.floor` chạy tuần tự qua `resolveRent` -> `calculateRent` mà không làm tràn số.

---

## 2. NHIỆM VỤ THỰC THI CHI TIẾT (EXACT IMPLEMENTATION TASKS)

### Nhiệm Vụ 1: Cập Nhật Modifier Payload Trong `market_card_handlers.ts`
* **Target physical file**: `src/domain/market_card_handlers.ts`
* **Mô tả**: Bổ sung `multiplier: 1.5` và tăng `remainingRounds: 2` cho `MC_URBAN_PLANNING`.

```typescript
<<<<
  [MarketCardId.MC_URBAN_PLANNING]:  (mods) => mods.push({ type: MarketCardId.MC_URBAN_PLANNING, affectedCells: HANOI_HCMC_CELLS, remainingRounds: 1 }),
====
  [MarketCardId.MC_URBAN_PLANNING]:  (mods) => mods.push({ type: MarketCardId.MC_URBAN_PLANNING, affectedCells: HANOI_HCMC_CELLS, remainingRounds: 2, multiplier: 1.5 }),
>>>>
```

### Nhiệm Vụ 2: Cập Nhật Metadata & Mô Tả Trong `event_card_metadata.ts`
* **Target physical file**: `src/domain/event_card_metadata.ts`
* **Mô tả**: Cập nhật `description`, `effectDetail`, `duration`, và `destination` của `MC_URBAN_PLANNING`.

```typescript
<<<<
  [MarketCardId.MC_URBAN_PLANNING]: {
    description: 'Quy hoạch trung tâm tài chính mới công bố, tăng 20% giá trị khi thế chấp các BĐS lõi trung tâm.',
    targetScope: 'Bất động sản trung tâm Hà Nội và TP.HCM (Nhóm Xanh Lá & Tím)',
    effectDetail: 'Tăng 20% giá trị khi thế chấp (nhận 60% thay vì 50% giá niêm yết)',
    duration: '1 vòng chơi',
    destination: 'Ngân sách người chơi',
  },
====
  [MarketCardId.MC_URBAN_PLANNING]: {
    description: 'Quy hoạch trung tâm tài chính mới công bố, nhân 1.5x tiền thuê và tăng 20% giá trị khi thế chấp các BĐS lõi trung tâm.',
    targetScope: 'Bất động sản trung tâm Hà Nội và TP.HCM (Nhóm Xanh Lá & Tím)',
    effectDetail: 'Nhân 1.5x tiền thuê (x1.5) và tăng 20% giá trị khi thế chấp (nhận 60% thay vì 50% giá niêm yết) trong 2 vòng',
    duration: '2 vòng chơi',
    destination: 'Chủ sở hữu BĐS Hà Nội/TP.HCM & Ngân sách người chơi',
  },
>>>>
```

---

## 3. ĐẶC TẢ HỢP ĐỒNG KIỂM THỬ TRẠM 1 (STATION 1 CONTRACT TEST SPECIFICATIONS)

* **Target physical file**: `tests/contracts/imp271_urban_planning_rent_boost.test.ts` (New file)

- TC-271.01 [UC-IMP271/MSS]: Given mảng mods rỗng, When gọi executeMarketCard(MC_URBAN_PLANNING, mods), Then mods chứa 1 phần tử với remainingRounds bằng 2, multiplier bằng 1.5, và affectedCells khớp HANOI_HCMC_CELLS.
- TC-271.02 [UC-IMP271/MSS]: Given ô Hà Nội C0 cell 32 có base rent 300 từ PROPERTY_DEEDS và có modifier MC_URBAN_PLANNING, When tính toán calculateRent(300, 32, mods), Then tiền thuê trả về 450 (bằng floor của 300 nhân 1.5).
- TC-271.03 [UC-IMP271/MSS]: Given ô TP.HCM C0 cell 39 có base rent 400 từ PROPERTY_DEEDS và có modifier MC_URBAN_PLANNING, When tính toán calculateRent(400, 39, mods), Then tiền thuê trả về 600 (bằng floor của 400 nhân 1.5).
- TC-271.04 [UC-IMP271/MSS]: Given ô Hưng Yên C0 cell 31 có base rent 300 từ PROPERTY_DEEDS và có modifier MC_URBAN_PLANNING, When tính toán calculateRent(300, 31, mods), Then tiền thuê trả về 450 (bằng floor của 300 nhân 1.5).
- TC-271.05 [UC-IMP271/MSS]: Given ô Thừa Thiên Huế cell 18 nằm ngoài nhóm HANOI_HCMC_CELLS và có base rent 180 từ PROPERTY_DEEDS, When tính toán calculateRent(180, 18, mods), Then tiền thuê giữ nguyên 180 không bị nhân hệ số.
- TC-271.06 [UC-IMP271/MSS]: Given ô Hà Nội cell 32 đã nâng cấp Cấp 2 có base rent 2700 từ PROPERTY_DEEDS và có modifier MC_URBAN_PLANNING, When tính toán calculateRent(2700, 32, mods), Then tiền thuê trả về 4050 (bằng floor của 2700 nhân 1.5).
- TC-271.07 [UC-IMP271/MSS]: Given ô Hà Nội cell 32 đang bị thế chấp isMortgaged true trong stateMap và có modifier MC_URBAN_PLANNING, When gọi handleLanding xử lý dừng chân vật lý, Then rentAmount trả về 0 theo luật đóng băng thế chấp.
- TC-271.08 [UC-IMP271/MSS]: Given Room có activeModifier MC_URBAN_PLANNING với remainingRounds 2, When gọi getEffectiveMortgageRate(room, 32), Then tỷ lệ vay thế chấp trả về 0.6 (60% giá niêm yết).
- TC-271.09a [UC-IMP271/A1]: Given modifier MC_URBAN_PLANNING đã hết hạn remainingRounds bằng 0, When gọi calculateRent(300, 32, mods), Then tiền thuê giữ nguyên 1.0x bằng 300 không bị nhân hệ số.
- TC-271.09b [UC-IMP271/A1]: Given modifier MC_URBAN_PLANNING đã hết hạn remainingRounds bằng 0, When gọi getEffectiveMortgageRate(room, 32), Then tỷ lệ vay thế chấp trở về mặc định 0.5.
- TC-271.10 [UC-IMP271/MSS]: Given thẻ MC_URBAN_PLANNING, When gọi getMarketCardInfo(MarketCardId.MC_URBAN_PLANNING), Then duration trả về '2 vòng chơi', effectDetail chứa '1.5x tiền thuê' và '60% thay vì 50%', destination không rỗng.
- TC-271.11 [UC-IMP271/MSS]: Given ô TP.HCM Quận 1 cell 39 cấp 3 có monopoly độc quyền nhóm Tím (base rent3 8800 nhân 1.5 bằng 13200) và có modifier MC_URBAN_PLANNING, When gọi resolveRent tính toán tiền thuê xếp chồng, Then tiền thuê nhân tiếp 1.5x trả về chính xác 19800 qua các tầng Math.floor.

---

## 4. BẬT ĐÈN XANH VẬN HÀNH & ĐỘ NHẠY ĐỘT BIẾN (CHAOS SENTINEL GATE)

* **Phạm vi Mutation Sensitivity**: Tối thiểu 8 mutants trong `market_card_handlers.ts` (`multiplier: 1.5` đổi thành `1.0`, `remainingRounds: 2` đổi thành `1`, `affectedCells` bị xóa rỗng, v.v.).
* **Pure Logic Waiver**: `true` (Không thay đổi visual DOM trong ticket này, toàn bộ việc đồng bộ 3D Aura & nhãn UI được hoãn sang TICKET-IMP-273).
* **Rollback Plan**: Revert 2 dòng thay đổi trong `market_card_handlers.ts` và `event_card_metadata.ts`.
