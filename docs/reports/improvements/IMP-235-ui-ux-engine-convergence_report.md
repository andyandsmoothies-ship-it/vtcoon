# BÁO CÁO NGHIỆM THU HOÀN THÀNH: IMP-235
# ĐỒNG BỘ TOÀN DIỆN 31 KHIẾM KHUYẾT UI/UX TRÊN EDGE DESKTOP & CHUẨN HÓA TOMBSTONE SERIALIZATION

> **Mã định danh:** IMP-235  
> **Tên gói:** IMP-UIUX-ENGINE-CONVERGENCE  
> **Phân loại:** Tier 2 (Full Rigor — Server Delta Wire Protocol, FSM, and 2D UI/UX Convergence)  
> **Thời điểm hoàn thành:** 2026-09-30  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN GIẢI PHÁP, GIÁ TRỊ & MINH BẠCH PHẠM VI (SCOPE TRANSPARENCY)

### 1.1. Minh Bạch Lịch Sử Phân Tách Phạm Vi (Scope Bundling Ban Compliance)
- **Kế hoạch ban đầu (Revision 1.0)**: Từng đề xuất gộp 5 gói thay đổi, bao gồm cả Gói 5 tái cấu trúc `board_layout.tsx` sang `THREE.InstancedMesh`.
- **Phản biện & Phân tách nghiêm ngặt**: Qua vòng thẩm tra của User và Subagent `plan-griller` (PB-5), gói tái cấu trúc Three.js 3D đã được **tách riêng 100% thành ticket độc lập `IMP-PERF-THREEJS-INSTANCING`**.
- **Phạm vi được phê chuẩn chính thức của IMP-235**: Tập trung chặt chẽ vào **Hội Tụ Wire Protocol/FSM & Tinh Chỉnh Công Thái Học 2D UI/UX** (14 tệp vật lý, 0 sửa đổi đối với canvas 3D `board_layout.tsx`).

### 1.2. Giá Trị Kỹ Thuật Cốt Lõi
1. **Chuẩn Hóa Cơ Chế Tombstone Serialization & Chặn Lặp Delta (Cụm A - Wire & Engine)**:
   - **Tombstone Serialization (`session_manager.ts#L167`)**: Sửa lỗi bỏ sót cấp độ công trình khi ô đất bị hạ cấp hoặc tịch thu khỏi `stateMap`. Server luôn phát hành tường minh `level: (state?.level ?? 0) as 0 | 1 | 2 | 3` thay vì bỏ qua thuộc tính, đảm bảo client nhận diện chính xác việc xóa nhà về cấp 0.
   - **Triệt Tiêu Delta Trùng Lặp (`apply_delta_cells.ts#L31-L38`)**: Client cập nhật trực tiếp `levelMap` về 0 khi nhận delta, đồng thời chặn việc kích hoạt lại hiệu ứng nâng cấp (`triggerCellLevelEffects`) nếu `targetLevel === oldLevel`.
   - **Bảo Toàn FSM Vỡ Nợ Trái Phiếu (`bond_manager.ts#L228-L240`)**: Ghi nhận sự kiện `EVENT_BOND_DEFAULT` với thông điệp tường minh, chuyển pha sang `TurnPhase.AuctionPhase` và giữ nguyên hàng đợi phát mãi `fireSaleQueue`.

2. **Khắc Phục 31 Khiếm Khuyết UI/UX & Công Thái Học (Cụm B - Client Modals & Ergonomics)**:
   - **Tương Phản Màu Vàng SSOT `#F1C40F` (WCAG 2.1 AA)**: Thêm `#F1C40F` vào nhóm `isBrightGroup` trong `title_deed_modal.tsx`, áp dụng chữ đen đậm `text-slate-950 font-black` (tỷ lệ tương phản thực tế > 11:1), tự động ẩn đinh tán trang trí khi có nút đóng để tránh chồng lấn icon `✕`.
   - **Chuẩn Hóa Nhãn Biểu Phí & Chip Tiện Ích (`GRID` / `5G`)**: Đổi nhãn `C3 (RESORT/TTTM)` trong `title_deed_rent_table.tsx`; hiển thị chip `GRID` và `Lưới Điện Thông Minh (Smart Grid)` cho Ô 12 (EVN), chip `5G` và `Nâng Cấp Trạm Phát 5G` cho Ô 28 (Viettel).
   - **Bẻ Dòng Tránh Tràn Chữ & Sàn Font >= 11px**: Tách riêng tên tỉnh và phân khu trong `purchase_decision_card.tsx` thành 2 dòng riêng biệt (`split(' (')[0]` và `slice(indexOf('('))`), định dạng font chữ sàn `text-[11px] font-medium` tuân thủ chuẩn thiết kế `imp208`.
   - **Căn Giữa Portfolio & Đệm Đáy An Toàn**: Kích hoạt prop `center={true}` trong `modal_host.tsx` cho `portfolio` (loại bỏ `md:justify-end md:pr-10`), bổ sung `pb-20` trong `property_portfolio_modal.tsx` đảm bảo các nút bấm chân trang không bị thanh điều hướng che khuất.
   - **Sàn Đấu Giá Phát Mãi & Nhận Diện Hạ Tầng**: Đổi màu ribbon Railroad thành xám thép `#475569`, hiển thị tiêu đề `HẠ TẦNG GIAO THÔNG QUỐC GIA`, hỗ trợ mức giá khởi điểm 0đ trong Fire Sale với vương miện `👑 Dẫn đầu`, và chặn triệt để việc render nhà ma `🏠 3` trên đất trống.
   - **Bản Địa Hóa 100% Tiếng Việt Tính Cách Bot AI**: Hàm `formatLocalizedBotPersonality` chuyển đổi toàn bộ nhãn tiếng Anh sang tiếng Việt (`Phòng Thủ`, `Tấn Công`, `Cân Bằng`), loại bỏ hoàn toàn các chuỗi cắt cụt `Bot AI 4 (`.
   - **Công Thái Học Desktop & Mobile 360px**: Di chuyển toast biến động tài chính sang cột phải `md:right-6 md:left-auto md:translate-x-0` trên Desktop; chuyển `ServerToast` lên layer `z-60`, góc phải, không gây thanh cuộn ngang ở màn hình 360px; nâng tương phản nhãn tài sản ròng sang `text-slate-700 font-black`.

---

## 2. BẢNG NGÂN SÁCH DÒNG MÃ VẬT LÝ ĐỐI CHIẾU (AUTOMATED VIA scripts/check_loc.mjs)

| Tệp vật lý | Phân loại Tier | Total Lines | Non-Empty SLOC | Trần quy định | Trạng thái |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/server/session_manager.ts` | Tier 1 (Domain/Server/Logic) | **397** | 369 | <= 400 LOC | ⚠️ Warning (397 > 300) |
| `src/server/bond_manager.ts` | Tier 1 (Domain/Server/Logic) | **241** | 213 | <= 400 LOC | ✔️ Safe |
| `src/client/network/apply_delta_cells.ts` | Tier 1 (Domain/Server/Logic) | **148** | 135 | <= 400 LOC | ✔️ Safe |
| `src/client/ui/ui_helpers.ts` | Tier 2 (UI/3D/Views) | **454** | 416 | <= 500 LOC | ⚠️ Warning (454 > 400) |
| `src/client/ui/modals/modal_host.tsx` | Tier 2 (UI/3D/Views) | **493** | 476 | <= 500 LOC | ⚠️ Warning (493 > 400) |
| `src/client/ui/modals/title_deed_modal.tsx` | Tier 2 (UI/3D/Views) | **359** | 334 | <= 500 LOC | ✔️ Safe |
| `src/client/ui/modals/title_deed_rent_table.tsx` | Tier 2 (UI/3D/Views) | **267** | 252 | <= 500 LOC | ✔️ Safe |
| `src/client/ui/modals/purchase_decision_card.tsx` | Tier 2 (UI/3D/Views) | **162** | 153 | <= 500 LOC | ✔️ Safe |
| `src/client/ui/modals/property_portfolio_modal.tsx` | Tier 2 (UI/3D/Views) | **394** | 375 | <= 500 LOC | ✔️ Safe |
| `src/client/ui/modals/auction_modal.tsx` | Tier 2 (UI/3D/Views) | **459** | 439 | <= 500 LOC | ⚠️ Warning (459 > 400) |
| `src/client/ui/modals/auction_district_card.tsx` | Tier 2 (UI/3D/Views) | **229** | 213 | <= 500 LOC | ✔️ Safe |
| `src/client/ui/floating_numbers.tsx` | Tier 2 (UI/3D/Views) | **292** | 266 | <= 500 LOC | ✔️ Safe |
| `src/client/main.tsx` | Tier 2 (UI/3D/Views) | **266** | 243 | <= 500 LOC | ✔️ Safe |
| `src/client/ui/player_card.tsx` | Tier 2 (UI/3D/Views) | **398** | 372 | <= 500 LOC | ✔️ Safe |
| `tests/contracts/imp_uiux_engine_convergence.test.ts` | Contract / Living Tests | **475** | **423** | <= 600 LOC | ✔️ Safe (475 <= 600) |

---

## 3. KẾT QUẢ QUY TRÌNH 4 TRẠM KHÉP KÍN (4-STATION PIPELINE)

1. **Trạm 1 (QA RED - Adversarial Inversion)**:
   - Xây dựng **20 atomic contract tests** tại `tests/contracts/imp_uiux_engine_convergence.test.ts` phân bổ cân đối 4 tests/facet trên toàn bộ Universal 5-Facet Matrix (vượt sàn floor >= 15 tests).
   - Thẩm định Adversarial Inversion: 100% tests thất bại có chủ đích (Business RED) trước khi code.
2. **Trạm 2 (GREEN Implementation)**:
   - Triển khai drop-in snippets tối thiểu trên 14 tệp sản phẩm.
   - Toàn bộ **20/20 contract tests chuyển sang trạng thái GREEN (40ms)**.
   - Xóa bỏ hoàn toàn dirty cast `as Record<string, any>` trong TC-10, gọi trực tiếp named export `formatLocalizedBotPersonality` với compile-time safety 100%.
   - Bảo toàn 100% test hồi quy liên quan: tổng cộng **82/82 tests PASS** liên thông các suite `imp191`, `impeccable_tactile_modals`, `imp224`, `imp226`, `imp227`.
3. **Trạm 2.5 (Fast Pre-Filter Sweep)**:
   - TypeScript Typecheck (`npx tsc --noEmit`): 0 lỗi.
   - Ngân sách LOC: 14/14 file mã nguồn và 1 file test đều nằm strictly dưới trần phân hạng.
   - UI Linter (`npm run lint:ui`): 0 vi phạm trên toàn bộ 207 files.
   - Slop Linter: 0 dirty casts (`as any`, `as unknown as`, `as Record<string, any>`) trong các tệp sửa đổi.
4. **Trạm 3 (Independent Review Funnel)**:
   - **Phase 3.0 (Physical Visual Evidence Gate)**: Chụp và thẩm định 4 ảnh in-game vật lý tại `.agents/tmp/`:
     + `imp-235_title_deed_yellow.png`: Nhóm Vàng `#F1C40F` (Ô 26 Hải Phòng), tương phản WCAG 2.1 AA > 11:1, không cấn đinh tán.
     + `imp-235_auction_fire_sale.png`: Sàn đấu giá Ô 15 Cảng Cái Mép, ribbon `#475569`, tiêu đề `HẠ TẦNG GIAO THÔNG QUỐC GIA`, 0đ dẫn đầu.
     + `imp-235_property_portfolio.png`: Portfolio căn giữa desktop, đệm đáy `pb-20`.
     + `imp-235_mobile_toast_360px.png`: Màn hình 360px x 740px, `ServerToast` ở `z-60`, không tràn ngang.
   - **Phase 3.1 Spec Reviewer**: 🏆 **`SPEC_APPROVED`** (100% đối chiếu kế hoạch, 0 scope drift, tuân thủ Scope Bundling Ban sau khi tách Gói 5).
   - **Phase 3.2 Deep Architecture (Code Reviewer)**: 🏆 **`CODE_APPROVED`** (Khắc phục triệt để lỗi hồi quy logic ẩn mobile badge và class chuỗi, 0 rò rỉ timer/GC, 0 dirty cast, SRP chuẩn, an toàn kiểu dữ liệu).
   - **Phase 3.2 2D UI Craft (UI Craft Reviewer)**: 🏆 **`UI_APPROVED`** (`disposition: ship`, điểm 10/10 mỹ thuật và công thái học sau khi chứng thực 4 ảnh vật lý).
5. **Trạm 4 (Chaos Sentinel & Mutation Probes)**:
   - **Probe 1 (Closed-Loop Parity)**: Kiểm tra đối xứng động giữa Perimeter Gateway (`VALID_INTENTS`) và Core Dispatcher (`dispatchPlayerIntent`). Kết quả: 24/24 Intent khớp 100% không có gap (`intentCount: 24` phản ánh snapshot đối xứng động thời điểm hiện tại).
   - **Probe 2 (Ephemeral Boundary)**: Khởi tạo WSS trên port động của hệ điều hành (`port: 56064`), thực hiện bắt tay TCP WebSocket thực tế và teardown sạch sẽ dưới 2s.
   - **Probe 3 (Targeted Mutation Sensitivity)**: 5/5 mutants sandbox bị tiêu diệt hoàn toàn (0 surviving mutants), chứng minh các assertions trong test suite có độ nhạy vật lý cao.
   - Bằng chứng thực nghiệm `.agents/evidence/chaos_sentinel_IMP-235.json` được ký duyệt APPROVED và xác thực cơ học bằng `node scripts/check_evidence.mjs IMP-235`.

---

## 4. TỔNG KẾT BẤT BIẾN ĐÃ ĐƯỢC CHỨNG MINH (INVARIANTS PROVEN)

- **Bất biến Tombstone Serialization**: Khi ô đất bị xóa hoặc tịch thu, server bắt buộc emit trường `level: 0` tường minh để client đồng bộ hóa chính xác mà không dựa vào thuộc tính vắng mặt.
- **Bất biến Tương Phản Vàng Di Sản**: Nền màu vàng `#F1C40F` bắt buộc đi kèm màu chữ than đen `text-slate-950 font-black` để đảm bảo tỷ lệ tương phản WCAG 2.1 AA (> 11:1).
- **Bất biến Fire Sale Giá Sàn 0đ**: Trong phiên phát mãi thanh lý nợ, mức giá thầu 0đ hợp lệ được bảo toàn quyền dẫn đầu (`👑 Dẫn đầu`) và không bị coi là chưa có ai đặt giá.
- **Bất biến Bảo Toàn FSM Đấu Giá**: Khi xảy ra biến cố vỡ nợ trái phiếu, sự kiện biến cố phải được ghi nhận đồng thời với việc chuyển pha sang `TurnPhase.AuctionPhase` và kích hoạt phiên đấu giá tài sản đầu tiên trong hàng đợi.
- **Bất biến Typo Guard & Bản Địa Hóa**: Các chuỗi Bot AI phải được chuẩn hóa qua `formatLocalizedBotPersonality` với exact pattern matching, không đưa các biến thể typo như `Passivc` vào codebase.
