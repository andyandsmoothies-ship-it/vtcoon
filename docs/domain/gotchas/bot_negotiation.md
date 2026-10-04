# PILLAR III: ĐÀM PHÁN & TRÍ TUỆ NHÂN TẠO BOT (BOT NEGOTIATION & VALUATION)

> **Scope**: `src/domain/bot/`, `src/domain/p2p_trade.ts`, `src/domain/property_valuation.ts`

---

1. **Multi-Agent Harassment Guard**: Trong giao dịch P2P, cooldown đề xuất bắt buộc phải được áp dụng ở phạm vi Mục Tiêu / Phòng (`room.lastTargetTradeOfferRound`), không chỉ ở phạm vi Tác tử (Actor), ngăn chặn triệt để tình trạng $N$ bot cùng spam đề xuất đổi đất tới 1 người chơi trong 1 vòng.
2. **Surplus Property & Bilateral Valuation**: Đề xuất đổi đất của Bot phải dựa trên đất thặng dư (Surplus Properties - đất đơn lẻ không thể tạo độc quyền do đối thủ đã chặn) kết hợp 3 trục: (a) Độ lệch giá gốc; (b) Giá trị giúp đối tác hoàn tất độc quyền xây nhà (`partnerGetsMonopoly`); (c) Tính cách Bot (Aggressive, Balanced, Passive).
3. **Leader Embargo Invariant**: Bot có trí tuệ chiến lược từ chối nhượng ô đất giúp người chơi đang dẫn đầu phòng (`isLeadingPlayer`) hoàn thành độc quyền màu, trừ khi nhận lại gói giá trị cực kỳ áp đảo.
4. **Instant Bot Coordination**: Khi người thật gửi đề xuất giao dịch cho Bot, Server bắt buộc phải xử lý định giá và phản hồi đồng bộ tức thì 0ms (`pending: false`), tuyệt đối không mở modal đếm ngược 15s chờ Bot.
5. **Bot Action Pacing & Visual Feedback Hardening Invariant [IMP-219]**:
   - **Nhịp Thở Nâng Cấp Công Trình**: Sau khi Bot nâng cấp công trình (`nextLevelSum > prevLevelSum`), bước kế tiếp bắt buộc được cấp độ trễ tối thiểu `BOT_UPGRADE_OBSERVATION_DELAY_MS = 1500ms`. Cờ `botJustUpgraded` tự dọn dẹp trong `scheduleBotStep` và TUYỆT ĐỐI KHÔNG được xóa trong `clearRoom` (do `orchestrate` gọi `clearRoom` ở đầu mỗi bước), chỉ giải phóng trong `destroyRoom` để chống bẫy xóa sớm.
   - **Phân Tách P2P Trade vs Ghost Rent**: Khi chuyển nhượng ô đất P2P giữa 2 người chơi/bot, `detectCellTrade` bắt buộc gán `type: 'trade'`, `targetPlayerId`, `targetPlayerName`. Bộ điều phối tài chính `detectFinancialAndStatusActivities` bắt buộc đưa `buyerId` và `prevOwnerId` vào `handledPayerIds`/`handledReceiverIds` TRƯỚC KHI gọi `matchRentTransactions` để triệt tiêu hoàn toàn lỗi nhận nhầm tiền mua đất thành tiền thuê nhà (Ghost Rent).
   - **HOSE Deduplication SSOT**: Sự kiện HOSE gán `type: 'hose'` và quản lý khóa chống trùng lặp `${hr.playerId}_${hr.timestamp}_${hr.roll}` qua `lastProcessedHoseKey`, cung cấp `resetHoseActivityTracker` cho kiểm thử và phòng chơi mới.
   - **Bot Bỏ Qua Đất ➔ Mở Đấu Giá**: Khi Bot dẫm ô đất trống và từ chối mua (`declinedPlayerId`), hệ thống phát log `decline_auction` trừ trường hợp phát mãi nợ (`!isForeclosure && !insolvencyPlayerId`).
6. **1v1 Competitive Duel Asymmetry & Inviolable Monopoly Defense [IMP-236]**:
   - **Cash Abundance Late-Game Purchase Override**: Trong thế trận đối kháng (`room?.started && activePlayers <= 2`), khi Bot có lượng tiền mặt dồi dào (`balance >= basePrice * 2.5 && balance - basePrice >= threat.safetyBuffer`) và không có `manualRoll` ghi đè, Bot Balanced/Aggressive được giải phóng hoàn toàn khỏi hình phạt giảm tốc `pacingFactor < 1.0` ở late-game (`round > 20`), tiếp tục mua đất củng cố vị thế mà không phá vỡ logic từ chối mua đất ở bàn thông thường.
   - **Infrastructure Denial Parity**: Hệ thống định giá phòng thủ mở rộng nhận diện đe dọa Cảng (`Railroad`: đối thủ giữ $\ge 2$ cảng được nâng hệ số chặn lên 1.15x – 1.5x) và Tiện ích (`Utility`: đối thủ giữ 1 ô kích hoạt chặn ô thứ 2), triệt tiêu điểm mù chỉ nhắm vào đất màu (`colorGroup`).
   - **Dynamic Duel Denial Ceiling**: Trong thế trận 1v1 (`activePlayers <= 2`), trần đấu giá chặn độc quyền nâng lên 2.8x (Aggressive) và 2.2x (Balanced), đồng thời nới lỏng hệ số định giá 1.2x late-game; trong P2P Trade, Bot cấm tuyệt đối bán đứt ô đất tạo độc quyền cho đối thủ lấy tiền mặt (`PREVENT_MONOPOLY`).
7. **`formatLocalizedBotPersonality` vs `formatShortPlayerName` [IMP-238]**:
   - **Bẫy Nguy Hiểm**: Cả hai hàm đều có signature `(name: string) => string`. TypeScript không cảnh báo khi thay thế. Tuy nhiên output category hoàn toàn khác:
     - `formatLocalizedBotPersonality("Thành (Aggressive)")` → `"Thành (Tấn Công)"` ← **dịch nhãn, còn hiển thị**
     - `formatShortPlayerName("Thành (Aggressive)")` → `"Thành"` ← **xóa nhãn hoàn toàn**
   - **Bất Biến**: `formatLocalizedBotPersonality` dùng trong UI khi cần **dịch và giữ nhãn** (display context). `formatShortPlayerName` dùng khi cần **xóa nhãn để chống co cụt** (compact display context). KHÔNG được dùng thay thế cho nhau mà không khai báo rõ design intent. `[UI/FORMATTER]`
