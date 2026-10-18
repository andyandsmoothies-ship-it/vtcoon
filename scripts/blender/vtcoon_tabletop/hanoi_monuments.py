# -*- coding: utf-8 -*-
"""NỬA ĐÔNG – HÀ NỘI: Kỳ Đài Thăng Long (Cột Cờ), Nhà Hát Lớn, đại lộ ven sông & công viên thu Hà Nội."""

import math
import random

from mathutils import Vector

from .core import (MeshBatch, add_arched_opening, add_box, add_cylinder, add_frustum, add_pitched_roof, add_sphere,
                   add_star, local_frame, sweep_profile)
from .flora import add_flowerbed, add_round_tree, scatter_trees
from .foundation import is_in_river, river_bank_path

FLAG_X, FLAG_Y = 4.2, -3.2
OPERA_X, OPERA_Y = 3.2, -4.5


def _square_arches(b, cx, cy, dist, z, w, h) -> None:
    """Cổng vòm thành cổ trên 4 mặt khối vuông: viền đá xám + lòng cửa tối."""
    for face in range(4):
        fr = face * math.pi * 0.5
        ox, oy = math.sin(fr), -math.cos(fr)
        add_arched_opening(b("flag_stone"), (cx + ox * dist, cy + oy * dist, z), w + 0.03, 0.02, h + 0.015, fr)
        add_arched_opening(b("obsidian_glass"), (cx + ox * (dist + 0.006), cy + oy * (dist + 0.006), z - 0.004),
                           w, 0.02, h, fr)


def build_flag_tower(b) -> None:
    cx, cy = FLAG_X, FLAG_Y
    tiers = ((0.90, 0.84, 0.00, 0.13), (0.66, 0.61, 0.15, 0.27), (0.44, 0.40, 0.29, 0.40))
    for bot, top, z0, z1 in tiers:
        add_frustum(b("flag_brick"), (cx, cy), z0, z1, (bot * 0.5, bot * 0.5), (top * 0.5, top * 0.5))
        add_box(b("flag_stone"), (cx, cy, z1 + 0.01), (top + 0.04, top + 0.04, 0.02))
    _square_arches(b, cx, cy, 0.437, 0.062, 0.12, 0.11)
    _square_arches(b, cx, cy, 0.320, 0.210, 0.08, 0.085)
    _square_arches(b, cx, cy, 0.212, 0.345, 0.05, 0.06)
    # Thân tháp bát giác vuốt thon + ô cửa thông gió xoắn ốc
    z0, z1, r0, r1 = 0.42, 1.10, 0.150, 0.115
    add_cylinder(b("flag_brick"), (cx, cy, (z0 + z1) * 0.5), r0, r1, z1 - z0, 8, math.pi / 8)
    add_cylinder(b("flag_stone"), (cx, cy, z0 + 0.02), 0.172, 0.165, 0.04, 8, math.pi / 8)
    add_cylinder(b("flag_stone"), (cx, cy, 0.78), 0.142, 0.140, 0.02, 8, math.pi / 8)
    for k in range(10):
        a = k * (2.0 * math.pi / 8.0) * 1.25 - math.pi * 0.25
        z = 0.50 + k * 0.058
        r = r0 + (r1 - r0) * (z - z0) / (z1 - z0) + 0.002
        add_box(b("obsidian_glass"), (cx + r * math.cos(a), cy + r * math.sin(a), z), (0.012, 0.03, 0.045), a)
    # Đài quan sát bát giác
    add_cylinder(b("flag_stone"), (cx, cy, 1.115), 0.175, 0.17, 0.03, 8, math.pi / 8)
    add_cylinder(b("flag_brick"), (cx, cy, 1.18), 0.125, 0.12, 0.10, 8, math.pi / 8)
    for k in range(8):
        a = k * math.pi / 4.0
        add_box(b("obsidian_glass"), (cx + 0.122 * math.cos(a), cy + 0.122 * math.sin(a), 1.18), (0.012, 0.04, 0.05), a)
    add_cylinder(b("flag_stone"), (cx, cy, 1.243), 0.15, 0.14, 0.025, 8, math.pi / 8)
    # Cột cờ & lá cờ đỏ sao vàng (mặt cờ hướng Đông Nam về phía camera)
    add_cylinder(b("silver_steel"), (cx, cy, 1.52), 0.009, 0.006, 0.52, 8)
    add_sphere(b("star_yellow"), (cx, cy, 1.79), (0.014, 0.014, 0.014), subdiv=1)
    ne = Vector((math.cos(math.pi * 0.25), math.sin(math.pi * 0.25), 0.0))
    se = Vector((math.cos(-math.pi * 0.25), math.sin(-math.pi * 0.25), 0.0))
    fc = Vector((cx, cy, 1.67)) + ne * 0.13
    add_box(b("flag_red"), fc, (0.24, 0.006, 0.16), math.pi * 0.25)
    for sgn in (1.0, -1.0):
        sc = fc + se * (0.004 * sgn)
        add_star(b("star_yellow"), (sc.x, sc.y, sc.z), 0.046, 0.018, 0.004, math.pi * 0.25 if sgn > 0 else -0.75 * math.pi)


def build_opera_house(b) -> None:
    O = local_frame(OPERA_X, OPERA_Y, 0.0)

    def box(key, lx, ly, lz, sx, sy, sz):
        add_box(b(key), O(lx, ly, lz), (sx, sy, sz))

    box("granite_paving", 0.0, 0.0, 0.02, 1.30, 0.80, 0.04)
    for i, (w, d) in enumerate(((0.56, 0.14), (0.52, 0.10), (0.48, 0.06))):
        box("granite_paving", 0.0, -0.40 - d * 0.5 + 0.04, 0.008 + i * 0.012, w, d, 0.016 + i * 0.012)
    box("indochine_cream", 0.0, 0.05, 0.21, 1.10, 0.62, 0.34)
    box("indochine_cream", 0.0, -0.30, 0.24, 0.44, 0.10, 0.40)
    for sx in (-0.48, 0.48):
        box("indochine_cream", sx, -0.24, 0.24, 0.22, 0.14, 0.40)
        add_arched_opening(b("obsidian_glass"), O(sx, -0.312, 0.21), 0.08, 0.012, 0.17)
        add_frustum(b("mansard_slate"), O(sx, -0.24, 0)[:2], 0.44, 0.56, (0.115, 0.075), (0.06, 0.035))
        add_sphere(b("dong_son_gold"), O(sx, -0.24, 0.575), (0.012, 0.012, 0.02), subdiv=1)
    # Hàng cột Corinthian đối xứng
    for lx in (-0.18, -0.108, -0.036, 0.036, 0.108, 0.18):
        add_cylinder(b("porcelain"), O(lx, -0.385, 0.185), 0.016, 0.014, 0.25, 10)
        box("porcelain", lx, -0.385, 0.07, 0.036, 0.036, 0.02)
        box("dong_son_gold", lx, -0.385, 0.318, 0.038, 0.038, 0.018)
    box("indochine_cream", 0.0, -0.385, 0.345, 0.46, 0.05, 0.036)
    for k in range(11):
        box("porcelain", -0.20 + k * 0.04, -0.395, 0.375, 0.012, 0.012, 0.03)
    box("porcelain", 0.0, -0.395, 0.393, 0.46, 0.02, 0.008)
    add_pitched_roof(b("indochine_cream"), O(0.0, -0.30, 0)[:2], 0.44, 0.44, 0.10, 0.09, hip_inset=0.0)
    for lx in (-0.07, 0.0, 0.07):
        add_arched_opening(b("obsidian_glass"), O(lx, -0.352, 0.13), 0.05, 0.008, 0.13)
    for lx in (-0.295, 0.295):
        for z in (0.13, 0.28):
            add_arched_opening(b("obsidian_glass"), O(lx, -0.262, z), 0.06, 0.008, 0.10)
    for side in (-1, 1):
        for ly in (-0.12, 0.04, 0.20):
            for z in (0.13, 0.28):
                add_arched_opening(b("obsidian_glass"), O(side * 0.552, ly, z), 0.06, 0.008, 0.10, side * math.pi * 0.5)
    # Mái Mansard đá phiến + vòm sân khấu
    add_frustum(b("mansard_slate"), O(0.0, 0.05, 0)[:2], 0.38, 0.50, (0.56, 0.32), (0.44, 0.21))
    add_cylinder(b("indochine_cream"), O(0.0, 0.14, 0.54), 0.14, 0.14, 0.08, 24)
    add_sphere(b("mansard_slate", smooth=True), O(0.0, 0.14, 0.58), (0.15, 0.15, 0.13))
    add_cylinder(b("dong_son_gold"), O(0.0, 0.14, 0.73), 0.018, 0.004, 0.06, 8)
    box("granite_paving", 0.0, -0.75, 0.006, 1.60, 0.55, 0.012)


def build_hanoi_civic_quarter(coll, mats, clearance) -> None:
    b = MeshBatch("GEO_HN_Civic", mats, coll)
    build_flag_tower(b)
    build_opera_house(b)
    clearance.add_circle(FLAG_X, FLAG_Y, 0.62)
    clearance.add_predicate(lambda x, y, m: OPERA_X - 0.82 - m < x < OPERA_X + 0.82 + m
                            and OPERA_Y - 1.05 - m < y < OPERA_Y + 0.45 + m)
    rng = random.Random(1945)
    for fx, fy in ((2.45, -5.25), (3.95, -5.25), (4.75, -3.95), (3.65, -3.25)):
        if clearance.is_free(fx, fy, 0.05):
            add_flowerbed(b, fx, fy, 0.13, rng)
            clearance.add_circle(fx, fy, 0.18)
    # Đại lộ ven sông bờ Đông (dải đại lộ trung tâm phía Hà Nội) + hàng cây
    for y0, y1 in ((-6.55, -2.05), (2.05, 6.55)):
        bank = river_bank_path(1, y0, y1, 36)
        sweep_profile(b("granite_paving"), bank, [(0.12, 0.0), (0.38, 0.0), (0.38, 0.012), (0.12, 0.012)], False)
        for p in bank[1::3]:
            tx = p.x + 0.50
            if clearance.is_free(tx, p.y, 0.05):
                add_round_tree(b, tx, p.y, 0.9, moss=False)
                clearance.add_circle(tx, p.y, 0.14)
    clearance.add_predicate(lambda x, y, m: is_in_river(x, y, 0.42 + m))
    scatter_trees(b, clearance, (0.95, 6.40, -6.40, 6.40), 0.52, 3010, "hanoi", 70)
    b.commit()
