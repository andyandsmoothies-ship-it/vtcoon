# -*- coding: utf-8 -*-
"""KHU DI SẢN HÀ NỘI (BẮC / ĐÔNG): Hồ Hoàn Kiếm ngọc lam [1.8, 2.0], Đảo Ngọc, Tháp Rùa 3 tầng, Cầu Thê Húc, bờ hồ liễu rủ."""

import math
import random

import bmesh
from mathutils import Vector

from .core import (MeshBatch, add_arched_opening, add_box, add_cylinder, add_oriental_curved_roof, add_sphere,
                   add_star, add_tube_along, create_mesh_object, local_frame, path_normals_xy, sweep_profile)
from .flora import add_flowerbed, add_stone_bench, add_willow

HK_CX, HK_CY = 2.65, 2.75
HK_RX, HK_RY = 1.75, 1.62
ISLAND_CX, ISLAND_CY = 2.55, 2.80
ISLAND_RX, ISLAND_RY = 0.65, 0.56
WATER_Z = 0.014
DISC_KEEP_OUT = 2.50


def hoan_kiem_boundary(n: int = 36) -> list[Vector]:
    """Mép hồ hình elip hữu cơ (CCW) tại [2.65, 2.75], chừa hành lang thông thoáng cho đường tàu Metro."""
    pts = []
    for k in range(n):
        th = 2.0 * math.pi * k / n
        w = 1.0 + 0.03 * math.sin(3.0 * th) + 0.02 * math.cos(5.0 * th)
        x = HK_CX + HK_RX * w * math.cos(th)
        y = HK_CY + HK_RY * w * math.sin(th)
        d = math.hypot(x, y)
        if d < DISC_KEEP_OUT:
            x, y = x * DISC_KEEP_OUT / d, y * DISC_KEEP_OUT / d
        pts.append(Vector((x, y, 0.0)))
    return pts


def is_in_hoan_kiem(x: float, y: float, margin: float = 0.0) -> bool:
    ex, ey = HK_RX * 1.08 + margin, HK_RY * 1.08 + margin
    return ((x - HK_CX) / ex) ** 2 + ((y - HK_CY) / ey) ** 2 < 1.0


def _build_lake_body(coll, mats, boundary) -> None:
    nrm = path_normals_xy(boundary, closed=True)
    bm = bmesh.new()
    center = bm.verts.new((HK_CX, HK_CY, WATER_Z))
    rim = [bm.verts.new((p.x + n.x * 0.03, p.y + n.y * 0.03, WATER_Z)) for p, n in zip(boundary, nrm)]
    for k in range(len(rim)):
        bm.faces.new((center, rim[k], rim[(k + 1) % len(rim)]))
    create_mesh_object("GEO_HoanKiem_CyanWater", bm, mats["hoan_kiem_water"], coll, smooth=True)

    curb = [
        (-0.04, 0.002), (0.10, 0.002), (0.10, 0.034), (0.060, 0.052), (0.002, 0.050), (-0.040, 0.028),
    ]
    bm = bmesh.new()
    sweep_profile(bm, boundary, curb, closed_path=True, normals=nrm)
    sweep_profile(bm, boundary, [(0.36, 0.002), (0.44, 0.002), (0.44, 0.022), (0.36, 0.022)],
                  closed_path=True, normals=nrm)
    create_mesh_object("GEO_HoanKiem_Rounded_Curb", bm, mats["cut_stone"], coll, smooth=True)

    bm = bmesh.new()
    sweep_profile(bm, boundary, [(0.10, 0.002), (0.36, 0.002), (0.36, 0.018), (0.10, 0.018)], True, nrm)
    create_mesh_object("GEO_HoanKiem_Granite_Promenade", bm, mats["granite_paving"], coll)


def _build_ngoc_island(b) -> None:
    moss = b("jade_moss", smooth=True)
    fracs = ((1.0, WATER_Z - 0.004), (0.86, 0.038), (0.62, 0.058), (0.34, 0.068))
    rings = []
    for f, z in fracs:
        rings.append([moss.verts.new((ISLAND_CX + ISLAND_RX * f * math.cos(a),
                                      ISLAND_CY + ISLAND_RY * f * math.sin(a), z))
                      for a in (2.0 * math.pi * k / 20 for k in range(20))])
    for r0, r1 in zip(rings, rings[1:]):
        for k in range(20):
            kn = (k + 1) % 20
            moss.faces.new((r0[k], r0[kn], r1[kn], r1[k]))
    top = moss.verts.new((ISLAND_CX, ISLAND_CY, 0.072))
    for k in range(20):
        moss.faces.new((rings[-1][k], rings[-1][(k + 1) % 20], top))
    rng = random.Random(1428)
    for k in range(6):
        a = 2.0 * math.pi * k / 6 + rng.uniform(-0.2, 0.2)
        add_sphere(b("cut_stone"), (ISLAND_CX + ISLAND_RX * 0.96 * math.cos(a),
                                    ISLAND_CY + ISLAND_RY * 0.96 * math.sin(a), WATER_Z),
                   (0.045, 0.038, 0.022), subdiv=0, rot_z=a)


TOWER_SCALE = 1.18
TOWER_Z0 = 0.05


def _build_turtle_tower(b) -> None:
    """
    Tháp Rùa - Hồ Gươm (Gothic-Indochine 3 tầng, hoàn thành 1886, Z_max <= 1.30m <= 1.80m):
      • Tầng 1 và Tầng 2: Mặt dài trổ 3 cửa cuốn vòm nhọn Gothic; Mặt ngắn trổ 2 cửa cuốn vòm nhọn Gothic.
      • Tầng 3: Vọng lâu vuông 4 mặt trổ cửa vòm tròn nhỏ, mái đao 4 góc cong vểnh & đỉnh gắn ngôi sao 5 cánh.
    """
    rot = 0.0
    S = TOWER_SCALE
    base = local_frame(ISLAND_CX, ISLAND_CY, rot)
    xy = (ISLAND_CX, ISLAND_CY)

    def Z(z):
        return TOWER_Z0 + (z - TOWER_Z0) * S

    def T(lx, ly, lz):
        return base(lx * S, ly * S, Z(lz))

    def box(key, lx, ly, lz, sx, sy, sz):
        add_box(b(key), T(lx, ly, lz), (sx * S, sy * S, sz * S), rot)

    def arch(lx, ly, z, w, h, face_rot):
        out = Vector((math.sin(rot + face_rot), -math.cos(rot + face_rot), 0.0))
        c0 = T(lx, ly, z)
        for key, grow, push in (("moss_slate", 0.024, 0.004), ("obsidian_glass", 0.0, 0.010)):
            c = c0 + out * push * S
            add_arched_opening(b(key), (c.x, c.y, c.z), (w + grow) * S, 0.014 * S, (h + grow * 0.5) * S,
                               rot_z=rot + face_rot, arch_segs=4)
        # Viền khoá vòm đỉnh nhọn Gothic (pointed keystone finial)
        ks = c0 + out * (0.008 * S) + Vector((0.0, 0.0, (h * 0.52) * S))
        add_box(b("moss_slate"), (ks.x, ks.y, ks.z), (0.016 * S, 0.016 * S, 0.022 * S), rot + face_rot)

    def roof_with_trim(z, w, d, h, up):
        add_oriental_curved_roof(b("moss_slate"), xy, Z(z), w * S, d * S, h * S,
                                 corner_upturn=up * S, rot_z=rot, per_side=3)
        hx, hy = w * 0.50, d * 0.50
        for sx in (-1.0, 1.0):
            for sy in (-1.0, 1.0):
                p_eave = T(sx * hx * 1.04, sy * hy * 1.04, z + up * 0.85)
                p_top = T(sx * hx * 0.42, sy * hy * 0.42, z + h * 0.88)
                add_tube_along(b("cut_stone"), [p_eave, p_top], 0.009 * S, segments=4)
                # Đầu đao uốn cong (sculpted dragon-tail eave finial) ở 4 góc mái
                p_tip = T(sx * hx * 1.10, sy * hy * 1.10, z + up * 1.18)
                add_tube_along(b("cut_stone"), [p_eave, p_tip], 0.007 * S, segments=4)

    box("cut_stone", 0.0, 0.0, 0.068, 0.64, 0.50, 0.036)
    box("aged_stucco", 0.0, 0.0, 0.092, 0.58, 0.44, 0.016)

    # 1. TẦNG 1 + Tường chắn mái trổ lỗ thoáng (Openwork Parapet Balustrade)
    box("aged_stucco", 0.0, 0.0, 0.225, 0.50, 0.36, 0.25)
    for lx in (-0.145, 0.0, 0.145):
        arch(lx, -0.18, 0.205, 0.072, 0.175, 0.0)
        arch(lx, 0.18, 0.205, 0.072, 0.175, math.pi)
    for side in (-1.0, 1.0):
        for ly in (-0.078, 0.078):
            arch(side * 0.25, ly, 0.205, 0.066, 0.170, side * math.pi * 0.5)
    for sx in (-0.245, 0.245):
        for sy in (-0.175, 0.175):
            box("moss_slate", sx, sy, 0.225, 0.024, 0.024, 0.252)
    box("moss_slate", 0.0, 0.0, 0.358, 0.54, 0.40, 0.022)
    roof_with_trim(0.368, 0.62, 0.48, 0.065, 0.048)

    for sy in (-0.185, 0.185):
        box("aged_stucco", 0.0, sy, 0.415, 0.44, 0.018, 0.036)
        box("moss_slate", 0.0, sy, 0.436, 0.45, 0.022, 0.008)
        for bx_p in (-0.15, -0.075, 0.0, 0.075, 0.15):
            box("obsidian_glass", bx_p, sy, 0.415, 0.032, 0.020, 0.018)
    for sx in (-0.225, 0.225):
        box("aged_stucco", sx, 0.0, 0.415, 0.018, 0.36, 0.036)
        box("moss_slate", sx, 0.0, 0.436, 0.022, 0.37, 0.008)
        for by_p in (-0.11, -0.038, 0.038, 0.11):
            box("obsidian_glass", sx, by_p, 0.415, 0.020, 0.032, 0.018)
        for sy in (-0.185, 0.185):
            box("moss_slate", sx, sy, 0.422, 0.030, 0.030, 0.054)

    # 2. TẦNG 2 + Tường chắn mái trổ lỗ thoáng (Openwork Parapet Balustrade)
    box("aged_stucco", 0.0, 0.0, 0.505, 0.38, 0.28, 0.20)
    for lx in (-0.108, 0.0, 0.108):
        arch(lx, -0.14, 0.495, 0.056, 0.135, 0.0)
        arch(lx, 0.14, 0.495, 0.056, 0.135, math.pi)
    for side in (-1.0, 1.0):
        for ly in (-0.058, 0.058):
            arch(side * 0.19, ly, 0.495, 0.052, 0.130, side * math.pi * 0.5)
    for sx in (-0.185, 0.185):
        for sy in (-0.135, 0.135):
            box("moss_slate", sx, sy, 0.505, 0.020, 0.020, 0.202)
    box("moss_slate", 0.0, 0.0, 0.612, 0.42, 0.32, 0.020)
    roof_with_trim(0.620, 0.50, 0.40, 0.062, 0.046)

    for sy in (-0.135, 0.135):
        box("aged_stucco", 0.0, sy, 0.665, 0.28, 0.016, 0.032)
        box("moss_slate", 0.0, sy, 0.683, 0.29, 0.020, 0.007)
        for bx_p in (-0.09, 0.0, 0.09):
            box("obsidian_glass", bx_p, sy, 0.665, 0.030, 0.018, 0.016)
    for sx in (-0.145, 0.145):
        box("aged_stucco", sx, 0.0, 0.665, 0.016, 0.26, 0.032)
        box("moss_slate", sx, 0.0, 0.683, 0.020, 0.27, 0.007)
        for by_p in (-0.065, 0.065):
            box("obsidian_glass", sx, by_p, 0.665, 0.018, 0.030, 0.016)
        for sy in (-0.135, 0.135):
            box("moss_slate", sx, sy, 0.672, 0.026, 0.026, 0.048)

    # 3. TẦNG 3
    box("aged_stucco", 0.0, 0.0, 0.700, 0.24, 0.24, 0.028)
    box("aged_stucco", 0.0, 0.0, 0.775, 0.17, 0.17, 0.125)
    for face in range(4):
        fr = face * math.pi * 0.5
        arch(0.085 * math.sin(fr), -0.085 * math.cos(fr), 0.770, 0.054, 0.088, fr)
    for sx in (-0.088, 0.088):
        for sy in (-0.088, 0.088):
            add_cylinder(b("moss_slate"), T(sx, sy, 0.775), 0.014 * S, 0.014 * S, 0.125 * S, 6)
    box("moss_slate", 0.0, 0.0, 0.842, 0.21, 0.21, 0.016)
    roof_with_trim(0.848, 0.36, 0.36, 0.135, 0.068)
    box("moss_slate", 0.0, 0.0, 0.985, 0.055, 0.055, 0.032)
    star_pos = T(0.0, 0.0, 1.032)
    add_star(b("star_yellow"), (star_pos.x, star_pos.y, star_pos.z), 0.032 * S, 0.013 * S, 0.008 * S, rot_z=rot)


def _build_the_huc_bridge(b, boundary) -> None:
    """Cầu Thê Húc đỏ son uốn vòm nối từ Đảo Ngọc thẳng xuống bờ Nam (song song trục Y như ảnh mẫu)."""
    dir_se = Vector((0.0, -1.0, 0.0))
    perp = Vector((1.0, 0.0, 0.0))
    p0 = Vector((ISLAND_CX, ISLAND_CY - ISLAND_RY * 0.85, 0.0))
    se_bank = min(boundary, key=lambda p: p.y + abs(p.x - ISLAND_CX) * 3.0)
    p1 = Vector((ISLAND_CX, se_bank.y - 0.12, 0.0))
    path = [
        Vector((
            p0.x + (p1.x - p0.x) * i / 14.0,
            p0.y + (p1.y - p0.y) * i / 14.0,
            0.035 + 0.135 * math.sin(math.pi * i / 14.0),
        ))
        for i in range(15)
    ]
    red = b("the_huc_red")
    yaw = math.atan2(dir_se.y, dir_se.x)
    sweep_profile(red, path, [(-0.11, -0.022), (0.11, -0.022), (0.11, 0.0), (-0.11, 0.0)], closed_path=False)
    for side in (-1.0, 1.0):
        rail = [p + perp * (side * 0.10) + Vector((0.0, 0.0, 0.072)) for p in path]
        add_tube_along(red, rail, 0.008, segments=4)
        mid = [p + perp * (side * 0.10) + Vector((0.0, 0.0, 0.034)) for p in path]
        add_tube_along(red, mid, 0.005, segments=4)
        for i in range(1, 14):
            p = path[i] + perp * (side * 0.10)
            add_box(red, (p.x, p.y, p.z + 0.036), (0.008, 0.008, 0.072), yaw)
    for t in (0.22, 0.42, 0.58, 0.78):
        i = int(round(t * 14))
        p = path[i]
        for side in (-0.07, 0.07):
            q = p + perp * side
            h = p.z - 0.022 - WATER_Z
            add_box(red, (q.x, q.y, WATER_Z + h * 0.5), (0.022, 0.022, h), yaw)
    for p in (path[0], path[-1]):
        for side in (-0.135, 0.135):
            q = p + perp * side
            add_box(red, (q.x, q.y, p.z + 0.08), (0.036, 0.036, 0.16), yaw)
            add_box(b("lamp_glow"), (q.x, q.y, p.z + 0.185), (0.05, 0.05, 0.05), yaw)
            add_cylinder(red, (q.x, q.y, p.z + 0.228), 0.045, 0.004, 0.04, 4, yaw + math.pi * 0.25)


def _build_lakeside(b, boundary, clearance) -> None:
    nrm = path_normals_xy(boundary, closed=True)
    rng = random.Random(1010)
    n = len(boundary)
    for k in range(0, n, 4):
        th = 2.0 * math.pi * k / n
        if abs(math.atan2(math.sin(th + math.radians(42.0)), math.cos(th + math.radians(42.0)))) < 0.22:
            continue  # chừa lối lên cầu Thê Húc ở bờ Đông Nam
        p, nv = boundary[k], nrm[k]
        wx, wy = p.x + nv.x * 0.16, p.y + nv.y * 0.16
        if clearance.is_free(wx, wy, 0.02):
            add_willow(b, wx, wy, -nv, rng.uniform(0.88, 1.06))
            clearance.add_circle(wx, wy, 0.15)
        if k % 8 == 4:
            q = boundary[(k + 1) % n]
            yaw = math.atan2(nv.y, nv.x) + math.pi * 0.5
            add_stone_bench(b, q.x + nv.x * 0.28, q.y + nv.y * 0.28, yaw)
    for k in range(0, n, 16):
        p, nv = boundary[k], nrm[k]
        fx, fy = p.x + nv.x * 0.54, p.y + nv.y * 0.54
        if clearance.is_free(fx, fy, 0.08):
            add_flowerbed(b, fx, fy, 0.11, rng)
            clearance.add_circle(fx, fy, 0.15)


def build_hoan_kiem_quarter(coll, mats, clearance) -> None:
    boundary = hoan_kiem_boundary()
    _build_lake_body(coll, mats, boundary)
    b = MeshBatch("GEO_HN_HoanKiem", mats, coll)
    _build_ngoc_island(b)
    _build_turtle_tower(b)
    _build_the_huc_bridge(b, boundary)
    _build_lakeside(b, boundary, clearance)
    clearance.add_predicate(lambda x, y, m: is_in_hoan_kiem(x, y, 0.36 + m))
    b.commit()
