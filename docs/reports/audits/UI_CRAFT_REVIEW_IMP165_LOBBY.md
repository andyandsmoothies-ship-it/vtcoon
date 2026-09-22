# 🎨 2D UI CRAFT REVIEW REPORT — SẢNH CHỜ VTCOON (IMP-165)

```yaml
disposition: ship
reviewer: ui-craft-reviewer (Antigravity 2.0 & Impeccable Engine)
target_files:
  - src/client/ui/lobby/pre_match_deck.tsx
  - src/client/ui/lobby/player_slot_card.tsx
  - src/client/ui/lobby/qr_code_card.tsx
linter_status: clean (0 anti-patterns across 169 files)
target_viewport: "@360px" (Mobile Viewport Budget)
timestamp: 2026-09-22T15:58:00+07:00
verdict: PASS (Round 2)
```

---

## 1. Nét Tinh Hoa Bảo Lưu (keep)

- **Thương Hiệu Sa Bàn 3D Dập Nổi (Juicy Gloss Specular Highlight)**:
  Header dập nổi đỏ - vàng hoàng gia với lớp phủ vệt bóng bề mặt (`from-white/30 via-white/10 to-transparent`) và huy hiệu kim loại mạ vàng 3D (`shadow-[0_3px_0_0_#78350f]`) đạt chuẩn thương mại cao cấp (Monopoly GO / Townscaper).
- **Đổ Bóng Xúc Giác Nút Bấm Chính**:
  Nút "BẮT ĐẦU TRẬN ĐẤU" sở hữu độ nảy xúc giác dứt khoát 3 tầng dập nổi (`shadow-[0_5px_0_0_#064e3b] active:translate-y-[2px]`), phân tầng thị giác rực rỡ và rõ ràng giữa trạng thái khóa (`slate-100 text-slate-500`) và sẵn sàng (`from-emerald-400 via-emerald-500 to-emerald-600 text-white`).
- **Liên Kết Đồng Bộ Màu Sắc Token 2D & 3D**:
  Vòng tròn avatar và viền slot thừa hưởng trực tiếp `slot.tokenColor` và `slot.pawnSlot` từ SSOT 3D, tạo sự đồng bộ nhận diện thị giác tuyệt đối giữa sảnh chờ và sa bàn Đảo Ngọc.

---

## 2. Danh Sách Lỗi Vật Lý Cần Sửa (P1 – P6 trên Viewport `@360px`)

### [P1] Tràn Viewport Do Dùng Viewport Tĩnh (Raw `vh`)
- **Vị trí**: [`src/client/ui/lobby/pre_match_deck.tsx#L209`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/lobby/pre_match_deck.tsx#L209)
- **Viewport**: `@360px`
- **Mã lỗi**: `first-viewport-column-overflow` & `dynamic-viewport`
- **Hiện tượng**: Thẻ sảnh chờ sử dụng `max-h-[calc(100vh-7rem)]`. Trên trình duyệt di động (Safari iOS / Chrome Android), thanh công cụ URL chiếm từ 56px đến 80px đáy màn hình khiến `100vh` bị che khuất, đẩy cụm nút "BẮT ĐẦU TRẬN ĐẤU" / "SẴN SÀNG" tụt khỏi tầm nhìn ngón tay cái.
- **Giải pháp**:
  ```tsx
  // Thay thế max-h tĩnh bằng Dynamic Viewport Height (dvh)
  className="... max-h-[calc(100dvh-7rem)] md:max-h-[calc(100dvh-3rem)] ..."
  ```

---

### [P2] Cụm Nút Hành Động Phụ Vi Phạm Chuẩn Touch Target < 44px
- **Vị trí**:
  - [`src/client/ui/lobby/pre_match_deck.tsx#L232`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/lobby/pre_match_deck.tsx#L232) (`min-h-[40px]`)
  - [`src/client/ui/lobby/pre_match_deck.tsx#L249`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/lobby/pre_match_deck.tsx#L249) (`min-h-[42px]`)
  - [`src/client/ui/lobby/pre_match_deck.tsx#L258`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/lobby/pre_match_deck.tsx#L258) (`min-h-[42px]`)
  - [`src/client/ui/lobby/qr_code_card.tsx#L90`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/lobby/qr_code_card.tsx#L90) (chỉ dùng `py-2`, thực tế ~34px)
- **Viewport**: `@360px`
- **Mã lỗi**: `touch-target-size`
- **Hiện tượng**: Các nút "Sao chép" mã phòng, "Hướng Dẫn", "Mã QR" và "Sao Chép Liên Kết Mời" có kích thước 34px – 42px (< 44px chuẩn công thái học di động), người chơi rất dễ chạm trượt khi thao tác bằng một tay trên điện thoại.
- **Giải pháp**:
  ```tsx
  // pre_match_deck.tsx: Chuẩn hóa toàn bộ về min-h-[44px]
  className="min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold ..." // Sao chép mã
  className="inline-flex items-center justify-center gap-1 min-h-[44px] px-2.5 rounded-lg ..." // Hướng dẫn & QR

  // qr_code_card.tsx: Bổ sung min-h-[44px]
  className="w-full min-h-[44px] py-2.5 px-4 rounded-xl font-bold text-xs ..."
  ```

---

### [P3] Khối QR Code Mở Trực Tiếp Làm Đè Bẹp Danh Sách Người Chơi
- **Vị trí**: [`src/client/ui/lobby/pre_match_deck.tsx#L265-L269`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/lobby/pre_match_deck.tsx#L265-L269)
- **Viewport**: `@360px`
- **Mã lỗi**: `first-viewport-column-overflow`
- **Hiện tượng**: Khi nhấn "Mã QR", khối `<QrCodeCard />` (cao ~350px) được render ngay trong header tĩnh của `aside` (ngoài vùng scroll `overflow-y-auto`). Chiều cao khối tăng vọt, đè bẹp danh sách 4 người chơi bên dưới xuống còn dưới 60px và đẩy nút bắt đầu văng khỏi viewport.
- **Giải pháp**: Đưa `QrCodeCard` vào dạng modal dialog riêng hoặc đặt bên trong vùng cuộn `overflow-y-auto` để bảo toàn không gian cho các slot và nút hành động cố định ở footer.

---

### [P4] Chữ Hiển Thị Thông Tin Chức Năng Dưới Sàn Đọc (< 11px)
- **Vị trí**:
  - [`src/client/ui/lobby/player_slot_card.tsx#L39`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/lobby/player_slot_card.tsx#L39) (`text-[10px]` kèm lỗi class `py-0.2`)
  - [`src/client/ui/lobby/player_slot_card.tsx#L88`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/lobby/player_slot_card.tsx#L88) (`text-[10px]`)
  - [`src/client/ui/lobby/player_slot_card.tsx#L102`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/lobby/player_slot_card.tsx#L102) (`text-[10px]`)
  - [`src/client/ui/lobby/pre_match_deck.tsx#L219`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/lobby/pre_match_deck.tsx#L219) (`text-[10px]`)
  - [`src/client/ui/lobby/pre_match_deck.tsx#L223`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/lobby/pre_match_deck.tsx#L223) (`text-[10px]`)
- **Viewport**: `@360px`
- **Mã lỗi**: `undersized-ui-text`
- **Hiện tượng**: Các nhãn "Trống", "Vị Trí X", "Bot AI", "Mã Phòng:", "ĐANG CHỜ" dùng cỡ chữ `10px` gây mờ và khó đọc trên màn hình điện thoại mật độ điểm ảnh thấp. `py-0.2` là cú pháp Tailwind không hợp lệ (bị bỏ qua ở runtime).
- **Giải pháp**:
  ```tsx
  // player_slot_card.tsx: Nâng lên sàn 11px và sửa py-0.5
  <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-600 font-medium">Trống</span>
  <span className="text-[11px] text-slate-400">Vị Trí {slotNumber}</span>
  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">Bot AI</span>

  // pre_match_deck.tsx:
  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mã Phòng:</span>
  <span className="text-[11px] px-2 py-0.5 rounded-full ...">...</span>
  ```

---

### [P5] Banner Thương Hiệu Trên Đỉnh Bị Tràn Viền Ngang Trên Mobile 360px
- **Vị trí**: [`src/client/ui/lobby/pre_match_deck.tsx#L138-L160`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/lobby/pre_match_deck.tsx#L138-L160)
- **Viewport**: `@360px`
- **Mã lỗi**: `horizontal-overflow`
- **Hiện tượng**: Header dùng `w-fit` chứa logo 48px + tiêu đề dài ("Sảnh Chờ Đảo Ngọc 🏝️ • Bến Cảng Du Thuyền") + cụm 3 nút. Tổng bề ngang thực tế đạt ~390px, lớn hơn chiều rộng 360px của màn hình, làm phát sinh thanh cuộn ngang hoặc đè lên mép của bảng sảnh chờ.
- **Giải pháp**:
  ```tsx
  // Thêm giới hạn bề rộng co giãn và truncate dòng mô tả phụ
  <header className="... max-w-[calc(100vw-1.5rem)] sm:max-w-none ...">
    ...
    <p className="text-[11px] font-bold text-amber-200 uppercase tracking-widest drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] mt-1 truncate max-w-[140px] sm:max-w-none">
      Sảnh Chờ Đảo Ngọc 🏝️
    </p>
  ```

---

### [P6] Cụm Điều Khiển Bot AI Quá Tải Chiều Ngang Khi Tên Dài
- **Vị trí**: [`src/client/ui/lobby/player_slot_card.tsx#L101-L128`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/lobby/player_slot_card.tsx#L101-L128)
- **Viewport**: `@360px`
- **Mã lỗi**: `cramped-padding`
- **Hiện tượng**: Khi slot là Bot AI, cụm điều khiển bên phải gồm 3 phần tử (Badge "Bot AI" + Nút tính cách + Nút xóa ✕) chiếm tới ~175px. Khi tên bot dài, phần tên bên trái bị ép xuống dưới 60px, gây méo cân đối dòng thẻ slot.
- **Giải pháp**:
  ```tsx
  // Trên mobile (@360px), ẩn badge "Bot AI" phụ (vì nút tính cách đã đại diện cho Bot)
  <span className="hidden sm:inline-block text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
    Bot AI
  </span>
  ```

---

## 3. Kết Quả Kiểm Tra Linter Nội Bộ

- **Lệnh**: `npm run lint:ui`
- **Kết quả**: `✅ [UI Linter] Clean! 0 Anti-patterns detected across 169 files.`
- **Đánh giá 4 Anti-patterns cấm kỵ**:
  - `border-accent-on-rounded`: **0 vi phạm** (Không có viền directional đè trên bo góc).
  - `bounce-easing`: **0 vi phạm** (Không có chuyển động nảy quá đà).
  - `gray-on-color`: **0 vi phạm** (Độ tương phản chuẩn, chữ amber trên nền amber).
  - `gradient-text`: **0 vi phạm** (Tiêu đề dùng solid color kết hợp `text-shadow` 3D dập nổi).

---

## 4. Kết Quả Khắc Phục & Thẩm Định Lại (Vòng 2 — Verdict: PASS)

Toàn bộ 6 phát hiện P1 – P6 đã được áp dụng và kiểm chứng thành công trên mã nguồn thực tế:

| Mã | Hạng mục | Giải pháp áp dụng | Trạng thái |
|:---|:---|:---|:---|
| **P1** | Dynamic Viewport `dvh` | Đổi `max-h-[calc(100vh-...)]` sang `max-h-[calc(100dvh-...)]` trên `<aside>` | ✅ **ĐÃ KHẮC PHỤC** |
| **P2** | Touch Target Floor | Nâng toàn bộ các nút thao tác phòng ("Sao chép", "Hướng Dẫn", "Mã QR", "Sao Chép Liên Kết Mời") lên tối thiểu `min-h-[44px]` | ✅ **ĐÃ KHẮC PHỤC** |
| **P3** | QR Code Isolation | Đưa `QrCodeCard` ra modal overlay chuyên biệt (`fixed inset-0 z-50`), có nút `✕` và backdrop blur, triệt tiêu hoàn toàn hiện tượng chèn ép thẻ người chơi | ✅ **ĐÃ KHẮC PHỤC** |
| **P4** | Sàn Chữ 11px & Fix Lỗi Class | Nâng tất cả chữ phụ (Trống, Vị Trí X, Mã Phòng, Đang Chờ) lên `text-[11px]`, sửa `py-0.2` thành `py-0.5` hợp lệ | ✅ **ĐÃ KHẮC PHỤC** |
| **P5** | Mobile 360px Header Banner | Bổ sung `max-w-[calc(100vw-1.5rem)] sm:max-w-none` cho `<header>` và `truncate max-w-[140px] sm:max-w-none` cho dòng mô tả phụ | ✅ **ĐÃ KHẮC PHỤC** |
| **P6** | Bot AI Control Density | Thêm `hidden sm:inline-block` cho badge "Bot AI" phụ trên mobile 360px, tối ưu không gian tên người chơi | ✅ **ĐÃ KHẮC PHỤC** |

### Kết quả chạy kiểm thử tự động:
- `npm run lint:ui`: **0 vi phạm** trên toàn bộ 169 files.
- `tests/client/ui06_lobby_screen.test.ts`: **12/12 PASS** (bổ sung test case contract kiểm tra touch target 44px, sàn chữ 11px, dvh).
- Suite tổng thể sảnh chờ: **55/55 PASS** (bao gồm `stress_10_clients_concurrency.test.ts`, `imp165_network_resilience.test.ts`, `imp165_multiplayer_lobby_sync.test.ts`, `net02_lobby.test.ts`).
- **Phán quyết cuối cùng**: **SHIP** (Đạt chuẩn trải nghiệm người dùng xúc giác và công thái học di động thương mại).
