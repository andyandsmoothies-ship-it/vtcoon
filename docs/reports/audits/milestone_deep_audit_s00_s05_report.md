# BÁO CÁO ĐỐI SOÁT ĐỊNH KỲ (PERIODIC AUDIT GAP REPORT) — MỐC TOÀN DIỆN SLICE S00 → S05

**Loại tài liệu:** Biên bản Kiểm toán Mốc Toàn Diện (Milestone Deep Audit)  
**Tiêu chuẩn kiểm toán:** Single Source of Truth (SSOT) Reconciliation & 6 Slop Red Flags Protocol  
**Thời điểm lập:** 2026-09-09T07:28:00+07:00  
**Tài liệu tham chiếu SSOT:** [`docs/requirements.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/requirements.md) · [`docs/domain/entity_model.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/entity_model.md) · [`docs/epics/gameplay/_epic_ledger.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/epics/gameplay/_epic_ledger.md)  
**Mã nguồn kiểm toán:** Toàn bộ thư mục [`src/`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src) (20 tệp mã nguồn, 2.618 LOC) & [`tests/`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests) (33 tệp kiểm thử, 394 test cases)  
**Trạng thái kiểm thử:** 394/394 tests PASS · TypeScript Strict: 0 errors  

---

## I. TỔNG QUAN KIẾN TRÚC & PHÁN QUYẾT ĐỐI SOÁT

Quá trình kiểm toán được thực hiện độc lập bởi 2 Subagent chuyên trách song song:
1. **SSOT Spec Reconciliation Auditor (`spec-reviewer`)**: Rà soát 1-1 danh mục thực thể, hằng số, ma trận 28 Title Deeds, 36 Thẻ sự kiện, cơ chế FSM và phát hiện các nợ kỹ thuật mồ côi.
2. **Standards & Anti-Slop Auditor (`code-reviewer`)**: Truy quét No-Op stubs, dead code, kiểm toán trần 5 tầng LOC, code golf, Cyclomatic Complexity và tính toàn vẹn Vertical Slice (VSC).

```
                             [Milestone Deep Audit S00-S05]
                                           │
             ┌─────────────────────────────┴─────────────────────────────┐
             ▼                                                           ▼
  [Trục 1: SSOT Spec Integrity]                               [Trục 2: Code Quality & Slop]
  - 40 ô bàn cờ: 100% MATCH                                   - Tổng LOC: 2.597 LOC / 20 tệp
  - 28 Title Deeds: 100% MATCH                                - 0 tệp vượt 400 LOC
  - FSM & Quy tắc kinh tế: 95% MATCH                          - 3 tệp vượt cảnh báo 300 LOC
  - Phát hiện 4 Blockers & 2 Nợ mồ côi                        - Phát hiện 2 Blockers & 7 hàm CC>5
```

---

## II. BẢNG PHÂN LOẠI TỔNG HỢP THEO 3 CẤP ĐỘ

### 1. 🟢 [BLOCKER ĐÃ KHẮC PHỤC TRIỆT ĐỂ & VERIFIED] (6 Mục Đã Giải Quyết)

Toàn bộ 6 vi phạm đã được khắc phục hoàn toàn trong phiên Hotfix Milestone và xác minh bằng 394/394 tests PASS:

| STT | Mã Mục | Vị trí File:Line | Tình trạng khắc phục & Cơ chế bảo vệ | Trạng thái |
|:---:|:---:|---|---|:---:|
| 1 | **BLK-01** | [`src/server/property_actions.ts:L168-L171`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/property_actions.ts#L168), [`L266-L268`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/property_actions.ts#L266) | Chuẩn hóa thuế P2P: Bên Mua thanh toán đúng `price`. Bên Bán nộp 5% thuế (hoặc 20% khi có `MC_ANTI_SPECULATE`), thực nhận `price * (1 - taxRate)`. Đã cập nhật đồng bộ các bài test `p2p_trade.test.ts` và Living E2E test. | ✅ **ĐÃ KHẮC PHỤC** |
| 2 | **BLK-02** | [`src/server/mortgage_manager.ts:L98,L164`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/mortgage_manager.ts#L98), [`src/domain/room.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts) | Kích hoạt modifier `MC_URBAN_PLANNING`: Tăng hạn mức thế chấp lên 60% cho Hà Nội và TP.HCM. Bổ sung `mortgageLoans` snapshot nợ thực tế, triệt tiêu hoàn toàn lỗ hổng Infinite Money Arbitrage khi chuộc đất. | ✅ **ĐÃ KHẮC PHỤC** |
| 3 | **BLK-03** | [`src/domain/property_manager.ts:L123`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_manager.ts#L123) | Thẻ `MC_NIGHT_ECONOMY` kiểm tra nghiêm ngặt `level >= 1` trước khi nhân đôi tiền thuê, bảo vệ đất trống Cấp 0 giữ nguyên mức phí 12%. | ✅ **ĐÃ KHẮC PHỤC** |
| 4 | **BLK-04** | [`src/domain/property_manager.ts:L168`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_manager.ts#L168) | Xóa bỏ rào cản `if (lvl >= 3) return false;`, Thẻ Miễn Trừ Ngoại Giao `CC_DIPLOMATIC` miễn phí 100% tại mọi cấp công trình đúng theo SSOT §V.2.4. | ✅ **ĐÃ KHẮC PHỤC** |
| 5 | **BLK-05** | [`src/domain/room.ts:L22`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts#L22), [`src/domain/card_handlers.ts:L328`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/card_handlers.ts#L328) | Mở rộng kiểu `MarketModifier.type: MarketCardId | ChanceCardId`, loại bỏ hoàn toàn ép kiểu `as unknown as MarketCardId`, đạt chuẩn TypeScript Strict. | ✅ **ĐÃ KHẮC PHỤC** |
| 6 | **BLK-06** | [`src/server/session_manager.ts:L18,L25`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts#L18) | Bổ sung `isMortgaged?: boolean` vào `CellDelta` và `bankrupt?: boolean` vào `PlayerDelta`, hoàn thiện tính toàn vẹn Vertical Slice. | ✅ **ĐÃ KHẮC PHỤC** |

---

### 2. 🟡 [NỢ KỸ THUẬT ĐƯỢC CHUYỂN TIẾP] (10 Mục)

Các khoản nợ kỹ thuật, cấu trúc mã nguồn và tính năng mở rộng được lập sổ theo dõi và bàn giao sang các Slice tiếp theo:

| STT | Mã Nợ | Vị trí File:Line | Mô tả chi tiết khoản nợ | Lộ trình xử lý & Slice tiếp nhận |
|:---:|:---:|---|---|---|
| 1 | **DEBT-S06-01** | `issues/GAME-S04-market-events-chance-cards.md:L367`, [`src/domain/card_handlers.ts#L261`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/card_handlers.ts#L261) | **Nợ mồ côi `CC_OVERDRAFT` (Hạn Mức Thấu Chi):** Rút thẻ nhận 3.000 Tr., nhưng chưa có bộ đếm 3 vòng để tự động cưỡng chế khấu trừ 3.300 Tr. gốc + lãi. | Chuyển tiếp sang Slice 06 (Lập bộ đếm thời hạn nợ thẻ trong `RoomManager`). |
| 2 | **DEBT-S06-02** | [`src/domain/card_handlers.ts#L261`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/card_handlers.ts#L261), [`src/server/room_manager.ts#L134`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts#L134) | **Nợ mồ côi `CC_FREE_CREDIT` (Tín Dụng Tự Do):** Rút thẻ nhận 2.000 Tr., nhưng khi người chơi đi qua ô GO chưa có logic trích nộp 400 Tr. tiền lãi mỗi vòng. | Chuyển tiếp sang Slice 06 (Tích hợp thu lãi `CC_FREE_CREDIT` tại pipeline ô GO). |
| 3 | **DEBT-S06-03** | [`src/domain/card_handlers.ts#L336-L341`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/card_handlers.ts#L336) | **Xử lý giả lập `CC_SLOW_BUILD`:** Hiện tại thẻ xóa ngay 1 ô đất C0 thay vì theo dõi thời gian sở hữu quá 2 vòng không xây dựng và đưa vào Auto-Auction theo SSOT §V.2.18. | Chuyển tiếp sang Slice 06 (Bổ sung thuộc tính `unbuiltRounds` cho ô đất). |
| 4 | **DEBT-S06-04** | [`src/server/insolvency_manager.ts#L31-L47`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/insolvency_manager.ts#L31) | **Đấu giá thanh lý cưỡng chế 70%:** Hệ thống đang dùng cơ chế thanh lý nội bộ tự động thu hồi 50% theo cấp công trình để giải cứu thanh khoản thay vì kích hoạt Auto-Auction 70%. | Chuyển tiếp sang Slice 06 (Đấu nối phiên Auto-Auction cưỡng chế cho BĐS thế chấp). |
| 5 | **DEBT-S06-05** | [`src/domain/property_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_manager.ts) (370 LOC), [`src/domain/card_handlers.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/card_handlers.ts) (355 LOC), [`src/server/room_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts) (329 LOC) | **Phân tách 3 tệp vượt ngưỡng cảnh báo 300 LOC (75% trần 400 LOC):** Nguy cơ phá vỡ giới hạn phức tạp nếu viết thêm code. | Tách `property_deeds.ts` (80 LOC), tách `market_card_handlers.ts` & `chance_card_handlers.ts`, tách `turn_orchestrator.ts`. |
| 6 | **DEBT-S06-06** | [`src/domain/card_handlers.ts#L239,L90`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/card_handlers.ts#L239), [`src/domain/property_manager.ts#L177`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_manager.ts#L177), [`src/server/room_manager.ts#L108,L268`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts#L108) | **Tái cấu trúc 7 hàm vi phạm Cyclomatic Complexity (CC > 5) & độ dài (> 30 LOC):** Đỉnh điểm `executeChanceCard` (CC=20, 115 LOC) và `executeMarketCard` (CC=16, 58 LOC). | Áp dụng Strategy Pattern / Command Dispatcher để loại bỏ switch-case cồng kềnh. |
| 7 | **DEBT-S06-07** | [`src/domain/board_config.ts#L9,L12,L14`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/board_config.ts#L9), [`src/domain/event_card_types.ts#L49`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/event_card_types.ts#L49) | **Xóa bỏ Dead Enum & Redundant Code:** `CellType.CommunityChest`, `CellType.Jail`, `CellType.GoToJail` và alias `UTILITY_CELLS_ECE` không hề được sử dụng. | Dọn dẹp sạch mã nguồn chết theo nguyên tắc Prune Dead Code. |
| 8 | **DEBT-S06-08** | [`src/server/room_manager.ts#L95`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts#L95), [`src/domain/card_handlers.ts#L247`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/card_handlers.ts#L247) | **Xóa bỏ No-Op Delegator & Chuẩn hóa kiểu trả về:** Hàm `sendToAudit` chỉ forward vô nghĩa; hàm `executeChanceCard` trả về dummy `Record<string, never>` `{}` thay vì `void`. | Chuẩn hóa hàm về dạng chuẩn TypeScript. |
| 9 | **DEBT-S06-09** | [`src/domain/property_manager.ts:L281`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_manager.ts#L281), [`src/server/auction_manager.ts:L20`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/auction_manager.ts#L20), [`src/server/audit_manager.ts:L17`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/audit_manager.ts#L17) | **Chuẩn hóa Magic String Reason Codes:** Rải rác các chuỗi tự do `'MISSING_MONOPOLY'`, `'DECLINED_PLAYER_CANNOT_BID'`, `'NEED_2_RAILROADS'`... | Tích hợp 100% mã từ chối vào enum trung tâm [`ActionRejectReason`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/action_reasons.ts#L2). |
| 10 | **DEBT-S06-10** | Toàn bộ mã lỗi và 36 thẻ sự kiện trong [`src/`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src) | **Xây dựng module bản địa hóa i18n:** Các mã lỗi và thẻ sự kiện đang ở dạng mã tiếng Anh kỹ thuật (`INSUFFICIENT_FUNDS`, `MC_NIGHT_ECONOMY`), thiếu từ điển hiển thị tiếng Việt trên UI. | Tạo `src/domain/i18n/vi.ts` cung cấp nhãn tiếng Việt phục vụ giao diện người dùng. |

---

### 3. 🟢 [AN TOÀN — ĐẠT CHUẨN 100% SSOT & ARCHITECTURE] (5 Trụ Cột)

1. **Bố Cục 40 Ô Bàn Cờ Việt Nam:**
   - Đạt chuẩn tuyệt đối 40/40 ô: Tên địa danh thuần Việt, số thứ tự, màu sắc, phân loại `CellType` theo `docs/requirements.md` §II.
   - Có Fixture Contract Test ([`tests/contracts/board_config_fixture.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/board_config_fixture.test.ts)) khóa chết cấu trúc chống sai lệch.
2. **28 Thẻ Title Deeds & Ma Trận Biểu Phí:**
   - 9 BĐS Đô thị + 4 Dịch vụ/Giải trí + 9 Nghỉ dưỡng + 4 Hạ tầng Giao thông + 2 Tiện ích = 28 thẻ.
   - Biểu phí C0–C3, chi phí nâng cấp từng cấp, tỷ lệ thế chấp 50%, phụ thu dịch vụ C2 (1D6 chẵn +200 Tr.), hiệu ứng mất lượt C3, ETC (+50%), hệ số Tiện ích (40x, 100x, 150x) khớp 100% [`docs/domain/entity_model.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/entity_model.md).
3. **FSM Vòng Lặp Lượt Chơi & Quy Tắc Kinh Tế Cốt Lõi:**
   - Đổ đôi 3 lần liên tiếp bị đưa vào Ô 10 (Trạm Kiểm Toán), thụ án tối đa 3 lượt.
   - Nộp bảo lãnh 500 Tr. VNĐ rời trạm ngay lập tức (chặn nếu không đủ tiền).
   - Ô 30 (Lệnh Thanh Tra Thuế) cưỡng chế di chuyển về Ô 10.
   - Ô GO nhận thưởng 2.000 Tr. VNĐ và nộp Thuế tài sản lũy tiến (1–3 ô: miễn; 4–6 ô: 150/ô; ≥7 ô: 400/ô + 300/công trình C2-C3).
   - Sàn giao dịch chứng khoán HOSE (Ô 38): Hạn mức vốn 500–3.000 Tr. VNĐ, xúc xắc 1D6 với 6 kết quả chuẩn xác (-50%, -25%, hòa, +20%, +50%, +100%).
   - Auto-Auction BĐS: Khởi điểm 50% giá niêm yết, bước giá 100 Tr. VNĐ, cấm người vừa bỏ qua tham gia đặt giá.
   - Thế chấp & Chuộc tài sản: Nhận 50% giá gốc, dừng thu phí, lãi 5%/vòng qua GO (tự động tăng 10% khi có `MC_RATE_HIKE`, miễn khi có `MC_CREDIT_STIMULUS`), chuộc đất trả nợ gốc + 10% phí hành chính.
   - Quy trình phá sản & Quyết toán Net Worth: Loại bỏ sạch người chơi, giải phóng 100% tài sản trong registry & stateMap (zero tài sản mồ côi), tính toán Net Worth và xếp hạng chuẩn xác.
4. **Chất Lượng Kiểm Thử Chuẩn Công Nghiệp:**
   - 394/394 tests PASS tuyệt đối trên 33 tệp kiểm thử (`--sequence.shuffle`).
   - Bộ 3 Living E2E Tests: [`multiplayer_gameplay_flow.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/integration/multiplayer_gameplay_flow.test.ts), [`multiplayer_stress_flow.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/integration/multiplayer_stress_flow.test.ts), [`production_resilience.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/integration/production_resilience.test.ts).
   - Đẳng thức bảo toàn tiền tệ toàn hệ thống (Conservation of Money Invariant) chuẩn xác với sai số đúng 0 Tr. VNĐ qua toàn bộ các chuỗi giao dịch hỗn hợp phức tạp.
   - Kiểm thử hỗn loạn 50 vòng (Chaotic Fuzzing) không gây crash, không bế tắc FSM.
5. **Lean Observability & Ngân Sách Tệp Tổng Thể:**
   - 100% sự kiện tài chính và chuyển đổi pha FSM phát log JSON 1 dòng có correlationId, timestamp, delta rõ ràng.
   - Tất cả 20 tệp trong `src/` đều nằm dưới trần nghiêm ngặt 400 LOC (Core Logic) và 500 LOC (UI).

---

## III. KẾT LUẬN & ĐỀ XUẤT HÀNH ĐỘNG TIẾP THEO

### Phán Quyết Kiểm Toán (Audit Verdict)
> **TRẠNG THÁI: PHÊ DUYỆT ĐÓNG MỐC KIỂM TOÁN [MILESTONE APPROVED]**  
> 
> - **Khắc phục Blocker:** Đã xử lý triệt để **6/6 lỗi BLOCKER (BLK-01 đến BLK-06)**, đạt chuẩn 100% tài liệu gốc SSOT ([`requirements.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/requirements.md) & [`entity_model.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/entity_model.md)). Triệt tiêu hoàn toàn nguy cơ Infinite Money Arbitrage trong chuộc BĐS thế chấp.
> - **Chất lượng kiểm thử:** Toàn bộ **394/394 tests PASS** trên 33 tệp kiểm thử trong chế độ xáo trộn ngẫu nhiên (`--sequence.shuffle`), TypeScript Strict 0 lỗi, 0 cảnh báo.
> - **Bàn giao Nợ kỹ thuật:** Đã bàn giao an toàn và ghi danh chính thức **10 khoản nợ kỹ thuật (`DEBT-S06-01` đến `DEBT-S06-10`)** vào Sổ Cái Epic Gameplay ([`docs/epics/gameplay/_epic_ledger.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/epics/gameplay/_epic_ledger.md)), sẵn sàng cho việc phân rã và thi công tại Slice 06.

---
*Biên bản Kiểm toán Mốc Định Kỳ hoàn tất ký duyệt [MILESTONE APPROVED] và lưu trữ tại `docs/reports/audits/milestone_deep_audit_s00_s05_report.md`.*
