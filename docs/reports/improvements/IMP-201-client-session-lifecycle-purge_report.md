# [REPORT] IMP-201: Client Session Lifecycle Purge & Cross-Match State Isolation

## 1. THÔNG TIN TỔNG QUAN
- **Mã Ticket**: IMP-201
- **Tiêu Đề**: Client Session Lifecycle Purge & Cross-Match State Isolation (Cô lập trạng thái ván chơi & Xóa sạch nhật ký ván cũ khi rời phòng hoặc tạo ván mới)
- **Phân Hạng**: Tier 2 (Full Rigor) — Đã hoàn thành 3 Trạm (Station 1 RED $\rightarrow$ Station 2 GREEN $\rightarrow$ Station 2.5 Scout $\rightarrow$ Station 3 Independent Review).
- **Trạng Thái**: COMPLETE (HOÀN TẤT 100%)

---

## 2. NGUYÊN NHÂN CỐT LÕI & GIẢI PHÁP
- **Hiện tượng**: Khi chơi vài vòng rồi bấm "Thoát game" và tạo phòng mới, nhật ký ván đấu cũ vẫn hiển thị ở đầu danh sách.
- **Nguyên nhân**:
  1. VTCOON là SPA, các Zustand stores (`useActivityStore`, `useTelemetryStore`, `useGameStore`, `useVfxStore`) là singleton trong RAM.
  2. `handleLeaveRoom` trước đây chỉ reset `lobbyStore` và 4 fields tạm thời của `gameStore`, bỏ quên `activityStore.clearLogs()`, `telemetryStore.reset()`, `vfxStore`, và các tracker deduplication keys (`lastProcessedEventCardKey`, `lastAuctionBid`).
  3. `addActivityLog` dùng cú pháp append `[...activityLogs, entry]`, làm log ván mới bị nối đuôi sau log cũ.
- **Giải pháp**:
  - Tạo Deep Module SSOT: [`src/client/network/client_session_purger.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/client_session_purger.ts) (43 LOC) với hàm `purgeClientMatchSession(options?)`.
  - Thiết kế Tam Tầng Phòng Vệ (Defense-in-Depth):
    * *Egress*: `handleLeaveRoom` ủy quyền hoàn toàn cho `resetLobby()` dọn dẹp sạch sẽ (gameStarted: false trước khi purge gameStore).
    * *Ingress*: `createCustomRoom()`, `joinCustomRoom()`, `startGame()` chủ động purge trước khi vào ván.
    * *Genesis Boundary*: `applyDelta` kích hoạt purge khi `isFullSync && delta.tick <= 1`.
  - Reconnect Preservation Guard: Khi `delta.tick > 1`, tuyệt đối không purge, bảo toàn 100% nhật ký cho người chơi kết nối lại giữa ván.
  - Post-Match Log Preservation: Không purge trong `syncGameStarted`, bảo toàn nhật ký khi ván kết thúc.

---

## 3. FILE MUTATION & LOC COMPLIANCE (ĐĨA VẬT LÝ)
| File | Hành Động | LOC Thực Tế | Ngân Sách Trần | Kết Quả |
| :--- | :---: | :---: | :---: | :---: |
| `src/client/network/client_session_purger.ts` | TẠO MỚI | 43 | <= 400 | ĐẠT |
| `src/client/store/activity_store.ts` | SỬA ĐỔI | 139 | <= 300 | ĐẠT |
| `src/client/network/use_app_turn_controls.ts` | SỬA ĐỔI | 125 | <= 400 | ĐẠT |
| `src/client/store/lobby_store.ts` | SỬA ĐỔI | 280 | <= 300 | ĐẠT |
| `src/client/network/apply_delta.ts` | SỬA ĐỔI | 290 | <= 290 | ĐẠT |
| `tests/contracts/imp201_client_session_lifecycle_purge.test.ts` | TẠO MỚI | 498 | <= 600 | ĐẠT |

---

## 4. KẾT QUẢ KIỂM THỬ & CHỨNG NHẬN TRẠM (STATION AUDIT)
- **Station 1 (RED Contract Test)**: `qa-tester` tạo 20 atomic tests, chứng minh thất bại (17 failed | 3 passed, Exit code 1).
- **Station 2 (GREEN Implementation)**: `implementer` viết mã nguồn tối thiểu, lật thành công 20/20 tests PASS (100% GREEN).
- **Station 2.5 (Sweeping Scout Audit)**: `scout` quét sạch 5 archetypes khuyết tật trên 5 file vật lý $\rightarrow$ Phán quyết: PASS.
- **Station 3 (Independent Review)**:
  * `spec-reviewer`: **SPEC_PASS** (100% đối chiếu đặc tả không trôi dạt).
  * `code-reviewer`: **CODE_PASS** (TypeScript 0 lỗi, deep module, observable behavior).
- **Toàn bộ hệ thống**:
  * Vitest Suite: **338/338 test files PASS (6.754 tests)**.
  * UI Linter: **0 anti-patterns across 192 files**.
  * TypeScript compiler (`tsc --noEmit`): **0 errors, 0 warnings**.
  * Automated Evidence Snapshot: `.agents/evidence/imp-201_snapshot.json`.
  * Domain Invariant: Đã lưu **Gotcha #283** vào `docs/domain/gotchas.md`.
