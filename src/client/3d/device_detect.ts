// [IMP-186] Device & Hardware detection for Mobile LOD, Jetsam Defense & Touch Optimization

export interface TileTextureBudget {
  readonly width: number;
  readonly height: number;
  readonly cornerSize: number;
  readonly scale: number;
  readonly anisotropy: number;
}

export function isTouchDevice(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1;
}

export function isIPadOS(): boolean {
  return typeof navigator !== 'undefined' && /Macintosh/.test(navigator.userAgent || '') && isTouchDevice();
}

export function isIOSDevice(): boolean {
  return typeof navigator !== 'undefined' && (/iPhone|iPad|iPod/.test(navigator.userAgent || '') || isIPadOS());
}

export function isMobileHardware(): boolean {
  return typeof navigator !== 'undefined' && (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '') || isIPadOS());
}

export function isTabletDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (isIPadOS()) return true;
  if (/Android/i.test(ua) && !/Mobile/i.test(ua)) return true;
  const hasBigTouchScreen = isTouchDevice() && typeof window !== 'undefined' && typeof window.innerWidth === 'number' && window.innerWidth >= 768;
  return hasBigTouchScreen && !/iPhone|iPod|Mobile/i.test(ua);
}

export function isPhoneHardware(): boolean {
  return isMobileHardware() && !isTabletDevice();
}

export function isSmallViewport(): boolean {
  return typeof window !== 'undefined' && typeof window.innerWidth === 'number' && window.innerWidth < 768;
}

export function isMobileDevice(): boolean {
  return isMobileHardware() || isSmallViewport();
}

export function getRecommendedDpr(isMobile: boolean): number | [number, number] {
  return isMobile ? 1 : [1, 1.5];
}

export function getTileTextureBudget(isMobile: boolean, isTablet = isTabletDevice()): TileTextureBudget {
  return isMobile && !isTablet
    ? { width: 512, height: 680, cornerSize: 512, scale: 2, anisotropy: 2 }
    : { width: 1024, height: 1360, cornerSize: 1024, scale: 4, anisotropy: 16 };
}

