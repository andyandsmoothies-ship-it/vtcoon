# [KẾ HOẠCH NÂNG CẤP KIẾN TRÚC] IMP-227: Tuyến Cầu Cạn Metro Số 1 TP.HCM, Ga Mái Vòm Cánh Buồm Bạt Căng & Đoàn Tàu Siêu Tốc Xanh Cyan - Bạc Kim Loại

> **Tiêu Chuẩn**: Tuân thủ nghiêm ngặt Hiến pháp Antigravity 2.0 (`GEMINI.md`), ASD-STE100, quy trình 3 trạm (Station 1 RED -> Station 2 GREEN -> Station 2.5 Scout -> Station 3 Independent Review).  
> **Tài Liệu Căn Cứ & Ảnh Thực Tế**:
> - `media_1790673767997.jpg`: Tuyến cầu cạn U-Girder Metro Số 1 chạy dọc Xa lộ Hà Nội / Võ Nguyên Giáp, trụ cầu bê tông cốt thép, cột cần tiếp điện trên cao và hậu cảnh Landmark 81.
> - `media_1790673778059.jpg`: Nhà ga trên cao kiến trúc mái vòm bạt căng hình cánh buồm trắng sứ đặc trưng (Ga Khu Công Nghệ Cao / Tân Cảng), khung sườn thép cong, vách kính an toàn ke ga.
> - `media_1790673789428.jpg`: Đoàn tàu Metro Tuyến 1 màu xanh da trời / cyan (`#0284C7` / `#0EA5E9`) phối thân bạc metallic (`#E2E8F0`), mũi tàu khí động học vát nhọn, cần tiếp điện trên nóc toa, chạy trên cầu cạn đôi có lan can bảo vệ bê tông.
> - **Biên bản thẩm định Griller**: [`.agents/audit/PLAN_AUDIT_IMP-227.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-227.md) (đã tiếp thu 100% 3 điểm P1 và 2 điểm P2).

---

## 1. KIẾN TRÚC THỊ GIÁC & DÒNG CHẢY DỮ LIỆU (VISUAL ARCHITECTURE)

```text
[Reference Photos: media_1790673767997, media_1790673778059, media_1790673789428]
                                │
                                ▼
         ┌──────────────────────────────────────────────┐
         │ IMP-227: HCMC Metro Line 1 Modernization     │
         └──────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ Elevated Viaduct │   │ Tensile Stations │   │ Cyan-Silver Train│
│ & Concrete Piers │   │  Arched Canopies │   │  Streamlined Cab │
└──────────────────┘   └──────────────────┘   └──────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
• U-Girder Parapets     • Tensile White   • Aero Sky Blue Nose
  (#94A3B8 / #CBD5E1)     Canopy (#F8FAFC)  (#0284C7 / #0EA5E9)
• Cylindrical Piers     • Steel Arched    • Metallic Silver Body
  (#CBD5E1 / #94A3B8)     Truss (#1E293B)   (#E2E8F0) + Cyan Stripe
• Catenary Masts        • Glass Platform  • LED Windshield &
  (#64748B, Y=0.155m)     Doors (#38BDF8)   Headlights + Red Accent
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                │
                                ▼
         ┌──────────────────────────────────────────────┐
         │ src/client/3d/diorama/diorama_railroad.tsx   │
         │ (Tier 2 <= 500 LOC, Zero-Degradation 60 FPS) │
         └──────────────────────────────────────────────┘
                                │
                                ▼
         ┌──────────────────────────────────────────────┐
         │ tests/client/hcmc_metro_line1_...test.ts     │
         │ (16 atomic contract tests, 5-Facet Matrix)   │
         └──────────────────────────────────────────────┘
```

---

## 2. BẢNG ĐỐI SOÁT HỢP ĐỒNG BẤT BIẾN & HIỆN TRẠNG (SSOT RECONCILIATION)

| Đối Tượng Hợp Đồng | Hiện Trạng (Old Railway) | Mục Tiêu Nâng Cấp (HCMC Metro Line 1) | Bảo Toàn Hợp Đồng Hiện Có & Phòng Ngừa Điểm Mù Griller |
| :--- | :--- | :--- | :--- |
| **Bệ đường ray** (`diorama-railroad-ballast`) | Đá dăm phẳng xám sỏi `#475569`, 4 thanh dẹt. | Cầu cạn đôi U-Girder bê tông đúc sẵn với lan can bảo vệ hai bên (`#94A3B8`), trụ cầu trụ tròn (`#CBD5E1`) và cột cần tiếp điện overhead catenary masts (`#64748B`). | **Khắc phục P1 #2**: 4 mesh ballast chính giữ nguyên ở đầu khối JSX để khớp trọn trong 800 ký tự cắt chuỗi của `TC-RBWS01.02-04`. Trụ cầu & lan can U-girder render ngay sau. |
| **Tà vẹt & ray** (`diorama-model-railroad`) | Tà vẹt gỗ sẫm màu `#451A03`, 2 ray kim loại `#E2E8F0`. | Bản đệm tà vẹt bê tông bảo vệ `#451A03`, ray thép đôi sáng bóng `#E2E8F0` ở $Y=0.032m$. | **Khắc phục P1 #3**: Giữ nguyên tối thiểu 4 mesh tà vẹt `#451A03` làm direct children trong `DioramaModelRailroad` (không bọc vào functional subcomponent) để bảo vệ `TC-IMP142.09` & `TC-MRL01.02`. |
| **Ga Nam Bến Sông** (`diorama-waterfront-station`) | Mái dẹt màu cam hổ phách `#D97706`, cột đơn giản. | Ga trên cao mái vòm bạt căng hình cánh buồm màu trắng sứ (`#F8FAFC`), khung sườn thép uốn cong (`#1E293B`), thềm granite (`#E2E8F0`), cửa kính an toàn ke ga mờ (`#38BDF8`). | **Khắc phục P1 #2**: Thềm ke ga `#E2E8F0`, khung mái `#1E293B` và ghế ngồi `#78350F` đặt ở đầu khối JSX để khớp cửa sổ 1200 ký tự của `TC-RBWS01.06-08`. Mái vòm cánh buồm và vách kính PSD đặt tiếp theo. |
| **Ga Bắc Landmark** (`diorama-landmark-north-station`) | Hộp chữ nhật mái phẳng kính xanh lơ. | Ga Landmark Metro hiện đại mái vòm khí động học trắng sứ viền xanh cyan (`#0284C7`), biển hiệu LED (`#FEF08A`), hệ thống cột đỡ đôi. | Giữ nguyên `data-testid="diorama-landmark-north-station"`, tọa độ $Z \le -5.5$, biển hiệu LED, bảo vệ `TC-IMP134.16` & `TC-IMP134.20`. |
| **Đoàn tàu mô hình** (`leadRef`, `coach1Ref`, `coach2Ref`) | Đầu máy xe lửa đỏ thô sơ `#DC2626`, 2 toa khách xanh lam thô sơ. | Đoàn tàu siêu tốc Metro Tuyến 1: Đầu tàu vát nhọn khí động học màu xanh Cyan (`#0284C7` / `#0EA5E9`), thân xe màu bạc kim loại (`#E2E8F0`) có dải sọc Cyan chạy dọc thân, dải kính tối màu (`#0F172A`), đèn pha LED và điểm nhấn đèn an toàn đỏ `#DC2626`. Toa khách có cần tiếp điện nóc (`#64748B`). | Giữ nguyên cả `#0284C7` và `#DC2626` trong markup tĩnh (đáp ứng `TC-IMP134.21` & `TC-MRL01.04`), kinematic offsets `[0, 0.85, 1.70]`. |
| **Khoảng hở Cột Tiếp Điện** (`catenary masts`) | Chưa có cột tiếp điện. | Cột tiếp điện vươn ngang trên cao đón đỉnh pantograph toa tàu. | **Khắc phục P2 #2**: Chiều cao cột đứng $0.17m$, thanh vươn ngang đặt ở cao độ $Y = 0.155m$ để khít đỉnh pantograph và loại bỏ hoàn toàn nguy cơ mesh clipping. |
| **Nhịp nghiêng động lực học** (`pitch dynamics`) | Viết inline trong `useSafeFrame`. | Tách hàm thuần khiết `computeTrainPitch(speed, t)`. | **Khắc phục P2 #1**: Đưa hàm vào `diorama_train_kinematics.ts` để unit test độc lập trong Vitest SSR. |

---

## 3. MA TRẬN 5 DIỆN HỢP ĐỒNG TEST TOÀN NĂNG (UNIVERSAL 5-FACET MATRIX)

Tạo tệp kiểm thử mới: `tests/client/hcmc_metro_line1_infrastructure.test.ts` gồm đúng 16 kiểm thử nguyên tử:

- **Facet 1: Boundary & Curve Geometry (Cầu Cạn & Trụ Bê Tông)**:
  - `TC-METRO.01`: `DioramaBallastBed` kết xuất cầu cạn U-Girder với 2 dải lan can bê tông bảo vệ dọc 4 cạnh.
  - `TC-METRO.02`: Tuyến cầu cạn trang bị hệ thống trụ đỡ bê tông cốt thép hình trụ tròn (`SafeCylinderGeometry`, `#CBD5E1`) dọc các nhịp.
  - `TC-METRO.03`: Tuyến metro trang bị hệ thống cột cần tiếp điện trên cao (catenary masts) dọc hành lang đường ray với thanh vươn ở cao độ $Y \ge 0.15m$.
  - `TC-METRO.04`: Khổ cầu cạn và cao độ Y đảm bảo tính bảo toàn trong dải $[0.015m, 0.035m]$.
- **Facet 2: Reactivity & Kinematics (Đoàn Tàu Metro & Nhịp Nghiêng)**:
  - `TC-METRO.05`: Đầu tàu Metro khí động học sở hữu mũi vát nhọn màu xanh da trời Metro (`#0284C7` / `#0EA5E9`).
  - `TC-METRO.06`: Thân tàu sở hữu lớp vỏ kim loại màu bạc sáng (`#E2E8F0` / `#F8FAFC`) phối dải sơn thương hiệu Cyan đặc trưng của Metro TP.HCM.
  - `TC-METRO.07`: Toa tàu khách trang bị cụm điều hòa và cần tiếp điện nóc toa (pantograph).
  - `TC-METRO.08`: Hàm `computeTrainPitch(speed, t)` tính toán độ nghiêng động lực học chính xác: bằng 0 khi dừng đỗ và dao động hình sin tuần hoàn khi đang chạy cruise.
- **Facet 3: Tensile Canopy Stations (Kiến Trúc Ga Mái Vòm Cánh Buồm)**:
  - `TC-METRO.09`: Ga Waterfront sở hữu mái vòm bạt căng hình cánh buồm màu trắng sứ (`#F8FAFC`) và khung thép uốn cong (`#1E293B`).
  - `TC-METRO.10`: Ga Waterfront trang bị vách cửa kính an toàn ke ga mờ (Platform Screen Doors) màu xanh kính biếc (`#38BDF8`).
  - `TC-METRO.11`: Ga Landmark North sở hữu mái vòm hiện đại viền xanh cyan thương hiệu Metro và biển hiệu phát sáng LED.
  - `TC-METRO.12`: Vị trí hai nhà ga được cố định chuẩn mực tại bờ Nam ($Z \approx 6.55$) và bờ Bắc ($Z \le -5.5$).
- **Facet 4: Error Defense & Preservation (Bảo Tồn Bất Biến & Phòng Thủ Lỗi)**:
  - `TC-METRO.13`: Kết xuất tĩnh SSR không chứa `NaN`, `undefined`, hoặc thuộc tính hỏng.
  - `TC-METRO.14`: Bảo tồn 100% các `data-testid` cốt lõi: `diorama-railroad-ballast`, `diorama-model-railroad`, `diorama-waterfront-station`, `diorama-landmark-north-station`, `diorama-tropical-flora`.
  - `TC-METRO.15`: Bảo tồn sự hiện diện của màu `#DC2626` và `#0284C7` trong markup đoàn tàu tĩnh để tương thích hoàn toàn với bộ test cũ `imp134`.
  - `TC-METRO.16`: Toàn bộ các mesh tà vẹt và móng cầu cạn tắt hoàn toàn `castShadow` để tuân thủ ngân sách đổ bóng GPU (IMP-142).

---

## 4. CHI TIẾT TRIỂN KHAI VẬT LÝ & KIỂM TOÁN LOC BUDGET (CONCRETE DROP-IN SNIPPETS)

### 4.1 Kiểm Toán Dòng Mã (LOC Budget Ledger)

- **Tệp mục tiêu**: `src/client/3d/diorama/diorama_railroad.tsx`.
- **Baseline trước sửa đổi**: **352 LOC**.
- **Mã cũ loại bỏ**: ~50 LOC (khối đầu tàu cũ và mái phẳng cũ).
- **Mã mới thêm vào**: ~120 LOC (mảng cấu hình trụ cầu, cột tiếp điện, mái vòm bạt căng, tàu metro 3 toa tinh gọn).
- **Dự kiến sau sửa đổi**: $352 - 50 + 120 = \mathbf{422\text{ LOC}}$ (Dư địa an toàn **78 dòng** dưới trần 500 dòng của Tier 2).

### 4.2 Drop-in Snippet 1: Hàm Thuần Khiết `computeTrainPitch` tại `diorama_train_kinematics.ts`

```typescript
export function computeTrainPitch(speed: number, elapsedTime: number): number {
  return speed > 0.01 ? Math.sin(elapsedTime * 12) * 0.005 : 0;
}
```

### 4.3 Drop-in Snippet 2: Cấu Trúc Dữ Liệu Nén tại `diorama_railroad.tsx`

```typescript
// Mảng tọa độ trụ cầu cạn bê tông hình trụ tròn
const VIADUCT_PIER_POSITIONS: readonly [number, number, number][] = [
  [-3.5, 0.01, -6.9], [0, 0.01, -6.9], [3.5, 0.01, -6.9],
  [-3.5, 0.01, 6.9], [0, 0.01, 6.9], [3.5, 0.01, 6.9],
  [-6.9, 0.01, -3.5], [-6.9, 0.01, 0], [-6.9, 0.01, 3.5],
  [6.9, 0.01, -3.5], [6.9, 0.01, 0], [6.9, 0.01, 3.5],
];

// Mảng cột cần tiếp điện trên cao (Catenary Masts: cột đứng Y=0.09m, cao 0.17m; tay vươn Y=0.155m)
const CATENARY_MAST_POSITIONS: readonly [number, number, number, number][] = [
  [-4.8, 0, -7.1, 0], [4.8, 0, -7.1, 0],
  [-4.8, 0, 7.1, Math.PI], [4.8, 0, 7.1, Math.PI],
  [-7.1, 0, -4.8, -Math.PI / 2], [-7.1, 0, 4.8, -Math.PI / 2],
  [7.1, 0, -4.8, Math.PI / 2], [7.1, 0, 4.8, Math.PI / 2],
];
```

### 4.4 Drop-in Snippet 3: Thứ Tự JSX Chuẩn Mực của `DioramaBallastBed`

```tsx
export function DioramaBallastBed(): React.ReactElement {
  return (
    <group position={[0, 0, 0]} data-testid="diorama-railroad-ballast">
      {/* QUAN TRỌNG: 4 dải ray đá ballast phải render ĐẦU TIÊN để bảo vệ cửa sổ 800 ký tự cắt chuỗi */}
      <mesh receiveShadow position={[0, 0.018, -6.9]}>
        <SafeBoxGeometry args={[14.2, 0.016, 0.36]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[0, 0.018, 6.9]}>
        <SafeBoxGeometry args={[14.2, 0.016, 0.36]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[-6.9, 0.018, 0]}>
        <SafeBoxGeometry args={[0.36, 0.016, 14.2]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[6.9, 0.018, 0]}>
        <SafeBoxGeometry args={[0.36, 0.016, 14.2]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>

      {/* Lan can U-Girder bê tông đúc sẵn hai bên mép cầu cạn */}
      {/* ...render gọn gàng bằng map... */}
      {/* Hệ thống trụ cầu bê tông cốt thép hình trụ tròn */}
      {VIADUCT_PIER_POSITIONS.map((pos, idx) => (
        <mesh key={`pier-${idx}`} receiveShadow position={pos}>
          <SafeCylinderGeometry args={[0.07, 0.08, 0.02, 12]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.7} />
        </mesh>
      ))}

      {/* Cột cần tiếp điện trên cao (Catenary Masts) */}
      {CATENARY_MAST_POSITIONS.map((mast, idx) => (
        <group key={`cat-${idx}`} position={[mast[0], mast[1], mast[2]]} rotation={[0, mast[3], 0]}>
          <mesh position={[0, 0.085, 0]}>
            <SafeCylinderGeometry args={[0.01, 0.012, 0.17, 8]} />
            <meshStandardMaterial color="#64748B" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.155, 0.1]}>
            <SafeBoxGeometry args={[0.01, 0.01, 0.22]} />
            <meshStandardMaterial color="#64748B" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
```

---

## 5. KẾ HOẠCH BÀN GIAO 3 TRẠM (STATION PIPELINE EXECUTION PLAN)

1. **Station 1 (RED Contract Test)**:
   - Viết tệp kiểm thử `tests/client/hcmc_metro_line1_infrastructure.test.ts` (16 test cases).
   - Bổ sung export stub `computeTrainPitch` nếu cần.
   - Chạy `npx vitest run tests/client/hcmc_metro_line1_infrastructure.test.ts` và chứng minh thất bại (Adversarial Inversion).
2. **Station 2 (GREEN Implementation)**:
   - Triển khai `computeTrainPitch` vào `diorama_train_kinematics.ts`.
   - Triển khai toàn bộ thiết kế Metro Tuyến 1 vào `src/client/3d/diorama/diorama_railroad.tsx`.
   - Chạy lại kiểm thử `tests/client/hcmc_metro_line1_infrastructure.test.ts` cùng 4 bộ test cũ liên quan (`imp134`, `railroad_ballast`, `model_railroad`, `imp142`).
   - Kiểm tra `npx tsc --noEmit` đạt 0 lỗi.
   - Kiểm tra `npm run check:loc` đạt ngân sách Tier 2 <= 500 LOC.
3. **Station 2.5 (Sweeping Scout Audit)**:
   - Quét 5 lỗi phổ quát (rò rỉ tài nguyên, closure cũ, ngoại lệ unhandled, cast bẩn `as any`, dead code).
4. **Station 3 (Independent Review)**:
   - Mời các reviewer chuyên biệt (`spec-reviewer`, `code-reviewer`, `game-3d-visual-critic`) nghiệm thu thực tế trên đĩa vật lý.
