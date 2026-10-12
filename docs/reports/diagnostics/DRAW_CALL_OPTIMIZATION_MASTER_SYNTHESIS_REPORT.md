# BÁO CÁO TỔNG KẾT CHIẾN LƯỢC TỐI ƯU HÓA HIỆU NĂNG 3D & KHẮC PHỤC NGHẼN NHIỆT (VTCOON ENGINE)
## Comprehensive 3D Performance & Thermal Defense Master Synthesis Report

> **Mã tài liệu:** `DIAG-3D-MASTER-SYNTHESIS`  
> **Phân hệ mục tiêu:** `client-3d` (Three.js / React Three Fiber / WebGL Engine)  
> **Nguyên tắc tối cao:** **Bảo toàn 100% Chất lượng Nghệ thuật (Zero Visual Loss)** — Không cắt bỏ sa bàn, không làm mờ texture, không tắt mô hình.  
> **Mục tiêu hiệu năng:** Kéo 763 Draw Calls về $< 85\text{--}120$ Calls, ổn định sàn $\ge 45\text{--}60\text{ FPS}$, triệt tiêu nghẽn nhiệt sụp xung (Thermal Throttling) sau 2–3 phút thi đấu trên điện thoại di động.

---

## 1. BỐI CẢNH VẬT LÝ & ĐIỂM NGHẼN CỐT LÕI

### 1.1. Hiện tượng thực tế trên điện thoại (iPhone & Android)
Người chơi ghi nhận hiện tượng: *"Vừa vào game chạy mượt 55–60 FPS, sau 2–3 phút chơi thì máy nóng rực, FPS tụt dốc về 14–27 FPS"*.

Số liệu đối soát trực tiếp từ In-Game Telemetry Watchdog (`?debug=3d`):
* **Lúc 16:26 (Máy mát, vừa vào trận):** 549 Draw Calls | 48k Triangles | **59 FPS** (Frame time: ~16.8ms).
* **Lúc 16:29 (Sau 3 phút, mua nhiều đất):** **763 Draw Calls** | 46k Triangles | **14 FPS** (Frame time vọt lên: 70–94ms).
* **Căn nguyên bán dẫn:** Thiết bị quá nóng, cơ chế phần cứng **DVFS (Dynamic Voltage & Frequency Scaling)** kích hoạt **Thermal Throttling**, ép xung nhịp GPU/CPU giảm 40–50% để bảo vệ pin và chống quá nhiệt.

### 1.2. Phân tích điểm nghẽn kỹ thuật: Nghẽn ở đâu?
* **Đa giác (Triangles: 40k – 60k):** Rất nhẹ so với năng lực GPU di động hiện đại (ngân sách an toàn $\le 150\text{k}$). GPU không hề bị nghẽn ở khâu dựng hình tam giác hay shader.
* **Tử huyệt (The Culprit):** **763 Lệnh vẽ (Draw Calls)** phát ra từ luồng chính JavaScript của WebKit/Chrome sang GPU mỗi khung hình (60 lần/giây).
  * CPU phải thực hiện 763 lần chuyển đổi ngữ cảnh driver (Context Switch) liên tục mỗi 16ms.
  * Càng chơi lâu, người chơi càng mua nhiều đất, hệ thống lại mount thêm viền màu (`OwnerBaseTrim`), khay giá (`OwnerPricePill`), và khối nhà (`ProceduralBuilding`) $\implies$ Draw Calls phình to theo thời gian, game càng về cuối càng giật lag.

---

## 2. MA TRẬN ĐỐI CHIẾU TOÀN DIỆN 6 HƯỚNG TIẾP CẬN KỸ THUẬT

Bên cạnh 4 hướng tiếp cận kinh điển về mặt Hình học (A, B, C, D), hệ thống mở rộng thêm 2 hướng công nghệ hiện đại ở tầng Render Loop (E, F):

| Hướng tiếp cận | Cơ chế cốt lõi | Ưu điểm nổi bật | Đánh đổi / Rủi ro cần quản trị | Mức độ khả thi |
| :--- | :--- | :--- | :--- | :---: |
| **Hướng A: Gộp Lệnh Vẽ Triệt Để** *(Batching & Instancing)* | Dùng `mergeGeometries` cho sa bàn tĩnh và `InstancedMesh` cho 28 ô đất / khay giá. | • Giữ 100% vẻ đẹp 3D.<br>• Giảm 85% calls ($763 \to < 85$).<br>• Hiệu năng cuối game $O(1)$. | Quản lý buffer phẳng phức tạp; rủi ro Atlas số tiền động. | 🟡 Trung bình |
| **Hướng B: Phân Tầng Khoảng Cách** *(Distance LOD & Culling)* | Thuật toán ẩn chi tiết vi mô (cây nhỏ, thanh ray, viền mỏng) khi camera ở xa. | • Rất ít can thiệp code.<br>• Triển khai nhanh, an toàn cao. | Khi camera zoom gần thì Draw Calls vẫn dội lên; không triệt để. | 🟢 Cao |
| **Hướng C: Nướng Texture Tĩnh** *(Baked Impostors 2.5D)* | Xuất cụm sa bàn phức tạp thành khối đơn giản nướng sẵn ánh sáng (Bake). | • Giảm cả draw calls và số đa giác.<br>• Ánh sáng nướng rất đẹp. | Mất chiều sâu đổ khối 3D chân thực khi xoay camera tự do. | 🔴 Thấp (Vi phạm Art Direction) |
| **Hướng D: Tiếp Cận Lai Thực Dụng** *(Hybrid Pragmatic)* | Chỉ gộp sa bàn trung tâm tĩnh (`MiniatureCityDiorama`); ô đất giữ nguyên kèm culling nhẹ. | • Thu hoạch an toàn ~250 calls.<br>• Không động chạm vào FSM/logic ô đất phức tạp. | Calls cuối game vẫn ở mức 400–500 (chưa về mức lý tưởng $< 100$). | 🟢 Rất cao |
| **Hướng E: Công Nghệ `BatchedMesh`** *(Three.js r160+ WebGL Multi-Draw)* | Gộp nhiều hình học **khác nhau** dùng chung Material vào 1 draw call qua `WEBGL_multi_draw`. | • Cho phép ẩn/hiện, transform từng vật thể con độc lập.<br>• Không bị "hàn chết" như merge. | Cần Three.js phiên bản mới; yêu cầu hỗ trợ phần cứng WebGL 2.0. | 🟢 Rất cao |
| **Hướng F: Render Theo Nhu Cầu** *(On-Demand Frameloop & Idle Cooldown)* | Khi bàn cờ tĩnh: hạ xuống 15–20 FPS hoặc chỉ vẽ khi dirty. Khi có xúc xắc/pawn: chạy 60 FPS. | • **Cắt giảm 60–70% nhiệt lượng** ngay lập tức.<br>• **Không cần sửa một dòng geometry nào**. | Cần bắt chính xác các sự kiện chuyển động để đánh thức frameloop. | 🟢 Rất cao (Quick Win) |

---

## 3. BỐN ĐIỂM PHẢN BIỆN KỸ THUẬT CHUYÊN SÂU & RÀO CHẮN HÓA GIẢI

Từ góc nhìn kiến trúc chuyên sâu, các giải pháp gộp lệnh vẽ cần vượt qua 4 rào chắn kỹ thuật:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      4 RỦI RO KỸ THUẬT & BIỆN PHÁP HÓA GIẢI TRIỆT ĐỂ                   │
├───────────────────────────────────┬────────────────────────────────────────────────────┤
│ 1. Cạm bẫy Atlas Khay Giá Tiền    │ • Rủi ro: Giá tiền thay đổi liên tục, tạo Atlas    │
│    (Dynamic Text Incompatibility) │   động sẽ gây nghẽn bus GPU (texSubImage2D stall). │
│                                   │ ➔ Hóa giải: CHỈ Instancing khung đế thuốc viền;    │
│                                   │   phần chữ số áp dụng Distance LOD (ẩn khi ở xa).  │
├───────────────────────────────────┼────────────────────────────────────────────────────┤
│ 2. Tràn Buffer Upload VRAM        │ • Rủi ro: Gọi `setColorAt` và `needsUpdate = true` │
│    (Dynamic Instancing Stall)     │   trong `useFrame` sẽ đẩy buffer lên VRAM 60fps.   │
│                                   │ ➔ Hóa giải: Tuyệt đối chỉ cập nhật theo sự kiện    │
│                                   │   (Event-driven) khi nhận State Delta đổi chủ.     │
├───────────────────────────────────┼────────────────────────────────────────────────────┤
│ 3. Lỗi Culling Biến Mất Khối Gộp  │ • Rủi ro: Bounding Box khối gộp quá lớn làm Frustum│
│    (Spatial Bounding Glitch)      │   Culling tính sai góc hẹp gây chớp tắt sa bàn.    │
│                                   │ ➔ Hóa giải: Gọi `computeBoundingSphere()` chính xác│
│                                   │   ngay sau khi hoàn tất hợp nhất hình học.         │
├───────────────────────────────────┼────────────────────────────────────────────────────┤
│ 4. Phân Biệt Thực Chất Shadow Pass│ • Rủi ro: Canvas Mobile vốn đã tắt `shadows="soft"`│
│    (Shadow Pass Attribution)      │   nên 763 calls phần lớn là số mesh thực mount.   │
│                                   │ ➔ Hóa giải: Tập trung vào Gộp Geometry thực tế thay│
│                                   │   vì kỳ vọng quá mức vào việc tắt bóng đổ.         │
└───────────────────────────────────┴────────────────────────────────────────────────────┘
```

---

## 4. CHIẾN LƯỢC TRIỂN KHAI TỐI ƯU KHUYẾN NGHỊ (PRAGMATIC 3-PHASE ROADMAP)

Để đạt hiệu quả tối đa với chi phí và rủi ro thấp nhất, đề xuất công thức kết hợp:
$$\textbf{GIẢI PHÁP TỐI ƯU} = \textbf{Hướng D (Lai)} + \textbf{Hướng E (BatchedMesh)} + \textbf{Hướng F (Nghỉ khi Idle)}$$

### 🔹 Giai đoạn 1: Gộp Sa Bàn Tĩnh Trung Tâm (Quick Win Tuyệt Đối - 0% Rủi Ro Gameplay)
* **Mục tiêu:** Cắt giảm ngay **250 – 280 Draw Calls** (kéo từ 763 xuống còn ~480 calls).
* **Thực thi:**
  * Dùng `mergeGeometries` hoặc `THREE.BatchedMesh` gộp toàn bộ các khối kiến trúc tĩnh của `MiniatureCityDiorama` (Cầu Ba Son, Cầu Long Biên, cụm Landmark, Cảng container...).
  * Tách riêng 2 dải đèn LED nghệ thuật ban đêm (`basonLedRef1`, `basonLedRef2`) để giữ 100% hiệu ứng đổi màu nhấp nháy.
  * Sa bàn đặt `raycast={null}` để loại bỏ hoàn toàn chi phí tính toán va chạm.

### 🔹 Giai đoạn 2: Hạ Nhiệt Phần Cứng Bằng Render Loop Thông Minh (Thermal Cooling)
* **Mục tiêu:** Triệt tiêu hoàn toàn hiện tượng quá nhiệt tích tụ (Thermal Throttling) sau 3 phút.
* **Thực thi:**
  * Kích hoạt cơ chế **Idle Frameloop Cooldown**: Khi không có xúc xắc lăn, quân cờ nhảy hay camera chuyển động (chiếm 70–80% thời gian thi đấu), hạ tần số render xuống 20–30 FPS hoặc chuyển sang render theo nhu cầu.
  * Giữ vững cơ chế đóng băng Shadow Map tĩnh đã xây dựng từ IMP-364.

### 🔹 Giai đoạn 3: Instancing Viền Ô Đất & Khung Giá Tiền (Late-Game Scaling)
* **Mục tiêu:** Khống chế Draw Calls cuối trận ở mức hằng số $O(1) \le 85\text{--}120$ Calls.
* **Thực thi:**
  * Gộp viền sở hữu 28 ô đất (`OwnerBaseTrim`) thành `InstancedMesh`, cập nhật màu sắc thuần túy theo hướng sự kiện (Event-driven).
  * Gộp khung đế khay giá tiền (`OwnerPricePill`), áp dụng Distance Culling ẩn chữ số ở góc camera xa.

---

## 5. KẾT LUẬN & ĐỀ NGHỊ

1. **Về mặt kỹ thuật:** Chiến lược kết hợp trên là giải pháp toàn diện và chuyên nghiệp nhất, giải quyết triệt để sự cố tụt FPS và nóng máy mà **không phải đánh đổi bất kỳ chi tiết đồ họa nghệ thuật nào**.
2. **Về mặt vận hành:** Đưa Giai đoạn 1 (Gộp Sa Bàn Tĩnh) lên triển khai trước mắt sẽ mang lại kết quả nhìn thấy được ngay lập tức với độ an toàn 100% cho FSM ván đấu.
3. **Đề nghị:** Trình phê duyệt định hướng trên để tiến hành lập Implementation Plan (PLAN) chi tiết cho **Giai đoạn 1 (Sa bàn trung tâm tĩnh)** theo chuẩn quy trình SDLC của Hiến pháp VTCOON.
