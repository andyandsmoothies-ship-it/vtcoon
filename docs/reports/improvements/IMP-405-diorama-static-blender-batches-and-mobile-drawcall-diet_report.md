# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-405
## PLAN_IMP_405: Diorama Static Blender Batches, Saigon Cathedral Realism & Mobile Draw-Call Diet (Phase 5.2)

> **Mã Ticket:** `IMP-405`  
> **Phân hệ thực tế:** `client-3d`  
> **Ngày hoàn thành:** 2026-10-15  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

> **Mô tả cốt lõi**: Hợp nhất tĩnh các khối hình học Diorama ngoại vi trên Mobile nhằm cắt giảm **58 nút `<mesh>` (60 lệnh vẽ Draw Calls ban ngày)** từ `73` xuống còn `15` `<mesh>`, điêu khắc lại mô hình Blender 5.2 LTS Nhà Thờ Đức Bà Sài Gòn (`public/models/landmarks/landmark_cathedral.glb`) với `ShaderNodeVertexColor` (`COLOR_0` Vertex-Color + Cavity AO), giải phóng khoảng hở đại lộ AABB `+0.17m` (`17cm`) giữa Nhà Thờ và Bùng binh Công xã Paris, đồng thời chuẩn hóa tương phản kiến trúc khu phố cổ Chợ Lớn và cụm cao ốc tài chính Quận 1.

### 1.1. Các Hạng Mục Kỹ Thuật & Thị Giác Trọng Tâm Đã Hoàn Tất
1. **Cắt Giảm Draw Calls Trên Mobile (`73 -> 15` `<mesh>` = `-58` Meshes / `-60` Lệnh Vẽ Ban Ngày)**:
   - **[`DioramaBoardRim`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx#L102-L157)**: Hợp nhất `8` thanh viền bàn cờ thành `2` `BufferGeometry` Singleton (`walnutRimGeom` `#78350F` và `brassTrimGeom` `#D97706`) khi `isMobile === true` (**giảm `8 -> 2` `<mesh>`, tiết kiệm `6` Draw Calls**), trong khi vẫn giữ nguyên `8` `<boxGeometry>` trên Desktop (`isMobile === false`) để bảo toàn `TC-356.01` & `TC-356.03`.
   - **[`DioramaContainerPort`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_container_port.tsx#L34-L82)**: Hợp nhất `39` nút `<mesh>` / `<RoundedBox>` của Cảng Cát Lái thành `5` nút `<mesh>` trên Mobile gồm `3` khối ban ngày (gờ chắn bánh xe 3D `#FACC15` cao `0.025m`, khối bến cảng + 10 container + xe đầu kéo `portStructuresVertexAoGeom` với nóc container thép công nghiệp tối `#1E293B` đồng bộ với bản Desktop, khối 2 cẩu giàn `gantryCranesVertexAoGeom`) và `2` đèn cảnh báo hàng không `#EF4444` chỉ hiển thị vào ban đêm (`visible={isNight}`) (**giảm `39 -> 5` `<mesh>` = `-34` Meshes trong Scene Graph và `-36` Draw Calls ban ngày**).
   - **[`DioramaHeritageDistrict`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_heritage_district.tsx#L91-L273)**: Hợp nhất `26` nút `<mesh>` / `<RoundedBox>` (gồm `1` thềm gạch bông + `11` khối `CathedralProceduralFallback` + `3` thềm trụ tròn bùng binh + `8` khối cột đèn gang + `3` khối tượng Đức Mẹ) xuống còn `8` nút `<mesh>` trên Mobile (`1` thềm gạch bông + `2` khối `cathedralBodyVertexAoGeom` & `cathedralAccentsGeom` + `3` thềm trụ tròn bùng binh + `2` khối `parisStatueAndPedestalGeom` & `parisStreetlampsGeom`) (**giảm `26 -> 8` `<mesh>` = `-18` Meshes / `-18` Draw Calls**).
2. **Điêu Khắc Blender 5.2 LTS & Bảo Toàn Tuyệt Đối Màu Đỉnh `COLOR_0` Trên Cả Desktop Lẫn Mobile**:
   - **Desktop ([`scripts/blender/build_heritage_cathedral_and_diorama.py`](file:///c:/Users/HP/Documents/GitHub/vtcoon/scripts/blender/build_heritage_cathedral_and_diorama.py) & [`public/models/landmarks/landmark_cathedral.glb`](file:///c:/Users/HP/Documents/GitHub/vtcoon/public/models/landmarks/landmark_cathedral.glb))**: Điêu khắc bằng `bpy`/`bmesh` với mặt bằng chữ thập (Cruciform Nave + Transept + Apse đa giác 6 cạnh), 3 cổng vòm Romanesque khoét lõm 5 mặt, cửa sổ Hoa Hồng nổi khối 6 phân đoạn và tháp chuông đôi 6 tầng cao `1.42m` (`1.162/1.500` tam giác, `89.7 KB`). Hàm `create_vertex_ao_material()` khởi tạo node `ShaderNodeVertexColor` (`layer_name = "COLOR_0"`) nối trực tiếp vào đầu vào `Base Color` của `ShaderNodeBsdfPrincipled`, giúp glTF 2.0 exporter và `THREE.GLTFLoader` kích hoạt chuẩn xác màu gạch đỏ Marseille (`#B45309`), chỉ đá vôi trắng (`#F8FAFC`), mái ngói (`#78350F`), chóp tháp đá đen (`#334155`), cửa sổ Hoa Hồng (`#0284C7`) và thánh giá đồng vàng (`#F59E0B`).
   - **Mobile ([`src/client/3d/diorama/diorama_static_blender_batches.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_static_blender_batches.ts))**: Bật `withColor = true` cho toàn bộ 4 batch di sản (`cathedralBodyVertexAoGeom`, `cathedralAccentsGeom`, `parisStatueAndPedestalGeom`, `parisStreetlampsGeom`) kết hợp `<meshStandardMaterial color="#FFFFFF" vertexColors={true} />` tại [`diorama_heritage_district.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_heritage_district.tsx#L98-L109) để không nhân chồng màu nền làm xỉn màu đỉnh và giữ tách biệt hoàn toàn màu cửa sổ Hoa Hồng (`#0284C7`) với 2 thánh giá đồng (`#F59E0B`), tượng Đức Mẹ trắng (`#F8FAFC`) với bệ đá (`#CBD5E1`), và thân cột đèn gang đen (`#334155`) với bóng đèn vàng (`#FDE047`).
3. **Giải Phóng Khoảng Hở AABB `+0.17m` (`17cm`) Giữa Nhà Thờ Đức Bà Và Bùng Binh Công Xã Paris**:
   - Đặt `HeritageCathedralGroup` tại `position={[0.2, 0, 0.88]}` (chiều sâu đế `0.76m` $\Rightarrow Z_{\text{cathedral\_min}} = 0.88 - 0.38 = +0.50\text{m}$) và dịch chuyển `cong-xa-paris-plaza` về `position={[0.2, 0, -0.22]}` (bán kính `R = 0.55m` $\Rightarrow Z_{\text{plaza\_max}} = -0.22 + 0.55 = +0.33\text{m}$), tạo khoảng cách tâm `1.10m` và **khoảng hở đại lộ thực tế mép-tới-mép `+0.17m` (`17cm`, `0%` chồng lấn AABB)**, đồng thời bố trí 4 cây xanh đại lộ Tây Nam (`x = -5.15`, `x = -3.55`) ôm dọc vỉa hè ngoài bùng binh.

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-405.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-405.md) | Thẩm định kế hoạch đạt 0 defects, 4 nhóm contract invariants clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/client/imp405_diorama_static_blender_batches.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp405_diorama_static_blender_batches.test.ts) | 11 atomic tests, 43 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/IMP-405_snapshot.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/IMP-405_snapshot.json) | 7 tệp mã nguồn & pipeline Blender cập nhật/thêm mới, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.0: Dual-Viewport** | Puppeteer Headless Probe | Desktop (1280x800) [`imp-405_desktop.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-405_desktop.jpg) & Mobile (360x740) [`imp-405_mobile_360.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-405_mobile_360.jpg) | **CAPTURED** 📸 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-405.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-405.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-3d` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-405.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-405.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 3.91 | **APPROVED** 🛡️ |
| **Trạm 3.2: UI/UX Craft Review** | `game-3d-visual-critic`<br>[`.agents/audit/3D_VISUAL_REVIEW_IMP-405.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/3D_VISUAL_REVIEW_IMP-405.md) | Chuẩn hóa màu đỉnh `COLOR_0`, khoảng hở AABB `17cm`, bao quát trọn vẹn trên màn hình dọc 360px | **8.8 / 10 (3D AAA Verified) 🎨** |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 32/32 mutants mục tiêu bị tiêu diệt (18 source-level AST mutants, kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Thẩm định kế hoạch đạt 0 defects, 4 nhóm contract invariants clean.
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa**:
  - **[ADV-OBJ] Tính Hợp Lệ Của Mục Tiêu & Hiện Trạng Đĩa Vật Lý**
    - **Target reachable?**: Có — [`MiniatureCityDiorama`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx#L300-L328) được gắn trong cả `GameBoard` ([`src/client/3d/board_layout.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_layout.tsx)) và `SunnyIslandLobbyScene` ([`src/client/3d/sunny_island_lobby_scene.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/sunny_island_lobby_scene.tsx)), trực tiếp kết xuất [`DioramaBoardRim`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx#L102-L157), [`DioramaContainerPort`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_container_port.tsx#L34), và [`DioramaHeritageDistrict`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_heritage_district.tsx#L156).
    - **Baselines verified?**: Có — toàn bộ số lượng `<mesh>` và số dòng mã khớp 1:1 với đĩa vật lý: [`DioramaBoardRim`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx#L102-L157) giảm từ **8 nút `<mesh>`** xuống **2 nút `<mesh>`** (`-6` meshes); [`DioramaContainerPort`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_container_port.tsx#L34-L246) giảm từ **39 nút `<mesh>` / `<RoundedBox>`** xuống **5 nút `<mesh>`** (`3` khối ban ngày + `2` đèn cảnh báo ban đêm, `-34` meshes / `-36` lệnh vẽ ban ngày); [`DioramaHeritageDistrict`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_heritage_district.tsx#L156-L286) giảm từ **26 nút `<mesh>` / `<RoundedBox>`** xuống **8 nút `<mesh>`** (`-18` meshes). Tổng cộng giảm từ `73` xuống `15` nút `<mesh>` (`-58` meshes / `-60` Draw Calls ban ngày trên Mobile).
    - **Verdict**: PASS — Toàn bộ thành phần mục tiêu và cơ sở tính toán Draw Calls trên Mobile đã được xác thực trên đĩa vật lý.
  - **[ADV-01] [ADV-REG] Nguy Cơ Gãy Kiểm Thử Hợp Đồng Sống `tests/client/imp356_android_depth_and_dice_landing.test.ts` (`TC-356.01`, `TC-356.03`)**
    - **Vector**: Xung đột kiểm thử hợp đồng sống (`ADV-REG`).
    - **Scenario**: Bộ kiểm thử [`tests/client/imp356_android_depth_and_dice_landing.test.ts#L49-L72`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp356_android_depth_and_dice_landing.test.ts#L49-L72) (`parseBoardRimMeshes`) gọi `React.createElement(DioramaBoardRim)` (tham số mặc định `{}`) qua `renderToStaticMarkup` và quét biểu thức chính quy `<boxgeometry\b[^>]*args="([^"]+)"` để kiểm tra `northSouthRails.length === 2`, `eastWestRails.length === 2` và `meshes.length === 8`.
    - **Consequence**: Nếu thay thế vô điều kiện 8 thẻ `<boxGeometry>` trong `DioramaBoardRim()` bằng 2 nút `<mesh geometry={...}>`, hàm `parseBoardRimMeshes` sẽ trả về mảng rỗng `[]`, làm gãy `TC-356.01` và `TC-356.03`.
    - **Hardening Directive**: Bổ sung tham số `readonly isMobile?: boolean` (mặc định `false`) vào [`DioramaBoardRim({ isMobile = false })`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx#L102) và truyền `<DioramaBoardRim isMobile={isMobile} />` tại `MiniatureCityDiorama`: khi `isMobile === true` chỉ kết xuất 2 nút `<mesh>` gộp tĩnh (`walnutRimGeom` và `brassTrimGeom`), còn khi `isMobile === false` giữ nguyên 8 nút `<boxGeometry>` để bảo toàn 100% `TC-356.01` & `TC-356.03`.
  - **[ADV-02] [ADV-REG] Nguy Cơ Gãy Kiểm Thử Hợp Đồng Sống `tests/client/imp337_diorama_mobile_freezing.test.ts` (`TC-337.02`, `TC-337.03`)**
    - **Vector**: Xung đột kiểm thử hợp đồng sống (`ADV-REG`).
    - **Scenario**: Bộ kiểm thử [`tests/client/imp337_diorama_mobile_freezing.test.ts#L125-L149`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp337_diorama_mobile_freezing.test.ts#L125-L149) (`TC-337.02` và `TC-337.03`) kết xuất `DioramaContainerPort({ isMobile: true })` ở pha ngày và đêm, lọc các thẻ `<mesh>` chứa `<meshBasicMaterial color="#EF4444" />` và kiểm tra `strobeMeshes.length === 2` cùng `visible === false / true`.
    - **Consequence**: Nếu nhánh `isMobile === true` loại bỏ 2 đèn cảnh báo hàng không `#EF4444` trên đỉnh cẩu giàn, `strobeMeshes.length` sẽ bằng `0` và làm gãy `TC-337.02` & `TC-337.03`.
    - **Hardening Directive**: Trong nhánh `isMobile === true` của [`src/client/3d/diorama/diorama_container_port.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_container_port.tsx), giữ nguyên 2 nút `<mesh visible={isNight}>` mang `<meshBasicMaterial color="#EF4444" />` bên cạnh 3 nút `<mesh>` ban ngày (gờ chắn bánh xe `#FACC15` dày `0.025m`, `portStructuresVertexAoGeom` với nóc container `#1E293B`, `gantryCranesVertexAoGeom`), vừa tiết kiệm 34 `<mesh>` (`36` lệnh vẽ ban ngày) vừa bảo toàn 100% `TC-337.02..03` và `TC-400.06/10`.
  - **[ADV-03] [ADV-STATE / Partial Failure] Quản Lý Vòng Đời Bộ Nhớ Đệm Singleton `BufferGeometry` Khi Chuyển Cảnh Lobby – Bàn Cờ**
    - **Vector**: Lỗi trạng thái bán phần & Giải phóng bộ nhớ đệm dùng chung (`ADV-STATE`).
    - **Scenario**: `diorama_static_blender_batches.ts` lưu trữ các `BufferGeometry` Singleton ở phạm vi mô-đun và cung cấp hàm `disposeDioramaStaticBlenderBatches()`. Vì `MiniatureCityDiorama` được gắn ở cả `SunnyIslandLobbyScene` lẫn `GameBoard`, nếu gọi `.dispose()` mà không đặt lại biến tham chiếu cache về `null`, hoặc gọi giải phóng bừa bãi khi unmount từng component con, lần truy cập tiếp theo sẽ nhận về `BufferGeometry` đã bị hủy.
    - **Consequence**: Khi chuyển từ sảnh chờ 3D vào bàn cờ trận đấu (hoặc chạy kiểm thử giải phóng bộ nhớ trước kiểm thử kết xuất), các khối gộp tĩnh sẽ mất dữ liệu đỉnh trên GPU.
    - **Hardening Directive**: Trong `src/client/3d/diorama/diorama_static_blender_batches.ts`, hàm `disposeDioramaStaticBlenderBatches()` phải gọi `.dispose()` trên mọi `BufferGeometry` đang lưu trong cache VÀ đặt lại toàn bộ biến cache về `null` để các lệnh gọi `getBatched*Geometries()` sau đó tự động khởi tạo lại hình học mới; đồng thời chỉ gắn `import.meta.hot?.dispose(disposeDioramaStaticBlenderBatches)`.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/client/imp405_diorama_static_blender_batches.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp405_diorama_static_blender_batches.test.ts)
- **Chỉ số kiểm thử**: **11 atomic tests**, **43 asserts** (mật độ trung bình: 3.91 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (Thất bại do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.
  - **Bằng chứng thất bại (Failure Snippet)**:
```text
AssertionError: expected [] to have a length of 18 but got +0 | AssertionError: expected BufferGeometry{} to be BufferGeometry{} | AssertionError: expected +0 to be greater than or equal to 0.22 | AssertionError: expected [ 0.2, +0, 0.75 ] to deeply equal [ 0.2, +0, 0.88 ]
```

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn & pipeline thay đổi**:
  - [`scripts/blender/build_heritage_cathedral_and_diorama.py`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/blender/build_heritage_cathedral_and_diorama.py) & [`public/models/landmarks/landmark_cathedral.glb`](file:///C:/Users/HP/Documents/GitHub/vtcoon/public/models/landmarks/landmark_cathedral.glb)
  - [`src/client/3d/diorama/diorama_static_blender_batches.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_static_blender_batches.ts)
  - [`src/client/3d/miniature_city_diorama.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx)
  - [`src/client/3d/diorama/diorama_container_port.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_container_port.tsx)
  - [`src/client/3d/diorama/diorama_heritage_district.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_heritage_district.tsx)
  - [`src/client/3d/diorama/diorama_shophouse_blocks.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_shophouse_blocks.tsx)
  - [`src/client/3d/diorama/diorama_highrise_blocks.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_highrise_blocks.tsx)
- **Chuyển trạng thái**: Toàn bộ **11/11 contract tests (`43/43` asserts) chuyển sang GREEN**.
- **Living Test Suites**: Bảo toàn nguyên vẹn `14/14` bộ kiểm thử sống (`461/461` bài test PASS), zero hồi quy logic hiện hành.

### Trạm 2.5: Fast Pre-Filter Mechanical Sweep (`scout` / `fast_prefilter.mjs`)
- **TypeScript**: `tsc --noEmit` vượt qua với 0 lỗi (Exit Code 0).
- **Dirty Casts**: Tuyệt đối không sử dụng `as any` hoặc dirty type casting.
- **LOC Ceilings**: Tất cả các tệp đều nằm trong hạn mức trần của từng phân hệ (Tier 1 <= 400, Tier 2 <= 500, Tier 3 <= 800, Test <= 600).

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
1. **Spec & Scope Gatekeeper (`spec-reviewer`)**:
    - **Phán quyết**: **APPROVED** 📋
    - **Xác nhận phạm vi**: 100% các thay đổi nằm trong phân hệ mục tiêu (`client-3d` & `scripts/blender`), zero scope creep.
2. **Deep Architecture & Anti-Slop Auditor (`code-reviewer`)**:
    - **Phán quyết**: **APPROVED** 🛡️
    - **Chỉ số Anti-Slop**: 0 violations trên 6 cờ cảnh báo (Deep modules, Zero pass-through wrappers, Zero TIDD).
    - **Bộ nhớ & Timer**: Singleton `BufferGeometry` được quản lý an toàn qua `disposeDioramaStaticBlenderBatches()`, đặt lại cache về `null` khi giải phóng.
3. **UI/UX Craft & Ergonomics Auditor (`game-3d-visual-critic`)**:
    - **Phán quyết**: **8.8 / 10 (3D AAA Verified) 🎨**
    - Xác thực trực quan trên cả hai khung hình Desktop (`1280x800`) và Mobile (`360x740`, camera `pos=[16.5, 20.0, 20.0], target=[-0.6, 0.2, 3.4]`): Nhà Thờ Đức Bà hiển thị đầy đủ sắc độ gạch Marseille `#B45309`, chỉ đá vôi trắng `#F8FAFC`, thánh giá đồng `#F59E0B`; khoảng hở đại lộ `17cm` tách biệt hoàn toàn với Bùng binh Công xã Paris; Cảng Cát Lái hiển thị nóc container thép tối `#1E293B` chuẩn xác.

### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: **32/32 mutants mục tiêu bị tiêu diệt** (`18/18` source-level AST mutants + `14/14` contract assertion mutants, kill rate: `100%`, `0` survived).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs imp-405` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-405 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `build_heritage_cathedral_and_diorama.py` | [`scripts/blender/build_heritage_cathedral_and_diorama.py`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/blender/build_heritage_cathedral_and_diorama.py) | Tier 3 (Offline Blender 5.2 Pipeline) | **384 SLOC** | 452 Lines | <= 800 LOC | ✅ Đạt chuẩn |
| `diorama_static_blender_batches.ts` | [`src/client/3d/diorama/diorama_static_blender_batches.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_static_blender_batches.ts) | Tier 2 (UI/3D/Views) | **233 SLOC** | 246 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `miniature_city_diorama.tsx` | [`src/client/3d/miniature_city_diorama.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx) | Tier 2 (UI/3D/Views) | **304 SLOC** | 328 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `diorama_container_port.tsx` | [`src/client/3d/diorama/diorama_container_port.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_container_port.tsx) | Tier 2 (UI/3D/Views) | **230 SLOC** | 246 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `diorama_heritage_district.tsx` | [`src/client/3d/diorama/diorama_heritage_district.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_heritage_district.tsx) | Tier 2 (UI/3D/Views) | **277 SLOC** | 286 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `diorama_shophouse_blocks.tsx` | [`src/client/3d/diorama/diorama_shophouse_blocks.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_shophouse_blocks.tsx) | Tier 2 (UI/3D/Views) | **89 SLOC** | 100 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `diorama_highrise_blocks.tsx` | [`src/client/3d/diorama/diorama_highrise_blocks.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_highrise_blocks.tsx) | Tier 2 (UI/3D/Views) | **217 SLOC** | 228 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `imp405_diorama_static_blender_batches.test.ts` | [`tests/client/imp405_diorama_static_blender_batches.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp405_diorama_static_blender_batches.test.ts) | Living Test | **390 SLOC** | 428 Lines | <= 600 LOC | ✅ Đạt chuẩn |

---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

- **Tính toàn vẹn hệ thống**: Gói cải tiến `IMP-405` đã khắc phục triệt để toàn bộ các phát hiện kiểm toán đối kháng (`[BUG-01]` đến `[BUG-04]` cùng đồng bộ hóa chỉ số báo cáo & `FEATURE_MAP.md`), cung cấp đầy đủ bằng chứng vật lý từ mã nguồn, pipeline Blender 5.2 LTS, kiểm thử hợp đồng, hình ảnh trực quan hai khung hình đến biên bản kiểm toán độc lập.
- **Sẵn sàng triển khai**: Mã nguồn đã sẵn sàng đóng gói và triển khai lên môi trường sản phẩm.
