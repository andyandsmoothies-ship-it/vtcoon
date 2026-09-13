# [IMP-47] Báo Cáo Nghiệm Thu Phòng Ngừa Đóng Nhầm Hộp Thoại Quyết Định & Cơ Chế Khôi Phục Mua Đất Đa Tầng

## 1. TỔNG QUAN KẾT QUẢ THỰC HIỆN

| Tiêu chí | Đặc tả kỹ thuật | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :---: |
| **Khóa Backdrop Quyết Định** | `ModalBackdrop` có `dismissible=false` cho các modal sinh tử | Click backdrop ngoài màn hình không đóng modal mua đất, đấu giá, vỡ nợ | ✔️ ĐẠT |
| **Khôi phục qua ActionDock** | `resolveManagePropertyTarget` ưu tiên ô đang đứng chưa có chủ | Hiển thị nút `🏷️ Mua Đất (#{currentPos})` và mở đúng ô đang đứng với `canBuy: true` | ✔️ ĐẠT |
| **Tương tác trực tiếp Ô 3D** | Click ô cờ 3D trên sa bàn mở lại Title Deed modal | Người chơi có thể click lại vào ô đất để mua nếu lỡ thoát modal | ✔️ ĐẠT |
| **Hợp đồng kiểm thử** | `tests/contracts/property_purchase_recovery_contract.test.ts` | 2 / 2 contract tests PASS | ✔️ ĐẠT |
| **Hệ thống kiểm thử dự án** | Toàn bộ các bài kiểm thử hồi quy | 148 / 148 test suites PASS (2.041 tests) | ✔️ ĐẠT |

---

## 2. BẰNG CHỨNG KIỂM THỬ TỰ ĐỘNG

Bộ kiểm thử hợp đồng `tests/contracts/property_purchase_recovery_contract.test.ts`:
1. `[Contract 1: Non-dismissible Backdrop]`: `ModalBackdrop` với `dismissible=false` không kích hoạt `onClose` khi click ngoài khung.
2. `[Contract 2: Priority Target Resolution]`: Khi người chơi đứng tại ô chưa có chủ trong lượt mình, `resolveManagePropertyTarget` trả về đúng `cellIndex` hiện tại và `canBuy: true`.

---

## 3. BẤT BIẾN ĐƯỢC GHI NHẬN

- Gotcha #68 trong `docs/domain/gotchas.md`: `[UI/UX] Bất Biến Phòng Ngừa Đóng Nhầm Hộp Thoại Quyết Định & Cơ Chế Khôi Phục Mua Đất Đa Tầng (IMP-47)`.
