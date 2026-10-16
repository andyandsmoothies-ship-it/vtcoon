# [IMP-401] Blender 5.2 LTS Procedural Generator: Indochine Art Deco Monopoly Boulevard Archway
# Target Asset: public/models/landmarks/monopoly_archway_artdeco.glb
# Locked Unscaled Base Dimensions: Width = 0.72m (X: -0.36..+0.36), Height = 0.68m (Z: 0.00..+0.68), Depth = 0.14m (Y: -0.07..+0.07)
# Pivot: [0, 0, 0] at bottom center of archway base.
# Pipeline: bmesh + Boolean Modifier (stepped Art Deco arch opening) + Bevel Modifier (3 segments) + Weighted Normals + 3 PBR Materials.

import bpy
import bmesh
import math
import os
from mathutils import Vector

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_GLB_DIR = os.path.join(ROOT_DIR, "public", "models", "landmarks")
OUT_GLB_PATH = os.path.join(OUT_GLB_DIR, "monopoly_archway_artdeco.glb")
os.makedirs(OUT_GLB_DIR, exist_ok=True)

TARGET_WIDTH = 0.72
TARGET_HEIGHT = 0.68
TARGET_DEPTH = 0.14


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


def make_pbr_material(name, hex_color, metallic=0.05, roughness=0.24, emission_hex=None, emission_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = hex_to_rgba(hex_color)
        bsdf.inputs["Metallic"].default_value = metallic
        bsdf.inputs["Roughness"].default_value = roughness
        if emission_hex and emission_strength > 0.0:
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = hex_to_rgba(emission_hex)
            elif "Emission" in bsdf.inputs:
                bsdf.inputs["Emission"].default_value = hex_to_rgba(emission_hex)
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat


def create_bmesh_box(name, size_xyz, center_xyz, mat=None, bevel_width=0.004, bevel_segments=3):
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x = v.co.x * size_xyz[0] + center_xyz[0]
        v.co.y = v.co.y * size_xyz[1] + center_xyz[1]
        v.co.z = v.co.z * size_xyz[2] + center_xyz[2]
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)

    if bevel_width > 0:
        bev = obj.modifiers.new(name="Bevel", type="BEVEL")
        bev.width = bevel_width
        bev.segments = bevel_segments
        bev.limit_method = "ANGLE"
        bev.angle_limit = math.radians(32.0)

    return obj


def build_arch_cutter_bmesh(name, arch_half_w=0.185, spring_z=0.25, crown_z=0.45, cut_depth=0.30):
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()

    # Construct a stepped Indochine Art Deco arch profile in X-Z plane extruded along Y
    arc_steps = 12
    profile_2d = [(-arch_half_w, -0.05), (-arch_half_w, spring_z)]
    for i in range(1, arc_steps):
        t = i / arc_steps
        angle = math.pi * (1.0 - t)
        rx = math.cos(angle) * arch_half_w
        rz = spring_z + math.sin(angle) * (crown_z - spring_z)
        profile_2d.append((rx, rz))
    profile_2d.extend([(arch_half_w, spring_z), (arch_half_w, -0.05)])

    half_y = cut_depth * 0.5
    front_verts = [bm.verts.new((x, -half_y, z)) for (x, z) in profile_2d]
    back_verts = [bm.verts.new((x, half_y, z)) for (x, z) in profile_2d]
    bm.verts.ensure_lookup_table()

    bm.faces.new(front_verts)
    bm.faces.new(list(reversed(back_verts)))
    n = len(profile_2d)
    for i in range(n):
        bm.faces.new((
            front_verts[i],
            front_verts[(i + 1) % n],
            back_verts[(i + 1) % n],
            back_verts[i],
        ))

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()

    cutter = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(cutter)
    return cutter


def create_sunburst_keystone_bmesh(name, mat_gold):
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()

    # Sculpted Art Deco sunburst fan rays and central keystone diamond at Z = 0.54..0.675
    rays = 7
    center_z = 0.545
    for r_idx in range(rays):
        ang = math.radians(-54 + r_idx * 18)
        ray_len = 0.105 if r_idx == 3 else (0.092 if r_idx in (2, 4) else 0.076)
        w_base = 0.012
        w_tip = 0.020
        dx = math.sin(ang)
        dz = math.cos(ang)
        px = -dz
        pz = dx

        p0 = (-px * w_base, 0.0, center_z - pz * w_base)
        p1 = (px * w_base, 0.0, center_z + pz * w_base)
        p2 = (dx * ray_len + px * w_tip, 0.0, center_z + dz * ray_len + pz * w_tip)
        p3 = (dx * ray_len - px * w_tip, 0.0, center_z + dz * ray_len - pz * w_tip)

        half_d = 0.052 if r_idx == 3 else 0.046
        vf = [bm.verts.new((x, -half_d, z)) for (x, _, z) in (p0, p1, p2, p3)]
        vb = [bm.verts.new((x, half_d, z)) for (x, _, z) in (p0, p1, p2, p3)]
        bm.faces.new(vf)
        bm.faces.new(list(reversed(vb)))
        for i in range(4):
            bm.faces.new((vf[i], vf[(i + 1) % 4], vb[(i + 1) % 4], vb[i]))

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat_gold)
    return obj


def build_monopoly_artdeco_archway():
    clear_scene()

    # 3 Canonical PBR Material Slots
    mat_marble = make_pbr_material("Mat_CarraraMarble", "#F8FAFC", metallic=0.05, roughness=0.24)
    mat_brass = make_pbr_material("Mat_BrushedBrass", "#D97706", metallic=0.90, roughness=0.20)
    mat_gold = make_pbr_material(
        "Mat_EmissiveGold",
        "#F59E0B",
        metallic=0.92,
        roughness=0.14,
        emission_hex="#F59E0B",
        emission_strength=0.45,
    )

    parts = []

    # 1. Main Marble Portal Mass (carved with Boolean Modifier + Bevel 3 segments)
    main_portal = create_bmesh_box(
        "Arch_Marble_MainPortal",
        size_xyz=(0.68, 0.116, 0.50),
        center_xyz=(0.0, 0.0, 0.29),
        mat=mat_marble,
        bevel_width=0.0,
    )
    cutter = build_arch_cutter_bmesh("Arch_Boolean_Cutter", arch_half_w=0.185, spring_z=0.25, crown_z=0.445, cut_depth=0.28)

    bool_mod = main_portal.modifiers.new(name="ArchCarveBoolean", type="BOOLEAN")
    bool_mod.operation = "DIFFERENCE"
    bool_mod.solver = "EXACT"
    bool_mod.object = cutter

    bev_mod = main_portal.modifiers.new(name="ArtDecoBevel", type="BEVEL")
    bev_mod.width = 0.0045
    bev_mod.segments = 3
    bev_mod.limit_method = "ANGLE"
    bev_mod.angle_limit = math.radians(35.0)

    bpy.context.view_layer.objects.active = main_portal
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)
    bpy.ops.object.modifier_apply(modifier=bev_mod.name)
    bpy.data.objects.remove(cutter, do_unlink=True)
    parts.append(main_portal)

    # 2. Stepped Marble Architrave Tiers (Indochine Art Deco Ziggurat Crown)
    parts.append(
        create_bmesh_box(
            "Arch_Marble_LowerEntablature",
            size_xyz=(0.71, 0.128, 0.052),
            center_xyz=(0.0, 0.0, 0.555),
            mat=mat_marble,
            bevel_width=0.0035,
            bevel_segments=2,
        )
    )
    parts.append(
        create_bmesh_box(
            "Arch_Marble_UpperZiggurat",
            size_xyz=(0.50, 0.118, 0.048),
            center_xyz=(0.0, 0.0, 0.602),
            mat=mat_marble,
            bevel_width=0.0035,
            bevel_segments=2,
        )
    )

    # 3. Twin Pier Fluted Marble Pilasters & Brushed Brass Plinths / Capitals
    for side in (-1, 1):
        px = side * 0.265
        # Stepped Brass Base Plinth (locks outer width to 0.72m and depth to 0.14m, bottom at Z = 0.00m)
        parts.append(
            create_bmesh_box(
                f"Arch_Brass_PlinthBase_{side}",
                size_xyz=(0.19, 0.14, 0.048),
                center_xyz=(px, 0.0, 0.024),
                mat=mat_brass,
                bevel_width=0.003,
                bevel_segments=1,
            )
        )
        parts.append(
            create_bmesh_box(
                f"Arch_Brass_PlinthCollar_{side}",
                size_xyz=(0.168, 0.132, 0.026),
                center_xyz=(px, 0.0, 0.060),
                mat=mat_brass,
                bevel_width=0.0025,
                bevel_segments=1,
            )
        )
        # Pier Capital Collar
        parts.append(
            create_bmesh_box(
                f"Arch_Brass_PierCapital_{side}",
                size_xyz=(0.172, 0.134, 0.028),
                center_xyz=(px, 0.0, 0.265),
                mat=mat_brass,
                bevel_width=0.0025,
                bevel_segments=1,
            )
        )
        # Vertical Art Deco Fluted Brass Ribs on Front & Back Pier Faces
        for flute_offset in (-0.032, 0.0, 0.032):
            parts.append(
                create_bmesh_box(
                    f"Arch_Brass_PierFlute_{side}_{flute_offset}",
                    size_xyz=(0.012, 0.130, 0.42),
                    center_xyz=(px + flute_offset, 0.0, 0.29),
                    mat=mat_brass,
                    bevel_width=0.0,
                )
            )
        # Emissive Gold Vertical Lantern Inlay on Each Pier
        parts.append(
            create_bmesh_box(
                f"Arch_Gold_PierLantern_{side}",
                size_xyz=(0.024, 0.134, 0.15),
                center_xyz=(px, 0.0, 0.165),
                mat=mat_gold,
                bevel_width=0.002,
                bevel_segments=1,
            )
        )

    # 4. Brushed Brass Cornice Moldings & Crest Frame
    parts.append(
        create_bmesh_box(
            "Arch_Brass_MainCornice",
            size_xyz=(0.72, 0.14, 0.024),
            center_xyz=(0.0, 0.0, 0.525),
            mat=mat_brass,
            bevel_width=0.0025,
            bevel_segments=1,
        )
    )
    parts.append(
        create_bmesh_box(
            "Arch_Brass_UpperCornice",
            size_xyz=(0.54, 0.132, 0.020),
            center_xyz=(0.0, 0.0, 0.582),
            mat=mat_brass,
            bevel_width=0.0025,
            bevel_segments=1,
        )
    )
    parts.append(
        create_bmesh_box(
            "Arch_Brass_KeystoneEscutcheon",
            size_xyz=(0.14, 0.136, 0.11),
            center_xyz=(0.0, 0.0, 0.495),
            mat=mat_brass,
            bevel_width=0.003,
            bevel_segments=1,
        )
    )

    # 5. Emissive Gold Sunburst Crown Crest & Keystone Medallion
    parts.append(create_sunburst_keystone_bmesh("Arch_Gold_SunburstCrown", mat_gold))
    parts.append(
        create_bmesh_box(
            "Arch_Gold_KeystoneGem",
            size_xyz=(0.088, 0.14, 0.072),
            center_xyz=(0.0, 0.0, 0.495),
            mat=mat_gold,
            bevel_width=0.0025,
            bevel_segments=1,
        )
    )

    # Apply modifiers on all sub-parts and join into a single multi-material mesh
    bpy.ops.object.select_all(action="DESELECT")
    for obj in parts:
        bpy.context.view_layer.objects.active = obj
        for mod in list(obj.modifiers):
            bpy.ops.object.modifier_apply(modifier=mod.name)
        obj.select_set(True)

    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    archway = bpy.context.active_object
    archway.name = "MonopolyArtDecoArchway"

    # Normalize exact unscaled bounding box to 0.72m (X) x 0.14m (Y) x 0.68m (Z) with Pivot [0, 0, 0] at bottom center
    mesh = archway.data
    xs = [v.co.x for v in mesh.vertices]
    ys = [v.co.y for v in mesh.vertices]
    zs = [v.co.z for v in mesh.vertices]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    min_z, max_z = min(zs), max(zs)

    cur_w = max(1e-6, max_x - min_x)
    cur_d = max(1e-6, max_y - min_y)
    cur_h = max(1e-6, max_z - min_z)
    cx = 0.5 * (min_x + max_x)
    cy = 0.5 * (min_y + max_y)

    for v in mesh.vertices:
        v.co.x = (v.co.x - cx) * (TARGET_WIDTH / cur_w)
        v.co.y = (v.co.y - cy) * (TARGET_DEPTH / cur_d)
        v.co.z = (v.co.z - min_z) * (TARGET_HEIGHT / cur_h)

    mesh.update()

    # Smooth shading + Weighted Normals Modifier for crisp Art Deco bevel highlights
    for poly in mesh.polygons:
        poly.use_smooth = True

    wn_mod = archway.modifiers.new(name="WeightedNormal", type="WEIGHTED_NORMAL")
    wn_mod.keep_sharp = True
    bpy.context.view_layer.objects.active = archway
    bpy.ops.object.modifier_apply(modifier=wn_mod.name)

    # Verify triangle count and bounding box before export
    bm_check = bmesh.new()
    bm_check.from_mesh(mesh)
    bmesh.ops.triangulate(bm_check, faces=bm_check.faces)
    tri_count = len(bm_check.faces)
    bm_check.free()

    final_xs = [v.co.x for v in mesh.vertices]
    final_ys = [v.co.y for v in mesh.vertices]
    final_zs = [v.co.z for v in mesh.vertices]
    bbox_w = round(max(final_xs) - min(final_xs), 4)
    bbox_d = round(max(final_ys) - min(final_ys), 4)
    bbox_h = round(max(final_zs) - min(final_zs), 4)
    print(f"[IMP-401] Archway BBox: width={bbox_w}m, height={bbox_h}m, depth={bbox_d}m | Tris={tri_count}")

    assert abs(bbox_w - TARGET_WIDTH) <= 1e-3, f"Width mismatch: {bbox_w}"
    assert abs(bbox_h - TARGET_HEIGHT) <= 1e-3, f"Height mismatch: {bbox_h}"
    assert abs(bbox_d - TARGET_DEPTH) <= 1e-3, f"Depth mismatch: {bbox_d}"
    assert tri_count <= 1500, f"Triangle budget exceeded: {tri_count} > 1500"

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
    print(f"[IMP-401] Exported {OUT_GLB_PATH} ({size_bytes} bytes, {tri_count} tris)")
    assert size_bytes <= 48 * 1024, f"File size exceeded 48KB: {size_bytes} bytes"


if __name__ == "__main__":
    build_monopoly_artdeco_archway()
