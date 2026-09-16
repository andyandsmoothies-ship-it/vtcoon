# Kế Hoạch Cải Tiến IMP-100: Khai Thác 100% Công Suất Tech Stack Hiện Có (Deep Tech Stack Maximization)

> **Mục tiêu**: Tối ưu hóa sâu 4 tiềm năng có sẵn trong hệ sinh thái thư viện hiện tại (Browser CacheStorage API, Howler.js Spatial 3D Audio, Three.js InstancedMesh, Zustand Transient Updates) mà không cài thêm bất kỳ gói dependency mới nào.

---

## 1. Bối Cảnh & Động Lực (Context & Motivation)
- **Vấn đề băng thông Ngrok**: Mỗi lượt tải lại trang tiêu tốn ~8-12 MB tài nguyên 3D/Audio. Với gói Ngrok Free 1 GB/tháng, cần triệt tiêu việc tải lại các tài nguyên tĩnh này sau lần đầu truy cập.
- **Trải nghiệm âm thanh phẳng**: Âm thanh hiện phát stereo 2D ở giữa tai, chưa tương xứng với đồ họa diorama 3D sống động.
- **Tối ưu hóa GPU & CPU**: Giảm tải draw calls của Three.js và cách ly vòng lặp cập nhật camera 60 FPS khỏi React Virtual DOM.

---

## 2. Thiết Kế Kỹ Thuật 4 Trụ Cột (Technical Design)

### Trụ Cột 1: Browser CacheStorage API cho Mô Hình 3D & Âm Thanh (Ngrok Bandwidth Saver)
- **Tệp can thiệp**: `src/client/utils/asset_cache.ts`, `src/client/3d/asset_loader/safe_gltf_model.tsx`, `src/client/audio/audio_engine.ts`.
- **Cơ chế**:
  - Kiểm tra `window.caches`. Nếu cache hit trong `'vtcoon-assets-v1'`, nạp trực tiếp qua Blob URL (0ms, 0 byte mạng).
  - Nếu cache miss (lần đầu), tải mạng bình thường và tự động lưu bản sao vào CacheStorage.
  - Fallback an toàn 100% về `fetch()` nếu ở chế độ ẩn danh (Incognito) hoặc môi trường test Node.js.

### Trụ Cột 2: Howler.js Spatial 3D Audio (Âm Thanh Không Gian 3 Chiều)
- **Tệp can thiệp**: `src/client/audio/audio_engine.ts`, `src/client/game_canvas.tsx`.
- **Cơ chế**:
  - Sử dụng `Howler.pos(camX, camY, camZ)` và `Howler.orientation(...)` đồng bộ với Camera người chơi.
  - Cung cấp hàm `playSpatialSfx(sfx, [x, y, z])` với mô hình suy giảm khoảng cách HRTF chân thực.
  - Định vị nguồn âm thanh: Xúc xắc tại `[0, 0.02, 0]`, công trình tại `cellPosition(cellIndex)`.

### Trụ Cột 3: Three.js InstancedMesh Tối Ưu Phụ Kiện Bàn Cờ
- **Tệp can thiệp**: `src/client/3d/board_tile.tsx`, `src/client/3d/board_layout.tsx`.
- **Cơ chế**:
  - Gộp các vòng đai chỉ thị cấp độ `TierIndicatorRings` C1..C3 của 28 ô đất về 1 instanced mesh quản lý tập trung.
  - Giảm thiểu số lượng Draw Calls từ ~95 xuống dưới 45 calls/frame.

### Trụ Cột 4: Zustand Transient Frame Decoupling
- **Tệp can thiệp**: `src/client/game_canvas.tsx`, `src/client/ui/hud_container.tsx`.
- **Cơ chế**:
  - Cách ly biến thiên góc xoay/vị trí camera 60 FPS khỏi React Virtual DOM reconciliation.
  - Sử dụng trực tiếp tham chiếu ref và `useGameStore.getState()` trong `useFrame`.

---

## 3. Ma Trận Kiểm Thử Hợp Đồng (Contract Test Matrix)
- Bộ kiểm thử hợp đồng: `tests/contracts/imp100_deep_tech_stack_maximization.test.ts`.
  - Facet 1: CacheStorage Lifecycle & Safe Fallback.
  - Facet 2: Spatial Audio Coordinate & Distance Attenuation.
  - Facet 3: Instanced Buffer Matrix Invariants.
  - Facet 4: Reactive Scope Boundary & Frame Isolation.
