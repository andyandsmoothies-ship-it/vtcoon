# [REPORT] IMP-224: Dynamic Depth of Field — Tilt-Shift Macro Điện Ảnh Theo Camera State

## 1. THÔNG TIN TỔNG QUAN
- **Mã Ticket**: IMP-224
- **Tiêu Đề**: Dynamic Depth of Field (DoF): Tilt-Shift Macro Điện Ảnh Theo Camera State.
- **Phân Hạng**: **Tier 2 (Full Rigor)** — R3F Post-Processing Depth of Field, Pure State Coordination Functions, Dynamic Focal Vector Targeting, Optical Invariants.
- **Trạng Thái**: ✅ **COMPLETE** (HOÀN TẤT 100% QUY TRÌNH 3 TRẠM).
- **Căn Cứ Kế Hoạch & Bằng Chứng**:
  - Kế hoạch phê duyệt v3: [`docs/plans/improvements/IMP-224-dynamic-dof-camera-state_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-224-dynamic-dof-camera-state_plan.md)
  - Báo cáo thẩm định kế hoạch: [`.agents/audit/PLAN_AUDIT_IMP224.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP224.md)
  - Snapshot bằng chứng vật lý: [`.agents/evidence/imp-224_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp-224_snapshot.json) (`executed: true`, 16/16 tests passed)
- **Hội Đồng Độc Lập Trạm 3**:
  - `spec-reviewer`: **APPROVED** (100% đối soát tam giác vật lý, kiểm chứng triệt để 5 Facets, bảo toàn Gotcha #54, #16, #17).
  - `code-reviewer`: **APPROVED** (Đạt chuẩn Anti-Slop, Zero Dirty Casts, Wire Gate kết nối 100% từ Zustand đến WebGL shader, ngân sách LOC tuân thủ nghiêm ngặt).
  - `game-3d-visual-critic`: **APPROVED (9.5 / 10 — disposition: ship)** (Đạt chuẩn game thương mại AAA; khen ngợi hiệu ứng sa bàn đồ chơi thủ công Townscaper khi soi ô đất và không gian kịch tính đấu giá Sotheby's).
  - `scout` (Trạm 2.5): **PASS 100%** sau vòng Active Remediation (sửa triệt để Rules of Hooks, chặn rò rỉ DoF `game_over`, memoize `Vector3` chống GC pressure).

---

## 2. NGUYÊN NHÂN CỐT LÕI & GIẢI PHÁP QUANG HỌC

### 2.1. Hiện Trạng Trước Cải Tiến
- **Nghịch lý tiêu cự và vi phạm Gotcha #54**: Trước đây, hiệu ứng DoF nếu bật tĩnh ở góc nhìn toàn cảnh `overview` sẽ làm mờ rìa bàn cờ, che khuất tên phố và giá thuê của các ô đất ở biên (Macro Blur Fallacy).
- **Lệch mặt phẳng nét 7.63m do khóa cứng tâm bàn cờ**: Khi camera zoom vào một ô đất cụ thể (ví dụ ô 10 ở biên bàn cờ), việc khóa cứng `dofTarget` tại `[0, 0, 0]` khiến mặt phẳng nét rơi vào khoảng đất trống trung tâm, làm ô đất khảo sát bị mờ nhòe.
- **Dải nét quá rộng vô hiệu hóa chiều sâu**: Cấu hình cũ `focusRange: 55m` rộng gấp 3 lần bàn cờ 18m, khiến toàn bộ bàn cờ đều nét và triệt tiêu hoàn toàn hiệu ứng Tilt-Shift sa bàn.

### 2.2. Kiến Trúc Điều Phối Quang Học

```
[Zustand GameStore]
  activeModal · cameraFocusCell · isRolling · activePawnAnimation · modalPayload
         │
[GameCanvas — src/client/game_canvas.tsx]
  ├── calculateDofConfig(...)  ➔  { enableDof, bokehScale, focusRange }
  └── resolveDofTarget(...)    ➔  [tx, ty, tz]
         │
[PostProcessingPipeline — src/client/3d/post_processing_pipeline.tsx]
  ├── isAuctionActive={isAuctionActive}  (Bảo toàn ánh sáng đấu giá IMP-223)
  ├── targetVector = useMemo(Vector3)    (Triệt tiêu GC churn và frame drops)
  └── <DepthOfField
        target={targetVector}            (Bám đúng ô cờ hoặc bục đấu giá)
        focusRange={dofFocusRange}       (9.0m sa bàn / 6.0m đấu giá)
        bokehScale={resolvedBokehScale}  (0.28 Townscaper / 0.45 Sotheby's)
      />
```

---

## 3. BA TRỌNG TÂM QUANG HỌC ĐÃ HOÀN TẤT VẬT LÝ

### 3.1. Overview & Motion Gate — Bảo Toàn Gotcha #54
- Khi gieo xúc xắc (`isRolling = true`) hoặc quân cờ di chuyển (`isPawnAnimating = true`), DoF ngắt tức thì (`enableDof: false`, `bokehScale: 0.0`).
- Ở chế độ tổng quan bàn cờ không có modal hoặc khảo sát ô, DoF tắt 100%, bảo vệ độ rõ nét tối đa cho 40 ô đất, 28 tranh di sản bản địa và biểu giá niêm yết.

### 3.2. Tile Focus & Dynamic Focal Target — Sa Bàn Townscaper
- Khi mở modal thẻ cờ (Deed, Portfolio) hoặc click khảo sát ô đất (`cameraFocusCell`), kích hoạt DoF nhẹ (`bokehScale: 0.28`, `focusRange: 9.0m`).
- Tiêu cự quang học bám chính xác tọa độ thực tế `cellPosition(targetCell)`, giúp ô đất khảo sát và công trình xây dựng (C1–C3) nét tinh xảo, trong khi các ô cờ đối diện và viền bàn cờ mờ nhẹ tự nhiên như mô hình đồ chơi thu nhỏ.

### 3.3. Auction Theatrical Focus — Sàn Đấu Giá Sotheby's
- Khi mở sàn đấu giá (`activeModal === 'auction'`), áp dụng profile kịch nghệ (`bokehScale: 0.45`, `focusRange: 6.0m`).
- Tiêu cự khóa chặt bục đấu giá trung tâm `[0, 3.0, 0]`, kết hợp hài hòa với Champagne Bloom (ngưỡng 1.2) và Focus Vignette (tối góc 0.35) từ IMP-223 để tạo quầng sáng vàng kim rực rỡ và chiều sâu điện ảnh.

### 3.4. GameOver Guard — Chống Rò Rỉ Vinh Danh
- Khi ván cờ kết thúc (`activeModal === 'game_over'`), cưỡng chế tắt DoF (`DOF_PROFILES.off`) và đưa target về `[0, 0, 0]`, triệt tiêu hoàn toàn lỗi rò rỉ ô cờ cuối làm mờ bảng vàng vinh danh.

---

## 4. KẾT QUẢ KIỂM THỬ & NGÂN SÁCH ĐĨA CỨNG

### 4.1. Hợp Đồng Kiểm Thử Vitest
- **Tệp kiểm thử**: [`tests/client/dynamic_dof.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/dynamic_dof.test.ts) (201 LOC).
- **16 atomic contract tests** bao quát Ma Trận 5 Mặt (5-Facet Matrix) đạt **16/16 PASS (100%)**:
  * Facet 1: Overview & Motion — Tắt DoF khi gieo xúc xắc / di chuyển quân (`TC-224.01` đến `TC-224.04`).
  * Facet 2: Tile Focus — DoF nhẹ sa bàn và tiêu cự bám đúng ô cờ (`TC-224.05` đến `TC-224.08`).
  * Facet 3: Auction Focus — DoF điện ảnh trung tâm bục đấu giá (`TC-224.09` đến `TC-224.11`).
  * Facet 4: Defensive Guards & Pure Functions — Referential transparency và GameOver Guard (`TC-224.12` đến `TC-224.14`).
  * Facet 5: Backward Compatibility — Giữ mặc định `enableDof: false` và tối ưu hóa mobile (`TC-224.15` đến `TC-224.16`).
- **Kiểm thử hồi quy**: **78/78 tests PASS** trên toàn bộ 5 test suites đồ họa hậu kỳ liên quan.

### 4.2. Ngân Sách LOC & Chất Lượng Mã Nguồn
- `src/client/3d/post_processing_pipeline.tsx`: **295 LOC** (Trần Tier 2: $\le 500$ LOC) — Đạt chuẩn.
- `src/client/game_canvas.tsx`: **473 LOC** (Trần Tier 2: $\le 500$ LOC) — Đạt chuẩn.
- `tests/client/dynamic_dof.test.ts`: **201 LOC** (Trần Suite: $\le 600$ LOC) — Đạt chuẩn.
- **Typecheck & Linters**:
  * `tsc --noEmit`: 0 lỗi biên dịch.
  * `npm run lint:ui`: 0 violations trên 203 tệp client.
  * `npm run lint:slop`: 0 dirty casts trong toàn bộ các tệp scope IMP-224.

---

## 5. TÀI LIỆU HÓA & TRUY XUẤT MIỀN SSOT
- **Domain SSOT**: Đã ghi nhận Gotcha Invariant 17 (`Dynamic Depth of Field, Optical Focal Grounding & GameOver Guard`) vào [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md).
- **Sổ cái Epic**: Đã cập nhật mục `[IMP-224]` vào [`docs/epics/client_ui/_epic_ledger.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/epics/client_ui/_epic_ledger.md).
- **Bằng chứng thực thi**: Đã lưu tại [`.agents/evidence/imp-224_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp-224_snapshot.json).
