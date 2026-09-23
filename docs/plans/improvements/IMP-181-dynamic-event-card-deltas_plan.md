# [IMP-181] Dynamic Event Card Delta Synchronization & Comprehensive 36-Card Financial Audit (Plan)

> Ticket: IMP-181  
> Trạng Thái: Đã Tinh Chỉnh Theo Phản Biện Plan-Griller (Ready for Execution)  
> Ngày: 2026-09-23  

---

## 1. Vấn Đề Người Dùng Báo Cáo
Người dùng phản ánh qua tệp nhật ký `VTFTSK`: *"Kiểm tra game này, tôi thấy cộng trừ tiền có vẻ sai"*.
Sau khi được giải thích nguyên nhân do thẻ `CC_LAND_CHANGE` hiển thị phạt -500 Tr. trong khi thực tế được nhận hỗ trợ +600 Tr., người dùng chỉ đạo:
*"Đồng ý. Sau khi update thì kiểm tra lại toàn bộ các thẻ có cái nào dễ gây nhầm lẫn như trên không"*.

---

## 2. Nguyên Nhân Gốc Rễ (Root Cause Analysis)

1. **Khuyết tật gán Metadata tĩnh trước khi thực thi Logic nghiệp vụ (`src/domain/event_card_engine.ts`)**:
   - Trong `drawChanceCard`:
     ```ts
     room.lastEventCard = getChanceCardInfo(card, current.id);
     applyChanceCard(card, current.id, room.players, room.activeModifiers, reg, sm, permanentRentBonus ?? room.permanentRentBonus, room);
     ```
   - `room.lastEventCard` được tạo ra từ `getChanceCardInfo` (lấy `effectDelta` tĩnh từ `CHANCE_CARD_DETAILS`) TRƯỚC KHI `applyChanceCard` chạy.
   - Thẻ `CC_LAND_CHANGE`:
     - Nếu người chơi có ô đất Cấp 0: trả 500 Tr. lệ phí nâng lên C1 (`balance -= 500`).
     - Nếu người chơi **không có ô đất Cấp 0**: nhận 600 Tr. hỗ trợ từ Kho Bạc (`balance += 600`).
   - Nhưng `CHANCE_CARD_DETAILS` gán cứng tĩnh `effectDelta: -500`.
   - Kết quả: Ví tiền HUD của người chơi tăng từ 18.000 lên 18.600 (+600 Tr.), nhưng Sa bàn 3D (`EventCard3D`) in huy hiệu `PHẠT: -500 Tr.`, thông báo Toast bay màu đỏ `FloatingTextType.Penalty` với `-500 Tr.`, và Bảng hoạt động ghi nhận `-500 Tr.`. Chênh lệch 1.100 Tr. giữa số dư ví thực tế và giao diện khiến người chơi khẳng định hệ thống tính sai tiền.

2. **Các thẻ Cơ Hội khác có nhánh tài chính động bị gán cứng hoặc bỏ sót `effectDelta`**:
   - `CC_VENUE_INCIDENT`: Nếu có ô Dịch vụ phạt -1.200 Tr., nếu không có ô Dịch vụ chỉ phạt -600 Tr. Nhưng metadata gán cứng `effectDelta: -1200`. Khi không có ô Dịch vụ, người chơi bị trừ 600 Tr. nhưng thẻ in phạt -1.200 Tr. (chênh lệch 600 Tr.).
   - `CC_SLOW_BUILD`: Nếu có ô C0 phạt -600 Tr., nếu không có ô C0 chỉ phạt -300 Tr. Nhưng metadata gán cứng `effectDelta: -600`. Khi không có C0, bị trừ 300 Tr. nhưng thẻ in phạt -600 Tr. (chênh lệch 300 Tr.).
   - `CC_TAX_AUDIT`: Phạt -500 Tr. x số ô C0. Metadata để `effectDelta` là `undefined`. Nếu người chơi bị phạt -1.000 Tr., thẻ 3D không in số tiền phạt, toast hiện màu xanh (thưởng).
   - `CC_FRANCHISE`: Thu +800 Tr. từ mỗi đối thủ còn sống (+800 đến +2.400 Tr.). Metadata để `undefined`.
   - `CC_MA_FORCE`: Mua lại ô C0 đối thủ (-cost) hoặc nhận hỗ trợ +800 Tr. từ Kho Bạc. Metadata để `undefined`.
   - `CC_LAND_RECLAIM`: Bồi hoàn 150% giá đất C0 (+Math.floor(price * 1.5)) hoặc 0 nếu không có C0. Metadata để `undefined`.
   - `CC_SWAP_PROJECT`: Trợ cấp +1.000 Tr. (nếu đối thủ không có C0) hoặc +800 Tr. (nếu không đủ tiền mua lại). Metadata để `undefined`.

3. **Từ điển thông báo rút gọn (`src/client/ui/event_card_punchy_summaries.ts`) bị sai lệch số liệu nghiêm trọng**:
   - `CC_CONCERT_SPONSOR`: Ghi `'Tài trợ sự kiện âm nhạc +800 Tr.'` trong khi thực tế người chơi **bị trừ 600 Tr.** để nhận x2 xúc xắc lượt sau!
   - `CC_FRANCHISE`: Ghi `'Thu phí nhượng quyền +1.200 Tr.'` trong khi luật là 800 Tr. / đối thủ (tổng +800 đến +2.400 Tr.).
   - `CC_LAND_RECLAIM`: Ghi `'nhận 2.000'` trong khi luật là bồi hoàn 150% giá trị đất.
   - `CC_SLOW_BUILD`: Ghi `'phạt 400 Tr./c.trình'` trong khi luật là phạt 600 Tr. (có C0) hoặc 300 Tr. (không C0).
   - `CC_MEDIA_CRISIS`: Ghi `'phạt 700'` trong khi thực tế bị trừ 800 Tr.
   - `CC_VENUE_INCIDENT`: Ghi `'bồi thường 600 Tr.'` trong khi có thể phạt tới 1.200 Tr.
   - `CC_FREE_CREDIT`: Ghi `'0% lãi suất tại GO'` trong khi thực tế phải trả 400 Tr. lãi khi qua GO.

4. **Các điểm mù được Plan-Griller phát hiện**:
   - `isSpecialNonCurrency` trong `event_card_visuals.ts` chặn toàn bộ dynamic delta của `CC_TAX_AUDIT`, `CC_LAND_RECLAIM`, `CC_SWAP_PROJECT`, `CC_MA_FORCE`.
   - M&A và nâng cấp đất (`CC_MA_FORCE`, `CC_LAND_CHANGE`, `CC_CONCERT_SPONSOR`) bị gán nhãn `PHẠT: -...` màu đỏ phản trực quan.
   - `lastProcessedEventCardKey` trong `activity_tracker.ts` không được reset khi nhận `delta.lastEventCard === null`, gây nuốt thông báo khi xáo lại bài.

---

## 3. Kiến Trúc Giải Pháp Kỹ Thuật Đã Tinh Chỉnh

### 3.1. Authoritative Dynamic Delta Calculation tại Nguồn (`src/domain/event_card_engine.ts`)
Trong hàm `drawChanceCard`:
```ts
const prevBalance = current.balance;
const cardInfo = getChanceCardInfo(card, current.id);
applyChanceCard(card, current.id, room.players, room.activeModifiers, reg, sm, permanentRentBonus ?? room.permanentRentBonus, room);
const actualDelta = current.balance - prevBalance;

const resolvedDelta = actualDelta !== 0
  ? actualDelta
  : (cardInfo.effectDelta !== undefined ? 0 : undefined);

let resolvedDestination = cardInfo.destination;
if (card === ChanceCardId.CC_LAND_CHANGE) {
  resolvedDestination = actualDelta > 0 ? 'Kho Bạc hỗ trợ vào Ngân sách người chơi' : 'Nộp vào Kho Bạc Nhà Nước';
} else if (card === ChanceCardId.CC_MA_FORCE) {
  resolvedDestination = actualDelta > 0 ? 'Kho Bạc hỗ trợ vào Ngân sách người chơi' : 'Thanh toán chuyển nhượng cho đối thủ';
} else if (card === ChanceCardId.CC_SWAP_PROJECT) {
  resolvedDestination = actualDelta > 0 ? 'Kho Bạc hỗ trợ vào Ngân sách người chơi' : cardInfo.destination;
}

room.lastEventCard = {
  ...cardInfo,
  destination: resolvedDestination,
  ...(resolvedDelta !== undefined ? { effectDelta: resolvedDelta } : {}),
};
```

### 3.2. Cập Nhật UI Hero Stat Cho Phép Ghi Đè Dynamic Delta (`src/client/ui/modals/event_card_visuals.ts`)
Hiệu chỉnh `getCardHeroStat` để xử lý các thẻ có số liệu động:
- `CC_LAND_CHANGE`:
  - `effectDelta > 0`: `{ label: 'TRỢ CẤP QUY HOẠCH', value: '+600 Tr.', variant: 'positive' }`
  - `effectDelta < 0`: `{ label: 'CHI PHÍ QUY HOẠCH', value: '-500 Tr.', variant: 'positive' }`
- `CC_TAX_AUDIT`:
  - `effectDelta !== undefined && effectDelta !== 0`: `{ label: 'THANH TRA THUẾ', value: formatDeltaString(effectDelta), variant: 'negative' }`
- `CC_LAND_RECLAIM`:
  - `effectDelta !== undefined && effectDelta > 0`: `{ label: 'TIỀN BỒI HOÀN', value: formatDeltaString(effectDelta), variant: 'positive' }`
- `CC_MA_FORCE`:
  - `effectDelta !== undefined && effectDelta > 0`: `{ label: 'TRỢ CẤP M&A', value: '+800 Tr.', variant: 'positive' }`
  - `effectDelta !== undefined && effectDelta < 0`: `{ label: 'THƯƠNG VỤ M&A', value: formatDeltaString(effectDelta), variant: 'warning' }`
- `CC_SWAP_PROJECT`:
  - `effectDelta !== undefined && effectDelta > 0`: `{ label: 'TRỢ CẤP DỰ ÁN', value: formatDeltaString(effectDelta), variant: 'positive' }`
  - `effectDelta !== undefined && effectDelta < 0`: `{ label: 'QUYỀN MUA LẠI', value: formatDeltaString(effectDelta), variant: 'warning' }`

### 3.3. Khắc Phục Actor Inversion / Nhãn Phạt Phản Trực Quan (`src/client/3d/event_card_texture.ts` & `activity_tracker.ts`)
- Định nghĩa danh sách thẻ giao dịch/đầu tư/nâng cấp:
  `const INVESTMENT_OR_FEE_CARDS = new Set([ChanceCardId.CC_LAND_CHANGE, ChanceCardId.CC_MA_FORCE, ChanceCardId.CC_CONCERT_SPONSOR, ChanceCardId.CC_PLATE_AUCTION, ChanceCardId.CC_SWAP_PROJECT]);`
- Trong `event_card_texture.ts`:
  - Nếu `effectDelta < 0` và thuộc nhóm thẻ đầu tư:
    Render nhãn: `CHI PHÍ: ${formatCurrency(data.effectDelta)}` với khung viền vàng/cyan thanh lịch thay vì `PHẠT:` màu đỏ.
  - Chỉ render `PHẠT: -...` cho các thẻ vi phạm thực sự (`CC_COPYRIGHT`, `CC_VENUE_INCIDENT`, `CC_TAX_AUDIT`, v.v.).
- Trong `activity_tracker.ts`:
  - Các thẻ thuộc nhóm đầu tư/nâng cấp nhận `FloatingTextType.Reward` (hoặc màu vàng/xanh mang tính tích cực) thay vì `FloatingTextType.Penalty` màu đỏ.

### 3.4. Dọn Dẹp Turn N+1 Trong `activity_tracker.ts`
Tại `detectEventCardActivities`:
```ts
if (!delta.lastEventCard) {
  if (delta.lastEventCard === null) {
    lastProcessedEventCardKey = null;
  }
  return [];
}
```
Bảo đảm khi máy chủ phát tombstone `lastEventCard = null` khi chuyển lượt, biến khóa `lastProcessedEventCardKey` được dọn sạch hoàn toàn, sẵn sàng đón nhận thẻ tiếp theo kể cả khi xáo lại bộ bài.

### 3.5. Chuẩn Hóa 100% Từ Điển Thông Báo Rút Gọn (`src/client/ui/event_card_punchy_summaries.ts`)
| Thẻ ID | Nội Dung Cũ (Gây Hiểu Lầm) | Nội Dung Mới Đã Chuẩn Hóa | Số Ký Tự |
| :--- | :--- | :--- | :--- |
| `CC_CONCERT_SPONSOR` | `Tài trợ sự kiện âm nhạc +800 Tr.` (SAI) | `Chi 600 Tr. tài trợ, x2 xúc xắc` | 32 $\le$ 35 |
| `CC_FRANCHISE` | `Thu phí nhượng quyền +1.200 Tr.` (SAI) | `Thu 800 Tr./đối thủ nhượng quyền` | 32 $\le$ 35 |
| `CC_LAND_RECLAIM` | `Thu hồi đất quy hoạch, nhận 2.000` (SAI) | `Thu hồi đất C0 bồi hoàn 150%` | 29 $\le$ 35 |
| `CC_SLOW_BUILD` | `Chậm tiến độ, phạt 400 Tr./c.trình` (SAI) | `Phạt chậm tiến độ 600 Tr. (C0)` | 30 $\le$ 35 |
| `CC_MEDIA_CRISIS` | `Khủng hoảng truyền thông, phạt 700` (SAI) | `Xử lý khủng hoảng, phạt 800 Tr.` | 31 $\le$ 35 |
| `CC_VENUE_INCIDENT` | `Sự cố sân khấu, bồi thường 600 Tr.` | `Sự cố dịch vụ, phạt tới 1.200 Tr.` | 33 $\le$ 35 |
| `CC_FREE_CREDIT` | `Gói tín dụng 0% lãi suất tại GO` (Gây nhầm) | `Giải ngân 2.000 Tr., lãi 400 tại GO` | 35 $\le$ 35 |
| `CC_LAND_CHANGE` | `Nâng thẳng 1 ô C0 lên C1` (Thiếu vế hỗ trợ) | `Nâng C0 lên C1 / Hỗ trợ 600 Tr.` | 31 $\le$ 35 |
| `CC_SWAP_PROJECT` | `Đổi 1 ô đất dự án với đối thủ` (SAI bản chất) | `Mua lại dự án đối thủ đền bù 130%` | 34 $\le$ 35 |
| `MC_PUBLIC_INVEST` | `Nhân đôi cước 4 Ga Tàu` (Thiếu vế thưởng) | `Thưởng 400 Tr. & x2 cước Ga Tàu` | 31 $\le$ 35 |

---

## 4. Kế Hoạch Đánh Giá & Kiểm Thử (Verification Plan)

### Kiểm thử tự động (Station 1 RED Test):
Tạo tệp: `tests/domain/imp181_dynamic_event_card_deltas.test.ts` ($\ge 18$ atomic tests):
- [TC-IMP181.01]: `CC_LAND_CHANGE` khi người chơi không có đất -> `room.lastEventCard.effectDelta === 600`.
- [TC-IMP181.02]: `CC_LAND_CHANGE` khi người chơi có ô C0 -> `room.lastEventCard.effectDelta === -500`.
- [TC-IMP181.03]: `CC_VENUE_INCIDENT` khi không có ô Dịch vụ -> `room.lastEventCard.effectDelta === -600`.
- [TC-IMP181.04]: `CC_VENUE_INCIDENT` khi có ô Dịch vụ -> `room.lastEventCard.effectDelta === -1200`.
- [TC-IMP181.05]: `CC_SLOW_BUILD` khi không có ô C0 -> `room.lastEventCard.effectDelta === -300`.
- [TC-IMP181.06]: `CC_SLOW_BUILD` khi có ô C0 -> `room.lastEventCard.effectDelta === -600`.
- [TC-IMP181.07]: `CC_TAX_AUDIT` khi có 2 ô C0 -> `room.lastEventCard.effectDelta === -1000`.
- [TC-IMP181.08]: `CC_TAX_AUDIT` khi có 0 ô C0 -> `room.lastEventCard.effectDelta === undefined` (giữ nguyên không in phạt giả).
- [TC-IMP181.09]: `CC_FRANCHISE` trên bàn 4 người -> `room.lastEventCard.effectDelta === 2400`.
- [TC-IMP181.10]: `CC_FRANCHISE` trên bàn 2 người -> `room.lastEventCard.effectDelta === 800`.
- [TC-IMP181.11]: `CC_MA_FORCE` fallback trợ cấp -> `room.lastEventCard.effectDelta === 800`.
- [TC-IMP181.12]: `CC_LAND_RECLAIM` bồi hoàn ô đất 1.000 Tr. -> `room.lastEventCard.effectDelta === 1500`.
- [TC-IMP181.13]: `CC_DIPLOMATIC` rút thẻ phi tài chính -> `room.lastEventCard.effectDelta === undefined`.
- [TC-IMP181.14]: `destination` động cho `CC_LAND_CHANGE` ('Kho Bạc hỗ trợ...' vs 'Nộp vào Kho Bạc Nhà Nước').
- [TC-IMP181.15]: Dọn sạch Turn N+1: `delta.lastEventCard === null` reset `lastProcessedEventCardKey`.
- [TC-IMP181.16]: `getCardHeroStat` định dạng dynamic delta cho `CC_LAND_CHANGE`, `CC_TAX_AUDIT`, `CC_LAND_RECLAIM`.
- [TC-IMP181.17]: Nhãn texture 3D hiển thị `CHI PHÍ:` cho `CC_LAND_CHANGE` (-500) và `THƯỞNG:` khi (+600).
- [TC-IMP181.18]: Toàn bộ 36 thẻ trong `PUNCHY_EVENT_SUMMARIES` có độ dài $\le 35$ ký tự và số liệu nhất quán 100%.

Lệnh kiểm thử:
```cmd
cmd /c npx vitest run tests/domain/imp181_dynamic_event_card_deltas.test.ts
cmd /c npm test
```
