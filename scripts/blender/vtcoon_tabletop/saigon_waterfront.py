# -*- coding: utf-8 -*-
"""KHU BỜ SÔNG TP.HCM (TÂY / NAM): Công viên 30/4 quanh Nhà thờ Đức Bà, Bến Bạch Đằng quanh Bitexco & du thuyền."""

import math
import random

from mathutils import Vector

from .core import MeshBatch, add_box, add_cylinder, add_sphere, sweep_profile
from .flora import add_flowerbed, add_round_tree, scatter_trees
from .foundation import is_in_river, river_bank_path, sample_river_centerline
from .saigon import BX, BY, ND_ROT, ND_X, ND_Y, build_bitexco, build_notre_dame

ND_PLAZA = (ND_X + 0.85 * math.sin(ND_ROT), ND_Y - 0.85 * math.cos(ND_ROT))


def _strip(b, key, p0, p1, width, z=0.018, z_base=0.002) -> None:
    dx, dy = p1[0] - p0[0], p1[1] - p0[1]
    yaw = math.atan2(dy, dx)
    length = math.hypot(dx, dy)
    cx, cy = (p0[0] + p1[0]) * 0.5, (p0[1] + p1[1]) * 0.5
    add_box(b("cut_stone"), (cx, cy, z_base + z * 0.35), (length + 0.06, width + 0.08, z * 0.70), yaw)
    add_box(b(key), (cx, cy, z_base + z * 0.65), (length, width, z * 0.75), yaw)


def build_boulevards(b, rng) -> None:
    """
    Quảng trường Công viên 30/4 & Đại lộ ven sông kết nối Nhà thờ Đức Bà [-1.8, 1.4] và Bitexco [-2.4, -0.6]
    với Vòng xuyến Trống Đồng [0, 0].
    """
    # 1. Thềm quảng trường đá quanh Bitexco [-2.4, -0.6] sát bờ cong sông Sài Gòn
    add_cylinder(b("cut_stone"), (BX, BY, 0.008), 0.92, 0.90, 0.016, 20)
    add_cylinder(b("granite_paving"), (BX, BY, 0.015), 0.84, 0.82, 0.014, 20)

    # 2. Thềm Công viên 30/4 & Công trường Công xã Paris quanh Nhà thờ Đức Bà [-1.8, 1.4]
    add_cylinder(b("cut_stone"), (ND_X, ND_Y, 0.008), 0.96, 0.94, 0.016, 20)
    add_cylinder(b("granite_paving"), (ND_X, ND_Y, 0.015), 0.88, 0.86, 0.014, 20)
    add_cylinder(b("granite_paving"), (ND_PLAZA[0], ND_PLAZA[1], 0.015), 0.46, 0.44, 0.016, 16)

    # Lối đi bộ lát đá nối Nhà thờ Đức Bà <-> Bitexco <-> Vòng xuyến trung tâm
    _strip(b, "granite_paving", (ND_X, ND_Y), (BX, BY), 0.52, z=0.018)
    _strip(b, "granite_paving", (BX, BY), (-1.95, -0.75), 0.48, z=0.018)
    _strip(b, "granite_paving", (ND_X, ND_Y), (-1.55, 1.35), 0.48, z=0.018)

    # Tượng Đức Mẹ Hoà Bình giữa công trường Công xã Paris
    add_cylinder(b("cut_stone"), (ND_PLAZA[0], ND_PLAZA[1], 0.038), 0.06, 0.05, 0.05, 10)
    add_cylinder(b("porcelain"), (ND_PLAZA[0], ND_PLAZA[1], 0.098), 0.020, 0.012, 0.08, 8)
    add_sphere(b("porcelain"), (ND_PLAZA[0], ND_PLAZA[1], 0.145), (0.012, 0.012, 0.014), subdiv=1)

    add_flowerbed(b, (ND_X + BX) * 0.5 + 0.35, (ND_Y + BY) * 0.5, 0.14, rng)


def _cruiser(coll, mats, obj_name: str):
    """Du thuyền Saigon Cruiser 2 tầng trắng sọc xanh sang trọng — đối tượng động độc lập tại gốc (0,0,0)."""
    cb = MeshBatch(obj_name, mats, coll)
    add_sphere(cb("porcelain", smooth=True), (0.0, 0.0, 0.03), (0.25, 0.074, 0.044), subdiv=1, rot_z=0.0)
    add_sphere(cb("cruiser_blue", smooth=True), (0.0, 0.0, 0.036), (0.252, 0.076, 0.012), subdiv=1, rot_z=0.0)
    # Boong gỗ sàn mũi tàu & đuôi tàu
    add_box(cb("walnut"), (0.02, 0.0, 0.056), (0.36, 0.102, 0.008), 0.0)
    # Tầng 1: Khoang nhà hàng kính panorama
    add_box(cb("porcelain"), (-0.02, 0.0, 0.086), (0.25, 0.098, 0.046), 0.0)
    add_box(cb("obsidian_glass"), (-0.01, 0.0, 0.089), (0.23, 0.102, 0.024), 0.0)
    add_box(cb("lamp_glow"), (-0.01, 0.0, 0.089), (0.18, 0.082, 0.016), 0.0)
    # Tầng 2: Khoang lái & boong thượng ngắm cảnh
    add_box(cb("porcelain"), (-0.05, 0.0, 0.128), (0.15, 0.080, 0.038), 0.0)
    add_box(cb("obsidian_glass"), (-0.02, 0.0, 0.130), (0.10, 0.084, 0.018), 0.0)
    add_box(cb("cruiser_blue"), (-0.05, 0.0, 0.150), (0.16, 0.084, 0.008), 0.0)
    # Ống khói & cột radar hàng hải
    add_cylinder(cb("cruiser_blue"), (-0.11, 0.0, 0.172), 0.014, 0.010, 0.048, 8)
    add_box(cb("silver_steel"), (-0.06, 0.0, 0.182), (0.008, 0.048, 0.012), 0.0)
    return cb.commit_merged(obj_name)


def _animate_cruisers_bobbing(cruisers: list[tuple]) -> None:
    """Lập trình hoạt ảnh thủy tĩnh dao động lệch pha 300 frames (Action_Cruisers_Bobbing)."""
    import bpy
    from .core import assign_action_slot

    action = bpy.data.actions.get("Action_Cruisers_Bobbing") or bpy.data.actions.new(name="Action_Cruisers_Bobbing")
    action.use_fake_user = True
    if hasattr(action, "use_frame_range"):
        action.use_frame_range = True
        action.frame_start = 1.0
        action.frame_end = 300.0
    if hasattr(action, "use_cyclic"):
        action.use_cyclic = True

    for i, (cruiser_obj, x_origin, y_origin, z_origin, yaw_origin) in enumerate(cruisers):
        assign_action_slot(cruiser_obj, action)
        phi = i * 2.094
        for f in range(1, 301):
            t = 2.0 * math.pi * (f - 1) / 300.0
            z_val = z_origin + math.sin(2.0 * t + phi) * 0.012 + math.sin(3.0 * t) * 0.004
            pitch_val = math.sin(2.0 * t + phi + 0.5) * 0.025
            roll_val = math.cos(2.0 * t + phi) * 0.030

            cruiser_obj.location = (x_origin, y_origin, z_val)
            cruiser_obj.rotation_euler = (roll_val, pitch_val, yaw_origin)
            cruiser_obj.keyframe_insert(data_path="location", frame=f)
            cruiser_obj.keyframe_insert(data_path="rotation_euler", frame=f)


def build_bach_dang_wharf(b, clearance, coll, mats) -> None:
    """Đường dạo bộ ven sông Bến Bạch Đằng ôm theo bờ cong sông Sài Gòn quanh Bitexco & 3 du thuyền."""
    inner_bank = river_bank_path(1, 36)
    promenade = [p for p in inner_bank if -4.4 <= p.y <= 3.6 and abs(p.x) <= 6.2]
    sweep_profile(b("marble_wharf"), promenade, [(0.06, 0.0), (0.38, 0.0), (0.38, 0.020), (0.06, 0.020)], False)

    center_pts = sample_river_centerline(36)
    cruisers = []
    for idx, sample_i in enumerate((10, 18, 29)):
        p = center_pts[sample_i]
        p_next = center_pts[min(len(center_pts) - 1, sample_i + 1)]
        yaw = math.atan2(p_next.y - p.y, p_next.x - p.x)
        obj_name = f"NODE_Saigon_Cruiser_{idx + 1}"
        cruiser_obj = _cruiser(coll, mats, obj_name)
        cruisers.append((cruiser_obj, p.x, p.y, -0.025, yaw))
    _animate_cruisers_bobbing(cruisers)


def build_saigon_quarter(coll, mats, clearance) -> None:
    b_bitexco = MeshBatch("GEO_SG_Landmarks_Bitexco", mats, coll)
    build_bitexco(b_bitexco)
    b_bitexco.commit()

    b_nd = MeshBatch("GEO_SG_Landmarks_NotreDame", mats, coll)
    build_notre_dame(b_nd)
    b_nd.commit()

    w = MeshBatch("GEO_SG_Waterfront", mats, coll)
    rng = random.Random(1975)
    build_boulevards(w, rng)
    clearance.add_circle(BX, BY, 0.92)
    clearance.add_circle(ND_X, ND_Y, 0.96)
    clearance.add_circle(ND_PLAZA[0], ND_PLAZA[1], 0.48)
    build_bach_dang_wharf(w, clearance, coll, mats)
    clearance.add_predicate(lambda x, y, m: is_in_river(x, y, 0.36 + m))

    # Cụm cây xanh rợp bóng bao quanh Công viên 30/4 (Nhà thờ Đức Bà) và bán đảo ven sông quanh Bitexco
    grove_coords = (
        (-4.72, -1.65, 1.32), (-4.55, -2.25, 1.28), (-4.15, -2.75, 1.30),
        (-3.65, -2.95, 1.28), (-3.15, -2.75, 1.25), (-4.15, -2.15, 1.22),
        (-4.75, -0.85, 1.26), (-4.72, 0.25, 1.22),
        (-4.45, 1.45, 1.22), (-3.95, 2.25, 1.18), (-1.95, 2.15, 1.15),
        (-1.55, 1.15, 1.22), (-1.85, 0.55, 1.18), (-2.35, 0.65, 1.15),
        (-4.15, 3.65, 1.22), (-3.35, 3.95, 1.18),
    )
    for tx, ty, sc in grove_coords:
        if clearance.is_free(tx, ty, 0.02):
            add_round_tree(w, tx, ty, sc, moss=(tx + ty > -2.0))
            clearance.add_circle(tx, ty, 0.16)

    scatter_trees(w, clearance, (-5.80, -0.50, -5.50, 4.80), 0.85, 3004, "hanoi", 11)
    w.commit()
