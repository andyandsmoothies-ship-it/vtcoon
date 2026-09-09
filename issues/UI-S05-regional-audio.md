# Ticket UI-S05: Hệ Thống Âm Thanh Không Gian Vùng Miền (howler.js Audio Engine)

> **Epic:** 3D Visual & DOM UI/UX Overlay (Giai đoạn 2)  
> **Slice:** UI-05 (Lát cắt cuối cùng hoàn tất Epic 2)  
> **Ưu tiên:** P1 — Nâng tầm trải nghiệm thính giác và bản sắc văn hóa địa phương  
> **Trạng thái:** 🔵 SẴN SÀNG THI CÔNG  
> **Phụ thuộc:** UI-01 (Sa bàn 3D), UI-02 (Pawn Spring & Dice 3D), UI-03 (DOM HUD), UI-04 (Modals Nghiệp Vụ) ✅ 521/521 Tests PASS  

---

## 1. Bối Cảnh & Vấn Đề Cần Giải Quyết

Trò chơi đã hoàn thiện toàn diện về mặt thị giác 3D, chuyển động vật lý và các bảng điều khiển nghiệp vụ qua Slices UI-01 đến UI-04. Tuy nhiên:
- **Thiếu phản hồi thính giác (Audio Feedback):** Các hành vi gieo xúc xắc, quân cờ nhảy từng bước, mua đất, đấu giá, rút thẻ sự kiện và phá sản diễn ra trong im lặng, làm giảm cảm xúc kịch tính của người chơi.
- **Chưa thể hiện bản sắc 4 vùng miền qua âm nhạc:** Theo thiết kế `docs/domain/design.md §2 (Dynamic Regional Audio)`, 4 cạnh của bàn cờ tương ứng với 4 không gian văn hóa đặc sắc của Việt Nam (Tây Nam Bộ, Duyên hải Miền Trung, Bắc Trung Bộ, Đô thị lõi Hà Nội - TP.HCM). Hiện tại chưa có hệ thống chuyển tiếp nhạc nền tự động (Crossfade 1,5 giây) khi quân cờ chuyển cạnh địa lý.
- **Chưa có trình quản lý âm lượng tập trung:** Cần cung cấp khả năng điều chỉnh Master / BGM / SFX Volume và nút Bật/Tắt âm thanh (Mute/Unmute) trên thanh Top Bar để tôn trọng sự riêng tư của người dùng.

**Mục tiêu Slice UI-05:**
1. Cài đặt thư viện `howler` và `@types/howler` để tận dụng Web Audio API tối ưu bộ nhớ đệm âm thanh.
2. Xây dựng module `src/client/audio/audio_types.ts` định nghĩa các hằng số, enum `BGMTrack`, `SoundEffect`, đường dẫn tài nguyên âm thanh và hàm thuần `getBgmTrackForCell(cellIndex)`.
3. Xây dựng `src/client/audio/audio_engine.ts` (AudioEngine singleton) hỗ trợ:
   - Phát nhạc nền lặp (Looping BGM) và Crossfade 1,5s mượt mà giữa các vùng miền khi quân cờ chuyển cạnh.
   - Phát hiệu ứng âm thanh (One-shot SFX) cho xúc xắc, bước nhảy, mua đất, khánh thành Cấp 3, đấu giá, rút thẻ, phá sản.
   - Tự động khắc phục chính sách Autoplay Policy của trình duyệt hiện đại (AudioContext resume khi người dùng click tương tác đầu tiên).
4. Xây dựng `src/client/store/audio_store.ts` (Zustand) lưu trữ `masterVolume`, `bgmVolume`, `sfxVolume`, `isMuted`, và `currentBgmTrack`.
5. Bổ sung nút bấm Mute/Unmute trực quan có icon động (🔊 / 🔇) trên `src/client/ui/top_bar.tsx`.
6. Tích hợp phát SFX vào callback gieo xúc xắc, di chuyển quân cờ, mở thẻ Sổ Đỏ, kết thúc lượt.
7. Đảm bảo bảo toàn 100% kết quả xanh 521 tests hiện có, bổ sung test suite logic và Adversarial Inversion (Vitest Node.js thuần, mock Howl an toàn).

---

## 2. Use Case & Căn Cứ Kiến Trúc

| Căn cứ | Mục tham chiếu | Yêu cầu kỹ thuật |
|---|---|---|
| `ADR-0002` | §1 Tổng quan Stack | `howler.js` (Web Audio API) quản lý Spatial Audio và tối ưu hóa buffer |
| `design.md` | §2 Dynamic Regional Audio | Nhạc nền 4 cạnh: Cạnh 1 Đàn Kìm, Cạnh 2 Đàn Bầu/Sóng biển, Cạnh 3 Cồng Chiêng, Cạnh 4 Lofi/Jazz đô thị. Crossfade 1,5s |
| `design.md` | §1 Mega Project VFX | SFX Khánh Thành Đại Dự Án (Cấp 3 - Max) phát 1 lần trang trọng, không loop |
| `_epic_ledger.md` | Mục Slice UI-05 | `TC-UI05.1` đến `TC-UI05.4` và chuẩn nghiệm thu DoD Epic 2 |

---

## 3. Phạm Vi Công Việc (Scope)

### 3.1 Cài Đặt Gói Bổ Trợ
- `npm install howler`
- `npm install -D @types/howler`

### 3.2 Các Tệp Tạo Mới (New Files)
1. `src/client/audio/audio_types.ts` (≤ 70 LOC): Enum `BGMTrack` (4 cạnh địa lý), enum `SoundEffect`, bảng ánh xạ file `/assets/audio/...`, hàm pure `getBgmTrackForCell`.
2. `src/client/audio/audio_engine.ts` (≤ 200 LOC): Singleton quản lý Howl instances, crossfade 1,5s mượt mà giữa các track, play one-shot SFX, sync volume và mute.
3. `src/client/store/audio_store.ts` (≤ 80 LOC): Zustand store lưu trữ cấu hình âm lượng người dùng và kết nối với `AudioEngine`.
4. `tests/client/ui05_audio_engine.test.ts` (≤ 180 LOC): Test suite kiểm thử logic ánh xạ vùng miền, crossfade timer, volume clamp, mute toggle và Adversarial Inversion.

### 3.3 Các Tệp Cập Nhật (Modify Files)
1. `src/client/ui/top_bar.tsx`: Thêm nút bấm Mute/Unmute ở góc phải.
2. `src/client/main.tsx`: Khởi tạo AudioEngine khi tương tác người dùng, phát BGM theo ô khởi đầu và kích hoạt SFX khi gieo xúc xắc/kết thúc lượt.
3. `docs/epics/client_ui/_epic_ledger.md`: Đánh dấu hoàn thành Slice UI-05 và chuẩn bị tổng kết Epic 2.

---

## 4. Đặc Tả Thiết Kế Chi Tiết

### 4.1 Ánh Xạ Vùng Miền Bàn Cờ (4 Cạnh Địa Lý)
- Hàm `getBgmTrackForCell(cellIndex: number): BGMTrack`:
  - Ô $00 \to 09$ (Cạnh 1): `BGMTrack.TAY_NAM_BO` (Sông nước, đàn kìm).
  - Ô $10 \to 19$ (Cạnh 2): `BGMTrack.DUYEN_HAI_MIEN_TRUNG` (Sóng biển, đàn bầu).
  - Ô $20 \to 29$ (Cạnh 3): `BGMTrack.BAC_TRUNG_BO` (Cồng chiêng, sinh thái Tràng An).
  - Ô $30 \to 39$ (Cạnh 4): `BGMTrack.DO_THI_LOI` (Lofi/Jazz Hà Nội & TP.HCM).

### 4.2 Cơ Chế Crossfade 1,5 Giây
- Khi quân cờ chuyển từ ô ở Cạnh A sang Cạnh B:
  - Nếu `trackA === trackB`: Giữ nguyên, không ngắt quãng hay lặp lại.
  - Nếu `trackA !== trackB`:
    - Track cũ: `fade(currentVol, 0, 1500)` rồi gọi `stop()` khi âm lượng về 0.
    - Track mới: `volume(0)`, `play()`, `fade(0, targetBgmVol, 1500)`.

### 4.3 Danh Mục Hiệu Ứng Âm Thanh (One-shot SFX)
- `DICE_ROLL`: Tiếng lắc xúc xắc nảy lách cách trong khay.
- `PAWN_STEP`: Tiếng bước nhảy bật nảy lò xo nhẹ nhàng.
- `BUY_PROPERTY`: Tiếng đóng dấu giấy tờ / đếm tiền.
- `UPGRADE_C3`: Hồi chuông khánh thành đại dự án (phát 1 lần, không loop).
- `AUCTION_BID`: Tiếng gõ búa đấu giá.
- `TRADE_SUCCESS`: Tiếng chuông giao dịch thành công.
- `CARD_DRAW`: Tiếng sột soạt rút thẻ bài.
- `BANKRUPT`: Tiếng còi báo động vỡ nợ.
- `TAX_PENALTY`: Tiếng nộp phạt ngân khố.

---

## 5. Hợp Đồng Kiểm Thử (Test Contracts)

| Mã TC | Kịch bản | Kết quả Kỳ vọng | Adversarial Inversion |
|---|---|---|---|
| `TC-UI05.1` | `getBgmTrackForCell(cellIndex)` | 40 ô bàn cờ ánh xạ chính xác 4 vùng miền theo đúng 4 cạnh 10 ô | Ô âm hoặc ngoài 39 tự động wrap-around $\pmod{40}$ hoặc trả về fallback an toàn |
| `TC-UI05.2` | Crossfade giữa 2 vùng khác nhau | Kích hoạt fade out track cũ 1,5s và fade in track mới 1,5s; cùng vùng không kích hoạt fade lại | Hai lần chuyển cạnh liên tục (< 500ms) không gây chồng chéo hoặc rò rỉ audio buffer |
| `TC-UI05.3` | Phát SFX Khánh Thành Cấp 3 | SFX phát chính xác 1 lần, thuộc tính `loop === false` | Phát liên tục nhiều lần không làm nghẽn kênh SFX |
| `TC-UI05.4` | Chuyển đổi trạng thái Mute | Khi `isMuted === true`, toàn bộ âm thanh về volume 0; khi bật lại khôi phục đúng mức volume trước đó | Tắt âm thanh không làm ảnh hưởng hay gián đoạn luồng logic FSM |

---

## 6. Tiêu Chí Hoàn Thành (Definition of Done)
- [ ] `howler` và `@types/howler` được cài đặt thành công, không xung đột dependency.
- [ ] 521 tests cũ giữ vững 100% PASS (Zero Regression).
- [ ] Bổ sung 15–20 unit tests mới trong `tests/client/ui05_audio_engine.test.ts`.
- [ ] `npx tsc --noEmit` hoàn tất với 0 lỗi.
- [ ] Ngân sách mỗi tệp tuân thủ nghiêm ngặt `audio_engine.ts` ≤ 200 LOC, `audio_store.ts` ≤ 80 LOC.
- [ ] Nút Mute/Unmute trên Top Bar hoạt động mượt mà và trực quan trên trình duyệt.
