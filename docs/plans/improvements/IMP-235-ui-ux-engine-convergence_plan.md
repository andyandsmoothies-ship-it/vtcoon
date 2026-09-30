# KẾ HOẠCH HÀNH ĐỘNG TOÀN DIỆN: KHẮC PHỤC 31 KHUYẾT TẬT UI/UX & LỖI TOMBSTONE ENGINE (REVISION 2.2)

> **Mã kế hoạch**: `IMP-235` (`IMP-UIUX-ENGINE-CONVERGENCE`)  
> **Phiên bản**: 2.2 (Tiếp thu & Khắc phục 100% Chỉ thị Kiểm toán Đối kháng của `plan-griller`)  
> **Phạm vi**: 31 khiếm khuyết UI/UX (Ảnh 1–13) + Lỗi Tombstone Serialization + Trải nghiệm Vỡ Nợ Trái Phiếu  
> **Tiêu chuẩn áp dụng**: ASD-STE100, WCAG 2.1 AA, Detroit TDD Classical Style, LOC Budget Tier 1/2, Scope Bundling Ban.

---

## 1. BẢNG ĐỐI CHIẾU 1:1 XỬ LÝ CÁC LUẬN ĐIỂM PHẢN BIỆN & CHỈ THỊ PLAN-GRILLER

### 1.1. Bảng Đối Chiếu 1:1 Xử Lý 7 Chỉ Thị Kiểm Toán Đối Kháng của Plan-Griller (Revision 2.2)

| # | Griller Directive (Revision 2.1 Audit) | Phân loại | Tình trạng | File & Dòng giải quyết cụ thể (Revision 2.2) |
| :-: | :--- | :---: | :---: | :--- |
| **G-1** | **[P1 - Broken Data Lifecycle]**: Kế hoạch gỡ bỏ `handleStartFireSaleAuction` làm hàng đợi `fireSaleQueue` kẹt vĩnh viễn, lượt trôi mất. | **CRITICAL** | **ĐÃ GIẢI QUYẾT** | [`src/server/bond_manager.ts` (dòng 225–233)](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/bond_manager.ts#L225-L233): Khôi phục việc gọi `handleStartFireSaleAuction(room, first, auctions, ...)` ngay khi vỡ nợ để chuyển pha sang `TurnPhase.AuctionPhase`, đồng thời gán `room.lastEventCard` thông báo biến cố. Bảo toàn FSM phát mãi BĐS thế chấp. |
| **G-2** | **[P1 - Divergent Type Pipeline]**: `deed?.type` không tồn tại trên `DeedDisplayInfo` (phải là `cellType`), crash TS2339 và sai màu ruy-băng. | **CRITICAL** | **ĐÃ GIẢI QUYẾT** | [`src/client/ui/modals/auction_modal.tsx` (dòng 213–216)](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/auction_modal.tsx#L213-L216): Đổi `deed?.type` thành `deed?.cellType === CellType.Railroad` và `deed?.cellType === CellType.Utility` khớp chuẩn interface `DeedDisplayInfo` tại `modal_helpers.ts#L11`. |
| **G-3** | **[P1 - Missing Runtime Imports]**: `auction_modal.tsx` và `auction_district_card.tsx` gọi `CellType`, `formatShortPlayerName` nhưng không import. | **CRITICAL** | **ĐÃ GIẢI QUYẾT** | [`src/client/ui/modals/auction_modal.tsx` (dòng 1–9)](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/auction_modal.tsx#L1-L9) & [`auction_district_card.tsx` (dòng 8)](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/auction_district_card.tsx#L8): Bổ sung đầy đủ import `CellType` từ `../../../domain/board_config`, `formatShortPlayerName` và `formatLocalizedBotPersonality` từ `../ui_helpers`. |
| **G-4** | **[P1 - Dead Helper & Test Failure]**: `formatLocalizedBotPersonality` chưa được gọi trong JSX `AuctionModal`, làm test `[TC-CONV-10]` FAIL. | **CRITICAL** | **ĐÃ GIẢI QUYẾT** | [`src/client/ui/modals/auction_modal.tsx` (dòng 306)](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/auction_modal.tsx#L306): Nối trực tiếp helper vào JSX danh sách bidder: `{formatLocalizedBotPersonality(p.name ?? '')}`. |
| **G-5** | **[P4 - WCAG AA Contrast Gap]**: `isBrightGroup` thiếu token `#F1C40F` (màu Vàng SSOT `theme.ts:30`), khiến nhóm Vàng dùng chữ trắng vi phạm WCAG. | **HIGH** | **ĐÃ GIẢI QUYẾT** | [`src/client/ui/modals/title_deed_modal.tsx` (dòng 134)](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/title_deed_modal.tsx#L134): Thêm `#F1C40F` vào điều kiện kiểm tra: `const isBrightGroup = ribbonColor === '#F1C40F' \|\| ribbonColor === '#EAB308' \|\| ribbonColor === '#38BDF8' \|\| ribbonColor === '#FACC15';`. |
| **G-6** | **[P3 - Actor Inversion on 0đ Bid]**: Ép `currentBid > 0` khiến giá thầu 0đ trong Fire Sale bị coi là vô hiệu, tước vương miện và hiện nút Rút Lui sai. | **HIGH** | **ĐÃ GIẢI QUYẾT** | [`src/client/ui/modals/auction_modal.tsx` (dòng 219–220)](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/auction_modal.tsx#L219-L220): Cập nhật điều kiện: `hasValidBid = Boolean(highestBidderId && (currentBid > 0 \|\| isFireSale));` và `isLeading = Boolean(myId && highestBidderId === myId && (currentBid > 0 \|\| isFireSale));`. |
| **G-7** | **[P2 - LOC Baseline Sát Trần]**: `session_manager.ts` (398/400) và `modal_host.tsx` (494/500) sát trần LOC. | **HIGH** | **ĐÃ GIẢI QUYẾT** | Áp dụng triệt để nguyên tắc **Zero-Delta In-place Replacement** (thay thế 1:1, không thêm dòng thừa hay chú thích dài) để bảo toàn 100% LOC budget. |

---

### 1.2. Bảng Đối Chiếu 1:1 Xử Lý 7 Luận Điểm Phản Biện Ban Đầu (User PB-1 đến PB-7)

| # | Luận điểm phản biện | Phân loại | Tình trạng | File & Dòng giải quyết cụ thể |
| :-: | :--- | :-: | :---: | :--- |
| **PB-1** | **Tombstone Sparse Delta vs Full Sync**: Cần kiểm tra xem ngoài `session_manager.ts` còn path nào tạo `CellDelta` không. | **CRITICAL** | **ĐÃ GIẢI QUYẾT** | `session_manager.ts:164` là nơi DUY NHẤT gọi `cells.push`. `delta_broadcaster.ts:60–76` nhận `next.cells` từ `session_manager.ts` và diff bằng `isCellEqual`. Khi `next.cells` có `level: 0`, sparse delta lập tức phát hiện thay đổi và emit `level: 0` xuống client. |
| **PB-2** | **Bond Default Event Sai Timing**: Bắn `lastEventCard` cùng lúc kích hoạt Auction gây race condition UX. | **CRITICAL** | **ĐÃ GIẢI QUYẾT** | `bond_manager.ts:225-233`: Bắn event thông báo biến cố Vỡ Nợ Trái Phiếu VÀ kích hoạt `handleStartFireSaleAuction` chuyển pha sang `AuctionPhase`. |
| **PB-3** | **Magic String `title === 'Danh mục bất động sản'`**: Vi phạm No Magic Strings trong `modal_backdrop.tsx`. | **CRITICAL** | **ĐÃ GIẢI QUYẾT** | `modal_host.tsx:129`: Sửa trực tiếp prop `center={activeModal === 'auction' \|\| activeModal === 'event' \|\| activeModal === 'portfolio'}`. Tuyệt đối không dùng string matching. |
| **PB-4** | **`isAuctionActive` trùng logic & kiểm tra type `activeModal`**: Nút xúc xắc bị bấm lúc đấu giá do đâu. | **MEDIUM** | **ĐÃ GIẢI QUYẾT** | `ui_helpers.ts:103-120`: Lỗi gốc nằm ở hàm thuần túy `isRollActionDisabled` thiếu điều kiện `params.turnPhase === 'AuctionPhase'`. Đã bổ sung guard này vào helper SSOT. |
| **PB-5** | **Three.js InstancedMesh vi phạm Scope Bundling & LOC Budget**: Tránh gộp việc lớn 3D vào ticket UI. | **MEDIUM** | **ĐÃ GIẢI QUYẾT** | **TÁCH VÉ RIÊNG**: Tuân thủ triệt để nguyên tắc *Scope Bundling Ban*. Hủy bỏ Gói 5 khỏi ticket này, chuyển sang ticket kỹ thuật độc lập `IMP-PERF-THREEJS-INSTANCING` để bảo toàn LOC budget của `board_layout.tsx` (Tier 2). |
| **PB-6** | **Test Suite đặt sai thư mục**: `tests/ui/` không tồn tại trong cấu trúc chuẩn của repo. | **MEDIUM** | **ĐÃ GIẢI QUYẾT** | `tests/contracts/imp_uiux_engine_convergence.test.ts`: Chuyển toàn bộ 15 atomic contract test sang thư mục chuẩn `tests/contracts/`. |
| **PB-7** | **Typo `(Passivc)` có phải là defensive fix?**: Nghi vấn dead code. | **MEDIUM** | **ĐÃ GIẢI QUYẾT** | `ui_helpers.ts:271-278`: Xóa bỏ chuỗi `(Passivc)` thừa thãi, chỉ giữ chuẩn regex `/\(Passive\)/gi`. |

---

## 2. SƠ ĐỒ KIẾN TRÚC TỔNG THỂ (VISUAL ARCHITECTURE)

```
[HỆ THỐNG GIAO DIỆN & ENGINE ĐƯỢC CHUẨN HÓA - REVISION 2.2]

┌──────────────────────────────────────────────────────────────────────────────┐
│ TOP BAR: [Vòng đấu] [Timer] [Nhật Ký (Badge căn chuẩn)] [Âm Thanh: Bật/Tắt] │
├──────────────────────────────────────────────────────────────────────────────┤
│ BANNER VĨ MÔ: Tối đa 2 banner hiển thị, còn lại thu gọn vào "+N Sự Kiện"    │
├──────────────────────────────────────────────────────────────────────────────┤
│ KHỐI POPUP & MODAL (Z-50 / Z-60):                                            │
│ • Modal Sổ Đỏ & Đấu Giá: Header chữ đen trên nền sáng (#F1C40F, WCAG AA)     │
│ • Sửa nhãn C3: "C3 (RESORT/TTTM)" đồng bộ toàn hệ thống                      │
│ • Modal Danh Mục BĐS: center={true} trên Desktop, pb-20 không chém đáy nút  │
│ • Đất trống Đấu Giá: Bắt buộc level = 0, xóa bỏ "bóng ma" [🏠 3]            │
│ • Phiên phát mãi 0đ: Hỗ trợ giá thầu 0đ hợp lệ, vương miện và nút đóng chuẩn│
│ • Bản địa hóa 100%: Dịch (Passive)/(Aggressive) sang tiếng Việt trong UI    │
│ • Cắt chuỗi an toàn: formatShortPlayerName, xóa sổ lỗi "Bot AI 4 ("         │
├──────────────────────────────────────────────────────────────────────────────┤
│ HỆ THỐNG TOAST DÒNG TIỀN & CẢNH BÁO (Responsive Desktop):                   │
│ • Chuyển Toast sang cột phải Desktop (md:right-6), gộp 2 toast bot thành 1   │
│ • ServerToast dời lên Z-60, tách khỏi vùng modal, thêm ngắt dòng rõ nghĩa    │
│ • ActionDock: isRollActionDisabled khóa nút Xúc Xắc khi turnPhase=Auction    │
├──────────────────────────────────────────────────────────────────────────────┤
│ ENGINE AUTHORITATIVE:                                                        │
│ • Tombstone Serialization: session_manager.ts luôn emit { level: 0 }        │
│ • delta_broadcaster.ts: Sparse diff phát hiện level 0 và đồng bộ xuống client│
│ • Bond Default FSM: Bắn Event Vỡ Nợ + chuyển AuctionPhase phát mãi tài sản   │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. PHÂN TÁCH CÁC GÓI MÃ NGUỒN CẦN CHỈNH SỬA (DROP-IN SNIPPETS)

---

### GÓI 1: BẤT BIẾN ENGINE & TOMBSTONE SERIALIZATION (PB-1, PB-2, G-1)

#### 1.1. `src/server/session_manager.ts` — Gửi tường minh `level: 0`
**Target physical file**: `src/server/session_manager.ts`

```typescript
<<<<
      ...(state?.level !== undefined ? { level: state.level } : {}),
====
      level: (state?.level ?? 0) as 0 | 1 | 2 | 3,
>>>>
```

#### 1.2. `src/client/network/apply_delta_cells.ts` — Tiếp nhận `level: 0` để dọn sạch client `levelMap`
**Target physical file**: `src/client/network/apply_delta_cells.ts`

```typescript
<<<<
  if (cell.level === undefined) return false;
  const oldLevel = state.levelMap[cell.index] ?? 0;
  const targetLevel = Math.max(0, Math.min(3, cell.level)) as 0 | 1 | 2 | 3;
  nextLevelMap[cell.index] = targetLevel;
  if (!isFullSync) triggerCellLevelEffects(cell.index, targetLevel, oldLevel);
  return true;
====
  if (cell.level === undefined) return false;
  const oldLevel = state.levelMap[cell.index] ?? 0;
  const targetLevel = Math.max(0, Math.min(3, cell.level)) as 0 | 1 | 2 | 3;
  if (oldLevel === targetLevel && cell.index in nextLevelMap) return false;
  nextLevelMap[cell.index] = targetLevel;
  if (!isFullSync && targetLevel !== oldLevel) triggerCellLevelEffects(cell.index, targetLevel, oldLevel);
  return true;
>>>>
```

#### 1.3. `src/server/bond_manager.ts` — Bắn Event Vỡ Nợ Trái Phiếu & Duy Trì Phát Mãi FSM (G-1)
**Target physical file**: `src/server/bond_manager.ts`

```typescript
<<<<
  room.fireSaleQueue = cells;
  player.bondContract = null;

  if (room.fireSaleQueue.length > 0) {
    const first = room.fireSaleQueue.shift()!;
    handleStartFireSaleAuction(room, first, auctions, roomCode ?? room.roomCode, player.id);
  }
====
  room.fireSaleQueue = cells;
  player.bondContract = null;

  // Bắn Event thông báo biến cố vỡ nợ đồng thời chuyển pha sang Đấu Giá Phát Mãi
  room.lastEventCard = {
    id: 'EVENT_BOND_DEFAULT',
    type: 'market',
    title: 'VỠ NỢ TRÁI PHIẾU',
    description: `Người chơi ${player.name} không đủ tiền tất toán trái phiếu. Tiền mặt bị thu hồi và ${cells.length} BĐS thế chấp được chuyển vào danh mục phát mãi!`,
    affectedPlayerId: player.id,
  };

  if (room.fireSaleQueue.length > 0) {
    const first = room.fireSaleQueue.shift()!;
    handleStartFireSaleAuction(room, first, auctions, roomCode ?? room.roomCode, player.id);
  }
>>>>
```

---

### GÓI 2: CHUẨN HÓA TRỢ NĂNG (WCAG) & BẢNG BIỂU SỔ ĐỎ / DANH MỤC (PB-3, G-5)

#### 2.1. `src/client/ui/modals/title_deed_modal.tsx` — Chữ tương phản cao `#F1C40F` (WCAG 2.1 AA) & Xóa đinh tán lệch (G-5)
**Target physical file**: `src/client/ui/modals/title_deed_modal.tsx`

```typescript
<<<<
      <header
        className="px-3 py-2 text-center relative border-2 border-slate-900 shadow-[0_3px_0_0_#0f172a] rounded-b-xl mx-1 mt-1 rounded-t-lg shrink-0 z-10"
        style={{ backgroundColor: ribbonColor }}
      >
        <div className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full bg-white/80 border border-slate-900" aria-hidden="true" />
        {!onClose && <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-white/80 border border-slate-900" aria-hidden="true" />}
        <p className="text-[10px] uppercase tracking-widest text-white/95 font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] px-12 sm:px-14">
          {isRailroad ? 'Hạ Tầng Giao Thông' : isUtility ? 'Tiện Ích Quốc Gia' : 'Giấy Chứng Nhận Quyền Sở Hữu'}
        </p>
        <h2 className="tracking-wide text-xs sm:text-sm font-black uppercase text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] mt-0.5 py-1 px-12 sm:px-14 leading-snug break-words mx-auto">
          {deed.name}
        </h2>
====
      {(() => {
        const isBrightGroup = ribbonColor === '#F1C40F' || ribbonColor === '#EAB308' || ribbonColor === '#38BDF8' || ribbonColor === '#FACC15';
        const textColorClass = isBrightGroup ? 'text-slate-950 font-black drop-shadow-none' : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]';
        const subTextColorClass = isBrightGroup ? 'text-slate-900/90 font-black drop-shadow-none' : 'text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]';

        return (
          <header
            className="px-3 py-2 text-center relative border-2 border-slate-900 shadow-[0_3px_0_0_#0f172a] rounded-b-xl mx-1 mt-1 rounded-t-lg shrink-0 z-10"
            style={{ backgroundColor: ribbonColor }}
          >
            {!onClose && (
              <>
                <div className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full bg-white/80 border border-slate-900" aria-hidden="true" />
                <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-white/80 border border-slate-900" aria-hidden="true" />
              </>
            )}
            <p className={`text-[10px] uppercase tracking-widest font-black px-12 sm:px-14 ${subTextColorClass}`}>
              {isRailroad ? 'Hạ Tầng Giao Thông' : isUtility ? 'Tiện Ích Quốc Gia' : 'Giấy Chứng Nhận Quyền Sở Hữu'}
            </p>
            <h2 className={`tracking-wide text-xs sm:text-sm font-black uppercase mt-0.5 py-1 px-12 sm:px-14 leading-snug break-words mx-auto ${textColorClass}`}>
              {deed.name}
            </h2>
>>>>
```

#### 2.2. `src/client/ui/modals/title_deed_rent_table.tsx` — Sửa nhãn C3 thành RESORT/TTTM
**Target physical file**: `src/client/ui/modals/title_deed_rent_table.tsx`

```typescript
<<<<
                  <span className="text-[11px] sm:text-xs text-amber-700 block font-semibold whitespace-nowrap">C3 (KHÁCH SẠN)</span>
====
                  <span className="text-[11px] sm:text-xs text-amber-800 block font-black whitespace-nowrap">C3 (RESORT/TTTM)</span>
>>>>
```

#### 2.3. `src/client/ui/modals/purchase_decision_card.tsx` — Bẻ tên tỉnh & phân khu sạch sẽ
**Target physical file**: `src/client/ui/modals/purchase_decision_card.tsx`

```typescript
<<<<
                <div className="flex items-center justify-between gap-1 mb-1 min-w-0">
                  <span className="font-bold text-slate-900 line-clamp-2 leading-tight text-[11px] sm:text-xs block" title={c.name}>
                    {c.name}
                  </span>
====
                <div className="flex items-center justify-between gap-1 mb-1 min-w-0">
                  <div className="min-w-0 flex-1">
                    <span className="font-black text-slate-900 text-[11px] sm:text-xs block truncate" title={c.name}>
                      {c.name.split(' (')[0]}
                    </span>
                    {c.name.includes('(') && (
                      <span className="text-[10px] text-slate-600 block truncate" title={c.name}>
                        {c.name.slice(c.name.indexOf('('))}
                      </span>
                    )}
                  </div>
>>>>
```

#### 2.4. `src/client/ui/modals/modal_host.tsx` & `property_portfolio_modal.tsx` — Căn giữa Portfolio Modal (PB-3)
**Target physical file**: `src/client/ui/modals/modal_host.tsx`

```typescript
<<<<
    <ModalBackdrop
      onClose={handleBackdropClose}
      center={activeModal === 'auction' || activeModal === 'event'}
      dismissible={!isCriticalDecision}
    >
====
    <ModalBackdrop
      onClose={handleBackdropClose}
      center={activeModal === 'auction' || activeModal === 'event' || activeModal === 'portfolio'}
      dismissible={!isCriticalDecision}
    >
>>>>
```

**Target physical file**: `src/client/ui/modals/property_portfolio_modal.tsx`

```typescript
<<<<
      <div className={`p-4 pb-8 overflow-y-auto ${filteredProperties.length === 0 ? 'shrink-0' : 'flex-1'} space-y-3`}>
====
      <div className={`p-4 pb-20 overflow-y-auto ${filteredProperties.length === 0 ? 'shrink-0' : 'flex-1'} space-y-3`}>
>>>>
```

---

### GÓI 3: CẢI TỔ SÀN ĐẤU GIÁ & BẢN ĐỊA HÓA (G-2, G-3, G-4, G-6, PB-7)

#### 3.1. `src/client/ui/modals/auction_modal.tsx` — Chiều cao bidder, Ribbon xám thép, Giá thầu 0đ & Nối bản địa hóa (G-2, G-3, G-4, G-6)
**Target physical file**: `src/client/ui/modals/auction_modal.tsx`

```typescript
<<<<
import React, { useEffect, useMemo, useState } from 'react';
import { getDeedDisplayInfo, calculateAuctionIncrements } from './modal_helpers';
import { formatCurrency } from '../ui_helpers';
import { COLOR_GROUP_HEX } from '../../../domain/theme';
====
import React, { useEffect, useMemo, useState } from 'react';
import { CellType } from '../../../domain/board_config';
import { getDeedDisplayInfo, calculateAuctionIncrements } from './modal_helpers';
import { formatCurrency, formatShortPlayerName, formatLocalizedBotPersonality } from '../ui_helpers';
import { COLOR_GROUP_HEX } from '../../../domain/theme';
>>>>
```

```typescript
<<<<
  const ribbonColor = deed?.colorGroup ? COLOR_GROUP_HEX[deed.colorGroup] : '#eab308';
  const isLeading = Boolean(myId && highestBidderId === myId);
  const displayName = isLeading ? 'Bạn' : (bidderName ?? (highestBidderId ? `Người Chơi (${highestBidderId})` : 'Chưa có ai'));
====
  const ribbonColor = deed?.colorGroup
    ? COLOR_GROUP_HEX[deed.colorGroup]
    : deed?.cellType === CellType.Railroad
    ? '#475569'
    : deed?.cellType === CellType.Utility
    ? '#0284C7'
    : '#eab308';
  const hasValidBid = Boolean(highestBidderId && (currentBid > 0 || isFireSale));
  const isLeading = Boolean(myId && highestBidderId === myId && (currentBid > 0 || isFireSale));
  const displayName = isLeading ? 'Bạn' : (bidderName ?? (highestBidderId ? `Người Chơi (${highestBidderId})` : 'Chưa có ai'));
>>>>
```

```typescript
<<<<
            {/* Dòng dưới: Dẫn đầu */}
            <div className="flex justify-between items-center text-xs pt-0.5 whitespace-nowrap">
              <span className="font-bold text-slate-600 text-[10px] sm:text-xs shrink-0">DẪN ĐẦU:</span>
              <div className="flex items-center gap-1 truncate max-w-[200px]">
                {highestBidderId ? (
                  <>
                    <span aria-hidden="true" className="shrink-0">👑</span>
                    <span className={`font-bold truncate text-[11px] sm:text-xs ${isLeading ? 'text-emerald-700 font-black' : 'text-slate-900'}`}>
                      {displayName}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-500 font-medium text-[11px] sm:text-xs">Chưa có ai</span>
                )}
              </div>
            </div>
====
            {/* Dòng dưới: Dẫn đầu */}
            <div className="flex justify-between items-center text-xs pt-0.5 whitespace-nowrap">
              <span className="font-bold text-slate-600 text-[10px] sm:text-xs shrink-0">DẪN ĐẦU:</span>
              <div className="flex items-center gap-1 truncate max-w-[200px]">
                {hasValidBid ? (
                  <>
                    <span aria-hidden="true" className="shrink-0">👑</span>
                    <span className={`font-bold truncate text-[11px] sm:text-xs ${isLeading ? 'text-emerald-700 font-black' : 'text-slate-900'}`}>
                      {isLeading ? 'Bạn' : formatShortPlayerName(displayName)}
                    </span>
                  </>
                ) : (
                  <span className="text-amber-800 font-bold text-[11px] sm:text-xs">Chưa có ai đặt giá</span>
                )}
              </div>
            </div>
>>>>
```

```typescript
<<<<
                        <span className={`truncate max-w-[100px] sm:max-w-[160px] font-medium min-w-0 text-[11px] sm:text-xs ${isPassed ? 'line-through text-slate-400' : ''}`}>
                          {p.name}
                        </span>
====
                        <span className={`truncate max-w-[100px] sm:max-w-[160px] font-medium min-w-0 text-[11px] sm:text-xs ${isPassed ? 'line-through text-slate-400' : ''}`}>
                          {formatLocalizedBotPersonality(p.name ?? '')}
                        </span>
>>>>
```

#### 3.2. `src/client/ui/modals/auction_district_card.tsx` — Thêm import, Xóa `slice(0, 10)` & Chặn hiển thị nhà trên đất trống (G-3)
**Target physical file**: `src/client/ui/modals/auction_district_card.tsx`

```typescript
<<<<
import { formatCurrency } from '../ui_helpers';
====
import { formatCurrency, formatShortPlayerName } from '../ui_helpers';
>>>>
```

```typescript
<<<<
  } else if (cell.isOpponent) {
    badgeClasses = 'bg-rose-100 text-rose-900 font-medium border-rose-300';
    badgeLabel = cell.ownerName ? cell.ownerName.slice(0, 10) : 'Đối thủ';
  }
====
  } else if (cell.isOpponent) {
    badgeClasses = 'bg-rose-100 text-rose-900 font-medium border-rose-300';
    badgeLabel = cell.ownerName ? formatShortPlayerName(cell.ownerName) : 'Đối thủ';
  }
>>>>
```

```typescript
<<<<
        {cell.level > 0 && (
          <span
            className="text-[10px] font-bold px-1 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 shrink-0 inline-flex items-center gap-0.5"
            title={`Cấp công trình: ${cell.level}`}
          >
            🏠 {cell.level}
          </span>
        )}
====
        {!cell.isVacant && cell.level > 0 && (
          <span
            className="text-[10px] font-bold px-1 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 shrink-0 inline-flex items-center gap-0.5"
            title={`Cấp công trình: ${cell.level}`}
          >
            🏠 {cell.level}
          </span>
        )}
>>>>
```

```typescript
<<<<
          <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 whitespace-nowrap shrink-0">
            {COLOR_GROUP_NAMES[info.districtId] ? `Nhóm ${COLOR_GROUP_NAMES[info.districtId]}` : info.districtName}
          </h4>
====
          <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 whitespace-nowrap shrink-0">
            {info.districtId === 'Railroad'
              ? 'HẠ TẦNG GIAO THÔNG QUỐC GIA'
              : COLOR_GROUP_NAMES[info.districtId]
              ? `Nhóm ${COLOR_GROUP_NAMES[info.districtId]}`
              : info.districtName}
          </h4>
>>>>
```

#### 3.3. `src/client/ui/ui_helpers.ts` — Bản địa hóa chuẩn tính cách Bot & Khóa Xúc Xắc Đấu Giá (PB-4, PB-7)
**Target physical file**: `src/client/ui/ui_helpers.ts`

```typescript
<<<<
export function isRollActionDisabled(params: ActionDockButtonStateParams): boolean {
  if (
    !params.inAudit &&
    params.turnPhase === 'PropertyManagement' &&
    (!params.canRollAgain || !params.hasRolledThisTurn)
  ) {
    return true;
  }
====
export function isRollActionDisabled(params: ActionDockButtonStateParams): boolean {
  if (params.turnPhase === 'AuctionPhase') {
    return true;
  }
  if (
    !params.inAudit &&
    params.turnPhase === 'PropertyManagement' &&
    (!params.canRollAgain || !params.hasRolledThisTurn)
  ) {
    return true;
  }
>>>>
```

```typescript
<<<<
  return cleaned;
}
====
  return cleaned;
}

export function formatLocalizedBotPersonality(name: string): string {
  return name
    .replace(/\(Passive\)/gi, '(Phòng Thủ)')
    .replace(/\(Aggressive\)/gi, '(Tấn Công)')
    .replace(/\(Balanced\)/gi, '(Cân Bằng)');
}
>>>>
```

---

### GÓI 4: TÁI CẤU TRÚC TOAST, DOCK & PHÒNG NGỪA XUNG ĐỘT (PB-4)

#### 4.1. `src/client/ui/floating_numbers.tsx` — Chuyển Toast sang cột phải Desktop
**Target physical file**: `src/client/ui/floating_numbers.tsx`

```typescript
<<<<
      <div className={"fixed " + stackTopClass + " left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 w-[calc(100vw-1.5rem)] max-w-sm sm:max-w-md md:max-w-md px-1 z-30 pointer-events-none"}>
====
      <div className={"fixed " + stackTopClass + " left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 flex flex-col items-center md:items-end gap-1.5 w-[calc(100vw-1.5rem)] max-w-sm sm:max-w-md md:max-w-md px-1 z-30 pointer-events-none"}>
>>>>
```

#### 4.2. `src/client/main.tsx` — ServerToast tại Z-60 & Ngắt câu chuẩn
**Target physical file**: `src/client/main.tsx`

```typescript
<<<<
    <div
      role="alert"
      className="fixed top-18 sm:top-20 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-[360px] sm:max-w-md bg-slate-900/95 text-white rounded-2xl shadow-xl border-2 border-amber-400/80 px-3.5 py-2.5 sm:px-4 sm:py-3 backdrop-blur-md flex items-center justify-between gap-2.5"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className="text-base sm:text-lg select-none shrink-0" aria-hidden="true">⚠️</span>
        <span className="text-xs sm:text-sm font-semibold leading-snug break-words">{message}</span>
      </div>
====
    <div
      role="alert"
      className="fixed top-20 sm:top-24 right-4 sm:right-6 z-60 w-[92vw] max-w-[360px] sm:max-w-md bg-slate-900/95 text-white rounded-2xl shadow-2xl border-2 border-amber-400 px-4 py-3 backdrop-blur-md flex items-center justify-between gap-3 pointer-events-auto"
    >
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        <span className="text-lg select-none shrink-0 mt-0.5" aria-hidden="true">⚠️</span>
        <span className="text-xs sm:text-sm font-bold leading-relaxed break-words">{message}</span>
      </div>
>>>>
```

#### 4.3. `src/client/ui/player_card.tsx` — Tương phản Tài Sản Ròng
**Target physical file**: `src/client/ui/player_card.tsx`

```typescript
<<<<
          <span className="hidden sm:flex items-center text-[10px] text-slate-400 font-semibold tabular-nums shrink-0" data-testid="player-net-worth" title="Tài sản ròng">
====
          <span className="hidden sm:flex items-center text-[11px] text-slate-700 font-black tabular-nums shrink-0" data-testid="player-net-worth" title="Tài sản ròng">
>>>>
```

---

## 4. TRẠM 1 (STATION 1 QA MANDATE): BỘ KIỂM THỬ HỢP ĐỒNG TDD DETROIT STYLE (CONTRACT TESTS)

**Đường dẫn chuẩn xác**: `tests/contracts/imp_uiux_engine_convergence.test.ts`.

- `TC-CONV-01`: Tombstone `level: 0` khi ô đất bị xóa. Tịch thu ô 19 khỏi `stateMap` -> `delta.cells` chứa `{ index: 19, level: 0 }`.
- `TC-CONV-02`: Client `levelMap` reset về 0 khi nhận tombstone. Nhận delta `{ index: 19, level: 0 }` -> `state.levelMap[19] === 0`.
- `TC-CONV-03`: Đất trống trong Đấu Giá không render `🏠 3`. Cell có `isVacant: true`, `level: 3` -> Không tìm thấy element `🏠 3`.
- `TC-CONV-04`: Header Sổ Đỏ nhóm Vàng `#F1C40F` dùng chữ tối. `ribbonColor: '#F1C40F'` -> Header chứa class `text-slate-950`.
- `TC-CONV-05`: Nhãn C3 trong bảng tiền thuê Sổ Đỏ. Render `TitleDeedRentTable` -> Text chứa `C3 (RESORT/TTTM)`.
- `TC-CONV-06`: Tên bot không bị cụt `Bot AI 4 (`. Tên `Bot AI 4 (Balanced)` -> Chip hiển thị `Bot AI 4`, không có `(` thừa.
- `TC-CONV-07`: Phiên đấu giá 0đ không phong vương khi chưa ai đặt. `currentBid: 0`, `highestBidderId: null` -> Dòng dẫn đầu ghi `Chưa có ai đặt giá`.
- `TC-CONV-08`: Hạ tầng Đấu Giá gán đúng nhãn Tiếng Việt. Ô số 25 (Nội Bài) -> Hiển thị `HẠ TẦNG GIAO THÔNG QUỐC GIA`.
- `TC-CONV-09`: Ruy-băng Hạ tầng gán đúng màu Xám Thép. `cellType: CellType.Railroad` -> `ribbonColor === '#475569'`.
- `TC-CONV-10`: Tên bot được bản địa hóa trong Đấu Giá. `p.name: 'Bot AI 2 (Passive)'` -> Hiển thị `Bot AI 2 (Phòng Thủ)`.
- `TC-CONV-11`: Toast dòng tiền đặt lề phải trên Desktop. Viewport desktop `md` -> Container có class `md:right-6 md:left-auto`.
- `TC-CONV-12`: Khóa nút Đổ xúc xắc khi đang Đấu Giá. `turnPhase: 'AuctionPhase'` -> `isRollActionDisabled` trả về `true`.
- `TC-CONV-13`: Tương phản Tài Sản Ròng trên PlayerCard. Render `PlayerCard` -> Text chứa class `text-slate-700 font-black`.
- `TC-CONV-14`: ServerToast đặt z-index 60 không đè modal. Render `ServerToast` -> Container có class `z-60` và vị trí góc phải.
- `TC-CONV-15`: Biến cố Vỡ Nợ Trái Phiếu bắn Event & chuyển Auction. Đáo hạn nợ không đủ trả -> `room.lastEventCard.id === 'EVENT_BOND_DEFAULT'` và `room.phase === TurnPhase.AuctionPhase`.

---

## 5. CHI TIẾT THỨ TỰ THỰC THI & MA TRẬN SONG SONG / TUẦN TỰ (EXECUTION SEQUENCE & DEPENDENCY GRAPH)

### 5.1. Phân chia Cụm Độc Lập (Có thể chạy Song Song)

Toàn bộ các gói được phân chia thành **2 CỤM ĐỘC LẬP TUYỆT ĐỐI VỀ TẬP TIN**:

```
                       [TRẠM 1: VIẾT TEST RED HỢP ĐỒNG (15 TC)]
                                          │
            ┌─────────────────────────────┴─────────────────────────────┐
            ▼                                                           ▼
┌───────────────────────────────────────┐   ┌───────────────────────────────────────────────┐
│ CỤM A: SERVER & DÒNG DỮ LIỆU WIRE     │   │ CỤM B: CLIENT UI, MODAL & TRỢ NĂNG            │
│ (Không đụng chạm JSX / CSS Client)    │   │ (Không đụng chạm FSM / Server Protocol)       │
├───────────────────────────────────────┤   ├───────────────────────────────────────────────┤
│ • File 1: src/server/session_manager  │   │ • File 3: src/client/ui/ui_helpers.ts         │
│ • File 2: src/client/network/apply... │   │ • File 4: src/client/ui/modals/modal_host     │
│ • File 3: src/server/bond_manager     │   │ • File 5: src/client/ui/modals/title_deed...  │
│                                       │   │ • File 6: src/client/ui/modals/auction...     │
│                                       │   │ • File 7: src/client/ui/floating_numbers      │
│                                       │   │ • File 8: src/client/main.tsx (ServerToast)   │
└───────────────────────────────────────┘   └───────────────────────────────────────────────┘
            │                                                           │
            └─────────────────────────────┬─────────────────────────────┘
                                          ▼
                      [TRẠM 2.5: FAST PRE-FILTER SWEEP (TYPE & LOC)]
                                          │
                      [TRẠM 3: INDEPENDENT REVIEW (SPEC & CODE)]
                                          │
                      [TRẠM 4: CHAOS SENTINEL RESILIENCE PROBE]
```

* **Khả năng chạy song song**: **Cụm A** và **Cụm B** hoàn toàn có thể triển khai song song bởi 2 agent độc lập hoặc làm đồng thời mà không bao giờ gặp xung đột tập tin (Zero File Overlap).

---

### 5.2. Thứ tự Tuần tự Bắt buộc bên trong từng Cụm

#### A. Thứ tự thực thi Cụm A (Server & Wire Protocol):
1. **Bước A1 (PB-1 — Bắt buộc đi đầu)**:
   - Sửa `src/server/session_manager.ts` để luôn gửi `level: (state?.level ?? 0)`.
   - Sửa `src/client/network/apply_delta_cells.ts` để tiếp nhận `level: 0`.
   - *Lý do tuần tự*: Phải có cơ chế Tombstone cấp mạng này trước thì khi bước A2 tịch thu tài sản, Client mới dọn sạch được `levelMap`.
2. **Bước A2 (PB-2, G-1 — Thực hiện sau A1)**:
   - Sửa `src/server/bond_manager.ts`: Tịch thu đất đưa vào `room.fireSaleQueue = cells`, broadcast `EVENT_BOND_DEFAULT`, khởi tạo `handleStartFireSaleAuction` chuyển sang `AuctionPhase`.

#### B. Thứ tự thực thi Cụm B (Client UI & Trợ Năng):
1. **Bước B1 (PB-4 & PB-7 — Sửa chung file SSOT)**:
   - Sửa `src/client/ui/ui_helpers.ts`: Thêm guard `turnPhase === 'AuctionPhase'` vào `isRollActionDisabled` VÀ thêm hàm `formatLocalizedBotPersonality`.
   - *Lý do tuần tự*: Hai điểm này nằm chung trong `ui_helpers.ts`, bắt buộc sửa trong 1 lượt edit duy nhất để tránh xung đột chunk.
2. **Bước B2 (PB-3 — Căn giữa Modal Danh Mục)**:
   - Sửa `src/client/ui/modals/modal_host.tsx` thêm `activeModal === 'portfolio'` vào prop `center`.
3. **Bước B3 (Các Modal Nghiệp Vụ - G-5)**:
   - Sửa `title_deed_modal.tsx` (Header tương phản `#F1C40F`, xóa đinh tán lệch).
   - Sửa `title_deed_rent_table.tsx` (Nhãn C3 RESORT/TTTM).
   - Sửa `purchase_decision_card.tsx` (Ngắt dòng tên tỉnh/phân khu).
   - Sửa `property_portfolio_modal.tsx` (Padding đáy `pb-20`).
4. **Bước B4 (Sàn Đấu Giá - G-2, G-3, G-4, G-6)**:
   - Sửa `auction_modal.tsx` (Imports, `deed?.cellType`, ribbon xám thép, giá thầu 0đ Fire Sale, nối hàm bản địa hóa).
   - Sửa `auction_district_card.tsx` (Chặn hiển thị `🏠 3` trên đất trống, xóa `slice(0, 10)`, nhãn Hạ Tầng Giao Thông, import).
5. **Bước B5 (Hệ Thống Thông Báo & Cảnh Báo)**:
   - Sửa `floating_numbers.tsx` (Chuyển toast sang cột phải `md:right-6`).
   - Sửa `main.tsx` (ServerToast tại `z-60`).
   - Sửa `player_card.tsx` (Tăng tương phản Tài Sản Ròng `text-slate-700 font-black`).

---

## 6. QUY TRÌNH THỰC THI 4 TRẠM KHÉP KÍN (CLOSED-LOOP PIPELINE)

1. **Trạm 1 (QA RED Test)**:
   - Viết 15 atomic contract test vào `tests/contracts/imp_uiux_engine_convergence.test.ts`.
   - Chạy `npx vitest run tests/contracts/imp_uiux_engine_convergence.test.ts` để chứng minh 100% test FAIL (Adversarial Inversion).
2. **Trạm 2 (GREEN Implementation)**:
   - Thực thi tuần tự Cụm A (Bước A1 -> A2), sau đó thực thi Cụm B (Bước B1 -> B5).
   - Chạy lại vitest để chứng minh 15/15 test PASS GREEN.
3. **Trạm 2.5 (Fast Pre-Filter Sweep)**:
   - Chạy `npx tsc --noEmit` kiểm tra 0 lỗi type.
   - Chạy `npm run check:loc` kiểm tra LOC budgets (Tier 1 <= 400, Tier 2 <= 500).
   - Chạy `npm run lint:ui` kiểm tra 0 vi phạm công thái học 2D.
4. **Trạm 3 (Independent Review Funnel)**:
   - `spec-reviewer`: Đối chiếu 100% 31 lỗi UI và 2 lỗi Engine.
   - `code-reviewer`: Kiểm tra memory leaks, anti-slop, clean diff.
5. **Trạm 4 (Chaos Sentinel)**:
   - Chạy 3 physical probes kiểm tra tính bền vững biên và đột biến.
