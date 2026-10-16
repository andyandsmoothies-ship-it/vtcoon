# 🔄 BÁO CÁO HỒI TƯỞNG & GIA CỐ QUY TRÌNH SDLC (SDLC RETROSPECTIVE & GUARDRAIL HARDENER)
## CHUỖI TICKET IMP-417 ĐẾN IMP-423: ZERO-CYCLE REFACTORING, FSM COORDINATOR & PHẢN BIỆN ĐỐI KHÁNG

> **Mã hồ sơ:** `RETRO-2026-10-16-IMP417-IMP423`  
> **Thời gian:** 2026-10-16  
> **Phạm vi giám định:** Chuỗi phản biện các ticket từ `IMP-417` đến `IMP-423` và Kế hoạch `PLAN_IMP_423`.  
> **Mục tiêu:** Đánh giá các ma sát thực tế (friction), bóc tách các điểm bất cập có tính hệ thống, và chuyển hóa các sai sót lặp lại thành rào chắn cơ học tự động hóa (Automated Mechanical Checks) theo tinh thần kỹ năng `/retro`.  
> **Căn cứ quy chuẩn:** Hiến pháp [`GEMINI.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/GEMINI.md), Gotchas Pillar Rules, Kỹ năng [`retro/SKILL.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/retro/SKILL.md).

---

## I. TỔNG QUAN HỒI TƯỞNG (EXECUTIVE SUMMARY)

Chuỗi ticket `IMP-417` đến `IMP-423` là một chiến dịch tái cấu trúc kiến trúc quy mô lớn và thành công nhất trong lịch sử dự án VTCOON:
- **Cán đích Zero-Cycle Tuyệt đối:** Đã xóa sổ hoàn toàn 5 cụm phụ thuộc vòng lịch sử (`[SCC-1]` 15 tệp ở client, `[SCC-2]` 21 tệp ở server, `[SCC-3]` 2 tệp timers, `[SCC-4]`, `[SCC-5]`), chính thức đưa toàn bộ 438 tệp mã nguồn (`src/**`) về trạng thái **0 Circular Dependencies (0 SCC)**.
- **Hiệu lực phản biện đối kháng (Trạm 0):** Đã phát hiện và triệt tiêu hàng loạt lỗi hiểm trước khi viết mã nguồn (như bẫy deadlock kẹt lượt [B, S], cascade bankruptcy [B, B], rò rỉ ID giao dịch qua các trận đấu TC-280.11, và lỗi nuốt `myPlayerId` của người chơi khách `p2/p3/p4`).

Tuy nhiên, thông qua quá trình phản biện pháp y độc lập trên 7 ticket liên tiếp, chúng tôi đã phát hiện **5 nhóm bất cập kiến trúc và quy trình mang tính hệ thống**:
1. **Lỗ hổng phân tích cú pháp của `audit_plan.mjs` gây "Thẻ Xanh Ảo" (False Green Pass)**.
2. **Thiếu sót tệp tiêu thụ (Wiring Parity Omission) trong bảng hạch toán dòng mã**.
3. **Hiện tượng "Sân khấu hóa" kiểm thử trực quan 3D trên các vé thuần logic/state**.
4. **Tồn dư văn mẫu sao chép (Boilerplate Slop) và lẫn lộn ranh giới phân hệ (Artifact Bleed)**.
5. **Áp lực kịch trần dòng mã (LOC Buffer Zone $\ge 350$) và phình to tài liệu SSOT (`FEATURE_MAP.md`)**.

---

## II. ĐÁNH GIÁ CHI TIẾT THEO 7 KHÍA CẠNH KỸ NĂNG RETRO

### 1. Navigation & Hidden Dependencies (Điều hướng & Phụ thuộc ngầm)
- **Bất cập phát hiện:**
  - Khi bóc tách các leaf type seams (như `auction_types.ts`, `room_context_types.ts`, `turn_timer_constants.ts`), các agent thường chỉ tập trung vào tệp được trích xuất mà "quên" định vị các tệp consumer đang gọi trực tiếp vào module cũ. Ví dụ điển hình: `turn_orchestrator.ts` và `turn_bot_timer_scheduler.ts` bị bỏ quên trong bảng hạch toán của `PLAN_IMP_423`.
  - Sự tồn tại của 4 khối cấy ghép module (`declare module`) trong living tests (`imp285`, `imp145`, `imp155`, `imp160`) là những "bẫy phụ thuộc ngầm" (hidden coupling). Nếu không dùng công cụ `probe:surface`, agent hoàn toàn không biết đến sự tồn tại của chúng.
- **Rút kinh nghiệm:** Mọi kế hoạch trích xuất seam bắt buộc phải chạy `npm run probe:surface` trước tiên để lấy danh sách production callers và test callers đầy đủ.

### 2. Automated Checks / Guardrails (Rào chắn cơ học tự động hóa)
- **Bất cập phát hiện:**
  - **Lỗ hổng băm tệp của `audit_plan.mjs`:** `scripts/plan_audit/plan_markdown_parser.mjs` chỉ trích xuất tệp mục tiêu qua biểu thức:
    `/(?:\*\*Target physical file\*\*|\*\*Target File\*\*|Target physical file|Target file):\s*[`']?([^\n`']+\.[a-zA-Z0-9]+)[`']?([^\n]*)/gi;`
    Khi agent trình bày kế hoạch dưới dạng bảng Markdown (`| File Path | Tier | ... |`), bộ phân tích bỏ lọt 100% tệp, trả về `Checking 0 target files` và cấp thẻ xanh mà không hề kiểm tra đĩa vật lý!
  - **Thiếu kiểm tra đối xứng giữa Seam và Consumer:** Không có script nào đối chiếu xem một Seam mới sinh ra có được tệp consumer tương ứng import vào hay không (Wiring Parity Check).
- **Hành động cơ học đề xuất:**
  - Nâng cấp `plan_markdown_parser.mjs` để tự động băm cả các đường dẫn tệp nằm trong cột đầu tiên của Bảng Target Files (`| \`src/...\` | ... |`).

### 3. Coding Standards & Review Gates (Chuẩn mực mã hóa & Cổng duyệt)
- **Bất cập phát hiện:**
  - **Sân khấu hóa 3D Review:** Toolchain kiểm toán hiện tại kích hoạt `capture_visual_evidence.mjs` và yêu cầu review 3D một cách mù quáng, ngay cả với các ticket thuần túy về mạng và state machine (`client-state`, `server-fsm`). Báo cáo nghiệm thu của `IMP-422` vẫn đính kèm telemetry camera và tuyên bố có "hình ảnh trực quan".
  - **Tồn dư văn mẫu vô nghĩa (Boilerplate Slop):** Cụm từ *"an toàn đa luồng/bất đồng bộ"* được sao chép máy móc ở Trạm 3.2 cho các module chạy trên môi trường đơn luồng JavaScript V8.
- **Hành động cơ học đề xuất:**
  - Cấu hình cổng kiểm tra phân hệ: Nếu ticket có phân hệ là `client-state`, `network`, `domain`, `server-fsm` (hoặc diff không chứa tệp `.tsx`, `.glb`, `3d/**`), tự động bỏ qua Trạm 3.5 3D Visual Review và cấm sinh biên bản `3D_VISUAL_REVIEW_*.md`.
  - Bổ sung quy tắc linter quét từ khóa cấm trong báo cáo nghiệm thu: Báo cáo của vé non-visual không được chứa cụm "hình ảnh trực quan"; môi trường JS cấm dùng "an toàn đa luồng".

### 4. Global Instructions & Harness Rules (Luật Hiến pháp & Tinh gọn chỉ thị)
- **Bất cập phát hiện:**
  - **Artifact Bleed giữa các ticket:** Kế hoạch `PLAN_IMP_423` (về server FSM) lại bê nguyên xi Ràng buộc `INV-FSM-06` về các seam client của `IMP-422`. Điều này cho thấy việc tái sử dụng văn bản mẫu mà không cắt tỉa ngữ cảnh.
  - **Nguy cơ chạm ngưỡng Buffer Zone:** [`src/client/events/subscribers/activity_log_subscriber.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/activity_log_subscriber.ts) đã chạm **349/400 LOC**, chỉ còn đúng 1 dòng trước ngưỡng phong tỏa 350 LOC. Các tệp `room_manager.ts` (332 LOC), `auction_manager.ts` (331 LOC), `turn_orchestrator.ts` (327 LOC) đều đang ở mức cảnh báo cao.
- **Hành động đề xuất:**
  - Đưa quy tắc *LOC Buffer Zone Guard* vào kiểm tra tự động tại `fast_prefilter.mjs`: Nếu một tệp có sẵn $\ge 350$ LOC, cấm thêm bất kỳ dòng code logic nào vào tệp nếu kế hoạch không đánh dấu cờ `Refactor-First`.

### 5. Tool Economy & Latency (Tiết kiệm tài nguyên công cụ)
- **Bất cập phát hiện:**
  - Việc chạy song song Sentinel và Visual Capture từng gây xung đột lock đĩa vật lý ở các phiên trước. Mặc dù quy trình đã tách thành 2 bước (Station 3 chạy visual lúc code tĩnh, Station 3.5 chạy sentinel độc quyền), việc chạy visual capture cho các vé non-3D làm lãng phí từ 30s đến 60s thời gian chờ vô ích.
- **Hành động đề xuất:** Bỏ qua hoàn toàn visual capture cho vé non-UI/non-3D để giảm 100% độ trễ vô ích.

### 6. No-ops & Dead Guidance (Chỉ thị không tác dụng)
- **Bất cập phát hiện:**
  - Quy định yêu cầu Reviewer kiểm tra "an toàn bộ nhớ/timer" thường bị biến thành câu khẩu hiệu suông trong báo cáo (đánh dấu checked nhưng không có bằng chứng phân tích rò rỉ bộ nhớ thực tế).
- **Hành động đề xuất:** Yêu cầu Trạm 3.2 chỉ được xác nhận rò rỉ bộ nhớ khi chỉ ra cụ thể vị trí `removeEventListener`, `clearInterval`, hoặc cơ chế dọn dẹp bộ nhớ đệm (như FIFO-100 cache của `trade_offer_tracker.ts`).

### 7. Information Access & Ground Truth (Tiếp cận sự thật đĩa vật lý)
- **Bất cập phát hiện:**
  - **Áp lực trần dung lượng SSOT:** [`docs/FEATURE_MAP.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/FEATURE_MAP.md) từng phình lên **30,202 bytes**, chỉ cách trần tử thần (30,720 bytes - 30 KB) đúng 518 bytes. Nguyên nhân là do các ticket trước đã ghi chép quá nhiều chi tiết mang tính "nhật ký thay đổi" (changelog) thay vì giữ nó là một "ma trận quy tắc kiến trúc" (SSOT Matrix).
- **Hành động đề xuất:**
  - Duy trì kiểm tra cơ học Check 9 của `check_evidence.mjs`.
  - Định kỳ tinh giản `FEATURE_MAP.md` bằng cách loại bỏ các đoạn văn xuôi mô tả lịch sử ticket, chỉ giữ lại bảng định danh và bất biến cốt lõi.

---

## III. MA TRẬN PHÂN LOẠI & HÀNH ĐỘNG KHẮC PHỤC (ACTIONABLE MATRIX)

| Bất Cập Phát Hiện | Phân Loại | Biện Pháp Khắc Phục Cụ Thể | Vị Trí Thực Thi |
| :--- | :---: | :--- | :--- |
| `audit_plan.mjs` bỏ lọt tệp trong Bảng Markdown | **Cơ học (Mechanical)** | Nâng cấp Regex trong `plan_markdown_parser.mjs` để parse được cú pháp `\| \`path\` \|`. | `scripts/plan_audit/plan_markdown_parser.mjs` |
| Bỏ sót tệp consumer sửa import (Wiring Parity) | **Cơ học (Mechanical)** | Thêm rule kiểm tra: Mọi seam mới khai báo phải có ít nhất 1 tệp consumer hiện hành trong Target Files. | `scripts/plan_audit/rules_surface.mjs` |
| Sân khấu hóa 3D Review trên vé State/Server | **Cơ học (Mechanical)** | Lập guard điều kiện trong runner: Chỉ kích hoạt visual capture khi diff chạm vào `src/client/3d/**` hoặc `src/client/ui/**`. | `scripts/visual_capture/` & Station 3 Runner |
| Văn mẫu "an toàn đa luồng" trong môi trường JS | **Rà soát (Reviewer)** | Bổ sung danh sách cụm từ cấm (banned boilerplate slop) vào `scripts/slop_linter/`. | `scripts/slop_linter/` & `check_evidence.mjs` |
| Tệp `activity_log_subscriber.ts` chạm 349 LOC | **Quy tắc Kiến trúc** | Đánh dấu `DEBT-CAM-01`: Cấm bổ sung logic vào tệp này nếu không refactor tách module con trước. | Backlog & `fast_prefilter.mjs` |
| `FEATURE_MAP.md` tiến sát trần 30 KB | **Bảo trì Tài liệu** | Nén gọn các bảng quy tắc, xóa bỏ văn xuôi tường thuật mang tính changelog cá nhân của từng ticket. | `docs/FEATURE_MAP.md` |

---

## IV. BẢN GIAO THỨC TELEMETRY MẪU (STANDARDIZED TELEMETRY BLOCK)

Dành cho các lượt bàn giao subagent và báo cáo nghiệm thu tiếp theo:

```markdown
### 🩺 SDLC HARNESS TELEMETRY
- **Scripts/Tools**: PASS — Đã phát hiện và đề xuất khắc phục lỗ hổng regex parser của `audit_plan.mjs` khi đọc bảng Markdown.
- **Rules/Gotchas**: PASS — Nhận diện nguy cơ chạm trần 349/350 LOC trên `activity_log_subscriber.ts` để áp dụng kịp thời LOC Buffer Zone Guard.
- **Skills/Context**: PASS — Áp dụng thành công kỹ năng `/retro` để chuyển hóa 5 nhóm ma sát kiến trúc thành các rào chắn cơ học tự động.
- **Handoff Quality**: PASS — Đã chỉ rõ hiện tượng Artifact Bleed và thiếu sót 7 tệp consumer trong bản kế hoạch server FSM.
- **Harness Suggestion**: Tích hợp bộ lọc phân hệ (Subsystem Filter) vào Station 3.5 để tự động miễn trừ 3D Visual Review cho các vé thuần State/Network/Server.
```

---

## V. KẾT LUẬN

Chiến dịch tái cấu trúc `IMP-417` – `IMP-423` đã giải quyết triệt để vấn đề phụ thuộc vòng, đạt được cột mốc kỹ thuật đỉnh cao **0 Circular Dependencies**.  
Việc thực hiện phiên Retrospective này đã bóc tách chính xác các "góc khuất" của quy trình phát triển và kiểm toán. Bằng cách ưu tiên **xây dựng rào chắn cơ học thay vì chỉ viết thêm luật suông**, hệ thống kiểm thử và giám sát của VTCOON sẽ tiếp tục được gia cố vững chắc, ngăn chặn triệt để các lỗi tái diễn trong tương lai.
