# [IMP-434] Blender 5.2 LTS Procedural Generator:
# 1. Sunken Velvet Dong Son Dice Arena (public/models/board/sunken_velvet_dice_arena.glb)
# 2. Bridge Landing Plazas (public/models/board/bridge_landing_plazas.glb)

import os
import math
import bpy
import bmesh
from mathutils import Vector, Matrix

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_GLB_DIR = os.path.join(ROOT_DIR, "public", "models", "board")
ARENA_GLB_PATH = os.path.join(OUT_GLB_DIR, "sunken_velvet_dice_arena.glb")
PLAZAS_GLB_PATH = os.path.join(OUT_GLB_DIR, "bridge_landing_plazas.glb")
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


def make_pbr_material(name, hex_color, metallic=0.05, roughness=0.3, coat=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = hex_to_rgba(hex_color)
        bsdf.inputs["Metallic"].default_value = metallic
        bsdf.inputs["Roughness"].default_value = roughness
        if "Coat Weight" in bsdf.inputs and coat > 0.0:
            bsdf.inputs["Coat Weight"].default_value = coat
            if "Coat Roughness" in bsdf.inputs:
                bsdf.inputs["Coat Roughness"].default_value = 0.1
        elif "Coat" in bsdf.inputs and coat > 0.0:
            bsdf.inputs["Coat"].default_value = coat
    return mat


def build_revolution_mesh(profile, segments=48):
    """
    profile: list of (r, z) from center to outer edge.
    Revolves profile around Z axis by segments.
    Returns a bmesh.
    """
    bm = bmesh.new()
    rings = []

    for r, z in profile:
        ring = []
        if r < 1e-4:
            # Single vertex at center
            v = bm.verts.new((0.0, 0.0, z))
            ring.append(v)
        else:
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
        len1 = len(r1)
        len2 = len(r2)

        if len1 == 1 and len2 > 1:
            # Center fan out
            c_vert = r1[0]
            for s in range(len2):
                v_next = r2[(s + 1) % len2]
                v_curr = r2[s]
                bm.faces.new((c_vert, v_curr, v_next))
        elif len1 > 1 and len2 > 1:
            # Quad strip between rings
            for s in range(segments):
                v1_curr = r1[s]
                v1_next = r1[(s + 1) % segments]
                v2_curr = r2[s]
                v2_next = r2[(s + 1) % segments]
                bm.faces.new((v1_curr, v2_curr, v2_next, v1_next))

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def generate_sunken_velvet_arena():
    clear_scene()

    # Materials
    mat_bronze = make_pbr_material("DongSon_Bronze_Floor", "#8C6239", metallic=0.70, roughness=0.32)
    mat_velvet = make_pbr_material("Emerald_Velvet", "#064E3B", metallic=0.02, roughness=0.85)
    mat_brass = make_pbr_material("Antique_Brass", "#C5A059", metallic=0.85, roughness=0.22)

    # 1. Floor: Stepped Dong Son relief from r = 0 to 1.35m at Y = -0.02m
    # In Blender Z is up:
    floor_profile = [
        (0.00, -0.017),   # Center sun medallion raised
        (0.32, -0.017),
        (0.34, -0.020),   # Step down
        (0.72, -0.020),
        (0.74, -0.018),   # Stepped relief ring
        (1.02, -0.018),
        (1.04, -0.020),   # Outer floor ring
        (1.35, -0.020),
    ]
    bm_floor = build_revolution_mesh(floor_profile, segments=64)
    mesh_floor = bpy.data.meshes.new("Arena_Floor_Mesh")
    bm_floor.to_mesh(mesh_floor)
    bm_floor.free()
    obj_floor = bpy.data.objects.new("Arena_Floor", mesh_floor)
    bpy.context.collection.objects.link(obj_floor)
    obj_floor.data.materials.append(mat_bronze)

    # 2. Velvet Cushion Rim: From r = 1.35 to 1.56m, rising to z = +0.038m
    velvet_profile = [
        (1.35, -0.020),
        (1.38, -0.005),
        (1.42, 0.022),
        (1.47, 0.038),   # Cushion crown
        (1.52, 0.032),
        (1.56, 0.024),   # Seam into brass collar
    ]
    bm_velvet = build_revolution_mesh(velvet_profile, segments=64)
    mesh_velvet = bpy.data.meshes.new("Arena_Velvet_Mesh")
    bm_velvet.to_mesh(mesh_velvet)
    bm_velvet.free()
    obj_velvet = bpy.data.objects.new("Arena_Velvet", mesh_velvet)
    bpy.context.collection.objects.link(obj_velvet)
    obj_velvet.data.materials.append(mat_velvet)

    # 3. Brass Collar Lip: From r = 1.56 to 1.68m, beveling flush into board
    brass_profile = [
        (1.56, 0.024),
        (1.59, 0.028),   # Brass bead
        (1.63, 0.016),
        (1.68, 0.000),   # Flush ground level
        (1.68, -0.005),  # Under-lip skirt to prevent light leakage
    ]
    bm_brass = build_revolution_mesh(brass_profile, segments=64)
    mesh_brass = bpy.data.meshes.new("Arena_Brass_Mesh")
    bm_brass.to_mesh(mesh_brass)
    bm_brass.free()
    obj_brass = bpy.data.objects.new("Arena_Brass", mesh_brass)
    bpy.context.collection.objects.link(obj_brass)
    obj_brass.data.materials.append(mat_brass)

    # Join into single object
    bpy.ops.object.select_all(action='DESELECT')
    for obj in [obj_floor, obj_velvet, obj_brass]:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = obj_floor
    bpy.ops.object.join()

    arena_obj = bpy.context.view_layer.objects.active
    arena_obj.name = "Sunken_Velvet_Dice_Arena"

    for poly in arena_obj.data.polygons:
        poly.use_smooth = True

    # Validate metrics
    bm_check = bmesh.new()
    bm_check.from_mesh(arena_obj.data)
    bmesh.ops.triangulate(bm_check, faces=bm_check.faces)
    tri_count = len(bm_check.faces)
    bm_check.free()

    xs = [v.co.x for v in arena_obj.data.vertices]
    zs = [v.co.z for v in arena_obj.data.vertices]
    diameter = round(max(xs) - min(xs), 2)
    height = round(max(zs) - min(zs), 3)

    print(f"[IMP-434] Arena BBox: Diameter={diameter}m, Height={height}m | Tris={tri_count}")
    assert 3.2 <= diameter <= 3.5, f"Unexpected diameter: {diameter}"
    assert tri_count <= 2500, f"Triangles budget exceeded: {tri_count}"

    # Export to GLB
    bpy.ops.export_scene.gltf(
        filepath=ARENA_GLB_PATH,
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        export_texcoords=False,
        export_normals=True,
        export_materials="EXPORT",
    )
    size_bytes = os.path.getsize(ARENA_GLB_PATH)
    print(f"[IMP-434] Successfully Exported {ARENA_GLB_PATH} ({size_bytes} bytes, {tri_count} tris)")
    assert size_bytes <= 48 * 1024, f"File size too large: {size_bytes} > 48KB"


def build_single_plaza_bmesh(bm, center_x, center_y, rotation_deg, mat_granite_idx, mat_brass_idx):
    """
    Creates a beveled octagonal / fan terrace plaza at (center_x, center_y).
    center_y in Blender corresponds to Three.js -Z.
    """
    rot_rad = math.radians(rotation_deg)
    cos_r = math.cos(rot_rad)
    sin_r = math.sin(rot_rad)

    def xform(lx, ly, lz):
        rx = lx * cos_r - ly * sin_r + center_x
        ry = lx * sin_r + ly * cos_r + center_y
        return (rx, ry, lz)

    # Base terrace footprint: Fan/trapezoid shape facing inward toward river/walkway
    # Local coordinates: X = [-0.65, +0.65], Y = [-0.85, +0.85]
    # Octagonal chamfered contour
    w_outer = 0.70
    w_inner = 0.55
    y_back = -0.75
    y_front = 0.75
    chamf = 0.18

    contour_2d = [
        (-w_outer + chamf, y_back),
        (w_outer - chamf, y_back),
        (w_outer, y_back + chamf),
        (w_inner, y_front - chamf),
        (w_inner - chamf, y_front),
        (-w_inner + chamf, y_front),
        (-w_inner, y_front - chamf),
        (-w_outer, y_back + chamf),
    ]

    # Heights:
    # Ground base at z = 0.00
    # Plinth top at z = 0.024
    # Bevel top at z = 0.028, slightly inset
    inset_scale = 0.94

    verts_bottom = [bm.verts.new(xform(px, py, 0.00)) for px, py in contour_2d]
    verts_side = [bm.verts.new(xform(px, py, 0.024)) for px, py in contour_2d]
    verts_top = [bm.verts.new(xform(px * inset_scale, py * inset_scale, 0.028)) for px, py in contour_2d]

    bm.verts.ensure_lookup_table()
    num_pts = len(contour_2d)

    # Side vertical faces
    for i in range(num_pts):
        i_next = (i + 1) % num_pts
        f = bm.faces.new((verts_bottom[i], verts_side[i], verts_side[i_next], verts_bottom[i_next]))
        f.material_index = mat_granite_idx

    # Bevel 45 deg faces
    for i in range(num_pts):
        i_next = (i + 1) % num_pts
        f = bm.faces.new((verts_side[i], verts_top[i], verts_top[i_next], verts_side[i_next]))
        f.material_index = mat_brass_idx

    # Inlaid brass border ring on top surface
    inner_inset = 0.82
    verts_inner_top = [bm.verts.new(xform(px * inner_inset, py * inner_inset, 0.0285)) for px, py in contour_2d]

    # Inlaid border strip
    for i in range(num_pts):
        i_next = (i + 1) % num_pts
        f = bm.faces.new((verts_top[i], verts_inner_top[i], verts_inner_top[i_next], verts_top[i_next]))
        f.material_index = mat_brass_idx

    # Center stone pavement face
    center_face = bm.faces.new(verts_inner_top)
    center_face.material_index = mat_granite_idx


def generate_bridge_landing_plazas():
    clear_scene()

    mat_granite = make_pbr_material("Ivory_Granite", "#F1F5F9", metallic=0.08, roughness=0.38)
    mat_brass = make_pbr_material("Antique_Brass", "#C5A059", metallic=0.85, roughness=0.22)

    bm = bmesh.new()

    # Bridge abutment positions in Three.js:
    # Ba Son Bridge at Z = -3.8: West abutment at X = -2.7, East abutment at X = +2.7
    # Long Bien Bridge at Z = +3.8: West abutment at X = -2.7, East abutment at X = +2.7
    #
    # Conversion to Blender coordinates (Y_blender = -Z_threejs):
    # North Plazas (Z = -3.8 in Three.js -> Y = +3.8 in Blender):
    #   - West: X = -2.7, Y = +3.8
    #   - East: X = +2.7, Y = +3.8
    # South Plazas (Z = +3.8 in Three.js -> Y = -3.8 in Blender):
    #   - West: X = -2.7, Y = -3.8
    #   - East: X = +2.7, Y = -3.8

    plazas_def = [
        # (center_x, center_y, rotation_deg)
        (-2.7,  3.8,  90.0),   # North-West plaza, facing East towards bridge & river
        ( 2.7,  3.8, -90.0),   # North-East plaza, facing West towards bridge & river
        (-2.7, -3.8,  90.0),   # South-West plaza, facing East towards bridge & river
        ( 2.7, -3.8, -90.0),   # South-East plaza, facing West towards bridge & river
    ]

    for cx, cy, rot in plazas_def:
        build_single_plaza_bmesh(bm, cx, cy, rot, mat_granite_idx=0, mat_brass_idx=1)

    mesh = bpy.data.meshes.new("Bridge_Landing_Plazas_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Bridge_Landing_Plazas", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat_granite)
    obj.data.materials.append(mat_brass)

    for poly in obj.data.polygons:
        poly.use_smooth = False  # Crisp architectural stone bevels

    # Metrics check
    bm_check = bmesh.new()
    bm_check.from_mesh(obj.data)
    bmesh.ops.triangulate(bm_check, faces=bm_check.faces)
    tri_count = len(bm_check.faces)
    bm_check.free()

    print(f"[IMP-434] Bridge Plazas Tris={tri_count}")
    assert tri_count <= 800, f"Plazas triangles exceeded: {tri_count}"

    # Export to GLB
    bpy.ops.export_scene.gltf(
        filepath=PLAZAS_GLB_PATH,
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        export_texcoords=False,
        export_normals=True,
        export_materials="EXPORT",
    )
    size_bytes = os.path.getsize(PLAZAS_GLB_PATH)
    print(f"[IMP-434] Successfully Exported {PLAZAS_GLB_PATH} ({size_bytes} bytes, {tri_count} tris)")
    assert size_bytes <= 32 * 1024, f"File size too large: {size_bytes} > 32KB"


if __name__ == "__main__":
    generate_sunken_velvet_arena()
    generate_bridge_landing_plazas()
