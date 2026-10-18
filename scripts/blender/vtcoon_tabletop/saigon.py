# -*- coding: utf-8 -*-
"""NỬA TÂY – TP. HỒ CHÍ MINH: Tháp Tài chính Bitexco Búp Sen & Nhà thờ Đức Bà Sài Gòn."""

import math

from mathutils import Vector

from .core import (add_arched_opening, add_box, add_cylinder, add_cylinder_between, add_pitched_roof, add_ring,
                   add_tube_along, local_frame)

BX, BY = -3.6, 1.8
ND_X, ND_Y, ND_ROT = -4.0, -1.8, math.radians(35.0)
TOWER_Z0, TOWER_Z1, CROWN_RISE = 0.26, 3.40, 0.25  # Z_top = 3.65m
HELIPAD_Z = 2.66  # tầng 52 / 68


def _lotus_point(s: float, th: float, off: float = 0.0) -> Vector:
    """Mặt cắt elip loft búp sen: phình nhẹ thân dưới, vuốt thon & vát chéo ở đỉnh."""
    rot = math.radians(-22.0)
    bulge = 1.0 + 0.12 * math.sin(s * math.pi * 0.85) - 0.40 * (s ** 1.45)
    rx, ry = 0.40 * bulge + off, 0.28 * bulge + off
    lx = rx * math.cos(th) + 0.06 * math.sin(s * math.pi * 0.92)
    ly = ry * math.sin(th)
    crown = max(0.0, (s - 0.70) / 0.30) ** 1.35 * CROWN_RISE * (0.85 * math.cos(th - 0.4) + 0.15)
    return Vector((BX + lx * math.cos(rot) - ly * math.sin(rot), BY + lx * math.sin(rot) + ly * math.cos(rot),
                   TOWER_Z0 + s * (TOWER_Z1 - TOWER_Z0) + crown))


def build_bitexco(b) -> None:
    for i, (r, h, z) in enumerate(((0.62, 0.10, 0.05), (0.52, 0.09, 0.145), (0.44, 0.08, 0.23))):
        add_cylinder(b("silver_steel" if i == 0 else "bitexco_glass"), (BX, BY, z), r, r * 0.96, h, 48)
    rings_n, segs = 28, 40
    glass = b("bitexco_glass", smooth=True)
    rings = [[glass.verts.new(_lotus_point(ri / rings_n, 2.0 * math.pi * k / segs)) for k in range(segs)]
             for ri in range(rings_n + 1)]
    for r0, r1 in zip(rings, rings[1:]):
        for k in range(segs):
            kn = (k + 1) % segs
            glass.faces.new((r0[k], r0[kn], r1[kn], r1[k]))
    glass.faces.new(list(reversed(rings[0])))
    glass.faces.new(rings[-1])
    steel = b("silver_steel")
    for k in range(12):  # 12 gân thép chịu lực mạ bạc
        th = 2.0 * math.pi * k / 12
        add_tube_along(steel, [_lotus_point(ri / rings_n, th, 0.008) for ri in range(rings_n + 1)], 0.010, 6)
    for ri in range(3, rings_n + 1, 3):
        pts = [_lotus_point(ri / rings_n, 2.0 * math.pi * k / 32, 0.006) for k in range(32)]
        add_tube_along(steel, pts, 0.011 if ri == rings_n else 0.006, 5, closed=True)

    # Sàn đáp trực thăng Cantilever tầng 52 (vươn về Tây Nam → nổi rõ trên silhouette camera)
    s_h = (HELIPAD_Z - TOWER_Z0) / (TOWER_Z1 - TOWER_Z0)
    hp = Vector((-0.75, -0.66, 0.0)).normalized()
    perp = Vector((-hp.y, hp.x, 0.0))
    axis = Vector((BX, BY, 0.0))
    reach = max(((_lotus_point(s_h, 2.0 * math.pi * k / 72) - axis).to_2d().dot(hp.to_2d()) for k in range(72)))
    pad = axis + hp * (reach + 0.25)
    pad.z = HELIPAD_Z
    yaw = math.atan2(hp.y, hp.x)
    beam_c = axis + hp * (reach * 0.5 + 0.12)
    for dz, size in ((-0.030, (reach + 0.10, 0.12, 0.010)), (-0.050, (reach + 0.10, 0.022, 0.035)),
                     (-0.070, (reach + 0.10, 0.12, 0.010))):
        add_box(steel, (beam_c.x, beam_c.y, HELIPAD_Z + dz), size, yaw)
    for lat in (-0.09, 0.0, 0.09):
        p_tower = axis + hp * (reach - 0.06) + perp * (lat * 0.6)
        p_pad = pad + hp * 0.13 + perp * lat
        add_cylinder_between(steel, (p_tower.x, p_tower.y, HELIPAD_Z - 0.34), (p_pad.x, p_pad.y, HELIPAD_Z - 0.03),
                             0.013, segments=8)
    add_cylinder(steel, (pad.x, pad.y, HELIPAD_Z - 0.006), 0.255, 0.275, 0.034, 40)
    add_cylinder(b("dark_granite"), (pad.x, pad.y, HELIPAD_Z + 0.015), 0.245, 0.245, 0.010, 40)
    yel = b("helipad_yellow")
    add_ring(yel, (pad.x, pad.y), 0.205, 0.185, HELIPAD_Z + 0.016, HELIPAD_Z + 0.024, 40)
    for lat in (-0.055, 0.055):
        c = pad + perp * lat
        add_box(yel, (c.x, c.y, HELIPAD_Z + 0.022), (0.15, 0.026, 0.006), yaw)
    add_box(yel, (pad.x, pad.y, HELIPAD_Z + 0.022), (0.026, 0.11, 0.006), yaw)


def build_notre_dame(b) -> None:
    """Romanesque + Gothic, gạch đỏ son, 2 tháp chuông 3 tầng, chóp kẽm, Rose Window; mặt tiền hướng Đông Nam."""
    S = 1.22
    T = local_frame(ND_X, ND_Y, ND_ROT)

    def P(lx, ly, lz):
        return T(lx * S, ly * S, lz * S)

    def box(key, lx, ly, lz, sx, sy, sz):
        add_box(b(key), P(lx, ly, lz), (sx * S, sy * S, sz * S), ND_ROT)

    def arch(key, lx, ly, lz, w, d, h, face=0.0):
        add_arched_opening(b(key), tuple(P(lx, ly, lz)), w * S, d * S, h * S, ND_ROT + face)

    box("porcelain", 0.0, 0.0, 0.03, 0.98, 1.32, 0.06)
    box("porcelain", 0.0, -0.70, 0.015, 0.62, 0.12, 0.03)
    box("notre_dame_brick", 0.0, 0.08, 0.33, 0.52, 0.92, 0.54)
    box("notre_dame_brick", 0.0, 0.08, 0.21, 0.82, 0.84, 0.30)
    box("notre_dame_brick", 0.0, 0.24, 0.30, 0.94, 0.30, 0.48)
    add_cylinder(b("notre_dame_brick"), P(0.0, 0.56, 0.25), 0.25 * S, 0.25 * S, 0.40 * S, 16)
    add_cylinder(b("terracotta_roof"), P(0.0, 0.56, 0.53), 0.27 * S, 0.02 * S, 0.16 * S, 16)
    add_pitched_roof(b("terracotta_roof"), P(0.0, 0.08, 0)[:2], 0.60 * S, 0.58 * S, 0.96 * S, 0.22 * S, ND_ROT, 0.0)
    add_pitched_roof(b("terracotta_roof"), P(0.0, 0.24, 0)[:2], 0.54 * S, 0.98 * S, 0.34 * S, 0.17 * S, ND_ROT, 0.0)
    for sx in (-0.34, 0.34):
        add_pitched_roof(b("terracotta_roof"), P(sx, 0.08, 0)[:2], 0.36 * S, 0.20 * S, 0.84 * S, 0.08 * S, ND_ROT, 0.1)
    for wy in (-0.24, -0.06, 0.40):
        for side in (-1.0, 1.0):
            arch("obsidian_glass", side * 0.266, wy, 0.47, 0.08, 0.02, 0.14, side * math.pi * 0.5)
            arch("obsidian_glass", side * 0.416, wy, 0.21, 0.09, 0.02, 0.15, side * math.pi * 0.5)
            box("porcelain", side * 0.42, wy + 0.09, 0.21, 0.03, 0.03, 0.30)
    for side in (-1.0, 1.0):
        arch("obsidian_glass", side * 0.476, 0.24, 0.30, 0.10, 0.02, 0.20, side * math.pi * 0.5)
    # 2 tháp chuông 3 tầng giật cấp đối xứng
    for tx in (-0.28, 0.28):
        for z0, z1, w in ((0.06, 0.34, 0.28), (0.34, 0.60, 0.26), (0.60, 0.86, 0.24)):
            box("notre_dame_brick", tx, -0.40, (z0 + z1) * 0.5, w, w, z1 - z0)
            box("porcelain", tx, -0.40, z1, w + 0.03, w + 0.03, 0.028)
        for face in range(4):
            fr = face * math.pi * 0.5
            ox, oy = 0.121 * math.sin(fr), -0.121 * math.cos(fr)
            arch("obsidian_glass", tx + ox, -0.40 + oy, 0.73, 0.085, 0.02, 0.18, fr)
            for k in range(3):  # cửa vòm lá sách
                arch("porcelain", tx + ox * 1.04, -0.40 + oy * 1.04, 0.69 + k * 0.035, 0.07, 0.006, 0.012, fr)
            ox2, oy2 = 0.131 * math.sin(fr), -0.131 * math.cos(fr)
            arch("obsidian_glass", tx + ox2, -0.40 + oy2, 0.47, 0.07, 0.02, 0.15, fr)
        for px in (-0.10, 0.10):
            for py in (-0.10, 0.10):
                add_cylinder(b("porcelain"), P(tx + px, -0.40 + py, 0.93), 0.026 * S, 0.003 * S, 0.12 * S, 4,
                             ND_ROT + math.pi * 0.25)
        add_cylinder(b("zinc_spire"), P(tx, -0.40, 1.19), 0.125 * S, 0.006 * S, 0.62 * S, 8, ND_ROT + math.pi / 8)
        box("dong_son_gold", tx, -0.40, 1.54, 0.016, 0.016, 0.10)
        box("dong_son_gold", tx, -0.40, 1.555, 0.06, 0.016, 0.016)
    # Cổng vòm chính + 2 cổng phụ
    arch("porcelain", 0.0, -0.395, 0.19, 0.19, 0.05, 0.26)
    arch("obsidian_glass", 0.0, -0.41, 0.18, 0.13, 0.05, 0.22)
    for sx in (-0.28, 0.28):
        arch("obsidian_glass", sx, -0.535, 0.17, 0.09, 0.03, 0.17)
    # Cửa sổ Hoa Hồng tròn chạm nổi chính diện
    rc = P(0.0, -0.385, 0.47)
    face = Vector((math.sin(ND_ROT), -math.cos(ND_ROT), 0.0))
    for key, r, push in (("porcelain", 0.115, 0.0), ("obsidian_glass", 0.088, 0.008), ("dong_son_gold", 0.030, 0.016)):
        a = rc + face * (push * S)
        b_ = rc + face * ((push + 0.012) * S)
        add_cylinder_between(b(key), a, b_, r * S, segments=28)
    for k in range(8):
        ang = k * math.pi / 4.0
        p0 = P(-0.082 * math.cos(ang), -0.402, 0.47 - 0.082 * math.sin(ang))
        p1 = P(0.082 * math.cos(ang), -0.402, 0.47 + 0.082 * math.sin(ang))
        add_cylinder_between(b("porcelain"), p0, p1, 0.007 * S, segments=6)
