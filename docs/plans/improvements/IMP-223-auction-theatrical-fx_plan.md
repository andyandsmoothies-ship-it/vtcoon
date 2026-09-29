# KẾ HOẠCH TRIỂN KHAI: AUCTION THEATRICAL FX — BID FLASH, CHAMPAGNE BLOOM & CONTEXTUAL VIGNETTE (IMP-223) [HARDENED v3]

> **Mục tiêu**: Đưa cảm xúc và tính kịch nghệ của sàn đấu giá BĐS (`AuctionModal` 2D kết hợp nền sa bàn 3D điện ảnh) lên đỉnh điểm thông qua bộ 3 hiệu ứng ánh sáng và quang học phản hồi đa tầng (Multimodal Theatrical Feedback):
> 1. **Bid Flash Theatrical Reaction Lighting**: Mỗi khi mức giá thầu tăng (`currentBid > prevBid`), bùng nổ xung ánh sáng chớp rực (Light Flash) trực tiếp trên hệ thống đèn sa bàn 3D (`TimeOfDayLighting`), đồng bộ chính xác từng mili-giây với tiếng búa gõ đanh thép `AudioEngine.playSfx(SoundEffect.AUCTION_BID)`.
> 2. **Hào Quang Vàng Kim Phân Tầng (Champagne Bloom Tuning)**: Khi `isAuctionActive = true`, hạ `bloomThreshold` từ `2.5` xuống `1.2` (trên Desktop PostProcessingPipeline), làm cho các chi tiết kim loại vàng champagne, búa gõ và đèn spotlight tỏa quầng sáng huyền ảo lộng lẫy giữa bóng tối rạp hát.
> 3. **Tối Góc Tập Trung Thị Giác (Contextual Focus Vignette - 2 Tầng Song Phương)**: Tăng độ tối viền quang học `vignetteDarkness` từ `0.15` lên `0.35` (WebGL Desktop) kết hợp lớp phủ chuyển tiếp opacity 2 lớp tách biệt trong `CinematicOverlay` (2D DOM Mobile), loại bỏ 100% giật khựng CSS gradient và tập trung tuyệt đối ánh mắt người chơi vào sàn đấu giá.
> **Tiêu chuẩn áp dụng**: Antigravity 2.0, GEMINI.md Harness, TDD Detroit Style, Universal 5-Facet Matrix (16 atomic tests), Deep Modules & Anti-Slop, Zero `as any`.
> **Khắc phục 3 Blocker Cứng (C1 - C3 từ đợt Review)**:
> - **C1 (Zero Dirty Casts)**: Xóa bỏ 100% `as ...` cast. Sử dụng selector type-safe SSOT có sẵn: `const currentBid = useGameStore((s) => s.auction?.currentBid ?? 0);` theo `game_store_types.ts:L244`.
> - **C2 (Định vị nhánh L437)**: Chỉ định rõ ràng chỉ kết nối prop `isAuctionActive` vào nhánh `inGame` (L437) của `game_canvas.tsx`. Nhánh `preMatch` (L424) giữ nguyên để tránh subscription thừa. Bảo toàn 100% comment di sản `{/* <PostProcessingPipeline /> */}` ở cả L423 và L436.
> - **C3 (Adversarial Quadratic Inversion)**: `[TC-223.02]` kiểm tra tại điểm bất đối xứng $t = 0.105$ ($\text{progress} = 0.3$) assert nghiêm ngặt $1.015$ ($0.28 + 1.5 \times 0.49$), triệt tiêu hoàn toàn nguy cơ bug-codification nếu implementer dùng linear decay ($1.33$, chênh lệch $31\%$).

---

## 1. SƠ ĐỒ KIẾN TRÚC & DÒNG CHẢY DỮ LIỆU (VISUAL ARCHITECTURE)

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

## 2. BA HẠNG MỤC CỐT LÕI CỦA IMP-223

### 2.1. Phản Ứng Ánh Sáng Khi Nâng Giá (Bid Flash Theatrical Reaction Lighting)
- **Cơ chế thị giác**:
  - Khi có lượt đặt giá mới (`currentBid > prevBidRef.current`), tiếng búa gõ vang lên kèm theo một xung ánh sáng (Bid Flash) bừng sáng toàn bộ sa bàn 3D đang chìm trong màn sương kịch nghệ tím than `#0F172A`.
  - Cường độ ánh sáng phân rã bậc hai mượt mà:
    $$\Delta I_{\text{flash}}(t) = \text{boost} \times \left(1 - \frac{t}{\text{duration}}\right)^2 \quad \text{với } t \in [0, \text{duration}]$$
    * `duration = 0.35`s.
    * Đèn nền rạp hát `ambient` và đèn chính `sun` tăng vọt trong mili-giây đầu tiên rồi dịu dần về mức nền kịch nghệ.
- **Hạ tầng thực thi**:
  - Xuất khẩu hàm thuần túy `calculateBidFlashIntensity(baseIntensity, timer, boost, duration)` trong [`src/client/3d/time_of_day_lighting.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/time_of_day_lighting.tsx).
  - Tích hợp `bidFlashTimerRef` vào `useSafeFrame` của `TimeOfDayLighting`. Khi `currentBid` thay đổi, `bidFlashTimerRef.current = 0`.
  - Zero allocation trong frame loop 60 FPS.

### 2.2. Hào Quang Vàng Kim Phân Tầng (Champagne Bloom Tuning)
- **Cơ chế thị giác**:
  - Khi không đấu giá: `bloomThreshold = 2.5` (tiêu chuẩn chống lóa vỉa hè và chữ số).
  - Khi `isAuctionActive = true`: Hạ `bloomThreshold` xuống `1.2`. Do IMP-222 đã hạ ánh sáng xung quanh (`ambient * 0.15`), chỉ các chi tiết kim loại vàng champagne, xúc xắc nảy và đèn rọi đạt ngưỡng phát sáng, tạo quầng hào quang mềm mại (soft champagne bloom) đẳng cấp luxury.
- **Hạ tầng thực thi**:
  - Xuất khẩu hàm thuần túy `calculateDynamicBloomThreshold(isAuctionActive, baseThreshold, auctionThreshold)` trong [`src/client/3d/post_processing_pipeline.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/post_processing_pipeline.tsx).
  - Khắc phục lỗi default param shadowing: đổi thành `bloomThreshold: propBloomThreshold`, ưu tiên `propBloomThreshold !== undefined ? propBloomThreshold : calculateDynamicBloomThreshold(...)`.
  - Truyền `isAuctionActive={isAuctionActive}` từ nhánh `inGame` (L437) của `game_canvas.tsx` vào `PostProcessingPipeline`.

### 2.3. Tối Góc Tập Trung Thị Giác (Contextual Focus Vignette - 2 Tầng Song Phương)
- **Cơ chế thị giác**:
  - Khi bước vào đấu giá, viền 4 góc màn hình tối sẫm lại từ từ, tạo hiệu ứng đường hầm thị giác (Visual Tunneling), loại bỏ mọi xao nhãng ngoại vi để người chơi tập trung 100% vào sàn đấu giá.
- **Hạ tầng song phương**:
  - **Tầng WebGL (Desktop)**: Xuất khẩu `calculateDynamicVignetteDarkness(isAuctionActive, baseDarkness, auctionDarkness)` trong `post_processing_pipeline.tsx` (tăng từ `0.15` lên `0.35`). Tương tự, đổi param thành `vignetteDarkness: propVignetteDarkness` để tránh shadowing.
  - **Tầng 2D DOM (Mobile & Desktop)**: Trong [`src/client/3d/cinematic_effects.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/cinematic_effects.tsx) (`CinematicOverlay`), tách thành **2 lớp `div` gradient riêng biệt** (Lớp thường: `rgba(12, 74, 110, 0.32)`, Lớp đấu giá: tím than kịch nghệ `rgba(15, 23, 42, 0.65)`). Chuyển tiếp bằng thuộc tính `opacity` kèm `transition-opacity duration-500`. Trình duyệt nội suy opacity mượt mà 60 FPS, triệt tiêu 100% lỗi giật khựng CSS gradient snap!

---

## 3. ĐO LƯỜNG NGÂN SÁCH LOC VẬT LÝ (PRE-CODING LOC BASELINE)

Đo lường vật lý trên đĩa cứng:

| Tệp Vật Lý | Phân Loại Tier | LOC Hiện Tại | Dự Kiến Delta | LOC Sau Khi Sửa | Đánh Giá Ngân Sách |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/time_of_day_lighting.tsx` | Tier 2 (UI/3D/Views) | 291 | +26 | 317 | ✔️ An toàn (Trần <= 500) |
| `src/client/3d/post_processing_pipeline.tsx` | Tier 2 (PostFX/3D) | 165 | +26 | 191 | ✔️ An toàn (Trần <= 500) |
| `src/client/3d/cinematic_effects.tsx` | Tier 2 (FX/Overlay) | 121 | +22 | 143 | ✔️ An toàn (Trần <= 500) |
| `src/client/game_canvas.tsx` | Tier 2 (Canvas Root) | 447 | +3 | 450 | ✔️ An toàn (Trần <= 500) |
| `tests/client/auction_theatrical_fx.test.ts` | Test Suite | 0 | +220 | 220 | ✔️ An toàn (Trần <= 600) |

---

## 4. PHÂN TÍCH 5 NHÓM LỖI TIỀM ẨN & PHÒNG VỆ (5 CRITICAL FAILURE MODES)

1. **FM1 (Flash Trapping / Flash Kẹt Khi Nhận Bid Dồn Dập)**:
   - *Rủi ro*: Khi Bot hoặc người chơi bấm nâng giá liên tục nhiều lần trong $1$ giây, `bidFlashTimerRef` bị reset liên tục có thể gây kẹt ánh sáng ở mức cực đại.
   - *Phòng vệ*: Hàm `calculateBidFlashIntensity` dựa vào giá trị timer tuyến tính phân rã $(1 - t/d)^2$ có chặn trên $[0, \text{duration}]$. Mỗi lần bid mới chỉ đơn giản reset timer về 0 mà không cộng dồn lũy kế vô hạn.
2. **FM2 (Over-bloomed Glare Khi Hạ Ngưỡng Xuống 1.2)**:
   - *Rủi ro*: Nếu toàn bộ cảnh bị hạ threshold thì mặt bàn cờ có thể bị lóa trắng.
   - *Phòng vệ*: Chỉ hạ threshold khi `isAuctionActive = true`. Tại thời điểm này, IMP-222 đã hạ ánh sáng sa bàn xung quanh (`ambient * 0.15`, `sun * 0.15`) nên chỉ duy nhất các chi tiết kim loại trên bục đấu giá đạt ngưỡng phát sáng bloom.
3. **FM3 (Mobile WebGL Performance Churn)**:
   - *Rủi ro*: Bật thêm post-processing pass trên thiết bị di động gây tụt khung hình dưới 60 FPS.
   - *Phòng vệ*: Tuyệt đối giữ nguyên chốt chặn `enabled={!isMobileDevice}` trên `PostProcessingPipeline`. Trên Mobile, hiệu ứng tập trung thị giác được xử lý hoàn toàn qua lớp phủ 2D CSS `CinematicOverlay` với chi phí tính toán GPU bằng 0.
4. **FM4 (Stale Closure Khi Đấu Giá Kết Thúc Đột Ngột)**:
   - *Rủi ro*: Phiên đấu giá kết thúc hoặc bị đóng bất ngờ (`activeModal` chuyển sang null), hiệu ứng bloom hoặc vignette bị kẹt lại.
   - *Phòng vệ*: `isAuctionActive` được đọc trực tiếp từ Zustand store (`useGameStore`). Khi modal đóng, các hàm tính toán tự động trả về giá trị mặc định (`2.5` cho bloom, `0.15` cho vignette).
5. **FM5 (Backward Compatibility Regression Với Existing Tests)**:
   - *Rủi ro*: Phá vỡ các test case cũ kiểm tra props mặc định của `PostProcessingPipeline` hoặc chuỗi comment trong `game_canvas.tsx`.
   - *Phòng vệ*: Giữ nguyên comment `{/* <PostProcessingPipeline /> */}` tại `game_canvas.tsx L423, L436`. Toàn bộ props mới đều là optional và có fallback về `DEFAULT_PIPELINE_CONFIG`.

---

## 5. MA TRẬN KIỂM THỬ HỢP ĐỒNG 5 MẶT (UNIVERSAL 5-FACET MATRIX - 16 ATOMIC TESTS)

Toàn bộ test case nằm trong [`tests/client/auction_theatrical_fx.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/auction_theatrical_fx.test.ts):

- **Facet 1: Bid Flash Impulse & Mathematical Quadratic Decay (4 tests)**
  - `[TC-223.01/MSS][UC-IMP223][Facet-1/BidFlashPeak]`: Tại $t = 0$, `calculateBidFlashIntensity(0.28, 0, 1.5, 0.35)` trả về chính xác giá trị đỉnh $1.78$.
  - `[TC-223.02/MSS][UC-IMP223][Facet-1/BidFlashQuadraticDecay]`: Tại $t = 0.105$ ($\text{progress} = 0.3$), giá trị xung ánh sáng phân rã bậc hai $(1 - 0.3)^2 = 0.49$, trả về chính xác $1.015$ ($0.28 + 1.5 \times 0.49$), triệt tiêu hoàn toàn sai lệch tuyến tính ($1.33$).
  - `[TC-223.03/MSS][UC-IMP223][Facet-1/BidFlashExpiry]`: Khi $t \ge 0.35$, hàm hoàn trả chính xác giá trị gốc `baseIntensity` ($0.28$), triệt tiêu hoàn toàn xung flash.
  - `[TC-223.04/MSS][UC-IMP223][Facet-1/BidFlashZeroBase]`: Khi gọi với `base = 0` (để lấy gia số), trả về gia số $+1.5$ tại $t=0$ và $0$ tại $t \ge 0.35$.

- **Facet 2: Dynamic Bloom Thresholding (3 tests)**
  - `[TC-223.05/MSS][UC-IMP223][Facet-2/StandardBloomThreshold]`: Khi `isAuctionActive = false`, `calculateDynamicBloomThreshold(false)` trả về ngưỡng tiêu chuẩn $2.5$.
  - `[TC-223.06/MSS][UC-IMP223][Facet-2/TheatricalBloomThreshold]`: Khi `isAuctionActive = true`, `calculateDynamicBloomThreshold(true)` hạ ngưỡng xuống mức lộng lẫy $1.2$.
  - `[TC-223.07/MSS][UC-IMP223][Facet-2/CustomBloomThreshold]`: Hàm tôn trọng các tham số cấu hình tùy biến `(isAuctionActive, customBase, customAuction)`.

- **Facet 3: Contextual Vignette Darkness (3 tests)**
  - `[TC-223.08/MSS][UC-IMP223][Facet-3/StandardVignetteDarkness]`: Khi `isAuctionActive = false`, `calculateDynamicVignetteDarkness(false)` trả về độ tối nhẹ $0.15$.
  - `[TC-223.09/MSS][UC-IMP223][Facet-3/TheatricalVignetteDarkness]`: Khi `isAuctionActive = true`, `calculateDynamicVignetteDarkness(true)` tăng độ tối viền lên $0.35$ để tập trung thị giác.
  - `[TC-223.10/MSS][UC-IMP223][Facet-3/VignetteRangeClamping]`: Giá trị vignette tính toán luôn được kẹp an toàn trong đoạn $[0.0, 1.0]$.

- **Facet 4: Defensive Guards & Frame Loop Stability (3 tests)**
  - `[TC-223.11/MSS][UC-IMP223][Facet-4/BidFlashDefensiveGuards]`: Khi nhận `NaN`, `Infinity` hoặc số âm bất thường, `calculateBidFlashIntensity` phòng vệ trả về an toàn `baseIntensity`, không làm hỏng frame loop WebGL.
  - `[TC-223.12/MSS][UC-IMP223][Facet-4/ThresholdDefensiveGuards]`: `calculateDynamicBloomThreshold` và `calculateDynamicVignetteDarkness` phòng vệ giá trị đầu vào không hợp lệ.
  - `[TC-223.13/MSS][UC-IMP223][Facet-4/ZeroNegativeIntensity]`: Cường độ xung flash không bao giờ sinh ra số âm ngay cả khi truyền timer lệch ngưỡng.

- **Facet 5: Backward Compatibility & Resource Integrity (3 tests)**
  - `[TC-223.14/MSS][UC-IMP223][Facet-5/PostProcessingDefaultIntegrity]`: `PostProcessingPipeline` duy trì $100\%$ cấu hình mặc định khi không truyền `isAuctionActive`.
  - `[TC-223.15/MSS][UC-IMP223][Facet-5/CinematicOverlayDualLayerSSR]`: `renderToStaticMarkup(<CinematicOverlay />)` kết xuất HTML chứa cả 2 lớp gradient tối góc và các lớp phủ macro mà không ném ngoại lệ.
  - `[TC-223.16/MSS][UC-IMP223][Facet-5/TimeOfDayLightingBidFlashSignature]`: `TimeOfDayLighting` duy trì trọn vẹn `data-testid="time-of-day-lighting"` và export đầy đủ `calculateBidFlashIntensity`.

---

## 6. DROP-IN CODE SNIPPETS CỤ THỂ

#### Snippet 1: Hàm Thuần Túy Bid Flash & Tích Hợp Type-Safe Trong [`src/client/3d/time_of_day_lighting.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/time_of_day_lighting.tsx)

```ts
/**
 * Tính toán cường độ xung ánh sáng phản hồi khi có lượt trả giá mới (Bid Flash)
 * Xung ánh sáng bùng nổ tại t=0 và phân rã mượt mà theo hàm bậc hai (1 - t/duration)^2
 */
export function calculateBidFlashIntensity(
  baseIntensity: number,
  timer: number,
  boost: number = 1.5,
  duration: number = 0.35
): number {
  if (!Number.isFinite(baseIntensity)) return 0;
  if (!Number.isFinite(timer) || !Number.isFinite(boost) || !Number.isFinite(duration)) return baseIntensity;
  if (timer < 0 || timer >= duration || duration <= 0) return baseIntensity;

  const progress = timer / duration;
  const decay = (1.0 - progress) * (1.0 - progress);
  return baseIntensity + boost * decay;
}
```

Và tích hợp vào `TimeOfDayLighting` (trong `useSafeFrame` - **Zero Dirty Casts C1**):
```tsx
// Đọc trực tiếp type-safe từ SSOT game_store_types.ts:L244 (Zero dirty cast):
const currentBid = useGameStore((s) => s.auction?.currentBid ?? 0);
const prevBidRef = useRef<number>(currentBid);
const bidFlashTimerRef = useRef<number>(1.0);

// Trong useSafeFrame callback:
if (isAuctionActive && currentBid > prevBidRef.current) {
  bidFlashTimerRef.current = 0;
}
prevBidRef.current = currentBid;
bidFlashTimerRef.current += dt;

// Gia số Bid Flash cho ambient và direct light:
const flashBoost = isAuctionActive ? calculateBidFlashIntensity(0, bidFlashTimerRef.current, 1.2, 0.35) : 0;
// Cộng dồn an toàn vào ambient.intensity và sun.intensity trong frame loop
```

#### Snippet 2: Dynamic Bloom & Vignette Trong [`src/client/3d/post_processing_pipeline.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/post_processing_pipeline.tsx)

```tsx
export function calculateDynamicBloomThreshold(
  isAuctionActive: boolean,
  baseThreshold: number = DEFAULT_PIPELINE_CONFIG.bloomThreshold,
  auctionThreshold: number = 1.2
): number {
  if (!Number.isFinite(baseThreshold) || !Number.isFinite(auctionThreshold)) return 2.5;
  return isAuctionActive ? auctionThreshold : baseThreshold;
}

export function calculateDynamicVignetteDarkness(
  isAuctionActive: boolean,
  baseDarkness: number = DEFAULT_PIPELINE_CONFIG.vignetteDarkness,
  auctionDarkness: number = 0.35
): number {
  if (!Number.isFinite(baseDarkness) || !Number.isFinite(auctionDarkness)) return 0.15;
  const raw = isAuctionActive ? auctionDarkness : baseDarkness;
  return Math.max(0.0, Math.min(1.0, raw));
}

// Cập nhật PostProcessingPipelineProps:
export interface PostProcessingPipelineProps {
  isAuctionActive?: boolean;
  // ... các props hiện có giữ nguyên
}

// Khắc phục ES6 default param shadowing (P1):
export function PostProcessingPipeline({
  enabled = DEFAULT_PIPELINE_CONFIG.enabled,
  isAuctionActive = false,
  enableBloom = DEFAULT_PIPELINE_CONFIG.enableBloom,
  enableVignette = DEFAULT_PIPELINE_CONFIG.enableVignette,
  bloomThreshold: propBloomThreshold,
  vignetteDarkness: propVignetteDarkness,
  // ... các props khác
}: PostProcessingPipelineProps): React.ReactElement<{ children?: any }> | null {
  // ...
  const resolvedBloomThreshold = propBloomThreshold !== undefined
    ? propBloomThreshold
    : calculateDynamicBloomThreshold(Boolean(isAuctionActive), DEFAULT_PIPELINE_CONFIG.bloomThreshold, 1.2);

  const resolvedVignetteDarkness = propVignetteDarkness !== undefined
    ? propVignetteDarkness
    : calculateDynamicVignetteDarkness(
        Boolean(isAuctionActive),
        DEFAULT_PIPELINE_CONFIG.vignetteDarkness,
        0.35
      );

  // Áp dụng vào Bloom:
  {enableBloom && (
    <Bloom
      luminanceThreshold={resolvedBloomThreshold}
      luminanceSmoothing={DEFAULT_PIPELINE_CONFIG.bloomSmoothing}
      intensity={isMobile ? 0.12 : (isAuctionActive ? 0.30 : bloomIntensity)}
      mipmapBlur={!isMobile}
      radius={DEFAULT_PIPELINE_CONFIG.bloomRadius}
    />
  )}

  // Áp dụng vào Vignette:
  {enableVignette && (
    <Vignette
      offset={DEFAULT_PIPELINE_CONFIG.vignetteOffset}
      darkness={resolvedVignetteDarkness}
      eskil={false}
    />
  )}
```

#### Snippet 3: 2-Layer Dual Gradient Overlay Trong [`src/client/3d/cinematic_effects.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/cinematic_effects.tsx)

```tsx
import { useGameStore } from '../store/game_store';

export function CinematicOverlay(): React.ReactElement {
  const activeModal = useGameStore((s) => s.activeModal);
  const isAuction = activeModal === 'auction';

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1A. Lens Vignette Tiêu Chuẩn (Mờ dần khi đấu giá) */}
      <div
        className="absolute inset-0 transition-opacity duration-500 ease-out"
        style={{
          opacity: isAuction ? 0 : 1,
          background: 'radial-gradient(ellipse at 50% 50%, transparent 70%, rgba(14, 116, 144, 0.12) 88%, rgba(12, 74, 110, 0.32) 100%)',
        }}
      />

      {/* 1B. Lens Vignette Đấu Giá Kịch Nghệ Tím Than (Hiện dần khi đấu giá) */}
      <div
        className="absolute inset-0 transition-opacity duration-500 ease-out"
        style={{
          opacity: isAuction ? 1 : 0,
          background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(15, 23, 42, 0.40) 78%, rgba(15, 23, 42, 0.70) 100%)',
        }}
      />

      {/* 2. Tilt-Shift Macro Defocus Bands giữ nguyên */}
      {/* 3. Golden Hour Color Grade giữ nguyên */}
    </div>
  );
}
```

#### Snippet 4: Kết Nối `isAuctionActive` CHỈ Trong Nhánh inGame (L437) Của [`src/client/game_canvas.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx)

```tsx
// Lấy activeModal:
const activeModal = useGameStore((s) => s.activeModal);
const isAuctionActive = activeModal === 'auction';

// 1. Nhánh preMatch (L424): GIỮ NGUYÊN HOÀN TOÀN, không truyền isAuctionActive:
{/* <PostProcessingPipeline /> */}
<PostProcessingPipeline isMobile={isMobileDevice} enabled={!isMobileDevice} />

// 2. Nhánh inGame (L437): KẾT NỐI isAuctionActive (bảo toàn comment di sản L436):
{/* <PostProcessingPipeline /> */}
<PostProcessingPipeline
  isMobile={isMobileDevice}
  enabled={!isMobileDevice}
  isAuctionActive={isAuctionActive}
/>
```

---

## 7. QUY TRÌNH 3 TRẠM TỰ HÀNH (3-STATION PIPELINE)

1. **Station 1 (RED Contract Test)**: `qa-tester` tạo tệp `tests/client/auction_theatrical_fx.test.ts` (16 atomic tests theo 5 Facets, cấm sửa `src/**`, chứng minh Business RED).
2. **Station 2 (GREEN Implementation)**: `implementer` hiện thực mã nguồn tại 4 tệp trên, đưa toàn bộ 16 tests về GREEN và bảo toàn các tests cũ.
3. **Station 2.5 (Sweeping Scout Audit)**: `scout` quét vật lý các tệp đã sửa kiểm tra 5 nhóm lỗi phổ biến và đo ngân sách LOC.
4. **Station 3 (Independent Review)**: `spec-reviewer` và `game-3d-visual-critic` thẩm định độc lập đĩa cứng và cấp phán quyết xuất xưởng.
