# BÁO CÁO NGHIỆM THU (VERIFICATION REPORT) — IMP-208
## Cải Thiện Công Thái Học Chức Năng Ra Tù, Khử Xung Đột Đè Chữ Xúc Xắc & Tràn Nút ActionDock Mobile

> **Mã Ticket**: IMP-208  
> **Trạng thái**: 🟢 **HOÀN TẤT & ĐẠT CHUẨN XUẤT XƯỞNG (SHIP)**  
> **Ngày hoàn thành**: 2026-09-27  
> **Phê duyệt**: `spec-reviewer` (SPEC_PASS), `ui-craft-reviewer` (disposition: ship, 0 lỗi P1-P8).

---

### I. CÁC THAY ĐỔI ĐÃ THỰC THI (PHYSICAL CHANGES)

1. **Khử Đè Chữ Xúc Xắc (`src/client/ui/action_dock.tsx`)**:
   - Chuyển `actionDockNotice` từ `absolute -top-10` sang luồng Flex tự nhiên bên trong wrapper `relative flex flex-col items-center gap-1.5`.
   - `DiceScoreBadge` (`🎲 5 + 1 = 6`) và `actionDockNotice` (`⚖️ Ô 10...`) xếp chồng hoàn hảo, khoảng cách 6px (`gap-1.5`), triệt tiêu 100% va chạm đè chữ.

2. **Thu Gọn Nút Bảo Lãnh & Trợ Lực Nút Kết Thúc Lượt (`src/client/ui/action_dock.tsx`)**:
   - Xóa bỏ badge `${turns} lượt` bên trong nút Bảo Lãnh, nhãn hiển thị gọn `Bảo Lãnh (500)`.
   - Khi đổ xúc xắc không ra đôi trong tù (`inAudit && hasRolledThisTurn && !canRollAgain`), nút Kết Thúc Lượt kích hoạt hiệu ứng thu hút chú ý: `ring-4 ring-emerald-400/90 shadow-[0_0_18px_rgba(16,185,129,0.6)] animate-pulse`, giải tỏa bẫy kẹt cảm tính.
   - Áp dụng Subtractive Refactoring: đưa `action_dock.tsx` từ 393 xuống **378 LOC** (tiết kiệm 15 dòng, an toàn dưới trần 400 LOC).

3. **Đồng Bộ Trạng Thái Thông Báo & Chống Actor Inversion (`src/client/ui/ui_helpers.ts`)**:
   - Khi ở tù đã đổ xúc xắc (`hasRolledThisTurn = true`): thông báo đổi thành *"Không ra đôi: Nộp bảo lãnh hoặc Xong lượt"*.
   - Ràng buộc `if (params.inAudit && params.isMyTurn)`: khi đến lượt bot, nhường quyền ưu tiên hiển thị cho chip bot pacing, bảo vệ ranh giới người chơi.

4. **Ngữ Cảnh Hóa Nút Đóng Sổ Đỏ (`src/client/ui/modals/title_deed_action_footer.tsx`)**:
   - Khi `canBuy = true` (đủ tiền): hiển thị nhãn thân thiện **`Tạm Đóng`**.
   - Khi `canBuy = false` (thiếu tiền): giữ nhãn định hướng **`Đóng Xoay Vốn`**.
   - Khi `isTradeFrozen = true`: hiển thị **`Đóng`**.

---

### II. BẰNG CHỨNG KIỂM THỬ (TEST & LINT EVIDENCE)

- **Living Contract Tests**: 16/16 tests trong `tests/contracts/imp208_audit_bailout_and_dock_ergonomics.test.ts` PASS 100%.
- **Regression Suites**: 100% PASS trên `imp204`, `mobile_ui_ux_tri_package`, `actionable_guidance_system`, `imp198`, `imp202`, `imp207`, `imp135`.
- **TypeScript**: `npx tsc --noEmit` đạt 0 lỗi.
- **UI Linter**: `npm run lint:ui` đạt 0 Anti-patterns trên 195 files.
- **LOC Limits**:
  - `src/client/ui/action_dock.tsx`: 378 / 500 LOC (An toàn, < 400).
  - `src/client/ui/ui_helpers.ts`: 444 / 500 LOC (An toàn).
  - `src/client/ui/modals/title_deed_action_footer.tsx`: 221 / 500 LOC (An toàn).
