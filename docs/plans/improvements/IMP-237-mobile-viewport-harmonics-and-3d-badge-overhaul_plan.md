# KẾ HOẠCH THI CÔNG CHI TIẾT: IMP-237 (Revision 2.0)
## TỐI ƯU HÓA TRẢI NGHIỆM MOBILE & DESKTOP, 3D BILLBOARD CLAMPING & VIEWPORT DE-CLUTTERING

> **Mã số Ticket**: IMP-237  
> **Phân loại**: Tier 2 (Full Rigor)  
> **Phạm vi kiến trúc**: Client UI, 3D Presentation & Viewport Ergonomics  
> **SSOT**: [`docs/domain/design.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/design.md), [`GEMINI.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/GEMINI.md)  
> **Thời điểm lập**: 2026-10-01 (Revision 2.0 sau kiểm toán đối kháng `plan-griller`)

---

### 1. BẢNG MAPPING CHỈ THỊ ĐỐI KHÁNG (REVISION DIRECTIVE COVERAGE TABLE)

Tuân thủ nghiêm ngặt điều lệ Anti-Sycophancy trong `GEMINI.md`: 100% chỉ thị kiểm toán đối kháng từ `plan-griller` (P1-A đến P2-D) được đối chiếu 1:1 với tệp vật lý và dòng xử lý:

| Mã Chỉ Thị | Nội Dung Khuyết Tật Do Griller Phát Hiện | Tệp Mục Tiêu Cần Sửa | Vị Trí Dòng / Task Xử Lý Trong Plan | Cơ Chế Khắc Phục Triệt Để |
| :--- | :--- | :--- | :--- | :--- |
| **P1-A** | `setIsPlayerHudVisible(false)` không tồn tại trong store, gây crash `TypeError` khi click backdrop trên mobile | `src/client/ui/player_hud_list.tsx` | Task 5 (Snippet 5.2), dòng L37-L43 | Dùng `useGameStore.setState({ isPlayerHudVisible: false })` - phương thức an toàn, idempotent và chuẩn TypeScript. |
| **P1-B** | Bỏ quên drop-in snippet cho `market_event_ticker.tsx`; test hợp đồng cũ không bắt được trạng thái RED | `src/client/ui/market_event_ticker.tsx` | Task 6 (Snippet 6.1) & Station 1 (`TC-MVH-11`) | Bổ sung Task 6: mobile ẩn banner thứ 2 (`hidden sm:flex`) kèm badge `+N sự kiện`, desktop hiển thị đầy đủ (`flex`). Cập nhật test assert `hidden sm:flex`. |
| **P1-C** | Thẻ mở container cuộn trong `event_card_modal.tsx` chỉ bọc `affectedCells`, bỏ sót Title/HeroStat/Description | `src/client/ui/modals/event_card_modal.tsx` | Task 3 (Snippet 3.1 & 3.2), L102 & L146-261 | Mở rộng vùng bao bọc: Container cuộn `data-testid="event-card-scroll-container"` bọc trọn từ L146 đến L252; nút CTA cố định ngoài vùng cuộn với `shrink-0 mt-2`. |
| **P2-D** | Nhãn `- **Physical Target File**:` và thiếu heading Station 1 khiến script `audit_plan.mjs` không nhận diện | `docs/plans/...IMP-237...plan.md` | Toàn bộ Mục 4 & Mục 5 | Chuẩn hóa tiền tố `**Target physical file**: <relative-path>`, bọc snippet trong code fence triple backticks ```` ```tsx ````, bổ sung heading `### Station 1: BỘ KIỂM THỬ HỢP ĐỒNG`. |

---

### 2. PHÂN TÍCH CHẾ ĐỘ THẤT BẠI (FAILURE MODES & DEFENSE MATRIX)

| Mã FM | Chế Độ Thất Bại Tiềm Ẩn | Cơ Chế Phòng Vệ Trực Diện (Defense Mechanism) |
| :--- | :--- | :--- |
| **FM-1** | Drei `<Html>` khi bỏ `distanceFactor` có thể bị lệch vị trí hoặc không căn giữa | Sử dụng `center`, giữ nguyên tọa độ cục bộ `position={[0, 0.52, 0]}`, áp dụng CSS pixel chuẩn (`text-[10px] px-2 py-0.5 max-w-[140px] whitespace-nowrap`). Phù hiệu giữ kích thước màn hình ổn định không bao giờ biến dạng khi zoom. |
| **FM-2** | Đổi `affectedCells: []` cho `MC_RATE_HIKE` có thể làm hỏng logic thu lãi thế chấp | Kiểm chứng vật lý: `mortgage_manager.ts#L30` chỉ kiểm tra `m.type === MarketCardId.MC_RATE_HIKE`, hoàn toàn không đọc `affectedCells`. Test fixture `mortgage_manager.test.ts#L175` vốn đã sử dụng `affectedCells: []`. |
| **FM-3** | Tối ưu Banner sự kiện trên Mobile làm mất khả năng xem sự kiện thứ 2 | Banner thứ 2 mang class `hidden sm:flex` (ẩn trên mobile, hiện trên desktop). Thẻ thứ nhất trên mobile hiển thị badge `+N sự kiện` và click vào sẽ mở modal chi tiết với đầy đủ metadata. |
| **FM-4** | Nút `CameraResetPill` di chuyển vị trí gây khó tìm cho người chơi | Trên Mobile: đặt tại góc dưới bên trái (`left-3 bottom-[calc(5rem+env(safe-area-inset-bottom))]`) - nơi vốn trống do `TelemetryBadge` đã ẩn trên mobile. Trên Desktop (`sm:`): giữ nguyên căn giữa `sm:left-1/2 sm:-translate-x-1/2`. |

---

### 3. ĐO LƯỜNG NGÂN SÁCH LOC (PRE-CODING LOC BASELINE & DELTA)

| Tệp Vật Lý | Phân Loại Tier | LOC Hiện Tại (Total / SLOC) | Delta Dự Kiến | LOC Sau Thay Thế | Ngân Sách Trần | Trạng Thái |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `src/domain/market_card_handlers.ts` | Tier 1 (Domain Logic) | 276 / 262 | 0 | 276 / 262 | <= 400 | ✔️ Safe |
| `src/client/3d/tile_event_aura.tsx` | Tier 2 (UI Views) | 223 / 201 | +4 | 227 / 205 | <= 500 | ✔️ Safe |
| `src/client/ui/modals/event_card_modal.tsx` | Tier 2 (UI Views) | 263 / 241 | +8 | 271 / 249 | <= 500 | ✔️ Safe |
| `src/client/ui/hud_container.tsx` | Tier 2 (UI Views) | 137 / 125 | +2 | 139 / 127 | <= 500 | ✔️ Safe |
| `src/client/ui/market_event_ticker.tsx` | Tier 2 (UI Views) | 288 / 268 | +10 | 298 / 278 | <= 500 | ✔️ Safe |
| `src/client/ui/player_card.tsx` | Tier 2 (UI Views) | 398 / 372 | -2 | 396 / 370 | <= 500 | ✔️ Safe |
| `src/client/ui/player_hud_list.tsx` | Tier 2 (UI Views) | 38 / 35 | +8 | 46 / 43 | <= 500 | ✔️ Safe |
| `tests/contracts/imp237_mobile_viewport_harmonics.test.ts` | Contract Tests | 0 (Tệp Mới) | +320 | 320 / 285 | <= 600 | ✔️ Safe |

---

### 4. MÃ NGUỒN DROP-IN CHUẨN HÓA (PHYSICAL DROP-IN SNIPPETS)

#### Task 1: Sửa dữ liệu nghiệp vụ `MC_RATE_HIKE` trong `market_card_handlers.ts`
- **Enclosing Target**: `MARKET_CARD_HANDLERS` dictionary tại dòng 235.
- **Target physical file**: src/domain/market_card_handlers.ts

```typescript
<<<<
  [MarketCardId.MC_RATE_HIKE]:       (mods) => mods.push({ type: MarketCardId.MC_RATE_HIKE, affectedCells: BOARD_CONFIG.map((c) => c.index), remainingRounds: 1, multiplier: 0.8 }),
====
  [MarketCardId.MC_RATE_HIKE]:       (mods) => mods.push({ type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 1, multiplier: 0.8 }),
>>>>
```

---

#### Task 2: Chống phóng đại Drei HTML & Chống gãy dòng trong `tile_event_aura.tsx`
- **Enclosing Target**: `SafeHtml` và `TileEventFloatingBadge`
- **Target physical file**: src/client/3d/tile_event_aura.tsx

```tsx
<<<<
export function SafeHtml({
  children,
  ...props
}: React.ComponentProps<typeof Html>): React.ReactElement {
  if (typeof window === 'undefined') {
    return React.createElement(React.Fragment, null, children);
  }
  return (
    <Html center distanceFactor={14} pointerEvents="none" {...props}>
      {children}
    </Html>
  );
}
====
export function SafeHtml({
  children,
  ...props
}: React.ComponentProps<typeof Html>): React.ReactElement {
  if (typeof window === 'undefined') {
    return React.createElement(React.Fragment, null, children);
  }
  return (
    <Html center pointerEvents="none" {...props}>
      {children}
    </Html>
  );
}
>>>>
```

```tsx
<<<<
      <SafeHtml>
        <div
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-black text-white bg-slate-900/90 border border-amber-400 shadow-xs select-none pointer-events-none ${
            status.isExpiringSoon ? 'animate-pulse' : ''
          }`}
        >
          <span>{labelText}</span>
        </div>
      </SafeHtml>
====
      <SafeHtml>
        <div
          data-testid="tile-event-badge-pill"
          className={`whitespace-nowrap inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-black text-white bg-slate-900/90 border border-amber-400 shadow-xs max-w-[140px] truncate select-none pointer-events-none ${
            status.isExpiringSoon ? 'animate-pulse' : ''
          }`}
        >
          <span className="truncate">{labelText}</span>
        </div>
      </SafeHtml>
>>>>
```

---

#### Task 3: Ghim cố định nút CTA & Cuộn an toàn trong `event_card_modal.tsx`
- **Enclosing Target**: `EventCardModal` modal layout và scroll container
- **Target physical file**: src/client/ui/modals/event_card_modal.tsx

```tsx
<<<<
    <div
      data-testid="event-card-modal"
      className="w-full max-w-[340px] sm:max-w-[420px] bg-[#FFFDF8] border-2 border-slate-900 rounded-3xl shadow-[0_8px_0_0_#0f172a] pt-7 pb-6 px-5 sm:px-6 max-h-[90dvh] overflow-y-auto flex flex-col items-center text-center relative pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-200 my-auto text-slate-900 select-none"
    >
====
    <div
      data-testid="event-card-modal"
      className="w-full max-w-[340px] sm:max-w-[420px] bg-[#FFFDF8] border-2 border-slate-900 rounded-3xl shadow-[0_8px_0_0_#0f172a] pt-7 pb-5 px-5 sm:px-6 max-h-[85dvh] sm:max-h-[90dvh] overflow-hidden flex flex-col justify-between items-center text-center relative pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-200 my-auto text-slate-900 select-none"
    >
>>>>
```

```tsx
<<<<
      {/* Category Badge */}
      <span className={`relative z-10 px-3 py-1 rounded-full text-[10px] sm:text-[11px] uppercase font-black tracking-wider border shadow-xs mb-3 ${badgeColor}`}>
        {categoryLabel}
      </span>

      {/* Hero Icon */}
      <div className="relative z-10 w-16 h-16 rounded-2xl bg-[#F7F2E7] border-2 border-slate-900 flex items-center justify-center text-3xl mb-3 shadow-[0_3px_0_0_#0f172a]">
        <span aria-hidden="true">{iconEmoji}</span>
      </div>

      {/* Card Title */}
      <h2 className="relative z-10 text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight mb-2 leading-tight px-1">
        {resolvedTitle}
      </h2>

      {/* Khối Hero Stat Box to bản — Nhìn là hiểu ngay trong 0.5s */}
      <div
        data-testid="event-hero-stat"
        className={`relative z-10 w-full rounded-2xl border-2 p-2.5 mb-3 flex flex-col items-center justify-center text-center font-mono shadow-xs ${heroStyles.container}`}
      >
        <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${heroStyles.label}`}>
          {heroStat.label}
        </span>
        <span className={`text-xl sm:text-2xl font-black tracking-tight tabular-nums mt-0.5 ${heroStyles.value}`}>
          {heroStat.value}
        </span>
      </div>

      {/* Description text — Giữ hidden sm:block cho test contract & hiển thị mô tả gọn gàng */}
      <p className="relative z-10 text-xs text-slate-600 mb-3 leading-relaxed px-1 font-semibold hidden sm:block">
        {singleTruthDescription}
      </p>

      {/* Khối Tóm Tắt Tác Động Nhanh 1 Giây — Mobile (< 640px) */}
      <div
        data-testid="event-impact-summary"
        className="relative z-10 w-full bg-[#F7F2E7] border border-slate-300 rounded-xl p-3 mb-3 text-left sm:hidden flex flex-col gap-2 shadow-xs"
      >
        <div className="flex items-center justify-between gap-1.5 flex-wrap">
          {resolvedTargetScope && resolvedTargetScope !== 'Người chơi rút thẻ' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
              <span>🎯</span>
              <span>{resolvedTargetScope}</span>
            </span>
          )}
          {resolvedDuration && resolvedDuration !== 'Tức thì' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-800 border border-slate-300">
              <span>⏳</span>
              <span>{resolvedDuration}</span>
            </span>
          )}
        </div>
        <p className="text-xs text-slate-800 font-bold leading-relaxed text-center">
          {singleTruthDescription}
        </p>
      </div>

      {/* Khối Thông Số Tác Động Nhanh — Desktop (>= 640px) */}
      <div
        data-testid="event-specs-table"
        className="relative z-10 w-full bg-[#F7F2E7] border border-slate-300 rounded-xl p-3 mb-3 items-center justify-center gap-2 hidden sm:flex flex-wrap shadow-xs"
      >
        {resolvedDenseScope && resolvedDenseScope !== 'Người chơi rút thẻ' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
            <span>🎯</span>
            <span title={resolvedDenseScope}>{resolvedDenseScope}</span>
          </span>
        )}
        {resolvedDuration && resolvedDuration !== 'Tức thì' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-800 border border-slate-300">
            <span>⏳</span>
            <span>{resolvedDuration}</span>
          </span>
        )}
        {shouldShowDestination && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <span>🏛️</span>
            <span className="whitespace-nowrap">{resolvedDestination}</span>
          </span>
        )}
      </div>

      {/* Khối Hiển Thị Ô Đất Bị Ảnh Hưởng (IMP-234) */}
      {activeModifier?.affectedCells && activeModifier.affectedCells.length > 0 && (
        <div
          data-testid="event-affected-cells-list"
          className="relative z-10 w-full bg-amber-50/80 border border-amber-300 rounded-xl p-2.5 mb-3 flex flex-col items-center gap-1.5 shadow-xs"
        >
          <span className="text-[10px] sm:text-[11px] font-black uppercase text-amber-900 tracking-wider">
            📍 Ô đất chịu tác động trực tiếp:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {activeModifier.affectedCells.map((idx) => {
              const cellName = BOARD_CONFIG[idx]?.name ?? `Ô ${idx}`;
              return (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold bg-white text-slate-800 border border-slate-300 shadow-xs"
                >
                  {cellName}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA Button */}
      <button
        type="button"
        data-testid="event-card-confirm-btn"
        onClick={onConfirm ?? onClose}
        className="relative z-10 w-full min-h-[46px] px-4 py-2.5 rounded-2xl font-black text-white text-xs sm:text-sm uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer bg-emerald-600 hover:bg-emerald-500 border-2 border-emerald-700 shadow-[0_4px_0_0_#065f46] active:shadow-[0_1px_0_0_#065f46] active:translate-y-[3px]"
        dangerouslySetInnerHTML={{ __html: resolvedCta }}
      />
====
      {/* Vùng cuộn nội dung giữa (Scrollable Content Container - giải quyết dứt điểm P1-C) */}
      <div
        data-testid="event-card-scroll-container"
        className="w-full overflow-y-auto max-h-[calc(85dvh-130px)] sm:max-h-[calc(90dvh-140px)] pr-0.5 flex flex-col items-center z-10"
      >
        {/* Category Badge */}
        <span className={`px-3 py-1 rounded-full text-[10px] sm:text-[11px] uppercase font-black tracking-wider border shadow-xs mb-3 ${badgeColor}`}>
          {categoryLabel}
        </span>

        {/* Hero Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#F7F2E7] border-2 border-slate-900 flex items-center justify-center text-3xl mb-3 shadow-[0_3px_0_0_#0f172a]">
          <span aria-hidden="true">{iconEmoji}</span>
        </div>

        {/* Card Title */}
        <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight mb-2 leading-tight px-1">
          {resolvedTitle}
        </h2>

        {/* Khối Hero Stat Box to bản */}
        <div
          data-testid="event-hero-stat"
          className={`w-full rounded-2xl border-2 p-2.5 mb-3 flex flex-col items-center justify-center text-center font-mono shadow-xs ${heroStyles.container}`}
        >
          <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${heroStyles.label}`}>
            {heroStat.label}
          </span>
          <span className={`text-xl sm:text-2xl font-black tracking-tight tabular-nums mt-0.5 ${heroStyles.value}`}>
            {heroStat.value}
          </span>
        </div>

        {/* Description text */}
        <p className="text-xs text-slate-600 mb-3 leading-relaxed px-1 font-semibold hidden sm:block">
          {singleTruthDescription}
        </p>

        {/* Khối Tóm Tắt Tác Động Nhanh 1 Giây — Mobile (< 640px) */}
        <div
          data-testid="event-impact-summary"
          className="w-full bg-[#F7F2E7] border border-slate-300 rounded-xl p-3 mb-3 text-left sm:hidden flex flex-col gap-2 shadow-xs"
        >
          <div className="flex items-center justify-between gap-1.5 flex-wrap">
            {resolvedTargetScope && resolvedTargetScope !== 'Người chơi rút thẻ' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                <span>🎯</span>
                <span>{resolvedTargetScope}</span>
              </span>
            )}
            {resolvedDuration && resolvedDuration !== 'Tức thì' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-800 border border-slate-300">
                <span>⏳</span>
                <span>{resolvedDuration}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-800 font-bold leading-relaxed text-center">
            {singleTruthDescription}
          </p>
        </div>

        {/* Khối Thông Số Tác Động Nhanh — Desktop (>= 640px) */}
        <div
          data-testid="event-specs-table"
          className="w-full bg-[#F7F2E7] border border-slate-300 rounded-xl p-3 mb-3 items-center justify-center gap-2 hidden sm:flex flex-wrap shadow-xs"
        >
          {resolvedDenseScope && resolvedDenseScope !== 'Người chơi rút thẻ' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
              <span>🎯</span>
              <span title={resolvedDenseScope}>{resolvedDenseScope}</span>
            </span>
          )}
          {resolvedDuration && resolvedDuration !== 'Tức thì' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-800 border border-slate-300">
              <span>⏳</span>
              <span>{resolvedDuration}</span>
            </span>
          )}
          {shouldShowDestination && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
              <span>🏛️</span>
              <span className="whitespace-nowrap">{resolvedDestination}</span>
            </span>
          )}
        </div>

        {/* Khối Hiển Thị Ô Đất Bị Ảnh Hưởng (IMP-234) */}
        {activeModifier?.affectedCells && activeModifier.affectedCells.length > 0 && (
          <div
            data-testid="event-affected-cells-list"
            className="w-full bg-amber-50/80 border border-amber-300 rounded-xl p-2.5 mb-3 flex flex-col items-center gap-1.5 shadow-xs"
          >
            <span className="text-[10px] sm:text-[11px] font-black uppercase text-amber-900 tracking-wider">
              📍 Ô đất chịu tác động trực tiếp:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5 max-h-24 overflow-y-auto pr-1">
              {activeModifier.affectedCells.slice(0, 12).map((idx) => {
                const cellName = BOARD_CONFIG[idx]?.name ?? `Ô ${idx}`;
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold bg-white text-slate-800 border border-slate-300 shadow-xs"
                  >
                    {cellName}
                  </span>
                );
              })}
              {activeModifier.affectedCells.length > 12 && (
                <span className="text-[10px] font-extrabold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                  +{activeModifier.affectedCells.length - 12} ô khác
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CTA Button Cố Định Luôn Nhìn Thấy Ở Đáy */}
      <button
        type="button"
        data-testid="event-card-confirm-btn"
        onClick={onConfirm ?? onClose}
        className="relative z-10 w-full min-h-[46px] px-4 py-2.5 rounded-2xl font-black text-white text-xs sm:text-sm uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer bg-emerald-600 hover:bg-emerald-500 border-2 border-emerald-700 shadow-[0_4px_0_0_#065f46] active:shadow-[0_1px_0_0_#065f46] active:translate-y-[3px] shrink-0 mt-2"
        dangerouslySetInnerHTML={{ __html: resolvedCta }}
      />
>>>>
```

---

#### Task 4: Giải tỏa va chạm 3 tầng tại đáy màn hình trong `hud_container.tsx`
- **Enclosing Target**: `HudContainer` navigation pill placement
- **Target physical file**: src/client/ui/hud_container.tsx

```tsx
<<<<
        {/* Cụm Nút Nổi Điều Hướng Camera (Recenter Pawn & Camera Snap Overview) */}
        <div className="pointer-events-none fixed bottom-28 sm:bottom-32 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-2 max-w-[95vw]">
        <RecenterPawnPill
          activeModal={activeModal}
          cameraFocusCell={cameraFocusCell}
          pawnPosition={pawnPos}
          onRecenter={() => setCameraFocusCell(null)}
        />
        <CameraResetPill />
      </div>
====
        {/* Cụm Nút Nổi Điều Hướng Camera (Tránh trục giữa trên Mobile, Giữ căn giữa trên Desktop) */}
        <div className="pointer-events-none fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-3 sm:bottom-32 sm:left-1/2 sm:-translate-x-1/2 z-20 flex items-center justify-start sm:justify-center gap-2 max-w-[95vw]">
        <RecenterPawnPill
          activeModal={activeModal}
          cameraFocusCell={cameraFocusCell}
          pawnPosition={pawnPos}
          onRecenter={() => setCameraFocusCell(null)}
        />
        <CameraResetPill />
      </div>
>>>>
```

---

#### Task 5: Thu gọn thẻ phá sản & Backdrop tắt HUD trong `player_card.tsx` và `player_hud_list.tsx`
- **Enclosing Target**: `PlayerCard` property clusters rendering
- **Target physical file**: src/client/ui/player_card.tsx

```tsx
<<<<
      {/* Cụm 28 chấm BĐS & Hạ Tầng/Tiện Ích sắp xếp 3 dòng:
          - Dòng 1 (11 chấm): Nâu, Xanh Da Trời, Hồng, Cam
          - Dòng 2 (11 chấm): Đỏ, Vàng, Xanh Lá, Tím
          - Dòng 3 (6 chấm): 4 Giao Thông (Xám Thép #475569) & 2 Tiện Ích (Xanh Coban #0284C7) */}
      <span className="sr-only">BĐS:</span>
      <div
        className="flex flex-col gap-1 w-full px-2 pt-1.5 pb-1 border-t border-slate-300 select-none"
        data-testid="player-property-clusters"
      >
====
      {/* Cụm 28 chấm BĐS chỉ render khi người chơi còn hoạt động, thu gọn khi Phá Sản */}
      {!player.bankrupt && (
        <>
          <span className="sr-only">BĐS:</span>
          <div
            className="flex flex-col gap-1 w-full px-2 pt-1.5 pb-1 border-t border-slate-300 select-none"
            data-testid="player-property-clusters"
          >
>>>>
```

```tsx
<<<<
        </div>
      </div>
    </div>
  );
}
====
        </div>
      </div>
        </>
      )}
    </div>
  );
}
>>>>
```

- **Enclosing Target**: `PlayerHudList` backdrop dismiss (Khắc phục P1-A với `useGameStore.setState`)
- **Target physical file**: src/client/ui/player_hud_list.tsx

```tsx
<<<<
  return (
    <aside
      className="pointer-events-none flex flex-col gap-2 w-40 sm:w-48 md:w-64 max-w-[calc(100vw-8rem)] select-none items-end pt-16 sm:pt-0"
      aria-label="Danh sách người chơi"
    >
      <div className="flex flex-col gap-2 w-full pt-16 sm:pt-0">
        {playerList.map((player, index) => (
          <PlayerCard
            key={player.id}
            player={player}
            isCurrentTurn={player.id === currentTurnPlayerId}
            levelMap={levelMap}
            slotIndex={index}
          />
        ))}
      </div>
    </aside>
  );
====
  return (
    <>
      {/* Lớp nền chạm để đóng danh sách người chơi trên Mobile (Khắc phục P1-A) */}
      <div
        data-testid="player-hud-backdrop"
        onClick={() => useGameStore.setState({ isPlayerHudVisible: false })}
        className="fixed inset-0 z-10 sm:hidden bg-slate-950/20 backdrop-blur-[0.5px] pointer-events-auto"
        aria-hidden="true"
      />
      <aside
        className="pointer-events-none flex flex-col gap-2 w-40 sm:w-48 md:w-64 max-w-[calc(100vw-8rem)] select-none items-end pt-16 sm:pt-0 relative z-20"
        aria-label="Danh sách người chơi"
      >
        <div className="flex flex-col gap-2 w-full pt-16 sm:pt-0 pointer-events-auto">
          {playerList.map((player, index) => (
            <PlayerCard
              key={player.id}
              player={player}
              isCurrentTurn={player.id === currentTurnPlayerId}
              levelMap={levelMap}
              slotIndex={index}
            />
          ))}
        </div>
      </aside>
    </>
  );
>>>>
```

---

#### Task 6: Tối ưu mật độ hiển thị Banner Sự Kiện trong `market_event_ticker.tsx` (Khắc phục P1-B)
- **Enclosing Target**: `MarketEventTicker` rendering loop
- **Target physical file**: src/client/ui/market_event_ticker.tsx

```tsx
<<<<
        return (
          <div
            key={`${cardType}_${index}`}
            data-testid={`market-ticker-item-${cardType}`}
            onClick={handleCardClick}
            title={`${title}: ${formula} (Bấm xem chi tiết)`}
            className="w-full pointer-events-auto min-h-[44px] flex items-center justify-between gap-1.5 px-2.5 py-1.5 sm:py-1 bg-[#FFFDF8]/95 hover:bg-amber-50/95 backdrop-blur-xs border-2 border-slate-900 rounded-lg sm:rounded-xl shadow-[0_2px_0_0_#0f172a] text-xs font-bold transition-colors cursor-pointer select-none text-slate-900 leading-none"
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="text-sm shrink-0" aria-hidden="true">
                {icon}
              </span>
              <span className="font-extrabold text-[11px] sm:text-xs text-slate-900 shrink-0">
                <span className="sm:hidden">{shortTag}:</span>
                <span className="hidden sm:inline truncate max-w-[150px]">{title}:</span>
              </span>
              {heroStat.value && (
                <span className={`hidden sm:inline-flex px-1 py-0.5 rounded text-[10px] sm:text-[11px] font-black uppercase tracking-wider shrink-0 ${heroStyles.badge}`}>
                  {heroStat.value}
                </span>
              )}
              <span
                data-testid="market-ticker-effect-summary"
                className="font-semibold text-[11px] sm:text-xs text-slate-700 min-w-0 line-clamp-2 break-words"
              >
                {formula}
              </span>
            </div>
            <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded-full shrink-0 border border-amber-400 ml-1 whitespace-nowrap">
              Còn {modifier.remainingRounds} vòng
            </span>
          </div>
        );
====
        return (
          <div
            key={`${cardType}_${index}`}
            data-testid={`market-ticker-item-${cardType}`}
            onClick={handleCardClick}
            title={`${title}: ${formula} (Bấm xem chi tiết)`}
            className={`w-full pointer-events-auto min-h-[44px] ${
              index > 0 ? 'hidden sm:flex' : 'flex'
            } items-center justify-between gap-1.5 px-2.5 py-1.5 sm:py-1 bg-[#FFFDF8]/95 hover:bg-amber-50/95 backdrop-blur-xs border-2 border-slate-900 rounded-lg sm:rounded-xl shadow-[0_2px_0_0_#0f172a] text-xs font-bold transition-colors cursor-pointer select-none text-slate-900 leading-none`}
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="text-sm shrink-0" aria-hidden="true">
                {icon}
              </span>
              <span className="font-extrabold text-[11px] sm:text-xs text-slate-900 shrink-0">
                <span className="sm:hidden">{shortTag}:</span>
                <span className="hidden sm:inline truncate max-w-[150px]">{title}:</span>
              </span>
              {heroStat.value && (
                <span className={`hidden sm:inline-flex px-1 py-0.5 rounded text-[10px] sm:text-[11px] font-black uppercase tracking-wider shrink-0 ${heroStyles.badge}`}>
                  {heroStat.value}
                </span>
              )}
              <span
                data-testid="market-ticker-effect-summary"
                className="font-semibold text-[11px] sm:text-xs text-slate-700 min-w-0 line-clamp-2 break-words"
              >
                {formula}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-1">
              {index === 0 && active.length > 1 && (
                <span className="sm:hidden text-[9px] font-black bg-amber-200 text-amber-900 px-1 py-0.5 rounded-sm border border-amber-400">
                  +{active.length - 1} sự kiện
                </span>
              )}
              <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded-full border border-amber-400 whitespace-nowrap">
                Còn {modifier.remainingRounds} vòng
              </span>
            </div>
          </div>
        );
>>>>
```

---

### Station 1: BỘ KIỂM THỬ HỢP ĐỒNG (UNIVERSAL 5-FACET MATRIX)
Suite: `tests/contracts/imp237_mobile_viewport_harmonics.test.ts` (Sàn >= 15 atomic tests)

* **Facet 1: 3D Billboard Zoom & Typography Clamping (TC-MVH-01..03)**
  - `TC-MVH-01`: `TileEventFloatingBadge` mang class `whitespace-nowrap` ngăn chặn hoàn toàn việc ngắt dòng chữ dọc.
  - `TC-MVH-02`: `TileEventFloatingBadge` áp dụng `max-w-[140px] truncate` bảo đảm phù hiệu không vượt khung hình.
  - `TC-MVH-03`: `SafeHtml` không cấu hình `distanceFactor={14}` làm phóng đại vô hạn khi camera zoom cận cảnh.
* **Facet 2: Event Modal Data Sanity & Sticky CTA Footer (TC-MVH-04..07)**
  - `TC-MVH-04`: Bộ xử lý `MC_RATE_HIKE` trong `market_card_handlers` đẩy `affectedCells: []` rỗng, loại trừ 40 ô đất thừa.
  - `TC-MVH-05`: Khi `affectedCells: []`, `EventCardModal` không kết xuất khối `event-affected-cells-list`.
  - `TC-MVH-06`: Khi `affectedCells` có nhiều ô, danh sách ô đất giới hạn tối đa 12 ô và hiển thị chip `+N ô khác` trong container cuộn `max-h-24`.
  - `TC-MVH-07`: Nút bấm `event-card-confirm-btn` có class `shrink-0` và container modal dùng `overflow-hidden` bảo đảm nút bấm không bị đẩy khỏi màn hình.
* **Facet 3: De-collision of Bottom Camera Controls (TC-MVH-08..10)**
  - `TC-MVH-08`: Trên Mobile, container `CameraResetPill` mang class `left-3 bottom-[calc(5rem+env(safe-area-inset-bottom))]` né hoàn toàn trục giữa nơi `DiceScoreBadge` hiển thị.
  - `TC-MVH-09`: Trên Desktop (`sm:`), container mang class `sm:left-1/2 sm:-translate-x-1/2 sm:bottom-32` bảo tồn thẩm mỹ căn giữa.
  - `TC-MVH-10`: Nút `CameraResetPill` duy trì kích thước tối thiểu đạt chuẩn ngón tay `min-h-[44px]` và `data-testid="camera-reset-pill-btn"`.
* **Facet 4: Mobile Event Ticker Density & Desktop Parity (TC-MVH-11..13)**
  - `TC-MVH-11`: Khi có nhiều sự kiện thị trường, banner thứ 2 mang class `hidden sm:flex` để chống nghẽn chiều cao đỉnh trên mobile và thẻ thứ nhất hiển thị badge `+{active.length - 1} sự kiện`.
  - `TC-MVH-12`: `MarketEventTicker` trên Desktop (`sm:`) hiển thị các thẻ sự kiện với `title` và `formula` đầy đủ.
  - `TC-MVH-13`: Thao tác click vào banner sự kiện mở modal `openModal('event', ...)` với dữ liệu chính xác.
* **Facet 5: PlayerHudList Mobile Backdrop & Bankrupt Card Compactness (TC-MVH-14..16)**
  - `TC-MVH-14`: Khi `player.bankrupt === true`, `PlayerCard` không kết xuất khối `player-property-clusters`, thu gọn chiều cao thẻ.
  - `TC-MVH-15`: Khi `player.bankrupt === false`, `PlayerCard` kết xuất đầy đủ 28 chấm BĐS qua 3 dòng cluster.
  - `TC-MVH-16`: `PlayerHudList` trên mobile kết xuất lớp phủ `player-hud-backdrop` có sự kiện bấm để đóng danh sách người chơi với `useGameStore.setState({ isPlayerHudVisible: false })`.
