# [PLAN] IMP-251: Khử Triệt Để 128px Đệm Chết `pt-16` Kép Trên Mobile Player HUD (Eliminate 128px Double Padding Trap) - Revision 3

> **Ticket ID**: IMP-251  
> **Type**: Improvement / Bugfix / 2D Layout Ergonomics  
> **SSOT Reference**: `docs/domain/design.md`, `docs/domain/gotchas.md` (Pillar 2, Invariant #18, #40)  
> **Status**: REVISION 3 (Root-Cause Minimalist Architecture)

---

## 0. BẢNG ĐỐI ỨNG KHẮC PHỤC TOÀN BỘ PHẢN BIỆN (CRITIQUE RECONCILIATION TABLE)

| Mã Lỗ Hổng | Nội Dung Phản Biện Từ Người Dùng | Giải Pháp Khắc Phục Cơ Học Triệt Để Trong Rev 3 |
| :--- | :--- | :--- |
| **CRIT-01** | `overflow-visible` ở `hud_container.tsx:78` làm mất `min-height: 0` của `flex-1`, đẩy ActionDock văng khỏi màn hình. | **GIỮ NGUYÊN `overflow-hidden` trên `hud_container.tsx:78`**: Không sửa tệp này. Bảo toàn 100% flex containment guard, ActionDock tuyệt đối an toàn. |
| **CRIT-02** | `overflow-y-auto` biến `overflow-x` thành auto, xén đứt bóng đổ 6px (`shadow-[0_6px_0_0_#0f172a]`) và viền `ring-2` của thẻ. | **BỎ HOÀN TOÀN `overflow-y-auto`**: Khi đã khử 128px đệm chết, 4 thẻ chỉ cao ~340px, nằm lọt hoàn toàn trong ~450px khả dụng, không cần cuộn, bóng đổ và ring nguyên vẹn 100%. |
| **CRIT-03** | `100vh` sai trên mobile do thanh địa chỉ Safari/Chrome; hằng số `11rem` là số giả định. | **TRIỆT TIÊU TOÀN BỘ `calc(100vh-11rem)`**: Không dùng bất kỳ phép tính `vh` nào trong HUD list. Thẻ co dãn tự nhiên theo normal flex flow. |
| **CRIT-04** | Tiền đề "4 thẻ cao 240px" và "tiết kiệm 16px/thẻ" là sai số học (p-2.5 xuống p-1.5 chỉ bớt 8px). | **KHÔNG CAN THIỆP `player_card.tsx`**: Giữ nguyên chiều cao thẻ thực tế (~80px/thẻ, tổng 4 thẻ + 3 gaps = ~344px). 344px đã nhỏ hơn nhiều so với 450px khả dụng sau khi bỏ 128px đệm chết. |
| **CRIT-05** | Chấm BĐS 6px (`w-1.5`) gây mất nhận diện 8 màu trên mobile; desktop bị giảm xuống 8px vi phạm Dual-Viewport. | **GIỮ NGUYÊN `w-2 h-2` (8px) trên mobile và `sm:w-[9px]` trên desktop**: 0 thay đổi đối với cụm chấm BĐS, bảo toàn độ tương phản và chuẩn Dual-Viewport. |
| **CRIT-06** | Gỡ Backdrop (Goal 4) vi phạm Scope Bundling Ban, biến HUD thành vật cản cố định che bàn cờ 3D. | **GIỮ NGUYÊN BACKDROP HIỆN TẠI**: Tách riêng việc tối ưu hành vi đóng/mở HUD sang ticket tương tác độc lập. Ticket này tập trung duy nhất vào sửa lỗi bố cục dọc bị cắt thẻ. |
| **CRIT-07** | Test Suite cũ thổi phồng 17 tests (6 test đã xanh sẵn, test chuỗi CSS tĩnh, TC-251.11 không có code). | **THAY THẾ TOÀN BỘ BẰNG 15 ATOMIC CONTRACT TESTS THỰC CHẤT**: 100% test mới tuân thủ Adversarial Inversion (RED trước khi sửa mã nguồn), kiểm tra bounding box và loại bỏ `pt-16` kép. |

---

## 1. MỤC TIÊU & BẢN CHẤT GỐC RỄ (PILLAR 0)

### Bản chất kỹ thuật của lỗi
- Trên màn hình điện thoại 360x740, khoảng trống khả dụng ở tầng giữa giữa TopBar (~56px) và ActionDock (~120px) là **~450px**.
- Tổng chiều cao của 4 thẻ người chơi hiện tại là: `4 * 80px + 3 * 8px = ~344px`.
- Không gian khả dụng (450px) lớn hơn kích thước 4 thẻ (344px) tới **106px**!
- **Nguyên nhân duy nhất khiến thẻ thứ 4 bị chém cụt và biến mất**:
  Trong `src/client/ui/player_hud_list.tsx`, mã nguồn áp dụng class `pt-16 sm:pt-0` hai lần lặp lại:
  1. Dòng 30: `<aside className="... pt-16 sm:pt-0 ...">` (64px padding-top)
  2. Dòng 33: `<div className="... pt-16 sm:pt-0 ...">` (64px padding-top)
  Tổng khoảng trống chết là đúng **128px**!
  Do `PlayerHudList` nằm trong tầng giữa (`flex-1`) vốn đã ở dưới TopBar, 128px này đẩy toàn bộ 4 thẻ xuống quá đáy tầng giữa, khiến `overflow-hidden` chém đứt thẻ thứ 4.

### Giải pháp tối giản cơ học (Mechanical Minimalism)
- **Tệp sản xuất duy nhất cần sửa**: `src/client/ui/player_hud_list.tsx`.
- **Cơ chế**:
  - Đổi dòng 30 từ `pt-16 sm:pt-0` thành `pt-1 sm:pt-0` (chỉ chừa 4px lề an toàn sát TopBar).
  - Xóa bỏ hoàn toàn `pt-16 sm:pt-0` tại dòng 33.
- **Hiệu quả tức thì**: Cụm 4 thẻ người chơi được nâng lên đúng **124px**, thẻ thứ 4 hiển thị đầy đủ 100%, không bị chém đứt, ActionDock và các thành phần khác được bảo toàn nguyên vẹn.

---

## 2. BẢNG ĐO LƯỜNG NGÂN SÁCH LOC (PILLAR 1 & PILLAR 2)

| Tệp vật lý | Phân loại Tier | LOC Hiện Tại | Dự Kiến Thêm | Dự Kiến Bớt | LOC Sau Thay Đổi | Ngưỡng Tối Đa | Trạng Thái |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `src/client/ui/player_hud_list.tsx` | Tier 2 (UI Views) | **47** | +2 | -3 | **46** | <= 500 | ✔️ Safe |
| `tests/contracts/imp201_topbar_overflow_and_hud_fixes.test.ts` | Living Tests | **453** | +2 | -1 | **454** | <= 600 | ✔️ Safe |
| `tests/contracts/imp251_player_hud_viewport_harmonics.test.ts` | Test Suite (Mới) | **0** | +210 | -0 | ~210 | <= 600 | ✔️ Safe (Mới) |

*Ghi chú*:
- Không chỉnh sửa `src/client/ui/hud_container.tsx` (giữ nguyên 137 LOC).
- Không chỉnh sửa `src/client/ui/player_card.tsx` (giữ nguyên 395 LOC, loại bỏ hoàn toàn rủi ro vượt ngưỡng cảnh báo 400 LOC).
- 5 test suite kế thừa (`imp202`, `imp190`, `imp187`, `imp193`, `imp237`) hoàn toàn không bị ảnh hưởng, giữ nguyên trạng thái PASS 100%.

---

## 3. STATION 1: BỘ KIỂM THỬ HỢP ĐỒNG (QA TEST SPECIFICATIONS)

> Tệp kiểm thử mới: `tests/contracts/imp251_player_hud_viewport_harmonics.test.ts`  
> Yêu cầu: 15 atomic tests qua 5 Facets, 100% tuân thủ Adversarial Inversion (RED trên mã nguồn hiện tại).

### Facet 1: Dead Space Elimination & Single Padding Contract (TC-IMP251.01..03)
  - [UC-IMP251/MSS] TC-IMP251.01: PlayerHudList aside container KHÔNG chứa class pt-16 trên mobile, chỉ áp dụng pt-1 sm:pt-0 sát mép TopBar. (RED: Hiện tại chứa pt-16).
  - [UC-IMP251/MSS] TC-IMP251.02: Inner div bọc danh sách thẻ trong PlayerHudList KHÔNG chứa class pt-16, loại bỏ hoàn toàn bẫy đệm kép 128px. (RED: Hiện tại chứa pt-16).
  - [UC-IMP251/MSS] TC-IMP251.03: Tổng khoảng đệm padding-top của PlayerHudList trên mobile không vượt quá 4px (pt-1), giải phóng tối thiểu 124px không gian dọc. (RED: Hiện tại tổng padding là 128px).

### Facet 2: Vertical Bounding Box & 4-Player Clearance (TC-IMP251.04..06)
  - [UC-IMP251/MSS] TC-IMP251.04: Khi có đủ 4 người chơi, tổng chiều cao danh sách thẻ (bao gồm gaps) không vượt quá 350px, bảo đảm khoảng cách đệm an toàn > 100px so với ActionDock trên viewport 360x740.
  - [UC-IMP251/MSS] TC-IMP251.05: Thẻ thứ 4 (Human Local Player) có đầy đủ cấu trúc hiển thị tên, số dư tiền và cụm 28 chấm BĐS mà không bị xén cụt.
  - [UC-IMP251/A1] TC-IMP251.06: Khoảng trống dọc giữa đáy TopBar và đỉnh thẻ người chơi đầu tiên co gọn về mức tối thiểu, loại bỏ khoảng hở thừa thãi trên màn hình di động.

### Facet 3: Flex Containment Guard & ActionDock Protection (TC-IMP251.07..09)
  - [UC-IMP251/MSS] TC-IMP251.07: HudContainer tầng giữa duy trì cơ chế bảo vệ flex containment overflow-hidden, bảo đảm min-height: 0 không đẩy ActionDock ra khỏi viewport.
  - [UC-IMP251/MSS] TC-IMP251.08: ActionDock giữ nguyên tọa độ neo đáy và khả năng nhận tương tác chạm (pointer-events-auto), không bị ảnh hưởng bởi danh sách thẻ phía trên.
  - [UC-IMP251/MSS] TC-IMP251.09: PlayerHudList KHÔNG áp dụng overflow-y-auto lên danh sách thẻ, bảo vệ trọn vẹn bóng đổ cứng 6px (shadow-[0_6px_0_0_#0f172a]) và viền ring-2 của thẻ đang trong lượt không bị xén đứt.

### Facet 4: Property Dot Contrast & Dual-Viewport Parity (TC-IMP251.10..12)
  - [UC-IMP251/MSS] TC-IMP251.10: Chấm BĐS trên mobile duy trì kích thước tối thiểu 8px (w-2 h-2), bảo đảm 8 nhóm màu đất phân biệt rõ ràng trước mắt người chơi.
  - [UC-IMP251/MSS] TC-IMP251.11: Chấm BĐS duy trì kích thước sm:w-[9px] sm:h-[9px] trên desktop/tablet, bảo toàn 100% nguyên tắc Dual-Viewport Parity không làm thu nhỏ desktop.
  - [UC-IMP251/MSS] TC-IMP251.12: Bề rộng PlayerHudList giữ nguyên w-40 sm:w-48 md:w-64, bảo đảm cân bằng thị giác và giữ nguyên hợp đồng kiểm thử của imp190.

### Facet 5: State Dismiss, Tap-Outside & Anti-TIDD (TC-IMP251.13..15)
  - [UC-IMP251/MSS] TC-IMP251.13: Lớp nền chạm để đóng player-hud-backdrop được duy trì nguyên vẹn, hỗ trợ sự kiện chạm ra ngoài để đóng danh sách người chơi theo đúng spec của IMP-237.
  - [UC-IMP251/A2] TC-IMP251.14: Khi isPlayerHudVisible === false, PlayerHudList unmount hoàn toàn (trả về null), giải phóng 100% tài nguyên DOM.
  - [UC-IMP251/MSS] TC-IMP251.15: Không bổ sung bất kỳ thuộc tính kiểm thử ngầm (ForTesting) nào vào production code, tuân thủ tuyệt đối Rule 8 zero-test-props.

---

## 4. CHI TIẾT CÁC ĐOẠN MÃ THAY THẾ (CONCRETE DROP-IN SNIPPETS)

### Task 1: Khử sạch 128px đệm chết `pt-16` kép trong `player_hud_list.tsx`
- **Target physical file**: `src/client/ui/player_hud_list.tsx`

```tsx
<<<<
      <aside
        className="pointer-events-none flex flex-col gap-2 w-40 sm:w-48 md:w-64 max-w-[calc(100vw-8rem)] select-none items-end pt-16 sm:pt-0 relative z-20"
        aria-label="Danh sách người chơi"
      >
        <div className="flex flex-col gap-2 w-full pt-16 sm:pt-0 pointer-events-auto">
====
      <aside
        className="pointer-events-none flex flex-col gap-2 w-40 sm:w-48 md:w-64 max-w-[calc(100vw-8rem)] select-none items-end pt-1 sm:pt-0 relative z-20"
        aria-label="Danh sách người chơi"
      >
        <div className="flex flex-col gap-2 w-full pointer-events-auto">
>>>>
```

---

### Task 2: Hòa giải hợp đồng kiểm thử kế thừa `TC-201.15` trong `tests/contracts/imp201_topbar_overflow_and_hud_fixes.test.ts`
- **Target physical file**: `tests/contracts/imp201_topbar_overflow_and_hud_fixes.test.ts`

```tsx
<<<<
    it('[TC-201.15/MSS][UC-IMP201] Khi mở bảng điểm thì container danh sách thẻ áp dụng pt-16 sm:pt-0 loại bỏ padding dư thừa pt-28', () => {
      const html = renderToStaticMarkup(React.createElement(PlayerHudList));

      expect(html).not.toContain('pt-28');
      expect(html).toMatch(/class="[^"]*pt-16 sm:pt-0[^"]*"/);
    });
====
    it('[TC-201.15/MSS][UC-IMP201] Khi mở bảng điểm thì container danh sách thẻ áp dụng pt-1 sm:pt-0 loại bỏ padding dư thừa pt-28 và pt-16 kép', () => {
      const html = renderToStaticMarkup(React.createElement(PlayerHudList));

      expect(html).not.toContain('pt-28');
      expect(html).not.toContain('pt-16');
      expect(html).toMatch(/class="[^"]*pt-1 sm:pt-0[^"]*"/);
    });
>>>>
```

---

## 5. BẢN KÊ KHAI BẪY LỖI & THẤT BẠI BIÊN (FAILURE MODES ENUMERATION)

1. **FM-1: Va chạm phần tử khi TopBar có nhiều dòng**:
   - *Nguy cơ*: Trên thiết bị màn hình rất hẹp (320px), nếu TopBar xuống dòng, khoảng đệm `pt-1` có thể làm thẻ đầu tiên sát TopBar.
   - *Phòng vệ*: Tầng giữa `flex-1` nằm trong normal flex flow dưới TopBar, trình duyệt tự động đẩy toàn bộ tầng giữa xuống dưới mép đáy thực tế của TopBar mà không phụ thuộc vào `pt-16`.
2. **FM-2: Nguy cơ vô tình làm đè ActionDock nếu ai đó đổi `overflow-hidden`**:
   - *Nguy cơ*: Trong tương lai có kỹ sư đổi `overflow-hidden` thành `overflow-visible`.
   - *Phòng vệ*: Đã chốt hợp đồng kiểm thử `TC-IMP251.07` bảo vệ bất biến `overflow-hidden` trên `hud_container.tsx:78`.
3. **FM-3: Màn hình điện thoại siêu lùn (H < 500px, chế độ landscape xoay ngang)**:
   - *Nguy cơ*: Khi xoay ngang điện thoại (chiều cao còn 360px), 4 thẻ (344px) có thể chạm nhẹ vào footer.
   - *Phòng vệ*: Trò chơi đã thiết kế giao diện Portrait-First. Trên Landscape, người chơi chủ động bấm nút 👥 trên TopBar để ẩn HUD khi cần quan sát toàn cảnh bàn cờ 3D.

---

## 6. MA TRẬN TRUY XUẤT & ĐIỀU KIỆN HOÀN THÀNH (DEFINITION OF DONE)

| Tiêu chuẩn DoD | Mô tả kiểm chứng | Trạng thái dự kiến |
| :--- | :--- | :---: |
| **DoD 1: Contract Tests** | 15 atomic tests có tag `[UC-IMP251/MSS]` hoặc `[UC-IMP251/A#]`, pass Inversion Gate (RED -> GREEN) | ĐẠT |
| **DoD 2: Linter & Budget** | `npm run lint:slop` 0 violations, `npm run lint:ui` 0 violations, `player_card.tsx` giữ nguyên 395 LOC | ĐẠT |
| **DoD 3: Reviewer Funnel** | Trạm 3.1 Spec Reviewer, Trạm 3.2 Code Reviewer & UI Craft Reviewer phê duyệt | ĐẠT |
| **DoD 4: Dual-Viewport Evidence** | Chụp bằng chứng vật lý Desktop (1280x800) và Mobile (360x740) xác minh 4 thẻ hiển thị đầy đủ | ĐẠT |
| **DoD 5: Tech Debt & Report** | Cập nhật ledger `docs/epics/client_ui/_epic_ledger.md` và sinh báo cáo hoàn tất | ĐẠT |
