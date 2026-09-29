# [REPORT] IMP-225: Actionable In-Game Feedback & Deep Contextual Messages System

## 1. THÔNG TIN TỔNG QUAN
- **Mã Ticket**: IMP-225 ([UC-IMP225])
- **Tiêu Đề**: Actionable In-Game Feedback & Deep Contextual Messages System (Nâng Cấp Toàn Diện Hệ Thống Phản Hồi Ngữ Cảnh, Chống Silent Intent Rejection, Công Thái Học Di Động & Checklist Trái Phiếu Trực Quan).
- **Phân Hạng**: **Tier 2 (Full Rigor)** — Network Intent Rejection Wire Gate, Universal Toast Guidance, Mobile Touch Micro-Affordance, Bond Eligibility Checklist, Subcomponent Extraction LOC Safety.
- **Trạng Thái**: ✅ **COMPLETE** (HOÀN TẤT 100% QUY TRÌNH 3 TRẠM).
- **Căn Cứ Kế Hoạch & Bằng Chứng**:
  - Kế hoạch phê duyệt v5: [`docs/plans/improvements/IMP-225-actionable-in-game-feedback-and-contextual-messages_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-225-actionable-in-game-feedback-and-contextual-messages_plan.md)
  - Báo cáo thẩm định kế hoạch: [`.agents/audit/PLAN_AUDIT_IMP225.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP225.md)
  - Snapshot bằng chứng vật lý: [`.agents/evidence/imp-225_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp-225_snapshot.json) & [`.agents/evidence/imp225_actionable_feedback_and_messaging_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp225_actionable_feedback_and_messaging_snapshot.json) (`executed: true`, 16/16 contract tests passed).
- **Hội Đồng Độc Lập Trạm 3**:
  - `ui-craft-reviewer`: **APPROVED** (100% nút bấm đạt diện tích chạm di động $\ge 44$px `min-h-[44px]`; checklist phát hành trái phiếu UTF-8 chống tràn layout màn hình hẹp 360px; văn phong phản hồi tự nhiên, 0 vi phạm trên `npm run lint:ui`).
  - `spec-reviewer`: **APPROVED** (100% đối soát tam giác 3 chiều không Scope Drift; 16 atomic tests Detroit Classical chất lượng cao; snapshot bằng chứng khớp tuyệt đối với số liệu đĩa vật lý).
  - `code-reviewer`: **APPROVED** (Vượt qua 6 Slop Red Flags; Zero Dirty Casts — 0 `as any`; Runtime Wire Gate kết nối thông suốt từ server error đến toast UI; ngân sách LOC tuân thủ nghiêm ngặt).
  - `scout` (Trạm 2.5): **PASS 100%** qua 5 nguyên mẫu lỗi phổ quát (Universal Defect Archetypes).

---

## 2. NGUYÊN NHÂN CỐT LÕI & GIẢI PHÁP KIẾN TRÚC

### 2.1. Hiện Trạng Trước Cải Tiến
1. **Khó hiểu khi không thể thế chấp ô đất**: Người chơi tại phòng `VTJ4U5` sở hữu các ô đất đã xây dựng lên Cấp 3 (C3). Luật chơi yêu cầu phải dỡ công trình về Cấp 0 mới được thế chấp quyền sử dụng đất. Nút Thế Chấp bị disabled với nhãn `'Cần Hạ Cấp'`, nhưng trên thiết bị di động không có hover tooltip, không có cảnh báo trực quan dẫn đến người chơi hiểu nhầm là game bị lỗi.
2. **Khó hiểu khi không thể phát hành trái phiếu doanh nghiệp**: Tab phát hành trái phiếu liệt kê 3 gạch đầu dòng tĩnh mà không hiển thị rõ người chơi đang thiếu điều kiện nào (Net Worth $\ge 3.000$, BĐS sạch $\ge 2$ ô, hay đang ngoài lượt mà không trong tình trạng âm vốn cứu nợ).
3. **Thông báo lỗi từ chối intent quá ngắn gọn**: Server trả về `INTENT_REJECTED` chỉ hiện mô tả chung chung (ví dụ: *"Đã có công trình"*), thiếu tiêu đề rõ ràng và thiếu chỉ dẫn hành động khắc phục cụ thể (`actionHint`).
4. **Ô nhiễm thông báo lỗi từ Bot (Bot Error Leak)**: Khi Bot trong phòng vi phạm điều kiện intent, lỗi `INTENT_REJECTED` của Bot bị bắn nhầm thành Toast trên màn hình của người chơi người thật.
5. **Rủi ro vượt ngân sách LOC**: Tệp `property_portfolio_modal.tsx` trước cải tiến đã chạm 472 LOC (sát trần 500 LOC của Tier 2 UI), nguy cơ gãy trần nếu nhồi thêm cảnh báo và affordance mới.

### 2.2. Kiến Trúc Luồng Phản Hồi Ngữ Cảnh Nâng Cấp

```
[Server INTENT_REJECTED / ERROR]
       │
       ▼
[ws_message_handler.ts] ──(C1 Bot Guard)──► Loại bỏ lỗi từ Bot (msg.playerId !== myPlayerId)
       │
       ├──(C2 Throttle 1500ms)────────────► Chặn spam click liên tục (resetWsErrorThrottle cô lập test)
       │
       ▼
[formatServerErrorMessage] ───────────────► Ghép 3 tầng: [Tiêu Đề]: [Mô Tả Chi Tiết] 👉 [Chỉ Dẫn Hành Động]
       │
       ▼
[ServerToast (z-50)] ─────────────────────► Hiển thị thông điệp trực quan đè lên toàn bộ Modal

──────────────────────────────────────────────────────────────────────────────────────────
[PropertyPortfolioModal]
       │
       ├──(Subcomponent Extraction)───────► [PropertyCardActions] (150 LOC) ── giữ Modal còn 395 LOC
       │                                         ├── Nút Thế Chấp (col-span-2, min-h-[44px])
       │                                         ├── Nút Hạ Cấp (col-span-1, min-h-[44px])
       │                                         └── Cảnh báo trực quan: ⚠️ mortgageSubHint
       │
[BondIssuanceTab]
       │
       └──(Checklist 3 Tiêu Chí Trực Quan)─► [✔️/❌ Net Worth ≥ 3.000]
                                             [✔️/❌ BĐS sạch ≥ 2 ô]
                                             [✔️/❌ Trong lượt hoặc Giải cứu nợ (isTurnValid)]
```

---

## 3. CÁC HẠNG MỤC TRIỂN KHAI HOÀN TẤT VẬT LÝ

### 3.1. Nâng Cấp Thông Điệp Phản Hồi 3 Tầng Kèm Action Hint
- Hàm `formatServerErrorMessage` trong [`src/client/ui/actionable_notification.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/actionable_notification.ts) kết hợp đầy đủ:
  - **Tầng 1 (Tiêu đề)**: Đậm tính pháp lý/nghiệp vụ (ví dụ: *Quy Tắc Xây Đều Tay*, *Chưa Đạt Độc Quyền Bộ Màu*, *Bất Động Sản Đang Có Công Trình*).
  - **Tầng 2 (Mô tả)**: Giải thích chi tiết cơ chế vi phạm.
  - **Tầng 3 (Chỉ dẫn hành động `actionHint`)**: Bắt đầu bằng biểu tượng `👉` chỉ dẫn hành động tiếp theo cho người chơi.
  - Định dạng chuẩn: `${match.title}: ${match.description} 👉 ${match.actionHint}`.
  - Hiển thị trực tiếp qua `ServerToast` (`fixed top-18 z-50`), nằm đè lên mọi modal nghiệp vụ, giải quyết triệt để vấn đề bị che khuất của `FloatingNumbersOverlay`.

### 3.2. Chốt Chặn Lỗi Bot (C1 Guard) & Throttle Chống Spam 1500ms (C2)
- Trong [`src/client/network/ws_message_handler.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/ws_message_handler.ts):
  - **C1 Bot Guard**: Kiểm tra chặt chẽ `if (msg.type === 'INTENT_REJECTED' && msg.playerId !== undefined && msg.playerId !== myPlayerId) return;` loại bỏ 100% thông báo lỗi vô can của Bot. Các lỗi hệ thống không có `playerId` (`ROOM_NOT_FOUND`, v.v.) và lỗi của local player vẫn được kích hoạt bình thường.
  - **C2 Throttle Anti-Spam**: Dùng `lastErrorTimeMap = new Map<string, number>()` với ngưỡng `1500ms` dập tắt spam khi người chơi click liên tục vào nút bị vô hiệu hóa.
  - **Test Isolation**: Xuất khẩu hàm `resetWsErrorThrottle()` để các test suite Vitest dọn sạch trạng thái trong `beforeEach`, triệt tiêu flaky test.
  - Bảo toàn 100% thông báo nổi đóng băng giao dịch (`TradeFrozen`, `FREEZE_ACTIVE`, `LIQUIDITY_FROZEN`).

### 3.3. Trích Xuất Subcomponent & Cảnh Báo Trực Quan Nút Thế Chấp / Dỡ Nhà
- Trích xuất component độc lập [`src/client/ui/modals/property_card_actions.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/property_card_actions.tsx) (150 LOC).
- Tái cấu trúc tinh gọn đưa [`src/client/ui/modals/property_portfolio_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/property_portfolio_modal.tsx) từ 472 LOC xuống **395 LOC** (an toàn dưới trần 500 LOC).
- Bổ sung trường `mortgageSubHint` trong [`src/client/ui/modals/portfolio_monopoly_analytics.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/portfolio_monopoly_analytics.ts). Khi ô đất có công trình C1–C3:
  - Nút Thế Chấp đổi nhãn `'Cần Hạ Cấp'` (bảo toàn hợp đồng IMP-208).
  - Hiển thị khối cảnh báo trực quan: `⚠️ Phải hạ cấp hết nhà về Cấp 0 trước khi thế chấp` ngay bên dưới nút bấm.
  - Bảo toàn cấu trúc lưới: Nút Thế Chấp chiếm `col-span-2`, nút Hạ Cấp chiếm `col-span-1` khi `level > 0 && !isMort && onDowngrade`.
  - Toàn bộ nút bấm đạt sàn chạm cảm ứng di động $\ge 44$px (`min-h-[44px]`).

### 3.4. Checklist Phát Hành Trái Phiếu Trực Quan Đồng Bộ
- Trong [`src/client/ui/modals/bond_issuance_tab.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/bond_issuance_tab.tsx):
  - Đồng bộ điều kiện hiệu lực: `isTurnValid = Boolean(isMyTurn || isInInsolvency)`.
  - Thay thế danh sách tĩnh bằng cụm thẻ Checklist 3 tiêu chí thời gian thực:
    1. *Tài sản ròng (Net Worth) ≥ 3.000*: Hiển thị icon `✔️` hoặc `❌`, phân màu trực quan, kèm số dư Net Worth thực tế.
    2. *BĐS sạch chưa thế chấp ≥ 2 ô*: Hiển thị icon `✔️` hoặc `❌`, kèm chỉ số tiến độ `${unmortgagedPropertiesCount} / 2`.
    3. *Trong lượt hoặc giải cứu nợ*: Hiển thị icon `✔️` hoặc `❌`, nhãn `Hợp lệ` hoặc `Ngoài lượt`.
  - Thiết kế CSS thích ứng cao (Responsive Flexbox, `truncate min-w-0`), không gây tràn ngang trên màn hình hẹp di động 360px.

---

## 4. KẾT QUẢ KIỂM THỬ & NGÂN SÁCH ĐĨA CỨNG

### 4.1. Hợp Đồng Kiểm Thử Vitest
- **Tệp kiểm thử**: [`tests/client/actionable_feedback_and_messaging.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/actionable_feedback_and_messaging.test.ts) (299 LOC).
- **16 atomic contract tests** bao quát Ma Trận 5 Mặt (5-Facet Matrix) đạt **16/16 PASS (100%)**:
  * Facet 1: Server Intent Rejection Wire & Format Message (`TC-225.01` đến `TC-225.04`).
  * Facet 2: Chống Ô Nhiễm Lỗi Của Bot & Throttle Anti-Spam (`TC-225.05` đến `TC-225.07`).
  * Facet 3: Gợi Ý Trực Quan Nút Thế Chấp & Dỡ Nhà (`TC-225.08` đến `TC-225.10`).
  * Facet 4: Checklist Điều Kiện Phát Hành Trái Phiếu Đồng Bộ (`TC-225.11` đến `TC-225.13`).
  * Facet 5: Phòng Vệ Ngoại Lệ & Hợp Đồng Giao Diện (`TC-225.14` đến `TC-225.16`).
- **Kiểm thử hồi quy**: **114/114 tests PASS** trên toàn bộ các test suite liên quan:
  * `actionable_feedback_and_messaging.test.ts`: 16/16 PASS.
  * `imp208_comprehensive_button_affordance.test.ts`: 21/21 PASS.
  * `actionable_guidance_system.test.ts`: 41/41 PASS.
  * `imp193_mobile_ergonomics_auction_and_copy_polish.test.ts`: 18/18 PASS.
  * `imp220_insolvency_bond_and_auto_solvency_sync.test.ts`: 18/18 PASS.

### 4.2. Ngân Sách LOC & Chất Lượng Mã Nguồn

| Tệp Vật Lý Trên Đĩa Cứng | Phân Loại Tier | LOC Hiện Tại | Trần Ngân Sách | Trạng Thái |
| :--- | :---: | :---: | :---: | :--- |
| `src/client/network/ws_message_handler.ts` | Tier 1 (Logic) | **189** | <= 400 | ✔️ An toàn |
| `src/client/ui/actionable_notification.ts` | Tier 2 (UI Utility) | **343** | <= 500 | ✔️ An toàn |
| `src/client/ui/modals/portfolio_monopoly_analytics.ts` | Tier 1 (Logic) | **222** | <= 400 | ✔️ An toàn |
| `src/client/ui/modals/property_card_actions.tsx` | Tier 2 (UI View) | **149** | <= 500 | ✔️ An toàn |
| `src/client/ui/modals/property_portfolio_modal.tsx` | Tier 2 (UI View) | **394** | <= 500 | ✔️ An toàn |
| `src/client/ui/modals/bond_issuance_tab.tsx` | Tier 2 (UI View) | **209** | <= 500 | ✔️ An toàn |
| `src/server/network/network_types.ts` | Tier 1 (Server/Logic) | **205** | <= 400 | ✔️ An toàn |
| `tests/client/actionable_feedback_and_messaging.test.ts` | Contract Test | **292** | <= 600 | ✔️ An toàn |

- **Typecheck & Linters**:
  * `npx tsc --noEmit`: **0 lỗi biên dịch**.
  * `npm run lint:ui`: **0 violations** trên 204 tệp client.
  * `npm run lint:slop`: **0 dirty casts** (`as any`) trên 100% tệp thuộc phạm vi IMP-225.

---

## 5. TÀI LIỆU HÓA & TRUY XUẤT MIỀN SSOT
- **Domain SSOT**: Đã ghi nhận Gotcha Invariant 18 (*Actionable Contextual Feedback & Deep Mobile Action Affordance [IMP-225]*) vào [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md).
- **Sổ cái Epic**: Đã cập nhật mục `[IMP-225]` vào [`docs/epics/client_ui/_epic_ledger.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/epics/client_ui/_epic_ledger.md).
- **Snapshot bằng chứng**: Đã lưu tại [`.agents/evidence/imp-225_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp-225_snapshot.json) và [`.agents/evidence/imp225_actionable_feedback_and_messaging_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp225_actionable_feedback_and_messaging_snapshot.json).

---

## 6. PHỤ LỤC: TIẾP THU VÀ ÁP DỤNG ACTIVE REMEDIATION CHO 3 PHẢN BIỆN KỸ THUẬT

Theo nguyên tắc **Active Remediation (Fix Over Talk)** của Điều Lệ Antigravity, toàn bộ 3 điểm phản biện từ người dùng đã được xử lý triệt để ngay trên đĩa vật lý:

### 6.1. [P1] Triệt tiêu Duplication trong `ACTIONABLE_NOTIFICATIONS_MAP` (DRY SSOT)
- **Vấn đề**: `INSUFFICIENT_FUNDS` vs `InsufficientFunds`, `NOT_PURCHASABLE` vs `NotPurchasable`, `FREEZE_ACTIVE` vs `TradeFrozen` có nội dung byte-for-byte trùng lặp gây rủi ro desync khi bảo trì.
- **Khắc phục**: Loại bỏ hoàn toàn khối object lặp lại trong [`src/client/ui/actionable_notification.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/actionable_notification.ts). Chuyển sang alias tham chiếu trực tiếp:
  ```ts
  ACTIONABLE_NOTIFICATIONS_MAP['InsufficientFunds'] = ACTIONABLE_NOTIFICATIONS_MAP['INSUFFICIENT_FUNDS']!;
  ACTIONABLE_NOTIFICATIONS_MAP['NotPurchasable'] = ACTIONABLE_NOTIFICATIONS_MAP['NOT_PURCHASABLE']!;
  ACTIONABLE_NOTIFICATIONS_MAP['TradeFrozen'] = ACTIONABLE_NOTIFICATIONS_MAP['FREEZE_ACTIVE']!;
  ```
- **Kết quả**: Tuân thủ DRY 100%, tinh gọn file từ 360 LOC xuống **343 LOC**.

### 6.2. [P2] Nhãn Nút Thế Chấp Thành 'Đã Thế Chấp' Khi `isMortgaged: true`
- **Vấn đề**: Khi ô đất đã thế chấp, nhãn nút vẫn hiển thị `'Thế Chấp'` ở trạng thái disabled khiến người dùng nhầm lẫn với điều kiện cần hạ cấp nhà.
- **Khắc phục**: Tại [`src/client/ui/modals/portfolio_monopoly_analytics.ts#L164`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/portfolio_monopoly_analytics.ts#L164):
  ```ts
  if (isMortgaged) {
    canMortgage = false;
    mortgageBlockedReason = 'Bất động sản đã được thế chấp';
    mortgageButtonLabel = 'Đã Thế Chấp';
    mortgageSubHint = 'Cần chuộc nợ để khôi phục quyền thế chấp';
  }
  ```
- **Hợp đồng kiểm thử**: Đã bổ sung assertion `expect(state.mortgageButtonLabel).toBe('Đã Thế Chấp')` trong `TC-225.09`.

### 6.3. [P3] Triệt Tiêu Hoàn Toàn `(state as any)` và Bảo Vệ Quy Tắc Zero Dirty Casts
- **Vấn đề**: `(state as any).mortgageSubHint` tồn tại trong test suite; `code-reviewer` đã bỏ sót vi phạm quy tắc Zero Dirty Casts. Đồng thời `ReasonCode` trong `network_types.ts` chưa bao hàm `ActionRejectReason`.
- **Khắc phục**:
  1. Trong [`src/server/network/network_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/network_types.ts), mở rộng `ReasonCode = ... | ActionRejectReason;`.
  2. Trong [`tests/client/actionable_feedback_and_messaging.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/actionable_feedback_and_messaging.test.ts), loại bỏ toàn bộ `as any`, truy cập trực tiếp `state.mortgageSubHint`, thay thế `ActionRejectReason.ROOM_NOT_FOUND` bằng literal chuẩn `'ROOM_NOT_FOUND'`.
- **Kết quả**: 0 dirty cast, static typecheck an toàn tuyệt đối.

