import { useState, useRef, memo } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Song } from '../types';

interface SongCardProps {
  song: Song;
  onPlay: (song: Song) => void;
  onAddToQueue?: (song: Song) => void;
  onEdit?: (song: Song) => void;
  onDelete?: (songId: number) => void;
  onViewLyrics?: (song: Song) => void;
  onPlaySecondary?: (song: Song) => void;
  showArtwork?: boolean;
  layout?: 'list' | 'grid' | 'compact';
}

const SongCard = memo(function SongCard({
  song,
  onPlay,
  onAddToQueue,
  onEdit,
  onDelete,
  onViewLyrics,
  onPlaySecondary,
  showArtwork = true,
  layout = 'list'
}: SongCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const getArtistName = (song: Song) => {
    return typeof song.artist === 'string' ? song.artist : (song.artist as any)?.name || 'Unknown Artist';
  };

  const handlePlay = () => {
    onPlay(song);
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToQueue?.(song);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(song);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(song.id);
  };

  const handleViewLyrics = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewLyrics?.(song);
  };

  const handlePlaySecondary = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (song.secondary_file_path) {
      onPlaySecondary?.({ ...song, file_path: song.secondary_file_path! });
    }
  };

  const handleTouchStart = () => {
    setIsPressed(true);
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  const handleLongPress = () => {
    setShowActions(!showActions);
  };

  const cardClasses = [
    'song-card',
    `song-card--${layout}`,
    isPressed ? 'song-card--pressed' : '',
    showActions ? 'song-card--actions-visible' : ''
  ].filter(Boolean).join(' ');

  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-100, 0, 100],
    ['rgba(239, 68, 68, 0.1)', 'rgba(255, 255, 255, 0)', 'rgba(34, 197, 94, 0.1)']
  );

  const handleDragEnd = (event: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Swipe left for delete (if onDelete exists)
    if (offset < -100 || velocity < -500) {
      if (onDelete) {
        onDelete(song.id);
      }
    }
    // Swipe right for add to queue (if onAddToQueue exists)
    else if (offset > 100 || velocity > 500) {
      if (onAddToQueue) {
        onAddToQueue(song);
      }
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className={cardClasses}
      style={{ x, background }}
      drag="x"
      dragConstraints={{ left: onDelete ? -150 : 0, right: onAddToQueue ? 150 : 0 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      onClick={handlePlay}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => {
        e.preventDefault();
        handleLongPress();
      }}
      role="button"
      tabIndex={0}
      aria-label={`Play ${song.name} by ${getArtistName(song)}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handlePlay();
        }
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Artwork */}
      {showArtwork && (
        <div className="song-card__artwork">
          <div className="song-card__artwork-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 19V6l12-3v13M9 12l12-3M9 16V6l12-3v7" />
              <circle cx="6" cy="19" r="3" />
            </svg>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="song-card__content">
        <div className="song-card__info">
          <h3 className="song-card__title">{song.name}</h3>
          <p className="song-card__artist">{getArtistName(song)}</p>
        </div>

        {/* Quick Actions */}
        <div className="song-card__quick-actions">
          <button
            className="song-card__action-btn song-card__action-btn--play"
            onClick={handlePlay}
            aria-label={`Play ${song.name}`}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>

          {onAddToQueue && (
            <button
              className="song-card__action-btn song-card__action-btn--queue"
              onClick={handleAddToQueue}
              aria-label={`Add ${song.name} to queue`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Actions Menu */}
      {showActions && (
        <div className="song-card__actions-menu">
          {onEdit && (
            <button
              className="song-card__menu-item"
              onClick={handleEdit}
              aria-label={`Edit ${song.name}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <span>Edit</span>
            </button>
          )}

          {onViewLyrics && (
            <button
              className="song-card__menu-item"
              onClick={handleViewLyrics}
              aria-label={`View lyrics for ${song.name}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 20h9"/>
                <path d="M12 4h9"/>
                <path d="M12 12h9"/>
                <path d="M3 6h.01"/>
                <path d="M3 18h.01"/>
                <path d="M3 12h.01"/>
              </svg>
              <span>Lyrics</span>
            </button>
          )}

          {song.secondary_file_path && onPlaySecondary && (
            <button
              className="song-card__menu-item"
              onClick={handlePlaySecondary}
              aria-label={`Play secondary version of ${song.name}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
              <span>Alt Version</span>
            </button>
          )}

          {onDelete && (
            <button
              className="song-card__menu-item song-card__menu-item--danger"
              onClick={handleDelete}
              aria-label={`Delete ${song.name}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
              <span>Delete</span>
            </button>
          )}
        </div>
      )}

      {/* Progress Indicator for Currently Playing */}
      <div className="song-card__progress" />
    </motion.div>
  );
});

export default SongCard;
