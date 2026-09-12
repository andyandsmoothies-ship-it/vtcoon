# [IMP-21] Kế Hoạch Chuyển Đổi Sảnh Chờ Sa Bàn Đảo Vịnh Nhiệt Đới (Sunny Island Metropolis) & Khắc Phục Tràn Mép Viewport

## Bối Cảnh & Vấn Đề Gốc Rễ (Root Cause Analysis)
Trải qua 3 đợt cải tiến sảnh chờ (`IMP-09`, `IMP-12`, `IMP-20`), thị giác vẫn "dậm chân tại chỗ" so với ảnh thương mại Retropoly (`media_1789200902293.jpg`) do mắc phải **4 Bẫy Tư Duy** đã đúc kết tại `Gotcha #22`:
1. **Tiền đề sai lệch**: Tự nhốt bối cảnh vào một phòng họp tối ("Penthouse Lounge tầng 80") với các khối `boxGeometry`/`cylinderGeometry` u ám, đối lập với linh hồn game cờ tỷ phú nhiệt đới.
2. **Xé lẻ thế giới game**: Trong trận là Đảo Ngọc biển xanh cát vàng (`CoastalIslandEnvironment`), nhưng sảnh chờ lại tự cô lập vào phòng họp kính đen kịt.
3. **Lỗi vật lý hiển thị 3D**: Chữ "TRỐNG" và bảng tên người chơi bị lộn ngược gương (`ĐNOЯT`) do không dùng `<Billboard follow={true}>`.
4. **Lỗi tràn mép 2D trên Windows**: `main.tsx` dùng `w-screen` (`100vw`) bao gồm cả độ rộng 15-17px của thanh cuộn dọc hệ điều hành Windows, đẩy giao diện sang phải làm cấn mép thanh điều khiển `aside`.

---

## Giải Pháp Bất Biến (Theo Hiến Chương GEMINI.md Mới)
Kích hoạt nguyên tắc **"Kill The Premise"** và **"Single Cohesive World Invariant"**:
1. **Xóa bỏ toàn bộ bối cảnh phòng kín u ám**: Chuyển sảnh chờ ra không gian ngoài trời ngập tràn ánh nắng mặt trời của Bán đảo Đảo Ngọc (`Sunny Coastal Island Waterfront / Marina Promenade`).
2. **4 Bệ Đá Cẩm Thạch Nổi Ngoài Trời (Sunlit Pedestals)**: 4 linh vật (Pawn: Tháp Vàng, Du Thuyền, Xe Cổ, Kỳ Hạm) đứng uy phong dưới ánh nắng tự nhiên, đổ bóng tiếp xúc chân thực (`ContactShadows`).
3. **Triệt tiêu 100% chữ ngược**: Ứng dụng `<Billboard follow={true}>` cho toàn bộ 3D Text và Nameplate để luôn hướng trực diện về camera dù góc xoay thế nào.
4. **Khử triệt để lỗi tràn mép 2D Viewport**: Đổi `w-screen h-screen` thành `fixed inset-0 w-full h-full` tại `main.tsx#L428` và căn lề an toàn 24px cho `aside` trong `lobby_view.tsx`.

---

## Sơ Đồ Kiến Trúc Thị Giác (Visual Hierarchy Flowchart)
```
[Không Gian Sa Bàn Đảo Vịnh Ngoài Trời (Daylight Sunlight)]
├── Bầu trời: Xanh ngọc bích tươi tắn (#38BDF8 / #7DD3FC)
├── Nguồn sáng tự nhiên: Mặt trời nhiệt đới [15, 25, 12] (#FFFBEB, intensity 2.4, castShadow)
├── Đại dương vô cực: Sóng Gerstner dập dềnh ngọc bích (từ CoastalIslandEnvironment)
├── Thềm bãi cát ven biển (#FDE68A) + Hàng cọ nhiệt đới + Ca-nô tuần tra + Hải âu bay lượn
├── Đô thị cao ốc đồ chơi (Miniature City Skyline) với xe cộ tí hon di chuyển
│
└── [Kỳ Đài Sảnh Chờ: Bến Cảng Du Thuyền Đảo Ngọc (Marina Waterfront Plaza)]
    ├── Thềm đá sa thạch trắng viền gỗ tếch bo tròn (RoundedBox, Beveled)
    ├── Nẹp viền đồng mạ vàng Champagne (#F59E0B)
    ├── 4 Bệ cẩm thạch tròn tắm nắng (Circular Sunlit Marble Pedestals)
    │   ├── 4 Linh vật cờ thượng lưu (LuxuryPawnModel) chuyển động thở nhẹ (calculateAvatarBob)
    │   └── Bảng tên 3D & Huy hiệu VIP: <Billboard follow={true}> (Chống lộn ngược chữ 100%)
    │       ├── Vị trí đã có người: Tên + Huy hiệu VIP + Icon
    │       └── Vị trí trống: Vòng hào quang mời gọi + Text "VỊ TRÍ TRỐNG"
    └── Camera Perspective (FoV 38 độ) góc nghiêng điện ảnh nhìn toàn cảnh vịnh biển
```

---

## Chi Tiết Triển Khai (File Changes)

### 1. [Tạo mới] `src/client/3d/sunny_island_lobby_scene.tsx`
- Thay thế không gian phòng kín bằng kỳ đài Bến Cảng Du Thuyền Đảo Ngọc ngoài trời.
- Tích hợp `CoastalIslandEnvironment` (sóng Gerstner, bờ cát, ca-nô, hải âu) và đô thị tí hon `MiniatureCityDiorama` ở hậu cảnh.
- 4 bệ cẩm thạch tròn đón nắng, gắn 4 linh vật `LuxuryPawnModel`.
- Toàn bộ text 3D bọc trong `<Billboard follow={true}>`.
- LOC <= 300 dòng theo quy chuẩn hiến chương.

### 2. [Cập nhật] `src/client/3d/penthouse_lobby_scene.tsx`
- Tương thích ngược: Re-export và định tuyến sang `SunnyIslandLobbyScene` để bảo toàn hợp đồng API mà không làm gãy các module hiện có.

### 3. [Cập nhật] `src/client/game_canvas.tsx`
- Cập nhật nhánh `isLobby`:
  - Background Canvas: Màu trời ban ngày nhiệt đới tươi sáng `#38BDF8`.
  - Kết xuất `SunnyIslandLobbyScene` với ánh sáng mặt trời tự nhiên ngoài trời và `ContactShadows`.

### 4. [Cập nhật] `src/client/main.tsx`
- Dòng 428 & 452: Đổi `className="relative w-screen h-screen overflow-hidden bg-slate-950"` thành `className="fixed inset-0 w-full h-full overflow-hidden bg-slate-950"`.
- Triệt tiêu hoàn toàn thanh cuộn ảo 15-17px trên Windows.

### 5. [Cập nhật] `src/client/ui/lobby/lobby_view.tsx`
- Căn lề an toàn 24px trên desktop: `top-6 right-6 bottom-6`.
- Cập nhật tiêu đề sảnh: `SẢNH CHỜ: ĐẢO NGỌC NHIỆT ĐỚI`.
- Bổ sung khoảng đệm đáy `pb-4` cho khối nút bấm hành động chống dính đáy màn hình.

### 6. [Cập nhật] `tests/client/penthouse_lobby_scene.test.ts`
- Cập nhật các test assertion cho phù hợp với bối cảnh Sa bàn Đảo Vịnh Ngoài Trời.
- Kiểm tra 100% các hàm tính toán vị trí, góc xoay, nhịp thở của 4 bệ đá.
- Đảm bảo toàn bộ 1,398 test hiện có tiếp tục pass 100% không suy thoái (Zero Regression).

---

## Kế Hoạch Nghiệm Thu (Verification Plan)
1. **Kiểm thử tự động**:
   - `npx vitest run tests/client/penthouse_lobby_scene.test.ts` -> PASS 100%.
   - `npm run gate:quick` -> PASS 100% (118 test files, 0 lint, 0 type errors).
2. **Kiểm tra đồ họa & Đối chuẩn Retropoly**:
   - Chụp ảnh màn hình thực tế sảnh chờ mới trên độ phân giải 1920x1080 và 1600x1000.
   - Đối chiếu song song với ảnh chuẩn thương mại Retropoly (`media_1789200902293.jpg`).
   - Triệu hồi `game-3d-visual-critic` và `ui-craft-reviewer` để đánh giá độc lập.
