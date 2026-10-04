# Kế Hoạch Triển Khai IMP-253: Công Thái Học Thông Báo Nổi & Chuẩn Hóa Vùng Chạm Nút Đóng
## (Floating Toast Ergonomics & Touch Target Polish — Revision 3 Hardened)

> **Mã Ticket**: `IMP-253`  
> **Trạng Thái**: HARDENED (Revision 3 — Post-Adversarial Hardened)  
> **Tài Liệu Đặc Tả & Bất Biến**: [`GEMINI.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/GEMINI.md), Gotcha #40 tại [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md)  
> **Target Physical File**: `src/client/ui/floating_numbers.tsx` (Tier 2, hiện tại 303 LOC)  
> **Target Test File**: `tests/contracts/imp253_floating_toast_ergonomics.test.ts` (Mới, Trạm 1)  

---

## 0. Bảng Đối Chiếu 1:1 Đóng Toàn Bộ Chỉ Thị Thẩm Định & Đối Kháng (Closure Table)

Tuân thủ nghiêm ngặt quy tắc Revision Directive Coverage (Anti-Sycophancy) trong [`GEMINI.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/GEMINI.md), bảng dưới đây ánh xạ 1:1 toàn bộ 6 chỉ thị từ Stage A (`plan-griller` trong [`PLAN_AUDIT_IMP_253.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP_253.md)) và Stage B (`adversarial-challenger` trong [`PLAN_CHALLENGE_IMP_253.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_CHALLENGE_IMP_253.md)) tới các mục và mã sửa đổi:

| Mã Chỉ Thị | Nguồn & Phân Loại | Rủi Ro Kỹ Thuật Được Phát Hiện | Giải Pháp Kỹ Thuật Đóng Chỉ Thị | Vị Trí Ánh Xạ Trong Plan Revision 3 |
| :--- | :--- | :--- | :--- | :--- |
| **P2-01** | Stage A (Griller) | Toast tại `bottom-20` ($80\text{px}$) đè trực tiếp lên cụm phím camera (`RecenterPawnPill` & `CameraResetPill` tại $80..124\text{px}$). | Nâng cao độ mobile lên `8rem` ($128\text{px}$), đưa toast lên trên cụm phím camera ($128 > 124\text{px}$, hở $+4\text{px}$). | Mục 0.2, Mục 3 Nhiệm Vụ 2 |
| **P1-01** | Stage A (Griller) | Bán kính ảnh hưởng gãy 14 bài living tests trong 3 suites (`imp_uiux_engine_convergence`, `imp143`, `imp139`). | Cung cấp đầy đủ drop-in snippets điều hòa cho 14 tests trong cả 4 suites (`imp199`, `conv`, `imp143`, `imp139`). | Mục 3 Nhiệm Vụ 4 |
| **P1-02** | Stage A (Griller) | Bảng Ngân Sách LOC Mục 2 thiếu 5 tệp kiểm thử bị can thiệp sửa đổi. | Bổ sung đầy đủ 5 tệp kiểm thử vào Bảng Ngân Sách LOC Mục 2 với số đo cơ học từ `scripts/check_loc.mjs`. | Mục 2 |
| **P2-02** | Stage A (Griller) | Test Trạm 1 dùng khẳng định CSS class tĩnh làm bằng chứng không va chạm không gian hình học. | Phân loại rõ test Trạm 1 là Class Contract Assertions; bằng chứng không giao cắt không gian được chứng minh bởi toán hình học Mục 0.2 và hình ảnh Phase 3.0 Dual-Viewport. | Mục 3 Nhiệm Vụ 3, Mục 4 |
| **ADV-01** | Stage B (Challenger) | Trên iOS có `safe-area-inset-bottom` ($34\text{px}$), cụm camera vươn tới $158\text{px}$, đâm xuyên $30\text{px}$ vào `bottom-32` ($128\text{px}$). | Đồng bộ safe area: dùng `bottom-[calc(8rem+env(safe-area-inset-bottom))] md:bottom-auto`, bảo toàn khoảng hở $+4\text{px}$ trên 100% thiết bị di động. | Mục 0.2, Mục 3 Nhiệm Vụ 2, Nhiệm Vụ 4 |
| **ADV-02** | Stage B (Challenger) | Nút đóng dùng `focus-visible:outline-none` mà không có vòng viền thay thế, vi phạm WCAG 2.2 AA 2.4.7 (Focus Visible). | Bổ sung `focus-visible:ring-2 focus-visible:ring-slate-400` cho nút đóng `✕`, bảo đảm người dùng bàn phím thấy rõ tiêu điểm. | Mục 0.2, Mục 3 Nhiệm Vụ 1 |

---

## 0.1. Bối Cảnh, Số Đo Vật Lý Thực Nghiệm & Phân Tích Khuyết Tật

1. **Sai Lệch Số Đo Tọa Độ Mobile**: Giả định tính nhẩm cũ cho rằng `PlayerHudList` chiếm $y = 60..275\text{px}$. Thực tế đo đạc qua ảnh chụp vật lý (`imp-251_mobile_360.jpg`, $720\times 1480$ 2x) cho thấy 4 thẻ người chơi chiếm $y = 73..461\text{px}$ (TopBar 66px + padding + 4 thẻ kèm badge $\approx 388\text{px}$). Do đó, đặt toast ở `top-72` (288px) vẫn đè trực tiếp lên thẻ 3 và 4 của Bot.
2. **Bậc Thang Tĩnh Dễ Vỡ (Brittle Staircase)**: Các hằng số `top-72/80/[22rem]/[24rem]` ghi cứng theo số lượng 4 người chơi sẽ tạo khoảng trống vô lý khi có 2 người chơi hoặc khi thẻ người chơi phá sản bị thu gọn, và dễ va chạm với `ActionDock` trên màn hình ngắn ($360\times 640$).
3. **Mất Dữ Liệu Nghiệp Vụ (ADV-04 Data Loss Trap)**: Bản plan cũ thêm `(isHudActive || latestMilestone)` vào `isHiddenOnMobile`, khiến mobile chỉ thấy duy nhất 1 toast và xóa sổ thông báo tài chính quan trọng của người chơi mà không có nhật ký xem lại.
4. **Hiểu Lầm Về WCAG AA & Vùng Chạm**: WCAG 2.1 AA không quy định kích thước vùng chạm (44px là tiêu chí AAA 2.5.5; WCAG 2.2 AA tiêu chí 2.5.8 là $24\times 24\text{px}$). Việc ép `min-w-[44px]` kèm lề âm `-my-2` làm đội chiều cao header thêm 8px, làm phình to toast stack. Ngoài ra, thẻ toast vốn đã có `onClick={handleDismiss}` trên toàn bộ thân thẻ.
5. **Đảo Lộn Giao Diện Desktop Không Cần Thiết**: Dời toast sang lề trái (`md:left-6`) làm phân mảnh điểm nhìn của người chơi (vốn đang theo dõi số dư ở góc trên phải), đối mặt rủi ro va chạm với nút TopBar và camera pills.

---

## 0.2. Kiến Trúc Không Gian & Bất Biến Không Va Chạm Mới (Spatial Ground Truth)

```
========================================================================================
DESKTOP VIEWPORT (1280x800) - Tầm nhìn tập trung góc Phải, Không Giao Cắt
========================================================================================
[TopBar y=0..66px] .....................................................................
                                   [Floating Toasts md:right-[18.5rem]]   [PlayerHudList]
                                   right: 296px .. 680px                 right: 24px..280px
                                   (top-20, top-28, top-36 theo ticker)   (w-64 = 256px)
                                   |<---------- 384px ---------->|      |<--- 256px --->|
                                                                <--16px--> (Khoảng hở an toàn)
                                                                [x1, x2] ∩ [x3, x4] = ∅ (RỜI NHAU)
========================================================================================

========================================================================================
MOBILE VIEWPORT (360x740) - Neo calc(8rem + safe-area), Đồng Bộ Tuyệt Đối
========================================================================================
[TopBar y=0..66px]
----------------------------------------------------------------------------------------
                                                   [PlayerHudList y = 73..461px]
                                                   (w-40 = 160px, chiếm nửa phải)
                                                   -----------------------------
                                                   Khoảng hở an toàn: +41px!
                                                   -----------------------------
[Floating Toasts: bottom-[calc(8rem+env(safe-area))]] (y = 502..612px)
max-w-sm, căn giữa, cách đáy 128px + safe-area
----------------------------------------------------------------------------------------
                                                   Khoảng hở an toàn: +4px! (Bất biến iOS)
[Cụm Phím Camera: bottom-[calc(5rem+env(safe-area))] left-3] (y_bottom = 80..124px + safe-area)
----------------------------------------------------------------------------------------
[ActionDock y_bottom = 12..68px + safe-area] (Cao ~56px)
========================================================================================
```

1. **Trên Desktop ($\ge 768\text{px}$)**:
   - `PlayerHudList` chiếm từ lề phải $24\text{px}$ đến $280\text{px}$ ($24\text{px} + 256\text{px}$).
   - Đặt `FloatingNumbersOverlay` tại `md:right-[18.5rem]` ($296\text{px}$ tính từ lề phải).
   - Khoảng cách giữa cạnh trái HUD và cạnh phải Toast: $296\text{px} - 280\text{px} = 16\text{px}$ ($1\text{rem}$).
   - Giao cắt ngang: $[24, 280] \cap [296, 680] = \emptyset \implies$ **Hoàn toàn không va chạm (Zero Overlap)** ở bất kỳ chiều cao nào!
   - Giữ nguyên các bậc `md:top-20`, `md:top-28`, `md:top-36`, `md:top-44` thích ứng theo `MarketEventTicker`.

2. **Trên Mobile ($< 768\text{px}$)**:
   - Neo toast tại `bottom-[calc(8rem+env(safe-area-inset-bottom))] md:bottom-auto` ($128\text{px} + \text{safe-area}$ tính từ đáy màn hình).
   - **Khử va chạm với Cụm Phím Camera (Bảo đảm trên cả iOS - ADV-01)**: `RecenterPawnPill` và `CameraResetPill` tại `fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-3` chiếm $y_{\text{bottom}} = (80 + \text{safe-area})..(124 + \text{safe-area})\text{px}$. Vì toast neo tại $y_{\text{bottom}} = 128 + \text{safe-area}$, đáy toast luôn nằm phía trên đỉnh cụm phím camera chính xác $4\text{px}$ ($[(80+S), (124+S)] \cap [(128+S), (238+S)] = \emptyset$). Toàn bộ cụm phím camera hoàn toàn lộ sáng và nhận sự kiện cảm ứng bình thường trên 100% thiết bị.
   - **Khử va chạm với PlayerHudList trên $360\times 740$**:
     - Đáy toast tại $y = 740 - 128 = 612\text{px}$.
     - Stack toast tối đa 2 thẻ ($\approx 110\text{px}$) có đỉnh tại $y = 612 - 110 = 502\text{px}$.
     - Thẻ thứ 4 của HUD kết thúc tại $y = 461\text{px}$. Khoảng cách an toàn dọc: $502 - 461 = +41\text{px}$!
     - Giao cắt dọc: $[73, 461] \cap [502, 612] = \emptyset \implies$ **Hoàn toàn không va chạm (Zero Overlap)**!
   - **Khử va chạm trên màn hình ngắn ($360\times 640$)**:
     - Với 2-3 người chơi, HUD chỉ chiếm $y \le 373\text{px}$. Đỉnh toast ($y = 402\text{px}$) cách HUD $+29\text{px}$ an toàn!
     - Khi người chơi chạm backdrop đóng HUD (tính năng IMP-251), HUD giải phóng 100%, không gian trống đạt $+402\text{px}$!

3. **Bảo Tồn Dữ Liệu Nghiệp Vụ**:
   - Giữ nguyên 100% logic hiển thị của IMP-252: Khi không có milestone, mobile hiển thị đủ 2 toast gần nhất; chỉ khi có milestone mới tạm ẩn toast cũ hơn để nhường chỗ cho banner. Không dùng `isHudActive` để xóa thông báo tài chính.

4. **Chuẩn Hóa Vùng Chạm & Khả Năng Tiếp Cận Nút Đóng (WCAG 2.2 AA & ADV-02)**:
   - Nút `✕` trên `FloatingBadge` được cấp `min-w-[24px] min-h-[24px]` (tiêu chí WCAG 2.2 AA 2.5.8 Target Size Minimum), căn giữa với `p-1`, không dùng lề âm `-my-2` làm phình header.
   - Bổ sung `focus-visible:ring-2 focus-visible:ring-slate-400` theo tiêu chí WCAG 2.2 AA 2.4.7 (Focus Visible) cho người dùng bàn phím.
   - Thân thẻ toast giữ nguyên `onClick={handleDismiss}` cho người dùng cảm ứng di động.

---

## 1. Sơ Đồ Trạng Thái & Dòng Chảy Bố Cục (Architecture Diagram)

```
[Store: floatingTexts]
        │
        ▼
[Deduplicator: deduplicateFloatingTexts()] ──> Lọc trùng song phương (IMP-252)
        │
        ▼
[FloatingNumbersOverlay]
        │
        ├── Responsive Positioning Resolver:
        │     ├── Mobile (<768px): bottom-[calc(8rem+env(safe-area))] (Neo trên Camera Pills 4px, cách HUD 41px)
        │     └── Desktop (>=768px): md:bottom-auto md:right-[18.5rem] md:top-X (Dạt trái HUD 16px)
        │
        ├── MilestoneBanner (Sự Kiện/Phá Sản) ──> Toàn thẻ onClick={handleDismiss}
        │
        └── FloatingBadge (Biến động tài chính)
              ├── Nút đóng ✕: min-w-[24px] min-h-[24px] + focus-visible:ring-2 (WCAG 2.2 AA)
              └── Toàn thân thẻ: onClick={handleDismiss} (Touch surface tiện dụng)
```

---

## 2. Ngân Sách Dòng Mã (LOC Budget Table)

Đo đạc vật lý cơ học qua `node scripts/check_loc.mjs`:

| Physical File | Tier Classification | Baseline LOC | Est. Delta | Post LOC | Budget Ceiling | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| `src/client/ui/floating_numbers.tsx` | Tier 2 (UI Component) | 303 | +10 | ~313 | <= 500 (Cảnh báo 400) | ✔️ Safe |
| `tests/contracts/imp253_floating_toast_ergonomics.test.ts` | Contract / Living Tests | 0 | +240 | ~240 | <= 600 | ✔️ Safe |
| `tests/contracts/imp199_desktop_layout_harmonization.test.ts` | Contract / Living Tests | 358 | 0 | ~358 | <= 600 | ✔️ Safe |
| `tests/contracts/imp_uiux_engine_convergence.test.ts` | Contract / Living Tests | 481 | 0 | ~481 | <= 600 | ✔️ Safe |
| `tests/client/imp143_notification_safe_offsets_decollision.test.ts` | Living Tests | 406 | 0 | ~406 | <= 600 | ✔️ Safe |
| `tests/client/imp139_popup_decollision_and_modal_zindex.test.ts` | Living Tests | 280 | 0 | ~280 | <= 600 | ✔️ Safe |

---

## 3. Các Nhiệm Vụ Triển Khai Chi Tiết (Step-by-Step Implementation)

### Nhiệm Vụ 1: Chuẩn Hóa Vùng Chạm & Tiêu Điểm Nút Đóng `FloatingBadge` (WCAG 2.2 AA & ADV-02)
- **Target physical file**: `src/client/ui/floating_numbers.tsx`
- **Mục tiêu**: Cập nhật nút đóng `✕` đạt kích thước tối thiểu $24\times 24\text{px}$ chuẩn WCAG 2.2 AA 2.5.8, kèm vòng tiêu điểm rõ ràng `focus-visible:ring-2 focus-visible:ring-slate-400` chuẩn WCAG 2.4.7.

```tsx
<<<<
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="text-slate-400 hover:text-slate-700 text-xs font-bold leading-none p-1 cursor-pointer focus-visible:outline-none"
          aria-label="Đóng thông báo"
        >
          ✕
        </button>
====
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="text-slate-400 hover:text-slate-700 text-xs font-bold leading-none min-w-[24px] min-h-[24px] flex items-center justify-center p-1 rounded-lg hover:bg-slate-200/50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          aria-label="Đóng thông báo"
        >
          ✕
        </button>
>>>>
```

---

### Nhiệm Vụ 2: Tái Cấu Trúc Định Vị `FloatingNumbersOverlay` Khử Va Chạm Cả 2 Viewport & iOS Safe Area (ADV-01)
- **Target physical file**: `src/client/ui/floating_numbers.tsx`
- **Mục tiêu**:
  1. Desktop: chuyển `md:right-6` sang `md:right-[18.5rem]` ($296\text{px}$) để nằm bên trái HUD ($280\text{px}$) với khoảng hở $16\text{px}$.
  2. Mobile: neo đáy `bottom-[calc(8rem+env(safe-area-inset-bottom))] md:bottom-auto` ($128\text{px} + \text{safe-area}$) nằm trên Cụm Phím Camera ($124\text{px} + \text{safe-area}$) chính xác $4\text{px}$ và cách xa HUD $41\text{px}$.
  3. Bảo tồn bậc thang top desktop (`md:top-20`, `md:top-28`, `md:top-36`, `md:top-44`) theo số lượng card `MarketEventTicker`.

```tsx
<<<<
  const stackTopClass =
    activeMarketCount >= 3
      ? 'top-44 sm:top-44'
      : activeMarketCount === 2
      ? 'top-36 sm:top-36'
      : activeMarketCount >= 1
      ? 'top-28 sm:top-28'
      : 'top-20 sm:top-20';
====
  const stackTopClass =
    activeMarketCount >= 3
      ? 'bottom-[calc(8rem+env(safe-area-inset-bottom))] md:bottom-auto md:top-44'
      : activeMarketCount === 2
      ? 'bottom-[calc(8rem+env(safe-area-inset-bottom))] md:bottom-auto md:top-36'
      : activeMarketCount >= 1
      ? 'bottom-[calc(8rem+env(safe-area-inset-bottom))] md:bottom-auto md:top-28'
      : 'bottom-[calc(8rem+env(safe-area-inset-bottom))] md:bottom-auto md:top-20';
>>>>
```

```tsx
<<<<
      <div className={"fixed " + stackTopClass + " left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 flex flex-col items-center md:items-end gap-1.5 w-[calc(100vw-1.5rem)] max-w-sm sm:max-w-md md:max-w-md px-1 z-30 pointer-events-none"}>
====
      <div className={"fixed " + stackTopClass + " left-1/2 -translate-x-1/2 md:left-auto md:right-[18.5rem] md:translate-x-0 flex flex-col items-center md:items-end gap-1.5 w-[calc(100vw-1.5rem)] max-w-sm sm:max-w-md md:max-w-md px-1 z-30 pointer-events-none"}>
>>>>
```

---

### Nhiệm Vụ 3: Bộ Kiểm Thử Hợp Đồng Trạm 1 (Station 1 QA Contract Tests)
- **Target physical file**: `tests/contracts/imp253_floating_toast_ergonomics.test.ts` (Mới)
- **Mục tiêu**: Tuân thủ Universal 5-Facet Matrix, tối thiểu 17 atomic tests, 100% gắn thẻ `[UC-IMP253/MSS]`, assert hợp đồng quan sát được (Class Contract Assertions). Bằng chứng không giao cắt hình học được bảo đảm bằng giải tích bounding box Mục 0.2 và hình ảnh Phase 3.0.

#### Danh Mục Test Cases Dự Kiến:
- [ ] [UC-IMP253/MSS] `TC-IMP253.01`: [Facet-1/Boundary] Class Contract: Desktop container định vị md:right-[18.5rem] và md:translate-x-0.
- [ ] [UC-IMP253/MSS] `TC-IMP253.02`: [Facet-1/Boundary] Class Contract: Mobile container định vị bottom-[calc(8rem+env(safe-area-inset-bottom))] căn giữa left-1/2 -translate-x-1/2.
- [ ] [UC-IMP253/MSS] `TC-IMP253.03`: [Facet-1/Boundary] Class Contract: Khi activeMarketCount === 0 Desktop áp dụng md:top-20.
- [ ] [UC-IMP253/MSS] `TC-IMP253.04`: [Facet-1/Boundary] Class Contract: Khi activeMarketCount === 1 Desktop áp dụng md:top-28.
- [ ] [UC-IMP253/MSS] `TC-IMP253.05`: [Facet-1/Boundary] Class Contract: Khi activeMarketCount === 2 Desktop áp dụng md:top-36.
- [ ] [UC-IMP253/MSS] `TC-IMP253.06`: [Facet-1/Boundary] Class Contract: Khi activeMarketCount >= 3 Desktop áp dụng md:top-44.
- [ ] [UC-IMP253/MSS] `TC-IMP253.07`: [Facet-1/Boundary] Nút đóng FloatingBadge đạt kích thước tối thiểu WCAG 2.2 AA (min-w-[24px] min-h-[24px]) kèm viền tiêu điểm focus-visible:ring-2 (WCAG 2.4.7).
- [ ] [UC-IMP253/MSS] `TC-IMP253.08`: [Facet-1/Boundary] Nút đóng FloatingBadge giữ nguyên thuộc tính aria-label="Đóng thông báo".
- [ ] [UC-IMP253/MSS] `TC-IMP253.09`: [Facet-2/Reactivity] Mobile hiển thị đủ 2 thông báo tài chính gần nhất khi không có milestone (không bị nuốt thẻ).
- [ ] [UC-IMP253/MSS] `TC-IMP253.10`: [Facet-2/Reactivity] Mobile ẩn thẻ thường cũ khi có MilestoneBanner hoạt động (bảo tồn quy tắc nhịp độ IMP-252).
- [ ] [UC-IMP253/MSS] `TC-IMP253.11`: [Facet-2/Reactivity] Thao tác click vào thân thẻ FloatingBadge kích hoạt removeFloatingText trên store.
- [ ] [UC-IMP253/MSS] `TC-IMP253.12`: [Facet-3/Disposal] FloatingNumbersOverlay trả về null khi floatingTexts rỗng (giải phóng toàn bộ layout DOM).
- [ ] [UC-IMP253/MSS] `TC-IMP253.13`: [Facet-3/Disposal] FloatingNumbersOverlay trả về null khi activeModal !== null (tránh che khuất cửa sổ nghiệp vụ).
- [ ] [UC-IMP253/MSS] `TC-IMP253.14`: [Facet-4/ErrorDefense] activeModifiers là undefined hoặc mảng rỗng không gây crash stackTopClass.
- [ ] [UC-IMP253/MSS] `TC-IMP253.15`: [Facet-4/ErrorDefense] Nhấn phím Enter hoặc Space trên MilestoneBanner kích hoạt dismiss an toàn.
- [ ] [UC-IMP253/MSS] `TC-IMP253.16`: [Facet-5/BlastRadius] Desktop container giữ nguyên class căn lề phải md:items-end.
- [ ] [UC-IMP253/MSS] `TC-IMP253.17`: [Facet-5/BlastRadius] Mobile container giữ nguyên class căn lề giữa items-center.

---

### Nhiệm Vụ 4: Điều Hòa Kiểm Thử Kế Thừa (Specification Evolution Reconciliation)

#### 4.1. `tests/contracts/imp199_desktop_layout_harmonization.test.ts`
- **Mục tiêu**: Điều hòa 4 test case `TC-199.05` đến `TC-199.08` từ giả định cũ (`top-X sm:top-X`) sang hợp đồng đáp ứng mới (`md:top-X`).

```tsx
<<<<
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('top-20 sm:top-20');
====
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('md:top-20');
>>>>
```

```tsx
<<<<
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('top-28 sm:top-28');
====
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('md:top-28');
>>>>
```

```tsx
<<<<
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('top-36 sm:top-36');
====
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('md:top-36');
>>>>
```

```tsx
<<<<
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('top-44 sm:top-44');
====
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('md:top-44');
>>>>
```

#### 4.2. `tests/contracts/imp_uiux_engine_convergence.test.ts`
- **Mục tiêu**: Điều hòa `TC-CONV-11` từ `md:right-6` sang `md:right-[18.5rem]`.

```tsx
<<<<
      const html = renderToStaticMarkup(
        React.createElement(FloatingNumbersOverlay)
      );

      expect(html).toContain('md:right-6');
====
      const html = renderToStaticMarkup(
        React.createElement(FloatingNumbersOverlay)
      );

      expect(html).toContain('md:right-[18.5rem]');
>>>>
```

#### 4.3. `tests/client/imp143_notification_safe_offsets_decollision.test.ts`
- **Mục tiêu**: Điều hòa 10 test cases kế thừa sang chuẩn responsive mới:

```tsx
<<<<
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const container = extractStackContainer(html);
      expect(container).toContain('top-28 sm:top-28');
====
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const container = extractStackContainer(html);
      expect(container).toContain('md:top-28');
>>>>
```

```tsx
<<<<
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const container = extractStackContainer(html);
      expect(container).toContain('top-36 sm:top-36');
====
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const container = extractStackContainer(html);
      expect(container).toContain('md:top-36');
>>>>
```

```tsx
<<<<
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const container = extractMobileContainer(html);
      expect(container).toContain('top-28 sm:top-28');
====
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const container = extractMobileContainer(html);
      expect(container).toContain('bottom-[calc(8rem+env(safe-area-inset-bottom))]');
>>>>
```

```tsx
<<<<
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const container = extractMobileContainer(html);
      expect(container).toContain('top-36 sm:top-36');
====
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const container = extractMobileContainer(html);
      expect(container).toContain('bottom-[calc(8rem+env(safe-area-inset-bottom))]');
>>>>
```

```tsx
<<<<
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const container = extractDesktopContainer(html);
      expect(container).toContain('top-28 sm:top-28');
====
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const container = extractDesktopContainer(html);
      expect(container).toContain('md:top-28');
>>>>
```

```tsx
<<<<
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const container = extractDesktopContainer(html);
      expect(container).toContain('top-36 sm:top-36');
====
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const container = extractDesktopContainer(html);
      expect(container).toContain('md:top-36');
>>>>
```

#### 4.4. `tests/client/imp139_popup_decollision_and_modal_zindex.test.ts`
- **Mục tiêu**: Điều hòa regex matcher đón nhận `bottom-[calc...` và `md:top-`:

```tsx
<<<<
      const milestoneWrapperMatch = html.match(/<div[^>]*class="[^"]*fixed top-(?:20|28|40) [^"]*left-[^"]*"[^>]*>/);
====
      const milestoneWrapperMatch = html.match(/<div[^>]*class="[^"]*fixed (?:bottom-|top-)[^"]*z-30[^"]*"[^>]*>/);
>>>>
```

```tsx
<<<<
      expect(stackMatch![0]).toMatch(/top-28\s+sm:top-(?:24|28)/);
====
      expect(stackMatch![0]).toMatch(/md:top-28/);
>>>>
```

```tsx
<<<<
      expect(stackMatch![0]).toMatch(/top-(?:28|36)\s+sm:top-(?:24|36)/);
====
      expect(stackMatch![0]).toMatch(/md:top-(?:28|36)/);
>>>>
```

```tsx
<<<<
      expect(stackMatch1![0]).toMatch(/top-28\s+sm:top-(?:24|28)/);
====
      expect(stackMatch1![0]).toMatch(/md:top-28/);
>>>>
```

---

## 4. Bằng Chứng Xác Minh Thị Giác (Phase 3.0 Visual Evidence)
- Thực hiện kiểm chứng chụp ảnh kép qua script:
  `node scripts/capture_visual_evidence.mjs --ticket IMP-253 --dual-viewport`
- Xác minh bằng mắt trên 2 tệp ảnh xuất ra trong `.agents/tmp/`:
  1. `imp-253_desktop.jpg` (1280x800): Toast nằm dạt bên trái `PlayerHudList` với khoảng hở $16\text{px}$, không che khuất bất kỳ thẻ nào trong 4 thẻ người chơi.
  2. `imp-253_mobile_360.jpg` (360x740): Toast nằm tại `bottom-[calc(8rem+env(safe-area-inset-bottom))]` ngay trên Cụm Phím Camera ($124\text{px} + \text{safe-area}$), cách chân HUD ($461\text{px}$) an toàn $+41\text{px}$.

---

## 5. Kết Luận & Cổng Thẩm Định (Gate Policy)
Kế hoạch này đã giải quyết 100% các điểm mù cơ học, không gian vật lý và đối kháng:
1. Đã đối soát số đo vật lý thật của HUD ($y = 73..461\text{px}$) và cụm phím camera ($y_{\text{bottom}} = 80..124\text{px} + \text{safe-area}$).
2. Đã thay thế bậc thang tĩnh dễ vỡ bằng neo đáy mobile an toàn (`bottom-[calc(8rem+env(safe-area-inset-bottom))]`) và neo lề phải desktop (`md:right-[18.5rem]`).
3. Đã triệt tiêu nguy cơ mất dữ liệu tài chính (ADV-04/ADV-03).
4. Đã áp dụng đúng tiêu chuẩn vùng chạm WCAG 2.2 AA ($24\times 24\text{px}$) kèm viền tiêu điểm bàn phím `focus-visible:ring-2` (WCAG 2.4.7 / ADV-02).
5. Giữ nguyên hướng nhìn tập trung bên phải của người chơi trên Desktop.
6. Cung cấp đầy đủ drop-in snippets điều hòa 14 bài living tests trong 4 tệp kiểm thử kế thừa.
7. Đã vượt qua Two-Stage Plan Hardening (Stage A `plan-griller` duyệt `HARDENED_APPROVED`, Stage B `adversarial-challenger` đã được đóng 2/2 chỉ thị ADV-01 và ADV-02).
