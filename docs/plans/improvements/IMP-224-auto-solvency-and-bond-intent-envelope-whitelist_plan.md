# KẾ HOẠCH TRIỂN KHAI (IMPLEMENTATION PLAN)
## IMP-224: Khắc Phục Lỗi INVALID_INTENT Khi Kích Hoạt Tự Động Cân Đối (Auto-Solvency) & Đồng Bộ Wire Protocol Cho Trái Phiếu Doanh Nghiệp (Phiên Bản Hoàn Thiện v3)

> **Mã định danh**: `IMP-224`  
> **Phân loại**: One-Way Door (Wire Protocol / Network Security Boundary / Server Production Build)  
> **SSOT liên quan**: [`src/server/security/envelope_validator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/security/envelope_validator.ts), [`src/server/intent_dispatcher.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/intent_dispatcher.ts), [`src/domain/bond_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/bond_types.ts)  
> **Ngân sách LOC**: Tier 1 <= 400 LOC (`envelope_validator.ts` hiện tại: 230 LOC, dự kiến thêm ~15 LOC = 245 LOC).  
> **Phản biện kỹ thuật đã xử lý**: P1 (Closed-Loop Parity Test & Allowlist), P2 (Guard INTENT_REPAY_BOND trong InsolvencyPhase), P3 (Chuyển FM-4 sang checklist Station 2.5), P4 (Hành vi cụ thể khi INTENT_ISSUE_BOND không có trancheId).

---

### 1. NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE ANALYSIS)

Dựa trên ảnh chụp màn hình (`media_1790674044005.png`) và Telemetry Log (`media_1790674019769.json`, Tick 576-577, Room `VTCTH9`):
1. **Lớp bảo vệ vòng ngoài `EnvelopeValidator` chưa khai báo Intent**:
   - Khi người chơi bấm nút **"⚡ CÂN ĐỐI TỰ ĐỘNG"**, Client phát gói tin WebSocket:
     ```json
     { "type": "INTENT", "roomCode": "VTCTH9", "playerId": "p1", "intent": { "type": "INTENT_AUTO_SOLVENCY" } }
     ```
   - Tại [`src/server/security/envelope_validator.ts:19-25`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/security/envelope_validator.ts#L19), tập hợp `VALID_INTENTS` chỉ chứa 21 intents đời cũ. Hoàn toàn vắng bóng 3 intent mới:
     * `INTENT_AUTO_SOLVENCY` (từ IMP-210)
     * `INTENT_ISSUE_BOND` (từ IMP-217)
     * `INTENT_REPAY_BOND` (từ IMP-217)
   - Hàm `validateIntentEnvelope` kiểm tra `!VALID_INTENTS.has(it['type'])` trả về `{ success: false, reasonCode: 'INVALID_INTENT' }`.
   - `WssConnectionHandler` chặn đứng gói tin ngay tại cửa vào WebSocket và gửi trả `{ type: 'ERROR', reasonCode: 'INVALID_INTENT' }`, khiến intent **chưa từng được chuyển đến `intent_dispatcher.ts` hay FSM server**.
   - Client nhận mã lỗi và hiển thị banner cảnh báo: *"⚠️ Hướng dẫn trò chơi: Thao tác tạm thời chưa thể thực hiện (INVALID_INTENT)..."*.

---

### 2. KIẾN TRÚC LUỒNG DỮ LIỆU (VISUAL ARCHITECTURE)

```
[Người chơi: Click ⚡ CÂN ĐỐI TỰ ĐỘNG]
                 │
                 ▼
[ModalHost: onAutoSolvency] ──► onIntent({ type: 'INTENT_AUTO_SOLVENCY' })
                 │
                 ▼ (WebSocket JSON message)
{ type: 'INTENT', roomCode, playerId, intent: { type: 'INTENT_AUTO_SOLVENCY' } }
                 │
                 ▼
[WssConnectionHandler: socket.on('message')]
                 │
                 ▼
[EnvelopeValidator: parseAndValidate]
        │
        ├─► checkValidNumbers() ─────────────► ✔️ Hợp lệ (Zero âm, NaN check)
        └─► validateIntentEnvelope()
                 │
                 ├─► it['type'] in VALID_INTENTS?
                 │         │
                 │         ├─► [CŨ]: ❌ THIẾU ──► Trả về { success: false, reasonCode: 'INVALID_INTENT' }
                 │         │                                        │
                 │         │                                        ▼
                 │         │                          Client hiện Banner INVALID_INTENT!
                 │         │
                 │         └─► [MỚI]: ✔️ CÓ ─────► Trả về { success: true, message: ... }
                 │
                 ▼
[IntentGuard: validate] ─────────────────────► ✔️ Hợp lệ (Lượt của p1 trong InsolvencyPhase)
                 │
                 ▼
[WssIntentHandler: executeIntentAction]
                 │
                 ▼
[IntentDispatcher: dispatchPlayerIntent] ────► ✔️ Hợp lệ (Whitelisted cho InsolvencyPhase)
                 │
                 ▼
[afk_recovery: executeInsolvencyAfkRecovery]
        ├─► downgradeUntilSolvent() ─────────► Bán cấp nhà từ cao xuống thấp
        ├─► getSortedUnmortgagedProperties() ─► Thế chấp đất giá rẻ -> đắt (bỏ qua collateral)
        └─► player.balance >= 0 ─────────────► room.phase = PropertyManagement
                 │
                 ▼
[DeltaBroadcaster: broadcastRoomDelta] ──────► Bắn Delta về toàn bộ phòng chơi
                 │
                 ▼
[Client: UI tự động tắt modal Insolvency, số dư >= 0, tiếp tục lượt chơi thành công]
```

---

### 3. MA TRẬN 3 NGUY CƠ THẤT BẠI MÃ NGUỒN (FAILURE MODES ENUMERATION)

| Mã | Failure Mode | Nguyên Nhân Tiềm Ẩn | Biện Pháp Phòng Vệ Trong Code & Test |
| :--- | :--- | :--- | :--- |
| **FM-1** | **Bị chặn tại cổng WebSocket** | `VALID_INTENTS` thiếu `INTENT_AUTO_SOLVENCY`. | Thêm `INTENT_AUTO_SOLVENCY` vào `VALID_INTENTS`. Viết test kiểm thử `EnvelopeValidator` trả về `success: true`. |
| **FM-2** | **Trái phiếu bị chặn dây chuyền** | `INTENT_ISSUE_BOND` và `INTENT_REPAY_BOND` cũng thiếu trong `VALID_INTENTS`. | Thêm cả 2 intent trái phiếu vào `VALID_INTENTS`, đồng bộ trọn vẹn Wire Protocol. |
| **FM-3** | **Tiêm nhiễm Tranche Id độc hại** | `INTENT_ISSUE_BOND` gửi kèm `trancheId` bậy bạ (object, số âm, hoặc string lạ không thuộc `BondTrancheId`). | Dùng `VALID_BOND_TRANCHES = new Set(...)` kiểm chuẩn $O(1)$ không cấp phát heap: Số âm bị `checkValidNumbers` chặn trước với `INVALID_VALUE`, string lạ không thuộc enum bị chặn tại schema với `INVALID_ENVELOPE`. |

*(Lưu ý P3: Vấn đề lệch pha Production Binary `dist/server/index.js` được chuẩn hóa thành bước kiểm tra vật lý bắt buộc tại Trạm 2.5 sau khi chạy `npm run build`, không tính vào ma trận failure modes kỹ thuật).*

---

### 4. CHI TIẾT SỬA ĐỔI MÃ NGUỒN VẬT LÝ (CONCRETE DROP-IN SNIPPETS)

#### Snippet 1: Mở rộng `VALID_INTENTS` và Schema Guard tại `src/server/security/envelope_validator.ts`
Vị trí: [`src/server/security/envelope_validator.ts#L1-L26`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/security/envelope_validator.ts#L1-L26) và [`src/server/security/envelope_validator.ts#L200-L225`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/security/envelope_validator.ts#L200-L225)

```typescript
// Thêm import BondTrancheId
import { BondTrancheId } from '../../domain/bond_types.js';

// Khởi tạo set tĩnh ở cấp module để đạt Zero-Allocation O(1) trên WebSocket hot path (P2)
const VALID_BOND_TRANCHES = new Set<string>(Object.values(BondTrancheId));

// Cập nhật và export VALID_INTENTS (L19-L26) phục vụ 2-Way Parity Test (P1):
export const VALID_INTENTS = new Set([
  ...CELL_INTENTS,
  'INTENT_ROLL', 'INTENT_BUY', 'INTENT_BUY_PROPERTY', 'INTENT_DECLINE', 'INTENT_BID',
  'INTENT_AUCTION_PASS', 'INTENT_UPGRADE_ETC', 'INTENT_TRADE_OFFER', 'INTENT_RESPOND_TRADE_OFFER', 'INTENT_END_TURN',
  'INTENT_INVEST', 'INTENT_SKIP', 'INTENT_BAIL_OUT', 'INTENT_BANKRUPTCY',
  'INTENT_EXECUTE_COMPULSORY_BUYOUT', 'INTENT_DECLINE_COMPULSORY_BUYOUT',
  'INTENT_AUTO_SOLVENCY', 'INTENT_ISSUE_BOND', 'INTENT_REPAY_BOND',
]);

// Trong hàm validateIntentEnvelope (sau dòng 206):
    if (it['type'] === 'INTENT_ISSUE_BOND' && it['trancheId'] !== undefined) {
      if (typeof it['trancheId'] !== 'string' || !VALID_BOND_TRANCHES.has(it['trancheId'])) {
        return { success: false, reasonCode: 'INVALID_ENVELOPE' };
      }
    }
```

---

### 5. MA TRẬN TEST CONTRACTS (STATION 1 QA RED)

Tạo tệp: `tests/contracts/imp224_auto_solvency_wire_envelope.test.ts` (17 atomic tests, Detroit Classical):

- **Facet 1: Auto-Solvency Intent Envelope Validation** (4 tests):
  * `[TC-224.01/MSS][UC-IMP224][Facet-1/AutoSolvencyValid]`: `EnvelopeValidator` chấp thuận gói tin `INTENT_AUTO_SOLVENCY` hợp lệ với `{ success: true }`.
  * `[TC-224.02/MSS][UC-IMP224][Facet-1/AutoSolvencyStructure]`: Message được trích xuất từ `INTENT_AUTO_SOLVENCY` giữ nguyên vẹn `roomCode`, `playerId` và `intent.type`.
  * `[TC-224.03/MSS][UC-IMP224][Facet-1/MissingRoomCodeRejected]`: `INTENT_AUTO_SOLVENCY` thiếu `roomCode` bị từ chối với `INVALID_ENVELOPE`.
  * `[TC-224.04/MSS][UC-IMP224][Facet-1/MissingPlayerIdRejected]`: `INTENT_AUTO_SOLVENCY` thiếu `playerId` bị từ chối với `INVALID_ENVELOPE`.

- **Facet 2: Corporate Bond Wire Protocol Parity** (5 tests):
  * `[TC-224.05/MSS][UC-IMP224][Facet-2/IssueBondNoTranche]`: `EnvelopeValidator` chấp thuận `INTENT_ISSUE_BOND` không kèm `trancheId`; khi dispatch thành công, bond contract kích hoạt hợp lệ (`isActive === true`, `principal > 0`) (P4).
  * `[TC-224.06/MSS][UC-IMP224][Facet-2/IssueBondWithValidTranche]`: `EnvelopeValidator` chấp thuận `INTENT_ISSUE_BOND` với `trancheId: BondTrancheId.ALL_IN`.
  * `[TC-224.07a/MSS][UC-IMP224][Facet-2/IssueBondInvalidStringTranche]`: `INTENT_ISSUE_BOND` với string lạ `'UNKNOWN_TRANCHE'` bị từ chối với `INVALID_ENVELOPE` (P2: Schema mismatch).
  * `[TC-224.07b/MSS][UC-IMP224][Facet-2/IssueBondNegativeNumberTranche]`: `INTENT_ISSUE_BOND` với số âm `-1` bị từ chối với `INVALID_VALUE` (P2: Number sanity guard).
  * `[TC-224.08/MSS][UC-IMP224][Facet-2/RepayBondValid]`: `EnvelopeValidator` chấp thuận `INTENT_REPAY_BOND` hợp lệ.

- **Facet 3: Out-of-Turn & Role Symmetry Defense** (4 tests):
  * `[TC-224.09/MSS][UC-IMP224][Facet-3/IntentGuardCurrentTurn]`: `IntentGuard` cho phép `INTENT_AUTO_SOLVENCY` khi người chơi là current turn trong `InsolvencyPhase`.
  * `[TC-224.10/MSS][UC-IMP224][Facet-3/IntentGuardOutOfTurn]`: `IntentGuard` từ chối `INTENT_AUTO_SOLVENCY` với `OUT_OF_TURN` nếu người chơi không phải current turn.
  * `[TC-224.11a/MSS][UC-IMP224][Facet-3/IntentGuardBankrupt]`: `IntentGuard` từ chối `INTENT_AUTO_SOLVENCY` với `OUT_OF_TURN` nếu người chơi đã phá sản.
  * `[TC-224.11b/MSS][UC-IMP224][Facet-3/RepayBondInsolvencyReject]`: Trong `TurnPhase.InsolvencyPhase`, người chơi gửi `INTENT_REPAY_BOND` bị từ chối với `INVALID_PHASE` (vì đang âm vốn, không thể tất toán nợ) (P2).

- **Facet 4: End-to-End WebSocket Dispatch Integration** (3 tests - Bắt buộc dùng `port: 0` dynamic ephemeral chống đụng độ EADDRINUSE):
  * `[TC-224.12/MSS][UC-IMP224][Facet-4/WssConnectionAutoSolvency]`: Gửi raw JSON `INTENT_AUTO_SOLVENCY` qua WebSocket connection không nhận lại lỗi `INVALID_INTENT`.
  * `[TC-224.13/MSS][UC-IMP224][Facet-4/AutoSolvencyExecutionRecovery]`: Khi người chơi âm tiền trong `InsolvencyPhase`, gửi `INTENT_AUTO_SOLVENCY` kích hoạt thành công hạ cấp và đưa `phase` sang `PropertyManagement`.
  * `[TC-224.14/MSS][UC-IMP224][Facet-4/DeltaBroadcastTriggered]`: Sau khi xử lý `INTENT_AUTO_SOLVENCY`, delta broadcaster gửi cập nhật số dư mới và trạng thái tài sản đến client.

- **Facet 5: Bidirectional Closed-Loop Parity & Regression** (2 tests):
  * `[TC-224.15/MSS][UC-IMP224][Facet-5/PreExistingIntentsIntegrity]`: 21 intents trước đó vẫn được chấp thuận 100% không bị ảnh hưởng.
  * `[TC-224.16/MSS][UC-IMP224][Facet-5/ClosedLoopIntentParity]`: Đối soát 2 chiều chuẩn xác danh sách 24 intents: 100% intent types trong `EXPECTED_24_INTENTS` có mặt trong `VALID_INTENTS`, kích thước `VALID_INTENTS.size === 24`, và 100% intents được hỗ trợ đầy đủ trong `dispatchPlayerIntent` (P1).

---

### 6. QUY TRÌNH THỰC HIỆN 3 TRẠM (AUTONOMOUS 3-STATION PIPELINE)

1. **Trạm 1 (Station 1: RED Contract Test)**:
   - Tạo `tests/contracts/imp224_auto_solvency_wire_envelope.test.ts`.
   - Chạy test để chứng minh RED (`TC-224.01`, `TC-224.05`, `TC-224.08`, `TC-224.16` fail vì thiếu `INTENT_AUTO_SOLVENCY`, `INTENT_ISSUE_BOND`, `INTENT_REPAY_BOND`).
2. **Trạm 2 (Station 2: GREEN Implementation)**:
   - Cập nhật `src/server/security/envelope_validator.ts` theo Snippet 1 (export `VALID_INTENTS`, set `VALID_BOND_TRANCHES`, kẹp guard schema).
   - Chạy lại test suite để chứng minh 17/17 test PASS.
   - Chạy `npm run build` để tái đóng gói `dist/server/index.js`.
3. **Trạm 2.5 (Station 2.5: Sweeping Scout Audit)**:
   - Quét mã nguồn vật lý kiểm tra 5 nhóm lỗi (LOC budget <= 400, zero dirty cast, zero memory leak).
   - Xác minh physical file `dist/server/index.js` có chứa `INTENT_AUTO_SOLVENCY` (P3 checklist).
4. **Trạm 3 (Station 3: Independent Review)**:
   - `spec-reviewer` và `code-reviewer` kiểm tra đối soát trước khi hoàn tất nghiệm thu.
