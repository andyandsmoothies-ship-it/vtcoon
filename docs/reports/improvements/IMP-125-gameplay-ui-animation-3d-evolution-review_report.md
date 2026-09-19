# [IMP-125] BÁO CÁO ĐÁNH GIÁ TOÀN DIỆN & LỘ TRÌNH TIẾN HÓA VƯỢT BẬC: GIAO DIỆN, HOẠT CẢNH VÀ THẾ GIỚI 3D

- **Mã Báo Cáo**: IMP-125
- **Đối Tượng Đánh Giá**: Gameplay, Giao diện 2D (UI/HUD), Hệ thống Hoạt cảnh (Animations/VFX), Vật thể Sa bàn 3D (3D Objects/Diorama)
- **Cơ Sở Công Nghệ (Tech Stack)**: React Three Fiber (R3F), Three.js PBR, Tailwind CSS, Zustand, Rapier Physics, WebAudio API Synth, Server-Authoritative WebSocket FSM
- **Ngày Lập Báo Cáo**: 2026-09-19
- **Trạng Thái**: 🟢 **ĐÃ PHÊ DUYỆT ĐỊNH HƯỚNG CHIẾN LƯỢC (SAU PHẢN BIỆN CHUYÊN GIA)**

---

## 1. TỔNG QUAN KIẾN TRÚC & HIỆN TRẠNG SẢN PHẨM

VTCoOn hiện sở hữu nền tảng công nghệ thời gian thực hoàn chỉnh với ranh giới trách nhiệm rõ ràng:
- **Bộ não máy chủ (Server FSM)**: Quản lý 58/58 Use Cases, bảo đảm tính bảo toàn tiền tệ tuyệt đối, kiểm soát luật chơi và điều phối hành vi Bot AI.
- **Tầng hiển thị 3D (R3F Canvas)**: Sa bàn bán đảo nhiệt đới nổi trên mặt biển sống (Gerstner waves), ánh sáng chu kỳ ngày đêm, 40 ô cờ với 28 tranh di sản tả thực, xúc xắc 3D rơi vật lý và 4 tượng quân cờ kim loại PBR.
- **Tầng giao diện người dùng (2D UI Overlay)**: Thiết kế Glassmorphism xúc giác chuẩn Antigravity 2.0, HUD tài chính, ngăn kéo nhật ký Sideboard và hệ thống Pop-up thông báo 2 tầng hiển thị lý do chi tiết (vừa hoàn thành ở IMP-124).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           VTCoOn RUNTIME ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Server Authoritative FSM (Node.js/WSS)] ──(Delta Packets < 10KB)──►        │
│                                                                             │
│  [Client State Manager (Zustand)]                                           │
│       ├──► [2D UI / HUD Layer] (Tailwind + Tactile Shadows + Two-Tier Popups)│
│       └──► [3D World Engine (R3F)] (Diorama Island + Physics Pawns/Dice)    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. KIỂM TOÁN HIỆN TRẠNG (CURRENT STATE AUDIT)

### 2.1. Giao Diện Người Dùng (2D UI / HUD)
- **Điểm mạnh đã đạt được**:
  - Pop-up biến động tài chính 2 tầng (Two-Tier Card Layout) hiển thị 100% lý do giao dịch, triệt tiêu hoàn toàn lỗi cắt cụt chữ (`...`) trên màn hình hẹp 375px.
  - Phân định rõ ràng giữa bên chi trả và bên thụ hưởng (người chuyển và người nhận tiền thuê).
  - Thẻ Cơ Hội / Thị Trường có biểu ngữ riêng biệt (`MilestoneBanner`), làm nổi bật hiệu lực hành động kể cả với các thẻ phi tiền tệ.
  - Ngăn kéo nhật ký (Sideboard) hỗ trợ lọc 3 chế độ giúp theo dõi lịch sử trận đấu.
- **Hạn chế tồn đọng**:
  - *Che khuất sa bàn*: Các cửa sổ Modal (Đấu giá, Sổ đỏ, Thẻ bài) mở dạng hộp thoại cố định ở trung tâm màn hình, che khuất 75% không gian 3D.
  - *Thiếu bản đồ tổng quan*: Người chơi phải mở từng thẻ hoặc mở danh mục để biết ai đang nắm giữ những ô đất nào; chưa có góc nhìn toàn cảnh về các bộ độc quyền (Monopoly Sets) trên sa bàn.
  - *Tràn mép phải TopBar trên thiết bị hẹp*: Trên màn hình di động (< 390px), cụm thông tin trận đấu và cụm tiện ích HUD vượt quá chiều ngang màn hình, gây xén một phần các nút tiện ích bên phải.

### 2.2. Hệ Thống Hoạt Cảnh & Máy Quay (Animations, Camera & VFX)
- **Điểm mạnh đã đạt được**:
  - Quân cờ nhảy lò xo tuần tự qua từng ô với hiệu ứng biến dạng co giãn (`Squash & Stretch`).
  - Camera 4 pha (`overview`, `dice_roll`, `pawn_chase`, `tile_focus`) tự động điều hướng theo diễn biến ván đấu.
  - Công trình rơi từ trên cao (`Construction Slam`) tạo cảm giác va đập cơ học kèm rung chấn nhẹ.
- **Hạn chế tồn đọng**:
  - *Nhịp độ đồng đều thiếu kịch tính*: Xúc xắc lăn với tốc độ như nhau trong mọi tình huống. Khi người chơi đối mặt với nguy cơ phá sản nếu đi vào ô tử thần của đối thủ, trải nghiệm chưa tạo ra sự hồi hộp nghẹt thở.
  - *Quân cờ thiếu tương tác*: Khi nhiều quân cờ đứng cùng ô hoặc khi một người chơi dẫm vào ô của người khác và phải trả tiền, các con cờ vẫn đứng tĩnh, không có biểu cảm hoặc phản ứng đối kháng.
  - *Góc xoay chữ trên ô cờ*: Từ góc máy quay tổng quan (Overview Cam), các ô cờ ở các cạnh đối diện bị xoay ngược 180° so với hướng nhìn thuận của người chơi.

### 2.3. Vật Thể 3D & Thế Giới Sa Bàn (3D Objects & Diorama)
- **Điểm mạnh đã đạt được**:
  - Sa bàn đô thị đảo vịnh ngập nắng, thoát ly hoàn toàn mô hình phòng tối tĩnh lặng.
  - Sóng biển GPU Gerstner wave mượt mà, vi giao thông xe hơi và tàu tuần tra tạo cảm giác thành phố sống động.
  - 28 tranh thẻ bài tả thực bản địa Việt Nam sắc nét ở mọi cự ly camera.
- **Hạn chế tồn đọng**:
  - *Tính thụ động của sa bàn*: Thế giới 3D hiện tại đóng vai trò sàn diễn thụ động, người chơi không thể chạm hay tương tác trực tiếp vào các vật thể sa bàn trong thời gian chờ lượt.
  - *Các ô đất đứng riêng rẽ*: Khi một người chơi gom đủ 3 ô đất cùng màu để tạo thành Khối Độc Quyền, các ô đất này vẫn là 3 thực thể rời rạc, chưa có liên kết thị giác xứng tầm.

---

## 3. CẢNH BÁO SỐNG CÒN VỀ HIỆU NĂNG DRAW CALLS & POST-PROCESSING

### Ngân Sách Hiệu Năng Đồ Họa Trên Thiết Bị Di Động
Trong WebGL/R3F, chi phí hiệu năng đồ họa được chi phối bởi công thức tổng số lệnh vẽ:
```
Total Draw Calls = N_meshes × Render_Passes
```
- Khi bật đầy đủ Post-Processing (Bloom + Vignette + SMAA + ToneMapping), số passes tăng lên từ 3 đến 6 lần.
- Nếu dự án bổ sung các Mesh độc lập một cách tùy tiện ($N_{meshes} > 400$), tổng số Draw Calls sẽ vượt ngưỡng $1.998$ calls, kéo tụt tốc độ khung hình xuống còn **29.1 FPS** trên các dòng điện thoại tầm trung.
- **Quy tắc bất biến sống còn**:
  1. Tuyệt đối không sinh thêm Mesh độc lập cho các chi tiết phụ trợ lặp lại; bắt buộc sử dụng `InstancedMesh` hoặc chia sẻ chung Material/Geometry.
  2. Bắt buộc kích hoạt bộ điều tiết thích ứng `resolveAdaptivePostProcessing` (đã chuẩn hóa ở IMP-124): Tự động hạ cấp hoặc tắt hiệu ứng hậu kỳ khi FPS rớt dưới 50 FPS trong 3 giây liên tiếp.
  3. Mọi tính năng mới phải có $\Delta \text{Draw Calls} \le 5$.

---

## 4. KẾT QUẢ PHẢN BIỆN CHUYÊN GIA & ĐIỀU CHỈNH THIẾT KẾ CẢI TIẾN

Sau khi đối soát kỹ thuật với kiến trúc FSM và NFR đồ họa, các đề xuất cải tiến được định hình và tinh chỉnh như sau:

### Cải Tiến 1: Bản Đồ Nhiệt Quy Hoạch Đô Thị (Real Estate Monopoly Heatmap Overlay) ➔ CHẤP THUẬN (P1)
- **Mục tiêu**: Cung cấp bức tranh toàn cảnh về quyền sở hữu địa ốc tức thì bằng 1 thao tác bấm.
- **Thiết kế kỹ thuật**:
  - Bổ sung nút chuyển đổi "Quy Hoạch" 🗺️ trên thanh công cụ Action Dock.
  - Khi kích hoạt:
    - Bàn cờ và các chi tiết trang trí sa bàn hạ độ sáng 30% để tạo độ tương phản.
    - Các ô đất thuộc sở hữu của người chơi phát sáng dải màu neon đại diện (`emissive={ownerColor}`, `emissiveIntensity={1.2}`).
    - Khi một người chơi gom đủ Khối Độc Quyền (Monopoly Set), dải viền của cả bộ ô đất sẽ nhấp nháy phát quang đồng điệu.
  - **Tác động hiệu năng**: 0% tăng Draw Calls (tận dụng thuộc tính emissive có sẵn của vật liệu).

```
[Bấm Nút "Quy Hoạch" 🗺️] 
         │
         ▼
[Dịu Sáng Sa Bàn 30%] ──► [Phát Sáng Ô Đất Theo Màu Chủ Sở Hữu (Emissive)]
                                    │
                                    ▼
                         [Gom Đủ Bộ Độc Quyền?]
                                    ├──(CÓ)──► [Xung Nhịp Huỳnh Quang Đồng Điệu]
                                    └──(KHÔNG)► [Phát Sáng Tĩnh Theo Chủ Sở Hữu]
```

### Cải Tiến 2: Sa Bàn Tương Tác Xúc Giác Dạng Hộp Đồ Chơi (Interactive Toy-Box Diorama) ➔ CHẤP THUẬN (P1)
- **Mục tiêu**: Triệt tiêu cảm giác nhàm chán khi chờ đối thủ hoặc Bot AI tính toán nước đi.
- **Thiết kế kỹ thuật**:
  - Bắt sự kiện chạm/click của người chơi bằng Three.js Raycaster lên các đối tượng sa bàn có sẵn:
    - *Ngọn hải đăng (Lighthouse)*: Bấm vào sẽ quét đèn pha nhanh 1 vòng 360° trong 0.8s và phát tiếng còi sương mù trầm ấm qua WebAudio Synth (`SoundEngine.playLighthouseHorn()`).
    - *Xe hơi vi mô (Micro Vehicles)*: Bấm vào sẽ bấm còi "bíp bíp" vui nhộn qua WebAudio Synth (`SoundEngine.playCarHorn()`) và bốc đà tăng tốc vọt lên một đoạn ngắn.
    - *Mặt biển (Living Ocean)*: Bấm vào mặt nước kích hoạt gợn sóng lan tỏa cục bộ kèm âm thanh nước vỗ nhẹ qua WebAudio Synth (`SoundEngine.playWaterRipple()`).
  - Hoạt động 100% tại máy khách (Client-only), không truyền gói tin mạng WSS, phản hồi tức thì < 16ms.

### Cải Tiến 3: Máy Quay Căng Thẳng Ngữ Cảnh Tử Thần (Dynamic Tension Cine-Cam) ➔ TINH CHỈNH BẢO TOÀN NHỊP ĐỘ (P2)
- **Mục tiêu**: Tăng cảm xúc cao trào khi người chơi đối mặt với nguy cơ phá sản, nhưng **tuyệt đối không làm chậm nhịp ván đấu**.
- **Hiệu chỉnh phản biện**:
  - Nghiêm cấm kéo dài thời gian tung xúc xắc từ 1s lên 3-4s (loại bỏ hiệu ứng slow-motion kéo dài làm loãng nhịp game).
  - Giữ nguyên 100% thời lượng xúc xắc vật lý thực tế (0.8s – 1.2s).
  - Khi người chơi đối mặt với nguy cơ dẫm vào ô tử thần (phí thuê >= 80% số dư):
    - Camera chuyển đổi sang góc máy Cine-Cam tầm thấp cận cảnh khay xúc xắc.
    - WebAudio Synth phát chuỗi xung nhịp tim đập dồn dập (Rapid Heartbeat Pulse) đúng trong 1.0s xúc xắc đang lăn.
    - Nếu an toàn: camera lùi ra xa kèm âm thanh chuông nhẹ; nếu dẫm phải: kích hoạt rung chấn màn hình (Micro Screen Shake 300ms).

```
[Trước Khi Tung Xúc Xắc]
         │
         ▼
[Quét Các Ô Phía Trước: Có Ô Tử Thần?]
         ├── (CÓ: Phí Thuê >= 80% Số Dư) ──► [KÍCH HOẠT TENSION CINE-CAM (1.0s)]
         │                                    • Camera góc thấp cận cảnh khay
         │                                    • Giữ nguyên thời gian lăn 1.0s
         │                                    • Nhịp tim dồn dập (WebAudio Synth)
         └── (KHÔNG) ───────────────────────► [Chế Độ Tung Xúc Xắc Bình Thường]
```

### Cải Tiến 4: Hoạt Cảnh Đối Kháng Quân Cờ (Pawn Expressive Interactions) ➔ TINH CHỈNH PROCEDURAL SPRING (P2)
- **Mục tiêu**: Tăng tính biểu cảm đối kháng giữa các quân cờ khi giao dịch tiền thuê diễn ra.
- **Hiệu chỉnh phản biện**:
  - Tuyệt đối không dùng khung xương (skeletal mesh/bone rigging) gây nặng CPU/GPU.
  - Sử dụng toàn bộ thuật toán biến dạng hình học lò xo toán học (`Procedural Spring Squash & Stretch`):
    - *Quân cờ nhận tiền thuê (Thắng thế)*: Nhảy xoay vòng 360° kết hợp bừng sáng chùm hạt bụi vàng (Particle Burst từ hồ instanced có sẵn).
    - *Quân cờ trả tiền thuê (Thất thế)*: Nhún bẹp trục Y xuống 0.55 trong 0.25s rồi hồi phục lò xo, kèm làn khói xám vi mô nhẹ.
  - Đảm bảo 0 skeletal overhead, bảo toàn 60 FPS.

### Cải Tiến 5: Hợp Nhất Quần Thể Đô Thị Khi Đạt Độc Quyền (Monopoly Plaza Fusion) ➔ TINH CHỈNH LIGHTING & INSTANCED (P3)
- **Mục tiêu**: Biến việc thâu tóm trọn bộ đất thành cột mốc thị giác nổi bật.
- **Hiệu chỉnh phản biện**:
  - Tuyệt đối không can thiệp sửa đổi cấu trúc hình học (vertices/geometry) của 40 ô cờ (tránh làm vỡ UV và tranh vẽ di sản bản địa).
  - Sử dụng dải sáng huỳnh quang (Emissive Runner) viền bo vỉa hè kết nối 3 ô đất cùng màu.
  - Đặt cụm cờ hoa/băng rôn mini được instanced (`InstancedMesh`) tại ranh giới giữa 3 ô để thể hiện sự thống nhất lãnh địa.
  - Đảm bảo $\Delta \text{Draw Calls} = 0$.

### Cải Tiến 6: Kéo - Thả Tung Xúc Xắc Trực Tiếp (Drag-and-Release) ➔ ❌ BÁC BỎ HOÀN TOÀN (REJECTED)
- **Lý do bác bỏ**:
  1. *Vi phạm nguyên lý FSM cốt lõi (ADR-0001)*: VTCoOn là hệ thống Server-Authoritative. Kết quả xúc xắc được máy chủ gieo ngẫu nhiên bằng hạt giống PRNG để chống gian lận. Nếu cho kéo thả trên Client nhưng kết quả đã bị ấn định trước, xúc xắc buộc phải phanh gấp hoặc đổi hướng bất thường khi tiếp đất, tạo ra cảm giác lừa dối người chơi ("Fake Agency").
  2. *Xung đột cử chỉ di động*: Thao tác vuốt kéo trên màn hình di động sẽ va chạm trực tiếp với cử chỉ xoay/chúc camera của OrbitControls.
- **Quyết định**: Xóa bỏ hoàn toàn Cải tiến 6 khỏi mọi tài liệu và lộ trình phát triển của dự án.

---

## 5. MA TRẬN ĐÁNH GIÁ KỸ THUẬT & LỘ TRÌNH TRIỂN KHAI

| Hạng Mục Cải Tiến | Trụ Cột | Tác Động Trực Quan | Độ Phức Tạp | Tác Động Draw Calls / FPS | Trạng Thái Phê Duyệt | Lộ Trình |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **1. Bản Đồ Nhiệt Quy Hoạch (Heatmap)** | UI / 3D | Rất Cao | Thấp | 0 calls (Dùng Emissive sẵn có) | 🟢 ĐÃ DUYỆT | **Giai Đoạn 1 (P1)** |
| **2. Sa Bàn Tương Tác Xúc Giác (Toy-Box)** | 3D World | Rất Cao | Thấp | 0 calls (Raycaster + WebAudio) | 🟢 ĐÃ DUYỆT | **Giai Đoạn 1 (P1)** |
| **3. Sửa Lỗi Hiển Thị Chữ Ô Cờ 180°** | 3D Board | Cao | Thấp | 0 calls (Sửa góc quay tileRotation) | 🟢 ĐÃ DUYỆT | **Giai Đoạn 1 (P1)** |
| **4. Sửa Tràn Mép Phải TopBar Mobile** | 2D UI | Cao | Thấp | 0 calls (Responsive flex/padding) | 🟢 ĐÃ DUYỆT | **Giai Đoạn 1 (P1)** |
| **5. Máy Quay Căng Thẳng (Tension Cam)** | Hoạt Cảnh | Rất Cao | Trung Bình | 0 calls (Camera FSM + WebAudio) | 🟡 ĐÃ DUYỆT TINH CHỈNH | **Giai Đoạn 2 (P2)** |
| **6. Hoạt Cảnh Đối Kháng Quân Cờ** | Hoạt Cảnh | Cao | Trung Bình | 0 calls (Procedural Spring) | 🟡 ĐÃ DUYỆT TINH CHỈNH | **Giai Đoạn 2 (P2)** |
| **7. Hợp Nhất Quần Thể Độc Quyền** | 3D World | Đột Phá | Trung Bình | 0 calls (Emissive + Instanced) | 🟡 ĐÃ DUYỆT TINH CHỈNH | **Giai Đoạn 3 (P3)** |
| **8. Kéo Thả Tung Xúc Xắc Vật Lý** | Tương Tác | Không Đạt | Cao | Vi phạm Server-Authoritative FSM | 🔴 **BÁC BỎ HOÀN TOÀN** | **ĐÃ HỦY BỎ** |

---

## 6. KẾ HOẠCH HÀNH ĐỘNG GIAI ĐOẠN 1 (PHASE 1 FOCUSED SLICE)

Triển khai ngay gói công việc trọng tâm Giai đoạn 1 gồm 4 hạng mục theo Quy trình 3 Trạm nghiêm ngặt:
1. **Gói 1 (Fix)**: Sửa góc quay `tileRotation` đảm bảo toàn bộ chữ ô cờ đọc thuận mắt từ góc nhìn máy quay tổng quan (khử lộn ngược 180°).
2. **Gói 2 (Fix)**: Sửa tràn mép phải thanh TopBar trên màn hình di động (< 390px), thu gọn padding và co giãn các nút tiện ích an toàn.
3. **Gói 3 (Feature)**: Bản Đồ Nhiệt Quy Hoạch Đô Thị (Monopoly Heatmap Overlay) kích hoạt 1-click từ Action Dock với hiệu ứng emissive dải màu người chơi.
4. **Gói 4 (Feature)**: Sa Bàn Tương Tác Xúc Giác (Interactive Toy-Box Diorama) với sự kiện click Hải đăng (quét đèn + còi sương mù), Xe hơi vi mô (còi bíp + tăng tốc), Mặt biển (gợn sóng GPU + tiếng nước vỗ).
