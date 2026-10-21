# -*- coding: utf-8 -*-
"""KHU BỜ SÔNG TP. HỒ CHÍ MINH (TÂY / NAM): Tháp Tài chính Bitexco [-2.4, -0.6] & Nhà thờ Đức Bà [-1.8, 1.4]."""

import math

from mathutils import Vector

from .core import (add_arched_opening, add_box, add_cylinder, add_cylinder_between, add_pitched_roof,
                   add_ring, add_tube_along, local_frame)

BX, BY = -3.75, -1.75
ND_X, ND_Y, ND_ROT = -2.85, 1.45, 0.0
# Peak height strictly <= 3.15m (TOWER_Z1 + CROWN_RISE = 2.91 + 0.21 = 3.12m <= 3.15m)
TOWER_Z0, TOWER_Z1, CROWN_RISE = 0.24, 2.91, 0.21
HELIPAD_Z = 2.30


def _lotus_point(s: float, th: float, off: float = 0.0) -> Vector:
    """Mặt cắt elip thuôn dài (tapering oval floorplate) của Bitexco: phình nhẹ thân dưới, vuốt thon & vát chéo ở đỉnh."""
    rot = math.radians(-15.0)
    bulge = 1.0 + 0.13 * math.sin(s * math.pi * 0.82) - 0.42 * (s ** 1.42)
    rx, ry = 0.42 * bulge + off, 0.26 * bulge + off
    lx = rx * math.cos(th) + 0.055 * math.sin(s * math.pi * 0.90)
    ly = ry * math.sin(th)
    crown = max(0.0, (s - 0.68) / 0.32) ** 1.35 * CROWN_RISE * (0.85 * math.cos(th - 0.4) + 0.15)
    return Vector((BX + lx * math.cos(rot) - ly * math.sin(rot), BY + lx * math.sin(rot) + ly * math.cos(rot),
                   TOWER_Z0 + s * (TOWER_Z1 - TOWER_Z0) + crown))


def build_bitexco(b) -> None:
    """
    Bitexco Financial Tower tại [-2.4, -0.6, 0]:
      • Khối đế thương mại 6 tầng giật cấp elip hướng ra bờ sông Sài Gòn kèm vườn trên mái.
      • Mặt dựng kính cong (curtain wall) với rãnh ghép kính âm (recessed glass curtain wall seams) và gân đứng.
      • Sàn đáp trực thăng tròn vươn công-xôn tại tầng 52 nhìn thẳng ra mặt nước sông Sài Gòn.
    """
    # 1. Khối đế Podium thương mại giật cấp + mái kính Icon68 + thềm sân vườn hướng ra bờ sông Sài Gòn
    add_cylinder(b("cut_stone"), (BX, BY, 0.016), 0.78, 0.74, 0.024, 18)
    add_cylinder(b("granite_paving"), (BX - 0.14, BY - 0.08, 0.032), 0.70, 0.66, 0.020, 18)
    for i, (r, h, z) in enumerate(((0.59, 0.075, 0.058), (0.51, 0.075, 0.130), (0.43, 0.075, 0.202))):
        cx_p, cy_p = BX - 0.06 * (2 - i), BY - 0.04 * (2 - i)
        add_cylinder(b("bitexco_glass", smooth=True), (cx_p, cy_p, z), r, r * 0.96, h, 18)
        add_ring(b("silver_steel"), (cx_p, cy_p), r + 0.012, r - 0.015, z + h * 0.42, z + h * 0.56, 18)
    add_cylinder(b("foliage_moss"), (BX - 0.18, BY - 0.10, 0.102), 0.42, 0.40, 0.014, 14)
    # Vòm kính sảnh đón (curved glass entrance canopy) phía mặt sông
    add_box(b("silver_steel"), (BX - 0.48, BY - 0.28, 0.095), (0.28, 0.34, 0.010), math.radians(-25.0))
    add_box(b("bitexco_glass"), (BX - 0.48, BY - 0.28, 0.102), (0.25, 0.30, 0.008), math.radians(-25.0))

    # 2. Thân tháp mặt cắt Oval vuốt thon kèm Rãnh ghép kính âm (Recessed Curtain Wall Seams) & Lõi thang máy trong suốt
    core_bm = b("dark_granite")
    for s_c in (0.20, 0.42, 0.64, 0.84):
        c_pt = _lotus_point(s_c, 0.0, -0.08)
        add_cylinder(core_bm, (BX, BY, c_pt.z), 0.16 * (1.0 - 0.28 * s_c), 0.16 * (1.0 - 0.28 * s_c), 0.018, 8)

    rings_n, segs = 20, 20
    glass = b("bitexco_glass", smooth=True)
    mullion = b("bitexco_mullion")

    ring_specs = []
    for ri in range(rings_n + 1):
        s = ri / rings_n
        ring_specs.append((s, 0.0, False))
        if 0 < ri < rings_n and ri % 4 == 0:
            ds = 0.0055
            ring_specs.append((min(1.0, s + ds), -0.010, True))
            ring_specs.append((min(1.0, s + 2.0 * ds), 0.0, False))
    ring_specs.sort(key=lambda item: item[0])

    rings = []
    for s, off, _ in ring_specs:
        ring = []
        for k in range(segs):
            th = 2.0 * math.pi * k / segs
            v_recess = -0.0055 if (k % 2 == 0) else 0.0
            ring.append(glass.verts.new(_lotus_point(s, th, off + v_recess)))
        rings.append(ring)

    for (s0, _, is_seam0), (s1, _, is_seam1), r0, r1 in zip(ring_specs, ring_specs[1:], rings, rings[1:]):
        target_bm = mullion if (is_seam0 or is_seam1) else glass
        for k in range(segs):
            kn = (k + 1) % segs
            if target_bm is glass:
                glass.faces.new((r0[k], r0[kn], r1[kn], r1[k]))
            else:
                v00 = mullion.verts.new(r0[k].co)
                v01 = mullion.verts.new(r0[kn].co)
                v11 = mullion.verts.new(r1[kn].co)
                v10 = mullion.verts.new(r1[k].co)
                mullion.faces.new((v00, v01, v11, v10))

    glass.faces.new(list(reversed(rings[0])))
    glass.faces.new(rings[-1])

    # 3. 12 thanh đố đứng chịu lực (structural vertical mullions), đai ngang & vành vương miện đỉnh tháp + đèn báo không
    steel = b("silver_steel")
    for k in range(12):
        th = 2.0 * math.pi * k / 12
        add_tube_along(steel, [_lotus_point(ri / 8, th, 0.006) for ri in range(9)], 0.007, 4)
    for s_band in (0.32, 0.64, 0.90):
        band_pts = [_lotus_point(s_band, 2.0 * math.pi * k / 16, 0.007) for k in range(16)]
        add_tube_along(steel, band_pts, 0.0065, 4, closed=True)
    crown_pts = [_lotus_point(1.0, 2.0 * math.pi * k / 20, 0.008) for k in range(20)]
    add_tube_along(steel, crown_pts, 0.012, 4, closed=True)
    apex_pt = max(crown_pts, key=lambda p: p.z)
    add_cylinder(b("lamp_glow"), (apex_pt.x, apex_pt.y, min(3.138, apex_pt.z + 0.006)), 0.016, 0.010, 0.012, 6)

    # 4. Sàn đáp trực thăng Cantilever tròn ở tầng 52 (HELIPAD_Z = 2.30m, vươn hướng Tây Nam nhìn thẳng ra sông Sài Gòn)
    s_h = (HELIPAD_Z - TOWER_Z0) / (TOWER_Z1 - TOWER_Z0)
    hp = Vector((-0.82, -0.57, 0.0)).normalized()
    perp = Vector((-hp.y, hp.x, 0.0))
    axis = Vector((BX, BY, 0.0))
    reach = max(((_lotus_point(s_h, 2.0 * math.pi * k / 72) - axis).to_2d().dot(hp.to_2d()) for k in range(72)))
    pad = axis + hp * (reach + 0.24)
    pad.z = HELIPAD_Z
    yaw = math.atan2(hp.y, hp.x)

    beam_c = axis + hp * (reach * 0.5 + 0.11)
    for dz, size in ((-0.026, (reach + 0.12, 0.14, 0.010)), (-0.046, (reach + 0.10, 0.026, 0.034)),
                     (-0.066, (reach + 0.08, 0.12, 0.010))):
        add_box(steel, (beam_c.x, beam_c.y, HELIPAD_Z + dz), size, yaw)
    for lat in (-0.11, -0.038, 0.038, 0.11):
        p_tower = axis + hp * (reach - 0.05) + perp * (lat * 0.65)
        p_pad = pad + hp * 0.12 + perp * lat
        add_cylinder_between(steel, (p_tower.x, p_tower.y, HELIPAD_Z - 0.30), (p_pad.x, p_pad.y, HELIPAD_Z - 0.024),
                             0.011, segments=5)
        # Thanh giằng chéo chữ K (diagrid cross-bracing) dưới bụng công-xôn trực thăng
        p_mid = 0.5 * (Vector((p_tower.x, p_tower.y, HELIPAD_Z - 0.16)) + Vector((p_pad.x, p_pad.y, HELIPAD_Z - 0.024)))
        add_cylinder_between(steel, (p_tower.x, p_tower.y, HELIPAD_Z - 0.04), p_mid, 0.0065, segments=4)

    add_cylinder(steel, (pad.x, pad.y, HELIPAD_Z - 0.014), 0.255, 0.190, 0.028, 24)
    add_cylinder(steel, (pad.x, pad.y, HELIPAD_Z + 0.005), 0.262, 0.255, 0.012, 24)
    # Lưới bảo hiểm an toàn (perimeter safety net ring) + đèn dẫn đường viền sân đáp
    add_ring(steel, (pad.x, pad.y), 0.292, 0.266, HELIPAD_Z + 0.008, HELIPAD_Z + 0.015, 24)
    for k in range(12):
        ang = 2.0 * math.pi * k / 12
        lx_p, ly_p = pad.x + 0.278 * math.cos(ang), pad.y + 0.278 * math.sin(ang)
        add_cylinder(b("lamp_glow"), (lx_p, ly_p, HELIPAD_Z + 0.018), 0.007, 0.005, 0.006, 6)
    add_cylinder(b("dark_granite"), (pad.x, pad.y, HELIPAD_Z + 0.014), 0.246, 0.246, 0.008, 24)

    yel = b("helipad_yellow")
    add_ring(yel, (pad.x, pad.y), 0.205, 0.185, HELIPAD_Z + 0.016, HELIPAD_Z + 0.022, 24)
    for lat in (-0.055, 0.055):
        c = pad + perp * lat
        add_box(yel, (c.x, c.y, HELIPAD_Z + 0.020), (0.145, 0.024, 0.005), yaw)
    add_box(yel, (pad.x, pad.y, HELIPAD_Z + 0.020), (0.024, 0.11, 0.005), yaw)


def build_notre_dame(b) -> None:
    """
    Nhà thờ Đức Bà Sài Gòn tại [-1.8, 1.4, 0] (đặt lùi phía sau Bitexco giữa Công viên 30/4 xanh mát):
      • Tông gạch trần Marseille đỏ cam đất nung (#B45309) kết hợp chỉ đá vôi trắng kem.
      • Tỷ lệ S = 1.04 đảm bảo đỉnh thánh giá Z = 1.72m <= 1.80m theo đúng chuẩn kỹ thuật.
      • Hai tháp chuông đối xứng với hệ cửa vòm lá sách thực tế, trán tường tam giác & cửa sổ Hoa Hồng.
    """
    S = 1.04
    T = local_frame(ND_X, ND_Y, ND_ROT)

    def P(lx, ly, lz):
        return T(lx * S, ly * S, lz * S)

    def box(key, lx, ly, lz, sx, sy, sz):
        add_box(b(key), P(lx, ly, lz), (sx * S, sy * S, sz * S), ND_ROT)

    def arch(key, lx, ly, lz, w, d, h, face=0.0):
        add_arched_opening(b(key), tuple(P(lx, ly, lz)), w * S, d * S, h * S, ND_ROT + face, arch_segs=4)

    # 1. Chân tường đá xanh cắt gọn đặt trên thềm Công viên 30/4
    box("cut_stone", 0.0, 0.08, 0.024, 0.84, 0.86, 0.032)
    box("cut_stone", 0.0, -0.40, 0.024, 0.86, 0.30, 0.032)

    # 2. Thân chính Cruciform: Chính đường (Nave), Hồi lang 2 bên (Side Aisles), Cánh thánh giá (Transept) & Hậu cung (Apse)
    box("notre_dame_brick", 0.0, 0.08, 0.34, 0.48, 0.90, 0.56)
    box("notre_dame_brick", 0.0, 0.08, 0.21, 0.80, 0.82, 0.30)
    box("notre_dame_brick", 0.0, 0.24, 0.31, 0.92, 0.28, 0.50)
    # Chỉ phào đá trắng chân mái (limestone stringcourses) chạy dọc thân chính & cánh ngang
    box("porcelain", 0.0, 0.08, 0.612, 0.50, 0.91, 0.016)
    box("porcelain", 0.0, 0.08, 0.354, 0.82, 0.83, 0.014)
    box("porcelain", 0.0, 0.24, 0.554, 0.94, 0.30, 0.016)

    add_pitched_roof(b("terracotta_roof"), P(0.0, 0.08, 0)[:2], 0.62 * S, 0.52 * S, 0.92 * S, 0.22 * S, ND_ROT, 0.0)
    add_pitched_roof(b("terracotta_roof"), P(0.0, 0.24, 0)[:2], 0.56 * S, 0.96 * S, 0.32 * S, 0.16 * S, ND_ROT, 0.0)
    # Gờ bờ nóc đá trắng trên đỉnh mái ngói chính đường & cánh thánh giá
    box("porcelain", 0.0, 0.08, 0.842, 0.022, 0.90, 0.016)
    box("porcelain", 0.0, 0.24, 0.722, 0.94, 0.022, 0.016)
    for sx in (-0.32, 0.32):
        add_pitched_roof(b("terracotta_roof"), P(sx, 0.08, 0)[:2], 0.36 * S, 0.18 * S, 0.82 * S, 0.08 * S, ND_ROT, 0.08)

    # Khối Narthex trung tâm mặt tiền + Trán tường tam giác (Triangular Front Pediment) có gờ đá trắng
    box("notre_dame_brick", 0.0, -0.36, 0.34, 0.34, 0.14, 0.56)
    box("porcelain", 0.0, -0.36, 0.625, 0.36, 0.16, 0.022)
    add_pitched_roof(b("porcelain"), P(0.0, -0.37, 0)[:2], 0.635 * S, 0.37 * S, 0.15 * S, 0.155 * S, ND_ROT, 0.0)
    add_pitched_roof(b("notre_dame_brick"), P(0.0, -0.376, 0)[:2], 0.632 * S, 0.33 * S, 0.14 * S, 0.135 * S, ND_ROT, 0.0)
    c_clock = P(0.0, -0.445, 0.69)
    face_vec = Vector((math.sin(ND_ROT), -math.cos(ND_ROT), 0.0))
    add_cylinder_between(b("porcelain"), c_clock, c_clock + face_vec * (0.015 * S), 0.042 * S, segments=12)
    add_cylinder_between(b("obsidian_glass"), c_clock + face_vec * (0.008 * S), c_clock + face_vec * (0.019 * S), 0.030 * S, segments=12)
    # Kim đồng hồ vàng cổ điển trên trán tường mặt tiền
    add_box(b("dong_son_gold"), P(0.0, -0.466, 0.700), (0.005 * S, 0.006 * S, 0.022 * S), ND_ROT)
    add_box(b("dong_son_gold"), P(0.008, -0.466, 0.690), (0.018 * S, 0.006 * S, 0.005 * S), ND_ROT)

    # Hậu cung bán nguyệt (Semcircular Apse) kèm các trụ tường chịu lực (Apse Buttresses)
    add_cylinder(b("notre_dame_brick"), P(0.0, 0.56, 0.25), 0.23 * S, 0.22 * S, 0.38 * S, 10)
    add_cylinder(b("porcelain"), P(0.0, 0.56, 0.445), 0.24 * S, 0.24 * S, 0.016 * S, 10)
    add_cylinder(b("terracotta_roof"), P(0.0, 0.56, 0.52), 0.25 * S, 0.02 * S, 0.15 * S, 10)
    for k_ap in (-2, -1, 0, 1, 2):
        ang_ap = k_ap * 0.48
        add_box(b("notre_dame_brick"), P(0.23 * math.sin(ang_ap), 0.56 + 0.23 * math.cos(ang_ap), 0.22),
                (0.028 * S, 0.042 * S, 0.34 * S), ND_ROT - ang_ap)
    add_cylinder(b("porcelain"), P(0.0, 0.20, 0.86), 0.042 * S, 0.036 * S, 0.09 * S, 6)
    add_cylinder(b("zinc_spire"), P(0.0, 0.20, 0.98), 0.040 * S, 0.004 * S, 0.16 * S, 6)

    for wy in (-0.24, -0.06, 0.12, 0.40):
        for side in (-1.0, 1.0):
            if abs(wy - 0.12) > 0.05:
                arch("porcelain", side * 0.242, wy, 0.49, 0.078, 0.02, 0.135, side * math.pi * 0.5)
                arch("obsidian_glass", side * 0.248, wy, 0.488, 0.060, 0.02, 0.115, side * math.pi * 0.5)
                arch("porcelain", side * 0.402, wy, 0.21, 0.088, 0.02, 0.155, side * math.pi * 0.5)
                arch("obsidian_glass", side * 0.408, wy, 0.208, 0.070, 0.02, 0.135, side * math.pi * 0.5)
                # Trụ tường chịu lực (Romanesque Wall Buttress) & nhịp cuốn bay (Flying Buttress Strut) nối lên tường Clerestory
                box("notre_dame_brick", side * 0.415, wy + 0.075, 0.20, 0.038, 0.034, 0.29)
                box("porcelain", side * 0.415, wy + 0.075, 0.352, 0.044, 0.040, 0.018)
                p_b0 = P(side * 0.405, wy + 0.075, 0.345)
                p_b1 = P(side * 0.245, wy + 0.075, 0.545)
                add_cylinder_between(b("notre_dame_brick"), p_b0, p_b1, 0.012 * S, segments=4)
    for side in (-1.0, 1.0):
        arch("porcelain", side * 0.462, 0.24, 0.30, 0.115, 0.02, 0.22, side * math.pi * 0.5)
        arch("obsidian_glass", side * 0.468, 0.24, 0.295, 0.090, 0.02, 0.19, side * math.pi * 0.5)

    # 3. Hai tháp chuông Romanesque 4 tầng giật cấp + Cửa vòm lá sách đôi
    for tx in (-0.28, 0.28):
        tiers = (
            (0.04, 0.28, 0.275),
            (0.28, 0.50, 0.260),
            (0.50, 0.72, 0.245),
            (0.72, 0.94, 0.230),
        )
        for z0, z1, w in tiers:
            box("notre_dame_brick", tx, -0.40, (z0 + z1) * 0.5, w, w, z1 - z0)
            box("porcelain", tx, -0.40, z1, w + 0.026, w + 0.026, 0.022)
            for cx_s in (-1.0, 1.0):
                for cy_s in (-1.0, 1.0):
                    box("notre_dame_brick", tx + cx_s * (w * 0.46), -0.40 + cy_s * (w * 0.46),
                        (z0 + z1) * 0.5, 0.032, 0.032, z1 - z0 - 0.01)

        for face_idx in range(4):
            fr = face_idx * math.pi * 0.5
            ox, oy = math.sin(fr), -math.cos(fr)
            tx_Dir, ty_Dir = math.cos(fr), math.sin(fr)

            for z_win, w_tier in ((0.39, 0.260), (0.61, 0.245)):
                dist = w_tier * 0.502
                arch("porcelain", tx + ox * dist, -0.40 + oy * dist, z_win, 0.072, 0.018, 0.14, fr)
                arch("obsidian_glass", tx + ox * (dist + 0.005), -0.40 + oy * (dist + 0.005), z_win - 0.003,
                     0.052, 0.018, 0.12, fr)

            dist4 = 0.230 * 0.502
            for lat_off in (-0.044, 0.044):
                wx = tx + ox * dist4 + tx_Dir * lat_off
                wy = -0.40 + oy * dist4 + ty_Dir * lat_off
                arch("porcelain", wx, wy, 0.825, 0.064, 0.018, 0.155, fr)
                arch("obsidian_glass", wx + ox * 0.005, wy + oy * 0.005, 0.822, 0.048, 0.018, 0.138, fr)
                for lk in range(3):
                    lz = 0.780 + lk * 0.032
                    l_pos = P(wx + ox * 0.009, wy + oy * 0.009, lz)
                    add_box(b("porcelain"), l_pos, (0.044 * S, 0.010 * S, 0.006 * S), ND_ROT + fr)

        for px in (-0.095, 0.095):
            for py in (-0.095, 0.095):
                box("porcelain", tx + px, -0.40 + py, 0.98, 0.034, 0.034, 0.065)
                add_cylinder(b("zinc_spire"), P(tx + px, -0.40 + py, 1.045), 0.022 * S, 0.003 * S, 0.075 * S, 4,
                             ND_ROT + math.pi * 0.25)
        add_cylinder(b("notre_dame_brick"), P(tx, -0.40, 0.985), 0.098 * S, 0.090 * S, 0.075 * S, 8, ND_ROT + math.pi / 8)
        add_cylinder(b("zinc_spire"), P(tx, -0.40, 1.29), 0.095 * S, 0.006 * S, 0.54 * S, 8, ND_ROT + math.pi / 8)
        box("dong_son_gold", tx, -0.40, 1.60, 0.014, 0.014, 0.095)
        box("dong_son_gold", tx, -0.40, 1.615, 0.055, 0.014, 0.014)

    # 4. Ba cổng vòm Romanesque giật cấp sâu ở mặt tiền
    for step_i, (w_a, h_a, y_a, key_a) in enumerate((
        (0.20, 0.27, -0.422, "porcelain"),
        (0.16, 0.24, -0.428, "notre_dame_brick"),
        (0.125, 0.21, -0.434, "obsidian_glass"),
    )):
        arch(key_a, 0.0, y_a, 0.175 - step_i * 0.006, w_a, 0.025, h_a)
    for sx in (-0.28, 0.28):
        arch("porcelain", sx, -0.538, 0.155, 0.110, 0.024, 0.19)
        arch("obsidian_glass", sx, -0.544, 0.150, 0.082, 0.024, 0.165)

    # 5. Cửa sổ Hoa Hồng (Rose Window Opening)
    rc = P(0.0, -0.425, 0.455)
    for key_r, r_out, push_in in (
        ("porcelain", 0.112, 0.000),
        ("notre_dame_brick", 0.096, 0.006),
        ("porcelain", 0.084, 0.012),
        ("obsidian_glass", 0.072, 0.018),
        ("dong_son_gold", 0.022, 0.024),
    ):
        p_front = rc + face_vec * (push_in * S)
        p_back = rc + face_vec * ((push_in + 0.012) * S)
        add_cylinder_between(b(key_r), p_front, p_back, r_out * S, segments=12)
    for k in range(6):
        ang = k * math.pi / 6.0
        p0 = P(-0.070 * math.cos(ang), -0.438, 0.455 - 0.070 * math.sin(ang))
        p1 = P(0.070 * math.cos(ang), -0.438, 0.455 + 0.070 * math.sin(ang))
        add_cylinder_between(b("porcelain"), p0, p1, 0.0055 * S, segments=4)
