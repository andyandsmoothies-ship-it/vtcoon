# BÁO CÁO NGHIỆM THU HOÀN THÀNH VÉ CẢI TIẾN IMP-256
## 3D Selective Reference Bloom Pipeline & Optical Isolation (Layer 11)

> **Mã số vé**: IMP-256  
> **Tên nghiệp vụ**: Hiệu Ứng Phát Sáng Chọn Lọc 3D Bằng Lớp Selective Bloom & Phân Tách Ánh Hào Quang  
> **Kế hoạch triển khai**: [`.agents/plans/PLAN_IMP_256_SELECTIVE_REFERENCE_BLOOM.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/plans/PLAN_IMP_256_SELECTIVE_REFERENCE_BLOOM.md) (Revision 1.1)  
> **Sổ cái tiến độ Epic**: [`docs/epics/client_ui/_epic_ledger.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/epics/client_ui/_epic_ledger.md)  
> **Thời điểm nghiệm thu**: 2026-10-04  
> **Quy trình áp dụng**: Tier 2 Full Rigor — 4-Station Closed-Loop Pipeline (Antigravity 2.0)  

---

## 1. TỔNG QUAN KẾT QUẢ ĐẠT ĐƯỢC

Vé IMP-256 giải quyết triệt để vấn đề xung đột quang học nghiêm trọng trên sa bàn 3D: hiện tượng "cháy sáng / vỡ sáng toàn cục" (blown-out bloom) khi cố gắng hiển thị hiệu ứng phát quang của vòng hào quang sự kiện `TileEventAuraRim`.
Trước đây, để bảo vệ bề mặt gạch ngà `#EDE5D8` và chữ số tài chính không bị nhòe mờ, pipeline hậu kỳ buộc phải đặt ngưỡng `bloomThreshold: 2.5`, vô tình triệt tiêu toàn bộ hiệu ứng phát quang của các chi tiết PBR nghệ thuật (`emissiveIntensity: 0.65 - 1.6`).

Bằng việc thiết lập **Selective Reference Bloom Pass trên Three.js Layer 11**, hệ thống đã tách rời hoàn toàn không gian quang học của vật thể nền (Layer 0) và vật thể phát sáng (Layer 11):
1. **Không gian quang học độc lập (Layer 11)**: Chỉ các đối tượng được đăng ký chủ động qua `selective_bloom_registry.ts` mới phát sáng; nền gạch ngà `#EDE5D8` và chữ số tài chính giữ nguyên độ tương phản sắc nét tuyệt đối (0 blowout).
2. **Ngưỡng nhạy cảm dịu mắt**: Hạ ngưỡng bloom xuống $0.45$ (và $0.25$ khi đấu giá) cho phép màu vàng PBR hổ phách phát sáng rực rỡ mà không cần kích phát xạ cực đoan.
3. **Thích ứng Dual-Viewport Parity**: Tự động tắt Selective Bloom trên thiết bị di động (`enableSelectiveBloom={!isMobileDevice}`) tại `game_canvas.tsx` nhằm bảo vệ băng thông GPU và duy trì tốc độ 60 FPS mượt mà.
4. **Tương thích ngược 100%**: Khi tắt Selective Bloom, hệ thống hồi quy an toàn về `<Bloom>` toàn cục chuẩn, bảo toàn 100% các hợp đồng của IMP-241.

---

## 2. BẢNG ĐỐI SOÁT TRACEABILITY & COMPLIANCE DEFINITION OF DONE (DoD 1-6)

### 2.1. Bảng Kiểm Tra Định Nghĩa Hoàn Thành (DoD)

| Tiêu Chí DoD | Trạng Thái | Minh Chứng Vật Lý & Dữ Liệu Thực Tế |
| :--- | :---: | :--- |
| **DoD 1: TDD Adversarial Inversion & Flow Taxonomy** | **ĐẠT** | 16/16 atomic contract tests có mã nhận diện `[TC-IMP256.XX/...][UC-IMP256/...]` với đầy đủ MSS và A1..A5. Chứng minh Business RED chuẩn xác tại Station 1. |
| **DoD 2: Ngân Sách LOC & Linters** | **ĐẠT** | `selective_bloom_registry.ts` (86 LOC <= 400), `post_processing_pipeline.tsx` (363 LOC <= 500), `tile_event_aura.tsx` (221 LOC <= 500), `game_canvas.tsx` (476 LOC <= 500, đã ghi nhận `DEBT-GAME-CANVAS-PARTITION`). Linter: `lint:slop` 0 lỗi, `lint:ui` 0 vi phạm. |
| **DoD 3: Thẩm Định Độc Lập Trạm 3 (Phases 3.0, 3.1, 3.2)** | **ĐẠT** | Phase 3.0: 2 ảnh Dual-Viewport tại `.agents/tmp/`.<br>Phase 3.1: `spec-reviewer` ký APPROVED tại [`.agents/audit/SPEC_REVIEW_IMP-256.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-256.md).<br>Phase 3.2: `code-reviewer` ký APPROVED tại [`.agents/audit/CODE_REVIEW_IMP-256.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-256.md); `game-3d-visual-critic` ký APPROVED TO SHIP (8.5/10) tại [`.agents/audit/3D_VISUAL_REVIEW_IMP-256.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/3D_VISUAL_REVIEW_IMP-256.md). |
| **DoD 4: Station 4 Chaos Sentinel Probes** | **ĐẠT** | Probe 1 & 2: 17/17 Headless WebGL2 tests PASS.<br>Probe 3: 15/15 mutants bị tiêu diệt (Floor >= 14 đạt 107.1%, 0 survived, 0 waivers).<br>Kiểm tra cơ học `check_evidence.mjs` VERIFIED tại [`.agents/evidence/chaos_sentinel_imp-256.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_imp-256.json). |
| **DoD 5: Cập Nhật Sổ Cái & Báo Cáo Nghiệm Thu** | **ĐẠT** | Sổ cái `docs/epics/client_ui/_epic_ledger.md` đã cập nhật khóa bất biến `DEBT-GAME-CANVAS-PARTITION`. Báo cáo nghiệm thu lưu trữ hoàn chỉnh tại file này. |
| **DoD 6: Khả Năng Phục Hồi & Bảo Toàn Bất Biến** | **ĐẠT** | Gotcha #12 (Hook Spying Parity): Không dùng private spies. Gotcha #29 (Transient Teardown): Dọn dẹp sạch sẽ Layer 11 khi unmount, bảo toàn Layer 0 cho camera chính. Phòng thủ `Number.isFinite` chống NaN shader uniforms. |

---

### 2.2. Bảng Truy Vết Ma Trận Kiểm Thử (Traceability Mapping)

| Test ID | Flow Taxonomy | Mô Tả Trọng Tâm Hợp Đồng | Trạng Thái |
| :--- | :--- | :--- | :---: |
| **TC-IMP256.01** | `[UC-IMP256/MSS]` | `tagSelectiveBloom` kích hoạt Layer 11 và đánh dấu cờ `userData.selectiveBloom = true` trên mesh mục tiêu | **PASSED** |
| **TC-IMP256.02** | `[UC-IMP256/MSS]` | `tagSelectiveBloom` duyệt đệ quy cây con của `Group` hoặc `Object3D` phức hợp | **PASSED** |
| **TC-IMP256.03** | `[UC-IMP256/MSS]` | `untagSelectiveBloom` vô hiệu hóa Layer 11, dọn dẹp cờ userData, bảo toàn Layer 0 mặc định | **PASSED** |
| **TC-IMP256.04** | `[UC-IMP256/A1]` | `isSelectiveBloomTagged` phân biệt độc lập trạng thái Layer 11 và cờ `userData`, trả về false an toàn | **PASSED** |
| **TC-IMP256.05** | `[UC-IMP256/MSS]` | `calculateSelectiveBloomThreshold` hạ ngưỡng dịu mắt (0.45 lượt thường, 0.25 đấu giá) | **PASSED** |
| **TC-IMP256.06** | `[UC-IMP256/MSS]` | `calculateSelectiveBloomIntensity` điều tiết cường độ thích ứng (0.20 mobile, 0.45 desktop, 0.65 đấu giá) | **PASSED** |
| **TC-IMP256.07** | `[UC-IMP256/A2]` | Hàm toán học tự hồi quy giá trị mặc định khi gặp tham số bất thường (`NaN`, `Infinity`, số âm) | **PASSED** |
| **TC-IMP256.08** | `[UC-IMP256/MSS]` | `PostProcessingPipeline` kết xuất component `<SelectiveBloom selectionLayer={11}>` khi `enableSelectiveBloom = true` | **PASSED** |
| **TC-IMP256.09** | `[UC-IMP256/MSS]` | Khi `enableSelectiveBloom = false` hoặc undefined, duy trì `<Bloom>` cũ bảo toàn hợp đồng IMP-241 | **PASSED** |
| **TC-IMP256.10** | `[UC-IMP256/MSS]` | `<SelectiveBloom>` đứng đúng vị trí HDR trước `ToneMapping (AgX)` và sau `DepthOfField` trong EffectComposer | **PASSED** |
| **TC-IMP256.11** | `[UC-IMP256/A3]` | Khi `enabled = false` hoặc `enableBloom = false`, SelectiveBloom bị loại bỏ sạch khỏi render tree | **PASSED** |
| **TC-IMP256.12** | `[UC-IMP256/MSS]` | Hằng số `SELECTIVE_BLOOM_LAYER = 11`, không xung đột với layer 0 mặc định của sa bàn | **PASSED** |
| **TC-IMP256.13** | `[UC-IMP256/MSS]` | SelectiveBloom áp dụng `mipmapBlur = true` trên desktop và `mipmapBlur = false` trên mobile | **PASSED** |
| **TC-IMP256.14** | `[UC-IMP256/A4]` | SelectiveBloom tiếp nhận tham số intensity thích ứng chính xác theo môi trường thiết bị và trạng thái đấu giá | **PASSED** |
| **TC-IMP256.15** | `[UC-IMP256/MSS]` | `TileEventAuraRim` gắn ref và kích hoạt `tagSelectiveBloom` qua `useEffect` đưa viền hào quang vào Layer 11 | **PASSED** |
| **TC-IMP256.16** | `[UC-IMP256/A5]` | `TileEventAuraRim` dọn dẹp sạch sẽ Layer 11 khi unmount thông qua cleanup function, triệt tiêu rò rỉ bộ nhớ | **PASSED** |

---

## 3. BẰNG CHỨNG THỊ GIÁC VẬT LÝ DUAL-VIEWPORT (PHASE 3.0)

Bằng chứng hình ảnh được thu thập trực tiếp từ live WebGL scene thông qua script tự động `scripts/capture_visual_evidence.mjs --ticket IMP-256 --dual-viewport`:

1. **Desktop Viewport (1280x800)**:
   - Tệp ảnh: [`.agents/tmp/imp-256_desktop.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-256_desktop.jpg)
   - Tọa độ DOM bounding box: [`.agents/evidence/bounding_box_imp-256_desktop.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/bounding_box_imp-256_desktop.json)
   - Đánh giá của Art Director: Góc nghiêng Perspective điện ảnh ~40°, toàn bộ 40 ô đất hiển thị sắc nét; vạch chia màu và nhãn địa phương rõ ràng, không có quầng sáng ký sinh nào làm suy giảm độ tương phản của nền ngà `#EDE5D8`.
2. **Mobile Viewport (360x740)**:
   - Tệp ảnh: [`.agents/tmp/imp-256_mobile_360.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-256_mobile_360.jpg)
   - Tọa độ DOM bounding box: [`.agents/evidence/bounding_box_imp-256_mobile.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/bounding_box_imp-256_mobile.json)
   - Đánh giá của Art Director: Sa bàn hiển thị cô đọng, hệ thống tự động tắt Selective Bloom pass (`enableSelectiveBloom=false`) giúp tối ưu hiệu năng render mà vẫn duy trì bố cục rõ nét. HUD và Camera navigation pills không xảy ra va chạm không gian (0 overlap).

---

## 4. HẠ TẦNG MÃ NGUỒN & NGÂN SÁCH DÒNG MÃ (LOC)

| Tệp Tin | Phân Tầng Kiến Trúc | LOC Vật Lý | Non-Empty SLOC | Trần Ngân Sách | Đánh Giá Rủi Ro |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `src/client/3d/selective_bloom_registry.ts` | Tier 1 (Registry / Math / Pure Logic) | 86 | 72 | 400 | **An Toàn (Safe)** |
| `src/client/3d/post_processing_pipeline.tsx` | Tier 2 (3D R3F View / Canvas) | 363 | 319 | 500 | **An Toàn (Safe)** |
| `src/client/3d/tile_event_aura.tsx` | Tier 2 (3D Component View) | 221 | 198 | 500 | **An Toàn (Safe)** |
| `src/client/game_canvas.tsx` | Tier 2 (Root 3D Canvas) | 476 | 405 | 500 | **⚠️ Cảnh Báo (Warning)** |
| `tests/contracts/imp256_selective_bloom_pipeline.test.ts` | Contract Test Suite (16 atomic tests) | 298 | 260 | 600 | **An Toàn (Safe)** |

> **Ghi Chú Nợ Kỹ Thuật**: Đã đăng ký mã định danh bất biến `DEBT-GAME-CANVAS-PARTITION` vào Sổ Cái Tiến Độ Epic. `game_canvas.tsx` đạt 476 LOC (thuộc ngưỡng cảnh báo 400..500 LOC). Đã lên kế hoạch bóc tách các sub-components (`SceneLighting`, `SceneCameraRig`, `ScenePostProcessingWrapper`) sang submodule riêng trong phiên làm việc kế tiếp.

---

## 5. ĐÁNH GIÁ VẬN HÀNH & ĐỀ XUẤT CẢI TIẾN SETTING SDLC
*(Tuân thủ quy trình Session Retrospective & Guardrail Hardener `.agents/skills/retro/SKILL.md`)*

### 5.1. Bảng Tổng Hợp Telemetry Từ Các Subagents

| Trạm / Tác Nhân | Trạng Thái | Vấn Đề Ghi Nhận (Friction / Observation) | Kiến Nghị Của Subagent |
| :--- | :---: | :--- | :--- |
| **Station 1 (qa-tester)** | PASS | Module `selective_bloom_registry.js` chưa tồn tại gây ra Business RED sạch sẽ. | Cung cấp sẵn mẫu kiểm thử Three.js Layer bitmask trong kho template contract test. |
| **Station 2 (implementer)** | PASS | `SelectiveBloom` từ `@react-three/postprocessing` yêu cầu tham số `selectionLayer` dạng number đơn giản. | Duy trì việc định nghĩa hằng số Layer 11 tại registry để tránh magic numbers. |
| **Station 2.5 (scout)** | PASS | Phát hiện sớm và loại bỏ triệt để `as Record<string, unknown>` và các spies `spyOn(React, ...)` trước khi vào Station 3. | Duy trì chốt chặn Scout Gate 7 đối với private framework spies. |
| **Station 3.1 (spec-reviewer)** | PASS | Kế hoạch Rev 1.1 có bảng đối ứng 1:1 rõ ràng, đối soát thuận lợi. | Bổ sung cảnh báo trong `audit_plan.mjs` khi file sửa đổi tiệm cận ngưỡng 475 LOC. |
| **Station 3.2 (code-reviewer)** | PASS | Đảm bảo tính an toàn của useEffect cleanup khi unmount component R3F. | Nhắc nhở quy tắc lưu biến tham chiếu `const mesh = meshRef.current;` trước khi trả về cleanup callback. |
| **Station 3.2 (game-3d-visual-critic)** | PASS | Đạt 8.5/10 điểm nghệ thuật; sa bàn giữ được phong cách đảo nhiệt đới ngập nắng (Retropoly/Townscaper). | Bổ sung kịch bản cận cảnh `--scenario tile-aura` vào script capture để hỗ trợ soi chi tiết vi mô. |
| **Station 4 (chaos-sentinel)** | PASS | Runner tự động sinh đủ 15 mutants (vượt sàn 14), 100% kill rate, không cần cấp waiver. | Bộ matcher vitest đa dạng giúp kiểm thử sống bắt mutant nhạy bén hơn. |

---

### 5.2. Quy Trình Hai Vòng Đối Soát Nghịch Đảo (Two-Round Adversarial Cross-Examination Gate)

#### Vòng 1: Đối Soát Bằng Chứng Vật Lý (Physical Evidence Cross-Examination)
1. **Yêu cầu cảnh báo LOC >= 475 trong `audit_plan.mjs`**:
   - *Kiểm tra vật lý*: File `src/client/game_canvas.tsx` hiện có 476 dòng (SLOC: 405). Đây là sự thật vật lý. Script `check_loc.mjs` đã phát hiện và cảnh báo "Warning".
   - *Phân loại*: `Physical Evidence Found`.
2. **Yêu cầu kịch bản chụp cận cảnh `--scenario tile-aura` trong `capture_visual_evidence.mjs`**:
   - *Kiểm tra vật lý*: Script `capture_visual_evidence.mjs` hiện tại hỗ trợ `--dual-viewport` chụp toàn cảnh sa bàn (top-down / tilt 40°). Việc thẩm định hiệu ứng hào quang của từng ô cụ thể đang dựa vào view toàn cảnh. Bổ sung camera rig macro zoom là một cải tiến hữu ích cho các vé đồ họa vi mô.
   - *Phân loại*: `Physical Evidence Found`.

#### Vòng 2: Lọc Qua Lăng Kính An Toàn & Nghịch Đảo Bất Biến (Adversarial Inversion & Guardrail Filter)
1. **Đánh giá cảnh báo LOC trong `audit_plan.mjs`**:
   - Nếu đưa cảnh báo cứng vào pre-plan audit, các kế hoạch sửa đổi nhẹ 1-2 dòng trên các file đã lớn (như thêm prop vào `game_canvas.tsx`) sẽ bị chặn oan, buộc phải gộp việc tái cấu trúc vào vé (vi phạm quy tắc *Scope Bundling Ban & Single Domain per Ticket*).
   - *Kết luận*: **DISMISSED AS HARD GATE / ACCEPTED AS SOFT NOTICE**. Giữ nguyên cơ chế hiện tại: cho phép ghi nhận nợ kỹ thuật bất biến nếu SLOC vẫn dưới trần cứng (500 dòng đối với Tier 2).
2. **Đánh giá cờ kịch bản macro trong `capture_visual_evidence.mjs`**:
   - Việc bổ sung flag không làm suy giảm bất kỳ quy tắc an toàn nào và giúp nâng cao chất lượng bằng chứng của Phase 3.0 cho các vé đồ họa tiếp theo.
   - *Kết luận*: **VERIFIED SYSTEMIC FRICTION**. Đề xuất đưa vào backlog cải tiến công cụ kiểm thử trực quan.

---

## 6. KẾT LUẬN & ĐỀ NGHỊ BƯỚC TIẾP THEO

Vé **IMP-256** đã hoàn tất 100% các tiêu chuẩn kỹ thuật, đồ họa và quy trình 4-Station Closed-Loop Pipeline theo đúng hiến pháp `GEMINI.md`. Toàn bộ các cổng thẩm định độc lập từ Trạm 1 đến Trạm 4 đều đạt kết quả xuất sắc.

Sẵn sàng chuyển tiếp sang vé tiếp theo trong lộ trình Epic 2.
