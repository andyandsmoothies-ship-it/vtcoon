# IMP-66 — WSS Zero Cross-Talk E2E Test Report

**Ngày hoàn thành**: 2026-09-15  
**Trạng thái**: ✅ COMPLETE  
**Kế hoạch**: [`docs/plans/improvements/IMP-66-wss_zero_cross_talk_e2e_plan.md`](../plans/improvements/IMP-66-wss_zero_cross_talk_e2e_plan.md)  
**File kiểm thử**: [`tests/server/net05_zero_cross_talk.test.ts`](../../../tests/server/net05_zero_cross_talk.test.ts)

---

## 1. Mục tiêu & Bối cảnh

Hệ thống VTCOON quản lý đa phòng chơi dựa trên kiến trúc phân tách phòng:
- `SocketRegistry` băm theo `roomCode`
- `WssServer.broadcast()` chỉ gửi cho các client cùng `roomCode`
- `IntentMutex` khóa tuần tự độc lập theo từng phòng

Trước đây, tính cách ly đa phòng đã được kiểm thử ở tầng `RoomManager` (`tests/stress/ops01_concurrent_rooms.test.ts` với 100 phòng). Tuy nhiên, hệ thống còn thiếu bài kiểm thử tích hợp E2E trên socket TCP/WebSocket thật chạy qua vòng lặp mạng thực tế để đo lường định lượng và chứng minh không có bất kỳ gói tin rò rỉ nào (Zero Cross-Talk) giữa các phòng độc lập.

Gói cải tiến **IMP-66** thiết lập bộ kiểm định đối kháng E2E này.

---

## 2. Thiết kế Kỹ thuật & Helper Cốt Lõi

Để đo lường định lượng số packet rò rỉ mà không làm fail test bằng timeout giả, bộ test triển khai hàm thu thập định thời:

```typescript
function collectForMs(socket: WebSocket, ms: number): Promise<WsServerMessage[]> {
  return new Promise((resolve) => {
    const msgs: WsServerMessage[] = [];
    const onMsg = (data: Buffer | string): void => {
      msgs.push(JSON.parse(data.toString()) as WsServerMessage);
    };
    socket.on('message', onMsg);
    setTimeout(() => {
      socket.off('message', onMsg);
      resolve(msgs);
    }, ms);
  });
}
```

- Khác với `collectN()` (reject khi không đủ N gói tin sau timeout), `collectForMs()` lắng nghe trong `ms` mili-giây và gom tất cả gói tin đến.
- Nếu không có gói tin nào rò rỉ, mảng trả về rỗng `[]`.
- Khẳng định cốt lõi: `expect(leakedPackets).toHaveLength(0)`.

---

## 3. Các Kịch Bản Kiểm Thử Đã Triển Khai (`net05_zero_cross_talk.test.ts`)

| Mã Test Case | Tên Kịch Bản | Hành Động & Khẳng Định Cốt Lõi | Kết Quả |
| :--- | :--- | :--- | :---: |
| **TC-NET05.1/MSS** | Room A broadcast STATE_DELTA không rò rỉ sang Room B | Host A gửi `INTENT_ROLL`. Guest A nhận `STATE_DELTA`. Cả Host B và Guest B lắng nghe 600ms, nhận chính xác 0 packet rò rỉ (`toHaveLength(0)`). | ✅ PASS (656ms) |
| **TC-NET05.2/MSS** | Room B broadcast PLAYER_EMOTE không rò rỉ sang Room A (đảo ngược) | Guest B gửi biểu cảm `EMOTE`. Host B nhận `PLAYER_EMOTE`. Cả Host A và Guest A lắng nghe 600ms, nhận chính xác 0 packet rò rỉ (`toHaveLength(0)`). | ✅ PASS (626ms) |
| **TC-NET05.3/Adversarial** | Hai phòng gửi intent đồng thời qua `Promise.all` | Cả Room A và Room B gửi `INTENT_ROLL` đồng thời qua `Promise.all`. Khóa tuần tự per-room mutex xử lý song song độc lập. Mỗi phòng nhận đúng delta của mình; không có packet chéo phòng. | ✅ PASS (746ms) |
| **TC-NET05.4/Adversarial** | Đóng hoàn toàn Room A — Room B tiếp tục nhận broadcast bình thường | Đóng tất cả WebSocket của Room A. Room B gửi `INTENT_ROLL` và Guest B nhận `STATE_DELTA` bình thường. Không rò rỉ lỗi hay treo kết nối. | ✅ PASS (167ms) |

---

## 4. Các Vấn Đề Phát Hiện & Hiệu Chỉnh Trong Quá Trình Kiểm Thử

Trong quá trình thực thi trạm đỏ/xanh, 3 bẫy kỹ thuật thực tế đã được phát hiện và xử lý:

1. **Chuẩn hóa Client Message Type**:
   - Khởi đầu test gửi `{ type: 'SEND_EMOTE' }`.
   - `EnvelopeValidator` của server từ chối vì schema quy định `type: 'EMOTE'` (`WsClientMessage`).
   - Khắc phục: Chuẩn hóa payload sang `type: 'EMOTE'`.

2. **Khử Nhiễu Bot Turn Scheduler**:
   - `WssServer` mặc định có `botTurnDelayMs = 1500ms`. Trong kịch bản có bot, bot timer tự động nổ và kích hoạt broadcast của chính phòng đó trong lúc cửa sổ `collectForMs` đang đo.
   - Khắc phục: Khởi tạo test server với `botTurnDelayMs: 30_000` trong môi trường test cô lập, loại bỏ hoàn toàn nhiễu từ bot scheduling.

3. **Xả Hàng Đợi (Queue Draining) Sau Broadcast `START_GAME`**:
   - `handleStartGame` phát `ROOM_STARTED + STATE_DELTA` tới **tất cả** socket trong phòng (cả host lẫn guest).
   - Nếu helper `setupRoom` chỉ thu thập ở socket host mà bỏ quên socket guest, các gói tin chưa đọc tồn đọng trong bộ đệm của socket guest sẽ bị `collectForMs` ở test sau đọc nhầm là packet rò rỉ.
   - Khắc phục: `setupRoom` dùng `Promise.all` để thu gom đồng thời cả tin nhắn của host và guest ngay sau `START_GAME`, đảm bảo bộ đệm socket sạch 100% trước khi bước vào phép đo rò rỉ.

---

## 5. Kết Quả Nghiệm Thu (Acceptance Gate)

- **Đơn vị kiểm thử chuyên biệt**:
  ```bash
  npx vitest run tests/server/net05_zero_cross_talk.test.ts
  # Kết quả: 4/4 tests passed (2.195s)
  ```
- **Kiểm tra chất lượng nhanh (`gate:quick`)**:
  - TypeScript AST linting: 0 lỗi
  - UI Craft linter: 0 vi phạm
  - Copy-paste detector (`jscpd`): 0 vi phạm mới
  - 3D asset budget: Đạt chuẩn 100%
- **Toàn bộ Test Suite hệ thống (`npm test`)**:
  - **178/178 test files PASS**
  - **3.048/3.048 tests PASS (100%)**
  - Thời gian chạy: ~39s, không phát sinh bất kỳ hồi quy nào.

---

## 6. Bất Biến Miền Đúc Kết (Domain Invariant)

Được chuẩn hóa thành **Gotcha #100** trong [`docs/domain/gotchas.md`](../gotchas.md):
- **WSS Broadcast Queue Draining Invariant**: Khi viết test E2E đa người chơi với WebSocket thật, mọi thao tác broadcast từ server đều phát tới toàn bộ socket kết nối trong phòng. Mọi test fixture/helper phải drain đồng thời toàn bộ socket của phòng trước khi mở cửa sổ đo rò rỉ `collectForMs`, tránh trường hợp tin nhắn tồn đọng trong buffer bị nhận định sai là cross-talk.
