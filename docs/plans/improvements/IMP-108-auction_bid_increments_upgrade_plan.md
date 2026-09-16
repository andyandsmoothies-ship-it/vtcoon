# [IMP-108] Kế Hoạch Nâng Cấp Bước Giá Đấu Giá 100 - 200 - 500 Tr. (Auction Bid Increments Upgrade)

## 1. BỐI CẢNH & MỤC TIÊU
- **Hiện trạng:** Sàn đấu giá trực tuyến (`AuctionModal`) hiện tại cung cấp 3 nút nâng giá nhanh: `+50 Tr.`, `+100 Tr.`, `+200 Tr.`. Ở các vòng đấu trung và hậu kỳ (khi giá ô đất đạt từ 2.000 Tr. đến 4.000 Tr.), bước giá +50 Tr. quá nhỏ khiến phiên đấu giá kéo dài, giảm nhịp độ kịch tính.
- **Yêu cầu người dùng:** Tăng 3 mức nâng giá trong sàn đấu giá lên:
  - Nấc 1: `+100 Tr.`
  - Nấc 2: `+200 Tr.`
  - Nấc 3: `+500 Tr.`
- **Mục tiêu:**
  1. Cập nhật hàm tính bước giá `calculateAuctionIncrements(currentBid)` sinh đúng `[safeBid + 100, safeBid + 200, safeBid + 500]`.
  2. Cập nhật `AuctionModal` hiển thị 3 nút bấm xúc giác: `+100 Tr.`, `+200 Tr.`, `+500 Tr.` cùng số tiền thầu tương ứng.
  3. Cập nhật tính năng `AUTO-BID` tự động chọn bước giá tối thiểu mới (+100 Tr.).
  4. Bảo đảm tương thích 100% với Server `auction_manager.ts` (máy chủ yêu cầu `>= +50 Tr.`, do đó mức +100 Tr. hoàn toàn hợp lệ).
  5. Thiết lập bộ kiểm thử hợp đồng Trạm 1 với >= 15 atomic tests theo Ma Trận 4 Khía Cạnh.

---

## 2. KIẾN TRÚC & PHÂN TÍCH LUỒNG DỮ LIỆU

```
[Mức Giá Thầu Hiện Tại: currentBid]
                 │
                 ▼
[calculateAuctionIncrements(currentBid)]
  ├─ Nấc 1: currentBid + 100 Tr.
  ├─ Nấc 2: currentBid + 200 Tr.
  └─ Nấc 3: currentBid + 500 Tr.
                 │
                 ▼
[AuctionModal Render]
  ├─ Nút 1: "+100 Tr." (formatCurrency(currentBid + 100))
  ├─ Nút 2: "+200 Tr." (formatCurrency(currentBid + 200))
  ├─ Nút 3: "+500 Tr." (formatCurrency(currentBid + 500))
  └─ [AUTO-BID]: Tự động gửi Nấc 1 (+100 Tr.)
                 │
                 ▼ (INTENT_BID)
[Server: handleAuctionBid]
  └─ minBid = highestBid + 50 ➔ currentBid + 100 >= minBid (HỢP LỆ ✔️)
```

---

## 3. DANH MỤC TỆP THAY ĐỔI
1. `src/client/ui/modals/modal_helpers.ts`: Cập nhật `calculateAuctionIncrements` sang `[+100, +200, +500]`.
2. `src/client/ui/modals/auction_modal.tsx`: Cập nhật mảng duyệt `[100, 200, 500] as const`.
3. `tests/contracts/imp108_auction_bid_increments_upgrade.test.ts`: Bộ kiểm thử hợp đồng mới (18 atomic tests).
4. `tests/client/ui04_business_modals.test.ts`: Đồng bộ kỳ vọng bước giá mới.
5. `tests/client/auction_modal.test.ts`: Đồng bộ nhãn nút bấm `+100 Tr.`, `+200 Tr.`, `+500 Tr.`.
6. `tests/contracts/imp61_tabletop_visual_alignment.test.ts`: Đồng bộ nhãn nút bấm.
7. `docs/requirements.md`: Cập nhật mục II quy định các mức nâng giá đấu giá.
8. `docs/master_roadmap.md`: Đăng ký IMP-108.

---

## 4. MA TRẬN KIỂM THỬ 4 KHÍA CẠNH (UNIVERSAL 4-FACET MATRIX)
- **Facet 1 (Boundary & Clamping):** Giá 0, số âm, số thực phân số, NaN, Infinity, giá trị cực lớn (> 100.000 Tr.).
- **Facet 2 (State Reactivity):** Render đúng 3 nút `+100 Tr.`, `+200 Tr.`, `+500 Tr.`; Auto-Bid kích hoạt đúng nấc 1 (+100 Tr.).
- **Facet 3 (Affordability & Disabled):** Khóa nút khi số dư không đủ; chỉ bật nút trong khả năng chi trả.
- **Facet 4 (Error Defense & Accessibility):** Định dạng tiền tệ VND, thuộc tính aria-live, an toàn SSR.
