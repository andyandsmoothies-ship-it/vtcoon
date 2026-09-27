# [REPORT] IMP-207: Single Contextual Timer & Triệt Tiêu Rung Giật Số Đếm

## 1. THÔNG TIN TỔNG QUAN
- **Mã Ticket**: IMP-207
- **Tiêu Đề**: Đồng Hồ Đếm Ngược Ngữ Cảnh Duy Nhất (Single Contextual Timer) & Triệt Tiêu Rung Giật Số Đếm Lượt (Monotonic Countdown Guard).
- **Phân Hạng**: **Two-Way Door** / Full Rigor (Client UI, TopBar, Delta Broadcaster sync, Client Timer Hooks).
- **Trạng Thái**: ✅ COMPLETE (HOÀN TẤT TRỌN VẸN QUY TRÌNH 3 TRẠM).
- **Cổng Độc Lập**:
  - `plan-griller`: **AUDITED** (Khắc phục 5 điểm mù P1-P5: Monotonic Guard đặt đúng trong syncTurnAndTimer, Zero Dirty Cast state.lastDiceSeq, subtractive teardown trong use_app_session, đồng bộ aria-label "Ánh sáng").
  - `spec-reviewer`: **SPEC_PASS (APPROVED)** (100% spec reconciliation, 16/16 atomic contract tests).
  - `ui-craft-reviewer`: **APPROVE (disposition: ship)** (TopBar subphase badge nhỏ gọn, không tràn mobile 360px).
  - `scout`: **SWEEP_PASS** (Zero Defect trên cả 5 archetype lỗi phổ biến).

---

## 2. NGUYÊN NHÂN CỐT LÕI & GIẢI PHÁP VẬT LÝ

### 2.1. Hiện trạng trước cải tiến
1. **Xung đột 2 đồng hồ đếm ngược cùng lúc**: Khi diễn ra Đấu Giá, Thương Lượng Bot, hoặc Mua Đứt Cưỡng Chế, cả TopBar và Modal/Strip đều hiển thị đồng hồ đếm ngược. Nếu 2 bộ đếm lệch 1 giây do làm tròn số, người chơi bị phân tâm và không rõ nguồn thời gian khẩn cấp chính thức.
2. **Rung giật số đếm lượt (41s <-> 42s)**: Do server gửi delta định kỳ và hàm làm tròn `Math.ceil(remainingMs / 1000)` bị lệch xung nhịp với `setInterval` 1s ở client, số đếm thời gian trên TopBar thỉnh thoảng nhảy giật lùi (từ 41s giật lên 42s rồi lại nhảy xuống 41s).
3. **Mâu thuẫn ngữ nghĩa nút chuyển ngày/đêm**: Nút chuyển chế độ ánh sáng mang nhãn "Thời gian: Ngày/Đêm" gây nhầm lẫn với đồng hồ thời gian đếm ngược của lượt chơi.

### 2.2. Giải pháp hoàn chỉnh
1. **Single Contextual Timer Invariant (TopBar)**:
   - `src/client/ui/top_bar.tsx`: Khi phòng chơi bước vào các subphase khẩn cấp (`isSubphaseActive: auction || pendingBotTrade || pendingCompulsoryBuyout`), TopBar ẩn hoàn toàn `role="timer"` và thay thế bằng indicator tĩnh ngắn gọn:
     - Mobile: `🏷️ Đấu giá`, `🤝 Đàm phán`, `⚡ Mua đứt`.
     - Desktop: `🏷️ Đang Đấu Giá BĐS`, `🤝 Đang Thương Lượng Bot`, `⚡ Thu Hồi Cưỡng Chế`.
     - Nhường quyền đếm ngược duy nhất (`Single Source of Urgency`) cho widget tại chỗ trong Modal hoặc Strip.
   - Khi subphase kết thúc, TopBar tự động khôi phục `role="timer"` đếm ngược thời gian của lượt chính.
2. **Monotonic Countdown Guard**:
   - `src/client/network/apply_delta.ts`: Đặt Monotonic Guard trực tiếp trong `syncTurnAndTimer`:
     - Khi `delta.timeRemaining !== undefined`, chỉ chấp nhận cập nhật nếu thời gian mới nhỏ hơn thời gian hiện tại (`timeRemaining < curTime`), HOẶC có sự kiện reset hợp lệ (đổi lượt `turnSeq`, đổi pha `turnPhase`, gieo xúc xắc mới `lastDiceSeq`).
     - Triệt tiêu 100% hiện tượng số đếm nhảy ngược 1s (41s -> 42s).
3. **Subtractive Refactoring & A11y Co-Evolution**:
   - `src/client/network/use_app_session.ts`: Xóa bỏ hoàn toàn khối `setInterval` timer thứ cấp chạy song song gây xung đột thời gian, quy về một nguồn thẩm quyền duy nhất trong store.
   - `src/client/ui/top_bar.tsx`: Đổi nhãn nút chuyển ánh sáng từ "Thời gian:" sang "Ánh sáng:" trên cả `title` và `aria-label`.

---

## 3. KIỂM THỬ & CHỈ SỐ HOÀN TẤT
- **Contract Test Suite**: `tests/contracts/imp207_single_contextual_timer.test.ts` — **16/16 atomic tests PASS 100%**.
- **Linter & Typecheck**:
  - `npm run lint:ui`: 0 vi phạm trên 195 tệp.
  - `npx tsc --noEmit`: 0 lỗi type.
  - `npm run check:loc`: Tất cả tệp modified đều tuân thủ ngân sách LOC.
- **Evidence Snapshot**: `.agents/evidence/imp207_snapshot.json` (`executed: true`).
- **Sổ cái Epic**: Đã ghi nhận tại `docs/epics/client_ui/_epic_ledger.md`.
