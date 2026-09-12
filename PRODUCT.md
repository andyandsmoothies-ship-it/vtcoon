# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Người chơi game chiến thuật tài chính, cờ tỷ phú gia đình, game thủ Việt Nam yêu thích trải nghiệm sa bàn 3D (miniature diorama) tinh xảo, và người dùng trên mọi thiết bị màn hình desktop hoặc trình duyệt web hiện đại.

## Product Purpose

VTCoOn (Đại Gia Địa Ốc Việt Nam 3D) tái hiện trò chơi cờ tỷ phú kinh điển trong bối cảnh thị trường bất động sản và hạ tầng kinh tế Việt Nam với chiều sâu chiến thuật chân thực: đấu giá cưỡng chế, thế chấp giải cứu thanh khoản, mua bán cổ phiếu HOSE, thị trường P2P song phương, và vận hành sa bàn tiểu họa 3D xúc giác thượng lưu (tactile luxury) ở tốc độ 60 FPS.

## Positioning

VTCoOn định vị là một board game 3D trực tuyến mang đậm bản sắc văn hóa kinh tế Việt Nam với tiêu chuẩn hoàn thiện đồ họa xúc giác đẳng cấp quốc tế:
- Kết hợp công nghệ kết xuất 3D WebGL (React Three Fiber, Three.js) với giao diện 2D siêu sắc nét, tactile shadows và micro-interactions mượt mà.
- Loại bỏ hoàn toàn cảm giác web phẳng, bảng biểu hành chính hoặc prototype sơ cấp, mang lại cảm giác cầm nắm, trọng lượng vật lý và độ đanh chắc của vật phẩm sa bàn cao cấp.

## Operating Context

- Kiến trúc Server-Authoritative FSM (Finite State Machine) bảo đảm tính bất biến toàn vẹn của dòng tiền và trạng thái phòng chơi qua WebSocket (`ws`).
- Frontend SPA xây dựng bằng Vite, React 19, TypeScript (strict mode), Tailwind CSS v4 và Three.js / React Three Fiber / @react-three/drei / postprocessing.
- Bot AI đa tính cách (Thực dụng / Aggressive, Cân bằng / Balanced, Thận trọng / Passive) với thuật toán ra quyết định độc lập.
- Đồng bộ dữ liệu nhẹ qua DeltaPayload (< 10KB/tick), xử lý khôi phục kết nối và Grace Period an toàn 60 giây.

## Capabilities and Constraints

- Bàn cờ 40 ô chuẩn hóa địa danh Việt Nam (Cần Thơ, TP.HCM, Đà Nẵng, Hà Nội, Sa Pa, Cảng HKQT Long Thành, v.v.).
- 28 thẻ sổ đỏ (Title Deeds), 5 nhóm màu bất động sản, công trình 3 cấp (C1 Shophouse, C2 Biệt thự, C3 Resort) và cơ chế Đấu giá tự động (Auto-Auction).
- Sàn Giao Dịch P2P song phương, sàn chứng khoán HOSE, và hệ thống Phiếu Thị Trường / Phiếu Cơ Hội.
- Ràng buộc hiệu năng: 60 FPS mượt mà trên Canvas 3D, không thực hiện tính toán nặng trên luồng kết xuất chính, ngân sách chuyển động UI từ 100ms đến 350ms.
- Bộ linter UI độc lập `npm run lint:ui` kiểm soát 4 Anti-patterns: `border-accent-on-rounded`, `bounce-easing`, `gray-on-color`, `gradient-text`.

## Brand Commitments

- Đậm chất tài phiệt thượng lưu, đanh chắc, tinh tế và đậm đà bản sắc Việt Nam.
- Ba từ định vị thương hiệu: **đẳng cấp, xúc giác, bản sắc** (prestigious, tactile, authentic).
- Tránh xa các yếu tố thẩm mỹ rẻ tiền:
  - Hiệu ứng đổ bóng phát sáng (glow/neon) kiểu game viễn tưởng rẻ tiền.
  - Chuyển động nảy lò xo (bounce) gây cảm giác đồ họa đồ chơi thiếu trọng lượng.
  - Viền màu directional trên nút bo góc (`border-b-4`) làm méo hình học CSS.
  - Chữ xám đè trên nền màu sặc sỡ hoặc dải màu chữ cắt (gradient text) làm mờ độ tương phản.

## Evidence on Hand

- `docs/requirements.md` quy định chi tiết 40 ô bàn cờ, thông số tài chính vĩ mô và luật chơi.
- `docs/domain/entity_model.md` và `docs/domain/property_data.ts` là SSOT cho 28 sổ đỏ và dữ liệu kinh tế.
- `docs/domain/design.md` và `DESIGN.md` là kim chỉ nam ngôn ngữ thiết kế mỹ thuật và hệ thống token.
- Bộ kiểm thử tự động toàn diện (>110 test files, >1300 test cases) bao phủ FSM, WebSocket, Bot AI, Chaos Simulation và Contract Tests.
- `scripts/lint_ui.mjs` kiểm tra tĩnh 0 vi phạm anti-patterns trên toàn bộ tệp giao diện client.

## Product Principles

1. **Bảo toàn bất biến tài chính**: Tiền tệ và tài sản toàn cục tuân thủ định luật bảo toàn tuyệt đối; mọi giao dịch đều sinh log kiểm toán có `correlationId`.
2. **Xúc giác là linh hồn**: Mỗi nút bấm, quân cờ, thẻ bài đều có độ nảy vật lý, đổ bóng đa tầng và âm thanh phản hồi dứt khoát.
3. **Ý chí người chơi là trung tâm**: Mọi quyết định giao dịch, mua đất, đấu giá phải qua Intent rõ ràng, không thực hiện hành vi ngầm ngoài tầm kiểm soát của người chơi.
4. **Mượt mà và hiệu quả**: Giao diện phản hồi tức thì, tối ưu GPU-accelerated transforms, tôn trọng `prefers-reduced-motion`.

## Accessibility & Inclusion

- Tiêu chuẩn khả năng tiếp cận WCAG 2.1 AA trên toàn bộ giao diện 2D.
- Kích thước vùng tương tác bấm tối thiểu 44x44px.
- Độ tương phản màu sắc cao, trạng thái focus-visible sắc nét.
- Hỗ trợ đầy đủ cờ `prefers-reduced-motion` nhằm triệt tiêu các chuyển động phức tạp cho người dùng nhạy cảm.
