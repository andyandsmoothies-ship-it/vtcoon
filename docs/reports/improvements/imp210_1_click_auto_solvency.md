# BÁO CÁO CẢI TIẾN: IMP-210 — 1-CLICK SMART AUTO-SOLVENCY (CÂN ĐỐI TỰ ĐỘNG / CỨU NGUY NHANH 1-CHẠM)

> **Mã Tính Năng**: IMP-210  
> **Thời Gian Triển Khai**: 28/09/2026  
> **Trạng Thái**: ✅ HOÀN TẤT & ĐƯỢC PHÊ DUYỆT (100% 3 Trạm Pipeline Đạt Chuẩn)  
> **Môi Trường**: Antigravity 2.0 Physical Worktree

---

## 1. BỐI CẢNH & ĐỘNG LỰC CẢI TIẾN
Trong các ván đấu thực tế, khi người chơi rơi vào trạng thái thâm hụt số dư tài chính (`balance < 0` do trả tiền thuê cao hoặc các biến cố thị trường), hệ thống chuyển sang pha `InsolvencyPhase` với đồng hồ đếm ngược 45s để thanh lý tài sản.
- **Trở ngại trước đây**: Người chơi phải tự lướt qua danh mục nhiều bất động sản, tự tính toán nhẩm số tiền hạ cấp công trình hoặc thế chấp đất, đồng thời dễ gặp bối rối với các quy tắc hạ cấp đồng đều (Even-Downgrading) hoặc các ô đất đang bị phong tỏa thanh khoản do chu kỳ vĩ mô (`MACRO_LIQUIDITY_FREEZE`).
- **Nhu cầu**: Người chơi mong muốn có một nút bấm tiện lợi duy nhất để hệ thống tự động tính toán phương án thanh lý tối ưu nhất đưa số dư về mức an toàn ($\ge 0$) ngay lập tức mà không cần phải chờ hết 45s đếm ngược.

---

## 2. KIẾN TRÚC & GIẢI PHÁP ĐÃ THỰC HIỆN

```
[Người Chơi: Bấm "⚡ CÂN ĐỐI TỰ ĐỘNG (CỨU NGUY 1-CHẠM)"]
                         │
                         ▼
      [InsolvencyBanner / PortfolioDeficitBanner]
                         │ onAutoSolvency()
                         ▼
        [ModalHost -> use_app_session.ts]
                         │ INTENT_AUTO_SOLVENCY
                         ▼
            [Server: src/server/intent_dispatcher.ts]
     ├── FSM Guard: room.phase === InsolvencyPhase (chống gọi ngoài pha)
     ├── Off-Turn Guard: p === currentTurnPlayer && balance < 0 (chống hijack)
     └── executeInsolvencyAfkRecovery()
                         ▼
            [Server: src/server/network/afk_recovery.ts]
     ├── 1. downgradeUntilSolvent() (Hạ cấp công trình đồng đều từ thấp lên cao)
     ├── 2. handleMortgage() (Thế chấp ô rẻ nhất; bỏ qua ô đóng băng thanh khoản via mortgage_manager.ts:L129)
     └── 3. balance >= 0: room.phase = PropertyManagement -> Rescued!
                         │
                         ▼
          [broadcastRoomDelta -> Client apply_delta.ts]
     ├── Đồng bộ balance >= 0, cập nhật cấp công trình & trạng thái thế chấp
     └── use_app_session.ts tự động đóng InsolvencyBanner!
```

---

## 3. CÁC ĐIỂM SÁNG KỸ THUẬT & TÁI CẤU TRÚC

1. **Subtractive Refactoring & Tách Submodule Chuẩn Hiến Pháp**:
   - `src/client/ui/modals/property_portfolio_modal.tsx` ban đầu có **483 LOC** (vượt ngưỡng cảnh báo 400 và trần cứng 480).
   - Đã trích xuất khối cảnh báo thâm hụt thành component mới: `src/client/ui/modals/portfolio_deficit_banner.tsx` (58 LOC).
   - `property_portfolio_modal.tsx` giảm xuống còn **466 LOC** (giảm 17 dòng, an toàn tuyệt đối $< 470$ LOC).
2. **Bảo Vệ FSM & Chống Off-Turn Hijack (Single SSOT Guard)**:
   - Chặn đứng lỗ hổng người chơi khác bấm intent tự động giải cứu khi đối thủ đang kẹt nợ.
   - Assert chặt chẽ ngay tại handler `INTENT_AUTO_SOLVENCY`: `room.phase === TurnPhase.InsolvencyPhase` và `current.id === p && current.balance < 0`.
   - Triệt tiêu Double Guard dư thừa ở lớp ngoài `dispatchPlayerIntent`, tuân thủ chuẩn "Trust Framework Guards".
3. **Cơ Chế Bảo Vệ Đóng Băng Thanh Khoản (Deep Module Guard)**:
   - Kiểm tra `MACRO_LIQUIDITY_FREEZE` được thực thi sâu bên trong `src/server/mortgage_manager.ts#L129-L134`.
   - Khi `executeInsolvencyAfkRecovery` gọi `rooms.handleMortgage(roomCode, playerId, cellIndex)`, ô đất bị đóng băng sẽ bị từ chối an toàn và vòng lặp tự động chuyển sang ô kế tiếp.
4. **Bảo Tồn 100% Contract Test Cũ**:
   - Trong `InsolvencyBanner`, bảo toàn nguyên vẹn 100% markup, class và text của 2 nút cũ (`Quản Lý BĐS / Thế Chấp` và `Tuyên Bố Phá Sản (Rời Bàn)`), chèn nút 1-chạm lên trên đầu.
   - Không gây bất kỳ xung đột hồi quy nào với các suite test UI cũ.
5. **Công Thái Học & Chuẩn Xúc Giác Retropoly 2.0 (Phân Biệt 2 Banner)**:
   - Sàn diện tích chạm: Toàn bộ nút đạt `min-h-[44px]` trên cả 2 banner.
   - Nút trong `InsolvencyBanner`: Áp dụng độ nổi cao `shadow-[0_4px_0_0_#b45309]` và độ lún cơ học `active:translate-y-[3px]` phù hợp modal cảnh báo khẩn cấp toàn màn hình.
   - Nút trong `PortfolioDeficitBanner`: Áp dụng độ nổi nén `shadow-[0_3px_0_0_#b45309]` và độ lún cơ học `active:translate-y-[2px]` phù hợp strip cảnh báo nội bộ danh mục.
   - Vành sáng trợ năng: `focus-visible:ring-2 focus-visible:ring-amber-400`.
   - Bố cục cột dọc `w-full flex flex-col` chống tràn ngang hoàn toàn trên thiết bị màn hình hẹp 360px.

---

## 4. MA TRẬN KIỂM THỬ HỢP ĐỒNG (16/16 ATOMIC TESTS PASS)
Tệp kiểm thử: `tests/contracts/imp210_auto_solvency_intent.test.ts`
- **Facet 1 (Boundary & Range)**:
  * TC-210.01: Chặn `INTENT_AUTO_SOLVENCY` ngoài `InsolvencyPhase` (trả về `INVALID_PHASE`).
  * TC-210.02: Cứu nguy thành công người chơi âm tiền bằng hạ cấp công trình đồng đều.
  * TC-210.03: Cứu nguy thành công người chơi âm tiền bằng thế chấp lô đất rẻ nhất chưa thế chấp.
- **Facet 2 (Touch Targets & A11y)**:
  * TC-210.04: Nút Cân Đối Tự Động trong `PortfolioDeficitBanner` đạt sàn `min-h-[44px]`, `focus-visible:ring-2`.
  * TC-210.05: Nút Cứu Nguy Nhanh trong `InsolvencyBanner` đạt sàn `min-h-[44px]`, `focus-visible:ring-2`.
  * TC-210.06: Toàn bộ nút hành động duy trì `min-h-[44px]` và cỡ chữ $\ge 12$px.
- **Facet 3 (Formatting & Layout)**:
  * TC-210.07: Định dạng số tiền âm qua `formatCurrency` và số thiếu hụt phân tách hàng nghìn `vi-VN`.
  * TC-210.08: Không render banner khi `isNegative = false` hoặc `deficitAmount <= 0`.
  * TC-210.09: Hiển thị đúng `playerName` (hoặc fallback 'Bạn') và tiền thâm hụt nổi bật.
- **Facet 4 (Tactile Depth & Callbacks)**:
  * TC-210.10: Hiệu ứng bóng 3D 3px trong `PortfolioDeficitBanner` (`shadow-[0_3px_0_0_#b45309]`) và độ lún `active:translate-y-[2px]`.
  * TC-210.11: Nhấp nút trong `PortfolioDeficitBanner` kích hoạt `onAutoSolvency` 1 lần.
  * TC-210.12: Nhấp nút trong `InsolvencyBanner` kích hoạt `onAutoSolvency` 1 lần.
- **Facet 5 (Invariants & Edge Cases)**:
  * TC-210.13: Tuyên bố phá sản (`BANKRUPT`) nếu tổng giá trị thanh lý toàn bộ tài sản không đủ bù thâm hụt.
  * TC-210.14: Bỏ qua ô đất bị phong tỏa thanh khoản (`MACRO_LIQUIDITY_FREEZE`).
  * TC-210.15: Off-Turn Hijack Guard chặn người gửi ngoài lượt hoặc người có tiền dương.
  * TC-210.16: Tự động đóng `InsolvencyBanner` khi client nhận delta đưa số dư $\ge 0$.

---

## 5. BẰNG CHỨNG XÁC MINH VẬT LÝ TRÊN ĐĨA
- **Snapshot Evidence**: `.agents/evidence/imp210_snapshot.json` (executed: true, 16/16 pass, 0 errors).
- **TypeScript**: `npx tsc --noEmit` $\rightarrow$ 0 errors.
- **UI Linter**: `npm run lint:ui` $\rightarrow$ 0 violations across 197 files.
- **Ngân sách LOC & Tọa độ File thực tế**:
  * `src/server/intent_dispatcher.ts`: 179 LOC ($\le 400$)
  * `src/client/ui/modals/property_portfolio_modal.tsx`: 466 LOC ($\le 500$, giảm 17 dòng so với ban đầu)
  * `src/client/ui/modals/portfolio_deficit_banner.tsx`: 58 LOC ($\le 500$)
  * `src/client/ui/modals/insolvency_banner.tsx`: 108 LOC ($\le 500$)
  * `src/client/ui/modals/modal_host.tsx`: 454 LOC ($\le 500$)
  * `src/client/network/use_app_session.ts`: 272 LOC ($\le 400$)
- **Thẩm định độc lập**:
  * `spec-reviewer`: **APPROVE** (100% khớp Kế hoạch & SSOT, không có spec drift).
  * `ui-craft-reviewer`: **APPROVE** (Đạt chuẩn 100% công thái học Mobile 360px và xúc giác 3D).
