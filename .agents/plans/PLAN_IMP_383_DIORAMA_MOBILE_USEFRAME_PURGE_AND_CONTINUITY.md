# KẾ HOẠCH TRIỂN KHAI IMP-383: DIORAMA MOBILE USEFRAME PURGE & CONTINUITY (MICRO-VEHICLES & WATERCRAFT SLICE)

## 1. MỤC TIÊU & BỐI CẢNH (HARDENED THEO BÁO CÁO PHẢN BIỆN ADV-01..ADV-04)
- **Mục tiêu**: Loại bỏ triệt để việc đăng ký vòng lặp `useFrame`/`useSafeFrame` vô ích trên thiết bị di động (`isMobile = true`) và dừng tính toán hoạt họa khi nhóm sa bàn đô thị bị ẩn (`isVisible = false`) cho lát cắt phương tiện vi mô và tàu thuyền (`DioramaTraffic`, `DioramaHarborCruiser`, `DioramaMicroLife`).
- **Phạm vi bảo toàn & Kiến trúc gia cố**:
  - **Headless Child FrameLoop Pattern (ADV-01)**: Thay vì tách component gốc `{isMobile ? <Static /> : <Animated />}`, giữ nguyên cấu trúc `<group>` và toàn bộ lưới (mesh) trực tiếp trong JSX của component cha để bảo toàn 100% khả năng duyệt cây AST cho các bộ kiểm thử sống (`TC-265.07`, `TC-265.10`, `TC-266.3.04`). Vòng lặp `useSafeFrame` được ủy nhiệm hoàn toàn cho component con không giao diện (`DioramaTrafficFrameLoop`, `DioramaHarborCruiserFrameLoop`, `DioramaMicroLifeFrameLoop`), chỉ được mount khi `!isMobile`.
  - **Giới hạn lát cắt & Bảo toàn phạm vi (ADV-02)**: Lát cắt IMP-383 tập trung vào nhóm phương tiện vi mô & tàu thuyền. Sáu thành phần diorama hạ tầng còn lại được bảo lưu chính thức tại [DEFERRED TO TICKET-IMP-385: Miniature City Infrastructure & Aviation useFrame Purge & Continuity]. Môi trường vịnh biển được bảo lưu tại [DEFERRED TO TICKET-IMP-384: Coastal Island & Marine Wildlife useFrame Purge & Continuity].
  - **Kẹp biên độ Delta Spike (ADV-03)**: Trong mọi callback tích lũy tiến trình, bắt buộc kẹp `const clampedDelta = Math.min(delta, 0.1)` theo chuẩn dự án (`diorama_perching_birds.tsx#L170`) để chống hiện tượng nhảy cóc teleport khi mở lại tab hoặc đóng modal.
  - **Tương thích toàn diện Call-Site Lobby (ADV-04)**: Đặt giá trị mặc định `isVisible = true` trên `MiniatureCityDiorama` và toàn bộ component con để bảo toàn khả năng hoạt họa mượt mà trong `SunnyIslandLobbyScene`.
  - **Bảo toàn tính liên tục $C^0$ & Chống giật hình**: Tích lũy delta thay vì đọc `clock.elapsedTime` tuyệt đối; bắt nhịp phục hồi `justResumed` để copy tọa độ tức thì, triệt tiêu lỗi trễ hình (1-frame ghosting).

## 2. BẢNG KÊ KHAI LOC TRUNG THỰC (HONEST LOC TABLE)
| File | Tier | Current LOC | Expected LOC | Net Delta | Max Budget | Status |
| `src/client/3d/board_layout.tsx` | Tier 2 | 230 | 230 | 0 | 500 | Modifying |
| `src/client/3d/miniature_city_diorama.tsx` | Tier 2 | 368 | 368 | 0 | 500 | Modifying |
| `src/client/3d/diorama/diorama_traffic.tsx` | Tier 2 | 303 | 303 | 0 | 500 | Modifying |
| `src/client/3d/diorama/diorama_harbor_cruiser.tsx` | Tier 2 | 105 | 105 | 0 | 500 | Modifying |
| `src/client/3d/diorama/diorama_microlife.tsx` | Tier 2 | 96 | 96 | 0 | 500 | Modifying |
| `tests/client/imp383_diorama_mobile_useframe_purge.test.ts` | Test | 178 | 178 | 0 | 600 | Modifying |
| `docs/FEATURE_MAP.md` | Doc | 93 | 93 | 0 | 800 | Modifying |

## 3. CHI TIẾT THAY ĐỔI THEO CÁC TRẠM

### Trạm 1 (RED): Hợp đồng kiểm thử Contract Test
**Target physical file**: `tests/client/imp383_diorama_mobile_useframe_purge.test.ts` (New file)
- TC-383.01: [UC-IMP383/MSS] Given GameBoard với isCityVisible=false, When render cây GameBoard, Then MiniatureCityDiorama nhận prop isVisible=false từ call-site.
- TC-383.02: [UC-IMP383/MSS] Given MiniatureCityDiorama với isMobile=true, When render cây sa bàn, Then DioramaTrafficFrameLoop không được mount và zero useSafeFrame callback được đăng ký trong scheduler.
- TC-383.03: [UC-IMP383/MSS] Given DioramaTraffic với isMobile=true, When captureTree component DioramaTraffic, Then cấu trúc cây trả về trực tiếp danh sách xe ở tọa độ tĩnh ban đầu bảo tồn hợp đồng living test TC-265.10.
- TC-383.04: [UC-IMP383/MSS] Given DioramaHarborCruiser với isMobile=true, When captureTree component DioramaHarborCruiser, Then thuyền tĩnh được trả về tại tọa độ bến y=-0.032 z=5.2 và DioramaHarborCruiserFrameLoop không được mount.
- TC-383.05: [UC-IMP383/MSS] Given DioramaMicroLife với isMobile=true, When captureTree component DioramaMicroLife, Then mô hình tĩnh được trả về và DioramaMicroLifeFrameLoop không được mount.
- TC-383.06: [UC-IMP383/A1] Given DioramaTrafficFrameLoop khi isVisible=false, When useSafeFrame callback được gọi, Then hàm trả về sớm (early return) mà không làm tăng biến tích lũy delta progress.
- TC-383.07: [UC-IMP383/A2] Given DioramaHarborCruiserFrameLoop khi vừa phục hồi hiển thị (isVisible chuyển từ false sang true), When useSafeFrame nhận nhịp tick kế tiếp, Then vị trí thuyền được copy tức thì mà không bị trễ hình.
- TC-383.08: [UC-IMP383/A3] Given DioramaTrafficFrameLoop nhận delta lớn sau khi resume tab (delta = 2.5s), When useSafeFrame xử lý, Then delta được kẹp tối đa 0.1s bảo vệ tính liên tục C0.
- TC-383.09: [UC-IMP383/MSS] Given call-site tích hợp trong MiniatureCityDiorama, When kiểm tra truyền props, Then DioramaTraffic, DioramaHarborCruiser và DioramaMicroLife đều nhận đúng isMobile và isVisible.

### Trạm 2 (GREEN): Thực thi mã nguồn sản xuất

#### Điểm Tích Hợp & Call-Site Wiring
1. **Target physical file**: `src/client/3d/board_layout.tsx`
   - Tại `board_layout.tsx` dòng 174, truyền cờ `isVisible={isCityVisible}` vào `<MiniatureCityDiorama isMobile={isMobile} isVisible={isCityVisible} />`.

2. **Target physical file**: `src/client/3d/miniature_city_diorama.tsx`
   - Tại `miniature_city_diorama.tsx` dòng 318, mở rộng `MiniatureCityDioramaProps` nhận `readonly isVisible?: boolean` với fallback mặc định `isVisible = true` (bảo toàn `SunnyIslandLobbyScene`).
   - Tại dòng 353-363, truyền `isVisible={isVisible}` xuống `<DioramaHarborCruiser isMobile={isMobile} isVisible={isVisible} />`, `<DioramaMicroLife isMobile={isMobile} isVisible={isVisible} />`, và `<DioramaTraffic isMobile={isMobile} isVisible={isVisible} />`.

3. **Target physical file**: `src/client/3d/diorama/diorama_traffic.tsx`
   - Giữ nguyên `DioramaTraffic` trả về `<group>` và các xe trực tiếp trong JSX root.
   - Trích xuất vòng lặp sang headless component `DioramaTrafficFrameLoop`, chỉ mount khi `!isMobile`.
   - Trong `DioramaTrafficFrameLoop`: kẹp delta `Math.min(delta, 0.1)`, tích lũy `progressRef.current`, dừng sớm khi `!isVisible`, phục hồi tức thì tọa độ khi `justResumed`.

4. **Target physical file**: `src/client/3d/diorama/diorama_harbor_cruiser.tsx`
   - Giữ nguyên `DioramaHarborCruiser` trả về `<group>` và thuyền trực tiếp trong JSX root.
   - Trích xuất vòng lặp sang headless component `DioramaHarborCruiserFrameLoop`, chỉ mount khi `!isMobile`.
   - Trong `DioramaHarborCruiserFrameLoop`: kẹp delta `Math.min(delta, 0.1)`, dừng sớm khi `!isVisible`, phục hồi tọa độ khi vừa resume.

5. **Target physical file**: `src/client/3d/diorama/diorama_microlife.tsx`
   - Giữ nguyên `DioramaMicroLife` trả về `<group>` và mô hình trực tiếp trong JSX root.
   - Trích xuất vòng lặp sang headless component `DioramaMicroLifeFrameLoop`, chỉ mount khi `!isMobile`.
   - Trong `DioramaMicroLifeFrameLoop`: dừng sớm khi `!isVisible`.

6. **Target physical file**: `docs/FEATURE_MAP.md`
   - Tại `docs/FEATURE_MAP.md`, cập nhật Pillar 13 (3D Graphics & Performance) ghi nhận kiến trúc Headless Child FrameLoop Pattern, Delta Clamping và Dynamic Visibility Early Return.

### Trạm 3 & 4: Kiểm chứng cơ học & Bằng chứng thực tế
- Chạy kiểm thử: `npx --yes vitest run tests/client/imp383_diorama_mobile_useframe_purge.test.ts`
- Chạy kiểm thử hồi quy: `npx --yes vitest run tests/client/imp265_dual_platform_mobile_lod.test.ts tests/contracts/imp266_3_3d_lod_mobile_toggling.test.ts`
- Chạy kiểm tra quy chuẩn: `npm run prefilter -- src/client/3d/board_layout.tsx src/client/3d/miniature_city_diorama.tsx src/client/3d/diorama/diorama_traffic.tsx src/client/3d/diorama/diorama_harbor_cruiser.tsx src/client/3d/diorama/diorama_microlife.tsx`
- Kiểm tra bằng chứng trực quan: `npm run capture:visual -- --scenario board_ownership_monopoly` và `node scripts/check_evidence.mjs IMP-383`.

## 4. BIÊN GIỚI DỪNG & TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE)
1. 100% test contract trong `tests/client/imp383_diorama_mobile_useframe_purge.test.ts` đạt kết quả xanh (PASS).
2. Toàn bộ living test suites liên quan (`imp265_dual_platform_mobile_lod.test.ts`, `imp266_3_3d_lod_mobile_toggling.test.ts`) duy trì 100% độ tương thích AST mà không bị gãy vỡ.
3. Khi `isMobile = true`, không có bất kỳ `useSafeFrame` nào được đăng ký trong `DioramaTraffic`, `DioramaHarborCruiser`, `DioramaMicroLife`.
4. Khi `isVisible = false`, `useSafeFrame` trong các component động lập tức early return mà không tiêu tốn CPU chu kỳ.
5. Delta được kẹp an toàn `Math.min(delta, 0.1)` chống giật bước nhảy trên tab focus.
6. Tỷ lệ assertion density đạt chuẩn 1-4 asserts/test, zero dirty casts.
7. Tất cả tệp mã nguồn nằm nghiêm ngặt dưới ngưỡng trần Tier 2 (<= 500 LOC).
