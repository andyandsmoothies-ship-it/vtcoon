# BÁO CÁO GIÁM ĐỊNH ĐỘC LẬP & PHẢN BIỆN ĐỐI KHÁNG
## Forensic Audit & Adversarial Critique: IMP-426 Coastal Sanctuary Diorama Desktop Exposure & Placebo Elimination

> **Mã Báo Cáo:** `CRITIQUE-IMP-426-FORENSIC-01`  
> **Ticket Mục Tiêu:** `IMP-426` (Phân hệ: `client-3d`)  
> **Tài Liệu Thẩm Tra:** [`docs/reports/improvements/IMP-426-coastal-sanctuary-desktop-exposure_report.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/improvements/IMP-426-coastal-sanctuary-desktop-exposure_report.md)  
> **Chuyên Viên Giám Định:** Senior Independent Forensic & Adversarial Auditor  
> **Ngày Giám Định:** 2026-10-16  
> **Phán Quyết Tổng Thể:** ⚖️ **APPROVED WITH OBSERVATIONS (CHẤP THUẬN KỸ THUẬT - YÊU CẦU HIỆU CHỈNH HÌNH THỨC & VỆ SINH BÁO CÁO)**

---

## 1. TỔNG QUAN GIÁM ĐỊNH & BỐI CẢNH

Ticket `IMP-426` giải quyết một vấn đề kiến trúc nghiêm trọng tồn đọng từ `IMP-420`: **"Hiệu ứng Giả dược" (Placebo Fix)**. Trong `IMP-420`, mặc dù mã nguồn đã định nghĩa sa bàn 4 bán đảo (`DEFAULT_BALANCED_ISLAND_DIORAMA`), cao nguyên cỏ xanh `#22C55E` và bờ cát ngà vát nghiêng 15 độ, tham số `streamlined` trong [`coastal_island_environment.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_island_environment.tsx) lại bị gán cứng mặc định là `true`. Hệ quả là trên môi trường Desktop thực tế, toàn bộ sa bàn 3D ngoại vi bị ẩn 100% mà không một bài test nào phát hiện ra cho đến khi thực hiện giám định độc lập.

Báo cáo này tiến hành đối chiếu 1:1 giữa báo cáo nghiệm thu của `IMP-426`, hiện trạng Git vật lý, bằng chứng kiểm thử tự động, và phản hồi thị giác thực tế trên thiết bị di động (qua ảnh chụp màn hình đính kèm của người dùng).

---

## 2. ĐÁNH GIÁ CÁC ĐIỂM SÁNG KIẾN TRÚC & KỸ THUẬT (STRENGTHS)

### 2.1. Loại Bỏ Triệt Để Hiệu Ứng Giả Dược Bằng Suy Diễn Động
Thay vì gán cứng một giá trị cờ tĩnh, `IMP-426` áp dụng cơ chế suy diễn mặc định động:
```typescript
const streamlined = propStreamlined ?? isMobile;
```
- **Trên Desktop (`isMobile: false`)**: Khi không truyền prop `streamlined`, hệ số tự động chuyển sang `false`, bung mở trọn vẹn 4 bán đảo, cao nguyên cỏ và 92 cây cọ trên môi trường máy tính mà trước đây bị che khuất.
- **Trên Mobile (`isMobile: true`)**: Giữ nguyên trạng thái tinh gọn (`streamlined === true`), cắt bỏ toàn bộ hình học ngoại vi phức tạp, bảo toàn nguyên vẹn ngân sách GPU TBDR (Tile-Based Deferred Rendering) trên chip di động và chống tràn khung nhìn hẹp 360px.

### 2.2. Nối Dây Call-Site Trực Giao & Cách Ly Nền Tảng (Platform DI Isolation)
- Tại [`src/client/3d/board_layout.tsx#L173`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_layout.tsx#L173):
  ```tsx
  <CoastalIslandEnvironment
    isMobile={isMobile}
    streamlined={!tierProfile.enableOuterBaySanctuaries}
  />
  ```
  Mã nguồn đã tách biệt rạch ròi giữa bản sắc phần cứng (`isMobile`) và quyết định hiển thị sa bàn ngoại vi (`streamlined`), không còn đánh đồng năng lực phần cứng với cờ tính năng môi trường.
- Tại [`src/client/3d/sunny_island_lobby_scene.tsx#L298`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/sunny_island_lobby_scene.tsx#L298):
  Khắc phục lỗ hổng không truyền prop (vốn khiến component rơi về fallback browser sniffer `isPhoneHardware()`), nối dây tường minh:
  ```tsx
  <CoastalIslandEnvironment isMobile={isMobile} streamlined={isMobile} />
  ```

### 2.3. Bảo Vệ Living Test & Vệ Sinh Bảng Màu SSR (Living Test Preservation)
Khi mở sa bàn trên Desktop, component [`TrainStationLandmark`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_island_landmarks.tsx) lần đầu tiên được kích hoạt trong môi trường SSR test. Do đường ray dùng màu `#94A3B8`, nó đã kích hoạt lỗi hồi quy hợp đồng với test sống `TC-399.06b` (nghiêm cấm xuất hiện token `#94A3B8` trong SSR markup). Đội ngũ triển khai đã chủ động đổi màu đường ray sang `#64748B` (thép không gỉ), giúp bảo toàn 100% hợp đồng kiểm thử sống mà không sửa đổi bất kỳ dòng assert nào của living test.

### 2.4. Hiệu Quả Sát Thủ Của Chaos Sentinel
Bộ thăm dò đột biến AST [`scripts/sentinel_probes/IMP-426.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/scripts/sentinel_probes/IMP-426.json) kiểm tra toàn bộ 25 mutant trên cả nhánh Desktop và Mobile:
- **Kết quả**: 25/25 mutants bị tiêu diệt (Kill Rate: 100%, 0 survived).
- Bộ kiểm thử hợp đồng [`tests/client/imp426_coastal_sanctuary_desktop_exposure.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp426_coastal_sanctuary_desktop_exposure.test.ts) đạt 11/11 tests pass chỉ trong 201ms.

---

## 3. CÁC BẤT CẬP, KHIẾM KHUYẾT & ĐIỂM MÙ ĐỐI KHÁNG (FINDINGS & DEFECTS)

Qua quá trình đối soát vật lý và phân tích hình ảnh thực tế từ thiết bị người dùng, cơ quan giám định phát hiện **3 bất cập cụ thể**:

```
+--------------------------------------------------------------------------------------------------+
|                              MA TRẬN PHÁT HIỆN BẤT CẬP IMP-426                                   |
+----+--------------------------------+--------------------+---------------------+-----------------+
| STT| Bất Cập / Lỗ Hổng              | Mức Độ Nghiêm Trọng| Phân Vùng Ảnh Hưởng | Trạng Thái      |
+----+--------------------------------+--------------------+---------------------+-----------------+
| 01 | Lệch pha số tệp Git (13 vs 5)  | Trung bình (Med)   | Mục 4.1 Báo Cáo     | Cần bổ sung bảng|
| 02 | Vỡ bảng Markdown trên Mobile   | Cao (High)         | Trải nghiệm đọc UI  | Cần format lại  |
| 03 | Boilerplate Slop tại Trạm 3.2  | Trung bình (Med)   | Dòng 29 & 90 Báo Cáo| Cần gỡ bỏ       |
+----+--------------------------------+--------------------+---------------------+-----------------+
```

### 3.1. Bất Cập 1: Lệch Pha Số Lượng Tệp Biến Động Giữa Git Thực Tế Và Báo Cáo Nghiệm Thu
- **Hiện tượng thực tế**: Trên ảnh chụp màn hình của người dùng, giao diện thông báo Git ghi nhận:
  > `13 files changed +479 -21`
- **Nội dung trong Báo cáo**: Bảng 4.1 ("Phạm Vi Trực Tiếp Của Ticket IMP-426") chỉ liệt kê đúng **5 tệp** (4 tệp production + 1 tệp living test).
- **Phân tích nguyên nhân đĩa vật lý**:
  8 tệp còn lại trong commit thực chất là các tệp bằng chứng, kế hoạch và công cụ kiểm soát quy trình:
  1. `.agents/plans/PLAN_IMP_426_COASTAL_SANCTUARY_DESKTOP_EXPOSURE.md`
  2. `.agents/audit/PLAN_AUDIT_IMP-426.md`
  3. `.agents/audit/PLAN_CHALLENGE_IMP-426.md`
  4. `.agents/audit/SPEC_REVIEW_IMP-426.md`
  5. `.agents/audit/CODE_REVIEW_IMP-426.md`
  6. `.agents/audit/3D_VISUAL_REVIEW_IMP-426.md`
  7. `scripts/sentinel_probes/IMP-426.json`
  8. `.agents/evidence/chaos_sentinel_IMP-426.json`
- **Đánh giá rủi ro**: Việc báo cáo chỉ thống kê phạm vi trực tiếp (Direct Scope) mà thiếu bảng giải trình tệp siêu dữ liệu quy trình (Harness Metadata Scope) gây cảm giác "giấu tệp" hoặc số liệu không khớp khi người dùng nhìn vào Git Summary.

### 3.2. Bất Cập 2: Lỗi Bóp Nghẹt Cột Bảng Markdown Trên Giao Diện Di Động (`u r e . t e s t . t s`)
- **Hiện tượng thực tế**: Trên màn hình điện thoại của người dùng (chiều rộng viewport ~360px-390px), cột tên tệp kiểm thử bị chèn ép tới mức rơi từng chữ cái theo chiều dọc:
  ```text
  u
  r
  e
  .
  t
  e
  s
  t
  .
  t
  s
  ```
- **Nguyên nhân kỹ thuật**:
  Bảng thống kê tại Mục 4.1 có tới **7 cột** (`Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái`), kèm theo các chuỗi ký tự dài không có khoảng trắng như `imp426_coastal_sanctuary_desktop_exposure.test.ts` (48 ký tự) và đường dẫn file Markdown.
  Khi hiển thị trên webview/chat di động không hỗ trợ thanh cuộn ngang độc lập cho table, trình duyệt buộc phải nén các cột có độ ưu tiên thấp xuống mức tối thiểu (1 ký tự / dòng), làm biến dạng hoàn toàn bảng biểu.
- **Rủi ro công thái học**: Trực tiếp phá vỡ quy chuẩn đọc báo cáo trên thiết bị di động của các bên liên quan.

### 3.3. Bất Cập 3: Rác Ngôn Từ & Tạp Niệm Sao Chép Khuôn Mẫu Tại Trạm 3.2 (UI Craft Slop)
- **Hiện tượng thực tế**:
  - Tại Dòng 29: `| **Trạm 3.2: UI/UX Craft Review** | ... | Công thái học touch target, khoảng cách an toàn (clearance), không tràn viền màn hình 360px |`
  - Tại Dòng 90: `- Đảm bảo khoảng cách an toàn trên màn hình Desktop và Mobile 360px, chuẩn hóa vùng cảm ứng phím bấm.`
- **Phản biện đối kháng gay gắt**:
  Ticket `IMP-426` là một ticket thuần túy về **hình học không gian sa bàn 3D (3D Mesh Diorama)** gồm bán đảo cỏ, bãi cát vát nghiêng, đường ray xe lửa và mặt nước. Trong toàn bộ mã nguồn của ticket này:
  - **KHÔNG HỀ CÓ NÚT BẤM (BUTTON)**.
  - **KHÔNG HỀ CÓ VÙNG CẢM ỨNG (TOUCH TARGET)**.
  - **KHÔNG HỀ CÓ TƯƠNG TÁC CHẠM TAY NÀO ĐƯỢC CHUẨN HÓA**.
- **Đánh giá vi phạm**: Đây là hành vi sao chép cơ học cụm từ rập khuôn ("chuẩn hóa vùng cảm ứng phím bấm") từ các ticket UI 2D Modal/HUD mà không đọc lại ngữ cảnh thực tế của ticket 3D. Điều này vi phạm trực tiếp **Zero-Boilerplate Audit Invariant** và **Main Agent Pre-Delivery 1:1 Self-Audit Gate** được quy định trong `GEMINI.md`.

---

## 4. MA TRẬN ĐỐI SOÁT VẬT LÝ TRÊN ĐĨA (PHYSICAL DISK VERIFICATION)

| Đường Dẫn Tệp Thực Tế | Kích Thước (Bytes) | SLOC | Số Lượng Callers Trong Dự Án | Trạng Thái Kiểm Tra |
| :--- | :---: | :---: | :---: | :---: |
| [`src/client/3d/coastal_island_environment.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_island_environment.tsx) | 12,238 B | 283 | 2 callers (`board_layout`, `sunny_island_lobby_scene`) | ✅ 100% Khớp Hợp Đồng |
| [`src/client/3d/board_layout.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_layout.tsx) | 9,842 B | 230 | 1 caller (`game_canvas`) | ✅ 100% Khớp Hợp Đồng |
| [`src/client/3d/sunny_island_lobby_scene.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/sunny_island_lobby_scene.tsx) | 12,450 B | 280 | 1 caller (`lobby_scene`) | ✅ 100% Khớp Hợp Đồng |
| [`src/client/3d/coastal_island_landmarks.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_island_landmarks.tsx) | 9,120 B | 234 | 2 callers (`coastal_island_environment`, tests) | ✅ 100% Đã Đổi `#64748B` |
| [`tests/client/imp426_coastal_sanctuary_desktop_exposure.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp426_coastal_sanctuary_desktop_exposure.test.ts) | 9,679 B | 171 | 11 tests, 31 asserts, 0 loops | ✅ 11/11 Passed (201ms) |

---

## 5. KẾT LUẬN & CHỈ THỊ KHẮC PHỤC (REMEDIATION DIRECTIVES)

### 5.1. Phán Quyết Tổng Thể
> **KẾT QUẢ: ⚖️ APPROVED WITH OBSERVATIONS (CHẤP THUẬN KỸ THUẬT - YÊU CẦU CHỈNH SỬA BÁO CÁO)**  
> Bản thân giải pháp kỹ thuật, cấu trúc mã nguồn 3D và hệ thống kiểm thử tự động của `IMP-426` đạt chất lượng xuất sắc, loại bỏ hoàn toàn lỗi giả dược và bảo vệ trọn vẹn living test. Tuy nhiên, khâu trình bày báo cáo nghiệm thu và biên bản review Trạm 3.2 còn tồn tại cẩu thả về mặt khuôn mẫu và khả năng tương thích hiển thị trên di động.

### 5.2. Chỉ Thị Hành Động Cụ Thể (Actionable Directives)
1. **Chỉ thị 1 (Vệ sinh Báo cáo Nghiệm thu)**:
   - Hiệu chỉnh Dòng 29 và Dòng 90 trong [`IMP-426-coastal-sanctuary-desktop-exposure_report.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/improvements/IMP-426-coastal-sanctuary-desktop-exposure_report.md): Thay thế cụm từ rác *"chuẩn hóa vùng cảm ứng phím bấm, công thái học touch target"* bằng đúng bản chất kỹ thuật: *"Kiểm tra góc nhìn camera frustum, khoảng cách an toàn (clearance), không gây nghẽn rendering trên thiết bị di động"*.
2. **Chỉ thị 2 (Giải trình 13 Files)**:
   - Bổ sung Bảng 4.2 trong báo cáo nghiệm thu để liệt kê rõ 8 tệp quy trình/bằng chứng (Harness/Evidence Files), giải tỏa hoàn toàn sự chênh lệch giữa Git Summary (`13 files changed`) và bảng mã nguồn chính (`5 files`).
3. **Chỉ thị 3 (Quy chuẩn Bảng Markdown Thân Thiện Với Mobile)**:
   - Trong script sinh báo cáo (`scripts/report/report_markdown_renderer.mjs`), chuẩn hóa các bảng thống kê có trên 5 cột: Chuyển sang định dạng bảng gộp hoặc rút ngắn tên tệp, tránh để chuỗi ký tự không ngắt dài hơn 25 ký tự làm vỡ layout trên màn hình hẹp.

---
*Biên bản giám định đối kháng được lập và lưu trữ chính thức tại `docs/reports/audits/ADVERSARIAL_CRITIQUE_IMP426_COASTAL_SANCTUARY_DESKTOP_EXPOSURE.md`.*
