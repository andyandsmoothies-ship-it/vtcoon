# KẾ HOẠCH THI CÔNG: IMP-236 — TỐI ƯU BỐ CỤC DESKTOP & DUAL-VIEWPORT PARITY (REVISION 2.1)
## (Dual-Viewport Parity, Desktop Layout Integrity & Anti-Truncation Polish)

> **Mã số Ticket**: IMP-236  
> **Phiên bản kế hoạch**: Revision 2.1 (Tiếp thu và hòa giải 100% 4 phản biện người dùng + kiểm toán đối kháng từ `plan-griller`)  
> **Phân loại**: Tier 2 (Full Rigor — >50 LOC, ảnh hưởng 4 modals: TitleDeedModal, PropertyPortfolioModal, TradeModal, BondIssuanceTab)  
> **Mục tiêu**: Khắc phục triệt để hiện tượng rò rỉ ràng buộc mobile lên Desktop, xóa bỏ khoảng trắng chết (dead space void), hiển thị trọn vẹn thông tin ROI (C1/C2) và ngăn chặn cắt cụt chữ (truncation) trên màn hình rộng theo điều lệ `Dual-Viewport Parity & Layout Integrity` trong `GEMINI.md`.

---

## 1. BẢNG KHÉP KÍN CHỈ THỊ & PHẢN BIỆN 1:1 (USER CRITIQUE & GRILLER CLOSURE TABLE)

| Mã Phản Biện | Nội Dung Phản Biện | Tệp Mục Tiêu & Vị Trí Dòng | Giải Pháp Kỹ Thuật Đã Hòa Giải Triệt Để |
| :---: | :--- | :--- | :--- |
| **PB-01 (Critical)** | Task 1 Snippet thay thế ternary JSX `{showCompact ? ... : ...}` bỏ lửng Full Table L134-241 | `src/client/ui/modals/title_deed_rent_table.tsx#L62-L142` & `#L255-L265` | Tách Task 1 thành 3 snippet phẫu thuật chính xác: Snippet 1.1 đổi `{showCompact ? (` sang `{showCompact && (` và thêm `md:hidden`; Snippet 1.2 nối `)}` và mở `<div className={... hidden md:block}>`; Snippet 1.3 bảo toàn nút collapse `md:hidden` và xóa bỏ `)}` thừa. Toàn bộ ruột Full Table (L142-251) giữ nguyên vẹn 100% không đụng chạm. |
| **PB-02 (Critical)** | Thiếu khai báo LOC baseline & delta estimate cho `title_deed_rent_table.tsx` | Bảng Section 2 (LOC Budget & Delta) | Bổ sung đầy đủ bảng đo Baseline SLOC và Delta dòng cho toàn bộ 5 tệp: `title_deed_rent_table.tsx` baseline 268 dòng, delta = +1 dòng (tổng 269 <= 500); `property_portfolio_modal.tsx` baseline 395 dòng, delta = +1 dòng (tổng 396 <= 400). |
| **PB-03 (Critical)** | Bẫy Contract Test `TC-AUC-ERG.10` chuỗi 'C3 (KHÁCH SẠN)' và button text | `tests/client/auction_and_title_deed_mobile_ergonomics.test.ts#L224` | Hòa giải minh bạch: `expect(html).toContain('C3 (KHÁCH SẠN)')` đã và đang PASS 100% (10/10 tests) nhờ thuộc tính `title="C3 (KHÁCH SẠN)"` tại L81 của `title_deed_rent_table.tsx`. Thuộc tính này được giữ nguyên 100% không đổi. Nhãn nút mới `'Xem chi tiết 4 cấp nâng cấp (C0 - C3)'` bảo tồn trọn vẹn chuỗi tiền tố `'Xem chi tiết 4 cấp nâng cấp'`, bảo đảm cả 2 assertions luôn PASS. |
| **PB-04 (Medium)** | Snippet Task 2 không show 5 hover props trong AFTER block gây nguy cơ implementer xóa nhầm | `src/client/ui/modals/property_portfolio_modal.tsx#L227-L240` | Mở rộng khối snippet Task 2 bao trọn toàn bộ thẻ mở `<div>` (L227-240), phơi bày rõ ràng 100% cả 5 props: `data-onmouseenter="true"`, `onMouseEnter`, `onMouseLeave`, `onFocus`, `onBlur` trong cả khối BEFORE và AFTER. |
| **P1-01** | Bảo vệ `TC-106` và `TC-154.15` không đổi `max-w-[120px]` thành `110px` | `src/client/ui/modals/trade/trade_partner_strip.tsx#L80` | Giữ nguyên gốc `truncate max-w-[120px]`, nới rộng `sm:max-w-[180px] md:max-w-none font-bold`. |
| **P2-02** | Khắc phục cụt chữ `#6 Bình D...` khi có từ 2 BĐS trở lên | `src/client/ui/modals/property_portfolio_modal.tsx#L320-L323` | Đổi `hidden sm:inline` thành `hidden lg:inline`, giải phóng 80px cho tên địa danh trên cột 300px. |
| **P2-03** | Đồng bộ phân cấp tương phản màu cho chỉ số Net Worth khi thiếu điều kiện | `src/client/ui/modals/bond_issuance_tab.tsx#L142` | Cập nhật đồng bộ L142: `${hasNetWorth ? 'text-slate-600 font-normal' : 'text-rose-700 font-bold'}`. |

---

## 2. ĐO LƯỜNG NGÂN SÁCH LOC & DELTA ESTIMATES (PRE-CODING LOC BASELINE)

Thực hiện đo đạc độc lập qua công cụ `scripts/check_loc.mjs` trên toàn bộ 5 tệp vật lý:

| Tệp vật lý (Physical File) | Phân tầng (Tier) | Dòng vật lý hiện tại | SLOC hiện tại | Dự kiến Delta dòng (Lines Added - Deleted) | Dòng vật lý sau khi sửa | Ngân sách trần (Ceiling) | Trạng thái |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `src/client/ui/modals/title_deed_rent_table.tsx` | Tier 2 | **268** | 252 | **+1** (+2 / -1) | **269** | <= 500 LOC | ✔️ Tuyệt đối an toàn |
| `src/client/ui/modals/property_portfolio_modal.tsx` | Tier 2 | **395** | 375 | **+1** (+1 / -0) | **396** | <= 400 LOC | ✔️ Dưới ngưỡng cảnh báo |
| `src/client/ui/modals/trade/trade_partner_strip.tsx` | Tier 2 | **116** | 107 | **0** (+0 / -0) | **116** | <= 500 LOC | ✔️ Tuyệt đối an toàn |
| `src/client/ui/modals/bond_issuance_tab.tsx` | Tier 2 | **210** | 194 | **0** (+0 / -0) | **210** | <= 500 LOC | ✔️ Tuyệt đối an toàn |
| `tests/contracts/imp236_desktop_uiux_viewport_harmonization.test.ts` | Test Suite | **0** (Mới) | 0 | **+245** | **245** | <= 600 LOC | ✔️ Hợp đồng kiểm thử mới |

---

## 3. PHÂN TÍCH HIỆN TRẠNG & BẢNG 4 CHẾ ĐỘ THẤT BẠI (FAILURE MODES)

### 3.1 Hiện trạng vật lý qua 4 ảnh chụp Desktop
1. **Ảnh 1 (`TitleDeedModal`)**: Cột phải bị rò rỉ cờ `compact={canBuy && !isOwned}` khiến bảng cước chỉ còn 1 hàng (~110px) trong khi cột trái cao ~280px. Cột phải bỏ trống >60% diện tích; che giấu mức phí thuê Nhà Phố (C1) và Khách Sạn (C2); nút accordion chứa chuỗi 95 ký tự bị bẻ vụng về thành 3 dòng chữ.
2. **Ảnh 2 (`PropertyPortfolioModal` - Tab BĐS)**: Lưới `sm:grid-cols-2` khi người chơi chỉ sở hữu 1 BĐS ("Bà Rịa - Vũng Tàu") khiến thẻ co cụm vào cột 1 (~320px), toàn bộ nửa phải modal là khoảng trắng chết. Trong thẻ, danh sách mảnh ghép bị bóp nghẹt làm tên địa danh bị cắt cụt ba chấm: `#6 Bình D...`, `#8 Đồng ...`.
3. **Ảnh 3 (`BondIssuanceTab` - Tab Trái Phiếu)**: Khi điều kiện "BĐS sạch chưa thế chấp ≥ 2 ô" bị thiếu, chỉ số định lượng `1 / 2` ở cột phải vẫn hiển thị màu xám mờ (`text-slate-600`), thiếu đồng bộ phân cấp tương phản với icon `❌` và màu đỏ cảnh báo.
4. **Ảnh 4 (`TradeModal` - Đàm Phán P2P)**: Băng chọn đối tác `TradePartnerStrip` bị gán cứng `max-w-[120px]` cho tên và `max-w-[90px]` cho badge, khiến tất cả đối tác bị cắt cụt chữ: `Bot AI 2 (Ag...`, `Bot AI 3 (B...`, `💰 Dư tiền ...` dù modal Desktop rộng tới 896px (`lg:max-w-4xl`).

### 3.2 Bảng 4 Chế Độ Thất Bại & Cơ Chế Phòng Vệ Kỹ Thuật

| Failure Mode | Cơ Chế Phát Sinh Rủi Ro | Biện Pháp Phòng Vệ Kỹ Thuật (Defense) |
| :--- | :--- | :--- |
| **FM-1: Tràn màn hình Mobile khi mở rộng bảng cước** | Nếu mở rộng bảng cước 4 cấp trên Desktop mà vô tình làm bung ra trên Mobile, modal Sổ Đỏ sẽ tràn chiều cao (>100vh) và đẩy nút Mua ra ngoài màn hình. | Sử dụng cặp lớp phản hồi CSS Tailwind chuẩn hóa: `md:hidden` (cho Mini Rent Bar) và `hidden md:block` (cho Full Rent Table 4 cấp). |
| **FM-2: Gãy Contract Test cũ khi tinh gọn nhãn Accordion** | Nếu sửa văn bản nút mở rộng làm mất chuỗi `'Xem chi tiết 4 cấp nâng cấp'`, test hồi quy `[TC-AUC-ERG.10/MSS]` sẽ thất bại. | Giữ nguyên 100% cụm từ gốc `'Xem chi tiết 4 cấp nâng cấp'` làm tiền tố: `'Xem chi tiết 4 cấp nâng cấp (C0 - C3)'`. Đồng thời bảo toàn thuộc tính `title="C3 (KHÁCH SẠN)"` tại L81 để thỏa mãn `expect(html).toContain('C3 (KHÁCH SẠN)')`. |
| **FM-3: Phá vỡ lưới 2 cột khi có nhiều BĐS trong Danh Mục** | Nếu cấu hình thẻ BĐS chiếm `sm:col-span-2` cho mọi trường hợp, người chơi có từ 2 BĐS trở lên sẽ bị dồn thành 1 cột dọc dài lê thê. | Chỉ kích hoạt `sm:col-span-2` khi `filteredProperties.length === 1`. Khi `length > 1`, duy trì lưới 2 cột `sm:grid-cols-2`. |
| **FM-4: Tràn ngang (Horizontal Overflow) thanh đối tác Trade** | Nếu gỡ bỏ hoàn toàn `truncate` mà không có giới hạn phản hồi, tên đối tác dài đột biến sẽ làm tràn thanh chọn trên màn hình tablet. | Sử dụng giới hạn nới lỏng theo breakpoint: `truncate max-w-[120px] sm:max-w-[180px] md:max-w-none` kết hợp `min-w-0 flex-1`. |

---

## 4. DROP-IN CODE SNIPPETS (VERBATIM DISK MATCHING)

### Task 1: Điều Chỉnh Bảng Cước Dual-Viewport trong `title_deed_rent_table.tsx`

**Target physical file**: `src/client/ui/modals/title_deed_rent_table.tsx`

#### Snippet 1.1: Bổ sung `md:hidden` cho Mini Rent Bar và chuyển đổi ternary sang guard độc lập (L62-L65)
```tsx
<<<<
      {showCompact ? (
        /* Mini Rent Bar (~40px) kế thừa từ AuctionDistrictCard */
        <div className="space-y-1.5">
====
      {showCompact && (
        /* Mini Rent Bar (~40px) kế thừa từ AuctionDistrictCard */
        <div className="space-y-1.5 md:hidden">
>>>>
```

#### Snippet 1.2: Tinh gọn nút mở rộng và mở khối Full Rent Table với `hidden md:block` (L135-L142)
```tsx
<<<<
                  : 'Xem chi tiết 4 cấp nâng cấp (C0 Đất Nền, C1 Nhà Phố, C2 Khách Sạn, C3 Quần thể Resort/TTTM)'}
            </span>
          </button>
        </div>
      ) : (
        <div className="space-y-1.5 sm:space-y-2">
====
                  : 'Xem chi tiết 4 cấp nâng cấp (C0 - C3)'}
            </span>
          </button>
        </div>
      )}

      {/* 2. Khối Bảng Cước Đầy Đủ: Trên Desktop luôn hiển thị (hidden md:block khi showCompact), trên Mobile tuân theo toggle */}
      <div className={`space-y-1.5 sm:space-y-2 ${showCompact ? 'hidden md:block' : ''}`}>
>>>>
```

#### Snippet 1.3: Bảo toàn nút thu gọn trên Mobile (`md:hidden`) và đóng thẻ container (L255-L265)
```tsx
<<<<
              className="w-full text-center py-2 min-h-[44px] text-[11px] sm:text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
              data-testid="collapse-rent-tiers"
            >
              <span>▴</span>
              <span>Thu gọn biểu phí</span>
            </button>
          )}
        </div>
      )}
    </div>
====
              className="w-full text-center py-2 min-h-[44px] text-[11px] sm:text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98] md:hidden"
              data-testid="collapse-rent-tiers"
            >
              <span>▴</span>
              <span>Thu gọn biểu phí</span>
            </button>
          )}
        </div>
    </div>
>>>>
```

---

### Task 2: Bảo Toàn 100% 5 Props Hover Sa Bàn 3D & Khắc Phục Cụt Chữ trong `property_portfolio_modal.tsx`

**Target physical file**: `src/client/ui/modals/property_portfolio_modal.tsx`

#### Snippet 2.1: Bảo toàn toàn bộ hover/focus listeners và bổ sung `sm:col-span-2` cho thẻ đơn (L227-L240)
```tsx
<<<<
                <div
                  key={cellIndex}
                  data-testid={`property-portfolio-item-${cellIndex}`}
                  data-onmouseenter="true"
                  onMouseEnter={() => onHoverCell?.(cellIndex)}
                  onMouseLeave={() => onHoverCell?.(null)}
                  onFocus={() => onHoverCell?.(cellIndex)}
                  onBlur={() => onHoverCell?.(null)}
                  className={`border-2 rounded-xl p-3 flex flex-col justify-between transition-all ${
                    isMort
                      ? 'bg-slate-100/80 border-slate-300 opacity-90'
                      : 'bg-white border-slate-300 shadow-sm hover:border-slate-400'
                  }`}
                >
====
                <div
                  key={cellIndex}
                  data-testid={`property-portfolio-item-${cellIndex}`}
                  data-onmouseenter="true"
                  onMouseEnter={() => onHoverCell?.(cellIndex)}
                  onMouseLeave={() => onHoverCell?.(null)}
                  onFocus={() => onHoverCell?.(cellIndex)}
                  onBlur={() => onHoverCell?.(null)}
                  className={`border-2 rounded-xl p-3 flex flex-col justify-between transition-all ${
                    filteredProperties.length === 1 ? 'sm:col-span-2' : ''
                  } ${
                    isMort
                      ? 'bg-slate-100/80 border-slate-300 opacity-90'
                      : 'bg-white border-slate-300 shadow-sm hover:border-slate-400'
                  }`}
                >
>>>>
```

#### Snippet 2.2: Rút gọn nhãn đất trống tại `sm:` và `md:` để giải phóng 80px cho tên địa danh (L319-L324)
```tsx
<<<<
                              {piece.isVacant ? (
                                <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                                  <span className="sm:hidden">{piece.price ? formatCurrency(piece.price) : 'Trống'}</span>
                                  <span className="hidden sm:inline">Đất trống {piece.price ? `(${formatCurrency(piece.price)})` : ''}</span>
                                </span>
                              ) : (
====
                              {piece.isVacant ? (
                                <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                                  <span className="lg:hidden">{piece.price ? formatCurrency(piece.price) : 'Trống'}</span>
                                  <span className="hidden lg:inline">Đất trống {piece.price ? `(${formatCurrency(piece.price)})` : ''}</span>
                                </span>
                              ) : (
>>>>
```

---

### Task 3: Bảo Toàn Hợp Đồng Kiểm Thử & Nới Rộng Responsive trong `trade_partner_strip.tsx`

**Target physical file**: `src/client/ui/modals/trade/trade_partner_strip.tsx`

#### Snippet 3.1: Giữ nguyên vẹn substring `truncate max-w-[120px]` và override cho Desktop (L79-L89)
```tsx
<<<<
                <span>{isBot ? (persBadge?.icon ?? '🤖') : '👤'}</span>
                <span className="truncate max-w-[120px] font-bold">{partner.name}</span>
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-black/10 font-bold shrink-0">
                  {formatCurrency(partner.balance)}
                </span>
                {needBadgeText && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold truncate max-w-[90px] hidden sm:inline-block">
                    {needBadgeText}
                  </span>
                )}
====
                <span>{isBot ? (persBadge?.icon ?? '🤖') : '👤'}</span>
                <span className="truncate max-w-[120px] sm:max-w-[180px] md:max-w-none font-bold">{partner.name}</span>
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-black/10 font-bold shrink-0">
                  {formatCurrency(partner.balance)}
                </span>
                {needBadgeText && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold truncate max-w-[90px] md:max-w-none hidden sm:inline-block">
                    {needBadgeText}
                  </span>
                )}
>>>>
```

---

### Task 4: Đồng Bộ Phân Cấp Tương Phản Màu trong `bond_issuance_tab.tsx`

**Target physical file**: `src/client/ui/modals/bond_issuance_tab.tsx`

#### Snippet 4.1: Đồng bộ màu cảnh báo cho cả Net Worth và BĐS sạch khi thiếu điều kiện (L141-L153)
```tsx
<<<<
            <span className="font-mono text-slate-600 shrink-0">{formatCurrency(playerNetWorth)}</span>
          </div>
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="shrink-0">{hasEnoughDeeds ? '✔️' : '❌'}</span>
              <span className={`truncate ${hasEnoughDeeds ? 'text-slate-800 font-medium' : 'text-rose-700 font-bold'}`}>
                BĐS sạch chưa thế chấp ≥ 2 ô
              </span>
            </span>
            <span className="font-mono text-slate-600 shrink-0">{unmortgagedPropertiesCount} / 2</span>
====
            <span className={`font-mono shrink-0 font-bold ${hasNetWorth ? 'text-slate-600 font-normal' : 'text-rose-700'}`}>
              {formatCurrency(playerNetWorth)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="shrink-0">{hasEnoughDeeds ? '✔️' : '❌'}</span>
              <span className={`truncate ${hasEnoughDeeds ? 'text-slate-800 font-medium' : 'text-rose-700 font-bold'}`}>
                BĐS sạch chưa thế chấp ≥ 2 ô
              </span>
            </span>
            <span className={`font-mono shrink-0 font-bold ${hasEnoughDeeds ? 'text-slate-600 font-normal' : 'text-rose-700'}`}>
              {unmortgagedPropertiesCount} / 2
            </span>
>>>>
```

---

## 5. CHIẾN LƯỢC KIỂM THỬ TDD TẠI TRẠM 1 (STATION 1 QA MANDATE - UNIVERSAL 5-FACET MATRIX)

**Target physical file**: `tests/contracts/imp236_desktop_uiux_viewport_harmonization.test.ts` (New file)

Số lượng test cases: Đúng **17 atomic contract tests** (>= 15 test floor), zero loops, zero static checklist tests.

- `TC-DVP-01`: Khi `filteredProperties.length === 1`, thẻ BĐS mang class `sm:col-span-2` để chiếm trọn chiều ngang modal.
- `TC-DVP-02`: Khi `filteredProperties.length >= 2`, các thẻ BĐS KHÔNG mang class `sm:col-span-2`, duy trì lưới 2 cột.
- `TC-DVP-03`: Tên địa danh trong "Mảnh Ghép Còn Thiếu" bảo tồn `truncate text-[11px] sm:text-xs` và không bị che khuất.
- `TC-DVP-04`: Khi `compact: true`, `TitleDeedRentTable` kết xuất cả khối Mobile (`md:hidden`) và khối Desktop (`hidden md:block`).
- `TC-DVP-05`: Khối Desktop chứa đầy đủ 4 cấp (C0, C1, C2, C3) với đầy đủ thông số tiền thuê và chi phí nâng cấp.
- `TC-DVP-06`: Khối Mobile chứa Mini Rent Bar (`C0`, `x2 ĐỘC QUYỀN`, `C3`) và nút toggle mở rộng.
- `TC-DVP-07`: Nút toggle chứa nhãn ngắn gọn `'Xem chi tiết 4 cấp nâng cấp (C0 - C3)'` và bảo tồn tiền tố `'Xem chi tiết 4 cấp nâng cấp'`.
- `TC-DVP-07b`: Nút thu gọn `data-testid="collapse-rent-tiers"` hiển thị khi `isExpanded` và mang class `md:hidden`.
- `TC-DVP-08`: `TradePartnerStrip` bảo tồn lớp gốc `truncate max-w-[120px]` và bổ sung `sm:max-w-[180px] md:max-w-none`.
- `TC-DVP-09`: Badge nhu cầu áp dụng `max-w-[90px] md:max-w-none` để không bị cắt chữ trên Desktop.
- `TC-DVP-10`: Dải Sub-Banner ngữ cảnh `data-testid="partner-sub-banner"` bảo tồn đầy đủ thông tin tâm lý và nhu cầu Bot.
- `TC-DVP-11`: Khi `hasEnoughDeeds === false`, chỉ số BĐS sạch mang class `text-rose-700`.
- `TC-DVP-12`: Khi `hasNetWorth === false`, chỉ số Net Worth mang class `text-rose-700`.
- `TC-DVP-13`: Hộp cảnh báo `data-testid="bond-blocked-notice"` hiển thị chuẩn xác khi không đủ điều kiện.
- `TC-DVP-14`: Modal Sổ Đỏ khi mua BĐS (`canBuy: true`) duy trì nút Mua với nhãn `Mua BĐS` và nút Từ Chối `✕ Từ Chối Mua`.
- `TC-DVP-15`: Chế độ Railroad (Ga) và Utility (Tiện Ích) trong `TitleDeedRentTable` hiển thị trọn vẹn trên Desktop.
- `TC-DVP-16`: Danh Mục BĐS bảo tồn 100% các props `data-onmouseenter="true"`, `onMouseEnter`, `onMouseLeave`, `onFocus`, `onBlur`.

---

## 6. QUY TRÌNH THỰC THI 4 TRẠM (CLOSED-LOOP PIPELINE)

```
[MAIN AGENT DRAFTS PLAN REV 2.1]
       │
       ▼
[node scripts/audit_plan.mjs] ──► Mechanical Scan PASS (5 files verified, 7 snippets match, 17 tests clean)
       │
       ▼
[plan-griller AUDIT (P1-P5)] ──► Renders .agents/audit/PLAN_AUDIT_IMP-236.md (HARDENED_APPROVED)
       │
       ▼
[🚦 ACTIVATE 4-STATION CLOSED-LOOP PIPELINE]
       │
       ├─► Trạm 1 (RED Contract Test): qa-tester viết 17 atomic tests, chứng minh RED.
       ├─► Trạm 2 (GREEN Implementation): implementer chỉnh sửa tối thiểu theo drop-in snippets.
       ├─► Trạm 2.5 (Fast Pre-Filter Sweep): scout quét tsc, LOC budgets, dirty casts, console.log.
       ├─► Trạm 3 (Review Funnel):
       │     ├─► Phase 3.0: Chụp ảnh giao diện thực tế vào .agents/tmp/
       │     ├─► Phase 3.1: spec-reviewer phê duyệt spec fidelity 100%.
       │     └─► Phase 3.2: code-reviewer & ui-craft-reviewer phê duyệt kiến trúc và mỹ thuật.
       └─► Trạm 4 (Chaos Sentinel): chaos-sentinel chạy 3 probes vật lý, ký biên bản evidence.
```
