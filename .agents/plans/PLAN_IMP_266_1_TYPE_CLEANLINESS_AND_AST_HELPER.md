# KẾ HOẠCH TRIỂN KHAI (IMPLEMENTATION PLAN)
# IMP-266.1: LÀM SẠCH KIỂU TOÀN CỤC & CHUẨN HÓA HELPER DUYỆT CÂY AST REACT 19

> **Mã Lát Cắt:** IMP-266.1 (Micro-Slice 1 / Epic IMP-266)  
> **Tiêu đề:** Global Type Cleanliness & Standalone React 19 AST Test Helper  
> **Phân loại:** Tier 2 Micro-Slice (Lean Plan Specification, Delta <= 50 LOC, Single Subsystem)  
> **Phân hệ mục tiêu:** `client-types` & Test Harness  
> **Tài liệu tham chiếu:** `docs/domain/gotchas/deep_modules.md` · `GEMINI.md` Hard Constraints  
> **Miễn trừ thị giác (Pure Logic Waiver):** `pureLogicWaiver: true` (Không có thay đổi DOM hay 3D visual render)  

---

## 0. KHẢO SÁT BỀ MẶT MÃ NGUỒN (100% SURFACE INVENTORY)

| Tệp Tin Vật Lý | Tọa Độ Dòng | Phân Loại | Hành Động Kỹ Thuật Cụ Thể |
| :--- | :---: | :---: | :--- |
| `src/client/types/global.d.ts` | L24-L29 | **Modify** | Xóa bỏ `interface Object` (4 trường `any`), triệt tiêu ô nhiễm prototype toàn cục (`Anti-TIDD`). |
| `tests/helpers/threejs_test_utils.ts` | Mới (L1-L90) | **Create** | Xây dựng helper duyệt cây JSX AST cho React 19: `captureTree`, `findReactNode`, `findReactNodes`, `getNodeType`, `getNodeProps`. |
| `tests/contracts/imp266_1_type_cleanliness_and_ast_helper.test.ts` | Mới (L1-L130) | **Create** | Bộ 10 bài test hợp đồng Station 1 kiểm chứng hành vi của helper và kiểu dữ liệu sạch. |
| `tests/client/imp265_dual_platform_mobile_lod.test.ts` | L62-L95, L325, L340 | **Modify** | Xóa bỏ `Reflect.get`, chuyển sang assert hành vi công khai; import helper dùng chung. |

---

## 1. THIẾT KẾ KIẾN TRÚC & HỢP ĐỒNG GIAO DIỆN (DEEP ARCHITECTURE)

```
[MÃ NGUỒN SẢN XUẤT]
src/client/types/global.d.ts ──(Xóa interface Object)──► Sạch 100%, 0 'any', 0 monkey-patch
                                                              │
[MÔI TRƯỜNG KIỂM THỬ]                                        │ (TypeScript cách ly)
tests/helpers/threejs_test_utils.ts <─────────────────────────┘
   ├── TestReactElement<P>: ReactElement & { readonly props: P & Record<string, unknown> }
   ├── captureTree<P>(Component, props?): TestReactElement<P> | null
   ├── findReactNode<P>(root, predicate): Hỗ trợ mảng gốc (Array fragments) và React.Children
   ├── findReactNodes<P>(root, predicate): Thu thập toàn bộ nút thỏa mãn
   ├── getNodeProps<P>(node): Partial<P>
   └── getNodeType(node): Trả về tên thẻ JSX hoặc 'Component' cho hàm ẩn danh
```

---

## 2. CHI TIẾT CÁC TÁC VỤ TRIỂN KHAI (LEAN TASKS)

### Task 1: Xóa Bỏ Monkey-Patch `interface Object` Khỏi `global.d.ts`
- **Target physical file**: `src/client/types/global.d.ts` (L24-L29)

```typescript
<<<<
  interface Object {
    readonly frames?: any;
    readonly isMobile?: any;
    readonly position?: any;
    readonly scale?: any;
  }
}
====
}
>>>>
```

### Task 2: Xây Dựng Helper Duyệt Cây JSX AST Độc Lập Cho React 19
- **Target physical file**: `tests/helpers/threejs_test_utils.ts` (mới)
- Cung cấp kiểu dữ liệu `TestReactElement<P>` mở rộng an toàn `React.ReactElement`.
- `findReactNode` và `findReactNodes` hỗ trợ đệ quy qua `Array.isArray(root)` và `React.Children.toArray`.

### Task 3: Làm Sạch Bài Test IMP-265 Khỏi `Reflect.get`
- **Target physical file**: `tests/client/imp265_dual_platform_mobile_lod.test.ts`
- Thay thế định nghĩa nội bộ bằng import từ `tests/helpers/threejs_test_utils`.
- TC-265.13: Nạp mẫu thứ 61 (33.33ms) chứng minh vòng đệm tròn ghi đè giới hạn 60 mẫu mà không đọc biến private `maxSamples`.
- TC-265.15: Nạp 1 mẫu 20ms sau khi `reset()` chứng minh FPS cập nhật ngay về 50 mà không đọc biến private `frameIndex`.

---

## 3. MA TRẬN TEST HỢP ĐỒNG TRẠM 1 (STATION 1 CONTRACT SPECIFICATIONS)

> **File kiểm thử:** `tests/contracts/imp266_1_type_cleanliness_and_ast_helper.test.ts`

- TC-266.1.01 [UC-IMP266.1/MSS]: `captureTree` kết xuất component trong giai đoạn render tĩnh mà không gắn DOM thật.
- TC-266.1.02 [UC-IMP266.1/MSS]: `findReactNode` tìm thấy nút con cấp 1 khớp với predicate.
- TC-266.1.03 [UC-IMP266.1/MSS]: `findReactNode` đệ quy qua các component lồng nhau và Fragment.
- TC-266.1.04 [UC-IMP266.1/MSS]: `findReactNodes` thu thập toàn bộ các nút thỏa mãn điều kiện lọc.
- TC-266.1.05 [UC-IMP266.1/MSS]: `getNodeType` trả về chuỗi thẻ nguyên bản hoặc tên component fallback.
- TC-266.1.06 [UC-IMP266.1/A1]: `findReactNode` trả về null khi không tìm thấy nút mục tiêu trong cây.
- TC-266.1.07 [UC-IMP266.1/A2]: `findReactNode` xử lý an toàn với các nút con là null, undefined, boolean hoặc chuỗi.
- TC-266.1.08 [UC-IMP266.1/A3]: `findReactNode` đệ quy duyệt qua mảng phần tử gốc (Array root fragments).
- TC-266.1.09 [UC-IMP266.1/A4]: `getNodeProps` trích xuất props an toàn hoặc trả về rỗng khi nút là null.
- TC-266.1.10 [UC-IMP266.1/MSS]: Đối tượng rỗng thông thường `{}` trong TypeScript không bị gán thuộc tính test của `Object`.

---

## 4. BẢNG ĐO LƯỜNG NGÂN SÁCH DÒNG MÃ (PRE-CODING LOC BASELINE)

| Tệp Tin Mục Tiêu | Phân Hạng Tier | Dòng Hiện Tại | Dự Kiến Sau Sửa | Biến Thiên (Delta) | Trần Ngân Sách | Đánh Giá |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `src/client/types/global.d.ts` | Tier 1 (Logic) | 50 | 44 | -6 dòng | <= 400 dòng | ✔️ Safe |
| `tests/helpers/threejs_test_utils.ts` | Test Helper | 0 (Mới) | ~90 | +90 dòng | <= 300 dòng | ✔️ Safe |
| `tests/contracts/imp266_1_type_cleanliness_and_ast_helper.test.ts` | Test Suite | 0 (Mới) | ~130 | +130 dòng | <= 300 dòng | ✔️ Safe |
| `tests/client/imp265_dual_platform_mobile_lod.test.ts` | Test Suite | 419 | 385 | -34 dòng | <= 600 dòng | ✔️ Safe |

---

## 5. TIÊU CHÍ HOÀN THÀNH NGHIỆM THU (DEFINITION OF DONE)

- [ ] **DoD #1: Flow Taxonomy**: 100% ca test mang nhãn `[UC-IMP266.1/MSS]` hoặc `[UC-IMP266.1/A#]`.
- [ ] **DoD #2: Anti-TIDD Compliance**: Xóa sạch `interface Object` khỏi `src/client/types/global.d.ts`, không còn bất kỳ trường `any` nào cho test trong mã nguồn sản xuất.
- [ ] **DoD #3: Standardized AST Helper**: `threejs_test_utils.ts` cung cấp đầy đủ các tiện ích duyệt cây an toàn cho React 19.
- [ ] **DoD #4: Zero Reflect.get**: Loại bỏ hoàn toàn `Reflect.get` trong bộ test `imp265_dual_platform_mobile_lod.test.ts`.
- [ ] **DoD #5: Scaled Test Floor**: Đạt tối thiểu 10 ca test hợp đồng nguyên tử (vượt sàn 8 ca test cho Micro-Slice).
- [ ] **DoD #6: Pre-closing Gate**: `npm run prefilter` và `node scripts/check_evidence.mjs IMP-266_1` đạt kết quả PASS 100%.
