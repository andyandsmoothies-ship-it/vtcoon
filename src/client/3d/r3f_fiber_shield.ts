import * as THREE from 'three';

/**
 * R3F Fiber Prop Shield:
 * Prevents React Three Fiber reconciler from attempting to pierce dashed props
 * (e.g. 'data-model-url', 'data-testid', 'data-mascot-icon', 'aria-*') into non-object properties.
 *
 * In R3F, if `key in root` is false, it attempts to pierce dashed keys by splitting on '-'.
 * When the first segment ('data') is set to a primitive string on initial render or update,
 * subsequent updates attempt to pierce into that primitive string and throw:
 * "R3F: Cannot set '<prop>'. Ensure it is an object before setting '<subprop>'."
 *
 * By intercepting property resolution on THREE.Object3D prototype so that `data-*` and `aria-*`
 * properties return true for the `in` operator, Fiber performs direct assignment `root[key] = value`
 * without splitting or piercing.
 */
let isShieldInstalled = false;

export function installR3FFiberShield(): void {
  if (isShieldInstalled) {
    return;
  }

  try {
    const originalProto = Object.getPrototypeOf(THREE.Object3D.prototype);
    const proxyProto = new Proxy(originalProto || Object.prototype, {
      has(target, prop) {
        if (typeof prop === 'string' && (prop.startsWith('data-') || prop.startsWith('aria-'))) {
          return true;
        }
        return prop in target;
      },
    });

    Object.setPrototypeOf(THREE.Object3D.prototype, proxyProto);
    isShieldInstalled = true;
  } catch (err) {
    console.warn('[R3FFiberShield] Failed to install Fiber prototype shield:', err);
  }
}

// Auto-install on import
installR3FFiberShield();
