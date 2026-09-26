# [KẾ HOẠCH TRIỂN KHAI ĐÃ PHẢN BIỆN] MINH BẠCH HÓA TRẠNG THÁI RÚT LUI TRONG SÀN ĐẤU GIÁ (IMP-196)

## 1. BỐI CẢNH & MỤC TIÊU
- **Vấn đề**: Trong phiên đấu giá trực tuyến, khi người chơi hoặc Bot rút lui (`handleAuctionPass`), Server ghi nhận vào `session.passedPlayers`, nhưng trên Client UI danh sách "ĐẠI GIA THAM GIA" không hiển thị bất kỳ ghi chú hay huy hiệu nào. Đối thủ dù đã rút lui vẫn sáng đèn và hiển thị số dư bình thường, gây bất đối xứng thông tin nghiêm trọng.
- **Tiếp thu phản biện từ `plan-griller` (3 điểm mù vật lý)**:
  1. **Transient Teardown Guard**: Chặn rò rỉ `hasPassed: true` từ phiên cũ sang phiên BĐS mới trong `apply_delta.ts` bằng guard `isSameAuction = prevPayload?.cellIndex === delta.auction.cellIndex && !prevPayload?.isConcluded`.
  2. **Actor Inversion Guard**: Phân biệt rạch ròi giữa người từ chối mua ban đầu `[🚫 Bỏ qua]` và con nợ bị cưỡng chế nhà đất trong phiên phát mãi nợ `[⚖️ Phát mãi]`.
  3. **Mobile 360px Layout Budget**: Tiêu đề đại gia co gọn `ĐẠI GIA THAM GIA ({competingCount}/{activePlayers.length})` với `<span className="hidden sm:inline"> còn lại</span>` để không ép vỡ cột số dư ví.

---

## 2. KIẾN TRÚC & LUỒNG DỮ LIỆU ĐÃ BẢO VỆ (ORIGIN-TO-SINK)

```
[Server: AuctionSession]
  ├── passedPlayers: Set<string>
  ├── declinedPlayerId: string
  └── insolvencyPlayerId?: string
         │
         ▼ (syncAuction / Delta tick)
[Network Payload: session_manager.ts]
  └── passedPlayerIds: Array.from(session.passedPlayers)
         │
         ▼ (WebSocket Delta)
[Client Store: apply_delta.ts]
  ├── Kiểm tra isSameAuction (chặn rò rỉ hasPassed sang ô BĐS khác)
  └── modalPayload: { ...delta.auction, passedPlayerIds, declinedPlayerId }
         │
         ▼ (Props Wiring)
[Host: modal_host.tsx]
  └── <AuctionModal passedPlayerIds={...} declinedPlayerId={...} />
         │
         ▼ (UI Rendering)
[View: auction_modal.tsx]
  ├── Header: ĐẠI GIA THAM GIA (X/Y)
  └── Rows:
      ├── 👑 Dẫn đầu (bg-amber-100 font-bold)
      ├── ✕ Rút lui (bg-slate-100 text-slate-500 opacity-60 line-through)
      ├── ⚖️ Phát mãi (bg-rose-50 text-rose-700 opacity-60)
      ├── 🚫 Bỏ qua (bg-amber-50 text-amber-700 opacity-60)
      └── 🟢 Đang chờ giá (bg-white/60)
```

---

## 3. NGÂN SÁCH LOC (ANTI-SLOP & CODE LIMITS)

| Tệp Mục Tiêu | Loại Tier | LOC Hiện Tại | Delta Dự Kiến | LOC Sau Khi Sửa | Hạn Mức Tối Đa |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/ui/modals/auction_modal.tsx` | Tier 2 (UI Component) | 442 | +32 | 474 | <= 480 (Hạn mức trần: 500) |
| `src/client/ui/modals/modal_host.tsx` | Tier 2 (UI Container) | 480 | -8 (Refactor gọn unpacking) | 472 | <= 480 (Hạn mức trần: 500) |
| `src/client/network/apply_delta.ts` | Tier 1 (Client Network) | 271 | +4 (Thêm guard isSameAuction) | 275 | <= 300 (Hạn mức trần: 400) |
| `tests/client/auction_passed_players_transparency.test.ts` | Living Contract Test | 0 (New) | +150 | 150 | <= 300 |

> **Tính toán Pre-Coding Delta**:
> - `auction_modal.tsx`: [442 + 32 = 474] <= 480. An toàn dưới ngưỡng 480.
> - `modal_host.tsx`: [480 - 8 = 472] <= 480. Tinh gọn code lặp, giảm số dòng.
> - `apply_delta.ts`: [271 + 4 = 275] <= 300. Rất an toàn trong Tier 1.

---

## 4. CHI TIẾT CÁC BƯỚC THỰC HIỆN THEO QUY TRÌNH 3 TRẠM

### Trạm 1: Viết Contract Test Thất Bại (RED QA)
- Tạo tệp: `tests/client/auction_passed_players_transparency.test.ts`.
- Bộ 5 khía cạnh Universal Matrix (Tối thiểu 8-10 tests):
  1. *Facet 1 (Boundary & Compactness)*: Huy hiệu `[✕ Rút lui]` và `[⚖️ Phát mãi]` hiển thị xúc giác, không tràn lề trên mobile.
  2. *Facet 2 (Layout & Counter)*: Tiêu đề hiển thị `(1/3)` khi 2 người chơi đã rút lui/bỏ qua, bảo vệ không gian cho cột hiển thị số dư ví.
  3. *Facet 3 (Data Lifecycle & Modal Wiring)*: `modal_host.tsx` truyền chính xác `passedPlayerIds` và `declinedPlayerId` vào component.
  4. *Facet 4 (Actor Inversion & Role Symmetry)*:
     - Khi `isForeclosure = true`, con nợ mang nhãn `[⚖️ Phát mãi]`, không mang nhãn `[🚫 Bỏ qua]`.
     - Khi `myId` rút lui ➔ Dòng của người chơi có nhãn `(Bạn)` + `[✕ Rút lui]`.
  5. *Facet 5 (Transient Teardown)*: `apply_delta.ts` không kế thừa `hasPassed: true` khi `delta.auction.cellIndex` khác với phiên trước.

### Trạm 2: Triển Khai Mã Nguồn (GREEN Implementation)
1. **`src/client/network/apply_delta.ts`**:
   - Thêm guard `isSameAuction = prevPayload?.cellIndex === delta.auction.cellIndex && !prevPayload?.isConcluded`.
   - Chỉ giữ `hasPassed: true` khi `isSameAuction`.
2. **`src/client/ui/modals/modal_host.tsx`**:
   - Trích xuất payload auction một lần `const payload = modalPayload as ModalPayloadMap['auction']`.
   - Truyền `passedPlayerIds={payload.passedPlayerIds}` và `declinedPlayerId={payload.declinedPlayerId}`.
3. **`src/client/ui/modals/auction_modal.tsx`**:
   - Thêm `passedPlayerIds` và `declinedPlayerId` vào `AuctionModalProps`.
   - Tính toán `effectivePassed` và `competingCount`.
   - Render huy hiệu:
     - `p.id === highestBidderId` ➔ `👑 Dẫn đầu`
     - `isPassed` ➔ `✕ Rút lui` (kèm chữ gạch ngang và dòng mờ `opacity-60`)
     - `isForeclosure && (p.id === insolvencyPlayerId || p.id === declinedPlayerId)` ➔ `⚖️ Phát mãi`
     - `!isForeclosure && p.id === declinedPlayerId` ➔ `🚫 Bỏ qua`

### Trạm 2.5: Sweeping Scout Audit
- Quét 5 archetypes khuyết tật phổ quát trên các file vừa sửa:
  1. Stale state/closure trong `useEffect/useMemo`.
  2. Unhandled async/exception.
  3. Resource/timer leaks.
  4. Dirty casts (`as any`, `as unknown`).
  5. Dead-end UI states.

### Trạm 3: Thẩm Định Độc Lập & Chụp Ảnh Kiểm Chứng (Reviewer Sign-off)
- Chụp ảnh CDP thực tế:
  - Mobile 360x740: Phiên đấu giá có người dẫn đầu, người đã rút lui, người phát mãi.
  - Desktop 1280x800.
- Thẩm định trực quan qua `view_file` trên ảnh.
- Subagent `ui-craft-reviewer` kiểm tra độc lập và ban hành phán quyết.
