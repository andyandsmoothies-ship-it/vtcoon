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


def _cruiser(coll, mats, obj_name: str):
    """Du thuyền Saigon Cruiser trắng sọc xanh — đối tượng động độc lập tại gốc (0,0,0)."""
    cb = MeshBatch(obj_name, mats, coll)
    add_sphere(cb("porcelain", smooth=True), (0.0, 0.0, 0.03), (0.26, 0.075, 0.045), subdiv=2, rot_z=0.0)
    add_sphere(cb("cruiser_blue", smooth=True), (0.0, 0.0, 0.035), (0.262, 0.077, 0.012), subdiv=2, rot_z=0.0)
    add_box(cb("porcelain"), (-0.03, 0.0, 0.09), (0.26, 0.10, 0.05), 0.0)
    add_box(cb("obsidian_glass"), (-0.03, 0.0, 0.093), (0.24, 0.104, 0.022), 0.0)
    add_box(cb("porcelain"), (-0.06, 0.0, 0.135), (0.14, 0.08, 0.04), 0.0)
    add_box(cb("cruiser_blue"), (-0.06, 0.0, 0.158), (0.15, 0.085, 0.008), 0.0)
    add_cylinder(cb("cruiser_blue"), (-0.12, 0.0, 0.18), 0.014, 0.012, 0.05, 10)
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
        phi = i * 2.094  # 120 độ lệch pha giữa các du thuyền
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
    for y0, y1 in ((-6.55, -2.05), (2.05, 6.55)):
        bank = list(reversed(river_bank_path(-1, y0, y1, 36)))
        sweep_profile(b("marble_wharf"), bank, [(0.10, 0.0), (0.40, 0.0), (0.40, 0.022), (0.10, 0.022)], False)
        for p in bank[1::3]:
            px = p.x - 0.50
            if clearance.is_free(px, p.y, 0.02):
                add_coconut_palm(b, px, p.y, 1.05, math.pi)
                clearance.add_circle(px, p.y, 0.14)
    cruisers = []
    for idx, y in enumerate((-3.45, -4.55, -5.65)):
        xc, w = river_center_x(y), river_half_width(y)
        bank_x = xc - w
        add_box(b("marble_wharf"), (bank_x + 0.08, y, 0.012), (0.30, 0.09, 0.024))
        for k in (-1, 1):
            add_cylinder(b("cut_stone"), (bank_x + 0.20, y + k * 0.04, 0.02), 0.012, 0.012, 0.05, 8)
        obj_name = f"NODE_Saigon_Cruiser_{idx + 1}"
        cruiser_obj = _cruiser(coll, mats, obj_name)
        cruisers.append((cruiser_obj, bank_x + 0.17, y - 0.26, -0.03, math.pi * 0.5 + 0.05))
    _animate_cruisers_bobbing(cruisers)


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
    build_bach_dang_wharf(w, clearance, coll, mats)
    clearance.add_predicate(lambda x, y, m: is_in_river(x, y, 0.42 + m))
    for px, py in ((-2.75, 2.75), (-4.45, 2.6), (-2.95, 0.95)):
        if clearance.is_free(px, py, 0.0):
            add_fan_palm(w, px, py, 1.1)
            clearance.add_circle(px, py, 0.14)
    scatter_trees(w, clearance, (-6.40, -0.95, -6.40, 6.40), 0.52, 3004, "saigon", 75)
    w.commit()
