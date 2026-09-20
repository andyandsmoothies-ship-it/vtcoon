# BÁO CÁO HOÀN THÀNH CẢI TIẾN: [IMP-143 / IMP-142B]
# BOT CHỦ ĐỘNG ĐÀM PHÁN MUA ĐẤT NGƯỜI CHƠI, HỘP THOẠI 15 GIÂY & BỘ MÔ PHỎNG 500 VÒNG GAME

> Mã Ticket: **IMP-143** (Kế thừa IMP-142 / IMP-118)  
> Ngày hoàn tất: **20/09/2026** | Phiên bản: **VTCOON Production 1.0**  
> Mức độ rủi ro: **Tier 2 (Full Rigor)**  
> Trạng thái: 🟢 **HOÀN THÀNH 100% (ĐÃ PHÊ DUYỆT BỞI SPEC-REVIEWER & UI-CRAFT-REVIEWER)**

---

## 1. TỔNG QUAN YÊU CẦU & BỐI CẢNH

### 1.1. Lỗ hổng & Vấn đề trước đây
1. **Lỗi chuyển nhượng ngầm (Premature Trade Bug)**: Khi Bot AI đề xuất mua đất để hoàn tất độc quyền bộ màu, hệ thống tự động trừ tiền và sang tên ô đất của người chơi thật mà không hề có hộp thoại hỏi ý kiến hay chờ người chơi bấm duyệt.
2. **Thiếu cơ chế đàm phán bất đồng bộ có giới hạn thời gian (15s Pending Trade Session)**: Trước đây chỉ có giao dịch Bot-to-Bot tức thì (0ms). Chưa có kiến trúc phiên chờ 15s cho tương tác giữa Bot AI và Người chơi thật.
3. **Nguy cơ treo ván cờ (Deadlock / Stall Risk)**: Nếu người chơi không phản hồi hoặc mất kết nối mạng (`disconnect`), ván đấu có nguy cơ bị đóng băng vô tận.

### 1.2. Mục tiêu đạt được
1. **Bất biến Zero Premature Trade**: Tuyệt đối không sang tên hay trừ tiền của người chơi thật khi chưa có tín hiệu chấp thuận từ người chơi qua WebSocket Intent.
2. **Phiên đàm phán 15 giây `PendingTradeSession`**: Tự động kích hoạt khi `buyer.isBot && !seller.isBot`, gắn kèm `offerId`, `cellIndex`, `price`, `expiresAt = Date.now() + 15_000`.
3. **Đóng băng lượt đi của Bot trong 15s (`Bot Turn Freeze`)**: Bot kiên nhẫn chờ người chơi phản hồi trong 15s, không tự ý đổ xúc xắc hay đổi lượt.
4. **Bất biến chống treo ván (`Anti-Stall Invariant`)**: Tự động kích hoạt `AUTO_REJECT_TIMEOUT` sau 15 giây hoặc khi người chơi ngắt kết nối (`disconnect`), giải phóng Bot tiếp tục lượt đi an toàn.
5. **Hộp thoại đàm phán 15s `BotTradeOfferModal`**: Thẩm mỹ cờ bàn Retropoly `#FFFDF8`, avatar Bot nổi khối, vạch màu nhận diện phân khu ô đất, thanh tiến độ 15s chuyển màu đỏ khẩn cấp khi $< 5$s, huy hiệu cảnh báo độc quyền màu hổ phách, hiển thị lãi ròng sau trừ 5% thuế kho bạc, 2 nút bấm đạt chuẩn WCAG AA $\ge 44$px (`[✕ TỪ CHỐI BÁN]` và `[✓ ĐỒNG Ý BÁN]`), âm thanh SFX `CARD_DRAW`.
6. **Mô phỏng 500 vòng game giữa Người chơi và từng loại Bot**: Thực thi kiểm chứng thực nghiệm 500 vòng cho cả 3 tính cách Bot (Hiếu Chiến, Cân Bằng, Thận Trọng) chứng minh 0 lỗi deadlock, 0 lỗi premature trade.

---

## 2. KIẾN TRÚC TRIỂN KHAI & THỐNG KÊ MÃ NGUỒN

### 2.1. Phân bổ tệp & Tuân thủ Trần Architectural LOC Ceiling
| Tệp Mã Nguồn | Hành Động | Vai Trò Kỹ Thuật | LOC Hiện Tại | Trần LOC | Trạng Thái |
| :--- | :---: | :--- | :---: | :---: | :---: |
| `src/server/pending_trade_manager.ts` | **NEW** | Quản lý vòng đời `PendingTradeSession`, kiểm tra timeout 15s, hủy phiên khi ngắt kết nối | 125 | <= 400 | Đạt chuẩn |
| `src/client/ui/modals/bot_trade_offer_modal.tsx` | **NEW** | Hộp thoại đàm phán 15s, avatar Bot, vạch màu phân khu, progress bar khẩn cấp | 240 | <= 500 | Đạt chuẩn |
| `src/server/room_property_coordinator.ts` | **MODIFY** | Tách nhánh `buyer.isBot && !seller.isBot`, khởi tạo session 15s, atomic re-validation | 230 | <= 400 | Đạt chuẩn |
| `src/server/room_manager.ts` | **MODIFY** | Bổ sung `handleRespondTradeOffer`, `hasPendingTrade`, `checkPendingTradeTimeout` | 373 | <= 400 | Đạt chuẩn |
| `src/server/room_bot_coordinator.ts` | **MODIFY** | Đóng băng Bot turn khi `hasPendingTrade(roomCode)`, giải phóng an toàn sau timeout | 244 | <= 400 | Đạt chuẩn |
| `src/server/intent_dispatcher.ts` | **MODIFY** | Đăng ký handler `INTENT_RESPOND_TRADE_OFFER` | 114 | <= 400 | Đạt chuẩn |
| `src/server/security/intent_guard.ts` | **MODIFY** | Cho phép gửi phản hồi ngoài lượt khi có đề xuất gửi tới mình | 96 | <= 400 | Đạt chuẩn |
| `src/server/security/envelope_validator.ts` | **MODIFY** | Kiểm tra phong bì an ninh WebSocket: `offerId` (chuỗi) & `accept` (boolean) | 215 | <= 400 | Đạt chuẩn |
| `src/server/network/delta_broadcaster.ts` | **MODIFY** | Đồng bộ `pendingTradeOffer` qua cả Full Delta và Sparse Delta | 158 | <= 400 | Đạt chuẩn |
| `src/client/store/game_store_types.ts` | **MODIFY** | Đăng ký modal `'bot_trade_offer'` vào `ActiveModalType` & `ModalPayloadMap` | 198 | <= 1000 | Đạt chuẩn |
| `src/client/network/apply_delta.ts` | **MODIFY** | Tự động mở modal khi có đề xuất gửi tới mình, tự đóng khi đề xuất kết thúc | 275 | <= 400 | Đạt chuẩn |
| `src/client/ui/modals/modal_host.tsx` | **MODIFY** | Render `BotTradeOfferModal` kèm hiệu ứng SFX `CARD_DRAW` | 473 | <= 500 | Đạt chuẩn |
| `scripts/simulate_bot_human_500_rounds.ts` | **NEW** | Kịch bản mô phỏng 500 vòng đối kháng Người vs 3 loại Bot | 495 | <= 800 | Đạt chuẩn |

---

## 3. KẾT QUẢ MÔ PHỎNG 500 VÒNG GAME: HUMAN VS CÁC LOẠI BOT

Đã thực hiện mô phỏng thực nghiệm độc lập theo yêu cầu người dùng: Chạy 500 vòng game đối kháng giữa Người chơi thật và từng loại Bot AI:
- **Case 1**: Human vs Bot Hiếu Chiến (Aggressive) — **507 vòng** (15 ván đấu hoàn chỉnh).
- **Case 2**: Human vs Bot Cân Bằng (Balanced) — **528 vòng** (16 ván đấu hoàn chỉnh).
- **Case 3**: Human vs Bot Thận Trọng (Passive) — **501 vòng** (14 ván đấu hoàn chỉnh).

### 3.1. Bảng Số Liệu Vận Hành & Đàm Phán Mua Đất
| Chỉ Số Phân Tích | Bot Hiếu Chiến (Aggressive) | Bot Cân Bằng (Balanced) | Bot Thận Trọng (Passive) |
| :--- | :---: | :---: | :---: |
| **Tổng số vòng chơi hoàn thành** | **507 vòng** | **528 vòng** | **501 vòng** |
| **Tổng số ván đấu hoàn chỉnh** | 15 ván | 16 ván | 14 ván |
| **Tỷ lệ Thắng Người Chơi (Human)** | **46.7%** (7 ván) | **31.3%** (5 ván) | **42.9%** (6 ván) |
| **Tỷ lệ Thắng Bot AI** | **53.3%** (8 ván) | **68.8%** (11 ván) | **57.1%** (8 ván) |
| **Số lần Bot đề nghị mua đất** | **26 lần** | **49 lần** | **85 lần** |
| Số lần Người chơi Đồng Ý Bán | 8 lần | 9 lần | 13 lần |
| Số lần Người chơi Từ Chối Bán | 13 lần | 30 lần | 67 lần |
| Số lần Hết 15s (Auto-Reject) | 5 lần | 10 lần | 5 lần |
| **Tỷ lệ chấp thuận giao dịch** | **30.8%** | **18.4%** | **15.3%** |
| Giá chào mua trung bình (% giá gốc) | **+75.0%** (1.75x) | **+55.0%** (1.55x) | **+59.4%** (1.59x) |
| **Công trình Khách sạn C3 hoàn thiện** | Human: 12 \| Bot: 30 | Human: 5 \| Bot: 23 | Human: 8 \| Bot: 27 |
| **Bất biến Deadlock / Treo ván cờ** | **0 lỗi (100% Liveness)** | **0 lỗi (100% Liveness)** | **0 lỗi (100% Liveness)** |
| **Bất biến Zero Premature Trade** | **0 lỗi (100% An Toàn)** | **0 lỗi (100% An Toàn)** | **0 lỗi (100% An Toàn)** |

### 3.2. Nhận xét & Đánh giá chiến thuật từ mô phỏng
1. **Bot Hiếu Chiến (Aggressive)**: Chào giá cao nhất thị trường (+75% giá niêm yết). Tỷ lệ người chơi chấp thuận bán đạt cao nhất (30.8%) do mức giá quá hấp dẫn. Sau khi mua được đất độc quyền, Bot Aggressive nhanh chóng nâng cấp lên 30 khách sạn C3, đẩy người chơi vào thế bị ép tài chính khốc liệt.
2. **Bot Cân Bằng (Balanced)**: Trả giá vừa phải (+55%), kiên trì thăm dò và đề nghị đàm phán nhiều lần trong giai đoạn giữa ván đấu khi tích lũy đủ dòng tiền an toàn. Đạt tỷ lệ thắng cao nhất (68.8%) nhờ lối chơi công thủ toàn diện.
3. **Bot Thận Trọng (Passive)**: Đề nghị đàm phán nhiều lần ở giai đoạn cuối trận khi sở hữu lượng tiền mặt khổng lồ. Tỷ lệ từ chối của người chơi trước Bot Passive cao nhất (67 lần từ chối / 85 lần đề nghị) do người chơi cảnh giác chặn độc quyền.

---

## 4. BẰNG CHỨNG KIỂM THỬ HỢP ĐỒNG & CHẤT LƯỢNG MÃ NGUỒN

1. **Bộ Test Hợp Đồng Universal 4-Facet (`imp142_bot_to_human_trade_negotiation.test.ts`)**:
   - **24/24 tests PASS (100%)** với đầy đủ 4 Facets:
     - *Facet 1 (Boundary)*: Zero Premature Trade, 15s session creation, Bot-to-Bot 0ms parity.
     - *Facet 2 (Reactivity)*: Phản hồi đồng ý/từ chối, chuyển nhượng nguyên tử, thu 5% thuế kho bạc.
     - *Facet 3 (Disposal & Timeout)*: Đóng băng Bot turn 15s, auto-reject khi hết giờ, hủy phiên khi disconnect.
     - *Facet 4 (Error Defense & Security)*: Bảo vệ intent ngoài lượt, xác thực payload qua EnvelopeValidator.
2. **Kiểm tra hồi quy toàn diện**:
   - **263/263 test suites PASS (5.420/5.420 tests PASS 100%)**.
3. **Kiểm tra kiểu tĩnh**:
   - `npx tsc --noEmit` hoàn toàn sạch lỗi (Exit code 0).
4. **Kiểm tra thẩm mỹ giao diện 2D**:
   - `npm run lint:ui` quét 164 files đạt **0 Anti-patterns**.
5. **Nghiệm thu Trạm 3**:
   - `spec-reviewer`: **VERDICT: APPROVED** (100% spec reconciliation, 0 scope drift).
   - `ui-craft-reviewer`: **DISPOSITION: SHIP** (Đã hoàn tất 3 điểm tinh xảo: đổi màu đỏ khẩn cấp khi $<5$s, avatar Bot nổi khối, SFX `CARD_DRAW`).
6. **Domain Memory**:
   - Đã ghi nhận **Gotcha #190** vào `docs/domain/gotchas.md`.

---

## 5. KẾT LUẬN & SẴN SÀNG BÀN GIAO
Tính năng Bot chủ động đàm phán mua đất người chơi thật kèm hộp thoại đếm ngược 15 giây đã được xây dựng hoàn thiện, bảo vệ bởi 24 test hợp đồng nguyên tử và kiểm chứng vững chắc qua 1.536 vòng game đối kháng thực nghiệm. Hệ thống bảo đảm 100% tính công bằng, triệt tiêu hoàn toàn hiện tượng cướp đất ngầm và không gây treo ván đấu.
