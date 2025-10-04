import { useState, useRef, useEffect } from 'react';
import { Song } from '../types';
import { supabase } from '../supabaseClient';
import { useQueue } from '../contexts/QueueContext';
import QueueDisplay from './QueueDisplay';

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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
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
  }, [currentSong?.id, currentSong?.file_path]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleCanPlay = () => {
      if (shouldPlay) {
        audio.play().catch(() => {});
        setShouldPlay(false);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const handleMuteToggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.volume > 0) {
      audio.volume = 0;
      setVolume(0);
    } else {
      audio.volume = 1;
      setVolume(1);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleVersion = () => {
    if (!currentSong) return;
    if (isSecondary) {
      setCurrentFilePath(currentSong.file_path);
      setIsSecondary(false);
    } else if (currentSong.secondary_file_path) {
      setCurrentFilePath(currentSong.secondary_file_path);
      setIsSecondary(true);
    }
  };

  if (!currentSong) {
    return null;
  }

  return (
    <div className="player-sticky" role="region" aria-label="Music player">
      <div className="player-album-art" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="player-info">
        <p className="player-song-name" tabIndex={0}>{currentSong.name} {isSecondary ? '(Secondary)' : ''}</p>
        <p className="player-artist-name" tabIndex={0}>{getArtistName()}</p>
        {currentSong.secondary_file_path && (
          <button onClick={toggleVersion} className="button--small" aria-label="Toggle version">
            Switch to {isSecondary ? 'Primary' : 'Secondary'}
          </button>
        )}
      </div>
      <div className="player-controls">
        <button onClick={prevSong} className="button--icon" aria-label="Previous song">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>
        </button>
        <button onClick={togglePlay} className="button--icon player-button" aria-label={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          )}
        </button>
        <button onClick={nextSong} className="button--icon" aria-label="Next song">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
        </button>
        <div className="progress-container">
          <span className="time">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={(currentTime / duration) * 100 || 0}
            onChange={handleSeek}
            className="progress-bar"
            aria-label="Seek slider"
          />
          <span className="time">{formatTime(duration)}</span>
        </div>
        <div className="volume-container">
          <button onClick={handleMuteToggle} className="button--icon" aria-label={volume > 0 ? "Mute" : "Unmute"}>
            {volume > 0 ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
            title="Volume"
            aria-label="Volume control"
          />
        </div>
      </div>
      <QueueDisplay />
      <audio
        ref={audioRef}
        src={currentFilePath ? getSongUrl(currentFilePath) : undefined}
        onEnded={nextSong}
        className="audio-player"
      >
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
