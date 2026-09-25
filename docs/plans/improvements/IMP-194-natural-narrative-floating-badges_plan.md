# KẾ HOẠCH TRIỂN KHAI IMP-194: CHUẨN HÓA NGỮ NGHĨA DÒNG TIỀN & CÚ PHÁP CÂU TỰ NHIÊN CHO FLOATING BADGE (ĐÃ HIỆU CHỈNH SAU AUDIT)
> **Mã vé**: IMP-194  
> **Chủ đề**: Tái cấu trúc `FloatingBadge` từ bố cục số nổi rời rạc sang Cú pháp câu tự nhiên hoàn chỉnh `[A] [hành động] [X Tr.] [cho/vào B] (Chi tiết C)` và trích xuất cỗ máy ngữ nghĩa `src/client/ui/transaction_narrative.ts`.  
> **Quy chuẩn áp dụng**: Antigravity 2.0, Impeccable 2D Craft, ADR-0001, Gotcha #267, Single Responsibility Principle (SRP).  
> **Trạng thái kiểm toán**: 🟢 **REVISED_AND_STRENGTHENED** (Giải quyết triệt để 3 lỗi P1 và 5 lỗi P2 từ `.agents/audit/PLAN_AUDIT_IMP194.md`).

---

## 1. MỤC TIÊU & BỐI CẢNH (PROBLEM STATEMENT)

### 1.1. Hiện trạng và Khuyết tật thị giác
1. **Tranh chấp không gian ngang (Horizontal Space Collision)**:
   - Trên mobile (< 390px), hàng 1 của `FloatingBadge` đặt cả Icon, Tên người chơi và Pill số tiền:
     `[Icon] [Tên người chơi] ......................... [-650 Tr.]`
   - Số tiền chiếm ~70px, icon chiếm ~24px $\rightarrow$ Tên người chơi bị ép co cụm `max-w-[85px]`, dẫn đến bị cắt cụt tên (`Đại Gia Sài ..`).
2. **Phân mảnh ngữ nghĩa (Semantic Fragmentation)**:
   - Thông tin giao dịch bị xé làm 2 nửa độc lập:
     - Hàng 1: Chỉ có Ai + Số tiền (không có động từ, không có đối tượng nhận/nộp).
     - Hàng 2: Hành động đẩy xuống dưới (`Thắng đấu giá Cần Thơ ➔ Nộp Kho Bạc` hoặc `Trả thuê Đà Nẵng cho Bot 2`).
   - Mắt người đọc phải nhảy zíc-zắc từ Tên $\rightarrow$ Tiền $\rightarrow$ Hành động $\rightarrow$ Tự suy đoán logic luồng tiền.
3. **Mập mờ trong giao dịch P2P**:
   - Khi hiển thị `[A] [-350 Tr.]` ở hàng 1 và `Trả thuê Đà Nẵng cho B` ở hàng 2, người chơi không cảm nhận được dòng tiền luân chuyển tức thì giữa 2 thực thể.

### 1.2. Giải pháp kiến trúc mới (Phương án 1 - Header danh mục + Câu văn tự nhiên)
- **Header nhỏ gọn (Hàng 1)**: Icon + Nhãn danh mục giao dịch (`🔨 ĐẤU GIÁ BẤT ĐỘNG SẢN`, `🏠 TIỀN THUÊ BĐS`, `🏛️ KHO BẠC NHÀ NƯỚC`, `🏦 TÍN DỤNG NGÂN HÀNG`...).
- **Nội dung liền mạch (Hàng 2)**: Cấu trúc câu tự nhiên hoàn chỉnh:
  $$\mathbf{[Chủ\ thể\ A]} \ \mathbf{[Động\ từ]} \ \mathbf{[Pill\ Số\ tiền\ X]} \ \mathbf{[cho/vào\ Đối\ tượng\ B]} \ (\mathbf{Chi\ tiết\ C})$$
  - Ví dụ P2P: `Đại Gia Sài Gòn trả [-350 Tr.] cho Tỷ Phú Hà Thành (Tiền thuê Đà Nẵng)`
  - Ví dụ Đấu giá: `Đại Gia Sài Gòn nộp [-650 Tr.] vào Kho Bạc (Trúng đấu giá Cần Thơ)`
  - Ví dụ Thế chấp: `Đại Gia Sài Gòn thế chấp Bến Bạch Đằng, vay [+1.000 Tr.] từ Ngân Hàng`
  - Ví dụ Lương: `Đại Gia Sài Gòn nhận [+2.000 Tr.] tiền lương qua ô Khởi Hành`
- **Trích xuất module độc lập**: Tách toàn bộ logic biên dịch câu chữ từ `floating_numbers.tsx` (hiện 385 LOC) sang `src/client/ui/transaction_narrative.ts` để bảo tồn trần LOC <= 390 LOC (kỳ vọng ~290 LOC).

---

## 2. KHẮC PHỤC TRIỆT ĐỂ CÁC ĐIỂM MÙ TỪ PLAN-GRILLER (RECONCILIATION MATRIX)

| Mã Lỗi | Phát hiện từ Plan-Griller | Giải pháp thiết kế triệt để trong Plan cập nhật |
| :--- | :--- | :--- |
| **P1.1** | [Actor Inversion in M&A Buyout]: Bên bán (nạn nhân) nhận badge bị nói là "chi tiền thâu tóm bên mua". | Trong `ma_buyout`: kiểm tra `item.type === FloatingTextType.Reward` (hoặc tiền dương). Nếu là bên bán, sinh câu: `[Bên bán] nhận [X Tr.] bồi hoàn M&A từ [Bên mua] (Chuyển nhượng [Ô])`. Nếu là bên mua (penalty): `[Bên mua] chi [X Tr.] thâu tóm M&A từ [Bên bán] ([Ô])`. |
| **P1.2** | [Broken Lifecycle]: Bóc tách số tiền ngây thơ bằng `replace(/^[+-]/, '')` vỡ chuỗi phức tạp; thiếu property `taxName`. | Cung cấp hàm regex `extractCleanAmount(item.text)`; phân giải tên thuế và tên ô đất an toàn từ `item.title` và `resolveCellName(item.cellIndex)`. |
| **P1.3** | [Contract Regression]: Sửa `82vw` thành `84vw` làm gãy TC-193.04; bỏ `resolveFriendlyReason` làm gãy TC-191/193; pill thiếu dấu làm gãy TC-117.14. | • Giữ nguyên `max-w-[82vw] sm:max-w-[340px]` trên `FloatingBadge`.<br>• Giữ `export function resolveFriendlyReason` làm wrapper tương thích ngược 100%.<br>• `<span data-testid="floating-amount-pill">` giữ nguyên `{item.text}` đầy đủ dấu và styling emerald/rose. |
| **P2.1** | [Layout Overflow]: `span block` cho chi tiết ép sinh dòng thứ 3 trên mobile 360px. | Dùng `line-clamp-2 break-words` và render `detail` dạng inline text kèm ngoặc đơn: `{narrative.detail && <span className="font-normal text-slate-500"> {narrative.detail}</span>}`. |
| **P2.2** | [Pronoun Indecision]: Lưỡng lự giữa "Bạn" và tên người chơi làm mất tính xác định test. | Quyết định dứt khoát: 100% các trường hợp dùng `formatShortPlayerName(player.name)`, KHÔNG dùng "Bạn". |
| **P2.3** | [Divergent Type Union]: Bỏ sót `audit_jail` khiến người vào tù bị rơi vào fallback `general`. | Bổ sung case `audit_jail`: Category `TRẠM KIỂM TOÁN`, icon `🚨`, verb `vào`, target `Trạm Kiểm Toán`, detail `(Vi phạm thuế)`. |
| **P2.4** | [Missing JSX Init]: Snippet thiếu dòng khởi tạo `narrative`. | Khai báo rõ ràng: `const narrative = resolveTransactionNarrative(item, player, playersInfo);`. |
| **P2.5** | [LOC Ceiling]: Living test TC-191.16 áp trần chặt `<= 390 LOC` (thay vì 400). | Ghi nhận chính xác trần `<= 390 LOC`; mục tiêu sau trích xuất là `~290-310 LOC`. |

---

## 3. KIỂM TOÁN TÁC ĐỘNG & NGÂN SÁCH LOC (PRE-CODING DELTA & LOC BUDGET)

| Tệp mục tiêu | Tầng | Hiện tại | Delta dự kiến | Kỳ vọng sau sửa | Trần quy định | Đánh giá ngân sách |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/ui/transaction_narrative.ts` | TIER 1 (Domain Logic/Helper) | 0 | +210 | 210 | <= 280 LOC (Trần Tier 1 tối đa: 400) | ✅ An toàn tuyệt đối |
| `src/client/ui/floating_numbers.tsx` | TIER 2 (UI Component) | 385 | -90 | 295 | 390 | ✅ Giảm mạnh, an toàn dưới trần 390 LOC |
| `tests/contracts/imp194_natural_narrative_floating_badges.test.ts` | Test Suite | 0 | +380 | 380 | 600 | ✅ Đạt chuẩn Living Test |

---

## 4. CHI TIẾT THIẾT KẾ KỸ THUẬT (TECHNICAL DESIGN)

### 4.1. Cấu trúc dữ liệu DTO: `TransactionNarrative`
```ts
export interface TransactionNarrative {
  readonly category: string;     // Tiêu đề danh mục: "ĐẤU GIÁ", "TIỀN THUÊ BĐS", "KHO BẠC", "NGÂN HÀNG"...
  readonly icon: string;         // Icon trực quan: "🔨", "🏠", "🏛️", "🏦", "🚩", "📊", "🚨"...
  readonly subject: string;      // Chủ thể A: formatShortPlayerName(player.name)
  readonly verb: string;         // Động từ hành động: "nộp", "trả cho", "vay", "thu từ", "thanh toán", "nhận", "chi", "vào"
  readonly amountText: string;   // Số tiền sạch: "650 Tr." (hoặc giữ item.text cho pill)
  readonly isPositive: boolean;  // Phục vụ styling: true = emerald (tiền vào), false = rose (tiền ra)
  readonly target: string;       // Đối tượng nhận/nguồn tiền: "vào Kho Bạc", "Tỷ Phú Hà Thành", "từ Ngân Hàng"...
  readonly detail?: string;      // Chi tiết bổ sung: "(Trúng đấu giá Cần Thơ - Cái Răng)", "(Tiền thuê ô Đà Nẵng)"...
}
```

### 4.2. Cỗ máy biên dịch ngữ nghĩa: `resolveTransactionNarrative` trong `transaction_narrative.ts`
Bao trọn 4 mô hình:
1. **P2P (`rent_pay`, `rent_receive`, `ma_buyout`)**:
   - `rent_pay`: `subject = player.name`, `verb = 'trả'`, `target = 'cho ' + targetName`, `detail = '(Tiền thuê ' + cellName + ')'`.
   - `rent_receive`: `subject = player.name`, `verb = 'thu'`, `target = 'từ ' + targetName`, `detail = '(Tiền thuê ' + cellName + ')'`.
   - `ma_buyout` (Bên mua, penalty): `subject = player.name`, `verb = 'chi'`, `target = 'thâu tóm M&A từ ' + targetName`, `detail = '(' + cellName + ')'`.
   - `ma_buyout` (Bên bán, reward): `subject = player.name`, `verb = 'nhận'`, `target = 'bồi hoàn M&A từ ' + targetName`, `detail = '(Chuyển nhượng ' + cellName + ')'`.
2. **Kho Bạc (`auction_win`, `tax`, `bail`, `stimulus`)**:
   - `auction_win`: `category = 'ĐẤU GIÁ BẤT ĐỘNG SẢN'`, `icon = '🔨'`, `verb = 'nộp'`, `target = 'vào Kho Bạc'`, `detail = '(Trúng đấu giá ' + cellName + ')'`.
   - `tax`: `category = 'KHO BẠC NHÀ NƯỚC'`, `icon = '🏛️'`, `verb = 'nộp'`, `target = 'vào Kho Bạc'`, `detail = '(' + cleanTaxTitle + ')'`.
   - `bail`: `category = 'BẢO LÃNH KIỂM TOÁN'`, `icon = '🚨'`, `verb = 'nộp'`, `target = 'vào Kho Bạc'`, `detail = '(Rời Trạm Kiểm Toán)'`.
   - `stimulus`: `category = 'TRỢ CẤP QUỸ KHO BẠC'`, `icon = '📈'`, `verb = 'nhận'`, `target = 'từ Quỹ Kho Bạc'`.
3. **Ngân Hàng (`buy`, `upgrade`, `mortgage`, `unmortgage`)**:
   - `buy`: `category = 'MUA ĐẤT ĐẦU TƯ'`, `icon = '🏷️'`, `verb = 'thanh toán'`, `target = 'mua ' + cellName + ' từ Ngân Hàng'`.
   - `upgrade`: `category = 'NÂNG CẤP CÔNG TRÌNH'`, `icon = '🏗️'`, `verb = 'thanh toán'`, `target = 'nâng cấp nhà ' + cellName`.
   - `mortgage`: `category = 'TÍN DỤNG NGÂN HÀNG'`, `icon = '🏦'`, `verb = 'vay'`, `target = 'từ Ngân Hàng'`, `detail = '(Thế chấp ' + cellName + ')'`.
   - `unmortgage`: `category = 'GIẢI CHẤP BẤT ĐỘNG SẢN'`, `icon = '🔓'`, `verb = 'trả'`, `target = 'giải chấp ' + cellName + ' (Gồm 10% phí Kho Bạc)'`.
4. **Thu Nhập, Đầu Tư & Đặc Thù (`salary`, `hose`, `teleport`, `audit_jail`, `general`)**:
   - `salary`: `category = 'LƯƠNG KHỞI HÀNH'`, `icon = '🚩'`, `verb = 'nhận'`, `target = 'tiền lương qua ô Khởi Hành'`.
   - `hose`: `category = 'THỊ TRƯỜNG CHỨNG KHOÁN'`, `icon = '📊'`, `verb = isPositive ? 'nhận cổ tức' : 'đầu tư cổ phiếu'`, `target = 'sàn HOSE'`.
   - `teleport`: `category = 'DỊCH CHUYỂN BẾN BÃI'`, `icon = '✈️'`, `verb = 'thanh toán'`, `target = 'vé dịch chuyển'`.
   - `audit_jail`: `category = 'TRẠM KIỂM TOÁN'`, `icon = '🚨'`, `verb = 'vào'`, `target = 'Trạm Kiểm Toán'`, `detail = '(Bị kiểm toán thuế)'`.
   - Fallback `general`: `verb = isPositive ? 'nhận' : 'thanh toán'`, `target = item.title || 'giao dịch tài chính'`.

### 4.3. Bố cục trực quan của `FloatingBadge` trong `floating_numbers.tsx`
```tsx
export function FloatingBadge({ item }: { readonly item: FloatingTextItem }): React.ReactElement {
  const isSSR = typeof window === 'undefined';
  const storePlayersInfo = useGameStore((state) => state.playersInfo);
  const playersInfo = isSSR ? useGameStore.getState().playersInfo : storePlayersInfo;
  const player = playersInfo[item.playerId];

  if (
    item.actionType === 'monopoly' ||
    item.actionType === 'debt_relief' ||
    item.actionType === 'chance' ||
    item.actionType === 'market'
  ) {
    return <MilestoneBanner item={item} />;
  }

  // Khởi tạo đối tượng câu văn ngữ nghĩa chuẩn mực
  const narrative = resolveTransactionNarrative(item, player, playersInfo);

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="contextual-transaction-badge"
      className="pointer-events-none flex flex-col gap-1.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl border-2 border-slate-900 bg-[#FFFDF8] select-none shadow-[0_3px_0_0_#0f172a] animate-in fade-in duration-200 max-w-[82vw] sm:max-w-[340px]"
    >
      {/* Hàng 1: Header định danh danh mục */}
      <div className="flex items-center justify-between gap-1.5 border-b border-slate-200/80 pb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm shrink-0" aria-hidden="true">{narrative.icon}</span>
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500 truncate">
            {narrative.category}
          </span>
        </div>
        {player && (
          <span
            className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full text-white shadow-xs shrink-0 truncate max-w-[120px]"
            style={{ backgroundColor: player.tokenColor || '#64748B' }}
          >
            {formatShortPlayerName(player.name)}
          </span>
        )}
      </div>

      {/* Hàng 2: Câu văn tự nhiên hoàn chỉnh */}
      <div className="text-xs sm:text-[13px] font-semibold text-slate-800 text-left leading-snug break-words line-clamp-2">
        <span className="font-bold text-slate-900">{narrative.subject}</span>{' '}
        <span className="text-slate-600 font-medium">{narrative.verb}</span>{' '}
        {/* Giữ nguyên item.text và title={item.text} để đảm bảo 100% assertions HTML trong TC-117.14 và TC-123.16 tiếp tục pass */}
        <span
          data-testid="floating-amount-pill"
          title={item.text}
          className={clsx(
            "px-1.5 py-0.5 rounded-lg text-xs font-extrabold tabular-nums border inline-block",
            narrative.isPositive
              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
              : "bg-rose-50 text-rose-700 border-rose-300"
          )}
        >
          {item.text}
        </span>{' '}
        <span className="font-bold text-slate-800">{narrative.target}</span>
        {narrative.detail && (
          <span className="font-normal text-slate-500"> {narrative.detail}</span>
        )}
      </div>
    </div>
  );
}
```

---

## 5. MA TRẬN KIỂM THỬ TRẠM 1 (STATION 1 CONTRACT TEST MATRIX)

Tệp kiểm thử: `tests/contracts/imp194_natural_narrative_floating_badges.test.ts` (18 atomic tests gắn nhãn `[TC-194.xx/MSS]`):
1. **[TC-194.01] Interface `TransactionNarrative`**: Kiểm tra đủ 8 trường có kiểu dữ liệu chuẩn xác.
2. **[TC-194.02] P2P Rent Pay**: `[A] trả [-350 Tr.] cho [B] (Tiền thuê Đà Nẵng)` khi `actionType === 'rent_pay'`.
3. **[TC-194.03] P2P Rent Receive**: `[B] thu [+350 Tr.] từ [A] (Tiền thuê Đà Nẵng)` khi `actionType === 'rent_receive'`.
4. **[TC-194.04] Auction Win**: `[A] nộp [-650 Tr.] vào Kho Bạc (Trúng đấu giá Cần Thơ)` khi `actionType === 'auction_win'`.
5. **[TC-194.05] Tax**: `[A] nộp [-500 Tr.] Lệ Phí Đất Đai vào Kho Bạc` khi `actionType === 'tax'`.
6. **[TC-194.06] Bail**: `[A] nộp [-500 Tr.] bảo lãnh kiểm toán vào Kho Bạc` khi `actionType === 'bail'`.
7. **[TC-194.07] Mortgage**: `[A] thế chấp [Tên Ô], vay [+800 Tr.] từ Ngân Hàng` khi `actionType === 'mortgage'`.
8. **[TC-194.08] Unmortgage**: `[A] trả [-880 Tr.] giải chấp [Tên Ô] (Gồm 10% phí Kho Bạc)` khi `actionType === 'unmortgage'`.
9. **[TC-194.09] Buy**: `[A] thanh toán [-1.000 Tr.] mua đất [Tên Ô] từ Ngân Hàng` khi `actionType === 'buy'`.
10. **[TC-194.10] Upgrade**: `[A] thanh toán [-600 Tr.] nâng cấp nhà [Tên Ô]` khi `actionType === 'upgrade'`.
11. **[TC-194.11] Salary**: `[A] nhận [+2.000 Tr.] tiền lương qua ô Khởi Hành` khi `actionType === 'salary'`.
12. **[TC-194.12] HOSE**: `[A] nhận [+450 Tr.] cổ tức từ sàn HOSE` (hoặc đầu tư) khi `actionType === 'hose'`.
13. **[TC-194.13] M&A Buyout Đối Xứng (Anti-Inversion)**: Phân định rõ bên mua `chi` và bên bán `nhận bồi hoàn`.
14. **[TC-194.14] Trạm Kiểm Toán (`audit_jail`)**: `[A] vào Trạm Kiểm Toán` chuẩn xác, không bị rơi vào `general`.
15. **[TC-194.15] Fallback an toàn & Trích xuất số tiền**: Chuỗi văn bản phức tạp hoặc lỗi WS vẫn sinh ra câu có nghĩa.
16. **[TC-194.16] Giới hạn độ dài**: 100% câu văn sinh ra có độ dài $\le 95$ ký tự, `line-clamp-2` không bị tràn.
17. **[TC-194.17] Impeccable Anti-patterns**: Quét 4 anti-patterns trên `floating_numbers.tsx` và `transaction_narrative.ts` đạt 0 vi phạm.
18. **[TC-194.18] Ngân sách LOC & Bảo tồn Hợp đồng cũ**: `floating_numbers.tsx` <= 390 LOC, `transaction_narrative.ts` <= 280 LOC; bảo tồn `max-w-[82vw]` và `resolveFriendlyReason`.

---

## 6. TECH DEBT & QUY TRÌNH THỰC THI 3 TRẠM (STATION PIPELINE)

### 6.1. Ghi nhận Nợ Kỹ Thuật (Tech Debt Ledger)
- **TD-IMP194.01 (isSSR Hook Pattern)**: Pattern `isSSR ? useGameStore.getState().playersInfo : storePlayersInfo` tồn tại từ trước trong `floating_numbers.tsx`. Dù không vi phạm số lượng lượt gọi Hook, cách thức này nên được chuẩn hóa sang custom hook `useSafeStoreSelector` trong đợt dọn dẹp kỹ thuật tiếp theo.

### 6.2. Quy trình thực thi 3 Trạm
1. **Trạm 1 (Station 1 - RED)**: `qa-tester` viết `tests/contracts/imp194_natural_narrative_floating_badges.test.ts` và chứng minh thất bại (RED).
2. **Trạm 2 (Station 2 - GREEN)**: `implementer` tạo `src/client/ui/transaction_narrative.ts` và cập nhật `src/client/ui/floating_numbers.tsx` để vượt qua 100% bài test.
3. **Trạm 2.5 (Scout Audit)**: `scout` quét toàn diện 100% tệp trên đĩa kiểm tra 5 Universal Defect Archetypes.
4. **Trạm 3 (Station 3 - Review)**: `spec-reviewer` và `ui-craft-reviewer` nghiệm thu độc lập trên đĩa và chụp ảnh UAT Edge CDP.
