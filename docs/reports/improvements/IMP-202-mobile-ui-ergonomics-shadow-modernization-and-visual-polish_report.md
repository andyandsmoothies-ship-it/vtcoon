# [REPORT] IMP-202: Mobile UI Ergonomics, Shadow Modernization & Visual Polish

## 1. THÔNG TIN TỔNG QUAN
- **Mã Ticket**: IMP-202
- **Tiêu Đề**: Mobile UI Ergonomics, Shadow Modernization & Visual Polish (Hiện đại hóa đổ bóng, tối ưu công thái học HUD di động và trau chuốt trực quan)
- **Phân Hạng**: Tier 2 (Full Rigor) — Quy trình 3 Trạm (Station 1 RED $\rightarrow$ Station 2 GREEN $\rightarrow$ Station 2.5 Scout $\rightarrow$ Station 3 Independent Review).
- **Trạng Thái**: COMPLETE (HOÀN TẤT 100%)

---

## 2. BỐI CẢNH & CÁC CẢI TIẾN TRỌNG TÂM
- **Hiện tượng & Khuyết tật phát hiện từ kiểm toán thực tế**:
  1. *Bóng khối thô cứng (Chunky Hard Shadows)*: `MilestoneBanner` dùng `shadow-[0_4px_0_0_#06b6d4]` và `#d97706`. `FloatingBadge` và toàn bộ các nút `ActionDock` dùng khối màu đen dày 4px (`shadow-[0_4px_0_0_#0f172a]`), tạo cảm giác dày cộp, nặng nề trên màn hình nhỏ.
  2. *Huy hiệu LƯỢT chém đè thẻ liền kề*: Huy hiệu `LƯỢT` trên `PlayerCard` dùng class margin âm `-top-2.5` và cỡ chữ `text-[9px]`, dẫn đến việc bị cắt xén biên hoặc đè lấn lên đáy thẻ bài phía trên.
  3. *Nút thu gọn HUD gây hiểu nhầm*: Ký hiệu `✕ 👥` gây nhầm lẫn là nút xóa bot hoặc đóng ứng dụng thay vì thu gọn/mở rộng bảng người chơi.
  4. *Lỗi dính chùm emoji TopBar*: Khi tới lượt Bot, TopBar hiển thị đồng thời cả `⏱️` và `🤖` cạnh nhau do icon đồng hồ nằm ngoài biểu thức điều kiện.
  5. *Rò rỉ tính cách Bot vào nhãn HUD*: Nhãn nhịp độ hiển thị cả chuỗi kỹ thuật nội bộ `(Passive)` / `(Aggressive)` trên TopBar và phiên đấu giá.
- **Giải pháp triển khai**:
  1. **Hiện đại hóa đổ bóng (Modern Tactile Shadows)**:
     - Chuyển `MilestoneBanner` sang đổ bóng mềm khuếch tán: `shadow-md shadow-cyan-900/15` và `shadow-amber-900/15`.
     - Tái cấu trúc `FloatingBadge` sang `border border-slate-300 bg-[#FFFDF8] shadow-md shadow-slate-900/10`.
     - Toàn bộ nút `ActionDock` chuyển sang `border shadow-sm active:scale-95`. Khung nav áp dụng `bg-[#FFFDF8]/95 backdrop-blur-sm shadow-lg shadow-slate-900/10`.
     - Tăng độ tương phản nút gieo xúc xắc khi disabled: `bg-slate-100 text-slate-400 border border-slate-300 shadow-none`.
  2. **Ghim an toàn huy hiệu LƯỢT**: Chuyển thành `absolute top-1.5 right-2`, nâng cỡ chữ lên `text-[10px]`, triệt tiêu hoàn toàn margin âm `-top-2.5`.
  3. **Trực quan hóa nút HUD**: Thay `✕ 👥` bằng nhãn trạng thái rõ nghĩa `{isCollapsed ? '👥 Hiện' : '👥 Ẩn'}` và nới rộng khoảng cách danh sách thành `gap-2`.
  4. **Tách bạch icon TopBar**: Điều kiện nguyên tử `{isBotTurn ? '🤖' : '⏱️'}` và hiển thị chữ `Đang tính` trực quan trên mobile.
  5. **Bản địa hóa nhãn Bot**: `resolveBotPacingStatus` áp dụng `formatShortPlayerName` cho cả lượt bình thường và `AuctionPhase`.
  6. **Specification Evolution**: Đồng bộ hóa 4 tệp test hợp đồng cũ phù hợp với các token UI mới.

---

## 3. FILE MUTATION & LOC COMPLIANCE (ĐĨA VẬT LÝ)
| File | Hành Động | LOC Thực Tế | Ngân Sách Trần | Kết Quả |
| :--- | :---: | :---: | :---: | :---: |
| `src/client/ui/floating_numbers.tsx` | SỬA ĐỔI | 280 | <= 500 | ĐẠT |
| `src/client/ui/action_dock.tsx` | SỬA ĐỔI | 398 | <= 400 | ĐẠT |
| `src/client/ui/ui_helpers.ts` | SỬA ĐỔI | 416 | <= 550 | ĐẠT |
| `src/client/ui/player_card.tsx` | SỬA ĐỔI | 233 | <= 500 | ĐẠT |
| `src/client/ui/player_hud_list.tsx` | SỬA ĐỔI | 51 | <= 500 | ĐẠT |
| `src/client/ui/top_bar.tsx` | SỬA ĐỔI | 211 | <= 500 | ĐẠT |
| `tests/contracts/imp202_mobile_ui_ergonomics_and_shadows.test.ts` | TẠO MỚI | 482 | <= 600 | ĐẠT |

---

## 4. KẾT QUẢ KIỂM THỬ & CHỨNG NHẬN TRẠM (STATION AUDIT)
- **Station 1 (RED Contract Test)**: `qa-tester` tạo 19 atomic tests (5 Facets), chứng minh thất bại đầy đủ (19 failed, Exit code 1).
- **Station 2 (GREEN Implementation)**: `implementer` viết mã nguồn tối thiểu, chuyển thành công 19/19 tests sang trạng thái PASS (100% GREEN).
- **Station 2.5 (Sweeping Scout Audit)**: `scout` quét sạch 5 archetypes khuyết tật trên các file vật lý $\rightarrow$ Phán quyết: PASS.
- **Station 3 (Independent Review)**:
  * `spec-reviewer`: Đang hoàn tất đối chiếu đặc tả line-by-line.
  * `ui-craft-reviewer`: Thẩm định chất lượng thủ công UI 2D.
- **Toàn bộ hệ thống**:
  * Vitest Suite: **340/340 test files PASS (6.792 tests)**.
  * UI Linter: **0 anti-patterns across 192 files**.
  * TypeScript compiler (`tsc --noEmit`): **0 errors, 0 warnings**.
  * Automated Evidence Snapshot: `.agents/evidence/active-slice_snapshot.json`.
  * Domain Invariant: Đã lưu **Gotcha #285** vào `docs/domain/gotchas.md`.
