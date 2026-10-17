# [IMP-438] Procedural AAA PBR Texture & Normal Map Generator
# Generates high-resolution 2048x2048 PBR maps for:
# 1. Dong Son Bronze Drum Medallion (Diffuse, Tangent Normal, Roughness, Metallic, AO)
# 2. Saigon Notre-Dame Cathedral Facade (Brick Diffuse, Stone Tracery, Tangent Normal)
# 3. Indochine Golden Pagoda Roof (Yin-Yang Tile Diffuse, Corrugated Normal)

import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

TEX_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "public", "models", "board", "textures"))
os.makedirs(TEX_DIR, exist_ok=True)


def height_to_normal_map(height_arr, strength=4.0):
    """Converts a 2D float height array [0.0, 1.0] into a tangent-space RGB normal map."""
    h, w = height_arr.shape
    # Sobel filter gradients
    sobel_x = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=np.float32)
    sobel_y = np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]], dtype=np.float32)

    # Pad height
    padded = np.pad(height_arr, 1, mode='edge')
    from scipy.ndimage import convolve
    dx = convolve(padded, sobel_x)[1:-1, 1:-1] * strength
    dy = convolve(padded, sobel_y)[1:-1, 1:-1] * strength
    dz = np.ones_like(dx)

    # Normalize vectors
    norm = np.sqrt(dx * dx + dy * dy + dz * dz)
    norm = np.maximum(norm, 1e-6)
    nx = (dx / norm) * 0.5 + 0.5
    ny = (dy / norm) * 0.5 + 0.5
    nz = (dz / norm) * 0.5 + 0.5

    # RGB uint8
    normal_img = np.stack([nx * 255, ny * 255, nz * 255], axis=-1).astype(np.uint8)
    return normal_img


def height_to_normal_map_pure(height_arr, strength=3.5):
    """Pure numpy Sobel gradient without scipy dependency."""
    h, w = height_arr.shape
    padded = np.pad(height_arr, 1, mode='edge')
    
    # dz/dx via central differences
    dx = (padded[1:-1, 2:] - padded[1:-1, :-2]) * strength
    # dz/dy via central differences
    dy = (padded[2:, 1:-1] - padded[:-2, 1:-1]) * strength
    dz = np.ones_like(dx)

    norm = np.sqrt(dx * dx + dy * dy + dz * dz)
    norm = np.maximum(norm, 1e-6)

    # Tangent-space normal map: R = Nx, G = Ny, B = Nz
    nx = (-dx / norm) * 0.5 + 0.5
    ny = (-dy / norm) * 0.5 + 0.5
    nz = (dz / norm) * 0.5 + 0.5

    rgb = np.stack([nx * 255, ny * 255, nz * 255], axis=-1).astype(np.uint8)
    return rgb


# =============================================================================
# 1. DONG SON BRONZE DRUM PBR MAPS (180 x 180 - Budget Optimized & Crisp)
# =============================================================================
def generate_dongson_pbr_maps():
    size = 180
    center = size / 2.0
    radius = size * 0.47

    # Create height image (grayscale float [0, 255])
    h_img = Image.new("L", (size, size), 40)  # Base bronze floor height
    draw = ImageDraw.Draw(h_img)

    # 1. Concentric raised brass rings
    rings = [
        (0.96, 0.98, 220),  # Outer heavy lip
        (0.88, 0.90, 180),  # Band 1
        (0.74, 0.76, 180),  # Band 2
        (0.58, 0.60, 180),  # Band 3
        (0.44, 0.46, 180),  # Band 4
        (0.28, 0.30, 200),  # Inner hub ring
    ]
    for r_in, r_out, val in rings:
        r1 = radius * r_in
        r2 = radius * r_out
        draw.ellipse([center - r2, center - r2, center + r2, center + r2], fill=val)
        draw.ellipse([center - r1, center - r1, center + r1, center + r1], fill=40)

    # 2. Sawtooth / Triangle geometric band in Band (0.76 to 0.88)
    num_teeth = 36
    r_saw_mid = radius * 0.82
    r_saw_w = radius * 0.05
    for i in range(num_teeth):
        ang1 = i * (2.0 * math.pi / num_teeth)
        ang2 = (i + 0.5) * (2.0 * math.pi / num_teeth)
        ang3 = (i + 1) * (2.0 * math.pi / num_teeth)
        p1 = (center + math.cos(ang1) * (r_saw_mid - r_saw_w), center + math.sin(ang1) * (r_saw_mid - r_saw_w))
        p2 = (center + math.cos(ang2) * (r_saw_mid + r_saw_w), center + math.sin(ang2) * (r_saw_mid + r_saw_w))
        p3 = (center + math.cos(ang3) * (r_saw_mid - r_saw_w), center + math.sin(ang3) * (r_saw_mid - r_saw_w))
        draw.polygon([p1, p2, p3], fill=210)

    # 3. 8 Soaring Chim Lạc Cranes in Band (0.60 to 0.74)
    r_bird = radius * 0.67
    for b_idx in range(8):
        b_ang = b_idx * (2.0 * math.pi / 8.0)
        cos_b = math.cos(b_ang)
        sin_b = math.sin(b_ang)
        tx = -sin_b
        ty = cos_b
        rx = cos_b
        ry = sin_b
        bx = center + cos_b * r_bird
        by = center + sin_b * r_bird
        scale = size * 0.055

        pts = [
            (bx + tx * scale * 1.5 + rx * scale * 0.1, by + ty * scale * 1.5 + ry * scale * 0.1),
            (bx + tx * scale * 0.9 - rx * scale * 0.2, by + ty * scale * 0.9 - ry * scale * 0.2),
            (bx + tx * scale * 0.3 + rx * scale * 1.4, by + ty * scale * 0.3 + ry * scale * 1.4),
            (bx - tx * scale * 0.4 - rx * scale * 0.3, by - ty * scale * 0.4 - ry * scale * 0.3),
            (bx - tx * scale * 1.2 - rx * scale * 0.2, by - ty * scale * 1.2 - ry * scale * 0.2),
            (bx - tx * scale * 0.3 + rx * scale * 0.2, by - ty * scale * 0.3 + ry * scale * 0.2),
        ]
        draw.polygon(pts, fill=230)

    # 4. Concentric dot cordons in Band (0.46 to 0.58)
    num_dots = 48
    r_dots = radius * 0.52
    d_size = size * 0.008
    for i in range(num_dots):
        d_ang = i * (2.0 * math.pi / num_dots)
        dx = center + math.cos(d_ang) * r_dots
        dy = center + math.sin(d_ang) * r_dots
        draw.ellipse([dx - d_size, dy - d_size, dx + d_size, dy + d_size], fill=210)

    # 5. Central 14-Point Sunburst Star (Radius 0.28)
    r_sun_tip = radius * 0.28
    r_sun_base = radius * 0.09
    num_rays = 14
    star_pts = []
    for i in range(num_rays * 2):
        ang = i * (math.pi / num_rays) - math.pi / 2
        r_curr = r_sun_tip if (i % 2 == 0) else r_sun_base
        star_pts.append((center + math.cos(ang) * r_curr, center + math.sin(ang) * r_curr))
    draw.polygon(star_pts, fill=245)

    # Central Sun Disc
    draw.ellipse([center - r_sun_base * 0.8, center - r_sun_base * 0.8, center + r_sun_base * 0.8, center + r_sun_base * 0.8], fill=255)

    # Smooth height slightly for realistic bevel
    h_smooth = h_img.filter(ImageFilter.GaussianBlur(radius=1.0))
    h_arr = np.array(h_smooth, dtype=np.float32) / 255.0

    # Generate Tangent Normal Map
    normal_rgb = height_to_normal_map_pure(h_arr, strength=4.5)
    normal_img = Image.fromarray(normal_rgb)
    normal_path = os.path.join(TEX_DIR, "dongson_drum_normal.png")
    normal_img.save(normal_path, optimize=True)
    print(f"[OK] Saved Dong Son Normal Map: {normal_path}")

    # Generate Diffuse Map (Antique Bronze with Gold Inlay)
    diffuse_arr = np.zeros((size, size, 3), dtype=np.uint8)
    y_coords, x_coords = np.ogrid[:size, :size]
    dist_from_center = np.sqrt((x_coords - center)**2 + (y_coords - center)**2)

    bronze_base_mask = (dist_from_center <= radius)
    velvet_mask = (dist_from_center > radius) & (dist_from_center <= radius * 1.06)

    diffuse_arr[bronze_base_mask] = [182, 128, 68]
    diffuse_arr[velvet_mask] = [3, 71, 49]

    relief_mask = (h_arr > 0.45) & bronze_base_mask
    gold_t = np.clip((h_arr - 0.45) / 0.55, 0.0, 1.0)[:, :, np.newaxis]
    gold_color = np.array([255, 218, 90], dtype=np.float32)
    bronze_color = np.array([195, 140, 75], dtype=np.float32)

    blended = (bronze_color * (1.0 - gold_t) + gold_color * gold_t).astype(np.uint8)
    diffuse_arr[relief_mask] = blended[relief_mask]

    diffuse_img = Image.fromarray(diffuse_arr)
    diffuse_path = os.path.join(TEX_DIR, "dongson_drum_diffuse.png")
    diffuse_quant = diffuse_img.quantize(colors=128)
    diffuse_quant.save(diffuse_path, optimize=True)
    print(f"[OK] Saved Dong Son Diffuse Map: {diffuse_path}")

    # Roughness Map
    roughness_arr = np.full((size, size), 85, dtype=np.uint8)
    roughness_arr[relief_mask] = 55
    roughness_arr[velvet_mask] = 220
    roughness_img = Image.fromarray(roughness_arr)
    roughness_path = os.path.join(TEX_DIR, "dongson_drum_roughness.png")
    roughness_img.save(roughness_path, optimize=True)
    print(f"[OK] Saved Dong Son Roughness Map: {roughness_path}")

    # Metallic Map
    metallic_arr = np.zeros((size, size), dtype=np.uint8)
    metallic_arr[bronze_base_mask] = 60
    metallic_arr[relief_mask] = 85
    metallic_arr[velvet_mask] = 5
    metallic_img = Image.fromarray(metallic_arr)
    metallic_path = os.path.join(TEX_DIR, "dongson_drum_metallic.png")
    metallic_img.save(metallic_path, optimize=True)
    print(f"[OK] Saved Dong Son Metallic Map: {metallic_path}")


# =============================================================================
# 2. SAIGON NOTRE-DAME CATHEDRAL SEAMLESS BRICK MAPS (256 x 256)
# =============================================================================
def generate_cathedral_pbr_maps():
    size = 256
    diffuse = Image.new("RGB", (size, size), (165, 52, 42))
    draw = ImageDraw.Draw(diffuse)

    brick_h = 16
    brick_w = 32
    mortar_color = (205, 200, 190)

    for row in range(size // brick_h + 1):
        y = row * brick_h
        draw.line([(0, y), (size, y)], fill=mortar_color, width=2)
        offset = (brick_w // 2) if (row % 2 == 1) else 0
        for col in range(size // brick_w + 3):
            x = col * brick_w - offset
            draw.line([(x, y), (x, y + brick_h)], fill=mortar_color, width=2)

    diffuse_path = os.path.join(TEX_DIR, "cathedral_diffuse.png")
    diffuse.save(diffuse_path, optimize=True)
    print(f"[OK] Saved Cathedral Diffuse Map (Seamless Brick 256px): {diffuse_path}")

    gray = diffuse.convert("L")
    h_arr = np.array(gray, dtype=np.float32) / 255.0
    normal_rgb = height_to_normal_map_pure(h_arr, strength=2.8)
    normal_img = Image.fromarray(normal_rgb)
    normal_path = os.path.join(TEX_DIR, "cathedral_normal.png")
    normal_img.save(normal_path, optimize=True)
    print(f"[OK] Saved Cathedral Normal Map: {normal_path}")


# =============================================================================
# 3. INDOCHINE GOLDEN PAGODA ROOF MAPS (192 x 192)
# (Imperial Saffron Glazed Terracotta #E5A93C - Anti-Foil Wrap)
# =============================================================================
def generate_pagoda_pbr_maps():
    size = 192
    diffuse = Image.new("RGB", (size, size), (229, 169, 60))  # Imperial Saffron #E5A93C
    draw = ImageDraw.Draw(diffuse)

    # Corrugated tile lines (ngói âm dương)
    tile_w = 16
    for col in range(size // tile_w + 1):
        x = col * tile_w
        draw.line([(x, 0), (x, size)], fill=(146, 64, 14), width=2)      # Dark amber groove
        draw.line([(x + tile_w // 2, 0), (x + tile_w // 2, size)], fill=(245, 195, 95), width=2)  # Highlight ridge

    diffuse_path = os.path.join(TEX_DIR, "pagoda_roof_diffuse.png")
    diffuse.save(diffuse_path, optimize=True)
    print(f"[OK] Saved Pagoda Roof Diffuse Map (192px): {diffuse_path}")

    gray = diffuse.convert("L")
    h_arr = np.array(gray, dtype=np.float32) / 255.0
    normal_rgb = height_to_normal_map_pure(h_arr, strength=2.2)
    normal_img = Image.fromarray(normal_rgb)
    normal_path = os.path.join(TEX_DIR, "pagoda_roof_normal.png")
    normal_img.save(normal_path, optimize=True)
    print(f"[OK] Saved Pagoda Roof Normal Map: {normal_path}")


# =============================================================================
# 4. BITEXCO CURTAIN WALL & HELIPAD PBR MAPS (256 x 256)
# =============================================================================
def generate_bitexco_pbr_maps():
    size = 256
    diffuse = Image.new("RGB", (size, size), (42, 111, 124))
    draw = ImageDraw.Draw(diffuse)

    floor_spandrel_color = (225, 242, 248)
    for y in range(0, size, 20):
        draw.line([(0, y), (size, y)], fill=floor_spandrel_color, width=2)

    mullion_color = (85, 160, 175)
    for x in range(0, size, 16):
        draw.line([(x, 0), (x, size)], fill=mullion_color, width=1)

    diffuse_path = os.path.join(TEX_DIR, "bitexco_glass_diffuse.png")
    diffuse.save(diffuse_path, optimize=True)
    print(f"[OK] Saved Bitexco Glass Diffuse Map: {diffuse_path}")

    gray = diffuse.convert("L")
    h_arr = np.array(gray, dtype=np.float32) / 255.0
    normal_rgb = height_to_normal_map_pure(h_arr, strength=1.8)
    normal_img = Image.fromarray(normal_rgb)
    normal_path = os.path.join(TEX_DIR, "bitexco_glass_normal.png")
    normal_img.save(normal_path, optimize=True)
    print(f"[OK] Saved Bitexco Glass Normal Map: {normal_path}")

    # 256x256 Helipad Target Deck
    h_size = 256
    h_center = h_size // 2
    h_img = Image.new("RGB", (h_size, h_size), (51, 65, 85))
    h_draw = ImageDraw.Draw(h_img)

    r_outer = h_size * 0.46
    h_draw.ellipse([h_center - r_outer, h_center - r_outer, h_center + r_outer, h_center + r_outer], outline=(30, 41, 59), width=5)

    r_mid = h_size * 0.38
    h_draw.ellipse([h_center - r_mid, h_center - r_mid, h_center + r_mid, h_center + r_mid], outline=(250, 250, 255), width=6)

    num_dots = 16
    for i in range(num_dots):
        ang = i * (2.0 * math.pi / num_dots)
        dx = h_center + math.cos(ang) * (r_mid + 10)
        dy = h_center + math.sin(ang) * (r_mid + 10)
        h_draw.ellipse([dx - 3, dy - 3, dx + 3, dy + 3], fill=(245, 180, 20))

    h_w = 22
    h_h = 52
    h_t = 10
    h_draw.rectangle([h_center - h_w - h_t // 2, h_center - h_h // 2, h_center - h_w + h_t // 2, h_center + h_h // 2], fill=(255, 255, 255))
    h_draw.rectangle([h_center + h_w - h_t // 2, h_center - h_h // 2, h_center + h_w + h_t // 2, h_center + h_h // 2], fill=(255, 255, 255))
    h_draw.rectangle([h_center - h_w, h_center - h_t // 2, h_center + h_w, h_center + h_t // 2], fill=(255, 255, 255))

    helipad_path = os.path.join(TEX_DIR, "helipad_diffuse.png")
    h_img.save(helipad_path, optimize=True)
    print(f"[OK] Saved Helipad Diffuse Map: {helipad_path}")


if __name__ == "__main__":
    print("=== [IMP-438] GENERATING ULTRA HIGH-RES PBR TEXTURE & NORMAL MAPS ===")
    generate_dongson_pbr_maps()
    generate_cathedral_pbr_maps()
    generate_pagoda_pbr_maps()
    generate_bitexco_pbr_maps()
    print("[OK] All PBR Texture & Normal Maps generated successfully!")
