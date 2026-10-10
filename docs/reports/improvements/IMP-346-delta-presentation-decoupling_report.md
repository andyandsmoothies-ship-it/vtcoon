# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-346
## Plan IMP-346: Presentation Subscribers Expansion & Delta Decoupling

> **Mã Ticket:** `IMP-346`  
> **Phân hệ thực tế:** `client-state`  
> **Ngày hoàn thành:** 2026-10-10  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

Triển khai gói hoàn thiện và phân tách trách nhiệm (decoupling) tầng hiển thị cho ticket `IMP-346` thuộc phân hệ `client-state`.

- **Mục tiêu kỹ thuật**:
  - Tách hoàn toàn các hiệu ứng hiển thị âm thanh (SFX) và huy hiệu nổi (FloatingText/Badges) ra khỏi đường ống đồng bộ mạng cốt lõi `apply_delta.ts`, chuyển giao sang hệ thống đăng ký sự kiện tổng thể `audio_event_subscriber.ts` và `property_market_badge_handler.ts`.
  - Khắc phục triệt để hiện tượng xung đột âm thanh kép (acoustic phasing) khi đổ xúc xắc giữa `apply_delta.ts` và `dice_tray.tsx`.
  - Thiết lập phân hoạch hiển thị rời rạc (disjoint partition) cho thẻ sự kiện (Event Card) nhằm bảo vệ tính toàn vẹn 100% của các bộ hợp đồng kiểm thử sống (`imp122`, `imp205`, `imp234`, `imp322`) mà không gây trùng lặp hiển thị.
  - Tuân thủ nghiêm ngặt các ranh giới kiểm thử, Seam Discipline (thông qua Dependency Injection), Zero Dirty Casts (`as any`), và các trần giới hạn LOC.

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_CHALLENGE_IMP-346.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_CHALLENGE_IMP-346.md) | Thẩm định đối kháng 5 tử huyệt, tích hợp chỉ thị gia cố. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/client/imp346_delta_presentation_decoupling.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp346_delta_presentation_decoupling.test.ts) | 8 atomic tests, 16 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/chaos_sentinel_IMP-346.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-346.json) | 3 production files modified, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-346.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-346.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-state` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-346.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-346.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 2.00 | **APPROVED** 🛡️ |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 19/19 mutants mục tiêu bị tiêu diệt (7 AST source mutants, kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Diễn biến thẩm tra theo dòng thời gian (Chronological Verdict Evolution)**:
  1. *Vòng sơ bộ*: Thẩm định viên đối kháng đưa ra phán quyết `CHALLENGE_ISSUED / CONDITIONAL REVISE` do phát hiện 5 tử huyệt kỹ thuật (type hallucination trên `TransitWheelLandedEvent`, acoustic phasing xúc xắc, timing spoiler thẻ bài, duplicate toast thẻ toàn bàn cờ, và âm thanh trái ngược khi hoãn chuyến bay).
  2. *Gia cố kiến trúc*: Toàn bộ 5 chỉ thị gia cố ([ADV-01] đến [ADV-05]) đã được cập nhật trực tiếp vào kế hoạch và triển khai thực tế.
  3. *Phán quyết cuối cùng*: **HARDENED_APPROVED 🛡️**.
- **Chi tiết 5 điểm mù kiến trúc và biện pháp giải tỏa vật lý**:
  - **[ADV-OBJ] Objective Validity**
    - **Target reachable?**: Đạt chuẩn — `applyDeltaToStore` tại `src/client/network/apply_delta.ts` được gọi liên tục bởi `use_app_session.ts` khi nhận delta. `ensureDefaultSubscribers` tại `src/client/events/game_event_bus.ts` đăng ký sẵn các subscriber mặc định.
    - **Giải pháp thay thế**: Không có. Việc tách các tác vụ hiển thị ra khỏi hàm đồng bộ mạng thô là chuẩn kiến trúc Deep Modules & Single Source of Truth (SSOT).
  - **[ADV-01] Fatal Type Hallucination & Runtime TypeError in `TransitWheelLandedEvent` Badge Handling**
    - **Vector**: Unstated Assumption & Semantic Drift
    - **Scenario**: Bản nháp ban đầu truy cập `event.description` và `event.destinationCell`. Tuy nhiên, interface `TransitWheelLandedEvent` trên đĩa vật lý chỉ định nghĩa `outcome`, `targetCell`, `cellIndex`, `payout`, `boostSteps`.
    - **Consequence**: Biên dịch TypeScript gãy đổ; tại runtime `undefined.includes('bị hoãn')` gây `TypeError`, sập luồng subscriber.
    - **Hardening Directive**: Sử dụng hàm chuẩn SSOT `formatTransitWheelBroadcast` từ `src/domain/transit_wheel.ts`, phân loại trạng thái phạt bằng `event.outcome === TransitWheelOutcome.FLIGHT_DELAY`, và ánh xạ `cellIndex: event.targetCell ?? event.cellIndex`.
  - **[ADV-02] Acoustic Phasing & Double Sound Triggering on Dice Rolls**
    - **Vector**: Concurrency & Subsystem Drift
    - **Scenario**: `syncDiceRoll` trong `apply_delta.ts` gọi trực tiếp `AudioEngine.playSfx(SoundEffect.DICE_ROLL)`. Đồng thời `dice_tray.tsx` cũng có `useEffect` phản ứng với `isRolling` để phát âm thanh xúc xắc.
    - **Consequence**: Xúc xắc phát 2 lần âm thanh trong vòng < 1ms, gây tiếng vang click/phasing khó chịu.
    - **Hardening Directive**: Xóa bỏ hoàn toàn lệnh gọi âm thanh trực tiếp trong `apply_delta.ts#syncDiceRoll`. Để `dice_tray.tsx` làm SSOT duy nhất phụ trách âm thanh hiển thị xúc xắc 3D.
  - **[ADV-03] Premature FloatingText Spoilers & Asynchronous Kinematic Desync in Event Card Flow**
    - **Vector**: Kinematic Pacing & Presentation Race
    - **Scenario**: Thẻ cơ hội phát FloatingText ngay khi nhận delta tại $t=0$, trong khi quân cờ 3D vẫn đang di chuyển trên bàn cờ mất 1.5–3.0 giây.
    - **Consequence**: Người chơi bị lộ trước nội dung thẻ bài 3 giây trước khi quân cờ đáp xuống ô và trước khi thẻ 3D lật mở.
    - **Hardening Directive**: Điều phối thời gian hiển thị thông qua `pacing.scheduleAction` và `pacing.getPawnLandingDelay(playerId)`, bảo đảm đồng bộ hoàn hảo với hoạt ảnh 3D.
  - **[ADV-04] Duplicate FloatingText Spawning on Board-Wide Event Cards**
    - **Vector**: Exploits & Domain Data Suppression
    - **Scenario**: `syncEventCard` phát FloatingText cho thẻ toàn bàn cờ (`isBoardWide: true`, 5000ms). Nếu subscriber cũng phát thêm một lần nữa cho người chơi cục bộ thì sẽ bị 2 pop-up chồng chéo.
    - **Consequence**: Pop-up bị đè lên nhau, vi phạm nguyên tắc Zero Duplicate Pop-up của IMP-122 và IMP-234.
    - **Hardening Directive**: Thiết lập phân hoạch rời rạc (disjoint partition): `syncEventCard` chịu trách nhiệm độc quyền cho thẻ bot (`turnPlayerId !== myPid`, 2500ms) và thẻ toàn bàn cờ (`isBoardWide`, 5000ms). Ngược lại, `property_market_badge_handler.ts` chịu trách nhiệm độc quyền cho thẻ cá nhân của người chơi cục bộ (`!isBotCard && !isBoardWide`, 4800ms). Hai tập điều kiện này loại trừ lẫn nhau tuyệt đối, loại trừ hoàn toàn nguy cơ trùng lặp!
  - **[ADV-05] Semantic Audio Contradiction & Wheel Spin Timing Leak on Transit Wheel**
    - **Vector**: Audio-Visual Continuity
    - **Scenario**: Sự kiện `TRANSIT_WHEEL_LANDED` luôn phát `victory_chime`. Nhưng khi kết quả là `FLIGHT_DELAY` (bị phạt hoãn bay, mất lượt di chuyển), việc phát chuông chiến thắng là nghịch lý ngữ nghĩa.
    - **Consequence**: Người chơi bị phạt nhưng lại nghe âm thanh chúc mừng chiến thắng; đồng thời phát âm thanh tại $t=0$ làm lộ kết quả trước khi vòng quay 3500ms dừng lại.
    - **Hardening Directive**: Phân nhánh âm thanh: nếu `FLIGHT_DELAY` thì phát `engine.playSlumpThud()`, ngược lại phát `engine.playVictoryChime()`.

---

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/client/imp346_delta_presentation_decoupling.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp346_delta_presentation_decoupling.test.ts)
- **Chỉ số kiểm thử**: **8 atomic tests**, **16 asserts** (mật độ trung bình: 2.00 asserts/test, 0 vòng lặp).
- **Danh sách 8 ca kiểm thử hợp đồng**:
  1. `TC-346.01 [UC-AUDIO/MSS]`: Kích hoạt âm thanh lật thẻ (`playCardFlip`) qua `SoundEngineImpl` tiêm phụ thuộc khi nhận `EVENT_CARD_DRAWN`.
  2. `TC-346.02 [UC-AUDIO/A1]`: Kích hoạt âm thanh trầm thất bại (`playSlumpThud`) khi vòng xoay vận tải bị `FLIGHT_DELAY`.
  3. `TC-346.03 [UC-AUDIO/A2]`: Kích hoạt chuông chiến thắng (`playVictoryChime`) khi vòng xoay vận tải nhận `SPEED_BOOST`.
  4. `TC-346.04 [UC-BADGE/MSS]`: Phát FloatingText 4800ms cho thẻ cá nhân của người chơi cục bộ (`!isBotCard && !isBoardWide`).
  5. `TC-346.05 [UC-BADGE/A1]`: Nhường quyền hiển thị cho `syncEventCard` khi bot bốc thẻ (tránh trùng lặp pop-up).
  6. `TC-346.06 [UC-BADGE/A2]`: Nhường quyền hiển thị cho `syncEventCard` khi thẻ toàn bàn cờ kích hoạt (tránh trùng lặp banner).
  7. `TC-346.07 [UC-BADGE/A3]`: Định dạng huy hiệu vòng xoay vận tải chuẩn xác theo `formatTransitWheelBroadcast`.
  8. `TC-346.08 [UC-DECOUPLE/MSS]`: Đồng bộ hóa delta qua `applyDeltaToStore` kích hoạt sự kiện Event Bus mà không cần logic theo dõi cũ.
- **Adversarial Inversion Gate**: Đã chứng minh trạng thái RED hợp lệ trước khi sửa code, bảo đảm kiểm thử hành vi thực tế.

---

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi**:
  - [`src/client/events/subscribers/audio_event_subscriber.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/audio_event_subscriber.ts)
  - [`src/client/events/subscribers/property_market_badge_handler.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/property_market_badge_handler.ts)
  - [`src/client/network/apply_delta.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta.ts)
- **Chuyển trạng thái**: Toàn bộ **8/8 contract tests của IMP-346 chuyển sang GREEN**.
- **Bảo Vệ Hồi Quy Toàn Diện (Regression Guard)**:
  - Khôi phục nguyên vẹn và xác minh **65/65 living tests** trên 4 bộ hợp đồng sống quan trọng của dự án:
    - [`tests/client/imp322_global_event_banner.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp322_global_event_banner.test.ts): **7/7 PASS**
    - [`tests/contracts/imp122_comprehensive_popups.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp122_comprehensive_popups.test.ts): **25/25 PASS**
    - [`tests/contracts/imp205_bot_card_toast_and_hud_toggle.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp205_bot_card_toast_and_hud_toggle.test.ts): **17/17 PASS**
    - [`tests/contracts/imp234_dynamic_go_salary_and_penalty_distinction.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp234_dynamic_go_salary_and_penalty_distinction.test.ts): **16/16 PASS**
  - Tổng cộng: **73/73 tests xanh 100%**. Không có bất kỳ hồi quy nào!

---

### Trạm 2.5: Fast Pre-Filter Mechanical Sweep (`scout` / `fast_prefilter.mjs`)
- **TypeScript**: `tsc --noEmit` vượt qua với 0 lỗi (Exit Code 0).
- **Dirty Casts**: Tuyệt đối không sử dụng `as any` hoặc dirty type casting.
- **LOC Ceilings**: Tất cả các tệp đều nằm trong hạn mức trần của từng phân hệ (Tier 1 <= 400, Living Test <= 600).
- **Anti-Slop Linter**: 0 vi phạm trên toàn bộ các quy tắc clean code.

---

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
1. **Spec & Scope Gatekeeper (`spec-reviewer`)**:
   - **Phán quyết**: **APPROVED** 📋
   - **Xác nhận phạm vi**: 100% các thay đổi nằm trong phân hệ mục tiêu (`client-state`), zero scope creep (`node scripts/check_scope.mjs` pass).
2. **Deep Architecture & Anti-Slop Auditor (`code-reviewer`)**:
   - **Phán quyết**: **APPROVED** 🛡️
   - **Chỉ số Anti-Slop**: 0 violations trên 6 cờ cảnh báo (Deep modules, Zero pass-through wrappers, Zero TIDD).
   - **Bộ nhớ & Timer**: Không rò rỉ listener, không bỏ sót timer cleanup, an toàn đa luồng/bất đồng bộ.

---

### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: 19/19 mutants mục tiêu bị tiêu diệt (trong đó có 7 AST source mutants, kill rate: 100%, 0 survived).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-346 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `audio_event_subscriber.ts` | [`src/client/events/subscribers/audio_event_subscriber.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/audio_event_subscriber.ts) | Tier 1 (Domain/Server/Logic) | **132 LOC** | <= 400 LOC | ✅ Đạt chuẩn |
| `property_market_badge_handler.ts` | [`src/client/events/subscribers/property_market_badge_handler.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/property_market_badge_handler.ts) | Tier 1 (Domain/Server/Logic) | **198 LOC** | <= 400 LOC | ✅ Đạt chuẩn |
| `apply_delta.ts` | [`src/client/network/apply_delta.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta.ts) | Tier 1 (Domain/Server/Logic) | **250 LOC** | <= 400 LOC | ✅ Đạt chuẩn |
| `imp346_delta_presentation_decoupling.test.ts` | [`tests/client/imp346_delta_presentation_decoupling.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp346_delta_presentation_decoupling.test.ts) | Living Test | **284 LOC** | <= 600 LOC | ✅ Đạt chuẩn |

---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

- **Tính toàn vẹn hệ thống**: Gói cải tiến hoàn thành theo đúng nguyên tắc Zero-Blindness, cung cấp đầy đủ bằng chứng vật lý từ mã nguồn, kiểm thử hợp đồng, bảo vệ hồi quy cho 4 bộ living tests, và vượt qua kiểm toán biến dị Sentinel.
- **Sẵn sàng triển khai**: Mã nguồn đã sẵn sàng đóng gói và triển khai lên môi trường sản phẩm.
