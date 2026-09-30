# BÁO CÁO HOÀN THÀNH: IMP-229 — Khắc Phục Lỗi Xung Đột Modal & Tự Động Kết Thúc Của Phiếu Cơ Hội "Mua Lại Dự Án Tiềm Năng"

> **Mã Ticket**: IMP-229  
> **Tên Tính Năng**: Compulsory Buyout Sequential Handover & Clock Skew Resilience  
> **Phân Loại**: Tier 2 (Full Rigor)  
> **Trạng Thái**: ✅ HOÀN THÀNH 100% (4 Trạm Khép Kín Đã Thông Qua Toàn Bộ)  
> **Ngày Hoàn Tất**: 2026-09-30  

---

## 1. TỔNG QUAN HIỆN TRƯỜNG & VẤN ĐỀ ĐƯỢC GIẢI QUYẾT

### 1.1 Hiện Tượng Lỗi Cũ (User Feedback)
- Khi người chơi tung xúc xắc và đáp xuống ô Cơ Hội bốc trúng thẻ **"MUA LẠI DỰ ÁN TIỀM NĂNG"** (`CC_SWAP_PROJECT`):
  1. Màn hình vừa nhấp nháy Bảng 1 (*"Phiếu Cơ Hội"*) thì ngay lập tức bị Bảng 2 (*"Quyền Ưu Tiên Mua Lại Dự Án 130%"*) đè lên.
  2. Bảng 2 chỉ xuất hiện trong chớp mắt (~100ms) rồi tự động biến mất như máy tự chơi; người chơi hoàn toàn không kịp đọc nội dung thẻ hay bấm nút chọn mua/từ chối.

### 1.2 Nguyên Nhân Vật Lý Trong Mã Nguồn
1. **Modal Collision & Race Condition**:
   - `apply_delta.ts` nhận WebSocket delta chứa `delta.pendingBuyout` khi con cờ mới bắt đầu di chuyển. Do `activeModal` lúc đó là `null`, nó gọi ngay `state.openModal('compulsory_buyout', delta.pendingBuyout)`.
   - Khoảng 1.5 giây sau, khi cờ chạm đất tại ô đích, `offline_landing.ts` kích hoạt `openModal('event')`, đè ngược lại lên `compulsory_buyout`, gây ra xung đột nhấp nháy 2 modal liên tiếp.
2. **Clock Skew & Client Auto-Decline**:
   - `compulsory_buyout_modal.tsx` tính `remainingMs = expiresAt - Date.now()`. Khi đồng hồ máy tính client chạy trước server $\ge 15$s, `remainingMs \le 0` ngay từ frame đầu tiên.
   - Khi `remainingMs \le 0`, client tự ý gọi `onDecline()`, gửi `INTENT_DECLINE_COMPULSORY_BUYOUT` lên server và đóng modal trong 100ms. Điều này vi phạm nguyên tắc *Server-Authoritative*.
3. **Deadlock Khi Click Backdrop / Esc**:
   - Khi đóng `EventCardModal` bằng click ra ngoài backdrop, `handleBackdropClose` gọi thẳng `closeModal()`, bỏ qua chuyển tiếp, để lại `pendingBuyout` mồ côi trên server làm người chơi bị kẹt lượt không thể kết thúc lượt (`turn_loop.ts#L242`).

---

## 2. GIẢI PHÁP KIẾN TRÚC TOÀN PHẦN (FULL-PIPELINE IMPLEMENTATION)

1. **Sequential Modal Handover (Chuyển Tiếp Tuần Tự)**:
   - Trong `src/client/network/apply_delta.ts`, bổ sung guard chặn cướp modal: Khi có thẻ sự kiện (`isCardFlow`) hoặc quân cờ đang di chuyển (`isMoving`), `apply_delta` **tuyệt đối chỉ lưu** `state.setPendingBuyout(delta.pendingBuyout)` vào Zustand store SSOT mà không được tự tiện chiếm quyền `activeModal`.
   - Trong `src/client/ui/modals/modal_host.tsx`, cả nút xác nhận/đóng trên `EventCardModal` lẫn click backdrop (`handleBackdropClose`) đều kiểm tra `pendingBuyout` trong store. Nếu có phiên mua lại thuộc về người chơi local (`pb.buyerId === myPid`), hệ thống chuyển tiếp nguyên tử sang `openModal('compulsory_buyout', pb)`.
2. **Khử Hoàn Toàn Lệch Đồng Hồ (Clock Skew Immunity)**:
   - Trong `src/client/ui/modals/compulsory_buyout_modal.tsx`, khởi tạo an toàn: `safeInitialMs = Math.max(0, expiresAt - Date.now()) || 15_000`, tự động dự phòng 15 giây nếu đồng hồ máy client bị trễ giờ so với server.
   - Sử dụng bộ đếm tương đối giảm 100ms mỗi tick mà không phụ thuộc vào `Date.now()`.
3. **Triệt Tiêu Client Auto-Decline (Server Authoritative)**:
   - Khi bộ đếm về 0ms (`remainingMs \le 0`), client **chỉ dừng interval**, tuyệt đối không tự gọi `onDecline()`.
   - Nút Mua Lại bị khóa cứng `disabled={!canAfford || remainingMs <= 0}` và chuyển nhãn hiển thị sang `"Hết Thời Gian Mua"` để triệt tiêu 100% bug Zombie button.
   - Server Watchdog (`turn_watchdog.ts` / `room_manager.ts`) quản lý timeout thực tế và gửi `delta.pendingBuyout = null` để đóng modal tự nhiên.

---

## 3. BẢNG TỔNG HỢP KIỂM ĐỊNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Định | Đơn Vị Thực Hiện | Số Liệu & Bằng Chứng | Kết Quả |
| :--- | :--- | :--- | :---: |
| **Trạm 1: RED Contract Test** | `qa-tester` | 16 atomic tests Detroit style tại `tests/client/imp229_compulsory_buyout_collision_and_clock_skew.test.ts`. Chứng minh **7 Business RED** hợp lệ. | ✅ PASS |
| **Trạm 2: GREEN Implementation** | `implementer` | Sửa đúng 3 file trong `src/**`, pass 16/16 tests của suite, pass 48/48 all related tests. Build production Vite + SSR thành công. | ✅ PASS |
| **Trạm 2.5: Fast Pre-Filter Sweep** | `scout` (flash) | Quét 5 nhóm lỗi: 0 dirty casts, 0 timer leaks, LOC budgets an toàn (`apply_delta`: 349/400, `modal_host`: 494/500, `compulsory_buyout_modal`: 200/500). | ✅ PASS |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer` | Đối soát tam giác 9/9 tiêu chí kỹ thuật khớp 100% với SSOT plan, zero scope drift, physical snapshot verified. | ✅ APPROVED |
| **Trạm 3.2: Deep Architecture Gate** | `code-reviewer` | Audit deep code structure, zero slop, memory leak clearance, zombie UI defense, type safety tuyệt đối. | ✅ APPROVED |
| **Trạm 3.2: 2D UI Craft Gate** | `ui-craft-reviewer` | Điểm số **9.8 / 10**. Đạt chuẩn tactile 4px gờ nổi, touch target $\ge 48$px, viewport mobile 360px mượt mà. | ✅ APPROVED |
| **Trạm 4: Adversarial Boundary Sentinel** | `chaos-sentinel` | 3 Physical Probes (Closed-Loop Parity, Ephemeral Boundary, Mutation Sensitivity). 5/5 Mutants bị tiêu diệt, 0 surviving mutants. | ✅ PASSED |

---

## 4. TỆP BẰNG CHỨNG THỰC TẾ TRÊN ĐĨA CỨNG (PHYSICAL EVIDENCE)
- Test Contract Suite: [`tests/client/imp229_compulsory_buyout_collision_and_clock_skew.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp229_compulsory_buyout_collision_and_clock_skew.test.ts) (16 tests)
- Chaos Sentinel Probe Suite: [`tests/probes/imp229_chaos_sentinel_probes.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/probes/imp229_chaos_sentinel_probes.test.ts) (14 tests)
- Plan Audit: [`.agents/audit/PLAN_AUDIT_IMP229.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP229.md)
- Execution Snapshot: [`.agents/evidence/imp229_execution.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp229_execution.json)
- Chaos Evidence: [`.agents/evidence/chaos_sentinel_imp229.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_imp229.json)
- Bất Biến Miền: Gotcha #25 trong [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md)
