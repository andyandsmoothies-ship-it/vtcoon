# [PLAN] IMP-211, IMP-212, IMP-213: Kế Hoạch Cải Tổ & Hiện Đại Hóa UI Toàn Game

> **Mã chiến dịch:** IMP-211, IMP-212, IMP-213 (Kế thừa từ thành công của Sổ Đỏ IMP-209)  
> **Mục tiêu:** Rà soát sát sao mọi element, thanh lọc triệt để các anti-patterns, nút ma ẩn, nút giả lập trạng thái nợ nần, và chuẩn hóa hệ thống Clean Modern Tactile UI cho toàn bộ 7 modal trong game VTCoOn.  
> **Tiêu chuẩn thiết kế:** Impeccable 2D Tactile Design, WCAG >= 44x44px Touch Targets, Mobile 360px Ergonomics, Zero Bug-Codification, Strict Intent Callback Isolation.

---

## 1. PHÂN CHIA 3 GÓI TRIỂN KHAI ĐỘC LẬP

```
[Chiến dịch Clean Modern Tactile UI]
 ├── GÓI 1 (IMP-211): Sàn Đấu Giá 15s + Đổi Đất Bot (auction_modal.tsx, bot_trade_offer_modal.tsx)
 ├── GÓI 2 (IMP-212): Danh Mục BĐS + Trái Phiếu + Đàm Phán P2P (property_portfolio_modal.tsx, bond_issuance_tab.tsx, trade_modal.tsx)
 └── GÓI 3 (IMP-213): Thu Hồi Cưỡng Chế 130% + Sàn HOSE + Thể Lệ (compulsory_buyout_modal.tsx, hose_modal.tsx, game_rules_modal.tsx)
```

---

## 2. CHI TIẾT ĐẶC TẢ TỪNG GÓI

### 2.1. Gói 1 (IMP-211): Sàn Đấu Giá 15s & Đề Xuất Đổi Đất Bot
1. **Sàn Đấu Giá (`auction_modal.tsx`)**:
   - Khử hoàn toàn fallback `onPass ?? onClose`, phân lập 100% giữa callback intent (`onPass`) và dismiss handler (`onClose`).
   - Lưới 2 cột đối xứng `grid-cols-2`: Cột 1 = Auto-Bid toggle button; Cột 2 = 4 trạng thái phân minh (`auction-pass-btn`, `auction-passed-close-btn`, `auction-declined-close-btn`, `auction-concluded-close-btn`).
   - Nút kết thúc/rút lui là focusable buttons chuẩn WCAG.
   - Thống nhất nhãn SSOT: `✕ Rút Lui`, `TỰ ĐỘNG ĐẶT GIÁ: BẬT / TẮT`, badge `🚫 Từ chối mua`.
2. **Đề Xuất Đổi Đất Bot (`bot_trade_offer_modal.tsx`)**:
   - Tách cảnh báo thiếu tiền bù ra thẻ riêng `data-testid="trade-shortfall-notice"`.
   - Nút đồng ý luôn giữ nguyên định danh `✓ ĐỒNG Ý ĐỔI` / `✓ ĐỒNG Ý BÁN` ở trạng thái mờ khi thiếu tiền.
   - Nút từ chối mang phong cách hồng phấn `bg-rose-50 border-rose-300 text-rose-700`, touch target min-h-[46px].

### 2.2. Gói 2 (IMP-212): Danh Mục BĐS, Trái Phiếu & Đàm Phán P2P
1. **Danh Mục BĐS (`property_portfolio_modal.tsx`)**:
   - Khử nút [✕ Đóng] footer trùng lặp, giải phóng 50px diện tích cuộn cho danh mục và tab trái phiếu.
   - Đưa số liệu tài sản lên tiêu đề phụ: `Quản lý {ownedProperties.length} tài sản sở hữu • Nâng cấp nhanh 1-click`.
2. **Tab Trái Phiếu (`bond_issuance_tab.tsx`)**:
   - Nút phát hành luôn giữ nhãn cố định `PHÁT HÀNH TRÁI PHIẾU` (kể cả khi disabled).
   - Tách cảnh báo chặn ra thẻ `data-testid="bond-blocked-notice"`.
   - Nút tất toán giữ nhãn `TẤT TOÁN TRƯỚC HẠN`, touch target min-h-[46px] với gờ bóng tactile `shadow-[0_4px_0_0_#065f46]`.
3. **Đàm Phán P2P (`trade_modal.tsx` & `trade_column.tsx`)**:
   - Thanh lọc triệt để nút ma tàng hình `className="hidden"` mang nhãn 'Thế chấp' và thuộc tính `data-legacy-style`.
   - Chân modal tinh gọn 1 nút duy nhất `data-testid="submit-trade-btn"` chiếm `w-full min-h-[48px]` với gờ bóng ngọc lục bảo `shadow-[0_4px_0_0_#065f46]`.

### 2.3. Gói 3 (IMP-213): Thu Hồi Cưỡng Chế 130%, Sàn HOSE & Thể Lệ
1. **Thu Hồi Cưỡng Chế 130% (`compulsory_buyout_modal.tsx`)**:
   - Đổi nhãn `✕ Bỏ Qua` sang `✕ Từ Chối Mua` với tone hồng phấn tao nhã `bg-rose-50 border-rose-300 text-rose-700`.
   - Nút `Mua Lại ({cost})` giữ nguyên định danh ở trạng thái disabled mờ khi thiếu tiền.
   - Thẻ cảnh báo riêng `data-testid="buyout-shortfall-notice"` tone amber hiển thị số tiền thiếu chính xác.
   - Bố cục 2 nút đối xứng 1 hàng `grid-cols-2`, đạt `h-full min-h-[48px]`.
   - Hỗ trợ fallback SSR store tương thích `renderToStaticMarkup`.
2. **Sàn HOSE (`hose_modal.tsx`)**:
   - Đổi nhãn `✕ Bỏ Qua` thành `✕ Không Cược` chuẩn ngữ cảnh cá cược chứng khoán.
   - Quét sạch 100% thuộc tính ma `data-legacy-rates` trong DOM.
   - Nút Cược và Không Cược đều đạt touch target `min-h-[46px]` kèm gờ bóng tactile 3D, độ lún cơ học `active:translate-y-[3px]`.
3. **Hướng Dẫn & Thể Lệ (`game_rules_modal.tsx`)**:
   - Loại bỏ hoàn toàn thanh `footer` chứa nút `Đã Hiểu` thừa thãi, giải phóng 50px diện tích cuộn cho toàn bộ các tab hướng dẫn.
   - Nút đóng Header `[X]` đạt touch target chuẩn `min-w-[44px] min-h-[44px]`, bổ sung tooltip chỉ dẫn trực quan `title="Đóng hướng dẫn (Phím Esc hoặc click nền)"`.

---

## 3. QUY TRÌNH THỰC HIỆN 3 TRẠM
1. **Station 1 (RED Contract Test)**: `qa-tester` viết 16 atomic tests/gói (tổng 48 tests), chứng minh failure (Adversarial Inversion Gate).
2. **Station 2 (GREEN Implementation)**: `implementer` áp dụng mã nguồn tối thiểu để pass tests.
3. **Station 2.5 (Sweeping Scout Audit)**: `scout` quét 5 mẫu khuyết tật vật lý (stale closures, unhandled async, leaks, private internals, dead code).
4. **Station 3 (Independent Review Panel)**: `spec-reviewer`, `ui-craft-reviewer`, `code-reviewer` thẩm định độc lập trên file vật lý.
