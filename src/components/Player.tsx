import { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useQueue } from '../contexts/QueueContext';
import './Player.css';

const getSongUrl = (filePath: string) => {
  const { data } = supabase.storage.from('song-files').getPublicUrl(filePath);
  return data.publicUrl;
};

export default function Player() {
  const { currentSong, nextSong, prevSong } = useQueue();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [isSecondary, setIsSecondary] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);

  const getArtistName = () => {
    if (!currentSong) return 'Unknown Artist';
    return typeof currentSong.artist === 'string' ? currentSong.artist : (currentSong.artist as any)?.name || 'Unknown Artist';
  };

  useEffect(() => {
    if (currentSong) {
      setCurrentFilePath(currentSong.file_path);
      setIsSecondary(false);
      setShouldPlay(true);
    } else {
      setCurrentFilePath(null);
    }
  }, [currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleCanPlay = () => {
      if (shouldPlay) {
        audio.play().catch(() => {});
        setShouldPlay(false);
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentFilePath, shouldPlay]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  if (!currentSong) {
    return null;
  }

  if (isExpanded) {
    // Full screen player - placeholder for now
    return (
      <div className="expanded-player" onClick={() => setIsExpanded(false)}>
        <h1>{currentSong.name}</h1>
        <p>{getArtistName()}</p>
        <button onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
        <button onClick={prevSong}>Prev</button>
        <button onClick={nextSong}>Next</button>
      </div>
    );
  }

  return (
    <div className="player-container" onClick={() => setIsExpanded(true)}>
      <div className="mini-player">
        <div className="song-info">
          <p className="song-name">{currentSong.name}</p>
          <p className="artist-name">{getArtistName()}</p>
        </div>
        <div className="controls">
          <button onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={currentFilePath ? getSongUrl(currentFilePath) : undefined}
        onEnded={nextSong}
        className="audio-player"
        style={{ display: 'none' }}
      >
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
