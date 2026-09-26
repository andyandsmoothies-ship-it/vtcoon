# BÁO CÁO NGHIỆM THU KỸ THUẬT: IMP-197
## LOẠI BỎ ĐƠN VỊ TIỀN TỆ "TR." & TỐI GIẢN HÓA HIỂN THỊ TÀI CHÍNH TOÀN DIỆN (CURRENCY UNIT DECLUTTER & CLEAN NUMERICAL DISPLAY)

> **Ticket:** IMP-197  
> **Trạng thái:** COMPLETED / SHIP  
> **Phân loại:** Tier 2 (Full Rigor — Quy Trình 3 Trạm Tự Hành & Sweeping Scout Audit)  
> **Thị trường mục tiêu:** Việt Nam (Giao diện, ngôn ngữ hiển thị tiếng Việt)

---

### 1. TỔNG QUAN YÊU CẦU & KẾT QUẢ ĐẠT ĐƯỢC

Xuất phát từ yêu cầu người dùng: *"lập plan bỏ tất cả phần đơn vị tiền 'Tr.' , tôi nghĩ tự người chơi hiểu được"*, ticket IMP-197 đã tối giản hóa toàn bộ diện mạo tài chính của VTCOON, chuyển dịch sang phong cách hiển thị tài chính tối giản, sang trọng và thanh lịch:

1. **Triệt Tiêu 100% Hậu Tố "Tr." và "TR.":**
   - **Giao diện HUD:** Số dư người chơi, thanh tài sản trên cùng hiển thị thuần số sạch.
   - **Bàn cờ 3D Canvas Textures:** Ô 0 (GO) `+2.000`, Ô 4 (Thuế) `NỘP 1.000` (xóa triệt để nhãn `'NỘP 1.000 TR.'`), các nhãn giá niêm yết ô đất trên toàn bộ 40 ô cờ định tuyến qua `formatPriceLabel` (`toLocaleString('vi-VN')`).
   - **Các Cửa Sổ Modal:**
     - Sàn Đấu Giá (`auction_modal.tsx`): Bục flip-counter hiển thị số lớn `{formatCurrency(currentBid)}`, các nút bước giá nhanh đối xứng `Bắt Đáy (0)`, `+100 (1.100)`, `+200 (1.200)`, `+500 (1.500)`.
     - Quản Lý BĐS (`property_portfolio_modal.tsx`): Thâm hụt nợ, tiền thuê, giá BĐS, các nút thế chấp `Thế Chấp (+X)` và giải chấp `Giải Chấp (-X)`.
     - Giao Dịch P2P (`trade_modal.tsx`): Bộ nút gợi ý tỷ lệ sàn `70% Sàn (X)`, `100% Gốc (X)`, `120% (X)`, `150% (X)`.
     - Sổ Đỏ (`title_deed_modal.tsx` & `title_deed_rent_table.tsx`): Bảng giá cước ga tàu `500 / 1.000 / 2.000 / 4.000`, nút `Nâng Cấp (+X)`, `Mua BĐS (X)`.
     - Hướng Dẫn Thể Lệ (`game_rules_modal.tsx`): Vốn khởi đầu `25.000 / 20.000 / 18.000`, lương vượt GO `+2.000`, thuế đất `150/ô, 400/ô`, cước trạm `500` đến `4.000`, quỹ kho bạc `10.000`.
   - **Thẻ Bài & Ticker:** Hero stats (`+2.500`, `-500 / ĐẤT TRỐNG`, `-1.000`, `+3.000`), tóm tắt đanh thép `PUNCHY_EVENT_SUMMARIES`, và dòng tin tức thị trường `market_event_ticker.tsx`.

2. **Bảo Tồn 100% Định Dạng Phân Cách Hàng Nghìn Chuẩn Tiếng Việt:**
   - Hàm `formatCurrency` trong `src/client/ui/ui_helpers.ts` là SSOT duy nhất, phân tách hàng nghìn bằng dấu chấm (`12.500`, `25.000`, `+2.000`, `-500`, `0`).
   - Kẹp số âm làm tròn gần 0 (`-0.2 ➔ '0'`), loại bỏ hoàn toàn lỗi hiển thị `"-0"`.
   - Bọc nhất quán `formatCurrency` cho các nút bấm modal, ngăn chặn triệt để hiện tượng số thô thiếu dấu chấm (như `1400` thay vì `1.400`).

3. **Subtractive Refactoring:**
   - Xóa bỏ triệt để đoạn mã vá lỗi tàn dư `.replace(' Tr.', '')` trong `title_deed_rent_table.tsx:91`.
   - Fallback cắt tóm tắt thẻ sự kiện trong `event_card_punchy_summaries.ts` chuyển sang biểu thức chính quy `cleaned.search(/\.\s/)`, loại trừ nguy cơ cắt cụt các con số có dấu chấm hàng nghìn như `1.000`.

---

### 2. QUY TRÌNH 3 TRẠM (STATION PIPELINE EXECUTION)

```
[Kế Hoạch & Plan-Griller] ➔ [Trạm 1: QA RED (20 tests)] ➔ [Trạm 2: GREEN Implementation] ➔ [Trạm 2.5: Sweeping Scout (CLEAN)] ➔ [Trạm 3: Reviewers (APPROVED)]
```

#### Trạm 1: Contract Testing (QA RED)
- Tạo tệp test hợp đồng: [`tests/contracts/imp197_currency_unit_declutter.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp197_currency_unit_declutter.test.ts).
- Khởi tạo 20 atomic tests phủ 5 Facets; thực thi Adversarial Inversion (chứng minh RED 20/20 tests fail đúng hợp đồng mới chưa được implement trong `src/**`).

#### Trạm 2: Feature Implementation (GREEN)
- Triển khai toàn bộ mã nguồn tối thiểu trong `src/**` trên 24 tệp.
- Reconcile có hệ thống living test suites (~126 tệp trong `tests/**`) theo quy tắc Specification Evolution (Rule 4): cập nhật assertions sang con số cụ thể sạch mà không xóa assert hoặc nới lỏng thành test rỗng.
- Kết quả kiểm thử: **329/329 suites PASS**, **6.574/6.574 tests PASS**.
- Linter UI: `npm run lint:ui` sạch 100% (0 vi phạm trên 185 tệp).
- TypeScript: `npx tsc --noEmit` thoát mã 0.

#### Trạm 2.5: Sweeping Scout Audit
- Quét 100% tệp đĩa vật lý qua 5 Universal Defect Archetypes.
- Phát hiện 5 tọa độ còn sót chuỗi `" Tr."` tại `auction_modal.tsx`, `title_deed_action_footer.tsx`, `game_rules_modal.tsx` và tiến hành xử lý dứt điểm.
- Xác nhận: 0 stale closure, 0 unhandled async, 0 memory leak, 0 dirty cast (`any`), 0 dead code.
- Ngân sách LOC: `property_portfolio_modal.tsx` (494 LOC <= 500 LOC), `auction_modal.tsx` (450 LOC <= 500 LOC), `ui_helpers.ts` (415 LOC <= 550 LOC).
- Kết luận: **CLEAN**.

#### Trạm 3: Independent Review & Disk Verification
- `spec-reviewer`: **APPROVED** — Đối soát 100% dòng mã với đặc tả, xác nhận không phạm Rule 4 Specification Evolution.
- `code-reviewer`: **APPROVED** — Xác nhận clean code, SRP, Zero Slop, ngân sách LOC tuân thủ.
- `ui-craft-reviewer`: **APPROVED (`disposition: ship`)** — Thẩm định thủ công 2D, khen ngợi bố cục số tinh tế, độ tương phản cao, công thái học mobile 360px vượt trội.

---

### 3. BÀI HỌC KINH NGHIỆM ĐƯỢC GHI NHẬN (REFLEXION INVARIANT)

Đã ghi nhận **Gotcha #273** vào [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md#273):
- **Bất Biến Tinh Gọn Đơn Vị Tiền Tệ & Bẫy Khớp Chuỗi Tiêu Cực / Tiền Tố (Clean Currency Formatting & Substring Boundary Guard - IMP-197):**
  1. *Chống false positive `-0`:* Cấm dùng `.not.toContain('-0')` vì dính Tailwind class biên âm (`-top-0`, `-left-0`). Phải dùng regex neo thẻ HTML `expect(html).not.toMatch(/>\s*-\s*0\s*</)`.
  2. *Chống nhầm lẫn tiền tố nút bấm `+50`:* Cấm dùng `.not.toContain('+50')` vì làm rớt nút hợp lệ `+500`. Phải neo thẻ HTML `expect(html).not.toMatch(/>\+50</)`.
  3. *Quy tắc tiến hóa kiểm thử (Rule 4):* Cập nhật assertion kế thừa sang con số cụ thể thực tế (`1.500`), tuyệt đối không xóa assert hay nới lỏng thành `.not.toContain('Tr.')`.
