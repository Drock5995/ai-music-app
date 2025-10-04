import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Song } from '../types';

interface SongListProps {
  songs: Song[];
  loading: boolean;
  error: string | null;
  onDataChange: () => void;
  onPlay: (song: Song) => void;
  onAddToQueue?: (song: Song) => void;
}

export default function SongList({ songs, loading, error, onDataChange, onPlay }: SongListProps) {
  const [editingSongId, setEditingSongId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', artist: '' });
  const [lyricsSong, setLyricsSong] = useState<Song | null>(null);

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

  if (loading) {
    return <div className="loading-text">Loading songs...</div>;
  }

  if (error) {
    return <div className="error-text">Error: {error}</div>;
  }

  return (
    <div className="song-list-container">
      <ul className="song-list">
        {songs.map((song) => (
          <li key={song.id} className="song-item">
            {editingSongId === song.id ? (
              <div className="edit-form">
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="inputField" aria-label="Song name" />
                <input type="text" value={editForm.artist} onChange={(e) => setEditForm({ ...editForm, artist: e.target.value })} className="inputField" aria-label="Artist name" />
                <button onClick={() => handleUpdate(song.id)} className="button" aria-label="Save song">Save</button>
                <button onClick={() => setEditingSongId(null)} className="button button--secondary" aria-label="Cancel editing">Cancel</button>
                {song.secondary_file_path && (
                  <button onClick={() => handleSwapVersions(song.id)} className="button button--secondary" aria-label="Swap primary and secondary versions">Swap Versions</button>
                )}
              </div>
            ) : (
              <div className="song-details">
                <div className="song-info" onClick={() => onPlay(song)} role="button" tabIndex={0} aria-label={`Play song ${song.name} by ${getArtistName(song)}`}>
                  <p className="song-name">{song.name}</p>
                  <p className="song-artist">{getArtistName(song)}</p>
                </div>
                <div className="song-actions">
                  <button onClick={() => startEditing(song)} className="button--icon" aria-label={`Edit song ${song.name}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button onClick={() => handleDelete(song.id)} className="button--icon" aria-label={`Delete song ${song.name}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                  <button onClick={() => setLyricsSong(song)} className="button--icon" aria-label={`View lyrics for song ${song.name}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M12 4h9"/><path d="M12 12h9"/><path d="M3 6h.01"/><path d="M3 18h.01"/><path d="M3 12h.01"/></svg>
                  </button>
                  {song.secondary_file_path && (
                    <button onClick={() => onPlay({ ...song, file_path: song.secondary_file_path! })} className="button--icon" aria-label={`Play secondary version of ${song.name}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                    </button>
                  )}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

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
