# BÁO CÁO HOÀN THÀNH CẢI TIẾN: IMP-196
## MINH BẠCH HIỆU LỰC PHIẾU MIỄN TRỪ NGOẠI GIAO & TRIỆT TIÊU ĐỘ LỆCH THỊ GIÁC XÚC XẮC 3D (DIPLOMATIC IMMUNITY EVENT PIPELINE, HAND SYNCHRONIZATION & 3D DICE ISOMETRIC READABILITY ALIGNMENT)

> **Mã cải tiến**: `IMP-196`  
> **Phân loại**: Tier 2 (Full Rigor)  
> **Trạng thái**: ✅ **HOÀN THÀNH (SHIPPED)**  
> **Ngày hoàn thành**: 2026-09-26  

---

### 1. TỔNG QUAN KẾT QUẢ THỰC HIỆN

Vé cải tiến `IMP-196` đã giải quyết dứt điểm 2 lỗi cốt lõi được phản hồi từ trải nghiệm thực tế của người dùng:

1. **Hiệu lực & Phản hồi thị giác của Phiếu Miễn Trừ Ngoại Giao (`CC_DIPLOMATIC`)**:
   - **Đồng bộ toàn phần 5 trạm truyền dẫn (Full-Pipe Vertical Slice)**:
     * `PlayerDelta` interface và mapper `buildDeltaFromRoom` bổ sung trường `hand: p.hand ?? []` (Array Tombstone Protocol). Khi người chơi dùng hết thẻ, server luôn phát mảng rỗng `[]` và `isPlayerEqual` so sánh theo từng phần tử, triệt tiêu hoàn toàn lỗi kẹt icon `🤝` (Zombie Hand Bug).
     * Bổ sung `lastDiplomaticEvent: { playerId, landlordId, cellIndex, savedRent }` đồng bộ xuyên suốt qua 4 vị trí: `DeltaPayload`, `DeltaPayloadOptions`, `buildDeltaFromRoom`, và whitelist `buildSparseDelta`.
   - **Bất biến Định giá Tiền thuê Khả thi Trước khi Tiêu thụ Thẻ (`Pre-Consumption Valuation Invariant`)**:
     * Trong `property_manager.ts`: Giữ nguyên kiểm tra `hasZeroRent` (Gotcha #260) đầu tiên. Sau đó tính `potentialRent = calculateRent(baseRent, ...)`. Tiếp theo mới gọi `tryUseDiplomaticCard`. Nếu thành công, trả về `{ diplomaticCardUsed: true, savedRentAmount: potentialRent }`, miễn 100% tiền thuê và ghi nhận chính xác số tiền tiết kiệm được.
     * Quy tắc phân loại tài sản: Thẻ ngoại giao chỉ áp dụng cho BĐS thông thường C0-C3. Khi dẫm Ga tàu hoặc Tiện ích, thẻ được bảo lưu và câu chuyện giao dịch thông báo rõ: `(Thẻ Ngoại Giao được bảo lưu - Không áp dụng cho Hạ tầng/Tiện ích)`.
   - **Phản hồi Thị giác 2D Tự nhiên**:
     * `PlayerCard`: Bổ sung micro-chip `🤝` (16x16px) đè góc dưới bên phải avatar tròn với tooltip `title="Giữ Thẻ Miễn Trừ Ngoại Giao"`, bảo đảm chiều rộng 160px (`w-40`) trên mobile 360px.
     * `transaction_narrative.ts`: Phân luồng câu văn tự nhiên:
       * Khách thuê: `Bạn kích hoạt Thẻ Ngoại Giao (Miễn 100% tiền thuê [Tên Ô] - Tiết kiệm [X Tr.])`.
       * Chủ đất: `[Tên Khách] dùng Thẻ Ngoại Giao (Miễn thu tiền thuê [Tên Ô] - Hụt thu [X Tr.])`.

2. **Triệt tiêu Nghịch lý Thị giác Xúc xắc 3D 5 + 2 vs Dữ liệu 1 + 5**:
   - **Hiệu chỉnh Góc nghiêng Bias Tilt 3D (`dice_tray.tsx`)**:
     * Phân tích vector quang học từ camera overview tại `[24.6, 25.3, 24.6]` (góc nhìn Isometric $38.6^\circ$ độ cao, $45^\circ$ phương vị từ góc $+X, +Z$).
     * Áp dụng góc nghiêng Euler tĩnh chuẩn xác `rotation={!isRolling ? [0.35, 0, -0.35] : [0, 0, 0]}` lên `<group>` cha chứa 2 viên xúc xắc khi dừng lăn.
     * Kết quả hình học: Mặt trên (+Y) mang giá trị kết quả được ngửa trực diện vào mắt người chơi với $\vec{N}' \cdot \vec{V}_{cam} \approx 0.90$ ($25.8^\circ$), đồng thời dìm mặt đứng (+Z) xuống góc dẹp $73.7^\circ$ ($\cos=0.28$). Triệt tiêu hoàn toàn ảo giác nhìn nhầm mặt 2 chấm thành kết quả gieo.
   - **Huy hiệu Điểm số 2D HUD Callout (`DiceScoreBadge.tsx`)**:
     * Trích xuất component HUD 2D độc lập và mount trực tiếp vào `hud_container.tsx` ngay phía trên ActionDock.
     * Hiển thị điểm số tường minh: `🎲 1 + 5 = 6` và gắn tag `(Đôi! 🎉)` khi tung xúc xắc đôi.
     * Thiết kế tactile chuẩn Antigravity 2.0: nền ngà `#FFFDF8`, viền mực `border-slate-900`, bóng nổi `shadow-[0_3px_0_0_#0f172a]`, `pointer-events-none` an toàn tuyệt đối.

---

### 2. BẢNG KIỂM SOÁT NGÂN SÁCH LOC (TIER AUDIT)

| Tệp mã nguồn | TIER | Giới hạn LOC | Thực tế trên đĩa | Trạng thái |
| :--- | :---: | :---: | :---: | :---: |
| `src/server/session_manager.ts` | TIER 1 | Max 400 LOC | 395 | ✅ Đạt chuẩn (< 400 LOC) |
| `src/server/network/delta_broadcaster.ts` | TIER 1 | Max 235 LOC | 225 | ✅ Đạt chuẩn (< 235 LOC) |
| `src/domain/property_manager.ts` | TIER 1 | Max 155 LOC | 153 | ✅ Đạt chuẩn (< 155 LOC) |
| `src/server/turn_loop.ts` | TIER 1 | Max 290 LOC | 281 | ✅ Đạt chuẩn (< 290 LOC) |
| `src/client/store/game_store_types.ts` | TIER 1 | Max 380 LOC | 369 | ✅ Đạt chuẩn (< 380 LOC) |
| `src/client/network/apply_delta_players.ts` | TIER 1 | Max 270 LOC | 268 | ✅ Đạt chuẩn (< 270 LOC) |
| `src/client/ui/transaction_narrative.ts` | TIER 1 | Max 280 LOC | 255 | ✅ Đạt chuẩn (< 280 LOC) |
| `src/client/network/activity_badge_dispatcher.ts` | TIER 1 | Max 250 LOC | 226 | ✅ Đạt chuẩn (< 250 LOC) |
| `src/client/ui/player_card.tsx` | TIER 2 | Max 240 LOC | 233 | ✅ Đạt chuẩn (< 240 LOC) |
| `src/client/3d/dice_tray.tsx` | TIER 2 | Max 270 LOC | 249 | ✅ Đạt chuẩn (< 270 LOC) |
| `src/client/ui/dice_score_badge.tsx` | TIER 2 | Max 60 LOC | 35 | ✅ Đạt chuẩn (< 60 LOC) |
| `src/client/ui/hud_container.tsx` | TIER 2 | Max 150 LOC | 127 | ✅ Đạt chuẩn (< 150 LOC) |
| `tests/contracts/imp196_diplomatic_card_and_dice_clarity.test.ts` | Test Suite | Max 600 LOC | 513 | ✅ Đạt chuẩn (< 600 LOC) |

---

### 3. BẰNG CHỨNG THẨM ĐỊNH & KIỂM THỬ

- **Contract Tests**: [`tests/contracts/imp196_diplomatic_card_and_dice_clarity.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp196_diplomatic_card_and_dice_clarity.test.ts) ➔ **16/16 PASSED (100%)**.
- **Full Regression Test Suite**: `vitest run tests/contracts/ tests/domain/` ➔ **119 test files passed, 2,715 tests passed, 0 failures**.
- **UI Craft Quality Gate**: `npm run lint:ui` ➔ **Clean! 0 Anti-patterns across 187 files**.
- **Automated Evidence Snapshot**: Ghi nhận tại [`.agents/evidence/imp196_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp196_snapshot.json).
- **Domain Gotchas Invariant**: Đã ghi nhận **Gotcha #279** vào [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md#L3262-L3277).
- **Phán quyết Hội đồng Thẩm định Trạm 3**:
  * `spec-reviewer`: **APPROVED (100% SSOT & Budget Compliance)**
  * `ui-craft-reviewer`: **disposition: ship (PASS - 0 defects)**
  * `game-3d-visual-critic`: **disposition: ship (VERDICT PASS - 8.5/10 Commercial AAA Ready)**
