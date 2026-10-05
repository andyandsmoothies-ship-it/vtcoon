# KẾ HOẠCH TRIỂN KHAI (IMPLEMENTATION PLAN)
# IMP-266.2: PHẢN ỨNG VIEWPORT ĐỘNG & TRUYỀN PROP TỪ GỐC LAYOUT (EXPLICIT PROP PROPAGATION)

> **Mã Lát Cắt:** IMP-266.2 (Micro-Slice 2 / Epic IMP-266)  
> **Tiêu đề:** Viewport Reactivity Hook & Root Prop Propagation  
> **Phân loại:** Tier 2 Micro-Slice (Lean Plan Specification, Delta <= 50 LOC, Single Subsystem)  
> **Phân hệ mục tiêu:** `client-state` & Core Layout Wiring  
> **Tài liệu tham chiếu:** `docs/domain/gotchas/ui_ergonomics.md` · `GEMINI.md` Hard Constraints  
> **Miễn trừ thị giác (Pure Logic Waiver):** `pureLogicWaiver: true` (Lát cắt đường truyền trạng thái và hook phản ứng, không thay đổi mỹ thuật 3D/DOM)  

---

## 0. KHẢO SÁT BỀ MẶT MÃ NGUỒN (100% SURFACE INVENTORY)

| Tệp Tin Vật Lý | Tọa Độ Dòng | Phân Loại | Hành Động Kỹ Thuật Cụ Thể |
| :--- | :---: | :---: | :--- |
| `src/client/hooks/use_is_mobile.ts` | Mới (L1-L35) | **Create** | Hook phản ứng động `useIsMobile()` theo dõi `resize` và `orientationchange`, giải phóng listener khi unmount. |
| `src/client/main.tsx` | L25, L214 | **Modify** | Gọi `useIsMobile()` duy nhất tại `App()` và truyền cờ động xuống `<GameCanvas isMobile={isMobile} />`. |
| `src/client/game_canvas.tsx` | L113 | **Keep / Waive** | Giữ nguyên nhận prop `isMobile?: boolean`, không gọi hook nội bộ, loại bỏ nguy cơ re-render kép. |
| `tests/contracts/imp266_2_viewport_reactivity_and_prop_propagation.test.ts` | Mới (L1-L120) | **Create** | Bộ 8 bài test hợp đồng Station 1 kiểm chứng hành vi của hook, dọn dẹp listener và truyền prop. |

---

## 1. THIẾT KẾ KIẾN TRÚC & HỢP ĐỒNG GIAO DIỆN (DEEP ARCHITECTURE)

```
window (resize / orientationchange) ──► useIsMobile() [Chỉ gọi duy nhất tại main.tsx]
                                              │
                                              ▼ (Prop isMobile)
                                          GameCanvas (0 listener nội bộ, 0 re-render kép)
                                              │
                                              ▼
                                         3D Scene Graph
```

- **Explicit Environmental Prop Propagation**:
  - Gốc `main.tsx` là nơi duy nhất giữ hook phản ứng `useIsMobile()`.
  - `GameCanvas` không tạo listener riêng, nhận prop `isMobile` từ cha.
  - Khi xoay màn hình hoặc đổi kích thước, chỉ có một luồng cập nhật duy nhất, triệt tiêu xung đột re-render kép làm đơ canvas 3D.

---

## 2. CHI TIẾT CÁC TÁC VỤ TRIỂN KHAI (LEAN TASKS)

### Task 1: Xây Dựng Hook `useIsMobile()` Tự Động Phản Ứng Viewport
- **Target physical file**: `src/client/hooks/use_is_mobile.ts` (mới)

```typescript
import { useState, useEffect } from 'react';
import { isMobileDevice } from '../3d/device_detect';

/**
 * Reactive hook that tracks device and viewport changes (resize & orientationchange).
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => isMobileDevice());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return isMobile;
}
```

### Task 2: Khởi Tạo Hook Tại Gốc `main.tsx` & Truyền Prop Xuống `GameCanvas`
- **Target physical file**: `src/client/main.tsx`
- Import `useIsMobile` từ `./hooks/use_is_mobile`.
- Trong `App()`: Khởi tạo `const isMobile = useIsMobile();` và truyền vào `<GameCanvas isLobby={!gameStarted} players={effectivePlayers} isMobile={isMobile} />`.

---

## 3. MA TRẬN TEST HỢP ĐỒNG TRẠM 1 (STATION 1 CONTRACT SPECIFICATIONS)

> **File kiểm thử:** `tests/contracts/imp266_2_viewport_reactivity_and_prop_propagation.test.ts`

- TC-266.2.01 [UC-IMP266.2/MSS]: `useIsMobile` trả về true khi màn hình khởi tạo có chiều rộng di động 360px.
- TC-266.2.02 [UC-IMP266.2/MSS]: `useIsMobile` trả về false khi màn hình khởi tạo có chiều rộng desktop 1280px.
- TC-266.2.03 [UC-IMP266.2/MSS]: `useIsMobile` cập nhật trạng thái ngay lập tức khi phát sinh sự kiện resize qua ngưỡng 768px.
- TC-266.2.04 [UC-IMP266.2/MSS]: `useIsMobile` cập nhật trạng thái khi phát sinh sự kiện orientationchange.
- TC-266.2.05 [UC-IMP266.2/A1]: `useIsMobile` dọn dẹp sạch sẽ event listener trên window khi component unmount.
- TC-266.2.06 [UC-IMP266.2/A2]: `useIsMobile` hoạt động an toàn và không gây lỗi trong môi trường headless SSR không có window.
- TC-266.2.07 [UC-IMP266.2/MSS]: `useIsMobile` không đăng ký listener dư thừa khi giá trị viewport không đổi.
- TC-266.2.08 [UC-IMP266.2/A3]: `useIsMobile` hỗ trợ listener options passive để tối ưu hiệu năng cuộn và vẽ.

---

## 4. BẢNG ĐO LƯỜNG NGÂN SÁCH DÒNG MÃ (PRE-CODING LOC BASELINE)

| Tệp Tin Mục Tiêu | Phân Hạng Tier | Dòng Hiện Tại | Dự Kiến Sau Sửa | Biến Thiên (Delta) | Trần Ngân Sách | Đánh Giá |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `src/client/hooks/use_is_mobile.ts` | Tier 1 (Hook) | 0 (Mới) | ~35 | +35 dòng | <= 400 dòng | ✔️ Safe |
| `src/client/main.tsx` | Tier 2 (View) | 268 | 269 | +1 dòng | <= 500 dòng | ✔️ Safe |
| `tests/contracts/imp266_2_viewport_reactivity_and_prop_propagation.test.ts` | Test Suite | 0 (Mới) | ~120 | +120 dòng | <= 300 dòng | ✔️ Safe |

---

## 5. TIÊU CHÍ HOÀN THÀNH NGHIỆM THU (DEFINITION OF DONE)

- [ ] **DoD #1: Flow Taxonomy**: 100% ca test mang nhãn `[UC-IMP266.2/MSS]` hoặc `[UC-IMP266.2/A#]`.
- [ ] **DoD #2: Explicit Prop Propagation**: `useIsMobile()` chỉ gọi tại gốc `main.tsx`, truyền prop xuống `GameCanvas`, dập tắt hoàn toàn rủi ro re-render kép.
- [ ] **DoD #3: Memory Leak Freedom**: Dọn dẹp 100% listener khi component unmount.
- [ ] **DoD #4: Scaled Test Floor**: Đạt tối thiểu 8 ca test hợp đồng nguyên tử cho Micro-Slice.
- [ ] **DoD #5: Pre-closing Gate**: `npm run prefilter` và `node scripts/check_evidence.mjs IMP-266_2` đạt kết quả PASS 100%.
