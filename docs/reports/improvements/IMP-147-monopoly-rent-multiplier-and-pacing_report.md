# Báo Cáo Nghiệm Thu IMP-147: Cân Bằng Hệ Số Cước Độc Quyền x1.5 Cho C3 & Tính Quyết Đoán Của Trận Đấu

## 1. Thông Tin Tổng Quan
- **Mã Ticket**: IMP-147
- **Tiêu đề**: Cân Bằng Hệ Số Cước Độc Quyền x1.5 Cho C3 & Tính Quyết Đoán Của Trận Đấu
- **Phân loại**: Tier 2 (Full Rigor - 3-Station Pipeline)
- **Tệp Thay Đổi**:
  * [`src/domain/property_rent.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_rent.ts) (+3 dòng)
  * [`src/client/ui/modals/title_deed_rent_table.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/title_deed_rent_table.tsx) (+9 dòng)
  * [`tests/domain/threat_forecaster.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/domain/threat_forecaster.test.ts) (+2 dòng đối soát SSOT)
  * [`tests/domain/imp147_monopoly_rent_multiplier.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/domain/imp147_monopoly_rent_multiplier.test.ts) (NEW: 18 atomic tests)
- **Bằng chứng kiểm thử**: [`.agents/evidence/imp-147_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp-147_snapshot.json)

---

## 2. Nhật Ký 3 Trạm (3-Station Pipeline Execution)

### Trạm 1: RED Contract Tests (`qa-tester`)
- Tạo bộ kiểm thử hợp đồng độc lập tại `tests/domain/imp147_monopoly_rent_multiplier.test.ts` bao phủ Ma trận 4 diện với 18 atomic tests:
  * **Facet 1 (Boundary)**: [TC-147.01..09] Kiểm tra đủ 8 nhóm màu cấp 3 x1.5 khi có monopoly.
  * **Facet 2 (Reactivity)**: [TC-147.10..11] Mất độc quyền do đối thủ sở hữu hoặc còn ô vô chủ -> cước giữ nguyên 1.0x rent3.
  * **Facet 3 (Disposal & Mortgage)**: [TC-147.12..13] Có ô bị thế chấp -> mất x1.5; chuộc xong -> kích hoạt lại x1.5.
  * **Facet 4 (Error Defense & Surge)**: [TC-147.14..18] C0-C2, Ga, Tiện ích miễn nhiễm; Late-game surge dồn hợp lệ ở vòng 20 (1.8x) và vòng 30 (2.25x); Bot Threat Horizon tính đúng cước độc quyền.
- **Chứng minh chuẩn đỏ (Adversarial Inversion)**: 13 FAILED, 5 PASSED / 18 tests. 100% fail do thiếu logic x1.5 C3 độc quyền trong `resolveRent`.

### Trạm 2: GREEN Implementation (`implementer`)
- Cập nhật tối thiểu mã nguồn tại `src/domain/property_rent.ts` (L99-L102):
  ```typescript
  if (lvl === 3 && deed.rent3 !== undefined) {
    rent = hasMonopoly(ownerId, cellIndex, registry, stateMap) ? Math.floor(deed.rent3 * 1.5) : deed.rent3;
  }
  ```
- Cập nhật hiển thị cước và badge xúc giác `x1.5 ĐỘC QUYỀN` màu hổ phách (`text-amber-700`) tại `src/client/ui/modals/title_deed_rent_table.tsx`.
- Đồng bộ ca test duy nhất bị ảnh hưởng trong `tests/domain/threat_forecaster.test.ts#L210-L213`.
- Chuyển xanh toàn bộ 18/18 tests trong `imp147_monopoly_rent_multiplier.test.ts` và 16/16 tests trong `threat_forecaster.test.ts`.

### Trạm 3: Independent Review & Disk Verification
- `spec-reviewer`: **APPROVED** — Đối soát 100% đặc tả SSOT trên đĩa vật lý, 0 scope creep, bộ test 18 atomic tests tuân thủ nghiêm ngặt chuẩn Antigravity.
- `ui-craft-reviewer`: **ship (APPROVE)** — 0 anti-patterns Impeccable, phân tầng z-index và bố cục `flex-col items-end` bảo toàn bề ngang trên màn hình nhỏ di động (360px) và desktop, `npm run lint:ui` clean 0 violations.

---

## 3. Ràng Buộc Đã Ghi Nhận
- Gotcha #196 trong [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md).
