import React from 'react';

export interface TitleDeedArtShowcaseProps {
  readonly tileAssetUrl: string | null;
  readonly deedName: string;
  readonly ribbonColor: string;
  readonly isRailroad: boolean;
  readonly isUtility: boolean;
  readonly showImage: boolean;
  readonly onImageError?: () => void;
  readonly className?: string;
}

export function TitleDeedArtShowcase({
  tileAssetUrl,
  deedName,
  ribbonColor,
  isRailroad,
  isUtility,
  showImage,
  onImageError,
  className,
}: TitleDeedArtShowcaseProps): React.ReactElement {
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    setIsLoaded(false);
  }, [tileAssetUrl]);

  return (
    <div
      className={`relative rounded-xl bg-[#F7F2E7] border border-slate-300 overflow-hidden flex items-center justify-center p-1.5 sm:p-2 shadow-inner ${
        className ?? 'w-full h-20 sm:h-32'
      }`}
      data-testid="diorama-art-banner"
    >
      {showImage && tileAssetUrl ? (
        <>
          {/* Underlay Shimmer Skeleton khi ảnh đang nạp */}
          <div
            data-testid="art-shimmer-skeleton"
            className={`absolute inset-0 bg-gradient-to-r from-slate-200/40 via-white/60 to-slate-200/40 animate-pulse pointer-events-none transition-opacity duration-300 ${
              isLoaded ? 'opacity-0' : 'opacity-100'
            }`}
            aria-hidden="true"
          />

          <img
            src={tileAssetUrl}
            alt={deedName}
            loading="eager"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              setIsLoaded(true);
              onImageError?.();
            }}
            className="max-h-full max-w-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] z-10 transition-opacity duration-200"
          />
        </>
      ) : (
        <div
          className="w-full h-full rounded-lg flex flex-col items-center justify-center gap-1.5 opacity-90 border border-white/10"
          style={{ backgroundColor: `${ribbonColor}33` }}
          data-testid="diorama-fallback"
        >
          <span className="text-3xl sm:text-4xl drop-shadow-md" aria-hidden="true">
            {isRailroad ? '🚊' : isUtility ? '⚡' : '🏛️'}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
            {isRailroad ? 'Hạ Tầng Giao Thông' : isUtility ? 'Tiện Ích Quốc Gia' : 'Di Sản & Bất Động Sản'}
          </span>
        </div>
      )}
    </div>
  );
}
