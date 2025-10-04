import React from 'react';
import './LoadingSkeleton.css';

interface LoadingSkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = '1rem',
  borderRadius = '4px',
  className = '',
  variant = 'rectangular'
}) => {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: variant === 'circular' ? '50%' : (typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius)
  };

  return (
    <div
      className={`loading-skeleton ${variant} ${className}`}
      style={style}
      role="presentation"
      aria-hidden="true"
    />
  );
};

interface SongCardSkeletonProps {
  layout?: 'grid' | 'list';
}

export const SongCardSkeleton: React.FC<SongCardSkeletonProps> = ({ layout = 'list' }) => {
  if (layout === 'grid') {
    return (
      <div className="song-card-skeleton grid" role="presentation" aria-hidden="true">
        <LoadingSkeleton variant="rectangular" height={120} borderRadius="8px" />
        <div className="skeleton-text">
          <LoadingSkeleton width="80%" height={16} />
          <LoadingSkeleton width="60%" height={14} />
        </div>
      </div>
    );
  }

  return (
    <div className="song-card-skeleton list" role="presentation" aria-hidden="true">
      <LoadingSkeleton variant="circular" width={48} height={48} />
      <div className="skeleton-content">
        <LoadingSkeleton width="70%" height={18} />
        <LoadingSkeleton width="50%" height={14} />
      </div>
    </div>
  );
};

interface SongListSkeletonProps {
  count?: number;
  layout?: 'grid' | 'list';
}

export const SongListSkeleton: React.FC<SongListSkeletonProps> = ({
  count = 5,
  layout = 'list'
}) => {
  return (
    <div className={`song-list-skeleton ${layout}`} role="presentation" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <SongCardSkeleton key={index} layout={layout} />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
