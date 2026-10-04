# PILLAR VIII: KIẾN TRÚC MÔ-ĐUN SÂU & AGGREGATE ROOT PHÒNG CHƠI (DEEP MODULES & AGGREGATE ROOT)

> **Scope**: `src/server/domain/game_room_session.ts`, `src/server/room_manager.ts`, `src/client/`

---

1. **Full Collection Protocol Parity (Proxy/Adapter Completeness)**: Khi xây dựng Proxy hoặc Adapter để bọc/thay thế Collection chuẩn (`Map`, `Set`, `Array`), BẮT BUỘC phải cài đặt 100% protocol methods (`[Symbol.iterator]`, `entries()`, `keys()`, `values()`, `size`, `forEach()`, `clear()`, `get()`, `set()`, `has()`, `delete()`). Phân tách rõ ràng ngữ nghĩa (semantics) giữa trường bắt buộc (`size = sessions.size`, `has` luôn `true` khi session tồn tại kể cả khi mang giá trị falsy như `false`, `0`) và trường tùy chọn (`size` đếm `val !== undefined`). CẤM tạo Partial Proxy chỉ bẫy 3-4 methods vì sẽ gây ra silent bug làm tê liệt `for...of` và `.size`.
2. **Ban Pseudo-Proxies on Scalar Primitives**: CẤM tạo `Proxy` bọc các biến primitive (scalar: boolean, number, string) bên trong hàm cục bộ. Phải dùng cấu trúc dữ liệu đơn giản chuẩn mực (Local Map 1-entry `new Map([[key, value]])`) và đồng bộ ngược sau khi hàm thực thi.
3. **Getter Allocation Churn Prohibition**: CẤM truyền getter động (vốn sinh Proxy instance mới mỗi lần truy cập như `this.auctions`) vào các hàm điều phối tuần hoàn. Phải truyền trực tiếp target state hoặc callback để tránh cấp phát rác GC liên tục.
4. **EndTurn Direct Session Dispatch & WaitingRoll Guard Invariant [IMP-210]**: Trong mô hình Aggregate Root `GameRoomSession`, hàm điều phối lượt `doHandleEndTurnSession(session, ...)` nhận trực tiếp session và chuyển giao thẳng cho `executeTurnEnd` bằng local single-entry maps. Tại lớp Facade `RoomManager.handleEndTurn`, hệ thống bắt buộc phải kiểm tra điều kiện chặn kết thúc lượt khi chưa đổ xúc xắc (`!session.rolledThisTurn && session.room.phase === TurnPhase.WaitingRoll && (current.auditTurnsLeft ?? 0) <= 0`) trước khi dispatch, bảo toàn 100% nghiệp vụ chống skip lượt gian lận.
