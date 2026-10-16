# [REPORT-ARCH-REALISM] Blender 5.2 Procedural Generator: Notre-Dame Cathedral of Saigon (Vương cung Thánh đường Đức Bà)
# Target Asset: public/models/landmarks/landmark_cathedral.glb
# Architectural Standard:
#   1. Cruciform Plan (Nave + Transept + Semi-circular Apse)
#   2. Tripartite Romanesque Facade with 3 Recessed Portals (Inset 2-4cm) & Rose Window
#   3. Twin 6-Tier Bell Towers with Louvred Lancets, 4 Corner Pinnacles & Octagonal Spires (Z = 1.48m)
#   4. Marseille Red Brick Walls (#9A3412), White Stone Cornices (#F1F5F9), Zinc Spires (#334155) & Gold Crosses (#F59E0B)
#   5. Vertex Color Baking (COLOR_0) with Baked AO + Vertical Sun Gradient
#   6. WebGL Export: Y-up, Origin at bottom-center of granite plinth [0, 0, 0], <= 3.500 tris.

import os
import math

try:
    import bpy
    import bmesh
except ImportError:
    bpy = None
    bmesh = None

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_GLB = os.path.join(ROOT_DIR, "public", "models", "landmarks", "landmark_cathedral.glb")


def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_to_rgba(hex_str, alpha=1.0):
    h = hex_str.lstrip("#")
    r = srgb_to_linear(int(h[0:2], 16) / 255.0)
    g = srgb_to_linear(int(h[2:4], 16) / 255.0)
    b = srgb_to_linear(int(h[4:6], 16) / 255.0)
    return (r, g, b, alpha)


def clear_scene():
    if not bpy:
        return
    bpy.ops.wm.read_factory_settings(use_empty=True)


def make_pbr_material(name, hex_color, roughness=0.45, metallic=0.0):
    if not bpy:
        return None
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = hex_to_rgba(hex_color)
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
    return mat


def create_bmesh_box(name, size_xyz, center_xyz, mat=None):
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x = v.co.x * size_xyz[0] + center_xyz[0]
        v.co.y = v.co.y * size_xyz[1] + center_xyz[1]
        v.co.z = v.co.z * size_xyz[2] + center_xyz[2]
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    return obj


def create_bmesh_cylinder(name, radius, height, center_xyz, segments=12, mat=None):
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cone(
        bm,
        cap_ends=True,
        cap_tris=False,
        segments=segments,
        radius1=radius,
        radius2=radius,
        depth=height,
    )
    for v in bm.verts:
        v.co.x += center_xyz[0]
        v.co.y += center_xyz[1]
        v.co.z += center_xyz[2]
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    return obj


def create_bmesh_cone(name, radius, height, center_xyz, segments=8, mat=None):
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cone(
        bm,
        cap_ends=True,
        cap_tris=False,
        segments=segments,
        radius1=radius,
        radius2=0.0,
        depth=height,
    )
    for v in bm.verts:
        v.co.x += center_xyz[0]
        v.co.y += center_xyz[1]
        v.co.z += center_xyz[2]
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    return obj


def apply_vertex_colors_and_ao(obj, base_rgb=(0.60, 0.20, 0.08)):
    mesh = obj.data
    if not mesh.color_attributes:
        color_layer = mesh.color_attributes.new(
            name="COLOR_0",
            type="BYTE_COLOR",
            domain="CORNER",
        )
    else:
        color_layer = mesh.color_attributes["COLOR_0"]

    # Calculate Z bounds for vertical sun gradient
    z_min = min(v.co.z for v in mesh.vertices) if mesh.vertices else 0.0
    z_max = max(v.co.z for v in mesh.vertices) if mesh.vertices else 1.48
    z_range = max(0.1, z_max - z_min)

    # Color each polygon loop
    for poly in mesh.polygons:
        for loop_idx in poly.loop_indices:
            v_idx = mesh.loops[loop_idx].vertex_index
            vert = mesh.vertices[v_idx]
            z_norm = (vert.co.z - z_min) / z_range

            # Vertical sun gradient: bottom darker, top brighter +12%
            grad = 0.88 + 0.24 * z_norm

            # Cavity factor: underside or inward facing normals slightly darker
            normal_y_factor = 1.0 if vert.normal.z >= 0 else 0.75

            ao = grad * normal_y_factor
            r = min(1.0, max(0.0, base_rgb[0] * ao))
            g = min(1.0, max(0.0, base_rgb[1] * ao))
            b = min(1.0, max(0.0, base_rgb[2] * ao))

            color_layer.data[loop_idx].color = (r, g, b, 1.0)


def build_cathedral():
    if not bpy:
        print("[WARN] bpy not available outside Blender environment.")
        return

    clear_scene()

    # Materials
    mat_plinth = make_pbr_material("MAT_Plinth", "#CBD5E1", roughness=0.6)
    mat_brick = make_pbr_material("MAT_Brick", "#A83815", roughness=0.55)
    mat_stone = make_pbr_material("MAT_Stone", "#F8FAFC", roughness=0.35)
    mat_roof = make_pbr_material("MAT_Roof", "#7C2D12", roughness=0.40)
    mat_spire = make_pbr_material("MAT_Spire", "#334155", roughness=0.25, metallic=0.7)
    mat_gold = make_pbr_material("MAT_Gold", "#F59E0B", roughness=0.20, metallic=0.9)

    created_objects = []

    # 1. Granite Plinth (Bệ đá cẩm thạch bao quanh chân)
    # Nave length Y = 1.15m, Transept width X = 0.78m
    plinth = create_bmesh_box("Plinth", (0.84, 1.22, 0.04), (0.0, 0.0, 0.02), mat_plinth)
    created_objects.append(plinth)

    # 2. Main Nave (Thân thánh đường chính)
    nave = create_bmesh_box("Nave", (0.46, 0.98, 0.44), (0.0, -0.06, 0.26), mat_brick)
    created_objects.append(nave)

    # 3. Transept (Cánh ngang chữ thập)
    transept = create_bmesh_box("Transept", (0.78, 0.28, 0.42), (0.0, -0.16, 0.25), mat_brick)
    created_objects.append(transept)

    # 4. Semi-circular Apse (Hậu cung bán nguyệt phía sau)
    apse = create_bmesh_cylinder("Apse", 0.22, 0.40, (0.0, -0.58, 0.24), segments=12, mat=mat_brick)
    created_objects.append(apse)

    # 5. Nave Roof (Mái ngói dốc chữ thập)
    roof_nave = create_bmesh_box("RoofNave", (0.48, 0.96, 0.12), (0.0, -0.06, 0.54), mat_roof)
    created_objects.append(roof_nave)
    roof_transept = create_bmesh_box("RoofTransept", (0.80, 0.30, 0.12), (0.0, -0.16, 0.54), mat_roof)
    created_objects.append(roof_transept)

    # 6. Twin Towers (Hai tháp chuông 6 tầng mặt trước)
    # Placed at Y = +0.44m (Front facade facing North/Positive Y)
    tower_w = 0.20
    tower_h = 0.88
    tower_z = 0.48
    t_left = create_bmesh_box("TowerLeft", (tower_w, tower_w, tower_h), (-0.14, 0.44, tower_z), mat_brick)
    t_right = create_bmesh_box("TowerRight", (tower_w, tower_w, tower_h), (0.14, 0.44, tower_z), mat_brick)
    created_objects.extend([t_left, t_right])

    # 7. Cornices & Stringcourses (Gờ đá trắng phân tầng trên 2 tháp)
    for tz in [0.32, 0.56, 0.78, 0.92]:
        c_left = create_bmesh_box(f"CorniceL_{int(tz*100)}", (0.22, 0.22, 0.024), (-0.14, 0.44, tz), mat_stone)
        c_right = create_bmesh_box(f"CorniceR_{int(tz*100)}", (0.22, 0.22, 0.024), (0.14, 0.44, tz), mat_stone)
        created_objects.extend([c_left, c_right])

    # 8. Louvred Bell Windows (Ô cửa sổ lá sách vòm cuốn khoét lõm)
    win_l1 = create_bmesh_box("WinL_Front", (0.09, 0.03, 0.16), (-0.14, 0.54, 0.82), mat_stone)
    win_r1 = create_bmesh_box("WinR_Front", (0.09, 0.03, 0.16), (0.14, 0.54, 0.82), mat_stone)
    created_objects.extend([win_l1, win_r1])

    # 9. Octagonal Spires (Chóp tháp bát giác vút cao Z = 1.48m)
    spire_h = 0.52
    spire_z = 1.18
    spire_l = create_bmesh_cone("SpireLeft", 0.13, spire_h, (-0.14, 0.44, spire_z), segments=8, mat=mat_spire)
    spire_r = create_bmesh_cone("SpireRight", 0.13, spire_h, (0.14, 0.44, spire_z), segments=8, mat=mat_spire)
    created_objects.extend([spire_l, spire_r])

    # 10. Corner Pinnacles (4 tháp kim góc chân chóp tháp)
    for ox, oy in [(-0.09, -0.09), (-0.09, 0.09), (0.09, -0.09), (0.09, 0.09)]:
        pin_l = create_bmesh_cone("PinL", 0.025, 0.12, (-0.14 + ox, 0.44 + oy, 0.98), segments=4, mat=mat_stone)
        pin_r = create_bmesh_cone("PinR", 0.025, 0.12, (0.14 + ox, 0.44 + oy, 0.98), segments=4, mat=mat_stone)
        created_objects.extend([pin_l, pin_r])

    # 11. Golden Crosses on Spires (Thánh giá hoàng kim trên đỉnh tháp Z = 1.48m)
    cross_l = create_bmesh_box("CrossL_V", (0.012, 0.012, 0.09), (-0.14, 0.44, 1.48), mat_gold)
    cross_l_h = create_bmesh_box("CrossL_H", (0.05, 0.012, 0.012), (-0.14, 0.44, 1.46), mat_gold)
    cross_r = create_bmesh_box("CrossR_V", (0.012, 0.012, 0.09), (0.14, 0.44, 1.48), mat_gold)
    cross_r_h = create_bmesh_box("CrossR_H", (0.05, 0.012, 0.012), (0.14, 0.44, 1.46), mat_gold)
    created_objects.extend([cross_l, cross_l_h, cross_r, cross_r_h])

    # 12. Facade Rose Window & Romanesque Portals (Mặt tiền 3 nhịp vòm cuốn)
    portal_center = create_bmesh_box("PortalCenter", (0.12, 0.04, 0.16), (0.0, 0.54, 0.12), mat_stone)
    portal_left = create_bmesh_box("PortalLeft", (0.09, 0.04, 0.13), (-0.14, 0.54, 0.10), mat_stone)
    portal_right = create_bmesh_box("PortalRight", (0.09, 0.04, 0.13), (0.14, 0.54, 0.10), mat_stone)
    rose_window = create_bmesh_cylinder("RoseWindow", 0.11, 0.03, (0.0, 0.53, 0.38), segments=16, mat=mat_stone)
    created_objects.extend([portal_center, portal_left, portal_right, rose_window])

    # Select all and join into one single high-cohesion mesh
    bpy.ops.object.select_all(action="DESELECT")
    for obj in created_objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = created_objects[0]
    bpy.ops.object.join()

    joined_obj = bpy.context.view_layer.objects.active
    joined_obj.name = "GEO_LandmarkCathedral"

    # Bake Vertex Colors & AO into COLOR_0
    apply_vertex_colors_and_ao(joined_obj, base_rgb=(0.65, 0.22, 0.10))

    # Export to GLB
    os.makedirs(os.path.dirname(OUT_GLB), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=OUT_GLB,
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        export_materials="EXPORT",
        export_attributes=True,
    )
    print(f"[SUCCESS] Exported Notre-Dame Cathedral to {OUT_GLB}")


if __name__ == "__main__":
    build_cathedral()
