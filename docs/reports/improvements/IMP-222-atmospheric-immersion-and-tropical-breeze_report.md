# [REPORT] IMP-222: Atmospheric Immersion & Living Tropical Breeze (Bước 4)

## 1. THÔNG TIN TỔNG QUAN
- **Mã Ticket**: IMP-222
- **Tiêu Đề**: Atmospheric Immersion & Living Tropical Breeze (Độ Nhập Tâm Khí Quyển & Làn Gió Biển Nhiệt Đới Sống Động).
- **Phân Hạng**: **Tier 2 (Full Rigor)** — 3D Lighting & Atmosphere, GLSL Tone Mapping Exposure Adaptation, Theatrical Auction Spotlight Fog, GPU Instanced Canopy Micro-Sway.
- **Trạng Thái**: ✅ **COMPLETE** (HOÀN TẤT 100% QUY TRÌNH 3 TRẠM).
- **Căn Cứ Kế Hoạch & Bằng Chứng**:
  - Kế hoạch phê duyệt v2: [`docs/plans/improvements/IMP-222-atmospheric-immersion-and-tropical-breeze_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-222-atmospheric-immersion-and-tropical-breeze_plan.md)
  - Kiểm toán đối kháng kế hoạch: [`.agents/audit/PLAN_AUDIT_IMP222.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP222.md)
  - Bằng chứng thực thi vật lý: [`.agents/evidence/imp222_execution.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp222_execution.json) (`executed: true`)
- **Hội Đồng Độc Lập Trạm 3**:
  - `spec-reviewer`: **APPROVED** (100% đối soát tam giác vật lý trên đĩa, khớp hoàn toàn đặc tả BR-IMP222-01 đến BR-IMP222-09, 16/16 tests pass).
  - `game-3d-visual-critic`: **APPROVED (9.6 / 10 — disposition: ship)** (Đạt chuẩn game thương mại AAA / Wow-Factor; đánh giá cao cơ chế giãn đồng tử mắt người ban đêm, sương mù rạp hát đồng bộ chân trời, và vành đai dừa đung đưa hữu cơ).
  - `scout` (Trạm 2.5): **PASS 100%** (0/5 nhóm khuyết tật, zero dirty cast, zero GC churn trong render loop, ngân sách LOC tuân thủ).

---

## 2. NGUYÊN NHÂN CỐT LÕI & GIẢI PHÁP ĐỒ HỌA 3D

### 2.1. Hiện Trạng Trước Cải Tiến
- **Môi trường ánh sáng tĩnh**: Giá trị `gl.toneMappingExposure` giữ cố định hoặc nhảy nấc khi đổi pha thời gian, không mô phỏng được cơ chế mắt người thích nghi ánh sáng tự nhiên (Pupillary Reflex) giữa ngày chói chang và đêm huyền ảo.
- **Sương mù chưa hỗ trợ kịch tính nghiệp vụ**: Khi mở sàn đấu giá BĐS gay cấn (`isAuctionActive = true`), sương mù khí quyển vẫn ở khoảng cách xa thông thường, chưa tạo được sân khấu kịch nghệ (Broadway spotlight) thu hút người chơi.
- **Thực vật tĩnh lặng**: Vành đai 32 cây dừa của `LayeredTropicalFoliage` hoàn toàn bất động, thiếu sự tương tác với làn gió biển đại dương đã được nâng cấp ở IMP-220 và IMP-221.

### 2.2. Kiến Trúc Dòng Chảy & Giải Pháp

```
                       [EnvironmentStore: phase & GameStore: isAuctionActive]
                                                 │
                                 [useSafeFrame Loop (dt, lerpRate)]
                                                 │
                 ┌───────────────────────────────┼───────────────────────────────┐
                 │                               │                               │
                 ▼                               ▼                               ▼
    [gl.toneMappingExposure Lerp]   [Theatrical Fog & Sky Dome]        [Instanced Palm Wind Sway]
    - Thích nghi đồng tử mắt người: - Bình thường (Atmospheric Fog):   - Vành đai 32 cây dừa:
      * Day: exposure = 1.0           * fogNear = 45m, fogFar = 180m     * Sway tán lá tier1, tier2, tier3
      * Sunset: exposure = 1.06       * Màu theo preset thời gian        * PALM_TIER_SWAY_FACTORS:
      * Night: exposure = 1.14      - Đấu giá (Theatrical Spotlight):      Tier 1: 0.6, Tier 2: 0.8, Tier 3: 1.0
      * Auction: exposure = 0.94      * fogNear kéo sát về 18m           * Tần số gió biển omega = 1.4 rad/s
    - Lerp êm ái: lerpExposure        * fogFar co lại còn 55m            * Pha lệch theo tọa độ (x + z)
      1 - exp(-dt * 2.5)              * fogColor & skyColor đồng bộ      * Bảo toàn 100% computeBoundingSphere
                 │                      chuyển sang #0F172A                      │
                 │                               │                               │
                 └───────────────────────────────┼───────────────────────────────┘
                                                 ▼
                                     [Không Gian Sa Bàn 3D Điện Ảnh]
                                   (Living Tropical Atmosphere & Drama)
```

---

## 3. BA HẠNG MỤC CỐT LÕI ĐÃ HOÀN TẤT VẬT LÝ

### 3.1. Auto-lerp `toneMappingExposure` (Điều Tiết Mắt Người / Eye Adaptation)
- Xuất khẩu hàm thuần túy `calculateTargetExposure(phase, isAuctionActive)`:
  * `day`: `1.00` (cân bằng ánh nắng chan hòa).
  * `sunset`: `1.06` (ấm áp, nâng sắc hổ phách).
  * `night`: `1.14` (giãn đồng tử trong đêm, làm nổi bật biển ngọc lam dạ quang `#0284C7` và bọt sóng lân tinh `#38BDF8`).
  * `auction`: `0.94` (hạ nhẹ nền, đẩy nổi spotlight vàng hoàng gia `#FEF08A` rọi vào thẻ Sổ Đỏ).
- Xuất khẩu `lerpExposure(current, target, rate)` có phòng vệ `Number.isFinite`, triệt tiêu 100% lỗi `NaN` và hiện tượng nhấp nháy chói lóa (flashing glitch).

### 3.2. Sương Mù Kịch Nghệ Đấu Giá & Đồng Bộ Nền Trời (Theatrical Auction Fog & Sky)
- Xuất khẩu hàm thuần túy `calculateFogTargets(phase, isAuctionActive, preset?)`:
  * Bình thường: `near >= 40m, far >= 160m`.
  * Đấu giá: kéo sát về `near = 18.0m, far = 55.0m`, cô lập bàn cờ như một sân khấu Broadway bí ẩn.
- **Triệt tiêu lỗi đứt gãy chân trời (Horizon Cutout Discontinuity)**: Đồng bộ cả `scene.fog.color` và `scene.background` cùng lerp sang sắc tím than `#0F172A`, không để lại vết cắt ngang trời phản cảm.

### 3.3. Tán Dừa Đung Đưa Trong Gió Biển (Living Tropical Breeze on Palm Canopies)
- Xuất khẩu `PALM_TIER_SWAY_FACTORS = { 1: 0.6, 2: 0.8, 3: 1.0 }` và hàm thuần túy `calculatePalmSwayAngles(time, x, z, tier)`.
- Phương trình dao động Lissajous 2 trục:
  * $\Delta\theta_z = \sin(t \times 1.4 + x \times 0.08 + z \times 0.06) \times 0.018 \times \text{factor}$
  * $\Delta\theta_x = \cos(t \times 1.1 + x \times 0.05 + z \times 0.07) \times 0.012 \times \text{factor}$
- **Bất biến Thân dừa cố định**: Thân dừa (`trunkRef`) cắm rễ vững chãi, chỉ 3 tầng tán lá trên ngọn đung đưa phân tầng giảm chấn (tầng chóp tier 3 đung đưa mạnh hơn tầng đáy tier 1).
- **Tối ưu 4 Draw Calls**: 32 cây dừa nhưng chỉ tốn đúng 4 Draw Calls qua Three.js `InstancedMesh`. Tái sử dụng `dummy` có sẵn, zero GC allocation trong render loop 60 FPS.
- Bảo toàn 100% `useEffect` khởi tạo và 4 lệnh `computeBoundingSphere` bảo vệ Frustum Culling.

---

## 4. MA TRẬN KIỂM THỬ HỢP ĐỒNG (UNIVERSAL 5-FACET MATRIX)

Bộ kiểm thử tại [`tests/client/atmospheric_immersion_and_breeze.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/atmospheric_immersion_and_breeze.test.ts) đạt **16/16 tests PASS (100%)**:

| Facet | Mã Test | Mục Tiêu & Khẳng Định Trạng Thái | Kết Quả |
| :---: | :--- | :--- | :---: |
| **Facet 1** | `[TC-222.01/MSS]` | `calculateTargetExposure('day', false) === 1.00` | ✔️ PASS |
| | `[TC-222.02/MSS]` | `calculateTargetExposure('sunset', false) === 1.06` | ✔️ PASS |
| | `[TC-222.03/MSS]` | `calculateTargetExposure('night', false) === 1.14` | ✔️ PASS |
| | `[TC-222.04/MSS]` | Khi `isAuctionActive = true`, exposure luôn là `0.94` bất kể phase | ✔️ PASS |
| **Facet 2** | `[TC-222.05/MSS]` | Chế độ thường: `near >= 40`, `far >= 160` | ✔️ PASS |
| | `[TC-222.06/MSS]` | Chế độ đấu giá: sương mù kéo sát `near = 18.0`, `far = 55.0` | ✔️ PASS |
| | `[TC-222.07/MSS]` | Khi đấu giá, màu sương mù chuyển sắc tím than `#0F172A` | ✔️ PASS |
| **Facet 3** | `[TC-222.08/MSS]` | Góc dời `swayZ in [-0.022, 0.022]` và `swayX in [-0.015, 0.015]` rad | ✔️ PASS |
| | `[TC-222.09/MSS]` | Độ lệch pha không gian: 2 cây ở tọa độ khác nhau dao động không đồng loạt | ✔️ PASS |
| | `[TC-222.10/MSS]` | Phân tầng giảm chấn: tier 3 (`factor = 1.0`) biên độ lớn hơn tier 1 (`factor = 0.6`) | ✔️ PASS |
| **Facet 4** | `[TC-222.11/MSS]` | `lerpExposure(1.0, 1.14, 0.1) === 1.014` hội tụ trơn tru không gián đoạn | ✔️ PASS |
| | `[TC-222.12/MSS]` | Biến thiên liên tục của khoảng cách sương mù giữa bình thường và đấu giá | ✔️ PASS |
| | `[TC-222.13/MSS]` | Phòng thủ số an toàn: fallback giá trị hợp lệ khi `NaN` hoặc pha không xác định | ✔️ PASS |
| **Facet 5** | `[TC-222.14/MSS]` | `renderToStaticMarkup(<TimeOfDayLighting />)` bảo toàn `data-testid="time-of-day-lighting"` | ✔️ PASS |
| | `[TC-222.15/MSS]` | `LayeredTropicalFoliage` duy trì chính xác 4 cụm `instancedMesh` cho 32 cây | ✔️ PASS |
| | `[TC-222.16/MSS]` | Cả 2 component kết xuất trơn tru trong Node.js headless SSR | ✔️ PASS |

**Tổng kiểm thử hồi quy**: **55/55 tests PASS** (bao gồm `layered_tropical_foliage`, `imp196_golden_sunset_and_neon_night_lighting`, `tropical_water_and_lighting`).

---

## 5. ĐO LƯỜNG NGÂN SÁCH LOC VẬT LÝ
*Đo lường tự động bởi `node scripts/check_loc.mjs`:*

| Tệp Vật Lý | Phân Loại Tier | Total Lines | Non-Empty SLOC | Trần Ngân Sách | Đánh Giá |
| :--- | :---: | :---: | :---: | :---: | :--- |
| [`src/client/3d/time_of_day_lighting.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/time_of_day_lighting.tsx) | Tier 2 (UI/3D/Views) | **290** | 261 | <= 500 SLOC | 🟢 **ĐẠT** |
| [`src/client/3d/layered_tropical_foliage.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/layered_tropical_foliage.tsx) | Tier 2 (UI/3D/Views) | **220** | 196 | <= 500 SLOC | 🟢 **ĐẠT** |
| [`tests/client/atmospheric_immersion_and_breeze.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/atmospheric_immersion_and_breeze.test.ts) | Contract Tests | **188** | 161 | <= 600 SLOC | 🟢 **ĐẠT** |

---

## 6. BẤT BIẾN MIỀN GHI NHẬN (DOMAIN INVARIANT #15)
Đã ghi nhận chuẩn xác vào [`docs/domain/gotchas.md#L111-L115`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md#L111-L115):
- **Tone Mapping Exposure Pupil Adaptation**: Cập nhật `gl.toneMappingExposure` qua hàm thuần túy `lerpExposure` (Day: 1.00, Sunset: 1.06, Night: 1.14, Auction Spotlight: 0.94), phòng vệ `Number.isFinite` triệt tiêu 100% lỗi `NaN` và nhấp nháy chói lóa.
- **Theatrical Auction Fog & Horizon Sky Alignment**: Khi đấu giá (`isAuctionActive`), sương mù khí quyển kéo sát về `near = 18.0m, far = 55.0m` và đồng bộ cả `scene.fog` lẫn `scene.background` cùng lerp sang sắc tím than `#0F172A`, triệt tiêu 100% lỗi đứt gãy chân trời (Horizon Cutout Discontinuity).
- **Instanced Foliage Wind Sway & Matrix Independence**: Giữ nguyên 100% `useEffect` khởi tạo ma trận tĩnh và 4 lệnh `computeBoundingSphere` bảo vệ Frustum Culling. Trong `useSafeFrame`, chỉ cập nhật độ nghiêng của 3 tầng tán lá (`tier1Ref`, `tier2Ref`, `tier3Ref`) dựa trên tọa độ gốc tĩnh `tree.x, tree.z` và bảng hệ số tầng `PALM_TIER_SWAY_FACTORS = { 1: 0.6, 2: 0.8, 3: 1.0 }`, giữ thân dừa cố định và zero object allocation trong frame loop.

---

## 7. KẾT LUẬN & PHÁN QUYẾT XUẤT XƯỞNG
Tính năng **IMP-222 (Bước 4)** đã hoàn tất xuất sắc theo chuẩn mực Antigravity 2.0 và GEMINI.md Harness. Toàn bộ mã nguồn, kiểm thử, bằng chứng và tài liệu đã được lưu trữ vĩnh viễn trên đĩa cứng dự án.
