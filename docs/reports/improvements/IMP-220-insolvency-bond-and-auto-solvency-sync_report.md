# [REPORT] IMP-220: Tái Cơ Cấu Nợ Bằng Trái Phiếu Doanh Nghiệp Trong InsolvencyPhase & Đồng Bộ Cứu Nguy Tự Động

## 1. THÔNG TIN TỔNG QUAN
- **Mã Lát Cắt**: `IMP-220`
- **Tiêu Đề**: Corporate Bond Issuance in InsolvencyPhase, Auto-Solvency Transition, Server Bundle Sync & Touch Target Ergonomics.
- **Phân Hạng Rủi Ro**: **Tier 2 (Full Rigor)** — FSM TurnPhase Transitions, Server Intent Dispatcher, Off-Turn Hijack Guard, Production Bundle Build, UI Affordance & Error Notifications.
- **Trạng Thái**: ✅ **COMPLETE** (HOÀN TẤT 100% QUY TRÌNH 3 TRẠM).
- **Căn Cứ Kế Hoạch & Bằng Chứng**:
  - Kế hoạch phê duyệt: [`docs/plans/improvements/IMP-220-insolvency-bond-and-auto-solvency-sync_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-220-insolvency-bond-and-auto-solvency-sync_plan.md)
  - Phản biện đối kháng: [`.agents/audit/PLAN_AUDIT_IMP220.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP220.md)
  - Bằng chứng thực thi: [`.agents/evidence/imp220_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp220_snapshot.json) (`executed: true`)
- **Hội Đồng Độc Lập Trạm 3**:
  - `spec-reviewer`: **APPROVED** (100% đối chiếu kế hoạch đã duyệt, giải quyết dứt điểm C1, C2, C3).
  - `ui-craft-reviewer`: **APPROVE** (Sàn chạm `>= 46px`, tactile shadows `shadow-[0_4px_0_0_#b45309]`, độ lún `active:translate-y-[3px]`, công thái học mobile 360px, 0 UI linter violations).
  - `scout` (Trạm 2.5): **PASS 100%** (Zero `as any`, zero memory leak, FSM lifecycle nhất quán, ngân sách LOC an toàn).

---

## 2. NGUYÊN NHÂN CỐT LÕI & GIẢI PHÁP KIẾN TRÚC

### 2.1. Hiện Trạng Trước Cải Tiến
1. **Người chơi âm tiền bị kẹt không thể tự động cân đối**: Lệnh `INTENT_AUTO_SOLVENCY` (từ IMP-210) chỉ mới có trên mã nguồn TypeScript `src/server/intent_dispatcher.ts`. File binary thực thi khi chạy game `dist/server/index.js` chưa được build lại từ ngày 27/09, dẫn đến server trả về `INVALID_INTENT`.
2. **Không thể phát hành trái phiếu doanh nghiệp khi âm tiền**: Trong `TurnPhase.InsolvencyPhase`, whitelist intent tại `intent_dispatcher.ts` chặn đứng mọi intent ngoại trừ thế chấp, hạ cấp, tự động cân đối và phá sản. Intent phát hành trái phiếu `INTENT_ISSUE_BOND` bị từ chối với lý do `INVALID_PHASE` dù người chơi có Net Worth hàng chục nghìn và nhiều BĐS giá trị.
3. **Magic string và thiếu mã lỗi miền**: `intent_dispatcher.ts` trả về chuỗi trần `'CANNOT_RECOVER'`, không nằm trong enum `ActionRejectReason`. Các mã lỗi từ chối trái phiếu rơi vào fallback toast chung chung "Hướng Dẫn Trò Chơi".
4. **Lỗi hồi quy touch target TC-212.14**: 3 thẻ chọn gói tranche trong `BondIssuanceTab` có class `min-h-[96px]` nhưng thiếu chuỗi `min-h-[46px]`.

### 2.2. Sơ Đồ Kiến Trúc Luồng Vận Hành (FSM & Intent Flow)

```
[InsolvencyPhase (Balance < 0)]
       │
       ├──> [INTENT_ISSUE_BOND] (Chỉ Player Đang Tới Lượt - Off-Turn Guard)
       │         │
       │         ├──> [Kiểm tra NW >= 3000 & >= 2 BĐS Sạch & Đủ Tỷ Lệ Bảo Đảm]
       │         │         │
       │         │         ├──> Hợp Đồng Tạo Thành Công (Khóa Collateral Cells)
       │         │         │
       │         │         ├──> [Số Dư Sau Vay >= 0] ──> FSM: TurnPhase.PropertyManagement
       │         │         │
       │         │         └──> [Số Dư Sau Vay < 0]  ──> Duy Trì InsolvencyPhase (Cho Phép Tiếp Tục Thế Chấp)
       │
       └──> [INTENT_AUTO_SOLVENCY] (Thanh Lý Hạ Cấp & Thế Chấp, Bỏ Qua Collateral Cells)
```

---

## 3. CÁC HẠNG MỤC ĐÃ HOÀN TẤT VẬT LÝ

### 3.1. Chuẩn Hóa Domain SSOT & Intent Dispatcher
- Bổ sung `CANNOT_RECOVER: 'CANNOT_RECOVER'` vào `ActionRejectReason` trong [`src/domain/action_reasons.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/action_reasons.ts).
- Loại bỏ magic string `'CANNOT_RECOVER'` tại `intent_dispatcher.ts`.
- Bổ sung chốt bảo vệ bản quyền lượt (**Off-Turn Hijack Guard**): Trong `InsolvencyPhase`, nếu `current.id !== playerId` lập tức từ chối với `ActionRejectReason.NOT_YOUR_TURN`.
- Mở rộng whitelist cho phép `INTENT_ISSUE_BOND` trong `InsolvencyPhase`.

### 3.2. FSM Solvency Auto-Transition Trong Bond Manager
- Tại `handleIssueBond` ([`src/server/bond_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/bond_manager.ts)), khi hợp đồng tạo thành công:
  - Nếu `room.phase === TurnPhase.InsolvencyPhase`, người phát hành là người chơi hiện tại, và `player.balance >= 0`: tự động chuyển `room.phase = TurnPhase.PropertyManagement`.
  - Nếu `player.balance < 0`: phòng chơi tiếp tục giữ nguyên `InsolvencyPhase` để người chơi tiếp tục thế chấp các tài sản còn lại để thoát nợ.

### 3.3. Thông Báo Lỗi Trực Quan (Actionable Notifications)
- Tại [`src/client/ui/actionable_notification.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/actionable_notification.ts), bổ sung 4 ánh xạ song xạ:
  - `BOND_NOT_ELIGIBLE`: Giải thích rõ cần tài sản ròng tối thiểu 3.000 Tr và sở hữu ít nhất 2 BĐS chưa thế chấp.
  - `CANNOT_RECOVER`: Hướng dẫn gợi ý cân nhắc phát hành trái phiếu doanh nghiệp để bơm vốn lưu động.
  - `BOND_COLLATERAL_LOCKED`: Cảnh báo BĐS đang là tài sản bảo đảm cho trái phiếu doanh nghiệp đang lưu hành.
  - `ASSET_LOCKED`: Cảnh báo tài sản bị khóa theo luật định.

### 3.4. Nâng Cấp Giao Diện Modal & Tab Trái Phiếu
- [`src/client/ui/modals/bond_issuance_tab.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/bond_issuance_tab.tsx):
  - Chuẩn hóa touch target: 3 thẻ tranche đạt `min-h-[46px] sm:min-h-[96px]` (giải quyết triệt để lỗi hồi quy `TC-212.14`).
  - Khi `isInInsolvency = true`: hiển thị huy hiệu tái cơ cấu nợ `bond-insolvency-restructuring-badge` và đổi nhãn nút thành `CỨU NGUY TÀI CHÍNH: PHÁT HÀNH...`.
- [`src/client/ui/modals/property_portfolio_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/property_portfolio_modal.tsx):
  - Truyền `isInInsolvency={isNegative}` trên cùng dòng prop, bảo toàn 0-delta và giữ nguyên 471 LOC.
- [`src/client/ui/modals/insolvency_banner.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/insolvency_banner.tsx):
  - Bổ sung phương án "phát hành trái phiếu doanh nghiệp" vào đoạn văn hướng dẫn thoát nợ.

### 3.5. Đồng Bộ Hóa Server Bundle
- Thực thi `npm run build` thành công: biên dịch sạch TypeScript (`tsc`), client bundle và SSR server bundle `dist/server/index.js` (440.72 kB), cập nhật 100% intent mới nhất.

---

## 4. MA TRẬN ĐO LƯỜNG NGÂN SÁCH LOC (CHECK:LOC)

| Tệp Vật Lý | Phân Loại Tier | Total Lines | SLOC | Ngân Sách | Đánh Giá |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/domain/action_reasons.ts` | Tier 1 (Domain/Server/Logic) | **44** | 43 | <= 400 | ✔️ An toàn |
| `src/server/intent_dispatcher.ts` | Tier 1 (Domain/Server/Logic) | **185** | 181 | <= 400 | ✔️ An toàn |
| `src/server/bond_manager.ts` | Tier 1 (Domain/Server/Logic) | **232** | 205 | <= 400 | ✔️ An toàn |
| `src/client/ui/actionable_notification.ts` | Tier 2 (UI/3D/Views) | **356** | 350 | <= 500 | ✔️ An toàn |
| `src/client/ui/modals/property_portfolio_modal.tsx` | Tier 2 (UI/3D/Views) | **471** | 448 | <= 480 | ✔️ Đạt chuẩn 0-delta |
| `src/client/ui/modals/bond_issuance_tab.tsx` | Tier 2 (UI/3D/Views) | **178** | 163 | <= 500 | ✔️ An toàn |
| `src/client/ui/modals/insolvency_banner.tsx` | Tier 2 (UI/3D/Views) | **108** | 102 | <= 500 | ✔️ An toàn |

---

## 5. KẾT QUẢ KIỂM THỬ HỢP ĐỒNG (UNIVERSAL 5-FACET MATRIX)

Bộ kiểm thử tại [`tests/contracts/imp220_insolvency_bond_and_auto_solvency_sync.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp220_insolvency_bond_and_auto_solvency_sync.test.ts) đạt **18/18 tests PASS (100%)**:

| Facet | Mã Test | Mục Tiêu & Hành Vi Kiểm Thử | Kết Quả |
| :---: | :--- | :--- | :---: |
| **Facet 1** | `[TC-220.01/MSS]` | Cho phép `INTENT_ISSUE_BOND` khi ở `InsolvencyPhase` (đủ điều kiện, đúng lượt) | ✔️ PASS |
| **Facet 1** | `[TC-220.02/MSS]` | Phát hành trái phiếu đưa `balance >= 0` tự động chuyển FSM sang `PropertyManagement` | ✔️ PASS |
| **Facet 1** | `[TC-220.03/MSS]` | Phát hành trái phiếu nhưng `balance < 0` vẫn duy trì `InsolvencyPhase` | ✔️ PASS |
| **Facet 1** | `[TC-220.04a/MSS]` | Từ chối phát hành khi `netWorth < BOND_MIN_NET_WORTH` -> `BOND_NOT_ELIGIBLE` | ✔️ PASS |
| **Facet 1** | `[TC-220.04b/MSS]` | Từ chối phát hành khi `unmortgagedCells < BOND_MIN_PROPERTIES` -> `BOND_NOT_ELIGIBLE` | ✔️ PASS |
| **Facet 1** | `[TC-220.04c/MSS]` | Từ chối phát hành khi thiếu tài sản bảo đảm -> `BOND_NOT_ELIGIBLE` | ✔️ PASS |
| **Facet 2** | `[TC-220.05/MSS]` | Nút phát hành trái phiếu trong `BondIssuanceTab` đạt `min-h-[46px]` | ✔️ PASS |
| **Facet 2** | `[TC-220.06/MSS]` | Toàn bộ 3 thẻ gói tranche trong `BondIssuanceTab` đạt `min-h-[46px]` (sửa TC-212.14) | ✔️ PASS |
| **Facet 2** | `[TC-220.07/MSS]` | Hiển thị thẻ cảnh báo `bond-blocked-notice` khi không đủ điều kiện phát hành | ✔️ PASS |
| **Facet 3** | `[TC-220.08/MSS]` | Hiển thị huy hiệu tái cơ cấu nợ `bond-insolvency-restructuring-badge` khi âm tiền | ✔️ PASS |
| **Facet 3** | `[TC-220.09/MSS]` | Nhãn nút đổi sang `CỨU NGUY TÀI CHÍNH: PHÁT HÀNH...` khi âm tiền | ✔️ PASS |
| **Facet 3** | `[TC-220.10/MSS]` | `InsolvencyBanner` bổ sung hướng dẫn phát hành trái phiếu doanh nghiệp | ✔️ PASS |
| **Facet 4** | `[TC-220.11/MSS]` | `resolveActionableNotification(BOND_NOT_ELIGIBLE)` hiển thị điều kiện 3.000 Tr và 2 BĐS | ✔️ PASS |
| **Facet 4** | `[TC-220.12/MSS]` | `resolveActionableNotification(CANNOT_RECOVER)` gợi ý trái phiếu doanh nghiệp | ✔️ PASS |
| **Facet 4** | `[TC-220.13/MSS]` | `resolveActionableNotification(BOND_COLLATERAL_LOCKED)` cảnh báo tài sản bảo đảm | ✔️ PASS |
| **Facet 5** | `[TC-220.14/MSS]` | Sau khi phát hành trái phiếu, `INTENT_AUTO_SOLVENCY` không thế chấp `collateralCells` | ✔️ PASS |
| **Facet 5** | `[TC-220.15/MSS]` | Off-Turn Hijack Guard: Người chơi ngoài lượt bị từ chối với `NOT_YOUR_TURN` | ✔️ PASS |
| **Facet 5** | `[TC-220.16/MSS]` | Tái cơ cấu nhiều bước: Trái phiếu (+3.000) -> Thế chấp (+2.500) -> FSM sang `PropertyManagement` | ✔️ PASS |

Bảo toàn 100% bộ kiểm thử hồi quy:
- [`tests/contracts/imp212_portfolio_bond_and_trade_clean_affordance.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp212_portfolio_bond_and_trade_clean_affordance.test.ts): **16/16 PASSED** (Bao gồm `TC-212.14` đã được giải quyết triệt để).

---

## 6. ĐỒNG BỘ TÀI LIỆU DỰ ÁN & SỔ CÁI

1. **Bất Biến Miền (Domain Gotchas)**:
   - Đã ghi nhận Gotcha Invariant Pillar I.6: `Corporate Bond Restructuring & Insolvency FSM Solvency Auto-Transition` tại [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md#L38-L45).
2. **Sổ Cái Tiến Độ (Epic Ledger)**:
   - Đã ghi nhận hoàn tất IMP-220 tại [`docs/epics/client_ui/_epic_ledger.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/epics/client_ui/_epic_ledger.md#L808-L828).
3. **Bằng Chứng Lưu Trữ (Evidence Snapshot)**:
   - [`.agents/evidence/imp220_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp220_snapshot.json) (`executed: true`, 0 type errors, 0 UI lint violations).

---

## 7. SỔ NỢ KỸ THUẬT GHI NHẬN (TECH DEBT LEDGER)

| Mã Khoản Nợ | Vị Trí Hiện Hữu | Mô Tả & Bản Chất Kỹ Thuật | Kế Hoạch Xử Lý |
| :--- | :--- | :--- | :--- |
| `DEBT-IMP220-01` | [`src/server/intent_dispatcher.ts#L143,L157`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/intent_dispatcher.ts#L143) | Magic string `'INVALID_PHASE'` tại `INTENT_AUTO_SOLVENCY` (L143) và `INTENT_END_TURN` (L157). Đây là pre-existing code kế thừa từ trước IMP-220 (không phải regression), client notification map đã có entry tương ứng. | Chuẩn hóa đồng loạt sang `ActionRejectReason.INVALID_PHASE` trong đợt refactor toàn bộ dispatcher ở sprint tới. |
