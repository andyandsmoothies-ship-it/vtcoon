# Plan IMP-372: Mobile UI Ergonomics, Player Card Density & Floating Toast De-escalation (Ticket IMP-372)

## 0. Context & Architectural Rationale
- **Prior In-Flight Scope & UAT Telemetry Baseline**:
  - Theo báo cáo chẩn đoán iPhone Chrome ([`docs/reports/diagnostics/IOS_CHROME_GAMEPLAY_FORENSIC_REPORT.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/diagnostics/IOS_CHROME_GAMEPLAY_FORENSIC_REPORT.md)) và thẩm định đối kháng phản biện:
    - **DEF-04**: `PlayerHudList` bị ép cột tên còn 24px do bên phải chứa tiền mặt + NetWorth badge + thấu chi; 112 chấm BĐS rỗng trên 4 thẻ chiếm 60% chiều cao thẻ.
    - **DEF-05**: Banner sự kiện `MilestoneBanner` chiếm 4 dòng do header rớt dòng (`flex-wrap`) và mô tả dài, đè lên ActionDock.
    - **DEF-06**: Chồng lấn vùng đáy khi toast tài chính và milestone cùng kích hoạt, hoặc toast bị ẩn hoàn toàn (Financial Toast Blackout).
- **Architectural Solution (4 Levers)**:
  1. **Player HUD Width & NetWorth Mobile Collapse**: Đặt `w-44 sm:w-48 md:w-64` trong `player_hud_list.tsx`. Trong `player_net_worth_badge.tsx`, đặt `hidden sm:inline-flex` giải phóng ~50px cho cột tên mà không bành trướng lấn chiếm sa bàn 3D.
  2. **Non-Turn 28-Dot Mobile Collapse**: Trong `player_card.tsx`, trên mobile chỉ hiển thị đầy đủ 28 chấm cho `isCurrentTurn`, các thẻ còn lại ẩn container trên mobile (`hidden sm:flex`) giảm 60% chiều cao 3 thẻ không hoạt động.
  3. **Milestone Banner Capsule Compactness**: Trong `floating_numbers.tsx`, chuyển header sang `flex-nowrap`, mô tả `line-clamp-1 sm:line-clamp-2`, và danh mục phụ `hidden sm:flex`, giới hạn tối đa 2 dòng trên mobile.
  4. **Financial Toast Single-Stack Under Banner**: Thay vì xóa bỏ toast, sửa `isOlderWithBanner = Boolean(latestMilestone) && displayItems.length > 1 && index === 0` để duy trì chính xác 1 toast tài chính gần nhất hiển thị dưới banner.

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-372`
- **Subsystem**: `client-ui` (Tier 2 UI Presentation & Ergonomics)
- **Direct Scope (Physical Files)**:
  - **Target physical file**: `src/client/ui/player_hud_list.tsx` (Refactor)
  - **Target physical file**: `src/client/ui/player_net_worth_badge.tsx` (Refactor)
  - **Target physical file**: `src/client/ui/player_card.tsx` (Refactor)
  - **Target physical file**: `src/client/ui/floating_numbers.tsx` (Refactor)
  - **Target physical file**: `tests/client/imp372_mobile_ergonomics_and_toast_deescalation.test.ts` (Tệp mới)
- **Referenced Contracts / Stable Boundaries**:
  - `src/client/ui/hud_container.tsx`
  - `src/client/ui/notification_deduplicator.ts`
  - `docs/reports/diagnostics/IOS_CHROME_GAMEPLAY_FORENSIC_REPORT.md`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/ui/player_hud_list.tsx` | Tier 2 (UI/3D/Views) | 38 | 38 | 0 | <= 500 | Safe (< 100 LOC) |
| `src/client/ui/player_net_worth_badge.tsx` | Tier 2 (UI/3D/Views) | 18 | 18 | 0 | <= 500 | Safe (< 50 LOC) |
| `src/client/ui/player_card.tsx` | Tier 2 (UI/3D/Views) | 398 | 398 | 0 | <= 500 | Safe (< 450 LOC) |
| `src/client/ui/floating_numbers.tsx` | Tier 2 (UI/3D/Views) | 373 | 373 | 0 | <= 500 | Safe (< 400 LOC) |
| `tests/client/imp372_mobile_ergonomics_and_toast_deescalation.test.ts` | Living Test | 0 | 150 | +150 | <= 600 | 🆕 Tệp mới |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- Viết bộ kiểm thử hợp đồng độc lập tại `tests/client/imp372_mobile_ergonomics_and_toast_deescalation.test.ts`:
  - TC-372.01 [UC-HUD-WIDTH-MOBILE/MSS]: Given mobile viewport, When PlayerHudList renders, Then root aside uses w-44 to preserve >50% board view.
  - TC-372.02 [UC-NETWORTH-MOBILE-COLLAPSE/MSS]: Given mobile viewport, When PlayerNetWorthBadge renders, Then applies hidden sm:inline-flex while retaining data-testid="player-net-worth".
  - TC-372.03 [UC-CARD-NON-TURN-DOTS/MSS]: Given player card with isCurrentTurn false, When rendered, Then player-property-clusters applies hidden sm:flex to collapse mobile height.
  - TC-372.04 [UC-BANNER-CAPSULE/MSS]: Given MilestoneBanner with long desc, When rendered, Then applies flex-nowrap on header and line-clamp-1 on mobile.
  - TC-372.05 [UC-TOAST-PRESERVE-ONE/MSS]: Given latestMilestone active and one regular toast, When FloatingNumbersOverlay renders, Then displays the regular toast without blackout.
  - TC-372.06 [UC-BOTTOM-CLEARANCE/MSS]: Given mobile viewport, When FloatingNumbersOverlay positions stack, Then applies bottom-[calc(8.5rem...)] clearance.

### Station 2: Implementation (GREEN)

#### Task 1: Điều chỉnh độ rộng HUD trong `src/client/ui/player_hud_list.tsx`
**Target physical file**: `src/client/ui/player_hud_list.tsx`
```tsx
<<<<
      className="pointer-events-none flex flex-col gap-2 w-40 sm:w-48 md:w-64 max-w-[calc(100vw-8rem)] select-none items-end pt-1 sm:pt-0 relative z-20"
====
      className="pointer-events-none flex flex-col gap-2 w-44 sm:w-48 md:w-64 max-w-[calc(100vw-6rem)] select-none items-end pt-1 sm:pt-0 relative z-20"
>>>>
```

#### Task 2: Ẩn NetWorth trên mobile trong `src/client/ui/player_net_worth_badge.tsx`
**Target physical file**: `src/client/ui/player_net_worth_badge.tsx`
```tsx
<<<<
      className="inline-flex items-center text-[10px] sm:text-[11px] text-slate-500 sm:text-slate-700 font-semibold sm:font-black tabular-nums shrink-0"
====
      className="hidden sm:inline-flex items-center text-[10px] sm:text-[11px] text-slate-500 sm:text-slate-700 font-semibold sm:font-black tabular-nums shrink-0"
>>>>
```

#### Task 3: Thu gọn 28 chấm cho người chơi không tới lượt trong `src/client/ui/player_card.tsx`
**Target physical file**: `src/client/ui/player_card.tsx`
```tsx
<<<<
            className="flex flex-col gap-1 w-full px-2 pt-1.5 pb-1 border-t border-slate-300 select-none"
====
            className={`flex-col gap-1 w-full px-2 pt-1.5 pb-1 border-t border-slate-300 select-none ${!isCurrentTurn ? 'hidden sm:flex' : 'flex'}`}
>>>>
```

#### Task 4: Tinh gọn MilestoneBanner và chống mù biến động tài chính trong `src/client/ui/floating_numbers.tsx`
**Target physical file**: `src/client/ui/floating_numbers.tsx`
```tsx
<<<<
        className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap min-w-0 flex-1"
====
        className="flex items-center gap-1.5 flex-nowrap min-w-0 flex-1"
>>>>
```

```tsx
<<<<
          className="line-clamp-2 break-words min-w-0 text-[11px] sm:text-xs text-slate-600 font-medium leading-tight"
====
          className="line-clamp-1 sm:line-clamp-2 break-words min-w-0 text-[11px] sm:text-xs text-slate-600 font-medium leading-tight"
>>>>
```

```tsx
<<<<
      className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate pt-0.5"
====
      className="hidden sm:flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate pt-0.5"
>>>>
```

```tsx
<<<<
          const isOlderWithBanner = Boolean(latestMilestone) && (displayItems.length === 1 || index === 0);
====
          const isOlderWithBanner = Boolean(latestMilestone) && displayItems.length > 1 && index === 0;
>>>>
```

### Station 3: Pre-Filter & Visual Evidence Verification
- Chạy mechanical pre-filter: `npm run prefilter -- src/client/ui/player_hud_list.tsx src/client/ui/player_net_worth_badge.tsx src/client/ui/player_card.tsx src/client/ui/floating_numbers.tsx`
- Bằng chứng thị giác Dual-Viewport: Chạy `npm run capture:visual -- --ticket IMP-372 --scenario camera_chase_cinematic`
- Kiểm toán bằng chứng vật lý: `node scripts/check_evidence.mjs IMP-372`

## 4. Risks & Mitigations
| Rủi ro kỹ thuật | Mức độ | Biện pháp giảm thiểu |
| :--- | :---: | :--- |
| **Tràn màn hình khi mở PlayerCard trên mobile (360px)** | Thấp | Dùng `w-44` (176px) thay vì `w-48`, kết hợp ẩn NetWorth giải phóng 50px cho tên. |
| **Phá vỡ test living hợp đồng 28 chấm (IMP-187/193)** | Thấp | 28 chấm vẫn render đầy đủ trong DOM (server markup), chỉ ẩn bằng lớp CSS `hidden sm:flex`. |
| **Mất thông tin tài sản ròng trên mobile** | Thấp | Người chơi mobile có thể xem chi tiết tài sản ròng trong Portfolio Modal khi chạm vào thẻ. |

## 5. Blast Radius & Regressions
- **Không thay đổi Desktop**: Màn hình `sm:` và `md:` giữ nguyên 100% NetWorth, 28 chấm và layout banner.
- **Không thay đổi Game State**: Zero thay đổi đối với FSM state, Room, Banking hay Turn cycle.
- **Ranh giới phân hệ**: Giới hạn nghiêm ngặt trong phân hệ `client-ui`, bảo toàn trần LOC <= 500 cho cả 4 tệp.

## 6. Definition of Done (DoD)
- [ ] 6/6 Contract tests trong `tests/client/imp372_mobile_ergonomics_and_toast_deescalation.test.ts` chuyển sang GREEN.
- [ ] TypeScript `tsc --noEmit` đạt 0 lỗi (Exit Code 0).
- [ ] Prefilter `npm run prefilter` vượt qua 100% (Zero dirty casts, LOC trong hạn mức).
- [ ] Toàn bộ living test suites của `client-ui` (`imp187`, `imp193`, `imp237`) đều PASS.
- [ ] Ký duyệt kế hoạch tự động qua `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_372_MOBILE_ERGONOMICS_PLAYER_CARD_AND_TOAST_DEESCALATION.md --auto-sign`.
