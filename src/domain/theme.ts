// Design Tokens — Bảng màu ngữ nghĩa theo design.md (Văn hoá Việt Nam)
// Nguồn: docs/domain/design.md — Hệ thống màu 8 sắc bản địa

/** Màu bề mặt ô bàn cờ (nền tối trung tính) */
export const BOARD_SURFACE = '#2a2a3e' as const;

/**
 * Bảng màu quân cờ người chơi — 6 sắc văn hóa Việt Nam.
 * Thứ tự: Đỏ Đô, Xanh Da Trời, Xanh Lục Bảo, Cam Nắng, Tím Hoàng Gia, Vàng Ánh Kim
 */
export const PLAYER_TOKEN_PALETTE = [
  '#c0392b', // Đỏ Đô (Crimson Red)      — Cạnh 3: Thanh Hóa, Nghệ An, Ninh Bình
  '#2980b9', // Xanh Da Trời (Sky Blue)  — Cạnh 1: Bình Dương, Đồng Nai, Vũng Tàu
  '#27ae60', // Xanh Lục Bảo (Emerald)   — Cạnh 4: Hưng Yên, Hà Nội, Hoàn Kiếm
  '#e67e22', // Cam Nắng (Warm Orange)   — Cạnh 2: Bình Định, Huế, Đà Nẵng
  '#8e44ad', // Tím Hoàng Gia (Royal Purple)— Cạnh 4: TP.Thủ Đức, Q.Nguyễn Huệ
  '#f1c40f', // Vàng Ánh Kim (Golden)    — Cạnh 3: Hải Phòng, Phú Quốc, Hạ Long
] as const;
