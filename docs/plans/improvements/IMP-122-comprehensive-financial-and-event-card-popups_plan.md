# Kế Hoạch Cải Tiến [IMP-122]: Phủ Sóng Pop-Up Cho Toàn Bộ Biến Động Tiền Tệ & Hiệu Ứng Thẻ Bài Sự Kiện (Comprehensive Financial & Event Card Pop-Up Notifications)

> **Mục tiêu**: Đảm bảo 100% các biến động cộng/trừ tiền (mua đất, nâng cấp, trả/nhận tiền thuê, thuế, bảo lãnh, thắng đấu giá, chứng khoán HOSE) và TẤT CẢ các ảnh hưởng của thẻ bài (Phiếu Cơ Hội / Phiếu Thị Trường — bao gồm cả tác động tài chính lẫn phi tài chính như vào tù, dịch chuyển, thay đổi luật) đều được hiển thị dạng Pop-up (Toast / Milestone Banner) nổi bật, trực quan trên màn hình cho cả người chơi lẫn khi quan sát Bot AI, thay vì bị ẩn trong Activity Log.

---

## 1. BỐI CẢNH & VẤN ĐỀ CẦN GIẢI QUYẾT

1. **Hiện tượng người dùng phản ánh**:
   - Khi chơi (đặc biệt trên Mobile Chrome), người dùng chỉ nhìn thấy Pop-up khi con cờ vượt qua ô GO (`Lương Vượt GO +2.000 Tr.`).
   - Khi Bot hoặc đối thủ bước vào ô bốc thẻ (Cơ Hội / Thị Trường), màn hình hoàn toàn im lặng, không có bất kỳ popup hay thông tin nào xuất hiện, toàn bộ nội dung bị chôn trong Activity Log (Sidebar mặc định ẩn trên mobile).
   - Khi các giao dịch cộng/trừ tiền diễn ra (mua đất, trả tiền thuê, thu tiền thuê, nộp thuế, bảo lãnh, nâng cấp), hệ thống `syncPlayerBalanceDiff` trong `apply_delta_players.ts` chỉ nhận diện được cờ `isPassingGo` và `isBail`, còn lại hoặc không có tiêu đề, hoặc không được kích hoạt đầy đủ ngữ cảnh.

2. **Nguyên nhân kỹ thuật trong mã nguồn**:
   - `apply_delta_players.ts`: `syncPlayerBalanceDiff` so sánh số dư từng người chơi đơn lẻ, thiếu ngữ cảnh đối ứng (ai trả cho ai, mua ô nào, nâng cấp ô nào).
   - `activity_tracker.ts` & `activity_financial_tracker.ts`: Đã tính toán rất chuẩn xác ngữ cảnh giao dịch (mua, nâng cấp, trả tiền thuê, nộp thuế, đấu giá, bốc thẻ) nhưng lại CHỈ đẩy dữ liệu vào `useActivityStore` (thanh log ẩn).
   - `FloatingTextItem`: Thiếu các `actionType` chuyên biệt cho thẻ bài (`chance`, `market`), đấu giá (`auction_win`), chứng khoán (`hose`).
   - `FloatingNumbersOverlay`: Chưa gom các thông báo bốc thẻ bài vào khu vực `MilestoneBanner` trung tâm để người chơi kịp đọc.

---

## 2. SƠ ĐỒ DÒNG DỮ LIỆU & KIẾN TRÚC MỚI

```text
[DeltaPayload từ Server (Chứa lastEventCard, players, cells, lastHoseResult, auction)]
                                      |
                                      v
                  [applyDeltaToStore (apply_delta.ts)]
                                      |
                                      +---------------------------------------------+
                                      |                                             |
                                      v                                             v
                     [trackDeltaActivities (activity_tracker.ts)]       [applyPlayerDeltas & applyCellDeltas]
                                      |                                             |
                        Nhận diện toàn bộ sự kiện:                                  |
                        - Thu / Trả tiền thuê (Rent)                                |
                        - Mua đất (Buy) & Nâng cấp (Upgrade)                        |
                        - Nộp thuế (Tax) & Bảo lãnh (Bail)                          |
                        - Đấu giá thắng (Auction Win)                               |
                        - Thẻ bài Cơ Hội & Thị Trường (Cards)                       |
                                      |                                             |
                                      v                                             v
                      [dispatchActivityFloatingBadges]                     (Cập nhật HUD & State)
                                      |
                 +--------------------+--------------------+
                 |                                         |
                 v                                         v
   [useActivityStore.addActivityLog]          [useGameStore.addFloatingText]
         (Ghi vào Nhật Ký)                                 |
                                                           v
                                            [FloatingNumbersOverlay]
                                            - Top-Center Mobile / Top-Right Desktop
                                            - Milestone/Event Card Banner ở giữa
                                            - Tự động tan biến sau 2.2s - 3.5s
```

---

## 3. MA TRẬN HÀNH VI 4 KHÍA CẠNH (UNIVERSAL 4-FACET BEHAVIORAL MATRIX)

1. **Facet 1: Boundary & Capacity Invariants**:
   - `actionType` mở rộng hợp lệ: `'buy' | 'upgrade' | 'rent_pay' | 'rent_receive' | 'tax' | 'bail' | 'salary' | 'monopoly' | 'debt_relief' | 'stimulus' | 'chance' | 'market' | 'auction_win' | 'hose' | 'general'`.
   - Giới hạn Ring Buffer của `floatingTexts`: Max 6 items, FIFO tự động cắt tỉa.
   - Không spam trùng lặp thẻ bài: Dùng `eventKey` deduplication đảm bảo 1 thẻ bốc chỉ kích hoạt đúng 1 lần thông báo.

2. **Facet 2: State Reactivity & Contextual Badge Dispatch**:
   - Trả tiền thuê: Phát đồng thời 2 badge rõ ràng:
     - Người trả: `-[Số Tiền]`, `actionType: 'rent_pay'`, `title: 'Tiền thuê [Tên Ô]'`, `targetPlayerName: [Người Nhận]`.
     - Người nhận: `+[Số Tiền]`, `actionType: 'rent_receive'`, `title: 'Thu tiền thuê [Tên Ô]'`, `targetPlayerName: [Người Trả]`.
   - Mua đất: `-[Giá Tiền]`, `actionType: 'buy'`, `title: 'Mua [Tên Ô]'`, `cellIndex`.
   - Nâng cấp: `-[Chi Phí]`, `actionType: 'upgrade'`, `title: 'Nâng [Cấp] [Tên Ô]'`, `cellIndex`.
   - Thuế / Lệ phí: `-[Thuế]`, `actionType: 'tax'`, `title: 'Lệ Phí Đất Đai / Thuế'`.
   - Thắng đấu giá: `-[Giá Đấu]`, `actionType: 'auction_win'`, `title: 'Thắng Đấu Giá [Tên Ô]'`.

3. **Facet 3: Milestone & Event Card Banner Segregation**:
   - Khi có sự kiện `delta.lastEventCard` (dù là Bot hay Người):
     - Kích hoạt `MilestoneBanner` ở giữa đỉnh màn hình với `actionType: 'chance' | 'market'`.
     - Hiển thị đầy đủ: Badge màu người bốc, Tiêu đề thẻ (`item.title`), Mô tả hiệu lực (`item.text`).
     - Tác động phi tiền tệ (Đi tù Kiểm toán, Dịch chuyển ô, Đóng băng xây dựng) vẫn nổi rõ ràng để người chơi biết diễn biến bàn cờ.
     - Phát âm thanh `AudioEngine.playSfx(SoundEffect.CARD_DRAW)`.

4. **Facet 4: Responsive Layout & Mobile Non-Blocking**:
   - Mobile Chrome (< 768px): Căn giữa đỉnh màn hình `top-[4.25rem]`, `max-w-[94vw]`, `pointer-events-none`.
   - Desktop (>= 768px): Căn giữa đỉnh hoặc góc trên bên phải dưới TopBar.
   - 100% DOM thuần túy Tailwind CSS, 0 Draw Calls phát sinh lên Three.js WebGL canvas.

---

## 4. KẾ HOẠCH TRIỂN KHAI THEO 3 TRẠM (STATIONS)

### Trạm 1: RED Contract Tests (`tests/contracts/imp122_comprehensive_popups.test.ts`)
- Viết >= 15 atomic assertions kiểm chứng:
  1. `FloatingActionType` chứa đầy đủ `chance`, `market`, `auction_win`, `hose`.
  2. `resolveActionIcon` trả về đúng icon cho thẻ cơ hội `⚡`, thị trường `🎴`, đấu giá `🔨`, HOSE `📊`.
  3. Bốc thẻ Cơ Hội tài chính tạo Pop-up mang `actionType: 'chance'` kèm tiêu đề và số tiền.
  4. Bốc thẻ Cơ Hội phi tài chính (Đi tù, vé ngoại giao) tạo Pop-up với mô tả hành động.
  5. Bốc thẻ Thị Trường vĩ mô tạo Pop-up mang `actionType: 'market'` vinh danh giữa màn hình.
  6. Giao dịch trả tiền thuê tạo 2 pop-up tương ứng cho người trả và người nhận kèm tên đối phương.
  7. Mua đất trực tiếp tạo pop-up mang tên ô đất và số tiền trừ.
  8. Nâng cấp công trình tạo pop-up mang cấp độ công trình C1..C3 và chi phí.
  9. Nộp thuế / phí tạo pop-up mang `actionType: 'tax'`.
  10. Thắng đấu giá tạo pop-up mang `actionType: 'auction_win'`.
  11. Chống trùng lặp toast khi thẻ bài giữ nguyên qua các tick tiếp theo.
  12. Mobile layout render an toàn với thẻ MilestoneBanner.

### Trạm 2: GREEN Implementation
- `src/client/store/game_store_types.ts`: Cập nhật `FloatingActionType`.
- `src/client/ui/floating_numbers.tsx`: Cập nhật `resolveActionIcon`, nhận diện `chance` và `market` trong `MilestoneBanner` và `FloatingNumbersOverlay`.
- `src/client/network/activity_tracker.ts`: Thêm hàm `dispatchActivityFloatingBadges(activities, state)` để kết nối các sự kiện đã nhận diện thành các Pop-up nổi tức thì.
- `src/client/network/apply_delta_players.ts`: Tinh chỉnh tránh phát sinh pop-up trùng lặp từ `syncPlayerBalanceDiff` khi đã có badge ngữ cảnh.

### Trạm 3: Independent Review & Physical Disk Verification
- Xác minh `npm test`, `npx tsc --noEmit`, `npm run lint:ui`.
- Báo cáo kết quả tại `docs/reports/improvements/IMP-122-comprehensive-financial-and-event-card-popups_report.md`.
- Cập nhật `docs/master_roadmap.md` và `docs/domain/gotchas.md`.
