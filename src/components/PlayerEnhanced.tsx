import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { useQueue } from '../contexts/QueueContext';
import './PlayerEnhanced.css';

const getSongUrl = (filePath: string) => {
  const { data } = supabase.storage.from('song-files').getPublicUrl(filePath);
  return data.publicUrl;
};

export default function PlayerEnhanced() {
  const { currentSong, nextSong, prevSong } = useQueue();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [shouldPlay, setShouldPlay] = useState(false);

  const getArtistName = () => {
    if (!currentSong) return 'Unknown Artist';
    return typeof currentSong.artist === 'string' ? currentSong.artist : (currentSong.artist as any)?.name || 'Unknown Artist';
  };

  useEffect(() => {
    if (currentSong) {
      setCurrentFilePath(currentSong.file_path);
      setProgress(0);
      setShouldPlay(true);
    } else {
      setCurrentFilePath(null);
      setIsPlaying(false);
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
    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
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

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard events when not typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevSong();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextSong();
          break;
        case 'm':
          e.preventDefault();
          setVolume(volume > 0 ? 0 : 1);
          break;
        case 'f':
          e.preventDefault();
          setIsExpanded(!isExpanded);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, isExpanded, togglePlay, prevSong, nextSong]);

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = (parseFloat(e.target.value) / 100) * audio.duration;
    audio.currentTime = newTime;
    setProgress(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  if (!currentSong) {
    return null;
  }

  return (
    <div className={`player-enhanced-container ${isExpanded ? 'expanded' : ''}`}>
      <div className="mini-player" onClick={() => setIsExpanded(true)}>
        <img
          src="/default-artwork.png"
          alt={`${currentSong.name} artwork`}
          className="artwork"
        />
        <div className="song-info">
          <p className="song-name">{currentSong.name}</p>
          <p className="artist-name">{getArtistName()}</p>
        </div>
        <button onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'} className="play-pause-btn">
          {isPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="expanded-player">
          <button className="close-btn" onClick={() => setIsExpanded(false)} aria-label="Close player">×</button>
          <img
            src="/default-artwork.png"
            alt={`${currentSong.name} artwork`}
            className="expanded-artwork"
          />
          <h1>{currentSong.name}</h1>
          <p>{getArtistName()}</p>
          <motion.div
            className="progress-bar-container"
            onClick={(e) => {
              const audio = audioRef.current;
              if (!audio) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const newTime = (x / rect.width) * audio.duration;
              audio.currentTime = newTime;
            }}
          >
            <motion.div
              className="progress-bar"
              style={{ width: `${progress}%` }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </motion.div>
          <div className="controls">
            <button onClick={prevSong} aria-label="Previous song">⏮</button>
            <button onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button onClick={nextSong} aria-label="Next song">⏭</button>
          </div>
          <div className="volume-control">
            <label htmlFor="volume">Volume</label>
            <input
              id="volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              aria-label="Volume control"
            />
          </div>
        </div>
      )}

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
