#!/usr/bin/env python3
"""
[IMP-404] Blender 5.2 LTS Low-Poly Tectonics & Vertex-Color Baked-AO Regional Building Generator
Target Asset: public/models/buildings/mobile_archetypes_baked_ao.glb
Target TS Module: src/client/3d/procedural_mobile_blender_meshes.ts

Executes inside Blender 5.2 LTS headless CLI:
  "C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe" --background --python scripts/blender/build_mobile_regional_archetypes.py

Generates 8 regional architectural building archetypes (4 typologies x 2 levels C1/C2, 784 total triangles <= 800 budget):
  - riverine_c1 (160v), riverine_c2 (220v)     (Song Nuoc Nam Bo: Stilts plinth, recessed veranda bays, pitched tile roof)
  - resort_c1 (164v), resort_c2 (224v)         (Nghi Duong Bien & Nui: Stepped coastal terrace, recessed loggia bays, sun-deck)
  - heritage_c1 (168v), heritage_c2 (228v)     (Pho Co & Di San: Imperial eaves, recessed shophouse portals, lantern roof)
  - metropolis_c1 (172v), metropolis_c2 (232v) (Sieu Do Thi Tai Chinh: Neo-colonial arcade bays & Art Deco financial tower)

Pipeline:
  1. Uses bmesh to construct stepped tectonic frustums (plinth, facade body, cornices, regional roofs) with buried-bottom face culling (open_bottom).
  2. Carves genuine INWARD-RECESSED window/door/arch cavities (5-face niches recessed into the facade wall by 36-44mm:
     top lintel soffit, bottom sill, left/right jambs, and recessed glazing/shutter back plane).
  3. Bakes COLOR_0 vertex colors combining regional palette + vertical sun gradient + cavity Ambient Occlusion (Delta L >= 0.22).
  4. Exports public/models/buildings/mobile_archetypes_baked_ao.glb via bpy.ops.export_scene.gltf.
"""

import bpy
import bmesh
import os
from mathutils import Vector

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_GLB_DIR = os.path.join(ROOT_DIR, "public", "models", "buildings")
OUT_GLB_PATH = os.path.join(OUT_GLB_DIR, "mobile_archetypes_baked_ao.glb")


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


def add_tectonic_frustum_to_bmesh(bm, color_layer, spec):
    """
    Adds a tectonic prism/frustum in Blender Z-up coordinates (mapped from Three.js Y-up:
    Three.js (x, y, z) -> Blender (x, -z, y) so export_yup=True restores exact Three.js (x, y, z)).
    When open_bottom=True, omits the buried internal -Y face (5 faces = 20 verts instead of 6 faces = 24 verts).
    """
    cx, cy, cz = spec["center"]
    wx_b, hy, wz_b = spec["size_bottom"]
    wx_t, wz_t = spec.get("size_top", (wx_b, wz_b))
    r, g, b = srgb_hex_to_rgb(spec["color"])
    ao_bot = spec.get("ao_bottom", 0.68)
    ao_top = spec.get("ao_top", 1.05)
    open_bottom = spec.get("open_bottom", False)

    y0 = cy - hy * 0.5
    y1 = cy + hy * 0.5
    xb0, xb1 = cx - wx_b * 0.5, cx + wx_b * 0.5
    zb0, zb1 = cz - wz_b * 0.5, cz + wz_b * 0.5
    xt0, xt1 = cx - wx_t * 0.5, cx + wx_t * 0.5
    zt0, zt1 = cz - wz_t * 0.5, cz + wz_t * 0.5

    def to_b(x, y, z):
        return Vector((x, -z, y))

    faces_spec = [
        # Front (+Z in Three.js -> -Y in Blender)
        ((to_b(xb0, y0, zb1), to_b(xb1, y0, zb1), to_b(xt1, y1, zt1), to_b(xt0, y1, zt1)), (ao_bot, ao_bot, ao_top, ao_top)),
        # Back (-Z in Three.js -> +Y in Blender)
        ((to_b(xb1, y0, zb0), to_b(xb0, y0, zb0), to_b(xt0, y1, zt0), to_b(xt1, y1, zt0)), (ao_bot * 0.92, ao_bot * 0.92, ao_top * 0.95, ao_top * 0.95)),
        # Right (+X)
        ((to_b(xb1, y0, zb1), to_b(xb1, y0, zb0), to_b(xt1, y1, zt0), to_b(xt1, y1, zt1)), (ao_bot * 0.95, ao_bot * 0.95, ao_top * 0.98, ao_top * 0.98)),
        # Left (-X)
        ((to_b(xb0, y0, zb0), to_b(xb0, y0, zb1), to_b(xt0, y1, zt1), to_b(xt0, y1, zt0)), (ao_bot * 0.90, ao_bot * 0.90, ao_top * 0.94, ao_top * 0.94)),
        # Top (+Y in Three.js -> +Z in Blender)
        ((to_b(xt0, y1, zt1), to_b(xt1, y1, zt1), to_b(xt1, y1, zt0), to_b(xt0, y1, zt0)), (ao_top * 1.06, ao_top * 1.06, ao_top * 1.06, ao_top * 1.06)),
    ]
    if not open_bottom:
        faces_spec.append(
            ((to_b(xb0, y0, zb0), to_b(xb1, y0, zb0), to_b(xb1, y0, zb1), to_b(xb0, y0, zb1)), (ao_bot * 0.65, ao_bot * 0.65, ao_bot * 0.65, ao_bot * 0.65))
        )

    for coords, shades in faces_spec:
        verts = [bm.verts.new(c) for c in coords]
        face = bm.faces.new(verts)
        for loop, shade in zip(face.loops, shades):
            loop[color_layer] = (
                clamp01(r * shade),
                clamp01(g * shade),
                clamp01(b * shade),
                1.0,
            )


def add_recessed_cavity_bay_to_bmesh(bm, color_layer, spec):
    """
    Carves an INWARD-RECESSED 5-face architectural window/door/arch cavity niche into the facade wall:
      - Recessed back plane at z_back = wall_z - depth (with deep cavity AO)
      - Top lintel soffit (normal -Y in Three.js, deepest shadow AO)
      - Bottom sill ledge (normal +Y in Three.js, sky bounce AO)
      - Left jamb reveal (normal +X in Three.js, lateral cavity AO)
      - Right jamb reveal (normal -X in Three.js, lateral cavity AO)
    """
    cx, cy, wall_z = spec["opening_center"]
    width, height, depth = spec["cavity_size"]
    r_back, g_back, b_back = srgb_hex_to_rgb(spec["color"])
    r_trim, g_trim, b_trim = srgb_hex_to_rgb(spec.get("reveal_color", spec["color"]))
    ao_back = spec.get("ao_cavity", 0.28)

    x0, x1 = cx - width * 0.5, cx + width * 0.5
    y0, y1 = cy - height * 0.5, cy + height * 0.5
    zf = wall_z
    zb = wall_z - depth  # Strictly recessed INWARD into the building mass

    def to_b(x, y, z):
        return Vector((x, -z, y))

    cavity_faces = [
        # 1. Recessed back glazing/shutter plane (+Z normal)
        ((to_b(x0, y0, zb), to_b(x1, y0, zb), to_b(x1, y1, zb), to_b(x0, y1, zb)), (r_back, g_back, b_back), (ao_back * 0.95, ao_back * 0.95, ao_back * 0.78, ao_back * 0.78)),
        # 2. Top lintel soffit (-Y normal, deep overhang occlusion)
        ((to_b(x0, y1, zb), to_b(x1, y1, zb), to_b(x1, y1, zf), to_b(x0, y1, zf)), (r_trim, g_trim, b_trim), (ao_back * 0.65, ao_back * 0.65, ao_back * 0.82, ao_back * 0.82)),
        # 3. Bottom sill ledge (+Y normal, upward sky bounce)
        ((to_b(x0, y0, zf), to_b(x1, y0, zf), to_b(x1, y0, zb), to_b(x0, y0, zb)), (r_trim, g_trim, b_trim), (0.68, 0.68, 0.48, 0.48)),
        # 4. Left jamb reveal (+X normal, inward reveal gradient)
        ((to_b(x0, y0, zf), to_b(x0, y0, zb), to_b(x0, y1, zb), to_b(x0, y1, zf)), (r_trim, g_trim, b_trim), (0.52, 0.34, 0.30, 0.48)),
        # 5. Right jamb reveal (-X normal, inward reveal gradient)
        ((to_b(x1, y0, zb), to_b(x1, y0, zf), to_b(x1, y1, zf), to_b(x1, y1, zb)), (r_trim, g_trim, b_trim), (0.34, 0.52, 0.48, 0.30)),
    ]

    for coords, (cr, cg, cb), shades in cavity_faces:
        verts = [bm.verts.new(c) for c in coords]
        face = bm.faces.new(verts)
        for loop, shade in zip(face.loops, shades):
            loop[color_layer] = (
                clamp01(cr * shade),
                clamp01(cg * shade),
                clamp01(cb * shade),
                1.0,
            )


ARCHETYPE_BLENDER_SPECS = {
    # riverine_c1: 5 frustums (30 quads) + 2 cavities (10 quads) = 40 quads (160 verts, 80 tris)
    "riverine_c1": {
        "frustums": [
            {"center": (0.0, 0.035, 0.0), "size_bottom": (0.56, 0.07, 0.46), "color": "#78350F", "ao_bottom": 0.45, "ao_top": 0.85},
            {"center": (0.0, 0.19, 0.0), "size_bottom": (0.50, 0.24, 0.40), "color": "#FDE68A", "ao_bottom": 0.72, "ao_top": 1.05},
            {"center": (0.0, 0.32, 0.0), "size_bottom": (0.54, 0.025, 0.44), "color": "#FEF3C7", "ao_bottom": 0.78, "ao_top": 1.08},
            {"center": (0.0, 0.41, 0.0), "size_bottom": (0.58, 0.16, 0.48), "size_top": (0.18, 0.10), "color": "#C2410C", "ao_bottom": 0.75, "ao_top": 1.06},
            {"center": (0.0, 0.50, 0.0), "size_bottom": (0.24, 0.03, 0.12), "color": "#7C2D12", "ao_bottom": 0.85, "ao_top": 1.10},
        ],
        "cavities": [
            {"opening_center": (-0.11, 0.14, 0.20), "cavity_size": (0.13, 0.16, 0.038), "color": "#451A03", "reveal_color": "#92400E", "ao_cavity": 0.28},
            {"opening_center": (0.11, 0.16, 0.20), "cavity_size": (0.14, 0.12, 0.036), "color": "#78350F", "reveal_color": "#B45309", "ao_cavity": 0.32},
        ],
    },
    # resort_c1: 1 full + 5 open_bottom frustums (31 quads) + 2 cavities (10 quads) = 41 quads (164 verts, 82 tris)
    "resort_c1": {
        "frustums": [
            {"center": (0.0, 0.03, 0.0), "size_bottom": (0.58, 0.06, 0.48), "color": "#CBD5E1", "ao_bottom": 0.48, "ao_top": 0.88},
            {"center": (0.0, 0.18, 0.0), "size_bottom": (0.52, 0.24, 0.42), "color": "#F8FAFC", "ao_bottom": 0.76, "ao_top": 1.06, "open_bottom": True},
            {"center": (0.0, 0.24, 0.222), "size_bottom": (0.48, 0.024, 0.055), "color": "#E0F2FE", "ao_bottom": 0.70, "ao_top": 1.04, "open_bottom": True},
            {"center": (0.0, 0.325, 0.0), "size_bottom": (0.56, 0.045, 0.46), "color": "#0284C7", "ao_bottom": 0.74, "ao_top": 1.05, "open_bottom": True},
            {"center": (-0.08, 0.375, -0.04), "size_bottom": (0.28, 0.055, 0.24), "color": "#38BDF8", "ao_bottom": 0.80, "ao_top": 1.08, "open_bottom": True},
            {"center": (0.12, 0.365, 0.06), "size_bottom": (0.16, 0.035, 0.16), "color": "#F1F5F9", "ao_bottom": 0.85, "ao_top": 1.10, "open_bottom": True},
        ],
        "cavities": [
            {"opening_center": (-0.12, 0.13, 0.21), "cavity_size": (0.14, 0.16, 0.040), "color": "#0369A1", "reveal_color": "#CBD5E1", "ao_cavity": 0.26},
            {"opening_center": (0.12, 0.15, 0.21), "cavity_size": (0.16, 0.13, 0.038), "color": "#0284C7", "reveal_color": "#E2E8F0", "ao_cavity": 0.30},
        ],
    },
    # heritage_c1: 2 full + 3 open_bottom frustums (27 quads) + 3 cavities (15 quads) = 42 quads (168 verts, 84 tris)
    "heritage_c1": {
        "frustums": [
            {"center": (0.0, 0.03, 0.0), "size_bottom": (0.58, 0.06, 0.48), "color": "#475569", "ao_bottom": 0.42, "ao_top": 0.82},
            {"center": (0.0, 0.175, 0.0), "size_bottom": (0.51, 0.23, 0.41), "color": "#FEF08A", "ao_bottom": 0.72, "ao_top": 1.04},
            {"center": (0.0, 0.305, 0.0), "size_bottom": (0.56, 0.03, 0.46), "color": "#991B1B", "ao_bottom": 0.68, "ao_top": 0.98, "open_bottom": True},
            {"center": (0.0, 0.39, 0.0), "size_bottom": (0.60, 0.14, 0.50), "size_top": (0.28, 0.20), "color": "#D97706", "ao_bottom": 0.74, "ao_top": 1.05, "open_bottom": True},
            {"center": (0.0, 0.495, 0.0), "size_bottom": (0.30, 0.08, 0.22), "size_top": (0.14, 0.08), "color": "#B45309", "ao_bottom": 0.84, "ao_top": 1.12, "open_bottom": True},
        ],
        "cavities": [
            {"opening_center": (0.0, 0.13, 0.205), "cavity_size": (0.15, 0.16, 0.042), "color": "#7F1D1D", "reveal_color": "#92400E", "ao_cavity": 0.25},
            {"opening_center": (-0.16, 0.16, 0.205), "cavity_size": (0.09, 0.11, 0.036), "color": "#451A03", "reveal_color": "#B45309", "ao_cavity": 0.28},
            {"opening_center": (0.16, 0.16, 0.205), "cavity_size": (0.09, 0.11, 0.036), "color": "#451A03", "reveal_color": "#B45309", "ao_cavity": 0.28},
        ],
    },
    # metropolis_c1: 3 full + 1 open_bottom frustums (23 quads) + 4 cavities (20 quads) = 43 quads (172 verts, 86 tris)
    "metropolis_c1": {
        "frustums": [
            {"center": (0.0, 0.028, 0.0), "size_bottom": (0.56, 0.056, 0.46), "color": "#334155", "ao_bottom": 0.40, "ao_top": 0.80},
            {"center": (0.0, 0.19, 0.0), "size_bottom": (0.52, 0.27, 0.42), "color": "#FEF3C7", "ao_bottom": 0.74, "ao_top": 1.05},
            {"center": (0.0, 0.34, 0.0), "size_bottom": (0.56, 0.03, 0.46), "color": "#F8FAFC", "ao_bottom": 0.80, "ao_top": 1.08},
            {"center": (0.0, 0.44, 0.0), "size_bottom": (0.54, 0.17, 0.44), "size_top": (0.22, 0.16), "color": "#B91C1C", "ao_bottom": 0.76, "ao_top": 1.08, "open_bottom": True},
        ],
        "cavities": [
            {"opening_center": (-0.12, 0.13, 0.21), "cavity_size": (0.13, 0.17, 0.040), "color": "#451A03", "reveal_color": "#D97706", "ao_cavity": 0.26},
            {"opening_center": (0.12, 0.14, 0.21), "cavity_size": (0.15, 0.14, 0.040), "color": "#1E293B", "reveal_color": "#CBD5E1", "ao_cavity": 0.28},
            {"opening_center": (-0.12, 0.26, 0.21), "cavity_size": (0.12, 0.07, 0.034), "color": "#92400E", "reveal_color": "#FEF3C7", "ao_cavity": 0.32},
            {"opening_center": (0.12, 0.26, 0.21), "cavity_size": (0.12, 0.07, 0.034), "color": "#92400E", "reveal_color": "#FEF3C7", "ao_cavity": 0.32},
        ],
    },
    # riverine_c2: 5 open_bottom frustums (25 quads) + 6 cavities (30 quads) = 55 quads (220 verts, 110 tris)
    "riverine_c2": {
        "frustums": [
            {"center": (0.0, 0.06, 0.0), "size_bottom": (0.58, 0.12, 0.48), "color": "#78350F", "ao_bottom": 0.42, "ao_top": 0.82, "open_bottom": True},
            {"center": (0.0, 0.13, 0.0), "size_bottom": (0.60, 0.026, 0.50), "color": "#FDE68A", "ao_bottom": 0.70, "ao_top": 1.02, "open_bottom": True},
            {"center": (0.0, 0.37, 0.0), "size_bottom": (0.50, 0.45, 0.40), "color": "#D97706", "ao_bottom": 0.72, "ao_top": 1.05, "open_bottom": True},
            {"center": (0.0, 0.36, 0.0), "size_bottom": (0.54, 0.024, 0.44), "color": "#FEF3C7", "ao_bottom": 0.76, "ao_top": 1.06, "open_bottom": True},
            {"center": (0.0, 0.66, 0.0), "size_bottom": (0.56, 0.14, 0.46), "size_top": (0.16, 0.10), "color": "#B91C1C", "ao_bottom": 0.78, "ao_top": 1.08, "open_bottom": True},
        ],
        "cavities": [
            {"opening_center": (0.0, 0.06, 0.24), "cavity_size": (0.22, 0.10, 0.042), "color": "#451A03", "reveal_color": "#78350F", "ao_cavity": 0.25},
            {"opening_center": (-0.12, 0.26, 0.20), "cavity_size": (0.13, 0.11, 0.038), "color": "#451A03", "reveal_color": "#92400E", "ao_cavity": 0.28},
            {"opening_center": (0.12, 0.26, 0.20), "cavity_size": (0.13, 0.11, 0.038), "color": "#451A03", "reveal_color": "#92400E", "ao_cavity": 0.28},
            {"opening_center": (-0.12, 0.46, 0.20), "cavity_size": (0.13, 0.11, 0.038), "color": "#451A03", "reveal_color": "#92400E", "ao_cavity": 0.30},
            {"opening_center": (0.12, 0.46, 0.20), "cavity_size": (0.13, 0.11, 0.038), "color": "#451A03", "reveal_color": "#92400E", "ao_cavity": 0.30},
            {"opening_center": (0.0, 0.55, 0.20), "cavity_size": (0.20, 0.06, 0.034), "color": "#78350F", "reveal_color": "#FDE68A", "ao_cavity": 0.32},
        ],
    },
    # resort_c2: 1 full + 5 open_bottom frustums (31 quads) + 5 cavities (25 quads) = 56 quads (224 verts, 112 tris)
    "resort_c2": {
        "frustums": [
            {"center": (0.0, 0.065, 0.0), "size_bottom": (0.60, 0.13, 0.50), "color": "#E2E8F0", "ao_bottom": 0.45, "ao_top": 0.86},
            {"center": (0.0, 0.40, 0.0), "size_bottom": (0.48, 0.52, 0.38), "size_top": (0.42, 0.34), "color": "#06B6D4", "ao_bottom": 0.72, "ao_top": 1.06, "open_bottom": True},
            {"center": (0.0, 0.24, 0.0), "size_bottom": (0.54, 0.026, 0.44), "color": "#F8FAFC", "ao_bottom": 0.76, "ao_top": 1.08, "open_bottom": True},
            {"center": (0.0, 0.38, 0.0), "size_bottom": (0.52, 0.026, 0.42), "color": "#F8FAFC", "ao_bottom": 0.78, "ao_top": 1.08, "open_bottom": True},
            {"center": (0.0, 0.52, 0.0), "size_bottom": (0.50, 0.026, 0.40), "color": "#F8FAFC", "ao_bottom": 0.80, "ao_top": 1.10, "open_bottom": True},
            {"center": (0.0, 0.71, 0.0), "size_bottom": (0.34, 0.09, 0.26), "color": "#F8FAFC", "ao_bottom": 0.84, "ao_top": 1.12, "open_bottom": True},
        ],
        "cavities": [
            {"opening_center": (0.0, 0.06, 0.25), "cavity_size": (0.26, 0.10, 0.044), "color": "#0369A1", "reveal_color": "#CBD5E1", "ao_cavity": 0.25},
            {"opening_center": (-0.11, 0.31, 0.19), "cavity_size": (0.14, 0.09, 0.038), "color": "#0C4A6E", "reveal_color": "#E0F2FE", "ao_cavity": 0.28},
            {"opening_center": (0.11, 0.31, 0.19), "cavity_size": (0.14, 0.09, 0.038), "color": "#0C4A6E", "reveal_color": "#E0F2FE", "ao_cavity": 0.28},
            {"opening_center": (-0.10, 0.45, 0.184), "cavity_size": (0.13, 0.09, 0.038), "color": "#0C4A6E", "reveal_color": "#E0F2FE", "ao_cavity": 0.30},
            {"opening_center": (0.10, 0.45, 0.184), "cavity_size": (0.13, 0.09, 0.038), "color": "#0C4A6E", "reveal_color": "#E0F2FE", "ao_cavity": 0.30},
        ],
    },
    # heritage_c2: 2 full + 4 open_bottom frustums (32 quads) + 5 cavities (25 quads) = 57 quads (228 verts, 114 tris)
    "heritage_c2": {
        "frustums": [
            {"center": (0.0, 0.065, 0.0), "size_bottom": (0.60, 0.13, 0.50), "color": "#475569", "ao_bottom": 0.40, "ao_top": 0.80},
            {"center": (0.0, 0.36, 0.0), "size_bottom": (0.50, 0.46, 0.40), "color": "#991B1B", "ao_bottom": 0.70, "ao_top": 1.04},
            {"center": (0.0, 0.26, 0.0), "size_bottom": (0.58, 0.032, 0.48), "size_top": (0.52, 0.42), "color": "#D97706", "ao_bottom": 0.72, "ao_top": 1.05, "open_bottom": True},
            {"center": (0.0, 0.44, 0.0), "size_bottom": (0.56, 0.032, 0.46), "size_top": (0.50, 0.40), "color": "#D97706", "ao_bottom": 0.76, "ao_top": 1.06, "open_bottom": True},
            {"center": (0.0, 0.65, 0.0), "size_bottom": (0.56, 0.13, 0.46), "size_top": (0.20, 0.14), "color": "#F59E0B", "ao_bottom": 0.80, "ao_top": 1.10, "open_bottom": True},
            {"center": (0.0, 0.74, 0.0), "size_bottom": (0.22, 0.05, 0.12), "color": "#FEF08A", "ao_bottom": 0.88, "ao_top": 1.12, "open_bottom": True},
        ],
        "cavities": [
            {"opening_center": (0.0, 0.06, 0.25), "cavity_size": (0.22, 0.10, 0.044), "color": "#451A03", "reveal_color": "#78350F", "ao_cavity": 0.24},
            {"opening_center": (-0.12, 0.22, 0.20), "cavity_size": (0.12, 0.10, 0.038), "color": "#451A03", "reveal_color": "#B45309", "ao_cavity": 0.28},
            {"opening_center": (0.12, 0.22, 0.20), "cavity_size": (0.12, 0.10, 0.038), "color": "#451A03", "reveal_color": "#B45309", "ao_cavity": 0.28},
            {"opening_center": (-0.12, 0.37, 0.20), "cavity_size": (0.12, 0.10, 0.038), "color": "#451A03", "reveal_color": "#B45309", "ao_cavity": 0.30},
            {"opening_center": (0.12, 0.37, 0.20), "cavity_size": (0.12, 0.10, 0.038), "color": "#451A03", "reveal_color": "#B45309", "ao_cavity": 0.30},
        ],
    },
    # metropolis_c2: 3 full + 2 open_bottom frustums (28 quads) + 6 cavities (30 quads) = 58 quads (232 verts, 116 tris)
    "metropolis_c2": {
        "frustums": [
            {"center": (0.0, 0.07, 0.0), "size_bottom": (0.60, 0.14, 0.50), "color": "#334155", "ao_bottom": 0.40, "ao_top": 0.82},
            {"center": (0.0, 0.41, 0.0), "size_bottom": (0.52, 0.54, 0.42), "color": "#0284C7", "ao_bottom": 0.72, "ao_top": 1.06},
            {"center": (0.0, 0.36, 0.0), "size_bottom": (0.55, 0.024, 0.45), "color": "#CBD5E1", "ao_bottom": 0.76, "ao_top": 1.08},
            {"center": (-0.06, 0.72, 0.0), "size_bottom": (0.28, 0.09, 0.24), "color": "#475569", "ao_bottom": 0.80, "ao_top": 1.08, "open_bottom": True},
            {"center": (0.10, 0.77, 0.0), "size_bottom": (0.06, 0.16, 0.06), "size_top": (0.02, 0.02), "color": "#94A3B8", "ao_bottom": 0.86, "ao_top": 1.12, "open_bottom": True},
        ],
        "cavities": [
            {"opening_center": (0.0, 0.065, 0.25), "cavity_size": (0.28, 0.11, 0.044), "color": "#0F172A", "reveal_color": "#475569", "ao_cavity": 0.24},
            {"opening_center": (-0.13, 0.21, 0.21), "cavity_size": (0.14, 0.09, 0.040), "color": "#082F49", "reveal_color": "#94A3B8", "ao_cavity": 0.26},
            {"opening_center": (0.13, 0.21, 0.21), "cavity_size": (0.14, 0.09, 0.040), "color": "#082F49", "reveal_color": "#94A3B8", "ao_cavity": 0.26},
            {"opening_center": (-0.13, 0.35, 0.21), "cavity_size": (0.14, 0.09, 0.040), "color": "#082F49", "reveal_color": "#94A3B8", "ao_cavity": 0.28},
            {"opening_center": (0.13, 0.35, 0.21), "cavity_size": (0.14, 0.09, 0.040), "color": "#082F49", "reveal_color": "#94A3B8", "ao_cavity": 0.28},
            {"opening_center": (0.0, 0.50, 0.21), "cavity_size": (0.36, 0.09, 0.038), "color": "#0C4A6E", "reveal_color": "#38BDF8", "ao_cavity": 0.30},
        ],
    },
}


def create_archetype_blender_object(name, spec):
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    color_layer = bm.loops.layers.color.new("COLOR_0")

    for frustum in spec["frustums"]:
        add_tectonic_frustum_to_bmesh(bm, color_layer, frustum)

    for cavity in spec["cavities"]:
        add_recessed_cavity_bay_to_bmesh(bm, color_layer, cavity)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return obj


def main():
    os.makedirs(OUT_GLB_DIR, exist_ok=True)
    clear_scene()

    mat = bpy.data.materials.new(name="Mat_MobileVertexAO")

    for name, spec in ARCHETYPE_BLENDER_SPECS.items():
        obj = create_archetype_blender_object(name, spec)
        obj.data.materials.append(mat)
        v_count = len(obj.data.loops)
        print(f"[IMP-404][Blender 5.2] Sculpted {name}: {len(obj.data.polygons)} quads, {v_count} corner vertices (with inward-recessed cavities & COLOR_0 AO)")

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
    print(f"[IMP-404][Blender 5.2] Exported 8 mobile regional Baked-AO archetypes to {OUT_GLB_PATH} ({size_bytes} bytes)")


if __name__ == "__main__":
    main()
