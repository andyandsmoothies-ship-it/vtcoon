# KẾ HOẠCH TRIỂN KHAI (IMPLEMENTATION PLAN)
# IMP-267: MODAL CAROUSEL LẬT THẺ ĐA SỰ KIỆN THỊ TRƯỜNG (MULTI-EVENT MODAL CAROUSEL)

> **Mã Lát Cắt:** IMP-267 (Micro-Slice)  
> **Tiêu đề:** Active Market Event Modal Carousel & Dynamic State Derivation  
> **Phân loại:** Tier 2 Micro-Slice (Lean Plan Specification, Delta <= 50 LOC, Single Subsystem)  
> **Phân hệ mục tiêu:** `client-ui` (Event Card Modal & Market Event Ticker)  
> **Tài liệu tham chiếu:** `docs/domain/gotchas/ui_ergonomics.md` · `GEMINI.md` Hard Constraints  
> **Đặc tả thị giác:** `C:\Users\HP\.gemini\antigravity\brain\7d101291-7109-47db-abe6-a9d1e50c372a/event_ticker_visualizer.html` (Phương án 1 được duyệt)

---

## 0. KHẢO SÁT BỀ MẶT MÃ NGUỒN (100% SURFACE INVENTORY)

| Tệp Tin Vật Lý | Tọa Độ Dòng | Phân Loại | Hành Động Kỹ Thuật Cụ Thể |
| :--- | :---: | :---: | :--- |
| `src/client/ui/modals/event_card_modal.tsx` | L50-L105, L150-L170, L268-L275 | **Modify** | Tích hợp state `activeIdx` với thuật toán định vị `initialIdx`; loại bỏ Props Stale Shadowing bằng Dynamic Derivation; tích hợp thanh điều hướng đơn hàng gọn gàng (Single-row Carousel Nav); nút CTA lật vòng. |
| `src/client/ui/market_event_ticker.tsx` | L226-L230 | **Modify** | Cập nhật tooltip và accessibility label khi có nhiều sự kiện (`Bấm xem toàn bộ ${active.length} sự kiện`). |
| `tests/contracts/imp267_active_market_event_carousel.test.ts` | Mới (L1-L160) | **Create** | Bộ 10 bài test hợp đồng Station 1 kiểm chứng hành vi lật thẻ carousel, tabs, stepper, CTA chuyển tiếp, triệt tiêu bóng ma props, và kiểm chứng tooltip của Ticker. |

---

## 1. THIẾT KẾ KIẾN TRÚC & HỢP ĐỒNG GIAO DIỆN (DEEP ARCHITECTURE)

```
MarketEventTicker (Click Ticker / Hàng sự kiện thứ K)
           │
           ▼
openModal('event', { cardType: 'market', cardId: clickedCardId })
           │
           ▼
ModalHost ──► EventCardModal (Đọc useGameStore((s) => s.activeModifiers))
                    │
                    ├─► [Single Card Mode] (Khi chỉ có 1 sự kiện hoặc cardType === 'chance'):
                    │   Hiển thị thẻ tĩnh nguyên bản, 0 carousel overhead.
                    │
                    └─► [Multi-Event Carousel Mode] (Khi isMarket && activeModifiers.length > 1):
                        ├─ Initial Index: initialIdx = Math.max(0, activeModifiers.findIndex(m => m.type === cardId))
                        ├─ Single-Row Compact Nav: [ ‹ ] [🚂 Đ.Tư] [🧊 Đ.Băng] [🌊 Bão Lũ] [ › ] (Cao 36px)
                        ├─ Dynamic Derivation: 100% title, desc, heroStat, scope, duration tính từ activeModifiers[activeIdx]
                        └─ Smart CTA: "SỰ KIỆN KẾ TIẾP (2/3) →" ➔ Thẻ cuối: "ĐÃ HIỂU TẤT CẢ"
```

- **Triệt Tiêu Lỗi Bóng Ma Props (Anti Props Stale Shadowing)**:
  - Khi `isMultiEvent === true`, toàn bộ dữ liệu hiển thị (title, description, heroStat, scope, duration, affectedCells) được tính toán động (dynamically derived) từ `activeModifiers[activeIdx].type`.
  - Không đọc đè từ `props.title` hay `props.description` tĩnh của thẻ ban đầu khi chuyển tab.
- **Tuân Thủ Anti-TIDD (Rule 8 Zero-Test-Props)**:
  - Giữ nguyên `EventCardModalProps`, không tạo cửa sau test props (`activeModifiers?: ...`, `initialIndex?: ...`).
  - `EventCardModal` đọc `useGameStore((s) => s.activeModifiers)`. Kiểm thử thực hiện chuẩn Detroit Classical qua `useGameStore.setState({ activeModifiers: [...] })`.
- **Bảo Vệ Công Thái Học Mobile 360px**:
  - Gom toàn bộ nút lật `‹`, `›` và các tab capsule vào một hàng điều hướng duy nhất cao 36px.
  - Nút CTA ở chân modal giữ nguyên cờ `shrink-0`, không bao giờ bị tràn hay che khuất.

---

## 2. CHI TIẾT CÁC TÁC VỤ TRIỂN KHAI (LEAN TASKS)

### Task 1: Tích Hợp Dynamic Derivation & Single-Row Carousel Vào `EventCardModal`
- **Target physical file**: `src/client/ui/modals/event_card_modal.tsx`
- **Logic cốt lõi**:
  - Đọc danh sách hiệu lực:
    ```typescript
    const activeModifiers = (useGameStore((s) => s.activeModifiers) ?? []).filter(
      (m) => Boolean(m && m.remainingRounds > 0)
    );
    const isMultiEvent = isMarket && activeModifiers.length > 1;
    ```
  - Thuật toán định vị chỉ số mở đầu:
    ```typescript
    const initialIdx = React.useMemo(
      () => Math.max(0, activeModifiers.findIndex((m) => String(m.type) === cardId)),
      [activeModifiers, cardId]
    );
    const [activeIdx, setActiveIdx] = React.useState<number>(initialIdx);
    ```
  - Tính toán động dữ liệu thẻ:
    - Nếu `isMultiEvent === false`: Giữ nguyên fallback props hiện tại.
    - Nếu `isMultiEvent === true`: `currentModifier = activeModifiers[activeIdx]`, `currentCardId = String(currentModifier.type)`. Đọc `detail` từ `MARKET_CARD_DETAILS[currentCardId]`, `resolvedTitle` từ `vi.marketCards[currentCardId]`, `singleTruthDescription` từ `detail`, `heroStat` từ `getCardHeroStat(currentCardId)`.
  - Render Single-Row Carousel Nav:
    - Nút `‹` và `›` (min-w 32px, h 32px).
    - Dải Tab Pills (tag lấy từ `resolveMarketShortTag(modType)`).
  - Cập nhật CTA Button:
    - Nếu `isMultiEvent && activeIdx < activeModifiers.length - 1`: nhãn `SỰ KIỆN KẾ TIẾP (${activeIdx + 2}/${activeModifiers.length}) →`, click chuyển thẻ `setActiveIdx(prev => prev + 1)`.
    - Thẻ cuối hoặc thẻ đơn: nhãn `ctaButtonText ?? 'ĐÃ HIỂU TẤT CẢ'`, click gọi `onConfirm ?? onClose`.

### Task 2: Cập Nhật Tooltip Đầy Đủ Trên `MarketEventTicker`
- **Target physical file**: `src/client/ui/market_event_ticker.tsx`
- Cập nhật thuộc tính `title` khi `active.length > 1`:
  - `title={`${title}: ${formula} (Bấm xem toàn bộ ${active.length} sự kiện)}``
  - Cung cấp tín hiệu rõ ràng cho người chơi biết click sẽ xem được toàn bộ danh sách.

---

## 3. MA TRẬN TEST HỢP ĐỒNG TRẠM 1 (STATION 1 CONTRACT SPECIFICATIONS)

> **File kiểm thử:** `tests/contracts/imp267_active_market_event_carousel.test.ts`

- TC-267.01 [UC-IMP267/MSS]: Given store chỉ có 1 sự kiện thị trường hiệu lực, When `EventCardModal` render, Then hiển thị thẻ đơn lẻ và không render container `event-card-carousel-nav`.
- TC-267.02 [UC-IMP267/MSS]: Given `cardType === 'chance'` dù store có >= 2 activeModifiers, When `EventCardModal` render, Then hiển thị thẻ Cơ Hội đơn lẻ và không kích hoạt carousel.
- TC-267.03 [UC-IMP267/MSS]: Given store có 3 activeModifiers hiệu lực, When `EventCardModal` render, Then hiển thị thanh điều hướng carousel đơn hàng tích hợp gồm tab pills và nút lật trang.
- TC-267.04 [UC-IMP267/MSS]: Given modal mở với `cardId = 'MACRO_LIQUIDITY_FREEZE'` là sự kiện thứ 2 trong danh sách, When render lần đầu, Then modal khởi tạo ngay tại chỉ số thứ 2 (`activeIdx = 1`) mà không bị kẹt ở chỉ số 0.
- TC-267.05 [UC-IMP267/MSS]: Given modal đang ở sự kiện 1/3, When người dùng click nút `›` (Next), Then tiêu đề và mô tả cập nhật động theo sự kiện 2, hoàn toàn không bị bóng ma props của sự kiện 1 che khuất.
- TC-267.06 [UC-IMP267/MSS]: Given modal đang ở sự kiện 1/3, When người dùng click nút `‹` (Prev), Then bước nhảy vòng khép kín đưa nội dung sang sự kiện thứ 3/3.
- TC-267.07 [UC-IMP267/MSS]: Given modal đang ở sự kiện 1/3, When người dùng click tab pill của sự kiện thứ 3, Then nội dung chuyển trực tiếp sang chi tiết sự kiện thứ 3.
- TC-267.08 [UC-IMP267/MSS]: Given modal đang ở sự kiện 1/3, When người dùng click nút CTA "SỰ KIỆN KẾ TIẾP", Then modal chuyển sang sự kiện 2/3 và không kích hoạt hàm `onConfirm`/`onClose`.
- TC-267.09 [UC-IMP267/A1]: Given modal đang ở sự kiện cuối cùng 3/3, When người dùng click nút CTA "ĐÃ HIỂU TẤT CẢ", Then modal gọi hàm `onConfirm`/`onClose` để đóng modal.
- TC-267.10 [UC-IMP267/MSS]: Given `MarketEventTicker` nhận danh sách có 3 sự kiện hiệu lực, When render, Then tooltip/title hiển thị thông điệp "Bấm xem toàn bộ 3 sự kiện" và badge mobile hiển thị "+2 sự kiện".

---

## 4. BẢNG ĐO LƯỜNG NGÂN SÁCH DÒNG MÃ (PRE-CODING LOC BASELINE)

| Tệp Tin Mục Tiêu | Phân Hạng Tier | Dòng Hiện Tại | Dự Kiến Sau Sửa | Biến Thiên (Delta) | Trần Ngân Sách | Đánh Giá |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `src/client/ui/modals/event_card_modal.tsx` | Tier 2 (View) | 277 | ~325 | +48 dòng | <= 500 dòng | ✔️ Safe |
| `src/client/ui/market_event_ticker.tsx` | Tier 2 (View) | 269 | ~271 | +2 dòng | <= 500 dòng | ✔️ Safe |
| `tests/contracts/imp267_active_market_event_carousel.test.ts` | Test Suite | 0 (Mới) | ~160 | +160 dòng | <= 300 dòng | ✔️ Safe |

---

## 5. TIÊU CHÍ HOÀN THÀNH NGHIỆM THU (DEFINITION OF DONE)

- [ ] **DoD #1: Flow Taxonomy**: 100% ca test mang nhãn `[UC-IMP267/MSS]` hoặc `[UC-IMP267/A#]`.
- [ ] **DoD #2: Zero Props Stale Shadowing**: 100% thông tin hiển thị trong chế độ carousel được tính toán động từ modifier đang chọn.
- [ ] **DoD #3: Anti-TIDD Compliance**: Giữ nguyên `EventCardModalProps` sạch, không đưa test-only props vào mã nguồn sản phẩm.
- [ ] **DoD #4: Mobile 360px Ergonomics**: Thanh điều hướng tích hợp đơn hàng cao 36px, không làm tràn layout hay đẩy tụt nút CTA.
- [ ] **DoD #5: Initial Index Precision**: Định vị chính xác sự kiện được click từ Desktop Ticker vào Modal.
- [ ] **DoD #6: Full Test Coverage**: Đạt tối thiểu 10 ca test hợp đồng bao phủ cả `EventCardModal` và `MarketEventTicker`.
- [ ] **DoD #7: Pre-closing Gate**: `npm run prefilter` và `node scripts/check_evidence.mjs IMP-267` đạt kết quả PASS 100%.
