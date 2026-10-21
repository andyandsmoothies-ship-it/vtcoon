# -*- coding: utf-8 -*-
"""Nền móng: khung bàn cờ 18m, thảm cỏ 8.12m, sông Sài Gòn ôm rìa Tây–Nam, Cầu Ba Son, Trống Đồng Đông Sơn & đại lộ."""

import math

import bmesh
from mathutils import Euler, Matrix, Vector

from .core import (MeshBatch, add_box, add_cylinder, add_cylinder_between, add_ring, add_sphere, add_tube_along,
                   create_mesh_object, local_frame, path_normals_xy, sweep_profile)

TURF_HALF = 8.12
DISC_CLEAR_R = 1.95
BASON_X, BASON_Y, BASON_ROT = -2.25, -4.45, math.radians(90.0)
BASON_NW_X, BASON_NW_Y, BASON_NW_ROT = -5.65, 2.75, 0.0
RIVER_HALF_W = 0.72

# Sông Sài Gòn uốn cong mềm mại ôm sát rìa Tây (X ~ -5.75) vòng qua mũi bán đảo Bitexco xuống Nam (Y ~ -4.45)
RIVER_CTRL = [
    (-5.75, 6.50),
    (-5.75, 3.80),
    (-5.70, 1.00),
    (-5.55, -1.55),
    (-4.85, -3.55),
    (-3.65, -4.30),
    (-2.15, -4.45),
    (-0.95, -4.50),
]


def _catmull2d(p0: Vector, p1: Vector, p2: Vector, p3: Vector, t: float) -> Vector:
    t2, t3 = t * t, t * t * t
    return 0.5 * ((2.0 * p1) + (-p0 + p2) * t + (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * t2
                  + (-p0 + 3.0 * p1 - 3.0 * p2 + p3) * t3)


def sample_river_centerline(steps: int = 42) -> list[Vector]:
    ctrl = [Vector((x, y, 0.0)) for x, y in RIVER_CTRL]
    ext = [ctrl[0] * 2.0 - ctrl[1]] + ctrl + [ctrl[-1] * 2.0 - ctrl[-2]]
    pts = []
    segs = len(ext) - 3
    per_seg = max(2, steps // segs)
    for i in range(1, len(ext) - 2):
        for k in range(per_seg):
            pts.append(_catmull2d(ext[i - 1], ext[i], ext[i + 1], ext[i + 2], k / float(per_seg)))
    pts.append(ctrl[-1].copy())
    return pts


_RIVER_CACHE = sample_river_centerline(56)
_RIVER_NORMALS = path_normals_xy(_RIVER_CACHE, closed=False)


def river_distance_and_side(x: float, y: float) -> tuple[float, float]:
    """Trả về (khoảng cách ngắn nhất tới tâm sông, độ lệch có dấu theo pháp tuyến bờ trong/ngoài)."""
    best_d = 1e9
    best_signed = 0.0
    p_query = Vector((x, y, 0.0))
    for i in range(len(_RIVER_CACHE) - 1):
        a = _RIVER_CACHE[i]
        b = _RIVER_CACHE[i + 1]
        ab = b - a
        ab_len2 = max(1e-8, ab.length_squared)
        t = max(0.0, min(1.0, (p_query - a).dot(ab) / ab_len2))
        proj = a + ab * t
        diff = p_query - proj
        d = diff.length
        if d < best_d:
            best_d = d
            nrm = _RIVER_NORMALS[i].lerp(_RIVER_NORMALS[i + 1], t).normalized()
            best_signed = diff.dot(nrm)
    return best_d, best_signed


def is_in_river(x: float, y: float, margin: float = 0.0) -> bool:
    d, _ = river_distance_and_side(x, y)
    return d < (RIVER_HALF_W + 0.10 + margin)


def river_bank_path(side: int, steps: int = 42) -> list[Vector]:
    """side=+1: bờ trong (phía trung tâm TP.HCM / Bitexco); side=-1: bờ ngoài (phía rìa bàn cờ)."""
    center = sample_river_centerline(steps)
    nrms = path_normals_xy(center, closed=False)
    return [Vector((p.x + n.x * side * RIVER_HALF_W, p.y + n.y * side * RIVER_HALF_W, 0.0))
            for p, n in zip(center, nrms)]


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


def _paved_avenue(b, p0: tuple[float, float], p1: tuple[float, float], road_w: float = 0.44,
                  sidewalk_w: float = 0.64) -> None:
    """Đại lộ trải nhựa phẳng mịn có vỉa hè lát đá và bó vỉa (curbed sidewalk + paved asphalt road)."""
    dx, dy = p1[0] - p0[0], p1[1] - p0[1]
    yaw = math.atan2(dy, dx)
    length = math.hypot(dx, dy)
    cx, cy = (p0[0] + p1[0]) * 0.5, (p0[1] + p1[1]) * 0.5
    add_box(b("cut_stone"), (cx, cy, 0.008), (length + 0.08, sidewalk_w + 0.06, 0.016), yaw)
    add_box(b("granite_paving"), (cx, cy, 0.012), (length + 0.04, sidewalk_w, 0.016), yaw)
    add_box(b("asphalt_road"), (cx, cy, 0.016), (length, road_w, 0.012), yaw)
    n_dashes = max(2, int(length / 0.44))
    for k in range(n_dashes):
        f = (k + 0.5) / float(n_dashes)
        px, py = p0[0] + dx * f, p0[1] + dy * f
        add_box(b("porcelain"), (px, py, 0.023), (0.16, 0.020, 0.004), yaw)


def _manicured_lawn_parcel(b, cx: float, cy: float, sx: float, sy: float, rot_deg: float = 0.0) -> None:
    """Thảm cỏ công viên cắt tỉa gọn gàng có bó vỉa đá bo viền song song cạnh bàn cờ."""
    yaw = math.radians(rot_deg)
    add_box(b("cut_stone"), (cx, cy, 0.010), (sx + 0.12, sy + 0.12, 0.020), yaw)
    add_box(b("granite_paving"), (cx, cy, 0.014), (sx + 0.06, sy + 0.06, 0.016), yaw)
    add_box(b("foliage_moss"), (cx, cy, 0.020), (sx, sy, 0.014), yaw)


# -----------------------------------------------------------------------------
# Thảm cỏ công viên, sông Sài Gòn uốn lượn & Vòng xuyến trung tâm
# -----------------------------------------------------------------------------
def build_terrain_and_river(coll, mats) -> None:
    bm = bmesh.new()
    res = 22
    grid = []
    for iy in range(res + 1):
        y = -TURF_HALF + 2.0 * TURF_HALF * iy / res
        row = []
        for ix in range(res + 1):
            x = -TURF_HALF + 2.0 * TURF_HALF * ix / res
            z = 0.0
            r_center = math.hypot(x, y)
            d_riv, _ = river_distance_and_side(x, y)
            if r_center < DISC_CLEAR_R:
                z = -0.045 if r_center < 1.80 else (-0.045 * (1.0 - (r_center - 1.80) / (DISC_CLEAR_R - 1.80)))
            elif ((x - 2.55) / 1.85) ** 2 + ((y - 2.75) / 1.75) ** 2 < 1.05:
                d_lake = math.sqrt(((x - 2.55) / 1.85) ** 2 + ((y - 2.75) / 1.75) ** 2) - 1.0
                z = -0.045 if d_lake <= 0.0 else (-0.045 * (1.0 - d_lake / 0.05) if d_lake < 0.05 else 0.0)
            elif d_riv < RIVER_HALF_W + 0.16:
                d = d_riv - RIVER_HALF_W
                z = -0.045 if d <= 0.0 else (-0.045 * (1.0 - d / 0.16))
            row.append(bm.verts.new((x, y, z)))
        grid.append(row)
    for iy in range(res):
        for ix in range(res):
            bm.faces.new((grid[iy][ix], grid[iy][ix + 1], grid[iy + 1][ix + 1], grid[iy + 1][ix]))
    create_mesh_object("GEO_Turf_Royal_Emerald_8m12", bm, mats["turf"], coll)

    b = MeshBatch("GEO_River_Meridian", mats, coll)
    outer_bank = river_bank_path(-1, 30)
    inner_bank = river_bank_path(1, 30)
    bmw = b("river_water")
    lv = [bmw.verts.new((p.x, p.y, -0.026)) for p in outer_bank]
    rv = [bmw.verts.new((p.x, p.y, -0.026)) for p in inner_bank]
    for i in range(len(lv) - 1):
        bmw.faces.new((lv[i], rv[i], rv[i + 1], lv[i + 1]))

    # Kè đá & đường dạo bộ dọc hai bờ sông Sài Gòn (giới hạn trong lòng bàn cờ [-6.62, 6.62])
    quay = [(-0.02, -0.045), (0.14, -0.045), (0.14, 0.028), (0.04, 0.028), (0.04, 0.018), (-0.02, 0.018)]
    for side, pts in ((-1, outer_bank), (1, inner_bank)):
        clipped = [p for p in pts if abs(p.x) <= 6.62 and abs(p.y) <= 6.62]
        if side < 0:
            clipped = list(reversed(clipped))
        sweep_profile(b("cut_stone"), clipped, quay, closed_path=False)

    # Vòng xuyến đại lộ tròn bao quanh Quảng trường Trống Đồng (Central Circular Roundabout Avenue)
    add_ring(b("cut_stone"), (0.0, 0.0), 1.56, 1.48, -0.004, 0.024, segments=28)
    add_ring(b("asphalt_road"), (0.0, 0.0), 2.02, 1.56, -0.002, 0.016, segments=28)
    add_ring(b("granite_paving"), (0.0, 0.0), 2.18, 2.02, -0.002, 0.020, segments=28)
    add_ring(b("cut_stone"), (0.0, 0.0), 2.24, 2.16, -0.002, 0.026, segments=28)
    for k in range(24):
        ang = 2.0 * math.pi * k / 24.0
        if k % 2 == 0:
            add_box(b("porcelain"), (1.79 * math.cos(ang), 1.79 * math.sin(ang), 0.018),
                    (0.022, 0.16, 0.004), ang)

    # Hệ thống Đại lộ vuông góc theo trục bàn cờ (X / Y) kết nối Vòng xuyến trung tâm với 6 biểu tượng
    _paved_avenue(b, (-2.35, -1.65), (-2.35, -6.35), road_w=0.44, sidewalk_w=0.64)  # Đại lộ qua Cầu Ba Son Nam
    _paved_avenue(b, (-2.35, -1.65), (-1.45, -1.45), road_w=0.44, sidewalk_w=0.64)
    _paved_avenue(b, (-6.35, 2.75), (-1.45, 2.75), road_w=0.44, sidewalk_w=0.64)    # Đại lộ qua Cầu Ba Son Tây Bắc
    _paved_avenue(b, (-1.45, 2.75), (-1.45, 1.55), road_w=0.42, sidewalk_w=0.62)
    _paved_avenue(b, (-2.05, 0.25), (-4.25, 0.25), road_w=0.40, sidewalk_w=0.58)    # Đường giữa Bitexco & Đức Bà
    _paved_avenue(b, (2.02, 0.45), (5.85, 0.45), road_w=0.44, sidewalk_w=0.64)      # Đại lộ Tràng Tiền (giữa Hồ Gươm & Nhà Hát Lớn)
    _paved_avenue(b, (2.35, 0.45), (2.35, -4.85), road_w=0.44, sidewalk_w=0.64)     # Đại lộ trước Quảng trường Nhà Hát Lớn
    _paved_avenue(b, (-0.25, -2.02), (-0.25, -4.85), road_w=0.42, sidewalk_w=0.62)  # Đường cạnh Kỳ Đài Hà Nội
    _paved_avenue(b, (-0.25, 2.02), (-0.25, 5.45), road_w=0.42, sidewalk_w=0.62)    # Đại lộ Bắc Trung tâm

    # Các ô thảm cỏ công viên cắt tỉa vuông vắn song song cạnh bàn cờ (Manicured Green Park Lawns)
    for lx, ly, sx, sy in (
        (-2.85, -0.75, 1.65, 1.45),
        (-1.15, -3.15, 1.25, 1.55),
        (-1.65, 4.25, 1.85, 1.65),
        (0.95, 4.45, 1.55, 1.55),
        (1.15, 1.45, 1.15, 1.15),
        (3.25, 5.25, 2.25, 1.05),
    ):
        _manicured_lawn_parcel(b, lx, ly, sx, sy, 0.0)

    b.commit()


# -----------------------------------------------------------------------------
# Cầu dây văng Ba Son (Thủ Thiêm 2) — Bắc qua sông Sài Gòn
# -----------------------------------------------------------------------------
def _build_cable_stayed_bridge_at(b, cx: float, cy: float, rot: float, span_half: float = 1.25,
                                  pylon_z_top: float = 1.58) -> None:
    T = local_frame(cx, cy, rot)
    n_span = 12
    deck_pts = []
    for i in range(n_span + 1):
        u = i / float(n_span)
        lx = -span_half + 2.0 * span_half * u
        arch_z = 0.030 + 0.095 * math.sin(math.pi * u)
        deck_pts.append(T(lx, 0.0, arch_z))

    girder_prof = [
        (-0.23, 0.008), (-0.17, -0.024), (0.17, -0.024), (0.23, 0.008),
        (0.23, 0.022), (-0.23, 0.022),
    ]
    sweep_profile(b("porcelain"), deck_pts, girder_prof, closed_path=False)

    road_prof = [(-0.185, 0.022), (0.185, 0.022), (0.185, 0.030), (-0.185, 0.030)]
    sweep_profile(b("asphalt_road"), deck_pts, road_prof, closed_path=False)
    median_prof = [(-0.012, 0.030), (0.012, 0.030), (0.012, 0.038), (-0.012, 0.038)]
    sweep_profile(b("helipad_yellow"), deck_pts, median_prof, closed_path=False)

    perp_vec = Vector((-math.sin(rot), math.cos(rot), 0.0))
    for side in (-1.0, 1.0):
        rail_pts = [p + perp_vec * (side * 0.215) + Vector((0.0, 0.0, 0.042)) for p in deck_pts]
        add_tube_along(b("silver_steel"), rail_pts, 0.007, segments=4)
    # Dàn cột đèn đường đôi dọc hai lan can cầu dây văng Ba Son
    for idx_l in (2, 5, 7, 10):
        p_d = deck_pts[idx_l]
        for side in (-1.0, 1.0):
            lp = p_d + perp_vec * (side * 0.205)
            add_cylinder(b("silver_steel"), (lp.x, lp.y, lp.z + 0.065), 0.004, 0.003, 0.085, 4)
            add_box(b("lamp_glow"), (lp.x - perp_vec.x * side * 0.015, lp.y - perp_vec.y * side * 0.015, lp.z + 0.108),
                    (0.014, 0.022, 0.008), rot)

    for lx in (-span_half + 0.06, span_half - 0.06):
        add_box(b("cut_stone"), T(lx, 0.0, 0.022), (0.24, 0.54, 0.046), rot)

    pylon_lx0 = -0.12
    add_cylinder(b("cut_stone"), T(pylon_lx0, 0.0, -0.005), 0.17, 0.20, 0.064, segments=10)
    add_box(b("porcelain"), T(pylon_lx0, 0.0, 0.036), (0.18, 0.54, 0.036), rot)

    n_pylon = 10
    z_base = 0.045
    leg_left, leg_right = [], []
    for k in range(n_pylon + 1):
        s = k / float(n_pylon)
        lx_curve = pylon_lx0 + 0.30 * (s ** 1.18) + 0.040 * math.sin(s * math.pi)
        z_cur = z_base + (pylon_z_top - z_base) * s
        ly_spread = 0.215 * ((1.0 - s) ** 0.78) + 0.016
        leg_left.append(T(lx_curve, -ly_spread, z_cur))
        leg_right.append(T(lx_curve, ly_spread, z_cur))

    radii_leg = [0.034 * (1.0 - 0.38 * (k / float(n_pylon))) for k in range(n_pylon + 1)]
    add_tube_along(b("porcelain", smooth=True), leg_left, 0.024, segments=6, radii=radii_leg)
    add_tube_along(b("porcelain", smooth=True), leg_right, 0.024, segments=6, radii=radii_leg)

    for frac in (0.18, 0.38, 0.58, 0.78):
        idx = int(round(frac * n_pylon))
        add_cylinder_between(b("silver_steel"), leg_left[idx], leg_right[idx], 0.014 * (1.0 - 0.28 * frac), segments=4)

    top_mid = 0.5 * (leg_left[-1] + leg_right[-1])
    apex = T(pylon_lx0 + 0.35, 0.0, pylon_z_top + 0.08)
    add_cylinder_between(b("porcelain"), top_mid, apex, 0.024, 0.008, segments=6)
    add_sphere(b("lamp_glow"), apex, (0.014, 0.014, 0.014), subdiv=1)

    steel_cables = b("silver_steel")
    outer_lxs = (-1.04, -0.86, -0.68, -0.50, -0.34)
    inner_lxs = (0.16, 0.36, 0.56, 0.76, 0.94, 1.10)

    def _deck_z_local(lx_q: float) -> float:
        u = max(0.0, min(1.0, (lx_q + span_half) / (2.0 * span_half)))
        return 0.030 + 0.095 * math.sin(math.pi * u) + 0.024

    for idx, dlx in enumerate(outer_lxs):
        pi = min(n_pylon, int(round((0.48 + 0.50 * (idx / max(1, len(outer_lxs) - 1))) * n_pylon)))
        dz = _deck_z_local(dlx)
        add_cylinder_between(steel_cables, leg_left[pi], T(dlx, -0.195, dz), 0.0040, segments=4)
        add_cylinder_between(steel_cables, leg_right[pi], T(dlx, 0.195, dz), 0.0040, segments=4)

    for idx, dlx in enumerate(inner_lxs):
        pi = min(n_pylon, int(round((0.50 + 0.48 * (idx / max(1, len(inner_lxs) - 1))) * n_pylon)))
        dz = _deck_z_local(dlx)
        add_cylinder_between(steel_cables, leg_left[pi], T(dlx, -0.195, dz), 0.0040, segments=4)
        add_cylinder_between(steel_cables, leg_right[pi], T(dlx, 0.195, dz), 0.0040, segments=4)


def build_bason_bridge(coll, mats) -> None:
    """Xây dựng Cầu dây văng Ba Son bắc qua sông Sài Gòn ở cả nhánh Tây Nam và nhánh Tây Bắc như ảnh mẫu."""
    b = MeshBatch("GEO_BaSon_Bridge", mats, coll)
    _build_cable_stayed_bridge_at(b, BASON_X, BASON_Y, BASON_ROT, span_half=1.22, pylon_z_top=1.56)
    _build_cable_stayed_bridge_at(b, BASON_NW_X, BASON_NW_Y, BASON_NW_ROT, span_half=1.22, pylon_z_top=1.52)
    b.commit()


# -----------------------------------------------------------------------------
# Đĩa Trống Đồng Đông Sơn mạ vàng (tâm 0,0,0 — bán kính chuẩn R = 1.48m)
# -----------------------------------------------------------------------------
def _lac_bird_outline() -> list[tuple[float, float]]:
    return [
        (0.140, 0.002), (0.068, 0.014), (0.044, 0.032), (0.025, 0.018),
        (-0.008, 0.065), (-0.042, 0.056), (-0.028, 0.016), (-0.082, 0.028),
        (-0.118, 0.048), (-0.104, 0.006), (-0.122, -0.028), (-0.075, -0.012),
        (-0.026, -0.020), (0.036, -0.012),
    ]


def _warrior_outline() -> list[tuple[float, float]]:
    return [
        (0.052, 0.000), (0.038, 0.022), (0.075, 0.042), (0.024, 0.036),
        (0.010, 0.052), (-0.018, 0.038), (-0.055, 0.046), (-0.042, 0.015),
        (-0.062, -0.018), (-0.028, -0.036), (0.016, -0.030), (0.042, -0.018),
    ]


def _extrude_radial_motif(bm, cx: float, cy: float, heading: float, outline: list[tuple[float, float]],
                          z_bot: float, z_top: float) -> None:
    ch, sh = math.cos(heading), math.sin(heading)
    bot = [bm.verts.new((cx + px * ch - py * sh, cy + px * sh + py * ch, z_bot)) for px, py in outline]
    top = [bm.verts.new((cx + px * ch - py * sh, cy + px * sh + py * ch, z_top)) for px, py in outline]
    bm.faces.new(list(reversed(bot)))
    bm.faces.new(top)
    n = len(outline)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((bot[i], bot[j], top[j], top[i]))


def build_dong_son_drum(coll, mats) -> None:
    b = MeshBatch("GEO_DongSon_Drum", mats, coll)
    add_cylinder(b("dark_granite"), (0.0, 0.0, 0.002), 1.54, 1.54, 0.018, segments=28)
    add_ring(b("brass"), (0.0, 0.0), 1.54, 1.48, -0.006, 0.020, segments=28)
    add_cylinder(b("bronze_base"), (0.0, 0.0, 0.019), 1.48, 1.48, 0.016, segments=28)

    gold = b("dong_son_gold")
    for r_out, r_in, z_top in (
        (1.48, 1.43, 0.042),
        (1.31, 1.28, 0.039),
        (1.01, 0.98, 0.039),
        (0.75, 0.72, 0.039),
        (0.55, 0.52, 0.040),
    ):
        add_ring(gold, (0.0, 0.0), r_out, r_in, 0.026, z_top, segments=28)

    rays, r_valley, r_tip = 14, 0.17, 0.49
    top_c = gold.verts.new((0.0, 0.0, 0.056))
    ring_b, ring_t = [], []
    for k in range(rays * 2):
        a = k * math.pi / rays
        r = r_tip if k % 2 == 0 else r_valley
        ring_b.append(gold.verts.new((r * math.cos(a), r * math.sin(a), 0.026)))
        ring_t.append(gold.verts.new((r * math.cos(a), r * math.sin(a), 0.046)))
    n = len(ring_t)
    for k in range(n):
        kn = (k + 1) % n
        gold.faces.new((top_c, ring_t[k], ring_t[kn]))
        gold.faces.new((ring_b[k], ring_b[kn], ring_t[kn], ring_t[k]))

    for k in range(rays):
        a_mid = (k + 0.5) * 2.0 * math.pi / rays
        da = 0.065
        v = [
            gold.verts.new((0.27 * math.cos(a_mid), 0.27 * math.sin(a_mid), z))
            for z in (0.026, 0.036)
        ] + [
            gold.verts.new((0.46 * math.cos(a_mid - da), 0.46 * math.sin(a_mid - da), z))
            for z in (0.026, 0.036)
        ] + [
            gold.verts.new((0.46 * math.cos(a_mid + da), 0.46 * math.sin(a_mid + da), z))
            for z in (0.026, 0.036)
        ]
        gold.faces.new((v[0], v[4], v[2]))
        gold.faces.new((v[1], v[3], v[5]))
        for i0, i1 in ((0, 2), (2, 4), (4, 0)):
            gold.faces.new((v[i0], v[i1], v[i1 + 1], v[i0 + 1]))

    for k in range(10):
        a = 2.0 * math.pi * (k + 0.5) / 10
        add_ring(gold, (0.635 * math.cos(a), 0.635 * math.sin(a)), 0.052, 0.030, 0.026, 0.038, segments=6)

    warrior_prof = _warrior_outline()
    for k in range(8):
        a = 2.0 * math.pi * k / 8
        heading = a + math.pi * 0.5
        _extrude_radial_motif(gold, 0.865 * math.cos(a), 0.865 * math.sin(a), heading, warrior_prof, 0.026, 0.041)

    bird_prof = _lac_bird_outline()
    for k in range(8):
        a = 2.0 * math.pi * k / 8
        heading = a + math.pi * 0.5
        _extrude_radial_motif(gold, 1.145 * math.cos(a), 1.145 * math.sin(a), heading, bird_prof, 0.026, 0.043)

    for k in range(24):
        a0, a1 = 2.0 * math.pi * k / 24, 2.0 * math.pi * (k + 0.6) / 24
        v = [gold.verts.new((r * math.cos(a), r * math.sin(a), z)) for r, a, z in
             ((1.32, a0, 0.026), (1.32, a1, 0.026), (1.42, (a0 + a1) * 0.5, 0.026),
              (1.32, a0, 0.038), (1.32, a1, 0.038), (1.42, (a0 + a1) * 0.5, 0.038))]
        gold.faces.new((v[0], v[1], v[2]))
        gold.faces.new((v[5], v[4], v[3]))
        for i0, i1 in ((0, 1), (1, 2), (2, 0)):
            gold.faces.new((v[i0], v[i1], v[i1 + 3], v[i0 + 3]))

    for k in range(4):
        a = k * math.pi * 0.5 + math.pi * 0.25
        fx_d, fy_d = 1.445 * math.cos(a), 1.445 * math.sin(a)
        # Bệ tượng cóc thần cầu mưa 3D (Bronze Rain Toad Sculpture) đặc trưng trên mặt rìa trống đồng Ngọc Lũ
        add_box(gold, (fx_d, fy_d, 0.036), (0.065, 0.085, 0.014), a)
        add_sphere(gold, (fx_d, fy_d, 0.052), (0.028, 0.038, 0.020), subdiv=0, rot_z=a)
        add_sphere(gold, (fx_d - 0.018 * math.sin(a), fy_d + 0.018 * math.cos(a), 0.062),
                   (0.020, 0.022, 0.015), subdiv=0, rot_z=a)
    b.commit()


def build_static_dice(coll_dice, mats) -> None:
    b = MeshBatch("GEO_Static_Dice", mats, coll_dice)
    half = 0.095
    offs = {1: [(0, 0)], 2: [(-1, -1), (1, 1)], 3: [(-1, -1), (0, 0), (1, 1)],
            4: [(-1, -1), (1, -1), (-1, 1), (1, 1)], 5: [(-1, -1), (1, -1), (0, 0), (-1, 1), (1, 1)],
            6: [(-1, -1), (1, -1), (-1, 0), (1, 0), (-1, 1), (1, 1)]}
    faces = [(Vector((0, 0, 1)), Vector((1, 0, 0)), Vector((0, 1, 0)), 1),
             (Vector((0, 0, -1)), Vector((1, 0, 0)), Vector((0, -1, 0)), 6),
             (Vector((0, -1, 0)), Vector((1, 0, 0)), Vector((0, 0, 1)), 2),
             (Vector((0, 1, 0)), Vector((-1, 0, 0)), Vector((0, 0, 1)), 5),
             (Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1)), 3),
             (Vector((-1, 0, 0)), Vector((0, -1, 0)), Vector((0, 0, 1)), 4)]
    for pos, yaw in (((-0.25, 0.10, 0.125), 0.35), ((0.22, -0.12, 0.125), -0.52)):
        add_box(b("dong_son_gold"), pos, (half * 2, half * 2, half * 2), yaw)
        rot = Euler((0.0, 0.0, yaw), "XYZ").to_matrix()
        c = Vector(pos)
        for nrm, u, v, pip in faces:
            rn, ru, rv = rot @ nrm, rot @ u, rot @ v
            fc = c + rn * (half + 0.002)
            for du, dv in offs[pip]:
                add_sphere(b("dark_granite"), fc + ru * (du * 0.045) + rv * (dv * 0.045), (0.015, 0.015, 0.015), subdiv=1)
    b.commit()
