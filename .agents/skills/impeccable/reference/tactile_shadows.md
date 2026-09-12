# CÔNG THỨC ĐỔ BÓNG ĐA TẦNG XÚC GIÁC (TACTILE SHADOWS & ELEVATION)

Tài liệu tham chiếu chuyên sâu thuộc bộ kỹ năng `impeccable` của dự án `vtcoon`.

---

## 1. VẤN ĐỀ CỦA NÚT BẤM MÉO GÓC (`border-accent-on-rounded`)

Trong thiết kế web sơ cấp, lập trình viên thường tạo cảm giác "nút bấm 3D nổi" bằng cách thêm viền đáy dày:
```html
<!-- SAI LẦM: Viền dưới 4px trên phần tử bo góc -->
<button class="rounded-xl bg-amber-500 border-b-4 border-amber-700">
  Mua Đất
</button>
```

### Tại sao đây là Anti-pattern nghiêm trọng?
1. **Lỗi Biến Dạng Góc Bo (Corner Warping)**: Thuật toán vẽ `border-radius` của CSS tính toán bán kính dựa trên độ dày đồng đều của các cạnh. Khi một cạnh có độ dày 4px trong khi 3 cạnh còn lại bằng 0 hoặc 1px, đường cong ở hai góc đáy bị kéo lệch bất đối xứng, lộ rõ vết vát dị dạng.
2. **Thiếu Chiều Sâu Xúc Giác Đích Thực**: Khi người dùng nhấn nút (`active`), viền `border-b-4` không phản ánh được sự nén xuống theo trục Z một cách tự nhiên.

---

## 2. CÔNG THỨC ĐỔ BÓNG ĐA TẦNG XÚC GIÁC THAY THẾ

Thay vì dùng viền đáy dày, Impeccable sử dụng **bóng đổ dập nổi đồng phẳng (hard-edge elevation drop shadow)** kết hợp với hiệu ứng dịch chuyển tọa độ khi nhấn:

### Công Thức Cốt Lõi (Tailwind CSS):
```html
<button class="
  px-4 py-2.5 rounded-xl font-bold
  border border-[border_color]
  shadow-[0_4px_0_0_#depth_color]
  active:shadow-[0_1px_0_0_#depth_color]
  active:translate-y-[3px]
  transition-all
">
  Mua Đất
</button>
```

### Cơ Chế Hoạt Động Xúc Giác:
1. `shadow-[0_4px_0_0_#depth_color]`: Tạo một chân đế dày 4px hoàn hảo bám theo đúng đường cong của `rounded-xl`, không làm méo bất kỳ góc bo nào.
2. `active:translate-y-[3px]`: Khi click/nhấn, toàn bộ nút bấm thụt xuống 3px.
3. `active:shadow-[0_1px_0_0_#depth_color]`: Độ dày của chân đế giảm từ 4px xuống 1px, mô phỏng chuẩn xác vật lý nén cơ học của một phím bấm cao cấp.

---

## 3. BẢNG MÃ MÀU NÚT BẤM THỰC TẾ TRONG VTCOON

Dưới đây là các token hoàn chỉnh áp dụng trong giao diện 2D của trò chơi:

### 1. Nút Thao Tác Cơ Bản / Xác Nhận Mua (Teal / Emerald Luxury)
```html
<button class="min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-b from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 border border-teal-800 shadow-[0_4px_0_0_#115e59] active:shadow-[0_1px_0_0_#115e59] active:translate-y-[3px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400">
  Xác Nhận Đầu Tư
</button>
```

### 2. Nút Hoàng Gia / Đấu Giá / Nâng Cấp Tòa Nhà (Amber / Gold Tycoon)
```html
<button class="min-h-[44px] px-5 py-2.5 rounded-xl font-black text-amber-950 bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 border border-amber-700 shadow-[0_4px_0_0_#b45309] active:shadow-[0_1px_0_0_#b45309] active:translate-y-[3px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
  Đặt Giá Đấu Thầu
</button>
```

### 3. Nút Nguy Hiểm / Bỏ Lượt / Thế Chấp / Phá Sản (Rose / Crimson Crisis)
```html
<button class="min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-rose-300 hover:text-rose-100 bg-rose-950/80 hover:bg-rose-900/90 border border-rose-700/60 shadow-[0_4px_0_0_#9f1239] active:shadow-[0_1px_0_0_#9f1239] active:translate-y-[3px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">
  Bỏ Cuộc / Thế Chấp
</button>
```

---

## 4. CHIỀU SÂU THẺ BÀI & MODAL DIORAMA (MULTI-LAYER AMBIENT DEPTH)

Đối với các thẻ bài lớn như Sổ Đỏ (Title Deed) hoặc Modal HOSE:
- **Lớp 1 (Ambient Shadow)**: `shadow-2xl shadow-black/80` (tách phần tử ra khỏi không gian 3D).
- **Lớp 2 (Contact Footing)**: `shadow-[0_4px_0_0_#0f172a]` (chân đế tiếp xúc mặt bàn cờ).
- **Lớp 3 (Rim Light)**: `ring-1 ring-white/10` hoặc `ring-1 ring-amber-400/20` (vệt sáng cạnh viền kính cường lực/kim loại).
- **Lớp 4 (Vật liệu nền)**: `bg-slate-900/95 backdrop-blur-md border border-slate-700/60`.
