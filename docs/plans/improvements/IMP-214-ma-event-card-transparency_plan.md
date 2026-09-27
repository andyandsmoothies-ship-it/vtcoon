# [PLAN] IMP-214: Minh Bạch Hóa Thâu Tóm M&A & Cải Thiện Affordance Thẻ Sự Kiện

> **Mã Ticket**: IMP-214  
> **Mục tiêu**: Xóa bỏ hoàn toàn sự mập mờ và ức chế của người chơi khi rút trúng thẻ Cơ Hội `CC_MA_FORCE` (Thâu Tóm Doanh Nghiệp M&A).
> - Minh bạch hóa kết quả giao dịch trên Server & DTO: Khi thâu tóm thành công, trả về cụ thể tên ô đất đã mua (`cellName`), chủ sở hữu cũ (`sellerName`), giá chuyển nhượng 120% thực tế, và đối tượng nhận tiền.
> - Cải thiện Client UI Affordance: Hiển thị rõ dòng trạng thái thâu tóm thành công (hoặc nhận trợ cấp Kho Bạc), đổi nhãn nút CTA từ `KÝ HỢP ĐỒNG M&A 🤝` thành `ĐÃ THÂU TÓM BĐS • ĐÓNG` (hoặc `NHẬN TRỢ CẤP M&A • ĐÓNG`), triệt tiêu 100% cảm giác "bị trừ tiền oan mà không được làm gì".

---

## 1. PHÂN TÍCH HIỆN TRẠNG & NGUYÊN NHÂN CỐT LÕI (ROOT CAUSE)

```
[Người chơi rút thẻ CC_MA_FORCE]
       │
       ▼
[Server Engine: handleMaForce]
       │  Auto-executed: p1 (-720) ──> bot_4 (+720)
       │  Ô 3 An Giang: bot_4 ──> p1 (ĐÃ SANG TÊN THÀNH CÔNG!)
       ▼
[DTO lastEventCard gửi về Client]
       │  Chỉ có: title="Thâu Tóm Doanh Nghiệp", effectDelta=-720
       │  KHÔNG CÓ: cellIndex=3, cellName="An Giang", seller="Bot 4"
       ▼
[EventCardModal trên Client]
       │  Hiện: Icon 🏢 • Tiêu đề THÂU TÓM DOANH NGHIỆP • Số tiền: -720
       │  Mô tả: "Mua lại 1 ô đất C0 của đối thủ theo giá 120%..." (Lý thuyết chung chung)
       │  Nút: "KÝ HỢP ĐỒNG M&A 🤝" (Gây hiểu lầm sắp mở màn hình chọn đất/đàm phán)
       ▼
[Người chơi bấm nút]
       │  Modal đóng phụt lại! Không có màn hình chọn đất nào.
       │  Đang đứng ở ô 7 (Cơ hội) ➔ Nút xúc xắc khóa ➔ Chỉ còn nút "KẾT THÚC LƯỢT"
       ▼
[Tâm lý người chơi]: "Ủa sao bị trừ 720 triệu mà không làm được gì để trao đổi chỉ biết kết thúc lượt?!"
```

---

## 2. PHẠM VI & NGÂN SÁCH LOC
| Tệp Vật Lý | Phân Loại Tier | LOC Hiện Tại | LOC Dự Kiến | Đánh Giá |
| :--- | :---: | :---: | :---: | :---: |
| `src/domain/room.ts` | Tier 1 (Domain Model) | 256 | ~262 (+6L) | ✔️ An toàn (<= 400 LOC) |
| `src/domain/chance_card_handlers.ts` | Tier 1 (Domain Handlers) | 353 | ~362 (+9L) | ⚠️ Giữ sát (<= 400 LOC, bảo tồn ngân sách) |
| `src/domain/event_card_engine.ts` | Tier 1 (Engine) | 129 | ~142 (+13L) | ✔️ An toàn (<= 400 LOC) |
| `src/server/turn_loop.ts` | Tier 1 (Server Turn FSM) | 227 | ~229 (+2L) | ✔️ An toàn (<= 400 LOC) |
| `src/client/ui/modals/event_card_visuals.ts` | Tier 2 (UI Helpers) | 333 | ~345 (+12L) | ✔️ An toàn (<= 500 LOC) |
| `src/client/ui/modals/event_card_modal.tsx` | Tier 2 (UI Modal) | 226 | ~228 (+2L) | ✔️ An toàn (<= 500 LOC) |
| `tests/contracts/imp214_ma_event_card_transparency.test.ts` | Test Contract | 0 (Mới) | ~400 | ✔️ An toàn (Suite 16 atomic tests) |

---

## 3. CÁC ĐIỂM MÙ ĐÃ GIA CỐ TỪ PHẢN BIỆN ĐỐI KHÁNG (GRILLER FORTIFICATIONS)

1. **Phòng chống Reverse Import (Clean Architecture Guard)**:
   - Tuyệt đối KHÔNG import `formatCurrency` từ `src/client/ui/ui_helpers.ts` vào `src/domain/event_card_engine.ts`.
   - Trong domain engine, định dạng số tiền thuần túy bằng `cost.toLocaleString('vi-VN')` hoặc template string.
2. **Triệt tiêu rò rỉ trạng thái Turn N+1 (Take-and-Clear Pattern)**:
   - Trong `drawChanceCard`: thực hiện `const maBuyout = room.lastMaBuyout; room.lastMaBuyout = undefined;` ngay lập tức để không bao giờ bị rò rỉ sang các lượt sau.
   - Bổ sung `room.lastMaBuyout = undefined;` trong `src/server/turn_loop.ts` tại các điểm chuyển pha `handleRollDice` và `handleEndTurn`.
3. **Chính xác hóa mô tả trường hợp Trợ Cấp Kho Bạc**:
   - Khi `actualDelta > 0`, chuỗi mô tả ghi rõ: `"Nhận 800 trợ cấp M&A từ Kho Bạc (do đối thủ không có BĐS Cấp 0 phù hợp hoặc không đủ ngân sách mua lại)."`
4. **Chuẩn hóa SSOT cho nhãn nút bấm CTA**:
   - Khi thâu tóm thành công (`effectDelta < 0`): `ĐÃ THÂU TÓM BĐS • ĐÓNG`.
   - Khi nhận trợ cấp Kho Bạc (`effectDelta > 0`): `NHẬN TRỢ CẤP M&A • ĐÓNG`.
   - Cập nhật hằng số `KNOWN_CARD_CTA_BUTTONS[ChanceCardId.CC_MA_FORCE] = 'ĐÃ THÂU TÓM BĐS • ĐÓNG'` để bảo toàn tính nhất quán.

---

## 4. BẢNG 16 ATOMIC CONTRACT TESTS (UNIVERSAL 5-FACET MATRIX)

Tệp kiểm thử: `tests/contracts/imp214_ma_event_card_transparency.test.ts` (16 atomic tests):
- **Facet 1: Server M&A Execution & Payload Transparency (TC-214.01 - 04)**:
  - `TC-214.01`: Khi rút thẻ `CC_MA_FORCE` và có đối thủ sở hữu ô C0, server tự động chuyển nhượng quyền sở hữu ô đất sang cho người rút thẻ.
  - `TC-214.02`: Khi thâu tóm thành công, `lastEventCard.effectDetail` chứa chính xác tên ô đất đã thâu tóm và tên đối thủ bị mua lại.
  - `TC-214.03`: Khi thâu tóm thành công, `lastEventCard.targetScope` mang tên ô đất thâu tóm và `destination` ghi nhận thanh toán cho đối thủ.
  - `TC-214.04`: Khi thâu tóm thành công, `lastEventCard.effectDelta` mang giá trị âm chính xác bằng 120% giá gốc (`-Math.floor(deed.price * 1.2)`).
- **Facet 2: Treasury Fallback & Subsidy Transparency (TC-214.05 - 08)**:
  - `TC-214.05`: Khi đối thủ không có ô C0 hợp lệ, người chơi nhận 800 Tr. trợ cấp từ Kho Bạc (`effectDelta = +800`).
  - `TC-214.06`: Khi nhận trợ cấp, `lastEventCard.effectDetail` nêu rõ lý do nhận trợ cấp từ Kho Bạc (không có BĐS phù hợp hoặc không đủ tiền).
  - `TC-214.07`: Khi nhận trợ cấp, `destination` ghi rõ "Kho Bạc hỗ trợ vào Ngân sách người chơi".
  - `TC-214.08`: Quá trình nhận trợ cấp bảo toàn nguyên lý Treasury Conservation (Kho Bạc giảm đúng 800).
- **Facet 3: Client CTA Affordance & Anti-Confusion (TC-214.09 - 12)**:
  - `TC-214.09`: Khi `CC_MA_FORCE` có `effectDelta < 0`, nút CTA mang nhãn rõ ràng `ĐÃ THÂU TÓM BĐS • ĐÓNG` (khẳng định không còn chứa `KÝ HỢP ĐỒNG`).
  - `TC-214.10`: Khi `CC_MA_FORCE` có `effectDelta > 0`, nút CTA mang nhãn `NHẬN TRỢ CẤP M&A • ĐÓNG`.
  - `TC-214.11`: Bấm nút CTA trong `EventCardModal` đóng modal an toàn thông qua callback `onConfirm` / `onClose`.
  - `TC-214.12`: Thẻ Hero Stat Box hiển thị nhãn `THÂU TÓM BĐS` với số tiền âm khi mua đất thành công.
- **Facet 4: Mobile Ergonomics & Financial Destination Pill (TC-214.13 - 16)**:
  - `TC-214.13`: Khối tóm tắt tác động trên Mobile (`event-impact-summary`) hiển thị đầy đủ tên ô đất thâu tóm mà không bị vỡ layout.
  - `TC-214.14`: Hàm `isFinancialDestination` trả về true cho chuỗi chứa "chuyển nhượng" hoặc "thanh toán", đảm bảo pill xuất hiện trên desktop.
  - `TC-214.15`: Sau khi `drawChanceCard` hoàn tất, `room.lastMaBuyout` được giải phóng sạch sẽ (Take-and-Clear Pattern, Zero Stale Leak).
  - `TC-214.16`: Nút CTA trong `EventCardModal` đạt chuẩn touch target tối thiểu $\ge$ 44px (`min-h-[46px]`).
