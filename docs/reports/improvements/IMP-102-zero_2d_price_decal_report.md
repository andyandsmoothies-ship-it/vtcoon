# Báo Cáo Nghiệm Thu Cải Tiến IMP-102: Zero 2D Price Decal & Pure 3D Pill Alignment (/boost)

> **Mã số:** IMP-102  
> **Tên gói cải tiến:** Zero 2D Price Decal & Pure 3D Pill Alignment  
> **Trạng thái:** 🟢 **Hoàn Tất & Đã Nghiệm Thu**  
> **Ngày hoàn thành:** 16/09/2026  
> **Quy trình áp dụng:** 3 Trạm Nghiêm Ngặt (/boost pipeline) theo Hiến pháp GEMINI.md  

---

## 1. Bối Cảnh & Vấn Đề Kỹ Thuật

Người dùng phát hiện hiện tượng bất thường khi quan sát các ô đất (Long Thành, Bình Dương...) trên mobile:
> *"tôi thấy các phiếu đất chỗ phần giá tiền có 1 lớp màu đen nổi lên đúng không?"*  
> *"tôi nghĩ bỏ lớp decal 2d, riêng phần 3d tạm giữ để tôi review tiếp"*

### Nguyên nhân gốc rễ (Root Cause):
- Trong `tile_texture_generator.ts`, hàm `drawPriceTrayFooter` in chết một dải bo góc tròn màu than đen (`#090D1A`, `roundRect(22, 274, 212, 50, 12)`) lên bề mặt decal 2D (tọa độ `Z` từ `0.66` đến `0.98`).
- Trong khi đó, khay giá 3D `OwnerPricePill` (đổi màu theo người chơi) được đặt tại `[0, 0.115, 0.70]`, tạo ra độ lệch tọa độ `Z` khoảng `0.12m` so với dải đen 2D bên dưới.
- Do khối 3D nhô cao `0.012m` và đặt lệch vị trí so với dải than đen 2D bo tròn ở dưới, dải than đen 2D bị lòi ra ngoài phía sau khay giá 3D, tạo ra hiệu ứng bậc thang "1 lớp màu đen nổi cộm lên".

---

## 2. Giải Pháp Hiện Thực & Kết Quả 3 Trạm

### Trạm 1: RED Contract Test (`qa-tester`)
- Thiết kế bộ test hợp đồng `tests/client/zero_2d_price_decal_on_purchasable_tiles.test.ts` gồm **87 atomic tests**:
  * 44 tests (Chốt 1): 22 ô BĐS không vẽ `roundRect` khay giá ở `y=274` và không vẽ `fillText` ở `y=300`.
  * 12 tests (Chốt 2): 6 ô Hạ tầng (5, 12, 15, 25, 28, 35) không vẽ `roundRect` khay giá ở `y=274` và không vẽ `fillText` ở `y=300`.
  * 17 tests (Chốt 3): Bảo tồn 100% nhãn hành động 2D cho các ô phi tài sản (Cơ hội, Khí vận, Lệ phí đất...).
  * 10 tests (Chốt 4): Bảo tồn `OwnerPricePill` là SSOT duy nhất hiển thị giá và đổi màu sở hữu.
- Reconcile 6 test suites cũ (IMP-36, IMP-37, IMP-38, IMP-40, IMP-63, IMP-90) để đồng bộ với SSOT mới.
- Xác nhận **Business RED** (56 failed, 31 passed).

### Trạm 2: GREEN Implementation (`implementer`)
- Cập nhật [`src/client/3d/tile_texture_generator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/tile_texture_generator.ts#L194-L202):
  ```ts
  function drawTileFooter(ctx: CanvasRenderingContext2D, meta: TileMetadata, index: number): void {
    if (!isPropertyTile(index) && !isInfrastructureTile(index)) {
      drawActionBadgeFooter(ctx, meta);
    }
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 5;
    ctx.strokeRect(2, 2, 252, 336);
  }
  ```
- Toàn bộ 28 ô mua bán (22 BĐS + 6 hạ tầng) giữ nguyên nền giấy ngà `#F3EEDF` phẳng sạch, khay giá 3D `OwnerPricePill` đặt trực tiếp lên trên, triệt tiêu 100% hiện tượng lòi viền than đen.
- Giữ nguyên hàm `drawPriceTrayFooter` xuất khẩu để không làm vỡ các module tham chiếu bên ngoài.
- `tile_texture_generator.ts` đạt **375 LOC** (<= 400 LOC).
- **Kiểm thử tự động:** **208/208 suites PASS, 3.981/3.981 tests PASS (100% GREEN)**.
- **Linters:** `lint:ui` 0 vi phạm trên 146 files; `lint:slop` 0 lỗi; `tsc --noEmit` 0 lỗi.
- **Docker:** Build production thành công, nạp bundle mới vào container `vtcoon-vtcoon-1`, HTTP 200 OK.

### Trạm 3: Thẩm Định Độc Lập (`spec-reviewer`)
- Xác minh vật lý trên đĩa cứng: Phán quyết **APPROVED ✔️**.
- Khẳng định Zero Scope Drift, đạt 100% tiêu chuẩn Atomic Test Mandate, tuân thủ chặt chẽ Hiến pháp `GEMINI.md`.
- Ghi nhận Gotcha #134 vào `docs/domain/gotchas.md`.

---

## 3. Bảng Kiểm Tra Chất Lượng (Quality Gates Matrix)

| Cổng kiểm thử | Lệnh thực thi | Kết quả | Trạng thái |
| :--- | :--- | :--- | :--- |
| **Contract Tests** | `npm test tests/client/zero_2d_price_decal_on_purchasable_tiles.test.ts` | **87/87 tests PASS** | 🟢 PASS |
| **All Test Suites** | `npm test` | **208/208 suites, 3.981/3.981 tests PASS** | 🟢 PASS (100%) |
| **Type Checking** | `npx tsc --noEmit` | **0 errors** | 🟢 PASS |
| **2D UI Craft Linter** | `npm run lint:ui` | **0 anti-patterns across 146 files** | 🟢 PASS |
| **Slop Linter** | `npm run lint:slop` | **0 hard violations across 214 files** | 🟢 PASS |
| **LOC Compliance** | `tile_texture_generator.ts` | **375 LOC** (ngưỡng <= 400 LOC) | 🟢 PASS |
| **Docker Runtime** | `curl.exe -I http://127.0.0.1:3000/` | **HTTP/1.1 200 OK** | 🟢 PASS |
