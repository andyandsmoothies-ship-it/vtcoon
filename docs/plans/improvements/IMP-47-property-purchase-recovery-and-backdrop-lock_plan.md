# [IMP-47] Kế Hoạch Phòng Ngừa Đóng Nhầm Hộp Thoại Quyết Định & Cơ Chế Khôi Phục Mua Đất Đa Tầng

## 1. Bối Cảnh & Vấn Đề

1. **Đóng nhầm hộp thoại mua đất do click ra ngoài**: Khi người chơi vừa dừng ở ô đất trống, Title Deed modal mở ra nhưng click ra ngoài backdrop khiến hộp thoại biến mất ngay lập tức (`activeModal = null`).
2. **Mất quyền mua đất vĩnh viễn trong lượt**: FSM vẫn ở `ActionPhase`, nhưng ô 3D trước đây không có sự kiện click để mở lại, còn nút "Quản lý Bất động sản" trong `ActionDock` lại ưu tiên ô đất đã sở hữu đầu tiên thay vì ô đang đứng. Người chơi không còn cách nào mua đất và buộc phải bỏ lượt hoặc chờ timeout đẩy sang sàn đấu giá.

---

## 2. Giải Pháp Kỹ Thuật

1. **Khóa Backdrop cho các quyết định quan trọng (Critical Decision Modal Lock)**:
   - Thêm cờ `dismissible?: boolean = true` vào `ModalBackdrop`.
   - Khi modal là quyết định sinh tử (`isCriticalDecision = (activeModal === 'deed' && modalPayload?.canBuy) || activeModal === 'auction' || activeModal === 'insolvency'`), đặt `dismissible = false`.
   - Click bên ngoài backdrop sẽ không tắt modal.
2. **Tương tác trực tiếp trên ô cờ 3D (3D Tile Inspection)**:
   - Gắn sự kiện `onClick={() => handleTileClick(cell.index)}` cho các ô trên sa bàn.
   - Click vào ô đất đang đứng trong lượt hợp lệ sẽ kích hoạt mở lại modal mua đất với `canBuy: true`.
3. **Nút bấm khôi phục mua đất nổi bật trên ActionDock**:
   - `ActionDock` hiển thị nút trực tiếp `🏷️ Mua Đất (#{currentPos})` khi `isStandingOnBuyable = isMyTurn && hasRolledThisTurn && isPropertyCell && !isOwnedByAnyone`.
   - `resolveManagePropertyTarget` ưu tiên mở ô đất đang đứng với `canBuy: true`.

---

## 3. Các Tệp Mã Nguồn Can Thiệp

- `src/client/ui/modals/modal_backdrop.tsx`: Bổ sung `dismissible?: boolean`.
- `src/client/ui/modals/modal_host.tsx`: Thiết lập `isCriticalDecision` và gán `dismissible={!isCriticalDecision}`.
- `src/client/ui/ui_helpers.ts`: Cập nhật `resolveManagePropertyTarget(ownedProperties, currentPosition, isStandingOnBuyable)`.
- `src/client/ui/action_dock.tsx`: Thêm nút bấm Mua Đất trực tiếp khi đang đứng ở ô mua được.
- `src/client/3d/board_layout.tsx`: Kích hoạt click handler trên ô cờ sa bàn.

---

## 4. Kế Hoạch Kiểm Thử

- Viết bộ hợp đồng `tests/contracts/property_purchase_recovery_contract.test.ts` (2 contract tests).
- Xác minh toàn bộ 148 test suites PASS 100%.
