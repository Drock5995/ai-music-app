import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Song } from '../types';

interface SongListProps {
  songs: Song[];
  loading: boolean;
  error: string | null;
  onDataChange: () => void;
  onPlay: (song: Song) => void;
}

export default function SongList({ songs, loading, error, onDataChange, onPlay }: SongListProps) {
  const [editingSongId, setEditingSongId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', artist: '' });

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
    setEditForm({ name: song.name, artist: song.artist });
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
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="inputField" />
                <input type="text" value={editForm.artist} onChange={(e) => setEditForm({ ...editForm, artist: e.target.value })} className="inputField" />
                <button onClick={() => handleUpdate(song.id)} className="button">Save</button>
                <button onClick={() => setEditingSongId(null)} className="button button--secondary">Cancel</button>
              </div>
            ) : (
              <div className="song-details">
                <div className="song-info" onClick={() => onPlay(song)}>
                  <p className="song-name">{song.name}</p>
                  <p className="song-artist">{song.artist}</p>
                </div>
                <div className="song-actions">
                  <button onClick={() => startEditing(song)} className="button--icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button onClick={() => handleDelete(song.id)} className="button--icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
