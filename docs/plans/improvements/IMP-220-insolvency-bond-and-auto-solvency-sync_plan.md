# KẾ HOẠCH TRIỂN KHAI IMP-220 (REVISION N+2 - ĐÃ KHẮC PHỤC TRIỆT ĐỂ C1, C2, C3)
## TÁI CƠ CẤU NỢ & ĐỒNG BỘ CỨU NGUY TỰ ĐỘNG

> **Mã lát cắt**: `IMP-220`  
> **Phân loại rủi ro**: Tier 2 (Full Rigor) — Đụng chạm FSM, Server Intent Dispatcher, Network Build, UI Modal Affordance & Error Notifications.  
> **Mục tiêu**:
> 1. Chuẩn hóa mã lý do miền: Thêm `CANNOT_RECOVER` vào `ActionRejectReason` (`action_reasons.ts`), xóa bỏ magic string tại `intent_dispatcher.ts`.
> 2. Cho phép phát hành trái phiếu doanh nghiệp (`INTENT_ISSUE_BOND`) trong giai đoạn nguy cấp (`TurnPhase.InsolvencyPhase`) như một công cụ tái cơ cấu nợ hợp pháp.
> 3. Thiết lập chốt bảo vệ bản quyền lượt (**Off-Turn Hijack Guard**): Chỉ người chơi hiện tại đang âm tiền mới được thực hiện các tác vụ cứu nguy trong `InsolvencyPhase`.
> 4. Tự động chuyển pha FSM từ `InsolvencyPhase` sang `PropertyManagement` khi tiền vay từ trái phiếu giúp số dư `>= 0`.
> 5. Tái đóng gói server bundle (`npm run build`) để `dist/server/index.js` cập nhật đầy đủ `INTENT_AUTO_SOLVENCY` (từ IMP-210) và `INTENT_ISSUE_BOND` trong Insolvency.
> 6. Cập nhật `actionable_notification.ts` với các mã lý do chi tiết (`BOND_NOT_ELIGIBLE`, `CANNOT_RECOVER`, `BOND_COLLATERAL_LOCKED`, `ASSET_LOCKED`).
> 7. Cải thiện công thái học `BondIssuanceTab` và `PropertyPortfolioModal` khi người chơi đang âm tiền (hiển thị thông báo cứu nguy tái cơ cấu nợ).
> 8. Thiết lập bộ kiểm thử hợp đồng 18 ca test Universal 5-Facet Matrix thuần túy runtime behavior, nhập hằng số chuẩn SSOT (`tests/contracts/imp220_insolvency_bond_and_auto_solvency_sync.test.ts`).

---

## 1. SƠ ĐỒ KIẾN TRÚC & DÒNG DỮ LIỆU (VISUAL ARCHITECTURE)

```
[Người chơi âm tiền (TurnPhase.InsolvencyPhase)]
        │
        ├── [Chốt Bảo Vệ Bản Quyền Lượt]: room.players[room.currentPlayerIndex]?.id === playerId?
        │       ├── KHÔNG ──► Từ chối: ActionRejectReason.NOT_YOUR_TURN
        │       └── CÓ ──► Cho phép các Intent cứu nguy:
        │
        ├──► Lựa chọn 1: [⚡ CÂN ĐỐI TỰ ĐỘNG] ──► INTENT_AUTO_SOLVENCY
        │       │                                     │
        │       │ (Hạ cấp & Thế chấp tự động)        ▼
        │       └─────────────────────────────► Server executeInsolvencyAfkRecovery
        │                                             │
        │                                             ├─► Đủ tiền ──► room.phase = PropertyManagement
        │                                             └─► Không đủ ──► BANKRUPT hoặc ActionRejectReason.CANNOT_RECOVER
        │
        └──► Lựa chọn 2: [📜 PHÁT HÀNH TRÁI PHIẾU] ──► INTENT_ISSUE_BOND (TrancheId)
                │                                     │
                │ (Bơm vốn thanh khoản tức thì)       ▼
                └─────────────────────────────► Server intent_dispatcher
                                                      │ (Được phép trong InsolvencyPhase cho currentPlayer)
                                                      ▼
                                                handleIssueBond (bond_manager.ts)
                                                      │
                                                      ├─► Bơm principal vào player.balance
                                                      ├─► Khóa collateralCells
                                                      └─► player.balance >= 0?
                                                              ├── CÓ ──► room.phase = PropertyManagement (Được cứu nguy!)
                                                              └── KHÔNG ──► Giữ InsolvencyPhase (Tiếp tục thế chấp phần còn lại)
```

---

## 2. NGUYÊN NHÂN GỐC RỄ ĐÃ ĐỐI SOÁT VẬT LÝ TRÊN ĐĨA

1. **CANNOT_RECOVER Chưa Khai Báo Trong Domain SSOT (`src/domain/action_reasons.ts`)**:
   - `intent_dispatcher.ts` L150 trả về chuỗi trần `'CANNOT_RECOVER'`. Trong khi đó `ActionRejectReason` chưa có trường này, khiến `actionable_notification.ts` dù có map cũng thiếu sự liên kết chặt chẽ kiểu type-safe của hệ thống.
2. **Stale Server Binary (`dist/server/index.js`)**:
   - Tệp nhị phân server `dist/server/index.js` có mtime là `2026-09-27 10:19:37Z`, trước khi `INTENT_AUTO_SOLVENCY` (IMP-210) được triển khai vào `src/server/intent_dispatcher.ts` (2026-09-28).
   - Khi game chạy bằng `npm start`, server thực thi binary cũ và trả về `INVALID_INTENT`.
3. **Whitelist Intent Thiếu `INTENT_ISSUE_BOND` trong `InsolvencyPhase` (`src/server/intent_dispatcher.ts#L168-L177`)**:
   - Bộ lọc chặn đứng mọi intent ngoại trừ `MORTGAGE`, `DOWNGRADE`, `BANKRUPTCY`, `AUTO_SOLVENCY`. Phát hành trái phiếu bị từ chối với lý do `INVALID_PHASE`.
4. **`handleIssueBond` Thiếu FSM Phase Transition & Role Guard (`src/server/bond_manager.ts#L114-L130`)**:
   - Khi phát hành trái phiếu thành công, hàm cộng `principal` vào `player.balance` nhưng không kiểm tra xem người được cứu có phải người chơi hiện tại hay không và không chuyển `room.phase = TurnPhase.PropertyManagement;`.
5. **Thiếu ánh xạ mã lỗi chi tiết (`src/client/ui/actionable_notification.ts`)**:
   - `BOND_NOT_ELIGIBLE`, `CANNOT_RECOVER`, `BOND_COLLATERAL_LOCKED`, `ASSET_LOCKED` rơi vào fallback toast `Hướng Dẫn Trò Chơi: Thao tác tạm thời chưa thể thực hiện...` gây khó hiểu cho người dùng.
6. **Touch target class tại `BondIssuanceTab`**:
   - Nút gói tranche có `min-h-[96px]` nhưng thiếu chuỗi `min-h-[46px]`, làm trượt kiểm thử hồi quy `TC-212.14`.

---

## 3. TỌA ĐỘ VẬT LÝ VÀ PHƯƠNG ÁN TRIỂN KHAI

### 3.0: Chuẩn hóa `ActionRejectReason.CANNOT_RECOVER` trong Domain
- **Tệp**: `src/domain/action_reasons.ts`
- **Tọa độ dòng**: `40–42`
Thêm `CANNOT_RECOVER: 'CANNOT_RECOVER'` vào `ActionRejectReason`.
Cập nhật `src/server/intent_dispatcher.ts` dòng 150 sử dụng `ActionRejectReason.CANNOT_RECOVER`.

### 3.1: Cho phép `INTENT_ISSUE_BOND` & Off-Turn Guard trong `InsolvencyPhase`
- **Tệp**: `src/server/intent_dispatcher.ts`
- **Hàm bao đóng**: `dispatchPlayerIntent` (dòng 161–180)
Bổ sung `current.id !== playerId` guard trả về `ActionRejectReason.NOT_YOUR_TURN`.
Whitelist thêm `intent.type !== 'INTENT_ISSUE_BOND'`.

### 3.2: Tự động chuyển pha FSM trong `handleIssueBond`
- **Tệp**: `src/server/bond_manager.ts`
- **Hàm bao đóng**: `handleIssueBond` (dòng 102–135)
Khi `room.phase === TurnPhase.InsolvencyPhase`, người được cấp là người chơi hiện tại, và `player.balance >= 0`, chuyển `room.phase = TurnPhase.PropertyManagement`.

### 3.3: Bổ sung Actionable Notifications Map
- **Tệp**: `src/client/ui/actionable_notification.ts`
- **Hàm bao đóng**: `ACTIONABLE_NOTIFICATIONS_MAP`
Thêm `BOND_NOT_ELIGIBLE`, `CANNOT_RECOVER`, `BOND_COLLATERAL_LOCKED`, `ASSET_LOCKED`.

### 3.4: Nâng cấp `BondIssuanceTab`
- **Tệp**: `src/client/ui/modals/bond_issuance_tab.tsx`
Thêm prop `isInInsolvency?: boolean`. Thêm `min-h-[46px]` vào tranche cards. Thêm badge tái cơ cấu nợ và nhãn nút `CỨU NGUY TÀI CHÍNH`.

### 3.5: Truyền cờ `isInInsolvency` từ `PropertyPortfolioModal`
- **Tệp**: `src/client/ui/modals/property_portfolio_modal.tsx` (dòng 106–114)
Truyền `isInInsolvency={isNegative}` trên cùng dòng prop để bảo toàn 471 LOC (0-delta).

### 3.6: Cập nhật văn bản hướng dẫn trong `InsolvencyBanner`
- **Tệp**: `src/client/ui/modals/insolvency_banner.tsx` (dòng 71–73)
Bổ sung "phát hành trái phiếu doanh nghiệp" vào hướng dẫn thoát nợ.

### 3.7: Tái tạo Server Bundle
Chạy `npm run build` để sinh `dist/server/index.js` mới nhất.

---

## 4. MA TRẬN KIỂM THỬ HỢP ĐỒNG (UNIVERSAL 5-FACET MATRIX)

18 test cases `TC-220.01` đến `TC-220.16` trong `tests/contracts/imp220_insolvency_bond_and_auto_solvency_sync.test.ts`:
- Facet 1: Boundary & Range (TC-220.01..TC-220.04c)
- Facet 2: Touch Targets & Accessibility (TC-220.05..TC-220.07)
- Facet 3: Formatting & Badges (TC-220.08..TC-220.10)
- Facet 4: Actionable Notification Mapping (TC-220.11..TC-220.13)
- Facet 5: Invariant & Role Symmetry & State Transitions (TC-220.14..TC-220.16)
Kèm bảo toàn 16/16 tests trong `tests/contracts/imp212_portfolio_bond_and_trade_clean_affordance.test.ts`.
