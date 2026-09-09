# VTCoOn — Master Product Roadmap (Bản Đồ Lộ Trình Tổng Thể)

> **Tầm nhìn:** Trò chơi bàn cờ tỷ phú 3D "Đại Gia Địa Ốc Việt Nam" chuẩn hóa FSM, rendering React Three Fiber và đồng bộ WebSocket thời gian thực.  
> **Phương pháp quản trị:** AI-Native SDLC · Rolling Wave Planning (Lập Kế Hoạch Sóng Cuộn) · Single Source of Truth (SSOT).

---

## 1. NGUYÊN LÝ LẬP KẾ HOẠCH SÓNG CUỘN (ROLLING WAVE PLANNING)

Dự án được phân rã thành **4 Epics chiến lược** từ Day-0 đến ngày ra mắt chính thức (Go-Live). Mức độ chi tiết được làm rõ lũy tiến:
- **Sóng gần (Near-Wave):** Epic đang thi công được bẻ chi tiết đến từng Lát cắt dọc (Vertical Slice), từng Test Contract và từng dòng mã nguồn.
- **Sóng xa (Far-Wave):** Các Epic tiếp theo được định hình rõ ranh giới kiến trúc, mục tiêu nghiệp vụ và chuẩn nghiệm thu (DoD) ngay từ đầu; khi con sóng tiến tới mới bẻ nhỏ thành Slices.

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                      VTCoOn MASTER ROADMAP (DAY-0 ➔ GO-LIVE)                      │
└────────────────────────────────────────┬──────────────────────────────────────────┘
                                         │
 ┌───────────────────────────────────────┴─────────────────────────────────────────┐
 │ GIAI ĐOẠN 1: EPIC GAMEPLAY CORE ENGINE (Bộ Não & FSM Nghiệp Vụ)                 │
 │ • Sổ cái: docs/epics/gameplay/_epic_ledger.md                                   │
 │ • Tiến độ: Slice S00 ➔ Slice S06 (ĐÃ XONG · 433/433 Tests PASS · Adversarial)   │
 │ • Mục tiêu: 58/58 Use Cases, FSM Server-authoritative, kinh tế, Bot AI, i18n.  │
 └───────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ (Sau khi đóng mốc S06 Sign-off)
 ┌───────────────────────────────────────┴─────────────────────────────────────────┐
 │ GIAI ĐOẠN 2: EPIC 3D VISUAL & DOM UI/UX OVERLAY (Giao Diện & Sa Bàn)            │
 │ • Sổ cái: docs/epics/client_ui/_epic_ledger.md (ĐÃ XONG · 535/535 Tests PASS)   │
 │ • Căn cứ: ADR-0002 (R3F Billboard) & docs/domain/design.md                     │
 │ • Mục tiêu: Sa bàn 3D 40 ô, Standee 2.5D, Xúc xắc vật lý, HUD tài chính, Modals.│
 └───────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
 ┌───────────────────────────────────────┴─────────────────────────────────────────┐
 │ GIAI ĐOẠN 3: EPIC REALTIME GATEWAY & SẢNH CHỜ (Kết Nối & Đa Người Chơi)        │
 │ • Sổ cái: docs/epics/networking/_epic_ledger.md (ĐÃ XONG · 589/589 Tests PASS)  │
 │ • Căn cứ: Package 1 use_cases.puml (UC-GAME-001 ➔ UC-GAME-010)                 │
 │ • Mục tiêu: Server WSS thật, tạo phòng 6 ký tự, quét mã QR, Reconnect Token 60s. │
 └───────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
 ┌───────────────────────────────────────┴─────────────────────────────────────────┐
 │ GIAI ĐOẠN 4: EPIC PRODUCTION HARDENING & GO-LIVE (Bảo Mật & Ra Mắt Thị Trường) │
 │ • Sổ cái: docs/epics/operations/_epic_ledger.md (ĐÃ XONG · 636/636 Tests PASS)  │
 │ • Căn cứ: GEMINI.md Baseline NFRs                                               │
 │ • Mục tiêu: Stress test 100 phòng, tối ưu 60 FPS mobile, Dockerize, Domain SSL.  │
 └─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. MA TRẬN 4 EPICS TỪ DAY-0 ĐẾN GO-LIVE

| Giai đoạn | Epic | Trạng thái | Ranh giới Kiến trúc & Artifacts tham chiếu | Tiêu chí Hoàn thành (DoD) |
|---|---|:---:|---|---|
| **Phase 1** | **Gameplay Core Engine** | 🟢 **Hoàn tất (Đã Sign-off)** | • `docs/epics/gameplay/_epic_ledger.md`<br>• `docs/requirements.md`<br>• `docs/domain/entity_model.md`<br>• `docs/domain/adr/ADR-0001-fsm-architecture.md` | • 58/58 Use Cases hoàn tất 100%<br>• Zero Bug-Codification (Adversarial Inversion)<br>• FSM bảo toàn tiền tệ tuyệt đối<br>• Bot AI 3 tính cách tự hành |
| **Phase 2** | **3D Visual & DOM UI/UX** | 🟢 **Hoàn tất (Đã Sign-off)** | • `docs/epics/client_ui/_epic_ledger.md`<br>• `docs/domain/adr/ADR-0002-r3f-rendering.md`<br>• `docs/domain/design.md`<br>• `src/client/game_canvas.tsx`<br>• Asset 3D Billboard & Standee | • Render sa bàn 40 ô chuẩn văn hóa địa phương<br>• Hoạt ảnh quân cờ nhảy lò xo (Spring Pawn)<br>• Xúc xắc 3D rơi vật lý (@react-three/rapier)<br>• HUD tài chính & Modals (Auction, P2P, Event Cards)<br>• Audio engine âm thanh không gian (`howler.js`) |
| **Phase 3** | **Realtime Gateway & Sảnh Chờ** | 🟢 **Hoàn tất (Đã Sign-off)** | • `docs/epics/networking/_epic_ledger.md`<br>• `docs/domain/use_cases.puml` (Pkg 1: UC-001..010)<br>• `src/server/network/wss_server.ts`<br>• WebSocket Server (Port 3001) | • API tạo phòng cấp mã 6 ký tự, quét mã QR rủ bạn<br>• Kết nối WSS thật với Heartbeat 5s<br>• Gói tin delta tick < 10KB qua đường truyền mạng<br>• Khôi phục phiên qua LocalStorage Token khi F5<br>• Ân hạn mất mạng 60s trước khi Bot tiếp quản |
| **Phase 4** | **Production & Go-Live** | 🟢 **Hoàn tất (Đã Sign-off)** | • `docs/epics/operations/_epic_ledger.md`<br>• `GEMINI.md` (Project NFR Baseline)<br>• Dockerfile, CI/CD Pipeline<br>• Cloud Hosting (VPS/AWS/GCP/Vercel) | • Đạt mượt mà 60 FPS trên thiết bị di động tầm trung<br>• Chịu tải đồng thời 50–100 phòng chơi không leak RAM<br>• Anti-cheat: Chặn hoàn toàn intent ngoài lượt<br>• Cấu hình Domain HTTPS/WSS và vận hành thương mại |

---

## 3. QUY TRÌNH CHUYỂN GIAO GIỮA CÁC EPICS

1. **Không mở Epic mới khi Epic cũ chưa Sign-off:** Epic hiện tại phải đạt 100% tiêu chí nghiệm thu (Milestone Deep Audit) trước khi kích hoạt Epic tiếp theo.
2. **Kế thừa trạng thái:** Epic sau kế thừa toàn bộ cấu trúc dữ liệu và test suite của Epic trước, cam kết Zero Regression.
3. **Phân quyền Sổ Cái:** Mỗi Epic khi mở sẽ sở hữu một `_epic_ledger.md` độc lập trong thư mục con tương ứng (`docs/epics/[epic]/_epic_ledger.md`).
