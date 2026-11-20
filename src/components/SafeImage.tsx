import { useState } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
}

export function SafeImage({ src, alt, className = '', loading = 'lazy' }: SafeImageProps) {
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

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
