# -*- coding: utf-8 -*-
"""Studio: world LightPath, render EEVEE Next, camera 1:1 Three.js, đèn 3 điểm, xuất GLB Draco & render."""

import math
import os

import bpy
from mathutils import Euler, Vector

from .core import hex_to_rgba, move_to_collection

DIORAMA_COLLECTION = "03_Diorama_Indochine_Master"


def setup_world_and_render(scene: bpy.types.Scene) -> None:
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.length_unit = "METERS"
    engines = {e.identifier for e in scene.render.bl_rna.properties["engine"].enum_items}
    for candidate in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE", "CYCLES"):
        if candidate in engines:
            scene.render.engine = candidate
            break
    ee = scene.eevee
    ee.taa_render_samples = 64
    for attr, val in (("use_raytracing", True), ("use_shadows", True), ("shadow_ray_count", 2),
                      ("use_gtao", True), ("fast_gi_method", "GLOBAL_ILLUMINATION")):
        if hasattr(ee, attr):
            try:
                setattr(ee, attr, val)
            except TypeError:
                print(f"[VTCOON-STUDIO] EEVEE option {attr} not supported in this build; skipped.")

    scene.render.fps = 30
    scene.frame_start = 1
    scene.frame_end = 300
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 800
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "JPEG"
    scene.render.image_settings.quality = 94
    scene.display_settings.display_device = "sRGB"
    try:
        scene.view_settings.view_transform = "Khronos PBR Neutral"
    except TypeError:
        print("[VTCOON-STUDIO] Khronos PBR Neutral unavailable; falling back to AgX.")
        scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "None"
    scene.view_settings.exposure = -0.10
    print(f"[VTCOON-STUDIO] View transform: {scene.view_settings.view_transform}")

    world = bpy.data.worlds.get("VTCOON_Studio_World") or bpy.data.worlds.new("VTCOON_Studio_World")
    scene.world = world
    if world.node_tree is None:
        world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    mix = nt.nodes.new("ShaderNodeMixShader")
    light_path = nt.nodes.new("ShaderNodeLightPath")
    bg_cam = nt.nodes.new("ShaderNodeBackground")
    bg_env = nt.nodes.new("ShaderNodeBackground")
    bg_cam.inputs["Color"].default_value = hex_to_rgba("#0F172A")
    bg_cam.inputs["Strength"].default_value = 1.0
    bg_env.inputs["Color"].default_value = hex_to_rgba("#FFF1DC")
    bg_env.inputs["Strength"].default_value = 0.80
    # Camera thấy nền studio tối; phản xạ kim loại & GI nhận vòm sáng ấm.
    nt.links.new(light_path.outputs["Is Camera Ray"], mix.inputs["Fac"])
    nt.links.new(bg_env.outputs["Background"], mix.inputs[1])
    nt.links.new(bg_cam.outputs["Background"], mix.inputs[2])
    nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])


def _add_light(coll, name, kind, energy, hex_color, location, look_at, **props):
    data = bpy.data.lights.new(name=name, type=kind)
    data.energy = energy
    data.color = hex_to_rgba(hex_color)[:3]
    for key, val in props.items():
        setattr(data, key, val)
    obj = bpy.data.objects.new(name, data)
    obj.location = location
    direction = Vector(look_at) - Vector(location)
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    move_to_collection(obj, coll)
    return obj


def setup_camera_and_lighting(scene: bpy.types.Scene, coll_studio: bpy.types.Collection) -> None:
    target = bpy.data.objects.new("Camera_Target_Overview", None)
    target.empty_display_type = "PLAIN_AXES"
    target.location = (2.2, -2.2, 0.0)
    move_to_collection(target, coll_studio)

    cam_data = bpy.data.cameras.new("Camera_InGame_View")
    cam_data.sensor_fit = "VERTICAL"
    cam_data.lens_unit = "FOV"
    cam_data.angle = math.radians(24.0)  # Khớp 1:1 Three.js PerspectiveCamera.fov (vertical)
    cam_data.clip_start = 0.5
    cam_data.clip_end = 300.0
    cam = bpy.data.objects.new("Camera_InGame_View", cam_data)
    cam.location = (24.6, -24.6, 25.3)  # = Three.js CAMERA_CONFIG.overview [24.6, 25.3, 24.6]
    track = cam.constraints.new(type="TRACK_TO")
    track.target = target
    track.track_axis = "TRACK_NEGATIVE_Z"
    track.up_axis = "UP_Y"
    move_to_collection(cam, coll_studio)
    scene.camera = cam

    _add_light(coll_studio, "Light_Key_Sun_SW", "SUN", 4.5, "#FFFBEB", (-12.0, -14.0, 18.0), (0.0, 0.0, 0.0),
               angle=math.radians(6.0))
    _add_light(coll_studio, "Light_Fill_Area_NE", "AREA", 350.0, "#E0F2FE", (10.0, 10.0, 9.0), (0.0, 0.0, 0.0),
               shape="RECTANGLE", size=12.0, size_y=8.0)
    _add_light(coll_studio, "Light_Rim_Spot_North", "SPOT", 750.0, "#F8FAFC", (0.0, 12.0, 10.0), (0.0, 0.0, 0.5),
               spot_size=math.radians(85.0), spot_blend=0.5)


def export_glb(filepath: str) -> float:
    """Xuất duy nhất collection 03_Diorama_Indochine_Master kèm Animation Actions → GLB Draco 6."""
    import json
    import struct

    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    coll = bpy.data.collections[DIORAMA_COLLECTION]
    for obj in bpy.context.scene.objects:
        obj.select_set(False)
    for obj in coll.all_objects:
        obj.select_set(True)
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
        export_animations=True,
        export_animation_mode="ACTIONS",
        export_optimize_animation_size=True,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_draco_position_quantization=14,
        export_draco_normal_quantization=10,
        export_draco_texcoord_quantization=12,
    )
    size_mb = os.path.getsize(filepath) / (1024.0 * 1024.0)
    with open(filepath, "rb") as f:
        raw = f.read()
    json_len = struct.unpack("<I", raw[12:16])[0]
    gltf_json = json.loads(raw[20:20 + json_len].decode("utf-8"))
    exported_actions = [a.get("name") for a in gltf_json.get("animations", [])]
    print(f"[VTCOON-STUDIO] GLB exported: {filepath} ({size_mb * 1024.0:.1f} KB / {size_mb:.2f} MB)")
    print(f"[VTCOON-STUDIO] Exported GLB Animation Actions: {exported_actions}")
    for anim in gltf_json.get("animations", []):
        print(f"  -> Action '{anim.get('name')}': {len(anim.get('channels', []))} channels, "
              f"{len(anim.get('samplers', []))} samplers")
    return size_mb


def render_still(scene: bpy.types.Scene, filepath: str) -> None:
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    scene.frame_set(130)
    scene.render.filepath = filepath
    bpy.ops.render.render(write_still=True)
    print(f"[VTCOON-STUDIO] Verification render (frame {scene.frame_current}): {filepath}")
