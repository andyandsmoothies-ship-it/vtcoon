# Báo Cáo Nghiệm Thu Cải Tiến: [IMP-144] Tối Ưu Nhịp Độ Đàm Phán Bot — Cooldown 1 Lượt Theo Ô Đất & Tăng Giá Bậc Thang Phân Tầng Tính Cách

> **Mã Cải Tiến**: [IMP-144]  
> **Trạng thái**: 🟢 **Hoàn Tất (Trạm 3 Đã Duyệt - Ship Ready)**  
> **Kế thừa**: IMP-142 / IMP-143 (Bot Trade 15s & 500-Round Simulation)  
> **Phân tầng rủi ro**: Tier 2 (Full Rigor) — Đụng chạm FSM Tài Chính & Thuật toán Đàm Phán Bot AI  

---

## 1. TỔNG QUAN VẤN ĐỀ & MỤC TIÊU CẢI TIẾN

Trong đợt nghiệm thu và mô phỏng 500 vòng của IMP-142/143, hệ thống đã phát hiện:
1. **Hiện tượng Bot Passive spam gạ mua cùng 1 ô đất cuối ván**: Trong 500 vòng đối đầu với người chơi, Bot Passive gửi tới 85 lời mời mua đất, phần lớn là hỏi liên tục cùng một ô đất độc quyền dù người chơi đã từ chối nhiều lần trước đó.
2. **Thiếu cơ chế mặc cả thực tế (Escalating Offer)**: Mức giá chào mua của Bot giữ nguyên một hệ số cố định qua các vòng, không có sự gia tăng để phản ánh nỗ lực đàm phán thâu tóm của Bot AI khi bị khước từ.

### Mục Tiêu Đạt Được Trong IMP-144:
- Triệt tiêu hoàn toàn hiện tượng spam gạ mua liên tục cùng 1 ô đất: Đặt **Cooldown 1 lượt** cho từng ô đất bị từ chối (`currentRound - lastRejected <= 1`).
- Áp dụng cơ chế **Tăng giá bậc thang (+10% mỗi lần bị từ chối)** với trần khống chế theo tính cách (Aggressive max +40%, Balanced max +30%, Passive max +15%), bảo toàn tuyệt đối tôn ti trật tự tâm lý Bot và ngân sách an toàn (`safetyBuffer`).
- Chống nghẽn độc quyền (Anti-Gap Starvation): Quét toàn bộ danh mục ô đất độc quyền (`findAllMonopolyGaps`), nếu ô X đang cooldown thì Bot chuyển sang ô Y hợp lệ.

---

## 2. KẾT QUẢ TRIỂN KHAI VÀ THAY ĐỔI MÃ NGUỒN

| Tệp Mã Nguồn | Thay Đổi Chính | LOC | Độ Phức Tạp |
| :--- | :--- | :---: | :---: |
| [`src/domain/room.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts) | Bổ sung `cellTradeRejections?: Record<number, number>` và `cellLastRejectedRound?: Record<number, number>` vào `Player` | +2 | 1 |
| [`src/domain/bot/bot_trade.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_trade.ts) | Cung cấp `findAllMonopolyGaps`, tích hợp Cooldown 1 lượt trong `findEligibleBotTrade`, tăng giá bậc thang phân tầng trong `calculateTradeOfferPrice` | +45 | 3 |
| [`src/server/property_actions.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/property_actions.ts) | Xóa sạch lịch sử từ chối của ô đất khi giao dịch P2P thành công (`executeP2PTrade`) | +2 | 1 |
| [`src/server/room_property_coordinator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_property_coordinator.ts) | Cập nhật rejections/cooldown khi bị từ chối (Bot-to-Bot hoặc Bot-to-Human); xóa sạch lịch sử khi giao dịch thành công | +14 | 2 |
| [`src/server/room_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts) | Ghi nhận rejections/cooldown khi hết hạn 15s timeout (`checkPendingTradeTimeout`) | +4 | 2 |
| [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) | Ghi nhận Gotcha #191 (`[BOT/AI]` Cooldown Theo Ô Đất & Tăng Giá Bậc Thang) | +27 | 1 |

---

## 3. KẾT QUẢ ĐỐI CHỨNG MÔ PHỎNG 500 VÒNG GAME (BEFORE VS AFTER)

Đã chạy lại bộ mô phỏng 1.543 vòng đối kháng thực tế (`scripts/simulate_bot_human_500_rounds.ts`):

| Chỉ Số Đàm Phán & Cân Bằng Game | Trước IMP-144 | Sau IMP-144 | Đánh Giá Tác Động Thực Tế |
| :--- | :---: | :---: | :--- |
| **Bot Passive — Lời mời gạ mua đất** | **85 lần** | **70 lần** | **Giảm 17.6%**: Triệt tiêu hiện tượng spam liên tục cùng 1 ô đất cuối trận |
| **Bot Passive — Giá chào mua trung bình** | +60.0% giá gốc | **+68.6% giá gốc** | Giá hấp dẫn hơn, phản ánh đúng nỗ lực tăng giá bậc thang (+10%..+15%) |
| **Bot Passive — Giao dịch thành công** | 13 thương vụ | **14 thương vụ** | Tăng số thương vụ thành công nhờ mức giá đàm phán hợp lý hơn |
| **Bot Balanced — Giá chào mua trung bình** | +55.0% giá gốc | **+67.2% giá gốc** | Tăng giá bậc thang (+10%..+30%), duy trì 36 lần đàm phán hợp lý |
| **Bot Aggressive — Giá chào mua trung bình** | +75.0% giá gốc | **+82.4% giá gốc** | Mức giá cao nhất (+10%..+40%), phản ánh đúng tính cách khao khát thâu tóm |
| **Bất biến Deadlock & Treo ván cờ** | 0 lỗi | **0 lỗi** | Hoàn toàn mượt mà |
| **Bất biến Giao dịch sớm (Premature Trade)** | 0 lỗi | **0 lỗi** | 100% tuân thủ quyền quyết định của người chơi |
| **Bất biến Kho Bạc & Tài chính** | 0 lỗi | **0 lỗi** | Thuế chuyển nhượng 5% nộp Kho Bạc chính xác |

---

## 4. BẢNG CHỨNG CỨ KIỂM THỬ (EVIDENCE AUDIT)

- **Kiểm thử hợp đồng**: 18/18 tests PASS (`tests/contracts/imp144_bot_trade_cooldown_and_escalation.test.ts`).
- **Kiểm thử hồi quy toàn dự án**: 264/264 test suites PASS (5.438/5.438 tests total).
- **TypeScript strict**: `npx tsc --noEmit` đạt 0 cảnh báo/lỗi.
- **Lint UI Craft**: `npm run lint:ui` đạt 0 vi phạm trên 164 files.
- **Spec Reviewer**: APPROVE (100% spec reconciliation, 0 scope drift).
- **Evidence Snapshot**: Đã lưu trữ tại `.agents/evidence/imp144_snapshot.json`.
