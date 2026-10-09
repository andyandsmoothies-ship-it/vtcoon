# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE: BÓC TÁCH TỪ ĐIỂN THÔNG BÁO GIAO DIỆN (IMP-297)
> **Phân hệ mục tiêu:** `client-ui`
> **Phạm vi kỹ thuật:** Giải phóng nợ kỹ thuật dòng mã (LOC Debt) của `src/client/ui/actionable_notification.ts` (hiện chạm trần báo động 491/500 LOC, Tier 2, chỉ còn dư 9 dòng mã) bằng cách phân tách toàn bộ từ điển tĩnh sang kiến trúc Deep Module (tương tự chuẩn IMP-295): `actionable_notification_gameplay.ts` (~235 LOC), `actionable_notification_system.ts` (~215 LOC) và Facade hợp nhất `actionable_notification_map.ts` (~30 LOC).
> **Cam kết cốt lõi:**
> 1. **Pure Move 100% (Zero Semantic Mutation):** Bảo toàn nguyên vẹn 100% nội dung 59 định nghĩa thông báo ngữ cảnh, 14 khóa bí danh (aliases), logic phân giải đa ngữ `vi.rejectReasons` và cấu trúc định dạng chuỗi `formatServerErrorMessage`.
> 2. **Ranh Giới Kiến Trúc Rõ Ràng (Deep Module Domain Separation):** Tách bạch giữa thông báo nghiệp vụ bàn cờ (Gameplay), thông báo sảnh/hệ thống/đàm phán (System), bảng ánh xạ hợp nhất (Map Facade) và bộ xử lý nghiệp vụ (Resolver & Formatter).
> 3. **Giải Phóng Triệt Để Cảnh Báo Vàng Tier 2:** 100% các tệp mã nguồn đều $\le 235$ LOC (cách rất xa ngưỡng cảnh báo 400 LOC và trần 500 LOC của Tier 2), tạo dư địa phát triển thênh thang > 250 dòng cho mỗi phân hệ.
> 4. **Scaffolding Protocol & Semantic Behavioral RED:** Khởi tạo stub rỗng cho các tệp mới trước khi chạy test, bảo đảm test suite thất bại do runtime assertions thay vì loader error.
> 5. **Facade Re-export 100% Tương Thích Ngược:** Tái xuất khẩu toàn bộ `ActionableNotification`, `ACTIONABLE_NOTIFICATIONS_MAP`, `DEFAULT_FALLBACK_NOTIFICATION` tại `actionable_notification.ts` để bảo vệ 100% caller và các bộ kiểm thử living suites.
> **Baseline Working Tree Dependencies (Predecessor IMP-294/IMP-295/IMP-296):** `src/client/3d/adaptive_cinematic_camera.tsx`, `src/client/3d/camera_state_machine.ts`, `src/client/3d/cinematic_chase_camera.ts`, `src/client/audio/sound_synth_recipes.ts`, `src/client/3d/camera_kinematic_helpers.ts`, `src/client/3d/camera_location_beacon.tsx`, `src/client/3d/camera_soft_return.ts`, `src/client/3d/cinematic_spline_flyby.ts`, `src/client/3d/use_camera_gestures.ts`, `src/client/audio/synth_recipes_ambient.ts`, `src/client/audio/synth_recipes_gameplay.ts`, `src/client/audio/synth_recipes_ui.ts`, `tests/client/camera_gestures.test.ts`, `tests/client/camera_soft_return_and_beacon.test.ts`, `tests/client/cinematic_spline_flyby.test.ts`, `tests/client/dramatic_pacing_camera.test.ts`, `tests/client/sound_synth_recipes_modular.test.ts`, `tests/client/spatial_kinematics_camera.test.ts`
---
### Bảng 1: Phân bổ Ranh giới Phân hệ (Subsystem Boundary Alignment)
| Tệp Mã Nguồn | Phân Hệ | Vai Trò Kiến Trúc |
| :--- | :--- | :--- |
| `src/client/ui/actionable_notification_gameplay.ts` | `client-ui` | **MỚI**: Lưu trữ 37 định nghĩa thông báo nghiệp vụ bàn cờ, tài chính, đất đai, đấu giá, ngân sách (`GAMEPLAY_NOTIFICATIONS_MAP`) |
| `src/client/ui/actionable_notification_system.ts` | `client-ui` | **MỚI**: Lưu trữ 22 định nghĩa thông báo phòng, kết nối, đàm phán, phá sản và 14 aliases (`SYSTEM_NOTIFICATIONS_MAP`) |
| `src/client/ui/actionable_notification_map.ts` | `client-ui` | **MỚI**: Facade hợp nhất 2 từ điển thành `ACTIONABLE_NOTIFICATIONS_MAP` và cấu hình `DEFAULT_FALLBACK_NOTIFICATION` |
| `src/client/ui/actionable_notification.ts` | `client-ui` | **SỬA**: Tinh gọn tệp thành Business Resolver & Message Formatter thuần túy (`resolveActionableNotification`, `formatServerErrorMessage`), re-export facade |
| `tests/client/actionable_notification_modular.test.ts` | Living Test | **MỚI**: Living Contract Test kiểm tra độc lập tính toàn vẹn từ điển, phân giải mã lỗi, fallback i18n và format chuỗi |
---
### Bảng 2: Ngân Sách Dòng Mã (LOC Accounting)
| Target physical file | Tier Classification | Baseline LOC | Expected LOC | Net Change | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/ui/actionable_notification_gameplay.ts` | Tier 2 (UI/3D/Views) | 0 | 235 | +235 | <= 500 | ✔️ Safe |
| `src/client/ui/actionable_notification_system.ts` | Tier 2 (UI/3D/Views) | 0 | 215 | +215 | <= 500 | ✔️ Safe |
| `src/client/ui/actionable_notification_map.ts` | Tier 2 (UI/3D/Views) | 0 | 30 | +30 | <= 500 | ✔️ Safe |
| `src/client/ui/actionable_notification.ts` | Tier 2 (UI/3D/Views) | 491 | 53 | -438 | <= 500 | ✔️ Safe |
| `tests/client/actionable_notification_modular.test.ts` | Living Test | 0 | 250 | +250 | <= 600 | ✔️ Safe |
---
### Trạm 1: Hợp Đồng Kiểm Thử Độc Lập (RED Contract Tests)
**Target physical file**: `tests/client/actionable_notification_modular.test.ts` (Tệp mới)
> **Kỷ luật Seam Discipline (Iron Law):** Không can thiệp framework internals. Kiểm thử trực tiếp hành vi quan sát được của các hàm thuần túy `resolveActionableNotification` và `formatServerErrorMessage`.
> **Quy chuẩn Scaffolding Stub Type-Safe:** Các tệp mới được scaffold trước với kiểu dữ liệu tường minh, tuyệt đối CẤM `as any` và `as unknown as T`.
> **Kỷ luật Zero Loops in it():** Cấm tuyệt đối vòng lặp `for`, `for...of`, `.forEach()` trong `it()`. Sử dụng hàm bậc cao `.every()` cho kiểm tra thuộc tính để giữ mật độ $\le 4$ asserts/test.

1. **TC-NOTIF.01 [UC-NOTIF/MSS]**: Given mã lỗi tài chính `INSUFFICIENT_FUNDS`, When phân giải qua `resolveActionableNotification`, Then nhận được cấu hình đầy đủ icon '💰', title 'Ngân Sách Không Đủ', tone 'error' và actionHint hướng dẫn thế chấp.
2. **TC-NOTIF.02 [UC-NOTIF/MSS]**: Given mã vi phạm quy tắc xây dựng `EVEN_BUILDING_VIOLATION`, When phân giải qua `resolveActionableNotification`, Then nhận được tiêu đề 'Quy Tắc Xây Đều Tay' và tone cảnh báo 'warning'.
3. **TC-NOTIF.03 [UC-NOTIF/MSS]**: Given mã lỗi dạng camelCase legacy `InsufficientFunds`, When phân giải qua `resolveActionableNotification`, Then trả về kết quả đồng nhất với mã quy chuẩn `INSUFFICIENT_FUNDS`.
4. **TC-NOTIF.04 [UC-NOTIF/MSS]**: Given mã alias `TradeFrozen`, When phân giải qua `resolveActionableNotification`, Then trỏ chính xác về cấu hình thông báo `FREEZE_ACTIVE`.
5. **TC-NOTIF.05 [UC-NOTIF/MSS]**: Given mã alias đấu giá `highest_bidder cannot pass`, When phân giải qua `resolveActionableNotification`, Then trỏ chính xác về cấu hình thông báo `HIGHEST_BIDDER_CANNOT_PASS`.
6. **TC-NOTIF.06 [UC-NOTIF/MSS]**: Given tham số reasonCode là null hoặc undefined, When gọi hàm `resolveActionableNotification`, Then trả về chính xác đối tượng `DEFAULT_FALLBACK_NOTIFICATION`.
7. **TC-NOTIF.07 [UC-NOTIF/MSS]**: Given tham số reasonCode là chuỗi rỗng không hợp lệ, When gọi hàm `resolveActionableNotification`, Then trả về chính xác đối tượng `DEFAULT_FALLBACK_NOTIFICATION`.
8. **TC-NOTIF.08 [UC-NOTIF/MSS]**: Given mã lỗi có trong từ điển đa ngữ `vi.rejectReasons` nhưng không có trong map tĩnh, When phân giải qua `resolveActionableNotification`, Then tạo thông báo fallback chứa chuỗi dịch tiếng Việt tương ứng.
9. **TC-NOTIF.09 [UC-NOTIF/MSS]**: Given mã lỗi hoàn toàn xa lạ không tồn tại trong hệ thống, When gọi hàm `resolveActionableNotification`, Then trả về đối tượng `DEFAULT_FALLBACK_NOTIFICATION`.
10. **TC-NOTIF.10 [UC-NOTIF/MSS]**: Given mã lỗi `INSUFFICIENT_FUNDS` có chứa actionHint, When gọi hàm `formatServerErrorMessage`, Then chuỗi trả về chứa đầy đủ tiêu đề, mô tả và ký tự hành động `👉`.
11. **TC-NOTIF.11 [UC-NOTIF/MSS]**: Given một thông báo không chứa actionHint, When gọi hàm `formatServerErrorMessage`, Then chuỗi trả về định dạng chuẩn `${title}: ${description}` không có đuôi chỉ dẫn.
12. **TC-NOTIF.12 [UC-NOTIF/MSS]**: Given reasonCode là null hoặc undefined, When gọi hàm `formatServerErrorMessage`, Then trả về thông báo lỗi mặc định tổng quát.
13. **TC-NOTIF.13 [UC-NOTIF/MSS]**: Given reasonCode chưa đăng ký gây fallback, When gọi hàm `formatServerErrorMessage`, Then chuỗi trả về bao gồm mã lỗi trong dấu ngoặc đơn `(${reasonCode})`.
14. **TC-NOTIF.14 [UC-NOTIF/MSS]**: Given từ điển `ACTIONABLE_NOTIFICATIONS_MAP`, When kiểm tra các danh mục trạng thái phòng và đấu giá, Then hiện diện đầy đủ các khóa cốt lõi `GAME_NOT_STARTED`, `AUCTION_EXPIRED`, `BANKRUPT`, `BOND_ALREADY_ACTIVE`.
15. **TC-NOTIF.15 [UC-NOTIF/MSS]**: Given cấu trúc các phần tử trong `ACTIONABLE_NOTIFICATIONS_MAP`, When kiểm tra qua hàm bậc cao `.every()` không dùng vòng lặp, Then mọi entry đều có đủ 4 thuộc tính bắt buộc `icon`, `title`, `description`, `tone`.
16. **TC-NOTIF.16 [UC-NOTIF/MSS]**: Given tệp `actionable_notification.ts`, When kiểm tra re-export facade, Then xuất bản đồng nhất các đối tượng `ACTIONABLE_NOTIFICATIONS_MAP` và `DEFAULT_FALLBACK_NOTIFICATION` từ `actionable_notification_map.ts`.
---
### Trạm 2: Kế Hoạch Triển Khai Chi Tiết (Implementation Tasks)

#### Task 1: Khởi Tạo Tệp Từ Điển Gameplay `src/client/ui/actionable_notification_gameplay.ts`
**Target physical file**: `src/client/ui/actionable_notification_gameplay.ts` (Tệp mới)

```typescript
// [IMP-134/IMP-297] Actionable Guidance System Gameplay Dictionary Map
export interface ActionableNotification {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  readonly tone: 'info' | 'warning' | 'error' | 'success';
  readonly actionHint?: string;
}
export const GAMEPLAY_NOTIFICATIONS_MAP: Record<string, ActionableNotification> = {
  GAME_NOT_STARTED: {
    icon: '⏳', title: 'Trận Đấu Chưa Bắt Đầu',
    description: 'Trò chơi đang ở sảnh chờ và chưa chính thức bắt đầu.',
    tone: 'info', actionHint: 'Vui lòng chờ chủ phòng khởi động ván đấu.',
  },
  // 36 additional gameplay notification entries
};
```
---
#### Task 2: Khởi Tạo Tệp Từ Điển Hệ Thống & Phòng `src/client/ui/actionable_notification_system.ts`
**Target physical file**: `src/client/ui/actionable_notification_system.ts` (Tệp mới)

```typescript
// [IMP-134/IMP-297] Actionable Guidance System System & Room Dictionary Map
import { type ActionableNotification } from './actionable_notification_gameplay.js';
export const SYSTEM_NOTIFICATIONS_MAP: Record<string, ActionableNotification> = {
  ROOM_FULL: {
    icon: '🚪', title: 'Phòng Đã Đủ Người Chơi',
    description: 'Phòng thi đấu đã đủ 4 người chơi. Vui lòng tạo phòng mới hoặc chờ ván sau!',
    tone: 'warning', actionHint: 'Tạo phòng mới để bắt đầu ván đấu cùng bạn bè.',
  },
  // 21 additional system/room/trade entries and 14 alias keys
};
```
---
#### Task 3: Khởi Tạo Tệp Facade Hợp Nhất `src/client/ui/actionable_notification_map.ts`
**Target physical file**: `src/client/ui/actionable_notification_map.ts` (Tệp mới)

```typescript
// [IMP-134/IMP-297] Actionable Guidance System Unified Map Facade
import { type ActionableNotification, GAMEPLAY_NOTIFICATIONS_MAP } from './actionable_notification_gameplay.js';
import { SYSTEM_NOTIFICATIONS_MAP } from './actionable_notification_system.js';
export { type ActionableNotification } from './actionable_notification_gameplay.js';
export const ACTIONABLE_NOTIFICATIONS_MAP: Record<string, ActionableNotification> = {
  ...GAMEPLAY_NOTIFICATIONS_MAP,
  ...SYSTEM_NOTIFICATIONS_MAP,
};
export const DEFAULT_FALLBACK_NOTIFICATION: ActionableNotification = {
  icon: 'ℹ️', title: 'Hướng Dẫn Trò Chơi',
  description: 'Thao tác tạm thời chưa thể thực hiện. Vui lòng kiểm tra lại tình trạng lượt chơi của bạn!',
  tone: 'info', actionHint: 'Kiểm tra trạng thái lượt chơi trên thanh điều khiển.',
};
```
---
#### Task 4: Tái Cấu Trúc Resolver & Formatter Trong `src/client/ui/actionable_notification.ts`
**Target physical file**: `src/client/ui/actionable_notification.ts`

```typescript
<<<<
export interface ActionableNotification {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  readonly tone: 'info' | 'warning' | 'error' | 'success';
  readonly actionHint?: string;
}

const ACTIONABLE_NOTIFICATIONS_MAP: Record<string, ActionableNotification> = {
  GAME_NOT_STARTED: {
    icon: '⏳',
    title: 'Trận Đấu Chưa Bắt Đầu',
    description: 'Trò chơi đang ở sảnh chờ và chưa chính thức bắt đầu.',
    tone: 'info',
    actionHint: 'Vui lòng chờ chủ phòng khởi động ván đấu.',
  },
  INVALID_PHASE: {
    icon: '⏱️',
    title: 'Chưa Đúng Giai Đoạn Lượt Chơi',
    description: 'Thao tác này không thể thực hiện trong giai đoạn hiện tại.',
    tone: 'warning',
    actionHint: 'Vui lòng chờ đến giai đoạn lượt chơi phù hợp.',
  },
  INSUFFICIENT_FUNDS: {
    icon: '💰',
    title: 'Ngân Sách Không Đủ',
    description: 'Số dư khả dụng không đủ để hoàn tất giao dịch này.',
    tone: 'error',
    actionHint: 'Hãy thế chấp tài sản hoặc hạ cấp công trình để bổ sung vốn.',
  },
  CANNOT_ROLL: {
    icon: '🎲',
    title: 'Chưa Thể Đổ Xúc Xắc',
    description: 'Chưa tới lượt đổ xúc xắc hoặc đang trong bước di chuyển.',
    tone: 'info',
    actionHint: 'Vui lòng chờ đến lượt gieo xúc xắc của bạn.',
  },
  NOT_YOUR_TURN: {
    icon: '⏳',
    title: 'Chưa Tới Lượt Chơi',
    description: 'Hiện tại chưa tới lượt của bạn. Vui lòng chờ đối thủ hoàn thành lượt!',
    tone: 'info',
    actionHint: 'Quan sát diễn biến bàn cờ trong khi chờ đối thủ.',
  },
  MISSING_MONOPOLY: {
    icon: '👑',
    title: 'Chưa Đạt Độc Quyền Bộ Màu',
    description: 'Cần sở hữu trọn bộ màu trước khi nâng cấp công trình!',
    tone: 'warning',
    actionHint: 'Hãy mua hoặc đàm phán các ô đất cùng bộ màu còn lại.',
  },
  EVEN_BUILDING_VIOLATION: {
    icon: '🏗️',
    title: 'Quy Tắc Xây Đều Tay',
    description: 'Quy tắc xây dựng đều tay: Cần nâng cấp các ô cùng bộ màu lên cấp đồng đều!',
    tone: 'warning',
    actionHint: 'Nâng cấp các ô đất có cấp thấp hơn trước.',
  },
  EVEN_DOWNGRADE_VIOLATION: {
    icon: '🔨',
    title: 'Quy Tắc Dỡ Nhà Đều Tay',
    description: 'Quy tắc dỡ nhà đều tay: Cần hạ cấp các công trình trong cùng bộ màu đồng đều!',
    tone: 'warning',
    actionHint: 'Hạ cấp các ô có công trình cấp cao hơn trước.',
  },
  NOT_OWNER: {
    icon: '🚫',
    title: 'Không Phải Chủ Sở Hữu',
    description: 'Bạn không sở hữu bất động sản này để thực hiện thao tác.',
    tone: 'error',
    actionHint: 'Chỉ chủ sở hữu mới có quyền quản lý tài sản này.',
  },
  MAX_LEVEL: {
    icon: '🏢',
    title: 'Công Trình Đạt Cấp Tối Đa',
    description: 'Bất động sản đã đạt cấp độ tối đa, không thể nâng cấp thêm.',
    tone: 'info',
    actionHint: 'Không thể nâng cấp thêm cho ô đất này.',
  },
  HAS_BUILDING: {
    icon: '🏠',
    title: 'Bất Động Sản Đang Có Công Trình',
    description: 'Không thể thế chấp hoặc giao dịch khi vẫn còn công trình xây dựng.',
    tone: 'warning',
    actionHint: 'Hãy hạ cấp dỡ nhà trước khi thế chấp tài sản.',
  },
  NOT_MORTGAGEABLE: {
    icon: '🚫',
    title: 'Ô Đất Không Thể Thế Chấp',
    description: 'Bất động sản này không thuộc danh mục có thể thế chấp cho Ngân hàng.',
    tone: 'error',
    actionHint: 'Hãy chọn bất động sản thông thường khác để thế chấp.',
  },
  PROPERTY_MORTGAGED: {
    icon: '🔒',
    title: 'Bất Động Sản Đang Thế Chấp',
    description: 'Không thể nâng cấp hoặc giao dịch ô đất khi đang bị thế chấp.',
    tone: 'warning',
    actionHint: 'Hãy chuộc lại bất động sản trước khi thực hiện thao tác.',
  },
  NOT_UPGRADEABLE: {
    icon: '🚫',
    title: 'Không Thể Nâng Cấp',
    description: 'Ô đất này không hỗ trợ xây dựng thêm công trình.',
    tone: 'info',
    actionHint: 'Chỉ có thể nâng cấp các ô đất thuộc nhóm màu độc quyền.',
  },
  NEED_2_RAILROADS: {
    icon: '🚆',
    title: 'Chưa Đủ Cơ Sở Hạ Tầng',
    description: 'Cần sở hữu ít nhất 2 cơ sở hạ tầng giao thông (Bến xe / Cảng / Ga).',
    tone: 'warning',
    actionHint: 'Hãy mua thêm hoặc đàm phán đổi lấy cơ sở hạ tầng khác.',
  },
  NOT_UTILITY: {
    icon: '⚡',
    title: 'Không Phải Ô Tiện Ích',
    description: 'Thao tác này chỉ áp dụng cho các ô Tiện Ích công cộng (EVN / Viettel).',
    tone: 'warning',
    actionHint: 'Vui lòng chọn đúng ô tiện ích để thao tác.',
  },
  ALREADY_MORTGAGED: {
    icon: '🔒',
    title: 'Tài Sản Đã Được Thế Chấp',
    description: 'Ô đất này hiện đang ở trạng thái thế chấp.',
    tone: 'info',
    actionHint: 'Chuộc lại thế chấp để khôi phục quyền thu tiền thuê.',
  },
  LIQUIDITY_FROZEN: {
    icon: '🧊',
    title: 'Đóng Băng Thanh Khoản',
    description: 'Bất động sản đang trong chu kỳ đóng băng thanh khoản, không thể thế chấp!',
    tone: 'warning',
    actionHint: 'Chờ chu kỳ đóng băng kết thúc hoặc thế chấp bất động sản thuộc nhóm khác.',
  },
  NOT_MORTGAGED: {
    icon: '🔓',
    title: 'Tài Sản Chưa Thế Chấp',
    description: 'Tài sản này chưa được thế chấp nên không thể chuộc lại.',
    tone: 'info',
    actionHint: 'Chỉ có thể chuộc lại tài sản đang bị thế chấp.',
  },
  GROUP_MORTGAGED: {
    icon: '⚠️',
    title: 'Bộ Màu Có Tài Sản Đang Thế Chấp',
    description: 'Không thể nâng cấp khi có ô cùng bộ màu đang bị thế chấp.',
    tone: 'warning',
    actionHint: 'Hãy giải chấp toàn bộ các ô trong bộ màu trước khi xây dựng.',
  },
  NEED_ALL_UTILITIES: {
    icon: '⚡',
    title: 'Chưa Độc Quyền Tiện Ích',
    description: 'Bắt buộc sở hữu trọn bộ cả 2 Tiện ích (EVN & Viettel) mới có thể nâng cấp Smart Grid hoặc 5G.',
    tone: 'warning',
    actionHint: 'Hãy mua hoặc đàm phán P2P đổi chéo để hoàn thiện bộ đôi tiện ích.',
  },
  AlreadyOwned: {
    icon: '🏷️',
    title: 'Bất Động Sản Đã Có Chủ Sở Hữu',
    description: 'Ô đất này đã có người mua, bạn không thể mua trực tiếp từ Ngân hàng.',
    tone: 'warning',
    actionHint: 'Đề xuất đàm phán với chủ sở hữu để mua lại.',
  },
  NOT_PURCHASABLE: {
    icon: '🚫',
    title: 'Ô Không Thể Mua Bán',
    description: 'Ô này là ô sự kiện hoặc chức năng, không thuộc danh mục mua bán.',
    tone: 'warning',
    actionHint: 'Chỉ có thể mua các ô đất hoặc nhà ga chưa có chủ.',
  },
  DECLINED_PLAYER_CANNOT_BID: {
    icon: '🚫',
    title: 'Không Thể Tham Gia Đấu Giá',
    description: 'Người chơi đã từ chối mua không được phép tham gia đấu giá ô đất này.',
    tone: 'error',
    actionHint: 'Chờ phiên đấu giá giữa các đối thủ kết thúc.',
  },
  PRICE_BELOW_FLOOR: {
    icon: '📉',
    title: 'Giá Đấu Dưới Giá Sàn',
    description: 'Mức giá đấu đưa ra thấp hơn giá sàn quy định của phiên đấu giá.',
    tone: 'warning',
    actionHint: 'Đặt mức giá tối thiểu bằng hoặc cao hơn giá sàn.',
  },
  TRADE_REJECTED: {
    icon: '🤝',
    title: 'Đàm Phán Bị Từ Chối',
    description: 'Đối tác đã từ chối đề xuất đàm phán mua/bán đất!',
    tone: 'info',
    actionHint: 'Điều chỉnh điều kiện trao đổi hấp dẫn hơn và thử lại.',
  },
  FREEZE_ACTIVE: {
    icon: '❄️',
    title: 'Thị Trường Đang Đóng Băng',
    description: 'Hiệu ứng đóng băng thị trường đang hoạt động, tạm dừng mọi giao dịch mua bán và thế chấp.',
    tone: 'warning',
    actionHint: 'Chờ hiệu ứng đóng băng thị trường kết thúc sau các vòng quy định.',
  },
  IN_AUDIT: {
    icon: '⚖️',
    title: 'Đang Trong Trạm Kiểm Toán',
    description: 'Bạn đang bị lưu giữ tại Trạm Kiểm Toán, không thể di chuyển tự do.',
    tone: 'warning',
    actionHint: 'Đổ xí ngầu đôi hoặc nộp tiền bảo lãnh để thoát.',
  },
  NOT_IN_AUDIT: {
    icon: '⚖️',
    title: 'Không Ở Trong Trạm Kiểm Toán',
    description: 'Bạn hiện không bị tạm giữ tại Trạm Kiểm Toán.',
    tone: 'info',
    actionHint: 'Tiếp tục lượt chơi bình thường.',
  },
  SKIPPED_BY_SERVICE_C3: {
    icon: '🌪️',
    title: 'Lượt Chơi Bị Hoãn',
    description: 'Bạn bị hoãn lượt do hiệu ứng bão duyên hải hoặc dịch vụ công C3.',
    tone: 'warning',
    actionHint: 'Nhấn Kết Thúc Lượt để chuyển giao lượt cho người tiếp theo.',
  },
  ROOM_FULL: {
    icon: '🚪',
    title: 'Phòng Đã Đủ Người Chơi',
    description: 'Phòng thi đấu đã đủ 4 người chơi. Vui lòng tạo phòng mới hoặc chờ ván sau!',
    tone: 'warning',
    actionHint: 'Tạo phòng mới để bắt đầu ván đấu cùng bạn bè.',
  },
  ROOM_CODE_COLLISION: {
    icon: '⚠️',
    title: 'Mã Phòng Đã Tồn Tại',
    description: 'Mã phòng này đang được sử dụng. Vui lòng thử lại với mã phòng khác!',
    tone: 'warning',
    actionHint: 'Hệ thống sẽ tự động tạo mã phòng mới.',
  },
  SLOT_CONFLICT: {
    icon: '🪑',
    title: 'Vị Trí Đã Có Người',
    description: 'Vị trí này đã có người chơi hoặc Bot AI tiếp quản.',
    tone: 'warning',
    actionHint: 'Vui lòng chọn vị trí khác trong sảnh chờ.',
  },
  INVALID_ROOM: {
    icon: '🔍',
    title: 'Mã Phòng Không Hợp Lệ',
    description: 'Mã phòng không đúng định dạng quy định.',
    tone: 'error',
    actionHint: 'Kiểm tra lại liên kết mời hoặc mã phòng gồm 6 ký tự.',
  },
  ROOM_NOT_FOUND: {
    icon: '🔍',
    title: 'Không Tìm Thấy Phòng',
    description: 'Không tìm thấy phòng thi đấu. Vui lòng kiểm tra lại mã phòng!',
    tone: 'error',
    actionHint: 'Kiểm tra lại mã phòng hoặc tạo phòng mới.',
  },
  NOT_ENOUGH_PLAYERS: {
    icon: '👥',
    title: 'Chưa Đủ Người Chơi',
    description: 'Chưa đủ người chơi để bắt đầu. Cần tối thiểu 2 người chơi hoặc thêm Bot!',
    tone: 'info',
    actionHint: 'Mời thêm bạn bè hoặc thêm Bot AI vào phòng.',
  },
  NOT_HOST: {
    icon: '👑',
    title: 'Chỉ Chủ Phòng Mới Có Quyền',
    description: 'Chỉ chủ phòng mới có quyền thực hiện thao tác',
    tone: 'info',
    actionHint: 'Chờ chủ phòng bắt đầu trận đấu.',
  },
  ROOM_STARTED: {
    icon: '🎮',
    title: 'Phòng Thi Đấu Đã Bắt Đầu',
    description: 'Phòng này đã bắt đầu trận đấu.',
    tone: 'info',
    actionHint: 'Vui lòng chọn hoặc tạo phòng thi đấu khác.',
  },
  RATE_LIMIT_EXCEEDED: {
    icon: '🛡️',
    title: 'Thao Tác Quá Nhanh',
    description: 'Hệ thống phát hiện thao tác gửi đi quá nhanh. Vui lòng thử lại sau giây lát!',
    tone: 'error',
    actionHint: 'Chờ 1-2 giây trước khi thực hiện thao tác tiếp theo.',
  },
  PLAYER_BANKRUPT: {
    icon: '🪦',
    title: 'Người Chơi Đã Phá Sản',
    description: 'Tài khoản đã phá sản và không thể thực hiện thêm hành động trong trận đấu.',
    tone: 'error',
    actionHint: 'Bạn có thể quan sát tiếp trận đấu hoặc rời phòng.',
  },
  TOKEN_INVALID: {
    icon: '🔑',
    title: 'Phiên Đăng Nhập Hết Hạn',
    description: 'Phiên kết nối đã hết hạn hoặc không hợp lệ. Đang tự động kết nối lại...',
    tone: 'info',
    actionHint: 'Chờ hệ thống tự động làm mới phiên kết nối.',
  },
  BOND_NOT_ELIGIBLE: {
    icon: '📜',
    title: 'Chưa Đủ Điều Kiện Phát Hành Trái Phiếu',
    description: 'Cần tối thiểu 3.000 Net Worth và 2 bất động sản chưa thế chấp để làm tài sản bảo đảm.',
    tone: 'warning',
    actionHint: 'Tích lũy thêm tài sản hoặc giải chấp bớt bất động sản trước khi phát hành trái phiếu.',
  },
  CANNOT_RECOVER: {
    icon: '📉',
    title: 'Không Thể Cân Đối Tài Chính Tự Động',
    description: 'Tổng giá trị tài sản có thể giải tỏa hoặc thế chấp không đủ để bù đắp số dư âm.',
    tone: 'error',
    actionHint: 'Hãy cân nhắc phát hành trái phiếu doanh nghiệp hoặc tuyên bố phá sản.',
  },
  BOND_COLLATERAL_LOCKED: {
    icon: '🔒',
    title: 'Tài Sản Bảo Đảm Trái Phiếu',
    description: 'Bất động sản này đang dùng làm tài sản bảo đảm cho hợp đồng trái phiếu doanh nghiệp!',
    tone: 'warning',
    actionHint: 'Cần tất toán khoản nợ trái phiếu để giải tỏa tài sản bảo đảm.',
  },
  ASSET_LOCKED: {
    icon: '🔒',
    title: 'Tài Sản Đang Trong Giao Dịch',
    description: 'Bất động sản này đang nằm trong đề xuất đàm phán hoặc giao dịch chờ duyệt.',
    tone: 'warning',
    actionHint: 'Vui lòng chờ giao dịch hiện tại hoàn tất hoặc hủy đề xuất.',
  },
  HIGHEST_BIDDER_CANNOT_PASS: {
    icon: '👑',
    title: 'Đang Dẫn Đầu Đấu Giá',
    description: 'Bạn đang là người trả giá cao nhất nên không thể rút lui khỏi phiên đấu giá.',
    tone: 'info',
    actionHint: 'Bạn có thể nhấn "✕ Đóng / Xem Bàn Cờ" để tạm ẩn và theo dõi trận đấu.',
  },
  INTENT_REJECTED: {
    icon: '⚠️',
    title: 'Hành Động Chưa Thể Thực Hiện',
    description: 'Thao tác không phù hợp với giai đoạn lượt chơi hiện tại hoặc tài sản không khả dụng.',
    tone: 'warning',
    actionHint: 'Vui lòng kiểm tra trạng thái lượt chơi hoặc bấm Kết Thúc Lượt.',
  },
  PLAYER_NOT_FOUND: {
    icon: '🔍',
    title: 'Không Tìm Thấy Người Chơi',
    description: 'Người chơi mục tiêu không tồn tại hoặc đã rời trận đấu.',
    tone: 'error',
    actionHint: 'Kiểm tra lại danh sách người chơi trong phòng.',
  },
  INVALID_PLAYER: {
    icon: '👤',
    title: 'Người Chơi Không Hợp Lệ',
    description: 'Đối tượng chỉ định không hợp lệ trong ngữ cảnh này.',
    tone: 'error',
    actionHint: 'Vui lòng chọn lại người chơi hợp lệ trong phòng.',
  },
  UNAUTHORIZED: {
    icon: '🚫',
    title: 'Không Có Quyền Thực Hiện',
    description: 'Bạn không có quyền hạn để thực thi hành động này.',
    tone: 'error',
    actionHint: 'Chỉ người chơi có quyền tương ứng mới có thể thao tác.',
  },
  INVALID_TRADE: {
    icon: '🤝',
    title: 'Đề Xuất Đàm Phán Không Hợp Lệ',
    description: 'Điều kiện trao đổi hoặc danh mục tài sản không hợp lệ.',
    tone: 'warning',
    actionHint: 'Kiểm tra lại tài sản và số tiền trong đề xuất đàm phán.',
  },
  INVALID_PRICE: {
    icon: '📉',
    title: 'Mức Giá Không Hợp Lệ',
    description: 'Mức giá đưa ra không nằm trong khung quy định của phòng chơi.',
    tone: 'warning',
    actionHint: 'Điều chỉnh lại mức giá phù hợp với quy định.',
  },
  TRADE_ALREADY_PENDING: {
    icon: '🤝',
    title: 'Đàm Phán Đang Diễn Ra',
    description: 'Phòng chơi đang có một phiên đàm phán chưa giải quyết giữa các người chơi.',
    tone: 'warning',
    actionHint: 'Vui lòng chờ phiên đàm phán hiện tại kết thúc hoặc phản hồi đề xuất.',
  },
  BOND_ALREADY_ACTIVE: {
    icon: '📜',
    title: 'Đã Có Trái Phiếu Chưa Tất Toán',
    description: 'Người chơi đang có hợp đồng trái phiếu doanh nghiệp đang hoạt động.',
    tone: 'warning',
    actionHint: 'Cần tất toán khoản nợ trái phiếu cũ trước khi phát hành mới.',
  },
  BID_TOO_LOW: {
    icon: '📉',
    title: 'Mức Giá Đấu Quá Thấp',
    description: 'Mức giá đấu đưa ra phải cao hơn giá dẫn đầu hiện tại tối thiểu 50 Tr.',
    tone: 'warning',
    actionHint: 'Tăng mức đặt giá để vượt qua giá dẫn đầu.',
  },
  ALREADY_HIGHEST_BIDDER: {
    icon: '👑',
    title: 'Đang Dẫn Đầu Đấu Giá',
    description: 'Bạn đã là người trả giá cao nhất cho tài sản này.',
    tone: 'info',
    actionHint: 'Chờ các người chơi khác phản hồi hoặc hết thời gian đấu giá.',
  },
  PLAYER_ALREADY_PASSED: {
    icon: '⏹️',
    title: 'Đã Bỏ Qua Đấu Giá',
    description: 'Bạn đã chọn bỏ qua phiên đấu giá này và không thể đặt giá lại.',
    tone: 'info',
    actionHint: 'Theo dõi kết quả phiên đấu giá giữa các người chơi còn lại.',
  },
  AUCTION_EXPIRED: {
    icon: '⌛',
    title: 'Hết Thời Gian Đấu Giá',
    description: 'Phiên đấu giá đã kết thúc thời gian đếm ngược.',
    tone: 'warning',
    actionHint: 'Đang chuyển giao quyền sở hữu tài sản cho người thắng cuộc.',
  },
  OFFER_ALREADY_RESOLVED: {
    icon: '🤝', title: 'Đề Xuất Đã Giải Quyết',
    description: 'Đề xuất giao dịch này đã được phản hồi hoặc đã hoàn tất trước đó.',
    tone: 'warning', actionHint: 'Kiểm tra biến động tài sản trên bàn cờ.',
  },
  BANKRUPT: {
    icon: '🚨', title: 'Đã Tuyên Bố Phá Sản',
    description: 'Bạn đã hoàn tất thanh lý tài sản và rời cuộc chơi.',
    tone: 'info', actionHint: 'Theo dõi ván đấu ở chế độ khán giả.',
  },
};

// Aliases for legacy/alternative casing reason codes (DRY SSOT)
ACTIONABLE_NOTIFICATIONS_MAP['InsufficientFunds'] = ACTIONABLE_NOTIFICATIONS_MAP['INSUFFICIENT_FUNDS']!;
ACTIONABLE_NOTIFICATIONS_MAP['NotPurchasable'] = ACTIONABLE_NOTIFICATIONS_MAP['NOT_PURCHASABLE']!;
ACTIONABLE_NOTIFICATIONS_MAP['TradeFrozen'] = ACTIONABLE_NOTIFICATIONS_MAP['FREEZE_ACTIVE']!;
ACTIONABLE_NOTIFICATIONS_MAP['highest_bidder cannot pass'] = ACTIONABLE_NOTIFICATIONS_MAP['HIGHEST_BIDDER_CANNOT_PASS']!;
ACTIONABLE_NOTIFICATIONS_MAP['highest_bidder_cannot_pass'] = ACTIONABLE_NOTIFICATIONS_MAP['HIGHEST_BIDDER_CANNOT_PASS']!;
ACTIONABLE_NOTIFICATIONS_MAP['HighestBidderCannotPass'] = ACTIONABLE_NOTIFICATIONS_MAP['HIGHEST_BIDDER_CANNOT_PASS']!;
ACTIONABLE_NOTIFICATIONS_MAP['intent_rejected'] = ACTIONABLE_NOTIFICATIONS_MAP['INTENT_REJECTED']!;
ACTIONABLE_NOTIFICATIONS_MAP['IntentRejected'] = ACTIONABLE_NOTIFICATIONS_MAP['INTENT_REJECTED']!;
ACTIONABLE_NOTIFICATIONS_MAP['OUT_OF_TURN'] = ACTIONABLE_NOTIFICATIONS_MAP['NOT_YOUR_TURN']!;
ACTIONABLE_NOTIFICATIONS_MAP['PROPERTY_HAS_BUILDING'] = ACTIONABLE_NOTIFICATIONS_MAP['HAS_BUILDING']!;
ACTIONABLE_NOTIFICATIONS_MAP['ABUSE_DETECTED'] = ACTIONABLE_NOTIFICATIONS_MAP['RATE_LIMIT_EXCEEDED']!;
ACTIONABLE_NOTIFICATIONS_MAP['TOKEN_EXPIRED'] = ACTIONABLE_NOTIFICATIONS_MAP['TOKEN_INVALID']!;
ACTIONABLE_NOTIFICATIONS_MAP['PLAYER_BANKRUPT'] = ACTIONABLE_NOTIFICATIONS_MAP['BANKRUPT']!;
ACTIONABLE_NOTIFICATIONS_MAP['INVALID_INTENT'] = ACTIONABLE_NOTIFICATIONS_MAP['INTENT_REJECTED']!;

const DEFAULT_FALLBACK_NOTIFICATION: ActionableNotification = {
  icon: 'ℹ️',
  title: 'Hướng Dẫn Trò Chơi',
  description: 'Thao tác tạm thời chưa thể thực hiện. Vui lòng kiểm tra lại tình trạng lượt chơi của bạn!',
  tone: 'info',
  actionHint: 'Kiểm tra trạng thái lượt chơi trên thanh điều khiển.',
};
====
// Re-export Facade: Bảo đảm 100% tương thích ngược, zero caller breakage
export {
  type ActionableNotification,
  ACTIONABLE_NOTIFICATIONS_MAP,
  DEFAULT_FALLBACK_NOTIFICATION,
} from './actionable_notification_map.js';

import {
  type ActionableNotification,
  ACTIONABLE_NOTIFICATIONS_MAP,
  DEFAULT_FALLBACK_NOTIFICATION,
} from './actionable_notification_map.js';
>>>>
```
---
### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
* **Trạm 3.0 (Physical Visual Evidence)**: Chạy lệnh `npm run capture:visual -- --ticket IMP-297 --scenario notifications_showcase --dual-viewport` để thu thập ảnh chụp thực tế trên Desktop (1280x800) và Mobile (360x740).
* **Trạm 3.1 (Spec & Scope Gatekeeper)**: Rà soát 100% độ trung thực của Plan, không phát sinh file ngoài phân hệ `client-ui`, bảo đảm Zero Scope Creep.
* **Trạm 3.2 (Architecture & Anti-Slop Auditor)**: Rà soát kiểm tra Anti-Slop, an toàn bộ nhớ/timer, mật độ assertion density trong dải vàng 1-4 asserts/test, không vòng lặp trong it().
---
### Trạm 4: Kiểm Thử Biến Dị & Cơ Chế Biên (Chaos & Mutation Sentinel)
Lệnh kích hoạt kiểm thử đột biến:
```bash
npm run sentinel -- --ticket IMP-297 --test tests/client/actionable_notification_modular.test.ts --src src/client/ui/actionable_notification.ts
```
* **Mục tiêu**: Vượt qua tối thiểu 14 mutants bị tiêu diệt (kill rate: 100%, 0 survived).
* **Đối tượng đột biến**:
  - Đột biến đảo ngược điều kiện fallback `!reasonCode || typeof reasonCode !== 'string'`.
  - Đột biến chuỗi nối `formatServerErrorMessage` (`👉` -> `❌`).
  - Đột biến tra cứu mapping `ACTIONABLE_NOTIFICATIONS_MAP[reasonCode]`.
