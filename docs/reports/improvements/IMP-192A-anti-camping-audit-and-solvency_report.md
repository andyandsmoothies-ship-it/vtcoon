# Báo Cáo Cải Tiến IMP-192A: Cải Cách Trạm Kiểm Toán & Chống Camping (Anti-Camping Audit & Dynamic Bailout)

## 1. Tổng Quan & Mục Tiêu Kỹ Thuật
- **Mã Ticket**: `IMP-192A` (Lát cắt 1 trong bộ 3 lát cắt cải tiến gameplay kinh tế đời thực IMP-192).
- **Mục tiêu**:
  - **Chống Camping phong tỏa dòng tiền thụ động**: Khi chủ đất đang ở trong Trạm Kiểm Toán (`owner.auditTurnsLeft > 0 || owner.inAudit`), người chơi khác dẫm vào BĐS của họ được miễn 100% tiền thuê (`rentAmount = 0`), triệt tiêu chiến thuật cố tình ngồi tù để thu tiền thuê an toàn.
  - **Phí bảo lãnh động 10% Net Worth**: Người chơi sở hữu BĐS khi nộp bảo lãnh chủ động (`handleBailOut`) phải trả `max(500, floor(netWorth * 0.10))` nộp vào Kho Bạc Quốc Gia.
  - **Đồng bộ phạt mãn hạn tự nhiên**: Khi hết 3 vòng (`handleAuditTurnTransition`), người chơi sở hữu BĐS cũng phải nộp đúng `max(500, floor(netWorth * 0.10))` vào Kho Bạc, triệt tiêu động cơ trục lợi cố tình ngồi hết hạn để trốn phí (*Perverse Incentive*).
  - **Tự động kích hoạt phá sản khi âm tiền**: Nếu việc nộp phạt mãn hạn làm âm số dư tài khoản, hệ thống chuyển ngay sang `InsolvencyPhase` để xử lý nợ.

---

## 2. Chi Tiết Thực Thi & Tệp Sửa Đổi
1. **[`src/domain/property_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_manager.ts)** (140 LOC, Tier 1 <= 400 LOC):
   - Thêm Anti-Camping guard tại `handleLanding` (L75-L79): Nếu `owner && ((owner.auditTurnsLeft ?? 0) > 0 || owner.inAudit)` trả về `{ result: LandingResult.RentPaid, rentAmount: 0, landlordId: ownerId }`.
2. **[`src/server/audit_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/audit_manager.ts)** (150 LOC, Tier 1 <= 400 LOC):
   - Nhận thêm `registry?: PropertyRegistry, stateMap?: PropertyStateMap` cho cả `handleBailOut` và `handleAuditTurnTransition`.
   - Hàm `hasOwnedProperties(playerId, registry)` phân định rõ: Người có sở hữu BĐS áp dụng 10% Net Worth (`calculateNetWorth`), người không có BĐS áp dụng sàn 500 Tr.
   - Nộp toàn bộ tiền bảo lãnh và tiền phạt vào `room.treasury`.
3. **[`src/server/turn_loop.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/turn_loop.ts)** (252 LOC, Tier 1 <= 400 LOC):
   - Tại `executeTurnEnd` (L202), truyền tiếp `registry, stateMap` khi gọi `handleAuditTurnTransition(room, current, registry, stateMap)`.
   - Nếu `current.balance < 0` sau phạt, kích hoạt `checkInsolvency(room)`.
4. **[`src/server/room_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts)** (522 LOC, Tier 1 <= 550 LOC):
   - Tại `handleBailOut` (L122-L130), trích xuất `this.registries.get(roomCode)` và `this.propertyStates.get(roomCode)` truyền vào `handleBailOut`.
5. **[`src/server/insolvency_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/insolvency_manager.ts)** (261 LOC, Tier 1 <= 400 LOC):
   - Sử dụng chuẩn `LEVEL_MULTIPLIER` (`{ 0: 1, 1: 1.5, 2: 2.5, 3: 4 }`) trong `calculateNetWorth`, loại bỏ triệt để hardcoded bypass.
6. **[`tests/contracts/imp192a_anti_camping_audit.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp192a_anti_camping_audit.test.ts)** (202 LOC, <= 300 LOC):
   - 16 atomic tests có tag `[TC-192A.01-16/MSS][UC-IMP192A]` bao phủ toàn diện 6 Failure Modes.

---

## 3. Kết Quả Kiểm Thử Vật Lý & Linter
- **Contract Tests**:
  - `tests/contracts/imp192a_anti_camping_audit.test.ts`: **16/16 PASS** (100%).
- **Full Test Suite Regression Check**:
  - `npm test`: **318/318 test files PASS**, **6,391/6,391 tests PASS** (0 regressions).
- **TypeScript Compiler Check**:
  - `npx tsc --noEmit`: **0 lỗi** (Exit code 0).
- **LOC Tiers & Anti-Slop Check**:
  - `npm run lint:slop`: 0 hard violations trên toàn bộ các tệp sửa đổi.
- **Evidence Snapshot**:
  - Tạo tự động tại `.agents/evidence/imp192_snapshot.json`.

---

## 4. Kiểm Toán Độc Lập Trạm 3 (Station 3 Sign-Off)
- **`spec-reviewer`**: **APPROVED** (100% đối soát khớp đặc tả nghiệp vụ).
- **`code-reviewer`**: **APPROVED** (100% tuân thủ clean code, LOC tiers, zero dirty bypasses).

---

## 5. Kiến Thức Ghi Nhận Thực Nghiệm (Gotchas)
- **Gotcha #262 [FSM/AUDIT]**: Trạm Kiểm Toán có 2 cửa thoát: (1) Chủ động nộp bảo lãnh `handleBailOut` và (2) Mãn hạn tù tự nhiên `handleAuditTurnTransition` khi `auditTurnsLeft === 0`. Cả 2 cửa thoát bắt buộc phải áp dụng cùng công thức phạt $\max(500, \lfloor \text{NetWorth} \times 0.10 \rfloor)$ đối với người chơi có sở hữu BĐS để triệt tiêu Perverse Incentive (cố tình chờ hết hạn để trốn phí bảo lãnh).
