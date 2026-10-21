# -*- coding: utf-8 -*-
"""
VTCOON — Sa Bàn Trung Tâm "Hai Đại Đô Thị" (Blender 5.2.2 LTS, headless CLI)
=============================================================================
Quy hoạch tinh gọn chuẩn bảo tàng (Museum-Grade Refined Single-Landmarks Layout):
  • TÂM [0, 0, 0]: Mặt Trống Đồng Đông Sơn (R = 1.48m) trên bệ đá giật cấp, bao quanh bởi Vòng xuyến đại lộ tròn.
  • KHU BỜ SÔNG TP. HỒ CHÍ MINH (TÂY / NAM):
      - Sông Sài Gòn uốn cong mềm mại dọc rìa Tây – Tây Nam từ [-3.8, -1.2] tới [-1.2, -3.8].
      - Tháp Bitexco Búp Sen tại [-2.4, -0.6, 0] sát đường dạo bộ bờ sông, sân trực thăng nhìn ra mặt nước.
      - Cầu dây văng Ba Son tại [-2.2, -3.2, 0] bắc ngang sông Sài Gòn.
      - Nhà thờ Đức Bà Sài Gòn tại [-1.8, 1.4, 0] giữa Công viên 30/4 rợp bóng cây.
  • KHU DI SẢN HÀ NỘI (BẮC / ĐÔNG):
      - Hồ Hoàn Kiếm ngọc lam tại [1.8, 2.0, 0] với Đảo Ngọc, Tháp Rùa 3 tầng, Cầu Thê Húc đỏ son và liễu rủ.
      - Nhà Hát Lớn Hà Nội tại [2.6, -0.6, 0] hướng ra Quảng trường Cách Mạng Tháng Tám lát đá hoa cương rộng lớn.
      - Kỳ Đài Thăng Long (Cột Cờ) tại [0.9, -2.8, 0] trong sân vườn thành gạch cổ bốn cổng vòm.
  • TUYẾN METRO TRÊN CAO CHỮ S (Serpentine S-Curve Viaduct):
      - Uốn lượn mềm mại từ gần Cầu Ba Son, ôm quanh Vòng xuyến trung tâm, lướt qua Quảng trường Nhà Hát Lớn,
        uốn chữ S qua sườn Tây Hồ Hoàn Kiếm và vòng phía sau lưng hồ khép kín.
"""

import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy  # noqa: E402

from vtcoon_tabletop.core import (BLEND_SAVE_PATH, GLB_EXPORT_PATH, RENDER_VERIFY_PATH, ClearanceMap,  # noqa: E402
                                  ensure_collection)
from vtcoon_tabletop.foundation import (build_bason_bridge, build_board_chassis, build_dong_son_drum,  # noqa: E402
                                        build_static_dice, build_terrain_and_river)
from vtcoon_tabletop.hanoi import build_hoan_kiem_quarter  # noqa: E402
from vtcoon_tabletop.hanoi_monuments import build_hanoi_civic_quarter  # noqa: E402
from vtcoon_tabletop.materials import build_material_palette  # noqa: E402
from vtcoon_tabletop.metro import build_metro  # noqa: E402
from vtcoon_tabletop.saigon_waterfront import build_saigon_quarter  # noqa: E402
from vtcoon_tabletop.studio import (DIORAMA_COLLECTION, export_glb, render_still,  # noqa: E402
                                    setup_camera_and_lighting, setup_world_and_render)

GLB_BUDGET_MB = 2.0
FORBIDDEN_TOKENS = ("shophouse", "villa", "townhouse", "residential", "nhapho", "nha_ong")


def parse_flags() -> set[str]:
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    return {a for a in argv if a.startswith("--")}


def validate_master_plan(coll_hanoi, coll_saigon, coll_master) -> None:
    """Kiểm chứng quy hoạch 6 công trình biểu tượng, trần cao Bitexco <= 3.15m, công trình khác <= 1.80m, tổng tam giác <= 40,000."""
    bpy.context.view_layer.update()
    violations = []
    for obj in bpy.data.objects:
        if any(tok in obj.name.lower() for tok in FORBIDDEN_TOKENS):
            violations.append(f"Forbidden generic housing object: {obj.name}")

    mesh_objs = [o for o in coll_master.all_objects if o.type == "MESH"]
    total_tris = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in mesh_objs)
    khue_van_tris = sum(
        sum(len(p.vertices) - 2 for p in o.data.polygons)
        for o in mesh_objs
        if o.name.startswith("GEO_HN_KhueVanCac")
    )
    if khue_van_tris > 4000:
        violations.append(f"GEO_HN_KhueVanCac cluster polycount {khue_van_tris} > 4,000 triangles limit")
    max_z = 0.0
    max_other_z = 0.0
    khue_van_max_z = 0.0
    for o in mesh_objs:
        obj_max_z = max((o.matrix_world @ v.co).z for v in o.data.vertices)
        max_z = max(max_z, obj_max_z)
        if o.name.startswith("GEO_HN_KhueVanCac"):
            khue_van_max_z = max(khue_van_max_z, obj_max_z)
        if "Bitexco" in o.name:
            if obj_max_z > 3.15:
                violations.append(f"{o.name} exceeds Bitexco height limit 3.15m (Z = {obj_max_z:.3f}m)")
        else:
            max_other_z = max(max_other_z, obj_max_z)
            if obj_max_z > 1.80:
                violations.append(f"{o.name} exceeds other-buildings height limit 1.80m (Z = {obj_max_z:.3f}m)")
    if not (1.20 <= khue_van_max_z <= 1.50):
        violations.append(f"Khue Van Cac peak Z = {khue_van_max_z:.3f}m must be within [1.20m, 1.50m]")

        # Kiểm chứng vùng ném xúc xắc trung tâm R = 1.55m hoàn toàn thông thoáng ở độ cao Z > 0.16m
        if not o.name.startswith("GEO_DongSon_Drum"):
            for v in o.data.vertices:
                wv = o.matrix_world @ v.co
                if wv.z > 0.16 and math.hypot(wv.x, wv.y) < 1.55:
                    violations.append(f"{o.name} intrudes into central dice arena R=1.55m at ({wv.x:.2f}, {wv.y:.2f}, {wv.z:.2f})")
                    break

    if total_tris > 40000:
        for o in sorted(mesh_objs, key=lambda x: sum(len(p.vertices) - 2 for p in x.data.polygons), reverse=True)[:25]:
            t_cnt = sum(len(p.vertices) - 2 for p in o.data.polygons)
            print(f"  [POLY_BREAKDOWN] {o.name}: {t_cnt} tris")
        violations.append(f"Total scene polycount {total_tris} > 40,000 triangles limit")

    if violations:
        raise RuntimeError("Master plan validation failed:\n  " + "\n  ".join(violations))
    print(f"[VTCOON-STUDIO] Master plan OK: Hanoi {len(coll_hanoi.all_objects)} objects, "
          f"Saigon {len(coll_saigon.all_objects)} objects, "
          f"KhueVanCac Tris = {khue_van_tris} (<= 4,000), KhueVanCac Peak Z = {khue_van_max_z:.3f}m ([1.20, 1.50]), "
          f"Total Tris = {total_tris} (<= 40,000), Bitexco Peak Z = {max_z:.3f}m (<= 3.15m), "
          f"Other Peak Z = {max_other_z:.3f}m (<= 1.80m).")


def build_and_verify_tabletop_studio() -> None:
    flags = parse_flags()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene

    coll_studio = ensure_collection("01_Studio_Camera_And_Lighting")
    coll_chassis = ensure_collection("02_Board_Chassis_18m")
    coll_master = ensure_collection(DIORAMA_COLLECTION)
    coll_center = ensure_collection("03A_Center_DongSon_River_Metro", coll_master)
    coll_hanoi = ensure_collection("03B_Hanoi_East_Heritage", coll_master)
    coll_saigon = ensure_collection("03C_Saigon_West_Metropolis", coll_master)
    coll_dice = ensure_collection("04_Static_Dice_Reference")

    mats = build_material_palette()
    setup_world_and_render(scene)
    setup_camera_and_lighting(scene, coll_studio)

    build_board_chassis(coll_chassis, mats)
    build_terrain_and_river(coll_center, mats)
    build_bason_bridge(coll_center, mats)
    build_dong_son_drum(coll_center, mats)
    build_static_dice(coll_dice, mats)
    metro_pts = build_metro(coll_center, mats)

    hanoi_clear = ClearanceMap()
    hanoi_clear.add_path(metro_pts, 0.32)
    hanoi_clear.add_circle(0.0, 0.0, 2.25)
    hanoi_clear.add_circle(-2.20, -3.20, 1.35)
    build_hoan_kiem_quarter(coll_hanoi, mats, hanoi_clear)
    build_hanoi_civic_quarter(coll_hanoi, mats, hanoi_clear)

    saigon_clear = ClearanceMap()
    saigon_clear.add_path(metro_pts, 0.32)
    saigon_clear.add_circle(0.0, 0.0, 2.25)
    saigon_clear.add_circle(-2.20, -3.20, 1.35)
    saigon_clear.add_circle(0.90, -2.90, 1.25)
    build_saigon_quarter(coll_saigon, mats, saigon_clear)

    validate_master_plan(coll_hanoi, coll_saigon, coll_master)

    bpy.ops.wm.save_as_mainfile(filepath=BLEND_SAVE_PATH)
    print(f"[VTCOON-STUDIO] Saved: {BLEND_SAVE_PATH}")

    if "--skip-export" not in flags:
        size_mb = export_glb(GLB_EXPORT_PATH)
        if size_mb > GLB_BUDGET_MB:
            raise RuntimeError(f"GLB budget exceeded: {size_mb:.2f} MB > {GLB_BUDGET_MB} MB")
    if "--skip-render" not in flags:
        render_still(scene, RENDER_VERIFY_PATH)


if __name__ == "__main__":
    build_and_verify_tabletop_studio()
