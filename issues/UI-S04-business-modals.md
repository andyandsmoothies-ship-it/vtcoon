# Ticket UI-S04: Modals Tương Tác Nghiệp Vụ (Title Deed, Đấu Giá 15s, Đàm Phán P2P, Lật Thẻ Sự Kiện)

> **Epic:** 3D Visual & DOM UI/UX Overlay (Giai đoạn 2)  
> **Slice:** UI-04 (Thứ tự chuẩn theo Lộ trình)  
> **Ưu tiên:** P0 — Lớp giao diện ra quyết định kinh doanh và đàm phán trực quan  
> **Trạng thái:** ✅ HOÀN THÀNH (521/521 Tests PASS)  
> **Phụ thuộc:** UI-01 (Sa bàn 3D), UI-02 (Pawn Spring & Dice 3D), UI-03 (DOM HUD) ✅ Đã hoàn tất 497/497 Tests  

---

## 1. Bối Cảnh & Vấn Đề Cần Giải Quyết

Qua các Slice UI-01 đến UI-03, sa bàn 3D, quân cờ nhảy lò xo, khay xúc xắc và thanh HUD tài chính Z-10 đã hoạt động mượt mà. Tuy nhiên, toàn bộ các quyết định kinh doanh cốt lõi của trò chơi hiện vẫn chưa có giao diện trực quan:
- **Mua đất & Thẻ Sổ Đỏ:** Khi người chơi dừng tại một ô đất trống, chưa có Thẻ Sổ Đỏ (Title Deed) hiển thị chi tiết bảng giá thuê theo 4 cấp (C0–C3), chi phí nâng cấp và nút quyết định [Mua Ngay] hoặc [Bỏ Qua].
- **Sàn đấu giá trực tuyến 15s:** Khi người dừng từ chối mua hoặc trong các tình huống đấu giá cưỡng chế/thu hồi, chưa có Modal Đấu Giá với đồng hồ đếm ngược 15 giây, hiển thị người đặt giá cao nhất và các nút tăng giá nhanh (+50 Tr., +100 Tr., Bỏ cuộc).
- **Đàm phán song phương P2P:** Chưa có giao diện trao đổi đất đổi đất, bù trừ tiền mặt và thông báo khấu trừ 5% thuế chuyển nhượng vào Kho Bạc.
- **Lật thẻ sự kiện:** Khi rút Phiếu Cơ Hội hoặc Phiếu Thị Trường, chưa có hiệu ứng lật thẻ 2.5D trang trọng và hiển thị nội dung biến động tài chính từ từ điển tiếng Việt `vi.ts`.

**Mục tiêu Slice UI-04:**
1. Xây dựng bộ 4 Modals chuyên biệt trong `src/client/ui/modals/`:
   - `TitleDeedModal.tsx`: Thẻ Sổ Đỏ phong cách chứng nhận quyền sử dụng đất Việt Nam.
   - `AuctionModal.tsx`: Sàn đấu giá thời gian thực với đồng hồ 15s, danh sách người bid và các bước giá chuẩn.
   - `TradeModal.tsx`: Bảng đàm phán P2P song phương chọn đất đổi đất kèm bù tiền và tính 5% thuế.
   - `EventCardModal.tsx`: Hoạt cảnh lật thẻ sự kiện (Cơ Hội / Vĩ Mô) hiển thị nội dung tiếng Việt và biến động tài chính.
2. Xây dựng `ModalHost.tsx` và `ModalBackdrop.tsx` quản lý hiển thị tập trung tại tầng Z-20 (nằm trên HUD Z-10), có hiệu ứng mờ nền (`backdrop-blur-sm`).
3. Mở rộng `useGameStore` quản lý trạng thái mở modal (`activeModal: 'deed' | 'auction' | 'trade' | 'event' | null`) cùng payload định kiểu chặt chẽ.
4. Bảo toàn 100% kết quả xanh 497 tests hiện có, bổ sung test suite logic và Adversarial Inversion.

---

## 2. Use Case & Căn Cứ Kiến Trúc

| Căn cứ | Mục tham chiếu | Yêu cầu kỹ thuật |
|---|---|---|
| `ADR-0002` | §2 Lớp DOM UI Overlay | Modals tương tác chuyên sâu đặt tại Z-Index cao hơn HUD, giao tiếp qua Zustand Store |
| `UC-GAME-020` | Mua đất nền Cấp 0 | Hiển thị giá niêm yết, khấu trừ tiền mặt, nút Mua / Bỏ qua |
| `UC-GAME-022` | Mở phiên đấu giá tự động | Sàn đấu giá 15s đếm ngược, bước giá tối thiểu 50 Tr., tự đóng khi hết giờ |
| `UC-GAME-028` | Giao dịch chuyển nhượng P2P | Trao đổi đất + tiền chênh lệch, tự động trừ 5% thuế chuyển nhượng |
| `UC-GAME-038..050` | Hệ thống Thẻ bài Sự kiện | Hiển thị nội dung thẻ từ `vi.ts`, minh họa biểu tượng và hiệu ứng tiền tệ |
| `design.md` | Bảng màu & Phong cách | Màu viền Sổ Đỏ theo nhóm đất (`COLOR_GROUP_HEX`), phong cách phẳng sang trọng |

---

## 3. Phạm Vi Công Việc (Scope)

### 3.1 Các Tệp Tạo Mới (New Files trong `src/client/ui/modals/`)
1. `src/client/ui/modals/modal_backdrop.tsx` (≤ 50 LOC): Lớp phủ nền mờ `fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-20 pointer-events-auto`.
2. `src/client/ui/modals/title_deed_modal.tsx` (≤ 150 LOC): Thẻ Sổ Đỏ hiển thị nhóm màu, tên địa danh, giá mua, bảng giá thuê 4 cấp (C0–C3), giá trị thế chấp, nút Mua và Bỏ qua.
3. `src/client/ui/modals/auction_modal.tsx` (≤ 140 LOC): Sàn đấu giá 15s: Tên BĐS, giá khởi điểm, giá cao nhất hiện tại, nút tăng giá (+50 Tr., +100 Tr., +200 Tr.) và nút Rút lui.
4. `src/client/ui/modals/trade_modal.tsx` (≤ 160 LOC): Khung đàm phán P2P chia 2 cột (Tài sản của bạn / Tài sản đối tác), tiền chênh lệch, hiển thị thuế 5% Kho bạc, nút Đề xuất/Chấp thuận/Từ chối.
5. `src/client/ui/modals/event_card_modal.tsx` (≤ 130 LOC): Thẻ sự kiện 2.5D lật mặt, viền vàng ánh kim (Thị Trường) hoặc xanh ngọc (Cơ Hội), hiển thị tiêu đề tiếng Việt và hiệu ứng tác động.
6. `src/client/ui/modals/modal_helpers.ts` (≤ 90 LOC): Hàm toán học thuần tính toán bước giá đấu giá, bù trừ tiền P2P, tính thuế 5%, kiểm tra điều kiện hợp lệ.
7. `src/client/ui/modals/modal_host.tsx` (≤ 70 LOC): Switchboard hiển thị modal tương ứng theo `activeModal` từ `game_store`.
8. `tests/client/ui04_business_modals.test.ts` (≤ 180 LOC): Test suite kiểm thử logic modal, thuế P2P, bước giá đấu giá, và phòng thủ Adversarial Inversion.

### 3.2 Các Tệp Cập Nhật (Modify Files)
1. `src/client/store/game_store.ts`: Bổ sung `activeModal`, `modalPayload`, `openModal`, `closeModal`, `updateModalPayload`.
2. `src/client/ui/hud_container.tsx`: Tích hợp `<ModalHost />` vào DOM tree.
3. `src/client/ui/action_dock.tsx`: Nối nút "Tài Sản" và "Đàm Phán" với `openModal('deed')` và `openModal('trade')`.
4. `docs/epics/client_ui/_epic_ledger.md`: Cập nhật trạng thái tiến độ Slice UI-04.

---

## 4. Đặc Tả Thiết Kế Chi Tiết Từng Modal

### 4.1 Thẻ Sổ Đỏ (`TitleDeedModal.tsx`)
- **Khung thẻ:** Mô phỏng Giấy chứng nhận quyền sở dụng đất:
  - Header: Băng màu nhóm đất (`COLOR_GROUP_HEX[group]`) với tên ô in hoa đậm (VD: "CẦN THƠ (CÁI RĂNG)").
  - Giá niêm yết: VD: "Giá mua: 600 Tr. VNĐ" | "Thế chấp: 300 Tr. VNĐ".
  - Bảng phí dừng chân 4 cấp:
    - Đất trống (Cấp 0): 60 Tr.
    - Nhà phố (Cấp 1): 210 Tr. (Chi phí nâng cấp: 300 Tr.)
    - Khách sạn (Cấp 2): 540 Tr. (Chi phí nâng cấp: 450 Tr.)
    - TTTM / Tháp đôi (Cấp 3): 1.320 Tr. (Chi phí nâng cấp: 600 Tr.)
  - Nút bấm:
    - [Mua Bất Động Sản] (Xanh Emerald, nổi bật, disable nếu không đủ tiền).
    - [Bỏ Qua / Mở Đấu Giá] (Xám Slate viền Amber).

### 4.2 Sàn Đấu Giá 15s (`AuctionModal.tsx`)
- **Thời gian thực:** Đồng hồ đếm ngược 15 giây (thanh tiến trình hoặc số đếm đỏ dần khi < 5s).
- **Trạng thái giá:**
  - BĐS đang đấu giá: Tên ô, giá niêm yết gốc.
  - Mức giá dẫn đầu: "Giá cao nhất: 450 Tr. VNĐ — Người Chơi 2".
- **Thao tác người chơi:**
  - Nút đặt giá nhanh: `+50 Tr.`, `+100 Tr.`, `+200 Tr.` (tính từ mức giá cao nhất hiện tại).
  - Nút [Rút Lui / Bỏ Cuộc]: Đánh dấu người chơi dừng tham gia đấu giá vòng này.

### 4.3 Đàm Phán Song Phương P2P (`TradeModal.tsx`)
- **Bố cục 2 cột:**
  - Cột trái: "Tài sản bạn đề xuất" — Checkbox danh sách BĐS sở hữu, ô nhập tiền mặt bù thêm.
  - Cột phải: "Tài sản đối tác" — Checkbox danh sách BĐS của đối tác, ô yêu cầu đối tác bù tiền.
- **Hộp thông báo thuế:** "Khấu trừ 5% thuế chuyển nhượng nộp Kho Bạc ({formatCurrency(taxAmount)})".
- **Nút hành động:**
  - Nếu là người khởi xướng: [Gửi Đề Xuất Đàm Phán] / [Hủy].
  - Nếu là người nhận đề xuất: [Chấp Thuận Giao Dịch] / [Từ Chối].

### 4.4 Thẻ Sự Kiện Lật Mặt (`EventCardModal.tsx`)
- **Phong cách thị giác:** Thẻ bài kích thước chuẩn tỷ lệ 2:3 với viền neon vàng ánh kim (Thị Trường) hoặc xanh ngọc cyan (Cơ Hội).
- **Nội dung:** Tiêu đề tiếng Việt từ `vi.ts`, icon minh họa theo loại sự kiện, tóm tắt ảnh hưởng:
  - Tác động tiền tệ: "+500 Tr. VNĐ" (Xanh lá) hoặc "-300 Tr. VNĐ" (Đỏ).
  - Tác động quy hoạch: "Đóng băng giao dịch 2 vòng", "Tăng 50% tiền thuê du lịch", v.v.
- **Nút hành động:** [Đã Hiểu / Tiếp Tục].

---

## 5. Hợp Đồng Kiểm Thử (Test Contracts)

| Mã TC | Kịch bản | Kết quả Kỳ vọng | Adversarial Inversion |
|---|---|---|---|
| `TC-UI04.1` | Tra cứu thông số Sổ Đỏ ô hợp lệ | Trả về đúng giá niêm yết, giá thuê 4 cấp C0-C3 và chi phí nâng cấp từ `PROPERTY_DEEDS` | Ô không phải tài sản (GO, Thuế, Cơ Hội) ném lỗi hoặc trả về null |
| `TC-UI04.2` | Tính toán các bước giá đấu giá | Từ mức giá hiện tại $P$, sinh đúng $[P+50, P+100, P+200]$ | Giá âm hoặc không phải bội số của 10 bị chuẩn hóa an toàn |
| `TC-UI04.3` | Tính toán bù trừ và thuế P2P 5% | Số tiền chuyển nhượng ròng và thuế 5% nộp Kho Bạc được làm tròn chuẩn xác | BĐS đang thế chấp hoặc không thuộc quyền sở hữu bị từ chối giao dịch |
| `TC-UI04.4` | Quản lý trạng thái `activeModal` | `openModal` mở đúng modal kèm payload; `closeModal` trả `activeModal` về null | Mở modal mới tự động thay thế modal cũ mà không gây rò rỉ bộ nhớ |
| `TC-UI04.5` | Validate điều kiện gửi đề xuất P2P | Cho phép đề xuất khi có ít nhất 1 tài sản hoặc tiền mặt trao đổi, tiền mặt không vượt quá số dư | Đề xuất rỗng (0 đất, 0 tiền) hoặc vượt quá số dư tiền mặt bị chặn |

---

## 6. Tiêu Chí Hoàn Thành (Definition of Done)
- [x] Toàn bộ 4 component modal được đặt ngăn nắp trong `src/client/ui/modals/`.
- [x] 497 tests cũ giữ vững 100% PASS (Zero Regression).
- [x] Bổ sung 18-24 unit tests mới trong `tests/client/ui04_business_modals.test.ts` (24 tests).
- [x] `npx tsc --noEmit` hoàn tất với 0 lỗi.
- [x] Ngân sách mỗi tệp tuân thủ nghiêm ngặt ≤ 150-180 LOC, Cyclomatic Complexity ≤ 5.
- [x] Xác minh Visual Smoke Gate trên trình duyệt: Mở được đầy đủ cả 4 modals.
