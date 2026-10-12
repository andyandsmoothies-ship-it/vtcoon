# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-372
## Plan IMP-372: Mobile UI Ergonomics, Player Card Density & Floating Toast De-escalation (Ticket IMP-372)

> **Mã Ticket:** `IMP-372`  
> **Phân hệ thực tế:** `client-ui`  
> **Ngày hoàn thành:** 2026-10-12  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

Khảo sát pháp y thực địa (`IOS_CHROME_GAMEPLAY_FORENSIC_REPORT.md`) đã phát hiện 3 khiếm khuyết hiển thị và công thái học nghiêm trọng trên màn hình di động (360px - 375px):
- **DEF-04 (Mật độ thẻ người chơi & Cắt cụt tên)**: Khung danh sách `PlayerHudList` (trước đây đề xuất bành trướng lên `w-48` = 192px) che lấp hơn 51% chiều ngang màn hình di động 360-375px. 4 thẻ người chơi cao tới ~350px che kín các ô đất từ ô 10 đến ô 20 và triệt tiêu cử chỉ vuốt camera của ngón tay cái bên phải. Đồng thời, tên người chơi bị cắt cụt thành 1 chữ cái ("L...") do cột phải nhồi nhét Tiền mặt + Huy hiệu Net Worth + Thẻ nợ thấu chi (~100px); kèm theo 112 chấm BĐS rỗng kết xuất đồng thời chiếm hơn 60% chiều cao thẻ.
- **DEF-05 (Vỡ bố cục Banner Sự Kiện & Casino)**: Thẻ thông báo mốc sự kiện thị trường (`MilestoneBanner`) với nội dung dài (như "Thí Điểm Casino") bị rớt dòng thành 4 dòng chữ, đè lấp khu vực điều khiển `ActionDock` và chắn tầm nhìn góc phải dưới của bàn cờ.
- **DEF-06 (Va chạm Toast & Lỗ hổng Mù Biến Động Tài Chính)**: Khoảng neo đáy `bottom-[calc(8rem...)]` chưa đủ độ thoáng đối với ActionDock cao 100px kèm safe area inset. Đặc biệt, nếu triệt tiêu toàn bộ toast tài chính (`displayItems = []`) khi banner sự kiện xuất hiện, người chơi sẽ hoàn toàn không nhìn thấy số tiền bị phạt trừ vì toast tự hủy trước khi banner kết thúc.

### Giải pháp 4 Đòn Bẩy Kiến Trúc Tối Thiểu:
1. **Kiềm tỏa diện tích bề ngang**: Giữ bề rộng HUD ở mức `w-44` (176px trên mobile, chiếm 48.8% < 50% màn hình 360px), bảo toàn > 50% không gian thao tác 3D.
2. **Giải phóng không gian cột tên**: Ẩn huy hiệu tổng tài sản trên mobile (`PlayerNetWorthBadge` gắn `hidden sm:inline-flex`), thu hồi ngay ~50px cho cột tên người chơi mà không cần nới rộng kích thước thẻ.
3. **Thu gọn cụm chấm BĐS rỗng**: Áp dụng `${!isCurrentTurn ? 'hidden sm:flex' : 'flex'}` để ẩn 28 chấm BĐS ở 3 người chơi không tới lượt, nén chiều cao danh sách HUD từ 350px xuống còn 188px (-46%).
4. **Chuẩn hóa thông báo & Bảo vệ biến động tài chính**: Chuyển tiêu đề `MilestoneBanner` sang `flex-nowrap`, mô tả `line-clamp-1 sm:line-clamp-2`, ẩn danh mục phụ trên mobile (`hidden sm:flex`); sửa điều kiện `isOlderWithBanner` duy trì chính xác 1 toast tài chính gần nhất dưới banner; nâng khoảng neo chân trang lên `bottom-[calc(8.5rem+env(safe-area-inset-bottom))]` (136px) triệt tiêu hoàn toàn va chạm đè lấn.

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-372.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-372.md) | Thẩm định kế hoạch đạt 0 defects, 6 contract tests clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/client/imp372_mobile_ergonomics_and_toast_deescalation.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp372_mobile_ergonomics_and_toast_deescalation.test.ts) | 12 atomic tests, 32 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/chaos_sentinel_IMP-372.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-372.json) | 4 production files modified, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-372.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-372.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-ui` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-372.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-372.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 2.67 | **APPROVED** 🛡️ |
| **Trạm 3.3: UI Craft & Ergonomics** | `main-agent`<br>[`.agents/audit/UI_CRAFT_REVIEW_IMP-372.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/UI_CRAFT_REVIEW_IMP-372.md) | Bounding box đo thực tế: Mobile HUD 176x188px, Desktop 256x444px | **APPROVED 🎨** |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 18/18 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Thẩm định kế hoạch đạt 0 defects, 6 contract tests clean.
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa**:
  - **[ADV-OBJ] Objective Validity & Syntax Hazard Attack**:
    - **Scenario**: Biến `isDesktop` không tồn tại trong scope component `FloatingNumbersOverlay` (chỉ có `isMobile`). Nếu áp dụng sẽ gây crash `tsc --noEmit`.
    - **Hardening Directive**: Loại bỏ hoàn toàn biểu thức phỏng đoán `!isDesktop`.
  - **[ADV-DOMAIN] Lỗ Hổng Triệt Tiêu Phản Hồi Tài Chính (Financial Toast Blackout)**:
    - **Scenario**: Khi người chơi rút thẻ Sự Kiện Thị Trường / Thẻ Cơ Hội bị phạt tiền (thời lượng banner 4500ms, toast tiền 2500ms), nếu gán `displayItems = []` trên mobile khi có `latestMilestone`, toast trừ tiền tự hủy trước khi banner tắt khiến người chơi không biết mình bị trừ tiền.
    - **Hardening Directive**: Loại bỏ `displayItems = []`, sửa `isOlderWithBanner = Boolean(latestMilestone) && displayItems.length > 1 && index === 0;` để duy trì chính xác 1 toast tài chính gần nhất hiển thị dưới banner.
  - **[ADV-ERGONOMICS] Che Phủ Bàn Cờ 3D Trên Màn Hình Nhỏ (w-48 Screen Occlusion)**:
    - **Scenario**: Tăng bề rộng `PlayerHudList` lên `w-48` (192px) chiếm 51.2% - 53.3% chiều ngang màn hình 360-375px, 4 thẻ cao 344px che kín ô đất 10-20 và nuốt trọn cử chỉ vuốt camera của ngón cái bên phải. Căn nguyên tên bị cụt là do cột phải nhồi nhét Tiền + NetWorth + Thấu chi (~100px).
    - **Hardening Directive**: Đặt `w-44` (176px). Ẩn `PlayerNetWorthBadge` trên mobile bằng `hidden sm:inline-flex` giải phóng ~50px cho cột tên mà không bành trướng lấn chiếm sa bàn 3D.
  - **[ADV-HOLLOW-FIX] Khi Khiến Khuyết DEF-04 và DEF-05 Chỉ Được Vá Bề Mặt**:
    - **Scenario**: 4 thẻ render 112 chấm BĐS rỗng chiếm 60% chiều cao; mô tả Thí Điểm Casino dài nguyên xi rớt thành 4 dòng đè ActionDock.
    - **Hardening Directive**: Áp dụng `hidden sm:flex` thu gọn 28 chấm cho người chưa tới lượt; chuyển header MilestoneBanner sang `flex-nowrap`, mô tả `line-clamp-1 sm:line-clamp-2` và ẩn danh mục phụ trên mobile (`hidden sm:flex`) tạo capsule 2 dòng thanh mảnh.
  - **[ADV-CODE-QUALITY] Logic Nhánh Thừa (Dead Ternary Branches) Trong `stackTopClass`**:
    - **Scenario**: Cả 4 nhánh `activeMarketCount` khi `activeModal === null` trên mobile đều trả về cùng một chuỗi `bottom-[calc(8.5rem...)]`, gây rối rắm logic.
    - **Hardening Directive**: Chuẩn hóa khoảng neo đáy `bottom-[calc(8.5rem+env(safe-area-inset-bottom))]` đồng nhất cho mobile.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/client/imp372_mobile_ergonomics_and_toast_deescalation.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp372_mobile_ergonomics_and_toast_deescalation.test.ts)
- **Chỉ số kiểm thử**: **12 atomic tests**, **32 asserts** (mật độ trung bình: 2.67 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (Thất bại do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.
  - **Bằng chứng thất bại (Failure Snippet)**:
```text
AssertionError: expected '<aside class="pointer-events-none flex flex-col gap-2 w-40 sm:w-48 md:w-64 max-w-[calc(100vw-8rem)] select-none items-end pt-1 sm:pt-0 relative z-20" aria-label="Danh sách người chơi">' to contain 'w-44'
 ❯ tests/client/imp372_mobile_ergonomics_and_toast_deescalation.test.ts:55:30
```

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi**:
  - [`src/client/ui/floating_numbers.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/floating_numbers.tsx)
  - [`src/client/ui/player_card.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/player_card.tsx)
  - [`src/client/ui/player_hud_list.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/player_hud_list.tsx)
  - [`src/client/ui/player_net_worth_badge.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/player_net_worth_badge.tsx)
- **Chuyển trạng thái**: Toàn bộ **12/12 contract tests chuyển sang GREEN**.
- **Living Test Suites**: Bảo toàn nguyên vẹn, zero hồi quy logic hiện hành (`imp187`, `imp238`, `imp359`, `imp237` pass 100%).

### Trạm 2.5: Fast Pre-Filter Mechanical Sweep (`scout` / `fast_prefilter.mjs`)
- **TypeScript**: `tsc --noEmit` vượt qua với 0 lỗi (Exit Code 0).
- **Dirty Casts**: Tuyệt đối không sử dụng `as any` hoặc dirty type casting across `src/**` and `tests/**`.
- **LOC Ceilings**: Tất cả các tệp đều nằm trong hạn mức trần của từng phân hệ (Tier 1 <= 400, Tier 2 <= 500, Tier 3 <= 800, Test <= 600).

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
1. **Spec & Scope Gatekeeper (`spec-reviewer`)**:
    - **Phán quyết**: **APPROVED** 📋
    - **Xác nhận phạm vi**: 100% các thay đổi nằm trong phân hệ mục tiêu (`client-ui`), zero scope creep.
2. **Deep Architecture & Anti-Slop Auditor (`code-reviewer`)**:
    - **Phán quyết**: **APPROVED** 🛡️
    - **Chỉ số Anti-Slop**: 0 violations trên 6 cờ cảnh báo (Deep modules, Zero pass-through wrappers, Zero TIDD).
    - **Bộ nhớ & Timer**: Không rò rỉ listener, không bỏ sót timer cleanup, an toàn đa luồng/bất đồng bộ.
3. **UI Craft & Ergonomics Auditor (`main-agent`)**:
    - **Phán quyết**: **APPROVED** 🎨
    - **Bằng chứng thị giác**: Đo đạc DOM thực tế trên Desktop (1280x800, HUD 256x444px) và Mobile (360x740, HUD 176x188px) xác thực việc giảm 46% footprint dọc mà không làm mất thông tin quan trọng.

### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: 18/18 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived; gồm 8 source-level AST mutants và 10 contract inversion probes).
- **Khả năng chịu lỗi kết nối**: Sống sót qua kiểm thử ngắt kết nối WebSocket đột ngột (live port 0 abrupt teardown).

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-372 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `floating_numbers.tsx` | [`src/client/ui/floating_numbers.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/floating_numbers.tsx) | Tier 2 (UI/3D/Views) | **338 SLOC** | 373 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `player_card.tsx` | [`src/client/ui/player_card.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/player_card.tsx) | Tier 2 (UI/3D/Views) | **374 SLOC** | 398 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `player_hud_list.tsx` | [`src/client/ui/player_hud_list.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/player_hud_list.tsx) | Tier 2 (UI/3D/Views) | **35 SLOC** | 38 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `player_net_worth_badge.tsx` | [`src/client/ui/player_net_worth_badge.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/player_net_worth_badge.tsx) | Tier 2 (UI/3D/Views) | **16 SLOC** | 18 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `imp372_mobile_ergonomics_and_toast_deescalation.test.ts` | [`tests/client/imp372_mobile_ergonomics_and_toast_deescalation.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp372_mobile_ergonomics_and_toast_deescalation.test.ts) | Living Test | **285 SLOC** | 300 Lines | <= 600 LOC | ✅ Đạt chuẩn |

---

## 5. ĐÁNH GIÁ VẬN HÀNH, PHÂN TÍCH RỦI RO KIẾN TRÚC & BÀN GIAO

### 5.1. Phân Tích Rủi Ro Kiến Trúc & Biên Độ An Toàn (Blast Radius & Boundary Analysis)
1. **Huy hiệu Nợ Thấu Chi (`Nợ {v}v`) Trên Viewport Hẹp 360px**:
   - *Rủi ro*: Khi người chơi kích hoạt cơ chế thấu chi với số vòng nợ lớn (ví dụ `Nợ 12v`), thẻ nợ chiếm thêm ~28px trong hàng tiêu đề của thẻ người chơi.
   - *Biện pháp kiểm soát*: Nhờ việc ẩn `PlayerNetWorthBadge` trên mobile giải phóng được ~50px, ngay cả khi thẻ nợ thấu chi xuất hiện, tên người chơi vẫn có tối thiểu 80px hiển thị (đủ cho 6-8 ký tự) trước khi bị `truncate`, ngăn ngừa tái diễn hiện tượng co cụt còn 1 ký tự ("L...").
2. **Thiết Bị Chiều Cao Thấp ($H \le 420\text{px}$ / Split-Screen Mobile)**:
   - *Rủi ro*: Trên các thiết bị chia đôi màn hình hoặc bàn phím ảo bật lên, cụm HUD có thể chạm vào đáy màn hình.
   - *Biện pháp kiểm soát*: Việc ẩn 28 chấm BĐS ở 3 người chơi không tới lượt đã ép chiều cao tổng cụm 4 thẻ từ 350px xuống 188px (giảm 46% footprint dọc thực tế theo bounding box `.agents/evidence/bounding_box_imp-372_mobile.json`), duy trì khoảng trống an toàn > 200px cho bàn cờ 3D và các modal tương tác.
3. **Hiển Thị Đồng Thời Toast Tài Chính & Banner Sự Kiện**:
   - *Rủi ro*: Hai thông báo nổi cùng xuất hiện có thể chồng lấn nếu tính toán tọa độ sai.
   - *Biện pháp kiểm soát*: `FloatingNumbersOverlay` neo cụm toast tại `bottom-[calc(8.5rem+env(safe-area-inset-bottom))]` (136px), và cơ chế `isOlderWithBanner` chỉ cho phép tối đa 1 thẻ giao dịch gần nhất hiển thị xếp dưới banner sự kiện theo luồng dọc `flex-col`, loại bỏ hoàn toàn nguy cơ che khuất hoặc nghẽn DOM.

### 5.2. Kết Luận Bàn Giao
- Toàn bộ 4 file mã nguồn và 1 file kiểm thử đã vượt qua 100% các cổng kiểm tra tự động: Typecheck, Linter, LOC Limits, Inversion RED-GREEN, AST Mutation Kill Rate (18/18), Dual-Viewport Headless Capture và kiểm toán cơ học đĩa vật lý.
- Sẵn sàng bàn giao và đóng gói production cho Ticket `IMP-372`.
