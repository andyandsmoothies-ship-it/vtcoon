# ⚔️ BÁO CÁO PHẢN BIỆN ĐỐI KHÁNG & GIÁM ĐỊNH KỸ THUẬT: TICKET IMP-354
## CAMERA PACING & BOT TURN STABILIZATION: PHÂN TÍCH RỦI RO KIẾN TRÚC, LỖ HỔNG DỮ LIỆU & BẪY KIỂM THỬ TĨNH

> **Mã hồ sơ:** `ADVERSARIAL-CRITIQUE-IMP-354`  
> **Đối tượng thẩm định:** [`docs/reports/improvements/IMP-354-bot-camera-stabilization_report.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/improvements/IMP-354-bot-camera-stabilization_report.md)  
> **Phân hệ thực tế:** `client-3d` (Kinematics & Presentation Layer)  
> **Ngày lập báo cáo:** 2026-10-10  
> **Căn cứ pháp lý & quy chuẩn:** Hiến pháp [`GEMINI.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/GEMINI.md), Cẩm nang [`docs/ai_native_sdlc_master_guide.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/ai_native_sdlc_master_guide.md), Gotcha 10 ([R3F Transient Unmount](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/3d_cinematics.md)), Gotcha 13 ([Physical Action Evidence](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/3d_cinematics.md)), Gotcha 15 ([Spatial Kinematics](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/3d_cinematics.md)), và Gotcha VIII ([Deep Module Design](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/deep_modules.md)).  
> **Phán quyết tổng thể:** 🟡 **CONDITIONAL_PASS (THÔNG QUA CÓ ĐIỀU KIỆN)** — Bản chất giải pháp cơ học chính xác, nhưng bắt buộc khắc phục 3 lỗi biên tập dữ liệu và cập nhật đăng ký Sổ Cái Nợ Kỹ Thuật trước khi đóng ticket.

---

## 0. BẢNG MA TRẬN ĐÁNH GIÁ LỖ HỔNG & TỬ HUYỆT (DEFECT & VULNERABILITY MATRIX)

| STT | Khía Cạnh | Lỗ Hổng / Bẫy Kỹ Thuật Phát Hiện | Mức Độ | Hệ Quả Thực Tế Trên Môi Trường Production |
|:---:|:---|:---|:---:|:---|
| **1** | **Biên tập / Báo cáo** | Đường dẫn Markdown tại dòng 46 bị đứt gãy (`file:///.../src/`). | 🟡 Medium | Gãy liên kết điều hướng trực tiếp trên IDE/GitHub, giảm tính tin cậy của tài liệu nghiệm thu. |
| **2** | **Biên tập / Báo cáo** | Lỗi copy-paste tại mục Nợ Kỹ Thuật (dòng 132 sao chép ví dụ tách `checkHighStakesRoll` của dòng 133). | 🟡 Medium | Gây nhầm lẫn cấu trúc: `checkHighStakesRoll` là của FSM (Tier 1), không thuộc Component UI (Tier 2). |
| **3** | **Kiểm toán / Dữ liệu** | Lệch pha số liệu LOC giữa Báo cáo (450, 304) và các Biên bản Thẩm định Trạm 3 (`SPEC_REVIEW`, `CODE_REVIEW` ghi 451, 305). | 🟢 Low | Bất nhất dữ liệu trong chuỗi kiểm toán cơ học (sai số 1 dòng do ký tự xuống dòng của prettier/linter). |
| **4** | **Kiến trúc / Runtime** | Cạm bẫy ngầm từ Optional Parameter `isTargetOwnedByHuman?: boolean` (Silent Fallback về `pawn_chase`). | 🔴 High | Nếu callers mới trong tương lai quên truyền tham số này, hệ thống sẽ âm thầm thoái hóa về lỗi giật lắc cũ. |
| **5** | **Đồ họa / Trải nghiệm** | Đánh đổi UX: Mất dấu vị trí quân cờ Bot (Pawn Readability Loss) ở góc nhìn bao quát độ cao 25.3m trên màn hình dọc 360px. | 🟠 Warning | Quân cờ chỉ hiển thị ~8-12px, người chơi dễ mất phương hướng về điểm đáp của bot nếu thiếu vệt sáng bổ trợ. |
| **6** | **Kiểm thử / Vòng đời** | Bẫy kiểm thử tĩnh (Solitary Mocking Trap) - thiếu kịch bản kiểm thử tích hợp chuỗi nhiều lượt Bot liên tiếp với runtime `useFrame`. | 🟠 Warning | Chưa kiểm chứng trực tiếp bằng code assertions xem `softReturnRef.current` có thực sự sống sót qua 3 lượt bot liên tiếp không. |

---

## 1. PHÂN BIỆN TÍNH TOÀN VẸN CỦA BÁO CÁO NGHIỆM THU (REPORT INTEGRITY)

### 1.1. Lỗi Cú pháp & Đường dẫn Đứt gãy (Broken Markdown Anchor)
Tại dòng 46 của tệp báo cáo [`IMP-354-bot-camera-stabilization_report.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/improvements/IMP-354-bot-camera-stabilization_report.md#L46):
```markdown
46: - **Physical Surface Area Exhausted?**: *Yes**. Lệnh `grep_search` xác nhận toàn bộ `src/**` chỉ có duy nhất 1 nơi tiêu thụ `resolveCameraMode` trong production là [`src/client/3d/adaptive_cinematic_camera.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/
```
- **Hiện trạng**: Đường dẫn URI bị cắt cụt ngang tại `.../src/`, thiếu tên tệp đích `adaptive_cinematic_camera.tsx` và thiếu dấu đóng ngoặc tròn `)`. Đồng thời xuất hiện lỗi thừa dấu sao `*Yes**`.
- **Hành động khắc phục**: Thay thế bằng đường dẫn hợp lệ:
  `[`src/client/3d/adaptive_cinematic_camera.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/adaptive_cinematic_camera.tsx)`.

### 1.2. Sai lệch Bản chất Kỹ thuật trong Sổ Theo Dõi Nợ Kỹ Thuật (Tech Debt Invariant)
Tại dòng 132 và 133 của báo cáo:
```markdown
132: - ⚠️ **Cảnh báo trần LOC Tier 2 (UI/3D/Views)**: Tệp [`src/client/3d/adaptive_cinematic_camera.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/adaptive_cinematic_camera.tsx) hiện đạt **450/500 LOC** ... (ví dụ: tách checkHighStakesRoll khỏi FSM) trước khi thêm logic mới.
133: - ⚠️ **Cảnh báo trần LOC Tier 1 (Domain/Server/Logic)**: Tệp [`src/client/3d/camera_state_machine.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/camera_state_machine.ts) hiện đạt **304/400 LOC** ... (ví dụ: tách checkHighStakesRoll khỏi FSM) trước khi thêm logic mới.
```
- **Bóc tách lỗi**:
  - Tệp [`adaptive_cinematic_camera.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/adaptive_cinematic_camera.tsx) là thành phần hiển thị React Three Fiber (Tier 2 Presentation). Nó không chứa `checkHighStakesRoll`.
  - Tệp [`camera_state_machine.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/camera_state_machine.ts) mới là nơi định nghĩa `checkHighStakesRoll` (Tier 1 Domain/Logic).
  - Việc sao chép nguyên văn ví dụ cho thấy sự cẩu thả trong khâu hoàn thiện văn bản báo cáo. Hướng đi đúng để bóc tách [`adaptive_cinematic_camera.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/adaptive_cinematic_camera.tsx) khi chạm 450 dòng phải là: **Trích xuất custom hook quản lý chuyển tiếp mượt mà `useCameraSoftReturn`** hoặc **Trích xuất rig gestures & camera target resolver**.

### 1.3. Lệch pha Số liệu Kiểm toán LOC giữa các Trạm (LOC Accounting Discrepancy)
- Báo cáo chính: ghi nhận `450 LOC` (camera component) và `304 LOC` (state machine).
- Hai biên bản thẩm định Trạm 3 ([`SPEC_REVIEW_IMP-354.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-354.md) và [`CODE_REVIEW_IMP-354.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-354.md)): lại ghi nhận `451 LOC` và `305 LOC`.
- **Nguyên nhân**: Quá trình format code ở Trạm 2.5 đã xóa 1 dòng trống cuối tệp (EOF trailing newline) mà không đồng bộ lại số liệu trong tài liệu Station 3. Cần thống nhất số liệu thực tế trên đĩa vật lý (450 và 304).

### 1.4. Thiếu hụt Bằng chứng Trực quan Nhúng Sẵn (Visual & Telemetry Gap)
- Mặc dù hệ thống đã sinh ra 2 ảnh vật lý [`imp-354_desktop.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-354_desktop.jpg) và [`imp-354_mobile_360.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-354_mobile_360.jpg) cùng dữ liệu telemetry, nhưng báo cáo không nhúng trực tiếp hình ảnh hay trích dẫn bảng toạ độ góc máy. Người đọc báo cáo không thể nghiệm thu nhanh bằng mắt mà phải lục tìm trong thư mục tạm `.agents/tmp/`.

---

## 2. PHÂN TÍCH ĐỐI KHÁNG KIẾN TRÚC & LOGIC VẬN HÀNH (RUNTIME KINEMATICS)

### 2.1. Phân tích Dòng Chảy FSM & Cơ Chế Ổn Định Góc Máy

```
                       DÒNG CHẢY FSM CAMERA LƯỢT BOT TRƯỚC VÀ SAU IMP-354

[CƠ CHẾ CŨ (GÂY RUNG GIẬT)]:
  Bot Chờ Lượt ──► Bot Gieo Xúc Xắc ──► Bot Nhảy Bước (1-4s) ──► Bot Hạ Cánh (Đất thường)
     OVERVIEW           OVERVIEW            PAWN_CHASE                   OVERVIEW
   (Y = 25.3m)        (Y = 25.3m)       (Sà xuống Y = 4.2m)      (Bật lùi lại Y = 25.3m)
        │                  │                    ▲                           │
        └──────────────────┴────────────────────┴───────────────────────────┘
               🚨 Lặp lại 3 lần / 6 giây trên Mobile ➔ Say xe, giật nhấp nháy!

─────────────────────────────────────────────────────────────────────────────────────────

[CƠ CHẾ MỚI IMP-354 (ỔN ĐỊNH BẢO TOÀN)]:
  Bot Chờ Lượt ──► Bot Gieo Xúc Xắc ──► Bot Nhảy Bước (1-4s) ──► Bot Hạ Cánh (Đất thường)
     OVERVIEW           OVERVIEW            OVERVIEW                     OVERVIEW
   (Y = 25.3m)        (Y = 25.3m)          (Y = 25.3m)                 (Y = 25.3m)
        │                  │                    │                           │
        └──────────────────┴────────────────────┴───────────────────────────┘
               ✅ 100% Phẳng mượt, không chuyển đổi mode, camera đứng yên vững chắc!
```

### 2.2. Tử Huyệt Tham Số Tùy Chọn: `isTargetOwnedByHuman?: boolean`
Đoạn mã then chốt trong [`camera_state_machine.ts#L124`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/camera_state_machine.ts#L124):
```typescript
if (params.isPawnAnimating) {
  if ((params.isBotTurn || params.isAnimatingPawnBot) && 
      params.isTargetOwnedByHuman === false && 
      !params.isHighStakesRoll && 
      params.activeModal === null) {
    return 'overview';
  }
  return 'pawn_chase';
}
```

* **Điểm mù**:
  1. Sử dụng `params.isTargetOwnedByHuman === false` là biện pháp kỹ thuật khéo léo để bảo toàn tương thích ngược cho các bài test cũ (nơi `isTargetOwnedByHuman` là `undefined`).
  2. **Tuy nhiên**, kiểu dữ liệu [`CameraResolveParams`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/camera_state_machine.ts#L90) đặt trường này là `isTargetOwnedByHuman?: boolean` (optional).
  3. Nếu trong tương lai có thêm một màn hình hoặc chế độ mới (như Spectator Canvas, Mini Replay View) gọi `resolveCameraMode` mà lập trình viên **quên tính toán và truyền trường này**, giá trị sẽ là `undefined`.
  4. Lúc này, `undefined === false` là `false` $\rightarrow$ FSM sẽ **âm thầm rơi về `pawn_chase`**! Trình biên dịch TypeScript không bắt được lỗi này tại compile-time, làm mất tác dụng của cơ chế chống giật góc máy.

### 2.3. Cạm Bẫy Trôi Tọa Độ từ `lastDestinationCellRef.current`
Tại [`adaptive_cinematic_camera.tsx#L192`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/adaptive_cinematic_camera.tsx#L192):
```typescript
const effectiveDestCell = finalDestinationCell ?? targetCell ?? lastDestinationCellRef.current;
```
- **Kịch bản rủi ro**:
  1. Bot 1 kết thúc lượt nhảy tại ô đất của Người chơi thật (ô 15). `lastDestinationCellRef.current` được gán bằng `15`.
  2. Lượt chơi chuyển sang Bot 2. Bot 2 gieo xúc xắc và bắt đầu cử động nhảy.
  3. Trong 1 hoặc 2 frame đầu tiên của animation Bot 2, nếu `activeAnimation.waypoints` chưa kịp phân bổ vào component và `targetCell` tạm thời là `null`:
  4. Biểu thức trên sẽ lấy giá trị cũ từ `lastDestinationCellRef.current` (ô 15 của Người chơi thật).
  5. `isTargetOwnedByHuman` sẽ tạm thời trả về `true` trong 16ms đầu tiên, kích hoạt chớp nhoáng `pawn_chase` trước khi kịp nhận ra Bot 2 đang di chuyển tới ô trung lập.
- **Biện pháp gia cố**: Bắt buộc gắn hiệu ứng dọn dẹp (cleanup) `lastDestinationCellRef.current = null` ngay khi phát hiện `currentTurnPlayerId` thay đổi.

### 2.4. Đánh Đổi Trải Nghiệm (UX Trade-off): Độ Rõ Nét của Quân Cờ (Pawn Readability)
- Báo cáo ca ngợi việc camera đứng yên tại `overview` ở độ cao $Y = 25.376\text{m}$, Pitch $38.6^\circ$.
- Trên màn hình điện thoại khổ dọc **360x740**, toàn bộ sa bàn 3D bị thu nhỏ để vừa vặn chiều ngang 360 pixel.
- Ở độ cao này, một quân cờ chỉ có kích thước hiển thị khoảng **$8 - 12\text{px}$**.
- Khi triệt tiêu góc máy bám đuổi (`pawn_chase`), người chơi không còn bị giật mắt, nhưng đổi lại sẽ **rất khó nhận biết quân bot đang nhảy qua những ô nào** nếu chỉ nhìn hình thể quân cờ.
- **Khuyến nghị UX**: Trong các ticket cải tiến hiển thị tiếp theo, cần kích hoạt vệt sáng màu của Bot (color trail / jump arc light) hoặc hiệu ứng nảy ô (cell tile pulsing) khi Bot nhảy trong chế độ `overview`.

---

## 3. PHÂN BIỆN ĐỘ BAO PHỦ KIỂM THỬ (TESTING INTEGRITY)

### 3.1. Bẫy Kiểm Thử Tĩnh (Solitary Mocking Trap)
- Toàn bộ 17 bài kiểm thử hợp đồng trong [`tests/client/imp354_bot_camera_stabilization.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp354_bot_camera_stabilization.test.ts) đều là các bài Unit Test thuần túy (Pure Function Tests).
- Chúng chỉ truyền các giá trị mock tĩnh vào `resolveCameraMode` và `resolveSoftReturnDuration`.
- **Thiếu sót nghiêm trọng đối chiếu với Hiến pháp [`GEMINI.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/GEMINI.md) (Quy tắc Full Lifecycle Testing)**:
  - Báo cáo tuyên bố thời lượng `resolveSoftReturnDuration(true) === 650ms` giúp triệt tiêu hoàn toàn sự cố hủy ngang chuyển động (preemption collision).
  - Tuy nhiên, **không có bài test nào thực sự mô phỏng vòng đời tích hợp của React/R3F**: Chưa có kịch bản kích hoạt `initSoftReturn`, cho chạy tick thời gian ảo (`vi.advanceTimersByTime(650)`), và assert biến `softReturnRef.current` đạt tới đích `isFinished === true` trước khi lượt bot tiếp theo gọi lệnh gieo xúc xắc.
  - Đây là sự kiểm chứng trên giả định lý thuyết, chưa phải bằng chứng thực thi trong môi trường tương tác thực.

---

## 4. QUẢN TRỊ NỢ KỸ THUẬT & TRẦN DÒNG MÃ (LOC GOVERNANCE)

Số liệu kiểm toán dòng mã thực tế sau khi đóng gói ticket:

```
[QUẢN LÝ DÒNG MÃ THEO 5-TIER FILE BUDGET FRAMEWORK]

1. src/client/3d/camera_state_machine.ts (Tier 1 - Domain/Server/Logic):
   ├── Dòng thực tế trên đĩa: 304 LOC
   ├── Ngưỡng cảnh báo bắt buộc (75%): 300 LOC ⚠️ VƯỢT NGƯỠNG!
   ├── Trần tử thần (Hard Ceiling): 400 LOC
   └── Khoảng cách an toàn còn lại: 96 dòng.

2. src/client/3d/adaptive_cinematic_camera.tsx (Tier 2 - UI/3D Components):
   ├── Dòng thực tế trên đĩa: 450 LOC
   ├── Ngưỡng cảnh báo bắt buộc: 400 LOC ⚠️ VƯỢT NGƯỠNG!
   ├── Trần tử thần (Hard Ceiling): 500 LOC
   └── Khoảng cách an toàn còn lại: 50 dòng.
```

- Theo Hiến pháp Mục 5, khi tệp Tier 1 chạm 300 LOC và Tier 2 chạm 400 LOC, nhóm phát triển **bắt buộc phải đăng ký mã Nợ Kỹ Thuật chính thức (`DEBT-XXX`) vào Sổ Cái (`rule_bug_ledger.md`)** kèm theo kế hoạch bóc tách rõ ràng.
- Báo cáo mới chỉ đưa ra cảnh báo suông, chưa cấp mã định danh nợ kỹ thuật bất biến.

---

## 5. KẾ HOẠCH HÀNH ĐỘNG KHẮC PHỤC (ACTIONABLE DIRECTIVES)

Để hoàn thiện hồ sơ nghiệm thu đạt chuẩn `HARDENED_APPROVED` cao nhất, các hạng mục sau cần được thực hiện:

### Nhóm A: Khắc phục Cơ học Tức thì trên Báo cáo Nghiệm thu
1. **Sửa link đứt gãy tại dòng 46**: Nối lại đường dẫn đầy đủ đến [`src/client/3d/adaptive_cinematic_camera.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/adaptive_cinematic_camera.tsx).
2. **Hiệu chỉnh mục Nợ Kỹ Thuật tại dòng 132**: Thay thế cụm từ copy-paste nhầm bằng chỉ thị tái cấu trúc đúng: *"Trích xuất custom hook điều phối softReturn (`useCameraSoftReturn`) hoặc tách logic tính toán rig gesture"*.
3. **Đồng bộ số liệu LOC**: Khớp chuẩn xác số liệu đĩa vật lý giữa Báo cáo (450, 304, 213) và các tệp thẩm định Station 3.
4. **Nhúng bảng Telemetry trực quan**: Bổ sung bảng thông số tọa độ camera Desktop vs Mobile 360px vào Phần 2 hoặc Phần 3 của báo cáo.

### Nhóm B: Đăng ký Sổ Cái Nợ Kỹ Thuật (Tech Debt Registration)
Ghi nhận chính thức 2 mã nợ kỹ thuật vào hệ thống theo dõi:
- **`DEBT-CAM-01`**: Bóc tách hàm phân giải chế độ máy quay và các bộ kiểm tra điều kiện (`resolveCameraMode`, `checkHighStakesRoll`) từ [`camera_state_machine.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/camera_state_machine.ts) (304 LOC) sang module con thuần túy để giữ tệp dưới 300 LOC.
- **`DEBT-CAM-02`**: Trích xuất hook quản lý hiệu ứng hồi tiếp mềm `useCameraSoftReturn` từ [`adaptive_cinematic_camera.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/adaptive_cinematic_camera.tsx) (450 LOC) để đưa component về vùng an toàn (< 400 LOC).

### Nhóm C: Gia Cố Kiến Trúc cho các Ticket Kế Tiếp
- **Bảo vệ ranh giới tham số**: Xem xét chuyển `isTargetOwnedByHuman` từ dạng optional (`?: boolean`) thành tham số bắt buộc trong các hàm nội bộ của camera FSM, hoặc đặt giá trị mặc định rõ ràng tại tầng facade để ngăn chặn hiện tượng silent fallback.
- **Dọn dẹp state rẽ nhánh**: Thêm `lastDestinationCellRef.current = null` trong hook phản ứng thay đổi lượt chơi.

---
*Bản phản biện đối kháng này được lưu trữ độc lập tại [`docs/reports/audits/ADVERSARIAL_CRITIQUE_IMP354_BOT_CAMERA_STABILIZATION.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/audits/ADVERSARIAL_CRITIQUE_IMP354_BOT_CAMERA_STABILIZATION.md) làm căn cứ pháp lý kỹ thuật và đối chiếu nghiệm thu.*
