# IMP-157 — Event Card Treasury Conservation & Extra Turn Logic Fix

**Ngày lập**: 2026-09-22
**Trụ cột**: Gameplay Integrity, Treasury Conservation Invariant

## Phạm Vi

Rà soát toàn bộ 36 phiếu sự kiện (20 Cơ Hội + 16 Thị Trường) đối chiếu handler code vs metadata spec, phát hiện 5 bug:

### Bug đã fix (5/5)

| # | Thẻ | Loại | Vấn đề |
|---|---|---|---|
| B1 | `CC_PLATE_AUCTION` | 🔴 Treasury leak | -500 không vào treasury + extraTurn bị skipNextTurn ăn |
| B2 | `CC_JUNK_STOCK` | 🔴 Treasury leak | -1500 không vào treasury |
| B3 | `CC_CONCERT_SPONSOR` | 🔴 Treasury leak | -600 không vào treasury |
| B4 | `MC_FIRE_INSPECTION` | 🔴 Treasury leak | Phạt C1/C2/C3 không vào treasury |
| B5 | `extraTurns` vs `skipNextTurn` | 🔴 Gameplay | Extra turn bị tiêu hao bởi skip thay vì triệt tiêu skip |

## Files Thay Đổi

| File | Thay đổi |
|---|---|
| `src/domain/chance_card_handlers.ts` | B1: treasury += 500, B2: treasury += 1500, B3: treasury += 600 |
| `src/domain/market_card_handlers.ts` | B4: treasury += totalPenalty, truyền room param |
| `src/server/turn_loop.ts` | B5: extra turn xóa skipNextTurn, player được tung xúc xắc |

## Xác Minh

- `npx tsc --noEmit` → exit 0
- `npx vitest run` → 5826 passed, 0 failed
