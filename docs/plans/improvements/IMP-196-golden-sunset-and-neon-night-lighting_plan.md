# KẾ HOẠCH TRIỂN KHAI IMP-196 (BẢN ĐÃ TIẾP THU TOÀN DIỆN PHẢN BIỆN)
# NÂNG CẤP QUANG HỌC HOÀNG HÔN VÀNG KIM & ĐÊM NEON ĐÔ THỊ VỊNH BIỂN
## (Golden Sunset & Vibrant Neon Night Lighting Refinement)

> **Mục tiêu**: Khắc phục triệt để hiện tượng buổi chiều khó quan sát (do bóng đổ dài $Y=12$ che khuất bàn cờ và ám cam gắt) và ban đêm quá tối, u ám, thiếu sức sống; nâng cấp đồ họa 3D đạt chuẩn Resort Metropolis đẳng cấp thương mại.
> **Thời gian tạo**: 2026-09-26 | **Hạng mục**: Client 3D Visual & Atmospheric Rendering | **Quy trình**: 3 Trạm Nghiêm Ngặt (Station 1 RED ➔ Station 2 GREEN ➔ Station 2.5 Scout ➔ Station 3 Review).
> **Tài liệu kiểm toán đối kháng**: `.agents/audit/PLAN_AUDIT_IMP196.md` & Phản biện P1-P5 từ User.

---

## I. BỐI CẢNH & CHẨN ĐOÁN KỸ THUẬT (ROOT CAUSE DIAGNOSIS)

- **Phản hồi từ người chơi**: *"hiệu ứng buổi chiều thấy khó quan sát, hiệu ứng ban đêm quá tối không hấp dẫn"*.
- **Kiểm toán mã nguồn thực tế**:
  1. *Buổi Chiều (`sunset`)*: 
     - Tọa độ mặt trời `[-34, 12, 14]` có cao độ $Y=12$ ($\approx 18^\circ$) cực thấp, tạo bóng đổ dài ngoằng che khuất các ô đất nửa bắc bàn cờ.
     - Ánh nắng cam gắt `#F97316` kết hợp bầu trời `#C2410C` và phản xạ nền đất `#78350F` (nâu bùn) làm bão hòa màu, triệt tiêu độ tương phản nhận diện của 8 nhóm màu đất (Đỏ, Cam, Hồng, Nâu đều bị nhuộm màu nâu cam đục).
     - Đèn `Top-down Fill Light` chiếu đỉnh bàn cờ bị tắt hoàn toàn (`intensity = 0`), khiến các ô đất nằm trong bóng râm công trình 3D không nhận được ánh sáng đỉnh.
  2. *Ban Đêm (`night`)*: 
     - Bầu trời đen kịt `#050814` và sương mù đen kịt `#090D1A` ở cự ly quá gần ($65\text{m}$) tạo cảm giác hố đen vũ trụ hoang vu.
     - `environmentIntensity` bị dìm xuống $0.16$ làm vật liệu PBR (kính, kim loại, nước biển) mất ánh sáng phản chiếu.
     - Phản xạ nền đất `#0F172A` đen kịt; `Top-down Fill Light = 0` làm mặt bàn cờ tối tăm, chữ số khó đọc.

---

## II. MA TRẬN 5 CHẾ ĐỘ HỎNG (5 FAILURE MODES)

1. **[FM-1] Cháy Sáng & Chói Mắt Trên Thẻ Bàn Cờ (Overexposure & Glare)**:
   - *Phòng vệ*: Khóa trần Top-down Fill ở mức $0.18$ cho Chiều (`#FEF3C7`) và $0.14$ cho Đêm (`#BAE6FD`), thấp hơn mức Ban Ngày ($0.25$).
2. **[FM-2] Mất Bản Sắc Riêng Của Từng Pha (Loss of Phase Identity)**:
   - *Phòng vệ*: Giữ vững nhiệt độ màu đối lập: Chiều ấm áp Golden Amber (`#FDE047`, `#EA580C`), Đêm mát lạnh Cinematic Moonbeam (`#93C5FD`, `#0C1527`, `#0369A1`). Giữ `ambientIntensity` đêm ở mức cân bằng $0.40$ (không tăng quá trớn lên 0.42), giữ `fogNear: 75, fogFar: 240` để đêm tối vẫn có chiều sâu sương mù vịnh biển.
3. **[FM-3] Biến Dạng Màu Nhận Diện 8 Nhóm Đất (Chromatic Drift)**:
   - *Phòng vệ*: Khử mã màu cam cháy `#F97316` chuyển sang ánh nắng vàng kim `#FDE047` có phổ ánh sáng trung tính hơn, bảo toàn sắc độ nguyên bản của 8 nhóm màu.
4. **[FM-4] Rò Rỉ Ánh Sáng Phá Vỡ Sàn Đấu Giá & Giật Sáng Đột Ngột (Pop / Color Flash & Auction Breach)**:
   - *Phòng vệ*: 
     - Khai báo `topDownRef = useRef<DirectionalLight>(null)`, đưa việc tính toán `targetTopDown` và `targetColor` vào hook `useSafeFrame` lerp mượt mà qua $1 - e^{-3\Delta t}$ (triệt tiêu 100% hiện tượng flash/pop khi đổi pha).
     - Duy trì cơ chế nhân hệ số dìm sáng $\times 0.15$ cho toàn bộ các nguồn sáng (Sun, Fill, Rim, Ambient, Hemi) và Top-down Fill dìm về $0.05$ khi `isAuctionActive = true`.
5. **[FM-5] Phá Vỡ Hợp Đồng Kiểm Thử Cũ (Legacy Test Regression)**: 
   - *Phòng vệ*: Lập bảng SSOT Mapping chi tiết các dòng assert cũ $\rightarrow$ mới, không để implementer tự suy luận.

---

## III. MA TRẬN 3 CHIỀU TÁC ĐỘNG BIÊN (3-WAY BLAST RADIUS MATRIX)

| Chiều Tác Động | Thành Phần Ảnh Hưởng | Kịch Bản Biên / Rủi Ro | Giải Pháp Kiểm Soát & Hợp Đồng Test |
| :--- | :--- | :--- | :--- |
| **1. Downstream Consumers** | • `TimeOfDayLighting`<br>• `ProceduralBuilding`<br>• `DioramaSkyline`<br>• `CenterpieceWater`<br>• `TopBar`<br>• `Canvas3D` | Phản chiếu IBL trên mặt biển và kính Bitexco có bị lộ mây ban ngày khi nâng `environmentIntensity` ban đêm. | Điều chỉnh `baseEnv` ban đêm tăng vừa phải lên $0.28$ (thay vì $0.35$), chiều lên $0.38$. Bảo toàn vẻ lấp lánh neon mà không làm sáng rực nền nước biển. |
| **2. Upstream Modifiers** | • `useEnvironmentStore`<br>• `isAuctionActive`<br>• `isAuto`<br>• `timeOfDayMode` | Chuyển chế độ từ `auto` sang thủ công `sunset` / `night` hoặc khi phiên đấu giá kết thúc có hồi phục đúng preset. | Assert lerpRate mượt mà, `isAuctionActive` dìm sáng chính xác $\times 0.15$ trên toàn bộ nguồn sáng, bao gồm cả Top-down fill dìm về $0.05$. |
| **3. Exceptional Lifecycles** | • Đổi lượt gieo xúc xắc<br>• Reconnect giữa đêm<br>• Mở Modal Đấu Giá lúc hoàng hôn | Khôi phục trạng thái ánh sáng tức thì khi reload trang, không bị giật khung hình hay nhảy màu đột ngột. | Giá trị khởi tạo `initialTopDown` đọc từ store state; kiểm thử chuyển pha không sinh lỗi NaN hay cấp phát rò rỉ bộ nhớ Three.js GC. |

---

## IV. BẢNG SSOT MAPPING RECONCILE CÁC TEST CŨ (P3 RESOLUTION)

Để đảm bảo toàn bộ 323 test suites hiện có tiếp tục PASS 100%, bảng đối soát thay đổi assertion bắt buộc tuân thủ:

| Test File | Dòng | Đoạn Mã Cũ | Đoạn Mã Mới | Lý Do Reconcile |
| :--- | :---: | :--- | :--- | :--- |
| `tests/client/time_of_day.test.ts` | L135 | `expect(TIME_OF_DAY_PRESETS.night.sunColor).toBe('#60A5FA');` | `expect(TIME_OF_DAY_PRESETS.night.sunColor).toBe('#93C5FD');` | Nâng cấp trăng bạc trong trẻo (moonbeam blue-300) |
| `tests/client/time_of_day.test.ts` | L136 | `expect(TIME_OF_DAY_PRESETS.night.fogColor).toBe('#090D1A');` | `expect(TIME_OF_DAY_PRESETS.night.fogColor).toBe('#0F172A');` | Nâng cấp sương mù xanh chàm thanh lịch |
| `tests/client/time_of_day.test.ts` | L137 | `expect(TIME_OF_DAY_PRESETS.night.skyColor).toBe('#050814');` | `expect(TIME_OF_DAY_PRESETS.night.skyColor).toBe('#0C1527');` | Nâng cấp bầu trời đêm xanh chàm điện ảnh |
| `tests/client/phase1_pbr_beveled.test.ts` | L95 | `expect(source).toContain("phase === 'night' ? 0.16 : phase === 'sunset' ? 0.28 : 0.75");` | `expect(source).toContain("phase === 'night' ? 0.28 : phase === 'sunset' ? 0.38 : 0.75");` | Nâng cấp IBL môi trường đêm 0.28 (+75%) & chiều 0.38 |

> **Bảo toàn Hợp đồng IMP-80 (`TC-80.15`)**:
> `tests/contracts/imp80_daylight_illumination_and_unified_tile_art.test.ts#L293` assert chuỗi `rimColor`:
> `expect(content).toContain("phase === 'night' ? '#38BDF8' : phase === 'sunset' ? '#EA580C' : '#F8FAFC'");`
> ➔ **BẮT BUỘC GIỮ NGUYÊN VẸN 100%** dòng khai báo `rimColor` trong `time_of_day_lighting.tsx#L70`.

---

## V. TÁI CẤU TRÚC TRIỆT TIÊU MÃ CŨ (SUBTRACTIVE REFACTORING - P2 & P1 RESOLUTION)

### 1. Mã nguồn cũ cần XÓA BỎ trong `src/client/3d/time_of_day_lighting.tsx`
- **Tọa độ dòng cần xóa**: Dòng 216 - 221:
  ```tsx
  {/* XÓA BỎ TOÀN BỘ ĐOẠN NÀY - BỊ GẮN TRỰC TIẾP KHÔNG CÓ REF GÂY JUMP/FLASH */}
  {/* 8. Daylight Top-down Fill Light: Khử triệt để bóng tối sầm khi zoom cận cảnh vào bàn cờ */}
  <directionalLight
    position={[0, 30, 0]}
    intensity={phase === 'day' ? (isAuctionActive ? 0.05 : 0.25) : 0}
    color="#F8FAFC"
  />
  ```
- **Mã nguồn mới thay thế vào JSX**:
  ```tsx
  {/* 8. Balanced Top-down Fill Light: Khử triệt để bóng tối sầm mọi thời điểm */}
  <directionalLight
    ref={topDownRef}
    position={[0, 30, 0]}
    intensity={initialTopDown.intensity}
    color={initialTopDown.color}
  />
  ```

### 2. Khắc phục nhầm lẫn tọa độ `sunPosition` đêm trong `src/client/store/environment_store.ts` (P1)
- Giá trị cũ trên đĩa: `sunPosition: [18, 28, -20]` (dòng 53).
- Giá trị mới sau nâng cấp: `sunPosition: [18, 32, -20]` (delta $+4$ trên trục $Y$ giúp góc chiếu mặt trăng cao hơn, triệt tiêu bóng đổ dài của cọc cờ và quân cờ vào ban đêm).

---

## VI. NGÂN SÁCH DÒNG MÃ (LOC BUDGET & ANTI-SLOP)

| Tệp Mã Nguồn | Hiện Tại | Dự Kiến Thay Đổi | Sau Thay Đổi | Ngưỡng Trần TIER |
| :--- | :---: | :---: | :---: | :---: |
| `src/client/store/environment_store.ts` | 134 LOC | +8 LOC | ~142 LOC | Tier 1 ($\le 400$ LOC) |
| `src/client/3d/time_of_day_lighting.tsx` | 225 LOC | +25 LOC | ~250 LOC | Tier 2 ($\le 500$ LOC) |
| `tests/client/time_of_day.test.ts` | 172 LOC | +12 LOC | ~184 LOC | Unit Test ($\le 300$ LOC) |
| `tests/client/phase1_pbr_beveled.test.ts` | 133 LOC | +2 LOC | ~135 LOC | Unit Test ($\le 300$ LOC) |
| `tests/contracts/imp196_golden_sunset_and_neon_night_lighting.test.ts` | MỚI | +150 LOC | ~150 LOC | Contract Test ($\le 600$ LOC) |

---

## VII. CHI TIẾT THAY ĐỔI THAM SỐ QUANG HỌC KỸ THUẬT

### 1. `src/client/store/environment_store.ts`
- Cập nhật preset `sunset`:
  - `sunPosition`: `[-34, 12, 14]` $\rightarrow$ `[-28, 24, 18]` (nâng cao độ $Y$ từ 12 lên 24, triệt tiêu 75% bóng đổ dài).
  - `sunColor`: `'#F97316'` $\rightarrow$ `'#FDE047'` (Vàng kim hoàng gia ấm áp, bảo toàn 8 nhóm màu đất).
  - `sunIntensity`: `1.2` $\rightarrow$ `0.95` (Dịu mắt, không lóa).
  - `ambientColor`: `'#FED7AA'` $\rightarrow$ `'#FEF3C7'`.
  - `ambientIntensity`: `0.24` $\rightarrow$ `0.28`.
  - `hemiSkyColor`: `'#FB923C'`.
  - `hemiGroundColor`: `'#78350F'` $\rightarrow$ `'#9A3412'` (Đất nung ấm thay cho nâu bùn).
  - `hemiIntensity`: `0.22` $\rightarrow$ `0.24`.
  - `skyColor`: `'#C2410C'` $\rightarrow$ `'#EA580C'` (Cam hoàng hôn dịu thay cho cam cháy).
  - `fogColor`: `'#FDBA74'`.
  - `fogNear`: `75` $\rightarrow$ `80`, `fogFar`: `235` $\rightarrow$ `250`.
- Cập nhật preset `night`:
  - `sunPosition`: `[18, 28, -20]` $\rightarrow$ `[18, 32, -20]` (delta $+4$ trên Y).
  - `sunColor`: `'#60A5FA'` $\rightarrow$ `'#93C5FD'` (Ánh trăng xanh bạc trong trẻo).
  - `sunIntensity`: `0.55` $\rightarrow$ `0.65`.
  - `ambientColor`: `'#1E293B'` $\rightarrow$ `'#38BDF8'` (Cyan dạ quang dịu).
  - `ambientIntensity`: `0.38` $\rightarrow$ `0.40`.
  - `hemiSkyColor`: `'#1E293B'`.
  - `hemiGroundColor`: `'#0F172A'` $\rightarrow$ `'#0369A1'` (Xanh biển đêm dạ quang thay cho đen kịt).
  - `hemiIntensity`: `0.22` $\rightarrow$ `0.26`.
  - `skyColor`: `'#050814'` $\rightarrow$ `'#0C1527'` (Xanh chàm đêm điện ảnh thay cho đen đặc).
  - `fogColor`: `'#090D1A'` $\rightarrow$ `'#0F172A'` (Sương mù xanh chàm thanh lịch).
  - `fogNear`: `65` $\rightarrow$ `75`, `fogFar`: `215` $\rightarrow$ `240` (Mở rộng tầm nhìn skyline, vẫn giữ sương mù biển đêm).

### 2. `src/client/3d/time_of_day_lighting.tsx`
- Xuất hàm helper `calculateTopDownFill(phase: TimeOfDayPhase, isAuctionActive: boolean): { intensity: number; color: string }`:
  - `day`: `{ intensity: isAuctionActive ? 0.05 : 0.25, color: '#F8FAFC' }`
  - `sunset`: `{ intensity: isAuctionActive ? 0.05 : 0.18, color: '#FEF3C7' }`
  - `night`: `{ intensity: isAuctionActive ? 0.05 : 0.14, color: '#BAE6FD' }`
- Dòng 112 điều chỉnh cường độ môi trường IBL:
  `const baseEnv = phase === 'night' ? 0.28 : phase === 'sunset' ? 0.38 : 0.75;`
- Bổ sung `topDownRef = useRef<DirectionalLight>(null)` và điều tiết lerp trong `useSafeFrame`:
  ```ts
  if (topDownRef.current) {
    const topDownTarget = calculateTopDownFill(phase, isAuctionActive);
    tempColor.set(topDownTarget.color);
    topDownRef.current.color.lerp(tempColor, lerpRate);
    topDownRef.current.intensity += (topDownTarget.intensity - topDownRef.current.intensity) * lerpRate;
  }
  ```

---

## VIII. THẨM ĐỊNH THỊ GIÁC BẰNG ẢNH CHỤP THỰC TẾ (P5 RESOLUTION)

Theo quy định `GEMINI.md` (*Visual Target Spot-Inspection Invariant*):
1. **Tạo script chụp ảnh thực tế qua CDP**: `scripts/capture_imp196_lighting.ts` (kế thừa từ `scripts/capture_imp194_verification.ts`).
2. **Chụp 3 bức ảnh chất lượng cao (.jpg, quality 90) trên viewport di động 390x844**:
   - `docs/reports/uat/screenshots/imp196/imp196_01_day.jpg`
   - `docs/reports/uat/screenshots/imp196/imp196_02_sunset_golden_hour.jpg`
   - `docs/reports/uat/screenshots/imp196/imp196_03_night_neon_metropolis.jpg`
3. **Thẩm định Trạm 3**: Subagent `game-3d-visual-critic` BẮT BUỘC gọi `view_file` trên 3 ảnh này để so sánh độ sáng, độ rõ của thẻ BĐS, màu sắc 8 nhóm đất và độ lấp lánh neon trước khi ký duyệt.

---

## IX. SỔ CÁI NỢ KỸ THUẬT (TECH DEBT LEDGER - P4 RESOLUTION)

| Mã Nợ | Tệp & Tọa Độ | Nội Dung Ghi Nhận | Kế Hoạch Xử Lý |
| :--- | :--- | :--- | :--- |
| **TD-IMP196-01** | `src/client/3d/diorama/diorama_skyline.tsx#L370`<br>`tests/client/time_of_day.test.ts#L167` | Sử dụng raw unlit primitive `cylinderGeometry` làm chùm tia laser trên đỉnh tháp Bitexco. | Thay thế bằng custom beveled cone mesh hoặc shader laser chuyên dụng trong đợt refactor Diorama Skyline tiếp theo. |

---

## X. QUY TRÌNH 3 TRẠM (3-STATION PIPELINE)

1. **Trạm 1: QA RED (Contract Testing)**:
   - Tạo `tests/contracts/imp196_golden_sunset_and_neon_night_lighting.test.ts` (16 atomic tests).
   - Kiểm thử 5 Facets:
     - Facet 1: [TC-196.01-04] Thông số Sunset Golden Hour ($Y=24$, `#FDE047`, $80-250\text{m}$).
     - Facet 2: [TC-196.05-08] Thông số Night Neon Metropolis ($Y=32$, `#0C1527`, `#93C5FD`, `#0369A1`, $75-240\text{m}$).
     - Facet 3: [TC-196.09-11] Đèn Top-Down Fill Light (cả 3 pha không bị 0 khi bình thường, dìm về 0.05 khi đấu giá).
     - Facet 4: [TC-196.12-14] Bảo vệ sàn đấu giá Theatrical Auction ($\times 0.15$).
     - Facet 5: [TC-196.15-16] Khả năng lerp mượt mà qua `topDownRef` và bảo toàn môi trường PBR (`baseEnv`: 0.75, 0.38, 0.28).
   - Chạy Vitest chứng minh RED.
2. **Trạm 2: GREEN Implementation**:
   - Cập nhật `src/client/store/environment_store.ts` và `src/client/3d/time_of_day_lighting.tsx`.
   - Thực hiện Subtractive Refactoring xóa bỏ JSX cũ dòng 216-221.
   - Reconcile 4 dòng test cũ trong `time_of_day.test.ts` và `phase1_pbr_beveled.test.ts` theo bảng SSOT Mapping.
   - Chạy test xác nhận 100% PASS (323/323 suites).
3. **Trạm 2.5: Sweeping Scout Audit & Visual Screenshot Capture**:
   - Chạy script `capture_imp196_lighting.ts` chụp 3 ảnh thực tế tại `docs/reports/uat/screenshots/imp196/`.
   - Subagent `scout` quét đĩa vật lý kiểm toán 5 nhóm lỗi toàn cầu.
4. **Trạm 3: Independent Review**:
   - `spec-reviewer`, `code-reviewer`, `game-3d-visual-critic` kiểm tra đĩa vật lý và `view_file` 3 ảnh screenshot trước khi phê duyệt.
