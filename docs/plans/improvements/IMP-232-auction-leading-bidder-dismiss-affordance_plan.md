# KẾ HOẠCH TRIỂN KHAI IMP-232 (v2): CHUYỂN ĐỔI AFFORDANCE ĐÓNG MODAL CHO NGƯỜI DẪN ĐẦU ĐẤU GIÁ & VIỆT HÓA THÔNG BÁO

> **Mã phiếu**: IMP-232  
> **Phiên bản kế hoạch**: v2 (Đã tiếp thu và khắc phục 100% các điểm mù P1-P5 từ `plan-griller`)  
> **Căn cứ kế thừa**: Kế thừa Slice UI-04 (`_epic_ledger.md`), khắc phục triệt để lỗi người chơi đang dẫn đầu đấu giá bấm thoát ra bị báo lỗi `highest_bidder cannot pass`.  
> **Phân loại rủi ro**: Tier 2 (Full Rigor) — Điều chỉnh Affordance Modal tài chính & Notification Dictionary, tuân thủ nghiêm ngặt Quy trình 4 Trạm Khép Kín.  
> **Trần ngân sách LOC**:  
> - `src/client/ui/modals/auction_modal.tsx`: Baseline 443 lines (SLOC 422, trần 500 lines) $\rightarrow$ Dự kiến sau delta: 452 lines ($\le 500$ lines, delta +9).  
> - `src/client/ui/actionable_notification.ts`: Baseline 344 lines (SLOC 336, trần 500 lines) $\rightarrow$ Dự kiến sau delta: 353 lines ($\le 500$ lines, delta +9).  
> - `tests/client/imp232_auction_leading_bidder_dismiss_affordance.test.ts`: Dự kiến 350-450 lines ($\le 600$ lines).  

---

## 1. PHÂN TÍCH VẤN ĐỀ GỐC & CƠ CHẾ KHẮC PHỤC TRIỆT ĐỂ

### 1.1 Vấn Đề Thực Tế Người Chơi Gặp Phải
1. **Lỗi Đánh Lừa Trực Quan (Misleading Button Affordance)**:
   - Trong [`src/client/ui/modals/auction_modal.tsx#L401-L437`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/auction_modal.tsx#L401-L437), chân trang (Footer) chỉ kiểm tra 3 điều kiện: `isConcluded`, `hasPassed`, `isDeclinedPlayer`.
   - Khi người chơi đã đặt giá và đang dẫn đầu (`isLeading = Boolean(myId && highestBidderId === myId)`), modal rơi vào nhánh `else` và hiển thị nút **`[✕ Rút Lui]`** (`data-testid="auction-pass-btn"`), gắn với `onClick={() => onPass?.()}`.
   - Khi phiên đấu giá chưa kết thúc, người chơi muốn "thoát ra" (tạm ẩn modal để quan sát sa bàn 3D, kiểm tra số dư đối thủ hoặc vị trí ô đất). Thấy nút có dấu `✕`, người chơi tưởng là nút đóng/thoát modal nên bấm vào.
2. **Xung Đột Quy Tắc Nghiệp Vụ Phía Server (Domain Rule Rejection)**:
   - Khi người chơi bấm nút, client gửi intent `INTENT_AUCTION_PASS` lên server.
   - Tại [`src/server/auction_manager.ts#L121`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/auction_manager.ts#L121):
     ```ts
     if (session.highestBidder === playerId) return { success: false, reason: 'HIGHEST_BIDDER_CANNOT_PASS' };
     ```
   - Trong luật đấu giá, người đang trả giá cao nhất không được quyền rút lui để hủy phiên đấu giá. Server từ chối intent với mã lỗi `'HIGHEST_BIDDER_CANNOT_PASS'`.
3. **Thiếu Từ Điển Việt Hóa Khiến Thông Báo Khó Hiểu**:
   - [`src/client/ui/actionable_notification.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/actionable_notification.ts) chưa có mapping cho mã lỗi `HIGHEST_BIDDER_CANNOT_PASS`, dẫn tới việc in thô chuỗi tiếng Anh kỹ thuật: `'highest_bidder cannot pass'`.

### 1.2 Giải Pháp Triệt Để (3 Trục Đồng Bộ)
```
[Trạng thái: isLeading = true (Người chơi đang dẫn đầu giá cao nhất)]
                  │
                  ├──> [Trục 1: UI Modal Affordance (auction_modal.tsx)]
                  │    Thay nút [✕ Rút Lui] (gọi onPass ❌) 
                  │    THÀNH [✕ Đóng / Xem Bàn Cờ] (gọi onClose ✔️)
                  │    └──> Modal thu nhỏ xuống MiniAuctionStrip, không gửi intent pass sai luật!
                  │
                  ├──> [Trục 2: State Toggle Phản Ứng (Dynamic Role Transition)]
                  │    Nếu bị đối thủ trả giá cao hơn (isLeading -> false):
                  │    Nút lập tức quay lại thành [✕ Rút Lui] để người chơi bỏ cuộc nếu muốn.
                  │
                  └──> [Trục 3: Từ Điển Thông Báo Tiếng Việt (actionable_notification.ts)]
                       Bổ sung mapping HIGHEST_BIDDER_CANNOT_PASS & đầy đủ bộ alias:
                       "Đang Dẫn Đầu Đấu Giá: Bạn đang là người trả giá cao nhất nên không thể rút lui.
                       👉 Hãy nhấn '✕ Đóng / Xem Bàn Cờ' để tạm ẩn và theo dõi trận đấu."
```

### 1.3 Bất Biến Kiến Trúc Bổ Sung (Ghi Nhận Từ Plan Griller P2)
- **Cơ chế Chống Click Nhầm Nền Đen (Backdrop Miss-Click Guard)**:
  Tại `modal_helpers.ts#L342-L356`, hàm `isAuctionDismissible` tiếp tục trả về `false` khi người chơi đang là active bidder / leading bidder. Điều này bảo vệ người chơi không bị vô tình bấm trúng backdrop làm đóng modal giữa lúc đang cạnh tranh giá thầu căng thẳng. Việc đóng modal để xem bàn cờ là **thao tác chủ động có chủ đích** thông qua nút Footer `[✕ Đóng / Xem Bàn Cờ]`, nút Header `✕` hoặc phím `Escape`.

---

## 2. CHI TIẾT CÁC NHIỆM VỤ TRIỂN KHAI

### Task 1: Nâng Cấp Footer Affordance Trong `src/client/ui/modals/auction_modal.tsx`
- **Tệp mục tiêu**: `src/client/ui/modals/auction_modal.tsx`
- **Vị trí**: Dòng 401 đến dòng 437 (toàn bộ khối ternary chân trang).
- **Enclosing Function**: `export function AuctionModal(...)`
- **Drop-in Snippet**:
```tsx
<<<<
          {isConcluded ? (
            <button
              type="button"
              onClick={onClose}
              data-testid="auction-concluded-close-btn"
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-black text-amber-950 bg-amber-400 hover:bg-amber-300 border-2 border-amber-600 shadow-[0_3px_0_0_#b45309] active:translate-y-[2px] transition-all cursor-pointer whitespace-nowrap"
            >
              ✕ Đóng / Xem Bàn Cờ
            </button>
          ) : hasPassed ? (
            <button
              type="button"
              onClick={onClose}
              data-testid="auction-passed-close-btn"
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-black text-slate-700 bg-slate-200 hover:bg-slate-300 border-2 border-slate-400 shadow-[0_3px_0_0_#94a3b8] active:translate-y-[2px] transition-all cursor-pointer whitespace-nowrap"
            >
              ✕ Đã Rút Lui • Đóng
            </button>
          ) : isDeclinedPlayer ? (
            <button
              type="button"
              onClick={onClose}
              data-testid="auction-declined-close-btn"
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-black text-amber-950 bg-amber-100 hover:bg-amber-200 border-2 border-amber-400 shadow-[0_3px_0_0_#d97706] active:translate-y-[2px] transition-all cursor-pointer whitespace-nowrap"
            >
              ✕ Đóng / Xem Bàn Cờ
            </button>
          ) : (
            <button
              type="button"
              data-testid="auction-pass-btn"
              onClick={() => onPass?.()}
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-black text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 shadow-[0_3px_0_0_#fca5a5] active:translate-y-[2px] transition-all cursor-pointer whitespace-nowrap"
            >
              ✕ Rút Lui
            </button>
          )}
====
          {isConcluded ? (
            <button
              type="button"
              onClick={onClose}
              data-testid="auction-concluded-close-btn"
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-black text-amber-950 bg-amber-400 hover:bg-amber-300 border-2 border-amber-600 shadow-[0_3px_0_0_#b45309] active:translate-y-[2px] transition-all cursor-pointer whitespace-nowrap"
            >
              ✕ Đóng / Xem Bàn Cờ
            </button>
          ) : hasPassed ? (
            <button
              type="button"
              onClick={onClose}
              data-testid="auction-passed-close-btn"
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-black text-slate-700 bg-slate-200 hover:bg-slate-300 border-2 border-slate-400 shadow-[0_3px_0_0_#94a3b8] active:translate-y-[2px] transition-all cursor-pointer whitespace-nowrap"
            >
              ✕ Đã Rút Lui • Đóng
            </button>
          ) : isDeclinedPlayer ? (
            <button
              type="button"
              onClick={onClose}
              data-testid="auction-declined-close-btn"
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-black text-amber-950 bg-amber-100 hover:bg-amber-200 border-2 border-amber-400 shadow-[0_3px_0_0_#d97706] active:translate-y-[2px] transition-all cursor-pointer whitespace-nowrap"
            >
              ✕ Đóng / Xem Bàn Cờ
            </button>
          ) : isLeading ? (
            <button
              type="button"
              onClick={onClose}
              data-testid="auction-leading-close-btn"
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-black text-amber-950 bg-amber-400 hover:bg-amber-300 border-2 border-amber-600 shadow-[0_3px_0_0_#b45309] active:translate-y-[2px] transition-all cursor-pointer whitespace-nowrap"
            >
              ✕ Đóng / Xem Bàn Cờ
            </button>
          ) : (
            <button
              type="button"
              data-testid="auction-pass-btn"
              onClick={() => onPass?.()}
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-black text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 shadow-[0_3px_0_0_#fca5a5] active:translate-y-[2px] transition-all cursor-pointer whitespace-nowrap"
            >
              ✕ Rút Lui
            </button>
          )}
>>>>
```

---

### Task 2: Đăng Ký Từ Điển Thông Báo Tiếng Việt Trong `src/client/ui/actionable_notification.ts`
- **Tệp mục tiêu**: `src/client/ui/actionable_notification.ts`
- **Vị trí**: Thêm vào object `ACTIONABLE_NOTIFICATIONS_MAP` và phần aliases.
- **Drop-in Snippet**:
```ts
<<<<
  ASSET_LOCKED: {
    icon: '🔒',
    title: 'Tài Sản Đang Trong Giao Dịch',
    description: 'Bất động sản này đang nằm trong đề xuất đàm phán hoặc giao dịch chờ duyệt.',
    tone: 'warning',
    actionHint: 'Vui lòng chờ giao dịch hiện tại hoàn tất hoặc hủy đề xuất.',
  },
};

// Aliases for legacy/alternative casing reason codes (DRY SSOT)
ACTIONABLE_NOTIFICATIONS_MAP['InsufficientFunds'] = ACTIONABLE_NOTIFICATIONS_MAP['INSUFFICIENT_FUNDS']!;
ACTIONABLE_NOTIFICATIONS_MAP['NotPurchasable'] = ACTIONABLE_NOTIFICATIONS_MAP['NOT_PURCHASABLE']!;
ACTIONABLE_NOTIFICATIONS_MAP['TradeFrozen'] = ACTIONABLE_NOTIFICATIONS_MAP['FREEZE_ACTIVE']!;
====
  ASSET_LOCKED: {
    icon: '🔒',
    title: 'Tài Sản Đang Trong Giao Dịch',
    description: 'Bất động sản này đang nằm trong đề xuất đàm phán hoặc giao dịch chờ duyệt.',
    tone: 'warning',
    actionHint: 'Vui lòng chờ giao dịch hiện tại hoàn tất hoặc hủy đề xuất.',
  },
  HIGHEST_BIDDER_CANNOT_PASS: {
    icon: '👑',
    title: 'Đang Dẫn Đầu Đấu Giá',
    description: 'Bạn đang là người trả giá cao nhất nên không thể rút lui khỏi phiên đấu giá.',
    tone: 'info',
    actionHint: 'Bạn có thể nhấn "✕ Đóng / Xem Bàn Cờ" để tạm ẩn và theo dõi trận đấu.',
  },
};

// Aliases for legacy/alternative casing reason codes (DRY SSOT)
ACTIONABLE_NOTIFICATIONS_MAP['InsufficientFunds'] = ACTIONABLE_NOTIFICATIONS_MAP['INSUFFICIENT_FUNDS']!;
ACTIONABLE_NOTIFICATIONS_MAP['NotPurchasable'] = ACTIONABLE_NOTIFICATIONS_MAP['NOT_PURCHASABLE']!;
ACTIONABLE_NOTIFICATIONS_MAP['TradeFrozen'] = ACTIONABLE_NOTIFICATIONS_MAP['FREEZE_ACTIVE']!;
ACTIONABLE_NOTIFICATIONS_MAP['highest_bidder cannot pass'] = ACTIONABLE_NOTIFICATIONS_MAP['HIGHEST_BIDDER_CANNOT_PASS']!;
ACTIONABLE_NOTIFICATIONS_MAP['highest_bidder_cannot_pass'] = ACTIONABLE_NOTIFICATIONS_MAP['HIGHEST_BIDDER_CANNOT_PASS']!;
ACTIONABLE_NOTIFICATIONS_MAP['HighestBidderCannotPass'] = ACTIONABLE_NOTIFICATIONS_MAP['HIGHEST_BIDDER_CANNOT_PASS']!;
>>>>
```

---

### Task 3: Thiết Kế Bộ Test Hợp Đồng 16 Ca Kiểm Thử (Trạm 1 RED)
- **Tệp test mới**: `tests/client/imp232_auction_leading_bidder_dismiss_affordance.test.ts`
- **Mô hình kiểm thử**: Detroit Classical TDD, Universal 5-Facet Behavioral Matrix, 1-4 asserts/test, zero static checklist tests.

#### Ma Trận 16 Ca Kiểm Thử (Universal 5-Facet Matrix):
- **Facet 1: Phân Định Nút Bấm Chân Trang Theo Trạng Thái Dẫn Đầu (Footer Button Affordance)** (4 tests):
  * `[TC-232.01/MSS][UC-IMP232][Facet-1/LeadingRendersCloseButton]`: Khi `highestBidderId === myId`, Footer render nút `auction-leading-close-btn` mang nhãn `'✕ Đóng / Xem Bàn Cờ'`, không render nút `auction-pass-btn`.
  * `[TC-232.02/MSS][UC-IMP232][Facet-1/NonLeadingRendersPassButton]`: Khi `highestBidderId !== myId` (hoặc `null`), Footer render nút `auction-pass-btn` mang nhãn `'✕ Rút Lui'`.
  * `[TC-232.03/MSS][UC-IMP232][Facet-1/LeadingClickCallsOnCloseNotOnPass]`: Khi người chơi đang dẫn đầu click `auction-leading-close-btn`, hàm `onClose` được gọi đúng 1 lần, `onPass` tuyệt đối KHÔNG được gọi.
  * `[TC-232.04/MSS][UC-IMP232][Facet-1/NonLeadingClickCallsOnPass]`: Khi người chơi không dẫn đầu click `auction-pass-btn`, hàm `onPass` được gọi đúng 1 lần.

- **Facet 2: Chuyển Đổi Trạng Thái Động Khi Bị Vượt Giá (Dynamic Role Transition)** (3 tests):
  * `[TC-232.05/MSS][UC-IMP232][Facet-2/OutbidSwitchesCloseToPass]`: Khi đối thủ đặt giá cao hơn (`highestBidderId` đổi từ `myId` sang `opponentId`), nút Footer tự động chuyển từ `auction-leading-close-btn` sang `auction-pass-btn`.
  * `[TC-232.06/MSS][UC-IMP232][Facet-2/RebiddingRestoresCloseButton]`: Sau khi bị vượt giá, người chơi đặt giá cao hơn tiếp (`highestBidderId` quay lại `myId`), nút Footer lập tức phục hồi lại thành `auction-leading-close-btn`.
  * `[TC-232.07/MSS][UC-IMP232][Facet-2/PassedPlayerPrecedenceOverLeading]`: Nếu người chơi đã có cờ `hasPassed = true`, luôn hiển thị `auction-passed-close-btn` ('✕ Đã Rút Lui • Đóng') kể cả khi props dữ liệu có xung đột.

- **Facet 3: Khép Kín Với ModalHost & MiniAuctionStrip (Host & Strip Integration)** (3 tests):
  * `[TC-232.08/MSS][UC-IMP232][Facet-3/CloseDismissesAuctionModal]`: Bấm `auction-leading-close-btn` trong `ModalHost` kích hoạt `dismissAuction(cellIndex)`, đóng modal khỏi màn hình chính (`activeModal = null`).
  * `[TC-232.09/MSS][UC-IMP232][Facet-3/MiniAuctionStripVisibleWhenDismissed]`: Khi `AuctionModal` bị dismiss và người chơi đang là highest bidder, `MiniAuctionStrip` hiển thị `👑 ${playerName}` (tên người dẫn đầu từ `playersInfo`) và giá thầu hiện tại.
  * `[TC-232.10/MSS][UC-IMP232][Facet-3/RestoreAuctionBringsBackLeadingModal]`: Bấm nút `[👁️ Mở Lại]` trên `MiniAuctionStrip` phục hồi `AuctionModal` với đúng trạng thái `isLeading = true`.

- **Facet 4: Việt Hóa Thông Báo Lỗi Server (Actionable Notification Dictionary)** (3 tests):
  * `[TC-232.11/MSS][UC-IMP232][Facet-4/ResolveHighestBidderNotification]`: `resolveActionableNotification('HIGHEST_BIDDER_CANNOT_PASS')` trả về đầy đủ icon 👑, tiêu đề 'Đang Dẫn Đầu Đấu Giá', thông điệp và hướng dẫn hành động cụ thể.
  * `[TC-232.12/MSS][UC-IMP232][Facet-4/FormatServerErrorMessageHighestBidder]`: `formatServerErrorMessage('HIGHEST_BIDDER_CANNOT_PASS')` định dạng chuỗi tiếng Việt thân thiện, không chứa mã lỗi tiếng Anh thô.
  * `[TC-232.13/MSS][UC-IMP232][Facet-4/CaseInsensitiveAliasSupport]`: Hỗ trợ đầy đủ bộ alias `'highest_bidder cannot pass'`, `'highest_bidder_cannot_pass'`, `'HighestBidderCannotPass'`, trả về cùng đối tượng thông báo chuẩn mực.

- **Facet 5: Độ Bền Vững & Hồi Quy (Robustness & Regression Guard)** (3 tests):
  * `[TC-232.14/MSS][UC-IMP232][Facet-5/ServerAuthoritativeRejectionRemainsSafe]`: Hàm server `handleAuctionPass` vẫn duy trì kiểm tra `session.highestBidder === playerId` trả về `HIGHEST_BIDDER_CANNOT_PASS`, bảo vệ vững chắc quy tắc đấu giá.
  * `[TC-232.15/MSS][UC-IMP232][Facet-5/SSRHeadlessRenderSafety]`: Kết xuất SSR headless của `AuctionModal` khi `isLeading = true` chạy trơn tru 100% không văng ngoại lệ.
  * `[TC-232.16/MSS][UC-IMP232][Facet-5/AuctionConcludedStateTakesPrecedence]`: Khi phiên kết thúc (`isConcluded = true`), luôn hiển thị `auction-concluded-close-btn` bất kể ai là người dẫn đầu.

---

## 3. BÁN KÍNH ẢNH HƯỞNG (BLAST RADIUS & RISK ANALYSIS)

| Tệp Liên Quan | Mức Độ Rủi Ro | Phân Tích Khả Năng Phát Sinh Lỗi |
| :--- | :---: | :--- |
| `src/client/ui/modals/auction_modal.tsx` | Thấp | Chỉ thay thế khối ternary chân trang. Bổ sung nhánh `isLeading` gọi `onClose`. Các nhánh khác (`isConcluded`, `hasPassed`, `isDeclinedPlayer`, `default pass`) giữ nguyên 100%. |
| `src/client/ui/actionable_notification.ts` | Rất Thấp | Thêm 1 entry mới vào map tĩnh và 3 alias, không thay đổi logic xử lý hàm format/resolve. |
| `src/server/auction_manager.ts` | Không đổi | Giữ nguyên 100% logic server bảo vệ luật đấu giá. |
| `src/client/ui/modals/mini_auction_strip.tsx` | Không đổi | Giữ nguyên logic hiển thị `highestBidderName` từ `playersInfo`. |

---

## 4. KẾ HOẠCH BÀN GIAO & PHÊ DUYỆT (DEFINITION OF DONE)
1. Kế hoạch v2 được kiểm toán lại bởi `plan-griller` (P1-P5) đạt **APPROVED**.
2. Trạm 1 (QA Tester): 16 tests contract được viết trước và chứng minh Business RED.
3. Trạm 2 (Implementer): Triển khai mã nguồn tối thiểu, 16/16 tests GREEN, zero regression.
4. Trạm 2.5 (Scout): Quét 5 nhóm lỗi cơ học, typecheck và LOC an toàn.
5. Trạm 3 (Review Funnel): `spec-reviewer`, `code-reviewer` và `ui-craft-reviewer` phê chuẩn.
6. Trạm 4 (Chaos Sentinel): Thực thi 3 physical probes, tiêu diệt 100% mutants, ký duyệt evidence snapshot.
7. Cập nhật Sổ cái `_epic_ledger.md`, Bất biến miền #27 trong `gotchas.md` và tạo Báo cáo nghiệm thu hoàn chỉnh.
