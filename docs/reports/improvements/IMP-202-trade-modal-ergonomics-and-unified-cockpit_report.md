# BÁO CÁO NGHIỆM THU CẢI TIẾN IMP-202 (IMPROVEMENT REPORT)

**TICKET ID:** IMP-202  
**TIÊU ĐỀ:** Đại Tu Bố Cục Công Thái Học, Khay Tiền Tệ 2 Hàng & Hợp Nhất Buồng Lái Đàm Phán P2P (Trade Modal Ergonomics & Unified Cockpit Overhaul)  
**PHẠM VI ĐÃ PHÊ DUYỆT:**  
1. Tách nhãn "Đối tác:" cố định ra ngoài dải cuộn avatar đối tác (`trade_partner_strip.tsx`), pill đối tác tối đa 160px.  
2. Bố cục tên BĐS 2 dòng (`mainName` + phân khu `{subName}` với `min-w-0 truncate`), mở rộng độ cao danh sách `max-h-52 sm:max-h-72` triệt tiêu bẫy cuộn lồng nhau 144px.  
3. Khay Stepper tiền mặt 2 hàng đạt chuẩn touch target $\ge 44$px (`cash-stepper-max`, `cash-stepper-clear`).  
4. Hợp nhất phân tích giao dịch (AI Sentiment + Cán Cân + Thuế) thành 1 khối bao bọc duy nhất `deal-cockpit`, tiết kiệm ~145px chiều dọc, hiển thị trung tính `0 vs 0` và `⏳ Chờ đề xuất (0%)` khi chưa có đề xuất (`totalDealValue === 0`).  
5. Helper tóm tắt Tab di động tự nhiên `(2 BĐS)`, `(500 Tr.)`, `(2 BĐS • 500)`, bao quát cả giao dịch thuần tiền mặt (`offered.length === 0 && cashOffer > 0`).  
6. Xóa bỏ hoàn toàn nút submit ẩn trùng lặp `sr-only` trong DOM của `TradeModal`, điều hòa regex `TC-153.15`.  
7. Cân bằng nút Hủy ở Footer (viền phẳng nhẹ `shadow-xs`, không dùng shadow 3D nặng khi disabled).  
8. Nâng sàn cỡ chữ toàn bộ nhãn lên $\ge 11$px (loại bỏ `text-[9px]`, `text-[10px]`).  
**TRẠNG THÁI:** 🟢 HOÀN TẤT (STATION 3 APPROVED · VERDICT SHIP)  
**NGÀY:** 26/09/2026  

---

## 1. TỔNG QUAN VẤN ĐỀ & MỤC TIÊU XỬ LÝ (TỪ ẢNH THỰC TẾ `media_1790418644437.png` & `media_1790418649696.png`)

Từ ảnh chụp màn hình thực tế trên thiết bị di động của người dùng tại sàn đàm phán thương lượng P2P (`TradeModal`), 5 khiếm khuyết cơ bản đã được định danh và xử lý triệt để:
1. **[Bẫy cuộn lồng nhau (Nested Scroll Trap)]**: Danh sách BĐS bị bó hẹp trong khung `max-h-36` (144px), khiến ngón tay người chơi bị kẹt cuộn vi mô bên trong modal cuộn chính.
2. **[Tràn pixel vật lý ngang (Physical Horizontal Overflow)]**: Khay điều khiển tiền mặt nhồi nhét 7 phần tử (2 nút stepper, 1 input, 4 phím tắt nhanh) trên 1 hàng ngang duy nhất. Phép cộng pixel vật lý yêu cầu $\ge 340$px, trong khi độ rộng khả dụng của thẻ cột trên màn hình mobile 360px chỉ là 296px, gây tràn khung ngang trầm trọng.
3. **[Phân mảnh thị giác & Phí phạm không gian dọc]**: Ba khối phân tích độc lập (AI Sentiment, Cán cân giao dịch, Phí chuyển nhượng) ngốn $> 240$px chiều dọc, đẩy danh sách BĐS và các nút tương tác rớt xuống dưới nếp gấp màn hình (below the fold).
4. **[Nút ẩn "ma" duy trì để thoả hiệp test cũ]**: Một nút submit ẩn trùng lặp mang class `sr-only` tồn tại vô lý ở đầu DOM của `TradeModal` chỉ để phục vụ biểu thức chính quy Regex đa dòng lỏng lẻo trong bài test cũ `TC-153.15`.
5. **[Chữ siêu nhỏ & Thiếu bao quát giao dịch thuần tiền mặt]**: Các nhãn trạng thái sử dụng `text-[9px]`/`text-[10px]` vi phạm chuẩn sàn chữ di động; Tab di động hiển thị `(0 • 0)` khi mới mở và hoàn toàn bỏ quên hiển thị tiền mặt nếu không chọn BĐS nào.

---

## 2. KIẾN TRÚC & GIẢI PHÁP TRIỂN KHAI THỰC TẾ

### 2.1. Dải Chọn Đối Tác Cố Định & Pill Tinh Gọn (`src/client/ui/modals/trade/trade_partner_strip.tsx`)
- Tách nhãn `Đối tác:` ra khỏi vùng cuộn `overflow-x-auto`, ghim cố định bên trái với `shrink-0` và typography sắc nét `text-[11px] font-black text-slate-400 uppercase tracking-wider`.
- Nén pill đối tác về tối đa `max-w-[160px]`, hiển thị tên và số dư cân đối, bổ sung `truncate min-w-0` chống tràn lề.

### 2.2. Danh Sách BĐS 2 Dòng & Stepper 2 Hàng Công Thái Học (`src/client/ui/modals/trade/trade_column.tsx`)
- Tách tên thẻ đất thành 2 dòng: Dòng 1 là tên tỉnh thành nổi bật `font-bold text-slate-800`, dòng 2 là tên phân khu nhỏ gọn `{subName}` kèm `truncate min-w-0`.
- Mở rộng độ cao danh sách BĐS từ `max-h-36` lên `max-h-52 sm:max-h-72`, triệt tiêu hoàn toàn bẫy kẹt cuộn 144px.
- Nâng sàn toàn bộ typography nhãn trạng thái (`✓ [ĐÃ CHỌN]`, `⚡ Mảnh Ghép Cuối`, `Thế chấp`) lên $\ge 11$px (`text-[11px] font-black`).
- Tái cấu trúc Stepper tiền mặt thành bố cục 2 hàng công thái học:
  - **Hàng 1**: Bộ đếm tinh chỉnh `[-]` `[input tiền mặt]` `[+]`.
  - **Hàng 2**: Khay 4 phím tắt nhanh (`[+100]`, `[+500]`, `[Tối đa]` `data-testid="cash-stepper-max"`, `[Xóa]` `data-testid="cash-stepper-clear"`).
  - Toàn bộ nút bấm đều đạt chuẩn touch target WCAG $\ge 44$px (`min-h-[44px]`).

### 2.3. Hợp Nhất Buồng Lái Đàm Phán (Unified Deal Cockpit) (`src/client/ui/modals/trade/trade_deal_hud.tsx`)
- Tích hợp 3 khối AI Sentiment + Cán Cân + Thuế vào một thẻ bao bọc duy nhất mang `data-testid="deal-cockpit"`, tiết kiệm $\approx 145$px chiều dọc.
- Bố cục responsive linh hoạt: 1 cột xếp chồng trên Mobile, tự động chia lưới 2 cột `sm:grid sm:grid-cols-2` trên Desktop.
- Xử lý trạng thái rỗng hoàn hảo: Khi `totalDealValue === 0`, cán cân hiển thị thanh xám trung tính `0 vs 0`, thước đo AI hiển thị `⏳ Chờ đề xuất (0%)`.
- Khi đàm phán Người - Người (`isBotPartner === false`), giao diện render khối đàm phán trực tiếp tinh gọn, không để lại bất kỳ mảng trắng vô nghĩa nào.

### 2.4. Thước Đo AI Đồng Thuận Đa Trạng Thái (`src/client/ui/modals/trade_sentiment_meter.tsx`)
- Trang bị cờ `isZeroDeal?: boolean`. Khi true: hiển thị icon `⏳`, nhãn `Chờ đề xuất`, điểm số `0%` và thanh tiến trình xám trung tính `bg-slate-400`.
- Đảm bảo tính nhất quán giữa điểm số hiển thị và trạng thái phản ứng tâm lý của Bot AI.

### 2.5. Tinh Lọc DOM, Tóm Tắt Tab Thông Minh & Cân Bằng Footer (`src/client/ui/modals/trade_modal.tsx`)
- Xóa bỏ 100% nút ẩn `sr-only` thừa thãi tại đầu component.
- Helper `formatDealTabSummary`: Hiển thị thông minh `(2 BĐS)`, `(500 Tr.)`, hoặc `(2 BĐS • 500)`, bao quát cả giao dịch thuần tiền mặt và loại bỏ hoàn toàn hiển thị `(0 • 0)`.
- Truyền đúng prop `maxCash={effectiveTargetBalance}` vào cột của đối tác.
- Nút Hủy ở footer sử dụng viền phẳng nhẹ nhàng `border border-slate-300 bg-white shadow-xs` khi nút Gửi bị disabled, tạo thế cân bằng thị giác cao cấp.

---

## 3. THIẾT QUÂN LUẬT NGÂN SÁCH DÒNG CODE (LOC TIER AUDIT - ĐO ĐẠC VẬT LÝ TRỰC TIẾP TỪ DISK)

Tất cả các tệp sửa đổi đều được đo đạc dòng vật lý thực tế trên đĩa và tuân thủ nghiêm ngặt các hạn mức Tier của dự án:
- `src/client/ui/modals/trade_modal.tsx`: **275 LOC** $\le 500$ LOC Tier 2.
- `src/client/ui/modals/trade/trade_partner_strip.tsx`: **75 LOC** $\le 500$ LOC Tier 2.
- `src/client/ui/modals/trade/trade_column.tsx`: **232 LOC** $\le 500$ LOC Tier 2.
- `src/client/ui/modals/trade/trade_deal_hud.tsx`: **96 LOC** $\le 500$ LOC Tier 2.
- `src/client/ui/modals/trade_sentiment_meter.tsx`: **103 LOC** $\le 500$ LOC Tier 2.
- `tests/client/imp202_trade_modal_ergonomics_overhaul.test.ts`: **325 LOC** $\le 600$ LOC Living Test Suite.

---

## 4. KẾT QUẢ KIỂM THỬ & BẰNG CHỨNG THỰC TẾ

1. **Bộ kiểm thử hợp đồng nguyên tử mới (Contract Test Suite)**:
   - File: `tests/client/imp202_trade_modal_ergonomics_overhaul.test.ts`
   - Kết quả: **16/16 atomic tests PASS 100%** qua 5 khía cạnh hành vi (Boundary, Reactivity, Live Summary, Typography & Ergonomics).
2. **Kiểm thử hồi quy toàn bộ hệ thống đàm phán P2P (Full Regression Pass — 109/109 Tests PASS)**:
   - Lệnh xác minh trực tiếp: `npx vitest run tests/client/imp202_trade_modal_ergonomics_overhaul.test.ts tests/client/imp153_trade_modal_mobile_ergonomics.test.ts tests/client/imp154_trade_bot_intelligence_and_sentiment.test.ts tests/contracts/imp200_safe_off_turn_trade_and_ergonomics.test.ts tests/client/imp133_camera_sticky_focus_and_quick_build.test.ts`
   - Chi tiết 5 suites:
     - `tests/client/imp202_trade_modal_ergonomics_overhaul.test.ts`: **16 tests PASS**
     - `tests/client/imp153_trade_modal_mobile_ergonomics.test.ts`: **16 tests PASS**
     - `tests/client/imp154_trade_bot_intelligence_and_sentiment.test.ts`: **22 tests PASS**
     - `tests/contracts/imp200_safe_off_turn_trade_and_ergonomics.test.ts`: **28 tests PASS** *(Tệp hợp đồng P2P nằm tại thư mục `tests/contracts/`, không phải `tests/client/`)*
     - `tests/client/imp133_camera_sticky_focus_and_quick_build.test.ts`: **27 tests PASS** *(Suite hồi quy khóa góc nhìn camera & tương tác modal)*
     - **Tổng cộng: 109/109 tests PASS 100%**.
   - `npm run lint:ui`: **0 vi phạm** trên 192 tệp giao diện.
   - `npx tsc --noEmit`: **0 lỗi biên dịch** TypeScript.
3. **Phán quyết độc lập Trạm 3**:
   - `spec-reviewer`: **APPROVED (SPEC_PASS)** — 100% đúng kế hoạch, không scope drift, 0 nút ẩn dummy, đạt ngân sách LOC.
   - `ui-craft-reviewer`: **APPROVED (VERDICT SHIP)** — Sau khi đã fix trực tiếp 2 khuyết tật nhỏ P1 (sàn chữ 11px) và P2 (shadow nút Hủy), đáp ứng trọn vẹn tiêu chuẩn Impeccable UI/UX 2D.
4. **Ghi nhận bài học kinh nghiệm & Đóng băng thể chế**:
   - Gotcha **#286** đã được bổ sung vào `docs/domain/gotchas.md`.
   - Bổ sung 2 anti-patterns (`physical-horizontal-overflow`, `dummy-attribute-test-bypass`) vào `.agents/skills/impeccable/SKILL.md`.
   - Bổ sung 3 quy tắc phản biện vào `.agents/agents/plan-griller.md`.
   - Snapshot định lượng lưu trữ tại `.agents/evidence/imp202_snapshot.json` (đã kích hoạt `--run-contract` với `"executed": true`, `"status": "PASSED"`, `"passedCount": 16`).
