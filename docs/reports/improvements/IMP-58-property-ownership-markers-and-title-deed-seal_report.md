# [IMP-58] Báo Cáo Nghiệm Thu Đánh Dấu Quyền Sở Hữu Trên Sa Bàn 3D & Con Dấu Sổ Đỏ Chính Chủ 2D

- **Mã Ticket**: `IMP-58`
- **Ngày Hoàn Thành**: 2026-09-14
- **Trạng Thái**: SHIPPED & VERIFIED (Quy Trình 3 Trạm Đạt Chuẩn 100%)

---

## 1. Tóm Tắt Kết Quả Triển Khai

| Hạng Mục | Trước Cải Tiến | Sau Cải Tiến (IMP-58) | Lợi Ích Trải Nghiệm Người Chơi |
| :--- | :--- | :--- | :--- |
| **Nhận diện quyền sở hữu 3D** | Sa bàn 3D không có dấu hiệu phân biệt ô đã có chủ hay chưa nếu không zoom gần/click | Cắm cọc cờ sở hữu (`OwnershipMarkerInstances`) và viền thắt lưng chân đế (`OwnerBaseTrim`) theo đúng màu `tokenColor` của người chơi | Nhận diện chủ quyền tức thì từ góc nhìn toàn cảnh Overview không cần click kiểm tra |
| **Màu cờ sở hữu** | Mã cũ gán nhầm màu cờ theo màu nhóm quy hoạch đất (`groupColor`) | Lá cờ vải PBR (`FlagCloth`) lấy chuẩn xác màu đại diện của người chơi sở hữu (Đỏ Ruby, Xanh Dương, Xanh Lục, Vàng Hổ Phách) | Phân định rạch ròi lãnh thổ giữa 4 người chơi trên bàn cờ |
| **Chỉ báo cấp độ công trình trên cọc cờ** | Không có thông tin cấp độ công trình trên cọc cờ | Tích hợp vòng đai kim loại đồng thau hoàng gia (`TierIndicatorRings`) ngay trên thân cọc cờ (C0: 0 vòng, C1: 1 vòng, C2: 2 vòng, C3: 3 vòng vàng kim) | Đọc vị nhanh mức đầu tư và mức độ nguy hiểm của ô đất ngay từ khoảng cách xa |
| **Nhóm ô Hạ tầng & Tiện ích** | Hoàn toàn thiếu cọc cờ và viền nhận diện khi được mua | Áp dụng đầy đủ cọc cờ và viền đế cho cả 3 nhóm ô mua được (`Property`, `Railroad`, `Utility`) | Đảm bảo tính công bằng và nhất quán cho 100% tài sản mua được trên bàn cờ |
| **Rào chắn ô vô chủ & ô sự kiện** | Mã cũ từng render cờ cho ô Property chưa có chủ | Chỉ render khi ô đã có chủ (`isPurchasable && ownerColor && ownerColor.length > 0`); triệt tiêu cờ/viền trên 7 ô chức năng phi thương mại | Bàn cờ sạch sẽ, đúng logic tài sản |
| **Thẻ bài Sổ Đỏ 2D (TitleDeedModal)** | Thẻ Sổ Đỏ thiếu con dấu danh dự chứng nhận chủ quyền | Bổ sung huy hiệu cuộn giấy 📜 "CHỨNG NHẬN QUYỀN SỞ HỮU", tên `ownerName` và con dấu ngọc bích "SỔ ĐỎ CHÍNH CHỦ" khi `isOwned === true` | Tạo cảm xúc tự hào sở hữu tài sản danh giá chuẩn game tài phiệt |

---

## 2. Minh Chứng Kiểm Thử & Thẩm Định Độc Lập

1. **Bộ Kiểm Thử Hợp Đồng (`tests/contracts/property_ownership_marker_contract.test.ts`)**:
   - `37/37 PASSED` (100% GREEN trong 79ms).
   - Kiểm chứng trọn vẹn 4 khía cạnh ma trận hành vi:
     * *Facet 1*: Boundary & Unowned Invariant (ô vô chủ không có cờ/viền).
     * *Facet 2*: State Reactivity & Dynamic Color Mapping (P1..P4 màu cờ và viền khớp `tokenColor`).
     * *Facet 3*: Cross-Cell-Type Coverage (Property, Railroad, Utility có cờ khi mua; non-purchasable không có cờ).
     * *Facet 4*: 2D Title Deed Ownership Seal & `computeOwnerMap` trong `board_layout.tsx`.
2. **Kiểm Thử Hồi Quy Toàn Hệ Thống (`npm test`)**:
   - `161/161 Test Files PASSED` (100% GREEN).
   - `2.363/2.363 Tests PASSED` (0 failures).
3. **Thẩm Định Độc Lập Trạm 3**:
   - `spec-reviewer`: **APPROVED (PASS)** — Đối soát 100% yêu cầu người dùng, 0 scope drift.
   - `code-reviewer`: **PASS** — File LOC và CC <= 5 đạt chuẩn, 0 dirty casts, 0 silent error swallowing.
   - `game-3d-visual-critic`: **DISPOSITION: SHIP (8.8/10)** — Cọc cờ đồng thau PBR vát côn kết hợp dải viền chân đế kim loại đạt chuẩn toy diorama commercial cao cấp (Monopoly Plus/Retropoly).
   - `ui-craft-reviewer`: **DISPOSITION: SHIP** — 0 vi phạm 4 anti-patterns, đạt chuẩn Impeccable 2D tactile design, con dấu Sổ Đỏ sắc sảo sang trọng.
4. **Kiểm Tra Cổng Chất Lượng (`npm run gate:quick`)**:
   - `tsc -b`: 0 TypeScript errors.
   - `lint:ui`: 0 violations.
   - `lint:slop`: 0 violations.
   - `lint:dup`: 1.64% duplicated lines (ngân sách < 2.5%).
   - `lint:assets`: 0.33 MB / 2.5 MB (15/15 mô hình 3D đạt ngân sách).

---

## 3. Invariants Đã Được Lưu Vào `docs/domain/gotchas.md`

- **Gotcha #80**: `[3D/UI/OWNERSHIP] Bất Biến Nhận Diện Chủ Quyền Bàn Cờ 3D & Con Dấu Sổ Đỏ 2D (Tile Ownership Markers & Deed Seal Invariant - IMP-58)`:
  - Sa Bàn 3D: Cọc cờ `OwnershipMarkerInstances` và dải viền chân đế `OwnerBaseTrim` chỉ render khi `isPurchasable && ownerColor && ownerColor.length > 0`.
  - Loại trừ tuyệt đối 7 ô sự kiện phi thương mại (`Go`, `Jail`, `FreeParking`, `Audit`, `Chance`, `Market`, `Tax`, `TaxOrder`).
  - Cọc cờ vải lấy đúng `tokenColor` người chơi, thân cọc cờ đồng thau PBR tích hợp `TierIndicatorRings` C0-C3.
  - Phía Client: Hàm `computeOwnerMap` biến đổi nhanh `playersInfo` thành bản đồ màu sở hữu kèm hỗ trợ SSR fallback.
  - Giao diện 2D: Khối con dấu `ownership-certificate-seal` hiển thị danh dự khi `isOwned === true`, ẩn hoàn toàn khi `isOwned === false`.
