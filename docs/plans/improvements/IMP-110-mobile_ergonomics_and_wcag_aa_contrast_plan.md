# KẾ HOẠCH CẢI TIẾN: IMP-110 - MOBILE ERGONOMICS & WCAG 2.1 AA CONTRAST HARDENING

> **Mã cải tiến:** IMP-110  
> **Hạng mục:** Mobile Ergonomics (Hạng mục 2) & Accessibility / A11y Contrast (Hạng mục 5)  
> **Mức độ rủi ro:** Isolated (Chỉ tác động lớp styling CSS / Tailwind 2D UI, không chạm Server FSM, không đổi logic tính điểm)  
> **Quy trình thực thi:** Bắt buộc tuân thủ Quy trình 3 Trạm độc lập (RED Test ➔ GREEN Code ➔ Independent Review).

---

## 1. MỤC TIÊU VÀ BỐI CẢNH

Sau quá trình kiểm toán toàn diện, hệ thống ghi nhận 4 điểm khuyết thiếu về công thái học và độ tương phản trợ năng trên di động:
1. Nút "Mua BĐS" trong `TitleDeedModal` có màu `bg-emerald-500` chữ trắng (#FFFFFF) đạt tương phản **2,54:1**, vi phạm chuẩn WCAG 2.1 Level AA (yêu cầu >= 4,5:1 cho text thông thường, >= 3,0:1 cho text lớn).
2. `HudContainer` thiếu phần bù mép an toàn `safe-area-inset-bottom`, khiến thanh `ActionDock` trên các thiết bị tràn viền (iPhone / Android) dễ bị chạm nhầm vào thanh Home indicator của hệ điều hành.
3. Cụm nút TopBar (Thời gian, Âm thanh, Nhật ký, Thoát bàn) trên thiết bị di động (`< sm`) đang dùng `min-h-[38px] min-w-[38px]`, nhỏ hơn chuẩn tối thiểu 44x44px của Apple HIG và WCAG 2.5.5.
4. Các nút tương tác trong sảnh chờ (`player_slot_card.tsx`: "+ Thêm Bot AI", "Xóa Bot `✕`", "Đổi tính cách Bot") và trong `trade_modal.tsx` (+100k, +500k) đang dùng kích thước 28x28px hoặc 38px, nhỏ hơn 44px.

---

## 2. PRE-FLIGHT BLAST RADIUS AUDIT (ĐÁNH GIÁ TÁC ĐỘNG)

```
[Thay đổi CSS / Tailwind Classes]
       │
       ├── TitleDeedModal (bg-emerald-700 ➔ Tương phản 5,52:1 AA)
       ├── HudContainer (pb-[calc(0.5rem+env(safe-area-inset-bottom))])
       ├── TopBar (min-h-[44px] min-w-[44px] toàn diện)
       ├── PlayerSlotCard (min-h-[44px] min-w-[44px] cho Bot controls)
       └── TradeModal (min-h-[44px] min-w-[44px] cho nút tăng giá)
```

- **Mức độ rủi ro:** Isolated (Cục bộ).
- **Direct Touch:**
  - `src/client/ui/modals/title_deed_modal.tsx`
  - `src/client/ui/hud_container.tsx`
  - `src/client/ui/top_bar.tsx`
  - `src/client/ui/lobby/player_slot_card.tsx`
  - `src/client/ui/modals/trade_modal.tsx`
- **Downstream Consumers:** Không ảnh hưởng đến FSM Server, WebSocket payload hay 3D Three.js rendering.
- **Worst-Case Defense:** Nếu có nút bị tràn chữ trên màn hình quá hẹp (< 320px), CSS `truncate` và `inline-flex shrink-0` đảm bảo không vỡ layout.

---

## 3. QUY TRÌNH 3 TRẠM THỰC THI

### Trạm 1: RED Contract & Inversion Test (`tests/client/imp110_mobile_ergonomics_and_a11y_contrast.test.ts`)
- `qa-tester` tạo tối thiểu 15 atomic tests xác minh:
  1. Nút Mua BĐS có class `bg-emerald-700` và độ tương phản >= 4,5:1.
  2. Footer `HudContainer` chứa class `safe-area-inset-bottom`.
  3. Cả 4 nút trong `TopBar` có `min-h-[44px]` và `min-w-[44px]` không phụ thuộc breakpoint.
  4. Các nút "+ Thêm Bot AI", "Xóa Bot", "Đổi tính cách Bot" trong `PlayerSlotCard` có kích thước >= 44px.
  5. Các nút đặt giá nhanh trong `TradeModal` có `min-h-[44px]`.
  6. Chạy kiểm thử chứng minh RED (thất bại có chủ đích).

### Trạm 2: GREEN Implementation
- `implementer` cập nhật mã nguồn tối thiểu để chuyển tất cả test sang GREEN.
- Chạy `npm run lint:ui` kiểm soát 0 vi phạm trên 4 anti-patterns.
- Chạy `npm test` bảo toàn toàn bộ 216 test suites.

### Trạm 3: Thẩm Định Độc Lập
- Subagent `ui-craft-reviewer` và `code-reviewer` rà soát trực tiếp trên đĩa vật lý.
