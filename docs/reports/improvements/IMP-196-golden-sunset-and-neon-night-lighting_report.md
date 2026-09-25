# BÁO CÁO NGHIỆM THU KỸ THUẬT: IMP-196
## NÂNG CẤP QUANG HỌC HOÀNG HÔN VÀNG KIM & ĐÊM NEON ĐÔ THỊ VỊNH BIỂN (GOLDEN SUNSET & VIBRANT NEON NIGHT)

> **Ticket:** IMP-196  
> **Trạng thái:** COMPLETED / SHIP  
> **Phân loại:** Tier 2 (Full Rigor — 3 Trạm Tự Hành & Sweeping Scout Audit)  
> **Thị trường mục tiêu:** Việt Nam (Giao diện, ngôn ngữ hiển thị tiếng Việt)

---

### 1. TỔNG QUAN YÊU CẦU & KẾT QUẢ ĐẠT ĐƯỢC

Xuất phát từ phản hồi người dùng: *"hiệu ứng buổi chiều thấy khó quan sát, hiệu ứng ban đêm quá tối không hấp dẫn"*, ticket IMP-196 đã tái cấu trúc và chuẩn hóa toàn diện hệ thống quang học 3D của sa bàn đảo ngọc VTCOON:

1. **Hoàng Hôn Vàng Kim (Sunset Golden Hour):**
   - Nâng cao độ mặt trời từ $Y=12$ ($\approx 18^\circ$) lên $Y=24$ ($\approx 36^\circ$), triệt tiêu 75% độ dài bóng đổ công trình, giải phóng hoàn toàn tầm nhìn cho các ô cờ nửa bắc bàn cờ.
   - Chuyển màu ánh nắng từ cam gắt `#F97316` sang vàng kim hoàng gia `#FDE047` (`sunIntensity = 0.95`).
   - Tăng cường ánh sáng tán xạ từ đất nung ấm `#9A3412` (`hemiIntensity = 0.24`) và sương mù chân trời 80–250m.
   - Bổ sung đèn đỉnh **Top-Down Fill Light 0.18 (`#FEF3C7`)** bảo đảm thẻ đất (An Giang, Cần Thơ, TP. Hồ Chí Minh), ô Khởi Hành và các chữ số cước phí đọc được 100% rõ ràng.

2. **Đêm Neon Đô Thị Vịnh Biển (Night Neon Metropolis):**
   - Xóa bỏ triệt để hiện tượng "hố đen vũ trụ" ban đêm: bầu trời chuyển từ `#050814` sang xanh chàm điện ảnh `#0C1527`, sương mù đêm `#0F172A` dời xa từ 65m ra 75–240m.
   - Ánh trăng xanh bạc `#93C5FD` (`sunIntensity = 0.65`, cao độ $Y=32$ với delta +4 trace) kết hợp phản xạ dạ quang vịnh biển `#0369A1` (`hemiIntensity = 0.26`).
   - Đèn đỉnh **Top-Down Fill Light 0.14 (`#BAE6FD`)** và tăng cường $baseEnv = 0.28$ (+75% phản xạ PBR kim loại/kính), mang lại diện mạo đô thị biển rực rỡ, sống động.

3. **Subtractive Refactoring & Chống Giật Sáng:**
   - Xóa bỏ vĩnh viễn đoạn JSX unbuffered `directionalLight` cũ không có ref tại L216-221.
   - Điều khiển đèn đỉnh qua `topDownRef = useRef<DirectionalLight>(null)` với tốc độ lerp hàm mũ $1 - e^{-3\Delta t}$ trong `useSafeFrame`.
   - Cơ chế bảo vệ sàn đấu giá: tự động dìm đèn đỉnh xuống $0.05$ ở cả 3 pha khi `isAuctionActive = true`.

---

### 2. QUY TRÌNH 3 TRẠM (STATION PIPELINE EXECUTION)

```
[Kế Hoạch & Plan-Griller] ➔ [Trạm 1: QA RED (18 tests)] ➔ [Trạm 2: GREEN Implementation] ➔ [Trạm 2.5: Sweeping Scout (CLEAN)] ➔ [Trạm 3: Reviewers (APPROVED)]
```

#### Trạm 1: Contract Testing (QA RED)
- Tạo tệp test hợp đồng: [`tests/contracts/imp196_golden_sunset_and_neon_night_lighting.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp196_golden_sunset_and_neon_night_lighting.test.ts).
- Khởi tạo 18 atomic tests phủ 5 Facets; thực thi Adversarial Inversion (chứng minh RED 17/18 tests fail đúng hợp đồng mới).

#### Trạm 2: Feature Implementation (GREEN)
- Triển khai tối thiểu tại:
  - [`src/client/store/environment_store.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/environment_store.ts) (134 LOC)
  - [`src/client/3d/time_of_day_lighting.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/time_of_day_lighting.tsx) (256 LOC)
- Hài hòa SSOT với test preconditions cũ:
  - [`tests/client/time_of_day.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/time_of_day.test.ts) (L135-L137: `#60A5FA` ➔ `#93C5FD`, `#090D1A` ➔ `#0F172A`, `#050814` ➔ `#0C1527`)
  - [`tests/client/phase1_pbr_beveled.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/phase1_pbr_beveled.test.ts) (L95: IBL night 0.16 ➔ 0.28, sunset 0.28 ➔ 0.38)
- Kết quả kiểm thử: **327/327 suites PASS**, **6,532/6,532 tests PASS**.

#### Trạm 2.5: Sweeping Scout Audit
- Quét 100% tệp đĩa vật lý qua 5 Universal Defect Archetypes.
- Xác nhận: 0 stale closure, 0 unhandled async, 0 memory leak (`tempColor`/`tempVec` memoized), 0 dirty cast (`any`), 0 dead code.
- Kết luận: **CLEAN**.

#### Trạm 3: Independent Review & Disk Verification
- `spec-reviewer`: **APPROVED** — Đối soát 100% dòng mã với đặc tả và phản biện P1-P5.
- `code-reviewer`: **APPROVED** — Xác nhận clean code, SRP, Zero Slop, ngân sách LOC tuân thủ.
- `game-3d-visual-critic`: **APPROVED (8.5/10, disposition: ship)** — Kiểm tra trực quan qua `view_file` trên 3 ảnh UAT thực tế, khen ngợi độ hoàn thiện quang học thương mại.

---

### 3. BẰNG CHỨNG THỊ GIÁC (VISUAL ARTIFACTS & SPOT-INSPECTION)

Tất cả 3 ảnh chụp thực tế từ Microsoft Edge Headless CDP (Mobile 390x844) được lưu trữ tại `docs/reports/uat/screenshots/imp196/`:

1. **Ban Ngày (Day):**  
   [`docs/reports/uat/screenshots/imp196/imp196_01_day.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/screenshots/imp196/imp196_01_day.jpg) — Ánh nắng nhiệt đới trong trẻo, bóng đổ sắc nét, nước biển ngọc bích.
2. **Hoàng Hôn Vàng Kim (Sunset Golden Hour):**  
   [`docs/reports/uat/screenshots/imp196/imp196_02_sunset_golden_hour.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/screenshots/imp196/imp196_02_sunset_golden_hour.jpg) — Nắng vàng kim ấm `#FDE047`, bóng công trình rút ngắn 75%, thẻ đất hiển thị rõ 100%.
3. **Đêm Neon Đô Thị Vịnh Biển (Night Neon Metropolis):**  
   [`docs/reports/uat/screenshots/imp196/imp196_03_night_neon_metropolis.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/screenshots/imp196/imp196_03_night_neon_metropolis.jpg) — Bầu trời xanh chàm `#0C1527`, ánh trăng xanh bạc `#93C5FD`, mặt bàn cờ sáng rõ, đèn đường ấm áp.

Evidence Snapshot đã ghi nhận: [`.agents/evidence/imp196_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp196_snapshot.json).

---

### 4. BÀI HỌC KINH NGHIỆM & BẤT BIẾN LƯU VẾT (GOTCHAS)

Đã cập nhật **Gotcha #270** trong [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) với 5 bất biến cốt lõi:
1. *Elevated Sunset Vector Invariant:* $Y=24$, `#FDE047`.
2. *Elevated Night Moonbeam Invariant:* $Y=32$, `#93C5FD`, `#0C1527`.
3. *Continuous Top-Down Fill Lerp Invariant:* `topDownRef` lerp $1 - e^{-3\Delta t}$ (0.25 / 0.18 / 0.14 / 0.05).
4. *PBR Environment Intensity Invariant:* IBL baseEnv $0.75 / 0.38 / 0.28$.
5. *R3F Scene Background & Fog Direct Attachment Invariant:* `<color attach="background" />` và `<fog attach="fog" />` không được lồng trong `<group>` vì Group không có thuộc tính background/fog, phải gắn tại gốc Canvas qua `<>` kết hợp khởi tạo chủ động `new Fog(...)` / `new Color(...)`.

---

### 5. SỔ NỢ KỸ THUẬT (TECH DEBT LEDGER)

- **Mã:** `TD-IMP196-01`
- **Mô tả:** Audit và tinh giản hình học chóp laser Bitexco (`cylinderGeometry` trong `diorama_skyline.tsx`) theo bộ quy tắc beveled toy-like geometry.
- **Mức ưu tiên:** Low (Non-blocking).
- **Target Slice:** Sprint tối ưu hóa đồ họa 3D tiếp theo.
