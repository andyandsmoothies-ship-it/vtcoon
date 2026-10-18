# -*- coding: utf-8 -*-
"""Tuyến Metro trên cao hình chữ S Tây → Đông, 10 trụ chữ T và đoàn tàu Toybox 3 toa."""

import math

from mathutils import Vector

from .core import MeshBatch, add_box, add_cylinder, sweep_profile
from .foundation import is_in_river
from .hanoi import is_in_hoan_kiem

DECK_Z = 0.44
GIRDER_HALF = 0.175

# Điểm điều khiển (Blender XY): Tây Bắc → vòng qua Bitexco → vượt sông phía Nam trống đồng
# → lướt giữa Hồ Gươm & Cột Cờ → ôm mép ngoài phía Đông Hồ Hoàn Kiếm → kết thúc phía Bắc Hà Nội.
METRO_CTRL = [
    (-6.60, 5.05), (-5.30, 4.55), (-3.50, 3.60), (-2.10, 2.85), (-1.75, 1.45), (-2.25, -0.10),
    (-1.65, -1.85), (-0.35, -2.55), (1.10, -2.50), (2.70, -2.48), (4.30, -2.44), (5.65, -1.70),
    (6.12, 0.20), (6.00, 2.40), (5.05, 3.95), (3.40, 4.75), (2.15, 5.55), (1.55, 6.60),
]


def _catmull(p0, p1, p2, p3, t):
    t2, t3 = t * t, t * t * t
    return 0.5 * ((2.0 * p1) + (-p0 + p2) * t + (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * t2
                  + (-p0 + 3.0 * p1 - 3.0 * p2 + p3) * t3)


def sample_metro_path(per_span: int = 14) -> list[Vector]:
    ctrl = [Vector((x, y, DECK_Z)) for x, y in METRO_CTRL]
    ext = [ctrl[0] * 2.0 - ctrl[1]] + ctrl + [ctrl[-1] * 2.0 - ctrl[-2]]
    pts = []
    for i in range(1, len(ext) - 2):
        for k in range(per_span):
            pts.append(_catmull(ext[i - 1], ext[i], ext[i + 1], ext[i + 2], k / per_span))
    pts.append(ctrl[-1].copy())
    return pts


def _arc_lengths(pts):
    acc = [0.0]
    for i in range(1, len(pts)):
        acc.append(acc[-1] + (pts[i] - pts[i - 1]).length)
    return acc


def _frame_at(pts, acc, s):
    """Nội suy vị trí & tiếp tuyến tại độ dài cung s."""
    s = max(0.0, min(acc[-1], s))
    i = max(1, next((k for k in range(1, len(acc)) if acc[k] >= s), len(acc) - 1))
    t = (s - acc[i - 1]) / max(1e-6, acc[i] - acc[i - 1])
    pos = pts[i - 1].lerp(pts[i], t)
    tang = Vector((pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y, 0.0)).normalized()
    return pos, tang


def _train_car(b, center: Vector, tang: Vector, nose_dir: int) -> None:
    """Toa Toybox bo tròn 0.60m: thân trắng sứ, sọc cyan, kính đen, đèn pha LED."""
    right = Vector((tang.y, -tang.x, 0.0))

    def at(lx, ly, lz):
        return center + tang * lx + right * ly + Vector((0.0, 0.0, lz))

    section = [(-0.118, -0.100), (0.118, -0.100), (0.126, -0.020), (0.122, 0.066), (0.094, 0.110),
               (-0.094, 0.110), (-0.122, 0.066), (-0.126, -0.020)]
    x0 = -0.21 if nose_dir == -1 else -0.285
    x1 = 0.21 if nose_dir == 1 else 0.285
    stations = []
    if nose_dir == -1:
        stations += [(x0 - 0.11 * (k / 5) ** 0.85, math.cos(k / 5 * math.pi * 0.44),
                      math.cos(k / 5 * math.pi * 0.40), -0.026 * (k / 5) ** 1.4) for k in range(5, 0, -1)]
    stations += [(x0, 1.0, 1.0, 0.0), (x1, 1.0, 1.0, 0.0)]
    if nose_dir == 1:
        stations += [(x1 + 0.11 * (k / 5) ** 0.85, math.cos(k / 5 * math.pi * 0.44),
                      math.cos(k / 5 * math.pi * 0.40), -0.026 * (k / 5) ** 1.4) for k in range(1, 6)]
    body = b("porcelain", smooth=True)
    rings = [[body.verts.new(at(sx, cy * sy, cz * sz + dz)) for cy, cz in section] for sx, sy, sz, dz in stations]
    for i in range(len(rings) - 1):
        for j in range(len(section)):
            jn = (j + 1) % len(section)
            body.faces.new((rings[i][j], rings[i + 1][j], rings[i + 1][jn], rings[i][jn]))
    body.faces.new(list(reversed(rings[0])))
    body.faces.new(rings[-1])

    yaw = math.atan2(tang.y, tang.x)
    span = (x1 - x0) + (0.06 if nose_dir else -0.02)
    mid = 0.5 * (x0 + x1) + 0.02 * nose_dir
    add_box(b("obsidian_glass"), at(mid, 0.0, 0.026), (span, 0.256, 0.066), yaw)
    add_box(b("metro_cyan"), at(mid, 0.0, -0.042), (span + 0.02, 0.258, 0.040), yaw)
    add_box(b("metro_cyan"), at(mid, 0.0, 0.080), (span - 0.04, 0.246, 0.016), yaw)
    for hx in (-0.13, 0.13):
        add_box(b("concrete"), at(hx, 0.0, 0.122), (0.15, 0.13, 0.026), yaw)
    if nose_dir:
        add_box(b("obsidian_glass"), at(nose_dir * 0.262, 0.0, 0.024), (0.09, 0.212, 0.066), yaw)
        for side in (-0.068, 0.068):
            add_box(b("lamp_glow"), at(nose_dir * 0.316, side, -0.040), (0.032, 0.05, 0.026), yaw)


def build_metro(coll, mats) -> list[Vector]:
    pts = sample_metro_path()
    acc = _arc_lengths(pts)
    b = MeshBatch("GEO_Metro", mats, coll)

    girder = [(-0.150, -0.12), (0.150, -0.12), (0.175, -0.08), (0.175, 0.04), (0.142, 0.04),
              (0.142, 0.00), (-0.142, 0.00), (-0.142, 0.04), (-0.175, 0.04), (-0.175, -0.08)]
    sweep_profile(b("concrete"), pts, girder, closed_path=False)
    for off in (-0.065, 0.065):
        sweep_profile(b("rail_groove"), pts, [(off - 0.018, 0.001), (off + 0.018, 0.001), (off + 0.018, 0.012),
                                              (off - 0.018, 0.012)], closed_path=False)
    for p_end, p_prev in ((pts[0], pts[1]), (pts[-1], pts[-2])):
        yaw = math.atan2(p_end.y - p_prev.y, p_end.x - p_prev.x)
        add_box(b("metro_cyan"), (p_end.x, p_end.y, DECK_Z + 0.05), (0.05, 0.30, 0.08), yaw)

    # 10 trụ chữ T cắm thẳng xuống cốt nền Z = 0.00 (tránh mặt sông, hồ, trống đồng, công trình)
    blocked = [(4.2, -3.2, 0.62), (-3.6, 1.8, 0.75)]

    def pier_ok(p):
        if is_in_river(p.x, p.y, 0.12) or is_in_hoan_kiem(p.x, p.y, 0.45) or math.hypot(p.x, p.y) < 2.0:
            return False
        return all(math.hypot(p.x - bx, p.y - by) > r for bx, by, r in blocked)

    total = acc[-1]
    z_bottom = DECK_Z - 0.12
    piers = 0
    for k in range(10):
        target = (k + 0.5) / 10.0 * total
        for delta in (0.0, 0.15, -0.15, 0.3, -0.3, 0.45, -0.45, 0.6, -0.6):
            pos, tang = _frame_at(pts, acc, target + delta)
            if pier_ok(pos):
                yaw = math.atan2(tang.y, tang.x)
                add_cylinder(b("concrete"), (pos.x, pos.y, 0.02), 0.16, 0.15, 0.04, 16, yaw)
                add_box(b("concrete"), (pos.x, pos.y, 0.04 + (z_bottom - 0.10) * 0.5), (0.13, 0.15, z_bottom - 0.10), yaw)
                add_box(b("concrete"), (pos.x, pos.y, z_bottom - 0.035), (0.20, 0.40, 0.07), yaw)
                add_box(b("concrete"), (pos.x, pos.y, z_bottom - 0.085), (0.16, 0.28, 0.04), yaw)
                piers += 1
                break
    if piers != 10:
        raise RuntimeError(f"Metro T-pier placement failed: {piers}/10 piers placed")

    # Đoàn tàu 3 toa lướt qua đoạn phía Nam (tâm khung hình camera)
    s_mid = min(range(len(pts)), key=lambda i: math.hypot(pts[i].x - 1.6, pts[i].y + 2.49))
    s0 = acc[s_mid]
    for offset, nose in ((-0.63, -1), (0.0, 0), (0.63, 1)):
        pos, tang = _frame_at(pts, acc, s0 + offset)
        _train_car(b, Vector((pos.x, pos.y, DECK_Z + 0.112)), tang, nose)
    b.commit()
    return pts
