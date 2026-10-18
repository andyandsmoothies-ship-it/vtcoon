# -*- coding: utf-8 -*-
"""Cảnh quan Townscaper: liễu rủ Hồ Gươm, cây tán tròn, dừa & cọ phương Nam, ghế đá, bồn hoa."""

import math
import random

from mathutils import Vector

from .core import add_box, add_cylinder, add_sphere, add_tube_along


def add_round_tree(b, x: float, y: float, s: float = 1.0, moss: bool = False) -> None:
    add_cylinder(b("trunk"), (x, y, 0.06 * s), 0.022 * s, 0.016 * s, 0.12 * s, 8)
    leaf = b("foliage_moss" if moss else "foliage_emerald", smooth=True)
    add_sphere(leaf, (x, y, 0.19 * s), (0.13 * s, 0.13 * s, 0.11 * s))
    add_sphere(leaf, (x + 0.03 * s, y - 0.02 * s, 0.27 * s), (0.09 * s, 0.09 * s, 0.08 * s))


def add_willow(b, x: float, y: float, lean_dir: Vector, s: float = 1.0) -> None:
    """Liễu rủ: thân nghiêng ra mặt hồ, tán vòm + 10 dải lá rủ."""
    top = Vector((x + lean_dir.x * 0.05 * s, y + lean_dir.y * 0.05 * s, 0.22 * s))
    add_tube_along(b("trunk"), [Vector((x, y, 0.0)), Vector((x, y, 0.10 * s)), top], 0.0,
                   segments=6, radii=[0.022 * s, 0.018 * s, 0.012 * s])
    leaf = b("foliage_emerald", smooth=True)
    add_sphere(leaf, (top.x, top.y, top.z + 0.03 * s), (0.15 * s, 0.15 * s, 0.075 * s))
    for k in range(14):
        a = 2.0 * math.pi * k / 14
        r = 0.125 * s
        add_sphere(leaf, (top.x + r * math.cos(a), top.y + r * math.sin(a), top.z - 0.085 * s),
                   (0.020 * s, 0.020 * s, 0.13 * s), subdiv=1)


def add_coconut_palm(b, x: float, y: float, s: float, yaw: float) -> None:
    lean = Vector((math.cos(yaw), math.sin(yaw), 0.0))
    pts = [Vector((x, y, 0.0)) + lean * (0.06 * s * (t ** 1.6)) + Vector((0.0, 0.0, 0.42 * s * t))
           for t in (0.0, 0.25, 0.5, 0.75, 1.0)]
    add_tube_along(b("palm_trunk"), pts, 0.0, segments=6,
                   radii=[0.020 * s, 0.017 * s, 0.015 * s, 0.013 * s, 0.011 * s])
    crown = pts[-1]
    for k in range(7):
        a = yaw + 2.0 * math.pi * k / 7
        d = Vector((math.cos(a), math.sin(a), 0.0))
        add_sphere(b("palm_frond"), crown + d * 0.10 * s + Vector((0.0, 0.0, -0.025 * s)),
                   (0.12 * s, 0.026 * s, 0.006 * s), subdiv=1, rot_z=a, pitch=math.radians(24.0))
    add_sphere(b("trunk"), crown + Vector((0.0, 0.0, -0.02 * s)), (0.022 * s, 0.022 * s, 0.018 * s), subdiv=1)


def add_fan_palm(b, x: float, y: float, s: float) -> None:
    add_cylinder(b("palm_trunk"), (x, y, 0.09 * s), 0.018 * s, 0.014 * s, 0.18 * s, 6)
    for k in range(9):
        a = 2.0 * math.pi * k / 9
        add_sphere(b("palm_frond"), (x + 0.05 * s * math.cos(a), y + 0.05 * s * math.sin(a), 0.20 * s),
                   (0.07 * s, 0.035 * s, 0.006 * s), subdiv=1, rot_z=a, pitch=math.radians(-18.0))


def add_stone_bench(b, x: float, y: float, yaw: float) -> None:
    add_box(b("cut_stone"), (x, y, 0.028), (0.10, 0.035, 0.012), yaw)
    for off in (-0.035, 0.035):
        add_box(b("cut_stone"), (x + off * math.cos(yaw), y + off * math.sin(yaw), 0.011), (0.012, 0.03, 0.022), yaw)


def add_flowerbed(b, x: float, y: float, r: float, rng: random.Random) -> None:
    add_cylinder(b("cut_stone"), (x, y, 0.012), r, r, 0.024, 16)
    add_cylinder(b("foliage_moss"), (x, y, 0.026), r * 0.88, r * 0.80, 0.012, 16)
    for k in range(7):
        a = 2.0 * math.pi * k / 7 + rng.uniform(-0.2, 0.2)
        rr = r * 0.55 * rng.uniform(0.3, 1.0)
        key = "flower_pink" if k % 2 == 0 else "flower_yellow"
        add_sphere(b(key), (x + rr * math.cos(a), y + rr * math.sin(a), 0.038), (0.022, 0.022, 0.016), subdiv=1)


def scatter_trees(b, clearance, region, spacing: float, seed: int, kind: str, limit: int) -> int:
    """Rải cây trên lưới jitter trong vùng, tôn trọng ClearanceMap. kind: hanoi | saigon."""
    rng = random.Random(seed)
    x0, x1, y0, y1 = region
    placed = 0
    y = y0
    while y <= y1 and placed < limit:
        x = x0
        while x <= x1 and placed < limit:
            px, py = x + rng.uniform(-0.38, 0.38) * spacing, y + rng.uniform(-0.38, 0.38) * spacing
            if rng.random() < 0.82 and clearance.is_free(px, py, 0.16):
                s = rng.uniform(0.85, 1.15)
                if kind == "saigon":
                    roll = rng.random()
                    if roll < 0.5:
                        add_coconut_palm(b, px, py, s, rng.uniform(0.0, 2.0 * math.pi))
                    elif roll < 0.75:
                        add_fan_palm(b, px, py, s)
                    else:
                        add_round_tree(b, px, py, s, moss=True)
                else:
                    add_round_tree(b, px, py, s, moss=rng.random() < 0.4)
                clearance.add_circle(px, py, 0.12)
                placed += 1
            x += spacing
        y += spacing
    return placed
