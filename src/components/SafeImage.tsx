import { useState } from 'react';

interface ImageAssetMeta {
  webp: string;
  width: number;
  height: number;
}

const OPTIMIZED_IMAGE_MAP: Record<string, ImageAssetMeta> = {
  '/assets/aistudio/image_e26475f0.png': {
    webp: '/assets/optimized/arvind_portrait.webp',
    width: 640,
    height: 640,
  },
  '/assets/images/aws_cloud_infra_1795164482369.jpg': {
    webp: '/assets/optimized/aws_cloud_infra_1795164482369.webp',
    width: 1080,
    height: 806,
  },
  '/assets/images/cisco_network_lab_1795164486189.jpg': {
    webp: '/assets/optimized/cisco_network_lab_1795164486189.webp',
    width: 1080,
    height: 806,
  },
  '/assets/images/corporate_it_workshop_1795164484663.jpg': {
    webp: '/assets/optimized/corporate_it_workshop_1795164484663.webp',
    width: 1080,
    height: 806,
  },
  '/assets/images/hands_on_troubleshooting_1795164485759.jpg': {
    webp: '/assets/optimized/hands_on_troubleshooting_1795164485759.webp',
    width: 1080,
    height: 806,
  },
  '/assets/images/infra_workspace_vertical_1795164486330.jpg': {
    webp: '/assets/optimized/infra_workspace_vertical_1795164486330.webp',
    width: 806,
    height: 1080,
  },
  '/assets/images/linux_rhel_lab_1795164484674.jpg': {
    webp: '/assets/optimized/linux_rhel_lab_1795164484674.webp',
    width: 1080,
    height: 806,
  },
  '/assets/students/chetana_sonawane.jpg': {
    webp: '/assets/optimized/chetana_sonawane.webp',
    width: 256,
    height: 256,
  },
  '/assets/students/kalyani_bachhav.jpg': {
    webp: '/assets/optimized/kalyani_bachhav.webp',
    width: 256,
    height: 256,
  },
  '/assets/students/tejas_thakur.jpg': {
    webp: '/assets/optimized/tejas_thakur.webp',
    width: 256,
    height: 256,
  },
};

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
  variant?: 'default' | 'avatar';
  width?: number;
  height?: number;
}

export function SafeImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
  fetchPriority,
  variant = 'default',
  width,
  height,
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-gradient-to-br from-[#F0F0F2] to-[#E2E2E8] dark:from-[#2C2C2D] dark:to-[#1F1F21] text-xs font-medium text-[#5C5C5C] dark:text-[#A3A3A3] ${className}`}
      >
        <span className="px-3 text-center">{alt}</span>
      </div>
    );
  }

  const avatarOverride =
    variant === 'avatar' && src === '/assets/aistudio/image_e26475f0.png'
      ? { webp: '/assets/optimized/arvind_avatar.webp', width: 128, height: 128 }
      : undefined;

  const meta = avatarOverride ?? OPTIMIZED_IMAGE_MAP[src];
  const resolvedWidth = width ?? meta?.width;
  const resolvedHeight = height ?? meta?.height;
  const decoding = fetchPriority === 'high' ? 'sync' : 'async';

  const imgEl = (
    <img
      src={src}
      alt={alt}
      width={resolvedWidth}
      height={resolvedHeight}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );

  if (!meta) {
    return imgEl;
  }

  return (
    <picture className="block w-full h-full">
      <source srcSet={meta.webp} type="image/webp" />
      {imgEl}
    </picture>
  );
}
