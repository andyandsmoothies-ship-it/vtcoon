# [IMP-437] Blender 5.2 LTS Procedural Generator:
# Indochine Executive Tabletop Paved Esplanade & Riverbank Promenades
# Output: public/models/board/indochine_paved_esplanade.glb
# Sub-features:
# 1. Circular Beveled Stone Promenade around arena (R in [1.68, 2.05]m, curb height Y <= 0.020m)
# 2. Granite Esplanades flanking the Saigon River curves
# 3. PBR Granite Stone Materials (#94A3B8, #64748B, roughness >= 0.65)
# 4. Zero duplicate bronze drum medallion vertices (R < 1.68m)

import os
import math
import bpy
import bmesh
from mathutils import Vector, Matrix

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_GLB_DIR = os.path.join(ROOT_DIR, "public", "models", "board")
OUT_GLB_PATH = os.path.join(OUT_GLB_DIR, "indochine_paved_esplanade.glb")
os.makedirs(OUT_GLB_DIR, exist_ok=True)


def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_to_rgba(hex_str, alpha=1.0):
    h = hex_str.lstrip("#")
    r = srgb_to_linear(int(h[0:2], 16) / 255.0)
    g = srgb_to_linear(int(h[2:4], 16) / 255.0)
    b = srgb_to_linear(int(h[4:6], 16) / 255.0)
    return (r, g, b, alpha)


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def make_pbr_material(name, hex_color, metallic=0.05, roughness=0.70):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = hex_to_rgba(hex_color)
        bsdf.inputs["Metallic"].default_value = metallic
        bsdf.inputs["Roughness"].default_value = roughness
    return mat


def build_revolution_mesh(profile, segments=64):
    """
    profile: list of (r, z) from inner to outer edge.
    Revolves profile around Z axis by segments.
    Returns a bmesh.
    """
    bm = bmesh.new()
    rings = []

    for r, z in profile:
        ring = []
        for s in range(segments):
            angle = 2.0 * math.pi * s / segments
            x = r * math.cos(angle)
            y = r * math.sin(angle)
            v = bm.verts.new((x, y, z))
            ring.append(v)
        rings.append(ring)

    bm.verts.ensure_lookup_table()

    for i in range(len(rings) - 1):
        r1 = rings[i]
        r2 = rings[i + 1]
        for s in range(segments):
            v1_curr = r1[s]
            v1_next = r1[(s + 1) % segments]
            v2_curr = r2[s]
            v2_next = r2[(s + 1) % segments]
            bm.faces.new((v1_curr, v2_curr, v2_next, v1_next))

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def build_circular_promenade(mat_granite_light, mat_granite_dark):
    """
    Circular beveled stone promenade around arena collar.
    Radius R in [1.68, 2.05]m, curb height Z = 0.018m (<= 0.020m).
    Zero vertices inside R < 1.68m (ADV-04, ADV-06).
    """
    # Profile: (radius, z_elevation)
    profile = [
        (1.68, 0.000),   # Inner ground seam matching arena collar
        (1.70, 0.018),   # Beveled inner curb edge
        (1.73, 0.018),   # Promenade stone paver start
        (1.98, 0.018),   # Promenade stone paver end
        (2.02, 0.005),   # Outer beveled stone curb
        (2.05, 0.000),   # Outer ground seam
        (2.05, -0.005),  # Anti-leak downward skirt
    ]
    bm = build_revolution_mesh(profile, segments=64)

    # Material assignment: Paver surface gets light granite, curbs get charcoal granite
    for f in bm.faces:
        # Calculate average radius of face
        avg_r = sum(math.hypot(v.co.x, v.co.y) for v in f.verts) / len(f.verts)
        if 1.73 <= avg_r <= 1.98:
            f.material_index = 0  # Light granite paver
        else:
            f.material_index = 1  # Charcoal curb

    mesh = bpy.data.meshes.new("Circular_Promenade_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Circular_Promenade", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat_granite_light)
    obj.data.materials.append(mat_granite_dark)

    for poly in obj.data.polygons:
        poly.use_smooth = True

    return obj


def build_riverbank_esplanades(mat_granite_light, mat_granite_dark):
    """
    Builds granite esplanades flanking the Saigon River curves.
    Three.js Coordinates mapped: (X_blender, Y_blender) = (X_three, -Z_three).
    North and South reaches of Saigon River banks.
    """
    bm = bmesh.new()
    y_prom = 0.016
    curb_drop = 0.005

    # Bank ribbons data: [z_three, wx, ex]
    slices = [
        {"z": -3.80, "wx": -0.96, "ex": 0.96},
        {"z": -3.30, "wx": -0.40, "ex": 1.05},
        {"z": -2.80, "wx": 0.10, "ex": 1.20},
        {"z": -2.10, "wx": 0.85, "ex": 1.20},
        {"z": 2.10, "wx": 0.70, "ex": 1.20},
        {"z": 2.80, "wx": 0.03, "ex": 1.20},
        {"z": 3.30, "wx": -0.40, "ex": 1.05},
        {"z": 3.80, "wx": -0.96, "ex": 0.96},
    ]

    width = 0.28

    def add_ribbon_quads(points_inner, points_outer, z_elev, mat_idx):
        for i in range(len(points_inner) - 1):
            p1_in = points_inner[i]
            p2_in = points_inner[i + 1]
            p1_out = points_outer[i]
            p2_out = points_outer[i + 1]

            v1 = bm.verts.new((p1_in[0], p1_in[1], z_elev))
            v2 = bm.verts.new((p2_in[0], p2_in[1], z_elev))
            v3 = bm.verts.new((p2_out[0], p2_out[1], z_elev))
            v4 = bm.verts.new((p1_out[0], p1_out[1], z_elev))

            f = bm.faces.new((v1, v2, v3, v4))
            f.material_index = mat_idx

    # 1. North West Esplanade (z in [-3.8, -2.1]) -> y_blender in [2.1, 3.8]
    nw_slices = [s for s in slices if s["z"] <= -2.1]
    nw_in = [(s["wx"], -s["z"]) for s in nw_slices]
    nw_out = [(s["wx"] - width, -s["z"]) for s in nw_slices]
    add_ribbon_quads(nw_in, nw_out, y_prom, 0)

    # 2. North East Esplanade (z in [-3.8, -2.1]) -> y_blender in [2.1, 3.8]
    ne_slices = [s for s in slices if s["z"] <= -2.1]
    ne_in = [(s["ex"], -s["z"]) for s in ne_slices]
    ne_out = [(s["ex"] + width, -s["z"]) for s in ne_slices]
    add_ribbon_quads(ne_in, ne_out, y_prom, 0)

    # 3. South West Esplanade (z in [2.1, 3.8]) -> y_blender in [-3.8, -2.1]
    sw_slices = [s for s in slices if s["z"] >= 2.1]
    sw_in = [(s["wx"], -s["z"]) for s in sw_slices]
    sw_out = [(s["wx"] - width, -s["z"]) for s in sw_slices]
    add_ribbon_quads(sw_in, sw_out, y_prom, 0)

    # 4. South East Esplanade (z in [2.1, 3.8]) -> y_blender in [-3.8, -2.1]
    se_slices = [s for s in slices if s["z"] >= 2.1]
    se_in = [(s["ex"], -s["z"]) for s in se_slices]
    se_out = [(s["ex"] + width, -s["z"]) for s in se_slices]
    add_ribbon_quads(se_in, se_out, y_prom, 0)

    # Edge curbs (beveled steps) for all ribbons
    for in_pts, out_pts in [(nw_in, nw_out), (ne_in, ne_out), (sw_in, sw_out), (se_in, se_out)]:
        for i in range(len(in_pts) - 1):
            p1_top = in_pts[i]
            p2_top = in_pts[i + 1]
            # River drop edge
            v1 = bm.verts.new((p1_top[0], p1_top[1], y_prom))
            v2 = bm.verts.new((p2_top[0], p2_top[1], y_prom))
            v3 = bm.verts.new((p2_top[0], p2_top[1], curb_drop))
            v4 = bm.verts.new((p1_top[0], p1_top[1], curb_drop))
            f = bm.faces.new((v1, v2, v3, v4))
            f.material_index = 1

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new("Riverbank_Esplanades_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Riverbank_Esplanades", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat_granite_light)
    obj.data.materials.append(mat_granite_dark)

    for poly in obj.data.polygons:
        poly.use_smooth = True

    return obj


def generate_indochine_paved_esplanade():
    clear_scene()

    # Materials (#F8F6F0 / #78716C warm Indochine stone, roughness >= 0.65)
    mat_granite_light = make_pbr_material("Granite_Light_Paver", "#F8F6F0", metallic=0.04, roughness=0.68)
    mat_granite_dark = make_pbr_material("Granite_Charcoal_Curbs", "#78716C", metallic=0.06, roughness=0.72)

    # 1. Circular Beveled Stone Promenade
    obj_promenade = build_circular_promenade(mat_granite_light, mat_granite_dark)

    # 2. Granite Esplanades flanking Saigon River curves
    obj_riverbanks = build_riverbank_esplanades(mat_granite_light, mat_granite_dark)

    # Join into unified mesh (1 draw call)
    bpy.ops.object.select_all(action='DESELECT')
    for obj in [obj_promenade, obj_riverbanks]:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = obj_promenade
    bpy.ops.object.join()

    unified_obj = bpy.context.view_layer.objects.active
    unified_obj.name = "Indochine_Paved_Esplanade"

    # Validate metrics
    bm_check = bmesh.new()
    bm_check.from_mesh(unified_obj.data)
    bmesh.ops.triangulate(bm_check, faces=bm_check.faces)
    total_tris = len(bm_check.faces)
    bm_check.free()

    print(f"Total Triangles: {total_tris} (Budget <= 3,500)")
    assert total_tris <= 3500, f"Triangles budget exceeded: {total_tris}"

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
    print(f"✓ Paved Esplanade GLB generated: {OUT_GLB_PATH} ({size_bytes / 1024:.1f} KB)")
    assert size_bytes <= 180 * 1024, f"GLB size exceeds 180KB: {size_bytes} bytes"


if __name__ == "__main__":
    generate_indochine_paved_esplanade()
