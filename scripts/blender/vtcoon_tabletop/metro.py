# -*- coding: utf-8 -*-
"""Tuyến Metro trên cao uốn lượn hình chữ S mềm mại (Serpentine S-Curve Viaduct) và đoàn tàu Hitachi 3 toa."""

import math

import bpy
from mathutils import Vector

from .core import MeshBatch, add_box, add_cylinder, assign_action_slot, sweep_profile
from .foundation import is_in_river
from .hanoi import is_in_hoan_kiem

DECK_Z = 0.44
GIRDER_HALF = 0.175
METRO_LOOP_FRAMES = 300
CAR_SPACING = 0.64

# Đường cong chữ S mềm mại (Serpentine S-Curve Loop):
# Lướt từ bờ sông gần Cầu Ba Son -> ôm cung tròn mềm quanh Vòng xuyến Trống Đồng -> lượn qua trước Quảng trường Nhà Hát Lớn
# -> uốn chữ S qua sườn Tây Hồ Hoàn Kiếm -> vòng êm phía sau lưng Hồ Hoàn Kiếm & chu vi ngoài để khép mạch tuần hoàn.
METRO_CTRL = [
    (-2.45, -3.15),
    (-1.85, -2.35),
    (-0.65, -2.35),
    (0.85, -2.25),
    (1.95, -1.25),
    (2.15, 0.15),
    (1.55, 1.35),
    (0.45, 2.35),
    (-0.65, 3.55),
    (-0.95, 4.95),
    (0.45, 6.15),
    (3.35, 6.15),
    (5.85, 5.25),
    (6.25, 2.00),
    (6.25, -2.50),
    (5.55, -5.85),
    (1.45, -6.20),
    (-1.55, -6.15),
    (-3.05, -4.85),
]


def _catmull(p0, p1, p2, p3, t):
    t2, t3 = t * t, t * t * t
    return 0.5 * ((2.0 * p1) + (-p0 + p2) * t + (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * t2
                  + (-p0 + 3.0 * p1 - 3.0 * p2 + p3) * t3)


def sample_metro_path(per_span: int = 3) -> list[Vector]:
    """Lấy mẫu đường spline Catmull-Rom chữ S tuần hoàn khép kín (periodic serpentine S-curve loop)."""
    ctrl = [Vector((x, y, DECK_Z)) for x, y in METRO_CTRL]
    n = len(ctrl)
    pts = []
    for i in range(n):
        p0 = ctrl[(i - 1) % n]
        p1 = ctrl[i]
        p2 = ctrl[(i + 1) % n]
        p3 = ctrl[(i + 2) % n]
        for k in range(per_span):
            pts.append(_catmull(p0, p1, p2, p3, k / float(per_span)))
    return pts


def _arc_lengths(pts):
    acc = [0.0]
    for i in range(1, len(pts)):
        acc.append(acc[-1] + (pts[i] - pts[i - 1]).length)
    return acc


def _frame_at(pts, acc, s):
    """Nội suy vị trí & tiếp tuyến tại độ dài cung s (hỗ trợ modulo tuần hoàn)."""
    total_len = acc[-1]
    s = (s % total_len) if total_len > 0.0 else 0.0
    i = max(1, next((k for k in range(1, len(acc)) if acc[k] >= s), len(acc) - 1))
    t = (s - acc[i - 1]) / max(1e-6, acc[i] - acc[i - 1])
    pos = pts[i - 1].lerp(pts[i], t)
    tang = Vector((pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y, pts[i].z - pts[i - 1].z)).normalized()
    return pos, tang


def _train_car(coll, mats, obj_name: str, nose_dir: int) -> bpy.types.Object:
    """
    Toa tàu Metro Tuyến 1 Bến Thành - Suối Tiên (Hitachi Kasado Works rolling stock):
      • Mũi tàu khí động học Hitachi 3D vát nghiêng với kính chắn gió panorama đen bóng và bảng LED điểm đến.
      • Thân hợp kim nhôm trắng sứ kết hợp dải sơn xanh dương đặc trưng (signature blue-and-white livery).
    """
    b = MeshBatch(obj_name, mats, coll)
    tang = Vector((1.0, 0.0, 0.0))
    right = Vector((0.0, -1.0, 0.0))

    def at(lx, ly, lz):
        return tang * lx + right * ly + Vector((0.0, 0.0, lz))

    section = [
        (-0.112, -0.098), (0.112, -0.098), (0.124, -0.032), (0.124, 0.058),
        (0.098, 0.106), (-0.098, 0.106), (-0.124, 0.058), (-0.124, -0.032),
    ]
    x0 = -0.205 if nose_dir == -1 else -0.285
    x1 = 0.205 if nose_dir == 1 else 0.285
    stations = []
    if nose_dir == -1:
        for k in range(6, 0, -1):
            u = k / 6.0
            stations.append((
                x0 - 0.135 * (u ** 0.82),
                math.cos(u * math.pi * 0.42),
                math.cos(u * math.pi * 0.38),
                -0.028 * (u ** 1.35),
            ))
    stations += [(x0, 1.0, 1.0, 0.0), (x1, 1.0, 1.0, 0.0)]
    if nose_dir == 1:
        for k in range(1, 7):
            u = k / 6.0
            stations.append((
                x1 + 0.135 * (u ** 0.82),
                math.cos(u * math.pi * 0.42),
                math.cos(u * math.pi * 0.38),
                -0.028 * (u ** 1.35),
            ))

    body = b("porcelain", smooth=True)
    rings = [[body.verts.new(at(sx, cy * sy, cz * sz + dz)) for cy, cz in section] for sx, sy, sz, dz in stations]
    for i in range(len(rings) - 1):
        for j in range(len(section)):
            jn = (j + 1) % len(section)
            body.faces.new((rings[i][j], rings[i + 1][j], rings[i + 1][jn], rings[i][jn]))
    body.faces.new(list(reversed(rings[0])))
    body.faces.new(rings[-1])

    span = (x1 - x0) + (0.05 if nose_dir else -0.015)
    mid = 0.5 * (x0 + x1) + 0.015 * nose_dir

    add_box(b("metro_cyan"), at(mid, 0.0, -0.036), (span + 0.025, 0.252, 0.038), 0.0)
    add_box(b("metro_cyan"), at(mid, 0.0, 0.078), (span - 0.015, 0.238, 0.018), 0.0)

    add_box(b("obsidian_glass"), at(mid, 0.0, 0.022), (span - 0.01, 0.252, 0.064), 0.0)
    for dx in (-0.15, 0.0, 0.15):
        door_x = mid + dx * (0.85 if nose_dir else 1.0)
        add_box(b("silver_steel"), at(door_x, 0.0, 0.004), (0.058, 0.255, 0.115), 0.0)
        add_box(b("obsidian_glass"), at(door_x, 0.0, 0.024), (0.044, 0.258, 0.055), 0.0)

    for bx in (-0.16, 0.16):
        add_box(b("dark_granite"), at(bx, 0.0, -0.095), (0.12, 0.19, 0.032), 0.0)
    if nose_dir != -1:
        add_box(b("dark_granite"), at(x0 - 0.018, 0.0, -0.005), (0.036, 0.195, 0.175), 0.0)
    if nose_dir != 1:
        add_box(b("dark_granite"), at(x1 + 0.018, 0.0, -0.005), (0.036, 0.195, 0.175), 0.0)

    for hx in (-0.13, 0.13):
        add_box(b("silver_steel"), at(hx, 0.0, 0.116), (0.14, 0.13, 0.024), 0.0)
    if nose_dir == 0:
        add_box(b("silver_steel"), at(0.0, 0.0, 0.132), (0.11, 0.10, 0.018), 0.0)
        # Cần tiếp điện chữ Z (diamond pantograph) trên nóc toa giữa
        add_box(b("silver_steel"), at(0.0, 0.0, 0.152), (0.09, 0.14, 0.008), 0.0)
        add_box(b("silver_steel"), at(0.0, 0.0, 0.168), (0.02, 0.18, 0.008), 0.0)

    if nose_dir:
        add_box(b("obsidian_glass"), at(nose_dir * 0.255, 0.0, 0.022), (0.095, 0.205, 0.068), 0.0)
        # Bảng LED điểm đến "BẾN THÀNH - SUỐI TIÊN" phía trên kính lái và móc nối tự động Scharfenberg ở mũi tàu
        add_box(b("lamp_glow"), at(nose_dir * 0.238, 0.0, 0.056), (0.018, 0.105, 0.014), 0.0)
        add_box(b("metro_cyan"), at(nose_dir * 0.295, 0.0, -0.025), (0.075, 0.185, 0.036), 0.0)
        add_box(b("dark_granite"), at(nose_dir * 0.335, 0.0, -0.072), (0.048, 0.065, 0.028), 0.0)
        for side in (-0.064, 0.064):
            add_box(b("lamp_glow"), at(nose_dir * 0.328, side, -0.036), (0.028, 0.046, 0.022), 0.0)
    return b.commit_merged(obj_name)


def _animate_metro_loop(cars: list[tuple[bpy.types.Object, float]], pts: list[Vector], acc: list[float]) -> None:
    """Lập trình hoạt ảnh tuần hoàn 300 frames (10s @ 30 FPS) gán vào Action_Metro_Loop."""
    action = bpy.data.actions.get("Action_Metro_Loop") or bpy.data.actions.new(name="Action_Metro_Loop")
    action.use_fake_user = True
    if hasattr(action, "use_frame_range"):
        action.use_frame_range = True
        action.frame_start = 1.0
        action.frame_end = float(METRO_LOOP_FRAMES)
    if hasattr(action, "use_cyclic"):
        action.use_cyclic = True

    total_path_length = acc[-1]
    z_car = DECK_Z + 0.112
    # Căn pha sao cho tại frame 130 (render kiểm chứng), đoàn tàu nằm ngay khúc cua chữ S trung tâm
    phase_shift = -0.25 * total_path_length

    for car_obj, offset in cars:
        assign_action_slot(car_obj, action)
        prev_yaw = None
        for frame in range(1, METRO_LOOP_FRAMES + 1):
            t = (frame - 1) / float(METRO_LOOP_FRAMES) * total_path_length
            s = (t + phase_shift + offset) % total_path_length
            pos, tang = _frame_at(pts, acc, s)
            _, tang_ahead = _frame_at(pts, acc, (s + 0.25) % total_path_length)

            raw_yaw = math.atan2(tang.y, tang.x)
            if prev_yaw is None:
                yaw = raw_yaw
            else:
                diff = (raw_yaw - prev_yaw + math.pi) % (2.0 * math.pi) - math.pi
                yaw = prev_yaw + diff
            prev_yaw = yaw

            pitch = -math.asin(max(-1.0, min(1.0, tang.z)))
            yaw_ahead = math.atan2(tang_ahead.y, tang_ahead.x)
            curvature = (yaw_ahead - raw_yaw + math.pi) % (2.0 * math.pi) - math.pi
            roll = max(-0.035, min(0.035, curvature * 0.18))

            car_obj.location = (pos.x, pos.y, z_car)
            car_obj.rotation_euler = (roll, pitch, yaw)
            car_obj.keyframe_insert(data_path="location", frame=frame)
            car_obj.keyframe_insert(data_path="rotation_euler", frame=frame)


def build_metro(coll, mats) -> list[Vector]:
    pts = sample_metro_path()
    pts_closed = pts + [pts[0].copy()]
    acc = _arc_lengths(pts_closed)
    b = MeshBatch("GEO_Metro", mats, coll)

    girder = [
        (-0.118, -0.135), (0.118, -0.135), (0.152, -0.045), (0.184, -0.025),
        (0.188, 0.064), (0.156, 0.064), (0.152, 0.002), (-0.152, 0.002),
        (-0.156, 0.064), (-0.188, 0.064), (-0.184, -0.025), (-0.152, -0.045),
    ]
    sweep_profile(b("concrete"), pts, girder, closed_path=True)
    # Thanh ray dẫn điện thứ 3 (Third Rail) ở chính giữa lòng dầm U-girder + hai đường ray thép chuẩn
    sweep_profile(b("silver_steel"), pts, [(-0.008, 0.002), (0.008, 0.002), (0.008, 0.018), (-0.008, 0.018)],
                  closed_path=True)
    for off in (-0.065, 0.065):
        sweep_profile(b("rail_groove"), pts, [(off - 0.018, 0.003), (off + 0.018, 0.003), (off + 0.018, 0.014),
                                              (off - 0.018, 0.014)], closed_path=True)

    # 12 trụ chữ T (hammerhead piers) dọc tuyến cầu cạn chữ S, giữ thông thoáng tuyệt đối R = 1.55m tại tâm
    blocked = [
        (-3.75, -1.75, 0.78),
        (-2.85, 1.45, 0.85),
        (1.05, -4.15, 0.88),
        (4.35, -0.75, 0.88),
        (-2.25, -4.45, 0.65),
    ]

    def pier_ok(p):
        if is_in_river(p.x, p.y, 0.08) or is_in_hoan_kiem(p.x, p.y, 0.25) or math.hypot(p.x, p.y) < 1.62:
            return False
        return all(math.hypot(p.x - bx, p.y - by) > r for bx, by, r in blocked)

    total = acc[-1]
    z_bottom = DECK_Z - 0.135
    piers = 0
    num_piers = 12
    for k in range(num_piers):
        target = (k + 0.5) / float(num_piers) * total
        for delta in (0.0, 0.25, -0.25, 0.50, -0.50, 0.75, -0.75, 1.05, -1.05, 1.35, -1.35, 1.65, -1.65, 2.00, -2.00):
            pos, tang = _frame_at(pts_closed, acc, target + delta)
            if pier_ok(pos):
                yaw = math.atan2(tang.y, tang.x)
                add_cylinder(b("concrete"), (pos.x, pos.y, 0.02), 0.155, 0.145, 0.04, 12, yaw)
                add_box(b("concrete"), (pos.x, pos.y, 0.04 + (z_bottom - 0.095) * 0.5),
                        (0.13, 0.15, z_bottom - 0.095), yaw)
                add_box(b("concrete"), (pos.x, pos.y, z_bottom - 0.032), (0.20, 0.38, 0.064), yaw)
                add_box(b("concrete"), (pos.x, pos.y, z_bottom - 0.078), (0.16, 0.26, 0.036), yaw)
                piers += 1
                break
    if piers != num_piers:
        raise RuntimeError(f"Metro T-pier placement failed: {piers}/{num_piers} piers placed")

    b.commit()

    car_head = _train_car(coll, mats, "NODE_Train_Car_Head", nose_dir=1)
    car_mid = _train_car(coll, mats, "NODE_Train_Car_Mid", nose_dir=0)
    car_tail = _train_car(coll, mats, "NODE_Train_Car_Tail", nose_dir=-1)
    _animate_metro_loop(
        [(car_head, CAR_SPACING), (car_mid, 0.0), (car_tail, -CAR_SPACING)],
        pts_closed,
        acc,
    )
    return pts_closed
