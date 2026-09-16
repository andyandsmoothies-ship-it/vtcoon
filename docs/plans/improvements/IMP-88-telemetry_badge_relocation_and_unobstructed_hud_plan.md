# Kế Hoạch Kỹ Thuật IMP-88: Dời Vị Trí Telemetry Badge & Giải Phóng Cụm Tiện Ích HUD

> **Mã Ticket**: IMP-88  
> **Phân loại**: UI/UX Layout & Ergonomics Polish  
> **Mục tiêu**: Dời huy hiệu viễn trắc (FPS / Ping / Invariants) từ góc trên bên phải (`absolute top-4 right-4`) xuống góc dưới bên phải (`footer justify-between`), giải phóng hoàn toàn không gian cho cụm nút tiện ích TopBar ("Ánh Sáng", "Bật", "Nhật Ký", "Thoát") và danh sách thẻ người chơi PlayerHudList.

---

## 1. NGUYÊN NHÂN GỐC RỄ & PHÂN TÍCH BỐ CỤC

| Hiện tượng | Nguyên nhân Gốc rễ | Giải pháp Kỹ thuật |
| :--- | :--- | :--- |
| **Huy hiệu FPS che khuất các nút TopBar và Player 1** | `hud_container.tsx` định vị cứng `<TelemetryBadge />` tại `absolute top-4 right-4 z-20`. Cụm nút tiện ích `TopBar` (`hud-utilities-cluster`) và thẻ người chơi P1 trong `PlayerHudList` cũng nằm ở góc trên bên phải, khiến viên thuốc FPS/Ping đè trực tiếp lên nút Âm thanh, Nhật Ký, Thoát Sảnh. | Xóa bỏ định vị `top-4 right-4`. Đưa `<TelemetryBadge />` vào góc dưới bên phải bên trong thẻ `<footer>` (`flex-row justify-between items-end`), đối xứng với ActionDock ở góc dưới bên trái. |
| **Bội chi GPU do backdrop-blur trên DOM Overlay** | `telemetry_badge.tsx` sử dụng `backdrop-blur-md` buộc GPU copy framebuffer phụ trên Canvas 3D. | Loại bỏ hoàn toàn `backdrop-blur-md`, chuyển sang nền đặc tông tối `bg-slate-950/95` tương phản cao theo Gotcha #87. |

---

## 2. SƠ ĐỒ BỐ CỤC GIAO DIỆN SAU KHI DỜI

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [TopBar Trái: Vòng đấu, Timer, Kho Bạc]              [TopBar Phải: Ánh Sáng, Bật, 📜, 🚪]│
│                                                      [Player 1: Đại Gia Chủ Sảnh]      │
│                                                      [Player 2: Bot AI 2]              │
│                                                      [Player 3: Bot AI 3]              │
│                               [ KHÔNG GIAN 3D ]      [Player 4: Bot AI 4]              │
│                                                      (100% THÔNG THOÁNG KHÔNG BỊ CHE)  │
│                                                                                        │
│                                                                                        │
│                                                                                        │
│ [ActionDock: 🎲 Đổ, 🏷️ Mua, 🏛️ Quản lý, ⏭️ Hết]            [🟢 60 FPS | 25ms | 🛡️ OK] │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. MA TRẬN 4 DIỆN MẠO HÀNH VI KIỂM THỬ (TRẠM 1)

Tệp: `tests/contracts/imp88_telemetry_badge_relocation.test.ts` (16 atomic tests):
- **Facet 1: Top-Right Unobstructed Invariant**:
  - TC-88.01: Loại bỏ hoàn toàn class `absolute top-4 right-4` bọc TelemetryBadge.
  - TC-88.02: Không còn bất kỳ định vị `top-` nào bọc TelemetryBadge.
  - TC-88.03: Cụm tiện ích TopBar bên phải không bị che phủ bởi bất kỳ phần tử nào.
  - TC-88.04: PlayerHudList không bị xâm phạm tọa độ đỉnh.
- **Facet 2: Bottom-Right Footer Docking Invariant**:
  - TC-88.05: Đưa TelemetryBadge vào bên trong thẻ `<footer>`.
  - TC-88.06: Thẻ `footer` sử dụng `justify-between items-end`.
  - TC-88.07: Bọc TelemetryBadge duy trì cờ responsive `hidden sm:block`.
  - TC-88.08: Duy trì `pointer-events-auto`.
  - TC-88.09: Render thực tế TelemetryBadge nằm sau ActionDock.
- **Facet 3: Zero Backdrop Blur & Solid Fill (Gotcha #87)**:
  - TC-88.10: Loại bỏ hoàn toàn `backdrop-blur-md`.
  - TC-88.11: Sử dụng nền đặc tông tối `bg-slate-950/95`.
  - TC-88.12: Bảo toàn `data-testid="telemetry-badge"`.
  - TC-88.13: Định dạng chính xác chuỗi FPS và Ping.
- **Facet 4: Defense & A11y Semantics**:
  - TC-88.14: Hiển thị cảnh báo khi FPS < 30.
  - TC-88.15: Hiển thị lỗi khi có vi phạm CRITICAL.
  - TC-88.16: Bảo toàn thuộc tính trợ năng `aria-label` và phím tắt `~`.
