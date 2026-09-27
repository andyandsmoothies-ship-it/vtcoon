# KẾ HOẠCH TRIỂN KHAI (IMPLEMENTATION PLAN) — IMP-208
## Cải Thiện Công Thái Học Chức Năng Ra Tù, Khử Xung Đột Đè Chữ Xúc Xắc & Tràn Nút ActionDock Mobile

> **Mã Ticket**: IMP-208  
> **Phân loại**: Tier 2 (Full Rigor - UI Ergonomics, Layout Budget & Collision Defenses)  
> **Trạng thái**: 🟢 **ĐÃ HOÀN TẤT & ĐƯỢC PHÊ DUYỆT BỞI SPEC-REVIEWER & UI-CRAFT-REVIEWER**  
> **Mục tiêu**: Xóa bỏ hoàn toàn 3 lỗi UI/UX vật lý tại Trạm Kiểm Toán & ActionDock trên thiết bị di động:
> 1. Triệt tiêu va chạm đè chữ 100% giữa `DiceScoreBadge` (`🎲 5 + 1 = 6`) và `ActionDockNotice` (`⚖️ Ô 10...`).
> 2. Khắc phục lỗi tràn ngang (Horizontal Overflow) của ActionDock trên mobile khiến nút `[ ⏭️ Kết Thúc Lượt ]` bị văng khỏi màn hình khi đang ở trong tù.
> 3. Đồng bộ hóa trạng thái thông báo `ActionDockNotice` khi đã gieo xúc xắc thất bại (không ra đôi) và kích hoạt hiệu ứng dẫn hướng nút `Kết Thúc Lượt`.
> 4. Tinh chỉnh nhãn nút Sổ Đỏ linh hoạt theo ngữ cảnh: `Tạm Đóng` (khi đủ tiền) vs `Đóng Xoay Vốn` (khi thiếu tiền).

---

### I. CÁC TỆP MÃ NGUỒN LIÊN QUAN

1. `src/client/ui/action_dock.tsx`:
   - Chuyển `actionDockNotice` sang normal flex flow, wrapper cha `className="relative flex flex-col items-center gap-1.5"`.
   - Nút Bảo Lãnh loại bỏ badge `${turns} lượt` bên trong, hiển thị `Bảo Lãnh (500)`.
   - Kích hoạt `ring-4 ring-emerald-400/90 animate-pulse` cho nút Kết Thúc Lượt khi `inAudit && hasRolledThisTurn && !canRollAgain`.
   - Subtractive refactoring: 378 LOC (<= 385 LOC).
2. `src/client/ui/ui_helpers.ts`:
   - Phân nhánh `hasRolledThisTurn` cho `inAudit`, hiển thị `Không ra đôi: Nộp bảo lãnh hoặc Xong lượt`.
   - Thêm điều kiện `params.isMyTurn` để tránh Actor Inversion đè chip bot pacing.
3. `src/client/ui/modals/title_deed_action_footer.tsx`:
   - Nhãn nút đóng: `{isTradeFrozen ? 'Đóng' : canBuy ? 'Tạm Đóng' : 'Đóng Xoay Vốn'}`.
4. `tests/contracts/imp208_audit_bailout_and_dock_ergonomics.test.ts`:
   - 16 atomic contract tests PASS 100%.
