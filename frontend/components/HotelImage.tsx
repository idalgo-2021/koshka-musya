import { useState } from "react";
import Image, { ImageProps } from 'next/image';

type HotelImageProps = {
  src?: string;
  alt: string;
  className?: string;
  fallbackIcon?: string;
} & ImageProps;

export default function HotelImage({
  src,
  alt,
  className = "w-full h-full object-cover",
  fallbackIcon = "🏨",
  ...props
}: HotelImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (!src || hasError) {
    return (
      <div className={`${className} bg-accentgreen/10 flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-4xl mb-1">{fallbackIcon}</div>
          <div className="text-accenttext/60 text-xs font-medium">Фото отеля</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`${className} bg-accentgreen/10 flex items-center justify-center absolute inset-0`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accenttext mx-auto mb-2"></div>
            <div className="text-accenttext/60 text-xs font-medium">Загрузка...</div>
          </div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        className={className}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        {...props}
      />
    </div>
  );
}
