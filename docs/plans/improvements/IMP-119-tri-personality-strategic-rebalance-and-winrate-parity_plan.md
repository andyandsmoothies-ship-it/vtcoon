# KẾ HOẠCH CẢI TIẾN IMP-119: TÁI THIẾT LẬP CHIẾN LƯỢC RIÊNG BIỆT & CÂN BẰNG TỶ LỆ THẮNG GIỮA 3 LOẠI BOT AI (TRI-PERSONALITY STRATEGIC PARITY)

> **Mã cải tiến**: IMP-119 (Tri-Personality Strategic Parity & Bot Balance Overhaul)  
> **Căn cứ yêu cầu**: Yêu cầu người dùng ngày 2026-09-17 (3 loại bot phải có chiến lược riêng để tỷ lệ thắng xấp xỉ nhau)  
> **Trạng thái**: 🟡 **CHỜ PHÊ DUYỆT (PENDING APPROVAL)**  

---

## 1. TỔNG QUAN VẤN ĐỀ & PHÂN TÍCH NGUYÊN NHÂN KỸ THUẬT

Dữ liệu thực nghiệm từ 3.900 ván đấu headless (`npx tsx scripts/benchmark_gameplay_trends.ts --deep`) cho thấy sự lệch pha nghiêm trọng:
- **Bot Balanced**: Thắng 48.0% (bàn 2P), 65.7% (bàn 3P 2 Bal), 73.0% (bàn 4P 3 Bal), 33.0% (bàn 4P hỗn hợp).
- **Bot Aggressive**: Thắng 52.7% (bàn 2P, thắng cả Người), 65.3% (bàn 3P 2 Aggr), 73.0% (bàn 4P 3 Aggr), 21.7% (bàn 4P hỗn hợp).
- **Bot Passive**: Chỉ thắng **24.0%** (bàn 2P), **19.7%** (bàn 3P), và đặc biệt chỉ thắng **3.0%** trong bàn 4P hỗn hợp (Human + Pass + Bal + Aggr).

### 5 Lỗi Cốt Lõi Khiến Bot Passive Tự Sát & Thất Bại:
1. **Lỗi cấm xây nhà (`canUpgradeCell` trong `bot_engine.ts`)**:
   - Mã nguồn hiện tại: `if (personality === BotPersonality.Passive) return bot.balance >= upgradeCost * 3 && dangerTilesCount === 0 && bot.balance - upgradeCost >= safetyBuffer;`
   - Điều kiện `dangerTilesCount === 0` (không có ô nguy hiểm nào trong vòng 2-12 bước) trong bàn 4 người hầu như **không bao giờ thỏa mãn**. Kết quả là Bot Passive hầu như không bao giờ xây nhà C1..C3 dù có bộ màu và dư dả tiền mặt.
2. **Lỗi bỏ qua đất vàng (`decidePassiveActionIntent` trong `bot_engine.ts`)**:
   - `const isCheap = basePrice <= 1500;` nếu không phải đất rẻ thì từ chối mua trừ khi tiền mặt gấp 3 lần giá đất. Khiến Bot Passive bỏ qua toàn bộ đất có giá trị cao ở nửa sau bàn cờ.
3. **Lỗi bán rẻ đất độc quyền cho đối thủ (`evaluateBotTradeAcceptance` trong `bot_trade.ts`)**:
   - `if (offerPrice >= Math.round(1.35 * basePrice)) return { accept: true };`
   - Ngay cả khi ô đất giúp đối thủ hoàn thiện độc quyền (`givesMonopolyToBuyer === true`), Bot Passive vẫn bán chỉ với giá 1.35x. Biến Bot Passive thành "mồi ngon cấp độc quyền miễn phí" cho Bot Balanced và Aggressive.
4. **Lỗi chào mua giá quá thấp không ai bán (`calculateTradeOfferPrice` trong `bot_trade.ts`)**:
   - Bot Passive chỉ trả 1.35x khi mua ô độc quyền cho mình. Trong khi Bot Aggressive đòi >= 1.75x và Balanced đòi >= 1.50x. Kết quả là Bot Passive không bao giờ mua được ô độc quyền từ ai.
5. **Lỗi bỏ cuộc đấu giá quá sớm (`isPassiveAuctionAllowed` trong `bot_auction.ts`)**:
   - Chỉ trả giá đấu giá tối đa 1.15x giá gốc, để mặc đối thủ hốt sạch các tài sản đấu giá.

---

## 2. THIẾT KẾ 3 TRƯỜNG PHÁI CHIẾN LƯỢC RIÊNG BIỆT

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   3 TRƯỜNG PHÁI CHIẾN LƯỢC RIÊNG BIỆT                    │
├──────────────────────┬──────────────────────┬────────────────────────────┤
│   BOT AGGRESSIVE     │     BOT BALANCED     │        BOT PASSIVE         │
│   (High-Roller)      │   (Value Investor)   │   (Defensive Capitalist)   │
├──────────────────────┼──────────────────────┼────────────────────────────┤
│ • Chiến thuật: Đột   │ • Chiến thuật: Tối   │ • Chiến thuật: Pháo đài    │
│   phá nhanh (Blitz)  │   ưu hóa danh mục    │   tiền mặt & Dòng tiền bền │
│ • Ngân sách đệm mỏng │ • Ngân sách đệm vừa  │ • Ngân sách đệm dày        │
│   (250 Tr.)          │   (400 Tr.)          │   (500 - 600 Tr.)          │
│ • Tập trung nhóm màu │ • Đa dạng hóa màu sắc│ • Thâu tóm Hạ tầng, Tiện   │
│   giá rẻ & trung bình│   (Xanh lá, Xanh đậm)│   ích (Ga, Bến, Điện, Nước)│
│ • Xây C1..C3 thần tốc│ • Xây dựng cân đối   │ • Xây C1..C2 vững chắc khi │
│   ngay khi đủ bộ     │   theo dòng tiền     │   bảo đảm 120% đệm an toàn │
│ • P2P: Trả 1.75x để  │ • P2P: Trả 1.55x mua │ • P2P: Trả 1.60x chốt độc  │
│   cướp độc quyền; đòi│   và bán 1.50x; chống│   quyền; CHẶN ĐỐI THỦ ĐỘC  │
│   1.75x mới nhả đất  │   Kingmaking         │   QUYỀN (chỉ bán nếu >=2.0x│
│ • Thắng bằng Knockout│ • Thắng bằng Điểm    │ • Thắng bằng Bào mòn tiền  │
│   sớm (Vòng 5 - 20)  │   Tài sản ròng (V30+)│   thuê & Tích lũy (V30-40) │
└──────────────────────┴──────────────────────┴────────────────────────────┘
```

---

## 3. CÁC NỘI DUNG SỬA ĐỔI CHI TIẾT

### 1. `src/domain/bot/bot_engine.ts`
- **Sửa `canUpgradeCell`**: Bỏ `dangerTilesCount === 0`. Với Bot Passive: chỉ cần `bot.balance - upgradeCost >= safetyBuffer * 1.2` để cho phép xây nhà C1..C2 kiên cố bảo vệ dòng tiền.
- **Sửa `decidePassiveActionIntent`**: Bỏ `basePrice <= 1500`. Cho phép mua các ô đất giá trị cao nếu đủ an toàn tài chính. Ưu tiên đặc biệt cho các ô Hạ tầng và Tiện ích.

### 2. `src/domain/bot/bot_trade.ts`
- **Sửa `evaluateBotTradeAcceptance`**:
  + Nếu `givesMonopolyToBuyer === true`: Bot Passive từ chối bán trừ khi nhận giá >= 2.0x và `balance < 500`. Chặn 100% việc bán rẻ đất độc quyền cho đối thủ.
  + Nếu không mang lại độc quyền cho đối thủ: Bán ở mức giá hợp lý >= 1.40x.
- **Sửa `calculateTradeOfferPrice`**:
  + Khi chào mua ô độc quyền cho mình (`isMonopolyGap === true`): Bot Passive sẵn sàng trả **1.60x** giá gốc (thay vì 1.35x), đủ sức thuyết phục Bot Balanced (đòi 1.50x) và Bot Aggressive kẹt tiền (đòi 1.55x) đồng ý nhượng đất.

### 3. `src/domain/bot/bot_auction.ts`
- **Sửa `isPassiveAuctionAllowed`**: Nâng trần đấu giá của Bot Passive lên 1.35x cho ô Hạ tầng/Tiện ích và 1.50x cho ô mảnh ghép độc quyền (`monopolyScore >= 1.6`).

### 4. `src/domain/bot/bot_types.ts`
- Tinh chỉnh nhẹ `minBuffer` của Bot Aggressive từ 200 lên 250 Tr. và `riskMultiplier` từ 0.6 lên 0.65 để hạn chế việc tự vỡ nợ sớm.

---

## 4. KẾ HOẠCH KIỂM THỬ & CHỈ SỐ MỤC TIÊU

1. **Trạm 1 (RED Contract Tests)**: Tạo `tests/contracts/imp119_bot_strategic_parity.test.ts` (16 tests chứng minh các hành vi mới).
2. **Trạm 2 (GREEN Implementation)**: Triển khai mã nguồn tối thiểu để 100% tests PASS.
3. **Trạm 3 (Physical Disk & Deep Simulation)**:
   - Chạy 3.900 ván headless (`npx tsx scripts/benchmark_gameplay_trends.ts --deep`).
   - Mục tiêu định lượng:
     + Bàn 3P Hỗn hợp (Pass + Bal + Aggr): Tỷ lệ thắng 3 loại Bot nằm trong biên độ **25% - 40%** (xấp xỉ ngang nhau).
     + Bàn 4P Đa dạng: Bot Passive tăng từ 3.0% lên tối thiểu **15% - 25%**.
     + Bàn 2P (Human + Passive): Bot Passive tăng từ 24.0% lên **35% - 45%**.
