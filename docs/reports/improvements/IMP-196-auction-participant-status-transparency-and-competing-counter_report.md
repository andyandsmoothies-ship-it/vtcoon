# BÁO CÁO HOÀN THÀNH CẢI TIẾN: IMP-196
## MINH BẠCH NGƯỜI THAM GIA ĐẤU GIÁ & BỘ ĐẾM ĐẠI GIA CẠNH TRANH THỜI GIAN THỰC (AUCTION PARTICIPANT STATUS TRANSPARENCY & COMPETING HEADCOUNT COUNTER)

> **Mã cải tiến**: `IMP-196`  
> **Phân loại**: Tier 2 (Full Rigor)  
> **Trạng thái**: ✅ **HOÀN THÀNH (SHIPPED)**  
> **Ngày hoàn thành**: 2026-09-26  

---

### 1. TỔNG QUAN KẾT QUẢ THỰC HIỆN

Vé cải tiến `IMP-196` đã giải quyết triệt để vấn đề phản hồi từ người dùng: *"Trong đấu giá, nếu ai rút lui cũng cần có trạng thái ghi chú, hãy phân tích"*:

1. **Minh bạch hóa 100% trạng thái người tham gia sàn đấu giá**:
   - Khi người chơi hoặc bot bấm Rút lui / Bỏ qua lượt đấu giá (`onPass`), dòng thông tin người chơi được gắn huy hiệu trung tính `[✕ Rút lui]` (`bg-slate-200 text-slate-600 border-slate-300`), tên bị gạch ngang (`line-through text-slate-400`), và làm mờ nhẹ (`opacity-60`).
   - Phân biệt rõ ràng người từ chối mua ban đầu `[🚫 Bỏ qua]` (`bg-amber-100 text-amber-800 border-amber-300`) và con nợ bị phát mãi tài sản cưỡng chế `[⚖️ Phát mãi]` (`bg-rose-100 text-rose-700 border-rose-200`).
   - Người chơi đang trả giá cao nhất luôn giữ huy hiệu ưu tiên cao nhất `👑 Dẫn đầu` (`bg-amber-100 text-amber-700 border-amber-300 font-black`).

2. **Bộ đếm đại gia cạnh tranh thời gian thực (Real-time Competing Counter)**:
   - Header danh sách cập nhật trực quan: `ĐẠI GIA THAM GIA ({competingCount}/{activePlayers.length})`.
   - `competingCount` chỉ tính những người chơi còn khả năng và quyền hạn đấu thầu (chưa pass, không phải con nợ phát mãi, không phải người từ chối mua ban đầu).
   - Ví dụ: Bàn 4 người chơi, 1 người pass, 1 người declined ➔ Hiển thị ngay `(2/4)`.

3. **Bảo vệ bất biến phiên đấu giá & Ngăn chặn rò rỉ trạng thái (Session Isolation)**:
   - Trong `src/client/network/apply_delta.ts`, bổ sung guard `isSameAuction = prevPayload?.cellIndex === delta.auction.cellIndex && !prevPayload?.isConcluded`.
   - Ngăn chặn triệt để lỗi rò rỉ `hasPassed: true` từ phiên đấu giá ô đất trước sang phiên đấu giá ô đất mới kế tiếp.

4. **Công thái học Mobile 360px & Tránh xén cụt Badge**:
   - Khắc phục lỗi huy hiệu `⚠️ PHÁT MÃI CƯỠNG CHẾ (-30%)` bị chật hẹp và xén cụt trên màn hình 360x740.
   - Sử dụng cơ chế Responsive Text Clamping: `<span className="sm:hidden">⚠️ PHÁT MÃI</span>` và `<span className="hidden sm:inline">⚠️ PHÁT MÃI CƯỠNG CHẾ (-30%)</span>`, đảm bảo không đè nút đóng `[✕]`.

5. **Hợp nhất Header BĐS Tinh Gọn (Unified Hero Header & Zero-Scroll Tabletop)**:
   - Xóa bỏ triệt để dòng tiêu đề thừa `SÀN ĐẤU GIÁ TRỰC TUYẾN / LIVE TABLETOP ARENA` và huy hiệu `ĐANG MỞ`.
   - Tích hợp vạch màu BĐS, Tên BĐS to rõ (`h2`), Giá khởi điểm / Phát mãi, Badge khẩn cấp và Nút đóng `[✕]` (`min-w-[44px] min-h-[44px]`) vào một hàng Hero Header duy nhất.
   - Giải phóng **~45px - 50px chiều cao màn hình**, giúp toàn bộ bục đấu giá, bảng phí thuê, danh sách đại gia và cụm nút cược nhanh hiển thị toàn vẹn trong viewport di động 360x740 mà không cần vuốt cuộn (Zero-Scroll Tabletop).

---

### 2. BẢNG KIỂM SOÁT NGÂN SÁCH LOC (TIER AUDIT)

| Tệp mã nguồn | TIER | Giới hạn LOC | Thực tế | Trạng thái |
| :--- | :---: | :---: | :---: | :---: |
| `src/client/network/apply_delta.ts` | TIER 1 | Max 300 LOC | 244 | ✅ Đạt chuẩn (< 300 LOC) |
| `src/client/ui/modals/modal_host.tsx` | TIER 2 | Max 480 LOC | 448 | ✅ Đạt chuẩn (< 480 LOC) |
| `src/client/ui/modals/auction_modal.tsx` | TIER 2 | Max 480 LOC | 437 | ✅ Tinh gọn 13 dòng (< 480 LOC) |
| `tests/client/imp196_auction_passed_players_transparency.test.ts` | Test Suite | Max 600 LOC | 506 | ✅ Đạt chuẩn (< 600 LOC) |

---

### 3. QUY TRÌNH 3 TRẠM & BẰNG CHỨNG KIỂM CHỨNG

1. **Trạm 1 (RED Contract Tests)**:
   - Tệp test: [`tests/client/imp196_auction_passed_players_transparency.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp196_auction_passed_players_transparency.test.ts).
   - 22 atomic tests bao phủ 6 facets: Boundary, Counter, Props Lifecycle, Actor Inversion, Transient Teardown, LOC Budget.
   - Đã chứng minh thất bại trước (17 RED / 5 PASS).

2. **Trạm 2 (GREEN Implementation)**:
   - Hoàn thành triển khai tối thiểu trên 3 tệp client core.
   - Vượt qua toàn bộ 22/22 tests PASS 100%.
   - Sửa dứt điểm xung đột định dạng `' Tr.'` trên các living test suites, toàn bộ 16 suites (308 tests) đạt GREEN.
   - `npm run build` PASS (Vite client + SSR server).
   - `npm run lint:ui` PASS (0 anti-patterns across 185 files).

3. **Trạm 2.5 (Sweeping Scout Audit)**:
   - Subagent `scout` quét 8 tệp vật lý, xác nhận sạch 100% trên cả 5 universal defect archetypes.

4. **Trạm 3 (Thẩm định UI Craft & Ảnh CDP)**:
   - Chụp 5 ảnh kiểm chứng bằng CDP Edge:
     * `imp196_auction_mobile_360_active.jpg` (Mobile 360x740)
     * `imp196_auction_mobile_390_active.jpg` (Mobile 390x844)
     * `imp196_auction_desktop_active.jpg` (Desktop 1280x800)
     * `imp196_auction_mobile_360_foreclosure.jpg` (Mobile 360x740)
     * `imp196_auction_desktop_foreclosure.jpg` (Desktop 1280x800)
   - `ui-craft-reviewer` kiểm tra pixel thực tế qua `view_file` ➔ Phán quyết: **VERDICT: SHIP!**

5. **Ghi nhận Domain Memory**:
   - Đã ghi nhận **Gotcha #274** vào [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) và cập nhật Domain Index cho các danh mục `[FSM/RULE]` và `[UI/CRAFT]`.
