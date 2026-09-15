# KẾ HOẠCH TRIỂN KHAI VÉ CẢI TIẾN IMP-63

> **Tiêu đề**: Lean & High-Performance Tabletop HUD (Zero Backdrop Blur, Ivory Solid Tokens & GPU Optimization)  
> **Mã vé**: `IMP-63`  
> **Mục tiêu**: Đồng bộ toàn bộ các thành phần HUD trong ván đấu (`TopBar`, `ActionDock`, `PlayerCard`, `SocialEmotesTray`, `FloatingNumbers`, `ModalBackdrop`) và Sảnh chờ (`PreMatchDeck`, `PlayerSlotCard`, `QrCodeCard`) sang ngôn ngữ thiết kế Cờ Bàn Giấy Ngà Sáng (`#FFFDF8` / `#F7F2E7`), triệt tiêu 100% `backdrop-blur` để tối ưu GPU và 60 FPS Canvas.  
> **Ràng buộc cốt lõi từ người dùng**: HẠN CHẾ TÔ VẼ, KHÔNG LÀM NẶNG GAME, CẮT BỎ CÁC EFFECT DƯ THỪA.  

---

## System Impact & Blast Radius
- **Risk Dial**: Slice-Bound (Level 2) — Tác động thuần túy vào tầng trình diễn DOM UI và CSS styling của Client. Không thay đổi bất kỳ logic FSM, luật tính toán tài chính, WebSocket server hay cơ sở dữ liệu.
- **Direct Touch**:
  - `src/client/ui/top_bar.tsx`
  - `src/client/ui/action_dock.tsx`
  - `src/client/ui/player_card.tsx`
  - `src/client/ui/social_emotes_tray.tsx`
  - `src/client/ui/floating_numbers.tsx`
  - `src/client/ui/modals/modal_backdrop.tsx`
  - `src/client/ui/lobby/pre_match_deck.tsx`
  - `src/client/ui/lobby/player_slot_card.tsx`
  - `src/client/ui/lobby/qr_code_card.tsx`
- **Downstream Consumers**:
  - `HudContainer` (chứa các thành phần HUD).
  - Toàn bộ các test suite kiểm tra DOM markup hiện hữu (`tests/client/ui03_dom_hud.test.ts`, `tests/client/social_emotes_tray.test.ts`, `tests/client/ui06_lobby_screen.test.ts`).
- **Worst-Case Defense**:
  - Bảo lưu 100% các `data-testid`, `role`, `aria-label`, và các thuộc tính dữ liệu tương thích (`data-legacy-style`).
  - Kiểm tra toàn bộ 165 test suites hiện có qua `npm test` để cam kết Zero Regression.

---

## 1. PHÂN TÍCH HIỆN TRẠNG & TỐI ƯU HÓA GPU

### A. Vấn đề nghẽn hiệu năng GPU (GPU Fill-Rate Drain)
Hiện tại, các thành phần UI đang sử dụng `backdrop-blur-md` và `backdrop-blur-2xl`. Khi các thành phần này nổi trên Canvas 3D (60 FPS):
1. Mỗi khung hình, GPU phải thực hiện copy framebuffer của WebGL 3D sang một texture phụ.
2. GPU chạy bộ lọc Gaussian Blur 2 chiều đa tầng trên texture đó.
3. Sau đó mới composite ngược lại vào màn hình cùng các lớp DOM UI.
Điều này làm hao tổn băng thông bộ nhớ đồ họa và giảm FPS trên các máy tính có card onboard hoặc thiết bị di động.

### B. Giải pháp "Lean Tabletop" (Nhẹ & Sắc Nét)
- **Triệt tiêu toàn bộ `backdrop-blur`**: Thay thế bằng nền giấy đặc màu ngà `#FFFDF8` hoặc kem ấm `#F7F2E7` có viền mực đen 2px `border-slate-900`.
- **0 Texture mới, 0 SVG nặng, 0 Canvas generator bổ sung**: Chỉ sử dụng các class Tailwind cơ bản có sẵn trong gói bundle hiện tại.
- **Bảo lưu bố cục tối giản**: Giữ nguyên toàn bộ layout hiện hữu, không vẽ thêm các chi tiết rườm rà (vé đục lỗ, ghế mây...).

---

## 2. QUY TRÌNH 3 TRẠM (MANDATORY 3-STATION PIPELINE)

### Trạm 1: RED Contract Testing (`qa-tester`)
- **Tệp test mới**: `tests/contracts/imp63_lean_tabletop_hud_and_perf.test.ts`
- **Mật độ kiểm thử**: >= 16 atomic tests (1–4 assertions/test, không lặp trong `it()`).
- **Bao phủ 4 Facets hợp đồng**:
  1. *Facet 1 (Backdrop Blur Purge & GPU Fill-rate)*: Kiểm tra `TopBar`, `ActionDock`, `PlayerCard`, `SocialEmotesTray`, `ModalBackdrop` không chứa lớp `backdrop-blur`.
  2. *Facet 2 (Tabletop Solid Ivory Palette)*: Kiểm tra các thành phần HUD chuyển sang nền ngà sáng (`#FFFDF8` hoặc `#F7F2E7`) và viền đen mực in `border-slate-900` / `border-2`.
  3. *Facet 3 (Tactile Toy Buttons & Contrast)*: Kiểm tra các nút trong `ActionDock` và `TopBar` duy trì đầy đủ accessibility `aria-label`, `role="timer"`, nhãn hiển thị mực đen tương phản cao.
  4. *Facet 4 (PreMatchDeck Clean Alignment)*: Kiểm tra sảnh chờ loại bỏ nền đen tối kiểu Sci-Fi, giữ nguyên 100% `data-testid` để tương thích toàn bộ test suite sảnh chờ cũ.
- **Xác nhận Adversarial Inversion**: Chạy `npx vitest run tests/contracts/imp63_lean_tabletop_hud_and_perf.test.ts` chứng minh bài test THẤT BẠI (RED) trên nền mã nguồn hiện tại.

### Trạm 2: GREEN Implementation (`implementer`)
Thực hiện chỉnh sửa tối thiểu trên 9 tệp UI để đạt GREEN:
1. **`src/client/ui/top_bar.tsx`**:
   - Bỏ `backdrop-blur-md`, chuyển khung sang `bg-[#FFFDF8] border-2 border-slate-900 text-slate-900 shadow-[0_4px_0_0_#0f172a]`.
   - Các nút con (thời gian, âm thanh, feed) đổi sang phong cách nút đồ chơi giấy ngà viền đen.
2. **`src/client/ui/action_dock.tsx`**:
   - Bỏ `backdrop-blur-md`, chuyển khung sang `bg-[#FFFDF8] border-2 border-slate-900 shadow-[0_4px_0_0_#0f172a]`.
   - Các nút Quản lý BĐS, Đàm phán, Mua đất dùng nút bấm đồ chơi nảy lún có viền rõ ràng.
3. **`src/client/ui/player_card.tsx`**:
   - Bỏ `backdrop-blur-md`, chuyển khung sang `bg-[#FFFDF8] border-2 border-slate-900 text-slate-900 shadow-[0_4px_0_0_#0f172a]`.
   - Chữ mực đen `#0F172A`, emote popover nền kem viền đen.
4. **`src/client/ui/social_emotes_tray.tsx`**:
   - Bỏ `backdrop-blur-md`, chuyển sang `bg-[#FFFDF8] border-2 border-slate-900 shadow-[0_4px_0_0_#0f172a]`.
5. **`src/client/ui/floating_numbers.tsx`**:
   - Bỏ `backdrop-blur-md` và glow blur, dùng tem viền dập phẳng rõ nét chữ trắng/đen sắc sảo.
6. **`src/client/ui/modals/modal_backdrop.tsx`**:
   - Bỏ `backdrop-blur-[2px]`, dùng lớp phủ đen trong suốt nhẹ `bg-slate-900/15` giữ sa bàn 3D sáng rõ.
7. **`src/client/ui/lobby/pre_match_deck.tsx`**:
   - Chuyển khung bảng điều khiển bên phải từ nền đen xanh sang phong cách cờ bàn thanh lịch, loại bỏ các lớp blur nặng, giữ nguyên 100% `data-testid`.
8. **`src/client/ui/lobby/player_slot_card.tsx`**:
   - Đổi nền slot từ đen tối sang nền sáng sạch sẽ, nút thêm bot dạng nút bấm đồ chơi.
9. **`src/client/ui/lobby/qr_code_card.tsx`**:
   - Đổi nền sang giấy ngà `#FFFDF8` viền đen 2px.

### Trạm 3: Independent Review & Verification
- `spec-reviewer`: Thẩm định đối chiếu 100% hợp đồng và cam kết "không tô vẽ, không làm nặng game".
- `ui-craft-reviewer`: Thẩm định chất lượng giao diện (0 vi phạm `npm run lint:ui`, 0 anti-patterns).
- Chạy toàn bộ test suites của dự án (`npm test`) đảm bảo 100% PASS.

---

## 3. VERIFICATION PLAN

### Automated Tests
```bash
# 1. Kiểm tra RED/GREEN vé IMP-63
npx vitest run tests/contracts/imp63_lean_tabletop_hud_and_perf.test.ts

# 2. Kiểm tra UI linter (0 anti-patterns)
npm run lint:ui

# 3. Kiểm tra kiểm thử nhanh toàn bộ dự án
npm run gate:quick

# 4. Kiểm tra toàn bộ 165 test suites
npm test
```

### Manual Verification
- Mở game trên trình duyệt (`http://localhost:5173/`), kiểm tra độ mượt khung hình (FPS), quan sát sự biến mất của các mảng đen xung đột trên màn hình chơi, kiểm tra độ sắc nét và khả năng đọc của chữ số trên TopBar, ActionDock và Thẻ người chơi.
