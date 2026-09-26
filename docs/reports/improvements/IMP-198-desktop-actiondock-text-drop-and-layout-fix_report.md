# BÁO CÁO NGHIỆM THU KỸ THUẬT: IMP-198
## KHẮC PHỤC LỖI TỤT CHỮ ACTIONDOCK & ĐỒNG BỘ LAYOUT NÚT BẤM DESKTOP (FIX DESKTOP ACTIONDOCK TEXT DROP AND RESPONSIVE BUTTON LAYOUT)

> **Ticket:** IMP-198  
> **Trạng thái:** COMPLETED / SHIP  
> **Phân loại:** Tier 2 (Full Rigor — 3 Trạm Tự Hành & Sweeping Scout Audit)  
> **Thị trường mục tiêu:** Việt Nam (Giao diện, ngôn ngữ hiển thị tiếng Việt)

---

### 1. TỔNG QUAN HIỆN TRẠNG & NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE)

Xuất phát từ phản ánh của người dùng: *"gần đây tôi có nhiều update liên quan UI UX ở trang bàn chơi game, nhưng có vẻ tinh chỉnh đang tập trung vào mobile nên khi tôi mở bằng web desktop thì lỗi tụt text trong các button như ảnh đính kèm"* (đối chiếu ảnh chụp thực tế `media_1790390153734.jpg`).

Qua khảo sát đĩa vật lý và phân tích DOM bounding-box, đã phát hiện **bẫy CSS 4 tầng (4-Tier CSS Trap)**:
1. **Tầng 1 (Bóp nghẹt chiều rộng container cha - Ancestor Max-Width Bottleneck)**:
   - Tại `src/client/ui/hud_container.tsx#L92`, khối bọc ngoài ActionDock khai báo `sm:max-w-md` (448px). Khi ActionDock mở rộng trên desktop hiển thị đầy đủ 5 nút (~730px), container cha 448px bóp nghẹt các nút bấm con, buộc trình duyệt bẻ dòng các nhãn chữ.
2. **Tầng 2 (Khóa cứng chiều cao mobile - Mobile Height Lock Trap)**:
   - Tại `src/client/ui/action_dock.tsx#L321, 334, 358, 379`, 4 nút phụ (`Quản Lý BĐS`, `Đàm Phán`, `Quy Hoạch`, `Hết Lượt`) mang class `h-11` (44px cố định trên mobile). Khi lên màn hình desktop (`sm:`), nhãn chữ tiếng Việt được kích hoạt (`hidden sm:inline`) kèm padding `sm:py-2.5`, nhưng thiếu `sm:h-auto` để mở khóa chiều cao, khiến flex-container đẩy toàn bộ dòng chữ tụt xuống viền đáy hoặc tràn ra ngoài nút.
3. **Tầng 3 (Thiếu bảo vệ co cụm & ngắt dòng - Lack of Anti-Wrap & Shrink Protection)**:
   - Các nút phụ thiếu cặp thuộc tính `whitespace-nowrap` và `shrink-0`, khiến từ ngữ bị bẻ đôi thành 2 hàng khi container cha bị nén.
4. **Tầng 4 (Xung đột đè lấn thông báo nổi - 183px Notice vs Trade Strip Collision)**:
   - Chip thông báo nổi `actionDockNotice` (nhịp độ bot hoặc cảnh báo kiểm toán) hiển thị đồng thời khi có đề xuất giao dịch bot `InlineBotTradeStrip`, gây đè lấn 183px theo phương dọc.

---

### 2. KẾT QUẢ ĐẠT ĐƯỢC

1. **Hiển thị nút bấm Desktop & Laptop 1 dòng hoàn mỹ (Zero Text Drop)**:
   - Toàn bộ các nút trên ActionDock (`Đổ Xúc Xắc`, `Mua Đất`, `Bảo Lãnh`, `Quản Lý BĐS`, `Đàm Phán`, `Quy Hoạch`, `Hết Lượt`) hiển thị chữ và icon nằm ngang trên cùng một dòng đơn, padding thở tự nhiên, baseline đồng đều tuyệt đối.
2. **Giải phóng kích thước Container cha**:
   - `hud_container.tsx#L92` gỡ bỏ hoàn toàn `sm:max-w-md`, chuyển sang `w-full sm:w-auto max-w-[96vw] sm:max-w-none sm:min-w-0`.
   - `TelemetryBadge` tại `hud_container.tsx#L87` trang bị `shrink-0` bảo vệ toàn vẹn hiển thị góc trái.
   - `InlineBotTradeStrip` tại `bot_trade_offer_strip.tsx#L134` đóng gói độc lập `sm:max-w-md`.
3. **Triệt tiêu đè lấn 183px với Bot Trade Strip**:
   - `action_dock.tsx` bổ sung cờ tự mô tả `isTradeStripActive = Boolean(pendingTradeOffer && pendingTradeOffer.sellerId === actingPlayerId)`. Khi bot gửi đề xuất giao dịch, chip thông báo `actionDockNotice` tức thì ẩn đi, không còn đè lấn lên strip giao dịch.
4. **Bảo tồn trọn vẹn công thái học Mobile (360px & 390px)**:
   - Trên mobile hẹp: 4 nút phụ tự động thu gọn dạng icon-only vuông bo góc (`w-11 h-11 min-w-[44px] min-h-[44px]`), nút chính 'Đổ'/'Mua' gọn gàng. Đạt chuẩn WCAG 2.5.5 touch target size, 0 pixel tràn ngang trên màn hình 360px.
5. **Thiết quân luật LOC Tier 1 & Không Slop**:
   - `action_dock.tsx`: Giữ vững chính xác **397 LOC** (nằm an toàn dưới trần nghiêm ngặt **400 LOC**, tuân thủ living test `imp193#L431`).
   - `hud_container.tsx`: **121 LOC** (trần 500 LOC).
   - `bot_trade_offer_strip.tsx`: **208 LOC** (trần 500 LOC).

---

### 3. QUY TRÌNH 3 TRẠM (STATION PIPELINE EXECUTION)

```
[Kế Hoạch & Plan-Griller] ➔ [Trạm 1: QA RED (17 tests)] ➔ [Trạm 2: GREEN Implementation] ➔ [Trạm 2.5: Sweeping Scout (CLEAN)] ➔ [Trạm 3: Reviewers (APPROVED)]
```

#### Trạm 1: Contract Testing (QA RED)
- Tạo tệp test hợp đồng: [`tests/contracts/imp198_desktop_actiondock_layout.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp198_desktop_actiondock_layout.test.ts).
- Khởi tạo 17 atomic tests phủ 5 Facets; thực thi Adversarial Inversion (chứng minh Inversion Gate: 14 failed, 3 passed đúng với các lý do nghiệp vụ mới).

#### Trạm 2: Feature Implementation (GREEN)
- Triển khai tối thiểu tại:
  - [`src/client/ui/hud_container.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/hud_container.tsx) (L87 `shrink-0`, L92 `sm:max-w-none sm:min-w-0`).
  - [`src/client/ui/modals/bot_trade_offer_strip.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/bot_trade_offer_strip.tsx) (L134 `sm:max-w-md`).
  - [`src/client/ui/action_dock.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/action_dock.tsx) (selector `pendingTradeOffer` 1-statement-per-line, `isTradeStripActive`, `sm:h-auto shrink-0 whitespace-nowrap` trên tất cả các nút).
- Kết quả kiểm thử: **17/17 tests contract PASS**, **18/18 living ceiling tests PASS**, **329/329 test suites PASS**, `npm run lint:ui` **0 vi phạm**, `npx tsc --noEmit` **0 lỗi**.

#### Trạm 2.5: Sweeping Scout Audit
- Quét 100% tệp đĩa vật lý qua 5 Universal Defect Archetypes.
- Xác nhận: 0 stale closure, 0 unhandled async, 0 memory leak, 0 dirty cast (`any`), 0 dead code.
- Kết luận: **CLEAN (100% SẴN SÀNG CHO TRẠM 3)**.

#### Trạm 3: Independent Review & Disk Verification
- `spec-reviewer`: **APPROVED** — Đối soát 100% dòng mã với đặc tả và các phản biện P1-P5.
- `code-reviewer`: **APPROVED** — Xác nhận clean code, SRP, Zero Slop, ngân sách LOC tuân thủ (397/400 LOC).
- `ui-craft-reviewer`: **APPROVED / SHIP** — Thẩm định thị giác qua `view_file` trên toàn bộ 6 ảnh UAT thực tế, xác nhận xóa bỏ hoàn toàn lỗi tụt chữ và đạt chuẩn Impeccable 2D Craft.

---

### 4. BẰNG CHỨNG THỊ GIÁC (VISUAL TARGET SPOT-INSPECTION)

Đã chụp và kiểm định trực tiếp trên đĩa thông qua Microsoft Edge CDP:

| STT | Tệp Ảnh Thực Nghiệm | Viewport | Nội Dung Kiểm Định Thị Giác | Kết Quả |
| :-: | :--- | :---: | :--- | :---: |
| 1 | [`imp198_01_desktop_1920_actiondock.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/screenshots/imp198/imp198_01_desktop_1920_actiondock.jpg) | 1920x1080 | ActionDock với nút Mua Đất vàng kim + 4 nút phụ, chữ và icon nằm ngang trên 1 dòng đơn, không tụt chữ | ✔️ **HOÀN HẢO** |
| 2 | [`imp198_02_desktop_1920_roll_actiondock.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/screenshots/imp198/imp198_02_desktop_1920_roll_actiondock.jpg) | 1920x1080 | ActionDock với nút Đổ Xúc Xắc đỏ san hô + 4 nút phụ, baseline đồng trục tuyệt đối | ✔️ **HOÀN HẢO** |
| 3 | [`imp198_03_laptop_1280_actiondock.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/screenshots/imp198/imp198_03_laptop_1280_actiondock.jpg) | 1280x800 | Viewport Laptop, ActionDock mở rộng tự nhiên, Telemetry góc trái không đè lấn | ✔️ **HOÀN HẢO** |
| 4 | [`imp198_04_tablet_768_actiondock.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/screenshots/imp198/imp198_04_tablet_768_actiondock.jpg) | 768x1024 | Viewport Tablet, cuộn ngang mượt mà `overflow-x-auto`, nhãn chữ hiển thị đầy đủ | ✔️ **HOÀN HẢO** |
| 5 | [`imp198_05_mobile_390_actiondock.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/screenshots/imp198/imp198_05_mobile_390_actiondock.jpg) | 390x844 | Viewport iPhone, nút phụ thu gọn icon-only vuông 44px, nút Đổ gọn gàng | ✔️ **HOÀN HẢO** |
| 6 | [`imp198_06_mobile_360_actiondock.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/screenshots/imp198/imp198_06_mobile_360_actiondock.jpg) | 360x780 | Viewport Android 360px cực hẹp, 0 pixel tràn viền ngang, touch target >= 44px | ✔️ **HOÀN HẢO** |

---

### 5. ACTIVE MEMORY & GOTCHAS PERSISTENCE

- Đã ghi nhận bài học kinh nghiệm sâu sắc vào [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md):
  - **Gotcha #276**: *[UI/CRAFT] Bất Biến Giải Phóng Bóp Nghẹt Container, Mở Khóa Chiều Cao Tự Nhiên & Chống Tụt Chữ Nút Bấm Đa Nền Tảng (Desktop ActionDock Text Drop Prevention & Responsive Button Layout Invariant)*.
    - Bẫy thực tế: Khóa cứng `h-11` trên mobile không giải phóng bằng `sm:h-auto`; `sm:max-w-md` của container cha bóp nghẹt dock desktop; đè lấn 183px giữa notice chip và bot trade strip.
    - Quan sát Scout: Thiết quân luật LOC `action_dock.tsx` <= 400 LOC, bảo toàn 397 LOC qua 1-statement-per-line và dọn dòng trống thừa.
    - Bất biến đã xác minh: `Responsive Button Dual-Lock Invariant` (`sm:w-auto sm:h-auto shrink-0 whitespace-nowrap`), `Unconstrained Ancestor Viewport Invariant`, `Zero-Collision Notice Suppression Invariant`.
