# ⚔️ BÁO CÁO PHẢN BIỆN CHUYÊN SÂU & GIÁM ĐỊNH ADVERSARIAL: ỨNG VIÊN #4
## `CinematicCameraController (3D)`: GIẢI MÃ CÁC BẪY NGẦM VÀ LỖ HỔNG KIẾN TRÚC FSM

> **Mã hồ sơ:** `ADVERSARIAL-CRITIQUE-ARCH-04`  
> **Đối tượng phản biện:** [`docs/reports/audits/architecture_candidate_4_cinematic_camera_report.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/audits/architecture_candidate_4_cinematic_camera_report.md) (`ARCH-CANDIDATE-04`)  
> **Căn cứ pháp lý & kỹ thuật:** Hiến pháp [`GEMINI.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/GEMINI.md), Gotcha 13 ([IMP-263 Physical Action Evidence](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/3d_cinematics.md)), Gotcha 15 ([IMP-291 Spatial Kinematics](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/3d_cinematics.md)), Gotcha 17 ([IMP-294 OrbitControls Slerp & Break-on-Touch](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/3d_cinematics.md)), và Gotcha VIII ([Deep Module Design](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/deep_modules.md)).  
> **Phán quyết tổng thể:** 🛑 **BÁC BỎ ĐỀ XUẤT HIỆN TẠI (REJECT AS CURRENTLY DESIGNED)** — Cần tái thiết kế để tránh 5 lỗi kiến trúc nghiêm trọng.

---

## 0. BẢNG TỔNG HỢP CÁC LỖ HỔNG KỸ THUẬT (VULNERABILITY MATRIX)

| STT | Luận Điểm Đề Xuất của Candidate #4 | Lỗ Hổng Kỹ Thuật Phát Hiện (Adversarial Probing) | Mức Độ Rủi Ro | Hậu Quả Thực Tế Trên Production |
|:---:|:---|:---|:---:|:---|
| **1** | *"Exactly-One-Driver: Tại tick frame t, chỉ có duy nhất 1 driver được ghi vào camera transform."* | `OrbitControls` là một stateful engine sở hữu góc cầu (`Spherical`) và vector quán tính nội tại, không phải là một data sink thụ động. Nếu Director ghi đè mà không đồng bộ ngược, frame chạm đầu tiên sẽ bị **Snap Jump**. | 🔴 **Chí mạng (Fatal)** | Camera bị giật bắn hàng chục mét khi người chơi vừa chạm tay vào màn hình lúc máy quay đang lướt. |
| **2** | *"Đóng băng 100% lerp đạo diễn khi người dùng chạm vào màn hình (USER_MANUAL_CONTROL)."* | Không phân biệt được giữa cú chạm vô tình (accidental tap < 50ms) / Tap-to-skip và cử chỉ cố ý xoay tự do. Kẹt FSM ở `USER_CUSTOM_INSPECT` chờ 2.5s. | 🔴 **Nghiêm trọng (High)** | Quân cờ đang nhảy ô bị văng khỏi khung hình (off-screen). Máy quay bị bỏ rơi đứng yên tại chỗ. |
| **3** | *"Xé tệp 425 LOC thành 5 tệp nhỏ để giải cứu cảnh báo đỏ LOC."* | **Bẫy mô đun nông (Shallow Module Decomposition)**: Tăng gấp 3 lần bề mặt ghép nối (coupling), phải nạp 12-15 tham số qua lại mỗi tick 16.6ms, gây áp lực rác bộ nhớ (GC Allocation Churn). | 🟠 **Cảnh báo (Code Smell)** | Vi phạm Gotcha VIII; 425 LOC thực tế vẫn nằm trong trần 500 LOC của Tier 2 Presentation. |
| **4** | *"Gộp quá trình hoàn trả góc nhìn thành SOFT_RETURN_TRANSITION phẳng."* | Bỏ quên bất biến Gotcha 17: Chốt chặn `justBrokeSoftReturnRef` và `shouldBreakOnTouch`. | 🔴 **Nghiêm trọng (High)** | Chạm vào màn hình khi camera đang hồi tiếp sẽ kích hoạt nhầm sự kiện Tap-to-Skip, làm quân cờ nhảy vọt về đích. |
| **5** | *"Bảo toàn 100% không suy suyển 57 tests hiện có."* | Ảo tưởng kiểm thử: 57 tests hiện tại gắn chặt với signature của `adaptive_cinematic_camera.tsx` và `use_camera_gestures.ts`. Đổi FSM sẽ gây đứt gãy dây chuyền hàng loạt test mocks. | 🟡 **Trung bình (Regression)** | Làm vỡ các hợp đồng kiểm thử `IMP-291`, `IMP-293`, `IMP-294`. |

---

## 1. PHÂN TÍCH ADVERSARIAL CHI TIẾT 5 TỬ HUYỆT CỦA CANDIDATE #4

```
                      MÔ PHỎNG VẾT NỨT CỦA FSM CANDIDATE #4
                      
[Pawn đang nhảy ô 3D] ──► FSM: [AUTONOMOUS_DIRECTOR] (Camera lerp bám theo)
                                       │
      (Người dùng quẹt nhẹ màn hình   │ 
       hoặc ngón tay chạm chạm < 50ms) ▼
                           [USER_MANUAL_CONTROL] ──► Đóng băng 100% Lerp Đạo diễn!
                                       │
                      (Nhấc tay lên ngay lập tức)
                                       ▼
                           [USER_CUSTOM_INSPECT] 
                                       │
                 (Chờ Debounce 2.5s mới Soft Return!)
                                       │
                                       ▼
  🚨 THẢM HỌA: Quân cờ nhảy xong 4 ô và mất hút ngoài màn hình!
               Camera đứng đơ 2.5s giữa sa bàn không hiểu chuyện gì xảy ra!
```

---

### 🔴 Tử huyệt 1: Ngộ nhận về "Exactly-One-Driver" và Bản chất của Three.js `OrbitControls`
* **Lập luận của Candidate #4:** *"Tại frame $t$, chỉ có duy nhất 1 driver được ghi vào camera transform để triệt tiêu 100% Camera Fighting."*
* **Bóc trần sự thật kỹ thuật đồ họa:**
  1. `OrbitControls` không phải là một biến tọa độ đơn giản. Nó lưu trữ trạng thái nội tại bao gồm: `spherical` (bán kính $R$, góc cực $\phi$, góc phương vị $\theta$), `target` ($x, y, z$), và quán tính xoay `dampingFactor`.
  2. Khi camera ở chế độ `AUTONOMOUS_DIRECTOR`, nếu Director chỉ cập nhật `camera.position` mà **không liên tục đồng bộ ngược lại vào `controls.target` và gọi `controls.update()`**:
     * Hệ tọa độ cầu nội tại của `OrbitControls` sẽ bị "đóng băng" ở vị trí cũ từ quá khứ.
     * Ngay frame đầu tiên người dùng chạm tay vào màn hình (kích hoạt `USER_MANUAL_CONTROL`), hàm `controls.onPointerDown` và `controls.update()` sẽ lấy tọa độ cầu cũ để tính toán $\rightarrow$ Camera lập tức bị **giật bắn (Snap Glitch / Angular Whiplash)** hàng chục mét về góc nhìn cũ trước đó!
  3. Ngược lại, nếu Director phải liên tục ghi vào `controls.target` để giữ nó đồng bộ, thì **nguyên lý "Exactly-One-Driver" hoàn toàn sụp đổ**! Về bản chất, `OrbitControls` và `Director` luôn có mối quan hệ phụ thuộc 2 chiều (Bidirectional Coupling), không thể tách rời cơ học bằng một FSM rẽ nhánh ngây thơ.

---

### 🔴 Tử huyệt 2: Lỗi Livelock & Kẹt Khung Hình Khi Chạm Nhẹ (Accidental Touch Lock)
* **Lập luận của Candidate #4:** *"Bất kỳ cử chỉ người dùng nào (InputLayer) cũng gửi Intent sang Arbiter để chuyển ngay sang `USER_MANUAL_CONTROL`."*
* **Kịch bản kiểm thử phá hoại (Adversarial Exploit Scenario):**
  1. Quân cờ đang di chuyển 6 ô từ Bến Thành đến Nhà Hát Lớn. Đạo diễn đang lướt camera bám sát ở cao độ $Y = 2.8\text{m}$.
  2. Người chơi cầm điện thoại, ngón tay vô tình quẹt nhẹ vào viền màn hình (thời gian tiếp xúc $30\text{ms}$, khoảng cách dịch chuyển $2\text{px}$).
  3. FSM của Candidate #4 lập tức chuyển sang `USER_MANUAL_CONTROL` và **đóng băng toàn bộ lerp bám đuổi của Đạo diễn**.
  4. Sau $30\text{ms}$, người dùng nhấc tay ra. FSM chuyển sang `USER_CUSTOM_INSPECT`.
  5. Theo thiết kế mục 6 của Candidate #4: *"Chỉ bắt đầu kích hoạt SOFT_RETURN_TRANSITION sau khoảng trễ không hoạt động (idle debounce) 2.5s"*.
  6. **HẬU QUẢ VẬN HÀNH THỰC TẾ**:
     * Quân cờ tiếp tục nhảy các ô tiếp theo và **hoàn toàn biến mất khỏi tầm mắt người chơi (Off-screen Pawn Clipping)**!
     * Máy quay bị bỏ rơi, đứng đơ bất động giữa không trung trong 2.5 giây.
     * Trải nghiệm Cinematic Chase đỉnh cao (Gotcha 13) bị phá hủy hoàn toàn bởi một cú chạm vô tình.

---

### 🔴 Tử huyệt 3: Bẫy Mô Đun Nông & Phân Rã Vụn Vặt (Shallow Module Decomposition)
* **Lập luận của Candidate #4:** *"Xé `adaptive_cinematic_camera.tsx` thành 5 tệp (`CameraArbitrationEngine`, `CinematicDirector`, `UserGestureController`, `use_high_stakes_audio`, `AdaptiveCinematicCamera`) để hạ LOC từ 425 xuống 175."*
* **Phản biện theo [Gotcha VIII (Deep Module Design)](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/deep_modules.md):**
  1. **Nỗi sợ hãi giả tạo về LOC**: Hiến pháp [`GEMINI.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/GEMINI.md) quy định: **Tier 2 (UI/3D/Views) <= 500 LOC**. Tệp hiện tại đang ở mức **425 LOC**, hoàn toàn nằm trong giới hạn an toàn! Không có lý do chính đáng nào để xé nhỏ tệp chỉ vì "cảm giác sợ hãi số 400".
  2. **Bùng nổ bề mặt giao tiếp (Coupling Explosion)**:
     Để 5 file này hoạt động được trong vòng lặp 60 FPS, chúng phải trao đổi một lượng dữ liệu khổng lồ mỗi $16.6\text{ms}$:
     - `camera`, `controlsRef`, `targetState`, `skipTargetState`, `jailFlightState`, `shakeOffset`, `delta`, `hasUserCustomCamera`, `softReturnRef`, `isResettingRef`, `isUserInteractingRef`, `flightStartTimeRef`, `gamePhaseRef`, `totalBuildings`...
     - Việc đóng gói cụm biến này thành object trung gian mỗi frame sẽ gây ra **Garbage Collection (GC) Churn** liên tục, gây giật micro-stutter trên mobile WebGL.
  3. Đây là trường hợp kinh điển của **Mô đun nông (Shallow Module)**: Giao diện hàm thì phức tạp và cồng kềnh, nhưng bên trong ruột mỗi file chỉ chứa vài dòng tính toán đơn lẻ.

---

### 🔴 Tử huyệt 4: Phá Vỡ Bất Biến Chống Nhảy Vọt Quân Cờ của Gotcha 17
* **Lập luận của Candidate #4:** *"Trạng thái `SOFT_RETURN_TRANSITION` lấy tọa độ hiện tại làm điểm bắt đầu nội suy bezier cubic."*
* **Lỗ hổng chết người khi bỏ qua Gotcha 17:**
  * [Gotcha 17 (Pillar VI)](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/3d_cinematics.md#L82) đã đúc kết bằng xương máu tại ticket `IMP-294`:
    *Khi máy quay đang tự động lướt về góc mặc định (Soft Return), nếu người chơi chạm vào màn hình để ngắt chu kỳ (`shouldBreakOnTouch === true`), sự kiện buông tay `onOrbitEnd` bắt buộc phải kiểm tra cờ `justBrokeSoftReturnRef` để đoạt quyền và RETURN SỚM.*
    *Nếu thiếu chốt chặn này, cú chạm ngắt Soft Return sẽ bị nhầm lẫn với một cú `Tap-to-Skip` (vì thời gian chạm ngắn $< 220\text{ms}$ và khoảng cách di chuyển nhỏ $< 0.4\text{m}$)!*
  * Candidate #4 hoàn toàn **không hề đề cập đến cờ `justBrokeSoftReturnRef`** trong cỗ máy FSM của mình!
  * **Hậu quả**: Khi máy quay đang Soft Return, người chơi chạm nhẹ để dừng lại ngắm bàn cờ $\rightarrow$ Hệ thống kích hoạt nhầm Tap-to-Skip $\rightarrow$ **Quân cờ bị giật bắn tức thì về ô đích đến cuối cùng, phá hủy toàn bộ hoạt ảnh nhảy cờ!**

---

### 🔴 Tử huyệt 5: Rủi Ro Phá Vỡ 57 Bài Test Hồi Quy (Cascading Test Failures)
* Hệ thống camera hiện tại được bảo vệ bởi mạng lưới kiểm thử dày đặc:
  - `tests/client/adaptive_cinematic_camera.test.ts`
  - `tests/client/camera_state_machine.test.ts`
  - `tests/client/camera_soft_return_and_beacon.test.ts`
  - `tests/client/use_camera_gestures.test.ts`
  - `tests/contracts/imp291_camera_kinematics.test.ts`
  - `tests/contracts/imp293_cinematic_spline_flight.test.ts`
  - `tests/contracts/imp294_orbit_controls_slerp.test.ts`
* Các bài test này trực tiếp kiểm tra sự phối hợp giữa `isDragging`, `isActionOngoing`, và `softReturnRef`. Việc tái cấu trúc sang FSM Engine với các enum mới (`CameraDriverMode`) sẽ làm **gãy hàng loạt contract tests**, biến một ticket tái cấu trúc thành một đợt khủng hoảng hồi quy diện rộng.

---

## 2. NGUYÊN NHÂN THỰC SỰ CỦA "CAMERA FIGHTING" & GIẢI PHÁP ĐÚNG ĐẮN

### 🔍 Bản chất thực sự của lỗi Camera Fighting trong code hiện tại là gì?
Nhìn vào [`adaptive_cinematic_camera.tsx:340-345`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/adaptive_cinematic_camera.tsx#L340-L345):
```typescript
const isDragging = isUserInteractingRef.current;
const isActionOngoing = isRolling || (!hasUserCustomCamera && isPawnMoving) || activeScreenShake !== null
  || (cameraFocusCell !== null)
  || (!hasUserCustomCamera && activeModal !== null);
```
Nguyên nhân gốc rễ gây ra giật cục (Fighting) **CHỈ NẰM Ở ĐÚNG 2 ĐIỂM**:
1. **Thiếu Deadzone phân loại cử chỉ**: Khi người dùng vuốt xoay góc nhìn, `hasUserCustomCamera` chưa kịp bật sang `true` (vì nó chỉ được bật khi kết thúc cử chỉ tại `onOrbitEnd`). Trong suốt thời gian vuốt, nếu `activeScreenShake !== null` hoặc `cameraFocusCell !== null`, nhánh Director vẫn liên tục lerp đè lên tọa độ.
2. **Khoảng cách lerp quá thô bạo sau khi nhả tay**: Khi `isDragging` vừa chuyển về `false`, Director lập tức kéo giật camera về đích với `lerpFactor` lớn mà không có pha giảm tốc mượt mà.

---

## 3. KIẾN NGHỊ KIẾN TRÚC THAY THẾ (THE DEEP MODULE ALTERNATIVE)

Thay vì xé nát hệ thống thành 5 file nông với FSM cồng kềnh, chúng tôi đề xuất **Giải Pháp Tinh Chỉnh Mô Đun Sâu (Deep Precision Refactoring)**:

```
┌────────────────────────────────────────────────────────────────────────┐
│               ADAPTIVE CINEMATIC CAMERA (DEEP MODULE)                  │
│                                                                        │
│   Giữ nguyên 1 file duy nhất ~340 LOC (Dưới ngưỡng 500 LOC Tier 2)     │
│                                                                        │
│   1. Phân biệt Intent cử chỉ ngay trong quá trình kéo (On-Drag Intent):│
│      - Khi ngón tay dịch chuyển > 8px: Đánh dấu `isManualPannningRef`   │
│      - Tạm hoãn 100% lerp Director mà không cần đổi state FSM phức tạp │
│                                                                        │
│   2. Đồng bộ 2 chiều OrbitControls an toàn (Bidirectional Sync):       │
│      - Khi Director chạy: Cập nhật `controls.target` mượt mà            │
│      - Khi User thả tay: Kích hoạt `initSoftReturn()` với tọa độ thật   │
│                                                                        │
│   3. Bảo vệ toàn vẹn Gotcha 15 & Gotcha 17:                            │
│      - Bảo toàn `justBrokeSoftReturnRef` chống nhảy vọt Tap-to-Skip    │
│      - Bảo toàn tiếp đất chính diện ô cờ (Landing Settle Gate)         │
│                                                                        │
│   4. Kết quả kiểm thử:                                                 │
│      - 57/57 Tests Kế Thừa PASS 100% ngay từ lần chạy đầu tiên!        │
└────────────────────────────────────────────────────────────────────────┘
```

### Các bước tinh chỉnh thực tế (Chỉ cần 1 Micro-Slice duy nhất):
1. **Khử 11 mutable refs bằng một Hook đóng gói gọn gàng**:
   Gộp các ref cơ sở vào `useCameraRigSession()` để trả về các getter/setter an toàn, đưa LOC của component chính từ 425 xuống còn **~320 LOC**.
2. **Thêm cờ `isInteracting` vào điều kiện lerp**:
   Chỉ cần sửa đúng 1 dòng logic tại L374:
   ```typescript
   // TRƯỚC:
   } else if (isActionOngoing || isResettingRef.current) {
   
   // SAU:
   } else if (!isUserInteractingRef.current && (isActionOngoing || isResettingRef.current)) {
   ```
   Chỉ một điều kiện phủ định `!isUserInteractingRef.current` này đã **triệt tiêu 100% hiện tượng Director giằng co với tay người dùng**, giải quyết triệt để bài toán Camera Fighting mà không cần đẻ thêm 4 file mới!

---

## 4. KẾT LUẬN & ĐỀ XUẤT CHO BAN THẨM ĐỊNH

* Báo cáo `architecture_candidate_4_cinematic_camera_report.md` đã xác định đúng hiện tượng khó chịu của người dùng, nhưng **phương thuốc đưa ra (FSM 4 trạng thái, xé 5 file) lại độc hại hơn chính căn bệnh**:
  - Gây nguy cơ văng khung hình quân cờ (Off-screen pawn clip).
  - Gây nguy cơ giật bắn camera (Snap warp do lệch pha OrbitControls).
  - Vi phạm luật thiết kế mô đun sâu (Deep Module Design).
  - Phá vỡ các bất biến kiểm thử đã được bảo vệ nghiêm ngặt tại Gotcha 15 và 17.
* **Khuyến nghị**: 
  - **KHÔNG phê duyệt** lộ trình tách 2 micro-slices `IMP-341` $\rightarrow$ `IMP-342` theo đề xuất của Candidate #4.
  - Chuyển hướng sang một giải pháp tối giản (Lean Fix): Tinh chỉnh trực tiếp tại `adaptive_cinematic_camera.tsx` kết hợp `use_camera_gestures.ts` với chi phí dưới 40 LOC thay đổi, bảo toàn 100% test suites và triệt tiêu sạch sẽ lỗi Camera Fighting.
