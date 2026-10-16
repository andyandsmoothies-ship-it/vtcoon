# ⚔️ BÁO CÁO PHẢN BIỆN ĐỐI KHÁNG & GIÁM ĐỊNH PHÁP Y: TICKET IMP-406
## MOBILE INSTANCED MONOPOLY ARCHWAYS, AUTO-TTL DOMINO SHOCKWAVE & DIEGETIC SANCTUARY PURITY

> **Mã hồ sơ:** `ADVERSARIAL-CRITIQUE-IMP-406`  
> **Đối tượng thẩm định:**  
> 1. Kế hoạch: [`PLAN_IMP_406_MOBILE_INSTANCED_MONOPOLY_ARCHWAY_AND_DOMINO_SHOCKWAVE.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/plans/PLAN_IMP_406_MOBILE_INSTANCED_MONOPOLY_ARCHWAY_AND_DOMINO_SHOCKWAVE.md)  
> 2. Báo cáo nghiệm thu: [`docs/reports/improvements/IMP-406-mobile-instanced-monopoly-archway-and-domino-shockwave_report.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/improvements/IMP-406-mobile-instanced-monopoly-archway-and-domino-shockwave_report.md)  
> **Phân hệ thực tế:** `client-3d` (3D Kinematics & Presentation Layer)  
> **Ngày lập hồ sơ:** 2026-10-15  
> **Căn cứ pháp lý & quy chuẩn:** Hiến pháp [`GEMINI.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/GEMINI.md), Gotcha 10 ([R3F Transient Unmount](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/3d_cinematics.md)), Gotcha 15 ([Spatial Kinematics](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/3d_cinematics.md)), Gotcha VIII ([Deep Module Design](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/deep_modules.md)), Iron Laws (Anti-TIDD, Buffer Zone 350 LOC, Zero Dirty Casts, 1:1 Physical Disk Truth).  
> **Phán quyết tổng thể:** 🟡 **CONDITIONAL_PASS (THÔNG QUA CÓ ĐIỀU KIỆN)** — Giải pháp cơ học và đồ họa xuất sắc (33/33 mutants bị tiêu diệt, 60 FPS trên Mobile, 0 lệnh `mergeGeometries` lúc chạy, Visual Critic đạt 9.0/10), nhưng **phát hiện 5 tử huyệt & lỗ hổng kiến trúc ngầm** cần lập biên bản kỹ thuật và giải tỏa nợ công nghệ.

---

## 0. BẢNG MA TRẬN ĐÁNH GIÁ LỖ HỔNG & TỬ HUYỆT (DEFECT & VULNERABILITY MATRIX)

| STT | Khía Cạnh Kiểm Toán | Tử Huyệt / Lỗ Hổng Kỹ Thuật Phát Hiện | Mức Độ | Hệ Quả Thực Tế Trên Môi Trường Production & CI |
|:---:|:---|:---|:---:|:---|
| **1** | **Ngân Sách Kiểm Thử** | Tệp Living Test [`imp406_mobile_instanced_monopoly_archway.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp406_mobile_instanced_monopoly_archway.test.ts) đạt **595/600 LOC (99.3%)**. | 🔴 **HIGH RISK** | Chỉ còn dư đúng **4-5 dòng** trước trần cứng. Bất kỳ bổ sung assert nào trong tương lai sẽ làm sập build (`EXIT 1`). |
| **2** | **Kỷ Luật Anti-TIDD** | Duy trì cờ kép `isMobile` + `enableMobileInstancedPool` trên [`MonopolyPlazaFusion`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/monopoly_plaza_fusion.tsx). | 🟠 **WARNING** | Thỏa hiệp thiết kế ngầm nhằm chiều lòng test cũ `TC-401.04c`, tạo ra nhánh chết (dead branch) trong production code. |
| **3** | **Độ Toàn Vẹn Số Liệu** | Lệch pha số liệu SLOC/Lines giữa Báo cáo nghiệm thu và đo đạc đĩa thực tế (`check_loc.mjs`). | 🟡 **MEDIUM** | Vi phạm quy định *Main Agent 1:1 Self-Audit Gate* (chênh lệch 1-3 SLOC trên 4 file mã nguồn). |
| **4** | **Phạm Vi Kiến Trúc** | Ghép nối lỏng lẻo (Scope Bundling): gom chung War Room Sanctuary Option B vào vé Monopoly Archway. | 🟡 **MEDIUM** | Mở rộng diện tích tiếp xúc lỗi (blast radius) sang phân hệ ngoại giao đền thờ đại dương. |
| **5** | **Trải Nghiệm & Gameplay** | Đánh đổi Option B: Bộ từ vựng tài chính vĩ mô bị giấu hoàn toàn trên giao diện 3D trong trận đấu. | 🟠 **WARNING** | Người chơi không đọc được chiến lược của đối thủ trên 3D; thuật ngữ vĩ mô có nguy cơ trở thành "tính năng ngầm". |
| **6** | **Hình Học & Culling** | Tắt culling (`frustumCulled={false}`) trên 24 slots `InstancedMesh` mà không tính lại Bounding Sphere bàn cờ. | 🟢 **LOW** | Tiềm ẩn sai lệch khi tính toán bóng đổ (shadow map cascade) hoặc raycasting góc máy cận. |

---

## 1. GIÁM ĐỊNH PHÁP Y TÍNH TOÀN VẸN BÁO CÁO NGHIỆM THU (REPORT INTEGRITY)

### 1.1. Báo Động Đỏ: Tệp Living Test Đạt 99.3% Dung Lượng Trần Cứng (595 / 600 LOC)
* **Hiện trạng kiểm toán**:
  * Khi thực thi `node scripts/check_loc.mjs tests/client/imp406_mobile_instanced_monopoly_archway.test.ts`, công cụ đo đạc báo cáo:
    * **Tổng số dòng (Total Lines): 595 dòng** (nếu tính dòng trống EOF là 596 dòng).
    * **Non-Empty SLOC: 557 dòng**.
    * **Trần cứng quy định:** `<= 600 LOC` đối với Living Tests.
* **Phản biện pháp y**:
  * Trong Báo cáo nghiệm thu [IMP-406_report.md](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/improvements/IMP-406-mobile-instanced-monopoly-archway-and-domino-shockwave_report.md#L141), mục 4.1 ghi nhận: `557 SLOC | 596 Lines | <= 600 LOC | ✅ Đạt chuẩn`.
  * Dấu tích xanh này đã **che giấu một nguy cơ cận tử**: Tệp test đang hoạt động ở **99.3% công suất tối đa** và chỉ còn cách thảm họa gãy build (`EXIT 1` của `npm run prefilter`) đúng **4 đến 5 dòng**.
  * Báo cáo thiếu hoàn toàn khuyến cáo kỹ thuật (Technical Notice) về việc **đóng băng (freeze)** tệp test này để ngăn ngừa vi phạm trong tương lai.

### 1.2. Sự Trôi Dạt Số Liệu SLOC (Metric Drift) Đối Chiếu Thực Tế Đĩa Cứng
Quy định *Main Agent Pre-Delivery 1:1 Self-Audit Gate* trong Hiến pháp [GEMINI.md](file:///c:/Users/HP/Documents/GitHub/vtcoon/GEMINI.md) bắt buộc số liệu SLOC trong báo cáo phải trùng khớp 1:1 với thực tế đĩa cứng. Đối chiếu trực tiếp giữa Bảng 4.1 trong Báo cáo và lệnh `scripts/check_loc.mjs`:

```text
📊 ĐỐI CHIẾU SỐ LIỆU SLOC & LINES (BÁO CÁO vs ĐĨA VẬT LÝ):
┌──────────────────────────────────────┬─────────────────────────┬─────────────────────────┬──────────────┐
│ Tệp Mã Nguồn                         │ Số Liệu Báo Cáo         │ Số Liệu Đĩa Thực Tế     │ Sai Lệch     │
├──────────────────────────────────────┼─────────────────────────┼─────────────────────────┼──────────────┤
│ war_room_stage_layer.tsx             │ 268 SLOC / 294 Lines    │ 271 SLOC / 293 Lines    │ ⚠️ Lệch 3 LOC │
│ monopoly_mobile_archway_visuals.ts   │ 267 SLOC / 287 Lines    │ 265 SLOC / 286 Lines    │ ⚠️ Lệch 2 LOC │
│ monopoly_plaza_fusion.tsx            │ 216 SLOC / 228 Lines    │ 214 SLOC / 227 Lines    │ ⚠️ Lệch 2 LOC │
│ monopoly_plaza_visuals.ts            │ 277 SLOC / 316 Lines    │ 277 SLOC / 315 Lines    │ ⚠️ Lệch 1 Dòng│
│ board_layout.tsx                     │ 226 SLOC / 253 Lines    │ 226 SLOC / 252 Lines    │ ⚠️ Lệch 1 Dòng│
└──────────────────────────────────────┴─────────────────────────┴─────────────────────────┴──────────────┘
```

* **Kết luận**: Mặc dù các tệp đều an toàn dưới hạn mức trần Tier 2 (500 LOC), sự chênh lệch 1-3 SLOC cho thấy báo cáo đã lấy số liệu từ một snapshot trước lượt linter/prettier cuối cùng. Cần cập nhật lại số liệu chuẩn xác 100% trước khi lưu trữ chính thức.

### 1.3. Điểm Mù Kiểm Toán: Sự Thỏa Hiệp Về Anti-TIDD Chưa Được Thừa Nhận
* **Hiện tượng**:
  * Tại [monopoly_plaza_fusion.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/monopoly_plaza_fusion.tsx#L23-L24):
    ```typescript
    export interface MonopolyPlazaFusionProps {
      readonly isMobile?: boolean;
      readonly enableMobileInstancedPool?: boolean;
    }
    ```
  * Tại [board_layout.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_layout.tsx#L246-L247):
    ```tsx
    isMobile={tierProfile.monopolyArchwayMode === 'INSTANCED_POOL_SINGLE_MAT'}
    enableMobileInstancedPool={tierProfile.monopolyArchwayMode === 'INSTANCED_POOL_SINGLE_MAT'}
    ```
* **Bóc tách nguyên nhân**:
  * Test case cũ `TC-401.04c` từng khẳng định: `MonopolyPlazaFusion({ monopolyGroups, isMobile: true }) === null`.
  * Thay vì dọn dẹp hoặc cập nhật kỳ vọng của test suite cũ (do cơ chế khóa test file), đội ngũ đã thêm cờ `enableMobileInstancedPool` (mặc định `false`) để xoa dịu bài kiểm thử này.
* **Đánh giá pháp y**:
  * Việc Code Reviewer và Báo cáo nghiệm thu tuyên bố *"0 Slop red flags, Zero TIDD"* là chưa trung thực với hiện trạng mã nguồn. Cặp prop kép này là một món nợ kỹ thuật (Technical Debt) vi phạm tinh thần của luật Anti-TIDD, cần được ghi nhận vào Sổ cái nợ công nghệ thay vì phủ nhận.

---

## 2. PHÂN TÍCH ĐỐI KHÁNG KIẾN TRÚC & ĐỘNG HỌC 3D (RUNTIME KINEMATICS)

### 2.1. Kiến Trúc Cửa Sổ Xuyên Thấu 22mm vs Bộ Đệm Chiều Sâu 16-Bit Android
* **Điểm thành công**:
  * Đội ngũ đã xử lý xuất sắc phát hiện đối kháng `[ADV-02]`: Thay vì đắp nổi phù điêu dày $0.5\text{mm}$ (chắc chắn gây Z-fighting trên GPU Mali/Adreno), hàm `getMobileMonopolyArchwayGeometry()` đã dùng `emitOrientedWallQuad` khoét thủng 4 dải tứ giác trên cả mặt trước (`bz1`) và mặt sau (`bz0`) của thân cột và dầm ngang.
  * 6 hốc rãnh âm `ARCHWAY_RECESSED_CAVITIES` lùi sâu `|zSurface - zInward| = 22mm >= 20mm` hoàn toàn lộ thiên trước Depth Buffer, đảm bảo chiều sâu cơ học rõ nét mà không phát sinh thêm bất kỳ draw call nào.
* **Cảnh báo Bounding Sphere**:
  * Cả hai bể `archwayInstancedRef` và `promenadeInstancedRef` đều bật `frustumCulled={false}`. Với 24 instances trải khắp bàn cờ $24\text{m} \times 24\text{m}$, Three.js không thực hiện culling. Mặc dù chi phí là $O(1)$ draw call, việc thiếu phương thức `mesh.geometry.computeBoundingSphere()` bao phủ toàn bộ bàn cờ có thể khiến một số cơ chế bóng đổ cascade phân bổ sai độ phân giải texel.

### 2.2. Động Học Sóng Chấn Động Domino Ở Nửa Chu Kỳ Âm
* **Phân tích cơ học**:
  * Trong `calculateDominoRippleTransform`, khi sóng truyền qua ô cờ, hàm dao động sin đổi dấu sang nửa chu kỳ âm (`waveSin < 0`). Để tránh việc chân cổng vòm bị lún sâu xuống lòng đất, thuật toán kẹp `yOffset = 0`.
  * Tuy nhiên, góc nghiêng `pitchX` (trục X) vẫn dao động tự nhiên theo sin.
  * Đội ngũ đã phòng ngừa xuất sắc bẫy kẹt trạng thái: Vòng lặp `useSafeFrame` kiểm tra `liveSlots.some((s) => s.active && (s.position[1] > 0.118 || s.pitchX !== 0))`. Điều này đảm bảo ngay cả khi độ cao $Y = 0$, ma trận vẫn tiếp tục được cập nhật góc nghiêng cho đến khi hết hạn `900ms` Auto-TTL mới chốt cờ hồi vị `wasRipplingRef`.

### 2.3. Đánh Đổi Trải Nghiệm Của Option B (Sanctuary Purity)
* **Phân tích UX/Gameplay**:
  * Option B (`showSpeechBubbles = false` mặc định) đã giải quyết triệt để rác thị giác (2D-on-3D billboard clutter) và triệt tiêu $100\%$ hiện tượng cắt chữ ở mép màn hình (`frustum clipping`), được Visual Critic chấm **9.0 / 10**.
  * **Tuy nhiên, cái giá phải trả**: Người chơi trong trận đấu thực tế giờ đây **không còn nhìn thấy các khẩu hiệu ngoại giao vĩ mô** (`"Vị Thế Chi Phối"`, `"Tích Lũy Tài Sản"`, v.v.) trên không gian 3D.
  * Toàn bộ bộ từ vựng tài chính vĩ mô này hiện chỉ tồn tại để thỏa mãn thuộc tính DOM `data-testid="diplomacy-speech-bubble-p1..p4"` cho test case `TC-403.04a`. Nếu thông tin này không được hiển thị bổ trợ trên 2D HUD (Player Card), nó sẽ trở thành một "tính năng ngầm" không mang lại giá trị trải nghiệm cho người dùng.

---

## 3. BẢNG ĐỐI CHIẾU TIÊU CHÍ CÁNH CỔNG HIẾN PHÁP (CONSTITUTIONAL GATES)

| Cánh Cổng Kiểm Soát | Chỉ Số Quy Định | Kết Quả Thực Tế Đạt Được | Đánh Giá Pháp Y |
|:---|:---|:---|:---:|
| **Plan Length Gate** | <= 200 dòng (Lean Plan) | 137 dòng vật lý, 0 code-dump | **ĐẠT CHUẨN** 🟢 |
| **Buffer Zone Guard** | File >= 350 LOC phải Refactor-First | `monopoly_plaza_visuals.ts` giảm từ 397 -> 315 LOC | **XUẤT SẮC** 🟢 |
| **RED Inversion Gate** | Bắt buộc lỗi do assertion runtime | Ghi nhận 7 lỗi AssertionError cụ thể, 0 syntax error | **ĐẠT CHUẨN** 🟢 |
| **Living Test Budget** | <= 600 LOC / test suite | **595 LOC (557 SLOC)** | ⚠️ **CẢNH BÁO NGUY HIỂM** |
| **Zero Dirty Casts** | 0 `as any`, 0 `as unknown as T` | 0 dirty casts trên toàn bộ diff mã nguồn | **ĐẠT CHUẨN** 🟢 |
| **Anti-TIDD Invariant** | Cấm đẻ method/prop chỉ để test | Tồn tại cờ kép `enableMobileInstancedPool` | 🟠 **CHƯA ĐẠT CHUẨN** |
| **Chaos Mutation Gate** | Tiêu diệt tối thiểu 85% mutants | **33/33 mutants bị tiêu diệt (100% kill rate)** | **XUẤT SẮC** 🟢 |
| **SSOT Knowledge Fold** | `FEATURE_MAP.md` <= 30 KB | 27.3 KB, cập nhật đầy đủ Hàng 13 | **ĐẠT CHUẨN** 🟢 |

---

## 4. CHỈ THỊ HÀNH ĐỘNG KHẮC PHỤC (ACTIONABLE DIRECTIVES)

Để bảo đảm an toàn tuyệt đối cho hệ thống CI và độ tin cậy của tài liệu bàn giao, yêu cầu thực thi ngay 4 chỉ thị sau:

1. **CHỈ THỊ 1: KHÓA ĐÓNG BĂNG TỆP TEST IMP-406 (TEST LOCK DIRECTIVE)**
   * Tuyệt đối **KHÔNG** chỉnh sửa, thêm assert hoặc thêm import vào tệp [`tests/client/imp406_mobile_instanced_monopoly_archway.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp406_mobile_instanced_monopoly_archway.test.ts).
   * Mọi kịch bản kiểm thử phát sinh liên quan đến Monopoly Archways trong tương lai bắt buộc phải được đặt trong tệp mới (ví dụ: `imp406_b_domino_edge_cases.test.ts`).

2. **CHỈ THỊ 2: ĐỒNG BỘ HÓA SỐ LIỆU 1:1 TRÊN BÁO CÁO NGHIỆM THU**
   * Hiệu chỉnh Bảng 4.1 trong [IMP-406_report.md](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/improvements/IMP-406-mobile-instanced-monopoly-archway-and-domino-shockwave_report.md) theo đúng kết quả của `scripts/check_loc.mjs`:
     * `war_room_stage_layer.tsx`: **271 SLOC / 293 Lines**.
     * `monopoly_mobile_archway_visuals.ts`: **265 SLOC / 286 Lines**.
     * `monopoly_plaza_fusion.tsx`: **214 SLOC / 227 Lines**.
     * `monopoly_plaza_visuals.ts`: **277 SLOC / 315 Lines**.

3. **CHỈ THỊ 3: ĐĂNG KÝ VÉ KHỬ NỢ CÔNG NGHỆ ANTI-TIDD (TECH DEBT BACKLOG)**
   * Khởi tạo ticket kỹ thuật trong chu kỳ tiếp theo nhằm tái cấu trúc `MonopolyPlazaFusionProps`: Thay thế cặp boolean (`isMobile`, `enableMobileInstancedPool`) bằng một enum phân định rõ ràng `archwayRenderMode: 'DESKTOP_BATCHED' | 'MOBILE_INSTANCED' | 'DISABLED'`, đồng thời loại bỏ assertion lỗi thời trong `TC-401.04c`.

4. **CHỈ THỊ 4: ĐƯA THUẬT NGỮ TÀI CHÍNH VĨ MÔ VÀO GIAO DIỆN 2D HUD**
   * Đề xuất bổ sung nhãn hiển thị vị thế chiến thuật (ví dụ: *"Vị Thế Chi Phối"*, *"Bảo Toàn Thanh Khoản"*) vào thẻ người chơi (`PlayerCard`) hoặc bảng chi tiết tài sản (`TitleDeedModal`) để người chơi thực sự trải nghiệm được chiều sâu chiến lược mà không cần dựa vào các biển chữ nổi 3D đã bị ẩn.

---
> **Người lập hồ sơ giám định:** Chuyên gia Review & Phản biện Cấp cao (Senior Forensic & Adversarial Auditor)  
> **Chữ ký xác thực:** `VTCOON-AUDIT-IMP406-VERIFIED-20261015`
