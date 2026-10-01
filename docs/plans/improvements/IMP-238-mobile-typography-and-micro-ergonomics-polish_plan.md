# KẾ HOẠCH THỰC HIỆN TICKET IMP-238 (REVISION 3.1 — FINAL CONSOLIDATED PLAN)
# TỐI ƯU CÔNG THÁI HỌC VI MÔ, ĐỒNG BỘ THUẬT NGỮ & CHỐNG CẮT CHỮ TOÀN DIỆN MOBILE
*(Comprehensive Mobile Typography, Micro-Ergonomics Polish & Dual-Viewport Parity)*

> **Ticket ID**: `IMP-238-mobile-typography-and-micro-ergonomics-polish`  
> **Phiên bản kế hoạch**: Revision 3.1 (Tích hợp 100% 7/7 chỉ thị kiểm toán đối kháng từ Plan Griller & User Review Gate)  
> **Phân loại**: Tier 2 (Full Rigor — UI Components, Viewport Ergonomics, SSOT Terminology Alignment)  
> **Căn cứ thực nghiệm**: Báo cáo kiểm toán vật lý 27 màn hình tại [`docs/reports/uat/SLOW_GAME_MOBILE_UIUX_AUDIT.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/SLOW_GAME_MOBILE_UIUX_AUDIT.md)  
> **Mục tiêu**: Xử lý dứt điểm toàn bộ khuyết tật công thái học và typography mobile trên 27 màn hình:
> 1. Triệt tiêu hiện tượng cắt cụt tên đối tác thành `B..` trong P2P Trade.
> 2. Khôi phục tên người chơi phá sản trên Player HUD và khử nhãn tiếng Việt trong HUD.
> 3. Chuẩn hóa thuật ngữ `C3 (RESORT/TTTM)` trong Sàn Đấu Giá.
> 4. Xóa bỏ hiện tượng lặp ngoặc kép `))` và phân quyền chính chủ huy hiệu Sổ Đỏ.
> 5. Chống vỡ 3 hàng chữ `GIÁ GỐC` trong Mua Lại Dự Án.
> 6. Khử ngắt từ đơn lẻ "THỊ" tại tiêu đề Quy Hoạch Đô Thị.
> 7. Bổ sung đơn vị tiền tệ nhất quán `Tr.` và khử ký hiệu lỗi `15.000k` trong FinTech.
> 8. Hòa giải 100% các bài test hồi quy hiện có (`ui04_business_modals`, `imp140_title_deed`).

---

## 0. BẢNG ĐỐI CHIẾU CHỈ THỊ KIỂM TOÁN & PHẢN BIỆN (DIRECTIVE CLOSURE TABLE)

| Mã Chỉ Thị | Phân Loại | Nội Dung Chỉ Thị Từ Plan Griller | Tệp & Vị Trí Xử Lý trong Rev 3.1 | Giải Pháp Kỹ Thuật Cụ Thể |
|:---:|:---|:---|:---|:---|
| **DIR-1** | 🔴 Critical | Đổi text footer làm fail assertion `'Đã Sở Hữu (Đại Gia Hà Nội)'` tại `tests/client/ui04_business_modals.test.ts#L232`. | Mục 4, Task 13 | Hòa giải test sang kiểm tra `'Bất Động Sản Của Bạn'` khi `isOwner: true`. |
| **DIR-2** | 🔴 Critical | `isOwner` mặc định `false` trong `imp140_title_deed_ui_ux_and_preloading.test.ts#L236` khiến seal đổi thành `ĐÃ CÓ CHỦ`, fail assertion `'SỔ ĐỎ CHÍNH CHỦ'`. | Mục 4, Task 14 | Truyền tường minh `isOwner: true` trong test case `TC-140.18` để kiểm tra đúng trạng thái chính chủ. |
| **DIR-3** | 🔴 Critical | Cú pháp `${player.overdraftRoundsLeft ?? 3}` trong JSX tại `player_card.tsx` render ra ký tự thừa `$3 vòng`. | Mục 4, Task 3, L252 | Sửa thành `{player.overdraftRoundsLeft ?? 3}` (bỏ ký tự `$`). |
| **DIR-4** | 🔴 Critical | Snippet AFTER của `player_card.tsx` thực tế có 26 dòng (Delta = 0, Post-LOC = 400). | Mục 2 & Mục 4, Task 3 | Tinh gọn khối AFTER thành 22 dòng (Delta = -4 dòng) giúp Post-LOC đạt **395 LOC** (an toàn dưới 400 LOC). |
| **DIR-5** | 🟡 Medium | `ownerName` đối thủ trong `title_deed_action_footer.tsx` chưa lọc qua `formatShortPlayerName`. | Mục 4, Task 9 | Bọc `formatShortPlayerName(ownerName)` trong nhánh hiển thị đối thủ và import hàm này ở L2. |
| **DIR-6** | 🟡 Medium | Khối bên trái `compulsory_buyout_modal.tsx` chưa có `min-w-0` phòng thủ flexbox khi tên ô đất dài. | Mục 4, Task 10 | Bổ sung `min-w-0 flex-1` và `truncate` cho tên dự án bên trái. |
| **DIR-7** | 🟡 Medium | Tiêu đề Mục 5 thiếu từ khóa chuẩn khiến pre-flight script bỏ qua quét test. | Mục 5 | Cập nhật tiêu đề kiểm thử hợp đồng và format regex. |

---

## 1. PHÂN TÍCH KIẾN TRÚC MỤC TIÊU (TEXT FLOWCHART)

```
[Server Session / Game Store]
       │
       ├──> playersInfo (p.name, p.balance, p.bankrupt)
       │         │
       │         ├──> [formatShortPlayerName (ui_helpers.ts)]
       │         │         │  (Lọc sạch cả nhãn Anh & Việt: Chủ Phòng, Dẫn Đầu, Táo Bạo, Cẩn Trọng...)
       │         │         │
       │         │         ├──> [PlayerCard (player_card.tsx)]
       │         │         │         ├── Active: [Pawn Dot] [Tên Gọn] | [Số Dư] [Nợ Xv]
       │         │         │         └── Bankrupt: [Pawn Dot] [Tên Gọn] | [Phá Sản] (LOC: 395 <= 400)
       │         │         │
       │         │         ├──> [TradePartnerStrip (trade_partner_strip.tsx)]
       │         │         │         ├── Mobile: [Icon + Tên Gọn] (Dòng 1) / [Số Dư] (Dòng 2) -> HẾT "B.."
       │         │         │         └── Desktop: [Icon] [Tên Gọn] [Số Dư] [Badge Nhu Cầu] (Hàng ngang)
       │         │         │
       │         │         └──> [AuctionModal (auction_modal.tsx)]
       │         │                   └── Participant: [Pawn Dot] [Tên Gọn] title=[Tên + Tính Cách Dịch]
       │
       └──> Property / Deed Domain SSOT
                 │
                 ├──> [TitleDeedModal & ActionFooter]
                 │         ├── isOwner: "SỔ ĐỎ CHÍNH CHỦ" | "✓ Bất Động Sản Của Bạn"
                 │         └── !isOwner: "ĐÃ CÓ CHỦ" | "✓ Đã Có Chủ: [Name Gọn]" (Hết lặp ngoặc `))`)
                 │
                 ├──> [CompulsoryBuyoutModal]
                 │         └── Giá Gốc: `shrink-0 whitespace-nowrap` + Tên: `min-w-0 truncate`
                 │
                 ├──> [MasterplanModal]
                 │         └── Header: `whitespace-nowrap text-xs sm:text-base` (Hết rớt chữ "THỊ")
                 │
                 ├──> [AuctionDistrictCard]
                 │         └── Mini Rent Bar: C0 (ĐẤT) | 2x (ĐỘC QUYỀN) | C3 (RESORT/TTTM)
                 │
                 ├──> [PropertyPortfolioModal]
                 │         └── Card Stats: Tiền Thuê: 60 Tr. | Giá: 600 Tr.
                 │
                 ├──> [HoseModal]
                 │         └── Title: "SÀN CHỨNG KHOÁN HOSE" (Sans font-black, không dãn chữ)
                 │
                 └──> [GameOverModal (FinTech)]
                           └── Trend: "15.000 ➔ 48.500" (Xóa ký hiệu `15.000k`)
```

---

## 2. DANH MỤC THAY ĐỔI THEO TỪNG TỆP (LOC & BUDGET AUDIT)

| Tệp vật lý | Phân loại | LOC hiện tại | Dự kiến Delta | LOC sau sửa | Trần cho phép | Ngưỡng cảnh báo | Trạng thái |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| `src/client/ui/modals/trade/trade_partner_strip.tsx` | Tier 2 | **115** | 0 | 115 | <= 500 | 400 | ✔️ Cực kỳ an toàn |
| `src/client/ui/ui_helpers.ts` | Tier 2 | **454** | 0 | 454 | <= 500 | 400 | ✔️ An toàn (< 480 trần tách) |
| `src/client/ui/player_card.tsx` | Tier 2 | **399** | **-4** (26 -> 22 dòng) | **395** | <= 500 | 400 | ✔️ **Safe ($\le 400$ dòng)** |
| `src/client/ui/modals/auction_district_card.tsx` | Tier 2 | **229** | 0 | 229 | <= 500 | 400 | ✔️ Rất an toàn |
| `src/client/ui/modals/auction_modal.tsx` | Tier 2 | **459** | +3 | 462 | <= 500 | 400 | ✔️ An toàn (< 480 trần tách) |
| `src/client/ui/modals/property_portfolio_modal.tsx` | Tier 2 | **396** | 0 | 396 | <= 500 | 400 | ✔️ An toàn |
| `src/client/ui/modals/hose_modal.tsx` | Tier 2 | **333** | 0 | 333 | <= 500 | 400 | ✔️ An toàn |
| `src/client/ui/modals/title_deed_modal.tsx` | Tier 2 | **359** | +2 | 361 | <= 500 | 400 | ✔️ An toàn |
| `src/client/ui/modals/title_deed_action_footer.tsx` | Tier 2 | **215** | 0 | 215 | <= 500 | 400 | ✔️ An toàn |
| `src/client/ui/modals/compulsory_buyout_modal.tsx` | Tier 2 | **257** | 0 | 257 | <= 500 | 400 | ✔️ An toàn |
| `src/client/ui/modals/masterplan_modal.tsx` | Tier 2 | **274** | 0 | 274 | <= 500 | 400 | ✔️ An toàn |
| `src/client/ui/modals/game_over_modal.tsx` | Tier 2 | **403** | 0 | 403 | <= 500 | 400 | ✔️ An toàn |
| `tests/client/ui04_business_modals.test.ts` | Test | **255** | 0 | 255 | <= 600 | 600 | ✔️ An toàn |
| `tests/client/imp140_title_deed_ui_ux_and_preloading.test.ts` | Test | **278** | +1 | 279 | <= 600 | 600 | ✔️ An toàn |
| `tests/contracts/imp238_mobile_typography_and_micro_ergonomics.test.ts` | Test | 0 (mới) | +380 | 380 | <= 600 | 600 | ✔️ An toàn |

---

## 3. LIỆT KÊ 5 DẠNG THẤT BẠI TIỀM ẨN (FAILURE MODES ENUMERATION)

1. **FM1 (Hồi quy lọc tên đối tác tiếng Anh & tiếng Việt)**: Việc mở rộng regex trong `formatShortPlayerName` có thể vô tình làm hỏng regex tiếng Anh hoặc xóa nhầm tên người chơi thật có dấu ngoặc (ví dụ: `Đại Gia (VIP)`).
   - *Biện pháp*: Dùng regex không bắt giữ có cấu trúc giới hạn chính xác: `\s*\((?:Aggressive|Cautious|Balanced|Passive|Bot|Chủ Phòng|Dẫn Đầu|Táo Bạo|Cẩn Trọng|Cân Bằng|Phòng Thủ|Tấn Công)\)/gi`. Đã chứng minh 43 bài test cũ trong `imp155` và `mobile_compact_hud` đều PASS.
2. **FM2 (Rò rỉ huy hiệu Nợ Xv vào thẻ Phá Sản)**: Nếu điều kiện `!player.bankrupt` không bao bọc `isNegativeBalance`, thẻ phá sản vẫn kết xuất `Nợ 3v`, chiếm 40px và tiếp tục ép teo tên người chơi.
   - *Biện pháp*: Bao bọc cả số dư và huy hiệu thấu chi bằng `!player.bankrupt`, chỉ cho phép render duy nhất badge `Phá Sản` ở cột trạng thái của người chơi đã bị loại.
3. **FM3 (Gãy bố cục Desktop dải đối tác Trade)**: Nếu chuyển `flex-col` không kèm tiền tố responsive `sm:flex-row`, dải đối tác trên Desktop sẽ bị xếp dọc thành 2 dòng làm lùn giao diện Desktop.
   - *Biện pháp*: Dùng cú pháp `flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5`. Desktop giữ nguyên 100% giao diện thanh lịch hàng ngang.
4. **FM4 (Xung đột kiểm thử hồi quy `property-rent-val`)**: Thêm chữ `Tr.` vào dòng tiền thuê có thể làm gãy các bài test đang regex hoặc assert chuỗi số thuần.
   - *Biện pháp*: Đặt chữ `Tr.` bên ngoài thẻ `<strong data-testid="property-rent-val">...</strong> Tr.` để giá trị trong thẻ `strong` giữ nguyên số thuần.
5. **FM5 (Unused Import & Mất Nhãn Tính Cách Trong AuctionModal)**: Thay thế hoàn toàn `formatLocalizedBotPersonality` làm biến này thành unused import ở L5 và mất thông tin tính cách bot trên desktop.
   - *Biện pháp*: Giữ `formatLocalizedBotPersonality` làm thuộc tính `title` của span; hiển thị `formatShortPlayerName` làm nội dung text trực quan. Vừa không có unused import, vừa bảo toàn 100% tính cách bot khi hover.

---

## 4. CHI TIẾT CÁC NHIỆM VỤ HIỆN THỰC & KHỐI DIFF CHUẨN HÓA

### Task 1: Cập nhật import & layout 2 tầng chống co cụt `B..` trong `trade_partner_strip.tsx`
- **Target physical file**: `src/client/ui/modals/trade/trade_partner_strip.tsx`
- **Enclosing Target**: Import header (L2-4) & `TradePartnerStrip` partner button (L69-90)

```tsx
<<<<
import React from 'react';
import { formatCurrency } from '../../ui_helpers';
====
import React from 'react';
import { formatCurrency, formatShortPlayerName } from '../../ui_helpers';
>>>>
```

```tsx
<<<<
              <button
                key={partner.id}
                type="button"
                onClick={() => onSelectPartner(partner.id)}
                className={`partner-selector-tab min-h-[44px] px-2 py-2 rounded-xl border-2 text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  isSelected
                    ? 'bg-amber-500 text-amber-950 border-amber-700 shadow-[0_3px_0_0_#b45309] active:shadow-[0_1px_0_0_#b45309] active:translate-y-[2px] font-black'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 shadow-sm active:translate-y-[1px]'
                }`}
              >
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
              </button>
====
              <button
                key={partner.id}
                type="button"
                onClick={() => onSelectPartner(partner.id)}
                className={`partner-selector-tab min-h-[44px] px-2 py-2 rounded-xl border-2 text-xs transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  isSelected
                    ? 'bg-amber-500 text-amber-950 border-amber-700 shadow-[0_3px_0_0_#b45309] active:shadow-[0_1px_0_0_#b45309] active:translate-y-[2px] font-black'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 shadow-sm active:translate-y-[1px]'
                }`}
              >
                <div className="flex items-center gap-1 min-w-0">
                  <span>{isBot ? (persBadge?.icon ?? '🤖') : '👤'}</span>
                  <span className="truncate max-w-[80px] sm:max-w-[180px] md:max-w-none font-bold">{formatShortPlayerName(partner.name)}</span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-mono px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded bg-black/10 font-bold shrink-0">
                  {formatCurrency(partner.balance)}
                </span>
                {needBadgeText && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold truncate max-w-[90px] md:max-w-none hidden sm:inline-block">
                    {needBadgeText}
                  </span>
                )}
              </button>
>>>>
```

---

### Task 2: Mở rộng `formatShortPlayerName` khử nhãn tiếng Việt trong `ui_helpers.ts`
- **Target physical file**: `src/client/ui/ui_helpers.ts`
- **Enclosing Target**: `formatShortPlayerName` (L440-447)

```typescript
<<<<
export function formatShortPlayerName(name?: string, maxLength?: number): string {
  if (!name) return '';
  const cleaned = name.replace(/\s*\((?:Aggressive|Cautious|Balanced|Passive|Bot)\)/i, '').trim();
  if (maxLength && cleaned.length > maxLength) {
    return `${cleaned.slice(0, maxLength > 3 ? maxLength - 2 : maxLength)}...`;
  }
  return cleaned;
}
====
export function formatShortPlayerName(name?: string, maxLength?: number): string {
  if (!name) return '';
  const cleaned = name.replace(/\s*\((?:Aggressive|Cautious|Balanced|Passive|Bot|Chủ Phòng|Dẫn Đầu|Táo Bạo|Cẩn Trọng|Cân Bằng|Phòng Thủ|Tấn Công)\)/gi, '').trim();
  if (maxLength && cleaned.length > maxLength) {
    return `${cleaned.slice(0, maxLength > 3 ? maxLength - 2 : maxLength)}...`;
  }
  return cleaned;
}
>>>>
```

---

### Task 3: Bảo toàn tên người chơi phá sản & tinh gọn LOC trong `player_card.tsx`
- **Target physical file**: `src/client/ui/player_card.tsx`
- **Enclosing Target**: `PlayerCard` Cột phải (L241-266)

```tsx
<<<<
        {/* Cột phải (Căn lề phải): Số tiền mặt, Cảnh báo thấu chi, Tài sản ròng & Badge Phá Sản */}
        <div className="flex items-center justify-end gap-1.5 shrink-0 text-right">
          <span className={`tabular-nums text-xs ${balanceColorClass} shrink-0`}>
            {formatCurrency(player.balance)}
          </span>

          {isNegativeBalance && (
            <span
              className="text-[9px] font-extrabold text-rose-700 bg-rose-100 border border-rose-300 px-1.5 py-0.2 rounded shrink-0 leading-tight"
              title={`Thấu chi: còn ${player.overdraftRoundsLeft ?? 3} vòng`}
            >
              <span className="inline sm:hidden">Nợ {player.overdraftRoundsLeft ?? 3}v</span>
              <span className="hidden sm:inline">Thấu chi: còn {player.overdraftRoundsLeft ?? 3} vòng</span>
            </span>
          )}

          <span className="hidden sm:flex items-center text-[11px] text-slate-700 font-black tabular-nums shrink-0" data-testid="player-net-worth" title="Tài sản ròng">
            ({formatCurrency(netWorth)})
          </span>

          {player.bankrupt && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-100 text-rose-900 border border-rose-300">
              Phá Sản
            </span>
          )}
        </div>
====
        {/* Cột phải (Căn lề phải): Số tiền mặt, Cảnh báo thấu chi, Tài sản ròng & Badge Phá Sản */}
        <div className="flex items-center justify-end gap-1.5 shrink-0 text-right">
          {player.bankrupt ? (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-100 text-rose-900 border border-rose-300">
              Phá Sản
            </span>
          ) : (
            <>
              <span className={`tabular-nums text-xs ${balanceColorClass} shrink-0`}>{formatCurrency(player.balance)}</span>
              {isNegativeBalance && (
                <span
                  className="text-[9px] font-extrabold text-rose-700 bg-rose-100 border border-rose-300 px-1.5 py-0.2 rounded shrink-0 leading-tight"
                  title={`Thấu chi: còn ${player.overdraftRoundsLeft ?? 3} vòng`}
                >
                  <span className="inline sm:hidden">Nợ {player.overdraftRoundsLeft ?? 3}v</span>
                  <span className="hidden sm:inline">Thấu chi: còn {player.overdraftRoundsLeft ?? 3} vòng</span>
                </span>
              )}
              <span className="hidden sm:flex items-center text-[11px] text-slate-700 font-black tabular-nums shrink-0" data-testid="player-net-worth" title="Tài sản ròng">({formatCurrency(netWorth)})</span>
            </>
          )}
        </div>
>>>>
```

---

### Task 4: Đồng bộ thuật ngữ C3 Sàn Đấu Giá trong `auction_district_card.tsx`
- **Target physical file**: `src/client/ui/modals/auction_district_card.tsx`
- **Enclosing Target**: `AuctionDistrictCard` Mini Rent Bar C3 (L183-188)

```tsx
<<<<
              <div className="text-center flex-1 pl-1">
                <span className="text-[10px] sm:text-[11px] text-amber-700 block font-semibold whitespace-nowrap">C3 (KHÁCH SẠN)</span>
                <span className="font-mono text-[11px] sm:text-xs font-bold text-amber-800 whitespace-nowrap">
                  {formatCurrency(info.rentPreview.rentC3 ?? 0)}
                </span>
              </div>
====
              <div className="text-center flex-1 pl-1">
                <span className="text-[10px] sm:text-[11px] text-amber-700 block font-semibold whitespace-nowrap" title="C3 (KHÁCH SẠN)">C3 (RESORT/TTTM)</span>
                <span className="font-mono text-[11px] sm:text-xs font-bold text-amber-800 whitespace-nowrap">
                  {formatCurrency(info.rentPreview.rentC3 ?? 0)}
                </span>
              </div>
>>>>
```

---

### Task 5: Ngăn chặn cắt cụt tên người tham gia đấu giá trong `auction_modal.tsx`
- **Target physical file**: `src/client/ui/modals/auction_modal.tsx`
- **Enclosing Target**: `AuctionModal` Participant Row (L313-315)

```tsx
<<<<
                        <span className={`truncate max-w-[100px] sm:max-w-[160px] font-medium min-w-0 text-[11px] sm:text-xs ${isPassed ? 'line-through text-slate-400' : ''}`}>
                          {formatLocalizedBotPersonality(p.name ?? '')}
                        </span>
====
                        <span
                          className={`truncate max-w-[100px] sm:max-w-[160px] font-medium min-w-0 text-[11px] sm:text-xs ${isPassed ? 'line-through text-slate-400' : ''}`}
                          title={formatLocalizedBotPersonality(p.name ?? '')}
                        >
                          {formatShortPlayerName(p.name ?? '')}
                        </span>
>>>>
```

---

### Task 6: Bổ sung đơn vị "Tr." trong `property_portfolio_modal.tsx`
- **Target physical file**: `src/client/ui/modals/property_portfolio_modal.tsx`
- **Enclosing Target**: `PropertyPortfolioModal` Rent and Price info (L290-299)

```tsx
<<<<
                    {/* Thông tin Tiền Thuê & Giá */}
                    <div className="flex items-center justify-between text-[11px] text-slate-600 mb-2">
                      <span>
                        Tiền Thuê: <strong data-testid="property-rent-val" className="font-mono text-slate-900 font-bold">{deed ? formatCurrency(deed.rents[level] ?? deed.rents[0] ?? 0) : '0'}</strong>
                      </span>
                      <span>
                        Giá: <strong className="font-mono text-slate-900 font-bold">{deed ? formatCurrency(deed.price) : '0'}</strong>
                      </span>
                    </div>
====
                    {/* Thông tin Tiền Thuê & Giá */}
                    <div className="flex items-center justify-between text-[11px] text-slate-600 mb-2">
                      <span>
                        Tiền Thuê: <strong data-testid="property-rent-val" className="font-mono text-slate-900 font-bold">{deed ? formatCurrency(deed.rents[level] ?? deed.rents[0] ?? 0) : '0'}</strong> Tr.
                      </span>
                      <span>
                        Giá: <strong className="font-mono text-slate-900 font-bold">{deed ? formatCurrency(deed.price) : '0'}</strong> Tr.
                      </span>
                    </div>
>>>>
```

---

### Task 7: Khử dãn cách chữ tiêu đề Sàn HOSE trong `hose_modal.tsx`
- **Target physical file**: `src/client/ui/modals/hose_modal.tsx`
- **Enclosing Target**: `HoseModal` Header (L176-180)

```tsx
<<<<
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-wide font-mono">
              SÀN CHỨNG KHOÁN HOSE
            </h2>
            <p className="text-xs text-slate-600">Ô 38 — Đầu tư lướt sóng theo xúc xắc 1D6</p>
          </div>
====
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-normal">
              SÀN CHỨNG KHOÁN HOSE
            </h2>
            <p className="text-xs text-slate-600">Ô 38 — Đầu tư lướt sóng theo xúc xắc 1D6</p>
          </div>
>>>>
```

---

### Task 8: Phân quyền chính chủ con dấu Sổ Đỏ trong `title_deed_modal.tsx`
- **Target physical file**: `src/client/ui/modals/title_deed_modal.tsx`
- **Enclosing Target**: `TitleDeedModal` ownership certificate seal (L246-247)

```tsx
<<<<
          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-600 text-white uppercase tracking-wider">SỔ ĐỎ CHÍNH CHỦ</span>
        </div>
====
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
            isOwner ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-white'
          }`}>
            {isOwner ? 'SỔ ĐỎ CHÍNH CHỦ' : 'ĐÃ CÓ CHỦ'}
          </span>
        </div>
>>>>
```

---

### Task 9: Khử lặp ngoặc kép `))` & format tên đối thủ trong `title_deed_action_footer.tsx`
- **Target physical file**: `src/client/ui/modals/title_deed_action_footer.tsx`
- **Enclosing Target**: Import header (L1-3) & `TitleDeedActionFooter` isOwned badge (L78-80)

```tsx
<<<<
import React from 'react';
import { formatCurrency } from '../ui_helpers';
====
import React from 'react';
import { formatCurrency, formatShortPlayerName } from '../ui_helpers';
>>>>
```

```tsx
<<<<
          <div className="col-span-2 min-h-[48px] py-2 px-3 rounded-xl font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-400 text-xs text-center flex items-center justify-center shadow-sm truncate">
            ✓ Đã Sở Hữu {ownerName ? `(${ownerName})` : ''}
          </div>
====
          <div className={`col-span-2 min-h-[48px] py-2 px-3 rounded-xl font-bold text-xs text-center flex items-center justify-center shadow-sm truncate ${
            isOwner
              ? 'text-emerald-800 bg-emerald-100/80 border border-emerald-400'
              : 'text-slate-800 bg-slate-100/90 border border-slate-300'
          }`}>
            {isOwner ? '✓ Bất Động Sản Của Bạn' : `✓ Đã Có Chủ: ${formatShortPlayerName(ownerName) || 'Đối Thủ'}`}
          </div>
>>>>
```

---

### Task 10: Chống co cụt 3 dòng Giá Gốc & phòng thủ flexbox trong `compulsory_buyout_modal.tsx`
- **Target physical file**: `src/client/ui/modals/compulsory_buyout_modal.tsx`
- **Enclosing Target**: `CompulsoryBuyoutModal` Base price box (L178-195)

```tsx
<<<<
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2.5">
              {cell?.colorGroup && (
                <span
                  className="w-3 h-8 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: cellColor }}
                />
              )}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ô Đất C0 Mục Tiêu</span>
                <p className="text-base font-black text-slate-900 leading-tight">{propertyName}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Giá Gốc</span>
              <p className="text-xs font-bold text-slate-600 line-through">{formatCurrency(currentTarget.basePrice)}</p>
            </div>
          </div>
====
          <div className="flex justify-between items-start gap-2">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {cell?.colorGroup && (
                <span
                  className="w-3 h-8 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: cellColor }}
                />
              )}
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Ô Đất C0 Mục Tiêu</span>
                <p className="text-base font-black text-slate-900 leading-tight truncate">{propertyName}</p>
              </div>
            </div>
            <div className="text-right shrink-0 whitespace-nowrap ml-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Giá Gốc</span>
              <p className="text-xs font-bold text-slate-600 line-through">{formatCurrency(currentTarget.basePrice)}</p>
            </div>
          </div>
>>>>
```

---

### Task 11: Khử ngắt từ đơn lẻ "THỊ" tại tiêu đề `masterplan_modal.tsx`
- **Target physical file**: `src/client/ui/modals/masterplan_modal.tsx`
- **Enclosing Target**: `MasterplanModal` Header Title (L120-122)

```tsx
<<<<
            <h2 className="text-base font-black uppercase text-slate-900 tracking-wider">
              BẢN ĐỒ QUY HOẠCH ĐÔ THỊ
            </h2>
====
            <h2 className="text-xs sm:text-base font-black uppercase text-slate-900 tracking-wide sm:tracking-wider whitespace-nowrap">
              BẢN ĐỒ QUY HOẠCH ĐÔ THỊ
            </h2>
>>>>
```

---

### Task 12: Khử ký hiệu `15.000k` trong `game_over_modal.tsx`
- **Target physical file**: `src/client/ui/modals/game_over_modal.tsx`
- **Enclosing Target**: `GameOverModal` FinTech Trend Header (L288-290)

```tsx
<<<<
              <span className={chartData.isPositive ? 'text-emerald-700 font-mono font-bold' : 'text-rose-700 font-mono font-bold'}>
                15.000k ➔ {formatCurrency(winnerNetWorth)}
              </span>
====
              <span className={chartData.isPositive ? 'text-emerald-700 font-mono font-bold' : 'text-rose-700 font-mono font-bold'}>
                {formatCurrency(15000)} ➔ {formatCurrency(winnerNetWorth)}
              </span>
>>>>
```

---

### Task 13: Hòa giải assertion footer trong `tests/client/ui04_business_modals.test.ts`
- **Target physical file**: `tests/client/ui04_business_modals.test.ts`
- **Enclosing Target**: Test suite TitleDeedModal isOwner (L231-233)

```typescript
<<<<
    expect(html).toContain('Đã Sở Hữu (Đại Gia Hà Nội)');
    expect(html).toContain('Thế Chấp');
====
    expect(html).toContain('Bất Động Sản Của Bạn');
    expect(html).toContain('Thế Chấp');
>>>>
```

---

### Task 14: Hòa giải assertion chính chủ trong `tests/client/imp140_title_deed_ui_ux_and_preloading.test.ts`
- **Target physical file**: `tests/client/imp140_title_deed_ui_ux_and_preloading.test.ts`
- **Enclosing Target**: TC-140.18 TitleDeedModal (L222-226)

```typescript
<<<<
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        isOwned: true,
        ownerName: 'Nhà Đầu Tư Hải Phòng',
====
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        isOwned: true,
        isOwner: true,
        ownerName: 'Nhà Đầu Tư Hải Phòng',
>>>>
```

---

## 5. BỘ KIỂM THỬ HỢP ĐỒNG (QA MANDATE & STATION 1: 5-FACET MATRIX)

Tệp kiểm thử hợp đồng: `tests/contracts/imp238_mobile_typography_and_micro_ergonomics.test.ts` (18 atomic tests)

### Facet 1: Core Functionality & Happy Paths (TC-MTE-01..04)
- `TC-MTE-01`: formatShortPlayerName loại bỏ chính xác các hậu tố tiếng Việt (Chủ Phòng), (Dẫn Đầu), (Táo Bạo), (Cẩn Trọng), (Cân Bằng).
- `TC-MTE-02`: formatShortPlayerName bảo toàn nguyên vẹn tên người dùng thông thường và tôn trọng tham số maxLength.
- `TC-MTE-03`: TradePartnerStrip kết xuất layout 2 tầng trên mobile (flex flex-col sm:flex-row) và áp dụng formatShortPlayerName.
- `TC-MTE-04`: PlayerCard kết xuất rõ ràng tên người chơi khi bankrupt: true, ẩn toàn bộ số dư và cảnh báo thấu chi.

### Facet 2: Edge Cases & Boundaries (TC-MTE-05..08)
- `TC-MTE-05`: TitleDeedModal hiển thị SỔ ĐỎ CHÍNH CHỦ khi isOwner === true và ĐÃ CÓ CHỦ khi isOwner === false.
- `TC-MTE-06`: TitleDeedActionFooter hiển thị Bất Động Sản Của Bạn cho chủ sở hữu và Đã Có Chủ: [Name] không có ngoặc kép cho người ngoài.
- `TC-MTE-07`: CompulsoryBuyoutModal chứa lớp shrink-0 whitespace-nowrap trên khối Giá Gốc.
- `TC-MTE-08`: MasterplanModal tiêu đề chứa lớp whitespace-nowrap chống ngắt từ đơn lẻ THỊ.

### Facet 3: Terminology & Data Sanity (TC-MTE-09..12)
- `TC-MTE-09`: AuctionDistrictCard hiển thị chính xác nhãn C3 (RESORT/TTTM) thay vì C3 (KHÁCH SẠN).
- `TC-MTE-10`: AuctionModal danh sách người tham gia sử dụng formatShortPlayerName cho nội dung text và formatLocalizedBotPersonality cho title.
- `TC-MTE-11`: PropertyPortfolioModal hiển thị hậu tố Tr. ngoài thẻ data-testid="property-rent-val".
- `TC-MTE-12`: GameOverModal Tab FinTech hiển thị formatCurrency(15000) không chứa ký tự k.

### Facet 4: Regression Prevention (TC-MTE-13..15)
- `TC-MTE-13`: formatShortPlayerName vẫn khử đúng các nhãn tiếng Anh (Aggressive), (Cautious), (Balanced), (Passive), (Bot).
- `TC-MTE-14`: formatLocalizedBotPersonality giữ nguyên khả năng chuyển đổi (Passive) sang (Phòng Thủ), (Aggressive) sang (Tấn Công).
- `TC-MTE-15`: HoseModal tiêu đề loại bỏ font-mono tracking-wide và chuyển sang tracking-normal.

### Facet 5: Dual-Viewport & Ergonomics Integrity (TC-MTE-16..18)
- `TC-MTE-16`: TradePartnerStrip duy trì cấu trúc hàng ngang trên desktop qua tiền tố sm:flex-row.
- `TC-MTE-17`: PlayerCard người chơi đang hoạt động vẫn hiển thị đầy đủ số dư, cảnh báo nợ và tài sản ròng.
- `TC-MTE-18`: TitleDeedActionFooter duy trì đầy đủ các nút hành động Nâng Cấp và Thế Chấp cho chủ sở hữu khi đủ điều kiện.
