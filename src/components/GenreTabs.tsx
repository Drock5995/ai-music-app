import { useState, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Mousewheel, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';

interface GenreTabsProps {
  genres: string[];
  selectedGenre: string | null;
  onGenreSelect: (genre: string) => void;
}

export default function GenreTabs({ genres, selectedGenre, onGenreSelect }: GenreTabsProps) {
  const swiperRef = useRef<any>(null);

  // Scroll to selected genre when it changes
  useEffect(() => {
    if (selectedGenre && swiperRef.current) {
      const index = genres.indexOf(selectedGenre);
      if (index !== -1) {
        swiperRef.current.slideTo(index, 300);
      }
    }
  }, [selectedGenre, genres]);

  // Genre icons mapping
  const getGenreIcon = (genre: string) => {
    const iconMap: Record<string, string> = {
      'Rock': '🎸',
      'Pop': '🎤',
      'Hip Hop': '🎤',
      'Rap': '🎤',
      'Jazz': '🎷',
      'Blues': '🎸',
      'Country': '🤠',
      'Electronic': '🎧',
      'Dance': '💃',
      'Classical': '🎼',
      'Reggae': '🌴',
      'Folk': '🪕',
      'Indie': '🎸',
      'Alternative': '🎸',
      'Metal': '🤘',
      'Punk': '🎸',
      'R&B': '🎤',
      'Soul': '🎤',
      'Funk': '🎷',
      'Disco': '🕺',
      'Techno': '🎧',
      'House': '🏠',
      'Trance': '🌊',
      'Ambient': '🌌',
      'Experimental': '🧪',
    };

    return iconMap[genre] || '🎵';
  };

  return (
    <div className="genre-tabs-container">
      <Swiper
        ref={swiperRef}
        modules={[FreeMode, Mousewheel, Keyboard]}
        spaceBetween={8}
        slidesPerView="auto"
        freeMode={{
          enabled: true,
          sticky: false,
          momentumBounce: false,
        }}
        mousewheel={{
          forceToAxis: true,
          sensitivity: 1,
          releaseOnEdges: true,
        }}
        keyboard={{
          enabled: true,
          onlyInViewport: true,
        }}
        grabCursor={true}
        className="genre-tabs-swiper"
      >
        {genres.map((genre, index) => (
          <SwiperSlide key={genre} className="genre-tab-slide">
            <button
              className={`genre-tab ${selectedGenre === genre ? 'active' : ''}`}
              onClick={() => onGenreSelect(genre)}
              aria-label={`Select ${genre} genre`}
            >
              <span className="genre-icon">{getGenreIcon(genre)}</span>
              <span className="genre-label">{genre}</span>
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
