"""
VTCOON 3D Asset Builder — Chibi Transition Vehicles (Police Cruiser & Passenger Airliner)
Targets:
  1. public/models/vehicles/vehicle_police.glb (Mesh: Vehicle_Police, < 1,800 tris, Pivot: Road contact plane (0,0,0))
  2. public/models/vehicles/vehicle_plane.glb  (Mesh: Vehicle_Plane,  < 2,200 tris, Pivot: Lower fuselage belly (0,0,0))
Style: Monopoly Plus / Townscaper tactile stylized low-poly chibi aesthetic.
"""

import json
import math
import os
import struct
import bpy
import bmesh
from mathutils import Matrix, Vector

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_DIR = os.path.join(REPO_ROOT, "public", "models", "vehicles")
POLICE_GLB_PATH = os.path.join(OUT_DIR, "vehicle_police.glb")
PLANE_GLB_PATH = os.path.join(OUT_DIR, "vehicle_plane.glb")
RENDER_PREVIEW_PATH = os.path.join(REPO_ROOT, ".agents", "tmp", "vehicles_police_plane_verified.jpg")


def srgb_to_linear(c: float) -> float:
    if c <= 0.04045:
        return c / 12.92
    return ((c + 0.055) / 1.055) ** 2.4


def hex_to_rgba(hex_str: str, alpha: float = 1.0) -> tuple[float, float, float, float]:
    h = hex_str.lstrip("#")
    r = srgb_to_linear(int(h[0:2], 16) / 255.0)
    g = srgb_to_linear(int(h[2:4], 16) / 255.0)
    b = srgb_to_linear(int(h[4:6], 16) / 255.0)
    return (r, g, b, alpha)


def make_pbr_mat(
    name: str,
    hex_color: str,
    roughness: float = 0.35,
    metallic: float = 0.0,
    emissive_hex: str | None = None,
    emissive_strength: float = 0.0,
) -> bpy.types.Material:
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf is None:
        bsdf = mat.node_tree.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = hex_to_rgba(hex_color)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic

    if emissive_hex and emissive_strength > 0.0:
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = hex_to_rgba(emissive_hex)
        elif "Emission" in bsdf.inputs:
            bsdf.inputs["Emission"].default_value = hex_to_rgba(emissive_hex)
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = emissive_strength
    return mat


def create_material_library() -> dict[str, bpy.types.Material]:
    return {
        "white_body": make_pbr_mat("MAT_White_Body", "#F8FAFC", roughness=0.25, metallic=0.05),
        "navy_police": make_pbr_mat("MAT_Navy_Police", "#1E3A8A", roughness=0.35, metallic=0.10),
        "graphite_chassis": make_pbr_mat("MAT_Graphite_Chassis", "#0F172A", roughness=0.80, metallic=0.10),
        "tinted_glass": make_pbr_mat("MAT_Tinted_Glass", "#0284C7", roughness=0.10, metallic=0.80),
        "cockpit_visor": make_pbr_mat("MAT_Cockpit_Visor", "#0284C7", roughness=0.10, metallic=0.85),
        "chrome_trim": make_pbr_mat("MAT_Chrome_Trim", "#E2E8F0", roughness=0.15, metallic=0.90),
        "alloy_rim": make_pbr_mat("MAT_Alloy_Rim", "#64748B", roughness=0.35, metallic=0.75),
        "siren_red": make_pbr_mat(
            "MAT_Siren_Red", "#EF4444", roughness=0.15, metallic=0.0, emissive_hex="#EF4444", emissive_strength=1.0
        ),
        "siren_blue": make_pbr_mat(
            "MAT_Siren_Blue", "#3B82F6", roughness=0.15, metallic=0.0, emissive_hex="#3B82F6", emissive_strength=1.0
        ),
        "headlight": make_pbr_mat(
            "MAT_Headlight_Yellow", "#FEF08A", roughness=0.15, metallic=0.0, emissive_hex="#FEF08A", emissive_strength=0.8
        ),
        "taillight": make_pbr_mat(
            "MAT_Taillight_Red", "#EF4444", roughness=0.25, metallic=0.0, emissive_hex="#EF4444", emissive_strength=0.45
        ),
        "lotus_teal": make_pbr_mat("MAT_Lotus_Teal", "#0D9488", roughness=0.30, metallic=0.10),
        "gold_trim": make_pbr_mat("MAT_Gold_Trim", "#F59E0B", roughness=0.30, metallic=0.65),
    }


def add_beveled_box(
    bm: bmesh.types.BMesh,
    size: tuple[float, float, float],
    center: tuple[float, float, float],
    bevel_offset: float,
    bevel_segments: int,
    mat_idx: int,
    rot_euler: tuple[float, float, float] = (0.0, 0.0, 0.0),
    smooth: bool = True,
) -> None:
    temp_bm = bmesh.new()
    bmesh.ops.create_cube(temp_bm, size=1.0)
    bmesh.ops.scale(temp_bm, vec=Vector(size), verts=temp_bm.verts)
    if bevel_offset > 0.0:
        geom = list(temp_bm.verts) + list(temp_bm.edges) + list(temp_bm.faces)
        bmesh.ops.bevel(
            temp_bm,
            geom=geom,
            offset=bevel_offset,
            offset_type="OFFSET",
            segments=bevel_segments,
            profile=0.5,
            affect="EDGES",
        )
    rot_mat = (
        Matrix.Rotation(rot_euler[2], 4, "Z")
        @ Matrix.Rotation(rot_euler[1], 4, "Y")
        @ Matrix.Rotation(rot_euler[0], 4, "X")
    )
    xform = Matrix.Translation(Vector(center)) @ rot_mat
    bmesh.ops.transform(temp_bm, matrix=xform, verts=temp_bm.verts)

    vert_map = {}
    for v in temp_bm.verts:
        nv = bm.verts.new(v.co)
        vert_map[v] = nv
    for f in temp_bm.faces:
        try:
            nf = bm.faces.new([vert_map[v] for v in f.verts])
            nf.material_index = mat_idx
            nf.smooth = smooth
        except ValueError:
            pass
    temp_bm.free()


def add_cylinder_part(
    bm: bmesh.types.BMesh,
    radius1: float,
    radius2: float,
    depth: float,
    segments: int,
    center: tuple[float, float, float],
    rot_euler: tuple[float, float, float],
    mat_idx: int,
    smooth: bool = True,
) -> None:
    temp_bm = bmesh.new()
    bmesh.ops.create_cone(
        temp_bm,
        cap_ends=True,
        cap_tris=False,
        segments=segments,
        radius1=radius1,
        radius2=radius2,
        depth=depth,
    )
    rot_mat = (
        Matrix.Rotation(rot_euler[2], 4, "Z")
        @ Matrix.Rotation(rot_euler[1], 4, "Y")
        @ Matrix.Rotation(rot_euler[0], 4, "X")
    )
    xform = Matrix.Translation(Vector(center)) @ rot_mat
    bmesh.ops.transform(temp_bm, matrix=xform, verts=temp_bm.verts)

    vert_map = {}
    for v in temp_bm.verts:
        nv = bm.verts.new(v.co)
        vert_map[v] = nv
    for f in temp_bm.faces:
        try:
            nf = bm.faces.new([vert_map[v] for v in f.verts])
            nf.material_index = mat_idx
            nf.smooth = smooth
        except ValueError:
            pass
    temp_bm.free()


def build_police_cruiser(mats: dict[str, bpy.types.Material]) -> bpy.types.Object:
    """
    Build stylized chibi Police Escort Cruiser (`Vehicle_Police`).
    Orientation in Blender (Z-Up, exported with +Y Up):
      - Forward (-Y in Blender -> +Z in Three.js)
      - Width along X (-0.125m .. +0.125m, total width ~0.25m)
      - Length along Y (-0.25m .. +0.25m, total length ~0.50m)
      - Height along Z (0.00m .. +0.22m, total height ~0.22m)
      - Pivot at (0, 0, 0) on road contact plane (Z = 0).
    """
    mesh = bpy.data.meshes.new("Vehicle_Police")
    obj = bpy.data.objects.new("Vehicle_Police", mesh)
    bpy.context.collection.objects.link(obj)

    mat_order = [
        mats["white_body"],       # 0
        mats["navy_police"],      # 1
        mats["graphite_chassis"], # 2
        mats["tinted_glass"],     # 3
        mats["chrome_trim"],      # 4
        mats["siren_red"],        # 5
        mats["siren_blue"],       # 6
        mats["headlight"],        # 7
        mats["taillight"],        # 8
        mats["alloy_rim"],        # 9
    ]
    for m in mat_order:
        mesh.materials.append(m)

    bm = bmesh.new()

    # 1. Dark Graphite Underbody Chassis Pan (Z = 0.032m .. 0.068m)
    add_beveled_box(
        bm,
        size=(0.215, 0.455, 0.038),
        center=(0.0, 0.0, 0.050),
        bevel_offset=0.010,
        bevel_segments=1,
        mat_idx=2,
    )

    # 2. Main White Lower Car Body (Chibi rounded fenders, hood & trunk, Z = 0.048m .. 0.128m)
    add_beveled_box(
        bm,
        size=(0.232, 0.470, 0.082),
        center=(0.0, 0.0, 0.088),
        bevel_offset=0.022,
        bevel_segments=1,
        mat_idx=0,
    )

    # 3. Sculpted Hood Crown (White, slightly raised rounded bonnet)
    add_beveled_box(
        bm,
        size=(0.185, 0.155, 0.024),
        center=(0.0, -0.145, 0.122),
        bevel_offset=0.010,
        bevel_segments=1,
        mat_idx=0,
        rot_euler=(math.radians(-4.0), 0.0, 0.0),
    )

    # 4. Deep Navy Blue Side Door Panels & Interceptor Flank Stripes (#1E3A8A)
    for sx in (-1.0, 1.0):
        add_beveled_box(
            bm,
            size=(0.016, 0.255, 0.062),
            center=(sx * 0.112, 0.005, 0.086),
            bevel_offset=0.006,
            bevel_segments=1,
            mat_idx=1,
        )
        # Chibi Flank Fender flare accents (White)
        for sy in (-0.145, 0.145):
            add_beveled_box(
                bm,
                size=(0.022, 0.115, 0.042),
                center=(sx * 0.112, sy, 0.068),
                bevel_offset=0.010,
                bevel_segments=1,
                mat_idx=0,
            )

    # 5. Rounded Chibi Greenhouse Cabin (White roof & pillars, Z = 0.115m .. 0.194m)
    add_beveled_box(
        bm,
        size=(0.196, 0.255, 0.082),
        center=(0.0, 0.018, 0.153),
        bevel_offset=0.020,
        bevel_segments=1,
        mat_idx=0,
    )

    # 6. Stylized Reflective Tinted Glass Windows (#0284C7)
    # Front Windshield (cleanly proud of front cabin slope)
    add_beveled_box(
        bm,
        size=(0.156, 0.018, 0.048),
        center=(0.0, -0.104, 0.154),
        bevel_offset=0.004,
        bevel_segments=1,
        mat_idx=3,
        rot_euler=(math.radians(16.0), 0.0, 0.0),
    )
    # Rear Window (cleanly proud of rear cabin slope)
    add_beveled_box(
        bm,
        size=(0.154, 0.018, 0.046),
        center=(0.0, 0.139, 0.154),
        bevel_offset=0.004,
        bevel_segments=1,
        mat_idx=3,
        rot_euler=(math.radians(-16.0), 0.0, 0.0),
    )
    # Side Cabin Windows (Front & Rear doors on both sides, cleanly proud of side pillars)
    for sx in (-1.0, 1.0):
        add_beveled_box(
            bm,
            size=(0.012, 0.084, 0.044),
            center=(sx * 0.096, -0.028, 0.154),
            bevel_offset=0.004,
            bevel_segments=1,
            mat_idx=3,
        )
        add_beveled_box(
            bm,
            size=(0.012, 0.078, 0.044),
            center=(sx * 0.096, 0.068, 0.154),
            bevel_offset=0.004,
            bevel_segments=1,
            mat_idx=3,
        )
        # Cute Side Mirrors (Navy Blue)
        add_beveled_box(
            bm,
            size=(0.026, 0.018, 0.018),
            center=(sx * 0.112, -0.078, 0.132),
            bevel_offset=0.0,
            bevel_segments=1,
            mat_idx=1,
        )

    # 7. Front & Rear Graphite Bumpers, Grille & Police Bullbar (#0F172A)
    # Front Bumper
    add_beveled_box(
        bm,
        size=(0.238, 0.036, 0.032),
        center=(0.0, -0.236, 0.054),
        bevel_offset=0.010,
        bevel_segments=1,
        mat_idx=2,
    )
    # Rear Bumper
    add_beveled_box(
        bm,
        size=(0.236, 0.034, 0.032),
        center=(0.0, 0.236, 0.054),
        bevel_offset=0.010,
        bevel_segments=1,
        mat_idx=2,
    )
    # Front Radiator Grille
    add_beveled_box(
        bm,
        size=(0.115, 0.016, 0.032),
        center=(0.0, -0.234, 0.088),
        bevel_offset=0.0,
        bevel_segments=1,
        mat_idx=2,
    )
    # Police Front Push-Bar / Bullbar (Graphite uprights + crossbars)
    for sx in (-0.046, 0.046):
        add_beveled_box(
            bm,
            size=(0.012, 0.022, 0.054),
            center=(sx, -0.246, 0.076),
            bevel_offset=0.0,
            bevel_segments=1,
            mat_idx=2,
        )
    add_beveled_box(
        bm,
        size=(0.106, 0.014, 0.012),
        center=(0.0, -0.252, 0.092),
        bevel_offset=0.0,
        bevel_segments=1,
        mat_idx=2,
    )

    # 8. Headlights (#FEF08A Emissive) & Taillights (#EF4444)
    for sx in (-0.082, 0.082):
        # Round Chibi Headlight + Chrome Bezel
        add_cylinder_part(
            bm,
            radius1=0.020,
            radius2=0.020,
            depth=0.012,
            segments=10,
            center=(sx, -0.233, 0.090),
            rot_euler=(math.radians(90.0), 0.0, 0.0),
            mat_idx=4,
        )
        add_cylinder_part(
            bm,
            radius1=0.016,
            radius2=0.016,
            depth=0.014,
            segments=10,
            center=(sx, -0.236, 0.090),
            rot_euler=(math.radians(90.0), 0.0, 0.0),
            mat_idx=7,
        )
        # Rear Taillights
        add_beveled_box(
            bm,
            size=(0.044, 0.014, 0.022),
            center=(sx, 0.234, 0.092),
            bevel_offset=0.005,
            bevel_segments=1,
            mat_idx=8,
        )

    # 9. Roof Lightbar: Chrome Mounting Bar + Red Lens (Driver side) + Blue Lens (Passenger side)
    # Chrome cross-bar & center speaker housing
    add_beveled_box(
        bm,
        size=(0.145, 0.026, 0.010),
        center=(0.0, 0.005, 0.196),
        bevel_offset=0.0,
        bevel_segments=1,
        mat_idx=4,
    )
    add_beveled_box(
        bm,
        size=(0.030, 0.036, 0.022),
        center=(0.0, 0.005, 0.208),
        bevel_offset=0.0,
        bevel_segments=1,
        mat_idx=4,
    )
    # Driver Side Red Siren Dome (-X side facing -Y forward)
    add_beveled_box(
        bm,
        size=(0.056, 0.036, 0.022),
        center=(-0.044, 0.005, 0.209),
        bevel_offset=0.007,
        bevel_segments=1,
        mat_idx=5,
    )
    # Passenger Side Blue Siren Dome (+X side facing -Y forward)
    add_beveled_box(
        bm,
        size=(0.056, 0.036, 0.022),
        center=(0.044, 0.005, 0.209),
        bevel_offset=0.007,
        bevel_segments=1,
        mat_idx=6,
    )

    # 10. Four Rubber Wheels (radius = 0.050m, width = 0.035m, resting on Z = 0.000m)
    wheel_positions = [
        (-0.108, -0.145, 0.050),
        (0.108, -0.145, 0.050),
        (-0.108, 0.145, 0.050),
        (0.108, 0.145, 0.050),
    ]
    for wx, wy, wz in wheel_positions:
        # Outer rubber tire (radius 0.050m, width 0.035m)
        add_cylinder_part(
            bm,
            radius1=0.050,
            radius2=0.050,
            depth=0.035,
            segments=12,
            center=(wx, wy, wz),
            rot_euler=(0.0, math.radians(90.0), 0.0),
            mat_idx=2,
        )
        # Dark grey alloy rim (radius 0.031m, slightly proud on outer face)
        add_cylinder_part(
            bm,
            radius1=0.031,
            radius2=0.031,
            depth=0.038,
            segments=10,
            center=(wx, wy, wz),
            rot_euler=(0.0, math.radians(90.0), 0.0),
            mat_idx=9,
        )
        # Chrome center hubcap (radius 0.014m)
        add_cylinder_part(
            bm,
            radius1=0.014,
            radius2=0.014,
            depth=0.041,
            segments=8,
            center=(wx, wy, wz),
            rot_euler=(0.0, math.radians(90.0), 0.0),
            mat_idx=4,
        )

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()
    mesh.update()
    return obj


def add_lofted_tube(
    bm: bmesh.types.BMesh,
    stations: list[tuple[float, float, float, float, int]],
    segments: int,
) -> None:
    """
    Create a lofted elliptical capsule along Y axis.
    Each station: (y, z_center, rx, rz, mat_override_or_neg1_for_belly_split)
    """
    temp_bm = bmesh.new()
    rings = []
    for y, zc, rx, rz, _ in stations:
        ring = []
        for i in range(segments):
            theta = (2.0 * math.pi * i) / segments
            vx = rx * math.cos(theta)
            vz = zc + rz * math.sin(theta)
            ring.append(temp_bm.verts.new((vx, y, vz)))
        rings.append(ring)

    # Cap front nose (pure pearl white radome)
    first_y, first_zc, _, _, _ = stations[0]
    nose_tip = temp_bm.verts.new((0.0, first_y - 0.012, first_zc))
    for i in range(segments):
        v1 = rings[0][i]
        v2 = rings[0][(i + 1) % segments]
        f = temp_bm.faces.new((nose_tip, v2, v1))
        f.material_index = 0
        f.smooth = True

    # Bridge rings
    for r_idx in range(len(rings) - 1):
        r0 = rings[r_idx]
        r1 = rings[r_idx + 1]
        _, zc0, _, _, mat_mode = stations[r_idx]
        for i in range(segments):
            v00 = r0[i]
            v01 = r0[(i + 1) % segments]
            v11 = r1[(i + 1) % segments]
            v10 = r1[i]
            f = temp_bm.faces.new((v00, v01, v11, v10))
            avg_z = (v00.co.z + v01.co.z + v11.co.z + v10.co.z) * 0.25
            if mat_mode >= 0:
                f.material_index = mat_mode
            elif mat_mode == -2:
                # Cockpit visor band: upper-front arc is cockpit_visor (2), mid is white (0), lower belly is teal (1)
                if avg_z >= (zc0 + 0.018):
                    f.material_index = 2
                elif avg_z >= (zc0 - 0.012):
                    f.material_index = 0
                else:
                    f.material_index = 1
            else:
                # Upper fuselage pearl white (0), lower belly lotus teal (1)
                f.material_index = 0 if avg_z >= (zc0 - 0.012) else 1
            f.smooth = True

    # Cap rear tailcone
    last_y, last_zc, _, _, _ = stations[-1]
    tail_tip = temp_bm.verts.new((0.0, last_y + 0.015, last_zc))
    for i in range(segments):
        v1 = rings[-1][i]
        v2 = rings[-1][(i + 1) % segments]
        f = temp_bm.faces.new((v1, v2, tail_tip))
        f.material_index = 0
        f.smooth = True

    vert_map = {v: bm.verts.new(v.co) for v in temp_bm.verts}
    for f in temp_bm.faces:
        try:
            nf = bm.faces.new([vert_map[v] for v in f.verts])
            nf.material_index = f.material_index
            nf.smooth = True
        except ValueError:
            pass
    temp_bm.free()


def add_swept_airfoil_surface(
    bm: bmesh.types.BMesh,
    root_center: tuple[float, float, float],
    root_chord: float,
    root_thick: float,
    tip_center: tuple[float, float, float],
    tip_chord: float,
    tip_thick: float,
    mat_idx: int,
    tip_mat_idx: int | None = None,
) -> None:
    """Create a smooth multi-station swept airfoil wing or stabilizer with rounded leading/trailing profile."""
    temp_bm = bmesh.new()
    # Cross-section profile points in normalized chord [-0.5 .. +0.5] and thickness [-0.5 .. +0.5]
    profile = [
        (-0.50, 0.00),
        (-0.42, 0.36),
        (-0.15, 0.50),
        (0.20, 0.34),
        (0.50, 0.06),
        (0.50, -0.06),
        (0.20, -0.26),
        (-0.15, -0.38),
        (-0.42, -0.28),
    ]
    span_fractions = [0.0, 0.35, 0.72, 0.92, 1.0]
    rings = []
    for s in span_fractions:
        cx = root_center[0] + (tip_center[0] - root_center[0]) * s
        cy = root_center[1] + (tip_center[1] - root_center[1]) * s
        cz = root_center[2] + (tip_center[2] - root_center[2]) * s
        chord = root_chord + (tip_chord - root_chord) * s
        thick = root_thick + (tip_thick - root_thick) * s
        if s == 1.0:
            thick *= 0.55
            chord *= 0.78
        ring = []
        for py, pz in profile:
            ring.append(temp_bm.verts.new((cx, cy + py * chord, cz + pz * thick)))
        rings.append(ring)

    n_prof = len(profile)
    for r_idx in range(len(rings) - 1):
        r0 = rings[r_idx]
        r1 = rings[r_idx + 1]
        use_mat = tip_mat_idx if (tip_mat_idx is not None and r_idx >= len(rings) - 2) else mat_idx
        for i in range(n_prof):
            v00 = r0[i]
            v01 = r0[(i + 1) % n_prof]
            v11 = r1[(i + 1) % n_prof]
            v10 = r1[i]
            f = temp_bm.faces.new((v00, v01, v11, v10))
            f.material_index = use_mat
            f.smooth = True

    # Cap wingtip
    tip_face = temp_bm.faces.new(rings[-1])
    tip_face.material_index = tip_mat_idx if tip_mat_idx is not None else mat_idx
    tip_face.smooth = True

    bmesh.ops.recalc_face_normals(temp_bm, faces=temp_bm.faces)
    vert_map = {v: bm.verts.new(v.co) for v in temp_bm.verts}
    for f in temp_bm.faces:
        try:
            nf = bm.faces.new([vert_map[v] for v in f.verts])
            nf.material_index = f.material_index
            nf.smooth = True
        except ValueError:
            pass
    temp_bm.free()


def build_passenger_airliner(mats: dict[str, bpy.types.Material]) -> bpy.types.Object:
    """
    Build stylized Chibi Passenger Airliner (`Vehicle_Plane`).
    Orientation in Blender (Z-Up, exported with +Y Up):
      - Forward (-Y in Blender -> +Z in Three.js)
      - Length ~0.65m (-0.325m nose .. +0.325m tail)
      - Wingspan ~0.60m (-0.30m .. +0.30m)
      - Height ~0.24m (from gear / lower belly up to vertical tail fin tip)
      - Pivot at (0, 0, 0) at Center of Mass on the lower fuselage belly.
    """
    mesh = bpy.data.meshes.new("Vehicle_Plane")
    obj = bpy.data.objects.new("Vehicle_Plane", mesh)
    bpy.context.collection.objects.link(obj)

    mat_order = [
        mats["white_body"],       # 0: Pearl white upper fuselage & wings
        mats["lotus_teal"],       # 1: Lotus teal/cyan lower belly, engines & tail stripe
        mats["cockpit_visor"],    # 2: Dark glossy cockpit visor & cabin portal windows
        mats["chrome_trim"],      # 3: Chrome engine intake cowls & struts
        mats["graphite_chassis"], # 4: Tires & turbine fan core
        mats["gold_trim"],        # 5: Golden lotus cheatline accent
    ]
    for m in mat_order:
        mesh.materials.append(m)

    bm = bmesh.new()

    # 1. Chunky Aerodynamic Capsule Fuselage (Lofted multi-station egg-capsule)
    # Pivot (0,0,0) is at the lower fuselage belly Center of Mass (fuselage centerline at Z = 0.072m, belly at Z = 0.0m)
    fuselage_stations = [
        (-0.312, 0.056, 0.022, 0.020, 0),   # 0: Nose radome tip
        (-0.285, 0.060, 0.052, 0.046, 0),   # 1: Lower nose (white)
        (-0.242, 0.068, 0.076, 0.066, -2),  # 2: Cockpit visor band start (-2 = wraparound visor)
        (-0.192, 0.072, 0.088, 0.076, -1),  # 3: Cockpit visor band end / Forward cabin
        (-0.130, 0.074, 0.094, 0.081, -1),  # 4: Forward cabin
        (-0.040, 0.075, 0.096, 0.082, -1),  # 5: Mid-forward widebody
        (0.060,  0.075, 0.096, 0.082, -1),  # 6: Mid-aft widebody
        (0.165,  0.076, 0.086, 0.074, -1),  # 7: Aft cabin taper
        (0.245,  0.082, 0.058, 0.052, -1),  # 8: Empennage root
        (0.310,  0.090, 0.022, 0.022, 3),   # 9: APU exhaust tailcone (chrome)
    ]
    add_lofted_tube(bm, fuselage_stations, segments=18)

    # 2.Raised Wraparound Cockpit Visor Band (#0284C7) conforming to nose curvature
    visor_bm = bmesh.new()
    visor_angles = [math.radians(a) for a in (25, 45, 68, 90, 112, 135, 155)]
    v_front_ring = []
    v_back_ring = []
    for ang in visor_angles:
        v_front_ring.append(
            visor_bm.verts.new((0.0785 * math.cos(ang), -0.240, 0.068 + 0.0685 * math.sin(ang)))
        )
        v_back_ring.append(
            visor_bm.verts.new((0.0905 * math.cos(ang), -0.194, 0.072 + 0.0785 * math.sin(ang)))
        )
    for i in range(len(visor_angles) - 1):
        vf = visor_bm.faces.new((v_front_ring[i], v_front_ring[i + 1], v_back_ring[i + 1], v_back_ring[i]))
        vf.material_index = 2
        vf.smooth = True
    bmesh.ops.recalc_face_normals(visor_bm, faces=visor_bm.faces)
    v_map = {v: bm.verts.new(v.co) for v in visor_bm.verts}
    for f in visor_bm.faces:
        nf = bm.faces.new([v_map[v] for v in f.verts])
        nf.material_index = 2
        nf.smooth = True
    visor_bm.free()

    # 3. Four Rounded Passenger Portal Windows along each flank (8 total)
    window_y_positions = [-0.125, -0.045, 0.035, 0.115]
    for sx in (-1.0, 1.0):
        for wy in window_y_positions:
            # Chrome window frame bezel
            add_cylinder_part(
                bm,
                radius1=0.017,
                radius2=0.017,
                depth=0.012,
                segments=8,
                center=(sx * 0.091, wy, 0.088),
                rot_euler=(0.0, math.radians(90.0), 0.0),
                mat_idx=3,
            )
            # Glossy tinted portal window glass
            add_cylinder_part(
                bm,
                radius1=0.013,
                radius2=0.013,
                depth=0.015,
                segments=8,
                center=(sx * 0.092, wy, 0.088),
                rot_euler=(0.0, math.radians(90.0), 0.0),
                mat_idx=2,
            )

    # 4. Low-Wing Swept Airfoils with +3 deg Dihedral & Lotus Teal Wingtips (Wingspan = 0.60m)
    wing_span_half = 0.298
    dihedral_rise = wing_span_half * math.tan(math.radians(3.0))  # +3° dihedral (~0.0156m)
    for sx in (-1.0, 1.0):
        add_swept_airfoil_surface(
            bm,
            root_center=(sx * 0.072, -0.015, 0.042),
            root_chord=0.165,
            root_thick=0.026,
            tip_center=(sx * wing_span_half, 0.068, 0.042 + dihedral_rise),
            tip_chord=0.068,
            tip_thick=0.012,
            mat_idx=0,
            tip_mat_idx=1,
        )

    # 5. Twin Under-Wing Turbofan Engine Pods with Chrome Intake Cowls
    for sx in (-1.0, 1.0):
        eng_x = sx * 0.148
        eng_y = -0.032
        eng_z = 0.018
        # Engine Pylon strut connecting wing to nacelle
        add_beveled_box(
            bm,
            size=(0.014, 0.065, 0.024),
            center=(eng_x, eng_y + 0.012, eng_z + 0.020),
            bevel_offset=0.003,
            bevel_segments=1,
            mat_idx=0,
        )
        # Main Lotus Teal Turbofan Nacelle Body
        add_cylinder_part(
            bm,
            radius1=0.030,
            radius2=0.034,
            depth=0.082,
            segments=16,
            center=(eng_x, eng_y, eng_z),
            rot_euler=(math.radians(90.0), 0.0, 0.0),
            mat_idx=1,
        )
        # Chrome Forward Intake Cowl Lip
        add_cylinder_part(
            bm,
            radius1=0.034,
            radius2=0.031,
            depth=0.018,
            segments=16,
            center=(eng_x, eng_y - 0.046, eng_z),
            rot_euler=(math.radians(90.0), 0.0, 0.0),
            mat_idx=3,
        )
        # Dark Graphite Fan Spinner Core inside intake
        add_cylinder_part(
            bm,
            radius1=0.024,
            radius2=0.006,
            depth=0.022,
            segments=12,
            center=(eng_x, eng_y - 0.040, eng_z),
            rot_euler=(math.radians(90.0), 0.0, 0.0),
            mat_idx=4,
        )
        # Chrome Exhaust Nozzle Cone
        add_cylinder_part(
            bm,
            radius1=0.018,
            radius2=0.025,
            depth=0.022,
            segments=12,
            center=(eng_x, eng_y + 0.046, eng_z),
            rot_euler=(math.radians(90.0), 0.0, 0.0),
            mat_idx=3,
        )

    # 6. Empennage: Swept Vertical Stabilizer Fin with Lotus Cyan Stripe + Swept Horizontal Stabilizers
    # Vertical Stabilizer (reaches Z = 0.228m for ~0.24m total aircraft height)
    temp_vfin = bmesh.new()
    vfin_profile = [
        (-0.50, 0.00),
        (-0.40, 0.42),
        (-0.10, 0.50),
        (0.25, 0.32),
        (0.50, 0.05),
        (0.50, -0.05),
        (0.25, -0.32),
        (-0.10, -0.50),
        (-0.40, -0.42),
    ]
    vfin_spans = [
        (0.00, 0.215, 0.115, 0.128, 0.022, 0),
        (0.45, 0.248, 0.165, 0.098, 0.018, 5),  # Golden lotus band
        (0.62, 0.262, 0.184, 0.084, 0.015, 1),  # Lotus cyan upper fin stripe
        (0.90, 0.286, 0.215, 0.064, 0.012, 1),
        (1.00, 0.295, 0.226, 0.050, 0.008, 1),
    ]
    vfin_rings = []
    for _, cy, cz, chord, thick, _ in vfin_spans:
        ring = []
        for py, px in vfin_profile:
            ring.append(temp_vfin.verts.new((px * thick, cy + py * chord, cz)))
        vfin_rings.append(ring)
    n_vp = len(vfin_profile)
    for r_i in range(len(vfin_rings) - 1):
        r0 = vfin_rings[r_i]
        r1 = vfin_rings[r_i + 1]
        m_id = vfin_spans[r_i][5]
        for i in range(n_vp):
            f = temp_vfin.faces.new((r0[i], r0[(i + 1) % n_vp], r1[(i + 1) % n_vp], r1[i]))
            f.material_index = m_id
            f.smooth = True
    tip_f = temp_vfin.faces.new(vfin_rings[-1])
    tip_f.material_index = 1
    tip_f.smooth = True
    bmesh.ops.recalc_face_normals(temp_vfin, faces=temp_vfin.faces)
    vmap = {v: bm.verts.new(v.co) for v in temp_vfin.verts}
    for f in temp_vfin.faces:
        try:
            nf = bm.faces.new([vmap[v] for v in f.verts])
            nf.material_index = f.material_index
            nf.smooth = True
        except ValueError:
            pass
    temp_vfin.free()

    # Swept Horizontal Stabilizers
    for sx in (-1.0, 1.0):
        add_swept_airfoil_surface(
            bm,
            root_center=(sx * 0.032, 0.248, 0.088),
            root_chord=0.085,
            root_thick=0.016,
            tip_center=(sx * 0.135, 0.292, 0.094),
            tip_chord=0.042,
            tip_thick=0.008,
            mat_idx=0,
            tip_mat_idx=1,
        )

    # 7. Minimalist Low-Profile Landing Gear tucked under the belly
    # Nose Gear (at Y = -0.205m, Z = -0.014m)
    add_cylinder_part(
        bm,
        radius1=0.005,
        radius2=0.005,
        depth=0.022,
        segments=8,
        center=(0.0, -0.205, 0.002),
        rot_euler=(0.0, 0.0, 0.0),
        mat_idx=3,
    )
    for wx in (-0.010, 0.010):
        add_cylinder_part(
            bm,
            radius1=0.014,
            radius2=0.014,
            depth=0.009,
            segments=12,
            center=(wx, -0.205, -0.008),
            rot_euler=(0.0, math.radians(90.0), 0.0),
            mat_idx=4,
        )

    # Main Under-Belly Twin Bogies (at Y = +0.025m, X = +-0.055m)
    for sx in (-1.0, 1.0):
        gx = sx * 0.055
        add_cylinder_part(
            bm,
            radius1=0.006,
            radius2=0.006,
            depth=0.024,
            segments=8,
            center=(gx, 0.025, 0.002),
            rot_euler=(0.0, 0.0, 0.0),
            mat_idx=3,
        )
        for dwx in (-0.012, 0.012):
            add_cylinder_part(
                bm,
                radius1=0.017,
                radius2=0.017,
                depth=0.011,
                segments=12,
                center=(gx + dwx, 0.025, -0.009),
                rot_euler=(0.0, math.radians(90.0), 0.0),
                mat_idx=4,
            )

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()
    mesh.update()
    return obj


def export_single_vehicle_glb(obj: bpy.types.Object, filepath: str, max_tris: int) -> dict:
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    bpy.context.view_layer.update()

    tris = sum(len(p.vertices) - 2 for p in obj.data.polygons)
    verts = len(obj.data.vertices)
    bbox = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
    dims = (
        max(v.x for v in bbox) - min(v.x for v in bbox),
        max(v.y for v in bbox) - min(v.y for v in bbox),
        max(v.z for v in bbox) - min(v.z for v in bbox),
    )
    min_z = min(v.z for v in bbox)
    max_z = max(v.z for v in bbox)

    if tris >= max_tris:
        raise RuntimeError(f"{obj.name} triangle count {tris} exceeds budget {max_tris}")

    for o in bpy.context.scene.objects:
        o.select_set(False)
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
        export_extras=False,
        export_animations=False,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_draco_position_quantization=14,
        export_draco_normal_quantization=10,
        export_draco_texcoord_quantization=12,
    )

    size_kb = os.path.getsize(filepath) / 1024.0
    with open(filepath, "rb") as f:
        raw = f.read()
    json_len = struct.unpack("<I", raw[12:16])[0]
    gltf_json = json.loads(raw[20 : 20 + json_len].decode("utf-8"))
    nodes = [n.get("name") for n in gltf_json.get("nodes", [])]
    ext_used = gltf_json.get("extensionsUsed", [])

    info = {
        "name": obj.name,
        "tris": tris,
        "verts": verts,
        "dims_xyz": tuple(round(d, 3) for d in dims),
        "z_bounds": (round(min_z, 3), round(max_z, 3)),
        "size_kb": round(size_kb, 2),
        "nodes": nodes,
        "extensions": ext_used,
    }
    print(f"[VTCOON-VEHICLE] Exported {obj.name}: {json.dumps(info)}")
    return info


def render_studio_preview(police_obj: bpy.types.Object, plane_obj: bpy.types.Object, out_path: str) -> None:
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    scene = bpy.context.scene

    # Position side-by-side for studio beauty shot
    police_obj.location = (-0.28, 0.0, 0.0)
    police_obj.rotation_euler = (0.0, 0.0, math.radians(28.0))

    plane_obj.location = (0.28, 0.0, 0.04)
    plane_obj.rotation_euler = (math.radians(8.0), math.radians(-10.0), math.radians(-28.0))

    # Studio backdrop floor
    bpy.ops.mesh.primitive_plane_add(size=4.0, location=(0.0, 0.0, 0.0))
    floor = bpy.context.active_object
    floor.name = "Studio_Floor"
    floor_mat = make_pbr_mat("MAT_Studio_Floor", "#E2E8F0", roughness=0.45, metallic=0.05)
    floor.data.materials.append(floor_mat)

    for eng in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE"):
        try:
            scene.render.engine = eng
            break
        except TypeError:
            continue

    scene.render.resolution_x = 1440
    scene.render.resolution_y = 810
    scene.render.image_settings.file_format = "JPEG"
    scene.render.image_settings.quality = 95

    world = bpy.data.worlds.new("Vehicle_Studio_World")
    scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg = nt.nodes.new("ShaderNodeBackground")
    bg.inputs["Color"].default_value = hex_to_rgba("#F1F5F9")
    bg.inputs["Strength"].default_value = 1.15
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])

    # Three-point studio lighting
    key_data = bpy.data.lights.new("Key_Light", type="AREA")
    key_data.energy = 35.0
    key_data.size = 1.5
    key_data.color = hex_to_rgba("#FFFBEB")[:3]
    key_light = bpy.data.objects.new("Key_Light", key_data)
    key_light.location = (-1.2, -1.4, 1.5)
    key_light.rotation_euler = (Vector((0.0, 0.0, 0.1)) - key_light.location).to_track_quat("-Z", "Y").to_euler()
    bpy.context.collection.objects.link(key_light)

    rim_data = bpy.data.lights.new("Rim_Light", type="AREA")
    rim_data.energy = 25.0
    rim_data.size = 1.2
    rim_data.color = hex_to_rgba("#BAE6FD")[:3]
    rim_light = bpy.data.objects.new("Rim_Light", rim_data)
    rim_light.location = (1.3, 1.2, 1.2)
    rim_light.rotation_euler = (Vector((0.0, 0.0, 0.1)) - rim_light.location).to_track_quat("-Z", "Y").to_euler()
    bpy.context.collection.objects.link(rim_light)

    cam_data = bpy.data.cameras.new("Studio_Cam")
    cam_data.lens = 55.0
    cam = bpy.data.objects.new("Studio_Cam", cam_data)
    cam.location = (0.0, -1.25, 0.48)
    cam.rotation_euler = (Vector((0.0, 0.0, 0.11)) - cam.location).to_track_quat("-Z", "Y").to_euler()
    bpy.context.collection.objects.link(cam)
    scene.camera = cam

    scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print(f"[VTCOON-VEHICLE] Studio preview saved to {out_path}")


def main() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    mats = create_material_library()

    police_obj = build_police_cruiser(mats)
    export_single_vehicle_glb(police_obj, POLICE_GLB_PATH, max_tris=1800)

    plane_obj = build_passenger_airliner(mats)
    export_single_vehicle_glb(plane_obj, PLANE_GLB_PATH, max_tris=2200)

    render_studio_preview(police_obj, plane_obj, RENDER_PREVIEW_PATH)


if __name__ == "__main__":
    main()
