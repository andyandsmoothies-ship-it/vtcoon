# [IMP-136] Kế Hoạch Nâng Cấp UX Danh Mục BĐS: Bảng Điều Khiển Chiến Lược & Radar Mảnh Ghép Còn Thiếu (Strategic Property Portfolio & Monopoly Insights)

> **Mã Cải Tiến**: `IMP-136`  
> **Mức Độ**: 🟡 UI/UX & Strategic Decision Architecture  
> **Traceability**: `[UC-IMP136]`, `[TC-IMP136.01..TC-IMP136.25]`, Gotcha #179  

---

## 1. Mục Tiêu & Vấn Đề Cần Giải Quyết

### A. Vấn Đề Hiện Tại (Pain Points)
1. **Bảng kê khai tĩnh, thiếu thông tin chiến lược**: Người chơi sở hữu 8 BĐS (vd: 2 ô Hà Nội [2/3], 1 ô Cần Thơ [1/2]) nhưng không biết ô còn thiếu tên gì, số mấy, giá bao nhiêu.
2. **Không biết ai đang giữ mảnh ghép còn thiếu**: Không biết ô còn thiếu là đất trống sàn F1 hay đã bị đối thủ (Bot 1, người chơi khác) mua lại.
3. **Thiếu lối tắt hành động 1-click**: Muốn đàm phán mua ô còn thiếu phải đóng modal, tự tìm TradeModal, tự chọn đối tác rất rườm rà.
4. **Bẫy UX gây ngộ nhận nghiêm trọng ("Chờ đến lượt xây dựng")**: Các ô đất chưa đủ bộ 3/3 đều hiển thị nút xây mờ kèm chữ "Chờ đến lượt xây dựng", khiến người chơi tưởng rằng chỉ cần đến lượt mình là xây được, trong khi luật chơi bắt buộc phải đủ bộ màu mới được xây!

### B. Mục Tiêu Đạt Được
1. **Monopoly Radar & Missing Pieces Tracker**: Hiển thị rõ tiến độ nhóm màu (vd: `[2/3] Sắp đủ bộ!`), tên các ô còn thiếu và chủ sở hữu hiện tại (Đối thủ / Đất trống F1).
2. **1-Click Quick Trade Bridge**: Nút `[🤝 Đàm Phán]` ngay tại ô còn thiếu giúp mở thẳng `TradeModal` với đối tác đó.
3. **Triệt tiêu bẫy ngộ nhận nút xây**:
   - Chưa đủ bộ màu: `🔒 Cần đủ bộ X/Y để mở khóa xây` (kèm tên ô cần thâu tóm).
   - Đã đủ bộ màu nhưng chưa đến lượt: `⭐ Đã đủ bộ — Xây khi đến lượt`.
   - Đã đủ bộ & Đúng lượt đi: Nút màu vàng sáng rực `🏗️ Xây C{level} ({cost} Tr.)` 1-click xây ngay.
4. **Tab lọc chiến lược "Sắp Đủ Bộ 🔥"**: Cho phép lọc nhanh các nhóm màu đã có $\ge 50\%$ tiến độ để ưu tiên đàm phán.

---

## 2. Thiết Kế Kỹ Thuật

### A. Module Phân Tích Chiến Lược (`src/client/ui/modals/portfolio_monopoly_analytics.ts`)
- Xuất khẩu interface `MonopolyGroupInsight`:
  ```ts
  export interface MissingPieceInfo {
    readonly cellIndex: number;
    readonly name: string;
    readonly price: number;
    readonly ownerId: string | null;
    readonly ownerName?: string;
    readonly ownerTokenColor?: string;
    readonly isBot?: boolean;
    readonly isVacant: boolean;
  }

  export interface MonopolyGroupInsight {
    readonly colorGroup?: string;
    readonly groupName: string;
    readonly ribbonColor: string;
    readonly totalCells: number;
    readonly ownedCount: number;
    readonly isMonopoly: boolean;
    readonly isNearMonopoly: boolean; // >= 50% tiến độ (2/3, 1/2, 3/4)
    readonly missingPieces: readonly MissingPieceInfo[];
  }
  ```
- Xuất khẩu hàm `analyzePropertyMonopolyInsight`:
  - Nhận vào `cellIndex`, `ownedProperties`, `allPlayers`, `propertyStates`.
  - Tính toán tiến độ nhóm màu và trích xuất danh sách mảnh ghép còn thiếu cùng chủ quyền hiện tại.

### B. Tái cấu trúc Thẻ BĐS (`src/client/ui/modals/property_portfolio_modal.tsx`)
- Thêm prop `allPlayers?: Record<string, PlayerHudInfo>` (mặc định lấy từ store).
- Thêm prop `onQuickTrade?: (targetPlayerId: string, targetPropertyIndex: number) => void`.
- Bổ sung khối UI **"Mảnh Ghép Còn Thiếu" (Missing Pieces Section)** trong mỗi thẻ:
  - Nếu `!isMonopoly`: Hiển thị danh sách ô thiếu kèm chip chủ sở hữu và nút `[🤝 Đàm Phán]` hoặc `[🔍 Xem Ô]`.
  - Nếu `isMonopoly`: Hiển thị huy hiệu `👑 Độc Quyền Trọn Bộ`.
- Logic nút xây dựng:
  - Sửa điều kiện: Chỉ hiện "Chờ đến lượt xây dựng" khi `isMonopoly === true` mà chưa tới lượt.
  - Khi `isMonopoly === false`: Hiển thị `🔒 Cần đủ bộ ${totalCells}/${totalCells} để mở khóa`.

### C. Nâng cấp Filter Bar
- Bổ sung filter `'near_monopoly'` ("Sắp Đủ Bộ 🔥"):
  - `Tất Cả` | `Sắp Đủ Bộ 🔥` | `Có Thể Xây` | `Đang Thế Chấp`.

---

## 3. Kế Hoạch Kiểm Thử (3 Trạm)
- **Trạm 1 (RED Contract Test)**:
  - `tests/client/imp136_portfolio_monopoly_insights.test.ts` (>= 16 atomic tests):
    - Facet 1: Monopoly analytics correctness (missing pieces, vacant vs opponent owned).
    - Facet 2: Quick trade bridge payload & trigger.
    - Facet 3: Build button clarity invariants (elimination of misleading "Chờ đến lượt" when not monopoly).
    - Facet 4: Filter bar "Sắp Đủ Bộ 🔥" reactivity & responsive layout.
- **Trạm 2 (GREEN Implementation)**:
  - Triển khai `portfolio_monopoly_analytics.ts` và tích hợp vào `property_portfolio_modal.tsx`, `modal_host.tsx`.
- **Trạm 3 (Review & Verification)**:
  - Plan Grilling stress test.
  - `npm run lint:ui` sạch 0 vi phạm.
  - Chạy full test suites liên quan.
  - Ghi nhận Gotcha #179 vào `docs/domain/gotchas.md`.
  - Hot-rebuild Docker container.
