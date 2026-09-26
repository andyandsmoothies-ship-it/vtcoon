# [IMP-199] Ergonomic 2-Row Tactile Micro-Card for Bot Trade Offer Strip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuyển đổi dải thông báo giao dịch Bot (`InlineBotTradeStrip`) từ 1 hàng ngang chật chội (khiến nút Hủy/Xem chi tiết teo nhỏ chỉ 20-22px và chữ bị cắt cụt trên Mobile 360px) thành **Thẻ Micro-Card 2 Tầng Xúc Giác** hiển thị trọn vẹn thông tin BĐS/giá cả không bao giờ bị cắt cụt, đồng thời sở hữu cặp nút bấm lớn chuẩn công thái học `min-h-[38px] sm:min-h-[40px]`.

---

## 4 Phản Biện Đã Giải Quyết Triệt Để:

1. **[P1] Chuẩn hóa công thức `canAfford` & phân nhóm tường minh**:
   ```ts
   // Invariant [IMP-199]: Phá sản hoặc âm tiền không thể chấp nhận giao dịch bất lợi/ngang giá (Server Guard)
   const isSolventForTrade = !isNegativeCash ? (myBalance >= 0 || price > 0) : myBalance >= absCash;
   const canAfford = isSolventForTrade && !myPlayer?.bankrupt;
   ```
2. **[P1] Chỉ định chính xác từng dòng sửa trong `modal_host.tsx` (L449–L451)**:
   Thêm `useGameStore.getState().setPendingTradeOffer(null);` vào cả 3 callbacks (`onAccept`, `onReject`, `onClose`) để dọn sạch state triệt để khi modal xử lý xong.
3. **[P2] Cập nhật đúng baseline vật lý**:
   - `bot_trade_offer_strip.tsx`: `[Current: 208 + Delta: +25 = Expected: 233 LOC]` (< 300 LOC).
   - `modal_host.tsx`: `[Current: 475 + Delta: 0 = Expected: 475 LOC]` (<= 480 LOC).
   - Xác nhận trường `activeModal` đã tồn tại và hoạt động ổn định trong `useGameStore`.
4. **[P3] Xóa bỏ static checklist test trong Facet 5**:
   Loại bỏ `fs`/`lintContent` khỏi bộ unit test theo quy định GEMINI.md. Thay bằng kiểm thử hành vi thực tế (Observable Behavior: strip tự unmount/trả về `null` khi `activeModal === 'bot_trade_offer'`).
