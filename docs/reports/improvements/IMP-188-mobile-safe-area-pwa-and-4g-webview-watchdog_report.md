# BÁO CÁO NGHIỆM THU: IMP-188 — TỐI ƯU MÀN HÌNH TOÀN CẢNH (SAFE-AREA & PWA) & TĂNG CƯỜNG ĐỘ BỀN MẠNG 4G / IN-APP WEBVIEW

> **Mã Vé:** `IMP-188`  
> **Dự Án:** VTCOON — Cờ Tỷ Phú 3D Bản Sắc Việt Nam  
> **Thời Gian Nghiệm Thu:** 2026-09-24  
> **Trạng Thái:** 🟢 **HOÀN TẤT & ĐÃ DUYỆT TRẠM 3 (APPROVED & SHIP)**  
> **Tài Liệu Kế Hoạch:** [`docs/plans/improvements/IMP-188-mobile-safe-area-pwa-and-4g-webview-watchdog_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-188-mobile-safe-area-pwa-and-4g-webview-watchdog_plan.md)  
> **Kiểm Toán Đối Kháng:** [`.agents/audit/PLAN_AUDIT_IMP188.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP188.md)  
> **Snapshot Bằng Chứng:** [`.agents/evidence/imp188_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp188_snapshot.json)  

---

## 1. TỔNG QUAN KẾT QUẢ ĐẠT ĐƯỢC

Vé **IMP-188** đã xử lý triệt để các khoảng trống kỹ thuật di động đa nền tảng và đa trình duyệt theo kết luận từ bản kiểm toán `AUDIT-MOBILE-2026-09-REV2`:

1. **Công Thái Học Vùng An Toàn Đỉnh (Safe-Area Inset Top)**:
   - Thẻ `<header>` của [`src/client/ui/top_bar.tsx#L80`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/top_bar.tsx#L80) được bổ sung class `pt-[calc(0.375rem+env(safe-area-inset-top))]`.
   - Bảo vệ tuyệt đối thông tin vòng đấu, đồng hồ đếm ngược và nút rời phòng khỏi bị che khuất bởi Dynamic Island / tai thỏ trên iPhone 14–16 Pro và camera đục lỗ (punch-hole) trên Android hiện đại (Samsung Galaxy, Xiaomi, Pixel).
2. **Nền Tảng PWA Standalone & Thẻ Meta Trình Duyệt Quả Táo**:
   - Khởi tạo tệp Web App Manifest chuẩn [`public/manifest.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/public/manifest.json) với `display: "standalone"`, `orientation: "portrait"`, trỏ icon hợp lệ vào `/favicon.ico` thực tế (triệt tiêu 100% rủi ro 404 ghost asset).
   - Bổ sung các thẻ `meta` chuyên biệt trong [`index.html#L8-L11`](file:///c:/Users/HP/Documents/GitHub/vtcoon/index.html#L8-L11) (`apple-mobile-web-app-capable="yes"`, `apple-mobile-web-app-status-bar-style="black-translucent"`, `apple-mobile-web-app-title="VTCOON"`, `link rel="manifest"`).
3. **Mô-Đun Độc Lập `ws_liveness_watchdog.ts` & Single 1000ms Heartbeat Pattern**:
   - Trích xuất [`src/client/network/ws_liveness_watchdog.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/ws_liveness_watchdog.ts) với kiến trúc **DUY NHẤT 1 `setInterval(1000ms)`** sử dụng `performance.now()` đơn điệu (monotonic, chống lỗi nhảy giờ NTP).
   - **Zero-Allocation Packet Ingestion**: Hàm `recordPacketReceived()` cập nhật ref O(1), triệt tiêu hoàn toàn hiện tượng cấp phát timer mới gây khựng giật rác (Garbage Collection stutter) trên R3F 3D Canvas.
   - **Clock Drift Detector**: Phát hiện luồng JS bị đóng băng trong background hoặc Zalo WebView ($\Delta t \ge 5000\text{ms}$), debounced 200ms chống bão sự kiện thức giấc (wake-up stampede).
   - **Silent NAT Watchdog 12.5s**: Canh chừng mất kết nối ngầm qua mạng 4G di động (căn cứ theo $2.5 \times \text{HEARTBEAT\_INTERVAL\_MS} = 12.5\text{s}$ của Server). Khi câm lặng quá 12.5s, watchdog gọi `socket.close()` an toàn một lần duy nhất, nhường quyền tái kết nối cho `socket.onclose` tiêu chuẩn, triệt tiêu hoàn toàn rủi ro 2 socket kết nối kép song song (Double-Connect Race).
   - **Quản lý Resync Watchdog**: Đưa bộ đếm 2.5s vào quản lý tập trung, tự động hủy khi nhận delta mới.
4. **Tái Cấu Trúc Trừ Dần (Subtractive Refactoring) `use_game_ws.ts`**:
   - Xóa bỏ 81 dòng mã cũ (`wakeupDebounceTimerRef`, `resyncWatchdogRef`, `handleWakeup`, event listeners).
   - Hạ kích thước tệp từ **394 LOC** xuống còn **365 LOC** (nằm sâu dưới trần 400 LOC Tier 1).
5. **Banner Điều Hướng Thoát In-App WebView (Zalo/Messenger)**:
   - Tạo component [`src/client/ui/in_app_browser_banner.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/in_app_browser_banner.tsx) neo `fixed top-0 left-0 right-0 z-50 pointer-events-auto`, đệm `pt-[env(safe-area-inset-top)]`.
   - Cung cấp chỉ dẫn bấm menu "⋯" ➔ "Mở bằng trình duyệt ngoài", nút "📋 Sao chép liên kết" (`navigator.clipboard`) và nút "✕ Bỏ qua" lưu `sessionStorage`, bảo đảm 0 anti-patterns UI và đạt chuẩn a11y `focus-visible`.
   - Tích hợp sạch sẽ vào [`src/client/ui/hud_container.tsx#L53`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/hud_container.tsx#L53).

---

## 2. BẢNG ĐỐI SOÁT KIỂM TOÁN VẬT LÝ TRẠM 3

| Trạm Thẩm Định | Chuyên Gia | Bằng Chứng Kiểm Tra | Phán Quyết |
| :--- | :--- | :--- | :---: |
| **Trạm 1 (QA RED)** | `qa-tester` | 18 atomic contract tests [`imp188_mobile_safe_area_and_network_watchdog.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp188_mobile_safe_area_and_network_watchdog.test.ts) failed cleanly (Business RED). | ✔️ PASS |
| **Trạm 2 (GREEN)** | `implementer` | 18/18 contract tests PASS, 313/313 regression test suites (6.323 tests) PASS 100%, Adversarial Inversion PASS. | ✔️ PASS |
| **Trạm 3 (Spec Review)** | `spec-reviewer` | Đối soát 100% dòng mã trên đĩa vật lý, snapshot `.agents/evidence/imp188_snapshot.json` (5 files, 960 LOC). | ✔️ **APPROVED** |
| **Trạm 3 (UI Craft Review)** | `ui-craft-reviewer` | Vòng 1 conditional (P1/P2) ➔ Vòng 2 fix `fixed top-0`, `focus-visible` ➔ `npm run lint:ui` 0 vi phạm. | ✔️ **SHIP (PASS)** |

---

## 3. BẤT BIẾN ĐÃ LƯU TRỮ VÀO BỘ NHỚ MIỀN

- Bất biến **#256** đã được ghi nhận vào [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) và cập nhật chỉ mục Domain Index cho cả hai nhóm `[NET/SYNC]` và `[UI/CRAFT]`.
