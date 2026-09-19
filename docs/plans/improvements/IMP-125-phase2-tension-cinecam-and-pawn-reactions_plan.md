# [IMP-125-P2] KẾ HOẠCH TRIỂN KHAI GIAI ĐOẠN 2: MÁY QUAY CĂNG THẲNG TỬ THẦN & QUÂN CỜ BIỂU CẢM ĐỐI KHÁNG

- **Mã Kế Hoạch**: IMP-125-P2
- **Kế Thừa Báo Cáo**: [`IMP-125 Review Report`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/improvements/IMP-125-gameplay-ui-animation-3d-evolution-review_report.md)
- **Kế Thừa Giai Đoạn 1**: [`IMP-125-P1 Report`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/improvements/IMP-125-P1-heatmap-toybox-and-mobile-fixes_report.md)
- **Mục Tiêu**:
  1. *Cải Tiến 3*: Máy Quay Căng Thẳng Ngữ Cảnh Tử Thần (Dynamic Tension Cine-Cam) — Nhận diện nguy cơ phá sản phía trước (cự ly 2 đến 12 ô, phí thuê >= 80% số dư), kích hoạt góc máy Cine-Cam tầm thấp cận cảnh khay xúc xắc và chuỗi xung nhịp tim đập dồn dập trong 1.0 giây xúc xắc lăn (bảo toàn 100% nhịp độ ván đấu).
  2. *Cải Tiến 4*: Hoạt Cảnh Đối Kháng & Xúc Cảm Quân Cờ (Pawn Expressive Interactions) — Khi trả tiền thuê: Quân cờ nhận tiền nhảy xoay 360° (Victory Spin) + bụi vàng; Quân cờ trả tiền nhún bẹp trục Y xuống 0.55 trong 0.25s rồi hồi phục lò xo (Slump Recoil) kèm làn khói xám nhẹ. Toàn bộ thực thi bằng `Procedural Spring Squash & Stretch`, zero skeletal mesh.
- **Ranh Giới Kiến Trúc**:
  - $\Delta \text{Draw Calls} = 0$ (tận dụng pool hạt bụi vàng có sẵn, không sinh thêm mesh).
  - 100% Client-side Presentation & WebAudio Synth, zero FSM mutation, zero WSS payload increase.
  - Áp dụng Quy trình 3 Trạm chuẩn Antigravity.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          IMP-125 PHASE 2 SLICE PIPELINE                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  [High-Stakes Scanner] ──(Phí >= 80% Tiền Mặt)──► [Tension Cine-Cam (1.0s)] │
│                                                └──► [Rapid Heartbeat Synth] │
│                                                                             │
│  [Rent Payment Event]  ──► [Receiver: Victory Spin 360° + Gold Sparkle]     │
│                        └──► [Payer: Slump Recoil Y=0.55 + Procedural Spring]│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. PHÂN TÍCH VẾT VA CHẠM (PRE-FLIGHT BLAST RADIUS AUDIT)

- **Cấp độ rủi ro**: `Slice-Bound` (Giới hạn trong tầng trình diễn Client: Camera, Animation, Audio).
- **Vùng chạm trực tiếp (Direct Touch)**:
  1. `src/client/3d/camera_state_machine.ts`: Bổ sung mode `tension_roll` hoặc flag `isHighStakesRoll` trong `resolveCameraMode` và tính toán góc quay cận cảnh sàn xúc xắc.
  2. `src/client/game_canvas.tsx`: Tích hợp quét nguy cơ tử thần trước khi đổ xúc xắc (`checkHighStakesRoll`).
  3. `src/client/audio/sound_synth_recipes.ts`: Bổ sung công thức tổng hợp nhịp tim `synthesizeHeartbeatPulse` (hai nhịp bùm-bụp 80ms/120ms dồn dập tần số thấp 55Hz - 85Hz).
  4. `src/client/audio/sound_engine.ts`: Thêm method `playHeartbeatPulse()`, `stopHeartbeatPulse()`, `playVictoryChime()`, `playSlumpThud()`.
  5. `src/client/store/vfx_store.ts`: Quản lý danh sách `activePawnReactions: Record<string, { type: 'victory_spin' | 'slump_recoil'; startTime: number; durationMs: number }>` và trigger tương ứng.
  6. `src/client/3d/pawn_animator.tsx`: Cập nhật render loop của quân cờ đứng tĩnh để áp dụng biến dạng lò xo Y=0.55 (Slump) hoặc xoay quanh trục Y 360° (Spin) khi có reaction.
  7. `src/client/offline_landing.ts` / `src/client/network/apply_delta_cells.ts`: Kích hoạt trigger `victory_spin` cho người nhận và `slump_recoil` cho người nộp khi sự kiện trả tiền thuê diễn ra.
- **Tầng tiêu thụ hạ nguồn (Downstream Consumers)**:
  - FSM Server: Giữ nguyên vẹn 100%, không thay đổi luật hay payload.
  - OrbitControls: Tiếp tục tôn trọng tương tác kéo thả tự do của người dùng.
- **Phương án phòng vệ xấu nhất (Worst-Case Defense)**:
  - Nếu âm thanh bị tắt hoặc không có AudioContext: Toàn bộ Cine-Cam và hoạt cảnh quân cờ vẫn diễn ra mượt mà, không throw exception.
  - Nếu frame rate tụt: Các animation dùng delta-time damping đảm bảo không bị giật hay méo hình.

---

## 2. CHI TIẾT CÁC GÓI CÔNG VIỆC THỰC THI

### Gói 1: Thuật Toán Quét Ô Tử Thần & Máy Quay Căng Thẳng (Dynamic Tension Cine-Cam)
- **Hàm quét ngữ cảnh `checkHighStakesRoll`**:
  - Đầu vào: `currentPos`, `playerBalance`, `playersInfo`, `levelMap`.
  - Quét 11 ô phía trước `[(currentPos + 2) % 40 ... (currentPos + 12) % 40]`:
    * Kiểm tra xem ô có thuộc sở hữu của đối thủ không.
    * Tính tiền thuê tại cấp độ hiện tại của ô (`levelMap[cellIndex]`).
    * Nếu tiền thuê $\ge 0.8 \times \text{playerBalance}$ (hoặc `playerBalance <= 0`): Đánh dấu `isHighStakes = true`.
- **Cấu hình Camera `tension_roll` trong `CAMERA_CONFIG`**:
  - `position: [2.0, 2.2, 2.8]`, `target: [0.0, 0.2, 0.0]`, `fov: 34`, `speed: 6.0`.
  - Camera sà thấp cận cảnh sàn diễn xúc xắc trên sông Sài Gòn.
- **Bảo toàn nhịp 100%**:
  - Giữ nguyên thời gian lăn xúc xắc thực tế (1.0s).
  - WebAudio phát nhịp tim dồn dập `SoundEngine.playHeartbeatPulse()` trong 1.0s đó.
  - Khi xúc xắc dừng:
    * Nếu dẫm vào ô tử thần: Kích hoạt `triggerScreenShake(0.32, 350)` kèm âm thanh va đập.
    * Nếu an toàn: Camera bật rộng về `overview` kèm âm chuông nhẹ.

### Gói 2: Bộ Âm Thanh Xúc Giác WebAudio Synth Cho Nhịp Tim & Cảm Xúc
- `synthesizeHeartbeatPulse`: Hai xung tần số thấp 60Hz - 90Hz nhịp nhàng dồn dập (thump-thump) mô phỏng tiếng tim đập nghẹt thở.
- `synthesizeVictoryChime`: Chuỗi hợp âm ngân vang mạ vàng (Arpeggio chuông 523Hz ➔ 659Hz ➔ 784Hz).
- `synthesizeSlumpThud`: Âm va chạm trầm ấm giảm dần tần số (120Hz ➔ 45Hz) thể hiện sự suy sụp nhẹ.

### Gói 3: Hoạt Cảnh Đối Kháng Quân Cờ Lò Xo (Pawn Expressive Interactions)
- Trong `vfx_store.ts`:
  - Thêm state `activePawnReactions: Record<string, { type: 'victory_spin' | 'slump_recoil'; startTime: number; durationMs: number }>`.
  - Action `triggerPawnReaction(playerId: string, type: 'victory_spin' | 'slump_recoil')`.
- Trong `pawn_animator.tsx`:
  - Với quân cờ có reaction:
    * `victory_spin`: Xoay quanh trục Y từ 0 đến $2\pi$ trong 600ms kèm độ cao nhấp nhô nhẹ $y = \sin(\pi \cdot p) \cdot 0.35$.
    * `slump_recoil`: Co giãn trục Y $s_y = 1 - 0.45 \cdot (1 - p)^2 \cdot \cos(4\pi \cdot p)$ (nhún bẹp xuống 0.55 rồi nảy lò xo hồi phục về 1.0 trong 400ms).
- Kích hoạt tại sự kiện trả tiền thuê:
  - Khi quân cờ A dẫm vào ô BĐS của B và nộp tiền:
    * Kích hoạt `triggerPawnReaction(B, 'victory_spin')` + `SoundEngine.playVictoryChime()`.
    * Kích hoạt `triggerPawnReaction(A, 'slump_recoil')` + `SoundEngine.playSlumpThud()`.

---

## 3. MA TRẬN KIỂM THỬ 4 DIỆN (UNIVERSAL 4-FACET BEHAVIORAL MATRIX)

| Facet | Kịch Bản Kiểm Thử | Trách Nhiệm Trạm 1 (`qa-tester`) |
|---|---|---|
| **1. Boundary** | `checkHighStakesRoll` kiểm tra chính xác cự ly 2..12 bước; ngưỡng 80% số dư; kiểm tra khi số dư âm hoặc bằng 0. | Test logic toán học thuần túy với mọi biên tài chính |
| **2. State Reactivity** | Khi `isHighStakesRoll = true`, camera chuyển sang `tension_roll` và WebAudio phát heartbeat; sự kiện trả tiền kích hoạt `victory_spin` và `slump_recoil`. | Test Zustand store reactivity và render properties |
| **3. Resource Disposal** | Heartbeat pulse và các reaction tự động kết thúc và dọn dẹp sạch sau timeout; unmount an toàn không leak timer. | Test lifecycle cleanup và timer pruning |
| **4. Error Defense** | WebAudio context bị block/null không gây crash; người chơi không tồn tại trong reaction không gây lỗi render. | Test guard `try/catch` & fallback an toàn |

---

## 4. KẾ HOẠCH BÀN GIAO & TIẾN ĐỘ

1. Trạm 1 (`qa-tester`): Tạo `tests/client/imp125_phase2_tension_and_pawn_reactions.test.ts` (>= 25 atomic contract tests, chứng minh RED).
2. Trạm 2 (`implementer`): Triển khai mã nguồn trong `src/client/**`, chuyển toàn bộ test sang GREEN 100%, 0 UI anti-patterns.
3. Trạm 3 (`spec-reviewer`): Thẩm định đĩa vật lý, đối soát tam giác Zero Scope Drift.
4. Rebuild Docker container và kiểm tra live.
