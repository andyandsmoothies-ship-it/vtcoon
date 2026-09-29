# BÁO CÁO HOÀN THÀNH — IMP-226: ESCALATING AUDIT BAILOUT & TRANSPARENT DOCK AFFORDANCE

> **Mã Ticket**: `IMP-226` | **Loại Thay Đổi**: Tier 2 (Full Rigor — Game Engine / FSM / Network / UI Affordance)  
> **Trạng Thái**: ✅ **HOÀN THÀNH — PRODUCTION READY**  
> **Thực Hiện Theo**: Quy Trình 3 Trạm Đối Kháng Hiến Pháp Antigravity (`GEMINI.md`)  
> **Evidence Snapshot**: [`.agents/evidence/imp226_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp226_snapshot.json)

---

## 1. TỔNG QUAN VẤN ĐỀ VÀ NGUYÊN NHÂN GỐC

Trong ván đấu thực tế (Room `VTCTH9`):
1. Người chơi có số dư `9.769 Tr.`, bấm nút **"Bảo Lãnh (500)"** trên thanh `ActionDock`.
2. Sau khi gửi `INTENT_BAIL_OUT`, số dư thực tế bị trừ `2.016 Tr.` (rơi xuống `7.753 Tr.`), tạo cảm giác kỳ lạ và gây hoang mang cho người chơi vì nhãn hiển thị 500 nhưng bị trừ tới hơn 2.000.
3. **Nguyên nhân gốc**:
   - Máy chủ áp dụng công thức cũ `Math.max(500, Math.floor(netWorth * 0.10))`. Do tài sản ròng của người chơi gồm cả tiền mặt và BĐS là ~20.169 Tr., 10% ra con số lẻ `2.016 Tr.`
   - Trên client, nút bấm tại `src/client/ui/action_dock.tsx` bị hardcode nhãn cố định `Bảo Lãnh (500)` và điều kiện vô hiệu hóa `< 500`, dẫn đến tình trạng lệch pha hoàn toàn giữa affordance người chơi nhìn thấy và logic thực tế trên server.
   - Công thức 10% Net Worth vừa quá phức tạp, sinh số lẻ, vừa phi thực tế so với luật cờ tỷ phú truyền thống.

---

## 2. NỘI DUNG VÀ KIẾN TRÚC TRIỂN KHAI

### 2.1 Khung Chế Tài Tái Phạm Sát Thực Tế (Escalating Bail Tiers)
Thay thế toàn bộ công thức `10% Net Worth` bằng bậc thang chế tài minh bạch:
- **Lần 1 (`auditCount = 1`)**: `500 Tr. VNĐ` — Chuẩn lệ phí hành chính cơ sở (25% lương GO 2.000 Tr.).
- **Lần 2 (`auditCount = 2`)**: `1.000 Tr. VNĐ` — Chế tài răn đe tái phạm thanh tra.
- **Lần 3 trở đi (`auditCount >= 3`)**: `2.000 Tr. VNĐ` — Khung phạt tối đa (bằng 100% lương vòng cơ sở).
- **Luật Chống Cắm Trại (Anti-Camping Invariant [IMP-192A])**: Tiếp tục phong tỏa 100% doanh thu tiền thuê & điện nước của chủ đất trong thời gian ở trạm (`inAudit || auditTurnsLeft > 0`), loại bỏ hoàn toàn rủi ro cắm trại né đối thủ.

### 2.2 Đồng Bộ Toàn Diện Pipeline 5 Trạm
1. **Domain Model (`src/domain/property_rent.ts`)**:
   - Khai báo SSOT: `ESCALATING_BAIL_TIERS = [500, 1_000, 2_000] as const`, `MIN_BAIL_AMOUNT = 500`, `MAX_BAIL_AMOUNT = 2_000`.
   - Triển khai hàm SSOT `calculateBailAmount(auditCount: number = 1): number`.
2. **Bot AI Parity (`src/domain/bot/bot_audit.ts`)**:
   - Sử dụng `calculateBailAmount(bot.auditCount ?? 1)` cho cả điều kiện kiểm tra tiền mặt và ngưỡng đệm an toàn (`bot.balance - bailCost < minBuffer`).
3. **Entity & Vòng Đời Counter (`src/domain/room.ts`, `src/server/audit_manager.ts`)**:
   - Thêm `auditCount?: number` vào `Player`.
   - `sendToAudit`: Tăng bộ đếm `player.auditCount = (player.auditCount ?? 0) + 1` khi vào trạm.
   - `handleBailOut` và `handleAuditTurnTransition`: Khấu trừ tiền phạt nộp Kho Bạc theo `calculateBailAmount(current.auditCount ?? 1)` mà không tăng đúp bộ đếm.
   - Dọn sạch dead code `hasOwnedProperties` và import thừa `calculateNetWorth`.
4. **Đồng Bộ Dây Mạng Wire Delta (`session_manager.ts`, `delta_broadcaster.ts`, `apply_delta_players.ts`, `game_store_types.ts`)**:
   - Truyền tải `auditCount` trong `PlayerDelta`, sparse delta so sánh `(a.auditCount ?? 0) === (b.auditCount ?? 0)`.
   - Client parser `apply_delta_players.ts` đưa vào `OPTIONAL_PLAYER_KEYS` và cập nhật `PlayerHudInfo.auditCount`.
   - Giữ nghiêm ngặt ngân sách LOC: `session_manager.ts` đạt **397 LOC** (<= trần 400 LOC Tier 1).
5. **UI Affordance & Công Thái Học Mobile (`src/client/ui/action_dock.tsx`)**:
   - Các biến trạng thái (`auditCount`, `currentBailCost`, `canAffordBail`, `bailLabel`, `bailTitle`) được tính toán rõ ràng trong thân component ngoài JSX.
   - Desktop hiển thị nhãn động: `Bảo Lãnh (500)`, `Bảo Lãnh - Lần 2 (1.000)`, `Bảo Lãnh - Tái Phạm (2.000)`.
   - Mobile viewport 360px: Hiển thị gọn `⚖️ 500` / `⚖️ 1.000` / `⚖️ 2.000`, đạt chuẩn sàn diện tích chạm `>= 44px` (`min-h-[44px] min-w-[44px]`).
   - Nút tự động vô hiệu hóa (`disabled`) khi `balance < currentBailCost`.
   - Tooltip `title` giải thích chi tiết số tiền và lý do khi không đủ tiền.
6. **Activity Log & Badges (`activity_badge_dispatcher.ts`, `activity_rent_matcher.ts`)**:
   - Khớp nhật ký dòng tiền ghi nhận đúng mô tả: `Bảo Lãnh Tái Phạm (Lần 2)` khi nộp 1.000 Tr.
   - Floating badge hiển thị đúng công thức: `Bảo lãnh tái phạm: Khung 1.000 Tr. ➔ Kho Bạc`.

---

## 3. KẾT QUẢ QUY TRÌNH 3 TRẠM (3-STATION PIPELINE)

| Trạm | Phụ Trách | Trạng Thái | Chi Tiết |
| :--- | :--- | :---: | :--- |
| **Trạm 1: QA RED** | `qa-tester` | ✅ PASSED | 16 atomic test cases trong `tests/contracts/imp226_escalating_audit_bailout.test.ts`. 14 failed \| 2 passed chứng minh Inversion Gate sạch. |
| **Trạm 2: GREEN** | `implementer` | ✅ PASSED | Triển khai mã nguồn tối thiểu, 16/16 contract tests GREEN, 16/16 tests trong `imp192a` reconciled GREEN, 22/22 server audit tests GREEN. |
| **Trạm 2.5: Scout** | `scout` | ✅ PASSED | Đã quét sạch 5 archetypes lỗi, gỡ bỏ 100% `as any` trong test fixtures, LOC ngân sách an toàn (397 LOC). |
| **Trạm 3: Spec Review** | `spec-reviewer` | ✅ APPROVED | 100% đối chiếu đặc tả C1-C5, tương thích ngược hoàn hảo, snapshot hợp lệ. |
| **Trạm 3: UI Craft Review** | `ui-craft-reviewer` | ✅ APPROVED | Đạt chuẩn Impeccable Design, 0 UI violations, affordance chuẩn xác, sàn chạm mobile 44px. |

---

## 4. MA TRẬN 16 KIỂM THỬ HỢP ĐỒNG (TC-226.01 .. TC-226.16)

- `TC-226.01`: `calculateBailAmount(1)` trả về 500 Tr. VNĐ cho lần đầu vi phạm.
- `TC-226.02`: `calculateBailAmount(2)` trả về 1.000 Tr. VNĐ cho lần tái phạm thứ hai.
- `TC-226.03`: `calculateBailAmount(3)` và `calculateBailAmount(5)` trả về trần 2.000 Tr. VNĐ cho các lần tái phạm tiếp theo.
- `TC-226.04`: `calculateBailAmount(undefined)` và `calculateBailAmount(0)` an toàn fallback về 500 Tr. VNĐ.
- `TC-226.05`: Người chơi vào trạm lần 1 nộp bảo lãnh: trừ chính xác 500 Tr., Kho Bạc tăng 500 Tr., xóa án kiểm toán.
- `TC-226.06`: Người chơi tái phạm lần 2 (`auditCount = 2`) nộp bảo lãnh: trừ chính xác 1.000 Tr., Kho Bạc tăng 1.000 Tr.
- `TC-226.07`: Người chơi tái phạm lần 3 (`auditCount = 3`) nộp bảo lãnh: trừ chính xác 2.000 Tr.
- `TC-226.08`: Hết 3 lượt không ra đôi tại lần 2: `handleAuditTurnTransition` tự động phạt cưỡng chế đúng 1.000 Tr. nộp Kho Bạc.
- `TC-226.09`: `auditCount` chỉ tăng trong `sendToAudit`, không bị tăng đúp khi gọi `handleBailOut` hoặc `handleAuditTurnTransition`.
- `TC-226.10`: `auditCount` được truyền thông suốt từ `Room.player` ➔ `PlayerDelta` ➔ `buildSparseDelta` ➔ `applyDeltaPlayers` ➔ `PlayerHudInfo`.
- `TC-226.11`: Lần 1: ActionDock hiển thị nhãn `Bảo Lãnh (500)` và `disabled = false` khi `balance >= 500`.
- `TC-226.12`: Lần 2: ActionDock hiển thị nhãn `Bảo Lãnh - Lần 2 (1.000)`, khóa nút nếu `balance = 700` (`< 1000`).
- `TC-226.13`: Lần 3+: ActionDock hiển thị nhãn `Bảo Lãnh - Tái Phạm (2.000)` và tooltip giải thích chi tiết.
- `TC-226.14`: Trên Mobile viewport: ActionDock hiển thị `⚖️ 1.000`, đạt sàn diện tích chạm `>= 44px` (`min-h-[44px] min-w-[44px]`) và có `data-testid="bailout-btn"`.
- `TC-226.15`: Khớp `matchRentTransactions` ghi nhận đúng mô tả `Bảo Lãnh Tái Phạm (Lần 2)` khi người chơi tái phạm nộp 1.000 Tr. rời trạm.
- `TC-226.16`: `decideAuditBailout` trong `bot_audit.ts` nhận diện chính xác chi phí 1.000 Tr. cho Bot tái phạm lần 2 và từ chối khi không đủ đệm an toàn.
- `TC-226.17`: [Blast Radius / AFK Auto-Recovery] Người chơi ở Trạm Kiểm Toán lần 2 (`auditCount = 2`) AFK qua luồng `executeSafeAfkAction` ➔ `rooms.handleEndTurn` ➔ `turn_loop` cưỡng chế phạt đúng 1.000 Tr. nộp Kho Bạc, xóa án kiểm toán.
- `TC-226.18`: [Blast Radius / AFK Insolvency] Tái phạm lần 3 (`auditCount = 3`) AFK hết lượt khi số dư không đủ (`balance = 800 < 2.000`) ➔ phạt trần 2.000 Tr. làm âm vốn (`-1.200`) và tự động chuyển FSM sang `InsolvencyPhase`.

