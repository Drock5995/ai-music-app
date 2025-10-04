import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Song } from '../types';

interface QueueContextType {
  queue: Song[];
  currentIndex: number;
  currentSong: Song | null;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  playSong: (song: Song) => void;
  nextSong: () => void;
  prevSong: () => void;
  clearQueue: () => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
};

interface QueueProviderProps {
  children: ReactNode;
}

export const QueueProvider: React.FC<QueueProviderProps> = ({ children }) => {
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const currentSong = currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null;

  const addToQueue = (song: Song) => {
    setQueue(prev => [...prev, song]);
  };

  const removeFromQueue = (index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
    if (index < currentIndex) {
      setCurrentIndex(prev => prev - 1);
    } else if (index === currentIndex) {
      setCurrentIndex(-1);
    }
  };

  const playSong = (song: Song) => {
    const index = queue.findIndex(s => s.id === song.id);
    if (index >= 0) {
      setCurrentIndex(index);
    } else {
      setQueue(prev => [...prev, song]);
      setCurrentIndex(queue.length);
    }
  };

  const nextSong = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevSong = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const clearQueue = () => {
    setQueue([]);
    setCurrentIndex(-1);
  };

  return (
    <QueueContext.Provider value={{
      queue,
      currentIndex,
      currentSong,
      addToQueue,
      removeFromQueue,
      playSong,
      nextSong,
      prevSong,
      clearQueue,
    }}>
      {children}
    </QueueContext.Provider>
  );
};
