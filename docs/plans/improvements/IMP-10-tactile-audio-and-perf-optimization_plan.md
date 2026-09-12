# KẾ HOẠCH CẢI TIẾN IMP-10: HỆ THỐNG ÂM THANH XÚC GIÁC & TỐI ƯU HIỆU NĂNG 60 FPS (GIAI ĐOẠN 4)

## 1. BỐI CẢNH & MỤC TIÊU
- **Hiện trạng trước cải tiến**:
  1. Âm thanh phụ thuộc hoàn toàn vào file tĩnh qua `howler.js`. Khi mạng chập chờn hoặc file chưa nạp kịp, các hành động tương tác như tung xúc xắc, chốt đấu giá hay dậm quân cờ bị câm lặng hoàn toàn, thiếu cảm giác xúc giác (tactile feedback).
  2. Chưa có âm thanh môi trường thư thái (ambient sóng biển vịnh hoàng hôn) và hợp âm Jazz Lounge cho Sảnh Chờ Penthouse VIP tầng 80 vừa hoàn thiện ở Giai đoạn 3.
  3. Giao diện sảnh chờ (LobbyView) thiếu nút bật/tắt nhanh âm thanh trực tiếp.
  4. Hệ thống cây xanh sa bàn trong `diorama_skyline.tsx` render 20 nhóm cây độc lập (60 meshes riêng rẽ) làm tiêu hao draw calls không cần thiết. Cần kiểm soát Draw Call Budget (< 85 calls) và cơ chế thích ứng LOD để duy trì 60 FPS ổn định trên mọi thiết bị.
- **Mục tiêu Giai đoạn 4**:
  1. **WebAudio API Synth / Tactile Audio Engine (`src/client/audio/sound_engine.ts`)**:
     - Tổng hợp âm thanh thủ tục (procedural synthesis) nhẹ (<50KB), zero-dependency file mp3, độ trễ 0ms:
       * `playDiceRoll()`: Tiếng va đập lách cách đa tầng của xúc xắc acrylic qua bandpass noise và transient clicks.
       * `playAuctionGavel()`: Tiếng búa gõ đanh thép khi chốt giá thành công ("Cộc! Cộc!" double strike kèm resonance decay).
       * `playConstructionSlam()`: Tiếng nén trầm 42Hz khi công trình cắm móng (pitch drop 120Hz -> 42Hz punchy sub-bass).
       * `playMoneyTransfer()`: Tiếng đếm tiền và chuông ting ting tài khoản (chime arpeggio E6-G#6-B6-E7).
       * `playPawnStep()`: Tiếng chạm gõ nhẹ xúc giác quân cờ di chuyển với cao độ micro-pitch ngẫu nhiên.
       * `playPenthouseOceanAmbient()` / `stopPenthouseOceanAmbient()`: Tiếng sóng vịnh biển dập dìu ngoài vách kính penthouse điều biến bằng LFO 0.1Hz và gió nhẹ.
       * `playJazzLoungeChords()`: Hợp âm Jazz Rhodes dịu êm cho Sảnh VIP.
     - Khởi tạo AudioContext an toàn, tự động mở khóa theo tương tác người dùng, không bao giờ văng lỗi khi chạy test headless hoặc trình duyệt chặn autoplay.
  2. **Tích Hợp Đồng Bộ & Nút Bật/Tắt Âm Thanh**:
     - Kết nối mật thiết với `AudioEngine` và `useAudioStore` (đồng bộ masterVolume, sfxVolume, bgmVolume, isMuted).
     - Bổ sung nút Bật/Tắt âm thanh tiện ích nổi bật trên thanh điều hướng Sảnh Chờ `LobbyView` (`data-testid="lobby-mute-toggle-button"`).
     - Kết nối hiệu ứng gõ búa vào `Auction3DStage` / `AuctionModal`, âm cắm móng vào `ConstructionSlamVFX`, âm sóng biển vào `PenthouseLobbyScene`.
  3. **Tối Ưu Hiệu Năng 60 FPS & Draw Call Budgets / LOD / Instancing**:
     - Tối ưu hóa 20 cây xanh sa bàn thành `InstancedMesh` (hoặc geometry kết hợp) giảm draw calls từ 60 xuống còn 3.
     - Module quản lý ngân sách đồ họa `src/client/3d/perf_budget.ts`: Giám sát WebGL renderer info (`gl.info.render.calls`, `gl.info.render.triangles`), cấp độ phân giải LOD (High/Medium/Low) và framerate clamp.
  4. **Chỉ Tiêu Chất Lượng (DoD)**:
     - 100% test suites tiếp tục PASS (102+ test suites, 1.190+ tests, Zero Regression).
     - Biên dịch TypeScript sạch sẽ (`npx tsc --noEmit` = 0 lỗi).
     - Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION (Project Harness).

---

## 2. PHẠM VI TỆP TIN & THAY ĐỔI
- `src/client/audio/sound_synth_recipes.ts` (NEW): Thư viện công thức toán học và cấu trúc nốt tổng hợp thủ tục (procedural synthesis recipes) cho xúc xắc acrylic, búa gõ kép, cắm móng 42Hz, chuông tiền, bước cờ, sóng biển LFO và hợp âm Rhodes.
- `src/client/audio/sound_engine.ts` (NEW): Bộ máy điều phối âm thanh xúc giác WebAudio API (Tactile SoundEngine), quản lý AudioContext, hệ thống bus Master/SFX/BGM phân tầng và đồng bộ reactive với Zustand store.
- `src/client/audio/audio_engine.ts` (MODIFY): Tích hợp WebAudio Synth vào kiến trúc âm thanh toàn hệ thống, cung cấp các hàm xúc giác đồng bộ và xử lý sự kiện `visibilitychange` tự động resume AudioContext khi tab quay lại hoạt động.
- `src/client/3d/penthouse_lobby_scene.tsx` (MODIFY): Kích hoạt ambient sóng biển vịnh hoàng hôn khi người chơi ở sảnh chờ, giải phóng tài nguyên khi thoát.
- `src/client/3d/auction_3d_stage.tsx` (MODIFY): Kích hoạt tiếng búa gõ đấu giá xúc giác khi có lệnh nâng giá mới.
- `src/client/3d/perf_budget.ts` (NEW): Bộ giám sát ngân sách draw calls, tam giác dựng hình và các ngưỡng phân giải LOD thích ứng.
- `src/client/3d/diorama/diorama_skyline.tsx` (MODIFY): Tối ưu hóa hệ thống cây xanh sa bàn sử dụng Instancing hoặc chia sẻ hình học tối ưu.
- `src/client/ui/lobby/lobby_view.tsx` (MODIFY): Bổ sung nút bật/tắt âm thanh trực tiếp `lobby-mute-toggle-button`.
- `tests/client/sound_engine.test.ts` (NEW): Kiểm thử đơn vị và nghịch đảo đối kháng cho SoundEngine WebAudio Synth, bảo đảm an toàn khi bị chặn autoplay hoặc môi trường không có AudioContext, kiểm thử bus routing Master/SFX/BGM và debounce búa đấu giá.
- `tests/client/perf_budget.test.ts` (NEW): Kiểm thử đo lường ngân sách Draw Calls, ngưỡng phân tầng LOD và tính toàn vẹn 60 FPS.
- `docs/reports/improvements/IMP-10-tactile-audio-and-perf-optimization_report.md` (NEW): Báo cáo nghiệm thu thực nghiệm đầy đủ.
- `docs/master_roadmap.md` (MODIFY): Cập nhật trạng thái hoàn tất IMP-10 vào lộ trình tổng thể.
