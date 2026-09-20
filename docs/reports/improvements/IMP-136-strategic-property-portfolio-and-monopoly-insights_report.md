# [IMP-136B] BÁO CÁO HOÀN TẤT CẢI TIẾN UX DANH MỤC BẤT ĐỘNG SẢN: BẢNG ĐIỀU KHIỂN CHIẾN LƯỢC & MẢNH GHÉP CÒN THIẾU

> **Mã cải tiến**: IMP-136B (Kế thừa IMP-133, IMP-136)  
> **Trạng thái**: 🟢 **Hoàn Tất (Trạm 3 Verified)**  
> **Traceability**: `[UC-IMP136]`, `[TC-IMP136.01..TC-IMP136.12]`, Gotcha #183  
> **Thị trường mục tiêu**: Việt Nam (Toàn bộ giao diện & chú thích bằng tiếng Việt)  

---

## 1. TỔNG QUAN VẤN ĐỀ & MỤC TIÊU CẢI TIẾN

### 1.1. Hiện trạng trước cải tiến
1. **Bẫy Ngộ Nhận Quyền Xây Dựng**:
   - Khi mở `PropertyPortfolioModal`, các ô đất chưa đủ bộ 3/3 đều hiển thị nút xây mờ kèm dòng chữ *"Chờ đến lượt xây dựng"*.
   - Người chơi ngộ nhận rằng cứ đến lượt mình là sẽ được xây nhà, trong khi luật chơi bắt buộc phải gom đủ trọn bộ màu Monopoly mới được phép nâng cấp.
2. **Kê Khai Tĩnh & Mù Thông Tin Chiến Lược**:
   - Giao diện danh mục chỉ đơn thuần liệt kê các ô người chơi đang sở hữu mà không cung cấp insight:
     - Nhóm màu này còn thiếu những ô nào?
     - Ô còn thiếu là đất trống sàn F1 hay đã bị đối thủ nào mua?
     - Không có nút tắt để mở ngay đàm phán P2P thâu tóm ô còn thiếu.
3. **Tràn Filter Bar Trên Thiết Bị Di Động**:
   - Thanh lọc phân loại cũ chưa hỗ trợ phân loại theo mức độ hoàn thiện độc quyền và có nguy cơ tràn viền trên màn hình hẹp (< 390px).
   - Khi người chơi chưa sở hữu BĐS nào (`ownedProperties.length === 0`), filter bar vẫn render tab "Đang Thế Chấp" làm rối rắm giao diện.

### 1.2. Kết quả đạt được sau cải tiến
- **Module phân tích độc quyền độc lập** `portfolio_monopoly_analytics.ts`: Quét toàn diện 8 nhóm màu BĐS, 4 ga tàu/cảng biển và 2 trạm tiện ích.
- **Khối "Mảnh Ghép Còn Thiếu"** (`data-testid="property-missing-pieces"`):
  - Nhận diện đất trống sàn F1 với nhãn `'Đất trống'` kèm giá niêm yết và nút **`[🔍 Xem Ô]`**.
  - Nhận diện ô đã có chủ với tên đối thủ, màu đại diện token và nút **`[🤝 Đàm Phán]`** mở thẳng modal P2P Trade.
- **Huy hiệu vinh danh** `👑 Độc Quyền Trọn Bộ` khi đã đủ bộ màu.
- **Triệt tiêu bẫy ngộ nhận**: Nút xây hiển thị rõ ràng `'🔒 Cần sở hữu trọn bộ màu trước khi nâng cấp'`. Chỉ khi đã có Monopoly nhưng chưa đến lượt mới hiển thị `'Chờ đến lượt xây dựng'` (bảo toàn hợp đồng `TC-IMP133.18`).
- **Thanh Filter Bar đa nền tảng**: Bổ sung tab **`Sắp Đủ Bộ 🔥`** ($\ge 50\%$ tiến độ), cuộn ngang `overflow-x-auto whitespace-nowrap`, ẩn sạch khi người chơi sở hữu 0 BĐS.

---

## 2. KIẾN TRÚC & MÃ NGUỒN THAY ĐỔI

```
[Game Store / Board Config]
           │
           ▼
[portfolio_monopoly_analytics.ts]  <-- Phân tích độc quyền, mảnh ghép thiếu, chủ quyền F1/Đối thủ
           │
           ▼
[PropertyPortfolioModal.tsx]       <-- Render Card BĐS, Missing Pieces Chip, Tab "Sắp Đủ Bộ 🔥"
      ┌────┴────┐
      ▼         ▼
[🤝 Đàm Phán]  [🔍 Xem Ô]
      │         │
      ▼         ▼
 [TradeModal] [DeedModal + Focus Camera]
```

### 2.1. Tệp tạo mới
- [`src/client/ui/modals/portfolio_monopoly_analytics.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/portfolio_monopoly_analytics.ts) (112 LOC):
  - Hàm thuần `analyzePropertyMonopolyInsight(params)`
  - Interface `MonopolyGroupInsight`, `MissingPieceInfo`, `AnalyzeMonopolyParams`

### 2.2. Tệp chỉnh sửa
- [`src/client/ui/modals/modal_helpers.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/modal_helpers.ts):
  - Tái cấu trúc thứ tự thẩm định trong `checkPropertyUpgradeEligibility`: Thẩm định tính hợp lệ ô, cấp độ tối đa và `hasMonopoly` TRƯỚC điều kiện `isMyTurn` và `turnPhase`.
- [`src/client/ui/modals/property_portfolio_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/property_portfolio_modal.tsx) (461 LOC, dưới trần 500 LOC cho UI component):
  - Tích hợp `analyzePropertyMonopolyInsight`.
  - Khối `data-testid="property-missing-pieces"` và nút `data-testid="quick-trade-btn-{id}"`, `data-testid="view-vacant-cell-btn-{id}"`.
  - Tab `Sắp Đủ Bộ 🔥` và thanh filter bar có điều kiện `ownedProperties.length > 0`.
  - Touch targets `min-h-[40px] sm:min-h-[44px]` đạt chuẩn WCAG AA và mobile compact.
- [`src/client/ui/modals/modal_host.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/modal_host.tsx):
  - Truyền `allPlayers={playersInfo}`, `onQuickTrade`, và `onViewVacantCell` cho `PropertyPortfolioModal`.

---

## 3. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG & BẢO TOÀN HỢP ĐỒNG

| Bộ Kiểm Thử | Số Lượng Test | Kết Quả | Ghi Chú |
|---|---|---|---|
| `tests/client/imp136_portfolio_monopoly_insights.test.ts` | 12 tests | 🟢 **12/12 PASS** | Bộ test hợp đồng mới bao quát 4 Facets |
| `tests/client/imp133_camera_sticky_focus_and_quick_build.test.ts` | 27 tests | 🟢 **27/27 PASS** | Zero regression trên logic 1-Click Quick Build |
| `tests/client/mobile_compact_hud_and_modals.test.ts` | 24 tests | 🟢 **24/24 PASS** | Zero regression trên touch target di động và empty state |
| `npm run lint:ui` | 160 files | 🟢 **0 vi phạm** | 0 anti-patterns Impeccable |
| `npx tsc --noEmit` | Toàn repo | 🟢 **Exit code 0** | Không có lỗi biên dịch TypeScript |
| Docker Container `vtcoon-vtcoon-1` | Healthcheck | 🟢 **Up (healthy)** | Build SSR và static asset hoàn tất, curl 200 OK |

---

## 4. QUY TẮC ĐƯỢC GHI NHẬN (GOTCHA #183)

Đã cập nhật vào [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md):
- **Gotcha #183**: `[UI/PORTFOLIO] Bất Biến Phân Tích Độc Quyền, Mảnh Ghép Còn Thiếu & Triệt Tiêu Ngộ Nhận Quyền Xây Dựng (IMP-136)`
  - Bắt buộc kiểm tra `hasMonopoly` trước `isMyTurn` trong `checkPropertyUpgradeEligibility`.
  - Tách biệt module `portfolio_monopoly_analytics.ts` phục vụ phân tích nhóm màu và phân khúc hạ tầng.
  - Cầu nối 1-click Quick Trade sang `TradeModal` chuẩn 5 trường schema.
  - Cuộn ngang filter bar và ẩn khi không sở hữu BĐS nào.
