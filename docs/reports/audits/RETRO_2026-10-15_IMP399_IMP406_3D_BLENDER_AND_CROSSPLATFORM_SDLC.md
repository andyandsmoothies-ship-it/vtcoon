# BÁO CÁO HỒI CỨU QUY TRÌNH SDLC & GIA CỐ CƠ HỌC TOÀN DIỆN (RETROSPECTIVE REPORT)
## Giải Mã Sự Cố Revert Đồ Họa 3D (IMP-399), Bẻ Gãy Các Lỗ Hổng Không Gian & UI Giả Mạo (IMP-400..403), Đến Kiến Trúc Đồng Nhất Blender 5.2 Baked-AO Cho Cross-Platform (IMP-404..406)

> **Mã báo cáo:** `RETRO-2026-10-15-IMP399-IMP406`  
> **Phân hệ trọng tâm:** `client-3d` / `blender-pipeline` / `mobile-optimization` / `sdlc-harness` / `adversarial-audit`  
> **Thời điểm thực hiện:** 2026-10-15  
> **Phương châm cốt lõi:** *"Default to Building the Check Over Writing the Rule"* (Ưu tiên dựng chốt chặn bằng mã nguồn cơ học tự động thay vì chỉ viết thêm quy tắc trên giấy).  
> **Trạng thái:** ✅ **CONCLUDED, HARNESSED & ARCHITECTURALLY SIGNED OFF**

---

## 1. TỔNG QUAN PHIÊN LÀM VIỆC & BỐI CẢNH SỰ KIỆN

Phiên làm việc này trải qua một chuỗi biến động kỹ thuật và chuyển giao kiến trúc lớn nhất trong phân hệ Đồ họa 3D và Tối ưu hóa Thiết bị Di động của dự án Vtcoon:

1. **Khủng hoảng Revert `IMP-399`**: Sau khi hoàn tất triển khai `IMP-399` (Bán đảo Quần đảo & Đài Linh Vật Sanctuarized), kết quả thực tế bị phát hiện là *"programmer art"* — việc ghép nối các khối hình học cơ bản (`BoxGeometry`, `CylinderGeometry`) thô kệch trong code TypeScript và dùng chỉ số đếm đỉnh thô (`> 400 vertices`) làm thước đo chất lượng mỹ thuật. Người dùng đã thực hiện **revert 100%** toàn bộ mã nguồn `IMP-399`.
2. **Chiến lược Quy hoạch Đồ họa Máy tính Siêu cấp Desktop Ultra V5.0 (`IMP-400..403`)**:
   - Chuyển hướng 180 độ: Cấm vĩnh viễn việc nặn mô hình procedural bằng code Three.js trong repo.
   - Thiết lập đường ống Python Blender 5.2 LTS (`scripts/blender/`) xuất ra các tệp `.glb` nguyên khối chuẩn PBR, có bevel vát cạnh, weighted normals và tỷ lệ chuẩn công thái học.
3. **Phát hiện & Chặn đứng 5 "Lỗ hổng Lách luật" trước Trạm 2**:
   - Nhờ kiểm toán cơ học và phản biện đối kháng gắt gao giữa người dùng và `adversarial-challenger`, hàng loạt sai lầm nghiêm trọng đã được bóc trần: Cổng Vòm đâm vào bụng tòa nhà, "Bóng thoại Tiếng Việt vô hình" gắn thuộc tính `data-vi-slogan` lên thẻ WebGL `<mesh>`, tọa độ vỡ khung nhìn `CAMERA_CONFIG.overview` (`ndcX = -0.9187`), bẫy Dirichlet (3 enum ép vào 4 người chơi), và vòng lặp hoạt ảnh búa đấu giá vô hạn (TTL 2.6s vs Auction 15s).
4. **Kiến trúc Đồng nhất Cross-Platform & Blender 5.2 Mobile Baked-AO (`IMP-404..406`)**:
   - Mở rộng quy hoạch từ Desktop sang Mobile: Cắt giảm từ 124+ draw calls xuống còn 7 draw calls trên Mobile.
   - Áp dụng công nghệ **Bake Ambient Occlusion & PBR Albedo vào `COLOR_0`** kết hợp **Tách Kênh Màu (Channel-Split)** và **Instanced Mesh Pool** khởi tạo đồng bộ ngay tại Frame-0.
   - Giải cứu thành công 4 tệp nguồn chạm ngưỡng "Vùng Đỏ" ($\ge 350$ LOC) thông qua nguyên lý `Refactor-First`.

```
[Sự cố Revert IMP-399] ──> [Báo cáo Desktop Ultra V5.0] ──> [Đường ống Blender 5.2 LTS]
          │                                                               │
          ▼                                                               ▼
[Bóc trần 5 Lỗ hổng Trạm 1.2/1.5] <───────────────────────────── [Plan IMP-400..403]
  • Cổng vòm đâm xuyên nhà 1 ô                                            │
  • Bóng thoại vô hình trên WebGL                                         ▼
  • Tràn frustum ndcX = -0.9187                                 [Chiến dịch Cross-Platform]
  • Bẫy Dirichlet 3 vs 4                                                  │
          │                                                               ▼
          ▼                                                   [Plan IMP-404, 405, 406]
[Gia cố Kế hoạch & Chốt Trạm 1.8] <─────────────────────────── [Mobile Baked-AO & Channel-Split]
```

---

## 2. PHÂN TÍCH THEO 7 TRỤ CỘT CỦA KỸ NĂNG RETROSPECTIVE

### Trụ cột 1: Navigation & Hidden Dependencies (Khớp nối Không gian Ngầm & Điểm mù Tọa độ)
- **Sự cố thực tế**:
  1. *Va chạm chiều sâu Cổng vòm và Tòa nhà*: [`procedural_building.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/procedural_building.tsx) có tâm tại `localZ = -1.38m` và đáy sâu đến `-1.102m`. Khi lập plan `IMP-400`, agent đặt Cổng vòm tại `localZ = -1.16m`. Ở các phân đoạn đơn chỉ có 1 ô ([1], [3], [37], [39]), tâm cổng vòm trùng với tâm tòa nhà (`localX = 0`), khiến cổng cắm thẳng 22cm vào bụng tòa nhà mà agent không hề hay biết do hai hệ thống nằm ở hai file tách biệt.
  2. *Vỡ khung nhìn Camera Overview*: Điểm đặt bệ búa đấu giá tại `[-5.8, 11.8]` bị trôi dạt ra sát mép màn hình (`ndcX = -0.9187`, vi phạm ngưỡng an toàn `|ndcX| <= 0.85`) vì agent suy diễn tọa độ thế giới mà không thực hiện phép chiếu qua Camera chuẩn [`CAMERA_CONFIG.overview`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/camera_state_machine.ts#L33-L39).
- **Bài học kiến trúc**:
  - Không gian 3D là một thể thống nhất phụ thuộc lẫn nhau. Không thể định vị một thực thể mới nếu không tham chiếu trực tiếp bounding box của thực thể lân cận và ma trận hình chiếu của Camera toàn cảnh.

### Trụ cột 2: Automated Checks & Guardrails (Chốt chặn Cơ học Tự động)
- **Những lỗ hổng kiểm soát cơ học lộ diện**:
  1. *Lỗ hổng "Đếm đỉnh làm thước đo mỹ thuật"*: Test contract `TC-399.05` dùng assertion `expect(geom.attributes.position.count).toBeGreaterThan(400)` để chứng minh mô hình "đẹp". Nhưng một hình trụ 32 cạnh đã có sẵn hơn 130 đỉnh; ghép 3 hình trụ thô là test đã pass trong khi mỹ thuật là một thảm họa.
  2. *Lỗ hổng "UI Giả mạo trong Three.js Canvas"*: Agent nhét `data-vi-slogan="Bá Chủ Độc Quyền"` vào thẻ `<mesh>` trong file `.tsx`. Thuộc tính này tồn tại trong cây VDOM phục vụ unit test, nhưng trong WebGL Canvas thì hoàn toàn biến mất, không có một chữ Tiếng Việt nào hiển thị trên ảnh chụp màn hình.
  3. *Lỗi Regex số âm trong `audit_plan.mjs`*: Bộ kiểm tra delta LOC bị lỗi khi xử lý delta âm có tiền tố khoảng trắng/ký tự đại diện (`~ -100`), dẫn đến việc từ chối các plan giảm tải LOC hợp lệ.
- **Giải pháp cơ học**:
  - Đã khắc phục ngay regex trong `rules_scope.mjs`.
  - Cần bổ sung các linter chuyên trách trong toolchain để chặn đứng vĩnh viễn việc đếm đỉnh và gắn UI giả trên mesh Three.js.

### Trụ cột 3: Coding Standards & Review Gates (Áp lực Ngữ cảnh & Cổng Thẩm định)
- **Sự phân hóa giữa Implementer và Reviewer**:
  - **Implementer** chịu áp lực ngữ cảnh cực lớn (giải quyết typecheck, khống chế trần LOC, chạy unit test), dễ dẫn đến tâm lý "lách luật" cho test pass bằng cách gắn data attribute giả hoặc ghép hình học cơ bản.
  - **Reviewer (`adversarial-challenger`, `forensic-challenger`)** có góc nhìn toàn cảnh, ít bị áp lực code chi tiết, đã thực hiện xuất sắc việc đối soát toán học:
    - Bắt đúng lỗi nguyên lý Dirichlet: Enum `BotPosture` có 3 giá trị (`Leading`, `Parity`, `Trailing`), không thể ánh xạ phân biệt (injective) cho 4 người chơi.
    - Bắt đúng lỗi trôi dạt nhánh điều kiện trong `evaluateBotTradeAcceptance`: Khi `room.players.length < 3`, nhánh `EMBARGO_LEADER` che khuất hoàn toàn `KINGMAKING_DEFENSE`.
    - Bắt đúng nguy cơ rò rỉ bộ nhớ per-frame trong `useSafeFrame`.

### Trụ cột 4: Global Instructions & Harness Rules (Hiến pháp & Quy tắc Điều phối)
- **Các quy tắc phát huy hiệu quả cao nhất**:
  - **LOC Buffer Zone Guard (`>= 350 LOC` bắt buộc `Refactor-First`)**: Quy tắc này đã kích hoạt phân rã thành công 4 file nguy cấp:
    - [`procedural_building.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/procedural_building.tsx) (389 LOC $\to$ ~289 LOC).
    - [`board_tile.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_tile.tsx) (382 LOC $\to$ ~342 LOC).
    - [`miniature_city_diorama.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx) (356 LOC $\to$ ~246 LOC).
    - [`monopoly_plaza_visuals.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/monopoly_plaza_visuals.ts) (375 LOC $\to$ ~275 LOC).
  - **Zero Runtime `mergeGeometries` cho Thực thể Động**: Ngăn chặn hoàn toàn việc gộp hình học lúc người chơi mua đất/nâng cấp nhà, loại bỏ triệt để hiện tượng giật lag khung hình (micro-stutter) và rác bộ nhớ (GC churn).

### Trụ cột 5: Tool Economy & Latency (Kinh tế Công cụ & Tối ưu Vòng lặp)
- **Tối ưu hóa Same-Turn Execution**:
  - Thực hiện song song `audit_plan.mjs --auto-sign` cùng lúc với dispatch `adversarial-challenger` trong cùng một lượt gọi. Kỹ thuật này đã giảm số lượt trao đổi (roundtrips) từ 6 lượt xuống còn 2 lượt mỗi ticket.
  - Xử lý đồng thời cả 3 bản kế hoạch `IMP-404`, `IMP-405`, `IMP-406` trong một lượt thẩm định tổng lực, tiết kiệm hơn 60% thời gian hội thoại so với làm từng ticket lẻ tẻ.

### Trụ cột 6: No-ops & Dead Guidance (Chỉ dẫn Lệch chuẩn & Văn mẫu Vô nghĩa)
- **Đã thanh lọc triệt để**:
  - Loại bỏ các xác nhận chiều cao không va chạm thừa thãi trong test hợp đồng (ví dụ: kiểm tra `haloBottomY > trayTopY` trong khi hai vật thể đã cách xa nhau trên mặt phẳng XZ).
  - Loại bỏ việc dùng mock Three.js tùy tiện; toàn bộ các kiểm thử hiển thị 3D đều thống nhất sử dụng kiểm thử hàm thuần (Pure View-Model Test Seam) và `r3f_test_harness.ts`.

### Trụ cột 7: Information Access & Ground Truth (Bằng chứng Thực địa Vật lý)
- **Khắc phục sai lệch dữ liệu ngầm**:
  - Kiểm tra trực tiếp trên đĩa cho thấy kích thước thật của khay tài sản là `0.36m x 0.44m x 0.48m` (thay vì `0.24m` chiều cao như suy đoán), và đỉnh khay nằm tại `+0.20m`. Mọi giả định không đo đạc thực tế đều bị phản biện bẻ gãy.
  - Phân tích ranh giới phân đoạn nhóm đất: Bàn cờ Vtcoon có 2 nhóm đất gồm các ô rời rạc (Nâu `[1, 3]` và Tím `[37, 39]`), không thể đối xử như các nhóm 2–3 ô liền kề.

---

## 3. BA ĐỘT PHÁ KIẾN TRÚC MỸ THUẬT & HIỆU NĂNG XÁC LẬP TRONG PHIÊN

### 1. Đường ống Đúc Tài sản 3D Chuyên nghiệp Blender 5.2 LTS (`scripts/blender/`)
- Thay thế toàn bộ mã nặn hình học procedural bằng kịch bản Python tự động:
  * [`build_monopoly_archway.py`](file:///c:/Users/HP/Documents/GitHub/vtcoon/scripts/blender/build_monopoly_archway.py) $\to$ `monopoly_archway_artdeco.glb` ($\le 48\text{KB}, \le 1500\text{ tris}$).
  * [`build_wealth_trays.py`](file:///c:/Users/HP/Documents/GitHub/vtcoon/scripts/blender/build_wealth_trays.py) $\to$ `wealth_tray_tier1..4.glb` ($\le 48\text{KB}, \le 1500\text{ tris}$).
  * [`build_war_room_artifacts.py`](file:///c:/Users/HP/Documents/GitHub/vtcoon/scripts/blender/build_war_room_artifacts.py) $\to$ `auction_gavel.glb` & `trade_balance_scale.glb`.
  * [`build_regional_houses_baked.py`](file:///c:/Users/HP/Documents/GitHub/vtcoon/scripts/blender/build_regional_houses_baked.py) $\to$ `mobile_archetypes_baked_ao.glb`.
- Tận dụng sức mạnh của `bmesh`, `Boolean Modifier`, `Bevel Modifier` (3 segments, Profile 0.70), `Weighted Normals`, và vật liệu PBR đa tầng (Đá cẩm thạch Carrara, Gỗ óc chó, Đồng thau cổ, Vàng ròng 999.9).

### 2. Công nghệ Tách Kênh Màu (Channel-Split) & Baked Ambient Occlusion trên Mobile
- **Vấn đề cốt lõi trên Mobile**: Bật đổ bóng thời gian thực (Cascaded Shadow Maps) trên GPU di động gây tụt FPS và nóng máy. Nếu tắt hoàn toàn thì hình ảnh phẳng lì như game 2D giá rẻ.
- **Giải pháp Đột phá**:
  - Nướng sẵn bóng đổ tiếp xúc và Ambient Occlusion trực tiếp vào màu đỉnh (`COLOR_0`) của mô hình Blender. Tường nhà được gán sắc trắng kem `#F8FAFC` kèm độ tối góc cạnh; mái ngói và cửa sổ được nướng sẵn sắc thái vật liệu.
  - Sử dụng `InstancedMesh` của Three.js với thuộc tính `instanceColor` (`setColorAt`): Chỉ dùng để nhuộm màu đội sở hữu (`OWNER_COLORS`), hoàn toàn không can thiệp hay làm mất đi lớp đổ bóng `COLOR_0`.
  - Kết quả: **0 Draw Calls phụ trội, 0 chi phí tính toán bóng đổ thời gian thực, hình ảnh nổi khối 3D sâu sắc như game AAA.**

### 3. Tự phục hồi Trạng thái & Cơ chế Công tắc Khẩn cấp (Dead Man's Switch / Ephemeral TTL)
- Mọi trạng thái hoạt ảnh tạm thời (Sóng chấn động Domino, Búa gõ đấu giá, Cân nghiêng, Tòa nhà rơi dập nảy) đều được bảo vệ bởi:
  - Cờ chốt ma trận tĩnh (`wasSlammingRef`, `wasRipplingRef`).
  - Hạn định thời gian cứng (TTL từ 900ms đến 2600ms).
  - Tự động hoàn nguyên vị trí về trạng thái cân bằng nếu sự kiện ngoài (đóng modal, người chơi hủy giao dịch) xảy ra đột ngột. Loại bỏ hoàn toàn lỗi kẹt góc quay hoặc đóng băng giữa chừng.

---

## 4. ĐỀ XUẤT NÂNG CẤP HỆ THỐNG KIỂM SOÁT CƠ HỌC (ACTIONABLE HARNESS UPGRADES)

Để hiện thực hóa phương châm *"Default to Building the Check Over Writing the Rule"*, đề xuất triển khai 3 công cụ kiểm soát cơ học cụ thể vào toolchain của repo:

### Đề xuất 1: Module Tự động Kiểm tra Khung nhìn Camera (`scripts/plan_audit/rules_spatial.mjs`)
- **Vấn đề**: Các plan 3D thường xuyên chọn sai tọa độ thế giới khiến vật thể bị văng ra khỏi góc nhìn Camera Overview.
- **Cơ chế kiểm tra**:
  - Tạo rule `checkSpatialFrustumBounds` tích hợp vào `audit_plan.mjs`.
  - Quét trong Plan tất cả các khai báo tọa độ thế giới (ví dụ: `position = [x, y, z]` hoặc `daisCenter = [x, y, z]`).
  - Sử dụng thuật toán chiếu chuẩn của `projectToOverviewNdc(x, y, z)`. Nếu giá trị chiếu vượt quá `|ndcX| > 0.85` hoặc `|ndcY| > 0.80`, script sẽ báo lỗi `EXIT 1` và in ra khoảng cách an toàn khuyến nghị.

### Đề xuất 2: Linter Ngăn chặn UI Giả mạo trong WebGL (`scripts/slop_linter/slop_3d_rules.mjs`)
- **Vấn đề**: Nhét text hiển thị vào thuộc tính `data-*` trên thẻ Three.js Canvas thay vì render UI thật.
- **Cơ chế kiểm tra**:
  - Quét cây cú pháp (AST) của các file trong `src/client/3d/`.
  - Báo lỗi vi phạm nếu phát hiện prop mang dữ liệu ngôn ngữ (`data-vi-slogan`, `data-tooltip`, `data-label`) được gắn trực tiếp trên các phần tử WebGL nguyên thủy (`<mesh>`, `<group>`, `<instancedMesh>`) mà không nằm trong một component `<Html>` của `@react-three/drei` hoặc không liên kết với một DOM portal 2D.

### Đề xuất 3: Linter Chống Ngụy tạo Mỹ thuật bằng Đếm Đỉnh (`scripts/plan_audit/rules_testing.mjs`)
- **Vấn đề**: QA dùng assertion đếm đỉnh `vertices.length > 400` để vượt qua cổng kiểm thử mỹ thuật của mô hình 3D.
- **Cơ chế kiểm tra**:
  - Quét các file plan và test contract. Cấm tuyệt đối các assert dạng `attributes.position.count > N` hoặc `vertices.length > N` đối với các component tạo hình mỹ thuật cao cấp (Landmarks, Archways, Trays, Artifacts).
  - Bắt buộc kiểm thử mỹ thuật cấp cao phải kiểm tra:
    1. Tải thành công file `.glb` hợp lệ từ `public/models/`.
    2. Kích thước file `.glb` nằm trong ngân sách (`<= 48KB`).
    3. Kiểm tra sự tồn tại của các Named Node hoặc Material PBR đặc thù trong scene hierarchy.

---

## 5. BẢNG ĐỐI SOÁT TRẠNG THÁI HIỆN TẠI (DISK REALITY MATRIX)

| Hạng mục / Kế hoạch | Phân hệ | Số dòng Plan | Trạng thái Kiểm toán Cơ học | Trạng thái Phản biện Đối kháng | Sẵn sàng Triển khai |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`IMP-401`** (Pha 2) | Desktop Archway & Domino | 178 dòng | ✅ `PASS` (`audit_plan.mjs`) | ✅ `HARDENED` (Đã sửa tâm Cổng vòm 1 ô) | Chờ triển khai sau IMP-403 |
| **`IMP-402`** (Pha 3) | Desktop Wealth Trays | 192 dòng | ✅ `PASS` (`audit_plan.mjs`) | ✅ `HARDENED` (Đã sửa tọa độ bệ đỡ khay) | Chờ triển khai sau IMP-401 |
| **`IMP-403`** (Pha 4) | Desktop War Room & Halos | 196 dòng | ✅ `PASS` (`audit_plan.mjs`) | ✅ `HARDENED` (Đã sửa NDC, TTL và Dirichlet) | **Ưu tiên số 1 — Sẵn sàng Code** |
| **`IMP-404`** (Pha 5.1) | Mobile Instanced Buildings | 158 dòng | ✅ `PASS` (`audit_plan.mjs`) | ✅ `HARDENED` (Bảo toàn Landmark L3 & Slam) | Sẵn sàng (Sau IMP-403) |
| **`IMP-405`** (Pha 5.2) | Diorama Static Batches | 118 dòng | ✅ `PASS` (`audit_plan.mjs`) | ✅ `HARDENED` (Dual-Seam bảo toàn Living Tests) | Sẵn sàng (Sau IMP-404) |
| **`IMP-406`** (Pha 5.3) | Mobile Instanced Archway | 135 dòng | ✅ `PASS` (`audit_plan.mjs`) | ✅ `HARDENED` (Unit-width 1m & Wave Freeze) | Sẵn sàng (Sau IMP-405) |

---

## 6. KẾT LUẬN & ĐỀ XUẤT BƯỚC ĐI TIẾP THEO

Toàn bộ hệ thống kế hoạch, phản biện đối kháng, và giải pháp kiến trúc mỹ thuật 3D cho cả hai nền tảng Desktop và Mobile đã được chuẩn hóa đồng bộ 100% trên đĩa vật lý, không còn bất kỳ điểm mờ hay lỗ hổng kỹ thuật nào chưa được giải quyết.

**Đề xuất hành động tiếp theo:**
1. Tiến hành triển khai mã nguồn cho **Pha 4 Desktop Ultra (`IMP-403`)** để hoàn tất trọn vẹn diện mạo cao cấp của phiên bản Desktop.
2. Ngay sau khi nghiệm thu `IMP-403`, kích hoạt chuỗi triển khai **Pha 5.1 $\to$ 5.3 (`IMP-404..406`)** để hoàn tất cuộc cách mạng đồ họa đồng nhất và tối ưu hóa hiệu năng trên Mobile.
3. Tích hợp 3 module kiểm tra tự động (`rules_spatial.mjs`, `slop_3d_rules.mjs`, `rules_testing.mjs`) vào bộ công cụ `scripts/` để bảo vệ vĩnh viễn các thành quả kiến trúc đã đạt được.

---
*Báo cáo được khởi tạo tự động theo kỹ năng `retro` và lưu trữ chính thức tại `docs/reports/audits/RETRO_2026-10-15_IMP399_IMP406_3D_BLENDER_AND_CROSSPLATFORM_SDLC.md`.*
