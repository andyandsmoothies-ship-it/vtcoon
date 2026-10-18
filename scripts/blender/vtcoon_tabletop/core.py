# -*- coding: utf-8 -*-
"""VTCOON Tabletop Studio — lõi dùng chung: vật liệu PBR, collection, MeshBatch, primitive điêu khắc."""

import math
import os

import bmesh
import bpy
from mathutils import Matrix, Vector

UP = Vector((0.0, 0.0, 1.0))


# -----------------------------------------------------------------------------
# Đường dẫn dự án
# -----------------------------------------------------------------------------
def get_project_root() -> str:
    here = os.path.dirname(os.path.abspath(__file__))
    candidate = os.path.abspath(os.path.join(here, "..", "..", ".."))
    if os.path.exists(os.path.join(candidate, "package.json")):
        return candidate
    return os.getcwd()


PROJECT_ROOT = get_project_root()
BLEND_SAVE_PATH = os.path.join(PROJECT_ROOT, "tabletop_studio.blend")
RENDER_VERIFY_PATH = os.path.join(PROJECT_ROOT, ".agents", "tmp", "tabletop_studio_verified_1.jpg")
GLB_EXPORT_PATH = os.path.join(PROJECT_ROOT, "public", "models", "board", "tabletop_diorama.glb")


# -----------------------------------------------------------------------------
# Màu & vật liệu
# -----------------------------------------------------------------------------
def srgb_to_linear(c: float) -> float:
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_to_rgba(hex_str: str, alpha: float = 1.0) -> tuple[float, float, float, float]:
    h = hex_str.lstrip("#")
    return (
        srgb_to_linear(int(h[0:2], 16) / 255.0),
        srgb_to_linear(int(h[2:4], 16) / 255.0),
        srgb_to_linear(int(h[4:6], 16) / 255.0),
        alpha,
    )


def _set_input(node, name: str, value) -> None:
    sock = node.inputs.get(name)
    if sock is not None:
        sock.default_value = value


def create_pbr_material(
    name: str,
    hex_color: str,
    metallic: float = 0.0,
    roughness: float = 0.45,
    specular: float = 0.5,
    coat: float = 0.0,
    emission_hex: str | None = None,
    emission_strength: float = 0.0,
) -> bpy.types.Material:
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name=name)
    if mat.node_tree is None:
        mat.use_nodes = True
    bsdf = next((n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
    if bsdf is None:
        raise RuntimeError(f"Principled BSDF missing on material {name}")
    _set_input(bsdf, "Base Color", hex_to_rgba(hex_color))
    _set_input(bsdf, "Metallic", metallic)
    _set_input(bsdf, "Roughness", roughness)
    _set_input(bsdf, "Specular IOR Level", specular)
    if coat > 0.0:
        _set_input(bsdf, "Coat Weight", coat)
        _set_input(bsdf, "Coat Roughness", 0.06)
    if emission_hex and emission_strength > 0.0:
        _set_input(bsdf, "Emission Color", hex_to_rgba(emission_hex))
        _set_input(bsdf, "Emission Strength", emission_strength)
    mat.diffuse_color = hex_to_rgba(hex_color)
    return mat


# -----------------------------------------------------------------------------
# Collection & mesh object
# -----------------------------------------------------------------------------
def ensure_collection(name: str, parent: bpy.types.Collection | None = None) -> bpy.types.Collection:
    coll = bpy.data.collections.get(name)
    if coll is None:
        coll = bpy.data.collections.new(name)
        (parent or bpy.context.scene.collection).children.link(coll)
    return coll


def move_to_collection(obj: bpy.types.Object, coll: bpy.types.Collection) -> None:
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    coll.objects.link(obj)


def create_mesh_object(name, bm, mat, coll, smooth: bool = False):
    if len(bm.faces) == 0:
        bm.free()
        return None
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    for f in bm.faces:
        f.smooth = smooth
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    if smooth:
        mesh.set_sharp_from_angle(angle=math.radians(42.0))
    obj = bpy.data.objects.new(name, mesh)
    mesh.materials.append(mat)
    move_to_collection(obj, coll)
    return obj


class MeshBatch:
    """Gom hình học theo vật liệu → mỗi công trình chỉ tạo 1 object / vật liệu (O(1) draw call)."""

    def __init__(self, prefix: str, mats: dict, coll: bpy.types.Collection):
        self.prefix = prefix
        self.mats = mats
        self.coll = coll
        self._bms: dict[str, bmesh.types.BMesh] = {}
        self._smooth: set[str] = set()

    def __call__(self, key: str, smooth: bool = False) -> bmesh.types.BMesh:
        if key not in self.mats:
            raise KeyError(f"Unknown material key: {key}")
        if smooth:
            self._smooth.add(key)
        if key not in self._bms:
            self._bms[key] = bmesh.new()
        return self._bms[key]

    def commit(self) -> list:
        objs = []
        for key, bm in self._bms.items():
            label = "".join(part.capitalize() for part in key.split("_"))
            obj = create_mesh_object(f"{self.prefix}_{label}", bm, self.mats[key], self.coll, key in self._smooth)
            if obj is not None:
                objs.append(obj)
        self._bms.clear()
        return objs


# -----------------------------------------------------------------------------
# Primitive điêu khắc
# -----------------------------------------------------------------------------
def local_frame(cx: float, cy: float, rot_z: float):
    """Trả về hàm to_w(lx, ly, lz) cho hệ toạ độ cục bộ xoay quanh trục Z."""
    c, s = math.cos(rot_z), math.sin(rot_z)

    def to_w(lx: float, ly: float, lz: float) -> Vector:
        return Vector((cx + lx * c - ly * s, cy + lx * s + ly * c, lz))

    return to_w


def add_box(bm, center, size, rot_z: float = 0.0) -> None:
    m = Matrix.Translation(Vector(center)) @ Matrix.Rotation(rot_z, 4, "Z")
    m = m @ Matrix.Diagonal(Vector((size[0], size[1], size[2], 1.0)))
    bmesh.ops.create_cube(bm, size=1.0, matrix=m)


def add_cylinder(bm, center, r1: float, r2: float, depth: float, segments: int = 12, rot_z: float = 0.0) -> None:
    m = Matrix.Translation(Vector(center)) @ Matrix.Rotation(rot_z, 4, "Z")
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=segments,
                          radius1=r1, radius2=r2, depth=depth, matrix=m)


def add_sphere(bm, center, scale, subdiv: int = 2, rot_z: float = 0.0, pitch: float = 0.0) -> None:
    m = Matrix.Translation(Vector(center)) @ Matrix.Rotation(rot_z, 4, "Z") @ Matrix.Rotation(pitch, 4, "Y")
    m = m @ Matrix.Diagonal(Vector((scale[0], scale[1], scale[2], 1.0)))
    bmesh.ops.create_icosphere(bm, subdivisions=subdiv, radius=1.0, matrix=m)


def add_cylinder_between(bm, p1, p2, r1: float, r2: float | None = None, segments: int = 8) -> None:
    v1, v2 = Vector(p1), Vector(p2)
    d = v2 - v1
    if d.length < 1e-5:
        return
    q = UP.rotation_difference(d.normalized())
    m = Matrix.Translation(0.5 * (v1 + v2)) @ q.to_matrix().to_4x4()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=segments,
                          radius1=r1, radius2=r1 if r2 is None else r2, depth=d.length, matrix=m)


def add_frustum(bm, center_xy, z0: float, z1: float, bot_half, top_half, rot_z: float = 0.0) -> None:
    """Khối chóp cụt chữ nhật (bệ giật cấp, mái Mansard)."""
    to_w = local_frame(center_xy[0], center_xy[1], rot_z)
    (bx, by), (tx, ty) = bot_half, top_half
    b = [bm.verts.new(to_w(sx * bx, sy * by, z0)) for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    t = [bm.verts.new(to_w(sx * tx, sy * ty, z1)) for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    bm.faces.new(list(reversed(b)))
    bm.faces.new(t)
    for i in range(4):
        j = (i + 1) % 4
        bm.faces.new((b[i], b[j], t[j], t[i]))


def add_pitched_roof(bm, center_xy, z_base, width_x, depth_y, roof_h, rot_z=0.0, hip_inset=0.24) -> None:
    to_w = local_frame(center_xy[0], center_xy[1], rot_z)
    hx, hy = width_x * 0.5, depth_y * 0.5
    v = [bm.verts.new(to_w(sx * hx, sy * hy, z_base)) for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    zt = z_base + roof_h
    if hx >= hy:
        rh = max(0.01, hx - hy * (1.0 + hip_inset) * 0.5) if hip_inset > 0 else hx
        r0, r1 = bm.verts.new(to_w(-rh, 0.0, zt)), bm.verts.new(to_w(rh, 0.0, zt))
        faces = ((v[0], v[1], r1, r0), (v[1], v[2], r1), (v[2], v[3], r0, r1), (v[3], v[0], r0))
    else:
        rh = max(0.01, hy - hx * (1.0 + hip_inset) * 0.5) if hip_inset > 0 else hy
        r0, r1 = bm.verts.new(to_w(0.0, -rh, zt)), bm.verts.new(to_w(0.0, rh, zt))
        faces = ((v[0], v[1], r0), (v[1], v[2], r1, r0), (v[2], v[3], r1), (v[3], v[0], r0, r1))
    for f in faces:
        bm.faces.new(f)
    bm.faces.new((v[3], v[2], v[1], v[0]))


def add_oriental_curved_roof(bm, center_xy, z_base, width_x, depth_y, roof_h,
                             corner_upturn: float = 0.05, rot_z: float = 0.0, per_side: int = 6) -> None:
    """Mái đao cong phương Đông: bụng mái võng lõm + 4 mũi đao cong vểnh ở 4 góc."""
    to_w = local_frame(center_xy[0], center_xy[1], rot_z)
    hx, hy = width_x * 0.5, depth_y * 0.5
    ridge_x = max(0.0, hx - hy) * 0.9 + 0.01
    ridge_y = max(0.0, hy - hx) * 0.9 + 0.01
    levels = 6
    corners = ((-1, -1), (1, -1), (1, 1), (-1, 1))
    rings = []
    for li in range(levels + 1):
        s = li / levels
        ex = hx * (1.0 - s) + ridge_x * s
        ey = hy * (1.0 - s) + ridge_y * s
        z = z_base + roof_h * (s ** 1.7)
        lift_scale = (1.0 - s) ** 2.4
        ring = []
        for ci in range(4):
            ax, ay = corners[ci]
            bx, by = corners[(ci + 1) % 4]
            for k in range(per_side):
                t = k / per_side
                w = abs(2.0 * t - 1.0) ** 3
                px = (ax + (bx - ax) * t) * ex * (1.0 + 0.10 * w * lift_scale)
                py = (ay + (by - ay) * t) * ey * (1.0 + 0.10 * w * lift_scale)
                ring.append(bm.verts.new(to_w(px, py, z + corner_upturn * w * lift_scale)))
        rings.append(ring)
    n = len(rings[0])
    for li in range(levels):
        for k in range(n):
            kn = (k + 1) % n
            bm.faces.new((rings[li][k], rings[li][kn], rings[li + 1][kn], rings[li + 1][k]))
    bm.faces.new(rings[-1])
    c_bot = bm.verts.new(to_w(0.0, 0.0, z_base))
    for k in range(n):
        bm.faces.new((rings[0][(k + 1) % n], rings[0][k], c_bot))


def add_arched_opening(bm, center, width, depth, total_height, rot_z=0.0, arch_segs=8) -> None:
    """Khối cửa vòm cuốn (chân thẳng + đỉnh bán nguyệt), mặt trước hướng -Y cục bộ."""
    cx, cy, cz = center
    to_w = local_frame(cx, cy, rot_z)
    hw, hd = width * 0.5, depth * 0.5
    z_bot = -total_height * 0.5
    z_spring = z_bot + max(0.01, total_height - hw)
    prof = [(-hw, z_bot), (hw, z_bot)]
    prof += [(hw * math.cos(math.pi * i / arch_segs), z_spring + hw * math.sin(math.pi * i / arch_segs))
             for i in range(arch_segs + 1)]
    front = [bm.verts.new(to_w(px, -hd, cz + pz)) for px, pz in prof]
    back = [bm.verts.new(to_w(px, hd, cz + pz)) for px, pz in prof]
    bm.faces.new(front)
    bm.faces.new(list(reversed(back)))
    for i in range(len(prof)):
        j = (i + 1) % len(prof)
        bm.faces.new((front[i], back[i], back[j], front[j]))


def add_star(bm, center, r_out, r_in, thickness, rot_z=0.0, points=5) -> None:
    """Ngôi sao nổi trên mặt phẳng đứng (mặt hướng -Y cục bộ)."""
    cx, cy, cz = center
    to_w = local_frame(cx, cy, rot_z)
    hy = thickness * 0.5
    front, back = [], []
    for k in range(points * 2):
        a = math.pi * 0.5 + k * math.pi / points
        r = r_out if k % 2 == 0 else r_in
        front.append(bm.verts.new(to_w(r * math.cos(a), -hy, cz + r * math.sin(a))))
        back.append(bm.verts.new(to_w(r * math.cos(a), hy, cz + r * math.sin(a))))
    cf, cb = bm.verts.new(to_w(0.0, -hy * 1.4, cz)), bm.verts.new(to_w(0.0, hy * 1.4, cz))
    n = len(front)
    for k in range(n):
        kn = (k + 1) % n
        bm.faces.new((cf, front[kn], front[k]))
        bm.faces.new((cb, back[k], back[kn]))
        bm.faces.new((front[k], front[kn], back[kn], back[k]))


def add_tube_along(bm, pts, radius, segments=6, closed=False, radii=None) -> None:
    """Ống tròn quét theo polyline 3D (gân thép, thân dừa, lan can)."""
    n = len(pts)
    rings = []
    for i, p in enumerate(pts):
        if closed:
            t = pts[(i + 1) % n] - pts[(i - 1) % n]
        else:
            t = pts[min(i + 1, n - 1)] - pts[max(i - 1, 0)]
        t = t.normalized()
        ref = UP if abs(t.z) < 0.9 else Vector((1.0, 0.0, 0.0))
        u = t.cross(ref).normalized()
        v = t.cross(u).normalized()
        r = radii[i] if radii else radius
        rings.append([bm.verts.new(p + (u * math.cos(a) + v * math.sin(a)) * r)
                      for a in (2.0 * math.pi * k / segments for k in range(segments))])
    last = n if closed else n - 1
    for i in range(last):
        r0, r1 = rings[i], rings[(i + 1) % n]
        for k in range(segments):
            kn = (k + 1) % segments
            bm.faces.new((r0[k], r0[kn], r1[kn], r1[k]))
    if not closed:
        bm.faces.new(list(reversed(rings[0])))
        bm.faces.new(rings[-1])


def path_normals_xy(pts, closed: bool) -> list[Vector]:
    """Pháp tuyến phải (outward với polyline CCW) trên mặt phẳng XY."""
    n = len(pts)
    out = []
    for i in range(n):
        a = pts[(i - 1) % n] if closed else pts[max(i - 1, 0)]
        b = pts[(i + 1) % n] if closed else pts[min(i + 1, n - 1)]
        t = Vector((b.x - a.x, b.y - a.y, 0.0)).normalized()
        out.append(Vector((t.y, -t.x, 0.0)))
    return out


def sweep_profile(bm, pts, profile, closed_path: bool, normals=None) -> None:
    """Quét mặt cắt khép kín [(offset_pháp_tuyến, z)] dọc polyline XY (bờ kè, dầm metro, đường dạo)."""
    nrm = normals or path_normals_xy(pts, closed_path)
    rings = [[bm.verts.new(Vector((p.x, p.y, p.z)) + nv * off + Vector((0.0, 0.0, z))) for off, z in profile]
             for p, nv in zip(pts, nrm)]
    m = len(profile)
    count = len(pts) if closed_path else len(pts) - 1
    for i in range(count):
        r0, r1 = rings[i], rings[(i + 1) % len(pts)]
        for k in range(m):
            kn = (k + 1) % m
            bm.faces.new((r0[k], r1[k], r1[kn], r0[kn]))
    if not closed_path:
        bm.faces.new(list(reversed(rings[0])))
        bm.faces.new(rings[-1])


def add_ring(bm, center, r_out, r_in, z0, z1, segments=64) -> None:
    cx, cy = center
    rings = []
    for r, z in ((r_out, z0), (r_out, z1), (r_in, z1), (r_in, z0)):
        rings.append([bm.verts.new((cx + r * math.cos(a), cy + r * math.sin(a), z))
                      for a in (2.0 * math.pi * k / segments for k in range(segments))])
    for q in range(4):
        ra, rb = rings[q], rings[(q + 1) % 4]
        for k in range(segments):
            kn = (k + 1) % segments
            bm.faces.new((ra[k], ra[kn], rb[kn], rb[k]))


# -----------------------------------------------------------------------------
# Bản đồ vùng cấm (tránh chồng lấn cây xanh / trụ metro với công trình)
# -----------------------------------------------------------------------------
class ClearanceMap:
    def __init__(self):
        self.circles: list[tuple[float, float, float]] = []
        self.paths: list[tuple[list[Vector], float]] = []
        self.predicates = []

    def add_circle(self, x: float, y: float, r: float) -> None:
        self.circles.append((x, y, r))

    def add_path(self, pts: list[Vector], half_width: float) -> None:
        self.paths.append((pts, half_width))

    def add_predicate(self, fn) -> None:
        self.predicates.append(fn)

    def is_free(self, x: float, y: float, margin: float = 0.0) -> bool:
        for cx, cy, r in self.circles:
            if math.hypot(x - cx, y - cy) < r + margin:
                return False
        for pts, hw in self.paths:
            for p in pts:
                if math.hypot(x - p.x, y - p.y) < hw + margin:
                    return False
        return not any(fn(x, y, margin) for fn in self.predicates)
