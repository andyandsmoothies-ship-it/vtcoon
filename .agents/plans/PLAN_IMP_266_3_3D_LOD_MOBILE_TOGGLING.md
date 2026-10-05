# KẾ HOẠCH TRIỂN KHAI (IMPLEMENTATION PLAN)
# IMP-266.3: 3D LOD MOBILE TOGGLING & PERF BUDGET CLEANLINESS

> **Mã Lát Cắt:** IMP-266.3 (Micro-Slice 3 / Epic IMP-266)  
> **Tiêu đề:** 3D LOD Mobile Toggling & Perf Budget Cleanliness  
> **Phân loại:** Tier 2 Micro-Slice (Lean Plan Specification, Delta <= 50 LOC, Single Subsystem)  
> **Phân hệ mục tiêu:** `client-3d`  
> **Tài liệu tham chiếu:** `docs/domain/gotchas/3d_cinematics.md` · `GEMINI.md` Hard Constraints  
> **Thẩm định trực quan (Visual Evidence Gate):** Cần chụp ảnh Dual-Viewport (`scripts/capture_visual_evidence.mjs --dual-viewport`) vì có thay đổi kết xuất 3D (ẩn hải âu và bọt sóng thuyền trên mobile).  

---

## 0. KHẢO SÁT BỀ MẶT MÃ NGUỒN (100% SURFACE INVENTORY)

| Tệp Tin Vật Lý | Tọa Độ Dòng | Phân Loại | Hành Động Kỹ Thuật Cụ Thể |
| :--- | :---: | :---: | :--- |
| `src/client/3d/coastal_seagulls.tsx` | L23 | **Modify** | Short-circuit `if (isMobile) return null;` ở đầu component, giải phóng hoàn toàn 25 meshes trên mobile. |
| `src/client/3d/coastal_patrol_boat.tsx` | L125-L144 | **Modify** | Bao bọc cụm `<group>` bọt sóng đuôi thuyền bằng `{!isMobile && (...) }`, loại bỏ 2 meshes bọt sóng trên mobile. |
| `src/client/3d/perf_budget.ts` | L220-L224, L236-L242 | **Modify** | Bổ sung `degradedDurationMs` & `optimalDurationMs` vào `deviceContext`, xóa bỏ hardcode `1500ms` split-brain timer. |
| `tests/client/imp265_dual_platform_mobile_lod.test.ts` | L196-L220 | **Modify** | Reconcile TC-265.09: Xác nhận `CoastalSeagulls({ isMobile: true })` trả về `null` thay vì render tĩnh. |
| `tests/contracts/imp266_3_3d_lod_mobile_toggling.test.ts` | Mới (L1-L160) | **Create** | Bộ 8 bài test hợp đồng Station 1 kiểm chứng hành vi 3D LOD trên mobile và tính toán DPR của perfBudget. |

---

## 1. THIẾT KẾ KIẾN TRÚC & HỢP ĐỒNG GIAO DIỆN (DEEP ARCHITECTURE)

```
main.tsx (useIsMobile) ──► GameCanvas ──► GameBoard ──► CoastalIslandEnvironment
                                                               │
                                       ┌───────────────────────┴───────────────────────┐
                                       ▼                                               ▼
                              CoastalSeagulls                                  CoastalPatrolBoat
                       (isMobile ? null : 25 meshes)                   (isMobile ? 0 wake : 2 wake meshes)
```

- **Dual-Platform Performance & Mobile Thermal Invariant (IMP-265)**:
  - Trên Mobile (`isMobile === true`): Các chi tiết vi mô ngoài khơi không thiết yếu (hải âu bay lượn ở xa, bọt sóng vẹt sau đuôi ca-nô tuần duyên) được unmount hoàn toàn khỏi Scene Graph WebGL, tiết kiệm draw calls và đỉnh tam giác.
  - Trên Desktop (`isMobile === false`): Giữ nguyên trọn vẹn 100% độ trung thực đồ họa AAA thương mại (đàn hải âu 5 con, dải bọt nước rẽ sóng 2 mạn ca-nô).
- **Zero Split-Brain Timer trong PerfBudgetController**:
  - `PerfBudgetController` chỉ là pure calculator nhận các tham số thời lượng thực từ `deviceContext` (do `AdaptiveDprController` truyền vào), không tự gán mặc định 1500ms làm sai lệch trạng thái DPR.

---

## 2. CHI TIẾT CÁC TÁC VỤ TRIỂN KHAI (LEAN TASKS)

### Task 1: Short-circuit Unmount Đàn Hải Âu trên Mobile
- **Target physical file**: `src/client/3d/coastal_seagulls.tsx`
- Sửa hàm `CoastalSeagulls`:
```tsx
export function CoastalSeagulls({ isMobile = false }: { readonly isMobile?: boolean } = {}): React.ReactElement | null {
  if (isMobile) return null;
  const birdsRef = useRef<(Group | null)[]>([]);
  ...
```

### Task 2: Ẩn Vệt Bọt Nước Rẽ Sóng Ca-nô Tuần Duyên trên Mobile
- **Target physical file**: `src/client/3d/coastal_patrol_boat.tsx`
- Bao bọc cụm mesh bọt sóng:
```tsx
      {/* 5. VỆT BỌT NƯỚC RẼ SÓNG ĐUÔI TÀU (Dynamic Foam Wake V-Trails) */}
      {!isMobile && (
        <group position={[0, -0.01, -0.8]}>
          <mesh ref={wakeLeftRef} position={[-0.35, 0, -0.6]} rotation={[-Math.PI / 2, 0, 0.35]}>
            <planeGeometry args={[0.3, 1.4]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.48} />
          </mesh>
          <mesh ref={wakeRightRef} position={[0.35, 0, -0.6]} rotation={[-Math.PI / 2, 0, -0.35]}>
            <planeGeometry args={[0.3, 1.4]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.48} />
          </mesh>
        </group>
      )}
```

### Task 3: Xóa Bỏ Split-Brain Timer trong `perf_budget.ts`
- **Target physical file**: `src/client/3d/perf_budget.ts`
- Mở rộng kiểu `deviceContext`:
```typescript
    deviceContext?: {
      isMobile?: boolean;
      currentDpr?: number;
      degradedDurationMs?: number;
      optimalDurationMs?: number;
    }
```
- Trong `getBudgetReport`:
```typescript
    const dprEval = this.calculateAdaptiveDpr({
      isMobile,
      currentFps: avgFps,
      currentDpr,
      degradedDurationMs: deviceContext?.degradedDurationMs ?? 0,
      optimalDurationMs: deviceContext?.optimalDurationMs ?? 0,
    });
```

### Task 4: Reconcile Bài Test Hồi Quy TC-265.09
- **Target physical file**: `tests/client/imp265_dual_platform_mobile_lod.test.ts`
- Cập nhật TC-265.09: Khẳng định `CoastalSeagulls({ isMobile: true })` trả về `null` và trên desktop `{ isMobile: false }` trả về đầy đủ đàn chim.

---

## 3. MA TRẬN TEST HỢP ĐỒNG TRẠM 1 (STATION 1 CONTRACT SPECIFICATIONS)

> **File kiểm thử:** `tests/contracts/imp266_3_3d_lod_mobile_toggling.test.ts`

- TC-266.3.01 [UC-IMP266.3/MSS]: `CoastalSeagulls` trả về `null` khi `isMobile` là true (unmount toàn bộ 25 meshes).
- TC-266.3.02 [UC-IMP266.3/MSS]: `CoastalSeagulls` kết xuất đầy đủ đàn chim 5 con khi `isMobile` là false.
- TC-266.3.03 [UC-IMP266.3/MSS]: `CoastalPatrolBoat` không kết xuất cụm bọt sóng rẽ nước khi `isMobile` là true.
- TC-266.3.04 [UC-IMP266.3/MSS]: `CoastalPatrolBoat` kết xuất đầy đủ 2 dải bọt sóng rẽ nước khi `isMobile` là false.
- TC-266.3.05 [UC-IMP266.3/MSS]: `PerfBudgetController.getBudgetReport` đọc `degradedDurationMs` và `optimalDurationMs` từ `deviceContext`.
- TC-266.3.06 [UC-IMP266.3/A1]: `PerfBudgetController.getBudgetReport` mặc định thời lượng là 0 khi không có `deviceContext` (không hardcode 1500ms).
- TC-266.3.07 [UC-IMP266.3/A2]: `PerfBudgetController.calculateAdaptiveDpr` chỉ kích hoạt hạ DPR khi `degradedDurationMs >= 1500` và FPS < 45.
- TC-266.3.08 [UC-IMP266.3/A3]: `CoastalIslandEnvironment` truyền cờ `isMobile` đồng bộ xuống `CoastalSeagulls` và `CoastalPatrolBoat`.

---

## 4. BẢNG ĐO LƯỜNG NGÂN SÁCH DÒNG MÃ (PRE-CODING LOC BASELINE)

| Tệp Tin Mục Tiêu | Phân Hạng Tier | Dòng Hiện Tại | Dự Kiến Sau Sửa | Biến Thiên (Delta) | Trần Ngân Sách | Đánh Giá |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `src/client/3d/coastal_seagulls.tsx` | Tier 2 (3D) | 147 | 149 | +2 dòng | <= 500 dòng | ✔️ Safe |
| `src/client/3d/coastal_patrol_boat.tsx` | Tier 2 (3D) | 148 | 150 | +2 dòng | <= 500 dòng | ✔️ Safe |
| `src/client/3d/perf_budget.ts` | Tier 1 (Domain/Math) | 300 | 302 | +2 dòng | <= 400 dòng | ✔️ Safe (Warning buffer: 302/400) |
| `tests/contracts/imp266_3_3d_lod_mobile_toggling.test.ts` | Test Suite | 0 (Mới) | ~160 | +160 dòng | <= 300 dòng | ✔️ Safe |

- **Tech Debt Note for `perf_budget.ts`**: Tệp đạt 302 LOC (> 300 LOC Tier 1). Đã nằm trong ngân sách cho phép (<= 400 LOC ceiling). Sẽ được tái cấu trúc trích xuất DTO `AdaptiveDprParams` sang tệp riêng trong tương lai nếu vượt ngưỡng 350 LOC.

---

## 5. TIÊU CHÍ HOÀN THÀNH NGHIỆM THU (DEFINITION OF DONE)

- [ ] **DoD #1: Flow Taxonomy**: 100% ca test mang nhãn `[UC-IMP266.3/MSS]` hoặc `[UC-IMP266.3/A#]`.
- [ ] **DoD #2: 3D Scene Graph Unmounting**: Unmount hải âu và bọt sóng ca-nô trên Mobile (`isMobile === true`), bảo tồn 100% chi tiết trên Desktop.
- [ ] **DoD #3: Zero Split-Brain Timer**: `perfBudget` không duy trì timer hardcode 1500ms độc lập.
- [ ] **DoD #4: Scaled Test Floor**: Đạt tối thiểu 8 ca test hợp đồng nguyên tử cho Micro-Slice.
- [ ] **DoD #5: Pre-closing Gate**: `npm run prefilter` và `node scripts/check_evidence.mjs IMP-266_3` đạt kết quả PASS 100%.
