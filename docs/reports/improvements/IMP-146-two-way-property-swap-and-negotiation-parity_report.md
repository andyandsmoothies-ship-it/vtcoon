# Báo Cáo Nghiệm Thu Cải Tiến: [IMP-146] Hệ Thống Giao Dịch Đổi Đất 2 Chiều (Two-Way Property Swap) & Cân Bằng Đàm Phán Người - Bot AI

> **Mã Cải Tiến**: [IMP-146]  
> **Trạng thái**: 🟢 **Hoàn Tất (Trạm 3 Đã Duyệt - Ship Ready)**  
> **Kế thừa**: IMP-142, IMP-143, IMP-144, ADR-0001 (FSM Server-Authoritative), Gotcha #191, #195  
> **Phân tầng rủi ro**: Tier 2 (Full Rigor) — Đụng chạm Wire Protocol, Server FSM, Intent Dispatcher, Thuật toán Bot AI, Client UI/UX  

---

## 1. TỔNG QUAN VẤN ĐỀ & MỤC TIÊU CẢI TIẾN

Dựa trên dữ liệu thực nghiệm mô phỏng 13.000 ván đấu (`docs/reports/simulations/comprehensive_13000_games_gameplay_insights_report.md`), người chơi thật chỉ đạt tỷ lệ thắng **5.3%** trong bàn 4 người do hội chứng "Bot bắt tay nhau cô lập người chơi". Khi người chơi thiếu 1 ô đất để hoàn tất độc quyền, Bot không chịu bán lấy tiền mặt (do quy tắc giữ đất độc quyền), trong khi người chơi lại không có cơ chế **đổi đất lấy đất** như trong đời thực.

### 5 Động Lực Thương Lượng Đời Thực Đã Được Hiện Thực Hóa:
1. **Hoán Đổi Cùng Độc Quyền (Win-Win Monopoly Swap)**: Bot chủ động tìm kiếm các cơ hội đổi 1 ô đất mình dư lấy 1 ô đất đối thủ dư để cả 2 bên cùng hoàn tất độc quyền khác màu.
2. **Đổi Đất Bù Tiền Thông Minh (Asymmetrical Swap with Cash Offset)**: Hỗ trợ 3 trạng thái bù tiền (`price === 0` ngang giá, `price > 0` người mua bù tiền, `price < 0` người bán bù tiền). Thuế kho bạc 5% tính chuẩn xác trên `Math.abs(price)`.
3. **Liên Minh Chống Kẻ Dẫn Đầu (Anti-Snowball Coalition / `EMBARGO_LEADER`)**: Bot từ chối nhượng ô đất độc quyền mang tính quyết định cho người chơi đang dẫn đầu giá trị tài sản ròng.
4. **Mặc Cả Phân Tầng Tính Cách (Personality-Driven Valuation)**: Bot Aggressive sẵn sàng bù thêm +20% đến +40% để khóa độc quyền nhanh; Bot Balanced giữ mức cân bằng tài sản; Bot Passive ưu tiên bảo toàn vốn và đệm an toàn.
5. **Nhịp Điệu Đàm Phán Tự Nhiên & Cooldown 3 Vòng**: Tránh spam quấy rầy. Khi 1 cặp ô đất bị từ chối, Bot áp dụng cooldown 3 vòng (`currentRound - lastRejected <= 3`).

---

## 2. KẾT QUẢ TRIỂN KHAI VÀ THAY ĐỔI MÃ NGUỒN

| Tệp Mã Nguồn | Vị Trí & Thay Đổi Chính | LOC | Độ Phức Tạp |
| :--- | :--- | :---: | :---: |
| [`src/domain/room.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts) | Khai báo `PendingTradeOfferInfo`, `pendingTradeOffer` trên `Room`, `swapPairLastRejectedRound` trên `Player` | +21 | 1 |
| [`src/domain/bot/bot_trade.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_trade.ts) | Triển khai `findBotSwapTrade` (quét Win-Win khác nhóm màu, cooldown 3 vòng) và `evaluateBotSwapAcceptance` (`EMBARGO_LEADER`) | +128 | 4 |
| [`src/server/intent_dispatcher.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/intent_dispatcher.ts) | Mở rộng `INTENT_TRADE_OFFER` với `offeredCellIndex?: number` | +4 | 1 |
| [`src/server/security/envelope_validator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/security/envelope_validator.ts) | Xác thực `offeredCellIndex` phải là số nguyên hợp lệ `Number.isInteger` | +6 | 1 |
| [`src/server/pending_trade_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/pending_trade_manager.ts) | `PendingTradeSession` tiếp nhận, lưu trữ và bàn giao `offeredCellIndex`, `targetPlayerId` | +8 | 1 |
| [`src/server/property_actions.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/property_actions.ts) | Hoán đổi quyền 2 ô trong 1 tick FSM nguyên tử, bỏ qua sàn giá khi đổi đất, tính thuế 5% trên `Math.abs(price)` | +68 | 4 |
| [`src/server/room_property_coordinator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_property_coordinator.ts) | Phối hợp `coordTrade` và `coordRespondTradeOffer` 2 chiều, dọn sạch dirty casts `as any` | +42 | 3 |
| [`src/server/room_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts) | `handleTradeOffer` tiếp nhận `offeredCellIndex`, dọn sạch dirty casts `as any` | +12 | 1 |
| [`src/server/session_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts) | `PendingTradeOfferDelta` nhận `offeredCellIndex`, đồng bộ qua WebSocket | +8 | 1 |
| [`src/client/store/game_store_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store_types.ts) | Thêm `offeredCellIndex?: number` vào state `bot_trade_offer` | +2 | 1 |
| [`src/client/ui/modals/modal_host.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/modal_host.tsx) | `onSubmitTrade` gửi đủ 2 ô; truyền `offeredCellIndex` vào `BotTradeOfferModal` | +14 | 1 |
| [`src/client/ui/modals/bot_trade_offer_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/bot_trade_offer_modal.tsx) | Giao diện 2 chiều 🤝, 2 thẻ ô đất nhận/nhượng, 3 trạng thái bù tiền, thuế 5%, WCAG AA | +78 | 3 |
| [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) | Ghi nhận Gotcha #195 (`[P2P/SWAP]` Bất Biến Hoán Đổi Quyền Sở Hữu Đất 2 Chiều) | +35 | 1 |

---

## 3. KIỂM ĐỊNH 4-FACET UNIVERSAL MATRIX & CHỨNG CỨ VẬT LÝ

Tệp kiểm thử hợp đồng độc lập: [`tests/contracts/imp146_p2p_property_swap_and_negotiation_parity.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp146_p2p_property_swap_and_negotiation_parity.test.ts) gồm **24 atomic tests** tuân thủ nghiêm ngặt Adversarial Inversion:

1. **Facet 1: Boundary & Validation (Tests 1-8)**:
   - Từ chối khi ô đất muốn nhận hoặc muốn đổi không thuộc sở hữu chính chủ.
   - Từ chối khi một trong hai ô đất đã xây nhà (`level > 0`).
   - Từ chối khi một trong hai ô đất đang bị thế chấp (`isMortgaged`).
   - Từ chối khi bên phải bù tiền không có đủ số dư thanh toán.
   - Chấp nhận `price === 0` (đổi ngang giá, thuế 0 Tr.).
   - Chấp nhận `price < 0` (người bán bù tiền mặt cho người mua).
   - Chấp nhận `price > 0` và bỏ qua kiểm tra sàn giá 70% (`PRICE_BELOW_FLOOR`).
   - Xác thực `EnvelopeValidator` bắt buộc `offeredCellIndex` phải là số nguyên `Number.isInteger`.

2. **Facet 2: Reactivity & Bot Intelligence (Tests 9-15)**:
   - Bot chủ động phát hiện cơ hội Win-Win cùng độc quyền khác nhóm màu (`findBotSwapTrade`).
   - Bot chặn hoán đổi 2 ô đất trong cùng một nhóm màu (`wantedGroup === offeredGroup`).
   - Bot áp dụng Cooldown 3 vòng cho cặp ô đất vừa bị từ chối.
   - Bot Aggressive sẵn sàng bù thêm tiền (+20% đến +40%) để chốt độc quyền.
   - Bot kích hoạt cấm vận `EMBARGO_LEADER`: từ chối nhượng ô đất độc quyền cho người chơi đang dẫn đầu tài sản ròng.
   - Bot chấp thuận lời mời đổi đất từ người chơi khi có lợi về độc quyền hoặc tài sản ròng.
   - Bot từ chối khi lời mời đổi đất làm thâm hụt ngân sách an toàn (`safetyBuffer`).

3. **Facet 3: State Atomicity & Treasury Conservation (Tests 16-20)**:
   - Hoán đổi quyền sở hữu cả 2 ô đất diễn ra trong đúng 1 tick FSM nguyên tử.
   - Thuế kho bạc 5% tính chính xác trên `Math.abs(price)` khi có bù tiền.
   - Bảo toàn tài chính tuyệt đối: `deltaBalances + deltaTreasury === 0`.
   - Dọn sạch lịch sử từ chối (`cellTradeRejections`) cho cả 2 ô đất sau khi đổi thành công.
   - Cập nhật số dư chính xác cho cả 2 bên (bên chi bị trừ đủ, bên nhận được cộng tiền sau thuế).

4. **Facet 4: UI, Pacing & P2P Integration (Tests 21-24)**:
   - `PendingTradeSession` lưu trữ và chuyển giao đầy đủ `offeredCellIndex` qua WebSocket delta.
   - Giao diện `BotTradeOfferModal` hiển thị đối ứng 2 thẻ ô đất kèm trạng thái bù tiền và thuế.
   - Hết hạn 15s đàm phán tự động từ chối an toàn và ghi nhận cooldown.
   - Người chơi disconnect tự động hủy phiên đàm phán và giải phóng bot.

---

## 4. BẢNG CHỨNG CỨ KIỂM ĐỊNH TOÀN DIỆN (EVIDENCE AUDIT)

- **Unit/Contract Tests**: 24/24 tests PASS (`tests/contracts/imp146_p2p_property_swap_and_negotiation_parity.test.ts`).
- **Toàn bộ hệ thống test**: **268 test suites PASS, 5.518 tests PASS, 0 failures** (100% Zero Regressions).
- **TypeScript strict**: `npx tsc --noEmit` đạt **0 cảnh báo / 0 lỗi**.
- **UI Craft Linter**: `npm run lint:ui` đạt **0 vi phạm** trên 165 files (0 anti-patterns).
- **Slop Linter**: `npm run lint:slop` đạt **0 hard violations** trên 237 files (loại bỏ 100% dirty casts `as any`).
- **Trạm 3 Independent Reviews**:
  - `ui-craft-reviewer`: **SHIP** (100% WCAG AA, layout đối ứng 2 chiều cân đối, xúc giác phản hồi chuẩn).
  - `spec-reviewer`: **APPROVED** (100% spec reconciliation, 0 scope drift, bảo toàn bất biến tài chính).
- **Evidence Snapshot**: Đã lưu trữ định lượng tại `.agents/evidence/imp146_snapshot.json` (13 files, 3.915 LOC).
