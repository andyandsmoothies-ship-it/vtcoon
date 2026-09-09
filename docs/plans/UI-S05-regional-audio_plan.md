# Kế Hoạch Thi Công (Task DAG): Slice UI-05 — Hệ Thống Âm Thanh Không Gian Vùng Miền (howler.js Audio Engine)

> **Ticket:** `issues/UI-S05-regional-audio.md`  
> **Căn cứ:** `ADR-0002` (§1 Tổng quan Stack howler.js) · `docs/domain/design.md` (§2 Dynamic Regional Audio)  
> **Ràng buộc:** Ngân sách mỗi tệp `audio_engine.ts` ≤ 200 LOC, `audio_store.ts` ≤ 80 LOC, Zero Regression (giữ vững 521 tests), TypeScript Strict Mode.

---

## 1. Sơ Đồ Kiến Trúc Luồng & Phụ Thuộc (DAG 1 Chiều)

```
                       ┌────────────────────────────────────────┐
                       │  T1: Cài đặt howler & @types/howler    │
                       └───────────────────┬────────────────────┘
                                           │
         ┌─────────────────────────────────┴─────────────────────────────────┐
         ▼                                                                   ▼
┌────────────────────────────────────────┐                 ┌────────────────────────────────────────┐
│ T2: Audio Types & Map Vùng Miền        │                 │ T3: Audio Store (Zustand)              │
│ src/client/audio/audio_types.ts        │                 │ src/client/store/audio_store.ts        │
│ (BGMTrack, SoundEffect, getBgmTrack)   │                 │ (masterVolume, isMuted, toggleMute)    │
└───────────────────┬────────────────────┘                 └───────────────────┬────────────────────┘
                    │                                                          │
                    └──────────────────────┬───────────────────────────────────┘
                                           ▼
                             ┌───────────────────────────┐
                             │ T4: AudioEngine Singleton │
                             │ src/client/audio/         │
                             │ audio_engine.ts           │
                             │ (Crossfade 1.5s, SFX)     │
                             └─────────────┬─────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    ▼                                             ▼
        ┌───────────────────────────┐                 ┌───────────────────────────┐
        │ T5: Top Bar Mute Button   │                 │ T6 & T7: Tích Hợp Audio   │
        │ src/client/ui/top_bar.tsx │                 │ main.tsx, ActionDock,     │
        │ (Nút 🔊 / 🔇 trực quan)    │                 │ và các Modals nghiệp vụ   │
        └───────────┬───────────────┘                 └───────────┬───────────────┘
                    │                                             │
                    └──────────────────────┬──────────────────────┘
                                           ▼
                             ┌───────────────────────────┐
                             │ T8: Howler Mock Module    │
                             │ tests/client/mocks/       │
                             │ howler_mock.ts            │
                             └─────────────┬─────────────┘
                                           ▼
                             ┌───────────────────────────┐
                             │ T9: Bộ Kiểm Thử Logic     │
                             │ ui05_audio_engine.test.ts │
                             └─────────────┬─────────────┘
                                           ▼
                             ┌───────────────────────────┐
                             │ T10: Verification Gate    │
                             │ tsc + 521+ Tests + Ledger │
                             └───────────────────────────┘
```

---

## 2. Chi Tiết Từng Micro-Task Trong DAG

### Task T1: Cài Đặt Thư Viện `howler` & `@types/howler`
- **Mục tiêu:** Cung cấp Web Audio API wrapper chuẩn công nghiệp.
- **Thực thi:**
  - `cmd /c "npm install howler && npm install -D @types/howler"`
  - Xác nhận `package.json` bổ sung đúng dependencies.

### Task T2: Định Nghĩa Kiểu Dữ Liệu Âm Thanh (`audio_types.ts`) [NEW, ~60 LOC]
- **Mục tiêu:** Định nghĩa chuẩn hóa enum các track BGM, SFX và hàm toán học phân định vùng miền:
  ```typescript
  export enum BGMTrack {
    TAY_NAM_BO = 'TAY_NAM_BO',                       // Cạnh 1: Ô 00 - 09
    DUYEN_HAI_MIEN_TRUNG = 'DUYEN_HAI_MIEN_TRUNG',   // Cạnh 2: Ô 10 - 19
    BAC_TRUNG_BO = 'BAC_TRUNG_BO',                   // Cạnh 3: Ô 20 - 29
    DO_THI_LOI = 'DO_THI_LOI',                       // Cạnh 4: Ô 30 - 39
  }
  export enum SoundEffect {
    DICE_ROLL = 'DICE_ROLL',
    PAWN_STEP = 'PAWN_STEP',
    BUY_PROPERTY = 'BUY_PROPERTY',
    UPGRADE_C3 = 'UPGRADE_C3',
    AUCTION_BID = 'AUCTION_BID',
    TRADE_SUCCESS = 'TRADE_SUCCESS',
    CARD_DRAW = 'CARD_DRAW',
    BANKRUPT = 'BANKRUPT',
    TAX_PENALTY = 'TAX_PENALTY',
  }
  export function getBgmTrackForCell(cellIndex: number): BGMTrack;
  ```
- **Ngân sách:** ≤ 70 LOC. Pure TypeScript, kiểm thử 100% bằng Vitest.

### Task T3: Quản Lý Trạng Thái Âm Thanh (`src/client/store/audio_store.ts`) [NEW, ~60 LOC]
- **Mục tiêu:** Zustand store quản lý cài đặt volume của người dùng:
  - `masterVolume: number` (0..1, mặc định 0.8)
  - `bgmVolume: number` (0..1, mặc định 0.6)
  - `sfxVolume: number` (0..1, mặc định 0.8)
  - `isMuted: boolean` (mặc định false)
  - `currentBgmTrack: BGMTrack | null`
- **Actions:** `setMasterVolume`, `setBgmVolume`, `setSfxVolume`, `toggleMute`, `setCurrentBgmTrack`.
- **Ngân sách:** ≤ 80 LOC.

### Task T4: Bộ Điều Phối Âm Thanh Cốt Lõi (`audio_engine.ts`) [NEW, ~180 LOC]
- **Mục tiêu:** Lớp singleton `AudioEngine` tương tác với `Howl`:
  - **Khởi tạo Lazy:** Tránh vi phạm Autoplay Policy của trình duyệt; tự động unlock AudioContext khi người dùng tương tác lần đầu.
  - **BGM Crossfade 1,5 giây:** Khi chuyển sang track mới, mờ dần track cũ trong 1500ms rồi dừng, đồng thời tăng dần track mới từ 0 lên target volume.
  - **Phát One-shot SFX:** Phát âm thanh sự kiện một lần, tự ngắt khi Mute, không chặn luồng FSM.
  - **Điều khiển âm lượng:** Đồng bộ hóa realtime khi người dùng thay đổi âm lượng hoặc toggle Mute.
- **Ngân sách:** ≤ 200 LOC. Zero any, TypeScript strict.

### Task T5: Nút Mute/Unmute Trên Top Bar (`src/client/ui/top_bar.tsx`) [MODIFY, ~75 LOC]
- **Mục tiêu:** Thêm nút toggle Mute ở góc phải của thanh `TopBar`:
  - Biểu tượng `🔊` khi đang bật âm thanh, `🔇` khi đang tắt tiếng.
  - Tooltip: "Bật / Tắt âm thanh".
  - Bấm nút kích hoạt `useAudioStore.getState().toggleMute()`.
- **Ngân sách:** ≤ 80 LOC.

### Task T6 & T7: Tích Hợp Audio Vào Vòng Lặp Trò Chơi & Modals [MODIFY]
- `src/client/main.tsx`:
  - Gọi `AudioEngine.init()` và `AudioEngine.handlePawnLanded(0)` để khởi động BGM Tây Nam Bộ.
  - Phát SFX `DICE_ROLL` khi người chơi click "Đổ Xúc Xắc".
  - Phát BGM chuyển vùng khi quân cờ dừng tại ô mới.
- Các component Modal:
  - `title_deed_modal.tsx`: Phát `SoundEffect.BUY_PROPERTY` khi bấm Mua.
  - `auction_modal.tsx`: Phát `SoundEffect.AUCTION_BID` khi đặt giá.
  - `trade_modal.tsx`: Phát `SoundEffect.TRADE_SUCCESS` khi chấp thuận giao dịch.
  - `event_card_modal.tsx`: Phát `SoundEffect.CARD_DRAW` khi mở thẻ sự kiện.

### Task T8: Howler Mock Module Cho Môi Trường Kiểm Thử (`howler_mock.ts`) [NEW, ~60 LOC]
- **Mục tiêu:** Giả lập `Howl` class để chạy kiểm thử siêu tốc trên Vitest Node.js mà không cần Web Audio API thật của trình duyệt:
  - Mock các phương thức: `play`, `stop`, `fade`, `volume`, `mute`, `on`.
- **Ngân sách:** ≤ 70 LOC.

### Task T9: Bộ Kiểm Thử Tự Động Toàn Diện (`ui05_audio_engine.test.ts`) [NEW, ~170 LOC]
- **Mục tiêu:** 16–20 tests kiểm thử toàn diện các hợp đồng:
  - `TC-UI05.1`: `getBgmTrackForCell` ánh xạ 40 ô chính xác 4 vùng miền theo 4 cạnh địa lý.
  - `TC-UI05.2`: Crossfade 1,5s kích hoạt đúng khi đổi vùng, không kích hoạt lại khi cùng vùng.
  - `TC-UI05.3`: SFX Khánh thành Cấp 3 phát 1 lần, không lặp (`loop === false`).
  - `TC-UI05.4`: Toggle Mute đưa âm lượng về 0 và khôi phục đúng mức volume ban đầu.
  - **Adversarial Inversions:** Ô âm hoặc > 39 tự động wrap-around an toàn; volume vượt ngưỡng [0, 1] được kẹp chuẩn xác; gọi play âm thanh khi chưa có asset không gây crash ứng dụng.

### Task T10: Đóng Gói, Verification Gate & Tổng Kết Epic 2
- Chạy `npx tsc --noEmit` kiểm tra kiểu dữ liệu (0 errors).
- Chạy `npm test` chứng minh toàn bộ 521 tests cũ + tests mới UI-05 đều PASS (Dự kiến: ≥ 540 tests).
- Chạy `npm run build` xác nhận Vite đóng gói thành công.
- Cập nhật `docs/epics/client_ui/_epic_ledger.md`: Đánh dấu **HOÀN THÀNH 100% GIAI ĐOẠN 2 (EPIC 3D VISUAL & DOM UI/UX OVERLAY)**!

---

## 3. Kế Hoạch Kiểm Chứng Visual & Audio Smoke Gate

1. Khởi động dev server: `cmd /c "npm run dev"`.
2. Mở trình duyệt tại `http://localhost:5173`.
3. **Kiểm tra trực quan & âm thanh:**
   - Quan sát góc phải Top Bar có nút âm thanh `🔊`.
   - Click nút "Đổ Xúc Xắc": Lắng nghe tiếng xúc xắc xóc lách cách và tiếng quân cờ nhảy từng bước.
   - Khi quân cờ vượt qua các ô góc (chuyển sang Cạnh 2, 3, 4): Lắng nghe âm nhạc chuyển tiếp mượt mà (Crossfade) sang giai điệu vùng miền mới.
   - Bấm nút `🔊` trên Top Bar: Icon chuyển thành `🔇`, toàn bộ âm thanh tắt ngay lập tức mà không ảnh hưởng tới tiến trình ván đấu.
   - Bấm lại nút `🔇`: Icon chuyển thành `🔊`, âm nhạc khôi phục với âm lượng dễ chịu.
