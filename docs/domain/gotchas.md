# VTCOON DOMAIN DESIGN INVARIANTS (BỘ NGUYÊN LÝ THIẾT KẾ MIỀN BẤT BIẾN)

> **ACTIVE PRE-FLIGHT GATE (GIAO THỨC TRUY VẤN BẮT BUỘC)**:
> Mọi Agent (Main Agent & Subagents) trước khi lập kế hoạch, can thiệp hoặc tái cấu trúc mã nguồn thuộc Domain nào BẮT BUỘC phải tra cứu các Bất biến thuộc Domain đó.
> CẤM vi phạm các Ràng buộc cứng (Hard Invariants) đã được đúc kết từ thực nghiệm.
>
> 📦 **LƯU TRỮ LỊCH SỬ**: Toàn bộ chi tiết vi mô các sự cố và bài học lịch sử từ **#1 đến #289** đã được lưu trữ toàn vẹn tại [docs/domain/gotchas_archive.md](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas_archive.md).

---

## 🧭 CHỈ MỤC 7 TRỤ CỘT BẤT BIẾN (INVARIANT PILLARS)

| Trụ Cột | Trọng Tâm Nghiệp Vụ | Phạm Vi Mã Nguồn |
| :--- | :--- | :--- |
| **[Pillar I: FSM & Vòng Đời]** | Phase Transitions, Reset Cờ Hành Động, Dọn Dẹp Turn N+1 | `src/domain/fsm/`, `turn_loop.ts` |
| **[Pillar II: Kinh Tế & Kho Bạc]** | Bảo Toàn Dòng Tiền, Định Giá SSOT, Vai Trò Thực Thể Âm Vốn | `src/domain/property_*`, `treasury_*` |
| **[Pillar III: Đàm Phán & Bot]** | Cooldown Cấp Phòng, Định Giá Thặng Dư Đa Trục, Cấm Vận Dẫn Đầu | `src/domain/bot/`, `room_property_*` |
| **[Pillar IV: WebSocket & Delta]** | Quy Trình 5 Trạm, Array Tombstone `[]`, Khử Null vs Undefined | `src/server/`, `apply_delta.ts` |
| **[Pillar V: Công Thái Học UI 2D]** | Phân Tầng 3 Hàng 360px, Sàn Chạm 44px, Zero Anti-Patterns, SSOT | `src/client/ui/`, `modals/` |
| **[Pillar VI: Kiểm Thử Detroit]** | Adversarial Inversion (RED), Atomic Contracts, Tránh Mock Echo | `tests/**` |
| **[Pillar VII: Mô-đun Sâu & DDD]** | Full Collection Protocol Parity, Ban Scalar Pseudo-Proxies | `src/server/`, `src/domain/` |

---

## 🏛️ CHI TIẾT 7 BỘ NGUYÊN LÝ BẤT BIẾN

### Pillar I: [FSM & VÒNG ĐỜI TRẠNG THÁI]
1. **Phase-Driven Action State Reset**: Cờ hành động phía client (`hasRolledThisTurn`, `isActing`) bắt buộc phải reset theo sự chuyển dịch của `turnPhase` (ví dụ: chuyển sang `WaitingRoll` lập tức reset `hasRolledThisTurn = false`), TUYỆT ĐỐI KHÔNG chỉ dựa vào sự thay đổi của `currentPlayerId` (đặc biệt khi người chơi đổ đôi được thêm lượt).
2. **Transient Teardown ở Turn N+1**: Mọi trạng thái quá độ tạm thời (phiên đấu giá, đề xuất thương lượng, modal sự kiện, prompt nhắc nhở) bắt buộc phải được giải phóng và dọn sạch (`null`) ngay khi bước sang lượt kế tiếp (`handleRollDice` / `handleEndTurn`). Cấm để rò rỉ trạng thái quá độ sang Turn N+1.
3. **Anti-Deadlock Double Rolls**: Trong `TurnPhase.ActionPhase`, thanh điều khiển luôn ưu tiên nút mua đất `[🏷️ Mua Đất]`. Khi người chơi chủ động từ chối và phòng chuyển sang `TurnPhase.PropertyManagement`, hệ thống phải khôi phục ngay lập tức nút `[🎲 Đổ Tiếp (Đôi)]` nếu trước đó đổ đôi (`canRollAgain === true`), triệt tiêu hoàn toàn nguy cơ deadlock kẹt lượt.
4. **Unbuilt Countdown Teardown SSOT [IMP-205]**: Thuộc tính đếm vòng chậm xây dựng `unbuiltRounds` (`CC_SLOW_BUILD`) khi ô đất bị thu hồi hoặc trúng đấu giá bắt buộc phải bị XÓA BỎ (`delete state.unbuiltRounds` -> `undefined`). Tuyệt đối cấm gán `= 0` vì giá trị `0 !== undefined` sẽ tiếp tục kích hoạt đếm vòng ở các lượt kế tiếp và gây ra vòng lặp thu hồi vô tận sau mỗi 2 lượt.

### Pillar II: [KINH TẾ & KHO BẠC]
1. **Treasury Conservation Invariant**: Tổng tiền tệ trong game là một đại lượng bảo toàn: $\Delta \text{Hệ Thống} = \Delta \text{Người Chơi} + \Delta \text{Kho Bạc}$. Mọi khoản phạt tài chính (phí bão, thuế, vé vào cổng) nếu không trả cho người chơi khác bắt buộc phải chảy về Kho Bạc (`Treasury`), cấm để tiền biến mất vô căn cứ.
2. **Insolvent Entity Role Guard**: Thực thể có số dư âm (`balance < 0` trong `InsolvencyPhase`) TUYỆT ĐỐI KHÔNG được đóng vai trò là bên mua (`buyer`) trong giao dịch P2P hoặc đổi tài sản bù tiền âm (`price <= 0`). Thực thể âm vốn chỉ được đóng vai trò là bên bán (`seller`) với dòng tiền mặt thu về dương (`price > 0`) để cứu nợ.
3. **Dynamic Pricing SSOT**: Tuyệt đối không hardcode giá trị giá đất (như con số 600) trong logic client hay UI. Giá trị BĐS bắt buộc phải truy vấn từ nguồn thẩm quyền `PROPERTY_DEEDS.get(cellIndex)?.price`.
4. **Pre-Consumption Valuation Invariant**: Khi kích hoạt các hiệu ứng miễn giảm hay thẻ bài (như `CC_DIPLOMATIC` miễn tiền thuê), hệ thống bắt buộc phải tính toán giá trị gốc (`potentialRent = calculateRent(...)`) trước khi tiêu thụ thẻ để ghi nhận số tiền tiết kiệm được vào bảng tin tường minh.
5. **Mortgaged Property P2P Debt Migration SSOT**: Khi BĐS đang thế chấp được giao dịch qua P2P (giá sàn 35% thay vì 70%), nghĩa vụ nợ gốc (`mortgageLoans[cell]`) và danh mục thế chấp (`mortgagedProperties`) bắt buộc phải được di dời nguyên vẹn và nguyên tử từ bên bán sang bên mua trong `executeP2PTrade`, đảm bảo bảo toàn tổng nợ toàn phòng.
6. **Auction Clean Title & Senior Treasury Payoff SSOT [IMP-205]**: Khi BĐS được phát mãi hoặc bán đấu giá chuyển giao, người trúng đấu giá bắt buộc nhận BĐS sạch thế chấp (`isMortgaged = false`, xóa bỏ `unbuiltRounds`). Đối với tài sản thế chấp bị phát mãi của con nợ, Kho Bạc là chủ nợ ưu tiên cao nhất: tiền trúng đấu giá phải ưu tiên cấn trừ hoàn trả nợ gốc thế chấp trước (`loanPayoff = Math.min(winningBid, loan)` vào `room.treasury`), phần thặng dư mới hoàn trả cho con nợ. Đấu giá đất công/thu hồi nộp 100% vào `room.treasury`.
7. **Utility Revenue & Anti-Camping SSOT [IMP-214]**: Hai ô tiện ích (Ô 12 EVN & Ô 28 Viettel) áp dụng biểu phí dừng chân phẳng (1 ô: 1.000, 2 ô: 2.500, nâng cấp Smart Grid/5G: 3.500 Tr. VNĐ), triệt tiêu hoàn toàn xúc xắc 2D6 Monopoly 1935 cũ. Các cơ chế thu tiền mạng lưới (Hóa đơn tiền điện EVN khi đối thủ qua GO: C1=100, C2=200, C3=300 Tr./ô, C0=0 Tr.; Cước viễn thông Viettel 150 Tr. khi đối thủ rút thẻ sự kiện Market/Chance) BẮT BUỘC tuân thủ 4 rào chắn: (1) Khóa hoàn toàn khi chủ sở hữu đang ở Trạm Kiểm Toán (`inAudit || auditTurnsLeft > 0`); (2) Khóa hoàn toàn khi tiện ích đang bị thế chấp (`owner.mortgagedProperties?.includes(...) || isMortgaged`); (3) Miễn thu cho chính mình (Self-Billing Exemption); (4) Non-inflationary Sink khi con nợ mất thanh khoản: con nợ bị trừ đủ tiền âm, chủ tiện ích chỉ nhận tối đa tiền mặt thực tế của con nợ, cấm sinh tiền ma vào hệ thống.

### Pillar III: [ĐÀM PHÁN & TRÍ TUỆ NHÂN TẠO BOT]
1. **Multi-Agent Harassment Guard**: Trong giao dịch P2P, cooldown đề xuất bắt buộc phải được áp dụng ở phạm vi Mục Tiêu / Phòng (`room.lastTargetTradeOfferRound`), không chỉ ở phạm vi Tác tử (Actor), ngăn chặn triệt để tình trạng $N$ bot cùng spam đề xuất đổi đất tới 1 người chơi trong 1 vòng.
2. **Surplus Property & Bilateral Valuation**: Đề xuất đổi đất của Bot phải dựa trên đất thặng dư (Surplus Properties - đất đơn lẻ không thể tạo độc quyền do đối thủ đã chặn) kết hợp 3 trục: (a) Độ lệch giá gốc; (b) Giá trị giúp đối tác hoàn tất độc quyền xây nhà (`partnerGetsMonopoly`); (c) Tính cách Bot (Aggressive, Balanced, Passive).
3. **Leader Embargo Invariant**: Bot có trí tuệ chiến lược từ chối nhượng ô đất giúp người chơi đang dẫn đầu phòng (`isLeadingPlayer`) hoàn thành độc quyền màu, trừ khi nhận lại gói giá trị cực kỳ áp đảo.
4. **Instant Bot Coordination**: Khi người thật gửi đề xuất giao dịch cho Bot, Server bắt buộc phải xử lý định giá và phản hồi đồng bộ tức thì 0ms (`pending: false`), tuyệt đối không mở modal đếm ngược 15s chờ Bot.

### Pillar IV: [MẠNG WEBSOCKET & ĐỒNG BỘ DELTA]
1. **Vertical Slice 5 Trạm**: Mọi trường dữ liệu hoặc sự kiện mới bắt buộc phải đi qua đủ 5 trạm vật lý: (1) Entity/FSM gốc; (2) DTO interface & Mappers (`PlayerDelta`, `buildDeltaFromRoom`); (3) Broadcaster diff (`isPlayerEqual` sparse whitelist); (4) Client Parser (`OPTIONAL_KEYS`); (5) Client Store & UI.
2. **Array Tombstone Protocol**: Các tập hợp động (`hand`, `modifiers`, `mortgagedProperties`) khi được dọn sạch bắt buộc phải serialize mảng rỗng `[]` (cấm serialize `undefined` hoặc bỏ sót). Hàm so sánh delta `isPlayerEqual` bắt buộc phải so sánh từng phần tử mảng để ngăn chặn client giữ lại item đã bị xóa.
3. **Explicit Tombstone Protocol (`null` vs `undefined`)**: Các trường đối tượng bị xóa (như `auction`, `lastTradeOffer`) bắt buộc phải gán `null` tường minh trên server để client parser nhận biết và hủy modal tương ứng.
4. **Authoritative Resync trên Client Ephemeral Timers**: Mọi bộ đếm thời gian countdown ở client bắt buộc phải bind effect đồng bộ với trường delta của server (như `auction.timeRemaining`), triệt tiêu hiện tượng trôi xung nhịp do nghẽn mạng hay lag tab.
5. **Monotonic Countdown Guard & Single Source of Urgency [IMP-207]**: Khi client nhận delta thời gian `delta.timeRemaining`, bộ điều phối `apply_delta.ts` bắt buộc chặn các bước nhảy tiến thời gian 1s (41s -> 42s do lệch pha làm tròn `Math.ceil`), chỉ chấp nhận khi thời gian giảm xuống hoặc có reset hợp lệ (đổi lượt, đổi phase, gieo đôi). Trên UI, khi có subphase khẩn cấp (Đấu giá, Thương lượng Bot, Mua đứt), TopBar bắt buộc ẩn `role="timer"` để nhường quyền đếm ngược duy nhất cho widget tại chỗ.
6. **Turn Timer SSOT Deadline & TopBar Zero-Freeze Guard [IMP-215]**:
   - **Server SSOT**: Khi Bot nhận lượt (`current.isBot === true`), `TurnOrchestrator` bắt buộc thiết lập deadline thẩm quyền (`this.deadlines.set(roomCode, Date.now() + phaseTimeoutMs)`). Bất kỳ chu kỳ chuyển phase/bước Bot nào cũng BẮT BUỘC gọi `this.orchestrate(roomCode)` TRƯỚC KHI gọi `this.broadcaster.broadcastRoomDelta(roomCode)` để delta luôn mang `timeRemaining > 0` SSOT của phase kế tiếp.
   - **Client Non-Zero Guard**: `apply_delta.ts` bảo vệ 2 tầng: (a) Khi đổi lượt, nếu `delta.timeRemaining <= 0` hoặc falsy, fallback về 60s; (b) Giữa lượt (không đổi lượt/phase), TUYỆT ĐỐI KHÔNG ghi đè về `0` (`delta.timeRemaining > 0 && delta.timeRemaining <= state.turnTimeRemaining`), ngăn chặn triệt để hiện tượng đứng hình `⏱️ 00:00` đỏ nhấp nháy trên TopBar khi nhận delta sự kiện giữa lượt (trả tiền thuê, mua đất).
   - **AFK Recovery Grace**: Bảo toàn bất biến `wasInAudit` (TC-151.04) trong `executeSafeAfkAction`: khi `player.wasInAudit === true`, chỉ gạt cờ `wasInAudit = false` và `return` để `orchestrate` tái lập chu kỳ đệm an toàn.

### Pillar V: [GIAO DIỆN 2D & CÔNG THÁI HỌC RETROPOLY]
1. **Phân Tầng 3 Hàng Công Thái Học Mobile 360px**: Các Modal quyết định tài chính bắt buộc chia 3 tầng rõ ràng: Hàng 1 (Dòng đệm thông tin tài chính ví/thiếu hụt) $\rightarrow$ Hàng 2 (Nút CTA hành động chính: Mua hoặc Cầm Cố) $\rightarrow$ Hàng 3 (Cặp nút phụ thoát hiểm: Đóng Xoay Vốn vs Bỏ Qua).
2. **Sàn Diện Tích Chạm (Touch Targets Floor)**: Mọi nút bấm thao tác trên giao diện phải đạt kích thước tối thiểu $\ge 44$px (`min-h-[44px]`), nút hành động chính (Primary CTA) phải đạt $\ge 48$px (`min-h-[48px]`).
3. **Root-Level Sticky Action Footer**: Cụm nút hành động của Modal bắt buộc phải là con trực tiếp của container gốc (`sticky bottom-0`), tuyệt đối không lồng bên trong container cuộn để tránh mất quyền kiểm soát trên mobile.
4. **Bộ Lọc 4 Anti-Patterns**: Cấm triệt để: (1) `border-accent-on-rounded`, (2) `bounce-easing`, (3) `gray-on-color`, (4) `gradient-text`. Kiểm tra tự động bằng `npm run lint:ui`.
5. **Strict Intent Callback Isolation**: Nút hành động phát sinh intent lên server (như `onBuy`, `onPass`, `onBid`) CẤM dùng fallback im lặng sang hàm đóng UI (`onPass ?? onClose`). Nút nào có intent thì chỉ gọi intent đó; nút đóng UI gọi riêng `onClose`.
6. **Authoritative State Shadowing Prohibition**: Khi Host/Container đã có helper tính toán năng lực thẩm quyền (`resolvePurchaseAffordance`), các caller (Dock, BoardClick) CẤM tự tính boolean rồi truyền override (`canBuy`) qua modal payload.
7. **A11y Attribute Co-Evolution**: Khi thay đổi nhãn/title giao diện nhằm tránh xung đột từ khóa (ví dụ: đổi "Thời gian" thành "Ánh sáng"), bắt buộc phải cập nhật đồng bộ 100% cả `aria-label`/`aria-description` tương ứng, và kiểm thử unit phải assert cả 2 thuộc tính để tránh chắp vá cho thiết bị hỗ trợ trợ năng.
8. **Mobile Real Estate 360px Ergonomics & Grid Action Standard [IMP-208P]**: Cụm nút hành động thẻ BĐS trong danh mục BĐS (`PropertyPortfolioModal`) bắt buộc dàn theo hệ lưới 2 cột `grid grid-cols-2 gap-1.5`, nút hành động chính (Thế Chấp / Giải Chấp) chiếm `col-span-2 min-h-[44px]`, các nút phụ (Hạ Cấp / Sổ Đỏ) chiếm `col-span-1 min-h-[44px]` (hoặc `col-span-2` khi không có hạ cấp). Toàn bộ nhãn, chip, subtext trong modal BĐS bắt buộc đạt sàn chữ $\ge 11$px (loại bỏ hoàn toàn micro-text $< 11$px). Các phím tắt tiền mặt/gợi ý giá bắt buộc có gờ bóng xúc giác 3D (`shadow-[0_2px_0_0_...]`) và độ lún cơ học `active:translate-y-[2px]`.

### Pillar VI: [KIỂM THỬ HỢP ĐỒNG DETROIT CLASSICAL]
1. **Adversarial Inversion Gate (RED First)**: Viết test hợp đồng trước và chứng minh toàn bộ test bị FAIL (RED) vì đúng lý do nghiệp vụ trước khi được phép chạm vào mã nguồn `src/**`.
2. **Atomic Contract Mandate**: Mỗi ca kiểm thử chỉ chứa 1–4 assertions, tập trung vào 1 hành vi duy nhất, cấm sử dụng vòng lặp trong `it()`. Cấm tuyệt đối các bài test checklist tĩnh (`fs.existsSync`, `typeof fn`, test LOC trong unit test).
3. **Universal 5-Facet Matrix**: Bộ test cho mỗi tính năng phải bao quát đủ 5 mặt: (1) Biên và giá trị cực hạn (Boundary); (2) Phản ứng trạng thái (Reactivity); (3) Dọn dẹp hủy tài nguyên (Disposal); (4) Phòng thủ lỗi (Error Defense); (5) Bán kính ảnh hưởng đa chiều (Blast Radius).
4. **Detroit Classical State Assertions**: Khẳng định trạng thái quan sát được của hệ thống (Observable State/Output), cấm spy/mock vào các hàm private nội bộ của module.

### Pillar VII: [KIẾN TRÚC MÔ-ĐUN SÂU & AGGREGATE ROOT PHÒNG CHƠI]
1. **Full Collection Protocol Parity (Proxy/Adapter Completeness)**: Khi xây dựng Proxy hoặc Adapter để bọc/thay thế Collection chuẩn (`Map`, `Set`, `Array`), BẮT BUỘC phải cài đặt 100% protocol methods (`[Symbol.iterator]`, `entries()`, `keys()`, `values()`, `size`, `forEach()`, `clear()`, `get()`, `set()`, `has()`, `delete()`). Phân tách rõ ràng ngữ nghĩa (semantics) giữa trường bắt buộc (`size = sessions.size`, `has` luôn `true` khi session tồn tại kể cả khi mang giá trị falsy như `false`, `0`) và trường tùy chọn (`size` đếm `val !== undefined`). CẤM tạo Partial Proxy chỉ bẫy 3-4 methods vì sẽ gây ra silent bug làm tê liệt `for...of` và `.size`.
2. **Ban Pseudo-Proxies on Scalar Primitives**: CẤM tạo `Proxy` bọc các biến primitive (scalar: boolean, number, string) bên trong hàm cục bộ. Phải dùng cấu trúc dữ liệu đơn giản chuẩn mực (Local Map 1-entry `new Map([[key, value]])`) và đồng bộ ngược sau khi hàm thực thi.
3. **Getter Allocation Churn Prohibition**: CẤM truyền getter động (vốn sinh Proxy instance mới mỗi lần truy cập như `this.auctions`) vào các hàm điều phối tuần hoàn. Phải truyền trực tiếp target state hoặc callback để tránh cấp phát rác GC liên tục.
4. **EndTurn Direct Session Dispatch & WaitingRoll Guard Invariant [IMP-210]**: Trong mô hình Aggregate Root `GameRoomSession`, hàm điều phối lượt `doHandleEndTurnSession(session, ...)` nhận trực tiếp session và chuyển giao thẳng cho `executeTurnEnd` bằng local single-entry maps. Tại lớp Facade `RoomManager.handleEndTurn`, hệ thống bắt buộc phải kiểm tra điều kiện chặn kết thúc lượt khi chưa đổ xúc xắc (`!session.rolledThisTurn && session.room.phase === TurnPhase.WaitingRoll && (current.auditTurnsLeft ?? 0) <= 0`) trước khi dispatch, bảo toàn 100% nghiệp vụ chống skip lượt gian lận.
