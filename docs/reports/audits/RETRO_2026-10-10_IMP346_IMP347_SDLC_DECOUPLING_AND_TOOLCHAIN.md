# BÁO CÁO HỒI CỨU QUY TRÌNH SDLC & GIA CỐ CƠ HỌC TOÀN DIỆN (RETROSPECTIVE REPORT)
## Giải Mã Sự Cố Phá Vỡ Test Hồi Quy (IMP-346), Lỗ Hổng Parity Whitelist (IMP-347) & Tái Cấu Trúc Toàn Diện Toolchain

> **Mã báo cáo:** `RETRO-2026-10-10-IMP346-IMP347`  
> **Phân hệ trọng tâm:** `client-network` / `bot-domain` / `server-trade` / `sdlc-toolchain`  
> **Thời điểm thực hiện:** 2026-10-10  
> **Phương châm cốt lõi:** *"Default to Building the Check Over Writing the Rule"* (Ưu tiên dựng chốt chặn bằng mã nguồn cơ học thay vì chỉ viết thêm quy tắc trên giấy).  
> **Trạng thái:** ✅ **RESOLVED, MECHANICALLY HARDENED & PRODUCTION READY**

---

## 1. TỔNG QUAN PHIÊN LÀM VIỆC & BỐI CẢNH SỰ KIỆN

Phiên làm việc này tập trung vào 3 chiến dịch kỹ thuật lớn có độ rủi ro cao:
1. **IMP-346 (Delta Presentation Decoupling)**: Ngắt hoàn toàn sự phụ thuộc hiển thị UI/SFX ra khỏi bộ xử lý delta mạng [`src/client/network/apply_delta.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta.ts) để chuyển giao sang EventBus (`badge_event_subscriber`, `audio_event_subscriber`).
2. **IMP-347 (Bot Negotiation Brain Decoupling)**: Tách độc lập toàn bộ thuật toán đàm phán AI P2P Trade & Auction ra khỏi máy chủ điều phối giao dịch (`room_trade_coordinator.ts`) thành một Deep Domain Module [`src/domain/bot/bot_negotiation_brain.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_negotiation_brain.ts).
3. **IMP-348..352 (Toolchain Scripts Decomposition)**: Phân rã 5 tệp script `.mjs` nguyên khối lớn ở thư mục gốc thành mô hình Lean Facade ($\le 200$ LOC) với các thư mục chuyên biệt.

```
[Khảo sát 4 Ứng viên] ──> [Thực hiện IMP-346] ──> [Adversarial Audit: Gãy 9 Living Tests]
                                                                  │
                                                                  ▼
[Nghiệm thu IMP-347] <── [Adversarial Audit IMP-347] <── [Khắc phục Root Cause IMP-346]
         │                          │
         ▼                          ▼
[Gia cố Toolchain scripts/] [Khắc phục 1.60x Whitelist & Template Report Slop]
```

---

## 2. PHÂN TÍCH THEO 7 TRỤ CỘT CỦA KỸ NĂNG RETROSPECTIVE

### Trụ cột 1: Navigation & Hidden Dependencies (Phụ thuộc ngầm & Ranh giới công cộng)
- **Sự cố tại IMP-346:** Khi ngắt `trackDeltaActivities` khỏi `apply_delta.ts`, implementer đã xóa sạch logic phát floating text bên trong hàm `export function syncEventCard`. Hệ quả là 9 living contract tests (`imp122`, `imp205`, `imp234`) bị gãy đổ do các test này trực tiếp gọi hàm công khai `syncEventCard(delta, state)`.
- **Bài học kiến trúc:** Một hàm đã được `export` ở tầng công cộng có thể đang phục vụ cả luồng delta toàn cục lẫn các hợp đồng kiểm thử độc lập. Khi refactor chuyển quyền sang Event Bus, phải bảo đảm **tương thích ngược hoàn toàn (Backward Compatibility)** hoặc duy trì cơ chế fallback khi hàm được gọi ngoài chu trình Event Bus.

### Trụ cột 2: Automated Checks & Guardrails (Chốt chặn cơ học tự động)
- **Sự cố tại IMP-347:** 
  1. Trong [`src/domain/bot/bot_negotiation_brain.ts#L74`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_negotiation_brain.ts#L74), điều kiện Whitelist 1.60x Parity bị chèn thêm `|| decision.reason === 'PREVENT_MONOPOLY'`, vi phạm trực tiếp chỉ thị gia cố của ADV-02 trong biên bản phản biện đối kháng (cho phép bot đối thủ dùng tiền mua đứt ô đất độc quyền của bot khác).
  2. Tệp `scripts/report/report_git_inspector.mjs` có regex tìm `**Direct Scope**:` không nhận diện được tiêu đề `**Direct Scope (Physical Files)**:`, dẫn đến việc quét cả `Prior In-Flight Scope` của ticket trước và làm ô nhiễm bảng LOC.
  3. Tệp `scripts/report/report_station_collector.mjs` chỉ đọc dòng cùng hàng với tiêu đề `- **Scenario**:`, bỏ sót nội dung thụt lề nhiều dòng, tạo ra báo cáo rỗng ruột.
- **Giải pháp cơ học đã giải quyết:**
  - Sửa regex nhận diện `Direct Scope[^*]*:` và lọc bỏ triệt để `Prior In-Flight Scope` trong `report_git_inspector.mjs`.
  - Nâng cấp bộ parser đa dòng cho kịch bản đối kháng trong `report_station_collector.mjs`.
  - Cập nhật sentinel probe `scripts/sentinel_probes/IMP-347.json` để kiểm soát chặt điều kiện `PRICE_TOO_LOW`, đảm bảo tiêu diệt biến dị khi whitelist bị nới lỏng.

### Trụ cột 3: Coding Standards & Review Gates (Chuẩn mực mã nguồn & Cổng duyệt)
- **Sự cố hình thức (Paper Compliance):** Biên bản kiểm toán Trạm 3 (`SPEC_REVIEW` và `CODE_REVIEW`) trước đây tự động sinh các câu văn mẫu vô nghĩa (*"Đồng bộ và bảo toàn logic nghiệp vụ"* lặp lại 10 lần).
- **Quy chuẩn mới:** Cấm tuyệt đối phát hành báo cáo mang tính đối phó. Biên bản Trạm 3.1 bắt buộc phải đối soát các bất biến nghiệp vụ thực tế (Net Equity Floor, Parity Whitelist, Kingmaking Defense, Quiescence Guard, Rejection Memory Purge).

### Trụ cột 4: Global Instructions & Harness Rules (Hiến pháp & Quy tắc điều phối)
- Quy tắc **Toolchain Facade Invariant** đã được bổ sung vào Hiến pháp [`GEMINI.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/GEMINI.md):
  > *"Root entrypoints in `scripts/*.mjs` MUST remain thin orchestrator facades ($\le 200$ LOC). Specialized logic lives in `scripts/report/`, `scripts/slop_linter/`, `scripts/visual_capture/`, `scripts/plan_audit/`, `scripts/sentinel/`."*
- Toàn bộ 5 tệp toolchain gốc đều đã tuân thủ nghiêm ngặt quy định này.

### Trụ cột 5: Tool Economy & Latency (Hiệu năng công cụ & Độ trễ)
- Việc phân tách các script kiểm tra giúp tốc độ prefilter (`fast_prefilter.mjs`) giữ ở mức **< 3 giây**, trong khi `sentinel_runner.mjs` thực thi 21 probes và dynamic WebSocket port 0 chỉ mất ~25 giây.

### Trụ cột 6: No-ops & Dead Guidance (Chỉ dẫn vô nghĩa & Lệch phân hệ)
- **Sự cố:** Báo cáo IMP-347 tự động in câu văn mẫu về *"công thái học Mobile và Desktop"* cho một ticket thuần túy về thuật toán AI đàm phán máy chủ.
- **Giải pháp:** Cập nhật `report_markdown_renderer.mjs` nhận diện phân hệ `bot-domain` và `domain-core` để sinh mục tiêu kỹ thuật chính xác về FSM và cân bằng kinh tế, loại bỏ hoàn toàn văn mẫu UI rác.

### Trụ cột 7: Information Access & Ground Truth (Bằng chứng thực địa)
- Toàn bộ bằng chứng trong báo cáo nghiệm thu hiện tại đều được liên kết trực tiếp với các tệp JSON bằng chứng vật lý (`.agents/evidence/chaos_sentinel_*.json`) và số liệu LOC thực tế đo đạc qua `scripts/check_loc.mjs`.

---

## 3. BẢNG TỔNG KẾT KHẮC PHỤC TRƯỚC VÀ SAU RETROSPECTIVE

| Hạng mục kiểm soát | Trạng thái trước (Điểm nghẽn / Lỗi lọt lưới) | Trạng thái sau (Đã gia cố cơ học) |
| :--- | :--- | :--- |
| **Kiểm thử hồi quy IMP-346** | Gãy 9 living tests do xóa logic hiển thị trong `syncEventCard` và thiếu hook cho thẻ người chơi. | Khôi phục 100% khả năng tương thích ngược; 73/73 tests GREEN; `apply_delta.ts` sạch 0 import `activity_*`. |
| **Bảo vệ độc quyền AI (IMP-347)** | Dòng 74 cho phép `PREVENT_MONOPOLY` bị ghi đè bởi 1.60x Parity $\to$ nguy cơ thông đồng bot-to-bot. | Gỡ bỏ hoàn toàn `PREVENT_MONOPOLY` khỏi whitelist; 21/21 mutants bị tiêu diệt bởi Sentinel. |
| **Tính liêm chính của Báo cáo** | Báo cáo bị rỗng ruột ở các mục ADV-01..06; scope bị dính 5 file của IMP-346; văn mẫu UI lệch phân hệ. | Parser đa dòng thu thập đầy đủ kịch bản đối kháng; scope cô lập đúng 5 file trực tiếp; phân hệ chuẩn `bot-domain`. |
| **Cấu trúc Toolchain Scripts** | 5 tệp script `.mjs` nguyên khối lớn từ 450 đến 570 LOC tiệm cận ngưỡng quá tải. | Tách thành các package mô-đun trong `scripts/*`; 100% root facades $\le 200$ LOC. |
| **Biên bản kiểm toán Trạm 3** | Văn mẫu giả định *"Đồng bộ và bảo toàn logic nghiệp vụ"* lặp lại hàng loạt. | Chuẩn hóa đối soát trực tiếp 5 bất biến kinh tế & FSM cụ thể vào `SPEC_REVIEW` và `CODE_REVIEW`. |

---

## 4. RÀ SOÁT TỒN ĐỌNG & TRẠNG THÁI HIỆN TẠI

1. **Về mặt Kế hoạch & Chức năng (Plans & Implementations):**
   - **0 ticket tồn đọng**: Không còn bất kỳ ticket nào đang chờ lập plan hoặc đang dở dang implement.
   - 4 Ứng viên kiến trúc lớn đều đã dứt điểm (Candidate 1, 2A, 3A, 4A đã hoàn thành; Candidate 2B, 3B, 4B đã bác bỏ có căn cứ).
2. **Về mặt Kiểm thử & Cổng cơ học:**
   - 100/100 test suites (1.370 unit/contract tests) **PASS 100%**.
   - Typecheck `tsc --noEmit` exit 0, **0 lỗi linter**.
   - Zero Dirty Casts (`as any`), trần LOC tuân thủ 100%.
3. **Hành động kỹ thuật duy nhất còn lại:**
   - Chốt đợt làm việc bằng lệnh **Commit Git** để ghi nhận toàn bộ mã nguồn, kiểm thử, công cụ và tài liệu nghiệm thu vào lịch sử phiên bản.
