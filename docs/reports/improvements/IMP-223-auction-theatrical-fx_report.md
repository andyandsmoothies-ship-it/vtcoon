# [REPORT] IMP-223: Auction Theatrical FX — Bid Flash, Champagne Bloom & Focus Vignette

## 1. THÔNG TIN TỔNG QUAN
- **Mã Ticket**: IMP-223
- **Tiêu Đề**: Auction Theatrical FX: Bid Flash Reaction Lighting, Champagne Bloom & Contextual Focus Vignette.
- **Phân Hạng**: **Tier 2 (Full Rigor)** — Theatrical Reaction Lighting, GLSL Post-Processing Bloom & Vignette, 2D CSS Dual-Layer Optical Tunneling, Multi-modal Haptic Audio-Visual Sync.
- **Trạng Thái**: ✅ **COMPLETE** (HOÀN TẤT 100% QUY TRÌNH 3 TRẠM).
- **Căn Cứ Kế Hoạch & Bằng Chứng**:
  - Kế hoạch phê duyệt v3: [`docs/plans/improvements/IMP-223-auction-theatrical-fx_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-223-auction-theatrical-fx_plan.md)
  - Kiểm toán đối kháng kế hoạch: [`.agents/audit/PLAN_AUDIT_IMP223.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP223.md)
  - Bằng chứng thực thi: [`.agents/evidence/imp223_execution.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp223_execution.json) (`executed: true`)
  - Snapshot: [`.agents/evidence/imp-223_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp-223_snapshot.json)
- **Hội Đồng Độc Lập Trạm 3**:
  - `spec-reviewer`: **APPROVED** (100% đối soát tam giác vật lý, kiểm chứng triệt để 3 blocker C1–C3, 16/16 tests pass).
  - `game-3d-visual-critic`: **APPROVED (9.5 / 10 — disposition: ship)** (Đạt chuẩn game thương mại AAA / Wow-Factor; đánh giá cao cơ chế phân rã bậc hai êm dịu, quầng sáng Champagne Bloom quý phái và chuyển tiếp Dual-Layer Vignette 500ms không giật khựng).
  - `scout` (Trạm 2.5): **PASS 100%** (Zero dirty cast, zero GC allocation, ngân sách LOC tuân thủ nghiêm ngặt).

---

## 2. NGUYÊN NHÂN CỐT LÕI & GIẢI PHÁP ĐỒ HỌA

### 2.1. Hiện Trạng Trước Cải Tiến
- **Sàn đấu giá thiếu phản hồi thị giác khi nâng giá**: Khi người chơi hoặc Bot nâng giá, búa gõ đanh thép và âm thanh phát ra nhưng hệ thống đèn sa bàn 3D hoàn toàn tĩnh lặng, làm giảm cảm giác kịch tính.
- **Quầng sáng kim loại chưa bộc lộ hết sự xa xỉ**: Ngưỡng `bloomThreshold = 2.5` cố định tĩnh ngăn cản thẻ Sổ Đỏ viền mạ vàng và Búa Vàng tỏa sáng trong bóng tối rạp hát.
- **Tập trung thị giác chưa tối ưu**: Lớp phủ tối viền (Vignette) giữ nguyên giá trị tĩnh `0.15`, chưa tạo được hiệu ứng "đường hầm thị giác" (Visual Tunneling) ép ánh mắt người chơi vào sàn đấu giá.

### 2.2. Kiến Trúc & Bộ 3 Hiệu Ứng Hoàn Tất

```
                       [GameStore: activeModal === 'auction' & s.auction.currentBid]
                                                    │
                               ┌────────────────────┴────────────────────┐
                               ▼                                         ▼
                 [Auction Bid Increment Event]             [Theatrical Context Active]
                 (currentBid > prevBidRef)                 (isAuctionActive = true)
                               │                                         │
                 ┌─────────────┴─────────────┐             ┌─────────────┴─────────────┐
                 │                           │             │                           │
                 ▼                           ▼             ▼                           ▼
       [Tactile SFX & Modal]       [Sa Bàn 3D Bid Flash] [Champagne Bloom]      [Focus Vignette]
       - AudioEngine.bid()         - bidFlashTimerRef =0 - bloomThreshold:     - WebGL inGame L437:
       - Viền modal chớp vàng      - Ambient +1.5 boost    2.5 -> 1.2             darkness: 0.15 -> 0.35
       - Haptic narrative toast    - Sun +2.0 boost      - Tỏa hào quang vàng  - 2D DOM Mobile:
                                   - Decay bậc hai mượt    thẻ & nẹp kim loại     2 layer gradient
                                     0.35s (1-t/d)^2                              opacity lerp 0.5s
                                             │                     │                   │
                                             └─────────────────────┼───────────────────┘
                                                                   ▼
                                                   [Sàn Đấu Giá Điện Ảnh Broadway]
                                                    (Cinematic Auction Showdown)
```

---

## 3. BA HẠNG MỤC CỐT LÕI ĐÃ HOÀN TẤT VẬT LÝ

### 3.1. Phản Ứng Ánh Sáng Khi Nâng Giá (Bid Flash Reaction Lighting)
- Xuất khẩu hàm thuần túy `calculateBidFlashIntensity(baseIntensity, timer, boost = 1.5, duration = 0.35)` trong `time_of_day_lighting.tsx`.
- **Đường cong phân rã bậc hai $(1 - t/d)^2$**: Xung ánh sáng chớp bừng lên tại $t=0$, đạt đạo hàm dốc đứng bùng nổ tức thì và tiếp cận êm dịu về $0$ tại $t \to 0.35$s. Tại điểm bất đối xứng $t = 0.105$ ($\text{progress} = 0.3$), năng lượng còn lại chính xác $49\%$ ($1.015$), loại trừ $100\%$ lỗi linear decay ($1.33$).
- **Đồng bộ thính giác - thị giác**: Tia chớp ánh sáng trên sa bàn 3D đồng pha mili-giây với tiếng búa gõ đanh thép `AUCTION_BID`.

### 3.2. Hào Quang Vàng Kim Phân Tầng (Champagne Bloom Tuning)
- Xuất khẩu `calculateDynamicBloomThreshold(isAuctionActive, baseThreshold = 2.5, auctionThreshold = 1.2)` trong `post_processing_pipeline.tsx`.
- Khi `isAuctionActive = true`, hạ ngưỡng xuống `1.2` trên Desktop WebGL. Kết hợp với việc giảm 85% ánh sáng môi trường sa bàn xung quanh từ IMP-222, mặt bàn cờ hoàn toàn không bị cháy sáng hay lóa chữ số, chỉ các chi tiết kim loại vàng champagne, búa gõ và thẻ bài sưu tầm mới phát ra quầng sáng mềm mại (soft champagne bloom) đẳng cấp luxury.
- Giải quyết triệt để lỗi ES6 default param shadowing (P1) bằng cách phân tách `propBloomThreshold`.

### 3.3. Tối Góc Tập Trung Thị Giác (Contextual Focus Vignette - 2 Tầng Song Phương)
- **Tầng WebGL Desktop**: `calculateDynamicVignetteDarkness` nâng độ tối viền từ `0.15` lên `0.35`, kẹp chặt an toàn trong $[0.0, 1.0]$.
- **Tầng 2D DOM Mobile**: Trong `CinematicOverlay`, tách biệt thành 2 `div` gradient cố định và chuyển tiếp thuộc tính `opacity` qua `transition-opacity duration-500 ease-out`. Loại bỏ hoàn toàn lỗi giật khựng CSS gradient snap, tạo cảm giác ống kính máy quay khép khẩu thu hẹp thị giác vào sàn đấu giá mà không tốn thêm 1 draw call WebGL nào trên Mobile.
- **Cách ly cây Canvas (C2)**: Chỉ kết nối `isAuctionActive` vào nhánh `inGame` (L437); nhánh `preMatch` (L424) giữ nguyên để tránh subscription thừa. Bảo toàn 100% comment di sản `{/* <PostProcessingPipeline /> */}` ở cả 2 nơi.

---

## 4. MA TRẬN KIỂM THỬ HỢP ĐỒNG (UNIVERSAL 5-FACET MATRIX)

Bộ kiểm thử tại [`tests/client/auction_theatrical_fx.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/auction_theatrical_fx.test.ts) đạt **16/16 tests PASS (100%)**:

| Facet | Mã Test | Mục Tiêu & Khẳng Định Trạng Thái | Kết Quả |
| :---: | :--- | :--- | :---: |
| **Facet 1** | `[TC-223.01/MSS]` | `calculateBidFlashIntensity(0.28, 0, 1.5, 0.35) === 1.78` (đỉnh flash) | ✔️ PASS |
| | `[TC-223.02/MSS]` | Tại $t = 0.105$ ($\text{progress} = 0.3$), assert chính xác $1.015$ (phân rã bậc hai $(0.7)^2 = 0.49$) | ✔️ PASS |
| | `[TC-223.03/MSS]` | Khi $t \ge 0.35$, hoàn trả chính xác giá trị gốc `0.28`, triệt tiêu xung flash | ✔️ PASS |
| | `[TC-223.04/MSS]` | Khi gọi với `base = 0`, gia số là $+1.5$ tại $t=0$ và $0$ tại $t \ge 0.35$ | ✔️ PASS |
| **Facet 2** | `[TC-223.05/MSS]` | Khi `isAuctionActive = false`, trả về ngưỡng tiêu chuẩn $2.5$ | ✔️ PASS |
| | `[TC-223.06/MSS]` | Khi `isAuctionActive = true`, hạ ngưỡng xuống mức lộng lẫy $1.2$ | ✔️ PASS |
| | `[TC-223.07/MSS]` | Tôn trọng các tham số cấu hình tùy biến `(isAuctionActive, customBase, customAuction)` | ✔️ PASS |
| **Facet 3** | `[TC-223.08/MSS]` | Khi `isAuctionActive = false`, trả về độ tối nhẹ $0.15$ | ✔️ PASS |
| | `[TC-223.09/MSS]` | Khi `isAuctionActive = true`, tăng độ tối viền lên $0.35$ để tập trung thị giác | ✔️ PASS |
| | `[TC-223.10/MSS]` | Giá trị vignette luôn được kẹp an toàn trong $[0.0, 1.0]$ | ✔️ PASS |
| **Facet 4** | `[TC-223.11/MSS]` | Phòng vệ số: `NaN`, `Infinity`, $t < 0$ hoàn trả an toàn `baseIntensity` | ✔️ PASS |
| | `[TC-223.12/MSS]` | Phòng vệ ngưỡng: `NaN` trả về default hợp lệ ($2.5$ và $0.15$) | ✔️ PASS |
| | `[TC-223.13/MSS]` | Cường độ không bao giờ sinh ra số âm khi duration $\le 0$ | ✔️ PASS |
| **Facet 5** | `[TC-223.14/MSS]` | `PostProcessingPipeline` duy trì 100% cấu hình mặc định khi không truyền `isAuctionActive` | ✔️ PASS |
| | `[TC-223.15/MSS]` | `renderToStaticMarkup(<CinematicOverlay />)` chứa 2 lớp gradient và chuyển tiếp opacity | ✔️ PASS |
| | `[TC-223.16/MSS]` | `TimeOfDayLighting` duy trì `data-testid="time-of-day-lighting"` và export đầy đủ | ✔️ PASS |

**Tổng kiểm thử hồi quy**: **57/57 tests PASS** (bao gồm `post_processing_pipeline`, `cinematic_effects`, `time_of_day`, `atmospheric_immersion_and_breeze`).

---

## 5. ĐO LƯỜNG NGÂN SÁCH LOC VẬT LÝ
*Đo lường tự động bởi `node scripts/check_loc.mjs`:*

| Tệp Vật Lý | Phân Loại Tier | Total Lines | Non-Empty SLOC | Trần Ngân Sách | Đánh Giá |
| :--- | :---: | :---: | :---: | :---: | :--- |
| [`src/client/3d/time_of_day_lighting.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/time_of_day_lighting.tsx) | Tier 2 (UI/3D/Views) | **323** | 289 | <= 500 SLOC | 🟢 **ĐẠT** |
| [`src/client/3d/post_processing_pipeline.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/post_processing_pipeline.tsx) | Tier 2 (UI/3D/Views) | **200** | 184 | <= 500 SLOC | 🟢 **ĐẠT** |
| [`src/client/3d/cinematic_effects.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/cinematic_effects.tsx) | Tier 2 (UI/3D/Views) | **135** | 122 | <= 500 SLOC | 🟢 **ĐẠT** |
| [`src/client/game_canvas.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx) | Tier 2 (UI/3D/Views) | **452** | 416 | <= 500 SLOC | 🟢 **ĐẠT** |
| [`tests/client/auction_theatrical_fx.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/auction_theatrical_fx.test.ts) | Contract Tests | **161** | 145 | <= 600 SLOC | 🟢 **ĐẠT** |

---

## 6. BẤT BIẾN MIỀN GHI NHẬN (DOMAIN INVARIANT #16)
Đã ghi nhận chuẩn xác vào [`docs/domain/gotchas.md#L117-L122`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md#L117-L122):
- **Bid Flash Reaction Lighting & Quadratic Decay**: Khi có lượt đặt giá mới (`currentBid > prevBid`), xung ánh sáng chớp rực bùng nổ tại $t=0$ và phân rã bậc hai $(1 - t/d)^2$ trong $0.35$s. Đọc trực tiếp từ selector `useGameStore((s) => s.auction?.currentBid ?? 0)` (Zero Dirty Cast), phòng vệ `Number.isFinite` an toàn và zero memory allocation trong frame loop.
- **Champagne Bloom & Contextual Vignette Tuning**: Khi `isAuctionActive = true`, hạ `bloomThreshold` xuống $1.2$ làm nổi bật hào quang vàng kim và tăng `vignetteDarkness` lên $0.35$ tạo hiệu ứng visual tunneling tập trung thị giác vào sàn đấu giá. Tránh default param shadowing (P1) bằng cách đổi tên prop `propBloomThreshold`, `propVignetteDarkness`.
- **Dual-Layer 2D Vignette CSS Opacity Interpolation**: Trong `CinematicOverlay`, tách biệt thành 2 `div` gradient độc lập (Cyan tiêu chuẩn và Tím than đấu giá `rgba(15, 23, 42, 0.70)`), chuyển tiếp bằng `opacity` kết hợp `transition-opacity duration-500 ease-out`, triệt tiêu 100% hiện tượng giật khựng CSS gradient snap khi mở/đóng modal đấu giá.
- **Canvas Subtree Isolation & Legacy Comment Preservation**: Chỉ kết nối prop `isAuctionActive` vào nhánh `inGame` (L437) của `game_canvas.tsx`; nhánh `preMatch` (L424) giữ nguyên. Bảo toàn 100% comment `{/* <PostProcessingPipeline /> */}` ở cả 2 nhánh để không phá vỡ hợp đồng kiểm thử tĩnh.

---

## 7. KẾT LUẬN & PHÁN QUYẾT XUẤT XƯỞNG
Tính năng **IMP-223** đã hoàn tất xuất sắc theo chuẩn mực Antigravity 2.0 và GEMINI.md Harness. Toàn bộ mã nguồn, kiểm thử, bằng chứng và tài liệu đã được lưu trữ vĩnh viễn trên đĩa cứng dự án.
