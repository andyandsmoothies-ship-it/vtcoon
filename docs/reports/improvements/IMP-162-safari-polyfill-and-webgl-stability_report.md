# [REPORT] IMP-162: Safari Polyfill, WebGL Mobile Context Loss & Audio/Texture Memory Leak Defense

> **Ticket**: IMP-162  
> **Type**: Architecture / Infrastructure / Cross-Browser Hardening (Safari, Chrome, Edge) & Mobile RAM Safety  
> **Status**: COMPLETED & VERIFIED (Station 3 Approved)  
> **Traceability**: `docs/domain/gotchas.md` (Gotchas #83, #150, #222), ADR-0002, `GEMINI.md §1`  
> **Risk Tier**: Tier 2 (Infrastructure/Cross-Browser WebGL/Audio — 3-Station Pipeline: RED ➔ GREEN ➔ Independent Audit)  

---

## 1. TỔNG QUAN KẾT QUẢ TRIỂN KHAI

Gói cải tiến **IMP-162** đã giải quyết triệt để **4 rủi ro sập ứng dụng và rò rỉ bộ nhớ nghiêm trọng** trên thiết bị di động và các trình duyệt WebKit (iOS Safari < 16, Facebook/Zalo In-App Browsers, Chrome, Edge):
1. **Bảo vệ sập màn hình Safari Legacy WebKit**: Cài đặt polyfill `CanvasRenderingContext2D.prototype.roundRect` và `Path2D.prototype.roundRect` tuân thủ 100% chuẩn W3C (chuẩn hóa tọa độ âm, co tỷ lệ đồng dạng bán kính tránh tự giao cắt, ném `RangeError` khi bán kính âm).
2. **Chống đen màn hình do mất ngữ cảnh WebGL**: Bắt `webglcontextlost` với `event.preventDefault()` (chuẩn W3C bắt buộc để WebGL cho phép phục hồi); bắt `webglcontextrestored` để xả toàn bộ texture cũ khỏi JS cache và tái nạp texture sạch lên GPU mới; tháo gỡ an toàn khi unmount.
3. **Triệt tiêu rò rỉ WebAudio GainNode**: Thêm cờ chặn khi `isMuted: true`, cơ chế giải phóng kép (Idempotent Cleanup) gồm sự kiện `osc.onended` kết hợp phao cứu sinh `setTimeout(cleanup, 1200)` phòng khi AudioContext bị suspended trên thiết bị di động.
4. **Giải phóng VRAM/RAM 100% cho 6 bộ nhớ đệm texture 3D**: Bổ sung vòng lặp gọi `.dispose()` an toàn (hỗ trợ cả mock/null objects) cho `tile`, `standee`, `mascot`, `heritage`, `price`, `emote` textures; gom thành hàm hợp nhất `clearAll3DTextureCaches()` và gắn vào vòng đời unmount của `GameCanvas`.

---

## 2. BẢNG TỔNG HỢP CÁC ĐIỂM SỬA ĐỔI MÃ NGUỒN

| # | Thành Phần | File Vật Lý | Thay Đổi Kỹ Thuật |
|---|---|---|---|
| **1** | W3C roundRect Polyfill | [`src/client/polyfills/canvas_round_rect.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/polyfills/canvas_round_rect.ts) | Tạo module polyfill W3C (tự động cài đặt khi import, hỗ trợ CanvasRenderingContext2D và Path2D, chuẩn hóa tọa độ âm, scale bán kính). |
| **2** | Multi-point Entry Import | [`src/client/main.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/main.tsx), [`src/client/game_canvas.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx) | Import polyfill ngay tại entrypoint và GameCanvas để mọi component 3D / headless tests đều có polyfill. |
| **3** | WebGL Context Watcher | [`src/client/game_canvas.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx) | Xuất khẩu `attachWebGLContextHandlers(canvas, onRestored)`, bắt `webglcontextlost` (`preventDefault()`), bắt `webglcontextrestored` xả texture cache; gắn vào `<Canvas>` và dọn dẹp unmount. |
| **4** | Unified Texture Cache Manager | [`src/client/3d/texture_cache_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/texture_cache_manager.ts) | Xuất khẩu `clearAll3DTextureCaches()` tập hợp việc dọn dẹp toàn bộ 6 cache textures 3D. |
| **5** | Mascot Texture Disposal | [`src/client/3d/mascot_canvas_texture.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/mascot_canvas_texture.ts) | `clearMascotTextureCache` duyệt gọi `tex?.dispose()` trước khi `.clear()`. |
| **6** | Heritage Tile Texture Disposal | [`src/client/3d/heritage_tile_texture.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/heritage_tile_texture.ts) | `clearHeritageTileTextureCache` gọi `cachedEncausticTexture?.dispose()` trước khi gán `null`. |
| **7** | Standee WebP Texture Disposal | [`src/client/3d/board_tile.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_tile.tsx) | `clearStandeeWebpCache` duyệt gọi `tex?.dispose()` an toàn (bỏ qua `null`/plain object). |
| **8** | Tile & Standee Generator Disposal | [`src/client/3d/tile_texture_generator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/tile_texture_generator.ts) | `clearTileTextureCache` duyệt gọi `tex?.dispose()` trên cả `tileTextureCache` và `standeeTextureCache`. |
| **9** | Owner Price Pill Disposal | [`src/client/3d/owner_property_markers.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/owner_property_markers.tsx) | Xuất khẩu `clearPriceTextureCache()` duyệt gọi `tex?.dispose()` và `.clear()`. |
| **10** | Pawn Emote Billboard Disposal | [`src/client/3d/pawn_animator.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/pawn_animator.tsx) | Xuất khẩu `emoteCanvasCache` và `clearEmoteCanvasCache()` duyệt gọi `tex?.dispose()` và `.clear()`. |
| **11** | WebAudio Leak & Mute Guard | [`src/client/ui/modals/hose_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/hose_modal.tsx) | Xuất khẩu `playFloorBellSound()`, kiểm tra `isMuted`, triển khai idempotent cleanup với `osc1.onended` + fallback timer 1200ms. |

---

## 3. KẾT QUẢ KIỂM THỬ & MINH CHỨNG VẬT LÝ

1. **Hợp đồng kiểm thử mới (Contract Test Suite)**:
   - `tests/client/imp162_safari_polyfill_and_webgl_stability.test.ts`: **24/24 tests PASSED (100%)**.
   - Bao phủ trọn vẹn Ma trận 4 Mặt: Boundary (7 tests), Reactivity (6 tests), Disposal (8 tests), Error Defense (3 tests).
2. **Kiểm tra hồi quy toàn hệ thống (Full Regression Suite)**:
   - `npm test`: **288 test files PASSED, 5,899 tests PASSED (0 failures, 0 regressions)**.
3. **Kiểm tra kiểu tĩnh TypeScript**:
   - `npx tsc --noEmit`: **0 errors**.
4. **UI Craft Linter**:
   - `npm run lint:ui`: **0 anti-patterns across 169 files**.
5. **Độc lập thẩm định Trạm 3**:
   - `spec-reviewer` và `re-reviewer` đã kiểm toán đĩa cứng vật lý và kết luận: **Fix round: All findings addressed, no new Critical/Important breakage.**
6. **Bằng chứng snapshot**:
   - `.agents/evidence/imp162_snapshot.json` đã được cập nhật tự động.

---

## 4. BÀI HỌC KINH NGHIỆM ĐÃ THỂ CHẾ HÓA

- **Gotcha #222**: *Bất Biến Polyfill W3C roundRect, WebGL Context Loss & Phòng Thủ Rò Rỉ Bộ Nhớ Audio/Texture* đã được ghi nhận vào `docs/domain/gotchas.md`.
- **Quy tắc dọn dẹp GPU**: Bất kỳ bộ nhớ đệm texture nào trong R3F/Three.js cũng phải có hàm xóa gọi `.dispose()`, và phải được kết nối vào vòng đời unmount của component React thật (`GameCanvas`), không được để thành dead code chỉ dùng cho test.
