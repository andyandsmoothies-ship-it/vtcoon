# KẾ HOẠCH CẢI TIẾN: IMP-23
# BẢNG LOG HOẠT ĐỘNG HUD NỔI TRỰC TIẾP TRÊN MÀN HÌNH (ON-SCREEN HUD LIVE EVENT LOG)

> **Mã số cải tiến:** IMP-23  
> **Thuộc chu trình:** Continuous Improvement & Ad-hoc Persistence (Hiến pháp `GEMINI.md`)  
> **Mục tiêu:** Chuyển đổi bảng nhật ký sự kiện từ dạng ngăn kéo ẩn (off-screen drawer) sang Bảng HUD nổi bán trong suốt hiển thị trực tiếp trên màn hình theo thời gian thực (Real-time Live Ticker), bảo đảm người chơi theo dõi tức thì từng thao tác, xúc xắc, di chuyển và biến động tiền tệ mà không bị che khuất sa bàn 3D.  
> **Ngày lập kế hoạch:** 12/09/2026  
> **Trạng thái:** ĐÃ LẬP KẾ HOẠCH & CHỜ THỰC THI  

---

## 1. BỐI CẢNH & ĐỘNG LỰC CẢI TIẾN

### 1.1 Vấn Đề Thực Tế
1. Trong bản cải tiến `IMP-17`, bảng nhật ký hoạt động (`ActivityFeedSidebar.tsx`) được triển khai dưới dạng ngăn kéo trượt (Drawer) từ mép phải màn hình với trạng thái mặc định là đóng (`isActivityFeedOpen: false`).
2. Khi người chơi vào trận, toàn bộ màn hình không hiển thị bất kỳ dòng log nào. Người chơi phải tự bấm vào nút `[📜 Nhật Ký]` trên TopBar thì bảng mới mở ra.
3. Khi mở ra, Drawer chiếm toàn bộ chiều cao màn hình (`h-full`, rộng 384px), che khuất một phần bàn cờ 3D và các nút thao tác.
4. Người chơi yêu cầu: Mọi thao tác, xúc xắc, di chuyển, mua bán, nộp phạt của tất cả người chơi/Bot phải được **show trực tiếp ra màn hình** dưới dạng một bảng log thiết kế hợp lý, chuyên nghiệp như các tựa game thương mại.

---

## 2. THIẾT KẾ KIẾN TRÚC & GIAO DIỆN (UI/UX CRAFT)

### 2.1 Sơ Đồ Bố Cục Màn Hình Trận Đấu

```text
┌────────────────────────────────────────────────────────────────────────┐
│ [VÒNG 1/30]  [Thời gian]  [Kho bạc]                     [📜 Nhật Ký] [Thoát]│
├──────────────────────────────┬─────────────────────────────────────────┤
│                              │  ┌── BẢNG LOG HUD TRỰC TIẾP (Z-20) ─┐   │
│ [Thẻ P1]                     │  │ 📜 NHẬT KÝ VÁN ĐẤU (7)    [_] [✕] │   │
│ [Thẻ Bot 3]                  │  │ [Tất Cả] [Giao Dịch] [Nhà Đất]   │   │
│                              │  ├──────────────────────────────────┤   │
│                              │  │ • 🎲 P1 gieo [4, 1] (Tổng: 5)    │   │
│    [BÀN CỜ 3D Ở TRUNG TÂM]   │  │ • 🏃 P1 đến [Cảng Cái Mép]       │   │
│                              │  │ • 🏷️ P1 mua đất: -2.000 Tr.      │   │
│                              │  │ • 🎲 Bot 3 gieo [6, 2]           │   │
│                              │  │ • 💸 Bot 3 trả thuê P1: -500 Tr. │   │
│                              │  └──────────────────────────────────┘   │
├──────────────────────────────┴─────────────────────────────────────────┤
│                 [Đổ Xúc Xắc] [Quản Lý BĐS] [Đàm Phán]                  │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Các Trạng Thái Hiển Thị (Display Modes)

1. **Chế độ Mở Tiêu Chuẩn (Full On-Screen HUD Card - Mặc định khi vào game)**:
   - **Vị trí**: `fixed top-16 md:top-20 right-3 md:right-5 z-20 w-72 sm:w-80 md:w-84 max-h-[280px] md:max-h-[340px]`.
   - **Phong cách**: Glassmorphism cao cấp (`bg-slate-900/85 backdrop-blur-xl border border-amber-500/25 rounded-2xl shadow-2xl ring-1 ring-white/10`).
   - **Header**: Tiêu đề "📜 NHẬT KÝ VÁN ĐẤU", đếm số sự kiện, nút Thu gọn (`_`) và nút Đóng (`✕`).
   - **Filter Chips**: 3 nút lọc nhanh (`Tất Cả`, `Giao Dịch`, `Nhà Đất`).
   - **Event Feed List**: Danh sách cuộn mượt (smooth auto-scroll to bottom), mỗi dòng có icon sự kiện, tên người chơi (dot màu), tóm tắt hành động, biến động tiền tệ màu xanh (`+X Tr.`) hoặc đỏ (`-X Tr.`).

2. **Chế độ Thu Gọn (Minimized Micro-Ticker)**:
   - Khi bấm nút `_`: Bảng co lại thành thanh ticker mỏng 1 dòng ở góc phải (`h-10 px-3`), chỉ hiển thị icon và sự kiện mới nhất kèm nút mở rộng (`▲`).

3. **Chế độ Đóng Hoàn Toàn (Closed)**:
   - Khi bấm nút `✕`: Bảng ẩn đi. Nút `[📜 Nhật Ký]` trên `TopBar` hiển thị huy hiệu đỏ số lượng sự kiện mới chưa đọc. Click vào nút trên TopBar sẽ mở lại bảng HUD.

---

## 3. PHẠM VI CAN THIỆP MÃ NGUỒN

1. **`src/client/store/activity_store.ts`**:
   - Đặt `isActivityFeedOpen: true` làm mặc định để bảng log luôn xuất hiện sẵn sàng khi vào trận.
   - Thêm trạng thái `isMinimized: boolean` (mặc định `false`) và hàm `toggleMinimize()`.
2. **`src/client/ui/activity_feed_sidebar.tsx`**:
   - Tái cấu trúc kiểu dáng từ Full-height Drawer sang Floating On-Screen HUD Card.
   - Bổ sung thanh Micro-Ticker khi ở trạng thái `isMinimized`.
   - Giữ mã nguồn sạch, tuân thủ `npm run lint:ui` (0 anti-patterns), LOC <= 320 dòng.
3. **`tests/client/activity_feed_sidebar.test.ts` & `tests/client/activity_store.test.ts`**:
   - Cập nhật và bổ sung các bài kiểm thử contract test cho chế độ hiển thị nổi, thu gọn, mở rộng và lọc dữ liệu.

---

## 4. KẾ HOẠCH KIỂM CHỨNG & TIÊU CHÍ HOÀN THÀNH (DoD)

- [ ] `npm run lint:ui` = 0 lỗi anti-patterns.
- [ ] `npm run lint:slop` = 0 cảnh báo.
- [ ] `npx tsc --noEmit` = 0 lỗi kiểu TypeScript.
- [ ] Toàn bộ unit/contract tests của Activity Feed PASS 100%.
- [ ] Báo cáo nghiệm thu `docs/reports/improvements/IMP-23-on-screen-hud-live-event-log_report.md` được lập và cập nhật `docs/master_roadmap.md`.
