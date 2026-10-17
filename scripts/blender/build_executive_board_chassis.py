# [IMP-410] Blender 5.2 LTS Procedural Generator: Indochine Executive Tabletop Chassis (Vertical Slice Prototype)
# Target Asset: public/models/board/board_chassis_walnut.glb
# Dimensions: Width = 22.4m (X: -11.2..+11.2), Depth = 22.4m (Y: -11.2..+11.2), Height = 0.37m (Z: -0.25..+0.12)
# Pipeline: Precision bmesh mitered rails + Bevel light-catchers + 2 PBR materials (Executive Walnut + Brushed Brass).

import os
import math
import bpy
import bmesh
from mathutils import Vector, Matrix

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_GLB_DIR = os.path.join(ROOT_DIR, "public", "models", "board")
OUT_GLB_PATH = os.path.join(OUT_GLB_DIR, "board_chassis_walnut.glb")
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


def make_pbr_material(name, hex_color, metallic=0.05, roughness=0.26, coat=0.0):
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


def build_mitered_rail(bm, profile_xz, start_t, end_t, is_y_rail=False, sign=1.0):
    """
    Extrudes a 2D profile along an axis with 45-degree mitered ends.
    profile_xz: list of (d, z) where d is perpendicular distance from center, z is height.
    For an X-rail at positive Y:
      At position x, the outer/inner points are bounded by y = sign * d, with ends cut by x = ±d.
    """
    verts_start = []
    verts_end = []
    
    # We construct the prism with vertices
    for (d, z) in profile_xz:
        # At start (negative along axis): coordinate on axis is -d
        # At end (positive along axis): coordinate on axis is +d
        if not is_y_rail:
            # Rail running along X, positioned at Y = sign * d
            # Miter ends: x_min = -d, x_max = +d
            x_min = -d * 1.0
            x_max = d * 1.0
            y = sign * d
            v0 = bm.verts.new((x_min, y, z))
            v1 = bm.verts.new((x_max, y, z))
        else:
            # Rail running along Y, positioned at X = sign * d
            # Miter ends: y_min = -d, y_max = +d
            y_min = -d * 1.0
            y_max = d * 1.0
            x = sign * d
            v0 = bm.verts.new((x, y_min, z))
            v1 = bm.verts.new((x, y_max, z))
        verts_start.append(v0)
        verts_end.append(v1)

    bm.verts.ensure_lookup_table()
    num_pts = len(profile_xz)

    # Faces along the length
    for i in range(num_pts - 1):
        # Quadrilateral face between point i and i+1
        # Normal pointing outward depending on winding
        if (sign > 0 and not is_y_rail) or (sign < 0 and is_y_rail):
            bm.faces.new((verts_start[i], verts_end[i], verts_end[i+1], verts_start[i+1]))
        else:
            bm.faces.new((verts_start[i], verts_start[i+1], verts_end[i+1], verts_end[i]))

    # End caps (mitered faces)
    # Start cap
    if (sign > 0 and not is_y_rail) or (sign < 0 and is_y_rail):
        bm.faces.new(verts_start)
        bm.faces.new(list(reversed(verts_end)))
    else:
        bm.faces.new(list(reversed(verts_start)))
        bm.faces.new(verts_end)


def build_executive_chassis():
    clear_scene()

    # Materials
    mat_walnut = make_pbr_material("Mat_Executive_Walnut", "#27170E", metallic=0.04, roughness=0.26, coat=0.15)
    mat_brass = make_pbr_material("Mat_Brushed_Brass", "#D4AF37", metallic=0.96, roughness=0.20)

    # -------------------------------------------------------------
    # 1. Outer Walnut Rim (Chamfered 45-degree Bevel & Recessed Groove)
    # -------------------------------------------------------------
    # Profile in (distance_from_center, height_z):
    # d=11.20, z=-0.25 : Bottom outer corner (rests on table)
    # d=10.65, z=0.12  : Top outer edge of chamfer (45 deg angle)
    # d=10.15, z=0.12  : Top inner edge of outer rim
    # d=10.15, z=-0.05 : Outer wall of tile slot (drops 17cm)
    # d=9.80,  z=-0.05 : Under tile support shelf
    # d=9.80,  z=-0.25 : Inner wall to base
    # d=11.20, z=-0.25 : Back to bottom outer corner
    outer_profile = [
        (11.20, -0.25),
        (10.65, 0.12),
        (10.15, 0.12),
        (10.15, -0.05),
        (9.80, -0.05),
        (9.80, -0.25),
        (11.20, -0.25),
    ]

    mesh_outer = bpy.data.meshes.new("Mesh_Outer_Walnut_Chassis")
    bm_outer = bmesh.new()

    # 4 Mitered Rails: North (+Y), South (-Y), East (+X), West (-X)
    build_mitered_rail(bm_outer, outer_profile, -1, 1, is_y_rail=False, sign=1.0)
    build_mitered_rail(bm_outer, outer_profile, -1, 1, is_y_rail=False, sign=-1.0)
    build_mitered_rail(bm_outer, outer_profile, -1, 1, is_y_rail=True, sign=1.0)
    build_mitered_rail(bm_outer, outer_profile, -1, 1, is_y_rail=True, sign=-1.0)

    bmesh.ops.remove_doubles(bm_outer, verts=bm_outer.verts, dist=0.001)
    bmesh.ops.recalc_face_normals(bm_outer, faces=bm_outer.faces)
    bm_outer.to_mesh(mesh_outer)
    bm_outer.free()

    obj_outer = bpy.data.objects.new("Board_Outer_Walnut_Chassis", mesh_outer)
    bpy.context.collection.objects.link(obj_outer)
    obj_outer.data.materials.append(mat_walnut)

    # Bevel modifier on outer wood to catch specular glints
    bev = obj_outer.modifiers.new(name="Bevel", type="BEVEL")
    bev.width = 0.008
    bev.segments = 2
    bev.limit_method = "ANGLE"
    bev.angle_limit = math.radians(35.0)

    # -------------------------------------------------------------
    # 2. Outer Brushed Brass Inlay Trim (Flush on Top Rim)
    # -------------------------------------------------------------
    # Sits at d in [10.38, 10.46], z in [0.120, 0.123]
    brass_outer_profile = [
        (10.46, 0.120),
        (10.46, 0.124),
        (10.38, 0.124),
        (10.38, 0.120),
        (10.46, 0.120),
    ]

    mesh_brass_outer = bpy.data.meshes.new("Mesh_Outer_Brass_Trim")
    bm_brass_outer = bmesh.new()
    build_mitered_rail(bm_brass_outer, brass_outer_profile, -1, 1, is_y_rail=False, sign=1.0)
    build_mitered_rail(bm_brass_outer, brass_outer_profile, -1, 1, is_y_rail=False, sign=-1.0)
    build_mitered_rail(bm_brass_outer, brass_outer_profile, -1, 1, is_y_rail=True, sign=1.0)
    build_mitered_rail(bm_brass_outer, brass_outer_profile, -1, 1, is_y_rail=True, sign=-1.0)

    bmesh.ops.remove_doubles(bm_brass_outer, verts=bm_brass_outer.verts, dist=0.0005)
    bmesh.ops.recalc_face_normals(bm_brass_outer, faces=bm_brass_outer.faces)
    bm_brass_outer.to_mesh(mesh_brass_outer)
    bm_brass_outer.free()

    obj_brass_outer = bpy.data.objects.new("Board_Outer_Brass_Trim", mesh_brass_outer)
    bpy.context.collection.objects.link(obj_brass_outer)
    obj_brass_outer.data.materials.append(mat_brass)

    # -------------------------------------------------------------
    # 3. Inner Walnut Rim (Bordering the Central Diorama)
    # -------------------------------------------------------------
    # Sits between 40 tiles inner edge (d = 7.85) and diorama park (d = 7.55)
    # Height z = 0.055, drops down to z = 0.00 at diorama and z = -0.05 at tile slot
    inner_profile = [
        (7.85, -0.05),
        (7.85, 0.055),
        (7.55, 0.055),
        (7.55, 0.000),
        (7.45, 0.000),
        (7.45, -0.05),
        (7.85, -0.05),
    ]

    mesh_inner = bpy.data.meshes.new("Mesh_Inner_Walnut_Rim")
    bm_inner = bmesh.new()
    build_mitered_rail(bm_inner, inner_profile, -1, 1, is_y_rail=False, sign=1.0)
    build_mitered_rail(bm_inner, inner_profile, -1, 1, is_y_rail=False, sign=-1.0)
    build_mitered_rail(bm_inner, inner_profile, -1, 1, is_y_rail=True, sign=1.0)
    build_mitered_rail(bm_inner, inner_profile, -1, 1, is_y_rail=True, sign=-1.0)

    bmesh.ops.remove_doubles(bm_inner, verts=bm_inner.verts, dist=0.001)
    bmesh.ops.recalc_face_normals(bm_inner, faces=bm_inner.faces)
    bm_inner.to_mesh(mesh_inner)
    bm_inner.free()

    obj_inner = bpy.data.objects.new("Board_Inner_Walnut_Rim", mesh_inner)
    bpy.context.collection.objects.link(obj_inner)
    obj_inner.data.materials.append(mat_walnut)

    # -------------------------------------------------------------
    # 4. Inner Brass Inlay Trim (Along Inner Rim)
    # -------------------------------------------------------------
    brass_inner_profile = [
        (7.72, 0.055),
        (7.72, 0.058),
        (7.68, 0.058),
        (7.68, 0.055),
        (7.72, 0.055),
    ]

    mesh_brass_inner = bpy.data.meshes.new("Mesh_Inner_Brass_Trim")
    bm_brass_inner = bmesh.new()
    build_mitered_rail(bm_brass_inner, brass_inner_profile, -1, 1, is_y_rail=False, sign=1.0)
    build_mitered_rail(bm_brass_inner, brass_inner_profile, -1, 1, is_y_rail=False, sign=-1.0)
    build_mitered_rail(bm_brass_inner, brass_inner_profile, -1, 1, is_y_rail=True, sign=1.0)
    build_mitered_rail(bm_brass_inner, brass_inner_profile, -1, 1, is_y_rail=True, sign=-1.0)

    bmesh.ops.remove_doubles(bm_brass_inner, verts=bm_brass_inner.verts, dist=0.0005)
    bmesh.ops.recalc_face_normals(bm_brass_inner, faces=bm_brass_inner.faces)
    bm_brass_inner.to_mesh(mesh_brass_inner)
    bm_brass_inner.free()

    obj_brass_inner = bpy.data.objects.new("Board_Inner_Brass_Trim", mesh_brass_inner)
    bpy.context.collection.objects.link(obj_brass_inner)
    obj_brass_inner.data.materials.append(mat_brass)

    # -------------------------------------------------------------
    # 5. Join & Optimize for Single Draw Call
    # -------------------------------------------------------------
    # We join Walnut parts together and Brass parts together, or keep them as two material slots in one mesh!
    bpy.ops.object.select_all(action="DESELECT")
    for obj in [obj_outer, obj_brass_outer, obj_inner, obj_brass_inner]:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = obj_outer
    bpy.ops.object.join()

    joined_obj = bpy.context.view_layer.objects.active
    joined_obj.name = "Board_Executive_Chassis"

    # Shade smooth with auto smooth
    for poly in joined_obj.data.polygons:
        poly.use_smooth = True

    # Check metrics
    bm_check = bmesh.new()
    bm_check.from_mesh(joined_obj.data)
    bmesh.ops.triangulate(bm_check, faces=bm_check.faces)
    tri_count = len(bm_check.faces)
    bm_check.free()

    xs = [v.co.x for v in joined_obj.data.vertices]
    ys = [v.co.y for v in joined_obj.data.vertices]
    zs = [v.co.z for v in joined_obj.data.vertices]

    width = round(max(xs) - min(xs), 2)
    depth = round(max(ys) - min(ys), 2)
    height = round(max(zs) - min(zs), 3)

    print(f"[IMP-410] Executive Chassis BBox: Width={width}m, Depth={depth}m, Height={height}m | Tris={tri_count}")
    assert width >= 22.0, f"Width too small: {width}"
    assert depth >= 22.0, f"Depth too small: {depth}"
    assert tri_count <= 2500, f"Triangle budget exceeded: {tri_count}"

    # Export to GLB
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
    print(f"[IMP-410] Successfully Exported {OUT_GLB_PATH} ({size_bytes} bytes, {tri_count} tris)")
    assert size_bytes <= 64 * 1024, f"File size too large: {size_bytes} > 64KB"


if __name__ == "__main__":
    build_executive_chassis()
