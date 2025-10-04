import { useState, useMemo, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Song } from '../types';
import { SongListSkeleton } from './LoadingSkeleton';
import SongCard from './SongCard';
import VirtualizedList from './VirtualizedList';

interface SongListProps {
  songs: Song[];
  loading: boolean;
  error: string | null;
  onDataChange: () => void;
  onPlay: (song: Song) => void;
  onAddToQueue?: (song: Song) => void;
  layout?: 'list' | 'grid';
  showArtwork?: boolean;
}

export default function SongList({
  songs,
  loading,
  error,
  onDataChange,
  onPlay,
  onAddToQueue,
  layout = 'list',
  showArtwork = true
}: SongListProps) {
  const [editingSongId, setEditingSongId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', artist: '' });
  const [lyricsSong, setLyricsSong] = useState<Song | null>(null);

  // Use virtual scrolling for large lists (>20 items)
  const useVirtualScrolling = songs.length > 20;
  const itemHeight = layout === 'grid' ? 120 : 80; // Approximate heights
  const containerHeight = 400; // Fixed height for virtual scrolling

  const getArtistName = (song: Song) => {
    return typeof song.artist === 'string' ? song.artist : (song.artist as any)?.name || 'Unknown Artist';
  };

  const handleDelete = async (songId: number) => {
    const songToDelete = songs.find(s => s.id === songId);
    if (!songToDelete) return;

    if (window.confirm('Are you sure you want to delete this song?')) {
      const { error: dbError } = await supabase.from('songs').delete().match({ id: songId });
      if (dbError) {
        return alert(`Error deleting song: ${dbError.message}`);
      }
      const { error: storageError } = await supabase.storage.from('song-files').remove([songToDelete.file_path]);
      if (storageError) {
        console.error('Error deleting file from storage:', storageError.message);
      }
      onDataChange();
    }
  };

  const handleUpdate = async (songId: number) => {
    const { error } = await supabase.from('songs').update({ name: editForm.name, artist: editForm.artist }).match({ id: songId });
    if (error) {
      alert(`Error updating song: ${error.message}`);
    } else {
      setEditingSongId(null);
      onDataChange();
    }
  };

  const startEditing = (song: Song) => {
    setEditingSongId(song.id);
    setEditForm({ name: song.name, artist: getArtistName(song) });
  };

  const handleSwapVersions = async (songId: number) => {
    const song = songs.find(s => s.id === songId);
    if (!song || !song.secondary_file_path) return;

    const { error } = await supabase.from('songs').update({
      file_path: song.secondary_file_path,
      secondary_file_path: song.file_path
    }).match({ id: songId });

    if (error) {
      alert(`Error swapping versions: ${error.message}`);
    } else {
      onDataChange();
    }
  };

  // Memoized song card renderer for virtual scrolling
  const renderSongCard = useCallback((song: Song, index: number) => (
    <SongCard
      key={song.id}
      song={song}
      onPlay={onPlay}
      onAddToQueue={onAddToQueue}
      onEdit={startEditing}
      onDelete={handleDelete}
      onViewLyrics={setLyricsSong}
      onPlaySecondary={song.secondary_file_path ? (secondarySong) => onPlay(secondarySong) : undefined}
      layout={layout}
      showArtwork={showArtwork}
    />
  ), [onPlay, onAddToQueue, layout, showArtwork]);

  if (loading) {
    return <SongListSkeleton count={5} layout={layout} />;
  }

  if (error) {
    return <div className="error-text">Error: {error}</div>;
  }

  return (
    <div className="song-list-container">
      {useVirtualScrolling ? (
        <VirtualizedList
          items={songs}
          itemHeight={itemHeight}
          containerHeight={containerHeight}
          renderItem={renderSongCard}
          className={`song-list song-list--${layout} song-list--virtualized`}
        />
      ) : (
        <div className={`song-list song-list--${layout}`}>
          {songs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onPlay={onPlay}
              onAddToQueue={onAddToQueue}
              onEdit={startEditing}
              onDelete={handleDelete}
              onViewLyrics={setLyricsSong}
              onPlaySecondary={song.secondary_file_path ? (secondarySong) => onPlay(secondarySong) : undefined}
              layout={layout}
              showArtwork={showArtwork}
            />
          ))}
        </div>
      )}

      {lyricsSong && (
        <div className="modal-overlay" onClick={() => setLyricsSong(null)} role="dialog" aria-modal="true" aria-labelledby="lyrics-title">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 id="lyrics-title">Lyrics for {lyricsSong.name}</h2>
            <pre className="lyrics-text">{lyricsSong.lyrics || 'No lyrics available.'}</pre>
            <button onClick={() => setLyricsSong(null)} className="button" aria-label="Close lyrics modal">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}