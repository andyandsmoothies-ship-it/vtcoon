# [IMP-181] Báo Cáo Nghiệm Thu: Dynamic Event Card Delta Synchronization & Comprehensive 36-Card Financial Audit

> Ticket: IMP-181  
> Trạng Thái: 🟢 **Hoàn Tất (Đã Nghiệm Thu Trạm 3)**  
> Ngày Hoàn Thành: 2026-09-23  
> Bản Kế Hoạch Tham Chiếu: [`docs/plans/improvements/IMP-181-dynamic-event-card-deltas_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-181-dynamic-event-card-deltas_plan.md)  
> Báo Cáo Thẩm Định Kế Hoạch: [`.agents/audit/PLAN_AUDIT_IMP181.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP181.md)  
> Bằng Chứng Vật Lý Snapshot: [`.agents/evidence/imp181_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp181_snapshot.json)  

---

## 1. Tóm Tắt Vấn Đề Người Dùng Báo Cáo
Người dùng phản ánh qua tệp nhật ký `VTFTSK`: *"Kiểm tra game này, tôi thấy cộng trừ tiền có vẻ sai"*.
Khi kiểm tra nhật ký máy bay: tại Lượt 1, người chơi `p1` (chưa có đất) rút thẻ `CC_LAND_CHANGE` (Chuyển Đổi Mục Đích Đất).
- Máy chủ chạy đúng luật: người chơi không có đất C0 nên được Kho Bạc hỗ trợ 600 Tr. (`p1.balance` tăng từ 18.000 lên 18.600 Tr.).
- Tuy nhiên, sa bàn 3D (`EventCard3D`) in `PHẠT: -500 Tr.`, thông báo Toast màu đỏ bay lên `-500 Tr.`, và Bảng hoạt động ghi nhận nộp phạt `-500 Tr.`.
- Chênh lệch 1.100 Tr. giữa số dư ví HUD thực tế và giao diện khiến người chơi lầm tưởng máy chủ tính sai tiền.
- Người dùng chỉ đạo: *"Đồng ý. Sau khi update thì kiểm tra lại toàn bộ các thẻ có cái nào dễ gây nhầm lẫn như trên không"*.

---

## 2. Kết Quả Rà Soát Toàn Bộ 36 Thẻ Sự Kiện (20 Thẻ Cơ Hội + 16 Thẻ Thị Trường)

### 2.1. Nhóm 3 Thẻ Bị Gán Cứng Delta Tĩnh Sai Lệch (Gây Mâu Thuẫn Số Dư)
1. **`CC_LAND_CHANGE` (Chuyển Đổi Mục Đích Đất)**:
   - *Luật*: Có ô C0: nộp 500 Tr. nâng lên C1. Không có C0: nhận 600 Tr. hỗ trợ từ Kho Bạc.
   - *Lỗi cũ*: Metadata gán cứng `effectDelta: -500`. Khi không có đất, ví tăng 600 Tr. nhưng thẻ in phạt -500 Tr.
   - *Đã sửa*: Tính `actualDelta = current.balance - prevBalance` (+600 hoặc -500) và `destination` tương ứng.
2. **`CC_VENUE_INCIDENT` (Sự Cố Dịch Vụ)**:
   - *Luật*: Có ô Dịch vụ phạt 1.200 Tr. Không có ô Dịch vụ chỉ phạt 600 Tr.
   - *Lỗi cũ*: Metadata gán cứng `effectDelta: -1200`. Người chơi không có ô Dịch vụ bị trừ 600 Tr. nhưng thẻ in phạt -1.200 Tr.
   - *Đã sửa*: Tính `actualDelta` (-1.200 hoặc -600).
3. **`CC_SLOW_BUILD` (Chậm Tiến Độ Đất Trống)**:
   - *Luật*: Có ô C0 phạt 600 Tr. Không có ô C0 nộp phí hành chính 300 Tr.
   - *Lỗi cũ*: Metadata gán cứng `effectDelta: -600`. Người chơi không có C0 chỉ bị trừ 300 Tr. nhưng thẻ in phạt -600 Tr.
   - *Đã sửa*: Tính `actualDelta` (-600 hoặc -300).

### 2.2. Nhóm 5 Thẻ Có Biến Động Tiền Mặt Nhưng Trước Đây Bỏ Sót `effectDelta` (Thẻ 3D Không In Số Tiền)
1. **`CC_TAX_AUDIT`**: Phạt 500 Tr. x số ô C0 (0, -500, -1.000, -1.500 Tr.).
2. **`CC_FRANCHISE`**: Thu 800 Tr. từ mỗi đối thủ còn sống (+800 đến +2.400 Tr.).
3. **`CC_MA_FORCE`**: Mua lại ô C0 đối thủ (-cost) hoặc nhận trợ cấp +800 Tr. từ Kho Bạc.
4. **`CC_LAND_RECLAIM`**: Bồi hoàn 150% giá đất C0 (+Math.floor(price * 1.5)) hoặc 0 Tr.
5. **`CC_SWAP_PROJECT`**: Mua lại dự án 130% hoặc nhận hỗ trợ +1.000 Tr. / +800 Tr.

### 2.3. Nhóm Chuẩn Hóa Số Liệu Gây Hiểu Lầm Trong Từ Điển `PUNCHY_EVENT_SUMMARIES`
- `CC_CONCERT_SPONSOR`: Sửa từ `'Tài trợ sự kiện âm nhạc +800 Tr.'` (sai thực tế) thành `'Chi 600 Tr. tài trợ, x2 xúc xắc'`.
- `CC_FRANCHISE`: Sửa từ `'Thu phí nhượng quyền +1.200 Tr.'` thành `'Thu 800 Tr./đối thủ nhượng quyền'`.
- `CC_LAND_RECLAIM`: Sửa từ `'Thu hồi đất quy hoạch, nhận 2.000'` thành `'Thu hồi đất C0 bồi hoàn 150%'`.
- `CC_SLOW_BUILD`: Sửa từ `'phạt 400 Tr./c.trình'` thành `'Phạt chậm tiến độ 600 Tr. (C0)'`.
- `CC_MEDIA_CRISIS`: Sửa từ `'phạt 700'` thành `'Xử lý khủng hoảng, phạt 800 Tr.'`.
- `CC_VENUE_INCIDENT`: Sửa từ `'Sự cố sân khấu, bồi thường 600 Tr.'` thành `'Sự cố dịch vụ, phạt tới 1.200 Tr.'`.
- `CC_FREE_CREDIT`: Sửa từ `'Gói tín dụng 0% lãi suất tại GO'` thành `'Giải ngân 2.000 Tr., lãi 400 tại GO'`.
- `CC_LAND_CHANGE`: Sửa từ `'Nâng thẳng 1 ô C0 lên C1'` thành `'Nâng C0 lên C1 / Hỗ trợ 600 Tr.'`.
- `CC_SWAP_PROJECT`: Sửa từ `'Đổi 1 ô đất dự án với đối thủ'` thành `'Mua lại dự án đối thủ đền bù 130%'`.
- `MC_PUBLIC_INVEST`: Sửa từ `'Nhân đôi cước 4 Ga Tàu'` thành `'Thưởng 400 Tr. & x2 cước Ga Tàu'`.

---

## 3. Các Thay Đổi Kiến Trúc & Mã Nguồn

| Tệp Mã Nguồn | Hành Động | LOC Hiện Tại | Mục Đích |
| :--- | :---: | :---: | :--- |
| [`src/domain/event_card_engine.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/event_card_engine.ts) | MODIFY | 130 (< 400) | Tính `actualDelta = current.balance - prevBalance`, gán `effectDelta` và `destination` động vào `room.lastEventCard` |
| [`src/client/ui/modals/event_card_visuals.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/event_card_visuals.ts) | MODIFY | 334 (< 500) | `getCardHeroStat` định dạng dynamic delta cho `CC_LAND_CHANGE`, `CC_TAX_AUDIT`, `CC_LAND_RECLAIM`, `CC_MA_FORCE`, `CC_SWAP_PROJECT` |
| [`src/client/3d/event_card_texture.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/event_card_texture.ts) | MODIFY | 352 (< 500) | Render nhãn `CHI PHÍ: ${delta}` màu cyan/gold cho thẻ đầu tư/nâng cấp thay vì quy chụp là `PHẠT:` màu đỏ |
| [`src/client/network/activity_tracker.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_tracker.ts) | MODIFY | 477 (< 500) | Dọn dẹp singleton `lastProcessedEventCardKey = null` khi nhận `delta.lastEventCard === null`; gắn `FloatingTextType.Reward` cho thẻ đầu tư |
| [`src/client/ui/event_card_punchy_summaries.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/event_card_punchy_summaries.ts) | MODIFY | 99 (< 500) | Chuẩn hóa 10 câu tóm tắt punchy trong `PUNCHY_EVENT_SUMMARIES` ($\le$ 35 ký tự) |
| [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) | MODIFY | 4130 | Ghi nhận Gotcha #249: Dynamic Event Card Delta & Investment vs Penalty Semantic Invariant |

---

## 4. Bằng Chứng Kiểm Thử & Nghiệm Thu (Evidence & DoD Verification)

1. **Bộ Kiểm Thử Hợp Đồng Trạm 1**:
   - Tệp test: [`tests/domain/imp181_dynamic_event_card_deltas.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/domain/imp181_dynamic_event_card_deltas.test.ts)
   - Kết quả: **21/21 tests PASS 100%** (bao phủ 4 phương diện: Boundary, Reactivity, Disposal, Error Defense).
2. **Kiểm Thử Hồi Quy Toàn Dự Án**:
   - `npm test`: **305/305 test files PASS (6.196 tests GREEN)**.
3. **Kiểm Tra Biên Dịch & UI Lint**:
   - `npx tsc --noEmit`: 0 lỗi biên dịch.
   - `npm run lint:ui`: 0 vi phạm trên 171 tệp UI.
4. **Trạm 3 Phê Duyệt**:
   - `spec-reviewer`: **APPROVED 100%** sau khi kiểm tra đĩa vật lý và snapshot `.agents/evidence/imp181_snapshot.json`.
5. **Ràng Buộc Gotcha**:
   - Gotcha #249 đã được ghi vào SSOT Active Memory.
