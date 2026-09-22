# IMP-157 — Event Card Treasury Conservation & Extra Turn Logic Fix Report

**Ngày hoàn thành**: 2026-09-22
**Kết quả**: ✅ 3 file sửa | Build pass | 5826 tests pass

## Tóm Tắt

Rà soát toàn bộ 36 phiếu sự kiện phát hiện 4 treasury leak (tiền bị trừ player nhưng không vào Kho Bạc) và 1 lỗi tương tác gameplay (extra turn bị skip ăn).

### Fix 1: CC_PLATE_AUCTION (chance_card_handlers.ts:208-212)
- **Trước**: `player.balance -= 500` — tiền bốc hơi
- **Sau**: thêm `room.treasury += 500` + handler nhận `room` param
- **Kèm theo**: `turn_loop.ts:210` — extra turn xóa `skipNextTurn` thay vì bị tiêu hao (Phương án B, user chọn)

### Fix 2: CC_JUNK_STOCK (chance_card_handlers.ts:252-254)
- **Trước**: `player.balance -= 1500` — tiền bốc hơi
- **Sau**: thêm `room.treasury += 1500`

### Fix 3: CC_CONCERT_SPONSOR (chance_card_handlers.ts:272-276)
- **Trước**: `player.balance -= 600` — tiền bốc hơi
- **Sau**: thêm `room.treasury += 600`

### Fix 4: MC_FIRE_INSPECTION (market_card_handlers.ts:183-198)
- **Trước**: `player.balance -= penalty` cho mỗi player — tiền bốc hơi
- **Sau**: tổng hợp `totalPenalty`, `room.treasury += totalPenalty`
- Caller tại L238 cập nhật truyền `room` param

### Fix 5: Extra Turn vs Skip (turn_loop.ts:208-220)
- **Trước**: `extraTurns -= 1` rồi `skipNextTurn` → phase = PropertyManagement (player mất lượt + mất extra turn)
- **Sau**: `extraTurns -= 1` rồi xóa `skipNextTurn` → phase = WaitingRoll (player được chơi, extra turn triệt tiêu skip)

## Các Thẻ Đã Audit PASS (31/36)

Tất cả thẻ còn lại đều treasury-correct hoặc P2P-correct theo spec. Xem danh sách chi tiết trong conversation log.

## Lưu Ý Gameplay (Chưa Fix, Ghi Nhận)

| Thẻ | Vấn đề | Mức |
|---|---|---|
| `CC_CONTRACT_PENALTY` | 1 player → -1000 không ai nhận | 🟡 Edge |
| `CC_FRANCHISE` | Đối thủ balance < 800 → âm không kiểm tra | 🟡 Gameplay |
| `CC_STOCK_PROFIT` | +2500 từ hư không (không trừ treasury) | 🟡 Design |
| `MC_MEGA_CONCERT` | Di chuyển tất cả nhưng không check GO | 🟡 Gameplay |
