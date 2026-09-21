# Kế Hoạch IMP-151: Đại Tu UI/UX Sa Bàn Quy Hoạch Đô Thị & Radar 8 Phân Khu Độc Quyền (Urban Masterplan & District Monopoly Radar UI/UX Tactile Overhaul)

> **Mục tiêu:** Xóa bỏ hoàn toàn hội chứng "Bảng Quản Trị Hành Chính" (Administrative Dashboard Syndrome) trên modal Bản Đồ Quy Hoạch Đô Thị; chuyển hóa toàn diện giao diện sang phong cách **Tập Hồ Sơ Địa Ốc Xúc Giác (Tactile Real Estate Portfolio)** ấm cúng, sang trọng, thân thiện và đậm chất board game tỷ phú cao cấp.  
> **Căn cứ phản hồi người dùng:** Ảnh chụp thực tế trên iPhone (`media_1789978047202.png` ➔ `media_1789978059838.png`), tiêu chuẩn thiết kế Impeccable (Antigravity 2.0), `docs/domain/design.md`.  
> **Kiểm toán độc lập (Plan Grilling):** Đã qua kiểm toán đối kháng tại [`.agents/audit/PLAN_AUDIT_IMP-151_MASTERPLAN_UI_UX.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-151_MASTERPLAN_UI_UX.md). Đã khắc phục 6 điểm mù kỹ thuật.  
> **Phân loại:** Tier 2 (Full Rigor - Quy trình 3 Trạm có kiểm toán độc lập Plan Grilling).

---

## 1. Bóc Tách 5 Điểm Nghẽn UI/UX & Cảm Xúc Người Dùng

Từ 4 ảnh chụp thực tế trên iPhone của người dùng:
1. **Quá tải viền đen hộp-chồng-hộp (Wireframe Box Overload)**: Có tới 4 tầng viền đen dày cộp (`border-2 border-slate-900`, `border-2 border-slate-800`, `border border-slate-700`). Màn hình bị chia cắt vụn vặt, tạo cảm giác ngột ngạt như đang điền tờ khai địa chính.
2. **Ma trận nút bấm cộc lốc lặp lại (`[👁️]` và `[🤝]`)**: Ở mỗi dòng BĐS, bên phải luôn có 2 nút vuông nhỏ xếp dọc thẳng hàng (hơn 16 nút trên 1 màn hình), cộc lốc không nhãn, gây nhiễu thị giác và tạo cảm giác bảng tính admin CRUD.
3. **Màu nền ô đất loang lổ lem nhem (Color Tint Patchwork)**: Dùng `${owner.tokenColor}18` làm màu nền thô khiến mỗi ô trong 1 phân khu có 1 màu nhạt khác nhau, làm vỡ tính thống nhất của phân khu đô thị.
4. **Ký hiệu và con số gây bối rối (`1/3  1/3  1/3` & icon `🔒` đứng trơ trọi)**: Người chơi không hiểu `1/3 1/3 1/3` là gì nếu không đọc kỹ; icon ổ khóa `🔒` đứng lơ lửng không có nhãn giải thích gây hiểu lầm là ô bị khóa tính năng.
5. **Bảng màu xám lạnh (Slate Gray) lệch tông với thế giới Đảo Nắng**: Dùng quá nhiều màu xám công sở (`bg-slate-100`, `bg-slate-200`, `border-slate-800`), xa rời bảng màu kem ngà, vàng cát, thảm nhung sang trọng của trò chơi.

---

## 2. Kiến Trúc Thiết Kế Mới: Tập Hồ Sơ Địa Ốc Xúc Giác

```
                     ┌────────────────────────────────────────────────────────┐
                     │          TẬP HỒ SƠ ĐỊA ỐC QUY HOẠCH ĐÔ THỊ (IMP-151)   │
                     └──────────────────────────┬─────────────────────────────┘
                                                │
         ┌───────────────────────┬──────────────┴───────────────┬───────────────────────┐
         ▼                       ▼                              ▼                       ▼
   [Trụ Cột 1]             [Trụ Cột 2]                    [Trụ Cột 3]             [Trụ Cột 4]
 Khung Thẻ Kem Ngà       Thanh Tiến Độ Slot             Dòng BĐS Chạm 1-Chạm    Huy Hiệu Trạng Thái
   Xúc Giác Nổi Khối       Pills Xếp Cách Nhau            Kèm Owner Pill Tinh Tế   Ngôn Ngữ Tự Nhiên
• Viền hổ phách ấm      • Các pips bo tròn             • Nền trắng ngà đồng     • `👑 Độc Quyền • [Tên]`
  `border-2 border-       `rounded-full` cách nhau       nhất, viền nhận diện   • `⚡ Sắp Độc Quyền • 2/3`
  amber-950/20`           `gap-1.5`                      tinh tế `tokenColor`   • `⚔️ Đang Tranh Chấp`
• Ruy-băng màu phân khu • Màu token rực rỡ             • Chạm cả dòng lướt 3D   • `🌱 Còn Đất Trống`
  dày 4px ở đỉnh card     cho ô đã mua                 • Chống Event Bubbling   • Nhãn `🔒 Thế Chấp` rõ nghĩa
• Đổ bóng tactile đậm nét• Vạch đứt cho ô trống           `e.stopPropagation()` • Bảo toàn chuỗi "2/3"
  `shadow-[0_8px_0_0_     `data-vacant="true"`           cho nút [🤝] và [👁️]     cho TC-132.09
  #0f172a]` (TC-132.18)                                  trên mobile 360px
```

---

## 3. Khắc Phục 6 Điểm Mù Từ Báo Cáo Kiểm Toán Plan Grilling

Theo kết quả kiểm toán [`.agents/audit/PLAN_AUDIT_IMP-151_MASTERPLAN_UI_UX.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-151_MASTERPLAN_UI_UX.md):
1. **Bảo tồn Regex Box-Shadow TC-132.18**: Modal Shell kết hợp khung bo cong `rounded-3xl` kem ngà và bóng đổ tactile mực đậm `shadow-[0_8px_0_0_#0f172a]` (hoàn toàn thỏa mãn regex `/shadow-\[0_\d+px_0_0_#\w+\]/` và `/border-2|border-slate/`).
2. **Bảo tồn Chuỗi Phân Số "2/3" TC-132.09 & TC-IMP137.06**: Huy hiệu near-monopoly hiển thị `⚡ Sắp Độc Quyền ({leadingPlayer.avatar ?? '👤'} {leadingCount}/{totalCells})` (rút gọn tên trên mobile bằng `hidden sm:inline`), bảo đảm chuỗi `'2/3'` luôn hiện diện trong DOM.
3. **Bảo tồn Thuộc Tính Style Chứa tokenColor TC-137.09**: Thẻ `district-cell-{cellIndex}` giữ `style={owner ? { backgroundColor: `${owner.tokenColor}0a`, borderColor: `${owner.tokenColor}40` } : undefined}`, bảo toàn màu sắc cho regex test mà không làm loang lổ nền thẻ.
4. **Triệt tiêu Lỗi UI Linter `gray-on-color`**: Đổi các token `text-slate-950` trên nền `bg-amber-500` thành `text-amber-950` chuẩn Impeccable Design System, bảo đảm 0 vi phạm `npm run lint:ui`.
5. **Ngân Sách 360px Mobile Chống Tràn**: Trên mobile (< 640px), nút `[🤝]` giữ dạng icon vuông bo tròn tactile `min-h-[36px] min-w-[36px]` kèm `title` (chỉ hiện nhãn chữ khi ở desktop `hidden md:inline`). Huy hiệu phân khu co giãn linh hoạt, không vỡ layout 292px hữu dụng.
6. **Triệt tiêu Event Bubbling**: Gán `onClick` vào hàng BĐS cha (thẻ `div role="button"`), đồng thời thêm `e.stopPropagation()` vào 2 nút con `[👁️]` và `[🤝]`. Ngăn ngừa tuyệt đối lỗi nhấp nút gạ đổi làm văng/đóng modal.

---

## 4. Chi Tiết Thay Đổi Mã Nguồn (Proposed Changes)

#### [MODIFY] [masterplan_modal.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/masterplan_modal.tsx)
- **Vỏ ngoài Modal (Modal Shell)**:
  - Khung bo tròn kem ngà ấm áp:
    `bg-[#FFFDF9] border-2 border-slate-900 rounded-3xl shadow-[0_8px_0_0_#0f172a,0_16px_36px_rgba(15,23,42,0.18)]`.
- **Header Modal**:
  - Nền kem dịu `#FBF8F1`, viền mờ `border-b border-amber-900/10`.
  - Icon 🗺️ huy hiệu nổi; tiêu đề font-black sang trọng; badge số lượng `Đã bán X/28 BĐS` trực quan.
- **Thanh Điều Hướng Tab (Tab Navigation)**:
  - Capsule Pill Switcher bo tròn `rounded-2xl bg-amber-950/5 p-1 border border-amber-900/10`.
  - Tab active: `bg-slate-900 text-amber-300 shadow-[0_2px_8px_rgba(15,23,42,0.25)] border border-slate-700/50`.
  - Tab inactive: `text-slate-600 hover:text-slate-900 font-bold`.
- **Thanh Lọc Tab (Filter Bar)**:
  - Cuộn ngang mượt mà `overflow-x-auto no-scrollbar py-1 gap-2`.
  - Các nút lọc bo tròn `rounded-xl min-h-[38px] px-3.5`:
    * Active: Nền vàng hổ phách `bg-amber-500 text-amber-950 font-black shadow-[0_2px_8px_rgba(245,158,11,0.35)]` (tuân thủ `gray-on-color`).
    * Inactive: Nền trắng ngà `bg-white/90 text-slate-700 border border-amber-900/15 hover:bg-amber-50/60`.

#### [MODIFY] [masterplan_components.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/masterplan_components.tsx)
- **Thẻ Phân Khu (`MasterplanDistrictCard`)**:
  - Cấu trúc mới: `bg-white rounded-2xl border border-amber-900/15 shadow-[0_4px_16px_rgba(15,23,42,0.04)] overflow-hidden transition-all`.
  - **Đỉnh Card**: Dải ruy-băng nhận diện phân khu `h-1.5 w-full` với `backgroundColor: district.hexColor`.
  - **Header Card**:
    * Tên phân khu to rõ `text-sm sm:text-base font-black text-slate-900`.
    * Huy hiệu trạng thái:
      - Độc quyền: `👑 Độc Quyền ({monopolyPlayer.name})` (`bg-amber-100 text-amber-950 border border-amber-300 font-black rounded-full px-2.5 py-0.5`).
      - Sắp độc quyền: `⚡ Sắp Độc Quyền ({leadingPlayer.avatar ?? '👤'} {leadingCount}/{totalCells})` (`bg-orange-100 text-orange-950 border border-orange-300 font-black rounded-full px-2.5 py-0.5`).
      - Tranh chấp: Thẻ chip avatar người chơi + tỉ lệ `count/totalCells` được tinh gọn trên nền kem ngà.
      - Đất trống: `🌱 Đất Trống` (`bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold rounded-full px-2.5 py-0.5`).
- **Thanh Tiến Độ Phân Khu (`district-progress-bar`)**:
  - Chuỗi **Slot Pills (`gap-1.5`)**:
    * Chiều cao `h-2` hoặc `h-2.5`, mỗi slot bo tròn `rounded-full`.
    * Slot đã có chủ: Nền màu `owner.tokenColor` với bóng nhẹ.
    * Slot trống: `bg-slate-100 border border-dashed border-slate-300` với `data-vacant="true"`.
- **Từng Hàng Ô Đất (`district-cell-{cellIndex}`)**:
  - Thẻ bao bọc `div` với `role="button"` và `onClick` lướt 3D sa bàn:
    `bg-[#FCFBFA] hover:bg-amber-50/40 border rounded-xl p-2.5 transition-colors cursor-pointer`.
  - `style`: `{ backgroundColor: `${owner.tokenColor}0a`, borderColor: `${owner.tokenColor}40` }` bảo toàn test **TC-137.09**.
  - **Bên trái**:
    * Tên BĐS đậm nét `text-xs sm:text-sm font-black text-slate-900 truncate`.
    * Giá niêm yết `deed.price Tr.` màu vàng kim đậm `text-amber-800 font-bold`.
    * Nếu đang thế chấp: Tag `🔒 Thế Chấp` (`bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded text-[10px] font-bold`).
    * Nếu đã xây: Tag `🏗️ C{level}` màu cam hổ phách nổi khối.
  - **Bên phải**:
    * Nếu đã có chủ: `Owner Pill` sang trọng: Avatar tròn + Tên người chơi rút gọn với nền `owner.tokenColor`.
    * Nếu còn trống: Nhãn `🌱 Còn Trống` (`bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md px-2 py-1 text-[11px] font-bold`).
    * Nút Xem Sa Bàn 3D `[👁️]`: Bo tròn `rounded-xl`, nền kem ngà `bg-amber-50/80 hover:bg-amber-100 text-amber-900 border border-amber-300/60 shadow-2xs min-h-[36px] min-w-[36px]`, có `e.stopPropagation()`.
    * Nút Gạ Đổi `[🤝]`: Khi là đất đối thủ, thiết kế tactile `bg-gradient-to-b from-amber-400 to-amber-500 text-amber-950 font-black border border-amber-600 shadow-[0_2px_0_0_#b45309] min-h-[36px] min-w-[36px] px-2 rounded-xl active:translate-y-[1px]`, có `e.stopPropagation()`.

---

## 5. Kế Hoạch Nghiệm Thu (Verification Plan)

### Trạm 1: RED Contract Tests (`tests/client/imp151_masterplan_tactile_ui_ux_overhaul.test.ts`)
Tạo bộ kiểm thử hợp đồng mới (>= 15 atomic tests) bao quát:
1. **Facet 1 (Boundary)**: Modal shell kem ngà bo góc `rounded-3xl`, dải ruy-băng màu phân khu, bóng tactile `shadow-[0_8px_0_0_#0f172a]`.
2. **Facet 2 (Reactivity)**: Tiến độ slot pills có `gap-1.5`, `data-vacant="true"`, huy hiệu ngôn ngữ tự nhiên giữ `2/3`, style container có `owner.tokenColor`.
3. **Facet 3 (Disposal & Actionability)**: Clickable row gọi `onSelectCell`, nút con `[🤝]` và `[👁️]` có `e.stopPropagation()` không làm trigger row click, touch targets >= 36px.
4. **Facet 4 (Error Defense & Invariants)**: 100% testids kế thừa nguyên vẹn (`masterplan-modal`, `tab-districts`, `district-progress-bar-{id}`, `view-cell-btn-{id}`, `quick-trade-btn-{id}`), không vỡ layout khi `playersInfo` rỗng.

### Hồi quy & Đảm bảo chất lượng (Regression & Gates)
```bash
# 1. Chạy suite kiểm thử hợp đồng mới IMP-151 (Trạm 1)
npx vitest run tests/client/imp151_masterplan_tactile_ui_ux_overhaul.test.ts

# 2. Chạy hồi quy các test suites masterplan hiện hữu
npx vitest run tests/client/imp132_urban_masterplan_minimap.test.ts tests/client/imp137_masterplan_district_radar_overhaul.test.ts

# 3. Chạy kiểm tra UI Linter (0 vi phạm)
npm run lint:ui
npm run lint:slop
npx tsc --noEmit
```
