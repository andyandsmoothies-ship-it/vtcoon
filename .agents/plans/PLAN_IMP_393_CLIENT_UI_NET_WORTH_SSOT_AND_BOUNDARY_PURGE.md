# PLAN_IMP_393_CLIENT_UI_NET_WORTH_SSOT_AND_BOUNDARY_PURGE

## 0. Mục Tiêu Kiến Trúc (Architectural Objective - Slice 1C)
1. **Hợp nhất công thức tính Net Worth của Client 2D UI (`src/client/ui/ui_helpers.ts`) về SSOT Domain (`src/domain/property_data.ts`) & Nối thông đường truyền `mortgageLoans` (`[ADV-01]`)**:
   - Xóa bỏ bảng hằng số `LEVEL_MULTIPLIER` khai báo trùng lặp cục bộ tại dòng 30 và công thức trừ nợ thế chấp thủ công (`deed.price * 0.5`) trong `src/client/ui/ui_helpers.ts`.
   - Import và re-export `LEVEL_MULTIPLIER` cùng hàm `calculateCellNetWorth` từ `src/domain/property_data.ts`; ủy quyền định giá từng ô đất trong `calculatePlayerNetWorth` cho `calculateCellNetWorth(cellIndex, level, mortgagedSet.has(cellIndex), mortgageLoans?.[cellIndex])`.
   - **`[ADV-01]` (`[ADV-WIRE]` Closed-Loop Presentation Wire)**: Bổ sung `readonly mortgageLoans?: Readonly<Record<number, number>>;` vào `PlayerDelta` (`src/domain/protocol/index.ts`), serialize `mortgageLoans` trong `buildPlayersDelta` (`src/server/delta_mapper.ts`), so sánh `mortgageLoans` trong `isPlayerEqual` (`src/server/network/delta_broadcaster.ts`), và thêm `'mortgageLoans'` vào `OPTIONAL_PLAYER_KEYS` (`src/client/network/apply_delta_players.ts`) để đồng bộ khoản vay thế chấp 60% (`MC_URBAN_PLANNING`) từ Server xuống `useGameStore`, `PlayerCard` và `PortfolioModalHost`.
2. **Xóa sổ 100% kết nối trực tiếp từ 14 tệp Client 2D UI (`src/client/ui/**`) sang `src/server/**` & Khóa chặt Ratchet Baseline (`[DEBT-BOUNDARY-UI]` & `[ADV-02]`)**:
   - Chuyển hướng toàn bộ **14 tệp còn lại trong `src/client/ui/**`** (5 tệp Admin UI, 6 tệp Modal Hosts & Strip, 3 tệp HUD/Lobby/PlayerCard) từ `src/server/**` sang mặt tiền chuẩn `src/domain/protocol/index.js`.
   - **`[ADV-02]`**: Làm rỗng `KNOWN_LEGACY_CLIENT_SERVER_VIOLATIONS = new Set([])` trong `scripts/boundary_linter/boundary_constants.mjs` và chuẩn hóa đuôi `.js`/`.jsx` trong `resolveImport` (`scripts/boundary_linter/boundary_rules.mjs`) để mọi import từ `src/client/**` sang `src/server/**` (kể cả có đuôi `.js`) đều bị chặn bằng lỗi cứng (`exit 1`).
3. **Rào chắn kiến trúc cho các giai đoạn tiếp theo (`[DEBT-FAT-FACADE]` & `[DEBT-SERVER-SHIMS]`)**:
   - Giữ `src/domain/protocol/index.ts` ở mức `153 LOC` (an toàn dưới ngưỡng Buffer Zone `350 LOC`); ghi nhận quy ước bắt buộc tách thành `wire_delta.ts`, `wire_intent.ts`, `wire_ws.ts`, `wire_admin.ts` khi file vượt ngưỡng `300-350 LOC`.
   - Ghi nhận lộ trình thu hồi 3 tệp Transitional Shims phía Server (`delta_types.ts`, `network_types.ts`, `admin_types.ts`) sau khi toàn bộ `src/server/**` và `tests/**` chuyển sang import trực tiếp từ `src/domain/protocol/index.js`.

## 1. Phạm Vi Tệp & Ngân Sách Dòng Lệnh (Direct Scope & Honest LOC Accounting)

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Ceiling | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/ui/ui_helpers.ts` | Tier 2 (UI) | 288 | 282 | ~-6 | 500 | Safe |
| `src/domain/protocol/index.ts` | Tier 1 (Domain) | 152 | 152 | 0 | 400 | Safe |
| `src/server/delta_mapper.ts` | Tier 1 (Server) | 269 | 270 | ~+1 | 400 | Safe |
| `src/server/network/delta_broadcaster.ts` | Tier 1 (Server) | 237 | 242 | ~+5 | 400 | Safe |
| `src/client/network/apply_delta_players.ts` | Tier 1 (Network) | 269 | 269 | 0 | 400 | Safe |
| `src/client/ui/player_card_helpers.ts` | Tier 2 (UI) | 136 | 136 | 0 | 500 | Safe |
| `src/client/ui/hud_container.tsx` | Tier 2 (UI) | 137 | 137 | 0 | 500 | Safe |
| `src/client/ui/lobby/pre_match_deck.tsx` | Tier 2 (UI) | 393 | 393 | 0 | 500 | Safe |
| `src/client/ui/modals/modal_host.tsx` | Tier 2 (UI) | 296 | 296 | 0 | 500 | Safe |
| `src/client/ui/modals/bot_trade_offer_strip.tsx` | Tier 2 (UI) | 271 | 271 | 0 | 500 | Safe |
| `src/client/ui/modals/hosts/auction_modal_host.tsx` | Tier 2 (UI) | 85 | 85 | 0 | 500 | Safe |
| `src/client/ui/modals/hosts/deed_modal_host.tsx` | Tier 2 (UI) | 106 | 106 | 0 | 500 | Safe |
| `src/client/ui/modals/hosts/portfolio_modal_host.tsx` | Tier 2 (UI) | 109 | 109 | 0 | 500 | Safe |
| `src/client/ui/modals/hosts/trade_modal_host.tsx` | Tier 2 (UI) | 133 | 133 | 0 | 500 | Safe |
| `src/client/ui/admin/admin_archive_view.tsx` | Tier 2 (UI) | 86 | 86 | 0 | 500 | Safe |
| `src/client/ui/admin/admin_live_view.tsx` | Tier 2 (UI) | 336 | 336 | 0 | 500 | Safe |
| `src/client/ui/admin/admin_log_row.tsx` | Tier 2 (UI) | 25 | 25 | 0 | 500 | Safe |
| `src/client/ui/admin/admin_repro.ts` | Tier 2 (UI) | 87 | 87 | 0 | 500 | Safe |
| `src/client/ui/admin/use_admin_portal.ts` | Tier 2 (UI) | 312 | 311 | ~-1 | 500 | Safe |
| `scripts/boundary_linter/boundary_constants.mjs` | Tooling | 37 | 22 | ~-15 | 9999 | Safe |
| `scripts/boundary_linter/boundary_rules.mjs` | Tooling | 187 | 189 | ~+2 | 9999 | Safe |
| `docs/FEATURE_MAP.md` | Tier 3 (Docs) | 93 | 93 | 0 | 800 | Safe |
| `tests/client/imp393_client_ui_net_worth_ssot_and_boundary_purge.test.ts` | Living Test | 0 | 225 | ~+225 | 600 | Safe (New File) |

## 2. Nghiên Cứu Tiền Trạm & Bất Biến (Pre-Flight Research & Invariants)
- **Authoritative Tri-Layer Net Worth & Wire Sync Invariant (`[ADV-01]`)**: `calculatePlayerNetWorth` trong `src/client/ui/ui_helpers.ts` bắt buộc gọi `calculateCellNetWorth(cellIndex, level, mortgagedSet.has(cellIndex), mortgageLoans?.[cellIndex])` từ `src/domain/property_data.ts`; đồng thời `mortgageLoans` phải được truyền xuyên suốt từ `buildPlayersDelta` $\rightarrow$ `isPlayerEqual` (`buildSparseDelta`) $\rightarrow$ `applyPlayerDeltas` (`OPTIONAL_PLAYER_KEYS`) xuống `useGameStore` để `PlayerCard` và `PortfolioModalHost` hiển thị chính xác khoản vay 60% của thẻ `MC_URBAN_PLANNING`.
- **Zero Client-to-Server Boundary & Locked Ratchet Invariant (`[ADV-02]`)**: Cả 14 tệp giao diện 2D còn lại trong `src/client/ui/**` phải import các kiểu từ `src/domain/protocol/index.js`; `KNOWN_LEGACY_CLIENT_SERVER_VIOLATIONS` phải rỗng (`size === 0`) và `resolveImport` phải giải được đường dẫn `.js`/`.jsx`.

## 3. Station 1: Đặc Tả Kiểm Thử Hợp Đồng (RED - Contract Specification)
**Target test file**: `tests/client/imp393_client_ui_net_worth_ssot_and_boundary_purge.test.ts`

1. **`TC-393.01`**: `[UC-UI-NETWORTH-SSOT-MORTGAGE-CLAMP/MSS]` **Given** bảng `LEVEL_MULTIPLIER` từ `src/domain/property_data.ts` và danh mục tài sản có ô `39` (`price = 4000`) đang thế chấp (`mortgagedCellIndices = [39]`) nhưng `levelMap` chứa `level = 2`, **When** gọi `calculatePlayerNetWorth(1000, [39], { 39: 2 }, [39])` từ `src/client/ui/ui_helpers.ts`, **Then** tham chiếu `LEVEL_MULTIPLIER` của `ui_helpers.ts` trùng khớp `===` với `property_data.ts` và giá trị trả về bằng `3000` (`1000 + 2000`, kẹp `effectiveLevel = 0` thay vì tính sai thành `9000`).
2. **`TC-393.02`**: `[UC-UI-NETWORTH-TRILAYER-PARITY/MSS]` **Given** người chơi `p1` có `balance: 5000`, sở hữu ô `1` (`price = 600`, `level = 1`, không thế chấp $\rightarrow 900$) và ô `39` (`price = 4000`, `level = 2` trong `levelMap`, đang thế chấp với khoản vay 60% `mortgageLoans: { 39: 2400 }` $\rightarrow 1600$), **When** định giá danh mục qua `calculatePlayerNetWorth` (`ui_helpers.ts`), `calculateNetWorth` (`room_manager_queries.ts`) cùng `evaluatePlayerNetWorth` (`bot_posture.ts`), **Then** cả 3 hàm ở 3 tầng đều trả về chính xác `7500`.
3. **`TC-393.03`**: `[UC-UI-PORTFOLIO-HOST-WIRE-SYNC/MSS]` **Given** phòng chơi trên Server có người chơi `p1` (`balance: 2000`, sở hữu ô `39` đang thế chấp với khoản vay 60% `mortgageLoans: { 39: 2400 }`), **When** đồng bộ gói tin qua `buildDeltaFromRoom` $\rightarrow$ `buildSparseDelta` $\rightarrow$ `applyDeltaToStore` rồi render `PortfolioModalHost`, **Then** `useGameStore.getState().players[0]?.mortgageLoans?.[39]` bằng `2400` và phần tử `PropertyPortfolioModal` nhận prop `playerNetWorth` bằng đúng `3600` (`2000 + 1600`).
4. **`TC-393.04`**: `[UC-UI-ADMIN-BOUNDARY-PURGE/MSS]` **Given** 5 tệp Admin UI (`src/client/ui/admin/admin_archive_view.tsx`, `src/client/ui/admin/admin_live_view.tsx`, `src/client/ui/admin/admin_log_row.tsx`, `src/client/ui/admin/admin_repro.ts`, `src/client/ui/admin/use_admin_portal.ts`), **When** phân tích các câu lệnh `import` ở cấp module của cả 5 tệp qua `lintFileBoundaries`, **Then** số lượng import trỏ vào `server/` bằng `0` và cả 5 tệp đều import hợp đồng từ `../../../domain/protocol/index.js`.
5. **`TC-393.05`**: `[UC-UI-MODALS-BOUNDARY-PURGE/MSS]` **Given** 6 tệp Modal Hosts & Strip (`src/client/ui/modals/hosts/auction_modal_host.tsx`, `src/client/ui/modals/hosts/deed_modal_host.tsx`, `src/client/ui/modals/hosts/portfolio_modal_host.tsx`, `src/client/ui/modals/hosts/trade_modal_host.tsx`, `src/client/ui/modals/modal_host.tsx`, `src/client/ui/modals/bot_trade_offer_strip.tsx`), **When** phân tích các câu lệnh `import` của cả 6 tệp qua `lintFileBoundaries`, **Then** số lượng import trỏ vào `server/` bằng `0` và tất cả đều import `PlayerIntent` từ `domain/protocol/index.js`.
6. **`TC-393.06`**: `[UC-UI-HUD-LOBBY-PLAYERCARD-RATCHET-LOCK/MSS]` **Given** 3 tệp `src/client/ui/hud_container.tsx`, `src/client/ui/lobby/pre_match_deck.tsx`, `src/client/ui/player_card_helpers.ts` cùng tập `KNOWN_LEGACY_CLIENT_SERVER_VIOLATIONS`, **When** kiểm tra `lintFileBoundaries` và `resolveImport` với đường dẫn có đuôi `.js`, **Then** cả 3 tệp có `0` import trỏ vào `server/`, `KNOWN_LEGACY_CLIENT_SERVER_VIOLATIONS.size` bằng `0`, và một tệp giả lập import `../../../server/intent_dispatcher.js` bị bắt lỗi cứng `errors.length === 1`.
7. **`TC-393.07`**: `[UC-UI-PLAYERCARD-HELPERS-PROTOCOL-WIRING/MSS]` **Given** một `PendingTradeOfferDelta` từ `src/domain/protocol/index.ts` (`offerId: 'o1', sellerId: 'p1', buyerId: 'p2', cellIndex: 12, offeredCellIndex: 5, price: 800, expiresAt: 9999`) và `player_card_helpers.ts` đã chuyển sang import từ `../../domain/protocol/index.js`, **When** gọi `resolvePlayerTradingCells` cho người chơi `'p1'`, **Then** hàm trả về `ReadonlySet<number>` chứa đúng `2` ô (`12` và `5`) đồng thời tệp `player_card_helpers.ts` có `0` import từ `server/`.

## 4. Station 2: Đặc Tả Triển Khai (GREEN - Implementation Specification)

### Task 1: Hợp nhất `calculatePlayerNetWorth` tại `src/client/ui/ui_helpers.ts` & Nối thông đường truyền `mortgageLoans` (`[ADV-01]`)
**Target physical file**: `src/client/ui/ui_helpers.ts`
- **Call-Site Wiring**:
  1. `src/client/ui/ui_helpers.ts`: Tại dòng 2, thay `import { PROPERTY_DEEDS } from '../../domain/property_data';` bằng `import { LEVEL_MULTIPLIER, calculateCellNetWorth } from '../../domain/property_data';` và bổ sung `LEVEL_MULTIPLIER` vào `export { ... }` (xóa dòng 30 `const LEVEL_MULTIPLIER...`). Trong `calculatePlayerNetWorth` (dòng 53–79), thay thân vòng lặp `for (const cellIndex of uniqueOwned)` bằng `const level = (levelMap ?? {})[cellIndex] ?? 0; worth += calculateCellNetWorth(cellIndex, level, mortgagedSet.has(cellIndex), mortgageLoans?.[cellIndex]);`.
  2. `src/domain/protocol/index.ts` (dòng 16): Bổ sung `readonly mortgageLoans?: Readonly<Record<number, number>>;` vào interface `PlayerDelta`.
  3. `src/server/delta_mapper.ts` (dòng 109): Trong `buildPlayersDelta`, bổ sung `...(p.mortgageLoans !== undefined ? { mortgageLoans: { ...p.mortgageLoans } } : {}),`.
  4. `src/server/network/delta_broadcaster.ts` (dòng 43–58): Trong `isPlayerEqual`, so sánh `a.mortgageLoans` và `b.mortgageLoans` (`const aLoans = a.mortgageLoans ?? {}; const bLoans = b.mortgageLoans ?? {}; const aLoanKeys = Object.keys(aLoans); const loansEqual = aLoanKeys.length === Object.keys(bLoans).length && aLoanKeys.every((k) => aLoans[Number(k)] === bLoans[Number(k)]);`) và nối `&& loansEqual` vào điều kiện trả về.
  5. `src/client/network/apply_delta_players.ts` (dòng 108): Bổ sung `'mortgageLoans'` vào mảng `OPTIONAL_PLAYER_KEYS`.

### Task 2: Chuyển hướng dứt điểm 14 tệp `src/client/ui/**` sang `src/domain/protocol/index.js` & Khóa chặt Ratchet Baseline (`[ADV-02]`)
**Target physical file**: `src/client/ui/player_card_helpers.ts`
- **Call-Site Wiring** (Danh mục tường minh toàn bộ 14 tệp UI và 2 tệp Boundary Linter):
  1. `src/client/ui/player_card_helpers.ts` (dòng 3): Thay `../../server/session_manager` bằng `../../domain/protocol/index.js`.
  2. `src/client/ui/hud_container.tsx` (dòng 20): Thay `../../server/intent_dispatcher` bằng `../../domain/protocol/index.js`.
  3. `src/client/ui/lobby/pre_match_deck.tsx` (dòng 12): Thay `../../../server/network/network_types` bằng `../../../domain/protocol/index.js`.
  4. `src/client/ui/modals/modal_host.tsx` (dòng 20): Thay `../../../server/intent_dispatcher` bằng `../../../domain/protocol/index.js`.
  5. `src/client/ui/modals/bot_trade_offer_strip.tsx` (dòng 9): Thay `../../../server/intent_dispatcher.js` bằng `../../../domain/protocol/index.js`.
  6. `src/client/ui/modals/hosts/auction_modal_host.tsx` (dòng 4): Thay `../../../../server/intent_dispatcher` bằng `../../../../domain/protocol/index.js`.
  7. `src/client/ui/modals/hosts/deed_modal_host.tsx` (dòng 9): Thay `../../../../server/intent_dispatcher` bằng `../../../../domain/protocol/index.js`.
  8. `src/client/ui/modals/hosts/portfolio_modal_host.tsx` (dòng 4): Thay `../../../../server/intent_dispatcher` bằng `../../../../domain/protocol/index.js`.
  9. `src/client/ui/modals/hosts/trade_modal_host.tsx` (dòng 4): Thay `../../../../server/intent_dispatcher` bằng `../../../../domain/protocol/index.js`.
  10. `src/client/ui/admin/admin_archive_view.tsx` (dòng 3): Thay `../../../server/network/admin_manager` bằng `../../../domain/protocol/index.js`.
  11. `src/client/ui/admin/admin_live_view.tsx` (dòng 3): Thay `../../../server/network/admin_types` bằng `../../../domain/protocol/index.js`.
  12. `src/client/ui/admin/admin_log_row.tsx` (dòng 3): Thay `../../../server/network/admin_manager` bằng `../../../domain/protocol/index.js`.
  13. `src/client/ui/admin/admin_repro.ts` (dòng 2): Thay `../../../server/network/admin_manager` bằng `../../../domain/protocol/index.js` (giữ nguyên chuỗi template sinh test Vitest ở dòng 72).
  14. `src/client/ui/admin/use_admin_portal.ts` (dòng 3–11): Gộp 2 câu lệnh import từ `../../../server/network/admin_types` và `../../../server/network/network_types` thành 1 câu lệnh import duy nhất từ `../../../domain/protocol/index.js`.
  15. `scripts/boundary_linter/boundary_constants.mjs` (dòng 17–33): Đặt `export const KNOWN_LEGACY_CLIENT_SERVER_VIOLATIONS = new Set([]);`.
  16. `scripts/boundary_linter/boundary_rules.mjs` (dòng 20–29): Chuẩn hóa đuôi `.js`/`.jsx` trong `resolveImport` (`const cleanSpecifier = importSpecifier.replace(/\.(js|jsx)$/, ''); const resolvedBase = path.resolve(dir, cleanSpecifier);`) trước khi dò tìm `.ts`/`.tsx`.

### Task 3: Cập nhật `docs/FEATURE_MAP.md` (Knowledge Fold)
**Target physical file**: `docs/FEATURE_MAP.md`
- **Call-Site Wiring**: Cập nhật dòng Pillar **01 (Board & Properties)**, Pillar **11 (FSM Lifecycle & WebSocket Sync)** và Pillar **14 (UI & Tactile Ergonomics)** tại `docs/FEATURE_MAP.md` ghi nhận `IMP-393` (đồng bộ 3 tầng Net Worth SSOT qua `calculatePlayerNetWorth` tại `src/client/ui/ui_helpers.ts` và truyền `mortgageLoans` qua `PlayerDelta`, xóa sạch 100% phụ thuộc Client UI sang Server thông qua `src/domain/protocol/index.ts`, khóa chặt Ratchet Baseline `KNOWN_LEGACY_CLIENT_SERVER_VIOLATIONS`, cùng quy ước ngưỡng tách `350 LOC` cho `src/domain/protocol/` và vòng đời Transitional Shims phía Server), giữ nguyên tổng số dòng của bảng.

## 5. Definition of Done (DoD) & Ranh Giới Dừng (Stopping Boundary)
1. **Tri-Layer Net Worth Parity & Closed-Loop Wire Sync**: `calculatePlayerNetWorth` (`ui_helpers.ts`), `calculateNetWorth` (`room_manager_queries.ts`) và `evaluatePlayerNetWorth` (`bot_posture.ts`) đều ủy quyền định giá từng ô cho `calculateCellNetWorth` (`property_data.ts`), và `mortgageLoans` được truyền nguyên vẹn từ Server xuống `useGameStore`.
2. **100% Client Boundary Purge & Ratchet Lock**: Chạy `npm run lint:boundaries` xác nhận **0 tệp** trên toàn bộ `src/client/**` còn import trực tiếp từ `src/server/**`, với `KNOWN_LEGACY_CLIENT_SERVER_VIOLATIONS.size === 0`.
3. **Mechanical Gates & Evidence Verification**: Pass 100% `npm run prefilter`, `node scripts/check_scope.mjs`, `npm run sentinel -- --ticket IMP-393 --test tests/client/imp393_client_ui_net_worth_ssot_and_boundary_purge.test.ts --src src/client/ui/ui_helpers.ts`, và `node scripts/check_evidence.mjs IMP-393`.
4. **Stopping Boundary**: Hoàn tất trọn vẹn Gói "Nền Tảng Vàng" (Slice 1A `IMP-391` + Slice 1B `IMP-392` + Slice 1C `IMP-393`) và dừng lại báo cáo nghiệm thu.
