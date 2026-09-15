# [IMP-61] Kế Hoạch Đại Tu Mỹ Thuật Bàn Cờ: Phong Cách Retropoly & Monopoly Plus Tabletop (Dark-Mode Purge & Thẻ Bìa Cứng Cổ Điển)

- **Mã Ticket**: `IMP-61`
- **Mức Độ Ưu Tiên**: P1 - High (Visual & Aesthetic Alignment Overhaul)
- **Trạng Thái**: 🟡 **Đã Duyệt 4 Hướng Tiếp Cận Cốt Lõi — Sẵn Sàng Kích Hoạt Quy Trình 3 Trạm**
- **Quyết Định Của Người Dùng (User Sign-Off)**:
  1. **Chấm dứt hoàn toàn Dark Mode (`bg-slate-950`)**: Chuyển toàn bộ 7 modal và sidebar sang nền **Giấy Ngà Kem Bìa Cứng Cổ Điển (`#FFFDF8` / `#F7F2E7`)**, chữ in mực đen tương phản cao (`text-slate-900`), viền mực in 2px (`border-2 border-slate-900`) và đổ bóng carton đồ chơi (`shadow-[0_6px_0_0_#0f172a]`).
  2. **Thẻ Sổ Đỏ chuẩn Monopoly**: Dải màu nhận diện địa phương nguyên khối chiếm 22% đầu thẻ in chữ in hoa trắng nét đậm, khung tranh phong cảnh ở giữa có viền chỉ retro, biểu phí C0-C3 in mực đen rõ nét.
  3. **Đàm phán dạng Thảm Nỉ Tabletop (Trade Modal)**: Thay thế hoàn toàn bảng checkbox kiểm toán đen kịt bằng 2 thảm nỉ cờ bàn (Thảm xanh của Bạn, Thảm đỏ của Bot AI), tương tác bằng thẻ Sổ Đỏ mini và cọc tiền giấy đồ chơi xếp lớp.
  4. **Sàn Đấu Giá & Sàn HOSE tươi vui**: Bục đấu giá hội chợ đồ chơi và bảng giao dịch retro với xúc xắc đỏ kẹo ngọt chuẩn phong cách Retropoly.

- **Mục Tiêu**: Đồng bộ hóa 100% ngôn ngữ thiết kế 2D với sa bàn 3D ngoài trời rực rỡ nắng đảo, dựa trên 2 ảnh tham chiếu chuẩn thương mại:
  - **Reference 1 (Retropoly)**: `media_1789381736230.jpg` — Thành phố đồ chơi đảo nhiệt đới ngập tràn ánh nắng, màu sắc tươi vui rực rỡ, xúc xắc đỏ kẹo ngọt.
  - **Reference 2 (Monopoly Plus Tabletop)**: `media_1789381736230.webp` — Bàn cờ gia đình đặt trên mặt bàn gỗ thật, sa bàn 3D sống động ở giữa, thẻ cờ giấy bìa ngà cổ điển (`#FFFDF8`), chữ mực in đen sắc nét, thảm nỉ đàm phán và cọc tiền giấy đồ chơi.

- **Khu Vực Tác Động**:
  - `src/domain/theme.ts`
  - `src/client/ui/modals/title_deed_modal.tsx`
  - `src/client/ui/modals/event_card_modal.tsx`
  - `src/client/ui/modals/auction_modal.tsx`
  - `src/client/ui/modals/hose_modal.tsx`
  - `src/client/ui/modals/trade_modal.tsx`
  - `src/client/ui/modals/insolvency_banner.tsx`
  - `src/client/ui/modals/game_over_modal.tsx`
  - `src/client/ui/activity_feed_sidebar.tsx`
  - `tests/contracts/imp61_tabletop_visual_alignment.test.ts`

- **Ràng Buộc Chất Lượng**:
  - Zero Anti-Patterns: Đạt 0 vi phạm qua `npm run lint:ui` (cấm `border-accent-on-rounded`, `bounce-easing`, `gray-on-color`, `gradient-text`).
  - Giới hạn LOC: UI Components <= 500 dòng, Core Logic <= 400 dòng.
  - Nghiệm thu trực quan: Tái chụp toàn bộ 13 màn hình qua Edge CDP và thẩm định độc lập bởi `ui-craft-reviewer`.

---

## 1. Bối Cảnh & Thách Thức Mỹ Thuật (Architectural Premise Challenge)

Sau khi chụp 13 màn hình thực tế của các modal và popup trong trò chơi, một vấn đề mỹ thuật nghiêm trọng đã lộ rõ:
1. **Hội chứng Dark Slate / Kính Đen (Dark Slate Syndrome)**:
   - Tất cả các modal (`TitleDeedModal`, `AuctionModal`, `HoseModal`, `TradeModal`, `InsolvencyBanner`, `ActivityFeedSidebar`) đều đang sử dụng nền tối đen đặc `bg-slate-950` hoặc `bg-slate-900/95`, viền kính phát sáng neon amber/cyan.
   - Phong cách này tạo cảm giác như một bảng điều khiển tiền mã hóa (Crypto Dashboard) hoặc phòng VIP Penthouse ban đêm, **hoàn toàn lạc quẻ và đối chọi** với thế giới 3D sa bàn ngoài trời rực rỡ nắng vàng và biển xanh ngọc.
2. **Khái niệm Cờ Bàn (Tabletop-First) bị triệt tiêu**:
   - Thẻ Sổ Đỏ giống cửa sổ popup hệ điều hành hơn là một tấm thẻ bìa cứng cầm tay.
   - Modal Đàm phán (TradeModal) trông như bảng kiểm toán kế toán với các ô checkbox khô khan.
   - Sàn Đấu Giá và Sàn HOSE trông như sàn giao dịch phái sinh đêm tối thay vì bục đấu giá hội chợ đồ chơi vui nhộn.

**Quyết định**: Kích hoạt nguyên tắc *"Kill The Premise"*, bãi bỏ hoàn toàn tiền đề Dark Luxury, đại tu sang phong cách **Tabletop Bìa Cứng & Thành Phố Đồ Chơi Tươi Sáng**.

---

## 2. Sơ Đồ Kiến Trúc Mỹ Thuật (Visual Architecture Flowchart)

```text
+-----------------------------------------------------------------------------------+
|                        OUTDOOR SUNNY ISLAND DIORAMA (3D)                          |
|         (Biển xanh ngọc, bãi cát vàng, công viên nhiệt đới, xúc xắc kẹo đỏ)       |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                    TABLETOP WOODEN CASING & FELT PLAYMATS                         |
|     (Khung gỗ sồi ấm, thảm nỉ xanh dương P1, thảm nỉ đỏ/cam AI, cọc tiền giấy)    |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                    VINTAGE IVORY PAPER CARDBOARD MODALS (2D)                      |
|  - Nền giấy ngà kem (#FFFDF8 / #F7F2E7) với viền mực đen 2px                      |
|  - Dải màu nhóm đất dày dặn nguyên khối (Purple, Emerald, Red, Sky Blue, Orange)  |
|  - Chữ in mực đen tương phản cao (text-slate-900), không dùng chữ xám mờ          |
|  - Nút bấm đồ chơi có độ lún vật lý (Toy Bevels: shadow-[0_4px_0_0_#xxx])         |
+-----------------------------------------------------------------------------------+
```

---

## 3. Nội Dung Kỹ Thuật Chi Tiết Theo Từng Thành Phần

### 3.1. Hạt Nhân Token Mỹ Thuật (`src/domain/theme.ts`)
Bổ sung đối tượng `TABLETOP_THEME` chuẩn hóa toàn bộ mã màu cờ bàn:
- `cardBg`: `#FFFDF8` (Giấy ngà kem sáng cao cấp).
- `cardBgWarm`: `#F7F2E7` (Giấy ngà ấm cho các hộp thông tin con).
- `cardBorder`: `#1E293B` (Viền mực in đậm nét 2px).
- `cardShadow`: `0 6px 0 0 #0F172A` (Khối đổ bóng carton đồ chơi).
- `feltMatBlue`: `#1E3A8A` (Thảm nỉ thương lượng của người chơi).
- `feltMatRed`: `#991B1B` (Thảm nỉ thương lượng của đối thủ Bot).
- `textInkDark`: `#0F172A` (Màu chữ in mực sắc nét, tương phản tối đa).
- `textInkMuted`: `#475569` (Màu chú thích phụ thanh thoát).
- Các cấu hình nút bấm đồ chơi nảy lún (`btnEmerald`, `btnAmber`, `btnPaper`).

### 3.2. Thẻ Bài Sổ Đỏ Bìa Cứng (`src/client/ui/modals/title_deed_modal.tsx`)
- **Khung thẻ bài**: Tỷ lệ chuẩn thẻ cờ Monopoly (1:1.6), nền giấy ngà sáng `#FFFDF8`, viền đen dày dặn `border-2 border-slate-900`, đổ bóng khối giấy `shadow-[0_6px_0_0_#0f172a]`.
- **Dải tiêu đề (Header Banner)**: Khối màu nhận diện địa phương (Tím, Xanh lá, Đỏ, Cam...) chiếm trọn 22% đỉnh thẻ, in tên BĐS bằng chữ trắng đậm (`font-black uppercase tracking-tight text-white`).
- **Khung tranh diorama**: Nằm ngay ngắn ở trung tâm, bao bởi viền chỉ đôi hoài cổ, hiển thị minh họa kiến trúc danh thắng sắc nét.
- **Biểu giá & Biểu phí C0-C3**: Nền giấy ngà ấm `#F7F2E7`, chia 2 cột Giá Niêm Yết và Giá Thế Chấp. Toàn bộ tiền thuê C0, C1, C2, C3 in bằng mực đen `text-slate-900 font-bold` có chấm tròn/chip nhận diện rõ ràng.
- **Nút hành động đồ chơi**:
  - Nút "MUA BẤT ĐỘNG SẢN": Xanh ngọc rực rỡ, viền đậm, đổ bóng khối lún.
  - Nút "BỎ QUA / ĐẤU GIÁ": Nền giấy ngà viền đen dày, chữ xám đậm.

### 3.3. Phiếu Sự Kiện Bìa Báo Cổ (`src/client/ui/modals/event_card_modal.tsx`)
- **Phiếu Thị Trường (Vĩ mô)**: Nền giấy báo vàng ngà cổ điển (`#FEF3C7`), có con dấu mộc đỏ thời sự tròn, viền chỉ đôi, bảng Impact Specs Matrix 4 chiều in chữ đen đậm rõ nét.
- **Phiếu Cơ Hội (Cá nhân)**: Nền giấy cam đào ấm áp (`#FFEDD5`), biểu tượng rương vàng / tia sét nổi bật.
- Khử bỏ hoàn toàn nền `bg-slate-900/90` và hiệu ứng kính mờ xanh cyan neon.

### 3.4. Bục Đấu Giá Hội Chợ & Bảng Giao Dịch HOSE (`auction_modal.tsx` & `hose_modal.tsx`)
- **Sàn Đấu Giá**: Chuyển thành bục đấu giá lễ hội đồ chơi. Khung gỗ sáng viền ngoài, nền vàng kem ấm `#FFFBEB`, bảng số lật retro hiển thị giá thầu to rõ màu vàng chanh viền đen, 3 nút đặt giá nhanh (+50, +100, +200 Tr.) màu kẹo ngọt vui mắt.
- **Sàn HOSE**: Chuyển thành bảng cổ phiếu đường phố Sài Gòn. Nền giấy kẻ ô tài chính hoài cổ, viên xúc xắc 1D6 màu đỏ kẹo ngọt với chấm trắng (nhất quán với 2 viên xúc xắc đỏ trong ảnh Retropoly), tem nhãn kết quả khớp lệnh (Tím trần, Xanh tăng, Vàng tham chiếu, Đỏ sàn).

### 3.5. Thảm Nỉ Thương Lượng Tabletop (`src/client/ui/modals/trade_modal.tsx`)
- Bãi bỏ danh sách checkbox kiểm toán đen kịt.
- Thiết kế 2 thảm nỉ cờ bàn song song (mô phỏng trực tiếp ảnh Monopoly Plus Tabletop):
  - Thảm xanh navy cho Người Chơi (`bg-blue-900/40 border-2 border-blue-500/40 rounded-2xl`).
  - Thảm đỏ gạch cho Đối Tác Bot AI (`bg-rose-900/40 border-2 border-rose-500/40 rounded-2xl`).
- BĐS hiển thị dạng **thẻ Sổ Đỏ mini** xếp hàng trên thảm. Khi bấm chọn, thẻ nhấc nổi lên kèm đổ bóng xúc giác.
- Tiền mặt hiển thị dạng **các cọc tiền giấy đồ chơi** (500 Tr., 1.000 Tr., 2.000 Tr.) kèm nút bấm tăng/giảm nhanh (+100, +500 Tr.).

### 3.6. Banner Cảnh Báo & Nhật Ký Sổ Tay Ván Đấu (`insolvency_banner.tsx`, `activity_feed_sidebar.tsx`, `game_over_modal.tsx`)
- **Insolvency Banner**: Phong bì cảnh báo ngân hàng vui nhộn, nền giấy ngà viền sọc thư bưu điện đỏ-trắng, tiêu đề `Cảnh Báo Thanh Khoản Doanh Nghiệp`.
- **Activity Feed**: Sổ tay ký sự hành trình ván cờ, nền giấy kraft sáng `#FBF7EE` với gáy sổ may chỉ, chữ in mực navy thanh lịch, nhìn xuyên thấu nhẹ ra khung cảnh biển phía sau.
- **GameOverModal**: Bục vinh danh lễ hội đồ chơi, dải ruy băng rực rỡ, bục podium 1-2-3 sống động.

---

## 4. Quy Trình Kiểm Thử 3 Trạm (3-Station Pipeline)

```text
+-----------------------------------------------------------------------------------+
|                        🚦 [KÍCH HOẠT QUY TRÌNH 3 TRẠM]                             |
+-----------------------------------------------------------------------------------+
| TRẠM 1 (RED Contract Test)                                                        |
|   - Tệp: tests/contracts/imp61_tabletop_visual_alignment.test.ts                  |
|   - Nhiệm vụ: Viết kiểm thử hợp đồng kiểm tra vắng mặt của bg-slate-950 trong     |
|     các modal, bắt buộc nền giấy ngà #FFFDF8 và chữ in mực đen text-slate-900.    |
|   - Chạy npx vitest để chứng minh thất bại (RED Inversion Gate).                  |
+-----------------------------------------------------------------------------------+
| TRẠM 2 (GREEN Implementation)                                                     |
|   - Cập nhật src/domain/theme.ts và 8 tệp giao diện modal/sidebar.                |
|   - Chạy npm run lint:ui bảo đảm 0 lỗi anti-patterns.                             |
|   - Chạy vitest bảo đảm 100% tests xanh lá.                                       |
+-----------------------------------------------------------------------------------+
| TRẠM 3 (Physical Disk Review & Re-Capture)                                        |
|   - Chạy .agents/tmp/capture_all_modals.mjs tái chụp lại toàn bộ 13 bức ảnh.      |
|   - ui-craft-reviewer độc lập thẩm định 13 ảnh đối chiếu với 2 ảnh reference.     |
|   - Lập báo cáo nghiệm thu tại docs/reports/improvements/IMP-61-..._report.md.    |
+-----------------------------------------------------------------------------------+
```

---

## 5. Danh Sách Tệp Thay Đổi Cụ Thể

1. `[MODIFY] src/domain/theme.ts` (Bổ sung `TABLETOP_THEME`).
2. `[MODIFY] src/client/ui/modals/title_deed_modal.tsx` (Đại tu thẻ bìa cứng giấy ngà).
3. `[MODIFY] src/client/ui/modals/event_card_modal.tsx` (Đại tu phiếu tin tức giấy báo).
4. `[MODIFY] src/client/ui/modals/auction_modal.tsx` (Bục đấu giá hội chợ đồ chơi).
5. `[MODIFY] src/client/ui/modals/hose_modal.tsx` (Bảng sàn HOSE retro với xúc xắc kẹo đỏ).
6. `[MODIFY] src/client/ui/modals/trade_modal.tsx` (Thảm nỉ đàm phán cờ bàn).
7. `[MODIFY] src/client/ui/modals/insolvency_banner.tsx` (Phong bì cảnh báo thanh khoản).
8. `[MODIFY] src/client/ui/modals/game_over_modal.tsx` (Bục vinh danh lễ hội tươi sáng).
9. `[MODIFY] src/client/ui/activity_feed_sidebar.tsx` (Cuốn sổ ký sự hành trình).
10. `[NEW] tests/contracts/imp61_tabletop_visual_alignment.test.ts` (Bộ kiểm thử hợp đồng Trạm 1).
