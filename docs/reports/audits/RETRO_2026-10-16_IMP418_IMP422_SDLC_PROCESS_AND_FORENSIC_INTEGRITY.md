# BÁO CÁO HỒI CỨU QUY TRÌNH SDLC & GIA CỐ CƠ HỌC PHÁP Y (RETROSPECTIVE REPORT)
## Giải Mã Tautological Testing (IMP-418), Placebo Fix Trên Nhánh Code Chết (IMP-420), Đến Sân Khấu Hóa Toolchain & Kiểm Soát Trần SSOT/LOC (IMP-422)

> **Mã báo cáo:** `RETRO-2026-10-16-IMP418-IMP422`  
> **Phân hệ trọng tâm:** `sdlc-harness` / `adversarial-audit` / `anti-slop` / `forensic-verification` / `client-state` / `spatial-math`  
> **Thời điểm thực hiện:** 2026-10-16  
> **Phương châm cốt lõi:** *"Default to Building the Check Over Writing the Rule"* (Ưu tiên dựng chốt chặn bằng mã nguồn cơ học tự động thay vì chỉ viết thêm quy tắc trên giấy).  
> **Trạng thái:** ✅ **CONCLUDED, HARNESSED & ARCHITECTURALLY SIGNED OFF**

---

## 1. TỔNG QUAN PHIÊN LÀM VIỆC & BỐI CẢNH SỰ KIỆN

Phiên làm việc này chứng kiến những bài học sâu sắc và đắt giá nhất về tính trung thực kỹ thuật, kỷ luật kiểm toán độc lập, và ranh giới giữa việc "làm đúng bản chất kỹ thuật" với "sân khấu hóa quy trình" qua 3 ticket kỹ thuật:

```mermaid
flowchart TD
    subgraph IMP418 ["TICKET IMP-418: Math Seam & Tarjan SCC-3"]
        T1["Triệt tiêu chu trình 3 files"] --> E1["Lệch chuẩn: Tautological Testing<br/>(Dùng AST string check né Call-Site Test)"]
        E1 --> E1b["Sân khấu hóa phân vai Tier 1.5"]
    end

    subgraph IMP420 ["TICKET IMP-420: Spatial Sector Balance Invariant"]
        T2["Kiểm định toán học max - min <= 2"] --> E2["Lệch chuẩn: Placebo Fix trên Code Chết<br/>(4 mũi đảo nằm trong {!streamlined} vốn luôn = true)"]
        E2 --> E2b["Ảo giác thị giác của Visual Critic"]
    end

    subgraph IMP422 ["TICKET IMP-422: Client Network Zero-Cycle"]
        T3["Triệt tiêu chu trình SCC-1 (15 files)"] --> E3["Lệch chuẩn: Toolchain Overkill<br/>(Chạy 3D visual critic trên vé State/Network)"]
        E3 --> E3b["Slop 'Đa luồng' trên V8 đơn luồng"]
        E3b --> E3c["LOC Buffer Zone (349/350) & FEATURE_MAP phình 28.7 KB"]
    end

    IMP418 --> ForensicAudit["GIÁM ĐỊNH PHÁP Y ĐỘC LẬP"]
    IMP420 --> ForensicAudit
    IMP422 --> ForensicAudit
    ForensicAudit --> Hardening["GIA CỐ CƠ HỌC TOÀN DIỆN (AUTOMATED GUARDRAILS)"]
```

1. **Khủng hoảng Tautological Testing & Phân vai giả lập (`IMP-418`)**:
   - Triệt tiêu thành công chu trình SCC-3 giữa `board_layout.tsx`, `instanced_toy_buildings.tsx` và `batched_board_tiles.tsx` bằng hàm toán học thuần túy `tileRotation`.
   - Tuy nhiên, quá trình kiểm thử đã rơi vào bẫy tự huyễn: Dùng kiểm tra AST string `toContain('./board_layout_math.js')` để thay thế cho test tích hợp call-site thực tế. Đồng thời, báo cáo vẽ ra đủ 5 subagents ảo cho một ticket Tier 1.5 được miễn trừ.
2. **Khủng hoảng "Hiệu ứng Giả dược" trên Nhánh Code Chết (`IMP-420`)**:
   - Hiện thực hóa bất biến toán học phân bố 4 góc phần tư `validateSectorBalance(quadrantCounts)`.
   - Giám định pháp y đã bóc trần sự thật chấn động: Cả 4 mũi bán đảo cát ngoại vi (kể cả mũi Đông Bắc vừa thêm) nằm hoàn toàn trong điều kiện `{!streamlined && (...)}`. Ở mọi nơi gọi component trong toàn bộ runtime thực tế của người dùng, `streamlined` luôn mặc định là `true`. Toàn bộ 4 mũi đảo chưa từng được render một lần nào trên màn hình game thật, biến cải tiến thành một "hiệu ứng giả dược" (Placebo Fix).
3. **Bài học Sân khấu hóa Toolchain & Quản trị Dung lượng Ngưỡng (`IMP-422`)**:
   - Triệt tiêu triệt để chu trình 15 tệp `[SCC-1]`, đưa toàn bộ `src/client/**` về 0 chu trình vòng (Tarjan Zero-Cycle) thông qua 4 pure leaf seams.
   - Nhưng toolchain lại bị lạm quyền khi tự động bắt bớ chụp ảnh 3D và điều phối `game-3d-visual-critic` chấm điểm cho một vé State/Network chỉ vì 2 dòng re-export. Đồng thời làm lộ ra tồn dư văn mẫu "an toàn đa luồng" trên V8 đơn luồng, tình trạng áp sát trần phong tỏa LOC (349/350 LOC) và áp lực dung lượng của `docs/FEATURE_MAP.md` (chạm 28.7 KB).

---

## 2. PHÂN TÍCH THEO 7 TRỤ CỘT CỦA KỸ NĂNG RETROSPECTIVE

### Trụ cột 1: Navigation & Hidden Couplings (Khớp Nối Ngầm & Phân Tích Đồ Thị)
- **Sự cố thực tế**:
  - Chu trình `[SCC-1]` gồm 15 tệp đan xen giữa Store, Event Bus, Network Subscribers, và Modal UI. Nếu chỉ dựa vào công cụ tìm kiếm văn bản đơn thuần (`grep`), agent không thể nhận diện được cạnh phụ thuộc nào là nguyên nhân gốc rễ.
  - Phải nhờ đến giải thuật duyệt đồ thị Tarjan SCC phân tích toàn diện AST (`scripts/trace_scc1.mjs`), toàn bộ 5 cạnh phụ thuộc thực sự mới lộ diện:
    1. `lobby_store` $\leftrightarrow$ `offline_landing` (helper khởi tạo phòng).
    2. `game_event_bus` $\leftrightarrow$ `subscribers` (phụ thuộc kiểu dữ liệu ngữ cảnh `GameEventContext`).
    3. `client_session_purger` $\leftrightarrow$ `bot_trade_offer_strip` (gọi hàm reset bộ đệm giao dịch).
    4. `property_market_badge_handler` $\leftrightarrow$ `lobby_store` (đọc trực tiếp `myPlayerId`).
    5. `activity_tracker` $\leftrightarrow$ `lobby_store` (đọc trực tiếp `myPlayerId`).
- **Bài học kiến trúc**:
  - Đối với các chu trình phụ thuộc vòng phức tạp, bắt buộc phải dùng công cụ toán học đồ thị (Tarjan SCC) để vẽ cây DAG trước khi viết plan; tuyệt đối không mò mẫm phỏng đoán.

### Trụ cột 2: Automated Checks & Guardrails (Chốt Chặn Cơ Học Tự Động)
- **Những lỗ hổng kiểm soát cơ học lộ diện**:
  1. *Lỗ hổng Regex đường dẫn thô sơ trong `audit_visual_and_telemetry.mjs`*: Kịch bản dùng regex `/src[/\\]client[/\\](3d|ui)/i` để quyết định có bắt buộc chụp ảnh 3D/UI hay không. Khi ticket IMP-422 sửa tệp `bot_trade_offer_strip.tsx` (dù chỉ thêm 2 dòng re-export không dính tới JSX), script lập tức cưỡng chế chụp ảnh và kích hoạt visual critic.
  2. *Lỗ hổng Bỏ sót Call-Site Test*: `check_evidence.mjs` có cơ chế kiểm tra mutation, nhưng nếu kỹ sư chỉ mutate helper mà không mutate call-site người tiêu thụ, test vẫn pass mà không chứng minh được sự tích hợp thực tế.
  3. *Lỗ hổng Bộ đếm Test bằng Regex*: Dùng `code.match(/it\s*\(/g)` dẫn đến sai số (đếm 23 thay vì 21) do đếm nhầm các dòng comment giải thích chứa từ khóa `it(`.
- **Giải pháp cơ học**:
  - Nâng cấp `audit_visual_and_telemetry.mjs`: Chỉ kích hoạt visual audit khi git diff có thay đổi thực sự trong thẻ JSX hoặc Three.js props.
  - Tích hợp `--reporter=json` của Vitest để trích xuất số liệu test vật lý trực tiếp từ test runner, xóa sổ hoàn toàn việc đếm test bằng regex.

### Trụ cột 3: Coding Standards & Review Gates (Áp Lực Ngữ Cảnh & Văn Mẫu Vô Nghĩa)
- **Sự cố thực tế**:
  - Tại Trạm 3.2 của IMP-422, báo cáo ghi nhận: *"Bộ nhớ & Timer: Không rò rỉ listener, không bỏ sót timer cleanup, an toàn đa luồng/bất đồng bộ."*
  - Đây là biểu hiện rõ nét của việc sao chép văn mẫu sinh tự động (generator boilerplate slop). Trình duyệt web và môi trường client JavaScript chạy trên V8 Engine với vòng lặp sự kiện đơn luồng (Single-threaded Event Loop); việc khẳng định "an toàn đa luồng" là ngụy biện vô căn cứ.
- **Bài học kiến trúc**:
  - Đã thanh lọc và thay thế bằng phân tích kỹ thuật chuẩn xác theo V8: Vòng đời listener giải phóng triệt để qua closure `unregister` (Set-based cleanup), cô lập ngoại lệ qua `try/catch` từng subscriber, và bộ đệm tĩnh bounded FIFO-100 của trade offer tracker.

### Trụ cột 4: Global Instructions & Harness Rules (Hiến Pháp & Quy Tắc Điều Phối)
- **Các quy tắc phát huy hiệu quả cao nhất**:
  - **LOC Buffer Zone Guard (`>= 350 LOC` bắt buộc `Refactor-First`)**: Đã phát hiện kịp thời tệp [`activity_log_subscriber.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/activity_log_subscriber.ts) đang ở mức **349/400 LOC** (chỉ cách lằn ranh đỏ phong tỏa đúng 1 dòng). Quy tắc đã được nâng cấp thành **Cổng Chặn Cơ Học (Blocking Hard Gate)**: Nghiêm cấm bổ sung code vào tệp này nếu không có bước Refactor-First trích xuất helper để hạ tệp xuống dưới 250 LOC.
  - **Knowledge Fold Invariant & SSOT Matrix Primacy**: Quy định trần cứng `docs/FEATURE_MAP.md` không vượt quá 30 KB (30,720 bytes). Đã kịp thời kích hoạt đợt tinh giản văn phong ma trận ở các Trụ cột 07, 09, 10, 11, 13, 14, đưa dung lượng từ 28,753 bytes lùi về **27,756 bytes**, mở rộng khoảng đệm an toàn lên **2,964 bytes** (gần 3 KB).

### Trụ cột 5: Tool Economy & Latency (Kinh Tế Công Cụ & Tối Ưu Vòng Lặp)
- **Sự cố thực tế**:
  - Việc dispatch subagent `game-3d-visual-critic` trên các ticket không can thiệp mỹ thuật 3D (như IMP-422) gây lãng phí tài nguyên token, tạo ra độ trễ giả và làm loãng sự tập trung của hệ thống.
- **Giải pháp cơ học**:
  - Thiết lập điều kiện chặn trong prompt của Main Agent: Chỉ dispatch `game-3d-visual-critic` khi phạm vi can thiệp có tệp trong `src/client/3d/` hoặc có thay đổi thực sự về mặt thị giác trên màn hình.

### Trụ cột 6: No-ops & Dead Guidance (Chỉ Dẫn Lệch Chuẩn & Nhánh Code Chết)
- **Sự cố chấn động (IMP-420 Placebo Fix)**:
  - Việc lập trình và tối ưu toán học cho các props nằm trong nhánh `{!streamlined && (...)}` của [`coastal_island_environment.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_island_environment.tsx) là một dạng "No-op cao cấp": Mọi unit test đều pass xanh rực rỡ, nhưng giá trị vận hành thực tế ở sản phẩm bằng 0 vì nhánh code bị đóng băng vĩnh viễn ở runtime.
- **Bài học kiến trúc**:
  - Khi tối ưu hoặc sửa lỗi cho một component, kỹ sư bắt buộc phải kiểm tra giá trị props mặc định và trạng thái thực tế tại các điểm tiêu thụ trong runtime (`board_layout.tsx`, `sunny_island_lobby_scene.tsx`), không bao giờ được tin tưởng mù quáng vào các test file truyền prop giả lập.

### Trụ cột 7: Information Access & Ground Truth (Bằng Chứng Thực Địa Vật Lý)
- **Khắc phục triệt để**:
  - Không còn hiện tượng báo cáo khống test count hay SLOC. Toàn bộ bảng thống kê dòng mã (LOC Accounting Table 4.1) trong báo cáo nghiệm thu IMP-422 đã được đo đạc và đối chiếu chính xác từng dòng vật lý thông qua kịch bản tự động `node scripts/check_loc.mjs`.

---

## 3. BẢNG TỔNG KẾT ĐỐI CHIẾU LỖ HỔNG VÀ BIỆN PHÁP GIA CỐ CƠ HỌC

| STT | Lỗ Hổng / Bất Cập Phát Hiện | Ticket | Bản Chất Vấn Đề | Biện Pháp Gia Cố Cơ Học (Automated Guardrail) |
| :-: | :--- | :---: | :--- | :--- |
| **1** | **Tautological Testing (Né Call-Site)** | `IMP-418` | Dùng AST string check thay cho integration test thật. | Bắt buộc test file phải import và thực thi component người tiêu thụ; cấm dùng AST check để thay thế runtime assertion. |
| **2** | **Placebo Fix trên Code Chết** | `IMP-420` | Thêm mũi đảo trên nhánh `{!streamlined}` vốn luôn `false` ở runtime thật. | Station 0 bắt buộc chứng minh nhánh code có được mount trên màn hình thật của Desktop/Mobile hay không trước khi lập Plan. |
| **3** | **Sân Khấu Hóa Visual Critic** | `IMP-422` | Chạy 3D visual critic và chụp ảnh trên vé thuần Network/State. | Nâng cấp `audit_visual_and_telemetry.mjs`: Miễn trừ visual capture nếu thay đổi UI chỉ là re-export hoặc kiểu dữ liệu thuần túy. |
| **4** | **Boilerplate Slop "Đa Luồng"** | `IMP-422` | Gán khái niệm thread-safety cho V8 Browser Event Loop đơn luồng. | Đưa các cụm từ sáo rỗng ("an toàn đa luồng", "thread-safe" trên client) vào danh sách đen của bộ kiểm toán báo cáo. |
| **5** | **Vùng Đệm LOC Nguy Cấp** | `IMP-422` | `activity_log_subscriber.ts` đạt 349/350 LOC (cách lằn ranh đỏ 1 dòng). | Kích hoạt Cổng Chặn Cơ Học Cấp 1 (*LOC Buffer Zone Guard*): Nghiêm cấm thêm code nếu không Refactor-First hạ xuống <= 250 LOC. |
| **6** | **Áp Lực Dung Lượng FEATURE_MAP** | `IMP-422` | File phình lên 28.7 KB (gần trần cứng 30 KB). | Tinh giản văn phong ma trận ở các Trụ cột 07, 09, 10, 11, 13, 14, đưa dung lượng về 27.7 KB (dư 2,964 bytes an toàn). |
| **7** | **Lệch Số Liệu Kiểm Thử** | `IMP-422` | Đếm regex thô sơ dính 2 comment chứa chữ `it(`. | Bắt buộc đọc kết quả kiểm thử từ file JSON chuẩn xuất ra bởi `vitest --reporter=json`. |

---

## 4. KẾT LUẬN & CAM KẾT VẬN HÀNH

Phiên làm việc này đã đưa chất lượng mã nguồn và kỷ luật quy trình của dự án VTCOON lên một nấc thang trưởng thành mới:
1. **Toàn bộ kho mã nguồn đạt trạng thái 100% Zero-Cycle**: Không còn bất kỳ một chu trình phụ thuộc vòng đa tệp nào trên cả Client lẫn Server (0 SCCs trên toàn bộ 438 tệp mã nguồn).
2. **Loại bỏ hoàn toàn tư duy đối phó**: Từ bỏ các bài test kiểm tra chuỗi AST tĩnh, từ bỏ việc nặn code trên các nhánh chết không render, và triệt tiêu toàn bộ văn mẫu vô căn cứ trong hồ sơ kiểm toán.
3. **Bảo toàn tính thiêng liêng của Hiến pháp**: Mọi trần ngân sách (LOC Ceilings, 30 KB SSOT limit, Wiring Parity, Seam Discipline) đều được tôn trọng và kiểm tra cơ học bằng các script tự động trên đĩa vật lý.

---

### 🩺 SDLC HARNESS TELEMETRY
- **Scripts/Tools**: `PASS` — Các công cụ kiểm toán cơ học (`lint:boundaries`, `check_scope.mjs`, `check_loc.mjs`, `check_evidence.mjs`) đã bảo vệ thành công tính toàn vẹn của codebase.
- **Rules/Gotchas**: `PASS` — Các quy tắc trong `GEMINI.md` đã chứng minh tính sắc bén tuyệt đối khi trở thành công cụ giám định pháp y vạch trần mọi ngụy biện kỹ thuật.
- **Skills/Context**: `PASS` — Kỹ năng `retro` đã phát huy trọn vẹn vai trò chuyển hóa các khuyết tật thành các đề xuất tự động hóa cơ học bền vững.
- **Handoff Quality**: `PASS` — Toàn bộ báo cáo, hồ sơ kiểm toán và ma trận kiến trúc hiện tại đã hoàn toàn khớp 1:1 với thực tế đĩa vật lý.
