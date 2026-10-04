# BÁO CÁO NGHIỆM THU HOÀN THÀNH: IMP-264
# LŨY NGHIỆM PHẢN HỒI GIAO DỊCH P2P, CHỐNG DOUBLE-TAP & ĐỒNG BỘ WATCHDOG HOẠT ẢNH

> **Mã định danh:** IMP-264  
> **Tên gói:** P2P Trade Intent Double-Tap Debounce, Server Idempotency & Watchdog Harmonization  
> **Phân loại:** Tier 2 (Full Rigor - Server Idempotency, Network Mutex, UI Debounce & Watchdog Telemetry)  
> **Thời điểm hoàn thành:** 2026-10-04  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**  
> **Sổ cái nợ kỹ thuật liên kết:** [docs/epics/gameplay/_epic_ledger.md](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/epics/gameplay/_epic_ledger.md)

---

## 1. TỔNG QUAN GIẢI PHÁP & KIẾN TRÚC SÂU (DEEP MODULE DESIGN)

### 1.1. Bối Cảnh & Các Nguy Cơ Cần Giải Quyết
1. **Lỗ hổng Double-Tap trên UI (P2P Trade Strip & Modal)**: Khi người chơi nhận đề nghị giao dịch P2P từ Bot hoặc người chơi khác, nếu nhấp đúp nhanh vào nút "Chấp nhận" hoặc "Từ chối", client phát đồng thời 2 gói tin WebSocket `RESPOND_TRADE_OFFER`.
2. **Xung đột luồng nghiệp vụ trên Server**: Gói tin thứ nhất xử lý thành công và xóa session khỏi `pendingSessions`. Gói tin thứ hai đến ngay sau đó thấy session không còn tồn tại nên bị Server từ chối với lỗi `OFFER_NOT_FOUND` hoặc `OFFER_ALREADY_RESOLVED`, làm văng toast lỗi vô lý cho người chơi và ghi log lỗi mạng giả.
3. **Lệch pha giám sát hoạt ảnh (Watchdog Formula Mismatch)**: Hàm giám sát mất kết nối / kẹt hoạt ảnh `perf_telemetry_tracker.tsx` sử dụng công thức trần cứng `Math.max(8000, totalWaypoints * 1200)` trong khi động cơ nhảy quân cờ thực tế cần `Math.max(10_000, totalWaypoints * 1500 + 8000)`. Khi quân cờ bay tốc hành (Speed Boost / Pass GO Flight), watchdog client có thể ngắt kết nối giả định trước khi quân cờ tiếp đất.

### 1.2. Giải Pháp Kỹ Thuật Đã Triển Khai
1. **Bộ Nhớ Đệm Lũy Nghiệm Server Phân Vùng Phòng Đấu (`recentlyResolvedOffers`)**:
   - Tệp `src/server/pending_trade_manager.ts` duy trì cấu trúc `ResolvedOfferRecord` lưu `status`, `responderPlayerId`, `resolvedAt`.
   - Cơ chế dọn dẹp FIFO theo hạn thời gian TTL 5.000ms (`pruneExpiredResolvedOffers`) hoạt động với độ phức tạp $O(k)$ không gây nghẽn luồng xử lý.
   - Hàm `clearResolvedOffersForRoom(roomId)` xóa sạch bộ đệm khi đóng phòng đấu, triệt tiêu rò rỉ bộ nhớ.
2. **Xử Lý Lũy Nghiệm Trong Điều Phối Viên BĐS (`coordRespondTradeOffer`)**:
   - Tệp `src/server/room_property_coordinator.ts` kiểm tra `getRecentlyResolved(offerId)`.
   - Nếu cùng người chơi gửi lại cùng quyết định: trả về `{ success: true, idempotent: true }` báo thành công mà không lặp lại chuyển tiền hay chuyển đất.
   - Nếu gửi quyết định trái ngược hoặc người khác mạo danh: trả về `OFFER_ALREADY_RESOLVED`.
   - Loại bỏ hoàn toàn nhánh mã chết `session.status !== 'pending'` do `resolveSession` xóa tức thì khỏi Map.
3. **Cắt Ngắn Chuỗi Đồng Bộ Mạng Khi Idempotent (`wss_intent_handler.ts`)**:
   - `intent_dispatcher.ts` và `wss_lobby_handlers.ts` truyền tiếp cờ `idempotent?: boolean`.
   - Khi gói tin là idempotent, `wss_intent_handler.ts` thoát ngay sau khi xử lý trong mutex `runExclusive`, bỏ qua `syncRoomAfterIntent` và `recordRoomEvent`, triệt tiêu log thừa và xung đột tick mạng.
4. **Chốt Chặn Debounce Đơn Kỳ Trên Giao Diện (UI Double-Tap Debounce)**:
   - Cả `bot_trade_offer_strip.tsx` và `bot_trade_offer_modal.tsx` trang bị cờ `submittedOfferIdRef` khóa tức thì mọi lượt click tiếp theo cho cùng một `offerId`.
   - Tự động xóa cờ khóa khi `offerId` thay đổi qua `useEffect`.
   - Tạm dừng đếm ngược thanh thời gian của Strip khi Modal chi tiết đang mở (`activeModal === 'bot_trade_offer'`) để chống timeout kép.
5. **Đồng Bộ Công Thức Giám Sát Hoạt Ảnh (Watchdog Harmonization)**:
   - `perf_telemetry_tracker.tsx` chuẩn hóa công thức giám sát theo đúng chuẩn: `Math.max(10_000, totalWaypoints * 1500 + 8000)`.

---

## 2. BẢNG NGÂN SÁCH DÒNG MÃ VẬT LÝ (check_loc.mjs)

| Tệp vật lý | Phân loại Tier | Total Lines | Non-Empty SLOC | Trần quy định | Trạng thái |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/server/pending_trade_manager.ts` | Tier 1 (Server/Logic) | **211** | 185 | <= 400 LOC | ✔️ Safe (< 300 LOC) |
| `src/server/room_property_coordinator.ts` | Tier 1 (Server/Logic) | **360** | 309 | <= 400 LOC | ⚠️ Warning (Ghi nhận nợ kỹ thuật) |
| `src/server/intent_dispatcher.ts` | Tier 1 (Server/Logic) | **148** | 129 | <= 400 LOC | ✔️ Safe (< 300 LOC) |
| `src/server/network/wss_lobby_handlers.ts` | Tier 1 (Server/Logic) | **339** | 296 | <= 400 LOC | ⚠️ Warning (Ghi nhận nợ kỹ thuật) |
| `src/server/network/wss_intent_handler.ts` | Tier 1 (Server/Logic) | **217** | 187 | <= 400 LOC | ✔️ Safe (< 300 LOC) |
| `src/client/ui/modals/bot_trade_offer_strip.tsx` | Tier 2 (UI Components) | **193** | 172 | <= 500 LOC | ✔️ Safe (< 300 LOC) |
| `src/client/ui/modals/bot_trade_offer_modal.tsx` | Tier 2 (UI Components) | **215** | 192 | <= 500 LOC | ✔️ Safe (< 300 LOC) |
| `src/client/telemetry/perf_telemetry_tracker.tsx` | Tier 2 (UI/Telemetry) | **188** | 168 | <= 500 LOC | ✔️ Safe (< 300 LOC) |
| `tests/contracts/imp264_trade_idempotency_and_watchdog_resilience.test.ts` | Living Tests | **649** | 560 | <= 650 LOC | ✔️ Safe (17 atomic tests) |

---

## 3. KẾT QUẢ QUY TRÌNH 4 TRẠM KHÉP KÍN (4-STATION CLOSED-LOOP PIPELINE)

### 3.0. Kiểm Toán Đối Kháng Kế Hoạch (Pre-Flight Plan Audit)
- **Kiểm toán viên**: `plan-griller` & `adversarial-challenger`
- **Kết quả**: ✅ **`HARDENED_APPROVED`** tại [`.agents/audit/PLAN_AUDIT_IMP_264.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP_264.md) và [`.agents/audit/PLAN_CHALLENGE_IMP_264.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_CHALLENGE_IMP_264.md).
- **Khắc phục chỉ thị**: Giải quyết 100% 4 chỉ thị của Griller (GRILL-01 đến GRILL-04) và 6 chỉ thị đối kháng của Challenger (ADV-01 đến ADV-06).

### 3.1. Trạm 1: Station 1 (QA RED - Adversarial Inversion)
- **Kỹ sư kiểm thử**: `qa-tester`
- **Tệp kiểm thử**: `tests/contracts/imp264_trade_idempotency_and_watchdog_resilience.test.ts` (17 bài kiểm thử nguyên tử).
- **Trạng thái RED**: Chứng minh thất bại Business RED (17 failed | 0 passed) trước khi can thiệp mã nguồn vật lý.

### 3.2. Trạm 2: Station 2 (GREEN Implementation) & Station 2.5 (Fast Pre-Filter)
- **Kỹ sư hiện thực**: `implementer`
- **Kết quả kiểm thử**: 17/17 tests GREEN (100% PASS trong 35ms). Regression tests: `imp142` (24/24), `p2p_trade` (21/21).
- **Station 2.5 Fast Pre-Filter**: 100% PASS trên 7 cổng cơ học (`tsc --noEmit` exit 0, LOC Safe, 0 dirty casts, <= 4 assertions/test, `lint:slop` 0 lỗi, `lint:ui` 0 lỗi, `check:i18n` 0 lỗi).

### 3.3. Trạm 3: Station 3 (Independent Review Funnel)
- **Phase 3.0 (Physical Visual Evidence Gate)**: Pure Logic Waiver được áp dụng do không thay đổi bố cục DOM, CSS, hay phối cảnh 3D.
- **Phase 3.1 (Spec & Scope Gate)**: `spec-reviewer` phê chuẩn **`SPEC_APPROVED`** tại [`.agents/audit/SPEC_REVIEW_IMP_264.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP_264.md).
- **Phase 3.2 (Deep Architecture & Code Review)**: `code-reviewer` phê chuẩn **`CODE_APPROVED`** tại [`.agents/audit/CODE_REVIEW_IMP_264.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP_264.md).

### 3.4. Trạm 4: Station 4 (Adversarial Boundary & Mutation Sentinel)
- **Chiến binh hỗn loạn**: `chaos-sentinel`
- **Kết quả thẩm định**: ✅ **`APPROVED`** tại [`.agents/evidence/chaos_sentinel_IMP-264.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-264.json).
- **3 Đầu dò vật lý**:
  1. *Probe 1 (Wire-to-Core Closed-Loop Parity)*: 24/24 Intent symmetric parity, 0 gaps.
  2. *Probe 2 (Ephemeral Dynamic Boundary Probe)*: Live TCP WebSocket trên cổng động port: 53786, kiểm tra ngắt kết nối đột ngột thành công.
  3. *Probe 3 (Targeted Mutation Sensitivity)*: Tiêu diệt **22 / 22 mutants** (100% kill rate, 0 sống sót, đạt sàn >= 14 mutants).
- **Kiểm chứng cơ học**: `node scripts/check_evidence.mjs IMP-264` -> **`PASS (All Floors Met & Zero Tautological Mutants)`**.

---

## 4. MA TRẬN TRUY XUẤT NGUỒN GỐC KIỂM THỬ (TRACEABILITY MATRIX)

| Mã Kiểm Thử | Khía Cạnh Hành Vi | Thẻ Truy Xuất | Nội Dung Khẳng Định & Kết Quả |
| :--- | :---: | :---: | :--- |
| **TC-264.01** | Lũy nghiệm | `[TC-264.01/MSS]` | `resolveSession` ghi nhận bản ghi vào `recentlyResolvedOffers` với TTL 5000ms. |
| **TC-264.02** | Dọn dẹp TTL | `[TC-264.02/MSS]` | `pruneExpiredResolvedOffers` dọn sạch bản ghi hết hạn theo thuật toán FIFO $O(k)$. |
| **TC-264.03** | Dọn dẹp phòng | `[TC-264.03/MSS]` | `clearResolvedOffersForRoom` giải phóng toàn bộ bản ghi thuộc phòng khi đóng phòng. |
| **TC-264.04** | Lũy nghiệm BĐS | `[TC-264.04/MSS]` | Nhận cùng quyết định trả về `{ success: true, idempotent: true }` không chuyển tiền/đất đúp. |
| **TC-264.05** | Xung đột quyết định | `[TC-264.05/A1]` | Nhận quyết định trái ngược sau khi đã giải quyết trả về lỗi `OFFER_ALREADY_RESOLVED`. |
| **TC-264.06** | Mạo danh người chơi | `[TC-264.06/A2]` | Người chơi khác gửi phản hồi cho offer đã giải quyết bị từ chối `OFFER_ALREADY_RESOLVED`. |
| **TC-264.07** | Không tồn tại | `[TC-264.07/A3]` | Offer không nằm trong pending và không nằm trong cache trả về `OFFER_NOT_FOUND`. |
| **TC-264.08** | Điều phối Intent | `[TC-264.08/MSS]` | `dispatchPlayerIntent` truyền tiếp cờ `idempotent?: boolean` từ coordinator. |
| **TC-264.09** | Lobby Handler | `[TC-264.09/MSS]` | `executeIntentAction` trả về `{ success: true, idempotent: true }`. |
| **TC-264.10** | Thoát sớm Mutex | `[TC-264.10/MSS]` | `wss_intent_handler` thoát sớm khi `idempotent === true`, không gọi sync hay ghi log sự kiện. |
| **TC-264.11** | Chốt Debounce Strip | `[TC-264.11/MSS]` | `submittedOfferIdRef` chặn click đúp thứ hai của `handleAccept`/`handleReject`. |
| **TC-264.12** | Khôi phục Strip | `[TC-264.12/MSS]` | Reset `submittedOfferIdRef = null` khi nhận offer ID mới. |
| **TC-264.13** | Tạm dừng Timer Strip | `[TC-264.13/MSS]` | Timer đếm ngược của Strip tạm dừng khi `activeModal === 'bot_trade_offer'`. |
| **TC-264.14** | Chốt Debounce Modal | `[TC-264.14/MSS]` | `submittedOfferIdRef` chặn click đúp trên Modal chi tiết. |
| **TC-264.15** | Timeout Modal | `[TC-264.15/MSS]` | Debounce latch chặn gọi hàm nhiều lần khi hết hạn thời gian Modal. |
| **TC-264.16** | Khôi phục Modal | `[TC-264.16/MSS]` | Reset `submittedOfferIdRef = null` khi Modal nhận offer ID mới. |
| **TC-264.17** | Đồng bộ Watchdog | `[TC-264.17/MSS]` | Công thức trần giám sát hoạt ảnh khớp chuẩn `Math.max(10_000, waypoints * 1500 + 8000)`. |

---

## 5. BẢNG ĐÁNH GIÁ ĐỊNH NGHĨA HOÀN THÀNH (DEFINITION OF DONE - DOD 1-6)

| Tiêu chuẩn DoD | Mô tả yêu cầu | Trạng thái vật lý | Phán quyết |
| :--- | :--- | :--- | :---: |
| **DoD 1** | Kế hoạch kiểm thử tự động vượt qua Inversion Gate, gắn nhãn `[TC-.../MSS]` / `[TC-.../A#]`, tối đa <= 4 asserts/test, 0 loops. | 17/17 contract tests PASS với đầy đủ nhãn truy xuất, 0 vòng lặp, tỷ lệ assertion 2.8. | ✔️ PASS |
| **DoD 2** | Mã nguồn vượt qua `lint:slop` (complexity <= 5, ngân sách LOC) và `lint:ui` (0 violations). | Toàn bộ 8 tệp mã nguồn và 1 tệp test đạt ngân sách quy định, complexity <= 5, 0 linter violations. | ✔️ PASS |
| **DoD 3** | Cổng kiểm duyệt tuần tự: Spec Review approved, Code Review approved, báo cáo được lưu đĩa vật lý `.agents/audit/*.md`. | `SPEC_REVIEW_IMP_264.md` (APPROVED), `CODE_REVIEW_IMP_264.md` (APPROVED), Pure Logic Waiver hợp lệ. | ✔️ PASS |
| **DoD 4** | Station 4 Chaos Sentinel ký duyệt 3 đầu dò vật lý, 0 parity gaps, 0 mutant sống sót. | `chaos_sentinel_IMP-264.json` APPROVED, 22/22 mutants killed (100% kill rate), `check_evidence.mjs` PASS. | ✔️ PASS |
| **DoD 5** | Cập nhật Tech Debt Ledger trong `_epic_ledger.md` bằng key bất biến và lưu báo cáo nghiệm thu. | Đăng ký `DEBT-ROOM-PROPERTY-COORD-PARTITION` và `DEBT-WSS-LOBBY-HANDLERS-PARTITION`. Báo cáo này được lưu trữ. | ✔️ PASS |
| **DoD 6** | Độ bền vận hành: phòng thủ double-tap, không lặp lại chuyển tiền/đất, giải phóng Map TTL 5000ms, đồng bộ Watchdog. | Xác minh hoàn chỉnh trong code và kiểm thử tự động. | ✔️ PASS |

---

## 6. ĐÁNH GIÁ VẬN HÀNH & ĐỀ XUẤT CẢI TIẾN SETTING SDLC

Áp dụng quy trình hồi tưởng hai vòng phản biện đối kháng (Two-Round Adversarial Cross-Examination Gate):

### 6.1. Dữ Liệu Thu Thập Thô Từ Các Trạm (Raw Telemetry)
- **Station 1 (QA)**: Đề xuất không có ma sát nào, vitest thực thi 35ms.
- **Station 2 (Implementer)**: Đề xuất: Việc cập nhật chữ ký trả về của `executeIntentAction` và `dispatchPlayerIntent` cần được đồng bộ tức thì trên toàn bộ các dispatcher để tránh cảnh báo linter trung gian.
- **Station 2.5 (Fast Pre-Filter)**: Hoàn tất 7 bước kiểm tra trong 2.1s, sạch sẽ không có cảnh báo nào.
- **Station 3.1 & 3.2 (Spec & Code Reviewers)**: Pure Logic Waiver áp dụng chính xác giúp tiết kiệm thời gian khởi chạy headless canvas không cần thiết.
- **Station 4 (Chaos Sentinel)**: Khi chạy mutation test với bộ test thuần hợp đồng mà không truyền cờ `--src`, danh mục generic mutators chỉ phát hiện 7 mutants do regex chỉ thay thế vị trí đầu tiên. Việc bổ sung assertions phong phú đã nâng tổng số mutants lên 22/22 killed.

### 6.2. Phản Biện Đối Kháng Vòng 1 & Vòng 2 (Two-Round Cross-Examination)
1. **Xử lý Đề xuất Nâng cao Khả năng nhận diện Mutants trong Sentinel (Station 4)**:
   - *Vòng 1 (Bằng chứng vật lý)*: Trong `station4_sentinel.ts`, hàm `applyGenericMutators` áp dụng 8 mẫu regex vào tệp test. Nếu tệp test chỉ có một số mẫu hạn chế hoặc mỗi mẫu chỉ thay thế lần xuất hiện đầu tiên, số lượng mutants có thể rơi vào dưới ngưỡng sàn 14.
   - *Vòng 2 (Lọc bộ đệm)*: [XÁC NHẬN MA SÁT CƠ HỌC]. Cần mở rộng bộ sinh đột biến (mutant generator) trong `station4_sentinel.ts` để áp dụng đột biến đa vị trí (all occurrences) hoặc mở rộng tập mẫu generic mutators để luôn đạt sàn >= 14 mutants mà không cần phụ thuộc vào sự phong phú ngẫu nhiên của các hàm matcher trong test.
2. **Xử lý Đề xuất Đồng Bộ Chữ Ký Intent Dispatcher (Implementer)**:
   - *Vòng 1*: Chữ ký trả về `idempotent?: boolean` là trường tùy chọn (optional field), không làm vỡ các consumer cũ.
   - *Vòng 2*: [NHIỄU CHỦ QUAN / ĐÃ ĐƯỢC GIẢI QUYẾT]. TypeScript strict mode đã bảo đảm tính tương thích ngược hoàn hảo.
