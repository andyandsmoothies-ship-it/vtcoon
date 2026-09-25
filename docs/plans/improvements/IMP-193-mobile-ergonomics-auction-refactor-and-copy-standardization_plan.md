# KẾ HOẠCH KỸ THUẬT IMP-193: TỐI ƯU CÔNG THÁI HỌC MOBILE, TINH GIẢN PHIẾU ĐẤU GIÁ & CHUẨN HÓA CÂU CHỮ TRẢI NGHIỆM

> **Mã cải tiến**: `IMP-193`  
> **Phạm vi**: Client UI, Server Turn Orchestrator, Event Cards Pacing, Financial Phrasing & Badges  
> **Tiêu chuẩn chất lượng**: Detroit TDD RED-GREEN-REFACTOR, Zero-Slop LOC Guard, Mobile 360px Ergonomics, Impeccable 2D Craft  
> **Trạng thái**: Đã tiếp thu 100% phản biện người dùng và kiểm toán đối kháng `plan-griller`

---

## 1. MỤC TIÊU & BỐI CẢNH KỸ THUẬT

Dựa trên dữ liệu thực nghiệm trực quan trên thiết bị di động thực tế (iOS / Safari) và phản hồi từ người dùng:
1. **Khắc phục lỗi padding nút Đổ Xúc Xắc & Chuẩn hóa toàn dock action**:
   - Nút Roll Dice (L239): Xung đột giữa bán kính cong `rounded-2xl` (16px) và padding ngang hẹp `px-3.5 min-[360px]:px-4.5` khiến chữ "Đổ" dính sát viền phải ➔ sửa thành `px-5 sm:px-6` và bổ sung `min-w-[28px] text-center` cho chữ "Đổ".
   - Chuẩn hóa đồng bộ 3 nút phụ còn lại: Các nút Quản Lý BĐS (L322), Đàm Phán (L335), Kết Thúc Lượt (L380) đang dùng `sm:px-4.5` ➔ chuẩn hóa thành `sm:px-4` đồng bộ với nút Quy Hoạch (L359).
2. **Khắc phục tràn mép 22 chấm BĐS ở PlayerCard**: Chiều rộng thẻ `w-40` chỉ có 136px không gian nội dung, trong khi 22 chấm + 14 gap nội bộ cần tối thiểu 142px ➔ chấm thứ 22 bị đẩy lòi ra ngoài lề và cắt cụt nửa vòng tròn.
   - *Khắc phục an toàn*: TUYỆT ĐỐI KHÔNG thêm `overflow-hidden` vào thẻ root cha của `PlayerCard` vì sẽ chặt đứt tab `[LƯỢT]` (`absolute -top-2.5 right-3`) và Emote Bubble (`absolute -top-6 -right-2`). Thay vào đó, thu nhỏ 22 chấm thành `w-1 h-1` (4px) + `gap-[1px]` ➔ co tổng chiều rộng về 102px (vừa khít trong 136px không gian khả dụng).
3. **Thu gọn Pop-up thông báo tài chính (Phân định rõ 2 vị trí trong `floating_numbers.tsx`)**:
   - Vị trí 1 (L274 - `FloatingBadge`): Sửa `max-w-[92vw] sm:max-w-none` thành `max-w-[82vw] sm:max-w-[340px]`.
   - Vị trí 2 (L366 - `FloatingNumbersOverlay container`): Sửa `w-full max-w-[92vw] md:max-w-md` thành `w-full max-w-[84vw] md:max-w-md` (giữ nguyên `md:max-w-md` cho desktop).
4. **Tinh giản Phiếu Đấu Giá (Auction Modal)**:
   - Loại bỏ mục đếm thừa thãi `0/3 Ô CỦA BẠN`.
   - Bỏ tên phân khu địa lý dài dòng (`DUYÊN HẢI ĐÔNG BẮC & ĐẢO`), thay bằng nhãn màu tinh gọn `Nhóm ${colorName}`.
   - Nới rộng `badgeMaxWidth` trong `AuctionModal` (L218) từ `max-w-[120px]` thành `max-w-[180px] sm:max-w-none` để huy hiệu `[TRANH CHẤP ĐỘC QUYỀN]` không bị cắt cụt.
   - Cân xứng thị giác danh sách người chơi (L304): Nới rộng player name từ `max-w-[120px]` thành `max-w-[100px] sm:max-w-[160px]`.
   - Sửa lỗi tên đất bị cắt cụt 1 dòng (`Quảng Ninh (Hạ Lo...`) và xoá bỏ khoảng trống chết: cho phép hiển thị 2 dòng `line-clamp-2` tự nhiên.
   - Làm rõ nhãn Biểu phí thuê thành `BIỂU PHÍ THUÊ Ô ĐẤU GIÁ` để không bị nhầm là cước của 3 ô đất riêng lẻ.
5. **Kéo dài thời lượng đọc thẻ sự kiện & Bot Pacing**:
   - Tăng `durationMs` hiển thị banner sự kiện từ 3.2s lên 4.8s trong `activity_tracker.ts`.
   - Thêm thời gian dừng tối thiểu trên server (`turn_orchestrator.ts`) khi Bot dừng tại ô Cơ Hội / Thị Trường (`room.lastEventCard`): Đặt guard ở cuối hàm `calculateBotStepDelay` (ngay trước `return baseDelayMs` cuối cùng), chỉ áp dụng khi `baseDelayMs > 500` để giữ an toàn cho fast tests.
6. **Chuẩn hóa hệ thống câu chữ giao dịch tài chính**: Súc tích, mạch lạc, phân định rõ dòng tiền giữa Người chơi - Ngân hàng - Kho Bạc; đồng bộ chuỗi tại cả nơi phát sinh (`activity_badge_dispatcher.ts`) và formatters (`floating_numbers.tsx`).

---

## 2. BẢNG TÍNH TOÁN NGÂN SÁCH LOC (PRE-CODING DELTA LOC)

| Tệp mục tiêu | TIER | Giới hạn LOC | Hiện tại | Delta dự kiến | Dự kiến sau chỉnh sửa | Đánh giá an toàn |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `src/client/ui/action_dock.tsx` | TIER 2 | Max 500 (Cảnh báo 400) | 398 | 0 | 398 | An toàn (thay thế class inline) |
| `src/client/ui/player_card.tsx` | TIER 2 | Max 500 (Cảnh báo 400) | 216 | 0 | 216 | An toàn (thay thế class dot inline) |
| `src/client/ui/floating_numbers.tsx` | TIER 2 | Max 500 (Cảnh báo 400) | 381 | +3 | 384 | An toàn (< 400 LOC) |
| `src/client/network/activity_badge_dispatcher.ts` | TIER 1 | Max 400 (Cảnh báo 300) | 229 | +2 | 231 | Rất an toàn (< 300 LOC) |
| `src/client/ui/modals/auction_modal.tsx` | TIER 2 | Max 500 (Cảnh báo 480) | 416 | -1 | 415 | An toàn (tinh giản prop & nới name) |
| `src/client/ui/modals/auction_district_card.tsx` | TIER 2 | Max 500 (Cảnh báo 400) | 211 | -8 | 203 | An toàn (tinh giản code thừa) |
| `src/client/network/activity_tracker.ts` | TIER 1 | Max 400 (Cảnh báo 300) | 326 | 0 | 326 | Giữ nguyên (chỉ đổi hằng số 3200 ➔ 4800) |
| `src/server/network/turn_orchestrator.ts` | TIER 1 | Max 400 (Cảnh báo 300) | 396 | +3 | 399 | An toàn <= 400 LOC (thêm 3 dòng guard) |

---

## 3. PRE-FLIGHT BLAST RADIUS AUDIT (MA TRẬN 3 TRỤC)

1. **Downstream Consumers**:
   - `action_dock.tsx`: Nút "Đổ" được kiểm thử trong hàng chục test suite UI; thay đổi padding và gap đối xứng phải bảo đảm `data-testid="roll-dice-btn"` và kích thước tối thiểu touch target >= 44px giữ nguyên. 3 nút phụ chuẩn hóa `sm:px-4` không ảnh hưởng logic.
   - `player_card.tsx`: Kích thước dot `w-1 h-1` (4px) trên mobile không làm ảnh hưởng đến `data-testid="dot-cell-${cell.index}"` và `data-testid="cluster-${group}"`.
   - `auction_district_card.tsx`: Xóa bỏ nhãn `X/N Ô CỦA BẠN` và tên phân khu dài yêu cầu reconcile 2 test cases cũ trong `tests/client/imp140_fuel_surge_and_auction_polish.test.ts` (`TC-IMP140.16` và `TC-IMP140.21`).
   - `activity_badge_dispatcher.ts` & `floating_numbers.tsx`: Thay đổi câu chữ đấu giá yêu cầu giữ từ khóa "Thắng đấu giá" để thỏa mãn regex của `tests/contracts/imp123_friendly_popups.test.ts` (`TC-IMP123.09`), đồng thời reconcile `tests/contracts/imp191_financial_flow_transparency_and_badge_clarity.test.ts` (`TC-191.14`) theo chuẩn mới.
2. **Upstream Environmental Modifiers**:
   - Khi có hiệu ứng thị trường `MC_LAND_FEVER` hoặc `MC_FREEZE_TRADE`, các chuỗi thông báo rút gọn trong `floating_numbers.tsx` vẫn phải phản ánh đúng bản chất dòng tiền và không bị tràn khung `max-w-[82vw]`.
3. **Exceptional Lifecycle Modes**:
   - Chuyển lượt Turn N+1: Các pop-up tài chính và thẻ sự kiện vẫn tuân thủ cơ chế tự hủy qua `durationMs` hoặc đóng thủ công, không để rò rỉ sang lượt kế tiếp.

---

## 4. CHI TIẾT CÁC TRẠM TRIỂN KHAI

### Trạm 1: Xây dựng hợp đồng kiểm thử (Station 1 - RED)
* Tệp: `tests/contracts/imp193_mobile_ergonomics_auction_and_copy_polish.test.ts`.
* Viết tối thiểu 16 atomic tests theo chuẩn 5-Facet Universal Matrix:
  - `[TC-193.01]` `ActionDock`: Nút Đổ có padding ngang chuẩn `px-5 sm:px-6` (không chứa `px-4.5`), text "Đổ" có `min-w-[28px] text-center` không bị ép sát mép bo cong.
  - `[TC-193.02]` `ActionDock`: 3 nút phụ (Quản Lý BĐS, Đàm Phán, Kết Thúc Lượt) chuẩn hóa dùng `sm:px-4` đồng bộ với Quy Hoạch.
  - `[TC-193.03]` `PlayerCard`: Hàng 22 chấm BĐS có kích thước `w-1 h-1` (4px) và `gap-[1px]` trên mobile, tổng bề ngang <= 105px; thẻ root KHÔNG chứa `overflow-hidden`.
  - `[TC-193.04]` `FloatingBadge`: Giới hạn chiều rộng container badge (L274) là `max-w-[82vw] sm:max-w-[340px]`.
  - `[TC-193.05]` `FloatingNumbersOverlay`: Hộp chứa overlay (L366) có `w-full max-w-[84vw] md:max-w-md`, bảo toàn chiều rộng desktop.
  - `[TC-193.06]` `AuctionDistrictCard`: Không còn render chuỗi `Ô CỦA BẠN` (đã được tinh giản).
  - `[TC-193.07]` `AuctionDistrictCard`: Tên phân khu dài dòng được tinh giản thành nhãn màu `Nhóm ${colorName}`.
  - `[TC-193.08]` `AuctionDistrictCard`: Chip ô đất hỗ trợ tên hiển thị 2 dòng `line-clamp-2` thay cho `truncate block`, không bị cắt cụt tên địa danh.
  - `[TC-193.09]` `AuctionDistrictCard`: Thanh cước thuê hiển thị rõ tiêu đề ngữ cảnh `BIỂU PHÍ THUÊ Ô ĐẤU GIÁ` chống hiểu lầm.
  - `[TC-193.10]` `AuctionModal`: Prop `badgeMaxWidth` nới rộng thành `max-w-[180px] sm:max-w-none`; player name chip (L304) nới rộng `max-w-[100px] sm:max-w-[160px]`.
  - `[TC-193.11]` `activity_tracker.ts`: Sự kiện rút thẻ Cơ Hội / Thị Trường phát sinh `durationMs: 4800` (thay vì 3200).
  - `[TC-193.12]` `TurnOrchestrator`: Guard `room.lastEventCard` nằm sau dice movement delay guard, đảm bảo độ trễ tối thiểu >= 2500ms khi `baseDelayMs > 500`.
  - `[TC-193.13]` `activity_badge_dispatcher.ts` & `floating_numbers.tsx`: Đồng bộ tiêu đề badge "Thắng đấu giá [Tên Ô] ➔ Nộp Kho Bạc".
  - `[TC-193.14]` `floating_numbers.tsx`: Formatters sinh văn bản súc tích theo bảng chuẩn hóa câu chữ mới (Thế chấp, Giải chấp, Bảo lãnh kiểm toán, Trả thuê, Thu thuê).
  - `[TC-193.15]` Kiểm tra 4 anti-patterns Impeccable (no border-accent-on-rounded, no bounce-easing, no gray-on-color, no gradient-text).
  - `[TC-193.16]` Ngân sách LOC: Tất cả các tệp đều nằm trong trần quy định.

### Trạm 2: Thi công mã nguồn (Station 2 - GREEN)
1. **Nhiệm vụ 2.1 (`action_dock.tsx`)**:
   - Nút Roll (L239): thay thế `px-3.5 min-[360px]:px-4.5 sm:px-5` bằng `px-5 sm:px-6`.
   - Bổ sung `min-w-[28px] text-center` cho nhãn "Đổ".
   - 3 nút phụ (L322, L335, L380): thay thế `sm:px-4.5` bằng `sm:px-4`.
2. **Nhiệm vụ 2.2 (`player_card.tsx`)**:
   - Sửa class của chấm ô đất: `w-1 h-1 sm:w-[5.5px] sm:h-[5.5px] md:w-2 md:h-2` và `gap-[1px] sm:gap-[1.5px]`.
   - Giữ nguyên không thêm `overflow-hidden` vào root.
3. **Nhiệm vụ 2.3 (`floating_numbers.tsx` & `activity_badge_dispatcher.ts`)**:
   - Sửa L274 (`FloatingBadge`): `max-w-[82vw] sm:max-w-[340px]`.
   - Sửa L366 (`FloatingNumbersOverlay`): `w-full max-w-[84vw] md:max-w-md`.
   - Đồng bộ tiêu đề badge tại cả `activity_badge_dispatcher.ts` và formatters trong `floating_numbers.tsx`:
     * Đấu giá: `Thắng đấu giá ${cellName} ➔ Nộp Kho Bạc`
     * Trả thuê: `Trả thuê ${cellName}${partner}`
     * Thu thuê: `Thu thuê ${cellName}${partner}`
     * Thế chấp: `Thế chấp ${cellName} ➔ Vay Ngân Hàng`
     * Giải chấp: `Giải chấp ${cellName} (Phí 10% ➔ Kho Bạc)`
     * Bảo lãnh: `Bảo lãnh kiểm toán (Ô 10) ➔ Nộp Kho Bạc`
     * Thuế: `Nộp ${cleanTitle} ➔ Kho Bạc`
4. **Nhiệm vụ 2.4 (`auction_district_card.tsx` & `auction_modal.tsx`)**:
   - Xóa bỏ thẻ `info.ownedByMeCount}/{info.totalCells} Ô CỦA BẠN`.
   - Thay `{info.districtName}` bằng nhãn màu `Nhóm ${colorName}`.
   - Nới rộng `badgeMaxWidth` trong `auction_modal.tsx` (L218) từ `max-w-[120px]` thành `max-w-[180px] sm:max-w-none`.
   - Nới rộng player name chip (L304) từ `max-w-[120px]` thành `max-w-[100px] sm:max-w-[160px]`.
   - Trong `renderCellChip`: sửa `truncate block` thành `line-clamp-2 leading-tight text-[11px] sm:text-xs`, xóa bỏ khoảng trống chết thừa thãi.
   - Trong thanh cước thuê: bổ sung tiêu đề rõ ràng `BIỂU PHÍ THUÊ Ô ĐẤU GIÁ`.
5. **Nhiệm vụ 2.5 (`activity_tracker.ts` & `turn_orchestrator.ts`)**:
   - Đổi `durationMs` khi bốc thẻ từ `3200` thành `4800`.
   - Trong `turn_orchestrator.ts`: thêm guard ngay trước `return baseDelayMs` cuối cùng (L42):
     ```ts
     if (room.lastEventCard && baseDelayMs > 500) {
       return Math.max(baseDelayMs, 2500);
     }
     ```
6. **Nhiệm vụ 2.6 (Reconcile Tests)**:
   - Cập nhật đúng đường dẫn: `tests/client/imp140_fuel_surge_and_auction_polish.test.ts`.
   - Cập nhật `tests/contracts/imp123_friendly_popups.test.ts` và `tests/contracts/imp191_financial_flow_transparency_and_badge_clarity.test.ts`.

### Trạm 2.5: Kiểm toán quét sâu (Sweeping Scout Audit)
- Gọi subagent `scout` quét toàn bộ các tệp vật lý vừa chỉnh sửa để rà soát 5 Universal Defect Archetypes.

### Trạm 3: Thẩm định độc lập (Independent Review)
- `spec-reviewer` và `ui-craft-reviewer` kiểm tra thực tế trên đĩa trước khi kết luận hoàn tất.
