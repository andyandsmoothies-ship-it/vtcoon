# [REPORT] IMP-158: Bankrupt Player Event Card Isolation & Treasury Integrity Guards

> **Ticket**: IMP-158  
> **Type**: Bugfix / Domain Logic / Economy & Treasury Hardening  
> **Status**: COMPLETED & VERIFIED (Station 3 Approved)  
> **Traceability**: `docs/requirements.md §V (DANH MỤC CHI TIẾT CÁC THẺ SỰ KIỆN)`, ADR-0001, ADR-0004, Gotcha #220  
> **Risk Tier**: Tier 2 (Finance/Domain Logic — 3-Station Pipeline: RED ➔ GREEN ➔ Independent Audit)

---

## 1. TỔNG QUAN KẾT QUẢ

Gói cải tiến **IMP-158** đã giải quyết dứt điểm **8 lỗ hổng logic và rò rỉ dòng tiền** khi có người chơi phá sản (`player.bankrupt === true`) tham gia vào các sự kiện rút thẻ Cơ Hội, Thị Trường, và Mua Lại Cưỡng Chế.

Toàn bộ quy trình 3 trạm đã hoàn thành nghiêm ngặt:
- **Trạm 1 (RED)**: `qa-tester` viết 22 atomic tests tại `tests/domain/imp158_bankrupt_player_event_card_guards.test.ts` và chứng minh Business RED trên mã nguồn cũ.
- **Trạm 2 (GREEN)**: `implementer` sửa mã nguồn tối thiểu tại 3 file domain. Kết quả: **22/22 tests PASS**, toàn bộ suite **5.875/5.875 tests PASS (0 hồi quy)**.
- **Trạm 3 (Audit)**: `spec-reviewer` đối soát 100% đĩa vật lý và phê duyệt **`[APPROVED]`**.

---

## 2. BẢNG TỔNG HỢP 8 LỖ HỔNG ĐÃ TRIỆT TIÊU

| # | Handler / Thẻ | File & Vị trí | Lỗ hổng trước đây | Giải pháp kỹ thuật đã triển khai |
|---|---|---|---|---|
| **1** | `handleContractPenalty`<br>(`CC_CONTRACT_PENALTY`) | `chance_card_handlers.ts:40-49, 217` | Lambda dòng 217 nuốt mất `room`; người chết nhận 1.000 Tr. cứu trợ. Khi mọi đối thủ chết, tiền bốc hơi. | Lọc `opponents = players.filter(p => p.id !== player.id && !p.bankrupt)`. Nếu `opponents.length === 0`, nộp 1.000 Tr. vào `room.treasury`. Truyền context `room` vào lambda. |
| **2** | `handleFranchise`<br>(`CC_FRANCHISE`) | `chance_card_handlers.ts:54-61` | Trừ tiền người chết và cộng cho người rút thẻ ➔ Tự sinh tiền ma, gây lạm phát bàn cờ. | Thêm guard `if (p.id !== player.id && !p.bankrupt)` để chỉ trừ và thu tiền từ người còn sống. |
| **3** | `handleMegaConcert`<br>(`MC_MEGA_CONCERT`) | `market_card_handlers.ts:28-54` | (a) Chọn ô C3 của người chết làm venue. (b) Kéo toạ độ người chết (`player.position = targetCell`). (c) Trừ tiền thuê của người chết. | (a) Chọn venue: bỏ qua chủ đất phá sản (`if (!ownerPlayer \|\| ownerPlayer.bankrupt) continue;`). (b) Chỉ di chuyển và thu tiền thuê của `alivePlayers = players.filter(p => !p.bankrupt)`. |
| **4** | `handleCasinoPilot` & `awardServiceBonus`<br>(`MC_CASINO_PILOT`) | `market_card_handlers.ts:114-153` | (a) `awardServiceBonus` giải ngân cho chủ đất đã chết. (b) Fallback `poorest` chuyển 1.000 Tr. cho người chết. | (a) Guard `if (!owner \|\| owner.bankrupt) return 0;` trong `awardServiceBonus`. (b) Fallback tìm `poorest` chạy trên `alivePlayers`. Nếu 0 người sống, thoát an toàn. |
| **5** | `handlePublicInvest`<br>(`MC_PUBLIC_INVEST`) | `market_card_handlers.ts:60-76` | Phát 400 Tr. kích cầu + 1.000 Tr./ô hạ tầng cho cả người chết, rút ruột Kho Bạc vô nghĩa. | Lọc `alivePlayers = players.filter(p => !p.bankrupt)`. Chỉ giải ngân cho người sống; `totalDisbursed` trừ Kho Bạc phản ánh đúng chi phí thực tế. |
| **6** | `distributeCellPool`<br>(`MC_NIGHT_ECONOMY`, `MC_FUEL_SURGE`, `MC_UTILITY_DOUBLE`) | `market_card_handlers.ts:162-181` | (a) Trừ phí người chết. (b) `players.length` tính cả người chết làm phình to pool thưởng. | Giữ guard `if (!players \|\| players.length === 0) return;`. Lọc `alivePlayers`; `poolPerCell = cellDividend * alivePlayers.length`. Chỉ người sống nộp phí và nhận thưởng; ô của người chết nộp pool về `room.treasury`. |
| **7** | `handleFireInspection`, `handleCoastalStormDamage`, `handleAntiSpeculate` | `market_card_handlers.ts:85, 182, 196` | Phạt PCCC, bão duyên hải, chống đầu cơ lên người chết và nạp phạt ma vào Kho Bạc. | Duyệt và tính phạt nghiêm ngặt trên `alivePlayers = players.filter(p => !p.bankrupt)`. |
| **8** | `isEligibleForCompulsoryBuyout` & `handleMaForce`<br>(`CC_SWAP_PROJECT`, `CC_MA_FORCE`) | `compulsory_buyout.ts:31-32`, `chance_card_handlers.ts:96-97` | `CC_SWAP_PROJECT` tạo `pendingBuyout` nhắm vào người chết làm treo FSM 15s. `handleMaForce` mua đất người chết. | `isEligibleForCompulsoryBuyout` trả về `false` ngay nếu `owner?.bankrupt`. `handleMaForce` bỏ qua seller đã chết và kích hoạt fallback trợ cấp 800 Tr. từ Kho Bạc. |

---

## 3. THAY ĐỔI MÃ NGUỒN VẬT LÝ

```
[src/domain/]
  ├── chance_card_handlers.ts (+8 LOC)  --> handleContractPenalty, handleFranchise, handleMaForce, lambda room
  ├── market_card_handlers.ts (+14 LOC) --> handleMegaConcert, awardServiceBonus, handleCasinoPilot, handlePublicInvest, distributeCellPool, handleFireInspection, handleCoastalStormDamage, handleAntiSpeculate
  └── compulsory_buyout.ts    (+1 LOC)  --> isEligibleForCompulsoryBuyout bankrupt guard

[tests/domain/]
  └── imp158_bankrupt_player_event_card_guards.test.ts (NEW, 22 atomic tests, 465 LOC)

[Governance & Rules]
  ├── docs/domain/gotchas.md (+ Gotcha #220)
  ├── GEMINI.md (+ Bankrupt Entity Absolute Isolation Constraint)
  ├── .agents/agents/plan-griller.md (+ Terminal/Bankrupt Entity Sweep check)
  └── .agents/agents/qa-tester.md (+ Zombie/Terminal Entity Inversion Test mandate)
```

---

## 4. MINH CHỨNG KIỂM THỬ (TEST & VERIFICATION EVIDENCE)

1. **Unit & Contract Tests**:
   - `npx vitest run tests/domain/imp158_bankrupt_player_event_card_guards.test.ts`: **22/22 PASSED (100%)**.
2. **Regression Suite**:
   - `npm test`: **287 test files PASSED, 5,875 tests PASSED (ZERO regressions)**.
3. **TypeScript Strict Typecheck**:
   - `npx tsc --noEmit`: **0 errors**.
4. **Linters**:
   - `npm run lint:ui`: **0 violations**.
   - `npm run lint:slop`: **0 violations**.
5. **Adversarial Inversion Check**:
   - Đảo ngược `!p.bankrupt` ➔ `p.bankrupt` làm 3 test nổ đỏ ngay lập tức; phục hồi ➔ 100% xanh.

---

## 5. BÀI HỌC KINH NGHIỆM & INVARIANTS ĐÃ ĐÓNG BĂNG

- **Gotcha #220**: *Bankrupt & Terminal Entity Absolute Isolation Invariant* — Mọi vòng lặp collection trong game và các dự án nghiệp vụ sau này BẮT BUỘC phải lọc thực thể kết thúc (`!p.bankrupt` / `!isDeleted`).
- **Treasury Conservation Fallback**: Khi không còn đối thủ nào nhận tiền phạt, tiền bắt buộc phải chạy về Kho Bạc Nhà Nước (`room.treasury`), tuyệt đối không để thất thoát tài chính bàn cờ.
