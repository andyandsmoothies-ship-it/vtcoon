# KẾ HOẠCH CẢI TIẾN: IMP-78 — CHUẨN HÓA XÚC XẮC 1D6 & TRẢI NGHIỆM KHỚP LỆNH SÀN CHỨNG KHOÁN HOSE

> **Mã cải tiến**: IMP-78  
> **Lĩnh vực**: `[FSM]`, `[UI]`, `[NET]`, `[CRAFT]`  
> **Trạng thái**: 🟡 Đang thực hiện  
> **Ngày khởi tạo**: 15/09/2026  

---

## 1. BỐI CẢNH & VẤN ĐỀ THỰC TẾ
Khi người chơi dừng chân tại Ô 38 (Sàn Giao Dịch Chứng Khoán HOSE) và chọn mức cược (500, 1.000, 2.000, 3.000 Tr.):
1. **Modal đóng tức thì sau 5ms**: `apply_delta.ts` lập tức đóng modal khi máy chủ chuyển sang pha `PropertyManagement`, người chơi hoàn toàn không thấy kết quả khớp lệnh.
2. **Server chưa đồng bộ kết quả xúc xắc**: Server tính `face = Math.floor(rng() * 6) + 1` và cập nhật số dư, nhưng không lưu hay phát sóng `lastHoseResult` trong `DeltaPayload`. Client tại `modal_host.tsx` tự sinh kết quả ngẫu nhiên giả bằng `Math.random()`.
3. **Hoạt ảnh xúc xắc mờ nhạt**: `HoseModal` chỉ nhấp nháy một icon emoji nhỏ trong 300ms (6 nhịp x 50ms) rồi biến mất.
4. **Nhật ký ván đấu thiếu ngữ cảnh**: `activity_financial_tracker.ts` coi khoản tiền thu về từ HOSE là "tiền thưởng" chung chung.

---

## 2. RÀNG BUỘC KIẾN TRÚC & GIẢI PHÁP BẤT BIẾN
1. **Server-Authoritative HOSE Result (SSOT)**:
   - `Room` và `DeltaPayload` bổ sung cấu trúc `lastHoseResult: HoseResultInfo`.
   - `handleHoseInvest` xuất tường minh `{ playerId, playerName, stake, roll, payout, multiplier, profit, timestamp, diceSeq }`.
2. **Graceful Modal Review Invariant**:
   - `apply_delta.ts` kiểm tra cờ `isReviewingResult`: Tuyệt đối không cưỡng chế đóng modal khi người chơi đang xem kết quả khớp lệnh.
   - Modal cung cấp nút bấm xúc giác `[Xác Nhận & Tiếp Tục ➔]` hoặc tự động đóng an toàn sau 4 giây để bảo toàn nhịp trận đấu.
3. **Tactile 1D6 Rolling Animation**:
   - Hoạt ảnh xúc xắc 1D6 to rõ (kích thước lớn, chuyển động nảy xúc giác) quay trong 1.2s - 1.5s, giảm tốc mượt mà và dừng chuẩn xác ở mặt kết quả trả về từ Server.
   - Đánh dấu nổi bật ô tỷ lệ tương ứng trên bảng HOSE (Mặt 1..6) kèm thẻ tổng kết Lãi/Lỗ trực quan.
4. **Descriptive Financial Activity Logging**:
   - Nhật ký ván đấu ghi nhận chi tiết: `📈 [HOSE] P1 đầu tư 500 Tr. ➔ Khớp lệnh Mặt 4 (+20%): Thu về 600 Tr. (Lãi +100 Tr.)`.

---

## 3. LỘ TRÌNH 3 TRẠM (MANDATORY 3-STATION PIPELINE)
- **Trạm 1 (RED Contract Test)**: Tạo `tests/contracts/imp78_hose_dice_roll_ux.test.ts` kiểm chứng toàn bộ các giao ước mới. Chạy Vitest chứng minh RED.
- **Trạm 2 (GREEN Implementation)**: Sửa đổi tối thiểu mã nguồn tại `src/domain/room.ts`, `src/server/session_manager.ts`, `src/server/hose_actions.ts`, `src/client/store/game_store_types.ts`, `src/client/network/apply_delta.ts`, `src/client/network/activity_tracker.ts`, `src/client/network/activity_financial_tracker.ts`, `src/client/ui/modals/hose_modal.tsx`, `src/client/ui/modals/modal_host.tsx`.
- **Trạm 3 (Independent Verification & Physical Disk Audit)**: `npm run gate:quick`, `npm test`, `npm run build`, ghi nhận báo cáo `IMP-78_report.md` và Gotcha #105.
