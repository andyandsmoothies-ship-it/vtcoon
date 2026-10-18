# -*- coding: utf-8 -*-
"""NỬA ĐÔNG – THỦ ĐÔ HÀ NỘI: Hồ Hoàn Kiếm ngọc lam, Đảo Ngọc, Tháp Rùa 3 tầng, Cầu Thê Húc, bờ hồ liễu rủ."""

import math
import random

import bmesh
from mathutils import Vector

from .core import (MeshBatch, add_arched_opening, add_box, add_cylinder, add_oriental_curved_roof, add_sphere,
                   add_tube_along, create_mesh_object, local_frame, path_normals_xy, sweep_profile)
from .flora import add_flowerbed, add_stone_bench, add_willow

HK_CX, HK_CY = 3.4, 0.8
HK_RX, HK_RY = 2.1, 2.6
ISLAND_RX, ISLAND_RY = 0.86, 0.72
WATER_Z = 0.014
DISC_KEEP_OUT = 2.12


def hoan_kiem_boundary(n: int = 128) -> list[Vector]:
    """Mép hồ hữu cơ (CCW). Phía Tây được đẩy lùi khỏi bệ Trống Đồng (r < 2.12)."""
    pts = []
    for k in range(n):
        th = 2.0 * math.pi * k / n
        w = 1.0 + 0.03 * math.sin(3.0 * th) + 0.02 * math.cos(5.0 * th)
        x, y = HK_CX + HK_RX * w * math.cos(th), HK_CY + HK_RY * w * math.sin(th)
        d = math.hypot(x, y)
        if d < DISC_KEEP_OUT:
            x, y = x * DISC_KEEP_OUT / d, y * DISC_KEEP_OUT / d
        pts.append(Vector((x, y, 0.0)))
    return pts


def is_in_hoan_kiem(x: float, y: float, margin: float = 0.0) -> bool:
    ex, ey = HK_RX * 1.05 + margin, HK_RY * 1.05 + margin
    return ((x - HK_CX) / ex) ** 2 + ((y - HK_CY) / ey) ** 2 < 1.0


def _build_lake_body(coll, mats, boundary) -> None:
    nrm = path_normals_xy(boundary, closed=True)
    bm = bmesh.new()
    center = bm.verts.new((HK_CX, HK_CY, WATER_Z))
    rim = [bm.verts.new((p.x + n.x * 0.03, p.y + n.y * 0.03, WATER_Z)) for p, n in zip(boundary, nrm)]
    for k in range(len(rim)):
        bm.faces.new((center, rim[k], rim[(k + 1) % len(rim)]))
    create_mesh_object("GEO_HoanKiem_CyanWater", bm, mats["hoan_kiem_water"], coll, smooth=True)

    curb = [(-0.04, 0.0), (0.10, 0.0), (0.10, 0.030), (0.088, 0.046), (0.062, 0.056), (0.030, 0.059),
            (0.002, 0.053), (-0.024, 0.043), (-0.040, 0.028)]
    bm = bmesh.new()
    sweep_profile(bm, boundary, curb, closed_path=True, normals=nrm)
    create_mesh_object("GEO_HoanKiem_Rounded_Curb", bm, mats["cut_stone"], coll, smooth=True)

    bm = bmesh.new()
    sweep_profile(bm, boundary, [(0.10, 0.0), (0.40, 0.0), (0.40, 0.012), (0.10, 0.012)], True, nrm)
    create_mesh_object("GEO_HoanKiem_Granite_Promenade", bm, mats["granite_paving"], coll)


def _build_ngoc_island(b) -> None:
    moss = b("jade_moss", smooth=True)
    fracs = ((1.0, WATER_Z - 0.004), (0.86, 0.040), (0.62, 0.062), (0.34, 0.072))
    rings = []
    for f, z in fracs:
        rings.append([moss.verts.new((HK_CX + ISLAND_RX * f * math.cos(a), HK_CY + ISLAND_RY * f * math.sin(a), z))
                      for a in (2.0 * math.pi * k / 40 for k in range(40))])
    for r0, r1 in zip(rings, rings[1:]):
        for k in range(40):
            kn = (k + 1) % 40
            moss.faces.new((r0[k], r0[kn], r1[kn], r1[k]))
    top = moss.verts.new((HK_CX, HK_CY, 0.075))
    for k in range(40):
        moss.faces.new((rings[-1][k], rings[-1][(k + 1) % 40], top))
    rng = random.Random(1428)
    for k in range(9):
        a = 2.0 * math.pi * k / 9 + rng.uniform(-0.2, 0.2)
        add_sphere(b("cut_stone"), (HK_CX + ISLAND_RX * 0.98 * math.cos(a), HK_CY + ISLAND_RY * 0.98 * math.sin(a),
                                    WATER_Z), (0.05, 0.04, 0.025), subdiv=1, rot_z=a)


TOWER_SCALE = 1.3
TOWER_Z0 = 0.05


def _build_turtle_tower(b) -> None:
    rot = math.radians(45.0)  # Mặt tiền hướng Đông Nam → đón trực diện camera isometric
    S = TOWER_SCALE
    base = local_frame(HK_CX, HK_CY, rot)
    xy = (HK_CX, HK_CY)

    def Z(z):
        return TOWER_Z0 + (z - TOWER_Z0) * S

    def T(lx, ly, lz):
        return base(lx * S, ly * S, Z(lz))

    def box(key, lx, ly, lz, sx, sy, sz):
        add_box(b(key), T(lx, ly, lz), (sx * S, sy * S, sz * S), rot)

    def arch(lx, ly, z, w, h, face_rot):
        out = Vector((math.sin(rot + face_rot), -math.cos(rot + face_rot), 0.0))
        c0 = T(lx, ly, z)
        for key, grow, push in (("moss_slate", 0.022, 0.004), ("obsidian_glass", 0.0, 0.009)):
            c = c0 + out * push * S
            add_arched_opening(b(key), (c.x, c.y, c.z), (w + grow) * S, 0.012 * S, (h + grow * 0.5) * S,
                               rot_z=rot + face_rot)

    def roof(z, w, d, h, up):
        add_oriental_curved_roof(b("moss_slate"), xy, Z(z), w * S, d * S, h * S, corner_upturn=up * S, rot_z=rot)

    box("cut_stone", 0.0, 0.0, 0.075, 0.58, 0.46, 0.05)
    # Tầng 1: 3 cửa vòm cuốn mặt trước/sau, 1 cửa mỗi bên
    box("aged_stucco", 0.0, 0.0, 0.23, 0.46, 0.34, 0.26)
    for lx in (-0.13, 0.0, 0.13):
        arch(lx, -0.17, 0.205, 0.072, 0.17, 0.0)
        arch(lx, 0.17, 0.205, 0.072, 0.17, math.pi)
    for side in (-1, 1):
        arch(side * 0.23, 0.0, 0.205, 0.072, 0.17, side * math.pi * 0.5)
    box("moss_slate", 0.0, 0.0, 0.367, 0.50, 0.38, 0.02)
    roof(0.375, 0.62, 0.50, 0.075, 0.055)
    # Tầng 2: 2 cửa vòm cuốn
    box("aged_stucco", 0.0, 0.0, 0.51, 0.34, 0.25, 0.20)
    for lx in (-0.075, 0.075):
        arch(lx, -0.125, 0.515, 0.064, 0.13, 0.0)
        arch(lx, 0.125, 0.515, 0.064, 0.13, math.pi)
    for side in (-1, 1):
        arch(side * 0.17, 0.0, 0.515, 0.064, 0.13, side * math.pi * 0.5)
    box("moss_slate", 0.0, 0.0, 0.617, 0.38, 0.29, 0.018)
    roof(0.625, 0.48, 0.38, 0.065, 0.05)
    # Tầng 3: vọng lâu 4 cột + mái đao 4 góc cong vểnh
    box("aged_stucco", 0.0, 0.0, 0.705, 0.22, 0.22, 0.03)
    box("aged_stucco", 0.0, 0.0, 0.78, 0.15, 0.15, 0.12)
    for face in range(4):
        fr = face * math.pi * 0.5
        arch(0.075 * math.sin(fr), -0.075 * math.cos(fr), 0.775, 0.05, 0.085, fr)
    for sx in (-0.088, 0.088):
        for sy in (-0.088, 0.088):
            add_cylinder(b("aged_stucco"), T(sx, sy, 0.78), 0.014 * S, 0.014 * S, 0.12 * S, 8)
    roof(0.84, 0.36, 0.36, 0.14, 0.07)
    add_sphere(b("moss_slate"), T(0.0, 0.0, 0.995), (0.024 * S, 0.024 * S, 0.03 * S), subdiv=1)
    add_cylinder(b("moss_slate"), T(0.0, 0.0, 1.04), 0.008 * S, 0.002 * S, 0.07 * S, 6)


def _build_the_huc_bridge(b, boundary) -> None:
    x0 = HK_CX + ISLAND_RX - 0.05
    east = max(boundary, key=lambda p: p.x - abs(p.y - HK_CY) * 4.0)
    x1 = east.x + 0.14
    y = HK_CY
    path = [Vector((x0 + (x1 - x0) * i / 28, y, 0.035 + 0.145 * math.sin(math.pi * i / 28))) for i in range(29)]
    red = b("the_huc_red")
    sweep_profile(red, path, [(-0.11, -0.022), (0.11, -0.022), (0.11, 0.0), (-0.11, 0.0)], closed_path=False)
    for side in (-1.0, 1.0):
        rail = [p + Vector((0.0, side * 0.10, 0.075)) for p in path]
        add_tube_along(red, rail, 0.008, segments=6)
        mid = [p + Vector((0.0, side * 0.10, 0.035)) for p in path]
        add_tube_along(red, mid, 0.005, segments=5)
        for i in range(1, 28):
            p = path[i]
            add_box(red, (p.x, p.y + side * 0.10, p.z + 0.037), (0.008, 0.008, 0.075))
    for t in (0.22, 0.42, 0.58, 0.78):
        i = int(round(t * 28))
        p = path[i]
        for side in (-0.07, 0.07):
            h = p.z - 0.022 - WATER_Z
            add_box(red, (p.x, p.y + side, WATER_Z + h * 0.5), (0.022, 0.022, h))
    # 4 trụ đèn lồng phát sáng ấm ở hai đầu cầu
    for p in (path[0], path[-1]):
        for side in (-0.135, 0.135):
            add_box(red, (p.x, p.y + side, p.z + 0.08), (0.036, 0.036, 0.16))
            add_box(b("lamp_glow"), (p.x, p.y + side, p.z + 0.185), (0.05, 0.05, 0.05))
            add_cylinder(red, (p.x, p.y + side, p.z + 0.228), 0.045, 0.004, 0.04, 4, math.pi * 0.25)


def _build_lakeside(b, boundary, clearance) -> None:
    nrm = path_normals_xy(boundary, closed=True)
    rng = random.Random(1010)
    n = len(boundary)
    for k in range(0, n, 3):
        th = 2.0 * math.pi * k / n
        if abs(math.atan2(math.sin(th), math.cos(th))) < 0.16:
            continue  # chừa lối lên cầu Thê Húc
        p, nv = boundary[k], nrm[k]
        add_willow(b, p.x + nv.x * 0.17, p.y + nv.y * 0.17, -nv, rng.uniform(0.9, 1.1))
        clearance.add_circle(p.x + nv.x * 0.17, p.y + nv.y * 0.17, 0.16)
        if k % 6 == 3:
            q = boundary[(k + 1) % n]
            yaw = math.atan2(nv.y, nv.x) + math.pi * 0.5
            add_stone_bench(b, q.x + nv.x * 0.33, q.y + nv.y * 0.33, yaw)
    for k in range(0, n, 16):
        p, nv = boundary[k], nrm[k]
        fx, fy = p.x + nv.x * 0.62, p.y + nv.y * 0.62
        if clearance.is_free(fx, fy, 0.10) and fx > 0.9:
            add_flowerbed(b, fx, fy, 0.11, rng)
            clearance.add_circle(fx, fy, 0.16)


def build_hoan_kiem_quarter(coll, mats, clearance) -> None:
    boundary = hoan_kiem_boundary()
    _build_lake_body(coll, mats, boundary)
    b = MeshBatch("GEO_HN_HoanKiem", mats, coll)
    _build_ngoc_island(b)
    _build_turtle_tower(b)
    _build_the_huc_bridge(b, boundary)
    clearance.add_predicate(lambda x, y, m: is_in_hoan_kiem(x, y, 0.42 + m))
    _build_lakeside(b, boundary, clearance)
    b.commit()
