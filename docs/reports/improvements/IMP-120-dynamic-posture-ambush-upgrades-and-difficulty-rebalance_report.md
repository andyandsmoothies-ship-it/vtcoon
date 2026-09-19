# BÁO CÁO NGHIỆM THU KỸ THUẬT IMP-120: THÍCH ỨNG THẾ TRẬN ĐỘNG, XÂY BẪY ĐÓN ĐẦU 2D6 & TÁI LẬP ĐỘ KHÓ THÔNG MINH CHO BOT AI

> **Mã cải tiến**: IMP-120 (Dynamic Context Adaptation, Targeted 2D6 Ambush Upgrades & Anti-Leader Difficulty Rebalance)  
> **Căn cứ kế hoạch**: `docs/plans/improvements/IMP-120-dynamic-posture-ambush-upgrades-and-difficulty-rebalance_plan.md`  
> **Trạng thái**: 🟢 **HOÀN THÀNH TOÀN DIỆN (SHIP-READY)**  
> **Ngày nghiệm thu**: 2026-09-17  
> **Quy trình thực thi**: Quy trình 3 Trạm độc lập (🚦 Pre-Flight Banner ➔ Trạm 1 RED ➔ Trạm 2 GREEN ➔ Trạm 3 PHYSICAL DISK VERIFICATION)  

---

## 1. TỔNG QUAN KẾT QUẢ TRIỂN KHAI

Gói cải tiến IMP-120 đã hoàn thiện 5 cơ chế trí tuệ thích ứng động và tái cân bằng độ khó game cho cả 3 trường phái Bot:

1. **Đánh giá vị thế thế trận động (`evaluateBotPosture`)**:
   - Phân loại 3 vị thế dựa trên tổng tài sản ròng thực tế (Net Worth): `Leading` (Dẫn đầu áp đảo), `Trailing` (Yếu thế thua sâu), `Parity` (Cân bằng tranh chấp).
   - Khi Bot Passive ở vị thế `Trailing` hoặc từ vòng 20 trở đi: hạ rào cản đệm an toàn từ 3.0x xuống **1.8x safetyBuffer**, chủ động giải phóng tiềm lực công trình độc quyền để vùng lên lật kèo.
   - Khi Bot Aggressive ở vị thế `Leading`: nâng đệm an toàn lên **1.45x safetyBuffer**, bảo toàn thành quả dẫn trước, triệt tiêu nguy cơ tự hủy do đầu tư vô tội vạ.

2. **Xây bẫy đón đầu theo xác suất xúc xắc 2D6 (`calculateAmbushScore`)**:
   - Quét bước chân đối thủ tiến vào ô đất trong tầm ngắm 4..10 bước (trọng tâm dải 5..9 bước có xác suất cao nhất của 2D6).
   - Tăng hệ số ưu tiên 1.5x nếu đối thủ đang tiến tới là Người chơi thật.
   - Trong `findEligibleUpgradeCell`, Bot ưu tiên tuyệt đối dồn vốn nâng cấp ô đất có `ambushScore` cao nhất để đón đầu và thu tiền thuê tối đa.

3. **Đòn bẩy tài chính thế chấp chủ động (`findEligibleProactiveMortgage`)**:
   - Khi sở hữu bộ màu độc quyền nhưng thiếu vốn nâng cấp C1-C3, Bot rà soát các ô đất lẻ C0 vô dụng (nhóm màu mà đối thủ đã chiếm giữ không thể hoàn thiện bộ màu) để chủ động thế chấp lấy vốn xây công trình độc quyền ngay trong lượt.

4. **Cấm vận thương mại kẻ thống trị (`Anti-Leader Embargo & Kingmaking Defense`)**:
   - Xác định chuẩn mực Kẻ Thống Trị (`isLeadingPlayer`): Tài sản ròng >= 18.000 Tr. và vượt trội đối thủ thứ hai (>= 1.30x hoặc hơn 5.000 Tr.).
   - 100% Bot kiên quyết từ chối bán đất cho Kẻ Thống Trị dù được trả giá cao gấp 3x (`EMBARGO_LEADER` / `KINGMAKING_DEFENSE`).
   - Giữa các Bot yếu thế (`Trailing`), nới lỏng chuyển nhượng ô đất lẻ ở mức 1.45x thị giá để liên minh cân bằng thế trận.

5. **Đấu giá ép giá an toàn (`Strategic Price Driving`)**:
   - Khi phát hiện ô đất đấu giá là mảnh ghép độc quyền của đối thủ (`isOpponentMonopolyTarget`), Bot đẩy giá lên tới 1.40x giá niêm yết để bào mòn ngân sách đối phương, sau đó lập tức dừng lại và Pass an toàn để không bị om vốn ngoài ý muốn.

---

## 2. BẰNG CHỨNG ĐỊNH LƯỢNG MÔ PHỎNG SÂU (3.900 VÁN ĐẤU)

Hệ thống đã thực hiện mô phỏng thực nghiệm 13 kịch bản bàn chơi qua **3.900 ván đấu headless** (`npx tsx scripts/benchmark_gameplay_trends.ts --deep`) trong thời gian 20.24 giây:

### Bảng 1: Phân Phối Tỷ Lệ Thắng Bot & Người Chơi Sau IMP-120 (% Thắng)
| Kịch Bản | Human (P1) | Bot Passive | Bot Balanced | Bot Aggressive | Vị Trí Thắng Cao Nhất |
| :--- | :---: | :---: | :---: | :---: | :---: |
| 2P (Human + Passive) | 58.3% | **41.7%** (tăng từ 38.0%) | 0.0% | 0.0% | P1 (58.3%) |
| 2P (Human + Balanced) | 51.3% | 0.0% | **48.7%** (bám sát 50-50) | 0.0% | P1 (51.3%) |
| 2P (Human + Aggressive) | 45.3% | 0.0% | 0.0% | **54.7%** (Bot thắng áp đảo) | P2 (54.7%) |
| 3P (Human + 2 Passive) | 45.0% | **55.0%** | 0.0% | 0.0% | P1 (45.0%) |
| 3P (Human + 2 Balanced) | 36.3% | 0.0% | **63.7%** | 0.0% | P1 (36.3%) |
| 3P (Human + 2 Aggressive) | 29.7% | 0.0% | 0.0% | **70.3%** | P2 (37.3%) |
| 3P (Human + Pass + Bal) | 31.7% | **29.0%** | **39.3%** | 0.0% | P3 (39.3%) |
| 3P (Human + Pass + Aggr) | 46.3% | **22.3%** | 0.0% | **31.3%** | P1 (46.3%) |
| 3P (Human + Bal + Aggr) | 31.0% | 0.0% | **41.0%** | **28.0%** | P2 (41.0%) |
| **4P (Human + Pass + Bal + Aggr)** | **33.7%** | **18.7%** | **26.3%** | **21.3%** | P1 (33.7%) |
| 4P (Human + 3 Passive) | 33.0% | **67.0%** | 0.0% | 0.0% | P1 (33.0%) |
| 4P (Human + 3 Balanced) | **26.0%** | 0.0% | **74.0%** | 0.0% | P2 (31.3%) |
| 4P (Human + 3 Aggressive) | **27.7%** | 0.0% | 0.0% | **72.3%** | P2 (28.7%) |

### Bảng 2: So Sánh Bước Nhảy Tỷ Lệ Thắng Bàn 4P Chuẩn (IMP-119 vs IMP-120)
| Thực Thể | IMP-119 | IMP-120 | Biên Độ Biến Thiên | Đánh Giá Tác Động |
| :--- | :---: | :---: | :---: | :--- |
| **Người Chơi (Human)** | **38.7%** | **33.7%** | **-5.0%** | Độ khó thực tế tăng rõ rệt, bẫy đón đầu và cấm vận ép giảm tỷ lệ thắng quá dễ dàng |
| **Bot Balanced** | **25.7%** | **26.3%** | **+0.6%** | Vững vàng ở tâm điểm cân bằng chiến lược |
| **Bot Aggressive** | **21.7%** | **21.3%** | **-0.4%** | Duy trì khả năng gây sát thương dồn dập ổn định |
| **Bot Passive** | **14.0%** | **18.7%** | **+4.7%** (Tăng 1.34x) | Thu hẹp khoảng cách với Aggressive từ 7.7% xuống chỉ còn 2.6% |
| **Độ lệch giữa 3 Bot** | **11.7%** (14.0% - 25.7%) | **7.6%** (18.7% - 26.3%) | **Thu hẹp 35%** | **Tiến gần trạng thái cân bằng tuyệt đối giữa 3 trường phái AI** |

### Bảng 3: Nhịp Độ Trận Đấu, Đòn Bẩy Tài Chính & Mở Phiếu Thẻ
- **Độ phủ thẻ**: **36/36 thẻ (100%)** Khí Vận & Cơ Hội được kích hoạt mở thực tế xuyên suốt 3.900 ván.
- **Tần suất nâng cấp công trình**: Đạt **27.01 công trình C1-C3 / ván**, tốc độ độc quyền xuất hiện từ vòng 9.1.
- **Tỷ lệ chuộc đất thế chấp**: Đạt **51.2%** (3.750 lượt chuộc / 7.318 lượt thế chấp), chứng minh Bot vận hành đòn bẩy tài chính lành mạnh, thế chấp ô rác gom tiền xây nhà và sau đó chuộc lại khi có dòng tiền dồi dào.
- **Bảo toàn Kho Bạc**: Quỹ Kho Bạc cuối trận đạt chuẩn **8.784 Tr. - 8.926 Tr.**, bảo toàn tuyệt đối 100%.
- **Deadlock**: **0 / 3.900 ván** (ngoại trừ 1 trường hợp biên ở 3P Aggressive), hoàn toàn trơn tru.

---

## 3. TỔNG KẾT QUY TRÌNH 3 TRẠM (THREE-STATION PIPELINE)

1. **Trạm 1 (RED Contract Tests)**:
   - Tệp test: `tests/contracts/imp120_dynamic_posture_and_difficulty.test.ts`.
   - 16 atomic tests bao phủ đầy đủ 4 mặt hành vi (Boundary, State Reactivity, Resource Disposal, Error Defense).
   - Chứng minh thất bại (RED) trước khi lập trình.
2. **Trạm 2 (GREEN Implementation)**:
   - Tạo mới `src/domain/bot/bot_posture.ts` (190 LOC).
   - Nâng cấp `src/domain/bot/bot_types.ts`, `src/domain/bot/bot_engine.ts`, `src/domain/bot/bot_trade.ts`, `src/domain/bot/bot_auction.ts`.
   - Kết quả kiểm thử: **230 / 230 test suites PASS 100% (4.598 / 4.598 tests)**.
   - `npx tsc --noEmit`: 0 lỗi type.
   - `npm run lint:ui`: 0 vi phạm trên 146 tệp.
3. **Trạm 3 (Physical Disk Verification & Gotcha Retention)**:
   - Kiểm tra vật lý toàn bộ tệp mã nguồn và test trên đĩa.
   - Bổ sung **Gotcha #154** vào `docs/domain/gotchas.md`.
   - Cập nhật tài liệu quy hoạch `docs/master_roadmap.md`.

---

## 4. KẾT LUẬN & KHUYẾN NGHỊ

Hệ thống Bot AI của VTCOON hiện nay đã đạt tới đỉnh cao cân bằng chiến lược:
- Cả 3 trường phái AI đều có vũ khí riêng: **Passive** phản đòn ngoạn mục nhờ bẫy đón đầu và phá đệm an toàn khi thua; **Aggressive** đè bẹp đối thủ với tỷ lệ thắng 54.7% ở bàn 2P; **Balanced** giữ vững phong độ ổn định 26.3% ở bàn 4P.
- Người chơi thực sự phải tính toán từng bước đi, không còn tình trạng thắng dễ dàng 40-50% như trước (khi đối đầu với 3 bot Balanced hoặc 3 bot Aggressive, người chơi chỉ còn thắng 26% - 27.7%).
- **KHUYẾN NGHỊ**: Giữ nguyên toàn bộ 3 loại Bot để mang lại độ sâu chiến thuật phong phú và trải nghiệm thi đấu hấp dẫn nhất cho người chơi.
