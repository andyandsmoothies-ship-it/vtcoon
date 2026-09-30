# BÁO CÁO NGHIỆM THU HOÀN THÀNH: IMP-234
# KHỬ ĐIỂM MÙ TÁC ĐỘNG THẺ SỰ KIỆN: VIỀN HÀO QUANG 3D, HUY HIỆU ĐẾM LÙI SỐ VÒNG & ĐỒNG BỘ ĐA THIẾT BỊ

> **Mã định danh:** IMP-234  
> **Phân loại:** Tier 2 (Full Rigor — 3D Visual Geometry, Mobile Touch & Store Coordination)  
> **Thời điểm hoàn thành:** 2026-09-30  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN GIẢI PHÁP & GIÁ TRỊ MANG LẠI

1. **Khử Điểm Mù Thị Giác Trên Sa Bàn 3D**:
   - Khi các phiếu sự kiện (Cơ hội, Thị trường, Vĩ mô) có tác động đến ô đất cụ thể (như `MC_NIGHT_ECONOMY` nhân đôi tiền thuê, `MC_LAND_FEVER` tăng 50% giá đất/thuê, `MC_ALCOHOL_CHECK` giảm 50% tiền thuê, `CC_BUILD_HALT` đình chỉ xây dựng...), sa bàn 3D lập tức hiển thị viền hào quang phát quang `TileEventAuraRim` tại cao độ Y = 0.042m (args={[1.82, 0.08, 2.34]}). Kích thước này bao trọn ngoài chân đế cờ và `OwnerBaseTrimBorder` (1.78x2.30), triệt tiêu hoàn toàn Z-fighting kể cả khi ô đất đã có chủ.
   - Huy hiệu nổi 3D `TileEventFloatingBadge` (`SafeBillboard` tại cao độ Y = 0.52m) hiển thị rõ ràng Icon (🔥, 🌙, 🚨, ❄️...) + Nhãn tỷ lệ (x2 Thuê, +50%, -50%) + Bộ đếm lùi số vòng (⏳ 2V, tự động nhấp nháy `isExpiringSoon` khi còn 1 vòng).
2. **Tương Tác 1-Tap Ticker Spotlight & An Toàn Bộ Nhớ**:
   - Chạm vào banner sự kiện `MarketEventTicker` kích hoạt chớp sáng (Spotlight Flash) các ô đất chịu tác động trên bàn cờ trong 3000ms.
   - Quản lý bộ đếm an toàn tuyệt đối bằng `useRef`, huỷ timer cũ khi click liên tiếp và dọn sạch state khi component unmount trong `useEffect`, triệt tiêu hoàn toàn stale closure và memory leak.
3. **Chuẩn Hóa Cấu Trúc Zustand State vs Actions**:
   - `GameState` data interface chỉ chứa trường dữ liệu thuần túy `spotlightedCellIndices?: readonly number[] | null;` (được Pick vào `InitialGameState` và khởi tạo `null` trong `INITIAL_GAME_STATE`).
   - Action creator `setSpotlightedCells` được đưa vào phần Actions của `GameState` và triển khai trong `game_store.ts`, bảo đảm nguyên lý Single Responsibility Principle (SRP).
4. **Công Thái Học Mobile 360px & Modal Trực Quan**:
   - Ticker item đạt sàn cảm ứng `min-h-[44px]` chuẩn WCAG AAA.
   - Thẻ sự kiện `EventCardModal` hiển thị khối `event-affected-cells-list` tra cứu tên địa danh có cấu trúc từ `BOARD_CONFIG[idx]?.name`, không còn phụ thuộc vào việc bóc tách chuỗi regex.

---

## 2. BẢNG NGÂN SÁCH DÒNG MÃ VẬT LÝ ĐỐI CHIẾU CHUẨN (AUTOMATED VIA scripts/check_loc.mjs)

> *Ghi chú chuẩn hóa*: Bảng liệt kê đầy đủ cả **Tổng số dòng vật lý (Total Lines)** và **Dòng mã thực tế loại trừ dòng trống/chú thích (Non-Empty SLOC)** đo đạc trực tiếp từ đĩa vật lý để làm SSOT historical baseline chính xác cho các ticket kế tiếp.

| Tệp vật lý | Phân loại Tier | Total Lines | Non-Empty SLOC | Trần quy định | Trạng thái |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/client/3d/tile_event_aura.tsx` | Tier 2 (3D/Views) | **186** | **166** | <= 500 LOC | ✔️ Safe |
| `src/client/3d/board_tile.tsx` | Tier 2 (3D/Views) | **448** | **414** | <= 500 LOC | ⚠️ Warning (448 > 400, < 500) |
| `src/client/store/game_store_types.ts` | Tier 1 (Logic/Store) | **386** | **361** | <= 400 LOC | ⚠️ Warning (386 > 300, < 400) |
| `src/client/store/game_store.ts` | Tier 1 (Logic/Store) | **389** | **357** | <= 400 LOC | ⚠️ Warning (389 > 300, < 400) |
| `src/client/ui/market_event_ticker.tsx` | Tier 2 (UI/Views) | **288** | **268** | <= 500 LOC | ✔️ Safe |
| `src/client/ui/modals/event_card_modal.tsx` | Tier 2 (UI/Views) | **263** | **241** | <= 500 LOC | ✔️ Safe |
| `tests/contracts/imp234_dynamic_board_cell_event_highlights.test.ts` | Living Test | **394** | **339** | <= 650 LOC | ✔️ Safe |

---

## 3. KẾT QUẢ QUY TRÌNH 4 TRẠM KHÉP KÍN (4-STATION PIPELINE)

1. **Trạm 1 (QA RED - Adversarial Inversion)**:
   - Tạo `tests/contracts/imp234_dynamic_board_cell_event_highlights.test.ts` gồm 16 atomic tests.
   - Inversion Gate xác nhận 16/16 tests FAIL vì thiếu logic nghiệp vụ trước khi code.
2. **Trạm 2 (GREEN Implementation)**:
   - Triển khai tối thiểu và sạch sẽ mã nguồn vào `src/**`.
   - Toàn bộ 16/16 contract tests chuyển sang trạng thái GREEN.
3. **Trạm 2.5 (Fast Pre-Filter Sweep)**:
   - `npx tsc --noEmit` đạt 0 lỗi.
   - 0 dirty casts (`as any`, `as unknown as`).
   - 0 `console.log` / debugger rác trong mã nguồn production.
   - **Locale Portability Scan (Retroactively Verified)**: 0 phát hiện `toLocaleString` trên toàn bộ 7 tệp mới/sửa, bảo đảm không bị phân tách số lệ thuộc hệ điều hành.
4. **Trạm 3 (Independent Review Funnel)**:
   - *Phase 3.0*: Kiểm định ảnh chụp in-game `.agents/tmp/imp-234_event_aura_board.jpg` qua cổng vật lý.
   - *Phase 3.1 Spec Reviewer*: APPROVED (100% spec reconciliation, 0 scope drift).
   - *Phase 3.2 Deep Architecture*: APPROVED (Không rò rỉ timer/GC, SRP chuẩn, an toàn kiểu dữ liệu).
   - *Phase 3.2 3D Visual Critic*: APPROVED (Đạt chuẩn thẩm mỹ Retropoly, triệt tiêu Z-fighting, `castShadow={false}`).
   - *Phase 3.2 2D UI Craft*: APPROVED (Điểm 10/10, touch target 44px, WCAG AAA).
5. **Trạm 4 (Chaos Sentinel & Mutation Probes)**:
   - **Probe 1 (Closed-Loop Parity)**: 24/24 Intent đối xứng tuyệt đối (gatewayCount: 24, coreCount: 24, `intentCount: 24`).
   - **Probe 2 (Ephemeral Boundary)**: Dynamic port 0 live WebSocket handshake (port 58550) & clean teardown < 2s.
   - **Probe 3 (Targeted Mutation Sensitivity)**: 6/6 mutants bị tiêu diệt (vượt floor >= 5 tests), 0 mutants sống sót. Đã bao phủ các nhánh: `isExpiringSoon` logic, spotlight timeout 3000ms guard, `isSpotlighted` active state, `isActive: false` on zero-round, primary boolean và numeric delta.
   - Snapshot `.agents/evidence/chaos_sentinel_IMP-234.json` được ký duyệt APPROVED.
