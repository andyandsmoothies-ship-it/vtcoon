---
name: impeccable
description: Bộ kỹ năng thiết kế, trau chuốt và thẩm định UI/UX 2D xúc giác đỉnh cao chuẩn Antigravity 2.0. Hướng dẫn các quy trình critique, audit, polish, optimize, ngân sách chuyển động motion budget, và đổ bóng xúc giác tactile shadows cho game thương mại. Tích hợp engine Impeccable 23 lệnh và launcher CLI.
---

# KỸ NĂNG THIẾT KẾ UI/UX 2D XÚC GIÁC (IMPECCABLE STANDARD)

## 1. THIẾT LẬP NGỮ CẢNH ĐẦU PHIÊN (SESSION SETUP)

Đầu mỗi phiên làm việc liên quan đến giao diện, thiết kế hoặc thẩm định UI/UX 2D, chạy lệnh launcher sau một lần duy nhất để nạp toàn diện ngữ cảnh dự án (`PRODUCT.md`, `DESIGN.md`, surface brief):

```cmd
cmd /c .agents\skills\impeccable\scripts\impeccable.cmd context
```

*Ghi chú*:
- Có thể truyền đường dẫn tệp cụ thể qua cờ `--target <path>` (ví dụ: `--target src/client/ui/player_card.tsx`).
- Launcher tự động phát hiện và kết nối với nhị phân `impeccable-engine` độc lập trên hệ thống máy Windows x64.

---

## 2. TRIẾT LÝ XÚC GIÁC THƯỢNG LƯU (TACTILE LUXURY)

Kỹ năng **Impeccable** nâng chuẩn thiết kế đồ họa 2D lên tầm thương mại quốc tế (tactile luxury), đồng bộ mỹ thuật hoàn hảo với sa bàn 3D React Three Fiber (R3F) trong dự án `vtcoon`.

1. **Cảm Giác Cầm Nắm & Độ Nảy Vật Lý**: Các phần tử UI (thẻ Sổ Đỏ, nút bấm, khay điều khiển, modal) không phải là các mảng web phẳng 2D rẻ tiền, mà phải tạo cảm giác như những khối vật phẩm thủ công tinh xảo, có trọng lượng và độ nảy xúc giác dứt khoát.
2. **Loại Bỏ Hoàn Toàn Giao Diện Biểu Mẫu Hành Chính**: Tuyệt đối không để UI trông như dashboard quản trị, form web thập niên 2000, hay bảng tính Excel.
3. **Cơ Chế Progressive Disclosure**: Kỹ năng này cung cấp hướng dẫn quy trình khung. Khi cần tra cứu chi tiết công thức chuyên sâu, agent mở các tài liệu tham chiếu tương ứng:
   - Chuyển động & Thời động: [`reference/motion_budget.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/motion_budget.md)
   - Đổ bóng đa tầng & Nút bấm: [`reference/tactile_shadows.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/tactile_shadows.md)
   - Sàn tiêu chuẩn chất lượng: [`reference/craft-floor.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/craft-floor.md)

---

## 3. BỐN QUY TRÌNH HÀNH ĐỘNG CỐT LÕI BẢN ĐỊA

### 1. `/impeccable critique` - Phản Biện Đối Kháng Trực Quan
- **Mục tiêu**: Đóng vai chuyên gia phản biện UI đối kháng, soi xét từng pixel trên giao diện 2D.
- **Các bước thực hiện**:
  1. Xác định ngữ cảnh màn hình và thành phần UI cần đánh giá.
  2. Phân tích 4 khía cạnh: Chiều sâu xúc giác (Tactile Depth), Phân tầng thị giác (Hierarchy), Bảng màu & Tương phản, Chuyển động & Phản hồi tương tác.
  3. Lập danh sách tối đa 8 lỗi vật lý cụ thể (P1-P8), gắn nhãn anti-pattern nếu vi phạm.
  4. Đưa ra phán quyết disposition: `recapture | rebuild | fix | ship`.
  5. Luôn xác định mục `keep` (nét tinh hoa bắt buộc giữ lại, cấm làm mất).

### 2. `/impeccable audit` - Kiểm Tra Tĩnh Toàn Diện Mã Nguồn
- **Mục tiêu**: Quét mã nguồn để phát hiện vi phạm quy chuẩn thiết kế trước khi đưa vào sản xuất.
- **Các bước thực hiện**:
  1. Chạy linter nội bộ tự đứng vững: `npm run lint:ui`.
  2. Kiểm tra 4 anti-patterns cấm kỵ:
     - `border-accent-on-rounded` (viền directional trên phần tử bo góc).
     - `bounce-easing` (hiệu ứng nảy lò xo rẻ tiền hoặc overshoot > 1.0).
     - `gray-on-color` (chữ xám đen đè trực tiếp lên nền màu sặc sỡ).
     - `gradient-text` (chữ cắt dải màu làm giảm khả năng đọc).
  3. Kiểm tra tính khả dụng và trợ năng: Kích thước vùng bấm tối thiểu 44x44px (`min-h-[44px] min-w-[44px]`), trạng thái focus-visible đầy đủ (`focus-visible:ring-2`).

### 3. `/impeccable polish` - Nâng Cấp Xúc Giác Thượng Lưu
- **Mục tiêu**: Biến một giao diện "chạy được chức năng" thành một trải nghiệm xúc giác sang trọng.
- **Các bước thực hiện**:
  1. Thay thế các viền lệch thô (`border-b-4`) bằng công thức đổ bóng đa tầng:
     `shadow-[0_4px_0_0_#color] active:shadow-[0_1px_0_0_#color] active:translate-y-[3px]`
  2. Thêm viền ánh sáng vi mô (Rim Light) để tăng chiều sâu nổi khối:
     `border border-white/10 ring-1 ring-white/5` hoặc `ring-1 ring-amber-400/20`
  3. Chuẩn hóa typography: Sử dụng solid high-contrast text thay cho gradient text.
  4. Bổ sung âm thanh và hiệu ứng phản hồi micro-interactions cho các hành vi bấm, chọn, lật thẻ.

### 4. `/impeccable optimize` - Tối Ưu Hiệu Năng Kết Xuất 2D
- **Mục tiêu**: Đảm bảo UI 2D luôn mượt mà ở 60 FPS, không gây giật lag cho R3F Canvas.
- **Các bước thực hiện**:
  1. Giới hạn chuyển động theo ngân sách thời động: 100ms - 350ms (tối đa 500ms cho màn hình tổng).
  2. Chỉ animate các thuộc tính GPU-accelerated: `transform` và `opacity`.
  3. Ngăn chặn re-render diện rộng bằng cách cô lập state cục bộ (Zustand selectors, React memo).
  4. Đảm bảo hỗ trợ `prefers-reduced-motion` cho người dùng nhạy cảm với chuyển động.

---

## 4. BẢNG QUY CHUẨN ANTI-PATTERNS & GIẢI PHÁP CHUẨN HÓA

| Anti-Pattern | Biểu Hiện Vi Phạm | Tại Sao Cấm | Giải Pháp Chuẩn Hóa |
| :--- | :--- | :--- | :--- |
| **`border-accent-on-rounded`** | `rounded-xl border-b-4 border-amber-600` | Thuật toán bo góc CSS bị biến dạng méo góc khi có viền lệch | Dùng bóng đa tầng: `shadow-[0_4px_0_0_#d97706] active:translate-y-[3px]` |
| **`bounce-easing`** | `animate-bounce` hoặc `cubic-bezier` có overshoot > 1.0 | Tạo cảm giác đồ họa đồ chơi, lơ lửng, thiếu độ đanh chắc | Dùng đường cong dứt khoát: `cubic-bezier(0.16, 1, 0.3, 1)` |
| **`gray-on-color`** | `bg-amber-400 text-slate-950` | Độ tương phản đục, thiếu hài hòa sắc độ thị giác | Dùng chữ trắng (`text-white`) hoặc chữ đậm cùng tông (`text-amber-950`) |
| **`gradient-text`** | `bg-clip-text text-transparent bg-gradient-...` | Nhìn rẻ tiền kiểu template web quảng cáo, viền chữ răng cưa | Dùng chữ khối đồng nhất sắc nét: `text-amber-400 font-black tracking-tight` |

---

## 5. BẢNG ĐIỀU HƯỚNG 23 LỆNH IMPECCABLE ENGINE (COMMANDS TABLE)

| Lệnh (`Command`) | Phân loại (`Category`) | Mô tả (`Description`) | Cẩm nang (`Reference`) |
| :--- | :--- | :--- | :--- |
| `craft [feature]` | Build | Bí danh cho yêu cầu tạo mới visual world | [`reference/craft.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/craft.md) |
| `shape [feature]` | Build | Quy hoạch UX/UI trước khi viết mã nguồn | [`reference/shape.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/shape.md) |
| `init` | Build | Ghi nhận ngữ cảnh sản phẩm bền vững vào PRODUCT.md | [`reference/init.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/init.md) |
| `document` | Build | Trích xuất DESIGN.md từ mã nguồn hiện hữu | [`reference/document.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/document.md) |
| `extract [target]` | Build | Trích xuất design tokens và components tái sử dụng | [`reference/extract.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/extract.md) |
| `critique [target]` | Evaluate | Đánh giá thiết kế UX với chấm điểm heuristic | [`reference/critique.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/critique.md) |
| `audit [target]` | Evaluate | Kiểm tra chất lượng kỹ thuật (a11y, perf, responsive) | [`reference/audit.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/audit.md) · native: [`reference/audit.native.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/audit.native.md) |
| `polish [target]` | Refine | Hoàn thiện chất lượng xúc giác trước khi bàn giao | [`reference/polish.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/polish.md) |
| `bolder [target]` | Refine | Tăng cường cá tính cho thiết kế mờ nhạt, an toàn | [`reference/bolder.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/bolder.md) |
| `quieter [target]` | Refine | Tiết chế giao diện quá gắt, gây ngợp thị giác | [`reference/quieter.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/quieter.md) |
| `distill [target]` | Refine | Tinh lọc về bản chất, loại bỏ chi tiết rườm rà | [`reference/distill.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/distill.md) |
| `harden [target]` | Refine | Chuẩn hóa sản xuất: trạng thái lỗi, i18n, biên dữ liệu | [`reference/harden.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/harden.md) |
| `onboard [target]` | Refine | Thiết kế luồng trải nghiệm đầu, empty states, kích hoạt | [`reference/onboard.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/onboard.md) |
| `animate [target]` | Enhance | Bổ sung chuyển động có chủ đích và nhịp điệu | [`reference/animate.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/animate.md) |
| `colorize [target]` | Enhance | Bổ sung màu sắc chiến lược cho UI đơn điệu | [`reference/colorize.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/colorize.md) |
| `typeset [target]` | Enhance | Hoàn thiện phân cấp chữ (typography) và phông chữ | [`reference/typeset.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/typeset.md) |
| `layout [target]` | Enhance | Tinh chỉnh khoảng cách, nhịp điệu và thị giác | [`reference/layout.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/layout.md) |
| `delight [target]` | Enhance | Bổ sung chi tiết bất ngờ và điểm chạm cảm xúc | [`reference/delight.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/delight.md) |
| `overdrive [target]` | Enhance | Đột phá vượt giới hạn quy chuẩn thông thường | [`reference/overdrive.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/overdrive.md) |
| `clarify [target]` | Fix | Tinh chỉnh nội dung UX, nhãn và thông điệp lỗi | [`reference/clarify.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/clarify.md) |
| `adapt [target]` | Fix | Thích ứng đa thiết bị và kích thước màn hình | [`reference/adapt.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/adapt.md) · native: [`reference/adapt.native.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/adapt.native.md) |
| `optimize [target]` | Fix | Chẩn đoán và tối ưu hiệu năng kết xuất UI | [`reference/optimize.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/optimize.md) |
| `live` | Iterate | Chế độ live browser: chọn phần tử và sinh biến thể | [`reference/live.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/live.md) |

---

## 6. CHỈ MỤC TÀI LIỆU THAM CHIẾU & QUY TRÌNH CHUYÊN SÂU

Khi triển khai mã nguồn hoặc tinh chỉnh giao diện, agent mở các tài liệu sau để lấy mã mẫu và định hướng:
- **Phân bổ ngân sách chuyển động**: [`reference/motion_budget.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/motion_budget.md)
- **Công thức đổ bóng đa tầng xúc giác**: [`reference/tactile_shadows.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/tactile_shadows.md)
- **Sàn chất lượng và các điều cấm kỵ**: [`reference/craft-floor.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/craft-floor.md)
- **Hệ thống thiết kế mỹ thuật tổng thể**: [`docs/domain/design.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/design.md) hoặc [`DESIGN.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/DESIGN.md)
