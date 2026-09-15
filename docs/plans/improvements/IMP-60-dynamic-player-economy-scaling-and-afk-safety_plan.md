# [IMP-60] Dynamic Player Economy Scaling, Pacing Normalization & Fail-Safe Auto-Action Alignment

## 1. Bối cảnh & Mục tiêu

Qua quá trình thực chiến và kiểm tra nhật ký trận đấu, hệ thống kinh tế và tự động hóa lượt chơi bộc lộ 5 xung đột và bất cập lớn:
1. **Thiếu hụt thanh khoản trầm trọng**: Mức vốn 15.000 Tr. cào bằng cho cả 2, 3 và 4 người chơi không đủ để hoàn thành 30 vòng. Người chơi mua 3-5 ô đất là cạn tiền, không thể xây nhà C1-C3. Đặc biệt ở bàn 2 người, mỗi người phải gánh 14 ô đất (~28.450 Tr.) khiến trận đấu bị tắc nghẽn từ vòng 4.
2. **Nghịch lý Thuế qua GO nuốt tiền thưởng**: Người sở hữu từ 7 ô đất trở lên bị trừ thuế GO tới 2.800 Tr., khiến tiền thưởng GO (+2.000 Tr.) bị âm (-800 Tr.), càng mua nhiều đất càng nghèo tiền mặt.
3. **Nghịch lý "Thấu chi 3 vòng" vs Ép Phá Sản sau 25s**: Khi người chơi âm tiền tạm thời (-530 Tr.) nhưng có tài sản ròng lớn (16.070 Tr.), nếu Idle 25 giây, Server tự động phát lệnh `INTENT_BANKRUPTCY` xóa sổ người chơi thay vì tự động Thế Chấp (Mortgage) tài sản để cứu người chơi.
4. **Nhịp thở thời gian quá gấp (15s - 25s)**: Quá ngắn cho một game cờ tỷ phú 3D có nhiều thông số và bảng giá.
5. **Nút `[⏱️ Tự Động]` trên TopBar gây hiểu nhầm**: Người chơi tưởng là chế độ Bot đánh hộ (Auto-Play) trong khi thực chất là đổi ánh sáng Ngày/Đêm.

Mục tiêu của kế hoạch này là giải quyết triệt để 5 vấn đề trên thông qua bộ quy tắc kinh tế động và cơ chế tự động hóa an toàn.

---

## 2. Các thay đổi kỹ thuật đề xuất (Proposed Changes)

### Component 1: Mô hình kinh tế động & Trần thuế GO (Domain Layer)

#### [MODIFY] [room.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts)
- Thay thế hằng số cố định `INITIAL_BALANCE = 15_000` bằng hàm tính vốn động theo số người chơi:
  ```ts
  export const INITIAL_BALANCE_BY_PLAYERS: Readonly<Record<number, number>> = {
    2: 25_000,
    3: 20_000,
    4: 18_000,
  };

  export function getInitialBalanceForPlayerCount(playerCount: number): number {
    if (playerCount <= 2) return INITIAL_BALANCE_BY_PLAYERS[2]!;
    if (playerCount === 3) return INITIAL_BALANCE_BY_PLAYERS[3]!;
    return INITIAL_BALANCE_BY_PLAYERS[4]!;
  }
  ```
- Duy trì fallback `INITIAL_BALANCE = 18_000` để bảo tồn tương thích ngược.

#### [MODIFY] [property_rent.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_rent.ts)
- Cập nhật hàm `calculateGoPropertyTax`:
  - Áp dụng trần thuế GO: `tax = Math.min(calculatedTax, Math.floor(GO_BONUS * 0.50))` (tối đa 1.000 Tr.).
  - Đảm bảo dòng tiền ròng thực nhận khi vượt qua ô GO luôn dương tối thiểu **`+1.000 Tr.`** (`2.000 Tr. - 1.000 Tr. = +1.000 Tr.`).

---

### Component 2: Khởi tạo phòng & Quản lý máy chủ (Server Layer)

#### [MODIFY] [room_manager.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts) & [room_bot_manager.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_bot_manager.ts)
- Khi bắt đầu trận đấu (`handleStartGame`), cập nhật lại số dư ban đầu của tất cả người chơi trong phòng theo số lượng người tham gia thực tế:
  - 2 người chơi: Cấp vốn **25.000 Tr.** / người.
  - 3 người chơi: Cấp vốn **20.000 Tr.** / người.
  - 4 người chơi: Cấp vốn **18.000 Tr.** / người.

---

### Component 3: Bộ điều phối nhịp thở & Cứu nguy AFK an toàn (Server Network Layer)

#### [MODIFY] [turn_orchestrator.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/turn_orchestrator.ts)
1. **Nới lỏng nhịp thở thời gian (`PHASE_TIMEOUTS_MS`)**:
   - `WaitingRoll`: Tăng từ 15s -> **25 giây**.
   - `ActionPhase`: Tăng từ 20s -> **35 giây**.
   - `HosePhase`: Tăng từ 15s -> **25 giây**.
   - `PropertyManagement`: Tăng từ 20s -> **30 giây**.
   - `AuctionPhase`: Tăng từ 15s -> **20 giây**.
   - `InsolvencyPhase`: Tăng từ 25s -> **45 giây**.
2. **Cơ chế Cứu nguy tự động 2 bước tại `InsolvencyPhase` (`executeSafeAfkAction` / `executeEmergencyRecovery`)**:
   - Thay vì gọi ngay `INTENT_BANKRUPTCY`, hệ thống thực hiện giải pháp bảo vệ tài sản 2 bước:
     - **Bước 1**: Tự động tìm các ô đất có công trình (`level > 0`), hạ cấp công trình từng bước (`stepByStep: true`) tuân thủ Even-Downgrade để nhận hoàn lại 50% chi phí xây dựng. Nếu số dư `>= 0`, bảo toàn quyền sở hữu và không thế chấp.
     - **Bước 2**: Nếu sau khi hạ cấp toàn bộ công trình về C0 mà số dư vẫn `< 0`, duyệt danh sách các ô đất chưa thế chấp theo giá rẻ nhất tăng dần và gọi `handleMortgage` để nhận 50% tiền vay cho đến khi số dư `>= 0`.
     - Chỉ khi toàn bộ công trình đã hạ cấp về 0 VÀ toàn bộ đất đã thế chấp hết mà số dư vẫn âm, hệ thống mới gọi `INTENT_BANKRUPTCY`.

#### [MODIFY] [turn_watchdog.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/turn_watchdog.ts)
- Cập nhật cơ chế phục hồi khẩn cấp tương tự tại `executeEmergencyRecovery` cho `InsolvencyPhase`: Tự động thế chấp tài sản cứu nguy trước khi xử lý phá sản.

---

### Component 4: Giao diện người dùng & Đồng bộ Timer (Client Layer)

#### [MODIFY] [top_bar.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/top_bar.tsx)
- Đổi icon nút từ `⏱️` sang `☀️/🌙` hoặc `🌤️`.
- Đổi nhãn từ `"Tự Động"` sang `"Ánh Sáng: Tự Động"` (hoặc tooltip rõ ràng: `"Chu kỳ ánh sáng 3D: Tự động đổi Ngày/Đêm"`), triệt tiêu hoàn toàn sự nhầm lẫn với chế độ Auto-Play.

#### [MODIFY] [main.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/main.tsx)
- Khắc phục Race Condition: Khi `turnTimeRemaining === 0`, Client không tự phát intent kép nếu đang có kết nối WebSocket với Server. Quyền điều phối AFK thuộc về Server `TurnOrchestrator` (nguồn chân lý duy nhất).
- Đảm bảo đồng bộ số dư khởi điểm 25.000 / 20.000 / 18.000 Tr. khi khởi tạo phòng offline hoặc lúc nhận `ROOM_STARTED`.

#### [MODIFY] [player_card.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/player_card.tsx)
- Làm rõ hiển thị trạng thái Thấu Chi: Hiển thị thời gian đếm ngược thực tế của pha xử lý nợ hoặc số vòng còn lại theo đúng dữ liệu server.

---

## 3. Kế hoạch Kiểm thử & Xác minh (Verification Plan)

### Automated Tests (Trạm 1 RED Test Suite)
- **Tạo tệp test mới**: `tests/contracts/imp60_dynamic_economy_and_afk_safety.test.ts`
  1. *Dynamic Balance Contract*:
     - Phòng 2 người: Tất cả người chơi khởi đầu với đúng 25.000 Tr.
     - Phòng 3 người: Tất cả người chơi khởi đầu với đúng 20.000 Tr.
     - Phòng 4 người: Tất cả người chơi khởi đầu với đúng 18.000 Tr.
  2. *GO Property Tax Cap Contract*:
     - Người chơi sở hữu 8 ô đất + 4 nhà C2 khi qua GO: Thuế bị chặn trần ở 1.000 Tr. (50% GO_BONUS).
     - Số dư ròng sau khi qua GO luôn tăng tối thiểu +1.000 Tr.
  3. *AFK Auto-Mortgage Rescue Contract*:
     - Người chơi có 2 ô đất, số dư bị âm -500 Tr., hết giờ ở `InsolvencyPhase`.
     - `TurnOrchestrator` tự động thế chấp 1 ô đất, đưa số dư về dương mà KHÔNG phát lệnh phá sản.
     - Người chơi vẫn tiếp tục ván đấu bình thường.
  4. *Pacing Timeouts Contract*:
     - Kiểm tra hằng số `PHASE_TIMEOUTS_MS` đạt chuẩn: WaitingRoll 25s, ActionPhase 35s, InsolvencyPhase 45s...
  5. *UI TopBar Anti-Confusion Contract*:
     - Nút chu kỳ ánh sáng không chứa label gây nhầm "Tự Động" đơn lẻ.

### Verification Commands
```cmd
cmd /c "npx vitest run tests/contracts/imp60_dynamic_economy_and_afk_safety.test.ts"
cmd /c "npm run gate:quick"
```

---

## 4. User Review Required

> [!IMPORTANT]
> - Mức phân bổ vốn mới: **25.000 Tr. (2 người)**, **20.000 Tr. (3 người)**, **18.000 Tr. (4 người)**.
> - Thuế tài sản ô GO sẽ có trần tối đa **1.000 Tr.** (50% của 2.000 Tr. tiền GO), loại bỏ hiện tượng bị trừ âm tiền khi qua ô GO.
> - Thời gian suy nghĩ mua đất tăng lên **35 giây**, thời gian xử lý nợ tăng lên **45 giây**.
> - Khi hết giờ trong trạng thái âm tiền, hệ thống sẽ **tự động thế chấp ô đất rẻ nhất** để cứu người chơi, không ép phá sản nếu người chơi còn đất.
