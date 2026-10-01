# BÁO CÁO NGHIỆM THU CẢI TIẾN IMP-237
## TỐI ƯU HÓA TRẢI NGHIỆM MOBILE & DESKTOP (3D BILLBOARD CLAMPING & VIEWPORT DE-CLUTTERING)

> **Mã số Ticket**: IMP-237  
> **Căn cứ kế hoạch**: [`docs/plans/improvements/IMP-237-mobile-viewport-harmonics-and-3d-badge-overhaul_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-237-mobile-viewport-harmonics-and-3d-badge-overhaul_plan.md) (Revision 2.0)  
> **Phán duyệt Kế hoạch**: 🟢 `HARDENED_APPROVED` bởi `plan-griller` ([`.agents/audit/PLAN_AUDIT_IMP-237.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-237.md))  
> **Thời điểm nghiệm thu**: 2026-10-01  
> **Phân loại**: Tier 2 (Full Rigor Closed-Loop Pipeline)  
> **Trạng thái**: ✅ **HOÀN THÀNH TOÀN DIỆN (100% GATES PASSED)**  

---

### 1. BỐI CẢNH & KHUYẾT TẬT ĐÃ GIẢI QUYẾT

Dựa trên 5 ảnh chụp thực tế trên thiết bị di động (`media_1790829069226.png` - `media_1790829093908.png`), ticket IMP-237 đã giải quyết triệt để 5 khuyết tật vật lý nghiêm trọng:

1. **Khuyết tật 1: Phù hiệu 3D Drei `<Html>` phình to 20 lần & gãy dòng chữ dọc (Ảnh 3, 4)**:
   - *Nguyên nhân*: Thuộc tính `distanceFactor={14}` làm Drei phóng đại theo tỷ lệ nghịch với khoảng cách camera (`distanceFactor / distance`). Khi camera zoom cận cảnh quân cờ hoặc xúc xắc, phù hiệu phình to 15–28 lần, che khuất 35% màn hình và gãy chữ thành 4 hàng dọc.
   - *Xử lý*: Loại bỏ hoàn toàn `distanceFactor={14}` (chuyển sang tỷ lệ pixel cố định $1:1$ của màn hình), bổ sung `whitespace-nowrap inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 max-w-[140px] truncate`.
2. **Khuyết tật 2: Thẻ `MC_RATE_HIKE` gán 40 ô đất thừa, đẩy trôi nút CTA (Ảnh 1)**:
   - *Nguyên nhân*: `src/domain/market_card_handlers.ts#L235` gán nhầm `affectedCells: BOARD_CONFIG.map((c) => c.index)` cho thẻ vĩ mô tăng lãi suất thế chấp vốn không tác động lên ô đất cụ thể nào (`targetScope: 'Tất cả người chơi...'`). Hệ quả: 40 chip ô rác tràn ngập `EventCardModal`, đẩy nút CTA khỏi khung hình, đồng thời kích hoạt 40 phù hiệu Drei HTML khiến frame rate tụt từ 60 xuống 27 FPS.
   - *Xử lý*: Sửa `MC_RATE_HIKE` về `affectedCells: []`. Bổ sung giới hạn tối đa 12 ô kèm chip `+N ô khác` trong container cuộn `max-h-24 overflow-y-auto`. Container modal áp dụng `overflow-hidden sm:overflow-y-auto` và nút CTA ghim cố định ở đáy ngoài vùng cuộn (`shrink-0 mt-2`).
3. **Khuyết tật 3: Xung đột đè nhau tháp 3 tầng ở đáy màn hình (Ảnh 3, 4)**:
   - *Nguyên nhân*: `CameraResetPill` đặt tại `bottom-28 left-1/2 -translate-x-1/2` chồng lấn trực tiếp lên `DiceScoreBadge` và `ActionDock`, chiếm dụng 180px không gian trục giữa.
   - *Xử lý*: Chuyển `CameraResetPill` sang `left-3 bottom-[calc(5rem+env(safe-area-inset-bottom))]` trên mobile (`< sm`), né hoàn toàn trục giữa; trên desktop (`sm:`) bảo tồn vị trí căn giữa `sm:left-1/2 sm:-translate-x-1/2 sm:bottom-32` (Dual-Viewport Parity).
4. **Khuyết tật 4: Dồn toa 2-3 banner sự kiện thị trường ở đỉnh (Ảnh 2, 3)**:
   - *Nguyên nhân*: Khi có nhiều sự kiện vĩ mô kích hoạt cùng lúc, mỗi banner chiếm `min-h-[44px]` xếp chồng dọc dưới TopBar, chiếm hơn 100px chiều cao màn hình di động.
   - *Xử lý*: Trên Mobile (`sm:hidden`), banner thứ 2 trở đi mang class `hidden sm:flex` và banner 1 hiển thị badge `+{active.length - 1} sự kiện`. Trên Desktop (`hidden sm:flex`), hiển thị đầy đủ tất cả các banner.
5. **Khuyết tật 5: Danh mục BĐS thẻ người chơi phá sản gây choáng ngợp & thiếu nút đóng HUD (Ảnh 5)**:
   - *Nguyên nhân*: Người chơi phá sản vẫn hiển thị 28 chấm BĐS chiếm diện tích thẻ; danh sách HUD người chơi trên mobile không có cách nào đóng ngoài việc bấm nút trên TopBar.
   - *Xử lý*: Ẩn khối `player-property-clusters` khi `player.bankrupt === true`. Thêm lớp phủ chạm ngoài `player-hud-backdrop` trên mobile (`absolute inset-0 z-10 sm:hidden bg-slate-950/20 backdrop-blur-[0.5px]`) đóng HUD bằng `useGameStore.setState({ isPlayerHudVisible: false })`.

---

### 2. KẾT QUẢ ĐO ĐẠC HẠ TẦNG & NGÂN SÁCH LOC VẬT LÝ

Được đo đạc tự động bằng công cụ `scripts/check_loc.mjs`:

| Tệp vật lý | Phân tầng kiểm soát | Tổng dòng (Total) | Dòng code thực (SLOC) | Trần cho phép (Ceiling) | Trạng thái |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/domain/market_card_handlers.ts` | Tier 1 (Domain Logic) | **276** | 262 | <= 400 | ✔️ Safe |
| `src/domain/event_card_types.ts` | Tier 1 (Domain Logic) | **56** | 52 | <= 400 | ✔️ Safe |
| `src/client/3d/tile_event_aura.tsx` | Tier 2 (3D/UI) | **224** | 202 | <= 500 | ✔️ Safe |
| `src/client/ui/modals/event_card_modal.tsx` | Tier 2 (3D/UI) | **277** | 255 | <= 500 | ✔️ Safe |
| `src/client/ui/hud_container.tsx` | Tier 2 (3D/UI) | **137** | 125 | <= 500 | ✔️ Safe |
| `src/client/ui/player_card.tsx` | Tier 2 (3D/UI) | **399** | 373 | <= 500 | ✔️ Safe |
| `src/client/ui/player_hud_list.tsx` | Tier 2 (3D/UI) | **47** | 44 | <= 500 | ✔️ Safe |
| `src/client/ui/market_event_ticker.tsx` | Tier 2 (3D/UI) | **297** | 277 | <= 500 | ✔️ Safe |
| `tests/contracts/imp237_mobile_viewport_harmonics.test.ts` | Living Contract Test | **435** | 380 | <= 600 | ✔️ Safe |

---

### 3. HỒ SƠ PHÊ CHUẨN 4 TRẠM KHÉP KÍN (4-STATION CLOSED-LOOP PIPELINE)

```
[Kế hoạch Rev 2.0] ➔ [plan-griller: HARDENED_APPROVED]
         ↓
[Trạm 1: qa-tester (RED Inversion 12/16 Failed)] ➔ [tests/contracts/imp237_...test.ts]
         ↓
[Trạm 2: implementer (GREEN 16/16 Passed)] ➔ [10 Snippets Across 8 Files]
         ↓
[Trạm 2.5: scout (PREFILTER_PASSED: 0 Type Errors, 0 Dirty Casts, 0 Console Logs)]
         ↓
[Trạm 3: Review Funnel (Physical Visual Gate + 4 Reviewers Approved)]
  ├─ Phase 3.0: Physical Visual Evidence: .agents/tmp/imp-237_mobile_view.jpg (Verified)
  ├─ Phase 3.1: spec-reviewer: SPEC_APPROVED (100% Plan Fidelity, 0 Scope Drift)
  └─ Phase 3.2: 
       ├─ game-3d-visual-critic: 3D_VISUAL_APPROVED
       ├─ ui-craft-reviewer: UI_APPROVED
       └─ re-reviewer: CODE_APPROVED (All findings addressed via Active Remediation)
         ↓
[Trạm 4: chaos-sentinel (APPROVED: 3 Probes Passed, 6/6 Mutants Killed)]
```

#### Chi tiết nghiệm thu từng Trạm:
- **Station 1 (QA Contract Testing RED & Inversion Baseline)**:
  - Bộ 16 atomic tests tại `tests/contracts/imp237_mobile_viewport_harmonics.test.ts`.
  - Phủ trọn Universal 5-Facet Matrix: `TC-MVH-01..16` với nhãn `[UC-IMP237]`.
  - **Phân loại kết quả Adversarial Inversion**: 
    * 12 ca thất bại hợp lệ (**Business RED**): Các tính năng/hành vi mới chưa triển khai (loại bỏ `distanceFactor`, chống ngắt dòng 3D, `affectedCells: []`, modal scroll container, de-collision camera reset pill sang `left-3`, ticker badge `+N sự kiện`, backdrop mobile, ẩn cụm 28 chấm của người chơi phá sản).
    * 4 ca nghiệm thu bất biến kế thừa (**Non-Regressive Baseline Contracts** - PASS trước khi sửa): `TC-MVH-10` (kích thước pill min 44px từ IMP-235), `TC-MVH-12` (desktop render đủ các thẻ sự kiện), `TC-MVH-13` (click banner mở modal sự kiện), `TC-MVH-15` (người chơi bình thường vẫn render đủ 28 chấm BĐS). Mục đích 4 test này là bảo toàn 100% hợp đồng cũ không bị phá vỡ khi áp dụng logic mới.
    * 0 lỗi hạ tầng (Zero infrastructure errors).
- **Station 2 (GREEN Implementation)**:
  - Triển khai 10 drop-in snippets qua 8 tệp mã nguồn sạch sẽ.
  - 16/16 contract tests chuyển sang GREEN.
  - 50/50 regression tests trên các suite kế thừa (`imp187`, `imp173`, `chunky_hud_layout`) giữ vững 100%.
- **Station 2.5 (Fast Pre-Filter Sweep & Cast Hardening)**:
  - Typecheck `tsc --noEmit`: 0 lỗi.
  - LOC Budget: Đạt 100% (tất cả các tệp đều dưới trần Tier 1/Tier 2).
  - Zero Dirty Casts: Quét sạch `as any`, `as unknown as`; đồng thời tái cấu trúc hàm `resolveMarketTitle` trong `market_event_ticker.tsx` sang từ điển gộp `ALL_MARKET_TITLES` triệt tiêu hoàn toàn 3 cast `as Record<string, string | undefined>`.
  - Clean Logs: 0 `console.log`, 0 `debugger`.
- **Station 3 (Review Funnel)**:
  - **Phase 3.0 (Physical Visual Evidence)**: Chụp thực nghiệm bằng headless browser qua CDP tại `.agents/tmp/imp-237_mobile_view.jpg`.
  - **Phase 3.1 (Spec Gate)**: `spec-reviewer` phê chuẩn `SPEC_APPROVED` (10/10 drop-in snippets khớp vật lý, 0 scope drift).
  - **Phase 3.2 (Craft & Deep Architecture)**:
    * `game-3d-visual-critic`: `3D_VISUAL_APPROVED` (triệt tiêu phóng đại 20x, sa bàn 40 ô chuẩn mỹ thuật AAA).
    * `ui-craft-reviewer`: `UI_APPROVED` (Dual-Viewport Parity, touch targets >= 44px, WCAG 2.1 AA).
    * `code-reviewer` & `re-reviewer`: `CODE_APPROVED` (Active Remediation: backdrop `absolute inset-0`, modal `overflow-hidden sm:overflow-y-auto`, 81/81 tests qua 4 suites PASS 100%).
- **Station 4 (Chaos Sentinel)**:
  - Probe 1 (Closed-Loop Parity): 24/24 Intent đối xứng giữa Edge và Core, 0 parity gap.
  - Probe 2 (Ephemeral Boundary): Live WebSocket handshake trên dynamic port 64009, socket teardown sạch sẽ.
  - Probe 3 (Mutation Sensitivity): 6/6 mutants bị tiêu diệt trong sandbox Vitest vật lý (0 survived, vượt sàn $\ge 5$).
  - Xác thực snapshot bằng lệnh: `node scripts/check_evidence.mjs IMP-237` ➔ `✅ Evidence verified`.

---

### 4. BẰNG CHỨNG HỒ SƠ & TÍNH KHÉP KÍN

- Kế hoạch: [`docs/plans/improvements/IMP-237-mobile-viewport-harmonics-and-3d-badge-overhaul_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-237-mobile-viewport-harmonics-and-3d-badge-overhaul_plan.md)
- Báo cáo Griller: [`.agents/audit/PLAN_AUDIT_IMP-237.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-237.md)
- Bằng chứng Trạm 4: [`.agents/evidence/chaos_sentinel_IMP-237.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-237.json)
- Ảnh chụp thực tế: [`.agents/tmp/imp-237_mobile_view.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-237_mobile_view.jpg)
- Sổ cái Epic: [`docs/epics/client_ui/_epic_ledger.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/epics/client_ui/_epic_ledger.md)
