# GAME-S05: Nghiệp Vụ Tài Chính, Thế Chấp, Thanh Lý Cưỡng Chế & Phá Sản

> **Trạng thái:** Done (Completed & Verified 100% · Both Gates Approved)
> **Epic:** Gameplay Core · **Slice:** 05
> **SSOT Tham Chiếu:** `docs/requirements.md` §I (P2P), §IV (Tín Dụng & Đòn Bẩy), §V.1.5–6 (Thẻ Thị Trường)
> **Kế thừa:** `docs/epics/gameplay/_epic_ledger.md` — DEBT-01..07 (TC-05.1..TC-05.10)
> **Precondition:** Slice 04 ĐÃ DONE · 198/198 PASS · E2E Golden Flow S00→S04 PASS

---

## Phạm vi Slice 05 (Scope)

Slice 05 hoàn thiện **đòn bẩy tín dụng** và **kịch bản thanh lý/phá sản**, đồng thời trả nợ kỹ thuật từ Slice 00–04. Hai luồng chính:

```
[Người chơi thiếu tiền]
        │
        ├─► INTENT_MORTGAGE ──► Nhận 50% giá đất ──► Lãi 5%/GO
        │       └─── INTENT_REDEEM ──► Trả nợ + 10% phí hành chính
        │
        └─► Âm tiền không trả được ──► InsolvencyPhase
                │
                ├─► Bán/thế chấp tài sản còn lại
                │        └─── Đủ trả nợ ──► Tiếp tục ván
                │
                └─► Vẫn âm ──► BankruptcyCheck
                        └─── Tuyên bố phá sản ──► Loại người chơi
                                 └─── Chỉ còn 1 người ──► Kết thúc ván
```

---

## UC-GAME-051: Cầm Cố / Thế Chấp BĐS (Mortgage)

- **Use Case Ref:** UC-GAME-051
- **Traceability Chain:** FR-FINANCE-01 → UC-GAME-051 → Basic Flow → §IV.2
- **Flow Paths:** Basic Flow (Cầm cố đất trống Cấp 0)
- **Value Delivered:** Người chơi nhận 50% tiền mặt bằng cách cầm cố BĐS; ô đất bị úp và tạm dừng thu phí.
- **Lifecycle Status:** Prepared (Approved for Implementation)
- **Preconditions Required:**
  - `currentPlayer.id === property.ownerId`
  - `property.level === 0` (chưa xây công trình)
  - `property.mortgaged === false`
  - Không có thẻ `MC_FREEZE_TRADE` đang active
- **Exit Guarantees:**
  - **Success:** `player.balance += floor(property.price * 0.5)` · `property.mortgaged = true` · phí thuê ô đó = 0
  - **Failure:** Giao dịch hủy; `reason: ALREADY_MORTGAGED | HAS_BUILDING | FREEZE_ACTIVE`
- **Architectural Scope:**
  - `src/domain/room.ts` — Thêm `mortgagedProperties: number[]` vào `Player`; thêm `InsolvencyPhase` vào `TurnPhase`
  - `src/server/mortgage_manager.ts` **[NEW]** — `mortgageProperty()`, `redeemProperty()`, `collectMortgageInterest()`
  - `src/server/room_manager.ts` — Đăng ký `INTENT_MORTGAGE` và `INTENT_REDEEM`
  - `src/domain/property_manager.ts` — Guard kiểm tra `mortgaged` trước khi tính phí thuê
- **LOC Budget:** `mortgage_manager.ts` max 200 LOC; `property_manager.ts` <= 400 LOC sau chỉnh sửa
- **Test Contracts:**
  - `TC-05.1a`: [Gửi `INTENT_MORTGAGE` BĐS Cấp 0 hợp lệ] → [balance += 50% giá đất; `mortgaged=true`; phí thuê = 0 khi đối thủ dẫm vào]
  - `TC-05.1b` (Adversarial): [Gửi `INTENT_MORTGAGE` BĐS đã xây C1] → [`success=false`; `reason=HAS_BUILDING`; balance không đổi]

---

## UC-GAME-052: Trả Lãi Vay & Chuộc Đất (Redeem)

- **Use Case Ref:** UC-GAME-052
- **Traceability Chain:** FR-FINANCE-02 → UC-GAME-052 → §IV.2
- **Flow Paths:**
  - Basic Flow: Qua ô GO khi đang có thế chấp → tự động trừ lãi 5% tổng dư nợ
  - Alt A1: Gửi `INTENT_REDEEM` → trả gốc + 10% phí hành chính → ô đất kích hoạt lại
- **Value Delivered:** Cơ chế tín dụng hoàn chỉnh — lãi suất tự động và quyền chuộc tài sản.
- **Lifecycle Status:** Prepared (Approved for Implementation)
- **Preconditions Required:**
  - `property.mortgaged === true`
  - `currentPlayer.id === property.ownerId`
  - `player.balance >= loanAmount * 1.1` (để chuộc)
- **Exit Guarantees:**
  - **Success (Lãi):** `player.balance -= floor(totalMortgageDebt * 0.05)` tại mỗi lần vượt GO
  - **Success (Chuộc):** `player.balance -= loanAmount * 1.1`; `mortgaged = false`; phí thuê khôi phục
  - **Failure:** `reason: INSUFFICIENT_FUNDS`; state không đổi
- **Architectural Scope:**
  - `src/server/mortgage_manager.ts` — `collectMortgageInterest(room, playerId)` gọi từ pipeline GO
  - `src/server/room_manager.ts` — Hook vào pipeline vượt GO
- **LOC Budget:** Tích hợp vào `mortgage_manager.ts` (đã tính ở UC-051)
- **Test Contracts:**
  - `TC-05.2a`: [Người chơi có 2.000 dư nợ vượt GO] → [`balance -= 100` (5% × 2.000); tiền thưởng GO +2.000 cộng trước]
  - `TC-05.2b`: [Gửi `INTENT_REDEEM` đủ tiền] → [`mortgaged=false`; phí thuê khôi phục đúng C0]
  - `TC-05.2c` (Adversarial): [Gửi `INTENT_REDEEM` không đủ tiền] → [`success=false`; `reason=INSUFFICIENT_FUNDS`]

---

## UC-GAME-053: Cưỡng Chế Thanh Lý Khi Âm Tiền (Insolvency)

- **Use Case Ref:** UC-GAME-053
- **Traceability Chain:** FR-FINANCE-03 → UC-GAME-053 → §I (Thanh khoản)
- **Flow Paths:** Basic Flow: Tiền mặt âm sau khi trả phí → FSM → `InsolvencyPhase`
- **Value Delivered:** Phát hiện và xử lý mất khả năng thanh toán — buộc người chơi bán/thế chấp trước khi phá sản.
- **Lifecycle Status:** Prepared (Approved for Implementation)
- **Preconditions Required:** `player.balance < 0` sau bất kỳ giao dịch nào
- **Exit Guarantees:**
  - **Success (Thoát âm):** FSM về `PropertyManagement`; tiếp tục ván
  - **Failure (Vẫn âm):** FSM → `BankruptcyCheck`
- **Architectural Scope:**
  - `src/server/insolvency_manager.ts` **[NEW]** — `checkInsolvency()`, `liquidateAssets()`, `declareBankruptcy()`
  - `src/domain/room.ts` — Thêm `InsolvencyPhase` vào `TurnPhase`
  - `src/server/room_manager.ts` — Gọi `checkInsolvency()` sau mỗi giao dịch có thể sinh âm
- **LOC Budget:** `insolvency_manager.ts` max 150 LOC
- **Test Contracts:**
  - `TC-05.3a`: [Balance âm sau trả phí] → [FSM → `InsolvencyPhase`; `INTENT_MORTGAGE/DOWNGRADE` được chấp nhận để bù]
  - `TC-05.3b` (Adversarial): [Không gửi intent thoát Insolvency trong 60s] → [Tự động thanh lý tài sản cưỡng chế theo giá trị giảm dần]

---

## UC-GAME-054: Tuyên Bố Phá Sản & Loại Người Chơi (Bankruptcy)

- **Use Case Ref:** UC-GAME-054
- **Traceability Chain:** FR-FINANCE-04 → UC-GAME-054 → §I (Điều kiện kết thúc)
- **Flow Paths:** Basic Flow: Bán sạch tài sản vẫn âm → Phá sản → Loại người chơi
- **Value Delivered:** Xử lý phá sản sạch — người chơi bị loại, tất cả ô sở hữu reset về trạng thái trống.
- **Lifecycle Status:** Prepared (Approved for Implementation)
- **Preconditions Required:** `player.balance < 0` VÀ `player.ownedProperties.length === 0`
- **Exit Guarantees:**
  - **Success:** `player.bankrupt = true`; mọi ô reset `owner = undefined`; FSM chuyển lượt
  - **Success (Kết thúc):** Nếu còn 1 người → xếp hạng và kết thúc game ngay
  - **Failure Postconditions:** Không có tài sản mồ côi (mọi ô phải `owner=string | undefined`)
- **Architectural Scope:**
  - `src/server/insolvency_manager.ts` — `declareBankruptcy(room, playerId)`
  - `src/server/room_manager.ts` — Điều kiện dừng game khi còn 1 người
- **LOC Budget:** Tích hợp vào `insolvency_manager.ts`
- **Test Contracts:**
  - `TC-05.4a`: [Bán hết tài sản vẫn âm] → [`bankrupt=true`; tất cả ô → `owner=undefined`; FSM chuyển đúng]
  - `TC-05.4b`: [Còn 1 người chơi sống sót] → [Kết thúc ván; xếp hạng theo Net Worth]

---

## UC-GAME-055: Quyết Toán Tổng Tài Sản Ròng (End-Game Settlement)

- **Use Case Ref:** UC-GAME-055
- **Traceability Chain:** FR-FINANCE-05 → UC-GAME-055 → §I (Điều kiện kết thúc)
- **Flow Paths:** Basic Flow: Hết 15 vòng hoặc 60 phút → Quyết toán Net Worth
- **Value Delivered:** Phân định thắng thua — Net Worth = Tiền mặt + Giá trị BĐS × hệ số cấp − Dư nợ thế chấp.
- **Lifecycle Status:** Prepared (Approved for Implementation)
- **Preconditions Required:** `round >= 15` HOẶC `elapsedTime >= 3600s`
- **Exit Guarantees:** Danh sách xếp hạng emit đến tất cả client theo Net Worth giảm dần
- **Architectural Scope:** `src/server/room_manager.ts` — `calculateNetWorth(room, playerId)`; điều kiện kết thúc game
- **LOC Budget:** max +40 LOC trong `room_manager.ts` (phải <= 400 LOC tổng sau thêm)
- **Test Contracts:**
  - `TC-05.5a`: [Hết vòng 15] → [Net Worth = Tiền mặt + Σ(giá đất × hệ số cấp) − Σ(dư nợ thế chấp); người cao nhất xếp #1]

---

## Khoản Nợ Kỹ Thuật Kế Thừa (Inherited Tech Debt — DEBT-01..07)

### DEBT-01 (TC-05.5): Khôi Phục P2P Trading — UC-GAME-056

- **Traceability Chain:** FR-P2P-01 → UC-GAME-056 → §I P2P Trading Rule → TC-02.3
- **Preconditions:** `property.level === 0`; cả hai bên xác nhận; `buyer.balance >= price * 1.05`; không có `MC_FREEZE_TRADE`
- **Exit Guarantees:** `property.ownerId = buyer.id`; `buyer.balance -= price * 1.05`; Kho bạc `+= price * 0.05`; `MC_ANTI_SPECULATE` active → thuế tăng lên 20%
- **Architectural Scope:** `src/server/property_actions.ts` — `executeP2PTrade()`; INTENT_TRADE_OFFER / INTENT_TRADE_ACCEPT
- **LOC Budget:** max +50 LOC trong `property_actions.ts` (phải <= 105 LOC tổng)
- **Test Contracts:**
  - `TC-05.5`: [Giao dịch P2P đất Cấp 0] → [Chuyển nhượng OK; 5% thuế vào Kho bạc — Khôi phục TC-02.3]
  - `TC-05.5-inv` (Adversarial): [Giao dịch BĐS có C1] → [`success=false`; `reason=PROPERTY_HAS_BUILDING`]

### DEBT-02 (TC-05.6): INTENT_DOWNGRADE vào FSM — UC-GAME-057

- **Traceability Chain:** FR-PROP-01 → UC-GAME-057 → TC-03.6
- **Preconditions:** `property.level >= 1`; `property.ownerId === currentPlayer.id`
- **Exit Guarantees:** `property.level = 0`; `player.balance += totalUpgradeCost * 0.5`
- **Architectural Scope:** `src/server/property_actions.ts` — `downgradeProperty()`; INTENT_DOWNGRADE
- **LOC Budget:** max +30 LOC trong `property_actions.ts`
- **Test Contracts:**
  - `TC-05.6`: [INTENT_DOWNGRADE BĐS C1] → [Hoàn 50% chi phí xây về tài khoản — Khôi phục TC-03.6]

### DEBT-03: Dọn Dead Code class AuditManager

- **Mô tả:** Xoá `class AuditManager` L91–114 trong `audit_manager.ts`; tất cả callers đã dùng standalone functions
- **Exit Guarantees:** `audit_manager.ts` giảm ~25 LOC; 0 TS compile errors; 198/198 PASS sau khi xóa
- **Architectural Scope:** `src/server/audit_manager.ts` — Xoá class, giữ standalone functions

### DEBT-04 (TC-05.7): CC_PORT_EXCLUSIVE & CC_LAND_CHANGE Nâng Cao — UC-GAME-058

- **Traceability Chain:** FR-CARD-04 → UC-GAME-058 → §V.2.17, §V.2.6
- **CC_PORT_EXCLUSIVE:** Người rút thẻ nhận 50% phí cảng từ chủ Hạ tầng × 2 vòng
- **CC_LAND_CHANGE:** Trừ 800 Tr. VÀ tăng vĩnh viễn +50% thu phí của 1 ô đất trống tùy chọn
- **Architectural Scope:** `src/domain/card_handlers.ts` — Sửa 2 handler; `src/domain/room.ts` — Thêm `permanentRentBonus: Record<number, number>` vào `Room`
- **LOC Budget:** `card_handlers.ts` phải <= 400 LOC; nếu vượt → tách `card_handlers_advanced.ts`
- **Test Contracts:**
  - `TC-05.7`: [Rút CC_PORT_EXCLUSIVE; P2 dẫm cảng của P1] → [P1 nhận 50%; người rút thẻ nhận 50% × 2 vòng]

### DEBT-05 (TC-05.8): DeltaPayload Đồng Bộ Cấp Công Trình 3D

- **Mô tả:** Sau INTENT_UPGRADE/INTENT_DOWNGRADE/INTENT_UPGRADE_ETC → DeltaPayload phải bao gồm `level` và `isETC`
- **Architectural Scope:** `src/server/room_manager.ts` hoặc delta sync layer — Bổ sung field vào payload
- **Test Contracts:**
  - `TC-05.8`: [Sau INTENT_UPGRADE] → [DeltaPayload chứa đúng `level` và `isETC`]

### DEBT-06 (TC-05.9): MC_RATE_HIKE Lãi Thế Chấp

- **Preconditions Required:** UC-051/052 hoàn thành (mortgage engine hoạt động)
- **Mô tả:** MC_RATE_HIKE → lãi thế chấp tăng từ 5% lên 10%/vòng trong duration thẻ (§V.1.5)
- **Architectural Scope:** `src/server/mortgage_manager.ts` — `getMortgageInterestRate()` đọc activeModifiers
- **Test Contracts:**
  - `TC-05.9`: [MC_RATE_HIKE active + đang thế chấp + vượt GO] → [Lãi = 10%/vòng thay vì 5%]

### DEBT-07 (TC-05.10): MC_CREDIT_STIMULUS Miễn Lãi Vay

- **Preconditions Required:** UC-051/052 hoàn thành (mortgage engine hoạt động)
- **Mô tả:** MC_CREDIT_STIMULUS → miễn toàn bộ lãi vay thế chấp trong 2 vòng (§V.1.6)
- **Architectural Scope:** `src/server/mortgage_manager.ts` — `getMortgageInterestRate()` trả về 0 khi thẻ active
- **Test Contracts:**
  - `TC-05.10`: [MC_CREDIT_STIMULUS active + đang thế chấp + vượt GO] → [Lãi = 0 trong 2 vòng]

---

## Ràng Buộc Kiến Trúc Bắt Buộc

| Ràng buộc | Chi tiết |
| :--- | :--- |
| **Module mới** | `mortgage_manager.ts` (max 200 LOC) · `insolvency_manager.ts` (max 150 LOC) |
| **File hiện tại** | `card_handlers.ts` <= 400 · `property_manager.ts` <= 400 · `room_manager.ts` <= 400 |
| **Nếu vượt ngưỡng** | Bắt buộc tách `card_handlers_advanced.ts` hoặc `property_actions_ext.ts` |
| **Cyclomatic** | <= 5/hàm · max 30 LOC/hàm |
| **TypeScript** | `strict: true` · `noUncheckedIndexedAccess: true` |
| **TurnPhase** | Thêm `InsolvencyPhase` vào enum trong `room.ts` |
| **Logging** | Mọi FSM transition → `{ event, correlationId, timestamp, delta }` |
| **Zero Silent Catch** | Mọi reject → `{ success: false, reason: REASON_CODE }` |

---

## Thứ Tự Triển Khai Đề Xuất

```
Bước 1 (Nền tảng):
  DEBT-03 → Dọn AuditManager dead code (zero dependency)
  mortgage_manager.ts [NEW] → UC-051 Cầm cố

Bước 2 (Tín dụng):
  UC-052 Lãi vay & Chuộc → hook pipeline GO
  DEBT-05 DeltaPayload (zero dependency)

Bước 3 (Rủi ro thanh khoản):
  insolvency_manager.ts [NEW] → UC-053 Cưỡng chế
  UC-054 Phá sản → UC-055 Quyết toán ván

Bước 4 (Trả nợ kỹ thuật):
  DEBT-01 P2P Trading → UC-056
  DEBT-02 INTENT_DOWNGRADE → UC-057
  DEBT-04 CC_PORT_EXCLUSIVE + CC_LAND_CHANGE → UC-058

Bước 5 (Tích hợp thẻ thị trường):
  DEBT-06 MC_RATE_HIKE (sau mortgage engine)
  DEBT-07 MC_CREDIT_STIMULUS (sau mortgage engine)

Bước 6 (Verify):
  Golden Flow E2E S00→S05 · npm test toàn bộ PASS
```

---

## Bảng Hợp Đồng Kiểm Thử Tổng Hợp (TC-05.1..TC-05.10)

| Mã TC | Trigger | Expected Observable Outcome | Mức độ |
| :--- | :--- | :--- | :---: |
| TC-05.1 | `INTENT_MORTGAGE` BĐS Cấp 0 | `balance += 50%`; `mortgaged=true`; phí thuê=0 | Cốt lõi |
| TC-05.2 | Vượt GO với 2.000 dư nợ | `balance -= 100`; GO +2.000 cộng trước | Cốt lõi |
| TC-05.3 | Balance âm sau trả phí | FSM → `InsolvencyPhase`; chấp nhận MORTGAGE/DOWNGRADE | Cốt lõi |
| TC-05.4 | Bán hết vẫn âm | `bankrupt=true`; ô → `owner=undefined`; FSM chuyển lượt | Cốt lõi |
| TC-05.5 | P2P trade Cấp 0 | Thành công; 5% thuế Kho bạc; Khôi phục TC-02.3 | Nợ |
| TC-05.6 | `INTENT_DOWNGRADE` C1 | `level=0`; hoàn 50%; Khôi phục TC-03.6 | Nợ |
| TC-05.7 | Rút CC_PORT_EXCLUSIVE | 50% phí cảng sang người rút × 2 vòng | Nợ |
| TC-05.8 | INTENT_UPGRADE hoàn tất | DeltaPayload chứa `level` và `isETC` đúng | Nợ |
| TC-05.9 | MC_RATE_HIKE + thế chấp + GO | Lãi = 10%/vòng (thay vì 5%) | Nợ + UC-051 |
| TC-05.10 | MC_CREDIT_STIMULUS + thế chấp + GO | Lãi = 0 trong 2 vòng | Nợ + UC-051 |

---

> **⛔ HUMAN GATE — DỪNG TẠI ĐÂY**
> Ticket đã được tạo tại `issues/GAME-S05-credit-and-insolvency.md`.
> Chờ duyệt phạm vi từ người dùng trước khi triển khai bất kỳ code nào trong `src/`.
