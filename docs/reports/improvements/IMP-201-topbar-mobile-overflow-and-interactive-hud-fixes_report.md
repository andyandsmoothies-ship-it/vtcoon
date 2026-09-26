# BÁO CÁO NGHIỆM THU CẢI TIẾN IMP-201 (IMPROVEMENT REPORT)

**TICKET ID:** IMP-201  
**TIÊU ĐỀ:** Khắc Phục Lỗi Tràn TopBar Mobile, Va Chạm Huy Hiệu, Trễ Nhịp Hoạt Cảnh Quân Cờ & Công Thái Học Danh Sách Người Chơi  
**PHẠM VI ĐÃ PHÊ DUYỆT:** Nghiêm ngặt triển khai Nhóm 1 (Bố Cục & Tràn Màn Hình) và Nhóm 3 (Tương Tác & Lệch Nhịp Hoạt Cảnh). Tuyệt đối loại trừ Nhóm 2 (Đơn Vị Tiền Tệ & Typography) theo chỉ đạo của người dùng.  
**TRẠNG THÁI:** HOÀN TẤT (STATION 3 APPROVED)  
**NGÀY:** 26/09/2026  

---

## 1. TỔNG QUAN VẤN ĐỀ & MỤC TIÊU XỬ LÝ (TỪ ẢNH THỰC TẾ `media_1790417288917.png`)

Từ ảnh chụp màn hình thực tế trên thiết bị di động của người dùng, 4 khiếm khuyết cơ bản thuộc Nhóm 1 và Nhóm 3 đã được định danh và xử lý triệt để:
1. **[Nhóm 1 - Lỗi 1 (P1)] Nút Thoát Bàn 🚪 Bị Xén Cụt**: Trên màn hình di động hẹp (360px - 390px), cụm tiện ích TopBar bị tràn chiều ngang, khiến nút Thoát bàn bị đẩy ra ngoài cạnh phải màn hình và xén cụt ~50%.
2. **[Nhóm 1 - Lỗi 2 (P2)] Huy Hiệu Unread 95 Đè Lấn Nút Thoát Bàn**: Huy hiệu đếm số chưa đọc định vị tuyệt đối vươn ra ngoài (`-top-1.5 -right-1`) đè lấn lên thân nút Thoát bàn kế bên.
3. **[Nhóm 3 - Lỗi 7 (P2)] Lệch Nhịp Hoạt Cảnh Quân Cờ & Toast Tài Chính**: Toast giao dịch tiền mặt (`FloatingBadge`) xuất hiện ngay tức thì khi nhận delta, trong khi quân cờ 3D vẫn đang bước nhảy trên đường đi, phá vỡ tính nhân quả thời gian.
4. **[Nhóm 3 - Lỗi 8 (P2)] Toast Thông Báo Bay Không Thể Đóng Nhanh**: Lớp phủ thông báo bị khóa `pointer-events-none`, không có affordance đóng nhanh hoặc nút `✕`.
5. **[Nhóm 3 - Lỗi 9 (P3)] Nút Danh Sách Người Chơi Cản Trở Bàn Cờ**: Nút toggle kiểu pill lơ lửng chiếm dụng diện tích thị giác, khi mở rộng che lấp thẻ người chơi đầu tiên ("Đại Gia Sài Gòn" / huy hiệu `LƯỢT`).

---

## 2. KIẾN TRÚC & GIẢI PHÁP TRIỂN KHAI THỰC TẾ

### 2.1. TopBar Mobile Zero-Overflow Architecture (`src/client/ui/top_bar.tsx`)
- Nâng breakpoint hiển thị nút chuyển thời tiết từ `min-[360px]` lên `hidden min-[440px]:inline-flex sm:inline-flex`, giải phóng 40px chiều ngang quý giá cho thiết bị di động.
- Áp dụng padding linh hoạt `px-2 min-[360px]:px-2.5 sm:px-4` cho `match-info-capsule`, tạo khoảng thở an toàn > 16px giữa hai cụm capsule.
- Thu hẹp tọa độ huy hiệu unread về `-top-1 right-0` với kích thước `h-3.5 min-w-[14px] text-[8px] font-black`, bao bọc viền `border border-slate-900` sắc nét, triệt tiêu va chạm hoàn toàn.
- Nút Thoát bàn `leave-room-button` 🚪 hiển thị toàn vẹn 100% trên cả 360px và 390px.

### 2.2. Interactive & Dismissible Contextual Floating Badges (`src/client/ui/floating_numbers.tsx`)
- Chuyển đổi container toast sang `pointer-events-auto cursor-pointer`, bổ sung nhãn trợ năng `aria-label` và `role="status"`.
- Thêm nút đóng `✕` tại góc trên phải với `aria-label="Đóng thông báo"`, kèm cơ chế `e.stopPropagation()` và hàm xóa `removeFloatingText(item.id)`.
- Hỗ trợ đầy đủ phím tắt bàn phím (`Enter` / `Space`) cho người chơi sử dụng bàn phím rời hoặc trợ năng.

### 2.3. Pawn Movement & Bilateral Financial Timing Synchronization (`src/client/network/activity_badge_dispatcher.ts`)
- Xây dựng hàm chuẩn hóa `getPawnLandingDelay(playerId)`:
  - Nếu có `pendingPawnMove`: tính toán độ trễ dựa trên thời gian xúc xắc dừng (`diceDelay = 1200ms` khi `isRolling`) cộng với thời gian di chuyển từng bước chuẩn SSOT (`HOP_DURATION + LANDING_DURATION = 230ms` cho người chơi, `BOT_STEP_DURATION = 200ms` cho bot).
  - Nếu có `activePawnAnimation`: tính toán theo số bước còn lại.
  - Fallback an toàn về `0ms` khi kết nối lại hoặc không có di chuyển.
- Bọc toàn bộ các hàm kích hoạt huy hiệu đáp đất (`handleRentBadge`, `handleBuyBadge`, `handleTaxBadge`) trong `scheduleAction` với delay tiếp đất.
- Trong `handleRentBadge`, cả bên trả tiền (`payerId`), bên nhận tiền (`receiverId`), hiệu ứng VFX (`triggerPawnReaction`) và âm thanh (`SoundEngine`) đều được đồng bộ chính xác tại khoảnh khắc quân cờ chạm đất.
- Quản lý tập hợp timer `pendingBadgeTimers = new Set<ReturnType<typeof setTimeout>>()`. Triệt tiêu hoàn toàn rò rỉ timer sang Turn N+1 hoặc ván mới qua `clearPendingBadgeTimers()` tích hợp trong `resetGameState()` (`game_store.ts`).

### 2.4. Collapsible Edge Tab & Viewport Anchoring (`src/client/ui/player_hud_list.tsx`)
- Chuyển đổi nút toggle thành Edge Tab neo sát mép phải màn hình `fixed top-28 sm:top-32 right-0 z-20 min-h-[38px] rounded-l-xl rounded-r-none`, đổ bóng xúc giác âm `shadow-[-2px_3px_0_0_#0f172a]`.
- Nhãn nút hiển thị trực quan ngữ cảnh: `👥 Ẩn Đóng` khi mở và `👥 Hiện Bảng Điểm` khi thu gọn.
- Bổ sung khoảng đệm đỉnh `pt-28 sm:pt-0` cho container danh sách người chơi khi mở rộng, giải phóng hoàn toàn vùng không gian góc trên phải của Thẻ 1 ("Đại Gia Sài Gòn"), huy hiệu vàng `LƯỢT` hiển thị trọn vẹn 100%.

---

## 3. THIẾT QUÂN LUẬT NGÂN SÁCH DÒNG CODE (LOC TIER AUDIT)

Tất cả các tệp sửa đổi đều tuân thủ nghiêm ngặt các hạn mức LOC của dự án:
- `player_hud_list.tsx`: **48 LOC** $\le 55$ LOC (Khóa cứng bởi `TC-190.16`).
- `activity_badge_dispatcher.ts`: **233 LOC** $\le 250$ LOC (Khóa cứng bởi `TC-191.16`).
- `top_bar.tsx`: **212 LOC** $\le 220$ LOC (TC-190.16) & $\le 500$ LOC Tier 2.
- `floating_numbers.tsx`: **280 LOC** $\le 390$ LOC (TC-191.16) & $\le 500$ LOC Tier 2.
- `game_store.ts`: **397 LOC** $\le 550$ LOC Tier 1 Logic.
- `imp201_topbar_overflow_and_hud_fixes.test.ts`: **453 LOC** $\le 600$ LOC Living Test Suite.

---

## 4. KẾT QUẢ KIỂM THỬ & BẰNG CHỨNG THỰC TẾ

1. **Kiểm thử hợp đồng nguyên tử (Contract Test Suite)**:
   - File: `tests/contracts/imp201_topbar_overflow_and_hud_fixes.test.ts`
   - Kết quả: **20/20 PASS 100%** across 5 behavioral facets.
2. **Kiểm thử toàn bộ hệ thống (Full Regression Pass)**:
   - `npm test`: **340 passed suites (340), 6792 passed tests (6792), 0 failed**.
   - `imp190` & `imp191` living contract suites: **PASS 100%**.
   - `npx tsc --noEmit`: **0 type errors**.
   - `npm run lint:ui`: **0 violations** (4 anti-patterns: `border-accent-on-rounded`, `bounce-easing`, `gray-on-color`, `gradient-text`).
3. **Ảnh chụp nghiệm thu thực tế qua CDP**:
   - `docs/reports/uat/screenshots/imp201/imp201_01_mobile_390_topbar_and_toast.jpg`: Mobile 390px TopBar nguyên vẹn, toast có nút ✕.
   - `docs/reports/uat/screenshots/imp201/imp201_02_mobile_390_expanded_player_hud.jpg`: Edge Tab và danh sách người chơi có padding đệm `pt-28`.
   - `docs/reports/uat/screenshots/imp201/imp201_03_mobile_360_topbar_tight.jpg`: Màn hình siêu hẹp 360px thở tự nhiên, không rớt dòng.
   - `docs/reports/uat/screenshots/imp201/imp201_04_desktop_1920_overview.jpg`: Khung nhìn Desktop sắc nét, nhãn tiện ích đầy đủ.
4. **Phán quyết độc lập Trạm 3**:
   - `spec-reviewer`: **APPROVED** (100% SSOT Reconciliation & Scope Confinement).
   - `code-reviewer`: **APPROVED** (0 dirty casts, 0 timer leaks, SSOT hằng số chuyển động).
   - `ui-craft-reviewer`: **APPROVED (disposition: ship)** (0 lỗi vật lý P1-P8, Impeccable Craft).
