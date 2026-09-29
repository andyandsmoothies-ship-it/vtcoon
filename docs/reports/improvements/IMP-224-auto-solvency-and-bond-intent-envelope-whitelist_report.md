# BÁO CÁO NGHIỆM THU CẢI TIẾN (IMPROVEMENT ACCEPTANCE REPORT)
## IMP-224: Khắc Phục Lỗi INVALID_INTENT Khi Kích Hoạt Tự Động Cân Đối (Auto-Solvency) & Đồng Bộ Wire Protocol Cho Trái Phiếu Doanh Nghiệp

---

### 1. THÔNG TIN TỔNG QUAN
- **Mã cải tiến**: `IMP-224` (Wire Protocol Security Whitelist Parity)
- **Ngày hoàn thành**: 2026-09-29
- **Loại hình**: Bug Fix / Network Wire Protocol Security Whitelist / Production Build Synchronization
- **Phân loại**: One-Way Door (đã thẩm định qua quy trình 3 trạm và kiểm toán đối kháng `plan-griller`)
- **Trạng thái**: ✅ **HOÀN THÀNH TOÀN DIỆN (18/18 Atomic Tests PASS, 65/65 Full Regression PASS)**

---

### 2. BỐI CẢNH & PHÂN TÍCH FORENSIC SỰ CỐ
- **Hiện tượng người dùng gặp phải**:
  * Khi người chơi thâm hụt số dư ($-8.794$), trò chơi kích hoạt modal **Thanh Lý Cưỡng Chế** (`TurnPhase.InsolvencyPhase`).
  * Người chơi bấm nút **"⚡ CÂN ĐỐI TỰ ĐỘNG (CỨU NGUY NHANH)"** để tự động hạ cấp nhà và thế chấp đất đưa số dư về $\ge 0$.
  * Hệ thống không phản hồi cứu nguy mà xuất hiện banner cảnh báo màu vàng:
    > *"⚠️ Hướng dẫn trò chơi: Thao tác tạm thời chưa thể thực hiện (INVALID_INTENT). Vui lòng kiểm tra lại tình trạng lượt chơi!"*
- **Nguyên nhân gốc rễ (Root Cause)**:
  1. *Lớp bảo vệ vòng ngoài WebSocket*: `EnvelopeValidator` tại `src/server/security/envelope_validator.ts` quản trị tập hợp `VALID_INTENTS`. Tập hợp này chỉ chứa 21 intent đời cũ, hoàn toàn thiếu `INTENT_AUTO_SOLVENCY`, `INTENT_ISSUE_BOND` và `INTENT_REPAY_BOND`.
  2. Gói tin WebSocket `{ type: 'INTENT', intent: { type: 'INTENT_AUTO_SOLVENCY' } }` bị `validateIntentEnvelope` chặn đứng ngay tại cổng mạng vì `!VALID_INTENTS.has(it['type'])`, trả về `{ success: false, reasonCode: 'INVALID_INTENT' }`. Gói tin bị vứt bỏ trước khi đến FSM và logic giải cứu số dư `afk_recovery.ts`.
  3. *Lệch pha Production Bundle*: Tệp nhị phân `dist/server/index.js` (chạy khi gõ `npm start`) được đóng gói trước đó chưa chứa handler cho `INTENT_AUTO_SOLVENCY`.

---

### 3. KIẾN TRÚC & GIẢI PHÁP ĐÃ TRIỂN KHAI

```
[Người chơi: Click ⚡ CÂN ĐỐI TỰ ĐỘNG]
                 │
                 ▼
[ModalHost: onAutoSolvency] ──► Gửi WebSocket INTENT_AUTO_SOLVENCY
                 │
                 ▼
[WssConnectionHandler: socket.on('message')]
                 │
                 ▼
[EnvelopeValidator: parseAndValidate]
        │
        ├─► checkValidNumbers() ─────────────► ✔️ PASS (Zero-Negative Sanity)
        └─► validateIntentEnvelope()
                 │
                 ├─► it['type'] in VALID_INTENTS? ──► ✔️ CÔNG NHẬN HỢP LỆ (Đã bổ sung vào VALID_INTENTS)
                 └─► trancheId Schema Guard ─────────► ✔️ Zero-Alloc Set O(1) kiểm chuẩn
                 │
                 ▼
[IntentGuard: validate] ─────────────────────► ✔️ Cho phép (Lượt của p1 trong InsolvencyPhase)
                 │
                 ▼
[WssIntentHandler: executeIntentAction]
                 │
                 ▼
[IntentDispatcher: dispatchPlayerIntent] ────► ✔️ Điều hướng sang executeInsolvencyAfkRecovery
                 │
                 ▼
[afk_recovery: executeInsolvencyAfkRecovery]
        ├─► downgradeUntilSolvent() ─────────► Bán cấp nhà từ cao xuống thấp
        ├─► getSortedUnmortgagedProperties() ─► Thế chấp BĐS rẻ nhất -> đắt nhất (trừ collateral)
        └─► player.balance >= 0 ─────────────► room.phase = PropertyManagement (CỨU NGUY THÀNH CÔNG)
                 │
                 ▼
[DeltaBroadcaster: broadcastRoomDelta] ──────► Bắn Delta về toàn phòng: số dư mới >= 0, modal đóng!
```

---

### 4. THỐNG KÊ MÃ NGUỒN VẬT LÝ & LOC BUDGET
Lệnh đo lường: `node scripts/check_loc.mjs src/server/security/envelope_validator.ts tests/contracts/imp224_auto_solvency_wire_envelope.test.ts`

| Tệp Vật Lý | Phân Loại Tier | Total Lines (LOC) | Non-Empty SLOC | Ngân Sách Trần | Trạng Thái |
| :--- | :---: | :---: | :---: | :---: | :---: |
| [`src/server/security/envelope_validator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/security/envelope_validator.ts) | Tier 1 (Server Security) | **239** | 228 | <= 400 | ✔️ PASS (An toàn) |
| [`tests/contracts/imp224_auto_solvency_wire_envelope.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp224_auto_solvency_wire_envelope.test.ts) | Contract Test Suite | **428** | 373 | <= 600 | ✔️ PASS (An toàn) |

- **Zero Dirty Casts**: 0 lần `as any`, 0 lần `as unknown as ...` trong code production.
- **Zero Heap Allocation trên Hot Path**: Khởi tạo static `VALID_BOND_TRANCHES = new Set<string>(Object.values(BondTrancheId))` ở cấp module, kiểm tra qua `.has()` $O(1)$.
- **Production Bundle**: Đã chạy `npm run build` tạo lại `dist/server/index.js` (441 kB) và xác thực vật lý chứa cả 3 chuỗi `INTENT_AUTO_SOLVENCY`, `INTENT_ISSUE_BOND`, `INTENT_REPAY_BOND`.

---

### 5. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG (EVIDENCE)

#### A. Contract Tests IMP-224 (18/18 Atomic Tests PASS)
- **Facet 1 (Auto-Solvency Envelope Validation)**:
  * `[TC-224.01/MSS]` EnvelopeValidator chấp thuận gói tin `INTENT_AUTO_SOLVENCY` hợp lệ.
  * `[TC-224.02/MSS]` Cấu trúc envelope bảo toàn `roomCode`, `playerId` và `intent.type`.
  * `[TC-224.03/MSS]` Từ chối khi thiếu `roomCode` với `INVALID_ENVELOPE`.
  * `[TC-224.04/MSS]` Từ chối khi thiếu `playerId` với `INVALID_ENVELOPE`.
- **Facet 2 (Corporate Bond Wire Protocol Parity)**:
  * `[TC-224.05/MSS]` `INTENT_ISSUE_BOND` không kèm `trancheId` được chấp thuận; dispatch tạo bond contract hợp lệ (`isActive: true`, `principal > 0`).
  * `[TC-224.06/MSS]` `INTENT_ISSUE_BOND` với `BondTrancheId.ALL_IN` được chấp thuận.
  * `[TC-224.07a/MSS]` String lạ không thuộc enum bị từ chối với `INVALID_ENVELOPE`.
  * `[TC-224.07b/MSS]` Số âm `-1` bị chặn bởi number sanity guard với `INVALID_VALUE`.
  * `[TC-224.08/MSS]` `INTENT_REPAY_BOND` được chấp thuận.
- **Facet 3 (Out-of-Turn & Role Symmetry Defense)**:
  * `[TC-224.09/MSS]` `IntentGuard` cho phép `INTENT_AUTO_SOLVENCY` khi là current turn trong `InsolvencyPhase`.
  * `[TC-224.10/MSS]` `IntentGuard` từ chối người chơi ngoài lượt với `OUT_OF_TURN`.
  * `[TC-224.11a/MSS]` `IntentGuard` từ chối người chơi phá sản với `OUT_OF_TURN`.
  * `[TC-224.11b/MSS]` Từ chối `INTENT_REPAY_BOND` trong `InsolvencyPhase` với `INVALID_PHASE` (âm vốn không thể tất toán nợ).
- **Facet 4 (End-to-End WebSocket Dispatch Integration - Ephemeral Port 0)**:
  * `[TC-224.12/MSS]` WebSocket thật cổng ephemeral 0 gửi `INTENT_AUTO_SOLVENCY` không bị dội lỗi `INVALID_INTENT`.
  * `[TC-224.13/MSS]` Kích hoạt giải cứu thành công, hạ cấp/thế chấp BĐS đưa số dư $\ge 0$ và chuyển pha sang `PropertyManagement`.
  * `[TC-224.14/MSS]` `DeltaBroadcaster` gửi delta cập nhật số dư mới và trạng thái tài sản đến client.
- **Facet 5 (Bidirectional Closed-Loop Parity & Regression)**:
  * `[TC-224.15/MSS]` Toàn bộ 21 intent cũ được `EnvelopeValidator` chấp thuận 100%.
  * `[TC-224.16/MSS]` Đối soát 2 chiều chuẩn xác 24 intent (`VALID_INTENTS.size === 24` khớp 100% với `INTENT_DISPATCH`).

#### B. Full Regression Suites (65/65 Tests PASS)
```
✓ tests/contracts/imp224_auto_solvency_wire_envelope.test.ts (18 tests) - 18 passed
✓ tests/server/ops03_security.test.ts (13 tests) - 13 passed
✓ tests/contracts/imp210_auto_solvency_intent.test.ts (16 tests) - 16 passed
✓ tests/contracts/imp220_insolvency_bond_and_auto_solvency_sync.test.ts (18 tests) - 18 passed
Total: 65 passed (100% Clean)
```

---

### 6. BẤT BIẾN ĐÃ GHI NHẬN (GOTCHAS REPOSITORY)
Đã ghi nhận vào [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) (Pillar IV: Mạng WebSocket & Đồng Bộ Delta, Gotcha #7):
> **Wire Protocol Envelope Validator Intent Whitelist Parity [IMP-224]**: Bắt buộc đồng bộ 100% danh mục Intent giữa `VALID_INTENTS` trong `EnvelopeValidator` với FSM & `intent_dispatcher.ts` để triệt tiêu lỗi rớt gói `INVALID_INTENT` tại cổng vào WebSocket; áp dụng schema guard $O(1)$ tĩnh không cấp phát heap (`VALID_BOND_TRANCHES = new Set<string>(Object.values(BondTrancheId))`).

---

### 7. BIÊN BẢN PHÊ CHUẨN TRẠM 3
- **Plan Grilling Audit**: `plan-griller` (P1-P5 HARDENED v3 APPROVED)
- **Station 1 (QA RED)**: `qa-tester` (Adversarial Inversion: 11 tests failed initially -> Business RED confirmed)
- **Station 2 (GREEN)**: `implementer` (18/18 tests passed, bundle built & verified)
- **Station 2.5 (Scout Audit)**: `scout` (PASS 100%, 0 defects qua 5 universal defect archetypes, LOC safe)
- **Station 3 (Spec Review)**: `spec-reviewer` (APPROVED, 100% spec reconciliation, 0 scope drift)
