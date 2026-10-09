# ⚔️ BÁO CÁO PHẢN BIỆN CHUYÊN SÂU & GIÁM ĐỊNH ADVERSARIAL: ỨNG VIÊN #1
## DỌN SẠCH TẦNG MẠNG & NGUY CƠ ĐỨT GÃY HỆ THỐNG KIỂM THỬ HỒI QUY

> **Mã hồ sơ:** `ADVERSARIAL-CRITIQUE-ARCH-01`  
> **Đối tượng phản biện:** [`docs/reports/audits/architecture_candidate_1_network_purge_report.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/audits/architecture_candidate_1_network_purge_report.md) (`ARCH-CANDIDATE-01`)  
> **Phân hệ mục tiêu:** `client-network` & `client-events`  
> **Căn cứ pháp lý & kỹ thuật:** Hiến pháp [`GEMINI.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/GEMINI.md) (Anti-TIDD, Zero Dirty Casts, Causal Root Scope Invariant), Gotcha IV ([Network & Live Sockets](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/network_delta.md)), Gotcha VII ([Testing Traps](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/testing_traps.md)).  
> **Phán quyết tổng thể:** 🛑 **TẠM HOÃN & YÊU CẦU ĐIỀU CHỈNH (POSTPONE & REVISE)** — Chưa phê duyệt "The Grand Purge" vào thời điểm hiện tại khi chưa có chiến lược di trú khả thi cho hơn 30 bài Contract Tests kế thừa.

---

## 0. BẢNG TỔNG HỢP CÁC LỖ HỔNG KỸ THUẬT (VULNERABILITY MATRIX)

| STT | Luận Điểm Đề Xuất của Candidate #1 | Lỗ Hổng Kỹ Thuật Phát Hiện (Adversarial Probing) | Mức Độ Rủi Ro | Hậu Quả Thực Tế Trên Production / CI |
|:---:|:---|:---|:---:|:---|
| **1** | *"Xóa sổ 8 tệp `activity_*` trên đĩa vật lý, cắt giảm ròng 1.493 LOC nợ kỹ thuật."* | Hơn **30 tệp Contract Tests** đang `import` trực tiếp từ các tệp này. Xóa thật trên đĩa sẽ gây lỗi loader `Cannot find module` làm sập hàng loạt test suites. | 🔴 **Chí mạng (Fatal)** | Đứt gãy dây chuyền CI Pipeline; bùng nổ phạm vi (Scope Explosion) phải sửa hơn 30 tệp test. |
| **2** | *"Tạo tệp `legacy_event_compat.ts` (~60 LOC) để bảo vệ 100% test cũ không bị lỗi import."* | Các bài test cũ import từ `../../src/client/network/activity_financial_tracker.js`, **không hề import từ `legacy_event_compat.ts`**. Tạo file compat mới không cứu được test cũ. | 🔴 **Nghiêm trọng (High)** | Vi phạm Luật thép Anti-TIDD: Tạo file sản phẩm rác chỉ để che giấu nợ kiểm thử. |
| **3** | *"Xóa bỏ lời gọi `trackDeltaActivities(...)` và cờ `suppressFinancialAndProperty`."* | Khi `isFullSync = true` (lần đầu vào phòng hoặc Reconnect), `synthesizeGameEvents` **cố tình bị bỏ qua** (`!isFullSync`). Xóa tracker cũ sẽ làm mất trắng nhật ký khởi tạo. | 🔴 **Nghiêm trọng (High)** | Màn hình người chơi bị "đóng băng" (Frozen HUD): Reconnect xong không có log hoạt động, mất badge. |
| **4** | *"Toàn bộ sự kiện chuyển sang `GameEventBus` là an toàn tuyệt đối (Low Risk)."* | `GameEventBus` là Synchronous in-memory Bus. Nếu 1 subscriber ném ngoại lệ (Exception), toàn bộ tiến trình áp dụng delta mạng bị chết ngắt giữa chừng. | 🟡 **Trung bình (Medium)** | Mất tính năng cô lập lỗi an toàn (`safe fallback`) từng được bọc `try/catch` tại `syncTelemetryAndActivities`. |
| **5** | *"Cắt giảm ròng 1.218 LOC làm sạch mã nguồn."* | Bùng nổ cấp phát đối tượng (Object Allocation Churn): Mỗi delta sinh ra hàng chục Event Objects trung gian phân phối cho 4 subscribers, gây áp lực Garbage Collector trên mobile. | 🟡 **Trung bình (Medium)** | Gây khựng vi mô (micro-stutter) trên các thiết bị di động cấu hình yếu khi nhận delta dồn toa. |

---

## 1. PHÂN TÍCH ADVERSARIAL CHI TIẾT CÁC TỬ HUYỆT

```
                      MÔ PHỎNG VẾT NỨT CỦA CANDIDATE #1
                      
    [DeltaPayload từ Server (WebSocket)]
                     │
         ┌───────────┴───────────┐
         │ isFullSync === true   │ isFullSync === false
         │ (Reconnect mạng)      │ (Gói tin bình thường)
         ▼                       ▼
   [Bỏ qua Synthesizer!]   [synthesizeGameEvents()]
         │                       │
         │ (Đã xóa mất           ▼
         │  trackDeltaActivities) [GameEventBus phát 4 Subscribers]
         ▼                       │
  🚨 LỖI RECONNECT:              ▼
  HUD trắng xóa, mất log,   [Hàng chục Event Objects sinh ra mỗi tick]
  không có badge khởi tạo!       │
                                 ▼
                            ⚠️ GC Churn & Áp lực rác bộ nhớ trên mobile
```

---

### 🔴 Tử huyệt 1: Ảo tưởng "The Deletion Test" & Nguy cơ làm sập 30+ Living Contract Tests
* **Lập luận của Candidate #1:** *"Khi toàn bộ sự kiện được tổng hợp qua `GameEventBus`, toàn bộ 8 tệp `activity_*` sẽ bị xóa sổ hoàn toàn... Cắt giảm ròng ~1.500 dòng mã."*
* **Bóc trần sự thật kiểm thử vật lý:**
  * Khảo sát thực tế trong thư mục `tests/`: Hiện có **hơn 30 bài test hợp đồng sống (Living Contract Tests)** đang trực tiếp import các hàm và type từ 8 tệp này:
    - [`tests/contracts/imp219_bot_action_pacing_and_visual_feedback.test.ts:1-7`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp219_bot_action_pacing_and_visual_feedback.test.ts#L1-L7):
      `import * as activityFinancialTrackerModule from '../../src/client/network/activity_financial_tracker.js';`
      `import { detectFinancialAndStatusActivities } from '../../src/client/network/activity_financial_tracker.js';`
      `import { dispatchActivityFloatingBadges } from '../../src/client/network/activity_badge_dispatcher.js';`
      `import { detectAuctionActivities } from '../../src/client/network/activity_tracker.js';`
    - [`tests/contracts/imp225_financial_activity_log_collision.test.ts:3-7`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp225_financial_activity_log_collision.test.ts#L3-L7):
      `import { detectFinancialAndStatusActivities } from '../../src/client/network/activity_financial_tracker.js';`
    - [`tests/contracts/imp226_escalating_audit_bailout.test.ts:1`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp226_escalating_audit_bailout.test.ts#L1):
      `import { processPayerFee } from '../../src/client/network/activity_rent_matcher.js';`
    - [`tests/contracts/imp234_dynamic_go_salary_and_penalty_distinction.test.ts:2-6`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp234_dynamic_go_salary_and_penalty_distinction.test.ts#L2-L6):
      `import { trackDeltaActivities } from '../../src/client/network/activity_tracker.js';`
    - [`tests/contracts/imp287_p2p_trade_activity_feed.test.ts:1-3`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp287_p2p_trade_activity_feed.test.ts#L1-L3)...
  * Khi Candidate #1 thực hiện lệnh xóa đĩa vật lý đối với 8 tệp `activity_*`, trình chạy kiểm thử Vitest / Node.js ESM **lập tức dừng khẩn cấp (fatal error)** với mã lỗi `ERR_MODULE_NOT_FOUND`.
  * Candidate #1 xoa dịu bằng cách đề xuất tạo `src/client/events/legacy_event_compat.ts`. Nhưng đây là một **sự ngây thơ về cơ chế Module Resolution**: Các bài test cũ import từ `../../src/client/network/activity_financial_tracker.js`, chúng hoàn toàn không biết đến sự tồn tại của `legacy_event_compat.ts`!
  * **Hậu quả**: Để bài test chạy được, kỹ sư bắt buộc phải:
    - Mở hơn 30 tệp test ra để sửa lại đường dẫn import (Bùng nổ phạm vi kiểm thử - vi phạm *Scope Confinement*).
    - Hoặc phải giữ lại 8 tệp cũ làm "file vỏ" (shim re-export). Nhưng nếu giữ lại 8 file vỏ thì **con số "xóa bỏ 1.493 dòng" hoàn toàn là số liệu giả tạo**, và việc tạo file vỏ chỉ phục vụ testing vi phạm trực tiếp **Luật thép Anti-TIDD** của Hiến pháp [`GEMINI.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/GEMINI.md).

---

### 🔴 Tử huyệt 2: Lỗ hổng Mất Đồng Bộ Hoạt Động khi Reconnect & Full Sync
* **Mã nguồn thực tế tại [`src/client/network/apply_delta.ts:147-159`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta.ts#L147-L159):**
  ```typescript
  const isFullSync = Boolean(delta.cells && delta.cells.length === BOARD_SIZE);
  const nextState = store.getState();
  if (!isFullSync) {
    const events = synthesizeGameEvents(state, nextState, delta);
    if (events.length > 0) {
      dispatchGameEvents(events, { prevState: state, nextState, delta });
    }
  }
  trackDeltaActivities(delta, state, nextState, useActivityStore, { suppressFinancialAndProperty: true });
  ```
* **Cơ chế lỗi vận hành khi xóa `trackDeltaActivities`:**
  1. Khi người chơi bị rớt mạng và kết nối lại, server gửi xuống một gói `DeltaPayload` đầy đủ 40 ô đất để dựng lại toàn bộ bàn cờ (`isFullSync === true`).
  2. Để tránh phát nổ hàng chục sự kiện mua bán đất giả tạo từ quá khứ, nhánh `GameEventBus` **chủ động bỏ qua việc trích xuất sự kiện** (`if (!isFullSync)`).
  3. Trong kiến trúc hiện tại, lệnh `trackDeltaActivities` nằm ngoài khối `if (!isFullSync)` vẫn tiếp nhận delta này để trích xuất các thông tin trạng thái ban đầu (vòng chơi hiện tại, thông tin cờ của người chơi, lượt đi kế tiếp).
  4. Nếu xóa bỏ hoàn toàn `trackDeltaActivities` như đề xuất của Candidate #1, khi người chơi Reconnect thành công:
     * Toàn bộ thanh Activity Feed bên phải màn hình sẽ **trống rỗng**.
     * Không có bất kỳ badge trạng thái nào được hiển thị để người chơi biết ván đấu đang diễn ra đến đâu.
     * Giao diện rơi vào trạng thái "chết lâm sàng" (Frozen HUD) dù WebSocket vẫn nhận dữ liệu bình thường.

---

### 🔴 Tử huyệt 3: Bùng Nổ Cấp Phát Bộ Nhớ (GC Churn) do Ép Mọi Giao Dịch Thành Object Sự Kiện
* Trong hệ thống cũ (`activity_tracker`), quá trình kiểm tra diễn ra theo mô hình trích xuất chuỗi thô (raw string extraction) và đẩy thẳng vào mảng `activityLog` chỉ khi có biến động thật sự.
* Trong hệ thống mới (`GameEventBus`):
  1. `synthesizeGameEvents` duyệt qua toàn bộ delta để tạo ra mảng các đối tượng sự kiện dạng `GameEvent` mang đầy đủ metadata (timestamp, playerId, amount, cellIndex, transactionType...).
  2. Mảng này được `dispatchGameEvents` duyệt qua và phát đồng thời cho **4 Subscribers độc lập** (`activity_log_subscriber`, `badge_event_subscriber`, `audio_presentation_subscriber`, `pacing_subscriber`).
  3. Mỗi Subscriber lại chạy một vòng lặp map nội bộ, cấp phát thêm các đối tượng `ActivityLogEntry`, `FloatingBadgeConfig`, `AudioCueCommand`.
  4. Khi mạng di động bị trễ và nhận một chùm delta dồn toa (burst of 5-8 packets sau khi lag), hệ thống sẽ cấp phát hàng trăm object ngắn hạn (short-lived objects) trong một frame $16.6\text{ms}$.
  5. Điều này kích hoạt cơ chế thu gom rác **Garbage Collection (GC)** của trình duyệt, gây ra hiện tượng **khựng giật khung hình (Micro-jank / Frame Stutter)** rõ rệt trên các thiết bị di động (iPhone / Android tầm trung).

---

## 2. PHƯƠNG ÁN KIẾN TRÚC THAY THẾ (THE ADAPTER HARMONIZATION ALTERNATIVE)

Thay vì tiến hành một cuộc "thanh trừng vội vã" (The Grand Purge) làm sập 30+ bài test và gây lỗi Reconnect, chúng tôi đề xuất chiến lược **Đóng Gói Ẩn Danh (Internal Adapter Pattern)**:

```
┌────────────────────────────────────────────────────────────────────────┐
│               CHIẾN LƯỢC ĐÓNG GÓI ẨN DANH (SAFE MIGRATION)             │
│                                                                        │
│   1. Giữ nguyên 8 tệp `activity_*` tại `src/client/network/`           │
│      nhưng KHÔNG coi chúng là nợ kỹ thuật độc lập.                     │
│                                                                        │
│   2. Biến `activity_tracker.ts` thành tầng Adapter nội bộ:             │
│      - `apply_delta.ts` chỉ gọi 1 cổng duy nhất.                       │
│      - Chuyển quyền điều khiển xử lý FullSync vào bên trong Adapter.   │
│                                                                        │
│   3. Bảo vệ toàn vẹn 30+ Living Contract Tests:                        │
│      - Giữ nguyên 100% đường dẫn import của các test cũ.               │
│      - Zero rủi ro loader `Cannot find module`.                        │
│      - 0 dòng mã test bị sửa đổi, bảo toàn hoàn hảo tiêu chí Anti-TIDD.│
│                                                                        │
│   4. Chỉ xóa bỏ đĩa vật lý khi:                                        │
│      - Đã có một Ticket chuyên biệt di trú toàn bộ test suites.        │
│      - GameEventBus đã hoàn thiện cơ chế xử lý FullSync / Reconnect.   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. KẾT LUẬN & PHÁN QUYẾT CHO BAN THẨM ĐỊNH

1. **Đánh giá Đề xuất #1:** Đề xuất mang tính thẩm mỹ cao ("xóa bớt file cho sạch mắt"), nhưng **đánh đổi bằng rủi ro hồi quy khổng lồ** đối với hệ thống kiểm thử tự động và phá vỡ cơ chế Reconnect mạng.
2. **Phán quyết:** 🛑 **TẠM HOÃN (POSTPONE)** lộ trình 3 Micro-Slices `IMP-336` $\rightarrow$ `IMP-338` của Ứng viên #1.
3. **Chỉ thị:** Tầng mạng hiện tại đang chạy hoàn toàn ổn định với cờ `suppressFinancialAndProperty`. Tập trung tài nguyên vào các lỗi game-breaking của FSM Server trước khi thực hiện dọn dẹp thẩm mỹ ở tầng Client.
