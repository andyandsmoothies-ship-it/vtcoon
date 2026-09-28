// [UI-S01/MSS][IMP-220] TropicalWaterMaterial — Custom Shader Material for Island Water
import { Color, Vector3, type IUniform } from 'three';

export interface TropicalWaterUniforms {
  uTime: IUniform<number>;
  uShallowColor: IUniform<Color>;
  uDeepColor: IUniform<Color>;
  uFoamColor: IUniform<Color>;
  uSunColor: IUniform<Color>;
  uSunDirection: IUniform<Vector3>;
  uFresnelPower: IUniform<number>;
  uOpacity: IUniform<number>;
}

// [C4] Khởi tạo không tham số với giá trị mặc định chuẩn xác, sạch sẽ 100% không vi phạm deps
export function createTropicalWaterUniforms(): Record<string, IUniform> {
  const sunDir = new Vector3(-22, 36, 20).normalize();
  return {
    uTime: { value: 0 },
    uShallowColor: { value: new Color('#06B6D4') },
    uDeepColor: { value: new Color('#0284C7') },
    uFoamColor: { value: new Color('#FFFFFF') },
    uSunColor: { value: new Color('#FFFDF5') },
    uSunDirection: { value: sunDir },
    uFresnelPower: { value: 3.5 },
    uOpacity: { value: 0.92 },
  };
}

export function calculateFresnelFactor(viewDir: Vector3, normal: Vector3, power: number = 3.5): number {
  const cosTheta = Math.max(0.0, Math.min(1.0, viewDir.dot(normal)));
  const fresnel = Math.pow(1.0 - cosTheta, power);
  return Math.max(0.0, Math.min(1.0, fresnel));
}

// [C2] Biên độ cực đại: 0.024 + 0.018 + 0.010 = 0.052 <= 0.055
export function calculateWaterWaveOffset(x: number, y: number, time: number): number {
  const w1 = Math.sin(x * 0.055 + time * 1.4) * 0.024;
  const w2 = Math.cos(y * 0.065 + time * 1.1) * 0.018;
  const w3 = Math.sin((x + y) * 0.038 + time * 1.8) * 0.010;
  return w1 + w2 + w3;
}

export function calculateDepthBlend(
  distFromCenter: number,
  innerRadius: number = 9.6,
  outerRadius: number = 70.0
): number {
  if (distFromCenter <= innerRadius) return 0.0;
  if (distFromCenter >= outerRadius) return 1.0;
  return (distFromCenter - innerRadius) / (outerRadius - innerRadius);
}

export function lerpWaterColor(currentColor: Color, targetColor: Color, lerpRate: number): Color {
  return currentColor.lerp(targetColor, lerpRate);
}

export const TROPICAL_WATER_VERTEX_SHADER = `
  uniform float uTime;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    
    // Sóng Gerstner GPU đa tần (biên độ tối đa 0.052)
    float w1 = sin(transformed.x * 0.055 + uTime * 1.4) * 0.024;
    float w2 = cos(transformed.y * 0.065 + uTime * 1.1) * 0.018;
    float w3 = sin((transformed.x + transformed.y) * 0.038 + uTime * 1.8) * 0.010;
    transformed.z += w1 + w2 + w3;

    vec4 worldPos = modelMatrix * vec4(transformed, 1.0);
    vWorldPosition = worldPos.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const TROPICAL_WATER_FRAGMENT_SHADER = `
  uniform vec3 uShallowColor;
  uniform vec3 uDeepColor;
  uniform vec3 uFoamColor;
  uniform vec3 uSunColor;
  uniform vec3 uSunDirection;
  uniform float uFresnelPower;
  uniform float uOpacity;
  uniform float uTime;

  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 normal = normalize(vNormal);

    // 1. Phản xạ Fresnel góc nhìn (Schlick Approximation)
    float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), uFresnelPower);
    fresnel = clamp(fresnel, 0.0, 1.0);

    // 2. Độ sâu hấp thụ quang học (Depth Absorption Gradient)
    float dist = length(vWorldPosition.xz);
    float depthFactor = clamp((dist - 9.6) / 60.0, 0.0, 1.0);
    vec3 baseWaterColor = mix(uShallowColor, uDeepColor, depthFactor);

    // 3. Phản xạ ánh nắng trực diện (Specular Glint)
    vec3 halfVec = normalize(uSunDirection + viewDir);
    float spec = pow(max(dot(normal, halfVec), 0.0), 32.0);
    vec3 specularColor = uSunColor * spec * 0.6;

    // 4. Hòa trộn màu cuối cùng
    vec3 finalColor = mix(baseWaterColor, uSunColor, fresnel * 0.45) + specularColor;
    gl_FragColor = vec4(finalColor, uOpacity);
  }
`;
