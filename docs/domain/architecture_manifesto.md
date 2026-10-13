# BẢN TUYÊN NGÔN KIẾN TRÚC VTCOON: DEEP MODULES & AI-FRIENDLY CODEBASE

> **Tài liệu SSOT định hướng thiết kế hệ thống**: Tham chiếu triết lý *A Philosophy of Software Design* (John Ousterhout) và tối ưu hóa hiệu suất cộng tác cùng AI Agent (Context Window, Attention Cache, Locality).

---

## I. BA CĂN BỆNH KHIẾN CODEBASE & AI AGENT "ĐUỐI SỨC"

### 1. Căn Bệnh "Nổ Giao Diện" (Props Explosion / Shallow Modules)
- **Khái niệm**: Module nông (Shallow Module) là module có giao diện (Interface) quá rộng nhưng phần thân (Implementation) lại mỏng, chủ yếu làm nhiệm vụ phân luồng `if-else` hoặc chuyển tiếp (pass-through).
- **Minh chứng vật lý**: `LayeredDioramaTile` trong `src/client/3d/board_tile.tsx` từng gánh tới 19 props, trong đó có 6 cờ boolean chỉ để bật/tắt các lớp con:
  ```typescript
  readonly renderToyBuildings?: boolean;
  readonly renderBasePlinth?: boolean;
  readonly renderAtlasSurface?: boolean;
  readonly renderOwnerBorders?: boolean;
  readonly renderPricePillTray?: boolean;
  readonly renderPricePill?: boolean;
  ```
- **Hệ quả đối với AI Agent**: Cứ mỗi lần tối ưu một tầng (IMP-363 gộp đế, IMP-377 gộp khay, IMP-381 gộp nhãn), lập trình viên lại "đục" thêm một prop cờ boolean. Để render bàn cờ, AI Agent phải nhồi vào bộ nhớ 19 tham số và mạng lưới phụ thuộc chéo giữa chúng. Interface càng rộng, xác suất AI sinh ra bug kết hợp (combinatorial bugs) càng lớn.

---

### 2. Căn Bệnh "Client Giải Toán Ngược Dòng Tiền" (Financial Reverse-Engineering)
- **Khái niệm**: Vi phạm nguyên tắc phân định trách nhiệm. Lẽ ra giao diện giữa Server $\rightarrow$ Client phải là các **Domain Events** tường minh và sâu sắc, thì hệ thống lại bắt Client làm thám tử tư.
- **Minh chứng vật lý**: Như mổ xẻ ở ticket IMP-380 (`game_event_financial_synthesizer.ts`): Server biết rõ khi nào người chơi tất toán trái phiếu, nhưng chỉ gửi về delta chênh lệch số dư ròng `diff = balance_moi - balance_cu`. Client phải viết hơn 900 dòng code heuristic (`matchRentTransactions`, `extractBondEvents`, `extractHoseEvents`) để trừ dần số dư xem đó là tiền gì.
- **Hệ quả đối với AI Agent**: Khi AI sửa logic cho nghiệp vụ Trái Phiếu, nó vô tình làm hỏng logic qua ô GO hoặc tiền thuê (Lỗi **Netting Collision**). Tính cục bộ (Locality) rơi về mức 0: Một thay đổi nhỏ ở một nghiệp vụ kinh tế sẽ dội sóng thần sang toàn bộ các nghiệp vụ kinh tế khác.

---

### 3. Căn Bệnh "Xé Vụn File Né Trần 400 LOC" (File Sprawl & Seam Giả Tạo)
- **Khái niệm**: Sự phản tác dụng của các cổng kiểm soát cơ học cứng nhắc.
- **Minh chứng vật lý**: Khi file chạm 350-380 LOC, phản xạ tự nhiên của agent là cắt một hàm 30 dòng ra một file helper độc lập chỉ có đúng 1 nơi gọi (`Single-Call-Site Helper`).
- **Hệ quả đối với AI Agent**: Gotcha 6 (`deep_modules.md`) đã cảnh báo: Việc này biến một vấn đề cục bộ thành một Seam giả tạo (Hypothetical Seam). AI Agent phải mở thêm nhiều tab file vào context window chỉ để đọc một luồng logic thẳng đuột, gây loãng bộ nhớ chú ý (Attention Dilution).

---

## II. TRIẾT LÝ CỐT LÕI: "CODEBASE THÂN THIỆN VỚI AI" LÀ GÌ?

Trong kỷ nguyên Pair Programming với AI Agent, Codebase xuất sắc không đo bằng số dòng code ngắn hay dài, mà đo bằng **Độ Sâu (Depth = Leverage / Interface)** và **Tính Cục Bộ (Locality)**:

```
┌────────────────────────────────────────────────────────┐
│  AI-FRIENDLY ARCHITECTURE: DEEP MODULE                 │
├────────────────────────────────────────────────────────┤
│  Interface cực nhỏ (0 - 3 props, input/output rõ ràng) │  ◄── AI chỉ cần nạp 50 tokens
├────────────────────────────────────────────────────────┤
│  Implementation sâu và tự chịu trách nhiệm (Black Box) │  ◄── Logic & state giấu kín bên trong
└────────────────────────────────────────────────────────┘
```

1. **Leverage (Đòn bẩy)**: AI chỉ cần học một giao diện nhỏ xíu nhưng kích hoạt được khối lượng hành vi lớn và hoàn chỉnh.
2. **Locality (Tính cục bộ)**: Muốn sửa logic nhãn giá hay đường viền? Mọi thứ từ tính toán ma trận, texture atlas, instancing chỉ nằm đúng trong một module duy nhất.
3. **The Deletion Test (Bài kiểm tra xóa code)**: Hãy tưởng tượng xóa module đó đi. Nếu toàn bộ độ phức tạp biến mất sạch sẽ $\rightarrow$ Module đó hữu ích. Nếu xóa module đi mà độ phức tạp phân tán ngược lại vào 10 component cha $\rightarrow$ Module đó chỉ là một lớp bọc hời hợt (Pass-through wrapper).
4. **Quy Tắc Vàng Khi Tái Cấu Trúc**:
   > *"Mỗi lần refactor, mục tiêu phải là GIẢM SỐ LƯỢNG PROPS và GIẢM SỐ LƯỢNG FILE CẦN BIẾT ĐỂ LÀM MỘT VIỆC, chứ không phải là làm cho file ngắn đi."*

---

## III. BỐN TRỌNG ĐIỂM KỸ THUẬT & CẢNH BÁO THỰC CHIẾN

### 1. Phân Hệ 3D: Cảnh Báo "Re-render Thrashing" Trong React Three Fiber (R3F)
- **Cạm bẫy**: Ý tưởng để 40 ô `LayeredDioramaTile` tự gọi `useGameStore(selector)` là một cái bẫy tử thần. Khi xúc xắc lăn hay pawn di chuyển, 40 component 3D sẽ bị kích hoạt re-render liên tục trên CPU, gây sập FPS trên thiết bị di động.
- **Giải pháp chuẩn xác**: **Trảm tận gốc trách nhiệm tĩnh của Tile**:
  - `LayeredDioramaTile` đổi tên thành `DioramaCellEntity`: Chỉ chịu trách nhiệm cắm mô hình nhà 3D (`ProceduralBuilding`) và bắt raycast click.
  - Toàn bộ đế gạch, viền sở hữu, khay giá, nhãn giá chuyển 100% lên các lớp Batch/Instanced phía trên. Khi đó, 6 cờ boolean `renderX` **tự động biến mất vĩnh viễn** mà không cần nhồi store vào component con!

### 2. Phân Hệ Mạng & Kinh Tế: Server-Driven Explicit Domain Events
- **Mô hình phối hợp**:
  - `delta.domainEvents`: Server gửi mảng sự kiện nghiệp vụ tuần tự (`sequenceId` chuẩn xác) trong mỗi live tick để kích hoạt Badge, Audio, Screen Shake, Activity Log.
  - `GameState Store`: Vẫn là SSOT cho trạng thái tĩnh khi người chơi reconnect (`FULL_STATE_RESYNC`), không cần replay toàn bộ lịch sử sự kiện.
- **Lợi ích**: Triệt tiêu 100% lỗi Netting Collision, xóa bỏ hơn 700 dòng code suy đoán số dư ròng ở Client.

### 3. Đồ Họa Bàn Cờ: Hợp Nhất Thành `<BoardPropertyMarkersOverlay />` (0 props)
- **Bản chất ma trận $4 \times 4$**: Nhãn giá tiền và Khay vàng nằm đè lên nhau, chia sẻ 100% không gian tọa độ 3D (`computeCellMarkerMatrices`). Việc tách rời thành 2 component sẽ làm nhân đôi vòng lặp tính toán Transform.
- **Thiết kế chuẩn**: Đóng gói toàn bộ viền chân đế, đai độc quyền, khay vàng và nhãn giá vào một Deep Module duy nhất:
  ```tsx
  <BoardPropertyMarkersOverlay />
  ```
  Component tự quản lý Texture Atlas, Geometry, InstancedMesh. `BoardLayout` chỉ việc mount 1 lần duy nhất trong Scene (0 props).

### 4. Thể Chế SDLC: "Deep Module Exemption" Cho Hiến Pháp
- Quy định trần LOC cơ học (400 LOC) nếu áp dụng mù quáng sẽ trừng phạt các Deep Module tự trị (dài 450 dòng nhưng tự đóng kín) và tưởng thưởng cho việc xé vụn code thành các helper 30 dòng mồ côi.
- **Quy tắc bổ sung**:
  - **Deep Module Exemption**: Cho phép một module tự trị, có độ liên kết cao (high cohesion), ẩn giấu 100% độ phức tạp và có interface $\le 2$ exports được hưởng trần linh hoạt ($\le 500$ LOC).
  - **Single-Call-Site Helper Guard**: Nghiêm cấm tạo file helper độc lập mới nếu nó chỉ có duy nhất 1 consumer.

---

## IV. LỘ TRÌNH THỰC THI CHIẾN LƯỢC

1. **Giai đoạn 1 (Áp dụng ngay cho IMP-381)**:
   - Đóng gói toàn bộ nhãn giá vào `BoardPropertyMarkersOverlay` / `InstancedCellBordersAndTrays` dưới dạng Deep Module tự trị (Texture Atlas + Batched Geometry + Instanced Mesh).
   - Tuyệt đối không đục thêm prop `renderPricePill` vào `board_tile.tsx` hay `board_layout.tsx`.
2. **Giai đoạn 2 (Epic IMP-385: Server-Driven Explicit Domain Events)**:
   - Server phát `domainEvents` chuẩn hóa (`BOND`, `BUYOUT`, `HOSE`, `TAX`).
   - Rút gọn bộ `game_event_financial_synthesizer.ts` từ 900 dòng về một Event Router đơn giản $< 200$ dòng.
3. **Giai đoạn 3 (Epic 3D Tile Purge)**:
   - Xóa bỏ triệt để các fallback mesh cũ trong `board_tile.tsx`, chính thức đổi tên thành `DioramaCellEntity` với 0 cờ render boolean.
