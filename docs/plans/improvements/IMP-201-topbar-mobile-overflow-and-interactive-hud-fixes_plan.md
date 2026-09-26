# KẾ HOẠCH KỸ THUẬT: IMP-201
# KHẮC PHỤC LỖI TRÀN TOPBAR MOBILE, VA CHẠM HUY HIỆU, TRỄ NHỊP HOẠT CẢNH QUÂN CỜ & CÔNG THÁI HỌC DANH SÁCH NGƯỜI CHƠI
*(Fix Mobile TopBar Overflow, Badge Collision, Pawn Stepping Toast Desync, and Player List HUD Ergonomics)*

> **Ticket ID**: IMP-201  
> **Trạng Thái**: DRAFTING (Chờ Plan Grilling & Phê Duyệt)  
> **Phạm Vi**: Nhóm 1 (Lỗi Bố Cục & Tràn Màn Hình) và Nhóm 3 (Lỗi Trải Nghiệm Tương Tác & Lệch Nhịp Hoạt Cảnh). Loại trừ Nhóm 2 theo chỉ đạo người dùng.  
> **Tiêu Chuẩn Áp Dụng**: Antigravity 2.0, Impeccable Craft, GEMINI.md Hard Constraints.

---

## 1. MỤC TIÊU & ĐỊNH HƯỚNG GIẢI PHÁP (SCOPE & APPROACH)

Dựa trên ảnh chụp thực tế màn hình Chrome di động (390px), xử lý triệt để 4 vấn đề kỹ thuật thuộc Nhóm 1 và Nhóm 3:

```
[Bố Cục Đỉnh TopBar] ──(Ẩn nút ☀️ trên mobile < 440px + Thu nhỏ padding)──> [Nút 🚪 Thoát Bàn Không Bị Xén Mép]
[Huy Hiệu Unread 95] ──(Neo top-0 right-0 + Thu nhỏ kích thước)──────────> [Triệt Tiêu Đè Lấn Nút Kế Bên]
[Quân Cờ Đang Nhảy]  ──(Trì hoãn addFloatingText theo duration nhảy)───────> [Toast Tiền Thuê Nổi Đúng Lúc Chạm Đất]
[Toast Tiền Thuê]    ──(pointer-events-auto + Thêm nút ✕ đóng nhanh)──────> [Giải Phóng Tầm Nhìn Bàn Cờ 3D]
[Nút Người Chơi 👥]  ──(Neo mép phải fixed right-0 dạng Edge Tab)─────────> [Tránh Bấm Nhầm Xoay Camera 3D]
```

### 1.1. Nhóm 1: Bố Cục & Tràn Màn Hình (P1 / Critical)
1. **Lỗi Tràn Mép & Xén Nút Thoát Bàn (`leave-room-button` 🚪)**:
   - *Nguyên nhân*: Capsule trái chiếm ~240px, cụm tiện ích phải kích hoạt nút Thời tiết `☀️` khi đạt `min-[390px]`, kéo tổng chiều rộng lên 410px > Màn hình 390px. Header `overflow-hidden` xén mất 50% nút `🚪`.
   - *Giải pháp*:
     - Nâng breakpoint hiển thị nút Thời tiết `☀️` từ `min-[390px]` lên `hidden min-[440px]:inline-flex sm:inline-flex`. Trên điện thoại di động (< 440px), ẩn nút tiện ích phụ này, giải phóng ngay 40px chiều ngang.
     - Tinh chỉnh padding capsule thông tin trận đấu: `px-2 min-[360px]:px-2.5 sm:px-4` (tiết kiệm thêm 8px).
2. **Lỗi Va Chạm Huy Hiệu Số Tin Chưa Đọc (`activity-unread-badge` 95)**:
   - *Nguyên nhân*: Badge đặt `-top-1 -right-1` với chiều rộng lớn đè lấn sang vạch ngăn cách và nút Thoát bàn.
   - *Giải pháp*: Neo badge về `top-0 right-0`, đặt kích thước trên mobile `h-3.5 min-w-[14px] text-[8px] font-black`, không vươn ra ngoài biên nút.

### 1.2. Nhóm 3: Trải Nghiệm Tương Tác & Lệch Nhịp Hoạt Cảnh (P2 / P3)
3. **Lỗi Lệch Nhịp: Toast Trừ Tiền Xuất Hiện Sớm Khi Quân Cờ Đang Bước Đi**:
   - *Nguyên nhân*: Delta mạng vừa đến là `dispatchActivityFloatingBadges` đẩy ngay badge vào store ở `t=0`, trong khi quân cờ 3D (`ActiveSpringPawn`) mất 1.0s - 1.8s để nhảy qua các ô.
   - *Giải pháp*: Trong `dispatchActivityFloatingBadges`, kiểm tra nếu `activePawnAnimation` đang hoạt động cho người chơi này (`activePawnAnimation.playerId === payerId`), trì hoãn việc kích hoạt `addFloatingText` bằng đúng thời gian nhảy còn lại (`remainingSteps * stepDuration`), để popup hiện lên đúng lúc quân cờ tiếp đất (Landing Impact).
4. **Toast Nổi Che Khuất Bàn Cờ 3D & Không Thể Đóng**:
   - *Nguyên nhân*: `FloatingBadge` khai báo `pointer-events-none`, không nhận click và không có nút đóng.
   - *Giải pháp*: Đổi thành `pointer-events-auto cursor-pointer`, cho phép click vào thẻ để đóng ngay, đồng thời thêm nút đóng nhỏ `✕` ở góc phải header (`aria-label="Đóng thông báo"`).
5. **Nút Danh Sách Người Chơi `👥` Bị Lạc Lõng & Cản Trở Xoay Camera**:
   - *Nguyên nhân*: Nằm lơ lửng giữa màn hình 3D, không có nhãn, đè đúng vùng ngón tay cái vuốt xoay camera.
   - *Giải pháp*: Chuyển thành dạng **Edge Tab (Thẻ Neo Mép Phải)**: `fixed top-28 sm:top-32 right-0 z-20 rounded-l-xl rounded-r-none border-2 border-r-0 shadow-[-2px_3px_0_0_#0f172a]`, hiển thị gọn gàng `👥 Bảng Điểm` khi thu gọn và `✕ Đóng` khi mở.

---

## 2. NGÂN SÁCH DÒNG CODE VẬT LÝ (PRE-CODING DELTA LOC)

| Tệp Mã Nguồn | Loại Tier | LOC Đĩa Thực | Delta Dự Kiến | LOC Sau Khi Sửa | Trần Giới Hạn | Trạng Thái |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `src/client/ui/top_bar.tsx` | Tier 2 | 212 | +2 | 214 | <= 500 LOC | ✅ An Toàn |
| `src/client/ui/floating_numbers.tsx` | Tier 2 | 253 | +18 | 271 | <= 500 LOC | ✅ An Toàn |
| `src/client/network/activity_badge_dispatcher.ts` | Tier 1 | 226 | +24 | 250 | <= 400 LOC | ✅ An Toàn |
| `src/client/ui/player_hud_list.tsx` | Tier 2 | 49 | +8 | 57 | <= 500 LOC | ✅ An Toàn |
| `src/client/ui/hud_container.tsx` | Tier 2 | 138 | 0 | 138 | <= 500 LOC | ✅ An Toàn |
| `tests/contracts/imp201_topbar_overflow_and_hud_fixes.test.ts` | Test | 0 | +320 | 320 | <= 600 LOC | ✅ An Toàn |

---

## 3. CHI TIẾT CÁC ĐOẠN MÃ TRIỂN KHAI (DROP-IN SNIPPETS)

### Task 1: Contract Tests (Station 1: QA RED)
Tạo mới tệp `tests/contracts/imp201_topbar_overflow_and_hud_fixes.test.ts` với tối thiểu 17 atomic tests bao phủ 5 Facets:
- **Facet 1 (TC-201.01..04)**: TopBar Responsive Layout & Zero Horizontal Clipping (Kiểm tra breakpoint `min-[440px]`, padding `px-2.5`, nút thoát bàn toàn vẹn, badge nép `right-0`).
- **Facet 2 (TC-201.05..08)**: FloatingBadge Interactive Dismissibility & Close Affordance (Kiểm tra `pointer-events-auto`, nút `✕`, click dismiss, bàn phím dismiss).
- **Facet 3 (TC-201.09..12)**: Pawn Movement & Floating Badge Timing Synchronization (Kiểm tra trì hoãn khi `activePawnAnimation` đang chạy, hiện ngay khi đứng yên).
- **Facet 4 (TC-201.13..15)**: Player HUD Collapsible Edge Tab & Viewport Anchoring (Kiểm tra `fixed right-0`, `rounded-l-xl rounded-r-none`, nhãn `Bảng Điểm`).
- **Facet 5 (TC-201.16..17)**: Anti-slop & LOC Tiers Compliance.

### Task 2: Triển Khai Mã Nguồn (Station 2: GREEN Implementation)

#### 1. `src/client/ui/top_bar.tsx`:
- **Tại dòng 84**: Tinh chỉnh padding capsule bên trái:
  ```tsx
  className="pointer-events-auto h-10 sm:h-11 flex items-center gap-1 min-[360px]:gap-1.5 sm:gap-3 md:gap-4 bg-[#FFFDF8] border-2 border-slate-900 rounded-xl sm:rounded-2xl px-2 min-[360px]:px-2.5 sm:px-4 shadow-[0_3px_0_0_#0f172a] text-slate-900 text-xs md:text-sm font-medium"
  ```
- **Tại dòng 148**: Nâng breakpoint nút đổi chu kỳ thời gian lên `min-[440px]`:
  ```tsx
  className="hidden min-[440px]:inline-flex sm:inline-flex relative w-8 h-8 min-h-[36px] min-w-[36px] sm:w-auto sm:h-8 sm:min-w-[36px] items-center justify-center gap-1.5 p-0 sm:px-3 rounded-lg sm:rounded-xl bg-[#F7F2E7] hover:bg-amber-100 text-slate-900 transition-colors cursor-pointer text-xs font-semibold border border-slate-900 shadow-[0_1.5px_0_0_#0f172a] sm:shadow-[0_2px_0_0_#0f172a] active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 after:absolute after:-inset-1.5 after:content-['']"
  ```
- **Tại dòng 182-187**: Neo badge số chưa đọc nép vào trong:
  ```tsx
  {unreadCount > 0 && (
    <span
      className="absolute -top-1 right-0 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-rose-600 px-0.5 text-[8px] font-black text-white shadow-md border border-slate-900 pointer-events-none"
      data-testid="activity-unread-badge"
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  )}
  ```

#### 2. `src/client/ui/floating_numbers.tsx`:
- **Tại dòng 134**: Mở khóa tương tác cho `FloatingBadge`:
  ```tsx
  const handleDismiss = () => {
    useGameStore.getState().removeFloatingText(item.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDismiss();
    }
  };

  return (
    <div
      role="status"
      tabIndex={0}
      aria-label={`${narrative.category}: nhấn để đóng`}
      aria-live="polite"
      data-testid="contextual-transaction-badge"
      onClick={handleDismiss}
      onKeyDown={handleKeyDown}
      className="pointer-events-auto cursor-pointer flex flex-col gap-1 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-2xl border-2 border-slate-900 bg-[#FFFDF8] select-none shadow-[0_3px_0_0_#0f172a] active:translate-y-0.5 active:shadow-none animate-in fade-in duration-200 w-full min-w-0 max-w-[82vw] sm:max-w-[340px]"
    >
      {/* Hàng 1: Header định danh danh mục kèm nút ✕ đóng */}
      <div className="flex items-center justify-between gap-1.5 border-b border-slate-200/80 pb-0.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm shrink-0" aria-hidden="true">{narrative.icon}</span>
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500 truncate">
            {narrative.category}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="text-slate-400 hover:text-slate-700 text-xs font-bold leading-none p-0.5 cursor-pointer focus-visible:outline-none"
          aria-label="Đóng thông báo"
        >
          ✕
        </button>
      </div>
  ```

#### 3. `src/client/network/activity_badge_dispatcher.ts`:
- **Đồng bộ hóa trễ nhịp hạ cánh quân cờ**:
  ```ts
  function getPawnLandingDelay(playerId?: string): number {
    if (!playerId) return 0;
    const anim = useGameStore.getState().activePawnAnimation;
    if (!anim || anim.playerId !== playerId || !anim.waypoints || anim.waypoints.length === 0) {
      return 0;
    }
    const remainingSteps = Math.max(1, anim.waypoints.length - (anim.currentIndex ?? 0));
    const stepDuration = anim.isBot ? 220 : 280;
    return remainingSteps * stepDuration;
  }

  function scheduleFloatingBadge(state: GameState, item: Parameters<GameState['addFloatingText']>[0], delayMs: number): void {
    if (delayMs <= 0) {
      state.addFloatingText(item);
    } else {
      setTimeout(() => {
        useGameStore.getState().addFloatingText(item);
      }, delayMs);
    }
  }
  ```
  Áp dụng `scheduleFloatingBadge` trong `handleRentBadge`, `handleBuyBadge`, `handleTaxBadge` để đồng bộ hoàn hảo với điểm tiếp đất của quân cờ.

#### 4. `src/client/ui/player_hud_list.tsx`:
- **Thiết kế Edge Tab neo cạnh mép phải**:
  ```tsx
  <button
    type="button"
    onClick={() => setIsCollapsed((prev) => !prev)}
    className="pointer-events-auto sm:hidden fixed top-28 sm:top-32 right-0 z-20 min-h-[38px] inline-flex items-center gap-1 px-2.5 py-1.5 rounded-l-xl rounded-r-none bg-[#FFFDF8] border-2 border-r-0 border-slate-900 shadow-[-2px_3px_0_0_#0f172a] text-slate-900 text-xs font-black active:translate-x-0.5 cursor-pointer"
    data-testid="toggle-player-hud-btn"
    aria-label={isCollapsed ? 'Mở bảng điểm người chơi' : 'Thu gọn bảng điểm người chơi'}
    title={isCollapsed ? 'Hiện bảng điểm' : 'Thu gọn'}
  >
    <span aria-hidden="true">{isCollapsed ? '👥' : '✕'}</span>
    <span className="text-[11px] font-extrabold">{isCollapsed ? 'Bảng Điểm' : 'Đóng'}</span>
  </button>
  ```

---

## 4. MA TRẬN BẢO VỆ 3 CHIỀU (3-WAY BLAST RADIUS AUDIT)

1. **Downstream Consumers**:
   - `TopBar`: Các test kiểm tra `leave-room-button` (IMP-199, IMP-126) tiếp tục PASS vì nút Thoát bàn được bảo toàn nguyên vẹn `data-testid` và kích thước.
   - `FloatingBadge`: `tests/contracts/imp194_natural_narrative_floating_badges.test.ts` kiểm tra `data-testid="contextual-transaction-badge"` và các câu văn tự nhiên được giữ nguyên 100%.
2. **Upstream Modifiers**:
   - Thẻ sự kiện thị trường `MarketEventTicker` và các đợt sốt đất không bị ảnh hưởng do phân tầng Z-index đã được chuẩn hóa (`TopBar` z-30, Edge Tab z-20).
3. **Exceptional Modes**:
   - Reconnect full-sync / Turn N+1: Trì hoãn `scheduleFloatingBadge` có fallback `delayMs <= 0` khi reconnect hoặc khi không có animation di chuyển, đảm bảo dữ liệu hiển thị tức thì không bị nuốt.

---

## 5. KẾT QUẢ NGHIỆM THU DỰ KIẾN (DEFINITION OF DONE)
1. 17/17 Contract Tests trong `imp201` PASS 100%.
2. Toàn bộ test suites của repo PASS 100% (`npm test`).
3. 0 vi phạm linter UI (`npm run lint:ui`).
4. 0 lỗi TypeScript (`npx tsc --noEmit`).
5. Chụp ảnh nghiệm thu mobile 390px/360px chứng minh:
   - Nút Thoát bàn `🚪` hiển thị toàn vẹn 100%, không bị xén mép.
   - Huy hiệu `95` không đè lấn nút kế bên.
   - Toast nổi có nút `✕` và đóng được khi click.
   - Nút `👥 Bảng Điểm` neo sát cạnh phải màn hình mượt mà.
