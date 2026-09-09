# BIÊN BẢN THẨM ĐỊNH NGHIỆM THU
## Slice 05: Nghiệp Vụ Tài Chính, Thế Chấp, Thanh Lý Cưỡng Chế & Phá Sản

**Ticket tham chiếu:** [`issues/GAME-S05-credit-and-insolvency.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/issues/GAME-S05-credit-and-insolvency.md)  
**Kế hoạch thi công:** [`docs/plans/GAME-S05-credit-and-insolvency_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/GAME-S05-credit-and-insolvency_plan.md)  
**Sơ đồ Use Case tổng thể:** [`docs/domain/use_cases.puml`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/use_cases.puml)  
**Tài liệu yêu cầu gốc SSOT:** [`docs/requirements.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/requirements.md) (§I, §IV, §V)  
**Bẫy nghiệp vụ thực chiến:** [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md)  
**Sổ cái tiến độ Epic:** [`docs/epics/gameplay/_epic_ledger.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/epics/gameplay/_epic_ledger.md)  
**Ngày kiểm toán:** 2026-09-09  
**Phương pháp:** Kiểm toán 2 Cổng Độc Lập (Read-only Dual-Gate Audit) — Spec-Reviewer (Cổng Nghiệp Vụ) & Code-Reviewer (Cổng Kỹ Thuật)

---

## PHÁN QUYẾT TỔNG HỢP

| Cổng Kiểm Toán | Kết Quả | Ghi Chú Đánh Giá |
|---|---|---|
| **Cổng 1: Spec-Reviewer (Nghiệp Vụ)** | ✅ **APPROVED** | Đối soát tam giác 3 lớp (Three-Way Spec Reconciliation) đạt 100% trên toàn bộ 8 Use Cases cốt lõi (UC-051 → UC-058); giải quyết dứt điểm 7/7 khoản nợ kỹ thuật (DEBT-01 → DEBT-07); bảo đảm 100% Failure Postconditions không để lại tài sản mồ côi; 0 rò rỉ cơ chế Zone 3. |
| **Cổng 2: Code-Reviewer (Kỹ Thuật)** | ✅ **APPROVED** | Vượt qua 6/6 Cờ Đỏ Slop Nash; 0 type bypass (`as any` bị triệt tiêu 100%); 100% hàm có Cyclomatic Complexity ≤ 5 và độ dài ≤ 23 LOC; toàn bộ các tệp logic ≤ 400 LOC và tệp unit test ≤ 300 LOC; Living Golden Test S00→S05 PASS 100%; Lean Observability đạt chuẩn 100% log JSON có cấu trúc. |

> **KẾT LUẬN CHUNG: SLICE 05 ĐẠT TOÀN DIỆN MỌI TIÊU CHÍ NGHIỆM THU — PHÁN QUYẾT: [APPROVED] ✅**

---

## CỔNG 1: BIÊN BẢN THẨM ĐỊNH SPEC-REVIEWER (NGHIỆP VỤ)

### 1.1. Đối Soát Tam Giác 3 Lớp 8 Use Cases (UC-GAME-051 → UC-GAME-058)

| Use Case ID | Mô Tả Nghiệp Vụ Trong Đặc Tả & PUML | Tệp Nguồn Xử Lý & Vị Trí Code | Bằng Chứng Kiểm Thử Tự Động | Kết Quả |
|---|---|---|---|---|
| **UC-GAME-051** | **Cầm Cố / Thế Chấp BĐS Cấp 0:** Nhận 50% tiền mặt giá gốc niêm yết; tài sản bị gắn cờ thế chấp trong `player.mortgagedProperties`; miễn 100% phí thuê khi đối thủ dừng chân; từ chối khi đất đã xây công trình (C1–C3), đã thế chấp hoặc thị trường bị đóng băng. | [`mortgage_manager.ts:L118-L136`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/mortgage_manager.ts#L118-L136), [`property_manager.ts:L117-L119`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_manager.ts#L117-L119) | [`mortgage_manager.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/server/mortgage_manager.test.ts) (`[TC-05.1a,b/MSS]`), [`room_manager_s05.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/server/room_manager_s05.test.ts) | ✅ PASS |
| **UC-GAME-052** | **Trả Lãi Vay Vượt GO & Chuộc Đất:** Tự động khấu trừ 5% dư nợ thế chấp khi vượt GO (10% nếu `MC_RATE_HIKE`, 0% nếu `MC_CREDIT_STIMULUS`); cho phép chuộc BĐS qua `INTENT_REDEEM` với chi phí = gốc + 10% phí hành chính (110% loan), xóa khỏi `mortgagedProperties`. | [`mortgage_manager.ts:L22-L32`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/mortgage_manager.ts#L22-L32), [`mortgage_manager.ts:L184-L218`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/mortgage_manager.ts#L184-L218), [`room_manager.ts:L128-L132`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts#L128-L132) | [`mortgage_manager.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/server/mortgage_manager.test.ts) (`[TC-05.2a,b,c/MSS]`), [`room_manager_s05.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/server/room_manager_s05.test.ts) | ✅ PASS |
| **UC-GAME-053** | **Cưỡng Chế Thanh Lý Khi Âm Tiền:** Khi `player.balance < 0`, FSM tự động chuyển sang `TurnPhase.InsolvencyPhase`; chỉ chấp nhận `INTENT_MORTGAGE` hoặc `INTENT_DOWNGRADE`; thanh lý tự động theo thứ tự cấp giảm dần (C3 → C2 → C1 → C0) với tỷ lệ thu hồi 50% giá trị để trả nợ. | [`insolvency_manager.ts:L22-L73`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/insolvency_manager.ts#L22-L73), [`intent_dispatcher.ts:L58-L62`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/intent_dispatcher.ts#L58-L62), [`room_manager.ts:L208-L237`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts#L208-L237) | [`insolvency_manager.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/server/insolvency_manager.test.ts) (`[TC-05.3a,b/MSS]`), [`room_manager_s05.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/server/room_manager_s05.test.ts) | ✅ PASS |
| **UC-GAME-054** | **Tuyên Bố Phá Sản & Thoát Trận:** Người chơi âm tiền bán hết tài sản vẫn không đủ nộp phạt sẽ bị `declareBankruptcy`; đánh dấu `bankrupt = true`; xóa sạch 100% quyền sở hữu trong registry và stateMap (trở thành đất vô chủ); nếu còn 1 người sống sót → `gameOver = true`. | [`insolvency_manager.ts:L75-L109`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/insolvency_manager.ts#L75-L109), [`room_manager.ts:L257-L266`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts#L257-L266) | [`bankruptcy_networth.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/server/bankruptcy_networth.test.ts) (`[TC-05.4a/MSS]`), [`room_manager_s05.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/server/room_manager_s05.test.ts) | ✅ PASS |
| **UC-GAME-055** | **Quyết Toán Tổng Tài Sản Ròng (Net Worth):** Công thức chuẩn SSOT: Cash + Tổng(Giá đất x Hệ số cấp) - Tổng(Dư nợ thế chấp); xếp hạng người chơi giảm dần theo Net Worth; phân loại thứ hạng người phá sản chính xác. | [`insolvency_manager.ts:L111-L157`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/insolvency_manager.ts#L111-L157), [`room_manager.ts:L268-L271`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts#L268-L271) | [`bankruptcy_networth.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/server/bankruptcy_networth.test.ts) (`[TC-05.4b/MSS]`, `[TC-05-NW/MSS]`) | ✅ PASS |
| **UC-GAME-056** | **Giao Dịch P2P Đất Nền Cấp 0 & Thuế Chuyển Nhượng (DEBT-01):** Cho phép mua bán trực tiếp BĐS Cấp 0; người mua trả tiền mua + 5% thuế chuyển nhượng nộp Kho bạc (`room.treasury`); tăng lên 20% khi có `MC_ANTI_SPECULATE`; từ chối khi đất có công trình C1–C3. | [`property_actions.ts:L236-L276`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/property_actions.ts#L236-L276), [`room_manager.ts:L246-L255`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts#L246-L255) | [`p2p_trade.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/server/p2p_trade.test.ts) (`[TC-05.5/MSS]`, `[TC-05.5-anti/MSS]`, `[TC-05.5-inv/Adversarial]`) | ✅ PASS |
| **UC-GAME-057** | **Hạ Cấp Công Trình `INTENT_DOWNGRADE` (DEBT-02):** Hạ cấp công trình C1 về C0, hoàn lại 50% chi phí nâng cấp vào tài khoản; cho phép thực hiện trong cả `PropertyManagement` và `InsolvencyPhase`; tự động hoàn nguyên về `PropertyManagement` khi số dư >= 0. | [`property_actions.ts:L101-L135`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/property_actions.ts#L101-L135), [`room_manager.ts:L228-L237`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts#L228-L237) | [`downgrade_property.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/server/downgrade_property.test.ts) (`[TC-05.6/MSS]`, `[TC-05.6-inv/Adversarial]`) | ✅ PASS |
| **UC-GAME-058** | **Thẻ Sự Kiện Nâng Cao (DEBT-04):** `CC_PORT_EXCLUSIVE`: Người rút nhận 50% tiền cảng/hạ tầng từ chủ sở hữu trong 2 vòng; `CC_LAND_CHANGE`: Trừ 800 Tr. VNĐ, tăng vĩnh viễn 50% tiền thuê cho 1 ô BĐS Cấp 0 thuộc quyền sở hữu (`permanentRentBonus = 0.5`). | [`card_handlers.ts:L161-L215`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/card_handlers.ts#L161-L215), [`property_manager.ts:L126-L135`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_manager.ts#L126-L135) | [`advanced_chance_cards.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/domain/advanced_chance_cards.test.ts) (`[TC-05.7/MSS]`, `[TC-05.7-inv/Adversarial]`) | ✅ PASS |

---

### 1.2. Xác Nhận Giải Quyết Triệt Để 7 Khoản Nợ Kỹ Thuật (DEBT-01 → DEBT-07)

Trong Sổ cái Epic [`docs/epics/gameplay/_epic_ledger.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/epics/gameplay/_epic_ledger.md), toàn bộ 7 khoản nợ kỹ thuật từ Slice 00–04 đã được giải quyết triệt để và gạch nợ thành công:

| Mã Nợ | Nội Dung Nợ Kỹ Thuật | Điểm Đấu Nối Giải Quyết | Test Hợp Đồng | Trạng Thái Sổ Cái |
|---|---|---|---|:---:|
| **DEBT-01** | P2P Trading đất nền Cấp 0 + 5% thuế chuyển nhượng Kho bạc | [`property_actions.ts:L254-L276`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/property_actions.ts#L254-L276) | `tests/server/p2p_trade.test.ts` (`TC-05.5`) | ✅ **RESOLVED** |
| **DEBT-02** | Hạ cấp công trình C1 về C0 qua `INTENT_DOWNGRADE`, hoàn 50% | [`property_actions.ts:L117-L135`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/property_actions.ts#L117-L135) | `tests/server/downgrade_property.test.ts` (`TC-05.6`) | ✅ **RESOLVED** |
| **DEBT-03** | Dead code class `AuditManager` tách rời khỏi `RoomManager` | Đã xóa sổ hoàn toàn class thừa thãi | `tests/contracts/debt03_deadcode_cleanup.test.ts` | ✅ **RESOLVED** |
| **DEBT-04** | Thẻ `CC_PORT_EXCLUSIVE` (chia 50% cảng) & `CC_LAND_CHANGE` (+50% vĩnh viễn) | [`card_handlers.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/card_handlers.ts), [`property_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_manager.ts) | `tests/domain/advanced_chance_cards.test.ts` (`TC-05.7`) | ✅ **RESOLVED** |
| **DEBT-05** | DeltaPayload thiếu thuộc tính `level` và `isETC` đồng bộ sa bàn 3D | [`session_manager.ts:L9-L14`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts#L9-L14) | `tests/server/delta_payload_vsc.test.ts` (`TC-05.8`) | ✅ **RESOLVED** |
| **DEBT-06** | Thẻ vĩ mô `MC_RATE_HIKE` tăng lãi vay thế chấp lên 10%/vòng | [`mortgage_manager.ts:L28-L31`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/mortgage_manager.ts#L28-L31) | `tests/server/room_manager_s05.test.ts` (`TC-05.9`) | ✅ **RESOLVED** |
| **DEBT-07** | Thẻ vĩ mô `MC_CREDIT_STIMULUS` miễn lãi vay thế chấp về 0%/vòng | [`mortgage_manager.ts:L24-L27`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/mortgage_manager.ts#L24-L27) | `tests/server/room_manager_s05.test.ts` (`TC-05.10`) | ✅ **RESOLVED** |

---

### 1.3. Xác Thực 100% Failure Postconditions & Bảo Đảm Cô Lập Miền (Zone 3 Isolation)

1. **Failure Postconditions (Xác thực hậu điều kiện thất bại):**
   - **Không có tài sản mồ côi:** Khi người chơi phá sản, 100% ô đất sở hữu bị xóa khỏi `registry` và `stateMap`, trả về trạng thái vô chủ hoàn toàn. BĐS thế chấp bị xóa sạch khỏi `mortgagedProperties`.
   - **Bảo toàn trạng thái phòng:** Các giao dịch bị từ chối (`FREEZE_ACTIVE`, `NOT_OWNER`, `INSUFFICIENT_FUNDS`, `PROPERTY_HAS_BUILDING`) không làm biến đổi số dư ví, tài sản hay trạng thái FSM.
   - **Reason Codes định danh:** Toàn bộ phản hồi từ chối đều trả về mã lỗi rõ ràng từ `ActionRejectReason`.
2. **Cô Lập Miền Không Rò Rỉ Cơ Chế Zone 3 (Zone 3 Mechanism Leakage):**
   - 0 câu lệnh SQL, ORM, HTTP endpoints, WebSocket frame parsing trong core domain logic.
   - Trạng thái hoàn toàn server-authoritative, deterministic, và in-memory thuần túy.

---

## CỔNG 2: BIÊN BẢN THẨM ĐỊNH CODE-REVIEWER (KỸ THUẬT)

### 2.1. Khắc Phục Triệt Để 4 Điểm Kỹ Thuật Từ Vòng Kiểm Toán 1

| Điểm Kỹ Thuật | Hiện Trạng Vòng 1 | Biện Pháp Khắc Phục Hoàn Tất | Đánh Giá Vòng 2 |
|---|---|---|:---:|
| **1. Loại bỏ Type Escape Hatch** | Tồn tại `(state as any)?.etcActive` trong `property_actions.ts` và mock test `as any` | Chuẩn hóa hàm `hasBuildingOrUpgrade(state?: PropertyState)` kiểm tra `(state?.level ?? 0) > 0 \|\| Boolean(state?.isETC) \|\| Boolean(state?.isUpgradedUtility)`. Xóa 100% ép kiểu `as any` trong mã nguồn và test | ✅ **ĐẠT LOẠI A** |
| **2. Cyclomatic Complexity & Thu Gọn Hàm** | `executeP2PTrade` (CC = 11, 48 LOC), `mortgageProperty` (CC = 9, 39 LOC) | Trích xuất các hàm validation độc lập với Discriminated Unions (`validateP2PTrade`, `validateDowngrade`, `validateMortgage`, `validateRedeem`). Toàn bộ các hàm hiện tại có CC ≤ 5 và LOC ≤ 23 dòng | ✅ **ĐẠT LOẠI A** |
| **3. Centralized Reason Codes** | Dùng chuỗi string trực tiếp rải rác | Tạo mới tệp [`src/domain/action_reasons.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/action_reasons.ts) với hằng số `ActionRejectReason` (20 mã lỗi chuẩn). Thay thế toàn bộ magic strings | ✅ **ĐẠT LOẠI A** |
| **4. Lean Retrospective Documentation** | Thiếu đúc kết kinh nghiệm Slice 05 | Bổ sung đầy đủ Mục 6, 7, 8 vào [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) (bẫy nâng cấp ETC/tiện ích, phong tỏa FSM InsolvencyPhase, phân cấp ưu tiên thẻ thị trường vĩ mô) | ✅ **ĐẠT LOẠI A** |

---

### 2.2. Đo Lường Ngân Sách LOC & Phân Loại 5 Tầng Kiến Trúc

| Tệp Tin | Phân Loại Tầng Kiến Trúc | LOC Thực Tế | Ngân Sách Trần | Tỷ Lệ Sử Dụng | Đánh Giá |
|---|---|:---:|:---:|:---:|:---:|
| [`src/domain/action_reasons.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/action_reasons.ts) | Tầng 1: SSOT Contracts / Constants | 26 | 100 LOC | 26% | ✅ Rất tinh gọn |
| [`src/domain/room.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts) | Tầng 1: Entity Types & Models | 106 | 400 LOC | 26.5% | ✅ Tối ưu |
| [`src/domain/property_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_manager.ts) | Tầng 2: Core Domain Logic | 370 | 400 LOC | 92.5% | ✅ Đạt ngưỡng chuẩn |
| [`src/domain/card_handlers.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/card_handlers.ts) | Tầng 2: Core Domain Logic | 355 | 400 LOC | 88.8% | ✅ Đạt ngưỡng chuẩn |
| [`src/server/property_actions.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/property_actions.ts) | Tầng 2: Domain Operations / FSM | 277 | 400 LOC | 69.3% | ✅ Tối ưu |
| [`src/server/mortgage_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/mortgage_manager.ts) | Tầng 2: Financial Domain Service | 219 | 400 LOC | 54.8% | ✅ Tối ưu |
| [`src/server/insolvency_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/insolvency_manager.ts) | Tầng 2: Risk & Liquidation Engine | 180 | 400 LOC | 45.0% | ✅ Tối ưu |
| [`src/server/room_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts) | Tầng 2: Thin Orchestrator / Dispatcher | 329 | 400 LOC | 82.3% | ✅ Đạt ngưỡng chuẩn |
| [`src/server/session_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts) | Tầng 2: WebSocket State Sync | 123 | 400 LOC | 30.8% | ✅ Tối ưu |
| [`src/server/intent_dispatcher.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/intent_dispatcher.ts) | Tầng 2: Intent Router / Guard | 67 | 400 LOC | 16.8% | ✅ Rất tinh gọn |
| [`tests/server/p2p_trade.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/server/p2p_trade.test.ts) | Tầng 4: Unit Acceptance Test | 299 | 300 LOC | 99.7% | ✅ Tuân thủ trần test |
| [`tests/server/downgrade_property.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/server/downgrade_property.test.ts) | Tầng 4: Unit Acceptance Test | 224 | 300 LOC | 74.7% | ✅ Đạt chuẩn |
| [`tests/server/bankruptcy_networth.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/server/bankruptcy_networth.test.ts) | Tầng 4: Unit Acceptance Test | 248 | 300 LOC | 82.7% | ✅ Đạt chuẩn |
| [`tests/server/mortgage_manager.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/server/mortgage_manager.test.ts) | Tầng 4: Unit Acceptance Test | 220 | 300 LOC | 73.3% | ✅ Đạt chuẩn |
| [`tests/server/insolvency_manager.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/server/insolvency_manager.test.ts) | Tầng 4: Unit Acceptance Test | 196 | 300 LOC | 65.3% | ✅ Đạt chuẩn |
| [`tests/integration/golden_gameplay_flow.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/integration/golden_gameplay_flow.test.ts) | Tầng 4: E2E Integration Living Test | 498 | 600 LOC | 83.0% | ✅ Tối ưu |

---

### 2.3. Kiểm Toán The Golden Path Living Test (E2E Integration S00 → S05)

Tệp [`tests/integration/golden_gameplay_flow.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/integration/golden_gameplay_flow.test.ts) mô phỏng một ván đấu sống trọn vẹn giữa P1 và P2 qua toàn bộ 6 lát cắt kỹ thuật:
- **Bước 1 (Slice 00):** Tạo phòng, P1 & P2 gia nhập với 15.000 Tr. VNĐ, kiểm tra kết nối WebSocket.
- **Bước 2 (Slice 01):** P1 lắc xúc xắc qua ô GO nhận 2.000 Tr. VNĐ, dừng chân tại ô 01 Ba Đình.
- **Bước 3 (Slice 02):** P1 mua đất ô 01 giá 600 Tr. VNĐ, kết thúc lượt.
- **Bước 4 (Slice 02):** P2 dừng tại ô 01 của P1, trả 60 Tr. VNĐ tiền thuê đất cơ sở C0.
- **Bước 5 (Slice 03):** P1 mua ô 03 Hoàn Kiếm, sở hữu bộ Nâu, nâng cấp lên Shophouse C1.
- **Bước 6 (Slice 03):** P2 từ chối mua Ga ô 05, kích hoạt đấu giá tự động, P1 thắng với 1.200 Tr. VNĐ.
- **Bước 7 (Slice 03):** P1 mua Ga ô 15 và lắp trạm thu phí ETC; P2 dừng chân nộp 1.500 Tr. VNĐ.
- **Bước 8 (Slice 04):** P1 dừng tại Sàn HOSE ô 38, đầu tư 2.000 Tr. VNĐ, xúc xắc trả về tỷ lệ lời/lỗ chính xác.
- **Bước 9 (Slice 04):** P2 bị tống vào Trạm Kiểm Toán ô 10 từ ô 30, nộp bảo lãnh 500 Tr. VNĐ rời trạm an toàn.
- **Bước 10 (Slice 05 - MỚI):** P1 gửi `INTENT_MORTGAGE` thế chấp BĐS C0 ô 03, nhận 50% tiền mặt (200 Tr. VNĐ), ô bị úp thẻ cầm cố.
- **Bước 11 (Slice 05 - MỚI):** P1 hoàn thành 1 vòng qua ô GO, hệ thống tự động khấu trừ 5% lãi vay thế chấp (10 Tr. VNĐ) trên dư nợ 200 Tr. VNĐ.
- **Bước 12 (Slice 05 - MỚI):** P2 dẫm vào Ga ô 15 (có phí ETC 1.500 Tr. VNĐ) khi số dư chỉ còn 1.000 Tr. VNĐ → Số dư rơi vào mức âm (-500 Tr. VNĐ) → FSM tự động kích hoạt chuyển sang `TurnPhase.InsolvencyPhase`.
- **Bước 13 (Slice 05 - MỚI):** Trong `InsolvencyPhase`, hệ thống từ chối các Intent không hợp lệ (`INTENT_END_TURN`, `INTENT_BUY_PROPERTY`). P2 không còn tài sản đủ để huy động → Kích hoạt `handleBankruptcy`.
- **Bước 14 (Slice 05 - MỚI):** P2 tuyên bố phá sản, `bankrupt = true`, giải phóng toàn bộ tài sản. Chỉ còn P1 sống sót → Trận đấu kết thúc (`gameOver = true`), xuất bảng xếp hạng Net Worth chuẩn xác (P1 vô địch).

**Thời gian thực thi:** 11ms — **Kết quả:** 14/14 bước PASS 100%.

---

### 2.4. Kiểm Toán Lean Observability & Zero-Silent-Catch

1. **Zero Silent Catch:** Quét toàn bộ `src/` xác nhận **0 câu lệnh `catch`**, không nuốt lỗi âm thầm.
2. **Explicit Reason Codes:** 100% phản hồi từ chối người chơi sử dụng hằng số định danh từ `ActionRejectReason`.
3. **Structured JSON Logs:** 100% sự kiện tài chính và chuyển đổi FSM xuất log 1 dòng JSON có cấu trúc rõ ràng:
   - `DOWNGRADE_PROPERTY`: `{ event, correlationId, timestamp, delta: { cellIndex, refund, playerId } }`
   - `P2P_TRADE`: `{ event, correlationId, timestamp, delta: { sellerId, buyerId, cellIndex, price, taxAmount } }`
   - `MORTGAGE_PROPERTY`: `{ event, correlationId, timestamp, delta: { cellIndex, loan, playerId } }`
   - `REDEEM_PROPERTY`: `{ event, correlationId, timestamp, delta: { cellIndex, repay, playerId } }`
   - `MORTGAGE_INTEREST`: `{ event, correlationId, timestamp, delta: { playerId, totalDebt, interest, rate } }`
   - `BANKRUPTCY_DECLARED`: `{ event, correlationId, timestamp, delta: { playerId } }`

---

## BẰNG CHỨNG THỰC THI KIỂM THỬ (VERIFICATION RECORD)

```
Test Files  30 passed (30)
     Tests  373 passed (373)
  Duration  1.59s
TypeScript  0 errors (strict mode, noUncheckedIndexedAccess: true)
   Shuffle  30/30 passed (--sequence.shuffle)
```

| Hạng Mục Đo Lường | Kết Quả Thực Tế | Ngân Sách / Yêu Cầu | Đánh Giá |
|---|---|---|:---:|
| **Tổng số test suites** | 30/30 files PASS | 100% suites pass | ✅ PASS |
| **Tổng số kiểm thử** | 373/373 tests PASS | 100% tests pass | ✅ PASS |
| **Kiểm thử hồi quy (Slice 00 - 04)** | 198/198 tests bảo toàn tuyệt đối | 198 tests | ✅ PASS |
| **Kiểm thử mới Slice 05** | 175 tests mới bổ sung (bao gồm TC-05.1 → TC-05.10) | Đạt độ phủ mọi nhánh | ✅ PASS |
| **Kiểm thử đảo thứ tự (`--sequence.shuffle`)** | 373/373 tests PASS | Độc lập thứ tự hoàn toàn | ✅ PASS |
| **TypeScript Strict Compilation (`tsc --noEmit`)** | Exit code 0, 0 warning, 0 error | Zero diagnostics | ✅ PASS |

---

*Biên bản kiểm toán được lập tự động bởi hệ thống Song Tác Nhân Độc Lập ngày 2026-09-09.*  
*Lưu trữ vĩnh viễn tại [`docs/reports/audits/GAME-S05_acceptance_report.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/audits/GAME-S05_acceptance_report.md) phục vụ hồ sơ nghiệm thu chính thức của Slice 05.*
