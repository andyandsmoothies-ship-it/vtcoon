#!/usr/bin/env python3
"""
[IMP-405] Blender 5.2 LTS Saigon Notre Dame Cathedral & Diorama Static Batch Generator
Target Asset: public/models/landmarks/landmark_cathedral.glb
Target TS Module: src/client/3d/diorama/diorama_static_blender_batches.ts

Executes inside Blender 5.2 LTS headless CLI:
  "C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe" --background --python scripts/blender/build_heritage_cathedral_and_diorama.py

Sculpts the Saigon Notre Dame Cathedral (Nha Tho Duc Ba Sai Gon) with Low-Poly Tectonics:
  - Cruciform Nave + Transept + 6-segment polygonal Apse
  - 3 inward-recessed West Romanesque portals & extruded 6-segment West Rose Window
  - Twin 6-tier bell towers (#B45309 Marseille brick, white limestone stringcourses,
    stepped louvred belfry lancets, octagonal slate spires, 4-sided corner pinnacles, brass crosses)
  - Total height 1.42m (Y in [0, 1.42]), footprint 0.68m x 0.76m (width <= 0.72m, depth <= 0.80m)
  - COLOR_0 Vertex-Color + Cavity AO (max(L) - min(L) >= 0.22)
  - Triangle count strictly in 1,000 <= triangles <= 1,500 (~1,240 triangles), sizeBytes <= 200 KB
"""

import bpy
import bmesh
import math
import os
from mathutils import Vector

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_GLB_DIR = os.path.join(ROOT_DIR, "public", "models", "landmarks")
OUT_GLB_PATH = os.path.join(OUT_GLB_DIR, "landmark_cathedral.glb")


def srgb_hex_to_rgb(hex_str):
    h = hex_str.lstrip("#")
    return (
        int(h[0:2], 16) / 255.0,
        int(h[2:4], 16) / 255.0,
        int(h[4:6], 16) / 255.0,
    )


def clamp01(val):
    return max(0.0, min(1.0, val))


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def to_b(x, y, z):
    """Maps Three.js Y-up (x, y, z) to Blender Z-up (x, -z, y) so export_yup=True restores exact Three.js coordinates."""
    return Vector((x, -z, y))


def add_quad_to_bmesh(bm, color_layer, coords, rgb, shades):
    verts = [bm.verts.new(c) for c in coords]
    face = bm.faces.new(verts)
    r, g, b = rgb
    for loop, shade in zip(face.loops, shades):
        loop[color_layer] = (
            clamp01(r * shade),
            clamp01(g * shade),
            clamp01(b * shade),
            1.0,
        )


def add_tectonic_frustum_to_bmesh(bm, color_layer, spec):
    """
    Adds a tectonic prism/frustum in Blender Z-up coordinates.
    When open_bottom=True, omits the buried internal -Y face (5 faces = 10 tris instead of 6 faces = 12 tris).
    """
    cx, cy, cz = spec["center"]
    wx_b, hy, wz_b = spec["size_bottom"]
    wx_t, wz_t = spec.get("size_top", (wx_b, wz_b))
    rgb = srgb_hex_to_rgb(spec["color"])
    ao_bot = spec.get("ao_bottom", 0.68)
    ao_top = spec.get("ao_top", 1.05)
    open_bottom = spec.get("open_bottom", False)

    y0 = cy - hy * 0.5
    y1 = cy + hy * 0.5
    xb0, xb1 = cx - wx_b * 0.5, cx + wx_b * 0.5
    zb0, zb1 = cz - wz_b * 0.5, cz + wz_b * 0.5
    xt0, xt1 = cx - wx_t * 0.5, cx + wx_t * 0.5
    zt0, zt1 = cz - wz_t * 0.5, cz + wz_t * 0.5

    faces_spec = [
        # Front (+Z)
        ((to_b(xb0, y0, zb1), to_b(xb1, y0, zb1), to_b(xt1, y1, zt1), to_b(xt0, y1, zt1)), (ao_bot, ao_bot, ao_top, ao_top)),
        # Back (-Z)
        ((to_b(xb1, y0, zb0), to_b(xb0, y0, zb0), to_b(xt0, y1, zt0), to_b(xt1, y1, zt0)), (ao_bot * 0.92, ao_bot * 0.92, ao_top * 0.95, ao_top * 0.95)),
        # Right (+X)
        ((to_b(xb1, y0, zb1), to_b(xb1, y0, zb0), to_b(xt1, y1, zt0), to_b(xt1, y1, zt1)), (ao_bot * 0.95, ao_bot * 0.95, ao_top * 0.98, ao_top * 0.98)),
        # Left (-X)
        ((to_b(xb0, y0, zb0), to_b(xb0, y0, zb1), to_b(xt0, y1, zt1), to_b(xt0, y1, zt0)), (ao_bot * 0.90, ao_bot * 0.90, ao_top * 0.94, ao_top * 0.94)),
        # Top (+Y)
        ((to_b(xt0, y1, zt1), to_b(xt1, y1, zt1), to_b(xt1, y1, zt0), to_b(xt0, y1, zt0)), (ao_top * 1.06, ao_top * 1.06, ao_top * 1.06, ao_top * 1.06)),
    ]
    if not open_bottom:
        faces_spec.append(
            ((to_b(xb0, y0, zb0), to_b(xb1, y0, zb0), to_b(xb1, y0, zb1), to_b(xb0, y0, zb1)), (ao_bot * 0.65, ao_bot * 0.65, ao_bot * 0.65, ao_bot * 0.65))
        )

    for coords, shades in faces_spec:
        add_quad_to_bmesh(bm, color_layer, coords, rgb, shades)


def add_recessed_cavity_bay_to_bmesh(bm, color_layer, spec):
    """
    Carves an INWARD-RECESSED 5-face architectural portal/lancet/rose cavity into a facade wall.
    Supports orientation 'Z-' (West front facade facing -Z), 'Z+' (East rear), 'X-' (Left flank), 'X+' (Right flank).
    Each cavity adds 5 quads = 10 triangles.
    """
    cx, cy, cz = spec["opening_center"]
    width, height, depth = spec["cavity_size"]
    rgb_back = srgb_hex_to_rgb(spec["color"])
    rgb_trim = srgb_hex_to_rgb(spec.get("reveal_color", spec["color"]))
    ao_back = spec.get("ao_cavity", 0.28)
    orient = spec.get("orientation", "Z-")

    y0, y1 = cy - height * 0.5, cy + height * 0.5

    if orient in ("Z-", "Z+"):
        x0, x1 = cx - width * 0.5, cx + width * 0.5
        zf = cz
        zb = cz + depth if orient == "Z-" else cz - depth
        if orient == "Z-":
            cavity_faces = [
                ((to_b(x1, y0, zb), to_b(x0, y0, zb), to_b(x0, y1, zb), to_b(x1, y1, zb)), rgb_back, (ao_back * 0.95, ao_back * 0.95, ao_back * 0.78, ao_back * 0.78)),
                ((to_b(x1, y1, zb), to_b(x0, y1, zb), to_b(x0, y1, zf), to_b(x1, y1, zf)), rgb_trim, (ao_back * 0.65, ao_back * 0.65, ao_back * 0.82, ao_back * 0.82)),
                ((to_b(x1, y0, zf), to_b(x0, y0, zf), to_b(x0, y0, zb), to_b(x1, y0, zb)), rgb_trim, (0.68, 0.68, 0.48, 0.48)),
                ((to_b(x0, y0, zb), to_b(x0, y0, zf), to_b(x0, y1, zf), to_b(x0, y1, zb)), rgb_trim, (0.34, 0.52, 0.48, 0.30)),
                ((to_b(x1, y0, zf), to_b(x1, y0, zb), to_b(x1, y1, zb), to_b(x1, y1, zf)), rgb_trim, (0.52, 0.34, 0.30, 0.48)),
            ]
        else:
            cavity_faces = [
                ((to_b(x0, y0, zb), to_b(x1, y0, zb), to_b(x1, y1, zb), to_b(x0, y1, zb)), rgb_back, (ao_back * 0.95, ao_back * 0.95, ao_back * 0.78, ao_back * 0.78)),
                ((to_b(x0, y1, zb), to_b(x1, y1, zb), to_b(x1, y1, zf), to_b(x0, y1, zf)), rgb_trim, (ao_back * 0.65, ao_back * 0.65, ao_back * 0.82, ao_back * 0.82)),
                ((to_b(x0, y0, zf), to_b(x1, y0, zf), to_b(x1, y0, zb), to_b(x0, y0, zb)), rgb_trim, (0.68, 0.68, 0.48, 0.48)),
                ((to_b(x0, y0, zf), to_b(x0, y0, zb), to_b(x0, y1, zb), to_b(x0, y1, zf)), rgb_trim, (0.52, 0.34, 0.30, 0.48)),
                ((to_b(x1, y0, zb), to_b(x1, y0, zf), to_b(x1, y1, zf), to_b(x1, y1, zb)), rgb_trim, (0.34, 0.52, 0.48, 0.30)),
            ]
    else:
        z0, z1 = cz - width * 0.5, cz + width * 0.5
        xf = cx
        xb = cx + depth if orient == "X-" else cx - depth
        if orient == "X-":
            cavity_faces = [
                ((to_b(xb, y0, z0), to_b(xb, y0, z1), to_b(xb, y1, z1), to_b(xb, y1, z0)), rgb_back, (ao_back * 0.95, ao_back * 0.95, ao_back * 0.78, ao_back * 0.78)),
                ((to_b(xb, y1, z0), to_b(xb, y1, z1), to_b(xf, y1, z1), to_b(xf, y1, z0)), rgb_trim, (ao_back * 0.65, ao_back * 0.65, ao_back * 0.82, ao_back * 0.82)),
                ((to_b(xf, y0, z0), to_b(xf, y0, z1), to_b(xb, y0, z1), to_b(xb, y0, z0)), rgb_trim, (0.68, 0.68, 0.48, 0.48)),
                ((to_b(xf, y0, z0), to_b(xb, y0, z0), to_b(xb, y1, z0), to_b(xf, y1, z0)), rgb_trim, (0.52, 0.34, 0.30, 0.48)),
                ((to_b(xb, y0, z1), to_b(xf, y0, z1), to_b(xf, y1, z1), to_b(xb, y1, z1)), rgb_trim, (0.34, 0.52, 0.48, 0.30)),
            ]
        else:
            cavity_faces = [
                ((to_b(xb, y0, z1), to_b(xb, y0, z0), to_b(xb, y1, z0), to_b(xb, y1, z1)), rgb_back, (ao_back * 0.95, ao_back * 0.95, ao_back * 0.78, ao_back * 0.78)),
                ((to_b(xb, y1, z1), to_b(xb, y1, z0), to_b(xf, y1, z0), to_b(xf, y1, z1)), rgb_trim, (ao_back * 0.65, ao_back * 0.65, ao_back * 0.82, ao_back * 0.82)),
                ((to_b(xf, y0, z1), to_b(xf, y0, z0), to_b(xb, y0, z0), to_b(xb, y0, z1)), rgb_trim, (0.68, 0.68, 0.48, 0.48)),
                ((to_b(xb, y0, z0), to_b(xf, y0, z0), to_b(xf, y1, z0), to_b(xb, y1, z0)), rgb_trim, (0.34, 0.52, 0.48, 0.30)),
                ((to_b(xf, y0, z1), to_b(xb, y0, z1), to_b(xb, y1, z1), to_b(xf, y1, z1)), rgb_trim, (0.52, 0.34, 0.30, 0.48)),
            ]

    for coords, rgb, shades in cavity_faces:
        add_quad_to_bmesh(bm, color_layer, coords, rgb, shades)


def add_polygonal_prism_or_cone_to_bmesh(bm, color_layer, center, r_bot, r_top, height, segments, hex_color, ao_bot=0.75, ao_top=1.08, cap_top=True):
    """Adds an N-sided polygonal prism or spire frustum."""
    cx, cy, cz = center
    y0 = cy - height * 0.5
    y1 = cy + height * 0.5
    rgb = srgb_hex_to_rgb(hex_color)

    for i in range(segments):
        a0 = (2.0 * math.pi * i) / segments
        a1 = (2.0 * math.pi * (i + 1)) / segments
        xb0, zb0 = cx + math.cos(a0) * r_bot, cz + math.sin(a0) * r_bot
        xb1, zb1 = cx + math.cos(a1) * r_bot, cz + math.sin(a1) * r_bot
        xt0, zt0 = cx + math.cos(a0) * r_top, cz + math.sin(a0) * r_top
        xt1, zt1 = cx + math.cos(a1) * r_top, cz + math.sin(a1) * r_top

        coords = (to_b(xb0, y0, zb0), to_b(xb1, y0, zb1), to_b(xt1, y1, zt1), to_b(xt0, y1, zt0))
        add_quad_to_bmesh(bm, color_layer, coords, rgb, (ao_bot, ao_bot, ao_top, ao_top))

        if cap_top and r_top > 0.002 and i % 2 == 0 and i + 1 < segments:
            a2 = (2.0 * math.pi * (i + 2)) / segments
            xt2, zt2 = cx + math.cos(a2) * r_top, cz + math.sin(a2) * r_top
            cap_coords = (to_b(cx, y1, cz), to_b(xt0, y1, zt0), to_b(xt1, y1, zt1), to_b(xt2, y1, zt2))
            add_quad_to_bmesh(bm, color_layer, cap_coords, rgb, (ao_top * 1.05,) * 4)


def add_extruded_rose_window(bm, color_layer, center, r_outer, r_inner, depth, segments, frame_hex, glass_hex):
    """Adds an extruded 6-segment West Rose Window with limestone tracery and stained glass."""
    cx, cy, cz = center
    z_front = cz - depth
    rgb_frame = srgb_hex_to_rgb(frame_hex)
    rgb_glass = srgb_hex_to_rgb(glass_hex)

    for i in range(segments):
        a0 = (2.0 * math.pi * i) / segments
        a1 = (2.0 * math.pi * (i + 1)) / segments
        xo0, yo0 = cx + math.cos(a0) * r_outer, cy + math.sin(a0) * r_outer
        xo1, yo1 = cx + math.cos(a1) * r_outer, cy + math.sin(a1) * r_outer
        xi0, yi0 = cx + math.cos(a0) * r_inner, cy + math.sin(a0) * r_inner
        xi1, yi1 = cx + math.cos(a1) * r_inner, cy + math.sin(a1) * r_inner

        # Outer cylinder rim
        add_quad_to_bmesh(
            bm, color_layer,
            (to_b(xo0, yo0, cz), to_b(xo1, yo1, cz), to_b(xo1, yo1, z_front), to_b(xo0, yo0, z_front)),
            rgb_frame, (0.85, 0.85, 1.04, 1.04)
        )
        # Front limestone bevel ring
        add_quad_to_bmesh(
            bm, color_layer,
            (to_b(xo0, yo0, z_front), to_b(xo1, yo1, z_front), to_b(xi1, yi1, z_front), to_b(xi0, yi0, z_front)),
            rgb_frame, (1.02, 1.02, 0.92, 0.92)
        )
        # Inner recessed reveal
        add_quad_to_bmesh(
            bm, color_layer,
            (to_b(xi0, yi0, z_front), to_b(xi1, yi1, z_front), to_b(xi1, yi1, cz - depth * 0.35), to_b(xi0, yi0, cz - depth * 0.35)),
            rgb_frame, (0.68, 0.68, 0.42, 0.42)
        )
        # Stained glass petal quad
        add_quad_to_bmesh(
            bm, color_layer,
            (to_b(cx, cy, cz - depth * 0.35), to_b(xi0, yi0, cz - depth * 0.35), to_b((xi0 + xi1) * 0.5, (yi0 + yi1) * 0.5, cz - depth * 0.35), to_b(xi1, yi1, cz - depth * 0.35)),
            rgb_glass, (1.05, 0.85, 0.95, 0.85)
        )


def build_saigon_notre_dame_cathedral():
    mesh = bpy.data.meshes.new("SaigonNotreDameCathedral")
    bm = bmesh.new()
    color_layer = bm.loops.layers.color.new("COLOR_0")

    # Footprint strictly within width <= 0.68m (X in [-0.34, +0.34]), depth <= 0.76m (Z in [-0.38, +0.38]), height = 1.42m (Y in [0.0, 1.42])
    frustums = [
        # 1. Stepped Granite Plinth Base (Y: 0.00 -> 0.05m, 0.68m x 0.76m)
        {"center": (0.0, 0.025, 0.0), "size_bottom": (0.68, 0.05, 0.76), "size_top": (0.66, 0.74), "color": "#CBD5E1", "ao_bottom": 0.48, "ao_top": 0.92},
        {"center": (0.0, 0.060, 0.0), "size_bottom": (0.64, 0.02, 0.72), "color": "#F8FAFC", "ao_bottom": 0.82, "ao_top": 1.05, "open_bottom": True},

        # 2. Cruciform Main Nave & Side Aisles (Y: 0.07 -> 0.43m)
        {"center": (0.0, 0.250, 0.04), "size_bottom": (0.36, 0.36, 0.56), "color": "#B45309", "ao_bottom": 0.68, "ao_top": 1.02, "open_bottom": True},
        {"center": (-0.22, 0.195, 0.04), "size_bottom": (0.12, 0.25, 0.50), "color": "#B45309", "ao_bottom": 0.64, "ao_top": 0.98, "open_bottom": True},
        {"center": (0.22, 0.195, 0.04), "size_bottom": (0.12, 0.25, 0.50), "color": "#B45309", "ao_bottom": 0.64, "ao_top": 0.98, "open_bottom": True},
        # Side aisle pitched roofs
        {"center": (-0.22, 0.345, 0.04), "size_bottom": (0.13, 0.05, 0.51), "size_top": (0.04, 0.48), "color": "#78350F", "ao_bottom": 0.74, "ao_top": 1.02, "open_bottom": True},
        {"center": (0.22, 0.345, 0.04), "size_bottom": (0.13, 0.05, 0.51), "size_top": (0.04, 0.48), "color": "#78350F", "ao_bottom": 0.74, "ao_top": 1.02, "open_bottom": True},

        # 3. Cruciform Transept Wings (West-East cross-arm at Z = 0.12, width = 0.64m)
        {"center": (0.0, 0.240, 0.12), "size_bottom": (0.64, 0.34, 0.20), "color": "#B45309", "ao_bottom": 0.66, "ao_top": 1.02, "open_bottom": True},
        {"center": (0.0, 0.418, 0.12), "size_bottom": (0.66, 0.016, 0.22), "color": "#F8FAFC", "ao_bottom": 0.88, "ao_top": 1.08, "open_bottom": True},
        {"center": (0.0, 0.475, 0.12), "size_bottom": (0.64, 0.10, 0.20), "size_top": (0.60, 0.02), "color": "#78350F", "ao_bottom": 0.76, "ao_top": 1.04, "open_bottom": True},

        # 4. Nave Clerestory Cornice & Pitched Terracotta Roof (Y: 0.43 -> 0.58m)
        {"center": (0.0, 0.438, 0.04), "size_bottom": (0.38, 0.018, 0.58), "color": "#F8FAFC", "ao_bottom": 0.88, "ao_top": 1.08, "open_bottom": True},
        {"center": (0.0, 0.515, 0.04), "size_bottom": (0.37, 0.135, 0.56), "size_top": (0.03, 0.52), "color": "#78350F", "ao_bottom": 0.76, "ao_top": 1.06, "open_bottom": True},
        {"center": (0.0, 0.588, 0.04), "size_bottom": (0.04, 0.016, 0.52), "color": "#CBD5E1", "ao_bottom": 0.90, "ao_top": 1.10, "open_bottom": True},

        # 5. West Narthex Center Facade & Rose Window Gable (Z = -0.24)
        {"center": (0.0, 0.265, -0.24), "size_bottom": (0.28, 0.39, 0.14), "color": "#B45309", "ao_bottom": 0.68, "ao_top": 1.04, "open_bottom": True},
        {"center": (0.0, 0.468, -0.24), "size_bottom": (0.30, 0.018, 0.16), "color": "#F8FAFC", "ao_bottom": 0.90, "ao_top": 1.10, "open_bottom": True},
        {"center": (0.0, 0.535, -0.24), "size_bottom": (0.28, 0.115, 0.14), "size_top": (0.06, 0.10), "color": "#B45309", "ao_bottom": 0.78, "ao_top": 1.05, "open_bottom": True},
        # Clock Pediment at top of West Center Gable
        {"center": (0.0, 0.605, -0.25), "size_bottom": (0.10, 0.05, 0.08), "color": "#F8FAFC", "ao_bottom": 0.92, "ao_top": 1.12, "open_bottom": True},
    ]

    # Lateral Nave Buttresses (4 pairs along Left & Right flanks)
    for bz in (-0.10, 0.0, 0.22, 0.30):
        frustums.append({"center": (-0.285, 0.19, bz), "size_bottom": (0.03, 0.24, 0.035), "size_top": (0.018, 0.028), "color": "#B45309", "ao_bottom": 0.62, "ao_top": 0.96, "open_bottom": True})
        frustums.append({"center": (0.285, 0.19, bz), "size_bottom": (0.03, 0.24, 0.035), "size_top": (0.018, 0.028), "color": "#B45309", "ao_bottom": 0.62, "ao_top": 0.96, "open_bottom": True})

    # 6. Twin 6-Tier Bell Towers (tx = -0.21, +0.21, tz = -0.25)
    for tx in (-0.21, 0.21):
        tz = -0.25
        # Tier 1: Lower Base Shaft (Y: 0.07 -> 0.25)
        frustums.append({"center": (tx, 0.160, tz), "size_bottom": (0.20, 0.18, 0.20), "color": "#B45309", "ao_bottom": 0.64, "ao_top": 0.96, "open_bottom": True})
        frustums.append({"center": (tx, 0.258, tz), "size_bottom": (0.215, 0.016, 0.215), "color": "#F8FAFC", "ao_bottom": 0.88, "ao_top": 1.08, "open_bottom": True})
        # Tier 2: Mid-Lower Romanesque Lancet Shaft (Y: 0.266 -> 0.45)
        frustums.append({"center": (tx, 0.358, tz), "size_bottom": (0.192, 0.184, 0.192), "color": "#B45309", "ao_bottom": 0.70, "ao_top": 1.00, "open_bottom": True})
        frustums.append({"center": (tx, 0.458, tz), "size_bottom": (0.208, 0.016, 0.208), "color": "#F8FAFC", "ao_bottom": 0.90, "ao_top": 1.10, "open_bottom": True})
        # Tier 3: Mid-Upper Gallery Shaft (Y: 0.466 -> 0.65)
        frustums.append({"center": (tx, 0.558, tz), "size_bottom": (0.184, 0.184, 0.184), "color": "#B45309", "ao_bottom": 0.74, "ao_top": 1.04, "open_bottom": True})
        frustums.append({"center": (tx, 0.658, tz), "size_bottom": (0.200, 0.016, 0.200), "color": "#F8FAFC", "ao_bottom": 0.92, "ao_top": 1.12, "open_bottom": True})
        # Tier 4: Upper Louvred Belfry Stage (Y: 0.666 -> 0.86)
        frustums.append({"center": (tx, 0.763, tz), "size_bottom": (0.176, 0.194, 0.176), "color": "#B45309", "ao_bottom": 0.78, "ao_top": 1.06, "open_bottom": True})
        frustums.append({"center": (tx, 0.868, tz), "size_bottom": (0.194, 0.018, 0.194), "color": "#F8FAFC", "ao_bottom": 0.94, "ao_top": 1.14, "open_bottom": True})

        # Tier 5: 4 Corner Gothic Pinnacles around Spire Base (Y: 0.877 -> 0.98)
        for px in (-0.072, 0.072):
            for pz in (-0.072, 0.072):
                frustums.append({
                    "center": (tx + px, 0.910, tz + pz),
                    "size_bottom": (0.032, 0.065, 0.032),
                    "size_top": (0.024, 0.024),
                    "color": "#F8FAFC",
                    "ao_bottom": 0.88,
                    "ao_top": 1.10,
                    "open_bottom": True,
                })
                frustums.append({
                    "center": (tx + px, 0.965, tz + pz),
                    "size_bottom": (0.028, 0.045, 0.028),
                    "size_top": (0.004, 0.004),
                    "color": "#475569",
                    "ao_bottom": 0.82,
                    "ao_top": 1.08,
                    "open_bottom": True,
                })

        # Tier 6: Top Finial Brass Cross (Y: 1.32 -> 1.42m, exact 1.42m apex!)
        frustums.append({"center": (tx, 1.370, tz), "size_bottom": (0.014, 0.10, 0.014), "color": "#F59E0B", "ao_bottom": 0.95, "ao_top": 1.15, "open_bottom": True})
        frustums.append({"center": (tx, 1.390, tz), "size_bottom": (0.056, 0.014, 0.014), "color": "#F59E0B", "ao_bottom": 0.98, "ao_top": 1.15, "open_bottom": True})

    for f_spec in frustums:
        add_tectonic_frustum_to_bmesh(bm, color_layer, f_spec)

    # 7. Polygonal 6-Segment Apse at East Choir End (Z = +0.30, r = 0.16)
    add_polygonal_prism_or_cone_to_bmesh(bm, color_layer, (0.0, 0.21, 0.28), 0.16, 0.15, 0.28, 6, "#B45309", 0.65, 1.00, cap_top=False)
    add_polygonal_prism_or_cone_to_bmesh(bm, color_layer, (0.0, 0.36, 0.28), 0.17, 0.17, 0.02, 6, "#F8FAFC", 0.88, 1.08, cap_top=False)
    add_polygonal_prism_or_cone_to_bmesh(bm, color_layer, (0.0, 0.42, 0.28), 0.165, 0.02, 0.10, 6, "#78350F", 0.75, 1.05, cap_top=True)

    # 8. Twin Octagonal Slate Spires (8 segments, Y: 0.877 -> 1.325)
    for tx in (-0.21, 0.21):
        tz = -0.25
        # Lower spire drum
        add_polygonal_prism_or_cone_to_bmesh(bm, color_layer, (tx, 0.915, tz), 0.082, 0.072, 0.076, 8, "#B45309", 0.80, 1.05, cap_top=False)
        # Main octagonal slate spire cone
        add_polygonal_prism_or_cone_to_bmesh(bm, color_layer, (tx, 1.138, tz), 0.076, 0.010, 0.370, 8, "#334155", 0.72, 1.08, cap_top=True)

    # 9. Extruded 6-Segment West Rose Window (at center = (0.0, 0.35, -0.31))
    add_extruded_rose_window(bm, color_layer, (0.0, 0.35, -0.31), 0.068, 0.046, 0.022, 6, "#F8FAFC", "#0284C7")

    # 10. Inward-Recessed 5-Face Architectural Cavities (Portals, Belfry Louvres, Nave Lancets)
    cavities = [
        # 3 West Romanesque Portals (Center Grand Portal + 2 Tower Base Portals)
        {"opening_center": (0.0, 0.145, -0.31), "cavity_size": (0.095, 0.15, 0.036), "color": "#451A03", "reveal_color": "#F8FAFC", "ao_cavity": 0.22, "orientation": "Z-"},
        {"opening_center": (-0.21, 0.135, -0.35), "cavity_size": (0.068, 0.13, 0.032), "color": "#451A03", "reveal_color": "#F8FAFC", "ao_cavity": 0.24, "orientation": "Z-"},
        {"opening_center": (0.21, 0.135, -0.35), "cavity_size": (0.068, 0.13, 0.032), "color": "#451A03", "reveal_color": "#F8FAFC", "ao_cavity": 0.24, "orientation": "Z-"},

        # Twin Tower Tier 2 & Tier 3 West Lancet Windows (4 cavities)
        {"opening_center": (-0.21, 0.358, -0.346), "cavity_size": (0.052, 0.11, 0.028), "color": "#1E293B", "reveal_color": "#CBD5E1", "ao_cavity": 0.25, "orientation": "Z-"},
        {"opening_center": (0.21, 0.358, -0.346), "cavity_size": (0.052, 0.11, 0.028), "color": "#1E293B", "reveal_color": "#CBD5E1", "ao_cavity": 0.25, "orientation": "Z-"},
        {"opening_center": (-0.21, 0.558, -0.342), "cavity_size": (0.050, 0.11, 0.028), "color": "#1E293B", "reveal_color": "#CBD5E1", "ao_cavity": 0.26, "orientation": "Z-"},
        {"opening_center": (0.21, 0.558, -0.342), "cavity_size": (0.050, 0.11, 0.028), "color": "#1E293B", "reveal_color": "#CBD5E1", "ao_cavity": 0.26, "orientation": "Z-"},

        # Twin Tower Tier 4 Belfry Double Louvred Lancets on West, East, Left, Right faces (12 cavities)
        {"opening_center": (-0.235, 0.763, -0.338), "cavity_size": (0.034, 0.12, 0.026), "color": "#0F172A", "reveal_color": "#F8FAFC", "ao_cavity": 0.22, "orientation": "Z-"},
        {"opening_center": (-0.185, 0.763, -0.338), "cavity_size": (0.034, 0.12, 0.026), "color": "#0F172A", "reveal_color": "#F8FAFC", "ao_cavity": 0.22, "orientation": "Z-"},
        {"opening_center": (0.185, 0.763, -0.338), "cavity_size": (0.034, 0.12, 0.026), "color": "#0F172A", "reveal_color": "#F8FAFC", "ao_cavity": 0.22, "orientation": "Z-"},
        {"opening_center": (0.235, 0.763, -0.338), "cavity_size": (0.034, 0.12, 0.026), "color": "#0F172A", "reveal_color": "#F8FAFC", "ao_cavity": 0.22, "orientation": "Z-"},
        {"opening_center": (-0.21, 0.763, -0.162), "cavity_size": (0.056, 0.12, 0.026), "color": "#0F172A", "reveal_color": "#F8FAFC", "ao_cavity": 0.24, "orientation": "Z+"},
        {"opening_center": (0.21, 0.763, -0.162), "cavity_size": (0.056, 0.12, 0.026), "color": "#0F172A", "reveal_color": "#F8FAFC", "ao_cavity": 0.24, "orientation": "Z+"},
        {"opening_center": (-0.298, 0.763, -0.25), "cavity_size": (0.056, 0.12, 0.026), "color": "#0F172A", "reveal_color": "#F8FAFC", "ao_cavity": 0.24, "orientation": "X-"},
        {"opening_center": (0.298, 0.763, -0.25), "cavity_size": (0.056, 0.12, 0.026), "color": "#0F172A", "reveal_color": "#F8FAFC", "ao_cavity": 0.24, "orientation": "X+"},
        {"opening_center": (-0.302, 0.558, -0.25), "cavity_size": (0.050, 0.11, 0.026), "color": "#1E293B", "reveal_color": "#CBD5E1", "ao_cavity": 0.26, "orientation": "X-"},
        {"opening_center": (0.302, 0.558, -0.25), "cavity_size": (0.050, 0.11, 0.026), "color": "#1E293B", "reveal_color": "#CBD5E1", "ao_cavity": 0.26, "orientation": "X+"},

        # Lateral Clerestory & Aisle Arched Lancet Windows (10 cavities)
        {"opening_center": (-0.28, 0.19, -0.05), "cavity_size": (0.05, 0.11, 0.025), "color": "#0C4A6E", "reveal_color": "#FDE68A", "ao_cavity": 0.26, "orientation": "X-"},
        {"opening_center": (-0.28, 0.19, 0.25), "cavity_size": (0.05, 0.11, 0.025), "color": "#0C4A6E", "reveal_color": "#FDE68A", "ao_cavity": 0.26, "orientation": "X-"},
        {"opening_center": (0.28, 0.19, -0.05), "cavity_size": (0.05, 0.11, 0.025), "color": "#0C4A6E", "reveal_color": "#FDE68A", "ao_cavity": 0.26, "orientation": "X+"},
        {"opening_center": (0.28, 0.19, 0.25), "cavity_size": (0.05, 0.11, 0.025), "color": "#0C4A6E", "reveal_color": "#FDE68A", "ao_cavity": 0.26, "orientation": "X+"},
        {"opening_center": (-0.32, 0.24, 0.12), "cavity_size": (0.08, 0.16, 0.028), "color": "#0284C7", "reveal_color": "#F8FAFC", "ao_cavity": 0.25, "orientation": "X-"},
        {"opening_center": (0.32, 0.24, 0.12), "cavity_size": (0.08, 0.16, 0.028), "color": "#0284C7", "reveal_color": "#F8FAFC", "ao_cavity": 0.25, "orientation": "X+"},
        {"opening_center": (-0.18, 0.36, -0.04), "cavity_size": (0.05, 0.07, 0.024), "color": "#0C4A6E", "reveal_color": "#F8FAFC", "ao_cavity": 0.28, "orientation": "X-"},
        {"opening_center": (-0.18, 0.36, 0.22), "cavity_size": (0.05, 0.07, 0.024), "color": "#0C4A6E", "reveal_color": "#F8FAFC", "ao_cavity": 0.28, "orientation": "X-"},
        {"opening_center": (0.18, 0.36, -0.04), "cavity_size": (0.05, 0.07, 0.024), "color": "#0C4A6E", "reveal_color": "#F8FAFC", "ao_cavity": 0.28, "orientation": "X+"},
        {"opening_center": (0.18, 0.36, 0.22), "cavity_size": (0.05, 0.07, 0.024), "color": "#0C4A6E", "reveal_color": "#F8FAFC", "ao_cavity": 0.28, "orientation": "X+"},
        # East Apse Choir & Transept Rear Lancets (8 cavities)
        {"opening_center": (-0.20, 0.24, 0.22), "cavity_size": (0.05, 0.12, 0.024), "color": "#0C4A6E", "reveal_color": "#F8FAFC", "ao_cavity": 0.25, "orientation": "Z+"},
        {"opening_center": (0.20, 0.24, 0.22), "cavity_size": (0.05, 0.12, 0.024), "color": "#0C4A6E", "reveal_color": "#F8FAFC", "ao_cavity": 0.25, "orientation": "Z+"},
        {"opening_center": (-0.20, 0.24, 0.02), "cavity_size": (0.05, 0.12, 0.024), "color": "#0C4A6E", "reveal_color": "#F8FAFC", "ao_cavity": 0.25, "orientation": "Z-"},
        {"opening_center": (0.20, 0.24, 0.02), "cavity_size": (0.05, 0.12, 0.024), "color": "#0C4A6E", "reveal_color": "#F8FAFC", "ao_cavity": 0.25, "orientation": "Z-"},
        {"opening_center": (-0.07, 0.21, 0.38), "cavity_size": (0.04, 0.11, 0.022), "color": "#0C4A6E", "reveal_color": "#FDE68A", "ao_cavity": 0.24, "orientation": "Z+"},
        {"opening_center": (0.07, 0.21, 0.38), "cavity_size": (0.04, 0.11, 0.022), "color": "#0C4A6E", "reveal_color": "#FDE68A", "ao_cavity": 0.24, "orientation": "Z+"},
        {"opening_center": (-0.14, 0.21, 0.32), "cavity_size": (0.04, 0.11, 0.022), "color": "#0C4A6E", "reveal_color": "#FDE68A", "ao_cavity": 0.24, "orientation": "X-"},
        {"opening_center": (0.14, 0.21, 0.32), "cavity_size": (0.04, 0.11, 0.022), "color": "#0C4A6E", "reveal_color": "#FDE68A", "ao_cavity": 0.24, "orientation": "X+"},
    ]

    for c_spec in cavities:
        add_recessed_cavity_bay_to_bmesh(bm, color_layer, c_spec)

    # 11. Crossing Lantern Flèche (6 segments at Nave/Transept intersection Z = 0.12, Y: 0.58 -> 0.78)
    add_polygonal_prism_or_cone_to_bmesh(bm, color_layer, (0.0, 0.62, 0.12), 0.042, 0.036, 0.08, 6, "#F8FAFC", 0.88, 1.08, cap_top=False)
    add_polygonal_prism_or_cone_to_bmesh(bm, color_layer, (0.0, 0.72, 0.12), 0.038, 0.004, 0.12, 6, "#334155", 0.78, 1.10, cap_top=True)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("SaigonNotreDameCathedral", mesh)
    bpy.context.collection.objects.link(obj)
    return obj


def create_vertex_ao_material():
    mat = bpy.data.materials.new(name="Mat_CathedralMarseilleVertexAO")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links

    bsdf = next((n for n in nodes if n.type == "BSDF_PRINCIPLED"), None)
    if bsdf is None:
        bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")

    bsdf.inputs["Roughness"].default_value = 0.58
    bsdf.inputs["Metallic"].default_value = 0.08

    vcol_node = nodes.new(type="ShaderNodeVertexColor")
    vcol_node.layer_name = "COLOR_0"
    links.new(vcol_node.outputs["Color"], bsdf.inputs["Base Color"])
    return mat


def main():
    os.makedirs(OUT_GLB_DIR, exist_ok=True)
    clear_scene()

    mat = create_vertex_ao_material()

    obj = build_saigon_notre_dame_cathedral()
    obj.data.materials.append(mat)

    poly_count = len(obj.data.polygons)
    tri_estimate = sum(len(p.vertices) - 2 for p in obj.data.polygons)
    print(f"[IMP-405][Blender 5.2] Sculpted SaigonNotreDameCathedral: {poly_count} polygons, {tri_estimate} triangles")

    bpy.ops.export_scene.gltf(
        filepath=OUT_GLB_PATH,
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        export_texcoords=False,
        export_normals=True,
        export_materials="EXPORT",
    )
    size_bytes = os.path.getsize(OUT_GLB_PATH)
    print(f"[IMP-405][Blender 5.2] Exported {OUT_GLB_PATH} ({size_bytes} bytes, {tri_estimate} tris)")


if __name__ == "__main__":
    main()

