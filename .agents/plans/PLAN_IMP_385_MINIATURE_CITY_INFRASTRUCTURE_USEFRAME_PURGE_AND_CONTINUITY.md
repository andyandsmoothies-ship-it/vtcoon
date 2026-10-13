# KẾ HOẠCH TRIỂN KHAI IMP-385: MINIATURE CITY INFRASTRUCTURE & SKYLINE USEFRAME PURGE & CONTINUITY (INFRASTRUCTURE SLICE)

## 1. MỤC TIÊU & BỐI CẢNH (HARDENED THEO BÁO CÁO PHẢN BIỆN ADV-01..ADV-05 & BẢN GIA CỐ KIẾN TRÚC)
- **Mục tiêu**: Hoàn tất 100% việc loại bỏ đăng ký vòng lặp `useFrame`/`useSafeFrame` vô ích trên thiết bị di động (`isMobile = true`) và dừng tính toán hoạt họa khi nhóm sa bàn bị ẩn (`isVisible = false`) cho toàn bộ 5 phân hệ hạ tầng đô thị còn lại trong `MiniatureCityDiorama` (Tuyến đường sắt Metro `DioramaModelRailroad`, Cảng container Cát Lái `DioramaContainerPort`, Bến du thuyền & Chim bồ câu `DioramaMarina`/`DioramaPerchingBirds`, Cầu Ba Son `DioramaBridges`, và Tháp Landmark Skyline `DioramaSkyline`).
- **Phạm vi bảo toàn & Kiến trúc gia cố**:
  - **Khắc phục bẫy kẹt đèn Bitexco ban ngày (ADV-01)**: Thêm khai báo `visible={isNight}` trên `<mesh ref={beaconRef}>` trong JSX và mount `DioramaSkylineFrameLoop` theo điều kiện `{!isMobile && isNight && <DioramaSkylineFrameLoop ... />}`, triệt tiêu hoàn toàn lỗi đèn chớp cảnh báo hàng không phát sáng giữa ban ngày trên cả mobile và desktop.
  - **Triệt tiêu bẫy kiểm thử hình thức qua duyệt cây nông (ADV-02)**: Thay vì kiểm tra `captureTree(MiniatureCityDiorama)` cho các component con không đầu (vốn luôn trả về `null` trong AST nông), bộ kiểm thử hợp đồng sẽ probe trực tiếp từng component hạ tầng với cả hai cấu hình `isMobile: true` (FrameLoop không mount) và `isMobile: false` (FrameLoop mount), đồng thời kiểm tra sự truyền prop đầy đủ tại call-site `MiniatureCityDiorama`.
  - **Đồng bộ biến tích lũy delta an toàn $C^0$ & Chống rác mã nguồn (ADV-03)**: Áp dụng cơ chế tích lũy thời gian `timeAccumRef.current += Math.min(delta, 0.1)` đồng bộ trên cả 3 phân hệ động cơ học: Tuyến xe lửa Metro, Cẩu cảng container, và Bến du thuyền. Nghiêm cấm khai báo biến thừa `wasVisibleRef` nếu không dùng, triệt tiêu 100% unwired mutations.
  - **Bảo tồn tọa độ desktop trên chim bồ câu tránh gãy Living Test TC-337.14 (ADV-04)**: Giữ nguyên cơ chế tọa độ `position={isMobile ? [spot.x, spot.y, spot.z] : undefined}` và sự kiện `onPointerDown={handlePointerDown}` trên root `<group>` của `DioramaPerchingBirds`, ngăn chặn R3F reconciler snap gây hồi quy living test.
  - **Triệt tiêu vòng lặp ban ngày và hoàn nguyên màu LED Cầu Ba Son (ADV-05)**: Mount `DioramaBridgesFrameLoop` theo điều kiện `{!isMobile && isNight && <DioramaBridgesFrameLoop ... />}`. Khi chuyển sang ban ngày (`isNight = false`), component unmount và kích hoạt cleanup hoàn nguyên màu LED về `#06B6D4` và emissive `#00F5FF`, triệt tiêu hiện tượng kẹt màu đêm.
  - **Tuân thủ Thiết luật Graphics Fixture**: Bắt buộc sử dụng centralized test seam `tests/helpers/r3f_test_harness.ts`, nghiêm cấm tạo bespoke `vi.mock('@react-three/fiber')`.

## 2. BẢNG KÊ KHAI LOC TRUNG THỰC (HONEST LOC TABLE)
| File | Tier | Current LOC | Expected LOC | Net Delta | Max Budget | Status |
| `src/client/3d/miniature_city_diorama.tsx` | Tier 2 | 368 | 374 | +6 | 500 | Modifying |
| `src/client/3d/diorama/diorama_railroad.tsx` | Tier 2 | 376 | 390 | +14 | 500 | Modifying |
| `src/client/3d/diorama/diorama_container_port.tsx` | Tier 2 | 238 | 252 | +14 | 500 | Modifying |
| `src/client/3d/diorama/diorama_marina.tsx` | Tier 2 | 194 | 208 | +14 | 500 | Modifying |
| `src/client/3d/diorama/diorama_perching_birds.tsx` | Tier 2 | 267 | 280 | +13 | 500 | Modifying |
| `src/client/3d/diorama/diorama_bridges.tsx` | Tier 2 | 338 | 352 | +14 | 500 | Modifying |
| `src/client/3d/diorama/diorama_skyline.tsx` | Tier 2 | 387 | 399 | +12 | 500 | Modifying |
| `tests/client/imp385_diorama_infrastructure_useframe_purge.test.ts` | Test | 0 | 195 | +195 | 600 | New file |
| `docs/FEATURE_MAP.md` | Doc | 93 | 93 | 0 | 800 | Modifying |

## 3. CHI TIẾT THAY ĐỔI THEO CÁC TRẠM

### Trạm 1 (RED): Hợp đồng kiểm thử Contract Test
**Target physical file**: `tests/client/imp385_diorama_infrastructure_useframe_purge.test.ts` (New file)
- **Quy chuẩn Fixture Đồ họa**: Bắt buộc sử dụng centralized test seam `tests/helpers/r3f_test_harness.ts` (`sharedR3FHarness`, `createR3FMock`). Tuyệt đối cấm tạo bespoke `vi.mock('@react-three/fiber')`.
- TC-385.01: [UC-IMP385/MSS] Given MiniatureCityDiorama với isMobile=true và isVisible=false, When render cây sa bàn đô thị, Then MiniatureCityDiorama truyền đúng isMobile và isVisible đến 5 component hạ tầng con.
- TC-385.02: [UC-IMP385/MSS] Given DioramaModelRailroad với isMobile=true, When captureTree component DioramaModelRailroad, Then DioramaModelRailroadFrameLoop không được mount và các toa xe có carriageY=0.488 bảo tồn living test TC-228 và TC-230.
- TC-385.03: [UC-IMP385/MSS] Given DioramaContainerPort với isMobile=true, When captureTree component DioramaContainerPort, Then DioramaContainerPortFrameLoop không được mount và cẩu cảng hiển thị tại tọa độ tĩnh ban đầu.
- TC-385.04: [UC-IMP385/MSS] Given DioramaMarina với isMobile=true, When captureTree component DioramaMarina, Then DioramaMarinaFrameLoop không được mount và bến du thuyền hiển thị tại tọa độ tĩnh.
- TC-385.05: [UC-IMP385/MSS] Given DioramaPerchingBirds với isMobile=false, When captureTree component DioramaPerchingBirds, Then position trên các nhóm chim là undefined bảo tồn living test TC-337.14.
- TC-385.06: [UC-IMP385/MSS] Given DioramaSkyline với isMobile=true, When captureTree component DioramaSkyline, Then DioramaSkylineFrameLoop không được mount và đèn Bitexco mang prop visible={isNight} tránh kẹt sáng ban ngày.
- TC-385.07: [UC-IMP385/MSS] Given DioramaBridges ban ngày (isNight=false), When render DioramaBridges trên desktop, Then DioramaBridgesFrameLoop không được mount nhằm triệt tiêu callback nhàn rỗi ban ngày.
- TC-385.08: [UC-IMP385/A1] Given DioramaModelRailroadFrameLoop khi isVisible=false, When useSafeFrame callback nhận nhịp tick, Then hàm trả về sớm mà không làm tăng biến tích lũy thời gian timeAccumRef.
- TC-385.09: [UC-IMP385/A2] Given DioramaContainerPortFrameLoop khi isVisible=false, When useSafeFrame callback nhận nhịp tick, Then hàm trả về sớm mà không làm tăng biến tích lũy thời gian timeAccumRef.
- TC-385.10: [UC-IMP385/A3] Given DioramaModelRailroadFrameLoop nhận delta lớn sau khi resume tab (delta = 2.5s), When useSafeFrame xử lý, Then delta được kẹp tối đa 0.1s bảo vệ tính liên tục C0 của tuyến metro.
- TC-385.11: [UC-IMP385/A4] Given DioramaModelRailroadFrameLoop đang ở trạng thái ẩn (isVisible=false), When isVisible chuyển thành true và nhận nhịp tick kế tiếp, Then tàu chuyển động mượt mà từ đúng tọa độ đã dừng bảo toàn tính liên tục C0.

### Trạm 2 (GREEN): Thực thi mã nguồn sản xuất

#### Điểm Tích Hợp & Call-Site Wiring
1. **Target physical file**: `src/client/3d/miniature_city_diorama.tsx`
   - Truyền `isVisible={isVisible}` xuống `<DioramaModelRailroad isMobile={isMobile} isVisible={isVisible} />`.
   - Truyền `isVisible={isVisible}` xuống `<DioramaBridges isMobile={isMobile} isVisible={isVisible} />`.
   - Truyền `isVisible={isVisible}` xuống `<DioramaContainerPort isMobile={isMobile} isVisible={isVisible} />`.
   - Truyền `isVisible={isVisible}` xuống `<DioramaMarina isMobile={isMobile} isVisible={isVisible} />`.
   - Truyền `isVisible={isVisible}` xuống `<DioramaSkyline isMobile={isMobile} isVisible={isVisible} />`.

2. **Target physical file**: `src/client/3d/diorama/diorama_railroad.tsx`
   - Giữ nguyên `DioramaModelRailroad` trả về `<group>` và đường ray/toa tàu trực tiếp trong JSX root.
   - Trích xuất vòng lặp sang headless component `DioramaModelRailroadFrameLoop`, chỉ mount khi `!isMobile`.
   - Trong `DioramaModelRailroadFrameLoop`: kẹp delta `Math.min(delta, 0.1)`, tích lũy `timeAccumRef.current`, dừng sớm khi `!isVisible`. Không khai báo biến chết `wasVisibleRef`.

3. **Target physical file**: `src/client/3d/diorama/diorama_container_port.tsx`
   - Giữ nguyên `DioramaContainerPort` trả về `<group>` và cẩu cảng trực tiếp trong JSX root.
   - Trích xuất vòng lặp sang headless component `DioramaContainerPortFrameLoop`, chỉ mount khi `!isMobile`.
   - Trong `DioramaContainerPortFrameLoop`: kẹp delta `Math.min(delta, 0.1)`, tích lũy `timeAccumRef.current`, dừng sớm khi `!isVisible`. Không khai báo biến chết `wasVisibleRef`.

4. **Target physical file**: `src/client/3d/diorama/diorama_marina.tsx`
   - Giữ nguyên `DioramaMarina` trả về `<group>` và bến du thuyền trực tiếp trong JSX root.
   - Trích xuất vòng lặp sang headless component `DioramaMarinaFrameLoop`, chỉ mount khi `!isMobile`.
   - Trong `DioramaMarinaFrameLoop`: kẹp delta `Math.min(delta, 0.1)`, tích lũy `timeAccumRef.current`, dừng sớm khi `!isVisible`. Không khai báo biến chết `wasVisibleRef`.
   - Truyền `isVisible={isVisible}` vào `<DioramaPerchingBirds isMobile={isMobile} isVisible={isVisible} />`.

5. **Target physical file**: `src/client/3d/diorama/diorama_perching_birds.tsx`
   - Nhận prop `isVisible = true`. Bảo toàn `position={isMobile ? [spot.x, spot.y, spot.z] : undefined}` và `onPointerDown={handlePointerDown}` trên `<group>`.
   - Trích xuất vòng lặp sang headless component `DioramaPerchingBirdsFrameLoop`, chỉ mount khi `!isMobile`.
   - Trong `DioramaPerchingBirdsFrameLoop`: dừng sớm khi `!isVisible`.

6. **Target physical file**: `src/client/3d/diorama/diorama_bridges.tsx`
   - Nhận prop `isVisible = true`.
   - Trích xuất vòng lặp sang headless component `DioramaBridgesFrameLoop`, chỉ mount khi `!isMobile && isNight`.
   - Trong `DioramaBridgesFrameLoop`: dừng sớm khi `!isVisible`. Trong `useEffect` cleanup khi unmount (hết đêm), hoàn nguyên màu của `basonLedRef1` và `basonLedRef2` về màu ban ngày `#06B6D4` và emissive `#00F5FF`.

7. **Target physical file**: `src/client/3d/diorama/diorama_skyline.tsx`
   - Khai báo prop `visible={isNight}` trên `<mesh ref={beaconRef}>`.
   - Trích xuất vòng lặp sang headless component `DioramaSkylineFrameLoop` tinh gọn (<= 15 dòng, giữ tổng file < 400 LOC), chỉ mount khi `!isMobile && isNight`.
   - Trong `DioramaSkylineFrameLoop`: dừng sớm khi `!isVisible`.

8. **Target physical file**: `docs/FEATURE_MAP.md`
   - Cập nhật Pillar 13 ghi nhận hoàn thành 100% việc purge `useSafeFrame` cho toàn bộ sa bàn đô thị trung tâm.

### Trạm 3 & 4: Kiểm chứng cơ học & Bằng chứng thực tế
- Chạy kiểm thử: `npx --yes vitest run tests/client/imp385_diorama_infrastructure_useframe_purge.test.ts`
- Chạy kiểm thử hồi quy: `npx --yes vitest run tests/contracts/imp228_elevated_metro_and_watercraft_navigation.test.ts tests/contracts/imp230_organic_curved_viaduct.test.ts tests/client/urban_diorama_redesign.test.ts tests/contracts/imp197_diorama_ground_modernization.test.ts tests/client/imp337_diorama_mobile_freezing.test.ts`
- Chạy kiểm tra quy chuẩn: `npm run prefilter -- src/client/3d/miniature_city_diorama.tsx src/client/3d/diorama/diorama_railroad.tsx src/client/3d/diorama/diorama_container_port.tsx src/client/3d/diorama/diorama_marina.tsx src/client/3d/diorama/diorama_perching_birds.tsx src/client/3d/diorama/diorama_bridges.tsx src/client/3d/diorama/diorama_skyline.tsx`
- Kiểm tra bằng chứng trực quan: `npm run capture:visual -- --scenario board_ownership_monopoly` và `node scripts/check_evidence.mjs IMP-385`.

## 4. BIÊN GIỚI DỪNG & TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE)
1. 100% test contract trong `tests/client/imp385_diorama_infrastructure_useframe_purge.test.ts` đạt kết quả xanh (PASS).
2. Toàn bộ living test suites liên quan duy trì 100% độ tương thích AST mà không bị gãy vỡ.
3. Khi `isMobile = true`, không có bất kỳ `useSafeFrame` nào được đăng ký trong toàn bộ 8 component động của `MiniatureCityDiorama`.
4. Khi `isVisible = false`, tất cả vòng lặp frame loop lập tức early return mà không tiêu tốn chu kỳ CPU.
5. Tuyến xe lửa metro chuyển động mượt mà và delta được kẹp an toàn `Math.min(delta, 0.1)` chống giật bước nhảy trên tab focus.
6. Tỷ lệ assertion density đạt chuẩn 1-4 asserts/test, zero dirty casts.
7. Tất cả tệp mã nguồn nằm nghiêm ngặt dưới ngưỡng trần Tier 2 (<= 500 LOC), tệp `diorama_skyline.tsx` được giữ dưới 400 LOC.
