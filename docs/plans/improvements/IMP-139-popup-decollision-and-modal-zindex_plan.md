# Kế Hoạch Cải Tiến Kỹ Thuật: IMP-139 (IMP-139B)
## Khử Chồng Đè Popup & Phân Tầng Z-Index Độc Lập Giữa Popup Và Modal/Page (Desktop & Mobile)

> **Mã Cải Tiến**: `IMP-139` (`IMP-139B`)  
> **Phân Vùng**: Client UI/UX & Responsive Layout Stacking Context (Tier 2 - Full Rigor)  
> **Traceability**: `[UC-GAME-023]`, `tests/client/imp139_popup_decollision_and_modal_zindex.test.ts`, Gotcha #185  
> **Căn Cứ SSOT**: [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md), [`docs/master_roadmap.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/master_roadmap.md)

---

## 1. BỐI CẢNH & PHÂN TÍCH NGUYÊN NHÂN GỐC RỄ (FORENSIC ANALYSIS)

Từ phản hồi kèm ảnh chụp màn hình thực tế của người chơi trên thiết bị di động (`media_1789905523793.png`), hệ thống xác định 2 khiếm khuyết hiển thị nghiêm trọng:
1. **Lỗi chồng đè giữa các pop-up trên màn hình di động**:
   - Khi có sự kiện cột mốc đặc biệt (`MilestoneBanner`: Cơ Hội, Thị Trường, Độc Quyền) diễn ra đồng thời với biến động tài chính thường (`FloatingBadge`), thẻ giao dịch thường bị định vị tại `top-36` (144px).
   - Trong khi đó, `MilestoneBanner` bắt đầu tại `top-20` (80px) và có chiều cao thực tế ~90px (đáy tại 170px).
   - Hậu quả: Thẻ giao dịch thường bắt đầu khi thẻ sự kiện bên trên chưa kết thúc $\rightarrow$ chồng đè trực tiếp 26px ($170 - 144$), che khuất tiêu đề và con số biến động tiền.
2. **Lỗi pop-up chèn đè lên Modal / Page nghiệp vụ khi đang mở**:
   - Toàn bộ các trang và hộp thoại tương tác trong game (`MasterplanModal` Sa bàn quy hoạch, `TitleDeedModal` Sổ đỏ, `PropertyPortfolioModal` Danh mục BĐS, `TradeModal` Đàm phán P2P, `AuctionModal` Sàn đấu giá...) được bọc bởi `ModalBackdrop` có chỉ số `z-30`.
   - Trong khi đó, khối pop-up `FloatingNumbersOverlay` lại khai báo `z-40`, và thẻ `MilestoneBanner` khai báo `z-50`.
   - Hậu quả: Khi người chơi mở bất kỳ modal hay trang nào, các pop-up tài chính và banner sự kiện vẫn nổi lơ lửng đè lên trên giao diện thao tác, che mắt và gây phân tán chú ý.

---

## 2. QUY CHUẨN KIẾN TRÚC & GIẢI PHÁP KỸ THUẬT (SSOT Z-INDEX)

```
[Phân tầng Z-Index chuẩn SSOT]:
  z-[60] : Hộp Đen Giám Sát Lỗi & Telemetry Console (`TelemetryConsoleModal`)
  z-50   : Toàn bộ Business Modals & Pages (`ModalBackdrop`, `ModalHost`)      <-- NÂNG TỪ Z-30
  z-40   : Ngăn Kéo Nhật Ký Trượt Cạnh Phải (`ActivityFeedSidebar`)
  z-30   : Ambient Popups, Milestone Banner & Toasts (`FloatingNumbersOverlay`)  <-- HẠ TỪ Z-40/Z-50
  z-20   : Recenter Pawn Pill, Action Dock Controls
  z-10   : Root HUD Container (TopBar, Player Cards, MarketEventTicker)
   z-0   : 3D WebGL Canvas Sa Bàn Đô Thị
```

### 2.1. Phân Tầng Z-Index & Cơ Chế Thu Hồi DOM (Focused Modal Suppression Guard)
1. **Nâng `ModalBackdrop` lên `z-50`**:
   - Trong `src/client/ui/modals/modal_backdrop.tsx`: Đổi `z-30` thành `z-50` ở cả 3 biến thể: `fullScreen`, `center`, và mặc định.
2. **Nâng `TelemetryConsoleModal` lên `z-[60]`**:
   - Trong `src/client/ui/telemetry/telemetry_console_modal.tsx`: Đổi `z-40` thành `z-[60]`, bảo đảm bảng chẩn đoán khẩn cấp luôn mở được trên cùng ngay cả khi đang có modal nghiệp vụ.
3. **Hạ `FloatingNumbersOverlay` xuống `z-30`**:
   - Container chính `<aside>` đổi từ `z-40` thành `z-30`.
   - Cụm `desktopTexts` đổi từ `z-40` thành `z-30`.
   - Wrapper `MilestoneBanner` đổi từ `z-50` thành `z-30` kèm thuộc tính `data-testid="milestone-banner-container"`.
4. **Focused Modal Suppression Guard**:
   - Trong `src/client/ui/floating_numbers.tsx`: Lắng nghe `activeModal` từ `useGameStore`.
   - Khi `activeModal !== null`, `FloatingNumbersOverlay` lập tức trả về `null` (giải phóng DOM), bảo đảm trải nghiệm tập trung tối đa cho người chơi.

### 2.2. Khử Chồng Đè Toasts & Milestone Banner (Mobile & Desktop Parity)
1. **Trên Mobile (< 768px)**:
   - Khi có `latestMilestone` và `activeMarketCount === 0`: `mobileTopClass = 'top-[11.5rem]'` (184px, tạo khoảng đệm an toàn 104px so với đỉnh `top-20` của MilestoneBanner, triệt tiêu 100% va chạm).
   - Khi có `latestMilestone` và `activeMarketCount === 1`: `mobileTopClass = 'top-[11rem]'` (bảo toàn hợp đồng `TC-IMP129.04`).
   - Khi có `latestMilestone` và `activeMarketCount >= 2`: `mobileTopClass = 'top-[13.5rem]'`.
   - Khi không có `latestMilestone`: Hoàn nguyên `top-[4.25rem]`, `top-28`, `top-40`.
2. **Trên Desktop (>= 768px)**:
   - Khi có `latestMilestone`: Container desktop tự động dịch xuống `top-[12rem] md:top-[12rem]`.
   - Khi không có `latestMilestone`: Giữ nguyên vị trí chuẩn `top-28 md:top-32` (bảo toàn hợp đồng `TC-IMP128.03`).

---

## 3. MA TRẬN KIỂM THỬ HỢP ĐỒNG ĐỐI KHÁNG (UNIVERSAL 4-FACET MATRIX)

Tệp kiểm thử: `tests/client/imp139_popup_decollision_and_modal_zindex.test.ts` (18 atomic tests):
- **Facet 1 (Z-Index Hierarchy & Modal Isolation)**:
  * TC-139.01 - 03: `ModalBackdrop` render với `z-50` ở 3 chế độ (default, center, fullScreen).
  * TC-139.04 - 05: `FloatingNumbersOverlay` và `MilestoneBanner` render với `z-30`.
  * TC-139.06: `TelemetryConsoleModal` render với `z-[60]`.
  * TC-139.07 - 09: `FloatingNumbersOverlay` trả về `null` khi `activeModal` là `deed`, `portfolio`, hoặc `auction`.
- **Facet 2 (Mobile De-collision)**:
  * TC-139.10: `latestMilestone` + 0 market card $\rightarrow$ `top-[11.5rem]` (184px).
  * TC-139.11: `latestMilestone` + 1 market card $\rightarrow$ `top-[11rem]`.
  * TC-139.12: `latestMilestone` + 2+ market cards $\rightarrow$ `top-[13.5rem]`.
  * TC-139.13: Không có milestone $\rightarrow$ hoàn nguyên `top-[4.25rem]` và `top-28`.
- **Facet 3 (Desktop De-collision)**:
  * TC-139.14: `latestMilestone` hiện diện $\rightarrow$ desktop container dịch chuyển `top-[12rem] md:top-[12rem]`.
  * TC-139.15: Không có milestone $\rightarrow$ giữ nguyên `top-28 md:top-32`.
- **Facet 4 (Component Resilience & Error Defense)**:
  * TC-139.16: `floatingTexts` rỗng $\rightarrow$ trả về `null`.
  * TC-139.17: Solo milestone toasts $\rightarrow$ render không crash.
  * TC-139.18: Chuyển đổi `activeModal` từ `'deed'` về `null` $\rightarrow$ khôi phục render bình thường.
