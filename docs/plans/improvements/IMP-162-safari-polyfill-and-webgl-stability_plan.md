# KẾ HOẠCH TRIỂN KHAI (IMPLEMENTATION PLAN)
## IMP-162: Safari Polyfill, WebGL Mobile Context Loss & Audio/Texture Memory Leak Defense

> **Ticket**: IMP-162  
> **Type**: Architecture / Infrastructure / Cross-Browser Hardening (Safari, Chrome, Edge) & Mobile RAM Safety  
> **Trạng thái kiểm toán**: Đã tích hợp 100% 5 chỉ định bắt buộc từ Báo cáo Phản biện Zero-Trust [`.agents/audit/PLAN_AUDIT_IMP-162.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-162.md)  
> **Traceability**: `docs/domain/gotchas.md` (Gotchas #83, #150, #221), ADR-0002, `GEMINI.md §1`  
> **Risk Tier**: Tier 2 (Infrastructure/Cross-Browser WebGL/Audio — 3-Station Pipeline: RED ➔ GREEN ➔ Independent Audit)  

---

## 1. Bối Cảnh & Mục Tiêu Kỹ Thuật

Qua đợt rà soát đối kháng hiệu năng 3D, WebAudio và khả năng tương thích đa trình duyệt (Chrome, Safari, Edge cả Desktop và Mobile), phát hiện 5 lỗ hổng nghiêm trọng ở tầng client/runtime:
1. **Bẫy Sập Màn Hình 3D trên Safari iOS < 16 & Zalo/FB In-App Browser (`TypeError: ctx.roundRect is not a function`)**:
   - `CanvasRenderingContext2D.prototype.roundRect` chỉ được hỗ trợ từ Safari 16 (iOS 16+). Trên iOS 15 trở xuống hoặc Webview của Zalo/Facebook/Messenger cũ, phương thức này không tồn tại.
   - Các file `auction_deed_texture.ts`, `event_card_texture.ts`, `tile_texture_generator.ts`, `corner_tile_art.ts` gọi trực tiếp `ctx.roundRect()` không có fallback, khiến toàn bộ tiến trình render texture 3D văng lỗi runtime và làm sập bàn cờ 3D.
2. **Bẫy Đen Màn Hình Mobile khi Mất Ngữ Cảnh WebGL (`webglcontextlost` & `webglcontextrestored`)**:
   - `game_canvas.tsx` thiếu event listener bắt `webglcontextlost` với `event.preventDefault()`. Theo đặc tả W3C WebGL, nếu không gọi `preventDefault()`, trình duyệt sẽ vĩnh viễn không phục hồi context sau khi người chơi nhận cuộc gọi, khóa màn hình hoặc chuyển tab trên iOS Safari/Android Chrome.
   - Khi context được phục hồi (`webglcontextrestored`), GPU cấp context mới nhưng các cache procedural texture vẫn giữ texture cũ thuộc context đã chết, khiến bàn cờ bị vẽ đen kịt.
3. **Rò Rỉ WebAudio GainNode & Bỏ Qua Cờ Mute trong `hose_modal.tsx`**:
   - Hàm `playFloorBellSound` kết nối `gain.connect(sharedAudioCtx.destination)` nhưng không bao giờ ngắt kết nối (`gain.disconnect()`), khiến các AudioNode bị kẹt vĩnh viễn trong đồ thị âm thanh.
   - Nếu `AudioContext` bị suspended (Safari/Chrome mobile khi thiếu user gesture), `currentTime` không chạy khiến `osc.onended` không kích hoạt. Đồng thời hàm bỏ qua thiết lập tắt tiếng `useAudioStore.getState().isMuted`.
4. **Rò Rỉ VRAM/RAM khi Xóa Texture Cache mà Không Gọi `.dispose()`**:
   - `mascot_canvas_texture.ts` (`clearMascotTextureCache`), `heritage_tile_texture.ts` (`clearHeritageTileTextureCache`), `board_tile.tsx` (`clearStandeeWebpCache`), `tile_texture_generator.ts` (`clearTileTextureCache`), và `pawn_animator.tsx` (`emoteCanvasCache`) chỉ xóa Map/biến mà không giải phóng texture trên GPU (`texture.dispose()`).
   - `owner_property_markers.tsx` chứa `priceTextureCache` nhưng không có hàm xóa dọn dẹp nào.
5. **Cạm Bẫy Mã Chết (Dead Code)**:
   - Các hàm `clear...Cache()` hiện tại chỉ phục vụ unit test, chưa từng được gắn vào vòng đời unmount của component thực tế, dẫn tới rò rỉ RAM/VRAM khi chuyển phòng hoặc kết thúc ván đấu.

---

## 2. Kiến Trúc Phòng Vệ Runtime (Architecture & Defense Matrix)

```
[Trình Duyệt: Safari / Chrome / Edge / Mobile Webview]
        │
        ├── [main.tsx & game_canvas.tsx] ──> import '../polyfills/canvas_round_rect'
        │                                     └── Auto-install CanvasRenderingContext2D & Path2D .roundRect()
        │                                           ├── Chuẩn hóa W3C: w < 0, h < 0, RangeError nếu r < 0
        │                                           ├── Co tỉ lệ bán kính tỷ lệ thuận S = min(w/(r1+r2), ...)
        │                                           └── 100% texture 3D (thẻ bài, ô đất, cờ góc) vẽ an toàn qua arcTo
        │
        ├── [game_canvas.tsx] ──> <WebGLContextWatcher />
        │                           ├── canvas.addEventListener('webglcontextlost', e => e.preventDefault())
        │                           ├── canvas.addEventListener('webglcontextrestored', rebind / clearAll3DTextureCaches())
        │                           └── Clean up on unmount: clearAll3DTextureCaches()
        │
        ├── [hose_modal.tsx] ──> playFloorBellSound()
        │                           ├── Kiểm tra useAudioStore.getState().isMuted ➔ return sớm
        │                           └── Idempotent cleanup: osc1.onended = cleanup & setTimeout(cleanup, 1200)
        │                                 └── gain.disconnect(), osc1.disconnect(), osc2.disconnect()
        │
        └── [src/client/3d/ All 6 Texture Caches]
              ├── mascot_canvas_texture.ts   ──> dispose() từng CanvasTexture trước khi clear
              ├── heritage_tile_texture.ts   ──> cachedEncausticTexture?.dispose() trước khi gán null
              ├── board_tile.tsx             ──> if (tex?.dispose) tex.dispose() trước khi clear
              ├── tile_texture_generator.ts  ──> dispose() toàn bộ tile và standee textures
              ├── pawn_animator.tsx          ──> clearEmoteCanvasCache() với dispose()
              ├── owner_property_markers.tsx ──> clearPriceTextureCache() với dispose()
              └── texture_cache_manager.ts   ──> clearAll3DTextureCaches() hợp nhất toàn bộ
```

---

## 3. Danh Sách Thay Đổi Chi Tiết Theo Từng Thành Phần

### Nhóm 1: Polyfill Toàn Cục & Chuẩn Hóa Hình Học W3C
#### [NEW] [`src/client/polyfills/canvas_round_rect.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/polyfills/canvas_round_rect.ts)
- **Tự động kích hoạt khi import (Auto-install)**:
  `if (typeof window !== 'undefined' || typeof CanvasRenderingContext2D !== 'undefined') { installCanvasRoundRectPolyfill(); }`.
- **Chuẩn hóa tọa độ âm theo đặc tả W3C**:
  ```ts
  if (w < 0) { x += w; w = -w; }
  if (h < 0) { y += h; h = -h; }
  ```
- **Kiểm tra hợp lệ bán kính**: ném `RangeError` nếu bất kỳ phần tử bán kính nào `< 0`.
- **Co tỉ lệ bán kính tỷ lệ thuận (Proportional Scaling)**:
  Nếu tổng hai bán kính liền kề lớn hơn chiều dài cạnh tương ứng, thu nhỏ tỷ lệ đồng dạng theo W3C $S = \min(w / (rTL + rTR), w / (rBL + rBR), h / (rTL + rBL), h / (rTR + rBR), 1)$.
- **Vẽ đường cong mượt mà qua `arcTo` và `closePath()`**.
- **Cài đặt cho cả `CanvasRenderingContext2D.prototype.roundRect` và `Path2D.prototype.roundRect`** (nếu `Path2D` tồn tại trong môi trường).

#### [MODIFY] [`src/client/main.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/main.tsx)
- Import `./polyfills/canvas_round_rect` ở dòng đầu tiên.

#### [MODIFY] [`src/client/game_canvas.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx)
- Import `./polyfills/canvas_round_rect` ở đầu tệp song hành cùng `./3d/r3f_fiber_shield` để bảo đảm nạp lười (`React.lazy`) hay unit test chạy riêng lẻ đều sở hữu polyfill.

---

### Nhóm 2: Chống Đen Màn Hình WebGL & Quản Lý Vòng Đời Texture Toàn Diện
#### [NEW] [`src/client/3d/texture_cache_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/texture_cache_manager.ts)
- Tập hợp và xuất khẩu hàm hợp nhất:
  ```ts
  export function clearAll3DTextureCaches(): void {
    clearTileTextureCache();
    clearStandeeWebpCache();
    clearMascotTextureCache();
    clearHeritageTileTextureCache();
    clearPriceTextureCache();
    clearEmoteCanvasCache();
  }
  ```

#### [MODIFY] [`src/client/game_canvas.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx)
- Bổ sung component con bên trong `<Canvas>`: `WebGLContextWatcher`.
- Trong `useEffect`:
  - Đăng ký `webglcontextlost`: gọi `event.preventDefault()` (bắt buộc theo W3C).
  - Đăng ký `webglcontextrestored`:
    * Gọi `clearAll3DTextureCaches()` để xả toàn bộ texture cũ khỏi cache JS.
    * Kích hoạt render lại để Three.js tái tạo và nạp pixel mới lên context WebGL vừa được khôi phục, triệt tiêu hoàn toàn lỗi đen màn hình.
  - Hàm cleanup `return () => { ... }`: gỡ sạch 2 listener khi unmount.
- Gắn `clearAll3DTextureCaches()` vào `useEffect` unmount của `GameCanvas` để dọn sạch VRAM/RAM khi người chơi rời bàn cờ/đổi phòng.

---

### Nhóm 3: Dọn Sạch Rò Rỉ Audio Node & Tôn Trọng Thiết Lập Mute
#### [MODIFY] [`src/client/ui/modals/hose_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/hose_modal.tsx)
- Tại hàm `playFloorBellSound()`:
  - Kiểm tra mute:
    ```ts
    const { isMuted } = useAudioStore.getState();
    if (isMuted) return;
    ```
  - Triển khai cơ chế giải phóng tài nguyên kép (Idempotent Cleanup with Fallback Timer):
    ```ts
    let disposed = false;
    const cleanup = () => {
      if (disposed) return;
      disposed = true;
      try {
        gain.disconnect();
        osc1.disconnect();
        osc2.disconnect();
      } catch {
        // Safe disposal
      }
    };
    osc1.onended = cleanup;
    setTimeout(cleanup, 1200); // Phao cứu sinh nếu clock bị đình chỉ trên mobile Safari
    ```

---

### Nhóm 4: Giải Phóng Bộ Nhớ GPU Toàn Bộ 6 Texture Caches
#### [MODIFY] [`src/client/3d/mascot_canvas_texture.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/mascot_canvas_texture.ts)
- `clearMascotTextureCache()`: duyệt qua `textureCache.values()`, kiểm tra `if (tex?.dispose) tex.dispose()`.

#### [MODIFY] [`src/client/3d/heritage_tile_texture.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/heritage_tile_texture.ts)
- `clearHeritageTileTextureCache()`: gọi `if (cachedEncausticTexture?.dispose) cachedEncausticTexture.dispose()` trước khi gán về `null`.

#### [MODIFY] [`src/client/3d/board_tile.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_tile.tsx)
- `clearStandeeWebpCache()`: duyệt qua `standeeWebpCache.values()`, kiểm tra an toàn `if (tex && typeof tex.dispose === 'function') tex.dispose()`.

#### [MODIFY] [`src/client/3d/tile_texture_generator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/tile_texture_generator.ts)
- `clearTileTextureCache()`: duyệt qua cả `tileTextureCache.values()` và `standeeTextureCache.values()`, kiểm tra an toàn `if (tex?.dispose) tex.dispose()`.

#### [MODIFY] [`src/client/3d/owner_property_markers.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/owner_property_markers.tsx)
- Xuất khẩu hàm mới: `clearPriceTextureCache(): void`, duyệt `priceTextureCache.values()`, gọi `tex?.dispose()` an toàn và `priceTextureCache.clear()`.

#### [MODIFY] [`src/client/3d/pawn_animator.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/pawn_animator.tsx)
- Xuất khẩu hàm mới: `clearEmoteCanvasCache(): void`, duyệt `emoteCanvasCache.values()`, gọi `tex?.dispose()` an toàn và `emoteCanvasCache.clear()`.

---

## 4. Kế Hoạch Thẩm Định & Kiểm Thử (Verification Plan)

### A. Kiểm Thử Hợp Đồng Tự Động (Contract Test Suite)
- **Tệp mới**: `tests/client/imp162_safari_polyfill_and_webgl_stability.test.ts`
- **Các ca kiểm thử cụ thể (Universal 4-Facet Matrix)**:
  1. `TC-IMP162.01` [Polyfill Install]: Khi `CanvasRenderingContext2D.prototype.roundRect` chưa có, module polyfill tự động cài đặt phương thức hợp lệ.
  2. `TC-IMP162.02` [Polyfill Single Radius]: `ctx.roundRect(10, 20, 100, 50, 8)` vẽ đúng qua `arcTo`.
  3. `TC-IMP162.03` [Polyfill Multi Radii]: `ctx.roundRect(10, 20, 100, 50, [10, 5, 10, 5])` vẽ đúng 4 góc.
  4. `TC-IMP162.04` [Polyfill Negative Dims]: `ctx.roundRect(100, 50, -60, -30, 8)` chuẩn hóa sang tọa độ dương theo chuẩn W3C mà không méo nét.
  5. `TC-IMP162.05` [Polyfill Negative Radii Error]: `ctx.roundRect(0, 0, 100, 50, -5)` ném `RangeError`.
  6. `TC-IMP162.06` [Polyfill Proportional Scaling]: Khi $r_1 + r_2 > w$, bán kính được co tỉ lệ đồng dạng hợp lệ.
  7. `TC-IMP162.07` [WebGL Context Lost]: Listener trên canvas gọi `event.preventDefault()` khi nhận event `webglcontextlost`.
  8. `TC-IMP162.08` [WebGL Context Restored]: Nhận `webglcontextrestored` kích hoạt xả cache texture procedural sạch sẽ.
  9. `TC-IMP162.09` [Mascot Texture Dispose]: `clearMascotTextureCache()` gọi `.dispose()` trên 100% texture trong cache.
  10. `TC-IMP162.10` [Heritage Texture Dispose]: `clearHeritageTileTextureCache()` gọi `.dispose()` trên texture gạch bông.
  11. `TC-IMP162.11` [Board Tile Standee Dispose]: `clearStandeeWebpCache()` an toàn với các giá trị `null` và gọi `.dispose()` trên mock texture.
  12. `TC-IMP162.12` [Tile Texture Generator Dispose]: `clearTileTextureCache()` gọi `.dispose()` trên cả tile và standee textures.
  13. `TC-IMP162.13` [Owner Price Pill Dispose]: `clearPriceTextureCache()` gọi `.dispose()` trên toàn bộ price textures.
  14. `TC-IMP162.14` [Emote Canvas Texture Dispose]: `clearEmoteCanvasCache()` gọi `.dispose()` trên emote textures.
  15. `TC-IMP162.15` [Unified Clear Manager]: `clearAll3DTextureCaches()` kích hoạt đồng thời toàn bộ 6 hàm clear texture.
  16. `TC-IMP162.16` [WebAudio Mute Guard]: `playFloorBellSound()` không khởi tạo audio nodes khi `useAudioStore` đang ở trạng thái mute.
  17. `TC-IMP162.17` [WebAudio Idempotent Cleanup]: Gọi `cleanup` ngắt kết nối `gain.disconnect()` và an toàn khi gọi nhiều lần.

### B. Kiểm Thử Hồi Quy & Cổng Chất Lượng
- `npm test`: Đảm bảo 100% test suite hiện hành (287 test files, 5.875+ tests) tiếp tục PASS, zero regression.
- `npm run lint:ui`: Đảm bảo 0 lỗi UI linter.
- `npx tsc --noEmit`: Đảm bảo 0 lỗi TypeScript strict mode.
