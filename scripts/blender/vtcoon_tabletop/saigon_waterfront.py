# -*- coding: utf-8 -*-
"""NỬA TÂY – TP.HCM: Chợ Bến Thành, Bến Bạch Đằng & du thuyền, phố đi bộ Nguyễn Huệ – Lê Lợi, công viên nhiệt đới."""

import math
import random

from mathutils import Vector

from .core import (MeshBatch, add_arched_opening, add_box, add_cylinder, add_cylinder_between, add_pitched_roof,
                   add_ring, add_sphere, local_frame, sweep_profile)
from .flora import add_coconut_palm, add_flowerbed, add_fan_palm, scatter_trees
from .foundation import is_in_river, river_bank_path, river_center_x, river_half_width
from .saigon import BX, BY, ND_ROT, ND_X, ND_Y, build_bitexco, build_notre_dame

BT_X, BT_Y, BT_ROT = -2.6, -4.2, math.radians(60.0)  # mặt tiền hướng Đông-Đông Nam ra quảng trường
ND_PLAZA = (ND_X + 1.05 * math.sin(ND_ROT) * 1.22, ND_Y - 1.05 * math.cos(ND_ROT) * 1.22)
BT_PLAZA = (BT_X + 1.12 * math.sin(BT_ROT), BT_Y - 1.12 * math.cos(BT_ROT))
WHARF_HEAD = (-1.05, -3.05)


def build_ben_thanh(b) -> None:
    T = local_frame(BT_X, BT_Y, BT_ROT)

    def box(key, lx, ly, lz, sx, sy, sz):
        add_box(b(key), T(lx, ly, lz), (sx, sy, sz), BT_ROT)

    box("granite_paving", 0.0, 0.0, 0.015, 0.96, 1.36, 0.03)
    box("indochine_cream", 0.0, 0.08, 0.15, 0.80, 1.10, 0.24)
    add_pitched_roof(b("terracotta_roof"), T(0.0, 0.08, 0)[:2], 0.27, 0.88, 1.16, 0.18, BT_ROT, 0.0)
    for side in (-1, 1):
        for ly in (-0.25, 0.0, 0.25, 0.50):
            add_arched_opening(b("obsidian_glass"), tuple(T(side * 0.402, ly, 0.14)), 0.10, 0.01, 0.15,
                               BT_ROT + side * math.pi * 0.5)
    # Khối sảnh chính mặt tiền + 2 chòi góc
    box("indochine_cream", 0.0, -0.53, 0.20, 0.50, 0.18, 0.34)
    add_pitched_roof(b("terracotta_roof"), T(0.0, -0.53, 0)[:2], 0.37, 0.56, 0.22, 0.12, BT_ROT, 0.0)
    add_arched_opening(b("porcelain"), tuple(T(0.0, -0.622, 0.15)), 0.22, 0.012, 0.25, BT_ROT)
    add_arched_opening(b("obsidian_glass"), tuple(T(0.0, -0.630, 0.14)), 0.17, 0.012, 0.21, BT_ROT)
    for sx in (-0.33, 0.33):
        box("indochine_cream", sx, -0.50, 0.17, 0.18, 0.18, 0.28)
        add_pitched_roof(b("terracotta_roof"), T(sx, -0.50, 0)[:2], 0.31, 0.22, 0.22, 0.10, BT_ROT, 0.3)
        add_arched_opening(b("obsidian_glass"), tuple(T(sx, -0.592, 0.15)), 0.08, 0.01, 0.14, BT_ROT)
    # Tháp đồng hồ 4 mặt trắng sứ
    box("porcelain", 0.0, -0.53, 0.55, 0.18, 0.18, 0.40)
    for face in range(4):
        fr = face * math.pi * 0.5
        ox, oy = math.sin(fr), -math.cos(fr)
        c = T(ox * 0.09, -0.53 + oy * 0.09, 0.66)
        dirv = Vector((math.sin(BT_ROT + fr), -math.cos(BT_ROT + fr), 0.0))
        add_cylinder_between(b("obsidian_glass"), c, c + dirv * 0.010, 0.062, segments=24)
        add_cylinder_between(b("porcelain"), c + dirv * 0.004, c + dirv * 0.014, 0.052, segments=24)
        hand = c + dirv * 0.016
        add_box(b("obsidian_glass"), hand + Vector((0.0, 0.0, 0.014)), (0.006, 0.004, 0.030), BT_ROT + fr)
        add_box(b("obsidian_glass"), hand, (0.034, 0.004, 0.006), BT_ROT + fr)
        add_arched_opening(b("obsidian_glass"), tuple(T(ox * 0.092, -0.53 + oy * 0.092, 0.47)), 0.06, 0.01, 0.10,
                           BT_ROT + fr)
    box("porcelain", 0.0, -0.53, 0.76, 0.21, 0.21, 0.025)
    add_cylinder(b("terracotta_roof"), T(0.0, -0.53, 0.83), 0.15, 0.01, 0.12, 4, BT_ROT + math.pi * 0.25)


def _strip(b, key, p0, p1, width, z=0.012) -> None:
    dx, dy = p1[0] - p0[0], p1[1] - p0[1]
    add_box(b(key), ((p0[0] + p1[0]) * 0.5, (p0[1] + p1[1]) * 0.5, z * 0.5), (math.hypot(dx, dy), width, z),
            math.atan2(dy, dx))


def build_boulevards(b, rng) -> None:
    nh_end = (ND_PLAZA[0] + 0.25, ND_PLAZA[1] - 0.05)
    _strip(b, "granite_paving", WHARF_HEAD, nh_end, 0.50)  # Đại lộ Nguyễn Huệ
    ll0 = (-1.75, -2.95)
    _strip(b, "granite_paving", ll0, (BT_PLAZA[0] + 0.05, BT_PLAZA[1] + 0.25), 0.40)  # Đại lộ Lê Lợi
    add_cylinder(b("granite_paving"), (ND_PLAZA[0], ND_PLAZA[1], 0.008), 0.42, 0.42, 0.016, 32)
    add_cylinder(b("granite_paving"), (BT_PLAZA[0], BT_PLAZA[1], 0.008), 0.40, 0.40, 0.016, 32)
    # Tượng Đức Mẹ Hoà Bình giữa công trường Công xã Paris
    add_cylinder(b("cut_stone"), (ND_PLAZA[0], ND_PLAZA[1], 0.04), 0.06, 0.05, 0.06, 12)
    add_cylinder(b("porcelain"), (ND_PLAZA[0], ND_PLAZA[1], 0.11), 0.022, 0.012, 0.09, 10)
    add_sphere(b("porcelain"), (ND_PLAZA[0], ND_PLAZA[1], 0.163), (0.012, 0.012, 0.014), subdiv=1)
    # Đài phun nước mini + bồn hoa nhiệt đới dọc phố đi bộ
    mid = ((WHARF_HEAD[0] + nh_end[0]) * 0.5, (WHARF_HEAD[1] + nh_end[1]) * 0.5)
    add_ring(b("cut_stone"), mid, 0.13, 0.11, 0.0, 0.04, 24)
    add_cylinder(b("fountain_water"), (mid[0], mid[1], 0.03), 0.11, 0.11, 0.012, 24)
    add_cylinder(b("fountain_water"), (mid[0], mid[1], 0.08), 0.012, 0.004, 0.10, 8)
    add_sphere(b("fountain_water"), (mid[0], mid[1], 0.13), (0.03, 0.03, 0.02), subdiv=1)
    dx, dy = nh_end[0] - WHARF_HEAD[0], nh_end[1] - WHARF_HEAD[1]
    length = math.hypot(dx, dy)
    ux, uy = dx / length, dy / length
    for k in range(1, 7):
        t = k / 7.0
        if abs(t - 0.5) < 0.1:
            continue
        for side in (-1, 1):
            cx = WHARF_HEAD[0] + dx * t - uy * side * 0.19
            cy = WHARF_HEAD[1] + dy * t + ux * side * 0.19
            add_box(b("foliage_moss"), (cx, cy, 0.02), (0.16, 0.06, 0.03), math.atan2(dy, dx))
            add_sphere(b("flower_pink" if k % 2 else "flower_yellow"), (cx, cy, 0.04), (0.06, 0.025, 0.014),
                       subdiv=1, rot_z=math.atan2(dy, dx))
    add_flowerbed(b, BT_PLAZA[0], BT_PLAZA[1], 0.14, rng)


def _cruiser(b, x: float, y: float, yaw: float) -> None:
    """Du thuyền Saigon Cruiser trắng sọc xanh."""
    z = -0.03
    add_sphere(b("porcelain", smooth=True), (x, y, z + 0.03), (0.26, 0.075, 0.045), subdiv=2, rot_z=yaw)
    add_sphere(b("cruiser_blue", smooth=True), (x, y, z + 0.035), (0.262, 0.077, 0.012), subdiv=2, rot_z=yaw)
    c, s = math.cos(yaw), math.sin(yaw)
    add_box(b("porcelain"), (x - 0.03 * c, y - 0.03 * s, z + 0.09), (0.26, 0.10, 0.05), yaw)
    add_box(b("obsidian_glass"), (x - 0.03 * c, y - 0.03 * s, z + 0.093), (0.24, 0.104, 0.022), yaw)
    add_box(b("porcelain"), (x - 0.06 * c, y - 0.06 * s, z + 0.135), (0.14, 0.08, 0.04), yaw)
    add_box(b("cruiser_blue"), (x - 0.06 * c, y - 0.06 * s, z + 0.158), (0.15, 0.085, 0.008), yaw)
    add_cylinder(b("cruiser_blue"), (x - 0.12 * c, y - 0.12 * s, z + 0.18), 0.014, 0.012, 0.05, 10)


def build_bach_dang_wharf(b, clearance) -> None:
    for y0, y1 in ((-6.55, -2.05), (2.05, 6.55)):
        bank = list(reversed(river_bank_path(-1, y0, y1, 36)))
        sweep_profile(b("marble_wharf"), bank, [(0.10, 0.0), (0.40, 0.0), (0.40, 0.022), (0.10, 0.022)], False)
        for p in bank[1::3]:
            px = p.x - 0.50
            if clearance.is_free(px, p.y, 0.02):
                add_coconut_palm(b, px, p.y, 1.05, math.pi)
                clearance.add_circle(px, p.y, 0.14)
    for y in (-3.45, -4.55, -5.65):
        xc, w = river_center_x(y), river_half_width(y)
        bank_x = xc - w
        add_box(b("marble_wharf"), (bank_x + 0.08, y, 0.012), (0.30, 0.09, 0.024))
        for k in (-1, 1):
            add_cylinder(b("cut_stone"), (bank_x + 0.20, y + k * 0.04, 0.02), 0.012, 0.012, 0.05, 8)
        _cruiser(b, bank_x + 0.17, y - 0.26, math.pi * 0.5 + 0.05)


def build_saigon_quarter(coll, mats, clearance) -> None:
    b = MeshBatch("GEO_SG_Landmarks", mats, coll)
    build_bitexco(b)
    build_notre_dame(b)
    build_ben_thanh(b)
    b.commit()
    w = MeshBatch("GEO_SG_Waterfront", mats, coll)
    rng = random.Random(1975)
    build_boulevards(w, rng)
    clearance.add_circle(BX, BY, 0.85)
    clearance.add_circle(ND_X, ND_Y, 1.05)
    clearance.add_circle(ND_PLAZA[0], ND_PLAZA[1], 0.55)
    clearance.add_circle(BT_X, BT_Y, 0.95)
    clearance.add_circle(BT_PLAZA[0], BT_PLAZA[1], 0.52)
    for t in range(11):
        f = t / 10.0
        clearance.add_circle(WHARF_HEAD[0] + (ND_PLAZA[0] - WHARF_HEAD[0]) * f,
                             WHARF_HEAD[1] + (ND_PLAZA[1] - WHARF_HEAD[1]) * f, 0.36)
        clearance.add_circle(-1.75 + (BT_PLAZA[0] + 1.75) * f, -2.95 + (BT_PLAZA[1] + 2.95) * f, 0.30)
    build_bach_dang_wharf(w, clearance)
    clearance.add_predicate(lambda x, y, m: is_in_river(x, y, 0.42 + m))
    for px, py in ((-2.75, 2.75), (-4.45, 2.6), (-2.95, 0.95)):
        if clearance.is_free(px, py, 0.0):
            add_fan_palm(w, px, py, 1.1)
            clearance.add_circle(px, py, 0.14)
    scatter_trees(w, clearance, (-6.40, -0.95, -6.40, 6.40), 0.52, 3004, "saigon", 75)
    w.commit()
