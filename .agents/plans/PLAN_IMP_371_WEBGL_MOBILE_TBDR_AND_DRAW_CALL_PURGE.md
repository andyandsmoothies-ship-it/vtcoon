# Plan IMP-371: WebGL Mobile TBDR Draw Call Purge & Living Contract Preservation

## 0. Context & Architectural Rationale
- **Prior In-Flight Scope & UAT Telemetry Baseline**:
  - Dựa trên báo cáo kiểm toán thực tế iPhone Chrome ([`docs/reports/diagnostics/IOS_CHROME_GAMEPLAY_FORENSIC_REPORT.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/diagnostics/IOS_CHROME_GAMEPLAY_FORENSIC_REPORT.md)), HUD Watchdog ghi nhận:
    - **1,353 – 1,355 Draw Calls** (vượt ngân sách mobile <= 85 calls).
    - **8 – 10 FPS** và **74 ms – 236 ms Frame Time** trên WebKit iOS.
- **Physical Root Cause & Adversarial Audit Finding**:
  - Shadow pass đã được tắt sẵn trên mobile (`shadows={isMobileDevice ? false : "soft"}` trong `game_canvas.tsx` và `castShadow={!isMobile}` trong `time_of_day_lighting.tsx`).
  - Hơn 700 Draw Calls dư thừa trên iPhone xuất phát từ hàng trăm mesh tĩnh rời rạc trong các tiểu cảnh phụ chưa gộp của `MiniatureCityDiorama` (36+ shophouses, cao ốc khối hộp, nhà ga xe lửa, công viên bờ sông, khu di sản, trung tâm triển lãm).
  - Bản thảo cũ đề xuất gỡ bỏ `DioramaTraffic`, `DioramaModelRailroad`... vi phạm hợp đồng sống `TC-265.04` - `TC-265.07`, và đề xuất `return null` ô cờ vi phạm thiết luật `R3F Transient Unmount Invariant` và triệt tiêu `TileEventAura` (IMP-234).
- **Architectural Solution (Zero-Regression & Genuine Draw Call Cut)**:
  1. **Khử draw call thực chất**: Trong `src/client/3d/miniature_city_diorama.tsx`, khi `isMobile === true`, chỉ render các mốc biểu tượng cốt lõi (Bán đảo `Terrain`, Biểu tượng `MonumentPlaza`, Tháp `Skyline`, Cầu `Bridges`) và các phân hệ có ràng buộc hợp đồng.
  2. **Bảo tồn 100% hợp đồng TC-265**: Giữ nguyên `DioramaTraffic`, `DioramaModelRailroad`, `DioramaMicroLife`, `DioramaHarborCruiser` với prop `isMobile={isMobile}` (đã có cơ chế đóng băng `useSafeFrame` tại $t=0$).
  3. **Bảo tồn hiển thị sự kiện & R3F Invariant**: Giữ nguyên 40 ô đất trong `board_layout.tsx`, không dùng `return null` để bảo vệ trọn vẹn `TileEventAura` và tránh churn biên dịch lại shader khi mua đất.

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-371`
- **Subsystem**: `client-3d` (Tier 2 3D Presentation & Visual Kinematics)
- **Direct Scope (Physical Files)**:
  - **Target physical file**: `src/client/3d/miniature_city_diorama.tsx` (Refactor)
  - **Target physical file**: `tests/client/imp371_mobile_diorama_draw_call_purge.test.ts` (Tệp mới)
- **Referenced Contracts / Stable Boundaries**:
  - `tests/client/imp265_dual_platform_mobile_lod.test.ts` (TC-265.04 - TC-265.07)
  - `src/client/3d/board_tile.tsx` (TileEventAura)
  - `src/client/3d/miniature_city_diorama.tsx`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/miniature_city_diorama.tsx` | Tier 2 (UI/3D/Views) | 347 | 347 | 0 | <= 500 | Safe (< 400 LOC) |
| `tests/client/imp371_mobile_diorama_draw_call_purge.test.ts` | Living Test | 0 | 120 | +120 | <= 600 | 🆕 Tệp mới |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- Tạo tệp kiểm thử hợp đồng tại `tests/client/imp371_mobile_diorama_draw_call_purge.test.ts`:
  - TC-371.01 [UC-DIORAMA-MOBILE-CULL/MSS]: Given isMobile=true, When inspecting MiniatureCityDiorama, Then elides unbatched background components (shophouses, highrises, civic center, waterfront park, stations, heritage district).
  - TC-371.02 [UC-DIORAMA-TC265-PRESERVATION/MSS]: Given isMobile=true, When inspecting MiniatureCityDiorama, Then strictly preserves DioramaTraffic, DioramaModelRailroad, DioramaMicroLife, and DioramaHarborCruiser with isMobile=true.
  - TC-371.03 [UC-DIORAMA-CORE-LANDMARKS/MSS]: Given isMobile=true, When inspecting MiniatureCityDiorama, Then strictly preserves core landmarks (DioramaTerrain, CentralMonumentPlaza, DioramaBridges, DioramaSkyline, DioramaUrbanCanopy).
  - TC-371.04 [UC-DIORAMA-DESKTOP-PARITY/MSS]: Given isMobile=false, When inspecting MiniatureCityDiorama, Then renders 100% full desktop fidelity including all 18 diorama subsystems.
  - TC-371.05 [UC-DIORAMA-SSR-DISPOSAL/MSS]: Given MiniatureCityDiorama mounted under SSR, When rendering and unmounting static markup, Then executes safely without throwing exceptions.

### Station 2: Implementation (GREEN)

#### Task 1: Mobile LOD Culling trong `src/client/3d/miniature_city_diorama.tsx`
**Target physical file**: `src/client/3d/miniature_city_diorama.tsx`
```tsx
<<<<
export function MiniatureCityDiorama({ isMobile: propIsMobile }: MiniatureCityDioramaProps = {}): React.ReactElement {
  const isMobile = propIsMobile ?? isPhoneHardware();
  return (
    <group position={[0, 0, 0]} data-testid="miniature-city-diorama">
      {/* 0. Khung viền gỗ óc chó & gờ kim loại bao quanh bàn cờ */}
      <DioramaBoardRim />
      {/* 0.1. Tuyến đường sắt đô thị mô hình & đoàn tàu mini */}
      <DioramaModelRailroad isMobile={isMobile} />
      {/* 0.2. Ke ga xe lửa bến sông ven tuyến đường sắt */}
      <DioramaWaterfrontStation />
      {/* 0.25. Ke ga xe lửa Landmark Metro bờ Bắc */}
      <DioramaLandmarkNorthStation />
      {/* 0.3. Dải luống hoa và bụi cây cảnh nhiệt đới ven bờ kênh */}
      {!isMobile && <DioramaTropicalFlora />}
      {/* 1. Bán đảo đôi liền khối & Bậc thềm kết nối quảng trường trung tâm */}
      <DioramaTerrain />
      {/* 1.1. Quảng trường Tượng đài Biểu tượng Trung tâm */}
      <CentralMonumentPlaza />
      {/* 1.2. Tuyến hành lang đi bộ lát đá hoa cương & tiểu cảnh công viên */}
      <DioramaPedestrianPromenades isMobile={isMobile} />
      {/* 1.3. Tán cây xanh cảnh quan đô thị nhiệt đới đa tầng */}
      <DioramaUrbanCanopy isMobile={isMobile} />
      {/* 2. Cầu Ba Son (Bắc) và Cầu Long Biên (Nam) nối liền hai bờ sông */}
      <DioramaBridges />
      {/* 3. Trung tâm Văn hóa Triển lãm & Công viên Cảnh quan Bờ sông */}
      <DioramaCivicCenter />
      <DioramaWaterfrontPark />
      {/* 4. Cảng Container Cát Lái & Bến du thuyền (Đông Nam) */}
      <DioramaContainerPort isMobile={isMobile} />
      <DioramaMarina isMobile={isMobile} />
      {/* 4.1. Thuyền du ngoạn lòng sông Sài Gòn */}
      <DioramaHarborCruiser isMobile={isMobile} />
      {/* 5. Cụm cao ốc tài chính Landmark Skyline & Tháp cao ốc nén */}
      <DioramaSkyline />
      <DioramaHighriseBlocks />
      {!isMobile && <DioramaResidentialPool />}
      {/* 5.1. Khu di sản văn hóa Chợ Lớn & Shophouse phố cổ */}
      <DioramaHeritageDistrict />
      <DioramaShophouseBlocks />
      {/* 6. Nhịp sống đô thị vi mô & Giao thông tự hành */}
      <DioramaMicroLife isMobile={isMobile} />
      <DioramaTraffic isMobile={isMobile} />
    </group>
  );
}
====
export function MiniatureCityDiorama({ isMobile: propIsMobile }: MiniatureCityDioramaProps = {}): React.ReactElement {
  const isMobile = propIsMobile ?? isPhoneHardware();
  return (
    <group position={[0, 0, 0]} data-testid="miniature-city-diorama">
      {/* 0. Khung viền gỗ óc chó & gờ kim loại bao quanh bàn cờ */}
      <DioramaBoardRim />
      {/* 0.1. Tuyến đường sắt đô thị mô hình & đoàn tàu mini (Bảo tồn hợp đồng TC-265.05) */}
      <DioramaModelRailroad isMobile={isMobile} />
      {/* 0.2. Ke ga xe lửa bến sông ven tuyến đường sắt */}
      {!isMobile && <DioramaWaterfrontStation />}
      {/* 0.25. Ke ga xe lửa Landmark Metro bờ Bắc */}
      {!isMobile && <DioramaLandmarkNorthStation />}
      {/* 0.3. Dải luống hoa và bụi cây cảnh nhiệt đới ven bờ kênh */}
      {!isMobile && <DioramaTropicalFlora />}
      {/* 1. Bán đảo đôi liền khối & Bậc thềm kết nối quảng trường trung tâm */}
      <DioramaTerrain />
      {/* 1.1. Quảng trường Tượng đài Biểu tượng Trung tâm */}
      <CentralMonumentPlaza />
      {/* 1.2. Tuyến hành lang đi bộ lát đá hoa cương & tiểu cảnh công viên */}
      <DioramaPedestrianPromenades isMobile={isMobile} />
      {/* 1.3. Tán cây xanh cảnh quan đô thị nhiệt đới đa tầng */}
      <DioramaUrbanCanopy isMobile={isMobile} />
      {/* 2. Cầu Ba Son (Bắc) và Cầu Long Biên (Nam) nối liền hai bờ sông */}
      <DioramaBridges />
      {/* 3. Trung tâm Văn hóa Triển lãm & Công viên Cảnh quan Bờ sông */}
      {!isMobile && <DioramaCivicCenter />}
      {!isMobile && <DioramaWaterfrontPark />}
      {/* 4. Cảng Container Cát Lái & Bến du thuyền (Đông Nam) */}
      <DioramaContainerPort isMobile={isMobile} />
      <DioramaMarina isMobile={isMobile} />
      {/* 4.1. Thuyền du ngoạn lòng sông Sài Gòn (Bảo tồn hợp đồng TC-265.07) */}
      <DioramaHarborCruiser isMobile={isMobile} />
      {/* 5. Cụm cao ốc tài chính Landmark Skyline & Tháp cao ốc nén */}
      <DioramaSkyline />
      {!isMobile && <DioramaHighriseBlocks />}
      {!isMobile && <DioramaResidentialPool />}
      {/* 5.1. Khu di sản văn hóa Chợ Lớn & Shophouse phố cổ */}
      {!isMobile && <DioramaHeritageDistrict />}
      {!isMobile && <DioramaShophouseBlocks />}
      {/* 6. Nhịp sống đô thị vi mô & Giao thông tự hành (Bảo tồn hợp đồng TC-265.04 & TC-265.06) */}
      <DioramaMicroLife isMobile={isMobile} />
      <DioramaTraffic isMobile={isMobile} />
    </group>
  );
}
>>>>
```

### Station 3: Pre-Filter & Visual Evidence Verification
- Chạy mechanical pre-filter: `npm run prefilter -- src/client/3d/miniature_city_diorama.tsx`
- Bằng chứng thị giác Dual-Viewport: Chạy `npm run capture:visual -- --ticket IMP-371 --scenario camera_chase_cinematic`
- Kiểm toán bằng chứng vật lý: `node scripts/check_evidence.mjs IMP-371`

## 4. Risks & Mitigations
| Rủi ro kỹ thuật | Mức độ | Biện pháp giảm thiểu |
| :--- | :---: | :--- |
| **Phá vỡ kiểm thử hợp đồng IMP-265** | Rất cao | Giữ nguyên 100% việc mount và truyền prop `isMobile` cho 4 component con có test suite. |
| **Triệt tiêu hào quang thẻ Sự Kiện trên ô đất** | Rất cao | Không culling ô cờ trong `board_layout.tsx`, giữ nguyên toàn bộ 40 ô đất và `TileEventAura`. |
| **Frame hitching khi bấm Mua đất (R3F Invariant)** | Cao | Giữ nguyên cây Scene Graph của 40 ô cờ, không return null gây tái biên dịch shader trên WebKit. |
| **Mất thẩm mỹ sa bàn đô thị** | Thấp | Giữ nguyên Bán đảo, Cầu Ba Son & Long Biên, Tháp Bitexco, Tượng đài trung tâm và Cây xanh InstancedMesh. |

## 5. Blast Radius & Regressions
- **Bảo tồn Desktop**: Khi `isMobile === false`, toàn bộ 18 phân hệ sa bàn giữ nguyên 100% hình ảnh và tính năng.
- **Bảo tồn Game State**: Zero thay đổi đối với FSM state, Room, Banking, Dice roll, Turn cycle, Board Config hay Event Cards.
- **Ranh giới phân hệ**: Giới hạn nghiêm ngặt trong 1 tệp duy nhất `src/client/3d/miniature_city_diorama.tsx`, LOC giữ nguyên 348 lines (an toàn dưới trần <= 500 LOC).

## 6. Definition of Done (DoD)
- [ ] 5/5 Contract tests trong `tests/client/imp371_mobile_diorama_draw_call_purge.test.ts` chuyển sang GREEN.
- [ ] Toàn bộ 18 tests trong `tests/client/imp265_dual_platform_mobile_lod.test.ts` giữ vững kết quả PASS.
- [ ] TypeScript `tsc --noEmit` đạt 0 lỗi (Exit Code 0).
- [ ] Prefilter `npm run prefilter` vượt qua 100% (Zero dirty casts, LOC trong hạn mức).
- [ ] Ký duyệt kế hoạch tự động qua `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_371_WEBGL_MOBILE_TBDR_AND_DRAW_CALL_PURGE.md --auto-sign`.
