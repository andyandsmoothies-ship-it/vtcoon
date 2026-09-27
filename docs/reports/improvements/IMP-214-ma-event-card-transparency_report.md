# [REPORT] IMP-214: Minh Bạch Hóa Thâu Tóm M&A & Cải Thiện Affordance Thẻ Sự Kiện

## 1. THÔNG TIN TỔNG QUAN
- **Mã Ticket**: IMP-214
- **Tiêu Đề**: Minh Bạch Hóa Thâu Tóm M&A & Cải Thiện Affordance Thẻ Sự Kiện (`CC_MA_FORCE`).
- **Phân Hạng**: **Two-Way Door** / Full Architectural Rigor (Thay đổi Server Chance Handler, Event Card Engine, Wire DTO, và Client Modal).
- **Trạng Thái**: ✅ COMPLETE (HOÀN TẤT TRỌN VẸN QUY TRÌNH 3 TRẠM).
- **Cổng Độc Lập**:
  - `plan-griller`: **AUDITED** (Khắc phục 5 điểm mù P1-P2: Clean Architecture, Take-and-Clear, copy trợ cấp, SSOT CTA).
  - `spec-reviewer`: **SPEC_PASS (APPROVED)** (100% spec reconciliation, 16/16 atomic contract tests).
  - `ui-craft-reviewer`: **VERDICT SHIP** (Triệt tiêu 100% nhãn gây hiểu lầm, touch target >= 46px, Hero Stat chuẩn).
  - `code-reviewer`: **CODE_PASS** (Clean Architecture, Zero reverse import, Take-and-Clear Turn N+1 safe, 0 any, 0 slop).

---

## 2. NGUYÊN NHÂN CỐT LÕI & GIẢI PHÁP KIẾN TRÚC

### 2.1. Hiện trạng trước cải tiến
1. **Thiếu thông tin kết quả thâu tóm trên DTO**: Khi rút thẻ `CC_MA_FORCE`, máy chủ tự động trừ tiền người chơi và chuyển nhượng ô đất C0 của đối thủ. Tuy nhiên, DTO `lastEventCard` gửi về client chỉ có số tiền `-720` chung chung mà không đính kèm tên ô đất và đối thủ bị mua lại.
2. **Nút CTA gây ngộ nhận hành vi (Misleading CTA Label)**: Nút bấm mang nhãn `KÝ HỢP ĐỒNG M&A 🤝` làm người chơi lầm tưởng sẽ mở ra giao diện đàm phán hoặc chọn đất. Khi bấm nút, modal đóng phụt lại và lượt chơi chuyển sang `PropertyManagement`, khiến người chơi bức xúc vì tưởng "bị trừ tiền oan mà không được làm gì".

### 2.2. Giải pháp hoàn chỉnh
1. **Server Engine & Domain Handlers**:
   - `src/domain/chance_card_handlers.ts`: Trong `handleMaForce`, khi thâu tóm thành công, ghi nhận `room.lastMaBuyout = { cellIndex, cellName, sellerId, sellerName, cost }`.
   - `src/domain/event_card_engine.ts`: Áp dụng mẫu **Take-and-Clear Pattern** (`const maBuyout = room.lastMaBuyout; room.lastMaBuyout = undefined;`). Khi `actualDelta < 0`, cấu tạo mô tả chi tiết: `"Đã thâu tóm thành công [${cellName}] từ ${sellerName} với giá 120% (${cost.toLocaleString('vi-VN')})."`.
   - Tuân thủ nghiêm ngặt **Clean Architecture**: Tuyệt đối không import `formatCurrency` từ client vào domain; sử dụng định dạng số thuần native.
   - `src/server/turn_loop.ts`: Bổ sung dọn dẹp `room.lastMaBuyout = undefined;` tại cả 2 pha chuyển lượt `executeRollDice` và `executeTurnEnd` để triệt tiêu hoàn toàn rò rỉ Turn N+1.
2. **Client UI & Affordance**:
   - `src/client/ui/modals/event_card_visuals.ts`:
     - Mở rộng `getCardCtaButtonText(cardId, effectDelta)`: khi thâu tóm thành công (`effectDelta < 0`), nút mang nhãn dứt khoát `ĐÃ THÂU TÓM BĐS • ĐÓNG`. Khi nhận trợ cấp Kho Bạc (`effectDelta > 0`), nút mang nhãn `NHẬN TRỢ CẤP M&A • ĐÓNG`.
     - Cập nhật hằng số SSOT `KNOWN_CARD_CTA_BUTTONS[ChanceCardId.CC_MA_FORCE] = 'ĐÃ THÂU TÓM BĐS • ĐÓNG'`.
     - Cập nhật `getCardHeroStat`: hiển thị nhãn `THÂU TÓM BĐS` khi delta < 0 và `TRỢ CẤP M&A` khi delta > 0.
     - Cập nhật `isFinancialDestination` hỗ trợ từ khóa "chuyển nhượng" và "thanh toán".
   - `src/client/ui/modals/event_card_modal.tsx`: Nối `effectDelta` vào `getCardCtaButtonText(cardId, effectDelta)`.

---

## 3. KIỂM THỬ & CHỈ SỐ HOÀN TẤT
- **Contract Test Suite**: `tests/contracts/imp214_ma_event_card_transparency.test.ts` — **16/16 atomic tests PASS 100%**.
- **Adversarial Inversion**: Trạm 1 chứng minh RED (9 failed / 7 passed), Trạm 2 chuyển GREEN 16/16.
- **Linter & Typecheck**: `npm run lint:ui` (0 vi phạm), `npx tsc --noEmit` (0 lỗi).
- **Ngân sách LOC**:
  - `src/domain/room.ts`: 265 LOC ($\le$ 400 LOC Tier 1).
  - `src/domain/chance_card_handlers.ts`: 362 LOC ($\le$ 400 LOC Tier 1).
  - `src/domain/event_card_engine.ts`: 147 LOC ($\le$ 400 LOC Tier 1).
  - `src/server/turn_loop.ts`: 302 LOC ($\le$ 400 LOC Tier 1).
  - `src/client/ui/modals/event_card_visuals.ts`: 342 LOC ($\le$ 500 LOC Tier 2).
  - `src/client/ui/modals/event_card_modal.tsx`: 226 LOC ($\le$ 500 LOC Tier 2).
- **Production Build Pipeline**: `npm run build` thành công 100% (Client bundle & SSR bundle 432.53 kB).
- **Evidence Snapshot**: `.agents/evidence/imp214_snapshot.json` (`executed: true`).
