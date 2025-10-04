import { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  rootMargin?: string;
  threshold?: number;
}

export default function LazyImage({
  src,
  alt,
  className = '',
  placeholder,
  onLoad,
  onError,
  rootMargin = '50px',
  threshold = 0.1
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div ref={containerRef} className={`lazy-image-container ${className}`}>
      {!isInView && placeholder && (
        <div className="lazy-image-placeholder">
          {placeholder}
        </div>
      )}

      {isInView && !hasError && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`lazy-image ${isLoaded ? 'lazy-image--loaded' : 'lazy-image--loading'}`}
          loading="lazy"
        />
      )}

      {hasError && placeholder && (
        <div className="lazy-image-placeholder lazy-image-placeholder--error">
          {placeholder}
        </div>
      )}
    </div>
  );
}
