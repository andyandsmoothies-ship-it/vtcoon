# -*- coding: utf-8 -*-
"""Nền móng: khung bàn cờ 18m, thảm cỏ 8.12m, sông kinh tuyến Bắc–Nam, Trống Đồng Đông Sơn, xúc xắc."""

import math

import bmesh
from mathutils import Euler, Matrix, Vector

from .core import MeshBatch, add_box, add_cylinder, add_ring, add_sphere, create_mesh_object, sweep_profile

TURF_HALF = 8.12
DISC_CLEAR_R = 1.95
RIVER_Y_GAP = 2.0  # sông đi ngầm dưới bệ trống đồng ở |y| < RIVER_Y_GAP


# -----------------------------------------------------------------------------
# Sông kinh tuyến 12h → 6h (ranh giới Hà Nội Đông / TP.HCM Tây)
# -----------------------------------------------------------------------------
def river_center_x(y: float) -> float:
    return 0.30 * math.sin(0.42 * y)


def river_half_width(y: float) -> float:
    return 0.48 + 0.06 * math.cos(0.7 * y)


def river_bank_path(side: int, y_from: float, y_to: float, steps: int = 40) -> list[Vector]:
    """side=+1 bờ Đông (Hà Nội), side=-1 bờ Tây (Sài Gòn). Điểm chạy từ Nam lên Bắc."""
    pts = []
    for i in range(steps + 1):
        y = y_from + (y_to - y_from) * i / steps
        pts.append(Vector((river_center_x(y) + side * river_half_width(y), y, 0.0)))
    return pts


def is_in_river(x: float, y: float, margin: float = 0.0) -> bool:
    return abs(x - river_center_x(y)) < river_half_width(y) + 0.10 + margin and abs(y) > RIVER_Y_GAP - 0.3


# -----------------------------------------------------------------------------
# Khung gỗ óc chó 18m & viền đồng (collection chassis — không xuất GLB)
# -----------------------------------------------------------------------------
def build_board_chassis(coll_chassis, mats) -> None:
    b = MeshBatch("GEO_Board_Chassis", mats, coll_chassis)
    add_box(b("walnut"), (0.0, 0.0, -0.14), (18.2, 18.2, 0.16))
    for cx, cy, sx, sy in ((0.0, -8.775, 18.0, 0.45), (0.0, 8.775, 18.0, 0.45),
                           (-8.775, 0.0, 0.45, 17.1), (8.775, 0.0, 0.45, 17.1)):
        add_box(b("walnut"), (cx, cy, 0.045), (sx, sy, 0.13))
    for half_r, thick, z_top in ((9.04, 0.08, 0.115), (8.54, 0.035, 0.052), (6.76, 0.055, 0.055)):
        span = half_r * 2.0
        for cx, cy, sx, sy in ((0.0, -half_r, span, thick), (0.0, half_r, span, thick),
                               (-half_r, 0.0, thick, span), (half_r, 0.0, thick, span)):
            add_box(b("brass"), (cx, cy, z_top * 0.5), (sx, sy, z_top))
    for k in range(10):
        d = -6.75 + k * 1.50
        add_box(b("brass"), (d, -7.65, 0.025), (0.028, 1.78, 0.048))
        add_box(b("brass"), (d, 7.65, 0.025), (0.028, 1.78, 0.048))
        add_box(b("brass"), (-7.65, d, 0.025), (1.78, 0.028, 0.048))
        add_box(b("brass"), (7.65, d, 0.025), (1.78, 0.028, 0.048))
    for cx, cy, sx, sy in ((0.0, -7.65, 17.1, 1.80), (0.0, 7.65, 17.1, 1.80),
                           (-7.65, 0.0, 1.80, 13.5), (7.65, 0.0, 1.80, 13.5)):
        add_box(b("parchment_tile"), (cx, cy, 0.018), (sx, sy, 0.040))
    b.commit()


# -----------------------------------------------------------------------------
# Thảm cỏ, mặt sông, bờ kè đá đẽo
# -----------------------------------------------------------------------------
def build_terrain_and_river(coll, mats) -> None:
    bm = bmesh.new()
    res = 96
    grid = []
    for iy in range(res + 1):
        y = -TURF_HALF + 2.0 * TURF_HALF * iy / res
        row = []
        for ix in range(res + 1):
            x = -TURF_HALF + 2.0 * TURF_HALF * ix / res
            z = 0.0
            r_center = math.hypot(x, y)
            if r_center < DISC_CLEAR_R:
                z = -0.045 if r_center < 1.85 else (-0.045 * (1.0 - (r_center - 1.85) / (DISC_CLEAR_R - 1.85)))
            elif ((x - 3.4) / 2.1) ** 2 + ((y - 0.8) / 2.6) ** 2 < 1.05:
                d_lake = math.sqrt(((x - 3.4) / 2.1) ** 2 + ((y - 0.8) / 2.6) ** 2) - 1.0
                z = -0.045 if d_lake <= 0.0 else (-0.045 * (1.0 - d_lake / 0.05) if d_lake < 0.05 else 0.0)
            elif abs(y) >= RIVER_Y_GAP - 0.25:
                d = abs(x - river_center_x(y)) - river_half_width(y)
                z = -0.045 if d <= 0.0 else (-0.045 * (1.0 - d / 0.14) if d < 0.14 else 0.0)
            row.append(bm.verts.new((x, y, z)))
        grid.append(row)
    for iy in range(res):
        for ix in range(res):
            bm.faces.new((grid[iy][ix], grid[iy][ix + 1], grid[iy + 1][ix + 1], grid[iy + 1][ix]))
    create_mesh_object("GEO_Turf_Royal_Emerald_8m12", bm, mats["turf"], coll)

    b = MeshBatch("GEO_River_Meridian", mats, coll)
    for y0, y1 in ((-TURF_HALF, -RIVER_Y_GAP + 0.15), (RIVER_Y_GAP - 0.15, TURF_HALF)):
        west = river_bank_path(-1, y0, y1, 48)
        east = river_bank_path(1, y0, y1, 48)
        bmw = b("river_water")
        lv = [bmw.verts.new((p.x - 0.05, p.y, -0.030)) for p in west]
        rv = [bmw.verts.new((p.x + 0.05, p.y, -0.030)) for p in east]
        for i in range(len(lv) - 1):
            bmw.faces.new((lv[i], rv[i], rv[i + 1], lv[i + 1]))
        quay = [(-0.02, -0.05), (0.10, -0.05), (0.10, 0.045), (-0.02, 0.045)]
        for side, pts in ((-1, west), (1, east)):
            clipped = [p for p in pts if abs(p.y) >= RIVER_Y_GAP]
            if side < 0:
                clipped = list(reversed(clipped))  # để pháp tuyến phải hướng ra xa lòng sông
            sweep_profile(b("cut_stone"), clipped, quay, closed_path=False)
    b.commit()


# -----------------------------------------------------------------------------
# Đĩa Trống Đồng Đông Sơn mạ vàng (tâm 0,0,0)
# -----------------------------------------------------------------------------
def _lac_bird_outline() -> list[tuple[float, float]]:
    """Chim Lạc cách điệu: mỏ dài, mào, cánh xoè, đuôi chẻ (hướng +X)."""
    return [(0.150, 0.000), (0.070, 0.016), (0.045, 0.034), (0.030, 0.020), (-0.010, 0.068),
            (-0.045, 0.058), (-0.030, 0.018), (-0.090, 0.030), (-0.125, 0.052), (-0.112, 0.008),
            (-0.130, -0.030), (-0.080, -0.014), (-0.030, -0.022), (0.040, -0.014)]


def build_dong_son_drum(coll, mats) -> None:
    b = MeshBatch("GEO_DongSon_Drum", mats, coll)
    add_cylinder(b("dark_granite"), (0.0, 0.0, 0.002), 1.82, 1.82, 0.02, segments=96)
    add_ring(b("brass"), (0.0, 0.0), 1.86, 1.80, -0.008, 0.020, segments=96)
    add_cylinder(b("bronze_base"), (0.0, 0.0, 0.021), 1.68, 1.68, 0.018, segments=96)
    gold = b("dong_son_gold")
    for r_out, r_in, z_top in ((1.68, 1.60, 0.048), (1.40, 1.35, 0.044), (1.00, 0.95, 0.044), (0.66, 0.62, 0.046)):
        add_ring(gold, (0.0, 0.0), r_out, r_in, 0.028, z_top, segments=96)
    # Ngôi sao 14 cánh sắc nét ở tâm
    rays, r_valley, r_tip = 14, 0.20, 0.58
    top_c = gold.verts.new((0.0, 0.0, 0.074))
    ring_b, ring_t = [], []
    for k in range(rays * 2):
        a = k * math.pi / rays
        r = r_tip if k % 2 == 0 else r_valley
        ring_b.append(gold.verts.new((r * math.cos(a), r * math.sin(a), 0.028)))
        ring_t.append(gold.verts.new((r * math.cos(a), r * math.sin(a), 0.058)))
    n = len(ring_t)
    for k in range(n):
        kn = (k + 1) % n
        gold.faces.new((top_c, ring_t[k], ring_t[kn]))
        gold.faces.new((ring_b[k], ring_b[kn], ring_t[kn], ring_t[k]))
    # Vành răng cưa giữa 1.40–1.60
    for k in range(48):
        a0, a1 = 2.0 * math.pi * k / 48, 2.0 * math.pi * (k + 0.5) / 48
        v = [gold.verts.new((r * math.cos(a), r * math.sin(a), z)) for r, a, z in
             ((1.44, a0, 0.030), (1.44, a1, 0.030), (1.56, (a0 + a1) * 0.5, 0.030),
              (1.44, a0, 0.042), (1.44, a1, 0.042), (1.56, (a0 + a1) * 0.5, 0.042))]
        gold.faces.new((v[0], v[1], v[2]))
        gold.faces.new((v[5], v[4], v[3]))
        for i, j in ((0, 1), (1, 2), (2, 0)):
            gold.faces.new((v[i], v[j], v[j + 3], v[i + 3]))
    # 10 chim Lạc bay ngược chiều kim đồng hồ trên vành 0.95–1.35
    outline = _lac_bird_outline()
    for k in range(10):
        a = 2.0 * math.pi * k / 10
        heading = a + math.pi * 0.5  # tiếp tuyến CCW
        ch, sh = math.cos(heading), math.sin(heading)
        cx, cy = 1.17 * math.cos(a), 1.17 * math.sin(a)
        bot = [gold.verts.new((cx + px * ch - py * sh, cy + px * sh + py * ch, 0.028)) for px, py in outline]
        top = [gold.verts.new((cx + px * ch - py * sh, cy + px * sh + py * ch, 0.050)) for px, py in outline]
        gold.faces.new(list(reversed(bot)))
        gold.faces.new(top)
        for i in range(len(outline)):
            j = (i + 1) % len(outline)
            gold.faces.new((bot[i], bot[j], top[j], top[i]))
    # 16 hoạ tiết vân tròn đồng tâm giữa vòng 0.66–0.95
    for k in range(16):
        a = 2.0 * math.pi * (k + 0.5) / 16
        add_ring(gold, (0.80 * math.cos(a), 0.80 * math.sin(a)), 0.07, 0.045, 0.028, 0.044, segments=16)
    b.commit()


def build_static_dice(coll_dice, mats) -> None:
    b = MeshBatch("GEO_Ruby_Dice", mats, coll_dice)
    for pos, rot in (((-0.36, -0.22, 0.17), Euler((0.20, -0.16, 0.45))),
                     ((0.34, 0.26, 0.18), Euler((-0.18, 0.22, -0.52)))):
        m = Matrix.Translation(Vector(pos)) @ rot.to_matrix().to_4x4()
        bmesh.ops.create_cube(b("ruby_red"), size=0.21, matrix=m)
        for px, py in ((-0.05, -0.05), (0.05, 0.05), (0.0, 0.0), (-0.05, 0.05), (0.05, -0.05)):
            add_sphere(b("porcelain"), m @ Vector((px, py, 0.106)), (0.018, 0.018, 0.018), subdiv=1)
    b.commit()
