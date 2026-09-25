# Kế Hoạch Kỹ Thuật (REV 3): Hệ Thống Kinh Tế Đô Thị Đời Thực & Đòn Bẩy Tài Phiệt (Real-World Economic Engine)

> **Mã Đề Xuất**: `IMP-192` (Giai Đoạn 1 trong Bộ 3 Giai Đoạn Cải Tiến Gameplay Đời Thực)  
> **Cấu Trúc Triển Khai**: Đã phân rã thành **3 Lát Cắt Dọc Độc Lập (IMP-192A, IMP-192B, IMP-192C)** nhằm tuân thủ nghiêm ngặt *Scope Confinement*, *LOC Ceilings* và *3-Station Pipeline*.  
> **Tài Liệu Kiểm Toán**: [`.agents/audit/PLAN_AUDIT_IMP192.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP192.md)

---

## I. LỘ TRÌNH PHÂN RÃ LÁT CẮT (SLICING ROADMAP)

```
[IMP-192: HỆ THỐNG KINH TẾ ĐỜI THỰC] 
   │
   ├─► SLICE 1 [IMP-192A]: Cải Cách Trạm Kiểm Toán & Chống Camping (Anti-Camping Audit)
   │   • Tài liệu chi tiết: docs/plans/improvements/IMP-192A-anti-camping-audit-and-solvency_plan.md
   │   • Nghiệp vụ: Ngồi tù miễn thu tiền thuê; Phí bảo lãnh động 10% Net Worth nộp Kho Bạc.
   │   • Tệp can thiệp: src/domain/property_manager.ts, src/server/audit_manager.ts, src/server/room_manager.ts.
   │
   ├─► SLICE 2 [IMP-192B]: Chu Kỳ Vĩ Mô (Sốt Đất & Đóng Băng Thanh Khoản)
   │   • Tài liệu chi tiết: docs/plans/improvements/IMP-192B-macro-cycle-economic-engine_plan.md
   │   • Nghiệp vụ: Chu kỳ 6 vòng (Sốt đất x2.5 & Giảm 25% giá xây dựng -> Đóng băng -50% & Cấm thế chấp).
   │   • Tệp can thiệp: src/domain/macro_cycle_types.ts, src/domain/macro_cycle_engine.ts, turn_loop.ts, mortgage_manager.ts.
   │
   └─► SLICE 3 [IMP-192C]: Đòn Bẩy Trái Phiếu Doanh Nghiệp & Sàn Đấu Giá Phát Mãi Có Hàng Đợi
       • Tài liệu chi tiết: docs/plans/improvements/IMP-192C-corporate-bond-and-fire-sale_plan.md
       • Nghiệp vụ: INTENT_ISSUE_BOND, chống Naked Bond, đếm ngược 3 vòng, vỡ nợ phát mãi 0đ theo hàng đợi tuần tự.
       • Tệp can thiệp: src/server/bond_manager.ts, auction_manager.ts, 5-station delta pipeline, property modal UI.
```

---

## II. TỔNG HỢP CÁC ĐIỂM PHẢN BIỆN ĐỐI KHÁNG ĐÃ ĐƯỢC TIẾP THU

1. **Sửa đổi nhầm lẫn quy tắc xây nhà (Rule Hallucination)**:
   - Trong `property_upgrade.ts`, không có quy tắc "phải đi hết vòng mới được nâng cấp".
   - Sửa thành: `MC_LAND_FEVER` x2.5 tiền thuê VÀ giảm 25% chi phí nâng cấp nhà để kích cầu thực tế.
2. **Triệt tiêu lỗ hổng "Trái phiếu tay không bắt giặc" (Naked Bond Exploit)**:
   - Bổ sung điều kiện bắt buộc: Phải sở hữu tối thiểu từ 2 BĐS chưa thế chấp trở lên và giá trị tài sản đảm bảo phải đạt tối thiểu 50% khoản vay.
3. **Giải quyết xung đột quyền ưu tiên chủ nợ (Senior Secured Lien)**:
   - Kho Bạc giữ quyền ưu tiên tối cao (Senior Lien) thu hồi tài sản đảm bảo để bù đắp nợ gốc trái phiếu trước khi tài sản được thanh lý cho chủ nợ tiền thuê đất trong trường hợp phá sản chéo.
4. **Ngăn chặn nghẽn nhịp trận đấu (Auction Queue Gridlock)**:
   - Rút ngắn đếm ngược phiên phát mãi `isFireSale` xuống 10s. Nếu tất cả người chơi bấm Bỏ Qua (All Passed), lập tức đóng phiên, tịch thu BĐS về Kho Bạc và mở ngay BĐS tiếp theo trong hàng đợi.
5. **Tuân thủ ngưỡng LOC mới trong GEMINI.md**:
   - TIER 1 (Domain / Server / FSM): Tối đa 400 LOC (cảnh báo 300 LOC, lỗi cứng 550 LOC).
   - TIER 2 (UI / 3D Canvas / Views): Tối đa 500 LOC (cảnh báo 400 LOC).
   - `action_dock.tsx` (398 LOC): Giữ nguyên, không nhồi nút cấp 1 vào hàng ngang trên Mobile 360px; nút Trái Phiếu được đặt bên trong `PropertyManagementModal` tại tab Tài Chính.

---

## III. QUY TRÌNH THỰC THI

Mỗi slice (`IMP-192A`, `IMP-192B`, `IMP-192C`) sẽ được thực thi tuần tự theo đúng **Quy trình 3 Trạm (Station 1: RED -> Station 2: GREEN -> Station 2.5: Scout -> Station 3: Independent Review)**.

Lát cắt thực thi đầu tiên: **IMP-192A (Cải Cách Trạm Kiểm Toán & Chống Camping)**.
