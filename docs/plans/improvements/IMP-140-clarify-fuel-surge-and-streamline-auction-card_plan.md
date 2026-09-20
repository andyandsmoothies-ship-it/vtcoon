# [KẾ HOẠCH KỸ THUẬT IMP-140]: Làm Rõ Thẻ Xăng Dầu MC_FUEL_SURGE & Tinh Giản Sàn Đấu Giá Đa Nền Tảng (Mobile & Desktop)

> **Mã số cải tiến:** IMP-140  
> **Phạm vi:** UI/UX Polish · Event Card Hero Stat & Metadata · Auction District Intelligence Grid  
> **Mục tiêu:** Xóa bỏ hoàn toàn ngộ nhận tài chính thẻ xăng dầu + Tinh giản giao diện đấu giá thích ứng hoàn hảo cho cả Mobile & Desktop.

---

## 1. BỐI CẢNH & PHÂN TÍCH VẤN ĐỀ

Từ phản hồi thực tế của người dùng qua ảnh chụp màn hình sàn đấu giá và thẻ sự kiện:
1. **Thẻ Sự Kiện "Biến Động Tỷ Giá & Giá Xăng Dầu" (`MC_FUEL_SURGE`)**:
   - Hiện tại hiển thị Hero Stat `PHỤ THU CƯỚC: +500 Tr.` với biến thể cảnh báo màu vàng.
   - Dòng mô tả dài dòng: *"Phụ thu thêm 500 Tr. cước logistics trong 2 vòng và tất cả người chơi lập tức nộp 500 Tr. phụ phí nhiên liệu..."*.
   - **Vấn đề**: Người chơi nhìn thấy nhãn `+500 Tr.` liền ngộ nhận là *mình được cộng tiền*, nhưng thực chất họ *bị trừ ngay 500 Tr.* và nếu giẫm vào ô Cảng/Ga của người khác thì bị thu cước cao hơn.
2. **Sàn Đấu Giá (`AuctionModal` / `AuctionDistrictCard`)**:
   - Banner `[Mách Nước Chiến Lược]` dạng đoạn văn dài chiếm ~50px chiều dọc, đẩy cụm nút đấu giá xuống thấp, có nguy cơ tràn viền hoặc che khuất trên mobile (< 667px).
   - Lưới hiển thị các ô trong phân khu (`renderCellChip`) đang fix cứng `grid-cols-2 sm:grid-cols-3`.
   - **Vấn đề**: Với các phân khu 3 ô (chiếm 6/8 nhóm màu: Hà Nội, TP.HCM, Đà Nẵng, Hải Phòng, Cần Thơ, Đông Nam Bộ), trên mobile hiển thị 2 cột khiến ô thứ 3 bị rớt xuống hàng 2 trơ trọi, vừa mất cân đối thẩm mỹ vừa chiếm gấp đôi chiều cao.

---

## 2. KIẾN TRÚC GIẢI PHÁP KỸ THUẬT

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           KIẾN TRÚC GIẢI PHÁP IMP-140                     │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┴─────────────────────────────┐
        ▼                                                           ▼
┌───────────────────────────────┐           ┌───────────────────────────────┐
│     1. THẺ XĂNG DẦU RÕ NGHĨA  │           │   2. SÀN ĐẤU GIÁ TINH GIẢN    │
│  (event_card_visuals / meta)  │           │    (auction_district_card)    │
├───────────────────────────────┤           ├───────────────────────────────┤
│ • Hero Stat: -500 Tr. (Đỏ)    │           │ • Gỡ bỏ Banner mô tả dài      │
│ • Nhãn: PHỤ PHÍ NHIÊN LIỆU    │           │ • Đưa Pill chiến lược lên Bar │
│ • Variant: negative (Rose)    │           │ • Tiết kiệm 50px chiều cao    │
│ • Mô tả: Nộp ngay 500 Tr. &   │           │ • data-testid hint bảo toàn   │
│   tăng cước giẫm ô Cảng/Ga    │           │ • Lưới dynamic theo số ô      │
└───────────────────────────────┘           └───────────────────────────────┘
                                                            │
                       ┌────────────────────────────────────┴────────────────────────────────────┐
                       ▼                                                                         ▼
         ┌───────────────────────────┐                                             ┌───────────────────────────┐
         │     MOBILE (< 640px)      │                                             │    DESKTOP (>= 640px)     │
         ├───────────────────────────┤                                             ├───────────────────────────┤
         │ • Nhóm 2 ô: grid-cols-2   │                                             │ • Nhóm 2 ô: grid-cols-2   │
         │ • Nhóm 3 ô: grid-cols-3   │ ➔ 1 Hàng ngang gọn gàng                     │ • Nhóm 3 ô: grid-cols-3   │
         │ • Nhóm 4 ô: grid-cols-2   │ ➔ Lưới 2x2 cân đối                          │ • Nhóm 4 ô: sm:grid-cols-4│
         │ • min-w-0 + truncate      │                                             │ • min-w-0 + truncate      │
         └───────────────────────────┘                                             └───────────────────────────┘
```

---

## 3. THIẾT KẾ CHI TIẾT CÁC THAY ĐỔI

### Trụ Cột 1: Làm Rõ Thẻ Xăng Dầu `MC_FUEL_SURGE`
- **Tệp sửa đổi:** `src/domain/event_card_metadata.ts`
  - Cập nhật `description`:
    `'Biến động giá xăng dầu: Mỗi người nộp 500 Tr. phụ phí nhiên liệu và cước vận tải tại ô hạ tầng tăng +500 Tr.'`
  - Cập nhật `effectDetail`:
    `'Mỗi người nộp ngay 500 Tr. phụ phí nhiên liệu (chủ ô Hạ tầng được nhận, hoặc nộp Kho Bạc nếu chưa ai sở hữu). Trong 2 vòng tới, cước giẫm vào ô Hạ tầng tăng thêm +500 Tr.'`
  - Cập nhật `destination`: `'Chủ sở hữu ô Hạ tầng giao thông / Kho Bạc'`
- **Tệp sửa đổi:** `src/client/ui/modals/event_card_visuals.ts`
  - Đổi Hero Stat:
    `[MarketCardId.MC_FUEL_SURGE]: { label: 'PHỤ PHÍ NHIÊN LIỆU', value: '-500 Tr.', variant: 'negative' }`

### Trụ Cột 2: Gỡ Bỏ Banner Mách Nước Chiến Lược & Tích Hợp Pill Lên Header
- **Tệp sửa đổi:** `src/client/ui/modals/auction_district_card.tsx`
  - Xóa bỏ khối banner `<div data-testid="auction-strategic-hint" className="...">...<p>{info.strategicHint.description}</p></div>` chiếm 50px.
  - Chuyển huy hiệu chiến lược `info.strategicHint.badgeText` lên thẳng Header phân khu cạnh tên phân khu:
    ```tsx
    <div className="flex items-center justify-between flex-wrap gap-1.5 border-b border-slate-200/80 pb-2">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="w-3 h-3 rounded-full border border-slate-800 shrink-0" style={{ backgroundColor: info.hexColor }} />
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 truncate">
          {info.districtName}
        </h4>
        <span
          data-testid="auction-strategic-hint"
          className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide border shrink-0 max-w-[140px] truncate sm:max-w-none ${toneTheme.badge}`}
        >
          {info.strategicHint.badgeText}
        </span>
      </div>
      <span className="text-[10px] font-mono font-bold text-slate-600 bg-white/80 px-2 py-0.5 rounded-full border border-slate-300 shrink-0 ml-auto">
        {info.ownedByMeCount}/{info.totalCells} Ô CỦA BẠN
      </span>
    </div>
    ```
  - **Bảo toàn Test Contract:** Giữ nguyên thuộc tính `data-testid="auction-strategic-hint"` và giữ nguyên toàn bộ chuỗi gốc của `info.strategicHint.badgeText` (bao gồm `'👑 CƠ HỘI ĐỘC QUYỀN'`) để bảo toàn tuyệt đối assertion `toContain('ĐỘC QUYỀN')` của test contract `TC-IMP138.25`.
  - **Khoanh vùng Scope An Toàn:** Tuyệt đối không can thiệp vào `title_deed_modal.tsx` (vốn hiển thị mức phụ thu cước +500 Tr. cho chủ cảng) và không sửa logic nghiệp vụ phân phối tiền tệ trong `market_card_handlers.ts`. Chỉ cập nhật giao diện thị giác ở `event_card_visuals.ts` và mô tả ở `event_card_metadata.ts`.

### Trụ Cột 3: Lưới Ô Đất Phân Khu Thích Ứng (Dynamic Responsive Grid)
- **Tệp sửa đổi:** `src/client/ui/modals/auction_district_card.tsx`
  - Phân loại lưới theo `info.totalCells`:
    ```tsx
    const gridColsClass =
      info.totalCells === 2
        ? 'grid-cols-2'
        : info.totalCells === 3
          ? 'grid-cols-3'
          : 'grid-cols-2 sm:grid-cols-4';
    ```
  - Áp dụng vào container: `<div className={`grid ${gridColsClass} gap-1.5`}>`
  - Bổ sung `min-w-0` và responsive font `text-[10px] sm:text-[11px]` trong `renderCellChip` để tránh vỡ chữ trên mobile < 390px.

---

## 4. MA TRẬN KIỂM THỬ HỢP ĐỒNG (4-FACET BEHAVIORAL MATRIX)

Tạo tệp kiểm thử mới: `tests/client/imp140_fuel_surge_and_auction_polish.test.ts`:
- **Facet 1 (Boundary & Safe Layout):**
  - Nhóm 2 ô (`info.totalCells === 2`) render với class `grid-cols-2`.
  - Nhóm 3 ô (`info.totalCells === 3`) render với class `grid-cols-3` trên cả mobile & desktop.
  - Nhóm 4 ô (`info.totalCells === 4`) render với class `grid-cols-2 sm:grid-cols-4`.
  - Không văng lỗi khi danh sách ô rỗng hoặc dữ liệu thiếu.
- **Facet 2 (Reactivity & Clear Visual Semantics):**
  - Thẻ `MC_FUEL_SURGE` hiển thị Hero Stat `-500 Tr.` với variant `negative` (màu rose/đỏ cảnh báo chi phí).
  - Nhãn hiển thị là `PHỤ PHÍ NHIÊN LIỆU` thay vì `PHỤ THU CƯỚC +500 Tr.`.
  - Metadata `MC_FUEL_SURGE` mô tả rõ ràng việc nộp 500 Tr. tức thì và tăng cước khi giẫm vào ô Cảng/Ga.
- **Facet 3 (Tactile Streamline & Zero Bloat):**
  - Khối `AuctionDistrictCard` chứa `data-testid="auction-strategic-hint"` ngay tại header phân khu.
  - Không còn chứa đoạn văn mô tả dài dòng (loại bỏ `<p>` mách nước).
  - Tổng chiều cao phân khu giảm tối thiểu 45-50px.
- **Facet 4 (Error Defense & Anti-Regression):**
  - 100% test suites liên quan (`imp138_auction_district_intelligence.test.ts`, `imp134_event_card_hero_stat_visual_overhaul.test.ts`) tương thích và PASS.
  - `npm run lint:ui` đạt 0 vi phạm (tuân thủ 4 anti-patterns).
