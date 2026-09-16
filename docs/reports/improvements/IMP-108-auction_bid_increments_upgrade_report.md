# Báo Cáo Cải Tiến IMP-108: Nâng Cấp Bước Giá Đấu Giá 100 - 200 - 500 Tr. (Auction Bid Increments Upgrade)

> **Mã Cải Tiến:** IMP-108  
> **Trạng Thái:** 🟢 **Hoàn Tất**  
> **Ngày Triển Khai:** 2026-09-16  
> **Khu Vực Tác Động:** `src/client/ui/modals/modal_helpers.ts`, `src/client/ui/modals/auction_modal.tsx`, `tests/contracts/imp108_auction_bid_increments_upgrade.test.ts`  
> **Quy Trình Áp Dụng:** Quy Trình 3 Trạm Bắt Buộc (Adversarial Inversion RED ➔ GREEN ➔ Independent Physical Disk Audit)  

---

## 1. BỐI CẢNH & VẤN ĐỀ THỰC TẾ
- Trên sàn đấu giá trực tuyến 15s (`AuctionModal`), người chơi trước đây được cung cấp 3 nút đặt giá nhanh: `+50 Tr.`, `+100 Tr.`, `+200 Tr.`.
- Khi phiên đấu giá bước vào giai đoạn quyết định hoặc đấu giá các BĐS đắt đỏ (như Tuyến Cao Tốc Bắc - Nam giá khởi điểm 2.000 Tr., hoặc các ô giá 3.000 - 4.000 Tr.), bước giá +50 Tr. quá nhỏ, làm chậm nhịp độ trận đấu và không tạo đủ áp lực kinh tế.
- Người dùng yêu cầu nâng 3 mức nâng giá thành: **`+100 Tr.`**, **`+200 Tr.`**, **`+500 Tr.`** (ảnh minh chứng: `media_1789560950758.png`).

---

## 2. GIẢI PHÁP THỰC HIỆN
1. **Hàm Tính Bước Giá (`modal_helpers.ts`):**
   - Cập nhật `calculateAuctionIncrements(currentBid)` sinh đúng 3 nấc: `[safeBid + 100, safeBid + 200, safeBid + 500]`.
   - Giữ nguyên các chốt phòng thủ: làm tròn sàn các số lẻ (`Math.floor`), chuẩn hóa số âm, `NaN`, `Infinity` về 0.
2. **Giao Diện Sàn Đấu Giá (`auction_modal.tsx`):**
   - Chuyển đổi mảng duyệt nút bấm sang `([100, 200, 500] as const)`.
   - Hiển thị nhãn nút dập nổi: `+100 Tr.`, `+200 Tr.`, `+500 Tr.` kèm số tiền tương ứng `(formatCurrency(targetBid))`.
   - Tính năng `AUTO-BID` tự động đặt theo nấc tối thiểu mới là `increments[0]` (+100 Tr.).
3. **Tương Thích Ngược Máy Chủ Server:**
   - Server FSM (`auction_manager.ts`) yêu cầu `minBid = session.highestBid + 50`. Khi client gửi lên `currentBid + 100`, điều kiện `>= +50` luôn được thỏa mãn 100%, không phát sinh lỗi `BID_TOO_LOW`.

---

## 3. KẾT QUẢ KIỂM THỬ (QUY TRÌNH 3 TRẠM)

```
🚦 [KÍCH HOẠT QUY TRÌNH 3 TRẠM]
├─ Trạm 1 (RED): 10 tests FAILED trên mã nguồn cũ (chứng minh Adversarial Inversion)
├─ Trạm 2 (GREEN): 18/18 tests PASS 100% sau khi sửa modal_helpers.ts và auction_modal.tsx
└─ Trạm 3 (Audit): 94/94 tests liên quan PASS, linters pass 100%, 0 lỗi TypeScript
```

- **Trạm 1 (Adversarial Inversion):**
  - Tạo tệp kiểm thử hợp đồng `tests/contracts/imp108_auction_bid_increments_upgrade.test.ts` (18 atomic tests phủ 4 khía cạnh).
  - Chạy trên mã nguồn cũ: **10 tests FAIL / 8 tests PASS** do kỳ vọng `+100, +200, +500 Tr.` trong khi mã nguồn trả về `+50, +100, +200 Tr.`.
- **Trạm 2 (GREEN Implementation):**
  - Áp dụng thay đổi tại `modal_helpers.ts` và `auction_modal.tsx`.
  - Đồng bộ các bài kiểm thử liên quan (`ui04_business_modals.test.ts`, `auction_modal.test.ts`, `imp61_tabletop_visual_alignment.test.ts`).
  - Kết quả: **18/18 atomic contract tests PASS 100%**.
  - Kết hợp toàn bộ các suite liên quan: **94/94 tests PASS 100%**.
- **Trạm 3 (Kiểm Định Vật Lý & Tiêu Chuẩn Slop/UI):**
  - `npm run lint:ui`: **0 vi phạm**.
  - `node scripts/lint_slop.mjs`: **0 Hard Violations**.
  - `npx tsc --noEmit`: **0 lỗi biên dịch**.
  - `tests/server/imp49_auction_step_and_sync.test.ts`: **19/19 tests PASS**.

---

## 4. TÀI LIỆU CẬP NHẬT
- [`docs/requirements.md#L19`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/requirements.md#L19): Cập nhật quy định 3 mức nâng giá nhanh `+100, +200, +500 Tr. VNĐ` theo IMP-108.
- [`docs/master_roadmap.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/master_roadmap.md): Đăng ký gói cải tiến IMP-108.
