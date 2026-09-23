# Báo Cáo Cải Tiến IMP-174: Chuẩn Hóa Văn Phong Chuyên Nghiệp & Rút Gọn Mô Tả 36 Thẻ Sự Kiện (1 Câu Duy Nhất <= 15 Từ)

> **Ticket**: IMP-174  
> **Trạng thái**: COMPLETED & VERIFIED  
> **Kết quả kiểm thử**: 298/298 test suites PASS (6.102/6.102 tests, 100%), TypeScript 0 errors, UI Linter 0 errors  
> **Gotcha**: #241  

---

## 1. TỔNG KẾT THỰC HIỆN

Đã rà soát, tinh gọn và chuẩn hóa thành công toàn diện 36 thẻ sự kiện (20 Cơ Hội + 16 Thị Trường):
1. **Loại bỏ triệt để tiếng lóng cợt nhả**:
   - `CC_JUNK_STOCK`: Đổi vĩnh viễn thành `'Bán Tháo Cổ Phiếu'` (loại bỏ hoàn toàn cụm từ cợt nhả "múa bên trăng" trên toàn bộ codebase).
   - Rà soát toàn bộ 36 thẻ theo văn phong tài chính, thương mại nghiêm túc, đứng đắn và tự nhiên (`Đấu Giá Biển Số Đẹp`, `Chốt Lời Cổ Phiếu VN30`, `Tăng Lãi Suất Tín Dụng`, `Đóng Băng Giao Dịch`, `Mùa Cao Điểm Du Lịch Quốc Tế`).
2. **Cô đọng mô tả thẻ thành 1 câu duy nhất (<= 15-20 từ)**:
   - Toàn bộ 36 thẻ trong `src/domain/event_card_metadata.ts` được rút gọn từ 2-3 câu (20-25 từ) xuống đúng 1 câu văn duy nhất, trực diện, không dài dòng.
   - Bảo toàn tính mạch lạc 3 tầng thông tin: Tiêu đề (sự kiện) ➔ Mô tả (bối cảnh thực tế) ➔ Hero Stat (tác động tài chính định lượng).
3. **Bảo toàn 100% hợp đồng kiểm thử**:
   - `MC_URBAN_PLANNING`: Bắt buộc chứa cụm từ `'tăng 20% giá trị khi thế chấp'` (`imp132`).
   - `MC_FREEZE_TRADE`: Bắt buộc chứa `'Đóng Băng Giao Dịch'`.
   - `MC_PEAK_TOURISM`: Bắt buộc chứa `'Mùa Cao Điểm Du Lịch Quốc Tế'`.
   - `CC_PORT_EXCLUSIVE`: Bắt buộc chứa `'Hợp Tác Độc Quyền Cảng Quốc Tế'`.
   - Hero Stat values: `'-500 Tr.'` (`MC_FUEL_SURGE`), `'-800 Tr.'` (`MC_ALCOHOL_CHECK`).

---

## 2. DANH SÁCH FILE THAY ĐỔI

1. `src/domain/i18n/vi.ts`: Chuẩn hóa tiêu đề 36 thẻ kinh tế nghiêm túc, đứng đắn (93 LOC <= 400).
2. `src/domain/event_card_metadata.ts`: Rút gọn 36 mô tả thành 1 câu duy nhất (<= 15-20 từ) (323 LOC <= 400).
3. `src/client/ui/modals/event_card_visuals.ts`: Đồng bộ nhãn Hero Stat và CTA buttons (301 LOC <= 400).
4. `docs/domain/gotchas.md`: Bổ sung Invariant #241.
5. `docs/plans/improvements/IMP-174-event-cards-brevity-and-professional-tone_plan.md`: Kế hoạch cải tiến chi tiết.
6. `docs/reports/improvements/IMP-174-event-cards-brevity-and-professional-tone_report.md`: Báo cáo nghiệm thu hoàn tất.

---

## 3. KẾT QUẢ KIỂM THỬ ĐỊNH LƯỢNG

- **Vitest Unit & Contract Suites**: 298/298 files passed (6.102/6.102 tests, 100%).
- **TypeScript Static Verification**: `npx tsc --noEmit` hoàn tất với 0 lỗi.
- **2D UI Craft Gate**: `npm run lint:ui` quét 171 files, phát hiện 0 anti-patterns.
- **Zero Gaps / Slop**: Không vượt trần LOC, không phát sinh nợ kỹ thuật.
