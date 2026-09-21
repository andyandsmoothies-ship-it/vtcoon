# IMP-154 Report: Auction Pass State Persistence & Compulsory Buyout Deadlock Resolution

**Trạng thái**: 🟢 **Hoàn Tất (100% PASS - Trạm 3 Đã Duyệt)**  
**Ngày hoàn thành**: 2026-09-21  
**Phạm vi**: Khắc phục lỗi đấu giá lặp nút rút lui & Deadlock thẻ Mua Lại Dự Án (`CC_SWAP_PROJECT`) từ log thực tế

---

## 1. Kết Quả Thực Thi 3 Trạm

| Trạm | Phụ Trách | Kết Quả | Bằng Chứng |
| :--- | :--- | :--- | :--- |
| **Trạm 1: RED Contract Tests** | `qa-tester` | 12 FAIL / 9 PASS / 21 Total (Xác nhận 100% Business RED) | [`tests/contracts/imp154_...test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp154_auction_pass_and_buyout_deadlock.test.ts) |
| **Trạm 2: GREEN Implementation** | `implementer` | 21/21 Contract Tests PASS, 18/18 Regression PASS, 0 TS Err, 0 UI Lint | [`.agents/evidence/imp154_snapshot.txt`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp154_snapshot.txt) |
| **Trạm 3: Independent Review** | `spec-reviewer` & `code-reviewer` | APPROVED / APPROVED (2 phán quyết độc lập) | Transcript `9c8af95d` & `60597e22` |

---

## 2. Chi Tiết Thay Đổi Mã Nguồn

| Tệp Tin | Loại Thay Đổi | Chi Tiết Kỹ Thuật |
| :--- | :--- | :--- |
| `src/server/security/envelope_validator.ts` | Server Security | Bổ sung `INTENT_EXECUTE_COMPULSORY_BUYOUT`, `INTENT_DECLINE_COMPULSORY_BUYOUT` vào `VALID_INTENTS`, xác thực `cellIndex` |
| `src/server/security/intent_guard.ts` | Turn Ownership | Cấp phép trong `isPhaseSpecificAllowed` khi `pendingBuyout.buyerId === playerId` |
| `src/server/network/turn_watchdog.ts` | Turn Watchdog | Bổ sung auto-timeout `checkPendingBuyoutTimeout` trong `checkRoom` và hủy session trong `executeEmergencyRecovery` |
| `src/server/session_manager.ts` | Protocol & Delta | Bổ sung `passedPlayerIds` vào `AuctionDelta`, truyền mảng rút lui từ `session.passedPlayers` |
| `src/client/store/game_store_types.ts` | Client Types | Cập nhật `AuctionPayload` hỗ trợ `passedPlayerIds?: readonly string[]` |
| `src/client/network/apply_delta.ts` | Client Sync | Bảo lưu `hasPassed: true` khi nhận `delta.auction` mới nếu đã rút lui hoặc có tên trong `passedPlayerIds` |
| `docs/domain/gotchas.md` | Domain Memory | Bổ sung Gotcha #215 `[FSM/RULE][NET/SYNC]` ghi nhớ 2 bất biến sống còn |

---

## 3. Bài Học & Ràng Buộc Cứng (Gotcha #215)

1. **Security Whitelist Parity Invariant**: Bất kỳ Intent mới nào được định nghĩa trong FSM (`intent_dispatcher.ts`) BẮT BUỘC phải được đăng ký đồng thời vào `VALID_INTENTS` (`envelope_validator.ts`) và `isPhaseSpecificAllowed` (`intent_guard.ts`). Không được phép bỏ sót khiến lệnh từ client bị vứt bỏ ngầm.
2. **Watchdog Dual-Disposal Invariant**: Mọi phiên giao dịch/sự kiện có giới hạn thời gian (P2P Trade 15s, Compulsory Buyout 15s) BẮT BUỘC phải được dọn dẹp ở cả 2 điểm:
   - Quét dọn tự động định kỳ trong `TurnWatchdog.checkRoom`.
   - Cưỡng chế dọn dẹp trước khi force-advance trong `TurnWatchdog.executeEmergencyRecovery`.
3. **Modal State Preservation Invariant**: Khi Server phát sóng Delta mới cho Modal đang mở (`delta.auction`), Client không được ghi đè mù quáng làm mất trạng thái tương tác cục bộ của người dùng (`hasPassed`).
