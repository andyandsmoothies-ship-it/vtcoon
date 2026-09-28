# BÁO CÁO CẢI TIẾN: IMP-217 — CORPORATE BOND TRANCHES, COLLATERAL SELECTION & END-TO-END PIPELINE WIRING

> **Mã Tính Năng**: IMP-217  
> **Thời Gian Hoàn Tất**: 28/09/2026  
> **Trạng Thái**: ✅ HOÀN TẤT & ĐÃ PHÊ DUYỆT (100% 3 Trạm Pipeline Đạt Chuẩn)  
> **Phân Loại Rủi Ro**: Tier 2 (Full Rigor — FSM Domain, Network Intent & UI Responsive Redesign)  
> **Bằng Chứng Bất Biến**: [`.agents/evidence/imp217_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp217_snapshot.json)  

---

## 1. BỐI CẢNH & NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE)

Trước khi thực hiện ticket IMP-217, người chơi sở hữu 11 Bất Động Sản nhưng khi mở tab Trái Phiếu Doanh Nghiệp trong Portfolio Modal lại bị hiện thông báo cảnh báo:
> *"Cần tối thiểu 3.000 Net Worth để phát hành trái phiếu"* và nút bấm bị vô hiệu hóa (`disabled`).

Qua điều tra mã nguồn vật lý, chúng tôi phát hiện 2 điểm nghẽn nghiêm trọng:
1. **Vết Đứt Gãy Kết Nối (Wire Gap)**:
   - `modal_host.tsx` khi render `PropertyPortfolioModal` không hề tính toán hay truyền `playerNetWorth` vào component.
   - Khi prop `playerNetWorth` bị `undefined`, component fallback về `0 < 3.000` $\implies$ luôn khóa nút phát hành dù tài sản thực tế của người chơi lên đến hàng chục nghìn.
   - Các intent `INTENT_ISSUE_BOND` và `INTENT_REPAY_BOND` chưa từng được nối dây từ Client UI xuống WebSocket network.
2. **Cơ Chế Vay Bó Cứng 80% Net Worth (All-or-Nothing)**:
   - Chỉ có duy nhất 1 mức vay duy nhất: vay kịch trần 80% Net Worth, kỳ hạn 3 vòng, lãi suất cứng 20%.
   - Khóa sạch 100% đất sạch làm tài sản bảo đảm, tước đoạt toàn bộ cơ hội xoay sở thế chấp hay giao dịch P2P.
   - Người chơi chỉ cần vốn nhỏ để xây thêm 1-2 nhà nhưng buộc phải đem toàn bộ cơ nghiệp đi cầm cố rủi ro cao.

---

## 2. KIẾN TRÚC & GIẢI PHÁP ĐÃ TRIỂN KHAI (HƯỚNG A: 3 GÓI ĐÒN BẨY ĐỊNH SẴN)

### 2.1. Cấu Hình 3 Gói Phát Hành Trái Phiếu (`BOND_TRANCHES`)

| Gói Tranche | Tên Gọi Thương Mại | Tỷ Lệ Vay (% NW) | Kỳ Hạn | Lãi Suất Trả Kho Bạc | Tỷ Lệ Bảo Đảm BĐS | Thuật Toán Chọn Đất Bảo Đảm |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **Gói 1** | **Tín Dụng Lưu Động** (`WORKING_CAPITAL`) | **20%** | **2 vòng** | **8%** | $\ge 100\%$ | Tự động chọn các ô đất **rẻ nhất trước** (`sort((a,b) => priceA - priceB)`), chỉ khóa đủ số ô tối thiểu $\ge 2$ BĐS. Các ô đắt đỏ được tự do thế chấp/giao dịch. |
| **Gói 2** | **Đầu Tư Tăng Tốc** (`EXPANSION`) | **40%** | **3 vòng** | **15%** | $\ge 120\%$ | Tích lũy các ô đất rẻ nhất cho đến khi đạt $\ge 120\%$ khoản vay và $\ge 2$ BĐS. |
| **Gói 3** | **Thâu Tóm Tất Tay** (`ALL_IN`) | **60%** | **3 vòng** | **20%** | $\ge 50\%$ | **Senior Lien**: Khóa toàn bộ danh mục đất sạch chưa thế chấp. Rủi ro tối đa cho cơ hội lật ngược thế cờ. |
| *Legacy* | *Tương Thích Ngược* (`undefined`) | *80%* | *3 vòng* | *20%* | *$\ge 50\%$* | Khóa toàn bộ đất sạch. Bảo toàn 100% hợp đồng kiểm thử `TC-192C`. |

---

### 2.2. Sơ Đồ Luồng Dữ Liệu Full-Pipeline 5 Trạm (Zero Wire Gap)

```
[Client UI: BondIssuanceTab]
  │  Người chơi chọn 1 trong 3 thẻ Tranches (Mobile 360px: grid-cols-1, Desktop: sm:grid-cols-3)
  │  Bấm nút "PHÁT HÀNH TRÁI PHIẾU: [TÊN GÓI] (+[SỐ TIỀN])"
  ▼
[PropertyPortfolioModal]
  │  onIssueBond(selectedTranche)
  ▼
[ModalHost]
  │  calculatePlayerNetWorth(player, levelMap, mortgagedProperties) -> playerNetWorth thực tế!
  │  dispatchPlayerIntent({ type: 'INTENT_ISSUE_BOND', trancheId: selectedTranche })
  ▼
[Server Intent Dispatcher: src/server/intent_dispatcher.ts]
  │  Bóc tách trancheId; enforce FSM phase check (chặn khi InsolvencyPhase)
  ▼
[Room Manager: src/server/room_manager.ts]
  │  handleIssueBond(roomCode, playerId, trancheId) -> lookup Session an toàn
  ▼
[Bond Manager: src/server/bond_manager.ts]
  │  validateIssueBond():
  │    1. Net worth >= 3.000, unmortgagedProperties >= 2
  │    2. Sort ô đất tăng dần theo giá niêm yết PROPERTY_DEEDS
  │    3. Thuật toán tham lam chọn tối thiểu số ô rẻ nhất
  │  handleIssueBond():
  │    1. player.balance += principal
  │    2. player.bondContract = { trancheId, principal, repayAmount, roundsLeft, collateralCells, isActive: true }
  │  processBondTurnTransition():
  │    - roundsLeft > 1: roundsLeft -= 1
  │    - roundsLeft === 1 && đủ tiền: balance -= repayAmount, Kho Bạc nhận interestPaid = repayAmount - principal
  │    - roundsLeft === 1 && không đủ tiền: VỠ NỢ -> Chỉ phát mãi các ô trong collateralCells!
```

---

## 3. KẾT QUẢ ĐỐI SOÁT & QUY TRÌNH 3 TRẠM (STATION AUDITS)

### 3.1. Station 1: Adversarial RED Contract Tests
- Tệp kiểm thử: [`tests/contracts/imp217_corporate_bond_tranches_and_pipeline.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp217_corporate_bond_tranches_and_pipeline.test.ts)
- Bộ 18 test atomic (1-4 asserts/test, zero loops trong `it()`, phủ 100% 5 Facets):
  - *Facet 1*: Cấu hình 3 gói Tranches ([TC-217.01] - [TC-217.04]).
  - *Facet 2*: Thuật toán chọn tài sản bảo đảm tối ưu ([TC-217.05] - [TC-217.08]).
  - *Facet 3*: Bảo toàn Kho Bạc, vòng đời đếm lùi và xử lý vỡ nợ ([TC-217.09] - [TC-217.11c]).
  - *Facet 4*: Dây nối Pipeline từ Server Intent đến Client UI ([TC-217.12] - [TC-217.14]).
  - *Facet 5*: Công thái học 3 gói Tranches trên Mobile 360px ([TC-217.15] - [TC-217.16]).
- Khảo sát Adversarial Inversion: **16 FAILED | 2 PASSED (Business RED hợp lệ)** trước khi triển khai `src/**`.

### 3.2. Station 2: GREEN Implementation
- Áp dụng tuần tự 6 Snippets drop-in:
  1. [`src/domain/bond_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/bond_types.ts)
  2. [`src/server/bond_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/bond_manager.ts)
  3. [`src/server/intent_dispatcher.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/intent_dispatcher.ts) & [`src/server/room_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts)
  4. [`src/client/ui/modals/modal_host.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/modal_host.tsx)
  5. [`src/client/ui/modals/property_portfolio_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/property_portfolio_modal.tsx)
  6. [`src/client/ui/modals/bond_issuance_tab.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/bond_issuance_tab.tsx)
- Kết quả: **18 / 18 Tests PASS** (100% GREEN).
- Hồi quy an toàn 100%: `TC-192C` (22 tests), `TC-212` (16 tests), `TC-216` (16 tests).

### 3.3. Station 2.5: Sweeping Scout Audit & Active Remediation
- Subagent `scout` quét toàn bộ 8 tệp đối chiếu 5 Universal Defect Archetypes.
- **Phát hiện**: Nhãn nút khi `canIssue` thiếu cụm từ `"TRÁI PHIẾU"`, gây đứt gãy test hồi quy `TC-208.15`, cùng 1 class CSS trùng lặp `min-h-[46px] min-h-[96px]`.
- **Active Remediation (Fix Over Talk)**: Cập nhật ngay lập tức:
  ```tsx
  {canIssue ? `PHÁT HÀNH TRÁI PHIẾU: ${trancheConfig.name.toUpperCase()} (+${formatCurrency(loanPrincipal)})` : 'PHÁT HÀNH TRÁI PHIẾU'}
  ```
  Và loại bỏ `min-h-[46px]` thừa. Cả 2 bài test `TC-208.15` và `TC-217.16` cùng đạt 100% PASS (39/39 tests).

### 3.4. Station 3: Independent Reviews (3 Phán Quyết Phê Duyệt Đồng Thuận)
1. 🎨 **UI Craft Reviewer**: **[APPROVED]**
   - Bố cục 3 gói dạng cột đơn trên mobile 360px (`grid-cols-1 gap-2.5`), mở sang 3 cột trên desktop (`sm:grid-cols-3`).
   - Sàn chạm touch target: Nút phát hành `min-h-[46px]`, thẻ gói `min-h-[96px]`, nút tất toán `min-h-[46px]`.
   - Độ nổi xúc giác tactile shadow: `shadow-[0_4px_0_0_#b45309]` kèm độ lún `active:translate-y-[3px]`.
   - `npm run lint:ui`: **0 violations** trên toàn bộ 198 tệp.
2. 🛡️ **Spec Reviewer**: **[APPROVED]**
   - Đối soát tam giác 3 chiều (Plan Rev 3 $\leftrightarrow$ Evidence Snapshot $\leftrightarrow$ Physical Disk Code & Tests) khớp 100%.
   - Không có Scope Drift. 18 atomic tests có đầy đủ tag `[TC-217.xx/MSS][UC-IMP217]`.
   - Snapshot [`.agents/evidence/imp217_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp217_snapshot.json) có `executed: true`, 0 typecheck errors.
3. 🧹 **Code Reviewer**: **[APPROVED]**
   - 0 Slop Red Flags. Tái sử dụng tối đa domain helpers và enums.
   - **0 Dirty Casts** (`as any`) trong 7 files thuộc phạm vi ticket IMP-217 (10 `as any` được ghi nhận bởi `lint:slop` đều là nợ kỹ thuật cũ tồn tại từ trước lát cắt này).
   - Runtime Wire Gate nối thông 100% từ Client UI qua Intent Dispatcher xuống FSM và Fire Sale Queue.

---

## 4. BẢNG TỔNG HỢP NGÂN SÁCH DÒNG MÃ (PHYSICAL LOC BUDGET)

> *Số liệu đo lường chuẩn xác từ đĩa cứng vật lý qua `scripts/check_loc.mjs`.*

| Tệp Vật Lý | Phân Loại Tier | LOC Trước | LOC Sau Cùng | Trần Ngân Sách | Đánh Giá |
| :--- | :---: | :---: | :---: | :---: | :--- |
| [`src/domain/bond_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/bond_types.ts) | Tier 1 (Domain/Logic) | 15 | **57** | <= 400 | ✔️ An toàn (+343 dòng dư) |
| [`src/server/bond_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/bond_manager.ts) | Tier 1 (Domain/Logic) | 171 | **223** | <= 400 | ✔️ An toàn (+177 dòng dư) |
| [`src/server/intent_dispatcher.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/intent_dispatcher.ts) | Tier 1 (Domain/Logic) | 180 | **180** | <= 400 | ✔️ An toàn (+220 dòng dư) |
| [`src/server/room_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts) | Tier 1 (Domain/Logic) | 379 | **379** | <= 400 | ✔️ An toàn (+21 dòng dư) |
| [`src/client/ui/modals/bond_issuance_tab.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/bond_issuance_tab.tsx) | Tier 2 (UI/Views) | 104 | **159** | <= 500 | ✔️ An toàn (+341 dòng dư) |
| [`src/client/ui/modals/property_portfolio_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/property_portfolio_modal.tsx) | Tier 2 (UI/Views) | 467 | **471** | <= 500 | ✔️ An toàn (+29 dòng dư) |
| [`src/client/ui/modals/modal_host.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/modal_host.tsx) | Tier 2 (UI/Views) | 455 | **473** | <= 500 | ✔️ An toàn (+27 dòng dư) |

---

## 5. BẤT BIẾN ĐÃ NẠP VÀO HỆ THỐNG TRI THỨC MIỀN (`docs/domain/gotchas.md`)

1. **Pillar II - Bất biến #9: `Corporate Bond Tranches, Collateral Selection & Interest Payoff SSOT [IMP-217]`**:
   - *Lựa chọn tài sản tối ưu*: Thuật toán sắp xếp tăng dần theo giá đất niêm yết, chỉ khóa tối thiểu các ô đất rẻ nhất đủ tỷ lệ bảo đảm và $\ge 2$ BĐS (ngoại trừ Gói `ALL_IN` khóa toàn bộ đất sạch). Các ô đất dôi dư ngoài danh mục bảo toàn 100% quyền tự do thế chấp, giải chấp và giao dịch P2P.
   - *Bảo toàn Kho Bạc (Treasury Conservation)*: Cả khi tất toán trước hạn lẫn đáo hạn ở vòng cuối, Kho Bạc CHỈ NHẬN ĐÚNG phần tiền lãi thực tế chênh lệch (`interestPaid = Math.max(0, repayAmount - principal)`), triệt tiêu hoàn toàn lỗi lạm phát tiền ảo vào Kho Bạc khi chọn gói lãi suất thấp (8%, 15%).
   - *Backward Compatibility Fallback*: Khi `trancheId === undefined`, hệ thống tự động fallback về gói mặc định 80% NW, 3 vòng, lãi 20%, bảo toàn 100% hợp đồng kiểm thử `TC-192C`.
2. **Pillar V - Bất biến #12: `ModalHost Stateless Modals & Empty Payload Rendering Invariant [IMP-217]`**:
   - *Tách biệt Payload vs Store Selector*: Các modal quản lý tài sản độc lập (`PropertyPortfolioModal`) lấy trực tiếp dữ liệu từ Zustand store hoặc các selector dẫn xuất (`calculatePlayerNetWorth`, `levelMap`, `mortgagedProperties`), không bắt buộc nhận payload ngoại sinh. Bộ định tuyến `ModalHost` tuyệt đối không chặn render bằng `if (!modalPayload) return null;` khi `activeModal === 'portfolio'`.

---

## 6. SỔ CÁI NỢ KỸ THUẬT (TECH DEBT LEDGER)

| Mã Nợ Kỹ Thuật | Phân Loại & Tệp Nguồn | Hiện Trạng & Tác Động | Biện Pháp Khắc Phục Đề Xuất (Target Slice) |
| :---: | :--- | :--- | :--- |
| **`DEBT-IMP217-01`** | **Function LOC Budget Warning**<br>[`src/server/bond_manager.ts:26`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/bond_manager.ts#L26) | Hàm `validateIssueBond` có **74 SLOC** (> ngưỡng cảnh báo 50 SLOC của `lint:slop`) do tích hợp đồng thời nhánh kiểm định 3 gói Tranches và thuật toán tham lam gom tài sản bảo đảm rẻ nhất. Dù file tổng thể vẫn an toàn (223/400 LOC), hàm cần được chia tách để bảo toàn tính vi mô. | **Refactoring Slice Tiếp Theo**:<br>Trích xuất 2 hàm con nội bộ độc lập:<br>1. `_resolveCollateral(unmortgagedCells, principal, tranche)`: Tách riêng logic sắp xếp tăng dần và gom ô đất bảo đảm.<br>2. `_validateTrancheEligibility(player, netWorth, tranche)`: Tách kiểm tra điều kiện tiên quyết. |
