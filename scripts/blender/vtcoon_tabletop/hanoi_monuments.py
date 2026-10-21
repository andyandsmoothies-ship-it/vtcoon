# -*- coding: utf-8 -*-
"""KHU DI SẢN HÀ NỘI (BẮC / ĐÔNG): Kỳ Đài Thăng Long trong thành gạch cổ & Khuê Văn Các - Giếng Thiên Quang (Văn Miếu)."""

import math
import random

from mathutils import Vector

from .core import (MeshBatch, add_arched_opening, add_box, add_cylinder, add_cylinder_between, add_frustum,
                   add_oriental_curved_roof, add_ring, add_sphere, add_star, add_tube_along, local_frame)
from .flora import add_flowerbed, add_round_tree, scatter_trees

FLAG_X, FLAG_Y, FLAG_ROT = 1.05, -4.15, 0.0
# Khuê Văn Các & Giếng Thiên Quang (Văn Miếu - Quốc Tử Giám) tại góc Hà Nội (X = 3.95, Y = -2.05)
KHUE_VAN_X, KHUE_VAN_Y, KHUE_VAN_ROT = 4.35, -0.95, 0.0
THIEN_QUANG_X, THIEN_QUANG_Y = 4.35, -2.55


def _rotated_arches(b, T, dist, z, w, h, rot_base) -> None:
    """Cổng vòm thành cổ trên 4 mặt khối vuông: viền đá xám + lòng cửa tối."""
    for face in range(4):
        fr = face * math.pi * 0.5
        ox, oy = math.sin(fr), -math.cos(fr)
        p1 = T(ox * dist, oy * dist, z)
        p2 = T(ox * (dist + 0.006), oy * (dist + 0.006), z - 0.004)
        add_arched_opening(b("flag_stone"), (p1.x, p1.y, p1.z), w + 0.03, 0.02, h + 0.015, rot_base + fr)
        add_arched_opening(b("obsidian_glass"), (p2.x, p2.y, p2.z), w, 0.02, h, rot_base + fr)


def build_flag_tower(b) -> None:
    """
    Kỳ Đài Hà Nội (Cột Cờ) tại [0.9, -2.8, 0] nằm giữa Sân vườn Thành gạch cổ (Historic Brick Bastion Courtyard Garden):
      • Tường thành gạch đỏ bao quanh sân vuông (1.58m x 1.58m) có gờ đá xám, cổng vòm 4 hướng và 4 cây cổ thụ ở 4 góc sân.
      • 3 tầng đế chóp cụt gạch cổ + thân cột bát giác vuốt thon + lá cờ đỏ sao vàng ở đỉnh (Z_max = 1.76m <= 1.80m).
    """
    cx, cy = FLAG_X, FLAG_Y
    T = local_frame(cx, cy, FLAG_ROT)

    # 1. Nền đá sân thành cổ & Tường thành gạch đỏ bao quanh (Historic Brick Bastion Courtyard)
    add_box(b("cut_stone"), T(0.0, 0.0, 0.010), (1.68, 1.68, 0.020), FLAG_ROT)
    add_box(b("granite_paving"), T(0.0, 0.0, 0.018), (1.52, 1.52, 0.014), FLAG_ROT)

    wall_half = 0.76
    wall_thick = 0.065
    wall_h = 0.115
    for face in range(4):
        fr = face * math.pi * 0.5
        ox, oy = math.sin(fr), -math.cos(fr)
        tx, ty = math.cos(fr), math.sin(fr)
        # Hai cánh tường thành hai bên cổng vòm chính giữa
        for side in (-1.0, 1.0):
            seg_c = T(ox * wall_half + tx * (side * 0.45), oy * wall_half + ty * (side * 0.45), 0.020 + wall_h * 0.5)
            add_box(b("flag_brick"), seg_c, (0.62, wall_thick, wall_h), FLAG_ROT + fr)
            cap_c = T(ox * wall_half + tx * (side * 0.45), oy * wall_half + ty * (side * 0.45), 0.020 + wall_h + 0.008)
            add_box(b("flag_stone"), cap_c, (0.64, wall_thick + 0.016, 0.016), FLAG_ROT + fr)
        # Cổng thành vòm ở chính giữa mỗi mặt tường
        gate_c = T(ox * wall_half, oy * wall_half, 0.020 + wall_h * 0.58)
        add_box(b("flag_brick"), gate_c, (0.30, wall_thick + 0.018, wall_h * 1.16), FLAG_ROT + fr)
        add_box(b("flag_stone"), T(ox * wall_half, oy * wall_half, 0.020 + wall_h * 1.16 + 0.010),
                (0.33, wall_thick + 0.030, 0.018), FLAG_ROT + fr)
        arch_c = T(ox * (wall_half + 0.038), oy * (wall_half + 0.038), 0.065)
        add_arched_opening(b("obsidian_glass"), (arch_c.x, arch_c.y, arch_c.z), 0.13, 0.02, 0.095, FLAG_ROT + fr)

    # 4 bồn cỏ & cây xanh cổ thụ ở 4 góc trong sân thành gạch
    for sx in (-0.49, 0.49):
        for sy in (-0.49, 0.49):
            p_tree = T(sx, sy, 0.0)
            add_box(b("foliage_moss"), T(sx, sy, 0.026), (0.28, 0.28, 0.016), FLAG_ROT)
            add_round_tree(b, p_tree.x, p_tree.y, 0.78, moss=True)

    # 2. Ba tầng đế Cột Cờ thu nhỏ dần kèm lan can gạch trổ hoa văn và trụ góc
    tiers = ((0.86, 0.80, 0.020, 0.14), (0.64, 0.59, 0.16, 0.28), (0.42, 0.38, 0.30, 0.41))
    for bot, top, z0, z1 in tiers:
        add_frustum(b("flag_brick"), (cx, cy), z0, z1, (bot * 0.5, bot * 0.5), (top * 0.5, top * 0.5), FLAG_ROT)
        add_box(b("flag_stone"), (cx, cy, z1 + 0.01), (top + 0.04, top + 0.04, 0.02), FLAG_ROT)
        # Lan can thành gạch & trụ góc trên mặt mỗi tầng đế
        hp_t = top * 0.48
        for side_s in (-1.0, 1.0):
            add_box(b("flag_brick"), T(0.0, side_s * hp_t, z1 + 0.028), (top * 0.92, 0.016, 0.018), FLAG_ROT)
            add_box(b("flag_brick"), T(side_s * hp_t, 0.0, z1 + 0.028), (0.016, top * 0.92, 0.018), FLAG_ROT)
            for c_s in (-1.0, 1.0):
                add_box(b("flag_stone"), T(side_s * hp_t, c_s * hp_t, z1 + 0.032), (0.026, 0.026, 0.028), FLAG_ROT)
    _rotated_arches(b, T, 0.418, 0.072, 0.11, 0.105, FLAG_ROT)
    _rotated_arches(b, T, 0.310, 0.220, 0.075, 0.082, FLAG_ROT)
    _rotated_arches(b, T, 0.202, 0.355, 0.048, 0.058, FLAG_ROT)

    # 3. Thân tháp bát giác vuốt thon + gờ chỉ phào + đài quan sát + cột cờ đỏ sao vàng
    z0, z1, r0, r1 = 0.42, 1.08, 0.148, 0.112
    add_cylinder(b("flag_brick"), (cx, cy, (z0 + z1) * 0.5), r0, r1, z1 - z0, 8, FLAG_ROT + math.pi / 8)
    add_cylinder(b("flag_stone"), (cx, cy, z0 + 0.02), 0.170, 0.162, 0.04, 8, FLAG_ROT + math.pi / 8)
    add_cylinder(b("flag_stone"), (cx, cy, 0.64), 0.146, 0.144, 0.018, 8, FLAG_ROT + math.pi / 8)
    add_cylinder(b("flag_stone"), (cx, cy, 0.86), 0.134, 0.132, 0.018, 8, FLAG_ROT + math.pi / 8)
    for k in range(8):
        a = FLAG_ROT + k * (2.0 * math.pi / 8.0) * 1.25
        z = 0.49 + k * 0.068
        r = r0 + (r1 - r0) * (z - z0) / (z1 - z0) + 0.002
        add_box(b("flag_stone"), (cx + r * math.cos(a), cy + r * math.sin(a), z), (0.014, 0.036, 0.050), a)
        add_box(b("obsidian_glass"), (cx + (r + 0.002) * math.cos(a), cy + (r + 0.002) * math.sin(a), z), (0.012, 0.026, 0.040), a)

    add_cylinder(b("flag_stone"), (cx, cy, 1.095), 0.176, 0.170, 0.032, 8, FLAG_ROT + math.pi / 8)
    add_cylinder(b("flag_brick"), (cx, cy, 1.16), 0.124, 0.118, 0.10, 8, FLAG_ROT + math.pi / 8)
    for k in range(8):
        a = FLAG_ROT + k * math.pi / 4.0
        add_box(b("flag_stone"), (cx + 0.120 * math.cos(a), cy + 0.120 * math.sin(a), 1.16),
                (0.014, 0.044, 0.054), a)
        add_box(b("obsidian_glass"), (cx + 0.122 * math.cos(a), cy + 0.122 * math.sin(a), 1.16),
                (0.012, 0.036, 0.046), a)
    add_cylinder(b("flag_stone"), (cx, cy, 1.224), 0.154, 0.140, 0.026, 8, FLAG_ROT + math.pi / 8)
    add_cylinder(b("terracotta_roof"), (cx, cy, 1.252), 0.146, 0.025, 0.032, 8, FLAG_ROT + math.pi / 8)

    add_cylinder(b("silver_steel"), (cx, cy, 1.48), 0.009, 0.006, 0.48, 8)
    add_sphere(b("star_yellow"), (cx, cy, 1.73), (0.014, 0.014, 0.014), subdiv=1)
    ne = Vector((math.cos(math.pi * 0.25), math.sin(math.pi * 0.25), 0.0))
    se = Vector((math.cos(-math.pi * 0.25), math.sin(-math.pi * 0.25), 0.0))
    fc = Vector((cx, cy, 1.62)) + ne * 0.13
    add_box(b("flag_red"), fc, (0.24, 0.006, 0.16), math.pi * 0.25)
    for sgn in (1.0, -1.0):
        sc = fc + se * (0.004 * sgn)
        add_star(b("star_yellow"), (sc.x, sc.y, sc.z), 0.046, 0.018, 0.004,
                 math.pi * 0.25 if sgn > 0 else -0.75 * math.pi)


def build_khue_van_cac(b) -> None:
    """
    Khuê Văn Các & Tiểu cảnh Giếng Thiên Quang (Văn Miếu - Quốc Tử Giám):
      1. Khuôn viên sân lát gạch Bát Tràng đỏ gạch nung (#C2410C), tường bao thấp cổ kính & hồ nước vuông Giếng Thiên Quang
         viền lan can kè đá xám cổ (#64748B) phẳng lặng (#0D9488).
      2. Tầng đế & 4 trụ gạch vuông vức vững chãi nâng đỡ lầu gác + bậc tam cấp lát đá.
      3. Tầng lầu gác bằng gỗ sơn son đỏ trầm (#991B1B): 4 mặt tường gỗ trổ 4 ô cửa sổ tròn lớn "Sao Khuê toả sáng"
         với 8 nan gỗ thanh mảnh toả ra như tia nắng mặt trời + lan can gỗ con tiện bao quanh 4 mặt sàn gác.
      4. Hệ thống 2 tầng mái chồng diêm (8 mái ngói mũi hài #B45309): các góc mái uốn cong thanh thoát (đầu đao cong vút),
         đỉnh nóc đắp dải bờ nóc cổ kính kèm bình lưỡng nghi (Z_max ~ 1.38m trong khoảng 1.2m - 1.5m).
    """
    K = local_frame(KHUE_VAN_X, KHUE_VAN_Y, KHUE_VAN_ROT)
    W = local_frame(THIEN_QUANG_X, THIEN_QUANG_Y, KHUE_VAN_ROT)

    # -------------------------------------------------------------------------
    # A. SÂN GẠCH BÁT TRÀNG & TIỂU CẢNH GIẾNG THIÊN QUANG (HỒ NƯỚC VUÔNG CỔ KÍNH)
    # -------------------------------------------------------------------------
    # Nền sân gạch Bát Tràng thống nhất toàn khuôn viên Văn Miếu (ôm trọn Khuê Văn Các + Giếng Thiên Quang)
    cy_mid = 0.5 * (KHUE_VAN_Y + THIEN_QUANG_Y) - 0.05
    add_box(b("khue_van_mortar"), (KHUE_VAN_X, cy_mid, 0.008), (2.78, 3.24, 0.016), KHUE_VAN_ROT)
    add_box(b("battrang_brick"), (KHUE_VAN_X, cy_mid, 0.016), (2.66, 3.12, 0.014), KHUE_VAN_ROT)
    # Đường đạo trung tâm (Thần đạo) lát đá xanh nối từ cổng qua dưới gầm Khuê Văn Các tới Giếng Thiên Quang
    add_box(b("khue_van_mortar"), K(0.0, 0.0, 0.023), (0.44, 1.32, 0.006), KHUE_VAN_ROT)
    add_box(b("battrang_brick"), K(0.0, 0.0, 0.025), (0.36, 1.28, 0.004), KHUE_VAN_ROT)

    # Giếng Thiên Quang (hồ nước vuông phẳng lặng phía trước Khuê Văn Các, viền bờ kè & lan can đá xám cổ)
    well_w, well_d = 1.68, 1.48
    add_box(b("khue_van_mortar"), W(0.0, 0.0, 0.022), (well_w + 0.24, well_d + 0.24, 0.028), KHUE_VAN_ROT)
    add_box(b("battrang_brick"), W(0.0, 0.0, 0.028), (well_w + 0.12, well_d + 0.12, 0.022), KHUE_VAN_ROT)
    add_box(b("thien_quang_water", smooth=True), W(0.0, 0.0, 0.032), (well_w - 0.06, well_d - 0.06, 0.018), KHUE_VAN_ROT)

    # Bờ kè đá xám & Lan can đá bao quanh 4 mặt Giếng Thiên Quang như ảnh thực tế
    hw_x, hw_y = well_w * 0.5, well_d * 0.5
    for sy in (-1.0, 1.0):
        add_box(b("khue_van_mortar"), W(0.0, sy * hw_y, 0.056), (well_w + 0.06, 0.055, 0.052), KHUE_VAN_ROT)
        add_box(b("porcelain"), W(0.0, sy * hw_y, 0.086), (well_w + 0.09, 0.072, 0.014), KHUE_VAN_ROT)
    for sx in (-1.0, 1.0):
        add_box(b("khue_van_mortar"), W(sx * hw_x, 0.0, 0.056), (0.055, well_d + 0.06, 0.052), KHUE_VAN_ROT)
        add_box(b("porcelain"), W(sx * hw_x, 0.0, 0.086), (0.072, well_d + 0.09, 0.014), KHUE_VAN_ROT)
    # Trụ đá bốn góc & trụ giữa lan can Giếng Thiên Quang (có chóp búp sen đá)
    for px in (-hw_x, 0.0, hw_x):
        for py in (-hw_y, hw_y):
            add_box(b("khue_van_mortar"), W(px, py, 0.068), (0.085, 0.085, 0.082), KHUE_VAN_ROT)
            add_sphere(b("porcelain"), W(px, py, 0.118), (0.042, 0.042, 0.024), subdiv=0)

    # Hai cổng tường gạch nghi môn nhỏ 2 bên cánh Khuê Văn Các (như trong ảnh chụp Văn Miếu)
    for sx in (-1.0, 1.0):
        add_box(b("battrang_brick"), K(sx * 0.88, 0.0, 0.14), (0.72, 0.065, 0.24), KHUE_VAN_ROT)
        add_box(b("khue_van_mortar"), K(sx * 0.88, 0.0, 0.27), (0.76, 0.085, 0.024), KHUE_VAN_ROT)
        add_box(b("khue_van_mortar"), K(sx * 1.16, 0.0, 0.18), (0.22, 0.095, 0.32), KHUE_VAN_ROT)
        add_arched_opening(b("obsidian_glass"), K(sx * 1.16, -0.042, 0.14), 0.11, 0.03, 0.20, KHUE_VAN_ROT, arch_segs=4)

    # -------------------------------------------------------------------------
    # B. TẦNG ĐẾ & 4 TRỤ GẠCH VUÔNG VỨC VỮNG CHÃI (Z = 0.02m -> 0.52m)
    # -------------------------------------------------------------------------
    # Nền đài gạch Bát Tràng & Bậc tam cấp đá xanh 4 phía dẫn lên đài Khuê Văn Các
    add_box(b("khue_van_mortar"), K(0.0, 0.0, 0.042), (1.18, 1.18, 0.048), KHUE_VAN_ROT)
    add_box(b("battrang_brick"), K(0.0, 0.0, 0.072), (1.08, 1.08, 0.024), KHUE_VAN_ROT)
    for step_i, (sw, sd, sz) in enumerate(((0.48, 0.18, 0.024), (0.44, 0.12, 0.042), (0.40, 0.06, 0.060))):
        for sy in (-1.0, 1.0):
            add_box(b("khue_van_mortar"), K(0.0, sy * (0.58 + (2 - step_i) * 0.04), sz), (sw, sd, 0.020), KHUE_VAN_ROT)

    # 4 cột trụ gạch vuông vức trát vữa cổ trắng xám, có chỉ nổi 4 mặt như nguyên mẫu lịch sử
    pillar_off = 0.36
    pillar_z0, pillar_z1 = 0.080, 0.520
    pillar_h = pillar_z1 - pillar_z0
    pillar_zc = 0.5 * (pillar_z0 + pillar_z1)
    for sx in (-1.0, 1.0):
        for sy in (-1.0, 1.0):
            px, py = sx * pillar_off, sy * pillar_off
            # Chân tảng đá xanh
            add_box(b("khue_van_mortar"), K(px, py, pillar_z0 + 0.022), (0.21, 0.21, 0.044), KHUE_VAN_ROT)
            # Thân trụ gạch vuông
            add_box(b("porcelain"), K(px, py, pillar_zc), (0.175, 0.175, pillar_h), KHUE_VAN_ROT)
            # Ô chỉ âm viền xám cổ trên thân trụ
            add_box(b("khue_van_mortar"), K(px, py, pillar_zc), (0.182, 0.105, pillar_h * 0.78), KHUE_VAN_ROT)
            add_box(b("khue_van_mortar"), K(px, py, pillar_zc), (0.105, 0.182, pillar_h * 0.78), KHUE_VAN_ROT)
            # Đầu trụ đấu củng đỡ dầm sàn gỗ
            add_box(b("khue_van_mortar"), K(px, py, pillar_z1 - 0.018), (0.205, 0.205, 0.036), KHUE_VAN_ROT)

    # -------------------------------------------------------------------------
    # C. TẦNG LẦU GÁC BẰNG GỖ SƠN SON & 4 CỬA SỔ TRÒN "SAO KHUÊ TOẢ SÁNG" (Z = 0.52m -> 0.90m)
    # -------------------------------------------------------------------------
    # Hệ dầm sàn gỗ sơn son & sàn hành lang lầu gác
    add_box(b("khue_van_wood"), K(0.0, 0.0, 0.538), (0.98, 0.98, 0.036), KHUE_VAN_ROT)
    add_box(b("dong_son_gold"), K(0.0, 0.0, 0.556), (1.00, 1.00, 0.012), KHUE_VAN_ROT)

    # Lan can gỗ con tiện (wooden balustrade) bao quanh 4 mặt sàn gác
    rail_off = 0.465
    rail_z = 0.595
    for face in range(4):
        fr = face * math.pi * 0.5
        ox, oy = math.sin(fr), -math.cos(fr)
        tx, ty = math.cos(fr), math.sin(fr)
        # Tay vịn trên & dưới của lan can gỗ
        add_box(b("khue_van_wood"), K(ox * rail_off, oy * rail_off, rail_z + 0.032), (0.94, 0.022, 0.016), KHUE_VAN_ROT + fr)
        add_box(b("khue_van_wood"), K(ox * rail_off, oy * rail_off, rail_z - 0.024), (0.94, 0.022, 0.014), KHUE_VAN_ROT + fr)
        # Các thanh con tiện đứng
        for b_idx in range(-3, 4):
            u = b_idx * 0.135
            add_box(b("khue_van_wood"), K(ox * rail_off + tx * u, oy * rail_off + ty * u, rail_z),
                    (0.016, 0.016, 0.068), KHUE_VAN_ROT + fr)

    # Khối thân gác gỗ sơn son đỏ trầm (#991B1B) + 4 cột cái góc gác
    pav_z0, pav_z1 = 0.556, 0.885
    pav_zc = 0.5 * (pav_z0 + pav_z1)
    pav_h = pav_z1 - pav_z0
    add_box(b("khue_van_wood"), K(0.0, 0.0, pav_zc), (0.72, 0.72, pav_h), KHUE_VAN_ROT)
    for sx in (-0.36, 0.36):
        for sy in (-0.36, 0.36):
            add_cylinder(b("khue_van_wood"), K(sx, sy, pav_zc), 0.032, 0.030, pav_h + 0.02, 6)

    # 4 Ô CỬA SỔ TRÒN LỚN "SAO KHUÊ TOẢ SÁNG" Ở 4 MẶT TƯỜNG GỖ + 8 NAN GỖ TOẢ TIA NẮNG MẶT TRỜI
    win_r = 0.132
    win_z = 0.722
    wall_dist = 0.364
    for face in range(4):
        fr = face * math.pi * 0.5
        ox, oy = math.sin(fr), -math.cos(fr)
        tx, ty = math.cos(fr), math.sin(fr)
        out_v = Vector((math.sin(KHUE_VAN_ROT + fr), -math.cos(KHUE_VAN_ROT + fr), 0.0))
        wc = K(ox * wall_dist, oy * wall_dist, win_z)

        # Lòng cửa tròn tối tạo chiều sâu xuyên thấu
        add_cylinder_between(b("obsidian_glass"), wc - out_v * 0.008, wc + out_v * 0.010, win_r * 0.94, segments=12)

        # Vành khuyên tròn gỗ sơn son & viền chỉ vàng ôm quanh cửa sổ Sao Khuê
        ring_pts = [
            K(ox * (wall_dist + 0.014) + tx * (win_r * math.cos(2.0 * math.pi * k / 12)),
              oy * (wall_dist + 0.014) + ty * (win_r * math.cos(2.0 * math.pi * k / 12)),
              win_z + win_r * math.sin(2.0 * math.pi * k / 12))
            for k in range(12)
        ]
        add_tube_along(b("dong_son_gold"), ring_pts, 0.014, segments=4, closed=True)

        # 8 nan gỗ thanh mảnh toả ra từ vành cửa tròn như tia sáng Sao Khuê
        for ray_k in range(8):
            ang_r = ray_k * math.pi * 0.25
            r_in_ray = win_r * 0.96
            r_out_ray = win_r * 1.42
            p_r0 = K(ox * (wall_dist + 0.012) + tx * (r_in_ray * math.cos(ang_r)),
                     oy * (wall_dist + 0.012) + ty * (r_in_ray * math.cos(ang_r)),
                     win_z + r_in_ray * math.sin(ang_r))
            p_r1 = K(ox * (wall_dist + 0.012) + tx * (r_out_ray * math.cos(ang_r)),
                     oy * (wall_dist + 0.012) + ty * (r_out_ray * math.cos(ang_r)),
                     win_z + r_out_ray * math.sin(ang_r))
            add_cylinder_between(b("dong_son_gold"), p_r0, p_r1, 0.006, segments=4)
        # 4 nan gỗ xuyên tâm bên trong lòng cửa tròn
        for diag_k in range(4):
            ang_d = diag_k * math.pi * 0.25
            p_d0 = K(ox * (wall_dist + 0.011) - tx * (win_r * 0.90 * math.cos(ang_d)),
                     oy * (wall_dist + 0.011) - ty * (win_r * 0.90 * math.cos(ang_d)),
                     win_z - win_r * 0.90 * math.sin(ang_d))
            p_d1 = K(ox * (wall_dist + 0.011) + tx * (win_r * 0.90 * math.cos(ang_d)),
                     oy * (wall_dist + 0.011) + ty * (win_r * 0.90 * math.cos(ang_d)),
                     win_z + win_r * 0.90 * math.sin(ang_d))
            add_cylinder_between(b("khue_van_wood"), p_d0, p_d1, 0.005, segments=4)

        # Hoành phi sơn son thếp vàng phía trên mỗi cửa tròn
        add_box(b("dong_son_gold"), K(ox * (wall_dist + 0.012), oy * (wall_dist + 0.012), win_z + 0.145),
                (0.22, 0.014, 0.036), KHUE_VAN_ROT + fr)

    # -------------------------------------------------------------------------
    # D. HỆ THỐNG 2 TẦNG MÁI CHỒNG DIÊM (8 MÁI NGÓI MŨI HÀI ĐẤT NUNG #B45309)
    #    Đỉnh nóc Z ~ 1.38m (nằm gọn trong khoảng chuẩn 1.2m - 1.5m)
    # -------------------------------------------------------------------------
    xy_kv = (KHUE_VAN_X, KHUE_VAN_Y)

    def _curved_tiered_roof(z_base: float, width: float, height: float, upturn: float) -> None:
        add_oriental_curved_roof(b("khue_van_roof"), xy_kv, z_base, width, width, height,
                                 corner_upturn=upturn, rot_z=KHUE_VAN_ROT, per_side=3)
        half_w = width * 0.50
        for sx in (-1.0, 1.0):
            for sy in (-1.0, 1.0):
                p_top = K(sx * half_w * 0.36, sy * half_w * 0.36, z_base + height * 0.88)
                p_eave = K(sx * half_w * 1.04, sy * half_w * 1.04, z_base + upturn * 0.85)
                p_tip = K(sx * half_w * 1.13, sy * half_w * 1.13, z_base + upturn * 1.32)
                # Sống đao và đầu đao cong vút 4 góc mái
                add_tube_along(b("khue_van_mortar"), [p_top, p_eave, p_tip], 0.011, segments=4)

    # Tầng mái dưới (Lower 4-hipped roof tier)
    _curved_tiered_roof(z_base=0.875, width=1.34, height=0.145, upturn=0.085)

    # Cổ diêm giữa 2 tầng mái (sơn son thếp vàng)
    add_box(b("khue_van_wood"), K(0.0, 0.0, 1.035), (0.62, 0.62, 0.095), KHUE_VAN_ROT)
    add_box(b("dong_son_gold"), K(0.0, 0.0, 1.045), (0.64, 0.64, 0.022), KHUE_VAN_ROT)

    # Tầng mái trên (Upper 4-hipped roof tier)
    _curved_tiered_roof(z_base=1.075, width=1.12, height=0.185, upturn=0.095)

    # Đỉnh nóc đắp dải bờ nóc cổ kính tinh tế + 2 đầu kìm + Bầu rượu / Mặt trời lửa ở chính giữa (Z_max ~ 1.38m)
    add_box(b("khue_van_mortar"), K(0.0, 0.0, 1.272), (0.46, 0.042, 0.044), KHUE_VAN_ROT)
    add_box(b("dong_son_gold"), K(0.0, 0.0, 1.298), (0.48, 0.032, 0.016), KHUE_VAN_ROT)
    for sx in (-0.23, 0.23):
        add_box(b("khue_van_mortar"), K(sx, 0.0, 1.318), (0.042, 0.042, 0.056), KHUE_VAN_ROT)
    add_cylinder(b("dong_son_gold"), K(0.0, 0.0, 1.328), 0.032, 0.018, 0.045, 6)
    add_sphere(b("dong_son_gold"), K(0.0, 0.0, 1.368), (0.026, 0.026, 0.032), subdiv=0)


def build_hanoi_civic_quarter(coll, mats, clearance) -> None:
    b_flag = MeshBatch("GEO_HN_Civic_Flag", mats, coll)
    build_flag_tower(b_flag)

    b_khue_van = MeshBatch("GEO_HN_KhueVanCac", mats, coll)
    build_khue_van_cac(b_khue_van)

    clearance.add_circle(FLAG_X, FLAG_Y, 1.18)
    clearance.add_circle(KHUE_VAN_X, KHUE_VAN_Y, 1.35)
    clearance.add_circle(THIEN_QUANG_X, THIEN_QUANG_Y, 1.35)

    # 6 cây cổ thụ rợp bóng mát trực tiếp quanh Khuê Văn Các & Giếng Thiên Quang (như ảnh thực tế Văn Miếu)
    for tx, ty, sc in (
        (KHUE_VAN_X - 1.05, KHUE_VAN_Y + 0.35, 1.22),
        (KHUE_VAN_X + 1.05, KHUE_VAN_Y + 0.35, 1.22),
        (KHUE_VAN_X - 0.65, KHUE_VAN_Y + 0.52, 1.15),
        (KHUE_VAN_X + 0.65, KHUE_VAN_Y + 0.52, 1.15),
        (THIEN_QUANG_X - 1.12, THIEN_QUANG_Y, 1.12),
        (THIEN_QUANG_X + 1.12, THIEN_QUANG_Y, 1.12),
    ):
        add_round_tree(b_khue_van, tx, ty, sc, moss=True)
        clearance.add_circle(tx, ty, 0.16)
    b_khue_van.commit()

    # Các cây xanh & bồn hoa cảnh quan chung của khu vực Hà Nội gộp vào batch cảnh quan Kỳ Đài
    rng = random.Random(1945)
    for fx, fy in ((1.55, 0.85), (-0.85, 2.45)):
        if clearance.is_free(fx, fy, 0.05):
            add_flowerbed(b_flag, fx, fy, 0.13, rng)
            clearance.add_circle(fx, fy, 0.18)

    for tx, ty, sc in (
        (-0.25, -3.65, 0.98), (0.05, -5.25, 0.95), (2.15, -4.45, 1.00),
        (2.15, -3.25, 0.95), (5.55, 0.85, 0.95),
        (0.65, 1.35, 0.95), (-0.65, 1.55, 1.00), (-0.75, 2.65, 0.95),
    ):
        if clearance.is_free(tx, ty, 0.04):
            add_round_tree(b_flag, tx, ty, sc, moss=(tx + ty > 0.0))
            clearance.add_circle(tx, ty, 0.16)

    scatter_trees(b_flag, clearance, (-0.50, 5.80, -5.50, 5.80), 0.88, 3010, "hanoi", 10)
    b_flag.commit()
